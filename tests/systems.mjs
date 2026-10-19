import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
function setup(){
 const storage=new Map([['callOfgukmin__playable__v1','legacy-sentinel']]);
 const c=vm.createContext({console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});c.window=c;
 for(const file of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','life/middle','life/high','systemDemo'])if(existsSync(`js/${file}.js`))vm.runInContext(readFileSync(`js/${file}.js`,'utf8'),c);
 return {c,P:c.GukminPlayer,E:c.GukminEffects,T:c.GukminTimeline,storage};
}
const plain=x=>JSON.parse(JSON.stringify(x));
function config(P){
 P.registerMetric('focus',{label:'검증 집중',type:'progress',min:0,max:10});
 P.registerTrait('검증 습관',{icon:'savings',periodic:{every:2,result:{effects:{stats:{money:2}}}},modifiers:[{tags:['income'],stats:{money:{multiply:2}}}]});
 return {contentId:'test',choices:[{id:'gift',layer:'일상 선택',title:'검증 선택',blocksTime:true,options:[{id:'save',label:'저축',result:{effects:{stats:{health:-5,money:10},traits:{add:['검증 습관']},activate:{focus:1}},history:{title:'선택 결과'}}}]}],events:[
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
 s=engine.snapshot();assert.equal(s.persona.stats.health,95);assert.equal(s.persona.stats.money,10);assert.ok(P.hasTrait(s.persona,'검증 습관'));assert.ok(P.activeMetrics(s.persona).some(m=>m.id==='focus'));
 engine.advance(1);s=engine.snapshot();assert.equal(s.persona.stats.focus,3);assert.equal(P.schoolsOf(s.persona)[0].status,'enrolled');
 engine.advance(1);s=engine.snapshot();assert.equal(s.persona.stats.money,12);assert.equal(P.schoolsOf(s.persona)[0].status,'graduated');assert.equal(P.activeMetrics(s.persona).some(m=>m.id==='focus'),false);assert.equal(s.persona.metricHistory.at(-1).value,3);
 assert.equal(P.load().simulation.turn,4);assert.equal(storage.get('callOfgukmin__playable__v1'),'legacy-sentinel');assert.ok(notifications>=4);
});
test('atomic settlement rejects unknown IDs, invalid values and attributes without partial mutation',()=>{
 const {P,T}=setup();const engine=T.create({...config(P),persona:P.generate()});const before=plain(engine.snapshot());
 for(const result of [{effects:{stats:{health:-1,missing:2}}},{effects:{traits:{add:['missing']}}},{effects:{stats:{money:NaN}}},{effects:{attributes:{stats:{money:999}}}},{effects:{activate:{missing:0}}}]){
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
 const {P,T}=setup();const cfg=config(P);cfg.events=[{id:'wait',layer:'소식 이벤트',at:1,title:'기다림',when:{traits:['검증 습관']},completeWhen:{stats:{money:{gte:20}}},result:{effects:{stats:{health:-1}}},completion:{effects:{attributes:{job:'검증 직업'}},history:{title:'완료'}}}];
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
 engine.apply('branch',{effects:{stats:{money:1}},conditional:[{when:{traits:['검증 습관']},result:{effects:{stats:{health:-2}},history:{title:'내부 기록',display:'hidden',importance:'minor'}}}]});
 const s=engine.snapshot().persona;assert.equal(s.stats.health,98);assert.equal(s.history.at(-1).display,'hidden');assert.equal(s.history.at(-1).turn,0);assert.equal(s.history.at(-1).phase,'infant');
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
 assert.equal(birth.phase,'infant');assert.equal(birth.age,0);assert.equal(birth.job,'아기');
 assert.equal(birth.stats.health,P.birthDefaults.stats.health);
 assert.equal(birth.stats.money,P.birthDefaults.stats.money);
 assert.equal(Number.isFinite(birth.stats.allowance),true);
 assert.equal(Number.isFinite(birth.stats.relations),true);
 assert.equal(birth.traits.length,1);
 assert.ok(P.wealthTiers.some(t=>t.name===birth.traits[0]));
 assert.deepEqual(plain(P.activeMetrics(birth).map(metric=>metric.id)),['stress','health','money']);
 birth.stats.health=45;assert.equal(P.birthDefaults.stats.health,100);
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
 assert.equal(s.persona.age,2);
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
   assert.ok(choice.options.every(o=>o.result.effects.stats.study!==undefined));
  }
  if(choice.presentation?.type==='school'){
   applications++;
   assert.ok(choice.options.every(o=>o.school.name));
   assert.ok(choice.options.some(o=>o.school.region===c.GukminSchools.regionOf(original)));
  }
  const option=choice.options.find(o=>o.id==='effort-2'&&o.available)||choice.options.find(o=>o.available);
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
 assert.equal(final.persona.age,19);
 assert.equal(final.runtime.turn,79);
 assert.equal(final.choice,null);
 assert.equal(final.progress.remaining,null);
 assert.equal(P.schoolsOf(final.persona).find(x=>x.kind==='elementary').status,'graduated');
 assert.equal(P.schoolsOf(final.persona).find(x=>x.kind==='middle').status,'graduated');
 assert.equal(P.schoolsOf(final.persona).find(x=>x.kind==='high').status,'graduated');
 assert.equal(final.runtime.events['high:graduation'].count,1);
 engine=D.create({persona:P.load(),persist:p=>P.save(p)});
 engine.run();
 assert.equal(engine.snapshot().runtime.events['high:graduation'].count,1);
 assert.equal(engine.snapshot().runtime.turn,79);
});
test('special-school game thresholds lock options until grade requirements hold',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const persona=P.generate();
 const pack=D.content(persona);
 const school=pack.choices.find(c=>c.id==='middle:high-application');
 assert.equal(school.options.length,4);
 assert.equal(school.presentation.type,'school');
 assert.ok(school.options.find(o=>!o.when));
 assert.ok(school.options.every(o=>o.school.name&&o.school.typeLabel));
 assert.ok(school.options.every(o=>!o.when?.stats?.study),'hidden study cannot lock visibly qualified applications');
 const foreign=school.options.find(o=>o.school.minScore>0);
 if(foreign){
  const p=P.generate();
  p.stats.schoolScore=foreign.school.minScore;p.stats.study=0;
  assert.equal(c.GukminEffects.matches(p,foreign.when,63),true,'visible minimum score unlocks even with low hidden study');
  p.stats.schoolScore--;
  assert.equal(c.GukminEffects.matches(p,foreign.when,63),false,'a lower visible score locks');
 }
 const paid=pack.choices.find(c=>c.id==='middle:resources').options.find(o=>o.id==='paid');
 assert.ok(paid.when.stats.money.gte>0&&paid.result.effects.stats.money<0);
 assert.equal(paid.when.stats.allowance,undefined);
 assert.ok(school.options.filter(o=>o.school.kind==='foreign'||o.school.kind==='gifted'||o.school.kind==='autonomous'||o.school.kind==='international')
   .every(o=>o.when?.stats?.schoolScore?.gte>0));
 const exam=pack.choices.find(c=>c.id.startsWith('high:1:3월-모의고사'));
 assert.equal(exam.options.length,5);
 assert.equal(exam.presentation.type,'exam');
 assert.ok(exam.options[4].result.effects.stats.health<0);
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
  assert.equal(options.length,3);
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
 assert.equal(G.report('schoolScore',95,'high').display,'1등급');
 assert.equal(G.report('schoolScore',89,'high').display,'2등급');
 assert.equal(G.report('schoolScore',67,'high').display,'2등급');
 assert.equal(G.report('schoolScore',65,'high').display,'3등급');
 assert.equal(G.report('schoolScore',50,'middle').display,'E');
 assert.equal(G.report('schoolScore',92,'middle').display,'A');
 assert.equal(G.report('exam',95,'high').display,'2등급');
 assert.equal(G.report('exam',96,'high').display,'1등급');
 assert.ok(G.report('exam',80,'high').detail.includes('공식 성적 아님'));
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

test('everyday childhood decisions grant distinctive traits, leave a review stage and restore it on reload',()=>{
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
 assert.ok(s.persona.traits.includes('호기심'));
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
 const persona=P.generate();persona.familyTier='soil';persona.stats.allowance=2000;
 let engine=D.create({persona,persist:p=>P.save(p)}),s=engine.run();
 for(let attempt=0;attempt<30&&s.choice?.id!=='elementary:afterschool';attempt++){
  if(s.choice)engine.resolve(s.choice.token,s.choice.options.find(o=>o.available).id);
  if(engine.snapshot().reviewPending)engine.run();
  s=engine.snapshot();
 }
 assert.equal(s.choice?.id,'elementary:afterschool');
 const token=s.choice.token,academy=s.choice.options.find(o=>o.id==='academy');
 assert.equal(academy.when.stats.money.gte,3000);
 assert.equal(academy.when.stats.allowance,undefined,'income rate must not gate a purchase');
 engine.apply('test:low-funds',{effects:{stats:{money:2999-s.persona.stats.money}}});
 s=engine.snapshot();
 assert.equal(s.choice.token,token);
 assert.equal(s.choice.options.find(o=>o.id==='academy').available,false);
 assert.throws(()=>engine.resolve(token,'academy'),/선택 조건/);
 engine.apply('test:enough-funds',{effects:{stats:{money:1}}});
 s=engine.snapshot();
 assert.equal(s.persona.stats.money,3000);
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
 assert.ok(preludes.every(e=>e.layer==='소식 이벤트'&&e.when.all.some(w=>w.turn?.eq===e.at)));
 assert.ok(preludes.every(e=>e.history.importance==='major'));
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
  assert.equal(option.when.stats.money.gte,science[0].travelCost);
  assert.equal(option.when.stats.study,undefined);
  assert.equal(option.result.effects.stats.money,-science[0].travelCost);
 }
});

test('extreme student stress schedules non-blocking restorative rest without repeat settlement',()=>{
 const {c,P}=setup(),D=c.GukminDirector;
 const p=P.generate();p.age=14;p.phase='middle';p.job='중학생';
 p.stats.stress=99;p.stats.study=45;p.stats.schoolScore=50;
 const engine=D.create({persona:p,persist:x=>P.save(x)});
 const first=engine.run(),items=first.persona.history.filter(x=>x.source==='wellness:high-pressure-rest');
 assert.equal(items.length,1,'extreme stress triggers a restorative rest');
 assert.ok(first.persona.stats.stress<95,'rest reduces stress');
 assert.equal(first.runtime.events['wellness:high-pressure-rest'].count,1);
 engine.run();
 assert.equal(engine.snapshot().runtime.events['wellness:high-pressure-rest'].count,1,'no repeat without renewed high stress');
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
 assert.ok(P.hasTrait(person,'관심-이과'));
 assert.equal(P.traitDefinition('관심-이과').hidden,true);
 const tagged=E.apply(person,{tags:['science'],effects:{stats:{schoolScore:3}}}).stats.schoolScore;
 const plainEffect=E.apply(person,{tags:['sports'],effects:{stats:{schoolScore:3}}}).stats.schoolScore;
 assert.equal(tagged,plainEffect+2);
});
