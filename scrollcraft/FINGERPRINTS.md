# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| AI Receptionist · product homepage · 2026-09-02 | Chaptered editorial on paper | Margin folio: numbered chapters down the left edge, no bar | Title page, type only; the image arrives in a column below | 9 chapters, 14.8vh: flow ×3 → scrub → flow → pan → pin (peak, 3.0) → flow → held close | Colophon: running-text CTA, small type, held | The page places a real call to the visitor (or, with no line, records the lead and says so) | Paper #f6f4ef, ink, one indigo accent; Instrument Serif + Inter | Next.js 16 route `/`, engine vendored at `src/vendor/scrollcraft`, build folder `scrollcraft/builds/receptionist` |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- Chaptered editorial on paper with a margin folio (numbered chapters, no nav bar).
- Title-page hero: type only, media arriving in a column.
- Colophon close with a running-text CTA.
- Signature move: the page calls the visitor.
- Act band: 9 chapters at ~14.8vh with one scrub and one pinned live plate as the peak.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
