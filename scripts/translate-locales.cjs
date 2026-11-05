const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),base=path.join(root,'assets/i18n');
const dictionary={NoriMessages:{}}; const ctx={window:dictionary};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(base,'messages.js'),'utf8'),ctx);
for(const file of fs.readdirSync(base).filter(x=>x.endsWith('.js')&&x!=='messages.js'&&x!=='i18n.js')){
 const code=fs.readFileSync(path.join(base,file),'utf8');
 if(code.includes('Object.assign(window.NoriMessages')){try{vm.runInContext(code,ctx)}catch(e){throw new Error(file+': '+e.message)}}
}
const input=JSON.parse(fs.readFileSync(path.join(__dirname,'locale-inventory.json')));let output={};
for(const lang of ['en','ja','zh-CN']){
 const c={window:{NoriMessages:dictionary.NoriMessages,addEventListener(){}},location:{href:'https://nori-tools.com/?lang='+lang},localStorage:{getItem(){return null}},document:{addEventListener(){},readyState:'loading'},URL,Map,Set,WeakMap};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(base,'i18n.js'),'utf8'),c);
 output[lang]=Object.fromEntries(input.texts.map(s=>[s,c.window.NoriI18n.t(s)]));
}
fs.writeFileSync(path.join(__dirname,'locale-translations.json'),JSON.stringify(output,null,2));
const missing=input.texts.filter(s=>Object.values(output).some(m=>/[가-힣]/.test(m[s])));
fs.writeFileSync(path.join(__dirname,'locale-missing.json'),JSON.stringify(missing,null,2));
console.log('Untranslated strings:',missing.length);
