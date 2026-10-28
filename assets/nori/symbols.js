'use strict';
(()=>{const {$,esc}=Nori;const groups={
 '표정':[['😊','웃음 미소 smile happy'],['😄','웃음 행복'],['🥰','사랑 행복 love'],['😉','윙크 wink'],['🥹','감동 눈물'],['😎','멋짐 선글라스'],['🤔','생각 고민'],['😭','눈물 울음'],['😴','잠 졸림 sleep'],['🥳','축하 파티'],['🙃','거꾸로 웃음'],['🤗','포옹 응원']],
 '하트·별':[['♡','빈 하트 heart'],['♥','검정 하트'],['❤','빨강 하트'],['💚','초록 하트 green'],['💛','노랑 하트'],['💜','보라 하트'],['💕','두 하트'],['✦','반짝 별 star'],['★','별'],['☆','빈 별'],['✧','반짝임'],['✨','반짝 sparkling']],
 '기호':[['✓','체크 check 확인'],['✔','체크 완료'],['☑','체크 상자'],['☐','빈 상자 체크리스트'],['✕','엑스 닫기 취소'],['●','동그라미 원 circle'],['○','빈 원'],['■','네모 square'],['□','빈 네모'],['△','삼각형'],['※','참고 주의'],['•','목록 점 bullet'],['·','가운뎃점'],['…','말줄임표'],['°','도 온도'],['℃','섭씨'],['㎡','제곱미터 면적'],['×','곱하기'],['÷','나누기'],['±','플러스 마이너스'],['①','동그라미 1 숫자'],['②','동그라미 2 숫자'],['③','동그라미 3 숫자']],
 '화살표':[['→','오른쪽 화살표 arrow'],['←','왼쪽 화살표 arrow'],['↑','위 화살표'],['↓','아래 화살표'],['↗','오른쪽 위 화살표'],['↘','오른쪽 아래 화살표'],['↔','양방향 화살표'],['⇄','교환 화살표'],['➜','오른쪽 화살표'],['➤','화살표']],
 '일상·자연':[['🌱','새싹 정원 plant'],['🌸','벚꽃 꽃 flower'],['🌷','튤립 꽃'],['🌻','해바라기 꽃'],['🍀','행운 클로버'],['🌿','풀 잎 자연'],['☀','태양 해 날씨'],['☁','구름 날씨'],['🌙','달 밤'],['⭐','별 star'],['🍎','사과 과일'],['☕','커피 휴식'],['🎁','선물'],['🎉','축하'],['📌','핀 고정 메모'],['📝','메모 글쓰기'],['⏰','알람 시간'],['💡','아이디어 전구'],['🎮','게임 놀이'],['🦖','공룡 노리']],
 '텍스트 표정':[]};let category='전체',mood='전체',visible=48;
const all=Object.entries(groups).flatMap(([g,a])=>a.map(([char,tags])=>({g,char,tags,mood:''}))).concat(NoriTextFaces.map(x=>({...x,g:'텍스트 표정'})));
const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,'');
function render(){const q=$('symbol-search').value.trim().split(/\s+/).filter(Boolean).map(normalize);
$('symbol-filters').innerHTML=['전체',...Object.keys(groups)].map(g=>'<button data-group="'+g+'" aria-pressed="'+(category===g)+'">'+g+(g==='텍스트 표정'?' '+NoriTextFaces.length:'')+'</button>').join('');
$('face-moods').hidden=category!=='텍스트 표정';$('face-moods').innerHTML=['전체',...new Set(NoriTextFaces.map(x=>x.mood))].map(m=>'<button data-mood="'+esc(m)+'" aria-pressed="'+(mood===m)+'">'+esc(m)+'</button>').join('');
const list=all.filter(x=>(category==='전체'||x.g===category)&&(category!=='텍스트 표정'||mood==='전체'||x.mood===mood)&&q.every(w=>normalize(x.char+' '+(window.NoriI18n?NoriI18n.search([x.tags,x.g,x.mood]):x.tags+' '+x.g+' '+x.mood)).includes(w)));
$('symbol-grid').classList.toggle('faces-only',category==='텍스트 표정');
$('symbol-grid').innerHTML=list.length?list.slice(0,visible).map(x=>'<button class="'+(x.g==='텍스트 표정'?'text-face':'')+'" data-char="'+esc(x.char)+'" title="'+esc(x.char+' · '+(x.mood||x.tags))+'" aria-label="'+esc((x.mood||x.tags.split(' ')[0])+' '+x.char+' 복사')+'"><span translate="no">'+esc(x.char)+'</span><small>'+esc(x.mood||x.tags.split(' ')[0])+'</small></button>').join(''):'<p class="symbol-empty">검색 결과가 없어요. 다른 단어나 기분을 선택해 주세요.</p>';
$('symbol-count').textContent=list.length+'개 중 '+Math.min(visible,list.length)+'개 표시';$('symbols-more').hidden=list.length<=visible;
}
$('symbol-search').oninput=()=>{visible=48;render()};$('symbol-filters').onclick=e=>{const b=e.target.closest('[data-group]');if(b){category=b.dataset.group;mood='전체';visible=48;render()}};
$('face-moods').onclick=e=>{const b=e.target.closest('[data-mood]');if(b){mood=b.dataset.mood;visible=48;render()}};
$('symbols-more').onclick=()=>{visible+=48;render()};
async function copy(value){try{await navigator.clipboard.writeText(value);$('symbol-status').textContent='복사했어요. 원하는 곳에 붙여 넣으세요.'}catch{$('symbol-collection').focus();$('symbol-collection').select();$('symbol-status').textContent='모음 칸에서 직접 선택해 복사해 주세요.'}}$('symbol-grid').onclick=e=>{const b=e.target.closest('[data-char]');if(!b)return;const v=b.dataset.char;if($('symbol-collection').value.length+v.length<=1000)$('symbol-collection').value+=v;copy(v)};$('symbol-copy').onclick=()=>copy($('symbol-collection').value);$('symbol-clear').onclick=()=>{$('symbol-collection').value='';$('symbol-status').textContent='모음을 비웠어요.'};document.addEventListener('nori:languagechange',render);render();
})();
