'use strict';
window.NoriImage={
 async load(file){
  if(!file||!(/\.(png|jpe?g|webp)$/i.test(file.name)||/^image\/(png|jpeg|webp)$/.test(file.type)))throw Error('JPG·PNG·WebP 이미지를 선택해 주세요.');
  if(file.size>20*1024*1024)throw Error('파일 한 장은 20 MB 이하로 선택해 주세요.');
  const url=URL.createObjectURL(file),img=new Image();try{img.src=url;await img.decode();if(img.naturalWidth*img.naturalHeight>40000000)throw Error('4,000만 화소 이하의 사진을 선택해 주세요.');return img}catch(e){throw Error(e.message.includes('화소')?e.message:'이미지를 읽지 못했어요. 다른 파일을 선택해 주세요.')}finally{URL.revokeObjectURL(url)}
 },
 blob(canvas,type='image/png',quality=.85){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('이미지를 저장하지 못했어요. 크기를 줄여 다시 시도해 주세요.')),type,quality))},
 contain(ctx,img,x,y,w,h){const s=Math.min(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*s,ih=img.naturalHeight*s;ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih)},
 async data(file,max=1200){const img=await this.load(file),c=document.createElement('canvas');[c.width,c.height]=NoriCreative.dimensions(img.naturalWidth,img.naturalHeight,max);c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/png');c.width=c.height=1;return data},
 drop(zone,input,callback){zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragging')});zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');callback([...e.dataTransfer.files])});input.addEventListener('change',()=>{callback([...input.files]);input.value=''})}
};
