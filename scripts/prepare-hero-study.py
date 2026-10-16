"""Fetch the exact CC0 source maps used by the original concept hero.

See docs/HERO_WALKTHROUGH.md. Posters are captures of the website's scene, not
third-party photographs. No credentials or paid services are used.
"""
from pathlib import Path
from urllib.request import Request, urlopen

DEST = Path(__file__).resolve().parents[1] / "public" / "media" / "hero-study"
BASE = "https://dl.polyhaven.org/file/ph-assets/"
FILES = {
    "wood-color.jpg": "Textures/jpg/1k/wood_table_001/wood_table_001_diff_1k.jpg",
    "wood-normal.jpg": "Textures/jpg/1k/wood_table_001/wood_table_001_nor_gl_1k.jpg",
    "wood-roughness.jpg": "Textures/jpg/1k/wood_table_001/wood_table_001_rough_1k.jpg",
    "aerial_grass_rock.jpg": "Textures/jpg/1k/aerial_grass_rock/aerial_grass_rock_diff_1k.jpg",
    "plastered_wall_04.jpg": "Textures/jpg/1k/plastered_wall_04/plastered_wall_04_diff_1k.jpg",
    "sky.hdr": "HDRIs/hdr/1k/kloppenheim_06_puresky_1k.hdr",
}

if __name__ == "__main__":
    DEST.mkdir(parents=True, exist_ok=True)
    for name, suffix in FILES.items():
        target = DEST / name
        if not target.exists():
            with urlopen(Request(BASE + suffix, headers={"User-Agent": "eco28-asset-preparation/1.0"}), timeout=45) as response:
                target.write_bytes(response.read())
        print(f"{name}: {target.stat().st_size} bytes")
