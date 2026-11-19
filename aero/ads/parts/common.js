/* ============================================================
   ADS — pezzi comuni: scena 2 = end card, palette di allarme, targhetta
   ============================================================ */
const IMPL={};
const AMB=a=>`rgba(255,178,56,${a})`, RED=a=>`rgba(255,84,84,${a})`;

// riga di testata + etichette (stessa "plate" dei video lunghi)
function plate(lt,n,fig){
  d.lineWidth=1.5; d.strokeStyle=BL(.75); glowOn(d,BL(.6),6);
  line(d,80,206,1000,206,E.outExpo(prog(lt,.1,1.1))); glowOff(d);
  const la=prog(lt,.6,1.2);
  mono(d,`PLATE ${n} — AERO HUD`,80,188,13,BL(.55*la),'left',500,2);
  mono(d,fig,1000,188,13,BL(.55*la),'right',500,1);
}
// vetro HUD + simbologia reale: st = stato per hudPrims
function hudAt(gx,gy,gw,st,pf,sa){
  hudGlass(d,gx,gy,gw,pf); drawHud(d,hudPrims(st),gx,gy,gw,sa);
}
// angoli (target brackets) attorno a un riquadro
function brackets(c,x,y,w,h,col,len=34,lw=2){
  c.save(); c.strokeStyle=col; c.lineWidth=lw; glowOn(c,col,10); c.beginPath();
  for(const [sx,sy] of [[0,0],[1,0],[1,1],[0,1]]){
    const px=x+sx*w, py=y+sy*h, dx=sx?-1:1, dy=sy?-1:1;
    c.moveTo(px+dx*len,py); c.lineTo(px,py); c.lineTo(px,py+dy*len);
  } c.stroke(); glowOff(c); c.restore();
}
const pulse=(t,a,b)=>{ const p=prog(t,a,b); return p<=0||p>=1?0:Math.sin(p*Math.PI) };

/* ---------- 02 · END CARD ---------- */
IMPL.s2={
  init(){ this.k=prepChars($('s2k')); this.a=prepChars($('s2a')); this.b=prepChars($('s2b')); },
  cam(lt,D){ return {x:0,y:0,s:1+.02*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:.8,orbs:[{x:540,y:1150,r:820,c:'rgba(50,110,255,.16)'},{x:540,y:1100,r:520,c:`rgba(110,255,90,${.09*prog(lt,.5,1.5)})`}]} },
  update(lt){
    animChars(this.k,lt,.1,.04,.5,60); animChars(this.a,lt,.2,.08,.9,70); chroma($('s2a'),glitch(lt,.2,1.0,14));
    const sb=E.outCubic(prog(lt,.8,1.5)); $('s2b').style.clipPath=`inset(-20px ${100-sb*100}% -20px -20px)`;
    const th=lerp(-.8,-.25,prog(lt,0,2.6)), cam=unitCam(th,540,1170,5.0,1450,1.7);
    const fp=prog(lt,.2,.8);
    floor3(d,cam,{x0:-12,x1:12,z0:-12,z1:12,step:1,alpha:.45*fp,fog:11,origin:[0,0,0]});
    unit(d,cam,lt,1,E.outCubic(prog(lt,.9,1.7)),E.outCubic(prog(lt,1.4,2.0)),E.inOutCubic(prog(lt,.15,1.2)),prog(lt,.6,1.3));
    const pe=E.outExpo(prog(lt,1.0,1.6));
    d.strokeStyle=BL(.7); d.lineWidth=1.2; line(d,80,1560,1000,1560,pe);
    for(let x=80;x<=1000;x+=40){ if((x-80)/920>pe) break; line(d,x,1560,x,1560+((x-80)%200===0?12:5)); }
    mono(d,typed('lucam185.github.io/Aero',prog(lt,1.2,1.9)),80,1622,22,INK,'left',600,3);
    mono(d,AD_END,80,1658,13,BL(.75*prog(lt,1.7,2.2)),'left',600,3);
  }
};
