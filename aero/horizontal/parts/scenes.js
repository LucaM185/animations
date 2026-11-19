/* ============================================================
   SCENES
   ============================================================ */
const IMPL={};

/* ---------- 01 · UN FIGHTER JET? ---------- */
IMPL.s1={
  init(){ this.k=prepChars($('s1k')); this.a=prepChars($('s1a')); this.b=prepChars($('s1b')); this.c=prepWords($('s1c')); this.dd=prepWords($('s1d')); },
  cam(lt,D){ return {x:-20*lt/D,y:0,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,rev:E.outCubic(prog(lt,0,1.3)),orbs:[{x:420,y:300,r:900,c:'rgba(40,100,255,.12)'},{x:1430,y:660,r:640,c:`rgba(110,255,90,${.10*prog(lt,1.6,2.6)})`}]} },
  update(lt){
    animChars(this.k,lt,.25,.02,.5,60);
    animChars(this.a,lt,.4,.05,.75,70); chroma($('s1a'),glitch(lt,.4,1.3,12));
    animChars(this.b,lt,1.0,.06,.7,70); chroma($('s1b'),glitch(lt,1.0,1.7,9));
    animWords(this.c,lt,2.9,.12,.6,60); animWords(this.dd,lt,3.2,.12,.6,60);

    d.lineWidth=1.5; d.strokeStyle=BL(.75); glowOn(d,BL(.6),6);
    line(d,140,166,1780,166,E.outExpo(prog(lt,.1,1.1))); glowOff(d);
    const la=prog(lt,.6,1.2);
    mono(d,'PLATE 01 — CONCEPT',140,148,13,BL(.55*la),'left',500,2);
    mono(d,'fig. 1 — head-up display per aviazione generale',1780,148,13,BL(.55*la),'right',500,1);

    const gx=1080, gy=440, gw=700, gh=hudH(gw);
    const pf=E.outCubic(prog(lt,1.0,1.9)), sa=E.outCubic(prog(lt,1.8,2.5)), sp=E.outExpo(prog(lt,2.2,3.8));
    hudGlass(d,gx,gy,gw,pf);
    drawHud(d,hudPrims({hdg:88+Math.sin(lt*.5)*4,spd:lerp(0,96,sp),alt:lerp(500,2437,sp),vs:420*sp,pitch:2.5*Math.sin(lt*.8)*sp,roll:10*Math.sin(lt*.7)*sp,brg:32*Math.sin(lt*.55)*sp}),gx,gy,gw,sa);
    const sc=prog(lt,1.9,2.7); if(sc>0&&sc<1){ const sx=gx+gw*sc; d.strokeStyle=GR(.8*(1-sc)); d.lineWidth=2; glowOn(d,GR(.9),14); line(d,sx,gy,sx,gy+gh); glowOff(d); }
    mono(d,'AERO HUD-001',gx,gy-16,14,BL(.8*pf),'left',700,3);
    mono(d,'display 1024 × 537 · D-DIN Condensed',gx+gw,gy-16,12,BL(.5*pf),'right',500,1);
    const pa=E.outExpo(prog(lt,3.1,3.8));
    mono(d,'CONSAPEVOLEZZA',gx+gw,gy+gh+34,13,GR(.9*pa),'right',700,3);
    mono(d,'dati di volo, davanti agli occhi',gx+gw,gy+gh+56,13,BL(.65*pa),'right',500,1);
    const rows=[['MODALITÀ','head-up'],['TARGET','aviazione generale'],['INSTALLAZIONE','plug and play']];
    rows.forEach((r,i)=>{ const p=prog(lt,3.6+i*.18,3.6+i*.18+.6);
      mono(d,r[0],1240,286+i*30,12,BL(.5*clamp(p*3)),'left',600,3);
      mono(d,typed(r[1],p),1440,286+i*30,15,BL(.95),'left',500); });
    d.strokeStyle=BL(.5); const pr=E.outExpo(prog(lt,3.4,4.2)); line(d,1240,260,1780,260,pr);
    flare(o,gx+gw*clamp(sc),gy+gh*.5,.7,sc>0&&sc<1?1-sc:0);
  }
};

