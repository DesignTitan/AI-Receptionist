# Flat setup and simplified checkout

New Front desk and Busy desk purchases have one $89 setup fee. Full desk keeps $499; custom/enterprise remain quoted. Historical prices and issued checkout reservations remain frozen. Do not relabel historical receipts or charge existing customers again.

Stripe Checkout now has two items: the monthly plan and one-time setup. `checkoutSetupPrice` creates/reuses a versioned fixed price in the already-bound Stripe account; validates its amount and updates the plan's product description to a short included-minutes/team summary. There is no limited pilot allocation for new purchases.

`20260911_flat_setup.sql` adds an owner-scoped, environment-checked reservation function; it retains the old functions for existing checkouts and webhook replay. The new function has been exercised in a disposable PostgreSQL database and applied to the existing test-mode project.

New subscriptions carry `checkout_version=flat-v4`. Their metered item is installed only on the owner's first positive extra-spending limit, before saving that limit. Old subscriptions still require their existing metered item. Disabling spending retains that item so outstanding usage can settle. Usage continues through the existing meter and allowance controls; no rates were increased. Before enabling real paid service, verify a mid-cycle opt-in and its invoice against the local usage ledger in Stripe sandbox.

Validation: exact setup/first-payment totals, strict subscription shape checks, historical setup-invoice checks, SQL owner isolation/reservation idempotency/payment transition, TypeScript. No payments were submitted by the agent.
