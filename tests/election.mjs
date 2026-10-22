/* Focused real campaign UI integration. Isolated browser contexts never touch player saves. */
import assert from 'node:assert/strict';
import {returningPage} from './browserSession.mjs';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'}),base=`http://127.0.0.1:${port}/callOfgukmin/`;let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport] of [['short',{width:320,height:568}],['mobile',{width:390,height:844}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await returningPage(context),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');await page.waitForFunction(()=>!!window.GukminGame?.session);
  await page.evaluate(()=>{
   localStorage.setItem('callOfgukmin__controls__v1',JSON.stringify({mode:'manual',paused:false}));
   const p=GukminPlayer.generate();p.phase='elementary';p.age=12;p.traits=[];p.roles=[];p.admissionSeed='campaign-integration';Object.assign(p.stats,{money:100000,stress:0,relations:20});p.attributes={friendRoute:'shared',pressureGuideSeen:true};
   const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p}).snapshot();
   for(const event of pack.events)s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};
   for(const event of pack.events.filter(e=>e.id==='elementary:representative'||e.id.startsWith('election:')))s.runtime.events[event.id]={status:'unseen',count:0,nextAt:event.at};
   s.runtime.turn=45;s.runtime.progressStart=45;s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);
  });await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);
  const run=()=>page.evaluate(()=>GukminGame.session.run());
  const daily=async index=>{await page.locator('#resumeDailyChoice').click();await page.locator('#dailyChoiceBody .inline-choice').nth(index).click();await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();};
  await run();await daily(0);assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.classElection),'ran');await run();await daily(2);await run();
  await page.locator('#lifeDecisionDialog.is-pledges[open]').waitFor();assert.equal(await page.locator('.pledge-card').count(),7);
  assert.ok(await page.locator('.pledge-footer .life-submit').isDisabled());
  await page.screenshot({path:'/tmp/gukmin-pledges-entry-'+name+'.png'});
  if(name!=='desktop')assert.ok(await page.locator('.pledge-card').first().evaluate(card=>{
   const bounds=card.getBoundingClientRect(),footer=document.querySelector('.pledge-footer').getBoundingClientRect(),content=document.querySelector('.pledge-content').getBoundingClientRect();
   const point=document.elementFromPoint(bounds.left+bounds.width/2,bounds.top+bounds.height/2);
   return bounds.top>=content.top&&bounds.bottom<=footer.top&&card.contains(point);
  }),'the first pledge card is fully visible on entry without scrolling or a sticky overlay');

  if(name!=='desktop'){
   const before=await page.locator('.pledge-slots').boundingBox();
   await page.locator('.pledge-content').evaluate(e=>e.scrollTop=e.scrollHeight);
   const after=await page.locator('.pledge-slots').boundingBox();assert.ok(Math.abs(before.y-after.y)<1,'rack stays fixed while the catalog scrolls');
   assert.ok(await page.locator('.pledge-dock').evaluate(dock=>{const d=dock.getBoundingClientRect(),c=document.querySelector('.pledge-content').getBoundingClientRect();return d.bottom<=c.top+1&&dock.contains(document.elementFromPoint(d.left+d.width/2,d.top+d.height/2));}),'dock and catalog have separate non-overlapping boxes');
   await page.locator('.pledge-content').evaluate(e=>e.scrollTop=0);
  }
  for(const id of ['library','quiet','lost'])await page.locator('[data-pledge='+id+']').click();
  await page.locator('[data-pledge=holiday]').click();assert.equal(await page.locator('.pledge-card[aria-pressed=true]').count(),3);
  const detail=page.locator('.support-details');assert.equal(await detail.evaluate(e=>e.open),name==='desktop');
  if(name!=='desktop'){await detail.locator('summary').click();assert.equal(await page.locator('.support-group.is-heard').isVisible(),true);await detail.locator('summary').click();}
  const draftBefore=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona)),supportBefore=await page.locator('.pledge-puzzle .support-total').textContent();
  await page.locator('.pledge-slot').nth(1).click();await page.locator('[data-pledge=football]').click();assert.equal(await page.locator('.pledge-card[aria-pressed=true]').count(),3);assert.match(await page.locator('.pledge-slot').nth(1).textContent(),/축구/);assert.notEqual(await page.locator('.pledge-puzzle .support-total').textContent(),supportBefore);
  assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona)),draftBefore,'preview never applies stats or saves a pledge');
  await page.locator('.pledge-slot').nth(1).click();await page.locator('[data-pledge=quiet]').click();
  assert.equal(await page.locator('.support-group').count(),4);assert.equal(await page.locator('.support-group.is-heard').count(),1);assert.equal(await page.locator('.pledge-slot').count(),3);

  await page.screenshot({path:'/tmp/gukmin-puzzle-'+name+'.png'});
  await page.locator('.life-modal-collapse').click();await page.locator('#resumeMajorChoice').click();assert.equal(await page.locator('.pledge-card[aria-pressed=true]').count(),3);
  assert.ok(await page.locator('.pledge-footer .life-submit').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}),'confirmation is reachable');
  assert.equal(await page.locator('#lifeDecisionDialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  await page.locator('.pledge-footer .life-submit').click();await run();
  await page.locator('#resumeDailyChoice').click();assert.equal(await page.locator('.campaign-rival').count(),2);assert.match(await page.locator('.campaign-question').textContent(),/에 대한 질문/);await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);await run();await daily(0);await run();
  await page.locator('#lifeDecisionDialog.is-pledges[open]').waitFor();assert.equal(await page.locator('.pledge-card[aria-pressed=true]').count(),3,'final editing starts with the provisional promises');await page.locator('.pledge-footer .life-submit').click();await run();
  await page.locator('.election-result').waitFor();assert.equal(await page.locator('.election-group-result').count(),4);assert.equal(await page.locator('.election-group-result').first().isVisible(),true);
  const report=await page.evaluate(()=>GukminElection.report(GukminGame.session.snapshot().persona));for(let i=0;i<3;i++)assert.match(await page.locator('.election-tally').nth(i).textContent(),new RegExp(report.candidates[i].votes+'표'));
  assert.ok(await page.locator('#lifeCinematicDismiss').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));
  await page.locator('#lifeCinematicDismiss').click();await run();
  if(report.won){for(let i=0;i<2;i++){assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().choice.id),'election:bill-'+i);const before=await page.evaluate(i=>{const p=GukminGame.session.snapshot().persona;return {money:p.stats.money,cost:GukminElection.billTarget(p,i).cost};},i);await daily(0);assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.money),before.money-before.cost);await run();}}
  await page.evaluate(()=>{
   const p=GukminGame.session.snapshot().persona;p.phase='elementary';p.attributes.electionPledges=138;p.attributes.classElection='elected';p.attributes.electionHardBill=true;
   const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p}).snapshot();delete s.runtime.cinematic;s.runtime.awaitingContinuation=false;s.runtime.choices={};s.runtime.turn=46;
   for(const event of pack.events)s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};s.runtime.events['election:bill-0']={status:'unseen',count:0,nextAt:46};s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);
  });await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);await run();await page.locator('#resumeDailyChoice').click();assert.equal(await page.locator('#dailyChoiceBody .inline-choice').first().isDisabled(),true);await page.locator('#dailyChoiceBody .inline-choice').nth(1).click();await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();
  assert.deepEqual(errors,[]);console.log('PASS campaign '+name+': nomination, hints, 3-card selection, folding/reload, rivals, actual tally and bills');await context.close();
 }
}finally{await browser?.close();server.kill();}
