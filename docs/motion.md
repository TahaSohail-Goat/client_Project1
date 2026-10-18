# Motion architecture

GSAP owns scroll-linked transforms and pins. Motion owns navigation, supporting-copy entrances, pointer interactions, and the spatial photo gallery. All devices use native document scrolling, without an extra animation ticker or added wheel inertia. The hero camera follows with a short 180ms scrub, gallery arrangement changes take 550ms, and supporting-copy entrances run once.

Keep these owners on separate DOM nodes. Revert GSAP contexts, remove listeners, cancel scheduled frames, and dispose owned graphics resources when components unmount or motion preferences change.

## Sections

| Section | Behavior and fallback |
| --- | --- |
| Residence hero | One reversible camera journey and editorial reveal; matching static poster for reduced motion, Save-Data, short screens, or graphics failure. See [hero](hero.md). |
| Exterior work | Scroll-linked masks and restrained photo depth; WebGL activates only while approaching eligible desktop compositions. Static photos remain underneath. |
| Interiors | Four photographic stages with scrubbed masks on eligible screens; ordinary captioned figures on mobile and reduced motion. |
| Materials | Original client photos with optional desktop material-depth rendering; HTML content and photo fallback remain available. |
| Housing study | Separately labelled concept courtyard house with facade, lifted roof, and overhead views. It does not depict a verified commission. |
| Model studies | Client photographs on restrained perspective planes; full seven-photo collection remains accessible without WebGL. |
| Approach and consultation | Scroll and pointer-responsive sculpture with static/mobile alternatives and live reduced-motion teardown. |
| Portfolio | Heading, introduction, filters, and layout controls sit outside the clipped photo stage. Eight Motion-based arrangements retain drag/swipe, buttons, keyboard navigation, and three transitions. Portrait thumbnails fit the stage; reduced motion uses the same heading above an ordinary photo grid. |
| Contact and footer | Separate copy/signature entrances; all fields and links stay usable through deep links and reduced motion. |

## Navigation and accessibility

[`navigation.ts`](../src/content/navigation.ts) defines the header/footer section order. Shared anchor helpers account for pinned sections and header clearance. Repeated links, encoded fragments, browser history, category filters, and photo links retain their destination behavior.

Hidden hero stages are inert and excluded from assistive navigation. The mobile menu contains focus and restores its toggle on close. Native photo dialogs support Escape, backdrop dismissal, previous/next, and focus restoration. Gallery shortcuts only operate while the gallery itself has focus; vertical gestures continue scrolling the document.

Use live media-query subscriptions so reduced-motion changes tear down pins and canvases immediately. Graphics initialization and context loss must restore the underlying content. Maintain photo dimensions and fallback stage sizes to avoid layout shifts.

See [browser testing](testing.md) for motion, touch emulation, resize, accessibility, and recovery checks.
