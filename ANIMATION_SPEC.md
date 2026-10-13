# Animation specification

The supplied 3.90-second, 640×368 recording was decoded and inspected at 0.5-second intervals, alongside both supplied contact sheets. Its facade push-in, rising editorial panel and split-image settlement inform motion only. Neither its footage nor its property content is included.

## Ownership

| Component                            | Owner                                             | Behavior                                                      |
| ------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------- |
| HeroScene                            | GSAP/ScrollTrigger                                | Reversible photograph push-in and text yield                  |
| FacadePanelReveal                    | One GSAP/ScrollTrigger timeline                   | Push-in → ivory wipe → line reveal → split composition → hold |
| InteriorSequence                     | One GSAP/ScrollTrigger timeline                   | Four masked scene swaps, captions and indicators              |
| ExteriorWorks                        | Motion on image wrapper; CSS hover on child image | Gentle ±3% vertical parallax, asymmetric composition          |
| Materials, Approach, Studio, Inquiry | Motion                                            | Small opacity/22px translations, reversible viewport reveals  |
| Header                               | Motion and React state                            | Mobile menu transition; focus management and Escape           |
| WorkPage/lightbox                    | Motion on cards; native dialog                    | Filter entrances, full-frame viewing and keyboard controls    |
| ScaleModelScene / PhotoPlanes        | GSAP numeric progress → R3F/Three/Drei            | Photograph planes only, bounded depth and tilt                |
| ScrollEngine                         | Lenis via GSAP ticker                             | Optional fine-pointer desktop smoothing; one RAF source       |

No GSAP node has its transform, opacity or clip path owned by Motion. No nested pins, global WebGL layer, wheel hijacking, ScrollControls, idle spin or video playback.

Motion uses `LazyMotion` with `domAnimation` and `m` elements to omit unused drag/layout features. Short viewports (height ≤650px) also bypass the three pins and show normal-flow photography/editorial chapters.

## Exterior hero

- Asset: `exterior-driveway-golden-hour.webp`, supplied 1080×607; original geometry retained.
- Desktop ≥768px: viewport-height pin, 0.85 viewport additional scroll (approximately 185vh total).
- Timeline 0–1: scale 1→1.075 and y −1.5%; copy yields from 0.35–0.85 with a −36px translation; bottom cue fades from 0.6–0.9.
- Numeric scrub 0.45s, linear progress, refreshed measurements on resize. The pinned section itself is not transformed.
- Below 768px: native, unpinned viewport; a limited 1→1.035 scroll-linked scale. Eager full-source WebP prevents selecting a too-small responsive source for a tall cropped hero.
- Reduced motion: static photo and copy. Hidden hero controls become inert after the final fade, restored on reversal/cleanup.

## Facade → ivory

- Establishing image: `exterior-rear-facade.webp`; split-composition image: `exterior-side-landscape.webp`.
- Desktop additional pin budget 1.3 viewport heights (approximately 230vh total). Mobile additional pin budget 1.05 viewport heights (approximately 205vh total); native scroll remains in control.
- One scrubbed timeline, normalized length 1.02:
  - 0–0.50: scale 1→1.08, y −2%.
  - 0.24–0.66: ivory clip-path `inset(100% 0 0)` → `inset(0)`.
  - 0.47–0.63: chapter label opacity/y reveal.
  - 0.48 onward: two independently clipped lines translate from 112% to 0, 0.08 stagger.
  - 0.65–0.90: lower image reveals from bottom mask with a 28px translation.
  - 0.72–0.92: editorial supporting copy enters; final 0.1 holds the composition.
- Backscroll uses the same timeline; no one-shot callbacks determine image/panel state.
- Inert controls until the panel’s supporting copy has appeared; reset on media change/unmount.
- Mobile places image above supporting copy. Reduced motion shows the establishing photograph followed by the editorial section in ordinary flow.

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
