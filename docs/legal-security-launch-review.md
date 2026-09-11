# Legal, privacy and security launch review

Prepared 11 September 2026. **Working checklist for counsel and operational owners; not approved legal advice, a security audit, or a claim of exhaustive compliance.** The reviewed product is an appointment-booking SaaS with AI outbound calls, call recordings/transcripts, sales callbacks, subscriptions and industry demos. Calling currently accepts US/Canadian numbers. Company jurisdiction, target markets, production data flows, contracts and audit evidence are not yet verified. Applicability must be determined before publication; a footer is not a substitute for operational controls.

## What was added

The homepage footer links to `/legal` draft sections covering terms, billing, acceptable use, AI/calling, accessibility, company identity, privacy, cookies, rights, consumer health data, data processing, subprocessors, retention, security, vulnerability disclosure, assurance, healthcare/BAA and availability. LinkedIn, Instagram, Facebook and YouTube link to clearly labeled local placeholders, not invented accounts. The hub is marked noindex. No cookie preferences, privacy-request intake or security-reporting mailbox is represented as functional. No compliance logos appear.

## Decide scope first — counsel + founder

- [ ] Confirm legal entity, registered address, incorporation/operating jurisdictions, official domain, privacy/security/legal contacts and complaints process.
- [ ] Identify customer and caller locations, whether B2B/consumer rules apply, and where data is stored or accessed. A US/Canadian number does not prove residence or location.
- [ ] Document which industries and data types are permitted: healthcare, minors, financial advice, legal services and sensitive consumer data require separate assessment.
- [ ] Confirm whether inbound calls, SMS, marketing calls, voice cloning, advertising analytics and international sales are actually enabled. Do not draft policies around unimplemented features.
- [ ] Have counsel map US federal/state, Canadian federal/provincial (including Quebec), and any EU/UK or other market requirements. Do not assume one notice covers all markets.

## Priorities before accepting live customers

| Area | Documents / footer location | Operational evidence or decision needed |
| --- | --- | --- |
| Contract and legal identity | Terms; company contact | Service scope, authority to contract, acceptance/version record, customer duties, suspension, IP ownership/licenses, liability and indemnities, dispute forum, warranties, notices and enforceable jurisdiction-specific terms. |
| Subscription charges | Billing and cancellation | Price/setup/usage disclosures, authorization, renewal terms, cancellation path, refunds, taxes, charge disputes, notices and recordkeeping. Review ROSCA and state renewal laws where applicable; do not rely on the superseded 2024 FTC click-to-cancel announcement. |
| AI calls and recording | AI & call recording | Separate purposes for requested demos, transactional appointment calls and marketing. Determine applicable consent standard, evidence and retention, consent withdrawal, do-not-call suppression, calling hours/time zones, caller identification, recording laws, AI disclosure, opt-out/human alternative and cross-border rules. Test provider behavior, not just page wording. |
| Privacy | Privacy notice | Data inventory including bookings, phone numbers, recordings, transcripts, summaries, identifiers, billing metadata, uploaded content and logs. Define purposes, legal bases where relevant, recipients, retention, training use, sale/sharing analysis and contact channels. |
| Rights and cookies | Privacy choices; cookie notice | Applicable rights, verified intake, identity checks, response deadlines, appeals, deletion propagation, authorized agents, Global Privacy Control/opt-outs where applicable. Inventory cookies/local storage/pixels; implement consent and withdrawal where required. A placeholder link does not satisfy these obligations. |
| Processor relationships | DPA; subprocessors | Controller/processor roles per activity, customer instructions, data ownership, vendor contracts, confidentiality, subprocessor notice/objection terms, audit help, incident assistance, data return/deletion, transfer mechanisms and regional hosting facts. |
| Health information | Consumer health data; healthcare & BAA | Assess HIPAA covered-entity/business-associate scope, executed BAAs across the eligible vendor chain, permitted services and safeguards. Also assess state consumer-health laws and FTC health breach rules outside HIPAA. Avoid broad “HIPAA compliant” marketing. |
| Security and incidents | Security; report vulnerability | Verify encryption and key management, MFA/access review, tenant authorization, signed recording access, webhook validation, abuse limits, secrets, logging/redaction, patching/dependencies, backups/restore tests, breach triage and jurisdiction-specific notices. Establish an actually monitored reporting address before publishing one. |
| Accessibility | Accessibility statement | Audit keyboard, focus, screen readers, contrast, forms/errors, captions/transcripts, motion and mobile. Agree target (e.g. WCAG 2.2 AA) and document tested scope and exceptions; no blanket certification. |
| Service promises | Availability & support | Define measured uptime, exclusions, maintenance, support hours, incident/status communications, disaster recovery and any contracted credits. Do not promise unsupported 24/7 human support. |

