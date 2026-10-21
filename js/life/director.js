/* Life director: switches operator eligibility, never replaces saved timeline state. */
(function(global){
'use strict';
const operators=new Map();
const clone=value=>JSON.parse(JSON.stringify(value));
const CONTENT_ID='life-main-v1';
function register({id,when={},generate}){
 if(typeof id!=='string'||!id.trim()||operators.has(id)||typeof generate!=='function')
   throw new Error('생애 오퍼레이터 등록 오류: '+id);
 operators.set(id,{id,when:clone(when),generate});
}
function active(persona,turn=0){
 return [...operators.values()].filter(op=>global.GukminEffects.matches(persona,op.when,turn)).map(op=>op.id);
}
function content(persona){
 const pack={contentId:CONTENT_ID,events:[],choices:[],metrics:{},traits:{},attributes:{}};
 for(const op of operators.values()){
   const generated=op.generate(clone(persona))||{};
   for(const kind of ['metrics','traits','attributes']){
     for(const [id,value] of Object.entries(generated[kind]||{})){
       if(Object.hasOwn(pack[kind],id))throw new Error('중복 정의: '+id);
       pack[kind][id]=clone(value);
     }
   }
   for(const choice of generated.choices||[])pack.choices.push(clone(choice));
   for(const event of generated.events||[]){
     pack.events.push({...clone(event),when:{all:[clone(op.when),clone(event.when||{})]}});
   }
 }
 // A recurring non-blocking recovery event; deterministic, one settlement per occurrence.
 pack.events.push({
  id:'wellness:high-pressure-rest',at:0,every:1,layer:'소식 이벤트',title:'잠깐 쉬어가는 하루',
  when:{age:{gte:7,lte:18},stats:{stress:{gte:95}}},
  history:{title:'회복을 위한 하루',detail:'무리한 일정을 잠시 줄이고 충분한 휴식을 취했다.',importance:'minor'},
  result:{effects:{stats:{stress:-20,health:4}}}
 });
 return pack;
}
function create({persona,persist,onChange}){
 persona={...persona,attributes:{admissionAttempts:1,...persona.attributes}};
 const definitions=content(persona);
 const choices=new Map(definitions.choices.map(c=>[c.id,c]));
 function decorate(raw){
  if(raw.reviewPending)return {...raw,progress:{value:0,remaining:null,waiting:false,title:'선택 결과 확인'}};
  if(raw.runtime.cinematic)return {...raw,progress:{value:0,remaining:null,waiting:true,title:'입시 결과 확인'}};
  if(raw.persona.attributes?.admissionDestination==='finished')return {...raw,choice:null,progress:{value:0,remaining:null,waiting:false,title:''}};
  if(raw.choice)return {...raw,progress:{value:1,remaining:0,waiting:true,title:raw.choice.title}};
  const eligible=definitions.events.filter(event=>{
   const runtime=raw.runtime.events[event.id];
   const c=choices.get(event.choice);
   return c&&c.blocksTime!==false&&c.progress!==false&&
     runtime?.status!=='completed'&&event.every===undefined&&
     (event.at??0)>=raw.runtime.turn&&
     global.GukminEffects.matches(raw.persona,event.when,event.at);
  }).sort((a,b)=>(a.at??0)-(b.at??0))[0];
  if(!eligible)return {...raw,progress:{value:0,remaining:null,waiting:false,title:''}};
  const at=eligible.at??0,remain=Math.max(0,at-raw.runtime.turn);
  const elapsed=Math.max(0,raw.runtime.turn-(raw.runtime.progressStart||0));
  return {...raw,progress:{value:remain===0?1:elapsed/Math.max(1,elapsed+remain),remaining:remain,waiting:false,title:eligible.title}};
 }
 const tier=global.GukminData.wealthTiers.find(t=>t.id===persona.familyTier);
 const onTurn=(person,turn)=>{
  const phase=global.GukminPlayer.phaseOf(person);
  const stats={};
  if(tier&&person.age>=7&&person.age<=18&&['elementary','middle','high'].includes(phase))
   stats.money=Number.isFinite(person.stats.allowance)?Math.max(0,person.stats.allowance):tier.allowance;
  const pressure=person.stats.stress||0;
  // Sustainable consequences: stress affects health and study, not a sudden game-over.
  if(pressure>=70)stats.health=-1;
  if(pressure>=90){
   stats.health=-2;
   if((phase==='middle'||phase==='high')&&!person.attributes?.highFinalSubmitted){
    stats.schoolScore=-1;
   }
  }
  if(person.stats.health<25&&pressure<90)stats.stress=1;
  return Object.keys(stats).length?{effects:{stats}}:null;
 };
 const timeline=global.GukminTimeline.create({...definitions,persona,persist,pauseAfterChoice:true,onTurn,
  onChange:s=>onChange?.(decorate(s))});
 function limit(){
  const s=timeline.snapshot();
  if(s.reviewPending||s.runtime.cinematic||s.persona.attributes?.admissionAttempts<2||!s.persona.attributes?.admissionAttempts||s.persona.attributes?.admissionDestination==='finished')return false;
  const reason=global.GukminAdmissions.retryReason(s.persona);
  if(!reason)return false;
  timeline.cancelPending('retake-limit:'+s.persona.attributes.admissionAttempts,{effects:{attributes:{admissionDestination:'finished',retryEndReason:reason,job:'입시 종료'}},history:{title:'N수 준비 종료 · '+reason,detail:'다음 입력 전에 준비를 중단한다.',importance:'major'}});return true;
 }
 function upgradeRetry(){
  const s=timeline.snapshot(),a=s.persona.attributes||{};
  if(!['retry','more-prep'].includes(a.admissionDestination))return;
  const last=Object.values(s.runtime.choices).filter(c=>c.status==='closed').at(-1);
  if(last?.choiceId?.startsWith('admission:')&&last.script?.revision!==2)timeline.apply('upgrade-retake:'+last.token,{retryYear:true});
 }
 function run(){
   upgradeRetry();
   if(limit())return decorate(timeline.snapshot());
   if(timeline.snapshot().runtime.cinematic)timeline.acknowledge();
   if(timeline.snapshot().persona.attributes?.admissionDestination==='finished'){timeline.resume();return decorate(timeline.snapshot());}
   // The player explicitly reviews the last result before any further progress.
   timeline.resume();
   // Execute current content, then only known one-shot events with reachable conditions.
   // Never advance a clock when no future content exists.
   timeline.advance(0);
   for(let attempt=0;attempt<definitions.events.length;attempt++){
     const s=timeline.snapshot();
     if(s.runtime.cinematic||s.persona.attributes?.admissionDestination==='finished')break;
     if(Object.values(s.runtime.choices).some(item=>item.status==='waiting'))break;
     const targets=definitions.events.filter(event=>{
       const runtime=s.runtime.events[event.id];
       return event.every===undefined&&runtime?.status!=='completed'&&
         (event.at??0)>s.runtime.turn&&
         global.GukminEffects.matches(s.persona,event.when,event.at);
     }).map(event=>event.at);
     if(!targets.length)break;
     const turns=Math.min(...targets)-s.runtime.turn;
     timeline.advance(Math.min(10000,turns));
   }
   return decorate(timeline.snapshot());
 }
 // UI-only paced progression: advance one saved logical turn per animation beat.
 // run() remains synchronous for tests, reload recovery and non-visual consumers.
 function step(){
   upgradeRetry();
   if(timeline.snapshot().runtime.cinematic)return false;
   if(timeline.snapshot().reviewPending)timeline.resume();
   if(limit()||timeline.snapshot().runtime.cinematic||timeline.snapshot().persona.attributes?.admissionDestination==='finished')return false;
   const before=timeline.snapshot();
   if(before.choice)return decorate(before);
   const future=definitions.events.some(event=>{
    const r=before.runtime.events[event.id];
    return event.every===undefined&&r?.status!=='completed'&&
      (event.at??0)>before.runtime.turn&&
      global.GukminEffects.matches(before.persona,event.when,event.at);
   });
   if(!future)return false;
   timeline.advance(1);
   return decorate(timeline.snapshot());
 }
 return Object.freeze({
   step,snapshot:()=>decorate(timeline.snapshot()),
   advance:turns=>{const result=timeline.advance(turns);run();return result;},
   acknowledge:()=>timeline.acknowledge(),
   resolve:(token,optionId,input)=>limit()?false:timeline.resolve(token,optionId,input),
   apply:(id,result)=>{const applied=timeline.apply(id,result);if(applied)run();return applied;},
   run,active:()=>{const s=timeline.snapshot();return active(s.persona,s.runtime.turn);}
 });
}
global.GukminDirector=Object.freeze({register,content,create,active,contentId:CONTENT_ID});
})(window);
