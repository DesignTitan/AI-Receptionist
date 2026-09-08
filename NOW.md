# NOW

Handoff notes for the next session. Updated 2026-09-08. Launch is Thursday 1 October 2026;
the dated plan is docs/ROADMAP.md.

## Current handoff — luxury imagery and owner-benefit story (8 September 2026)

- Bubs rejected the first concepts as generic AI imagery and requested clean, luxurious, futuristic SpaceX-like art direction. Further steering: use Starlink-style real-life benefits to sell time back when owners are busy, away from the desk, taking a break or taking time off. Inspected both official references.
- Built design/hero-comparison/luxury-v2/index.html with five new square images: four refined technical directions and an owner taking a coastal coffee break. The human benefit leads: “Step away. Bookings keep moving.” Support: “Your customers book online. AI calls them to confirm. You see the outcome.” All four technical directions remain available in focus/compare views; V1 is preserved.
- Saved exact image prompts, checksums, copy and reference rationale with V2. Visual review, browser controls, keyboard selection and 390px mobile checks pass; no page overflow or browser errors. Corrected mobile image framing and decorative loading announcements. These are still images and proposed sequences; no application change, video generation or deployment.
- Next: review the benefit story and choose/refine the strongest visual direction, then develop connected story frames and a short motion test. Phone evolution should use precise cuts, with about 20% historical phones and 80% booking, outbound AI confirmation call and owner outcome. Keep customer value obvious throughout.
- Preserve product truth: online bookings, outbound confirmation calls, owner records and human follow-up for requests. Do not promise inbound answering, guaranteed bookings, unlimited calls, customer team accounts or a fully unattended business. Public GitHub push remains blocked by the earlier automatic approval review of the public destination and awaits the previously requested explicit publication approval.

## Current handoff — customer pricing and Stripe live preparation (8 September 2026)

- Marketing, signup and owner dashboard now show setup, first payment and recurring costs clearly, with estimated call counts and conditional test-payment notices. Pricing remains $199/$399/$749 monthly, $299 pilot/$499 standard setup and 49¢ extra started minutes.
- Added a shared test/live setup command and staff billing connection check for account, database, all prices, usage meter, webhook and portal. New database binding rejects mixed environments and preserves financial history; existing-customer updates remain available if a live account's activation flags change.
- Applied the Stripe environment migration to production Supabase and saved STRIPE_MODE=test plus the sandbox account ID on Vercel. No live credentials, activation or real payment. Existing sandbox catalogue, meter, webhook settings and portal passed read-only Stripe verification; existing Vercel signing secret is retained.
- Verification: 16 unit tests, four SQL suites and production build pass. Browser fixtures verify owner payment totals, reactive plan changes and removal of the test notice in live mode. Deployed 7d48e24 to the existing locked Vercel site; all four production billing-connection checks pass, and public pricing shows correct pilot/standard first-payment totals for every plan. Temporary preview servers, test database and local credential file were cleaned up.
- Live transition is documented in docs/stripe-live.md, including a protected credential manifest, clean database binding, auth callback/SMTP settings and one complete configuration deployment. Still required before real customer launch: live Stripe activation/credentials, email delivery, authenticated purchase/voice acceptance and period-close reconciliation. GitHub push remains awaiting explicit approval after automatic review rejected publishing to the existing public DesignTitan/AI-Receptionist repository.

## Current handoff — pilot setup offer (8 September 2026)

- Bubs approved lowering setup: $299 for 10 pilot customers, then $499 standard setup; monthly $199/$399/$749 and 49¢ extra minutes are unchanged. Same fixed scope: one business, booking configuration, dedicated phone setup and one test session; custom work quoted separately.
- Added atomic pilot reservations, immutable per-checkout setup fee/price, confirmed-expiry release and paid-invoice validation. Paid places stay consumed after cancellation/refund/deletion. Staff can see reserved/redeemed/available places; all storefront/signup/dashboard/demo script copy is aligned.
- New Stripe sandbox setup prices are created and connected to Vercel. Production Supabase pilot migration is installed; all 10 places are available. Legacy issued $1,000 checkouts retain their original price.
- Verification: 11 unit checks, all three SQL suites, simultaneous 11-customer allocation (10 pilot, 1 standard), and build pass. All six Stripe setup/plan checkout totals pass; actual paid sandbox setup invoices pass app validation; test subscriptions cancelled. Deployed eea8a34 to the existing locked site; live pricing and Stripe checkout copy verified.
- Target direct onboarding cost is at most $150; $299 leaves about $137.94 after that cost and assumed fees, before shared overhead. Next: finish email setup and authenticated customer/voice acceptance before live billing. Stripe remains test mode. GitHub push is awaiting explicit approval after automatic review rejected publishing to the existing public DesignTitan/AI-Receptionist repository; work is committed locally and deployed.

