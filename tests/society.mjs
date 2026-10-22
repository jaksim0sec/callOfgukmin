import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,existsSync} from 'node:fs';
const plain=x=>JSON.parse(JSON.stringify(x));
function setup({college=false,gender='male',illness=0,attempts=1,money=10000000,tier='silver',offer='국민대학교 인문계열',persist}={}){
 const storage=new Map([['callOfgukmin__playable__v1','legacy-sentinel']]),c=vm.createContext({console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});c.window=c;
 for(const file of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','election/engine','life/election','life/classroom','life/middle','life/high','life/admissions','life/society'])if(existsSync('js/'+file+'.js'))vm.runInContext(readFileSync('js/'+file+'.js','utf8'),c);
 const P=c.GukminPlayer,p=P.generate();Object.assign(p,{age:20,phase:'high',gender,familyTier:tier,traits:[],schoolHistory:[{id:'high-test',kind:'high',name:'기록고등학교',status:'graduated'}]});Object.assign(p.stats,{stress:0,illness,money,relations:12,study:18});p.attributes={admissionAttempts:attempts,admissionDestination:college?'college':'employment',earlyOffer:college?offer:null,highFinalSubmitted:true,csatSubmitted:true,pressureGuideSeen:true};p.admissionSeed='society-test';
 const cfg={persist:persist||((q)=>P.save(q))},D=c.GukminDirector;let e=D.create({...cfg,persona:p});e.run();
 const choose=id=>{const s=e.snapshot();assert.ok(s.choice,'a working choice must exist');assert.ok(s.choice.options.some(o=>o.id===id&&o.available),'available option '+id+' at '+s.choice.title);e.resolve(s.choice.token,id);e.run();return e.snapshot();};
 return {c,P,D,storage,p,get e(){return e;},choose,reload(){e=D.create({...cfg,persona:P.load()});e.run();return e.snapshot();}};
}
test('admission outcome bridges into the society hub without rewriting old records',()=>{
 const x=setup(),s=x.e.snapshot();assert.equal(s.choice.presentation.type,'society');assert.equal(s.persona.attributes.societyStep,'hub');assert.equal(s.persona.schoolHistory[0].name,'기록고등학교');assert.equal(x.storage.get('callOfgukmin__playable__v1'),'legacy-sentinel');assert.equal(s.persona.attributes.admissionAttempts,1);
});
test('college funding and annual activities graduate 2, 3 and 4 year courses with permanent schooling',()=>{
 for(const years of [2,3,4]){
  const x=setup({college:true,tier:'diamond',offer:years===4?'국민대학교 인문계열':'동서울대학교 실무계열'});x.choose('college');if(years!==4)x.choose('program-'+years);
  for(let year=0;year<years;year++){if(year)x.choose('college');x.choose('fund-cash');x.choose('study');}
  const s=x.e.snapshot();assert.equal(s.persona.attributes.collegeStatus,'졸업');assert.equal(s.persona.attributes.societyMonths,years*12);assert.equal(s.persona.age,20+years);assert.ok(s.persona.schoolHistory.some(r=>r.kind==='uni'&&r.status==='graduated'));assert.equal(s.persona.attributes.societyStep,'hub');
 }
});
test('male examination exclusion is explicitly a game rule and preserves its reason',()=>{
 const x=setup({illness:2});x.choose('military');x.choose('examine');const p=x.e.snapshot().persona;assert.equal(p.attributes.militaryStatus,'복무 제외');assert.equal(p.attributes.militaryReason,'게임 규칙 · 정신건강 사유');assert.equal(p.stats.illness,2);assert.equal(p.attributes.militaryServed,false);x.reload();assert.equal(x.e.snapshot().persona.attributes.militaryReason,p.attributes.militaryReason);
});
test('military service uses 18/20/21 calendar months and pauses college without granting credits',()=>{
 for(const [gender,branch,months] of [['male','army',18],['male','navy',20],['male','air',21],['female','nco',48]]){
  const x=setup({college:true,gender});x.choose('military');if(gender==='male'){x.choose('examine');x.choose('military');}x.choose(branch);let p=x.e.snapshot().persona;assert.equal(p.attributes.collegeStatus,'휴학');assert.ok(p.schoolHistory.some(s=>s.kind==='uni'&&s.status==='leave'));assert.equal(p.attributes.societyMonths,0);x.reload();x.choose('service-balance');p=x.e.snapshot().persona;assert.equal(p.attributes.societyMonths,months);assert.equal(p.attributes.militaryCompletedMonths,months);assert.equal(p.attributes.collegeCompleted,0);assert.equal(p.attributes.collegeStatus,'휴학');assert.equal(p.attributes.militaryServed,true);x.choose('college');assert.equal(x.e.snapshot().persona.attributes.collegeStatus,'재학');
 }
});
test('female service is voluntary and male unserved political entrants retain that history',()=>{
 const x=setup({gender:'female'});assert.equal(x.e.snapshot().persona.attributes.militaryStatus,'의무복무 비대상');x.choose('politics');x.choose('politics-local');assert.equal(x.e.snapshot().persona.attributes.politicalEntryReady,true);
 const y=setup();y.choose('politics');y.choose('politics-party');assert.equal(y.e.snapshot().persona.attributes.politicalMilitaryServed,false);assert.equal(y.e.snapshot().persona.attributes.militaryStatus,'판정 전');y.choose('finish');assert.equal(y.e.snapshot().persona.attributes.societyComplete,true);
});
test('poor students can borrow, pause, work, repay and return without losing academic history',()=>{
 const x=setup({college:true,tier:'soil',money:0});x.choose('college');const pending=plain(x.e.snapshot());assert.equal(pending.choice.options.find(o=>o.id==='fund-cash').available,false);assert.throws(()=>x.e.resolve(pending.choice.token,'fund-cash'));assert.deepEqual(plain(x.e.snapshot()),pending);
 x.choose('fund-loan');assert.equal(x.e.snapshot().persona.attributes.studentDebt,7000000);x.choose('part-time');assert.equal(x.e.snapshot().persona.stats.money,3000000);x.choose('repay');assert.equal(x.e.snapshot().persona.attributes.studentDebt,6000000);x.choose('leave');assert.equal(x.e.snapshot().persona.attributes.collegeStatus,'휴학');x.choose('college');assert.equal(x.e.snapshot().persona.attributes.collegeCompleted,1);
});
test('employment supports rejection, training, deterministic reload and actual work instead of passive wages',()=>{
 const x=setup({money:1000000});x.choose('career');x.choose('apply-local');const saved=plain(x.e.snapshot());x.reload();assert.equal(x.e.snapshot().persona.attributes.jobAccepted,saved.persona.attributes.jobAccepted);let tries=0;
 while(!x.e.snapshot().persona.attributes.jobAccepted&&tries++<10){x.choose('search-again');x.choose('training');x.choose('career');x.choose('apply-local');}
 assert.ok(x.e.snapshot().persona.attributes.jobAccepted);x.choose('accept');const before=x.e.snapshot().persona.stats.money;x.reload();assert.equal(x.e.snapshot().persona.stats.money,before);x.choose('career');x.choose('work-team');const p=x.e.snapshot().persona;assert.equal(p.attributes.careerMonths,6);assert.ok(p.stats.money>before);assert.ok(p.history.some(h=>h.detail.includes('6개월 근무')));assert.equal(p.attributes.societyStep,'hub');
});
test('service and civil-service status gate political participation until completed or resigned',()=>{
 const x=setup();x.choose('military');x.choose('examine');x.choose('military');x.choose('army');assert.equal(x.e.snapshot().choice.options.some(o=>o.id==='politics'),false);assert.throws(()=>x.c.GukminSociety.decision(x.e.snapshot().persona,{action:'politics-party'}));
 const y=setup(),before=y.e.snapshot().persona;const cfg={...before,attributes:{...before.attributes,employmentStatus:'재직',employmentSector:'public',societyStep:'hub'}};assert.ok(y.c.GukminSociety.choice(cfg).options.find(o=>o.id==='politics').when);assert.throws(()=>y.c.GukminSociety.decision(cfg,{action:'politics'}));
});
test('old N-year lives continue into society after 30 but illness five still ends them',()=>{
 const x=setup({attempts:8});for(let i=0;i<42;i++)x.choose('rest');assert.ok(x.e.snapshot().persona.age>=30);assert.equal(x.e.snapshot().persona.attributes.admissionDestination,'employment');assert.ok(x.e.snapshot().choice);
 const token=x.e.snapshot().choice.token;x.e.apply('mental-end',{effects:{stats:{illness:5}}});const s=x.e.snapshot();assert.equal(s.persona.attributes.lifeEndReason,'정신병 한계');assert.equal(s.choice,null);assert.equal(x.e.resolve(token,'rest'),false);
});
test('adult choices survive failed persistence atomically and cannot be charged twice',()=>{
 let fail=false;const x=setup({persist:()=>!fail}),s=plain(x.e.snapshot());fail=true;assert.throws(()=>x.e.resolve(s.choice.token,'community'),/저장 실패/);assert.deepEqual(plain(x.e.snapshot()),s);fail=false;x.e.resolve(s.choice.token,'community');assert.equal(x.e.resolve(s.choice.token,'community'),false);x.e.run();assert.equal(x.e.snapshot().persona.attributes.societyMonths,3);
});
test('manual next can discover an overdue bridge in an old completed admission save',()=>{
 const x=setup(),p=x.p;const pack=x.D.content(p),raw=x.c.GukminTimeline.create({...pack,persona:p}).snapshot();raw.runtime.turn=89;for(const event of pack.events)if(!event.id.startsWith('society:'))raw.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};p.simulation=raw.runtime;
 const e=x.D.create({persona:p});assert.equal(e.snapshot().choice,null);e.step();assert.equal(e.snapshot().choice.presentation.type,'society');
});
test('career history improves later applications and preview never reveals a business roll',()=>{
 const x=setup(),p=x.e.snapshot().persona,experienced={...p,attributes:{...p.attributes,careerMonths:24,careerProjects:2}};assert.ok(x.c.GukminSociety.chance(experienced,'private')>x.c.GukminSociety.chance(p,'private'));
 const owner={...p,attributes:{...p.attributes,societyStep:'business',employmentStatus:'재직',employmentSector:'business'}};const a=x.c.GukminEffects.apply(owner,{societyDecision:{action:'business-expand'}},{preview:true});assert.equal(a.stats.money,owner.stats.money,'random profit is not a preview reward');
});
test('frozen tuition choices recheck live funds after a store purchase',()=>{
 const x=setup({college:true,tier:'soil',money:7015000});x.choose('college');const token=x.e.snapshot().choice.token;assert.equal(x.e.snapshot().choice.options.find(o=>o.id==='fund-cash').available,true);
 x.e.apply('spend-money',{effects:{stats:{money:-40000}}});assert.equal(x.e.snapshot().choice.options.find(o=>o.id==='fund-cash').available,false);assert.throws(()=>x.e.resolve(token,'fund-cash'));assert.equal(x.e.snapshot().persona.attributes.studentDebt,undefined);
});
test('a real pending admissions decision settles first, then reload connects the chosen college',()=>{
 const x=setup({college:true}),p=x.p;Object.assign(p,{age:20,phase:'high'});Object.assign(p.attributes,{admissionDestination:null,earlyStatus:'accepted',earlyOffer:'국민대학교 인문계열'});
 const pack=x.D.content(p),raw=x.c.GukminTimeline.create({...pack,persona:p}).snapshot();for(const event of pack.events)if(!event.id.startsWith('society:')&&event.id!=='admission:first:destination')raw.runtime.events[event.id]={status:'completed',count:1,nextAt:event.at||0};raw.runtime.turn=87;p.simulation=raw.runtime;
 let e=x.D.create({persona:p,persist:q=>x.P.save(q)});e.run();assert.equal(e.snapshot().choice.id,'admission:first:destination');const token=e.snapshot().choice.token;e.resolve(token,'college');assert.equal(e.snapshot().reviewPending,true);assert.equal(e.snapshot().persona.attributes.societyActive,undefined);
 e=x.D.create({persona:x.P.load(),persist:q=>x.P.save(q)});e.run();assert.equal(e.snapshot().persona.attributes.collegeName,'국민대학교 인문계열');assert.equal(e.snapshot().choice.id,'society:activity');assert.ok(e.snapshot().runtime.choices[token].status==='closed');
});
test('self employment uses capital and variable work outcomes, keeping a permanent sector history',()=>{
 const x=setup();x.choose('career');x.choose('startup');assert.equal(x.e.snapshot().persona.stats.money,7000000);assert.equal(x.e.snapshot().persona.job,'자영업자');x.choose('career');x.choose('business-expand');const p=x.e.snapshot().persona;assert.equal(p.attributes.careerBusinessMonths,6);assert.equal(p.attributes.careerSectors&8,8);assert.equal(p.attributes.societyMonths,9);assert.ok([4500000,8500000,12000000].includes(p.stats.money));x.choose('career');x.choose('quit');assert.equal(x.e.snapshot().persona.attributes.employmentStatus,'폐업');assert.equal(x.e.snapshot().persona.attributes.careerBusinessMonths,6);
});
test('three year practical education has a distinct initial employment payoff',()=>{
 const x=setup(),p=x.e.snapshot().persona;const candidate=years=>({...p,schoolHistory:[...p.schoolHistory,{id:'degree',kind:'uni',name:'실무계열',status:'graduated'}],attributes:{...p.attributes,collegeYears:years,societyStep:'job-offer',jobAccepted:true,jobTarget:'local'}});
 const a=x.c.GukminSociety.decision(candidate(2),{action:'accept'}),b=x.c.GukminSociety.decision(candidate(3),{action:'accept'});assert.ok(b.effects.activate.income>a.effects.activate.income,'the extra year is not only a substitute for a free three month training course');
});
test('dropout keeps the college record and permits political entry without a degree',()=>{
 const x=setup({college:true});x.choose('leave');x.choose('leave');let s=x.e.snapshot();assert.equal(s.persona.attributes.collegeStatus,'중퇴');assert.ok(s.persona.schoolHistory.some(r=>r.kind==='uni'&&r.status==='dropout'));assert.equal(s.choice.options.some(o=>o.id==='college'),false);x.choose('politics');x.choose('politics-independent');assert.equal(x.e.snapshot().persona.attributes.politicalEntryReady,true);assert.ok(x.e.snapshot().persona.schoolHistory.some(r=>r.kind==='uni'&&r.status==='dropout'));
});
test('an employed civil servant must resign before the political entry gate opens',()=>{
 const x=setup();x.choose('career');x.choose('apply-public');let tries=0;
 while(!x.e.snapshot().persona.attributes.jobAccepted&&tries++<12){if(x.e.snapshot().persona.stats.stress>=9){x.choose('back');x.choose('rest');x.choose('career');}else x.choose('search-again');x.choose('apply-public');}
 assert.ok(x.e.snapshot().persona.attributes.jobAccepted);x.choose('accept');assert.equal(x.e.snapshot().choice.options.find(o=>o.id==='politics').available,false);x.choose('career');x.choose('quit');assert.equal(x.e.snapshot().choice.options.find(o=>o.id==='politics').available,true);x.choose('politics');x.choose('politics-party');assert.equal(x.e.snapshot().persona.attributes.politicalEntryReady,true);assert.equal(x.e.snapshot().persona.attributes.employmentStatus,'퇴사');
});
