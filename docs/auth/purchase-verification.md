# Purchase verification

Flow: name/email → six-digit email code (still step 1) → review purchase → Stripe → paid dashboard setup.

The code is verified by Supabase on the server. Only a matching, confirmed user and valid session can set the HTTP-only account cookie. Checkout still requires authenticated ownership and Stripe still controls payment status.

## Configuration before live use

- Apply `passwordless-email.html` to Supabase Authentication → Email Templates → Magic Link. It includes both `{{ .Token }}` for inline verification and `{{ .ConfirmationURL }}` to preserve existing login links.
- Configure a six-digit OTP and an appropriate short expiration, production SMTP, and Supabase authentication rate limits. Codes must remain single use.
- Configure the existing Turnstile site/secret keys. Sending verification emails remains protected by the server human check.
- Keep the existing approved callback URL configuration for the optional sign-in link, including pricing return parameters.
- Test delivery, incorrect/expired/reused codes, resend cooldown, sign-in links and the Stripe test-mode purchase before enabling live payments.

Template supplied locally; no remote authentication settings or emails were changed by this task.

Reference: https://supabase.com/docs/guides/auth/auth-email-passwordless
