/* ---------- AD 06 · ROTATE TO SET CURRENT QNH VALUE ---------- */
const QNH0=1013, QSTEPS=9, FT_PER_HPA=27;   // +1 hPa = circa +27 ft sull'altimetro
IMPL.s1={
  init(){ this.k=prepChars($('s1k')); this.a=prepChars($('s1a')); this.c=prepChars($('s1c')); },
  cam(lt,D){ return {x:-5*lt/D,y:-3*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,rev:E.outCubic(prog(lt,0,1.3)),orbs:[{x:300,y:600,r:900,c:'rgba(40,100,255,.13)'},{x:540,y:1090,r:620,c:`rgba(110,255,90,${.10*prog(lt,2,3)})`}]} },
  update(lt){
    animChars(this.k,lt,.2,.02,.5,60);
    animChars(this.a,lt,.3,.08,.9,70); chroma($('s1a'),glitch(lt,.3,1.2,14));
    animChars(this.c,lt,1.0,.03,.5,60);
    plate(lt,'06','fig. 6 — altimeter setting');

    // ---- manopola
    const KX=540, KY=1050, KR=190, kp=E.outCubic(prog(lt,.9,1.8));
    const rot=E.inOutCubic(prog(lt,2.4,5.2)), steps=rot*QSTEPS, notch=Math.round(steps), stepAng=12*Math.PI/180, ang=steps*stepAng;
    const qnh=QNH0+notch, done=prog(lt,5.2,5.7);
    // anello esterno a tacche, ruota con la manopola
    d.save(); d.translate(KX,KY); d.rotate(ang);
    d.lineWidth=1.6; for(let i=0;i<60;i++){ const a=i/60*Math.PI*2, major=i%5===0, r0=KR+(major?4:10), r1=KR+(major?30:22);
      d.strokeStyle=BL((major?.9:.5)*kp); d.beginPath(); d.moveTo(Math.sin(a)*r0*kp,-Math.cos(a)*r0*kp); d.lineTo(Math.sin(a)*r1*kp,-Math.cos(a)*r1*kp); d.stroke(); }
    d.strokeStyle=BL(.9*kp); d.lineWidth=2.2; glowOn(d,BL(.5),8); d.beginPath(); d.arc(0,0,KR*kp,0,Math.PI*2); d.stroke(); glowOff(d);
    d.strokeStyle=BL(.35*kp); d.lineWidth=1.2; d.beginPath(); d.arc(0,0,KR*.82*kp,0,Math.PI*2); d.stroke();
    // indicatore
    d.strokeStyle=GR(.95*kp); d.lineWidth=5; d.lineCap='round'; glowOn(d,GR(.9),12); d.beginPath(); d.moveTo(0,-KR*.82); d.lineTo(0,-KR*.62); d.stroke(); glowOff(d); d.lineCap='butt';
    d.restore();
    // freccia indice fissa in alto
    d.fillStyle=GR(.95*kp); glowOn(d,GR(.8),8); d.beginPath(); d.moveTo(KX,KY-KR-44); d.lineTo(KX-9,KY-KR-62); d.lineTo(KX+9,KY-KR-62); d.closePath(); d.fill(); glowOff(d);
    // frecce di rotazione
    const ra=prog(lt,1.8,2.4)*(1-prog(lt,5.0,5.5));
    if(ra>0){ d.strokeStyle=GR(.9*ra); d.lineWidth=3; glowOn(d,GR(.7),8); const a0=-.55*Math.PI, a1=.05*Math.PI+rot*0; d.beginPath(); d.arc(KX,KY,KR+66,a0+rot*.25,a0+.62*Math.PI+rot*.25); d.stroke(); glowOff(d);
      const ea=a0+.62*Math.PI+rot*.25, ex=KX+Math.cos(ea)*(KR+66), ey=KY+Math.sin(ea)*(KR+66);
      d.fillStyle=GR(.9*ra); d.save(); d.translate(ex,ey); d.rotate(ea+Math.PI/2); d.beginPath(); d.moveTo(0,-14); d.lineTo(-10,6); d.lineTo(10,6); d.closePath(); d.fill(); d.restore(); }
    // lettura al centro
    mono(d,'QNH',KX,KY-52,16,BL(.7*kp),'center',700,6);
    mono(d,String(qnh),KX,KY+38,100,done>0?GR(1):INK,'center',700,2);
    mono(d,'hPa',KX,KY+84,18,BL(.7*kp),'center',500,4);
    // scatto ad ogni tacca
    const near=Math.abs(steps-notch); if(rot>0&&rot<1&&near<.1) flare(o,KX,KY-KR-10,.25,(1-near/.1)*.5);
    mono(d,'STD 1013',KX-KR-30,KY+KR+84,13,BL(.55*kp),'left',600,3);
    mono(d,done>0?'SET ✓':'SETTING',KX+KR+30,KY+KR+84,13,done>0?GR(.95):BL(.7*kp),'right',700,3);

    // ---- HUD: la quota segue il QNH
    const gw=700, gx=190, gy=1385, gh=hudH(gw), pf=E.outCubic(prog(lt,1.2,2.0)), sa=E.outCubic(prog(lt,1.8,2.5));
    const alt=2400+(qnh-QNH0)*FT_PER_HPA;
    hudAt(gx,gy,gw,{hdg:88+Math.sin(lt*.5)*3,spd:100+Math.sin(lt)*2,alt,vs:0,pitch:2*Math.sin(lt*.8),roll:5*Math.sin(lt*.7),brg:0},pf,sa);
    mono(d,'ALTITUDE FOLLOWS QNH',gx,gy-16,13,GR(.9*pf),'left',700,3);
    // collegamento manopola -> campo ALT
    const la=prog(lt,2.4,3.0), p0=[KX+KR*.55,KY+KR*.9], p1=[gx+gw*.93,gy+gh*.30];
    if(la>0){ d.strokeStyle=BL(.45*la); d.lineWidth=1.4; d.setLineDash([5,7]); d.beginPath(); d.moveTo(p0[0],p0[1]); d.lineTo(p1[0],p0[1]+0); d.lineTo(p1[0],p1[1]-30); d.stroke(); d.setLineDash([]);
      for(let i=0;i<3;i++){ const u=frac(lt*.6+i/3); dot(d,p0[0]+(p1[0]-p0[0])*clamp(u*2),u<.5?p0[1]:lerp(p0[1],p1[1]-30,(u-.5)*2),3.5,GR(1-Math.abs(u-.5)*1.3)); } }
    mono(d,`+${(qnh-QNH0)*FT_PER_HPA} FT`,gx+gw,gy+gh+44,16,GR(.95*prog(lt,2.8,3.3)),'right',700,2);
    mono(d,'altimeter corrected',gx,gy+gh+44,13,BL(.6*prog(lt,2.8,3.3)),'left',500,1);
    if(done>0) flare(o,gx+gw*.93,gy+gh*.30,.45,(1-done)*.9);
  }
};
