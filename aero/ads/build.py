#!/usr/bin/env python3
"""Assembla le 6 ads da 10 s (verticali 1080x1920) da shared/ + cad/ + ads/parts/.

  python3 build.py            # -> ads/dist/<slug>.html
  python3 render.py           # -> ads/out/<slug>.mp4
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
SHARED = ROOT.parent / "shared"
CAD = ROOT.parent / "cad"
P = ROOT / "parts"
DIST = ROOT / "dist"
OLD = (SHARED / "base_engine.html").read_text()

# slug, titolo (anche testo dell'HUD), scena 1 (solo il testo: il resto e' disegnato in canvas), riga finale dell'end card
ADS = [
    dict(slug="01-fighter-jet", title="Feels like being in a fighter jet", end="HEAD-UP · SITUATIONAL AWARENESS", s1="""
      <div class="abs kick" id="s1k" style="left:80px;top:250px;font-size:54px">feels like being in</div>
      <div class="abs big" id="s1a" data-fit="920" style="left:74px;top:330px;font-size:170px">A FIGHTER</div>
      <div class="abs big g" id="s1b" data-fit="900" style="left:76px;top:470px;font-size:260px">JET</div>"""),
    dict(slug="02-carplay", title="CarPlay of the skies", end="NAVIGATION · WAYPOINTS · OTA", s1="""
      <div class="abs kick" id="s1k" style="left:80px;top:250px;font-size:54px">the</div>
      <div class="abs big" id="s1a" data-fit="920" style="left:74px;top:330px;font-size:200px">CARPLAY</div>
      <div class="abs big g" id="s1b" data-fit="900" style="left:76px;top:500px;font-size:150px">OF THE SKIES</div>"""),
    dict(slug="03-safety-warnings", title="Safety warnings", end="TRAFFIC · TERRAIN · STALL", s1="""
      <div class="abs kick" id="s1k" style="left:80px;top:250px;font-size:54px">keep your eyes outside</div>
      <div class="abs big" id="s1a" data-fit="920" style="left:74px;top:330px;font-size:200px">SAFETY</div>
      <div class="abs big g" id="s1b" data-fit="920" style="left:76px;top:500px;font-size:200px">WARNINGS</div>"""),
    dict(slug="04-flight-review", title="Review your flight after landing", end="TRACK · PROFILE · REPLAY", s1="""
      <div class="abs kick" id="s1k" style="left:80px;top:250px;font-size:54px">review your flight</div>
      <div class="abs big" id="s1a" data-fit="920" style="left:74px;top:330px;font-size:200px">AFTER</div>
      <div class="abs big g" id="s1b" data-fit="920" style="left:76px;top:500px;font-size:200px">LANDING</div>"""),
    dict(slug="05-time-to-go", title="Quickly see time to get to a given place", end="DISTANCE · ETA · WAYPOINTS", s1="""
      <div class="abs kick" id="s1k" style="left:80px;top:250px;font-size:54px">quickly see the</div>
      <div class="abs big" id="s1a" data-fit="920" style="left:74px;top:330px;font-size:200px">TIME TO</div>
      <div class="abs big g" id="s1b" data-fit="920" style="left:76px;top:500px;font-size:200px">GET THERE</div>"""),
    dict(slug="06-qnh", title="Rotate to set current QNH value", end="ROTATE · SET QNH · DONE", s1="""
      <div class="abs kick" id="s1k" style="left:80px;top:250px;font-size:54px">rotate to set the current</div>
      <div class="abs big g" id="s1a" data-fit="920" style="left:74px;top:330px;font-size:330px">QNH</div>
      <div class="abs kick" id="s1c" style="left:80px;top:640px;font-size:54px">value</div>"""),
]

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

css = OLD[OLD.index("<style>") + 7 : OLD.index("</style>")]
helpers = OLD[OLD.index("const W=1920, H=1080;") : OLD.index("/* ============================================================\n   SCENES")]
engine = OLD[OLD.index("/* ============================================================\n   ENGINE") : OLD.index("</script>")]
css, helpers, engine = swap(css), swap(helpers), swap(engine)
css = css.replace("width:1920px;height:1080px", "width:1080px;height:1920px")
helpers = helpers.replace("const W=1920, H=1080;", "const W=1080, H=1920;")
engine = engine.replace("300*1640/w", "300*(W-140)/w")
engine = re.sub(r"\[\['s2a'.*?forEach\(\(\[id,w\]\)=>fit\(\$\(id\),w\)\);",
                "document.querySelectorAll('[data-fit]').forEach(el=>fit(el,+el.dataset.fit));", engine, flags=re.S)
assert "data-fit" in engine
# l'end card resta a schermo fino all'ultimo fotogramma (niente dissolvenza in uscita sull'ultima scena)
old = "to=E.inCubic(prog(lt,D-.32,D));"
assert old in engine
engine = engine.replace(old, "to=si===SCENES.length-1?0:E.inCubic(prog(lt,D-.32,D));")

fonts = (SHARED / "fonts.css").read_text().replace("../assets/", "../../assets/")  # le pagine stanno in ads/dist/
preloads = "\n".join(f'<link rel="preload" href="{u}" as="font" type="font/woff2" crossorigin>'
                     for u in re.findall(r"url\('([^']+)'\)", fonts))
extra_css = (P / "extra.css").read_text()

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aero ad — %(title)s</title>
<style>%(fonts)s
%(css)s
%(extra)s</style>
</head>
<body>
<div id="wrap"><div id="stage">
  <canvas id="grid"></canvas>
  <div id="cam">
    <canvas id="draw"></canvas>
    <div class="scene" id="s1">%(s1)s
    </div>
    <div class="scene" id="s2">
      <div class="abs kick" id="s2k" style="left:84px;top:330px;font-size:54px">AeroHUD</div>
      <div class="abs big" id="s2a" data-fit="900" style="left:70px;top:400px;font-size:300px;letter-spacing:.06em">AERO</div>
      <div class="abs stroke" id="s2b" data-fit="900" style="left:80px;top:700px;font-size:84px">rethinking flight</div>
    </div>
    <canvas id="over"></canvas>
  </div>
  <div id="flash"><div class="t" style="left:84px;top:60px" id="flTag">PLATE 00</div><div class="w" id="flWord"></div><div class="t" style="right:84px;bottom:56px">0.12</div></div>
  <div id="hud">
    <div class="reg" style="left:48px;top:40px;border-left-width:1.5px;border-top-width:1.5px"></div>
    <div class="reg" style="right:48px;top:40px;border-right-width:1.5px;border-top-width:1.5px"></div>
    <div class="reg" style="left:48px;bottom:40px;border-left-width:1.5px;border-bottom-width:1.5px"></div>
    <div class="reg" style="right:48px;bottom:40px;border-right-width:1.5px;border-bottom-width:1.5px"></div>
    <div class="h" id="hudScene" style="left:84px;top:52px">SC 01</div>
    <div class="h" id="hudTime" style="right:84px;top:52px">00:00:00</div>
    <div class="h" style="left:84px;bottom:46px">aero hud — %(slug)s</div>
    <div class="h" id="hudFrame" style="right:84px;bottom:46px">F 0000</div>
  </div>
  <canvas id="fx"></canvas>
</div></div>
<div id="ctl">
  <button id="bPlay">❚❚</button>
  <input id="scrub" type="range" min="0" max="1" step="0.001" value="0">
  <span id="tLabel">0.00</span>
</div>
<script>
const SCENES = [
  { id:'s1', name:%(name)s, dur:7.4 },
  { id:'s2', name:'rethinking flight', dur:2.6 },
];
const BEATS = [];
const FPS_LABEL = 30;
const AD_END = %(end)s;
%(helpers)s
%(cad)s
%(hudkit)s
%(shared)s
%(common)s
%(scene)s
%(engine)s
</script>
</body>
</html>
"""

def main():
    import json
    DIST.mkdir(exist_ok=True)
    cad, hudkit = (CAD / "case_edges.js").read_text(), (SHARED / "hudkit.js").read_text()
    shared, common = (SHARED / "scene_shared.js").read_text(), (P / "common.js").read_text()
    for ad in ADS:
        html = TEMPLATE % dict(
            title=ad["title"], slug=ad["slug"], preloads=preloads, fonts=fonts, css=css, extra=extra_css,
            s1=ad["s1"], name=json.dumps(ad["title"].lower()), end=json.dumps(ad["end"]),
            helpers=helpers, cad=cad, hudkit=hudkit, shared=shared, common=common,
            scene=(P / f"{ad['slug']}.js").read_text(), engine=engine,
        )
        html = html.replace("109,255,162", "110,255,90").replace("#6dffa2", "#6eff5a").replace("#d8ffe6", "#d9ffd0")
        html = html.replace("await Promise.all([", "await Promise.all([document.fonts.load('40px DDIN'),", 1)
        (DIST / f"{ad['slug']}.html").write_text(html)
        print("dist/%s.html" % ad["slug"], len(html))

if __name__ == "__main__":
    main()
