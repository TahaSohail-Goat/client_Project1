"""Export the supplied Illustrator PDF as transparent website assets.

Preserve its original vector paths and the existing wordmark opacity mask.
Requires PyMuPDF. No generated artwork or background-removal inference is used.
Rasterize the finished SVG with scripts/assets/export-brand-logo.js via Playwright CLI
when a PNG is needed; this avoids the source raster's white matte fringe.
"""
from copy import deepcopy
from pathlib import Path
import xml.etree.ElementTree as ET

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / ".local/source-assets/eco28-logo.pdf"
DEST = ROOT / "public/media/brand"
NS = "http://www.w3.org/2000/svg"
XLINK = "http://www.w3.org/1999/xlink"
ET.register_namespace("", NS)
ET.register_namespace("xlink", XLINK)


def svg(viewbox, width, height):
    return ET.Element(f"{{{NS}}}svg", {
        "viewBox": viewbox, "width": str(width), "height": str(height),
    })


def save(root, path):
    ET.indent(root)
    path.write_text(ET.tostring(root, encoding="unicode") + "\n", encoding="utf-8")


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(SOURCE)
    page = doc[0]
    native = ET.fromstring(page.get_svg_image())
    paths = [p for p in native.iter(f"{{{NS}}}path") if "fill" in p.attrib]
    mask = deepcopy(next(native.iter(f"{{{NS}}}mask")))
    mask.set("id", "wordmark-opacity")
    for image in mask.iter(f"{{{NS}}}image"):
        href = f"{{{XLINK}}}href"
        image.set(href, "".join(image.get(href, "").split()))
        image.attrib.pop("id", None)

    def wordmark(root, color):
        defs = ET.SubElement(root, f"{{{NS}}}defs")
        defs.append(deepcopy(mask))
        ET.SubElement(root, f"{{{NS}}}rect", {
            "x": "128.48845", "y": "467.69209", "width": "850.96222",
            "height": "601.72845", "fill": color,
            "mask": "url(#wordmark-opacity)",
        })

    for name, light in [("eco28-logo.svg", False), ("eco28-logo-light.svg", True)]:
        root = svg("100 208 888 624", 888, 624)
        for source in paths:
            path = deepcopy(source)
            if light and path.get("fill") in ("#424342", "#454545"):
                path.set("fill", "#f2ede5")
            root.append(path)
        wordmark(root, "#f2ede5" if light else "#030404")
        save(root, DEST / name)

    root = svg("170 664 765 168", 765, 168)
    wordmark(root, "#f2ede5")
    save(root, DEST / "eco28-wordmark-light.svg")

    icon = svg("84 -15 920 920", 64, 64)
    style = ET.SubElement(icon, f"{{{NS}}}style")
    style.text = "@media(prefers-color-scheme:dark){.neutral{fill:#f2ede5}}"
    for source in paths:
        path = deepcopy(source)
        if path.get("fill") in ("#424342", "#454545"):
            path.set("class", "neutral")
        icon.append(path)
    save(icon, ROOT / "public/favicon.svg")

    for path in sorted(DEST.iterdir()):
        print(path.relative_to(ROOT), path.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
