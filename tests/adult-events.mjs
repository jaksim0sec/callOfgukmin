import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const scripts=['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','election/engine','life/election','life/classroom','life/middle','life/high','life/admissions','life/adultStories','life/society','life/adultFlow'];
function setup(college=false){
 const storage=new Map(),c=vm.createContext({console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});c.window=c;
 for(const id of scripts)vm.runInContext(readFileSync('js/'+id+'.js','utf8'),c,{filename:id});
 const P=c.GukminPlayer,p=P.generate();
 Object.assign(p,{age:20,phase:'high',traits:[],familyTier:'diamond',schoolHistory:[{id:'high-sample',kind:'high',name:'시연고',status:'graduated'}]});
 Object.assign(p.stats,{money:12000000,stress:0,illness:0,relations:12,study:18});
 p.attributes={admissionAttempts:1,admissionDestination:college?'college':'employment',earlyOffer:college?'동서울대학교 실무계열':null,highFinalSubmitted:true,csatSubmitted:true,pressureGuideSeen:true};
 p.admissionSeed='adult-event-test';
 let e=c.GukminDirector.create({persona:p,persist:q=>P.save(q)});e.run();
 const choose=id=>{let s=e.snapshot();assert.ok(s.choice,'missing choice');assert.ok(s.choice.options.some(x=>x.id===id&&x.available),id+' not available at '+s.choice.title);e.resolve(s.choice.token,id);e.run();return e.snapshot();};
 return {c,P,storage,choose,get e(){return e},reload(){e=c.GukminDirector.create({persona:P.load(),persist:q=>P.save(q)});e.run();return e.snapshot();}};
}
test('college takes two authored decisions per year but settles twelve months once',()=>{
 const x=setup(true);x.choose('college');x.choose('program-2');x.choose('fund-cash');
 let s=x.e.snapshot();assert.equal(s.choice.options[0].id,'c-time-ask');const months=s.persona.attributes.societyMonths;
 x.choose('c-time-ask');s=x.e.snapshot();assert.equal(s.persona.attributes.societyMonths,months);assert.equal(s.choice.options[0].id,'c-team-solo');
 x.choose('c-team-proof');s=x.e.snapshot();assert.equal(s.persona.attributes.societyMonths,months+12);assert.equal(s.persona.attributes.adultTeamHistory,'proof');
 x.choose('fund-cash');s=x.e.snapshot();assert.ok(s.choice.options.some(o=>o.id==='c-eval-proof'));x.choose('c-eval-proof');
 s=x.e.snapshot();assert.equal(s.persona.attributes.societyMonths,months+12);x.choose('c-grad-appeal');
 s=x.e.snapshot();assert.equal(s.persona.attributes.collegeStatus,'졸업');assert.equal(s.persona.attributes.societyMonths,months+24);
});
test('region map preview is free, locked destinations unavailable, return keeps state',()=>{
 const x=setup();const original=x.e.snapshot().persona;
 x.choose('region-map');const s=x.e.snapshot();assert.equal(s.choice.presentation.stage,'region-map');assert.equal(s.persona.attributes.societyMonths,original.attributes.societyMonths);
 assert.equal(s.choice.options.find(o=>o.id==='visit:mapo').available,true);
 const closed=s.choice.options.filter(o=>o.id.startsWith('visit:')&&!o.available);assert.ok(closed.length>=1);
 x.choose('map-back');assert.equal(x.e.snapshot().persona.attributes.societyMonths,original.attributes.societyMonths);
});
test('three regional decisions lead to a political invitation without gating normal entry',()=>{
 const x=setup();x.choose('community');x.choose('l-begin-field');assert.equal(x.e.snapshot().persona.attributes.adultCommunityIssueStage,1);
 x.choose('community');x.choose('l-file-data');assert.equal(x.e.snapshot().persona.attributes.adultCommunityIssueStage,2);
 x.choose('community');x.choose('l-end-track');assert.equal(x.e.snapshot().persona.attributes.adultCommunityIssueStage,3);
 x.choose('politics');assert.ok(x.e.snapshot().choice.options.some(o=>o.id==='i-docs'));x.choose('i-docs');
 assert.ok(x.e.snapshot().choice.options.some(o=>o.id==='politics-local'));x.choose('politics-local');
 assert.equal(x.e.snapshot().persona.attributes.politicalEntryReady,true);
 const other=setup();other.choose('politics');assert.ok(other.e.snapshot().choice.options.some(o=>o.id==='politics-party'));
});
test('old society actions still settle even though newly opened episodes use different options',()=>{
 const x=setup(true);x.choose('college');x.choose('program-2');x.choose('fund-cash');
 const p=x.e.snapshot().persona;
 const settled=x.c.GukminEffects.apply(p,{societyDecision:{action:'study'}});
 assert.equal(settled.attributes.collegeCompleted,1);assert.equal(settled.attributes.societyMonths,12);
});
