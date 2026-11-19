/* ---------- AD 01 · FEELS LIKE BEING IN A FIGHTER JET ---------- */
IMPL.s1={
  init(){ this.k=prepChars($('s1k')); this.a=prepChars($('s1a')); this.b=prepChars($('s1b')); },
  cam(lt,D){ const sh=prog(lt,2.4,7.4); return {x:-8*lt/D+Math.sin(lt*17)*1.4*sh,y:Math.cos(lt*13)*1.4*sh,s:1+.035*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,rev:E.outCubic(prog(lt,0,1.3)),orbs:[{x:300,y:500,r:900,c:'rgba(40,100,255,.13)'},{x:640,y:1250,r:700,c:`rgba(110,255,90,${.12*prog(lt,1.6,2.8)})`}]} },
  update(lt){
    animChars(this.k,lt,.2,.02,.5,60);
    animChars(this.a,lt,.35,.05,.75,70); chroma($('s1a'),glitch(lt,.35,1.2,12));
    animChars(this.b,lt,.9,.07,.7,70); chroma($('s1b'),glitch(lt,.9,1.6,9));
    plate(lt,'01','fig. 1 — head-up display');

    const gx=90, gy=1060, gw=900, gh=hudH(gw), cx=gx+gw/2, cy=gy+gh*.6;
    const pf=E.outCubic(prog(lt,.9,1.7)), sa=E.outCubic(prog(lt,1.6,2.3)), sp=E.outExpo(prog(lt,2.0,4.8));
    const roll=24*Math.sin(lt*1.05)*sp, pitch=5*Math.sin(lt*.9+.6)*sp;
    // terreno che scorre sempre più veloce, inclinato come l'orizzonte dell'HUD
    const zc=lt*lt*6+lt*10, cam=mkCam([0,1.1,zc],[0,1.1,zc+20],1000,cx,cy);
    d.save(); d.translate(cx,cy); d.rotate(Math.atan(Math.sin(roll*Math.PI/180)*1.6)); d.translate(-cx,-cy);
    floor3(d,cam,{x0:-45,x1:45,z0:zc,z1:zc+90,step:3,alpha:.55*pf,fog:80,origin:[0,0,zc]});
    d.restore();
    hudAt(gx,gy,gw,{hdg:88+Math.sin(lt*.5)*10*sp,spd:lerp(60,168,sp),alt:lerp(900,3400,sp),vs:900*sp*Math.sin(lt*.9+.6+.5),pitch,roll,brg:30*Math.sin(lt*.7)*sp},pf,sa);

    const sc=prog(lt,1.7,2.5); if(sc>0&&sc<1){ const sx=gx+gw*sc; d.strokeStyle=GR(.8*(1-sc)); d.lineWidth=2; glowOn(d,GR(.9),14); line(d,sx,gy,sx,gy+gh); glowOff(d); }
    const bk=1-E.outExpo(prog(lt,2.0,2.9)); d.save(); d.globalAlpha=prog(lt,2.0,2.4); brackets(d,gx-8-bk*60,gy-8-bk*60,gw+16+bk*120,gh+16+bk*120,GR(.9)); d.restore();
    mono(d,'AERO HUD-001',gx,gy-30,14,BL(.8*pf),'left',700,3);
    mono(d,'display 1024 × 537',gx+gw,gy-30,12,BL(.5*pf),'right',500,1);
    const pa=E.outExpo(prog(lt,3.0,3.7));
    mono(d,'SITUATIONAL AWARENESS',gx+gw,gy+gh+48,14,GR(.9*pa),'right',700,3);
    mono(d,'flight data, right in front of your eyes',gx+gw,gy+gh+72,13,BL(.65*pa),'right',500,1);
    // lettura a sinistra: G e velocità
    const ra=prog(lt,3.4,4.0);
    mono(d,'MODE',gx,gy+gh+48,12,BL(.5*ra),'left',600,3); mono(d,typed('HEAD-UP',ra),gx,gy+gh+76,17,BL(.95),'left',500);
    flare(o,gx+gw*clamp(sc),gy+gh*.5,.7,sc>0&&sc<1?1-sc:0);
  }
};
