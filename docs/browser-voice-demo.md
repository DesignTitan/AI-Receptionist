# Browser voice practice

The marketing modal uses the OmniDimension WebSession client for a live practice voice conversation. It contains no recorded audio player or scripted dialogue.

## Current readiness

Bubs rejected prerecorded samples: the modal is now live conversation only. OmniDimension agent **252341**, “AI Receptionist — live website practice”, was created separately from Ava (248069). It uses dynamic generated greetings and replies, not a fixed dialogue. No real bookings, transfers, files, integrations or post-call actions are attached. Provider max_call_duration_in_sec is 90. Private credentials and this agent ID are stored only in ignored .env.local with mode 0600.

The assistant adapts to the visitor’s chosen appointment business, answers naturally and demonstrates fictional availability. It does not collect real contact or payment details. Voice and English (American) language configuration were completed in the provider editor.

Local session creation allows development on loopback hosts, same-origin POSTs and five attempts per hour per process. Production always returns unavailable. Before public activation add durable per-visitor and global daily reservations, human verification and a provider budget. No deployment was made.

## Client behavior and acceptance

The browser asks for microphone permission before requesting a session; only the short-lived ws_url reaches the browser. No reusable key is returned or logged. The 90-second browser deadline includes connection time; mute, end, closing, navigation and unmount stop the session. Transcript events replace the latest displayed turn rather than duplicating cumulative speech. We do not persist transcripts in this application. Audio is processed by the provider; do not promise that the provider stores nothing.

Verify a real conversation, interruptions, denied permission, close while connecting, mute/unmute, disconnect, 90-second cutoff and provider billing before launch. Live acceptance on 10 September: microphone test input about a photography studio and Thursday portrait appointment was transcribed, and the agent generated a contextual spoken reply with fictional afternoon availability. Actual audio frames, mute/unmute, socket close, Escape/focus and 320/390/1440px layouts passed. API guard tests and production build/dev-tool exclusion passed. The provider setting is verified as 90 seconds; public duration/billing acceptance remains a launch check.

References: https://docs.omnidim.io/docs/sdks/web ; https://docs.omnidim.io/docs/api-reference/sessions/createSession ; https://docs.omnidim.io/docs/api-reference/agents/createAgent
