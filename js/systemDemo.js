/* Opt-in validation data; numbers, turns and layer slots are NOT life-game balance. */
(function(global){
'use strict';
const contentId='infrastructure-check-v1';
function definitions(){
 const P=global.GukminPlayer;
 P.registerMetric('demoFocus',{label:'검증 집중',type:'progress',min:0,max:10});
 P.registerTrait('검증용 저축습관',{
  icon:'savings',description:'검증 전용: 획득 후 2턴마다 재산 +100, 검증 수입 10% 증가',
  periodic:{every:2,result:{effects:{stats:{money:100}},history:{title:'검증 반복 효과',detail:'특성의 2턴 주기 효과로 재산이 100원 증가했다.',importance:'minor'}}},
  modifiers:[{tags:['income'],stats:{money:{multiply:1.1}}}]
 });
}
function config(){
 definitions();
 return {contentId,choices:[{
  id:'demo-saving',layer:'일상 선택',presentation:'inline',blocksTime:true,title:'검증용 용돈을 어떻게 쓸까?',body:'공통 결과 정산과 특성 획득을 확인하는 테스트 선택이다.',
  options:[{id:'save',label:'저축하며 습관 익히기',result:{effects:{stats:{money:10000},activate:{demoFocus:1},traits:{add:['검증용 저축습관']}},history:{title:'검증 선택 결과',detail:'재산 +10,000원, 검증 집중 활성화, 검증용 저축습관 획득.'}}},
   {id:'rest',label:'쉬면서 습관 익히기',result:{effects:{stats:{money:10000},activate:{demoFocus:1},traits:{add:['검증용 저축습관']}},history:{title:'검증 선택 결과',detail:'동일한 기반 기능을 검증한다.'}}}]
 }],events:[
  {id:'demo-notice',layer:'소식 이벤트',at:1,title:'검증 사건',history:{title:'검증 사건',detail:'선택 없는 사건도 공통 처리 후 인생 기록에 남는다.'}},
  {id:'demo-choice',layer:'일상 이벤트',at:2,title:'검증 선택',choice:'demo-saving'},
  {id:'demo-school',layer:'소식 이벤트',at:3,title:'검증 입학',result:{effects:{schools:[{id:'demo-middle',kind:'middle',name:'검증중학교',status:'enrolled'}],stats:{demoFocus:2}},history:{title:'검증 입학',detail:'재학 토큰을 강조하고 검증 집중을 2 올린다.'}}},
  {id:'demo-graduate',layer:'소식 이벤트',at:4,title:'검증 졸업',result:{effects:{schools:[{id:'demo-middle',kind:'middle',name:'검증중학교',status:'graduated'}],deactivate:['demoFocus']},history:{title:'검증 졸업',detail:'학력과 스탯 최종값을 보존하고 검증 집중 표시를 종료한다.'}}},
  {id:'demo-income',layer:'소식 이벤트',at:5,title:'검증 수입',result:{tags:['income'],effects:{stats:{money:1000}},history:{title:'검증 수입',detail:'보유 특성으로 기본 1,000원에 검증용 10% 수정 효과가 적용된다.'}}}
 ]};
}
global.GukminSystemDemo=Object.freeze({contentId,config});
})(window);
