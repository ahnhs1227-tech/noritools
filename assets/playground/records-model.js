'use strict';
(function(root){
 const boards=['catch','run','memory-6','memory-8','memory-10'];
 const nickname=value=>String(value??'').normalize('NFKC').replace(/\s+/g,' ').trim();
 const nameKey=value=>nickname(value).toLocaleLowerCase('ko-KR');
 function validName(value){const s=nickname(value);return Array.from(s).length>=2&&Array.from(s).length<=12&&/^[\p{L}\p{N} _-]+$/u.test(s)}
 function validResult(board,r){if(!boards.includes(board)||!r||typeof r!=='object')return false;return board.startsWith('memory-')?Number.isInteger(r.moves)&&r.moves>=Number(board.split('-')[1])&&r.moves<=100000&&Number.isInteger(r.seconds)&&r.seconds>=0&&r.seconds<=86400:Number.isInteger(r.score)&&r.score>=0&&r.score<=1000000000}
 function compareResult(board,a,b){return board.startsWith('memory-')?a.moves-b.moves||a.seconds-b.seconds:b.score-a.score}
 function sort(board,rows){return rows.slice().sort((a,b)=>compareResult(board,a,b)||a.savedAt-b.savedAt||a.id.localeCompare(b.id))}
 function empty(){return {version:1,boards:Object.fromEntries(boards.map(k=>[k,[]]))}}
 function sanitize(raw){const next=empty();if(!raw||raw.version!==1)return next;for(const key of boards){const seen=new Set();const rows=(Array.isArray(raw.boards?.[key])?raw.boards[key]:[]).slice(0,1000).filter(r=>r&&validName(r.nickname)&&validResult(key,r)&&Number.isFinite(r.savedAt)&&r.savedAt>=0&&typeof r.id==='string'&&r.id.length<=100).map(r=>({id:r.id,nickname:nickname(r.nickname),savedAt:r.savedAt,...(key.startsWith('memory-')?{moves:r.moves,seconds:r.seconds}:{score:r.score})}));next.boards[key]=sort(key,rows).filter(r=>{const name=nameKey(r.nickname);if(seen.has(name))return false;seen.add(name);return true}).slice(0,100)}return next}
 function add(raw,board,name,result,now,id){if(!validName(name)||!validResult(board,result))throw Error('닉네임 또는 기록을 확인해 주세요.');const data=sanitize(raw),rows=data.boards[board],key=nameKey(name),old=rows.find(r=>nameKey(r.nickname)===key);if(old&&compareResult(board,result,old)>=0)return {data,changed:false,rank:rows.indexOf(old)+1,reason:'best'};const record={id,nickname:nickname(name),savedAt:now,...(board.startsWith('memory-')?{moves:result.moves,seconds:result.seconds}:{score:result.score})};const ordered=sort(board,rows.filter(r=>nameKey(r.nickname)!==key).concat(record));const rank=ordered.indexOf(record)+1;if(rank>100)return {data,changed:false,rank,reason:'limit'};data.boards[board]=ordered.slice(0,100);return {data,changed:true,rank,reason:old?'improved':'new'}}
 const api={boards,nickname,nameKey,validName,validResult,compareResult,sort,empty,sanitize,add};if(typeof module==='object'&&module.exports)module.exports=api;else root.NoriRecordsModel=api;
})(typeof window==='undefined'?globalThis:window);
