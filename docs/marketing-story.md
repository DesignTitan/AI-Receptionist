# Marketing V2 — copy and reading flow

Updated 9 September 2026. Bubs has deferred new photographs and video. The current task is to make the product story work through copy and page order, using the approved existing opening image.

## Current preview

- Local page: `/__dev/design/luxury-v2`.
- The user-facing copy lives in `design/hero-comparison/luxury-v2/index.html`.
- The exact previous V2 page is retained at `design/hero-comparison/luxury-v2/visual-studies.html`, linked from the footer. Its embedded data and `docs/copy.json` remain historical study content.
- The original application marketing page at `/` is unchanged. V2 stays under Marketing in the development page index, with the same address and development-only access.

## Story order

| Chapter | What the reader should understand |
| --- | --- |
| Step away. Bookings keep moving. | This is an AI front desk for an appointment business, with online booking and optional confirmation calls. |
| You can’t be at the desk all day. | The product fits a recognizable day: serving a customer, a ringing phone, booking follow-up and a break. |
| Give the next customer a way to book. | Two distinct flows: incoming AI booking as a pilot preview; online booking followed by an optional outgoing confirmation call. Each has three clear steps. |
| You decide who answers. | Caller choice, staff-first and AI-first answer different business needs. Incoming and outgoing calling are independent. |
| Your day needs breathing room. | Temporary coverage, after-hours rules and vacation dates explain the practical value of the new controls. |
| Know what happened. Know what needs you. | The owner sees outcomes and picks up requests needing a person. Clearly labeled fictional records show a confirmation and a reschedule request. |
| Know your usage. Choose your limit. | The owner sees minutes and notices, chooses extra spending, and has a fallback when AI cannot admit more calls. |
| Start with the way your business works. | Provider and appointment-system intake lead to setup and testing. Three FAQs address the current number, booking software and switching AI off. |
| Make room for your customers. And for yourself. | A clear invitation to explore a demo or begin setup. |

## Actions and destinations

- `Explore a booking demo` and the online booking demo link → `/demos`. These are existing online/outgoing examples, not an incoming-phone test.
- `Get started` and `Start your setup` → `/start`. A logged-out visitor reaches owner sign-in before saving business details; no pricing selection is silently passed through the known sign-in plan issue.
- `Compare plans and pricing` → `/#terms`, the existing pricing section. Reuse its catalogue rather than copying prices into this static preview.
- Header links move to booking, controls and setup on the same V2 page. The development server rewrites fragment links to preserve the page address.
- Footer links retain owner sign-in, the original site and the earlier V2 visual studies.

## Copy boundaries

- Incoming booking is explicitly a pilot preview awaiting a tested connection. Saving preferences does not activate a phone line or change carrier forwarding.
- The current appointment book belongs to AI Receptionist. External booking software does not automatically sync.
- Confirmation calls are optional and require available call capacity. Staff handle change requests; no guaranteed bookings or no-show reduction is promised.
- Phone hours govern answering, not appointment availability. Staff destinations and voicemail must be configured as part of the verified connection.
- Usage notices are described in the dashboard. Extra spending defaults to $0; its limit is separate from the subscription and carrier charges.
- The record example uses fictional names and explicitly says it is an example.

## Presentation and next review

Keep the existing coastal photograph, dark framing and restrained type. All other chapters use normal page flow and readable HTML; no animation or new media is required to understand the story. Native FAQ disclosures work without JavaScript. Reduced-motion preferences disable smooth anchor scrolling.

Review the headline sequence, clarity of the two booking paths and setup invitation before returning to media production. The photo/video brief remains a later production reference, not the next active task.

Verification: existing development-preview checks pass (four tests), local anchors and labels resolve, the original V2 archive is byte-for-byte preserved, and the existing photo loads. Desktop and 390px browser checks cover the story, FAQ and setup destination. Local owner sign-in currently displays a disabled form pending configuration, so signup completion has not been verified.
