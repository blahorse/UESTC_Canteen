import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const esbuild=process.env.CANTEEN_BUILD_DEPS?require(process.env.CANTEEN_BUILD_DEPS+'/esbuild'):require('esbuild');
await esbuild.build({entryPoints:['src/main.tsx'],bundle:true,outfile:'assets/app.js',minify:true,jsx:'automatic',target:['es2022'],define:{'process.env.NODE_ENV':'"production"'},nodePaths:process.env.CANTEEN_BUILD_DEPS?[process.env.CANTEEN_BUILD_DEPS]:[],legalComments:'eof'});
const css=readFileSync('assets/app.css','utf8');if(/fonts\.google|@import/.test(css))throw new Error('Build contains remote font dependency');
console.log('Built self-contained app: assets/app.js and assets/app.css');
