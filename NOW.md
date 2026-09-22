## Shorter demo and microphone guidance live — 21 September 2026

- Reduced marketing voice practice to 30 seconds in the browser and OmniDimension agent; provider setting read back as 30. Live at bubs.ai (deployment bubs-7k954enbz).
- Added permission-pending, denied, missing-device and unavailable-device instructions. Eight seconds without microphone input prompts the visitor to speak or check their selected microphone; mute has its own guidance.
- Waiting for microphone permission creates no provider session and does not consume demo time; countdown begins when connected.
- Typecheck and production build passed. Live browser checks passed for pending/denied/missing input, silent-input reminder, mute/unmute, provider audio frames and automatic end.
- Work complete and ready for tester feedback. Existing shared-password and usage limits remain in place; unrelated setup/account work remains below.

## Hosted tester voice connected — 21 September 2026

- Enabled the password-protected marketing voice demo on bubs.ai using a dedicated verified demo credential; other provider credentials are unchanged.
- Added atomic Supabase limits: five starts per signed tester session per hour, 100 globally per UTC day, and fail-closed behavior if counters are unavailable.
- Provider creates sessions successfully; credits are available. Typecheck, route tests, production build and database limit checks passed. Owner confirmed the deployed voice works.
- Next: owner requested reducing the 90-second demo to 30 seconds and clearer microphone permission/silence guidance; implementing now.

## Jev routing verified — 21 September 2026

- Ran an actual jev-codex prompt with no project details; Jev routed it to gpt-5.6-luna and returned READY successfully.
- This verified the separate CLI session; it did not change the model running this desktop conversation or modify the site.
- Security assessment remains pending explicit sharing approval; next product work remains below.

## Private tester site deployed — 21 September 2026

- Published the public splash and password-protected full site to bubs.ai; tester entry is https://bubs.ai/login?next=%2Fhome. Password is stored in environment settings, not this note.
- Tightened private page/image access, crawler rules and caching; corrected authenticated /home routing and marketing navigation. Staff/customer sign-ins remain separate.
- Typecheck and 126 tests passed. Final live browser checks passed for public splash, anonymous denial, image protection, invalid/valid password, no-index headers and separate staff login. Deployment: bubs-deraunf9s.
- Production and Preview settings use the owner-selected shared password; production was redeployed. Local preview uses the same password. Existing hosted Preview deployments need rebuilding to consume changed settings.
- jev-codex launcher verified; external security assessment was blocked by automatic approval review pending explicit sharing approval. No security details sent. See docs/PRIVATE-TESTER-ACCESS.md; account/voice activation work remains separate.

## Local marketing preview recovered

- The managed preview service was stopped; restarted it from the relocated bubs.ai repository.
- Verified `/home` returns HTTP 200 and renders the marketing heading and overview in a real browser. Requested it in the Codex browser panel.
- Recovery complete; the service lasts until stopped or logout. If the preview is unavailable, check `npm run dev:workspace:status` before sharing its link. Hosted sites were not changed.

## Marketing page-index order — 21 September 2026

- Placed Coming soon / splash page directly above Marketing homepage in the Marketing Site column.
- Both remain separate entries with their own destinations; completion marks retain their existing IDs.
- Next: continue the separate pending product work below.

## Marketing and splash links separated — 21 September 2026

- Page index, toolbar and roadmap marketing-home links now open `/home`; splash has its own `/coming-soon` card.
- Added a full-home route alias for previews without coming-soon mode; existing access gates remain intact.
- Typecheck and four page-index tests passed. Browser clicks verified the full homepage and splash are separate destinations; local catalogue reloaded.
- Task complete locally; no hosted deployment changed. Other pending work remains below.

## Local preview restored — 21 September 2026

- Started the managed local preview from the relocated repository at `~/Code/✅ - bubs.ai`; http://127.0.0.1:3101/ returns HTTP 200 with the homepage heading.
- Requested the local preview in the Codex browser panel; hosted staging and production were not changed.
- Restore task complete. Existing product/voice work and unrelated working-tree changes remain separate; continue from their handoffs below.

## Laya follow-up — 21 September 2026

- Ran the requested local Laya assessment; exact results are in docs/laya-front-desk-assessment.md.
- Laya selected deferring unproven card promises, verifying the existing flow first, and exploring bounded intake later.
- Choice confidence was very low; treat this as a weak second opinion, not validation.
- No product changes, spend, outbound calls or launch performed.
- Next: acceptance evidence for the existing customer flow, retaining owner approval for paid or outbound steps.

## AI Front Desk reference review — 21 September 2026

- Reviewed the supplied Angus Sewell PDF against pricing, Features inventory, inbound routing, voice configuration and roadmap; findings are in docs/research-ai-front-desk.md.
- Recommendation: keep new memory/triage/warm-transfer promises off plan cards; retain current-stack confirmation and human-follow-up positioning.
- Identified premature transfer-success reporting, insufficient per-call consent handling and missing business scoping in the reference guide.
- No implementation, spend, outbound calls, provider changes, routing changes or public launch performed.
- Next: acceptance evidence for the existing booking → confirmation → owner-follow-up flow, with owner approval before any paid or outbound step.

- Holding page, 14 Sep evening: logo centred at the top with a smaller ™, bottom caption gone,
  and a founding-rate offer ("Sign up before launch and keep the founding rate") whose button
  opens a modal (email, optional mobile with SMS consent, business). It posts to /api/waitlist.
