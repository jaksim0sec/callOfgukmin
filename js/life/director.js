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
 pack.attributes.storeLastTurn={label:'편의점 이용 시점',hidden:true};
 pack.attributes.lifeEndReason={label:'생애 종료 이유',hidden:true};
 return pack;
}
function create({persona,persist,onChange}){
 persona={...persona,attributes:{admissionAttempts:1,...persona.attributes}};
 persona=global.GukminPlayer.upgradeScale(persona);
 // Old recovery occurrences remain archived, without a future occurrence.
 if(persona.simulation?.events)delete persona.simulation.events['wellness:high-pressure-rest'];
 const definitions=content(persona);
 const choices=new Map(definitions.choices.map(c=>[c.id,c]));
 function decorate(raw){
  if(raw.reviewPending)return {...raw,progress:{value:0,remaining:null,waiting:false,title:'선택 결과 확인'}};
  if(raw.runtime.cinematic)return {...raw,progress:{value:0,remaining:null,waiting:true,title:raw.runtime.cinematic.kind==='graduation'?'졸업과 다음 장':'입시 결과 확인'}};
  if(raw.persona.attributes?.admissionDestination==='finished')return {...raw,choice:null,progress:{value:0,remaining:null,waiting:false,title:''}};
  if(raw.choice)return {...raw,progress:{value:1,remaining:0,waiting:true,title:raw.choice.title}};
  const eligible=scheduled(raw).filter(item=>choices.has(item.event.choice)&&choices.get(item.event.choice).blocksTime!==false&&choices.get(item.event.choice).progress!==false).sort((a,b)=>a.at-b.at)[0];
  if(!eligible)return {...raw,progress:{value:0,remaining:null,waiting:false,title:''}};
  const at=Math.max(raw.runtime.turn,eligible.at),remain=Math.max(0,at-raw.runtime.turn);
  const elapsed=Math.max(0,raw.runtime.turn-(raw.runtime.progressStart||0));
  return {...raw,progress:{value:remain===0?1:elapsed/Math.max(1,elapsed+remain),remaining:remain,waiting:false,title:eligible.event.title}};
 }
 function scheduled(s){return definitions.events.flatMap(event=>{const r=s.runtime.events[event.id],at=r?.nextAt??event.at??0;return (r?.status!=='completed'||event.every!==undefined)&&global.GukminEffects.matches(s.persona,event.when,Math.max(s.runtime.turn,at))?[{event,at}]:[];});}
 const tier=global.GukminData.wealthTiers.find(t=>t.id===persona.familyTier);
 const onTurn=(person,turn)=>{
  const phase=global.GukminPlayer.phaseOf(person);
  const stats={};
  if(tier&&!(person.attributes?.admissionAttempts>1)&&person.age>=global.GukminData.schoolAges.elementary&&person.age<global.GukminData.schoolAges.graduation&&['elementary','middle','high'].includes(phase))
   stats.money=Number.isFinite(person.stats.allowance)?Math.max(0,person.stats.allowance):tier.allowance;
  const pressure=person.stats.stress||0;
  if(pressure>=23&&(phase==='middle'||phase==='high')&&!person.attributes?.highFinalSubmitted)stats.schoolScore=-1;
  return Object.keys(stats).length?{effects:{stats}}:null;
 };
 const timeline=global.GukminTimeline.create({...definitions,persona,persist,pauseAfterChoice:true,onTurn,
  onChange:s=>onChange?.(decorate(s))});
 function limit(){
  const s=timeline.snapshot();
  if(s.persona.attributes?.lifeEndReason)return false;
  if((s.reviewPending||s.runtime.cinematic)&&(s.persona.stats.illness||0)<5)return false;
  if((s.persona.stats.illness||0)>=5&&((s.persona.attributes?.admissionAttempts||1)<2||s.persona.attributes?.societyActive)){
   timeline.cancelPending('life-limit',{effects:{attributes:{lifeEndReason:'정신병 한계',admissionDestination:'finished',job:'생애 종료'}},history:{title:'삶의 끝 · 정신병 한계',detail:'감당할 수 있는 한계를 넘어 이번 삶이 끝났다.',importance:'major'}});return true;
  }
  if(s.persona.attributes?.societyActive)return false;
  if(s.persona.attributes?.admissionAttempts<2||!s.persona.attributes?.admissionAttempts||s.persona.attributes?.admissionDestination==='finished')return false;
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
   if(limit())return decorate(timeline.snapshot());
   // Execute current content, then only known one-shot events with reachable conditions.
   // Never advance a clock when no future content exists.
   timeline.advance(0);
   for(let attempt=0;attempt<definitions.events.length;attempt++){
     if(limit())break;
     const s=timeline.snapshot();
     if(s.runtime.cinematic||s.persona.attributes?.admissionDestination==='finished')break;
     if(Object.values(s.runtime.choices).some(item=>item.status==='waiting'))break;
     const targets=scheduled(s).filter(item=>item.at>s.runtime.turn).map(item=>item.at);
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
   const pending=timeline.snapshot();
   if(pending.choice)return decorate(pending);
   timeline.advance(0);
   const before=timeline.snapshot();
   if(before.choice||before.runtime.cinematic||before.persona.history.length!==pending.persona.history.length)return decorate(before);
   const future=scheduled(before).some(item=>item.at>before.runtime.turn);
   if(!future)return false;
   timeline.advance(1);
   if(limit())return false;
   return decorate(timeline.snapshot());
 }
 function storeStatus(){
  const s=timeline.snapshot(),last=s.persona.attributes?.storeLastTurn;
  const remaining=Number.isFinite(last)?Math.max(0,4-(s.runtime.turn-last)):0;
  const blockedReason=s.persona.age<global.GukminData.schoolAges.elementary?'보호자와 함께할 시기입니다':(s.persona.stats.illness||0)>=5||s.persona.attributes?.admissionDestination==='finished'?'이번 생애가 끝났습니다':s.runtime.cinematic?'현재 장면을 확인한 뒤 이용해 주세요':null;
  const blocked=!!blockedReason;
  const items=global.GukminData.shopItems.map(item=>{
   const reason=blockedReason||(remaining?'다음 이용까지 '+remaining+'턴':s.persona.stats.money<item.price?'재산 부족':item.recovery&&!(s.persona.stats.illness>0)?'정신병 회복이 필요할 때 이용':!(s.persona.stats.stress>0)&&!item.recovery?'회복할 압박이 없어요':null);
   return {...item,available:!reason,reason};
  });
  return {remaining,blocked,blockedReason,items};
 }
 function returnToSociety(){
  const s=timeline.snapshot();
  if(s.runtime.cinematic||!global.GukminSociety?.canReturn(s.persona))return false;
  const id='society-return:'+s.runtime.turn+':'+Object.keys(s.runtime.choices).length;
  return timeline.cancelPending(id,{societyDecision:{action:'return-hub'}},{readyEvent:'society:activity'});
 }
 function acknowledgePressure(){
  const s=timeline.snapshot(),a=s.persona.attributes||{},count=(a.pressureAdviceCount||0)+1,illness=s.persona.stats.illness||0;
  return timeline.apply('pressure-advice:'+count,{effects:{attributes:{pressureGuideSeen:true,pressureCriticalSeen:!!a.pressureCriticalSeen||illness===4,pressureAdviceCount:count}}});
 }
 function buy(id){
  const status=storeStatus(),item=status.items.find(x=>x.id===id);
  if(!item)throw new Error('등록되지 않은 상품');
  if(!item.available)return false;
  const s=timeline.snapshot();
  return timeline.apply('store:'+s.runtime.turn,{tags:['pressure-only'],effects:{stats:{money:-item.price,stress:-item.relief,...(item.recovery?{illness:-item.recovery}:{})},attributes:{storeLastTurn:s.runtime.turn}},history:{title:'편의점 · '+item.name,detail:item.price.toLocaleString('ko-KR')+'원을 쓰고 잠시 쉬었다.',importance:'minor'}});
 }
 return Object.freeze({
   storeStatus,buy,acknowledgePressure,returnToSociety,step,snapshot:()=>decorate(timeline.snapshot()),
   advance:turns=>{const result=timeline.advance(turns);run();return result;},
   acknowledge:()=>timeline.acknowledge(),
   resolve:(token,optionId,input)=>{if(limit())return false;const applied=timeline.resolve(token,optionId,input);if(applied)limit();return applied;},
   apply:(id,result)=>{const applied=timeline.apply(id,result);if(applied)run();return applied;},
   run,active:()=>{const s=timeline.snapshot();return active(s.persona,s.runtime.turn);}
 });
}
global.GukminDirector=Object.freeze({register,content,create,active,contentId:CONTENT_ID});
})(window);
