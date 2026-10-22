'use strict';
(function(root){
 function dimensions(w,h,max){if(![w,h,max].every(n=>Number.isFinite(n)&&n>0))throw Error('크기를 확인해 주세요.');const scale=Math.min(1,max/Math.max(w,h));return [Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale))]}
 const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
 function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
 async function zip(files){
  const parts=[],central=[];let offset=0,centralSize=0;
  for(const file of files){const name=new TextEncoder().encode(file.name),bytes=new Uint8Array(await file.blob.arrayBuffer()),crc=crc32(bytes);
   const header=new Uint8Array(30+name.length),v=new DataView(header.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);header.set(name,30);
   const dir=new Uint8Array(46+name.length),d=new DataView(dir.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(14,33,true);d.setUint32(16,crc,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);dir.set(name,46);parts.push(header,bytes);central.push(dir);offset+=header.length+bytes.length;centralSize+=dir.length;
  }
  const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});
 }
 function remaining(run,now=Date.now()){return run?Math.max(0,run.status==='running'?run.end-now:run.left):0}
 function start(mode,minutes,now=Date.now(),id=String(now)){if(!['focus','break'].includes(mode)||!Number.isInteger(minutes)||minutes<1||minutes>120)throw Error('시간은 1~120분의 정수로 입력해 주세요.');return {id,mode,minutes,status:'running',end:now+minutes*60000,left:minutes*60000}}
 function pause(run,now=Date.now()){return {...run,status:'paused',left:remaining(run,now)}}
 function resume(run,now=Date.now()){return {...run,status:'running',end:now+run.left}}
 function dateKey(now){const d=new Date(now);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
 function settle(state,now=Date.now()){
  const r=state.run;if(!r||r.status!=='running'||remaining(r,now)>0)return state;
  const next={...state,run:{...r,status:'done',left:0}};
  if(r.mode==='focus'&&!(state.completed||[]).includes(r.id)){const key=dateKey(r.end),daily={...(state.daily||{})},old=daily[key]||{count:0,minutes:0};daily[key]={count:old.count+1,minutes:old.minutes+r.minutes};next.daily=Object.fromEntries(Object.entries(daily).sort().slice(-365));next.completed=[...(state.completed||[]),r.id].slice(-100);next.total=(state.total||0)+1}
  return next;
 }
 const api={dimensions,crc32,zip,remaining,start,pause,resume,dateKey,settle};if(typeof module!=='undefined')module.exports=api;else root.NoriCreative=api;
})(typeof window!=='undefined'?window:globalThis);
