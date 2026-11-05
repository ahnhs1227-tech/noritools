/* Prerender the existing React form, without a browser or user data. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const modules=path.resolve(process.argv[2]||path.join(root,'source/resume/node_modules'));
const esbuild=require(path.join(modules,'esbuild'));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'nori-resume-ssr-'));
try {
 const bundle=path.join(temp,'render.cjs');
 esbuild.buildSync({stdin:{contents:`import React from 'react';import {renderToString} from 'react-dom/server';import Home from '${path.join(root,'source/resume/src/page.tsx')}';export const render=()=>renderToString(React.createElement(Home));`,resolveDir:root,loader:'tsx'},bundle:true,platform:'node',format:'cjs',jsx:'automatic',nodePaths:[modules],outfile:bundle});
 const dictionary={NoriMessages:{}};const dc={window:dictionary};vm.createContext(dc);
 const base=path.join(root,'assets/i18n');vm.runInContext(fs.readFileSync(path.join(base,'messages.js'),'utf8'),dc);
 for(const file of fs.readdirSync(base).filter(f=>f.endsWith('.js')&&!['messages.js','i18n.js'].includes(f))){const code=fs.readFileSync(path.join(base,file),'utf8');if(code.includes('Object.assign(window.NoriMessages'))vm.runInContext(code,dc)}
 const {render}=require(bundle),result={};
 for(const lang of ['ko','en','ja','zh-CN']){
  const c={window:{NoriMessages:dictionary.NoriMessages,addEventListener(){}},location:{href:'https://nori-tools.com/?lang='+lang},document:{readyState:'loading',addEventListener(){}},URL,Map,Set,WeakMap,WeakSet};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(base,'i18n.js'),'utf8'),c);
  global.window=c.window;global.document={documentElement:{lang}};result[lang]=render();
 }
 fs.writeFileSync(path.join(__dirname,'locale-resume.json'),JSON.stringify(result));console.log('Prerendered resume in 4 languages');
} finally {fs.rmSync(temp,{recursive:true,force:true});}
