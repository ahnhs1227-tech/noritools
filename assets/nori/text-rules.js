'use strict';
(function(root){
 const rules=[
 ['됬','됐','“되었”의 준말은 “됐”이에요.'],['되요','돼요','“되어요”는 “돼요”로 줄여 써요.'],['몇일','며칠','날짜를 물을 때나 며칠 동안이라는 뜻에는 “며칠”을 써요.'],['어의없','어이없','“어이없다”가 맞는 표기예요.'],['금새','금세','시간이 얼마 지나지 않았다는 뜻은 “금세”예요. 금새(물건의 값)를 뜻한다면 바꾸지 마세요.'],['웬지','왠지','“왜인지”를 줄여 “왠지”라고 써요.'],['설겆이','설거지','“설거지”가 맞는 표기예요.'],['할께','할게','약속하는 말은 “할게”라고 써요.'],['바램','바람','원하는 마음을 뜻하면 “바람”이에요. 색이 바랜다는 뜻이라면 바꾸지 마세요.'],['오랫만','오랜만','“오래간만”을 줄인 말은 “오랜만”이에요.'],['역활','역할','맡은 일은 “역할”이라고 써요.'],['뵈요','봬요','“뵈어요”를 줄인 말은 “봬요”예요.'],['진행하도록 하겠습니다','진행하겠습니다','뜻을 유지하면서 간결하게 쓸 수 있어요.'],['확인을 부탁드립니다','확인 부탁드립니다','조사를 덜어 간결하게 쓸 수 있어요.'],['에 대한 검토를 진행','을 검토','문장 전체에서 조사가 자연스러운지 확인해 주세요.']
 ];
 function suggestions(text){const out=[];for(const [from,to,why] of rules){let i=text.indexOf(from);while(i!==-1){out.push({start:i,end:i+from.length,from,to,why});i=text.indexOf(from,i+from.length)}}for(const m of text.matchAll(/[ \t]{2,}/g))out.push({start:m.index,end:m.index+m[0].length,from:m[0],to:' ',why:'겹친 공백을 한 칸으로 정리해요. 들여쓰기라면 유지하세요.'});return out.sort((a,b)=>a.start-b.start).filter((x,i,a)=>!i||x.start>=a[i-1].end)}
 function apply(text,items){let result=text;for(const s of [...items].sort((a,b)=>b.start-a.start)){if(result.slice(s.start,s.end)!==s.from)throw Error('글이 변경됐어요. 다시 점검해 주세요.');result=result.slice(0,s.start)+s.to+result.slice(s.end)}return result}
 const api={suggestions,apply};if(typeof module!=='undefined')module.exports=api;else root.NoriText=api;
})(typeof window==='undefined'?globalThis:window);
