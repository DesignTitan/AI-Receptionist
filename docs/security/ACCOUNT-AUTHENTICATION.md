# Account authentication

Implemented 12 September 2026. The approved account-access boards are now React screens with server routes, provider verification and database-backed session/recovery controls. This implementation is not yet activated against a configured Supabase project in this checkout. It is not a certification or penetration-test result.

## User flow

- `/account/login`: passkey sign-in (when enabled), or an email link. New accounts enter through a selected plan at `/start`; the sign-in form does not create users.
- `/account/callback`: exchanges a one-time PKCE code. The verifier is an HttpOnly cookie, so the email must be opened in the requesting browser. Old implicit-hash links are deliberately rejected. The callback removes its query immediately and redirects to security.
- `/account/security`: the server decides whether to enroll a method, challenge an existing one, recover access, or show security settings. The selected plan is retained through enrollment and recovery-code creation, then returns to purchase review.
- Authenticator setup displays the provider’s real QR and setup key. It becomes enabled only after a valid six-digit challenge response.
- Passkeys use native browser WebAuthn and Supabase’s challenge/verification endpoints. Registration must be followed by an actual passkey assertion with the signed user-verification flag before it grants application access. OS biometric prompts are never imitated.
- Security settings list methods and sessions, support passkey renaming/removal, authenticator enrollment/removal, recovery-code replacement, and signing out one/all other devices. The last method cannot be removed.
- Recovery requires an email-authenticated session plus a one-time recovery code. It revokes other application sessions, rotates the current cookie, and grants only the ability to replace lost methods. Business data stays inaccessible until re-enrollment succeeds. A recovery-in-progress record prevents a separate email session from claiming enrollment. Unused codes are retired only after successful replacement enrollment; another unused code can recover an expired recovery session.
- People without any remaining method can create a durable review request. Staff see `/admin/account-recovery` and can track/close it. **No support action bypasses MFA or resets credentials.** If all factors and codes are lost, an independently reviewed identity-verification and privileged recovery procedure still needs to be established before offering an account-unlock promise. This queue does not claim to provide automated identity proofing.

## Security boundaries

`src/lib/account-auth/server.ts` owns session policy. `owner()` uses it, so existing owner APIs and pages require a verified, approved, unexpired, unrevoked session. A bare Supabase access token is no longer accepted as an application cookie. Service-role business queries cannot be reached merely by bypassing a client screen.

Production cookies use the `__Host-` prefix to prevent domain/path overrides from sibling sites. Cookies contain a random 256-bit session secret; only its SHA-256 hash is stored. Provider access tokens are AES-256-GCM encrypted with a separate server-only key. Sessions expire at the earlier of provider token expiry or one hour; pending email sessions last at most 15 minutes. This version deliberately does not retain refresh tokens or silently renew sessions. Sensitive method, code and device changes require verification within ten minutes. Completing verification rotates the application cookie.

Ten recovery codes each contain 96 random bits. Only account-bound SHA-256 hashes are stored. PostgreSQL consumes a code, marks the recovery restriction, rotates the session hash and revokes other sessions in one transaction. Replacing codes is transactional. Security changes use a per-account operation lease to prevent overlapping mutations. Distributed attempt limits are database-backed. Mutations require a same-origin request. Account pages/APIs disallow framing and request no caching/referrer disclosure.

Revocation is immediate at the application session layer. This implementation does not promise to revoke arbitrary Supabase tokens obtained by other clients. Keep all customer-data RLS policies closed to direct anonymous/authenticated access; business data goes through the server. The service-role key is never returned to the browser. Audit events contain event names/user IDs, never tokens, QR secrets or recovery codes.

## Activation checklist

1. Apply `supabase/migrations/20260912_account_security.sql` to the intended Supabase environment before deploying this branch. It creates six private tables and service-role-only functions; no customer/billing records are changed.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, and the correct `NEXT_PUBLIC_SITE_URL`/site URL setting used by `env.siteUrl`. Set **`AUTH_SESSION_ENCRYPTION_KEY` to a separate random 32-byte hex value** (`openssl rand -hex 32`). Use the same key on all app instances. Replacing it invalidates existing sessions; do not put it in client environment variables or source control.
3. Enable Supabase email links and TOTP enrollment/verification. Configure SMTP and the exact `/account/callback` redirect URL for each authorized environment. Keep email-link expiry short. Verify the email template preserves Supabase’s normal confirmation URL and PKCE redirect.
4. Passkeys remain off by default (`AUTH_PASSKEYS_ENABLED=false`). Supabase currently labels its passkey API experimental. Before enabling it, configure its RP name, stable RP ID, allowed HTTPS origins and user-verification requirements. For local WebAuthn acceptance use `localhost`, not a numeric IP address. Verify enrollment, sign-in and removal on Safari/iCloud, Chrome/Google Password Manager and a hardware key. Do not switch RP IDs after enrollment. The installed SDK is pinned to 2.112.4.
5. Run `node --env-file-if-exists=.env.local scripts/check-account-auth.mjs`. Then perform real acceptance using controlled test accounts: plan signup → email → TOTP/passkey → recovery codes → purchase review; return sign-in; wrong/replayed/expired codes; lost-device recovery; last-method protection; two browsers with immediate revocation; direct owner-API denial before MFA; and staff recovery-queue access.
6. Deploy only after those checks succeed. Existing legacy owner cookies are invalidated and users must sign in again. The local development preview never bypasses production auth and never enrolls a real method.

The existing staff password/session mechanism is unchanged. Migrate staff to individual phishing-resistant accounts before granting any staff credential-reset capability. Vanta/SOC 2 work is separate; no compliance badge or certification claim was added.

## Maintenance

Treat encrypted provider tokens and audit history as sensitive. Define retention with the business; delete expired/revoked sessions after the agreed short retention, expired rate-limit rows, and old resolved recovery requests using a restricted maintenance job. Keep security audit history according to policy. Add operational alerting for recovery use, repeated failures and unusual session patterns before public launch. Back up recovery metadata under the same access controls as the customer database.

## Verification performed

- All 97 automated tests and TypeScript passed, and an isolated production build passed the development-tools exclusion check.
- Unit/route tests cover PKCE exchange gating, rejection of raw-token sessions, same-origin enforcement, owner access checks, authenticated encryption, recovery entropy/hashing, recent verification, account-scoped TOTP challenges, recovery ownership, last-method protection, and device revocation scope.
- `tests/account-auth-db.sql` passed against isolated PostgreSQL 17: migration applies, private-table/function permissions, invalid/cross-owner/replayed recovery, session rotation/restriction, other-session revocation, code replacement, rate limits and mutation leases.
- `tests/authentication-browser.mjs` checks all twelve screens at 320, 390, 768 and 1440px. Its workflow checks use an explicitly simulated API; native WebAuthn uses Chrome’s virtual authenticator. These are not live-provider acceptance tests.
- Deployment/provider verification remains required because no Supabase or Turnstile credentials are loaded in this checkout.

## Provider references

[Supabase passkeys](https://supabase.com/docs/guides/auth/passkeys), [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa), and the installed Next.js authentication/cookies guides informed the implementation. Use the provider’s current production capabilities when activating; never replace provider verification with a client-side success flag.
