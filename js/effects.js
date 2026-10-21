/* Pure result settlement. No DOM, storage or game clock ownership. */
(function(global){
'use strict';
const P=global.GukminPlayer;
const clone=value=>JSON.parse(JSON.stringify(value));
function keys(value,allowed,label){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(label+' 데이터 오류');
 for(const key of Object.keys(value))if(!allowed.includes(key))throw new Error(label+' 알 수 없는 필드: '+key);
}
function finite(value){if(!Number.isFinite(value))throw new Error('스탯은 유한한 숫자여야 함');return value;}
function bounded(value,def){
 finite(value);
 if(def.min!==undefined)value=Math.max(def.min,value);
 if(def.max!==undefined)value=Math.min(def.max,value);
 return def.type==='progress'&&def.max===25?Math.round(value):value;
}
function matches(persona,condition={},turn=0){
 keys(condition,['all','any','not','traits','withoutTraits','stats','attributes','age','phase','turn'],'조건');
 if(condition.all&&!condition.all.every(c=>matches(persona,c,turn)))return false;
 if(condition.any&&!condition.any.some(c=>matches(persona,c,turn)))return false;
 if(condition.not&&matches(persona,condition.not,turn))return false;
 for(const id of condition.traits||[]){P.traitDefinition(id);if(!P.hasTrait(persona,id))return false;}
 for(const id of condition.withoutTraits||[]){P.traitDefinition(id);if(P.hasTrait(persona,id))return false;}
 function compare(value,rule){
  if(typeof rule==='number')return value===finite(rule);
  keys(rule,['gte','lte','eq'],'수치 조건');
  return Object.entries(rule).every(([op,n])=>{finite(n);return Number.isFinite(value)&&(op==='gte'?value>=n:op==='lte'?value<=n:value===n);});
 }
 for(const [id,rule] of Object.entries(condition.stats||{})){P.metricDefinition(id);if(!compare(persona.stats[id],rule))return false;}
 for(const [id,value] of Object.entries(condition.attributes||{})){
  const def=P.attributeDefinition(id);if((def.custom?persona.attributes?.[id]:persona[id])!==value)return false;
 }
 if(condition.age!==undefined&&!compare(persona.age,condition.age))return false;
 if(condition.turn!==undefined&&!compare(turn,condition.turn))return false;
 if(condition.phase!==undefined&&P.phaseOf(persona)!==condition.phase)return false;
 return true;
}
function apply(persona,result={},context={}){
 keys(result,['effects','history','tags','conditional','assessment','highEntry','retryYear','admissionDecision'],'결과');
 let prepared=clone(result);
 if(result.admissionDecision)prepared={...prepared,...global.GukminAdmissions.decision(persona,result.admissionDecision)};
 if(result.retryYear)prepared=global.GukminAdmissions.retry(persona,prepared);
 if(result.highEntry){
  prepared.effects??={};prepared.effects.activate={...prepared.effects.activate,...global.GukminGrades.highEntry(persona,result.highEntry.track)};
  if(persona.attributes?.admissionResearch==='paid'&&!persona.attributes?.counselingUsed){prepared.effects.stats={...prepared.effects.stats,stress:(prepared.effects.stats?.stress||0)-1};prepared.effects.attributes={...prepared.effects.attributes,counselingUsed:true};}
 }
 if(result.assessment){const calculation=global.GukminGrades.assessment(persona,result.assessment);prepared.effects??={};prepared.effects.stats={...prepared.effects.stats,...calculation.stats};}
 const s=P.withoutHealth(persona),effects=prepared.effects||{},turn=context.turn??0;
 keys(effects,['activate','stats','attributes','schools','traits','deactivate'],'효과');
 s.metricActive??={};s.metricHistory??=[];s.attributeHistory??=[];s.traitSince??={};s.attributes??={};
 for(const [id,value] of Object.entries(effects.activate||{})){
  const def=P.metricDefinition(id);s.metricActive[id]=true;s.stats[id]=bounded(value,def);
 }
 const deltas={...effects.stats};
 for(const [id,value] of Object.entries(deltas)){P.metricDefinition(id);finite(value);}
 const tags=result.tags||context.tags||[];
 // Old waiting examination scripts retain their original modifier contract.
 if(tags.includes('assessment')&&!result.assessment){if(P.hasTrait(persona,'인내심')&&deltas.stress!==undefined)deltas.stress*=.75;if(P.hasTrait(persona,'꼼꼼함'))for(const id of ['schoolScore','exam'])if(deltas[id]!==undefined)deltas[id]+=1;}
 // Only traits held before this result modify its base deltas, in acquisition order.
 for(const trait of persona.traits){
  const name=typeof trait==='string'?trait:trait.name,def=P.traitDefinition(name);
  for(const modifier of def.modifiers||[]){
   if(modifier.tags&&!modifier.tags.some(tag=>tags.includes(tag)))continue;
   if(!matches(persona,modifier.when,turn))continue;
   for(const [id,operation] of Object.entries(modifier.stats||{})){
    P.metricDefinition(id);keys(operation,['multiply','add'],'특성 수정');
    if(Object.hasOwn(deltas,id))deltas[id]=finite(deltas[id]*finite(operation.multiply??1)+finite(operation.add??0));
   }
  }
 }
 for(const [id,delta] of Object.entries(deltas)){
  if((id==='exam'&&persona.attributes?.csatSubmitted&&!prepared.retryYear&&!context.finalizing)||(id==='schoolScore'&&persona.attributes?.highFinalSubmitted))continue;
  s.stats[id]=bounded(finite(s.stats[id]??0)+delta,P.metricDefinition(id));
 }
 for(const [id,value] of Object.entries(effects.attributes||{})){
  const def=P.attributeDefinition(id),old=def.custom?s.attributes[id]:s[id];
  if(id==='age'&&(!Number.isFinite(value)||value<0))throw new Error('나이 오류');
  if(id==='roles'&&!Array.isArray(value))throw new Error('역할 오류');
  if(id==='phase'&&!P.lifeStages.some(stage=>stage.id===value))throw new Error('생애 단계 오류');
  if(def.custom&&value!==null&&!(typeof value==='string'||typeof value==='boolean'||Number.isFinite(value)))throw new Error('속성 값 오류: '+id);
  if(!def.custom&&!['age','roles','number'].includes(id)&&value!==null&&typeof value!=='string')throw new Error('속성 값 오류: '+id);
  if(id==='partyColor'&&!/^#[0-9a-f]{6}$/i.test(value))throw new Error('정당색 오류');
  if(def.custom)s.attributes[id]=clone(value);else s[id]=clone(value);
  s.attributeHistory.push({id,previous:old??null,value:clone(value),turn,age:s.age,phase:P.phaseOf(s)});
 }
 if(effects.schools){
  // Import old-format school records before editing, preserving every prior entry.
  s.schoolHistory=clone(P.schoolsOf(s));
  for(const raw of effects.schools){
   keys(raw,['id','kind','name','status'],'학교');
   // Graduate the currently enrolled school when the life story doesn't know its name in advance.
   const eligible=!raw.id&&!raw.name&&raw.status==='graduated'
     ?s.schoolHistory.filter(r=>r.kind===raw.kind&&r.status==='enrolled'):[];
   if(!raw.id&&!raw.name&&eligible.length!==1)throw new Error('졸업 학교가 모호함');
   const record=eligible.length?{...eligible[0],status:'graduated'}:raw;
   if(!record.id||!record.name||!P.schoolKinds.some(k=>k.id===record.kind)||!['enrolled','graduated','dropout'].includes(record.status))throw new Error('학교 기록 오류');
   const legacy=s.schoolHistory.filter(r=>!r.id&&r.kind===record.kind&&r.name===record.name);
   if(legacy.length>1)throw new Error('학교 이력이 모호함: '+record.name);
   const old=s.schoolHistory.find(r=>r.id===record.id)||legacy[0];
   if(old&&(old.kind!==record.kind||old.name!==record.name))throw new Error('학교 이력의 정체성을 덮어쓸 수 없음');
   if(old&&old.status==='graduated'&&record.status!=='graduated')throw new Error('졸업 이력을 덮어쓸 수 없음');
   if(old)Object.assign(old,record);else s.schoolHistory.push({...record});
   s.attributeHistory.push({id:'school',...record,turn,age:s.age,phase:P.phaseOf(s)});
  }
 }
 keys(effects.traits||{},['add','remove'],'특성');
 for(const id of [...effects.traits?.add||[],...effects.traits?.remove||[]])P.traitDefinition(id);
 for(const id of effects.traits?.remove||[]){s.traits=s.traits.filter(t=>(typeof t==='string'?t:t.name)!==id);delete s.traitSince[id];}
 for(const id of effects.traits?.add||[])if(!P.hasTrait(s,id)){s.traits.push(id);s.traitSince[id]=turn;}
 for(const id of effects.deactivate||[]){
  P.metricDefinition(id);
  if(s.metricActive[id]!==false)s.metricHistory.push({id,value:s.stats[id]??null,turn,age:s.age,phase:P.phaseOf(s)});
  s.metricActive[id]=false;
 }
 const histories=prepared.history?(Array.isArray(prepared.history)?prepared.history:[prepared.history]):[];
 for(const h of histories){
  keys(h,['title','detail','importance','display'],'기록');
  if(typeof h.title!=='string')throw new Error('기록 제목 오류');
  s.history.push({...h,detail:h.detail||'',turn,age:s.age,phase:P.phaseOf(s),source:context.source||null});
 }
 let settled=s;
 for(const branch of result.conditional||[]){
  keys(branch,['when','result','before'],'조건부 결과');
  if(matches(branch.before?persona:settled,branch.when,turn))settled=apply(settled,branch.result,{...context,finalizing:!!result.effects?.attributes?.csatSubmitted||context.finalizing});
 }
 return settled;
}
global.GukminEffects=Object.freeze({apply,matches});
})(window);
