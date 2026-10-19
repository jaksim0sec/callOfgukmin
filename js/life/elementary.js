/* Elementary years: friends, free public resources, evolving learning habits. */
(function(global){
'use strict';
const S=global.GukminStory;
// The class election remembers candidacy, outcome and service separately.
const winner={any:[{stats:{relations:{gte:55}}},{all:[{traits:['리더십']},{stats:{relations:{gte:51}}}]}]};
function stand(label){
 return {label,effects:{attributes:{classElection:'ran'}},
  detail:'출마 신청서에 이름을 적었다. 개표 결과는 잠시 뒤 나온다.',
  conditional:[
   {when:winner,result:{effects:{attributes:{classElection:'elected',roles:['반장']}},history:{title:'반장에 뽑혔다',detail:'점심시간까지 이어진 투표에서 과반을 얻었다. 이제 학급 공지를 책임질 차례다.'}}},
   {when:{not:winner},result:{effects:{attributes:{classElection:'lost'}},history:{title:'반장 선거에서 떨어졌다',detail:'표가 모자랐다. 친구 몇 명은 뒤에서 엄지를 들어 보였다.'}}}
  ]};
}
function support(label){
 return {label,effects:{attributes:{classElection:'supported'},stats:{relations:1}},
  detail:'후보가 부탁한 포스터를 함께 붙였다. 친구는 다음날 간식을 하나 건넸다.'};
}
const watch={label:'후보들의 공약을 듣고 투표한다',effects:{attributes:{classElection:'observed'}},
 detail:'한 명은 급식 줄을 바꾸겠다고 했고 다른 한 명은 숙제를 줄이겠다고 했다. 둘 다 반장이 결정할 수 있는지는 모르겠다.'};
global.GukminDirector.register({
 id:'elementary',when:{phase:'elementary'},
 generate:persona=>{
  const region=persona.regionTags||[];
  const area=region.includes('어촌')?'갯벌 체험':region.includes('농촌')?'마을 행사':region.includes('산업')?'지역 진로 체험':'동네 문화 행사';
  const wealthy=['gold','diamond'].includes(persona.familyTier);
  const stages=S.pack(
   S.notice('elementary:welcome',28,'처음 받은 교과서','읽기·쓰기·수학뿐 아니라 친구와 약속을 배우기 시작했다.',{activate:{study:45}}),
   S.branch(S.selection('elementary:friends',29,'급식실에서 친구를 만났다','친구가 자리에 앉아도 되냐고 묻는다.',[
    {label:'함께 앉아 이야기를 나눈다',effects:{stats:{relations:6,stress:-2}},detail:'새로운 친구를 사귀었다.'},
    {label:'조용히 밥을 먹는다',effects:{stats:{health:2,relations:-1}},detail:'잠깐 혼자 있는 시간이 필요했다.'}
   ]),[
    {id:'first-friend',priority:25,when:{traits:['호기심']},
     body:'첫 급식날, 민서가 네 공책의 그림을 보고 옆자리에 앉아도 되냐고 묻는다.',
     options:[
      {label:'그림 이야기를 해 주며 같이 먹는다',effects:{attributes:{friendRoute:'shared'},stats:{relations:2}},detail:'민서가 자기 공책에도 같은 그림을 그려 왔다. 다음날 또 옆자리에 앉았다.'},
      {label:'밥부터 먹고 쉬는 시간에 이야기한다',effects:{attributes:{friendRoute:'shared'},stats:{relations:1}},detail:'급식실에서는 조용했지만 쉬는 시간에 민서가 다시 다가왔다.'},
      {label:'오늘은 혼자 먹겠다고 한다',effects:{attributes:{friendRoute:'alone'}},detail:'민서는 고개를 끄덕이고 다른 자리에 앉았다. 서로 나쁜 감정은 없었다.'}
     ]},
    {id:'careful-friend',priority:20,when:{traits:['낯가림']},
     body:'반 친구 민서가 급식판을 들고 서 있다. 네 맞은편 자리만 비어 있다.',
     options:[
      {label:'의자를 조금 당겨 자리를 내준다',effects:{attributes:{friendRoute:'shared'},stats:{relations:1}},detail:'민서는 말없이 앉더니 국이 맵냐고 물었다. 너는 고개를 저었다.'},
      {label:'자리는 비었지만 대화는 다음에 한다',effects:{attributes:{friendRoute:'quiet'}},detail:'둘은 국을 먹는 동안 한마디도 안 했다. 대신 다음날 아침 가볍게 인사했다.'}
     ]},
    {id:'ordinary-friend',priority:0,
     body:'급식실에서 민서가 네 맞은편에 앉아도 되냐고 묻는다. 뒤에는 줄이 길다.',
     options:[
      {label:'같이 앉아 급식 메뉴를 평가한다',effects:{attributes:{friendRoute:'shared'},stats:{relations:2}},detail:'둘 다 콩나물국은 남겼다. 그 얘기로 쉬는 시간에도 떠들었다.'},
      {label:'혼자 먹겠다고 말한다',effects:{attributes:{friendRoute:'alone'}},detail:'민서는 빈자리를 찾아갔다. 너는 조용히 밥을 다 먹었다.'}
     ]}
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
   S.branch(S.selection('elementary:representative',45,'학급 대표를 뽑는 날','반장이 되어보라는 권유를 받았다.',[
    {label:'학급 대표에 도전한다',effects:{stats:{relations:3,stress:5},traits:{add:['리더십']}},detail:'작은 책임을 맡아 보았다.'},
    {label:'친구의 준비를 도와준다',effects:{stats:{relations:5,stress:1}},detail:'친구의 이야기를 함께 들어주었다.'},
    {label:'조용히 내 공부에 집중한다',effects:{stats:{study:4,relations:-1}},detail:'학업 습관을 지켰다.'}
   ]),[
    {id:'friend-nomination',priority:40,when:{all:[{attributes:{friendRoute:'shared'}},{stats:{relations:{gte:52}}}]},
     body:'민서가 쉬는 시간마다 네 책상에 찾아온다. "너 반장 하면 안 돼?" 옆자리 두 명도 고개를 끄덕인다. ==추천인이 벌써 세 명이다.==',
     options:[stand('추천을 받고 직접 출마한다'),support('민서가 나가는 대신 선거 운동을 돕는다'),watch]},
    {id:'leadership-without-votes',priority:30,when:{all:[{traits:['리더십']},{stats:{relations:{lte:50}}}]},
     body:'반장 선거 공지가 붙었다. 발표는 자신 있는데 친한 친구는 많지 않다. 민서는 "나가 볼 거야?" 하고 물었다.',
     options:[stand('친구가 적어도 공약을 써서 출마한다'),support('민서의 출마 준비를 도와준다'),watch]},
    {id:'leadership',priority:20,when:{traits:['리더십']},
     body:'학급 회의에서 네가 진행을 맡았던 것을 기억한 친구들이 출마를 권한다. 민서도 뒤에서 손을 든다.',
     options:[stand('학급 공약을 설명하며 출마한다'),support('다른 후보와 역할을 나눠 지원한다'),watch]},
    {id:'open-election',priority:0,
     body:'반장 선거 공지가 붙었다. 민서는 선거 포스터에 "급식 먼저 먹기"라고 적었다가 담임에게 지웠다. 누구든 출마할 수 있다.',
     options:[stand('내 생각으로 출마해 본다'),support('민서가 준비하는 포스터를 도와준다'),watch]}
   ]),
   S.notice('elementary:age12',48,'초등학교 6학년','중학교라는 새로운 환경이 가까워졌다.',{attributes:{age:12}}),
   S.branch(S.selection('elementary:graduation',50,'졸업을 앞둔 봄','친구들이 졸업 후 바뀔 생활을 이야기한다.',[
    {label:'새 학교 정보와 시간표를 알아본다',effects:{stats:{study:4,stress:3}},detail:'변화를 준비했다.'},
    {label:'친구들과 추억을 남긴다',effects:{stats:{relations:5,stress:-3}},detail:'함께한 시간의 소중함을 느꼈다.'}
   ]),[
    {id:'representative-followup',priority:35,when:{attributes:{classElection:'elected'}},
     body:'6학년 마지막 학급 회의에서 민서가 네게 감사 편지를 돌렸다. 반장으로 해낸 일도 있지만 끝내 해결하지 못한 일도 있다.',
     options:[
      {label:'마지막 공지를 직접 정리해 나눠 준다',detail:'한 해 동안 모은 사진을 보며 공지를 썼다. 마지막 종이를 나눠 주고서야 일이 끝났다.'},
      {label:'민서에게 회의 진행을 맡겨 본다',effects:{stats:{relations:1}},detail:'민서가 자리를 정리했고 너는 뒤에서 종이를 걷었다. 둘 다 마지막 종소리를 들었다.'}
     ]},
    {id:'campaign-followup',priority:25,when:{attributes:{classElection:'supported'}},
     body:'지난 선거 때 함께 포스터를 붙이던 민서가 졸업앨범을 펼쳤다. 낙서 아래 네 이름도 작게 적혀 있다.',
     options:[
      {label:'서로의 앨범에 짧은 편지를 적는다',effects:{stats:{relations:1}},detail:'민서가 네 문장을 읽고 웃었다. 마지막 페이지에 네 이름을 적어 줬다.'},
      {label:'함께 붙인 선거 포스터 사진을 보내 달라고 한다',detail:'민서가 흐릿한 사진을 찾아 보냈다. 글자는 거의 안 보이지만 둘의 손은 찍혀 있다.'}
     ]},
    {id:'graduation-ordinary',priority:0,
     body:'졸업식 연습 중 누군가 "중학교 가서도 연락할 거지?"라고 물었다. 다들 그 말을 얼마나 지킬지는 모른다.',
     options:[
      {label:'친했던 친구들에게 먼저 연락처를 남긴다',effects:{stats:{relations:1}},detail:'몇 명과 연락처를 주고받았다. 적어도 오늘만큼은 다들 답장을 보냈다.'},
      {label:'중학교 시간표와 통학길부터 살펴본다',detail:'집에서 새 학교까지 가는 길을 확인했다. 조금 무서웠지만 길을 한번 알아 두니 덜 낯설었다.'}
     ]}
   ]),
   S.notice('elementary:middle-entry',52,'중학교 입학','초등학교를 졸업하고 새로운 학교생활을 시작한다.',{
    attributes:{age:13,phase:'middle',job:'중학생',roles:[]},
    schools:[
     {id:'local-elementary',kind:'elementary',name:'거주지 배정 초등학교',status:'graduated'},
     {id:'local-middle',kind:'middle',name:'거주지 배정 중학교',status:'enrolled'}
    ]
   })
  );
  return {...stages,attributes:{friendRoute:{label:'첫 친구의 기억',hidden:true},classElection:{label:'학급 대표 선거',hidden:true}}};
 }
});
})(window);
