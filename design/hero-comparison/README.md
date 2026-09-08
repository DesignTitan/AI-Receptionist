# AI Receptionist — four hero directions

Created 8 September 2026 for Bubs's comparison. These are visual storyboards and an interactive still-frame viewer, not finished video or a deployed replacement hero.

Open `index.html` in a browser. It works offline: all artwork and copy are local, and there are no third-party scripts or fonts. Select the same scene number across all four directions, view the full storyboard, or focus one direction to inspect its headline and camera plan.

## The four directions

1. **The phone on stone:** a cinematic ordinary smartphone, online booking, outgoing confirmation call and owner dashboard.
2. **A business in miniature:** one warm architectural studio opens up to show the same service workflow.
3. **Inside the booking:** a dimensional appointment card separates into booking, call, transcript and summary layers before forming the dashboard.
4. **The next chapter of the phone:** rotary, push-button and smartphone forms lead into the AI receptionist's software workflow.

Each artwork is a square 1:1 board containing four square scenes in reading order. The viewer frames individual quadrants with CSS; the generated image files remain unmodified. Copy and interface details within the images are illustrative. Final headings, buttons and real product UI will be built as readable web elements.

## Intended motion, after choosing the direction

- Use native scroll position to advance and reverse the visual story. Stopping the scroll holds the scene.
- Begin with roughly 10–12 seconds of source motion over two to three viewport heights; refine the pacing with the actual footage.
- In direction 4, devote about 45% to the historical devices and at least 55% to the current service. The last scene shows a booking, an outgoing AI confirmation call and its record. It does not introduce a new hardware device.
- Plan a deliberate portrait composition and a still version for reduced-motion preferences. Keep the message and action available from the opening view.

## Decision to make

Choose the overall visual direction and the opening composition. Then refine the selected keyframes and generate a short connected motion test before producing the full desktop and mobile hero.

Generated with the built-in image generation tool. Exact image prompts are recorded in `docs/image-prompts.json`; storyboard copy is in `docs/hero-comparison-copy.json`. These concepts build on the research documented in the project's `docs/hero-directions.md`.

## Review checks

Browser review passed on 8 September 2026: shared scene selection, full-board view, focused fourth direction, Escape and focus return. At 390px, the four images remain square with no horizontal page overflow and the detail dialog fits the viewport. The browser reported no errors. Embedded copy matches the standalone JSON; the inline script parses successfully. No application code or deployment changed.
