# NOW

## Current handoff — 12 September 2026

- Latest completed UI work: centered checkout branding with Back to plans on the left; Marketing Site lists Features & benefits and Explore demos with thumbnails.
- Preview attaches to the existing launchd service at http://127.0.0.1:3101; do not start a competing server. See the preview notes below.
- Pending: clarify what the user wants separated between navigation characters and the actual logo in the Application column; no change was made for that request.
- Last manually verified production deployment was commit 579bff3, behind the existing site password gate. Later commits were pushed; their production deployment has not been verified here. Production publishing is authorized; older restrictions below are historical.
- Updated README, local tools documentation, customer platform notes and roadmap to reflect current navigation, onboarding and pricing references.
- Next: continue page-index review and real-account testing; local practice setup saves only on the device. Untracked research and operations documents belong to other work and remain untouched.

Earlier dated handoffs below are history; this summary takes precedence where they differ.

## Preview (11 September 2026)

- The development server for this repo is the launchd-managed workspace preview on
  http://127.0.0.1:3101 (`npm run dev:workspace`, status/stop variants; label
  `local.ai-receptionist.preview.…`). It has keepalive: kill it and launchd restarts it within
  seconds. Next allows one dev server per directory, so any other `next dev` here fails with
  "Another next dev server is already running". The in-app preview's `dev` configuration now
  attaches to that address instead of starting a second server; `dev-fresh` starts
  `npm run dev` on 3101 only for when the workspace service is not running (after a reboot).
- Twice this week an in-app preview on port 3000 collided with it; the fix each time was to
  attach, not to kill. Do not kill the launchd job to make room for another server.

## Current handoff — marketing page index

- Confirmed Features & benefits and the public demo directory are in Marketing Site, with existing thumbnails.
- Renamed the demo directory Explore demos and clarified the column description.
- Individual interactive business and booking demos remain under Application.
- Verified catalogue grouping, destination pages and thumbnail files.

## Current handoff — checkout header alignment

- Centered the checkout mascot/name in the full-width header.
- Moved Back to plans to the far left with an outlined control and consistent arrow icon; mobile uses an accessible icon-only button.
- Verified centering, left spacing and selected-plan return link on desktop and mobile; typecheck passed.
- Next: continue checkout visual review.


## Current handoff — clear practice setup submission

- Local setup preview now says Finish preview and explains before clicking that nothing is sent.
- Completion confirms device-only storage and links to real account sign-in; real setup submission remains unchanged.
- Typecheck passed; browser verified completion and no account submission request.
- Production was published in the prior block; this change clarifies the local preview.


## Current handoff — production published

- User explicitly authorized production publishing; Vercel deployment succeeded for commit 579bff3.
- Production URL: https://ai-receptionist-two-azure.vercel.app (deployment 4kPeZsXdijqKtUwxAd2UmmLHKfRf).
- Production build and all 74 automated tests passed; internal tools excluded.
- Live routes respond through the existing site password gate; local credentials unavailable for authenticated smoke testing.
- Application commits synced to GitHub; two unrelated research documents remain untracked and were excluded from deployment.
- Next: user testing through the normal sign-in/account flow; preview-only screens remain local.


## Current handoff — roadmap phase sidebar

- Replaced roadmap cards with phases on the left and the selected checklist on the right.
- Kept existing saved checkbox progress and per-phase counts.
- Verified phase selection, keyboard navigation, saved progress and mobile width.
- Next: continue visual review. Prior publishing restriction remains.


## Current handoff — simplified hamburger menu

- Removed Home from the shared marketing hamburger menu.
- Features and Demos remain; mobile retains the homepage section anchors.
- Next: continue navigation review. Prior publishing restriction remains.


## Current handoff — choose a plan before checkout

- Removed Get started from the hamburger menu.
- Account, footer and general marketing CTAs now lead to Plans instead of directly to /start.
- Individual plan checkout links remain unchanged.
- Typecheck and browser navigation checks passed; prior publishing restriction remains.


## Current handoff — anchors and site menu

- Moved the marketing mascot to the far left with How it works, Industries and Pricing anchors alongside it.
- Added a hamburger menu for Home, Features, Demos and Get started across marketing pages.
- Mobile includes homepage anchors in the menu; Escape and outside-click behavior retained.
- Typecheck passed; browser verification covers placement, page navigation, Escape and mobile anchors.
- Next: continue visual review. Prior publishing restriction remains.


## Current handoff — consistent marketing navigation

- Marketing layout now shares the homepage navigation and footer across home, features, demos, legal and privacy opt-out pages.
- Removed separate page headers/footers and the Overview link; fixed cross-page homepage anchors.
- Secondary pages reserve header space and render dark navigation text immediately.
- Typecheck passed; verified identical navigation/footer destinations on all five pages, plus mobile menu and width.
- Media canvas was completed and committed separately. Prior publishing restriction remains.


## Current handoff — simple media canvas

- Replaced the campaign presentation with rows of 11 photos and one playable video, with short labels and original-file links.
- Verified all images load, video metadata loads and mobile has no horizontal overflow.
- In progress: standardizing marketing headers and footers across pages.


## Current handoff — reference-led visual system

- Inspected the ZERO reference screenshot and source; its content was inside an iframe, not blank.
- Rebuilt the visual system around its full-height editorial hero, slim rail, muted two-tone headings and numbered sections.
- Retained AI Receptionist fonts, green palette, character and working controls; added large glyph specimens, navigation, motion, accessibility and token sections.
- Verified all 13 section targets, sidebar clicks, and no horizontal overflow at 390, 768 and 1440 px.
- Next: user visual review. Prior publishing restriction remains.


## Current handoff — Page Index is the page directory

- Removed the Pages dropdown, its search panel and keyboard shortcut from the Internal tools bar.
- Kept the Page Index link and workspace shortcuts in the burnt amber navigation.
- Verified that every catalogue entry appears in the Page Index.
- Next: continue internal workspace review; earlier publishing restriction remains.


## Current handoff — burnt amber internal navigation