/* ---------- 02 · HEAD-DOWN vs HEAD-UP ---------- */
const HD={x:260,y:800}, EYE={x:294,y:786}, HZ={x:1640,y:650}, PN={x:520,y:905};
IMPL.s2={
  init(){ this.k=prepChars($('s2k')); this.a=prepChars($('s2a')); this.k2=prepChars($('s2k2')); this.b=prepChars($('s2b')); },
  cam(lt,D){ return {x:8*lt/D,y:-5*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,orbs:[{x:500,y:760,r:700,c:'rgba(60,110,255,.12)'},{x:1300,y:640,r:700,c:`rgba(110,255,90,${.10*prog(lt,4.4,5.4)})`}]} },
  update(lt){
    const B=lt>=3.4;
    $('s2A').style.display=B?'none':''; $('s2B').style.display=B?'':'none';
    animChars(this.k,lt,0,.02,.5,60); animChars(this.a,lt,.1,.04,.7,70); chroma($('s2a'),glitch(lt,.1,.8,10));
    exitFx($('s2A'),lt,3.05,.33);
    animChars(this.k2,lt,4.2,.02,.5,60); animChars(this.b,lt,4.3,.04,.7,70); chroma($('s2b'),glitch(lt,4.3,5,10));

    const pd=prog(lt,.3,.9), dimP=B?lerp(1,.35,prog(lt,4.2,4.8)):1;
    // horizon + mountains
    d.strokeStyle=BL(.6*pd); d.lineWidth=1.5; line(d,760,650,1780,650,E.outExpo(pd));
    d.strokeStyle=BL(.35*pd); polyPartial(d,[[980,650],[1070,598],[1130,628],[1230,556],[1340,642],[1430,606],[1520,650]],6*E.outExpo(pd));
    mono(d,'ORIZZONTE',1780,690,13,BL(.6*pd),'right',600,3);
    // cockpit panel
    d.save(); d.globalAlpha=dimP;
    d.strokeStyle=BL(.7*pd); d.lineWidth=1.4; traceRect(d,380,870,240,70,E.outCubic(pd));
    mono(d,'STRUMENTI',380,858,13,BL(.7*pd),'left',600,3);
    for(let i=0;i<3;i++){ d.beginPath(); d.arc(424+i*70,905,17,0,Math.PI*2); d.strokeStyle=BL(.5*pd); d.stroke(); const an=-2+i*1.1+Math.sin(lt*2+i)*.2; line(d,424+i*70,905,424+i*70+Math.cos(an)*13,905+Math.sin(an)*13); }
    mono(d,'SPD 096 · ALT 2400',620,962,12,BL(.55*pd),'right',500,1);
    d.restore();
    // pilot
    d.strokeStyle=BL(.9*pd); d.lineWidth=1.8; glowOn(d,BL(.5),6);
    d.beginPath(); d.arc(HD.x,HD.y,36,0,Math.PI*2); d.stroke();
    d.beginPath(); d.moveTo(HD.x-8,HD.y+34); d.lineTo(HD.x-14,HD.y+70); d.bezierCurveTo(HD.x-20,HD.y+120,HD.x-50,HD.y+150,HD.x-60,HD.y+176); d.stroke();
    glowOff(d);
    // gaze
    let e=0;
    if(lt>=1.0&&!B){ const t01=(lt-1.0)/.62, n=Math.floor(t01), fr=t01-n, tg=n%2===0?1:0, pv=n===0?0:(tg?0:1); e=lerp(pv,tg,sstep(clamp(fr/.32))); }
    const Gp={x:lerp(HZ.x,PN.x,e),y:lerp(HZ.y,PN.y,e)}, ang=Math.atan2(Gp.y-EYE.y,Gp.x-EYE.x);
    const gcol=B?GR:BL;
    d.strokeStyle=gcol(.9); d.lineWidth=B?2.2:1.8; d.setLineDash(B?[]:[7,6]); glowOn(d,gcol(.8),B?10:4);
    d.beginPath(); d.moveTo(EYE.x,EYE.y); d.lineTo(Gp.x,Gp.y); d.stroke(); d.setLineDash([]); glowOff(d);
    const nx=HD.x+Math.cos(ang)*36, ny=HD.y+Math.sin(ang)*36;
    d.fillStyle=BL(.9*pd); d.beginPath(); d.moveTo(nx+Math.cos(ang)*12,ny+Math.sin(ang)*12); d.lineTo(nx+Math.cos(ang+2)*7,ny+Math.sin(ang+2)*7); d.lineTo(nx+Math.cos(ang-2)*7,ny+Math.sin(ang-2)*7); d.closePath(); d.fill();
    dot(d,EYE.x,EYE.y,4,gcol(1)); d.strokeStyle=gcol(.9); d.beginPath(); d.arc(Gp.x,Gp.y,9,0,Math.PI*2); d.stroke(); dot(d,Gp.x,Gp.y,3.5,gcol(1));
    if(lt>.9){ const hu=B?'HEAD-UP':(e>.5?'HEAD-DOWN':''); if(hu) mono(d,hu,HD.x,HD.y-62,16,B?GR(1):BL(.9),'center',700,3); }

    // phase B: combiner glass + unit
    const gp=E.outCubic(prog(lt,4.3,5.0));
    if(gp>0){
      const A0=[700,832],A1=[900,622], nxv=.72,nyv=.69, th=9*gp;
      d.beginPath(); d.moveTo(A0[0]-nxv*th,A0[1]-nyv*th*-1);
      const p0=[A0[0]-nxv*th*.0,A0[1]], P=[[A0[0]-th,A0[1]+th*.7],[A0[0]+th,A0[1]-th*.7],[A1[0]+th,A1[1]-th*.7],[A1[0]-th,A1[1]+th*.7]];
      d.beginPath(); d.moveTo(P[0][0],P[0][1]); P.slice(1).forEach(q=>d.lineTo(q[0],q[1])); d.closePath();
      d.fillStyle=`rgba(78,168,255,${.16*gp})`; d.fill(); d.strokeStyle=BL(.95*gp); d.lineWidth=1.6; glowOn(d,BL(.6),8); d.stroke(); glowOff(d);
      d.strokeStyle=BL(.9*gp); d.strokeRect(670,832,230,50);
      mono(d,'AERO',785,864,16,BL(.9*gp),'center',700,6);
      const rd=prog(lt,5.1,5.6);
      d.strokeStyle=GR(.9*rd); d.lineWidth=1.2; line(d,800,722,860,690,rd);
      mono(d,typed('096 KT · 2400 FT · 088°',rd),868,684,15,GR(rd),'left',700,1);
      flare(o,800,722,.5,(1-prog(lt,5.0,5.8))*.9);
    }
    // gaze tracker card
    const cp=prog(lt,.6,1.2), CX=1500, CY=400;
    d.strokeStyle=BL(.55); d.lineWidth=1.2; traceRect(d,CX,CY,280,130,E.outCubic(cp));
    mono(d,'DOVE GUARDA IL PILOTA',CX+20,CY+30,12,BL(.7*cp),'left',600,2);
    const looksOut=B||e<.5;
    [['FUORI',looksOut],['PANNELLO',!looksOut]].forEach(([nm,on],i)=>{
      const y=CY+68+i*34; d.fillStyle=on?(B?GR(cp):`rgba(175,212,255,${cp})`):BL(.15*cp); d.fillRect(CX+20,y-12,14,14);
      mono(d,nm,CX+46,y,16,on?(B?GR(cp):INK):BL(.4*cp),'left',700,2);
    });
    if(B&&lt>5.2) mono(d,'sempre fuori',CX+260,CY+68,13,GR(prog(lt,5.2,5.6)),'right',600,1);
    // footer
    const pf=prog(lt,5.6,6.2);
    if(pf>0){ mono(d,'stessa informazione, nella stessa linea di vista',700,986,14,GR(.9*pf),'left',600,1); }
  }
};

