'use strict';
(()=>{const {$}=Nori,kind=document.querySelector('[data-design]').dataset.design,canvas=$('design-canvas'),ctx=canvas.getContext('2d'),out=Nori.exporter($('design-download'),$('design-help'));let revision=0;
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
 fitted(val('card-name'),7.2,21.4,6.5,f.width-29,ink);
 fitted(val('card-role'),7.5,26.4,2.45,f.width-29,muted);
 [val('card-phone'),val('card-email'),val('card-address')].filter(Boolean).forEach((s,i)=>fitted(s,7.5,f.height-15.5+i*4.3,2.3,f.width-15,muted));
 if($('card-nori').checked&&nori.complete&&nori.naturalWidth){const ratio=nori.naturalWidth/nori.naturalHeight;ctx.drawImage(nori,f.width-18,11,12.7*ratio,12.7)}
 ctx.setTransform(1,0,0,1,0,0);
 $('card-dimensions').textContent='완성 '+f.width+' × '+f.height+'mm · 사방 재단 여백 1mm · 저장 '+f.outputWidth+' × '+f.outputHeight+'mm ('+f.pixelWidth+' × '+f.pixelHeight+'px, 300dpi)';
 $('card-trim-guide').style.inset=(f.bleed/f.outputHeight*100)+'% '+(f.bleed/f.outputWidth*100)+'%';
 $('card-print-area').style.setProperty('--card-print-width',f.outputWidth+'mm');$('card-print-area').style.setProperty('--card-print-height',f.outputHeight+'mm');
 }else{const shape=val('stamp-shape');canvas.width=shape==='wide'?1200:800;canvas.height=shape==='wide'?500:800;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle=color;ctx.lineWidth=23;ctx.beginPath();if(shape==='round')ctx.arc(w/2,h/2,352,0,Math.PI*2);else ctx.roundRect(45,45,w-90,h-90,shape==='wide'?25:10);ctx.stroke();ctx.lineWidth=4;ctx.beginPath();if(shape==='round')ctx.arc(w/2,h/2,326,0,Math.PI*2);else ctx.roundRect(68,68,w-136,h-136,shape==='wide'?17:5);ctx.stroke();const str=val('stamp-text'),chars=Array.from(str),font=val('stamp-font');let lines=[];if(val('stamp-layout')==='vertical')lines=chars;else if(val('stamp-layout')==='grid'){const split=Math.ceil(chars.length/2);lines=[chars.slice(0,split).join(''),chars.slice(split).join('')].filter(Boolean)}else lines=[str];const areaH=h*(shape==='round'?.68:.7),size=Math.min(210,areaH/Math.max(lines.length,1)*.83);lines.forEach((line,i)=>fitted(line,w/2,h/2-areaH/2+areaH/Math.max(lines.length,1)*(i+.76),size,w*(shape==='round'?.65:.78),color,font,'center'))}}
document.querySelector('.design-editor').addEventListener('input',()=>{revision++;out.clear();$('design-status').textContent='미리보기를 바꿨어요. PNG를 다시 준비해 주세요.';draw()});
$('design-export').onclick=async()=>{if(kind==='stamp'&&!val('stamp-text')){$('design-status').textContent='도장에 넣을 이름이나 문구를 적어주세요.';return}const version=revision;$('design-export').disabled=true;try{await document.fonts.ready;draw();let blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('이미지를 만들지 못했어요.');if(kind==='card')blob=await NoriCardPrint.density(blob);if(version!==revision)return;const f=kind==='card'?NoriCardPrint.size(val('card-size')):null;await out.prepare(blob,f?'nori-business-card-'+f.width+'x'+f.height+'mm-bleed1mm-300dpi.png':'nori-stamp.png');if(version!==revision){out.clear();return}$('design-status').textContent='PNG가 준비됐어요. 저장 버튼을 눌러주세요.'}catch(e){$('design-status').textContent=e.message}finally{$('design-export').disabled=false}};
if(kind==='card')$('card-print').onclick=async()=>{await document.fonts.ready;draw();const img=document.createElement('img');img.src=canvas.toDataURL('image/png');img.alt='인쇄용 명함';$('card-print-area').replaceChildren(img);img.onload=()=>window.print()};draw();
})();
