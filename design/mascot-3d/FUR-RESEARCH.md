# Soft fur: research and Blender application

12 September 2026. The original generated mint mascot remains the likeness target. Monsters, Inc. is the user's reference for appealing, soft character fur; this is not a claim to reproduce Pixar's proprietary production pipeline.

## What the sources establish

- [Pixar RenderMan: From Hick to Hipster](https://renderman.pixar.com/from-hick-to-hipster) separates guide styling from generated hair, stresses reference-driven grooming, and combines layered clumping, bend, length variation and restrained noise. Lighting is evaluated throughout grooming, not added only at the end.
- [Pixar: hair illumination and deep shadows, SIGGRAPH 2005](https://research.pixar.com/docs/2005.SiggraphTalks.PHA.pdf) discusses hair self-shadowing. The indexed abstract was available; the full PDF could not be retrieved in this session. It is background context, not a copied implementation.
- [Blender Principled Hair documentation](https://docs.blender.org/manual/en/4.0/render/shader_nodes/shader/hair_principled.html) describes the Chiang and Huang scattering models. Hair needs direction-dependent reflection and transmission. Roughness changes the spread of highlights; per-strand variation avoids uniformity. Shader controls were also verified directly in installed Blender 5.1.1.
- [Blender Cycles 4.2 release notes](https://developer.blender.org/docs/release_notes/4.2/cycles/) describe improvements to Huang close-up scattering and denoising. This pass uses Chiang for controllable soft fur, rather than claiming newer necessarily means better for this reference.

## Diagnosis of the previous render

The previous groom was made of beveled legacy curves with ordinary, highly rough surface materials. Those rendered as coarse opaque tubes. Random directions and broad colour variation made the coat grainy. Flat ambient lighting and separate catchlight geometry weakened the eye/cheek forms. Increasing ray samples alone would only render those choices more cleanly.

## Applied Blender approach

`build-film.py` reuses the editable base construction from `build.py`, then makes a separate Blender-only scene. No web model or Spline asset is regenerated.

- Native hair curves with fine tapered radii, directional guides, subtle clumping, an undercoat and restrained variation.
- Principled Hair / Chiang shader with mint direct colouring, moderate longitudinal/radial roughness, and limited per-strand roughness variation.
- Cycles path tracing: reflection, transmission and inter-strand shadowing, with sufficient light bounces and adaptive sampling. Metal GPU on this Mac.
- Broad directional key, weaker fill, soft rim and a shadow-catching studio floor composited over white inside Blender. A small reflected softbox supplies the eye highlights. The compositor uses Blender 5.1’s node-group API and named image sockets.
- Fuller blended cheeks and revised eye proportions, because shading alone cannot fix silhouette or expression.
- Inspect a draft before producing the higher-resolution final. Denoising cleans sampling noise; it is not used as a blur to fake soft fur.

## Review notes

The initial native-hair draft was too pale and combed flat. Later drafts shortened the fibres, moderated clumping and roughness, narrowed the colour range, increased cheek volume and reduced oversized eye reflections. The full render uses 1,800 × 1,800 pixels, up to 512 samples, a 0.008 adaptive threshold and denoising. The existing website study is intentionally an earlier asset; judge this pass in Blender or from the full PNG.

## Reproduce

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design/mascot-3d/build-film.py
MASCOT_FINAL=1 /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design/mascot-3d/build-film.py
```

For an existing groom, load `mascot-film.blend` and run `render-film-final.py`; then run `create-film-review.py` to pack the final image and original reference into a separate split-view file.

Outputs: `mascot-film.blend`, `renders/soft-fur-draft.png`, `renders/soft-fur-final.png`. Exact likeness remains subject to visual comparison; no Pixar-quality certification is implied.

## User-supplied video and controlled audit

Reviewed [The Software Pixar Artists Use For Hair & Fur — InspirationTuts](https://www.youtube.com/watch?v=TED87pzi078): the complete available captions and visual examples at 0:40, 1:20, 2:05, 2:35, 3:15 and 3:55. It is a historical overview, not a Blender settings tutorial. Its useful points are deliberate guide grooming, simulation driven from guides, and rendering that preserves translucency and self-shadowing. These inform the workflow; they do not certify this asset as matching Pixar's results.

`audit-fur.py` renders the same forehead patch with prior light settings, restored glossy light response, and denoising disabled. Visual inspection showed that the raw and denoised images retained the same matted structure. Restoring light response helped shading but did not fix the groom. The previous eye-light workaround affected the coat and should not be used globally.

The next swatch tests coherent guide lengths, increased root lift, reduced clumping and a separate dense undercoat. Keep the last full portrait until the swatch is inspected. `test-lifted-groom.py` forces swatch-only mode and does not overwrite the master Blender file. The test reduced visible blotchiness but still lacked the original reference’s distinct soft tufts; it was not promoted to the character.
