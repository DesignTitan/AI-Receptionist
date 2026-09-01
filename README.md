# AI Receptionist

A medical clinic booking site where the front desk calls you back. Patients pick a doctor
and a time online; within about a minute an AI voice agent phones them to confirm, and the
recording, transcript, outcome and patient details land in a live staff dashboard and in the
clinic owner's inbox.

Built with Next.js 16 (App Router), React 19, Tailwind CSS v4 and Supabase.

```
Patient books ──▶ POST /api/bookings ──▶ POST /api/webhooks/new-booking
                                              │
                                              ├─▶ email to the clinic owner + patient
                                              └─▶ outbound call via Vapi / Bland / OmniDimension
                                                        │
                                   POST /api/webhooks/voice ◀── provider callback
                                              │
                                              ├─▶ call_logs: recording, transcript, summary
                                              ├─▶ appointments.status: confirmed / rescheduled / …
                                              └─▶ email to the owner with the recording
```

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it — no database, no API keys. With an empty environment the app boots in **demo
mode**: an in-memory store seeded with six doctors and four appointments, a simulated call
that walks through queued → ringing → on-call → confirmed over about fifty seconds, and
emails rendered and logged to the console instead of sent.

- Booking site: <http://localhost:3000>
- Staff dashboard: <http://localhost:3000/admin> — password `demo1234`

Book something and watch the confirmation screen: the call really does progress, the
appointment really does flip to confirmed, and the recording really does show up in the
dashboard. Everything you see in demo mode is the same code path production uses; only the
storage and telephony back ends are swapped.

> If port 3000 is taken, run `PORT=3100 NEXT_PUBLIC_SITE_URL=http://localhost:3100 npm run dev`.
> The booking API calls its own webhook over HTTP, so `NEXT_PUBLIC_SITE_URL` has to match the
> port you are actually serving on.

---

## Connecting the real services

Copy `.env.example` to `.env.local` and fill in only what you need — each service degrades
on its own, so you can wire up Supabase today and telephony next week.

### 1. Supabase

Create a project, then run the two SQL files in the SQL editor, in order:

1. `supabase/schema.sql` — tables, indexes, the double-booking constraint, RLS policies and
   the `updated_at` trigger.
2. `supabase/seed.sql` — the doctor roster (safe to re-run; upserts by slug).

Then set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Tables:** `doctors`, `patients`, `appointments`, `call_logs`, `notification_logs`.

**Security model:** every write goes through server code holding the service role key, so RLS
stays locked down. The only policy granted to `anon` is `select` on active doctors — patient
records, appointments and recordings are never readable from the browser. A partial unique
index on `(doctor_id, starts_at)` stops two patients holding the same slot.

### 2. Voice provider

Pick one and set `VOICE_PROVIDER` to match. Leave it as `demo` to keep the simulator.

| Provider | Env vars | Notes |
| --- | --- | --- |
| **Vapi** | `VAPI_API_KEY`, `VAPI_ASSISTANT_ID`, `VAPI_PHONE_NUMBER_ID` | The assistant's system prompt and first message are overridden per call, so one assistant serves every appointment. |
| **Bland.ai** | `BLAND_API_KEY`, `BLAND_VOICE_ID`, `BLAND_PATHWAY_ID` (optional) | Without a pathway id the generated script is sent as the `task`. |
| **OmniDimension** | `OMNIDIMENSION_API_KEY`, `OMNIDIMENSION_AGENT_ID` | Appointment details are passed as `call_context`. |

Point the provider's webhook at:

```
POST https://your-app.vercel.app/api/webhooks/voice?token=<VOICE_WEBHOOK_SECRET>
```

(or send the same value as an `x-webhook-secret` header). The handler reads Vapi, Bland and
OmniDimension payload shapes and normalises them, so the three envelopes all land in the same
`call_logs` row. If `VOICE_WEBHOOK_SECRET` is unset the endpoint is open — fine for local
work, set it before you deploy.

The prompt the agent follows lives in `buildAgentScript()` in `src/lib/voice.ts`. It covers
the greeting, confirm/reschedule/cancel branches, and the guardrails (no medical advice, no
payment details over the phone, hand clinical questions to a human).

### 3. Email

```bash
RESEND_API_KEY=re_...
EMAIL_FROM="Northlake Front Desk <frontdesk@yourclinic.com>"
CLINIC_OWNER_EMAIL=owner@yourclinic.com
```

