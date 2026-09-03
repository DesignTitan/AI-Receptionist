# Voice platforms compared with OmniDimension (researched 3 Sep 2026)

Baseline, measured on OmniDimension: $0.115/min voice AI + $0.03/min telephony = $0.145/min,
about $0.22 for a 1.5-minute call, plus the $36–200 seat and $5 per number.

## Cost per minute, US, comparable stack (mini-class LLM, ElevenLabs-grade TTS, Deepgram-class STT, telephony)

| Platform | All-in $/min | 1.5-min call | Base fee | Number | Source |
|---|---|---|---|---|---|
| Retell | $0.101 (platform TTS) / $0.126 (ElevenLabs), quoted components | $0.15 / $0.19 | $0 | $2/mo | retellai.com/pricing |
| Vapi | ~$0.12–0.13 (estimate: $0.05 platform + providers at cost + Twilio) | ~$0.19 | $0 | 10 free US, then $1.15 | vapi.ai/pricing |
| ElevenLabs Agents | ~$0.11 (estimate; cheaper on plan minutes) | ~$0.17 | $99 / $299 / $990 | Twilio pass-through | elevenlabs.io/pricing/agents |
| Bland | $0.14 Start / $0.12 Build + Twilio | $0.23 / $0.20 | $0 / $299 / $499 | ~$15/mo | bland.ai/pricing |
| Synthflow | ~$0.13–0.16 (estimate; no public rate card) | ~$0.21 | $0 PAYG; white-label $2,000/mo | $1.50/mo | synthflow.ai/pricing |
| Twilio ConversationRelay | ~$0.105 (you host the agent loop yourself) | ~$0.16 | $0 | $1.15/mo | twilio.com conversational-ai pricing |
| Thoughtly | not published, "from $500/mo" | — | $500+ | — | thoughtly.com/pricing |
| Goodcall (done-for-you) | $79–249/mo per unique caller, inbound only, no dispatch API | — | $79+ | incl. | — |
| Smith.ai (done-for-you) | $600/mo per 50 contacts + $750 setup | — | $600+ | — | — |

## Fit against what the app needs

| Platform | Outbound API + variables | Post-call webhook | Voicemail detection | Concurrency | Many clients under one account | Gotchas |
|---|---|---|---|---|---|---|
| Retell | yes (`create-phone-call`, dynamic variables) | yes (`call_analyzed`: transcript, analysis, recording) | yes | 20 free, +$8/slot | workspaces per client | $8/mo per extra knowledge base |
| Vapi | yes (`/call`, variableValues) | yes (`end-of-call-report`) | yes, several detectors | 10 free, +$10/line | orgs per client | reported 10 outbound/day cap on free numbers |
| ElevenLabs | yes (Twilio outbound endpoint) | yes | yes | 20–40 by plan | weak | bring your own Twilio |
| Bland | yes | yes | yes | 10 on Start, 100 calls/day cap | enterprise only | daily cap kills scale |
| Synthflow | yes | yes | yes | 5 on PAYG | only via $2k white-label | no rate card |
| Twilio CR | you build the runtime | you build it | Twilio AMD | account-wide | sub-accounts | not an adapter job |

## Monthly totals, estimated, seat included, numbers excluded

| Scenario | OmniDimension | Retell | Vapi | ElevenLabs | Bland Start | Synthflow |
|---|---|---|---|---|---|---|
| 5 customers, 2,600 min | $413–577 | $263–328 | ~$325 | ~$390 | ~$400 | ~$365 |
| 20 customers, 10,400 min | $1,544–1,708 | $1,050–1,310 | ~$1,300 | ~$1,190–1,350 | ~$1,600 | ~$1,460 |

## Shortlist

1. **Retell**: cheapest quoted stack, exact feature parity, workspaces per client, no base fee.
2. **Vapi**: same parity, richest voicemail detection; slightly pricier, watch the line limits.
3. **ElevenLabs Agents**: best voice per dollar on a plan tier; weaker multi-client tooling.

## Verdict

At five customers the saving over OmniDimension is roughly $100–250 a month, mostly the seat
fee; that barely covers rewriting the adapter, re-testing the prompts on a new voice stack and
re-porting numbers. Stay put. At twenty customers Retell or Vapi save roughly $300–650 a month,
which clears the migration inside a quarter. Plan a Retell adapter once volume passes about
6,000–8,000 talk minutes a month, run it in parallel on one customer, then cut over. Skip Bland
(daily caps, base fees), Synthflow (five lines, $2k white-label) and the done-for-you vendors
(no dispatch API).
