'use strict';
(()=>{
 const $=id=>document.getElementById(id),canvas=$('signature-pad'),ctx=canvas.getContext('2d'),shell=canvas.closest('.signature-pad-shell'),W=1200;
 let H=600;
 const out=Nori.exporter($('signature-download'),$('signature-help'));
 let history=[[]],active=null,pointer=null,revision=0,busy=false;
 // A drawing session spans multiple strokes. Finger lifts must not re-enable scrolling.
 let scrollLock=null;
 const lockBar=$('signature-lock-bar');
 function lockPage(){
  if(scrollLock)return;
  const body=document.body,props=['position','top','left','width','overflow'];
  scrollLock={x:window.scrollX,y:window.scrollY,styles:props.map(name=>[name,body.style.getPropertyValue(name),body.style.getPropertyPriority(name)])};
  const width=body.getBoundingClientRect().width;
  document.documentElement.classList.add('signature-drawing');
  body.style.position='fixed';body.style.top=-scrollLock.y+'px';body.style.left=-scrollLock.x+'px';body.style.width=width+'px';body.style.overflow='hidden';
  lockBar.hidden=false;
 }
 function unlockPage(){
  finish();if(!scrollLock)return;
  const saved=scrollLock;scrollLock=null;
  for(const [name,value,priority] of saved.styles){if(value)document.body.style.setProperty(name,value,priority);else document.body.style.removeProperty(name)}
  lockBar.hidden=true;
  window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});
  document.documentElement.classList.remove('signature-drawing');
 }
 const blockSessionScroll=e=>{if(scrollLock&&e.cancelable)e.preventDefault()};
 document.addEventListener('touchmove',blockSessionScroll,{passive:false,capture:true});
 document.addEventListener('wheel',blockSessionScroll,{passive:false,capture:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')unlockPage()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)unlockPage()});
 window.addEventListener('pagehide',unlockPage);
 $('signature-drawing-done').onclick=unlockPage;
 const strokes=()=>history[history.length-1];
 function status(text){$('signature-status').textContent=text}
 function controls(){const empty=!strokes().length&&!active;$('signature-export').disabled=empty||busy||!!active;$('signature-undo').disabled=history.length<2||!!active;$('signature-clear').disabled=empty||!!active;$('signature-empty').hidden=!empty}
 function invalidate(){revision++;out.clear();$('signature-result').hidden=true;$('signature-preview').removeAttribute('src');status('사인을 그린 뒤 PNG로 저장해 주세요.')}
 function commit(next){history.push(next);if(history.length>31)history.shift();controls()}
 function drawStroke(target,s){const p=s.points;if(!p.length)return;target.strokeStyle=s.color;target.fillStyle=s.color;target.lineWidth=s.width;target.lineCap='round';target.lineJoin='round';if(p.length===1){target.beginPath();target.arc(p[0].x,p[0].y,s.width/2,0,Math.PI*2);target.fill();return}target.beginPath();target.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length-1;i++)target.quadraticCurveTo(p[i].x,p[i].y,(p[i].x+p[i+1].x)/2,(p[i].y+p[i+1].y)/2);target.lineTo(p[p.length-1].x,p[p.length-1].y);target.stroke()}
 function render(){ctx.clearRect(0,0,W,H);strokes().forEach(s=>drawStroke(ctx,s));if(active)drawStroke(ctx,active);controls()}
 // Keep one scale for both axes so a taller mobile pad does not distort ink or PNGs.
 function resizeSurface(){
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const nextH=Math.round(W*rect.height/rect.width);if(nextH===H)return;
  finish();const scale=Math.min(1,nextH/H),dx=W*(1-scale)/2,dy=(nextH-H*scale)/2;
  const seen=new Set();for(const snapshot of history)for(const stroke of snapshot){if(seen.has(stroke))continue;seen.add(stroke);stroke.width*=scale;stroke.points=stroke.points.map(p=>({x:p.x*scale+dx,y:p.y*scale+dy}))}
  H=nextH;canvas.height=H;invalidate();render();
 }
 // Cancel native touch panning only on the drawing surface, including its border.
 // Explicit non-passive listeners also cover embedded mobile browsers.
 const stopPadGesture=e=>{if(e.cancelable)e.preventDefault()};
 shell.addEventListener('touchstart',stopPadGesture,{passive:false});
 shell.addEventListener('touchmove',stopPadGesture,{passive:false});
 shell.addEventListener('contextmenu',stopPadGesture);
 function point(e){const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(W,(e.clientX-r.left)*W/r.width)),y:Math.max(0,Math.min(H,(e.clientY-r.top)*H/r.height))}}
 function finish(cancel=false){if(!active)return;const stroke=active,id=pointer;active=null;pointer=null;if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);if(!cancel)commit([...strokes(),stroke]);render();if(cancel)status('입력이 중단됐어요. 마지막 획을 다시 그려주세요.')}
 canvas.addEventListener('pointerdown',e=>{if(active||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();lockPage();invalidate();pointer=e.pointerId;active={color:$('signature-color').value,width:Number($('signature-width').value)*W/canvas.getBoundingClientRect().width,points:[point(e)]};canvas.setPointerCapture(pointer);render()});
 canvas.addEventListener('pointermove',e=>{if(!active||e.pointerId!==pointer)return;e.preventDefault();const events=e.getCoalescedEvents?.()||[];for(const event of events.length?events:[e]){const p=point(event),last=active.points[active.points.length-1];if(Math.hypot(p.x-last.x,p.y-last.y)>.5)active.points.push(p)}render()});
 canvas.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;const p=point(e),last=active.points[active.points.length-1];if(Math.hypot(p.x-last.x,p.y-last.y)>.5)active.points.push(p);finish()});
 canvas.addEventListener('pointercancel',e=>{if(e.pointerId===pointer)finish(true)});canvas.addEventListener('lostpointercapture',()=>{if(active)finish(true)});window.addEventListener('blur',unlockPage);window.addEventListener('resize',()=>{if(scrollLock)document.body.style.width=document.documentElement.clientWidth+'px';resizeSurface()});
 if(window.ResizeObserver)new ResizeObserver(resizeSurface).observe(canvas);
 $('signature-undo').onclick=()=>{if(active||history.length<2)return;history.pop();invalidate();render();status('이전 단계로 되돌렸어요.')};
 $('signature-clear').onclick=()=>{if(active||!strokes().length)return;commit([]);invalidate();render();status('모두 지웠어요. 되돌리기로 복원할 수 있어요.')};
 $('signature-width').oninput=()=>$('signature-width-value').textContent=$('signature-width').value+' px';
 document.querySelectorAll('[data-signature-color]').forEach(b=>b.onclick=()=>{$('signature-color').value=b.dataset.signatureColor;colors()});
 function colors(){document.querySelectorAll('[data-signature-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.signatureColor===$('signature-color').value)))}$('signature-color').oninput=colors;
 $('signature-crop').onchange=invalidate;
 $('signature-export').onclick=async()=>{if(active||!strokes().length||busy)return;unlockPage();busy=true;controls();const ticket=revision;try{
  let x=0,y=0,w=W,h=H;
  if($('signature-crop').checked){const pixels=ctx.getImageData(0,0,W,H).data;let l=W,t=H,r=-1,b=-1;for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++)if(pixels[(yy*W+xx)*4+3]){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,yy);b=Math.max(b,yy)}if(r<0)throw Error('먼저 사인을 그려주세요.');x=l;y=t;w=r-l+1;h=b-t+1}
  const output=document.createElement('canvas'),pad=24;output.width=w+pad*2;output.height=h+pad*2;output.getContext('2d').drawImage(canvas,x,y,w,h,pad,pad,w,h);
  const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(ticket!==revision)return;if(!blob)throw Error('PNG를 만들지 못했어요. 다시 시도해 주세요.');
  const prepared=await out.prepare(blob,'nori-signature.png');if(!prepared||ticket!==revision)return;
  $('signature-preview').src=$('signature-download').href;$('signature-dimensions').textContent=output.width+' × '+output.height+' px · PNG';$('signature-result').hidden=false;status('투명 PNG가 준비됐어요. PNG 저장을 눌러주세요.');
 }catch(e){if(ticket===revision)status(e.message||'PNG를 만들지 못했어요. 다시 시도해 주세요.')}finally{busy=false;controls()}};
 colors();resizeSurface();render();
})();
