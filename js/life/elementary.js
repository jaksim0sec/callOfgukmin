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
   S.selection('elementary:interest-exploration',34,'내가 재미있어하는 활동','학교에서 관심 있는 활동을 골라 체험해 보기로 했다.',[
    {label:'이야기를 쓰고 토론해 본다',effects:{traits:{add:['관심-문과']}},tags:['humanities']},
    {label:'과학 실험과 수학 퍼즐에 도전한다',effects:{traits:{add:['관심-이과']}},tags:['science']},
    {label:'그림과 음악을 만들어 본다',effects:{traits:{add:['관심-예체능']}},tags:['arts']},
    {label:'친구들과 운동을 해 본다',effects:{traits:{add:['관심-체육']}},tags:['sports']}
   ]),
   S.notice('elementary:age9',36,'초등학교 3학년','수업과 숙제가 점점 다양해진다.',{attributes:{age:9}}),
   {...S.selection('elementary:recover',30,'잠시 쉬어 갈 때','요즘 긴장과 피로가 쌓였다. 몸과 마음을 돌볼 방법을 정해 보자.',[
    {label:'가족이나 선생님과 이야기하고 쉬어 간다',effects:{stats:{stress:-25,health:6,relations:2}}},
    {label:'시간표를 줄이고 잠을 충분히 잔다',effects:{stats:{stress:-20,health:8,study:-2}}},
    {label:'친구와 가볍게 놀면서 기분을 전환한다',effects:{stats:{stress:-18,health:3,relations:4}}}
   ]),event:{...S.selection('elementary:recover',30,'','',[{label:'회복'}]).event,when:{turn:{eq:30},stats:{stress:{gte:65}}}}},
   S.selection('elementary:afterschool',37,'방과 후 활동 신청','학교의 방과 후 안내장이 집에 도착했다.',[
    {id:'school',label:'학교 방과 후 프로그램을 신청한다',effects:{stats:{study:4,relations:2,stress:2}},detail:'학교 프로그램으로 꾸준히 배웠다.'},
    {id:'library',label:'도서관에서 스스로 배운다',effects:{stats:{study:3,stress:-2,relations:1}},detail:'가까운 도서관을 활용했다.'},
    {id:'academy',label:wealthy?'학원 수업을 추가한다':'유료 학원에 등록한다',when:{stats:{money:{gte:3000}}},effects:{stats:{study:6,stress:5,money:-3000}},detail:'유료 수업에서 학습 진도를 앞서갔다.'}
   ]),
   S.notice('elementary:age10',40,'초등학교 4학년',area+'에 대해 조사하는 수업이 열린다.',{attributes:{age:10}}),
   S.selection('elementary:project',41,'우리 동네 소개 발표','학급에서 지역 소개 발표를 준비한다.',[
    {label:'직접 자료를 찾아 발표한다',effects:{stats:{study:5,relations:2,stress:4}},detail:area+'을 직접 조사해 발표했다.'},
    {label:'친구와 역할을 나누어 준비한다',effects:{stats:{relations:5,study:3}},detail:'친구들과 함께 완성했다.'},
    {label:'간단한 포스터를 만든다',effects:{stats:{study:1,stress:-2}},detail:'부담 없이 과제를 마쳤다.'}
   ]),
   S.selection('elementary:interest-followup',43,'관심 분야를 더 깊이 해볼 기회','학교 축제에서 한 분야의 활동을 다시 맡아 볼 수 있다.',[
    {label:'발표문을 쓰고 토론을 진행한다',tags:['humanities'],
     conditional:[{when:{traits:['관심-문과']},result:{effects:{traits:{add:['문과']}},history:{title:'문과 적성 발견',detail:'몇 차례 활동을 통해 표현 분야의 흥미가 자랐다.'}}}]},
    {label:'탐구 실험과 수학 문제를 함께 풀어 본다',tags:['science'],
     conditional:[{when:{traits:['관심-이과']},result:{effects:{traits:{add:['이과']}},history:{title:'이과 적성 발견',detail:'여러 탐구 경험이 과학 분야에 대한 관심으로 이어졌다.'}}}]},
    {label:'무대나 전시 작품을 준비한다',tags:['arts'],
     conditional:[{when:{traits:['관심-예체능']},result:{effects:{traits:{add:['예체능']}},history:{title:'예체능 적성 발견',detail:'꾸준한 창작 경험으로 표현의 즐거움을 느꼈다.'}}}]},
    {label:'체육 활동과 연습을 이어간다',tags:['sports'],
     conditional:[{when:{traits:['관심-체육']},result:{effects:{traits:{add:['체육']}},history:{title:'체육 적성 발견',detail:'꾸준한 활동이 운동의 즐거움을 더했다.'}}}]}
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
