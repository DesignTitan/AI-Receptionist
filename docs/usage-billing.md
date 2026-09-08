# Usage billing operations

The TypeScript catalogue in `src/lib/platform/pricing.ts` drives marketing, signup, entitlement checks and the Stripe sandbox setup script. SQL stores versioned billing-period snapshots. Prices are immutable in Stripe; future pricing changes require a new version and deliberate existing-customer policy.

## Billing path

Checkout validates the fixed price, setup fee and graduated usage price before creating a session. Each subscription has one fixed monthly item and one metered monthly item. The meter receives all settled started minutes: the included tier is free and the remainder is $0.49/minute. Setup is charged once by Checkout: $299 for the first 10 pilot customers, then $499 standard. The same package covers one business, booking-page configuration, dedicated phone setup and one test session. Extra work is separately quoted; custom projects starting at $1,000 are not added to checkout automatically. Stripe webhooks synchronize subscription state and its billing period in one database transaction. Current state is fetched from Stripe and event IDs deduplicate retries.

Pilot places are reserved atomically before creating checkout. The attempt stores its exact setup fee and Stripe price, and retries reuse that quote and session. Stripe must confirm the session expired before an unpaid place can be released; completed, unpaid-but-processing and uncertain sessions stay reserved for review. Initial setup payment is verified before redemption, and redeemed places are permanent even after cancellation or refund. The owner dashboard displays the stored fee and payment state, while the operator queue shows pilot availability. See `pricing-economics.md` for the $150 direct onboarding cost target and contribution assumptions.

Only paid, operator-activated customers with a configured five-minute voice limit can dispatch. The database locks the customer and reserves five minutes before a call. Simultaneous dispatches therefore cannot independently spend the same allowance. Unknown-duration calls keep their reservation. A provider duration over five minutes is capped at five for customer billing and pauses the customer for review; the provider's excess expense belongs to us.

Usage belongs to the billing period when dispatch began, including calls crossing renewal. Stable booking identifiers and Stripe idempotency prevent normal retry double billing. Reports older than 23 hours are held for manual reconciliation rather than resent after the provider's idempotency window. Review meter errors, missing final reports and failed jobs in `/admin/customers`; compare provider logs, our usage ledger and Stripe meter totals before resolving. Never release an uncertain reservation or replay a call merely because a request timed out. Verify period-end meter delivery before invoices finalize; late usage may need an explicitly reviewed adjustment.

## Customer controls and notices

Extra spending defaults to $0. Owners may opt into a recurring monthly cap up to $500. The cap cannot be lowered below used plus reserved extra minutes. Remaining capacity is rounded down to whole purchasable minutes. No automatic overage consent or automatic upgrade exists. Online bookings remain open when only minute capacity is exhausted, and uncalled bookings are flagged for manual confirmation.

The owner dashboard shows allowance, settled and reserved minutes, renewal date, extra charges, projected bill, plan comparison and recent notices. Notices are stored immediately and email jobs are queued once for 80%/100% allowance, 80% extra budget, budget changes and paused calling. RESEND_API_KEY and verified EMAIL_FROM are required for actual delivery. Until connected, emails fail visibly in the staff queue; do not claim they were sent. Configure Supabase custom SMTP separately for reliable sign-in links.

Regular callbacks process jobs immediately; daily Vercel recovery is a fallback, not a guaranteed near-real-time scheduler. Monitor the staff queue while testing. A higher-frequency worker and period-close reconciliation are launch requirements at meaningful volume.

## Verification and lifecycle

Run `npm test`, `npm run typecheck`, `npm run build`, and the disposable PostgreSQL suites after applying the customer, usage and pilot setup migrations. Check pilot allocation under concurrent signup, checkout expiry/retry, payment replay, exact setup price acceptance, sandbox invoice totals, signature rejection and customer isolation. No live keys, live activation, phone purchase or real customer contact is part of sandbox setup.

The deletion runbook removes usage rows before their bookings. Retain/export billing records as required before an authorized deletion. Stripe financial records have a separate lifecycle. Deleting a paid pilot customer must preserve the redeemed place so the pilot allocation does not reopen.

## Earlier sandbox acceptance — before the pilot setup change

Deployed commit 5751fbf was checked on 8 September 2026. All 10 unit checks, both PostgreSQL suites and final build passed. Production Supabase migration succeeded and the live staff usage dashboard rendered. Those Stripe API checkout totals were $1,199/$1,399/$1,749 under the superseded $1,000 setup fee. Invoice previews with 100 extra minutes were $248/$448/$798; recurring pricing remains unchanged. Disposable sessions were expired and subscriptions cancelled. The deployed webhook returned 400 without a signature and 200 with the sandbox signing secret. These were component/integration checks; a complete authenticated-owner payment, dedicated real call and email-delivery acceptance remains outstanding before live billing.

The pilot setup change requires fresh checkout verification: expected initial totals are $498/$698/$1,048 with pilot setup and $698/$898/$1,248 with standard setup, before tax. These are expected amounts, not a claim of a completed acceptance test.
