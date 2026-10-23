/* Shared persona data for all three screens.
 * Definitions and save compatibility; effects and turns live in their own modules.
 */
(function (global) {
'use strict';
const STORAGE_KEY = 'callOfgukmin__ui__v1';
const DATA=global.GukminData;
if(!DATA)throw new Error('기본 데이터셋을 먼저 로드해야 합니다');
const NAMES=DATA.names,HOMES=DATA.homes,SCHOOL_KINDS=DATA.schoolKinds;
const METRIC_DEFS={...DATA.metrics};
const LIFE_STAGES=DATA.stages;
const PHASE_METRICS=Object.freeze(Object.fromEntries(LIFE_STAGES.map(stage=>[stage.id,stage.metrics])));
const BIRTH_DEFAULTS=DATA.birthDefaults;
function phaseDefinition(id){
 const stage=LIFE_STAGES.find(item=>item.id===id);
 if(!stage)throw new Error('등록되지 않은 생애 단계: '+id);
 return stage;
}
function nextPhases(id){return [...phaseDefinition(id).next];}
const TRAIT_DEFS={...DATA.traits};
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
function weightedPick(tiers){
 const sum=tiers.reduce((acc,tier)=>acc+tier.weight,0);
 let draw=Math.random()*sum;
 return tiers.find(tier=>(draw-=tier.weight)<0)||tiers.at(-1);
}
function birthContext(){
 const region=pick(global.GukminRegions.all),tier=weightedPick(DATA.wealthTiers);
 // Occupation and region stay independent. Explicit economic descriptions must agree.
 const home=pick(HOMES.filter(home=>
  home.name==='형편이 어려운 가정'?['soil','bronze'].includes(tier.id):
  home.name==='경제적으로 여유 있는 가정'?['gold','diamond'].includes(tier.id):true));
 const stats={...BIRTH_DEFAULTS.stats,allowance:tier.allowance,relations:tier.relations};
 for(const tag of region.tags){
  for(const [id,delta] of Object.entries(DATA.regionPresets[tag]||{}))stats[id]+=delta;
 }
 return {home,region,tier,stats};
}
function genderOf(s){
 if(['male','female'].includes(s.gender))return s.gender;
 for(const [gender,names] of Object.entries(DATA.namesByGender))if(names.includes(s.name))return gender;
 if(['male','female'].includes(s.portraitVariant))return s.portraitVariant;
 const seed=String(s.admissionSeed||s.createdAt||s.name||'');let hash=0;for(const ch of seed)hash=(Math.imul(hash,31)+ch.charCodeAt(0))|0;
 return (hash>>>0)%2?'female':'male';
}
function randomName(gender){return pick(DATA.namesByGender[gender]||NAMES);}
function upgradeMental(persona){
 const s=withoutHealth(persona);
 if(s.mentalModel!==2){
  s.stats.illness=s.attributes?.lifeEndReason==='정신병 한계'||s.attributes?.retryEndReason==='정신병 한계'?5:0;
  s.mentalModel=2;
 }
 s.stats.illness??=0;s.gender=genderOf(s);s.portraitVariant=s.gender;
 return s;
}
function generate() {
  const {home,region,tier,stats}=birthContext(),gender=Math.random()<.5?'male':'female';
  return {
    version:1,ageSystem:'korean',statScale:25,mentalModel:2,gender,portraitVariant:gender,
    name:randomName(gender),age:BIRTH_DEFAULTS.age,phase:BIRTH_DEFAULTS.phase,job:BIRTH_DEFAULTS.job,party:'무소속',partyIcon:'◇',partyColor:'#677181',number:null,portraitSrc:null,
    family:home.name,birthplace:region.label,birthplaceId:region.id,regionTags:[...region.tags],familyTier:tier.id,description:home.description,
    school:{elementary:null,middle:null,high:null,uni:null},schoolHistory:[],
    roles:[],traits:[tier.name,...BIRTH_DEFAULTS.traits],
    stats,
    history:[{age:1,title:'당신이 태어났다',detail:region.label+'에서 새로운 삶이 시작되었다.'},{age:1,title:'출생 배경',detail:home.description}],
    admissionSeed:Math.random().toString(36).slice(2),createdAt:new Date().toISOString()
  };
}
function valid(s) {
  return !!(s&&s.version===1&&typeof s.name==='string'&&typeof s.age==='number'&&
    typeof s.family==='string'&&s.school&&typeof s.school==='object'&&s.stats&&
    typeof s.stats==='object'&&Array.isArray(s.traits)&&Array.isArray(s.history));
}
function withoutHealth(value){
 if(Array.isArray(value))return value.filter(x=>x!=='health'&&x?.id!=='health').map(withoutHealth);
 if(!value||typeof value!=='object')return value;
 const copy={};
 for(const [key,item] of Object.entries(value)){
  if(key==='health')continue;
  // A retired health gate must not become an unconditional legacy penalty.
  copy[key]=key==='conditional'?item.filter(b=>!JSON.stringify(b.when||{}).includes('"health"')).map(withoutHealth):withoutHealth(item);
 }
 return copy;
}
const scaledIds=new Set(['stress','relations','study','schoolScore','exam','support','awareness']);
const quarter=(n,delta=false)=>!Number.isFinite(n)?n:delta&&n!==0?Math.sign(n)*Math.max(1,Math.round(Math.abs(n)/4)):Math.round(n/4);
function scaleRules(value,parent=''){
 if(Array.isArray(value))return value.map(v=>scaleRules(v,parent));
 if(!value||typeof value!=='object')return value;
 const copy={};
 for(const [key,item] of Object.entries(value)){
  if((parent==='stats'||parent==='activate')&&scaledIds.has(key)){
   copy[key]=typeof item==='number'?quarter(item,parent==='activate'?false:true):Object.fromEntries(Object.entries(item).map(([op,n])=>[op,['gte','lte','eq','add'].includes(op)?quarter(n,op==='add'):n]));
  }else if(['minScore','minStudy','target','minimum'].includes(key)&&typeof item==='number')copy[key]=quarter(item);
  else copy[key]=scaleRules(item,key);
 }
 return copy;
}
// Shift the old zero-at-birth convention once, including archived snapshots and frozen choices.
function ageRules(value){
 if(Array.isArray(value))return value.map(ageRules);
 if(!value||typeof value!=='object')return value;
 const out={};
 for(const [key,item] of Object.entries(value)){
  if(key==='age'&&typeof item==='number')out[key]=item<30?item+1:item;
  else if(key==='age'&&item&&typeof item==='object')out[key]=Object.fromEntries(Object.entries(item).map(([op,n])=>[op,typeof n==='number'&&n<30?n+1:n]));
  else if(key==='title'&&typeof item==='string')out[key]=item.replace(/^(\d+)(세|살)(?=\s|$)/,(_,n,unit)=>(Number(n)<30?Number(n)+1:Number(n))+unit).replace('두 살이 되었다','세 살이 되었다').replace('네 살이 되었다','다섯 살이 되었다').replace('다섯 살의 일상','여섯 살의 일상');
  else out[key]=ageRules(item);
 }
 return out;
}
function upgradeAge(persona){
 if(persona.ageSystem==='korean')return persona;
 const copy=ageRules(persona);copy.ageSystem='korean';
 // Existing endings remain ended, and the thirty-year boundary stays thirty.
 if(persona.age>=30&&(persona.attributes?.lifeEndReason||persona.attributes?.retryEndReason))copy.age=persona.age;
 return copy;
}
function upgradeScale(persona){
 const copy=upgradeAge(withoutHealth(persona));if(copy.statScale===25)return copy;
 // Only standard bounded metrics change units; currency, time and custom stats do not.
 function walk(value,key=''){
  if(Array.isArray(value))return value.map(v=>walk(v,key));
  if(!value||typeof value!=='object')return value;
  const out={};
  for(const [k,v] of Object.entries(value)){
   if(k==='script')out[k]=scaleRules(v);
   else if(k==='stats')out[k]=Object.fromEntries(Object.entries(v).map(([id,n])=>[id,scaledIds.has(id)?quarter(n):n]));
   else if(k==='value'&&scaledIds.has(value.id))out[k]=quarter(v);
   else out[k]=walk(v,k);
  }
  return out;
 }
 const migrated=walk(copy);migrated.statScale=25;return migrated;
}
function normalize(s) {
 s=upgradeMental(upgradeScale(s));
  // Compatible with the previous UI-only save. A family is an attribute, not a buff.
  const copy={...s,stats:{...s.stats},school:{...s.school}};
  copy.traits=s.traits.filter(t=>typeof t==='string'?t!==s.family:!!(t&&typeof t==='object'&&t.name!==s.family));
  copy.schoolHistory=Array.isArray(s.schoolHistory)?s.schoolHistory:[];
  copy.roles=Array.isArray(s.roles)?s.roles:[];
  copy.regionTags=Array.isArray(s.regionTags)?s.regionTags:[];
  if(!PHASE_METRICS[copy.phase])delete copy.phase;
  if(copy.attributes?.admissionAttempts>1&&['N수 준비','고등학생','고교 졸업'].includes(copy.job))copy.job='N수생';
  return copy;
}
function load() {
  try {const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return valid(parsed)?normalize(parsed):null;}
  catch(error){return null;}
}
function save(persona) {
  if(!valid(persona))throw new TypeError('Invalid persona');
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(upgradeMental(upgradeScale(persona))));return true;}
  catch(error){return false;}
}
function ensure() {
  const existing=load();
  if(existing)return existing;
  const created=generate();save(created);return created;
}
function phaseOf(s) {
  if(PHASE_METRICS[s.phase])return s.phase;
  if(s.age<DATA.schoolAges.elementary)return 'infant';
  if(s.age<DATA.schoolAges.middle)return 'elementary';
  if(s.age<DATA.schoolAges.high)return 'middle';
  if(s.age<DATA.schoolAges.graduation)return 'high';
  return 'adult';
}
function activeMetrics(s) {
  const ids=new Set(PHASE_METRICS[phaseOf(s)]);
  for(const [id,active] of Object.entries(s.metricActive||{})){
    if(id==='health')continue;
    metricDefinition(id);
    if(active)ids.add(id);else ids.delete(id);
  }
  return [...ids].map(id=>({id,...metricDefinition(id,s),value:s.stats?.[id]??null}));
}
const ATTRIBUTE_DEFS={
 pressureGuideSeen:{label:'압박 안내 확인',custom:true,hidden:true},pressureCriticalSeen:{label:'정신병 4 경고 확인',custom:true,hidden:true},pressureNoticeBand:{label:'경고 확인 단계',custom:true,hidden:true},pressureAdviceCount:{label:'상태 안내 횟수',custom:true,hidden:true},
 gender:{label:'성별',hidden:true},portraitVariant:{label:'초상',hidden:true},
 name:{label:'이름'},age:{label:'나이'},phase:{label:'생애 단계'},birthplace:{label:'출생지',icon:'pin'},
 family:{label:'집안',icon:'home'},familyTier:{label:'부모 수저 등급',hidden:true},job:{label:'직업',icon:'flag'},party:{label:'정당',icon:'flag'},
 partyIcon:{label:'정당 아이콘',hidden:true},partyColor:{label:'정당색',hidden:true},
 number:{label:'후보 기호',hidden:true},portraitSrc:{label:'인물 이미지',hidden:true},
 description:{label:'배경',hidden:true},roles:{label:'역할',icon:'flag'}
};
function validId(id){
 if(typeof id!=='string'||!id.trim()||['__proto__','constructor','prototype'].includes(id))throw new Error('잘못된 정의 ID: '+id);
}
function definition(table,id,kind){
 if(!Object.hasOwn(table,id))throw new Error('등록되지 않은 '+kind+': '+id);
 return table[id];
}
const registered=new WeakMap();
function register(table,id,def){
 validId(id);
 const copy=JSON.parse(JSON.stringify(def));
 if(!registered.has(table))registered.set(table,new Set());
 const explicit=registered.get(table);
 if(explicit.has(id)&&JSON.stringify(table[id])!==JSON.stringify(copy))throw new Error('정의 중복: '+id);
 table[id]=Object.freeze(copy);explicit.add(id);
}
function registerMetric(id,def){
 def={...(Object.hasOwn(METRIC_DEFS,id)?METRIC_DEFS[id]:{}),...def};
 if(!def||typeof def.label!=='string'||typeof def.type!=='string')throw new Error('스탯 정의 오류');
 for(const key of ['min','max'])if(def[key]!==undefined&&!Number.isFinite(def[key]))throw new Error('스탯 범위 오류');
 if(def.min!==undefined&&def.max!==undefined&&def.min>=def.max)throw new Error('스탯 범위 오류');
 register(METRIC_DEFS,id,def);
}
function registerTrait(id,def){
 def={...(Object.hasOwn(TRAIT_DEFS,id)?TRAIT_DEFS[id]:{}),...def};
 if(def?.periodic&&(!Number.isSafeInteger(def.periodic.every)||def.periodic.every<1))throw new Error('특성 주기 오류');
 register(TRAIT_DEFS,id,def||{});
}
function registerAttribute(id,def){
 if(Object.hasOwn(ATTRIBUTE_DEFS,id)&&!ATTRIBUTE_DEFS[id].custom)throw new Error('기본 속성 재정의 금지: '+id);
 if(!def?.label)throw new Error('속성 정의 오류');
 register(ATTRIBUTE_DEFS,id,{...def,custom:true});
}
function metricLabel(id,persona){return id==='relations'&&persona&&(persona.age>=20||['university','adult','political'].includes(phaseOf(persona)))?'인맥':definition(METRIC_DEFS,id,'스탯').label;}
function metricDefinition(id,persona){const def=definition(METRIC_DEFS,id,'스탯');return persona?{...def,label:metricLabel(id,persona)}:def;}
function traitDefinition(id){return definition(TRAIT_DEFS,id,'특성');}
function attributeDefinition(id){return definition(ATTRIBUTE_DEFS,id,'속성');}
function hasTrait(s,id){return s.traits.some(t=>(typeof t==='string'?t:t.name)===id);}

