/* Shared persona data for all three screens.
 * UI foundation only: no age advancement, choice effects or ending rules.
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
const METRIC_DEFS = Object.freeze({
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
});
const PHASE_METRICS = Object.freeze({
  infant:['stress','health','money'],
  elementary:['stress','health','money','allowance','relations'],
  middle:['stress','health','money','allowance','relations','study'],
  high:['stress','health','money','allowance','relations','schoolScore','exam'],
  university:['stress','health','money','income','relations','support','awareness'],
  adult:['stress','health','money','income','support','awareness'],
  political:['stress','health','money','income','support','awareness']
});
const TRAIT_DEFS = Object.freeze({
  '저축습관':{icon:'savings',description:'돈을 모으는 행동에 영향을 주는 특성'},
  '인내심':{icon:'hourglass',description:'장기간의 노력과 부담에 영향을 주는 특성'},
  '꼼꼼함':{icon:'check',description:'서류와 학습의 세부 판정에 영향을 주는 특성'},
  '리더십':{icon:'flag',description:'조직을 이끄는 선택에 영향을 주는 특성'},
  '언변':{icon:'speech',description:'면접·토론·연설에 영향을 주는 특성'},
  '친화력':{icon:'users',description:'다른 인물과의 관계 선택에 영향을 주는 특성'},
  '미루는 습관':{icon:'clock',negative:true,description:'준비와 일정 관리에 불리한 특성'}
});
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
function generate() {
  const home=pick(HOMES);
  return {
    version:1,
    name:pick(NAMES),age:0,phase:'infant',job:'아기',party:'무소속',partyIcon:'◇',partyColor:'#677181',number:null,portraitSrc:null,
    family:home.name,birthplace:home.place,description:home.description,
    school:{elementary:null,middle:null,high:null,uni:null},schoolHistory:[],
    roles:[],traits:[],
    stats:{stress:0,health:100,money:0,allowance:null,relations:null,study:null,schoolScore:null,exam:null,income:null,support:null,awareness:null},
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
  return PHASE_METRICS[phaseOf(s)].map(id=>({
    id,...METRIC_DEFS[id],value:s.stats?.[id] ?? null
  }));
}
function schoolsOf(s) {
  const records=Array.isArray(s.schoolHistory)?s.schoolHistory.filter(item=>item&&typeof item.name==='string'&&item.name.trim()):[];
  if(records.length)return records;
  return SCHOOL_KINDS.flatMap(({id})=>{
    const entry=s.school?.[id];
    if(!entry)return [];
    if(typeof entry==='string')return [{kind:id,name:entry,status:'graduated'}];
    return entry.name?[{kind:id,...entry}]:[];
  });
}
global.GukminPlayer=Object.freeze({
  storageKey:STORAGE_KEY,generate,valid,save,load,ensure,phaseOf,activeMetrics,schoolsOf,
  schoolKinds:SCHOOL_KINDS,traitDefinitions:TRAIT_DEFS
});
})(window);
