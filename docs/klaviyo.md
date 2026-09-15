# Klaviyo: the coming-soon waitlist

Connected on 14 September 2026. The holding page at bubs.ai offers the founding rate to people
who sign up before launch. The form posts to `/api/waitlist`, which does three things in the
Klaviyo account "Conjuring":

1. Upserts the profile through `profile-import` with `founding_rate: true`, `source: coming-soon`,
   `signed_up_at`, and the business name if given. (The subscribe job rejects `properties`, so
   they have to go in here.)
2. Adds the profile to the **Founding rate** list (`X7k8uZ`) through the list relationship
   endpoint. This is synchronous, so the person is on the list the moment the form says so.
3. Fires a subscription job that records email marketing consent (SMS consent only when the box
   was ticked). Klaviyo runs this in the background and it can take a few minutes to show on the
   profile; the list membership does not wait for it. A mobile-only signup with the SMS box
   unticked skips this step (there is nothing to consent to). The form only reports failure
   when nothing at all was saved.

The offer is hidden until both env vars exist, so the page never shows a button that cannot save.

## What is set up

- Private API key **bubs.ai website waitlist v2** with List, Profiles and Subscriptions on Full
  Access (created 14 Sep 2026). Stored on Vercel as `KLAVIYO_PRIVATE_API_KEY` (production).
- `KLAVIYO_LIST_ID=X7k8uZ` on Vercel (production). The list is single opt-in.
- Vercel project renamed from `ai-receptionist` to `bubs-ai` the same evening.

## Things to know

- **SMS consent is not recorded yet.** Klaviyo answers "Phone number is valid but is not in a
  supported region for this account. Please configure a sending number for this region." until
  the account has an SMS sending number (Klaviyo → Settings → SMS). Until then the mobile number
  and an `sms_consent: true` property are saved on the profile, and email consent is still
  recorded, so nothing is lost; once SMS is set up, a segment on `sms_consent` finds everyone
  who opted in.
- **Rate limit.** Five signups per hour per IP address, in memory, reset on every deploy.

- **Bot protection.** Klaviyo suppressed one of the test signups ("Manually Suppressed from Email
  Marketing, method: BOT_PROTECTION") after seven signups in twenty minutes from one server with
  plus-addressed test emails. A suppressed profile is still on the list but will not receive
  email. If a real signup ever shows this, open the profile and click "Remove global suppression".
- Test profiles `bubs+waitlist-test…@manifeststudios.com` were left in the account; delete them
  from Audience → Profiles when convenient.
- Runtime logs: Vercel → bubs-ai → Logs, search `waitlist`. Every rejected Klaviyo call is logged
  with its status and the first 300 characters of the error.

## Re-connect from scratch (if the key is ever rotated)

1. Klaviyo → Settings → API keys → **Create Private API Key** → Custom Key. Set **List**,
   **Profiles** and **Subscriptions** to Full Access. Scopes cannot be edited afterwards, so a
   wrong key has to be replaced, not fixed.
2. Vercel → bubs-ai → Settings → Environment Variables → edit `KLAVIYO_PRIVATE_API_KEY`, paste,
   save, then redeploy:

```bash
cd "/Users/bubs2/Code/✅ - bubs.ai"
npx vercel --prod
```

3. Sign up once from bubs.ai and confirm the profile is in the Founding rate list with
   `founding_rate` set.

Locally, the same two names in `.env.local` show the offer; a placeholder key makes the form
fail politely at Klaviyo, which is enough to check the layout.
