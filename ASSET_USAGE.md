# Asset usage

All 43 client photographs remain accessible through `/#work` and its keyboard lightbox. Project associations are unconfirmed; categories do not represent commissions.

| Collection | Photographs | Canonical web location | Source masters |
| --- | ---: | --- | --- |
| Original handoff | 18 | `public/media/*.webp` | `client_assets/originals/*.jpg` |
| Supplemental client collection | 25 | `public/media/supplemental/*.webp` | Local-only `DesktopAssests/` |

The gallery contains 11 architecture, 25 interior and 7 physical-model photographs. Descriptions and original-image dimensions/hashes are recorded in `docs/ASSET_MANIFEST.json` and `src/content/media.ts`. Every manifest `web_ready_path` points to its canonical file in `public/media`.

## Loading and responsive versions

Each full-size WebP has 480px and 768px variants for responsive `srcSet`. These are intentionally different image sizes, not duplicate copies. The 18 identical copies formerly in `client_assets/web_ready` were removed after SHA-256 comparison with the public originals; 1,757,054 bytes of redundant files were removed.

The hero and lightbox use full-resolution images. Lower gallery/editorial photographs load lazily with reserved dimensions. The supplemental collection is optimized separately with the same responsive path convention. Unique JPEG masters are retained; source masters and reference recordings are never deployed.

## Motion and 3D

`src/content/videoHero.ts` selects the supplied MP4, mobile encode and first-frame poster. `src/content/hero.ts` retains the photographic fallback journey. Image categories do not establish a shared commission or a real outside-to-inside walkthrough.

The physical-model canvas maps client photographs to planes. The separate housing canvas uses original procedural geometry requested by the user, prominently labelled a conceptual study, not a client project. Both use demand rendering and provide fallbacks; see `ANIMATION_SPEC.md`.

`references/` retains the supplied video and contact sheets for design review. The reference video depicts another site and is never used as production footage. No stock or AI photography is included.

Publication permission, photographer credits and higher-resolution masters remain launch requirements in `CLIENT_ACTION_REQUIRED.md`.

The newly supplied hero_exterior_to_interior_scrub.mp4 is authorized for the homepage hero and is preserved unchanged as its canonical desktop asset in public/media/video/. The 768px mobile rendition is an intentional derivative for smaller downloads and decode cost. Neither film has embedded typography; all headings remain HTML.
