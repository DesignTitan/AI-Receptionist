import { env, isSupabaseConfigured } from "./env";
import { providerLabel } from "./format";
import { getVertical } from "@/verticals";
import { demoStore } from "./demo-store";
import { serviceClient } from "./supabase";
import {
  addDaysToKey,
  dayOfWeek,
  formatTime,
  parseTimeOfDay,
  toDateKey,
  zonedTimeToUtc,
} from "./time";
import type {
  Appointment,
  AppointmentDetail,
  AppointmentStatus,
  CallLog,
  CallOutcome,
  CallStatus,
  Provider,
  NotificationLog,
  Client,
  Slot,
} from "./types";

/**
 * Single data-access surface for the app.
 *
 * Each function has two implementations: Supabase when credentials exist, and
 * the in-memory demo store otherwise. Callers never branch on which is active.
 */

const useSupabase = () => isSupabaseConfigured();
const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newReference(prefix: string): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const byte of bytes) out += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `${prefix}-${out}`;
}

/* ── Providers ─────────────────────────────────────────────────────────── */

export async function listProviders(): Promise<Provider[]> {
  if (!useSupabase()) {
    return demoStore()
      .providers.filter((d) => d.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  const { data, error } = await serviceClient()
    .from("providers")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(`listProviders: ${error.message}`);
  return (data ?? []) as Provider[];
}

export async function getProviderBySlug(slug: string): Promise<Provider | null> {
  if (!useSupabase()) {
    return demoStore().providers.find((d) => d.slug === slug) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("providers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getProviderBySlug: ${error.message}`);
  return (data as Provider) ?? null;
}

export async function getProviderById(id: string): Promise<Provider | null> {
  if (!useSupabase()) {
    return demoStore().providers.find((d) => d.id === id) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("providers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getProviderById: ${error.message}`);
  return (data as Provider) ?? null;
}

/* ── Availability ────────────────────────────────────────────────────── */

/** Slots no provider is bookable for, in business-local hours. */
const LUNCH_START_MIN = 12 * 60;
const LUNCH_END_MIN = 13 * 60;
/** Bookings must be at least this far out, so the confirmation call has time to land. */
const MIN_LEAD_MINUTES = 90;

async function bookedRanges(providerId: string, from: Date, to: Date) {
  if (!useSupabase()) {
    return demoStore()
      .appointments.filter(
        (a) =>
          a.provider_id === providerId &&
          a.status !== "cancelled" &&
          new Date(a.starts_at) < to &&
          new Date(a.ends_at) > from,
      )
      .map((a) => ({ start: new Date(a.starts_at), end: new Date(a.ends_at) }));
  }
  const { data, error } = await serviceClient()
    .from("appointments")
    .select("starts_at, ends_at")
    .eq("provider_id", providerId)
    .neq("status", "cancelled")
    .lt("starts_at", to.toISOString())
    .gt("ends_at", from.toISOString());
  if (error) throw new Error(`bookedRanges: ${error.message}`);
  return (data ?? []).map((row) => ({
    start: new Date(row.starts_at as string),
    end: new Date(row.ends_at as string),
  }));
}

export async function getAvailability(
  provider: Provider,
  dateKey: string,
): Promise<Slot[]> {
  const tz = env.timezone;
  if (!provider.working_days.includes(dayOfWeek(dateKey))) return [];

  const [year, month, day] = dateKey.split("-").map(Number);
  const open = parseTimeOfDay(provider.start_time);
  const close = parseTimeOfDay(provider.end_time);
  const openMin = open.hour * 60 + open.minute;
  const closeMin = close.hour * 60 + close.minute;

  const dayStart = zonedTimeToUtc(year, month, day, 0, 0, tz);
  const dayEnd = zonedTimeToUtc(year, month, day + 1, 0, 0, tz);
  const taken = await bookedRanges(provider.id, dayStart, dayEnd);
  const earliest = Date.now() + MIN_LEAD_MINUTES * 60_000;

  const slots: Slot[] = [];
  for (let minute = openMin; minute + provider.slot_minutes <= closeMin; minute += provider.slot_minutes) {
    const endMinute = minute + provider.slot_minutes;
    if (minute < LUNCH_END_MIN && endMinute > LUNCH_START_MIN) continue;

    const start = zonedTimeToUtc(
      year,
      month,
      day,
      Math.floor(minute / 60),
      minute % 60,
      tz,
    );
    const end = new Date(start.getTime() + provider.slot_minutes * 60_000);
    const clashes = taken.some((range) => start < range.end && end > range.start);
    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      label: formatTime(start, tz),
      available: !clashes && start.getTime() >= earliest,
    });
  }
  return slots;
}

/**
 * Availability summary for the next `days` days, used by the date picker.
 * `closed` distinguishes a day the provider doesn't work from one that is simply
 * fully booked — the picker words those differently.
 */
export async function getAvailabilityCalendar(provider: Provider, days = 21) {
  const today = toDateKey(new Date(), env.timezone);
  const out: { date: string; openSlots: number; closed: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const key = addDaysToKey(today, i);
    const slots = await getAvailability(provider, key);
    out.push({
      date: key,
      openSlots: slots.filter((s) => s.available).length,
      closed: !provider.working_days.includes(dayOfWeek(key)),
    });
  }
  return out;
}

/* ── Patients ────────────────────────────────────────────────────────── */

const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, "");

async function upsertClient(input: {
  full_name: string;
  phone: string;
  email: string | null;
}): Promise<Client> {
  const phone = normalizePhone(input.phone);
  if (!useSupabase()) {
    const store = demoStore();
    const existing = store.clients.find((p) => normalizePhone(p.phone) === phone);
    if (existing) {
      existing.full_name = input.full_name;
      existing.email = input.email ?? existing.email;
      return existing;
    }
    const client: Client = {
      id: uuid(),
      full_name: input.full_name,
      phone: input.phone,
      email: input.email,
      notes: null,
      created_at: nowIso(),
    };
    store.clients.unshift(client);
    return client;
  }
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("clients")
    .upsert(
      {
        full_name: input.full_name,
        phone,
        email: input.email,
      },
      { onConflict: "phone" },
    )
    .select("*")
    .single();
  if (error) throw new Error(`upsertClient: ${error.message}`);
  return data as Client;
}

/* ── Bookings ────────────────────────────────────────────────────────── */

export type BookingInput = {
  providerId: string;
  startsAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  reason: string | null;
  isNewClient: boolean;
};

export type BookingResult = {
  appointment: Appointment;
  client: Client;
  provider: Provider;
  call: CallLog;
};

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const provider = await getProviderById(input.providerId);
  if (!provider) throw new BookingError("That provider is no longer accepting bookings.");
  const vertical = getVertical(provider.vertical);

  const start = new Date(input.startsAt);
  if (Number.isNaN(start.getTime())) throw new BookingError("Invalid appointment time.");
  const end = new Date(start.getTime() + provider.slot_minutes * 60_000);

  const dateKey = toDateKey(start, env.timezone);
  const slots = await getAvailability(provider, dateKey);
  const slot = slots.find((s) => s.start === start.toISOString());
  if (!slot || !slot.available) {
    throw new BookingError("That time was just taken. Please pick another slot.");
  }

  const client = await upsertClient({
    full_name: input.fullName,
    phone: input.phone,
    email: input.email,
  });

  const appointmentRow = {
    id: uuid(),
    vertical: provider.vertical,
    reference: newReference(vertical.referencePrefix),
    provider_id: provider.id,
    client_id: client.id,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    reason: input.reason,
    status: "pending" as AppointmentStatus,
    is_new_client: input.isNewClient,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  const callRow: CallLog = {
    id: uuid(),
    appointment_id: appointmentRow.id,
    client_id: client.id,
    provider: env.voiceProvider,
    provider_call_id: null,
    direction: "outbound",
    status: "queued",
    outcome: null,
    recording_url: null,
    transcript: null,
    summary: null,
    duration_seconds: null,
    cost: null,
    error: null,
    started_at: null,
    ended_at: null,
    created_at: nowIso(),
  };

  if (!useSupabase()) {
    const store = demoStore();
    store.appointments.unshift(appointmentRow);
    store.calls.unshift(callRow);
    return { appointment: appointmentRow, client, provider, call: callRow };
  }

  const supabase = serviceClient();
  const { data: appointment, error: apptError } = await supabase
    .from("appointments")
    .insert(appointmentRow)
    .select("*")
    .single();
  if (apptError) throw new Error(`createBooking: ${apptError.message}`);

  const { data: call, error: callError } = await supabase
    .from("call_logs")
    .insert(callRow)
    .select("*")
    .single();
  if (callError) throw new Error(`createBooking(call): ${callError.message}`);

  return {
    appointment: appointment as Appointment,
    client,
    provider,
    call: call as CallLog,
  };
}

export class BookingError extends Error {}

/* ── Appointment reads ───────────────────────────────────────────────── */

function hydrateDemoAppointment(appointment: Appointment): AppointmentDetail {
  const store = demoStore();
  const calls = store.calls
    .filter((c) => c.appointment_id === appointment.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    ...appointment,
    provider: store.providers.find((d) => d.id === appointment.provider_id) ?? null,
    client: store.clients.find((p) => p.id === appointment.client_id) ?? null,
    call: calls[0] ?? null,
  };
}

const SELECT_DETAIL =
  "*, provider:providers(*), client:clients(*), calls:call_logs(*)";

type JoinedRow = Appointment & {
  provider: Provider | null;
  client: Client | null;
  calls: CallLog[] | null;
};

function hydrateJoined(row: JoinedRow): AppointmentDetail {
  const calls = (row.calls ?? [])
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { calls: _drop, ...rest } = row;
  return { ...rest, call: calls[0] ?? null };
}

export async function getAppointment(id: string): Promise<AppointmentDetail | null> {
  await advanceSimulatedCalls();
  if (!useSupabase()) {
    const appointment = demoStore().appointments.find((a) => a.id === id);
    return appointment ? hydrateDemoAppointment(appointment) : null;
  }
  const { data, error } = await serviceClient()
    .from("appointments")
    .select(SELECT_DETAIL)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getAppointment: ${error.message}`);
  return data ? hydrateJoined(data as unknown as JoinedRow) : null;
}

export type AppointmentFilter = {
  status?: AppointmentStatus | "all";
  search?: string;
  limit?: number;
};

export async function listAppointments(
  filter: AppointmentFilter = {},
): Promise<AppointmentDetail[]> {
  await advanceSimulatedCalls();
  const limit = filter.limit ?? 100;

  let rows: AppointmentDetail[];
  if (!useSupabase()) {
    rows = demoStore()
      .appointments.slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(hydrateDemoAppointment);
  } else {
    let query = serviceClient()
      .from("appointments")
      .select(SELECT_DETAIL)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (filter.status && filter.status !== "all") query = query.eq("status", filter.status);
    const { data, error } = await query;
    if (error) throw new Error(`listAppointments: ${error.message}`);
    rows = (data ?? []).map((row) => hydrateJoined(row as unknown as JoinedRow));
  }

  if (filter.status && filter.status !== "all") {
    rows = rows.filter((r) => r.status === filter.status);
  }
  const search = filter.search?.trim().toLowerCase();
  if (search) {
    rows = rows.filter((r) =>
      [r.reference, r.client?.full_name, r.client?.phone, r.client?.email, r.provider?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search)),
    );
  }
  return rows.slice(0, limit);
}

export type DashboardStats = {
  total: number;
  confirmed: number;
  awaiting: number;
  needsAttention: number;
  confirmationRate: number;
  callsCompleted: number;
  avgCallSeconds: number;
  upcoming7Days: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await listAppointments({ limit: 500 });
  const now = Date.now();
  const week = now + 7 * 86_400_000;
  const completedCalls = rows.filter((r) => r.call?.status === "completed");
  const durations = completedCalls
    .map((r) => r.call?.duration_seconds ?? 0)
    .filter((d) => d > 0);
  const confirmed = rows.filter((r) => r.status === "confirmed").length;
  const reached = rows.filter((r) => r.status === "confirmed" || r.status === "rescheduled")
    .length;

  return {
    total: rows.length,
    confirmed,
    awaiting: rows.filter((r) => r.status === "pending").length,
    needsAttention: rows.filter(
      (r) => r.status === "no_answer" || r.status === "rescheduled" || r.call?.status === "failed",
    ).length,
    confirmationRate: rows.length ? Math.round((reached / rows.length) * 100) : 0,
    callsCompleted: completedCalls.length,
    avgCallSeconds: durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0,
    upcoming7Days: rows.filter((r) => {
      const t = new Date(r.starts_at).getTime();
      return t >= now && t <= week && r.status !== "cancelled";
    }).length,
  };
}

/* ── Mutations ───────────────────────────────────────────────────────── */

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment | null> {
  if (!useSupabase()) {
    const appointment = demoStore().appointments.find((a) => a.id === id);
    if (!appointment) return null;
    appointment.status = status;
    appointment.updated_at = nowIso();
    return appointment;
  }
  const { data, error } = await serviceClient()
    .from("appointments")
    .update({ status, updated_at: nowIso() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`updateAppointmentStatus: ${error.message}`);
  return (data as Appointment) ?? null;
}

export async function getLatestCallForAppointment(
  appointmentId: string,
): Promise<CallLog | null> {
  if (!useSupabase()) {
    return (
      demoStore()
        .calls.filter((c) => c.appointment_id === appointmentId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
    );
  }
  const { data, error } = await serviceClient()
    .from("call_logs")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(`getLatestCallForAppointment: ${error.message}`);
  return ((data ?? [])[0] as CallLog) ?? null;
}

export async function createCall(
  appointmentId: string,
  clientId: string,
): Promise<CallLog> {
  const row: CallLog = {
    id: uuid(),
    appointment_id: appointmentId,
    client_id: clientId,
    provider: env.voiceProvider,
    provider_call_id: null,
    direction: "outbound",
    status: "queued",
    outcome: null,
    recording_url: null,
    transcript: null,
    summary: null,
    duration_seconds: null,
    cost: null,
    error: null,
    started_at: null,
    ended_at: null,
    created_at: nowIso(),
  };
  if (!useSupabase()) {
    demoStore().calls.unshift(row);
    return row;
  }
  const { data, error } = await serviceClient()
    .from("call_logs")
    .insert(row)
    .select("*")
    .single();
  if (error) throw new Error(`createCall: ${error.message}`);
  return data as CallLog;
}

export async function updateCall(
  id: string,
  patch: Partial<CallLog>,
): Promise<CallLog | null> {
  if (!useSupabase()) {
    const call = demoStore().calls.find((c) => c.id === id);
    if (!call) return null;
    Object.assign(call, patch);
    return call;
  }
  const { data, error } = await serviceClient()
    .from("call_logs")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`updateCall: ${error.message}`);
  return (data as CallLog) ?? null;
}

export async function findCallByProviderId(
  providerCallId: string,
): Promise<CallLog | null> {
  if (!useSupabase()) {
    return demoStore().calls.find((c) => c.provider_call_id === providerCallId) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("call_logs")
    .select("*")
    .eq("provider_call_id", providerCallId)
    .maybeSingle();
  if (error) throw new Error(`findCallByProviderId: ${error.message}`);
  return (data as CallLog) ?? null;
}

export async function getCall(id: string): Promise<CallLog | null> {
  if (!useSupabase()) {
    return demoStore().calls.find((c) => c.id === id) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("call_logs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getCall: ${error.message}`);
  return (data as CallLog) ?? null;
}

export async function logNotification(
  entry: Omit<NotificationLog, "id" | "created_at">,
): Promise<void> {
  const row: NotificationLog = { ...entry, id: uuid(), created_at: nowIso() };
  if (!useSupabase()) {
    demoStore().notifications.unshift(row);
    return;
  }
  const { error } = await serviceClient().from("notification_logs").insert(row);
  if (error) console.error(`logNotification: ${error.message}`);
}

/* ── Simulated call lifecycle (demo provider) ────────────────────────── */

/** Where a simulated call should be, given how long ago it was created. */
const SIM_RINGING_AT = 6_000;
const SIM_IN_PROGRESS_AT = 18_000;
const SIM_COMPLETED_AT = 52_000;

const SIM_TRANSCRIPT = (
  vertical: ReturnType<typeof getVertical>,
  client: string,
  provider: string,
  when: string,
) => {
  const { agentName, arrivalAdvice } = vertical.voice;
  const first = client.split(" ")[0];
  return [
    `Agent: Hello, this is ${agentName} calling from ${vertical.brand}. Am I speaking with ${client}?`,
    `${first}: Yes, speaking.`,
    `Agent: Great — I'm calling to confirm the ${vertical.terms.booking.one} you just booked with ${provider}, ${when}. Does that still work for you?`,
    `${first}: Yes, that works.`,
    `Agent: Perfect. Please ${arrivalAdvice}. If anything changes, you can reply to the text I'm sending now.`,
    `${first}: Will do, thank you.`,
    "Agent: Thank you, and take care.",
  ].join("\n");
};

/**
 * Moves any in-flight simulated calls forward.
 *
 * The demo provider has no server to call back into this app, so instead of
 * holding timers open in a serverless function the progression is derived from
 * elapsed time and persisted whenever the data is read.
 */
export async function advanceSimulatedCalls(): Promise<void> {
  const pending = await listPendingSimulatedCalls();
  if (pending.length === 0) return;

  const now = Date.now();
  for (const call of pending) {
    const age = now - new Date(call.created_at).getTime();
    let next: Partial<CallLog> | null = null;

    if (age >= SIM_COMPLETED_AT && call.status !== "completed") {
      const appointment = await getAppointmentRaw(call.appointment_id);
      const provider = appointment ? await getProviderById(appointment.provider_id) : null;
      const client = await getClient(call.client_id);
      const vertical = getVertical(appointment?.vertical ?? provider?.vertical ?? "medical");
      const { terms, voice } = vertical;
      const when = appointment
        ? new Date(appointment.starts_at).toLocaleString("en-US", {
            timeZone: env.timezone,
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "your upcoming visit";
      next = {
        status: "completed",
        outcome: "confirmed",
        recording_url: "/audio/sample-call.wav",
        duration_seconds: 46,
        cost: 0.11,
        started_at: new Date(new Date(call.created_at).getTime() + SIM_RINGING_AT).toISOString(),
        ended_at: new Date(new Date(call.created_at).getTime() + SIM_COMPLETED_AT).toISOString(),
        transcript: SIM_TRANSCRIPT(
          vertical,
          client?.full_name ?? "there",
          provider ? providerLabel(provider) : `your ${terms.provider.one}`,
          when,
        ),
        summary: `${terms.client.One} confirmed the ${terms.booking.one} on the first attempt. Reminded to ${voice.arrivalAdvice}. No changes requested.`,
      };
    } else if (age >= SIM_IN_PROGRESS_AT && call.status !== "in_progress") {
      next = {
        status: "in_progress",
        started_at:
          call.started_at ??
          new Date(new Date(call.created_at).getTime() + SIM_RINGING_AT).toISOString(),
      };
    } else if (age >= SIM_RINGING_AT && call.status === "queued") {
      next = { status: "ringing" };
    }

    if (!next) continue;
    await updateCall(call.id, next);
    if (next.status === "completed") {
      await updateAppointmentStatus(call.appointment_id, "confirmed");
      void notifyCallCompleted(call.id);
    }
  }
}

async function listPendingSimulatedCalls(): Promise<CallLog[]> {
  if (!useSupabase()) {
    return demoStore().calls.filter(
      (c) => c.provider === "demo" && c.status !== "completed" && c.status !== "failed",
    );
  }
  const { data, error } = await serviceClient()
    .from("call_logs")
    .select("*")
    .eq("provider", "demo")
    .in("status", ["queued", "ringing", "in_progress"])
    .limit(25);
  if (error) {
    console.error(`listPendingSimulatedCalls: ${error.message}`);
    return [];
  }
  return (data ?? []) as CallLog[];
}

async function getAppointmentRaw(id: string): Promise<Appointment | null> {
  if (!useSupabase()) {
    return demoStore().appointments.find((a) => a.id === id) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getAppointmentRaw: ${error.message}`);
  return (data as Appointment) ?? null;
}

export async function getClient(id: string): Promise<Client | null> {
  if (!useSupabase()) {
    return demoStore().clients.find((p) => p.id === id) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getClient: ${error.message}`);
  return (data as Client) ?? null;
}

/** Imported lazily to avoid a cycle between the data layer and the mailer. */
async function notifyCallCompleted(callId: string) {
  try {
    const { sendCallCompletedEmail } = await import("./email");
    await sendCallCompletedEmail(callId);
  } catch (error) {
    console.error("[notify] call-completed email failed", error);
  }
}

export type { AppointmentStatus, CallStatus, CallOutcome };
