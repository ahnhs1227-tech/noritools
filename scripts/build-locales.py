#!/usr/bin/env python3
"""Build crawlable static locale pages. stdlib Python + Node; no paid service."""
from html.parser import HTMLParser
from html import escape
from pathlib import Path
import json,re,subprocess,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
LANGS=['ko','en','ja','zh-CN']; ORIGIN='https://nori-tools.com'
VOID=set('area base br col embed hr img input link meta param source track wbr'.split())
class Node:
 def __init__(self,tag=None,attrs=None,text='',kind='element'): self.tag=tag;self.attrs=dict(attrs or []);self.children=[];self.text=text;self.kind=kind
class Parser(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=True);self.root=Node('document');self.stack=[self.root];self.feed(s)
 def handle_starttag(self,t,a):
  n=Node(t,a);self.stack[-1].children.append(n)
  if t not in VOID:self.stack.append(n)
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,s):self.stack[-1].children.append(Node(text=s,kind='text'))
 def handle_comment(self,s):self.stack[-1].children.append(Node(text=s,kind='comment'))
 def handle_decl(self,s):self.stack[-1].children.append(Node(text=s,kind='decl'))
def walk(n):
 yield n
 for c in n.children:yield from walk(c)
def serialize(n,parent=''):
 if n.kind=='text':return n.text if parent in ['script','style'] else escape(n.text,quote=False)
 if n.kind=='comment':return '<!--'+n.text+'-->'
 if n.kind=='decl':return '<!'+n.text+'>'
 if n.tag=='document':return ''.join(serialize(c) for c in n.children)
 a=''.join(' '+k+('' if v is None else '="'+escape(str(v),quote=True)+'"') for k,v in n.attrs.items())
 return '<'+n.tag+a+'>'+('' if n.tag in VOID else ''.join(serialize(c,n.tag) for c in n.children)+'</'+n.tag+'>')
def route_file(route):return ROOT/(route.strip('/')+'/index.html' if route!='/' else 'index.html')
def routes():
 return [e.text.removeprefix(ORIGIN) for e in ET.parse(ROOT/'sitemap.xml').getroot().findall('{*}url/{*}loc') if not re.match(r'/(en|ja|zh-CN)/',e.text.removeprefix(ORIGIN))]
def skip(n):return n.tag in ['script','style','textarea'] or ('contenteditable' in n.attrs and n.attrs['contenteditable']!='false') or n.attrs.get('translate')=='no' or 'data-no-translate' in n.attrs
SEO_CLASSES=['search-help','search-guides','search-article','guide-article']
def prepare(n,route=""):
 if route in ["/notes/" ,"/notes/free-resume/","/notes/free-quotation/","/notes/free-transaction-statement/","/notes/signature-stamp-png/","/notes/emoji-symbols-copy/"]:
  for x in walk(n):
   if "nori-language-bar" not in x.attrs.get("class", "").split():x.attrs.pop("translate",None)
 # Guide editorial content is authored, not user input; translate it too.
 for x in walk(n):
  if any(c in x.attrs.get('class','').split() for c in SEO_CLASSES) or x.tag=='article':
   for y in walk(x):
    y.attrs.pop('translate',None)
    if y.attrs.get('lang')=='ko':y.attrs.pop('lang')
def texts(n,out):
 if n.tag=='script' and n.attrs.get('type')=='application/ld+json':
  def collect(v):
   if isinstance(v,str) and re.search('[가-힣]',v):out.add(v)
   elif isinstance(v,dict):
    for item in v.values():collect(item)
   elif isinstance(v,list):
    for item in v:collect(item)
  collect(json.loads(''.join(c.text for c in n.children)))
 if skip(n):return
 if n.kind=='text' and re.search('[가-힣]',n.text):out.add(n.text)
 for k in ['title','aria-label','placeholder','alt']+(['content'] if n.tag=='meta' else []):
  v=n.attrs.get(k,'')
  if re.search('[가-힣]',v or ''):out.add(v)
 for c in n.children:texts(c,out)
