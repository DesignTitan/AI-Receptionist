# NOW

## Current handoff — website mascot identity and sky opening (10 September 2026)

- Source of truth is public/marketing/receptionist-mascot.png: rounded-square speech bubble, mint fur, closed crescent eyes, lower-left tail. Uploaded exact asset as Higgsfield reference a34dabfc-027c-439c-b317-bc62b5375d9e.
- Generated sky/tree opening with GPT Image 2.5 using user screenshot only for setting; added 7-pose mascot sheet linked in viewer.
- Corrected existing mascot appearances using GPT Image 2.5. Rejected collateral changes to non-mascot panels (including wrong dog); viewer uses original non-mascot panels and corrected mascot panels only.
- Other people/dog character sheets and final scene generation still pending. Homepage assets unchanged.
- Local commit only; prior public push approval block remains.

## Current handoff — centered mascot intro (10 September 2026)

- Added scene 1: existing mint mascot centered on near-black forest green, no headline or bubble.
- Notes specify a brief blink/smile, about 1.5 seconds, then incoming ring into the groomer. This is a storyboard frame, not rendered animation.
- Viewer now has 25 scenes; character-sheet-first production workflow remains pending.
- Local commit only; prior public-push approval block remains.

## Current handoff — restore scene viewer (10 September 2026)

- Matched approved-cast-scenes storyboard layout: large scene, Previous/Next, thumbnail strip, action and dialogue; hash links and arrow keys supported.
- Saved four earlier GPT Image 2 sheets as draft visuals only, explicitly not final character references; production brief moved behind a link.
- Confirmed Higgsfield catalog has gpt_image_2_5 and seedance_2_5. User requires mascot sheet first, then every person/dog sheet, then scenes and video. Do not reuse unapproved draft mascot as identity reference.
- Next: generate reference-based mascot sheet with requested 2.5 model, then full character roster. Port 55446 was offline; recovered original layout from saved approved-cast-scenes/index.html.
- Local commit only; earlier public push approval block remains.

## Current handoff — video assets and multi-industry production plan (10 September 2026)

- Added playable/downloadable Happy Paws first cut to Marketing assets, linked a new 24-shot, 65-second multi-industry storyboard.
- Retrieved public X embed: second post demonstrates four-angle character references; full long prompt is truncated. Inspected film frames; distinguish observations from proposed transition/edit workflow.
- Detailed cast/location reference requirements, exact dialogue, camera/action, mascot/graphics timing and per-shot rejection gates; no new footage generated.
- Next: approved character/location sheets, timed dialogue and one difficult motion test before full generation. Existing homepage film unchanged.
- Local commit only; prior public-push approval block remains.

## Current handoff — proof image frame repaired (10 September 2026)

- Restored 8px green padding on all sides of proof images and rounded all desktop frame corners.
- Removed the oversized blurred fill inside the image frame that was bleeding into its padding; preserved the separate Gaussian drop shadow outside the card.
- Browser verified padding, radii and removed fill; visually checked the result.
- Local commit only; previous public-push approval block remains.

## Current handoff — simplified industry copy; alternative layout discussion (10 September 2026)

- Removed top slogans, subcategory lists and bubble labels; cards retain industry, one short benefit and concise dialogue. Glass bubbles are more translucent.
- Replaced white-backed mascot with verified alpha-transparent PNG; removed badge rounding/shadow. First generated background removal failed alpha validation; second passed.
- Typecheck and browser copy check passed. User now wants contextual alternatives to the carousel; proposing industry selector, problem selector or compact directory before replacing layout.
- Local commit only; earlier public-push approval block remains.

## Current handoff — pricing comparison implemented (10 September 2026)

- Replaced homepage #terms pricing cards with the selected comparison-table layout: white/forest, mint Busy desk column, shared features and separate setup/overage details.
- Prices, minutes, team limits, features and setup totals come directly from pricing.ts; billing unchanged. Used actual $199/$399/$749 plans, not erroneous reference-image values.
- Typecheck passed; visually checked desktop, validated all three plan links and mobile horizontal table scrolling without page overflow.
- Local commit only; previous public-push approval block remains.

## Current handoff — minimal pricing concepts (10 September 2026)

- Created two pricing images using real pricing.ts content: A editorial columns, B comparison table. Saved in docs/design/pricing-concepts.
- Verified plan prices, minutes, team limits, setup and overage against source. First B render invented values and was rejected; saved B is corrected.
- Pricing UI and billing remain unchanged, awaiting design selection. Callback concepts were rejected; keep future direction clean and minimal.
- Section 7-to-8 scroll delay fixed in prior commit. Local commit only; earlier public-push approval block remains.

## Current handoff — callback scroll fix (10 September 2026)

- Removed section 7’s three-screen pin and scroll-driven fade; callback form now flows directly into section 8.
- Preserved the form and added normal responsive vertical spacing.
- Typecheck passed; browser confirmed static positioning and zero inter-section gap.
- Local commit only; prior public-push approval block remains.

## Current handoff — industry ending and callback concepts (10 September 2026)

- Added an And many more end card linking to the callback section. Removed the intentionally empty rc-silence full-screen section after the gallery.
- Generated two callback visual concepts for review: friendly mascot/form and glass handset/form; callback design has not been implemented.
- Asked which unused section belongs here; the booking → call → outcome explainer is only a prior recommendation in the available handoff, so its placement remains pending clarification.
- Typecheck and browser verified eleven gallery cards and direct transition to #hear. Local commit only; previous public-push approval block remains.

## Current handoff — smooth film overlays (10 September 2026)

- Headline and scrim remain mounted and fade over 450ms when playback changes; paused copy returns smoothly.
- Play pill now fades instead of disappearing instantly; control bar retains its soft opacity transition. Overlay positioning is consistent across playback states.
- Typecheck passed; browser verified intermediate and final fade opacity. Reduced motion skips transitions.
- Local commit only; previous public-push approval block remains.

## Current handoff — industry stories over the imagery (10 September 2026)

- Moved the example AI conversation and mascot onto each active industry card, with a layered glass bubble entrance. Cards explain what occupies the person and what AI handles.
- Combined medical/dental into one example; ten varied situations remain. Existing photos retained; copy now makes the interruption and benefit explicit.
- Removed the white seam beneath the video by darkening the wrapper below its top corners and overlapping the join by 1px.
- Typecheck passed; visually checked desktop/mobile overlays and confirmed no mobile overflow. Local commit only; previous public-push approval block remains.

## Current handoff — pause overlay and quieter controls (10 September 2026)

- Pausing restores the headline over the current video frame; clicking the video surface toggles pause/resume without resetting its position.
- Compact controls fade to 35% while playing and brighten on hover or keyboard focus; controls remain above the clickable surface.
- Typecheck and browser checks passed for preserved pause position, headline return, surface resume, control pause and opacity.
- Local commit only; previous public-push approval block remains.

## Current handoff — card blur and industry movement (10 September 2026)

- Proof cards now gain 0–18px Gaussian blur in step with their existing fade as the next card covers them; reduced motion disables the added blur.
- Industry intro now translates left at exactly the same rate as its card rail on desktop; removed the inner clipping boundary so cards no longer cut into the heading.
- Mobile/reduced-motion native gallery stays intact. Typecheck passed; browser verified matching transforms and a constant 43px gap during scrolling, plus blur/fade progression.
- Local commit only; previous public-push approval block remains.

## Current handoff — compact player and dark-section finish (10 September 2026)

- Replaced full-width native controls with a centered 600px glass bar: pause/play, time, seek, mute, captions and fullscreen. Mobile fits within 16px side margins.
- Rounded the dark feature/proof block’s bottom corners to 48px to match the film top; clip-path preserves sticky scrolling.
- Typecheck passed; browser verified pause, seeking, mute, captions, desktop/mobile control widths and corner radius.
- Local commit only; previous public-push approval block remains.

## Current handoff — larger film corners (10 September 2026)

- Doubled the film’s top corner radius from 24px to 48px.
- Bottom corners remain square, with no side padding.
- Verified the targeted CSS change; unrelated work preserved. Local commit only; earlier public-push approval block remains.

## Current handoff — industry gallery built (10 September 2026)

- Built the approved white #industries gallery with eleven categories: doctors, dental, healthcare, fitness, personal care, retail, pet services, creative studios, home/auto services, professional services and lessons/coaching.
- Added new people-at-work photographs and one consistent awake, dimensional fuzzy mascot; the branded conversation card changes with the active industry. Desktop scroll pans the gallery; phones/reduced motion use native swipe with buttons and arrow keys. No automatic audio.
- Generated and visually checked all twelve assets, optimized to under 1 MB total. Sources/direction are in docs/design/industries; implementation is industry-gallery.tsx plus marketing CSS. Mobile navigation spacing corrected.
- Verified all images, all eleven categories, keyboard controls, 320/390/1440px fit, reduced motion and production build/dev-tool exclusion. Also verified the other task’s new Happy Paws film in the exact #turn block: playback, captions, native controls and mobile fit.
- Next: Bubs reviews the finished gallery. Suggested placing the separate booking → call → outcome graphic after the video and before Core features; this remains a recommendation. Local commit only; previous automatic public-push approval block remains unresolved.

## Current handoff — film corner refinement (10 September 2026)

- Removed the film wrapper’s side padding; video is edge to edge again.
- Kept 24px rounding on the top corners only, with square bottom corners.
- Cursor-following glass play pill remains intact. Verified the CSS change; separate industry work preserved.
- Local commit only; previous public-push approval block remains.

## Current handoff — rounded film and cursor play pill (10 September 2026)

- Added a parent wrapper with 8px left/right padding and 24px rounded film corners.
- Glass Play me pill follows mouse movement, clamped inside the video; touch and keyboard retain a fixed prompt.
- Typecheck passed; browser verified inset, corners, pointer tracking and keyboard playback.
- Separate industry edits preserved. Local commit only; previous public-push approval block remains.

## Current handoff — full-section film (10 September 2026)

- Made the homepage #turn film fill its section, with white overlay copy and a Play me hover prompt.
- Mobile and keyboard users see the play prompt; starting playback clears the overlay and enables native controls and captions.
- Verified actual playback, typecheck and mobile width; playback contains the full frame to preserve dialogue.
- Preserved separate industry-gallery work. Local commit only; prior public-push approval block remains.

## Current handoff — approved film on homepage (10 September 2026)

- Bubs approved the Happy Paws cut; integrated it into the reserved homepage #turn section, replacing the old confirmation scroll-scrub clip.
- Added on-demand native video controls, poster, English captions and connected-pilot note; chapter now reads Your day back. No autoplay audio or full video preload.
- Typecheck passed; local video metadata/controls verified, no autoplay, and no mobile page overflow. Other in-progress industry changes preserved.
- No deployment or public push; prior approval block remains.

## Current handoff — dimensional mascot correction (10 September 2026)

