- Holding page, 14 Sep evening: logo centred at the top with a smaller ™, bottom caption gone,
  and a founding-rate offer ("Sign up before launch and keep the founding rate") whose button
  opens a modal (email, optional mobile with SMS consent, business). It posts to /api/waitlist.
- Klaviyo is connected and verified on production (14 Sep, late): the route upserts the profile
  with founding_rate: true, adds it to the Founding rate list (X7k8uZ) synchronously, then records
  consent through a subscribe job. Verified in a real browser and on every endpoint path (email,
  mobile only, mobile with SMS, bad input, spam trap, foreign origin). SMS consent needs a Klaviyo
  sending number first; the intent is kept as a profile property. Key "bubs.ai website waitlist
  v2" lives only on Vercel. The older exposed key was deleted. Details and gotchas (bot protection, test profiles): docs/klaviyo.md.
- Vercel project renamed ai-receptionist → bubs-ai. Still named after the old product: the
  default domain ai-receptionist-two-azure.vercel.app (swap needs the owner: add bubs-ai.vercel.app,
  remove the old one under Settings → Domains) and the GitHub repo DesignTitan/AI-Receptionist.
- Next for Klaviyo: a welcome email flow on "Added to list: Founding rate", a launch-day campaign,
  and app events (signup, first call) once the platform exists.
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
