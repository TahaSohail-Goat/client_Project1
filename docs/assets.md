# Assets and provenance

## Published collection

`public/media/` contains the current website assets:

| Location | Purpose |
| --- | --- |
| Root photo WebPs | 18 photographs from the original client collection |
| `supplemental/` | 25 additional client photographs |
| `brand/` | Transparent dark/light logo and light footer wordmark SVGs |
| `hero-study/` | Desktop/mobile residence posters and the plaster surface map |
| `residence-realism/` | Furniture, plants, PBR textures, HDR environment, and credits |

Each client photograph has full-size, 768px, and 480px WebP exports. These are responsive variants; keep all three. Exports retain source aspect ratios. `PhotoImage` selects an appropriate size, while the lightbox uses the full-size image.

The 43-photo collection comprises 11 architecture, 25 interior, and 7 physical-model photographs. Original photo descriptions, dimensions, filenames, and checksums are retained in [`photo-manifest.json`](../src/content/photo-manifest.json); supplemental metadata is in [`media.ts`](../src/content/media.ts). Client publication rights and photographer credits still require approval. Images are grouped by discipline because their project associations have not been confirmed.

## Brand

The logo comes from the client-supplied Illustrator PDF. Its vector paths and wordmark opacity mask are preserved; the page background is omitted. The mountain symbol supplies `public/favicon.svg`.

The source PDF is preserved locally at `.local/source-assets/eco28-logo.pdf`. To regenerate the SVG exports:

```sh
python -m pip install -r scripts/assets/requirements.txt
python scripts/assets/prepare-brand-logo.py
```

The optional `export-brand-logo.js` Playwright function produces a transparent PNG in ignored `output/brand/` when needed for external use. The website uses SVGs.

## Residence credits

The residence shell is original procedural geometry, presented as a concept visualization. It is separate from the client photo collection.

- Poly Haven furniture, plants, surface maps, and HDR lighting are CC0. Exact sources are recorded in [`sources.json`](../public/media/residence-realism/sources.json).
- GlamVelvetSofa is by Eric Chadwick / Wayfair, LLC under CC BY 4.0. Modifications and attribution remain in [`ATTRIBUTION.txt`](../public/media/residence-realism/ATTRIBUTION.txt), which is linked from the hero.
- The plaster map is [Plastered Wall 04](https://polyhaven.com/a/plastered_wall_04), also CC0.
- Residence posters are captures of the same browser scene, without interface overlays.

Do not remove the credits or glTF-relative texture/buffer files when optimizing the asset directory.

Optional rebuild tools:

```sh
python scripts/assets/prepare-residence-realism.py
node scripts/assets/optimize-residence-models.mjs
```

Source downloads are cached in ignored `output/residence-source-assets/`. Rebuilding assets requires internet access; normal builds use the checked-in exports. Recapture desktop and mobile posters after changing the residence.

## Local source archive

Original JPEGs, the supplied logo PDF, supplemental masters, and reference recordings are preserved under `.local/source-assets/`. Reference recordings are motion inspiration and are not website footage. Retired hero films, superseded scripts, and historical handoff documents are in `.local/archive/2026-10-17/`, with a move inventory.

These ignored local files are not part of a fresh clone or deployment. Obtain the approved source masters separately when replacing client assets. The active site builds entirely from `src/` and `public/`.
