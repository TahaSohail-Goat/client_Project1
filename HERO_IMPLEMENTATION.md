# Four-storey residence hero

The homepage now has a continuous, scroll-controlled journey through one original
four-storey residence. This is explicitly a **concept visualization**, not a
verified eco28 commission. The supplied 4.72-second WhatsApp screen recording was
decoded at half-second intervals for motion analysis; none of its frames or audio
is shipped as website media.

## Architecture and rendering

The existing React 19 / TypeScript / Vite site, Three.js 0.180, R3F 9, Drei 10,
GSAP ScrollTrigger and Lenis are retained. No dependency was added. One real-time
scene is the primary strategy: all rooms, glazing, stair flights and exterior
geometry coexist in the same world. There are no interior photo swaps, wall
fades, teleporting camera cuts, pre-rendered sequences or automatic playback.

`ResidenceModel.ts` is the editable architectural source. The 14 m × 11 m house
has floor surfaces at **0, 3.5, 7 and 10.5 m**. Split slabs surround a real
two-flight stairwell with intermediate and floor landings. A solid ground slab
supports the foyer and stair; the upper flights connect through the same void.
The study, lounge and planted pergola terrace share the third floor. The roof
ends that storey; there is no fifth habitable level.

Materials include textured limestone, plaster, oak joinery, bronze frames,
transparent glazing, woven rugs and upholstery. Furnishings include rounded
sofas and beds, tableware, books, hanging clothes, a bath, artwork, ring pendants,
cove lighting, plants, balcony furniture and a reflecting pool. Geometry is
merged by material and level to limit draw calls while preserving floor culling.
Desktop uses bounded SSAO contact shading, multisampling and filmic color output.
Mobile omits postprocessing and uses the renderer's native antialiasing.

## Camera and scene structure

`src/content/heroWalkthrough.ts` owns camera beats, labels, world anchors and scroll
budgets. Monotone cubic Hermite interpolation avoids positional overshoot at
landings. Eye height is approximately 1.65 m. The three upward transitions follow
the actual U-shaped stair flights; the camera passes through the open entrance
and reaches the upper terrace before pulling out above its guardrail.

| Scene progress | View |
| --- | --- |
| 0–12% | Complete residence and landscaped approach |
| 12–22% | Entrance alignment; glass leaf opens at 14.5–19.7% |
| 22–36.2% | Ground floor: formal living, dining and kitchen |
| 36.2–50% | Stair ascent, first-floor family lounge and guest suite |
| 50–64.1% | Stair ascent, second-floor master suite, dressing and bath |
| 64.1–77% | Stair ascent and third-floor study |
| 77–89% | Third-floor sky lounge, planted terrace and outward move |
| 89–100% | Same exterior, four floor callouts and studio project CTA |

`HeroScene` retains the existing single GSAP pin. The first 82% drives the residence;
the last 18% reveals the site's existing ivory editorial chapter. Desktop adds
9.2 viewport heights and mobile 8.6. At a deliberate 200–300 px/s desktop pace,
the camera journey is approximately 25–35 seconds; scroll speed remains entirely
the visitor's choice. Reversing scroll samples exactly the same route. The existing
desktop Lenis integration and native mobile document scrolling remain in use.

`ResidenceOverlay` provides HTML chapter/floor typography and an SVG annotation
layer. Each callout starts from a genuine world coordinate projected by the
current Three.js camera. Labels fade with scene progress and are hidden behind
the camera or outside the frame. Mobile uses compact floor markers and smaller,
clamped callout text. Essential content also has a screen-reader description;
decorative rendering and projected overlays are hidden from assistive technology.

## Assets and licenses

Everything is served locally, with no runtime third-party asset requests.

