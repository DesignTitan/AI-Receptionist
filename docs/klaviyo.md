# Klaviyo: the coming-soon waitlist

The holding page at bubs.ai offers the founding rate to people who sign up before launch. The
form posts to `/api/waitlist`, which subscribes the person to one Klaviyo list with a
`founding_rate: true` profile property, `source: coming-soon`, and their business name if given.
Email consent is recorded as SUBSCRIBED; SMS consent only when the person ticked the text box.

The offer is hidden until both keys exist, so the page never shows a button that cannot save.

## Connect it (owner, about five minutes)

1. Klaviyo → Settings → API keys → **Create Private API Key**. Scopes: `lists:read`,
   `profiles:write`, `subscriptions:write`. Copy the key (it starts with `pk_`).
2. Klaviyo → Audience → Lists & segments → create a list called **Founding rate** (or pick one).
   Open it; the list id is the six-character code in the URL, e.g. `.../list/AbC123`.
3. Put both on Vercel and redeploy:

```bash
cd "/Users/bubs2/Code/✅ - bubs.ai"
npx vercel env add KLAVIYO_PRIVATE_API_KEY production
npx vercel env add KLAVIYO_LIST_ID production
npx vercel --prod
```

4. Sign up once from bubs.ai with your own email and confirm the profile appears in the list
   with `founding_rate` set. SMS sending also needs a Klaviyo SMS sender number and the list's
   double-opt-in setting reviewed; the form already carries the consent line.

Locally, the same two names in `.env.local` show the offer; a placeholder key makes the form
fail politely at Klaviyo, which is enough to check the layout.
