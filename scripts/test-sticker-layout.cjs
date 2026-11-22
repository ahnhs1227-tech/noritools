// Run with node scripts/test-sticker-layout.cjs; no browser or npm dependencies.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const calc=require('../assets/nori/calculations.js');
const script=fs.readFileSync(path.join(__dirname,'../assets/nori/sticker.js'),'utf8');
const input={width:40,height:60,quantity:57,paperWidth:210,paperHeight:297,margin:10,gap:3,rotate:true};
const {sticker,stickerPositions}=calc;
const approx=(a,b)=>Math.abs(a-b)<1e-7;
const main=sticker(input);
assert.deepEqual([main.count,main.pages,main.axis],[19,3,'row']);
const uniform=sticker({...input,rotate:false});
assert.deepEqual([uniform.count,uniform.pages,uniform.rotated,uniform.axis],[16,4,false,undefined]);
const turnedOnly=sticker({...input,paperWidth:70,paperHeight:55,margin:0});
assert.deepEqual([turnedOnly.count,turnedOnly.rotated,turnedOnly.axis],[1,true,undefined]);
const facingColumns=sticker({...input,paperWidth:297,paperHeight:210});
assert.deepEqual([facingColumns.count,facingColumns.pages,facingColumns.axis],[19,3,'column']);
assert.equal(sticker({...input,paperWidth:30,paperHeight:30}).count,0);
assert.equal(sticker({...input,width:40,height:40}).axis,undefined);
// The most original columns can still leave enough width for one narrow turned column.
const leftoverColumn={width:184.4,height:47.7,paperWidth:534.8,paperHeight:229.6,margin:3.3,gap:38.8,quantity:6146,rotate:true};
assert.deepEqual([sticker(leftoverColumn).count,sticker(leftoverColumn).axis],[7,'column']);
const fits=(available,size,gap)=>Math.max(0,Math.floor((available+gap)/(size+gap)+1e-9));
function checkGeometry(r){
 const layout=sticker(r);
 const positions=[...stickerPositions(r,layout)];
 assert.equal(positions.length,layout.count);
 assert.equal([...stickerPositions(r,layout,3)].length,Math.min(layout.count,3));
 const w=r.paperWidth-2*r.margin,h=r.paperHeight-2*r.margin;
 const plain=fits(w,r.width,r.gap)*fits(h,r.height,r.gap);
 const turned=fits(w,r.height,r.gap)*fits(h,r.width,r.gap);
 assert(layout.count>=(r.rotate?Math.max(plain,turned):plain));
 for(let i=0;i<positions.length;i++){
  const p=positions[i];
  assert(p.x>=r.margin-1e-7&&p.y>=r.margin-1e-7);
  assert(p.x+p.width<=r.paperWidth-r.margin+1e-7&&p.y+p.height<=r.paperHeight-r.margin+1e-7);
  assert.deepEqual([p.width,p.height],p.rotated?[r.height,r.width]:[r.width,r.height]);
  if(!r.rotate)assert.equal(p.rotated,false);
  for(let j=i+1;j<positions.length;j++){
   const q=positions[j];
   assert(
    p.x+p.width+r.gap<=q.x+1e-7||q.x+q.width+r.gap<=p.x+1e-7||
    p.y+p.height+r.gap<=q.y+1e-7||q.y+q.height+r.gap<=p.y+1e-7,'Sticker boxes overlap or violate the gap');
  }
 }
}
for(const r of [input,{...input,paperWidth:297,paperHeight:210},{...input,rotate:false},leftoverColumn])checkGeometry(r);
for(const paperWidth of [89,148,215.9])for(const paperHeight of [103,174,279.4])
 for(const width of [25,31.4,40,53])for(const height of [29.1,42,60])
  for(const gap of [0,3,4.2])checkGeometry({...input,paperWidth,paperHeight,width,height,gap});
