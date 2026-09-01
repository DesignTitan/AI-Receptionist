# NOW

Handoff notes for the next session. Updated 2026-09-01.

## Just done

- Built the whole app from scratch: Next.js 16 + React 19 + Tailwind v4, booking site,
  admin dashboard, voice-agent dispatch, webhooks, email. Production build is clean.
- Data layer (`src/lib/db.ts`) runs on Supabase when keys are present and an in-memory demo
  store otherwise, so the app is fully explorable with an empty `.env`.
- Verified end to end in a browser: booking → new-booking webhook → owner + patient emails →
  simulated call (queued → ringing → on-call → confirmed) → appointment confirmed → live
  update on the patient's confirmation page → record in the dashboard with recording,
  transcript and AI summary.
- Verified `/api/webhooks/voice` against Vapi-shaped and Bland-shaped payloads; both
  normalise correctly (duration, cost, transcript array vs string, outcome inference).
- Fixed during QA: mobile horizontal overflow from implicit `max-content` grid tracks,
  "Closed" vs "Full" wording in the date picker, call badges coloured by outcome rather than
  by status, seeded demo appointments landing outside clinic hours, header wrapping at 390px.

## In progress

Nothing half-finished. The repo is committed and builds clean.

## Next

- Point it at a real Supabase project: run `supabase/schema.sql` then `supabase/seed.sql`,
  set the three keys, confirm the double-booking index behaves under a race.
- Wire one real voice provider (Vapi is the least work) and set `VOICE_WEBHOOK_SECRET`.
  Watch the first live call land in `call_logs` before trusting the outcome mapping.
- Add a Resend key so the owner emails actually deliver, and check the recording link
  resolves from outside the network.
- No git remote yet — `git remote add origin …` then push.
