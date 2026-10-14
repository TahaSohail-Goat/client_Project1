# Animation specification

The supplied 3.90-second, 640×368 recording was decoded and inspected at 0.5-second intervals, alongside both supplied contact sheets. Its facade push-in, rising editorial panel and split-image settlement inform motion only. Neither its footage nor its property content is included.


## Default video hero

- **Assets:** supplied 8-second, 1280×720 H.264/all-intra/24fps MP4 (7,271,665 bytes), preserved byte-for-byte at `public/media/video/hero_exterior_to_interior_scrub.mp4`. A 768×432 all-intra mobile rendition is 2,579,207 bytes; first-frame WebP poster is 93,198 bytes. All three are typography-free. Older `references/` recordings are never used as site footage.
- **One document scroll:** `HeroScene` owns one GSAP ScrollTrigger pin. Desktop scroll budget is 4.8 extra viewports; mobile is 3.4. GSAP scrub is 0.45/0.25 seconds. There is no nested scroll container, autoplay, loop or independent video playback. Lenis remains optional desktop smoothing on the shared GSAP ticker with lag smoothing disabled.
- **Seeking:** normalized progress 0–0.9 maps to film time 0–(duration minus one frame). Targets round to 24fps. A single RAF and the native `seeked` event coalesce pending targets, avoiding repeated seeking while the decoder is busy. Video-frame callbacks track decoded frames; visibility cleanup removes callbacks/listeners, pauses and releases media. Responsive source selection is stable across resize to avoid re-downloading the film.
- **Typography:** Space Grotesk 700 and Instrument Serif Italic 400 remain selectable HTML. Opening copy fades/moves upward at 12–30%; an interior lockup reveals at 56–65% and fades at 71–78%. Chapter seeks are 0%, 25%, 65%, 73%, 98%, aligned to the supplied film.
- **Editorial handoff:** ivory wipes upward at 80–95%; heading, copy and masked client photography reveal within the panel. The last 5% is a readable hold. Inert/ARIA state follows visible content; the controls and Skip link remain available. At pin release the ivory surface joins the next ivory section without a background cut.
- **Fallbacks:** the first-frame poster stays visible while decoding; a polite loading label does not block navigation. Film error or 30-second initial decode timeout mounts the preserved `PhotographicHero`. Reduced motion, Save-Data or <=500px height show ordinary poster/editorial content, with no MP4 request or hero pin. Compact phone/laptop layouts reserve space for controls.
- **QA:** Chrome and WebKit production tests cover forward/reverse frame seeking, no independent playback, panel reversal, section skip, filters, keyboard lightbox and anchors. Responsive checks cover 390×844, 390×640 and 1366×600. Loading/failure and reduced-motion checks use isolated contexts to bypass media caching. Actual Safari/iOS hardware is unavailable in this Windows workspace and remains a launch check.
## Whole-page cinematic direction

The latest client revision extends the cinematic treatment across the single-page eco28 portfolio. The existing film remains the opening; client photographs, confirmed disciplines, navigation, filters and inquiry behavior remain intact.

1. **Foundation:** audited the existing React 19/Vite/TypeScript application and all assets; implemented on `feature/cinematic-studio-experience` with no dependency replacements or additional font families.
2. **Editorial and photography:** reusable `CinematicHeading` reveals selectable words with a scrubbed, staggered upward movement. Italics add a small diagonal and perspective movement. `DepthPhoto` separates GSAP image drift/masking from Motion pointer perspective. An oversized architecture-to-interiors ribbon moves with document scroll; it has no pin.
3. **Spatial choreography:** the existing conceptual housing model now stages approach → roof lift → overhead plan. Glazing, timber battens, floor joints, dining furniture and construction guides add depth to the original concept. Technical linework, chapter numbers and a rotating compass accompany the model. Exactly three physical-model photograph planes receive WebGL depth; all seven photographs remain in the accessible grid.
4. **Portfolio and finishing:** viewport-based card entrances replace eager offscreen entrances. Fine-pointer card perspective, indexed photographs, sticky category controls, alternating expertise compositions, animated drafting marks, interactive link rules and an oversized eco28 footer complete the experience. Mobile uses normal flow for the interior and model stories; motion preferences restore static readable content.
5. **Validation:** production builds, TypeScript, lint, Chrome and WebKit browser checks. `scripts/cinematic-smoke.js` covers word spacing/reversal, cold deep links, lazy WebGL loading, model reversal, all 43 photos and filter counts, keyboard lightbox/menu behavior, inquiry preview, mobile overflow, context loss and reduced motion. The existing `scripts/browser-smoke.js` separately validates the film and legacy routes. Screenshots stay in ignored `output/playwright/`.

