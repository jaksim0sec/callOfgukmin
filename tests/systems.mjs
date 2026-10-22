import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
function setup(){
 const storage=new Map([['callOfgukmin__playable__v1','legacy-sentinel']]);
 const c=vm.createContext({console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});c.window=c;
 for(const file of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','life/classroom','life/middle','life/high','life/admissions','systemDemo'])if(existsSync(`js/${file}.js`))vm.runInContext(readFileSync(`js/${file}.js`,'utf8'),c);
 return {c,P:c.GukminPlayer,E:c.GukminEffects,T:c.GukminTimeline,storage};
}
const plain=x=>JSON.parse(JSON.stringify(x));
function config(P){
 P.registerMetric('focus',{label:'검증 집중',type:'progress',min:0,max:10});
 P.registerTrait('검증 습관',{icon:'savings',periodic:{every:2,result:{effects:{stats:{money:2}}}},modifiers:[{tags:['income'],stats:{money:{multiply:2}}}]});
 return {contentId:'test',choices:[{id:'gift',layer:'일상 선택',title:'검증 선택',blocksTime:true,options:[{id:'save',label:'저축',result:{effects:{stats:{stress:5,money:10},traits:{add:['검증 습관']},activate:{focus:1}},history:{title:'선택 결과'}}}]}],events:[
 {id:'notice',layer:'소식 이벤트',at:1,title:'사건 발생',history:{title:'사건 발생'}},
 {id:'gift',layer:'일상 이벤트',at:2,title:'선택 사건',choice:'gift'},
 {id:'school',layer:'소식 이벤트',at:3,title:'학교 입학',result:{effects:{schools:[{id:'test-middle',kind:'middle',name:'검증중',status:'enrolled'}],stats:{focus:2}},history:{title:'입학'}}},
 {id:'graduate',layer:'소식 이벤트',at:4,title:'졸업',result:{effects:{schools:[{id:'test-middle',kind:'middle',name:'검증중',status:'graduated'}],deactivate:['focus']},history:{title:'졸업'}}}
 ]};
}
test('A–E: events, choice settlement, periodic trait, schools and dynamic metrics share one saved state',()=>{
 const {P,T,storage}=setup();assert.equal(typeof T?.create,'function','timeline is implemented');const cfg=config(P);
 let notifications=0;const engine=T.create({...cfg,persona:P.generate(),persist:p=>P.save(p),onChange:()=>notifications++});
 engine.advance(1);assert.equal(engine.snapshot().runtime.events.notice.status,'completed');
 assert.ok(engine.snapshot().persona.history.some(h=>h.title==='사건 발생'&&h.turn===1));
 engine.advance(10);let s=engine.snapshot();assert.equal(s.runtime.turn,2);assert.equal(s.choice.layer,'일상 선택');assert.equal(s.progress.waiting,true);
 const token=s.choice.token;assert.equal(engine.resolve(token,'save'),true);assert.equal(engine.resolve(token,'save'),false);
 s=engine.snapshot();assert.equal(s.persona.stats.stress,5);assert.equal(s.persona.stats.money,10);assert.ok(P.hasTrait(s.persona,'검증 습관'));assert.ok(P.activeMetrics(s.persona).some(m=>m.id==='focus'));
 engine.advance(1);s=engine.snapshot();assert.equal(s.persona.stats.focus,3);assert.equal(P.schoolsOf(s.persona)[0].status,'enrolled');
 engine.advance(1);s=engine.snapshot();assert.equal(s.persona.stats.money,12);assert.equal(P.schoolsOf(s.persona)[0].status,'graduated');assert.equal(P.activeMetrics(s.persona).some(m=>m.id==='focus'),false);assert.equal(s.persona.metricHistory.at(-1).value,3);
 assert.equal(P.load().simulation.turn,4);assert.equal(storage.get('callOfgukmin__playable__v1'),'legacy-sentinel');assert.ok(notifications>=4);
});
test('atomic settlement rejects unknown IDs, invalid values and attributes without partial mutation',()=>{
 const {P,T}=setup();const engine=T.create({...config(P),persona:P.generate()});const before=plain(engine.snapshot());
 for(const result of [{effects:{stats:{stress:1,missing:2}}},{effects:{traits:{add:['missing']}}},{effects:{stats:{money:NaN}}},{effects:{attributes:{stats:{money:999}}}},{effects:{activate:{missing:0}}}]){
  assert.throws(()=>engine.apply('bad',result));assert.deepEqual(plain(engine.snapshot()),before);
 }
 engine.apply('once',{effects:{stats:{money:10}},tags:['income']});assert.equal(engine.apply('once',{effects:{stats:{money:10}}}),false);assert.equal(engine.snapshot().persona.stats.money,10);
});
test('waiting choice survives save/reload; stale response and failed persistence do not settle twice',()=>{
 const {P,T}=setup();const cfg=config(P);let engine=T.create({...cfg,persona:P.generate(),persist:p=>P.save(p)});engine.advance(2);const token=engine.snapshot().choice.token;
 engine=T.create({...cfg,persona:P.load(),persist:p=>P.save(p)});assert.equal(engine.snapshot().choice.token,token);engine.resolve(token,'save');
 engine=T.create({...cfg,persona:P.load()});assert.equal(engine.resolve(token,'save'),false);assert.equal(engine.snapshot().persona.stats.money,10);
 const failing=T.create({...cfg,persona:P.generate(),persist:()=>false});assert.throws(()=>failing.advance(1),/저장|save/i);assert.equal(failing.snapshot().runtime.turn,0);
});
test('crossed boundaries and repeat events run exactly once per scheduled turn',()=>{
 const {P,T}=setup();const engine=T.create({contentId:'repeat',persona:P.generate(),events:[{id:'r',layer:'소식 이벤트',at:0,every:2,title:'반복',result:{effects:{stats:{money:1}}}}]});
 engine.advance(5);assert.equal(engine.snapshot().persona.stats.money,3);engine.advance(0);assert.equal(engine.snapshot().persona.stats.money,3);engine.advance(1);assert.equal(engine.snapshot().persona.stats.money,4);
});
test('same-time choices retain their own layers; nonblocking daily choice does not postpone major choice',()=>{
 const {P,T}=setup();const cfg=config(P);cfg.choices[0].blocksTime=false;cfg.choices.push({...cfg.choices[0],id:'major',layer:'한방 선택',blocksTime:true});cfg.events=[{id:'daily',layer:'일상 이벤트',at:1,title:'일상',choice:'gift'},{id:'major',layer:'한방 이벤트',at:1,title:'주요',choice:'major'}];
 const engine=T.create({...cfg,persona:P.generate()});engine.advance(4);assert.equal(engine.snapshot().runtime.turn,1);assert.equal(engine.snapshot().choice.layer,'일상 선택');engine.resolve(engine.snapshot().choice.token,'save');assert.equal(engine.snapshot().choice.layer,'한방 선택');engine.resolve(engine.snapshot().choice.token,'save');assert.equal(engine.snapshot().choice,null);
});
test('conditions, completion effects and trait modifiers use content data; histories are append-only',()=>{
 const {P,T}=setup();const cfg=config(P);cfg.events=[{id:'wait',layer:'소식 이벤트',at:1,title:'기다림',when:{traits:['검증 습관']},completeWhen:{stats:{money:{gte:20}}},result:{effects:{stats:{stress:1}}},completion:{effects:{attributes:{job:'검증 직업'}},history:{title:'완료'}}}];
 const engine=T.create({...cfg,persona:P.generate()});engine.advance(1);assert.equal(engine.snapshot().runtime.events.wait.status,'pending');engine.apply('trait',{effects:{traits:{add:['검증 습관']}}});engine.advance(0);assert.equal(engine.snapshot().runtime.events.wait.status,'running');engine.apply('income',{tags:['income'],effects:{stats:{money:10}}});engine.advance(0);assert.equal(engine.snapshot().runtime.events.wait.status,'completed');assert.equal(engine.snapshot().persona.job,'검증 직업');assert.equal(engine.snapshot().persona.stats.money,20);
 engine.apply('remove',{effects:{traits:{remove:['검증 습관']}}});engine.advance(2);assert.equal(engine.snapshot().persona.stats.money,20);
});
test('confirmed event kinds require their corresponding choice kind; news never opens a choice',()=>{
 const {P,T}=setup();const cfg=config(P);
 for(const e of [{id:'bad',layer:'소식 이벤트',at:0,choice:'gift'},{id:'bad',layer:'일상 이벤트',at:0},{id:'bad',layer:'한방 이벤트',at:0,choice:'gift'}])assert.throws(()=>T.create({...cfg,persona:P.generate(),events:[e]}),/종류|계층|선택/);
});
test('a content pack registers metric, trait and attribute definitions as data',()=>{
 const {P,T}=setup();const engine=T.create({persona:P.generate(),metrics:{energy:{label:'에너지',type:'number'}},traits:{'검증 집중력':{icon:'check'}},attributes:{office:{label:'직책'}},events:[{id:'data',layer:'소식 이벤트',at:0,result:{effects:{activate:{energy:3},traits:{add:['검증 집중력']},attributes:{office:'검증 직책'}}}}]});
 engine.advance(0);const s=engine.snapshot().persona;assert.equal(P.activeMetrics(s).find(m=>m.id==='energy').value,3);assert.equal(s.attributes.office,'검증 직책');assert.equal(P.hasTrait(s,'검증 집중력'),true);
});
test('school changes preserve legacy entries and reject rewriting a completed school identity',()=>{
 const {P,T}=setup();const p=P.generate();p.school.middle='예전중';p.schoolHistory=[{id:'high',kind:'high',name:'예전고',status:'graduated'}];
 const engine=T.create({persona:p});assert.equal(P.schoolsOf(engine.snapshot().persona).length,2);
 assert.throws(()=>engine.apply('rewrite',{effects:{schools:[{id:'high',kind:'high',name:'새고',status:'graduated'}]}}),/학교|이력/);
});
test('conditional outcomes and quiet history retain context; removing a trait stops its future effects',()=>{
 const {P,T}=setup();const engine=T.create({...config(P),events:[],persona:P.generate()});
 engine.apply('gain',{effects:{traits:{add:['검증 습관']}}});
 engine.apply('branch',{effects:{stats:{money:1}},conditional:[{when:{traits:['검증 습관']},result:{effects:{stats:{stress:2}},history:{title:'내부 기록',display:'hidden',importance:'minor'}}}]});
 const s=engine.snapshot().persona;assert.equal(s.stats.stress,2);assert.equal(s.history.at(-1).display,'hidden');assert.equal(s.history.at(-1).turn,0);assert.equal(s.history.at(-1).phase,'infant');
 engine.apply('remove',{effects:{traits:{remove:['검증 습관']}}});engine.advance(2);assert.equal(engine.snapshot().persona.stats.money,1);
});
test('content can supply mechanics for an existing trait without editing the registry source',()=>{
 const {P,T}=setup();const engine=T.create({persona:P.generate(),traits:{'저축습관':{modifiers:[{tags:['income'],stats:{money:{multiply:2}}}]}},events:[]});
 engine.apply('gain',{effects:{traits:{add:['저축습관']}}});engine.apply('income',{tags:['income'],effects:{stats:{money:5}}});assert.equal(engine.snapshot().persona.stats.money,10);assert.equal(P.traitDefinition('저축습관').icon,'savings');
});
test('invalid pending-choice conditions fail before persistence and leave the complete state unchanged',()=>{
 const {P,T}=setup();let saved=null;const engine=T.create({persona:P.generate(),persist:p=>{saved=p;return true;},events:[{id:'bad-condition',layer:'일상 이벤트',at:1,choice:'bad',result:{effects:{stats:{money:50}}}}],choices:[{id:'bad',layer:'일상 선택',options:[{id:'a',label:'a',when:{stats:{missing:{gte:1}}}}]}]});
 const before=plain(engine.snapshot());assert.throws(()=>engine.advance(1),/등록되지 않은 스탯/);assert.equal(saved,null);assert.deepEqual(plain(engine.snapshot()),before);
});
test('activation respects an explicitly registered metric range',()=>{
 const {P,T}=setup();const engine=T.create({persona:P.generate(),metrics:{bounded:{label:'범위',type:'progress',min:0,max:10}}});engine.apply('max',{effects:{activate:{bounded:500}}});assert.equal(engine.snapshot().persona.stats.bounded,10);engine.apply('min',{effects:{activate:{bounded:-20}}});assert.equal(engine.snapshot().persona.stats.bounded,0);
});
test('custom attributes may hold finite numeric background data',()=>{
 const {P,T}=setup();const engine=T.create({persona:P.generate(),attributes:{tenure:{label:'근속'}}});engine.apply('job',{effects:{attributes:{tenure:3}}});assert.equal(engine.snapshot().persona.attributes.tenure,3);
});
test('graduating a legacy school adopts its ID and does not leave an obsolete enrolled token',()=>{
 const {P,T}=setup();const p=P.generate();p.school.middle={name:'예전중',status:'enrolled'};const engine=T.create({persona:p});engine.apply('graduate',{effects:{schools:[{id:'old-middle',name:'예전중',kind:'middle',status:'graduated'}]}});const schools=P.schoolsOf(engine.snapshot().persona);assert.equal(schools.length,1);assert.equal(schools[0].status,'graduated');
});
test('a reached choice deadline remains fully progressed at turn zero and for simultaneous choices',()=>{
 const {P,T}=setup();const choices=['a','b'].map(id=>({id,layer:'일상 선택',options:[{id:'ok',label:'확인'}]}));const events=choices.map(c=>({id:c.id,layer:'일상 이벤트',at:0,choice:c.id}));const engine=T.create({persona:P.generate(),events,choices});engine.advance(0);assert.equal(engine.snapshot().progress.value,1);engine.resolve(engine.snapshot().choice.token,'ok');assert.equal(engine.snapshot().progress.value,1);
});

test('birth defaults and stage routes are data-owned without triggering a clock or mutating defaults',()=>{
 const {P,E}=setup(),birth=P.generate();
 assert.deepEqual(plain(P.lifeStages.map(stage=>stage.id)),['infant','elementary','middle','high','university','adult','political']);
 assert.deepEqual(plain(P.nextPhases('high')),['university','adult']);
 assert.deepEqual(plain(P.nextPhases('political')),['adult']);
 assert.throws(()=>P.phaseDefinition('unknown'),/생애 단계/);
 assert.equal(birth.phase,'infant');assert.equal(birth.age,1);assert.equal(birth.job,'아기');
 assert.equal(birth.stats.health,undefined);assert.throws(()=>P.metricDefinition('health'));
 assert.equal(birth.stats.money,P.birthDefaults.stats.money);
 assert.equal(Number.isFinite(birth.stats.allowance),true);
 assert.equal(Number.isFinite(birth.stats.relations),true);
 assert.equal(birth.traits.length,1);
 assert.ok(P.wealthTiers.some(t=>t.name===birth.traits[0]));
 assert.deepEqual(plain(P.activeMetrics(birth).map(metric=>metric.id)),['stress','illness','relations','money']);
 birth.stats.stress=11;assert.equal(P.birthDefaults.stats.stress,0);
 const older=E.apply(birth,{effects:{attributes:{age:22}}});
 assert.equal(older.phase,'infant','Changing age alone must not advance the stage');
 const next=E.apply(birth,{effects:{attributes:{phase:'elementary'}}});
 assert.equal(next.phase,'elementary');assert.equal(P.phaseOf(next),'elementary');
 assert.throws(()=>E.apply(next,{effects:{attributes:{phase:'missing'}}}),/생애 단계/);
});


test('director begins at family choice after birth news and restores without duplication',()=>{
 const {c,P,storage}=setup(),D=c.GukminDirector;
 let engine=D.create({persona:P.generate(),persist:p=>P.save(p)});
 let s=engine.run();
 assert.equal(s.runtime.turn,8);
 assert.equal(s.persona.age,3);
 assert.equal(s.runtime.events['infant:birth-registered'].count,1);
 assert.equal(s.choice.id,'infant:home');
 assert.equal(s.choice.layer,'일상 선택');
 const historyLen=s.persona.history.length;
 engine=D.create({persona:P.load(),persist:p=>P.save(p)});
 s=engine.run();
 assert.equal(s.runtime.turn,8);
 assert.equal(s.choice.id,'infant:home');
 assert.equal(s.persona.history.length,historyLen);
 assert.deepEqual(plain(engine.active()),['infant']);
 assert.equal(storage.get('callOfgukmin__playable__v1'),'legacy-sentinel');
});
test('life cycle stays deterministic and reaches high-school graduation with school history',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const original=P.generate();
 let engine=D.create({persona:original,persist:p=>P.save(p)});
 engine.run();
 let decisions=0,exams=0,applications=0,lastTurn=0;
 while(engine.snapshot().choice&&decisions<70){
  const s=engine.snapshot(),choice=s.choice;
  assert.ok(s.runtime.turn>=lastTurn,'non-decreasing clock');
  lastTurn=s.runtime.turn;
  if(choice.presentation?.type==='exam'){
   exams++;
   assert.equal(choice.options.length,5);
   assert.ok(choice.options.every(o=>o.result.assessment&&!o.result.effects.stats?.study));
  }
  if(choice.presentation?.type==='school'){
   applications++;
   assert.ok(choice.options.every(o=>o.school.name));
   assert.ok(choice.options.some(o=>o.school.region===c.GukminSchools.regionOf(original)));
  }
  const option=choice.options.find(o=>o.id===(s.persona.stats.stress>=12?'effort-0':'effort-2')&&o.available)||choice.options.find(o=>o.id==='employment'&&o.available)||choice.options.find(o=>o.available);
  assert.ok(option,'at least one available option');
  engine.resolve(choice.token,option.id);
  assert.equal(engine.snapshot().reviewPending,true,'result stays until continuing');
  assert.equal(engine.snapshot().choice,null,'no immediate next decision');
  decisions++;
  if(decisions%4===0)engine=D.create({persona:P.load(),persist:p=>P.save(p)});
  assert.equal(engine.snapshot().reviewPending,true,'review persists on reload');
  engine.run();
 }
 const final=engine.snapshot();
 assert.equal(exams,12,'six middle-school papers and two annual high-school strategy decisions per grade');
 assert.equal(applications,1,'one school application');
 assert.ok(decisions>=25);
 assert.equal(final.persona.age,20);
 assert.equal(final.runtime.turn,88);
 assert.equal(final.choice,null);
 assert.equal(final.progress.remaining,null);
 assert.equal(P.schoolsOf(final.persona).find(x=>x.kind==='elementary').status,'graduated');
 assert.equal(P.schoolsOf(final.persona).find(x=>x.kind==='middle').status,'graduated');
 assert.equal(P.schoolsOf(final.persona).find(x=>x.kind==='high').status,'graduated');
 const completionId=final.runtime.events['high:graduation'].count===1?'high:graduation':'admission:retry-graduation';
 assert.equal(final.runtime.events[completionId].count,1);
 engine=D.create({persona:P.load(),persist:p=>P.save(p)});
 engine.run();
 assert.equal(engine.snapshot().runtime.events[completionId].count,1);
 assert.equal(engine.snapshot().runtime.turn,88);
});
test('special-school game thresholds lock options until grade requirements hold',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const persona=P.generate();
 const pack=D.content(persona);
 for(const [id,def] of Object.entries(pack.attributes))P.registerAttribute(id,def);
 const school=pack.choices.find(c=>c.id==='middle:high-application');
 assert.equal(school.options.length,4);
 assert.equal(school.presentation.type,'school');
 assert.ok(school.options.find(o=>!o.when));
 assert.ok(school.options.every(o=>o.school.name&&o.school.typeLabel));
 assert.ok(school.options.every(o=>!o.when?.stats?.study),'hidden study cannot lock visibly qualified applications');
 const foreign=school.options.find(o=>o.school.minScore>0);
 if(foreign){
  const p=P.generate();
  p.stats.schoolScore=foreign.school.minScore;p.stats.study=0;p.attributes={admissionResearch:'official'};
  assert.equal(c.GukminEffects.matches(p,foreign.when,63),true,'visible minimum score unlocks even with low hidden study');
  p.stats.schoolScore--;
  assert.equal(c.GukminEffects.matches(p,foreign.when,63),false,'a lower visible score locks');
 }
 const paid=pack.choices.find(c=>c.id==='middle:resources').options.find(o=>o.id==='paid');
 if(['soil','bronze'].includes(persona.familyTier)){
  assert.equal(paid.when.stats.money.gte,230000);
  assert.equal(paid.result.effects.stats.money,-230000);
  assert.equal(paid.when.stats.allowance,undefined);
 }else{
  assert.equal(paid.when,undefined,'family education costs must not debit personal wallet');
  assert.equal(paid.result.effects.stats.money,undefined);
 }
 assert.ok(school.options.filter(o=>o.school.kind==='foreign'||o.school.kind==='gifted'||o.school.kind==='autonomous'||o.school.kind==='international')
   .every(o=>o.when?.stats?.schoolScore?.gte>0));
 const exam=pack.choices.find(c=>c.id.startsWith('high:1:3월-모의고사'));
 assert.equal(exam.options.length,5);
 assert.equal(exam.presentation.type,'exam');
 assert.ok(c.GukminGrades.assessment(P.generate(),exam.options[4].result.assessment).stats.stress>0);
});

