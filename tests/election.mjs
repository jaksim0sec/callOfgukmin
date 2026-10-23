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
  const context=await browser.newContext({viewport,reducedMotion:'reduce',hasTouch:name!=='desktop'}),page=await returningPage(context),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
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
  await run();await daily(0);assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.classElection),'ran');await run();await page.locator('#lifeDecisionDialog.is-election-survey[open]').waitFor();assert.equal(await page.locator('#lifeDecisionDialog .election-context-tools button').count(),2);assert.equal(await page.locator('.survey-group').count(),4);assert.equal(await page.locator('.survey-people').count(),0);await page.screenshot({path:'/tmp/gukmin-election-survey-'+name+'.png'});const beforeSurvey=await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.stress);await page.locator('.survey-group[data-group=quiet]').click();assert.equal(await page.locator('.survey-cost .metric-stress .impact-amount').textContent(),'2');await page.locator('.survey-group[data-group=play]').click();assert.equal(await page.locator('.survey-group[aria-pressed=true]').count(),2);assert.equal(await page.locator('.survey-cost .metric-stress .impact-amount').textContent(),'3');await page.locator('.survey-group[data-group=play]').click();assert.equal(await page.locator('.survey-cost .metric-stress .impact-amount').textContent(),'2');await page.locator('.survey-footer .life-submit').click();assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.stress),beforeSurvey+2);await run();
  await page.locator('#lifeDecisionDialog.is-pledges[open]').waitFor();assert.equal(await page.locator('.pledge-card').count(),7);
  assert.ok(await page.locator('.pledge-footer .life-submit').isDisabled());
  assert.equal(await page.locator('.pledge-reactions .is-unknown').count(),21,'only the visited group reveals its opinion on each card');assert.deepEqual(await page.locator('.support-group-size').allTextContents(),['7명','6명','10명','7명']);
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
  if(name!=='desktop'){await detail.locator(':scope > summary').click();assert.equal(await page.locator('.support-group.is-heard').isVisible(),true);await detail.locator(':scope > summary').click();}
  const draftBefore=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona)),supportBefore=await page.locator('.pledge-puzzle .support-total').textContent();
  await page.locator('.pledge-slot').nth(1).click();await page.locator('[data-pledge=football]').click();assert.equal(await page.locator('.pledge-card[aria-pressed=true]').count(),3);assert.match(await page.locator('.pledge-slot').nth(1).textContent(),/축구/);assert.notEqual(await page.locator('.pledge-puzzle .support-total').textContent(),supportBefore);
  assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona)),draftBefore,'preview never applies stats or saves a pledge');
  await page.locator('.pledge-slot').nth(1).click();await page.locator('[data-pledge=quiet]').click();
  assert.equal(await page.locator('.support-group').count(),4);assert.equal(await page.locator('.support-group.is-heard').count(),1);assert.equal(await page.locator('.pledge-slot').count(),3);

  await page.screenshot({path:'/tmp/gukmin-puzzle-'+name+'.png'});
  await page.locator('.life-modal-collapse').click();
  const saved=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot()));
  await page.locator('#electionCandidates').click();await page.locator('.election-drawer[open]').waitFor();assert.equal(await page.locator('.candidate-slide').count(),3);assert.equal(await page.locator('.candidate-poster .gk-poster').count(),3);assert.equal(await page.locator('.candidate-poster .gk-poster-canvas').count(),3);assert.equal(await page.locator('.candidate-person-name').first().isVisible(),true);
  assert.ok(await page.locator('.election-drawer').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>0&&b.left>0&&b.bottom<innerHeight&&b.right<innerWidth;}),'candidate glass card floats with space on all four sides');
  assert.ok(await page.locator('.election-drawer').evaluate(e=>{const b=e.getBoundingClientRect();return Math.abs(b.top+b.height/2-innerHeight/2)<3&&getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)';}),'the viewer is vertically centered without an enclosing background panel');
  assert.ok(await page.locator('.candidate-poster .gk-poster').evaluateAll(nodes=>nodes.every((n,i)=>n._posterData.number===i+1&&n._posterData.headerLabel==='우리 반 반장 선거')),'candidate posters are built by the shared generator');
  const slideBox=await page.locator('.candidate-slides').boundingBox(),startX=slideBox.x+slideBox.width*.85,endX=slideBox.x+slideBox.width*.15,gestureY=slideBox.y+Math.min(70,slideBox.height/2);
  if(name==='desktop'){
   await page.mouse.move(startX,gestureY);await page.mouse.down();await page.mouse.move(endX,gestureY,{steps:12});await page.mouse.up();
  }else{
   const touch=await context.newCDPSession(page);await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:startX,y:gestureY}]});
   for(let step=1;step<=10;step++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:startX+(endX-startX)*step/10,y:gestureY}]});await page.waitForTimeout(16);}
   await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.detach();
  }
  await page.waitForFunction(()=>document.querySelectorAll('.candidate-slide-nav button')[0].getAttribute('aria-current')==='false');
  await page.locator('.candidate-slide-nav button').nth(1).click();await page.waitForFunction(()=>document.querySelectorAll('.candidate-slide-nav button')[1].getAttribute('aria-current')==='true');
  await page.waitForFunction(()=>{const e=document.querySelector('.candidate-slides');return Math.abs(e.scrollLeft-e.clientWidth)<1;});
  assert.ok(await page.locator('.candidate-slide').nth(1).evaluate(e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth+1;}));
  assert.ok(await page.locator('.candidate-slide').nth(1).evaluate(card=>{const poster=card.querySelector('.candidate-poster').getBoundingClientRect(),info=card.querySelector('.candidate-information').getBoundingClientRect();return info.left>=poster.right-1||info.top>=poster.bottom-1;}),'candidate data and poster never overlap');
  await page.waitForTimeout(450);assert.ok(await page.locator('.candidate-slides').evaluate(e=>Math.abs(e.scrollLeft-e.clientWidth)<1),'candidate remains aligned after native scroll momentum settles');
  await page.screenshot({path:'/tmp/gukmin-election-drawer-'+name+'.png'});
  await page.locator('[role=tab]').nth(1).click();assert.equal(await page.locator('.election-electorate-pane .support-group').count(),4);assert.equal(await page.locator('.candidate-slides').isVisible(),false);
  await page.locator('.election-drawer-close').click();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot())),saved,'reading candidates must not advance or settle the story');
  await page.locator('#resumeMajorChoice').click();assert.equal(await page.locator('.pledge-card[aria-pressed=true]').count(),3);
  await page.locator('#lifeDecisionDialog .election-info-link').first().click();await page.locator('.election-drawer[open]').waitFor();assert.equal(await page.locator('#lifeDecisionDialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('.election-drawer').open);assert.equal(await page.locator('#lifeDecisionDialog').evaluate(e=>e.open),true,'closing candidate information restores the same underlying choice');
  assert.ok(await page.locator('.pledge-footer .life-submit').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}),'confirmation is reachable');
  assert.equal(await page.locator('#lifeDecisionDialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  await page.locator('.pledge-footer .life-submit').click();await run();
  await page.locator('#resumeDailyChoice').click();assert.equal(await page.locator('#dailyChoiceBody .election-context-tools button').count(),2);assert.equal(await page.locator('.campaign-rival,.campaign-brief,.campaign-support-shift').count(),0);assert.match(await page.locator('.campaign-question').textContent(),/정말 할 수 있어/);assert.match(await page.locator('#dailyChoiceBody .inline-choice').first().textContent(),/어떻게든/);
  await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);await run();await daily(1);await run();
  await page.locator('#lifeDecisionDialog.is-election-survey[open]').waitFor();assert.equal(await page.locator('.survey-group[data-group=quiet]').isDisabled(),true);await page.locator('.survey-group[data-group=play]').click();await page.locator('.survey-group[data-group=study]').click();assert.equal(await page.locator('.survey-cost .metric-stress .impact-amount').textContent(),'2');await page.locator('.survey-footer .life-submit').click();assert.equal(await page.evaluate(()=>GukminElection.forecast(GukminGame.session.snapshot().persona).rows.filter(r=>r.known).length),3);await run();
  await page.locator('#lifeDecisionDialog.is-pledges[open]').waitFor();assert.equal(await page.locator('.pledge-card[aria-pressed=true]').count(),3,'final editing starts with the provisional promises');await page.locator('.pledge-footer .life-submit').click();await run();
  await page.locator('.election-result').waitFor();await page.screenshot({path:'/tmp/gukmin-election-count-'+name+'.png'});assert.equal(await page.locator('#electionCandidates').isHidden(),!await page.evaluate(()=>GukminElection.report(GukminGame.session.snapshot().persona).won));assert.equal(await page.locator('.is-election .life-cinematic-description').count(),0,'the story log must not spoil the winner above the live count');assert.equal(await page.locator('.election-group-result').count(),4);assert.equal(await page.locator('.election-group-result').first().isVisible(),true);
  const report=await page.evaluate(()=>GukminElection.report(GukminGame.session.snapshot().persona));const finalCandidates=report.runoff?.candidates||report.candidates;for(let i=0;i<finalCandidates.length;i++)assert.equal(await page.locator('.election-tally').nth(i).textContent(),finalCandidates[i].votes+'표');assert.equal(await page.locator('.election-verdict').textContent(),report.won?'당선':'낙선');
  assert.ok(await page.locator('#lifeCinematicDismiss').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));
  await page.locator('#lifeCinematicDismiss').click();await run();
  if(report.won){await page.locator('#lifeDecisionDialog.is-election-fulfillment[open]').waitFor();await page.locator('.fulfillment-mode[data-mode=compromise]').evaluateAll(nodes=>nodes.forEach(node=>node.click()));await page.locator('.fulfillment-footer .life-submit').click();await page.locator('.is-fulfillment-result[open]').waitFor();await page.locator('.is-fulfillment-result .life-submit').click();}
  await page.evaluate(()=>{
   const p=GukminGame.session.snapshot().persona;p.phase='elementary';p.attributes.electionPledges=138;p.attributes.classElection='elected';p.attributes.electionHardBill=true;delete p.attributes.electionFulfillmentVersion;
   const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p}).snapshot();delete s.runtime.cinematic;s.runtime.awaitingContinuation=false;s.runtime.choices={};s.runtime.turn=46;
   for(const event of pack.events)s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};s.runtime.events['election:bill-0']={status:'unseen',count:0,nextAt:46};s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);
  });await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);await run();await page.locator('#resumeDailyChoice').click();assert.equal(await page.locator('#dailyChoiceBody .inline-choice').first().isDisabled(),true);await page.locator('#dailyChoiceBody .inline-choice').nth(1).click();await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();
  // New presidents resolve all three pledges together; old waiting bill saves above stay untouched.
  await page.evaluate(()=>{
   const p=GukminGame.session.snapshot().persona;p.phase='elementary';p.age=12;p.traits=[];Object.assign(p.stats,{money:100000,stress:5,illness:0,relations:15,study:10});Object.assign(p.attributes,{electionPledges:138,classElection:'elected',electionStage:'finished',electionFulfillmentVersion:1,electionFulfilled:false,teacherTrust:12});
   const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p}).snapshot();delete s.runtime.cinematic;s.runtime.awaitingContinuation=false;s.runtime.choices={};s.runtime.turn=46;
   for(const event of pack.events)s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};s.runtime.events['election:fulfillment']={status:'unseen',count:0,nextAt:46};s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);
  });await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);await run();await page.locator('#lifeDecisionDialog.is-election-fulfillment[open]').waitFor();
  const original=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot()));
  for(const tab of ['candidates','survey']){await page.locator('#lifeDecisionDialog [data-election-tab='+tab+']').click();await page.locator('.election-drawer[open]').waitFor();assert.equal(await page.locator(tab==='survey'?'.election-electorate-pane':'.election-candidate-pane').isVisible(),true);assert.equal(await page.locator('#lifeDecisionDialog').evaluate(e=>e.open),true);await page.locator('.election-drawer-close').click();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot())),original);}
  assert.equal(await page.locator('.fulfillment-mode[data-pledge=homework][data-mode=keep]').isDisabled(),true);
  await page.locator('.fulfillment-mode[data-pledge=homework][data-mode=compromise]').click();await page.locator('.fulfillment-mode[data-pledge=library][data-mode=keep]').click();await page.locator('.fulfillment-mode[data-pledge=holiday][data-mode=break]').click();
  assert.equal(await page.locator('.fulfillment-footer .life-submit').isDisabled(),false);assert.ok(await page.locator('.fulfillment-footer').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));
  await page.screenshot({path:'/tmp/gukmin-fulfillment-'+name+'.png'});await page.locator('.fulfillment-footer .life-submit').click();await page.locator('#lifeDecisionDialog.is-fulfillment-result[open]').waitFor();assert.equal(await page.locator('.fulfillment-result-card').count(),3);
  assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.money),95000);assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.stress),6);await page.screenshot({path:'/tmp/gukmin-fulfillment-result-'+name+'.png'});
  const settled=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot()));await page.reload();await page.locator('#lifeDecisionDialog.is-fulfillment-result[open]').waitFor();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot())),settled);await page.locator('.is-fulfillment-result .life-submit').click();assert.equal(await page.locator('.is-fulfillment-result[open]').count(),0);assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().reviewPending),false);
  if(name==='desktop'){
   const examContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),examPage=await returningPage(examContext);
   await examPage.route('https://fonts.googleapis.com/**',r=>r.abort());
   await examPage.addInitScript(()=>{window.GukminContent={contentId:'exam-token-check',events:[{id:'exam-token',layer:'한방 이벤트',at:0,choice:'exam-token'}],choices:[{id:'exam-token',layer:'한방 선택',title:'중간고사',presentation:{type:'exam',grade:1,term:'1학기 중간고사',category:'school'},options:Array.from({length:5},(_,i)=>({id:'effort-'+i,label:'노력 '+i,result:{effects:{stats:{stress:i-2,study:i}}}}))}]};});
   await examPage.goto(base+'html/game.html');await examPage.locator('#lifeDecisionDialog[open] .life-answer').first().waitFor();
   assert.equal(await examPage.locator('.exam-effort-label.token').count(),5);assert.match(await examPage.locator('.exam-effort-label.token').first().textContent(),/노력 4/);assert.equal(await examPage.locator('.exam-effect-tokens').count(),5);
   const before=await examPage.evaluate(()=>GukminGame.session.snapshot().persona.stats.study);await examPage.locator('.life-answer').nth(2).click();await examPage.locator('.life-submit').click();assert.equal(await examPage.evaluate(()=>GukminGame.session.snapshot().persona.stats.study),before+2);await examContext.close();
   const replay=await page.evaluate(()=>{
    const report=GukminElection.report(GukminGame.session.snapshot().persona),view=GukminElectionView.countScene(report);document.body.append(view.element);
    const frames=[];for(let elapsed=0;elapsed<3000;elapsed+=115){view.update(elapsed);frames.push([...view.element.querySelectorAll('.election-tally')].map(e=>parseInt(e.textContent)));}
    view.finish();const final=[...view.element.querySelectorAll('.election-tally')].map(e=>parseInt(e.textContent)),expected=(report.runoff?.candidates||report.candidates).map(c=>c.votes);view.element.remove();return {frames,final,expected};
   });assert.deepEqual(replay.final,replay.expected);assert.ok(replay.frames.some(frame=>frame.some(Boolean)));for(let i=1;i<replay.frames.length;i++){const growth=replay.frames[i].reduce((n,v)=>n+v,0)-replay.frames[i-1].reduce((n,v)=>n+v,0);assert.ok(growth>=0&&growth<=1,'one real ballot per replay step');}
   const reusable=await page.evaluate(()=>{
    const p=GukminGame.session.snapshot().persona,config=GukminElection.parameters(p);config.groups.forEach(g=>{g.size=30000;g.known=true;});config.playerId=config.candidates[1].id;config.candidates.push({...config.candidates[2],id:'fourth',name:'네 번째 후보'});
    const core=GukminElectionEngine.create(config),original=GukminElection.model(p),model={...original,playerId:config.playerId,groups:config.groups,candidates:config.candidates,forecast:ids=>core.forecast(ids),wishes:id=>core.wishes(id)};
    const view=GukminElectionView.board(model);document.body.append(view.element);const f=core.forecast(original.chosen.map(p=>p.id));
    const result={dots:view.element.querySelectorAll('.support-seats i').length,sizeBars:view.element.querySelectorAll('.electorate-size-track').length,share:view.element.querySelector('.support-total').textContent,expected:f.pollShares[1]+'%',segments:view.element.querySelector('.support-track').children.length};view.element.remove();return result;
   });assert.deepEqual(reusable,{dots:0,sizeBars:4,share:reusable.expected,expected:reusable.expected,segments:5},'reusable UI handles a nonfirst player, four candidates and large electorates without one DOM node per voter');
  }
  if(name==='mobile'){
   await page.evaluate(()=>{
    const p=GukminPlayer.generate();p.phase='elementary';p.age=12;p.traits=[];Object.assign(p.stats,{relations:15,stress:0,illness:0});p.attributes={electionRevision:3,electionStage:'count',electionPledges:104,classElection:'ran',teacherTrust:12,pressureGuideSeen:true};
    for(let i=0;i<1000;i++){p.admissionSeed='runoff-ui-'+i;if(GukminElection.ballot(p).runoff)break;}
    if(!GukminElection.ballot(p).runoff)throw new Error('No tied seed found');
    const pack=GukminDirector.content(p),state=GukminTimeline.create({...pack,persona:p}).snapshot();for(const event of pack.events)state.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};state.runtime.events['election:count']={status:'unseen',count:0,nextAt:45};state.runtime.turn=45;p.simulation=state.runtime;GukminPlayer.save(p);
   });await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);await run();await page.locator('.election-runoff:not([hidden])').waitFor();
   const saved=await page.evaluate(()=>GukminElection.report(GukminGame.session.snapshot().persona));assert.ok(saved.runoff);assert.match(await page.locator('.election-result').textContent(),/결선/);for(const candidate of saved.runoff.candidates)assert.match(await page.locator('.election-runoff').textContent(),new RegExp(candidate.votes+'표'));
   await page.reload();await page.waitForFunction(()=>!!window.GukminGame?.session);await run();await page.locator('.election-runoff:not([hidden])').waitFor();assert.deepEqual(await page.evaluate(()=>GukminElection.report(GukminGame.session.snapshot().persona)),saved,'saved runoff does not reroll or disappear after reload');
  }
  assert.deepEqual(errors,[]);console.log('PASS campaign '+name+': nomination, hints, 3-card selection, folding/reload, rivals, actual tally and bills');await context.close();
 }
}finally{await browser?.close();server.kill();}