for(const locale of ['','en/','ja/','zh-CN/']){
 const html=fs.readFileSync(path.join(__dirname,'../'+locale+'tools/sticker-layout/index.html'),'utf8');
 assert.match(html,/<input id="sticker-guides" type="checkbox" checked aria-describedby="sticker-guides-help">/);
 assert.match(html,/calculations\.js\?v=20261122-sticker/);
 assert.match(html,/sticker\.js\?v=20261122-sticker/);
 assert.match(html,/messages\.js\?v=20261122-sticker/);
}
const art='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
function setup(transfer){
 const defaults={'sticker-width':'40','sticker-height':'60','sticker-quantity':'57','paper-width':'210','paper-height':'297','sticker-margin':'10','sticker-gap':'3','sticker-page':'1'};
 const el=new Map();
 function $(id){if(!el.has(id))el.set(id,{value:defaults[id]||'',checked:id==='sticker-guides'||id==='sticker-rotate',hidden:false,listeners:{},addEventListener(event,fn){this.listeners[event]=fn},removeAttribute(name){delete this[name]}});return el.get(id)}
 let exported,printed;
 const browser={
  Nori:{$,fmt:String,error:()=>{},download:(blob)=>{exported=blob}},
  NoriCalc:calc, Blob,
  NoriImage:{data:async()=>art},
  Image:class {constructor(){this.naturalWidth=40;this.naturalHeight=60;} async decode(){}},
  sessionStorage:{getItem:()=>transfer?JSON.stringify({data:art}):null,removeItem:()=>{}},
  window:{open(){return {document:{open(){},write(html){printed=html},close(){}}}}}
 };
 vm.runInNewContext(script,browser);
 return {$,get exported(){return exported},get printed(){return printed}};
}
const toggle=($,checked)=>{const node=$('sticker-guides');node.checked=checked;node.onchange()};
const read=(s,re)=>[...s.matchAll(re)];
const guides=s=>read(s,/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g).map(m=>m.slice(1).map(Number));
const uses=s=>read(s,/<use href="#([^"]+)" transform="translate\(([^ ]+) ([^)]+)\)( rotate\(90\))?"/g).map(m=>({id:m[1],tx:Number(m[2]),y:Number(m[3]),rotated:Boolean(m[4])}));
const id=s=>s.match(/<image id="([^"]+)"/)?.[1];
const sections=s=>read(s,/<section class="sheet">(.+?)<\/section>/g).map(m=>m[1]);
const expected=[...stickerPositions(input,main)];
function view(s,count,{showGuides,artwork}){
 assert.match(s,/width="210mm" height="297mm" viewBox="0 0 210 297"/);
 const rects=guides(s),items=uses(s);
 assert.equal(rects.length,showGuides?count:0);
 assert.equal(items.length,artwork?count:0);
 if(showGuides)rects.forEach(([x,y,w,h],i)=>{
  const p=expected[i];assert(approx(x,p.x)&&approx(y,p.y)&&approx(w,p.width)&&approx(h,p.height));
 });
 if(artwork)items.forEach(({id:ref,tx,y,rotated},i)=>{
  const p=expected[i];assert.equal(ref,id(s));assert.equal(rotated,p.rotated);
  assert(approx(tx,p.x+(p.rotated?p.width:0))&&approx(y,p.y));
 });
}
async function run(){
 const c=setup(),{$}=c;
 const preview=()=>$('sticker-preview').innerHTML;
 const save=async()=>{$('sticker-svg').onclick();return c.exported.text()};
 const print=()=>{$('sticker-print').onclick();return sections(c.printed)};
 assert.deepEqual(['sticker-per-page','sticker-pages','sticker-last'].map(k=>$(k).textContent),['19개','3장','19개']);
 view(preview(),19,{showGuides:true,artwork:false});
 view(await save(),19,{showGuides:true,artwork:false});
 toggle($,false);
 view(preview(),19,{showGuides:false,artwork:false});
 view(await save(),19,{showGuides:false,artwork:false});
 assert.equal(print().length,3);
 print().forEach(s=>view(s,19,{showGuides:false,artwork:false}));
 toggle($,true);
 print().forEach(s=>view(s,19,{showGuides:true,artwork:false}));

 const withArt=setup(true),a=withArt.$;
 // Session transfer follows the image decoder microtask before it updates the controls.
 await new Promise(setImmediate);
 const artPreview=()=>a('sticker-preview').innerHTML;
 const artSave=async()=>{a('sticker-svg').onclick();return withArt.exported.text()};
 const artPrint=()=>{a('sticker-print').onclick();return sections(withArt.printed)};
 assert.equal(a('sticker-guides').checked,false,'Artwork starts without guides');
 view(artPreview(),19,{showGuides:false,artwork:true});
 view(await artSave(),19,{showGuides:false,artwork:true});
 const p=artPrint();
 assert.equal(p.length,3);
 assert.equal(new Set(p.map(id)).size,3,'Print sheets have independent SVG artwork IDs');
 p.forEach(s=>view(s,19,{showGuides:false,artwork:true}));
 toggle(a,true);
 view(artPreview(),19,{showGuides:true,artwork:true});
 view(await artSave(),19,{showGuides:true,artwork:true});
 const printed=artPrint();
 printed.forEach(s=>view(s,19,{showGuides:true,artwork:true}));
 assert.match(printed[0],/stroke="#777" stroke-width="0.15"/);
 assert.match(artPreview(),/stroke="#8b9b67" stroke-width="0.15"/);
 a('sticker-quantity').value='41';
 a('sticker-quantity').listeners.input();
 a('sticker-page').value='3';
 a('sticker-page').onchange();
 view(artPreview(),3,{showGuides:true,artwork:true});
 view(await artSave(),3,{showGuides:true,artwork:true});
 assert.deepEqual(artPrint().map(s=>uses(s).length),[19,19,3]);
 a('sticker-art-remove').onclick();
 assert.equal(a('sticker-guides').checked,true,'A manual guide choice survives removing artwork');
 view(artPreview(),3,{showGuides:true,artwork:false});

 const removed=setup(true);
 await new Promise(setImmediate);
 removed.$('sticker-art-remove').onclick();
 assert.equal(removed.$('sticker-guides').checked,true,'Removing artwork restores untouched blank default');
 const selected=setup();
 const file=selected.$('sticker-art-file');
 file.files=[{}];
 await file.onchange();
 assert.equal(selected.$('sticker-guides').checked,false,'An uploaded image also starts without guides');
 view(selected.$('sticker-preview').innerHTML,19,{showGuides:false,artwork:true});
 console.log('Sticker layout: mixed rows/columns, 328 geometry cases, all locales, artwork transforms, SVG and print guides passed.');
}
run().catch(error=>{console.error(error);process.exitCode=1});
