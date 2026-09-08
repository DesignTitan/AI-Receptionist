# Pricing economics — minutes-v2

Effective for new subscriptions, 8 September 2026. USD, before tax. Sandbox until live acceptance is complete. Supersedes the old $149/$299/$599 call-count model.

| Plan | Monthly | Included started minutes | Approx. 2-minute calls | Bookable staff |
| --- | ---: | ---: | ---: | ---: |
| Front desk | $199 | 300 | 150 | 3 |
| Busy desk | $399 | 750 | 375 | 10 |
| Full desk | $749 | 1,500 | 750 | 20 |

All plans include one location, branded online booking, dedicated confirmation number, AI confirmation calls, recordings/transcripts/summaries, flagged cancellation/reschedule requests, usage controls and email support. No calendar sync, multiple locations, unlimited calls or inbound receptionist service is promised. Setup is $299 once for the first 10 pilot customers and $499 standard afterward. Availability and the exact setup fee are confirmed at checkout. Extra minutes are $0.49 each, disabled until the owner chooses a recurring extra-spend limit.

Both setup prices cover one business, booking-page configuration, dedicated phone setup and one test session. Custom integrations and extra work require a separate scope and quote; substantial custom projects may start at $1,000, but are never added automatically to checkout. The monthly plans and included minutes are the same for pilot and standard customers.

## Cost assumptions and contribution

Budget $0.20 per started minute, $5 per customer number, $25 monthly support reserve and 3.6% + $0.30 collection/Billing fees. At full included usage:

| Plan | Budgeted direct cost | Contribution | Contribution margin |
| --- | ---: | ---: | ---: |
| Front desk | $97.46 | $101.54 | 51.0% |
| Busy desk | $194.66 | $204.34 | 51.2% |
| Full desk | $357.26 | $391.74 | 52.3% |

An extra $0.49 minute contributes about $0.272 after $0.20 delivery and 3.6% fees (55.6%), before shared overhead. 100 extra minutes cost the customer $49. Card/region/currency-specific fees can differ.

This is contribution, not guaranteed net profit. Shared hosting/database/voice subscription, acquisition, administration, taxes and refunds still have to be paid. Deduct shared monthly overhead once from total contribution; do not charge the same shared bill to every customer. For example, $300 shared overhead requires at least three fully used Front customers to cover it, before additional acquisition/tax costs. Included voice-provider credits should reduce actual usage expense; do not double-count them as both free minutes and a second expense.

Historic sample: two demo calls indicated roughly $0.115 AI/minute + $0.03 telephony/rounded minute. That sample is not a contracted universal rate. The $0.20 allowance is a planning buffer; verify the selected model, telephony geography, number, concurrency and provider invoice before each launch. The staff dashboard shows the planning contribution and exposes unresolved usage; provider costs are retained when reported. Review actual total invoices monthly. If direct cost exceeds the model, adjust new-customer pricing or delivery cost before expanding.

## Setup budget and pilot controls

Keep direct onboarding labor and one-time expenses within $150 per business. At the conservative 3.6% + $0.30 fee assumption, the $299 pilot setup leaves $287.94 before onboarding costs and about $137.94 contribution after the $150 allowance. The $499 standard setup covers the same scope and leaves $480.74 before onboarding costs, or about $330.74 after that allowance. These figures exclude shared overhead and tax; track actual time and expenses for each customer instead of treating the target as a measured guarantee.

The pilot discount is limited to 10 places. Checkout reserves a place atomically and freezes the quoted setup price for that attempt. Pending checkouts hold their places; only a Stripe-confirmed expired checkout can release an unpaid reservation. A confirmed setup payment permanently consumes the place, including after cancellation, refund or account deletion. An uncertain response requires reconciliation before release. This keeps concurrent signups from selling more than 10 discounted setups.

Initial totals, including the first monthly plan and before tax, are $498/$698/$1,048 for pilot customers and $698/$898/$1,248 at standard setup pricing. Setup does not repeat on renewal. If delivery exceeds the $150 target, review the scope and actual effort before accepting more customers; the pilot discount is a bounded learning expense, not a promise of free custom work.

## Customer value and plan changes

Call counts are estimates only. Each call rounds up separately; a 61-second call consumes two minutes. Unused minutes expire at the Stripe renewal date. A call is capped at five minutes; the app reserves five before dispatch and releases the unused portion after a final report. Up to four remaining minutes may be unavailable to start another call. Failed dispatches with uncertain provider state remain reserved until reviewed.

At these rates, Busy becomes cheaper than Front at approximately 709 monthly minutes; Full becomes cheaper than Busy at approximately 1,465. The dashboard compares projected totals and recommends a plan, without automatically changing it. Team size also constrains the appropriate tier. Operators perform agreed plan changes at renewal; mid-cycle changes are rejected until explicit reconciliation exists.

## Sources checked 8 September 2026

- [OmniDimension pricing](https://docs.omnidim.io/docs/pricing): monthly credits, extra minutes and separate telephony/concurrency/number considerations.
- [Stripe pricing](https://stripe.com/pricing): US domestic card 2.9% + $0.30 and Billing pay-as-you-go 0.7%.
- [Stripe fixed fee plus overages](https://docs.stripe.com/billing/subscriptions/usage-based-v1/use-cases/flat-fee-and-overages): fixed monthly charge plus graduated metered usage.
