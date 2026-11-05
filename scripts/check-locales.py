#!/usr/bin/env python3
"""Check canonical URLs, reciprocal language links, local assets and guide text."""
import importlib.util,json,re
from pathlib import Path
s=importlib.util.spec_from_file_location('build',Path(__file__).with_name('build-locales.py'));b=importlib.util.module_from_spec(s);s.loader.exec_module(b)
errors=[];pages=0
for lang in b.LANGS:
 for route in b.routes():
  pages+=1;path=b.localized(route,lang);root=b.Parser(b.route_file(path).read_text()).root;nodes=list(b.walk(root))
  canonical=[x.attrs['href'] for x in nodes if x.tag=='link' and x.attrs.get('rel')=='canonical']
  if canonical!=[b.ORIGIN+path]:errors.append(f'{path}: invalid canonical')
  alternates={x.attrs['hreflang']:x.attrs['href'] for x in nodes if 'hreflang' in x.attrs}
  if alternates!={code:b.ORIGIN+b.localized(route,'ko' if code=='x-default' else code) for code in b.LANGS+['x-default']}:errors.append(f'{path}: incomplete reciprocal alternates')
  if next(x for x in nodes if x.tag=='html').attrs.get('lang')!=lang:errors.append(f'{path}: wrong lang')
  if sum(x.attrs.get('id')=='nori-language' for x in nodes)!=1:errors.append(f'{path}: duplicate language selector')
  for n in nodes:
   for key in ['src','href','poster']:
    v=n.attrs.get(key,'')
    if v.startswith('/') and not v.startswith('//') and not (b.ROOT/v.split('?')[0].split('#')[0].lstrip('/')).exists():errors.append(f'{path}: missing {v}')
   if n.tag=='script' and n.attrs.get('type')=='application/ld+json':
    data=json.loads(''.join(x.text for x in n.children))
    if lang!='ko' and re.search('[가-힣]',json.dumps(data,ensure_ascii=False)):errors.append(f'{path}: untranslated structured data')
  if lang!='ko' and route.startswith('/notes/'):
   found=set();b.texts(root,found)
   if found:errors.append(f'{path}: untranslated guide text: {found}')
print(f'Checked {pages} pages: {len(errors)} errors')
for error in errors:print(error)
raise SystemExit(bool(errors))
