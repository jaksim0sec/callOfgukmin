/* Real adult routes using the existing native choice and manual next controls. */
import assert from 'node:assert/strict';
import {returningPage} from './browserSession.mjs';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'}),base=`http://127.0.0.1:${port}/callOfgukmin/`;let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport] of [['short',{width:320,height:568}],['mobile',{width:390,height:844}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await returningPage(context),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');await page.waitForFunction(()=>!!GukminGame.session);
  await page.evaluate(()=>{
   localStorage.setItem('callOfgukmin__controls__v1',JSON.stringify({mode:'manual',paused:false}));localStorage.setItem('callOfgukmin__playable__v1','legacy-sentinel');
   const p=GukminPlayer.generate();Object.assign(p,{age:20,phase:'high',gender:'male',traits:['꼼꼼함'],familyTier:'soil',admissionSeed:'adult-browser'});Object.assign(p.stats,{stress:1,illness:0,money:6000500,relations:20});p.schoolHistory=[{id:'old-high',kind:'high',name:'기록고등학교',status:'graduated'}];p.attributes={admissionAttempts:2,admissionDestination:'college',earlyOffer:'동서울대학교 실무계열',earlyStatus:'accepted',highFinalSubmitted:true,csatSubmitted:true,pressureGuideSeen:true};
   const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p}).snapshot();for(const event of pack.events)if(!event.id.startsWith('society:'))s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};s.runtime.turn=99;p.simulation=s.runtime;GukminPlayer.save(p);
  });await page.reload();await page.waitForFunction(()=>!!GukminGame.session);await page.evaluate(()=>GukminGame.session.run());
  const dialog=page.locator('#lifeDecisionDialog.is-society[open]');await dialog.waitFor();
  const choose=async action=>{await dialog.locator('[data-action="'+action+'"]').click();await dialog.locator('.life-submit').click();if(action==='finish')return;if(!['college','career','military','politics','back','search-again','program-2','program-3'].includes(action))await page.locator('#historyNext').click();await dialog.waitFor();};
  assert.equal(await dialog.evaluate(e=>e.scrollWidth>e.clientWidth+1),false);assert.ok(await dialog.locator('.life-submit').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));await page.screenshot({path:'/tmp/gukmin-society-'+name+'.png'});
  await dialog.locator('.life-modal-collapse').click();const before=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot()));await page.locator('#resumeMajorChoice').click();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot())),before,'folding and reopening does not advance time');
  await choose('college');await choose('program-2');assert.equal(await dialog.locator('[data-action=fund-cash]').isDisabled(),false);await dialog.locator('[data-action=fund-cash]').click();await dialog.locator('.life-modal-collapse').click();await page.locator('#openConvenienceStore').click();await page.locator('#convenienceStore [data-item=water]').click();await page.locator('#convenienceStore [aria-label="편의점 닫기"]').click();await page.locator('#resumeMajorChoice').click();assert.equal(await dialog.locator('[data-action=fund-cash]').isDisabled(),true,'folded card refreshes affordability after shopping');assert.equal(await dialog.locator('.life-submit').isDisabled(),true);await choose('fund-loan');await choose('study');
  await choose('military');await choose('examine');await choose('military');await choose('army');await page.reload();await dialog.waitFor();await choose('service-balance');assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.collegeStatus),'휴학');
  await choose('college');await choose('fund-cash');await choose('network');assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.collegeStatus),'졸업');
  await choose('career');await choose('apply-local');let attempt=0;while(!await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.jobAccepted)&&attempt++<8){await choose('search-again');await choose('apply-local');}assert.ok(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.jobAccepted));await choose('accept');await choose('career');await choose('work-team');
  await choose('politics');await choose('politics-local');const p=await page.evaluate(()=>GukminGame.session.snapshot().persona);assert.ok(p.attributes.politicalEntryReady);assert.ok(p.attributes.careerMonths>=6);assert.equal(p.attributes.militaryCompletedMonths,18);assert.ok(p.schoolHistory.some(s=>s.kind==='uni'&&s.status==='graduated'));assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__playable__v1')),'legacy-sentinel');
  await choose('finish');await page.waitForURL(/result\.html/);await page.locator('#skipResultRecap').click();assert.match(await page.locator('#resultTitle').textContent(),/목소리/);assert.match(await page.locator('#resultFacts').textContent(),/병역|경력/);assert.deepEqual(errors,[]);console.log('PASS society '+name+': college, military pause/reload, graduation, job/work, political entry and result');await context.close();
 }
}finally{await browser?.close();server.kill();}
