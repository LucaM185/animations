/* ============================================================
   AEROHUD — port fedele di raspi/aerohud/ui/{instruments,road}.py
   Superficie del display: 1024×537. Font: D-DIN Condensed Bold (x-stretch 1.15).
   hudPrims(stato) -> primitive in coordinate display; poi si disegnano
   in 2D (drawHud) oppure mappate su un quad 3D (drawHudMapped).
   ============================================================ */
const HW=1024, HH=537, RW=1508, RH=1046;
const LEFT_EDGE=[94.89404160421364,10.975216029177172,-0.05013406669779538,0.00010747705231872258,-1.26345871735864e-07,7.779593983387778e-11,-1.9548452922385355e-14];
const RIGHT_EDGE=[75.35319463770534,10.512477369559887,-0.040469744940921704,7.832312685364226e-05,-8.302171460931963e-08,4.6249598845596305e-11,-1.0533019481843935e-14];
const THICKP=[-23.066804903310825,0.1991833747990007,-0.00020734567589279022,9.829557433764943e-08];
const Y_START=173, Y_END=1004, ROLL_SHIFT=.75, BRG_FULL=90, HZ_CY=.6, HZ_SPAN=6.3, THICK_SCALE=.84;
const pEval=(co,y)=>{let v=0,p=1;for(const c of co){v+=c*p;p*=y}return v};
const edgeX=(y,side)=>pEval(side==='left'?LEFT_EDGE:RIGHT_EDGE,y);
const thickAt=y=>Math.max(1,pEval(THICKP,y)*THICK_SCALE);
const sideU=t=>{t=clamp(t);const i=.65,u=.38;return t<=i?(t/i)*u:u+((t-i)/Math.max(1e-6,1-i))*(1-u)};
const PY=v=>(((v%360)+360)%360); // python-style modulo for 360
const shortestAngle=dl=>(((dl+180)%360)+360)%360-180;

