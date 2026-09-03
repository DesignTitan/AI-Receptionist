# Roadmap (launch Thursday 1 October 2026)

Visual, tickable version: the "Receptionist Launch Roadmap" artifact. Weekly scorecard at the
end. Companion docs: pricing-economics.md, voice-platforms.md, omnidimension.md.

## How a customer gets on today
You do it. A customer is a config directory, a phone number bought in OmniDimension and attached
to an Ava clone, and a Stripe invoice. Nothing on the site lets a stranger sign up. The four weeks
below change that.

## Week 1 · 3–9 Sep · Decide and unblock
Goal: name and domain chosen, every key on Vercel, first three posts out.
- Build: Supabase service key; Resend + owner email + sending domain; rotate webhook secret;
  product name + domain; Early deployers plan + request voicemail detection; customers table
  and /admin queue (paid → provisioning → live → paused).
- Marketing: claim handles (Instagram, TikTok, LinkedIn, X); record Ava calling you (30 s);
  three posts (the call reel, "a salon misses 1 in 4 calls", the price card); start the email
  list, target 25.
- Sales: list 50 local businesses (no clinics); message 10; write the beta offer (first five:
  setup waived, $149 locked a year, for a testimonial and a weekly 10-minute call).

## Week 2 · 10–16 Sep · A stranger can sign up
Goal: signup with a card works on staging; one business agreed to the beta.
- Build: "Start here" form (business, trade, hours, roster, colour, area code, Stripe
  Checkout); Stripe products for three plans + setup; welcome and "line is live" emails; one
  deployment serving every customer by subdomain (wildcard domain); terms, privacy, recording
  notice; data-deletion script.
- Marketing: 5 posts (2 reels, 2 carousels, 1 founder post); link-in-bio with the demo-call
  button; draft the three launch emails (day 0, day 3, day 7).
- Sales: 25 conversations cumulative; first beta business signed and set up by hand; listen to
  every real call and fix the script the same day.

## Week 3 · 17–23 Sep · Three businesses live
Goal: three beta businesses taking real calls; `npm run provision` sets one up end to end.
- Build: `npm run provision` works the queue (buy number by area code, clone Ava, mark live,
  email); customer dashboard shows usage and overage; ops queries (failed calls, failed emails,
  function errors); weekly backup; voicemail message on Ava once detection is on.
- Marketing: 5 posts, one a beta customer's reaction; post in 3 local business groups; list to 120.
- Sales: 40 conversations; 3 beta live with Day 7 check-ins booked; first testimonial.

## Week 4 · 24–30 Sep · Dress rehearsal
Goal: launch rehearsed end to end by Tuesday; Wednesday for fixes; nothing new after Wednesday.
- Build: buy Ava's number by Fri 26 Sep (OmniDimension, $5/mo, id on Vercel); remove the site
  password, real domain live, sitemap, share image; full dry run as a stranger; re-check the
  demo-call limits (Turnstile, 3/connection/hour, 2/number/day, daily cap); freeze Wed 30 Sep.
- Marketing: launch reel filmed and scheduled; launch emails loaded, list at 200; decide on
  Product Hunt (only if you will be at the keyboard all day).
- Sales: 50 conversations; 2 businesses warmed to sign up on launch morning; referral offer
  (a month free per referred business).

## Thu 1 Oct · Launch
Goal: five paying customers within two weeks.
- Build: run provision every morning, check the queue, listen to two calls; fix only what real
  customers hit, ship Fridays.
- Marketing: reel + email at 8am; reply to everything the same day; one post a day for 7 days.
- Sales: demo call the day anyone asks, follow up within the hour; 5 paying by 14 Oct.

## October · First ten, learn the form
Goal: 10 paying by 31 Oct; weekly call reviews; the form stops getting things wrong.
- Build: fold every manual correction into the form; provisioning runs itself after payment;
  Supabase Auth so each business has its own login.
- Marketing: 4 posts a week, 2 customer stories; first case study; list to 500.
- Sales: 10 paying; Day 7 and Day 30 check-ins; Growth seat at 5 customers.

## November · Self-serve, end to end
Goal: signed up to live line in under ten minutes, zero steps from you; 20 paying by 30 Nov.
- Build: signup provisions itself; Stripe subscription webhook sets plan, cap, overage; customers
  edit roster and hours themselves; Retell adapter if the 15-customer trigger fires.
- Marketing: referral programme on the dashboard; 4 posts a week; salon series.
- Sales: 20 paying; price review (Full desk to $699 or 1,200-call cap if calls run over two min).

## Triggers, not dates
- 5 customers: OmniDimension Growth seat ($200).
- 15 customers or 6,000 talk minutes: build the Retell adapter, shadow-test on one customer.
- 20 customers or 10,000 minutes: cut over to Retell if the shadow month behaved ($300–650/mo).
- 300 customers or a voice bill over $15k/mo: enterprise rate or own the stack (Twilio numbers,
  LiveKit or Pipecat, direct Deepgram/ElevenLabs/OpenAI) at 6–8¢/min; pays for the engineer.
  At 1,000 customers: ~520,000 min/mo, $55–65k voice cost on ~$300k revenue.
- Also at scale: STIR/SHAKEN caller-ID attestation and number reputation, TCPA review, BAA
  path before any clinic; hire the first person when support passes 10 hours a week.

## Later
- Several lines per business, each with its own job (confirmations, day-before reminders,
  after-hours intake, win-back, one per location): a lines table, a picker, dispatcher by
  purpose; add-on pricing ($5 number, calls on the same plan). First ask will be a second location.
- Calendar / practice-software sync for the first customer who makes it a condition.
- Industry landing pages; partnerships with booking-software communities.

## Weekly scorecard (Fridays)
| Week | Posts | Conversations (cum.) | Beta / paying | Email list | Build |
|---|---|---|---|---|---|
| 1 · 3–9 Sep | 3 | 10 | 0 | 25 | 6 items |
| 2 · 10–16 Sep | 5 | 25 | 1 beta | 60 | 6 |
| 3 · 17–23 Sep | 5 | 40 | 3 beta | 120 | 6 |
| 4 · 24–30 Sep | 5 + launch reel | 50 | 3 live, 2 waiting | 200 | all |
| Launch · 1–14 Oct | 7 | 60 | 5 paying | 300 | fixes only |
| October | 4/week | 40/week | 10 paying | 500 | self-serve started |
| November | 4/week | 40/week | 20 paying | 800 | self-serve live |
A number red two weeks running gets the next week's hours.