/* ---------- 03 · PLUG & PLAY ---------- */
IMPL.s3={
  init(){ this.k=prepChars($('s3k')); this.a=prepChars($('s3a')); },
  cam(lt,D){ return {x:0,y:-8*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,orbs:[{x:1250,y:700,r:700,c:'rgba(50,110,255,.14)'},{x:1300,y:600,r:420,c:`rgba(110,255,90,${.08*prog(lt,2.6,3.6)})`}]} },
  update(lt,D=6.6){
    animChars(this.k,lt,0,.02,.5,60); animChars(this.a,lt,.15,.045,.7,70); chroma($('s3a'),glitch(lt,.15,.9,12));
    const sb=E.outCubic(prog(lt,.7,1.5)); $('s3b').style.clipPath=`inset(-20px ${100-sb*100}% -20px -20px)`;
    const th=lerp(-.95,-.2,E.inOutCubic(prog(lt,0,D)));
    const cam=unitCam(th,1190,650,3.9,1250,1.6);
    const fp=prog(lt,.3,1.0);
    floor3(d,cam,{x0:-12,x1:12,z0:-12,z1:12,step:1,alpha:.5*fp,fog:11,origin:[0,0,0]});
    const c0=P3(cam,[0,0,0]);
    if(c0){const rg=d.createRadialGradient(c0[0],c0[1],0,c0[0],c0[1],460);rg.addColorStop(0,`rgba(60,130,255,${.20*fp})`);rg.addColorStop(1,'rgba(0,0,0,0)');d.fillStyle=rg;d.fillRect(c0[0]-460,c0[1]-460,920,920)}
    const rv=E.inOutCubic(prog(lt,.4,1.9)), pn=prog(lt,1.5,2.5), gp=prog(lt,2.4,3.6), sym=E.outCubic(prog(lt,3.6,4.2));
    unit(d,cam,lt,1,gp,sym,rv,pn);
    caseDims(d,cam,E.outExpo(prog(lt,3.8,4.7)),E.outExpo(prog(lt,4.0,4.9)),E.outExpo(prog(lt,4.2,5.1)),[[0,34],[40,10],[48,6]]);
    // spec table
    const pr=E.outExpo(prog(lt,3.8,4.6));
    d.strokeStyle=BL(.7); d.lineWidth=1.2; line(d,140,830,1000,830,pr);
    const rows=[['DIMENSIONI',`${Math.round(CASE.L*100)} × ${Math.round(CASE.D*100)} × ${Math.round(CASE.H*100)} mm`],['MATERIALE','PETG · nero opaco'],['SENSORI','suite dedicata + GPS (antenna esterna opzionale)']];
    rows.forEach((r,i)=>{ const p=prog(lt,4.0+i*.18,4.0+i*.18+.6);
      mono(d,r[0],150,870+i*30,12,BL(.5*clamp(p*3)),'left',600,3);
      mono(d,typed(r[1],p),330,870+i*30,15,BL(.95),'left',500); });
    mono(d,'HUD-001 · rev A',1780,1000,12,GR(.8*prog(lt,4.6,5.0)),'right',600,2);
  }
};

