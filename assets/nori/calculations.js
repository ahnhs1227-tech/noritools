/* Pure calculation routines shared by the browser and verification scripts. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriCalc=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 function price(r){const paid=r.price*r.packs;const free=r.offer==='1+1'?r.packs:r.offer==='2+1'?Math.floor(r.packs/2):0;const count=r.packs+free;const qty=r.amount*r.factor*count;const discounted=Math.floor(paid*(1-r.percent/100));const product=Math.max(0,discounted-r.coupon);const total=product+r.shipping;return {paid,free,count,qty,discounted,product,total,unitPrice:total/qty*r.basis}}
 function sticker(r){const aw=r.paperWidth-2*r.margin,ah=r.paperHeight-2*r.margin;function grid(w,h,rotated){const cols=Math.max(0,Math.floor((aw+r.gap)/(w+r.gap)+1e-9)),rows=Math.max(0,Math.floor((ah+r.gap)/(h+r.gap)+1e-9));return {width:w,height:h,cols,rows,count:cols*rows,rotated}}let best=grid(r.width,r.height,false);if(r.rotate){const other=grid(r.height,r.width,true);if(other.count>best.count)best=other}return {...best,pages:best.count?Math.ceil(r.quantity/best.count):0}}
 function quantity(s){s=String(s).trim().replace(/½/g,' 1/2').replace(/¼/g,' 1/4').replace(/¾/g,' 3/4').trim();if(/^\d+\s+\d+\/\d+$/.test(s)){const [whole,frac]=s.split(/\s+/),[a,b]=frac.split('/').map(Number);return b>0?Number(whole)+a/b:NaN}if(/^\d+\/\d+$/.test(s)){const[a,b]=s.split('/').map(Number);return b>0?a/b:NaN}return /^\d+(?:\.\d+)?$/.test(s)?Number(s):NaN}

 function area(r){
  const positive=n=>Number.isFinite(n)&&n>0, nonnegative=n=>Number.isFinite(n)&&n>=0;
  const units={mm:.001,cm:.01,m:1};
  if(!r.spaces.length||!units[r.unit]||!['sqm','piece','pack'].includes(r.mode)||!nonnegative(r.loss)||!nonnegative(r.price))throw Error('면적·로스율·단가를 올바르게 입력해 주세요.');
  if(r.spaces.some(s=>!positive(s.width)||!positive(s.height)||!Number.isSafeInteger(s.quantity)||s.quantity<1))throw Error('가로·세로는 0보다 크게, 수량은 1 이상의 정수로 입력해 주세요.');
  const base=r.spaces.reduce((sum,s)=>sum+s.width*units[r.unit]*s.height*units[r.unit]*s.quantity,0),total=base*(1+r.loss/100);
  let pieces=0,packs=0,bought=0,coverage=0,cost=total*r.price;
  const ceil=n=>Math.max(1,Math.ceil(n-Math.min(1e-9,8*Number.EPSILON*Math.max(1,Math.abs(n)))));
  if(r.mode!=='sqm'){
   if(!positive(r.width)||!positive(r.height)||!units[r.materialUnit]||!Number.isSafeInteger(r.pack)||r.pack<1)throw Error('자재 크기는 0보다 크게, 포장 수량은 1 이상의 정수로 입력해 주세요.');
   const each=r.width*units[r.materialUnit]*r.height*units[r.materialUnit];
   pieces=ceil(total/each);packs=ceil(pieces/r.pack);bought=r.mode==='pack'?packs*r.pack:pieces;coverage=bought*each;cost=(r.mode==='pack'?packs:pieces)*r.price;
   if(![pieces,packs,bought].every(Number.isSafeInteger))throw Error('입력한 값이 너무 큽니다. 더 작은 값을 입력해 주세요.');
  }
  if(![base,total,coverage,cost].every(Number.isFinite)||total<=0)throw Error('입력한 값이 너무 큽니다. 더 작은 값을 입력해 주세요.');
  return {base,total,pieces,packs,bought,coverage,cost};
 }
 return {price,sticker,quantity,area};
});
