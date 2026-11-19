#!/usr/bin/env python3
"""Assembla index.html (orizzontale) da shared/ + cad/ + parts/.  Uso: python3 build.py && python3 render.py"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
SHARED = ROOT.parent / "shared"
CAD = ROOT.parent / "cad"
OLD = (SHARED / "base_engine.html").read_text()
P = ROOT / "parts"

css = OLD[OLD.index("<style>") + 7 : OLD.index("</style>")]
helpers = OLD[OLD.index("const W=1920, H=1080;") : OLD.index("/* ============================================================\n   SCENES")]
engine = OLD[OLD.index("/* ============================================================\n   ENGINE") : OLD.index("</script>")]

SWAPS = [
    ("rgba(255,122,69,", "rgba(110,255,90,"), ("rgba(255,120,60,", "rgba(110,255,90,"), ("rgba(255,120,70,", "rgba(110,255,90,"),
    ("rgba(255,226,200,", "rgba(210,255,225,"), ("rgba(255,240,230,", "rgba(235,255,240,"), ("rgba(255,150,90,0)", "rgba(110,255,90,0)"),
    ("#ff7a45", "#6eff5a"), ("#ffd8c4", "#d9ffd0"),
    ("#f7b088 0%,#f3a072 45%,#e58a5c 100%", "#a9d4ff 0%,#4ea8ff 45%,#2f7fe0 100%"),
    ("--navy:#1b1c3f", "--navy:#04101f"), ("--bg:#0a1528", "--bg:#050a14"),
    ("'#0c182e'", "'#08111f'"), ("'#060d1b'", "'#02050a'"),
]
def swap(s):
    for a, b in SWAPS:
        s = s.replace(a, b)
    return s

css, helpers, engine = swap(css), swap(helpers), swap(engine)

engine = re.sub(r"\[\['s2a'.*?forEach\(\(\[id,w\]\)=>fit\(\$\(id\),w\)\);",
                "document.querySelectorAll('[data-fit]').forEach(el=>fit(el,+el.dataset.fit));", engine, flags=re.S)
engine = engine.replace("if(RENDER){ render(+qs.get('t')||0); return; }", """if(RENDER){ render(+qs.get('t')||0); return; }
  if(qs.has('embed')){ // modalità sito: nessun controllo, il tempo arriva dalla pagina (postMessage {t})
    document.body.classList.add('render');
    const stage=$('stage'), fitStage=()=>{stage.style.transform=`scale(${Math.min(innerWidth/W,innerHeight/H)})`};
    fitStage(); addEventListener('resize',fitStage); render(0);
    addEventListener('message',e=>{ if(e.data&&typeof e.data.t==='number') render(e.data.t); });
    parent.postMessage({aeroReady:true,total:TOTAL,scenes:SCENES.map(s=>({name:s.name,start:s.start}))},'*'); return;
  }""")
assert "data-fit" in engine

fonts = (SHARED / "fonts.css").read_text()
preloads = "\n".join(
    f'<link rel="preload" href="{u}" as="font" type="font/woff2" crossorigin>'
    for u in re.findall(r"url\('([^']+)'\)", fonts)
)

html = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aero — Rethinking flight (orizzontale)</title>
{preloads}
<style>{fonts}
{css}
{(P/'extra.css').read_text()}</style>
</head>
<body>
{(P/'body.html').read_text()}
<script>
{(P/'tl.js').read_text()}
{helpers}
{(CAD/'case_edges.js').read_text()}
{(SHARED/'hudkit.js').read_text()}
{(SHARED/'scene_shared.js').read_text()}
{(P/'scenes.js').read_text()}
{engine}
</script>
</body>
</html>
"""
html = html.replace("109,255,162", "110,255,90").replace("#6dffa2", "#6eff5a").replace("#d8ffe6", "#d9ffd0")
html = html.replace("await Promise.all([", "await Promise.all([document.fonts.load('40px DDIN'),", 1)
(ROOT / "index.html").write_text(html)
print("index.html scritto", len(html))

import sys
if "--site" in sys.argv:
    site = ROOT.parent / "site"; site.mkdir(exist_ok=True)
    (site / "horizontal.html").write_text(html.replace("../assets/", "assets/"))
    print("sito:", site / "horizontal.html")
