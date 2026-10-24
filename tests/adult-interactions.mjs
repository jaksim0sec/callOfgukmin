/* Adult interactions are an isolated layer over existing semantic choice IDs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function setup(){
 const context=vm.createContext({console});
 context.window=context;
 context.GukminDirector={register(){}};
 context.GukminAdmissions={roll(){return 0.5;}};
 const core={
  choice(){return {id:'society:activity',title:'기존 사회 경로',body:'',options:[]};},
  decision(p,order){return {effects:{attributes:{societyMonths:(p.attributes.societyMonths||0)+(order.action==='study'?12:3),collegeCompleted:(p.attributes.collegeCompleted||0)+1,societyStep:'hub'},stats:{}},history:{title:'기존 정산',detail:'기존 경과 유지'}};},
  chance(){return 45;},
  narrative(){return {title:'소식',body:'계속'};}
 };
 context.GukminSociety=Object.freeze(core);
 for(const path of ['js/life/adultStories.js','js/life/adultFlow.js'])vm.runInContext(readFileSync(path,'utf8'),context,{filename:path});
 return {context,S:context.GukminSociety,p:{age:20,stats:{money:12000000},attributes:{societyStep:'college-year',collegeCompleted:0,collegeYears:2,collegeScenePhase:0,adultActivityRegionId:'mapo',adultRegionFlags:3,societyMonths:0}}};
}
test('adult play surfaces route without changing society-line or semantic options',()=>{
 const {S,p}=setup();
 let choice=S.lineChoice(p);
 assert.equal(choice.presentation.type,'society-line');
 assert.equal(choice.presentation.interaction.kind,'course');
 assert.equal(choice.options[0].id,'c-time-ask');
 let outcome=S.decision(p,{action:'c-time-ask'});
 Object.assign(p.attributes,outcome.effects.attributes);
 choice=S.lineChoice(p);
 assert.equal(choice.presentation.interaction.kind,'chat');
 assert.equal(choice.options[0].id,'c-team-solo');
 outcome=S.decision(p,{action:'c-team-talk'});
 assert.equal(outcome.effects.attributes.adultRelHarin,2);
 Object.assign(p.attributes,outcome.effects.attributes,{collegeCompleted:1,collegeScenePhase:0,societyStep:'college-year'});
 choice=S.lineChoice(p);
 assert.match(choice.presentation.interaction.messages[0].text,/역할/);
});
test('work evidence remains mapped to original settlement options',()=>{
 const {S,p}=setup();Object.assign(p.attributes,{societyStep:'work',careerChapterPeriods:0});
 const choice=S.lineChoice(p),v=choice.presentation.interaction;
 assert.equal(v.kind,'evidence');
 assert.deepEqual(Object.keys(v.mapping).sort(),['collab','pass','proof']);
 for(const id of Object.values(v.mapping))assert.ok(choice.options.some(o=>o.id===id));
 const outcome=S.decision(p,{action:'w-credit-talk'});
 assert.equal(outcome.effects.attributes.adultRelMinjae,1);
});
test('regional story progress survives changing hubs and remains independent',()=>{
 const {S,p}=setup();Object.assign(p.attributes,{societyStep:'region-map',adultCommunityIssueStage:2});
 let choice=S.lineChoice(p);
 assert.equal(choice.presentation.interaction.kind,'map');
 const moved=S.decision(p,{action:'visit:bundang'});
 assert.equal(moved.effects.attributes.adultIssueMapo,2);
 assert.equal(moved.effects.attributes.adultIssueBundang,0);
 Object.assign(p.attributes,moved.effects.attributes,{societyStep:'community'});
 choice=S.lineChoice(p);assert.equal(choice.presentation.interaction.kind,'chat');
 const first=S.decision(p,{action:'l-begin-online'});
 assert.equal(first.effects.attributes.adultIssueBundang,1);
 Object.assign(p.attributes,first.effects.attributes,{societyStep:'community'});
 choice=S.lineChoice(p);assert.equal(choice.presentation.interaction.kind,'evidence');
});
