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

## Deployed

- Live on Vercel: https://ai-receptionist-two-azure.vercel.app
  (project `bubs-1063s-projects/ai-receptionist`, linked to the GitHub repo, so pushes to
  `main` now auto-deploy). Redeploy manually with `vercel --prod`.
- Deployed with **no env vars**, so production is running in demo mode. Static surfaces are
  fine — home, `/doctors/[slug]`, `/api/availability`, `/admin/login` all serve real seed data.
- **Known limitation:** the in-memory demo store does not survive serverless invocations.
  `POST /api/bookings` returns 201, but reading the appointment back 404s because the next
  request lands on a different Lambda instance. The booking flow will not work end to end in
  production until Supabase is wired up. This is not a regression — it is demo mode meeting a
  stateless runtime.
- Per-deployment URLs (`ai-receptionist-<hash>-…vercel.app`) sit behind Vercel SSO; the
  `ai-receptionist-two-azure.vercel.app` alias is the public one.

## Next

- **Priority:** point production at a real Supabase project — this is what unblocks booking
  on the live URL. Set the three Supabase keys plus `ADMIN_PASSWORD` and
  `ADMIN_SESSION_SECRET` via `vercel env add ... production`, then redeploy.
- Point it at a real Supabase project: run `supabase/schema.sql` then `supabase/seed.sql`,
  set the three keys, confirm the double-booking index behaves under a race.
- Wire one real voice provider (Vapi is the least work) and set `VOICE_WEBHOOK_SECRET`.
  Watch the first live call land in `call_logs` before trusting the outcome mapping.
- Add a Resend key so the owner emails actually deliver, and check the recording link
  resolves from outside the network.
- No git remote yet — `git remote add origin …` then push.