Animations respond to scrolling or interaction. There are no additional pinned scenes, idle spins, new HDR/video downloads, fullscreen WebGL layer or postprocessing effects. The shared Three.js bundle remains lazy; the existing build-size warning for this chunk is recorded rather than hidden.

Verified on the local production build in Chrome and Windows WebKit: all 43 client photographs decode successfully; word opacity reverses from 1 to 0.3; deep-linked sections settle at their 100px header offset; all category counts remain 11/25/7/43; the housing view reverses and survives a keyboard-selected resize; mobile housing is unpinned; context loss restores the SVG; reduced motion has zero pins, videos, canvases or hidden words. Layout checks at 320×568, 390×844, 768×900, 1024×768 and 1366×600 find no horizontal overflow. The interior sequence reverses from the wardrobe to living/dining. The film remains paused and scroll-controlled in both engines. Chapter controls resolve pending resize measurements before seeking. Real Safari/iPhone hardware and a confirmed inquiry destination remain launch checks.

## Ownership

| Component                            | Owner                                             | Behavior                                                                   |
| ------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------- |
| HeroScene                            | GSAP/ScrollTrigger                                | Pinned video playhead, responsive HTML typography and reversible ivory wipe |
| FacadePanelReveal                    | Parent HeroScene GSAP timeline                    | Embedded ivory/editorial finale; no separate homepage pin                  |
| InteriorSequence                     | One GSAP/ScrollTrigger timeline                   | Four masked scene swaps, captions and indicators                           |
| CinematicHeading                     | GSAP on inner word spans                          | Reversible word reveals; selectable HTML; diagonal italic perspective      |
| DepthPhoto                           | GSAP on inner mask/image; Motion on outer plane   | Scrubbed crop and camera drift; bounded fine-pointer perspective           |
| ArchitecturalRibbon / SpatialSignature | GSAP on scoped type, rules and SVG paths        | Horizontal type movement and construction-line drawing without pins      |
| Materials, Approach, Studio, Inquiry | Shared heading/photo components and separate Motion copy wrappers | Chapter compositions, masked photography and readable supporting copy |
| Header                               | Motion and React state                            | Mobile menu transition; focus management and Escape                        |
| PortfolioSection/lightbox             | Motion on card/inner photograph; native dialog    | Viewport entrances, pointer tilt, filters, full-frame keyboard controls    |
| Footer                               | Motion                                            | Large eco28 signature mask reveal                                         |
| ScaleModelScene / PhotoPlanes        | GSAP numeric progress → R3F/Three/Drei            | Photograph planes only, bounded depth and tilt                             |
| ScrollEngine                         | Lenis via GSAP ticker                             | Optional fine-pointer desktop smoothing; one RAF source                    |

No GSAP node has its transform, opacity or clip path owned by Motion. No nested pins, global WebGL layer, wheel hijacking, ScrollControls, idle spin or video playback.

Motion uses `LazyMotion` with `domAnimation` and `m` elements to omit unused drag/layout features. Short viewports (height ≤650px) also bypass the pinned scenes and show normal-flow photography/editorial chapters.

## Long opening journey (latest client revision)

The user explicitly selected a longer sequence built from the supplied photographs. The live reference was inspected in a browser: its hero spans approximately 460vh and scrubs 148 pre-rendered frames. This implementation uses the client's still images and original motion choreography; no reference frames, footage, branding or architectural geometry are reused.