test('region catalogue and independent wealth presets generate tagged births',()=>{
 const {c,P}=setup(),R=c.GukminRegions;
 assert.equal(R.all.length,255);
 assert.equal(new Set(R.all.map(region=>region.id)).size,255);
 assert.ok(R.tagged('어촌').length>0);
 for(let i=0;i<120;i++){
   const b=P.generate(),region=R.find(b.birthplaceId);
   assert.ok(region);
   assert.equal(b.birthplace,region.label);
   assert.deepEqual(plain(b.regionTags),plain(region.tags));
   const tier=P.wealthTiers.find(t=>t.id===b.familyTier);
   assert.ok(tier);
   assert.ok(b.traits.includes(tier.name));
   assert.equal(b.stats.allowance,tier.allowance);
   const modifier=b.regionTags.reduce((sum,tag)=>sum+(c.GukminData.regionPresets[tag]?.relations||0),0);
   assert.equal(b.stats.relations,tier.relations+modifier);
   assert.equal(P.valid(P.load()||b),true);
 }
});

test('school catalog distinguishes autonomous/gifted/foreign and local Gyeonggi cities',()=>{
 const {c,P}=setup(),S=c.GukminSchools;
 const person=P.generate();
 for(const [city,first,advanced,kind] of [
  ['성남시','분당중앙고등학교','성남외국어고등학교','foreign'],
  ['수원시','영덕고등학교','수원외국어고등학교','foreign'],
  ['고양시','백마고등학교','고양국제고등학교','international'],
  ['평택시','현화고등학교','경기물류고등학교','vocational']
 ]){
  const sample={...person,birthplaceId:'경기도.'+city+'.테스트동',regionTags:['수도권']};
  const options=S.options(sample);
  assert.equal(options.length,4);
  assert.equal(options[0].name,first);
  assert.equal(options[2].name,advanced);
  assert.equal(options[2].kind,kind);
  assert.equal(options[2].verified,true);
  assert.ok(options.every(x=>!x.logoUrl),'never use unrelated external logos');
 }
 for(const [region,name,expected] of [
  ['seoul','휘문고등학교','autonomous'],
  ['busan','해운대고등학교','autonomous'],
  ['chungnam','북일고등학교','autonomous'],
  ['gwangju','광주과학고등학교','gifted'],
  ['sejong','세종과학예술영재학교','gifted']
 ]){
  const option=S.groups[region].find(x=>x.name===name);
  assert.ok(option,name);
  assert.equal(option.kind,expected);
  assert.ok(option.minScore>0);
 }
});

test('five-grade high-school and nine-grade mock estimates are different, labelled as approximations',()=>{
 const {c}=setup(),G=c.GukminGrades;
 assert.deepEqual(plain(G.bounds.high),[10,34,66,90,100]);
 assert.deepEqual(plain(G.bounds.mock),[4,11,23,40,60,77,89,96,100]);
 assert.equal(G.report('schoolScore',24,'high').display,'1등급');
 assert.equal(G.report('schoolScore',22,'high').display,'2등급');
 assert.equal(G.report('schoolScore',17,'high').display,'2등급');
 assert.equal(G.report('schoolScore',16,'high').display,'3등급');
 assert.equal(G.report('schoolScore',13,'middle').display,'E');
 assert.equal(G.report('schoolScore',23,'middle').display,'A');
 assert.equal(G.report('exam',23,'high').display,'2등급');
 assert.equal(G.report('exam',24,'high').display,'1등급');
 assert.match(G.report('exam',20,'high').detail,/^예상 .*등급제$/);assert.ok(!G.report('exam',20,'high').detail.includes('게임'));
 assert.equal(G.report('exam',null,'high').display,'—');
});
test('high-school major choices are annual, legacy exams remain loadable and ordinary stories depend on school track',()=>{
 const {c,P}=setup(),content=c.GukminDirector.content(P.generate());
 const annual=content.choices.filter(x=>x.presentation?.type==='exam'&&x.presentation?.annual);
 assert.equal(annual.length,6);
 assert.equal(annual.filter(x=>x.presentation.category==='mock').length,3);
 assert.equal(annual.filter(x=>x.presentation.category==='school').length,3);
 const legacy=content.events.filter(e=>e.id.startsWith('high:')&&e.when?.all?.some(rule=>rule.turn?.lte===-1));
 assert.equal(legacy.length,12);
 assert.ok(content.attributes.schoolTrack&&content.attributes.schoolProgram);
 for(const track of ['general','foreign','autonomous','gifted','science','vocational','international','autonomous-public'])
  assert.ok(content.events.some(e=>e.id==='high:track-'+track));
 assert.ok(content.events.some(e=>e.id==='high:bdja-science'));
 assert.ok(content.events.some(e=>e.id==='high:whimoon-electives'));
});

test('everyday childhood decisions record temperament, leave a review stage and restore on reload',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const persona=P.generate();
 let e=D.create({persona,persist:p=>P.save(p)});
 let s=e.run();
 assert.equal(s.choice.id,'infant:home');
 assert.equal(s.choice.options.length,3);
 const selected=s.choice.options.find(x=>x.id==='choice-1');
 const token=s.choice.token;
 assert.equal(e.resolve(token,selected.id),true);
 s=e.snapshot();
 assert.equal(s.choice,null);
 assert.equal(s.reviewPending,true);
 assert.equal(s.runtime.turn,8);
 assert.equal(s.persona.attributes.earlyTemperament,'cautious','small action records a memory, not an immediate permanent trait');
 assert.equal(e.resolve(token,selected.id),false);
 e=D.create({persona:P.load(),persist:p=>P.save(p)});
 assert.equal(e.snapshot().reviewPending,true);
 e.run();
 assert.equal(e.snapshot().reviewPending,false);
 assert.equal(e.snapshot().choice.id,'infant:play');
});
test('turn-based allowance accrues after elementary enrollment, does not duplicate on reload or during review',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const persona=P.generate();
 let e=D.create({persona,persist:p=>P.save(p)});
 let s=e.run();
 const initial=persona.stats.allowance;
 assert.equal(s.persona.stats.allowance,initial,'infancy cannot accrue allowance');
 let loops=0;
 while(s.persona.age<8&&loops++<12){
  if(s.choice){const option=s.choice.options.find(x=>x.available);e.resolve(s.choice.token,option.id);}
  if(e.snapshot().reviewPending)e.run();
  s=e.snapshot();
 }
 assert.ok(s.persona.age>=8);
 assert.equal(s.persona.stats.allowance,initial,'allowance is a stable income rate');
 assert.ok(s.persona.stats.money>0,'allowance is credited to wallet');
 const atEight=s.persona.stats.money;
 e=D.create({persona:P.load(),persist:p=>P.save(p)});
 assert.equal(e.snapshot().persona.stats.money,atEight,'reload does not double-pay');
 const already=e.snapshot().runtime.turn;
 e.run();
 assert.ok(e.snapshot().runtime.turn>=already);
 assert.equal(e.snapshot().persona.stats.money,atEight+(e.snapshot().runtime.turn-already)*initial);
});

test('paid academy everyday choice uses wallet, charges once and preserves allowance',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const persona=P.generate();persona.familyTier='silver';persona.stats.allowance=2000;
 let engine=D.create({persona,persist:p=>P.save(p)}),s=engine.run();
 for(let attempt=0;attempt<30&&s.choice?.id!=='elementary:afterschool';attempt++){
  if(s.choice)engine.resolve(s.choice.token,s.choice.options.find(o=>o.available).id);
  if(engine.snapshot().reviewPending)engine.run();
  s=engine.snapshot();
 }
 assert.equal(s.choice?.id,'elementary:afterschool');
 const token=s.choice.token,academy=s.choice.options.find(o=>o.id==='academy');
 assert.equal(academy.when.stats.money.gte,10000);
 assert.equal(academy.when.stats.allowance,undefined,'income rate must not gate a purchase');
 engine.apply('test:low-funds',{effects:{stats:{money:9999-s.persona.stats.money}}});
 s=engine.snapshot();
 assert.equal(s.choice.token,token);
 assert.equal(s.choice.options.find(o=>o.id==='academy').available,false);
 assert.throws(()=>engine.resolve(token,'academy'),/선택 조건/);
 engine.apply('test:enough-funds',{effects:{stats:{money:1}}});
 s=engine.snapshot();
 assert.equal(s.persona.stats.money,10000);
 assert.equal(s.choice.options.find(o=>o.id==='academy').available,true);
 assert.equal(engine.resolve(token,'academy'),true);
 s=engine.snapshot();
 assert.equal(s.persona.stats.money,0);
 assert.equal(s.persona.stats.allowance,2000);
 assert.equal(s.reviewPending,true);
 engine=D.create({persona:P.load(),persist:p=>P.save(p)});
 assert.equal(engine.snapshot().persona.stats.money,0,'reloading cannot duplicate payment');
 assert.equal(engine.resolve(token,'academy'),false);
});

test('exam preludes announce middle and annual high assessments without replacing existing choices',()=>{
 const {c,P}=setup(),s=c.GukminDirector.content(P.generate());
 const preludes=s.events.filter(e=>e.id.startsWith('exam-prelude:'));
 const classroom=s.events.filter(e=>e.id.startsWith('exam-classroom:'));
 assert.equal(preludes.length,12);
 assert.equal(classroom.length,12);
 assert.ok(classroom.every(e=>e.history.display==='hidden'),'repetitive classroom notes remain addressable for old saves but do not clutter history');
 assert.ok(preludes.every(e=>e.layer==='소식 이벤트'&&e.when.all.some(w=>w.turn?.eq===e.at)));
 assert.ok(preludes.every(e=>e.history.importance!=='major'&&e.title.endsWith('준비 기간')),'routine exam reminders name the exam and do not dominate the life recap');
 assert.equal(s.choices.filter(x=>x.presentation?.type==='exam'&&x.presentation.stage==='middle').length,6);
 assert.equal(s.choices.filter(x=>x.presentation?.type==='exam'&&x.presentation.annual).length,6);
});

test('science schools are distinct from gifted schools in the high-school track',()=>{
 const {c}=setup(),S=c.GukminSchools;
 assert.equal(S.kindOf('세종과학고등학교'),'science');
 assert.equal(S.kindOf('경기북과학고등학교'),'science');
 assert.equal(S.kindOf('광주과학고등학교'),'gifted');
 assert.equal(S.kindOf('세종과학예술영재학교'),'gifted');
 assert.ok(S.typeLabels.science.includes('과학고'));
});