/* ---------- 04 · IL DISPLAY ---------- */
IMPL.s4={
  init(){ this.k=prepChars($('s4k')); this.a=prepChars($('s4a')); },
  cam(lt,D){ return {x:-10*lt/D,y:0,s:1.01+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,orbs:[{x:1200,y:700,r:760,c:`rgba(110,255,90,${.06+.05*prog(lt,1.5,2.5)})`},{x:300,y:300,r:800,c:'rgba(40,100,255,.12)'}]} },
  update(lt){
    animChars(this.k,lt,0,.02,.5,60); animChars(this.a,lt,.1,.035,.7,70); chroma($('s4a'),glitch(lt,.1,.8,10));
    const sb=E.outCubic(prog(lt,.8,1.5)); $('s4b').style.clipPath=`inset(-20px ${100-sb*100}% -20px -20px)`;
    const gx=780,gy=440,gw=880,s=gw/HW,gh=hudH(gw);
    const pf=E.outCubic(prog(lt,.3,1.2)), sa=E.outCubic(prog(lt,1.0,1.7)), q=lt-1.0;
    const st={hdg:88+q*1.2,spd:98+Math.sin(q*.8)*3,alt:2400+q*20,vs:Math.round(300+Math.sin(q*1.4)*140),pitch:3+2*Math.sin(q*.6),roll:12*Math.sin(q*.7),brg:30*Math.sin(q*.5)};
    hudGlass(d,gx,gy,gw,pf);
    drawHud(d,hudPrims(st),gx,gy,gw,sa);
    const g=roadGeom({pitch:st.pitch,roll:st.roll,brg:st.brg});
    const X=v=>gx+v*s, Y=v=>gy+v*s;
    const callout=(p0,p1,p2,label,sub,al,ax,dy)=>{
      const pp=E.outExpo(prog(lt,p0,p0+.7)); if(pp<=0) return;
      d.strokeStyle=BL(.65); d.lineWidth=1.2; d.beginPath(); d.moveTo(p1[0],p1[1]); d.lineTo(p1[0]+(p2[0]-p1[0])*pp,p1[1]+(p2[1]-p1[1])*pp); d.stroke();
      dot(d,p1[0],p1[1],3.5,GR(1));
      mono(d,label,ax,p2[1]+dy,14,GR(.95*pp),al,700,3); mono(d,sub,ax,p2[1]+dy+22,13,BL(.65*pp),al,500,1);
    };
    callout(2.0,[X(30),Y(254)],[760,Y(254)],'VELOCITÀ','nodi · scala a barrette','right',750,-4);
    callout(2.4,[X(512),Y(45)],[X(512),Y(45)-52],'ROTTA','nastro a 7,5°','center',X(512),-12);
    callout(2.8,[X(1002),Y(254)],[1690,Y(254)],'QUOTA','piedi','left',1700,-4);
    callout(3.2,[X(1000),Y(484)],[1690,Y(484)],'VARIOMETRO','ft/min','left',1700,-4);
    callout(3.6,[X(g.L[0][0]),Y(g.L[0][1])],[760,Y(g.L[0][1])+20],'PERCORSO','strada neon verso il waypoint','right',750,-6);
    callout(4.0,[X(g.hR[0]),Y(g.hR[1])],[1690,Y(g.hR[1])],'ORIZZONTE','segue il rollio','left',1700,-4);
    const pn=prog(lt,4.2,4.8);
    d.strokeStyle=BL(.5*pn); line(d,150,1000,150+520*pn,1000);
    mono(d,'GIORNO · NOTTE  —  DI NOTTE È AL SUO MEGLIO',150,986,13,GR(.9*pn),'left',600,2);
    const sw=prog(lt,4.4,5.6); if(sw>0&&sw<1) { d.fillStyle=`rgba(110,255,90,${.07*Math.sin(sw*Math.PI)})`; d.fillRect(gx,gy,gw,gh); }
    mono(d,'LUMINOSITÀ',gx+gw,gy+gh+34,12,BL(.55*pn),'right',600,3);
    d.strokeStyle=BL(.5*pn); d.strokeRect(gx+gw-260,gy+gh+44,260,8); d.fillStyle=GR(.9*pn); d.fillRect(gx+gw-260,gy+gh+44,260*(.55+.35*Math.sin(Math.max(0,lt-4.4)*1.2)),8);
  }
};

