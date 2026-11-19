/* ---------- AD 04 · REVIEW YOUR FLIGHT AFTER LANDING ---------- */
const TRACK=[[.04,.86],[.12,.7],[.2,.58],[.18,.4],[.32,.3],[.46,.38],[.58,.26],[.72,.18],[.84,.3],[.9,.5],[.8,.66],[.66,.74],[.52,.84],[.36,.9]];
// profilo di quota 0..1 -> ft (salita, crociera, discesa)
const altAt=u=>7200*(sstep(clamp(u/.22))-sstep(clamp((u-.72)/.28)))+260*Math.sin(u*40)*Math.min(1,u*8)*(1-sstep(clamp((u-.75)/.2)))+400*Math.sin(u*9)*sstep(clamp((u-.25)/.2))*(1-sstep(clamp((u-.65)/.1)));
IMPL.s1={
  init(){ this.k=prepChars($('s1k')); this.a=prepChars($('s1a')); this.b=prepChars($('s1b')); },
  cam(lt,D){ return {x:-6*lt/D,y:-3*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,rev:E.outCubic(prog(lt,0,1.3)),orbs:[{x:300,y:600,r:900,c:'rgba(40,100,255,.13)'},{x:700,y:1250,r:700,c:`rgba(110,255,90,${.09*prog(lt,2,3)})`}]} },
  update(lt){
    animChars(this.k,lt,.2,.02,.5,60);
    animChars(this.a,lt,.3,.05,.75,70); chroma($('s1a'),glitch(lt,.3,1.1,12));
    animChars(this.b,lt,.8,.045,.7,70); chroma($('s1b'),glitch(lt,.8,1.5,9));
    plate(lt,'04','fig. 4 — flight replay');

    const X=80, W0=920, u=E.inOutCubic(prog(lt,2.3,6.6));
    // ---- mappa con la traccia
    const my=830, mh=450, mp=E.outCubic(prog(lt,.9,1.7));
    d.strokeStyle=BL(.6*mp); d.lineWidth=1.3; traceRect(d,X,my,W0,mh,mp);
    mono(d,'GROUND TRACK',X+20,my+34,13,BL(.75*mp),'left',700,3);
    mono(d,'KLAX → KSAN',X+W0-20,my+34,13,BL(.6*mp),'right',600,2);
    d.save(); d.beginPath(); d.rect(X+1,my+1,W0-2,mh-2); d.clip(); d.globalAlpha=mp;
    d.strokeStyle=BL(.10); d.lineWidth=1; for(let i=1;i<23;i++) line(d,X+i*40,my,X+i*40,my+mh); for(let i=1;i<11;i++) line(d,X,my+i*40,X+W0,my+i*40);
    const pts=TRACK.map(([a,b])=>[X+30+a*(W0-60),my+60+b*(mh-100)]), head=u*(pts.length-1);
    d.strokeStyle=BL(.35); d.lineWidth=1.5; d.setLineDash([4,7]); d.beginPath(); pts.forEach((p,i)=>i?d.lineTo(p[0],p[1]):d.moveTo(p[0],p[1])); d.stroke(); d.setLineDash([]);
    d.strokeStyle=GR(.95); d.lineWidth=3.2; glowOn(d,GR(.8),9); const hp=polyPartial(d,pts,head); glowOff(d);
    d.fillStyle=GR(1); d.fillRect(pts[0][0]-6,pts[0][1]-6,12,12); if(head>=pts.length-1.01) d.fillRect(pts[pts.length-1][0]-6,pts[pts.length-1][1]-6,12,12);
    mono(d,'TAKEOFF',pts[0][0]+14,pts[0][1]+22,12,BL(.9),'left',700,1);
    if(head>=pts.length-1.01) mono(d,'LANDING',pts[pts.length-1][0]-14,pts[pts.length-1][1]-14,12,GR(1),'right',700,1);
    if(hp&&lt>2.2){ const n=Math.min(pts.length-2,Math.floor(head)), ang=Math.atan2(pts[n+1][1]-pts[n][1],pts[n+1][0]-pts[n][0]);
      d.save(); d.translate(hp[0],hp[1]); d.rotate(ang+Math.PI/2); d.fillStyle='#fff'; d.beginPath(); d.moveTo(0,-11); d.lineTo(8,10); d.lineTo(0,5); d.lineTo(-8,10); d.closePath(); d.fill(); d.restore(); }
    d.restore();

    // ---- profilo di quota con cursore
    const cy=1330, ch=230, cp=E.outCubic(prog(lt,1.3,2.1));
    d.strokeStyle=BL(.6*cp); d.lineWidth=1.3; traceRect(d,X,cy,W0,ch,cp);
    mono(d,'ALTITUDE PROFILE',X+20,cy+34,13,BL(.75*cp),'left',700,3);
    mono(d,'FT',X+W0-20,cy+34,13,BL(.6*cp),'right',600,2);
    const gx0=X+24, gx1=X+W0-24, gy0=cy+ch-24, gy1=cy+62, N=120, ax=k=>gx0+k*(gx1-gx0), ay=a=>gy0-(a/8000)*(gy0-gy1);
    d.strokeStyle=BL(.12*cp); d.lineWidth=1; for(let i=0;i<4;i++) line(d,gx0,gy0-i*(gy0-gy1)/3,gx1,gy0-i*(gy0-gy1)/3);
    d.beginPath(); d.moveTo(ax(0),gy0); for(let i=0;i<=N*u;i++) d.lineTo(ax(i/N),ay(altAt(i/N))); d.lineTo(ax(u),gy0); d.closePath(); d.fillStyle=`rgba(110,255,90,${.10*cp})`; d.fill();
    d.strokeStyle=GR(.95*cp); d.lineWidth=2.4; glowOn(d,GR(.7),7); d.beginPath(); for(let i=0;i<=N*u;i++){ const x=ax(i/N), y=ay(altAt(i/N)); i?d.lineTo(x,y):d.moveTo(x,y); } d.stroke(); glowOff(d);
    if(u>0&&lt>2.2){ d.strokeStyle=INK; d.lineWidth=1.4; line(d,ax(u),gy1-14,ax(u),gy0); dot(d,ax(u),ay(altAt(u)),5,'#fff'); }

    // ---- lettura al cursore + comandi replay
    const alt=Math.round(altAt(u)/10)*10, tmin=Math.round(u*102), spd=Math.round(96+18*Math.sin(u*9)), vs=Math.round((altAt(Math.min(1,u+.01))-altAt(u))*.6/10)*10*3;
    const ra=prog(lt,2.0,2.6), ry=1612;
    [['TIME',`${pad(Math.floor(tmin/60))}:${pad(tmin%60)}`],['ALT',`${alt} FT`],['SPD',`${spd} KT`],['VS',`${vs>=0?'+':'-'}${Math.abs(vs)}`]].forEach((r,i)=>{
      const x=X+i*230; mono(d,r[0],x,ry,12,BL(.5*ra),'left',600,3); mono(d,r[1],x,ry+34,24,BL(.97*ra),'left',500,1);
    });
    // scrub bar
    const sy=1730; d.strokeStyle=BL(.5*ra); d.lineWidth=1.2; line(d,X,sy,X+W0,sy);
    d.strokeStyle=GR(.95*ra); d.lineWidth=3; glowOn(d,GR(.8),8); line(d,X,sy,X+W0*u,sy); glowOff(d); dot(d,X+W0*u,sy,7,`rgba(255,255,255,${ra})`);
    mono(d,u<1&&lt<6.6?'▶  REPLAY  4×':'■  LANDED · 01:42',X,sy+44,14,GR(.95*ra),'left',700,3);
    mono(d,'KLAX → KSAN',X+W0,sy+44,12,BL(.5*ra),'right',500,1);
    flare(o,ax(u),ay(altAt(u)),.5,.6*cp*(u>0&&u<1?1:0));
  }
};
