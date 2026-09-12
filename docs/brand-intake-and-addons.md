# Brand intake and add‑ons

This form-first intake captures the must-have brand details for the phone AI before any line goes live.

Must-haves:
- Business name
- What you do (1 line)
- Hours + timezone
- Phone to answer
- Escalate-to name + number
- Top 3 call types
- Book vs take-message rule
- FAQs we never invent (price, service area)
- Greeting name

Optional (for later enrich):
- Website URL
- Social URLs

## Intake UI

- Location: `/account/brand` (owner only). Linked from the Account overview.
- Persistence: stored under `customers.config.brand` (JSON). Timezone and weekly hours provided in the form also update the existing business config.
- Scope: dev/locked only. The site gate and Stripe mode are unchanged; saving this form does not activate calls or publish anything.
- Next steps: production persistence and add-ons can build on this shape without a table migration.

