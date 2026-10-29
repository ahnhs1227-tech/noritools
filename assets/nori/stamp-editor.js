'use strict';
(()=>{
 const $=id=>document.getElementById(id),canvas=$('stamp-canvas'),ctx=canvas.getContext('2d'),out=Nori.exporter($('stamp-download'),$('stamp-help'));
 const fonts={"song":["Song Myung",400],"nanum":["Nanum Myeongjo",800],"noto":["Noto Serif KR",900],"gowunbatang":["Gowun Batang",700],"hahmlet":["Hahmlet",700],"gowundodum":["Gowun Dodum",400],"gasoek":["Gasoek One",400],"gugi":["Gugi",400],"dohyeon":["Do Hyeon",400],"blackhan":["Black Han Sans",400],"jua":["Jua",400],"sunflower":["Sunflower",700],"dongle":["Dongle",700],"dokdo":["Dokdo",400],"yeonsung":["Yeon Sung",400],"brush":["Nanum Brush Script",400],"eastsea":["East Sea Dokdo",400],"gamja":["Gamja Flower",400],"gaegu":["Gaegu",700],"pen":["Nanum Pen Script",400],"himelody":["Hi Melody",400],"system":["serif",700]};
 const templates={oval:{label:'타원 이름도장',text:'김노리',limit:8,hint:'공백 없이 1~8자. 타원 안에 세로로 배치해요.'},personal:{label:'원형 인감 스타일',text:'김노리',limit:8,hint:'이름과 끝 글자를 오른쪽 열부터 위아래로 배치해요.'},business:{label:'사업자 원형',text:'주식회사노리',limit:24,hint:'회사명 1~24자. 바깥 원을 따라 배치해요.'},square:{label:'사각 직인',text:'주식회사노리대표인',limit:16,hint:'1~16자. 아래에서 쓰기 방향과 줄 나누기를 바꿀 수 있어요.'},wide:{label:'가로 확인 도장',text:'확인완료',limit:12,hint:'확인·검수·감사 등 짧은 문구를 넣어주세요. 최대 12자.'}};
 // Examples belong to the selected language, not the UI translation dictionary.
 const examples={
  ko:{oval:'김노리',personal:'김노리',business:'주식회사노리',square:'주식회사노리대표인',wide:'확인완료',center:'代表理事',suffix:'印',lines:'주식회사\n노리상점\n대표이사',sample:['김노','리印'],mini:[['노','리'],['노리','之印'],['代表','理事'],['노리','직인'],['확인']],centerHint:'代表理事는 대표이사를 한자로 쓴 문구예요. 원하는 문구로 바꿀 수 있어요.'},
  ja:{oval:'佐藤ノリ',personal:'佐藤ノリ',business:'株式会社ノリ',square:'株式会社ノリ代表印',wide:'確認済',center:'代表取締役',suffix:'印',lines:'株式会社\nノリ商店\n代表印',sample:['佐藤','ノリ'],mini:[['ノ','リ'],['ノリ','之印'],['代表','取締役'],['ノリ','社印'],['確認']],centerHint:'「代表取締役」は会社の代表者を表す例です。好きな文言に変更できます。'},
  'zh-CN':{oval:'王诺里',personal:'王诺里',business:'诺里有限公司',square:'诺里有限公司公章',wide:'已确认',center:'法定代表人',suffix:'印',lines:'诺里\n有限公司\n公章',sample:['王诺','里印'],mini:[['诺','里'],['诺里','之印'],['法定','代表人'],['诺里','公章'],['确认']],centerHint:'“法定代表人”是中心文字示例，也可以输入您需要的文字。'},
  en:{oval:'Nori Doh',personal:'Nori Doh',business:'Nori Studio',square:'Nori Studio Seal',wide:'APPROVED',center:'CEO',suffix:'',lines:'Nori\nStudio\nSeal',sample:['Nori','Doh'],mini:[['N','D'],['Nori','Doh'],['CEO'],['Nori','Seal'],['OK']],centerHint:'“CEO” is an example for the center. You can replace it with your own text.'}
 };
 let exampleLocale='ko';const editedExamples=new Set();
 function setSample(el,lines){
  const text=el.querySelector('.stamp-sample-text');text.replaceChildren();
  lines.forEach((line,i)=>{if(i)text.append(document.createElement('br'));text.append(document.createTextNode(line))});
  el.dataset.sampleLines=JSON.stringify(lines);
 }
 // Measure real glyph ink and fit the whole sample inside an inscribed rectangle.
 // This also handles fonts whose CJK fallback is much taller than their Latin glyphs.
 function fitSamples(){
  const measure=document.createElement('canvas').getContext('2d');
  document.querySelectorAll('[data-sample-lines]').forEach(el=>{
   const text=el.querySelector('.stamp-sample-text'),style=getComputedStyle(el),lines=JSON.parse(el.dataset.sampleLines);
   const width=parseFloat(style.width),height=parseFloat(style.height);if(!width||!height)return;
   const inset=el.classList.contains('wide')||el.classList.contains('square')?.78:.66;
   measure.font=style.fontWeight+' 100px '+style.fontFamily;
   const ms=lines.map(line=>measure.measureText(line)),inkWidth=Math.max(1,...ms.map(m=>Math.max(m.width,(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||0))));
   const up=Math.max(1,...ms.map(m=>m.actualBoundingBoxAscent||80)),down=Math.max(0,...ms.map(m=>m.actualBoundingBoxDescent||0));
   const lineHeight=Math.max(110,up+down+10),scale=Math.min(width*inset/inkWidth,height*inset/(lineHeight*lines.length));
   text.style.fontSize=(100*scale)+'px';text.style.lineHeight=(lineHeight*scale)+'px';
  });
 }
 function localizeExamples(){
  const next=window.NoriI18n?.locale||'ko',old=examples[exampleLocale],current=examples[next]||examples.ko;
  for(const key of Object.keys(templates)){
   if(!editedExamples.has(key)&&drafts[key]===old[key])drafts[key]=current[key];
   templates[key].text=current[key];
  }
  if(!editedExamples.has(type)&&$('stamp-text').value===old[type])$('stamp-text').value=current[type];
  for(const [id,key] of [['stamp-center','center'],['stamp-square-lines','lines'],['stamp-suffix','suffix']]){
   if(!editedExamples.has(id)&&$(id).value===old[key])$(id).value=current[key];
  }
  if(!editedExamples.has('stamp-square-direction'))$('stamp-square-direction').value=next==='en'?'horizontal':'vertical';
  $('stamp-text').placeholder=current[type];$('stamp-center').placeholder=current.center;
  $('stamp-square-lines').placeholder=current.lines;
  $('stamp-center-hint').textContent=current.centerHint;
  document.querySelectorAll('.stamp-font-sample').forEach(el=>setSample(el,current.sample));
  document.querySelectorAll('.mini-seal').forEach((el,i)=>setSample(el,current.mini[i]));
  exampleLocale=next;fitSamples();
 }
 let type='oval',ticket=0,ready=false,exporting=false,composition=false;const drafts={};let localFace=null,localSerial=0;
 const value=id=>$(id).value.trim();const clean=s=>Array.from(s.replace(/\s/g,''));
 function state(){return {type,nameText:value('stamp-text'),text:type==='square'&&value('stamp-square-mode')==='manual'?value('stamp-square-lines').split(/\r?\n/).map(line=>clean(line).join('')).join(''):clean(value('stamp-text')).join(''),squareDirection:value('stamp-square-direction'),squareMode:value('stamp-square-mode'),squareCount:value('stamp-square-count'),squareLines:value('stamp-square-lines').split(/\r?\n/).map(line=>clean(line).join('')),center:clean(value('stamp-center')).join(''),centerFont:value('stamp-center-font'),suffix:value('stamp-suffix'),font:value('stamp-font'),border:value('stamp-border'),weight:Number(value('stamp-weight')),texture:Number(value('stamp-texture')),color:value('stamp-color'),size:Number(value('stamp-size'))/100,spacing:Number(value('stamp-spacing'))/100,centerSize:Number(value('stamp-center-size'))/100,centerSpacing:Number(value('stamp-center-spacing'))/100,mark:value('stamp-mark'),markSize:Number(value('stamp-mark-size'))/100}}
 function squareError(s){if(s.type!=='square')return '';if(!s.text)return '새길 문구를 입력해 주세요.';if(s.text.length>16)return '사각 직인의 전체 문구는 16자까지 넣을 수 있어요.';if(s.squareMode==='manual'){if(s.squareLines.length>4)return '직접 입력은 최대 4줄까지 가능해요.';if(s.squareLines.some(line=>!line))return '빈 줄을 채우거나 지워 주세요.';if(s.squareLines.some(line=>Array.from(line).length>8))return '각 줄은 8자 이내로 입력해 주세요.'}return ''}
 function valid(s){return !!s.text&&(s.type!=='business'||!!s.center)&&!squareError(s)}
 function buttons(){$('stamp-export').disabled=!ready||exporting||!valid(state())}
 function fontString(s,size){const [family,weight]=fonts[s.font];return weight+' '+size+'px '+(s.font==='system'?'serif':'"'+family+'", serif')}
 // One font size per text group; never stretch individual glyphs to fill a cell.
 function lettering(text,w,h,s){ctx.save();ctx.font=fontString(s,200);ctx.textAlign='left';ctx.textBaseline='alphabetic';const ms=clean(text).map(c=>ctx.measureText(c)),width=Math.max(1,...ms.map(m=>(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight??m.width))),up=Math.max(1,...ms.map(m=>m.actualBoundingBoxAscent??150)),down=Math.max(0,...ms.map(m=>m.actualBoundingBoxDescent??0)),scale=Math.min(w/width,h/(up+down));ctx.restore();return {font:fontString(s,200*scale),up:up*scale,down:down*scale}}
 function letter(text,x,y,w,h,s,style){if(!text)return;ctx.save();ctx.font=style.font;ctx.textAlign='left';ctx.textBaseline='alphabetic';const m=ctx.measureText(text),left=m.actualBoundingBoxLeft||0,right=m.actualBoundingBoxRight??m.width;ctx.fillText(text,x+(w-left-right)/2+left,y+(h-style.up-style.down)/2+style.up);ctx.restore()}
 // Latin names read left-to-right; fit complete words instead of rearranging letters.
 function latinName(s,x,y,w,h){
  const lines=(s.nameText||s.text).trim().split(/\s+/);if(s.suffix&&s.type==='personal')lines.push(s.suffix);
  ctx.save();ctx.font=fontString(s,200);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const ms=lines.map(line=>ctx.measureText(line)),inkWidth=Math.max(1,...ms.map(m=>(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight??m.width))),up=Math.max(1,...ms.map(m=>m.actualBoundingBoxAscent||150)),down=Math.max(0,...ms.map(m=>m.actualBoundingBoxDescent||0));
  const row=(up+down)*Math.max(1.02,1.2+s.spacing),total=(lines.length-1)*row+up+down,scale=Math.min(w/inkWidth,h/total)*Math.min(1,s.size);
  ctx.font=fontString(s,200*scale);const top=y+(h-total*scale)/2;
  lines.forEach((line,i)=>{const m=ctx.measureText(line),left=m.actualBoundingBoxLeft||0,right=m.actualBoundingBoxRight??m.width;ctx.fillText(line,x+(w-left-right)/2+left,top+(up+i*row)*scale)});ctx.restore();
 }
 function latinPersonal(s){return ['oval','personal'].includes(s.type)&&/^[A-Za-z .'-]+$/.test(s.nameText||s.text)}
 function ovalText(text,w,h,s){const a=clean(text),area=830,row=area/Math.max(1,a.length);let gh=(row-16)*.84*s.size,step=row*(1+s.spacing);const fit=Math.min(1,area/Math.max(1,(a.length-1)*step+gh));gh*=fit;step*=fit;const top=(h-((a.length-1)*step+gh))/2,ys=a.map((_,i)=>top+i*step),widths=ys.map(y=>{const edge=Math.max(Math.abs(y-h/2),Math.abs(y+gh-h/2));return 2*(w/2-100)*Math.sqrt(Math.max(.1,1-(edge/(h/2-90))**2))}),gw=Math.min(w*.7,...widths)*Math.min(.99,.84*s.size),style=lettering(text,gw,gh,s);// Center visible glyph bounds, not the font's shared ascent/descent box.
 ctx.save();ctx.font=style.font;ctx.textAlign='left';ctx.textBaseline='alphabetic';
 const metrics=a.map(c=>{const m=ctx.measureText(c);return {up:m.actualBoundingBoxAscent??style.up,down:m.actualBoundingBoxDescent??style.down}});ctx.restore();
 if(!a.length)return;
 const inkTop=Math.min(...metrics.map((m,i)=>ys[i]+(gh-m.up-m.down)/2)),inkBottom=Math.max(...metrics.map((m,i)=>ys[i]+(gh+m.up+m.down)/2));
 const offset=h/2-(inkTop+inkBottom)/2;
 a.forEach((c,i)=>letter(c,(w-gw)/2,ys[i]+offset,gw,gh,s,{...style,...metrics[i]}))}
 // Lay out independent letter boxes, then fit the whole group inside its safe area.
 function grid(text,x,y,w,h,s,size=s.size,spacing=s.spacing,horizontal=false){const a=clean(text),n=a.length;if(!n)return;const cols=horizontal?n:n<=3?1:Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/cols),cw=w/cols,ch=h/rows;let gw=cw*.84*size,gh=ch*.84*size,sx=cw*(1+spacing),sy=ch*(1+spacing);const bw=(cols-1)*sx+gw,bh=(rows-1)*sy+gh,fit=Math.min(1,w/bw,h/bh);gw*=fit;gh*=fit;sx*=fit;sy*=fit;const left=x+(w-((cols-1)*sx+gw))/2,top=y+(h-((rows-1)*sy+gh))/2,style=lettering(text,gw,gh,s);a.forEach((c,i)=>{const col=horizontal?i:cols-1-Math.floor(i/rows),row=horizontal?0:i%rows;letter(c,left+col*sx,top+row*sy,gw,gh,s,style)})}
 // Each input line is a horizontal row or a right-to-left vertical column.
 function squareText(s){
  const chars=clean(s.text),per=s.squareCount==='auto'?Math.ceil(Math.sqrt(chars.length)):Number(s.squareCount);
  const lines=s.squareMode==='manual'?s.squareLines.map(clean):Array.from({length:Math.ceil(chars.length/per)},(_,i)=>chars.slice(i*per,(i+1)*per));
  const vertical=s.squareDirection==='vertical',longest=Math.max(1,...lines.map(a=>a.length)),cols=vertical?lines.length:longest,rows=vertical?longest:lines.length;
  const w=976,h=976,cw=w/cols,ch=h/rows;let gw=cw*.84*s.size,gh=ch*.84*s.size,sx=cw*(1+s.spacing),sy=ch*(1+s.spacing);
  const fit=Math.min(1,w/((cols-1)*sx+gw),h/((rows-1)*sy+gh));gw*=fit;gh*=fit;sx*=fit;sy*=fit;
  const left=112+(w-((cols-1)*sx+gw))/2,top=112+(h-((rows-1)*sy+gh))/2,style=lettering(s.text,gw,gh,s);
  lines.forEach((line,i)=>line.forEach((c,j)=>{const col=vertical?cols-1-i:j+(longest-line.length)/2,row=vertical?j+(longest-line.length)/2:i;letter(c,left+col*sx,top+row*sy,gw,gh,s,style)}));
 }
 function updateSquareInputs(){
  const square=type==='square',manual=square&&value('stamp-square-mode')==='manual',vertical=value('stamp-square-direction')==='vertical';
  $('stamp-square-fields').hidden=!square;$('stamp-text-field').hidden=manual;$('stamp-text-hint').hidden=manual;
  $('stamp-square-manual-field').hidden=!manual;$('stamp-square-auto-field').hidden=manual;
  $('stamp-square-count-label').textContent=vertical?'한 열의 글자 수':'한 줄의 글자 수';$('stamp-square-lines-label').textContent=vertical?'열마다 새길 문구':'줄마다 새길 문구';
  $('stamp-square-hint').textContent=manual?(vertical?'엔터로 구분한 각 줄이 오른쪽부터 한 열씩 들어가요.':'엔터로 구분한 각 줄이 위에서부터 한 행씩 들어가요.')+' 최대 4줄, 한 줄 8자, 전체 16자까지 가능해요.':(vertical?'오른쪽 열부터 위아래로 채워요.':'위쪽 행부터 왼쪽에서 오른쪽으로 채워요.')+' 글자 수에 맞춰 나누거나 한 줄의 글자 수를 지정해 주세요.';
 }
 // Keep requested enlargement; only cap the ring at the actual canvas margin.
 function businessRing(s){
  const a=clean(s.text),radius=441,available=(Math.PI*2-.65)/Math.max(1,a.length),baseStep=available*.82,step=Math.min(available,baseStep*(1+s.spacing)),bw=Math.min(200,radius*baseStep*.86)*.84,bh=130*.84;
  const A=(bw*bw+bh*bh)/4,B=radius*bh,C=radius*radius-575*575,maxScale=(-B+Math.sqrt(B*B-4*A*C))/(2*A),scale=Math.min(s.size,maxScale),gw=bw*scale,gh=bh*scale,span=step*a.length,style=lettering(s.text,gw,gh,s);
  a.forEach((c,i)=>{const angle=-Math.PI/2+(Math.PI*2-span)/2+step*(i+.5);ctx.save();ctx.translate(600+radius*Math.cos(angle),600+radius*Math.sin(angle));ctx.rotate(angle+Math.PI/2);letter(c,-gw/2,-gh/2,gw,gh,s,style);ctx.restore()});
 }
 function businessCenter(s){
  const centerStyle={...s,font:s.centerFont==='same'?s.font:s.centerFont};
  ctx.save();ctx.translate(600,600);ctx.scale(s.centerSize,s.centerSize);ctx.translate(-600,-600);
  grid(s.center,390,390,420,420,centerStyle,1,s.centerSpacing,/^[A-Za-z]+$/.test(s.center));ctx.restore();
 }
 async function loadStampFonts(s){
  const groups=[{font:s.font,text:s.text+s.suffix}];
  if(s.type==='business')groups.push({font:s.centerFont==='same'?s.font:s.centerFont,text:s.center});
  for(const group of groups){if(group.font==='system')continue;let timer;try{const loaded=await Promise.race([document.fonts.load(fontString({font:group.font},200),group.text),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),15000)})]);if(!loaded.length)throw Error('font unavailable')}finally{clearTimeout(timer)}}
 }
 function mark(s){if(s.mark==='none')return;const r=13*s.markSize;ctx.save();ctx.translate(600,145);ctx.lineWidth=Math.max(3,r*.22);ctx.beginPath();if(s.mark==='dot'||s.mark==='ring'){ctx.arc(0,0,r,0,Math.PI*2)}else if(s.mark==='flower'){for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;ctx.moveTo(Math.cos(a)*r*.55+r*.5,Math.sin(a)*r*.55);ctx.arc(Math.cos(a)*r*.55,Math.sin(a)*r*.55,r*.5,0,Math.PI*2)}ctx.moveTo(r*.45,0);ctx.arc(0,0,r*.45,0,Math.PI*2)}else{const points=s.mark==='star'?10:s.mark==='triangle'?3:4;for(let i=0;i<points;i++){const a=-Math.PI/2+i*Math.PI*2/points,d=s.mark==='star'&&i%2?r*.43:r;i?ctx.lineTo(Math.cos(a)*d,Math.sin(a)*d):ctx.moveTo(Math.cos(a)*d,Math.sin(a)*d)}ctx.closePath()}s.mark==='ring'?ctx.stroke():ctx.fill();ctx.restore()}
 function ellipse(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke()}
 function inkTexture(level,w,h){if(!level)return;let seed=1789;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};ctx.save();ctx.globalCompositeOperation='destination-out';for(let i=0;i<(level===1?3600:9000)*w*h/1440000;i++){ctx.globalAlpha=.2+rand()*.65;ctx.beginPath();ctx.ellipse(rand()*w,rand()*h,.4+rand()*(level===1?1.5:2.6),.4+rand()*1.8,rand()*Math.PI,0,Math.PI*2);ctx.fill()}ctx.restore()}
 function draw(s){const wide=s.type==='wide',oval=s.type==='oval';canvas.width=oval?840:1200;canvas.height=wide?500:1200;const w=canvas.width,h=canvas.height;ctx.fillStyle=s.color;ctx.strokeStyle=s.color;ctx.lineWidth=s.weight;ctx.lineJoin='round';
 if(oval||s.type==='personal'||s.type==='business'){ellipse(w/2,h/2,w/2-50,h/2-50);if(s.border==='double'){ctx.lineWidth=7;ellipse(w/2,h/2,w/2-78,h/2-78)}}else{ctx.strokeRect(50,50,w-100,h-100);if(s.border==='double'){ctx.lineWidth=7;ctx.strokeRect(78,78,w-156,h-156)}}
 if(latinPersonal(s)){latinName(s,w*.22,h*.22,w*.56,h*.56)}
 else if(oval){ovalText(s.text,w,h,s)}
 else if(s.type==='personal'){grid(s.text+s.suffix,242,242,716,716,s)}
 else if(s.type==='square'){squareText(s)}
 else if(wide){grid(s.text,118,114,964,272,s,s.size,s.spacing,true)}
 else{ctx.lineWidth=Math.max(9,s.weight*.6);ellipse(600,600,345,345);businessRing(s);mark(s);businessCenter(s)}
 inkTexture(s.texture,w,h);canvas.setAttribute('aria-label',templates[s.type].label+' 미리보기');$('stamp-dimensions').textContent=templates[s.type].label+' · '+w.toLocaleString()+' × '+h.toLocaleString()+'px · 투명 PNG';
 }
 async function refresh(){const id=++ticket,s=state();$('stamp-text-hint').textContent=latinPersonal(s)?({ko:'영문 이름은 단어별로 가로 배치하며, 도장 안에 맞춰 크기를 조절해요.',en:'Latin names read left to right, one word per line, and fit inside the stamp.',ja:'英字の名前は単語ごとに横書きで配置し、印鑑の内側に収めます。','zh-CN':'英文姓名按单词分行横排，并自动缩放到印章内部。'}[exampleLocale]):(window.NoriI18n?.t(templates[type].hint)||templates[type].hint);updateSquareInputs();updateTuning();ready=false;out.clear();buttons();$('stamp-retry').hidden=true;$('stamp-status').textContent=squareError(s)||(valid(s)?'':'새길 문구'+(s.type==='business'?'와 가운데 문구':'')+'를 입력해 주세요.');$('stamp-font-status').textContent='선택한 글꼴을 불러오고 있어요…';try{await loadStampFonts(s);if(id!==ticket)return;if(valid(s))draw(s);else ctx.clearRect(0,0,canvas.width,canvas.height);ready=true;$('stamp-font-status').textContent=s.font==='system'&&s.type!=='business'?'기기의 기본 명조를 사용해요.':'글꼴 준비 완료 · 입력한 문구는 서버로 보내지 않아요.'}catch(e){if(id!==ticket)return;ctx.clearRect(0,0,canvas.width,canvas.height);$('stamp-font-status').textContent='글꼴을 불러오지 못했어요. 다시 시도하거나 기본 명조를 선택해 주세요.';$('stamp-retry').hidden=false}finally{if(id===ticket)buttons()}}
 document.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{drafts[type]=$('stamp-text').value;type=b.dataset.template;const t=templates[type];$('stamp-text').value=drafts[type]??t.text;$('stamp-text').maxLength=t.limit;$('stamp-text').placeholder=t.text;$('stamp-text-label').textContent=type==='business'?'회사·상호명':type==='square'||type==='wide'?'새길 문구':'이름';$('stamp-text-hint').textContent=t.hint;$('stamp-center-field').hidden=type!=='business';$('stamp-center-tuning').hidden=type!=='business';$('stamp-mark-tuning').hidden=type!=='business';$('stamp-size-label').textContent=type==='business'?'회사명 글자 크기':'글자 크기';$('stamp-spacing-label').textContent=type==='business'?'회사명 자간':'자간';$('stamp-suffix-field').hidden=type!=='personal';document.querySelectorAll('[data-template]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh()});
 document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{$('stamp-color').value=b.dataset.color;document.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refresh()});
 document.querySelector('.stamp-controls').addEventListener('compositionstart',()=>{composition=true;ticket++;ready=false;out.clear();buttons()});document.querySelector('.stamp-controls').addEventListener('compositionend',()=>{composition=false;refresh()});
 document.querySelector('.stamp-controls').addEventListener('input',e=>{if(e.target.id==='stamp-font-file')return;if(e.target.id==='stamp-text')editedExamples.add(type);if(['stamp-center','stamp-square-lines','stamp-suffix','stamp-square-direction'].includes(e.target.id))editedExamples.add(e.target.id);if(e.target.id==='stamp-color')document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===e.target.value)));if(!composition)refresh()});
 function updateTuning(){document.querySelectorAll('[data-font]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.font===value('stamp-font'))));['size','spacing','center-size','center-spacing','mark-size'].forEach(key=>{const el=$('stamp-'+key);$('stamp-'+key+'-value').textContent=(key.includes('spacing')&&Number(el.value)>0?'+':'')+el.value+'%'});$('stamp-mark-size').disabled=value('stamp-mark')==='none'}
 $('stamp-reset-tuning').onclick=()=>{['size','center-size','mark-size'].forEach(key=>$('stamp-'+key).value='100');['spacing','center-spacing'].forEach(key=>$('stamp-'+key).value='0');$('stamp-mark').value='dot';refresh()};
 function showFontGroup(group){
  document.querySelectorAll('[data-font-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fontGroup===group)));
  let count=0;document.querySelectorAll('[data-font]').forEach(b=>{b.hidden=group==='recommended'?b.dataset.recommended!=='true':b.dataset.fontCategory!==group;if(!b.hidden)count++});
  $('stamp-font-count').textContent=count+'종 미리보기 · 전체 21종';
 }
 document.querySelectorAll('[data-font-group]').forEach(b=>b.onclick=()=>showFontGroup(b.dataset.fontGroup));
 $('stamp-font').addEventListener('change',()=>{const card=Array.from(document.querySelectorAll('[data-font]')).find(b=>b.dataset.font===value('stamp-font'));if(card?.hidden)showFontGroup(card.dataset.fontCategory)});
 document.querySelectorAll('[data-font]').forEach(b=>b.onclick=()=>{$('stamp-font').value=b.dataset.font;refresh()});
 $('stamp-font-file').addEventListener('change',async()=>{
  const input=$('stamp-font-file'),file=input.files?.[0];if(!file)return;
  const status=$('stamp-file-status');
  if(!/\.(ttf|otf|woff2?)$/i.test(file.name)||file.size===0||file.size>10*1024*1024){status.textContent='10MB 이하의 TTF · OTF · WOFF · WOFF2 글꼴 파일을 선택해 주세요.';input.value='';return}
  const selection=ticket;input.disabled=true;$('stamp-font-remove').disabled=true;status.textContent='내 글꼴을 준비하고 있어요…';let timeout;
  try{
   const face=new FontFace('NoriLocalStamp'+(++localSerial),await file.arrayBuffer(),{weight:'400'});
   await Promise.race([face.load(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('timeout')),15000)})]);
   document.fonts.add(face);const old=localFace;localFace=face;fonts.custom=[face.family,400];
   const option=$('stamp-custom-option');option.hidden=false;option.disabled=false;option.textContent='내 글꼴 · '+file.name;
   if(ticket===selection)$('stamp-font').value='custom';
   if(old)document.fonts.delete(old);
   $('stamp-font-remove').hidden=false;status.textContent=file.name+' · 이 페이지에서만 사용해요.';refresh();
  }catch(e){status.textContent='이 파일을 글꼴로 읽지 못했어요. 다른 글꼴 파일을 선택해 주세요. 기존 글꼴은 그대로 유지해요.'}
  finally{clearTimeout(timeout);input.disabled=false;input.value='';$('stamp-font-remove').disabled=false}
 });
 $('stamp-font-remove').onclick=()=>{
  if(localFace)document.fonts.delete(localFace);localFace=null;delete fonts.custom;
  if(value('stamp-font')==='custom')$('stamp-font').value='song';
  const option=$('stamp-custom-option');option.hidden=true;option.disabled=true;option.textContent='내 글꼴';
  $('stamp-font-remove').hidden=true;$('stamp-file-status').textContent='내 글꼴을 지웠어요.';refresh();
 };
 $('stamp-retry').onclick=refresh;
 $('stamp-export').onclick=async()=>{if(!ready||!valid(state()))return;const id=ticket;exporting=true;buttons();try{const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('이미지를 만들지 못했어요. 다시 시도해 주세요.');if(id!==ticket)return;await out.prepare(blob,'nori-stamp-'+type+'.png');if(id!==ticket){out.clear();return}$('stamp-status').textContent='투명 PNG가 준비됐어요. PNG 저장을 눌러주세요.'}catch(e){$('stamp-status').textContent=e.message}finally{exporting=false;buttons()}};
 localizeExamples();
 document.addEventListener('nori:languagechange',()=>{localizeExamples();refresh()});
 document.fonts.addEventListener('loadingdone',fitSamples);
 document.fonts.ready.then(fitSamples);
 refresh();
})();
