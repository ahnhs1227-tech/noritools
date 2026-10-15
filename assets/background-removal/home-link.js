/* Keep this addition separate from the exported Next.js calculator bundles. */
(() => {
  function attach(){
    // The existing site's own post-hydration home extension runs first.
    if(!document.getElementById('fortune-home-card'))return;
    const list=document.querySelector('.tool-list');
    if(list&&!document.getElementById('background-remover-card')){
      const card=document.createElement('a');card.id='background-remover-card';card.className='tool-card';card.href='/noritools/tools/background-remover/';
      card.innerHTML='<span class="tool-icon lime" aria-hidden="true">▧</span><div><small>IMAGE / NEW</small><h3>이미지 배경 지우기</h3><p>사진은 이 기기에서 처리하고, 배경 없는 PNG로 저장해요.</p></div><b>바로 사용하기 ↗</b>';
      list.appendChild(card);
    }
  }
  // Existing React hydration may replace home markup; restore only our own link.
  const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});attach();
  window.addEventListener('pagehide',()=>observer.disconnect());
  window.addEventListener('pageshow',()=>{observer.observe(document.body,{childList:true,subtree:true});attach();});
})();
