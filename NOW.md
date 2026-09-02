# NOW

Handoff notes for the next session. Updated 2026-09-01.

## Just done

- **Multi-vertical restructure underway** — plan at
  `~/.claude/plans/so-you-want-to-keen-nest.md`. Chunks 0–4 of 10 landed:
  - 0: `/demo/` asset collision resolved (`public/demo` → `public/audio`).
  - 1: `Doctor→Provider` / `Patient→Client` rename across TS + SQL. `callMetadata` keys in
    `voice.ts` are frozen (external Vapi/Bland contract) — only their values changed.
  - 2: **`src/verticals/`** — every medical string now lives in `src/verticals/medical/`
    (`terms` = nouns in shared UI, `copy` = authored prose, `seed` = roster + transcripts).
    Pages read `DEFAULT_VERTICAL` until chunk 3 routes them by `/demo/[vertical]`.
    `Provider`/`Appointment` rows carry a `vertical` column. `supabase/seed.sql` is now
    GENERATED (`npm run seed:sql`) from the roster, so it can't drift. `env.clinicName` is
    gone; `SITE_TIMEZONE`/`OWNER_EMAIL` replace the `CLINIC_*` vars (old names still read).
    Verified: rendered HTML diff vs pre-extraction baseline shows only node-splitting and
    the intended restoration of medical nouns; full booking → call → admin passes.
  - 3: **routes live under `/demo/[vertical]`** (`/`, `/book/[slug]`, `/confirmation/[id]`)
    with APIs at `/api/demo/[vertical]/{availability,bookings}`. `demoPaths(slug)` is the one
    place the prefix lives; `resolveVertical(params)` 404s unknown slugs at the layout.
    Provider slugs are unique per vertical; a booking refuses a provider from another
    vertical; the confirmation page refuses an appointment from another vertical.
    **Temporary** `redirects()` in `next.config.ts` send `/`, `/doctors/*`, `/booking/*` to
    the medical demo — remove when the marketing site lands at `/` (chunk 8).
  - 4: **theming.** `:root`/`.dark` now carry the PRODUCT palette (indigo + graphite, Inter);
    medical's tokens moved verbatim under `[data-vertical="medical"]` ×2. Rule (documented in
    `globals.css`): a key a vertical sets in its light block MUST also be in its dark block —
    same specificity as `.dark`, so it would otherwise win in dark mode. Display faces load once
    in the root layout (`--font-display-{editorial,fashion,technical}`), CSS re-points
    `--font-display`; font classes moved from `<body>` to `<html>`. `VerticalTheme` sets the
    attribute (inline script for hard loads, layout effect for soft navs, cleared on unmount).
    Verified all 4 palette×mode combos by computed style; soft-nav out/in restores correctly.
    **Temporary** swatch pages at `/swatches` and `/demo/[vertical]/swatches` — delete after chunk 6.

- **Password-gated the whole site.** `src/proxy.ts` (Next 16's renamed `middleware.ts` —
  one per project, so the site gate and the pre-existing `/admin` gate share it) now bounces
  any cookie-less browser to `/login`, and returns 401 on browser-facing API routes.
  `/api/webhooks/*` is deliberately exempt: providers carry no cookie and authenticate with
  `VOICE_WEBHOOK_SECRET`. Password reads from `SITE_PASSWORD`, default `bubs2026`.
- The gate cookie is an HMAC over its own expiry (7 days), signed with the password itself,
  so rotating `SITE_PASSWORD` signs everyone out. `src/lib/auth.ts` grew reusable
  `createToken`/`verifyToken` helpers; `src/lib/site-gate.ts` builds the site gate on them.
- Staff sign-in is unchanged and still separate: unlocking the site does not get you
  into `/admin`.

### Earlier

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
