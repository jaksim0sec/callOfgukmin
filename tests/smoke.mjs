import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const exists=p=>existsSync(resolve(root,p));
const html=read('index.html'),errors=[];
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(m=>m[0].match(/\bhref="([^"]+)"/)?.[1]).filter(Boolean);
for(const url of [...scripts,...styles])if(url.startsWith('./')&&!exists(url.slice(2)))errors.push('Missing resource '+url);
for(const f of ['js/poster.js','js/game.js']){if(!exists(f)){errors.push('Missing JavaScript '+f);continue}try{new vm.Script(read(f),{filename:f})}catch(e){errors.push('JS syntax: '+f+' '+e.message)}}
if(scripts.indexOf('./js/poster.js')<0||scripts.indexOf('./js/game.js')<0||scripts.indexOf('./js/poster.js')>=scripts.indexOf('./js/game.js'))errors.push('Incorrect script order');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const id of ['playerPosterMount','age','job','elementary','middle','high','uni','traits','stress','health','study','speech','support','spectrum','money','log','action','resetGame','previewSchool','previewParty','choiceDialog','modalTitle','options','summary','confirm','close'])if(!ids.has(id))errors.push('Missing DOM ID '+id);
const js=read('js/game.js');
for(const [,,id] of js.matchAll(/\$\(\s*(['"])([^'"]+)\1\s*\)/g))if(!ids.has(id))errors.push('JS reference missing DOM ID '+id);
for(const required of ['callOfgukmin__ui__v1','GukminPoster.create','GukminPoster.update','function generate','function openPreview'])if(!js.includes(required))errors.push('Missing UI foundation '+required);
for(const forbidden of ['function finishElection','function advanceAuto','function finish(','function decide(','function createSequence','callOfgukmin__playable__v1'])if(js.includes(forbidden))errors.push('Gameplay code still active: '+forbidden);

const css = read('css/style.css');
const fixedPx = css.replaceAll(/:root\{font-size:(?:15|16)px;/g, ':root{');
if (/\d+(?:\.\d+)?px\b/.test(fixedPx)) errors.push('Non-root fixed px found in CSS');
for (const required of [':root{font-size:16px;', ':root{font-size:15px}', 'display:flex;flex-direction:column;align-items:stretch', '@media(max-width:47.5em)']) {
  if (!css.includes(required)) errors.push('Missing CSS layout contract: ' + required);
}
if(errors.length){console.error('Smoke FAIL:\n'+[...new Set(errors)].map(e=>'- '+e).join('\n'));process.exitCode=1}else console.log('Smoke OK: resources, UI-only scripts, poster API, DOM IDs, no game engine.');
