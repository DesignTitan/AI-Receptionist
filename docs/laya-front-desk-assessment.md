# Laya assessment — 21 September 2026

Requested by Bubs after the AI Front Desk review. Called the local Laya HTTP service at 127.0.0.1:8765/v1/predict; health returned ok. Response model: laya-rl-agent; routing selected english (convaiinnovations/laya).

Supplied evidence: current booking and confirmation implementation; pilot-only inbound routing; unproven warm transfer, triage and returning-caller memory; existing OmniDimension/ElevenLabs path; no demonstrated need to switch; launch acceptance still needed. Explicit constraints: no unsupported card promises and no spend, outbound calls, launch or provider switch without owner authorization.

| Question | Returned selection | Selected probability | Returned confidence |
| --- | --- | --- | --- |
| Plan cards | defer_unproven | 0.4004 | 0.0209 |
| Next priority | existing_flow | 0.3806 | 0.0156 |
| Later product direction | bounded_intake | 0.3783 | 0.0068 |

Definitions: defer_unproven means keep new capabilities off paid plan cards until demonstrated and supported. existing_flow means verify booking → confirmation → owner follow-up. bounded_intake means explore appointment-specific intake and reliable follow-up, then validate demand for memory and optional transfer.

Full choice probabilities:
- Plan cards: add_now 0.2372; defer_unproven 0.4004; remove_existing 0.3624.
- Next priority: existing_flow 0.3806; warm_transfer 0.2483; provider_switch 0.3712.
- Later direction: bounded_intake 0.3783; full_autonomy 0.2800; discard 0.3417.
- promise_risk returned type noul, noul 0.1198, confidence 0.8802. This raw value is not interpreted as a yes/no verdict because its scale semantics were not established in this run.

Interpretation: choice confidence is very low and probabilities are dispersed. This is a weak second opinion, not independent validation or authorization. The evidence-based review recommendation remains unchanged. No product changes or external actions resulted from this assessment.
