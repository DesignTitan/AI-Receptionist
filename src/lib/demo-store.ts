import { env } from "./env";
import { SEED_PROVIDERS } from "./seed-providers";
import { addDaysToKey, dayOfWeek, parseDateKey, toDateKey, zonedTimeToUtc } from "./time";
import type {
  Appointment,
  CallLog,
  Provider,
  NotificationLog,
  Client,
} from "./types";

/**
 * In-memory backing store used when Supabase credentials are absent.
 *
 * It keeps the whole product explorable — booking, the call lifecycle and the
 * admin dashboard all work — without asking anyone to provision a database
 * first. State lives on `globalThis` so it survives dev hot reloads, and it is
 * per-instance and ephemeral, which is exactly why it is a demo mode.
 */
export type DemoStore = {
  providers: Provider[];
  clients: Client[];
  appointments: Appointment[];
  calls: CallLog[];
  notifications: NotificationLog[];
};

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const iso = (ms: number) => new Date(ms).toISOString();

/**
 * Places a seeded appointment on the next day the doctor actually works, at a
 * time inside their clinic hours — so the demo dashboard never shows a
 * cardiologist booked for 7pm on a Saturday.
 */
function slotFor(provider: Provider, minDaysAhead: number, hour: number, minute = 0) {
  let key = addDaysToKey(toDateKey(new Date(), env.timezone), minDaysAhead);
  for (let i = 0; i < 7 && !provider.working_days.includes(dayOfWeek(key)); i++) {
    key = addDaysToKey(key, 1);
  }
  const { year, month, day } = parseDateKey(key);
  const start = zonedTimeToUtc(year, month, day, hour, minute, env.timezone);
  const end = new Date(start.getTime() + provider.slot_minutes * 60_000);
  return { starts_at: start.toISOString(), ends_at: end.toISOString() };
}

