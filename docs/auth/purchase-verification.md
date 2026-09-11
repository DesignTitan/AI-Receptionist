# Purchase verification

Flow: name/email → emailed sign-in link (still step 1) → review purchase → Stripe → paid dashboard setup.

The screen matches the existing Supabase magic-link email. There is no code field. The callback verifies the session server-side before setting the HTTP-only account cookie. The selected plan and safe return destination are retained; checkout still requires authenticated ownership.

The optional branded `passwordless-email.html` uses `{{ .ConfirmationURL }}` only. No change to remote email settings is required for the current link flow. Keep the existing approved callback URLs, production SMTP and authentication rate limits. Turnstile must remain configured for sending links.

Verify expiry, resend cooldown, changed email, selected-plan return and Stripe test-mode checkout before accepting live payments. No real emails or payments were sent during the local mock verification.

Reference: https://supabase.com/docs/guides/auth/auth-email-passwordless