test('one nearest science high school is added with visible game costs and school-only score conditions',()=>{
 const {c,P}=setup(),S=c.GukminSchools;
 assert.equal(S.scienceSites.length,20);
 for(const name of ['서울특별시.강남구.대치동','경기도.성남시.분당구','제주특별자치도.제주시.연동']){
  const p=P.generate();p.birthplaceId=name;p.regionTags=[];
  const candidates=S.options(p),science=candidates.filter(x=>x.kind==='science');
  assert.equal(science.length,1,'exactly one science-school option');
  assert.equal(candidates.length,4);
  assert.ok(science[0].travelCost>0&&science[0].distanceKm>=0);
  assert.equal(science[0].distanceKind,'지역 중심 추정');
  const application=c.GukminDirector.content(p).choices.find(x=>x.id==='middle:high-application');
  const option=application.options.find(x=>x.school.id===science[0].id);
  assert.ok(option.when.stats.schoolScore.gte>0);
  assert.equal(option.when.stats.study,undefined,'hidden academic metric cannot lock a visibly qualified application');
  assert.equal(option.when.stats.money,undefined,'personal wallet cannot buy public-school admission');
  assert.equal(option.result.effects.stats.money,undefined,'transport estimate is not tuition');
  assert.ok(science[0].travelCost>=70000,'distance costs must use plausible KRW magnitude');
 }
});

test('school entry inherits the last middle score once; science mock starts below the top grade at 21',()=>{
 const {c,P,E}=setup(),p=P.generate();p.phase='middle';p.age=15;p.stats.schoolScore=21;p.attributes={admissionResearch:'official'};
 const cfg=c.GukminDirector.content(p);for(const [id,def] of Object.entries(cfg.attributes))P.registerAttribute(id,def);
 const proposal=cfg.choices.find(c=>c.id==='middle:high-application').options.find(o=>o.school.kind==='science');
 const entered=E.apply(p,proposal.result);assert.equal(entered.stats.exam,21);assert.equal(entered.stats.schoolScore,18);
 const engine=c.GukminDirector.create({persona:entered});engine.run();assert.equal(engine.snapshot().persona.stats.exam,21);
 const saved={...engine.snapshot().persona,simulation:plain(engine.snapshot().runtime)};
 assert.equal(c.GukminDirector.create({persona:saved}).snapshot().persona.stats.exam,21);
 const normal=c.GukminGrades.highEntry(p,'general');assert.equal(normal.exam,16);assert.equal(normal.schoolScore,21);
});
test('every exam strategy offers a different tangible tradeoff and academic history matters',()=>{
 const {c,P}=setup(),Story=c.GukminStory,Effects=c.GukminEffects;
 const choice=Story.exam('high',17,2,70,'학기 모의고사','mock').choice;
 const sample=P.generate();sample.age=17;sample.phase='high';sample.stats.study=20;sample.stats.exam=15;
 const results=choice.options.map(opt=>Effects.apply(sample,opt.result).stats);
 assert.equal(results.length,5);
 assert.ok(results[0].stress<=sample.stats.stress,'resting is not a dead choice');
 assert.equal(results[1].exam,sample.stats.exam-1,'short review trades a small decline for recovery');
 assert.ok(results[2].exam>results[1].exam&&results[3].exam>results[2].exam);
 assert.ok(results[4].stress>results[3].stress,'intensive strategy pays a cost');
 assert.equal(results[2].exam,sample.stats.exam,'maintaining a plan avoids automatic inflation');
});
test('story traits remain obtainable from sustained actions and modify the next assessment',()=>{
 const {c,P}=setup(),Story=c.GukminStory,Effects=c.GukminEffects,D=c.GukminDirector;
 const content=D.content(P.generate());
 const candidate=content.choices.find(x=>x.id==='middle:resources').variants.find(x=>x.id==='lab-study').options[0];
 assert.ok(candidate.result.effects.traits.add.includes('꼼꼼함'));
 const elected=content.choices.find(x=>x.id==='elementary:graduation').variants.find(x=>x.id==='representative-followup').options[0];
 assert.equal(elected.result.effects.traits,undefined,'graduation does not grant leadership again');
 assert.ok(content.choices.find(c=>c.id==='elementary:representative').variants[0].options[0].result.conditional[0].result.effects.traits.add.includes('리더십'));
 const person=P.generate();person.stats.study=16;person.stats.exam=14;person.traits.push('꼼꼼함');
 const exam=Story.exam('high',16,1,65,'3월 모의고사','mock').choice.options[3];
 const modified=Effects.apply(person,exam.result).stats.exam;
 person.traits=person.traits.filter(t=>t!=='꼼꼼함');
 const plain=Effects.apply(person,exam.result).stats.exam;
 assert.equal(modified-plain,1);
});
test('arts aptitude becomes a visible real trait only after consistent activities',()=>{
 const {c,P}=setup(),D=c.GukminDirector,E=c.GukminEffects;
 const pack=D.content(P.generate());
 const first=pack.choices.find(x=>x.id==='elementary:interest-exploration');
 const later=pack.choices.find(x=>x.id==='elementary:interest-followup');
 const base=P.generate(),early=E.apply(base,first.options[2].result);
 assert.ok(early.traits.includes('관심-예체능'),'arts interest is recorded');
 assert.ok(!early.traits.includes('예체능'),'one try does not grant a permanent aptitude');
 const emerged=E.apply(early,later.options[2].result);
 assert.ok(emerged.traits.includes('예체능'),'related second activity grants the actual aptitude');
 assert.equal(P.traitDefinition('예체능').color,'#a7558a');
 assert.ok(!E.apply(base,later.options[2].result).traits.includes('예체능'),
  'an unrelated one-off choice does not grant arts expertise');
});
test('smoking trait is a persistent downside and support can remove it',()=>{
 const {c,P}=setup(),D=c.GukminDirector,E=c.GukminEffects,T=c.GukminTimeline;
 const content=D.content(P.generate()),scene=content.choices.find(x=>x.id==='high:tobacco-offer');
 assert.equal(scene.options.length,3);
 const p=P.generate();p.age=17;p.phase='high';p.stats.money=20000;
 const reluctant=E.apply(p,scene.options[2].result);
 assert.ok(reluctant.traits.includes('흡연'));
 assert.equal(reluctant.stats.health,undefined);
 assert.equal(P.traitDefinition('흡연').negative,true);
 const timeline=T.create({persona:reluctant,events:[],choices:[]});
 timeline.advance(4);
 assert.ok(timeline.snapshot().persona.stats.money<reluctant.stats.money,
  'the retained habit causes a later cost');
 const follow=content.choices.find(x=>x.id==='high:smoking-followup');
 const recovered=E.apply(reluctant,follow.options[0].result);
 assert.ok(!recovered.traits.includes('흡연'));
});
test('a paced director step saves real intermediary news without skipping the next choice',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 let engine=D.create({persona:P.generate()});
 engine.run();
 const first=engine.snapshot().choice;
 engine.resolve(first.token,first.options[0].id);
 const before=engine.snapshot();assert.equal(before.reviewPending,true);
 let previousTurn=before.runtime.turn,observedHistory=false,steps=0;
 for(;steps<28;steps++){
  const snapshot=engine.step();
  if(!snapshot)break;
  const now=engine.snapshot();
  assert.ok(now.runtime.turn>=previousTurn);
  assert.ok(now.runtime.turn<=previousTurn+1,'one paced beat advances at most one turn');
  if(now.persona.history.length>before.persona.history.length)observedHistory=true;
  previousTurn=now.runtime.turn;
  if(now.choice)break;
 }
 assert.ok(steps<28,'the loop reaches a new choice promptly');
 assert.ok(engine.snapshot().choice,'the next choice is still presented');
 assert.ok(observedHistory,'intermediate stories were saved');
});
test('recovery is voluntary, can be ignored and never automatically rescues a life',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const p=P.generate();p.age=14;p.phase='middle';p.job='중학생';p.stats.stress=24;
 const engine=D.create({persona:p});const first=engine.run();
 assert.equal(first.persona.stats.stress,24);assert.equal(first.runtime.events['wellness:high-pressure-rest'],undefined);
 for(const id of ['elementary:recover','middle:recover','high:recover']){
  const opt=D.content(p).choices.find(x=>x.id===id).options.find(x=>x.id==='ignore');assert.ok(opt);
  assert.equal(c.GukminEffects.apply(p,opt.result).stats.stress,24);
 }
 engine.apply('limit',{effects:{stats:{stress:6}}});
 const ended=engine.snapshot();assert.equal(ended.persona.attributes.lifeEndReason,'정신병 한계');assert.equal(ended.persona.stats.stress,25);assert.equal(ended.choice,null);
 const saved={...ended.persona,simulation:plain(ended.runtime)};
 assert.equal(D.create({persona:saved}).run().persona.attributes.lifeEndReason,'정신병 한계');
});
test('aptitude comes from repeated related activities and applies tagged modifiers',()=>{
 const {c,P}=setup(),D=c.GukminDirector,E=c.GukminEffects;
 const engine=D.create({persona:P.generate(),persist:p=>P.save(p)});
 let s=engine.run();
 for(let i=0;i<25&&s.choice?.id!=='elementary:interest-followup';i++){
  assert.ok(s.choice);
  const science=s.choice.id==='elementary:interest-exploration';
  engine.resolve(s.choice.token,s.choice.options[science?1:0].id);
  engine.run();s=engine.snapshot();
 }
 assert.equal(s.choice?.id,'elementary:interest-followup');
 engine.resolve(s.choice.token,'choice-1');
 const person=engine.snapshot().persona;
 assert.ok(P.hasTrait(person,'이과'));
 assert.equal(P.hasTrait(person,'관심-이과'),false,'formal aptitude replaces the interest seed');
 assert.equal(P.traitDefinition('관심-이과').hidden,true);
 const tagged=E.apply(person,{tags:['science'],effects:{stats:{schoolScore:1}}}).stats.schoolScore;
 const plainEffect=E.apply(person,{tags:['sports'],effects:{stats:{schoolScore:1}}}).stats.schoolScore;
 assert.equal(tagged,plainEffect+1);
});

test('science-school lookup keeps all eight gifted institutions distinct from science highs',()=>{
 const {c}=setup(),S=c.GukminSchools;
 for(const name of ['광주과학고등학교','서울과학고등학교','경기과학고등학교',
  '대구과학고등학교','대전과학고등학교','세종과학예술영재학교',
  '인천과학예술영재학교','한국과학영재학교'])assert.equal(S.kindOf(name),'gifted',name);
 assert.equal(S.kindOf('경기북과학고등학교'),'science');
});

test('scenario slot chooses by priority at opening, saves the branch and never rerolls',()=>{
 const {P,T}=setup(),seed=P.generate();
 const cfg={contentId:'scenario-v1',attributes:{storyPath:{label:'경험 경로'}},
  events:[{id:'class-election',at:2,layer:'일상 이벤트',title:'선거',choice:'class-election'}],
  choices:[{id:'class-election',layer:'일상 선택',title:'선거',body:'기존 대기 세이브',options:[{id:'legacy',label:'기존'}],variants:[
   {id:'past',title:'검증 시나리오',priority:30,when:{attributes:{storyPath:'helped'}},body:'예전에 도와준 후보',options:[{id:'help',label:'함께 선거 운동',result:{effects:{stats:{relations:1}}}}]},
   {id:'trait',title:'검증 시나리오',priority:20,when:{traits:['리더십']},body:'친구의 추천',options:[{id:'run',label:'나간다'}]},
   {id:'default',title:'검증 시나리오',priority:0,body:'조용한 반',options:[{id:'vote',label:'투표한다'}]}
  ]}]};
 const one=T.create({...cfg,persona:plain(seed),persist:p=>P.save(p)});
 one.apply('past',{effects:{attributes:{storyPath:'helped'},traits:{add:['리더십']}}});
 one.advance(2);
 let s=one.snapshot();
 assert.equal(s.choice.scenarioId,'past');
 assert.equal(s.choice.body,'예전에 도와준 후보');
 const token=s.choice.token;
 const twice=T.create({...cfg,persona:P.load(),persist:p=>P.save(p)});
 assert.equal(twice.snapshot().choice.scenarioId,'past');
 assert.equal(twice.snapshot().choice.token,token);
 twice.apply('change',{effects:{attributes:{storyPath:'other'},traits:{remove:['리더십']}}});
 assert.equal(twice.snapshot().choice.scenarioId,'past','opened story stays frozen');
 assert.equal(twice.resolve(token,'help'),true);
 assert.equal(twice.resolve(token,'help'),false);
 assert.equal(twice.snapshot().persona.stats.relations,seed.stats.relations+1);
 const traitSeed=plain(seed);traitSeed.traits.push('리더십');
 const alt=T.create({...cfg,persona:traitSeed});alt.advance(2);
 assert.equal(alt.snapshot().choice.scenarioId,'trait');
 const base=T.create({...cfg,persona:plain(seed)});base.advance(2);
 assert.equal(base.snapshot().choice.scenarioId,'default');
 const again=T.create({...cfg,persona:plain(seed)});again.advance(2);
 assert.equal(again.snapshot().choice.scenarioId,base.snapshot().choice.scenarioId);
});
test('legacy open choice without scenarioId keeps original labels and options',()=>{
 const {P,T}=setup(),p=P.generate();
 const cfg={contentId:'legacy-branch',events:[{id:'e',layer:'일상 이벤트',at:0,choice:'e'}],
 choices:[{id:'e',layer:'일상 선택',options:[{id:'old',label:'기존 선택'}],variants:[
 {id:'new',title:'검증 시나리오',priority:0,options:[{id:'new',title:'검증 시나리오',label:'새 선택'}]}
 ]}]};
 const old=T.create({...cfg,persona:p});old.advance(0);
 const saved=plain(old.snapshot().persona);
 saved.simulation=plain(old.snapshot().runtime);
 delete saved.simulation.choices['e:1'].scenarioId;delete saved.simulation.choices['e:1'].script;
 const loaded=T.create({...cfg,persona:saved});
 assert.equal(loaded.snapshot().choice.options[0].id,'old');
 assert.equal(loaded.resolve('e:1','old'),true);
});

