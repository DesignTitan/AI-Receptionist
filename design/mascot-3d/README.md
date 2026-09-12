# AI Receptionist — editable 3D mascot

Second likeness study, 12 September 2026. The shape and likeness still need visual review against `public/marketing/happy-mascot-pointed.png`. This is a new modeled character, not a flat image mapped onto a plane.

## Editable regional groom — current Blender study

Open `mascot-groom-review.blend` for the editable model beside the packed Cycles render and original reference. `mascot-groom-studio.blend` is the editable source scene. This replaces the frozen full-coat approach with six authored guide regions, separate undercoat guides, surface UV attachment and live Geometry Nodes interpolation. The original remains the likeness target; this is not a claim of exact visual matching.

Select a regional object in **GROOM • editable regional guides** and use Sculpt mode to comb or lengthen guides. Turn viewport overlays on to see the selection. Select **TOPCOAT • live controls** or **UNDERCOAT • live controls** and open its modifier panel for density, clumping, frizz and fibre radius. Generated viewport density is reduced to 7%; renders use full density. The guide-edit verification checks that changing guides changes generated fibers and that restoring guides restores the coat.

The topcoat uses explicit nearest-guide convergence, tapered native fibers and restrained frizz. Regions are joined before interpolation to avoid independent patch edges. The short undercoat fills gaps. Blender's bundled hair node assets are embedded; their CC0 license is included in `BLENDER-ASSETS-LICENSE.txt`. No additional installation was needed.

```sh
MASCOT_FINAL=1 /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design/mascot-3d/build-groom-studio.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design/mascot-3d/verify-groom-studio.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design/mascot-3d/create-groom-review.py
```

The builder loads the committed `mascot-film.blend` as its body/lighting starting point; it writes separate groom files and `renders/regional-groom.png`. Final settings are 1600 square, up to 384 Cycles samples, 0.008 adaptive threshold, Metal GPU, and denoising. `create-groom-review.py` packs the completed render; the saved image does not update automatically after editing. F12 renders edits, then choose **Render Result** in the image editor.

Research and assessment: [FUR-RESEARCH.md](FUR-RESEARCH.md). No dynamics simulation, full expression rig or After Effects project is included. Those follow approval of the static character. Browser GLB and Spline were not changed.

## Blender soft-fur pass

The earlier, rejected Blender-only look-development pass is `mascot-film.blend`; `mascot-film-review.blend` keeps an editable modelling view beside the finished render. It uses native hair curves and a dedicated hair-scattering shader. The older web GLB and master below are a separate earlier study and were not regenerated in this pass.

Research, rendering choices and source links: [FUR-RESEARCH.md](FUR-RESEARCH.md). Render: `renders/soft-fur-final.png`. Build with `build-film.py`; render the existing scene with `render-film-final.py`; create its split workspace with `create-film-review.py`. In Blender, the left solid modelling view intentionally does not show the final shader. Use the full render on the right for judging fur and lighting.

## Open and inspect

- Local studio: http://127.0.0.1:3101/__dev/design/mascot-3d/index.html
- Blender split review workspace: `design/mascot-3d/mascot-review.blend` (editable model left, packed full render right)
- Blender master: `design/mascot-3d/mascot-master.blend`
- Portable animated model: `public/mascot-3d/mascot.glb`
- Transparent Blender portrait: `public/mascot-3d/portrait.png`
- Counts and controls: `design/mascot-3d/manifest.json`

The studio has Live 3D, Blender render and Original character comparison views, plus orbit/zoom, four camera views, manual blink, a greeting, cursor-following eyes, and pause/play. Reduced-motion preferences disable automatic idle and gaze. It uses the actual GLB, with an image fallback if loading/WebGL fails. No homepage mascot has been replaced.

In the Blender review workspace, the right panel is a saved render, not an automatically updating preview. Press **F12** after edits, then choose **Render Result** in the image selector to see the new frame. The render image is packed into the review file. Rebuilding the master does not update the review copy until the workspace script is run.

## Master and runtime

The Blender source includes a seamless rounded body and pointed speech-bubble nub, recessed smiling mouth, separate eyes/pupils/catchlights, a 150,000-strand editable curve groom, lights and portrait camera. `Fur_Web` is hidden in the Blender master; it carries 40,000 crossed geometric fibres for portable rendering. The master skin has a packed 1,024px colour texture. The browser body and fibres use a 2,048px baked groom appearance; that lighting is baked in, while the Blender master can be fully relit. Cheeks now blend into the body, the eyes sit deeper, and the groom curves around the face.

The runtime has 307,766 triangles and is approximately 23.0 MiB. This is a review asset, not yet an optimized navigation widget. Budget a smaller version and test real mobile devices before homepage integration. The high-quality groom and browser approximation will not look identical.

This uses a named object-control rig, not a skinned skeleton:

- `MascotRoot`: body position and tilt.
- `Eye_L`, `Eye_R`: blink by local vertical scale.
- `Gaze_L`, `Gaze_R`: separate pupil position controls.
- `Idle`: exported four-second looping bob/tilt with blink, 24 fps, Blender frames 1–97.

In Blender the vertical axis is Z; in the exported glTF it is Y. The browser's manual greeting and cursor response are procedural interactions in `studio.js`; they are not additional exported animation clips. The master supports further animation work but does not yet include speech shapes, a mouth-expression rig, or a full expression library.

## Rebuild and validate

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design/mascot-3d/build.py
/Applications/Blender.app/Contents/MacOS/Blender --background design/mascot-3d/mascot-master.blend --python design/mascot-3d/create-review-workspace.py
node design/mascot-3d/verify.cjs
```

The generator requires Blender 5.1+, creates the scene from scratch, and overwrites only this mascot's generated master/model/portrait/manifest. Run verification against the existing workspace preview; it checks GLB controls, embedded texture/animation, blink and greeting reset, gaze, rotation, mobile width, reduced motion and load-failure fallback. Verification refreshes the page-index thumbnail and writes review screenshots to `/tmp`.

Three.js 0.186.0 is vendored only inside this local study. Its MIT license is in `vendor/LICENSE.txt`; GLTFLoader's utility imports were adjusted for that folder. No runtime CDN is required.

## Next production steps

Review front/side/back likeness and fur, then optimize a separate small website asset and expand expressions. Import the GLB into Spline or After Effects to test material/animation compatibility. After Effects has not been located or connected on this Mac, so no `.aep` project or AE verification is claimed. For full-quality fur animation, render the Blender groom with transparency and composite those renders in After Effects.