- Bubs rejected both sleeping eyes and the first open-eye revision, whose glossy features looked pasted onto the 3D mascot. Created v3 examples with smaller recessed eyes and fur-integrated facial shading; awaiting review.
- Updated conversation cards to match the white/forest/mint site styling without cartoon speech tails. Saved three mascot-v3 images and direction notes in docs/design/industries; website unchanged.
- Expanded industry coverage includes doctors, dental, broader healthcare, fitness, retail and other services. Next: approve a consistent mascot treatment before implementation. Prior public publishing approval block remains unresolved; commit locally.

## Current handoff — Happy Paws first moving cut (10 September 2026)

- Built 70.294-second 1080p first cut in docs/design/busy-life/video-v1/happy-paws-first-cut.mp4; review player on localhost:55447.
- Uses approved cast and mischievous Milo, incoming-call greeting before caller reveal, back-and-forth dialogue, narrator and lakeside ending. Seedance 2.5 via Higgsfield.
- Fuzzy dimensional mascot has animated mouth and eyes, separately composited beside exact speech text after combined generations copied reference backgrounds. Rendered animation, not a rigged 3D model.
- Checked dialogue transcript, sampled finished frames, mascot motion and output duration. Next: Bubs reviews first cut; refine scale, voice continuity and edge polish before release.
- No site deployment. Saved locally; prior public-push approval block remains.

## Current handoff — industry mascot conversations (10 September 2026)

- Bubs selected the white industries gallery and wants the mascot to demonstrate customer conversations specific to each industry as cards scroll into focus.
- Generated three reference-based static examples: health confirmation, personal-care booking and creative-studio booking. Saved mascot-*.png and exact prompts in docs/design/industries.
- Each shows one mascot conversation below the active card, clear of faces and labels; incoming booking examples retain the pilot note. Website unchanged pending visual feedback.
- Next: review these examples before implementation. Local commit only; prior automatic approval block on public publishing remains unresolved.

## Current handoff — mischievous Milo (10 September 2026)

- Bubs approved the restored cast and requested wilder reference-like hair and a bratty little dog in scene 4.
- Edited only the caller image through Higgsfield Seedream 4.5: irregular upright flyaways, head tilt, tongue out and paw tugging blanket; preserved caller and room.
- Updated scene 4, overview and gallery; retained earlier raw artwork. Next: review this dog expression before animation.
- Commit locally; earlier public-push approval block remains.

## Current handoff — industries image examples (10 September 2026)

- Created three visual section mockups in docs/design/industries: white, mint and deep-forest horizontal galleries with people working in salons, pet grooming and photography.
- These are generated design examples for review, not final photographic assets. Website remains unchanged.
- Next: Bubs selects or adjusts a direction before implementation; #turn remains reserved for the other task’s video.
- Saved locally; earlier automatic review block on public GitHub publishing remains unresolved.

## Current handoff — restore approved characters (10 September 2026)

- Bubs rejected the recast people in final-scenes; restored the supplied original brunette groomer and lakeside partner as character references using Higgsfield Seedream 4.5.
- Built twelve corrected stills and gallery in docs/design/busy-life/approved-cast-scenes. Samoyed at grooming; crazy-haired terrier beside caller. Terrier is reference-based, not pixel-identical.
- Corrected split-frame generation artifacts, dog scale and hiking footwear; checked finished exports and gallery navigation. No video or production-site changes.
- Next: Bubs reviews this corrected cast and dog treatment before animation. Prior public-push review block remains; commit locally.

## Current handoff — darker core features and preview logos (10 September 2026)

- Bubs confirmed #turn is reserved for the video being produced in the other task; the static confirmation concept is not replacing it.
- Kept the core-feature tabs and parallax layout, deepened the shared charcoal ground while preserving grain, and applied Apfel Grotezk/Open Runde with white/mint heading “Your bookings. Your calls. All together.”
- Rebuilt all ten active feature/proof illustration layers with existing site logos: Solstice’s sparkle on the booking page, AI Receptionist’s phone mark on owner views. Updated preview fonts and removed the booking preview’s fixed call-time/automatic-rescheduling wording. Rebuild with node scripts/render-marketing-previews.mjs.
- Verified all four tabs, keyboard navigation and image loading at 320/390/1440px without overflow; typecheck and production build/dev-tool exclusion passed.
- Next: review #features, then continue the following website sections. Video artwork remains in progress in the other task. Local commit only; the earlier automatic review block on public GitHub publishing remains unresolved.

## Current handoff — individual scene artwork (10 September 2026)

- Built twelve individual 2560×1440 scene exports in docs/design/busy-life/final-scenes, with a one-at-a-time HTML viewer, full script and overview. No video or live-site changes.
- Switched to Higgsfield Seedream 4.5 reference editing for consistent groomer/caller imagery. Milo uses FLUX outpainting of the exact supplied photo; caller close-ups keep him off-screen. Source remains lower-resolution than other frames.
- Added readable glass call/booking treatments, a newly generated open-eyed fuzzy mascot and closing CTA. Corrected unwanted storefront lettering and closing wardrobe; checked exports and viewer navigation.
- Upload of the non-public original mascot was rejected by automatic approval review; it stayed local and a description-based version was used. Public push remains blocked by the earlier review; commit locally.
- Next: Bubs reviews the individual finished stills before animation and voice production.

## Current handoff — Samoyed and wild-haired Milo storyboard (10 September 2026)

- Rebuilt the 72-second, twelve-panel storyboard using Higgsfield Soul 2.0 photography and Bubs’s uploaded wild-haired Yorkshire terrier reference for scene 4; Samoyed remains the grooming customer.
- Created storyboard-v6.html, two visual page PNGs, full script and generation provenance in docs/design/busy-life. Glass call/booking treatments are composed separately; scenes 5 and 7 continue the same washing moment.
- Replaced defective final shots after visual review. These are concept boards: human faces/set continuity and final fuzzy mascot animation still need a production pass before video generation. No site or video changes.
- Next: review the storyboard with Bubs. Commit locally; earlier automatic approval review still blocks public push.
- Latest correction: Milo must look exactly like the supplied photo, including extreme flyaway hair. Saved original as milo-approved-reference.png and used it unmodified in scenes 4, 6 and 8; generated lookalikes are superseded.

## Current handoff — photographic dog casting (10 September 2026)

- Bubs rejected v4's AI-looking images. New direction: Samoyed grooming dog with a natural funny smile; shaggy caller dog in scene 4.
- Researched Samoyed, Polish Lowland Sheepdog and Old English Sheepdog references; switched from GPT Image 2 to Higgsfield Soul 2.0 for three individual photographic casting frames. Prompts, sources and job IDs are in docs/design/busy-life/dog-casting-v5.md and its prompts JSON.
- Review this new casting before rebuilding the remaining storyboard around consistent identities. Existing v4 archived; no new video or site changes. Public push remains blocked by prior approval review.

Handoff notes for the next session. Updated 2026-09-10. Launch is Thursday 1 October 2026;
the dated plan is docs/ROADMAP.md.

## Current handoff — chronological grooming revision (10 September 2026)

- Applied Bubs’s scene notes: beautiful golden retriever opening, hands remain occupied, shaggy caller dog, business-name greeting, no flashback or photographer cutaway, clear voiceover connecting finished work to leaving.
- Generated revised Higgsfield frames (job d04d970b-f84f-404f-b90f-f6a19f8eedc2); saved storyboard-v4.html, two page PNGs, script and exact prompt in docs/design/busy-life. Visually reviewed both sheets. Glass overlays remain production treatments to refine separately.
- Recorded plan for separate photographer, salon, mechanic and other business films after this story is approved. Next: review v4 before video production. Site unchanged; local commit only due to prior public-push approval block.

## Current handoff — researched twelve-shot story (10 September 2026)

- Researched advertising hooks, character goals, narrative engagement, runtime and customer pain points; saved a cited strategy brief in docs/design/busy-life/storytelling-research.md.
- Created a new 72-second, twelve-shot story with caller perspective and a hiking-bag setup/payoff. Generated reference-based 4K stills through Higgsfield (job 0fd98703-3e56-4d38-bd73-7b0b271f8d83).
- Saved storyboard-v3.html, two rendered page PNGs, full script and prompt in docs/design/busy-life; inspected layouts and aligned caller descriptions. Next: Bubs reviews before Seedance video production. No site changes; public push remains blocked by prior approval review.

## Current handoff — production storyboard sheet (10 September 2026)

- Reformatted existing six frames into a traditional three-column, two-row storyboard with timing, action, dialogue and sound/graphics directly below each frame, matching Bubs’s example.
- Saved editable production-storyboard.html and rendered production-storyboard.png in docs/design/busy-life. No new imagery, video or site changes.
- Next: review the complete visual/script sheet before animation. Prior public-push approval block remains unresolved; saved locally.

## Current handoff — reference-based storyboard and script (10 September 2026)

- Created six-frame storyboard through Higgsfield using the original four-frame image as an uploaded reference. Saved storyboard-v2.png, exact prompt and full 30-second script in docs/design/busy-life.
- Sequence establishes busy hands, ringing phone and glance, AI answering, conversation, booking result, then lakeside time off. Mascot direction is open-eyed with restrained glass overlays.
- The earlier 12-second video was rejected for visual drift. Next: review this storyboard before rendering reference-driven Seedance 2.5 footage. Site unchanged; local commit only because prior public-push review remains unresolved.

## Current handoff — Higgsfield motion revision (10 September 2026)

- Bubs requested less artificial footage, an open-eyed talking mascot and restrained liquid-glass overlays with clean typography.
- Verified Seedance 2.5 in Higgsfield and submitted a 12-second 1080p motion test; job and exact prompt saved in docs/design/busy-life/seedance-2.5-test.md. Generation is pending, not yet visually accepted.
- Next: inspect the result before integrating anything; prepare approved character references and separate motion layers for production. Site unchanged; public push remains blocked by prior approval review.

## Current handoff — busy-life explainer preview (10 September 2026)

- Created a four-frame visual storyboard: busy hands, AI conversation, booking outcome, and time off. Saved the image and exact generation prompt in docs/design/busy-life.
- This is a screenshot concept for review; no video or website changes yet. Incoming phone booking remains a connected pilot capability.
- Next: review the frames with Bubs, then create separate footage and motion layers. Keep the confirmation concept for a later section. Public push remains blocked by the earlier approval review.

## Current handoff — confirmation story concept (10 September 2026)

- Hero CTA is complete. Created the next section’s visual concept: “Booked online. Confirmed by AI.” with connected booking, call and outcome illustrations.
- Saved the image and exact prompt in docs/design/confirmation. Existing #turn scroll section is unchanged pending visual approval.
- Requests for appointment changes remain team follow-up; copy notes calling requires setup and minutes. Next: Bubs reviews the concept before implementation. Local save only.

