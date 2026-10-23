/* Real scene data, shared choices, responsive document/site surfaces and save recovery. */
import assert from 'node:assert/strict';
import {returningPage} from './browserSession.mjs';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdir} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'}),base=`http://127.0.0.1:${port}/callOfgukmin/`;let browser;
const artifacts='/tmp/gukmin-adult-surfaces';await mkdir(artifacts,{recursive:true});
try{
 for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport] of [['short',{width:320,height:568}],['mobile',{width:390,height:844}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await returningPage(context),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto(base+'html/game.html');await page.waitForFunction(()=>!!GukminGame.session);
  const seed=async(stage,accepted=true)=>{
   await page.evaluate(({stage,accepted})=>{
    localStorage.setItem('callOfgukmin__controls__v1',JSON.stringify({mode:'manual',paused:false}));
    const p=GukminPlayer.generate();Object.assign(p,{age:24,phase:'adult',name:'김서연',gender:'female',job:'기업 실무직',traits:[],familyTier:'silver',admissionSeed:'adult-surfaces'});Object.assign(p.stats,{stress:4,illness:0,money:8000000,relations:18,income:2400000});
    p.schoolHistory=[{id:'old-high',kind:'high',name:'기록고등학교',status:'graduated'},{id:'uni',kind:'uni',name:'한국대학교 사회과학계열',status:'enrolled'}];
    p.attributes={admissionAttempts:1,admissionDestination:'college',societyActive:true,societyComplete:false,societyStep:stage,societyMonths:12,societyAgeBase:23,collegeName:'한국대학교 사회과학계열',collegeYears:4,collegeCompleted:1,collegeStatus:'재학',militaryStatus:stage==='military-service'?'복무 중':'미복무',militaryBranch:'부사관',militaryDuration:48,employmentStatus:['work','business'].includes(stage)?'재직':'구직',employmentSector:stage==='business'?'business':'private',careerCurrent:'기업 실무직',careerMonths:6,careerChapterPeriods:1,jobTarget:'private',jobAccepted:accepted,jobOfferIncome:2400000,pressureGuideSeen:true};
    const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p}).snapshot();for(const event of pack.events)s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};s.runtime.events['society:line']={status:'unseen',count:0,nextAt:99};s.runtime.turn=99;p.simulation=s.runtime;GukminPlayer.save(p);
   },{stage,accepted});
   await page.reload();await page.waitForFunction(()=>!!GukminGame.session);await page.evaluate(()=>GukminGame.session.run());await page.locator('#resumeDailyChoice').click();await page.locator('#dailyChoiceDialog[open]').waitFor();
  };
  const sheet=page.locator('#dailyChoiceDialog');
  const stages=['college-program','college-funding','college-year','military','military-service','career-search','job-offer','work','business','community','recovery','politics'];
  for(const stage of stages){
   await seed(stage);assert.equal(await sheet.getAttribute('data-adult-surface'),stage);assert.equal(await page.locator('.adult-surface').count(),1);assert.ok((await page.locator('.adult-hero h3').textContent()).length);assert.equal(await sheet.evaluate(e=>e.scrollWidth>e.clientWidth+1),false,stage+' sheet overflow');assert.equal(await page.locator('.adult-surface').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,stage+' surface overflow');
   const readable=await page.locator('.adult-medium').evaluate(token=>{
    const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});
    const luminance=value=>rgb(value).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0);
    const fg=luminance(getComputedStyle(token.querySelector('.token-name')).color),bg=luminance(getComputedStyle(token).backgroundColor);return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
   });assert.ok(readable>=4.5,stage+' badge contrast');
   const before=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot()));await page.locator('.adult-brief summary').click();await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});await page.locator('#resumeDailyChoice').click();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot())),before,'preview/fold must not settle '+stage);
   if(['college-funding','career-search','job-offer','business','work','military'].includes(stage)){await page.locator('#dailyChoiceBody').evaluate(e=>e.scrollTop=0);await page.screenshot({path:artifacts+'/'+name+'-'+stage+'.png'});}
   if(stage==='college-funding'){
    assert.match(await page.locator('.adult-bill-total').textContent(),/3,500,000원/);await page.locator('[data-action=fund-cash]').click();await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();assert.equal(await page.locator('.adult-receipt').count(),1);assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.money),4500000);await page.reload();await page.locator('#dailyChoiceDialog.is-reward').waitFor();assert.equal(await page.locator('.adult-receipt').count(),1);assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.money),4500000);await page.locator('#dailyPaperConfirm').click();await page.waitForFunction(()=>GukminGame.session.snapshot().choice?.presentation.stage==='college-year');
   }
   if(stage==='job-offer'){assert.equal(await page.locator('.adult-result-status').textContent(),'채용 제안');assert.match(await page.locator('.adult-facts').textContent(),/2,400,000원/);}
   if(stage==='career-search')assert.equal(await page.locator('.adult-job-card').count(),3);
  }
  await seed('job-offer',false);assert.equal(await page.locator('.adult-result-status').textContent(),'불합격');assert.equal(await page.locator('[data-action=accept]').count(),0);
  // Switching to a school scene cannot retain an adult portal/document skin.
  await page.evaluate(()=>{const p=GukminPlayer.generate();p.attributes={pressureGuideSeen:true};GukminPlayer.save(p);});await page.reload();await page.waitForFunction(()=>!!GukminGame.session);await page.evaluate(()=>GukminGame.session.run());await page.locator('#resumeDailyChoice').click();assert.equal(await sheet.getAttribute('data-adult-surface'),null);assert.equal(await page.locator('.adult-surface').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS adult surfaces '+name+': 12 realistic routes, responsive layouts, safe preview/fold, tuition settlement/reload and student isolation');await context.close();
 }
}finally{await browser?.close();server.kill();}
