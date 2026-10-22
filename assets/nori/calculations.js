/* Pure calculation routines shared by the browser and verification scripts. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriCalc=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 function price(r){const paid=r.price*r.packs;const free=r.offer==='1+1'?r.packs:r.offer==='2+1'?Math.floor(r.packs/2):0;const count=r.packs+free;const qty=r.amount*r.factor*count;const discounted=Math.floor(paid*(1-r.percent/100));const product=Math.max(0,discounted-r.coupon);const total=product+r.shipping;return {paid,free,count,qty,discounted,product,total,unitPrice:total/qty*r.basis}}
 function sticker(r){const aw=r.paperWidth-2*r.margin,ah=r.paperHeight-2*r.margin;function grid(w,h,rotated){const cols=Math.max(0,Math.floor((aw+r.gap)/(w+r.gap)+1e-9)),rows=Math.max(0,Math.floor((ah+r.gap)/(h+r.gap)+1e-9));return {width:w,height:h,cols,rows,count:cols*rows,rotated}}let best=grid(r.width,r.height,false);if(r.rotate){const other=grid(r.height,r.width,true);if(other.count>best.count)best=other}return {...best,pages:best.count?Math.ceil(r.quantity/best.count):0}}
 function quantity(s){s=String(s).trim().replace(/½/g,' 1/2').replace(/¼/g,' 1/4').replace(/¾/g,' 3/4').trim();if(/^\d+\s+\d+\/\d+$/.test(s)){const [whole,frac]=s.split(/\s+/),[a,b]=frac.split('/').map(Number);return b>0?Number(whole)+a/b:NaN}if(/^\d+\/\d+$/.test(s)){const[a,b]=s.split('/').map(Number);return b>0?a/b:NaN}return /^\d+(?:\.\d+)?$/.test(s)?Number(s):NaN}
 return {price,sticker,quantity};
});
