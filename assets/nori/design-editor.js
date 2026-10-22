'use strict';
(()=>{const {$}=Nori,kind=document.querySelector('[data-design]').dataset.design,canvas=$('design-canvas'),ctx=canvas.getContext('2d'),out=Nori.exporter($('design-download'),$('design-help'));let revision=0,logo=null,logoTicket=0,logoLoading=false,exporting=false;
const nori=new Image();nori.onload=()=>{out.clear();revision++;draw()};nori.src=Nori.base+'nori-dino-mascot.png';
const val=id=>$(id).value.trim();function fitted(text,x,y,size,max,color,font='sans-serif',align='left'){ctx.fillStyle=color;ctx.textAlign=align;ctx.font='600 '+size+'px '+font;const minimum=kind==='card'?1:8,step=kind==='card'?.05:1;while(ctx.measureText(text).width>max&&size>minimum){size=Math.max(minimum,size-step);ctx.font='600 '+size+'px '+font}ctx.fillText(text,x,y)}
function draw(){const color=val('design-color');if(kind==='card'){
 const f=NoriCardPrint.size(val('card-size'));canvas.width=f.pixelWidth;canvas.height=f.pixelHeight;
 ctx.setTransform(canvas.width/f.outputWidth,0,0,canvas.height/f.outputHeight,0,0);
 const style=val('card-style'),dark=style==='dark';ctx.fillStyle=dark?'#263426':style==='soft'?'#f1f5e6':'#fffefa';ctx.fillRect(0,0,f.outputWidth,f.outputHeight);
 ctx.fillStyle=color;ctx.fillRect(0,0,f.bleed+2.1,f.outputHeight);
 if(style==='soft'){ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(f.width-7,1,24,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 ctx.translate(f.bleed,f.bleed);
 const ink=dark?'#fbfcef':'#293426',muted=dark?'#c7d2bd':'#62705a';
 fitted(val('card-company'),7.2,8.8,2.55,f.width-14.4,color);
 fitted(val('card-name'),7.2,21.4,6.5,f.width-(logo&&$('card-use-logo').checked?35:29),ink);
 fitted(val('card-role'),7.5,26.4,2.45,f.width-(logo&&$('card-use-logo').checked?35:29),muted);
 [val('card-phone'),val('card-email'),val('card-address')].filter(Boolean).forEach((s,i)=>fitted(s,7.5,f.height-15.5+i*4.3,2.3,f.width-15,muted));
 if(logo&&$('card-use-logo').checked){const scale=Math.min(18/logo.width,18/logo.height),w=logo.width*scale,h=logo.height*scale;ctx.drawImage(logo,f.width-25+(18-w)/2,11+(18-h)/2,w,h)}else if($('card-nori').checked&&nori.complete&&nori.naturalWidth){const ratio=nori.naturalWidth/nori.naturalHeight;ctx.drawImage(nori,f.width-18,11,12.7*ratio,12.7)}
 ctx.setTransform(1,0,0,1,0,0);
 $('card-dimensions').textContent='완성 '+f.width+' × '+f.height+'mm · 사방 재단 여백 1mm · 저장 '+f.outputWidth+' × '+f.outputHeight+'mm ('+f.pixelWidth+' × '+f.pixelHeight+'px, 300dpi)';
 $('card-trim-guide').style.inset=(f.bleed/f.outputHeight*100)+'% '+(f.bleed/f.outputWidth*100)+'%';
 $('card-print-area').style.setProperty('--card-print-width',f.outputWidth+'mm');$('card-print-area').style.setProperty('--card-print-height',f.outputHeight+'mm');
 }else{const shape=val('stamp-shape');canvas.width=shape==='wide'?1200:800;canvas.height=shape==='wide'?500:800;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle=color;ctx.lineWidth=23;ctx.beginPath();if(shape==='round')ctx.arc(w/2,h/2,352,0,Math.PI*2);else ctx.roundRect(45,45,w-90,h-90,shape==='wide'?25:10);ctx.stroke();ctx.lineWidth=4;ctx.beginPath();if(shape==='round')ctx.arc(w/2,h/2,326,0,Math.PI*2);else ctx.roundRect(68,68,w-136,h-136,shape==='wide'?17:5);ctx.stroke();const str=val('stamp-text'),chars=Array.from(str),font=val('stamp-font');let lines=[];if(val('stamp-layout')==='vertical')lines=chars;else if(val('stamp-layout')==='grid'){const split=Math.ceil(chars.length/2);lines=[chars.slice(0,split).join(''),chars.slice(split).join('')].filter(Boolean)}else lines=[str];const areaH=h*(shape==='round'?.68:.7),size=Math.min(210,areaH/Math.max(lines.length,1)*.83);lines.forEach((line,i)=>fitted(line,w/2,h/2-areaH/2+areaH/Math.max(lines.length,1)*(i+.76),size,w*(shape==='round'?.65:.78),color,font,'center'))}}
function changed(){revision++;out.clear();$('design-status').textContent='미리보기를 바꿨어요. PNG를 다시 준비해 주세요.';draw()}
function updateButtons(){$('design-export').disabled=exporting||logoLoading;if(kind==='card')$('card-print').disabled=logoLoading}
if(kind==='card'){
 $('card-nori').addEventListener('input',()=>{if($('card-nori').checked)$('card-use-logo').checked=false});
 $('card-use-logo').addEventListener('input',()=>{if($('card-use-logo').checked)$('card-nori').checked=false});
 $('card-logo-remove').onclick=()=>{logoTicket++;logoLoading=false;logo=null;$('card-logo-file').value='';$('card-logo-thumb').removeAttribute('src');$('card-logo-options').hidden=true;$('card-use-logo').checked=false;$('card-logo-name').textContent='';$('card-logo-status').textContent='로고를 제거했어요. 노리를 넣고 싶다면 체크해 주세요.';updateButtons();changed()};
 $('card-logo-file').onchange=async()=>{const file=$('card-logo-file').files[0];if(!file)return;const ticket=++logoTicket;logoLoading=false;updateButtons();const tell=text=>$('card-logo-status').textContent=text;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)&&!(file.type===''&&/\.(png|jpe?g|webp)$/i.test(file.name))){tell('PNG, JPG, WebP 로고 파일을 골라주세요. 기존 로고는 그대로 유지돼요.');$('card-logo-file').value='';return}
 if(file.size===0||file.size>10*1024*1024){tell('0바이트보다 크고 10 MB 이하인 로고를 골라주세요.');$('card-logo-file').value='';return}
 logoLoading=true;revision++;out.clear();updateButtons();tell('로고를 불러오고 있어요…');const url=URL.createObjectURL(file);
 try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('로고 이미지를 열지 못했어요. 다른 이미지 파일을 선택해 주세요.'));img.src=url});if(ticket!==logoTicket)return;if(img.naturalWidth*img.naturalHeight>40000000)throw Error('로고가 너무 커요. 4,000만 화소 이하로 줄여주세요.');const scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight)),next=document.createElement('canvas');next.width=Math.max(1,Math.round(img.naturalWidth*scale));next.height=Math.max(1,Math.round(img.naturalHeight*scale));next.getContext('2d').drawImage(img,0,0,next.width,next.height);logo=next;$('card-logo-thumb').src=next.toDataURL('image/png');$('card-logo-name').textContent=file.name;$('card-logo-options').hidden=false;$('card-use-logo').checked=true;$('card-nori').checked=false;tell('로고를 넣었어요. 원래 비율을 유지하고, 투명한 부분은 그대로 살려요.');changed()}catch(e){if(ticket===logoTicket)tell(e.message)}finally{URL.revokeObjectURL(url);if(ticket===logoTicket){logoLoading=false;$('card-logo-file').value='';updateButtons()}}
 };
}
document.querySelector('.design-editor').addEventListener('input',e=>{if(e.target.id!=='card-logo-file')changed()});
$('design-export').onclick=async()=>{if(logoLoading)return;if(kind==='stamp'&&!val('stamp-text')){$('design-status').textContent='도장에 넣을 이름이나 문구를 적어주세요.';return}const version=revision;exporting=true;updateButtons();try{await document.fonts.ready;draw();let blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('이미지를 만들지 못했어요.');if(kind==='card')blob=await NoriCardPrint.density(blob);if(version!==revision)return;const f=kind==='card'?NoriCardPrint.size(val('card-size')):null;await out.prepare(blob,f?'nori-business-card-'+f.width+'x'+f.height+'mm-bleed1mm-300dpi.png':'nori-stamp.png');if(version!==revision){out.clear();return}$('design-status').textContent='PNG가 준비됐어요. 저장 버튼을 눌러주세요.'}catch(e){$('design-status').textContent=e.message}finally{exporting=false;updateButtons()}};
if(kind==='card')$('card-print').onclick=async()=>{if(logoLoading)return;await document.fonts.ready;if(logoLoading)return;draw();const img=document.createElement('img');img.src=canvas.toDataURL('image/png');img.alt='인쇄용 명함';$('card-print-area').replaceChildren(img);img.onload=()=>window.print()};draw();
})();
