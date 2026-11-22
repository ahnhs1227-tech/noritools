/* Pure calculation routines shared by the browser and verification scripts. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriCalc=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 function price(r){const paid=r.price*r.packs;const free=r.offer==='1+1'?r.packs:r.offer==='2+1'?Math.floor(r.packs/2):0;const count=r.packs+free;const qty=r.amount*r.factor*count;const discounted=Math.floor(paid*(1-r.percent/100));const product=Math.max(0,discounted-r.coupon);const total=product+r.shipping;return {paid,free,count,qty,discounted,product,total,unitPrice:total/qty*r.basis}}
 function sticker(r){
  const aw=r.paperWidth-2*r.margin,ah=r.paperHeight-2*r.margin,gap=r.gap;
  const fit=(span,size)=>Math.max(0,Math.floor((span+gap)/(size+gap)+1e-9));
  const original={width:r.width,height:r.height,rotated:false};
  const turned={width:r.height,height:r.width,rotated:true};
  function grid(piece){
   const cols=fit(aw,piece.width),rows=fit(ah,piece.height);
   return {...piece,cols,rows,count:cols*rows};
  }
  let best=grid(original);
  if(r.rotate&&r.width!==r.height){
   const other=grid(turned);
   if(other.count>best.count)best=other;
   // Compare horizontal shelves and their vertical counterpart. Enumerating
   // one orientation's band count leaves a simple best fit for the other.
   for(const axis of ['row','column']){
    const isRow=axis==='row',span=isRow?ah:aw,cross=isRow?aw:ah;
    const bandSize=isRow?'height':'width',pieceSize=isRow?'width':'height';
    const originalAcross=fit(cross,original[pieceSize]);
    const turnedAcross=fit(cross,turned[pieceSize]);
    if(!originalAcross||!turnedAcross)continue;
    for(let a=1,max=fit(span,original[bandSize]);a<=max;a++){
     const b=fit(span-a*(original[bandSize]+gap),turned[bandSize]);
     const count=a*originalAcross+b*turnedAcross;
     if(b&&count>best.count){
      best={axis,count,bands:[
       {...original,number:a,across:originalAcross},
       {...turned,number:b,across:turnedAcross}
      ]};
     }
    }
   }
  }
  return {...best,pages:best.count?Math.ceil(r.quantity/best.count):0};
 }
 function* stickerPositions(r,layout,limit=layout.count){
  let left=Math.min(layout.count,limit);
  if(!layout.axis){
   const {cols,width,height,rotated}=layout;
   for(let i=0;i<left;i++)yield {
    x:r.margin+(i%cols)*(width+r.gap),y:r.margin+Math.floor(i/cols)*(height+r.gap),
    width,height,rotated
   };
   return;
  }
  const isRow=layout.axis==='row';
  let offset=r.margin;
  for(const {width,height,rotated,number,across} of layout.bands){
   for(let band=0;band<number&&left>0;band++){
    for(let i=0;i<across&&left>0;i++,left--){
     const along=r.margin+i*((isRow?width:height)+r.gap);
     yield {x:isRow?along:offset,y:isRow?offset:along,width,height,rotated};
    }
    offset+=(isRow?height:width)+r.gap;
   }
  }
 }
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
 return {price,sticker,stickerPositions,quantity,area};
});
