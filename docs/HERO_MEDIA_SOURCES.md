# Retained independent hero film

The active hero is now the continuous concept walkthrough described in [HERO_WALKTHROUGH.md](HERO_WALKTHROUGH.md). The following records the preserved earlier film configuration.

The client authorized free internet-sourced footage for the hero on 2026-10-15.
The client photographs remain the portfolio collection; this film is an independent
visual study, not a claim that eco28 designed the property shown.

## Source and rights record

All three 3840 × 2160, 25fps masters are by **Rene Strgar**, obtained from Pexels:

| Asset | Source | Edit |
| --- | --- | --- |
| 34874522 | [Outdoor patio](https://www.pexels.com/video/luxurious-outdoor-patio-with-scenic-view-34874522/) | 0.30–9.40s |
| 34874523 | [Villa interior](https://www.pexels.com/video/modern-luxury-villa-with-ocean-view-interiors-34874523/) | 0.30–12.10s |
| 34874524 | [Living-room interior](https://www.pexels.com/video/modern-minimalist-villa-living-room-interior-34874524/) | 0.20–9.80s |

[Pexels License](https://www.pexels.com/license/), checked 2026-10-15: free website
use and modification are permitted; attribution is appreciated but not required.
Do not imply endorsement, present this property as an eco28 commission, or resell
the unmodified source clips as stock. The production edit is served locally.

The matching glazing, pendant lights, furniture and stone terrace provide visual
continuity. Two 0.65s dissolves join the footage. This is an **edited exterior-to-interior
sequence**, not a single uninterrupted camera flight or an AI reconstruction.
The original 4K sources remain in ignored `output/hero-research/`.

## Production assets

`scripts/build-hero-film.py` creates a roughly 29.2s, silent, 24fps H.264 film:

- `public/media/hero-film/spatial-journey.mp4`: 1920 × 1080, keyframe every 6 frames.
- `public/media/hero-film/spatial-journey-mobile.mp4`: 960 × 540, keyframe every 4 frames.
- `public/media/hero-film/terrace-poster.webp`: first frame, also the static/failure fallback.

Typography is selectable HTML and is never baked into the film. No client images,
reference-site media, fabricated projects or property-sales content enter the hero.

Rebuild with `python scripts/build-hero-film.py` after installing `imageio-ffmpeg`.
