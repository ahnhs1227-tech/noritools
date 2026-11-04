'use client';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { t } from './translate';

type Row = { id:number; values:string[] };
type SectionKey = 'military'|'education'|'career'|'skills';
const sectionNames:Record<SectionKey,string>={military:'병역 및 보훈사항',education:'학력사항',career:'경력사항',skills:'개인능력'};
const makeRow=(id:number,count:number):Row=>({id,values:Array(count).fill('')});

export default function Home(){
  const [locale,setLocale]=useState((window as any).NoriI18n?.locale||document.documentElement.lang);
  useEffect(()=>{const change=()=>setLocale(document.documentElement.lang);document.addEventListener('nori:languagechange',change);return ()=>document.removeEventListener('nori:languagechange',change)},[]);
  useEffect(()=>{document.title=t('노리 이력서')+' · NORI Tools'},[locale]);
  const examples:Record<string,{name:string;roman:string;address:string}>={ko:{name:'김노리',roman:'Kim Nori',address:'서울특별시 노리구 노리로 123 (예시)'},en:{name:'Nori Doh',roman:'Nori Doh',address:'123 Nori Lane, Nori City (example)'},ja:{name:'佐藤ノリ',roman:'Nori Sato',address:'ノリ市ノリ町1-2-3（架空の住所）'},'zh-CN':{name:'王诺里',roman:'Nori Wang',address:'诺里市诺里路123号（示例）'}};
  const example=examples[locale]||examples.ko;
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
  const moveRow=(setter:React.Dispatch<React.SetStateAction<Row[]>>,id:number,direction:-1|1)=>setter(rows=>{const from=rows.findIndex(row=>row.id===id),to=from+direction;if(from<0||to<0||to>=rows.length)return rows;const next=[...rows];[next[from],next[to]]=[next[to],next[from]];return next;});
  const delRow=(setter:React.Dispatch<React.SetStateAction<Row[]>>,id:number,rows:Row[])=>{const remove=()=>setter(p=>p.length>1?p.filter(r=>r.id!==id):p);if(rows.find(r=>r.id===id)?.values.some(v=>v.trim()))ask('이 행에 입력한 내용을 지울까요?',remove);else remove();};

  return <main translate="no" data-resume-locale={locale}><header className="topbar"><div className="brand"><a className="brand-mark" href="/noritools/" onClick={leaveHome} aria-label={t("노리툴즈 홈으로")}>N<span>.</span></a><div><strong>{t('노리 이력서')}</strong><small>{t('필요한 항목만 담는 이력서')}</small></div></div><div className="top-actions"><a className="home-link" href="/noritools/" onClick={leaveHome}>{t('도구 모음')}</a><button className="ghost" onClick={startOver}>{t('새로 작성')}</button><button className="print-button" onClick={()=>window.print()}>{t('인쇄 · PDF 저장')}</button></div></header>
  <section className="resume-intro"><div className="resume-intro-copy"><span className="resume-eyebrow">NORI / YOUR NEXT CHAPTER</span><h1>{t('노리 이력서')}</h1><p>{t('새로운 시작, 노리와 차근차근 준비해요.')}</p><div className="resume-badges"><span>{t('가입 없이 무료')}</span><span>{t('사진·정보는 기기 안에서만')}</span><span>{t('A4 인쇄 · PDF 저장')}</span></div><small>{t('선택한 언어로 이력서를 작성합니다. 입력한 내용은 자동 저장되지 않으니, 페이지를 닫기 전에 인쇄하거나 PDF로 저장해 주세요.')}</small></div><div className="resume-mascot"><img src="/noritools/assets/nori/characters/nori-resume.webp" alt={t('서류와 가방을 든 취업 준비 노리')} width="240" height="260"/></div></section>
  <div className="workspace inline-workspace"><section className="editor inline-options" id="resume-editor">
    <div className="category-picker"><div><b>{t('표시할 카테고리')}</b><small>{t('스위치를 끄면 입력란과 출력물에서 함께 숨겨집니다.')}</small></div><div className="history-mode"><span>{t('학력·경력 작성 방식')}</span><button className={historyMode==='separate'?'active':''} onClick={()=>setHistoryMode('separate')}>{t('분리 작성')}</button><button className={historyMode==='combined'?'active':''} onClick={()=>setHistoryMode('combined')}>{t('통합 작성')}</button></div><div className="switches">{(Object.keys(sectionNames) as SectionKey[]).filter(k=>historyMode==='separate'||k!=='career').map(k=><label className="switch" key={k}><input type="checkbox" checked={visible[k]} onChange={()=>setVisible(p=>({...p,[k]:!p[k]}))}/><span/><b>{t(historyMode==='combined'&&k==='education'?'학력 및 경력사항':sectionNames[k])}</b></label>)}</div></div>
      <div className="personal-option-bar"><span>{t('선택 정보')}</span><div className="identity-choice"><button className={personalOptions.identity==='birth'?'active':''} onClick={()=>setPersonalOptions(p=>({...p,identity:'birth'}))}>{t('생년월일')}</button><button className={personalOptions.identity==='resident'?'active':''} onClick={()=>setPersonalOptions(p=>({...p,identity:'resident'}))}>{t('주민등록번호')}</button></div><label><input type="checkbox" checked={personalOptions.sns} onChange={()=>setPersonalOptions(p=>({...p,sns:!p.sns}))}/><i/>{t('SNS 표시')}</label></div>
  </section>

  <aside className="preview-pane" id="resume-preview" tabIndex={-1}><div className="preview-label"><div><span className="live-dot"/>{t('이력서에 바로 작성')}</div><small>A4 · 210 × 297 mm</small></div><p className="direct-tip">{t('빈칸을 눌러 작성하고, 사진 영역을 눌러 사진을 넣어 주세요.')}<span className="mobile-edit-tip">{t('좌우로 밀어 문서 전체를 작성할 수 있어요.')}</span></p>{photoError&&<p className="photo-error" role="alert">{t(photoError)}</p>}<div className="paper-wrap" role="region" aria-label={t('이력서 편집 영역')} tabIndex={0}><article className="modern-paper">
    <h2>{t('이 력 서')}</h2><PaperTitle title="인적사항"/><div className="personal-table"><div className="modern-photo"><label className="photo-target">{photo?<img src={photo} alt={t('증명사진')}/>:<span className="photo-prompt"><strong>＋</strong>{t('사진 넣기')}<small>JPG · PNG · WebP<br/>10MB</small></span>}<input aria-label={t(photo?'사진 변경':'증명사진 업로드')} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload}/><span className="photo-change">{t('사진 변경')}</span></label>{photo&&<button className="photo-clear" onClick={()=>setPhoto('')}>{t('사진 지우기')}</button>}</div><div className="personal-info"><div className="p-name"><b className="name-label">{t('성 명')}</b><b className="name-kr-label">{t('한 글')}</b><span className="name-kr-value"><InlineField label={t(locale==='ko'?'성명 (한글)':'성명 (현지어)')} value={basic.nameKr} placeholder={example.name} onChange={v=>setB('nameKr',v)}/></span><b className="name-en-label">{t('영 문')}</b><span className="name-en-value"><InlineField label={t('성명 (영문)')} value={basic.nameEn} placeholder={example.roman} onChange={v=>setB('nameEn',v)}/></span></div>{personalOptions.identity==='birth'?<PRow label="생년월일" value={basic.birth} onChange={v=>setB('birth',v)} placeholder="1998-03-15"/>:<PRow label="주민등록번호" value={basic.resident} onChange={v=>setB('resident',v)} placeholder="000000-0000000"/>}<PRow label="E-mail" value={basic.email} onChange={v=>setB('email',v)} placeholder="nori@example.com"/>{personalOptions.sns?<PRow label="전화번호" value={basic.phone} onChange={v=>setB('phone',v)} placeholder="010-0000-0000" labelB="SNS" valueB={basic.sns} onChangeB={v=>setB('sns',v)} placeholderB="example.com/nori"/>:<PRow label="전화번호" value={basic.phone} onChange={v=>setB('phone',v)} placeholder="010-0000-0000"/>}<PRow label="주 소" value={basic.address} onChange={v=>setB('address',v)} placeholder={example.address}/></div></div>
    {visible.military&&<><PaperTitle title="병역 및 보훈사항"/><div className="military-grid"><PBox l="군 별" v={military.branch} onChange={v=>setM('branch',v)} placeholder={t('육군')}/><PBox l="병 역" v={military.status} onChange={v=>setM('status',v)} placeholder={t('만기 전역')}/><PBox l="계 급" v={military.rank} onChange={v=>setM('rank',v)} placeholder={t('병장')}/><PBox l="복무장소" v={military.place} onChange={v=>setM('place',v)} placeholder={t('청주')}/><PBox l="복무기간" v={military.period} onChange={v=>setM('period',v)} placeholder={t('2025.03 ~ 2027.03')}/><PBox l="보훈대상" v={military.veteran} onChange={v=>setM('veteran',v)} placeholder={t('비대상')}/></div></>}
    {historyMode==='combined'&&visible.education&&<PaperTable title="학력 및 경력사항" headers={['년/월/일','학 력 및 경 력 사 항','기관·발령청']} rows={combined} change={(id,i,v)=>changeRow(setCombined,id,i,v)} add={()=>addRow(setCombined,3)} del={id=>delRow(setCombined,id,combined)} move={(id,direction)=>moveRow(setCombined,id,direction)}/>} 
    {historyMode==='separate'&&visible.education&&<PaperTable title="학력사항" headers={['년/월/일','학 교 명','학 과']} rows={education} change={(id,i,v)=>changeRow(setEducation,id,i,v)} add={()=>addRow(setEducation,3)} del={id=>delRow(setEducation,id,education)} move={(id,direction)=>moveRow(setEducation,id,direction)}/>} 
    {historyMode==='separate'&&visible.career&&<PaperTable title="경력사항" headers={['기간','회 사 명','직무','부서','직위/직급']} rows={career} change={(id,i,v)=>changeRow(setCareer,id,i,v)} add={()=>addRow(setCareer,5)} del={id=>delRow(setCareer,id,career)} move={(id,direction)=>moveRow(setCareer,id,direction)}/>} 
    {visible.skills&&<PaperTable title="개인능력" headers={['구분','항목','수준·점수']} rows={skills} change={(id,i,v)=>changeRow(setSkills,id,i,v)} add={()=>addRow(setSkills,3)} del={id=>delRow(setSkills,id,skills)} move={(id,direction)=>moveRow(setSkills,id,direction)}/>} 
    <footer className="resume-watermark">{t('이 이력서는 노리툴즈에서 무료로 제작하였습니다')}</footer>
  </article></div><p className="print-hint">{t('활성화한 카테고리만 인쇄되며, 인쇄 창에서 PDF로 저장할 수 있습니다.')}<br/>{t('용지는 A4, 배율은 100%로 선택하고 머리글·바닥글을 끄면 깔끔하게 저장돼요.')}<a className="back-to-editor" href="#resume-editor">↑ {t('표시할 카테고리')}</a></p></aside></div><dialog className="resume-confirm" ref={dialog} aria-labelledby="resume-confirm-title" onCancel={e=>{e.preventDefault();setConfirmation(null);}}><h2 id="resume-confirm-title">{t('잠깐 확인해 주세요')}</h2><p>{confirmation&&t(confirmation.message)}</p><div><button autoFocus onClick={()=>setConfirmation(null)}>{t('취소')}</button><button className="confirm-action" onClick={()=>{const action=confirmation?.action;setConfirmation(null);action?.();}}>{t('확인')}</button></div></dialog></main>
}

