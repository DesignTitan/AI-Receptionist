import test from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer, CustomerBooking } from "../src/lib/platform/model.ts";
import { available, bookOnline, bookPhone, getCustomerCall, needsConfirmation, normalizeBooking } from "../src/lib/platform/booking.ts";

type Row = Record<string, unknown>;
function fixtureStore(tables: Record<string, Row[]>, rpc?: (name: string, args: Row) => Row) {
  const writes: { name: string; args: Row }[] = [];
  const reads: { table: string; filters: [string, string, unknown][] }[] = [];
  const db = {
    from(table: string) {
      const read = { table, filters: [] as [string, string, unknown][] };
      reads.push(read);
      const rows = () => (tables[table] ?? []).filter(row => read.filters.every(([field, op, value]) =>
        op === "eq" ? row[field] === value : op === "neq" ? row[field] !== value
          : op === "gte" ? String(row[field]) >= String(value) : String(row[field]) < String(value)));
      const query = {
        select() { return query; },
        eq(field: string, value: unknown) { read.filters.push([field, "eq", value]); return query; },
        neq(field: string, value: unknown) { read.filters.push([field, "neq", value]); return query; },
        gte(field: string, value: unknown) { read.filters.push([field, "gte", value]); return query; },
        lt(field: string, value: unknown) { read.filters.push([field, "lt", value]); return query; },
        async maybeSingle() { return { data: rows()[0] ?? null, error: null }; },
        async single() { return { data: rows()[0] ?? null, error: rows().length ? null : { message: "Missing" } }; },
        then(resolve: (value: { data: Row[]; error: null }) => unknown) { return Promise.resolve({ data: rows(), error: null }).then(resolve); },
      };
      return query;
    },
    async rpc(name: string, args: Row) {
      writes.push({ name, args });
      return { data: rpc?.(name, args) ?? { id: "created" }, error: null };
    },
  } as unknown as SupabaseClient;
  return { db, writes, reads };
}
const customer = () => ({
  id: "customer-a", status: "live", billing_status: "active", phone_settings: {},
  config: { timezone: "UTC", days: [0, 1, 2, 3, 4, 5, 6], opens: "09:00", closes: "17:00",
    team: [{ id: "member-1", name: "Taylor", service: "Consultation", minutes: 30 }] },
} as Customer);
const futureDay = () => new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
const input = () => ({ requestKey: "request-one", member: "member-1", fullName: "  Guest Name  ",
  phone: "(212) 555-0100", email: "GUEST@EXAMPLE.TEST", startsAt: `${futureDay()}T10:00:00.000Z` });
const booking = () => ({ id: "booking-one", customer_id: "customer-a", inbound_call_id: "call-one", source: "phone",
  status: "confirmed", call_status: "not_required", provider_id: "member-1", full_name: "Guest Name", phone: "+12125550100",
  email: "guest@example.test", starts_at: input().startsAt, ends_at: `${futureDay()}T10:30:00.000Z`, reference: "reference" });

test("booking inputs are normalized and invalid dates and contact details are refused", () => {
  const normalized = normalizeBooking(input());
  assert.equal(normalized.fullName, "Guest Name");
  assert.equal(normalized.phone, "+12125550100");
  assert.equal(normalized.email, "guest@example.test");
  assert.throws(() => normalizeBooking({ ...input(), startsAt: "nonsense" }));
  assert.throws(() => normalizeBooking({ ...input(), phone: "911" }));
  assert.throws(() => normalizeBooking({ ...input(), member: "" }));
});

test("availability and call retrieval keep every lookup inside the selected customer", async () => {
  const fixture = fixtureStore({ customer_calls: [{ id: "foreign-call", customer_id: "customer-b" }], customer_bookings: [
    { customer_id: "customer-b", provider_id: "member-1", status: "confirmed", starts_at: `${futureDay()}T09:00:00.000Z`, ends_at: `${futureDay()}T10:00:00.000Z` },
    { customer_id: "customer-a", provider_id: "member-1", status: "confirmed", starts_at: `${futureDay()}T10:00:00.000Z`, ends_at: `${futureDay()}T10:30:00.000Z` },
  ] });
  assert.equal(await getCustomerCall("customer-a", "foreign-call", fixture.db), null);
  const result = await available(customer(), "member-1", futureDay(), fixture.db);
  assert.ok(result.slots.some(slot => slot.start.endsWith("T09:00:00.000Z")));
  assert.ok(!result.slots.some(slot => slot.start.endsWith("T10:00:00.000Z")));
  await assert.rejects(available(customer(), "member-2", futureDay(), fixture.db), /team member/);
  await assert.rejects(available(customer(), "member-1", "2026-02-31", fixture.db), /valid date/);
});

test("a repeated phone booking returns its saved result before current roster or availability checks", async () => {
  const fixture = fixtureStore({ customer_calls: [{ id: "call-one", customer_id: "customer-a", booking_id: "booking-one", booking_key: "request-one", status: "completed" }],
    customer_bookings: [booking()] });
  const changed = customer();
  changed.config.team = [];
  assert.equal((await bookPhone(changed, "call-one", input(), fixture.db)).id, "booking-one");
  assert.equal(fixture.writes.length, 0);
  assert.equal(fixture.reads.length, 2);
  await assert.rejects(bookPhone(changed, "call-one", { ...input(), requestKey: "different" }, fixture.db), /different booking/);
  await assert.rejects(bookPhone(changed, "call-one", { ...input(), fullName: "Another guest" }, fixture.db), /different booking/);
});

test("new bookings send only trusted customer scope and derived duration to the atomic reservation", async () => {
  const fixture = fixtureStore({ customer_calls: [{ id: "call-one", customer_id: "customer-a", booking_id: null }] });
  await bookPhone(customer(), "call-one", input(), fixture.db);
  assert.equal(fixture.writes[0].name, "reserve_customer_phone_booking");
  assert.deepEqual(fixture.writes[0].args, { c_id: "customer-a", call_id: "call-one", request_key: "request-one",
    member: "member-1", guest: "Guest Name", telephone: "+12125550100", guest_email: "guest@example.test",
    begins: `${futureDay()}T10:00:00.000Z`, finishes: `${futureDay()}T10:30:00.000Z` });
  await bookOnline(customer(), input(), fixture.db);
  assert.equal(fixture.writes[1].name, "reserve_customer_booking");
  assert.equal(fixture.writes[1].args.c_id, "customer-a");
  assert.ok(!("call_id" in fixture.writes[1].args));
  await assert.rejects(bookPhone(customer(), "foreign-call", input(), fixture.db), /unavailable/);
  assert.equal(fixture.writes.length, 2);
});

test("outbound confirmation defaults on but skips disabled, phone, resolved and dispatched bookings", () => {
  const queued = { status: "pending", call_status: "queued", source: "web" } as CustomerBooking;
  assert.equal(needsConfirmation(queued, {}), true);
  assert.equal(needsConfirmation(queued, undefined), true);
  assert.equal(needsConfirmation(queued, { inboundEnabled: false, confirmationCalls: true }), true);
  assert.equal(needsConfirmation(queued, { confirmationCalls: false }), false);
  assert.equal(needsConfirmation({ ...queued, source: "phone" }, {}), false);
  assert.equal(needsConfirmation({ ...queued, status: "confirmed" }, {}), false);
  assert.equal(needsConfirmation({ ...queued, status: "cancelled" }, {}), false);
  assert.equal(needsConfirmation({ ...queued, call_status: "ringing" }, {}), false);
  assert.equal(needsConfirmation({ ...queued, call_status: "not_required" }, {}), false);
});
