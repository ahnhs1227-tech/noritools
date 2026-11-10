/* Build interactive tools and their matching searchable first render. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const root=path.resolve(__dirname,'../..');
const modules=path.resolve(process.argv[2]||path.join(__dirname,'node_modules'));
const esbuild=require(path.join(modules,'esbuild'));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'nori-legacy-'));
try{
 const source=path.join(__dirname,'Tools.jsx');fs.writeFileSync(source,esbuild.transformSync(fs.readFileSync(source,'utf8'),{loader:'jsx',format:'esm',charset:'utf8'}).code);
 esbuild.buildSync({entryPoints:[path.join(__dirname,'client.jsx')],bundle:true,minify:true,platform:'browser',format:'iife',nodePaths:[modules],define:{'process.env.NODE_ENV':'"production"'},outfile:path.join(root,'assets/nori/legacy-tools.js')});
 esbuild.buildSync({stdin:{contents:`import React from 'react';import {renderToString} from 'react-dom/server';import Tools from '${source}';export const render=tool=>renderToString(React.createElement(Tools,{tool}));`,resolveDir:__dirname},bundle:true,platform:'node',format:'cjs',nodePaths:[modules],outfile:path.join(temp,'ssr.cjs')});
 global.window={NoriRules:require(path.join(root,'assets/nori/legacy-rules.js'))};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/nori/legacy-examples.js'),'utf8'),{window});
 const {render}=require(path.join(temp,'ssr.cjs'));const output={};for(const tool of ['discount-calculator','calorie-calculator','unit-converter','character-counter'])output[tool]=render(tool);
 fs.writeFileSync(path.join(root,'scripts/legacy-ssr.json'),JSON.stringify(output));
 console.log('Built 4 tools and matching initial HTML.');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