/* ---------- 05 · APP + NAVIGAZIONE ---------- */
const ROUTE=[[0,.92],[.12,.74],[.2,.6],[.34,.46],[.3,.3],[.5,.18],[.72,.1]];
IMPL.s5={
  init(){ this.k=prepChars($('s5k')); this.a=prepChars($('s5a')); },
  cam(lt,D){ return {x:8*lt/D,y:-4*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,orbs:[{x:330,y:700,r:600,c:'rgba(50,110,255,.14)'},{x:1280,y:640,r:640,c:`rgba(110,255,90,${.09*prog(lt,2.4,3.4)})`}]} },
  update(lt){
    animChars(this.k,lt,0,.02,.5,60); animChars(this.a,lt,.1,.035,.7,70); chroma($('s5a'),glitch(lt,.1,.8,10));
    const sb=E.outCubic(prog(lt,.8,1.5)); $('s5b').style.clipPath=`inset(-20px ${100-sb*100}% -20px -20px)`;
    // ---- phone
    const PX=200,PY=410,PW=300,PH=590, pp=E.outCubic(prog(lt,.4,1.2));
    d.strokeStyle=BL(.85); d.lineWidth=1.8; glowOn(d,BL(.5),8);
    d.beginPath(); d.roundRect(PX,PY,PW,PH,34); d.stroke(); glowOff(d);
    d.save(); d.beginPath(); d.roundRect(PX+10,PY+10,PW-20,PH-20,26); d.clip(); d.globalAlpha=pp;
    d.fillStyle='rgba(6,16,32,.9)'; d.fillRect(PX,PY,PW,PH);
    mono(d,'MAP & WAYPOINTS',PX+PW/2,PY+52,13,BL(.85),'center',700,2);
    d.strokeStyle=BL(.12); d.lineWidth=1; for(let i=0;i<8;i++){ line(d,PX+10,PY+90+i*50,PX+PW-10,PY+90+i*50); line(d,PX+10+i*40,PY+80,PX+10+i*40,PY+PH-60); }
    const mp=([u,v])=>[PX+30+u*(PW-60),PY+110+v*(PH-230)];
    const pts=ROUTE.map(mp), head=E.inOutCubic(prog(lt,1.0,3.0))*(pts.length-1);
    d.strokeStyle=GR(.9); d.lineWidth=2.6; glowOn(d,GR(.8),8); const hp=polyPartial(d,pts,head); glowOff(d);
    const WPN=['KLAX','W1','W2','W3','','','KSAN'];
    pts.forEach((p,i)=>{ if(i>head+.01) return; if(i===0||i===6||i===2||i===3||i===4){ d.fillStyle=GR(1); d.fillRect(p[0]-5,p[1]-5,10,10); } });
    mono(d,'KLAX',pts[0][0]+10,pts[0][1]+22,11,BL(.9),'left',700);
    if(head>2) mono(d,'W1',pts[2][0]+12,pts[2][1]+4,11,BL(.9),'left',700);
    if(head>3) mono(d,'W2',pts[3][0]+12,pts[3][1]+4,11,GR(1),'left',700);
    if(head>4) mono(d,'W3',pts[4][0]+12,pts[4][1]-6,11,BL(.9),'left',700);
    if(head>5.9) mono(d,'KSAN',pts[6][0]-8,pts[6][1]-12,11,BL(.9),'right',700);
    if(hp){ d.save(); d.translate(hp[0],hp[1]); d.fillStyle='#fff'; d.beginPath(); d.moveTo(0,-9); d.lineTo(7,8); d.lineTo(0,4); d.lineTo(-7,8); d.closePath(); d.fill(); d.restore(); }
    mono(d,'KLAX → KSAN',PX+PW/2,PY+PH-40,14,BL(.9),'center',700,2);
    d.restore();
    // ---- BLE link
    const lk=prog(lt,2.8,3.6), a0=[PX+PW,PY+PH*.45], a1=[900,PY+PH*.45-20];
    if(lk>0){
      d.strokeStyle=BL(.45*lk); d.lineWidth=1.4; d.setLineDash([5,7]); line(d,a0[0],a0[1],a1[0],a1[1],E.outExpo(lk)); d.setLineDash([]);
      mono(d,'BLE',(a0[0]+a1[0])/2,a0[1]-26,13,BL(.8*lk),'center',700,3);
      for(let i=0;i<4;i++){ const u=frac(lt*.7+i/4); if(lk<1) break; dot(d,lerp(a0[0],a1[0],u),lerp(a0[1],a1[1],u),3.5,GR(1-Math.abs(u-.5)*1.4)); }
    }
    // ---- HUD with the route cue
    const gx=900,gy=470,gw=780,gh=hudH(gw);
    const pf=E.outCubic(prog(lt,2.6,3.5)), sa=E.outCubic(prog(lt,3.3,4.0));
    hudGlass(d,gx,gy,gw,pf);
    const dist=Math.max(.4,12.4-Math.max(0,lt-3.6)*1.6), turn=Math.sin(lt*.6);
    drawHud(d,hudPrims({hdg:45+turn*5,spd:100+Math.sin(lt)*2,alt:7500,vs:0,pitch:2,roll:10*turn,brg:38*turn,wp:{brg:45+turn*5+38*turn,name:'W2',dist,eta:dist/100*60}}),gx,gy,gw,sa);
    mono(d,'NAVIGAZIONE SUL HUD',gx,gy-16,13,GR(.9*pf),'left',700,3);
    // ---- OTA
    const oa=prog(lt,4.2,4.8), bar=E.inOutCubic(prog(lt,4.6,5.9));
    d.strokeStyle=BL(.6*oa); d.lineWidth=1.2; traceRect(d,gx,900,gw,80,E.outCubic(oa));
    mono(d,'AERO_HUD v3.1.2 · AGGIORNAMENTO OTA',gx+24,934,14,BL(.9*oa),'left',700,2);
    mono(d,bar>=1?'AGGIORNATO ✓':Math.round(bar*100)+'%',gx+gw-24,934,14,bar>=1?GR(1):BL(.8*oa),'right',700,2);
    d.strokeStyle=BL(.45*oa); d.strokeRect(gx+24,950,gw-48,10); d.fillStyle=bar>=1?GR(oa):BL(.8*oa); d.fillRect(gx+24,950,(gw-48)*bar,10);
    if(bar>0&&bar<1) flare(o,gx+24+(gw-48)*bar,955,.5,.8);
  }
};

