/* Nori's candy trail: deterministic physics and staged, reachable obstacle courses. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriRun=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const W=480,H=360,G=292,PX=92,FEVER_STARS=28,FEVER_SECONDS=4,MAGNET_SECONDS=3,MAGNET_RADIUS=72,SHIELD_SECONDS=6,POWER_GAP=26;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function difficulty(distance){const level=1+Math.floor(distance/160),tier=Math.min(8,level);return{level,tier,speed:Math.min(340,210+distance*.085),rest:Math.max(.65,1.2-(tier-1)*.08)}}
function create(random=Math.random){
 const s={y:0,v:0,jumps:0,grounded:true,slide:false,time:0,travel:0,distance:0,score:0,stars:0,hearts:3,combo:0,bestCombo:0,charge:0,fever:0,shield:0,magnet:0,invincible:0,land:0,objects:[],events:[],next:180,pattern:0,lastType:-1,over:false,speed:210,level:1,nextPowerAt:18,powerCount:0};
 function emit(type,x=PX,y=G-s.y-40,value){s.events.push({type,x,y,value})}
 function jump(){if(s.over||s.jumps>=2)return false;s.slide=false;s.v=s.jumps?450:490;s.grounded=false;s.y=Math.max(.1,s.y);s.jumps++;emit(s.jumps===2?'double':'jump');return true}
 function slide(active){s.slide=!!active&&!s.over}
 function body(){const low=s.slide&&s.grounded;return{x:PX-17,y:G-s.y-(low?27:62),w:34,h:low?25:57}}
 function pattern(){
  const x=W+55,n=s.pattern++,d=difficulty(s.distance),pool=d.tier===1?[0,1,2]:d.tier===2?[0,1,2,3,4]:d.tier===3?[1,2,3,4,5,6]:[1,2,3,4,5,6,7];
  let type=n===0?0:n===1?1:n===2?2:pool[Math.floor(random()*pool.length)%pool.length];
  // Introduce each new route, then avoid back-to-back copies of the same course.
  if(d.tier>=2&&n%4===3)type=d.tier>=3&&n%8===7?5:4;
  if(type===s.lastType)type=pool[(pool.indexOf(type)+1)%pool.length];s.lastType=type;
  const a=[];const item=(kind,dx,height,bw=22,bh=22)=>a.push({kind,x:x+dx,y:G-height,w:bw,h:bh,hit:false});
  const arc=(dx,base,count=7,spacing=30,peak=60)=>{for(let i=0;i<count;i++)item('star',dx+i*spacing,base+Math.sin(i/(count-1)*Math.PI)*peak)};
  // Pairs are spaced by recovery time, not just pixels, at every running speed.
  const beat=Math.max(210,d.speed*.83),gateWidth=86+Math.min(24,d.tier*3);
  if(type===0){item('stump',90,36,36,36);arc(0,70)}
  if(type===1){item('gate',80,106,gateWidth,70);for(let i=0;i<6;i++)item('star',i*32,27)}
  if(type===2){item('stump',100,68,45,68);arc(0,85,7,31,65)}
  if(type===3){item('stump',80,40,38,40);item('stump',80+beat,58,42,58);arc(0,74,6,28,48);arc(beat,85,6,28,55)}
  if(type===4){
   item('platform',0,48,112,48);item('platform',136,96,112,96);item('platform',272,60,112,60);item('spikes',112,18,160,18);
   arc(12,84,4,24,15);arc(148,132,4,24,15);arc(284,96,4,24,15);
  }
  if(type===5){
   item('platform',0,56,110,56);item('platform',174,108,110,108);item('platform',348,74,125,74);item('spikes',110,20,238,20);
   arc(5,90,4,26,12);arc(179,142,4,26,12);arc(353,110,4,28,12);
  }
  if(type===6){item('gate',70,106,gateWidth,70);item('stump',70+gateWidth+beat,62,42,62);for(let i=0;i<6;i++)item('star',i*30,27);arc(gateWidth+beat-15,85,7,30,60)}
  if(type===7){
   item('platform',0,52,145,52);item('platform',174,100,150,100);item('spikes',145,20,29,20);item('gate',195,206,94,70);item('stump',324+beat,70,46,70);
   arc(8,88,4,28,12);for(let i=0;i<5;i++)item('star',185+i*27,127);arc(324+beat-70,94,6,30,50);
  }
  // At most one pickup every 26 seconds; magnets alternate with shields.
  if(s.time>=s.nextPowerAt){const end=Math.max(...a.map(o=>o.x+o.w))-x;item(s.powerCount%2?'shield':'magnet',end+48,100,28,28);s.powerCount++;s.nextPowerAt=s.time+POWER_GAP}
  s.objects.push(...a);s.next=Math.max(...a.map(o=>o.x+o.w))-x+d.speed*d.rest;
 }
 function hurt(o){
  if(o.hurt||s.invincible>0)return;o.hurt=true;
  if(s.shield>0){s.shield=0;s.invincible=.8;emit('protect')}
  else{s.hearts--;s.combo=0;s.invincible=1.15;emit('damage');if(s.hearts<=0){s.hearts=0;s.over=true}}
 }
 function step(dt){
  s.events=[];if(s.over)return;s.time+=dt;const d=difficulty(s.distance);s.level=d.level;s.speed=d.speed;const move=s.speed*dt;s.travel+=move;s.distance=s.travel/14;
  const previousMagnet=s.magnet;
  for(const key of ['fever','shield','magnet','invincible','land'])s[key]=Math.max(0,s[key]-dt);
  if(previousMagnet>0&&s.magnet===0)emit('magnet-end');
  for(const o of s.objects)o.x-=move;
  s.next-=move;if(s.next<=0)pattern();
  const oldFeet=G-s.y,wasGrounded=s.grounded;
  s.v-=1350*dt;s.y+=s.v*dt;s.grounded=false;
  let floor=G;
  // Land on a block only while descending across its top. The ground remains below.
  if(s.v<=0)for(const o of s.objects){if(o.kind!=='platform')continue;if(PX+15>o.x&&PX-15<o.x+o.w&&oldFeet<=o.y+.8&&G-s.y>=o.y)floor=Math.min(floor,o.y)}
  if(G-s.y>=floor){s.y=G-floor;s.v=0;s.jumps=0;s.grounded=true;if(!wasGrounded){s.land=.13;emit('land')}}
  else if(wasGrounded&&s.jumps===0)s.jumps=1; // Walking off a ledge leaves one air jump.
  let b=body();
  for(const o of s.objects){
   if(o.hit)continue;const candy=o.kind==='star';
   if(candy&&s.magnet>0){const dx=PX-(o.x+o.w/2),dy=G-s.y-35-(o.y+o.h/2);if(Math.hypot(dx,dy)<MAGNET_RADIUS){o.x+=dx*Math.min(1,dt*5);o.y+=dy*Math.min(1,dt*5)}}
   if(!overlap(b,o))continue;
   if(candy){o.hit=true;s.stars++;s.combo++;s.bestCombo=Math.max(s.combo,s.bestCombo);s.score+=s.fever>0?40:20;emit('star',o.x+11,o.y+11,s.fever>0?40:20);if(s.fever===0&&++s.charge>=FEVER_STARS){s.charge=0;s.fever=FEVER_SECONDS;emit('fever')}}
   else if(o.kind==='shield'||o.kind==='magnet'){o.hit=true;if(s[o.kind]===0){s[o.kind]=o.kind==='magnet'?MAGNET_SECONDS:SHIELD_SECONDS;emit(o.kind,o.x,o.y)}}
   else if(o.kind==='platform'){
    // Missing a block costs a life, then puts Nori safely on top to avoid trapping.
    if(s.fever===0)hurt(o);s.y=G-o.y;s.v=0;s.jumps=0;s.grounded=true;b=body();
   }
   else if(s.fever>0){o.hit=true;emit('smash',o.x,o.y);s.score+=30}
   else{hurt(o);if(o.kind!=='spikes')o.hit=true}
   if(s.over)break;
  }
  s.objects=s.objects.filter(o=>o.x+o.w>-40&&!o.hit);return s;
 }
 return {s,jump,slide,body,step,total:()=>Math.floor(s.distance)+s.score};
}
return{create,difficulty,W,H,G,PX,FEVER_STARS,FEVER_SECONDS,MAGNET_SECONDS,MAGNET_RADIUS,SHIELD_SECONDS,POWER_GAP};
});