- One `HeroScene` ScrollTrigger pins the entire opening. Desktop additional budget: **480vh**, approximately **580vh total**. Mobile additional budget: **340vh**, approximately **440vh total**, with native touch scrolling and a shorter scrub.
- `FacadePanelReveal` is embedded as the final chapter and has **no separate pin or timeline** on the homepage. The later InteriorSequence retains its separate bounded pin.
- A 12-unit reversible timeline drives five chapters. Every image stage and mask reverses, including the central aperture disappearing completely when returning to Arrival.

| Timeline units | Chapter    | Photograph / choreography                                                                                                                                                  |
| -------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0-2.4          | Arrival    | Golden-hour exterior, scale 1-1.10, -0.8% X / -1.5% Y, up to 1.2 degree Y tilt; headline yields at 1.15-1.90                                                               |
| 1.8-4.0        | Approach   | Rear facade enters through a travelling horizontal mask; photo-plane scale 1.02-1.09 and tilt -1.5 degrees to 0; editorial caption settles then yields                     |
| 3.25-6.75      | Within     | Graphic aperture brackets appear; dining/living photograph expands from a central rectangle to the viewport at 3.6-5.05; scale 1.035-1.10 and restrained vertical drift    |
| 6.3-8.75       | Atmosphere | Lounge photograph rises through a different mask with a 3% vertical translation; slight horizontal pan, scale 1.06-1.10, tilt 1 degree to 0; warm interior caption         |
| 8.5-12         | Vision     | Facade returns, ivory panel rises at 9.15-10.35; clipped statement lines, side-elevation photograph and supporting copy form the editorial composition; final reading hold |

The depth is a photographic illusion: CSS perspective, planar transforms, cropping and masks. It is not a reconstruction, a true model or a verified walkthrough of one house. The imagery is explicitly framed as a category-based image journey. Source geometry is never altered and no invented walls, doorways, floors or rooms are added. The aperture brackets are graphic framing, not building geometry.

### Controls, loading and fallback

- Five keyboard-operable chapter buttons seek via the document scroll controller. Bookmarks: 0, 0.25, 0.47, 0.65, 0.98. Each lands on a readable settled frame. Current chapter and progress line track the scrubbed timeline; a status announces only chapter changes.
- `Skip sequence` leads to `#selected-work`, below the hero, with the header offset. Every hidden stage is inert/aria-hidden. Intro links become inert after yielding; the editorial link is enabled when its copy appears.
- Lenis handles chapter seeks with an immediate, forced document position on eligible desktop; native scrolling handles the same event otherwise. No second scroll source or wheel lock is introduced.
- Intro photo remains eager/high priority. Later hero photographs mount on early scroll progress, chapter hover/focus or chapter selection; they use existing full-size WebPs, not generated frames. Animation targets stay mounted independently of photo loading, and image-error fallbacks remain available.
- Scrub: 0.6 seconds desktop, 0.35 mobile. Photo-plane perspective: 1200px; all scale bounds <=1.10. Mobile removes Y tilts, reserves a two-row chapter rail and retains the pin with a shorter budget.
- Reduced motion, mobile height <=650px, or any height <=500px: no opening pin, no chapter rail/aperture, four ordinary photographic figures plus the ivory editorial content. Every photograph and navigation destination stays available.
- GSAP exclusively owns these nodes. Motion remains on separate navigation/editorial/gallery components; no WebGL package is added to the opening.

## Interior stage

- Dining/living → lounge/bar → classic bedroom → walk-in wardrobe. No assertion that these are one commission.
- ≥768px and no reduced-motion preference: additional pin budget 2.25 viewports (325vh total), 0.4s scrub.
- Later scenes reveal top-to-bottom at timeline positions 0.7, 1.75, 2.8. Each mask takes 0.55; scale reduces 1.10→1.01 over 0.85 with alternating ±2% horizontal camera drift. Captions and their headings reveal on separate beats. The first scene has its own 1.08→1.01 approach. Final hold 0.5.
- Indicators and screen-reader visibility update only when the active scene changes; all 25 interiors remain independently accessible via `/#work`.
- Mobile/reduced motion: four static figures with captions; no pin or masked inaccessible stack.

