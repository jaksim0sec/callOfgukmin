/* Annual grade strategies with school-specific everyday stories. */
(function(global){
'use strict';
const S=global.GukminStory;
const trackScenes={
 general:['학급 단체방에 잘못 올라온 수행평가 공지','친구들이 날짜를 착각하고 있다. 정확한 공지를 확인해 줄까?'],
 autonomous:['학생 주도 탐구 주간','학교 교육과정에서 탐구 주제를 정해야 한다. 무엇을 먼저 할까?'],
 'autonomous-public':['우리 지역과 학교의 공동 프로젝트','지역과 관련된 학급 프로젝트를 제안해 보라는 공지가 나왔다.'],
 foreign:['외국어 발표에서 질문을 받다','외운 대본과 달리 즉석 질문이 쏟아진다.'],
 international:['국제 이슈 토론 준비','조원들의 입장이 엇갈리고 발표 시간이 다가온다.'],
 gifted:['결과가 예상과 다른 실험','실험 결과가 예상과 달라 보고서 구성이 어려워졌다.'],
 science:['탐구 활동의 가설이 어긋났다','과학·수학 심화 탐구에서 예상과 다른 결과가 나왔다. 무엇을 확인할까?'],
 vocational:['전공 과제의 마감','실습 과제의 결과물과 설명 자료가 완성되지 않았다.']
};
const actions=[
 {label:'친구들과 사실과 자료를 확인하고 함께 정리한다',effects:{stats:{relations:5,study:3,stress:3}},detail:'자료를 검증하고 함께 문제를 풀었다.'},
 {label:'담당 선생님께 현재 상황을 설명한다',effects:{stats:{study:3,relations:2,stress:1}},detail:'직접 확인하고 현실적인 조언을 얻었다.'},
 {label:'맡은 만큼만 마무리하고 쉬기로 한다',effects:{stats:{health:3,stress:-4,study:-1}},detail:'완벽하진 않아도 무리하지 않았다.'}
];
const trackOptions={"general":[{"label":"학교 공지 원문을 캡처해 단체방에 공유한다","detail":"제출 날짜가 하루 달랐다. 다른 반까지 정정 공지가 퍼졌다.","effects":{"stats":{"study":1}}},{"label":"공지 올린 친구에게만 먼저 알려준다","detail":"친구가 날짜를 고쳤다. 한동안 단체방은 '확인했습니다'로 가득 찼다.","effects":{"stats":{"relations":1}}},{"label":"내 숙제부터 제출하고 조용히 있는다","detail":"제출은 했다. 같은 반 두 명은 옛 공지를 믿고 있었다."}],"autonomous":[{"label":"관찰 가능한 주제로 탐구 범위를 줄인다","detail":"멋진 제목은 버렸지만 직접 확인할 자료가 남았다.","effects":{"stats":{"study":1}}},{"label":"조원들에게 각자 궁금한 점을 물어본다","detail":"회의는 길어졌지만 서로 동의하는 실험 하나를 골랐다.","effects":{"stats":{"relations":1}}},{"label":"기존 연구 사례를 비교하는 것으로 바꾼다","detail":"직접 실험보다 자료를 비교하는 데 시간을 썼다."}],"autonomous-public":[{"label":"지역 주민을 찾아가 직접 인터뷰한다","detail":"가게 세 곳에서 세 가지 다른 불편을 말했다. 발표 내용을 다시 줄였다.","effects":{"stats":{"study":1}}},{"label":"활동 예산부터 실제로 확인한다","detail":"장비 대여료만으로 절반이 나갔다. 기획서를 고쳤다.","effects":{"stats":{"relations":1}}},{"label":"학교 안에서 실행 가능한 규모로 조정한다","detail":"규모는 줄었지만 실제로 행사 안내문을 붙일 수 있었다."}],"foreign":[{"label":"못 알아들은 질문을 다시 말해 달라고 한다","detail":"다시 들으니 무슨 뜻인지 알았다. 준비하지 않은 표현으로 답했다.","effects":{"stats":{"study":1}}},{"label":"아는 외국어 표현으로 뜻을 바꿔 답한다","detail":"문장은 매끄럽지 않았지만 질문자가 고개를 끄덕였다.","effects":{"stats":{"relations":1}}},{"label":"준비한 발표 범위까지만 답한다","detail":"발표는 마쳤다. 질의응답에서는 아쉬운 점수를 받았다."}],"international":[{"label":"양쪽이 인정하는 자료부터 정리한다","detail":"출처에는 모두 동의했다. 발표 첫 장에 두 의견을 나란히 적었다.","effects":{"stats":{"study":1}}},{"label":"상반된 의견을 각각 발표하는 역할로 나눈다","detail":"조원들이 서로 반박했다. 덕분에 예상 질문은 많아졌다.","effects":{"stats":{"relations":1}}},{"label":"한쪽 주장만 선택해 내용을 줄인다","detail":"설명은 간결해졌다. 반대 의견을 충분히 다루지 못했다는 평이 남았다."}],"gifted":[{"label":"측정 장치를 점검하고 다시 실험한다","detail":"센서 위치를 바꾸니 그래프가 달라졌다. 원인을 보고서에 적었다.","effects":{"stats":{"study":1}}},{"label":"예상과 다른 수치를 그대로 제시한다","detail":"선생님은 틀린 가설보다 확인한 절차를 더 오래 물었다.","effects":{"stats":{"relations":1}}},{"label":"추가 실험을 접고 검증 가능한 결과만 낸다","detail":"결론은 짧아졌지만 설명할 수 없는 수치를 지어내지는 않았다."}],"science":[{"label":"변인 통제가 올바른지 실험을 재현한다","detail":"첫 시도와 준비 순서가 달랐다. 관찰 기록부터 다시 썼다.","effects":{"stats":{"study":1}}},{"label":"다른 가설을 조원들과 비교한다","detail":"가설이 세 개가 됐다. 가장 적은 실험으로 검증할 방법부터 골랐다.","effects":{"stats":{"relations":1}}},{"label":"남은 자료의 한계를 설명해 제출한다","detail":"결과를 과장하지 않았다. 다음 실험 계획을 부록에 남겼다."}],"vocational":[{"label":"실습 장비를 점검하고 필수 기능부터 마무리한다","detail":"외관은 덜 다듬었지만 핵심 기능은 시연됐다.","effects":{"stats":{"study":1}}},{"label":"팀과 작업을 나눠 시연 순서를 맞춘다","detail":"리허설에서 누락된 안전 점검 항목을 발견했다.","effects":{"stats":{"relations":1}}},{"label":"완료하지 못한 부분을 명시하고 제출한다","detail":"결함을 감추지 않았다. 남은 작업이 무엇인지는 확실했다."}]};
function choiceAt(id,at,title,body,options,when){
 const x=S.selection(id,at,title,body,options);
 x.event.when={all:[{turn:{eq:at}},...(when?[when]:[])]};
 return x;
}
function examWithPrelude(age,year,at,kind){
 return [S.examPrelude('high',year,at,kind==='mock'?'모의고사':'내신 평가'),yearExam(age,year,at,kind)];
}
function yearExam(age,year,at,kind){
 const type=kind==='mock'?'모의고사':'내신',title=year+'학년 '+type+' 종합 준비';
 const x=S.exam('high',age,year,at,title,kind);
 x.choice.body=kind==='mock'
  ?'3월·6월 등 한 학년의 모의고사 대비에 시간을 얼마나 투자할까? 내신과는 별도로 평가한다.'
  :'지필평가·수행평가를 포함한 한 학년의 내신 관리에 얼마나 집중할까?';
 x.choice.presentation.annual=true;
 x.event.when={turn:{eq:at}};
 return x;
}
const old=[
 [16,1,65,'3월 모의고사','mock'],[16,1,66,'1학기 중간고사','school'],
 [16,1,67,'6월 모의고사','mock'],[16,1,68,'1학기 기말고사','school'],
 [17,2,70,'3월 모의고사','mock'],[17,2,71,'1학기 중간고사','school'],
 [17,2,72,'6월 모의고사','mock'],[17,2,73,'1학기 기말고사','school'],
 [18,3,75,'3월 모의고사','mock'],[18,3,76,'1학기 중간고사','school'],
 [18,3,77,'6월 모의고사','mock'],[18,3,78,'1학기 기말고사','school']
];
global.GukminDirector.register({
 id:'high',when:{phase:'high'},
 generate:persona=>{
  const countryside=persona.regionTags?.some(t=>['어촌','농촌','섬'].includes(t));
  const familyNeeds=['soil','bronze'].includes(persona.familyTier);
  const branches=Object.entries(trackScenes).map(([track,[title,body]])=>S.branch(choiceAt(
   'high:track-'+track,67,title,body,actions,{attributes:{schoolTrack:track}}),[
    {id:'track-'+track,body,options:trackOptions[track]}
  ]));
  const unique=[
   S.branch(choiceAt('high:bdja-science',72,'학교에서 안내한 과학·수학 탐구 활동',
    '분당중앙고 공개 안내에는 과학·수학 관련 활동이 있다. 어떤 방식으로 참여할까?',actions,
    {attributes:{schoolProgram:'bdja-science'}}),[{id:'bdja-lab',
    body:'실험실 예약표가 빈틈없이 찼다. ==검증 가능한 가설==을 적으라는 안내와 달리 장비가 먼저 부족하다.',
    options:[
     {label:'측정 조건 하나만 바꾸는 소규모 실험을 한다',effects:{stats:{study:2}},detail:'변인을 좁히자 필요한 실험 시간도 줄었다.'},
     {label:'다른 조와 실험 기구를 공동으로 쓴다',effects:{stats:{relations:1}},detail:'사용 시간을 나눴다. 예약표에는 빈칸이 하나 생겼다.'},
     {label:'문헌 자료를 비교하는 주제로 바꾼다',detail:'장비를 쓰진 못했지만 자료 출처를 직접 검증했다.'}
    ]}]),
   S.branch(choiceAt('high:whimoon-electives',72,'다양한 선택과목의 학점 배당',
    '휘문고 공개 교육과정에서 과목 선택과 이수 학점을 검토한다. 시간을 어떻게 배분할까?',actions,
    {attributes:{schoolProgram:'whimoon-electives'}}),[{id:'whimoon-credits',
    body:'과목 희망표가 돌아왔다. 두 과목의 시간이 겹친다. 마감은 내일이고 이수 학점은 지켜야 한다.',
    options:[
     {label:'이수 기준부터 확인하고 한 과목을 조정한다',effects:{stats:{study:1}},detail:'희망 순위를 고쳤다. 듣고 싶던 과목 하나는 다음 학기로 미뤘다.'},
     {label:'다른 분반이 있는지 담당 교사에게 묻는다',detail:'다른 분반은 이미 정원이 찼다. 선택지를 다시 살폈다.'},
     {label:'탐구와 토론 수업을 조합해 다시 신청한다',detail:'원래 계획은 바뀌었지만 수업 방식은 다양해졌다.'}
    ]}])
  ];
  const legacy=old.map(args=>{const x=S.exam('high',...args);x.event.when={turn:{lte:-1}};return x;});
  const stages=S.pack(
   S.notice('high:welcome',64,'고등학교에 입학했다','진로 과목과 새로운 친구, 학교생활을 함께 시작한다.',{activate:{exam:45}}),
   S.branch(choiceAt('high:first-day',64,'처음 본 학급 단체 채팅방',
    '누군가 과제 공지를 대신 정리해 줄 사람을 찾는다. 처음이라 더 눈치가 보인다.',[
     {label:'시간표와 제출 날짜를 확인해 공지해 준다',effects:{stats:{study:2,relations:5,stress:2}},detail:'반 친구들의 첫 인상이 좋아졌다.'},
     {label:'친구에게 말을 걸고 같이 살펴본다',effects:{stats:{relations:4,stress:-2}},detail:'함께 적응하는 친구가 생겼다.'},
     {label:'내 일정부터 정리한다',effects:{stats:{study:3,stress:-2}},detail:'스스로 일정을 챙겼다.'}
    ]),[
  {id:'first-science',priority:30,when:{traits:['이과']},
   body:'첫날 실험 조가 꼬였다. 윤세아가 자리표를 보더니 "우리 조가 세 명이라는데 둘밖에 없어."라고 속삭인다.',
   options:[
    {label:'세아와 남은 조원을 찾아본다',effects:{attributes:{highPeer:'세아'},stats:{relations:1}},detail:'전학 간 학생의 이름이 남은 것이었다. 세아와 함께 담당 선생님께 알렸다.'},
    {label:'세아와 준비물 목록부터 확인한다',effects:{attributes:{highPeer:'세아'},stats:{study:1}},detail:'준비물 하나를 빠뜨릴 뻔했다. 세아가 체크 표시를 보내 왔다.'}
   ]},
  {id:'first-social',priority:20,when:{stats:{relations:{gte:55}}},
   body:'첫날 최하린이 반 단체방에서 자기소개 영상을 만들자고 한다. 학생 이름도 못 외웠는데 마감은 이번 주다.',
   options:[
    {label:'하린과 인터뷰 영상에 참여한다',effects:{attributes:{highPeer:'하린'},stats:{relations:1}},detail:'첫 영상에는 학생보다 형광등이 더 크게 찍혔다. 둘은 다시 찍었다.'},
    {label:'하린을 도와 자막과 이름을 확인한다',effects:{attributes:{highPeer:'하린'},stats:{study:1}},detail:'자막을 세 번 고쳤다. 그 사이 반 친구들의 이름을 조금 외웠다.'}
   ]},
  {id:'first-ordinary',priority:0,
   body:'박재호가 단체방에 수행평가 마감일을 올렸다. ==아직 수행평가가 시작도 안 했다.== 담임도 당황했다.',
   options:[
    {label:'재호와 공지 원문을 다시 확인한다',effects:{attributes:{highPeer:'재호'},stats:{relations:1}},detail:'재호가 날짜를 정정했다. 네가 놓친 준비물도 하나 있었다.'},
    {label:'내 시간표부터 정리하고 알림을 꺼둔다',effects:{attributes:{highPeer:'재호'},stats:{study:1}},detail:'재호의 메시지는 계속 왔다. 필요한 날짜만 달력에 적었다.'}
   ]}
 ]),
   examWithPrelude(16,1,65,'mock'),
   choiceAt('high:recover',65,'학교생활을 다시 조율한다',
    '시험과 여러 활동이 겹쳐 몸과 마음이 지쳤다. 부담을 나누고 쉬어 갈 방법을 찾자.',[
     {label:'상담 선생님과 학습량을 조정한다',effects:{stats:{stress:-27,health:5,relations:2}}},
     {label:'잠시 쉬고 남은 시험을 준비한다',effects:{stats:{stress:-21,health:9,schoolScore:-1}}},
     {label:'가까운 사람에게 도움을 요청한다',effects:{stats:{stress:-19,health:4,relations:3}}}
    ],{stats:{stress:{gte:75}}}),
   choiceAt('high:commute',66,'지각할 것 같은 등굣길',
    countryside?'동네 버스가 버스정류장에 오지 않는다. 다음 차는 시간이 한참 남았다. 조회까지는 십 분이다.':'버스가 길 중간에서 멈췄다. 단체방에는 조회 시작 문자가 연달아 올라온다.',[
     {label:'담임에게 지연 상황을 먼저 알리고 안전하게 간다',detail:'담임이 상황을 확인했다. 늦었지만 뛰어들어가다 넘어지는 일은 없었다.'},
     {label:'가족에게 다른 교통편을 알아봐 달라고 한다',detail:'차를 얻어 탈 수 있는지 알아봤지만 바로 가능한 방법은 없었다. 다음 버스를 타기로 했다.'},
     {label:'다음 차를 기다리고 지각 사유를 직접 설명한다',detail:'교문 앞에서 시간을 확인했다. 사정을 설명하자 지각 기록을 검토하겠다고 했다.'}
    ]),
   branches,
   examWithPrelude(16,1,68,'school'),
   S.notice('high:age17',69,'고등학교 2학년','교과 선택과 진로, 친구 관계가 복잡해지기 시작했다.',{attributes:{age:17}}),
   S.branch(choiceAt('high:career',69,'가까운 친구의 고민',
    '친구가 학교생활과 진로에 대한 불안을 털어놓았다. 어떻게 이야기를 이어갈까?',[
     {label:'판단을 미루고 친구 이야기를 충분히 듣는다',effects:{stats:{relations:6,stress:1}},detail:'친구가 마음을 정리하는 데 함께했다.'},
     {label:'담임이나 상담 선생님께 도움을 청하자고 제안한다',effects:{stats:{relations:4,stress:-1}},detail:'상담받을 수 있는 방법을 함께 살폈다.'},
     {label:'산책하면서 다른 이야기도 나눈다',effects:{stats:{relations:3,health:2,stress:-2}},detail:'조금 편안한 시간을 보냈다.'}
    ]),[
  {id:'career-sea',priority:30,when:{attributes:{highPeer:'세아'}},
   body:'윤세아가 학과 안내서를 펴고 묻는다. "좋아하는 과목하고 잘하는 과목이 다르면 뭘 골라?"',
   options:[
    {label:'세아와 실제 전공 수업 목록을 살펴본다',effects:{stats:{relations:1}},detail:'학과 이름보다 수업 내용이 훨씬 낯설었다. 세아도 목록에 표시했다.'},
    {label:'관심 수업의 선수 과목을 찾아본다',effects:{stats:{study:1}},detail:'필요한 과목을 적었지만 아직 희망 학과를 확정하진 않았다.'},
    {label:'아직 진로를 모르겠다고 인정한다',detail:'세아가 웃었다. 본인도 지망 학과를 세 번 고쳤다고 했다.'}
   ]},
  {id:'career-harin',priority:20,when:{attributes:{highPeer:'하린'}},
   body:'최하린의 진로 발표 자료에는 그럴듯한 직업명만 가득하다. "이거 내가 하고 싶은 일은 아닌데."',
   options:[
    {label:'하린에게 실제로 해 보고 싶은 일을 물어본다',effects:{stats:{relations:1}},detail:'하린은 화려한 직업명을 지우고 하고 싶은 활동을 적었다.'},
    {label:'내 발표에서도 직업 대신 경험을 적는다',effects:{stats:{study:1}},detail:'희망 직업 칸은 비었다. 대신 해 보고 싶은 활동이 세 줄 늘었다.'},
    {label:'일단 제출부터 하고 나중에 고민한다',detail:'발표는 끝났다. 하린은 파일을 지우지 않고 남겼다.'}
   ]},
  {id:'career-jaeho',priority:0,
   body:'박재호가 직업 체험 신청서 앞에서 멈췄다. 인기 프로그램은 정원이 찼다. "나 줄 서 있었는데."',
   options:[
    {label:'재호와 다른 체험 프로그램을 찾아본다',effects:{stats:{relations:1}},detail:'원래 목표는 놓쳤지만 다른 분야 체험을 함께 신청했다.'},
    {label:'현직자 인터뷰 자료를 찾아본다',effects:{stats:{study:1}},detail:'일하는 일상을 읽고 예상했던 모습과 다른 부분을 발견했다.'},
    {label:'신청을 포기하고 다음 모집을 확인한다',detail:'신청서는 접었다. 다음 모집 날짜를 적었다.'}
   ]}
 ]),
   examWithPrelude(17,2,70,'mock'),
   choiceAt('high:electives',71,'신청한 선택과목이 사라졌다',
    '신청자가 부족해 희망 과목이 폐강됐다. 다른 과목을 고르라는 안내문에는 ==오늘 오후까지==라고 적혀 있다.',[
     {label:'공동교육과정에서 같은 과목을 열었는지 찾아본다',detail:'연계 수업은 있었지만 이동 시간이 길었다. 신청 조건을 먼저 확인했다.'},
     {label:'교사와 이수 조건을 대조해 비슷한 과목을 고른다',detail:'대체 과목의 단원표를 비교했다. 관심 분야와 완전히 같지는 않았다.'},
     {label:'빈 시간을 활용할 수 있는 다른 선택과목을 찾는다',detail:'희망 순위는 달라졌지만 시간표는 완성됐다. 다음 학기에 듣고 싶은 과목을 적어 뒀다.'}
    ]),
   unique,
   S.branch(choiceAt('high:teamwork',72,'수행평가 전날, 조원 연락이 끊겼다',
    '발표가 내일인데 한 조원이 맡은 자료를 보내지 않는다. 단체방 분위기가 험악해진다.',[
     {label:'자료를 나눠서 재정리하고 발표를 준비한다',effects:{stats:{study:3,relations:4,stress:4}},detail:'불필요한 다툼 없이 발표 준비를 마쳤다.'},
     {label:'조원의 사정을 확인한다',effects:{stats:{relations:6,stress:2}},detail:'사정을 이해하고 역할을 조정했다.'},
     {label:'교사에게 현재 진행 상황을 정확히 알린다',effects:{stats:{study:3,stress:1}},detail:'상황을 정리해 전달했다.'}
    ]),[
  {id:'team-sea',priority:30,when:{attributes:{highPeer:'세아'}},
   body:'윤세아가 실험 결과 파일을 열었다. 마지막 그래프의 단위가 틀렸다. ==이미 보고서를 인쇄했다.==',
   options:[
    {label:'세아와 원본 데이터를 다시 계산한다',effects:{stats:{study:2}},detail:'한밤중까지 식을 고쳤다. 수정한 이유도 보고서에 적었다.'},
    {label:'교사에게 오류를 알리고 정정본을 낸다',detail:'감점 가능성은 남았다. 하지만 틀린 그래프를 사실처럼 발표하지는 않았다.'},
    {label:'틀린 그래프를 제외하고 확인된 자료만 낸다',detail:'발표는 짧아졌다. 질문 시간에 누락된 그래프에 대한 질문이 나왔다.'}
   ]},
  {id:'team-harin',priority:20,when:{attributes:{highPeer:'하린'}},
   body:'최하린과 준비한 토론 발표에서 한 조원이 맡은 슬라이드를 보내지 않았다. 그런데 단체방 프로필 사진은 방금 바뀌었다.',
   options:[
    {label:'조원에게 필요한 자료와 마감을 명확히 전달한다',detail:'조원이 절반을 보내 왔다. 나머지는 너와 하린이 다시 확인했다.'},
    {label:'하린과 발표 분량을 줄여 마무리한다',effects:{stats:{relations:1}},detail:'둘이 자료를 고쳤다. 하린은 마지막 장에 출처를 직접 달았다.'},
    {label:'담당 교사에게 역할별 진행 상황을 알린다',detail:'교사는 작업 기록을 확인했다. 단체방은 며칠 동안 조용했다.'}
   ]},
  {id:'team-jaeho',priority:0,
   body:'박재호가 축제 홍보 영상 링크를 보냈다. 마지막 장면에 학교 이름이 틀렸다. 예약 업로드까지 ==30분 남았다.==',
   options:[
    {label:'재호와 마지막 장면을 다시 편집한다',effects:{stats:{study:1,relations:1}},detail:'오타를 고쳤다. 영상이 다시 출력되는 동안 둘 다 말을 안 했다.'},
    {label:'업로드 예약을 취소하고 수정본을 늦게 낸다',detail:'시간은 놓쳤지만 잘못된 학교 이름으로 퍼지지는 않았다.'},
    {label:'문제 장면을 통째로 삭제해 올린다',detail:'급한 불은 껐다. 갑자기 영상이 짧아진 이유를 댓글에서 물었다.'}
   ]}
 ]),
   examWithPrelude(17,2,73,'school'),
   S.notice('high:age18',74,'고등학교 3학년','졸업을 앞두고 있다. 공부뿐 아니라 사람들과의 시간도 중요해졌다.',{attributes:{age:18}}),
   examWithPrelude(18,3,75,'mock'),
   choiceAt('high:family-time',76,'토요일 오후에 걸려 온 가족의 전화',
    familyNeeds?'가게에 사람이 몰려 가족이 급하게 도와 달라고 한다. 내일 시험 준비도 남았다.':'가족이 오래전 잡은 모임에 오라고 한다. 일요일에는 공부하려고 했는데 돌아오는 시간이 늦어질 듯하다.',[
     {label:'필요한 시간만 돕고 돌아와 남은 과제를 마친다',effects:{stats:{relations:1}},detail:'가족이 일을 나눠 맡았다. 돌아왔을 때 책상 위 계획표에는 아직 빈칸이 있었다.'},
     {label:'내일 일정이 있다며 대신 가능한 시간을 제안한다',detail:'가족이 처음엔 아쉬워했지만 시간을 다시 잡았다. 약속은 지키기로 했다.'},
     {label:'오늘은 가족과 함께 보내고 내일 계획을 다시 짠다',detail:'오랜만에 함께 저녁을 먹었다. 미뤄 둔 공부는 내일 할 일이 됐다.'}
    ]),
   choiceAt('high:graduation-photo',77,'졸업앨범 촬영 날',
    '담임이 열 번 넘게 줄을 맞추라 했는데 박재호는 계속 뒤에서 장난을 친다. ==마지막 사진이라고 다들 갑자기 친한 척한다.==',[
     {label:'오래 함께한 친구에게 작은 쪽지를 남긴다',detail:'친구는 쪽지를 읽고 웃었다. 답장은 졸업식 날 주겠다고 했다.'},
     {label:'선생님과 진로에 관한 마지막 질문을 나눈다',detail:'선생님은 답을 대신 정해 주진 않았다. 다만 준비해야 할 서류 하나를 알려 줬다.'},
     {label:'촬영이 끝나면 조용히 가방을 챙겨 돌아간다',detail:'뒤돌아보니 교실은 여전히 시끄러웠다. 찍힌 사진은 아직 볼 수 없었다.'}
    ]),
   examWithPrelude(18,3,78,'school'),
   S.branch(choiceAt('high:csat-strategy',78,'수능을 앞두고 고르는 마지막 학습 방향',
    '3학년 1학기 평가를 마쳤다. 대학과 전형을 확정할 때까지 시간이 남았지만 준비 방향은 이제 미루기 어렵다.',[
     {label:'지원 전형을 비교해 계획을 정리한다',detail:'접수 일정과 준비할 서류를 따로 적었다.'},
     {label:'기출문제를 다시 풀며 수능 준비 계획을 세운다',detail:'오답 목록을 정리하고 남은 공부 일정을 새로 썼다.'}
    ]),[
     {id:'csat-mock-strength',priority:20,when:{stats:{exam:{gte:62}}},
      body:'최근 모의고사 결과가 꾸준하다. 그런데 원서 상담에서는 내신과 전형별 준비가 빠졌다고 지적했다. ==점수 하나로 지원전략은 결정되지 않는다.==',
      options:[
       {label:'모의고사 대비를 유지하면서 지원 가능 전형을 분석한다',effects:{attributes:{preExamStrategy:'balanced'}},detail:'모의고사 준비를 이어가기로 했다. 동시에 지원 일정과 제출 서류를 표로 정리했다.'},
       {label:'기출 풀이 시간을 늘리는 계획을 짠다',effects:{attributes:{preExamStrategy:'exam'}},detail:'오답 유형을 추려 주간 계획에 적었다. 아직 수능 점수가 나온 것은 아니다.'},
       {label:'학교 기록과 면접 준비 내용을 먼저 검토한다',effects:{attributes:{preExamStrategy:'record'}},detail:'학교 활동 기록과 희망 전형의 요건을 대조했다. 보완할 항목 몇 개를 발견했다.'}
      ]},
     {id:'csat-record-strength',priority:10,when:{stats:{schoolScore:{gte:67}}},
      body:'내신은 잘 관리했지만 모의고사는 들쭉날쭉하다. 상담실에서는 어느 전형도 합격이 확정된 건 아니라고 했다.',
      options:[
       {label:'내신 활용 전형의 제출 일정과 자격을 점검한다',effects:{attributes:{preExamStrategy:'record'}},detail:'학교 기록을 확인하고 서류 누락이 없도록 체크했다.'},
       {label:'모의고사 취약 단원부터 남은 계획을 다시 쓴다',effects:{attributes:{preExamStrategy:'exam'}},detail:'틀린 유형을 묶어 계획을 세웠다. 다음 점수는 아직 모른다.'},
       {label:'지원 일정과 수능 준비를 나눠 진행한다',effects:{attributes:{preExamStrategy:'balanced'}},detail:'원서 일정표와 공부 계획을 따로 적었다. 빽빽하지만 하나씩 확인할 수 있게 됐다.'}
      ]},
     {id:'csat-open-plan',priority:0,
      body:'수능이 가까워지자 교실에서 대학 이름이 대화의 절반을 차지한다. 너는 누가 정해 준 답 대신 지금 할 수 있는 일을 골라야 한다.',
      options:[
       {label:'기출문제의 자주 틀리는 유형을 우선 정리한다',effects:{attributes:{preExamStrategy:'exam'}},detail:'오답 원인을 세 갈래로 나눠 적었다. 실력이 하루 만에 오른 것은 아니다.'},
       {label:'학교 활동과 지원 전형을 먼저 비교한다',effects:{attributes:{preExamStrategy:'record'}},detail:'지원 가능한 전형과 필요한 기록을 정리했다. 빈칸은 담당 선생님에게 확인할 예정이다.'},
       {label:'무리한 계획을 줄이고 두 준비를 번갈아 한다',effects:{attributes:{preExamStrategy:'balanced'}},detail:'할 수 있는 분량만 정했다. 당장 성적이 바뀌진 않았지만 일정표는 완성했다.'}
      ]}
    ]),
   S.notice('high:graduation',79,'고등학교를 졸업했다',
    '시험과 관계, 선택한 과목과 기억이 남았다. 다음 인생 이야기는 준비 중이다.',{
     attributes:{age:19,job:'고교 졸업'},schools:[{kind:'high',status:'graduated'}]
    }),
   legacy
  );
  return {...stages,attributes:{highPeer:{label:'고등학교 첫 인연',hidden:true},preExamStrategy:{label:'수능 이전 준비 전략',hidden:true}}};
 }
});
})(window);
