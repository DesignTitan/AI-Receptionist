/** Editorial placeholders only. No item asserts a policy, control or certification. */
export const LEGAL_GROUPS = [
  { title: "Legal", items: [
    { id: "terms", title: "Terms of service", detail: "Company identity, service scope, customer responsibilities, liability limits, warranties, indemnities, dispute resolution and governing law." },
    { id: "enterprise", title: "Enterprise terms", detail: "Customer-specific order forms, service scope, negotiated commitments, data-processing terms and agreement precedence. No enterprise agreement is active on this placeholder." },
    { id: "copyright", title: "Copyright & takedown", detail: "Content ownership, third-party rights, complaints and notice/counter-notice procedures. Counsel must determine DMCA safe-harbor applicability and any designated-agent registration; no agent is designated here." },
    { id: "abuse", title: "Report abuse", detail: "Reporting unwanted calls, impersonation, spam and misuse of the service; triage, appeals and enforcement. A monitored reporting channel remains to be configured; this placeholder does not submit a report." },
    { id: "billing", title: "Billing & cancellation", detail: "Renewal consent, setup fees, usage charges, taxes, cancellation steps, refunds and service termination." },
    { id: "acceptable-use", title: "Acceptable use", detail: "Prohibited calls, impersonation, spam, abusive content, unauthorized voice cloning and misuse of customer information." },
    { id: "ai-calls", title: "AI & call recording", detail: "AI identification, call purpose, consent and revocation, recording/transcription notices, do-not-call handling, human escalation and emergency limitations." },
    { id: "accessibility", title: "Accessibility", detail: "Accessibility assessment, supported alternatives, known limitations and a monitored feedback channel. No conformance claim is made." },
    { id: "company", title: "Company & legal contact", detail: "Registered legal entity, business address, applicable registration details, legal notices and verified contact channels." },
  ]},
  { title: "Privacy", items: [
    { id: "privacy", title: "Privacy notice", detail: "Data collected, purposes, legal bases where relevant, sharing, retention, international transfers and individual rights." },
    { id: "cookies", title: "Cookie notice & preferences", detail: "Cookie and tracker inventory, purposes, durations and a working preference mechanism where required. This placeholder does not change cookie settings." },
    { id: "do-not-sell", title: "Do not sell or share my personal information", detail: "Dedicated sale/sharing opt-out and cookie-preference page. Controls are not active; final applicability, request handling and browser privacy signals require review." },
    { id: "privacy-choices", title: "Your privacy choices", detail: "Access, correction, deletion, portability, objection, appeals and applicable sale/sharing opt-outs. Request channels and identity checks remain to be configured; this page does not submit a request." },
    { id: "health-data", title: "Consumer health data", detail: "Separate health-data notices and consent where applicable, including health information outside HIPAA. Healthcare scope requires legal review." },
    { id: "data-processing", title: "Data processing agreement", detail: "Controller/processor roles, documented instructions, confidentiality, security measures, assistance, audit rights and return/deletion of data." },
    { id: "subprocessors", title: "Subprocessors & transfers", detail: "Verified vendor names, services, processing locations, onward transfers, contractual safeguards and change notices." },
    { id: "retention", title: "Retention & deletion", detail: "Approved schedules for recordings, transcripts, bookings, consent records, backups and account closure; legal-hold exceptions." },
  ]},
  { title: "Security & trust", items: [
    { id: "security", title: "Security overview", detail: "Evidence-based descriptions of access controls, tenant isolation, encryption, key handling, monitoring, backups and incident response. Controls have not been attested here." },
    { id: "report-security", title: "Report a vulnerability", detail: "A monitored reporting channel, scope, coordinated disclosure terms and response process. No reporting mailbox or safe-harbor promise is active on this placeholder." },
    { id: "assurance", title: "Certifications & assurance", detail: "SOC 2/SOC 3 reports, ISO/IEC 27001 and 27701 certification scope, PCI DSS validation and CSA STAR assessment status: all unverified and subject to relevance review. No badges, certification claims or audit reports are offered." },
    { id: "healthcare", title: "Healthcare & BAA", detail: "HIPAA applicability, business associate agreements and eligible vendor/service scope must be assessed. This is not a HIPAA-compliance claim or an executed BAA." },
    { id: "availability", title: "Availability & support", detail: "Verified support hours, service commitments, maintenance notices, incident communications, disaster recovery and any agreed service credits." },
  ]},
] as const;
export const SOCIAL_NAMES = ["LinkedIn", "Instagram", "Facebook", "YouTube"] as const;
