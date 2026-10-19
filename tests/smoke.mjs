import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const exists=path=>existsSync(resolve(root,path));
const errors=[];
const html=read('index.html');
const views=Object.fromEntries(['waiting','game','result'].map(screen=>{
  const path='html/'+screen+'.html';
  if(!exists(path)){errors.push('Missing template: '+path);return [screen,''];}
  return [screen,read(path)];
}));
const scriptFiles=['js/poster.js','js/playerState.js','js/statusView.js','js/game.js','js/boot.js'];
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(x=>x[1]);
const styles=[...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(x=>x[0].match(/\bhref="([^"]+)"/)?.[1]).filter(Boolean);
for(const source of [...scripts,...styles]){
  if(source.startsWith('./')&&!exists(source.slice(2)))errors.push('Missing HTML resource: '+source);
}
for(const path of scriptFiles){
  if(!exists(path)){errors.push('Missing script: '+path);continue;}
  try {new vm.Script(read(path),{filename:path});}
  catch(error){errors.push('Script parse failure: '+path+' '+error.message);}
}
const expected=scriptFiles.map(path=>'./'+path);
if(JSON.stringify(scripts)!==JSON.stringify(expected))errors.push('Unexpected script load order: '+JSON.stringify(scripts));
if(!html.includes('id="app"'))errors.push('index.html is not an application shell');
for(const screen of ['waiting','game','result']){
  if(!read('js/boot.js').includes("'./html/"+screen+".html'"))errors.push('Boot does not load '+screen);
}
const idRe=/\bid="([^"]+)"/g;
const idsByScreen=Object.fromEntries(Object.entries(views).map(([name,markup])=>[name,new Set([...markup.matchAll(idRe)].map(m=>m[1]))]));
for(const [screen,mandatory] of Object.entries({
  waiting:['waitingName','waitingBackground','waitingPosterMount','enterGame','rerollPersona','previewResult'],
  game:['playerPosterMount','age','job','attributeRows','schools','gaugesList','traits','log','resetGame','previewSchool','previewParty','choiceDialog','modalTitle','options','summary','confirm','close','backToWaiting'],
  result:['resultPosterMount','resultBack']
})){
  for(const id of mandatory)if(!idsByScreen[screen].has(id))errors.push('Missing '+screen+' ID: '+id);
}
const game=read('js/game.js');
for(const [, ,id] of game.matchAll(/\$\(\s*(['"])([^'"]+)\1\s*\)/g)){
  if(!idsByScreen.game.has(id))errors.push('Game references missing DOM ID: '+id);
}
const state=read('js/playerState.js');
for(const text of ['callOfgukmin__ui__v1','schoolHistory','activeMetrics','relations','schoolScore','exam','awareness','TRAIT_DEFS']){
  if(!state.includes(text))errors.push('Missing player state contract: '+text);
}
const view=read('js/statusView.js');
for(const text of ['GukminPlayer.activeMetrics','GukminPlayer.schoolsOf','school-token-active','token-icon']){
  if(!view.includes(text))errors.push('Missing status renderer contract: '+text);
}
for(const file of ['js/game.js','js/playerState.js','js/boot.js']){
  for(const banned of ['function finishElection','function advanceAuto','function finish(','function decide(','callOfgukmin__playable__v1']){
    if(read(file).includes(banned))errors.push('Gameplay/savedata legacy in '+file+': '+banned);
  }
}
const css=read('css/style.css');
const withoutRoot=css.replaceAll(/:root\{font-size:(?:15|16)px\b/g,':root{font-size:ROOT');
if(/\d+(?:\.\d+)?px\b/.test(withoutRoot))errors.push('Non-root pixel values in CSS');
for(const selector of ['.school-token-active','.trait-section','.gauges-list','.waiting-screen','.result-screen','@media(max-width:47.5em)']){
  if(!css.includes(selector))errors.push('Missing CSS contract: '+selector);
}
if(errors.length){
  console.error('Smoke FAIL:\n'+[...new Set(errors)].map(error=>'- '+error).join('\n'));
  process.exitCode=1;
}else{
  console.log('Smoke OK: 3 HTML templates, route host, scripts, status tokens, savedata key, CSS units, no gameplay advancement.');
}