function roadGeom(att){
  const sx=HW/RW, sy=HH/RH, sAvg=.5*(sx+sy);
  const s=Math.min(RW,RH)/800, phi=att.roll*Math.PI/180;
  const wTop=Math.max(36,edgeX(Y_START+40,'right')-edgeX(Y_START+40,'left'));
  const dyPitch=clamp(att.pitch/30,-1,1)*6*s*32;
  const hcx=RW*.5, hcy=RH*HZ_CY+dyPitch;
  const rollAngle=Math.atan(Math.sin(phi)*1.6);
  const bxl=edgeX(Y_END,'left'), bxr=edgeX(Y_END,'right'), bw=bxr-bxl, shift=-bw*ROLL_SHIFT*Math.sin(phi);
  const bL=[bxl+shift,Y_END], bR=[bxr+shift,Y_END];
  const w=clamp(att.brg/BRG_FULL,-1,1), yRaw=w*(bxr-bxl)/2, maxOff=Math.max(0,((bxr-bxl)-wTop)/2), yOff=clamp(yRaw,-maxOff,maxOff);
  const pcx=hcx+yOff, tlx=pcx-wTop/2, trx=pcx+wTop/2, slope=Math.tan(rollAngle);
  const tL=[tlx,hcy+slope*(tlx-hcx)], tR=[trx,hcy+slope*(trx-hcx)];
  const cB=(bL[0]+bR[0])/2, cT=(tL[0]+tR[0])/2, cM=.5*(cB+cT), steps=32;
  const curve=(b,t)=>{ const pts=[b], pt=t[0]-b[0], pm=cM-b[0];
    for(let i=1;i<=steps;i++){ const u=sideU(i/steps), y=b[1]+u*(t[1]-b[1]), x=b[0]+pm*u*(1-u)+pt*u*u; pts.push([x,y]); } return pts; };
  const L=curve(bL,tL).map(p=>[p[0]*sx,p[1]*sy]), R=curve(bR,tR).map(p=>[p[0]*sx,p[1]*sy]);
  const widths=[]; for(let i=0;i<L.length;i++){ const u=sideU(i/Math.max(1,L.length-1)); widths.push(Math.max(1,thickAt(Y_END+u*(Y_START-Y_END))*sAvg)); }
  const hd=Math.max(bxr-bxl,wTop*HZ_SPAN)*.5, cr=Math.cos(rollAngle), sr=Math.sin(rollAngle);
  const hL=[(hcx-hd*cr)*sx,(hcy-hd*sr)*sy], hR=[(hcx+hd*cr)*sx,(hcy+hd*sr)*sy];
  return {L,R,widths,hL,hR,hw:Math.max(2,thickAt(Y_START+40)*sAvg),tip:[.5*(tL[0]+tR[0])*sx,.5*(tL[1]+tR[1])*sy]};
}
function ribbon(pts,widths){
  const n=pts.length, l=[], r=[];
  for(let i=0;i<n;i++){
    let dx,dy; if(i===0){dx=pts[1][0]-pts[0][0];dy=pts[1][1]-pts[0][1]} else if(i===n-1){dx=pts[i][0]-pts[i-1][0];dy=pts[i][1]-pts[i-1][1]} else {dx=pts[i+1][0]-pts[i-1][0];dy=pts[i+1][1]-pts[i-1][1]}
    const len=Math.hypot(dx,dy)||1, nx=-dy/len, ny=dx/len, rr=Math.max(.5,widths[i]*.5);
    l.push([pts[i][0]+nx*rr,pts[i][1]+ny*rr]); r.push([pts[i][0]-nx*rr,pts[i][1]-ny*rr]);
  }
  return l.concat(r.reverse());
}
const circPts=(x,y,r,n=14)=>Array.from({length:n},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*r,y+Math.sin(i/n*Math.PI*2)*r]);
const rectPts=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
function rrectPts(x,y,w,h,r){ const out=[]; const arc=(cx,cy,a0)=>{ for(let i=0;i<=6;i++){ const a=a0+i/6*Math.PI/2; out.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } };
  arc(x+w-r,y+r,-Math.PI/2); arc(x+w-r,y+h-r,0); arc(x+r,y+h-r,Math.PI/2); arc(x+r,y+r,Math.PI); return out; }
function ladderAlpha(d,gap,fi,ext,fo){
  if(d<gap) return 0;
  if(d<gap+fi){const t=(d-gap)/Math.max(1e-6,fi);return t*t}
  if(d<ext) return 1;
  if(d<ext+fo){const t=1-(d-ext)/Math.max(1e-6,fo);return Math.max(0,t*t)}
  return 0;
}
function ladder(P,{x,midY,barW,barH,pitch,scroll,align,gap,fi,ext,fo}){
  const span=ext+fo+pitch, phase=((scroll%pitch)+pitch)%pitch, n0=Math.floor((-span-phase)/pitch)-1, n1=Math.floor((span-phase)/pitch)+2, lx=align==='left'?x:x-barW;
  for(let n=n0;n<=n1;n++){ const y=midY+phase+n*pitch, a=ladderAlpha(Math.abs(y-midY),gap,fi,ext,fo); if(a<=0) continue;
    P.push({k:'poly',pts:rectPts(lx,Math.round(y-barH/2),barW,barH),fill:true,al:a}); }
}
const T=(s,x,y,size,al,anchor,xs=1.15)=>({k:'text',s,x,y,size,al,anchor,xs});

