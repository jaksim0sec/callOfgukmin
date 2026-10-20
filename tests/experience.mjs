/* Interaction regressions against real life content, including short mobile screens. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const artifacts=process.env.BROWSER_ARTIFACTS||'/tmp/callOfgukmin-experience';
await mkdir(artifacts,{recursive:true});
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));
const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'});
const base=`http://127.0.0.1:${port}/callOfgukmin/`;
let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport] of [['short',{width:320,height:568}],['mobile',{width:390,height:844}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,hasTouch:name!=='desktop',isMobile:name!=='desktop',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');await page.locator('#dailyChoiceDialog[open]').waitFor();
  await page.locator('#dailyModalCollapse').click();
  await page.locator('#traits .trait-control').first().click();
  assert.ok(await page.locator('#traitInfo').isVisible(),'trait explanation works without hover');
  await page.locator('#traits .trait-control').first().click();
  assert.equal(await page.locator('#traitInfo').isVisible(),false);
  const record=page.locator('#log .record').first();
  await record.evaluate(el=>el.dataset.identity='keep');
  await page.evaluate(()=>GukminGame.session.run());
  assert.equal(await page.locator('#log .record').first().getAttribute('data-identity'),'keep','unchanged timeline does not recreate existing history');
  // An actual long daily story has four aptitude options, not a synthetic DOM fixture.
  const walk=async target=>page.evaluate(target=>{
   const engine=GukminGame.session;
   for(let i=0;i<110;i++){
    const scene=document.getElementById('lifeCinematic');
    if(scene&&!scene.hidden)document.getElementById('lifeCinematicDismiss').click();
    const s=engine.snapshot(),c=s.choice;
    if(s.reviewPending){engine.run();continue;}
    if(!c){engine.run();if(engine.snapshot().choice||engine.snapshot().reviewPending)continue;return undefined;}
    if(c.id===target||c.presentation?.type===target)return c.id;
    engine.resolve(c.token,(c.options.find(o=>o.id==='effort-2'&&o.available)||c.options.find(o=>o.available)).id);
   }
   throw new Error('unreachable '+target);
  },target);
  await walk('elementary:interest-exploration');
  await page.locator('#dailyChoiceDialog[open]').waitFor();
  assert.equal(await page.locator('#dailyChoiceDialog').evaluate(d=>getComputedStyle(d).display),'flex','daily header and body share bounded flex layout');
  await page.locator('#dailyChoiceBody .inline-choice').last().scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#dailyModalCollapse').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'collapse remains visible while options scroll');
  const size=await page.locator('#dailyChoiceDialog').boundingBox();assert.ok(size.y>=0&&size.y+size.height<=viewport.height+1);
  await page.screenshot({path:`${artifacts}/${name}-daily.png`});
  await page.locator('#dailyChoiceBody .inline-choice').nth(2).click();
  assert.match(await page.locator('#log .record-choice').first().textContent(),/관심.*예체능/,'exploration is described as an interest in the result');
  await walk('exam');
  await page.locator('#lifeDecisionDialog[open]').waitFor();
  await page.reload();await page.locator('#lifeDecisionDialog[open]').waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#lifeDecisionDialog').isVisible(),false);
  assert.equal(await page.locator('#currentChoice .major-choice-reopen').count(),1,'reload keeps the major reopen control after final render');
  assert.ok(await page.locator('#resumeMajorChoice').isVisible(),'major choice can reopen while mobile sheet is collapsed');
  await page.locator('#resumeMajorChoice').click();
  assert.ok(await page.locator('#lifeDecisionDialog').isVisible());
  assert.ok(await page.locator('#lifeDecisionDialog .life-modal-collapse').isVisible(),'touch users can collapse the exam');
  await page.locator('#lifeDecisionDialog .life-answer').nth(2).click();
  await page.locator('#lifeDecisionDialog .life-modal-collapse').click();
  await page.locator('#resumeMajorChoice').click();
  assert.equal(await page.locator('#lifeDecisionDialog .life-answer[aria-pressed=true]').count(),1,'folding retains the selection');
  const realPreview=await page.evaluate(()=>{
   const snap=GukminGame.session.snapshot(),choice=snap.choice,option=choice.options[2];
   const projected=GukminEffects.apply(snap.persona,option.result,{turn:snap.runtime.turn});
   return projected.stats.schoolScore-snap.persona.stats.schoolScore;
  });
  const badges=await page.locator('#lifeDecisionDialog .life-answer').nth(2).locator('.life-effects').textContent();
  assert.ok(badges.includes('내신 +'+realPreview),'exam badges include real conditional and trait bonuses');
  await page.screenshot({path:`${artifacts}/${name}-exam.png`});
  await page.locator('#lifeDecisionDialog .life-submit').click();
  assert.ok(await page.locator('#lifeCinematicDismiss').isVisible(),'result remains until acknowledged');
  assert.match(await page.locator('.life-cinematic-grade').textContent(),/\(\d+(?:\.\d+)?\)/,'same-grade results still expose actual score changes');
  await page.locator('#lifeCinematicDismiss').click();
  await walk('school');await page.locator('#lifeDecisionDialog[open]').waitFor();
  if(name!=='desktop'){
   const metrics=await page.locator('.status>.gauges').evaluate(card=>{
    const last=card.querySelector('.gauges-list').lastElementChild;
    return {card:card.getBoundingClientRect().bottom,last:last.getBoundingClientRect().bottom};
   });
   assert.ok(metrics.last<=metrics.card+1,'all student metrics fit inside their natural-height card');
  }
  const locked=page.locator('#lifeDecisionDialog .life-answer-locked');
  if(await locked.count())assert.equal(await locked.first().evaluate(e=>getComputedStyle(e).opacity),'1','unavailable school requirements stay legible');
  await page.locator('#lifeDecisionDialog .life-answer').last().scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#lifeDecisionDialog .life-submit').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'school confirmation stays visible when options scroll');
  await page.screenshot({path:`${artifacts}/${name}-schools.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.deepEqual(errors,[]);
  console.log('PASS experience '+name+': long choices, truthful interests, major fold/reopen/reload, grade review and school footer');
  await context.close();
 }
 // A complete life driven only by visible controls; no session.run/resolve shortcuts.
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.goto(base+'html/game.html');await page.locator('#dailyChoiceDialog[open]').waitFor();
 let completed=false,decisions=0;
 for(let i=0;i<180;i++){
  const state=await page.evaluate(()=>GukminGame.session.snapshot());
  assert.equal(await page.evaluate(()=>!document.getElementById('lifeCinematic').hidden&&!!document.querySelector('dialog[open]')),false,'a transition never competes with a native choice dialog');
  if(await page.locator('#dailyChoiceDialog').isVisible()){
   await page.locator('#dailyChoiceBody .inline-choice:not(:disabled)').first().click();decisions++;
  }else if(await page.locator('#lifeDecisionDialog').isVisible()){
   const index=state.choice?.presentation?.type==='exam'?2:0;
   await page.locator('#lifeDecisionDialog .life-answer:not(:disabled)').nth(index).click();
   await page.locator('#lifeDecisionDialog .life-submit').click();decisions++;
  }else if(await page.locator('#lifeCinematicDismiss').isVisible()){
   await page.locator('#lifeCinematicDismiss').click();
  }else if(state.reviewPending){
   assert.ok(await page.locator('#log .continue-story').first().isVisible(),'a settled decision exposes its next-story action without another gesture');
   await page.locator('#log .continue-story').first().click();
  }else if(state.runtime.events['high:graduation']?.status==='completed'){
   completed=true;break;
  }else await page.waitForTimeout(30);
 }
 assert.ok(completed,'visible UI reaches the current chapter boundary');assert.ok(decisions>=30);
 assert.equal(await page.locator('.life-chapter-complete').isVisible(),true);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:`${artifacts}/mobile-complete-visible-controls.png`,fullPage:true});
 console.log('PASS visible-controls life: '+decisions+' decisions, result acknowledgements, actual chapter completion');
 await context.close();
}finally{await browser?.close();server.kill();}
