import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function setup({college=true}={}){
 const c=vm.createContext({console,localStorage:{getItem:()=>null,setItem:()=>{}}});c.window=c;
 for(const file of ['data/base','data/regions','data/schools','data/grades','playerState','effects','timeline','life/director','life/story','life/infant','life/elementary','election/engine','life/election','life/classroom','life/middle','life/high','life/admissions','life/society'])vm.runInContext(readFileSync('js/'+file+'.js','utf8'),c);
 const p=c.GukminPlayer.generate();Object.assign(p,{age:20,gender:'male',familyTier:'diamond',phase:'adult',traits:[],schoolHistory:college?[{id:'college',kind:'uni',name:'기록대학교',status:'enrolled'}]:[]});Object.assign(p.stats,{stress:9,illness:0,money:10000000,relations:12});p.attributes={societyActive:true,societyComplete:false,societyStep:'hub',societyMonths:0,collegeName:college?'기록대학교':null,collegeYears:college?4:0,collegeCompleted:0,collegeStatus:college?'재학':null,militaryStatus:'판정 전'};
 c.GukminDirector.create({persona:p});
 const choose=action=>{const option=c.GukminSociety.choice(p).options.find(o=>o.id===action);assert.ok(option,'option '+action);Object.assign(p,c.GukminEffects.apply(p,option.result));return p;};
 return {c,p,choose};
}

test('annual college choices expose a finite route and update remaining semesters and months',()=>{
 const {c,p,choose}=setup();let guide=c.GukminSociety.guidance(p);assert.equal(guide.education.remainingSemesters,8);assert.equal(guide.education.remainingMonths,48);assert.match(guide.next,/대학/);
 choose('college');assert.match(c.GukminSociety.choice(p).title,/1학년/);choose('fund-cash');assert.match(c.GukminSociety.choice(p).title,/1학년/);choose('study');guide=c.GukminSociety.guidance(p);assert.equal(guide.education.completedSemesters,2);assert.equal(guide.education.remainingMonths,36);assert.match(c.GukminSociety.choice(p).title,/2학년/);
 for(let i=1;i<4;i++){choose('fund-cash');choose('study');}
 guide=c.GukminSociety.guidance(p);assert.equal(guide.education.remainingMonths,0);assert.match(guide.education.label,/졸업 완료/);assert.equal(c.GukminSociety.choice(p).options.some(o=>o.id==='college'),false);assert.throws(()=>c.GukminSociety.decision(p,{action:'study'}));
});

test('zero-month route navigation and previews do not charge pressure, cash, or calendar time',()=>{
 const {c,p,choose}=setup();const initial=JSON.stringify(p);for(const action of ['college','career','politics']){const o=c.GukminSociety.choice(p).options.find(o=>o.id===action);c.GukminEffects.apply(p,o.result,{preview:true});}assert.equal(JSON.stringify(p),initial);
 const before={stress:p.stats.stress,money:p.stats.money,months:p.attributes.societyMonths};for(const action of ['career','back','politics','back','military','back'])choose(action);
 assert.deepEqual({stress:p.stats.stress,money:p.stats.money,months:p.attributes.societyMonths},before);
});

test('completed college and capped training cannot be selected again in older saves',()=>{
 const {c,p}=setup();p.attributes.collegeCompleted=4;let choice=c.GukminSociety.choice(p);assert.equal(choice.options.some(o=>o.id==='college'),false);assert.equal(choice.options.some(o=>o.id==='leave'),false);
 p.attributes.collegeStatus='졸업';p.attributes.collegeCompleted=0;assert.equal(c.GukminSociety.choice(p).options.some(o=>o.id==='college'),false);
 p.attributes.societyStep='career-search';p.attributes.careerTraining=3;const training=c.GukminSociety.choice(p).options.find(o=>o.id==='training');assert.equal(c.GukminEffects.matches(p,training.when),false);assert.match(training.requirement,/수료/);assert.throws(()=>c.GukminSociety.decision(p,{action:'training'}));
});

test('political entry remains an explicit goal without a college prerequisite',()=>{
 const {c,p,choose}=setup({college:false});const choice=c.GukminSociety.choice(p);assert.match(c.GukminSociety.guidance(p).goal,/정치 입문/);assert.equal(c.GukminEffects.matches(p,choice.options.find(o=>o.id==='politics').when),true);choose('politics');choose('politics-local');assert.equal(p.attributes.politicalEntryReady,true);assert.equal(p.attributes.societyMonths,2);
});
