/* Locally hosted plush sprites with the original Nori mascot. */
'use strict';
(()=>{
 const P=NoriPlay,{W,H,PX,G}=NoriRun;
 const art={pilot:P.image('assets/playground/space/nori-rocket-seated-v1.png'),rocket:P.image('assets/playground/space/rocket-plush-v1.png'),planet:P.image('assets/playground/space/planet-plush-v1.png'),meteor:P.image('assets/playground/space/meteor-plush-v1.png')};
 const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
 const pill=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
 function label(c,t,x,y,size=12,color='#fff9ed'){
  const str=window.NoriI18n?NoriI18n.t(t):t;c.fillStyle=color;c.textAlign='center';c.font=`800 ${size}px system-ui,sans-serif`;c.fillText(str,x,y,410);
 }
 function hull(c,scale=1){
  c.save();c.scale(scale,scale);
  if(art.rocket.complete&&art.rocket.naturalWidth){c.drawImage(art.rocket,-64,-28,128,64);c.restore();return;}
  // Soft fins, cream belly, lime nose and a little star insignia.
  c.fillStyle='#d29cc7';c.beginPath();c.moveTo(-28,-9);c.quadraticCurveTo(-45,-37,-57,-22);c.lineTo(-46,4);c.fill();
  c.beginPath();c.moveTo(-25,12);c.quadraticCurveTo(-42,38,-55,28);c.lineTo(-44,4);c.fill();
  oval(c,-10,0,47,18,'#c9e982');oval(c,-7,8,43,10,'#fff3cf');
  c.fillStyle='#9ac96a';c.beginPath();c.moveTo(23,-16);c.quadraticCurveTo(58,-3,47,8);c.quadraticCurveTo(38,16,23,16);c.closePath();c.fill();
  pill(c,-55,-12,11,24,5,'#94b682');P.star(c,0,0,9,'#f4be67');
  oval(c,28,-5,3,3,'#fff9e9');pill(c,-34,10,13,3,2,'#e0cfaa');c.restore();
 }
 function pickup(c,x,y,t){
  c.save();c.translate(x,y+(P.reduced?0:Math.sin(t*4)*3));
  oval(c,0,0,26,26,'#fff9e3ba');c.strokeStyle='#b39bd5';c.lineWidth=2;c.beginPath();c.arc(0,0,23,0,7);c.stroke();
  c.rotate(-.55);hull(c,.36);P.star(c,-25,0,5,'#f7c76e');c.restore();
 }
 function rocket(c,x,y,im,time,reduced){
  c.save();c.translate(x,y);
  for(let i=0;i<5;i++){const shift=reduced?i*14:(time*160+i*17)%92;P.star(c,-58-shift,Math.sin(i*2+time*4)*(reduced?3:9),Math.max(2,7-shift*.04),i%2?'#efadd2':'#ffe4a0')}
  // The seated pilot, cockpit rim and paws are one coherent sprite: no floating head.
  if(art.pilot.complete&&art.pilot.naturalWidth){const width=148,height=width*art.pilot.naturalHeight/art.pilot.naturalWidth;c.drawImage(art.pilot,-74,-height*.68,width,height);c.restore();return;}
  // Loading fallback; play is gated on all sprite decodes.
  oval(c,-3,-42,31,34,'#c8eaff25');
  c.save();c.beginPath();c.ellipse(-3,-42,30,33,0,0,7);c.clip();
  if(im.complete&&im.naturalWidth)c.drawImage(im,140,0,310,300,-32,-75,60,58);
  c.restore();
  c.strokeStyle='#e0f6ffb8';c.lineWidth=2;c.beginPath();c.ellipse(-3,-42,31,34,0,0,7);c.stroke();
  c.strokeStyle='#ffffffc9';c.lineWidth=3;c.beginPath();c.ellipse(-3,-42,25,28,0,3.5,4.4);c.stroke();
  hull(c);c.restore();
 }
 function space(c,s,reduced){
  const travel=reduced?0:s.travel;
  const gradient=c.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#38334f');gradient.addColorStop(.55,'#716184');gradient.addColorStop(1,'#a58a9b');c.fillStyle=gradient;c.fillRect(0,0,W,H);
  // Wide, softly lit nebulae keep the tactile toys in a warm, calm backdrop.
  for(const [x,y,r,color] of [[375,265,230,'#e6b6cc32'],[70,90,210,'#a9b2da24']]){const glow=c.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,color);glow.addColorStop(1,'#ffffff00');c.fillStyle=glow;c.fillRect(0,0,W,H)}

  for(let i=0;i<65;i++){const z=.17+(i%4)*.16,x=((i*137-travel*z)%540+540)%540-30,y=24+(i*73)%310;
   oval(c,x,y,i%7===0?1.8:.8,i%7===0?1.8:.8,i%3?'#fff8e9b0':'#e5c6efaa');
   if(i%11===0)P.star(c,x,y,3,'#ffeeccc0');
  }
  // A little padded moon, shaded in the same warm light as the plush sprites.
  c.save();c.translate(400,87);c.rotate(-.22);
  const moon=c.createRadialGradient(-14,-18,2,0,0,37);moon.addColorStop(0,'#fff3d8');moon.addColorStop(.6,'#e8c9a5');moon.addColorStop(1,'#ad8a80');
  c.fillStyle=moon;c.beginPath();c.moveTo(10,-32);c.bezierCurveTo(-45,-37,-48,35,10,34);c.bezierCurveTo(-16,20,-19,-17,10,-32);c.fill();
  c.strokeStyle='#fff3dc75';c.lineWidth=.8;c.setLineDash([2,2]);c.beginPath();c.moveTo(4,-29);c.bezierCurveTo(-37,-30,-40,29,4,31);c.stroke();c.setLineDash([]);
  oval(c,-24,1,1.6,2.4,'#735f72');oval(c,-22,10,4,2,'#dca6ac');c.restore();
  c.strokeStyle='#d7cef423';c.lineWidth=1;if(!reduced)for(let i=0;i<7;i++){let x=((i*101-s.travel*.8)%600+600)%600-50;c.beginPath();c.moveTo(x,40+i*45);c.lineTo(x+25,40+i*45);c.stroke()}
 }
 function object(c,o,time){
  if(o.kind==='space-star'){P.star(c,o.x,o.y,10,'#ffe4a0');return}
  c.save();c.translate(o.x,o.y);
  const sprite=art[o.kind];
  if(sprite?.complete&&sprite.naturalWidth){
   if(o.kind==='meteor')c.rotate(Math.sin(time*.6+(o.spin||0))*.12);
   const width=o.r*(o.kind==='planet'?3.2:2.35),height=width*sprite.naturalHeight/sprite.naturalWidth;
   c.drawImage(sprite,-width/2,-height/2,width,height);c.restore();return;
  }
  if(o.kind==='planet'){
   c.save();c.rotate(-.35);c.strokeStyle='#f0c6de';c.lineWidth=6;c.beginPath();c.ellipse(0,0,o.r+12,10,0,0,7);c.stroke();c.restore();
   oval(c,0,0,o.r,o.r,'#d9a4c5');oval(c,-8,-9,7,4,'#edc2d9');oval(c,9,11,10,4,'#c38cad');
  }else{
   c.save();c.rotate(o.spin+time*.4);c.fillStyle='#b4b8d7';c.strokeStyle='#e1ddf2';c.lineWidth=2;c.beginPath();
   for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=o.r*(i%2?.85:1);c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();c.stroke();
   oval(c,-6,-7,6,5,'#9399bd');oval(c,7,6,4,4,'#949abc');c.restore();
  }
  oval(c,-6,1,2,3,'#635674');oval(c,6,1,2,3,'#635674');c.strokeStyle='#79627c';c.lineWidth=1.4;c.beginPath();c.arc(0,6,3,0,Math.PI);c.stroke();c.restore();
 }
 function draw(c,s,im,groundScene,reduced){
  const r=s.rocket;space(c,s,reduced);
  if(r.phase!=='flight'){
   const progress=r.phase==='ascent'?Math.min(1,r.phaseTime/NoriRun.ROCKET_ASCENT):1-Math.min(1,r.phaseTime/NoriRun.ROCKET_DESCENT);
   c.save();c.globalAlpha=1-progress;if(!reduced)c.translate(0,progress*H);groundScene();c.restore();
  }
  for(const o of r.objects)object(c,o,s.time);
  if(r.phase==='descent'){
   const x=PX,y=r.y;
   // A small parachute brings Nori home; no loss of a heart on a rocket collision.
   c.strokeStyle='#fff2d6';c.lineWidth=1.5;for(const dx of [-32,0,32]){c.beginPath();c.moveTo(x+dx,y-76);c.lineTo(x,y-15);c.stroke()}
   c.fillStyle='#edbed5';c.beginPath();c.ellipse(x,y-76,38,25,0,Math.PI,Math.PI*2);c.closePath();c.fill();
   c.fillStyle='#fff0b8';c.beginPath();c.ellipse(x,y-76,14,25,0,Math.PI,Math.PI*2);c.closePath();c.fill();
   P.sprite(c,im,x-36,y-47,72,72);
   pill(c,47,23,386,49,20,'#fff9efd9');label(c,r.success?'우주 비행 성공! +200점':'괜찮아! 날아온 거리는 그대로예요',240,53,14,'#6d557c');
  }else{
   rocket(c,PX,r.y,im,s.time,reduced);
   pill(c,112,15,256,52,18,'#29233dbb');label(c,r.phase==='ascent'?'로켓 출발!':'10초 우주 비행',240,35,12);
   for(let i=0;i<NoriRun.ROCKET_SECONDS;i++)pill(c,151+i*18,45,13,7,4,r.left>i?'#d4ed9a':'#ffffff26');
   label(c,'위아래로 움직여 행성과 운석을 피해요',240,H-15,11,'#fff6e1');
  }
 }
 window.NoriRocketVisual={draw,pickup,images:Object.values(art)};
})();
