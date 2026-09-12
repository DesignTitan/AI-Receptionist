# Staging authentication activation

Prepared 12 September 2026. Hosted login is **not yet activated**.

## Prepared resources

- Vercel project: `ai-receptionist`, team `bubs-1063s-projects`.
- Preview branch: `codex/account-authentication-flow`.
- Stable preview URL: https://ai-receptionist-git-codex-account-au-5528bb-bubs-1063s-projects.vercel.app
- Supabase persistent preview branch: `auth-staging`, project `xrqfqwnkybknbevrenkn`, parent `ddbldxsyvrqrlvtainzn`. Created without production data.
- Applied all eight application migrations to staging. Verified row security on all six account-authentication tables.
- Configured staging site/callback URLs, email confirmation, ten-minute email expiry and authenticator enrollment/verification. Email requests are limited to once per minute, with eight-digit codes. Passkeys remain disabled.
- Created a dedicated managed Cloudflare Turnstile widget named `AI Receptionist auth staging`, restricted to the stable preview hostname.

## Pending credential-transfer approval

Automatic approval review blocked uploading staging credentials to Vercel without explicit authorization for that destination. No staging credentials have been uploaded to Vercel. Production credentials were not copied.

The proposed transfer is limited to this branch’s **Preview** environment:

- New staging Supabase URL, anon key and service-role key.
- New staging Turnstile site key and secret.
- A fresh, staging-only session encryption key.
- The stable staging site URL, passkeys disabled and Stripe test mode.
- Separate random staging admin password/session secret so deployed admin access never falls back to defaults.

Credential values must never appear in source control, logs, task messages or documentation. Newly created provider keys are held in permission-restricted temporary staging files; remove temporary credentials after the approved transfer.

## Remaining verification

1. Upload the approved staging credentials, rebuild this branch’s Preview deployment and verify the stable alias resolves to it.
2. Confirm the human-check widget succeeds on that hostname and verify signup/email delivery using an authorized test inbox.
3. Complete real email → authenticator enrollment → recovery codes → account access, then returning login and revocation checks.
4. Check SMTP delivery restrictions. Supabase’s default sender only delivers to project-team addresses; configure a staging SMTP sender before inviting other testers. No email delivery has been verified yet.
5. Staging contains no copied production accounts. Testers must sign up first. Payment processing is a separate setup task; no Stripe credentials were copied.

The persistent Supabase preview branch is a provisioned staging resource. Pause or remove it through the provider when staging is no longer needed.