test('early behavior changes a later play scene without rerolling or immediate stress rewards',()=>{
 const {c,P}=setup(),seed=P.generate(),D=c.GukminDirector;
 const a=D.create({persona:plain(seed)});a.run();
 assert.equal(a.snapshot().choice.id,'infant:home');
 assert.ok(a.snapshot().choice.scenarioId);
 a.resolve(a.snapshot().choice.token,'choice-0');a.run();
 const curious=a.snapshot();
 assert.equal(curious.choice.id,'infant:play');
 assert.equal(curious.choice.scenarioId,'curious-play');
 const before=curious.persona.stats.stress;
 a.resolve(curious.choice.token,'choice-1');
 assert.equal(a.snapshot().persona.stats.stress,before,'childhood cooperation develops traits without mental-health charges');
 const b=D.create({persona:plain(seed)});b.run();
 b.resolve(b.snapshot().choice.token,'choice-1');b.run();
 assert.equal(b.snapshot().choice.scenarioId,'cautious-play');
 const c2=D.create({persona:plain(seed)});c2.run();
 c2.resolve(c2.snapshot().choice.token,'choice-1');c2.run();
 assert.equal(c2.snapshot().choice.scenarioId,b.snapshot().choice.scenarioId);
});
test('class election keeps original event ID and separates candidacy, victory and role end',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const p=P.generate();p.phase='elementary';p.age=11;p.stats.relations=15;
 const engine=D.create({persona:p});
 let s=engine.run(),guard=0;
 while(s.choice?.id!=='elementary:representative'&&guard++<20){
  assert.ok(s.choice);engine.resolve(s.choice.token,s.choice.options[0].id);s=engine.run();
 }
 assert.equal(s.choice?.id,'elementary:representative');
 assert.ok(s.choice.scenarioId);
 const token=s.choice.token;
 assert.equal(engine.resolve(token,s.choice.options[0].id),true);
 let after=engine.snapshot();
 assert.equal(after.persona.attributes.classElection,'elected');
 assert.ok(after.persona.roles.includes('반장'));
 assert.equal(after.reviewPending,true);
 assert.equal(engine.resolve(token,s.choice.options[0].id),false);
 engine.run();
 while(engine.snapshot().choice&&engine.snapshot().choice.id!=='middle:friends'&&guard++<40){
  const next=engine.snapshot().choice;
  engine.resolve(next.token,next.options.find(o=>o.available)?.id);engine.run();
 }
 assert.equal(engine.snapshot().persona.attributes.classElection,'elected');
 assert.equal(engine.snapshot().persona.roles.includes('반장'),false,'role ends upon entering middle school');
});
test('high school first contact drives recurring character and different conflict',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const p=P.generate();p.age=16;p.phase='high';p.job='고등학생';
 p.stats.relations=14;p.stats.schoolScore=14;p.stats.study=12;p.stats.exam=11;
 p.attributes={schoolTrack:'general'};
 const engine=D.create({persona:p});let s=engine.run(),count=0;
 assert.equal(s.choice.id,'high:first-day');
 assert.equal(s.choice.scenarioId,'first-social');
 engine.resolve(s.choice.token,s.choice.options[0].id);s=engine.run();
 assert.equal(s.persona.attributes.highPeer,'하린');
 let career=false,teamwork=false;
 while(s.choice&&count++<30){
  if(s.choice.id==='high:career'){career=true;assert.match(s.choice.body,/최하린/);}
  if(s.choice.id==='high:teamwork'){teamwork=true;assert.match(s.choice.body,/최하린/);}
  engine.resolve(s.choice.token,s.choice.options.find(o=>o.available)?.id);s=engine.run();
  if(teamwork)break;
 }
 assert.equal(career,true);assert.equal(teamwork,true);
});
test('every school-specific high route uses different real actions',()=>{
 const {c,P}=setup(),content=c.GukminDirector.content(P.generate());
 const selections=content.choices.filter(x=>x.id.startsWith('high:track-'));
 assert.equal(selections.length,8);
 const seen=new Set();
 for(const choice of selections){
  assert.equal(choice.variants.length,1);
  const labels=choice.variants[0].options.map(x=>x.label).join(' / ');
  assert.ok(!seen.has(labels),'school tracks must not share copy-pasted options');
  seen.add(labels);
 }
});

test('review evidence survives reload and is cleared only after explicit continuation',()=>{
 const {P,T}=setup(),persona=P.generate();
 const cfg={contentId:'review-evidence',pauseAfterChoice:true,
  choices:[{id:'review-choice',layer:'일상 선택',options:[{id:'one',label:'결정',result:{
    effects:{stats:{money:12}},history:{title:'기록',detail:'12원을 실제로 받았다.'}
  }}]}],
  events:[{id:'review-event',layer:'일상 이벤트',at:0,title:'일상',choice:'review-choice'}],
  persist:p=>P.save(p)};
 let e=T.create({...cfg,persona});
 e.advance(0);
 e.resolve(e.snapshot().choice.token,'one');
 let snapshot=e.snapshot();
 assert.equal(snapshot.reviewPending,true);
 assert.equal(snapshot.runtime.reviewBefore.stats.money,0);
 assert.equal(snapshot.persona.stats.money,12);
 e=T.create({...cfg,persona:P.load()});
 snapshot=e.snapshot();
 assert.equal(snapshot.reviewPending,true);
 assert.equal(snapshot.runtime.reviewBefore.stats.money,0);
 assert.equal(snapshot.persona.stats.money,12);
 assert.equal(e.resume(),true);
 assert.equal(e.snapshot().runtime.reviewBefore,undefined);
 assert.equal(e.resume(),false);
});

test('pre-exam strategy is a deterministic preparatory memory, not a scored CSAT',()=>{
 const {c,P}=setup(),D=c.GukminDirector,p=P.generate();
 p.age=18;p.phase='high';p.stats.exam=19;p.stats.schoolScore=13;p.stats.study=14;
 p.attributes={schoolTrack:'general'};
 p.schoolHistory=[{id:'test-high',name:'검증 고등학교',kind:'high',status:'enrolled'}];
 const eng=D.create({persona:p});let s=eng.run(),steps=0;
 while(s.choice?.id!=='high:csat-strategy'&&steps++<55){
  assert.ok(s.choice,'pre-exam choice is reachable before graduation');
  eng.resolve(s.choice.token,s.choice.options.find(x=>x.available)?.id);
  s=eng.run();
 }
 assert.equal(s.choice?.id,'high:csat-strategy');
 const expected=s.persona.stats.exam>=62?'csat-mock-strength':
  s.persona.stats.schoolScore>=67?'csat-record-strength':'csat-open-plan';
 assert.equal(s.choice.scenarioId,expected,'latest assessed state, not initial persona, decides the scenario');
 assert.equal(s.persona.age,19);
 const before={exam:s.persona.stats.exam,schoolScore:s.persona.stats.schoolScore};
 const examPlan=s.choice.options.find(o=>o.result?.effects?.attributes?.preExamStrategy==='exam');
 assert.ok(examPlan,'each route offers a realistic exam-preparation path');
 eng.resolve(s.choice.token,examPlan.id);
 const after=eng.snapshot();
 assert.deepEqual({exam:after.persona.stats.exam,schoolScore:after.persona.stats.schoolScore},before,'choosing a future study direction cannot retroactively alter grades');
 assert.equal(after.persona.attributes.preExamStrategy,'exam');
 assert.equal(after.reviewPending,true);
});
test('brief frustration and ordinary communication do not create unearned medical or academic rewards',()=>{
 const {c,P}=setup(),content=c.GukminDirector.content(P.generate());
 for(const id of ['infant:prepare','high:commute','high:electives','high:graduation-photo']){
  const cdef=content.choices.find(x=>x.id===id);
  assert.ok(cdef,id);
  for(const o of cdef.options){
   const deltas=o.result?.effects?.stats||{};
   assert.equal(deltas.health,undefined,id+' should not reward conversations with physical health');
   assert.ok(deltas.stress===undefined||Math.abs(deltas.stress)<=2,id+' brief interactions only have small social burdens');
   assert.equal(deltas.schoolScore,undefined,id+' should not change grades without assessment');
  }
 }
});

test('same-turn blocking decisions open sequentially, with the second scenario based on the first result',()=>{
 const {P,T}=setup(),p=P.generate();
 const pack={contentId:'ordered-scenarios',pauseAfterChoice:true,persist:state=>P.save(state),
  attributes:{sequenceMemory:{label:'첫 결정',hidden:true}},
  choices:[
   {id:'first',layer:'일상 선택',options:[
    {id:'yes',label:'참여',result:{effects:{attributes:{sequenceMemory:'yes'}}}},
    {id:'no',label:'보류',result:{effects:{attributes:{sequenceMemory:'no'}}}}]},
   {id:'second',layer:'일상 선택',options:[{id:'legacy',label:'기존'}],variants:[
    {id:'first-was-yes',title:'검증 시나리오',priority:10,when:{attributes:{sequenceMemory:'yes'}},body:'먼저 참여한 덕에 새로운 제안이 왔다.',options:[{id:'support',label:'이어간다'}]},
    {id:'other',title:'다른 제안',priority:0,body:'다른 제안이 왔다.',options:[{id:'observe',label:'지켜본다'}]}
   ]}
  ],
  events:[
   {id:'first',layer:'일상 이벤트',at:1,choice:'first'},
   {id:'second',layer:'일상 이벤트',at:1,choice:'second'}
  ]};
 let engine=T.create({...pack,persona:p});engine.advance(1);
 let snapshot=engine.snapshot();
 assert.equal(snapshot.choice.id,'first');
 assert.equal(Object.keys(snapshot.runtime.choices).length,1,'second decision has not opened');
 const token=snapshot.choice.token;engine.resolve(token,'yes');
 snapshot=engine.snapshot();
 assert.equal(snapshot.reviewPending,true);
 assert.equal(snapshot.choice,null,'review is not covered by next decision');
 assert.equal(Object.keys(snapshot.runtime.choices).length,1);
 assert.equal(engine.resume(),true);
 snapshot=engine.snapshot();
 assert.equal(snapshot.choice.id,'second');
 assert.equal(snapshot.choice.scenarioId,'first-was-yes');
 assert.equal(snapshot.runtime.choices['second:1'].scenarioId,'first-was-yes');
 engine=T.create({...pack,persona:P.load()});
 assert.equal(engine.snapshot().choice.scenarioId,'first-was-yes','same story survives reload');
 const alternate=T.create({...pack,persona:P.generate()});alternate.advance(1);
 alternate.resolve(alternate.snapshot().choice.token,'no');alternate.resume();
 assert.equal(alternate.snapshot().choice.scenarioId,'other','different past changes only this slot');
});

test('settled choice saves its observed outcome and reply without a second settlement',()=>{
 const {P,T}=setup(),cfg=config(P);
 let engine=T.create({...cfg,persona:P.generate(),persist:p=>P.save(p),pauseAfterChoice:true});
 engine.advance(2);
 const token=engine.snapshot().choice.token;
 engine.resolve(token,'save');
 let snap=engine.snapshot(),result=snap.runtime.choices[token].outcome;
 assert.equal(result.label,'저축');
 assert.equal(result.before.stats.stress,0);
 assert.equal(result.after.stats.stress,5);
 assert.equal(result.after.stats.money-result.before.stats.money,10);
 assert.equal(snap.persona.history[result.historyFrom].title,'선택 결과');
 assert.equal(result.historyTo,result.historyFrom);
 engine=T.create({...cfg,persona:P.load(),pauseAfterChoice:true});
 snap=engine.snapshot();
 assert.deepEqual(plain(snap.runtime.choices[token].outcome),plain(result));
 assert.equal(engine.resolve(token,'save'),false);
 assert.equal(engine.resume(),true);
 assert.equal(engine.snapshot().runtime.choices[token].outcome.after.stats.money,10);
});
test('elementary presentation choice previews its real costs and benefits',()=>{
 const {c,P}=setup(),catalog=c.GukminDirector.content(P.generate());
 const project=catalog.choices.find(x=>x.id==='elementary:project');
 assert.ok(project);
 assert.equal(project.options.length,3);
 assert.ok(project.options.every(o=>o.risk),'all three routes show a concrete burden');
 assert.deepEqual(plain(project.options.map(o=>o.result.effects.stats)),
  [{study:2,stress:2},{relations:2,stress:2},{}]);
});

test('changing interests records a new exploration without granting an unearned aptitude',()=>{
 const {c,P,E}=setup(),pack=c.GukminDirector.content(P.generate());
 const start=pack.choices.find(x=>x.id==='elementary:interest-exploration');
 const follow=pack.choices.find(x=>x.id==='elementary:interest-followup');
 const arts=E.apply(P.generate(),start.options[2].result);
 const changed=E.apply(arts,follow.options[1].result);
 assert.ok(P.hasTrait(changed,'관심-이과'),'a different sustained activity must leave a visible exploration');
 assert.ok(!P.hasTrait(changed,'이과'),'one science activity cannot award an established aptitude');
 assert.ok(P.hasTrait(E.apply(arts,follow.options[2].result),'예체능'));
});

test('cooperation traits actually affect a real school collaboration',()=>{
 const {c,P,E}=setup(),pack=c.GukminDirector.content(P.generate());
 const option=pack.choices.find(x=>x.id==='elementary:project').options[1];
 const base=P.generate();base.stats.relations=11;
 const ordinary=E.apply(base,option.result);
 base.traits.push('리더십');
 assert.equal(E.apply(base,option.result).stats.relations,ordinary.stats.relations+1);
});

test('accepting a first cigarette records peer pressure before a later sustained smoking habit',()=>{
 const {c,P,E}=setup(),pack=c.GukminDirector.content(P.generate());
 const choice=pack.choices.find(x=>x.id==='high:tobacco-offer');
 const base=P.generate();base.age=17;base.phase='high';base.stats.money=0;
 const accepted=E.apply(base,choice.options[2].result);
 assert.ok(P.hasTrait(accepted,'흡연'));
 assert.ok(accepted.stats.money>=0,'a free offer cannot create personal debt');
 assert.match(accepted.history.at(-1).detail,/이후|반복|이어/,'the acquired habit needs a passage of time');
});

test('new birth descriptions agree with the household support tier',()=>{
 const {P,c}=setup();
 vm.runInContext('let seed=1905;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)',c);
 for(let i=0;i<300;i++){
  const p=P.generate();
  if(p.family==='형편이 어려운 가정')assert.ok(['soil','bronze'].includes(p.familyTier));
  if(p.family==='경제적으로 여유 있는 가정')assert.ok(['gold','diamond'].includes(p.familyTier));
 }
});

test('chosen learning resources are recorded for later daily stories',()=>{
 const {c,P,E}=setup(),pack=c.GukminDirector.content(P.generate());
 const after=pack.choices.find(x=>x.id==='elementary:afterschool');
 const p=P.generate();p.stats.money=200000;c.GukminDirector.create({persona:p});
 const learned=E.apply(p,after.options.find(o=>o.id==='library').result);
 assert.equal(learned.attributes.afterschoolPath,'friends');
 const project=pack.choices.find(x=>x.id==='elementary:project');
 assert.ok(project.variants?.some(v=>v.when?.attributes?.afterschoolPath==='friends'));assert.ok(project.variants?.some(v=>v.when?.attributes?.afterschoolPath==='library'),'past library choices retain their follow-up');
});

function openLifeScene({c,P,T},id,persona){
 const pack=c.GukminDirector.content(persona),choice=pack.choices.find(x=>x.id===id);
 assert.ok(choice,'real life choice exists: '+id);
 const engine=T.create({persona,attributes:pack.attributes,traits:pack.traits,
  choices:[choice],events:[{id:'scene',at:0,layer:choice.layer==='일상 선택'?'일상 이벤트':'한방 이벤트',choice:id}],pauseAfterChoice:true});
 engine.advance(0);return engine;
}

test('built interests and club experience unlock materially different project solutions',()=>{
 for(const [trait,expected] of [['예체능','media'],['이과','science'],['문과','humanities'],['체육','sports'],['리더십','organizing']]){
  const env=setup(),p=env.P.generate();p.phase='high';p.age=17;p.traits=[trait];p.stats.study=16;
  const e=openLifeScene(env,'high:teamwork',p),choice=e.snapshot().choice;
  const special=choice.options.find(o=>o.id==='specialty');
  assert.ok(special?.available,trait+' opens a usable solution, not only a badge');
  assert.ok(special.requirement.includes(trait),'the earned advantage is explained');
  e.resolve(choice.token,special.id);
  assert.equal(e.snapshot().persona.attributes.projectStyle,expected);
 }
 const env=setup(),plain=env.P.generate();plain.phase='high';plain.age=17;plain.traits=[];
 const choice=openLifeScene(env,'high:teamwork',plain).snapshot().choice;
 assert.equal(choice.options.find(o=>o.id==='specialty')?.available,false,'unearned solution is not available');
 assert.ok(choice.options.filter(o=>o.available).length>=2,'a player without traits retains real alternatives');
 for(const peer of ['하린','세아','재호']){
  plain.attributes={highPeer:peer};
  const current=openLifeScene(env,'high:teamwork',plain).snapshot().choice;
  assert.match(current.scenarioId,/^team-/,peer+' gets the matching conditional character scene before the fallback');
 }
});

test('project gambles reward preparation and can fail when exhausted with no reroll',()=>{
 const env=setup(),p=env.P.generate();p.phase='high';p.age=17;p.stats.study=19;p.stats.relations=11;p.stats.schoolScore=18;
 const good=openLifeScene(env,'high:teamwork',p),c=good.snapshot().choice;
 assert.ok(c.options.find(o=>o.id==='spotlight')?.outlook,'a gamble is described without promising a guaranteed reward');
 good.resolve(c.token,'spotlight');const won=good.snapshot().persona;
 assert.equal(won.attributes.projectResult,'recognized');assert.ok(won.stats.stress>p.stats.stress);
 p.stats.health=30;p.stats.stress=20;
 const bad=openLifeScene(env,'high:teamwork',p),b=bad.snapshot().choice;
 bad.resolve(b.token,'spotlight');assert.equal(bad.snapshot().persona.attributes.projectResult,'overextended');
 assert.ok(bad.snapshot().persona.stats.schoolScore<p.stats.schoolScore);
 assert.equal(bad.resolve(b.token,'spotlight'),false,'a failed gamble cannot be rolled again');
});

