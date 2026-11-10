'use strict';
(()=>{
 const {$,esc,fmt}=Nori, t=s=>window.NoriI18n?.t(s)||s;
 const rows=$('area-rows');let copyText='',currencyTouched=false;
 function add(w='100',h='100',q='1'){
  if(rows.children.length>=20)return;
  const row=document.createElement('div');row.className='area-row';
  row.innerHTML='<label class="field">가로<input data-area="width" type="number" min="0" step="any" value="'+w+'"></label><label class="field">세로<input data-area="height" type="number" min="0" step="any" value="'+h+'"></label><label class="field">수량<input data-area="quantity" type="number" min="1" step="1" value="'+q+'"></label><button type="button" class="secondary">공간 삭제</button>';
  row.querySelector('button').onclick=()=>{row.remove();update()};
  rows.append(row);update();
 }
 function read(id){const s=$(id).value;if(s.trim()==='')throw Error('빈칸을 채우고 0 이상의 숫자를 입력해 주세요.');return Number(s)}
 function update(){
  const mode=$('area-mode').value;
  $('material-fields').hidden=mode==='sqm';
  $('pack-field').hidden=mode!=='pack';
  $('area-price-label').textContent=mode==='sqm'?'㎡당 단가':mode==='piece'?'장당 단가':'포장당 단가';
  $('area-add').disabled=rows.children.length>=20;
  rows.querySelectorAll('button').forEach(b=>b.disabled=rows.children.length===1);
  try{
   const spaces=[...rows.children].map(row=>Object.fromEntries([...row.querySelectorAll('input')].map(input=>{if(input.value.trim()==='')throw Error('빈칸을 채우고 0 이상의 숫자를 입력해 주세요.');return [input.dataset.area,Number(input.value)]})));
   const input={spaces,unit:$('area-unit').value,loss:read('area-loss'),mode,price:read('area-price'),
    width:mode==='sqm'?1:read('material-width'),height:mode==='sqm'?1:read('material-height'),materialUnit:$('material-unit').value,pack:mode==='pack'?read('material-pack'):1};
   const r=NoriCalc.area(input),code=$('area-currency').value;
   const money=code==='NONE'?fmt(r.cost,2):new Intl.NumberFormat(document.documentElement.lang,{style:'currency',currency:code,maximumFractionDigits:code==='KRW'||code==='JPY'?0:2}).format(r.cost);
   $('area-total').textContent=fmt(r.total,6)+' ㎡';$('area-base').textContent=fmt(r.base,6)+' ㎡';
   $('area-pyeong-result').hidden=!$('area-pyeong').checked;$('area-pyeong-value').textContent=fmt(r.total/3.305785,4);
   $('material-results').hidden=mode==='sqm';
   $('material-needed').textContent=fmt(r.pieces,0);
   $('material-buy').textContent=mode==='pack'?fmt(r.packs,0)+' '+t('포장')+' · '+fmt(r.bought,0)+' '+t('장'):fmt(r.bought,0)+' '+t('장');
   $('material-coverage').textContent=fmt(r.coverage,6)+' ㎡';
   $('area-cost').textContent=money;
   $('area-error').hidden=true;$('area-results').hidden=false;
   copyText=t('필요 면적')+': '+fmt(r.total,6)+' ㎡\n'+(mode==='sqm'?'':t('구매 수량')+': '+$('material-buy').textContent+'\n')+t('예상 자재비')+': '+money;
  }catch(e){$('area-error').textContent=t(e.message);$('area-error').hidden=false;$('area-results').hidden=true;copyText='';}
  $('area-copy-status').textContent='';$('area-copy-fallback').hidden=true;
 }
 function locale(){if(!currencyTouched)$('area-currency').value=document.documentElement.lang==='zh-CN'?'CNY':document.documentElement.lang==='ja'?'JPY':document.documentElement.lang==='en'?'USD':'KRW';update()}
 $('area-add').onclick=()=>{const n=$('area-unit').value==='m'?'1':$('area-unit').value==='mm'?'1000':'100';add(n,n)};
 $('area-form').addEventListener('input',update);$('area-form').addEventListener('change',update);
 $('area-currency').addEventListener('change',()=>{currencyTouched=true});
 $('area-copy').onclick=async()=>{if(!copyText)return;try{await navigator.clipboard.writeText(copyText);$('area-copy-status').textContent=t('결과를 복사했어요.')}catch{$('area-copy-fallback').value=copyText;$('area-copy-fallback').hidden=false;$('area-copy-fallback').select();$('area-copy-status').textContent=t('아래 결과를 직접 복사해 주세요.')}};
 $('area-example').onclick=()=>{rows.replaceChildren();$('area-unit').value='m';$('area-loss').value='10';$('area-mode').value='pack';$('material-width').value='600';$('material-height').value='600';$('material-unit').value='mm';$('material-pack').value='4';$('area-price').value=document.documentElement.lang==='zh-CN'?'80':'20000';add('3','4');update()};
 document.addEventListener('nori:languagechange',update);
 $('area-pyeong').checked=document.documentElement.lang==='ko';add();locale();
})();