- Klaviyo is connected and verified on production (14 Sep, late): the route upserts the profile
  with founding_rate: true, adds it to the Founding rate list (X7k8uZ) synchronously, then records
  consent through a subscribe job. Verified in a real browser and on every endpoint path (email,
  mobile only, mobile with SMS, bad input, spam trap, foreign origin). SMS consent needs a Klaviyo
  sending number first; the intent is kept as a profile property. Key "bubs.ai website waitlist
  v2" lives only on Vercel. The older exposed key was deleted. Details and gotchas (bot protection, test profiles): docs/klaviyo.md.
- Hardened 15 Sep: the /home marker header only counts with a valid owner cookie; SITE_PASSWORD
  is now a random value on Vercel (Production and Preview; the code default is dead), COMING_SOON
  and SITE_GATE are set for Preview too, and Vercel Authentication protects preview deployments.
  Waitlist rule: a real person is never refused. Bot checks (BotID, Turnstile, honeypot) tag
  bot_check: flagged instead of blocking; only typos, throwaway/non-mail domains and fictional
  numbers get a "check the spelling" message. Owner: add bubs.ai to the Turnstile widget's
  hostnames in Cloudflare; review the bot_check = flagged segment now and then.
- Accessibility pass 15 Sep: axe-core clean (WCAG 2.2 AA rules) on hero and modal; every text line
  over the photo measured per pixel at 375, 1080 and 1440 wide, all ≥4.5:1 (title ≥3:1); greys in
  the modal at 5:1; hero no longer clips at 200% zoom; visible focus rings; Escape returns focus.
- Vercel project renamed ai-receptionist → bubs-ai. Still named after the old product: the
  default domain ai-receptionist-two-azure.vercel.app (swap needs the owner: add bubs-ai.vercel.app,
  remove the old one under Settings → Domains) and the GitHub repo DesignTitan/AI-Receptionist.
- Klaviyo account (other session, 14 Sep late): welcome flow "Founding rate welcome" is live on
  "Added to list: Founding rate"; segment "SMS consent (pre-setup)" exists; test profiles removed
  from the list. Owner still to do: SMS toll-free number (needs EIN), footer org name in
  Settings → General, bubs.ai sending domain. Next: launch-day campaign, app events later.
## Holding site (14 September 2026, not deployed)

- A hero-only "coming soon" homepage lives at /coming-soon: the same copy, photo and logo, a
  Coming soon pill above the kicker, no navigation links and no actions. Exactly one viewport
  tall (100vh; 100svh under 760px), scaled for desktop, tablet and phone. Files:
  src/app/(holding)/. In production it takes over "/" when COMING_SOON=true is set on Vercel
  (src/proxy.ts), and it is public even while SITE_GATE stays locked. Preview locally at
  http://127.0.0.1:3101/coming-soon. Owner review pending before any deploy.

# NOW

Updated 14 September 2026. Read this first at the start of a work session.

- **Completed:** Setup form polish (`226be01`): cards on #f8f8f8 with headings inside, hero bottom corners rounded, section dividers, Next buttons removed, per-step progress stroke on the step indicator, autosave spinner, eyebrow labels on the border, address field is a US-only Photon combobox. Verified in the browser; 110 tests pass.
- **Decision pending — setup v2 (`3fcb595`, `d34007e`):** the whole journey, four steps behind a stepper at `/account/setup-v2` ("Setup v2" in the dev toolbar): Welcome → Tell Bubs (interview; card fills itself) → Hear how Bubs answers (greeting script, booking page openings, be-the-caller) → Go live (Bubs number, carrier forwarding steps, forwarding test). Compare against `/account?preview=confirmation`. Bubs decided onboarding must be fully self-serve (no ops person) and must not copy Goodcall; the differentiator is that Bubs talks and the setup is the demo. Text-only, saves to the browser; every part that needs voice or provisioning says so rather than faking it. Card edits commit on blur and never steal focus (bug Bubs found, fixed). Step changes are one transition (fade out, slide in) under a sticky stepper; the window never glides (Bubs found the jump, fixed).
- **Voice in setup v2 (built 14 Sep, blocked on credits):** "Talk to Bubs™" in the step-1 chat opens an OmniDimension WebSession with a new agent **254113 “Bubs — setup interview”** (`OMNIDIMENSION_SETUP_AGENT_ID` in `.env.local`), passes what’s already known as `custom_variables`, streams both sides’ transcripts into the chat, and extracts each spoken answer into the card (`/api/setup/extract` on Claude when `ANTHROPIC_API_KEY` is set, local parsers otherwise). Session creation currently returns **insufficient_balance** from OmniDimension: top up at omnidim.io Billing, then the button works. Dev-only, loopback-only, 10 sessions/hour. Nothing fakes a call.
- **Keys v2 can use (both optional, both untested against real keys):** `GOOGLE_PLACES_API_KEY` (Places API (New), Text Search) for the listing lookup; `ANTHROPIC_API_KEY` for "Suggest other versions" / "Ask Bubs™ for feedback" on the call scripts (`/api/setup/script`, Claude Opus 5, structured output). Without them Bubs asks / the UI says suggestions are unavailable.
- **Workspace:** Repo moved to `~/Code/✅ - bubs.ai`; dev server runs via `npm run dev:workspace` on http://127.0.0.1:3101. `dev/toolbar.js`, part of `dev/pages.js` and `.env.example` still carry uncommitted changes from other work (staging URL, Internal Ops link, demo agent id) — preserve them and stage only the current task's files.
- **Next:** Bubs compares v1 and v2 and decides. If v2 wins: voice mode on the existing OmniDimension WebSession, the "you be the caller" booking, automated go-live (number provisioning, carrier forwarding steps, forwarding test call), and retire `setupPending` / "we test it together". Earlier open items (staging auth runbook, production voice, sales notifications) are unchanged; see [NOW-HISTORY.md](NOW-HISTORY.md).