/** A native textarea preserves IME/keyboard behavior. Its text twin wraps identically
 * and prints every line without input chrome or example placeholders. */
function InlineField({label,value,onChange,placeholder=''}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string}){
 return <div className="inline-field"><div className="field-text" aria-hidden="true">{value||' '}<br/></div><textarea rows={1} aria-label={label} value={value} placeholder={placeholder||t('입력')} onChange={e=>onChange(e.target.value)} spellCheck={false}/></div>;
}
function PaperTitle({title}:{title:string}){return <h3 className="paper-section-title"><i/> {t(title)}</h3>}
function PRow({label,value,onChange,placeholder,labelB,valueB,onChangeB,placeholderB}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;labelB?:string;valueB?:string;onChangeB?:(v:string)=>void;placeholderB?:string}){return <div className={`p-row ${labelB?'split-contact':'simple-row'}`}><b>{t(label)}</b><span><InlineField label={t(label)} value={value} onChange={onChange} placeholder={placeholder}/></span>{labelB&&onChangeB&&<><b>{t(labelB)}</b><span><InlineField label={t(labelB)} value={valueB||''} onChange={onChangeB} placeholder={placeholderB}/></span></>}</div>}
function PBox({l,v,onChange,placeholder}:{l:string;v:string;onChange:(v:string)=>void;placeholder?:string}){return <><b>{t(l)}</b><span><InlineField label={t(l)} value={v} onChange={onChange} placeholder={placeholder}/></span></>}
function PaperTable({title,headers,rows,change,add,del,move}:{title:string;headers:string[];rows:Row[];change:(id:number,i:number,v:string)=>void;add:()=>void;del:(id:number)=>void;move:(id:number,direction:-1|1)=>void}){return <section className="editable-section" aria-label={t(title)}><PaperTitle title={title}/><div className={`paper-table cols-${headers.length}`}><div className="paper-table-head">{headers.map(h=><b key={h}>{t(h)}</b>)}</div>{rows.map((r,ri)=><div className="paper-table-row" key={r.id}>{r.values.map((v,i)=><span key={i}><InlineField label={`${t(title)} ${ri+1} · ${t(headers[i])}`} value={v} onChange={v=>change(r.id,i,v)} placeholder={t(headers[i])}/></span>)}<div className="row-actions"><span>{ri+1}</span><button className="row-move" aria-label={`${t(title)} ${ri+1} · ${t('위로 이동')}`} disabled={ri===0} onClick={()=>move(r.id,-1)} title={t('위로 이동')}>↑ <span>{t('위로')}</span></button><button className="row-move" aria-label={`${t(title)} ${ri+1} · ${t('아래로 이동')}`} disabled={ri===rows.length-1} onClick={()=>move(r.id,1)} title={t('아래로 이동')}>↓ <span>{t('아래로')}</span></button><button className="row-delete" aria-label={`${t(title)} ${ri+1} · ${t('이 행 지우기')}`} disabled={rows.length===1} onClick={()=>del(r.id)} title={t('이 행 지우기')}>× <span>{t('삭제')}</span></button></div></div>)}</div><button className="inline-add" onClick={add}>＋ {t(title)} {t('추가')}</button></section>}
