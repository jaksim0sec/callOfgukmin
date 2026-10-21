/* Elementary years: friends, free public resources, evolving learning habits. */
(function(global){
'use strict';
const S=global.GukminStory;
// The class election remembers candidacy, outcome and service separately.
const winner={any:[{stats:{relations:{gte:15}}},{all:[{traits:['리더십']},{stats:{relations:{gte:14}}}]}]};
function stand(label){
 return {label,outlook:'당선 시 반장·리더십을 얻는다. 친구들의 지지는 개표로 확인한다.',risk:'선거 준비와 학급 일을 맡을 시간 필요',effects:{attributes:{classElection:'ran'},stats:{stress:2}},
  detail:'출마 신청서에 이름을 적었다. 개표 결과는 잠시 뒤 나온다.',
  conditional:[
   {when:winner,result:{effects:{attributes:{classElection:'elected',roles:['반장']},traits:{add:['리더십']}},history:{title:'반장에 뽑혔다',detail:'점심시간까지 이어진 투표에서 과반을 얻었다. 이제 학급 공지를 책임질 차례다.'}}},
   {when:{not:winner},result:{effects:{attributes:{classElection:'lost'}},history:{title:'반장 선거에서 떨어졌다',detail:'표가 모자랐다. 친구 몇 명은 뒤에서 엄지를 들어 보였다.'}}}
  ]};
}
function support(label){
 return {label,effects:{attributes:{classElection:'supported'},stats:{relations:2,stress:1}},
  detail:'후보가 부탁한 포스터를 함께 붙였다. 친구는 다음날 간식을 하나 건넸다.'};
}
const watch={label:'출마를 거절하고 내 일정을 지킨다',effects:{attributes:{classElection:'observed'},stats:{}},
 detail:'출마 추천은 사양했다. 친구는 아쉬워했지만 너는 준비해 둔 일정을 지켰다. 투표에는 유권자로 참여했다.'};
global.GukminDirector.register({
 id:'elementary',when:{phase:'elementary'},
 generate:persona=>{
  const region=persona.regionTags||[];
  const area=region.includes('어촌')?'갯벌 체험':region.includes('농촌')?'마을 행사':region.includes('산업')?'지역 진로 체험':'동네 문화 행사';
  const stages=S.pack(
   S.notice('elementary:welcome',28,'처음 받은 교과서','읽기·쓰기·수학뿐 아니라 친구와 약속을 배우기 시작했다.',{activate:{study:11}}),
   S.branch(S.selection('elementary:friends',29,'급식실에서 친구를 만났다','친구가 자리에 앉아도 되냐고 묻는다.',[
    {label:'함께 앉아 이야기를 나눈다',effects:{stats:{relations:2,stress:-1}},detail:'새로운 친구를 사귀었다.'},
    {label:'조용히 밥을 먹는다',effects:{stats:{relations:-1}},detail:'잠깐 혼자 있는 시간이 필요했다.'}
   ]),[
    {id:'first-friend',priority:25,when:{traits:['호기심']},
     title:'첫 급식날의 민서',body:'첫 급식날, 민서가 네 공책의 그림을 보고 옆자리에 앉아도 되냐고 묻는다.',
     options:[
      {label:'그림 이야기를 해 주며 같이 먹는다',effects:{attributes:{friendRoute:'shared'},stats:{relations:1}},detail:'민서가 자기 공책에도 같은 그림을 그려 왔다. 다음날 또 옆자리에 앉았다.'},
      {label:'밥부터 먹고 쉬는 시간에 이야기한다',effects:{attributes:{friendRoute:'shared'},stats:{relations:1}},detail:'급식실에서는 조용했지만 쉬는 시간에 민서가 다시 다가왔다.'},
      {label:'오늘은 혼자 먹겠다고 한다',effects:{attributes:{friendRoute:'alone'}},detail:'민서는 고개를 끄덕이고 다른 자리에 앉았다. 서로 나쁜 감정은 없었다.'}
     ]},
    {id:'careful-friend',priority:20,when:{traits:['낯가림']},
     title:'맞은편에 남은 자리',body:'반 친구 민서가 급식판을 들고 서 있다. 네 맞은편 자리만 비어 있다.',
     options:[
      {label:'의자를 조금 당겨 자리를 내준다',effects:{attributes:{friendRoute:'shared'},stats:{relations:1}},detail:'민서는 말없이 앉더니 국이 맵냐고 물었다. 너는 고개를 저었다.'},
      {label:'자리는 비었지만 대화는 다음에 한다',effects:{attributes:{friendRoute:'quiet'}},detail:'둘은 국을 먹는 동안 한마디도 안 했다. 대신 다음날 아침 가볍게 인사했다.'}
     ]},
    {id:'ordinary-friend',priority:0,
     title:'함께 먹을 자리',body:'급식실에서 민서가 네 맞은편에 앉아도 되냐고 묻는다. 뒤에는 줄이 길다.',
     options:[
      {label:'같이 앉아 급식 메뉴를 평가한다',effects:{attributes:{friendRoute:'shared'},stats:{relations:1}},detail:'둘 다 콩나물국은 남겼다. 그 얘기로 쉬는 시간에도 떠들었다.'},
      {label:'혼자 먹겠다고 말한다',effects:{attributes:{friendRoute:'alone'}},detail:'민서는 빈자리를 찾아갔다. 너는 조용히 밥을 다 먹었다.'}
     ]}
   ]),
   S.notice('elementary:age8',32,'초등학교 2학년','혼자 할 수 있는 일이 조금 더 늘었다.',{attributes:{age:8}}),
   S.selection('elementary:interest-exploration',34,'내가 재미있어하는 활동','학교에서 관심 있는 활동을 골라 체험해 보기로 했다.',[
    {label:'이야기를 쓰고 토론해 본다',effects:{traits:{add:['관심-문과']}},tags:['humanities'],detail:'짧은 이야기를 썼다. ==문과 분야의 관심이 발견됐다.== 관련 활동을 계속하면 진짜 특성으로 발전할 수 있다.'},
    {label:'과학 실험과 수학 퍼즐에 도전한다',effects:{traits:{add:['관심-이과']}},tags:['science'],detail:'실험을 끝내고 결과를 적었다. ==이과 분야의 관심이 발견됐다.== 다음에도 해 본다면 적성이 될지 모른다.'},
    {label:'그림과 음악을 만들어 본다',effects:{traits:{add:['관심-예체능']}},tags:['arts'],detail:'만든 작품을 교실 뒤에 걸었다. ==예체능 분야의 관심이 발견됐다.== 다음 학년에도 창작을 이어 가면 특성으로 발전할 수 있다.'},
    {label:'친구들과 운동을 해 본다',effects:{traits:{add:['관심-체육']}},tags:['sports'],detail:'체육 시간 외에도 공을 차러 나갔다. ==체육 분야의 관심이 발견됐다.== 꾸준히 운동하면 특성이 될 수 있다.'}
   ]),
   S.notice('elementary:age9',36,'초등학교 3학년','수업과 숙제가 점점 다양해진다.',{attributes:{age:9}}),
    S.branch(S.selection('elementary:lunch',36,'급식 닭강정이 품절됐다',
     '급식실에서 기다린 끝에 네 차례가 됐다. 그런데 ==닭강정은 양념만 남았다.== 앞줄 친구의 접시는 아직 수북하다.',[
      {label:'배식량을 확인해 달라고 부탁한다',effects:{stats:{relations:1}},detail:'다음 날부터 적정량을 안내하는 종이가 붙었다. ~~닭강정은 여전히 없었다.~~'},
      {label:'오늘은 다른 반찬을 먹는다',detail:'친구의 닭강정을 보고 잠깐 부러웠지만 오늘 점심은 그냥 먹었다.'}
     ]),[
      {id:'lunch-with-minseo',priority:10,when:{attributes:{friendRoute:'shared'}},
       title:'민서와 빈 닭강정 통',body:'민서가 빈 닭강정 통을 들여다본다. "야, 이거 ==양념만 남았는데?==" 앞줄 친구는 두 접시째 먹고 있다.',
       options:[
        {label:'민서와 함께 배식 기준을 건의한다',effects:{stats:{relations:1}},detail:'뒤에 줄 선 친구들도 고개를 끄덕였다. 다음 급식부터 양을 확인하기로 했다. ~~닭강정은 이미 다 먹혔다.~~'},
        {label:'앞줄 친구에게 다음부터 적당히 받자고 말한다',effects:{stats:{relations:1}},detail:'친구가 미안하다며 다음엔 남기지 않겠다고 했다. 오늘 네 접시엔 닭강정이 없다.'},
        {label:'그냥 다른 반찬을 먹는다',detail:'민서가 마지막 양념을 밥에 비볐다. 둘은 아무 말 없이 밥을 먹었다.'}
       ]},
      {id:'lunch-alone',priority:0,
       title:'오늘의 메뉴는 양념',body:'기다리던 닭강정은 다 떨어졌다. 뒤에서는 한숨이 나온다. ==오늘의 메뉴는 양념이었다.==',
       options:[
        {label:'선생님께 배식량이 부족했다고 건의한다',effects:{stats:{relations:1}},detail:'다음 식단부터 배식량을 먼저 확인하겠다는 답을 들었다.'},
        {label:'앞사람에게 한마디 한다',risk:'서로 기분이 상할 수 있음',effects:{stats:{relations:-1}},detail:'앞사람은 왜 자신에게 화를 내냐고 했다. 배식 문제를 두고 친구와 다투고 말았다.'},
        {label:'그냥 다른 반찬을 먹는다',detail:'배는 채웠다. 닭강정은 다음을 기약했다.'}
       ]}
     ]),
   {...S.selection('elementary:recover',30,'잠시 쉬어 갈 때','요즘 긴장과 피로가 쌓였다. 몸과 마음을 돌볼 방법을 정해 보자.',[
    {label:'가족과 상의해 방과 후 일정을 줄이고 며칠 쉬어 간다',effects:{stats:{stress:-5,study:-2}},detail:'방과 후 약속을 줄이고 제시간에 잠들었다. 며칠이 지나자 아침에 일어나는 일이 조금 수월해졌다.'},
    {label:'숙제의 우선순위를 정하고 일주일 동안 충분히 잔다',effects:{stats:{stress:-3,relations:-1}},detail:'친구 약속을 취소하고 모든 활동을 붙잡지 않고 꼭 해야 할 것만 했다. 충분히 자면서 몸이 조금 회복됐다.'},
    {label:'가까운 친구에게 최근 힘든 일을 말하고 도움을 구한다',effects:{stats:{stress:-2,study:-1,relations:1}},detail:'복습 한 번을 미루고 친구와 이야기했다. 친구가 쉬는 시간마다 잠깐 같이 있자고 했다. 문제는 남아 있지만 혼자 감당할 일이 조금 줄었다.'}
   ]),event:{...S.selection('elementary:recover',30,'','',[{label:'회복'}]).event,when:{turn:{eq:30},any:[{stats:{stress:{gte:16}}},{stats:{illness:{gte:1}}}]}}},
   S.selection('elementary:afterschool',37,'방과 후 시간표가 비었다',
    '학교에서 방과 후 활동 신청서를 가져왔다. 방과 후 시간이 남는다. 무엇을 할까?',[
    {id:'school',label:'학교에서 받은 방과 후 활동 신청서에서 고른다',effects:{attributes:{afterschoolPath:'school'},stats:{relations:1,study:1,stress:1}},detail:'신청서에서 관심 있는 수업을 골랐다. 정해진 날에는 학교에 남아 친구들과 배우고 과제를 풀었다.'},
    {id:'library',label:'친구들과 놀러 다닌다',effects:{attributes:{afterschoolPath:'friends'},stats:{relations:2,study:-1}},detail:'친구들과 놀며 가까워졌다. 대신 복습에 쓸 시간이 줄었다.'},
    {id:'academy',label:'가족과 상의해 학원에 다닌다',requirement:'부모 등급 은수저 이상',risk:'재산 1만 원 · 수업과 숙제 부담',when:{stats:{money:{gte:10000}},any:['silver','gold','diamond'].map(familyTier=>({attributes:{familyTier}}))},effects:{attributes:{afterschoolPath:'academy'},stats:{relations:1,study:3,money:-10000,stress:3}},detail:'가족과 상의한 뒤 학원에 다니기 시작했다. 새 친구를 만나고 더 많이 배웠지만 수업과 숙제가 늘었다. 재산 1만 원을 사용했다.'}
   ]),
   S.notice('elementary:age10',40,'초등학교 4학년',area+'에 대해 조사하는 수업이 열린다.',{attributes:{age:10}}),
   S.selection('elementary:project',41,'우리 동네 발표에 생긴 빈칸',
    '발표 전날 한 조원이 동네 소개 사진을 가져왔는데 그 사진은 ==전혀 다른 시의 축제==였다. 이미 PPT 표지에는 그 사진이 걸려 있다.',[
    {label:'지역 자료를 다시 조사해 사진과 출처를 고친다',risk:'마감 전 자료를 다시 찾아야 함',
      effects:{stats:{study:2,stress:2}},
      detail:'지역 도서관 자료와 시청 사진을 대조하다 축제 이름이 겹친다는 걸 발견했다. 밤늦게 출처까지 다시 적었다. **발표의 사실관계는 바로잡았지만** 준비 시간이 빠듯해졌다.'},
     {label:'조원과 함께 원본을 찾아 수정한다',risk:'연락이 늦으면 수정 시간도 줄어듦',
      tags:['team'],effects:{stats:{relations:2,stress:2}},
      detail:'조원은 처음엔 자신이 틀리지 않았다고 주장했다. 너도 근거를 보여 줬고, 결국 둘이 새 사진을 찾아 표지를 고쳤다. **다음 발표도 같이 하자**는 답장이 왔지만 다른 과목 과제는 밀렸다.'},
     {label:'문제 사진을 빼고 확인된 정보만 발표한다',risk:'자료를 준비한 조원과 의견 충돌',
      effects:{stats:{}},
      detail:'추가 조사 대신 발표 범위를 줄였다. 축제 사진을 삭제하자 조원이 왜 말도 없이 뺐냐며 따졌다. 너는 확인된 내용만 발표하겠다고 설명했다. 자료는 정확했지만 **조별 분위기는 냉랭해졌다.**'}
   ]),
   S.selection('elementary:interest-followup',43,'관심 분야를 더 깊이 해볼 기회','축제 준비가 시작됐다. 수업 뒤 여러 주 동안 활동 하나를 맡을 수 있다.\n\n==전에 좋아했던 분야를 이어 가면 적성 특성이 된다.== 새로운 분야를 고르면 관심부터 남는다.',[
    {label:'발표문을 쓰고 토론을 진행한다',risk:'축제까지 여러 차례 원고를 고쳐야 함',effects:{stats:{stress:1}},detail:'짝과 서로 다른 주장을 발표했다. 질문을 받자 미처 준비하지 못한 반론이 있었다.',tags:['humanities'],
     conditional:[{when:{traits:['관심-문과']},result:{effects:{traits:{remove:['관심-문과'],add:['문과']}},history:{title:'문과 적성 발견',detail:'몇 차례 활동을 통해 표현 분야의 흥미가 자랐다.'}}}]},
    {label:'탐구 실험과 수학 문제를 함께 풀어 본다',risk:'실패한 실험까지 다시 기록해야 함',effects:{stats:{stress:1}},detail:'계산이 맞지 않아 다시 측정했다. 예상했던 답과 다른 값도 그대로 기록했다.',tags:['science'],
     conditional:[{when:{traits:['관심-이과']},result:{effects:{traits:{remove:['관심-이과'],add:['이과']}},history:{title:'이과 적성 발견',detail:'여러 탐구 경험이 과학 분야에 대한 관심으로 이어졌다.'}}}]},
    {label:'무대나 전시 작품을 준비한다',risk:'작업 시간만큼 다른 활동 시간이 줄어듦',effects:{stats:{stress:1}},detail:'전시가 시작되자 직접 만든 작품 옆에 관람객이 남긴 쪽지가 붙었다.',tags:['arts'],
     conditional:[{when:{traits:['관심-예체능']},result:{effects:{traits:{remove:['관심-예체능'],add:['예체능']}},history:{title:'예체능 적성 발견',detail:'꾸준한 창작 경험으로 표현의 즐거움을 느꼈다.'}}}]},
    {label:'체육 활동과 연습을 이어간다',risk:'정기 연습에 맞춰 일정을 비워야 함',effects:{stats:{stress:1}},detail:'연습하던 동작이 마지막에 제대로 됐다. 다른 팀도 함께 박수를 쳤다.',tags:['sports'],
     conditional:[{when:{traits:['관심-체육']},result:{effects:{traits:{remove:['관심-체육'],add:['체육']}},history:{title:'체육 적성 발견',detail:'꾸준한 활동이 운동의 즐거움을 더했다.'}}}]}
   ]),
   S.notice('elementary:age11',44,'초등학교 5학년','반 친구들과의 관계가 더 복잡해졌다.',{attributes:{age:11}}),
   S.branch(S.selection('elementary:representative',45,'반장 선거 · 학급 공약을 정하는 날','반장이 되어보라는 권유를 받았다.',[
    {label:'학급 대표에 도전한다',effects:{stats:{relations:1,stress:1},traits:{add:['리더십']}},detail:'작은 책임을 맡아 보았다.'},
    {label:'친구의 준비를 도와준다',effects:{stats:{relations:1,stress:1}},detail:'친구의 이야기를 함께 들어주었다.'},
    {label:'조용히 내 공부에 집중한다',effects:{stats:{study:1,relations:-1}},detail:'학업 습관을 지켰다.'}
   ]),[
    {id:'friend-nomination',priority:40,when:{all:[{attributes:{friendRoute:'shared'}},{stats:{relations:{gte:13}}}]},
     title:'민서의 출마 추천',body:'민서가 쉬는 시간마다 네 책상에 찾아온다. "너 반장 하면 안 돼?" 옆자리 두 명도 고개를 끄덕인다. ==추천인이 벌써 세 명이다.==',
     options:[stand('추천을 받고 직접 출마한다'),support('민서가 나가는 대신 선거 운동을 돕는다'),watch]},
    {id:'leadership-without-votes',priority:30,when:{all:[{traits:['고집']},{stats:{relations:{lte:13}}}]},
     title:'발표 자신감과 적은 지지',body:'반장 선거 공지가 붙었다. 자기 생각은 분명하지만 친한 친구는 많지 않다. 민서는 "나가 볼 거야?" 하고 물었다.',
     options:[stand('친구가 적어도 공약을 써서 출마한다'),support('민서의 출마 준비를 도와준다'),watch]},
    {id:'leadership',priority:20,when:{traits:['자기주장']},
     title:'학급 회의에서의 추천',body:'학급 회의에서 네 의견을 말했던 것을 기억한 친구들이 출마를 권한다. 민서도 뒤에서 손을 든다.',
     options:[stand('학급 공약을 설명하며 출마한다'),support('다른 후보와 역할을 나눠 지원한다'),watch]},
    {id:'open-election',priority:0,
     title:'누구나 나갈 수 있는 반장 선거',body:'반장 선거 공지가 붙었다. 민서는 선거 포스터에 "급식 먼저 먹기"라고 적었다가 담임에게 지웠다. 누구든 출마할 수 있다.',
     options:[stand('내 생각으로 출마해 본다'),support('민서가 준비하는 포스터를 도와준다'),watch]}
   ]),
   S.notice('elementary:age12',48,'초등학교 6학년','중학교라는 새로운 환경이 가까워졌다.',{attributes:{age:12}}),
   S.branch(S.selection('elementary:graduation',50,'졸업을 앞둔 봄','친구들이 졸업 후 바뀔 생활을 이야기한다.',[
    {label:'새 학교 정보와 시간표를 알아본다',effects:{stats:{study:1,stress:1}},detail:'변화를 준비했다.'},
    {label:'친구들과 추억을 남긴다',effects:{stats:{relations:1,stress:-1}},detail:'함께한 시간의 소중함을 느꼈다.'}
   ]),[
    {id:'representative-followup',priority:35,when:{attributes:{classElection:'elected'}},
     title:'마지막 학급 공지',body:'6학년 마지막 학급 회의에서 민서가 네게 감사 편지를 돌렸다. 반장으로 해낸 일도 있지만 끝내 해결하지 못한 일도 있다.',
     options:[
      {label:'지난 학기 학급 회의를 마무리하고 마지막 공지를 나눠 준다',effects:{stats:{relations:1,stress:1}},detail:'반장으로 여러 번 회의를 진행한 끝에 마지막 공지를 끝냈다. ==한 번 당선된 게 아니라 실제로 한 해를 맡아 본 경험==이 남았다.'},
      {label:'민서에게 마지막 회의를 맡기고 뒤에서 돕는다',effects:{stats:{relations:1,stress:-1}},detail:'민서가 발표하고 너는 준비한 종이를 나눠 줬다. 그동안 혼자 하던 일을 나누는 법도 익혔다.'}
     ]},
    {id:'election-lost',priority:30,when:{attributes:{classElection:'lost'}},
     title:'앨범 속 선거 공약',body:'졸업앨범을 정리하다 반장 선거 때 쓴 공약 종이가 나왔다. 민서는 \"그때 네 공약 중에 아직도 안 된 게 있네\"라며 웃었다.',
     options:[
      {label:'떨어진 뒤에도 함께한 일을 앨범에 적는다',effects:{stats:{relations:1}},detail:'당선되지는 못했지만 축제 때 나눠 맡은 일은 남았다. 민서가 옆에 자기 이름도 적었다.'},
      {label:'공약 종이를 접어 가방에 넣는다',detail:'종이 끝은 해졌지만 글씨는 읽혔다. 다음 학교에서는 무엇을 해 보고 싶은지 잠깐 생각했다.'}
     ]},
    {id:'campaign-followup',priority:25,when:{attributes:{classElection:'supported'}},
     title:'함께 붙인 선거 포스터',body:'지난 선거 때 함께 포스터를 붙이던 민서가 졸업앨범을 펼쳤다. 낙서 아래 네 이름도 작게 적혀 있다.',
     options:[
      {label:'서로의 앨범에 짧은 편지를 적는다',effects:{stats:{relations:1}},detail:'민서가 네 문장을 읽고 웃었다. 마지막 페이지에 네 이름을 적어 줬다.'},
      {label:'함께 붙인 선거 포스터 사진을 보내 달라고 한다',detail:'민서가 흐릿한 사진을 찾아 보냈다. 글자는 거의 안 보이지만 둘의 손은 찍혀 있다.'}
     ]},
    {id:'graduation-ordinary',priority:0,
     title:'마지막 교실과 새 통학길',body:'졸업식 연습 중 누군가 "중학교 가서도 연락할 거지?"라고 물었다. 다들 그 말을 얼마나 지킬지는 모른다.',
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
  const friends=stages.choices.find(c=>c.id==='elementary:friends');
  const sociable=friends.variants.find(v=>v.id==='first-friend');
  sociable.options[0].label='민서에게 그림을 설명하고 먼저 대화를 이끈다';
  sociable.options[0].result.effects.stats={relations:3,stress:2};
  sociable.options[1].result.effects.stats={relations:1,stress:1};
  sociable.options[0].result.history.detail='이야깃거리를 계속 찾느라 조금 긴장했지만 민서와 금세 가까워졌다.';
  for(const id of ['careful-friend','ordinary-friend'])friends.variants.find(v=>v.id===id).options[0].result.effects.stats={relations:2,stress:1};
  for(const v of stages.choices.find(c=>c.id==='elementary:lunch').variants){
   v.options[0].result.effects.stats={relations:3,stress:2};
   v.options[1].label='친구와 남은 메뉴를 나눠 먹는다';v.options[1].result.effects.stats={relations:1,stress:1};
   v.options[1].result.history.detail='서로 먹을 몫을 덜어 나눴다. 더 먹고 싶었지만 함께 줄을 서기로 했다.';
   v.options[2].result.effects.stats={};
  }
  stages.choices.find(c=>c.id==='elementary:representative').presentation={type:'election'};
  const election=stages.choices.find(c=>c.id==='elementary:representative');
  for(const script of election.variants){
   if(!script.title.includes('반장 선거'))script.title='반장 선거 · '+script.title;
   if(!script.body.includes('반장 선거'))script.body='반장 선거가 공지됐다.\n\n'+script.body;
  }
  stages.choices.find(c=>c.id==='elementary:graduation').variants.find(v=>v.id==='representative-followup').options[0].result.effects.stats={relations:2,stress:1};
  for(const id of ['election-lost','campaign-followup','graduation-ordinary']){
   const v=stages.choices.find(c=>c.id==='elementary:graduation').variants.find(v=>v.id===id);
   v.options[1].result.effects.stats=id==='campaign-followup'?{relations:2,stress:1}:{relations:-1,stress:-1};
  }
  // Retain the player's chosen resource in a later problem, without adding another stop.
  const project=stages.choices.find(choice=>choice.id==='elementary:project');
  project.variants=[
   {id:'friends-outing',priority:25,when:{attributes:{afterschoolPath:'friends'}},title:'친구들과 봤던 축제 장소',body:'조원이 가져온 축제 사진의 장소가 이상하다. 방과 후 친구들과 놀러 다니며 봤던 동네와는 다르다. 발표 전에 함께 확인할까?',options:project.options},
   {id:'library-records',priority:20,when:{attributes:{afterschoolPath:'library'}},
    title:'도서관에서 본 축제 사진',body:'조원이 넣은 축제 사진이 이상하다. 방과 후 도서관에서 봤던 지역 안내 책자와 장소가 다르다. ==발표는 내일이다.== 이미 표지에 들어간 사진을 어떻게 할까?',options:project.options},
   {id:'school-teammates',priority:10,when:{attributes:{afterschoolPath:'school'}},
    title:'방과 후 조원의 사진',body:'방과 후 교실에서 함께 과제를 풀던 조원이 사진을 잘못 골랐다. ==다른 시의 축제 사진이 표지에 들어갔다.== 친구는 맞는 사진이라고 우긴다. 발표는 내일이다.',options:project.options},
   {id:'project-default',priority:0,title:'발표 전날의 사진',body:project.body,options:project.options}
  ];
  const followup=stages.choices.find(choice=>choice.id==='elementary:interest-followup');
  for(const [index,field] of ['문과','이과','예체능','체육'].entries()){
   followup.options[index].result.conditional.push({
    when:{withoutTraits:['관심-'+field,field]},
    result:{effects:{traits:{add:['관심-'+field]}},history:{title:field+' 분야를 새로 탐색했다',detail:'이번에는 새로운 분야에 시간을 써 봤다. 아직 적성으로 단정하진 않지만 관심의 기록이 남았다.'}}
   });
  }
  const recovery=stages.choices.find(c=>c.id==='elementary:recover');
  recovery.options.push({id:'ignore',label:'그냥 넘기고 하던 일정을 계속한다',result:{effects:{},history:{title:'회복을 미뤘다',detail:'이번에는 일정을 바꾸지 않았다. 쌓인 부담도 그대로 남았다.'}}});
  return {...stages,attributes:{afterschoolPath:{label:'방과 후 활동',hidden:true},friendRoute:{label:'첫 친구의 기억',hidden:true},classElection:{label:'학급 대표 선거',hidden:true}}};
 }
});
})(window);
