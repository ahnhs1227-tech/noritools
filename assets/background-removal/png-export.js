/* PNG export: keep real file metadata for native mobile save/share targets. */
'use strict';
window.NoriPngExport = class {
  constructor({download,help,dialog,preview,direct,share,close,note,status}) {
    Object.assign(this,{download,help,dialog,preview,direct,share,close,note,status});
    this.file=null;this.url=null;this.revision=0;this.sharing=false;
    download.addEventListener('click',e=>{
      if(!this.file){e.preventDefault();return;}
      if(this.mobile()){e.preventDefault();this.saveMobile();}
    });
    help.addEventListener('click',()=>this.open());
    share.addEventListener('click',()=>this.saveMobile());
    close.addEventListener('click',()=>dialog.close());
  }
  embedded(){return /KAKAOTALK/i.test(navigator.userAgent);}
  mobile(){return /Android|iPhone|iPad|iPod|KAKAOTALK/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/i.test(navigator.userAgent));}
  canShare(){try{return !!(this.file&&navigator.share&&navigator.canShare&&navigator.canShare({files:[this.file]}));}catch{return false;}}
  clear(){
    this.revision++;if(this.dialog.open)this.dialog.close();
    if(this.url)URL.revokeObjectURL(this.url);this.url=null;this.file=null;
    this.preview.removeAttribute('src');this.direct.removeAttribute('href');
    this.download.removeAttribute('href');this.download.hidden=true;this.help.hidden=true;
  }
  async prepare(blob){
    this.clear();const revision=this.revision;
    const signature=new Uint8Array(await blob.slice(0,8).arrayBuffer());
    if(signature.join(',')!=='137,80,78,71,13,10,26,10')throw new Error('PNG 파일을 만들지 못했어요. 다시 시도해 주세요.');
    const file=new File([blob],'nori-background-removed.png',{type:'image/png'});
    const dataURL=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('저장용 이미지를 준비하지 못했어요. 다시 시도해 주세요.'));reader.readAsDataURL(file);});
    if(revision!==this.revision)return false;
    this.file=file;this.url=URL.createObjectURL(file);
    this.download.href=this.url;this.download.download=file.name;this.download.type='image/png';
    this.download.textContent=this.mobile()?'투명 PNG 저장 ↓':'투명 PNG 다운로드 ↓';
    // A data URL also gives embedded browsers a PNG image to long-press/save,
    // without navigating to a temporary blob URL or relying on its filename.
    this.preview.src=dataURL;this.direct.href=dataURL;this.direct.download=file.name;this.direct.type='image/png';
    this.direct.hidden=this.embedded();this.share.hidden=this.embedded()||!this.canShare();this.download.hidden=false;this.help.hidden=false;return true;
  }
  open(message){
    if(!this.file)return;
    this.note.textContent=message||(this.embedded()?'카카오톡 안에서는 PNG 파일 저장이 제한될 수 있어요. 아래 이미지를 길게 눌러 저장해 보세요. 같은 오류가 나면 Chrome에서 이 페이지를 열고 이미지를 다시 선택해 주세요.':'아래 이미지를 길게 눌러 저장하거나 PNG 파일 다운로드를 눌러주세요. 휴대폰 저장 메뉴에서는 ‘이미지 저장’ 또는 ‘파일에 저장’을 선택할 수 있어요. 메뉴 이름은 기기에 따라 달라요.');
    this.share.hidden=this.embedded()||!this.canShare();if(!this.dialog.open)this.dialog.showModal();
  }
  async saveMobile(){
    if(!this.file||this.sharing)return;
    if(this.embedded()||!this.canShare()){this.open();return;}
    this.sharing=true;this.share.disabled=true;const revision=this.revision;
    try{
      // Called directly during the click, with a prepared File; no async read
      // before navigator.share, which would lose iOS user activation.
      await navigator.share({files:[this.file]});
      if(revision===this.revision)this.status('저장 메뉴를 닫았어요. 선택한 앱이나 파일 위치에서 PNG를 확인해 주세요.');
    }catch(e){
      if(revision!==this.revision)return;
      if(e.name==='AbortError')this.status('저장을 취소했어요. 결과는 그대로 있으니 다시 저장할 수 있어요.');
      else this.open('이 브라우저에서 저장 메뉴를 열지 못했어요. 아래 이미지를 길게 눌러 저장해 주세요. 앱 안의 브라우저라면 Safari 또는 Chrome에서 이 페이지를 열고 다시 처리해 주세요.');
    }finally{this.sharing=false;this.share.disabled=false;}
  }
};
