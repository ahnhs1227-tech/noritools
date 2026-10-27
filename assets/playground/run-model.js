/* Nori's candy trail: deterministic physics and pattern rules, no network. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriRun=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const W=480,H=360,G=292,PX=92;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function create(random=Math.random){
 const s={y:0,v:0,jumps:0,slide:false,time:0,travel:0,distance:0,score:0,stars:0,hearts:3,combo:0,bestCombo:0,charge:0,fever:0,shield:0,magnet:0,invincible:0,land:0,objects:[],events:[],next:180,pattern:0,over:false,speed:210};
 function emit(type,x=PX,y=G-s.y-40,value){s.events.push({type,x,y,value})}
 function jump(){if(s.over||s.jumps>=2)return false;s.slide=false;s.v=s.jumps?450:490;s.y=Math.max(.1,s.y);s.jumps++;emit(s.jumps===2?'double':'jump');return true}
 function slide(active){s.slide=!!active&&!s.over}
 function body(){return{x:PX-17,y:G-s.y-(s.slide&&s.y===0?27:62),w:34,h:s.slide&&s.y===0?25:57}}
 function pattern(){
  const x=W+55,n=s.pattern++,type=n===0?0:n===1?1:Math.floor(random()*4),a=[];
  const item=(kind,dx,height,w=22,h=22)=>a.push({kind,x:x+dx,y:G-height,w,h,hit:false});
  if(type===0){item('stump',105,36,36,36);for(let i=0;i<7;i++)item('star',i*34,70+Math.sin(i/6*Math.PI)*65)}
  if(type===1){item('gate',90,106,86,70);for(let i=0;i<7;i++)item('star',i*34,27);}
  if(type===2){item('stump',100,60,40,60);for(let i=0;i<7;i++)item('star',i*34,80+Math.sin(i/6*Math.PI)*77)}
  if(type===3){for(let i=0;i<9;i++)item('star',i*29,72+Math.sin(i/8*Math.PI)*48)}
  if(n%5===3)item('shield',260,58,28,28);
  else if(n%5===4)item('magnet',260,58,28,28);
  s.objects.push(...a);s.next=540;
 }
 function step(dt){
  s.events=[];if(s.over)return;s.time+=dt;s.speed=Math.min(285,210+s.time*.65)+(s.fever>0?35:0);const move=s.speed*dt;s.travel+=move;s.distance=s.travel/14;
  for(const key of ['fever','shield','magnet','invincible','land'])s[key]=Math.max(0,s[key]-dt);
  if(s.y>0||s.v>0){s.v-=1350*dt;s.y+=s.v*dt;if(s.y<=0){s.y=s.v=s.jumps=0;s.land=.13;emit('land')}}
  s.next-=move;if(s.next<=0)pattern();
  const b=body();
  for(const o of s.objects){
   o.x-=move;if(o.hit)continue;
   const candy=o.kind==='star';
   if(candy&&(s.magnet>0||s.fever>0)){const dx=PX-o.x,dy=G-s.y-35-o.y;if(Math.hypot(dx,dy)<140){o.x+=dx*Math.min(1,dt*8);o.y+=dy*Math.min(1,dt*8)}}
   if(!overlap(b,o))continue;
   o.hit=true;
   if(candy){s.stars++;s.combo++;s.bestCombo=Math.max(s.combo,s.bestCombo);s.score+=s.fever>0?40:20;emit('star',o.x+11,o.y+11,s.fever>0?40:20);if(s.fever===0){s.charge++;if(s.charge>=18){s.charge=0;s.fever=7;emit('fever')}}}
   else if(o.kind==='shield'||o.kind==='magnet'){s[o.kind]=10;emit(o.kind,o.x,o.y)}
   else if(s.fever>0){emit('smash',o.x,o.y);s.score+=30}
   else if(s.invincible===0){if(s.shield>0){s.shield=0;s.invincible=1;emit('protect')}else{s.hearts--;s.combo=0;s.invincible=1.6;emit('damage');if(s.hearts<=0){s.hearts=0;s.over=true;break}}}
  }
  s.objects=s.objects.filter(o=>o.x+o.w>-40&&!o.hit);return s;
 }
 return {s,jump,slide,body,step,total:()=>Math.floor(s.distance)+s.score};
}
return{create,W,H,G,PX};
});
