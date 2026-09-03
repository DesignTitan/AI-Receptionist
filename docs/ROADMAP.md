# Roadmap (launch 1 October 2026)

## How a customer gets on today
You do it. A customer is a config directory under `src/verticals/<slug>/` plus their own
deployment (`NEXT_PUBLIC_TENANT=<slug>`), a phone number bought in OmniDimension and attached to
an Ava clone, and a Stripe invoice. Nothing on the site lets a stranger sign up.

## Phase 1 · by 1 Oct · launch with a self-serve front, concierge behind it
- Phone number on Ava (OmniDimension → Phone numbers, $5/mo) by 26 Sep.
- Early deployers plan; request voicemail detection.
- Supabase service key, Resend + OWNER_EMAIL, rotated webhook secret on Vercel.
- "Start here" signup: business name, trade, hours, roster, brand colour, preferred area code,
  card via Stripe Checkout. Creates the account and emails "your line is being set up".
- `scripts/provision.ts`: you run it once per signup the same day. It buys the number
  (OmniDimension `searchPhoneNumbers` + `purchasePhoneNumber`), clones agent 248069 with the
  customer's variables, writes the tenant config, deploys the subdomain, emails "your line is live".
- From the customer's side: sign up, pay, live within hours. No call with you required.

## Phase 2 · Oct · first five customers
Listen weekly, fix the script, keep `docs/customers.md` current (the monthly seat check counts
it). Learn what the signup form gets wrong before automating the last mile.

## Phase 3 · Nov · fully self-serve
Signup runs the provisioning script itself. Supabase Auth gives each business a login;
Stripe subscription webhook sets plan and call cap; usage and overage in their dashboard.
Target: signed up to live line in under ten minutes, zero steps from you.

## Trigger · platform switch
- 15 customers or 6,000 talk minutes a month: build the Retell adapter (one file behind the
  existing voice adapter interface) and shadow-test.
- 20 customers or 10,000 minutes: run one customer on Retell for a month, cut over if it behaves.
- Reported by the monthly "omnidimension-seat-check" task. Comparison in `docs/voice-platforms.md`.

## Later · several lines per business, each with its own job
A business owns a list of lines, not one number. Each line: a number, an agent, a purpose
(confirmations, day-before reminders, after-hours intake, win-back calls, one per location) and
its own script. Both OmniDimension and Retell allow many agents and numbers per account, so
this is a `lines` table (business, number, agent id, purpose), a picker in the dashboard, and
the dispatcher choosing the line by purpose. Price as an add-on: a second line is another $5
number, calls count against the same plan. Explore when the first customer asks; the likely
first ask is a second location.
