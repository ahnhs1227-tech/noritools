/* Local translations: no remote translation calls and no uploaded user content. */
'use strict';
(()=>{
 const codes=['ko','en','ja','zh-CN'],indices={en:0,ja:1,'zh-CN':2},dict=window.NoriMessages||{},source=new WeakMap(),attributes=new WeakMap();
 const normalize=s=>String(s).replace(/\s+/g,' ').trim(),normalized=new Map(Object.entries(dict).map(([k,v])=>[normalize(k),v]));
 const valid=value=>value==='zh'||value==='zh-Hans'?'zh-CN':codes.includes(value)?value:null;
 let locale='ko';try{locale=valid(new URL(location.href).searchParams.get('lang'))||valid(localStorage.getItem('nori-language'))||'ko'}catch{}
 const cache=new Map(),escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const templates=Object.entries(dict).filter(([k])=>/\{\d+\}/.test(k)).map(([k,v])=>({key:k,values:v,re:new RegExp('^'+k.trim().split(/\{\d+\}/).map(escape).join('(.*?)')+'$')}));
 const fragments=Object.keys(dict).filter(k=>k.trim().length>=2&&!/^\d+\s*(?:회|개|장|초|분|쌍|점|위)$/.test(k.trim())&&!/\{\d+\}|[<>]|\$\{|\\[bdsw]/.test(k)).sort((a,b)=>b.length-a.length);
 const phrasePattern=fragments.length?new RegExp(fragments.map(escape).join('|'),'g'):null;
 const missing=new Set();
 function format(key,...args){const v=(locale==='ko'?key:(dict[key]||normalized.get(normalize(key)))?.[indices[locale]])||key;return v.replace(/\{(\d+)\}/g,(_,i)=>String(args[i]??''))}
 function t(value){
  const raw=String(value??'');if(locale==='ko'||!/[가-힣]/.test(raw))return raw;
  const cached=cache.get(raw);if(cached!==undefined)return cached;
  const index=indices[locale],key=normalize(raw),entry=dict[raw]||normalized.get(key);
  let result=entry?raw.replace(raw.trim(),entry[index]):raw;
  if(!entry){
   const template=templates.find(x=>x.re.test(raw.trim()));
   if(template){const captures=raw.trim().match(template.re).slice(1);result=template.values[index].replace(/\{(\d+)\}/g,(_,i)=>t(captures[i]||''));}
   else if(phrasePattern)result=raw.replace(phrasePattern,k=>{const v=dict[k][index];return (/^\s/.test(k)?' ':'')+v.trim()+(/\s$/.test(k)?' ':'')});
   const units={개:[' items','個','个'],장:[' sheets','枚','张'],초:[' sec','秒','秒'],분:[' min','分','分钟'],회:[' moves','回','次'],점:[' points','点','分'],쌍:[' pairs','ペア','对'],위:[' place','位','名'],송이:[' flowers','輪','朵'],년:[' year','年','年'],월:[' month','月','月'],일:[' day','日','日'],시:[' hr','時','时'],번:[' times','回','次'],배:['×','倍','倍'],원:[' KRW','ウォン','韩元'],연속:[' streak','連続','连胜']};
   result=result.replace(/([\d,.]+)\s*(송이|연속|개|장|초|분|회|점|쌍|위|년|월|일|시|번|배|원)(?![가-힣])/g,(_,n,u)=>n+units[u][index]);
  }
  if(locale==='en')result=result.replace(/(\d)(min|flowers|points|pairs|sec|moves)\b/g,'$1 $2').replace(/\b1 (flowers|points|pairs|moves)\b/g,(_,unit)=>'1 '+unit.slice(0,-1));
  if(/[가-힣]/.test(result))missing.add(raw);
  if(cache.size>12000)cache.clear();cache.set(raw,result);return result;
 }
 const skip='script,style,[translate="no"],[data-no-translate],.nori-language-bar,.rank-name,.rank-row-name,#finished-goal,#card-logo-name,.batch-item strong,.record-card strong,.price-table [data-user-text],#who,#garden-voice-name';
 const textSkip=skip+',textarea,input,[contenteditable]:not([contenteditable="false"])';
 function textNode(node){
  const el=node.parentElement;if(!el||el.closest(textSkip))return;
  if(el.tagName==='OPTION'&&!el.hasAttribute('value'))el.value=el.textContent;
  const current=node.nodeValue,old=source.get(node),original=old&&current===old.output?old.original:current;
  if(!original||(!/[가-힣]/.test(original)&&!old))return;
  const output=t(original);source.set(node,{original,output});if(current!==output)node.nodeValue=output;
 }
 function attrs(el){
  if(el.closest(skip))return;
  let tracked=attributes.get(el);if(!tracked){tracked={};attributes.set(el,tracked)}
  for(const name of ['title','aria-label','placeholder','alt',...(el.tagName==='META'?['content']:[])]){
   if(!el.hasAttribute(name))continue;const current=el.getAttribute(name),old=tracked[name],original=old&&current===old.output?old.original:current;
   if(!/[가-힣]/.test(original)&&!old)continue;const output=t(original);tracked[name]={original,output};if(current!==output)el.setAttribute(name,output);
  }
 }
 function translateTree(root){
  if(root.nodeType===3){textNode(root);return}if(root.nodeType!==1&&root.nodeType!==9)return;
  if(root.nodeType===9)root.querySelectorAll('input,textarea').forEach(attrs);
  if(root.nodeType===1){if(root.closest(skip))return;attrs(root);root.querySelectorAll('input,textarea').forEach(attrs)}
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode(node){if(node.nodeType===1&&node.matches(textSkip))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
  while(walker.nextNode()){const node=walker.currentNode;if(node.nodeType===3)textNode(node);else attrs(node)}
 }
 function metadata(){
  document.documentElement.lang=locale;document.documentElement.dataset.noriLang=locale;
  const url=new URL(location.pathname,location.origin);url.search=locale==='ko'?'':'?lang='+locale;
  const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=url.href;
  for(const lang of [...codes,'x-default']){let link=document.querySelector('link[data-nori-alternate="'+lang+'"]');if(!link){link=document.createElement('link');link.rel='alternate';link.hreflang=lang;link.dataset.noriAlternate=lang;document.head.append(link)}const u=new URL(location.pathname,location.origin);if(lang!=='ko'&&lang!=='x-default')u.searchParams.set('lang',lang);link.href=u.href}
 }
 function choose(value){
  const next=valid(value)||'ko';if(locale===next)return;locale=next;cache.clear();missing.clear();try{localStorage.setItem('nori-language',locale)}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',locale);history.replaceState(history.state,'',url.href);
  const select=document.getElementById('nori-language');if(select)select.value=locale;metadata();document.querySelectorAll('input,textarea').forEach(attrs);translateTree(document);document.dispatchEvent(new CustomEvent('nori:languagechange',{detail:{locale}}));
 }
 function picker(){
  if(document.getElementById('nori-language'))return;
  const bar=document.createElement('div');bar.className='nori-language-bar';bar.setAttribute('translate','no');
  const label=document.createElement('label');label.htmlFor='nori-language';label.textContent='Language';const select=document.createElement('select');select.id='nori-language';select.setAttribute('aria-label','언어 선택 / Choose language');
  ['한국어','English','日本語','简体中文'].forEach((name,i)=>{const option=document.createElement('option');option.value=codes[i];option.textContent=name;select.append(option)});select.value=locale;select.onchange=()=>choose(select.value);bar.append(label,select);document.body.prepend(bar);
 }
 function confirmLocalized(message){return window.confirm(t(message))}
 function alertLocalized(message){return window.alert(t(message))}
 let booted=false;function boot(){
  if(booted)return;booted=true;
  picker();metadata();try{localStorage.setItem('nori-language',locale)}catch{}document.querySelectorAll('input,textarea').forEach(attrs);translateTree(document);
  const pending=new Set();let scheduled=false;
  new MutationObserver(records=>{
   for(const r of records){if(r.type==='childList')r.addedNodes.forEach(n=>pending.add(n));else pending.add(r.target)}
   if(!scheduled){scheduled=true;queueMicrotask(()=>{scheduled=false;const list=[...pending];pending.clear();for(const node of list)if(node.isConnected)translateTree(node)})}
  }).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt','content']});
  window.addEventListener('popstate',()=>{const requested=valid(new URL(location.href).searchParams.get('lang'));if(requested&&requested!==locale)choose(requested);metadata()});
 }
 window.NoriI18n={t,format,choose,confirm:confirmLocalized,alert:alertLocalized,get locale(){return locale},get missing(){return [...missing]},search(values){return values.map(v=>[v,...(dict[v]||normalized.get(normalize(v))||[])]).flat().join(' ')}};
 // Wait for the original pages' asynchronous framework scripts before touching their text nodes.
 function start(){if(document.querySelector('script[src*="0_mmq9in"]')&&!window.NoriHydrated)return;boot()}
 document.addEventListener('nori:hydrated',start);if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
