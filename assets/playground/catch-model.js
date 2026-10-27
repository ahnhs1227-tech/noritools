/* Local-only orchard game. Input, clock and random source are injectable for replay tests. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriCatch=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const W=480,H=520,CATCH_Y=438,DURATION=60,PLAYER_SPEED=680,FEVER_SECONDS=6,FEVER_TARGET=12;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function stage(time){return Math.min(3,1+Math.floor(time/20))}
function create(random=Math.random){
 const s={x:240,target:240,velocity:0,time:0,stage:1,score:0,lives:5,combo:0,bestCombo:0,caught:0,missed:0,hits:0,perfect:0,charge:0,fever:0,grace:0,items:[],events:[],over:false,complete:false,collection:[0,0,0],mission:false,next:.65,wave:0,lastX:240,lastLanding:0};
 const emit=(type,extra={})=>s.events.push({type,...extra});
 function aim(x){s.target=clamp(x,48,W-48)}
 function move(dir,dt){aim(s.target+clamp(dir,-1,1)*PLAYER_SPEED*dt)}
 function multiplier(){return s.combo>=10?3:s.combo>=5?2:1}
 function wave(){
  const interval=[.96,.8,.66][s.stage-1],speed=[185,240,295][s.stage-1];
  // Limit travel between successive fruit and preserve arrival order when stages change speed.
  const x=clamp(s.lastX+(random()-.5)*260,50,W-50);
  const landing=Math.max(s.time+(CATCH_Y+28)/speed,s.lastLanding+interval*.88);
  const vy=(CATCH_Y+28)/(landing-s.time),golden=s.wave>2&&s.wave%7===6;
  s.items.push({id:s.wave,kind:golden?'gold':'fruit',type:Math.floor(random()*3)%3,x,y:-28,vy,spin:random()*6});
  // A thorn arrives alongside its fruit, well outside the fruit's catching lane.
  if(s.stage>=2&&s.wave%6===4){const hx=x<W/2?Math.min(W-44,x+155):Math.max(44,x-155);s.items.push({id:s.wave+'h',kind:'thorn',x:hx,y:-28,vy,spin:0});emit('warning')}
  s.lastX=x;s.lastLanding=landing;s.wave++;s.next+=interval;
 }
 function lose(type,item){
  s.combo=0;s.charge=0;
  if(s.grace<=0){s.lives=Math.max(0,s.lives-1);s.grace=.65;emit(type,{x:item.x,y:CATCH_Y});}
  if(!s.lives){s.over=true;emit('end')}
 }
 function step(dt){
  s.events=[];if(s.over)return;
  dt=Math.min(Math.max(dt,0),.05,DURATION-s.time);s.time+=dt;
  const level=stage(s.time);if(level!==s.stage){s.stage=level;emit('stage',{stage:level})}
  s.fever=Math.max(0,s.fever-dt);s.grace=Math.max(0,s.grace-dt);
  const oldX=s.x;s.x+=clamp(s.target-s.x,-PLAYER_SPEED*dt,PLAYER_SPEED*dt);s.velocity=dt?(s.x-oldX)/dt:0;
  s.next-=dt;
  // Do not spawn fruit that cannot reach the basket before the clock ends.
  if(s.next<=0&&s.time<57.5)wave();
  for(const f of s.items){
   const oldY=f.y;f.y+=f.vy*dt;
   if(oldY<CATCH_Y&&f.y>=CATCH_Y){
    // Swept collision: compare positions at the instant the fruit crosses the basket rim.
    const fraction=(CATCH_Y-oldY)/(f.y-oldY),basketX=oldX+(s.x-oldX)*fraction,offset=Math.abs(f.x-basketX);
    if(offset<=42){
     f.done=true;
     if(f.kind==='thorn'){s.hits++;lose('hurt',f)}
     else{
      s.caught++;s.combo++;s.bestCombo=Math.max(s.bestCombo,s.combo);const perfect=offset<=15;
      if(perfect)s.perfect++;
      const points=((f.kind==='gold'?30:10)+(perfect?5:0))*multiplier()*(s.fever>0?2:1);
      s.score+=points;emit('catch',{x:f.x,y:CATCH_Y,points,perfect,kind:f.kind,fruit:f.type});
      if(f.kind==='fruit')s.collection[f.type]++;
      if(!s.mission&&s.collection.every(n=>n>=2)){s.mission=true;s.score+=100;emit('mission')}
      if(s.fever===0&&++s.charge>=FEVER_TARGET){s.charge=0;s.fever=FEVER_SECONDS;emit('fever')}
     }
    }else if(f.kind!=='thorn') {f.missed=true;s.missed++;lose('miss',f)}
   }
   if(s.over)break;
  }
  s.items=s.items.filter(f=>!f.done&&f.y<H+30);
  if(s.time>=DURATION&&!s.over){s.time=DURATION;s.over=true;s.complete=true;emit('end')}
 }
 return{s,aim,move,step,multiplier};
}
return{create,stage,W,H,CATCH_Y,DURATION,PLAYER_SPEED,FEVER_SECONDS,FEVER_TARGET};
});
