# Stripe test to live

The customer offer is shared by the app and Stripe setup tooling: $299 setup for the first ten customers, $499 standard setup afterward; monthly $199/$399/$749; 300/750/1,500 minutes; 49 cents per extra started minute. Live customers see the same pricing and benefits. Only test mode shows a test-payment notice.

## Prepare the live configuration

Sandbox objects and transactions do not turn into live objects. Create the same catalogue in the intended live Stripe account, with its own key, price IDs, meter, webhook secret and portal. Do not replace only the API key.

1. Finish Stripe activation, identity/business verification and payout setup in the AI Receptionist account. Confirm the intended live account ID in Stripe. The separate sandbox account currently used by the app is `acct_1UDNPDPicyLxgU34`; do not use that as the live account ID. The parent account created in this session was `acct_1UDNP6PadPgqGiRq`; verify it is still the intended live business before proceeding.
2. Keep the live key in a protected file outside this repository. Run the command below with the confirmed account ID. Without `--apply`, the tool only verifies an existing catalogue and reports missing or mismatched configuration. Add `--apply` to create missing objects and repair mutable webhook/portal settings. It rejects mismatched immutable prices/meters rather than silently changing a customer's offer.

```sh
npm run stripe:setup -- --mode live --account acct_CONFIRMED_ACCOUNT \
  --site https://ai-receptionist-two-azure.vercel.app \
  --key-file /secure/stripe-live-key \
  --out /secure/stripe-live.json --apply
```

The protected JSON file contains the complete Stripe environment-variable set. Keep it outside Git. A newly created webhook's secret is saved there. If the endpoint already existed and the file lacks its secret, get the signing secret for that exact endpoint from Stripe; a same-account verification can leave the correctly configured existing Vercel secret unchanged. A saved secret is reused only for the same mode, account and endpoint ID. No keys or secrets are printed. The script never changes Vercel, activates the Stripe account, creates a real subscription or takes a payment.

## Bind the application data to the same environment

Apply the four migrations in order: customer platform, usage billing, pilot setup, then Stripe environment. The last migration records the current sandbox binding.

For a new Supabase project, also set its Authentication Site URL to the deployment origin and allow exactly `<site>/account/callback`. Configure its sign-in SMTP as described in `customer-platform.md`; replacing database credentials alone does not move these authentication settings.

The database refuses switching mode/account while any customer financial references, checkout attempts, Stripe events, usage periods or reserved/redeemed pilot places remain. This preserves sandbox history and prevents test subscriptions or usage from being sent to live Stripe. Use a separate clean live Supabase project if such history exists; retain the sandbox database for testing. Do not delete payment history just to make this check pass.

For a clean database, run the following in its Supabase SQL editor with the confirmed live account:

```sql
select public.set_stripe_environment('live', 'acct_CONFIRMED_ACCOUNT');
```

Draft-only business details can remain. The mode check and checkout/payment changes use the same database lock, so a checkout already in progress cannot slip across the switch. Run the binding change during the short deployment cutover while the site remains locked.

## Deploy the whole configuration together

In the existing Vercel project's Production environment, replace the complete Stripe variable set from the protected manifest: STRIPE_MODE, STRIPE_ACCOUNT_ID, STRIPE_SECRET_KEY, all three monthly price IDs, all three usage price IDs, both setup price IDs, STRIPE_METER_ID, STRIPE_METER_EVENT, STRIPE_WEBHOOK_ENDPOINT, STRIPE_WEBHOOK_SECRET and STRIPE_PORTAL_CONFIGURATION. Store the API key and webhook secret as sensitive variables. The legacy STRIPE_PRICE_SETUP is optional and is not created in a fresh live account. Update Supabase variables too if using a separate live database.

Set `NEXT_PUBLIC_SITE_URL` to the same HTTPS origin passed to the setup tool's `--site`. Do not copy the localhost development value from `.env.example` into Production. This origin controls checkout returns, owner sign-in links and billing portal returns.

Deploy once after all settings are saved. The already-running deployment retains its old environment until replaced. A mismatch between key mode, account, database or price objects stops payment processing with an explicit error; it does not create a new payment with a mixed configuration.

In `/admin/customers`, use **Check billing connection**. It verifies the actual account and database binding, all price amounts/allowances, meter, webhook events and billing portal. Live mode also requires Stripe to report charges, payouts and submitted business details as enabled. Customer signup and account pages automatically omit the test-payment notice in live mode.

Complete an agreed live customer acceptance check before opening access: authenticated owner checkout, correct first invoice, verified webhook receipt, owner dashboard, confirmation call and delivered email. Inspect the customer record, first-invoice amount and pilot redemption. A green connection check confirms configuration, not that these business workflows or email delivery have completed.

## Keep testing available

Run the same setup tool with `--mode test`, the sandbox account and test key for the test environment. Leave sandbox credentials/database on a separate test deployment when production becomes live. Each clean environment has its own ten pilot places. Never send sandbox usage to a live meter or reuse sandbox price IDs in live mode.

Before real billing at volume, connect Resend and reliable sign-in SMTP, finish voice acceptance and put period-close usage reconciliation into operation. The daily recovery job is a fallback; inspect delayed meter events before invoices finalize.

Provider references checked 8 September 2026: [Stripe API keys and separate test/live objects](https://docs.stripe.com/keys), [endpoint-specific webhook signing secrets](https://docs.stripe.com/webhooks).
