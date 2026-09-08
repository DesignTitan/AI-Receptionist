# Pricing economics — minutes-v2

Effective for new subscriptions, 8 September 2026. USD, before tax. Sandbox until live acceptance is complete. Supersedes the old $149/$299/$599 call-count model.

| Plan | Monthly | Included started minutes | Approx. 2-minute calls | Bookable staff |
| --- | ---: | ---: | ---: | ---: |
| Front desk | $199 | 300 | 150 | 3 |
| Busy desk | $399 | 750 | 375 | 10 |
| Full desk | $749 | 1,500 | 750 | 20 |

All plans include one location, branded online booking, dedicated confirmation number, AI confirmation calls, recordings/transcripts/summaries, flagged cancellation/reschedule requests, usage controls and email support. No calendar sync, multiple locations, unlimited calls or inbound receptionist service is promised. Setup is $1,000 once. Extra minutes are $0.49 each, disabled until the owner chooses a recurring extra-spend limit.

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

Setup leaves $963.70 after an assumed 3.6% + $0.30 fee, before labor. Budget no more than $450 setup labor and one-time expenses to retain roughly $514 contribution. Track actual time; this is a budget, not a measured guarantee.

## Customer value and plan changes

Call counts are estimates only. Each call rounds up separately; a 61-second call consumes two minutes. Unused minutes expire at the Stripe renewal date. A call is capped at five minutes; the app reserves five before dispatch and releases the unused portion after a final report. Up to four remaining minutes may be unavailable to start another call. Failed dispatches with uncertain provider state remain reserved until reviewed.

At these rates, Busy becomes cheaper than Front at approximately 709 monthly minutes; Full becomes cheaper than Busy at approximately 1,465. The dashboard compares projected totals and recommends a plan, without automatically changing it. Team size also constrains the appropriate tier. Operators perform agreed plan changes at renewal; mid-cycle changes are rejected until explicit reconciliation exists.

## Sources checked 8 September 2026

- [OmniDimension pricing](https://docs.omnidim.io/docs/pricing): monthly credits, extra minutes and separate telephony/concurrency/number considerations.
- [Stripe pricing](https://stripe.com/pricing): US domestic card 2.9% + $0.30 and Billing pay-as-you-go 0.7%.
- [Stripe fixed fee plus overages](https://docs.stripe.com/billing/subscriptions/usage-based-v1/use-cases/flat-fee-and-overages): fixed monthly charge plus graduated metered usage.