- Changed the Internal tools bar from burgundy to burnt amber (#85451F).
- Matched the menu, selected states, focus rings and supporting text to the warm palette.
- Kept the existing navigation layout and site brand colours.
- Next: continue visual review of the internal workspace.


## Current handoff — unified internal workspace

- Combined marketing checklist and roadmap into six phases with 24 review tasks, per-phase progress and browser persistence; old checklist links still work.
- Built /__dev/design-system with shared brand fonts, colours and dropdown styles, plus interactive examples and the current mascot.
- Moved workspace shortcuts into the thin Internal tools bar across local pages; added design system and roadmap to the Page Index.
- Verified fonts, tokens, toolbar links, saved progress and mobile width in Chrome; all four preview tests passed.
- Reference URLs on port 3035 rendered blank; used the supplied navigation screenshot and the existing brand styles.
- Committed locally. Publishing remains blocked by the earlier automatic approval review.


## Current handoff — Page Index refresh

- Added workspace shortcuts and a compact checklist view sharing page completion status.
- Added real screenshots for welcome/setup, hours and review cards; refreshed their labels and anchors.
- Deleted the Marketing V2 page, removed its catalogue entry and replaced campaign links with the homepage. Shared imagery is retained.
- Preview tests: all four passed; toolbar height and menu search/Escape checked in Chrome.
- Changes stay local; earlier automatic approval review blocked publishing.


## Current handoff — thinner internal toolbar

- Reduced the toolbar from 56px to 40px, renamed the badge Internal tools and removed the path field/Go action.
- Updated sticky offsets and menu position; Pages search, Page Index and keyboard navigation remain.
- Browser checks passed for height, removed controls and menu search/Escape.
- In progress: Page Index shortcuts and fresh screenshots for the completed setup screens.


## Current handoff — compact setup header

- Compacted the sticky setup stepper to a 52px desktop row, with smaller step markers and inline save status; reduced the gap before content.
- Adjusted anchor clearance and retained mobile wrapping, keyboard targets and save feedback.
- Removed the brand-color picker and visual preview from onboarding; retained the existing/default color internally for configuration compatibility.
- TypeScript and browser checks passed for desktop/mobile height, section clearance, removed color controls and no horizontal overflow. Local only.


## Current handoff — time controls and location timezone

- Replaced browser time spinners with editable AM/PM fields and a compact branded 15-minute picker, including keyboard navigation, Escape, validation and end-of-day midnight.
- Time zone is now labeled Location time zone with regional labels and per-location guidance; stored timezone identifiers still handle daylight saving.
- Browser checks passed for typing, picker selection, invalid input, keyboard controls, autosave restoration and mobile width; TypeScript passed.
- Next: remove brand-color customization from current onboarding. No publishing attempted.


## Current handoff — editable weekly schedule

- Replaced the duplicated hours controls/static preview with a full-width weekly editor: day checkboxes, All day, draggable opening/closing handles and manual time fields.
- Each day saves independently in 15-minute increments; All day is 00:00–24:00. Keyboard sliders and horizontally scrollable mobile week retain manual access.
- Added validated weekly hours to final configuration and autosaved drafts, with legacy schedule fallback. Booking slots, customer hours, admin summaries and initial phone schedules now read per-day hours.
- Browser checks passed for dragging, keyboard/manual edits, closed days, all-day, reload restoration and mobile width. TypeScript plus 24 schedule/platform/phone tests passed, including midnight boundaries.
- Changes committed locally; no live account, phone routing or deployment changed. Prior publication restrictions remain.


## Current handoff — simpler onboarding and saved drafts

- Simplified new onboarding to one business number and one shared appointment schedule; replaced team editing with appointment length and renamed Hours & availability.
- Added AI answering preferences (always, after hours, backup, caller choice, confirmations only, no AI or undecided). Stored in configuration for setup review; does not activate live phone routing.
- Added debounced, serialized account draft saves with status/retry and owner/origin/configuration guards. Incomplete drafts stay separate from final setup. Local preview restores from browser storage.
- Added Photon/OpenStreetMap address suggestions with manual entry and failure fallback; clarified contact number versus dedicated AI area code, and showed the actual booking-card color accent live. Photon is a public best-effort service (https://github.com/komoot/photon#demo-server); replace with dedicated hosting if volume grows.
- Phone/provider and appointment-book questions now allow unknown/no-service/no-system, with optional conditional details. No extra software purchase required to finish onboarding.
- TypeScript, local browser restoration/validation/mobile checks, unsigned/cross-origin draft API guards, mocked signed-in failure/retry/submission ordering, and a public address-service/CORS check passed. No real account data or calls changed. Local only; publishing restrictions remain.


## Current handoff — shared dropdown standard

- Added a global native dropdown standard: 16px chevron, 14px inset, reserved text gutter, 44px minimum height and 12px corners. Removed the calculator-specific duplicate.
- Retained surface colors, keyboard/native selection, high-contrast fallback and RTL placement. Widened team duration fields for the shared spacing.
- TypeScript and browser checks passed across ten setup, homepage and Features dropdowns, plus mobile and forced-color modes.
- Next: address suggestions, phone-field explanation and live brand-color placement preview. No publication attempted.


## Current handoff — simplified welcome content

- Moved Get help alongside the welcome heading and removed the separate support strip.
- Changed the introductory CTA to Get started to avoid repeating the setup heading.
- Restarted the managed preview and verified one application main/heading with the embedded setup flow, rather than the duplicated shell shown in the screenshot.
- TypeScript and browser checks passed for same-page navigation, review updates, validation and mobile layout. Local changes only; prior publishing restrictions remain.


## Current handoff — setup lives on the welcome page

- Embedded all three setup sections directly below the welcome information on /account, sharing one application shell and one sticky section stepper.
- The welcome CTA now scrolls to Business details on the same URL; Next and Edit scroll between sections. Removed the duplicate decorative step list.
- Paid customers receive their own plan/configuration in the embedded form; pending/billing states do not expose setup. Older setup preview URLs redirect to the matching welcome-page anchor.
- TypeScript and browser checks passed for one main/heading, same-page CTA, section navigation, live summaries, validation, preview submission and mobile overflow.
- Changes are local and committed; publishing remains subject to the prior approval restriction.


## Current handoff — continuous anchored setup

- Replaced separate setup screens with one continuous form and sticky section links for Business details, Hours & team and Review & setup.
- Section links and Next/Edit buttons scroll with header clearance; the active section follows scrolling, with reduced-motion support.
- Review updates as fields change; final submission validates all sections and focuses missing fields. Existing account submission and preview safeguards remain.
- TypeScript and browser checks passed for anchors, live review, validation focus, preview submission and mobile overflow. Changes available locally; no deployment attempted.
- Public GitHub push and Vercel publication remain subject to the previously recorded approval restrictions.


## Current handoff — built setup steps 2 and 3

- Built Hours & Team with selectable days, hours, time zone, editable team members and a live weekly preview using the application fonts and spacing.
- Built Review & Setup with editable summaries, preparation/testing guidance and the existing authenticated submission endpoint. Back/Edit preserves entered details.
- Added local step previews to the Page Index and connected the welcome preview to the wizard. Preview submissions do not write account data.
- TypeScript and browser checks passed for validation, edit persistence, team limits, review, preview submission and mobile layout. Local preview refreshed. Production deployment was rejected by automatic approval review because this turn authorized building rather than publishing to Vercel.
- Public GitHub push remains blocked by prior approval review; direct Vercel publication is the authorized path.


## Current handoff — hours/team and review concepts

- Reviewed the existing combined business setup form; hours/team fields exist but a separate review step does not.
- Created two visual concepts in design/purchase/onboarding: Hours & Team with a weekly preview, and Review & Setup with editable summaries and a preparation/testing explanation.
- Added implementation notes mapping the designs to existing fields, plan limits, payment guards and concierge setup flow. No automatic-launch claims or application changes.
- Next: implement the chosen direction with preserved form state and the existing submission endpoint. Public GitHub push remains blocked by prior approval review.

## Current handoff — full-width app header

- Removed the shared app header width cap and outer shell gutters; header now spans the browser with inner control padding.
- Main content stays centered; preserved mobile content gutters and sticky navigation.
- Browser checks passed at 1920, 1462 and 390 pixels: header begins at zero, matches viewport width and introduces no horizontal overflow.

## Current handoff — account settings

- Added /account/settings with Profile, Sign-in & Security, Billing, Notifications, and Privacy & Account sections, sharing the app header/fonts. Linked from avatar/hamburger and Page Index.
- Profile name saves through an owner-scoped, same-origin endpoint with optimistic configuration comparison; avatar initials update. Email changes, data copies and closure are explicitly support requests; essential notices stay enabled.
- Existing Stripe portal and sign-out remain the real controls. Local /account/settings?preview=settings allows design review; preview edits do not write account data.
- TypeScript, browser navigation/profile-preview/mobile checks and unsigned/cross-origin API rejection passed. No real account data modified. Published via Vercel (2ph0txrc9); production build passed. Public GitHub push remains blocked by prior approval review.

## Current handoff — welcome viewport fit

- Account shell now subtracts the local toolbar height from its minimum viewport height, removing artificial overflow.
- Welcome spacing and mascot size adapt to shorter laptop heights; content is never hidden or clipped.
- Browser checks passed with the toolbar loaded at 1462×1167, 1440×900, 1366×768, 1280×720 and 1280×650: document height equals viewport height. Mobile remains scrollable and accessible without horizontal overflow.
- Published via Vercel (11esvgm33); production build passed. Public GitHub push remains blocked by the earlier approval review.

## Current handoff — simplified welcome screen

- Replaced the large setup mascot with a generated pointed speech-tail variant, preserving the existing original asset.
- Moved the sticky application header to the top and removed its green pill background, border and shadow.
- Greeting is now Welcome plus first name; removed local preview banner, paid-plan subtitle and purchase card. Removed the unused dashboard invoice fetch; receipt email/Billing remain available.
- TypeScript and browser checks passed for the actual local page, new image, removed content, plain header, mobile layout and menu. Published via Vercel (rhvs6y9qx); production build passed. Public GitHub push remains blocked by prior approval review.

## Current handoff — shared sticky application navigation

- Shared account header now keeps the mascot far left, hamburger navigation beside a personalized initials avatar at the far right, and stays sticky while scrolling.
- Overview, available Billing, help, Privacy, Terms, Contact and site return live in the hamburger menu. Avatar menu shows the name and sign-out. Removed the separate legal footer.
- Applied to confirmation, setup and the owner dashboard; local toolbar supplies a sticky offset. TypeScript and browser checks passed for desktop/mobile, Escape/outside dismissal and scroll positioning.
- Public GitHub push remains blocked by the earlier approval review. Published via Vercel (1vtksamf8); production build and development-asset exclusion passed.

## Current handoff — directly reviewable confirmation page

- Added /account?preview=confirmation for local development only, rendering the actual PurchaseWelcome component with clearly labeled fictional payment details.
- Added Payment confirmation to the Page Index so design review does not require owner sign-in. Normal account access remains authenticated; the production branch cannot render sample data.
- Verified the real local URL without authentication, receipt total, setup link and mobile layout; TypeScript passed. Restarted the managed preview to load the catalogue.
- No emails or payments sent. Public GitHub push remains blocked by earlier approval review.

## Current handoff — confirmation reference refinement

- Matched the supplied confirmation reference with stronger Apfel headings, a larger floating mascot, pill navigation/buttons, tighter receipt spacing and a chat support icon.
- Matching receipt email uses the bold brand heading; verified Stripe amounts and account/setup behavior are retained.
- TypeScript, five receipt tests and desktop/mobile browser checks passed using fictional data. No emails or payments sent.
- Published the refined page at https://ai-receptionist-two-azure.vercel.app (3ohto8se4); production build passed. Public GitHub push remains blocked by the earlier approval review.

## Current handoff — restored workspace preview

- Canvas loading investigation found the local preview service stopped; both homepage and page index were unreachable.
- Restarted the existing managed workspace preview on port 3101 and verified both addresses return HTTP 200.
- Existing browser tabs can be refreshed; no additional tabs were opened. The service lasts until stopped or logout.

## Current handoff — branded purchase confirmation

- Built the approved payment-confirmation dashboard with the homepage’s Apfel Grotezk/Open Runde fonts, centered current mascot, white background, soft corners and spacing; account/setup shares the same shell.
- Receipt details come from the original verified Stripe invoice and preserve historical setup charges. Pending payments cannot open setup or display a paid receipt.
- Paid welcome jobs now render a matching HTML/plain-text receipt email with an attached mascot; existing queue/idempotency remains. No test emails or payments were sent; inbox delivery is not yet verified. Email fonts fall back where remote fonts are blocked.
- TypeScript, five receipt tests, isolated desktop/mobile dashboard checks and email rendering passed. Published to https://ai-receptionist-two-azure.vercel.app (du2pzs8a1); production build and development-asset exclusion passed.
- Public GitHub push remains blocked by the earlier approval review; direct Vercel deployment is the authorized publishing route.

## Current handoff — mark pages done

- Each page-index card now has a prominent outlined checkbox and a separate Mark as done control; checked cards show Done with green highlighting.
- Choices persist in this browser and can be unchecked. Card navigation remains separate from completion controls.
- Browser verification passed for toggling without navigation, reload/search persistence, keyboard reversal and mobile layout.
- Dashboard/receipt design remains a concept for review; no private receipt emails were sent.

## Current handoff — visual page index

- Page index is a responsive 1,600px board with rounded cards and actual first-screen screenshots above page titles.
- Captured 12 anonymous public pages, including the marketing hero, signup, demo homepages and booking pages. Private pages keep sign-in labels; no private data was captured.
- Search/sort/access metadata retained. Added reproducible capture script and development-only thumbnail routing.
- Desktop/mobile browser checks and preview access tests passed; opened /__dev/pages in the workspace.
- Sign-in and flat setup checkout changes are published at https://ai-receptionist-two-azure.vercel.app (deployment e3h8yyewj). Vercel build, TypeScript and development-asset exclusion checks passed. Dashboard/receipt redesign remains an image concept pending review.

## Current handoff — simplified new checkout pricing

- New Front/Busy setup is $89; Full desk remains $499. Storefront and review use one exact first-payment total. Historical paid/issued checkouts retain their agreed amounts.
- New Stripe checkout includes only the monthly plan and one-time setup; optional metering is connected before enabling a positive spending limit. Existing metered subscriptions remain supported.
- Applied tested flat-checkout reservation migration to the existing test-mode Supabase project. Versioned Stripe setup prices are created/reused at new checkout.
- Pricing/subscription/invoice unit checks, disposable PostgreSQL owner/idempotency/payment checks and TypeScript passed. No payments were submitted by the agent.
- Deployment is next. Mid-cycle extra-minute billing still needs a sandbox invoice acceptance test before live billing.

## Current handoff — confirmation design concept

- Created design/purchase/confirmation-and-receipt-concept.png with the current mascot, homepage palette, rounded navigation and a matching receipt email.
- Design only: dashboard and email code have not been changed. Receipt values must come from the actual paid invoice, not the illustrative $488 shown in the concept.
- New setup pricing and visual page-index cards are in progress; $89 applies to new Front/Busy purchases, Full desk remains $499 pending user direction.

## Current handoff — consistent sign-in link

- Signup now asks for a secure sign-in link and shows a check-your-email screen; removed the misleading code field and obsolete OTP endpoint.
- Clicking the existing email link verifies the account and returns to purchase review with the selected plan and details retained.
- Typecheck and isolated browser/server verification passed, including step labels, resend cooldown, return link and mobile layout. No real emails or payments were sent.
- Next: simplify Stripe checkout, change Front/Busy setup to $89, confirm Full desk setup, and publish. User is also checking sandbox card entry.

## Current handoff — published to Vercel

- Published production deployment ai-receptionist-ingb3r3re-bubs-1063s-projects.vercel.app, aliased to https://ai-receptionist-two-azure.vercel.app.
- Vercel production build, TypeScript and development-toolbar exclusion checks passed. Added root-scoped upload exclusions for local references and secrets.
- Existing SITE_GATE remains enabled; verified the live URL reaches the private preview gate. Production lists Turnstile keys, unlike local preview.
- Live signup/email delivery remains unverified. Approval review blocked a login using the default preview password; obtain explicit authorization before attempting that login.
- Approval review also rejected exporting production secrets; no export was performed. Supabase email-template configuration could not be accessed, and no remote auth settings were changed.
- Direct Vercel publication succeeded without a public GitHub push. Next: authorized preview login and email-template/delivery verification.

## Current handoff — visible typing cursor

- Form fields now use their text color for the caret instead of inheriting the pale scrollcraft accent.
- Verified dark green cursor against white in name/email fields; forced-color mode uses the system text color.
- In progress: user requested publishing and reported the disabled verification button. Production has Turnstile keys; checking authentication delivery before deployment.

## Current handoff — verify email within purchase step one

- Name/email now sends a six-digit code within Your details. Verification stays on step one; step two is purchase review with Continue to payment.
- Added server-side Supabase OTP verification and HTTP-only session cookie; invalid codes cannot advance or authenticate checkout. Selected plan, return destination and entered name are retained.
- Added paste/autofill support, code focus, edit details and 60-second resend cooldown. Existing magic-link sign-in remains compatible.
- Supplied docs/auth/passwordless-email.html and deployment instructions. Remote email template and Turnstile configuration still need applying; no live emails or payments were sent.
- Typecheck/diff checks and isolated browser/server tests passed: invalid/valid codes, cookie, step labels, retained edits, mobile width, payment handoff and foreign-origin rejection.
- Complete locally; public push remains blocked by earlier automatic approval review.

## Current handoff — soft site-wide page transitions

- Added a shared route transition using the installed Next/React ViewTransition support plus native same-origin document transitions.
- Pages dissolve with 160ms exit and 240ms entrance; no positional movement, navigation delay, or click interception.
- Reduced-motion setting makes transitions effectively instant; unsupported browsers retain normal navigation.
- Browser verified actual enter/exit animations for client and document navigation, retained selected-plan return position, mobile width and zero page errors. Typecheck and diff checks passed.
- Both navigation tasks are complete locally. Public push remains blocked by earlier automatic approval review.

## Current handoff — retain pricing origin and selected plan

- Checkout links retain the pricing source URL, including preview parameters, and chosen card; Back to plans and Change return there.
- Plan selection survives email verification; source URLs are restricted to local pricing surfaces.
- Added card anchors/focus and restore after homepage scroll layout settles, avoiding stale pre-layout positions.
- Verified desktop return positions and navigation helper tests; typecheck passed. Standalone /pricing is not currently a route, but the return helper preserves it when added.
- Next: site-wide subtle page transitions requested while this fix was in progress. Public push remains blocked by prior approval review.

## Current handoff — purchase first, business setup after payment

- Rebuilt /start as a white, rounded two-column signup: name/email → purchase review → existing Stripe Checkout; selected plan and transparent fees remain visible.
- Preserved verified-email authentication, selected-plan return and same-browser name retention. Local preview is missing Turnstile configuration, so no verification bypass or live purchase was attempted.
- Added identity-only customer creation; moved business/hours/phone/team fields into /account/setup after confirmed active payment. Dashboard and welcome emails now direct paid customers to setup.
- Prevented unfinished business activation/provisioning and protected purchased plans from setup edits. Fixed development-only localhost/127.0.0.1 form-origin mismatch without relaxing production checks.
- Verified desktop/mobile, editable review, isolated fake-data signup/payment-state/setup/callback checks, 16 focused tests and typecheck. Annual offer is still pending; existing Stripe payment guards are unchanged.
- Saved locally. Public push remains blocked by the earlier automatic approval review. Next: review this page, configure email verification and test Stripe end to end, then refine the post-purchase dashboard.

## Current handoff — setup location and hours concept

- Created design/signup-location-hours-concept.png and saved its built-in image-generation prompt.
- Next flow screen covers address, timezone, selected opening days and shared team hours, matching supported onboarding fields.
- Selected plan stays visible; setup is divided into location/hours, phone setup and team/services.
- Concept only; live code unchanged. Next image: phone setup, then team/services, review/payment and dashboard, one at a time.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — post-plan signup visual concept

- Created design/signup-next-screen-concept.png using the built-in image tool; exact prompt saved alongside it.
- White two-column business-details screen, three-step progress and selected Busy desk summary with current setup pricing.
- Concept only; live signup code unchanged. Use approved mascot artwork when implementing.
- Next: user reviews direction before further signup design work; annual pricing terms still pending.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — recommendation styled as a pricing card

- Suggested plan is now a separate rounded card below the sales preview, using the main pricing cards’ backgrounds, borders and type hierarchy.
- Standard plans show base price, included minutes, team limit and estimated extra usage; Custom / Enterprise shows Let’s talk and pricing by scope.
- Action remains beneath both cards; recommendation updates and signup/custom routing are unchanged.
- Verified custom and Busy appearances, live changes and mobile widths; typecheck and diff checks passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — keep result action beneath card

- Generated plan signup and custom-plan actions now share the area beneath the preview card with the initial Find my plan button.
- Card contains only sales and recommendation information; payment reminder sits with the external action.
- Verified signup/custom destinations and rendered card/action separation; typecheck and diff checks passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — select and adjust calculator numbers

- Double-click selects the entire value in all three numeric calculator fields for replacement.
- Up/Down changes values by one within existing bounds; wheel scrolling still never changes values.
- Verified full selection, replacement typing, both arrow keys and wheel behavior in each field; typecheck and diff checks passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — no scroll-based number changes

- Calculator numeric fields now use text inputs with decimal/numeric mobile keyboards; scrolling and arrow keys do not increment values.
- Added worked examples beneath average sale and extra bookings, matching the call-minutes guidance.
- Preserved numeric/range validation, including call minutes, without coercing partially typed values.
- Verified wheel/arrow behavior on all three fields and valid/invalid plan gating; typecheck and diff checks passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — blank editable sales inputs

- Average sale and extra bookings now start blank; industry selection supplies only a placeholder hint, never a prefilled sale.
- Inputs preserve typed text instead of forcing empty bookings back to zero; sale values allow cents.
- Result waits for both valid values; explicit zero bookings remains a valid scenario.
- Verified blank/selected states, clearing, replacement typing, decimals and zero; typecheck and diff checks passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — aligned calculator dropdown chevrons

- All three calculator dropdowns use the same centered 16px chevron with a 14px right inset and reserved text space.
- Native select behavior remains; forced-colors mode restores the native arrow.
- Verified matching computed placement, working selections and mobile layout with no overflow; diff check passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — no default industry

- Industry dropdown starts at Choose your industry, with no prefilled business or sale value.
- Industry callout is hidden until selection; preview prompts for an industry instead of displaying a default estimate.
- Verified empty initial state, training benchmark/estimate after selection, and blank fee for custom-value categories; typecheck and diff checks passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — clearer industry heading and research note

- Removed the repeated industry-selection instruction beneath Your business value; retained the accessible field label.
- Styled industry context as a softly bordered rounded note with a small information icon and its existing source link.
- Verified industry switching, source link, single note and no mobile overflow; typecheck and diff checks passed.
- Saved locally; public push remains blocked by prior approval review.

## Current handoff — complete questions then live recommendations

- Both left-side sections remain open; Find my plan now sits beneath the right-side sales preview and waits for all required answers.
- After generating once, every edit automatically updates sales, suggested plan, estimated cost and signup destination without another click.
- Incomplete required inputs suppress the plan CTA until restored; no stale recommendation can be submitted.
- Verified Front-to-Busy-to-Custom updates, sales changes, empty/restored inputs, mobile widths, typecheck and diff check.
- Saved locally; public push remains blocked by prior approval review. Annual pricing terms remain pending.

## Current handoff — reference-inspired guided value layout

- Adapted the supplied reference into a two-step vertical timeline with left-side controls and a live right-side sales/plan preview.
- White modal, fine borders, muted upcoming step and completed-step edit action; all entered values remain when moving between steps.
- Retained sourced industry context and existing recommendation/signup logic; mobile stacks the preview below the form.
- Verified live calculation, Busy desk route, retained edits, Escape dismissal and mobile widths; typecheck passed.
- Saved locally; public push remains blocked by prior approval review. Annual pricing terms remain pending.

## Current handoff — simpler industry-first value flow

- Rebuilt calculator on white with three first-view controls: industry, collected sale and extra completed bookings; one gross-sales result.
- Added sourced salon, personal-training and photography benchmarks above the controls; other categories require actual fees rather than invented industry averages.
- Plan matching is a separate step requiring explicit team, minutes and locations; CTA now says Review [plan] & sign up and retains selected-plan routing.
- Removed old arbitrary ticket defaults and crowded comparison tables; research notes record scope, sources and limitations.
- Verified scenarios, disabled incomplete estimates, Busy/custom routing, white background and mobile layout; annual offer remains pending.
- Saved locally; public push remains blocked by prior automatic approval review.

## Current handoff — value modal and recommended plan funnel

- Removed the large inline value calculator; each of four plan cards now has a small link opening one shared, scrollable modal.
- Calculator recommends the lowest estimated-cost tier fitting team size and call minutes; its CTA passes the selected tier to the existing signup/checkout flow.
- Multiple locations, teams above 20 and usage above the supported spending limit lead to a custom-plan conversation.
- Verified four triggers, dynamic Busy desk recommendation, custom routing, Escape/close, focus restoration and mobile layout without page overflow; typecheck and eight pricing/value tests pass.
- Annual offer still awaits the owner’s discount/setup decision. Public push remains blocked by earlier automatic approval review.

## Current handoff — pill buttons and pricing value

- All shared buttons and CTA links use full pill corners; verified all 16 homepage buttons and mobile layout with no page overflow.
- Added researched, editable appointment-value comparison across three plans and ten industries; examples are explicitly illustrative except the sourced salon median.
- Added Custom / Enterprise inquiry card and moved setup amounts into each paid plan with first-month totals.
- Typecheck, eight pricing/value tests and diff checks passed.
- Annual billing remains pending the owner’s discount and setup-fee decision; no annual prices or savings invented.
- Saved locally; public push remains blocked by prior automatic approval review.

## Current handoff — explicit opt-out and footer legal comparison

- Added a dedicated /do-not-sell-or-share-my-personal-information draft page and explicit footer link; preference control is clearly inactive.
- Compared Lovable footer and added enterprise terms, copyright/takedown and abuse-reporting placeholders; omitted unrelated desktop/domain/community terms.
- Expanded sourced lawyer checklist with conditional DMCA process and optional SOC 3, ISO 27701 and CSA STAR assurance review; no compliance or certification claims.
- Typecheck, diff check and all 26 footer destinations verified; mobile opt-out has no overflow and is noindex.
- Complete locally; approved policies, actual controls and evidence still need legal/operational review. Public push remains blocked by prior approval review.

## Current handoff — legal, trust and social placeholders

- Added 18 legal/privacy/security topics and four social placeholders to the footer, linking to an explicitly temporary /legal hub with noindex.
- No certification badges, fabricated contacts, functioning preference claims or approved legal terms; each placeholder states pending review.
- Added docs/legal-security-launch-review.md with primary-source research, jurisdiction/applicability questions, operational checks and lawyer sign-off checklist.
- Verified all 22 anchors, desktop/mobile layout and no horizontal overflow; typecheck and diff checks passed.
- Complete locally. Next: lawyer/owner supplies approved policies, verified assurance, actual social profiles and operational contact/rights channels. Public push remains blocked by prior approval review.

## Current handoff — callback, pricing and navigation refinements

- Mascot floats above a modern smartphone with a pointed speech tail; updated callback artwork and description.
- Added sales callback intent and optional preferred time, saved in call summary and owner notification; requests never dispatch an AI call. Added direct signup.
- Replaced pricing grid with rounded plan cards and soft detail panels; all plan data is unchanged. Removed numbered side navigation.
- Passed typecheck and five pricing tests; checked desktop/mobile and mocked callback submission without sending calls or emails.
- In progress: researched legal/security/social footer placeholders and lawyer review checklist. Public push remains blocked by prior approval review.

## Current handoff — distinct industry photography

- Replaced all ten industry photos with new, distinct casts spanning ages and backgrounds; each business has a recognizable setting and its own palette.
- Added a real gym, styled salon, homewares shop, boutique grooming salon, editorial photography studio, dental clinic, physio clinic, auto workshop, office and music lesson.
- New source photos have brighter lower areas, correcting the dark foregrounds that persisted after overlay removal; existing untinted blur and mascot interactions remain.
- Verified all ten images load, inspected the full set and live desktop/mobile cards, and passed typecheck with no mobile page overflow.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — industry overlay verification

- Inspected the live cards and source photos: no remaining dark or colored overlay is rendered.
- Verified all 11 cards on desktop and mobile; the bottom blur layer is transparent.
- Opened a fresh workspace preview at the industry section; natural shading remains in the original photos.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — untinted industry blur

- Removed all industry-card dark and mint gradient overlay rules; disabled the overlay pseudo-element.
- Kept only the progressively revealed Gaussian-blurred copy of each original image, preserving original colors.
- Verified no overlay and active 16px blur/mask at desktop and mobile sizes.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — dressed mascots and bright industry cards

- Applied seven wardrobe looks across ten industry cards: medical, apron, groomer, camera, tool belt, glasses and fitness sweatband, based on approved pillow and wardrobe references.
- Rendered generated artwork through approved master alpha mask to keep the silhouette clean; web-optimized assets saved in public/marketing/mascot-wardrobe.
- Enlarged mascots from 68px to 156px (2.3x), reduced callout text/padding and rounded every callout corner.
- Replaced dark card gradients with a soft blurred image bottom, light tint and dark readable text.
- Desktop/mobile checks passed, all ten outfit images load, no horizontal overflow; typecheck passed. Call-section image and elegant footer committed in preceding task.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — call section and footer redesign

- Created original mascot-and-telephone artwork and redesigned callback area as a warm split image/form card, preserving submission behavior and simulated/live wording.
- Replaced oversized pinned colophon with an elegant forest-green footer, CTA and grouped navigation.
- Verified desktop/mobile layout, image load, form presence and no horizontal overflow; typecheck passed.
- Industry wardrobe assets are ready; next apply user-requested larger mascots, smaller bubbles and bright blurred card bottoms.
- Local commit only under prior public-push approval block.

## Current handoff — natural brief click wink

- Separated wink and greeting timers: click briefly closes eye then reopens (220ms hold plus fade), while text stays for one second.
- Hover still nods only; repeated clicks rotate short greetings.
- Verified no hover wink, quick click wink, reopened eye with greeting still visible, then greeting dismissal; typecheck passed.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — confirmed mascot interaction

- User explicitly confirmed: hover nods ONLY, click winks and shows a small greeting for one second. Earlier hover-wink interpretations are superseded.
- Separated nod state from wink; wink now follows only the click greeting lifetime.
- Browser assertions passed: hover nod/no wink, click wink/Hi, reset after one second, repeated-click greeting rotation. Typecheck passed.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — direct hover wink correction

- User still saw nod-only hover in embedded browser; tied wink-layer visibility directly to React hover/nod state via inline style and explicit stacking.
- Disabled pointer events on mascot image layers so hover remains on the button.
- Removed wink call from greeting click handler; hover starts wink/nod, clicking cycles greetings.
- Typecheck and browser hover-before-click check passed; compact bubble still dismisses after one second.
- Local commit only; prior public-push approval block remains.

## Current handoff — full-width film and paused blur

- Removed playback contain rule so video fills the background edge to edge; fullscreen retains the complete frame.
- Added soft bottom gradient blur while paused or showing poster, using the current paused frame so it stays aligned when seeking. Playback removes blur.
- Verified cover sizing and blur states at 1967px and 390px, including play/pause; visually inspected smooth bottom blur.
- Earlier mascot hover and small one-second bubble refinements are committed.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — compact mascot greetings

- Made hover wink explicit through pointer/mouse state so it does not depend on hover media detection.
- Reduced greeting bubble to 11px text and 6px/10px padding; starts fading after one second.
- Browser verified hover without click, 34x26px Hi bubble and automatic dismissal; typecheck passed.
- Next: edge-to-edge film and paused-state bottom blur requested during this block.
- Local commits only under existing public-push approval block.

## Current handoff — more visible mascot wink

- Mascot now holds its winking eye closed for the full mouse hover instead of a brief animation that is easy to miss.
- Entry nod, click greetings and touch reaction remain; keyboard focus also shows the wink.
- Browser verified wink remains visible after 1.8 seconds and restores on pointer exit; visually checked the rendered 60px mascot.
- Both requested fixes complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — film overlay removed

- Removed the dark gradient over the Happy Paws film on desktop and mobile, keeping text and playback controls.
- Browser verified transparent overlay background at 1440px and 390px.
- In progress: making the mascot wink persist on hover so it is easier to see.
- Local commit only under existing automatic-approval public-push block.

## Current handoff — playful navigation mascot

- Center mascot now winks and nods on hover/focus; clicks cycle eight short greetings beginning with Hi!, with four-second dismissal and Escape support.
- Added generated wink frame; CSS reveals only the eye region over approved master to preserve its exact silhouette and transparency. Full generated backdrop is not used.
- Replaced glossy call pill with flat mint rounded-rectangle Let’s talk button; call behavior preserved.
- Verified animation, greeting sequence, keyboard, dismissal, call popup and 320px layout in browser; typecheck passed.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — navigation placement and account icon

- Moved page links left, kept mascot exactly centered, and changed phone action to Let’s talk.
- Replaced login/signup buttons with a JSON-defined profile icon that gains mint shading and depth on hover; account dropdown supports hover, tap, keyboard and Escape.
- Preserved hero height and scroll-hide/reveal behavior; mobile page menu now opens from left.
- Verified desktop plus 390px/320px layouts, dropdown hover continuity, keyboard focus, call popup and typecheck.
- Complete locally; public push remains blocked by prior automatic approval review.

## Current handoff — taller hero and scroll navigation

- Increased hero height slightly on desktop and mobile.
- Replaced icon navigation with centered mascot logo, right-side text links, phone, login and signup; narrow screens use a links menu.
- Navigation has no backing over hero; after hero it hides scrolling down and reveals with rounded backing scrolling up.
- Verified desktop/mobile rendering, scroll states, menu/Escape and expression sources in local browser; typecheck passed.
- Complete locally; public push remains blocked by prior automatic approval review. Next: user visual review.

## Current handoff — contextual mascot expressions

- Added approved-style transparent listening and delighted Happy Little Pillow expressions.
- Listening appears with call handling and live call states; delighted appears with booking success; welcoming master remains elsewhere.
- Verified all three assets render on homepage; typecheck passed.
- Next: finish the taller hero and centered navigation requested during this block.
- Local commit only under existing automatic-approval public-push block.

## Current handoff — website mascot image update

- Switched all seven mascot img references across five marketing components/pages to approved Happy Little Pillow cutout (mint, padded cheeks, Ivory & Ink eyes).
- Added public/marketing/happy-pillow-mascot.png as exact copy of approved master cutout; removed obsolete mascot multiply blending.
- Typecheck passed; browser confirmed all 15 rendered mascot images loaded, checked mobile industry card and desktop voice dialog (no call started).
- Scope only mascot image references/CSS; layouts, copy, cast sheets and existing dog video unchanged. Old mascot baked into video remains pending separate video update.
- Local commit only under existing automatic-approval public-push block.

## Current handoff — reassurance clears fringe

- User requested head petting and clearing hair from Loup’s eyes instead of hand on body.
- Updated frame 6 in shared board v3: left hand on crown, eyes visible, owner looking down; right hand on phone.
- Updated active page, acting notes and owner brief; previous versions preserved.
- Next: use this interaction for production frames; local commit under existing public-push block.

## Current handoff — reassurance arm correction

- Corrected frame 6 of floral-dress shared acting board: removed horizontal disconnected forearm across abdomen.
- Left upper arm now descends beside torso, left hand rests on Loup’s back; right hand holds phone.
- Updated active image and continuity notes to v2; original v1 preserved.
- Next: maintain readable limb connections in individual production frames. Local commit under existing public-push block.

## Current handoff — approved cast shared acting

- Built six-frame Loup-and-sister acting board using approved floral dress and latest real facial reference.
- Added at #loup-owner-interactions, with downloads; previous acting board archived.
- Added proposed seven-second sequence notes: waiting, nudge, fringe, shake, paw, reassurance.
- These are still storyboard studies. Next: individual production frames and video preparation, preserving right-hand phone and screen direction.
- Local commit only under existing public-push approval block.

## Current handoff — floral dress owner approved

- User accepted the sister floral dress character sheet as good enough to proceed.
- Approval recorded in owner casting brief; preserve this face, dress, hair and necklace direction.
- Latest source photo remains likeness authority; earlier rejected generations remain archived.
- Next: dedicated Loup-and-owner acting frames using approved cast.
- Local commit only under existing public-push approval block.

## Current handoff — sister floral dress sheet

- User requested original floral dress instead of denim and authorized full character sheet.
- Generated sheet from latest real photo and approved Loup reference: five angles, eight expressions, poses and six details.
- Updated #caller and owner brief; earlier portrait and all previous work preserved.
- Unseen dress back/standing hemline are provisional. Latest real photo remains facial authority.
- Next: likeness review and dedicated shared scene frames in floral dress; local commit under existing public-push block.

## Current handoff — sister latest-photo portrait

- User recast Loup owner as sister, rejected first generated sister likeness, supplied latest 11.03.39 AM photo as authority.
- Created one portrait edit from latest photo only; source and portrait shown side by side at #caller.
- Previous owner and rejected sister boards preserved; old shared scenes moved behind archive link.
- Next: likeness review before full sheet and shared acting regeneration; use latest photo, not previous generated faces.
- Local commit only under existing public-push approval block.

## Current handoff — restore correct owner face

- User rejected v5 smile revision as warped and said previous face was correct.
- Restored v4 portrait, full character sheet and shared acting on cast page; denim and bare feet retained.
- Owner brief marks v5 rejected; files and additional source photos preserved.
- Next: preserve v4 facial geometry in any future work; do not use v5 as identity reference.
- Local commit only under existing automatic-approval public-push block.

## Current handoff — owner smile revision

- Reviewed and saved four new smile photos; generated v5 portrait, full sheet and shared acting internally.
- Revised lip shape, tooth display and cheek lift; denim shirt and bare feet retained.
- Updated cast page and smile direction in owner brief; all previous artwork/page versions preserved.
- Next: user smile/likeness review before production scenes.
- Local commit only under existing automatic-approval public-push block.

## Current handoff — owner denim and barefoot styling

- Generated v4 portrait/proportions, full character sheet and six shared acting frames internally.
- Removed facial sunspots and softly rejuvenated complexion; denim shirt, jeans and bare feet replace cream knit/shoes.
- Updated cast page and owner brief; v3 page and all earlier artwork preserved.
- Next: user styling review, then individual production scenes; no finished video changes.
- Local commit only; existing automatic-approval block prevents public repository push.

## Current handoff — owner body proportions revised

- User rejected owner body and supplied five full photos plus two videos. Viewed photos and one frame from each video.
- Generated v3 face/full-body comparison, character sheet and shared scenes using actual full-body references; lighter cream knit and flat shoes show proportions.
- Cast page shows v3, previous page/artwork archived. Likeness and proportions remain for user review; no claim of exact reconstruction.
- Source paths and direction recorded in owner brief; MPO JPGs converted to PNG for generation.
- Next: user likeness/proportion review before video; local commit only under existing public-push block.

## Current handoff — selected woman replaces fictional owner

- User supplied three photos selecting Loup’s owner. Saved originals; generated new portrait, full sheet and six shared acting frames internally.
- First photo sets dark-rooted caramel-highlighted hair; all three guide facial likeness. Cream sweater/jeans retained as scene wardrobe.
- Cast page now shows v2 owner and interactions. Previous owner page/artwork archived intact.
- Owner sheet seated-phone pose swaps hands; caption flags this. Shared sequence and production rule keep phone right hand/right ear. Photos remain likeness authority.
- Next: user likeness review, then final individual scenes and remaining cast. Local commit only under existing public-push block.

## Current handoff — Loup owner and shared acting

- Created realistic fictional owner master, full character sheet and six shared acting frames with Loup using internal imagegen.
- Replaced pending caller block at #caller; added #loup-owner-interactions and downloads. Natural skin texture, cream sweater, blue jeans, phone right hand.
- Shared beats: nudge, fringe covers eyes, shake, paw and affectionate response. Earlier artwork preserved.
- Loup approved extra-fluffy sheet remains coat authority; small owner-sheet poses render it less full. Next: user casting review and individual production frames.
- Local commit only under existing public-push approval block.

## Current handoff — Loup signature behavior

- Bubs approved extra fluffy direction; added twelve visual acting studies at cast-sheets.html#loup-behavior.
- Shows fringe hiding one/both eyes, brief shake clearing it, confused peek and eager owner-directed nudge/paw/lean.
- Saved personality and trigger-driven movement sequence in casting brief; still-image keyframes only, not animation.
- Original and all grooming variants preserved. Next: remaining cast and scene frames using this behavior.
- Local commit only under existing public-push approval block.

## Current handoff — extra fluffy Loup

- Generated stronger bedhead v2: much fuller coat and larger unruly crown tufts across the full sheet.
- Cast page #loup-bedhead now shows v2, with previous variant linked; approved original preserved.
- Updated casting variants. Next: user review and remaining human cast/scene work.
- Local commit only under existing public-push approval block.

## Current handoff — Loup puffy bedhead variant

- Created separate internal-imagegen puffy bedhead character sheet with same extensive panels and Loup identity.
- Added cast-loup-bedhead-v1.png and download at cast-sheets.html#loup-bedhead; approved original and all earlier artwork retained.
- Updated casting brief with both grooming variants. Keep chosen coat consistent within scenes; rear/tail still provisional.
- Next: review variant, finish realistic human cast, then update individual scene frames.
- Local commit only under existing public-push approval block.

## Current handoff — Loup spelling and approved sheet

- Corrected dog’s name to Loup across active cast page, storyboard and briefs.
- Added corrected cast-loup-v1.png; original artwork preserved and #loop links remain compatible.
- Bubs approved this sheet; next is a separate puffy, fuzzy bedhead variant, keeping the same identity.
- Local commit only under existing public-push block.

## Current handoff — Loop character sheet completed

- User requested internal image generation; generated Loop sheet from both supplied photos using internal image_gen (version label not exposed).
- Added cast-loop-v1.png to cast page #loop with download; original photos and Milo archive retained.
- Includes hero, eight rotation studies, eight expressions, six poses, six details, three coat studies and palette. Rotations approximate; rear/tail provisional.
- Next: review Loop likeness, revise human masters and generate scene frames. User prefers internal image generation going forward.
- Local commit only under existing public-push approval block.

## Current handoff — Loop full character sheet requested

- Prepared Loop sheet matching Milo: hero, eight angles, eight expressions, six poses, six details, three coat studies and palette.
- Uploaded both user-supplied Loop photos as confirmed Higgsfield references; saved request and media IDs in loop-sheet-generation.json.
- GPT Image 2.5 submission failed again with out-of-credits response. No generated image or page replacement claimed.
- Next: generate with restored credits or user-approved built-in image generator; then inspect likeness and add sheet to cast page. Existing work preserved.
- Local commit only under existing public-push block.

## Current handoff — Loop replaces Milo; human realism research

- Bubs replaced Milo with her female Shih Tzu Loop. Saved two supplied photos as loop-reference-01/02.png and made them the current cast-page references; old Milo sheet/page archived.
- Updated active storyboard dialogue, scene notes and production notes to Loop; old rendered scene images are explicitly marked pending replacement. Samoyed in the tub remains a separate dog.
- Loop keeps cream-and-white coat, dark muzzle/ears, short legs and current haircut. Drop static/flyaway Yorkie gag; use natural sideways glance/head tilt. Rear/tail details are not established by the photos.
- Completed online human-realism research and saved HUMAN-REALISM.md plus revised close-up-first prompts for groomer and caller. Current human sheets require realism revision.
- No generation this block: Higgsfield credit issue/model-choice question still unresolved. Next: Loop sheet and revised realistic human masters, then cast/scene frames.
- Local commit only under public-push block; unrelated research-reel notes untouched.

## Current handoff — realistic human rendering direction

- Bubs finds current realistic people too plastic and AI-looking; requires detailed complexion, wrinkles, eye colour and hair.
- Researched Adobe photo/prompt guidance and Higgsfield skin-texture guidance; saved sources and a reusable standard in HUMAN-REALISM.md.
- Prepared human-realism-prompts-v2.json for groomer and owner: individual close-up identity portraits before rebuilding dense sheets; specific age/skin/eyes/hair, natural light, no smoothing or exaggerated texture. Original submitted prompts/assets remain preserved.
- Marked current human appearance as awaiting a realism revision on cast-sheets.html. No new generation or credit spending this turn.
- Next: resolve Higgsfield credits/model preference, generate revised human masters, then consistent sheets and remaining cast.
- Local commit only under the existing public-push approval block; unrelated research-reel notes untouched.

## Current handoff — opening film cast sheets

- Bubs approved the Happy Little Pillow master and asked to move to the next phase; started the Happy Paws cast.
- Generated detailed GPT Image 2.5 sheets for groomer, Samoyed and Milo the Yorkie. Added cast-sheets.html with downloads and scene continuity rules, linked from storyboard and mascot page.
- Milo’s owner submission failed because Higgsfield reported out of credits. Exact prompt is saved; async question asks whether to use built-in generation or keep GPT Image 2.5. No answer yet, no automatic model switch.
- Local storyboard upload was rejected by automatic review. Safely used a SHA256-verified existing Higgsfield generation for groomer/Samoyed; no local image exported. Milo is a new written-brief generation.
- Next: finish owner reference when generation route is resolved, then salon/photography/workshop cast and new individual scene frames. Samoyed post-rinse pose looks too dry; use bottom coat strip and enforce wetness in final shots.
- Chrome verified all three 3504px sheets, mobile navigation and no horizontal overflow. Previous assets preserved; local commit only under standing public-push approval block. Unrelated research-reel notes untouched.

## Current handoff — master portrait, refreshed sheets and motion tests

- Created clean Happy Little Pillow master and transparent cutout with mint fur, padded cheeks and Ivory & Ink eyes.
- Updated 36 expressions, 12 love reactions, front/rear 5×19 rotation studies and eight wardrobe looks (aprons, tool belt, medical, glasses; no towel/hairpins). Rotation labels remain approximate, not a measured rig.
- Preserved all previous assets and added character-sheets-before-master-v2.html archive; current character page links both archive and motion lab.
- Added six original signature body-motion sketches, source references, 24–160px comparisons and adjustable overlay on the actual Happy Paws video at motion-lab.html. Facial rig/3D motion remains a future production step.
- Chrome verified desktop/mobile, image loading, playback, controls, interruption, reduced motion and no horizontal overflow.
- Local commit only; prior automatic review block on public GitHub publishing remains. Unrelated research-reel notes left untouched.

## Current handoff — costumes and Our Little Receptionist updated

- Updated six industry looks with Happy Little Pillow cheeks, mint fur and Ivory & Ink eyes.
- Rebuilt Our Little Receptionist overview: hero portrait, orientations, expressions, poses, details and palette.
- Replaced both older page images at #wardrobe and #identity, with full-resolution downloads.
- Earlier expression/rotation sheets still predate eye selection.
- Local commit only; prior public-push approval block remains.


## Current handoff — four mascot palettes

- Updated colour board to original mint, cool aqua, minty forest and sage, with a solid and soft gradient each (eight portraits).
- Preserves approved padded cheeks and Ivory & Ink eyes; hard split two-tone treatments removed from current board.
- Full-resolution image at assets/happy-pillow-colours-ivory.png, shown at character-sheets.html#colour.
- Recorded palette direction in APPROVED-MASCOT.md; original mint remains baseline.
- Local commit only; prior public-push approval block remains.


## Current handoff — updated character, pose and grooming boards

- Replaced character research, 20 poses, and material/grooming boards using approved Happy Little Pillow cheeks and Ivory & Ink eyes.
- Research has 16 panels; grooming has 12 fur treatments, six fibre macros and four face-material close-ups.
- All three full-resolution boards are linked on character-sheets.html at #variations, #poses and #materials.
- Earlier expression/rotation sheets predate eye selection; colour and wardrobe are historical explorations.
- Local commit only; prior public-push approval block remains.


## Current handoff — Ivory & Ink eyes selected

- Bubs chose eye option #5 Ivory & Ink for now: warm ivory sclera, large ink-black pupils.
- Marked selection on character-sheets.html#eyes and recorded it in APPROVED-MASCOT.md.
- Happy Little Pillow body, mint fur and padded cheeks remain approved; open-eye future work should use bottom-center portrait of happy-pillow-eye-studies.png.
- Existing expression sheets still require eye updates before production use.
- Local commit only; prior public-push approval block remains.


## Current handoff — hearts, kisses and eye options

- Added 12 love/reaction studies including heart-eyes, blowing kisses, puckered kisses, loved and starstruck to the existing 36 expressions.
- Added six eye comparisons: ink velvet, amber, midnight blue, cocoa, ivory/ink and teal. Eye direction remains unselected; canonical portrait unchanged.
- Both GPT Image 2.5 sheets are on character-sheets.html#love-reactions and #eyes with full-resolution downloads.
- Unicode historical frequency data informed familiar reactions; no claim of a current popularity ranking.
- Local commit only; prior public-push approval block remains.


## Current handoff — 36 Happy Little Pillow expressions

- Replaced the old 24-expression image with a six-by-six 36-expression Happy Little Pillow sheet, keeping padded cheeks and mint fur.
- Covers warmth, attention, uncertainty, surprise, sadness, winks, tongue, sleep and speech shapes; emoji choices guided by Unicode face list.
- GPT Image 2.5 job 5610efd1-6199-49e5-bb1f-c5c1a6b7c9f4, actual image 2880x2880; accessible at character-sheets.html#expressions with download.
- Pose, material and wardrobe sheets still await approved-identity updates.
- Local commit only; prior public-push approval block remains.


## Current handoff — matching rear rotation sheet

- Added the requested backside companion: five rows, nineteen columns, 95 views, center labelled BACK.
- Generated with GPT Image 2.5 using approved mascot and front layout; job a9ecdac1-dd6a-44dc-8619-6a6152a7ebf8.
- Full-resolution 3840x2160 sheet at assets/happy-pillow-rear-95.png, shown at character-sheets.html#rear-turnaround.
- Tail positions and rotations still drift; visibly labelled as a study. Canonical portrait unchanged.
- Local commit only; prior public-push approval block remains.


## Current handoff — 95-view Happy Little Pillow rotation study

- Generated requested 5-row by 19-column layout, with L90 through R90 labels in 10-degree steps.
- Three GPT Image 2.5 attempts; v3 is linked from character-sheets.html#turnaround and downloadable at 3840x2160.
- Layout count matches, but generated geometry and identity still drift: cheeks, tail, proportions and exact angles need refinement. Page explicitly labels this a visual study, not a measured model turnaround.
- Approved mascot-cuddle.png remains canonical. Other sheets still need updating.
- Local commit only; prior public-push review block remains.


## Current handoff — Happy Little Pillow approved (11 September 2026)

- Bubs selected Happy Little Pillow, specifically liking the padded cheeks.
- Canonical reference is assets/mascot-cuddle.png, generation 62fde102-5b1f-4e78-ba52-a6b91061d8e9.
- Character page now presents the approved portrait; earlier sheets labelled historical explorations. APPROVED-MASCOT.md records continuity rules.
- Next: update robust sheets and storyboard shots against the approved portrait. Homepage unchanged.
- Local commit only; earlier public-push approval block remains.


## Current handoff — cuddly mint refinements

- Replaced rejected personality portraits on the character page with two new GPT Image 2.5 mint refinements.
- Happy Little Pillow has smiling closed eyes and padded cheeks; Joyful Fluff has open eyes and a bounce.
- Original shape retained; prior concepts archived in assets, no homepage mascot replacement.
- Local commit only; earlier public-push approval block remains.


## Current handoff — two mint personality concepts

- Generated Little Mischief and Curious Companion portraits with GPT Image 2.5 using the website mascot reference.
- Added the two images at character-sheets.html#personality, with full-resolution links.
- Exploratory choices only; original website mascot remains unchanged.
- Local commit only; prior public push approval block remains.


## Current handoff — expanded mascot research pack (10 September 2026)

- Added six detailed GPT Image 2.5 sheets: 12 rotation angles, 24 expressions, 20 poses, eight fur/material treatments, 12 colours and 16 design variations.
- Includes open/closed eyes, winks, tongue, sleep, mouth shapes, long/shaggy/puffy fur and two-tone gradients. Existing costume and original identity sheets retained.
- Expanded character-sheets.html into eight full-resolution sections; variants clearly exploratory, website baseline unchanged. Turnaround is an illustrated study, not a rigged geometry guarantee.
- Other cast sheets and final animation remain pending. Local commit only; prior public push approval block remains.

## Current handoff — detailed mascot style and costume sheets (10 September 2026)

- Generated two GPT Image 2.5 sheets using exact website mascot reference: detailed turnarounds/expressions/materials and six wardrobe portraits.
- Wardrobe includes tilted yellow hard hat, salon clips/apron, grooming bandana/towel, camera, mechanic overalls, and plain original. Concepts not yet applied to film.
- Added character-sheets.html with full-resolution viewing/downloads, linked from storyboard header; images load and mobile fits.
- Other human/dog character sheets remain pending. Local commit only; prior public push approval block remains.

## Current handoff — appointment-inspired intro background (10 September 2026)

- Replaced trees/sky in scene 1 with softly blurred frosted-glass appointment shapes in mint and forest green.
- Preserved website mascot identity using both approved opening and website asset as GPT Image 2.5 references; job beec308b-7cba-4091-8fd9-99e00bd7fd68.
- Updated opening action/audio notes; prior sky image retained as history. Character roster work remains pending.
- Local commit only; prior public push approval block remains.

## Current handoff — website mascot identity and sky opening (10 September 2026)

- Source of truth is public/marketing/receptionist-mascot.png: rounded-square speech bubble, mint fur, closed crescent eyes, lower-left tail. Uploaded exact asset as Higgsfield reference a34dabfc-027c-439c-b317-bc62b5375d9e.
- Generated sky/tree opening with GPT Image 2.5 using user screenshot only for setting; added 7-pose mascot sheet linked in viewer.
- Corrected existing mascot appearances using GPT Image 2.5. Rejected collateral changes to non-mascot panels (including wrong dog); viewer uses original non-mascot panels and corrected mascot panels only.
- Other people/dog character sheets and final scene generation still pending. Homepage assets unchanged.
- Local commit only; prior public push approval block remains.

## Current handoff — centered mascot intro (10 September 2026)

- Added scene 1: existing mint mascot centered on near-black forest green, no headline or bubble.
- Notes specify a brief blink/smile, about 1.5 seconds, then incoming ring into the groomer. This is a storyboard frame, not rendered animation.
- Viewer now has 25 scenes; character-sheet-first production workflow remains pending.
- Local commit only; prior public-push approval block remains.

## Current handoff — restore scene viewer (10 September 2026)

- Matched approved-cast-scenes storyboard layout: large scene, Previous/Next, thumbnail strip, action and dialogue; hash links and arrow keys supported.
- Saved four earlier GPT Image 2 sheets as draft visuals only, explicitly not final character references; production brief moved behind a link.
- Confirmed Higgsfield catalog has gpt_image_2_5 and seedance_2_5. User requires mascot sheet first, then every person/dog sheet, then scenes and video. Do not reuse unapproved draft mascot as identity reference.
- Next: generate reference-based mascot sheet with requested 2.5 model, then full character roster. Port 55446 was offline; recovered original layout from saved approved-cast-scenes/index.html.
- Local commit only; earlier public push approval block remains.

## Current handoff — video assets and multi-industry production plan (10 September 2026)

- Added playable/downloadable Happy Paws first cut to Marketing assets, linked a new 24-shot, 65-second multi-industry storyboard.
- Retrieved public X embed: second post demonstrates four-angle character references; full long prompt is truncated. Inspected film frames; distinguish observations from proposed transition/edit workflow.
- Detailed cast/location reference requirements, exact dialogue, camera/action, mascot/graphics timing and per-shot rejection gates; no new footage generated.
- Next: approved character/location sheets, timed dialogue and one difficult motion test before full generation. Existing homepage film unchanged.
- Local commit only; prior public-push approval block remains.

## Current handoff — proof image frame repaired (10 September 2026)

- Restored 8px green padding on all sides of proof images and rounded all desktop frame corners.
- Removed the oversized blurred fill inside the image frame that was bleeding into its padding; preserved the separate Gaussian drop shadow outside the card.
- Browser verified padding, radii and removed fill; visually checked the result.
- Local commit only; previous public-push approval block remains.

## Current handoff — simplified industry copy; alternative layout discussion (10 September 2026)

- Removed top slogans, subcategory lists and bubble labels; cards retain industry, one short benefit and concise dialogue. Glass bubbles are more translucent.
- Replaced white-backed mascot with verified alpha-transparent PNG; removed badge rounding/shadow. First generated background removal failed alpha validation; second passed.
- Typecheck and browser copy check passed. User now wants contextual alternatives to the carousel; proposing industry selector, problem selector or compact directory before replacing layout.
- Local commit only; earlier public-push approval block remains.

## Current handoff — pricing comparison implemented (10 September 2026)

- Replaced homepage #terms pricing cards with the selected comparison-table layout: white/forest, mint Busy desk column, shared features and separate setup/overage details.
- Prices, minutes, team limits, features and setup totals come directly from pricing.ts; billing unchanged. Used actual $199/$399/$749 plans, not erroneous reference-image values.
- Typecheck passed; visually checked desktop, validated all three plan links and mobile horizontal table scrolling without page overflow.
- Local commit only; previous public-push approval block remains.

## Current handoff — minimal pricing concepts (10 September 2026)

- Created two pricing images using real pricing.ts content: A editorial columns, B comparison table. Saved in docs/design/pricing-concepts.
- Verified plan prices, minutes, team limits, setup and overage against source. First B render invented values and was rejected; saved B is corrected.
- Pricing UI and billing remain unchanged, awaiting design selection. Callback concepts were rejected; keep future direction clean and minimal.
- Section 7-to-8 scroll delay fixed in prior commit. Local commit only; earlier public-push approval block remains.

## Current handoff — callback scroll fix (10 September 2026)

- Removed section 7’s three-screen pin and scroll-driven fade; callback form now flows directly into section 8.
- Preserved the form and added normal responsive vertical spacing.
- Typecheck passed; browser confirmed static positioning and zero inter-section gap.
- Local commit only; prior public-push approval block remains.

## Current handoff — industry ending and callback concepts (10 September 2026)

- Added an And many more end card linking to the callback section. Removed the intentionally empty rc-silence full-screen section after the gallery.
- Generated two callback visual concepts for review: friendly mascot/form and glass handset/form; callback design has not been implemented.
- Asked which unused section belongs here; the booking → call → outcome explainer is only a prior recommendation in the available handoff, so its placement remains pending clarification.
- Typecheck and browser verified eleven gallery cards and direct transition to #hear. Local commit only; previous public-push approval block remains.

## Current handoff — smooth film overlays (10 September 2026)

- Headline and scrim remain mounted and fade over 450ms when playback changes; paused copy returns smoothly.
- Play pill now fades instead of disappearing instantly; control bar retains its soft opacity transition. Overlay positioning is consistent across playback states.
- Typecheck passed; browser verified intermediate and final fade opacity. Reduced motion skips transitions.
- Local commit only; previous public-push approval block remains.

## Current handoff — industry stories over the imagery (10 September 2026)

- Moved the example AI conversation and mascot onto each active industry card, with a layered glass bubble entrance. Cards explain what occupies the person and what AI handles.
- Combined medical/dental into one example; ten varied situations remain. Existing photos retained; copy now makes the interruption and benefit explicit.
- Removed the white seam beneath the video by darkening the wrapper below its top corners and overlapping the join by 1px.
- Typecheck passed; visually checked desktop/mobile overlays and confirmed no mobile overflow. Local commit only; previous public-push approval block remains.

## Current handoff — pause overlay and quieter controls (10 September 2026)

- Pausing restores the headline over the current video frame; clicking the video surface toggles pause/resume without resetting its position.
- Compact controls fade to 35% while playing and brighten on hover or keyboard focus; controls remain above the clickable surface.
- Typecheck and browser checks passed for preserved pause position, headline return, surface resume, control pause and opacity.
- Local commit only; previous public-push approval block remains.

## Current handoff — card blur and industry movement (10 September 2026)

- Proof cards now gain 0–18px Gaussian blur in step with their existing fade as the next card covers them; reduced motion disables the added blur.
- Industry intro now translates left at exactly the same rate as its card rail on desktop; removed the inner clipping boundary so cards no longer cut into the heading.
- Mobile/reduced-motion native gallery stays intact. Typecheck passed; browser verified matching transforms and a constant 43px gap during scrolling, plus blur/fade progression.
- Local commit only; previous public-push approval block remains.

## Current handoff — compact player and dark-section finish (10 September 2026)

- Replaced full-width native controls with a centered 600px glass bar: pause/play, time, seek, mute, captions and fullscreen. Mobile fits within 16px side margins.
- Rounded the dark feature/proof block’s bottom corners to 48px to match the film top; clip-path preserves sticky scrolling.
- Typecheck passed; browser verified pause, seeking, mute, captions, desktop/mobile control widths and corner radius.
- Local commit only; previous public-push approval block remains.

## Current handoff — larger film corners (10 September 2026)

- Doubled the film’s top corner radius from 24px to 48px.
- Bottom corners remain square, with no side padding.
- Verified the targeted CSS change; unrelated work preserved. Local commit only; earlier public-push approval block remains.

## Current handoff — industry gallery built (10 September 2026)

- Built the approved white #industries gallery with eleven categories: doctors, dental, healthcare, fitness, personal care, retail, pet services, creative studios, home/auto services, professional services and lessons/coaching.
- Added new people-at-work photographs and one consistent awake, dimensional fuzzy mascot; the branded conversation card changes with the active industry. Desktop scroll pans the gallery; phones/reduced motion use native swipe with buttons and arrow keys. No automatic audio.
- Generated and visually checked all twelve assets, optimized to under 1 MB total. Sources/direction are in docs/design/industries; implementation is industry-gallery.tsx plus marketing CSS. Mobile navigation spacing corrected.
- Verified all images, all eleven categories, keyboard controls, 320/390/1440px fit, reduced motion and production build/dev-tool exclusion. Also verified the other task’s new Happy Paws film in the exact #turn block: playback, captions, native controls and mobile fit.
- Next: Bubs reviews the finished gallery. Suggested placing the separate booking → call → outcome graphic after the video and before Core features; this remains a recommendation. Local commit only; previous automatic public-push approval block remains unresolved.

## Current handoff — film corner refinement (10 September 2026)

- Removed the film wrapper’s side padding; video is edge to edge again.
- Kept 24px rounding on the top corners only, with square bottom corners.
- Cursor-following glass play pill remains intact. Verified the CSS change; separate industry work preserved.
- Local commit only; previous public-push approval block remains.

## Current handoff — rounded film and cursor play pill (10 September 2026)

- Added a parent wrapper with 8px left/right padding and 24px rounded film corners.
- Glass Play me pill follows mouse movement, clamped inside the video; touch and keyboard retain a fixed prompt.
- Typecheck passed; browser verified inset, corners, pointer tracking and keyboard playback.
- Separate industry edits preserved. Local commit only; previous public-push approval block remains.

## Current handoff — full-section film (10 September 2026)

- Made the homepage #turn film fill its section, with white overlay copy and a Play me hover prompt.
- Mobile and keyboard users see the play prompt; starting playback clears the overlay and enables native controls and captions.
- Verified actual playback, typecheck and mobile width; playback contains the full frame to preserve dialogue.
- Preserved separate industry-gallery work. Local commit only; prior public-push approval block remains.

## Current handoff — approved film on homepage (10 September 2026)

- Bubs approved the Happy Paws cut; integrated it into the reserved homepage #turn section, replacing the old confirmation scroll-scrub clip.
- Added on-demand native video controls, poster, English captions and connected-pilot note; chapter now reads Your day back. No autoplay audio or full video preload.
- Typecheck passed; local video metadata/controls verified, no autoplay, and no mobile page overflow. Other in-progress industry changes preserved.
- No deployment or public push; prior approval block remains.

## Current handoff — dimensional mascot correction (10 September 2026)

- Bubs rejected both sleeping eyes and the first open-eye revision, whose glossy features looked pasted onto the 3D mascot. Created v3 examples with smaller recessed eyes and fur-integrated facial shading; awaiting review.
- Updated conversation cards to match the white/forest/mint site styling without cartoon speech tails. Saved three mascot-v3 images and direction notes in docs/design/industries; website unchanged.
- Expanded industry coverage includes doctors, dental, broader healthcare, fitness, retail and other services. Next: approve a consistent mascot treatment before implementation. Prior public publishing approval block remains unresolved; commit locally.

## Current handoff — Happy Paws first moving cut (10 September 2026)

- Built 70.294-second 1080p first cut in docs/design/busy-life/video-v1/happy-paws-first-cut.mp4; review player on localhost:55447.
- Uses approved cast and mischievous Milo, incoming-call greeting before caller reveal, back-and-forth dialogue, narrator and lakeside ending. Seedance 2.5 via Higgsfield.
- Fuzzy dimensional mascot has animated mouth and eyes, separately composited beside exact speech text after combined generations copied reference backgrounds. Rendered animation, not a rigged 3D model.
- Checked dialogue transcript, sampled finished frames, mascot motion and output duration. Next: Bubs reviews first cut; refine scale, voice continuity and edge polish before release.
- No site deployment. Saved locally; prior public-push approval block remains.

## Current handoff — industry mascot conversations (10 September 2026)

- Bubs selected the white industries gallery and wants the mascot to demonstrate customer conversations specific to each industry as cards scroll into focus.
- Generated three reference-based static examples: health confirmation, personal-care booking and creative-studio booking. Saved mascot-*.png and exact prompts in docs/design/industries.
- Each shows one mascot conversation below the active card, clear of faces and labels; incoming booking examples retain the pilot note. Website unchanged pending visual feedback.
- Next: review these examples before implementation. Local commit only; prior automatic approval block on public publishing remains unresolved.

## Current handoff — mischievous Milo (10 September 2026)

- Bubs approved the restored cast and requested wilder reference-like hair and a bratty little dog in scene 4.
- Edited only the caller image through Higgsfield Seedream 4.5: irregular upright flyaways, head tilt, tongue out and paw tugging blanket; preserved caller and room.
- Updated scene 4, overview and gallery; retained earlier raw artwork. Next: review this dog expression before animation.
- Commit locally; earlier public-push approval block remains.

## Current handoff — industries image examples (10 September 2026)

- Created three visual section mockups in docs/design/industries: white, mint and deep-forest horizontal galleries with people working in salons, pet grooming and photography.
- These are generated design examples for review, not final photographic assets. Website remains unchanged.
- Next: Bubs selects or adjusts a direction before implementation; #turn remains reserved for the other task’s video.
- Saved locally; earlier automatic review block on public GitHub publishing remains unresolved.

## Current handoff — restore approved characters (10 September 2026)

- Bubs rejected the recast people in final-scenes; restored the supplied original brunette groomer and lakeside partner as character references using Higgsfield Seedream 4.5.
- Built twelve corrected stills and gallery in docs/design/busy-life/approved-cast-scenes. Samoyed at grooming; crazy-haired terrier beside caller. Terrier is reference-based, not pixel-identical.
- Corrected split-frame generation artifacts, dog scale and hiking footwear; checked finished exports and gallery navigation. No video or production-site changes.
- Next: Bubs reviews this corrected cast and dog treatment before animation. Prior public-push review block remains; commit locally.

## Current handoff — darker core features and preview logos (10 September 2026)

- Bubs confirmed #turn is reserved for the video being produced in the other task; the static confirmation concept is not replacing it.
- Kept the core-feature tabs and parallax layout, deepened the shared charcoal ground while preserving grain, and applied Apfel Grotezk/Open Runde with white/mint heading “Your bookings. Your calls. All together.”
- Rebuilt all ten active feature/proof illustration layers with existing site logos: Solstice’s sparkle on the booking page, AI Receptionist’s phone mark on owner views. Updated preview fonts and removed the booking preview’s fixed call-time/automatic-rescheduling wording. Rebuild with node scripts/render-marketing-previews.mjs.
- Verified all four tabs, keyboard navigation and image loading at 320/390/1440px without overflow; typecheck and production build/dev-tool exclusion passed.
- Next: review #features, then continue the following website sections. Video artwork remains in progress in the other task. Local commit only; the earlier automatic review block on public GitHub publishing remains unresolved.

## Current handoff — individual scene artwork (10 September 2026)

- Built twelve individual 2560×1440 scene exports in docs/design/busy-life/final-scenes, with a one-at-a-time HTML viewer, full script and overview. No video or live-site changes.
- Switched to Higgsfield Seedream 4.5 reference editing for consistent groomer/caller imagery. Milo uses FLUX outpainting of the exact supplied photo; caller close-ups keep him off-screen. Source remains lower-resolution than other frames.
- Added readable glass call/booking treatments, a newly generated open-eyed fuzzy mascot and closing CTA. Corrected unwanted storefront lettering and closing wardrobe; checked exports and viewer navigation.
- Upload of the non-public original mascot was rejected by automatic approval review; it stayed local and a description-based version was used. Public push remains blocked by the earlier review; commit locally.
- Next: Bubs reviews the individual finished stills before animation and voice production.

## Current handoff — Samoyed and wild-haired Milo storyboard (10 September 2026)

- Rebuilt the 72-second, twelve-panel storyboard using Higgsfield Soul 2.0 photography and Bubs’s uploaded wild-haired Yorkshire terrier reference for scene 4; Samoyed remains the grooming customer.
- Created storyboard-v6.html, two visual page PNGs, full script and generation provenance in docs/design/busy-life. Glass call/booking treatments are composed separately; scenes 5 and 7 continue the same washing moment.
- Replaced defective final shots after visual review. These are concept boards: human faces/set continuity and final fuzzy mascot animation still need a production pass before video generation. No site or video changes.
- Next: review the storyboard with Bubs. Commit locally; earlier automatic approval review still blocks public push.
- Latest correction: Milo must look exactly like the supplied photo, including extreme flyaway hair. Saved original as milo-approved-reference.png and used it unmodified in scenes 4, 6 and 8; generated lookalikes are superseded.

## Current handoff — photographic dog casting (10 September 2026)

- Bubs rejected v4's AI-looking images. New direction: Samoyed grooming dog with a natural funny smile; shaggy caller dog in scene 4.
- Researched Samoyed, Polish Lowland Sheepdog and Old English Sheepdog references; switched from GPT Image 2 to Higgsfield Soul 2.0 for three individual photographic casting frames. Prompts, sources and job IDs are in docs/design/busy-life/dog-casting-v5.md and its prompts JSON.
- Review this new casting before rebuilding the remaining storyboard around consistent identities. Existing v4 archived; no new video or site changes. Public push remains blocked by prior approval review.

Handoff notes for the next session. Updated 2026-09-10. Launch is Thursday 1 October 2026;
the dated plan is docs/ROADMAP.md.

## Current handoff — chronological grooming revision (10 September 2026)

- Applied Bubs’s scene notes: beautiful golden retriever opening, hands remain occupied, shaggy caller dog, business-name greeting, no flashback or photographer cutaway, clear voiceover connecting finished work to leaving.
- Generated revised Higgsfield frames (job d04d970b-f84f-404f-b90f-f6a19f8eedc2); saved storyboard-v4.html, two page PNGs, script and exact prompt in docs/design/busy-life. Visually reviewed both sheets. Glass overlays remain production treatments to refine separately.
- Recorded plan for separate photographer, salon, mechanic and other business films after this story is approved. Next: review v4 before video production. Site unchanged; local commit only due to prior public-push approval block.

## Current handoff — researched twelve-shot story (10 September 2026)

- Researched advertising hooks, character goals, narrative engagement, runtime and customer pain points; saved a cited strategy brief in docs/design/busy-life/storytelling-research.md.
- Created a new 72-second, twelve-shot story with caller perspective and a hiking-bag setup/payoff. Generated reference-based 4K stills through Higgsfield (job 0fd98703-3e56-4d38-bd73-7b0b271f8d83).
- Saved storyboard-v3.html, two rendered page PNGs, full script and prompt in docs/design/busy-life; inspected layouts and aligned caller descriptions. Next: Bubs reviews before Seedance video production. No site changes; public push remains blocked by prior approval review.

## Current handoff — production storyboard sheet (10 September 2026)

- Reformatted existing six frames into a traditional three-column, two-row storyboard with timing, action, dialogue and sound/graphics directly below each frame, matching Bubs’s example.
- Saved editable production-storyboard.html and rendered production-storyboard.png in docs/design/busy-life. No new imagery, video or site changes.
- Next: review the complete visual/script sheet before animation. Prior public-push approval block remains unresolved; saved locally.

## Current handoff — reference-based storyboard and script (10 September 2026)

- Created six-frame storyboard through Higgsfield using the original four-frame image as an uploaded reference. Saved storyboard-v2.png, exact prompt and full 30-second script in docs/design/busy-life.
- Sequence establishes busy hands, ringing phone and glance, AI answering, conversation, booking result, then lakeside time off. Mascot direction is open-eyed with restrained glass overlays.
- The earlier 12-second video was rejected for visual drift. Next: review this storyboard before rendering reference-driven Seedance 2.5 footage. Site unchanged; local commit only because prior public-push review remains unresolved.

## Current handoff — Higgsfield motion revision (10 September 2026)

- Bubs requested less artificial footage, an open-eyed talking mascot and restrained liquid-glass overlays with clean typography.
- Verified Seedance 2.5 in Higgsfield and submitted a 12-second 1080p motion test; job and exact prompt saved in docs/design/busy-life/seedance-2.5-test.md. Generation is pending, not yet visually accepted.
- Next: inspect the result before integrating anything; prepare approved character references and separate motion layers for production. Site unchanged; public push remains blocked by prior approval review.

## Current handoff — busy-life explainer preview (10 September 2026)

- Created a four-frame visual storyboard: busy hands, AI conversation, booking outcome, and time off. Saved the image and exact generation prompt in docs/design/busy-life.
- This is a screenshot concept for review; no video or website changes yet. Incoming phone booking remains a connected pilot capability.
- Next: review the frames with Bubs, then create separate footage and motion layers. Keep the confirmation concept for a later section. Public push remains blocked by the earlier approval review.

## Current handoff — confirmation story concept (10 September 2026)

- Hero CTA is complete. Created the next section’s visual concept: “Booked online. Confirmed by AI.” with connected booking, call and outcome illustrations.
- Saved the image and exact prompt in docs/design/confirmation. Existing #turn scroll section is unchanged pending visual approval.
- Requests for appointment changes remain team follow-up; copy notes calling requires setup and minutes. Next: Bubs reviews the concept before implementation. Local save only.

## Current handoff — hero live-demo CTA (10 September 2026)

- Replaced the hero’s “See it in action” button with “Meet your AI receptionist,” opening the approved live demo immediately.
- Hero and busy-section buttons share one modal and restore keyboard focus to the button used. Both paths and typecheck passed; hero button styling retains the existing white treatment.
- Next: generate a visual concept for the following confirmation section before implementation, as requested. Saved locally; no public deployment.

## Current handoff — approved responsive voice modal built (10 September 2026)

- Implemented the approved combined desktop and mobile concepts: “Go ahead. Say hello.”, large fuzzy mascot, mint rays/ripple, decorative animated waveform, separate customer/AI live caption bubbles and compact call controls.
- Ready state has one Let’s talk button; active state shows mute, countdown and End call. The layout stacks on phones, supports scrolling long captions and respects reduced motion. No mock dialogue or prerecorded audio appears in the product.
- Verified a real spoken photography appointment request produces a contextual AI audio reply. Separate mocked-provider visual checks cover ready/active/ended states, captions, mute, keyboard close/focus, 320/390/768/1440px fit and reduced motion. Production build/dev-tool exclusion passed; smallest-phone dock spacing was adjusted and rechecked.
- Existing local live connection and provider safety boundaries remain. Next: Bubs reviews the working modal in #cost. Saved locally; no deployment or public publishing.

## Current handoff — mobile modal image (10 September 2026)

- Created the requested phone portrait version of the combined modal, with vertically stacked mascot, live captions and compact call controls.
- Saved docs/design/voice-modal/mobile-concept.png and mobile-prompt.md. This is an active-call visual concept; sample captions show placement only.
- Next: Bubs reviews mobile before implementation. Working site unchanged; saved locally.

## Current handoff — combined modal image (10 September 2026)

- Generated the requested single combined concept: welcoming headline and large fuzzy mascot with mint rays, alongside live captions and call controls.
- Saved docs/design/voice-modal/combined-concept.png and the exact prompt in combined-prompt.md. The example captions illustrate placement only.
- Next: Bubs reviews this combined image before implementation. No changes to the working site; local save only.

## Current handoff — visual voice modal concepts (10 September 2026)

- Created two image concepts for a simpler, more visual live AI demo: mascot-centered welcome and an active conversation with live captions/control dock.
- Saved both images and exact built-in generation prompts in docs/design/voice-modal. These are design previews; the working live modal is unchanged.
- Recommendation: welcome concept before connecting, conversation concept during the call. Sample captions in the image illustrate placement only; the product remains unscripted.
- Next: Bubs reviews the concepts before implementation. Saved locally; public publishing remains pending the earlier approval review.

## Current handoff — live AI conversation modal (10 September 2026)

- Rebuilt the #cost modal in the approved white/forest/mint direction with the fuzzy mascot. Bubs explicitly rejected scripted audio; all prerecorded players and scripts are removed from this modal. The “Meet your AI receptionist” button opens a real microphone conversation.
- Created isolated OmniDimension practice agent 252341 with generated greetings/replies, Elena voice and English (American). Verified provider configuration has a 90-second duration limit, no booking integrations, files or post-call actions. Existing Ava remains unchanged. Private .env.local holds credentials and the new agent ID; it is ignored and mode 0600.
- Verified a real browser session transcribed a spoken photography-studio/Thursday portrait request and generated a relevant spoken reply. Mute/unmute, socket close, Escape/focus, 320/390/1440px layouts, route security tests and production build/dev-tool exclusion pass. An earlier test used silent input; the final audible test passed.
- Local preview is connected. Public session creation remains disabled until durable abuse/budget controls and public acceptance are complete; no deployment. The local limit is five session attempts per hour per process. Historical audio files are retained but unused.
- Next: Bubs tries “Let’s talk” in the workspace. Refine voice/conversation after feedback, then prepare public activation. Saved locally; public publishing remains blocked by the earlier approval review. Details: docs/browser-voice-demo.md.

## Current handoff — three playable AI voice examples (10 September 2026)

- Completed the busy-day section’s modal with Ainsley, Grady and Brielle voice choices, volume guidance, native playback controls, replay and the sample script. Visitors can compare the same receptionist-side dialogue; switching voices and closing stops playback. Samples do not autoplay.
- Generated three 29–32 second scripted Seed Audio demos through Higgsfield, saved locally in public/audio/voice-*.mp3. The modal labels these as illustrative AI demos, not customer recordings or the guaranteed production voice, and explains that more options can be explored during setup subject to the voice service.
- Verified all three files decode and play, replay, closing/reset, keyboard focus and 320/390/1440px dialog layouts. Production build and dev-tool exclusion pass. Renamed the chapter navigation to “When you’re busy.”
- Next: review voices in #cost, then mock up the later confirmation/follow-up story before changing another section. No real calls or deployment. Local commit only; public publishing remains pending the earlier approval.

## Current handoff — busy section and voice modal in progress (10 September 2026)

- Built the approved white #cost story: “You can’t be in two conversations at once,” new standalone conversation photograph, online booking preview, mascot and incoming-call pilot option.
- Added a native accessible voice-example dialog with volume guidance, audio controls, transcript support, errors, Escape/backdrop closing and focus restoration. Audio pauses/reset on close; no autoplay. Until a real demo asset is connected it honestly shows “preview is being prepared.”
- Bubs authorized a new clearly labeled scripted AI voice demo. Existing sample-call.wav is synthetic test tones, unsuitable for marketing. Magnific generation is unavailable on the account tier; Higgsfield voice selection is the next step before generating and wiring audio.
- Layout/keyboard checks and production build are being verified. Next: complete audio generation, connect transcript and test playback. No deployment; local work only, public publishing remains pending prior approval.

## Current handoff — Booked accent detail (10 September 2026)

- Added the three mint excitement lines beside the inline Booked badge to match the approved mockup, with reserved spacing before the following text.
- Decorative SVG inherits the badge’s accessibility hiding and scales with the heading. Existing section content stays in place.
- Next: continue visual section review. Local save only; public publishing remains pending the earlier approval.

## Current handoff — overview copy trim (10 September 2026)

- Removed “For businesses built around appointments.” from #benefits and its unused styling at Bubs’s request.
- The approved headline, mascot and illustrated benefits stay in place.
- Next: continue section review. Saved locally; public publishing remains pending the earlier approval.

## Current handoff — illustrated overview benefits (10 September 2026)

- Built the approved revised #benefits mockup: replaced the salon photograph with an inline Booked detail and added the line “For businesses built around appointments.”
- Replaced the small text-only benefits with three responsive product illustrations and larger headlines: booking times, AI/team call routing with the approved chat-bubble mascot, and appointment/call/spending activity. Illustrations are noninteractive HTML/CSS/SVG with decorative markup hidden from screen readers; the actual Features link remains accessible.
- Preserved forest/mint/white styling, existing overview copy and clear incoming-call pilot labeling. Other sections remain unchanged.
- Verified 320/390/1440px layouts, mascot loading, existing video/card/rail scrolling, reduced motion, and production build/dev-tool exclusion. Next: review #benefits before moving to another section. Local save only; public publishing still awaits the earlier approval.

## Current handoff — approved overview section and mascot (10 September 2026)

- Replaced only homepage #benefits with the approved spacious white editorial overview: large forest-green statement, inline fuzzy mint chat-bubble mascot and existing service photograph, three supporting benefits and Features link.
- Copy now says customer bookings and covers phone conversations, appointment management, call choices and spending controls. Incoming booking/answering schedules retain clear pilot status. Bubs selected the closed-eye fuzzy speech bubble as the working mascot; the standalone asset is public/marketing/receptionist-mascot.png.
- Verified desktop/mobile fit, image loading, surrounding V1 video/card/rail interactions, reduced motion and production build/dev-tool exclusion. Kept the original hero and other sections; further sections require visual mockup review first.
- Next: review #benefits in the workspace. Saved locally; public publishing remains pending the prior approval, with no deployment.

## Current handoff — forest and mint marketing identity (10 September 2026)

- Applied the approved reference palette to the active homepage and Features/Coming Soon: white canvas, forest-green text/buttons, mint accents and deep-green contrast chapters. Existing V1 scroll sequence, coastal hero, copy and feature-status labels are preserved.
- Added self-hosted Open Runde for marketing interface/body text and Apfel Grotezk for headings, with original OFL licenses and source credits in public/fonts/README.md. Other product/vertical themes and design studies remain separate.
- Verified both fonts actually load, pure-white backgrounds, and 320/390/1440px layouts on / and /features. Existing video scrubbing, card stacking, horizontal scrolling, feature controls and reduced-motion checks pass. Production build and dev-tool exclusion pass; the workspace homepage is refreshed.
- Next: review this typography/palette foundation before adapting more contextual brand elements or a mascot. No mascot, new imagery, feature claims or deployment added. Public push remains pending the earlier publication approval.

## Current handoff — original V1 scrolling homepage restored (10 September 2026)

- Bubs rejected the simplified homepage layout. Restored the complete original V1 page structure from c3a9ef8 (d05aece's parent): flowing chapters, confirmation video scrubbing, tabbed parallax feature stage, pinned dashboard card stack, horizontal industry rail, call section and closing chapter.
- The opening now uses the approved coastal-owner photograph and current “Your AI receptionist. Your day back.” message, with V1's entrance animation. White canvas/panels from the preceding change stay; the page-wide grain was omitted to keep white clean. Original chapter art, media and dark contrast sections remain. Chapter labels adapt over the photograph, and feature tabs form two columns on narrow phones.
- Restored the old feature stage as ScrollingFeatures in its own file, preserving the dedicated light Features page and Coming Soon voting/review system. Kept current shared pricing and corrected unsupported old timing, automated rescheduling, inbox and example-metric claims. Navbar and shared anchor links resolve to the restored sections.
- Verified real video time changes with scroll, sticky stages, changing card transforms, horizontal rail movement, feature mouse/keyboard controls, all referenced media, 320/390/1440px layouts without horizontal overflow, reduced-motion posters and the visible hero entrance. Features and roadmap still respond successfully; production build and development-tool exclusion pass.
- Next: review the restored V1 at /. Work is committed locally with no deployment. Public GitHub publishing still awaits the earlier approval after automatic review rejected the public push; live roadmap migration also remains pending.

## Current handoff — white marketing backgrounds (10 September 2026)

- Replaced the beige homepage canvas and the warm Features/Coming Soon backgrounds with pure white, including panels, vote controls and the suggestion dialog. Features pilot badges, focus rings and hover fills now use neutral colours; roadmap errors retain a pale red treatment.
- Verified the running workspace renders rgb(255, 255, 255) on both page backgrounds, the Features plan section, Coming Soon, its dialog and vote controls. Homepage text and shadows use neutral tones. Existing photography and dark contrast sections are preserved.
- Next: continue marketing review on localhost. Feedback remains locally persistent; the live roadmap migration and deployment remain pending. This styling update is saved locally; public GitHub publishing still awaits the earlier approval after automatic review rejected the public push.

## Current handoff — Coming Soon roadmap and feature voting (10 September 2026)

- Added Coming Soon at the very bottom of the light /features page, linked in its navigation. The 13 customer-facing roadmap items cover phone booking, calendar connections, team availability, owner editing, service durations, multiple locations/lines, reminders, reengagement, appointment changes, guided activation, voicemail and referrals. Pilot / Planned / Exploring labels avoid release-date promises; existing features remain in the main stories.
- Visitors can save/remove votes, sort by popularity and suggest features. Browser identity uses a random HttpOnly cookie and hashed database identifier; votes are unique per browser/feature, not verified people. Suggestions are private until review, with duplicate prevention and three submissions per visitor per 24 hours. Errors retain readable content and provide recovery without inventing counts.
- Built the signed-in staff review queue at /admin/roadmap, linked as Ideas in the staff header and Feature suggestions in the development page index. Approval opens a community item as Exploring; hiding preserves vote history. Review requests are guarded against races and uncertain saves, with keyboard focus restored after decisions.
- Feedback persists in ignored .local/roadmap.sqlite during development/test. Production uses Supabase only: migration supabase/migrations/20260910_feature_roadmap.sql and service-role-only functions are prepared and verified against an isolated PostgreSQL fixture. The migration has not been applied to live Supabase and no deployment occurred. See docs/feature-roadmap.md for release steps and sources.
- Passed 14 targeted tests, production build/dev-tool exclusion, real-browser voting and suggestion/review flows, error recovery, keyboard review, long-title wrapping, and 320/390/1440px light layouts. Fixed Next's internal localhost versus browser Host origin mismatch. Restarted the session-managed localhost service to load the page index, verified a vote survived the restart, and removed temporary QA feedback. Next: review /features#coming-soon; apply the migration before any live release. Work is saved locally; public GitHub push remains pending the earlier publication approval after automatic review rejected the public push.

## Current handoff — light Features page (10 September 2026)

- Changed /features to a warm light palette with near-black headings, dark primary buttons, light surfaces and readable muted text. Layout, copy and existing campaign images are preserved; V2 keeps its own approved visual direction.
- Checked all scoped colour pairs and verified the browser renders the light background and dark headline. The page explicitly uses a light colour scheme regardless of the global theme.
- In progress: Bubs requested a Coming Soon roadmap at the bottom of Features, with durable upvotes and new-feature suggestions. Recovering the actual planned capabilities and building saved voting plus a staff suggestion-review queue.
- Local preview now runs under the macOS session service from the previous handoff. Public GitHub publishing remains pending the earlier approval; no deployment occurred.

## Current handoff — workspace server recovery (10 September 2026)

- The detached local launcher had exited again: no process and no listener remained on port 3101. The browser also retained a cached connection-error document. Restored the site and verified V2’s current headline, its loaded 1254px hero image, Features and the development page index.
- Added macOS session-managed preview commands: npm run dev:workspace, dev:workspace:status and dev:workspace:stop. launchd keeps the existing dev launcher independent of temporary terminals and restarts exits; Next stays in the same job process group so cleanup covers its workers. Normal npm run dev remains available.
- The service binds 127.0.0.1:3101, refuses a conflicting listener, and stores its definition/logs in ignored .local/preview. It is not installed as a login startup item: rerun the start command after logout/reboot. Current service label local.ai-receptionist.preview.1841425c22; use status rather than relying on an old PID.
- Plist syntax, JS syntax, four preview tests, successful startup after the launching command exited, repeated-start reuse and browser rendering pass. An in-app error tab could not reload its cached data document; a fresh verified V2 tab was opened for review.
- Next: keep the preview available for marketing review. Bubs now requests a light Features page; that visual update is being handled separately. No production deployment or phone changes. Local commit only; public GitHub publishing remains pending the earlier approval after automatic review rejected the public push.

## Current handoff — clear homepage and dedicated Features page (10 September 2026)

- Replaced the unclear callback positioning with “Your AI receptionist. Your day back.” on the actual homepage and preferred local V2 preview. The supporting copy explains online booking, optional confirmation calls and owner follow-up. Shortened both home stories and moved the detailed capability/benefit explanations into the new /features page.
- Features now covers online booking, confirmation calls, incoming caller choices, scheduled answering, owner records and spending controls, with setup FAQs and shared plan values. Incoming booking and coverage remain clearly labeled pilots awaiting a tested connection. Removed unsupported callback timing, automatic rescheduling, no-show metrics and unconditional email/recording promises; aligned the website’s demo-call script and shared plan descriptions.
- Reused the exact approved coastal hero and three existing Higgsfield campaign photos. Added visible Features links to the homepage, V2, demo navigation and footers, plus Features & benefits under Marketing in the local page index and dev bar. Updated docs/marketing-story.md; existing V2 visual studies and original campaign assets remain available.
- Verified production build and development-tool exclusion, nine pricing/preview tests, all four marketing surfaces at 390px and 320px without horizontal overflow, feature images/anchors/FAQ, page-index navigation, pricing and signup destination. Signup reaches owner sign-in; local authentication still needs configuration. The local launcher was restarted to load the catalogue, current PID 28894, with private state/logs in .local/preview.
- Next: review the revised story at / and /__dev/design/luxury-v2 and the detailed /features page before video production. No live deployment, new media generation, real calls or payments occurred. Work is committed locally; public GitHub push still awaits the earlier publication approval after automatic review rejected publishing to the public repository.

## Current handoff — full Higgsfield campaign image set (10 September 2026)

- Bubs explicitly authorized all still images, superseding the previous media deferral. Generated ten images through Higgsfield: focused service, busy reception, away from desk, working-day break, vacation, closing time, customer call, online booking, owner review and optional phone evolution. Preserved the exact approved coastal hero and current V2 page.
- Cinema Studio Image 2.5 produced the first service image and phone study at 4096 square. Its eight reference-input jobs failed; GPT Image 2 high quality through Higgsfield completed the other eight using the first scene as a reference. Their actual size is 2880 square despite the requested 4k setting. Untouched PNGs, exact requests/results and checksums are in design/hero-comparison/campaign-v4; 2048-square WebP display copies total about 3 MB.
- Built the local comparison gallery at /__dev/design/campaign-v4, with all ten full-size links, the existing hero shown separately, and each scene paired with its intended product proof. Added Marketing campaign images under Marketing Site in the page index and dev bar. Incoming booking remains a labeled pilot preview; generated people/business are fictional.
- Verified all ten images visually, all original/preview checksums, 23 local endpoints, four development-preview tests, desktop rendering, page-index navigation and an isolated 390px browser check with all ten images loaded and no horizontal overflow. In-app viewport resizing did not apply, so responsive verification used an isolated browser. Restarted the independent local launcher to load the new gallery route; current PID 15541, private runtime/log paths remain .local/preview/development.json and development.log.
- Next: Bubs reviews the full image set, then select final placements and deliberate wide/mobile compositions before producing video. No marketing page replacement, live deployment or phone changes. Work is saved locally; public GitHub publishing remains pending the earlier requested approval.

## Current handoff — stable localhost address (9 September 2026)

- Saved V2 links on port 3101 were down while a separate Next process for this repo had started on the default port 3000. Stopped that confirmed project process and changed scripts/dev.mjs to default to 127.0.0.1:3101; explicit port and hostname overrides remain available.
- Restarted the development launcher independently of the temporary terminal (PID 95071, parent PID 1). Ignored runtime details and logs live in .local/preview/development.json and development.log. To stop it, verify the recorded PID still belongs to this launcher, then send SIGTERM so it cleans up Next and the preview service. This is not automatic crash recovery or login startup.
- Verified HTTP 200 for V2, its approved image, page index/data, journey, dev toolbar and original homepage. A fresh in-app browser tab renders V2 and the dev navigation; earlier tabs had cached network-error documents. JavaScript syntax, the four development-preview tests and diff checks pass.
- Next: continue reviewing V2 copy and story before new media. No production deployment or phone changes occurred. Work is saved locally; public GitHub publishing remains pending the previously requested approval.

## Current handoff — Marketing V2 copy and story (9 September 2026)

- Bubs deferred new photos and video. Rebuilt the local V2 reading flow around the owner's interrupted day, two distinct booking paths, caller/staff/AI choices, breaks and time off, call records, usage controls, setup and clear demo/signup actions. The exact approved coastal image remains the only photograph on the page.
- Preserved the previous V2 page byte-for-byte at design/hero-comparison/luxury-v2/visual-studies.html, linked in the footer. Original marketing remains unchanged; V2 stays at /__dev/design/luxury-v2 under Marketing in the page index. New narrative notes are in docs/marketing-story.md; media docs explicitly defer production.
- Four development-preview tests and source/anchor checks pass. Desktop and 390px browser checks confirm the story, loaded image, no horizontal overflow, FAQ and setup destination. The setup link reaches /account/login, where local sign-in is currently disabled pending configuration; signup completion is not claimed. Incoming phone booking remains a labeled pilot preview awaiting connection acceptance.
- Next: review and refine the headline sequence and story before returning to images/video. Main preview remains port 3101, session 10741. No generation, deployment or phone changes occurred. Work is saved locally; public GitHub publishing still awaits the previously requested approval.

## Current handoff — localhost restored (9 September 2026)

- The local 3101 Next process was orphaned, using a CPU core and accepting connections without responding; the development-preview launcher had stopped. Stopped only that project's stale process group and restarted npm run dev on 127.0.0.1:3101 in attached PTY session 10741. No application/source repair was needed or confirmed; this was a local process recovery.
- Verified HTTP 200 for V2, the approved hero image, page index/data, journey, toolbar and original homepage. Browser verification confirms the full 19-page index and its Marketing site · V2 link; the approved opening and dev bar render. An old tab was stuck on a cached network-error document, so opened and retained a fresh working V2 tab (22).
- Continue the feature/problem storyboard and first human keyframe review in docs/marketing-media-brief.md. The old separate mock preview on 3102 and its mock service are no longer running; restart those isolated fixtures only when needed for owner-screen review. No live deployment or phone changes occurred. Public GitHub publishing remains pending the earlier requested approval.

## Current handoff — showing the new features through owner problems (9 September 2026)

- Expanded docs/marketing-media-brief.md with eight problem/action/result treatments for incoming booking, caller choice, temporary coverage, weekly/vacation schedules, independent confirmations, call records, usage/spend controls and provider onboarding. Verified the descriptions against the current UI, phone settings and operating notes.
- Added a five-step scroll storyboard: stylist with client → saved answering choice → agreed slot and saved booking → owner record → uninterrupted service. Controls appear alongside their human benefit; usage belongs beside pricing and setup beside signup. Preserve the approved V2 opening and separate incoming booking from online/outgoing confirmation.
- Next: review this direction and the first focused-client/busy-reception keyframes before motion production. This block updates planning only; no media, app page, live connection or deployment changed. Incoming phone demonstrations still need a real adapter/pilot test before live claims; use dashboard notices until email is configured. Work is saved locally; public GitHub publishing remains pending the previously requested approval.

## Current handoff — benefit-led photos and videos (9 September 2026)

- Recovered Bubs's existing scenario list and inspected Starlink Roam's actual hero and travel/camping/boating imagery. The media story must show what owners gain: attention with a client, help during busy periods, freedom from the desk, breaks, vacation and after-hours coverage. V2 currently has one human opening followed by text-only benefits and large technical studies; those studies should no longer lead the campaign.
- Wrote docs/marketing-media-brief.md with six concrete photo/video treatments, headlines, adjacent booking evidence, page order, restrained motion, mobile/reduced-motion requirements and staged production. Keep the exact approved V2 coastal image (05-time-back.png). Corrected stale hero-direction notes that still called all V2 rejected and incorrectly positioned V3 as the current selection.
- Next: review the treatments, then produce focused-client and busy-reception keyframes through Higgsfield before the full set and motion test. The earlier request to review before video generation remains in effect. No media generation, purchases, V2 page replacement or live deployment occurred. The product explanation must distinguish online/outgoing evidence from incoming phone booking, whose actual connection and pilot acceptance are still pending. Notes are saved locally; public GitHub publishing still awaits the previously requested approval.

## Current handoff — page-index sections (9 September 2026)

- Organized the page index into Application, Marketing Site, Design Studies and Internal Tools, in that order. Bubs requested V2 under Marketing: it is now labeled “Marketing site · V2” there and in the dev bar’s Marketing group. All 19 pages remain: 12 application pages, 3 marketing pages, 2 design studies and 2 internal tools. V2 still uses its existing local-only preview URL. User journey stays under Internal Tools; the site access gate also appears there when the site is locked.
- The four sections sit alongside each other on desktop, become two columns on smaller screens and stack on mobile. Search now recognizes section names; sorting, page links, dates and access labels remain available.
- Verified V2 appears under Marketing Site with the same preview link and Local only label. The updated catalogue checks pass for the main app and tenant previews. Development was restarted on 3101 (session 14749) to load the catalogue change.
- Verified section counts, marketing and journey search, clearing search, date sorting and 390px mobile width in the browser. Existing development-preview checks pass (4 tests), as do JavaScript syntax and diff checks. This is a local directory update; product pages and live deployment are unchanged. Next product work remains phone connection/pilot acceptance and the signup follow-ups recorded below. Saved locally; public GitHub push is still awaiting the previously requested publication approval.

## Current handoff — visual user journey (9 September 2026)

- Built a clickable visual guide at http://127.0.0.1:3101/__dev/journey, with seven owner stages and separate online/phone customer journeys. The initial view highlights the existing setup form at step 3: after email sign-in and before Stripe checkout. Each stage includes a screen sketch, actions and the next transition; sketches use illustrative data and do not submit forms.
- Added “User journey” to the dev bar's Pages menu and page directory. The guide and its script are served only by the loopback development preview, never as public application assets. Original marketing, V2 imagery and real signup behavior are unchanged. Development was restarted on 3101 (session 77364); the mock application preview remains on 3102.
- Checked every owner/online/phone stage, desktop and 390px mobile layout, deep-link state, and the directory entry. Four development-preview tests pass, JavaScript syntax and diff checks pass, and the production exclusion check passes against the current build.
- Page-index follow-up: confirmed “User journey” under Internal tools and fixed fragment navigation resolving against the preview's base URL. Step selection now preserves /__dev/journey, including after refresh. Verified by opening the index link, changing steps and reloading; no new catalogue entry was needed.
- Journey review confirmed two follow-ups: V2 still has no signup CTA, and a logged-out visitor's selected pricing plan is lost through email sign-in and defaults to Busy on the setup form. Both are documented in the guide; neither was changed in this visualization task. Phone connection, calendar compatibility, email delivery and pilot acceptance remain pending as below. Work is committed locally; public GitHub push still awaits the previously requested publication approval after automatic review blocked it.

## Current handoff — incoming phone booking and provider onboarding (9 September 2026)

- Built the approved owner controls: independent outgoing confirmations and incoming routing, menu/staff/AI choices, weekly hours, holidays, vacation dates, temporary overrides, shared usage limits and incoming call history. Provider, phone-service type/plan and appointment software are now collected during onboarding, including “Not sure yet” and specific Comcast/T-Mobile guidance.
- Added authenticated incoming routing and booking endpoints, short-lived call sessions, atomic slot booking, separate incoming call records, shared inbound/outbound minute reservations, completion reports and owner notification jobs. Phone bookings do not queue duplicate confirmation calls. Owners cannot activate connections or change protected phone credentials. The provider-independent gateway still requires an actual carrier/audio adapter; see docs/inbound-phone.md.
- Pilot intake: Tanaz in Grand Rapids likely uses Comcast, but its precise phone product and booking software are unconfirmed. Bubs's personal pilot is T-Mobile. Exact numbers are saved privately in ignored .local/phone-pilots.json; these are intake records, not connected customer accounts. No real calls, purchases, forwarding changes, production migrations or deployment occurred in this block. Preserve the preferred V2 image and original site.
- Verified 44 unit tests, production build and development-tool exclusion, five SQL suites, eight mixed incoming/outgoing concurrency rounds and customer-deletion checks. Browser/API checks cover authenticated saving, consecutive saves with JSONB key reordering, reloads, stale-write conflicts, protected fields, holidays/temporary settings, clear not-connected status, provider guidance and mobile layouts. Temporary PostgreSQL was stopped.
- Local mock-data review is running at http://localhost:3102/start and /account (Sunday Studio fixture, not a real pilot). Mock service: node tests/mock-services.mjs on 55440; production preview on 3102 uses that local Supabase fixture, VOICE_PROVIDER=demo and explicitly empty Stripe/voice/email API keys. Current sessions: mock 68773, preview 1064. Main development/marketing preview remains http://127.0.0.1:3101/__dev/design/luxury-v2. Rebuild/restart the production preview after source changes.
- Next: verify the voice adapter's trusted call/session handoff, provision a separate test answering line, confirm Tanaz's appointment-book compatibility, measure all incoming/transfer costs, configure email delivery, then test caller-to-booking-to-dashboard plus fallback/rollback before forwarding a real number. Work is committed locally; GitHub push remains blocked by the earlier automatic review of the public repository, pending the already-requested publication approval.

## Current handoff — preferred V2 marketing direction (9 September 2026)

- Bubs now likes the opening image and UI in the V2 marketing preview, specifically its SpaceX/Starlink feel. Treat this as the preferred direction; this latest feedback supersedes the earlier rejection for this opening image and layout, without approving all four technical studies.
- Verified the visible image in the selected browser tab: design/hero-comparison/luxury-v2/assets/05-time-back.png, the woman having coffee on a coastal terrace. Preserve this exact image for the current direction. The separate Higgsfield V3 photograph was not the image on screen and remains an alternative.
- Carry forward the large photography, dark framing, restrained white typography, generous spacing and minimal navigation. Keep the owner benefit immediately clear: room to focus on customers, take a break or step away while bookings continue.
- Next: develop the scroll story around this opening, then show a customer booking online, the outbound AI confirmation call, and the owner's call record. Keep the story tied to the real product; requests needing a person still require follow-up.
- This block records design feedback only; no imagery, video, application or live deployment changed. Keep the original site intact. GitHub push remains blocked by the earlier automatic review of the public repository, pending the previously requested publication approval.

## Current handoff — local development navigation (9 September 2026)

- Added Bubs's burgundy DEV toolbar with a searchable Pages dropdown, current-page label, local path shortcut and Command/Ctrl K. The direct Page index link opens a full directory inspired by the requested localhost:8090/pages reference: internal tools, application/design columns, search, recency filters and date sorting. Both menus share the same 18-entry catalogue.
- Run `npm run dev` to launch Next plus a loopback-only preview server. Current workspace preview is http://127.0.0.1:3101/__dev/pages; comparison is `/__dev/design/luxury-v2`, and the original site is still `/`. Source dates use real Git history plus uncommitted file edits and refresh when the index reloads. Original design files and the live Vercel site were not changed.
- Production resolves the toolbar import to an empty server component; preview rewrites exist only during development. Every production build now fails if generated assets or route manifests include the toolbar. App sign-in gates stay intact; only the local static development namespace bypasses them.
- Verified desktop/mobile navigation and directory, search, date sorting, empty filters, arrow keys, Escape, path validation, mouse navigation and Next client navigation. The 20 tests and production build pass; local production HTML has no toolbar and all directory/tool/metadata URLs return 404. Production verification server was stopped; development remains running for review.
- Next: review the Higgsfield human image and settle the hero direction before producing motion. This work is saved in a local commit; GitHub push remains blocked by the earlier automatic review of the public repository, pending the previously requested publication approval.

## Current handoff — Higgsfield human photograph (9 September 2026)

- Bubs rejected all technical imagery from V2. Only the human time-back idea was promising, but its image still looked artificial. Explicit request: use Higgsfield and “Canto 2.5” for realism. Keep the benefit of time with customers, breaks and time off; no approved final hero yet.
- The full live Higgsfield catalogue has no Canto model. It lists Cinema Studio Image 2.5; asked for clarification, then proceeded with that stated interpretation. This was not a confirmed alias. Used the Higgsfield connector with cinematic_studio_2_5, 4k, square, one candid coastal-café image. Actual source is 4096 × 4096.
- A requested border-only generative edit failed. Removed its decorative black film border by cropping 40 pixels per side with ImageMagick in Higgsfield's cloud sandbox; no resampling. Final is 4016 × 4016, with untouched source retained. Visual review found no obvious anatomy blocker; realism and style still await Bubs's judgment.
- Saved both images, exact requests, provider results and checksums in design/hero-comparison/higgsfield-v3. Next: review this single human image before connecting further scenes or producing motion. No live site, application or video changed. Rejected V1/V2 files remain history, not approved assets.
- Product promise remains online booking, outbound AI confirmation calls and owner call records, with human follow-up for requests. Public GitHub publishing remains blocked by the earlier automatic review of the public destination and awaits the previously requested explicit publication approval.

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
