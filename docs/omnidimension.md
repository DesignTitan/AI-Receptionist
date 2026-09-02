# Connecting the phone line (OmniDimension)

The homepage's "Hear it yourself" plate and every booking confirmation call go
out through OmniDimension (omnidim.io), the voice agent from the reel this
product started from. The app sends one API call per phone call; the agent's
personality lives in the OmniDimension dashboard and reads the per-call script
from a variable. Nothing here needs a code change.

## 0. The human check (Cloudflare Turnstile) — required before any live call

A public form that dials phone numbers must never be reachable by a script, so
the homepage only places a real call when a visitor has passed a human check
that the server verifies. Without these two keys a configured voice line is
deliberately not used from the homepage (the plate takes a callback request
instead, and the server log says why). Free:

1. dash.cloudflare.com → Turnstile → **Add site**. Hostname:
   `ai-receptionist-two-azure.vercel.app` (add your real domain later). Widget
   mode: Managed.
2. Copy the **site key** (public) and the **secret key**.
3. They go on Vercel with the others in step 2 below.

The check is invisible for people Cloudflare can vouch for and a small
interaction otherwise. Cloudflare's test keys work locally: site
`1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

## 1. Create the agent (OmniDimension dashboard)

1. Sign up at omnidim.io, add a payment method.
2. Create an agent. Name: **Ava**. Pick any voice you like; you can change it later.
3. **System prompt** — paste this exactly:

   ```
   You are Ava, an AI phone receptionist. Every call you make carries its own
   instructions in the variable [script]. Follow [script] exactly: it says who you
   are calling, why, what to say, what never to say, and how to classify the
   outcome at the end. Begin the call by saying exactly: [first_message]. If
   [first_message] does not contain the words "This call is recorded", say them in
   your first sentence. Never claim to be human. Never take payment details. Keep
   the call under ninety seconds.
   ```

   OmniDimension fills square-bracket variables from the call's context. The app
   sends `script`, `first_message`, `contact_name`, `reference`, `kind` and, for
   confirmation calls, the booking details. If a test call reads the brackets out
   loud instead of filling them, the dashboard wants `{{script}}` style — swap the
   brackets and test again; that is the only unknown in this guide.
4. **Welcome message** (Conversational Flow): `[first_message]`
5. **Post-Call tab**:
   - Delivery method **Webhook**, URL:
     `https://ai-receptionist-two-azure.vercel.app/api/webhooks/voice?token=YOUR_SECRET`
     where `YOUR_SECRET` is a random string you generate once (`openssl rand -hex 24`)
     and set as `VOICE_WEBHOOK_SECRET` on Vercel in step 3. The app rejects reports
     without it.
   - Add an **extracted variable** named `outcome`, described as:
     "Exactly one of: confirmed, rescheduled, cancelled, voicemail, no_answer — the
     classification the script asks for at the end of the call." This is what
     marks a booking confirmed or cancelled in the dashboard.
   - Turn call recording on if the agent has the option.
6. A phone number: buy one in OmniDimension (or import one). For the very first
   test you can skip this; the platform's default number rings. Copy its id if you
   bought one.
7. Copy the **API key** (dashboard → API) and the **agent id** (on the agent page).

## 2. Put the keys on Vercel (you, never pasted into a chat)

```bash
cd /Users/bubs2/Code/AI-Receptionist
npx vercel env add VOICE_PROVIDER production            # omnidimension
npx vercel env add OMNIDIMENSION_API_KEY production
npx vercel env add OMNIDIMENSION_AGENT_ID production
npx vercel env add VOICE_WEBHOOK_SECRET production      # the same value as in the webhook URL
npx vercel env add OMNIDIMENSION_FROM_NUMBER_ID production   # optional, only if you bought a number
npx vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production  # from step 0
npx vercel env add TURNSTILE_SECRET_KEY production            # from step 0
npx vercel env ls production | grep -E "VOICE|OMNIDIM|TURNSTILE"  # must list every line you added
npx vercel --prod                                       # env vars apply to a new build only
```

The homepage switches from "Ask for a call" to "Hear it yourself" on its own once
`VOICE_PROVIDER`, the two OmniDimension keys AND the two Turnstile keys are present.

## 3. The test

1. Open the site, unlock it with the site password, scroll to chapter six.
2. Enter your name and your own number. **Your phone rings within seconds.**
3. The page's stages advance from the webhook (queued → calling → on the call →
   done) and then show the transcript and summary of the call you just had, and
   the owner email arrives with the same.
4. Listen to the recording. The script Ava follows is `buildDemoScript` in
   `src/lib/voice.ts`; the confirmation-call script is `buildAgentScript` next to
   it. Change the words there, push, and the next call uses them.

## Testing locally instead

Put the same variables in `.env.local` (copy `.env.example`), restart
`npm run build && PORT=3999 npm start`. Your phone rings from the local site too,
but OmniDimension cannot reach `localhost` with its report, so the page will stay
on "Calling you" and no transcript arrives. Local is for hearing the call; the
full loop needs the Vercel deployment (or a tunnel such as `ngrok` pointed at the
local port, with that URL in the Post-Call tab).

## What the app does with a call (for reference)

- Dispatch: `POST https://backend.omnidim.io/api/v1/calls/dispatch` with
  `agent_id`, `to_number` (E.164), optional `from_number_id`, `call_context`
  (the variables above) and `metadata` (ids, never shown to the agent). The
  response's `requestId` is stored on the call log.
- Report: the Post-Call webhook's `call_report` (`summary`,
  `extracted_variables.outcome`, `full_conversation` or `interactions`) is
  matched to our log by the reported `phone_number` (latest call to that number
  in the last three hours), then the appointment status and the owner email
  follow from `outcome`.
- Abuse controls on the homepage plate are unchanged: US/Canada numbers, 3 per
  connection an hour, 2 per number a day, a daily cap (`TRY_CALL_DAILY_CAP`).
