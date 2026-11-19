/* ---------- AD 03 · SAFETY WARNINGS ---------- */
// tre allarmi in sequenza: [inizio, fine, id, titolo, dettaglio, colore]
const WARNS=[
  [2.5,4.0,'traffic','TRAFFIC','2 o\'clock · 1.2 NM · 300 FT BELOW',AMB],
  [4.2,5.8,'terrain','TERRAIN','PULL UP',RED],
  [6.0,7.4,'stall','STALL','LOW AIRSPEED · LOWER THE NOSE',RED],
];
IMPL.s1={
  init(){ this.k=prepChars($('s1k')); this.a=prepChars($('s1a')); this.b=prepChars($('s1b')); },
  cam(lt,D){ return {x:5*lt/D,y:-4*lt/D,s:1+.03*E.inOutCubic(lt/D),r:0} },
  bg(lt){ return {grid:1,rev:E.outCubic(prog(lt,0,1.3)),orbs:[{x:300,y:600,r:900,c:'rgba(40,100,255,.13)'},{x:640,y:1200,r:640,c:`rgba(110,255,90,${.09*prog(lt,1.4,2.4)})`}]} },
  update(lt){
    animChars(this.k,lt,.2,.02,.5,60);
    animChars(this.a,lt,.3,.05,.75,70); chroma($('s1a'),glitch(lt,.3,1.1,12));
    animChars(this.b,lt,.8,.045,.7,70); chroma($('s1b'),glitch(lt,.8,1.5,9));
    plate(lt,'03','fig. 3 — alerts in the line of sight');

    const gx=90, gy=900, gw=900, gh=hudH(gw);
    const pf=E.outCubic(prog(lt,.9,1.7)), sa=E.outCubic(prog(lt,1.5,2.2));
    // stato di volo: discesa verso il terreno, richiamata, poi velocità bassa
    const desc=E.inOutCubic(prog(lt,3.4,5.2)), rec=E.inOutCubic(prog(lt,5.3,6.2)), slow=E.inOutCubic(prog(lt,5.6,7.0));
    const st={hdg:88+Math.sin(lt*.5)*4,spd:lerp(112,56,slow),alt:2400-950*desc+260*rec,vs:-1100*pulse(lt,3.4,5.4)+500*pulse(lt,5.3,6.6),
      pitch:2-6*pulse(lt,3.4,5.2)+9*slow,roll:6*Math.sin(lt*.7)*(1-slow),brg:14*Math.sin(lt*.55)};
    hudAt(gx,gy,gw,st,pf,sa);
    const act=WARNS.find(w=>lt>=w[0]&&lt<w[1]), flash=Math.floor(lt*4)%2===0;
    // terreno che sale nel riquadro durante l'allarme TERRAIN
    const tr=E.inOutCubic(prog(lt,3.6,5.3))*(1-E.inOutCubic(prog(lt,5.4,6.3)));
    if(tr>0){ d.save(); d.beginPath(); d.rect(gx,gy,gw,gh); d.clip();
      const base=gy+gh+20-tr*(gh*.42), pts=[]; for(let i=0;i<=20;i++){ const x=gx+i*gw/20; pts.push([x,base-(Math.sin(i*1.7)*12+Math.sin(i*.6+1)*20)*tr]); }
      d.beginPath(); d.moveTo(gx,gy+gh); pts.forEach(p=>d.lineTo(p[0],p[1])); d.lineTo(gx+gw,gy+gh); d.closePath(); d.fillStyle=`rgba(255,84,84,${.10*tr})`; d.fill();
      d.strokeStyle=RED(.8*tr); d.lineWidth=2; glowOn(d,RED(.8),8); d.beginPath(); pts.forEach((p,i)=>i?d.lineTo(p[0],p[1]):d.moveTo(p[0],p[1])); d.stroke(); glowOff(d); d.restore(); }
    // traffico: rombo ambra con quota relativa
    const tp=pulse(lt,2.5,4.0); if(tp>0){ const k=E.outCubic(clamp(tp*2)), tx=gx+gw*.68, ty=gy+gh*.40-(1-k)*30;
      d.strokeStyle=AMB(.95*k); d.lineWidth=2.4; glowOn(d,AMB(.8),10); d.beginPath(); d.moveTo(tx,ty-26); d.lineTo(tx+26,ty); d.lineTo(tx,ty+26); d.lineTo(tx-26,ty); d.closePath(); d.stroke(); glowOff(d);
      mono(d,'-03',tx+36,ty+6,18,AMB(.95*k),'left',700,1); }
    // cornice + banner dell'allarme attivo
    if(act){ const col=act[5], on=flash||act[2]==='traffic';
      d.strokeStyle=col(on?.95:.35); d.lineWidth=3; glowOn(d,col(.8),14); d.strokeRect(gx,gy,gw,gh); glowOff(d);
      o.save(); const vg=o.createRadialGradient(540,960,500,540,960,1100); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,col(on?.20:.07)); o.fillStyle=vg; o.fillRect(0,0,1080,1920); o.restore(); }
    // banner sotto l'HUD
    const by=gy+gh+50, bh=130;
    d.strokeStyle=BL(.45*pf); d.lineWidth=1.2; d.strokeRect(gx,by,gw,bh);
    mono(d,'ALERT',gx+gw-24,by+30,12,BL(.55*pf),'right',600,3);
    if(act){ const col=act[5], on=flash||act[2]==='traffic', k=E.outCubic(prog(lt,act[0],act[0]+.25));
      d.fillStyle=col((on?.14:.05)*k); d.fillRect(gx,by,gw,bh);
      d.strokeStyle=col(.95*k); d.lineWidth=3; glowOn(d,col(.8),10); d.beginPath(); d.moveTo(gx+80,by+36); d.lineTo(gx+104,by+86); d.lineTo(gx+56,by+86); d.closePath(); d.stroke(); glowOff(d);
      mono(d,'!',gx+80,by+78,24,col(.95*k),'center',700);
      mono(d,act[3],gx+130,by+80,54,col(.97*k*(on?1:.55)),'left',700,4);
      mono(d,act[4],gx+gw-24,by+bh-18,13,BL(.8*k),'right',500,1);
    } else mono(d,lt<2.5?'MONITORING':'CLEAR',gx+gw/2,by+84,34,GR(.8*pf),'center',700,6);
    // chip dei tre allarmi
    WARNS.forEach((w,i)=>{ const x=gx+i*308, y=by+bh+34, hit=lt>=w[0], on=lt>=w[0]&&lt<w[1], a=prog(lt,1.8+i*.15,2.3+i*.15), col=w[5];
      d.strokeStyle=hit?col(.9*a):BL(.45*a); d.lineWidth=1.3; d.strokeRect(x,y,284,56);
      if(on){ d.fillStyle=col(.14); d.fillRect(x,y,284,56); }
      mono(d,w[3],x+142,y+36,18,hit?col(.95*a):BL(.6*a),'center',700,3);
    });
  }
};
