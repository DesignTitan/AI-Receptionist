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

`bubs.ai` is owned by the current Vercel team but is assigned to the separate `lead-gen` project. Its apex DNS already points to Vercel (`76.76.21.21`); `www.bubs.ai` is a CNAME to the apex.

No mapping or DNS changes were made. Automatic approval review rejected a forced reassignment because it would displace the existing live project and the attempted command included `www`. Explicit user approval to move `bubs.ai` from `lead-gen` to `ai-receptionist` is pending. Any `www` reassignment requires its own authorized scope.
