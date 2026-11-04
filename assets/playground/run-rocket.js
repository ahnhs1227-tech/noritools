/* Canvas-native rocket art uses the existing Nori mascot; no external assets/services. */
'use strict';
(()=>{
 const P=NoriPlay,{W,H,PX,G}=NoriRun;
 const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
 const pill=(c,x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
 function label(c,t,x,y,size=12,color='#fff9ed'){
  const str=window.NoriI18n?NoriI18n.t(t):t;c.fillStyle=color;c.textAlign='center';c.font=`800 ${size}px system-ui,sans-serif`;c.fillText(str,x,y,410);
 }
 function hull(c,scale=1){
  c.save();c.scale(scale,scale);
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
  // The same plush Nori sits behind the hull, inside a transparent helmet.
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
  const gradient=c.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#29264c');gradient.addColorStop(.55,'#58517f');gradient.addColorStop(1,'#8d78a2');c.fillStyle=gradient;c.fillRect(0,0,W,H);
  oval(c,395,275,160,80,'#b49bce14');oval(c,120,70,140,95,'#a6b8ed0c');
  for(let i=0;i<65;i++){const z=.17+(i%4)*.16,x=((i*137-travel*z)%540+540)%540-30,y=24+(i*73)%310;
   oval(c,x,y,i%7===0?1.8:.8,i%7===0?1.8:.8,i%3?'#fff8e9b0':'#e5c6efaa');
   if(i%11===0)P.star(c,x,y,3,'#ffeeccc0');
  }
  // Distant smiling moon: decorative and distinct from incoming outlined hazards.
  oval(c,400,87,35,35,'#e8cfac');oval(c,408,80,35,34,'#6a5b88');
  oval(c,382,88,2,3,'#735f83');oval(c,385,100,5,2,'#d4a9b0');
  c.strokeStyle='#d7cef423';c.lineWidth=1;if(!reduced)for(let i=0;i<7;i++){let x=((i*101-s.travel*.8)%600+600)%600-50;c.beginPath();c.moveTo(x,40+i*45);c.lineTo(x+25,40+i*45);c.stroke()}
 }
 function object(c,o,time){
  if(o.kind==='space-star'){P.star(c,o.x,o.y,10,'#ffe4a0');return}
  c.save();c.translate(o.x,o.y);
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
   pill(c,112,15,256,52,18,'#29233dbb');label(c,r.phase==='ascent'?'로켓 출발!':'5초 우주 비행',240,35,12);
   for(let i=0;i<5;i++)pill(c,163+i*32,45,26,7,4,r.left>i?'#d4ed9a':'#ffffff26');
   label(c,'위아래로 움직여 행성과 운석을 피해요',240,H-15,11,'#fff6e1');
  }
 }
 window.NoriRocketVisual={draw,pickup};
})();