## Model photographs

- Three original client photographs use 768px WebP textures on simple rectangular planes. All seven model photographs remain in the DOM gallery. No reconstructed architecture or orbit controls in this photographic effect.
- One non-pinned ScrollTrigger maps section entry/exit to a mutable progress ref; no React state per scroll frame.
- Group tilt is ±0.0375 radians (~2.15°); individual yaw ≤0.14 radians, roll ≤0.04 radians; center Z excursion ≤0.5, side Z excursion ≤0.2 world units. The camera fits the three-plane composition responsively.
- Orthographic camera, no lights/postprocessing. Drei texture loading; sRGB textures and non-tone-mapped photo material.
- `frameloop="demand"`; progress invalidates one frame, no continuous idle loop; DPR 1–1.4. Module import starts only near the chapter on ≥1024px fine-pointer/no-reduced-motion/no-save-data devices with WebGL2.
- Reserved 380px stage prevents loading/failure shifts. DOM photograph perspective fallback stays beneath the canvas, with all seven accessible gallery links below. Context-loss listeners are removed on intentional teardown. A rendering/texture error restores fallback. Mobile and reduced motion show only the editorial photo grid.

## Scroll lifecycle

`gsap.matchMedia` owns scene setup/reversion, scoped to each section. Route changes refresh measurements after lazy content mounts; Lenis dimensions are resized before anchor navigation. Deep-link alignment follows ScrollTrigger refreshes while media adds a pin, then stops following as soon as the visitor uses wheel, touch, pointer or scrolling keys. This prevents late media readiness from stranding a section link inside the hero. CSS scroll padding handles fixed-header offsets. Lenis uses `autoRaf:false` and one GSAP ticker callback, with native scroll on touch/mobile/reduced motion. All ticker/listener/observer/scene resources are cleaned up on unmount. Resize while inside a scene is included in browser QA.

Primary implementation references: [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Lenis](https://github.com/darkroomengineering/lenis), [Motion React](https://motion.dev/docs/react), [R3F](https://r3f.docs.pmnd.rs/getting-started/introduction).

## Conceptual housing study (requested after the original handoff)

- Added between materials and physical-model photographs on the single page, accessible via `/#housing` and the navbar’s **3D study** link.
- Original procedural courtyard-house geometry is explicitly labelled a conceptual study, not a client project or reconstruction. Client photography and the physical-model photo effect remain intact.
- React Three Fiber renders Three.js geometry/materials/lights. Drei supplies slab-edge detail. The roof assembly lifts 3.2 units and slides back 2.8 units as the camera orbits toward an overhead interior view. Rotation, roof movement and camera framing are deterministic functions of normalized progress and reverse on upward scroll.
- GSAP ScrollTrigger is the sole scroll controller. Desktop/tablet >=768px and >=651px: pin to the viewport for 2.5 extra viewport heights, scrub 0.65. Small or short screens: ordinary flow, unpinned scroll-linked movement. Chapter buttons jump to 8%, 54%, 94% through the existing Lenis/native scroll bridge.
- Dynamic canvas import begins within 900px of the section, with WebGL2 capability detection and Save-Data respect. Demand rendering invalidates only when scroll progress or size changes; DPR is capped at 1.5. No downloaded model, HDR environment, autoplay loop, nested scroller or postprocessing is required.
- Reduced motion, Save-Data, missing WebGL or lost context display an SVG generated from the same geometry, retain all explanatory text and remove the pin. Model/canvas size is reserved so rendering readiness does not move nearby content.
- Browser QA: forward and reverse chapter navigation, mobile no-pin/no-overflow, reduced-motion static poster/no-canvas/no-pin, plus WebGL fallback. Build and lint checks recorded with the change.
- Primary API guidance: [R3F demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
