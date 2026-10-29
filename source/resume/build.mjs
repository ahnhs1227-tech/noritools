import {build} from 'esbuild';
await build({entryPoints:['src/main.tsx'],bundle:true,minify:true,jsx:'automatic',target:['es2020'],format:'esm',outfile:'../../assets/resume/resume.js',define:{'process.env.NODE_ENV':'"production"'},legalComments:'linked'});
