# What a call costs, and what the plans keep

Measured from two real calls on the OmniDimension line (agent 248069, 2 Sep 2026), not from
the price list. Re-run this after the first month of a real customer's traffic.

## Cost per call

| Item | Rate | Where it comes from |
|---|---|---|
| Voice AI (GPT-4.1-mini + ElevenLabs + Deepgram) | $0.115 per minute, prorated by the second | `voiceai_cost` on both call logs: $0.155 for 81 s, $0.021 for 11 s |
| Telephony | $0.030 per minute, rounded up to the whole minute | `telephony_cost`: $0.03 for an 11 s call, $0.06 for 81 s |
| An unanswered call or voicemail | about $0.05 | a 10 s attempt still bills one telephony minute |

So an answered call costs roughly **$0.145 per minute of talk**. A typical confirmation call
(1 to 2 minutes) lands between **$0.15 and $0.30**. A reschedule that runs three minutes is
about $0.44.

## Fixed costs

| Item | Per month | Shared or per customer |
|---|---|---|
| OmniDimension plan | $36 (Early deployers, 588 min) rising to $200 (Growth, 3,571 min) | shared |
| Phone number | $5 | per customer (each business gets its own line) |
| Supabase | $25 Pro, then $10 per extra project | $25 shared + $10 per customer |
| Vercel Pro | $20 | shared |
| Resend | free to 3,000 emails, then $20 | shared |
| Cloudflare Turnstile | free | shared |
| Stripe | 2.9% + $0.30 per charge | per customer |
| Extra concurrency (only the biggest plan) | $6.74 per slot | per customer |

Shared overhead is about **$100 a month** at the start and about **$265** once call volume pushes
OmniDimension to the Growth plan. Per-customer fixed cost is **$15** plus card fees.

## What each plan keeps (1.5 min average call, 20% unanswered, plan fully used)

| Plan | Price | Calls | Variable cost | Fixed per customer | Gross profit | Margin |
|---|---|---|---|---|---|---|
| Front desk | $149 | 200 | $38 | $20 | $91 | 61% |
| Busy desk | $299 | 600 | $114 | $24 | $161 | 54% |
| Full desk | $599 | 1,500 | $286 | $40 | $273 | 46% |

Nobody uses the whole plan every month. At a more realistic 70% utilisation the margins are
about 70%, 64% and 58%.

## Which OmniDimension plan to sit on

One OmniDimension bill covers every customer's minutes. Business plans are a cheap seat with
pricier minutes; agency plans (OmniRelay) cost more up front, charge less per minute, and add
white-label logins and client workspaces. Our customers never log into OmniDimension, so the
white-label part is worth nothing here and the choice is simply which bill is lower.

| Plan | Seat | Included min | Rate beyond |
|---|---|---|---|
| Business · Starter | $15 | 179 | $0.093 |
| Business · Jump Starter | $30 | 395 | $0.084 |
| Business · Early deployers | $36 | 588 | $0.0745 |
| Business · Growth | $200 | 3,571 | $0.061 |
| Agency · Launch Partner | $149 ($99 for two months) | 500 | $0.0527 |
| Agency · Growth Partner | $199 | 2,000 | $0.0473 |
| Agency · Scale Partner | $299 | 3,500 | $0.040 |

At the 40/40/20 plan mix and 1.5-minute calls, each customer is about 520 talk minutes a month.

| Customers | Talk minutes | Cheapest seat | Bill |
|---|---|---|---|
| 1 | ~520 | Business · Early deployers | $36 |
| 3 | ~1,560 | Business · Early deployers | $108 |
| 5 | ~2,600 | Early deployers or Growth | $186 to $200 |
| 10 | ~5,200 | Business · Growth | $299 |
| 20 | ~10,400 | Agency · Scale Partner | $575 |
| 30 | ~15,600 | Agency · Scale Partner | $783 |

**Recommendation:** stay on the $36 business plan to about five customers, business Growth
from five to fifteen, and the agency Scale Partner plan only past roughly 10,000 talk minutes
a month or when a customer wants their own branded OmniDimension login. Launch Partner is
never the cheapest once its intro price ends.

**Verify on the billing page:** the two real calls were charged $0.115/min for voice AI, above
every listed plan rate, so the models appear to bill on top of the plan rate. That surcharge is
the same on every plan and does not change which is cheapest, but it is what the per-call
numbers above rest on.

## The two things to watch

- **Overage.** 30 cents a call clears cost at 1.5 min (about 24 cents) but not at 2.5 min
  (about 38 cents). If average calls run long, raise overage to 40 cents, or bill overage per
  minute. Nothing on the site promises the rate is permanent.
- **Full desk.** It is the thinnest plan because telephony minutes scale with calls. If the
  first Full desk customer averages over two minutes a call, the honest fix is $699 or a
  1,200-call cap, not a smaller number on the page.

## Break-even

Shared overhead of $100 a month is covered by the first Front desk customer. At Growth-plan
overhead ($265) you need two customers on any mix of plans. Setup fees ($1,000) cover the
onboarding hours and are profit beyond that.

The interactive version of this sheet, with the assumptions as sliders, is the
"Receptionist Unit Economics" artifact.
