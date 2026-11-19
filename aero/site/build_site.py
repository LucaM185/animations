#!/usr/bin/env python3
"""Ricostruisce le due pagine di animazione e copia i font woff2.
Uso: python3 site/build_site.py   ->  poi: cd site && python3 -m http.server 8000"""
import pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
for d in ("horizontal", "vertical"):
    subprocess.run([sys.executable, "build.py", "--site"], cwd=ROOT / d, check=True)

src = ROOT / "assets" / "fonts"
dst = ROOT / "site" / "assets" / "fonts"
dst.mkdir(parents=True, exist_ok=True)
for f in src.glob("*.woff2"):
    shutil.copy(f, dst / f.name)
old = ROOT / "site" / "assets" / "D-DINCondensed-Bold.otf"
if old.exists():
    old.unlink()
print("sito pronto in", ROOT / "site")
