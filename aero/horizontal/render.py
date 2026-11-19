#!/usr/bin/env python3
"""Renderizza index.html in MP4, fotogramma per fotogramma (deterministico).

  python3 render.py                      # -> out.mp4, 1920x1080 @ 30fps
  python3 render.py --fps 60 --out hd60.mp4
  python3 render.py --scale 2            # 3840x2160
  python3 render.py --stills 1.5,8,20    # salva PNG singoli in stills/
"""
import argparse
import pathlib
import subprocess
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--out", default=str(ROOT / "out.mp4"))
    ap.add_argument("--scale", type=float, default=1)
    ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--end", type=float, default=None)
    ap.add_argument("--stills", default=None, help="tempi separati da virgola")
    args = ap.parse_args()

    with sync_playwright() as p:
        flags = ["--force-color-profile=srgb", "--font-render-hinting=none"]
        try:
            browser = p.chromium.launch(args=flags)
        except Exception:
            browser = p.chromium.launch(channel="chrome", args=flags)  # usa Google Chrome installato
        page = browser.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=args.scale)
        page.goto((ROOT / "index.html").as_uri() + "?render=1")
        page.wait_for_function("window.__ready === true", timeout=60000)
        total = page.evaluate("window.TOTAL")

        if args.stills:
            out_dir = ROOT / "stills"
            out_dir.mkdir(exist_ok=True)
            for s in args.stills.split(","):
                t = float(s)
                page.evaluate(f"window.seek({t})")
                path = out_dir / f"t{t:06.2f}.png"
                page.screenshot(path=str(path))
                print(path)
            browser.close()
            return

        end = min(args.end or total, total)
        n0, n1 = round(args.start * args.fps), round(end * args.fps)
        ff = subprocess.Popen(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(args.fps), "-i", "-",
             "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", args.out],
            stdin=subprocess.PIPE,
        )
        for i in range(n0, n1):
            page.evaluate(f"window.seek({i / args.fps})")
            ff.stdin.write(page.screenshot(type="jpeg", quality=95))
            if i % args.fps == 0:
                sys.stdout.write(f"\r{i / args.fps:6.1f}s / {end:.1f}s")
                sys.stdout.flush()
        ff.stdin.close()
        ff.wait()
        browser.close()
        print(f"\n-> {args.out}")


if __name__ == "__main__":
    main()