| Asset | Source and rights |
| --- | --- |
| Geometry, furniture, artwork, stone and fabric patterns | Original procedural source in `ResidenceModel.ts`; no purchased model or stock property imagery |
| `wood-color.jpg`, `wood-normal.jpg`, `wood-roughness.jpg` | [Poly Haven Wood Table 001](https://polyhaven.com/a/wood_table_001), CC0 |
| `aerial_grass_rock.jpg` | [Poly Haven Aerial Grass Rock](https://polyhaven.com/a/aerial_grass_rock), CC0 |
| `sky.hdr` | [Poly Haven Kloppenheim 06 Pure Sky](https://polyhaven.com/a/kloppenheim_06_puresky), CC0 |
| `residence-poster.webp`, `residence-poster-mobile.webp` | Browser captures of this same original scene, without interface overlays |

[Poly Haven's license](https://polyhaven.com/license) permits commercial use,
modification and redistribution; attribution is appreciated, not required.
Existing 1K source textures were reused from the local project; their download
URLs are retained in `scripts/prepare-hero-study.py`. The unused plaster texture,
old single-storey posters and earlier licensed film remain preserved. They are
not requested by the new hero. The client's 43-photo portfolio remains separate.

## Loading, accessibility and performance

- The matching poster appears immediately and remains beneath the scene until its
  first rendered frame. Desktop and mobile poster selection uses `<picture>` and
  a matching initial preload. Camera movement never advances itself.
- Geometry and texture preparation are bounded; the scene renders on demand.
  Canvas DPR is capped at 1.5; desktop postprocessing at 1.25. Directional shadow
  maps are 2048 desktop / 1024 mobile and static shadows are reused.
- A portrait exterior camera pulls back and lowers its target independently of
  the interior eye-height route. It does not scale the desktop composition down.
- Reduced motion, Save-Data, viewport height ≤500 px, initialization failure or
  WebGL context loss removes the hero pin/canvas and shows the same-house poster.
  Navigation, original hero links and the editorial chapter remain available.
- No video decoder, image-sequence frame cache, new smoothing system or paid
  generation service is introduced. The existing shared Three.js bundle remains
  substantial; slow devices use the static path where requested or necessary.

## Verification and review

Run `npm run typecheck`, `npm run lint`, `npm run build`, then `npm run preview`.
If Windows is under memory pressure, use `NODE_OPTIONS=--max-old-space-size=2048`
for the build process. This is an environment setting, not an application change.

With Playwright CLI open on port 4173:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=residence open http://127.0.0.1:4173/
npx --yes --package @playwright/cli playwright-cli -s=residence run-code --filename=scripts/residence-smoke.js
```

The script checks desktop/laptop/320 px/390 px layouts, all four floor elevations,
chapter boundaries, idle stability, entrance crossing, exact reverse poses, real
wheel scrolling, interrupted rapid scroll, mid-journey resize, editorial release,
mobile navigation, context-loss fallback, reduced motion and asset/runtime errors.
Screenshots are written under `output/playwright/residence-*`. The older
`walkthrough-smoke.js` targets the superseded single-storey route. The separate
`spatial-gallery-smoke.js` exercises the retained portfolio.

Verified locally in Chromium on 2026-10-16 (Asia/Karachi): 1440×900 desktop,
1280×720 laptop, 390×844 and 320×568 mobile viewports. All residence smoke checks
passed, including exact settled reverse poses and zero mobile horizontal overflow.
No page errors, failed assets or normal runtime warnings were recorded. A Three.js
cleanup notice after deliberately losing the WebGL context is recorded separately
in `output/playwright/residence-qa.json`. After the final foreground-foliage polish,
sampled desktop frames used 109–172 draw calls and approximately 403k–458k rendered
triangles including the AO passes (`residence-final-visual-qa.json`);
these are local rendering counts, not a guaranteed frame rate or hardware test.
Type checking, lint and the production build pass. Vite retains its size advisory
for the shared Three.js bundle (approximately 989 kB / 272 kB gzip).
The existing gallery regression also passes: eight layouts, interrupted layout
changes, drag/keyboard/lightbox interaction, category counts (11/25/7), all 43
decoded images, both mobile widths and the reduced-motion photo grid.

## Replacing the demonstration residence

Replace `buildResidence` with a locally optimized, licensed GLB containing one
coherent exterior/interior scene, keeping metre-scale coordinates and four floor
heights or updating the camera configuration accordingly. Preserve genuine door
and stair openings. Retarget camera positions/look targets and callout anchors to
the supplied plan; do not compensate with unrelated interior photographs. Bake
lighting where appropriate, merge static meshes and compress textures. Recapture
both posters from the final scene and rerun visual and browser QA. Keep client
approval/provenance records before changing the concept label to a project name.

## Known limitations

This is a detailed **real-time procedural architectural visualization**, with an
intentionally restrained material/furniture vocabulary. It is **not a photorealistic
offline architectural film**, and does not match the reference's polished offline
lighting, vegetation or bespoke furniture fidelity. Browser continuity and all
eight story stages are implemented; attaining that higher visual benchmark still
requires professional asset/art-direction work and baked lighting or an offline
render pass from the same scene. No Blender/render-farm pipeline is installed or
claimed. Glass uses inexpensive environment reflections; mirrors and the pool
are not ray-traced. SSAO can show slight halos around thin glazing. Physical
Safari/iPhone and midrange Android performance still require real-device review.
Nothing has been deployed.