test('a media commitment leaves an opportunity and a later obligation instead of a free reward',()=>{
 const env=setup(),p=env.P.generate();p.phase='middle';p.age=14;p.attributes={clubPath:'media'};p.stats.study=16;p.stats.relations=16;p.stats.schoolScore=19;
 const e=openLifeScene(env,'middle:resources',p),c=e.snapshot().choice;
 assert.ok(c.options.some(o=>o.id==='showcase'),'a club member can commit to a substantial project');
 e.resolve(c.token,'showcase');const experienced=e.snapshot().persona;
 assert.equal(experienced.attributes.projectSkill,'media');assert.ok(experienced.stats.schoolScore<p.stats.schoolScore);
 experienced.phase='high';experienced.age=17;
 const project=openLifeScene(env,'high:teamwork',experienced),pc=project.snapshot().choice;
 const natural=env.P.generate();natural.phase='high';natural.age=17;natural.traits=['예체능'];
 const ordinary=openLifeScene(env,'high:teamwork',natural).snapshot().choice.options.find(o=>o.id==='specialty');
 const practiced=pc.options.find(o=>o.id==='specialty');
 assert.ok((practiced.result.effects.stats.stress||0)<(ordinary.result.effects.stats.stress||0),'completed experience reduces the real preparation burden');
 project.resolve(pc.token,'specialty');const after=project.snapshot().persona;
 const follow=openLifeScene(env,'high:family-time',after).snapshot().choice;
 assert.match(follow.body,/부탁|영상|의뢰/);
 assert.ok(follow.options.some(o=>o.id==='decline'),'the player can refuse the new commitment at a social cost');
});

test('first tobacco invitation is followed by another choice before a habit and costs emerge',()=>{
 const env=setup(),p=env.P.generate();p.phase='high';p.age=17;p.stats.relations=11;p.stats.stress=4;p.stats.money=20000;
 const first=openLifeScene(env,'high:tobacco-offer',p),fc=first.snapshot().choice;
 first.resolve(fc.token,'choice-2');const contact=first.snapshot().persona;
 assert.equal(env.P.hasTrait(contact,'흡연'),false,'one invitation does not silently become a long-term habit');
 assert.equal(contact.stats.health,undefined);assert.equal(contact.stats.money,p.stats.money);
 assert.doesNotMatch(fc.body,/책임져|건강.*손해|디버프/,'the scene is not a warning label');
 const second=openLifeScene(env,'high:break-routine',contact),sc=second.snapshot().choice;
 assert.match(sc.options.find(o=>o.id==='repeat').label,/담배|피우/,'continuing tobacco use is a deliberate action, not just meeting friends');
 second.resolve(sc.token,'repeat');const repeated=second.snapshot().persona;
 assert.equal(env.P.hasTrait(repeated,'흡연'),true,'repeating grants the trait at the actual decision');
 const pack=env.c.GukminDirector.content(repeated),senior=pack.events.find(e=>e.id==='high:age18');
 const revealed=env.E.apply(repeated,{...senior.result,history:senior.history},{turn:74});
 assert.ok(env.P.hasTrait(revealed,'흡연'));assert.equal(revealed.stats.health,repeated.stats.health,'no retroactive costs at revelation');
 assert.ok(env.P.hasTrait(revealed,'흡연'));
 const turnedBack=env.E.apply(contact,sc.options.find(o=>o.id==='leave').result);
 assert.equal(env.P.hasTrait(env.E.apply(turnedBack,senior.result),'흡연'),false,'changing course interrupts the chain');
});


test('admission choices are two distinct applications with risk/reward costs and deferred results',()=>{
 const {c,P}=setup(),pack=c.GukminDirector.content(P.generate());
 const find=id=>pack.choices.find(x=>x.id===id);
 const route=find('admission:first:route');
 const early=find('admission:first:early-application'),regular=find('admission:first:regular-application');
 const final=find('admission:first:destination');
 assert.ok(route&&early&&regular&&final);
 assert.deepEqual(plain(route.options.map(x=>x.id)),['early','regular','employment']);
 assert.equal(route.presentation.type,'admission-route');
 assert.ok(early.variants.length>=3&&regular.variants.length>=3);
 assert.equal(early.presentation.type,'university');assert.equal(regular.presentation.type,'university');
 assert.ok(early.variants.every(v=>v.options.some(o=>o.risk&&o.school?.name)));
 assert.ok(regular.variants.every(v=>v.options.some(o=>o.risk&&o.school?.name)));
 const submit=find('admission:first:final-report');
 const csat=find('admission:first:csat');
 assert.equal(submit.presentation.type,'grade-seal');assert.equal(csat.presentation.type,'grade-seal');
 const schedule=id=>pack.events.find(e=>e.id===id);
 assert.ok(schedule('admission:first:early-result').at<schedule('admission:first:regular-application').at);
 assert.ok(JSON.stringify(schedule('admission:first:regular-application').when).includes('earlyStatus'),'regular entry is gated after early results');
 const prep=find('admission:first:last-week').options;
 assert.equal(prep.length,3);
 assert.ok(prep[0].result.effects.stats.exam>prep[1].result.effects.stats.exam);
 assert.ok(prep[0].result.effects.stats.stress>0);
 assert.ok(prep[2].result.effects.stats.stress<0&&prep[2].result.effects.stats.exam<0);
 const repeat=find('admission:second:route');
 assert.equal(repeat.options.length,3);
 assert.ok(find('admission:attempt-3:route'),'later years use the same real cycle');
 assert.ok(pack.events.some(e=>e.id==='admission:retry-graduation'));
});

