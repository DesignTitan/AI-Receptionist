# Customer platform launch runbook

The product now has a separate customer platform. Existing medical/salon/studio demonstrations and their data remain unchanged. Real customer data lives in `customers`, `customer_bookings`, and `customer_jobs`; every owner operation verifies a Supabase user and scopes the query to that user's customer. One business per owner account is supported at launch.

## Installation status — 8 September 2026

Application e4a9251 is deployed at https://ai-receptionist-two-azure.vercel.app (still locked). The production operator queue loads successfully from Supabase. The customer migration is installed in production Supabase. The Supabase Site URL is updated to the production domain; the exact production /account/callback URL is now allowlisted with Bubs’s approval. Unit and disposable-database tests pass. Live Stripe, email and dedicated customer calls are awaiting provider configuration. Bubs approved both previously blocked settings on 8 September; CRON_SECRET is saved as a sensitive Production variable and vercel.json enables daily queue recovery at 09:00 UTC.

## Routes

- `/start`: authenticated business intake and plan selection.
- `/account/login` and `/account/callback`: Supabase email-link sign-in; the verified access token is stored in an HTTP-only cookie. Sessions expire after one hour; request a fresh sign-in link when needed.
- `/account`: that owner's setup progress, bookings, calls, usage estimates and Stripe billing portal.
- `/admin/customers`: existing staff gate protects the operator setup queue and failed-job monitor.
- `/b/<slug>`: public business booking page, available only after operator activation and active billing. Customer subdomains rewrite here when `CUSTOMER_ROOT_DOMAIN` is configured.
- `/api/webhooks/stripe`: signature-verified subscription state updates. Event receipts and state changes are committed atomically. Current subscription state is retrieved from Stripe to avoid trusting old event snapshots.
- `/api/webhooks/customer-voice`: customer-agent reports matched by both `metadata.customer_id` and `metadata.customer_booking_id`; the existing demo voice callback remains unchanged.
- `/api/jobs`: bearer-authenticated delivery queue processor. New bookings and Stripe events trigger it after returning a response. `vercel.json` enables a daily recovery pass at 09:00 UTC, authenticated with CRON_SECRET. Use a one-minute schedule on Pro if desired.

## Stripe mode and live transition

Use `docs/stripe-live.md` for the complete transition. `npm run stripe:setup` verifies or prepares either test or live mode from the shared catalogue. The staff billing connection check verifies the active configuration. Apply `20260908_stripe_environment.sql` and configure STRIPE_MODE/STRIPE_ACCOUNT_ID before this version processes Stripe requests.

## Prepare infrastructure