## Telephony and AI specifics

- [ ] Counsel approves distinct consent language for AI demo calls versus human sales callbacks; a supplied phone number alone is not blanket marketing authorization.
- [ ] Audit whether the recording starts before an appropriate notice/consent; determine an alternative if a caller declines. Recording and outbound-call consent are separate questions.
- [ ] Keep consent source, purpose, number, timestamp, wording version and withdrawal records; propagate suppression to every provider and customer workflow.
- [ ] Check TCPA/FCC, FTC telemarketing, state mini-TCPA and wiretap/all-party consent rules. Assess number reassignment, list sourcing, call frequency, caller-ID integrity, spam labeling and applicable carrier/provider registration rules.
- [ ] Review Canadian CRTC unsolicited telecommunications/ADAD/DNCL rules for voice; separately assess CASL for commercial email/text. Do not treat them as interchangeable.
- [ ] Clearly disclose AI where required, ensure voices/assets are licensed, prohibit impersonation and unsupported advice, establish human handoff and complaint handling, and label fictional demonstrations honestly.
- [ ] Define emergency limitations, failed-call handling, appointment confirmation authority, cancellation/rescheduling limits and safeguards against inaccurate summaries or invented bookings.
- [ ] Assess EU AI Act classification, transparency, provider/deployer roles and current effective dates if serving EU users. Do not label ordinary appointment scheduling high-risk without a use-case assessment.

## Additional conditional review — do not assume all apply

- [ ] State privacy thresholds and exemptions; health-data statutes even where general privacy thresholds do not apply; Canadian PIPEDA/provincial privacy laws and Quebec language/contract/privacy requirements.
- [ ] GDPR/UK GDPR territorial scope, records of processing, lawful bases, DPIAs, DPO/representative requirements where triggered, processor terms, transfer safeguards and automated decision rights where relevant.
- [ ] Children: COPPA and other minors' privacy rules if triggered, guardian authority, school/FERPA contracts if serving schools, age-appropriate notices and recording of minors. An adult uploading information about a child is not automatically the same as a child-directed service.
- [ ] Voiceprints/biometrics if identification is added; recording audio alone should not be mislabeled biometric authentication.
- [ ] Financial-sector customer obligations/GLBA where applicable, professional confidentiality, privilege, regulated advice and contractual vendor due diligence.
- [ ] Consumer protection and advertising substantiation: performance/savings, customer testimonials, AI-generated marketing images, endorsements, referral incentives and fictional business names.
- [ ] Brand/trademark clearance, image/model/voice/music licensing, staff/contractor IP assignments, third-party and open-source notices; consider DMCA process only if relevant to hosting user content.
- [ ] Sanctions/export controls and country restrictions, reseller/telecom obligations if the service model triggers them, insurance (cyber and professional/technology E&O), accessibility procurement requirements and enterprise security questionnaires.

## Certifications and assurance — evidence before badges

| Item | What to evaluate | Current website posture |
| --- | --- | --- |
| SOC 2 | Independent CPA examination/report scope, Type I vs Type II, period, exceptions and report distribution. It is not a universal government certification. | Unverified; no report or badge claimed. |
| ISO/IEC 27001 | Business need, scoped information-security management system, accredited certification evidence, issuer, dates and exclusions. | Unverified; no certification claimed. |
| PCI DSS | Actual payment integration and scope, merchant/acquirer validation and applicable assessment. Outsourcing to a payment processor does not erase merchant responsibilities. | Unverified; no “PCI certified” badge. |
| HIPAA | Applicability, risk analysis, safeguards, BAAs and permitted vendor services; a logo is not a BAA or proof. | No compliance claim; healthcare review required. |
| GDPR/CCPA/PIPEDA | Applicable legal obligations and demonstrable processes, rather than an invented certification seal. | Applicability/implementation pending. |
| Accessibility | Test report, standard/version, coverage and ongoing remediation. | No untested conformance claim. |
| NIST CSF | Optional framework for organizing governance and security work, not a product certification. | Review framework only. |

