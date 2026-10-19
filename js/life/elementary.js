/* Elementary years: friends, free public resources, evolving learning habits. */
(function(global){
'use strict';
const S=global.GukminStory;
global.GukminDirector.register({
 id:'elementary',when:{phase:'elementary'},
 generate:persona=>{
  const region=persona.regionTags||[];
  const area=region.includes('어촌')?'갯벌 체험':region.includes('농촌')?'마을 행사':region.includes('산업')?'지역 진로 체험':'동네 문화 행사';
  const wealthy=['gold','diamond'].includes(persona.familyTier);
  return S.pack(
   S.notice('elementary:welcome',28,'처음 받은 교과서','읽기·쓰기·수학뿐 아니라 친구와 약속을 배우기 시작했다.',{activate:{study:45}}),
   S.selection('elementary:friends',29,'급식실에서 친구를 만났다','친구가 자리에 앉아도 되냐고 묻는다.',[
    {label:'함께 앉아 이야기를 나눈다',effects:{stats:{relations:6,stress:-2}},detail:'새로운 친구를 사귀었다.'},
    {label:'조용히 밥을 먹는다',effects:{stats:{health:2,relations:-1}},detail:'잠깐 혼자 있는 시간이 필요했다.'}
   ]),
   S.notice('elementary:age8',32,'초등학교 2학년','혼자 할 수 있는 일이 조금 더 늘었다.',{attributes:{age:8}}),
   S.notice('elementary:age9',36,'초등학교 3학년','수업과 숙제가 점점 다양해진다.',{attributes:{age:9}}),
   S.selection('elementary:afterschool',37,'방과 후 활동 신청','학교의 방과 후 안내장이 집에 도착했다.',[
    {id:'school',label:'학교 방과 후 프로그램을 신청한다',effects:{stats:{study:4,relations:2,stress:2}},detail:'학교 프로그램으로 꾸준히 배웠다.'},
    {id:'library',label:'도서관에서 스스로 배운다',effects:{stats:{study:3,stress:-2,relations:1}},detail:'가까운 도서관을 활용했다.'},
    {id:'academy',label:wealthy?'학원 수업을 추가한다':'유료 학원에 등록한다',when:{stats:{allowance:{gte:8000}}},effects:{stats:{study:6,stress:5,allowance:-3000}},detail:'유료 수업에서 학습 진도를 앞서갔다.'}
   ]),
   S.notice('elementary:age10',40,'초등학교 4학년',area+'에 대해 조사하는 수업이 열린다.',{attributes:{age:10}}),
   S.selection('elementary:project',41,'우리 동네 소개 발표','학급에서 지역 소개 발표를 준비한다.',[
    {label:'직접 자료를 찾아 발표한다',effects:{stats:{study:5,relations:2,stress:4}},detail:area+'을 직접 조사해 발표했다.'},
    {label:'친구와 역할을 나누어 준비한다',effects:{stats:{relations:5,study:3}},detail:'친구들과 함께 완성했다.'},
    {label:'간단한 포스터를 만든다',effects:{stats:{study:1,stress:-2}},detail:'부담 없이 과제를 마쳤다.'}
   ]),
   S.notice('elementary:age11',44,'초등학교 5학년','반 친구들과의 관계가 더 복잡해졌다.',{attributes:{age:11}}),
   S.selection('elementary:representative',45,'학급 대표를 뽑는 날','반장이 되어보라는 권유를 받았다.',[
    {label:'학급 대표에 도전한다',effects:{stats:{relations:3,stress:5},traits:{add:['리더십']}},detail:'작은 책임을 맡아 보았다.'},
    {label:'친구의 준비를 도와준다',effects:{stats:{relations:5,stress:1}},detail:'친구의 이야기를 함께 들어주었다.'},
    {label:'조용히 내 공부에 집중한다',effects:{stats:{study:4,relations:-1}},detail:'학업 습관을 지켰다.'}
   ]),
   S.notice('elementary:age12',48,'초등학교 6학년','중학교라는 새로운 환경이 가까워졌다.',{attributes:{age:12}}),
   S.selection('elementary:graduation',50,'졸업을 앞둔 봄','친구들이 졸업 후 바뀔 생활을 이야기한다.',[
    {label:'새 학교 정보와 시간표를 알아본다',effects:{stats:{study:4,stress:3}},detail:'변화를 준비했다.'},
    {label:'친구들과 추억을 남긴다',effects:{stats:{relations:5,stress:-3}},detail:'함께한 시간의 소중함을 느꼈다.'}
   ]),
   S.notice('elementary:middle-entry',52,'중학교 입학','초등학교를 졸업하고 새로운 학교생활을 시작한다.',{
    attributes:{age:13,phase:'middle',job:'중학생'},
    schools:[
     {id:'local-elementary',kind:'elementary',name:'거주지 배정 초등학교',status:'graduated'},
     {id:'local-middle',kind:'middle',name:'거주지 배정 중학교',status:'enrolled'}
    ]
   })
  );
 }
});
})(window);
