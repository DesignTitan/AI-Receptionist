# AI Receptionist — scrollcraft brief

Build: `receptionist`. Target: the product homepage at `/` (the marketing page, not the demos).
Interviewed 2026-09-02. Bubs answered in one pass and granted autonomy: "You have autonomy over
this being cinematic." Items marked **Self-authored** were not answered and are my reading.

## Interview (verbatim)

1. **Vibe and references.** "This is a SaaS website, obviously, but being cinematic, a scroll
   journey is important. It needs to be editorial." "It needs to be very premium, professional,
   and expensive." No references given.
2. **The scroll journey.** "The idea is to show the benefits, show the value, show what it can do
   for them, show proof, and show how it helps their industry in reducing costs." "Pricing is
   important: how it works, the different industries, all that."
3. **Energy curve.** Not answered. **Self-authored:** calm and observational at the open, tightening
   through the cost of the problem, releasing at the turn, building to one loud participatory
   moment, then quiet, plain terms to close.
4. **Feeling, and the one moment.** Not answered as feelings; the moment is unmistakable:
   "have a way to speak to the AI, have the AI call them directly, punch in a phone number, and
   then have the AI give them a call instantaneously so they can see the value and what it can do."
5. **One thing no site does.** The same answer: the page calls you. Typed number, live call,
   right now. This is the signature move and the peak, and they are the same moment (feel.md §3).
6. **Aesthetic range.** "editorial" and "very premium, professional, and expensive." Family:
   **editorial**, executed premium. Not premium-minimal-dark by default; paper is a live option.
7. **One world or scenes.** Not answered. **Self-authored: distinct scenes.** An argument with
   pricing, industries and a live input cannot live inside a continuous canvas (worldflight forbids
   sections and copy over the world), and "editorial" is a chaptered word.
8. **Assets.** "Create film, create images as needed. You may need to create demos and real-life
   scenarios and what's happening and what it looks like." **Open decision (asked 2026-09-02):**
   generated imagery needs a kie.ai key, which is not set. Owned assets available now: the three
   live demo sites (Northlake clinic, Solstice salon, Halide studio), the shared dashboard with
   recordings and transcripts, the confirmation page that walks a call from queued to confirmed,
   `public/hero-loop.mp4` (ambient indigo/teal drift), the product palette and type.

## From Step 1 (Self-authored unless quoted)

- **What this is, who for.** A booking page and an AI front desk for any business that runs on
  appointments: clinics, salons, studios, trades, professional services. Clients book online; the
  assistant phones within a minute to confirm; every call is logged where the owner can see it.
- **Belief to install.** *Every missed call is a lost booking, and this front desk answers inside
  a minute. I know, because it just called me.*
- **Next action.** One label, everywhere: **"Have it call you."** Secondary, never competing:
  "See the demos."
- **Art direction.** Photographic world: **low-key cinematic** for any generated film (one warm
  key, cool fill, true blacks, matte grain), on an **editorial paper ground** for the page itself.
  If no key is set, the film is the product: real screen recordings, graded to match.
- **Honesty.** The "58 sec / 94% / 0 / 24/7" strip on the current page is invented and does not
  survive this build. No counters unless Bubs supplies verified figures. Pricing appears only if
  ratified. The live call runs on the simulator until a voice provider is connected, and the page
  says so on its face.

## Feeling curve (curve first, devices second — feel.md §1)

| # | Act | Feeling | What causes it |
|---|---|---|---|
| 1 | The front desk | Recognition | A phone ringing out while hands are busy: the missed call, held still, no pitch yet |
| 2 | The cost | Unease | The booking that never happened, named plainly, in their industry's terms |
| 3 | The turn | Relief | It calls back. The real confirmation page walks queued → ringing → confirmed under the wheel |
| 4 | Proof | Confidence | **stacked deck**: `pin`, three dark cards keyed to the act's `--sc-p`. A call record (recording, summary, transcript), the status column with its pills, the businesses band. Each rises from below; the one beneath settles back and fades out | 2.6 | Proof is three specific things, not a dashboard. Owner's direction, after a Fora-style reference |
| 5 | Their industry | "Mine is here" | Industries travel sideways; the one they run is on the rail |
| 6 | **Hear it yourself** | **Participation, then awe** | A number field. They type theirs. The page places the call and the tracker on screen mirrors it live |
| 7 | Terms | Clarity | How it works and what it costs, set plainly, compressed, no theatre |
| 8 | Resolve | Resolve | The page stops on the one action and holds |

