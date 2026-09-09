# Incoming phone booking and owner controls

Status, 9 September 2026: application implementation for controlled pilot testing. No customer phone number has been forwarded or connected by this work. Carrier activation and an end-to-end live call still remain.

## Approved experience

Customers keep calling the business's public number. The business independently controls incoming AI booking and outgoing confirmation calls. Incoming choices are menu first, staff first with optional overflow, AI first, or staff only. Weekly phone hours use the business timezone, with overnight periods, dated holiday/vacation rules, and expiring manual overrides. Turning incoming routing off sends new calls to the configured staff destination or voicemail. Already admitted AI calls may finish within their five-minute reservation; emergency connection/billing suspension prevents further booking actions.

Onboarding collects the current public number, phone provider, service type/plan and appointment software. “Not sure yet” is supported. Selection is intake, never proof of a connected line. Phone hours describe who answers; they do not change the business's appointment availability.

Appointments use the customer platform's authoritative appointment book. The assistant reads the details back and obtains agreement before saving. The database checks business status, team member, duration, local booking hours, 90-minute notice, 30-day horizon and overlapping appointments. Repeat requests with the same call/key/details return the original booking. Phone bookings are confirmed without queuing an immediate duplicate outgoing call. Rescheduling/cancelling existing appointments and external calendar integration remain staff follow-up until implemented and verified.

## Pilot intake

Tanaz in Grand Rapids is the first business pilot. Comcast is reported as likely; the precise product and booking software are still unconfirmed. Bubs requested a separate personal T-Mobile pilot with an isolated test appointment book. Exact numbers and intake are saved in the ignored `.local/phone-pilots.json` file, which is not a deployment configuration or a real customer account.

