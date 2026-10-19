/* Deterministic integer turns, event lifecycle and idempotent transactions. */
(function(global){
'use strict';
const P=global.GukminPlayer,E=global.GukminEffects;
const clone=value=>JSON.parse(JSON.stringify(value));
const EVENT_KINDS=Object.freeze({'소식 이벤트':null,'일상 이벤트':'일상 선택','한방 이벤트':'한방 선택'});
function create({persona,events=[],choices=[],metrics={},traits={},attributes={},contentId='custom',persist=()=>true,onChange=()=>{},pauseAfterChoice=false,onTurn=null}){

 function index(definitions,label){
  const map=new Map();
  for(const def of definitions){
   if(!def.id||typeof def.id!=='string'||['__proto__','constructor','prototype'].includes(def.id)||map.has(def.id))throw new Error(label+' ID 중복/오류');
   map.set(def.id,clone(def));
  }
  return map;
 }
 for(const [id,def] of Object.entries(metrics))P.registerMetric(id,def);
 for(const [id,def] of Object.entries(traits))P.registerTrait(id,def);
 for(const [id,def] of Object.entries(attributes))P.registerAttribute(id,def);
 const eventDefs=index(events,'이벤트'),choiceDefs=index(choices,'선택');
 for(const c of choiceDefs.values()){
  if(!['일상 선택','한방 선택'].includes(c.layer)||!Array.isArray(c.options)||!c.options.length)throw new Error('선택 정의 오류: '+c.id);
  index(c.options,'선택지');

 }
 for(const e of eventDefs.values()){
  if(!Object.hasOwn(EVENT_KINDS,e.layer)||!Number.isSafeInteger(e.at??0)||(e.at??0)<0)throw new Error('이벤트 계층/시점 오류: '+e.id);
  if(e.every!==undefined&&(!Number.isSafeInteger(e.every)||e.every<1))throw new Error('이벤트 주기 오류');
  if(e.choice&&!choiceDefs.has(e.choice))throw new Error('등록되지 않은 선택: '+e.choice);
  if(EVENT_KINDS[e.layer]===null?!!e.choice:!e.choice||choiceDefs.get(e.choice).layer!==EVENT_KINDS[e.layer])throw new Error('이벤트 종류와 선택 종류 불일치: '+e.id);
 }
 if(!P.valid(persona))throw new Error('인물 데이터 오류');
 const saved=persona.simulation;
 if(saved&&(saved.version!==1||saved.contentId!==contentId))throw new Error('저장된 콘텐츠 버전과 정의가 다름');
 let state={persona:clone(persona),runtime:saved?clone(saved):{version:1,contentId,turn:0,progressStart:0,events:{},choices:{},applied:[]}};
 delete state.persona.simulation;
 state.persona.traitSince??={};
 for(const t of state.persona.traits){const id=typeof t==='string'?t:t.name;P.traitDefinition(id);state.persona.traitSince[id]??=state.runtime.turn;}
 for(const e of eventDefs.values())state.runtime.events[e.id]??={status:'unseen',count:0,nextAt:e.at??0};
 for(const id of Object.keys(state.runtime.events))if(!eventDefs.has(id))throw new Error('저장된 이벤트 정의 누락: '+id);
 function waiting(s){return Object.values(s.runtime.choices).filter(c=>c.status==='waiting');}
 function blocking(s){return waiting(s).some(c=>choiceDefs.get(c.choiceId).blocksTime!==false);}
 function settlement(s,id,result,source){
  if(s.runtime.applied.includes(id))return false;
  s.persona=E.apply(s.persona,result,{turn:s.runtime.turn,source});
  s.runtime.applied.push(id);return true;
 }
 function finish(s,eventId){
  const r=s.runtime.events[eventId],e=eventDefs.get(eventId);
  if(r.status!=='running'||r.waitingToken)return;
  if(!E.matches(s.persona,e.completeWhen,s.runtime.turn))return;
  settlement(s,`event:${eventId}:${r.count}:complete`,e.completion||{},eventId);
  r.status='completed';r.completedAt=s.runtime.turn;
  if(e.every!==undefined)r.nextAt+=e.every;
 }
 function pump(s){
  if(s.runtime.awaitingContinuation)return;
  for(const [id,e] of eventDefs){
   const r=s.runtime.events[id];
   if(r.status==='running'){finish(s,id);continue;}
   if(r.status==='completed'&&e.every===undefined)continue;
   if(s.runtime.turn<r.nextAt)continue;
   r.status='pending';
   if(!E.matches(s.persona,e.when,s.runtime.turn))continue;
   r.count++;r.status='running';r.startedAt=s.runtime.turn;
   settlement(s,`event:${id}:${r.count}:start`,{...e.result,...(e.history?{history:e.history}:{})},id);
   if(e.choice){
    const token=`${id}:${r.count}`,c=choiceDefs.get(e.choice);
    r.waitingToken=token;
    s.runtime.choices[token]={token,eventId:id,choiceId:c.id,layer:c.layer,status:'waiting',openedAt:s.runtime.turn};
   }else finish(s,id);
  }
 }
 function periodic(s){
  if(onTurn){
   const result=onTurn(clone(s.persona),s.runtime.turn);
   if(result)settlement(s,'turn:'+s.runtime.turn,result,'turn');
  }
  const held=[...s.persona.traits];
  for(const t of held){
   const id=typeof t==='string'?t:t.name,rule=P.traitDefinition(id).periodic;
   if(!rule)continue;
   const since=s.persona.traitSince[id]??0,elapsed=s.runtime.turn-since;
   if(elapsed>0&&elapsed%rule.every===0&&E.matches(s.persona,rule.when,s.runtime.turn))settlement(s,`trait:${id}:${s.runtime.turn}`,rule.result,'trait:'+id);
  }
 }
 function transact(change){
  const draft=clone(state),result=change(draft);
  if(result===false)return false;
  const updated=snapshot(draft);
  if(persist({...clone(draft.persona),simulation:clone(draft.runtime)})===false)throw new Error('저장 실패: 변경을 적용하지 않았습니다');
  state=draft;onChange(updated);return result??true;
 }
 function progress(s){
  const paused=blocking(s);
  const next=[...eventDefs.values()].filter(e=>{
   const r=s.runtime.events[e.id],c=choiceDefs.get(e.choice);
   return c&&c.progress!==false&&c.blocksTime!==false&&(r.status!=='completed'||e.every!==undefined);
  }).map(e=>({e,r:s.runtime.events[e.id]})).sort((a,b)=>a.r.nextAt-b.r.nextAt)[0];
  if(!next)return {value:0,remaining:null,waiting:paused,title:''};
  const total=Math.max(1,next.r.nextAt-s.runtime.progressStart),elapsed=s.runtime.turn-s.runtime.progressStart;
  return {value:next.r.nextAt<=s.runtime.turn?1:Math.min(1,Math.max(0,elapsed/total)),remaining:Math.max(0,next.r.nextAt-s.runtime.turn),waiting:paused,title:next.e.title};
 }
 function snapshot(s=state){
  const current=waiting(s)[0];
  let choice=null;
  if(current){
   const def=choiceDefs.get(current.choiceId);
   choice={...clone(def),...clone(current),options:def.options.map(o=>({...clone(o),available:E.matches(s.persona,o.when,s.runtime.turn)}))};
  }
  return {...clone(s),choice,progress:progress(s),reviewPending:!!s.runtime.awaitingContinuation};
 }
 function advance(turns=1){
  if(!Number.isSafeInteger(turns)||turns<0||turns>10000)throw new Error('진행 턴은 0~10000 정수');
  return transact(s=>{
   if(s.runtime.awaitingContinuation)return false;
   pump(s);
   for(let i=0;i<turns&&!blocking(s);i++){
    s.runtime.turn++;periodic(s);pump(s);
   }
  });
 }
 function resolve(token,optionId){
  return transact(s=>{
   const r=s.runtime.choices[token];
   if(!r||r.status!=='waiting')return false;
   const def=choiceDefs.get(r.choiceId),option=def.options.find(o=>o.id===optionId);
   if(!option)throw new Error('등록되지 않은 선택지: '+optionId);
   if(!E.matches(s.persona,option.when,s.runtime.turn))throw new Error('선택 조건을 충족하지 않음');
   r.status='confirmed';r.optionId=optionId;
   settlement(s,`choice:${token}`,option.result||{},'choice:'+r.choiceId);
   r.status='settled';
   delete s.runtime.events[r.eventId].waitingToken;
   finish(s,r.eventId);r.status='closed';r.closedAt=s.runtime.turn;
   if(def.progress!==false&&def.blocksTime!==false)s.runtime.progressStart=s.runtime.turn;
   if(pauseAfterChoice)s.runtime.awaitingContinuation=true;
   else pump(s);
  });
 }
 function resume(){
  return transact(s=>{
   if(!s.runtime.awaitingContinuation)return false;
   s.runtime.awaitingContinuation=false;
   pump(s);
  });
 }
 return Object.freeze({snapshot,advance,resolve,resume,apply:(id,result)=>{
  if(typeof id!=='string'||!id.trim())throw new Error('정산 ID 필요');
  return transact(s=>settlement(s,'external:'+id,result,'external:'+id));
 }});
}
global.GukminTimeline=Object.freeze({create,eventKinds:EVENT_KINDS});
})(window);