## Current handoff — hero live-demo CTA (10 September 2026)

- Replaced the hero’s “See it in action” button with “Meet your AI receptionist,” opening the approved live demo immediately.
- Hero and busy-section buttons share one modal and restore keyboard focus to the button used. Both paths and typecheck passed; hero button styling retains the existing white treatment.
- Next: generate a visual concept for the following confirmation section before implementation, as requested. Saved locally; no public deployment.

## Current handoff — approved responsive voice modal built (10 September 2026)

- Implemented the approved combined desktop and mobile concepts: “Go ahead. Say hello.”, large fuzzy mascot, mint rays/ripple, decorative animated waveform, separate customer/AI live caption bubbles and compact call controls.
- Ready state has one Let’s talk button; active state shows mute, countdown and End call. The layout stacks on phones, supports scrolling long captions and respects reduced motion. No mock dialogue or prerecorded audio appears in the product.
- Verified a real spoken photography appointment request produces a contextual AI audio reply. Separate mocked-provider visual checks cover ready/active/ended states, captions, mute, keyboard close/focus, 320/390/768/1440px fit and reduced motion. Production build/dev-tool exclusion passed; smallest-phone dock spacing was adjusted and rechecked.
- Existing local live connection and provider safety boundaries remain. Next: Bubs reviews the working modal in #cost. Saved locally; no deployment or public publishing.

## Current handoff — mobile modal image (10 September 2026)

- Created the requested phone portrait version of the combined modal, with vertically stacked mascot, live captions and compact call controls.
- Saved docs/design/voice-modal/mobile-concept.png and mobile-prompt.md. This is an active-call visual concept; sample captions show placement only.
- Next: Bubs reviews mobile before implementation. Working site unchanged; saved locally.

## Current handoff — combined modal image (10 September 2026)

- Generated the requested single combined concept: welcoming headline and large fuzzy mascot with mint rays, alongside live captions and call controls.
- Saved docs/design/voice-modal/combined-concept.png and the exact prompt in combined-prompt.md. The example captions illustrate placement only.
- Next: Bubs reviews this combined image before implementation. No changes to the working site; local save only.

## Current handoff — visual voice modal concepts (10 September 2026)

- Created two image concepts for a simpler, more visual live AI demo: mascot-centered welcome and an active conversation with live captions/control dock.
- Saved both images and exact built-in generation prompts in docs/design/voice-modal. These are design previews; the working live modal is unchanged.
- Recommendation: welcome concept before connecting, conversation concept during the call. Sample captions in the image illustrate placement only; the product remains unscripted.
- Next: Bubs reviews the concepts before implementation. Saved locally; public publishing remains pending the earlier approval review.

## Current handoff — live AI conversation modal (10 September 2026)

- Rebuilt the #cost modal in the approved white/forest/mint direction with the fuzzy mascot. Bubs explicitly rejected scripted audio; all prerecorded players and scripts are removed from this modal. The “Meet your AI receptionist” button opens a real microphone conversation.
- Created isolated OmniDimension practice agent 252341 with generated greetings/replies, Elena voice and English (American). Verified provider configuration has a 90-second duration limit, no booking integrations, files or post-call actions. Existing Ava remains unchanged. Private .env.local holds credentials and the new agent ID; it is ignored and mode 0600.
- Verified a real browser session transcribed a spoken photography-studio/Thursday portrait request and generated a relevant spoken reply. Mute/unmute, socket close, Escape/focus, 320/390/1440px layouts, route security tests and production build/dev-tool exclusion pass. An earlier test used silent input; the final audible test passed.
- Local preview is connected. Public session creation remains disabled until durable abuse/budget controls and public acceptance are complete; no deployment. The local limit is five session attempts per hour per process. Historical audio files are retained but unused.
- Next: Bubs tries “Let’s talk” in the workspace. Refine voice/conversation after feedback, then prepare public activation. Saved locally; public publishing remains blocked by the earlier approval review. Details: docs/browser-voice-demo.md.

## Current handoff — three playable AI voice examples (10 September 2026)

- Completed the busy-day section’s modal with Ainsley, Grady and Brielle voice choices, volume guidance, native playback controls, replay and the sample script. Visitors can compare the same receptionist-side dialogue; switching voices and closing stops playback. Samples do not autoplay.
- Generated three 29–32 second scripted Seed Audio demos through Higgsfield, saved locally in public/audio/voice-*.mp3. The modal labels these as illustrative AI demos, not customer recordings or the guaranteed production voice, and explains that more options can be explored during setup subject to the voice service.
- Verified all three files decode and play, replay, closing/reset, keyboard focus and 320/390/1440px dialog layouts. Production build and dev-tool exclusion pass. Renamed the chapter navigation to “When you’re busy.”
- Next: review voices in #cost, then mock up the later confirmation/follow-up story before changing another section. No real calls or deployment. Local commit only; public publishing remains pending the earlier approval.

## Current handoff — busy section and voice modal in progress (10 September 2026)

- Built the approved white #cost story: “You can’t be in two conversations at once,” new standalone conversation photograph, online booking preview, mascot and incoming-call pilot option.
- Added a native accessible voice-example dialog with volume guidance, audio controls, transcript support, errors, Escape/backdrop closing and focus restoration. Audio pauses/reset on close; no autoplay. Until a real demo asset is connected it honestly shows “preview is being prepared.”
- Bubs authorized a new clearly labeled scripted AI voice demo. Existing sample-call.wav is synthetic test tones, unsuitable for marketing. Magnific generation is unavailable on the account tier; Higgsfield voice selection is the next step before generating and wiring audio.
- Layout/keyboard checks and production build are being verified. Next: complete audio generation, connect transcript and test playback. No deployment; local work only, public publishing remains pending prior approval.

## Current handoff — Booked accent detail (10 September 2026)

- Added the three mint excitement lines beside the inline Booked badge to match the approved mockup, with reserved spacing before the following text.
- Decorative SVG inherits the badge’s accessibility hiding and scales with the heading. Existing section content stays in place.
- Next: continue visual section review. Local save only; public publishing remains pending the earlier approval.

## Current handoff — overview copy trim (10 September 2026)

- Removed “For businesses built around appointments.” from #benefits and its unused styling at Bubs’s request.
- The approved headline, mascot and illustrated benefits stay in place.
- Next: continue section review. Saved locally; public publishing remains pending the earlier approval.

## Current handoff — illustrated overview benefits (10 September 2026)

- Built the approved revised #benefits mockup: replaced the salon photograph with an inline Booked detail and added the line “For businesses built around appointments.”
- Replaced the small text-only benefits with three responsive product illustrations and larger headlines: booking times, AI/team call routing with the approved chat-bubble mascot, and appointment/call/spending activity. Illustrations are noninteractive HTML/CSS/SVG with decorative markup hidden from screen readers; the actual Features link remains accessible.
- Preserved forest/mint/white styling, existing overview copy and clear incoming-call pilot labeling. Other sections remain unchanged.
- Verified 320/390/1440px layouts, mascot loading, existing video/card/rail scrolling, reduced motion, and production build/dev-tool exclusion. Next: review #benefits before moving to another section. Local save only; public publishing still awaits the earlier approval.

## Current handoff — approved overview section and mascot (10 September 2026)

- Replaced only homepage #benefits with the approved spacious white editorial overview: large forest-green statement, inline fuzzy mint chat-bubble mascot and existing service photograph, three supporting benefits and Features link.
- Copy now says customer bookings and covers phone conversations, appointment management, call choices and spending controls. Incoming booking/answering schedules retain clear pilot status. Bubs selected the closed-eye fuzzy speech bubble as the working mascot; the standalone asset is public/marketing/receptionist-mascot.png.
- Verified desktop/mobile fit, image loading, surrounding V1 video/card/rail interactions, reduced motion and production build/dev-tool exclusion. Kept the original hero and other sections; further sections require visual mockup review first.
- Next: review #benefits in the workspace. Saved locally; public publishing remains pending the prior approval, with no deployment.

## Current handoff — forest and mint marketing identity (10 September 2026)

- Applied the approved reference palette to the active homepage and Features/Coming Soon: white canvas, forest-green text/buttons, mint accents and deep-green contrast chapters. Existing V1 scroll sequence, coastal hero, copy and feature-status labels are preserved.
- Added self-hosted Open Runde for marketing interface/body text and Apfel Grotezk for headings, with original OFL licenses and source credits in public/fonts/README.md. Other product/vertical themes and design studies remain separate.
- Verified both fonts actually load, pure-white backgrounds, and 320/390/1440px layouts on / and /features. Existing video scrubbing, card stacking, horizontal scrolling, feature controls and reduced-motion checks pass. Production build and dev-tool exclusion pass; the workspace homepage is refreshed.
- Next: review this typography/palette foundation before adapting more contextual brand elements or a mascot. No mascot, new imagery, feature claims or deployment added. Public push remains pending the earlier publication approval.

## Current handoff — original V1 scrolling homepage restored (10 September 2026)

