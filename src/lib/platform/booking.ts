import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer, CustomerBooking } from "./model.ts";
import { text, phone, email } from "./model.ts";
import { slotsFor } from "./slots.ts";

export type CustomerInboundCall = {
  id: string;
  customer_id: string;
  provider: string;
  external_call_id: string;
  caller_phone: string | null;
  direction: "inbound";
  status: "received" | "active" | "completed" | "failed" | "transferred" | "voicemail" | "blocked";
  result: string | null;
  booking_id: string | null;
  booking_key: string | null;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  duration_seconds: number | null;
  provider_cost_cents: number | null;
  started_at: string;
  completed_at: string | null;
};
export type BookingInput = {
  member: string;
  fullName: string;
  phone: string;
  email?: string | null;
  startsAt: string;
};
export type PhoneBookingInput = BookingInput & { requestKey: string };

// Resolve server credentials only when using the real store. Tests supply a
// local store; neither credentials nor a live database are needed to run them.
async function store(db?: SupabaseClient) {
  return db ?? (await import("../supabase.ts")).serviceClient();
}

export function normalizeBooking(input: BookingInput) {
  const startsAt = new Date(text(input.startsAt, "appointment time"));
  if (!Number.isFinite(+startsAt)) throw Error("Choose an appointment time.");
  return {
    member: text(input.member, "team member"),
    fullName: text(input.fullName, "full name"),
    phone: phone(input.phone),
    email: input.email ? email(input.email) : null,
    startsAt: startsAt.toISOString(),
  };
}

export async function available(c: Customer, memberId: string, date: string, db?: SupabaseClient) {
  if (c.status !== "live" || c.billing_status !== "active")
    throw Error("This business is not taking bookings right now.");
  const member = c.config.team.find((p) => p.id === memberId);
  if (!member) throw Error("Choose a team member.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error("Choose a valid date.");
  const start = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(+start) || start.toISOString().slice(0, 10) !== date)
    throw Error("Choose a valid date.");
  const { data, error } = await (await store(db))
    .from("customer_bookings")
    .select("starts_at,ends_at")
    .eq("customer_id", c.id)
    .eq("provider_id", memberId)
    .neq("status", "cancelled")
    .gte("starts_at", new Date(+start - 86400000).toISOString())
    .lt("starts_at", new Date(+start + 2 * 86400000).toISOString());
  if (error) throw Error("Availability is temporarily unavailable.");
  return { c, member, slots: slotsFor(c.config, member, date, data ?? []) };
}

export async function getCustomerCall(customerId: string, callId: string, db?: SupabaseClient): Promise<CustomerInboundCall | null> {
  const { data, error } = await (await store(db))
    .from("customer_calls").select("*").eq("id", callId).eq("customer_id", customerId).maybeSingle();
  if (error) throw Error("Call details are temporarily unavailable.");
  return data as CustomerInboundCall | null;
}

function reservation(c: Customer, input: ReturnType<typeof normalizeBooking>) {
  const member = c.config.team.find((p) => p.id === input.member);
  if (!member) throw Error("Choose a team member.");
  return {
    c_id: c.id, member: member.id, guest: input.fullName, telephone: input.phone, guest_email: input.email,
    begins: input.startsAt, finishes: new Date(Date.parse(input.startsAt) + member.minutes * 60000).toISOString(),
  };
}

export function matchesPhoneBooking(booking: CustomerBooking, input: ReturnType<typeof normalizeBooking>) {
  return booking.provider_id === input.member && booking.full_name === input.fullName
    && booking.phone === input.phone && booking.email === input.email
    && Date.parse(booking.starts_at) === Date.parse(input.startsAt);
}

export function needsConfirmation(booking: Pick<CustomerBooking, "status" | "call_status"> & { source?: string }, settings: unknown) {
  const enabled = !settings || typeof settings !== "object"
    || (settings as { confirmationCalls?: unknown }).confirmationCalls !== false;
  return enabled && booking.source !== "phone" && booking.status === "pending" && booking.call_status === "queued";
}

export async function bookOnline(c: Customer, input: BookingInput, db?: SupabaseClient): Promise<CustomerBooking> {
  const { data, error } = await (await store(db)).rpc("reserve_customer_booking", reservation(c, normalizeBooking(input)));
  if (error || !data)
    throw Error("We could not reserve that time. It may be taken or your daily booking limit has been reached.");
  return data as CustomerBooking;
}

export async function bookPhone(c: Customer, callId: string, input: PhoneBookingInput, db?: SupabaseClient): Promise<CustomerBooking> {
  const connection = await store(db);
  const normalized = normalizeBooking(input);
  const requestKey = text(input.requestKey, "booking request", 120);
  const call = await getCustomerCall(c.id, callId, connection);
  if (!call) throw Error("Call booking unavailable.");
  if (call.booking_id) {
    const { data, error } = await connection.from("customer_bookings").select("*")
      .eq("id", call.booking_id).eq("customer_id", c.id).eq("inbound_call_id", call.id).single();
    if (error || !data) throw Error("The existing booking could not be loaded.");
    if (call.booking_key !== requestKey || !matchesPhoneBooking(data as CustomerBooking, normalized))
      throw Error("This call already has a different booking. Staff can help with changes.");
    return data as CustomerBooking;
  }
  // The database validates the current roster/hours and call allowance, then
  // saves under one lock. It also handles two identical tool requests arriving
  // together, before either request has observed the other's booking.
  const { data, error } = await connection.rpc("reserve_customer_phone_booking", {
    ...reservation(c, normalized), call_id: call.id, request_key: requestKey,
  });
  if (error || !data)
    throw Error("That booking could not be completed. Check availability again or ask staff for help.");
  return data as CustomerBooking;
}
