# Asset usage

All 18 supplied originals are preserved. All have an accessible viewing path through `/work` and its full-frame keyboard lightbox. Photo-to-project associations are unconfirmed; categories are not commissions. Model images show a physical miniature, not a supplied 3D asset.

| Filename                             | Category      | Dimensions  | Use beyond Work gallery/lightbox                                      |
| ------------------------------------ | ------------- | ----------- | --------------------------------------------------------------------- |
| `exterior-front-twilight.webp`       | Architecture  | 1080 ? 471  | Home selected architecture                                            |
| `exterior-rear-facade.webp`          | Architecture  | 1080 ? 540  | Home opening Approach and facade finish; Studio banner                |
| `exterior-side-landscape.webp`       | Architecture  | 1080 ? 475  | Home ivory split composition; selected architecture; Studio expertise |
| `exterior-driveway-golden-hour.webp` | Architecture  | 1080 ? 607  | Home hero                                                             |
| `interior-bedroom-classic.webp`      | Interiors     | 1169 ? 590  | Home interior scene 3                                                 |
| `interior-bedroom-marble.webp`       | Interiors     | 904 ? 1280  | Work gallery / direct image link                                      |
| `interior-lounge-bar.webp`           | Interiors     | 1280 ? 639  | Home opening Atmosphere chapter; interior scene 2                     |
| `interior-display-wall.webp`         | Interiors     | 1280 ? 639  | Home materiality                                                      |
| `interior-bedroom-minimal.webp`      | Interiors     | 904 ? 1280  | Work gallery / direct image link                                      |
| `interior-bathroom-warmstone.webp`   | Interiors     | 904 ? 1280  | Home materiality                                                      |
| `interior-walkin-closet.webp`        | Interiors     | 1280 ? 639  | Home interior scene 4                                                 |
| `interior-reading-nook.webp`         | Interiors     | 1280 ? 639  | Home studio introduction                                              |
| `interior-study-shelf.webp`          | Interiors     | 1280 ? 639  | Work gallery / direct image link                                      |
| `interior-compact-bedroom.webp`      | Interiors     | 904 ? 1280  | Work gallery / direct image link                                      |
| `interior-dining-living.webp`        | Interiors     | 1280 ? 639  | Home opening Within chapter; interior scene 1; Studio expertise       |
| `model-front-facade.webp`            | Model Studies | 1363 ? 1136 | Home model grid and optional photo-plane canvas                       |
| `model-top-perspective.webp`         | Model Studies | 1302 ? 1068 | Home model grid and optional photo-plane canvas                       |
| `model-open-cross-section.webp`      | Model Studies | 1444 ? 1033 | Home model grid and optional photo-plane canvas                       |

## Export and loading choices

- Original SHA-256 hashes: all 18 match the supplied manifest. All 36 original/WebP image dimensions match the manifest.
- Original unchanged-size WebP total: 1,757,054 bytes (~1.68 MiB).
- `public/media`: 18 supplied WebPs plus 480px and 768px derivatives for each (54 files). Pillow LANCZOS, quality 82, method 6; original aspect ratios retained, no upscaling.
- Full hero/facade and lightbox use the original WebP sources. Gallery/editorial photography uses responsive srcset and sizes. Hero is eager/high priority; lower images are lazy with reserved dimensions.
- Canvas uses only the three model WebPs as textures. A same-image DOM fallback and actual gallery links preserve accessibility.
- Original JPEGs, client filename hashes and reference MP4 are not copied into `public`/`dist`. The manifest is imported as source metadata; upload filenames/hashes are not used as public project descriptions.
- No stock photography, AI imagery, new architectural geometry or reference-property imagery has been added.
- All photographic descriptions derive from the supplied manifest. Generic display labels describe images, not real project names.
- Publication permission/photographer credit and higher-resolution masters remain client actions.
