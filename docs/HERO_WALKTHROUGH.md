> Historical record of the earlier single-storey hero. The active four-storey implementation and test instructions are in [HERO_IMPLEMENTATION.md](../HERO_IMPLEMENTATION.md).

# Continuous concept walkthrough

The October 15 laptop recording (4.72 seconds, 480×784) is a motion/layout reference,
not production footage. It shows a whole-building approach, entrance, lobby and
upper interior, beneath a transparent masthead and gold invitation button.
The original website URL and clean master are unavailable.

The current hero uses the existing original courtyard-house study from
`src/content/housing.ts`. It is visibly labelled **Original concept / 3D spatial
study**, independent of eco28's client portfolio. It is an interactive real-time
render, not an AI video or a reconstruction of the reference property. This does
not reproduce the reference's tower, upper floors or photorealistic production
render. A detailed approved scene/render is still needed to match that visual
fidelity or depict a particular client property.

## Camera and rendering

- Seven camera poses establish the complete exterior, approach the facade, pass
  through the opened sliding glazing, then move through living, kitchen and dining
  views. Time-weighted cubic Hermite interpolation keeps velocity continuous.
- A single GSAP hero pin drives normalized camera progress, door travel and the
  existing HTML typography. There is no autonomous camera playback. Backscroll
  samples precisely the same camera pose. Lenis shares the existing GSAP ticker;
  touch retains native document scrolling.
- The pin spans 11.5 extra desktop viewports / 8 mobile viewports. The first 82%
  covers the camera journey; the last 18% belongs to the existing ivory reveal.
  Camera speed is controlled by the visitor, so this is not a fixed-duration MP4.
- Three.js/R3F render on demand. Materials and environment are local; DPR is
  capped at 1.5, directional shadows at 2048 desktop / 1024 mobile. Static contact
  shadows render once, and foliage uses instancing. There are no paid packages,
  generated video credits or external media requests at runtime.
- Loading, reduced motion, Save-Data, screens ≤500px tall, rendering errors and
  context loss use matching desktop/portrait WebP posters. The static fallback
  removes the hero pin and preserves the editorial chapter and all navigation.
- The masthead follows the reference's transparent layout, compact centered
  links and bronze rectangular CTA, keeping eco28 identity and studio sections.
  The ivory chapter changes navigation contrast; the mobile dialog retains its
  focus trap, Escape handling and inert background.

## Asset provenance

The architecture and furnishings extend the site's existing original concept
study. No client photographs, reference-site frames or downloaded villa model are
used as hero geometry. Client photos remain in the editorial/portfolio chapters.

The following assets are downloaded from the authors' public asset delivery URLs
and served locally in `public/media/hero-study/`:

| Files | Primary source | License |
| --- | --- | --- |
| `wood-color.jpg`, `wood-normal.jpg`, `wood-roughness.jpg` | [Wood Table 001](https://polyhaven.com/a/wood_table_001) | CC0 |
| `aerial_grass_rock.jpg` | [Aerial Grass Rock](https://polyhaven.com/a/aerial_grass_rock) | CC0 |
| `plastered_wall_04.jpg` | [Plastered Wall 04](https://polyhaven.com/a/plastered_wall_04) | CC0 |
| `sky.hdr` | [Kloppenheim 06 Pure Sky](https://polyhaven.com/a/kloppenheim_06_puresky) | CC0 |
| `exterior-poster.webp`, `exterior-poster-mobile.webp` | Captured from this original browser scene, without UI | Original render using the above materials |

[Poly Haven's asset license](https://polyhaven.com/license) permits commercial use,
modification and redistribution under CC0. Preview renders and website branding
are not included. The production textures are 1K; the HDRI is 1K. Approximately
3MB of scene assets replace downloading the previous 20.8MB desktop film on load.

The previous Pexels edit, its source record and paused-video implementation are
preserved (`docs/HERO_MEDIA_SOURCES.md`, `src/content/videoHero.ts`,
`useVideoScrub.ts`). Setting `heroWalkthrough.enabled` to false restores that
implementation; update the HTML poster preload alongside a deliberate change.

## Review

Run the production preview and `scripts/walkthrough-smoke.js` with Playwright CLI.
It checks idle stability, camera travel, exact reversal, the entrance position,
the ivory/nav transition, mid-pin resize, small screens, mobile menu focus,
context loss and reduced motion. `spatial-gallery-smoke.js` covers the preserved
43-image gallery. Engine emulation is distinct from real Safari/iOS/Android
hardware testing. The original reference recording remains outside deployment.
