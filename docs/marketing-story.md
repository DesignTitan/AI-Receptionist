# Marketing story and features

Updated 10 September 2026. The homepage explains the product and the value of getting time back. The dedicated Features page holds the detailed capability, benefit and setup story. Light marketing backgrounds are pure white, including Features panels and the Coming Soon voting interface; the homepage retains its photographic hero and dark contrast sections.

## The first impression

**For businesses that run on appointments**

**Your AI receptionist. Your day back.**

Let customers book online. Let AI make the confirmation calls. See what needs your attention, so you can get back to the people and work that matter.

The category and everyday actions explain the product immediately. The promise connects those actions to more attention for clients and more freedom for the owner. It replaces the unclear “front desk that calls back” positioning. We make no universal conversion or business-outcome guarantee.

## Pages and reading flow

| Page | Purpose and sequence |
| --- | --- |
| `/` | Original V1 scroll experience restored: coastal photographic hero → online booking and missed-call context → scroll-scrubbed confirmation film → tabbed parallax feature stage → stacked dashboard cards → horizontal industry rail → call demonstration or callback request → shared pricing → pinned closing chapter. |
| `/features` | Light presentation → benefit-led overview → six feature stories → plan allowances and team limits → setup and compatibility questions → demo or signup → Coming soon roadmap, upvotes and new-feature suggestions. |
| `/__dev/design/luxury-v2` | Preferred dark visual direction with the same hero message. The current online flow comes before the incoming pilot. Short benefit previews link to the full Features page; setup and the approved coastal image remain. |
| `/demos` | Three fictional business examples, with shared navigation to Features, pricing and the homepage. |

The development page index lists **Marketing homepage**, **Features & benefits**, and **Marketing site · V2** under Marketing. The original V1 homepage structure from `c3a9ef8` is restored at `/`, with its existing media, motion hooks and a separate `ScrollingFeatures` component. The current hero image/message and accurate product boundaries remain. Earlier V2 visual studies remain at `design/hero-comparison/luxury-v2/visual-studies.html`. These changes do not deploy the site.

## The six feature stories

| Link | Customer-facing benefit | What supports it |
| --- | --- | --- |
| `/features#online-booking` | The next booking shouldn’t interrupt this one. | A branded page, team member choice, available times, business hours and appointment details. |
| `/features#confirmation-calls` | Let the confirmation call happen while you work. | Optional outgoing calls after booking, recorded outcomes and staff follow-up. |
| `/features#incoming-calls` | A booking can start with a conversation. | Pilot: new phone bookings, caller menu, staff-first, AI-first or staff-only answering. |
| `/features#coverage` | Make room for a proper break. | Pilot: business and after-hours choices, holidays, vacations and temporary changes that expire. |
| `/features#call-records` | Know what happened. See what needs you. | Appointment outcomes, summaries, available transcripts/recordings and requests for a person. |
| `/features#usage-controls` | Keep control of what you spend. | Allowance, dashboard notices, renewal date, estimates, extra-minute rate and a chosen spending cap. |

The Features page reuses three completed Higgsfield campaign photographs: full attention, a proper break and owner review. The homepage reuses the exact approved coastal hero. Public copies are in `public/marketing`; originals and generation records remain in `design/hero-comparison/campaign-v4`. No new images or video were generated for the copy update.

## Actions and offer

- **See it in action / Try online booking** → `/demos`.
- **Explore the features** → `/features`; its six chapter links go to the stories above.
- **Get started / Set up my business** → `/start`; a logged-out visitor first reaches owner sign-in. Local sign-in still needs configuration, so completed onboarding is not claimed.
- **Pricing** → `/#terms`; prices, allowance, team limits and setup terms come from `src/lib/platform/pricing.ts`. Homepage plan cards show the differences instead of repeating the full feature inventory.
- **Features** is visible in the homepage navigation, V2 navigation, shared demo navigation and the development page index.
- **Coming soon** in the Features navigation jumps to the public roadmap at the bottom. Its 13 team items distinguish pilots, plans and exploration; visitors can vote or suggest ideas for staff review. See `docs/feature-roadmap.md` for the source list and storage/release details.
- The website’s demo voice script uses the same product boundaries as the written marketing copy.

## Product boundaries

- Incoming phone booking and answering schedules are a pilot awaiting a verified phone connection. Saving preferences does not activate a line or change carrier forwarding.
- The current appointment book belongs to AI Receptionist. External booking software and calendars do not automatically synchronize.
- Online customers choose a team member with an offered service and an available time, rather than a separate service-selection flow.
- Confirmation calls require setup, activation, enabling and available call capacity. There is no one-minute callback guarantee.
- Staff handle requests for a different appointment time; do not promise automatic rescheduling, reminders, waitlists, recovered bookings or fewer no-shows.
- Transcripts and recordings depend on provider delivery. Usage notices work in the dashboard; email delivery requires configuration.
- Extra spending defaults to $0. Extra minutes cost 49¢ per started minute, subject to the owner’s saved cap. The shared catalogue remains the source of truth. Subscription and carrier costs are separate.
- Phone schedules govern answering; appointment availability is separate. Existing phone providers and booking tools require review during setup.
