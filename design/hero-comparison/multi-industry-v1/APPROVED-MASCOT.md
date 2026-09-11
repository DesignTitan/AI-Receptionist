# Approved mascot: Happy Little Pillow

Approved by Bubs on 11 September 2026. This supersedes the original website portrait as the reference for future mascot generation.

- Original approved body portrait (preserved): `assets/mascot-cuddle.png`.
- Clean working master combining approved body and open-eye direction: `assets/happy-pillow-master.png` (job `128b3b7d-fb5a-4125-8394-ce13f269ee01`).
- Transparent derivative for layout/motion tests: `assets/happy-pillow-master-cutout.png`.
- GPT Image 2.5 reference job: `62fde102-5b1f-4e78-ba52-a6b91061d8e9`.
- Preserve pale mint colour, broad rounded-square pillow body, short lower-left speech tail, soft dense fur and prominent padded cheeks.
- Original approved portrait has closed smiling crescent eyes. The clean working master uses approved Ivory & Ink open eyes and a happy forest-green smile. Keep cheeks in every expression.
- No cowlick, curled tail, pear-shaped body or oversized glass eyes. Little Mischief, Curious Companion and Joyful Fluff were not selected.
- Use the clean master for future generations. Earlier storyboard shots may still predate this identity. Retain the breadth of expressions, poses, fur studies and industry costumes.
- The marketing website asset has not been replaced. A real-alpha cutout is available for compositing tests in motion-lab.html; the original film remains unchanged.

## Approved open eyes — Ivory & Ink #5

Selected by Bubs on 11 September 2026 as the direction for now.

- Reference: `assets/happy-pillow-eye-studies.png`, bottom-center portrait, option 5.
- GPT Image 2.5 job: `e85ac099-4ce4-4c32-b161-d0eeb2dcedab`.
- Warm ivory sclera, large rounded ink-black pupils and restrained cream catchlights. Preserve the illustrated eye size and spacing, padded cheeks and friendly gaze.
- Use these eyes for open-eye expressions going forward. Closed eyes and winks still deform naturally; hearts and stars remain temporary expressive variants.
- Current 36-expression and 12-reaction sheets now use this eye direction. The other five eye concepts remain unselected historical options.

## Updated research boards

- `assets/happy-pillow-research-ivory.png`: character and face construction research.
- `assets/happy-pillow-poses-ivory.png`: 20 pose studies.
- `assets/happy-pillow-grooming-ivory.png`: 12 grooming variations, fibre macros and face materials.
- All three use approved cheeks and Ivory & Ink eyes. Grooming variations remain exploratory, not a change to canonical fur. Updated expression and rotation studies are listed below; rotation geometry remains approximate.

## Colour direction

- Selected families: original mint, cool aqua, minty forest and sage.
- Explore each as a solid fur colour and a smooth gradient. No hard split two-tone patches.
- Reference board: `assets/happy-pillow-colours-ivory.png` (job `67093132-93df-4fc7-92da-98bb934c7a73`).
- Preserve approved cheeks, Ivory & Ink eyes and body proportions. Original mint remains the baseline; no single alternate has been selected as its replacement.

## Updated wardrobe and overview

- `assets/happy-pillow-wardrobe-v2.png`: eight updated industry/accessory looks, preserving approved cheeks and Ivory & Ink eyes. Previous six-look version retained.
- `assets/happy-pillow-overview-ivory.png`: updated Our Little Receptionist overview with portrait, orientations, expressions, poses and materials.
- Original sheets remain archived in assets; these replace their character-page presentations.


## Master refresh — 11 September 2026

- Current expressions: `assets/happy-pillow-expressions-ivory-36.png` and `assets/happy-pillow-love-ivory-12.png` (48 panels total).
- Current front/back studies: `assets/happy-pillow-front-ivory-95-v2.png` and `assets/happy-pillow-rear-ivory-95-v2.png`. Both retain 5 × 19 views. These are generated concept grids: some neighboring angles repeat, pitch and tail geometry drift. Do not use labels as measured rotations or tween these cells into a final film.
- Previous page snapshot: `character-sheets-before-master-v2.html`. Every old asset remains saved; first attempts from this refresh also remain in assets and generation manifests.
- Current wardrobe: contractor (tiny tilted yellow hardhat); salon (forest apron, no hairpins); groomer (grooming apron, no towel/collar); photographer (camera); mechanic (tool belt); medical (scrub cap/stethoscope); glasses (clear lenses, dark frames); everyday (plain mint).

## Signature movement studies

- `motion-lab.html`, `motion-lab.css`, `motion-lab.js`: six replayable, interruptible body gestures; original authored timings. Listening tilt 900ms, acknowledgment nod 620ms, attention hop 820ms, double-bounce 1150ms, curious peek 1050ms, soft settle 650ms.
- No automatic endless loops. A new gesture cancels the old one. System and manual reduced-motion modes retain a resting pose.
- Working cutout animation, not a facial/3D rig. Blinking, mouth shapes, cheek and accessory follow-through remain the next animation-production step.
- Page links Rive's My Avatar interaction example, Rive Web repository and the NFB animation principles. No third-party animation files copied; their patterns inform the original movement studies.
- Live tests cover 24/32/48/64/96/160px on white and forest backgrounds, plus adjustable overlay on Happy Paws. Cheeks and fur read more clearly from 64px; tiny icons need a simplified treatment if detailed expressions are required.
- Verified Chrome desktop (1440px) and mobile (390px): all character images load, video plays, overlay controls and motion interruption work, reduced motion is respected, no horizontal overflow.