function buildSeed(): DemoStore {
  const now = Date.now();
  const clients: Client[] = [
    {
      id: "22222222-2222-4222-8222-222222222201",
      full_name: "Maya Thompson",
      phone: "+1 415 555 0142",
      email: "maya.thompson@example.com",
      notes: null,
      created_at: iso(now - 6 * DAY),
    },
    {
      id: "22222222-2222-4222-8222-222222222202",
      full_name: "Gerald Whitmore",
      phone: "+1 415 555 0188",
      email: "g.whitmore@example.com",
      notes: null,
      created_at: iso(now - 3 * DAY),
    },
    {
      id: "22222222-2222-4222-8222-222222222203",
      full_name: "Priya Raman",
      phone: "+1 415 555 0119",
      email: "priya.raman@example.com",
      notes: null,
      created_at: iso(now - 2 * DAY),
    },
    {
      id: "22222222-2222-4222-8222-222222222204",
      full_name: "Tobias Lang",
      phone: "+1 415 555 0177",
      email: null,
      notes: null,
      created_at: iso(now - 1 * DAY),
    },
  ];

  const appointments: Appointment[] = [
    {
      id: "33333333-3333-4333-8333-333333333301",
      reference: "NL-7QK4M2",
      provider_id: SEED_PROVIDERS[0].id,
      client_id: clients[0].id,
      ...slotFor(SEED_PROVIDERS[0], 2, 10, 30),
      reason: "Annual physical and a follow-up on iron levels.",
      status: "confirmed",
      is_new_client: false,
      created_at: iso(now - 6 * DAY),
      updated_at: iso(now - 6 * DAY + 90_000),
    },
    {
      id: "33333333-3333-4333-8333-333333333302",
      reference: "NL-3JD8P1",
      provider_id: SEED_PROVIDERS[1].id,
      client_id: clients[1].id,
      ...slotFor(SEED_PROVIDERS[1], 4, 9, 30),
      reason: "Chest tightness when climbing stairs. Referred by Dr. Vasquez.",
      status: "confirmed",
      is_new_client: true,
      created_at: iso(now - 3 * DAY),
      updated_at: iso(now - 3 * DAY + 120_000),
    },
    {
      id: "33333333-3333-4333-8333-333333333303",
      reference: "NL-9WX2R7",
      provider_id: SEED_PROVIDERS[3].id,
      client_id: clients[2].id,
      ...slotFor(SEED_PROVIDERS[3], 1, 9, 10),
      reason: "Six-year-old with a persistent night cough.",
      status: "rescheduled",
      is_new_client: false,
      created_at: iso(now - 2 * DAY),
      updated_at: iso(now - 2 * DAY + 200_000),
    },
    {
      id: "33333333-3333-4333-8333-333333333304",
      reference: "NL-5BT6H3",
      provider_id: SEED_PROVIDERS[2].id,
      client_id: clients[3].id,
      ...slotFor(SEED_PROVIDERS[2], 3, 8, 0),
      reason: "Right knee pain after a half marathon.",
      // Matches its call log: the assistant rang and nobody picked up.
      status: "no_answer",
      is_new_client: true,
      created_at: iso(now - 1 * DAY),
      updated_at: iso(now - 1 * DAY),
    },
  ];

  const calls: CallLog[] = [
    {
      id: "44444444-4444-4444-8444-444444444401",
      appointment_id: appointments[0].id,
      client_id: clients[0].id,
      provider: "demo",
      provider_call_id: "demo_call_7QK4M2",
      direction: "outbound",
      status: "completed",
      outcome: "confirmed",
      recording_url: "/audio/sample-call.wav",
      transcript: [
        "Agent: Hi, this is Ava calling from Northlake Family Health. Am I speaking with Maya Thompson?",
        "Maya: Yes, that's me.",
        "Agent: Wonderful. I'm calling to confirm your annual physical with Dr. Elena Vasquez. Does that time still work for you?",
        "Maya: It does, yes.",
        "Agent: Perfect, you're confirmed. Please arrive about ten minutes early, and bring a list of any medications you're currently taking. Anything else I can help with?",
        "Maya: No, that's everything. Thank you.",
        "Agent: Have a lovely day, Maya.",
      ].join("\n"),
      summary:
        "Client confirmed the appointment. No changes requested. Reminded to arrive 10 minutes early with a medication list.",
      duration_seconds: 47,
      cost: 0.11,
      error: null,
      started_at: iso(now - 6 * DAY + 30_000),
      ended_at: iso(now - 6 * DAY + 77_000),
      created_at: iso(now - 6 * DAY + 5_000),
    },
    {
      id: "44444444-4444-4444-8444-444444444402",
      appointment_id: appointments[1].id,
      client_id: clients[1].id,
      provider: "demo",
      provider_call_id: "demo_call_3JD8P1",
      direction: "outbound",
      status: "completed",
      outcome: "confirmed",
      recording_url: "/audio/sample-call.wav",
      transcript: [
        "Agent: Good afternoon, this is Ava from Northlake Family Health calling for Gerald Whitmore.",
        "Gerald: Speaking.",
        "Agent: I'm confirming your cardiology consultation with Dr. Rahul Menon. I also see this is your first visit with us — is that right?",
        "Gerald: First time, yes.",
        "Agent: Then I'll text you a new-patient form. Please fast for four hours beforehand in case we run bloodwork. Shall I keep the appointment as scheduled?",
        "Gerald: Yes, keep it.",
        "Agent: You're all set. Thank you, Gerald.",
      ].join("\n"),
      summary:
        "Confirmed. New patient — intake form to be texted. Advised 4-hour fast in case of same-day bloodwork.",
      duration_seconds: 63,
      cost: 0.15,
      error: null,
      started_at: iso(now - 3 * DAY + 40_000),
      ended_at: iso(now - 3 * DAY + 103_000),
      created_at: iso(now - 3 * DAY + 6_000),
    },
    {
      id: "44444444-4444-4444-8444-444444444403",
      appointment_id: appointments[2].id,
      client_id: clients[2].id,
      provider: "demo",
      provider_call_id: "demo_call_9WX2R7",
      direction: "outbound",
      status: "completed",
      outcome: "rescheduled",
      recording_url: "/audio/sample-call.wav",
      transcript: [
        "Agent: Hello, this is Ava at Northlake Family Health, calling for Priya Raman.",
        "Priya: Hi — yes, but I've just realised I can't make that morning.",
        "Agent: Not a problem at all. Dr. Haddad has openings the same afternoon or the following morning. Would either suit?",
        "Priya: The following morning is better.",
        "Agent: I've noted that and the front desk will send a new time to confirm within the hour.",
        "Priya: Perfect, thank you.",
      ].join("\n"),
      summary:
        "Client cannot attend the booked slot. Requested the following morning. Flagged for front-desk rebooking.",
      duration_seconds: 52,
      cost: 0.12,
      error: null,
      started_at: iso(now - 2 * DAY + 35_000),
      ended_at: iso(now - 2 * DAY + 87_000),
      created_at: iso(now - 2 * DAY + 4_000),
    },
    {
      id: "44444444-4444-4444-8444-444444444404",
      appointment_id: appointments[3].id,
      client_id: clients[3].id,
      provider: "demo",
      provider_call_id: "demo_call_5BT6H3",
      direction: "outbound",
      status: "completed",
      outcome: "no_answer",
      recording_url: null,
      transcript: null,
      summary: "No answer after four rings. Voicemail was not available. Retry queued.",
      duration_seconds: 21,
      cost: 0.03,
      error: null,
      started_at: iso(now - 1 * DAY + 30_000),
      ended_at: iso(now - 1 * DAY + 51_000),
      created_at: iso(now - 1 * DAY + 3_000),
    },
  ];

  return {
    providers: SEED_PROVIDERS.map((d) => ({ ...d })),
    clients,
    appointments,
    calls,
    notifications: [],
  };
}

const globalRef = globalThis as unknown as { __aiReceptionistStore?: DemoStore };

export function demoStore(): DemoStore {
  if (!globalRef.__aiReceptionistStore) {
    globalRef.__aiReceptionistStore = buildSeed();
  }
  return globalRef.__aiReceptionistStore;
}