def inventory():
 out=set();pages={}
 for route in routes():
  n=Parser(route_file(route).read_text()).root;prepare(n,route);t=set();texts(n,t);out|=t;pages[route]=sorted(t)
 (ROOT/'scripts/locale-inventory.json').write_text(json.dumps({'texts':sorted(out),'pages':pages},ensure_ascii=False,indent=2))
 print('routes',len(pages),'unique strings',len(out))

# Korean HTML remains the editable source; all other routes are generated.
from urllib.parse import urljoin,urlsplit,urlunsplit,parse_qsl,urlencode
VERSION='20261105-international2'
def localized(route,lang):return ('' if lang=='ko' else '/'+lang)+route

def translate(n,mapping):
 if skip(n):return
 if n.tag=='option' and 'value' not in n.attrs:n.attrs['value']=''.join(c.text for c in n.children if c.kind=='text')
 originals=[]
 for i,c in enumerate(n.children):
  if c.kind=='text' and c.text in mapping and mapping[c.text]!=c.text:
   original=c.text;c.text=mapping[original];originals.append([i,original,c.text])
  elif c.kind=='element':translate(c,mapping)
 if originals:n.attrs['data-nori-source']=json.dumps(originals,ensure_ascii=False,separators=(',',':'))
 attr=[]
 for k in ['title','aria-label','placeholder','alt']+(['content'] if n.tag=='meta' else []):
  value=n.attrs.get(k)
  if value in mapping and mapping[value]!=value:
   n.attrs[k]=mapping[value];attr.append([k,value,mapping[value]])
 if attr:n.attrs['data-nori-attrs']=json.dumps(attr,ensure_ascii=False,separators=(',',':'))

def link_url(value,route,lang,known):
 if not value or value.startswith(('#','mailto:','tel:','data:','javascript:')):return value
 u=urlsplit(urljoin(ORIGIN+route,value))
 if u.netloc!='nori-tools.com':return value
 path=re.sub(r'^/(en|ja|zh-CN)(?=/|$)','',u.path) or '/'
 if path+'/' in known:path+='/'
 if path in known:
  q=dict(parse_qsl(u.query));target=q.pop('lang',lang)
  if target not in LANGS:target=lang
  return urlunsplit(('', '', localized(path,target),urlencode(q),u.fragment))
 return urlunsplit(('', '', u.path,u.query,u.fragment))

def jsonld(value,lang,mapping,known):
 if isinstance(value,dict):
  out={k:jsonld(v,lang,mapping,known) for k,v in value.items()}
  if '@type' in out and out['@type'] in ['WebApplication','WebPage','Article','FAQPage','WebSite']:out['inLanguage']=lang
  return out
 if isinstance(value,list):return [jsonld(v,lang,mapping,known) for v in value]
 if isinstance(value,str):
  if value.startswith(ORIGIN):
   url=link_url(value,'/',lang,known)
   return ORIGIN+url if url.startswith('/') else url
  return mapping.get(value,value)
 return value

def language_bar(route,lang):
 bar=Node('div',{'class':'nori-language-bar','translate':'no','data-nori-static-picker':''})
 label=Node('span',{'class':'nori-language-label'});label.children=[Node(text='Language',kind='text')];bar.children.append(label)
 group=Node('div',{'id':'nori-language','class':'nori-language-flags','role':'group','aria-label':'Choose language'});bar.children.append(group)
 for code,name in zip(LANGS,['한국어','English','日本語','简体中文']):
  a=Node('a',{'class':'nori-language-button','role':'button','data-language':code,'href':localized(route,code),'aria-label':name,'title':name,'aria-pressed':str(lang==code).lower()})
  a.children=[Node('img',{'src':'/assets/i18n/flags/'+code+'.svg','alt':'','width':'32','height':'32','aria-hidden':'true'})];group.children.append(a)
 return bar

