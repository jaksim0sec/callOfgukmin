/* Elementary years: friends, free public resources, evolving learning habits. */
(function(global){
'use strict';
const S=global.GukminStory;
// The class election remembers candidacy, outcome and service separately.
const winner={any:[{stats:{relations:{gte:55}}},{all:[{traits:['리더십']},{stats:{relations:{gte:51}}}]}]};
function stand(label){
 return {label,risk:'선거 준비와 학급 일을 맡을 시간 필요 · 관계 55 이상이면 당선 가능',effects:{attributes:{classElection:'ran'},stats:{stress:2}},
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
   const funded=['silver','gold','diamond'].includes(persona.familyTier);
   const fee=funded?0:160000;
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
       body:'민서가 빈 닭강정 통을 들여다본다. "야, 이거 ==양념만 남았는데?==" 앞줄 친구는 두 접시째 먹고 있다.',
       options:[
        {label:'민서와 함께 배식 기준을 건의한다',effects:{stats:{relations:2}},detail:'뒤에 줄 선 친구들도 고개를 끄덕였다. 다음 급식부터 양을 확인하기로 했다. ~~닭강정은 이미 다 먹혔다.~~'},
        {label:'앞줄 친구에게 다음부터 적당히 받자고 말한다',effects:{stats:{relations:1}},detail:'친구가 미안하다며 다음엔 남기지 않겠다고 했다. 오늘 네 접시엔 닭강정이 없다.'},
        {label:'그냥 다른 반찬을 먹는다',detail:'민서가 마지막 양념을 밥에 비볐다. 둘은 아무 말 없이 밥을 먹었다.'}
       ]},
      {id:'lunch-alone',priority:0,
       body:'기다리던 닭강정은 다 떨어졌다. 뒤에서는 한숨이 나온다. ==오늘의 메뉴는 양념이었다.==',
       options:[
        {label:'선생님께 배식량이 부족했다고 건의한다',effects:{stats:{relations:1}},detail:'다음 식단부터 배식량을 먼저 확인하겠다는 답을 들었다.'},
        {label:'앞사람에게 한마디 한다',risk:'서로 기분이 상할 수 있음',effects:{stats:{relations:-1}},detail:'앞사람은 왜 자신에게 화를 내냐고 했다. 배식 문제를 두고 친구와 다투고 말았다.'},
        {label:'그냥 다른 반찬을 먹는다',detail:'배는 채웠다. 닭강정은 다음을 기약했다.'}
       ]}
     ]),
   {...S.selection('elementary:recover',30,'잠시 쉬어 갈 때','요즘 긴장과 피로가 쌓였다. 몸과 마음을 돌볼 방법을 정해 보자.',[
    {label:'가족과 상의해 방과 후 일정을 줄이고 며칠 쉬어 간다',effects:{stats:{stress:-15,health:3}},detail:'방과 후 약속을 줄이고 제시간에 잠들었다. 며칠이 지나자 아침에 일어나는 일이 조금 수월해졌다.'},
    {label:'숙제의 우선순위를 정하고 일주일 동안 충분히 잔다',effects:{stats:{stress:-14,health:4,study:-2}},detail:'모든 활동을 붙잡지 않고 꼭 해야 할 것만 했다. 충분히 자면서 몸이 조금 회복됐다.'},
    {label:'가까운 친구에게 최근 힘든 일을 말하고 도움을 구한다',effects:{stats:{stress:-10,relations:1}},detail:'친구가 쉬는 시간마다 잠깐 같이 있자고 했다. 문제는 남아 있지만 혼자 감당할 일이 조금 줄었다.'}
   ]),event:{...S.selection('elementary:recover',30,'','',[{label:'회복'}]).event,when:{turn:{eq:30},stats:{stress:{gte:65}}}}},
   S.selection('elementary:afterschool',37,'방과 후 시간표가 비었다',
    '집에 돌아오니 방과 후 프로그램 안내장이 식탁에 놓여 있다. 신청하는 사람은 다음 달부터 매주 수업을 듣는다.',[
    {id:'school',label:'학교 방과 후 교실에서 과제를 함께 푼다',risk:'정해진 요일에는 다른 약속을 잡기 어려움',effects:{attributes:{afterschoolPath:'school'},stats:{study:3,stress:1}},detail:'매주 한 번 남아 연습 문제를 풀었다. 헷갈리던 부분은 교실에서 다시 물어볼 수 있었다.'},
    {id:'library',label:'도서관에서 관심 있는 책과 문제를 찾아본다',effects:{attributes:{afterschoolPath:'library'},stats:{study:2}},detail:'도서관에서 빌린 책을 읽고 숙제의 모르는 부분을 찾아 정리했다.'},
    {id:'academy',label:'한 달간 방과 후 학원을 다닌다 (16만 원'+(funded?' · 가족 부담':' · 직접 부담')+')',risk:'주 3회 수업 · 다른 방과 후 활동 시간이 줄어듦',...(fee?{when:{stats:{money:{gte:fee}}}}:{}),effects:{attributes:{afterschoolPath:'academy'},stats:{study:4,stress:2,...(fee?{money:-fee}:{})}},detail:fee?'첫 달 수강료 16만 원을 직접 냈다. 매주 교재를 풀었다.':'가족이 첫 달 수강료 16만 원을 부담했다. 매주 교재를 풀었다.'}
   ]),
   S.notice('elementary:age10',40,'초등학교 4학년',area+'에 대해 조사하는 수업이 열린다.',{attributes:{age:10}}),
   S.selection('elementary:project',41,'우리 동네 발표에 생긴 빈칸',
    '발표 전날 한 조원이 동네 소개 사진을 가져왔는데 그 사진은 ==전혀 다른 시의 축제==였다. 이미 PPT 표지에는 그 사진이 걸려 있다.',[
    {label:'지역 자료를 다시 조사해 사진과 출처를 고친다',risk:'마감 전 자료를 다시 찾아야 함',
      effects:{stats:{study:1,stress:2}},
      detail:'지역 도서관 자료와 시청 사진을 대조하다 축제 이름이 겹친다는 걸 발견했다. 밤늦게 출처까지 다시 적었다. **발표의 사실관계는 바로잡았지만** 준비 시간이 빠듯해졌다.'},
     {label:'조원과 함께 원본을 찾아 수정한다',risk:'연락이 늦으면 수정 시간도 줄어듦',
      tags:['team'],effects:{stats:{relations:2,stress:1}},
      detail:'조원은 처음엔 자신이 틀리지 않았다고 주장했다. 너도 근거를 보여 줬고, 결국 둘이 새 사진을 찾아 표지를 고쳤다. **다음 발표도 같이 하자**는 답장이 왔지만 다른 과목 과제는 밀렸다.'},
     {label:'문제 사진을 빼고 확인된 정보만 발표한다',risk:'자료를 준비한 조원과 의견 충돌',
      effects:{stats:{relations:-1,stress:1}},
      detail:'축제 사진을 삭제하자 조원이 왜 말도 없이 뺐냐며 따졌다. 너는 확인된 내용만 발표하겠다고 설명했다. 자료는 정확했지만 **조별 분위기는 냉랭해졌다.**'}
   ]),
   S.selection('elementary:interest-followup',43,'관심 분야를 더 깊이 해볼 기회','축제 준비가 시작됐다. 수업 뒤 여러 주 동안 활동 하나를 맡을 수 있다.\n\n==전에 좋아했던 분야를 이어 가면 적성 특성이 된다.== 새로운 분야를 고르면 관심부터 남는다.',[
    {label:'발표문을 쓰고 토론을 진행한다',risk:'축제까지 여러 차례 원고를 고쳐야 함',effects:{stats:{stress:1}},detail:'짝과 서로 다른 주장을 발표했다. 질문을 받자 미처 준비하지 못한 반론이 있었다.',tags:['humanities'],
     conditional:[{when:{traits:['관심-문과']},result:{effects:{traits:{add:['문과']}},history:{title:'문과 적성 발견',detail:'몇 차례 활동을 통해 표현 분야의 흥미가 자랐다.'}}}]},
    {label:'탐구 실험과 수학 문제를 함께 풀어 본다',risk:'실패한 실험까지 다시 기록해야 함',effects:{stats:{stress:1}},detail:'계산이 맞지 않아 다시 측정했다. 예상했던 답과 다른 값도 그대로 기록했다.',tags:['science'],
     conditional:[{when:{traits:['관심-이과']},result:{effects:{traits:{add:['이과']}},history:{title:'이과 적성 발견',detail:'여러 탐구 경험이 과학 분야에 대한 관심으로 이어졌다.'}}}]},
    {label:'무대나 전시 작품을 준비한다',risk:'작업 시간만큼 다른 활동 시간이 줄어듦',effects:{stats:{stress:1}},detail:'전시가 시작되자 직접 만든 작품 옆에 관람객이 남긴 쪽지가 붙었다.',tags:['arts'],
     conditional:[{when:{traits:['관심-예체능']},result:{effects:{traits:{add:['예체능']}},history:{title:'예체능 적성 발견',detail:'꾸준한 창작 경험으로 표현의 즐거움을 느꼈다.'}}}]},
    {label:'체육 활동과 연습을 이어간다',risk:'정기 연습에 맞춰 일정을 비워야 함',effects:{stats:{stress:1}},detail:'연습하던 동작이 마지막에 제대로 됐다. 다른 팀도 함께 박수를 쳤다.',tags:['sports'],
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
      {label:'지난 학기 학급 회의를 마무리하고 마지막 공지를 나눠 준다',effects:{traits:{add:['리더십']}},detail:'반장으로 여러 번 회의를 진행한 끝에 마지막 공지를 끝냈다. ==한 번 당선된 게 아니라 실제로 한 해를 맡아 본 경험==이 남았다.'},
      {label:'민서에게 마지막 회의를 맡기고 뒤에서 돕는다',effects:{stats:{relations:1},traits:{add:['리더십']}},detail:'민서가 발표하고 너는 준비한 종이를 나눠 줬다. 그동안 혼자 하던 일을 나누는 법도 익혔다.'}
     ]},
    {id:'election-lost',priority:30,when:{attributes:{classElection:'lost'}},
     body:'졸업앨범을 정리하다 반장 선거 때 쓴 공약 종이가 나왔다. 민서는 \"그때 네 공약 중에 아직도 안 된 게 있네\"라며 웃었다.',
     options:[
      {label:'떨어진 뒤에도 함께한 일을 앨범에 적는다',effects:{stats:{relations:1}},detail:'당선되지는 못했지만 축제 때 나눠 맡은 일은 남았다. 민서가 옆에 자기 이름도 적었다.'},
      {label:'공약 종이를 접어 가방에 넣는다',detail:'종이 끝은 해졌지만 글씨는 읽혔다. 다음 학교에서는 무엇을 해 보고 싶은지 잠깐 생각했다.'}
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
  // Retain the player's chosen resource in a later problem, without adding another stop.
  const project=stages.choices.find(choice=>choice.id==='elementary:project');
  project.variants=[
   {id:'library-records',priority:20,when:{attributes:{afterschoolPath:'library'}},
    body:'조원이 넣은 축제 사진이 이상하다. 방과 후 도서관에서 봤던 지역 안내 책자와 장소가 다르다. ==발표는 내일이다.== 이미 표지에 들어간 사진을 어떻게 할까?',options:project.options},
   {id:'school-teammates',priority:10,when:{attributes:{afterschoolPath:'school'}},
    body:'방과 후 교실에서 함께 과제를 풀던 조원이 사진을 잘못 골랐다. ==다른 시의 축제 사진이 표지에 들어갔다.== 친구는 맞는 사진이라고 우긴다. 발표는 내일이다.',options:project.options},
   {id:'project-default',priority:0,body:project.body,options:project.options}
  ];
  const followup=stages.choices.find(choice=>choice.id==='elementary:interest-followup');
  for(const [index,field] of ['문과','이과','예체능','체육'].entries()){
   followup.options[index].result.conditional.push({
    when:{withoutTraits:['관심-'+field,field]},
    result:{effects:{traits:{add:['관심-'+field]}},history:{title:field+' 분야를 새로 탐색했다',detail:'이번에는 새로운 분야에 시간을 써 봤다. 아직 적성으로 단정하진 않지만 관심의 기록이 남았다.'}}
   });
  }
  return {...stages,attributes:{afterschoolPath:{label:'방과 후 활동',hidden:true},friendRoute:{label:'첫 친구의 기억',hidden:true},classElection:{label:'학급 대표 선거',hidden:true}}};
 }
});
})(window);