// Construct a reproducible state for each authored condition; no random-play coverage claims.
function satisfy(env,p,condition,want=true){
 const {E,P}=env;if(E.matches(p,condition))return want?[p]:alter();if(!want)return [p];return alter();
 function alter(){
  if(!condition||!Object.keys(condition).length)return [];
  const parts=[];
  for(const [key,value] of Object.entries(condition)){
   if(key==='all'||key==='any'){
    const sequential=(key==='all')===want;
    if(sequential){let states=[plain(p)];for(const child of value)states=states.flatMap(s=>satisfy(env,s,child,want)).slice(0,80);parts.push(...states);}
    else for(const child of value)parts.push(...satisfy(env,plain(p),child,want));
   }else if(key==='not')parts.push(...satisfy(env,plain(p),value,!want));
   else {
    const state=plain(p);
    if(key==='traits'||key==='withoutTraits'){
     const add=(key==='traits')===want;state.traits=state.traits.filter(t=>!value.includes(typeof t==='string'?t:t.name));if(add)state.traits.push(...value);
    }else if(key==='attributes'){
     state.attributes??={};for(const [id,v] of Object.entries(value)){const def=P.attributeDefinition(id);if(def.custom)state.attributes[id]=want?v:'__other__';else state[id]=want?v:'__other__';}
    }else if(key==='stats'||key==='age'){
     for(const [id,rule] of Object.entries(key==='age'?{age:value}:value)){let n=typeof rule==='number'?rule:rule.eq??rule.gte??rule.lte;if(!want)n=typeof rule==='number'?rule+1:rule.eq!==undefined?rule.eq+1:rule.gte!==undefined?rule.gte-1:rule.lte+1;if(key==='age')state.age=n;else state.stats[id]=n;}
    }else if(key==='phase')state.phase=want?value:'infant';
    parts.push(state);
   }
  }
  // Conditions are implicit AND; validate composites after applying their parts.
  if(want&&Object.keys(condition).length>1){let states=[plain(p)];for(const [k,v] of Object.entries(condition))states=states.flatMap(s=>satisfy(env,s,{[k]:v},true)).slice(0,80);return states.filter(s=>E.matches(s,condition));}
  return parts.filter(s=>E.matches(s,condition)===want);
 }
}
function variantFixture(env,choice,target){
 let p=env.P.generate();p.traits=[];p.stats={...p.stats,schoolScore:19,exam:16,relations:13,health:80,stress:5};p.attributes={};
 let states=target.when?satisfy(env,p,target.when):[p];
 const higher=(choice.variants||[]).filter(v=>v.id!==target.id&&(v.when?(!target.when||(v.priority||0)>(target.priority||0)||(v.priority||0)===(target.priority||0)&&choice.variants.indexOf(v)<choice.variants.indexOf(target)):!target.when&&(v.priority||0)>(target.priority||0)));
 for(const v of higher)states=states.flatMap(s=>satisfy(env,s,v.when,false)).filter(s=>!target.when||env.E.matches(s,target.when)).slice(0,80);
 return states.find(p=>env.c.GukminTimeline.selectScenario(choice,p,0)?.id===target.id);
}
test('every retained authored variant has a deterministic fixture and its own title',()=>{
 const env=setup(),pack=env.c.GukminDirector.content(env.P.generate());for(const [id,def] of Object.entries(pack.attributes))env.P.registerAttribute(id,def);
 const failures=[];let count=0;
 for(const choice of pack.choices)for(const variant of choice.variants||[]){assert.ok(variant.title?.trim(),choice.id+'/'+variant.id);if(!variantFixture(env,choice,variant))failures.push(choice.id+'/'+variant.id);count++;}
 assert.ok(count>100);assert.deepEqual(failures,[]);
});
test('conditional variants beat an unconditional high-priority fallback; frozen scripts survive definition changes',()=>{
 const env=setup(),p=env.P.generate(),cfg={contentId:'frozen',events:[{id:'e',at:0,layer:'일상 이벤트',choice:'c'}],choices:[{id:'c',title:'base',layer:'일상 선택',options:[{id:'base'}],variants:[{id:'fallback',title:'fallback',priority:100,options:[{id:'f'}]},{id:'specific',title:'specific',when:{traits:['호기심']},priority:1,options:[{id:'s',label:'old',result:{effects:{stats:{money:7}}}}]}]}]};
 p.traits.push('호기심');const t=env.T.create({...cfg,persona:p});t.advance(0);assert.equal(t.snapshot().choice.scenarioId,'specific');
 const saved={...t.snapshot().persona,simulation:plain(t.snapshot().runtime)};cfg.choices[0].variants[1].options[0].result.effects.stats.money=99;
 const restored=env.T.create({...cfg,persona:saved});assert.equal(restored.snapshot().choice.options[0].result.effects.stats.money,7);restored.resolve('e:1','s');assert.equal(restored.snapshot().persona.stats.money,p.stats.money+7);
});
test('pre-revision scenario-only saves recover retired peer scripts and their original option IDs',()=>{
 const env=setup(),p=env.P.generate(),pack=env.c.GukminDirector.content(p);p.phase='high';p.age=17;
 const engine=env.T.create({...pack,persona:p});const saved=engine.snapshot().persona;saved.simulation=plain(engine.snapshot().runtime);saved.simulation.turn=72;saved.simulation.choices.old={token:'old',eventId:'high:teamwork',choiceId:'high:teamwork',layer:'일상 선택',status:'waiting',scenarioId:'project-media-harin',openedAt:72};saved.simulation.events['high:teamwork'].status='running';saved.simulation.events['high:teamwork'].waitingToken='old';
 const old=env.T.create({...pack,persona:saved});assert.equal(old.snapshot().choice.scenarioId,'project-media-harin');assert.ok(old.snapshot().choice.options.some(o=>o.id==='specialty'));assert.match(old.snapshot().choice.body,/최하린/);assert.equal(old.snapshot().choice.options.find(o=>o.id==='specialty').result.effects.stats.study,-1);
});
test('assessment maintenance, diminishing returns and integer trait costs share settlement',()=>{
 const {c,P,E}=setup(),p=P.generate();p.phase='middle';p.stats.schoolScore=17;p.stats.stress=8;p.traits=[];
 const result={assessment:{metric:'schoolScore',effort:2}};let s=p;for(let i=0;i<6;i++)s=E.apply(s,result);assert.equal(s.stats.schoolScore,17);
 for(const effort of [0,1,2,3,4]){const a=c.GukminGrades.assessment(p,{metric:'schoolScore',effort}),after=E.apply(p,{assessment:{metric:'schoolScore',effort}});assert.equal(after.stats.schoolScore-p.stats.schoolScore,a.actual);assert.ok(Number.isInteger(after.stats.stress));}
 p.phase='high';p.attributes={schoolTrack:'science'};p.traits=['문과','인내심','꼼꼼함'];p.stats.schoolScore=19;
 let a=c.GukminGrades.assessment(p,{metric:'schoolScore',effort:3});assert.equal(a.stats.stress,3);assert.equal(a.stats.schoolScore,2);assert.equal(a.applied.length,3);
 a=c.GukminGrades.assessment(p,{metric:'schoolScore',effort:0});assert.equal(a.stats.stress,-2);assert.equal(a.stats.schoolScore,-2);assert.equal(a.applied.length,0);
 p.stats.exam=21;let recovered=E.apply(E.apply(p,{assessment:{metric:'exam',effort:0}}),{assessment:{metric:'exam',effort:0}});assert.equal(recovered.stats.exam,17);
 p.stats.schoolScore=25;const capped=c.GukminGrades.assessment(p,{metric:'schoolScore',effort:4});assert.equal(capped.actual,0);assert.equal(capped.limited,true);
 assert.equal(c.GukminGrades.assessment(p,{metric:'schoolScore',effort:2}).stats.schoolScore,-1,'maintaining a top score now requires active preparation');
});
test('high-school counseling is consumed once and admission requires actual preparation',()=>{
 const env=setup(),p=env.P.generate();p.phase='middle';p.age=15;p.stats.schoolScore=22;p.stats.stress=5;const pack=env.c.GukminDirector.content(p);for(const [id,d] of Object.entries(pack.attributes))env.P.registerAttribute(id,d);
 const science=pack.choices.find(c=>c.id==='middle:high-application').options.find(o=>o.school.kind==='science');assert.equal(env.E.matches(p,science.when),false);p.attributes={admissionResearch:'paid'};assert.equal(env.E.matches(p,science.when),true);
 const publicPerson=plain(p);publicPerson.attributes.admissionResearch='official';const paid=env.E.apply(p,science.result),free=env.E.apply(publicPerson,science.result);assert.equal(free.stats.stress-paid.stats.stress,1);assert.equal(paid.attributes.counselingUsed,true);
 assert.notEqual(env.c.GukminStory.admissionGuide(p,'official'),env.c.GukminStory.admissionGuide(p,'mentor'));assert.match(env.c.GukminStory.admissionGuide(p,'paid'),/準備|준비 순서/);
});
test('smoking pre-state thresholds and patience grace are exact and research schools exclude the chain',()=>{
 const env=setup();for(const stress of [17,18])for(const patient of [false,true]){
  const p=env.P.generate();p.phase='high';p.age=17;p.stats.stress=stress;p.stats.health=80;p.attributes={schoolTrack:'general'};p.traits=patient?['인내심']:[];
  const first=openLifeScene(env,'high:tobacco-offer',p),fc=first.snapshot().choice;assert.equal(fc.options[0].id,'choice-2');first.resolve(fc.token,'choice-2');let s=first.snapshot().persona;assert.equal(env.P.hasTrait(s,'흡연'),stress===18);assert.equal(s.stats.health,undefined);
  if(stress===17){const second=openLifeScene(env,'high:break-routine',s);second.resolve(second.snapshot().choice.token,'repeat');s=second.snapshot().persona;assert.equal(env.P.hasTrait(s,'흡연'),!patient);if(patient){assert.equal(s.attributes.habitStage,'grace');const third=openLifeScene(env,'high:smoking-reconsider',s);third.resolve(third.snapshot().choice.token,'repeat');assert.equal(env.P.hasTrait(third.snapshot().persona,'흡연'),true);}}
 }
 const p=env.P.generate(),pack=env.c.GukminDirector.content(p);for(const [id,d] of Object.entries(pack.attributes))env.P.registerAttribute(id,d);
 for(const schoolTrack of ['science','gifted'])for(const id of ['high:tobacco-offer','high:break-routine','high:smoking-reconsider']){p.phase='high';p.attributes={schoolTrack,habitStage:id.endsWith('reconsider')?'grace':'first'};assert.equal(env.E.matches(p,pack.events.find(e=>e.id===id).when,74),id==='high:tobacco-offer');}
});
test('election grants role and leadership only on victory; graduation preserves the trait once',()=>{
 const env=setup();for(const relations of [12,20]){const p=env.P.generate();p.phase='elementary';p.age=11;p.stats.relations=relations;p.traits=[];const e=openLifeScene(env,'elementary:representative',p);e.resolve(e.snapshot().choice.token,e.snapshot().choice.options[0].id);const s=e.snapshot().persona;assert.equal(env.P.hasTrait(s,'리더십'),relations===20);assert.equal(s.roles.includes('반장'),relations===20);const g=openLifeScene(env,'elementary:graduation',s);g.resolve(g.snapshot().choice.token,g.snapshot().choice.options[0].id);assert.equal(g.snapshot().persona.traits.filter(t=>t==='리더십').length,relations===20?1:0);}
});
test('admission draw is stable, varies by seed, obeys prerequisites and uses real strategy bonuses',()=>{
 const env=setup(),p=env.P.generate(),pack=env.c.GukminDirector.content(p);for(const [id,d] of Object.entries(pack.attributes))env.P.registerAttribute(id,d);p.phase='high';p.stats.schoolScore=23;p.stats.exam=23;p.attributes={admissionAttempts:1,admissionRoute:'early'};p.admissionSeed='fixed-seed';
 const choice=pack.choices.find(c=>c.id==='admission:first:early-application'),o=choice.variants[0].options[1];p.attributes.earlyChoice=o.id;const request={admissionDecision:{cycle:'admission:first',type:'early'}};
 const first=env.E.apply(p,request),again=env.E.apply(plain(p),request);assert.deepEqual(plain(first),plain(again));const draw=env.c.GukminAdmissions.roll(p,'test');p.admissionSeed='other';assert.notEqual(env.c.GukminAdmissions.roll(p,'test'),draw);
 p.stats.exam=0;assert.equal(env.E.apply(p,request).attributes.earlyStatus,'failed');
 p.attributes.preExamStrategy='record';assert.equal(env.c.GukminAdmissions.probability(p,{target:23},'early'),47);p.attributes.preExamStrategy='balanced';assert.equal(env.c.GukminAdmissions.probability(p,{target:23},'early'),35);
});
test('final current-year scores freeze; next retake reopens only the exam, never high-school grades',()=>{
 const env=setup(),p=env.P.generate(),pack=env.c.GukminDirector.content(p);for(const [id,d] of Object.entries(pack.attributes))env.P.registerAttribute(id,d);p.phase='high';p.age=18;p.stats={...p.stats,money:1000000,stress:5,schoolScore:20,exam:23};p.attributes={admissionAttempts:1,csatSubmitted:true,highFinalSubmitted:true};
 let s=env.E.apply(p,{effects:{stats:{schoolScore:1,exam:1}}});assert.equal(s.stats.schoolScore,20);assert.equal(s.stats.exam,23);s=env.E.apply(s,{retryYear:true});assert.equal(s.age,19);assert.equal(s.stats.exam,23);assert.equal(s.attributes.csatSubmitted,false);s=env.E.apply(s,{assessment:{metric:'exam',effort:3}});assert.equal(s.stats.exam,23);assert.equal(s.stats.schoolScore,20);
});
test('N-year cost and termination boundaries do not charge blocked years or duplicate transactions',()=>{
 const env=setup(),pack=env.c.GukminDirector.content(env.P.generate());for(const [id,d] of Object.entries(pack.attributes))env.P.registerAttribute(id,d);
 for(const [money,stress,age,end,cost,nextAge,nextAttempt] of [
 [300001,5,20,null,0,21,3],[300000,5,20,null,0,21,3],[299999,5,20,null,0,21,3],[0,5,20,null,0,21,3],
 [1000000,22,20,null,0,21,3],[1000000,23,20,null,0,21,3],[1000000,25,20,null,0,21,3],
 [1000000,5,28,null,0,29,3],[1000000,5,29,'백수 엔딩',0,30,2],[1000000,5,30,'백수 엔딩',0,30,2]]){
  const p=env.P.generate();p.phase='high';p.age=age;p.stats.money=money;p.stats.stress=stress;p.attributes={admissionAttempts:2,highFinalSubmitted:true};
  const t=env.T.create({persona:p});t.apply('retry',{retryYear:true});assert.equal(t.apply('retry',{retryYear:true}),false);const s=t.snapshot().persona;assert.equal(s.stats.money,money-cost);assert.equal(s.age,nextAge);assert.equal(s.attributes.admissionAttempts,nextAttempt);assert.equal(s.attributes.retryEndReason,end);
 }
});
test('third and fourth admission years execute and resume without charging or aging twice',()=>{
 const env=setup(),p=env.P.generate();p.phase='high';p.age=19;p.job='N수생';p.stats={...p.stats,money:5000000,stress:3,health:95,schoolScore:20,exam:16};p.attributes={admissionAttempts:2,admissionDestination:'retry',highFinalSubmitted:true};let e=env.c.GukminDirector.create({persona:p,persist:p=>env.P.save(p)});let reached=2;
 for(let i=0;i<70;i++){let s=e.run();if(s.runtime.cinematic){s=e.run();}if(!s.choice)continue;const c=s.choice;if(c.id==='admission:attempt-4:route'){reached=4;break;}const o=c.options.find(o=>c.id.endsWith(':destination')&&o.id==='retry')||c.options.find(o=>o.id==='effort-0')||c.options.find(o=>o.id==='employment')||c.options.find(o=>o.available);e.resolve(c.token,o.id);if(c.id.endsWith(':destination')){const before=e.snapshot();assert.equal(e.resolve(c.token,o.id),false);e=env.c.GukminDirector.create({persona:env.P.load(),persist:p=>env.P.save(p)});assert.equal(e.snapshot().persona.age,before.persona.age);assert.equal(e.snapshot().persona.stats.money,before.persona.stats.money);}}
 assert.equal(reached,4);assert.ok(e.snapshot().runtime.turn>=109);assert.equal(e.snapshot().persona.age,21);assert.equal(e.snapshot().persona.stats.money,5000000);
});
test('full humanities/science lives can prepare for science school and retain the right admissions field',()=>{
 for(const field of ['문과','이과']){
  const env=setup(),p=env.P.generate();p.familyTier='bronze';p.traits=['동수저'];p.birthplaceId='경기도.성남시.분당구';p.regionTags=['도시'];p.stats={...p.stats,health:100,stress:0,allowance:10000,relations:13};p.admissionSeed='student-route-fixture';let e=env.c.GukminDirector.create({persona:p});let entered=false,applied=false,board=false;
  for(let i=0;i<100;i++){
   let s=e.run();if(s.runtime.cinematic){s=e.run();}if(!s.choice)break;if(s.persona.stats.stress>=16&&e.storeStatus().items.find(o=>o.id==='break')?.available){e.buy('break');s=e.snapshot();}const c=s.choice;let o;
   if(c.id==='elementary:interest-exploration'||c.id==='elementary:interest-followup')o=c.options[field==='문과'?0:1];
   else if(c.id==='middle:admission-prep')o=c.options.find(o=>o.id==='public');
   else if(c.presentation?.type==='exam')o=c.options.find(o=>o.id===(c.presentation.category==='mock'?'effort-0':s.persona.stats.schoolScore>=23?'effort-2':'effort-4'));
   else if(c.id==='middle:high-application'){o=c.options.find(o=>o.school.kind==='science');assert.equal(o.available,true);}
   else if(c.id==='admission:first:route')o=c.options.find(o=>o.id==='early');
   else if(c.id==='admission:first:early-application'){board=true;o=c.options.find(o=>o.school?.name.includes('서울대학교'));assert.ok(o,'sustained intensive preparation reaches the top application group');e.resolve(c.token,o.id,{admissionField:field==='문과'?'humanities':'science'});assert.equal(e.snapshot().persona.attributes.admissionField,field==='문과'?'humanities':'science');break;}
   if(!o&&c.layer==='일상 선택')o=c.options.filter(o=>o.available).sort((a,b)=>{const value=o=>{const x=o.result?.effects?.stats||{};return -(x.stress||0)*3+(x.schoolScore||x.study||0)+(o.result?.effects?.traits?.add||[]).filter(t=>['인내심','꼼꼼함'].includes(t)).length*3;};return value(b)-value(a);})[0];
   o??=c.options.find(o=>o.available);e.resolve(c.token,o.id);const after=e.snapshot().persona;
   if(c.id==='middle:high-application'){entered=true;assert.equal(after.stats.exam,21);assert.equal(after.attributes.schoolTrack,'science');}
   if(c.presentation?.annual&&c.presentation.category==='school'&&field==='문과'){const sources=env.c.GukminGrades.assessment(s.persona,o.result.assessment).applied;assert.ok(sources.some(s=>s.trait==='문과'));applied=true;}
  }
  assert.ok(entered&&board,JSON.stringify({entered,board,stats:e.snapshot().persona.stats,reason:e.snapshot().persona.attributes?.lifeEndReason}));if(field==='문과')assert.ok(applied);
 }
});
test('legacy completed retry resumes into the next year exactly once without deleting prior history',()=>{
 const env=setup(),p=env.P.generate();p.phase='high';p.age=18;p.stats.money=1000000;p.stats.stress=5;p.attributes={admissionAttempts:1,admissionDestination:'retry'};const pack=env.c.GukminDirector.content(p);const t=env.T.create({...pack,persona:p}),saved=t.snapshot().persona;saved.simulation=plain(t.snapshot().runtime);saved.simulation.turn=87;for(const r of Object.values(saved.simulation.events)){r.status='completed';r.count=1;}for(const id of ['admission:second:annual-preparation','admission:second:route']){saved.simulation.events[id].status='unseen';saved.simulation.events[id].count=0;}saved.simulation.choices.old={token:'old',choiceId:'admission:first:destination',eventId:'admission:first:destination',status:'closed',layer:'한방 선택',optionId:'retry'};const before=saved.history.length;let e=env.c.GukminDirector.create({persona:saved,persist:p=>env.P.save(p)});e.run();assert.equal(e.snapshot().persona.age,19);assert.equal(e.snapshot().persona.stats.money,1000000);assert.equal(e.snapshot().persona.attributes.admissionAttempts,2);assert.ok(e.snapshot().persona.history.length>before);e=env.c.GukminDirector.create({persona:env.P.load()});e.run();assert.equal(e.snapshot().persona.age,19);assert.equal(e.snapshot().persona.stats.money,1000000);
});

test('health retirement migrates old stats, flags, waiting scripts and review deltas without deleting history',()=>{
 const {P,T}=setup(),cfg=config(P),old=P.generate();old.stats.health=87;old.metricActive={health:true};old.metricHistory=[{id:'health',value:87},{id:'money',value:5}];old.history.push({title:'이전 삶의 기록'});
 const t=T.create({...cfg,persona:old});t.advance(2);const saved={...t.snapshot().persona,simulation:plain(t.snapshot().runtime)};
 const waiting=Object.values(saved.simulation.choices)[0];waiting.script.options[0].result.effects.stats.health=-9;
 P.save(saved);const loaded=P.load();assert.equal(loaded.stats.health,undefined);assert.equal(loaded.metricActive.health,undefined);assert.equal(loaded.metricHistory.length,1);assert.ok(loaded.history.some(x=>x.title==='이전 삶의 기록'));
 const resumed=T.create({...cfg,persona:loaded});resumed.resolve(resumed.snapshot().choice.token,'save');assert.equal(resumed.snapshot().persona.stats.health,undefined);assert.equal(resumed.snapshot().persona.stats.stress,5);
});
test('childhood observation and school preparation grant fitting traits without unrelated stat rewards',()=>{
 const {c,P,E}=setup(),pack=c.GukminDirector.content(P.generate());
 for(const choice of pack.choices.filter(x=>x.id.startsWith('infant:')))for(const script of [choice,...choice.variants||[]])for(const o of script.options)assert.equal(o.result.effects.stats?.stress,undefined);
 const curious=pack.choices.find(x=>x.id==='infant:play').variants.find(v=>v.id==='curious-play');
 assert.deepEqual(plain(curious.options[0].result.effects),{traits:{add:['꼼꼼함']}});assert.ok(curious.options[1].result.effects.traits.add.includes('배려심'));
 const prep=pack.choices.find(x=>x.id==='infant:prepare');assert.ok(prep.options[1].result.effects.traits.add.includes('꼼꼼함'));assert.ok(prep.options[2].result.effects.traits.add.includes('인내심'));
 const watch=pack.choices.find(x=>x.id==='elementary:representative').variants.find(v=>v.id==='open-election').options[2];
 for(const [id,d] of Object.entries(pack.attributes))P.registerAttribute(id,d);const seed=P.generate();assert.deepEqual(plain(E.apply(seed,watch.result).stats),plain(seed.stats),'a neutral pass has no fabricated social penalty');
});

test('25-point migration preserves currency, old review history and frozen choices exactly once',()=>{
 const {P,T,storage}=setup(),old=P.generate();delete old.statScale;Object.assign(old.stats,{stress:80,relations:48,schoolScore:84,money:400000});old.metricHistory=[{id:'schoolScore',value:84}];
 const legacy={contentId:'scale-test',events:{e:{status:'running',count:1,waitingToken:'e:1'}},choices:{'e:1':{token:'e:1',eventId:'e',choiceId:'e',layer:'일상 선택',status:'waiting',script:{id:'e',layer:'일상 선택',options:[{id:'choose',label:'원래 선택',when:{stats:{relations:{gte:40}}},result:{effects:{stats:{stress:8,money:-10000}}}}]}}},version:1,turn:0,progressStart:0,applied:[]};old.simulation=legacy;
 storage.set(P.storageKey,JSON.stringify(old));const loaded=P.load();assert.equal(loaded.statScale,25);assert.equal(loaded.stats.stress,20);assert.equal(loaded.stats.relations,12);assert.equal(loaded.stats.money,400000);assert.equal(loaded.metricHistory[0].value,21);assert.equal(loaded.simulation.choices['e:1'].script.options[0].result.effects.stats.stress,2);assert.deepEqual(plain(P.upgradeScale(loaded)),plain(loaded));
 const t=T.create({persona:loaded,contentId:'scale-test',events:[{id:'e',at:0,layer:'일상 이벤트',choice:'e'}],choices:[{id:'e',layer:'일상 선택',options:[{id:'different',label:'변경된 정의'}]}]});assert.equal(t.snapshot().choice.options[0].label,'원래 선택');t.resolve('e:1','choose');assert.equal(t.snapshot().persona.stats.stress,22);assert.equal(t.snapshot().persona.stats.money,390000);
});
test('all standard state metrics use whole numbers capped at 25 while currency stays unbounded',()=>{
 const {P,E,c}=setup(),p=P.generate();for(const id of ['stress','relations','study','schoolScore','exam','support','awareness']){assert.equal(P.metricDefinition(id).max,25);const s=E.apply(p,{effects:{stats:{[id]:99}}});assert.equal(s.stats[id],25);}
 assert.equal(E.apply(p,{effects:{stats:{money:1000000}}}).stats.money,1000000);
 const careful=plain(p);careful.stats.schoolScore=25;careful.traits=['꼼꼼함'];assert.equal(c.GukminGrades.assessment(careful,{metric:'schoolScore',effort:2}).stats.schoolScore,-1);
});
test('the first tobacco encounter is available for every school, trait and relationship state',()=>{
 const {P,E,c}=setup(),p=P.generate(),pack=c.GukminDirector.content(p);for(const [id,d] of Object.entries(pack.attributes))P.registerAttribute(id,d);
 const event=pack.events.find(e=>e.id==='high:tobacco-offer'),choice=pack.choices.find(x=>x.id===event.choice);
 for(const track of ['general','science','gifted','vocational','foreign'])for(const relations of [0,25]){p.phase='high';p.age=17;p.stats.relations=relations;p.attributes={schoolTrack:track};p.traits=['인내심','꼼꼼함'];assert.ok(E.matches(p,event.when,event.at));assert.equal(c.GukminTimeline.selectScenario(choice,p,event.at).id,'senior-invitation');}
});
test('convenience-store purchases are atomic, save their cooldown and never advance time',()=>{
 const {P,c}=setup(),p=P.generate();p.age=15;p.phase='middle';Object.assign(p.stats,{money:100000,stress:20});let e=c.GukminDirector.create({persona:p,persist:s=>P.save(s)});const turn=e.snapshot().runtime.turn;
 assert.ok(e.buy('break'));assert.equal(e.snapshot().persona.stats.stress,12);assert.equal(e.snapshot().persona.stats.money,60000);assert.equal(e.snapshot().runtime.turn,turn);assert.equal(e.buy('tea'),false);e=c.GukminDirector.create({persona:P.load()});assert.equal(e.storeStatus().remaining,4);assert.equal(e.buy('break'),false);
 for(const patch of [{money:14999,stress:20},{money:100000,stress:0},{money:100000,stress:25,illness:5}]){const q=P.generate();q.age=15;q.phase='middle';Object.assign(q.stats,patch);assert.equal(c.GukminDirector.create({persona:q}).buy('tea'),false);}
});