Comcast VoiceEdge documents auto attendants and scheduled call flows: [VoiceEdge](https://business.comcast.com/learn/phone/voiceedge-virtual-pbx). Comcast's other phone services have different capabilities; inspect the actual service before providing instructions. T-Mobile distinguishes unconditional forwarding from forwarding when unavailable: [forwarding support](https://www.t-mobile.com/support/tutorials/device/apple/iphone-7-plus/topic/calling-amp-contacts/forward-calls). Device and plan steps must be checked when setting up the personal pilot.

The app's schedule acts on calls that reach its phone gateway. It cannot silently change Comcast or T-Mobile's forwarding settings. Choose one schedule authority during setup. If the carrier performs the menu/schedule itself, mirror that accurately rather than pretending the dashboard controls the carrier. Staff transfers require a separate reachable number/extension that does not forward back to the public or AI line. Mobile pilots initially use voicemail fallback when no separate staff destination exists.

## Implemented adapter boundary

The provider-independent HTTP gateway emits routing instructions; it does not itself carry audio, transfer calls or record voicemail. A carrier/voice adapter must implement those actions and securely supply call context. This is deliberately not advertised as a verified OmniDimension, Twilio, Comcast or T-Mobile adapter.

OmniDimension supports [custom booking actions](https://docs.omnidim.io/docs/integrations/custom-api) and [phone connections](https://docs.omnidim.io/docs/telephony). Twilio documents [menus](https://www.twilio.com/docs/voice/tutorials/build-interactive-voice-response-ivr-phone-tree) and [time-based routing](https://www.twilio.com/docs/serverless/functions-assets/quickstart/time-of-day-routing). The exact handoff of a trusted live call identity/session into OmniDimension actions still needs to be verified on a test line. Never ask an LLM to invent or choose a customer ID, call ID or session token.

### Connection record

`customer_phone_connections` is service-only. It stores the customer binding, adapter provider, gateway inbound number, AI destination/agent, SHA-256 hash of a random connection credential, setup status and verification date. Owners can save preferences but cannot set these protected fields. A separate `INBOUND_SESSION_SECRET` (at least 32 characters) signs five-minute booking sessions. Never use the existing demo or staff password for this secret.

`not_connected` and `testing` cannot admit real AI sessions. `ready` is only appropriate after verifying the adapter, shared appointment book, call limits, cost mapping, transfers, voicemail and callbacks. Local fixtures may set `ready` explicitly, but fixture state is never promoted into a live customer connection.

### Routing and completion endpoint

`POST /api/webhooks/inbound/{customerId}` requires `Authorization: Bearer <per-connection credential>` and JSON. The adapter must verify the carrier's own signature before using this credential. Never expose it in browser code, URL parameters, transcripts or AI instructions.

To start or continue routing, send:

```json
{
  "action": "route",
  "externalCallId": "provider-account-stable-call-id",
  "destinationNumber": "+12125550101",
  "callerPhone": "+12125550102",
  "stage": "arrival"
}
```

Use `stage: "selection"` with `choice: "1"` or `"2"` after a menu; use `stage: "staff_unavailable"` after a failed staff transfer. Keep `requestedStaff: true` when the caller explicitly asked for a person. That path offers voicemail rather than sending them back to AI. Missing/invalid menu input goes to voicemail after the adapter's own bounded retry prompt. IDs are tenant-prefixed internally; repeat events must reuse the same external ID and caller. Withheld caller numbers may be null.

The response supplies `action` (`menu`, `staff`, `ai`, `voicemail`, or `end`), `callId`, and relevant prompt/destination/ring timeout. An AI action atomically reserves shared minutes and returns `sessionToken`, `toolsPath`, and `maxSeconds`. The adapter must keep that token out of model-editable arguments, enforce the time ceiling, and retain an independent staff/voicemail fallback for HTTP errors. Repeated admission never extends the original deadline.

After a call, send `action: "complete"`, the original `externalCallId`, a result, `aiSeconds` (measured AI-leg duration, zero if no AI connected), optional `costCents` (observed total provider cost), `summary`, `transcript`, and HTTPS `recordingUrl`. Do not substitute zero for an unknown duration. Retry until the report is acknowledged; duplicate completion does not rebill or resend owner notifications. Store and reconcile reports when the app is unavailable. Missing reports leave reservations held, preventing unlimited unmetered calls.

### Booking tools

`POST /api/webhooks/inbound-tools` requires `Authorization: Bearer <sessionToken>`. It accepts:

- `{"action":"services"}` — this business's team, service durations and timezone.
- `{"action":"availability","member":"member-1","date":"2026-09-15"}` — current available slots.
- `{"action":"book","requestKey":"stable-booking-attempt","member":"member-1","fullName":"Test Guest","phone":"+12125550102","startsAt":"2026-09-15T14:00:00.000Z","confirmedByCaller":true}` — save and return confirmation. Optional `email` is accepted.

Caller/customer/call identity is bound by the signed session. The endpoint rejects customer/call ID arguments, expired sessions, closed calls and inactive connections. Only say “booked” when the response has `booked: true`. Use the same request key/details on retry after a timeout.

## Usage and launch acceptance

Inbound and outbound calls share the existing plan allowance and extra-spend limit. Both reserve five minutes before starting AI and round each AI call up separately after its report. Inbound calls without a booking still count. Staff-only/menu time is not represented as AI minutes; the adapter must report AI-leg duration correctly and record all actual carrier costs separately. Validate the full cost of forwarding, transfers, voice, recordings and number rental before approving inbound profitability or changing the published prices. The current pricing assumptions were originally checked for outgoing calls.

Owner usage warnings and email jobs remain shared; email delivery still depends on the existing email setup. Calls over the reserved limit never charge the owner beyond the reservation and require technical review. A provider report containing unreserved AI usage also requires review. Reconcile unresolved calls before closing a billing period; do not simply delete financial history or release uncertain reservations.

Before enabling a real connection, verify one complete caller-to-calendar-to-dashboard flow, simultaneous callers requesting one slot, retry after a saved booking, wrong-business credentials, dropped calls, unavailable staff, after-hours/holiday/override behavior, off mode, zero/low remaining budget, delayed completion reports, and the five-minute cutoff. Test the original phone route and rollback before changing carrier forwarding. Do not contact the salon or make carrier changes without the relevant account access and authorization.
