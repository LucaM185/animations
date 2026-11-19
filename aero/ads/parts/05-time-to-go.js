/* ---------- AD 05 · QUICKLY SEE TIME TO GET TO A GIVEN PLACE ---------- */
// destinazioni: nome, rilevamento assoluto (°), distanza (NM) — ETA a 100 kt
const DESTS=[['KSMO',40,18],['KCRQ',250,41],['KSAN',150,62]];
const SEL=[[2.3,3.9],[3.9,5.5],[5.5,9]];   // quale destinazione e' selezionata, e quando
IMPL.s1={
  init(){ this.k=prepChars($('s1k')); this.a=prepChars($('s1a')); this.b=prepChars($('s1b')); },
  cam(lt,D){ return {x:5*lt/D,y:-4*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,rev:E.outCubic(prog(lt,0,1.3)),orbs:[{x:300,y:600,r:900,c:'rgba(40,100,255,.13)'},{x:540,y:1100,r:640,c:`rgba(110,255,90,${.10*prog(lt,2,3)})`}]} },
  update(lt){
    animChars(this.k,lt,.2,.02,.5,60);
    animChars(this.a,lt,.3,.05,.75,70); chroma($('s1a'),glitch(lt,.3,1.1,12));
    animChars(this.b,lt,.8,.045,.7,70); chroma($('s1b'),glitch(lt,.8,1.5,9));
    plate(lt,'05','fig. 5 — distance & ETA');

    // ---- radar con anelli di distanza
    const RX=540, RY=1075, R=230, rp=E.outCubic(prog(lt,.9,1.8));
    d.lineWidth=1.3;
    [1,.66,.33].forEach((k,i)=>{ d.strokeStyle=BL((.55-i*.1)*rp); d.beginPath(); d.arc(RX,RY,R*k*rp,0,Math.PI*2); d.stroke(); });
    d.strokeStyle=BL(.18*rp); line(d,RX-R,RY,RX+R,RY); line(d,RX,RY-R,RX,RY+R);
    mono(d,'N',RX,RY-R-14,13,BL(.7*rp),'center',700,2);
    mono(d,'60 NM',RX+R*.70,RY-R*.70-10,11,BL(.45*rp),'left',500,1); mono(d,'40',RX+R*.46,RY-R*.46-8,11,BL(.4*rp),'left',500,1);
    const sw=lt*1.1, sg=d.createConicGradient(sw-Math.PI/2,RX,RY); // fascio che ruota
    sg.addColorStop(0,'rgba(110,255,90,0)'); sg.addColorStop(.92,'rgba(110,255,90,0)'); sg.addColorStop(.995,`rgba(110,255,90,${.20*rp})`); sg.addColorStop(1,'rgba(110,255,90,0)');
    d.fillStyle=sg; d.beginPath(); d.arc(RX,RY,R,0,Math.PI*2); d.fill();
    // ownship
    d.fillStyle='#fff'; d.beginPath(); d.moveTo(RX,RY-12); d.lineTo(RX+9,RY+11); d.lineTo(RX,RY+6); d.lineTo(RX-9,RY+11); d.closePath(); d.fill();
    // destinazioni
    let cur=null; DESTS.forEach((ds,i)=>{
      const [nm,brg,dist]=ds, a=brg*Math.PI/180, r=Math.min(R-12,dist/70*R), x=RX+Math.sin(a)*r, y=RY-Math.cos(a)*r, ap=E.outCubic(prog(lt,1.5+i*.2,2.2+i*.2));
      const sel=lt>=SEL[i][0]&&lt<SEL[i][1]; if(sel) cur=ds;
      if(sel){ d.strokeStyle=GR(.9); d.lineWidth=2.2; glowOn(d,GR(.8),9); d.setLineDash([8,7]); line(d,RX,RY,x,y); d.setLineDash([]); glowOff(d);
        d.strokeStyle=GR(.95); d.lineWidth=2; d.strokeRect(x-12,y-12,24,24); }
      d.fillStyle=sel?GR(1):BL(.85*ap); d.fillRect(x-5*ap,y-5*ap,10*ap,10*ap);
      const left=x<RX, eta=Math.max(1,Math.round(dist/100*60));
      mono(d,nm,x+(left?-18:18),y-4,15,sel?GR(1):BL(.9*ap),left?'right':'left',700,2);
      mono(d,eta+' min',x+(left?-18:18),y+18,14,sel?INK:BL(.55*ap),left?'right':'left',500,1);
    });
    // riga di riepilogo sotto il radar
    const hy=1370; if(cur){ const ep=Math.max(1,Math.round(cur[2]/100*60));
      mono(d,`→ ${cur[0]}  ·  ${cur[2]} NM  ·  ETA`,80,hy,17,BL(.9),'left',600,2); mono(d,`${ep} MIN`,1000,hy+4,38,GR(1),'right',700,2); }
    else mono(d,'SELECT A DESTINATION',80,hy,17,BL(.55*prog(lt,1.8,2.3)),'left',600,3);
    d.strokeStyle=BL(.45); d.lineWidth=1.2; line(d,80,hy+22,1000,hy+22,E.outExpo(prog(lt,1.6,2.4)));

    // ---- HUD con il waypoint scelto
    const gw=700, gx=190, gy=1448, gh=hudH(gw), pf=E.outCubic(prog(lt,1.2,2.0)), sa=E.outCubic(prog(lt,1.8,2.5));
    const hdg=88; // rilevamento relativo che scorre morbido tra le selezioni
    const idx=SEL.findIndex(s=>lt>=s[0]&&lt<s[1]);
    let rel=0, dd=62;
    if(idx>=0){ const s=SEL[idx], prev=idx>0?DESTS[idx-1]:null, now=DESTS[idx], q=E.inOutCubic(prog(lt,s[0],s[0]+.5));
      const rl=ds=>((ds[1]-hdg+540)%360)-180; rel=prev?lerp(rl(prev),rl(now),q):rl(now)*q; dd=prev?lerp(prev[2],now[2],q):lerp(62,now[2],q); }
    dd=Math.max(.5,dd-Math.max(0,lt-SEL[Math.max(0,idx)][0]-.5)*.6*(idx>=0?1:0));
    hudAt(gx,gy,gw,{hdg,spd:100,alt:3500,vs:0,pitch:2,roll:-8*Math.sin(rel/60),brg:clamp(rel,-90,90),wp:{brg:hdg+rel,name:(cur||DESTS[2])[0],dist:dd,eta:dd/100*60}},pf,sa);
    mono(d,'WAYPOINT ON THE HUD',gx,gy-16,13,GR(.9*pf),'left',700,3);
    flare(o,RX,RY,.5,.5*rp);
  }
};