/* ---------- 06 · PROGETTATO PER TE ---------- */
const S6ROWS=[
  ['01','PLUG & PLAY','unità standalone con sensori dedicati','plug'],
  ['02','NAVIGAZIONE','come CarPlay, per il tuo aereo','nav'],
  ['03','HUD CRISTALLINO','quello che serve, quando serve, dove vuoi','hud'],
  ['04','ECOSISTEMA','app e dispositivo insieme · aggiornamenti OTA','wifi'],
];
function icon(c,type,x,y,col,p){
  c.save(); c.translate(x,y); c.strokeStyle=col; c.lineWidth=2.4; glowOn(c,col,8);
  const t=E.outExpo(clamp(p));
  if(type==='plug'){ c.strokeRect(10,18,60,44); line(c,28,18,28,2,t); line(c,52,18,52,2,t); line(c,40,62,40,78,t); }
  if(type==='nav'){ polyPartial(c,[[6,70],[26,44],[44,52],[56,24],[74,8]],4*t); dot(c,6,70,5,col); dot(c,74,8,5,col); }
  if(type==='hud'){ traceRect(c,4,10,72,50,t); line(c,18,40,62,40,t); line(c,30,40,22,56,t); line(c,50,40,58,56,t); }
  if(type==='wifi'){ for(let i=1;i<=3;i++){ c.beginPath(); c.arc(40,66,i*20,-Math.PI*.8,-Math.PI*.2); c.stroke(); } dot(c,40,66,5,col); }
  glowOff(c); c.restore();
}
IMPL.s6={
  init(){
    const host=$('s6rows'); this.rows=[];
    S6ROWS.forEach((r,i)=>{
      const el=document.createElement('div'); el.className='row'; el.style.top=(176+i*192)+'px';
      el.innerHTML=`<div class="idx abs" style="left:150px;top:6px">${r[0]}</div><div class="ttl abs" style="left:300px;top:0;font-size:80px">${r[1]}</div><div class="dsc abs" style="left:304px;top:92px">${r[2]}</div>`;
      host.appendChild(el); this.rows.push({el,t:el.querySelector('.ttl'),dd:el.querySelector('.dsc'),ix:el.querySelector('.idx'),chs:null});
    });
    this.rows.forEach(r=>r.chs=prepChars(r.t));
  },
  cam(lt,D){ return {x:0,y:-6*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,orbs:[{x:1400,y:560,r:760,c:'rgba(50,110,255,.14)'},{x:400,y:400,r:700,c:'rgba(110,255,90,.06)'}]} },
  update(lt){
    const T0=1.05, G=.45;
    this.rows.forEach((r,i)=>{
      const t=T0+i*G;
      animChars(r.chs,lt,t,.02,.5,60); fadeUp(r.dd,lt,t+.25,.5,20); fadeUp(r.ix,lt,t,.4,20);
      const y=176+i*192, pr=E.outExpo(prog(lt,t,t+.7));
      d.strokeStyle=BL(.5); d.lineWidth=1.2; line(d,150,y+158,1000,y+158,pr);
      icon(d,S6ROWS[i][3],150,y+44,GR(.95*clamp(prog(lt,t+.1,t+.5))),prog(lt,t+.1,t+.8));
      const ck=prog(lt,t+.7,t+1.0);
      if(ck>0){ const cx0=300+this.rows[i].t.offsetWidth+36; d.strokeStyle=GR(ck); d.lineWidth=3.5; glowOn(d,GR(.8),8); polyPartial(d,[[cx0,y+40],[cx0+18,y+58],[cx0+48,y+20]],2*ck); glowOff(d); }
    });
    // faint unit on the right
    const th=lerp(-.7,-.1,prog(lt,0,5.8)), cam=unitCam(th,1600,620,6.2,1200);
    const a=.55*E.outCubic(prog(lt,1.4,2.4));
    floor3(d,cam,{x0:-8,x1:8,z0:-8,z1:8,step:1,alpha:.4*a,fog:8,origin:[0,0,0]});
    unit(d,cam,lt,a,1,.9);
  }
};

