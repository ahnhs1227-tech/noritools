'use strict';
(() => {
  const scriptURL = document.currentScript.src;
  const $ = id => document.getElementById(id);
  const fileInput=$('file'), status=$('status'), progress=$('progress');
  let worker=null, timer=null, selected=null, originalCanvas=null, originalURL=null, resultURL=null, busy=false, generation=0;
  const setStatus=(text,value)=>{status.textContent=text;progress.hidden=!busy;if(Number.isFinite(value)){progress.max=100;progress.value=value;}else progress.removeAttribute('value');};
  function setBusy(value){busy=value;$('choose').disabled=value;$('quality').disabled=value;$('retry').disabled=value;$('cancel').hidden=!value;$('replace').hidden=!selected; $('comparison').setAttribute('aria-busy',String(value));progress.hidden=!value;}
  const pngExport=new NoriPngExport({download:$('download'),help:$('save-help'),dialog:$('save-dialog'),preview:$('save-preview'),direct:$('save-direct'),share:$('save-share'),close:$('save-close'),note:$('save-note'),status:setStatus});
  function clearResult(){pngExport.clear();if(resultURL) URL.revokeObjectURL(resultURL);resultURL=null;$('result').removeAttribute('src');$('result').hidden=true;$('download').hidden=true;$('download').removeAttribute('href');$('result-placeholder').hidden=false;}
  function stopWorker(){clearTimeout(timer);timer=null;if(worker)worker.terminate();worker=null;}
  function fail(message){stopWorker();setBusy(false);$('error').textContent=message;$('error').hidden=false;$('retry').hidden=!originalCanvas;setStatus('아래 안내를 확인해 주세요.');}
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  const toBlob=c=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('PNG 파일을 만들지 못했어요. 더 작은 이미지로 다시 시도해 주세요.')),'image/png'));
  async function readImage(file){
    const url=URL.createObjectURL(file), img=new Image();
    try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('이미지를 열지 못했어요. 손상되지 않은 JPG, PNG, WebP 파일을 골라주세요.'));img.src=url;});return img;}finally{URL.revokeObjectURL(url);}
  }
  async function accept(files){
    if(files.length!==1){$('error').textContent='이미지는 한 번에 한 장씩 선택해 주세요.';$('error').hidden=false;return;}
    const file=files[0];
    if(!['image/jpeg','image/png','image/webp'].includes(file.type) && !(file.type==='' && /\.(jpe?g|png|webp)$/i.test(file.name))){$('error').textContent='JPG, PNG, WebP 이미지를 선택해 주세요.';$('error').hidden=false;return;}
    if(file.size>20*1024*1024 || file.size===0){$('error').textContent='0바이트보다 크고 20 MB 이하인 이미지를 선택해 주세요.';$('error').hidden=false;return;}
    const ticket=++generation;stopWorker();clearResult();selected=file;originalCanvas=null;
    if(originalURL)URL.revokeObjectURL(originalURL);originalURL=null;$('original').removeAttribute('src');$('comparison').hidden=true;
    $('error').hidden=true;$('retry').hidden=true;$('size-note').hidden=true;setBusy(true);setStatus('이미지를 열고 있어요.');
    try{
      const img=await readImage(file);if(ticket!==generation)return;
      if(img.naturalWidth*img.naturalHeight>40000000)throw new Error('이미지가 너무 커요. 4,000만 화소 이하로 줄여서 다시 선택해 주세요.');
      const scale=Math.min(1,2048/Math.max(img.naturalWidth,img.naturalHeight));
      originalCanvas=canvas(Math.max(1,Math.round(img.naturalWidth*scale)),Math.max(1,Math.round(img.naturalHeight*scale)));
      originalCanvas.getContext('2d').drawImage(img,0,0,originalCanvas.width,originalCanvas.height);
      const blob=await toBlob(originalCanvas);if(ticket!==generation)return;
      originalURL=URL.createObjectURL(blob);$('original').src=originalURL;$('file-label').textContent=file.name;$('comparison').hidden=false;
      $('size-note').textContent=`결과 크기 ${originalCanvas.width.toLocaleString()} × ${originalCanvas.height.toLocaleString()} px${scale<1?' · 모바일에서도 안정적으로 처리하도록 긴 변을 2,048px로 줄였어요.':' · 원본 해상도를 유지해요.'}`;
      $('size-note').hidden=false;run(ticket);
    }catch(e){if(ticket===generation)fail(e.message);}
  }
  function run(ticket=++generation){
    if(!originalCanvas)return;clearResult();$('error').hidden=true;$('retry').hidden=true;setBusy(true);setStatus('이미지를 분석할 준비를 하고 있어요.');
    try{
      const small=canvas(320,320), ctx=small.getContext('2d',{willReadFrequently:true});
      ctx.fillStyle='#fff';ctx.fillRect(0,0,320,320);ctx.drawImage(originalCanvas,0,0,320,320);
      const pixels=ctx.getImageData(0,0,320,320).data,input=new Float32Array(3*320*320),mean=[.485,.456,.406],std=[.229,.224,.225];
      let max=1;for(let i=0;i<pixels.length;i+=4)max=Math.max(max,pixels[i],pixels[i+1],pixels[i+2]);
      for(let c=0;c<3;c++)for(let i=0;i<320*320;i++)input[c*320*320+i]=(pixels[4*i+c]/max-mean[c])/std[c];
      if(!worker)worker=new Worker(new URL('worker.js',scriptURL));
      worker.onmessage=async({data})=>{
        if(ticket!==generation)return;
        if(data.type==='progress')setStatus(data.text,data.value);
        if(data.type==='error')fail(data.message);
        if(data.type==='done'){
          clearTimeout(timer);setStatus('투명 PNG를 만들고 있어요.');
          try{
            const mask=canvas(320,320),mctx=mask.getContext('2d'),image=mctx.createImageData(320,320);
            for(let i=0;i<data.mask.length;i++){image.data[4*i]=255;image.data[4*i+1]=255;image.data[4*i+2]=255;image.data[4*i+3]=data.mask[i];}
            mctx.putImageData(image,0,0);
            const out=canvas(originalCanvas.width,originalCanvas.height),octx=out.getContext('2d');
            octx.drawImage(originalCanvas,0,0);octx.globalCompositeOperation='destination-in';octx.imageSmoothingEnabled=true;octx.imageSmoothingQuality='high';octx.drawImage(mask,0,0,out.width,out.height);
            const blob=await toBlob(out);if(ticket!==generation)return;
            resultURL=URL.createObjectURL(blob);$('result').src=resultURL;$('result').hidden=false;$('result-placeholder').hidden=true;
            if(!await pngExport.prepare(blob)||ticket!==generation)return;
            setBusy(false);setStatus('완료됐어요. 결과를 확인하고 투명 PNG로 저장하세요.');
          }catch(e){if(ticket===generation)fail(e.message);}
        }
      };
      worker.onerror=()=>{if(ticket===generation)fail('처리 엔진을 실행하지 못했어요. 최신 브라우저에서 다시 시도해 주세요.');};
      timer=setTimeout(()=>{if(ticket===generation)fail('처리가 오래 걸려 중단했어요. 다른 탭을 닫거나 더 작은 이미지로 다시 시도해 주세요.');},180000);
      worker.postMessage({type:'remove',input,mode:$('quality').value},[input.buffer]);
    }catch(e){fail('이 브라우저에서 처리를 시작하지 못했어요. 최신 브라우저에서 다시 시도해 주세요.');}
  }
  if(/KAKAOTALK/i.test(navigator.userAgent)){
    $('inapp-notice').hidden=false;
    const siteURL='https://ahnhs1227-tech.github.io/noritools/tools/background-remover/';
    if(/Android/i.test(navigator.userAgent)){
      const intent='intent://ahnhs1227-tech.github.io/noritools/tools/background-remover/#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(siteURL)+';end';
      $('open-chrome').href=intent;$('open-chrome').hidden=false;$('save-chrome').href=intent;$('inapp-save-actions').hidden=false;
    }
    $('copy-site').onclick=async()=>{try{await navigator.clipboard.writeText(siteURL);$('copy-status').textContent='주소를 복사했어요. Chrome 또는 삼성 인터넷 주소창에 붙여 넣어주세요.';}catch{$('copy-status').textContent='이 주소를 길게 눌러 복사해 주세요: '+siteURL;}};
  }
  $('quality').onchange=()=>{stopWorker();$('mode-note').textContent=$('quality').value==='quality'?'정밀 모드는 더 많은 디테일을 남겨요. 첫 사용은 Wi-Fi를 권장해요.':'빠른 모드는 가볍지만 가는 부분이나 복잡한 경계를 놓칠 수 있어요.';if(originalCanvas){clearResult();$('retry').hidden=false;setStatus('처리 방식을 바꿨어요. 다시 시도를 눌러주세요.');}};
  $('choose').onclick=$('replace').onclick=()=>{fileInput.value='';fileInput.click();};
  fileInput.onchange=()=>{if(fileInput.files.length)accept(fileInput.files);};
  $('retry').onclick=()=>{stopWorker();run();};
  $('cancel').onclick=()=>{generation++;stopWorker();setBusy(false);$('retry').hidden=!originalCanvas;setStatus('처리를 취소했어요. 다시 시도하거나 다른 이미지를 골라주세요.');};
  const drop=$('drop-zone');
  ['dragenter','dragover'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.add('dragging');}));
  ['dragleave','drop'].forEach(event=>drop.addEventListener(event,e=>{e.preventDefault();drop.classList.remove('dragging');}));
  drop.addEventListener('drop',e=>accept(e.dataTransfer.files));
  window.addEventListener('dragover',e=>e.preventDefault());window.addEventListener('drop',e=>e.preventDefault());
  window.addEventListener('pagehide',()=>{generation++;stopWorker();if(busy){setBusy(false);$('retry').hidden=!originalCanvas;setStatus('처리가 중단됐어요. 다시 시도를 눌러주세요.');}});
  // Keep completed results alive while a mobile viewer/save sheet opens.
  // URLs are released on replacement; the browser releases them on disposal.

})();
