# Onboarding and ongoing settings — 12 September 2026

## Completed

- Welcome, business details, hours and review remain sections of the same page, with anchored progress navigation and draft autosave.
- Account settings now contains business details, hours/availability and phone preferences. The dashboard and application menu link directly to them. Completed setup is not the only place to access these choices.
- Signed-in saves use an owner-scoped endpoint with revision and database comparison checks. Only business name/configuration are updated; subscription, status, booking URL, phone connection and existing appointments remain intact. Existing provider IDs are preserved.
- Preview settings share the setup draft saved on this device. Preview saves never submit real account data. Ongoing settings use an explicit Save business settings control; initial setup continues to autosave.
- Weekly schedules adapt to the panel width: seven columns where there is room, day cards on smaller panels. Manual time entry, 15-minute keyboard adjustments, dragging, all-day and closed days are supported. Time inputs use 16px text, and the landscape dropdown no longer closes from a delayed scroll event.
- Welcome/review mascot images use responsive image delivery. Progress tracking is limited to one layout check per animation frame.

## Verification

- Setup and settings checked at 320, 375, 768, 1024, 1440 and 1920px. No page or weekly-editor horizontal overflow. Signup also checked at 320, 768 and 1440px.
- Verified preview persistence across settings/setup/reload, autosave, keyboard/manual time edits, all-day/closed days, drag handles, invalid-time feedback, finishing preview, editing after completion and short landscape time menus.
- 81 automated tests pass, including booking-slot behavior after hours changes, provider identity preservation, unauthenticated/cross-origin rejection and stale/concurrent save rejection. Endpoint tests use a simulated database.
- TypeScript and isolated production build pass. Production build excludes internal tools and preview routes.
- Page-index completion marks retained for signup/welcome/hours/review, with settings added and thumbnails refreshed.

## Repeat checks

Run `npm test` and `npm run typecheck`. With the local development server running, run `node tests/onboarding-browser.mjs`; optional `TEST_BASE_URL` and `CHROME_PATH` override the defaults. This uses an isolated browser profile and example data.

## Remaining acceptance

A real signed-in account save/reload against the deployed database has not been exercised in this pass. Verify that during production acceptance; no real customer record or live phone routing was changed during testing. Additional desktop/mobile browser engines have not been tested. The 3D mascot project remains parked.