Adjacent acts carry different feelings. Act 6 gets the largest span, the asset budget, and the
silence in front of it: act 5 ends quiet so the number field has something to arrive from.

## Peak

"I typed my number into the website and my phone rang before I'd put it down." Lives in act 6.

## Tell-someone sentence

It's the site where you type your number and the AI receptionist calls you.

## Authored silence

The last screen of act 5 empties to the paper ground before act 6's field arrives: one viewport
of quiet so the call has something to be a change from. The verification pass should read that
as authored, not dead.

## Decisions closed 2026-09-02

- **Assets: the product's own frames, no generation.** Bubs first chose "both", then, told that
  generation needs a kie.ai key that isn't set: "We don't know if we need everything, then do it.
  If we don't, then just do what you think is best." My call: none is needed. A SaaS page's most
  credible film is the product running. Chapter 3's clip is the real confirmation page walking
  queued → ringing → on the call → confirmed (four captured states, slow push-ins, crossfades,
  graded, dense-GOP). Chapters 1, 2 and 4 carry real frames: a booking in progress, the missed
  call as it actually appears on the dashboard ("No answer"), the record with its transcript.
  Nothing is painted; nothing pretends to be a photograph. If a key ever exists, generated
  scenes can be layered into chapters 1–2 without touching the structure.
- **Pricing: the plan's recommendation**, ratified. $199/month per business, $1,000 setup,
  month-to-month, fair use 500 calls a month.

## Decisions ratified 2026-09-02

- **Assets: both.** Real product footage for the turn and the proof; generated cinematic scenes
  for the open and the cost. Generation needs `KIE_AI_API_KEY` in the project `.env`.
- **Pricing: the plan's recommendation.** $199 per month per business, $1,000 setup,
  month-to-month, fair use 500 calls a month. Set in one place on the page.

## Grammar: chaptered editorial

The page is a printed feature. Chapters are the unit; hard cuts, not crossfades; each chapter
lands on its own ground. It is the grammar the interview named twice ("editorial", "premium,
professional, expensive") and it permits exactly what the brief needs: one film chapter (the
grammar allows a single `scrub`), media in its own column with a caption for the generated
scenes, `pan` for the industries, `pin` for the live plate (it forbids *pinned crossfade type
acts*, not pinning), and a running-text close.

Why the other seven lost:
- **Filmic one-shot** forbids visible sequence and implies the visitor is carried; pricing and
  industries are reference the visitor navigates. It is also the template trap the skill exists
  to leave.
- **Live surface** fits the peak but forbids the film and the editorial voice Bubs asked for.
  The peak borrows its ending (an actual input) without the page becoming an app.
- **Continuous world** forbids sections and copy over the canvas, and needs joined generated
  legs. This page is an argument with terms, not travel through a place.
- **Typographic poster** forbids a photographic ground and film.
- **Gallery / catalog** is for a collection; industries are one chapter, not the spine.
- **Split stage** wants a two-sided argument held the whole way; ours has one turn, then proof.
- **Rhythmic cutlist** bans pin and dwell and reads as pulse: wrong for "premium, expensive".

**Nav:** no fixed bar. A folio in the left margin: chapter number and title, updating as chapters
pass, clickable. **Hero:** a title page. Type on the paper ground, no media above the fold; the
first image is in chapter one's media column. **Close:** a colophon plate. Small type, the CTA
set as a line of running text, not a button island: "Have it call you" as a link back to the
plate, beside "See the demos".

## Signature move: the page calls you

Chapter 6 is a plate with one field. The visitor types a phone number. The page places a real
outbound call through the same dispatch the product uses for confirmations, with a script written
for this moment (the assistant introduces itself, says the call is recorded, asks what business
they run, and tells them what it would do for it). While it happens, the plate mirrors the call
live in the product's own stages: queued, calling you, on the call, done. When it ends, the
transcript and the assistant's one-line summary of *their* call render on the page under their
hand.

