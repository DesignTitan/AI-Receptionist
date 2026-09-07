# NOW

Handoff notes for the next session. Updated 2026-09-07. Launch is Thursday 1 October 2026;
the dated plan is docs/ROADMAP.md.

## Just done (2026-09-03 → 07)

- **Navigation.** A floating nav at the top of the homepage, `src/components/marketing/site-nav.tsx`,
  iterated to the owner's references: liquid-glass pill of icon tabs (home dot, Features, Proof,
  Industries, Pricing) where only the current chapter is a raised white tab carrying its label;
  a round accent call disc beside it; a slightly darker plate behind both that hangs from the
  top edge (square above, 44px corners below). The disc drops a frosted-glass dialog holding the
  real ask-for-a-call form (`TryCallPlate` in `compact` mode: name, number, business, Turnstile),
  flat fields a shade darker than the glass; same route and honest no-line fallback as chapter
  six, and the nav copy sets no harness attributes. Escape / outside click closes. Phones: five
  icons + disc. Backdrop-filter does survive the minifier (the nav proves it).
- **Display face is Instrument Sans**, 500, via next/font (`--font-display-marketing`); the
  owner turned down the serif. Display heading → subtext is 24px everywhere, 32px in the hero
  (the industries lead and the turn chapter had zero).
- **Core features tab stage has the same parallax.** 06-bg.jpg (sharp stage scene) behind
  06-{book,after,noshow,voice}-p.webp (frosted panel, alpha WebP); the section is a flow act so
  both ride its --sc-p (panel 90px, ground 40px). All alpha panels are WebP now (cwebp, q86).
- **Proof deck images now have parallax inside them.** Each card's image is a sharp desert
  (04-bg.jpg, shared) behind a frosted glass panel rendered as an alpha PNG with its blur baked
  (04-*-p.webp). Both ride the act's --sc-p across the whole scroll: panel climbs 100px, ground
  sinks 36px; 64/24 under 1024px; off under reduced motion. Pipeline: `ref.py … bg|panel` +
  `render.mjs … png` (clips the scene to the panel, encodes WebP). Geometry, fade, shadow untouched.