function schoolsOf(s) {
  const records=Array.isArray(s.schoolHistory)?s.schoolHistory.filter(item=>item&&typeof item.name==='string'&&item.name.trim()):[];
  const legacy=SCHOOL_KINDS.flatMap(({id})=>{
    const entry=s.school?.[id];
    if(!entry)return [];
    if(typeof entry==='string')return [{kind:id,name:entry,status:'graduated'}];
    return entry.name?[{kind:id,...entry}]:[];
  });
  return [...records,...legacy.filter(old=>!records.some(r=>r.kind===old.kind&&r.name===old.name))];
}
global.GukminPlayer=Object.freeze({
  storageKey:STORAGE_KEY,generate,valid,save,load,ensure,withoutHealth,ageRules,upgradeAge,upgradeScale,upgradeMental,genderOf,randomName,scaleRules,phaseOf,activeMetrics,schoolsOf,
  lifeStages:LIFE_STAGES,birthDefaults:BIRTH_DEFAULTS,phaseDefinition,nextPhases,
  schoolKinds:SCHOOL_KINDS,traitDefinitions:TRAIT_DEFS,attributeDefinitions:ATTRIBUTE_DEFS,
  birthContext,wealthTiers:DATA.wealthTiers,
  registerMetric,registerTrait,registerAttribute,metricLabel,metricDefinition,traitDefinition,attributeDefinition,hasTrait
});
})(window);
