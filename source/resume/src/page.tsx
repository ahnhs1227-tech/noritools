'use client';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { t } from './translate';

type Row = { id:number; values:string[] };
type SectionKey = 'military'|'education'|'career'|'skills';
const sectionNames:Record<SectionKey,string>={military:'병역 및 보훈사항',education:'학력사항',career:'경력사항',skills:'개인능력'};
const makeRow=(id:number,count:number):Row=>({id,values:Array(count).fill('')});

export default function Home(){
  const [locale,setLocale]=useState(document.documentElement.lang);
  useEffect(()=>{const change=()=>setLocale(document.documentElement.lang);document.addEventListener('nori:languagechange',change);return ()=>document.removeEventListener('nori:languagechange',change)},[]);
  useEffect(()=>{document.title=t('노리 이력서')+' · NORI Tools'},[locale]);
  const ids=useRef(20);
  const [photo,setPhoto]=useState('');
  const [historyMode,setHistoryMode]=useState<'separate'|'combined'>('separate');
  const [personalOptions,setPersonalOptions]=useState<{sns:boolean;identity:'birth'|'resident'}>({sns:true,identity:'birth'});
  const [visible,setVisible]=useState<Record<SectionKey,boolean>>({military:true,education:true,career:true,skills:true});
  const [basic,setBasic]=useState({nameKr:'',nameEn:'',birth:'',resident:'',email:'',phone:'',sns:'',address:''});
  const [military,setMilitary]=useState({branch:'',status:'',rank:'',place:'',period:'',veteran:''});
  const [education,setEducation]=useState<Row[]>([makeRow(1,3),makeRow(2,3)]);
  const [career,setCareer]=useState<Row[]>([makeRow(3,5),makeRow(4,5)]);
  const [combined,setCombined]=useState<Row[]>([makeRow(7,3),makeRow(8,3)]);
  const [skills,setSkills]=useState<Row[]>([makeRow(5,3),makeRow(6,3)]);
  const [photoError,setPhotoError]=useState('');
  const leaving=useRef(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const [confirmation,setConfirmation]=useState<{message:string;action:()=>void}|null>(null);
  useEffect(()=>{if(confirmation)dialog.current?.showModal();else dialog.current?.close();},[confirmation]);
  const ask=(message:string,action:()=>void)=>setConfirmation({message,action});
  const hasDraft=!!photo || [...Object.values(basic),...Object.values(military)].some(v=>v.trim()) || [education,career,combined,skills].some(rows=>rows.length!==2 || rows.some(r=>r.values.some(v=>v.trim()))) || historyMode!=='separate' || !personalOptions.sns || personalOptions.identity!=='birth' || Object.values(visible).some(v=>!v);
  useEffect(()=>{
    if(!hasDraft)return;
    const protect=(e:BeforeUnloadEvent)=>{if(!leaving.current){e.preventDefault();e.returnValue='';}};
    window.addEventListener('beforeunload',protect);
    return ()=>window.removeEventListener('beforeunload',protect);
  },[hasDraft]);
  const leaveHome=(e:React.MouseEvent<HTMLAnchorElement>)=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
    if(hasDraft){e.preventDefault();const href=e.currentTarget.href;ask('작성한 내용은 자동 저장되지 않아요. 이력서를 나가시겠어요?',()=>{leaving.current=true;location.href=href;});return;}
    leaving.current=true;
  };
  const startOver=()=>{const reset=()=>{leaving.current=true;location.reload();};if(hasDraft)ask('작성 중인 내용을 지우고 새로 시작할까요?',reset);else reset();};
  const upload=(e:ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;e.target.value='';if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024){setPhotoError('10MB 이하의 JPG·PNG·WebP 사진을 선택해 주세요.');return}const r=new FileReader();r.onerror=()=>setPhotoError('사진을 읽지 못했어요. 다른 파일을 선택해 주세요.');r.onload=()=>{const src=String(r.result),img=new Image();img.onload=()=>{setPhoto(src);setPhotoError('')};img.onerror=()=>setPhotoError('사진을 읽지 못했어요. 다른 파일을 선택해 주세요.');img.src=src};r.readAsDataURL(f)};
  const setB=(k:keyof typeof basic,v:string)=>setBasic(p=>({...p,[k]:v}));
  const setM=(k:keyof typeof military,v:string)=>setMilitary(p=>({...p,[k]:v}));
  const changeRow=(setter:React.Dispatch<React.SetStateAction<Row[]>>,id:number,index:number,v:string)=>setter(p=>p.map(r=>r.id===id?{...r,values:r.values.map((x,i)=>i===index?v:x)}:r));
  const addRow=(setter:React.Dispatch<React.SetStateAction<Row[]>>,count:number)=>setter(p=>[...p,makeRow(ids.current++,count)]);
  const delRow=(setter:React.Dispatch<React.SetStateAction<Row[]>>,id:number,rows:Row[])=>{const remove=()=>setter(p=>p.length>1?p.filter(r=>r.id!==id):p);if(rows.find(r=>r.id===id)?.values.some(v=>v.trim()))ask('이 행에 입력한 내용을 지울까요?',remove);else remove();};

  return <main translate="no"><header className="topbar"><div className="brand"><a className="brand-mark" href="/noritools/" onClick={leaveHome} aria-label={t("노리툴즈 홈으로")}>N<span>.</span></a><div><strong>{t('노리 이력서')}</strong><small>{t('필요한 항목만 담는 국문 이력서')}</small></div></div><div className="top-actions"><a className="home-link" href="/noritools/" onClick={leaveHome}>{t('도구 모음')}</a><button className="ghost" onClick={startOver}>{t('새로 작성')}</button><button className="print-button" onClick={()=>window.print()}>{t('인쇄 · PDF 저장')}</button></div></header>
  <section className="resume-intro"><div className="resume-intro-copy"><span className="resume-eyebrow">NORI / YOUR NEXT CHAPTER</span><h1>{t('노리 이력서')}</h1><p>{t('새로운 시작, 노리와 차근차근 준비해요.')}</p><div className="resume-badges"><span>{t('가입 없이 무료')}</span><span>{t('사진·정보는 기기 안에서만')}</span><span>{t('A4 인쇄 · PDF 저장')}</span></div><small>{t('국문 이력서 양식입니다. 입력한 내용은 자동 저장되지 않으니, 페이지를 닫기 전에 인쇄하거나 PDF로 저장해 주세요.')}</small></div><div className="resume-mascot"><img src="/noritools/assets/nori/characters/nori-resume.webp" alt={t('서류와 가방을 든 취업 준비 노리')} width="240" height="260"/></div></section>
  <nav className="resume-jump" aria-label={t('작성과 미리보기 이동')}><a href="#resume-editor">{t('작성하기')}</a><a href="#resume-preview">{t('미리보기로 이동')} ↓</a></nav><div className="workspace"><section className="editor" id="resume-editor" tabIndex={-1}>
    <div className="editor-heading"><div><span>RESUME EDITOR</span><h2>{t('나에게 맞는 이력서')}</h2></div><p>{t('필요한 항목만 선택해 작성하세요.')}</p></div>
    <div className="category-picker"><div><b>{t('표시할 카테고리')}</b><small>{t('스위치를 끄면 입력란과 출력물에서 함께 숨겨집니다.')}</small></div><div className="history-mode"><span>{t('학력·경력 작성 방식')}</span><button className={historyMode==='separate'?'active':''} onClick={()=>setHistoryMode('separate')}>{t('분리 작성')}</button><button className={historyMode==='combined'?'active':''} onClick={()=>setHistoryMode('combined')}>{t('통합 작성')}</button></div><div className="switches">{(Object.keys(sectionNames) as SectionKey[]).filter(k=>historyMode==='separate'||k!=='career').map(k=><label className="switch" key={k}><input type="checkbox" checked={visible[k]} onChange={()=>setVisible(p=>({...p,[k]:!p[k]}))}/><span/><b>{t(historyMode==='combined'&&k==='education'?'학력 및 경력사항':sectionNames[k])}</b></label>)}</div></div>

    <div className="form-card"><div className="section-title"><span>01</span><div><h2>{t('인적사항')}</h2><p>{t('사진과 연락처를 입력해 주세요.')}</p></div></div>
      <label className="photo-upload"><span className="photo-thumb">{photo?<img src={photo} alt="증명사진"/>:t('사진')}</span><span><strong>{t(photo?'사진 변경':'증명사진 업로드')}</strong><small>{t('JPG·PNG·WebP, 최대 10MB · 세로형 권장')}</small></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload}/></label>{photoError&&<p className="photo-error" role="alert">{t(photoError)}</p>}{photo&&<button className="photo-remove" onClick={()=>setPhoto('')}>{t('사진 지우기')}</button>}
      <div className="personal-option-bar"><span>{t('선택 정보')}</span><div className="identity-choice"><button className={personalOptions.identity==='birth'?'active':''} onClick={()=>setPersonalOptions(p=>({...p,identity:'birth'}))}>{t('생년월일')}</button><button className={personalOptions.identity==='resident'?'active':''} onClick={()=>setPersonalOptions(p=>({...p,identity:'resident'}))}>{t('주민등록번호')}</button></div><label><input type="checkbox" checked={personalOptions.sns} onChange={()=>setPersonalOptions(p=>({...p,sns:!p.sns}))}/><i/>{t('SNS 표시')}</label></div>
      <div className="form-grid">{[['nameKr','성명 (한글)','김노리'],['nameEn','성명 (영문)','Nori Kim'],['email','E-mail','hong@example.com'],['phone','전화번호','010-1234-5678']].map(([k,l,p])=><label key={k}><span>{t(l)}</span><input value={basic[k as keyof typeof basic]} onChange={e=>setB(k as keyof typeof basic,e.target.value)} placeholder={p}/></label>)}{personalOptions.identity==='birth'?<label><span>{t('생년월일')}</span><input type="date" value={basic.birth} onChange={e=>setB('birth',e.target.value)}/></label>:<label><span>{t('주민등록번호')}</span><input value={basic.resident} onChange={e=>setB('resident',e.target.value)} placeholder="000000-0000000" inputMode="numeric" autoComplete="off"/></label>}{personalOptions.sns&&<label><span>SNS</span><input value={basic.sns} onChange={e=>setB('sns',e.target.value)} placeholder="linkedin.com/in/hong"/></label>}<label className="wide"><span>{t('주소')}</span><input value={basic.address} onChange={e=>setB('address',e.target.value)} placeholder="서울특별시 강남구 역삼동 123번지"/></label></div>
    </div>

    {visible.military&&<div className="form-card"><EditorTitle n="02" title="병역 및 보훈사항"/><div className="form-grid">{([['branch','군별','육군'],['status','병역','만기 전역'],['rank','계급','병장'],['place','복무장소','청주'],['period','복무기간','2025. 03. 01 ~ 2027. 03. 01'],['veteran','보훈대상','비대상']] as const).map(([k,l,p])=><label key={k}><span>{t(l)}</span><input value={military[k]} onChange={e=>setM(k,e.target.value)} placeholder={p}/></label>)}</div></div>}
    {historyMode==='combined'&&visible.education&&<RowsEditor n="03" title="학력 및 경력사항" labels={['년/월/일','학력·경력 내용','기관·발령청']} rows={combined} setter={setCombined} changeRow={changeRow} add={()=>addRow(setCombined,3)} del={id=>delRow(setCombined,id,combined)}/>} 
    {historyMode==='separate'&&visible.education&&<RowsEditor n="03" title="학력사항" labels={['년/월/일','학교명','학과']} rows={education} setter={setEducation} changeRow={changeRow} add={()=>addRow(setEducation,3)} del={id=>delRow(setEducation,id,education)}/>} 
    {historyMode==='separate'&&visible.career&&<RowsEditor n="04" title="경력사항" labels={['기간','회사명','직무','부서','직위/직급']} rows={career} setter={setCareer} changeRow={changeRow} add={()=>addRow(setCareer,5)} del={id=>delRow(setCareer,id,career)}/>} 
    {visible.skills&&<RowsEditor n="05" title="개인능력" labels={['구분','항목','수준·점수']} rows={skills} setter={setSkills} changeRow={changeRow} add={()=>addRow(setSkills,3)} del={id=>delRow(setSkills,id,skills)}/>} 
    <div className="privacy-note"><span>✓</span><p><strong>{t('입력한 개인정보와 사진은 이 브라우저 안에서만 처리됩니다.')}</strong></p></div>
  </section>

  <aside className="preview-pane" id="resume-preview" tabIndex={-1}><div className="preview-label"><div><span className="live-dot"/>{t('실시간 미리보기')}</div><small>A4 · 210 × 297 mm</small></div><div className="paper-wrap"><article className="modern-paper">
    <h2>이 력 서</h2><PaperTitle title="인적사항"/><div className="personal-table"><div className="modern-photo">{photo?<img src={photo} alt="증명사진"/>:<span>사 진</span>}</div><div className="personal-info"><PRow label="성 명" value={basic.nameKr} label2="한 글"/><PRow label="" value={basic.nameEn} label2="영 문"/>{personalOptions.identity==='birth'?<PRow label="생년월일" value={basic.birth}/>:<PRow label="주민등록번호" value={basic.resident}/>}<PRow label="E-mail" value={basic.email}/>{personalOptions.sns?<PRow label="전화번호" value={basic.phone} labelB="SNS" valueB={basic.sns}/>:<PRow label="전화번호" value={basic.phone}/>}<PRow label="주 소" value={basic.address}/></div></div>
    {visible.military&&<><PaperTitle title="병역 및 보훈사항"/><div className="military-grid"><PBox l="군 별" v={military.branch}/><PBox l="병 역" v={military.status}/><PBox l="계 급" v={military.rank}/><PBox l="복무장소" v={military.place}/><PBox l="복무기간" v={military.period}/><PBox l="보훈대상" v={military.veteran}/></div></>}
    {historyMode==='combined'&&visible.education&&<PaperTable title="학력 및 경력사항" headers={['년/월/일','학 력 및 경 력 사 항','기관·발령청']} rows={combined}/>} 
    {historyMode==='separate'&&visible.education&&<PaperTable title="학력사항" headers={['년/월/일','학 교 명','학 과']} rows={education}/>} 
    {historyMode==='separate'&&visible.career&&<PaperTable title="경력사항" headers={['기간','회 사 명','직무','부서','직위/직급']} rows={career}/>} 
    {visible.skills&&<PaperTable title="개인능력" headers={['구분','항목','수준·점수']} rows={skills}/>} 
    <footer className="resume-watermark">이 이력서는 노리툴즈에서 무료로 제작하였습니다</footer>
  </article></div><p className="print-hint">{t('활성화한 카테고리만 인쇄되며, 인쇄 창에서 PDF로 저장할 수 있습니다.')}<br/>{t('용지는 A4, 배율은 100%로 선택하고 머리글·바닥글을 끄면 깔끔하게 저장돼요.')}<a className="back-to-editor" href="#resume-editor">↑ {t('작성 화면으로 돌아가기')}</a></p></aside></div><dialog className="resume-confirm" ref={dialog} aria-labelledby="resume-confirm-title" onCancel={e=>{e.preventDefault();setConfirmation(null);}}><h2 id="resume-confirm-title">{t('잠깐 확인해 주세요')}</h2><p>{confirmation&&t(confirmation.message)}</p><div><button autoFocus onClick={()=>setConfirmation(null)}>{t('취소')}</button><button className="confirm-action" onClick={()=>{const action=confirmation?.action;setConfirmation(null);action?.();}}>{t('확인')}</button></div></dialog></main>
}