Two emails go out per booking: one when it lands (owner, plus the patient if they gave an
address), and one when the call ends — outcome, duration, cost, AI summary, full transcript
and a link to the recording. Without a key the messages are rendered and logged, and recorded
in `notification_logs` with status `logged`.

### 4. Admin access

```bash
ADMIN_PASSWORD=<something real>
ADMIN_SESSION_SECRET=$(openssl rand -hex 32)
```

`/admin` and `/api/admin/*` are gated in `src/proxy.ts` by an HMAC-signed, httpOnly session
cookie that expires after twelve hours. Browsers get redirected to the sign-in page; API
calls get a 401. Leaving these unset keeps the demo password and prints a warning on the
login screen.

---

## Deploying to Vercel

```bash
npx vercel
```

Add the environment variables in the project settings. `NEXT_PUBLIC_SITE_URL` can be left
blank — it falls back to `VERCEL_PROJECT_PRODUCTION_URL`, which is what the booking API uses
to reach its own webhook and what email links point at.

Nothing else is required: there are no build-time database calls, every page that reads data
is `force-dynamic`, and the whole app runs on the Node.js runtime with no extra services.

---

## HTTP API

| Route | Purpose |
| --- | --- |
| `GET /api/availability?doctor=<slug>&date=YYYY-MM-DD` | Bookable slots for one day |
| `GET /api/availability?doctor=<slug>&calendar=1` | Open-slot counts for the next 21 days |
| `POST /api/bookings` | Create an appointment (validates, then fires the new-booking webhook) |
| `POST /api/webhooks/new-booking` | Owner email + outbound call. Accepts `{ appointmentId }` or a Supabase database-webhook payload |
| `POST /api/webhooks/voice` | Provider callbacks: status, recording, transcript, outcome |
| `GET /api/appointments/<id>/status?ref=<reference>` | Public poll behind the live confirmation screen |
| `GET /api/appointments/<id>/ics?ref=<reference>` | Calendar file for the patient |
| `GET /api/admin/appointments` | Dashboard feed (auth required) |
| `PATCH /api/admin/appointments/<id>` | `{ status }` to override, `{ action: "recall" }` to call again |

The booking reference doubles as a capability token: knowing an appointment id is not enough
to read it, which keeps the confirmation URL safe to email.

You can drive the whole flow from an external system — a Supabase database webhook on
`appointments`, Zapier, n8n, a CRM — by posting to `/api/webhooks/new-booking` yourself.

---

## Project structure

```
src/
  app/
    page.tsx                        Landing page + doctor directory
    doctors/[slug]/page.tsx         Doctor profile + booking flow
    booking/[id]/page.tsx           Confirmation + live call tracker
    admin/                          Dashboard, appointment record, sign-in
    api/                            Routes listed above
  components/
    booking-flow.tsx                Date → time → details → review
    call-status-live.tsx            Polls the call through its lifecycle
    admin/dashboard.tsx             Live table, filters, search, stats
  lib/
    db.ts                           One data surface, two back ends
    voice.ts                        Provider dispatch + the agent script
    email.ts                        Resend templates
    time.ts                         Clinic-timezone slot maths
    demo-store.ts                   In-memory fallback
    auth.ts                         Signed admin session
supabase/schema.sql, seed.sql
scripts/generate-demo-audio.mjs     Regenerates the placeholder recording
```

### Scheduling rules

Slots come from each doctor's `working_days`, `start_time`, `end_time` and `slot_minutes`,
minus a lunch hour and anything already booked. Two rules worth knowing:

- **90-minute lead time.** Nothing is bookable sooner than that, so the confirmation call has
  time to land before the visit.
- **Clinic timezone.** All slot maths is anchored to `CLINIC_TIMEZONE`, not the server's
  locale, which on Vercel is UTC. Change the env var and the whole schedule moves with it.

---

## Notes and limitations

- Demo mode's store is per-instance and in-memory: it resets on restart and is not shared
  between serverless instances. Connect Supabase before showing it to anyone real.
- `public/demo/sample-call.wav` is synthesised, not a recording — it exists so the dashboard's
  audio player has something to play. Regenerate it with
  `node scripts/generate-demo-audio.mjs`.
- Doctor photos are Unsplash URLs in the seed data. Swap `photo_url` for real headshots; the
  card falls back to a tinted monogram if an image fails to load.
- This is a demonstration project, not a medical service. Before handling real patient data
  you would need a signed BAA with every vendor in the path (telephony, transcription, email,
  database), audit logging, retention policies, and consent captured before recording — none
  of which is implemented here.
