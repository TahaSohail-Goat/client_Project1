"""Rebuild the licensed, typography-free hero edit. Requires imageio-ffmpeg.

Source masters are cached in ignored output/hero-research, never in the client
portfolio or production bundle. See docs/HERO_MEDIA_SOURCES.md for licensing.
"""
from pathlib import Path
import json
import subprocess
import urllib.request
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "output" / "hero-research"
DEST = ROOT / "public" / "media" / "hero-film"
SOURCES = [
    ("34874522", "https://videos.pexels.com/video-files/34874522/14777087_3840_2160_25fps.mp4", .3, 9.4),
    ("34874523", "https://videos.pexels.com/video-files/34874523/14777097_3840_2160_25fps.mp4", .3, 12.1),
    ("34874524", "https://videos.pexels.com/video-files/34874524/14777099_3840_2160_25fps.mp4", .2, 9.8),
]

def run(args):
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "warning", "-y", *args], check=True)

def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    DEST.mkdir(parents=True, exist_ok=True)
    inputs = []
    for asset, url, _, _ in SOURCES:
        path = CACHE / f"pexels-{asset}.mp4"
        if not path.exists() or not path.stat().st_size:
            print(f"Downloading licensed source {asset}", flush=True)
            urllib.request.urlretrieve(url, path)
        inputs += ["-threads", "2", "-i", str(path)]
    for name, width, height, crf, gop in [
        ("spatial-journey", 1920, 1080, 23, 6),
        ("spatial-journey-mobile", 960, 540, 25, 4),
    ]:
        print(f"Encoding {name} ({width}x{height})", flush=True)
        filters = []
        for index, (_, _, start, end) in enumerate(SOURCES):
            filters.append(
                f"[{index}:v]trim=start={start}:end={end},setpts=PTS-STARTPTS,"
                f"scale={width}:{height}:flags=lanczos,setsar=1,fps=24,settb=AVTB,"
                f"format=yuv420p,eq=contrast=1.025:saturation=0.94[v{index}]"
            )
        filters += [
            "[v0][v1]xfade=transition=fade:duration=0.65:offset=8.45[first]",
            "[first][v2]xfade=transition=fade:duration=0.65:offset=19.6,format=yuv420p[film]",
        ]
        run([*inputs, "-filter_complex_threads", "1", "-filter_complex", ";".join(filters),
             "-map", "[film]", "-an", "-c:v", "libx264", "-threads", "2", "-preset", "medium",
             "-crf", str(crf), "-g", str(gop), "-keyint_min", str(gop), "-sc_threshold", "0",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-metadata", "title=Spatial journey — licensed visual study",
             str(DEST / f"{name}.mp4")])
    run(["-i", str(DEST / "spatial-journey.mp4"), "-frames:v", "1", "-c:v", "libwebp", "-quality", "85", str(DEST / "terrace-poster.webp")])
    report = {}
    for path in sorted(DEST.glob("*.mp4")):
        reader = imageio_ffmpeg.read_frames(str(path))
        meta = next(reader)
        reader.close()
        report[path.name] = {"bytes": path.stat().st_size, "fps": meta["fps"], "duration": meta["duration"], "dimensions": meta["size"]}
    (CACHE / "encode-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)

if __name__ == "__main__":
    main()
