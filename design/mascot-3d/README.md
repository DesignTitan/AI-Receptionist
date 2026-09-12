# AI Receptionist — editable 3D mascot

First working 3D prototype, 12 September 2026. The shape and likeness still need visual review against `public/marketing/happy-mascot-pointed.png`. This is a new modeled character, not a flat image mapped onto a plane.

## Open and inspect

- Local studio: http://127.0.0.1:3101/__dev/design/mascot-3d/index.html
- Blender master: `design/mascot-3d/mascot-master.blend`
- Portable animated model: `public/mascot-3d/mascot.glb`
- Transparent Blender portrait: `public/mascot-3d/portrait.png`
- Counts and controls: `design/mascot-3d/manifest.json`

The studio has orbit/zoom, four camera views, manual blink, a greeting, cursor-following eyes, and pause/play. Reduced-motion preferences disable automatic idle and gaze. It uses the actual GLB, with an image fallback if loading/WebGL fails. No homepage mascot has been replaced.

## Master and runtime

The Blender source includes a seamless rounded body and pointed speech-bubble nub, recessed smiling mouth, separate eyes/pupils/catchlights, a 110,000-strand editable curve groom, lights and portrait camera. `Fur_Web` is hidden in the Blender master; it carries 40,000 crossed geometric fibres for portable rendering. The skin has a packed 1,024px baked colour texture.

The runtime has 144,886 triangles and is approximately 8.7 MiB. This is a review asset, not yet an optimized navigation widget. Budget a smaller version and test real mobile devices before homepage integration. The high-quality groom and browser approximation will not look identical.

This uses a named object-control rig, not a skinned skeleton:

- `MascotRoot`: body position and tilt.
- `Eye_L`, `Eye_R`: blink by local vertical scale.
- `Gaze_L`, `Gaze_R`: separate pupil position controls.
- `Idle`: exported four-second looping bob/tilt with blink, 24 fps, Blender frames 1–97.

In Blender the vertical axis is Z; in the exported glTF it is Y. The browser's manual greeting and cursor response are procedural interactions in `studio.js`; they are not additional exported animation clips. The master supports further animation work but does not yet include speech shapes, a mouth-expression rig, or a full expression library.

## Rebuild and validate

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design/mascot-3d/build.py
node design/mascot-3d/verify.cjs
```

The generator requires Blender 5.1+, creates the scene from scratch, and overwrites only this mascot's generated master/model/portrait/manifest. Run verification against the existing workspace preview; it checks GLB controls, embedded texture/animation, blink and greeting reset, gaze, rotation, mobile width, reduced motion and load-failure fallback. Verification refreshes the page-index thumbnail and writes review screenshots to `/tmp`.

Three.js 0.186.0 is vendored only inside this local study. Its MIT license is in `vendor/LICENSE.txt`; GLTFLoader's utility imports were adjusted for that folder. No runtime CDN is required.

## Next production steps

Review front/side/back likeness and fur, then optimize a separate small website asset and expand expressions. Import the GLB into Spline or After Effects to test material/animation compatibility. After Effects has not been located or connected on this Mac, so no `.aep` project or AE verification is claimed. For full-quality fur animation, render the Blender groom with transparency and composite those renders in After Effects.
