import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const plain=value=>JSON.parse(JSON.stringify(value));
function setup({college=false,years=4,gender='male',illness=0}={}){
 const c=vm.createContext({console,localStorage:{getItem:()=>null,setItem(){}}});c.window=c;
 for(const file of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','election/engine','life/election','life/classroom','life/middle','life/high','life/admissions','life/society'])vm.runInContext(readFileSync('js/'+file+'.js','utf8'),c);
 const P=c.GukminPlayer,S=c.GukminSociety;let p=P.generate();Object.assign(p,{age:20,gender,phase:'adult',familyTier:'diamond',traits:[],schoolHistory:[{id:'high',kind:'high',name:'기록고',status:'graduated'}]});Object.assign(p.stats,{money:10000000,stress:0,illness,relations:12,study:18});p.attributes={highFinalSubmitted:true,csatSubmitted:true,pressureGuideSeen:true,admissionDestination:college?'college':'employment',earlyOffer:years===4?'국민대학교 인문계열':'동서울대학교 실무계열'};p.admissionSeed='society-route';
 const pack=c.GukminDirector.content(p);c.GukminTimeline.create({...pack,persona:p});
 const apply=result=>p=c.GukminEffects.apply(p,result);
 apply({societyDecision:{action:'start'}});
 const choose=action=>{const option=S.choice(p).options.find(o=>o.id===action);assert.ok(option,'option '+action+' at '+p.attributes.societyStep);return apply(option.result);};
 return {c,S,pack,engine:()=>c.GukminDirector.create({persona:p}),get p(){return p;},apply,choose,pause(){return apply({societyDecision:{action:'return-hub'}});},reload(){p=plain(p);return p;}};
}
test('society hub and route decisions use separate major and daily event contracts',()=>{
 const x=setup({college:true}),activity=x.pack.events.find(e=>e.id==='society:activity'),line=x.pack.events.find(e=>e.id==='society:line');
 assert.equal(x.c.GukminEffects.matches(x.p,activity.when),true);assert.equal(x.c.GukminEffects.matches(x.p,line.when),false);x.choose('college');
 assert.equal(x.c.GukminEffects.matches(x.p,activity.when),false);assert.equal(x.c.GukminEffects.matches(x.p,line.when),true);
 const choice=x.S.lineChoice(x.p);assert.equal(choice.id,'society:line');assert.equal(choice.layer,'일상 선택');assert.equal(choice.presentation.type,'society-line');assert.equal(choice.options.some(o=>o.id==='back'),false);
 x.choose('fund-cash');assert.equal(x.S.choice(x.p).presentation.type,'society','legacy waiting major presentation remains readable');
});
test('college remains in its route through every academic year and returns only at graduation',()=>{
 for(const years of [2,3,4]){const x=setup({college:true,years});x.choose('college');if(years<4)x.choose('program-'+years);
  for(let completed=0;completed<years;completed++){assert.equal(x.p.attributes.societyStep,'college-funding');x.choose('fund-cash');x.choose(['study','network','part-time'][completed%3]);assert.equal(x.p.attributes.collegeCompleted,completed+1);assert.equal(x.p.attributes.societyStep,completed+1===years?'hub':'college-funding');}
  assert.equal(x.p.attributes.collegeStatus,'졸업');assert.equal(x.p.attributes.societyMonths,years*12);assert.equal(x.S.canReturn(x.p),false);
 }
});
test('menu pause preserves paid tuition through another route and saved recovery',()=>{
 const x=setup({college:true});x.choose('college');x.choose('fund-cash');const before=plain(x.p);x.pause();assert.deepEqual(plain(x.p.stats),before.stats);assert.equal(x.p.attributes.societyMonths,before.attributes.societyMonths);assert.equal(x.p.attributes.collegeResumeStep,'college-year');
 x.reload();x.choose('rest');assert.equal(x.p.attributes.societyStep,'recovery');x.choose('recover');x.choose('college');assert.equal(x.p.attributes.societyStep,'college-year');assert.equal(x.p.stats.money,before.stats.money-180000);x.choose('study');assert.equal(x.p.attributes.collegeCompleted,1);assert.equal(x.p.attributes.collegeFundedYear,0);
 x.choose('fund-cash');x.pause();x.choose('military');x.choose('examine');assert.equal(x.p.attributes.societyStep,'military');x.choose('army');x.choose('service-balance');x.choose('college');assert.equal(x.p.attributes.societyStep,'college-year');assert.equal(x.p.attributes.collegeCompleted,1);
});
test('military examination stays on route, exemption and discharge conclude it, paused service stays restricted',()=>{
 const x=setup({college:true});x.choose('military');x.choose('examine');assert.equal(x.p.attributes.societyStep,'military');x.choose('army');const before=plain(x.p);x.pause();assert.equal(x.p.attributes.militaryStatus,'복무 중');assert.deepEqual(plain(x.p.stats),before.stats);
 for(const action of ['college','career','politics','community','rest'])assert.throws(()=>x.choose(action),/선택할 수 없는/);
 x.reload();x.choose('military');assert.equal(x.p.attributes.societyStep,'military-service');x.choose('service-balance');assert.equal(x.p.attributes.societyStep,'hub');assert.equal(x.p.attributes.societyMonths,18);
 const excluded=setup({illness:2});excluded.choose('military');excluded.choose('examine');assert.equal(excluded.p.attributes.societyStep,'hub');assert.equal(excluded.p.attributes.militaryStatus,'복무 제외');
});
test('training and hiring continue into work, three half years close a resumable chapter',()=>{
 const x=setup();x.choose('career');x.choose('training');assert.equal(x.p.attributes.societyStep,'career-search');
 x.choose('apply-public');if(!x.p.attributes.jobAccepted)x.apply({effects:{attributes:{jobAccepted:true}}});x.choose('accept');assert.equal(x.p.attributes.societyStep,'work');x.choose('work-team');assert.equal(x.p.attributes.societyStep,'work');assert.equal(x.p.attributes.careerChapterPeriods,1);
 const before=plain(x.p);x.pause();x.reload();x.choose('career');assert.equal(x.p.attributes.societyStep,'work');assert.equal(x.p.attributes.careerChapterPeriods,1);assert.equal(x.p.stats.money,before.stats.money);x.choose('work-team');x.choose('work-balance');assert.equal(x.p.attributes.societyStep,'hub');assert.equal(x.p.attributes.careerMonths,18);x.choose('career');assert.equal(x.p.attributes.careerChapterPeriods,0);x.choose('quit');assert.equal(x.p.attributes.societyStep,'hub');
});
test('business has a finite chapter and job offers resume without paying application costs twice',()=>{
 const x=setup();x.choose('career');x.choose('apply-local');const before=plain(x.p);x.pause();x.reload();x.choose('career');assert.equal(x.p.attributes.societyStep,'job-offer');assert.equal(x.p.stats.money,before.stats.money);assert.equal(x.p.attributes.jobAttempts,before.attributes.jobAttempts);x.choose('search-again');x.choose('startup');assert.equal(x.p.attributes.societyStep,'business');
 x.choose('business-local');x.choose('business-local');x.choose('business-local');assert.equal(x.p.attributes.societyStep,'hub');assert.equal(x.p.attributes.careerBusinessMonths,18);x.choose('career');assert.equal(x.p.attributes.societyStep,'business');assert.equal(x.p.attributes.careerChapterPeriods,0);
});
test('route introductions are ordinary news with no time or stat cost; legacy rest preserves frozen outcome',()=>{
 const x=setup(),before=plain(x.p);x.choose('community');assert.equal(x.p.attributes.societyStep,'community');assert.equal(x.p.attributes.societyMonths,0);assert.deepEqual(plain(x.p.stats),before.stats);assert.equal(x.p.attributes.societyNarrativePending,true);
 const news=x.S.narrative(x.p);assert.match(news.body,/주민/);x.apply({societyDecision:{action:'narrate'}});assert.equal(x.p.attributes.societyNarrativePending,false);assert.equal(x.p.history.at(-1).detail,news.body);assert.equal(x.p.attributes.societyMonths,0);x.choose('community-work');assert.equal(x.p.attributes.societyStep,'hub');assert.equal(x.p.attributes.societyMonths,3);
 x.apply({societyDecision:{action:'rest'}});assert.equal(x.p.attributes.societyStep,'hub');assert.equal(x.p.attributes.societyMonths,6);
});

test('saved daily route choices pause atomically to the hub and resume on the shared timeline',()=>{
 const x=setup({college:true});let e=x.engine();e.run();
 const choose=action=>{const s=e.snapshot();assert.ok(s.choice.options.some(o=>o.id===action&&o.available),action);e.resolve(s.choice.token,action);e.run();return e.snapshot();};
 choose('college');let s=e.snapshot();assert.equal(s.choice.id,'society:line');assert.equal(s.choice.presentation.stage,'college-funding');assert.ok(s.persona.history.some(h=>h.detail.includes('새 학년 등록 안내')));
 choose('fund-cash');s=e.snapshot();const before=plain(s),token=s.choice.token;e=x.c.GukminDirector.create({persona:{...plain(s.persona),simulation:plain(s.runtime)}});e.run();assert.equal(e.snapshot().choice.token,token);assert.equal(e.snapshot().choice.presentation.stage,'college-year');
 assert.equal(e.returnToSociety(),true);s=e.snapshot();assert.equal(s.choice.id,'society:activity');assert.equal(s.persona.attributes.societyStep,'hub');assert.equal(s.runtime.turn,before.runtime.turn);assert.deepEqual(plain(s.persona.stats),before.persona.stats);assert.equal(s.persona.attributes.societyMonths,before.persona.attributes.societyMonths);
 choose('college');assert.equal(e.snapshot().choice.presentation.stage,'college-year');choose('study');assert.equal(e.snapshot().choice.presentation.stage,'college-funding');assert.equal(e.snapshot().persona.attributes.collegeCompleted,1);
});