## Product evidence to collect — engineering + operations

Source review shows integrations/configuration paths for voice providers, Supabase, Stripe, Resend and Cloudflare Turnstile. This is a **candidate inventory**, not a verified production subprocessor list. Confirm enabled vendors, hosting, underlying model providers, subprocessors, data locations, vendor retention/training settings, executed agreements and whether each service is covered by any claimed assurance. No secrets or production customer data were inspected for this checklist.

For every approved public claim retain an owner, evidence link, scope, review date and renewal date. Record real deletion tests, access-control tests, incident drills and backup restoration results. Connect privacy/cookie/reporting channels before activating final labels. Establish legal sign-off and periodic review; do not publish fabricated effective dates, contacts, audit status, SLAs or consent guarantees.

## Primary research sources

These sources informed the review categories; counsel should verify current texts and local applicability at launch.

- [FCC ruling on AI-generated voices under the TCPA](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf): AI voice calls fall within artificial/prerecorded-voice rules; applicability and consent depend on the call.
- [Canadian privacy regulator: recording customer calls](https://www.priv.gc.ca/en/privacy-topics/surveillance/02_05_d_14/): PIPEDA recording guidance.
- [CRTC key telemarketing rules](https://crtc.gc.ca/eng/phone/telemarketing/tobligations/rules-regles.htm) and [CASL FAQs](https://www.crtc.gc.ca/eng/com500/faq500.htm): voice and commercial electronic messages require separate analysis.
- [FTC CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business): commercial-email identity and opt-out requirements.
- [California Attorney General: CCPA](https://www.oag.ca.gov/privacy/ccpa): applicability, notices and rights.
- [EDPB controller/processor roles](https://www.edpb.europa.eu/sme/learn-the-basics/data-controller-or-data-processor_en) and [international transfers](https://www.edpb.europa.eu/sme/be-compliant/international-data-transfers_en): roles and cross-border safeguards.
- [ICO cookies and similar technologies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/): storage/access technology review and consent considerations.
- [HHS HIPAA cloud guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html): cloud business-associate considerations and agreements.
- [FTC Health Breach Notification Rule basics](https://www.ftc.gov/business-guidance/resources/health-breach-notification-rule-basics-business): assess coverage beyond HIPAA.
- [Washington Attorney General consumer health data guidance](https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy): distinct consumer-health privacy obligations and notices.
- [FTC breach response guidance](https://www.ftc.gov/business-guidance/resources/data-breach-response-guide-business): planning and notification review.
- [DOJ web accessibility guidance](https://www.ada.gov/resources/web-guidance/): accessible public-facing websites and services.
- [PCI SSC outsourcing FAQ](https://www.pcisecuritystandards.org/faqs/does-pci-dss-apply-to-merchants-who-outsource-all-payment-processing-operations-and-never-store-process-or-transmit-cardholder-data/): continuing merchant responsibilities.
- [ISO/IEC 27001](https://www.iso.org/standard/27001): scoped security-management certification.
- [AICPA SOC 2 report review checklist](https://assets.ctfassets.net/rb9cdnjh59cm/3xbcLlNc5rd72So4nQpNIk/7a3e8e5945c78c35fc5e116859b96e6a/SOC_2_Report_%C3%82_Review_Checklist.pdf): report issuer and scope evaluation.
- [NIST small-business quick-start guides](https://www.nist.gov/itl/smallbusinesscyber/quick-start-guides): risk-management framework resources.
- [FTC COPPA FAQs](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions): scope and minors' data considerations.
- [European Commission AI transparency guidance](https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations): Article 50 transparency review for applicable EU use.
- [FTC ROSCA recap](https://www.ftc.gov/business-guidance/blog/2018/07/time-rosca-recap-ftc-says-risk-free-trial-was-risky-not-free) and [current negative-option rule docket](https://www.ftc.gov/legal-library/browse/rules/negative-option-rule): subscription disclosures, consent and cancellation review; verify rulemaking and litigation status rather than copying old announcements.