1. Apply `supabase/migrations/20260908_customer_platform.sql` as one transaction. It adds tables/functions without changing existing demo tables. Set public-schema API access to the normal Supabase configuration. No customer tables have browser-readable policies; RPCs are executable by service_role only.
2. In Supabase Authentication URL Configuration, set the real site URL and allow exactly `<site>/account/callback` (plus the staging callback). Configure custom SMTP for reliable customer sign-in email. Keep email confirmation on. The normal magic-link template works; no template change is needed.
3. Configure `RESEND_API_KEY`, a verified `EMAIL_FROM` sending address, and `OWNER_EMAIL` (Bubs's lead inbox). Customer transactional emails use each customer's verified owner email, independently of `OWNER_EMAIL`. Add the sending domain to Resend and publish its DNS records.
4. Create recurring Stripe prices: front $199/month, busy $399/month, full $749/month. Create two one-time setup prices: $299 for the first 10 pilot customers and $499 standard afterward. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_FRONT`, `STRIPE_PRICE_BUSY`, `STRIPE_PRICE_FULL`, `STRIPE_PRICE_SETUP_PILOT` and `STRIPE_PRICE_SETUP_STANDARD`. Retain `STRIPE_PRICE_SETUP` only for previously issued $1,000 checkout snapshots. Apply `supabase/migrations/20260908_pilot_setup.sql` after the usage migration to enable atomic pilot reservations and per-checkout setup price snapshots. Start in Stripe test mode.
5. Register `/api/webhooks/stripe` for checkout.session.completed, checkout.session.async_payment_succeeded, customer.subscription.created/updated/deleted, invoice.paid and invoice.payment_failed. Save its signing secret as `STRIPE_WEBHOOK_SECRET`. Enable the Stripe billing portal. Test the signed callback, subscription cancellation, payment failure, and retries before live keys.
6. Set a random `CRON_SECRET` for the delivery endpoint. Keep it server-side. Customer jobs are visible in the operator queue; email jobs can be safely retried with their unchanged Resend idempotency key within Resend's retention window. Never blindly retry a call after a timeout; check the provider log first.
7. Connect the root and wildcard domains in Vercel and DNS before setting `CUSTOMER_ROOT_DOMAIN`. Update Turnstile's allowed hostnames for the real domain. Booking checks require a valid Turnstile token before any call can be queued.
8. Set a non-default admin password, rotate the previously exposed voice webhook secret on both the demo agent and deployment, and approve final business name and legal policies before switching `SITE_GATE` to public.

## Provision one paid customer

`npm run provision` lists paid/provisioning customers. It does not purchase anything.

`npm run provision -- --customer <uuid>` searches their area code and prints available numbers and prices without mutations.

Prepare a reviewed create-agent JSON template containing Ava's voice, model and transcriber configuration. The provisioner overrides business identity, recording greeting, per-call script, timezone and webhook. Do not include a demo post-call email or unrelated transfers. Agent creation is intentionally not retried after an uncertain response.

`npm run provision -- --customer <uuid> --number <E.164> --max-monthly 5 --template /secure/path/ava.json --apply`

The command claims the customer, creates their agent, purchases the chosen number within the supplied monthly limit using a stable purchase idempotency key, finds its account ID and attaches it. Each step is persisted. It stops in provisioning: test a real booking, confirmation call, recording notice and owner email with the customer before marking live in `/admin/customers`.

If interrupted, inspect OmniDimension and reconcile any created resource IDs in the queue before clearing the error. Do not create a second agent or buy a different number to recover an uncertain response. A checkout reservation can be reset only after Stripe confirms the exact session expired. Completed or uncertain checkouts retain their reservation until reconciled; a local expiry time alone never authorizes release.

The pilot and standard setup packages both cover one business, booking-page configuration, dedicated phone setup and one test session. Target at most $150 in direct onboarding labor and one-time costs. The $299 pilot fee leaves about $137.94 contribution after that allowance and conservative 3.6% + $0.30 fees, before shared overhead. Track actual time and expenses. Custom integrations and extra work are separately scoped and quoted; $1,000+ custom projects are not automatic checkout products.

The operator queue shows setup price snapshots and pilot places redeemed, reserved and available. A paid pilot place remains redeemed after cancellation, refund or account deletion. Existing checkout snapshots retain their quoted fee; never change a customer's open checkout price while reusing its Stripe idempotency key.

## Operations and scope

- `npm run ops`: customer setup, failed calls and interrupted/failed jobs.
- `npm run backup -- /secure/path/backup.dump`: consistent pg_dump using `DATABASE_URL`. Backup files are mode 0600. Store encrypted, arrange a weekly run in your infrastructure, and perform a restore rehearsal. A schedule is not installed by this command.
- `supabase/delete-customer-data.sql`: inspect and explicitly select customer records for deletion. Cancel billing and release phone resources separately before removing customer account data.
- Apply `20260908_usage_billing.sql` after the customer migration. Started minutes are reserved and settled per Stripe billing month, then sent to its graduated meter. Set all three STRIPE_USAGE_* IDs, STRIPE_METER_ID, STRIPE_METER_EVENT and STRIPE_PORTAL_CONFIGURATION. See `usage-billing.md` for spending limits, alerts and reconciliation.
- Appointment duration is per team member/service. The entire team shares business hours. Calendar sync, per-member schedules, several locations, inbound receptionist workflows, and fully unattended activation remain future work.
- Paused accounts retain owner access and their booking history; public booking pages and new outbound dispatches stop. Resuming after billing recovery requires an operator check.
- No live account purchase, test email, phone purchase, external message, or public launch is performed by installing this code.

## Verification

Run `npm test` and `npm run build`. Apply the migration to a disposable PostgreSQL instance with Supabase's auth.users table and roles, then run `psql -v ON_ERROR_STOP=1 -f tests/platform.sql`. The SQL tests roll their fixture data back.

`tests/mock-services.mjs` is a local browser fixture server, not an application auth bypass. It is only used when the test app is explicitly pointed at its localhost URL. It does not contact Supabase, Stripe, Resend or OmniDimension.

Provider references: [Stripe Checkout subscriptions](https://docs.stripe.com/payments/checkout/build-subscriptions), [Stripe webhook signatures](https://docs.stripe.com/webhooks), [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless), [OmniDimension agent creation](https://docs.omnidim.io/docs/api-reference/agents/createAgent), [number purchase](https://docs.omnidim.io/docs/api-reference/phone-numbers/purchasePhoneNumber), [number attach](https://docs.omnidim.io/docs/api-reference/phone-numbers/attachPhoneNumber).
