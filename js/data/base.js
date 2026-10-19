/* Immutable static game catalogue. No random generation or runtime state. */
(function(global){
'use strict';
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
  stress:{label:'스트레스',type:'progress',tone:'negative',icon:'pulse',min:0,max:100},
  health:{label:'건강',type:'progress',tone:'positive',icon:'heart',min:0,max:100},
  money:{label:'재산',type:'currency',icon:'savings'},
  allowance:{label:'용돈',type:'currency',icon:'coin'},
  income:{label:'수입',type:'currency',icon:'coin'},
  relations:{label:'관계',type:'progress',icon:'users',min:0,max:100},
  study:{label:'학업 역량',type:'progress',icon:'book',min:0,max:100},
  schoolScore:{label:'내신',type:'progress',icon:'school',gradeSystem:'five',min:0,max:100},
  exam:{label:'모의고사',type:'progress',icon:'chart',gradeSystem:'nine',min:0,max:100},
  support:{label:'지지도',type:'progress',icon:'flag'},
  awareness:{label:'인지도',type:'progress',icon:'sparkle'}
};
// This is a content-facing progression map, not a clock or a legal-age rule.
// The college/adult overlap and the circumstances of each move remain story-owned.
const LIFE_STAGES = Object.freeze([
  {id:'infant',label:'출생·유년기',next:['elementary'],metrics:['stress','health','money']},
  {id:'elementary',label:'초등학생',next:['middle'],metrics:['stress','health','money','allowance','relations']},
  {id:'middle',label:'중학생',next:['high'],metrics:['stress','health','money','allowance','relations','schoolScore']},
  {id:'high',label:'고등학생',next:['university','adult'],metrics:['stress','health','money','allowance','relations','schoolScore','exam']},
  {id:'university',label:'대학생',next:['adult'],metrics:['stress','health','money','income','relations','support','awareness']},
  {id:'adult',label:'사회생활',next:['political'],metrics:['stress','health','money','income','support','awareness']},
  {id:'political',label:'정치활동',next:['adult'],metrics:['stress','health','money','income','support','awareness']}
].map(stage=>Object.freeze({...stage,next:Object.freeze(stage.next),metrics:Object.freeze(stage.metrics)})));
const BIRTH_DEFAULTS = Object.freeze({
  age:0,phase:'infant',job:'아기',traits:Object.freeze([]),
  // Values are placeholders from the existing UI, NOT balanced game probabilities.
  stats:Object.freeze({
    stress:0,health:100,money:0,allowance:null,relations:null,study:null,
    schoolScore:null,exam:null,income:null,support:null,awareness:null
  })
});
const WEALTH_TIERS=[
 {id:'soil',name:'흙수저',weight:34,allowance:2000,relations:45,icon:'home'},
 {id:'bronze',name:'동수저',weight:31,allowance:6000,relations:48,icon:'home'},
 {id:'silver',name:'은수저',weight:22,allowance:12000,relations:50,icon:'home'},
 {id:'gold',name:'금수저',weight:10,allowance:25000,relations:52,icon:'home'},
 {id:'diamond',name:'다이아수저',weight:3,allowance:45000,relations:55,icon:'sparkle'}
];
// Narrative starting-state modifiers, NOT real demographic statistics.
const REGION_PRESETS={
 '신도시':{relations:-2},'농촌':{relations:2},'섬':{relations:1},
 '상업':{relations:1},'학군지':{relations:1}
};
const TRAIT_DEFS = {
 '흙수저':{icon:'home',tier:'soil',description:'경제적 지원이 제한적인 출생 배경'},
 '동수저':{icon:'home',tier:'bronze',description:'평범한 경제적 출생 배경'},
 '은수저':{icon:'home',tier:'silver',description:'일정한 경제적 지원이 가능한 출생 배경'},
 '금수저':{icon:'home',tier:'gold',description:'경제적으로 넉넉한 출생 배경'},
 '다이아수저':{icon:'sparkle',tier:'diamond',description:'매우 풍족한 경제적 지원을 받는 출생 배경'},
  '저축습관':{icon:'savings',description:'저축을 실제로 실행할 때 남는 돈이 늘어난다.',modifiers:[{tags:['save'],stats:{money:{add:1000}}}]},
  '인내심':{icon:'hourglass',description:'시험 준비의 부담을 조금 덜어 준다.',modifiers:[{tags:['assessment'],stats:{stress:{multiply:.75}}}]},
  '꼼꼼함':{icon:'check',description:'시험에서 검산을 통해 실수를 줄인다.',modifiers:[{tags:['assessment'],stats:{exam:{add:2},schoolScore:{add:2}}}]},
  '리더십':{icon:'flag',description:'실제 협업 선택에서 신뢰를 얻는 데 도움이 된다.',modifiers:[{tags:['team'],stats:{relations:{add:1}}}]},
  '언변':{icon:'speech',description:'면접·토론·연설에 영향을 주는 특성'},
  '친화력':{icon:'users',description:'친구들과 협력할 때 작은 관계 보너스.',modifiers:[{tags:['team'],stats:{relations:{add:1}}}]},
  '미루는 습관':{icon:'clock',negative:true,description:'준비와 일정 관리에 불리한 특성'},
  '호기심':{icon:'sparkle',description:'새로운 물건과 상황을 먼저 탐색하는 성격'},
  '낯가림':{icon:'home',description:'처음 보는 사람 앞에서 조심스러워하는 성격'},
  '고집':{icon:'flag',description:'마음먹은 일을 끝까지 시도하는 성격'},
  '배려심':{icon:'heart',description:'타인의 감정과 순서를 신경 쓰는 성격'},
  '느긋함':{icon:'hourglass',description:'서두르기보다 시간을 두고 행동하는 성격'},
  '관심-문과':{hidden:true,description:'인문·언어 분야의 탐색 기록'},
  '관심-이과':{hidden:true,description:'과학·수학 분야의 탐색 기록'},
  '관심-예체능':{hidden:true,description:'예술·공연 분야의 탐색 기록'},
  '관심-체육':{hidden:true,description:'운동·체육 분야의 탐색 기록'},
  '문과':{icon:'graduation',aptitude:'humanities',description:'읽기·토론·표현 활동에 관심을 발전시켰다.',modifiers:[{tags:['humanities'],stats:{schoolScore:{add:2}}}]},
  '이과':{icon:'graduation',aptitude:'science',description:'과학·수학 탐구에 관심을 발전시켰다.',modifiers:[{tags:['science'],stats:{schoolScore:{add:2},study:{add:1}}}]},
  '예체능':{icon:'graduation',aptitude:'arts',description:'예술·음악·공연 활동에 관심을 발전시켰다.',modifiers:[{tags:['arts'],stats:{relations:{add:2}}}]},
  '체육':{icon:'graduation',aptitude:'sports',description:'운동과 체육 활동에 관심을 발전시켰다.',modifiers:[{tags:['sports'],stats:{health:{add:2}}}]}
};

const freezeCopy=value=>{
 if(value&&typeof value==='object'){Object.values(value).forEach(freezeCopy);Object.freeze(value);}
 return value;
};
global.GukminData=freezeCopy({
 names:NAMES,homes:HOMES,schoolKinds:SCHOOL_KINDS,
 metrics:METRIC_DEFS,stages:LIFE_STAGES,birthDefaults:BIRTH_DEFAULTS,traits:TRAIT_DEFS,
 wealthTiers:WEALTH_TIERS,regionPresets:REGION_PRESETS
});
})(window);
