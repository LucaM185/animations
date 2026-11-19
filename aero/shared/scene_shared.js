/* ============================================================
   SHARED PIECES — unità 3D dal CAD (cad/case_edges.js) + dimensioni
   Case = STL prototipo (spigoli vivi). Aggiunti da noi: pannello laterale -x e vetro.
   ============================================================ */
const GR=a=>`rgba(110,255,90,${a})`;
const GREEN='#6eff5a';
const CASE={L:CAD.size_mm.L*CAD.scale,D:CAD.size_mm.D*CAD.scale,H:CAD.size_mm.H*CAD.scale};

// punto del vetro: u,v in 0..1 (u lungo X, v lungo l'altezza del vetro), phi = apertura (rad dal piano orizzontale, verso il fronte)
function glassPt(u,v,phi){
  const g=CAD.glass,h=CAD.hinge;
  return [(u-.5)*g.w, h.Y+v*g.h*Math.sin(phi)-0, h.Z-v*g.h*Math.cos(phi)];
}
function ringPts(x,y0,z0,r,n=18){ return Array.from({length:n+1},(_,i)=>{const t=i/n*Math.PI*2;return [x,y0+Math.sin(t)*r,z0+Math.cos(t)*r]}); }

// c=ctx, cam=camera, gp=apertura vetro 0..1, sym=simbologia HUD 0..1, rv=disegno spigoli 0..1, pn=scorrimento pannello -x 0..1
function unit(c,cam,lt,a,gp,sym,rv=1,pn=1){
  const S=CAD.segs, n=S.length/6, L=CASE.L, front=rv*1.12, x0=-L/2;
  c.save(); c.globalAlpha=a; c.lineJoin='round'; c.lineCap='round';
  // --- case: spigoli vivi dell'STL, con un fronte luminoso che li "scrive"
  c.lineWidth=1.25; c.strokeStyle=BL(.8); glowOn(c,BL(.45),6); c.beginPath();
  const fr=[];
  for(let i=0;i<n;i++){
    const o=i*6, key=((S[o]+S[o+3])*.5-x0)/L;
    if(key>front) continue;
    if(rv<1&&key>front-.07){ fr.push(o); continue; }
    seg3(c,cam,[S[o],S[o+1],S[o+2]],[S[o+3],S[o+4],S[o+5]]);
  }
  c.stroke();
  if(fr.length){ c.strokeStyle=GR(.95); c.lineWidth=2; glowOn(c,GR(.9),12); c.beginPath();
    for(const o of fr) seg3(c,cam,[S[o],S[o+1],S[o+2]],[S[o+3],S[o+4],S[o+5]]); c.stroke(); }
  // --- pannello laterale -x (aggiunto): entra scorrendo e si chiude sulla testata
  if(pn>0){
    const P=CAD.panel, m=P.length/6, dx=-(1-E.outCubic(pn))*.8;
    c.globalAlpha=a*clamp(pn*3); c.lineWidth=1.4; c.strokeStyle=BL(.95); glowOn(c,BL(.6),8); c.beginPath();
    for(let i=0;i<m;i++){ const o=i*6; seg3(c,cam,[P[o]+dx,P[o+1],P[o+2]],[P[o+3]+dx,P[o+4],P[o+5]]); }
    c.stroke(); c.globalAlpha=a;
  }
  // --- vetro/combiner (aggiunto), incernierato all'asse reale delle cerniere
  const ga=clamp((rv-.7)/.3);
  if(ga>0){
    c.globalAlpha=a*ga;
    const g=CAD.glass,hg=CAD.hinge, phi=lerp(8,94,E.outCubic(gp))*Math.PI/180, t=g.t;
    const nz=Math.sin(phi), ny=Math.cos(phi);               // normale (verso il retro), nel piano Z-Y
    const gp3=(u,v,off=0)=>{const p=glassPt(u,v,phi); return [p[0],p[1]+ny*off,p[2]+nz*off]};
    const Q=[[0,0],[1,0],[1,1],[0,1]];
    for(const off of [0,t]){
      const q=Q.map(([u,v])=>P3(cam,gp3(u,v,off)));
      if(!q.every(Boolean)) continue;
      c.beginPath(); q.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath();
      if(off===0){ c.fillStyle='rgba(78,168,255,.10)'; c.fill(); }
      c.strokeStyle=BL(off?.5:.95); c.lineWidth=1.5; glowOn(c,BL(.55),8); c.stroke();
    }
    c.beginPath(); for(const [u,v] of Q) seg3(c,cam,gp3(u,v,0),gp3(u,v,t)); c.stroke();
    // linguette + nodi di cerniera del vetro negli spazi tra i nodi del case
    c.lineWidth=1.3; c.strokeStyle=BL(.9); glowOn(c,BL(.5),6);
    for(const [ga0,ga1] of hg.gaps){
      const mid=(ga0+ga1)/2, hw=(ga1-ga0)/2-.02;
      for(const xx of [mid-hw,mid+hw]){ c.beginPath(); ringPts(xx,hg.Y,hg.Z,hg.r*.9).forEach((p,i)=>{const q=P3(cam,p); if(q) i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])}); c.stroke(); }
      c.beginPath(); seg3(c,cam,[mid-hw,hg.Y+hg.r*.9,hg.Z],[mid+hw,hg.Y+hg.r*.9,hg.Z]); seg3(c,cam,[mid-hw,hg.Y-hg.r*.9,hg.Z],[mid+hw,hg.Y-hg.r*.9,hg.Z]);
      const u0=(mid-hw)/g.w+.5,u1=(mid+hw)/g.w+.5; seg3(c,cam,[mid-hw,hg.Y,hg.Z],glassPt(u0,.0,phi)); seg3(c,cam,[mid+hw,hg.Y,hg.Z],glassPt(u1,.0,phi)); c.stroke();
    }
    // simbologia reale dell'HUD mappata sull'area utile del vetro
    if(sym>0){
      const st={hdg:88+Math.sin(lt*.5)*4,spd:96,alt:2400+lt*8,vs:420,pitch:3*Math.sin(lt*.8),roll:9*Math.sin(lt*.7),brg:28*Math.sin(lt*.55)};
      drawHudMapped(c,hudPrims(st),(x,y)=>P3(cam,gp3(.035+.93*x/HW,.92-.80*y/HH,0)),sym*ga);
    }
  }
  glowOff(c); c.restore();
}
// quote del case (STL): lunghezza, profondità, altezza — p1,p2,p3 = progressi 0..1; offs = offset etichette
function caseDims(c,cam,p1,p2,p3,offs=[[0,34],[40,10],[48,6]]){
  const hl=CASE.L/2, hd=CASE.D/2, H=CASE.H, o=.4;
  dimLine(c,cam,[-hl,0,-hd-o],[hl,0,-hd-o],[[-hl,0,-hd],[-hl,0,-hd-o-.06]],[[hl,0,-hd],[hl,0,-hd-o-.06]],p1,Math.round(CASE.L*100)+' mm',offs[0]);
  dimLine(c,cam,[hl+o,0,-hd],[hl+o,0,hd],[[hl,0,-hd],[hl+o+.06,0,-hd]],[[hl,0,hd],[hl+o+.06,0,hd]],p2,Math.round(CASE.D*100)+' mm',offs[1]);
  dimLine(c,cam,[hl+o,0,-hd-o],[hl+o,H,-hd-o],[[hl,0,-hd],[hl+o+.06,0,-hd-o-.06]],[[hl,H,-hd],[hl+o+.06,H,-hd-o-.06]],p3,Math.round(CASE.H*100)+' mm',offs[2]);
}
function dimLine(c,cam,A,B,e1,e2,p,label,lo=[0,-24],a=1){
  if(p<=0) return;
  const a2=P3(cam,A),b2=P3(cam,B); if(!a2||!b2) return;
  c.save(); c.globalAlpha=a; c.strokeStyle=BL(.8); c.lineWidth=1.2;
  c.setLineDash([4,5]); const x1=P3(cam,e1[0]),x1b=P3(cam,e1[1]),x2=P3(cam,e2[0]),x2b=P3(cam,e2[1]);
  if(x1&&x1b) line(c,x1[0],x1[1],x1b[0],x1b[1],p); if(x2&&x2b) line(c,x2[0],x2[1],x2b[0],x2b[1],p);
  c.setLineDash([]);
  line(c,a2[0],a2[1],b2[0],b2[1],p);
  const dx=b2[0]-a2[0],dy=b2[1]-a2[1],L=Math.hypot(dx,dy)||1,nx=-dy/L*7,ny=dx/L*7;
  for(const q of [a2,b2]) line(c,q[0]-nx,q[1]-ny,q[0]+nx,q[1]+ny);
  if(p>.7) mono(c,label,(a2[0]+b2[0])/2+lo[0],(a2[1]+b2[1])/2+lo[1],17,BL(.95*clamp((p-.7)*3)),'center',600,1);
  c.restore();
}
function unitCam(th,cx,cy,R=4.3,fl=1250,h=1.9){ return mkCam([R*Math.sin(th),h,-R*Math.cos(th)],[0,.5,0],fl,cx,cy); }

