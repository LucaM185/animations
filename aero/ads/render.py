#!/usr/bin/env python3
"""Renderizza le ads (dist/*.html) in MP4 1080x1920 @ 30 fps, fotogramma per fotogramma.

  python3 render.py                       # tutte -> out/<slug>.mp4
  python3 render.py --only 03             # solo quelle il cui slug contiene "03"
  python3 render.py --stills 1,3,5,8,9.8  # PNG singoli in stills/<slug>/ (niente video)
"""
import argparse, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--scale", type=float, default=1)
    ap.add_argument("--only", default="")
    ap.add_argument("--stills", default=None, help="tempi separati da virgola")
    args = ap.parse_args()
    pages = sorted(p for p in (ROOT / "dist").glob("*.html") if args.only in p.stem)
    (ROOT / "out").mkdir(exist_ok=True)

    with sync_playwright() as p:
        flags = ["--force-color-profile=srgb", "--font-render-hinting=none"]
        try:
            browser = p.chromium.launch(args=flags)
        except Exception:
            browser = p.chromium.launch(channel="chrome", args=flags)
        for html in pages:
            page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=args.scale)
            msgs = []
            page.on("pageerror", lambda e: msgs.append(str(e)))
            page.on("console", lambda m: m.type == "error" and msgs.append(m.text))
            page.goto(html.as_uri() + "?render=1")
            page.wait_for_function("window.__ready === true", timeout=60000)
            total = page.evaluate("window.TOTAL")
            if args.stills:
                out_dir = ROOT / "stills" / html.stem
                out_dir.mkdir(parents=True, exist_ok=True)
                for s in args.stills.split(","):
                    page.evaluate(f"window.seek({float(s)})")
                    page.screenshot(path=str(out_dir / f"t{float(s):05.2f}.png"))
                print(html.stem, "stills ->", out_dir, ("ERRORS: " + "; ".join(msgs)[:600]) if msgs else "")
                page.close()
                continue
            out = ROOT / "out" / f"{html.stem}.mp4"
            n = round(total * args.fps)
            ff = subprocess.Popen(
                ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(args.fps), "-i", "-",
                 "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)],
                stdin=subprocess.PIPE)
            for i in range(n):
                page.evaluate(f"window.seek({i / args.fps})")
                ff.stdin.write(page.screenshot(type="jpeg", quality=95))
                if i % args.fps == 0:
                    sys.stdout.write(f"\r{html.stem} {i / args.fps:4.1f}s / {total:.1f}s"); sys.stdout.flush()
            ff.stdin.close(); ff.wait(); page.close()
            print(f"\r{html.stem} -> {out}" + (("  ERRORS: " + "; ".join(msgs)[:600]) if msgs else ""))
        browser.close()


if __name__ == "__main__":
    main()
