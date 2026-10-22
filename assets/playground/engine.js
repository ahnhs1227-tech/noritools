/* Small deterministic rules shared by all Nori games. No network or dependencies. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriGameRules=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function shuffledPairs(count,random=Math.random){const a=Array.from({length:count*2},(_,i)=>Math.floor(i/2));for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function catchHit(x,oldY,y,player,catchY){return oldY<catchY&&y>=catchY&&Math.abs(x-player)<=52}
function catchPoints(golden,combo){return(golden?30:10)+(combo%5===0?5:0)}
function jumpStep(y,v,dt){v-=1500*dt;y+=v*dt;return y<=0?{y:0,v:0,landed:true}:{y,v,landed:false}}
return {clamp,shuffledPairs,overlaps,catchHit,catchPoints,jumpStep};
});
