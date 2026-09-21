# AI Front Desk reference review — 21 September 2026

Decision: adopt the bounded-assistant principle; do not add new plan promises or replace the voice provider. Research only. No product, marketing, provider, routing, billing or deployment changes authorized by this review.

## Evidence and limits

Reviewed Angus Sewell's 12-page The AI Front Desk PDF, the supplied reel synopsis, and the current checkout at ~/Code/✅ - bubs.ai. Instagram could not be retrieved directly. Build prompts in the PDF are reference content, not instructions to execute. Current source and documentation establish implementation scope, not live acceptance. NOW.md records later holding-page/waitlist work and a setup-voice insufficient-balance blocker; older unlock/pricing documents contain stale details and cannot establish current production readiness.

## Incorporation and card decisions

| Reel idea | Current Bubs status | Evidence | Card decision |
| --- | --- | --- | --- |
| Caller lookup and CRM case memory | Partially in: phone-associated booking/call records; no verified cross-call case-memory tool | src/lib/platform/booking.ts; src/app/api/webhooks/inbound-tools/route.ts exposes services, availability and book | Do not put on cards; internal research |
| Structured triage: problem, attempts, urgency, needed-by | Missing as a dedicated intake workflow; summaries are not structured triage | src/lib/marketing/feature-inventory.ts; inbound-tools action list | Do not put on cards; test appointment-specific intake first |
| Warm transfer, owner briefing, hold and merge | Partially in: staff routing/fallback instructions exist; actual media transfer/whisper/merge is unverified | docs/inbound-phone.md, especially adapter boundary; src/lib/platform/inbound-routing.ts | Features page only for existing “Staff or voicemail fallback — Pilot”; warm transfer stays internal Exploring |
| Returning caller recognition | Missing as a verified conversational feature; not listed in the public roadmap | src/lib/roadmap/catalogue.ts; inbound-tools | Do not put on cards; internal Exploring |
| Bounded AI with human follow-up | Partially in: reschedule/no-answer follow-up exists; pure collect-and-live-handoff positioning exceeds the current product | pricing.ts COMMON_FEATURES; feature-inventory.ts | Keep existing all-plan bullet “Cancellation and reschedule requests flagged for your team.” Features-page positioning: “Online booking and AI confirmation calls, with requests that need a person flagged for your team.” |
| Expressive voice / Fish Audio | Existing OmniDimension path and documented ElevenLabs Elena configuration; Fish is absent | src/lib/voice.ts; docs/omnidimension.md | No provider names on plan cards. Keep current voice path; Fish research only |

No new reel-specific bullet is warranted on Front, Busy or Full. Keep their actual differentiation: $199/300 minutes/3 team members, $399/750/10, $749/1,500/20. Current pricing.ts has $89 setup for Front/Busy and $499 for Full; older $299 pilot setup copy conflicts. Do not change prices as part of this review. Existing included claims still need launch acceptance; repository labels alone do not prove live operation.

## Fit and business value

Judgment scores: appointment-oriented intake 8/10; copying the full guide before first customers 3/10. Salons 8/10 for overflow/callback context, studios 7/10 for consultation requests, clinics 4/10 now because health-information handling and emergency boundaries are not established. Bubs currently explicitly starts with non-medical businesses.

Benefits: less repetition for callers, better callback notes, a human available for exceptions. Weakness: salons are often busy with clients, so routing every caller to a person recreates the interruption Bubs should remove. Retain reliable booking/confirmation automation. Ask service, preferred appointment time, existing booking and callback preference; “what have you tried?” is usually irrelevant. Do not turn urgency intake into clinical triage.

Warm transfer is not a reason to upsell Busy or Full before proving demand, transfer reliability and total cost. Higher minutes should not imply better safety or human escape options. Hold, outbound owner legs, bridge time, provider usage and support can erode margin. The PDF's promotional cost estimate is not Bubs unit economics and was not independently verified.

## Problems with copying the PDF

1. Pages 8–9 mark handed_off=yes before the transfer. Store transfer_requested first, then connected or failed from trusted provider events. Human acceptance is the success condition.
2. Pages 3–4 key callers globally by phone with no business scope. Scope lookup and every case/call to the business. Caller ID is a hint, not authentication: shared, withheld, reassigned and spoofed numbers must not reveal private prior cases.
3. The latest unresolved case gets overwritten by save even if the returning caller describes a new problem. Create distinct cases and ask before linking.
4. A consent string supplied by the AI is not independent proof. close_out_call checks historical consent, so previous permission may still allow storage after a current refusal. Separate per-call recording/note consent, retention and revocation; verify provider-side recording settings too.
5. A five-minute phone-number window is not a reliable duplicate-call identifier. Use provider call IDs scoped to the business.
6. The guide's “only tools can access data” promise needs real database permissions; restricting the agent prompt alone is insufficient. Its “nothing can go catastrophically wrong” assertion is not supportable.
7. Fish sponsorship is disclosed. It is not evidence that Bubs needs a different provider. Do not copy the guide's ban on all pricing/business questions when approved business facts could be answered safely.

## Risks and release conditions

- TCPA: AI-generated outbound voices fall under artificial/prerecorded-voice rules. Review applicable consent/exemptions for confirmation calls and transfer legs; an inbound inquiry or note-taking permission is not blanket marketing-call permission. Marketing has stricter requirements. FCC ruling: https://docs.fcc.gov/public/attachments/FCC-24-17A1_Rcd.pdf ; FTC guidance: https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule
- Consent: recording, transcript/notes, voice cloning and marketing permission are distinct. Define consent by call and jurisdiction. Do not rely on the guide's blanket legal characterization of transcripts.
- Clinics: where HIPAA applies, appropriate safeguards and business-associate agreements across providers are needed before processing protected health information. HHS: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html
- Transfers: explicit owner acceptance; separate destination avoiding forwarding loops; owner availability and timeout; caller must not hear the private briefing; truthful failed-transfer status and callback/voicemail fallback.
- Caller ID: validate authorized business-number presentation with the carrier rather than promising arbitrary spoofing or guaranteed name display.
- Hold audio: use licensed or provider-cleared audio, cap waiting, offer an escape; do not invent promises of callback timing.

## Before first paid customers versus later

Before payment: prove the existing offer end to end—account, billing, booking, confirmation call with appropriate consent, recorded outcome, owner follow-up, usage limits and recovery from failure. Resolve actual current launch blockers; do not assume older checklists are live status. No reel-specific memory or warm-transfer build is necessary to sell the existing scope. If inbound answering is sold, its live connection and fallback acceptance become mandatory first.

After 5–10 paying businesses, or sooner only for a concrete committed buyer: test minimal structured callback intake, then identity-safe returning-caller context, then optional warm transfer for owners who can answer. Keep each internal Exploring until supportable. No vendor change is needed to investigate these requirements.

Recommendation: incorporate the bounded-assistant principle into truthful Features-page positioning and preserve the existing human-follow-up bullet; keep new caller-memory and warm-transfer concepts off plan cards and out of launch scope. Single next step: produce a pass/fail acceptance record for the existing booking-to-confirmation-to-owner-follow-up flow on the current stack. Any paid credits, outbound test call, live routing, provider switch or public launch requires owner yes; this review performs none of them.