test('plain choices have neither identical payouts nor an unconditionally worse risk/reward vector',()=>{
 const {P,c}=setup();
 for(const familyTier of ['bronze','gold']){
  const p=P.generate();p.familyTier=familyTier;const pack=c.GukminDirector.content(p);
  for(const choice of pack.choices.filter(c=>c.layer==='일상 선택'))for(const script of choice.variants?.length?choice.variants:[choice]){
   const options=script.options.filter(o=>!o.result.conditional?.length&&!o.result.assessment);
   for(let a=0;a<options.length;a++)for(let b=a+1;b<options.length;b++){
    const x=options[a].result.effects||{},y=options[b].result.effects||{};
    // Different actual traits or a deferred route need their own result tests below.
    const extra=e=>JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k])=>k!=='stats')));
    if(extra(x)!==extra(y))continue;
    const xs=x.stats||{},ys=y.stats||{},ids=[...new Set([...Object.keys(xs),...Object.keys(ys)])];
    const sign=id=>id==='stress'?-1:1;
    const better=ids.some(id=>(xs[id]||0)*sign(id)>(ys[id]||0)*sign(id));
    const worse=ids.some(id=>(xs[id]||0)*sign(id)<(ys[id]||0)*sign(id));
    assert.ok(better&&worse,`${familyTier}/${choice.id}/${script.id}: ${options[a].id} vs ${options[b].id} must exchange a real benefit for a real cost`);
   }
  }
 }
});
test('elementary preparation, electives and admission strategies differ in their actual deferred results',()=>{
 const {P,E,c}=setup(),p=P.generate();p.phase='high';p.age=17;p.traits=[];Object.assign(p.stats,{study:11,stress:10,schoolScore:15,exam:15});p.attributes={schoolTrack:'general',admissionAttempts:1};const pack=c.GukminDirector.content(p);for(const [id,d] of Object.entries(pack.attributes))P.registerAttribute(id,d);
 const entry=pack.events.find(e=>e.id==='middle:welcome').result;
 assert.equal(E.apply(p,entry).stats.schoolScore,17);p.stats.study=15;assert.equal(E.apply(p,entry).stats.schoolScore,18);p.stats.study=19;assert.equal(E.apply(p,entry).stats.schoolScore,19);
 const electives=pack.choices.find(x=>x.id==='high:electives').variants.find(x=>x.id==='regular-elective');const later=pack.events.find(x=>x.id==='high:age18').result;
 const outcomes=electives.options.map(o=>E.apply(E.apply(p,o.result),later).stats);
 assert.equal(outcomes[0].schoolScore,16);assert.equal(outcomes[1].stress,9);assert.ok(outcomes[2].relations>outcomes[0].relations);
 const csat=pack.choices.find(x=>x.id==='admission:first:csat').options[0].result;
 const final={};for(const strategy of ['balanced','exam','record']){const q=plain(p);q.attributes.preExamStrategy=strategy;final[strategy]=E.apply(q,csat);}
 assert.equal(final.exam.stats.exam-final.balanced.stats.exam,1);assert.equal(final.exam.stats.stress-final.balanced.stats.stress,2);
 assert.equal(final.balanced.stats.exam-final.record.stats.exam,1);assert.ok(c.GukminAdmissions.probability(final.record,{target:15},'early')>c.GukminAdmissions.probability(final.balanced,{target:15},'early'));
});


test('pressure overflow, persistent illness and the fifth illness point share the common settlement',()=>{
 const {P,E,c}=setup(),p=P.generate();p.age=14;p.phase='middle';p.stats.stress=24;
 let q=E.apply(p,{effects:{stats:{stress:1}}});assert.equal(q.stats.stress,25);assert.equal(q.stats.illness,0);
 q=E.apply(p,{effects:{stats:{stress:3}}});assert.equal(q.stats.stress,25);assert.equal(q.stats.illness,2);
 q=E.apply(q,{tags:['pressure-only'],effects:{stats:{stress:-10}}});assert.equal(q.stats.stress,15);assert.equal(q.stats.illness,2,'pressure relief does not silently cure illness');
 q=E.apply(q,{effects:{stats:{illness:-1}}});assert.equal(q.stats.illness,1);
 const e=c.GukminDirector.create({persona:p,persist:p=>P.save(p)});e.apply('overflow-end',{effects:{stats:{stress:6}}});const end=e.snapshot();assert.equal(end.persona.stats.illness,5);assert.equal(end.persona.attributes.lifeEndReason,'정신병 한계');assert.equal(end.choice,null);
 assert.equal(c.GukminDirector.create({persona:P.load()}).run().persona.stats.illness,5);
});
test('mental migration keeps frozen scripts, histories and old endings without reviving them',()=>{
 const {P}=setup(),p=P.generate();delete p.mentalModel;delete p.stats.illness;delete p.gender;delete p.portraitVariant;p.name='김병인';p.stats.stress=23;p.simulation={choices:{old:{script:{options:[{result:{effects:{stats:{stress:2}}}}]}}}};
 const old=plain(p),next=P.upgradeMental(p);assert.equal(next.stats.stress,23);assert.equal(next.stats.illness,0);assert.equal(next.gender,'male');assert.equal(next.portraitVariant,'male');assert.deepEqual(plain(next.simulation),old.simulation);assert.deepEqual(plain(next.history),old.history);assert.deepEqual(plain(P.upgradeMental(next)),plain(next));
 p.attributes={lifeEndReason:'정신병 한계',admissionDestination:'finished'};assert.equal(P.upgradeMental(p).stats.illness,5);
});
test('generated gender, name catalogue and portrait always agree',()=>{
 const {P,c}=setup();for(let i=0;i<100;i++){const p=P.generate();assert.ok(c.GukminData.namesByGender[p.gender].includes(p.name));assert.equal(p.portraitVariant,p.gender);assert.ok(c.GukminData.namesByGender[p.gender].includes(P.randomName(p.gender)));}
 assert.equal(P.genderOf({name:'김병인',portraitVariant:'female'}),'male');assert.equal(P.genderOf({name:'김서연',portraitVariant:'male'}),'female');
});
test('diverse store items and advice acknowledgement never advance the clock or bypass cooldown',()=>{
 const {P,c,E}=setup(),p=P.generate();p.age=15;p.phase='middle';Object.assign(p.stats,{stress:25,illness:3,money:100000});let e=c.GukminDirector.create({persona:p,persist:p=>P.save(p)});const turn=e.snapshot().runtime.turn;
 assert.equal(e.storeStatus().items.length,8);assert.equal(Math.min(...e.storeStatus().items.map(i=>i.price)),1000);
 assert.ok(e.acknowledgePressure());assert.equal(e.snapshot().runtime.turn,turn);assert.equal(e.snapshot().persona.attributes.pressureGuideSeen,true);assert.equal(e.snapshot().persona.stats.illness,3);
 assert.ok(e.buy('care'));assert.equal(e.snapshot().persona.stats.stress,17);assert.equal(e.snapshot().persona.stats.illness,2);assert.equal(e.snapshot().persona.stats.money,40000);assert.equal(e.snapshot().runtime.turn,turn);assert.equal(e.buy('water'),false);
 e=c.GukminDirector.create({persona:P.load()});assert.equal(e.storeStatus().remaining,4);assert.equal(e.buy('water'),false);
 const q=P.generate();q.phase='high';q.age=20;q.attributes={admissionAttempts:2};Object.assign(q.stats,{stress:25,illness:3,money:1000000});const pack=c.GukminDirector.content(q);for(const [id,d] of Object.entries(pack.attributes))P.registerAttribute(id,d);const retry=E.apply(q,{retryYear:true});assert.equal(retry.stats.illness,5);assert.equal(retry.attributes.retryEndReason,'정신병 한계');
});

test('critical advice is acknowledged once across healing and restored saves without advancing time',()=>{
 const {P,c}=setup(),p=P.generate();p.age=16;p.phase='high';Object.assign(p.stats,{stress:25,illness:3,money:200000});let e=c.GukminDirector.create({persona:p,persist:p=>P.save(p)});const turn=e.snapshot().runtime.turn;
 e.acknowledgePressure();assert.equal(e.snapshot().runtime.turn,turn);assert.equal(e.snapshot().persona.attributes.pressureCriticalSeen,false,'intermediate illness is not a critical acknowledgement');
 e.apply('critical',{effects:{stats:{illness:1}}});const settledTurn=e.snapshot().runtime.turn;e.acknowledgePressure();assert.equal(e.snapshot().runtime.turn,settledTurn);assert.equal(e.snapshot().persona.attributes.pressureCriticalSeen,true);
 e.buy('care');assert.equal(e.snapshot().persona.stats.illness,3);assert.equal(e.snapshot().persona.attributes.pressureCriticalSeen,true,'buying care never resets the warning');
 e=c.GukminDirector.create({persona:P.load()});e.apply('critical-again',{effects:{stats:{illness:1}}});assert.equal(e.snapshot().persona.attributes.pressureCriticalSeen,true);assert.equal(e.snapshot().runtime.turn,settledTurn);
});

test('mental choices change the visible illness stage before hidden pressure, including restored choices',()=>{
 const {P,E,T}=setup(),p=P.generate();p.age=16;p.phase='high';Object.assign(p.stats,{stress:9,illness:2});
 const rest={effects:{stats:{stress:-1}}},strain={effects:{stats:{stress:1}}};
 const q=E.apply(p,rest);assert.equal(q.stats.illness,1);assert.equal(q.stats.stress,9);
 const r=E.apply(p,strain);assert.equal(r.stats.illness,3);assert.equal(r.stats.stress,9);
 const healed=E.apply(p,{effects:{stats:{stress:-3}}});assert.equal(healed.stats.illness,0);assert.equal(healed.stats.stress,8);
 const direct=E.apply(p,{tags:['pressure-only'],effects:{stats:{stress:-1}}});assert.equal(direct.stats.illness,2);assert.equal(direct.stats.stress,8,'explicit shop pressure products retain their advertised effect');
 const cfg={contentId:'mental-recovery',events:[{id:'rest',layer:'일상 이벤트',at:0,title:'회복',choice:'rest'}],choices:[{id:'rest',layer:'일상 선택',title:'회복',blocksTime:true,options:[{id:'rest',label:'쉰다',result:rest}]}]};
 let t=T.create({...cfg,persona:p});t.advance(0);const save=t.snapshot(),token=save.choice.token;t=T.create({...cfg,persona:{...save.persona,simulation:save.runtime}});t.resolve(token,'rest');assert.equal(t.snapshot().persona.stats.illness,1);assert.equal(t.resolve(token,'rest'),false);
});

test('special-school aptitude shields pressure without changing the score for the same effort',()=>{
 const {P,c}=setup(),p=P.generate();p.phase='high';p.age=17;p.stats.schoolScore=19;p.stats.exam=19;
 for(const [track,trait] of [['science','이과'],['gifted','이과'],['foreign','문과'],['international','문과']])for(const metric of ['schoolScore','exam']){
  p.attributes={schoolTrack:track};p.traits=[];const unfit=c.GukminGrades.assessment(p,{metric,effort:4});
  p.traits=[trait];const fit=c.GukminGrades.assessment(p,{metric,effort:4});assert.equal(unfit.stats[metric],fit.stats[metric]);assert.equal(unfit.stats.stress,6);assert.equal(fit.stats.stress,3);assert.ok(fit.applied.some(s=>s.trait===trait&&s.tone==='shield'));
 }
 p.attributes={schoolTrack:'science',admissionAttempts:2};assert.equal(c.GukminGrades.assessment(p,{metric:'exam',effort:4}).stats.stress,4,'graduated N-year candidates do not pay former school costs');
});

test('corrected after-school choices settle exact tradeoffs and enforce parent tier plus cash',()=>{
 const env=setup(),{P,E}=env,p=P.generate();p.phase='elementary';p.age=9;p.traits=[];p.stats={...p.stats,study:10,relations:8,stress:4,money:20000};
 for(const tier of ['soil','bronze','silver','gold','diamond'])for(const money of [9999,10000,20000]){
  p.familyTier=tier;p.stats.money=money;const e=openLifeScene(env,'elementary:afterschool',p),s=e.snapshot(),option=s.choice.options.find(o=>o.id==='academy');
  const allowed=['silver','gold','diamond'].includes(tier)&&money>=10000;assert.equal(option.available,allowed,tier+' / '+money);
  if(!allowed){assert.throws(()=>e.resolve(s.choice.token,'academy'),/조건/);assert.equal(e.snapshot().persona.stats.money,money);continue;}
  e.resolve(s.choice.token,'academy');const q=e.snapshot().persona;assert.equal(q.stats.relations,9);assert.equal(q.stats.study,13);assert.equal(q.stats.stress,7);assert.equal(q.stats.money,money-10000);assert.equal(e.resolve(s.choice.token,'academy'),false);
 }
 const pack=env.c.GukminDirector.content(p);for(const [id,expected] of [['school',{relations:1,study:1,stress:1}],['library',{relations:2,study:-1}]]){
  const option=pack.choices.find(c=>c.id==='elementary:afterschool').options.find(o=>o.id===id),q=E.apply(p,option.result);for(const metric of ['relations','study','stress','money'])assert.equal(q.stats[metric]-p.stats[metric],expected[metric]||0);
 }
});
test('candidacy costs two pressure and only victory grants leadership and the class-president role',()=>{
 for(const [relations,outcome] of [[10,'lost'],[16,'elected']]){
  const env=setup(),p=env.P.generate();p.phase='elementary';p.age=11;p.traits=[];Object.assign(p.stats,{relations,stress:0});p.attributes={friendRoute:'shared'};
  const e=openLifeScene(env,'elementary:representative',p),s=e.snapshot();assert.match(s.choice.title,/반장 선거/);assert.equal(s.choice.options.length,3);e.resolve(s.choice.token,s.choice.options[0].id);const q=e.snapshot().persona;
  assert.equal(q.stats.stress,2);assert.equal(q.attributes.classElection,outcome);assert.equal(env.P.hasTrait(q,'리더십'),outcome==='elected');assert.equal(q.roles.includes('반장'),outcome==='elected');assert.equal(q.traits.includes('열정'),false);
 }
});


