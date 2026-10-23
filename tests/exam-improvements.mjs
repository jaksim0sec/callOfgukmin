import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const plain=value=>JSON.parse(JSON.stringify(value));
function setup(){
 const storage=new Map();
 const c=vm.createContext({console,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)}});c.window=c;
 for(const file of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/admissions'])vm.runInContext(readFileSync(`js/${file}.js`,'utf8'),c);
 const person=c.GukminPlayer.generate();person.phase='high';person.age=18;person.traits=[];person.attributes={schoolTrack:'general'};Object.assign(person.stats,{exam:17,schoolScore:17,stress:0});
 return {c,person,P:c.GukminPlayer,E:c.GukminEffects,T:c.GukminTimeline,G:c.GukminGrades,A:c.GukminAdmissions};
}
test('cramming is separate from the five stable normal effort options',()=>{
 const {c}=setup(),exam=c.GukminStory.exam('high',18,2,1,'6월 모의고사','mock');
 assert.deepEqual(plain(exam.choice.options.map(o=>o.id)),['effort-0','effort-1','effort-2','effort-3','effort-4','cram']);
 assert.equal(exam.choice.options.at(-1).result.assessment.key,exam.choice.id);
});
test('cramming advertises both bounded outcomes without exposing the seeded result',()=>{
 const {G,person}=setup();
 const definition={metric:'exam',mode:'cram',key:'exam:one'};
 const outcomes=G.cramOutcomes(person,definition);
 assert.deepEqual(plain(outcomes),{current:17,success:23,failure:15,successChance:60,failureChance:40,loss:2});
 for(const context of [{preview:true},{source:'estimate'},{source:'preview'}]){
  const a=G.assessment(person,definition,context);assert.equal(a.stats.exam,0);assert.equal(a.stats.stress,12);assert.equal(a.outcome,undefined);
 }
 person.stats.exam=25;assert.equal(G.cramOutcomes(person,definition).success,25);
 person.stats.exam=1;assert.equal(G.cramOutcomes(person,definition).failure,0);
 person.stats.exam=0;assert.equal(G.cramOutcomes(person,definition).failure,0);
});
test('saved seed and exam identity yield stable success and failure settlements across reloads',()=>{
 const {G,E,T,P,c,person}=setup(),exam=c.GukminStory.exam('high',18,2,1,'6월 모의고사','mock');
 const definition=exam.choice.options.at(-1).result.assessment;
 const seen=new Set();let failingPerson;
 for(let n=0;n<200;n++){
  person.admissionSeed='cram-fixture-'+n;
  const a=G.assessment(person,definition);seen.add(a.outcome);
  assert.deepEqual(plain(G.assessment(plain(person),definition)),plain(a));
  assert.equal(E.apply(person,{assessment:definition},{preview:true}).stats.exam,17);
  assert.equal(E.apply(person,{assessment:definition}).stats.exam,a.outcome==='success'?23:15);
  if(a.outcome==='failure')failingPerson=plain(person);
 }
 assert.deepEqual([...seen].sort(),['failure','success']);
 const seed=person.admissionSeed;const results=new Set(Array.from({length:30},(_,n)=>G.assessment({...person,admissionSeed:seed},{...definition,key:'exam:'+n}).outcome));assert.equal(results.size,2);
 let engine=T.create({persona:failingPerson,events:[exam.event],choices:[exam.choice],persist:p=>P.save(p)});engine.advance(1);
 const before=plain(engine.snapshot()),token=before.choice.token;
 engine=T.create({persona:P.load(),events:[exam.event],choices:[exam.choice],persist:p=>P.save(p)});
 assert.deepEqual(plain(engine.snapshot().choice),before.choice);assert.equal(engine.resolve(token,'cram'),true);assert.equal(engine.snapshot().persona.stats.exam,15);assert.equal(engine.resolve(token,'cram'),false);
});
test('existing frozen exam scripts retain five normal options after content gains cramming',()=>{
 const {T,P,c,person}=setup(),exam=c.GukminStory.exam('high',18,2,1,'중간고사');
 const old=plain(exam.choice);old.options=old.options.slice(0,5);
 let engine=T.create({persona:person,events:[exam.event],choices:[old],persist:p=>P.save(p)});engine.advance(1);const frozen=plain(engine.snapshot().choice);
 engine=T.create({persona:P.load(),events:[exam.event],choices:[exam.choice]});assert.deepEqual(plain(engine.snapshot().choice),frozen);
 assert.equal(engine.resolve(frozen.token,'effort-4'),true);assert.equal(engine.snapshot().persona.stats.schoolScore,19);
 const legacyExam=c.GukminStory.exam('high',17,1,1,'3월 모의고사','mock');
 const reconstructed=c.GukminStory.legacyChoice(legacyExam.choice,null,person);
 assert.equal(reconstructed.options.length,5,'legacy choices without a saved script keep their historical options');
});
test('matching special-school admissions bonus is explicit and uses the chosen field at decision',()=>{
 const {A,person}=setup(),school={target:17};person.attributes.schoolTrack='science';
 assert.equal(A.probability(person,school,'early','humanities'),35);
 const details=A.probabilityDetails(person,school,'early','science');assert.equal(details.probability,47);assert.equal(details.schoolBonus,12);assert.match(details.schoolLabel,/과학고/);
 assert.equal(A.probability(person,school,'regular','science'),41);
 for(const [track,field] of [['gifted','science'],['foreign','humanities'],['international','humanities']]){person.attributes.schoolTrack=track;assert.ok(A.probability(person,school,'early',field)>35);}
 person.attributes.schoolTrack='general';assert.equal(A.probability(person,school,'early','science'),35);
 person.attributes.schoolTrack='science';person.stats.schoolScore=25;assert.equal(A.probability(person,{target:15},'early','science'),95);
 person.attributes={schoolTrack:'science',admissionField:'science',earlyChoice:'admission:first-early-fit-건국대학교사회과학계열'};person.stats.schoolScore=18;person.stats.exam=20;
 const key='admission:first|early|건국대학교 사회과학계열';let seed;
 for(let n=0;n<1000;n++){person.admissionSeed='admission-fixture-'+n;const roll=A.roll(person,key);if(roll>=35&&roll<47){seed=person.admissionSeed;break;}}
 assert.ok(seed);assert.equal(A.decision(person,{cycle:'admission:first',type:'early'}).effects.attributes.earlyStatus,'accepted');
 person.attributes.admissionField='humanities';assert.equal(A.decision(person,{cycle:'admission:first',type:'early'}).effects.attributes.earlyStatus,'failed');
 person.attributes.earlyChoice='admission:first-early-stretch-서울대학교인문계열';person.stats.exam=0;assert.equal(A.decision(person,{cycle:'admission:first',type:'early'}).effects.attributes.earlyStatus,'failed');
});
