/* Focused browser coverage for naming, real result sharing and store purchases. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdir,readFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const artifacts=process.env.BROWSER_ARTIFACTS||'/tmp/callOfgukmin-refresh';
await mkdir(artifacts,{recursive:true});
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'});
const base=`http://127.0.0.1:${port}/callOfgukmin/`;let browser;
try{
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,viewport] of [['desktop',{width:1365,height:900}],['mobile',{width:390,height:844}],['small',{width:320,height:568}]]){
  const context=await browser.newContext({viewport,hasTouch:name!=='desktop',isMobile:name!=='desktop',reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/result.html');assert.match(await page.locator('#resultTitle').textContent(),/아직 쓰이지/);assert.equal(await page.locator('#shareResult').isDisabled(),true);assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1')),null,'viewing an empty result creates no save');
  await page.goto(base+'html/waiting.html');await page.locator('#personaName').fill('   ');await page.locator('#enterGame').click();assert.equal(await page.locator('#birthIntro').isVisible(),false,'blank names cannot start a life');
  await page.locator('#personaName').fill('가나다라마바사아자차카타');assert.equal(await page.locator('#waitingPosterMount .gk-poster-canvas').evaluate(el=>el.getBoundingClientRect().right<=el.closest('.gk-poster').getBoundingClientRect().right),true,'long names fit the poster');
  await page.locator('#personaName').fill('김새봄');if(name!=='desktop')assert.ok(await page.locator('.gk-poster-save').evaluate(el=>el.getBoundingClientRect().height<40),'touch poster download stays a small button');assert.equal(await page.locator('#waitingName').textContent(),'김새봄');assert.match(await page.locator('#waitingPosterMount .gk-poster-accessible').textContent(),/김새봄/);
  await page.screenshot({path:`${artifacts}/${name}-waiting.png`,fullPage:true});
  await page.locator('#enterGame').click();await page.locator('#birthIntro').waitFor();assert.equal(await page.locator('#birthIntroName').textContent(),'김새봄');await page.locator('#birthIntroSkip').click();await page.locator('#lifeHeadline').waitFor();
  await page.evaluate(()=>localStorage.setItem('callOfgukmin__playable__v1','legacy-sentinel'));
  const before=await page.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1'));
  await page.goto(base+'html/result.html');assert.match(await page.locator('#resultSummary').textContent(),/김새봄/);assert.match(await page.locator('#resultTitle').textContent(),/쓰는 중/);assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1')),before,'result is a read-only projection');
  await page.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{window.sharedRecord=data;}}));await page.locator('#shareResult').click();assert.match((await page.evaluate(()=>window.sharedRecord)).text,/김새봄/);
  await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedRecord=text;}}});});await page.locator('#shareResult').click();assert.match(await page.evaluate(()=>window.copiedRecord),/index.html/);
  const downloading=page.waitForEvent('download');await page.locator('#downloadResult').click();const download=await downloading;await download.saveAs(`${artifacts}/${name}-record.png`);const png=await readFile(`${artifacts}/${name}-record.png`);assert.equal(png.readUInt32BE(16),1080);assert.equal(png.readUInt32BE(20),1350);
  await page.goto(base+'html/waiting.html');assert.equal(await page.locator('#personaName').isDisabled(),true);assert.equal(await page.locator('#waitingName').textContent(),'김새봄');
  await page.evaluate(()=>{const p=GukminPlayer.load();Object.assign(p,{phase:'high',age:18,job:'고등학생'});p.stats={...p.stats,stress:20,relations:12,money:100000,schoolScore:22,exam:21};p.attributes={schoolTrack:'general',admissionAttempts:1};delete p.simulation;const pack=GukminDirector.content(p),t=GukminTimeline.create({...pack,persona:p}),s=t.snapshot();for(const event of pack.events)s.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};const target=pack.events.find(e=>e.id==='high:teamwork');s.runtime.events[target.id]={status:'unseen',count:0,nextAt:target.at};s.runtime.turn=target.at;s.runtime.progressStart=target.at;s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);});
  await page.goto(base+'html/game.html');await page.locator('#openConvenienceStore').click();await page.locator('#convenienceStore[open]').waitFor();assert.equal(await page.locator('.store-item').count(),2);await page.screenshot({path:`${artifacts}/${name}-store.png`});
  const turn=await page.evaluate(()=>GukminGame.session.snapshot().runtime.turn);await page.locator('.store-item').first().click();assert.match(await page.locator('#storeNotice').textContent(),/구매 완료/);assert.equal(await page.locator('.store-item:enabled').count(),0);const after=await page.evaluate(()=>GukminGame.session.snapshot());assert.equal(after.persona.stats.money,85000);assert.equal(after.persona.stats.stress,18);assert.equal(after.runtime.turn,turn);await page.locator('#convenienceStore .close').click();await page.reload();assert.equal(await page.evaluate(()=>GukminGame.session.storeStatus().remaining),4);
  await page.evaluate(()=>{const p=GukminPlayer.load();p.attributes={...p.attributes,admissionDestination:'college',earlyStatus:'accepted',earlyOffer:'서울대학교 경영학과',csatSubmitted:false,highFinalSubmitted:true};GukminPlayer.save(p);});await page.goto(base+'html/result.html');assert.match(await page.locator('#resultTitle').textContent(),/더 넓은/);assert.match(await page.locator('#resultFacts').textContent(),/서울대학교 경영학과/);assert.match(await page.locator('#resultFacts').textContent(),/아직 확정되지 않음/);await page.screenshot({path:`${artifacts}/${name}-result.png`,fullPage:true});
  await page.evaluate(()=>{const p=GukminPlayer.load();p.attributes={...p.attributes,lifeEndReason:'정신병 한계',admissionDestination:'finished'};GukminPlayer.save(p);});await page.reload();assert.match(await page.locator('#resultSummary').textContent(),/정신병 한계/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__playable__v1')),'legacy-sentinel');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);console.log('PASS refresh '+name+': naming, resume, result, share, PNG, store and cooldown');await context.close();
 }
}finally{await browser?.close();server.kill();}
