/* Fit the Korean mobile editor without changing the document's print layout. */
(()=>{
  const mounted=new WeakSet();
  const mobile=matchMedia('screen and (max-width:767px)');
  function mount(){
    const viewport=document.querySelector('.paper-wrap, .document-scroll');
    if(!viewport||mounted.has(viewport))return false;
    const resume=viewport.classList.contains('paper-wrap');
    const paper=viewport.querySelector(resume?'.modern-paper':'.sheet');
    if(!paper)return false;
    const totalWidth=resume?900:964;
    mounted.add(viewport);
    const previous=viewport.previousElementSibling;
    const bar=previous?.classList.contains('mobile-document-controls')?previous:document.createElement('div');
    bar.className='mobile-document-controls';bar.setAttribute('translate','no');
    bar.innerHTML='<div class="mobile-document-buttons" role="group" aria-label="문서 화면 크기"><button type="button" data-mode="fit" aria-pressed="true">화면에 맞춤</button><button type="button" data-mode="large" aria-pressed="false">크게 보기</button><output aria-label="문서 표시 배율"></output></div><p>전체 문서를 한눈에 확인하고, 입력할 때는 크게 보기를 눌러 주세요.</p>';
    if(!bar.isConnected)viewport.before(bar);
    let mode='fit',frame=0;
    function update(){
      const enabled=mobile.matches&&document.documentElement.lang==='ko';
      viewport.toggleAttribute('data-mobile-document',enabled);bar.hidden=!enabled;
      if(!enabled){viewport.style.removeProperty('--mobile-document-scale');return;}
      const available=Math.max(1,viewport.clientWidth-24);
      const scale=mode==='fit'?Math.min(1,available/totalWidth):1;
      viewport.style.setProperty('--mobile-document-scale',String(scale));
      viewport.dataset.documentView=mode;
      bar.querySelector('output').textContent=Math.round(scale*100)+'%';
      bar.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
      if(mode==='fit')viewport.scrollLeft=0;
      if(typeof window.refreshDeleteOverlay==='function')window.refreshDeleteOverlay();
    }
    function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;update();});}
    bar.addEventListener('click',event=>{const button=event.target.closest('button[data-mode]');if(!button)return;mode=button.dataset.mode;update();});
    new ResizeObserver(schedule).observe(viewport);
    mobile.addEventListener('change',schedule);
    document.addEventListener('nori:languagechange',schedule);
    new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    update();
    return true;
  }
  function start(){
    if(mount())return;
    const root=document.getElementById('resume-root');
    if(root){const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(root,{childList:true,subtree:true});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
