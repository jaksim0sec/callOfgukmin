import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function setup(){
 const store=new Map(),c=vm.createContext({console,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}});c.window=c;
 for(const name of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','life/middle','life/high','life/admissions','life/society','election/engine','life/election'])vm.runInContext(readFileSync('js/'+name+'.js','utf8'),c);
 return {c,P:c.GukminPlayer,E:c.GukminEffects,T:c.GukminTimeline};
}
test('pressure capacity increases at graduation while network labels preserve the same metric',()=>{
 const {P,E,c}=setup(),p=P.generate();c.GukminTimeline.create({...c.GukminDirector.content(p),persona:p});p.age=19;p.phase='high';p.stats.relations=17;p.stats.stress=24;
 assert.equal(P.metricDefinition('relations',p).label,'관계');assert.equal(P.pressureMax(p),25);
 const overflow=E.apply(p,{effects:{stats:{stress:3}}});assert.equal(overflow.stats.stress,25);assert.equal(overflow.stats.illness,2);
 const next=E.apply(p,{effects:{attributes:{age:20,phase:'adult'},schools:[{id:'grad-high',kind:'high',name:'검증고',status:'graduated'}]}});
 assert.equal(P.activeMetrics(next).find(m=>m.id==='relations').label,'인맥');assert.equal(next.stats.relations,17);assert.equal(next.stats.stress,24);assert.equal(P.metricDefinition('stress',next).max,50);
 const adultOverflow=E.apply(next,{effects:{stats:{stress:28}}});assert.equal(adultOverflow.stats.stress,50);assert.equal(adultOverflow.stats.illness,2);
 const mistaken={...p,stats:{...p.stats,stress:40}},corrected=P.upgradeMental(mistaken);assert.equal(corrected.stats.stress,25);assert.equal(corrected.stats.illness,0);assert.equal(mistaken.stats.stress,40);
 assert.equal(P.upgradeMental({...next,stats:{...next.stats,stress:40}}).stats.stress,40);
 const retake=E.apply(p,{effects:{stats:{stress:3},attributes:{admissionAttempts:2},schools:[{id:'grad-high',kind:'high',name:'검증고',status:'graduated'}]}});assert.equal(retake.stats.stress,27);assert.equal(retake.stats.illness,0);
});

test('GU permits recovery during saved choice review and keeps a strict four-turn purchase cooldown',()=>{
 const {c,P,T}=setup(),p=P.generate();p.age=12;p.phase='elementary';p.attributes={pressureGuideSeen:true};Object.assign(p.stats,{stress:20,illness:0,money:100000});
 const content=c.GukminDirector.content(p),saved=T.create({...content,persona:p}).snapshot();for(const event of content.events)saved.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};
 const event=content.events.find(e=>e.id==='elementary:recover');saved.runtime.events[event.id]={status:'unseen',count:0,nextAt:event.at};saved.runtime.turn=event.at;p.simulation=saved.runtime;
 let engine=c.GukminDirector.create({persona:p,persist:p=>P.save(p)});engine.run();engine.resolve(engine.snapshot().choice.token,'ignore');assert.equal(engine.snapshot().reviewPending,true);
 engine=c.GukminDirector.create({persona:P.load(),persist:p=>P.save(p)});assert.equal(engine.storeStatus().blocked,false);assert.equal(engine.storeStatus().remaining,0);const turn=engine.snapshot().runtime.turn;
 assert.equal(engine.buy('water'),true);assert.equal(engine.snapshot().runtime.turn,turn);assert.equal(engine.snapshot().reviewPending,true);assert.equal(engine.storeStatus().remaining,4);assert.equal(engine.buy('water'),false);
 engine=c.GukminDirector.create({persona:P.load()});assert.equal(engine.storeStatus().remaining,4);for(const item of engine.storeStatus().items)assert.match(item.reason,/4턴/);
});
test('pledge feasibility has three distinct meanings and impossible promises cause larger support backlash',()=>{
 const {c,P,E,T}=setup(),p=P.generate();p.phase='elementary';p.age=12;p.traits=[];Object.assign(p.stats,{money:100000,stress:1,relations:15});p.attributes={classElection:'elected',electionRevision:3,electionPledges:138,electionFulfillmentVersion:1,electionFulfilled:false,teacherTrust:12};T.create({...c.GukminDirector.content(p),persona:p});
 const catalog=c.GukminElection.pledges;assert.equal(catalog.find(x=>x.id==='library').feasibility.label,'이행가능');assert.equal(catalog.find(x=>x.id==='homework').feasibility.label,'조정 필요');assert.equal(catalog.find(x=>x.id==='holiday').feasibility.label,'이행불가');
 const items=c.GukminElection.fulfillment(p);assert.equal(items.find(x=>x.id==='holiday').modes[0].available,false);assert.ok(items.find(x=>x.id==='holiday').modes[1].stats.relations<items.find(x=>x.id==='homework').modes[1].stats.relations);
 const plans=items.map(x=>({pledgeId:x.id,mode:'compromise'})),out=E.apply(p,{electionDecision:{action:'fulfill',plans}});assert.equal(out.stats.relations,13);assert.equal(out.attributes.electionFulfilled,true);
});
test('high-school graduation is a persisted scene, resumes after reload and keeps school history',()=>{
 const {c,P,T}=setup(),p=P.generate();p.age=19;p.phase='high';p.attributes={admissionAttempts:1,admissionDestination:'employment'};p.schoolHistory=[{id:'school-high',kind:'high',name:'졸업검증고등학교',status:'enrolled'}];
 const pack=c.GukminDirector.content(p),s=T.create({...pack,persona:p}).snapshot();for(const e of pack.events)s.runtime.events[e.id]={status:'completed',count:1,nextAt:e.at||0};s.runtime.events['high:graduation']={status:'unseen',count:0,nextAt:88};s.runtime.turn=88;p.simulation=s.runtime;
 const engine=c.GukminDirector.create({persona:p,persist:p=>P.save(p)});engine.run();assert.equal(engine.snapshot().runtime.cinematic.kind,'graduation');assert.equal(engine.snapshot().persona.age,20);
 const restored=c.GukminDirector.create({persona:P.load()});assert.equal(restored.snapshot().runtime.cinematic.kind,'graduation');assert.equal(P.schoolsOf(restored.snapshot().persona)[0].status,'graduated');restored.acknowledge();assert.equal(restored.snapshot().runtime.cinematic,undefined);
});


test('entering society directly after admissions shows graduation once; older graduated entrants skip it',()=>{
 for(const age of [19,20]){
  const {c,P}=setup(),p=P.generate();p.age=age;p.phase='high';p.attributes={admissionAttempts:1,admissionDestination:'employment'};p.schoolHistory=[{id:'school-high',kind:'high',name:'진로검증고등학교',status:age===19?'enrolled':'graduated'}];
  const engine=c.GukminDirector.create({persona:p,persist:p=>P.save(p)});engine.run();
  if(age===19){assert.equal(engine.snapshot().runtime.cinematic.kind,'graduation');assert.equal(engine.snapshot().persona.attributes.societyActive,true);assert.equal(P.schoolsOf(engine.snapshot().persona)[0].status,'graduated');engine.acknowledge();engine.run();}
  assert.equal(engine.snapshot().choice.presentation.type,'society');assert.equal(engine.snapshot().runtime.events['society:entry'].count,1);assert.equal(engine.snapshot().runtime.cinematic,undefined);
 }
});
