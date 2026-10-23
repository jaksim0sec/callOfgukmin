import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {returningPage} from './browserSession.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),plain=x=>JSON.parse(JSON.stringify(x)),artifacts=process.env.BROWSER_ARTIFACTS||'/tmp/callOfgukmin-daily-improvements';
function setup(){
 const c=vm.createContext({console});c.window=c;
 for(const file of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/classroom'])vm.runInContext(readFileSync(resolve(root,'js/'+file+'.js'),'utf8'),c);
 return {c,P:c.GukminPlayer,E:c.GukminEffects};
}
function relay(env,seed,ability=8,trait=false){
 const p=env.P.generate();p.admissionSeed='relay-check-'+seed;p.age=10;p.phase='elementary';p.traits=trait?['체육']:[];p.stats.athletics=ability;p.stats.illness=0;p.stats.stress=0;p.attributes={classroomRevision:1,seatmate:'도윤',elementaryClass:3};
 const pack=env.c.GukminDirector.content(p);for(const [id,def] of Object.entries(pack.attributes))env.P.registerAttribute(id,def);
 const choice=pack.choices.find(x=>x.id==='classroom:sports'),script=choice.variants.find(x=>x.id==='doyun');
 const result=id=>env.E.apply(p,script.options.find(x=>x.id===id).result,{turn:38});
 return {p,choice,result};
}
test('relay varies across saved seeds while training and athletics improve the same race fairly',()=>{
 const env=setup(),places=new Set(),elite=new Set(),cheers=new Set();let trainedWins=0,untrainedWins=0;
 for(let seed=0;seed<160;seed++){
  const race=relay(env,seed),sprint=race.result('sprint'),handoff=race.result('handoff'),weak=relay(env,seed,0),strong=relay(env,seed,25,true);
  places.add(sprint.attributes.sportsPlace);elite.add(strong.result('sprint').attributes.sportsPlace);cheers.add(race.result('cheer').attributes.sportsPlace);
  assert.ok(sprint.attributes.sportsPlace<=handoff.attributes.sportsPlace,'extra sprint preparation cannot worsen the same draw');
  assert.ok(strong.result('sprint').attributes.sportsPlace<=weak.result('sprint').attributes.sportsPlace,'ability and a sports trait cannot worsen the same draw');
  assert.equal(race.result('cheer').attributes.sportsPlace,strong.result('cheer').attributes.sportsPlace,'cheering uses classmates rather than my running ability');
  trainedWins+=sprint.attributes.sportsPlace===1;untrainedWins+=weak.result('sprint').attributes.sportsPlace===1;
  assert.deepEqual(plain(race.choice),plain(relay(env,seed).choice),'same saved seed recreates the same race');
 }
 assert.deepEqual([...places].sort(),[1,2,3],'ordinary preparation can win or lose');
 assert.ok(elite.size>1,'even the strongest athlete sometimes loses');
 assert.deepEqual([...cheers].sort(),[1,2,3],'classmates can win or lose when I cheer');
 assert.ok(trainedWins>untrainedWins,'preparation increases victories across plays');
});

test('relay preserves athletics acquired after story generation beside every classmate',()=>{
 const env=setup(),race=relay(env,4,0);
 for(const script of race.choice.variants){
  const p=plain(race.p);p.stats.athletics=19;
  const result=env.E.apply(p,script.options.find(o=>o.id==='sprint').result,{turn:38});
  assert.ok(result.stats.athletics>=22,'existing practice remains when running beside '+script.id);
 }
});

test('a waiting relay freezes its draw through save recovery and settles rewards once',()=>{
 const env=setup(),race=relay(env,17),pack={contentId:'relay-recovery',attributes:env.c.GukminDirector.content(race.p).attributes,choices:[race.choice],events:[{id:race.choice.id,at:0,layer:'일상 이벤트',choice:race.choice.id}]};let saved;
 const first=env.c.GukminTimeline.create({...pack,persona:race.p,pauseAfterChoice:true,persist:p=>{saved=plain(p);return true;}});first.advance(0);
 const before=first.snapshot(),expected=race.result('sprint').attributes.sportsPlace;
 const restored=env.c.GukminTimeline.create({...pack,persona:saved,pauseAfterChoice:true});
 assert.deepEqual(plain(restored.snapshot().choice),plain(before.choice));
 assert.equal(restored.resolve(before.choice.token,'sprint'),true);
 const after=restored.snapshot();assert.equal(after.persona.attributes.sportsPlace,expected);assert.equal(restored.resolve(before.choice.token,'sprint'),false);
 assert.equal(after.persona.stats.money-before.persona.stats.money,expected===1?10000:0);
 assert.equal(after.persona.history.filter(h=>/^반 대항 계주 ·/.test(h.title)).length,1);
});

test('study app controls submit the authored response and preserve draft state on desktop and touch',async()=>{
 await mkdir(artifacts,{recursive:true});
 const {chromium}=createRequire(import.meta.url)('playwright');
 const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
 const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore'});let browser;
 try{
  const base=`http://127.0.0.1:${port}/`;
  for(let n=0;n<40;n++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const viewport of [{width:1365,height:900},{width:390,height:844},{width:320,height:568}]){
   const context=await browser.newContext({viewport,hasTouch:viewport.width<500,reducedMotion:'reduce'}),page=await returningPage(context),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.googleapis.com/**',route=>route.abort());
   await page.goto(base+'html/game.html');await page.waitForFunction(()=>!!window.GukminGame?.session);
   const seed=async()=>{
    await page.evaluate(()=>{const p=GukminPlayer.generate();p.age=16;p.phase='middle';p.stats.stress=3;p.stats.illness=0;p.stats.relations=10;p.stats.schoolScore=12;
     const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p,pauseAfterChoice:true}).snapshot(),id='middle:study-timer',target=pack.events.find(e=>e.id===id);for(const e of pack.events)s.runtime.events[e.id]={status:'completed',count:1,nextAt:e.at||0};s.runtime.events[id]={status:'unseen',count:0,nextAt:target.at};s.runtime.turn=target.at;s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);localStorage.setItem('callOfgukmin__controls__v1',JSON.stringify({mode:'manual',paused:false}));});
    await page.goto(base+'html/game.html');await page.evaluate(()=>GukminGame.session.run());await page.locator('#resumeDailyChoice').click();await page.locator('#dailyChoiceDialog[open]').waitFor();
   };
   await seed();
   const activate=async selector=>viewport.width<500?page.locator(selector).tap():page.locator(selector).click();
   assert.equal(await page.locator('.study-app-clock b').textContent(),'27시간 9분');
   await activate('.study-like');assert.equal(await page.locator('.study-like').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#dailyPaperConfirm').textContent(),'좋아요 남기기');
   await activate('.study-like');assert.equal(await page.locator('.study-like').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('#dailyPaperConfirm').isDisabled(),true);
   await activate('.study-comment-toggle');
   await page.evaluate(()=>GukminGame.session.apply('refresh-study-ui',{effects:{stats:{money:0}}}));
   assert.equal(await page.locator('.study-comment-toggle').getAttribute('aria-expanded'),'true','shared renders keep the open composer usable');
   assert.equal(await page.locator('#dailyChoiceDialog').evaluate(n=>n.scrollWidth>n.clientWidth+1),false,'timer and composer stay inside the sheet');
   await page.screenshot({path:resolve(artifacts,'study-'+viewport.width+'.png')});
   await activate('.study-comment-send');await page.locator('#dailyChoiceDialog.is-reward').waitFor({timeout:2000});
   assert.match(await page.locator('.study-own-comment').textContent(),/하루가 27시간인 멋진 청년/);
   const settled=await page.evaluate(()=>{const s=GukminGame.session.snapshot();return {reaction:s.persona.attributes.studyTimerReaction,relations:s.persona.stats.relations,stress:s.persona.stats.stress,closed:Object.values(s.runtime.choices).filter(c=>c.choiceId==='middle:study-timer'&&c.status==='closed').length};});
   assert.deepEqual(settled,{reaction:'comment',relations:9,stress:1,closed:1});
   await page.reload();await page.locator('.study-own-comment').waitFor();assert.equal(await page.locator('.study-comment-send').count(),0,'receipt has no inactive send control');assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.stats.relations),9);
   await seed();await activate('.study-like');await activate('#dailyPaperConfirm');await page.locator('#dailyChoiceDialog.is-reward').waitFor();assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.studyTimerReaction),'like');
   await seed();await activate('#dailyChoiceBody .inline-choice:last-child');await activate('#dailyPaperConfirm');await page.locator('#dailyChoiceDialog.is-reward').waitFor();assert.equal(await page.evaluate(()=>GukminGame.session.snapshot().persona.attributes.studyTimerReaction),'focus');
   assert.deepEqual(errors,[]);await context.close();
  }
 }finally{await browser?.close();server.kill();}
});

test('relay finish picture and ranking agree with every recorded place and equal lane distance',async()=>{
 await mkdir(artifacts,{recursive:true});
 const {chromium}=createRequire(import.meta.url)('playwright'),env=setup(),cases=[];
 for(const place of [1,2,3]){for(let seed=0;seed<500;seed++){const race=relay(env,seed);if(race.result('sprint').attributes.sportsPlace===place){cases.push({place,seed:race.p.admissionSeed});break;}}}
 assert.equal(cases.length,3);
 const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
 const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',root],{stdio:'ignore'});let browser;
 try{
  const base=`http://127.0.0.1:${port}/`;for(let n=0;n<40;n++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'}),page=await returningPage(context);
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());await page.goto(base+'html/game.html');await page.waitForFunction(()=>!!window.GukminGame?.session);
  for(const entry of cases){
   await page.evaluate(seed=>{const p=GukminPlayer.generate();p.admissionSeed=seed;p.age=10;p.phase='elementary';p.traits=[];p.stats.athletics=8;p.stats.stress=0;p.stats.illness=0;p.attributes={classroomRevision:1,seatmate:'도윤',elementaryClass:3};
    const pack=GukminDirector.content(p),s=GukminTimeline.create({...pack,persona:p,pauseAfterChoice:true}).snapshot(),id='classroom:sports',target=pack.events.find(e=>e.id===id);for(const e of pack.events)s.runtime.events[e.id]={status:'completed',count:1,nextAt:e.at||0};s.runtime.events[id]={status:'unseen',count:0,nextAt:target.at};s.runtime.turn=target.at;s.persona.simulation=s.runtime;GukminPlayer.save(s.persona);localStorage.setItem('callOfgukmin__controls__v1',JSON.stringify({mode:'manual',paused:false}));},entry.seed);
   await page.goto(base+'html/game.html');await page.evaluate(()=>GukminGame.session.run());await page.locator('#resumeDailyChoice').click();await page.locator('.sports-day-intro button').click();
   const before=await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().choice));await page.reload();await page.locator('#resumeDailyChoice').click();assert.equal(await page.evaluate(()=>JSON.stringify(GukminGame.session.snapshot().choice)),before);await page.locator('.sports-day-intro button').click();
   const lanes=await page.locator('.oval-runner').evaluateAll(nodes=>nodes.map(n=>({distance:Number(n.dataset.distance),offset:Number(n.dataset.startOffset)})));assert.equal(lanes.length,3);assert.ok(lanes.every(l=>Math.abs(l.distance-lanes[0].distance)<.001));assert.ok(lanes[0].offset>lanes[1].offset&&lanes[1].offset>lanes[2].offset);
   if(entry.place===2)await page.emulateMedia({reducedMotion:'no-preference'});
   await page.locator('#dailyChoiceBody .inline-choice').first().click();await page.locator('#dailyPaperConfirm').click();await page.locator('.race-finish').waitFor({timeout:14000});
   const finish=await page.evaluate(()=>{const s=GukminGame.session.snapshot(),r=Object.values(s.runtime.choices).filter(c=>c.choiceId==='classroom:sports'&&c.status==='closed').at(-1);return {place:s.persona.attributes.sportsPlace,teams:r.script.presentation.teams,rivalOrder:r.script.presentation.rivalOrder};});assert.equal(finish.place,entry.place);
   const runners=await page.locator('.oval-runner').evaluateAll(nodes=>nodes.map(n=>({progress:Number(n.dataset.progress),team:Number(n.dataset.team)}))),winner=runners.find(n=>n.progress===1),ranking=await page.locator('.sports-ranking li span').allTextContents();assert.equal(runners.filter(n=>n.progress===1).length,1,'winner is visibly ahead of the other runners');assert.equal(ranking[0],winner.team+'반');assert.equal(runners[0].progress===1,entry.place===1);
   await page.screenshot({path:resolve(artifacts,'race-place-'+entry.place+'.png')});
   await page.reload();await page.locator('.race-finish').waitFor();assert.deepEqual(await page.locator('.sports-ranking li span').allTextContents(),ranking);assert.deepEqual(await page.locator('.oval-runner').evaluateAll(nodes=>nodes.map(n=>({progress:Number(n.dataset.progress),team:Number(n.dataset.team)}))),runners);
   await page.emulateMedia({reducedMotion:'reduce'});
  }
  await context.close();
 }finally{await browser?.close();server.kill();}
});