/* ---------- 07 · RETHINKING FLIGHT ---------- */
function planeEdges(){
  const N=[0,0,3], A=[[-.45,.35,1.2],[.45,.35,1.2],[.45,-.35,1.2],[-.45,-.35,1.2]], Bk=[[-.25,.2,-1.5],[.25,.2,-1.5],[.25,-.2,-1.5],[-.25,-.2,-1.5]], T=[0,.05,-3.2];
  const E1=[]; A.forEach((p,i)=>{E1.push([N,p]);E1.push([p,A[(i+1)%4]]);E1.push([p,Bk[i]]);E1.push([Bk[i],Bk[(i+1)%4]]);E1.push([Bk[i],T])});
  const W=[[-3.2,.4,.9],[3.2,.4,.9],[3.2,.4,-.2],[-3.2,.4,-.2]]; W.forEach((p,i)=>E1.push([p,W[(i+1)%4]]));
  E1.push([[-.45,.35,.9],[-2,-.35,.5]],[[.45,.35,.9],[2,-.35,.5]]);
  E1.push([[-1.3,.1,-2.7],[1.3,.1,-2.7]],[[1.3,.1,-2.7],[1.3,.1,-3.2]],[[1.3,.1,-3.2],[-1.3,.1,-3.2]],[[-1.3,.1,-3.2],[-1.3,.1,-2.7]]);
  E1.push([[0,.1,-2.3],[0,1.2,-3.2]],[[0,1.2,-3.2],[0,.1,-3.2]]);
  return E1;
}
const PLANE=planeEdges();
IMPL.s7={
  init(){ this.a=prepChars($('s7a')); this.b=prepChars($('s7b')); this.k=prepChars($('s7k')); },
  cam(lt,D){ return {x:0,y:0,s:1+.025*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:.6,orbs:[{x:1300,y:540,r:800,c:'rgba(50,110,255,.16)'},{x:1300,y:700,r:500,c:`rgba(110,255,90,${.08*prog(lt,.8,2)})`}]} },
  update(lt,D=5.6){
    animChars(this.k,lt,.2,.04,.5,60); animChars(this.a,lt,.35,.08,.9,70); chroma($('s7a'),glitch(lt,.35,1.3,14));
    const sb=E.outCubic(prog(lt,1.3,2.3)); $('s7b').style.clipPath=`inset(-20px ${100-sb*100}% -20px -20px)`;
    // scene: camera low over the grid, plane flying toward/past it
    const cam=mkCam([0,2.2,0],[0,2.6,20],1000,1330,470);
    const fp=prog(lt,0,.8);
    floor3(d,cam,{x0:-60,x1:60,z0:0,z1:90,step:3,alpha:.5*fp,fog:70,origin:[0,0,lt*4]});
    const pos=u=>{ const z=lerp(60,15,E.inOutCubic(u)); return [lerp(14,3.2,E.inOutCubic(u)),lerp(6,3.7,E.inOutCubic(u)),z]; };
    const u=prog(lt,.3,4.8), P0=pos(u), bank=Math.sin(lt*1.1)*.18, yaw=Math.PI+Math.sin(lt*.8)*.06;
    // trail
    d.strokeStyle=GR(.55); d.lineWidth=1.6; d.setLineDash([3,8]); d.beginPath(); let first=true;
    for(let i=0;i<=40;i++){ const uu=Math.max(0,u-(40-i)/40*.5), p=pos(uu), q=P3(cam,[p[0]-0,p[1]-.0,p[2]+(40-i)*.0]); if(q){ first?d.moveTo(q[0],q[1]):d.lineTo(q[0],q[1]); first=false; } }
    d.stroke(); d.setLineDash([]);
    const xf=p=>{ let q=[p[0],p[1],p[2]]; const cb=Math.cos(bank),sb2=Math.sin(bank); q=[q[0]*cb-q[1]*sb2,q[0]*sb2+q[1]*cb,q[2]]; q=rotY([q[0]*1.15,q[1]*1.15,q[2]*1.15],yaw); return [q[0]+P0[0],q[1]+P0[1],q[2]+P0[2]]; };
    d.strokeStyle=BL(.95); d.lineWidth=1.7; glowOn(d,BL(.6),8); d.lineJoin='round';
    d.beginPath(); for(const [a1,b1] of PLANE) seg3(d,cam,xf(a1),xf(b1)); d.stroke(); glowOff(d);
    // HUD marker on the plane
    const pm=P3(cam,P0); if(pm){ const ha=prog(lt,1.6,2.2); d.strokeStyle=GR(.9*ha); d.lineWidth=1.6; glowOn(d,GR(.8),8);
      d.strokeRect(pm[0]-120,pm[1]-70,240,140); d.beginPath(); for(const [sx,sy] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ d.moveTo(pm[0]+sx*120,pm[1]+sy*70-sy*18); d.lineTo(pm[0]+sx*120,pm[1]+sy*70); d.lineTo(pm[0]+sx*120-sx*18,pm[1]+sy*70); } d.stroke(); glowOff(d);
      mono(d,'N123AX · CESSNA 172',pm[0]-120,pm[1]-82,12,GR(.9*ha),'left',700,2);
      mono(d,'AERO HUD · ACTIVE',pm[0]+120,pm[1]+92,12,GR(.9*ha),'right',700,2); }
    // end card
    const pe=E.outExpo(prog(lt,3.4,4.2));
    if(pe>0){
      d.strokeStyle=BL(.7); d.lineWidth=1.2; line(d,140,880,1780,880,pe);
      for(let x=140;x<=1780;x+=40){ if((x-140)/1640>pe) break; line(d,x,880,x,880+((x-140)%200===0?12:5)); }
      mono(d,typed('lucam185.github.io/Aero',prog(lt,3.7,4.5)),150,930,20,INK,'left',600,3);
      mono(d,'HEAD-UP · PLUG & PLAY · NAVIGAZIONE · OTA',150,964,13,BL(.75*prog(lt,4.2,4.8)),'left',600,3);
      mono(d,'fig. 7 — fine',1780,930,12,GR(prog(lt,4.4,4.8)),'right',600,2);
    }
  }
};

