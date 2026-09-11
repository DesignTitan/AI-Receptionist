## Updated calculator design — September 11, 2026

The current UI supersedes the earlier illustrative ten-industry defaults below. It uses three initial inputs: industry, average collected sale and additional completed bookings. Output is gross incremental sales (sale × bookings), explicitly before all costs, not net return or a predicted recovery rate. The old arbitrary ticket defaults have been removed.

Benchmarks displayed above the inputs:
- Salon: $77 median per visit, Zenoti 2026 North American platform sample; 2% observed no-shows is context only, never used as a recovery assumption. https://www.zenoti.com/thecheckin/no-show-revenue-calculator
- Personal training: $55/hour average, $40–$100/hour range, Thumbtack US marketplace guide. One-hour paid session only; not membership revenue. https://www.thumbtack.com/p/personal-trainer-cost
- Photography: $358/job average with low/high averages $265–$483, Thumbtack US marketplace data. Service mix varies. https://www.thumbtack.com/p/photographer-prices

Sources checked September 11, 2026. Prices are context and editable starting points, not universal local averages. The sources’ sample limitations are displayed.

For medical/dental, actual collections are requested: ADA reports procedure/payer differences and discontinued its Dental Fees Survey. https://www.ada.org/resources/research/health-policy-institute/dental-care-market
Retail uses the business’s own order value; linked Shopify sales-report definitions provide the basis. https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report
Healthcare/wellness, pet services, home/auto, professional services and lessons/coaching likewise ask for actual collected fees; no representative cross-category average was verified. Thumbtack therapy/lesson pages could not be fully read (verification challenge). A grooming provider’s 2025 Ames, Iowa price guide was reviewed but excluded as a national benchmark: https://toppawgroomspa.com/assets/price_guide.pdf

Plan matching is a separate second step with no preselected usage/team/location values. It uses existing plan economics, not ticket size or presumed profit, and requires all three inputs. Multiple locations, teams above 20 or overages above the supported cap route to custom discussion. Standard CTA says “Review [plan] & sign up” and preserves the plan through /start?plan=. Setup and usage are disclosed before proceeding. No checkout/payment was submitted during testing.

---
Historical research and prior calculator design follow.

# Appointment value and plan comparison

Research checked 11 September 2026. Used for an adjustable scenario, not a performance promise.

## Evidence

- [Parikh et al., 2010 randomized outpatient trial](https://pubmed.ncbi.nlm.nih.gov/20569761/): 9,835 scheduled appointments in the three intervention groups; no-show rates 23.1% without reminders, 17.3% with automated calls, 13.6% with staff calls. Absolute differences vs no reminder: 5.8 and 9.5 percentage points. This is a healthcare study of older reminder systems, not a trial of our AI product. Cancellations increased with reminders; that alone does not prove additional completed visits or income.
- [Zenoti 2026 vendor benchmark summary](https://www.zenoti.com/thecheckin/no-show-revenue-calculator): salon median ticket $77, 2% no-shows; full-service salons $114, 1%; medspas $216, 4%; non-membership spas $103, 1%. Medians are not averages. Vendor-platform samples are not universal population estimates. We use only the $77 salon median as a cited starting value; other industry values are plainly hypothetical examples.
- [Cochrane 2013 review](https://www.cochrane.org/evidence/CD007458_mobile-phone-messaging-reminders-attendance-healthcare-appointments): low/moderate-quality evidence for text reminders improving healthcare attendance, with similar attendance effects to phone reminders. This supports reminders generally, not superiority of AI voice calls.
- [NHS England, March 2024](https://www.england.nhs.uk/2024/03/nhs-ai-expansion-to-help-tackle-missed-appointments-and-improve-waiting-times/): reports 8 million missed outpatient appointments, 6.4% of 124.5 million, and estimated annual system cost £1.2 billion. Not used as a small-business revenue benchmark: system costs are not collected sales.

## What we can say

An unfilled appointment can leave sale value at risk. Confirmation calls can surface attendance problems and opportunities for the team to follow up. A connected call, cancellation, reschedule and completed paid appointment are different outcomes. There is no verified universal dollar loss per unanswered outbound call, no measured recovery rate for this product, and no supported claim that every unanswered inbound call could currently be recovered by it.

## Calculation

Inputs are editable: collected sale value, percentage left after incremental service costs, unfilled missed bookings, additional bookings the visitor believes could be kept, billable minutes and first-month/ongoing cost period.

- Revenue at risk = unfilled missed bookings × collected sale value.
- Recovered revenue = additional completed bookings × collected sale value.
- Contribution before subscription = recovered revenue × share remaining after service costs.
- Plan cost = published monthly fee + excess billable minutes × $0.49 + selected setup fee.
- Estimated value after service and plan costs = contribution − plan cost. Negative results remain visible.
- Extra appointments to cover cost = ceiling(plan cost / contribution per appointment); no finite break-even at zero contribution.

This is a scenario, not accounting net profit or forecast. Deduct service costs such as commissions, materials, parts, transaction fees and variable labor. Deduct retained deposits/cancellation fees from revenue genuinely at risk; do not double count deferred visits, bookings refilled without the product or membership visits with no incremental fee. Taxes, unrelated overhead, incremental manual follow-up labor and repeat-customer lifetime value are not included. Capacity, reachability, consent, staff execution and service demand constrain results. Usage input must reflect per-call rounding and retries. Spending limits and purchased capacity still apply.

The industry table compares ten explicitly labeled example tickets against all three published subscription prices at the visitor-selected margin. Its separate table note excludes setup/overage; the main scenario includes them. “Custom / Enterprise” has no invented price or ROI; availability and scope require a written quote.

## Measure before making claims

Track eligible bookings, call attempts and connections, confirmed attendance, cancellation lead time, completed/paid visits, genuinely refilled slots, net collected revenue, retained fees, staff time and total call cost. Compare against a matched baseline or controlled rollout, adjusting for seasonality, service mix and existing reminders. Get approval before publishing customer results or cross-industry efficacy claims.