- Bubs rejected the simplified homepage layout. Restored the complete original V1 page structure from c3a9ef8 (d05aece's parent): flowing chapters, confirmation video scrubbing, tabbed parallax feature stage, pinned dashboard card stack, horizontal industry rail, call section and closing chapter.
- The opening now uses the approved coastal-owner photograph and current “Your AI receptionist. Your day back.” message, with V1's entrance animation. White canvas/panels from the preceding change stay; the page-wide grain was omitted to keep white clean. Original chapter art, media and dark contrast sections remain. Chapter labels adapt over the photograph, and feature tabs form two columns on narrow phones.
- Restored the old feature stage as ScrollingFeatures in its own file, preserving the dedicated light Features page and Coming Soon voting/review system. Kept current shared pricing and corrected unsupported old timing, automated rescheduling, inbox and example-metric claims. Navbar and shared anchor links resolve to the restored sections.
- Verified real video time changes with scroll, sticky stages, changing card transforms, horizontal rail movement, feature mouse/keyboard controls, all referenced media, 320/390/1440px layouts without horizontal overflow, reduced-motion posters and the visible hero entrance. Features and roadmap still respond successfully; production build and development-tool exclusion pass.
- Next: review the restored V1 at /. Work is committed locally with no deployment. Public GitHub publishing still awaits the earlier approval after automatic review rejected the public push; live roadmap migration also remains pending.

## Current handoff — white marketing backgrounds (10 September 2026)

- Replaced the beige homepage canvas and the warm Features/Coming Soon backgrounds with pure white, including panels, vote controls and the suggestion dialog. Features pilot badges, focus rings and hover fills now use neutral colours; roadmap errors retain a pale red treatment.
- Verified the running workspace renders rgb(255, 255, 255) on both page backgrounds, the Features plan section, Coming Soon, its dialog and vote controls. Homepage text and shadows use neutral tones. Existing photography and dark contrast sections are preserved.
- Next: continue marketing review on localhost. Feedback remains locally persistent; the live roadmap migration and deployment remain pending. This styling update is saved locally; public GitHub publishing still awaits the earlier approval after automatic review rejected the public push.

## Current handoff — Coming Soon roadmap and feature voting (10 September 2026)

- Added Coming Soon at the very bottom of the light /features page, linked in its navigation. The 13 customer-facing roadmap items cover phone booking, calendar connections, team availability, owner editing, service durations, multiple locations/lines, reminders, reengagement, appointment changes, guided activation, voicemail and referrals. Pilot / Planned / Exploring labels avoid release-date promises; existing features remain in the main stories.
- Visitors can save/remove votes, sort by popularity and suggest features. Browser identity uses a random HttpOnly cookie and hashed database identifier; votes are unique per browser/feature, not verified people. Suggestions are private until review, with duplicate prevention and three submissions per visitor per 24 hours. Errors retain readable content and provide recovery without inventing counts.
- Built the signed-in staff review queue at /admin/roadmap, linked as Ideas in the staff header and Feature suggestions in the development page index. Approval opens a community item as Exploring; hiding preserves vote history. Review requests are guarded against races and uncertain saves, with keyboard focus restored after decisions.
- Feedback persists in ignored .local/roadmap.sqlite during development/test. Production uses Supabase only: migration supabase/migrations/20260910_feature_roadmap.sql and service-role-only functions are prepared and verified against an isolated PostgreSQL fixture. The migration has not been applied to live Supabase and no deployment occurred. See docs/feature-roadmap.md for release steps and sources.
- Passed 14 targeted tests, production build/dev-tool exclusion, real-browser voting and suggestion/review flows, error recovery, keyboard review, long-title wrapping, and 320/390/1440px light layouts. Fixed Next's internal localhost versus browser Host origin mismatch. Restarted the session-managed localhost service to load the page index, verified a vote survived the restart, and removed temporary QA feedback. Next: review /features#coming-soon; apply the migration before any live release. Work is saved locally; public GitHub push remains pending the earlier publication approval after automatic review rejected the public push.

## Current handoff — light Features page (10 September 2026)

- Changed /features to a warm light palette with near-black headings, dark primary buttons, light surfaces and readable muted text. Layout, copy and existing campaign images are preserved; V2 keeps its own approved visual direction.
- Checked all scoped colour pairs and verified the browser renders the light background and dark headline. The page explicitly uses a light colour scheme regardless of the global theme.
- In progress: Bubs requested a Coming Soon roadmap at the bottom of Features, with durable upvotes and new-feature suggestions. Recovering the actual planned capabilities and building saved voting plus a staff suggestion-review queue.
- Local preview now runs under the macOS session service from the previous handoff. Public GitHub publishing remains pending the earlier approval; no deployment occurred.

## Current handoff — workspace server recovery (10 September 2026)

- The detached local launcher had exited again: no process and no listener remained on port 3101. The browser also retained a cached connection-error document. Restored the site and verified V2’s current headline, its loaded 1254px hero image, Features and the development page index.
- Added macOS session-managed preview commands: npm run dev:workspace, dev:workspace:status and dev:workspace:stop. launchd keeps the existing dev launcher independent of temporary terminals and restarts exits; Next stays in the same job process group so cleanup covers its workers. Normal npm run dev remains available.
- The service binds 127.0.0.1:3101, refuses a conflicting listener, and stores its definition/logs in ignored .local/preview. It is not installed as a login startup item: rerun the start command after logout/reboot. Current service label local.ai-receptionist.preview.1841425c22; use status rather than relying on an old PID.
- Plist syntax, JS syntax, four preview tests, successful startup after the launching command exited, repeated-start reuse and browser rendering pass. An in-app error tab could not reload its cached data document; a fresh verified V2 tab was opened for review.
- Next: keep the preview available for marketing review. Bubs now requests a light Features page; that visual update is being handled separately. No production deployment or phone changes. Local commit only; public GitHub publishing remains pending the earlier approval after automatic review rejected the public push.

## Current handoff — clear homepage and dedicated Features page (10 September 2026)

- Replaced the unclear callback positioning with “Your AI receptionist. Your day back.” on the actual homepage and preferred local V2 preview. The supporting copy explains online booking, optional confirmation calls and owner follow-up. Shortened both home stories and moved the detailed capability/benefit explanations into the new /features page.
- Features now covers online booking, confirmation calls, incoming caller choices, scheduled answering, owner records and spending controls, with setup FAQs and shared plan values. Incoming booking and coverage remain clearly labeled pilots awaiting a tested connection. Removed unsupported callback timing, automatic rescheduling, no-show metrics and unconditional email/recording promises; aligned the website’s demo-call script and shared plan descriptions.
- Reused the exact approved coastal hero and three existing Higgsfield campaign photos. Added visible Features links to the homepage, V2, demo navigation and footers, plus Features & benefits under Marketing in the local page index and dev bar. Updated docs/marketing-story.md; existing V2 visual studies and original campaign assets remain available.
- Verified production build and development-tool exclusion, nine pricing/preview tests, all four marketing surfaces at 390px and 320px without horizontal overflow, feature images/anchors/FAQ, page-index navigation, pricing and signup destination. Signup reaches owner sign-in; local authentication still needs configuration. The local launcher was restarted to load the catalogue, current PID 28894, with private state/logs in .local/preview.
- Next: review the revised story at / and /__dev/design/luxury-v2 and the detailed /features page before video production. No live deployment, new media generation, real calls or payments occurred. Work is committed locally; public GitHub push still awaits the earlier publication approval after automatic review rejected publishing to the public repository.

## Current handoff — full Higgsfield campaign image set (10 September 2026)

- Bubs explicitly authorized all still images, superseding the previous media deferral. Generated ten images through Higgsfield: focused service, busy reception, away from desk, working-day break, vacation, closing time, customer call, online booking, owner review and optional phone evolution. Preserved the exact approved coastal hero and current V2 page.
- Cinema Studio Image 2.5 produced the first service image and phone study at 4096 square. Its eight reference-input jobs failed; GPT Image 2 high quality through Higgsfield completed the other eight using the first scene as a reference. Their actual size is 2880 square despite the requested 4k setting. Untouched PNGs, exact requests/results and checksums are in design/hero-comparison/campaign-v4; 2048-square WebP display copies total about 3 MB.
- Built the local comparison gallery at /__dev/design/campaign-v4, with all ten full-size links, the existing hero shown separately, and each scene paired with its intended product proof. Added Marketing campaign images under Marketing Site in the page index and dev bar. Incoming booking remains a labeled pilot preview; generated people/business are fictional.
- Verified all ten images visually, all original/preview checksums, 23 local endpoints, four development-preview tests, desktop rendering, page-index navigation and an isolated 390px browser check with all ten images loaded and no horizontal overflow. In-app viewport resizing did not apply, so responsive verification used an isolated browser. Restarted the independent local launcher to load the new gallery route; current PID 15541, private runtime/log paths remain .local/preview/development.json and development.log.
- Next: Bubs reviews the full image set, then select final placements and deliberate wide/mobile compositions before producing video. No marketing page replacement, live deployment or phone changes. Work is saved locally; public GitHub publishing remains pending the earlier requested approval.

## Current handoff — stable localhost address (9 September 2026)

- Saved V2 links on port 3101 were down while a separate Next process for this repo had started on the default port 3000. Stopped that confirmed project process and changed scripts/dev.mjs to default to 127.0.0.1:3101; explicit port and hostname overrides remain available.
- Restarted the development launcher independently of the temporary terminal (PID 95071, parent PID 1). Ignored runtime details and logs live in .local/preview/development.json and development.log. To stop it, verify the recorded PID still belongs to this launcher, then send SIGTERM so it cleans up Next and the preview service. This is not automatic crash recovery or login startup.
- Verified HTTP 200 for V2, its approved image, page index/data, journey, dev toolbar and original homepage. A fresh in-app browser tab renders V2 and the dev navigation; earlier tabs had cached network-error documents. JavaScript syntax, the four development-preview tests and diff checks pass.
- Next: continue reviewing V2 copy and story before new media. No production deployment or phone changes occurred. Work is saved locally; public GitHub publishing remains pending the previously requested approval.

## Current handoff — Marketing V2 copy and story (9 September 2026)

- Bubs deferred new photos and video. Rebuilt the local V2 reading flow around the owner's interrupted day, two distinct booking paths, caller/staff/AI choices, breaks and time off, call records, usage controls, setup and clear demo/signup actions. The exact approved coastal image remains the only photograph on the page.
- Preserved the previous V2 page byte-for-byte at design/hero-comparison/luxury-v2/visual-studies.html, linked in the footer. Original marketing remains unchanged; V2 stays at /__dev/design/luxury-v2 under Marketing in the page index. New narrative notes are in docs/marketing-story.md; media docs explicitly defer production.
- Four development-preview tests and source/anchor checks pass. Desktop and 390px browser checks confirm the story, loaded image, no horizontal overflow, FAQ and setup destination. The setup link reaches /account/login, where local sign-in is currently disabled pending configuration; signup completion is not claimed. Incoming phone booking remains a labeled pilot preview awaiting connection acceptance.
- Next: review and refine the headline sequence and story before returning to images/video. Main preview remains port 3101, session 10741. No generation, deployment or phone changes occurred. Work is saved locally; public GitHub publishing still awaits the previously requested approval.

## Current handoff — localhost restored (9 September 2026)

- The local 3101 Next process was orphaned, using a CPU core and accepting connections without responding; the development-preview launcher had stopped. Stopped only that project's stale process group and restarted npm run dev on 127.0.0.1:3101 in attached PTY session 10741. No application/source repair was needed or confirmed; this was a local process recovery.
- Verified HTTP 200 for V2, the approved hero image, page index/data, journey, toolbar and original homepage. Browser verification confirms the full 19-page index and its Marketing site · V2 link; the approved opening and dev bar render. An old tab was stuck on a cached network-error document, so opened and retained a fresh working V2 tab (22).
- Continue the feature/problem storyboard and first human keyframe review in docs/marketing-media-brief.md. The old separate mock preview on 3102 and its mock service are no longer running; restart those isolated fixtures only when needed for owner-screen review. No live deployment or phone changes occurred. Public GitHub publishing remains pending the earlier requested approval.

## Current handoff — showing the new features through owner problems (9 September 2026)

- Expanded docs/marketing-media-brief.md with eight problem/action/result treatments for incoming booking, caller choice, temporary coverage, weekly/vacation schedules, independent confirmations, call records, usage/spend controls and provider onboarding. Verified the descriptions against the current UI, phone settings and operating notes.
- Added a five-step scroll storyboard: stylist with client → saved answering choice → agreed slot and saved booking → owner record → uninterrupted service. Controls appear alongside their human benefit; usage belongs beside pricing and setup beside signup. Preserve the approved V2 opening and separate incoming booking from online/outgoing confirmation.
- Next: review this direction and the first focused-client/busy-reception keyframes before motion production. This block updates planning only; no media, app page, live connection or deployment changed. Incoming phone demonstrations still need a real adapter/pilot test before live claims; use dashboard notices until email is configured. Work is saved locally; public GitHub publishing remains pending the previously requested approval.

## Current handoff — benefit-led photos and videos (9 September 2026)

- Recovered Bubs's existing scenario list and inspected Starlink Roam's actual hero and travel/camping/boating imagery. The media story must show what owners gain: attention with a client, help during busy periods, freedom from the desk, breaks, vacation and after-hours coverage. V2 currently has one human opening followed by text-only benefits and large technical studies; those studies should no longer lead the campaign.
- Wrote docs/marketing-media-brief.md with six concrete photo/video treatments, headlines, adjacent booking evidence, page order, restrained motion, mobile/reduced-motion requirements and staged production. Keep the exact approved V2 coastal image (05-time-back.png). Corrected stale hero-direction notes that still called all V2 rejected and incorrectly positioned V3 as the current selection.
- Next: review the treatments, then produce focused-client and busy-reception keyframes through Higgsfield before the full set and motion test. The earlier request to review before video generation remains in effect. No media generation, purchases, V2 page replacement or live deployment occurred. The product explanation must distinguish online/outgoing evidence from incoming phone booking, whose actual connection and pilot acceptance are still pending. Notes are saved locally; public GitHub publishing still awaits the previously requested approval.

## Current handoff — page-index sections (9 September 2026)

- Organized the page index into Application, Marketing Site, Design Studies and Internal Tools, in that order. Bubs requested V2 under Marketing: it is now labeled “Marketing site · V2” there and in the dev bar’s Marketing group. All 19 pages remain: 12 application pages, 3 marketing pages, 2 design studies and 2 internal tools. V2 still uses its existing local-only preview URL. User journey stays under Internal Tools; the site access gate also appears there when the site is locked.
- The four sections sit alongside each other on desktop, become two columns on smaller screens and stack on mobile. Search now recognizes section names; sorting, page links, dates and access labels remain available.
- Verified V2 appears under Marketing Site with the same preview link and Local only label. The updated catalogue checks pass for the main app and tenant previews. Development was restarted on 3101 (session 14749) to load the catalogue change.
- Verified section counts, marketing and journey search, clearing search, date sorting and 390px mobile width in the browser. Existing development-preview checks pass (4 tests), as do JavaScript syntax and diff checks. This is a local directory update; product pages and live deployment are unchanged. Next product work remains phone connection/pilot acceptance and the signup follow-ups recorded below. Saved locally; public GitHub push is still awaiting the previously requested publication approval.

## Current handoff — visual user journey (9 September 2026)

- Built a clickable visual guide at http://127.0.0.1:3101/__dev/journey, with seven owner stages and separate online/phone customer journeys. The initial view highlights the existing setup form at step 3: after email sign-in and before Stripe checkout. Each stage includes a screen sketch, actions and the next transition; sketches use illustrative data and do not submit forms.
- Added “User journey” to the dev bar's Pages menu and page directory. The guide and its script are served only by the loopback development preview, never as public application assets. Original marketing, V2 imagery and real signup behavior are unchanged. Development was restarted on 3101 (session 77364); the mock application preview remains on 3102.
- Checked every owner/online/phone stage, desktop and 390px mobile layout, deep-link state, and the directory entry. Four development-preview tests pass, JavaScript syntax and diff checks pass, and the production exclusion check passes against the current build.
- Page-index follow-up: confirmed “User journey” under Internal tools and fixed fragment navigation resolving against the preview's base URL. Step selection now preserves /__dev/journey, including after refresh. Verified by opening the index link, changing steps and reloading; no new catalogue entry was needed.
- Journey review confirmed two follow-ups: V2 still has no signup CTA, and a logged-out visitor's selected pricing plan is lost through email sign-in and defaults to Busy on the setup form. Both are documented in the guide; neither was changed in this visualization task. Phone connection, calendar compatibility, email delivery and pilot acceptance remain pending as below. Work is committed locally; public GitHub push still awaits the previously requested publication approval after automatic review blocked it.

## Current handoff — incoming phone booking and provider onboarding (9 September 2026)

- Built the approved owner controls: independent outgoing confirmations and incoming routing, menu/staff/AI choices, weekly hours, holidays, vacation dates, temporary overrides, shared usage limits and incoming call history. Provider, phone-service type/plan and appointment software are now collected during onboarding, including “Not sure yet” and specific Comcast/T-Mobile guidance.
- Added authenticated incoming routing and booking endpoints, short-lived call sessions, atomic slot booking, separate incoming call records, shared inbound/outbound minute reservations, completion reports and owner notification jobs. Phone bookings do not queue duplicate confirmation calls. Owners cannot activate connections or change protected phone credentials. The provider-independent gateway still requires an actual carrier/audio adapter; see docs/inbound-phone.md.
- Pilot intake: Tanaz in Grand Rapids likely uses Comcast, but its precise phone product and booking software are unconfirmed. Bubs's personal pilot is T-Mobile. Exact numbers are saved privately in ignored .local/phone-pilots.json; these are intake records, not connected customer accounts. No real calls, purchases, forwarding changes, production migrations or deployment occurred in this block. Preserve the preferred V2 image and original site.
- Verified 44 unit tests, production build and development-tool exclusion, five SQL suites, eight mixed incoming/outgoing concurrency rounds and customer-deletion checks. Browser/API checks cover authenticated saving, consecutive saves with JSONB key reordering, reloads, stale-write conflicts, protected fields, holidays/temporary settings, clear not-connected status, provider guidance and mobile layouts. Temporary PostgreSQL was stopped.
- Local mock-data review is running at http://localhost:3102/start and /account (Sunday Studio fixture, not a real pilot). Mock service: node tests/mock-services.mjs on 55440; production preview on 3102 uses that local Supabase fixture, VOICE_PROVIDER=demo and explicitly empty Stripe/voice/email API keys. Current sessions: mock 68773, preview 1064. Main development/marketing preview remains http://127.0.0.1:3101/__dev/design/luxury-v2. Rebuild/restart the production preview after source changes.
- Next: verify the voice adapter's trusted call/session handoff, provision a separate test answering line, confirm Tanaz's appointment-book compatibility, measure all incoming/transfer costs, configure email delivery, then test caller-to-booking-to-dashboard plus fallback/rollback before forwarding a real number. Work is committed locally; GitHub push remains blocked by the earlier automatic review of the public repository, pending the already-requested publication approval.

## Current handoff — preferred V2 marketing direction (9 September 2026)

- Bubs now likes the opening image and UI in the V2 marketing preview, specifically its SpaceX/Starlink feel. Treat this as the preferred direction; this latest feedback supersedes the earlier rejection for this opening image and layout, without approving all four technical studies.
- Verified the visible image in the selected browser tab: design/hero-comparison/luxury-v2/assets/05-time-back.png, the woman having coffee on a coastal terrace. Preserve this exact image for the current direction. The separate Higgsfield V3 photograph was not the image on screen and remains an alternative.
- Carry forward the large photography, dark framing, restrained white typography, generous spacing and minimal navigation. Keep the owner benefit immediately clear: room to focus on customers, take a break or step away while bookings continue.
- Next: develop the scroll story around this opening, then show a customer booking online, the outbound AI confirmation call, and the owner's call record. Keep the story tied to the real product; requests needing a person still require follow-up.
- This block records design feedback only; no imagery, video, application or live deployment changed. Keep the original site intact. GitHub push remains blocked by the earlier automatic review of the public repository, pending the previously requested publication approval.

## Current handoff — local development navigation (9 September 2026)

- Added Bubs's burgundy DEV toolbar with a searchable Pages dropdown, current-page label, local path shortcut and Command/Ctrl K. The direct Page index link opens a full directory inspired by the requested localhost:8090/pages reference: internal tools, application/design columns, search, recency filters and date sorting. Both menus share the same 18-entry catalogue.
- Run `npm run dev` to launch Next plus a loopback-only preview server. Current workspace preview is http://127.0.0.1:3101/__dev/pages; comparison is `/__dev/design/luxury-v2`, and the original site is still `/`. Source dates use real Git history plus uncommitted file edits and refresh when the index reloads. Original design files and the live Vercel site were not changed.
- Production resolves the toolbar import to an empty server component; preview rewrites exist only during development. Every production build now fails if generated assets or route manifests include the toolbar. App sign-in gates stay intact; only the local static development namespace bypasses them.
- Verified desktop/mobile navigation and directory, search, date sorting, empty filters, arrow keys, Escape, path validation, mouse navigation and Next client navigation. The 20 tests and production build pass; local production HTML has no toolbar and all directory/tool/metadata URLs return 404. Production verification server was stopped; development remains running for review.
- Next: review the Higgsfield human image and settle the hero direction before producing motion. This work is saved in a local commit; GitHub push remains blocked by the earlier automatic review of the public repository, pending the previously requested publication approval.

## Current handoff — Higgsfield human photograph (9 September 2026)

- Bubs rejected all technical imagery from V2. Only the human time-back idea was promising, but its image still looked artificial. Explicit request: use Higgsfield and “Canto 2.5” for realism. Keep the benefit of time with customers, breaks and time off; no approved final hero yet.
- The full live Higgsfield catalogue has no Canto model. It lists Cinema Studio Image 2.5; asked for clarification, then proceeded with that stated interpretation. This was not a confirmed alias. Used the Higgsfield connector with cinematic_studio_2_5, 4k, square, one candid coastal-café image. Actual source is 4096 × 4096.
- A requested border-only generative edit failed. Removed its decorative black film border by cropping 40 pixels per side with ImageMagick in Higgsfield's cloud sandbox; no resampling. Final is 4016 × 4016, with untouched source retained. Visual review found no obvious anatomy blocker; realism and style still await Bubs's judgment.
- Saved both images, exact requests, provider results and checksums in design/hero-comparison/higgsfield-v3. Next: review this single human image before connecting further scenes or producing motion. No live site, application or video changed. Rejected V1/V2 files remain history, not approved assets.
- Product promise remains online booking, outbound AI confirmation calls and owner call records, with human follow-up for requests. Public GitHub publishing remains blocked by the earlier automatic review of the public destination and awaits the previously requested explicit publication approval.

## Current handoff — customer pricing and Stripe live preparation (8 September 2026)

- Marketing, signup and owner dashboard now show setup, first payment and recurring costs clearly, with estimated call counts and conditional test-payment notices. Pricing remains $199/$399/$749 monthly, $299 pilot/$499 standard setup and 49¢ extra started minutes.
- Added a shared test/live setup command and staff billing connection check for account, database, all prices, usage meter, webhook and portal. New database binding rejects mixed environments and preserves financial history; existing-customer updates remain available if a live account's activation flags change.
- Applied the Stripe environment migration to production Supabase and saved STRIPE_MODE=test plus the sandbox account ID on Vercel. No live credentials, activation or real payment. Existing sandbox catalogue, meter, webhook settings and portal passed read-only Stripe verification; existing Vercel signing secret is retained.
- Verification: 16 unit tests, four SQL suites and production build pass. Browser fixtures verify owner payment totals, reactive plan changes and removal of the test notice in live mode. Deployed 7d48e24 to the existing locked Vercel site; all four production billing-connection checks pass, and public pricing shows correct pilot/standard first-payment totals for every plan. Temporary preview servers, test database and local credential file were cleaned up.
- Live transition is documented in docs/stripe-live.md, including a protected credential manifest, clean database binding, auth callback/SMTP settings and one complete configuration deployment. Still required before real customer launch: live Stripe activation/credentials, email delivery, authenticated purchase/voice acceptance and period-close reconciliation. GitHub push remains awaiting explicit approval after automatic review rejected publishing to the existing public DesignTitan/AI-Receptionist repository.

## Current handoff — pilot setup offer (8 September 2026)

- Bubs approved lowering setup: $299 for 10 pilot customers, then $499 standard setup; monthly $199/$399/$749 and 49¢ extra minutes are unchanged. Same fixed scope: one business, booking configuration, dedicated phone setup and one test session; custom work quoted separately.
- Added atomic pilot reservations, immutable per-checkout setup fee/price, confirmed-expiry release and paid-invoice validation. Paid places stay consumed after cancellation/refund/deletion. Staff can see reserved/redeemed/available places; all storefront/signup/dashboard/demo script copy is aligned.
- New Stripe sandbox setup prices are created and connected to Vercel. Production Supabase pilot migration is installed; all 10 places are available. Legacy issued $1,000 checkouts retain their original price.
- Verification: 11 unit checks, all three SQL suites, simultaneous 11-customer allocation (10 pilot, 1 standard), and build pass. All six Stripe setup/plan checkout totals pass; actual paid sandbox setup invoices pass app validation; test subscriptions cancelled. Deployed eea8a34 to the existing locked site; live pricing and Stripe checkout copy verified.
- Target direct onboarding cost is at most $150; $299 leaves about $137.94 after that cost and assumed fees, before shared overhead. Next: finish email setup and authenticated customer/voice acceptance before live billing. Stripe remains test mode. GitHub push is awaiting explicit approval after automatic review rejected publishing to the existing public DesignTitan/AI-Receptionist repository; work is committed locally and deployed.

## Current handoff — minute pricing and Stripe sandbox (8 September 2026)

- Built minutes-v2: $199/300 minutes, $399/750, $749/1,500; $1,000 setup; $0.49 extra started minute. Shared catalogue drives storefront, signup, checkout and staff limits. Cost model targets 51–52% contribution at full use, before shared overhead and tax.
- Created all fixed/metered sandbox prices, setup, meter, webhook and restricted billing portal in acct_1UDNPDPicyLxgU34. Bubs approved test credentials; saved them as sensitive Vercel Production variables. No live Stripe activation or real charges.
- Installed the usage migration in production Supabase. Billing-period snapshots, atomic five-minute reservations, duplicate-safe settlement, default $0 recurring extra-spend cap, customer notices, forecasts and staff usage review are implemented.
- Unit tests (10), database suites and build pass. Stripe invoice previews independently show exactly $49 for 100 extra minutes on all tiers. Deployed 5751fbf to the existing locked production URL; live staff pricing/usage dashboard renders and signed webhook acceptance (200)/unsigned rejection (400) pass.
- Stripe API checkouts verified $1,199/$1,399/$1,749 initially and $248/$448/$798 renewal with 100 extra minutes; disposable sessions expired and subscriptions cancelled. Next: complete an authenticated owner purchase/voice acceptance, connect Resend and custom SMTP, verify a dedicated customer voice line, and review period-close reconciliation before live billing. Dashboard notices work independently; email delivery is not configured. Older call-count pricing below is historical and superseded.

## Stripe onboarding — 2026-09-08

- Bubs created the separate AI Receptionist Stripe account (acct_1UDNP6PadPgqGiRq); completed its introductory business setup with the existing Vercel site and the appointment-confirmation software description.
- Selected online checkout, subscriptions and invoicing; automatic tax was left off for testing and standard individual products selected instead of Managed Payments.
- Opened the new AI Receptionist sandbox (acct_1UDNPDPicyLxgU34). No live activation, payments or bank details were submitted.
- Naming decision: keep AI Receptionist and the existing Vercel address during product testing; postpone buying a domain.
- Next: create the three monthly test prices and setup fee, connect sandbox credentials/webhook to the app, and verify checkout. Email/SMTP and complete live acceptance remain outstanding.

## Approved launch settings — 2026-09-08

- Bubs explicitly approved the Supabase production sign-in callback and Vercel Production CRON_SECRET.
- Saved the generated secret as a sensitive Vercel variable without committing or displaying its value.
- Enabled the daily /api/jobs recovery schedule at 09:00 UTC; ordinary booking jobs also run immediately after submission.
- Verified the exact callback in Supabase and deployed f82e18e successfully. Live queue check: 401 without a secret, 200 with the secret, zero queued jobs. Stripe, email/SMTP and complete live customer acceptance testing remain next.

## Current handoff — customer platform (2026-09-08)

- Deployed e4a9251 to the existing locked Vercel site; production /admin/customers loads the real Supabase queue. Built owner email-link accounts, business/plan intake, Stripe Checkout and billing portal, owner booking/call dashboard, branded customer booking pages, and staff setup/recovery queue. Pricing stays $149/$299/$599 monthly plus $1,000 setup.
- Installed the additive customer-platform migration in production Supabase. Owner data is scoped to its account; database rules prevent overlapping bookings and duplicate event jobs. Existing demos and voice metadata remain unchanged.
- Added dedicated-agent/number provisioning with spending limits, durable email/call jobs, signed Stripe callbacks, scoped voice reports, and backup/deletion tools. Activation stays concierge: review and test each customer's line first.
- Verification: unit tests and disposable PostgreSQL tests pass, including account isolation, overlap rejection, checkout reuse, callback deduplication and cancellation protection. Owner/signup browser checks passed with explicitly local fixtures; live payments, customer calls and email delivery are not yet verified.
- External setup remains: Stripe, Resend/custom SMTP and sending domain, Bubs's lead inbox, customer domain and reviewed policies. Site stays locked; no number purchase or external message was sent. Overage is an estimate with manual invoicing.
- Previously, approval review blocked two settings: adding the production /account/callback URL to Supabase's redirect allowlist and saving CRON_SECRET to Vercel Production. Scheduled recovery stays disabled. Next: approve those settings, connect integrations and run a complete test customer. See docs/customer-platform.md; older notes below are historical.

## Just done — production storage connected (2026-09-07)

- Added the existing Supabase `service_role` key as sensitive `SUPABASE_SERVICE_ROLE_KEY` on Vercel Production with the owner's explicit approval; no secret is stored in the repo.
- Redeployed successfully: `ai-receptionist-52weqrm2v-bubs-1063s-projects.vercel.app`, aliased to the existing production domain. Production build and TypeScript checks passed; application source unchanged (59594fe).
- Verified through the live browser: salon booking `SS-95YG2Q` reached confirmation, survived a full reload, and appeared under Solstice Salon & Spa in admin. A direct database read independently confirmed the saved appointment.
- The fictional `Production Persistence Test` used a reserved test phone number and no email; its call failed, so this was a storage test, not a successful real-call test. Cancelled the test booking after verification to free the slot; retained the labelled record as evidence.
- Nothing remains in progress for storage. Next: Resend + `OWNER_EMAIL`, dedicated voice number, webhook-secret rotation, and a non-default admin password before public access. The site remains locked.

## Just done (2026-09-03 → 07)

- **Navigation.** A floating nav at the top of the homepage, `src/components/marketing/site-nav.tsx`,
  iterated to the owner's references: liquid-glass pill of icon tabs (home dot, Features, Proof,
  Industries, Pricing) where only the current chapter is a raised white tab carrying its label;
  a round accent call disc beside it; a slightly darker plate behind both that hangs from the
  top edge (square above, 44px corners below). The disc drops a frosted-glass dialog holding the
  real ask-for-a-call form (`TryCallPlate` in `compact` mode: name, number, business, Turnstile),
  flat fields a shade darker than the glass; same route and honest no-line fallback as chapter
  six, and the nav copy sets no harness attributes. Escape / outside click closes. Phones: five
  icons + disc. Backdrop-filter does survive the minifier (the nav proves it).