## Current handoff — minute pricing and Stripe sandbox (8 September 2026)

- Built minutes-v2: $199/300 minutes, $399/750, $749/1,500; $1,000 setup; $0.49 extra started minute. Shared catalogue drives storefront, signup, checkout and staff limits. Cost model targets 51–52% contribution at full use, before shared overhead and tax.
- Created all fixed/metered sandbox prices, setup, meter, webhook and restricted billing portal in acct_1UDNPDPicyLxgU34. Bubs approved test credentials; saved them as sensitive Vercel Production variables. No live Stripe activation or real charges.
- Installed the usage migration in production Supabase. Billing-period snapshots, atomic five-minute reservations, duplicate-safe settlement, default $0 recurring extra-spend cap, customer notices, forecasts and staff usage review are implemented.
- Unit tests (10), database suites and build pass. Stripe invoice previews independently show exactly $49 for 100 extra minutes on all tiers. Deployed 5751fbf to the existing locked production URL; live staff pricing/usage dashboard renders and signed webhook acceptance (200)/unsigned rejection (400) pass.
- Stripe API checkouts verified $1,199/$1,399/$1,749 initially and $248/$448/$798 renewal with 100 extra minutes; disposable sessions expired and subscriptions cancelled. Next: complete an authenticated owner purchase/voice acceptance, connect Resend and custom SMTP, verify a dedicated customer voice line, and review period-close reconciliation before live billing. Dashboard notices work independently; email delivery is not configured. Older call-count pricing below is historical and superseded.

## Stripe onboarding — 2026-09-08

- Bubs created the separate AI Receptionist Stripe account (acct_1UDNP6PadPgqGiRq); completed its introductory business setup with the existing Vercel site and the appointment-confirmation software description.
- Selected online checkout, subscriptions and invoicing; automatic tax was left off for testing and standard individual products selected instead of Managed Payments.
- Opened the new AI Receptionist sandbox (acct_1UDNPDPicyLxgU34). No live activation, payments or bank details were submitted.
- Naming decision: keep AI Receptionist and the existing Vercel address during product testing; postpone buying a domain.
- Next: create the three monthly test prices and setup fee, connect sandbox credentials/webhook to the app, and verify checkout. Email/SMTP and complete live acceptance remain outstanding.

## Approved launch settings — 2026-09-08

- Bubs explicitly approved the Supabase production sign-in callback and Vercel Production CRON_SECRET.
- Saved the generated secret as a sensitive Vercel variable without committing or displaying its value.
- Enabled the daily /api/jobs recovery schedule at 09:00 UTC; ordinary booking jobs also run immediately after submission.
- Verified the exact callback in Supabase and deployed f82e18e successfully. Live queue check: 401 without a secret, 200 with the secret, zero queued jobs. Stripe, email/SMTP and complete live customer acceptance testing remain next.

## Current handoff — customer platform (2026-09-08)

- Deployed e4a9251 to the existing locked Vercel site; production /admin/customers loads the real Supabase queue. Built owner email-link accounts, business/plan intake, Stripe Checkout and billing portal, owner booking/call dashboard, branded customer booking pages, and staff setup/recovery queue. Pricing stays $149/$299/$599 monthly plus $1,000 setup.
- Installed the additive customer-platform migration in production Supabase. Owner data is scoped to its account; database rules prevent overlapping bookings and duplicate event jobs. Existing demos and voice metadata remain unchanged.
- Added dedicated-agent/number provisioning with spending limits, durable email/call jobs, signed Stripe callbacks, scoped voice reports, and backup/deletion tools. Activation stays concierge: review and test each customer's line first.
- Verification: unit tests and disposable PostgreSQL tests pass, including account isolation, overlap rejection, checkout reuse, callback deduplication and cancellation protection. Owner/signup browser checks passed with explicitly local fixtures; live payments, customer calls and email delivery are not yet verified.
- External setup remains: Stripe, Resend/custom SMTP and sending domain, Bubs's lead inbox, customer domain and reviewed policies. Site stays locked; no number purchase or external message was sent. Overage is an estimate with manual invoicing.
- Previously, approval review blocked two settings: adding the production /account/callback URL to Supabase's redirect allowlist and saving CRON_SECRET to Vercel Production. Scheduled recovery stays disabled. Next: approve those settings, connect integrations and run a complete test customer. See docs/customer-platform.md; older notes below are historical.

## Just done — production storage connected (2026-09-07)

