# Browser voice practice

The marketing modal uses the OmniDimension WebSession client for a live practice voice conversation. It contains no recorded audio player or scripted dialogue.

## Current readiness

Bubs rejected prerecorded samples: the modal is now live conversation only. OmniDimension agent **252341**, “AI Receptionist — live website practice”, was created separately from Ava (248069). It uses dynamic generated greetings and replies, not a fixed dialogue. No real bookings, transfers, files, integrations or post-call actions are attached. Provider max_call_duration_in_sec is 30 (updated and read back on 21 September). Private credentials and this agent ID are stored only in ignored .env.local with mode 0600.

The assistant adapts to the visitor’s chosen appointment business, answers naturally and demonstrates fictional availability. It does not collect real contact or payment details. Voice and English (American) language configuration were completed in the provider editor.

Hosted private testing is enabled with `VOICE_DEMO_ENABLED=true`, `SITE_GATE=locked`, a valid signed site-password cookie, `OMNIDIMENSION_DEMO_AGENT_ID` and a dedicated encrypted `OMNIDIMENSION_DEMO_API_KEY`. The general provider key remains unchanged for other calling features. Anonymous hosted voice remains disabled.

Production reserves each attempt through `reserve_voice_demo` in Supabase before contacting the provider: five starts per signed tester session per hour and 100 starts globally per UTC day. Both counters are atomic across server instances; database failures deny new starts. Failed provider attempts conservatively consume a reservation. The shared password is the tester access control; this is not an anonymous public demo. The agent and browser each cap calls at 30 seconds.

Local development still allows loopback requests with five attempts per hour per process. Production requires same-origin POSTs and keeps session URLs out of logs. Configure the Supabase URL and service key, apply `20260921_voice_demo_limits.sql`, and redeploy after changing provider settings.

If OmniDimension returns **insufficient_balance**, the modal stays retryable and asks you to add a plan or top up [OmniDimension Billing](https://www.omnidim.io). The app does not fall back to fake audio. A 30-minute in-process pause is not used, so credits take effect on the next attempt.

## Client behavior and acceptance

The browser asks for microphone permission before requesting a session; only the short-lived ws_url reaches the browser. No reusable key is returned or logged. The 30-second browser countdown starts when the session becomes active; permission waiting does not create a provider session or consume the countdown; mute, end, closing, navigation and unmount stop the session. Transcript events replace the latest displayed turn rather than duplicating cumulative speech. We do not persist transcripts in this application. Audio is processed by the provider; do not promise that the provider stores nothing.

Verify a real conversation, interruptions, denied permission, close while connecting, mute/unmute, disconnect, 30-second cutoff and provider billing before launch. Live acceptance on 10 September: microphone test input about a photography studio and Thursday portrait appointment was transcribed, and the agent generated a contextual spoken reply with fictional afternoon availability. Actual audio frames, mute/unmute, socket close, Escape/focus and 320/390/1440px layouts passed. API guard tests and production build/dev-tool exclusion passed. The provider setting is now verified as 30 seconds; public duration/billing acceptance remains a launch check.

References: https://docs.omnidim.io/docs/sdks/web ; https://docs.omnidim.io/docs/api-reference/sessions/createSession ; https://docs.omnidim.io/docs/api-reference/agents/createAgent


## Microphone guidance

The modal explains the browser permission prompt before starting and keeps an explicit “Allow your microphone” message visible while permission is pending. Denied access, missing input devices and devices that cannot start have separate instructions. After eight seconds without an input signal, the active call shows a reminder to speak or check the connected/selected microphone; input resuming clears it. This is a signal-level check, not a claim that silence means a broken microphone. Muting shows its own Unmute instruction. No sound or microphone samples are stored by this check.

21 September hosted acceptance: pending, denied and missing microphone paths made no session request; silent input reminder, mute/unmute, live provider audio frames and automatic stop passed on bubs.ai.