- **Display face is Instrument Sans**, 500, via next/font (`--font-display-marketing`); the
  owner turned down the serif. Display heading → subtext is 24px everywhere, 32px in the hero
  (the industries lead and the turn chapter had zero).
- **Core features tab stage has the same parallax.** 06-bg.jpg (sharp stage scene) behind
  06-{book,after,noshow,voice}-p.webp (frosted panel, alpha WebP); the section is a flow act so
  both ride its --sc-p (panel 90px, ground 40px). All alpha panels are WebP now (cwebp, q86).
- **Proof deck images now have parallax inside them.** Each card's image is a sharp desert
  (04-bg.jpg, shared) behind a frosted glass panel rendered as an alpha PNG with its blur baked
  (04-*-p.webp). Both ride the act's --sc-p across the whole scroll: panel climbs 100px, ground
  sinks 36px; 64/24 under 1024px; off under reduced motion. Pipeline: `ref.py … bg|panel` +
  `render.mjs … png` (clips the scene to the panel, encodes WebP). Geometry, fade, shadow untouched.
- **Pricing is three call-volume plans, and the economics are measured.** Front desk $149/200
  calls, Busy desk $299/600 (featured, overlaid on the outer two), Full desk $599/1,500, $1,000
  setup flat, 30c per extra call. Two real calls put voice AI at $0.115/min (prorated) and
  telephony at $0.03/min (rounded up): a 1.5-minute call costs ~23c and the plans keep
  61% / 54% / 46% gross at full use. Full model: docs/pricing-economics.md and the
  "Receptionist Unit Economics" artifact
  (https://claude.ai/code/artifact/2d6057be-84b8-4ae8-8239-cc29a19859e3). OmniDimension seat:
  stay on the $36 business plan to ~5 customers, business Growth ($200) to ~15, agency Scale
  Partner past ~10,000 talk minutes a month. Verify on the billing page that the models bill on
  top of the plan rate. Ava's demo script now quotes these plans. Decision: price on the business seat; a monthly
  scheduled task (omnidimension-seat-check, 1st at 9am) reports when to move to Growth or the
  agency plan. Agent audit applied: 2-word interruption threshold, noise reduction, static
  end-call line cleared (double goodbye fixed). Owner: buy a number, Early deployers plan,
  request voicemail detection. Platform comparison in docs/voice-platforms.md (stay on OmniDimension; Retell at 15–20
  customers). Launch date 1 Oct 2026; the full four-week plan with build, marketing and sales lanes, weekly scorecard and
  triggers in docs/ROADMAP.md and the "Receptionist Launch Roadmap" artifact
  (https://claude.ai/code/artifact/0a4ee2ad-e2b2-4998-9a5d-796e3097cd1a).
- **The phone line works end to end.** Two real calls from the live homepage to the owner's
  phone (OmniDimension call logs 7353968 and 7353970, from the platform's default number
  +1 337 379 9906): Ava opened with the visitor's name and the recording notice, pitched,
  quoted the then-current $199 / $1,000 / 500 calls correctly (now the three plans), declined to book a 3 PM slot the right way; the
  post-call report reached `/api/webhooks/voice` and matched (`metadata.call_log_id`), the
  page filled in, the lead email fired. Fixed from the evidence: a demo call is now
  "confirmed" when a person spoke (Ava's own "reschedules and cancellations" used to trip the
  appointment keyword heuristic into "cancelled"); OmniDimension's `LLM:`/`User:` labels are
  shown as Ava/You.
- **Textured dark ground** on chapters 4 and 5 (`.textured-section`, assets in
  `public/images/textures/`): baked-in photo falloff plus an overlay-blended grain tile.
  The pinned proof chapter needs its stage to stay sticky and the section to stay
  `overflow: visible`, or the pin breaks.
- **Core features (chapter 4)**: its own component before the deck — chip, two-line title,
  lede, and four clickable tabs — your booking page, open after hours, fewer no-shows,
  sounds like you — each a frosted screen over the desert, on the dark steel-blue ground.
  Keyboard accessible (tablist, arrow keys, visible focus).
- **Proof chapter is a stacked deck of the three features**: it calls, it records, it flags.
  Dark cards on the paper ground, each with a flat frosted-glass panel of that feature's UI over
  a blurred desert photograph (`scrollcraft/builds/receptionist/ref.py` regenerates all three). Settled: do not restyle without being asked.
  Each card rises over the previous, which settles back and fades once ~60% covered. Pure CSS on
  the engine's `--sc-p` (`.rc-deck*` in `receptionist.css`); reduced motion → a column. The
  page is now 15.5 viewport-heights.
- **Human check live and visible.** Turnstile keys are on Vercel (widget "AI Receptionist -
  ask for a call", hostname ai-receptionist-two-azure.vercel.app, Managed). The check now runs
  on every submission (live call or callback request) and renders visibly. The plate's inputs
  got proper field bodies.
- **Ava tuned from the transcripts (done 3 Sep, on the live agent):** the static end-call line
  was cleared so callers hear one goodbye; interruptions need two words; noise reduction on.
  The extracted `outcome` still comes back "Not provided" on demo calls; the app does not
  depend on it for demos. Add the real domain to the Turnstile widget's hostnames when the site
  moves.
- **Still open, owner only, in order (all on the runbook with dates):** buy Ava a US number in
  OmniDimension by Fri 26 Sep and put its id on Vercel; Early deployers plan + request voicemail
  detection; rotate `VOICE_WEBHOOK_SECRET` (the token has been visible in logs);
  Resend + `OWNER_EMAIL`; product name + domain. Supabase service key completed 7 Sep.

## Earlier on 2026-09-02

- **The homepage is a scrollcraft build.** `/` is now a chaptered editorial on paper: title
  page, the cost (hard cut to ink), the turn (a scrub film of the real confirmation page),
  proof, an industries rail, an authored silence, the "ask for a call" plate (the peak), terms
  with the $199 / $1,000 / 500-call pricing, a held colophon. Engine vendored untouched at
  `src/vendor/scrollcraft/`, mounted from `components/marketing/scrollcraft-mount.tsx`; page
  styles in `app/(marketing)/receptionist.css`; assets in `public/scrollcraft/`. Brief, score,
  fingerprint gate and the verification record: `scrollcraft/builds/receptionist/BRIEF.md`;
  registry row in `scrollcraft/FINGERPRINTS.md`. Verified with the skill's harness on desktop,
  390×844 and reduced motion (no dead scroll, clip always moving, contrast clear, no console
  errors) and by driving the page in a browser. Lab shots are gitignored.
- **"Have it call you" is real plumbing, and honest.** `POST /api/try-call` (name, phone,
  business; NANP only; honeypot; 3/IP/hour, 2/phone/day, `TRY_CALL_DAILY_CAP`) creates a
  `kind: "demo"` call log with reference `TRY-XXXXXX`, dispatches through the same
  `placeCall` as confirmations, and `GET /api/try-call/[id]?ref=` is what the plate polls.
  **With no voice provider the page does not pretend:** the server records the lead, marks
  it `failed / no_voice_line`, emails the owner ("☎ Lead · <name> asked for a call"), and the
  plate says "This page can't ring you", shows Ava's real opening line, and stops. The
  scripted demo transcript was removed after the owner tested it and, rightly, called it
  made up. Stages and transcript render only for a call that was placed.
- **OmniDimension is live on the account and wired to this app** (agent `248069` "Ava",
  built in a Cowork session, ElevenLabs "Elena", gpt-4.1-mini). Verified from this session
  through the OmniDimension connector: the agent, its Post-Call webhook to
  `/api/webhooks/voice?token=…` with the extracted `outcome` variable, and three web-call
  logs (a reschedule conversation worked end to end; the reports came back `matched:false`
  because web calls have no log on our side, which is correct). Variable syntax on their side
  is `{{name}}`. Changes made from here, all additive (versioning is not on the plan, so restore
  by hand if needed): welcome message was
  `Hi, this is Ava calling from {{business_name}} about your upcoming appointment. Do you have a quick moment?`
  and is now `{{first_message}}` (our first line, which carries the recording notice); a new
  first prompt section "Which call this is" routes on `{{kind}}` (demo → follow `{{script}}`;
  confirmation → the seven Cowork sections, untouched); defaults added for `kind`,
  `first_message`, `script`, `contact_name`. The app now also sends `customer_name`, `kind`
  and `callback_number` (`CONTACT_PHONE`, optional). Production has `VOICE_PROVIDER`,
  `OMNIDIMENSION_API_KEY`, `OMNIDIMENSION_AGENT_ID`, `VOICE_WEBHOOK_SECRET`.
  **Still missing on Vercel: the two Turnstile keys**, so the homepage stays in callback mode
  by design until they land. No phone number on the account yet (the platform default rings).
  The webhook token has been visible in call logs and chats: rotate it before a customer sees
  this (`openssl rand -hex 24` → the dashboard URL and `VOICE_WEBHOOK_SECRET`, redeploy).
- **A person, not a script, behind every live call.** Cloudflare Turnstile
  (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`, `src/lib/turnstile.ts`) verified
  server-side before dialling; `isLiveCallReady()` = voice line AND human check, and the
  homepage only goes live on both (a provider without the check is ignored from the site, with a
  warning in the log). Proven with Cloudflare's test keys: no token → 403; verified token →
  dispatched. Owner step: two free keys from dash.cloudflare.com → Turnstile.
- **The phone line is OmniDimension** (the voice agent from the Instagram reel the product
  came from). Fixed the integration against their docs: dispatch sends `agent_id`, E.164
  `to_number`, optional `from_number_id`, `call_context` (now carrying `script`,
  `first_message`, `contact_name`) and `metadata`; the response's `requestId` is stored. The
  post-call webhook's nested `call_report` (summary, `extracted_variables.outcome`,
  `full_conversation`/`interactions`) is parsed, and reports are matched by `phone_number`
  (`findRecentCallByPhone`) since their call id need not equal the dispatch id. Dry-run: real
  API answers 401 on a placeholder key; a docs-shaped report → matched, completed, confirmed.
  **The owner's steps are in `docs/omnidimension.md`** (agent prompt, webhook URL with token,
  extracted `outcome` variable, the five `vercel env add` lines).
- **Chapter six can be asked again.** After a request (or, once a line exists, after a call) one
  button returns to the form with the visitor's details kept; the two-per-number daily limit
  still applies and says so. The homepage renders per request (`force-dynamic`) so its mode
  follows `VOICE_PROVIDER` the moment the keys exist, not the last build. A refused call now
  emails the owner the lead too. The live Vapi path was dry-run with placeholder keys: the API's
  401 surfaces as "couldn't be placed, a person will call you back", nothing is animated.
- Schema: `call_logs` demo columns (`kind`, nullable `appointment_id`/`client_id`,
  `demo_phone`, `demo_business`, `demo_name`, `reference`) now written into
  `supabase/schema.sql`; `demo_name` applied to the live project as migration
  `demo_call_name`. Favicon added (`src/app/icon.svg`).

## Done earlier

- **Business plan + the viability floor** (`~/.claude/plans/so-you-want-to-keen-nest.md`,
  approved 2026-09-01): concierge model — a customer is one deployment, one Supabase, one config
  directory. Built the code side:
  - **Single-tenant mode.** `NEXT_PUBLIC_TENANT=<slug>` at build time makes that business the
    site: `/`, `/book/[slug]`, `/confirmation/[id]` at the root; `/demo/*`, `/demos` and other
    businesses' APIs 404; `/demo/<tenant>/*` redirects to the root form; admin shows one
    business and forces its scope; the 404 page wears the tenant's chrome; the demo `noindex`
    is dropped. `TENANT=<slug> npm run seed:sql` seeds one business. Verified end to end with
    a salon build; default build verified visible-text identical except the consent line.
  - **Recording consent** (`src/lib/consent.ts`): first sentence of the agent's greeting, the
    script's step 1, the simulator transcript, every hero preview, and the booking form's phone
    hint. Verified at runtime in a simulated transcript.
  - `supabase/delete-client.sql` (by phone; cascades; notification logs removed explicitly) and
    `supabase/ops.sql` (five weekly checks). **Unverified against a live database** — no
    Supabase yet. Run the SELECT at the top of the deletion script first.

- **Multi-vertical restructure underway** — plan at
  `~/.claude/plans/so-you-want-to-keen-nest.md`. Chunks 0–9 of 10 landed:
  - 0: `/demo/` asset collision resolved (`public/demo` → `public/audio`).
  - 1: `Doctor→Provider` / `Patient→Client` rename across TS + SQL. `callMetadata` keys in
    `voice.ts` are frozen (external Vapi/Bland contract) — only their values changed.
  - 2: **`src/verticals/`** — every medical string now lives in `src/verticals/medical/`
    (`terms` = nouns in shared UI, `copy` = authored prose, `seed` = roster + transcripts).
    Pages read `DEFAULT_VERTICAL` until chunk 3 routes them by `/demo/[vertical]`.
    `Provider`/`Appointment` rows carry a `vertical` column. `supabase/seed.sql` is now
    GENERATED (`npm run seed:sql`) from the roster, so it can't drift. `env.clinicName` is
    gone; `SITE_TIMEZONE`/`OWNER_EMAIL` replace the `CLINIC_*` vars (old names still read).
    Verified: rendered HTML diff vs pre-extraction baseline shows only node-splitting and
    the intended restoration of medical nouns; full booking → call → admin passes.
  - 3: **routes live under `/demo/[vertical]`** (`/`, `/book/[slug]`, `/confirmation/[id]`)
    with APIs at `/api/demo/[vertical]/{availability,bookings}`. `demoPaths(slug)` is the one
    place the prefix lives; `resolveVertical(params)` 404s unknown slugs at the layout.
    Provider slugs are unique per vertical; a booking refuses a provider from another
    vertical; the confirmation page refuses an appointment from another vertical.
    **Temporary** `redirects()` in `next.config.ts` send `/`, `/doctors/*`, `/booking/*` to
    the medical demo — remove when the marketing site lands at `/` (chunk 8).
  - 4: **theming.** `:root`/`.dark` now carry the PRODUCT palette (indigo + graphite, Inter);
    medical's tokens moved verbatim under `[data-vertical="medical"]` ×2. Rule (documented in
    `globals.css`): a key a vertical sets in its light block MUST also be in its dark block —
    same specificity as `.dark`, so it would otherwise win in dark mode. Display faces load once
    in the root layout (`--font-display-{editorial,fashion,technical}`), CSS re-points
    `--font-display`; font classes moved from `<body>` to `<html>`. `VerticalTheme` sets the
    attribute (inline script for hard loads, layout effect for soft navs, cleared on unmount).
    Verified all 4 palette×mode combos by computed style; soft-nav out/in restores correctly.
  - 5: **salon** (`/demo/salon`, Solstice Salon & Spa). The acceptance test held: adding it
    touched `src/verticals/salon/*`, two palette blocks, the `VerticalSlug` union, two new
    glyphs in the shared icon set, and `verticals/rosters.ts` (the seed script now reads that
    list, so a new vertical never edits `scripts/`). Verified: tokens + Playfair in both modes,
    full booking confirms with salon copy, cross-vertical booking → 409, cross-vertical
    confirmation page → 404, shared admin shows "Sasha Reyes" beside "Dr. Elena Vasquez".
  - 6: **studio** (`/demo/studio`, Halide Studio — a brand/design studio where you book a paid
    discovery session with the director who'd lead your project). Touched only
    `src/verticals/studio/*`, two palette blocks, and the slug union. Same verification set
    passed. Swatch pages removed. **All three demos are live locally.**
  - 7: **shared admin.** One dashboard for every business: a Business filter row and column
    (each identified by its swatch, since admin renders on the product palette), stats that
    follow the selected business, `?vertical=` on the feed API, a business badge on the record
    page. Admin shell + both sign-in screens are now branded "AI Receptionist", not Northlake.
  - 8: **marketing site at `/`** + `/demos`. Owner-facing hero, stat strip, owner-framed steps,
    demo cards (each in its business's swatch), the full industries catalogue with the three
    live demos called out, "what's in the box", buyer FAQ (calendar sync answered honestly as
    roadmap), closing CTA. The five section blocks now live in `components/marketing/blocks.tsx`
    and the demo pages use them too — verified visible-text-identical to pre-lift baselines.
    `ui/button.tsx` is the pill primitive. Temporary redirects removed. "Talk to us" only renders
    when `CONTACT_EMAIL`/`OWNER_EMAIL` is set (no fake address on a sales page).
  - 9: **go public.** `SITE_GATE` is a two-mode switch: unset/`public` → product + demos open,
    `/admin` staff-gated, `/login` dead; `locked` → today's whole-site `SITE_PASSWORD` gate
    (webhooks always open). `robots.ts` disallows `/admin` + `/api/`; the demo layout is
    `noindex` (fictional businesses). Both modes verified by contract.

- **Password-gated the whole site.** `src/proxy.ts` (Next 16's renamed `middleware.ts` —
  one per project, so the site gate and the pre-existing `/admin` gate share it) now bounces
  any cookie-less browser to `/login`, and returns 401 on browser-facing API routes.
  `/api/webhooks/*` is deliberately exempt: providers carry no cookie and authenticate with
  `VOICE_WEBHOOK_SECRET`. Password reads from `SITE_PASSWORD`, default `bubs2026`.
- The gate cookie is an HMAC over its own expiry (7 days), signed with the password itself,
  so rotating `SITE_PASSWORD` signs everyone out. `src/lib/auth.ts` grew reusable
  `createToken`/`verifyToken` helpers; `src/lib/site-gate.ts` builds the site gate on them.
- Staff sign-in is unchanged and still separate: unlocking the site does not get you
  into `/admin`.

### Earlier

- Built the whole app from scratch: Next.js 16 + React 19 + Tailwind v4, booking site,
  admin dashboard, voice-agent dispatch, webhooks, email. Production build is clean.
- Data layer (`src/lib/db.ts`) runs on Supabase when keys are present and an in-memory demo
  store otherwise, so the app is fully explorable with an empty `.env`.
- Verified end to end in a browser: booking → new-booking webhook → owner + patient emails →
  simulated call (queued → ringing → on-call → confirmed) → appointment confirmed → live
  update on the patient's confirmation page → record in the dashboard with recording,
  transcript and AI summary.
- Verified `/api/webhooks/voice` against Vapi-shaped and Bland-shaped payloads; both
  normalise correctly (duration, cost, transcript array vs string, outcome inference).
- Fixed during QA: mobile horizontal overflow from implicit `max-content` grid tracks,
  "Closed" vs "Full" wording in the date picker, call badges coloured by outcome rather than
  by status, seeded demo appointments landing outside clinic hours, header wrapping at 390px.

## In progress

Customer platform is deployed; external integration setup and live acceptance remain. See the latest handoff above.

## Deployed

- Live on Vercel: https://ai-receptionist-two-azure.vercel.app — **locked** behind the site
  password (`SITE_GATE=locked` set on production; password `bubs2026` = `SITE_PASSWORD`
  default). Unlock at `/login`. Flip `SITE_GATE` to `public` (or remove it) and redeploy to
  open the marketing site to the world.
- Project `bubs-1063s-projects/ai-receptionist`. Every deploy this week went out with
  `npx vercel --prod` after the push; latest application source is 59594fe, redeployed 7 Sep with durable storage. Env vars: `vercel env ls`.
  On Vercel now: Supabase URL + anon key + sensitive service-role key, `ADMIN_SESSION_SECRET`, `SITE_GATE`, `VOICE_PROVIDER`,
  `OMNIDIMENSION_API_KEY`, `OMNIDIMENSION_AGENT_ID`, `VOICE_WEBHOOK_SECRET`, both Turnstile keys.
- What's live: the product marketing site at `/`, `/demos`, three themed demos at
  `/demo/{medical,salon,studio}`, the shared staff dashboard at `/admin` (password
  `demo1234` = `ADMIN_PASSWORD` default — shown on the sign-in screen while it's the default).
- **Production storage fixed (7 Sep):** bookings now persist in Supabase. The live salon booking,
  confirmation-page reload and admin record all passed. The former cross-request 404 is resolved.

## Onboarding a customer (concierge, per the business plan)

Intake → `src/verticals/<slug>/` (copy the salon's four files) → their Supabase (`schema.sql`,
`TENANT=<slug> npm run seed:sql`, run it) → their Vercel project from this repo with
`NEXT_PUBLIC_TENANT=<slug>`, Supabase ×3, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `OWNER_EMAIL`,
Resend + voice keys → phone number in the voice provider + `VOICE_WEBHOOK_SECRET` → test call with
them on the line → `book.theirdomain.com` CNAME → invoice. Full runbook in the plan, Part 3.

## Production storage — completed 2026-09-07

**Supabase is live** (created 2026-09-02, $10/mo, DesignTitan's Org):
- project `ai-receptionist`, ref `ddbldxsyvrqrlvtainzn`, region us-east-1,
  URL `https://ddbldxsyvrqrlvtainzn.supabase.co`
- `schema.sql` applied as migration `initial_schema`; RLS on every table; 18 providers seeded
  (6 medical / 6 salon / 6 studio).
- `supabase/delete-client.sql` and `supabase/ops.sql` **verified against this database**
  (throwaway client → all four counts zero, providers untouched).
- Already on Vercel production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (the `sb_publishable_…` key), a fresh `ADMIN_SESSION_SECRET`, `SITE_GATE=locked`.

**Completed: `SUPABASE_SERVICE_ROLE_KEY`.** Added as a sensitive Production variable and
redeployed. Acceptance test passed: the live booking confirmation survives reload and the
record is visible in Supabase and admin. Older notes about the missing key are historical.

Also set `ADMIN_PASSWORD` (still the default `demo1234` — fine while the site is locked, not after)
and flip `SITE_GATE` to `public` when you want the marketing site open.

**The call on the homepage is real** (since 2 Sep): OmniDimension agent 248069 "Ava", the
Post-Call webhook, `VOICE_PROVIDER=omnidimension` and its keys, plus both Turnstile keys, are on
Vercel, and two real calls have completed end to end. Still missing for a real customer: a bought
number (calls leave from the platform's shared pool) and Resend + `OWNER_EMAIL` so the lead and
call-summary emails actually arrive.

Remaining launch work, in priority order:
- Sales motion is decided (three call-volume plans on the site, concierge behind a self-serve
  front at launch, docs/ROADMAP.md). Calendar sync stays "not yet" until a customer makes it a
  condition. The `callMetadata` keys in `src/lib/voice.ts` stay frozen (additive only).
- Resend key + `OWNER_EMAIL` so owner emails deliver (templates already use each business's
  swatch and nouns).
- Product name: "AI Receptionist" is still the working name (`PRODUCT_NAME` in
  `src/components/marketing/product-chrome.tsx`); Week 1 of the roadmap is picking the real one
  and buying the domain.
- Week 1–3 build items from the roadmap: customers table + /admin queue, "Start here" signup
  with Stripe Checkout, one deployment serving every customer by subdomain, `npm run provision`.
- The one real product wall, demand-gated per the plan: a services entity with per-service
  durations (`slot_minutes` lives on the provider today). Also the hardcoded 12–13 lunch break
  and 90-min lead time in `src/lib/db.ts`.
- Adding a fourth vertical = one directory under `src/verticals/`, a line in `index.ts`,
  `terms.ts` and `rosters.ts`, a member on `VerticalSlug`, and two palette blocks in
  `globals.css` (every key set in the light block must also be set in the dark block).
