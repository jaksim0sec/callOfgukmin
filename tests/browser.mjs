/* Optional real Chromium integration. Install Playwright outside the app if unavailable. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
let server,browser;
const artifacts=process.env.BROWSER_ARTIFACTS||'/tmp/callOfgukmin-browser';
await mkdir(artifacts,{recursive:true});
try{
 let base=process.env.BROWSER_BASE_URL;
 if(!base){
  const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
  server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'});
  base=`http://127.0.0.1:${port}/callOfgukmin/`;
  for(let i=0;i<50;i++){try{if((await fetch(base+'html/waiting.html')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 }
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport] of [['desktop',{width:1365,height:900}],['mobile',{width:390,height:844}],['small-mobile',{width:360,height:640}]]){
  const context=await browser.newContext({viewport,hasTouch:name!=='desktop',isMobile:name!=='desktop'});const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#waitingName').waitFor();
  await page.evaluate(()=>localStorage.setItem('callOfgukmin__playable__v1','legacy-browser-sentinel'));
  page.setDefaultTimeout(7000);
  const initial=await page.locator('#waitingName').textContent();assert.ok(initial.trim());
  await page.locator('#enterGame').click();
  await page.locator('#birthIntro').waitFor({state:'visible'});
  assert.equal(await page.locator('#birthIntroName').textContent(),initial);
  assert.equal(await page.locator('#birthIntroTitle').textContent(),'출생신고서');
  assert.match(await page.locator('#birthIntroCountdown').textContent(),/초 후 출생/);
  assert.ok((await page.locator('#birthIntroTrait .token-icon').count())>0);
  assert.equal(await page.locator('#birthIntroProgress').getAttribute('max'),'10');
  await page.locator('#birthIntroSkip').click();
  await page.locator('#playerPosterMount .gk-poster').waitFor();
  assert.equal(await page.locator('#age').textContent(),'#2살');
  assert.equal((await page.locator('#nextChoiceLabel').textContent()).trim(),'선택을 기다리는 중');
  const firstLife=await page.evaluate(()=>JSON.parse(localStorage.getItem('callOfgukmin__ui__v1')));
  assert.equal(firstLife.simulation.contentId,'life-main-v1');
  assert.equal(firstLife.simulation.events['infant:birth-registered'].status,'completed');
  assert.equal(firstLife.simulation.turn,8);
  assert.equal(await page.locator('#systemTools').isVisible(),false);
  assert.equal(await page.locator('#action').evaluate(e=>e.hidden),false,'compact decision status is mounted on all viewports');
  assert.equal(await page.locator('#choiceTiming').isVisible(),false,'no countdown while choosing');
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'daily choice modal opens automatically');
  assert.equal(await page.locator('#dailyChoiceBody .daily-scenario-title').textContent(),await page.locator('#currentTitle').textContent());
  assert.equal(await page.locator('#dailyChoiceBody .daily-choice-prompt').textContent(),'어떻게 할까?');
  assert.equal(await page.locator('#dailyChoiceBody .inline-choices').evaluate(e=>getComputedStyle(e).flexDirection),'column');
  assert.ok(await page.locator('#dailyChoiceBody .daily-choice-effect').count()>0,'shared SVG icons are visible');
  await page.locator('#dailyModalCollapse').click();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'modal collapses without settling');
  assert.equal(await page.locator('#resumeDailyChoice').isVisible(),true,'resume remains in sheet header');
  await page.locator('#resumeDailyChoice').click();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'resumes without losing selection');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'Escape collapses without choosing');
  assert.equal(await page.locator('#lifeHeadline').textContent(),'2살');
  if(name!=='desktop'){
   const old=await page.locator('#lifeSheet').boundingBox();
   assert.ok(old.height<viewport.height*.3,'sheet starts compact and does not cover most of the game');
   assert.equal(await page.locator('#sheetToggle').getAttribute('aria-expanded'),'false');
   await page.locator('#sheetToggle').click();
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-springing')),true,'tap starts spring motion');
   await page.waitForTimeout(950);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-springing')),false,'spring settles and cleans up');
   const middle=await page.locator('#lifeSheet').boundingBox();
   assert.ok(middle.height>old.height+50&&middle.height<viewport.height*.7,'tap opens middle');
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-middle')),true);
   await page.locator('#sheetToggle').click();
   await page.waitForTimeout(260);
   const expanded=await page.locator('#lifeSheet').boundingBox();
   assert.ok(expanded.height>middle.height+50,'second tap opens full');
   await page.locator('#sheetToggle').click();
   await page.waitForTimeout(260);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-minimized')),true,'third tap closes to min');
   assert.equal(await page.locator('#sheetContent').evaluate(el=>getComputedStyle(el).visibility),'visible','sheet content stays painted while minimized');
   const persistentContent=await page.locator('#sheetContent').evaluate(el=>{el.dataset.sheetIdentity='persistent';return el;});
   assert.equal(await page.locator('#sheetContent').getAttribute('data-sheet-identity'),'persistent','sheet content is not recreated');
   const drag=async offset=>{
    const bounds=await page.locator('#sheetToggle').boundingBox();
    const x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
    await page.mouse.move(x,y);await page.mouse.down();
    await page.mouse.move(x,y+offset,{steps:8});
    assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.style.height),'','CSS owns drag height');
    await page.mouse.up();
    await page.waitForTimeout(260);
   };
   await drag(-230);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-middle')),true,'swipe up: middle');
   await drag(-250);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-expanded')),true,'swipe up: full');
   await drag(230);
   const afterDown=await page.locator('#lifeSheet').evaluate(el=>({
    middle:el.classList.contains('is-middle'),min:el.classList.contains('is-minimized')
   }));
   assert.ok(afterDown.middle||afterDown.min,'downward inertia lowers the sheet');
   if(afterDown.middle)await drag(230);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-minimized')),true,'swipe down: min');
   await drag(-230);
   await drag(-230);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-expanded')),true,'return to full for strong downward gesture');
   await drag(270);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-minimized')),true,'long drag minimizes, never removes');
   assert.equal(await page.locator('#lifeSheet').count(),1,'one persistent sheet remains');
   assert.equal(await page.locator('#sheetToggle').getAttribute('aria-expanded'),'false');
   const tapGrip=async()=>{
    const b=await page.locator('#sheetToggle').boundingBox();
    await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
    await page.waitForTimeout(320);
   };
   await tapGrip();
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-middle')),true,'touch advances once to middle');
   await tapGrip();
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-expanded')),true,'touch advances once to full');
   await tapGrip();
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-minimized')),true,'touch returns once to min');
   await page.locator('#sheetToggle').focus();
   await page.keyboard.press('Enter');
   await page.waitForTimeout(320);
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-middle')),true,'keyboard advances to middle');
   assert.equal(await page.locator('.metric-stress .gauge-name').textContent(),'스트레스');
   assert.equal(await page.locator('.gauge.metric-money').evaluate(el=>getComputedStyle(el).gridColumnEnd),'-1');
  }
  assert.ok(await page.locator('#gaugesList .gauge-metric-icon').count()>=3,'every active metric has its own SVG icon');
  await page.goto(base+'html/game.html?systems=1',{waitUntil:'domcontentloaded'});
  if(await page.locator('#dailyChoiceDialog').isVisible())await page.locator('#dailyModalCollapse').click();
  const before=await page.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1'));

  for(const [button,kind] of [['previewSchool','school-dialog'],['previewParty','ballot-dialog']]){
   await page.locator('#'+button).click();await page.locator('#choiceDialog.'+kind).waitFor();await page.locator('#options button').first().click();await page.locator('#confirm').click();assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1')),before);
  }

  // A: an opt-in test content pack uses the same engine as future content.
  await page.locator('#startSystemDemo').click();await page.locator('#advanceTurn').click();assert.ok((await page.locator('#log').textContent()).includes('검증 사건'));
  // B: actual progress and choice UI; paused clock and persisted pending choice.
  assert.equal(await page.locator('#nextChoiceProgress').evaluate(p=>p.value),0.5);
  await page.locator('#advanceTurn').click();assert.equal(await page.locator('#advanceTurn').isDisabled(),true);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#dailyChoiceBody .inline-choice').first().waitFor();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'saved pending choice auto-restores');
  await page.locator('#dailyModalCollapse').click();
  await page.locator('#resumeDailyChoice').click();
  await page.locator('#dailyChoiceBody .inline-choice').first().evaluate(b=>{b.click();b.click();});
  assert.match(await page.locator('.gauge.metric-money').textContent(),/10,000원/);assert.match(await page.locator('.gauge.metric-health').textContent(),/95/);
  assert.ok((await page.locator('#log').textContent()).includes('검증 선택 결과'));
  // C–E: one event pack drives traits, periodic effect, schools and custom metric.
  assert.ok((await page.locator('#traits').textContent()).includes('검증용 저축습관'));
  assert.equal(await page.locator('.gauge.metric-demoFocus').count(),1);
  await page.locator('#advanceTurn').click();assert.equal(await page.locator('.school-token-active').count(),1);assert.match(await page.locator('.gauge.metric-demoFocus').textContent(),/3/);
  await page.screenshot({path:`${artifacts}/${name}-school.png`,fullPage:true});
  await page.locator('#advanceTurn').click();assert.match(await page.locator('.gauge.metric-money').textContent(),/10,100원/);assert.equal(await page.locator('.school-token-active').count(),0);assert.equal(await page.locator('.school-token-complete').count(),1);assert.equal(await page.locator('.gauge.metric-demoFocus').count(),0);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('callOfgukmin__ui__v1')));assert.equal(saved.simulation.turn,4);assert.equal(saved.metricHistory.at(-1).value,3);
  // F: restore data across independent pages; legacy save never touched.
  await page.goto(base+'html/waiting.html',{waitUntil:'domcontentloaded'});await page.locator('#waitingName').waitFor();assert.equal(await page.locator('#waitingName').textContent(),initial);
  await page.locator('#previewResult').click();await page.locator('#resultPosterMount .gk-poster').waitFor();await page.locator('#resultBack').click();await page.locator('#enterGame').click();await page.locator('#birthIntroSkip').click();await page.locator('.school-token-complete').waitFor();
  const layout=await page.evaluate(()=>{
   const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
   return {poster:box('#playerPosterMount'),profile:box('.profile'),gauges:box('.gauges'),sheet:box('.sheet'),log:box('#log'),action:box('#action'),head:box('.sheet-head'),progress:box('#choiceTiming'),sheetPosition:getComputedStyle(document.querySelector('.sheet')).position,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(layout.overflow,false);assert.ok(layout.log.height>30,'history remains readable');assert.ok(layout.progress.height===0||layout.progress.y>=layout.head.bottom-1,'conditional progress placement');assert.ok(layout.action.bottom<=viewport.height+1,'actions stay within viewport');
  if(name==='desktop'){assert.ok(Math.abs(layout.poster.width-layout.gauges.width)<1);assert.notEqual(layout.sheetPosition,'fixed');}else{assert.equal(layout.sheetPosition,'fixed');assert.ok(Math.abs(layout.sheet.bottom-viewport.height)<1);}
  await page.screenshot({path:`${artifacts}/${name}-completed.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__playable__v1')),'legacy-browser-sentinel');
  await page.goto(base+'html/waiting.html',{waitUntil:'domcontentloaded'});await page.locator('#rerollPersona').click();const fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem('callOfgukmin__ui__v1')));assert.equal(fresh.simulation,undefined);assert.equal(fresh.stats.money,0);
  assert.deepEqual(errors,[]);console.log(`PASS ${name}: A–F, reload, previews, save preservation, layout`);await context.close();
 }

 // The built-in exam presenter uses a paper-style modal and settles through the same timeline.
 const examContext=await browser.newContext();
 const examPage=await examContext.newPage();
 await examPage.addInitScript(()=>{
  window.GukminContent={
   contentId:'exam-view-check',events:[{id:'exam-view',layer:'한방 이벤트',at:0,choice:'exam-view'}],
   choices:[{id:'exam-view',layer:'한방 선택',title:'중간고사',presentation:{type:'exam',grade:1,term:'1학기 중간고사',category:'school'},options:[
    {id:'0',label:'쉰다',result:{effects:{stats:{health:2}}}},
    {id:'1',label:'조금',result:{effects:{stats:{study:1}}}},
    {id:'2',label:'꾸준히',result:{effects:{stats:{study:3}}}},
    {id:'3',label:'집중',result:{effects:{stats:{study:6}}}},
    {id:'4',label:'매우 집중',result:{effects:{stats:{health:-3}}}}
   ]}]
  };
 });
 await examPage.goto(base+'html/game.html',{waitUntil:'domcontentloaded'});
 await examPage.locator('#lifeDecisionDialog[open] .life-answer').first().waitFor();
 assert.equal(await examPage.locator('#lifeDecisionDialog .life-answer').count(),5);
 await examPage.locator('#lifeDecisionDialog .life-answer').nth(2).click();
 await examPage.locator('#lifeDecisionDialog .life-submit').click();
 assert.equal(await examPage.locator('#lifeDecisionDialog[open]').count(),0);
 assert.equal(await examPage.evaluate(()=>GukminGame.session.snapshot().runtime.choices['exam-view:1'].status),'closed');
 console.log('PASS exam paper presenter: five choices, commit, close');
 await examContext.close();


 // Complete real game life through school on desktop and mobile using actual dialogs.
 for(const [name,viewport] of [['desktop',{width:1365,height:900}],['mobile',{width:390,height:844}]]){
  const ctx=await browser.newContext({viewport});
  const p=await ctx.newPage(),pageErrors=[];
  p.on('pageerror',e=>pageErrors.push(e.message));
  await p.goto(base+'html/game.html',{waitUntil:'domcontentloaded'});
  let start=await p.evaluate(()=>GukminGame.session.snapshot());
  assert.equal(start.persona.age,2);
  const walk=async target=>p.evaluate(target=>{
   const s=GukminGame.session;
   for(let index=0;index<80;index++){
    const snap=s.snapshot(),choice=snap.choice;
    if(snap.reviewPending){s.run();continue;}
    if(!choice||choice.presentation?.type===target)return {age:snap.persona.age,turn:snap.runtime.turn,choice:choice?.id||null};
    const first=choice.options.find(o=>o.available);
    if(!first)throw new Error('No legal choice: '+choice.id);
    s.resolve(choice.token,first.id);
    if(!s.snapshot().reviewPending)throw new Error('Choice review did not persist');
   }
   throw new Error('Life path did not reach '+target);
  },target);
  const examState=await walk('exam');
  assert.equal(examState.age,13);
  await p.locator('#lifeDecisionDialog[open] .life-answer').first().waitFor();
  assert.equal(await p.locator('#lifeDecisionDialog .life-answer').count(),5);
  assert.equal(await p.locator('#lifeDecisionDialog .life-paper-identification').count(),1);
  assert.equal(await p.locator('#lifeDecisionDialog .life-paper-question').count(),1);
  const box=await p.locator('#lifeDecisionDialog').boundingBox();
  assert.ok(box&&box.x>=-1&&box.x+box.width<=viewport.width+1,'exam within screen');
  await p.locator('#lifeDecisionDialog .life-answer').nth(2).click();
  await p.locator('#lifeDecisionDialog .life-submit').click();
  // Another exam may immediately open. Verify the previous decision closed, not the dialog.
  const beforeReload=await p.evaluate(()=>GukminGame.session.snapshot());
  assert.equal(beforeReload.runtime.choices[examState.choice+':1'].status,'closed');
  await p.reload({waitUntil:'domcontentloaded'});
  const afterReload=await p.evaluate(()=>GukminGame.session.snapshot());
  assert.equal(afterReload.runtime.turn,beforeReload.runtime.turn,'restored turn');
  assert.equal(afterReload.persona.age,beforeReload.persona.age,'restored age');
  const schoolState=await walk('school');
  assert.equal(schoolState.age,15);
  await p.locator('#lifeDecisionDialog[open] .life-answer').first().waitFor();
  assert.equal(await p.locator('#lifeDecisionDialog .life-answer').count(),4);
  const schoolBounds=await p.locator('#lifeDecisionDialog').boundingBox();
  assert.ok(schoolBounds&&schoolBounds.x>=-1&&schoolBounds.x+schoolBounds.width<=viewport.width+1,'school within screen');
  await p.locator('#lifeDecisionDialog .life-answer').first().click();
  assert.ok((await p.locator('#lifeDecisionDialog .life-school-source').getAttribute('href')).startsWith('https://'));
  await p.locator('#lifeDecisionDialog .life-submit').click();
  const ended=await walk('nothing');
  assert.equal(ended.age,19);assert.equal(ended.turn,79);
  assert.equal((await p.locator('#nextChoiceLabel').textContent()).trim(),'이야기 준비 중');
  assert.match(await p.locator('.metric-schoolScore .gauge-value').textContent(),/[1-5]등급/);
  assert.match(await p.locator('.metric-exam .gauge-value').textContent(),/[1-9]등급/);
  const schoolHistory=await p.evaluate(()=>GukminPlayer.schoolsOf(GukminGame.session.snapshot().persona).find(s=>s.kind==='high'));
  assert.equal(schoolHistory.status,'graduated');
  await p.screenshot({path:`${artifacts}/${name}-life-graduate.png`,fullPage:true});
  assert.deepEqual(pageErrors,[]);
  console.log('PASS real life '+name+': exam UI, school application, reload, age19 graduation');
  await ctx.close();
 }

 // A future major-choice popup can attach later; the infrastructure itself opens none.
 const context=await browser.newContext();const page=await context.newPage();
 await page.addInitScript(()=>{window.GukminContent={contentId:'major-adapter-check',events:[{id:'major',layer:'한방 이벤트',at:0,title:'검증 한방',choice:'major'}],choices:[{id:'major',layer:'한방 선택',title:'중요한 선택',options:[{id:'accept',label:'확정',result:{effects:{stats:{money:7}}}}]}]};});
 await page.goto(base+'html/game.html',{waitUntil:'domcontentloaded'});
 await page.locator('#currentChoice').waitFor();assert.match(await page.locator('#currentChoice').textContent(),/한방 선택 응답 대기/);
 assert.equal(await page.locator('dialog[open]').count(),0);assert.equal(await page.locator('#currentChoice button').count(),0);
 await page.reload({waitUntil:'domcontentloaded'});
 assert.equal(await page.evaluate(()=>{const s=GukminGame.session;s.advance(10);return s.snapshot().runtime.turn;}),0);
 await page.evaluate(()=>{GukminGame.registerMajorPresenter(({choice,resolve})=>{window.majorTestChoice=choice;window.finishMajor=resolve;});window.finishMajor('accept');window.finishMajor('accept');});
 assert.match(await page.locator('.gauge.metric-money').textContent(),/7원/);assert.equal(await page.locator('dialog[open]').count(),0);console.log('PASS major adapter: wait, reload, no popup, callback settlement once');await context.close();
 const lifecycle=await browser.newContext();const lifecyclePage=await lifecycle.newPage();
 await lifecyclePage.addInitScript(()=>{window.GukminContent={contentId:'lifecycle-check',events:[{id:'major',layer:'한방 이벤트',at:0,title:'한방',choice:'major'}],choices:[{id:'major',layer:'한방 선택',options:[{id:'accept',label:'확인',result:{effects:{stats:{money:7}}}}]}]};});
 await lifecyclePage.goto(base+'html/game.html',{waitUntil:'domcontentloaded'});await lifecyclePage.locator('#currentChoice').waitFor();
 const afterDispose=await lifecyclePage.evaluate(()=>{
  GukminGame.registerMajorPresenter(({resolve})=>{window.staleMajor=resolve;});
  const session=GukminGame.session;session.dispose();GukminPlayer.save(GukminPlayer.generate());
  const before=localStorage.getItem(GukminPlayer.storageKey);window.staleMajor('accept');
  let rejected=false;try{session.advance(1);}catch{rejected=true;}
  return {unchanged:before===localStorage.getItem(GukminPlayer.storageKey),rejected};
 });
 assert.equal(afterDispose.unchanged,true,'disposed presenter cannot overwrite a newer save');assert.equal(afterDispose.rejected,true,'disposed public session cannot advance');
 await lifecyclePage.reload({waitUntil:'domcontentloaded'});await lifecyclePage.locator('#currentChoice').waitFor();
 const replaced=await lifecyclePage.evaluate(()=>{
  let cleaned=0,shown=0;
  GukminGame.registerMajorPresenter(()=>()=>{cleaned++;});
  GukminGame.registerMajorPresenter(null);
  GukminGame.registerMajorPresenter(()=>{shown++;return()=>{cleaned++;};});
  GukminGame.session.dispose();return {cleaned,shown};
 });
 assert.deepEqual(replaced,{cleaned:2,shown:1});console.log('PASS major lifecycle: disposed callbacks ignored, replacement/unregister cleanup');await lifecycle.close();
}finally{await browser?.close();server?.kill();}
