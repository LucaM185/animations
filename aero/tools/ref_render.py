"""Rende l'HUD reale (codice raspi/aerohud) in PNG per confrontarlo col port JS."""
import sys, pathlib
RASPI = pathlib.Path('/Users/lucam/Desktop/VSTest/raspi')
sys.path.insert(0, str(RASPI))
import pygame
pygame.init()
from aerohud.ui.instruments import FlightState, draw_instruments, draw_waypoint_callout, HUD_GREEN
from aerohud.ui.road import Attitude, draw_road, draw_horizon_xor, horizon_tip_screen

W, H = 1024, 537
def frame(path, hdg, spd, alt, vs, pitch, roll, brg, wp=None):
    s = pygame.Surface((W, H)); s.fill((0, 0, 0))
    att = Attitude(pitch_deg=pitch, roll_deg=roll, bearing_deg=brg)
    draw_road(s, att, HUD_GREEN, clear=False, horizon=False)
    st = FlightState(hdg, spd, alt, vs); st.clamp()
    draw_instruments(s, st, 1.0, HUD_GREEN)
    if wp:
        tx, ty = horizon_tip_screen(att, W, H)
        draw_waypoint_callout(s, bearing_deg=wp['brg'], name=wp['name'], distance_nm=wp['dist'], horizon_x=tx, horizon_y=ty,
                              scale=1.0, color=HUD_GREEN, eta_min=wp.get('eta'))
    draw_horizon_xor(s, att, HUD_GREEN)
    pygame.image.save(s, path)

out = pathlib.Path(__file__).resolve().parent
frame(str(out / 'ref_a.png'), 88, 96, 2437, 420, 3, 8, 25, dict(brg=92, name='W2', dist=12.4, eta=7))
frame(str(out / 'ref_b.png'), 18, 90, 590, 2, 0, 0, 0)
frame(str(out / 'ref_c.png'), 241, 103, 7500, -250, -6, -18, -55, dict(brg=200, name='KSAN', dist=3.2, eta=2))
print('ok')
