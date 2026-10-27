'use strict';
(()=>{
const P=NoriPlay,{$}=P,board=$('memory-board'),level=$('memory-level');
const faces=[
 ['사진 노리','찰칵, 사진가','assets/nori/characters/nori-photo.webp','#e1ecf3'],
 ['요리 노리','냠냠, 요리사','assets/nori/characters/nori-recipe.webp','#f8e7c7'],
 ['스티커 노리','오늘도 꾸미기','assets/nori/characters/nori-sticker.webp','#eee2f4'],
 ['쇼핑 노리','장 보러 가요','assets/nori/characters/nori-shopping.webp','#f4e0dc'],
 ['바구니 노리','달콤한 수확','assets/playground/nori-catch.webp','#e5edcc'],
 ['달리는 노리','바람처럼 달려','assets/playground/nori-run.webp','#ddebee'],
 ['글 쓰는 노리','끄적끄적 작가','assets/playground/memory-writing.webp','#f4e8d5'],
 ['사과 노리','사과 한 입','assets/playground/memory-apple.webp','#f5dedf'],
 ['줄자 노리','얼마나 클까?','assets/playground/memory-measure.webp','#e4e8f5'],
 ['집 꾸미는 노리','우리 집 꾸미기','assets/playground/memory-floor-measure.webp','#e8ebd8']
];
let model=NoriMemory.create(6),s=model.s,lastSecond=-1,lastPreview=-1,messageTime=0,message='',count=6,focusAfterResolve=false;
const game=P.controller({key:'memory-6',onStart:start,onPause(){board.inert=true;$('memory-peek').disabled=true},onResume(){board.inert=false;redraw()}});
function best(){const b=P.read('nori-memory-'+count,null);return b&&Number.isFinite(b.moves)&&Number.isFinite(b.seconds)?b:null}
function bestLabel(){const b=best();game.setBestLabel(b?b.moves+'회 · '+b.seconds+'초':'아직 없어요')}
function build(){
 board.dataset.count=count;
 board.innerHTML=s.cards.map((id,i)=>`<button type="button" class="memory-card" data-card="${i}" style="--card-tint:${faces[id][3]}" aria-label="${i+1}번 카드"><span class="memory-back" aria-hidden="true"><span class="memory-flower">✿</span><b>NORI</b><small>LITTLE MOMENTS</small><i>${String(i+1).padStart(2,'0')}</i></span><span class="memory-face"><img src="/noritools/${faces[id][2]}" alt="" draggable="false"><small>${faces[id][1]}</small><span class="memory-check" aria-hidden="true">✓</span></span></button>`).join('');
 $('memory-album').innerHTML=s.ids.map(id=>`<span class="album-slot" data-face="${id}" title="${faces[id][0]}"><img src="/noritools/${faces[id][2]}" alt="${faces[id][0]}" draggable="false"><span aria-hidden="true">✓</span></span>`).join('');
}
function note(text,duration=1.6){message=text;messageTime=duration;game.announce(text)}
function redraw(){
 [...board.children].forEach((b,i)=>{const visible=model.visible(i),matched=s.matched.has(i);b.classList.toggle('is-open',visible);b.classList.toggle('is-matched',matched);b.classList.toggle('is-selected',s.chosen.includes(i)&&!matched);b.disabled=matched||s.preview>0||s.reveal>0||s.resolve>0;b.setAttribute('aria-label',`${i+1}번 카드 · ${visible?faces[s.cards[i]][0]:'뒤집기'}${matched?' · 맞춤':''}`)});
 const found=new Set([...s.matched].map(i=>s.cards[i]));for(const slot of $('memory-album').children)slot.classList.toggle('is-collected',found.has(Number(slot.dataset.face)));
 $('moves').textContent=s.moves+'회';$('pairs').textContent=s.matched.size/2+' / '+count;$('elapsed').textContent=Math.floor(s.time)+'초';
 $('memory-progress-fill').style.width=(s.matched.size/(count*2)*100)+'%';$('memory-progress').setAttribute('aria-valuenow',s.matched.size/2);$('memory-progress').setAttribute('aria-valuemax',count);
 $('memory-stars').textContent='★'.repeat(model.stars())+'☆'.repeat(3-model.stars());$('memory-stars').setAttribute('aria-label','현재 별 '+model.stars()+'개');
 $('memory-streak').textContent=s.streak>=2?s.streak+'연속 짝꿍!':'노리의 하루를 모아요';
 const peek=$('memory-peek');peek.textContent=s.hints?'살짝 보기 · +2회':'살짝 보기 사용 완료';peek.disabled=game.phase!=='running'||s.preview>0||s.reveal>0||s.resolve>0||s.chosen.length>0||!s.hints||s.over;
 hintText();
}
function hintText(){
 $('memory-hint').textContent=s.preview>0?`그림을 기억해요 · ${Math.ceil(s.preview)}초`:s.reveal>0?'살짝 보여줄게요! 도전 횟수 +2회':messageTime>0?message:'같은 노리 두 장을 찾아주세요.';
 $('memory-hint').classList.toggle('is-preview',s.preview>0||s.reveal>0);
}
function start(){
 count=Number(level.value);model=NoriMemory.create(count);s=model.s;lastSecond=lastPreview=-1;messageTime=0;focusAfterResolve=false;level.disabled=true;board.inert=false;build();redraw();bestLabel();
 if(typeof matchMedia==='function'&&matchMedia('(max-width:650px)').matches)board.closest('.game-panel')?.scrollIntoView({block:'start',behavior:'auto'});
 game.announce(Math.ceil(s.preview)+'초 동안 노리의 모습을 기억해요.');
}
function focusNext(){[...board.children].find(b=>!b.disabled)?.focus({preventScroll:true})}
function end(){
 level.disabled=false;const seconds=Math.floor(s.time),old=best();if(!old||s.moves<old.moves||(s.moves===old.moves&&seconds<old.seconds))P.save('nori-memory-'+count,{moves:s.moves,seconds});
 const title=['','끝까지 모았어요!','멋진 짝꿍 수집가!','노리 기억의 달인!'][model.stars()];
 game.end(0,'★'.repeat(model.stars())+' '+title,`${count}쌍을 ${s.moves}회 · ${seconds}초에 완성했어요. 최고 ${s.bestStreak}연속 성공!${s.hints?' 살짝 보기 없이 해냈어요.':' 살짝 보기 +2회가 기록에 포함돼요.'}`,{board:'memory-'+count,moves:s.moves,seconds});bestLabel();
}
function events(){
 for(const e of s.events){
  if(e.type==='flip')P.sound('jump');
  if(e.type==='match'){P.sound();note(e.streak>=2?`${e.streak}연속! 기억력이 반짝반짝`:`${faces[e.id][0]}의 짝꿍을 찾았어요!`)}
  if(e.type==='miss')note('이 두 장, 기억해 두면 돼요.',1.4);
  if(e.type==='hint')note('남은 카드를 잠깐 보여줄게요. 도전 횟수에 2회가 더해져요.',1.8);
  if(e.type==='ready'){note('이제 같은 노리의 짝을 찾아요!',1.8);redraw();focusNext()}
  if(e.type==='end')end();
  if(e.type==='settled'&&focusAfterResolve){focusAfterResolve=false;redraw();focusNext()}
 }
}
board.onclick=e=>{const b=e.target.closest('[data-card]');if(!b||game.phase!=='running')return;if(model.pick(Number(b.dataset.card))){if(s.resolve>0)focusAfterResolve=e.detail===0;events();redraw()}};
board.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))return;
 const b=e.target.closest('[data-card]');if(!b)return;e.preventDefault();const cols=getComputedStyle(board).gridTemplateColumns.split(' ').length,index=Number(b.dataset.card),delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.code];
 let next=index+delta;while(next>=0&&next<board.children.length){if(!board.children[next].disabled){board.children[next].focus();break}next+=delta}
});
$('memory-peek').onclick=()=>{if(game.phase==='running'&&model.hint()){events();redraw()}};
level.onchange=()=>{count=Number(level.value);P.records?.view('memory-'+count);bestLabel();if(game.phase==='idle'){model=NoriMemory.create(count);s=model.s;s.preview=0;build();redraw()}};
P.animate(dt=>{
 if(game.phase!=='running')return;model.step(dt);events();messageTime=Math.max(0,messageTime-dt);
 const sec=Math.floor(s.time),pre=Math.ceil(s.preview),hasEvents=s.events.length>0;
 if(sec!==lastSecond||pre!==lastPreview||hasEvents){redraw();lastSecond=sec;lastPreview=pre}else hintText();
},()=>{});
s.preview=0;build();redraw();bestLabel();P.ready(faces.map(f=>P.image(f[2])));
})();
