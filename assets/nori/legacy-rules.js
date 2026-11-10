/* Explicit input limits; shared by legacy React tools and regression checks. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.NoriRules=factory()})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const number=(v,min,max,integer=false)=>String(v).trim()!==''&&Number.isFinite(Number(v))&&Number(v)>=min&&Number(v)<=max&&(!integer||Number.isSafeInteger(Number(v)));
 const discount=(price,rate,extra,coupon,qty)=>number(price,0,1e12)&&number(rate,0,100)&&number(extra,0,100)&&number(coupon,0,1e12)&&number(qty,1,10000,true);
 const body=(age,height,weight,target)=>number(age,19,100,true)&&number(height,100,250)&&number(weight,30,300)&&number(target,30,300);
 const portion=q=>number(q,.01,10000);
 const food=(name,kcal,q)=>String(name).trim().length>0&&number(kcal,0,100000)&&portion(q);
 const unit=(input,result)=>number(input,0,1e15)&&Number.isFinite(result);
 function characters(s){const parts=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(s)].map(x=>x.segment):Array.from(s);return {all:parts.length,noSpace:parts.filter(x=>!/^\s+$/.test(x)).length,words:s.trim()?s.trim().split(/\s+/).length:0,lines:s?s.split(/\n/).length:0,bytes:new TextEncoder().encode(s).length,minutes:s.trim()?Math.ceil(s.trim().split(/\s+/).length/250):0}}
 return {number,discount,body,portion,food,unit,characters};
});
