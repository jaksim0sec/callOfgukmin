import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const exists=p=>existsSync(resolve(root,p));
const errors=[];
const entry=read('index.html');
const screens=['waiting','game','result'];
const scripts=['poster','data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','life/middle','life/high','systemDemo','statusView','game','majorView','boot'].map(x=>'js/'+x+'.js');
if(!entry.includes('href="./html/waiting.html"') || !entry.includes('location.replace('))
 errors.push('Root index does not redirect to waiting screen.');
if(entry.includes('id="app"'))errors.push('Old fetch app host still present');
const ids={
 waiting:['waitingName','waitingBackground','waitingPosterMount','enterGame','rerollPersona','previewResult','birthIntro','birthIntroName','birthIntroBackground','birthIntroFamily','birthIntroTrait','birthIntroSkip','birthIntroCountdown','birthIntroProgress'],
 game:['playerPosterMount','age','job','attributeRows','schools','gaugesList','traits','log','resetGame','previewSchool','previewParty','choiceDialog','modalTitle','options','summary','confirm','close','choiceTiming','nextChoiceProgress','currentChoice','lifeHeadline','sheetToggle','sheetContent','lifeSheet','startSystemDemo','advanceTurn','lifeDecisionDialog'],
 result:['resultPosterMount','resultBack']
};
for(const screen of screens){
 const path='html/'+screen+'.html';
 if(!exists(path)){errors.push('Missing '+path);continue;}
 const html=read(path);
 if(!/^<!doctype html>/i.test(html.trim()))errors.push('Not an independent HTML document: '+path);
 if(!html.includes('data-screen="'+screen+'"'))errors.push('Missing screen marker: '+path);
 if(!html.includes('<base href="../">'))errors.push('Missing static asset base URL: '+path);
 const matches=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
 if(JSON.stringify(matches)!==JSON.stringify(scripts))errors.push('Script path/order incorrect: '+path);
 if(!html.includes('href="css/style.css"'))errors.push('Missing CSS: '+path);
 for(const source of [...matches,'css/style.css']){
  const target=resolve(root,source);
  if(!exists(target))errors.push('Missing asset '+source+' from '+path);
 }
 const idsSeen=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const id of ids[screen])if(!idsSeen.has(id))errors.push('Missing DOM element '+id+' in '+path);
}
for(const path of scripts){
 try{new vm.Script(read(path),{filename:path});}
 catch(e){errors.push('JavaScript syntax: '+path+' '+e.message);}
}
const boot=read('js/boot.js');
if(/\bfetch\s*\(/.test(boot)||boot.includes("template.innerHTML"))errors.push('Router still uses runtime fetch/injection');
for(const name of screens)if(!boot.includes("'"+name+"'"))errors.push('Missing route '+name);
const game=read('js/game.js');
if(!game.includes('GukminStatus.render')||!game.includes('GukminPoster.create'))errors.push('Game UI integration missing');
const state=read('js/playerState.js');
if(!state.includes('callOfgukmin__ui__v1'))errors.push('UI save key changed');
const css=read('css/style.css').replaceAll(/:root\{font-size:(?:15|16)px\b/g,':root{font-size:ROOT');
if(/\d+(?:\.\d+)?px\b/.test(css))errors.push('Non-root px in CSS');
for(const selector of ['.school-token-active','.trait-section','.gauges-list','.waiting-screen','.result-screen','.birth-intro']){
 if(!css.includes(selector))errors.push('Missing UI CSS: '+selector);
}
if(errors.length){console.error('Smoke FAIL:\n'+errors.map(x=>'- '+x).join('\n'));process.exitCode=1}
else console.log('Smoke OK: 3 standalone screens, asset paths, route navigation, state UI, static syntax.');
