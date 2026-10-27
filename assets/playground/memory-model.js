/* Nori's matching album: pauseable clock and deterministic, independently testable rules. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriMemory=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const shuffle=(list,random)=>{const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function create(count=6,random=Math.random){
 if(![6,8,10].includes(count))count=6;
 const ids=shuffle(Array.from({length:10},(_,i)=>i),random).slice(0,count);
 const s={count,ids,cards:shuffle(ids.flatMap(id=>[id,id]),random),chosen:[],matched:new Set(),moves:0,time:0,preview:count===6?3:count===8?4:5,reveal:0,resolve:0,streak:0,bestStreak:0,hints:1,over:false,events:[]};
 const visible=i=>s.preview>0||s.reveal>0||s.chosen.includes(i)||s.matched.has(i);
 function pick(i){
  s.events=[];if(!Number.isInteger(i)||i<0||i>=s.cards.length||s.over||s.preview>0||s.reveal>0||s.resolve>0||s.chosen.includes(i)||s.matched.has(i))return false;
  s.chosen.push(i);s.events.push({type:'flip'});
  if(s.chosen.length===2){s.moves++;const [a,b]=s.chosen;if(s.cards[a]===s.cards[b]){s.matched.add(a);s.matched.add(b);s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);s.resolve=.38;s.events.push({type:'match',id:s.cards[a],streak:s.streak})}else{s.streak=0;s.resolve=.85;s.events.push({type:'miss'})}}
  return true;
 }
 function hint(){s.events=[];if(s.over||s.preview>0||s.reveal>0||s.resolve>0||s.chosen.length||!s.hints)return false;s.hints--;s.moves+=2;s.streak=0;s.reveal=1.8;s.events.push({type:'hint'});return true}
 function step(dt){
  s.events=[];if(s.over)return;dt=Math.max(0,Math.min(dt,.1));
  if(s.preview>0){s.preview=Math.max(0,s.preview-dt);if(!s.preview)s.events.push({type:'ready'});return}
  s.time+=dt;
  if(s.reveal>0){s.reveal=Math.max(0,s.reveal-dt);if(!s.reveal)s.events.push({type:'hide'})}
  if(s.resolve>0){s.resolve=Math.max(0,s.resolve-dt);if(!s.resolve){s.chosen=[];if(s.matched.size===count*2){s.over=true;s.events.push({type:'end'})}else s.events.push({type:'settled'})}}
 }
 const stars=()=>s.moves<=count+3?3:s.moves<=count*2?2:1;
 return{s,visible,pick,hint,step,stars};
}
return{create};
});
