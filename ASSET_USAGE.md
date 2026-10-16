# Asset usage

All 43 client photographs remain accessible through `/#work` and its keyboard lightbox. Project associations are unconfirmed; categories do not represent commissions.

| Collection | Photographs | Canonical web location | Source masters |
| --- | ---: | --- | --- |
| Original handoff | 18 | `public/media/*.webp` | `client_assets/originals/*.jpg` |
| Supplemental client collection | 25 | `public/media/supplemental/*.webp` | Local-only `DesktopAssests/` |

The gallery contains 11 architecture, 25 interior and 7 physical-model photographs. Descriptions and original-image dimensions/hashes are recorded in `docs/ASSET_MANIFEST.json` and `src/content/media.ts`. Every manifest `web_ready_path` points to its canonical file in `public/media`.

## Loading and responsive versions

Each full-size WebP has 480px and 768px variants for responsive `srcSet`. These are intentionally different image sizes, not duplicate copies. The 18 identical copies formerly in `client_assets/web_ready` were removed after SHA-256 comparison with the public originals; 1,757,054 bytes of redundant files were removed.

The lightbox uses full-resolution client images. Gallery/editorial photographs load lazily with reserved dimensions. The supplemental collection is optimized separately with the same responsive path convention. Unique JPEG masters are retained; source masters and reference recordings are never deployed. The hero uses a separate licensed film and its first-frame poster.

## Motion and 3D

`src/content/videoHero.ts` selects the independent 29.17s exterior-to-interior film, mobile encode and first-frame poster. No client photographs are used in the film or its failure fallback. Client photos begin in the separate ivory editorial chapter and continue throughout the portfolio; category counts remain unchanged.

The physical-model canvas maps client photographs to planes. The separate housing canvas uses original procedural geometry requested by the user, prominently labelled a conceptual study, not a client project. Both use demand rendering and provide fallbacks; see `ANIMATION_SPEC.md`.

`references/` retains the supplied video and contact sheets for design review. The reference recording depicts another site and is never used as production footage. The user authorized free stock footage for the replacement hero on 2026-10-15. See `docs/HERO_MEDIA_SOURCES.md` for the three 4K Pexels sources, photographer credit and license record. Stock media is not added to the client portfolio. No AI generation was used for this film.

Publication permission, photographer credits and higher-resolution masters remain launch requirements in `CLIENT_ACTION_REQUIRED.md`.

The former `hero_exterior_to_interior_scrub.mp4`, its mobile derivative and poster are preserved in `references/retired_hero/`, outside production. Current hero assets are in `public/media/hero-film/`: a 1080p desktop film, 540p mobile film and independent poster. Typography remains selectable HTML.


## Earlier single-storey concept hero (historical)

The active hero uses the existing original courtyard-house geometry with local CC0 materials/environment maps, not client photographs or reference-video frames. All 43 client photos remain in the chapters and selected-work gallery below. See `docs/HERO_WALKTHROUGH.md` for the material/license table, matching generated scene posters and the distinction between concept geometry and client work. The earlier Pexels media remains preserved.

## Active four-storey residence

`ResidenceModel.ts` contains the original, editable four-storey geometry, furniture, foliage and generated stone/fabric/artwork textures. The hero reuses local Poly Haven CC0 oak maps, grass and sky HDRI. The two `residence-poster*.webp` files are captures of this same scene. No reference frames, stock photographs or unrelated interiors are used. See [HERO_IMPLEMENTATION.md](HERO_IMPLEMENTATION.md) for exact sources, licensing and render limitations. Older media remains preserved but is not requested by the active hero.
