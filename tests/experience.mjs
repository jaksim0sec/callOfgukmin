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
 if(!['checkpoints','balance'].includes(process.env.EXPERIENCE_SCOPE))for(const [name,viewport] of [['short',{width:320,height:568}],['mobile',{width:390,height:844}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,hasTouch:name!=='desktop',isMobile:name!=='desktop',reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');await page.locator('#resumeDailyChoice').click();
  await page.keyboard.press('Escape');
  await page.locator('#traits .trait-control').first().click();
  assert.ok(await page.locator('#traitInfo').isVisible(),'trait explanation works without hover');
  await page.locator('#traitDialog .close').click();
  assert.equal(await page.locator('#traitDialog').isVisible(),false);
  const record=page.locator('#log .record').first();
  await record.evaluate(el=>el.dataset.identity='keep');
  await page.evaluate(()=>GukminGame.session.run());
  assert.equal(await page.locator('#log .record').first().getAttribute('data-identity'),'keep','unchanged timeline does not recreate existing history');
  // An actual long daily story has four aptitude options, not a synthetic DOM fixture.
  const walk=async target=>page.evaluate(target=>{
   const engine=GukminGame.session;
   for(let i=0;i<110;i++){
    if(document.getElementById('pressureAdvice').open)document.getElementById('adviceContinue').click();
    const scene=document.getElementById('lifeCinematic');
    if(scene&&!scene.hidden)document.getElementById('lifeCinematicDismiss').click();
    const s=engine.snapshot(),c=s.choice;
    if(s.reviewPending){engine.run();continue;}
    if(!c){engine.run();if(engine.snapshot().choice||engine.snapshot().reviewPending)continue;return undefined;}
    if(c.id===target||c.presentation?.type===target)return c.id;
    engine.resolve(c.token,(c.options.find(o=>o.id===(s.persona.stats.stress>=12?'effort-0':'effort-2')&&o.available)||c.options.find(o=>o.available)).id);
   }
   throw new Error('unreachable '+target);
  },target);
  await walk('elementary:interest-exploration');
  await page.locator('#resumeDailyChoice').click();
  assert.equal(await page.locator('#dailyChoiceDialog').evaluate(d=>getComputedStyle(d).display),'flex','daily header and body share bounded flex layout');
  await page.locator('#dailyChoiceBody .inline-choice').last().scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#dailyPaperGrip').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'paper grip stays visible while options scroll');
  const size=await page.locator('#dailyChoiceDialog').boundingBox();assert.ok(size.y>=0&&size.y+size.height<=viewport.height+1);
  await page.screenshot({path:`${artifacts}/${name}-daily.png`});
  await page.locator('#dailyChoiceBody .inline-choice').nth(2).click();
  await page.locator('#dailyPaperConfirm').click();
  await page.waitForFunction(()=>document.querySelector('#dailyChoiceDialog').classList.contains('is-reward'));
  assert.equal(await page.locator('#dailyPaperConfirm').textContent(),'보상 받기');
  await page.locator('#dailyPaperConfirm').click();
  await page.waitForFunction(()=>!document.querySelector('#dailyChoiceDialog').open);
  assert.equal(await page.locator('#dailyPaperResult').count(),0,'no redundant reward page');
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
  await page.locator('#lifeDecisionDialog .life-answer[data-choice=effort-3]').click();
  await page.locator('#lifeDecisionDialog .life-modal-collapse').click();
  await page.locator('#resumeMajorChoice').click();
  assert.equal(await page.locator('#lifeDecisionDialog .life-answer[aria-pressed=true]').count(),1,'folding retains the selection');
  const realPreview=await page.evaluate(()=>{
   const snap=GukminGame.session.snapshot(),choice=snap.choice,option=choice.options[3];
   const projected=GukminEffects.apply(snap.persona,option.result,{turn:snap.runtime.turn});
   return projected.stats.schoolScore-snap.persona.stats.schoolScore;
  });
  const effect=await page.locator('#lifeDecisionDialog .life-answer[data-choice=effort-3]').locator('.life-effects .metric-schoolScore').first();
  assert.equal(await effect.locator('.impact-amount').textContent(),Math.abs(realPreview).toLocaleString('ko-KR'),
   'exam preview calculates the same actual numeric value including conditional trait modifiers');
  assert.ok(await effect.locator('.impact-arrow').count()>0,'exam direction is rendered with the shared triangle SVG');
  assert.match(await effect.getAttribute('aria-label'),/내신.*증가/,'the arrow includes accessible direction text');
  await page.screenshot({path:`${artifacts}/${name}-exam.png`});
  await page.locator('#lifeDecisionDialog .life-submit').click();
  assert.ok(await page.locator('#lifeCinematicDismiss').isVisible(),'result remains until acknowledged');
  assert.match(await page.locator('.life-cinematic-grade').textContent(),/\(\d+(?:\.\d+)?\)/,'same-grade results still expose actual score changes');
  await page.locator('#lifeCinematicDismiss').click();
  await walk('school');await page.locator('#lifeDecisionDialog[open]').waitFor();
  if(name!=='desktop'){
   const metrics=await page.locator('.status>.gauges').evaluate(card=>{
    card.scrollTop=card.scrollHeight;
    return {height:card.clientHeight,scrollHeight:card.scrollHeight,scrolled:card.scrollTop,overflow:getComputedStyle(card).overflowY};
   });
   assert.ok(metrics.height>0&&metrics.scrollHeight>metrics.height&&metrics.scrolled>0&&metrics.overflow==='auto','long student stats scroll inside the fixed poster-height panel');
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
 // Whole lives driven only by visible controls; the second builds a character and repeats a risky routine.
 if(!['checkpoints','balance'].includes(process.env.EXPERIENCE_SCOPE))for(const itinerary of ['default','creative-habit']){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.goto(base+'html/game.html');await page.locator('#resumeDailyChoice').waitFor({state:'visible'});
 let completed=false,decisions=0,reloadedContact=false,specialtyUsed=false,sawRevelation=false,invitationSeen=false,sawMetricSummary=false;
 for(let i=0;i<500;i++){
  if(await page.locator('#pressureAdvice').isVisible()){await page.locator('#adviceContinue').click();continue;}
  const preparation=page.getByText('기말고사 준비 기간',{exact:true});
  if(await preparation.isVisible()){await preparation.waitFor({state:'hidden'});continue;}
  const state=await page.evaluate(()=>GukminGame.session.snapshot());
  assert.equal(await page.evaluate(()=>!document.getElementById('lifeCinematic').hidden&&!!document.querySelector('dialog[open]')),false,'a transition never competes with a native choice dialog');
  if(await page.locator('#dailyChoiceDialog').isVisible()){
   if(state.reviewPending){await page.locator('#dailyPaperConfirm').click();continue;}
   const choice=await page.evaluate(()=>GukminGame.session.snapshot().choice);
   if(!choice)continue;
   let option=choice.options.find(o=>o.available);
   if(itinerary==='creative-habit'){
    const ids={'elementary:interest-exploration':'choice-2','elementary:interest-followup':'choice-2',
     'middle:resources':'showcase','high:tobacco-offer':'choice-2','high:break-routine':'repeat',
     'high:teamwork':'specialty','high:smoking-followup':'choice-2','high:family-time':'decline'};
    const wanted=ids[choice.id];if(wanted)option=choice.options.find(o=>o.id===wanted&&o.available)||option;
    if(choice.id==='high:tobacco-offer'){
     invitationSeen=true;
     assert.equal(await page.locator('#dailyChoiceBody .trait-negative').count(),0,'first invitation does not announce the future habit');
     assert.equal(await page.locator('#dailyChoiceBody .daily-choice-effect.metric-health').count(),0,'retired health never appears in a preview');assert.ok(await page.locator('#dailyChoiceBody .daily-choice-effect.metric-relations').count()>0,'first acceptance shows the actual relationship benefit');
     await page.screenshot({path:`${artifacts}/habit-invitation.png`});
    }
    if(choice.id==='high:teamwork'){
     assert.ok(option.id==='specialty'&&(/영상|편집/.test(option.requirement)));
     assert.ok(await page.locator('#dailyChoiceBody .daily-choice-advantage').count());
     for(const impact of await page.locator('#dailyChoiceBody .inline-choice').first().locator('.metric-schoolScore').all())assert.match(await impact.getAttribute('aria-label'),/감소/,'gamble preview shows only its definite study cost');
     specialtyUsed=true;await page.screenshot({path:`${artifacts}/creative-project.png`});
    }
    if(choice.id==='high:smoking-followup'){
     assert.ok(state.persona.traits.includes('흡연'));
     assert.ok(state.persona.history.some(h=>/흡연|점심 뒤/.test(h.title)));
     sawRevelation=true;await page.screenshot({path:`${artifacts}/habit-revelation.png`});
    }
   }
   await page.locator('#dailyChoiceBody .inline-choice').nth(choice.options.findIndex(o=>o.id===option.id)).click();
   await page.locator('#dailyPaperConfirm').click();decisions++;
   assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().reviewPending),true,'result waits in the original paper or election cutscene');
   if(await page.locator('#log .record-choice .record-impacts .metric-impact .impact-arrow').count()){
    sawMetricSummary=true;
   }
   assert.equal(await page.locator('#dailyPaperResult').count(),0,'routine decisions do not open a reward page');
   assert.equal(await page.locator('#log .record-choice .continue-story').count(),0,'no extra acknowledgement click');
   if(itinerary==='creative-habit'&&choice.id==='high:tobacco-offer'&&!reloadedContact){
    const saved=await page.evaluate(()=>GukminGame.session.snapshot().persona);
    assert.equal(saved.attributes.habitStage,'first');assert.equal(saved.traits.includes('흡연'),false);
    await page.reload();await page.locator('#log .record-choice').first().waitFor();reloadedContact=true;
   }
  }else if(await page.locator('#lifeDecisionDialog').isVisible()){
   const category=await page.evaluate(()=>GukminGame.session.snapshot().choice?.presentation?.type);
   if(category==='grade-seal'){
    assert.equal(await page.locator('#lifeDecisionDialog .life-paper-estimate').count(),0,'sealed result has no grade forecast');
    assert.equal(await page.locator('#lifeDecisionDialog .admission-big-grade').count(),0,'grade hidden until submission');
   }
   if(category!=='grade-seal'){
    const index=category==='exam'?(state.persona.stats.stress>=8?0:2):0;
    if(category==='admission-finish'){const button=page.locator('#lifeDecisionDialog [data-choice=employment]');if(await button.count())await button.click();}
    const selector=['exam','school'].includes(category)?'.life-answer:not(:disabled)':
     '.admission-choices button:not([hidden]):not(:disabled)';
    if(category==='exam')await page.locator('#lifeDecisionDialog [data-choice=effort-'+index+']').click();else if(category!=='admission-finish')await page.locator('#lifeDecisionDialog '+selector).nth(index).click();
   }
   await page.locator('#lifeDecisionDialog .life-submit').click();decisions++;
   if(category==='grade-seal'){
    const grade=page.locator('.life-cinematic-card.is-sealed .life-cinematic-grade strong');
    await grade.waitFor({state:'visible'});
    assert.match(await grade.textContent(),/[1-9]등급/,'actual grade appears only after submit');
   }
  }else if(await page.locator('#lifeCinematicDismiss').isVisible()){
   await page.locator('#lifeCinematicDismiss').click();
  }else if(state.reviewPending){
   if(await page.getByText('기말고사 준비 기간',{exact:true}).isVisible())continue;
   const button=page.locator('#log .continue-story:visible').first();
   if(!await button.count())continue;
   await button.click({timeout:1500}).catch(async e=>{const pending=await page.evaluate(()=>GukminGame.session.snapshot().reviewPending);if(pending)throw e;});
  }else if(state.choice?.layer==='일상 선택'){
   assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'new routine popup is never forced open');
   await page.locator('#resumeDailyChoice').click();
  }else if(state.persona.attributes?.lifeEndReason||state.persona.attributes?.retryEndReason||['college','employment'].includes(state.persona.attributes?.admissionDestination)||['high:graduation','admission:retry-graduation'].some(id=>state.runtime.events[id]?.status==='completed')){
   completed=true;break;
  }else await page.waitForTimeout(30);
 }
 if(!completed){console.log('STUCK',await page.evaluate(()=>({choice:GukminGame.session.snapshot().choice?.id,review:GukminGame.session.snapshot().reviewPending,cin:document.getElementById('lifeCinematic').hidden,dialogs:[...document.querySelectorAll('dialog[open]')].map(e=>e.id),turn:GukminGame.session.snapshot().runtime.turn})));await page.screenshot({path:artifacts+'/stuck.png'});}
 assert.ok(completed,'visible UI reaches the current chapter boundary');assert.ok(decisions>=30);
 assert.ok(sawMetricSummary,'real decisions summarize settled metric changes in permanent history');
 assert.equal(await page.locator('.life-chapter-complete').isVisible(),true);
 assert.deepEqual(errors,[]);
 if(itinerary==='creative-habit'){
  assert.ok(invitationSeen&&specialtyUsed&&sawRevelation&&reloadedContact,'the route uses its built skill and delayed consequence after reload');
  const final=await page.evaluate(()=>GukminGame.session.snapshot().persona);
  assert.equal(final.attributes.projectStyle,'media');assert.equal(final.attributes.habitStage,'entrenched');
  assert.ok(final.history.some(h=>h.title==='비워 둔 복습 시간'),'continued routine affects the later assessment');
 }
 await page.screenshot({path:`${artifacts}/mobile-complete-${itinerary}.png`,fullPage:true});
 console.log('PASS visible-controls '+itinerary+': '+decisions+' decisions, rewards in the same paper, actual chapter completion');
 await context.close();
 }
 // Focused real-content checkpoints cover outcomes without replaying an entire life for each screen.
 if(process.env.EXPERIENCE_SCOPE!=='balance')for(const [name,viewport] of [['short',{width:320,height:568}],['mobile',{width:390,height:844}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto(base+'html/game.html');
  const seed=async(id,patch={})=>{
   if(!page.url().includes('/game.html')){await page.evaluate(()=>GukminPlayer.save(GukminPlayer.generate()));await page.goto(base+'html/game.html');}
   await page.evaluate(({id,patch})=>{
    const p=GukminPlayer.generate();Object.assign(p,{phase:'high',age:18,job:'고등학생',traits:['문과','꼼꼼함','인내심'],schoolHistory:[{id:'fixture-high',kind:'high',name:'세종과학고등학교',status:'enrolled'}]});p.stats={...p.stats,schoolScore:23,exam:24,money:1000000,stress:8,health:80,relations:16,...patch.stats};p.attributes={admissionAttempts:1,schoolTrack:'science',admissionResearch:'official',pressureGuideSeen:true,pressureNoticeBand:6,...patch.attributes};Object.assign(p,Object.fromEntries(Object.entries(patch).filter(([k])=>!['stats','attributes','accepted'].includes(k))));
    const pack=GukminDirector.content(p),target=pack.events.find(e=>e.id===id);if(!target)throw new Error('fixture event missing '+id);
    if(id.endsWith('early-result')){const o=pack.choices.find(c=>c.id==='admission:first:early-application').variants[0].options[0];p.attributes.earlyChoice=o.id;for(let i=0;i<100;i++){p.admissionSeed='fixture-'+i;if((GukminAdmissions.roll(p,'admission:first|early|'+o.school.name)<GukminAdmissions.probability(p,o.school,'early'))===patch.accepted)break;}}
    const engine=GukminTimeline.create({...pack,persona:p}),s=engine.snapshot();for(const e of pack.events)s.runtime.events[e.id]={status:'completed',count:1,nextAt:e.at||0};s.runtime.events[id]={status:'unseen',count:0,nextAt:target.at};if(id==='middle:1:1학기-중간고사'){const final=pack.events.find(e=>e.id==='middle:1:1학기-기말고사');s.runtime.events[final.id]={status:'unseen',count:0,nextAt:final.at};}s.runtime.turn=target.at;s.runtime.progressStart=target.at;s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);
   },{id,patch});await page.reload();
  };
  const checkPaper=async()=>{const d=page.locator('#lifeDecisionDialog[open]');await d.waitFor();const b=await d.boundingBox();assert.ok(b.x>=0&&b.x+b.width<=viewport.width+1&&b.y>=0&&b.y+b.height<=viewport.height+1);assert.ok(await d.locator('.life-submit').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),'confirmation stays reachable');assert.equal(await d.evaluate(e=>e.scrollWidth>e.clientWidth+1),false);assert.ok(await d.locator('.admission-row').evaluateAll(rows=>rows.every(row=>row.scrollHeight<=row.clientHeight+1)),'application rows retain enough height for their cost and probability text');};
  await seed('elementary:interest-followup',{phase:'elementary',age:10,job:'초등학생',traits:['관심-이과'],schoolHistory:[]});await page.locator('#resumeDailyChoice').click();const follow=page.locator('#dailyChoiceBody .inline-choice').nth(1);assert.equal(await follow.locator('.interest-transition').count(),1);await follow.click();await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();assert.equal(await page.locator('.daily-reward-tokens .interest-transition').count(),1);assert.equal(await page.locator('.daily-reward-tokens .token-trait:not(.trait-developing)').count(),1,'formal aptitude is not duplicated');await page.screenshot({path:`${artifacts}/${name}-interest-conversion.png`});
  await seed('high:2:2학년-내신-종합-준비',{age:17});await checkPaper();assert.deepEqual(await page.locator('.life-exam-paper .life-answer').evaluateAll(nodes=>nodes.map(n=>n.dataset.choice)),['effort-4','effort-3','effort-2','effort-1','effort-0']);assert.match(await page.locator('.exam-fit-note').textContent(),/압박/);assert.ok(await page.locator('.assessment-source .token-trait').count()>0);await page.screenshot({path:`${artifacts}/${name}-applied-traits.png`});
  await seed('admission:first:final-report');await checkPaper();await page.locator('.life-submit').click();await page.locator('#lifeCinematic:not([hidden])').waitFor();assert.equal(await page.locator('.life-cinematic-arrow').count(),0);assert.match(await page.locator('.life-cinematic-grade').textContent(),/최종 내신.*등급/);await page.screenshot({path:`${artifacts}/${name}-final-report.png`});
  await seed('admission:first:early-application',{attributes:{admissionRoute:'early',highFinalSubmitted:true}});await checkPaper();assert.ok(await page.locator('.admission-row .school-placeholder').count()>1);await page.locator('[data-field=science]').click();assert.match(await page.locator('.admission-choice-title').first().textContent(),/자연·공학/);await page.screenshot({path:`${artifacts}/${name}-university.png`});await page.locator('.admission-row').first().click();await page.locator('.life-submit').click();assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.admissionField),'science');
  for(const elected of [true,false]){
   await seed('elementary:representative',{phase:'elementary',age:11,job:'초등학생',traits:[],schoolHistory:[],stats:{relations:elected?20:12},attributes:{schoolTrack:'general'}});await page.locator('#resumeDailyChoice').click();await page.locator('#dailyChoiceBody .inline-choice').first().click();await page.locator('#dailyPaperConfirm').click();await page.locator('.election-result').waitFor();assert.match(await page.locator('.election-result').textContent(),elected?/내가 뽑혔다/:/아쉽|아쉬운/);assert.equal(await page.locator('dialog[open]').count(),0);const before=await page.evaluate(()=>GukminGame.session.snapshot().persona);await page.reload();await page.locator('.election-result').waitFor();assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.traits.filter(t=>t==='리더십').length),elected?1:0);assert.deepEqual(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats),before.stats);await page.screenshot({path:`${artifacts}/${name}-election-${elected}.png`});
  }
  for(const accepted of [true,false]){
   await seed('admission:first:early-result',{accepted,attributes:{admissionRoute:'early'}});await page.locator('.is-admission-result').waitFor();assert.equal(await page.locator('.admission-verdict').textContent(),accepted?'합격':'불합격');assert.equal(await page.locator('.cinematic-stamp').textContent(),accepted?'합격':'불합격');assert.equal(await page.locator('.cinematic-stamp').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,'stamp text fits on one line');const state=await page.evaluate(()=>GukminGame.session.snapshot());assert.equal(state.persona.attributes.earlyStatus,accepted?'accepted':'failed');assert.equal(await page.locator('dialog[open]').count(),0);await page.reload();await page.locator('.is-admission-result').waitFor();assert.deepEqual(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes),state.persona.attributes);await page.screenshot({path:`${artifacts}/${name}-admission-${accepted}.png`});
  }
  for(const [reason,patch] of [['준비 자금 소진',{stats:{money:300000}}],['정신병 한계',{stats:{stress:25,illness:3}}],['나이 제한',{age:29}]]){
   await seed('admission:second:destination',{age:20,job:'N수생',attributes:{admissionAttempts:2,admissionRoute:'regular',highFinalSubmitted:true},...patch});await checkPaper();await page.locator('[data-choice=retry]').click();await page.locator('.life-submit').click();await page.waitForURL('**/result.html?*');await page.locator('#skipResultRecap').click();assert.match(await page.locator('#resultSummary').textContent(),new RegExp(reason));await page.screenshot({path:`${artifacts}/${name}-retake-${reason}.png`});
  }
  await seed('middle:admission-prep',{phase:'middle',age:15,job:'중학생',stats:{schoolScore:21},attributes:{schoolTrack:'general'}});await page.locator('#resumeDailyChoice').click();await page.locator('#dailyChoiceBody .inline-choice').nth(2).click();await page.locator('#dailyPaperConfirm').click();await page.locator('.admission-guidance').waitFor();assert.ok(await page.locator('.admission-guidance strong').count()>=3,'counseling has actual structured headings');await page.screenshot({path:`${artifacts}/${name}-counseling.png`});
  await seed('admission:first:route',{attributes:{admissionAttempts:1,csatSubmitted:false}});assert.match(await page.locator('.admission-grade-strip').textContent(),/수능미응시/);assert.equal(await page.locator('[data-choice=regular] .admission-big-grade').textContent(),'응시 전');
  await seed('high:recover',{stats:{stress:25,illness:5},attributes:{schoolTrack:'general'}});await page.waitForURL('**/result.html?*');await page.locator('#skipResultRecap').click();assert.match(await page.locator('#resultSummary').textContent(),/정신병 한계/);
  if(name==='short'){
   await page.emulateMedia({reducedMotion:'no-preference'});
   await seed('elementary:representative',{phase:'elementary',age:11,job:'초등학생',traits:[],schoolHistory:[],stats:{relations:16},attributes:{schoolTrack:'general'}});await page.locator('#resumeDailyChoice').click();await page.locator('#dailyChoiceBody .inline-choice').first().click();await page.locator('#dailyPaperConfirm').click();await page.locator('.election-ballot-box').waitFor();assert.equal(await page.locator('#lifeCinematicDismiss').textContent(),'건너뛰기');const settled=await page.evaluate(()=>GukminGame.session.snapshot().persona.stats);await page.locator('#lifeCinematicDismiss').click();assert.match(await page.locator('.election-tally').first().textContent(),/16표/);assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'skip stops at the result');await page.locator('#lifeCinematicDismiss').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();assert.deepEqual(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats),settled);
   await seed('middle:1:1학기-중간고사',{phase:'middle',age:13,job:'중학생',schoolHistory:[],attributes:{schoolTrack:'general'}});await page.locator('.life-answer').nth(2).click();await page.locator('.life-submit').click();await page.locator('.life-cinematic-grade').waitFor();const start=Date.now();await page.locator('#lifeCinematicDismiss').click();await page.getByText('기말고사 준비 기간',{exact:true}).waitFor();assert.equal(await page.locator('#lifeCinematic').isVisible(),false,'the main screen is visible during preparation');await page.locator('#lifeDecisionDialog[open]').waitFor();assert.ok(Date.now()-start>=1300,'preparation pause returns to the main screen before the next exam');
  }
  assert.deepEqual(errors,[]);console.log('PASS checkpoints '+name+': applied traits, sealed grades, both election/admission outcomes, fields, three retake limits and restore');await context.close();
 }
 if(!process.env.EXPERIENCE_SCOPE||process.env.EXPERIENCE_SCOPE==='balance')for(const [name,viewport] of [['short',{width:320,height:568}],['mobile',{width:390,height:844}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');await page.locator('#resumeDailyChoice').click();
  assert.equal(await page.locator('#dailyChoiceBody .daily-choice-effects,#dailyChoiceBody .daily-choice-risk,#dailyChoiceBody .daily-choice-outlook,#dailyChoiceBody .interest-transition').count(),0,'childhood rewards stay hidden until commitment');
  await page.locator('#dailyChoiceBody .inline-choice').first().click();assert.equal(await page.locator('#dailyChoiceBody .daily-choice-effects').count(),0);await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();assert.ok(await page.locator('.daily-reward-tokens .token-trait').count()>0,'actual childhood reward is disclosed after confirmation');
  await page.evaluate(()=>{
   const p=GukminPlayer.generate();Object.assign(p,{phase:'high',age:17,job:'고등학생',traits:[]});Object.assign(p.stats,{stress:23,money:100000,schoolScore:19,exam:21});p.attributes={schoolTrack:'science',admissionAttempts:1,pressureGuideSeen:true,pressureNoticeBand:6};
   const pack=GukminDirector.content(p),event=pack.events.find(e=>e.id==='high:tobacco-offer'),t=GukminTimeline.create({...pack,persona:p}),s=t.snapshot();
   for(const e of pack.events)s.runtime.events[e.id]={status:'completed',count:1,nextAt:e.at||0};s.runtime.events[event.id]={status:'unseen',count:0,nextAt:event.at};s.runtime.turn=event.at;s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);
  });await page.reload();await page.locator('.metric-stress .gauge-value').waitFor();assert.equal(await page.locator('.metric-stress .gauge-value').textContent(),'23');
  const before=await page.evaluate(()=>GukminGame.session.snapshot());assert.equal(before.choice.scenarioId,'senior-invitation','science school also receives first tobacco contact');
  assert.equal(await page.locator('.metric-stress progress').getAttribute('max'),'25');assert.equal(await page.locator('.metric-relations progress').getAttribute('max'),'25');
  await page.locator('#openConvenienceStore').click();await page.locator('#convenienceStore[open]').waitFor();assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false);
  await page.screenshot({path:`${artifacts}/${name}-balance-store.png`});await page.locator('#storeItems .store-buy').first().click();assert.match(await page.locator('#storeNotice').textContent(),/구매 완료/);await page.locator('#convenienceStore .close').click();await page.locator('#convenienceStore').waitFor({state:'hidden'});
  const after=await page.evaluate(()=>GukminGame.session.snapshot());assert.equal(after.persona.stats.money,before.persona.stats.money-1000);assert.equal(after.persona.stats.stress,22);assert.equal(after.runtime.turn,before.runtime.turn);assert.equal(await page.locator('#stressWarning').count(),0,'warning stays in its dedicated popup');
  await page.reload();await page.locator('#openConvenienceStore').click();assert.equal(await page.locator('#storeItems button:not(:disabled)').count(),0);assert.match(await page.locator('#storeNotice').textContent(),/4턴/);
  assert.equal(await page.locator('#convenienceStore').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);assert.deepEqual(errors,[]);console.log('PASS balance '+name+': hidden childhood rewards, 25-point gauges, universal first contact, warning, purchase and saved cooldown');await context.close();
 }
}finally{await browser?.close();server.kill();}
