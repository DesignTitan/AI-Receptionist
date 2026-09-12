# bubs

Product naming decision, 12 September 2026:

- Product name: **bubs**, written in lowercase.
- Intended public domain: **bubs.ai**.
- “AI receptionist” describes the product; it is not the product name.
- Keep the current green mascot, colors and typography. This naming decision does not replace the existing visual identity.
- Apply the name to product logos, page titles, account screens, receipts and newly enrolled authenticator entries.

Domain connection is a separate deployment step. The staging environment retains its existing Vercel preview hostname and staging-only callbacks until the public domain is explicitly connected. Do not redirect staging email callbacks to bubs.ai.

Repository names, infrastructure resource IDs, existing calendar product identifiers and historical documentation may retain AI-Receptionist for continuity.

## Domain connection status — 12 September 2026

After explicit user approval, `bubs.ai` was moved from `lead-gen` to `ai-receptionist` using Vercel’s project-domain move API. Verified the destination mapping (HTTP 200, verified true), removal from the old project (HTTP 404), and HTTPS access to the receptionist site.

The existing production deployment remains password-protected: the apex routes to `/login`, and `/account/login` routes through the site password gate. This domain transfer did not deploy the authentication branch or change production authentication settings. Staging activation remains a separate pending task.

Apex DNS already pointed to Vercel, so no registrar/nameserver changes were needed. No `www` reassignment was performed.
