import { env, isSupabaseConfigured } from "./env";
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
  Doctor,
  NotificationLog,
  Patient,
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
export function newReference(): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const byte of bytes) out += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `NL-${out}`;
}

/* ── Doctors ─────────────────────────────────────────────────────────── */

export async function listDoctors(): Promise<Doctor[]> {
  if (!useSupabase()) {
    return demoStore()
      .doctors.filter((d) => d.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  const { data, error } = await serviceClient()
    .from("doctors")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw new Error(`listDoctors: ${error.message}`);
  return (data ?? []) as Doctor[];
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  if (!useSupabase()) {
    return demoStore().doctors.find((d) => d.slug === slug) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("doctors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getDoctorBySlug: ${error.message}`);
  return (data as Doctor) ?? null;
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  if (!useSupabase()) {
    return demoStore().doctors.find((d) => d.id === id) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("doctors")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getDoctorById: ${error.message}`);
  return (data as Doctor) ?? null;
}

/* ── Availability ────────────────────────────────────────────────────── */

/** Slots the doctor is never bookable for, in clinic-local hours. */
const LUNCH_START_MIN = 12 * 60;
const LUNCH_END_MIN = 13 * 60;
/** Bookings must be at least this far out, so the confirmation call has time to land. */
const MIN_LEAD_MINUTES = 90;

async function bookedRanges(doctorId: string, from: Date, to: Date) {
  if (!useSupabase()) {
    return demoStore()
      .appointments.filter(
        (a) =>
          a.doctor_id === doctorId &&
          a.status !== "cancelled" &&
          new Date(a.starts_at) < to &&
          new Date(a.ends_at) > from,
      )
      .map((a) => ({ start: new Date(a.starts_at), end: new Date(a.ends_at) }));
  }
  const { data, error } = await serviceClient()
    .from("appointments")
    .select("starts_at, ends_at")
    .eq("doctor_id", doctorId)
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
  doctor: Doctor,
  dateKey: string,
): Promise<Slot[]> {
  const tz = env.timezone;
  if (!doctor.working_days.includes(dayOfWeek(dateKey))) return [];

  const [year, month, day] = dateKey.split("-").map(Number);
  const open = parseTimeOfDay(doctor.start_time);
  const close = parseTimeOfDay(doctor.end_time);
  const openMin = open.hour * 60 + open.minute;
  const closeMin = close.hour * 60 + close.minute;

  const dayStart = zonedTimeToUtc(year, month, day, 0, 0, tz);
  const dayEnd = zonedTimeToUtc(year, month, day + 1, 0, 0, tz);
  const taken = await bookedRanges(doctor.id, dayStart, dayEnd);
  const earliest = Date.now() + MIN_LEAD_MINUTES * 60_000;

  const slots: Slot[] = [];
  for (let minute = openMin; minute + doctor.slot_minutes <= closeMin; minute += doctor.slot_minutes) {
    const endMinute = minute + doctor.slot_minutes;
    if (minute < LUNCH_END_MIN && endMinute > LUNCH_START_MIN) continue;

    const start = zonedTimeToUtc(
      year,
      month,
      day,
      Math.floor(minute / 60),
      minute % 60,
      tz,
    );
    const end = new Date(start.getTime() + doctor.slot_minutes * 60_000);
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
 * `closed` distinguishes a day the doctor doesn't work from one that is simply
 * fully booked — the picker words those differently.
 */
export async function getAvailabilityCalendar(doctor: Doctor, days = 21) {
  const today = toDateKey(new Date(), env.timezone);
  const out: { date: string; openSlots: number; closed: boolean }[] = [];
  for (let i = 0; i < days; i++) {
    const key = addDaysToKey(today, i);
    const slots = await getAvailability(doctor, key);
    out.push({
      date: key,
      openSlots: slots.filter((s) => s.available).length,
      closed: !doctor.working_days.includes(dayOfWeek(key)),
    });
  }
  return out;
}

/* ── Patients ────────────────────────────────────────────────────────── */

const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, "");

async function upsertPatient(input: {
  full_name: string;
  phone: string;
  email: string | null;
}): Promise<Patient> {
  const phone = normalizePhone(input.phone);
  if (!useSupabase()) {
    const store = demoStore();
    const existing = store.patients.find((p) => normalizePhone(p.phone) === phone);
    if (existing) {
      existing.full_name = input.full_name;
      existing.email = input.email ?? existing.email;
      return existing;
    }
    const patient: Patient = {
      id: uuid(),
      full_name: input.full_name,
      phone: input.phone,
      email: input.email,
      notes: null,
      created_at: nowIso(),
    };
    store.patients.unshift(patient);
    return patient;
  }
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("patients")
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
  if (error) throw new Error(`upsertPatient: ${error.message}`);
  return data as Patient;
}

/* ── Bookings ────────────────────────────────────────────────────────── */

export type BookingInput = {
  doctorId: string;
  startsAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  reason: string | null;
  isNewPatient: boolean;
};

export type BookingResult = {
  appointment: Appointment;
  patient: Patient;
  doctor: Doctor;
  call: CallLog;
};

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const doctor = await getDoctorById(input.doctorId);
  if (!doctor) throw new BookingError("That doctor is no longer accepting bookings.");

  const start = new Date(input.startsAt);
  if (Number.isNaN(start.getTime())) throw new BookingError("Invalid appointment time.");
  const end = new Date(start.getTime() + doctor.slot_minutes * 60_000);

  const dateKey = toDateKey(start, env.timezone);
  const slots = await getAvailability(doctor, dateKey);
  const slot = slots.find((s) => s.start === start.toISOString());
  if (!slot || !slot.available) {
    throw new BookingError("That time was just taken. Please pick another slot.");
  }

  const patient = await upsertPatient({
    full_name: input.fullName,
    phone: input.phone,
    email: input.email,
  });

  const appointmentRow = {
    id: uuid(),
    reference: newReference(),
    doctor_id: doctor.id,
    patient_id: patient.id,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    reason: input.reason,
    status: "pending" as AppointmentStatus,
    is_new_patient: input.isNewPatient,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  const callRow: CallLog = {
    id: uuid(),
    appointment_id: appointmentRow.id,
    patient_id: patient.id,
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
    return { appointment: appointmentRow, patient, doctor, call: callRow };
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
    patient,
    doctor,
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
    doctor: store.doctors.find((d) => d.id === appointment.doctor_id) ?? null,
    patient: store.patients.find((p) => p.id === appointment.patient_id) ?? null,
    call: calls[0] ?? null,
  };
}

const SELECT_DETAIL =
  "*, doctor:doctors(*), patient:patients(*), calls:call_logs(*)";

type JoinedRow = Appointment & {
  doctor: Doctor | null;
  patient: Patient | null;
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
      [r.reference, r.patient?.full_name, r.patient?.phone, r.patient?.email, r.doctor?.name]
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
  patientId: string,
): Promise<CallLog> {
  const row: CallLog = {
    id: uuid(),
    appointment_id: appointmentId,
    patient_id: patientId,
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

const SIM_TRANSCRIPT = (patient: string, doctor: string, when: string) =>
  [
    `Agent: Hello, this is Ava calling from ${env.clinicName}. Am I speaking with ${patient}?`,
    `${patient.split(" ")[0]}: Yes, speaking.`,
    `Agent: Great — I'm calling to confirm the appointment you just booked with Dr. ${doctor}, ${when}. Does that still work for you?`,
    `${patient.split(" ")[0]}: Yes, that works.`,
    "Agent: Perfect. Please arrive ten minutes early with a photo ID and your insurance card. If anything changes, you can reply to the text I'm sending now.",
    `${patient.split(" ")[0]}: Will do, thank you.`,
    "Agent: Thank you, and take care.",
  ].join("\n");

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
      const doctor = appointment ? await getDoctorById(appointment.doctor_id) : null;
      const patient = await getPatient(call.patient_id);
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
        transcript: SIM_TRANSCRIPT(patient?.full_name ?? "there", doctor?.name ?? "your doctor", when),
        summary:
          "Patient confirmed the appointment on the first attempt. Reminded to arrive ten minutes early with photo ID and insurance card. No changes requested.",
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

export async function getPatient(id: string): Promise<Patient | null> {
  if (!useSupabase()) {
    return demoStore().patients.find((p) => p.id === id) ?? null;
  }
  const { data, error } = await serviceClient()
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getPatient: ${error.message}`);
  return (data as Patient) ?? null;
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