def build():
 modules=ROOT/'source/resume/node_modules'
 if '--resume-modules' in sys.argv:modules=Path(sys.argv[sys.argv.index('--resume-modules')+1]).resolve()
 subprocess.run(['node',str(ROOT/'scripts/render-resume.cjs'),str(modules)],check=True)
 known=routes();inventory()
 subprocess.run(['node',str(ROOT/'scripts/translate-locales.cjs')],check=True)
 translations=json.loads((ROOT/'scripts/locale-translations.json').read_text())
 runtime=(ROOT/'assets/i18n/i18n.js').read_text();written=[]
 for route in known:
  original=route_file(route).read_text()
  for lang in LANGS:
   n=Parser(original).root;prepare(n,route)
   head=next(x for x in walk(n) if x.tag=='head');body=next(x for x in walk(n) if x.tag=='body');html=next(x for x in walk(n) if x.tag=='html')
   head.children=[x for x in head.children if not (x.tag=='link' and (x.attrs.get('rel')=='canonical' or 'hreflang' in x.attrs))]
   body.children=[x for x in body.children if 'data-nori-static-picker' not in x.attrs]
   # Remove generated dictionary scripts before a repeat build.
   for parent in list(walk(n)):
    parent.children=[x for x in parent.children if not (x.tag=='script' and '/assets/i18n/guide-messages.js' in x.attrs.get('src',''))]
   for parent in list(walk(n)):
    for i,x in list(enumerate(parent.children))[::-1]:
     if x.tag=='script' and ('/assets/i18n/i18n.js' in x.attrs.get('src','') or x.attrs.get('id')=='nori-document-translator'):
      if x.attrs.get('id')=='nori-document-translator':x.children=[Node(text=runtime,kind='text')]
      else:x.attrs['src']='/assets/i18n/i18n.js?v='+VERSION
      parent.children.insert(i,Node('script',{'src':'/assets/i18n/guide-messages.js?v='+VERSION}))
   html.attrs.update({'lang':lang,'data-nori-lang':lang})
   if route=='/tools/resume-maker/' and (ROOT/'scripts/locale-resume.json').exists():
    resume=next(x for x in walk(n) if x.attrs.get('id')=='resume-root')
    resume.children=Parser(json.loads((ROOT/'scripts/locale-resume.json').read_text())[lang]).root.children
   mapping=translations.get(lang,{})
   if lang!='ko':translate(n,mapping)
   for x in walk(n):
    for k in ['src','href','action','poster']:
     if k in x.attrs and x.attrs[k]:
      if x.tag=='a' and k=='href':x.attrs[k]=link_url(x.attrs[k],route,lang,known)
      elif not x.attrs[k].startswith(('/','#','http:','https:','data:','mailto:','tel:')):
       u=urlsplit(urljoin(ORIGIN+route,x.attrs[k]));x.attrs[k]=urlunsplit(('', '',u.path,u.query,u.fragment))
    if x.tag=='meta' and x.attrs.get('property')=='og:url':x.attrs['content']=ORIGIN+localized(route,lang)
    if x.tag=='script' and x.attrs.get('type')=='application/ld+json':
     data=json.loads(''.join(c.text for c in x.children));x.children=[Node(text=json.dumps(jsonld(data,lang,mapping,known),ensure_ascii=False).replace('<','\\u003c'),kind='text')]
   head.children.append(Node('link',{'rel':'canonical','href':ORIGIN+localized(route,lang)}))
   for code in LANGS+['x-default']:head.children.append(Node('link',{'rel':'alternate','hreflang':code,'href':ORIGIN+localized(route,'ko' if code=='x-default' else code)}))
   body.children.insert(0,language_bar(route,lang))
   f=route_file(localized(route,lang));f.parent.mkdir(parents=True,exist_ok=True);f.write_text(serialize(n));written.append(str(f.relative_to(ROOT)))
 # Plain sitemap lists every canonical URL; reciprocal hreflang is in the HTML.
 ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
 sitemap=ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
 for lang in LANGS:
  for route in known:
   url=ET.SubElement(sitemap,'url');ET.SubElement(url,'loc').text=ORIGIN+localized(route,lang)
 ET.indent(sitemap);ET.ElementTree(sitemap).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
 (ROOT/'scripts/locale-build-manifest.json').write_text(json.dumps({'routes':known,'files':written},ensure_ascii=False,indent=2)+'\n')
 print('Built',len(written),'pages (',len(known),'routes × 4 languages )')

if __name__=='__main__':
 import sys
 if '--build' in sys.argv:build()
 else:inventory()
