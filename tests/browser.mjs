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
 // The sheet owns the prominent life-stage label; the profile has no duplicate age.
 for(const [name,viewport] of [['desktop',{width:1365,height:900}],['mobile',{width:390,height:844}],['small-mobile',{width:360,height:640}]]){
  const context=await browser.newContext({viewport});const page=await context.newPage();
  await page.addInitScript(()=>{window.GukminContent={contentId:'headline-check',events:[],choices:[]};});
  await page.goto(base+'html/game.html',{waitUntil:'domcontentloaded'});
  await page.locator('#lifeHeadline').waitFor();
  assert.equal(await page.locator('.profile #age').count(),0,'profile must not duplicate the age');
  assert.equal(await page.locator('.profile #job').count(),0,'role belongs beside the sheet headline');
  assert.equal(await page.locator('.life-heading #lifeHeadline + #job').textContent(),'아기');
  assert.equal(await page.locator('#lifeHeadline').textContent(),'0살');
  for(const [phase,age,expected] of [['elementary',7,'초등학교 1학년'],['middle',14,'중학교 2학년'],['high',17,'고등학교 2학년']]){
   await page.evaluate(({phase,age})=>GukminGame.session.apply('entry-'+phase,{effects:{attributes:{phase,age,job:{elementary:'초등학생',middle:'중학생',high:'고등학생'}[phase]},schools:[{id:phase,kind:phase,name:'검증 학교 '+phase,status:'enrolled'}]}}),{phase,age});
   assert.equal(await page.locator('#lifeHeadline').textContent(),expected);
  }
  await page.evaluate(()=>GukminGame.session.apply('metric-layout',{effects:{stats:{money:1575000,allowance:45000,stress:51,health:-12,relations:30}}}));
  assert.equal(await page.locator('.gauges-heading').count(),0,'status heading and its layout box are removed');
  assert.ok(await page.locator('#gaugesList .gauge').last().evaluate(el=>el.classList.contains('metric-money')),'money is the final metric');
  const cards=await page.locator('#gaugesList .gauge').evaluateAll(items=>items.map(el=>({background:getComputedStyle(el).backgroundColor,padding:parseFloat(getComputedStyle(el).paddingLeft)})));
  assert.ok(cards.every(card=>card.background!=='rgba(0, 0, 0, 0)'&&card.padding>0),'every stat has a padded card');
  assert.equal(await page.locator('#gaugesList .gauge').evaluateAll(items=>items.some(card=>{const bounds=card.getBoundingClientRect();return [...card.querySelectorAll('.gauge-label,.gauge-value,.gauge-progress-track')].some(el=>{const r=el.getBoundingClientRect();return r.left<bounds.left-1||r.right>bounds.right+1;});})),false,'stat contents remain within their own card');
  await page.evaluate(()=>{document.querySelector('#resumeMajorChoice').hidden=false;});
  const dimensions=await page.locator('#lifeHeadline').evaluate(el=>{const r=el.getBoundingClientRect(),head=el.parentElement.getBoundingClientRect(),style=getComputedStyle(el);return {font:parseFloat(style.fontSize),right:r.right,headRight:head.right,height:r.height};});
  assert.ok(dimensions.font>26.4,'headline is larger than the previous 1.65rem');
  assert.ok(dimensions.right<=dimensions.headRight&&dimensions.height>0,'grade stays in the sheet header');
  await page.screenshot({path:`${artifacts}/${name}-school-headline.png`,fullPage:true});
  await page.evaluate(()=>GukminGame.session.apply('graduate',{effects:{attributes:{age:19},schools:[{id:'high',kind:'high',name:'검증 학교 high',status:'graduated'}]}}));
  assert.equal(await page.locator('#lifeHeadline').textContent(),'19살','graduated school is not presented as current enrollment');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>GukminGame.session.apply('birthday',{effects:{attributes:{age:20}}}));
  assert.equal(await page.locator('#lifeHeadline').evaluate(el=>el.getAnimations().length),0,'reduced motion disables the heading animation');
  await context.close();console.log('PASS '+name+': larger sheet age, school year, graduation, reduced motion');
 }
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
  assert.equal(await page.locator('#birthIntroFill').count(),1,'birth screen has a smooth visual fill');
  assert.ok(await page.locator('#birthIntroProgress').isVisible(),'semantic birth progress remains available');
  await page.locator('#birthIntroSkip').click();
  await page.locator('#playerPosterMount .gk-poster').waitFor();
  assert.equal(await page.locator('#age').count(),0);
  assert.equal(await page.locator('#lifeHeadline').textContent(),'2살');
  assert.equal(await page.locator('#choiceTiming').isVisible(),false,'no meaningless paused progress bar');
  const firstLife=await page.evaluate(()=>JSON.parse(localStorage.getItem('callOfgukmin__ui__v1')));
  assert.equal(firstLife.simulation.contentId,'life-main-v1');
  assert.equal(firstLife.simulation.events['infant:birth-registered'].status,'completed');
  assert.equal(firstLife.simulation.turn,8);
  assert.equal(await page.locator('#systemTools').isVisible(),false);
  assert.equal(await page.locator('#action').evaluate(e=>e.hidden),false,'compact decision status is mounted on all viewports');
  assert.equal(await page.locator('#choiceTiming').isVisible(),false,'pending decisions are not disguised as 100% progress');
  assert.equal(await page.locator('#nextChoiceProgress').evaluate(p=>p.value),0);
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'first daily choice waits for the player to open it');
  assert.equal(await page.locator('#resumeDailyChoice').isVisible(),true,'one intentional entry point is available');
  assert.equal(await page.locator('#resumeDailyChoice.is-auto-opening').count(),1,'one 5-second timed opener is visible');
  assert.equal(await page.locator('#resumeDailyChoice .auto-choice-track').count(),1,'timed opener owns the only countdown gauge');
  assert.ok(await page.locator('#gaugesList .gauge-progress-track').count()>0,'all progress-type status gauges expose smooth fill tracks');
  assert.equal(await page.locator('#gaugesList .gauge-progress-track').count(),
   await page.locator('#gaugesList progress.ui-progress-native').count(),'every visual stat gauge retains a semantic native progress');
  await page.locator('#resumeDailyChoice').click();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true);
  assert.equal(await page.locator('#dailyChoiceBody .daily-scenario-title').textContent(),await page.locator('#currentTitle').textContent());
  assert.equal(await page.locator('#dailyChoiceBody .daily-choice-prompt').count(),0,'redundant prompt removed from paper');
  assert.equal(await page.locator('#dailyChoiceBody .inline-choices').evaluate(e=>getComputedStyle(e).flexDirection),'column');
  const escapedMarkup=await page.evaluate(()=>{
   const root=document.createElement('p');
   window.GukminMarkup.render(root,'<img src=x> **중요** *기울임* ~~삭제~~ ==형광==');
   const breaks=document.createElement('div');window.GukminMarkup.render(breaks,'첫 줄\n두 번째 줄\n\n마지막 줄');
   return {htmlImage:root.querySelector('img')!==null,strong:root.querySelector('strong')?.textContent,
    em:root.querySelector('em')?.textContent,del:root.querySelector('del')?.textContent,mark:root.querySelector('mark')?.textContent,breaks:breaks.querySelectorAll('br').length};
  });
  assert.deepEqual(escapedMarkup,{htmlImage:false,strong:'중요',em:'기울임',del:'삭제',mark:'형광',breaks:3},
   'story markup preserves line breaks while safely escaping HTML');
  const traitTint=await page.evaluate(()=>{
   const sample=GukminStatus.traitToken('예체능');return sample.style.getPropertyValue('--trait-color');
  });
  assert.equal(traitTint,'#EB83C0','trait owns its distinct color');
  assert.match(await page.locator('#dailyChoiceDialog').evaluate(el=>getComputedStyle(el).animationName),/paper-sheet-rise/,
   'grid paper rises from the bottom');
  assert.equal(await page.locator('#dailyPaperGrip').count(),1,'paper uses common sheet grip');
  assert.equal(await page.evaluate(()=>typeof GukminSheet.create),'function','shared snap sheet controller is loaded');
  assert.match(await page.locator('#dailyChoiceDialog').evaluate(el=>getComputedStyle(el).fontFamily),/Serif KR|Batang/,'diary uses Korean serif');
  assert.match(await page.locator('#dailyChoiceDialog').evaluate(el=>getComputedStyle(el).backgroundImage),/linear-gradient/,'paper grid is rendered');
  assert.equal(await page.locator('#dailyModalCollapse').count(),0,'no redundant paper close text');
  assert.equal(await page.locator('#dailyChoiceBody .daily-choice-prompt').count(),0,'no oversized question heading');
  assert.ok(await page.locator('#dailyChoiceBody .daily-choice-story').evaluate(el=>
    parseFloat(getComputedStyle(el).fontSize)>parseFloat(getComputedStyle(document.querySelector('#dailyModalHeading')).fontSize)),
    'story text visually leads event title');
  const semanticPill=await page.evaluate(()=>{
   const chip=GukminStatus.metricImpact('relations',2);
   document.body.append(chip);
   const style=getComputedStyle(chip),glyph=getComputedStyle(chip.querySelector('.token-icon'));
   const result={background:style.backgroundColor,label:style.color,icon:glyph.color,
    arrow:chip.querySelector('.impact-arrow')?.tagName.toLowerCase(),
    readable:chip.getAttribute('aria-label')};
   chip.remove();return result;
  });
  assert.equal(semanticPill.background,'rgb(135, 105, 216)','metric retains shared relationship color');
  assert.equal(semanticPill.label,'rgb(255, 255, 255)','metric pill label is white');
  assert.equal(semanticPill.icon,'rgb(255, 255, 255)','metric pill icon is white');
  assert.equal(semanticPill.arrow,'svg','delta direction uses SVG');
  assert.match(semanticPill.readable,/관계.*증가.*2/);
  // Every semantic badge, including exam effects and preview tags, shares one DOM factory and visual contract.
  const tokenContract=await page.evaluate(()=>{
   const kinds=[
    GukminStatus.createToken({type:'metric',id:'relations',amount:2}),
    GukminStatus.createToken({type:'trait',name:'예체능'}),
    GukminStatus.createToken({type:'trait',name:'흙수저'}),
    GukminStatus.createToken({type:'school',label:'검증중학교',state:'enrolled'}),
    GukminStatus.createToken({type:'attribute',label:'경기도',icon:'pin'}),
    GukminStatus.createToken({type:'context',label:'학교 태그',icon:'school'})
   ];
   const values=kinds.map(el=>{
    document.body.append(el);
    const s=getComputedStyle(el),svg=el.querySelector('.token-icon'),g=getComputedStyle(svg);
    const result={kind:el.dataset.tokenKind,base:el.classList.contains('token-icon-pill'),
      hasSvg:!!svg,hasName:!!el.querySelector('.token-name'),borderRadius:s.borderRadius,
      background:s.backgroundColor,text:s.color,icon:g.color};
    el.remove();return result;
   });
   return values;
  });
  assert.deepEqual(tokenContract.map(x=>x.kind),['metric','trait','trait','school','attribute','context']);
  for(const token of tokenContract){
   assert.ok(token.base&&token.hasSvg&&token.hasName,'all tokens share the exact icon-and-name structure');
   assert.equal(token.text,'rgb(255, 255, 255)','token labels are white');
   assert.equal(token.icon,'rgb(255, 255, 255)','token SVG icons are white');
   assert.notEqual(token.background,'rgba(0, 0, 0, 0)','every token has a solid semantic background');
  }
  assert.equal(tokenContract[0].borderRadius,tokenContract[1].borderRadius,'all tokens share the same pill geometry');
  assert.equal(tokenContract[1].background,'rgb(235, 131, 192)','trait uses its intrinsic custom color');
  const schoolKindColor=await page.evaluate(()=>{
   const el=GukminStatus.createToken({type:'context',label:'과학고',icon:'graduation',classes:'token-school-kind school-kind-science'});
   document.body.append(el);
   const rgb=getComputedStyle(el).backgroundColor;el.remove();return rgb;
  });
  assert.equal(schoolKindColor,'rgb(50, 125, 131)','context fallback never overrides distinct school-type color');
  assert.ok(await page.locator('#attributeRows .token[data-token-kind=attribute]').count()>0,'main status uses the shared factory');

  const testMarkup=await page.evaluate(()=>{
   const el=document.createElement('p');GukminMarkup.render(el,'**강조** ==표시== ~~삭제~~');
   return [el.querySelector('strong')?.textContent,el.querySelector('mark')?.textContent,el.querySelector('del')?.textContent].join('|');
  });
  assert.equal(testMarkup,'강조|표시|삭제','rich story markup remains semantic');
  assert.equal(await page.evaluate(()=>{
   const host=document.createElement('div'),grip=document.createElement('button');
   host.append(grip);document.body.append(host);
   const c=GukminSheet.create({element:host,handle:grip,
    steps:[{name:'short',ratio:.3},{name:'tall',ratio:.75}],initial:1,
    enabled:()=>false,dismissible:true,removeOnDismiss:true});
   const count=c.getStepCount();c.dismiss();const removed=!host.isConnected;c.dispose();
   return count===2&&removed;
  }),true,'generic sheet supports arbitrary steps and optional removal');
  if(name!=='desktop'){
   assert.equal(await page.locator('#dailyChoiceDialog').evaluate(el=>el.classList.contains('is-expanded')),true);
   await page.locator('#dailyPaperGrip').click();await page.waitForTimeout(380);
   assert.equal(await page.locator('#dailyChoiceDialog').evaluate(el=>el.classList.contains('is-middle')),true,'paper grip lowers to its configurable middle height');
   await page.locator('#dailyPaperGrip').click();await page.waitForTimeout(380);
   assert.equal(await page.locator('#dailyChoiceDialog').evaluate(el=>el.classList.contains('is-expanded')),true,'paper grip restores full height');
   // Regression: a dismissible sheet must track the finger BELOW its lowest snap.
   await page.locator('#dailyPaperGrip').click();await page.waitForTimeout(370);
   const handleBounds=await page.locator('#dailyPaperGrip').boundingBox();
   const startHeight=(await page.locator('#dailyChoiceDialog').boundingBox()).height;
   const dragX=handleBounds.x+handleBounds.width/2,dragY=handleBounds.y+handleBounds.height/2;
   await page.mouse.move(dragX,dragY);await page.mouse.down();
   await page.mouse.move(dragX,dragY+85,{steps:10});
   await page.waitForTimeout(60);
   const followingHeight=(await page.locator('#dailyChoiceDialog').boundingBox()).height;
   assert.ok(followingHeight<startHeight-45,
    'dismissible paper must visibly follow a downward drag below its first snap');
   await page.mouse.up();await page.waitForTimeout(370);
   // Restore the initial top snap for later actions.
   await page.locator('#dailyPaperGrip').click();await page.waitForTimeout(370);
   // Close by dragging, without jumping back up at pointer release.
   await page.locator('#dailyPaperGrip').click();await page.waitForTimeout(370);
   const closingGrip=await page.locator('#dailyPaperGrip').boundingBox();
   const cx=closingGrip.x+closingGrip.width/2,cy=closingGrip.y+closingGrip.height/2;
   await page.mouse.move(cx,cy);await page.mouse.down();
   await page.mouse.move(cx,cy+145,{steps:12});await page.waitForTimeout(40);
   const beforeRelease=(await page.locator('#dailyChoiceDialog').boundingBox()).height;
   await page.mouse.up();
   const afterRelease=(await page.locator('#dailyChoiceDialog').boundingBox()).height;
   assert.ok(afterRelease<beforeRelease+35,'releasing downward swipe must not jump paper back to its first snap');
   await page.waitForFunction(()=>!document.querySelector('#dailyChoiceDialog').open);
   assert.equal(await page.locator('#resumeDailyChoice').isVisible(),true,'drag dismiss keeps a pending choice');
   await page.locator('#resumeDailyChoice').click();
   assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'pending choice reopens after swipe dismiss');


  }

  const shownEffects=await page.locator('#dailyChoiceBody .daily-choice-effect').count();
  const realEffects=await page.evaluate(()=>{
   const snapshot=GukminGame.session.snapshot();
   return snapshot.choice.options.reduce((sum,option)=>{
    const projected=GukminEffects.apply(snapshot.persona,option.result,{turn:snapshot.choice.openedAt||0});
    return sum+Object.keys(projected.stats).filter(id=>
      Number.isFinite(projected.stats[id])&&Number.isFinite(snapshot.persona.stats[id])&&
      projected.stats[id]!==snapshot.persona.stats[id]).length;
   },0);
  });
  assert.equal(shownEffects,realEffects,'preview never invents rewards when a narrative choice has no numeric effect');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#dailyChoiceDialog').open);
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'paper collapses without settling');
  assert.equal(await page.locator('#resumeDailyChoice').isVisible(),true,'resume remains in sheet header');
  await page.locator('#resumeDailyChoice').click();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'resumes without losing selection');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#dailyChoiceDialog').open);
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'Escape collapses without choosing');
  assert.equal(await page.locator('#lifeHeadline').textContent(),'2살');
  if(name!=='desktop'){
   const old=await page.locator('#lifeSheet').boundingBox();
   assert.ok(old.height<viewport.height*.3,'sheet starts compact and does not cover most of the game');
   const chrome=await page.evaluate(()=>{
    const sheet=document.querySelector('#lifeSheet');
    const parts=['#sheetToggle','.sheet-head','#choiceTiming','#systemTools','#systemError'];
    return parts.map(sel=>sheet.querySelector(sel)).filter(Boolean)
      .reduce((sum,node)=>sum+node.getBoundingClientRect().height,0)
      +parseFloat(getComputedStyle(sheet).paddingBottom);
   });
   assert.ok(old.height>=chrome-1&&old.height<chrome+20,'minimized height fits the header and progress without a blank panel');
   assert.equal(await page.locator('#sheetToggle').getAttribute('aria-expanded'),'false');
   await page.locator('#sheetToggle').click();
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-springing')),true,'tap starts spring motion');
   await page.waitForFunction(()=>!document.querySelector('#lifeSheet').classList.contains('is-springing'),null,{timeout:3500});
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-springing')),false,'spring settles and cleans up');
   const middle=await page.locator('#lifeSheet').boundingBox();
   assert.ok(middle.height>old.height+50&&middle.height<viewport.height*.7,'tap opens middle');
   assert.equal(await page.locator('#lifeSheet').evaluate(el=>el.classList.contains('is-middle')),true);
   const split=await page.evaluate(()=>{
    const vh=innerHeight,rem=parseFloat(getComputedStyle(document.documentElement).fontSize);
    const profile=document.querySelector('.desktop-right > .profile');
    const boundary=Math.max(vh*.31,Math.min(vh*.65,profile.getBoundingClientRect().top+scrollY-rem*.5));
    return {actual:document.querySelector('#lifeSheet').getBoundingClientRect().top,expected:boundary,
      scrollable:document.documentElement.scrollHeight>vh,overflow:getComputedStyle(document.body).overflowY,
      touch:getComputedStyle(document.querySelector('#sheetContent')).touchAction};
   });
   assert.ok(Math.abs(split.actual-split.expected)<4,'middle snap follows the status/profile boundary');
   assert.equal(split.overflow,'auto','background remains scrollable');
   assert.equal(split.touch,'pan-y','record scrolling is independent of sheet gestures');
   const backgroundScroll=await page.evaluate(()=>{
    const profile=document.querySelector('.desktop-right > .profile');
    const oldHeight=profile.style.minHeight;
    profile.style.minHeight='150vh'; // A short toddler profile needs no scrolling; simulate long school history.
    const canScroll=document.documentElement.scrollHeight>innerHeight;
    const sheet=document.querySelector('#lifeSheet'),before=sheet.getBoundingClientRect().top;
    window.scrollTo(0,Math.min(90,document.documentElement.scrollHeight-innerHeight));
    const moved=window.scrollY>0,stationary=Math.abs(sheet.getBoundingClientRect().top-before)<1;
    window.scrollTo(0,0);
    profile.style.minHeight=oldHeight;
    return {canScroll,moved,stationary};
   });
   assert.ok(backgroundScroll.canScroll&&backgroundScroll.moved,'long profile scrolls behind the middle sheet');
   assert.equal(backgroundScroll.stationary,true,'fixed sheet stays still during page scrolling');
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
   assert.equal(await page.locator('.metric-stress .gauge-name').textContent(),'정신병');
   assert.equal(await page.locator('.gauge.metric-money').evaluate(el=>!!el.closest('.gauge-group-finance')),true,'currency rows share a compact group');
  }
  assert.ok(await page.locator('#gaugesList .gauge-metric-icon').count()>=3,'every active metric has its own SVG icon');
  // One confirmation settles inside the same daily paper; the reward claim closes it and resumes life.
  await page.locator('#resumeDailyChoice').click();
  assert.equal(await page.locator('#dailyPaperConfirm').isDisabled(),true);
  await page.locator('#dailyChoiceBody .inline-choice').first().click();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'marking a choice never settles it');
  assert.equal(await page.locator('#dailyPaperConfirm').isEnabled(),true);
  await page.locator('#dailyPaperConfirm').click();
  await page.locator('#dailyChoiceDialog.is-reward .daily-reward-hero').waitFor();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'reward remains in the original daily paper');
  assert.equal(await page.locator('#dailyPaperConfirm').textContent(),'보상 받기');
  assert.ok(await page.locator('#dailyChoiceDialog .daily-reward-tokens .token.token-icon-pill').count()>0 ||
   await page.locator('#dailyChoiceDialog .daily-reward-empty').count()===1,
   'actual effects use shared tokens and zero-effect choices display an honest empty state');
  await page.locator('#dailyPaperConfirm').click();
  await page.waitForFunction(()=>!document.querySelector('#dailyChoiceDialog').open);
  assert.equal(await page.locator('#log .record-choice').count()>=1,true,'choice and outcome are stored together in history');
  assert.ok((await page.locator('#log .record-choice').first().textContent()).includes('내 선택'));
  assert.equal(await page.locator('#log .record-choice .continue-story').count(),0,'ordinary choices require no next-story acknowledgement');
  assert.equal(await page.locator('#log .record-review-fallback').count(),0,'no transient review fallback banner');
  const savedChoice=await page.evaluate(()=>JSON.parse(localStorage.getItem('callOfgukmin__ui__v1')));
  assert.equal(savedChoice.simulation.awaitingContinuation,false,'routine choice no longer pauses the simulation');
  assert.equal(savedChoice.simulation.reviewBefore,undefined,'routine choices do not save redundant review state');
  const outcome=Object.values(savedChoice.simulation.choices).find(x=>x.outcome)?.outcome;
  assert.ok(outcome?.label&&outcome.historyTo>=outcome.historyFrom,'settled outcome and history range survive');
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false,'reloading does not trigger a modal automatically');
  assert.ok(await page.locator('#log .record-choice').count()>=1,'outcome survives reload without replay clicks');
  assert.equal(await page.locator('#log .record-choice .continue-story').count(),0);
  await page.goto(base+'html/game.html?systems=1',{waitUntil:'domcontentloaded'});
  if(await page.locator('#dailyChoiceDialog').isVisible())await page.keyboard.press('Escape');
  const before=await page.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1'));

  for(const [button,kind] of [['previewSchool','school-dialog'],['previewParty','ballot-dialog']]){
   await page.locator('#'+button).click();await page.locator('#choiceDialog.'+kind).waitFor();await page.locator('#options button').first().click();await page.locator('#confirm').click();assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1')),before);
  }

  // A: an opt-in test content pack uses the same engine as future content.
  await page.locator('#startSystemDemo').click();await page.locator('#advanceTurn').click();assert.ok((await page.locator('#log').textContent()).includes('검증 사건'));
  // B: actual progress and choice UI; paused clock and persisted pending choice.
  assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().progress.value),0.5,
   'logical event progress remains accurate even when the decorative bar is hidden');
  assert.equal(await page.locator('#choiceTiming').isVisible(),false,'no redundant progress bar during manual verification');
  await page.locator('#advanceTurn').click();assert.equal(await page.locator('#advanceTurn').isDisabled(),true);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),false);
  await page.locator('#resumeDailyChoice').click();
  await page.locator('#dailyChoiceBody .inline-choice').first().waitFor();
  assert.equal(await page.locator('#dailyChoiceDialog').isVisible(),true,'explicitly reopened saved choice is now visible');
  await page.locator('#dailyChoiceBody .inline-choice').first().evaluate(b=>{b.click();b.click();});
  assert.equal(await page.locator('#dailyChoiceBody .inline-choice[aria-pressed=true]').count(),1,'double marking does not settle');
  assert.ok(await page.locator('#dailyChoiceBody .daily-choice-effect.metric-impact.metric-money').count()>0,
   'a real money change is visualized as shared metric pill before settlement');
  await page.locator('#dailyPaperConfirm').click();
  await page.locator('#dailyChoiceDialog.is-reward .daily-reward-hero').waitFor();
  assert.equal(await page.locator('#dailyPaperConfirm').textContent(),'보상 받기');
  await page.locator('#dailyPaperConfirm').click();
  await page.waitForFunction(()=>!document.querySelector('#dailyChoiceDialog').open);
  assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().reviewPending),false,
   'system demo is intentionally configured without a post-choice pause');
  assert.ok(await page.locator('#log .record-impacts .metric-impact.metric-money .impact-arrow').count()>0,
   'instant demo choices retain the same money arrow in permanent history');
  assert.ok(await page.locator('#log .record-impacts .metric-impact.metric-health').count()>0,
   'instant demo history retains its actual health cost');
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
  await page.locator('#previewResult').click();await page.locator('#resultPosterMount .gk-poster').waitFor();await page.locator('#resultBack').click();
  await page.waitForFunction(()=>document.querySelector('#enterGame')?.textContent.includes('이어서 플레이하기'));
  await page.locator('#enterGame').click();
  await page.locator('.school-token-complete').waitFor();
  const layout=await page.evaluate(()=>{
   const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
   return {poster:box('#playerPosterMount'),profile:box('.profile'),gauges:box('.gauges'),sheet:box('.sheet'),log:box('#log'),action:box('#action'),head:box('.sheet-head'),progress:box('#choiceTiming'),sheetPosition:getComputedStyle(document.querySelector('.sheet')).position,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(layout.overflow,false);assert.ok(layout.log.height>30,'history remains readable');assert.ok(layout.progress.height===0||layout.progress.y>=layout.head.bottom-1,'conditional progress placement');assert.ok(layout.action.bottom<=viewport.height+1,'actions stay within viewport');
  if(name==='desktop'){assert.ok(Math.abs(layout.poster.width-layout.gauges.width)<1);assert.notEqual(layout.sheetPosition,'fixed');}else{assert.equal(layout.sheetPosition,'fixed');assert.ok(Math.abs(layout.sheet.bottom-viewport.height)<1);}
  await page.screenshot({path:`${artifacts}/${name}-completed.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__playable__v1')),'legacy-browser-sentinel');
  await page.goto(base+'html/waiting.html',{waitUntil:'domcontentloaded'});
  page.once('dialog',dialog=>dialog.accept());await page.locator('#rerollPersona').click();const fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem('callOfgukmin__ui__v1')));assert.equal(fresh.simulation,undefined);assert.equal(fresh.stats.money,0);
  assert.deepEqual(errors,[]);console.log(`PASS ${name}: A–F, reload, previews, save preservation, layout`);await context.close();
 }

 // The countdown is presentation-only: the bar progresses for five seconds and never settles a choice.
 const timedContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const timedPage=await timedContext.newPage(),timerErrors=[];
 timedPage.on('pageerror',e=>timerErrors.push(e.message));
 await timedPage.route('https://fonts.googleapis.com/**',route=>route.abort());
 await timedPage.goto(base+'html/game.html',{waitUntil:'domcontentloaded'});
 await timedPage.locator('#resumeDailyChoice.is-auto-opening').waitFor();
 const firstPending=await timedPage.evaluate(()=>GukminGame.session.snapshot().choice.token);
 await timedPage.waitForTimeout(2500);
 assert.equal(await timedPage.locator('#dailyChoiceDialog').isVisible(),false,'diary waits for the full countdown');
 const midRatio=await timedPage.locator('.auto-choice-fill').evaluate(el=>{
  const m=getComputedStyle(el).transform;return m==='none'?0:Number(m.split('(')[1].split(',')[0]);
 });
 assert.ok(midRatio>.25&&midRatio<.85,'countdown bar advances continuously over real time');
 await timedPage.locator('#dailyChoiceDialog[open]').waitFor({timeout:4500});
 assert.equal(await timedPage.evaluate(()=>GukminGame.session.snapshot().choice?.token),firstPending,
  'the timer only opens the diary and never commits a choice');
 await timedPage.keyboard.press('Escape');
 await timedPage.waitForFunction(()=>!document.querySelector('#dailyChoiceDialog').open);
 assert.equal(await timedPage.locator('#resumeDailyChoice.is-auto-opening').count(),0,
  'manual dismissal cancels auto reopening for the same token');
 await timedPage.waitForTimeout(5300);
 assert.equal(await timedPage.locator('#dailyChoiceDialog').isVisible(),false,
  'a manually dismissed diary stays closed even past the old countdown deadline');
 await timedPage.locator('#resumeDailyChoice').click();
 assert.equal(await timedPage.locator('#dailyChoiceDialog').isVisible(),true,'manual re-entry works immediately');
 const gaugeMotion=await timedPage.evaluate(()=>{
  const before=GukminGame.session.snapshot().persona;
  const person={...before,stats:{...before.stats,stress:55}};
  GukminStatus.render(document,person);
  const node=document.querySelector('.metric-stress .ui-progress-fill');
  return {target:node.dataset.ratio,duration:getComputedStyle(node).transitionDuration};
 });
 assert.equal(gaugeMotion.target,'0.55','synthetic state change sets the correct real target');
 assert.match(gaugeMotion.duration,/0\.5s/,'gauge transitions use shared half-second motion');
 await timedPage.waitForTimeout(90);
 const intermediate=await timedPage.locator('.metric-stress .ui-progress-fill').evaluate(el=>{
  const m=getComputedStyle(el).transform;return m==='none'?0:Number(m.split('(')[1].split(',')[0]);
 });
 assert.ok(intermediate>0&&intermediate<.55,'visual stat fill interpolates rather than jumping to its target');
 assert.deepEqual(timerErrors,[]);
 await timedContext.close();
 console.log('PASS timed diary: smooth bar, 5-second auto-open, no auto-choice, dismiss stays dismissed');

 // Saved game visibility: continuing must not silently restart, resetting must be confirmed.
 const recall=await browser.newContext({viewport:{width:390,height:844}});
 const recallPage=await recall.newPage();
 await recallPage.goto(base+'html/game.html',{waitUntil:'domcontentloaded'});
 const original=await recallPage.evaluate(()=>{const s=GukminGame.session.snapshot();return {turn:s.runtime.turn,token:s.choice?.token};});
 await recallPage.goto(base+'html/waiting.html',{waitUntil:'domcontentloaded'});
 assert.match(await recallPage.locator('#enterGame').textContent(),/이어서 플레이하기/);
 assert.match(await recallPage.locator('#rerollPersona').textContent(),/기록 초기화/);
 recallPage.once('dialog',dialog=>dialog.dismiss());
 await recallPage.locator('#rerollPersona').click();
 await recallPage.locator('#enterGame').click();
 await recallPage.locator('#playerPosterMount .gk-poster').waitFor();
 const restored=await recallPage.evaluate(()=>GukminGame.session.snapshot());
 assert.equal(restored.runtime.turn,original.turn);
 assert.equal(restored.choice?.token,original.token);
 await recallPage.goto(base+'html/waiting.html',{waitUntil:'domcontentloaded'});
 recallPage.once('dialog',dialog=>dialog.accept());
 await recallPage.locator('#rerollPersona').click();
 assert.match(await recallPage.locator('#enterGame').textContent(),/인생 시작하기/);
 await recallPage.locator('#enterGame').click();
 await recallPage.locator('#birthIntro').waitFor({state:'visible'});
 await recallPage.locator('#birthIntroSkip').evaluate(button=>button.click());
 await recallPage.locator('#resumeDailyChoice').waitFor({state:'visible'});
 assert.equal(await recallPage.locator('#dailyChoiceDialog').isVisible(),false);
 assert.equal(await recallPage.locator('#resumeDailyChoice').isVisible(),true);
 const newStory=await recallPage.evaluate(()=>GukminGame.session.snapshot().choice.scenarioId);
 assert.ok(newStory,'replaying must open the updated deterministic storyline');
 await recall.close();
 console.log('PASS saved life: visible replay action, confirmed restart, new branching storyline');

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
 assert.ok(await examPage.locator('#lifeDecisionDialog .life-effects .token[data-token-kind=metric]').count()>0,
 'exam forecast uses the same semantic token DOM, not independent text badges');
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
    const scene=document.getElementById('lifeCinematic');
    if(scene&&!scene.hidden)document.getElementById('lifeCinematicDismiss').click();
    const snap=s.snapshot(),choice=snap.choice;
    if(snap.reviewPending){s.run();continue;}
    if(!choice){
     s.run();const settled=s.snapshot();
     if(settled.choice||settled.reviewPending)continue;
     return {age:settled.persona.age,turn:settled.runtime.turn,choice:null};
    }
    if(choice.presentation?.type===target)return {age:snap.persona.age,turn:snap.runtime.turn,choice:choice.id};
    const first=choice.options.find(o=>o.available);
    if(!first)throw new Error('No legal choice: '+choice.id);
    s.resolve(choice.token,first.id);
    if(choice.layer==='한방 선택'&&!s.snapshot().reviewPending)throw new Error('Major choice review did not persist');
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
  assert.equal(ended.age,19);assert.equal(ended.turn,99);
  assert.equal(await p.locator('#choiceTiming').isVisible(),false,'completed chapter has no meaningless progress bar');
  assert.equal(await p.locator('.life-chapter-complete button').count(),1,'completed chapter has an explicit replay action');
  assert.match(await p.locator('.metric-schoolScore .gauge-value').textContent(),/[1-5]등급/);
  assert.match(await p.locator('.metric-exam .gauge-value').textContent(),/[1-9]등급/);
  assert.equal(await p.locator('.gauge-group-academics .gauge-progress-track').count(),0,'grades have no misleading completion bars');
  assert.equal(await p.locator('.metric-stress .gauge-name').textContent(),'정신병','approved metric name is preserved');
  const metricOverflow=await p.locator('.status>.gauges').evaluate(card=>{
   const bounds=card.getBoundingClientRect();
   return [...card.querySelectorAll('.gauge-name,.gauge-value')].some(el=>{
    const rect=el.getBoundingClientRect();
    return rect.left<bounds.left-1||rect.right>bounds.right+1;
   });
  });
  assert.equal(metricOverflow,false,'metric labels and values fit the status card');
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
