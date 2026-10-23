/* Real-browser exam popup, cancellation, settlement and frozen-script regressions. */
import assert from 'node:assert/strict';
import {returningPage} from './browserSession.mjs';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const artifacts=process.env.BROWSER_ARTIFACTS||'/tmp/callOfgukmin-cram-popup';
await mkdir(artifacts,{recursive:true});
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));
const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'});
const base=`http://127.0.0.1:${port}/callOfgukmin/`;let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport] of [['desktop',{width:1365,height:900}],['mobile',{width:390,height:844}],['small',{width:320,height:568}]]){
  const context=await browser.newContext({viewport,hasTouch:name!=='desktop',isMobile:name!=='desktop',reducedMotion:'reduce'});
  const page=await returningPage(context),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');
  const fixture=async(category='mock',frozen=false)=>{
   await page.evaluate(({category,frozen})=>{
    GukminGame.session?.dispose();
    const p=GukminPlayer.generate();Object.assign(p,{phase:'high',age:18,job:'고등학생'});
    p.traits=['인내심'];p.stats={...p.stats,stress:16,illness:0,exam:17,schoolScore:18};
    p.attributes={schoolTrack:'science',admissionAttempts:1,pressureGuideSeen:true,pressureNoticeBand:100};
    delete p.simulation;
    const pack=GukminDirector.content(p),target=pack.choices.find(c=>c.presentation?.type==='exam'&&c.presentation.stage==='high'&&c.presentation.annual&&c.presentation.grade===2&&c.presentation.category===category);
    if(!target)throw new Error('missing actual high-school exam');
    if(frozen)target.options=target.options.filter(o=>o.id!=='cram');
    const event=pack.events.find(e=>e.choice===target.id),engine=GukminTimeline.create({...pack,persona:p}),s=engine.snapshot();
    for(const e of pack.events)s.runtime.events[e.id]={status:'completed',count:1,nextAt:e.at||0};
    s.runtime.events[event.id]={status:'unseen',count:0,nextAt:event.at};
    s.runtime.turn=event.at;s.runtime.progressStart=event.at;s.persona.simulation=s.runtime;
    if(frozen){const old=GukminTimeline.create({...pack,persona:s.persona,persist:persona=>GukminPlayer.save(persona)});old.advance(0);}else GukminPlayer.save(s.persona);
   },{category,frozen});
   await page.reload();await page.waitForFunction(()=>window.GukminGame?.session);await page.evaluate(()=>GukminGame.session.run());await page.locator('#lifeDecisionDialog[open]').waitFor();
   if(frozen){
    // Freeze the old five-option script, then restore it against current content.
    await page.reload();await page.locator('#lifeDecisionDialog[open]').waitFor();
   }
  };
  await fixture();
  const exam=page.locator('#lifeDecisionDialog'),trigger=exam.locator('.exam-cram-shortcut'),popup=page.locator('.exam-cram-dialog');
  assert.deepEqual(await exam.locator('.life-answer').evaluateAll(rows=>rows.map(r=>r.dataset.choice)),['effort-4','effort-3','effort-2','effort-1','effort-0']);
  const expected=await page.evaluate(()=>{
   const s=GukminGame.session.snapshot(),c=s.choice,option=c.options.find(o=>o.id==='cram'),preview=GukminEffects.apply(s.persona,option.result,{turn:c.openedAt,preview:true,source:'preview'});
   return {name:c.presentation.term||c.title,forecast:GukminGrades.cramOutcomes(s.persona,option.result.assessment),stress:preview.stats.stress-s.persona.stats.stress,illness:preview.stats.illness-s.persona.stats.illness};
  });
  for(const row of await exam.locator('.life-answer').all()){
   assert.match(await row.locator('.exam-score-transition').textContent(),new RegExp(expected.name));
   const token=row.locator('.exam-effect-tokens .metric-exam');
   if(await token.count())assert.match(await token.textContent(),new RegExp(expected.name));
  }
  await exam.locator('[data-choice=effort-3]').click();
  const before=await page.evaluate(()=>({persona:GukminGame.session.snapshot().persona,choice:GukminGame.session.snapshot().choice,saved:localStorage.getItem('callOfgukmin__ui__v1')}));
  const unchanged=async()=>assert.deepEqual(await page.evaluate(()=>({persona:GukminGame.session.snapshot().persona,choice:GukminGame.session.snapshot().choice,saved:localStorage.getItem('callOfgukmin__ui__v1')})),before,'opening/canceling only previews the frozen choice');
  await trigger.click();await popup.waitFor();
  assert.match(await popup.textContent(),/성공 60%/);assert.match(await popup.textContent(),/실패 40%/);assert.match(await popup.textContent(),/성공 시 \+6점/);assert.match(await popup.textContent(),/현재 점수의 10%/);
  assert.match(await popup.textContent(),new RegExp(expected.name));
  assert.match(await popup.locator('.exam-cram-success').textContent(),new RegExp(`${expected.forecast.current} → ${expected.forecast.success} / 25`));
  assert.match(await popup.locator('.exam-cram-failure').textContent(),new RegExp(`${expected.forecast.current} → ${expected.forecast.failure} / 25`));
  assert.match(await popup.locator('.metric-stress').textContent(),new RegExp(String(Math.abs(expected.stress))));
  assert.ok(expected.illness>0,'fixture crosses current student pressure cap');
  assert.match(await popup.locator('.metric-illness').textContent(),new RegExp(String(expected.illness)));
  assert.equal(await popup.locator('.exam-cram-confirm').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.height>=40;}),true,'confirm stays visible with a touch target');
  assert.equal(await popup.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&r.width<=416;}),true,'compact popup fits viewport');
  assert.equal(await popup.evaluate(e=>e.textContent.includes('🔥')),false);
  await unchanged();await page.screenshot({path:`${artifacts}/${name}-cram-popup.png`});
  await popup.locator('.exam-cram-close').click();assert.equal(await popup.count(),0);assert.equal(await trigger.evaluate(e=>document.activeElement===e),true);await unchanged();
  assert.equal(await exam.locator('[data-choice=effort-3]').getAttribute('aria-pressed'),'true');
  await trigger.click();await page.keyboard.press('Escape');assert.equal(await popup.count(),0);await unchanged();
  await trigger.click();const rect=await popup.boundingBox();await page.mouse.click(Math.max(1,rect.x-5),Math.max(1,rect.y-5));assert.equal(await popup.count(),0);await unchanged();
  await trigger.click();
  await page.evaluate(()=>document.querySelector('#lifeDecisionDialog .life-modal-collapse').click());
  assert.equal(await popup.count(),0,'fold disposes the popup');
  await page.locator('#resumeMajorChoice').click();assert.equal(await exam.locator('[data-choice=effort-3]').getAttribute('aria-pressed'),'true');await unchanged();
  await trigger.click();await page.reload();await exam.locator('.life-answer').first().waitFor();assert.equal(await popup.count(),0,'reload restores only the exam');await unchanged();
  await trigger.click();
  const settlement=await page.evaluate(()=>{
   const s=GukminGame.session.snapshot(),c=s.choice,option=c.options.find(o=>o.id==='cram');
   window.cramBeforeToken=c.token;window.cramConfirm=document.querySelector('.exam-cram-confirm');
   return {stats:GukminEffects.apply(s.persona,option.result,{turn:c.openedAt}).stats,history:s.persona.history.length};
  });
  await popup.locator('.exam-cram-confirm').click();
  const settled=await page.evaluate(()=>{window.cramConfirm.click();window.cramConfirm.click();return {snapshot:GukminGame.session.snapshot(),duplicate:GukminGame.session.resolve(window.cramBeforeToken,'cram')};});
  assert.deepEqual(settled.snapshot.persona.stats,settlement.stats,'cram commits the actual seeded result and overflow cost');
  assert.equal(settled.duplicate,false,'repeated confirms cannot settle again');assert.equal(settled.snapshot.persona.history.length,settlement.history+1);
  assert.equal(await popup.count(),0);await page.reload();assert.equal(await popup.count(),0);
  assert.deepEqual(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats),settlement.stats,'reload preserves the committed outcome');
  // An ordinary exam still uses the current exam name, the same five choices, and its original settlement.
  await fixture('school');
  const normal=await page.evaluate(()=>{const s=GukminGame.session.snapshot(),c=s.choice,o=c.options.find(o=>o.id==='effort-4');return {name:c.presentation.term||c.title,stats:GukminEffects.apply(s.persona,o.result,{turn:c.openedAt}).stats};});
  assert.match(await exam.locator('[data-choice=effort-4] .exam-score-transition').textContent(),new RegExp(normal.name));
  assert.match(await exam.locator('[data-choice=effort-4] .metric-schoolScore').textContent(),new RegExp(normal.name));
  await exam.locator('[data-choice=effort-4]').click();await exam.locator('.life-submit').click();
  assert.deepEqual(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats),normal.stats);
  await fixture('mock',true);assert.equal(await trigger.count(),0,'old five-option frozen exam never gains a cram action');assert.equal(await exam.locator('.life-answer').count(),5);
  // Unmount the actual screen while its popup is open, using the public lifecycle.
  await fixture();await trigger.click();await page.evaluate(()=>GukminGame.session.dispose());
  assert.equal(await popup.count(),0,'presenter disposal removes its separate popup');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
  console.log('PASS cram popup '+name+': exact exam labels, actual risks, cancel/focus/fold/reload, once-only settlement, frozen choices and cleanup');
  await context.close();
 }
}finally{await browser?.close();server.kill();}
