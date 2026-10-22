/* Isolated notebook artwork integration. Never reads or overwrites a real save. */
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
 for(const [name,viewport] of [['mobile',{width:390,height:844}],['short',{width:320,height:568}],['desktop',{width:1365,height:900}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await returningPage(context),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');await page.waitForFunction(()=>!!GukminGame.session);
  await page.evaluate(()=>{
   localStorage.setItem('callOfgukmin__controls__v1',JSON.stringify({mode:'manual',paused:false}));localStorage.setItem('callOfgukmin__playable__v1','legacy-sentinel');
   const p=GukminPlayer.generate();p.phase='elementary';p.age=9;p.traits=['은수저'];p.familyTier='silver';p.stats.stress=0;p.stats.illness=0;p.stats.money=100000;p.attributes={pressureGuideSeen:true};
   const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p}).snapshot(),target=pack.events.find(e=>e.id==='elementary:afterschool');
   for(const event of pack.events)s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};s.runtime.events[target.id]={status:'unseen',count:0,nextAt:target.at};s.runtime.turn=target.at;s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);
  });await page.reload();await page.waitForFunction(()=>!!GukminGame.session);await page.evaluate(()=>GukminGame.session.run());await page.locator('#resumeDailyChoice').click();
  await page.locator('.daily-illustration img').waitFor();await page.waitForFunction(()=>document.querySelector('.daily-illustration img')?.naturalWidth===660);
  assert.equal(await page.locator('.daily-illustration').count(),1);assert.equal(await page.locator('.daily-illustration figcaption .daily-choice-story').count(),1);assert.equal(await page.locator('.daily-modal-body > .daily-scenario').count(),0);assert.ok(await page.locator('.daily-illustration figcaption').evaluate(e=>{const b=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return b.top>=p.top-1&&b.bottom<=p.bottom+1;}),'title and full description fit inside the photo');assert.match(await page.locator('.daily-illustration img').getAttribute('src'),/06-afterschool/);
  assert.ok(await page.locator('.daily-illustration img').evaluate(e=>{const b=e.getBoundingClientRect();return Math.abs(b.width/b.height-1.5)<.01;}));assert.equal(await page.locator('#dailyChoiceDialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
  assert.ok(await page.locator('#dailyPaperConfirm').evaluate(e=>{const b=e.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));
  const before=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona));await page.screenshot({path:'/tmp/gukmin-daily-illustration-'+name+'.png'});
  await page.locator('#dailyChoiceBody .inline-choice').first().click();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona)),before,'picking artwork/previewing an option never changes the save');
  await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward .daily-illustration').waitFor();const settled=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona.stats));
  await page.reload();await page.waitForFunction(()=>!!GukminGame.session);await page.locator('#dailyChoiceDialog.is-reward .daily-illustration').waitFor();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().persona.stats)),settled,'reward restore never applies effects twice');assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__playable__v1')),'legacy-sentinel');
  assert.deepEqual(await page.evaluate(()=>{const A=GukminDailyScenes.artworkFor;return [A({id:'infant:home',scenarioId:'toy-care'}).id,A({id:'high:commute',scenarioId:'morning-lab'}),A({id:'admission:third:last-week'}).id,A({id:'infant:play',presentation:{type:'chat'}}),A({id:'admission:first:destination'}),A({id:'middle:friends',scenarioId:'club-default',options:[{id:'option-0',result:{effects:{attributes:{clubPath:'media'}}}}]},'option-0').id];}),['04',null,'17',null,null,'10']);
  assert.deepEqual(errors,[]);console.log('PASS illustrated notebook '+name+': 3:2 image, layout, choice settlement, reward reload and scene mapping');await context.close();
 }
}finally{await browser?.close();server.kill();}
