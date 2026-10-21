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
const gameScripts=[...scripts.slice(0,14),'js/life/admissions.js',...scripts.slice(14)];
if(!entry.includes('href="./html/waiting.html"') || !entry.includes('location.replace('))
 errors.push('Root index does not redirect to waiting screen.');
if(entry.includes('id="app"'))errors.push('Old fetch app host still present');
const ids={
 waiting:['fictionNotice','fictionNoticeText','skipFictionNotice','personaGender','personaName','randomName','waitingName','waitingBackground','waitingPosterMount','enterGame','rerollPersona','previewResult','birthIntro','birthIntroName','birthIntroBackground','birthIntroFamily','birthIntroTrait','birthIntroSkip','birthIntroCountdown','birthIntroProgress'],
 game:['pressureAdvice','adviceContinue','adviceStore','advicePressureProgress','adviceIllnessProgress','playerPosterMount','job','attributeRows','schools','gaugesList','traits','log','resetGame','previewSchool','previewParty','choiceDialog','modalTitle','options','summary','confirm','close','choiceTiming','nextChoiceProgress','currentChoice','lifeHeadline','sheetToggle','sheetContent','lifeSheet','startSystemDemo','advanceTurn','lifeDecisionDialog','dailyChoiceDialog','dailyChoiceBody','dailyModalHeading','dailyPaperGrip','dailyPaperConfirm','resumeDailyChoice'],
 result:['resultPosterMount','resultBack','resultTitle','resultSummary','resultFacts','shareResult','downloadResult']
};
for(const screen of screens){
 const path='html/'+screen+'.html';
 if(!exists(path)){errors.push('Missing '+path);continue;}
 const html=read(path);
 if(!/^<!doctype html>/i.test(html.trim()))errors.push('Not an independent HTML document: '+path);
 if(!html.includes('data-screen="'+screen+'"'))errors.push('Missing screen marker: '+path);
 if(!html.includes('<base href="../">'))errors.push('Missing static asset base URL: '+path);
 const matches=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
 const expected=screen==='game'?[...gameScripts.slice(0,17),'js/sheetController.js','js/dailyChoice.js',...gameScripts.slice(17)]:screen==='result'?[...scripts.slice(0,-1),'js/resultView.js',scripts.at(-1)]:scripts;
 if(JSON.stringify(matches.map(s=>s.split('?')[0]))!==JSON.stringify(expected))errors.push('Script path/order incorrect: '+path);
 if(!html.includes('href="css/style.css"')&&!html.includes('href="css/style.css?'))errors.push('Missing CSS: '+path);
 for(const source of [...matches,'css/style.css']){
  const target=resolve(root,source.split('?')[0]);
  if(!exists(target))errors.push('Missing asset '+source+' from '+path);
 }
 const idsSeen=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const id of ids[screen])if(!idsSeen.has(id))errors.push('Missing DOM element '+id+' in '+path);
}
for(const path of [...gameScripts,'js/sheetController.js','js/dailyChoice.js','js/resultView.js']){
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
const manifest=JSON.parse(read('manifest.json'));
if(manifest.scope!=='./'||manifest.start_url!=='./index.html'||manifest.display!=='standalone')errors.push('PWA manifest scope/start/display invalid');
const worker=read('sw.js'),shellMatch=/const SHELL=(\[[\s\S]*?\]);/.exec(worker);
const shell=new Set(shellMatch?JSON.parse(shellMatch[1]):[]);
try{new vm.Script(worker,{filename:'sw.js'});}catch(e){errors.push('Service worker syntax: '+e.message);}
for(const asset of shell)if(!exists(asset))errors.push('Offline shell asset missing: '+asset);
for(const path of ['index.html',...screens.map(name=>'html/'+name+'.html')]){
 const html=read(path);
 if(!html.includes('rel="manifest"')||!html.includes('rel="apple-touch-icon"')||!html.includes('favicon.ico'))errors.push('PWA/icon metadata missing: '+path);
 for(const m of html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)){
  const url=new URL(m[1],'https://test.invalid/callOfgukmin/');if(url.origin!=='https://test.invalid')continue;
  const asset=url.pathname.replace('/callOfgukmin/','');if(!shell.has(asset))errors.push('Asset absent from offline shell: '+asset);
 }
}
for(const icon of manifest.icons||[]){if(!shell.has(icon.src))errors.push('PWA icon absent from shell: '+icon.src);}
if(errors.length){console.error('Smoke FAIL:\n'+errors.map(x=>'- '+x).join('\n'));process.exitCode=1}
else console.log('Smoke OK: 3 standalone screens, asset paths, route navigation, state UI, static syntax.');
