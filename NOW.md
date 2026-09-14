## Features page rebuilt (13 September 2026)

- /features now opens with three outcome pillars (Get booked, Confirm every visit, Stay in
  control), keeps the six spotlight stories, and ends with "Everything included": the whole
  feature inventory, 42 items in six groups, each marked Included, Pilot or Coming soon (the
  last links to the roadmap board). Data lives in src/lib/marketing/feature-inventory.ts; keep
  it truthful and keep roadmap ids matching src/lib/roadmap/catalogue.ts. Hero and close now
  lead with "Set up my business" → /start. Pattern follows what Calendly, Acuity, Jobber, Fresha,
  Notion and Linear do: pillars first, spotlights, depth at the bottom, one repeated CTA.

# NOW

Updated 12 September 2026. Read this first at the start of a work session.

- **Completed:** Homepage sections now have matching left/right margins; verified at six widths from 320–1463px without horizontal overflow. Latest layout commit: `4f916d3`. Navigation/footer branding, character-sheet links and recent account/setup refinements are committed and pushed.
- **Workspace:** Branch `codex/account-authentication-flow`; local preview is http://127.0.0.1:3101/. Existing uncommitted internal-tools and research files belong to separate work—preserve them and stage only the current task’s files.
- **Deployment:** bubs.ai is connected. Last recorded verified production release is `8c3038e`; the site password gate remains enabled. Subsequent local changes must not be described as deployed without checking the deployment. Publishing authorization exists, but do not remove the gate or include unfinished work.
- **In progress:** Mobile audio startup and sales-form error handling are fixed in code (`eac7855`); typecheck, 98 tests and mocked mobile checks passed. Real production voice remains disabled; sales verification and notification configuration remain unresolved. No real calls or emails were sent by those checks.
- **Next / approvals:** Resume isolated staging authentication using [the staging runbook](docs/security/STAGING-AUTHENTICATION.md). Credential transfer to Vercel Preview and Cloudflare widget inspection using the saved command-line credential were blocked by automatic approval review; explicit approval remains pending. Do not retry those methods or bypass the blocks. Real email/MFA and live-call acceptance remain unverified; 3D mascot development is parked.
- **Handoff maintenance:** This file was checked against recent commits and condensed; all previous notes are preserved in [NOW-HISTORY.md](NOW-HISTORY.md). Keep this file to 3–6 current bullets after each work block, replace superseded status, and commit/push it with the task. Archive detailed history rather than stacking more “current” handoffs here.
