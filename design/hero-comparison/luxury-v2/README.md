# AI Receptionist — luxury visual studies, revision 2

Created 8 September 2026 after Bubs requested imagery with a luxurious, clean, futuristic aerospace feel, then asked to lead with the value of time back. Open `index.html` for the owner-benefit opening, followed by a large single-direction view and a four-direction comparison. All images, copy and controls work offline.

The original comparison remains in the parent folder. This revision uses four new full-square technical photographs/visuals, one per direction, plus a human-benefit photograph of an owner taking a break. These are art-direction anchors and proposed story sequences, not generated motion footage or a replacement live homepage.

## What changed

- Graphite, titanium and cool white replace the warm stone, beige miniature sets and coloured glass effects.
- Large objects, real material detail and restrained architectural light carry each composition.
- A full-scale reception atrium replaces the miniature business.
- The phone-evolution study uses three recognizable devices arranged precisely, with match cuts proposed for the eventual motion.
- Headings and the booking → outbound AI call → owner record story are real HTML, separate from the imagery.
- The opening leads with time back: being with a customer, away from the desk, on a break or taking time off. The service remains clearly defined as online bookings and outbound appointment-confirmation calls.

Built-in `image_gen` created the assets. Exact prompts are saved in `docs/image-prompts.json`; `docs/asset-manifest.json` records dimensions and checksums. SpaceX and Starlink reference interpretation and exclusions are documented in `docs/art-direction.md`.

Next: choose or refine the strongest art direction, refine the matching story frames, then produce a short connected motion test. Historical phones should occupy roughly 20% of the fourth direction's sequence, with the remaining 80% explaining the service. Final motion must support deliberate mobile framing and reduced-motion preferences.

## Verification

All five images were inspected for composition, material detail and product relevance. The browser review passed on 8 September 2026: the opening and four owner moments, comparison/focus switching, direction selection by keyboard, loaded images and a 390px layout with no horizontal page overflow. All four comparison images remain square. Corrected the mobile opening width and framing to keep the owner visible, and hid decorative loading text after images loaded. No browser errors. Embedded copy matches the standalone JSON and the inline JavaScript parses. No live application or deployment changed.
