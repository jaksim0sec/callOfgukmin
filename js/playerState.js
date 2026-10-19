/* Shared persona data for all three screens.
 * Definitions and save compatibility; effects and turns live in their own modules.
 */
(function (global) {
'use strict';
const STORAGE_KEY = 'callOfgukmin__ui__v1';
const NAMES = ['이루은','유승현','최승우','강민수','김병수','김병인','윤소율','박재윤'];
const HOMES = [
  {name:'자영업 가정',place:'경기도 수원',description:'집에서 장부와 손님 이야기를 들으며 자랐다.'},
  {name:'맞벌이 가정',place:'서울',description:'가족들은 매일 각자의 일정을 부지런히 소화했다.'},
  {name:'작은 식당집',place:'부산',description:'가게에서 다양한 사람들의 이야기를 듣게 될 것이다.'},
  {name:'경제적으로 여유 있는 가정',place:'대전',description:'진로 선택의 여유가 있지만 주변의 기대도 있다.'},
  {name:'형편이 어려운 가정',place:'광주',description:'집안 형편이 넉넉하지는 않다.'}
];
const SCHOOL_KINDS = [
  {id:'elementary',label:'초등학교'},
  {id:'middle',label:'중학교'},
  {id:'high',label:'고등학교'},
  {id:'uni',label:'대학교'}
];
const METRIC_DEFS = {
  stress:{label:'정신병',type:'progress',tone:'negative'},
  health:{label:'건강',type:'progress',tone:'positive'},
  money:{label:'재산',type:'currency'},
  allowance:{label:'용돈',type:'currency'},
  income:{label:'수입',type:'currency'},
  relations:{label:'관계',type:'progress'},
  study:{label:'성적',type:'progress'},
  schoolScore:{label:'내신',type:'progress'},
  exam:{label:'수능',type:'progress'},
  support:{label:'지지도',type:'progress'},
  awareness:{label:'인지도',type:'progress'}
};
// This is a content-facing progression map, not a clock or a legal-age rule.
// The college/adult overlap and the circumstances of each move remain story-owned.
const LIFE_STAGES = Object.freeze([
  {id:'infant',label:'출생·유년기',next:['elementary'],metrics:['stress','health','money']},
  {id:'elementary',label:'초등학생',next:['middle'],metrics:['stress','health','money','allowance','relations']},
  {id:'middle',label:'중학생',next:['high'],metrics:['stress','health','money','allowance','relations','study']},
  {id:'high',label:'고등학생',next:['university','adult'],metrics:['stress','health','money','allowance','relations','schoolScore','exam']},
  {id:'university',label:'대학생',next:['adult'],metrics:['stress','health','money','income','relations','support','awareness']},
  {id:'adult',label:'사회생활',next:['political'],metrics:['stress','health','money','income','support','awareness']},
  {id:'political',label:'정치활동',next:['adult'],metrics:['stress','health','money','income','support','awareness']}
].map(stage=>Object.freeze({...stage,next:Object.freeze(stage.next),metrics:Object.freeze(stage.metrics)})));
const PHASE_METRICS = Object.freeze(Object.fromEntries(LIFE_STAGES.map(stage=>[stage.id,stage.metrics])));
const BIRTH_DEFAULTS = Object.freeze({
  age:0,phase:'infant',job:'아기',traits:Object.freeze([]),
  // Values are placeholders from the existing UI, NOT balanced game probabilities.
  stats:Object.freeze({
    stress:0,health:100,money:0,allowance:null,relations:null,study:null,
    schoolScore:null,exam:null,income:null,support:null,awareness:null
  })
});
function phaseDefinition(id){
  const stage=LIFE_STAGES.find(item=>item.id===id);
  if(!stage)throw new Error('등록되지 않은 생애 단계: '+id);
  return stage;
}
function nextPhases(id){return [...phaseDefinition(id).next];}
const TRAIT_DEFS = {
  '저축습관':{icon:'savings',description:'돈을 모으는 행동에 영향을 주는 특성'},
  '인내심':{icon:'hourglass',description:'장기간의 노력과 부담에 영향을 주는 특성'},
  '꼼꼼함':{icon:'check',description:'서류와 학습의 세부 판정에 영향을 주는 특성'},
  '리더십':{icon:'flag',description:'조직을 이끄는 선택에 영향을 주는 특성'},
  '언변':{icon:'speech',description:'면접·토론·연설에 영향을 주는 특성'},
  '친화력':{icon:'users',description:'다른 인물과의 관계 선택에 영향을 주는 특성'},
  '미루는 습관':{icon:'clock',negative:true,description:'준비와 일정 관리에 불리한 특성'}
};
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
function generate() {
  const home=pick(HOMES);
  return {
    version:1,
    name:pick(NAMES),age:BIRTH_DEFAULTS.age,phase:BIRTH_DEFAULTS.phase,job:BIRTH_DEFAULTS.job,party:'무소속',partyIcon:'◇',partyColor:'#677181',number:null,portraitSrc:null,
    family:home.name,birthplace:home.place,description:home.description,
    school:{elementary:null,middle:null,high:null,uni:null},schoolHistory:[],
    roles:[],traits:[...BIRTH_DEFAULTS.traits],
    stats:{...BIRTH_DEFAULTS.stats},
    history:[{age:0,title:'당신이 태어났다',detail:home.place+'에서 새로운 삶이 시작되었다.'},{age:0,title:'출생 배경',detail:home.description}],
    createdAt:new Date().toISOString()
  };
}
function valid(s) {
  return !!(s&&s.version===1&&typeof s.name==='string'&&typeof s.age==='number'&&
    typeof s.family==='string'&&s.school&&typeof s.school==='object'&&s.stats&&
    typeof s.stats==='object'&&Array.isArray(s.traits)&&Array.isArray(s.history));
}
function normalize(s) {
  // Compatible with the previous UI-only save. A family is an attribute, not a buff.
  const copy={...s,stats:{...s.stats},school:{...s.school}};
  copy.traits=s.traits.filter(t=>typeof t==='string'?t!==s.family:!!(t&&typeof t==='object'&&t.name!==s.family));
  copy.schoolHistory=Array.isArray(s.schoolHistory)?s.schoolHistory:[];
  copy.roles=Array.isArray(s.roles)?s.roles:[];
  if(!PHASE_METRICS[copy.phase])delete copy.phase;
  return copy;
}
function load() {
  try {const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');return valid(parsed)?normalize(parsed):null;}
  catch(error){return null;}
}
function save(persona) {
  if(!valid(persona))throw new TypeError('Invalid persona');
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(persona));return true;}
  catch(error){return false;}
}
function ensure() {
  const existing=load();
  if(existing)return existing;
  const created=generate();save(created);return created;
}
function phaseOf(s) {
  if(PHASE_METRICS[s.phase])return s.phase;
  if(s.age<7)return 'infant';
  if(s.age<13)return 'elementary';
  if(s.age<16)return 'middle';
  if(s.age<19)return 'high';
  return 'adult';
}
function activeMetrics(s) {
  const ids=new Set(PHASE_METRICS[phaseOf(s)]);
  for(const [id,active] of Object.entries(s.metricActive||{})){
    metricDefinition(id);
    if(active)ids.add(id);else ids.delete(id);
  }
  return [...ids].map(id=>({id,...metricDefinition(id),value:s.stats?.[id]??null}));
}
const ATTRIBUTE_DEFS={
 name:{label:'이름'},age:{label:'나이'},phase:{label:'생애 단계'},birthplace:{label:'출생지',icon:'pin'},
 family:{label:'집안',icon:'home'},job:{label:'직업',icon:'flag'},party:{label:'정당',icon:'flag'},
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
function metricDefinition(id){return definition(METRIC_DEFS,id,'스탯');}
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
  storageKey:STORAGE_KEY,generate,valid,save,load,ensure,phaseOf,activeMetrics,schoolsOf,
  lifeStages:LIFE_STAGES,birthDefaults:BIRTH_DEFAULTS,phaseDefinition,nextPhases,
  schoolKinds:SCHOOL_KINDS,traitDefinitions:TRAIT_DEFS,attributeDefinitions:ATTRIBUTE_DEFS,
  registerMetric,registerTrait,registerAttribute,metricDefinition,traitDefinition,attributeDefinition,hasTrait
});
})(window);