test('result memories sample the life and exclude repeated exam preparation, without changing history',()=>{
 const c=vm.createContext({});c.window=c;vm.runInContext(readFileSync('js/resultView.js','utf8'),c);
 const history=[{title:'태어났다',age:0,importance:'major'},...Array.from({length:3},(_,i)=>({title:'시험 기간이 다가옵니다',age:16+i,importance:'major'})),{title:'첫 친구',age:4,importance:'major'},{title:'새 학교 준비 기간',source:'exam-prelude:high',importance:'major'},{title:'반장 당선',age:11,importance:'major'},{title:'고교 입학',age:16,importance:'major'},{title:'고교 입학',age:16,importance:'major'},{title:'학교 졸업',age:19,importance:'major'},{title:'대학 합격',age:19,importance:'major'}];
 const copy=JSON.stringify(history),memories=c.GukminResultView.memoriesOf(history);
 assert.equal(memories.length,5);assert.equal(memories[0].title,'태어났다');assert.equal(memories.at(-1).title,'대학 합격');assert.equal(new Set(memories.map(x=>x.title)).size,5);assert.ok(memories.every(x=>!x.title.includes('준비 기간')&&!x.title.includes('다가옵니다')));assert.equal(JSON.stringify(history),copy);
 for(const reason of ['나이 제한','준비 자금 소진'])assert.equal(c.GukminResultView.isDeceased({attributes:{retryEndReason:reason}}),false);
 assert.equal(c.GukminResultView.isDeceased({attributes:{retryEndReason:'정신병 한계'}}),true);assert.equal(c.GukminResultView.isDeceased({attributes:{lifeEndReason:'정신병 한계'}}),true);
});


test('first proactive childhood choice grants initiative and reduces the pressure of candidacy',()=>{
 const {c,P,T}=setup(),p=P.generate();p.familyTier='bronze';p.traits=[];
 const pack=c.GukminDirector.content(p);for(const [id,d] of Object.entries(pack.attributes))P.registerAttribute(id,d);const home=pack.choices.find(x=>x.id==='infant:home'),variant=home.variants.find(x=>x.id==='toy-box');
 const result=variant.options[2].result,withTrait=c.GukminEffects.apply(p,result);
 assert.equal(P.hasTrait(withTrait,'진취성'),true);assert.equal(P.hasTrait(p,'진취성'),false);
 const election=pack.choices.find(x=>x.presentation?.type==='election'),candidate=election.variants.flatMap(v=>v.options).find(x=>x.result?.effects?.attributes?.classElection==='ran');
 const before=c.GukminEffects.apply(p,candidate.result),after=c.GukminEffects.apply(withTrait,candidate.result);
 assert.equal(before.stats.stress-p.stats.stress,2);assert.equal(after.stats.stress-withTrait.stats.stress,1);
 const gold=home.variants.find(x=>x.id==='toy-care');assert.ok(gold.options[2].result.effects.traits.add.includes('진취성'));
});
test('family support displays the requested tier allowances without touching money or past attempts',()=>{
 const {c,P}=setup();for(const [tier,limit] of [['soil',0],['bronze',1],['silver',2],['gold',4],['diamond',null]]){const p=P.generate();p.familyTier=tier;p.attributes={admissionAttempts:3};const copy=JSON.stringify(p),s=c.GukminAdmissions.supportStatus(p);assert.equal(s.limit,limit);assert.equal(s.used,0);assert.equal(s.remaining,limit);assert.ok(s.detail);assert.equal(JSON.stringify(p),copy);}
});


test('family-funded academy counts exhaust exactly, then self-study continues without personal tuition',()=>{
 const env=setup();for(const [id,d] of Object.entries(env.c.GukminDirector.content(env.P.generate()).attributes))env.P.registerAttribute(id,d);
 for(const [tier,limit] of [['soil',0],['bronze',1],['silver',2],['gold',4],['diamond',null]]){
  let p=env.P.generate();p.familyTier=tier;p.age=19;p.phase='high';p.attributes={admissionAttempts:1,highFinalSubmitted:true};p.stats.money=0;
  for(let year=0;year<5;year++){p.stats.stress=0;p.stats.illness=0;const t=env.T.create({persona:p});assert.equal(t.apply('year',{retryYear:true}),true);const q=t.snapshot().persona;assert.equal(t.apply('year',{retryYear:true}),false);assert.equal(q.stats.money,0);assert.equal(q.attributes.retryEndReason,null);assert.equal(q.attributes.retakeSupportUsed,limit===null?year+1:Math.min(year+1,limit));assert.equal(q.attributes.retakeMode,limit===null||year<limit?'academy':'self');env.P.save(q);p=env.P.load();assert.equal(p.attributes.retakeSupportUsed,q.attributes.retakeSupportUsed);}
 }
});
test('career offers remain optional, accepting stops exam events, and ignored years end at thirty without a death marker',()=>{
 const env=setup(),p=env.P.generate();p.familyTier='gold';p.phase='high';p.age=22;p.attributes={admissionAttempts:4,admissionRoute:'regular',highFinalSubmitted:true,retakeMode:'academy',retakeSupportUsed:3};Object.assign(p.stats,{stress:0,illness:0,relations:15,money:10000});
 const e=openLifeScene(env,'admission:attempt-4:career-offer',p),s=e.snapshot();assert.equal(s.choice.options.length,2);e.resolve(s.choice.token,'employment');assert.equal(e.snapshot().persona.attributes.admissionDestination,'employment');e.resume();e.advance(1);assert.equal(e.snapshot().choice,null);
 const savedExit=e.snapshot().persona,full=env.c.GukminDirector.content(savedExit);assert.ok(full.events.filter(x=>x.id.startsWith('admission:')).every(x=>!env.E.matches(savedExit,x.when,x.at)));
 const skip=openLifeScene(env,'admission:attempt-4:career-offer',p);skip.resolve(skip.snapshot().choice.token,'decline');assert.notEqual(skip.snapshot().persona.attributes.admissionDestination,'employment');assert.ok(skip.snapshot().persona.history.some(h=>h.detail?.includes('사회 진출 제안을 거절')));
 p.age=24;p.stats.stress=0;const after=env.E.apply(p,{retryYear:true});assert.equal(after.attributes.careerGapYears,1);assert.equal(after.stats.relations,p.stats.relations-1);assert.equal(after.stats.stress,3);assert.ok(env.P.hasTrait(after,'경력 공백'));
 p.age=29;const end=env.E.apply(p,{retryYear:true});assert.equal(end.age,30);assert.equal(end.attributes.retryEndReason,'백수 엔딩');assert.equal(end.stats.money,p.stats.money);assert.equal(end.job,'무직');assert.equal(end.attributes.lifeEndReason,undefined);
 const pack=env.c.GukminDirector.content(p);for(const n of [4,7,10])assert.ok(pack.choices.some(c=>c.id===env.c.GukminAdmissions.prefix(n)+':career-offer'));
});
test('academy feedback helps deliberate retake preparation below twenty without granting top grades automatically',()=>{
 const {c,P}=setup(),p=P.generate();p.phase='high';p.traits=[];p.stats.exam=16;p.attributes={admissionAttempts:2,retakeMode:'self'};
 const self=c.GukminGrades.assessment(p,{metric:'exam',effort:3});p.attributes.retakeMode='academy';const academy=c.GukminGrades.assessment(p,{metric:'exam',effort:3});assert.equal(academy.actual,self.actual+1);assert.ok(academy.applied.some(x=>x.label==='재수학원'));p.stats.exam=20;assert.ok(!c.GukminGrades.assessment(p,{metric:'exam',effort:3}).applied.some(x=>x.label==='재수학원'));
});


test('Korean counting age starts at one and every authored school year matches entry ages',()=>{
 const {c,P}=setup(),p=P.generate(),pack=c.GukminDirector.content(p),A=c.GukminData.schoolAges;
 assert.equal(p.ageSystem,'korean');assert.equal(p.age,1);assert.ok(p.history.every(h=>h.age===1));assert.equal(A.elementary,8);assert.equal(A.middle,14);assert.equal(A.high,17);assert.equal(A.graduation,20);
 const entry=pack.events.find(e=>e.id==='infant:school-entry');assert.equal(entry.result.effects.attributes.age,8);
 assert.equal(pack.events.find(e=>e.id==='elementary:middle-entry').result.effects.attributes.age,14);
 for(const choice of pack.choices.filter(c=>c.presentation?.type==='school'))for(const o of choice.options)assert.equal(o.result.effects.attributes.age,17);
 for(const choice of pack.choices.filter(c=>c.presentation?.type==='exam'&&['middle','high'].includes(c.presentation.stage))){const q=choice.presentation;assert.equal(q.age,A[q.stage]+q.grade-1,choice.id);}
 assert.equal(pack.events.find(e=>e.id==='high:age18').result.effects.attributes.age,19);assert.equal(pack.events.find(e=>e.id==='high:graduation').result.effects.attributes.age,20);
 for(const [age,expected] of [[1,'infant'],[7,'infant'],[8,'elementary'],[13,'elementary'],[14,'middle'],[16,'middle'],[17,'high'],[19,'high'],[20,'adult']]){const q={...p,age};delete q.phase;assert.equal(P.phaseOf(q),expected);}
});
test('old age saves migrate once, retaining waiting decisions, money, history and settlement IDs',()=>{
 const {P}=setup(),old=P.generate();delete old.ageSystem;old.age=7;old.phase='elementary';old.history=[{age:0,title:'당신이 태어났다'},{age:7,title:'초등학교 입학'}];old.stats.money=43210;old.simulation={version:1,contentId:'age-fixture',turn:28,events:{'infant:school-entry':{status:'completed',count:1}},applied:['entry-settled'],choices:{pending:{status:'waiting',token:'pending',script:{title:'13세 · 1학년 시험',presentation:{age:13},options:[{id:'enter',when:{age:{gte:15}},result:{effects:{attributes:{age:16}}}}]},outcome:{before:{age:7},after:{age:7}}}}};
 const original=JSON.stringify(old),next=P.upgradeAge(old);assert.equal(JSON.stringify(old),original);assert.equal(next.age,8);assert.equal(next.stats.money,43210);assert.equal(next.history[0].age,1);assert.equal(next.history[1].age,8);assert.equal(next.simulation.turn,28);assert.equal(next.simulation.events['infant:school-entry'].count,1);assert.equal(next.simulation.choices.pending.script.title,'14세 · 1학년 시험');assert.equal(next.simulation.choices.pending.script.presentation.age,14);assert.equal(next.simulation.choices.pending.script.options[0].result.effects.attributes.age,17);assert.equal(next.simulation.choices.pending.outcome.before.age,8);assert.deepEqual(next.simulation.applied,old.simulation.applied);
 P.save(next);const restored=P.load();P.save(restored);assert.equal(P.load().age,8);assert.equal(P.load().simulation.choices.pending.status,'waiting');assert.equal(P.load().stats.money,43210);
 const ended={...old,age:30,history:[{age:30,title:'서른, 백수 엔딩'}],attributes:{retryEndReason:'백수 엔딩'}};assert.equal(P.upgradeAge(ended).age,30);assert.equal(P.upgradeAge(ended).history[0].age,30);
});

function classroomFixture(seat='doyun'){
 const env=setup(),p=env.P.generate();p.age=8;p.phase='elementary';p.attributes={classroomRevision:1};p.stats.study=11;p.stats.relations=8;
 const full=env.c.GukminDirector.content(p),pack={...full,contentId:'classroom-check',events:full.events.filter(e=>e.id.startsWith('classroom:')),choices:full.choices.filter(c=>c.id.startsWith('classroom:'))};
 assert.equal(pack.choices.length,3,'seating, follow-up chat and sports are real content');
 const engine=env.T.create({...pack,persona:p,pauseAfterChoice:true,persist:person=>env.P.save(person)});
 engine.advance(31);assert.equal(engine.snapshot().choice.presentation.type,'seating');engine.resolve(engine.snapshot().choice.token,seat);engine.resume();return {...env,engine,pack};
}
test('classroom: seat bonuses are distinct and race luck stays inside a reproducible one-point band',()=>{
 const {P,c}=setup(),p=P.generate();
 p.age=8;p.phase='elementary';p.attributes={classroomRevision:1};
 const first=c.GukminDirector.content(p),second=c.GukminDirector.content(p);
 const seats=first.choices.find(x=>x.id==='classroom:seating').options;
 const [minseo,doyun,jiwoo]=seats;
 assert.equal(minseo.result.effects.stats.relations,2);
 assert.equal(minseo.result.effects.activate?.athletics,undefined);
 assert.equal(doyun.result.effects.activate.athletics,4);
 assert.equal(doyun.result.effects.stats.athletics,2);
 assert.equal(jiwoo.result.effects.stats.study,2);
 assert.equal(jiwoo.result.effects.activate?.athletics,undefined);
 const relay=first.choices.find(x=>x.id==='classroom:sports');
 const again=second.choices.find(x=>x.id==='classroom:sports');
 const threshold=relay.variants[0].options[0].result.conditional[0].when.all[1].any[0].stats.athletics.gte;
 assert.ok([8,9,10].includes(threshold),'race day shifts the athletic cutoff by at most one point');
 assert.deepEqual(relay.variants[0].options[0].result.conditional,again.variants[0].options[0].result.conditional,'same person seed reproduces the finish conditions');
 assert.equal(relay.variants[0].options[0].result.effects.activate.athletics,4,'untrained peers begin athletics on joining the relay');
 assert.equal(relay.variants[1].options[0].result.effects.activate?.athletics,undefined,'Doyun training must not be reset at the starting line');
});
test('classroom: desk choice remembers a class and friend, who returns in a chat and sports meet',()=>{
 const {engine,P,T,pack}=classroomFixture();let s=engine.snapshot();assert.equal(s.persona.attributes.seatmate,'도윤');assert.ok(s.persona.attributes.elementaryClass>=1&&s.persona.attributes.elementaryClass<=6);assert.equal(s.persona.stats.athletics,6);
 engine.advance(4);s=engine.snapshot();assert.equal(s.choice.presentation.type,'chat');assert.ok(s.choice.presentation.messages.some(m=>m.sender==='도윤'));const token=s.choice.token;engine.resolve(token,'practice');assert.equal(engine.resolve(token,'practice'),false);engine.resume();engine.advance(3);s=engine.snapshot();assert.equal(s.choice.presentation.type,'sports');assert.match(s.choice.body,/도윤/);
 engine.resolve(s.choice.token,'sprint');s=engine.snapshot();assert.equal(s.persona.attributes.sportsPlace,1);assert.equal(s.persona.stats.athletics,13);assert.equal(s.persona.stats.relations,11);assert.ok(s.persona.history.some(h=>h.title.includes('계주')&&h.detail.includes('도윤')));
 const restored=T.create({...pack,persona:P.load(),pauseAfterChoice:true}).snapshot();assert.equal(restored.persona.attributes.seatmate,'도윤');assert.equal(restored.persona.attributes.sportsPlace,1);assert.equal(restored.runtime.turn,38);assert.equal(restored.reviewPending,true);
});
test('classroom: preparation changes the actual finish; old completed lives get no inserted decisions',()=>{
 const {engine}=classroomFixture('minseo');engine.advance(4);engine.resolve(engine.snapshot().choice.token,'quiet');engine.resume();engine.advance(3);engine.resolve(engine.snapshot().choice.token,'handoff');assert.equal(engine.snapshot().persona.attributes.sportsPlace,3);
 const {P,T,c}=setup(),p=P.generate();p.age=11;p.phase='elementary';const full=c.GukminDirector.content(p),pack={...full,contentId:'old-classroom',events:full.events.filter(e=>e.id.startsWith('classroom:')),choices:full.choices.filter(c=>c.id.startsWith('classroom:'))};const old=T.create({...pack,persona:p});old.advance(52);assert.equal(old.snapshot().choice,null);assert.equal(old.snapshot().persona.stats.athletics,undefined);
});
test('existing class group chats use the same chat presentation in each scenario',()=>{
 const {P,c}=setup(),pack=c.GukminDirector.content(P.generate());for(const id of ['middle:group-chat','high:first-day']){const choice=pack.choices.find(c=>c.id===id);for(const script of [choice,...choice.variants]){assert.equal(script.presentation.type,'chat');assert.ok(script.presentation.messages.length>=2);}}
});
