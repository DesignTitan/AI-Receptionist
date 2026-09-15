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
- Flow **Founding rate welcome** (live): trigger "Added to list: Founding rate", no re-entry, one
  plain-text email from bubs <bubs@manifeststudios.com>, subject "Your spot is saved. The founding
  rate is yours." It promises nothing else before launch, so keep it that way.
- Segment **SMS consent (pre-setup)**: `sms_consent is true`. Everyone who ticked the text box
  before SMS was switched on; use it for the first text once a sending number exists.
- Test profiles were removed from the list on 14 Sep; they still exist under Audience → Profiles.
  `bubs@manifeststudios.com` is the only member. It carried a manual email suppression dated
  29 August 2026 (unrelated to the waitlist); that was lifted on 14 Sep.

## Bot and fake-signup defences (15 Sep 2026)

In order, every submission passes: same-origin check; five per hour per IP; honeypot field;
strict email syntax; a blocklist of throwaway inbox providers; a DNS check that the email domain
actually receives mail (MX, else A/AAAA); a real North American number (area code and exchange
2-9, no N11, no 555, no repeated or 1234567 digits); **Vercel BotID** (`checkBotId`, script
proxied via `withBotId` in next.config, `<BotIdClient>` in the root layout) which rejects any
request whose page never ran the client script; and **Cloudflare Turnstile** when the widget
produced a token. Verified: curl with browser headers and valid-looking data gets 403; a real
browser on a phone-sized screen gets through and lands in the list.

Turnstile currently fails to load on bubs.ai (the site key was made for the old domain), so the
form quietly submits without it and BotID stands alone. Owner fix: Cloudflare dashboard →
Turnstile → the widget → add `bubs.ai` to its hostnames. Nothing in the code needs to change.

## Things to know

- **SMS consent is not recorded yet.** Klaviyo answers "Phone number is valid but is not in a
  supported region for this account. Please configure a sending number for this region." until
  the account has an SMS sending number. Owner task: Settings → Text message → Set up texting →
  United States → enter the EIN and registered address → toll-free number. Verification takes a
  few business days. The wizard already created an empty "Text Messaging List"; ignore it. Until then the mobile number
  and an `sms_consent: true` property are saved on the profile, and email consent is still
  recorded, so nothing is lost; once SMS is set up, a segment on `sms_consent` finds everyone
  who opted in.
- **Email footer.** Klaviyo's required footer prints the organisation from Settings → General,
  currently "Conjuring, 5343 Prairie Home Dr, Grand Rapids". Change it to bubs / Manifest Studios
  before the welcome flow reaches a real signup.
- **Sending domain.** Mail goes out from manifeststudios.com. A bubs.ai sending domain with DKIM
  is worth setting up before the launch campaign.
- **Rate limit.** Five signups per hour per IP address, in memory, reset on every deploy.

- **Bot protection.** Klaviyo suppressed the seventh test signup (`bubs+waitlist-test7`, event
  "Manually Suppressed from Email Marketing, method: BOT_PROTECTION") after seven signups in
  twenty minutes from one server with plus-addressed test emails. This is a different event from
  the 29 August suppression on the owner's address. A suppressed profile is still on the list but will not receive
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
