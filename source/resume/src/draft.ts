export type Row = { id:number; values:string[]; origin?:{kind:'education'|'career';values:string[]} };
export type Crop = {zoom:number;x:number;y:number;mode:'contain'|'cover'};
export type Draft = {format:'nori-resume';version:1;basic:Record<string,string>;military:Record<string,string>;visible:Record<string,boolean>;personalOptions:{sns:boolean;identity:'birth'|'resident'};historyMode:'separate'|'combined';photo:string;photoSource:string;crop:Crop;education:Row[];career:Row[];combined:Row[];skills:Row[]};
export const defaultCrop:Crop={zoom:1,x:0,y:0,mode:'contain'};
export function photoGeometry(width:number,height:number,c:Crop){
 const base=c.mode==='contain'?Math.min(450/width,600/height):Math.max(450/width,600/height);
 const w=width*base*c.zoom,h=height*base*c.zoom,rangeX=Math.abs(w-450)/2,rangeY=Math.abs(h-600)/2;
 return {w,h,rangeX,rangeY,left:(450-w)/2+c.x/100*rangeX,top:(600-h)/2+c.y/100*rangeY};
}
export const filled=(r:Row)=>r.values.some(v=>v.trim());
const basicKeys=['nameKr','nameEn','birth','resident','email','phone','sns','address'];
const militaryKeys=['branch','status','rank','place','period','veteran'];
export function parseDraft(text:string):Draft {
 if(text.length>32*1024*1024)throw Error('size');
 const d=JSON.parse(text); if(!d||d.format!=='nori-resume'||d.version!==1)throw Error('format');
 const strings=(v:any,keys:string[])=>Object.fromEntries(keys.map(k=>{if(typeof v?.[k]!=='string'||v[k].length>20000)throw Error('field');return[k,v[k]];}));
 let nextId=1;
 const rows=(v:any,n:number):Row[]=>{if(!Array.isArray(v)||v.length<1||v.length>500)throw Error('rows');return v.map(r=>{
  if(!Array.isArray(r?.values)||r.values.length!==n||r.values.some((s:any)=>typeof s!=='string'||s.length>20000))throw Error('row');
  const out:Row={id:nextId++,values:[...r.values]};
  if(r.origin){const o=r.origin;if(!['education','career'].includes(o.kind)||!Array.isArray(o.values)||o.values.length!==(o.kind==='education'?3:5)||o.values.some((s:any)=>typeof s!=='string'||s.length>20000))throw Error('origin');out.origin={kind:o.kind,values:[...o.values]};}
  return out;
 });};
 const picture=(s:any)=>{if(typeof s!=='string'||s.length>15*1024*1024||(s&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(s)))throw Error('photo');return s;};
 const crop=d.crop;if(!crop||![crop.zoom,crop.x,crop.y].every(Number.isFinite)||crop.zoom<0.1||crop.zoom>3||Math.abs(crop.x)>100||Math.abs(crop.y)>100)throw Error('crop');
 if(crop.mode!==undefined&&!['contain','cover'].includes(crop.mode))throw Error('mode');
 if(!['separate','combined'].includes(d.historyMode)||!['birth','resident'].includes(d.personalOptions?.identity)||typeof d.personalOptions?.sns!=='boolean')throw Error('options');
 const visible=Object.fromEntries(['military','education','career','skills'].map(k=>{if(typeof d.visible?.[k]!=='boolean')throw Error('visible');return[k,d.visible[k]];}));
 return {format:'nori-resume',version:1,basic:strings(d.basic,basicKeys),military:strings(d.military,militaryKeys),visible,personalOptions:{sns:d.personalOptions.sns,identity:d.personalOptions.identity},historyMode:d.historyMode,photo:picture(d.photo),photoSource:picture(d.photoSource),crop:{zoom:crop.zoom,x:crop.x,y:crop.y,mode:crop.mode??'cover'},education:rows(d.education,3),career:rows(d.career,5),combined:rows(d.combined,3),skills:rows(d.skills,3)};
}
export function combineRows(education:Row[],career:Row[]):Row[]{
 return [...education.filter(filled).map(r=>({id:r.id,values:[r.values[0],r.values[2],r.values[1]],origin:{kind:'education' as const,values:[...r.values]}})),...career.filter(filled).map(r=>({id:r.id,values:[r.values[0],r.values.slice(2).filter(Boolean).join(' · '),r.values[1]],origin:{kind:'career' as const,values:[...r.values]}}))];
}
export function separateRows(rows:Row[],kinds:Record<number,'education'|'career'>){
 const education:Row[]=[],career:Row[]=[];
 rows.filter(filled).forEach(r=>{const kind=kinds[r.id]||r.origin?.kind||'career';
  if(kind==='education')education.push({id:r.id,values:[r.values[0],r.values[2],r.values[1]]});
  else {const old=r.origin?.kind==='career'?r.origin.values:null;const unchanged=old&&r.values[1]===old.slice(2).filter(Boolean).join(' · ');career.push({id:r.id,values:[r.values[0],r.values[2],...(unchanged?old!.slice(2):[r.values[1],'',''])]});}
 });return{education,career};
}