- Added the existing Supabase `service_role` key as sensitive `SUPABASE_SERVICE_ROLE_KEY` on Vercel Production with the owner's explicit approval; no secret is stored in the repo.
- Redeployed successfully: `ai-receptionist-52weqrm2v-bubs-1063s-projects.vercel.app`, aliased to the existing production domain. Production build and TypeScript checks passed; application source unchanged (59594fe).
- Verified through the live browser: salon booking `SS-95YG2Q` reached confirmation, survived a full reload, and appeared under Solstice Salon & Spa in admin. A direct database read independently confirmed the saved appointment.
- The fictional `Production Persistence Test` used a reserved test phone number and no email; its call failed, so this was a storage test, not a successful real-call test. Cancelled the test booking after verification to free the slot; retained the labelled record as evidence.
- Nothing remains in progress for storage. Next: Resend + `OWNER_EMAIL`, dedicated voice number, webhook-secret rotation, and a non-default admin password before public access. The site remains locked.

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
  Resend + `OWNER_EMAIL`; product name + domain. Supabase service key completed 7 Sep.

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

Customer platform is deployed; external integration setup and live acceptance remain. See the latest handoff above.

## Deployed

- Live on Vercel: https://ai-receptionist-two-azure.vercel.app — **locked** behind the site
  password (`SITE_GATE=locked` set on production; password `bubs2026` = `SITE_PASSWORD`
  default). Unlock at `/login`. Flip `SITE_GATE` to `public` (or remove it) and redeploy to
  open the marketing site to the world.
- Project `bubs-1063s-projects/ai-receptionist`. Every deploy this week went out with
  `npx vercel --prod` after the push; latest application source is 59594fe, redeployed 7 Sep with durable storage. Env vars: `vercel env ls`.
  On Vercel now: Supabase URL + anon key + sensitive service-role key, `ADMIN_SESSION_SECRET`, `SITE_GATE`, `VOICE_PROVIDER`,
  `OMNIDIMENSION_API_KEY`, `OMNIDIMENSION_AGENT_ID`, `VOICE_WEBHOOK_SECRET`, both Turnstile keys.
- What's live: the product marketing site at `/`, `/demos`, three themed demos at
  `/demo/{medical,salon,studio}`, the shared staff dashboard at `/admin` (password
  `demo1234` = `ADMIN_PASSWORD` default — shown on the sign-in screen while it's the default).
- **Production storage fixed (7 Sep):** bookings now persist in Supabase. The live salon booking,
  confirmation-page reload and admin record all passed. The former cross-request 404 is resolved.

## Onboarding a customer (concierge, per the business plan)

Intake → `src/verticals/<slug>/` (copy the salon's four files) → their Supabase (`schema.sql`,
`TENANT=<slug> npm run seed:sql`, run it) → their Vercel project from this repo with
`NEXT_PUBLIC_TENANT=<slug>`, Supabase ×3, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `OWNER_EMAIL`,
Resend + voice keys → phone number in the voice provider + `VOICE_WEBHOOK_SECRET` → test call with
them on the line → `book.theirdomain.com` CNAME → invoice. Full runbook in the plan, Part 3.

## Production storage — completed 2026-09-07

**Supabase is live** (created 2026-09-02, $10/mo, DesignTitan's Org):
- project `ai-receptionist`, ref `ddbldxsyvrqrlvtainzn`, region us-east-1,
  URL `https://ddbldxsyvrqrlvtainzn.supabase.co`
- `schema.sql` applied as migration `initial_schema`; RLS on every table; 18 providers seeded
  (6 medical / 6 salon / 6 studio).
- `supabase/delete-client.sql` and `supabase/ops.sql` **verified against this database**
  (throwaway client → all four counts zero, providers untouched).
- Already on Vercel production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (the `sb_publishable_…` key), a fresh `ADMIN_SESSION_SECRET`, `SITE_GATE=locked`.

**Completed: `SUPABASE_SERVICE_ROLE_KEY`.** Added as a sensitive Production variable and
redeployed. Acceptance test passed: the live booking confirmation survives reload and the
record is visible in Supabase and admin. Older notes about the missing key are historical.

Also set `ADMIN_PASSWORD` (still the default `demo1234` — fine while the site is locked, not after)
and flip `SITE_GATE` to `public` when you want the marketing site open.

**The call on the homepage is real** (since 2 Sep): OmniDimension agent 248069 "Ava", the
Post-Call webhook, `VOICE_PROVIDER=omnidimension` and its keys, plus both Turnstile keys, are on
Vercel, and two real calls have completed end to end. Still missing for a real customer: a bought
number (calls leave from the platform's shared pool) and Resend + `OWNER_EMAIL` so the lead and
call-summary emails actually arrive.

Remaining launch work, in priority order:
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
