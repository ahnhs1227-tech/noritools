'use strict';
(()=>{
const P=NoriPlay,{$}=P,{canvas,ctx}=P.canvasStage(),{W:w,H:h,G:ground,PX:px}=NoriRun;
const run=P.image('assets/playground/nori-run.webp'),contact=P.image('assets/playground/nori-contact.webp'),jump=P.image('assets/playground/nori-jump.webp'),slidePose=P.image('assets/playground/nori-slide-v3.webp');
let model=NoriRun.create(),s=model.s,particles=[],floaters=[],banner='별사탕 숲으로 출발!',bannerTime=3,shake=0,lastSound=0,lastBiome=0,held=false,hudTime=0;
const game=P.controller({key:'run',onStart(){model=NoriRun.create();s=model.s;particles=[];floaters=[];banner='별사탕 숲으로 출발!';bannerTime=3;shake=0;lastSound=0;lastBiome=0;held=false;hudTime=0;hud();P.runMusic?.start()},onPause(){release();P.runMusic?.pause()},onResume(){release();P.runMusic?.resume()}});
const effectsButton=$('game-mute'),toggleEffects=effectsButton.onclick;
function effectLabel(){effectsButton.textContent=effectsButton.textContent.replace(/^소리/,'효과음')}
effectLabel();effectsButton.onclick=()=>{toggleEffects?.();effectLabel()};
function leap(){if(game.phase==='running'&&model.jump()){P.sound('jump');burst(px,ground-s.y-8,'#ffffff',9)}}
function release(){held=false;model.slide(false);$('slide-button').classList.remove('is-held')}
function duck(){if(game.phase!=='running')return;held=true;model.slide(true);$('slide-button').classList.add('is-held')}
canvas.addEventListener('pointerdown',e=>{if(game.phase==='running'){e.preventDefault();leap()}});
$('jump-button').addEventListener('pointerdown',e=>{e.preventDefault();leap()});
$('jump-button').addEventListener('click',e=>{if(e.detail===0)leap()});
$('slide-button').addEventListener('pointerdown',e=>{e.preventDefault();$('slide-button').setPointerCapture(e.pointerId);duck()});
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('slide-button').addEventListener(type,release);
$('slide-button').addEventListener('keydown',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();duck()}});
$('slide-button').addEventListener('keyup',release);
$('slide-button').addEventListener('blur',release);
document.addEventListener('keydown',e=>{
 if(game.phase!=='running'||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;
 // Cancel native scrolling before rejecting repeats or checking focused buttons.
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
  e.preventDefault();if(e.code==='ArrowUp'&&!e.repeat)leap();if(e.code==='ArrowDown')duck();return;
 }
 if(e.target.closest('button,a'))return;
 if(['Space','KeyW','KeyS'].includes(e.code)){e.preventDefault();if(e.repeat)return;if(e.code==='KeyS')duck();else leap()}
});
document.addEventListener('keyup',e=>{if(['ArrowDown','KeyS'].includes(e.code))release()});
function hud(){
 $('score').textContent=model.total().toLocaleString();$('distance').textContent=Math.floor(s.distance)+'m';$('lives').textContent='♥'.repeat(s.hearts)+'♡'.repeat(3-s.hearts);$('lives').setAttribute('aria-label','남은 기회 '+s.hearts+'번');$('stars').textContent=s.stars+'개';
 $('fever-fill').style.width=(s.fever>0?s.fever/NoriRun.FEVER_SECONDS:s.charge/NoriRun.FEVER_STARS)*100+'%';$('fever-label').textContent=s.fever>0?`피버 ${Math.ceil(s.fever)}초 · 무적 + 사탕 2배`:`별사탕 ${s.charge} / ${NoriRun.FEVER_STARS} · 모으면 피버!`;
 $('run-combo').textContent=s.combo>=5?s.combo+' COMBO':'SWEET RUN';
 $('run-power').textContent=[s.magnet>0?'자석 '+s.magnet.toFixed(1)+'초':'',s.shield>0?'보호막 '+Math.ceil(s.shield)+'초':''].filter(Boolean).join(' · ')||'2단 점프 + 슬라이드';
 $('run-zone').textContent='Lv.'+s.level+' · '+['별사탕 숲','복숭아 구름길','보랏빛 꿈길'][Math.floor(s.distance/300)%3];
 $('run-mission').textContent=s.distance>=300&&s.stars>=30?'첫 도전 성공! 더 멀리 달려봐요.':`첫 도전 · ${Math.min(300,Math.floor(s.distance))}/300m · 별사탕 ${Math.min(30,s.stars)}/30개`;
}
function burst(x,y,color,n=10){if(P.reduced)return;for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*140,vy:-30-Math.random()*130,t:.55,c:color});if(particles.length>100)particles.splice(0,particles.length-100)}
function message(text){banner=text;bannerTime=1.8;game.announce(text)}
function update(dt){if(game.phase!=='running')return;model.step(dt);for(const e of s.events){
 if(e.type==='star'){burst(e.x,e.y,'#ffdc70',5);if(s.time-lastSound>.09){P.sound();lastSound=s.time}if(s.combo%5===0)floaters.push({x:e.x,y:e.y,text:s.combo+' COMBO',t:.8})}
 if(e.type==='damage'){shake=.22;burst(px,ground-s.y-40,'#f7a3ab',14);P.sound('bad');message('괜찮아, 다시 달려보자!')}
 if(e.type==='fever'){message('SWEET FEVER! 무적 + 사탕 2배');P.sound('win');burst(px,ground-50,'#e7f89b',24)}
 if(e.type==='shield')message('보호막! 한 번 막아줘요');if(e.type==='magnet')message('3초 자석! 가까운 사탕만 쏙');if(e.type==='magnet-end')message('자석 끝! 다시 점프해서 모아요');
 if(e.type==='protect'){burst(px,ground-35,'#a9e5ff',20);message('보호막이 지켜줬어요!')}
 if(e.type==='smash')burst(e.x,e.y,'#f5cd90',12);
 if(e.type==='land')burst(px,ground-s.y,'#fff9df',5);
 }
 const level=s.level;if(level!==lastBiome&&level>1){lastBiome=level;message('LEVEL '+level+' · '+(level===2?'계단 블록 등장! 위로 올라가요':level===3?'징검 발판과 연속 장애물!':'블록을 넘고 착지한 뒤 슬라이드!' ))}
 particles=particles.filter(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=360*dt;return p.t>0});floaters=floaters.filter(p=>{p.t-=dt;p.y-=35*dt;return p.t>0});bannerTime=Math.max(0,bannerTime-dt);shake=Math.max(0,shake-dt);hudTime-=dt;if(hudTime<=0||s.over){hud();hudTime=.08;}
 if(s.over){release();P.runMusic?.stop();game.end(model.total(),'달콤한 모험 완료!',Math.floor(s.distance)+'m · 별사탕 '+s.stars+'개 · 최고 '+s.bestCombo+'콤보. 다시 달리면 더 멀리 갈 수 있어요!')}
}
const palettes=[['#c4e9f1','#fcf8df','#b9d5bd','#8bbaa5','#a6ce82'],['#f4dae2','#fff0db','#dfb9cf','#bb9fc5','#b6c691'],['#d9d4f1','#f3e8f3','#bfb1d5','#979bc6','#94bbae']];
function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function box(x,y,bw,bh,r,c){ctx.fillStyle=c;P.round(ctx,x,y,bw,bh,r);ctx.fill()}
function text(t,x,y,size=12,color='#3f635b',align='center'){ctx.fillStyle=color;ctx.font=`800 ${size}px system-ui, sans-serif`;ctx.textAlign=align;ctx.fillText(typeof NoriI18n!=='undefined'?NoriI18n.t(t):t,x,y)}
function scenery(){
 const pal=palettes[Math.floor(s.distance/300)%3],travel=P.reduced?0:s.travel;
 const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,pal[0]);grad.addColorStop(1,pal[1]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 ellipse(386,61,29,29,'#fff5bd');ellipse(378,55,31,28,pal[0]);
 for(let i=0;i<4;i++)P.cloud(ctx,((i*180-travel*.08)%720+720)%720-70,50+(i%2)*37,.65+(i%2)*.2);
 for(let i=0;i<5;i++){const x=((i*160-travel*.14)%800+800)%800-100;ellipse(x,280,140,106+i%2*25,pal[2]);ellipse(x-32,220,16,8,'#ffffff35')}
 // Rounded candy trees move at a separate depth from the hills.
 for(let i=0;i<6;i++){const x=((i*115-travel*.32)%690+690)%690-60,top=140+(i%3)*25;box(x-5,top+28,10,ground-top,4,'#c4a889');ellipse(x,top,32,43,pal[3]);ellipse(x-11,top-12,13,21,'#ffffff32');ellipse(x-6,top+3,3,4,'#55746a');ellipse(x+6,top+3,3,4,'#55746a');}
 for(let i=0;i<9;i++){const x=((i*70-travel*.65)%630+630)%630-40;ellipse(x,ground+7,53,33,pal[4]);}
 box(0,ground,w,h-ground,0,'#d9b992');box(0,ground,w,12,0,'#f7efcc');
 for(let x=-(travel%32);x<w;x+=32){ellipse(x+16,ground+11,17,9,'#f7efcc');box(x+8,ground+38,17,5,3,'#c3a17e');box(x+30,ground+57,10,4,2,'#ebd0a4')}
 for(let i=0;i<7;i++){const x=((i*83-travel*.9)%581+581)%581-30;box(x,ground-6,3,8,1,'#659c79');ellipse(x,ground-9,5,4,i%2?'#fff0bd':'#f4b6c2')}
 if(s.fever>0){ctx.fillStyle='#fff3ad25';ctx.fillRect(0,0,w,h);if(!P.reduced){ctx.strokeStyle='#fff9e8a8';ctx.lineWidth=2;for(let i=0;i<6;i++){let x=(s.time*320+i*91)%600;ctx.beginPath();ctx.moveTo(w-x,i*38+25);ctx.lineTo(w-x+35,i*38+25);ctx.stroke()}}}
}
function obstacle(o){
 if(o.kind==='platform'){
  box(o.x,o.y,o.w,o.h,7,'#b991b4');box(o.x,o.y,o.w,12,6,'#f1d7e7');
  for(let x=o.x+12;x<o.x+o.w-5;x+=26){box(x,o.y+23,17,8,3,'#cda9c5');}
  text('↑',o.x+o.w/2,o.y+10,11,'#987193');
 }else if(o.kind==='spikes'){
  box(o.x,o.y+9,o.w,Math.max(9,o.h-9),5,'#849582');ctx.fillStyle='#8a9b86';
  for(let x=o.x;x<o.x+o.w;x+=16){ctx.beginPath();ctx.moveTo(x,o.y+14);ctx.lineTo(x+8,o.y);ctx.lineTo(Math.min(x+16,o.x+o.w),o.y+14);ctx.fill()}
 }else if(o.kind==='gate'){
  box(o.x-6,o.y,o.w+12,o.h,15,'#b894bd');box(o.x-6,o.y,o.w+12,14,9,'#e4c8df');for(let i=0;i<4;i++)ellipse(o.x+8+i*23,o.y+o.h-1,12,10,'#b894bd');
  ellipse(o.x+30,o.y+28,3,4,'#654967');ellipse(o.x+52,o.y+28,3,4,'#654967');text('↓',o.x+43,o.y+56,22,'#fff9ed');
 }else{
  box(o.x,o.y+10,o.w,o.h-10,8,'#b28062');box(o.x-5,o.y,o.w+10,17,7,'#f2c397');box(o.x+6,o.y+22,4,Math.max(3,o.h-30),2,'#dca77e');ellipse(o.x+13,o.y+25,2,3,'#77523e');ellipse(o.x+26,o.y+25,2,3,'#77523e');
 }
}
function candy(o){const cx=o.x+o.w/2,cy=o.y+o.h/2;ctx.save();ctx.translate(cx,cy);if(!P.reduced)ctx.translate(0,Math.sin(s.time*5+o.x*.02)*2);if(o.kind==='star'){ellipse(0,2,14,14,'#ffffff75');P.star(ctx,0,0,12,'#f6be43');ellipse(-3,-3,2,2,'#fff7c5')}else{ellipse(0,0,18,18,'#ffffffba');ellipse(0,0,15,15,o.kind==='shield'?'#9bdce7':'#eca7c5');text(o.kind==='shield'?'◇':'U',0,6,20,'#fff');}ctx.restore()}
function draw(){
 ctx.save();if(shake>0&&!P.reduced)ctx.translate(Math.sin(s.time*85)*3,0);scenery();for(const o of s.objects){if(['stump','gate','platform','spikes'].includes(o.kind))obstacle(o);else candy(o)}
 ellipse(px,ground-(s.grounded?s.y:0)+5,Math.max(12,30-(s.grounded?0:s.y)*.08),5,'#688d7840');ctx.save();ctx.translate(px,ground-s.y);
 if(s.fever>0&&!P.reduced){for(let i=3;i>0;i--){ctx.globalAlpha=.08;if(s.slide&&s.grounded){const sw=NoriRun.SLIDE_HEIGHT*(slidePose.naturalWidth||384)/(slidePose.naturalHeight||256);P.sprite(ctx,slidePose,-sw*.52-i*16,1-NoriRun.SLIDE_HEIGHT,sw,NoriRun.SLIDE_HEIGHT)}else P.sprite(ctx,run,-51-i*16,-94,100,100)}ctx.globalAlpha=1}
 if(s.shield>0||s.invincible>0||s.fever>0){ellipse(0,-40,43,48,s.fever>0?'#fff9c760':'#c6f1ff60');ctx.strokeStyle=s.fever>0?'#fff8c2':'#e2fbff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-40,43,48,0,0,7);ctx.stroke()}
 if(s.magnet>0){ctx.strokeStyle='#e99cb6a0';ctx.lineWidth=1.5;ctx.setLineDash([4,6]);ctx.beginPath();ctx.arc(0,-35,NoriRun.MAGNET_RADIUS,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
 if(s.invincible>0&&Math.floor(s.time*12)%2)ctx.globalAlpha=.5;
 const sliding=s.slide&&s.grounded,t=game.phase==='running'&&!P.reduced?Math.sin(s.time*24):0;
 if(sliding){ctx.translate(0,1)}else if(s.grounded){ctx.translate(0,-Math.abs(t)*2);ctx.rotate(t*.035);if(s.land>0)ctx.scale(1.09,.91)}else ctx.rotate(Math.max(-.13,Math.min(.13,-s.v/3000)));
 if(sliding){const sh=NoriRun.SLIDE_HEIGHT,sw=sh*(slidePose.naturalWidth||384)/(slidePose.naturalHeight||256);P.sprite(ctx,slidePose,-sw*.52,-sh,sw,sh)}else P.sprite(ctx,!s.grounded?jump:(!P.reduced&&Math.floor(s.time*9)%2?contact:run),-51,-94,100,100);ctx.restore();
 if(s.jumps===1&&!s.grounded&&game.phase==='running'){ellipse(px-4,ground-s.y+8,2,2,'#fffef1');ellipse(px+4,ground-s.y+8,2,2,'#e7c65a')}
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.t/.55);ellipse(p.x,p.y,3,3,p.c)}ctx.globalAlpha=1;
 for(const f of floaters){ctx.globalAlpha=Math.min(1,f.t*3);text(f.text,f.x,f.y,15,'#8a5a9d')}ctx.globalAlpha=1;
 if(bannerTime>0&&game.phase==='running'){box(73,18,334,31,15,'#fffdf0e8');text(banner,240,38,12)}
 if(game.phase==='idle'){for(let i=0;i<5;i++)candy({kind:'star',x:190+i*41,y:ground-75-Math.sin(i/4*Math.PI)*45,w:22,h:22});obstacle({kind:'stump',x:310,y:ground-36,w:36,h:36})}
 ctx.restore();
}
P.animate(update,draw);P.ready([run,contact,jump,slidePose]);hud();
})();
