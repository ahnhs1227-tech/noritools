'use strict';
(()=>{
const P=NoriPlay,{$,R}=P,{canvas,ctx,w,h}=P.canvasStage(),nori=P.image('assets/playground/nori-catch.webp'),fx=P.particles();
const C=NoriCatch,Y=C.CATCH_Y,names=['햇살 과수원','분주한 수확','마지막 수확 축제'];
let model=C.create(),s=model.s,held=0,keys=new Set(),pop=0,shake=0,toast='바구니 한가운데로 쏙!',toastTime=3,floaters=[],hudClock=0;
function clearInput(){held=0;keys.clear();model.aim(s.x);for(const id of ['move-left','move-right'])$(id).classList.remove('is-held')}
const game=P.controller({key:'catch',onStart(){model=C.create();s=model.s;clearInput();fx.clear();pop=shake=0;floaters=[];toast='바구니 한가운데로 쏙!';toastTime=3;hudClock=0;hud();if(typeof matchMedia==='function'&&matchMedia('(max-width:650px)').matches)canvas.closest('.game-panel')?.scrollIntoView({block:'start',behavior:'auto'})},onPause:clearInput,onResume:clearInput});
function hud(){
 $('score').textContent=s.score.toLocaleString();$('remaining').textContent=Math.ceil(C.DURATION-s.time)+'초';$('lives').textContent='♥'.repeat(s.lives)+'♡'.repeat(5-s.lives);$('lives').setAttribute('aria-label','남은 기회 '+s.lives+'번');
 $('combo').textContent=s.combo?`${s.combo}연속 · 최고 ${s.bestCombo}연속`:'화면을 좌우로 드래그해요';
 $('catch-zone').textContent=`${s.stage} / 3 · ${names[s.stage-1]}`;$('catch-multiplier').textContent=s.fever>0?'FEVER ×'+model.multiplier()*2:'보너스 ×'+model.multiplier();
 $('catch-fever-label').textContent=s.fever>0?`피버 ${s.fever.toFixed(1)}초 · 획득 점수 2배`:`연속 수확 ${s.charge} / ${C.FEVER_TARGET} · 모으면 피버`;
 $('catch-fever-fill').style.width=(s.fever>0?s.fever/C.FEVER_SECONDS:s.charge/C.FEVER_TARGET)*100+'%';
 $('catch-progress').style.width=(s.time/C.DURATION*100)+'%';
 $('catch-mission').textContent=s.mission?'수확 꾸러미 완성! +100점':`수확 꾸러미 · 사과 ${Math.min(2,s.collection[0])}/2 · 귤 ${Math.min(2,s.collection[1])}/2 · 포도 ${Math.min(2,s.collection[2])}/2`;
 $('catch-mission').classList.toggle('is-complete',s.mission);
}
function aim(e){if(game.phase!=='running')return;const b=canvas.getBoundingClientRect();model.aim((e.clientX-b.left)/b.width*w)}
canvas.addEventListener('pointerdown',e=>{if(game.phase!=='running')return;e.preventDefault();canvas.setPointerCapture(e.pointerId);aim(e)});
canvas.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')aim(e)});
for(const [id,dir] of [['move-left',-1],['move-right',1]]){
 const b=$(id),release=()=>{if(held===dir)held=0;b.classList.remove('is-held')};
 b.onpointerdown=e=>{if(game.phase==='running'){e.preventDefault();b.setPointerCapture(e.pointerId);held=dir;b.classList.add('is-held')}};
 b.onpointerup=b.onpointercancel=b.onlostpointercapture=release;b.addEventListener('blur',release);
 b.addEventListener('keydown',e=>{if(game.phase==='running'&&['Space','Enter'].includes(e.code)){e.preventDefault();held=dir;b.classList.add('is-held')}});b.addEventListener('keyup',release);
 b.onclick=e=>{if(e.detail===0&&game.phase==='running')model.aim(s.target+dir*65)};
}
document.addEventListener('keydown',e=>{if(game.phase!=='running'||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD'].includes(e.code)){e.preventDefault();keys.add(e.code)}});
document.addEventListener('keyup',e=>keys.delete(e.code));
function message(t,d=2){toast=t;toastTime=d;game.announce(t)}
function update(dt){
 if(game.phase!=='running')return;
 const dir=held||(Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')));if(dir)model.move(dir,dt);
 model.step(dt);
 for(const e of s.events){
  if(e.type==='catch'){pop=.22;fx.burst(e.x,Y,e.kind==='gold'?'#f9d76d':'#a9cc83');floaters.push({x:e.x,y:Y-28,t:.8,text:(e.perfect?'쏙! ':'')+'+'+e.points,c:e.kind==='gold'?'#a66f1a':'#3d7154'});P.sound();if(s.combo%5===0)message(s.combo+'연속! 수확 보너스 ×'+model.multiplier(),1.4)}
  if(e.type==='miss'||e.type==='hurt'){shake=e.type==='hurt'?.25:0;P.sound('bad');message(e.type==='hurt'?'아야! 밤송이는 옆으로 피해요':'괜찮아, 다음 과일부터 다시!',1.5)}
  if(e.type==='stage')message(e.stage===2?'2단계 · 밤송이는 피해요!':'3단계 · 마지막 수확 축제!',2.4);
  if(e.type==='fever'){message('수확 피버! 6초 동안 점수 2배',2.2);P.sound('win')}
  if(e.type==='mission'){message('수확 꾸러미 완성! +100점',2.2);P.sound('win')}
 }
 pop=Math.max(0,pop-dt);shake=Math.max(0,shake-dt);toastTime=Math.max(0,toastTime-dt);fx.step(dt);floaters=floaters.filter(f=>{f.t-=dt;f.y-=32*dt;return f.t>0});hudClock-=dt;if(hudClock<=0||s.over){hud();hudClock=.08}
 if(s.over){clearInput();const title=s.complete?'오늘의 수확 대성공!':'오늘의 수확 완료!';game.end(s.score,title,`${s.score.toLocaleString()}점 · 과일 ${s.caught}개 · 최고 ${s.bestCombo}연속 · 정확히 ${s.perfect}번! ${s.mission?'수확 꾸러미도 완성했어요.':'다음에는 세 과일을 2개씩 모아보세요.'}`)}
}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function box(x,y,bw,bh,r,c){ctx.fillStyle=c;P.round(ctx,x,y,bw,bh,r);ctx.fill()}
function label(t,x,y,size=12,color='#486049'){ctx.fillStyle=color;ctx.font=`800 ${size}px system-ui,sans-serif`;ctx.textAlign='center';ctx.fillText(t,x,y)}
function fruit(f,size=19){
 ctx.save();ctx.translate(f.x,f.y);if(!P.reduced)ctx.rotate(Math.sin(s.time*3+f.spin)*.12);
 if(f.kind==='thorn'){
  ellipse(0,3,22,19,'#705d8630');ctx.fillStyle='#8b719b';ctx.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?16:23;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ellipse(0,0,15,15,'#b498b9');ellipse(-5,-2,2,3,'#5d456c');ellipse(5,-2,2,3,'#5d456c');label('×',0,10,12,'#5d456c');
  box(-25,-42,50,17,8,'#fff8');label('피해요',0,-30,10,'#785583');
 }else if(f.kind==='gold'){
  ellipse(0,0,27,27,'#ffe99945');P.star(ctx,0,0,22,'#eebd49');ellipse(-4,-1,1.5,2,'#977038');ellipse(4,-1,1.5,2,'#977038');
 }else{
  ellipse(0,5,19,17,'#84634114');if(f.type===1){const orange=ctx.createRadialGradient(-7,-8,2,0,0,21);orange.addColorStop(0,'#ffda8d');orange.addColorStop(1,'#e9aa52');ellipse(0,0,19,18,orange);ellipse(6,-18,9,4,'#88aa61');ellipse(-6,-8,3,5,'#fff5ce70')}else P.fruit(ctx,0,0,f.type,size);
  ellipse(-5,2,1.5,2,'#674b4e');ellipse(5,2,1.5,2,'#674b4e');ellipse(-10,5,3,1.5,'#ffffff40');ellipse(10,5,3,1.5,'#ffffff40');
 }
 ctx.restore();
}
function orchard(){
 const colors=[['#d6eef2','#faf2d4'],['#cdece6','#f4edce'],['#f0dfec','#fcedd2']][s.stage-1];
 const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ellipse(390,68,32,32,'#fff5c5');ellipse(382,61,5,7,'#fff9dd');P.cloud(ctx,88,90,.85);P.cloud(ctx,320,146,.58);
 ellipse(36,435,220,112,'#c8dfbd');ellipse(425,444,235,144,'#b9d3ad');
 for(const [x,y,scale] of [[-12,254,1],[478,235,1.12]]){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);box(-9,0,18,244,6,'#be9e74');ellipse(0,-12,75,77,'#9dbd85');ellipse(-38,10,49,53,'#a9c98d');ellipse(40,4,46,54,'#a3c38a');for(const [fx,fy] of [[-27,-35],[30,-20],[-5,25]])ellipse(fx,fy,10,11,'#e7a58c');ctx.restore()}
 for(let i=0;i<11;i++){const x=i*48-8;box(x,459,7,48,3,'#f7eed8');box(x-4,462,15,7,3,'#f7eed8')}
 box(0,478,w,5,2,'#eee1c4');box(0,498,w,22,0,'#c7d89e');
 for(let i=0;i<12;i++){const x=i*43+12;ellipse(x,505+(i%3)*5,5,2,'#a6bd80')}
 if(s.fever>0){ctx.fillStyle='#fff29d25';ctx.fillRect(0,0,w,h);for(let i=0;i<8;i++){const x=(i*67+17)%480,y=P.reduced?60+i*44:(s.time*30+i*61)%460;P.star(ctx,x,y,3+i%3,'#fff9db')}}
}
function draw(){
 ctx.save();if(shake&&!P.reduced)ctx.translate(Math.sin(s.time*90)*3,0);orchard();
 // A subtle lane marker helps touch users see the basket's true receiving position.
 ellipse(s.x,502,52,7,'#627c4630');
 const bounce=pop&&!P.reduced?Math.sin(pop/.22*Math.PI)*3:0,lean=P.reduced?0:R.clamp(s.velocity/23000,-.03,.03);
 ctx.save();ctx.translate(s.x,500);ctx.rotate(lean);if(s.grace>0&&Math.floor(s.time*12)%2)ctx.globalAlpha=.7;
 // Basket centre in the original 512px artwork is x=220; receiving area is y≈342.
 P.sprite(ctx,nori,-86,-196-bounce,200,200);ctx.restore();
 if(s.fever>0){ctx.strokeStyle='#f8d16e';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(s.x,Y+2,41,10,0,0,Math.PI*2);ctx.stroke()}
 for(const f of s.items){ctx.save();if(f.missed)ctx.globalAlpha=.4;fruit(f);ctx.restore()}
 fx.draw(ctx);for(const f of floaters){ctx.globalAlpha=Math.min(1,f.t*3);label(f.text,f.x,f.y,17,f.c)}ctx.globalAlpha=1;
 if(toastTime>0&&game.phase==='running'){box(64,14,352,31,15,'#fffdf0e8');label(toast,240,35,12)}
 if(game.phase==='idle'){fruit({x:135,y:185,kind:'fruit',type:0,spin:0});fruit({x:330,y:235,kind:'fruit',type:2,spin:1});fruit({x:240,y:125,kind:'gold',spin:0})}
 if(s.time>=50&&game.phase==='running'){box(190,52,100,26,13,'#fff7e9e8');label('마지막 '+Math.ceil(60-s.time)+'초',240,70,12,'#b17b54')}
 ctx.restore();
}
P.animate(update,draw);P.ready([nori]);hud();
})();