- **Pricing is three call-volume plans, and the economics are measured.** Front desk $149/200
  calls, Busy desk $299/600 (featured, overlaid on the outer two), Full desk $599/1,500, $1,000
  setup flat, 30c per extra call. Two real calls put voice AI at $0.115/min (prorated) and
  telephony at $0.03/min (rounded up): a 1.5-minute call costs ~23c and the plans keep
  61% / 54% / 46% gross at full use. Full model: docs/pricing-economics.md and the
  "Receptionist Unit Economics" artifact
  (https://claude.ai/code/artifact/2d6057be-84b8-4ae8-8239-cc29a19859e3). OmniDimension seat:
  stay on the $36 business plan to ~5 customers, business Growth ($200) to ~15, agency Scale
  Partner past ~10,000 talk minutes a month. Verify on the billing page that the models bill on
  top of the plan rate. Ava's demo script now quotes these plans. Decision: price on the business seat; a monthly
  scheduled task (omnidimension-seat-check, 1st at 9am) reports when to move to Growth or the
  agency plan. Agent audit applied: 2-word interruption threshold, noise reduction, static
  end-call line cleared (double goodbye fixed). Owner: buy a number, Early deployers plan,
  request voicemail detection. Platform comparison in docs/voice-platforms.md (stay on OmniDimension; Retell at 15–20
  customers). Launch date 1 Oct 2026; the full four-week plan with build, marketing and sales lanes, weekly scorecard and
  triggers in docs/ROADMAP.md and the "Receptionist Launch Roadmap" artifact
  (https://claude.ai/code/artifact/0a4ee2ad-e2b2-4998-9a5d-796e3097cd1a).
- **The phone line works end to end.** Two real calls from the live homepage to the owner's
  phone (OmniDimension call logs 7353968 and 7353970, from the platform's default number
  +1 337 379 9906): Ava opened with the visitor's name and the recording notice, pitched,
  quoted the then-current $199 / $1,000 / 500 calls correctly (now the three plans), declined to book a 3 PM slot the right way; the
  post-call report reached `/api/webhooks/voice` and matched (`metadata.call_log_id`), the
  page filled in, the lead email fired. Fixed from the evidence: a demo call is now
  "confirmed" when a person spoke (Ava's own "reschedules and cancellations" used to trip the
  appointment keyword heuristic into "cancelled"); OmniDimension's `LLM:`/`User:` labels are
  shown as Ava/You.
- **Textured dark ground** on chapters 4 and 5 (`.textured-section`, assets in
  `public/images/textures/`): baked-in photo falloff plus an overlay-blended grain tile.
  The pinned proof chapter needs its stage to stay sticky and the section to stay
  `overflow: visible`, or the pin breaks.
- **Core features (chapter 4)**: its own component before the deck — chip, two-line title,
  lede, and four clickable tabs — your booking page, open after hours, fewer no-shows,
  sounds like you — each a frosted screen over the desert, on the dark steel-blue ground.
  Keyboard accessible (tablist, arrow keys, visible focus).
- **Proof chapter is a stacked deck of the three features**: it calls, it records, it flags.
  Dark cards on the paper ground, each with a flat frosted-glass panel of that feature's UI over
  a blurred desert photograph (`scrollcraft/builds/receptionist/ref.py` regenerates all three). Settled: do not restyle without being asked.
  Each card rises over the previous, which settles back and fades once ~60% covered. Pure CSS on
  the engine's `--sc-p` (`.rc-deck*` in `receptionist.css`); reduced motion → a column. The
  page is now 15.5 viewport-heights.
- **Human check live and visible.** Turnstile keys are on Vercel (widget "AI Receptionist -
  ask for a call", hostname ai-receptionist-two-azure.vercel.app, Managed). The check now runs
  on every submission (live call or callback request) and renders visibly. The plate's inputs
  got proper field bodies.
- **Ava tuned from the transcripts (done 3 Sep, on the live agent):** the static end-call line
  was cleared so callers hear one goodbye; interruptions need two words; noise reduction on.
  The extracted `outcome` still comes back "Not provided" on demo calls; the app does not
  depend on it for demos. Add the real domain to the Turnstile widget's hostnames when the site
  moves.
- **Still open, owner only, in order (all on the runbook with dates):** buy Ava a US number in
  OmniDimension by Fri 26 Sep and put its id on Vercel; Early deployers plan + request voicemail
  detection; rotate `VOICE_WEBHOOK_SECRET` (the token has been visible in logs);
  `SUPABASE_SERVICE_ROLE_KEY` on Vercel; Resend + `OWNER_EMAIL`; product name + domain.

## Earlier on 2026-09-02

- **The homepage is a scrollcraft build.** `/` is now a chaptered editorial on paper: title
  page, the cost (hard cut to ink), the turn (a scrub film of the real confirmation page),
  proof, an industries rail, an authored silence, the "ask for a call" plate (the peak), terms
  with the $199 / $1,000 / 500-call pricing, a held colophon. Engine vendored untouched at
  `src/vendor/scrollcraft/`, mounted from `components/marketing/scrollcraft-mount.tsx`; page
  styles in `app/(marketing)/receptionist.css`; assets in `public/scrollcraft/`. Brief, score,
  fingerprint gate and the verification record: `scrollcraft/builds/receptionist/BRIEF.md`;
  registry row in `scrollcraft/FINGERPRINTS.md`. Verified with the skill's harness on desktop,
  390×844 and reduced motion (no dead scroll, clip always moving, contrast clear, no console
  errors) and by driving the page in a browser. Lab shots are gitignored.
- **"Have it call you" is real plumbing, and honest.** `POST /api/try-call` (name, phone,
  business; NANP only; honeypot; 3/IP/hour, 2/phone/day, `TRY_CALL_DAILY_CAP`) creates a
  `kind: "demo"` call log with reference `TRY-XXXXXX`, dispatches through the same
  `placeCall` as confirmations, and `GET /api/try-call/[id]?ref=` is what the plate polls.
  **With no voice provider the page does not pretend:** the server records the lead, marks
  it `failed / no_voice_line`, emails the owner ("☎ Lead · <name> asked for a call"), and the
  plate says "This page can't ring you", shows Ava's real opening line, and stops. The
  scripted demo transcript was removed after the owner tested it and, rightly, called it
  made up. Stages and transcript render only for a call that was placed.
- **OmniDimension is live on the account and wired to this app** (agent `248069` "Ava",
  built in a Cowork session, ElevenLabs "Elena", gpt-4.1-mini). Verified from this session
  through the OmniDimension connector: the agent, its Post-Call webhook to
  `/api/webhooks/voice?token=…` with the extracted `outcome` variable, and three web-call
  logs (a reschedule conversation worked end to end; the reports came back `matched:false`
  because web calls have no log on our side, which is correct). Variable syntax on their side
  is `{{name}}`. Changes made from here, all additive (versioning is not on the plan, so restore
  by hand if needed): welcome message was
  `Hi, this is Ava calling from {{business_name}} about your upcoming appointment. Do you have a quick moment?`
  and is now `{{first_message}}` (our first line, which carries the recording notice); a new
  first prompt section "Which call this is" routes on `{{kind}}` (demo → follow `{{script}}`;
  confirmation → the seven Cowork sections, untouched); defaults added for `kind`,
  `first_message`, `script`, `contact_name`. The app now also sends `customer_name`, `kind`
  and `callback_number` (`CONTACT_PHONE`, optional). Production has `VOICE_PROVIDER`,
  `OMNIDIMENSION_API_KEY`, `OMNIDIMENSION_AGENT_ID`, `VOICE_WEBHOOK_SECRET`.
  **Still missing on Vercel: the two Turnstile keys**, so the homepage stays in callback mode
  by design until they land. No phone number on the account yet (the platform default rings).
  The webhook token has been visible in call logs and chats: rotate it before a customer sees
  this (`openssl rand -hex 24` → the dashboard URL and `VOICE_WEBHOOK_SECRET`, redeploy).
- **A person, not a script, behind every live call.** Cloudflare Turnstile
  (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`, `src/lib/turnstile.ts`) verified
  server-side before dialling; `isLiveCallReady()` = voice line AND human check, and the
  homepage only goes live on both (a provider without the check is ignored from the site, with a
  warning in the log). Proven with Cloudflare's test keys: no token → 403; verified token →
  dispatched. Owner step: two free keys from dash.cloudflare.com → Turnstile.
- **The phone line is OmniDimension** (the voice agent from the Instagram reel the product
  came from). Fixed the integration against their docs: dispatch sends `agent_id`, E.164
  `to_number`, optional `from_number_id`, `call_context` (now carrying `script`,
  `first_message`, `contact_name`) and `metadata`; the response's `requestId` is stored. The
  post-call webhook's nested `call_report` (summary, `extracted_variables.outcome`,
  `full_conversation`/`interactions`) is parsed, and reports are matched by `phone_number`
  (`findRecentCallByPhone`) since their call id need not equal the dispatch id. Dry-run: real
  API answers 401 on a placeholder key; a docs-shaped report → matched, completed, confirmed.
  **The owner's steps are in `docs/omnidimension.md`** (agent prompt, webhook URL with token,
  extracted `outcome` variable, the five `vercel env add` lines).
- **Chapter six can be asked again.** After a request (or, once a line exists, after a call) one
  button returns to the form with the visitor's details kept; the two-per-number daily limit
  still applies and says so. The homepage renders per request (`force-dynamic`) so its mode
  follows `VOICE_PROVIDER` the moment the keys exist, not the last build. A refused call now
  emails the owner the lead too. The live Vapi path was dry-run with placeholder keys: the API's
  401 surfaces as "couldn't be placed, a person will call you back", nothing is animated.
- Schema: `call_logs` demo columns (`kind`, nullable `appointment_id`/`client_id`,
  `demo_phone`, `demo_business`, `demo_name`, `reference`) now written into
  `supabase/schema.sql`; `demo_name` applied to the live project as migration
  `demo_call_name`. Favicon added (`src/app/icon.svg`).

## Done earlier

- **Business plan + the viability floor** (`~/.claude/plans/so-you-want-to-keen-nest.md`,
  approved 2026-09-01): concierge model — a customer is one deployment, one Supabase, one config
  directory. Built the code side:
  - **Single-tenant mode.** `NEXT_PUBLIC_TENANT=<slug>` at build time makes that business the
    site: `/`, `/book/[slug]`, `/confirmation/[id]` at the root; `/demo/*`, `/demos` and other
    businesses' APIs 404; `/demo/<tenant>/*` redirects to the root form; admin shows one
    business and forces its scope; the 404 page wears the tenant's chrome; the demo `noindex`
    is dropped. `TENANT=<slug> npm run seed:sql` seeds one business. Verified end to end with
    a salon build; default build verified visible-text identical except the consent line.
  - **Recording consent** (`src/lib/consent.ts`): first sentence of the agent's greeting, the
    script's step 1, the simulator transcript, every hero preview, and the booking form's phone
    hint. Verified at runtime in a simulated transcript.
  - `supabase/delete-client.sql` (by phone; cascades; notification logs removed explicitly) and
    `supabase/ops.sql` (five weekly checks). **Unverified against a live database** — no
    Supabase yet. Run the SELECT at the top of the deletion script first.

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
- Project `bubs-1063s-projects/ai-receptionist`. Every deploy this week went out with
  `npx vercel --prod` after the push; production is at commit ec05439. Env vars: `vercel env ls`.
  On Vercel now: Supabase URL + anon key, `ADMIN_SESSION_SECRET`, `SITE_GATE`, `VOICE_PROVIDER`,
  `OMNIDIMENSION_API_KEY`, `OMNIDIMENSION_AGENT_ID`, `VOICE_WEBHOOK_SECRET`, both Turnstile keys.
- What's live: the product marketing site at `/`, `/demos`, three themed demos at
  `/demo/{medical,salon,studio}`, the shared staff dashboard at `/admin` (password
  `demo1234` = `ADMIN_PASSWORD` default — shown on the sign-in screen while it's the default).
- **Known limitation (unchanged, now documented on the site's FAQ too):** production runs the
  in-memory demo store. Booking returns 201, but the confirmation page 404s because the next
  request lands on a different serverless instance. **Marketing pages are fine; demo bookings
  do not complete in production until Supabase is wired.** Local (`npm run build && npm start`)
  is a single process and works end to end — that's how every chunk was verified.

## Onboarding a customer (concierge, per the business plan)

Intake → `src/verticals/<slug>/` (copy the salon's four files) → their Supabase (`schema.sql`,
`TENANT=<slug> npm run seed:sql`, run it) → their Vercel project from this repo with
`NEXT_PUBLIC_TENANT=<slug>`, Supabase ×3, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `OWNER_EMAIL`,
Resend + voice keys → phone number in the voice provider + `VOICE_WEBHOOK_SECRET` → test call with
them on the line → `book.theirdomain.com` CNAME → invoice. Full runbook in the plan, Part 3.

## Next — ONE step left to make production durable

**Supabase is live** (created 2026-09-02, $10/mo, DesignTitan's Org):
- project `ai-receptionist`, ref `ddbldxsyvrqrlvtainzn`, region us-east-1,
  URL `https://ddbldxsyvrqrlvtainzn.supabase.co`
- `schema.sql` applied as migration `initial_schema`; RLS on every table; 18 providers seeded
  (6 medical / 6 salon / 6 studio).
- `supabase/delete-client.sql` and `supabase/ops.sql` **verified against this database**
  (throwaway client → all four counts zero, providers untouched).
- Already on Vercel production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (the `sb_publishable_…` key), a fresh `ADMIN_SESSION_SECRET`, `SITE_GATE=locked`.

**Missing: `SUPABASE_SERVICE_ROLE_KEY`.** The app only switches from the in-memory demo store to
Supabase when this is set (`isSupabaseConfigured()` in `src/lib/env.ts`). It is a secret, so it
has to be added by a person, not pasted into a chat. Three attempts on 2026-09-02 did not land it
on the project — check with the self-test below before assuming it worked.

```bash
cd /Users/bubs2/Code/AI-Receptionist
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production   # prompts; paste the service_role secret
npx vercel env ls production | grep SUPABASE_SERVICE_ROLE_KEY   # ← must print a line. If not, it didn't land.
npx vercel --prod                                          # env vars only apply to a new build
```
Where the secret is: Supabase dashboard → project ai-receptionist → Project Settings → API keys →
`service_role`. Then the acceptance test: unlock the site (`bubs2026`), book in any demo, and
**reload the confirmation page** — it must stay 200. Then `/admin` shows the row under its business.

Also set `ADMIN_PASSWORD` (still the default `demo1234` — fine while the site is locked, not after)
and flip `SITE_GATE` to `public` when you want the marketing site open.

**The call on the homepage is real** (since 2 Sep): OmniDimension agent 248069 "Ava", the
Post-Call webhook, `VOICE_PROVIDER=omnidimension` and its keys, plus both Turnstile keys, are on
Vercel, and two real calls have completed end to end. Still missing for a real customer: a bought
number (calls leave from the platform's shared pool) and Resend + `OWNER_EMAIL` so the lead and
call-summary emails actually arrive.

Everything else, in priority order once Supabase is in:
- Sales motion is decided (three call-volume plans on the site, concierge behind a self-serve
  front at launch, docs/ROADMAP.md). Calendar sync stays "not yet" until a customer makes it a
  condition. The `callMetadata` keys in `src/lib/voice.ts` stay frozen (additive only).
- Resend key + `OWNER_EMAIL` so owner emails deliver (templates already use each business's
  swatch and nouns).
- Product name: "AI Receptionist" is still the working name (`PRODUCT_NAME` in
  `src/components/marketing/product-chrome.tsx`); Week 1 of the roadmap is picking the real one
  and buying the domain.
- Week 1–3 build items from the roadmap: customers table + /admin queue, "Start here" signup
  with Stripe Checkout, one deployment serving every customer by subdomain, `npm run provision`.
- The one real product wall, demand-gated per the plan: a services entity with per-service
  durations (`slot_minutes` lives on the provider today). Also the hardcoded 12–13 lunch break
  and 90-min lead time in `src/lib/db.ts`.
- Adding a fourth vertical = one directory under `src/verticals/`, a line in `index.ts`,
  `terms.ts` and `rosters.ts`, a member on `VerticalSlug`, and two palette blocks in
  `globals.css` (every key set in the light block must also be set in the dark block).
