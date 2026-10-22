'use strict';
(()=>{
const $=id=>document.getElementById(id),R=NoriGameRules,base='/noritools/',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function read(k,fallback){try{const x=JSON.parse(localStorage.getItem(k));return x===null?fallback:x}catch{return fallback}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
let audio,mute=read('nori-play-muted',true)!==false;
function sound(kind='good'){if(mute)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=kind==='bad'?170:kind==='jump'?420:kind==='win'?880:640;g.gain.setValueAtTime(.07,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.17)}catch{}}
function controller({key,onStart,onPause=()=>{},onResume=()=>{}}){
 let phase='idle',best=Number(read('nori-play-'+key,0))||0;
 const overlay=$('game-overlay'),title=$('overlay-title'),desc=$('overlay-desc'),go=$('game-start'),pause=$('game-pause'),again=$('game-again'),muteBtn=$('game-mute');
 function mutedUI(){muteBtn.textContent=mute?'소리 꺼짐':'소리 켜짐';muteBtn.setAttribute('aria-pressed',String(!mute))}mutedUI();muteBtn.onclick=()=>{mute=!mute;save('nori-play-muted',mute);mutedUI();sound()};
 function show(h,p,button){title.textContent=h;desc.textContent=p;go.textContent=button;overlay.hidden=false}
 function announce(text){$('game-status').textContent=text}
 function updateBest(n){if(n>best){best=n;save('nori-play-'+key,best)}$('game-best').textContent=best;return best}
 function start(){window.NoriPlay.records?.begin();phase='running';overlay.hidden=true;pause.disabled=false;pause.textContent='잠깐 쉬기';again.hidden=false;onStart();announce('게임을 시작했어요.');if($('game-canvas'))$('game-canvas').focus({preventScroll:true})}
 function pauseGame(){if(phase!=='running')return;phase='paused';onPause();show('잠깐 쉬어가요','준비되면 이어서 해요. 쉬는 동안 시간과 점수는 멈춰요.','이어서 하기');pause.textContent='이어서 하기';announce('일시정지했어요.')}
 function resume(){if(phase!=='paused')return;phase='running';overlay.hidden=true;pause.textContent='잠깐 쉬기';onResume();announce('이어서 시작해요.');if($('game-canvas'))$('game-canvas').focus({preventScroll:true})}
 go.onclick=()=>phase==='paused'?resume():start();pause.onclick=()=>phase==='paused'?resume():pauseGame();again.onclick=start;
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});window.addEventListener('blur',pauseGame);window.addEventListener('pagehide',pauseGame);
 document.addEventListener('keydown',e=>{if(e.code==='Escape'&&phase==='running'){e.preventDefault();pauseGame()}});
 updateBest(best);
 return {get phase(){return phase},start,pause:pauseGame,announce,updateBest,end(score,heading,message,result){phase='over';pause.disabled=true;const old=best;updateBest(score);show(heading,message+(score>old?' 새로운 최고 기록이에요!':''),'한 번 더 하기');announce(heading+' '+message);sound('win');window.NoriPlay.records?.finish(key,score,result);go.focus({preventScroll:true})},setBestLabel(n){$('game-best').textContent=n}};
}
function canvasStage(){const canvas=$('game-canvas'),ctx=canvas.getContext('2d');const w=480,h=Number(canvas.dataset.height)||600;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);return {canvas,ctx,w,h}}
function image(src){const im=new Image();im.src=base+src;return im}
function sprite(ctx,im,x,y,w,h){if(im.complete&&im.naturalWidth)ctx.drawImage(im,x,y,w,h)}
function round(ctx,x,y,w,h,r=12){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function cloud(ctx,x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#ffffffa8';ctx.beginPath();ctx.ellipse(0,8,36,14,0,0,Math.PI*2);ctx.ellipse(-12,0,18,18,0,0,Math.PI*2);ctx.ellipse(12,-4,23,22,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function star(ctx,x,y,size=14,color='#efc757'){ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?size*.47:size;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.fillStyle='#ffffff8a';ctx.beginPath();ctx.arc(-size*.22,-size*.22,size*.15,0,7);ctx.fill();ctx.restore()}
function fruit(ctx,x,y,type,size=20){ctx.save();ctx.translate(x,y);if(type===3){star(ctx,0,0,size,'#edbe42');ctx.restore();return}ctx.fillStyle=['#f48887','#e9b85e','#a09aca'][type%3];ctx.beginPath();if(type===2){for(const [a,b]of[[-8,-4],[8,-4],[0,8],[-3,-14]]){ctx.moveTo(a+10,b);ctx.arc(a,b,10,0,7)}}else{ctx.ellipse(-size*.3,0,size*.7,size*.9,-.2,0,7);ctx.ellipse(size*.3,0,size*.7,size*.9,.2,0,7)}ctx.fill();ctx.fillStyle='#87a960';ctx.beginPath();ctx.ellipse(6,-size*.85,9,4,-.6,0,7);ctx.fill();ctx.strokeStyle='#796246';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-size*.6);ctx.lineTo(1,-size*1.1);ctx.stroke();ctx.fillStyle='#ffffff8c';ctx.beginPath();ctx.ellipse(-7,-7,3,6,.4,0,7);ctx.fill();ctx.restore()}
function scenery(ctx,w,h,time=0,run=false){const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#e2f3f5');g.addColorStop(.65,'#f7f6df');g.addColorStop(1,'#e6efcd');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff0ad';ctx.beginPath();ctx.arc(w-72,70,32,0,7);ctx.fill();cloud(ctx,70-(run?time*6%600:0),86,.9);cloud(ctx,330-(run?time*3%600:0),150,.7);ctx.fillStyle='#d7e6c7';ctx.beginPath();ctx.ellipse(50,h,240,105,0,0,7);ctx.ellipse(430,h-5,260,130,0,0,7);ctx.fill();if(run){ctx.fillStyle='#bccc9f';ctx.fillRect(0,h-70,w,70);ctx.fillStyle='#e0d3b9';ctx.fillRect(0,h-57,w,57);ctx.fillStyle='#c6b89e';for(let x=-(time*110%52);x<w;x+=52){ctx.beginPath();ctx.ellipse(x,h-27,5,2,0,0,7);ctx.fill()}}else{ctx.fillStyle='#c7dbac';ctx.fillRect(0,h-24,w,24)}}
function animate(update,draw){let last=performance.now();function tick(now){const dt=Math.min((now-last)/1000,.04);last=now;update(dt);draw();requestAnimationFrame(tick)}requestAnimationFrame(tick)}
function particles(){let a=[];return {burst(x,y,color){if(reduced)return;for(let i=0;i<9;i++)a.push({x,y,vx:(Math.random()-.5)*170,vy:-70-Math.random()*110,t:.6,c:color})},step(dt){a=a.filter(p=>{p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=360*dt;return p.t>0})},draw(ctx){for(const p of a){ctx.globalAlpha=Math.max(0,p.t/.6);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill()}ctx.globalAlpha=1},clear(){a=[]}}}
function ready(images){const b=$('game-start');b.disabled=true;Promise.all(images.map(im=>im.decode())).then(()=>b.disabled=false).catch(()=>{$('overlay-desc').textContent='캐릭터를 불러오지 못했어요. 연결을 확인한 뒤 다시 불러와 주세요.';b.disabled=false;b.textContent='다시 불러오기';b.onclick=()=>location.reload()})}
window.NoriPlay={ready,$,R,base,reduced,read,save,sound,controller,canvasStage,image,sprite,round,cloud,star,fruit,scenery,animate,particles};
})();
