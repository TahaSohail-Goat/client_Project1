# Animation specification

The supplied 3.90-second, 640×368 recording was decoded and inspected at 0.5-second intervals, alongside both supplied contact sheets. Its facade push-in, rising editorial panel and split-image settlement inform motion only. Neither its footage nor its property content is included.

## Ownership

| Component                            | Owner                                             | Behavior                                                                   |
| ------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------- |
| HeroScene                            | GSAP/ScrollTrigger                                | Five-chapter pinned photographic opening, perspective and reversible masks |
| FacadePanelReveal                    | Parent HeroScene GSAP timeline                    | Embedded ivory/editorial finale; no separate homepage pin                  |
| InteriorSequence                     | One GSAP/ScrollTrigger timeline                   | Four masked scene swaps, captions and indicators                           |
| ExteriorWorks                        | Motion on image wrapper; CSS hover on child image | Gentle ±3% vertical parallax, asymmetric composition                       |
| Materials, Approach, Studio, Inquiry | Motion                                            | Small opacity/22px translations, reversible viewport reveals               |
| Header                               | Motion and React state                            | Mobile menu transition; focus management and Escape                        |
| WorkPage/lightbox                    | Motion on cards; native dialog                    | Filter entrances, full-frame viewing and keyboard controls                 |
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
- Reduced motion or height <=650px: no opening pin, no chapter rail/aperture, four ordinary photographic figures plus the ivory editorial content. Every photograph and navigation destination stays available.
- GSAP exclusively owns these nodes. Motion remains on separate navigation/editorial/gallery components; no WebGL package is added to the opening.

## Interior stage

- Dining/living → lounge/bar → classic bedroom → walk-in wardrobe. No assertion that these are one commission.
- ≥768px and no reduced-motion preference: additional pin budget 2.25 viewports (325vh total), 0.4s scrub.
- Later scenes reveal top-to-bottom at timeline positions 0.7, 1.75, 2.8. Each mask takes 0.55; scale reduces 1.045→1 over 0.85; caption appears over 0.35 starting 0.25 after mask begins. Final hold 0.5.
- Indicators and screen-reader visibility update only when the active scene changes; all 11 interiors remain independently accessible via `/work`.
- Mobile/reduced motion: four static figures with captions; no pin or masked inaccessible stack.

## Model photographs

- Three original WebP textures on simple rectangular planes. No reconstructed architecture, orbit controls or true building model.
- One non-pinned ScrollTrigger maps section entry/exit to a mutable progress ref; no React state per scroll frame.
- Group tilt is ±0.0375 radians (~2.15°); individual yaw ≤0.05 radians, roll ≤0.025 radians; center Z excursion ≤0.25, side Z excursion ≤0.12 world units. Vertical shift ±0.09 units.
- Orthographic camera, no lights/postprocessing. Drei texture loading; sRGB textures and non-tone-mapped photo material.
- `frameloop="demand"`; progress invalidates one frame, no continuous idle loop; DPR 1–1.4. Module import starts only near the chapter on ≥1024px fine-pointer/no-reduced-motion/no-save-data devices with WebGL2.
- Reserved 380px stage prevents loading/failure shifts. DOM photograph perspective fallback stays beneath the canvas, with the same three accessible gallery links below. Context loss or a rendering/texture error restores fallback. Mobile and reduced motion show only the editorial photo grid.

## Scroll lifecycle

`gsap.matchMedia` owns scene setup/reversion, scoped to each section. Route changes refresh measurements after lazy content mounts; Lenis dimensions are resized before anchor navigation. CSS scroll padding handles fixed-header offsets. Lenis uses `autoRaf:false` and one GSAP ticker callback, with native scroll on touch/mobile/reduced motion. All ticker/listener/observer/scene resources are cleaned up on unmount. Resize while inside a scene is included in browser QA.

Primary implementation references: [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Lenis](https://github.com/darkroomengineering/lenis), [Motion React](https://motion.dev/docs/react), [R3F](https://r3f.docs.pmnd.rs/getting-started/introduction).
