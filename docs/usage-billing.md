# Usage billing operations

The TypeScript catalogue in `src/lib/platform/pricing.ts` drives marketing, signup, entitlement checks and the Stripe sandbox setup script. SQL stores versioned billing-period snapshots. Prices are immutable in Stripe; future pricing changes require a new version and deliberate existing-customer policy.

## Billing path

Checkout validates the fixed price, setup fee and graduated usage price before creating a session. Each subscription has one fixed monthly item and one metered monthly item. The meter receives all settled started minutes: the included tier is free and the remainder is $0.49/minute. Setup is charged once by Checkout. Stripe webhooks synchronize subscription state and its billing period in one database transaction. Current state is fetched from Stripe and event IDs deduplicate retries.

Only paid, operator-activated customers with a configured five-minute voice limit can dispatch. The database locks the customer and reserves five minutes before a call. Simultaneous dispatches therefore cannot independently spend the same allowance. Unknown-duration calls keep their reservation. A provider duration over five minutes is capped at five for customer billing and pauses the customer for review; the provider's excess expense belongs to us.

Usage belongs to the billing period when dispatch began, including calls crossing renewal. Stable booking identifiers and Stripe idempotency prevent normal retry double billing. Reports older than 23 hours are held for manual reconciliation rather than resent after the provider's idempotency window. Review meter errors, missing final reports and failed jobs in `/admin/customers`; compare provider logs, our usage ledger and Stripe meter totals before resolving. Never release an uncertain reservation or replay a call merely because a request timed out. Verify period-end meter delivery before invoices finalize; late usage may need an explicitly reviewed adjustment.

## Customer controls and notices

Extra spending defaults to $0. Owners may opt into a recurring monthly cap up to $500. The cap cannot be lowered below used plus reserved extra minutes. Remaining capacity is rounded down to whole purchasable minutes. No automatic overage consent or automatic upgrade exists. Online bookings remain open when only minute capacity is exhausted, and uncalled bookings are flagged for manual confirmation.

The owner dashboard shows allowance, settled and reserved minutes, renewal date, extra charges, projected bill, plan comparison and recent notices. Notices are stored immediately and email jobs are queued once for 80%/100% allowance, 80% extra budget, budget changes and paused calling. RESEND_API_KEY and verified EMAIL_FROM are required for actual delivery. Until connected, emails fail visibly in the staff queue; do not claim they were sent. Configure Supabase custom SMTP separately for reliable sign-in links.

Regular callbacks process jobs immediately; daily Vercel recovery is a fallback, not a guaranteed near-real-time scheduler. Monitor the staff queue while testing. A higher-frequency worker and period-close reconciliation are launch requirements at meaningful volume.

## Verification and lifecycle

Run `npm test`, `npm run typecheck`, `npm run build`, and the disposable PostgreSQL suites `tests/platform.sql` and `tests/usage.sql` after both migrations. Check sandbox invoice totals, signature rejection and customer isolation. No live keys, live activation, phone purchase or real customer contact is part of sandbox setup.

The deletion runbook removes usage rows before their bookings. Retain/export billing records as required before an authorized deletion. Stripe financial records have a separate lifecycle.

## Sandbox acceptance — 8 September 2026

Deployed commit 5751fbf. All 10 unit checks, both PostgreSQL suites and final build pass. Production Supabase migration succeeded and the live staff usage dashboard renders. Stripe API checkout totals were $1,199/$1,399/$1,749 including setup. Invoice previews with 100 extra minutes were $248/$448/$798. Disposable sessions were expired and subscriptions cancelled. The deployed webhook returned 400 without a signature and 200 with the sandbox signing secret. These are component/integration checks; a complete authenticated-owner payment, dedicated real call and email-delivery acceptance remains outstanding before live billing.
