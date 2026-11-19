/* ---------- AD 02 · CARPLAY OF THE SKIES ---------- */
const ROUTE=[[0,.92],[.12,.74],[.2,.6],[.34,.46],[.3,.3],[.5,.18],[.72,.1]];
IMPL.s1={
  init(){ this.k=prepChars($('s1k')); this.a=prepChars($('s1a')); this.b=prepChars($('s1b')); },
  cam(lt,D){ return {x:6*lt/D,y:-4*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,rev:E.outCubic(prog(lt,0,1.3)),orbs:[{x:200,y:1200,r:700,c:'rgba(50,110,255,.15)'},{x:760,y:1150,r:640,c:`rgba(110,255,90,${.10*prog(lt,2.4,3.4)})`}]} },
  update(lt){
    animChars(this.k,lt,.2,.02,.5,60);
    animChars(this.a,lt,.3,.05,.75,70); chroma($('s1a'),glitch(lt,.3,1.1,12));
    animChars(this.b,lt,.8,.045,.7,70); chroma($('s1b'),glitch(lt,.8,1.5,9));
    plate(lt,'02','fig. 2 — phone + head-up');

    // ---- telefono con mappa e rotta
    const PX=60,PY=860,PW=330,PH=700, pp=E.outCubic(prog(lt,.9,1.7));
    d.strokeStyle=BL(.85); d.lineWidth=1.8; glowOn(d,BL(.5),8);
    d.beginPath(); d.roundRect(PX,PY,PW,PH,36); d.stroke(); glowOff(d);
    d.save(); d.beginPath(); d.roundRect(PX+9,PY+9,PW-18,PH-18,28); d.clip(); d.globalAlpha=pp;
    d.fillStyle='rgba(6,16,32,.9)'; d.fillRect(PX,PY,PW,PH);
    mono(d,'MAP & WAYPOINTS',PX+PW/2,PY+52,13,BL(.85),'center',700,2);
    d.strokeStyle=BL(.12); d.lineWidth=1; for(let i=0;i<11;i++){ line(d,PX+9,PY+90+i*50,PX+PW-9,PY+90+i*50); line(d,PX+9+i*38,PY+80,PX+9+i*38,PY+PH-60); }
    const mp=([u,v])=>[PX+34+u*(PW-68),PY+110+v*(PH-240)];
    const pts=ROUTE.map(mp), head=E.inOutCubic(prog(lt,1.5,4.2))*(pts.length-1);
    d.strokeStyle=GR(.9); d.lineWidth=2.6; glowOn(d,GR(.8),8); const hp=polyPartial(d,pts,head); glowOff(d);
    pts.forEach((p,i)=>{ if(i>head+.01) return; if([0,2,3,4,6].includes(i)){ d.fillStyle=GR(1); d.fillRect(p[0]-5,p[1]-5,10,10); } });
    mono(d,'KLAX',pts[0][0]+10,pts[0][1]+22,12,BL(.9),'left',700);
    if(head>2) mono(d,'W1',pts[2][0]+12,pts[2][1]+4,12,BL(.9),'left',700);
    if(head>3) mono(d,'W2',pts[3][0]+12,pts[3][1]+4,12,GR(1),'left',700);
    if(head>4) mono(d,'W3',pts[4][0]+12,pts[4][1]-6,12,BL(.9),'left',700);
    if(head>5.9) mono(d,'KSAN',pts[6][0]-8,pts[6][1]-12,12,BL(.9),'right',700);
    if(hp){ d.save(); d.translate(hp[0],hp[1]); d.fillStyle='#fff'; d.beginPath(); d.moveTo(0,-9); d.lineTo(7,8); d.lineTo(0,4); d.lineTo(-7,8); d.closePath(); d.fill(); d.restore(); }
    mono(d,'KLAX → KSAN',PX+PW/2,PY+PH-34,14,BL(.9),'center',700,2);
    d.restore();

    // ---- link BLE verso l'HUD
    const gx=450,gy=900,gw=560,gh=hudH(gw);
    const lk=prog(lt,3.3,4.0), a0=[PX+PW,PY+PH*.35], a1=[gx-6,gy+gh*.5];
    if(lk>0){
      d.strokeStyle=BL(.45*lk); d.lineWidth=1.4; d.setLineDash([5,7]); line(d,a0[0],a0[1],a1[0],a1[1],E.outExpo(lk)); d.setLineDash([]);
      mono(d,'BLE',(a0[0]+a1[0])/2,a0[1]-24,13,BL(.8*lk),'center',700,3);
      for(let i=0;i<3;i++){ const u=frac(lt*.7+i/3); if(lk<1) break; dot(d,lerp(a0[0],a1[0],u),lerp(a0[1],a1[1],u),3.5,GR(1-Math.abs(u-.5)*1.4)); }
    }
    // ---- HUD con la guida verso il waypoint
    const pf=E.outCubic(prog(lt,3.1,3.9)), sa=E.outCubic(prog(lt,3.7,4.3));
    const dist=Math.max(.4,12.4-Math.max(0,lt-4.0)*1.5), turn=Math.sin(lt*.7);
    hudAt(gx,gy,gw,{hdg:45+turn*5,spd:100+Math.sin(lt)*2,alt:7500,vs:0,pitch:2,roll:10*turn,brg:38*turn,wp:{brg:45+turn*5+38*turn,name:'W2',dist,eta:dist/100*60}},pf,sa);
    mono(d,'NAVIGATION ON THE HUD',gx,gy-16,13,GR(.9*pf),'left',700,3);
    // ---- scheda "prossimo waypoint"
    const ca=prog(lt,4.4,5.0), cy0=gy+gh+40;
    d.strokeStyle=BL(.6*ca); d.lineWidth=1.2; traceRect(d,gx,cy0,gw,260,E.outCubic(ca));
    mono(d,'NEXT WAYPOINT',gx+24,cy0+40,13,BL(.6*ca),'left',600,3);
    mono(d,'W2',gx+gw-24,cy0+44,28,GR(ca),'right',700,2);
    [['DISTANCE',dist.toFixed(1)+' NM'],['ETA',Math.max(1,Math.round(dist/100*60))+' min'],['COURSE',pad(Math.round(45+turn*5+38*turn),3)+'°']].forEach((r,i)=>{
      const p=prog(lt,4.6+i*.18,5.2+i*.18);
      mono(d,r[0],gx+24,cy0+100+i*50,12,BL(.5*clamp(p*3)),'left',600,3);
      mono(d,typed(r[1],1),gx+gw-24,cy0+102+i*50,20,BL(.95*clamp(p*3)),'right',500);
    });
    // ---- barra di avanzamento rotta
    const by=1660, bp=prog(lt,4.8,5.4);
    d.strokeStyle=BL(.6*bp); d.lineWidth=1.2; line(d,80,by,1000,by,E.outExpo(bp));
    const lab=['KLAX','W1','W2','W3','KSAN'], fr=E.inOutCubic(prog(lt,5.0,7.2))*.55+.12;
    lab.forEach((n,i)=>{ const x=80+i*230, on=i/4<fr; d.fillStyle=on?GR(bp):BL(.6*bp); d.fillRect(x-5,by-5,10,10); mono(d,n,x,by+36,13,on?GR(.95*bp):BL(.65*bp),i===4?'right':(i===0?'left':'center'),700,2); });
    const mx=80+920*fr; d.strokeStyle=GR(.9*bp); d.lineWidth=3; glowOn(d,GR(.8),8); line(d,80,by,mx,by); glowOff(d);
    flare(o,mx,by,.45,.8*bp);
  }
};
