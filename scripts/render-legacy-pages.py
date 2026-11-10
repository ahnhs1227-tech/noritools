"""Apply matching SSR to editable Korean pages before locale generation."""
from pathlib import Path
import json,importlib.util
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('locales',ROOT/'scripts/build-locales.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
for slug,markup in json.loads((ROOT/'scripts/legacy-ssr.json').read_text()).items():
 p=ROOT/'tools'/slug/'index.html';n=b.Parser(p.read_text()).root;head=next(x for x in b.walk(n) if x.tag=='head');body=next(x for x in b.walk(n) if x.tag=='body')
 for parent in list(b.walk(head)):
  parent.children=[x for x in parent.children if not ((x.tag=='script' and ('/_next/' in x.attrs.get('src','') or 'legacy-tools.js' in x.attrs.get('src',''))) or (x.tag=='link' and x.attrs.get('as')=='script'))]
 head.children.append(b.Node('script',{'src':'/assets/nori/legacy-tools.js?v=20261111-audit1','defer':''}))
 # The local translation engine is initialized by the tools' mounted event.
 body.children=[b.language_bar('/tools/'+slug+'/','ko')]+b.Parser('<div id="legacy-root" data-tool="'+slug+'">'+markup+'</div>').root.children
 p.write_text(b.serialize(n))