function hudPrims(st){
  const P=[], att={pitch:st.pitch||0,roll:st.roll||0,brg:st.brg||0}, g=roadGeom(att);
  // road
  P.push({k:'poly',pts:ribbon(g.L,g.widths),fill:true,al:1}); P.push({k:'poly',pts:ribbon(g.R,g.widths),fill:true,al:1});
  for(const side of [g.L,g.R]){ for(const i of [0,side.length-1]) P.push({k:'poly',pts:circPts(side[i][0],side[i][1],Math.max(1,g.widths[i]*.5)),fill:true,al:1}); }
  // heading tape
  const hdg=PY(st.hdg), cx=512, tapeY=138, tl=298, tr=725, pxd=3.5;
  P.push({k:'poly',pts:[[tl,tapeY],[tr,tapeY]],fill:false,lw:4,al:1});
  const step=7.5; let h=Math.floor((hdg-75)/step)*step;
  while(h<=hdg+75+1e-6){
    const dl=shortestAngle(h-hdg), x=cx+dl*pxd;
    if(x>=tl-4&&x<=tr+4){
      const wr=PY(h), m30=wr%30, major=Math.abs(m30)<.05||Math.abs(m30-30)<.05, center=Math.abs(dl)<.05, ht=(major||center)?14:9;
      P.push({k:'poly',pts:[[Math.trunc(x),tapeY-ht],[Math.trunc(x),tapeY]],fill:false,lw:3,al:1});
      if(major&&!center){ const a=ladderAlpha(Math.abs(x-cx),58,14,170,16); if(a>0) P.push(T(pad(Math.round(wr)%360,3),Math.trunc(x),tapeY-14-2,27,a,'mb')); }
    }
    h+=step;
  }
  P.push({k:'poly',pts:rrectPts(cx-54,45,108,46,12),fill:false,lw:5,al:1,closed:true});
  P.push(T(pad(Math.round(hdg)%360,3),cx,68,38,1,'c'));
  // speed
  const spd=clamp(st.spd,0,999), alt=clamp(st.alt,0,9999), vsRaw=clamp(st.vs,-9999,9999), midY=254;
  P.push(T('SPD KT',10,118,30,1,'tl'));
  ladder(P,{x:8,midY,barW:29,barH:10,pitch:25,scroll:((spd%10)/10)*25,align:'left',gap:26,fi:7,ext:97,fo:8});
  P.push({k:'poly',pts:[[46,midY],[8,midY-19],[8,midY+19]],fill:true,al:1});
  P.push(T(String(Math.round(spd)),55,midY,76,1,'ml'));
  // altitude
  P.push(T('ALT FT',1012,118,30,1,'tr'));
  ladder(P,{x:1016,midY,barW:29,barH:10,pitch:25,scroll:((alt%100)/100)*25,align:'right',gap:26,fi:7,ext:72,fo:8});
  P.push({k:'poly',pts:[[980,midY],[1016,midY-19],[1016,midY+19]],fill:true,al:1});
  P.push(T(pad(Math.round(alt),4),972,midY,76,1,'mr'));
  // vertical speed
  P.push(T('VS FT/MIN',1009,424,24,1,'tr'));
  let vs=Math.round(vsRaw/10)*10; if(Math.abs(vs)<20) vs=0;
  P.push(T((vs>=0?'+':'-')+Math.abs(vs),982,484,59,1,'mr'));
  ladder(P,{x:1011,midY:484,barW:17,barH:7,pitch:16,scroll:(((vsRaw%200)+200)%200/200)*16,align:'right',gap:0,fi:0,ext:20,fo:14});
  // waypoint callout above the horizon tip
  if(st.wp){
    const w=st.wp, tx=Math.round(g.tip[0]), brg=PY(Math.round(w.brg));
    let dt=w.dist<10?w.dist.toFixed(1)+' NM':Math.round(w.dist)+' NM'; if(w.eta>0) dt+=' '+Math.max(1,Math.round(w.eta))+"'";
    const lines=[pad(brg,3)+'°',dt,w.name], sizes=[36,26,30], gapL=4, hs=sizes.map(z=>z+gapL), blockH=hs.reduce((a,b)=>a+b,0)-gapL;
    let y=Math.round(g.tip[1]-18-blockH);
    lines.forEach((tx2,i)=>{ P.push(T(tx2,tx,y,sizes[i],1,'mt')); y+=hs[i]; });
  }
  // horizon line (drawn last)
  P.push({k:'poly',pts:[g.hL,g.hR],fill:false,lw:g.hw,al:1,flat:true});
  return P;
}
const hudColor=(a,col=[110,255,90])=>`rgba(${col[0]},${col[1]},${col[2]},${a})`;
// pygame rect-anchored text → canvas (font line box ≈ 1.2em, glyph centre ≈ .5em above baseline+.3)
function textBox(c,t,al,col){
  c.font=`${t.size}px DDIN`; c.fillStyle=hudColor(al,col);
  const a=t.anchor; c.textAlign=(a==='ml'||a==='tl')?'left':(a==='mr'||a==='tr')?'right':'center';
  const dyMap={ml:.34,mr:.34,c:.34,mb:-.2,mt:.84,tl:.84,tr:.84}; // baseline offset (em) from anchor y
  return dyMap[a]*t.size;
}
function drawHud(c,P,x,y,w,a=1,col){
  const s=w/HW; c.save(); c.translate(x,y); c.scale(s,s); c.lineJoin='miter'; c.lineCap='butt';
  glowOn(c,hudColor(.55*a,col),10/s);
  for(const p of P){ const al=(p.al??1)*a; if(al<=.01) continue;
    if(p.k==='poly'){ c.beginPath(); p.pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1])); if(p.closed) c.closePath();
      if(p.fill){c.fillStyle=hudColor(al,col);c.fill()} else {c.strokeStyle=hudColor(al,col);c.lineWidth=p.lw;c.stroke()} }
    else { c.save(); c.translate(p.x,p.y); c.scale(p.xs,1); const dy=textBox(c,p,al,col); c.textBaseline='alphabetic'; c.fillText(p.s,0,dy); c.restore(); } }
  glowOff(c); c.restore();
}
// mappa il display su un quad 3D: map(x,y)->[X,Y] (coordinate display) oppure null
function drawHudMapped(c,P,map,a=1,col){
  const o0=map(0,0),o1=map(HW,0); if(!o0||!o1) return; const k=Math.hypot(o1[0]-o0[0],o1[1]-o0[1])/HW;
  glowOn(c,hudColor(.6*a,col),8);
  for(const p of P){ const al=(p.al??1)*a; if(al<=.01) continue;
    if(p.k==='poly'){ const q=p.pts.map(v=>map(v[0],v[1])); if(q.some(v=>!v)) continue;
      c.beginPath(); q.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1])); if(p.closed) c.closePath();
      if(p.fill){c.fillStyle=hudColor(al,col);c.fill()} else {c.strokeStyle=hudColor(al,col);c.lineWidth=Math.max(1,p.lw*k);c.stroke()} }
    else { const a0=map(p.x,p.y),a1=map(p.x+100,p.y),a2=map(p.x,p.y+100); if(!a0||!a1||!a2) continue;
      c.save(); c.setTransform((a1[0]-a0[0])/100,(a1[1]-a0[1])/100,(a2[0]-a0[0])/100,(a2[1]-a0[1])/100,a0[0],a0[1]);
      c.scale(p.xs,1); const dy=textBox(c,p,al,col); c.fillText(p.s,0,dy); c.restore(); } }
  glowOff(c);
}
/* glass: tracciato del vetro (cornice) in coordinate canvas */
function hudGlass(c,x,y,w,p,a=1){
  const h=w*HH/HW; if(p<=0) return;
  c.save(); c.lineWidth=1.6; c.strokeStyle=BL(.7*a); glowOn(c,BL(.5),8); traceRect(c,x,y,w,h,p); glowOff(c);
  c.fillStyle=`rgba(70,150,255,${.06*clamp(p*2)*a})`; c.fillRect(x,y,w,h); c.restore();
}
const hudH=w=>w*HH/HW;