Coded in the page: a Next route `/api/try-call` and a plate component polling its status. The
engine is untouched. Data model: `call_logs` gains `kind` (`confirmation` | `demo`), a nullable
`appointment_id`/`client_id`, `demo_phone`, `demo_business` and a capability `reference`, so a
demo call reuses the exact dispatch, simulator, webhook and transcript machinery the product
runs on. Every demo call also emails the owner: it is a lead.

**Abuse controls, because a public outbound-dialling endpoint is a toll-fraud vector the moment
a real voice line is connected:** NANP numbers only (+1, ten digits, no premium prefixes); a
honeypot field; per-IP and per-number rate limits; a daily cap (`TRY_CALL_DAILY_CAP`, default
50) that stops dialling and says so; the whole page still sits behind `SITE_GATE` when locked.
The limiter is in-memory per instance until Supabase-backed; noted as such. **Honesty:** until a voice provider is connected the
call runs on the simulator and the plate says so on its face ("Simulated until a voice line is
connected"); with `VOICE_PROVIDER` set, the phone rings. Real markup, real logic, labelled
sample — the live-surface honesty rule, kept.

Tell-someone test: "I typed my number into the website and my phone rang before I'd put it
down." An experience, phrased from the visitor's side. Peak and signature move are one moment.

### Amendment 2026-09-02: the move is honest about the line

On a deployment with no voice provider (`VOICE_PROVIDER` unset) the page used to walk the
four stages and print a scripted transcript, the way the product's demo mode does for
bookings. The owner tried it and read it for what it was: a conversation that never
happened. The plate now asks for a name as well as a number; when there is no line, the
server records the lead, emails the owner to call back, and the page says so in the peak
chapter itself: "This page can't ring you", then Ava's real opening line, then the
reference. The chapter's heading, the masthead link, the folio and the colophon all read
"Ask for a call" in that mode. The stages, the tracker and the transcript render only for a
call that was actually placed. The scripted demo transcript is gone from the code.

## Fingerprint gate

This workspace's registry is empty; the build clears by definition. Checked anyway against the
one prior scrollcraft build on this machine (ConjuringAI "Studio", a different workspace), so
this page is not a re-skin of it:

| Dimension | Studio | This build | Differs |
|---|---|---|---|
| Grammar | Cinematic grid journal | Chaptered editorial | yes |
| Nav | Shared fixed nav over a registration grid | Margin folio, no bar | yes |
| Hero | Unified rectangle-circle image parallax | Title page, type only | yes |
| Act shape | 10 flow chapters, 11.0vh | 9 chapters incl. one scrub and one live plate, ~14vh | yes |
| Close | Quiet held call invitation | Colophon, running-text CTA | yes |
| Signature | Four discipline lines converge on a photo | The page places a call to the visitor | yes |

6 of 6.

## Score

| # | Chapter | Feeling | Device | Span (vh) | Why this one |
|---|---|---|---|---|---|
| 1 | The front desk | Recognition | Title page → `flow` + `in`; media column with a generated still and `parallax` | 1.0 | The grammar's hero: type first, the image arrives in the column |
| 2 | The cost | Unease | `reveal` at the boundary (hard cut to a dark ground); generated still in the column; no counters | 1.0 | A change of ground marks a chapter; unease has no numbers here because none are verified |
| 3 | The turn | Relief | **`scrub`** — the one film chapter: the real confirmation page walking queued → ringing → on the call → confirmed, graded | 2.4 | The strongest device on the beat where the product answers |
| 4 | Proof | Confidence | `reveal` (`iris`, once) into the real dashboard; transcript and summary as editorial plates; three businesses, one desk | 1.4 | Proof is read, not watched |
| 5 | Their industry | "Mine is here" | `pan` rail: groups of industries with one concrete line each | 2.4 | Lateral reads as breadth |
| — | Silence | Anticipation | An empty paper viewport, authored | 0.6 | The peak needs something to arrive from |
| 6 | **Hear it yourself** | **Participation → awe** | `pin` holding the live plate: the field, then the tracker, then the transcript. Largest span | 3.0 | The peak. The visitor is in it, not watching it |
| 7 | Terms | Clarity | `flow` + `in`, short stagger: how it works in three lines; the pricing plate | 1.2 | Administrative, compressed |
| 8 | Colophon | Resolve | Held close: small type, running-text CTA | 1.0 | The page stops and holds on the action |

Total ≈ 14.0 viewport-heights, at the budget's ceiling and deliberately not the 6–7 acts at
13.6–13.8 band. Device families in order: flow, reveal, scrub, reveal+flow, pan, pin, flow,
held. Never the same family twice in a row; one scrub; the peak has the largest span by a
visible margin and silence in front of it; the close holds.

## Build note

The deliverable is the product's real homepage, so the page is built as the Next.js route at
`/` with the engine vendored untouched and mounted from a client component, rather than as a
standalone `index.html`. The harness shoots the running app's URL. BRIEF, assets and lab shots
live here in the build folder as the skill expects.

## Verified 2026-09-02

Harness (`shoot.mjs`, the skill's real-Chrome rig, run from the app root against
`npm start` on :3999):

- Desktop 1440×900: 14.8 viewport-heights, acts flow > flow > flow > scrub > flow > pan >
  pin > flow > pin. No dead scroll. The one scrub clip keeps moving whenever it is on
  screen. Every cue clears 4.5:1 at its worst frame. No console errors (the first pass had a
  favicon 404; `src/app/icon.svg` fixed it).
- Mobile 390×844: same verdicts; the portrait clip is the one served.
- Reduced motion: no dead scroll, contrast clear; the clip is replaced by its poster.
- Contact sheets read for desktop and mobile; frames 20, 25 and 58 read at full size. Two
  false alarms from the Browser pane's mid-scroll screenshots were run down: a "black
  ground" that was the clip's own vignette plus the sheet's empty cells, and a "blue word"
  that was the avatar tile behind the headline.
- Browser walk: engine mounted (1 instance, 9 acts), folio tracks the chapter, Instrument
  Serif live, rail overflow 1675px at 1440 wide, clip readyState 4 and advancing under the pin.
- The plate, driven in the browser as a visitor: name, number, business, submit. With no
  voice line the page shows the honest panel (`data-sc-verify-state="requested"`, held), and
  the lead email fires with the name and number. Server contract: 422 without a name, 422 on
  a non-NANP number, the honeypot returns a fake success, per-IP and per-phone limits and the
  daily cap unchanged.

Feel check against the curve: recognition (title page) → unease (hard cut to ink) → relief
(the scrub, the strongest device on the beat the product answers) → confidence (proof read,
not watched) → "mine is here" (the rail) → an authored silence → participation (the plate,
the largest span) → clarity → resolve, held. Measured 14.8vh against the ≈14 estimate: the
plate grew a field. Left as is; the peak's span is unchanged and nothing else moved.

Not verified: a real placed call (no voice line on any deployment yet); the page on a
physical phone (the 390-wide harness stands in).

Addendum, later the same day: an "Ask again" / "Have it call you again" action after the
panel, verified in the browser (form returns with the details kept). The page is now
rendered per request so the plate's mode follows the environment; the real Vapi dispatch
was dry-run with placeholder keys and fails honestly (502, owner emailed the lead).

Addendum, later on 2026-09-02: chapter 4 rebuilt as a stacked deck at the owner's
direction ("we will not show the full dashboard; specific features, max three; like
this" — a dark stacked-card reference). Three cards, each copy left / one real product
crop right, on a pinned stage of span 2.6; the second and third rise over windows of
the act's progress (0.20–0.45, 0.55–0.80) and the card beneath settles back 5% and
fades out. Pure CSS on the engine's `--sc-p`; under reduced motion the deck is a
plain column. Verified: harness desktop 15.5vh and mobile 16.1vh, no dead scroll,
contrast clear; contact sheet read (the mid-states are there); pane check at four
progress points on desktop and two at 390 wide. Crops: the record's left column
(820×730), the call/status columns (550×440), the stats-and-chips band (1380×716).
The page total moved from 14.8 to 15.5 viewport-heights.

Owner's three refinements, same evening, all verified in the pane by computed style:
the header (kicker, title, and a short lede on the right) sits directly above card one at
the card's width, the next card peeks below the settled one by a fixed 84px (64px at 390),
and a card only begins to fade once the next covers ~60% of it, finishing as it fully
covers. Waiting cards stack with the *next* one on top so its label is what peeks; a
rising or settled card sits above everything that waited (`round()` in the z-index, DOM
order as the fallback for older browsers).

Chapter 4's three cards are the product's three features, chosen with the owner:
**it calls** (a confirmation call inside a minute), **it records** (recording, transcript,
one-line summary) and **it flags** (every no-answer surfaced for a person). Each card's
image is a frosted glass panel holding that feature's own interface over a dune
landscape, in the grammar of the owner's reference: three glass tool buttons top left,
a status pill top right, a rounded panel with a header row, the live UI, and one white
action button. Built in HTML with real backdrop-filter and rendered at 2x with headless
Chrome; `glass.py` and `render.mjs` in this folder regenerate all three, so a fourth
feature is one dict entry away. Frame is 820x900 to match the card's portrait image slot.

Chapter 4 is settled and is not to be changed further without being asked: dark cards on
the paper ground, the warm dune glass imagery, the plain two-part header, no tabs. An
attempt to fold a Core-features tab strip into this chapter and put it on a steel ground
was rejected and reverted; the reference for that strip is a separate component.

New chapter 4, "Core features" (`components/marketing/core-features.tsx`), built from the
owner's reference as its own component and placed before the proof deck. A chip, a
two-line title whose second half drops to 40% ink, a lede on the right, and four real
tabs (booking page, the call, the record, what needs you) over one large product screen
with a caption under it. Tabs are `role="tablist"` buttons: click or arrow-key, the
labelled panel swaps, focus is visible. The section sits on the page's own paper ground (an earlier dark treatment was removed at
the owner's direction); the proof deck after it is unchanged. The page is now nine chapters.

The three card images, final. Built to the owner's reference component (a leaderboard card
in dark frosted glass) piece for piece, after several wrong turns:

- **Backdrop** is a generated photograph of dunes at golden hour (`desert.jpg`, kept in this
  folder), then heavily blurred and darkened in the render. Compositing over a *sharp* photo
  was the earlier mistake: it read as a screenshot on a wallpaper, not as glass.
- **Pane** is one flat surface, no nested boxes. Chosen density: a 13% white fill with the
  sand desaturated inside the glass (`saturate(72%)`), which lands on the reference's neutral
  grey rather than picking up the sand's warmth.
- **Anatomy**, shared by all three cards: orb avatar with a white ring, title and sub-line, a
  chip top-right with an internal hairline divider, three filter pills with one active, a
  table header, full-bleed rows with an alternating tint, right-aligned values, and the white
  button as the one opaque element.
- `ref.py` renders all three (`python3 ref.py <out.html> D <call|record|flag>`), `render.mjs`
  shoots them at 820x964, which is the card's image slot aspect, so nothing letterboxes.

Two renders per card, not one. The card's image slot is portrait beside the copy on a
desktop and short-and-wide once the columns stack, so a single render either crops the
glass panel or shrinks it to a stamp. `ref.py <out> D <feature> wide` renders a 1200x760
landscape frame whose panel occupies 12-88% of the height; a `<picture>` serves it under
1024px and the 820x964 portrait above. Cover cropping is then always safe: the visible
band never eats into the panel. Cards stack at 1024 rather than 860, since two columns at
tablet width squeeze both halves.

Textured ground, owner-supplied. `.textured-section` (in `globals.css`, `@layer components`)
carries the conversion.ai treatment verbatim: a warm near-black base, the falloff baked into
`6.webp` rather than a CSS gradient, and a 128px grain tile blended with `mix-blend-mode:
overlay` inside an `isolation: isolate` parent. It wraps both dark chapters, Core features and Proof, in one container rather than sitting on
each section: two copies of the texture restart the falloff and leave a hard line at the seam. One override is needed because a pinned chapter lives inside: the class's `overflow: hidden`
would make the container a scroll port and stop the sticky stage pinning, so a container that
holds a pinned act keeps `overflow: visible`. Both textured chapters also take a dark token set, so the page's ink
flips for them.

Chapter 4's four tab screens are rendered in the same glass language as the deck, not raw
product screenshots, so the two chapters read as one room: `ref.py <out> D <key> stage`
renders a 1600x1000 frame (16:10, the stage's aspect) for the keys book, call, record and
flag. They show different views from the deck's three — the booking page, the client's
confirmation page as the call runs, the day's calls with their outcomes, and the flagged
list — so the two chapters do not repeat each other.

