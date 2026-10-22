/* Real service-worker installation, cold offline navigation, saved choices and cache upgrades. */
import assert from 'node:assert/strict';
import {returningPage} from './browserSession.mjs';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {readFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const artifacts=process.env.BROWSER_ARTIFACTS||'/tmp/callOfgukmin-pwa';await mkdir(artifacts,{recursive:true});
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'./index.html');assert.equal(manifest.scope,'./');
for(const icon of manifest.icons){const data=await readFile(resolve(root,icon.src)),[w,h]=icon.sizes.split('x').map(Number);assert.equal(data.readUInt32BE(16),w);assert.equal(data.readUInt32BE(20),h);}
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',dirname(root)],{stdio:'ignore'}),base=`http://127.0.0.1:${port}/callOfgukmin/`;let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const [name,viewport] of [['desktop',{width:1365,height:900}],['mobile',{width:390,height:844}]]){
  const profile=await mkdtemp('/tmp/gukmin-pwa-profile-');const context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage'],viewport,hasTouch:name==='mobile',reducedMotion:'reduce',acceptDownloads:true});browser=context;const page=await returningPage(context),errors=[];
  context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));page.on('pageerror',e=>errors.push(e.message));await context.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.goto(base);await page.locator('#enterGame').waitFor();await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const registration=await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return {scope:r.scope,state:r.active.state};});assert.equal(registration.scope,base);assert.equal(registration.state,'activated');
  const client=await context.newCDPSession(page);await client.send('Network.enable');await client.send('Network.setCacheDisabled',{cacheDisabled:true});
  const appManifest=await client.send('Page.getAppManifest');assert.deepEqual(appManifest.errors,[]);assert.ok(appManifest.url.endsWith('/callOfgukmin/manifest.json'));
  const installability=await client.send('Page.getInstallabilityErrors');assert.deepEqual(installability.installabilityErrors,[],'Chromium accepts the app manifest and icons');
  assert.equal(await page.locator('link[rel=apple-touch-icon]').count(),1);for(const link of await page.locator('link[rel=icon]').evaluateAll(nodes=>nodes.map(n=>n.href)))assert.equal((await context.request.get(link)).status(),200);
  await page.evaluate(()=>{localStorage.setItem('callOfgukmin__playable__v1','legacy-sentinel');const p=GukminPlayer.generate();p.name='오프라인확인';GukminPlayer.save(p);});
  await context.setOffline(true);
  const offline=await returningPage(context),offlineCDP=await context.newCDPSession(offline);await offlineCDP.send('Network.enable');await offlineCDP.send('Network.setCacheDisabled',{cacheDisabled:true});
  await offline.goto(base);await offline.locator('#waitingName').waitFor();assert.equal(await offline.locator('#waitingName').textContent(),'오프라인확인','a fresh offline page restores the real save');
  await offline.locator('#enterGame').click();await offline.locator('#skipFictionNotice').click();await offline.locator('#birthIntroSkip').click();await offline.waitForURL('**/game.html?*');await offline.waitForFunction(()=>window.GukminGame?.session);await offline.evaluate(()=>GukminGame.session.run());
  const before=await offline.evaluate(()=>GukminGame.session.snapshot());await offline.locator('#resumeDailyChoice').click();await offline.locator('#dailyChoiceBody .inline-choice').first().click();await offline.locator('#dailyPaperConfirm').click();await offline.locator('#dailyChoiceDialog.is-reward').waitFor();
  const settled=await offline.evaluate(()=>GukminGame.session.snapshot());assert.ok(settled.persona.history.length>before.persona.history.length);assert.equal(settled.reviewPending,true);
  await offline.reload();await offline.waitForFunction(()=>window.GukminGame?.session);assert.deepEqual(await offline.evaluate(()=>GukminGame.session.snapshot().persona.stats),settled.persona.stats);assert.equal(await offline.evaluate(()=>GukminGame.session.snapshot().persona.history.length),settled.persona.history.length,'offline reload cannot settle the same choice twice');
  const saved=await offline.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1'));await offline.goto(base+'html/result.html');await offline.locator('#resultRecap[open]').waitFor();await offline.locator('#skipResultRecap').click();assert.match(await offline.locator('#resultSummary').textContent(),/오프라인확인/);
  const downloading=offline.waitForEvent('download');await offline.locator('#downloadResult').click();const download=await downloading;await download.saveAs(`${artifacts}/${name}-offline-result.png`);const png=await readFile(`${artifacts}/${name}-offline-result.png`);assert.equal(png.readUInt32BE(16),1080);assert.equal(png.readUInt32BE(20),1350);assert.equal(await offline.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1')),saved);await offline.screenshot({path:`${artifacts}/${name}-offline.png`,fullPage:true});
  await context.setOffline(false);
  await offline.evaluate(async()=>{const cache=await caches.open('unrelated-app-cache');await cache.put(new Request(new URL('unrelated',document.baseURI)),new Response('keep'));await navigator.serviceWorker.register(new URL('sw.js?v=pwa-test-next',document.baseURI),{scope:new URL('./',document.baseURI).pathname,updateViaCache:'none'});});
  // Poll in Node: the page predicate must await asynchronous CacheStorage work.
  for(let i=0;i<100;i++){const ready=await offline.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration(),keys=await caches.keys();return r?.active?.state==='activated'&&r.active.scriptURL.includes('pwa-test-next')&&keys.includes('gukmin-shell-pwa-test-next')&&!keys.includes('gukmin-shell-class-visit-20261022');});if(ready)break;if(i===99)throw new Error('Updated worker did not finish cache cleanup');await new Promise(r=>setTimeout(r,100));}
  const keys=await offline.evaluate(()=>caches.keys());assert.ok(keys.includes('unrelated-app-cache'));assert.deepEqual(keys.filter(k=>k.startsWith('gukmin-shell-')),['gukmin-shell-pwa-test-next']);assert.equal(await offline.evaluate(()=>localStorage.getItem('callOfgukmin__ui__v1')),saved);assert.equal(await offline.evaluate(()=>localStorage.getItem('callOfgukmin__playable__v1')),'legacy-sentinel');
  await context.setOffline(true);await offline.reload();await offline.locator('#skipResultRecap').click();assert.match(await offline.locator('#resultSummary').textContent(),/오프라인확인/);assert.deepEqual(errors,[]);
  console.log('PASS PWA '+name+': installability, project scope, cold offline play/results/PNG, save restoration and safe cache upgrade');await context.close();browser=null;await rm(profile,{recursive:true,force:true});
 }
}finally{await browser?.close();server.kill();}
