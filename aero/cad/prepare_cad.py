#!/usr/bin/env python3
"""STL del case prototipo -> cad/case_edges.js (spigoli vivi + pannello mancante + dati cerniera).

Sistema di coordinate del motore (1 unità = 10 cm):
    X = lungo il case (175 mm),  Y = verso l'alto (0 = pavimento),  Z = profondità (fronte = -Z, verso lo spettatore)
Mappatura dall'STL (z su, y profondità): X = x, Y = z - zmin, Z = y.

Aggiunto da noi (non presente nell'STL, che è solo il case):
  * pannello laterale -x: estrusione 3 mm della sagoma della testata +x (foro del connettore escluso)
  * vetro/combiner: generato lato JS dai dati 'hinge'/'glass' qui sotto
"""
import json, pathlib
import numpy as np, trimesh

HERE = pathlib.Path(__file__).resolve().parent
STL = next(HERE.glob("*.stl"))
S = 0.01                      # mm -> unità motore
ANGLE = np.radians(25)        # soglia spigoli vivi

m = trimesh.load(STL)
m.apply_translation(-m.bounds.mean(axis=0))
zmin = m.bounds[0][2]
ext = m.extents


def eng(p):
    """punto STL (centrato) -> coordinate motore"""
    p = np.asarray(p, float)
    return [round(float(p[0] * S), 4), round(float((p[2] - zmin) * S), 4), round(float(p[1] * S), 4)]


# ---- 1) spigoli vivi del case ------------------------------------------------
E = m.face_adjacency_edges[m.face_adjacency_angles > ANGLE]
V = m.vertices
seen, segs = set(), []
for i, j in E:
    key = (min(i, j), max(i, j))
    if key in seen:
        continue
    seen.add(key)
    a, b = eng(V[i]), eng(V[j])
    if a != b:
        segs.extend(a + b)

# ---- 2) pannello mancante (-x): sagoma della testata +x ------------------------
XW0, XW1 = 84.53, 87.5        # spessore reale della testata +x (misurato)
sec = m.section(plane_origin=[86.0, 0, 0], plane_normal=[1, 0, 0])
loops = [np.asarray(l) for l in sec.discrete]


def area(l):  # shoelace su (y,z)
    y, z = l[:, 1], l[:, 2]
    return 0.5 * abs(np.dot(y, np.roll(z, -1)) - np.dot(z, np.roll(y, -1)))


outer = max(loops, key=area)
yz = outer[:, 1:3]
if np.allclose(yz[0], yz[-1]):
    yz = yz[:-1]
panel = []
n = len(yz)
for k in range(n):
    for x in (-XW1, -XW0):
        a = eng([x, yz[k][0], yz[k][1]]); b = eng([x, yz[(k + 1) % n][0], yz[(k + 1) % n][1]])
        if a != b:
            panel.extend(a + b)
    p0, p1, p2 = yz[k - 1], yz[k], yz[(k + 1) % n]
    v1, v2 = p1 - p0, p2 - p1
    c = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9)
    if np.degrees(np.arccos(np.clip(c, -1, 1))) > 30:      # angolo vivo: spigolo di spessore
        panel.extend(eng([-XW1, p1[0], p1[1]]) + eng([-XW0, p1[0], p1[1]]))

# ---- 3) cerniera / vetro ---------------------------------------------------------
# asse cerniera ricavato dal fit degli anelli dei nodi sulla parete posteriore
HINGE = dict(y=48.2, z=11.98, r=4.44, rIn=2.3)
# nodi del case (da contains-test sull'anello): 3 nodi, 2 spazi dove vanno le linguette del vetro
KNUCKLES = [[-87.5, -50.5], [-29.0, 28.0], [49.5, 87.5]]
GAPS = [[-50.5, -29.0], [28.0, 49.5]]

out = dict(
    scale=S,
    size_mm=dict(L=round(float(ext[0]), 2), D=round(float(ext[1]), 2), H=round(float(ext[2]), 2)),
    hinge=dict(Z=round(HINGE["y"] * S, 4), Y=round((HINGE["z"] - zmin) * S, 4), r=HINGE["r"] * S, rIn=HINGE["rIn"] * S,
               knuckles=[[a * S, b * S] for a, b in KNUCKLES], gaps=[[a * S, b * S] for a, b in GAPS]),
    glass=dict(w=1.53, h=0.867, t=0.02, tab=0.17),    # 153 x 86,7 x 2 mm (scelta nostra); area utile ~142 x 69 mm (display 1024x537)
    segs=segs,
    panel=panel,
)
js = "const CAD=" + json.dumps(out, separators=(",", ":")) + ";\n"
(HERE / "case_edges.js").write_text(js)
print(f"case: {len(segs)//6} spigoli · pannello: {len(panel)//6} spigoli · {len(js)/1024:.0f} KB · {out['size_mm']}")
