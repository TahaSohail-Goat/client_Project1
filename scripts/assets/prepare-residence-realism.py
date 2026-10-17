"""Download documented, licensed source assets; cache masters outside deployment.

Run this, then `node scripts/assets/optimize-residence-models.mjs`. No paid APIs or keys.
Poly Haven assets are CC0. The Wayfair sofa is CC-BY-4.0; see ATTRIBUTION.txt.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
import struct
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "output" / "residence-source-assets"
DEST = ROOT / "public" / "media" / "residence-realism"
HEADERS = {"User-Agent": "eco28-architectural-visualization/1.0", "Accept": "application/json"}

def download(url, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        target.write_bytes(urlopen(Request(url, headers=HEADERS), timeout=90).read())
    return target.read_bytes()

def metadata(name):
    return json.loads(download("https://api.polyhaven.com/files/" + name, CACHE / (name + ".json")))

def model(name):
    entry = metadata(name)["gltf"]["1k"]["gltf"]
    local = CACHE / name
    data = download(entry["url"], local / "source.gltf")
    gltf = json.loads(data)
    includes = entry["include"]
    jobs = [(includes[path]["url"], local / path) for path in
            [x["uri"] for x in gltf.get("buffers", []) + gltf.get("images", [])]]
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(lambda job: download(*job), jobs))
    # Keep glTF image URIs consistent, shrink 1K source textures to web-friendly JPEGs.
    for image in gltf.get("images", []):
        source = local / image["uri"]
        out = DEST / name / image["uri"]
        out.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(source)
        if im.mode in ("RGBA", "LA"):
            im.save(out, optimize=True)
        else:
            im.convert("RGB").save(out, quality=88, optimize=True)
    print("Downloaded model:", name, flush=True)
    return {"asset": name, "source": "https://polyhaven.com/a/" + name, "license": "CC0-1.0"}

def texture(name, stem, channels):
    data = metadata(name)
    sources = []
    for channel, output in channels.items():
        entry = data[channel]["1k"]["jpg"]
        source = download(entry["url"], CACHE / "textures" / (stem + "-" + output + ".jpg"))
        image = Image.open(BytesIO(source)).convert("RGB")
        # Fine repeat patterns do not need a full 1K normal texture in the browser.
        if output == "normal" and stem in ("grass", "linen", "oak"):
            image.thumbnail((512,512), Image.Resampling.LANCZOS)
        # WebP is lossless for normal vectors; color/roughness can use perceptual compression.
        image.save(DEST / (stem + "-" + output + ".webp"), format="WEBP",
                   lossless=output == "normal", quality=87, method=6)
        sources.append(entry["url"])
    print("Prepared PBR:", name, flush=True)
    return {"asset": name, "source": "https://polyhaven.com/a/" + name, "license": "CC0-1.0", "files": sources}

def sofa():
    url = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb"
    raw = download(url, CACHE / "sofa.glb")
    length = struct.unpack_from("<I", raw, 12)[0]
    data = json.loads(raw[20:20+length])
    binary = raw[28+length:]
    folder = DEST / "sofa"
    folder.mkdir(parents=True, exist_ok=True)
    for i, image in enumerate(data["images"]):
        view = data["bufferViews"][image["bufferView"]]
        image_data = binary[view.get("byteOffset", 0):view.get("byteOffset", 0)+view["byteLength"]]
        im = Image.open(BytesIO(image_data)).convert("RGB")
        im.thumbnail((768,768), Image.Resampling.LANCZOS)
        name = f"texture-{i}.webp"
        im.save(folder / name, format="WEBP", quality=90, method=6)
        image.clear()
        image.update({"uri": name, "mimeType": "image/webp"})
    # Required extension makes WebP use explicit to glTF consumers.
    for t in data["textures"]:
        t.setdefault("extensions", {})["EXT_texture_webp"] = {"source": t.pop("source")}
    for key in ["extensionsUsed", "extensionsRequired"]:
        data.setdefault(key, []).append("EXT_texture_webp")
    data["buffers"] = [{"uri": "source.bin", "byteLength": len(binary)}]
    # Remove authoring/demo lights. The residence owns all illumination.
    for n in data.get("nodes", []):
        if "KHR_lights_punctual" in n.get("extensions", {}):
            n["extensions"].pop("KHR_lights_punctual")
    (CACHE / "sofa").mkdir(exist_ok=True)
    (CACHE / "sofa" / "source.gltf").write_text(json.dumps(data), encoding="utf-8")
    (CACHE / "sofa" / "source.bin").write_bytes(binary)
    return {"asset": "GlamVelvetSofa", "source": url, "license": "CC-BY-4.0", "author": "Eric Chadwick / Wayfair, LLC", "changes": "Textures optimized; demo light removed; fabric recolored to warm neutral."}

if __name__ == "__main__":
    DEST.mkdir(parents=True, exist_ok=True)
    assets = [model(name) for name in ["mid_century_lounge_chair", "potted_plant_01", "potted_plant_04", "island_tree_02", "dining_chair_02"]]
    assets.append(sofa())
    for name, stem in [("marble_01", "limestone"), ("oak_veneer_01", "oak"), ("rough_linen", "linen"), ("grass_ground", "grass")]:
        data = metadata(name)
        # API channel capitalization differs between asset releases.
        diffuse = next(k for k in data if k.lower() in ("diffuse", "diff"))
        rough = next(k for k in data if k.lower() == "rough")
        assets.append(texture(name, stem, {diffuse: "color", "nor_gl": "normal", rough: "roughness"}))
    sky = metadata("kloppenheim_06")["hdri"]["1k"]["hdr"]
    download(sky["url"], DEST / "garden-sky.hdr")
    assets.append({"asset": "kloppenheim_06", "source": sky["url"], "license": "CC0-1.0"})
    plaster = "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/plastered_wall_04/plastered_wall_04_diff_1k.jpg"
    download(plaster, ROOT / "public/media/hero-study/plastered_wall_04.jpg")
    assets.append({"asset": "plastered_wall_04", "source": "https://polyhaven.com/a/plastered_wall_04", "license": "CC0-1.0", "files": [plaster]})
    (DEST / "sources.json").write_text(json.dumps(assets, indent=2), encoding="utf-8")
    (DEST / "ATTRIBUTION.txt").write_text(
        "RESIDENCE VISUAL ASSET CREDITS\n\n"
        "GlamVelvetSofa — Eric Chadwick / Wayfair, LLC (2021)\n"
        "Licensed under Creative Commons Attribution 4.0 International.\n"
        "https://creativecommons.org/licenses/by/4.0/\n"
        "Source: https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa\n"
        "Changes: textures optimized, demo light removed, geometry repacked, fabric recolored.\n\n"
        "Poly Haven assets: CC0 — https://polyhaven.com/license\n"
        "Mid Century Lounge Chair: Kuutti Siitonen.\n"
        "Dining Chair 02: James Ray Cock.\n"
        "Potted Plant 01: Rico Cilliers. Potted Plant 04: James Ray Cock.\n"
        "Island Tree 02: Rob Tuytel and Rico Cilliers.\n"
        "Surface and HDRI sources: see sources.json in this directory.\n"
        "Geometry simplification and texture optimization are local modifications.\n\n"
        "The residence is an original concept visualization, not a verified completed client project.\n",
        encoding="utf-8")
    print("Source assets ready; run node scripts/assets/optimize-residence-models.mjs", flush=True)
