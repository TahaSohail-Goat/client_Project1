# Residence hero

The opening is a reversible journey through one original four-storey concept residence. One Three.js world contains the exterior, furnished rooms, connected stairs, and terrace. It is labelled as a concept visualization.

## Source map

| File | Responsibility |
| --- | --- |
| `src/components/home/HeroScene.tsx` | Scroll pin, opening copy, loading/fallback, and editorial transition |
| `src/content/heroWalkthrough.ts` | Camera beats, labels, world anchors, and scroll budgets |
| `src/components/three/ResidenceModel.ts` | Architectural geometry and moving entrance |
| `src/components/three/ResidenceAssets.ts` | Licensed furniture and plant models |
| `src/components/three/ResidenceMaterials.ts` | Architectural surface palette |
| `src/components/three/ResidenceFinish.tsx` | Contact shading, tone mapping, and antialiasing |
| `src/components/three/HeroWalkthroughCanvas.tsx` | Camera interpolation, lighting, renderer lifecycle, and callout projection |

Floor surfaces are at 0, 3.5, 7, and 10.5 metres. Each ascent follows the same two-flight stair and intermediate landing. The house is approximately 14 × 11 metres, with eye height around 1.65 metres. Monotone cubic Hermite interpolation limits positional overshoot.

## Sequence

| Scene progress | View |
| --- | --- |
| 0–12% | Residence and landscaped approach |
| 12–22% | Entrance alignment and opening glass leaf |
| 22–36.2% | Ground-floor living, dining, and kitchen |
| 36.2–50% | First-floor lounge and guest suite |
| 50–64.1% | Second-floor master suite, dressing, and bathroom |
| 64.1–78.4% | Third-floor study and sky terrace |
| 78.4–100% | Pullback to the exterior |

The hero pin spans 9.2 extra desktop viewports or 8.6 mobile viewports. The residence occupies the first 82% of the full pin, followed by the ivory editorial reveal. The camera only advances with document scroll. Resize restoration preserves the current journey position; navigation takes precedence.

## Rendering and fallback

Local PBR maps, authored furniture, foliage, area fills, HDR lighting, and AgX output support the real-time scene. Static geometry is merged by material and floor. Desktop uses bounded contact shading and multisampling; mobile uses native antialiasing and portrait framing. Glass, foliage cutouts, and emissive fixtures are excluded from the ambient-occlusion normal override.

The scene renders on demand. Canvas DPR is capped at 1.5, desktop postprocessing at 1.25; shadow maps are 2048px on desktop and 1024px on mobile. Materials compile asynchronously before the first reveal. Matching desktop/mobile posters cover loading.

Reduced motion, Save-Data, viewport height of 500px or less, initialization failure, and WebGL context loss show the same-house poster with ordinary content and navigation. No video or image-sequence fallback is shipped.

## Maintenance

Keep camera positions and callout anchors aligned with the actual openings and floor heights. Replace geometry and camera configuration together when adopting an approved client model. Keep metre-scale coordinates and optimize texture sizes, meshes, and lighting before delivery.

See [asset preparation and licensing](assets.md). Run the [residence and cinematic browser checks](testing.md) after changes, including reverse scrolling, intermediate resize, reduced motion, and forced graphics failure.

This is a real-time browser visualization with environment-reflected glass and simplified foliage. Offline path-traced fidelity and physical-device frame rates are separate production goals. See the [QA limitations](qa-report.md).