function EditorTitle({n,title}:{n:string,title:string}){return <div className="section-title"><span>{n}</span><div><h2>{t(title)}</h2><p>{t('표에 표시할 내용을 입력해 주세요.')}</p></div></div>}
function RowsEditor({n,title,labels,rows,setter,changeRow,add,del}:{n:string;title:string;labels:string[];rows:Row[];setter:React.Dispatch<React.SetStateAction<Row[]>>;changeRow:(s:React.Dispatch<React.SetStateAction<Row[]>>,id:number,i:number,v:string)=>void;add:()=>void;del:(id:number)=>void}){return <div className="form-card"><EditorTitle n={n} title={title}/><div className="entry-list">{rows.map((r,ri)=><div className={`entry-card fields-${labels.length}`} key={r.id}><div className="entry-number">{String(ri+1).padStart(2,'0')}</div>{labels.map((l,i)=><label key={l}><span>{t(l)}</span><input value={r.values[i]} onChange={e=>changeRow(setter,r.id,i,e.target.value)} placeholder={t(l)}/></label>)}<button aria-label={t('이 행 지우기')} className="delete" disabled={rows.length===1} onClick={()=>del(r.id)}>×</button></div>)}</div><button className="add-button" onClick={add}><b>＋</b> {t(title)} {t('추가')}</button></div>}
function PaperTitle({title}:{title:string}){return <h3 className="paper-section-title"><i/> {title}</h3>}
function PRow({label,value,label2,labelB,valueB}:{label:string;value:string;label2?:string;labelB?:string;valueB?:string}){const kind=labelB?'split-contact':label2?'name-row':'simple-row';return <div className={`p-row ${kind}`}><b>{label}</b>{label2&&<b>{label2}</b>}<span>{value}</span>{labelB&&<><b>{labelB}</b><span>{valueB}</span></>}</div>}
function PBox({l,v}:{l:string;v:string}){return <><b>{l}</b><span>{v}</span></>}
function PaperTable({title,headers,rows}:{title:string;headers:string[];rows:Row[]}){return <><PaperTitle title={title}/><div className={`paper-table cols-${headers.length}`}><div className="paper-table-head">{headers.map(h=><b key={h}>{h}</b>)}</div>{rows.map(r=><div className="paper-table-row" key={r.id}>{r.values.map((v,i)=><span key={i}>{v}</span>)}</div>)}</div></>}
