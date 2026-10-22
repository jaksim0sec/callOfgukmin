/* Real player controls: a missing pause guard must fail these state assertions. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const artifacts=process.env.BROWSER_ARTIFACTS||'/tmp/callOfgukmin-playback';await mkdir(artifacts,{recursive:true});
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'}),base=process.env.BROWSER_BASE_URL||`http://127.0.0.1:${port}/callOfgukmin/`;let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(`http://127.0.0.1:${port}/callOfgukmin/`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage','--ignore-certificate-errors']});
 for(const [name,viewport] of [['desktop',{width:1365,height:900}],['mobile',{width:390,height:844}],['small',{width:320,height:568}]]){
  const context=await browser.newContext({viewport,hasTouch:name!=='desktop',reducedMotion:name==='small'?'reduce':'no-preference',ignoreHTTPSErrors:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base+'html/game.html');await page.waitForFunction(()=>!!window.GukminGame?.session);
  assert.equal(await page.locator('#gameTutorial[open]').count(),1,'first in-game entry explains the game');assert.equal(await page.locator('.tutorial-stat-card').count(),2);assert.match(await page.locator('#tutorialBody').textContent(),/관계/);
  await page.evaluate(()=>localStorage.setItem('callOfgukmin__playable__v1','legacy-sentinel'));
  const state=()=>page.evaluate(()=>GukminGame.session.snapshot());const initial=await state();
  await page.waitForTimeout(5300);assert.deepEqual(await state(),initial,'tutorial freezes state and auto-open timers');
  assert.equal(await page.locator('#dailyChoiceDialog[open]').count(),0);
  await page.screenshot({path:`${artifacts}/${name}-tutorial.png`});
  for(let i=0;i<4;i++)await page.locator('#tutorialNext').click();
  await page.locator('#hideTutorial').check();await page.locator('#tutorialNext').click();
  assert.equal(await page.locator('#gameTutorial[open]').count(),0);
  assert.equal(await page.locator('#playbackMode').getAttribute('role'),'switch');assert.equal(await page.locator('#playbackMode').getAttribute('aria-checked'),'false','first entry defaults to deliberate manual progression');
  const manual=await state();await page.waitForTimeout(5300);assert.deepEqual(await state(),manual);assert.equal(await page.locator('#dailyChoiceDialog[open]').count(),0,'manual mode never forces a choice open');
  if(name!=='desktop'){await page.locator('#sheetToggle').click();await page.waitForFunction(()=>!document.getElementById('lifeSheet').classList.contains('is-springing'));}
  assert.equal(await page.locator('#historyAdvance button:visible').count(),1,'one primary action');assert.equal(await page.locator('#playbackNext').count(),0);const historyButton=page.locator('#historyAdvance button:visible');await historyButton.scrollIntoViewIfNeeded();const nextSize=await historyButton.boundingBox();assert.ok(nextSize.height>=48&&nextSize.width>=200,'history next is a large action');for(let i=0;i<10&&!await page.evaluate(()=>!!GukminGame.session.snapshot().choice);i++)await page.locator('#historyAdvance button:visible').click();await page.locator('#historyAdvance button:visible').click();await page.locator('#dailyChoiceDialog[open]').waitFor();
  await page.locator('#dailyChoiceBody .inline-choice').first().click();await page.locator('#dailyPaperConfirm').click();await page.locator('#dailyChoiceDialog.is-reward').waitFor();
  const rewarded=await state();await page.locator('#dailyPaperConfirm').click();await page.waitForFunction(turn=>GukminGame.session.snapshot().runtime.turn>turn,rewarded.runtime.turn);
  const afterManual=await state();assert.ok(afterManual.runtime.turn>rewarded.runtime.turn,'claiming reward advances to a next moment in manual mode');
  await page.waitForTimeout(1000);assert.deepEqual(await state(),afterManual,'manual progression stops again');
  await page.locator('#playbackPause').click();assert.match(await page.locator('#playbackPause').textContent(),/재개/);
  const paused=await state();assert.equal(await page.locator('#historyNext').isDisabled(),true);assert.equal(await page.locator('#historyAdvance button:visible').isDisabled(),true);await page.locator('#historyAdvance button:visible').dispatchEvent('click');await page.waitForTimeout(500);assert.deepEqual(await state(),paused,'next cannot advance while paused');
  await page.reload();assert.equal(await page.locator('#gameTutorial[open]').count(),0,'do not show again survives reload');assert.equal(await page.locator('#playbackMode').getAttribute('aria-checked'),'false');assert.match(await page.locator('#playbackPause').textContent(),/재개/);
  await page.locator('#playbackHelp').click();assert.equal(await page.locator('#gameTutorial[open]').count(),1,'help can be reopened');await page.keyboard.press('Escape');assert.match(await page.locator('#playbackPause').textContent(),/재개/,'closing help retains user pause');
  await page.locator('#playbackPause').click();await page.locator('#playbackMode').click();
  await page.waitForFunction(()=>!!GukminGame.session.snapshot().choice);
  await page.locator('#playbackPause').click();const waiting=await state();await page.waitForTimeout(5300);assert.deepEqual(await state(),waiting);assert.equal(await page.locator('#dailyChoiceDialog[open]').count(),0,'pause freezes an existing auto-open countdown');
  await page.locator('#playbackPause').click();await page.locator('#dailyChoiceDialog[open]').waitFor({timeout:7000});assert.deepEqual(await state(),waiting,'automatic open does not choose for the player');
  await page.keyboard.press('Escape');await page.waitForTimeout(350);await page.locator('#playbackPause').click();
  await page.screenshot({path:`${artifacts}/${name}-controls.png`});
  for(const id of ['playbackMode','playbackPause','historyAdvance','playbackHelp']){const r=await page.locator('#'+id).boundingBox();assert.ok(r.x>=0&&r.x+r.width<=viewport.width+1&&r.y>=0&&r.y+r.height<=viewport.height,'controls fit visible sheet: '+id);}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(await page.evaluate(()=>localStorage.getItem('callOfgukmin__playable__v1')),'legacy-sentinel');assert.deepEqual(errors,[]);
  console.log('PASS playback '+name+': tutorial, manual/auto, pause/reload, choice integrity, viewport');await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',ignoreHTTPSErrors:true}),page=await context.newPage();
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto(base+'html/game.html');
 await page.locator('#hideTutorial').uncheck();await page.locator('#tutorialSkip').click();await page.reload();assert.equal(await page.locator('#gameTutorial[open]').count(),1,'unchecked guide remains available on entry');
 await page.locator('#hideTutorial').check();await page.keyboard.press('Escape');
 await page.evaluate(()=>{GukminPlayer.save(GukminPlayer.generate());localStorage.setItem('callOfgukmin__controls__v1',JSON.stringify({mode:'manual',paused:false}));});
 await page.reload();const first=await page.evaluate(()=>GukminGame.session.snapshot());await page.waitForTimeout(500);assert.deepEqual(await page.evaluate(()=>GukminGame.session.snapshot()),first,'fresh manual game stays at its saved boundary');
 for(let i=0;i<10;i++){if(await page.evaluate(()=>!!GukminGame.session.snapshot().choice))break;await page.locator('#historyAdvance button:visible').click();}
 const birthChoice=await page.evaluate(()=>GukminGame.session.snapshot());assert.equal(birthChoice.choice.id,'infant:home');assert.equal(birthChoice.persona.age,3,'manual stepping does not miss first choice');
 console.log('PASS playback preferences: unchecked guide repeats, fresh manual entry preserves first choice');await context.close();
}finally{await browser?.close();server.kill();}
