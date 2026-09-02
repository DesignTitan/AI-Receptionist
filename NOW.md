# NOW

Handoff notes for the next session. Updated 2026-09-01.

## Just done

- **Multi-vertical restructure underway** — plan at
  `~/.claude/plans/so-you-want-to-keen-nest.md`. Chunks 0–9 of 10 landed:
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
  - 5: **salon** (`/demo/salon`, Solstice Salon & Spa). The acceptance test held: adding it
    touched `src/verticals/salon/*`, two palette blocks, the `VerticalSlug` union, two new
    glyphs in the shared icon set, and `verticals/rosters.ts` (the seed script now reads that
    list, so a new vertical never edits `scripts/`). Verified: tokens + Playfair in both modes,
    full booking confirms with salon copy, cross-vertical booking → 409, cross-vertical
    confirmation page → 404, shared admin shows "Sasha Reyes" beside "Dr. Elena Vasquez".
  - 6: **studio** (`/demo/studio`, Halide Studio — a brand/design studio where you book a paid
    discovery session with the director who'd lead your project). Touched only
    `src/verticals/studio/*`, two palette blocks, and the slug union. Same verification set
    passed. Swatch pages removed. **All three demos are live locally.**
  - 7: **shared admin.** One dashboard for every business: a Business filter row and column
    (each identified by its swatch, since admin renders on the product palette), stats that
    follow the selected business, `?vertical=` on the feed API, a business badge on the record
    page. Admin shell + both sign-in screens are now branded "AI Receptionist", not Northlake.
  - 8: **marketing site at `/`** + `/demos`. Owner-facing hero, stat strip, owner-framed steps,
    demo cards (each in its business's swatch), the full industries catalogue with the three
    live demos called out, "what's in the box", buyer FAQ (calendar sync answered honestly as
    roadmap), closing CTA. The five section blocks now live in `components/marketing/blocks.tsx`
    and the demo pages use them too — verified visible-text-identical to pre-lift baselines.
    `ui/button.tsx` is the pill primitive. Temporary redirects removed. "Talk to us" only renders
    when `CONTACT_EMAIL`/`OWNER_EMAIL` is set (no fake address on a sales page).
  - 9: **go public.** `SITE_GATE` is a two-mode switch: unset/`public` → product + demos open,
    `/admin` staff-gated, `/login` dead; `locked` → today's whole-site `SITE_PASSWORD` gate
    (webhooks always open). `robots.ts` disallows `/admin` + `/api/`; the demo layout is
    `noindex` (fictional businesses). Both modes verified by contract.

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

- Live on Vercel: https://ai-receptionist-two-azure.vercel.app — **locked** behind the site
  password (`SITE_GATE=locked` set on production; password `bubs2026` = `SITE_PASSWORD`
  default). Unlock at `/login`. Flip `SITE_GATE` to `public` (or remove it) and redeploy to
  open the marketing site to the world.
- Project `bubs-1063s-projects/ai-receptionist`, linked to GitHub, so pushes to `main`
  auto-deploy. Manual: `vercel --prod`. Env vars: `vercel env ls`.
- What's live: the product marketing site at `/`, `/demos`, three themed demos at
  `/demo/{medical,salon,studio}`, the shared staff dashboard at `/admin` (password
  `demo1234` = `ADMIN_PASSWORD` default — shown on the sign-in screen while it's the default).
- **Known limitation (unchanged, now documented on the site's FAQ too):** production runs the
  in-memory demo store. Booking returns 201, but the confirmation page 404s because the next
  request lands on a different serverless instance. **Marketing pages are fine; demo bookings
  do not complete in production until Supabase is wired.** Local (`npm run build && npm start`)
  is a single process and works end to end — that's how every chunk was verified.

## Next — the one blocking item: Supabase (plan chunk 10)

Deliberately deferred (owner decision 2026-09-01: not yet, $10/mo). When ready, in order:

1. Create a Supabase project (org "DesignTitan's Org", `us-east-1` sits nearest Vercel).
   The Supabase MCP connector can do it: `get_cost` → `confirm_cost` → `create_project`.
2. Apply `supabase/schema.sql` (has the `vertical` columns and the `(vertical, slug)` unique
   index) — `apply_migration` via the connector, or paste into the SQL editor.
3. `npm run seed:sql` regenerates `supabase/seed.sql` from `src/verticals/*/roster.ts`
   (18 providers across three businesses); run it after the schema.
4. `vercel env add` for production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (the `sb_publishable_…` key), `SUPABASE_SERVICE_ROLE_KEY`, plus `ADMIN_PASSWORD` and
   `ADMIN_SESSION_SECRET` (`openssl rand -hex 32`). Then `SITE_GATE=public` when you want it open.
5. Redeploy, then the acceptance test from the plan: book on the live URL, **reload the
   confirmation page** — it must survive. Then `/admin` shows the row under its business.

Everything else, in priority order once Supabase is in:
- Decide the sales motion (the site currently has no pricing and no contact CTA — set
  `CONTACT_EMAIL` to make "Talk to us" appear). Decide the calendar-sync answer; the FAQ
  currently says "not yet, roadmap".
- Wire one real voice provider (Vapi least work); set `VOICE_WEBHOOK_SECRET`. The
  `callMetadata` keys in `src/lib/voice.ts` are frozen for the assistant config; the values
  are now per-business and `business_name`/`vertical` were added.
- Resend key + `OWNER_EMAIL` so owner emails deliver (templates already use each business's
  swatch and nouns).
- Product name: "AI Receptionist" is the working name everywhere (`PRODUCT_NAME` in
  `src/components/marketing/product-chrome.tsx`).
- The one real product wall, demand-gated per the plan: a services entity with per-service
  durations (`slot_minutes` lives on the provider today). Also the hardcoded 12–13 lunch break
  and 90-min lead time in `src/lib/db.ts`.
- Adding a fourth vertical = one directory under `src/verticals/`, a line in `index.ts`,
  `terms.ts` and `rosters.ts`, a member on `VerticalSlug`, and two palette blocks in
  `globals.css` (every key set in the light block must also be set in the dark block).
