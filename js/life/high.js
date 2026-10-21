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
 {label:'맡은 만큼만 마무리하고 쉬기로 한다',effects:{stats:{stress:-4,study:-1}},detail:'완벽하진 않아도 무리하지 않았다.'}
];
// Each answer is a genuine allocation decision; no free dominant choice.
const trackOptions={
 general:[
  {label:'단체방에 정정 공지를 올리고 질문까지 받는다',risk:'다른 과목 복습 시간이 줄고 잘못 안내하면 책임을 져야 함',effects:{stats:{relations:4,study:-2,stress:3}},detail:'여러 반에서 마감일을 다시 확인했다. 반 친구들에게 고맙다는 말을 들었지만 네 공부는 늦게 시작했다.'},
  {label:'교무실에서 원문만 확인하고 내 준비를 끝낸다',effects:{stats:{study:3,relations:-2,stress:1}},detail:'틀린 날짜를 교사에게 알렸다. 답장은 짧게 보냈고, 급한 친구들에겐 조금 차갑게 보였다. 내 과제는 끝냈다.'},
  {label:'친구 한 명과 확인해서 필요한 사람에게만 전달한다',effects:{stats:{relations:2,study:1,stress:2}},detail:'잘못된 공지를 믿던 친구들은 도왔다. 전체 단체방에는 소식이 늦게 퍼져 다음날 몇 명이 다시 물었다.'}
 ],
 autonomous:[
  {label:'실험을 직접 설계하고 대표 발표까지 맡는다',risk:'실험 실패 시 추가 준비 부담',effects:{stats:{study:4,relations:2,stress:6}},detail:'작은 질문으로 시작했지만 예상과 다른 측정값 때문에 두 번 더 실험했다. 발표는 마쳤고 다른 과목 준비는 늦었다.'},
  {label:'조원별 역할을 나눠 공동 보고서로 정리한다',effects:{stats:{study:1,relations:4,stress:3}},detail:'서로 다른 자료를 한 형식으로 맞췄다. 보고서가 완성됐지만 개별 탐구의 깊이는 얕아졌다.'},
  {label:'이미 검증된 자료로 범위를 줄여 마무리한다',effects:{stats:{study:2,stress:-3,relations:-2}},detail:'완성은 빨랐고 추가 실험은 없었다. 새로운 결과를 기대했던 조원은 아쉬워했다.'}
 ],
 'autonomous-public':[
  {label:'주민을 직접 찾아가 현장 조사를 넓힌다',risk:'예상하지 못한 인터뷰 취소와 이동 시간',effects:{stats:{study:3,relations:3,stress:5}},detail:'인터뷰 두 건은 취소됐지만 가게 세 곳의 실제 불편을 들었다. 자료가 풍부해진 대신 주말을 거의 썼다.'},
  {label:'학교 안에서 실현 가능한 소규모 행사로 바꾼다',effects:{stats:{relations:2,study:1,stress:-2}},detail:'행사는 작아졌지만 학생회와 시간표를 맞춰 실제 안내문을 붙였다. 큰 기획은 다음에 쓰기로 했다.'},
  {label:'예산과 승인 조건부터 검토해 기획서를 정리한다',effects:{stats:{study:3,relations:-2,stress:2}},detail:'장비 대여료를 계산해 반쯤 불가능한 계획을 접었다. 조원들은 너무 보수적이라며 불평했지만 예산은 맞았다.'}
 ],
 foreign:[
  {label:'즉석 질문을 받아 외국어로 끝까지 답한다',risk:'대답이 막히면 발표 인상이 크게 흔들림',effects:{stats:{study:4,stress:5,relations:1}},detail:'단어가 떠오르지 않아 말을 고쳐 가며 설명했다. 준비 범위를 넘는 질문에도 끝까지 답했지만 진이 빠졌다.'},
  {label:'못 알아들은 질문은 확인한 뒤 정확한 부분만 답한다',effects:{stats:{study:2,relations:2,stress:2}},detail:'질문의 뜻을 다시 확인하고 아는 표현으로 짧게 답했다. 답변은 좁았지만 근거는 분명했다.'},
  {label:'발표 시간을 줄이고 조원에게 질의응답을 나눈다',effects:{stats:{relations:4,study:-2,stress:-3}},detail:'질의응답은 조원과 나눠서 넘겼다. 팀의 호흡은 좋아졌지만 개인 발표 점수는 덜 받았다.'}
 ],
 international:[
  {label:'양쪽 입장의 반론까지 자료를 모아 토론한다',risk:'자료 조사와 리허설 시간 초과',effects:{stats:{study:4,stress:6,relations:-1}},detail:'반론을 준비해 토론은 탄탄해졌다. 밤늦게까지 근거를 확인했고 한 조원은 분량이 너무 많다며 불만을 말했다.'},
  {label:'서로 다른 입장을 맡겨 공동 발표를 진행한다',effects:{stats:{relations:4,study:1,stress:3}},detail:'조원들 의견을 각자 발표하도록 나눴다. 모두 무대에 섰지만 주장 하나를 깊게 파진 못했다.'},
  {label:'쟁점을 하나로 좁혀 정확한 사실만 발표한다',effects:{stats:{study:2,stress:-2,relations:-2}},detail:'발표는 간결해졌다. 모호한 주장을 빼자 몇몇 조원은 자신이 준비한 부분이 사라졌다고 했다.'}
 ],
 gifted:[
  {label:'센서를 검증하고 측정 실험을 처음부터 다시 한다',risk:'실험실 추가 예약이 실패하면 시간이 사라짐',effects:{stats:{study:5,stress:6}},detail:'센서 위치가 오차 원인이었다. 장비를 다시 예약해 밤까지 측정했고 보고서의 수치는 바로잡혔다.'},
  {label:'예상과 다른 결과 자체를 분석해 공동 발표한다',effects:{stats:{study:2,relations:3,stress:3}},detail:'가설이 틀린 이유를 조원과 설명했다. 발표는 설득력 있었지만 정확한 재현 실험까지 하지는 못했다.'},
  {label:'재실험을 포기하고 검증된 범위만 제출한다',effects:{stats:{study:1,stress:-4,relations:-2}},detail:'자료에서 확인할 수 있는 값만 남겼다. 결과는 짧아졌고 탐구를 더 해 보자는 친구의 제안은 다음으로 미뤘다.'}
 ],
 science:[
  {label:'변인을 다시 통제하고 반복 측정으로 검증한다',risk:'반복 실패 시 다른 과목 시험을 포기할 수 있음',effects:{stats:{study:5,stress:6}},detail:'측정 순서를 하나씩 바꾸자 원인을 찾았다. 보고서는 탄탄해졌지만 시험 범위를 다 보지 못했다.'},
  {label:'조원마다 다른 가설을 맡아 교차 검토한다',effects:{stats:{relations:4,study:2,stress:4}},detail:'세 가설 중 하나만 남았다. 서로 검산한 덕에 오류는 줄었고 보고서는 분량이 커졌다.'},
  {label:'확인된 데이터만 정리해 제시간에 제출한다',effects:{stats:{stress:-3,study:1,relations:-2}},detail:'설명할 수 없는 수치를 뺐다. 마감은 지켰지만 추가 실험을 원한 조원은 아쉬워했다.'}
 ],
 vocational:[
  {label:'실습 장비를 다시 점검해 시제품 기능을 완성한다',risk:'추가 장비 사용 시간과 늦은 귀가',effects:{stats:{study:4,stress:5}},detail:'시연 직전 장비 문제를 고쳤다. 핵심 기능은 돌아갔지만 마감 전날까지 실습실에 남았다.'},
  {label:'작업을 나눠 시연과 설명을 함께 준비한다',effects:{stats:{relations:4,study:1,stress:3}},detail:'실습과 설명 담당을 나눠 리허설을 마쳤다. 팀워크는 좋아졌지만 시제품의 보조 기능 하나를 포기했다.'},
  {label:'검증된 핵심 기능만 제출하고 정리 시간을 확보한다',effects:{stats:{study:2,stress:-3,relations:-2}},detail:'완료되지 않은 부분을 분명히 적었다. 결과물은 작아졌고 더 해 보자던 조원과는 의견이 갈렸다.'}
 ]
};
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
 id:'high',when:{phase:'high',age:{lte:18}},
 generate:persona=>{
  const countryside=persona.regionTags?.some(t=>['어촌','농촌','섬'].includes(t));
  const familyNeeds=['soil','bronze'].includes(persona.familyTier);
  const arrival=S.notice('high:welcome',64,'고등학교에 입학했다','새 시간표를 받았다. 내신은 교내 경쟁, 모의고사는 통합 시험 역량이다. 입학 시작값은 원서 확정 때 한 번 반영했다.');
  const branches=Object.entries(trackScenes).map(([track,[title,body]])=>S.branch(choiceAt(
   'high:track-'+track,67,title,body,actions,{attributes:{schoolTrack:track}}),[
    {id:'track-'+track,title,body,options:trackOptions[track]}
  ]));
  const unique=[
   S.branch(choiceAt('high:bdja-science',72,'학교에서 안내한 과학·수학 탐구 활동',
    '분당중앙고 공개 안내에는 과학·수학 관련 활동이 있다. 어떤 방식으로 참여할까?',actions,
    {attributes:{schoolProgram:'bdja-science'}}),[{id:'bdja-lab',title:'예약이 찬 탐구실',
    body:'실험실 예약표가 빈틈없이 찼다. ==검증 가능한 가설==을 적으라는 안내와 달리 장비가 먼저 부족하다.',
    options:[
     {label:'측정 조건 하나만 바꾸는 소규모 실험을 한다',effects:{stats:{study:2}},detail:'변인을 좁히자 필요한 실험 시간도 줄었다.'},
     {label:'다른 조와 실험 기구를 공동으로 쓴다',effects:{stats:{relations:1}},detail:'사용 시간을 나눴다. 예약표에는 빈칸이 하나 생겼다.'},
     {label:'문헌 자료를 비교하는 주제로 바꾼다',detail:'장비를 쓰진 못했지만 자료 출처를 직접 검증했다.'}
    ]}]),
   S.branch(choiceAt('high:whimoon-electives',72,'다양한 선택과목의 학점 배당',
    '휘문고 공개 교육과정에서 과목 선택과 이수 학점을 검토한다. 시간을 어떻게 배분할까?',actions,
    {attributes:{schoolProgram:'whimoon-electives'}}),[{id:'whimoon-credits',title:'겹쳐 버린 선택과목',
    body:'과목 희망표가 돌아왔다. 두 과목의 시간이 겹친다. 마감은 내일이고 이수 학점은 지켜야 한다.',
    options:[
     {label:'이수 기준부터 확인하고 한 과목을 조정한다',effects:{stats:{study:1}},detail:'희망 순위를 고쳤다. 듣고 싶던 과목 하나는 다음 학기로 미뤘다.'},
     {label:'다른 분반이 있는지 담당 교사에게 묻는다',detail:'다른 분반은 이미 정원이 찼다. 선택지를 다시 살폈다.'},
     {label:'탐구와 토론 수업을 조합해 다시 신청한다',detail:'원래 계획은 바뀌었지만 수업 방식은 다양해졌다.'}
    ]}])
  ];
  const legacy=old.map(args=>{const x=S.exam('high',...args);x.event.when={turn:{lte:-1}};return x;});
  const stages=S.pack(
   arrival,
   S.branch(choiceAt('high:first-day',64,'처음 본 학급 단체 채팅방',
    '누군가 과제 공지를 대신 정리해 줄 사람을 찾는다. 처음이라 더 눈치가 보인다.',[
     {label:'시간표와 제출 날짜를 확인해 공지해 준다',effects:{stats:{study:2,relations:5,stress:2}},detail:'반 친구들의 첫 인상이 좋아졌다.'},
     {label:'친구에게 말을 걸고 같이 살펴본다',effects:{stats:{relations:4,stress:-2}},detail:'함께 적응하는 친구가 생겼다.'},
     {label:'내 일정부터 정리한다',effects:{stats:{study:3,stress:-2}},detail:'스스로 일정을 챙겼다.'}
    ]),[
  {id:'first-science',priority:30,when:{any:[{attributes:{schoolTrack:'science'}},{attributes:{schoolTrack:'gifted'}}]},
   title:'함께 풀 첫 탐구 과제',body:'입학 전 공동 문제풀이 기록을 나눠 정리해야 한다. 윤세아는 서로 다른 풀이의 가정을 확인하자고 한다.\n\n익숙하지 않은 심화 문제와 조별 기록을 어떻게 나눌까?',
   options:[
    {label:'세아와 풀이의 가정을 대조하고 역할을 나눈다',effects:{attributes:{highPeer:'세아'},stats:{relations:1}},detail:'서로 다른 가정을 표시해 공동 기록에 남겼다. 조원들과 다시 설명하느라 방과 후 시간이 줄었다.'},
    {label:'공통 문제풀이 기록의 누락부터 검토한다',effects:{attributes:{highPeer:'세아'},stats:{study:1}},detail:'기록의 빈칸을 찾아 다시 풀었다. 세아는 다음 문제의 검산을 맡았다.'}
   ]},
  {id:'first-social',priority:20,when:{stats:{relations:{gte:55}}},
   title:'첫 수행평가의 조 편성',body:'첫 수행평가의 조 편성 공지가 올라왔다. 최하린이 선택과목 안내와 제출 날짜가 서로 다르다고 알려 왔다.\n\n토론 경험이 있다면 자료 해석과 질의응답을 맡을 수도 있다.',
   options:[
    {label:'하린과 공지의 근거를 찾아 조원들에게 설명한다',effects:{attributes:{highPeer:'하린'},stats:{relations:1}},detail:'질문을 모아 담당 교사에게 확인했다. 조 편성은 정리됐지만 내 복습 시간은 줄었다.'},
    {label:'하린과 제출 기준을 대조해 내 일정을 정한다',effects:{attributes:{highPeer:'하린'},stats:{study:1}},detail:'서로 다른 날짜를 바로잡고 제출 계획을 적었다. 전체 설명은 다른 조원에게 맡겼다.'}
   ]},
  {id:'first-ordinary',priority:0,
   title:'공지 원문부터 확인하기',body:'박재호가 단체방에 수행평가 마감일을 올렸다. ==아직 수행평가가 시작도 안 했다.== 담임도 당황했다.',
   options:[
    {label:'재호와 공지 원문을 다시 확인한다',effects:{attributes:{highPeer:'재호'},stats:{relations:1}},detail:'재호가 날짜를 정정했다. 네가 놓친 준비물도 하나 있었다.'},
    {label:'내 시간표부터 정리하고 알림을 꺼둔다',effects:{attributes:{highPeer:'재호'},stats:{study:1}},detail:'재호의 메시지는 계속 왔다. 필요한 날짜만 달력에 적었다.'}
   ]}
 ]),
   examWithPrelude(16,1,65,'mock'),
   choiceAt('high:recover',65,'학교생활을 다시 조율한다',
    '시험과 여러 활동이 겹쳐 몸과 마음이 지쳤다. 부담을 나누고 쉬어 갈 방법을 찾자.',[
     {label:'상담 뒤 한 달 동안 학습량과 수면 시간을 조정한다',effects:{stats:{stress:-18}},detail:'상담만으로 달라지진 않았다. 과제 시간을 줄이고 잠드는 시간을 지키자 몇 주 뒤부터 버틸 여유가 생겼다.'},
     {label:'무리한 일정을 줄이고 실제로 며칠 휴식한다',effects:{stats:{stress:-12}},detail:'휴식 기간에는 밀린 일을 억지로 처리하지 않았다. 돌아와서 남은 과제부터 다시 순서를 잡았다.'},
     {label:'가족과 도움받을 수 있는 일과 없는 일을 나눠 본다',effects:{stats:{stress:-9,relations:1}},detail:'가족이 집안일 일부를 맡았다. 시험 걱정은 그대로지만 그동안 하던 일 하나는 내려놓을 수 있었다.'}
    ],{stats:{stress:{gte:75}}}),
   S.branch(choiceAt('high:commute',66,'아침부터 꼬인 학교 일정',
    '조회 시간까지 얼마 남지 않았다. 무엇부터 처리할까?',[
     {label:'다음 교통편을 알아보고 이동한다',detail:'뛰어봐야 길이 줄지는 않는다. 지각 사유를 정확히 적어 제출했다.'},
     {label:'같은 동네 친구와 이동 방법을 찾는다',effects:{stats:{relations:1}},detail:'함께 갈 수 있는 버스를 찾아 탔다. 조회에는 늦었지만 혼자는 아니었다.'}
    ]),[
     {id:'morning-lab',priority:30,when:{any:[{attributes:{schoolTrack:'science'}},{attributes:{schoolTrack:'gifted'}}]},
      title:'아침 탐구실에 빠진 안전 고글',
      body:'실험 준비 시간, 조원들이 실험실 앞에 모였다. 수업 전 안전 점검을 하니 네 고글이 안 보인다. ==가방 밑바닥에는 교과서만 있다.==',
      options:[
       {label:'담당 선생님에게 말하고 여분 보호구를 확인한다',effects:{stats:{relations:1}},detail:'실험실에 여분이 있었다. 선생님은 기록부에 장비 대여를 적고 들어오라고 했다.'},
       {label:'실험실 옆 사물함을 확인하고 담당 교사에게 알린다',risk:'실습 시작을 놓칠 수 있음',effects:{stats:{stress:2}},detail:'사물함에 고글이 있었다. 조금 늦게 합류했지만 안전 수칙을 지킬 수 있었다.'},
       {label:'오늘은 직접 실험 대신 기록 담당을 맡는다',effects:{stats:{study:1}},detail:'조원이 실험했고 너는 측정값을 정리했다. 신경 쓰였던 오차 하나를 찾아냈다.'}
      ]},
     {id:'morning-commute',priority:0,title:'등교 버스를 놓쳤다',
      body:countryside?'아침 버스가 막 떠났다. ==다음 배차는 25분 뒤.== 지각은 거의 확정이다.':'길 건너편에서 학교 가는 버스가 출발했다. ==교문 닫히기까지 10분.== 다음 차는 12분 뒤다.',
      options:[
       {label:'다음 차를 타고 지각 사유를 설명한다',detail:'결국 늦었다. 출결 담당 선생님이 교통 상황을 확인했고, 너는 바로 교실로 올라갔다.'},
       {label:'가족에게 태워 줄 수 있는지 묻는다',risk:'가족의 일정이 바뀔 수 있음',effects:{stats:{relations:1}},detail:'가족이 근처까지만 데려다줄 수 있었다. ==다음번엔 알람을 일찍 맞추라는 말==을 세 번 들었다.'},
       {label:'같이 놓친 친구와 우회 노선을 찾는다',effects:{stats:{relations:1}},detail:'지도에선 더 빠르다더니 두 정거장을 더 걸었다. 지각은 했지만 다음번 갈아탈 길은 알아냈다.'}
      ]}
    ]),
   branches,
   examWithPrelude(16,1,68,'school'),
   S.notice('high:age17',69,'고등학교 2학년','교과 선택과 진로, 친구 관계가 복잡해지기 시작했다.',{attributes:{age:17}}),
   S.branch(choiceAt('high:career',69,'가까운 친구의 고민',
    '친구가 학교생활과 진로에 대한 불안을 털어놓았다. 어떻게 이야기를 이어갈까?',[
     {label:'판단을 미루고 친구 이야기를 충분히 듣는다',effects:{stats:{relations:6,stress:1}},detail:'친구가 마음을 정리하는 데 함께했다.'},
     {label:'담임이나 상담 선생님께 도움을 청하자고 제안한다',effects:{stats:{relations:4,stress:-1}},detail:'상담받을 수 있는 방법을 함께 살폈다.'},
     {label:'산책하면서 다른 이야기도 나눈다',effects:{stats:{relations:3,stress:-2}},detail:'조금 편안한 시간을 보냈다.'}
    ]),[
  {id:'career-sea',priority:30,when:{attributes:{highPeer:'세아'}},
   title:'세아의 전공 수업 목록',body:'윤세아가 학과 안내서를 펴고 묻는다. "좋아하는 과목하고 잘하는 과목이 다르면 뭘 골라?"',
   options:[
    {label:'세아와 실제 전공 수업 목록을 살펴본다',tags:['team'],effects:{stats:{relations:1}},detail:'학과 이름보다 수업 내용이 훨씬 낯설었다. 세아도 목록에 표시했다.'},
    {label:'관심 수업의 선수 과목을 찾아본다',effects:{stats:{study:1}},detail:'필요한 과목을 적었지만 아직 희망 학과를 확정하진 않았다.'},
    {label:'아직 진로를 모르겠다고 인정한다',detail:'세아가 웃었다. 본인도 지망 학과를 세 번 고쳤다고 했다.'}
   ]},
  {id:'career-harin',priority:20,when:{attributes:{highPeer:'하린'}},
   title:'하린의 다음 탐구 방향',body:'최하린은 앞서 함께한 자료 해석 활동은 좋아했지만, 선택과목 계획에는 관심 없는 계열의 준비가 가득하다고 말한다.\n\n다음 탐구를 바꾸면 기존 기록을 이어갈 시간과 새 기초를 익힐 시간을 나눠야 한다.',
   options:[
    {label:'하린에게 실제로 해 보고 싶은 일을 물어본다',effects:{stats:{relations:1}},detail:'하린은 화려한 직업명을 지우고 하고 싶은 활동을 적었다.'},
    {label:'내 발표에서도 직업 대신 경험을 적는다',effects:{stats:{study:1}},detail:'희망 직업 칸은 비었다. 대신 해 보고 싶은 활동이 세 줄 늘었다.'},
    {label:'일단 제출부터 하고 나중에 고민한다',detail:'발표는 끝났다. 하린은 파일을 지우지 않고 남겼다.'}
   ]},
  {id:'career-jaeho',priority:0,
   title:'재호의 체험 신청서',body:'박재호가 직업 체험 신청서 앞에서 멈췄다. 인기 프로그램은 정원이 찼다. "나 줄 서 있었는데."',
   options:[
    {label:'재호와 다른 체험 프로그램을 찾아본다',effects:{stats:{relations:1}},detail:'원래 목표는 놓쳤지만 다른 분야 체험을 함께 신청했다.'},
    {label:'현직자 인터뷰 자료를 찾아본다',effects:{stats:{study:1}},detail:'일하는 일상을 읽고 예상했던 모습과 다른 부분을 발견했다.'},
    {label:'신청을 포기하고 다음 모집을 확인한다',detail:'신청서는 접었다. 다음 모집 날짜를 적었다.'}
   ]}
 ]),
   examWithPrelude(17,2,70,'mock'),
   S.branch(choiceAt('high:electives',71,'신청한 선택과목이 사라졌다',
    '신청자가 부족한 과목이 폐강 위기다. 희망표를 다시 작성해야 한다.',[
     {label:'학교 밖 공동교육과정을 알아본다',effects:{attributes:{electiveRoute:'shared'}},detail:'수업을 들을 수 있는 학교를 찾았지만 이동 시간이 문제였다. 상담을 예약했다.'},
     {label:'교내 대체 과목을 골라 시간표를 확정한다',effects:{attributes:{electiveRoute:'alternate'}},detail:'원래 과목은 포기했지만 비슷한 단원을 배울 수 있었다.'},
     {label:'같이 듣고 싶은 학생들을 모아 재개설을 요청한다',effects:{attributes:{electiveRoute:'petition'},stats:{relations:2}},detail:'==신청자가 늘어 재검토에 들어갔다.== 아직 개설 확정은 아니다. ~~이제 공부할 일만 남았다.~~'}
    ]),[
     {id:'research-slot',priority:30,when:{any:[{attributes:{schoolTrack:'science'}},{attributes:{schoolTrack:'gifted'}}]},
      title:'선택 탐구의 실험실 예약이 취소됐다',
      body:'학기 탐구 주제는 이미 정했는데 공동 실험실 예약이 취소됐다. ==발표까지 2주.== 다른 조도 장비가 필요하다.',
      options:[
       {label:'공용 장비 사용 시간을 조원들과 재배정한다',effects:{attributes:{electiveRoute:'shared'},stats:{relations:1}},detail:'다섯 조가 시간표를 고쳤다. 방과 후에 길게 기다리던 시간을 줄였다.'},
       {label:'실험 규모를 줄이고 검증 가능한 질문 하나만 남긴다',effects:{attributes:{electiveRoute:'alternate'},stats:{study:1}},detail:'제목은 덜 거창해졌다. ==대신 결론은 네가 직접 검증할 수 있다.=='},
       {label:'지도교사와 대체 실험실을 찾는다',effects:{attributes:{electiveRoute:'petition'}},detail:'다른 연구실 빈 시간이 나왔다. 지도교사는 안전교육을 먼저 다시 받으라고 했다.'}
      ]},
     {id:'regular-elective',priority:0,title:'다시 고르는 선택과목',
      body:'다음 학기 희망 과목 신청 결과가 나왔다. 그런데 신청 인원이 부족해 ==개설이 어려울 수 있다==는 공지가 붙었다.',
      options:[
       {label:'학교 밖 공동교육과정에서 같은 과목을 찾아본다',effects:{attributes:{electiveRoute:'shared'}},detail:'다른 학교에 강좌가 있었다. 통학 일정과 이수 조건을 확인했다.'},
       {label:'교내 대체 과목으로 변경한다',effects:{attributes:{electiveRoute:'alternate'}},detail:'관심 분야가 조금 달라졌지만 시간표는 완성됐다.'},
       {label:'친구들을 모아 개설을 요청한다',effects:{attributes:{electiveRoute:'petition'},stats:{relations:2}},detail:'==신청자가 늘어 과목 개설을 다시 검토하기로 했다.== ~~이제 수업을 들어야 한다.~~'}
      ]}
    ]),
   unique,
   S.selection('high:tobacco-offer',71,'옥상에서 들려온 권유',
    '점심시간 뒤. 복도에서 알게 된 선배가 나가자고 손짓한다. ==담배를 권하는 분위기다.==\n\n"한 번쯤은 괜찮다니까."\n\n~~괜찮다는 사람은 책임져 주지 않는다.~~',[
     {label:'싫다고 분명히 말하고 자리를 뜬다',risk:'선배와 잠시 어색해질 수 있음',
      effects:{traits:{add:['자기주장']},stats:{relations:-1}},
      detail:'"그래, 됐다." 선배는 더는 말을 걸지 않았다. ==관계는 잠깐 어색해졌지만 스스로 선을 지킨 기억이 남았다.=='},
     {label:'피우지 않겠다고 하고 친구와 함께 나온다',
      effects:{stats:{relations:1,stress:1}},
      detail:'친구도 따라 나왔다. "와, 저런 얘기 갑자기 하면 난감하네." 둘은 말없이 교실로 돌아왔다.'},
     {label:'거절하지 못하고 권유에 넘어간다',risk:'반복되면 정신병·재산에 지속적인 부담',
      effects:{stats:{},traits:{add:['흡연']}},
      detail:'처음에는 공짜 권유였지만 이후에도 같은 무리에 어울리며 반복했다. 몇 주 뒤에는 ==흡연 습관==이 남았다. 잠깐 거절하기 어려웠던 일이 계속 신경 쓸 일이 됐다.'}
   ]),
   S.branch(choiceAt('high:teamwork',72,'수행평가 전날, 조원 연락이 끊겼다',
    '발표가 내일인데 한 조원이 맡은 자료를 보내지 않는다. 단체방 분위기가 험악해진다.',[
     {label:'자료를 나눠서 재정리하고 발표를 준비한다',effects:{stats:{study:3,relations:4,stress:4}},detail:'불필요한 다툼 없이 발표 준비를 마쳤다.'},
     {label:'조원의 사정을 확인한다',effects:{stats:{relations:6,stress:2}},detail:'사정을 이해하고 역할을 조정했다.'},
     {label:'교사에게 현재 진행 상황을 정확히 알린다',effects:{stats:{study:3,stress:1}},detail:'상황을 정리해 전달했다.'}
    ]),[
  {id:'team-sea',priority:30,when:{attributes:{highPeer:'세아'}},
   title:'세아가 찾은 실험 오류',body:'윤세아가 실험 결과 파일을 열었다. 마지막 그래프의 단위가 틀렸다. ==이미 보고서를 인쇄했다.==',
   options:[
    {label:'세아와 원본 데이터를 다시 계산한다',tags:['team','science'],risk:'늦은 밤까지 재작업',
      effects:{stats:{study:3,stress:3}},
      detail:'세아와 측정값을 하나씩 대조해 단위 오류를 찾아냈다. 한밤중에 정정본을 인쇄했지만 다음 날 둘 다 피곤한 얼굴이었다.'},
     {label:'교사에게 오류를 알리고 정정본을 낸다',risk:'수정 기한을 넘겨 감점 가능',
      effects:{stats:{stress:1,relations:1}},
      detail:'정정 가능 여부를 물었더니 교사는 기록을 남기고 다시 내라고 했다. 감점 가능성은 남았지만 잘못된 데이터를 사실처럼 발표하지 않았다.'},
     {label:'틀린 그래프를 제외하고 확인된 자료만 낸다',risk:'발표 분량과 설득력이 줄어듦',
      effects:{stats:{stress:-1,schoolScore:-1}},
      detail:'그래프를 빼자 결론을 뒷받침할 설명도 줄었다. 질문 시간에 빠진 그래프의 이유를 설명하느라 진땀을 뺐다.'}
   ]},
  {id:'team-harin',priority:20,when:{attributes:{highPeer:'하린'}},
   title:'하린과 비어 있는 발표 자료',body:'최하린과 준비한 토론 발표에서 한 조원이 맡은 슬라이드를 보내지 않았다. 그런데 단체방 프로필 사진은 방금 바뀌었다.',
   options:[
    {label:'조원에게 필요한 자료와 마감을 명확히 전달한다',detail:'조원이 절반을 보내 왔다. 나머지는 너와 하린이 다시 확인했다.'},
    {label:'하린과 발표 분량을 줄여 마무리한다',tags:['team','humanities'],risk:'발표 완성도 일부를 포기',effects:{stats:{relations:2,schoolScore:-1},traits:{add:['친화력']}},detail:'지난 학기부터 함께 고친 자료를 다시 나눴다. 분량은 줄었지만 ==일을 나누고 마무리하는 습관==이 남았다.'},
    {label:'담당 교사에게 역할별 진행 상황을 알린다',detail:'교사는 작업 기록을 확인했다. 단체방은 며칠 동안 조용했다.'}
   ]},
  {id:'team-jaeho',priority:0,when:{attributes:{highPeer:'재호'}},
   title:'업로드 직전의 학교 이름',body:'박재호가 축제 홍보 영상 링크를 보냈다. 마지막 장면에 학교 이름이 틀렸다. 예약 업로드까지 ==30분 남았다.==',
   options:[
    {label:'재호와 마지막 장면을 다시 편집한다',tags:['team','arts'],risk:'출력하는 동안 내 과제 시간이 줄어듦',effects:{stats:{study:1,relations:1,stress:2}},detail:'오타를 고쳤다. 영상이 다시 출력되는 동안 둘 다 말을 안 했다.'},
    {label:'업로드 예약을 취소하고 수정본을 늦게 낸다',detail:'시간은 놓쳤지만 잘못된 학교 이름으로 퍼지지는 않았다.'},
    {label:'문제 장면을 통째로 삭제해 올린다',detail:'급한 불은 껐다. 갑자기 영상이 짧아진 이유를 댓글에서 물었다.'}
   ]}
 ]),
   examWithPrelude(17,2,73,'school'),
   S.notice('high:age18',74,'고등학교 3학년','졸업을 앞두고 있다. 공부뿐 아니라 사람들과의 시간도 중요해졌다.',{attributes:{age:18}}),
   examWithPrelude(18,3,75,'mock'),
   choiceAt('high:family-time',76,'토요일 오후에 걸려 온 가족의 전화',
    familyNeeds?'가족의 일이 겹쳐 집안일을 도와 달라는 전화가 왔다. 네게도 내일까지 끝내야 할 시험 준비가 남았다.':'가족이 오래전 잡은 모임에 오라고 한다. 일요일에는 공부하려고 했는데 돌아오는 시간이 늦어질 듯하다.',[
     {label:'필요한 시간만 돕고 돌아와 남은 과제를 마친다',effects:{stats:{relations:2,stress:2}},detail:'가족과 시간을 나눠 일을 마쳤다. 돌아왔을 때 책상 위 계획표에는 아직 빈칸이 있었다. ==오늘 밤은 조금 늦어졌다.=='},
     {label:'내일 일정이 있다며 대신 가능한 시간을 제안한다',effects:{stats:{study:2,relations:-1}},detail:'가족이 조금 아쉬워했다. 대신 공부 계획을 마무리했고, 다음 주엔 함께하기로 했다.'},
     {label:'오늘은 가족과 함께 보내고 내일 계획을 다시 짠다',effects:{stats:{stress:-3,relations:2,study:-1}},detail:'오랜만에 같이 저녁을 먹었다. ==머릿속은 조금 가벼워졌지만 공부는 내일로 밀렸다.=='}
    ]),
   {...S.selection('high:smoking-followup',76,'남아 있는 습관',
    '어느 날 계단에서 숨이 차다는 걸 느꼈다. 예전의 선택이 ==가끔이 아니라 습관==이 됐다는 걸 깨달았다. 도움을 구할 수 있는 곳이 있다.',[
      {label:'상담과 주변의 도움을 받아 끊는 데 시간을 쓴다',effects:{stats:{stress:2},traits:{remove:['흡연']}},detail:'몇 달 동안 도움을 받고 생활을 바꿨다. ==흡연 특성이 사라졌다.== 이미 사용한 돈과 지나간 시간은 돌아오지 않는다.'},
      {label:'혼자 미루다가 다시 도움을 찾아본다',effects:{stats:{stress:2}},detail:'한 번에 해결되진 않았다. 상담 안내를 다시 찾아 봤다. 흡연 습관은 아직 남아 있다.'},
      {label:'아직은 바꿀 생각이 없다',effects:{stats:{stress:1}},detail:'일상이 달라지는 줄 알면서도 미뤘다. 이후의 부담은 계속된다.'}
    ]),event:{...S.selection('high:smoking-followup',76,'','',[{label:'확인'}]).event,when:{turn:{eq:76},traits:['흡연']}}},
   choiceAt('high:graduation-photo',77,'졸업앨범 촬영 날',
    '담임이 열 번 넘게 줄을 맞추라 했는데 뒷줄 친구들은 계속 장난을 친다. ==마지막 사진이라고 다들 갑자기 친한 척한다.==',[
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
      title:'모의고사와 지원 서류',body:'최근 모의고사 결과가 꾸준하다. 그런데 원서 상담에서는 내신과 전형별 준비가 빠졌다고 지적했다. ==점수 하나로 지원전략은 결정되지 않는다.==',
      options:[
       {label:'모의고사 대비를 유지하면서 지원 가능 전형을 분석한다',effects:{attributes:{preExamStrategy:'balanced'}},detail:'모의고사 준비를 이어가기로 했다. 동시에 지원 일정과 제출 서류를 표로 정리했다.'},
       {label:'기출 풀이 시간을 늘리는 계획을 짠다',effects:{attributes:{preExamStrategy:'exam'}},detail:'오답 유형을 추려 주간 계획에 적었다. 아직 수능 점수가 나온 것은 아니다.'},
       {label:'학교 기록과 면접 준비 내용을 먼저 검토한다',effects:{attributes:{preExamStrategy:'record'}},detail:'학교 활동 기록과 희망 전형의 요건을 대조했다. 보완할 항목 몇 개를 발견했다.'}
      ]},
     {id:'csat-record-strength',priority:10,when:{stats:{schoolScore:{gte:67}}},
      title:'내신을 활용할 준비',body:'내신은 잘 관리했지만 모의고사는 들쭉날쭉하다. 상담실에서는 어느 전형도 합격이 확정된 건 아니라고 했다.',
      options:[
       {label:'내신 활용 전형의 제출 일정과 자격을 점검한다',effects:{attributes:{preExamStrategy:'record'}},detail:'학교 기록을 확인하고 서류 누락이 없도록 체크했다.'},
       {label:'모의고사 취약 단원부터 남은 계획을 다시 쓴다',effects:{attributes:{preExamStrategy:'exam'}},detail:'틀린 유형을 묶어 계획을 세웠다. 다음 점수는 아직 모른다.'},
       {label:'지원 일정과 수능 준비를 나눠 진행한다',effects:{attributes:{preExamStrategy:'balanced'}},detail:'원서 일정표와 공부 계획을 따로 적었다. 빽빽하지만 하나씩 확인할 수 있게 됐다.'}
      ]},
     {id:'csat-open-plan',priority:0,
      title:'내가 고르는 입시 준비',body:'수능이 가까워지자 교실에서 대학 이름이 대화의 절반을 차지한다. 너는 누가 정해 준 답 대신 지금 할 수 있는 일을 골라야 한다.',
      options:[
       {label:'기출문제의 자주 틀리는 유형을 우선 정리한다',effects:{attributes:{preExamStrategy:'exam'}},detail:'오답 원인을 세 갈래로 나눠 적었다. 실력이 하루 만에 오른 것은 아니다.'},
       {label:'학교 활동과 지원 전형을 먼저 비교한다',effects:{attributes:{preExamStrategy:'record'}},detail:'지원 가능한 전형과 필요한 기록을 정리했다. 빈칸은 담당 선생님에게 확인할 예정이다.'},
       {label:'무리한 계획을 줄이고 두 준비를 번갈아 한다',effects:{attributes:{preExamStrategy:'balanced'}},detail:'할 수 있는 분량만 정했다. 당장 성적이 바뀌진 않았지만 일정표는 완성했다.'}
      ]}
    ]),
   S.notice('high:graduation',88,'고등학교를 졸업했다',
    '시험과 관계, 선택한 과목과 원서 결과가 남았다. 다음 이야기는 대학·사회생활에서 이어진다.',{
     attributes:{age:19,job:'고교 졸업'},schools:[{kind:'high',status:'graduated'}]
    }),
   legacy
  );
  // First-attempt graduation is skipped while preparing for a second admission year.
   stages.events.find(event=>event.id==='high:graduation').when={
    all:[{attributes:{admissionAttempts:1}},{not:{attributes:{admissionDestination:'retry'}}}]
   };
   stages.events.find(event=>event.id==='high:graduation').result.conditional=[
    {when:{attributes:{admissionDestination:'college'}},result:{effects:{attributes:{job:'대학 입학 예정'}}}},
    {when:{attributes:{admissionDestination:'employment'}},result:{effects:{attributes:{job:'사회 진출 준비'}}}}
   ];
   // Each elective route has a later, deterministic consequence in an existing news slot.
  const senior=stages.events.find(event=>event.id==='high:age18');
  senior.result.conditional=[
   {when:{attributes:{electiveRoute:'shared'}},result:{effects:{stats:{study:2,stress:2}},history:{title:'다른 학교에서 보낸 한 학기',detail:'공동교육과정 수업을 마쳤다. 이동 일정은 빠듯했지만 학교에 없던 단원을 끝까지 배웠다.'}}},
   {when:{attributes:{electiveRoute:'alternate'}},result:{effects:{stats:{stress:-2}},history:{title:'바꾼 시간표가 자리를 잡았다',detail:'대체 과목에 맞춰 일정을 지켰다. 원래 희망한 수업은 못 들었지만 방과 후를 무리하게 채우지 않았다.'}}},
   {when:{attributes:{electiveRoute:'petition'}},result:{effects:{stats:{relations:1}},history:{title:'함께 요청했던 수업의 뒷이야기',detail:'학교에서 바로 개설해 주지는 못했다. 대신 학생들과 교사가 소규모 탐구 모임을 꾸려 한 학기를 함께했다.'}}}
  ];
  // Science-school choices describe lab access rather than an invented commute.
  for(const branch of senior.result.conditional)branch.when={all:[branch.when,{not:{any:[{attributes:{schoolTrack:'science'}},{attributes:{schoolTrack:'gifted'}}]}}]};
  // New scripts extend the same slots; existing saved scenario IDs remain valid.
  const modes=[
   {id:'media',traits:['예체능'],requirement:'예체능 또는 영상 제작 경험',role:'영상으로 설명하는 사람',
    action:'쌓아온 편집 경험으로 비교 영상을 만든다',tags:['arts'],stats:{study:-1,relations:3,stress:2},
    detail:'예전에 만든 영상의 구성을 꺼내 새 자료를 붙였다. 긴 발표 대신 비교 장면으로 설명했다. 친구들은 다음 행사 영상도 부탁했지만 네 복습은 하루 밀렸다.'},
   {id:'science',traits:['이과','꼼꼼함'],requirement:'이과·꼼꼼함 또는 탐구 기록 경험',role:'기록으로 검증하는 사람',
    action:'이전 탐구 기록과 검산표로 근거를 다시 맞춘다',tags:['science'],stats:{study:3,stress:1,relations:-1},
    detail:'남겨 둔 측정 기록의 형식이 새 자료를 검증할 시간을 아껴 줬다. 확인한 근거만 고쳐 제출했다. 보기 좋은 발표를 원하던 조원과는 끝까지 의견이 달랐다.'},
   {id:'humanities',traits:['문과','언변'],requirement:'문과·언변 또는 토론 준비 경험',role:'질문으로 설득하는 사람',
    action:'토론 때 연습한 질의응답으로 발표를 다시 짠다',tags:['humanities'],stats:{study:1,relations:3,stress:2},
    detail:'긴 슬라이드를 줄이고 예상 질문을 나눴다. 반복해서 받아 본 반론이 이번에는 답변이 됐다. 발표 연습 때문에 개인 공부는 늦게 시작했다.'},
   {id:'sports',traits:['체육'],requirement:'체육 또는 대표팀 훈련 경험',role:'시연으로 보여주는 사람',
    action:'체육 활동에서 익힌 동작 시연을 비교 자료로 쓴다',tags:['sports'],stats:{study:-1,relations:4,stress:1},
    detail:'움직임을 직접 시연하며 원리를 설명했다. 꾸준히 연습한 동작이라 새 대본을 외울 필요는 적었다. 리허설에 쓴 시간만큼 문제풀이가 밀렸다.'},
   {id:'organizing',traits:['리더십','친화력'],requirement:'리더십 또는 친화력',role:'사람을 모아 마무리하는 사람',
    action:'친구들이 잘하는 일을 나눠 역할을 다시 맡긴다',tags:['team'],stats:{study:1,relations:3,stress:1},
    detail:'혼자 채울 분량을 친구들에게 나눠 맡겼다. 쌓아 둔 신뢰 덕에 이번 마감은 지켰다. 다음번 조 편성에서는 모두 네 이름부터 불렀다.'}
  ];
  const modeWhen=mode=>({any:[{attributes:{projectSkill:mode.id}},...mode.traits.map(trait=>({traits:[trait]}))]});
  const ready={all:[{stats:{stress:{lte:75}}},
   {any:[{stats:{schoolScore:{gte:65}}},{traits:['언변']}]}]};
  const spotlight={id:'spotlight',label:'대표 발표를 맡고 남은 기간 전부 걸어 본다',
   outlook:'대표 발표 기회 · 내신 지수 65 이상 또는 언변이 준비에 도움 · 정신병 수치 75 이하일 때 성과를 낼 수 있습니다',
   risk:'다른 공부 시간을 비우고 연습을 떠맡음',
   effects:{stats:{study:-2,stress:7},attributes:{projectStyle:'spotlight'}},
   detail:'최종 발표 명단에 이름을 올리고 며칠간 원고와 시연을 고쳤다. 내 시험 공부는 뒤로 밀렸다.',
   conditional:[
    {when:ready,result:{effects:{stats:{schoolScore:4,relations:6},attributes:{projectResult:'recognized',projectObligation:'speaking',schoolRole:'대표 발표 경험'}},
     history:{title:'준비했던 말이 통했다',detail:'질문이 나와도 연습한 근거로 답했다. 교사는 다음 공개 발표도 부탁했다. 좋은 평가를 받았지만 줄여 둔 공부량은 따로 메워야 한다.'}}},
    {when:{not:ready},result:{effects:{stats:{schoolScore:-2,relations:-2},attributes:{projectResult:'overextended',projectObligation:'none',schoolRole:'무리했던 대표 발표'}},
     history:{title:'혼자 맡은 분량이 남았다',detail:'연습이 끝나지 않았는데 체력부터 바닥났다. 질문에 답하지 못한 부분이 평가에 남았다. 친구에게 넘겼어야 할 일까지 붙들고 있었다.'}}}
   ]};
  const protect={id:'protect',label:'확인된 자료만 묶어 내고 내 시험 준비를 지킨다',
   effects:{stats:{study:4,stress:1,relations:-2},attributes:{projectStyle:'study',projectResult:'limited',projectObligation:'none',schoolRole:'학업 집중'}},
   detail:'발표 분량은 작아졌다. 너는 남은 단원을 복습했지만 조원들은 더 해 볼 수 있지 않았냐고 말했다.'};
  const commonBody='수행평가 발표와 축제 준비가 같은 주에 잡혔다. 자료 일부는 비었고, 내 시험 범위도 남았다. 주제는 학교생활 속 문제 하나를 근거로 설명하는 것이다.\n\n담당 교사는 영상·실물 시연·질의응답 중 설명에 맞는 형식을 골라도 된다고 했다. ==남은 방과 후는 사흘이다.==';
  const projectPaths=scripts=>S.paths(stages,'high:teamwork',scripts);
  projectPaths([{id:'project-open',priority:40,title:'마감을 앞두고, 어떤 방식으로 풀까?',body:commonBody,
   options:[spotlight,{id:'specialty',label:'쌓아온 활동 경험으로 다른 발표 형식을 쓴다',requirement:'적성 특성 또는 동아리 대표 활동 경험',when:{any:modes.map(modeWhen)},
    effects:{attributes:{projectStyle:'experience'}},detail:'활동 경험을 살릴 수 있는지 확인했다.'},protect]}]);
  for(const mode of modes){
   const special={id:'specialty',label:mode.action,requirement:mode.requirement,when:modeWhen(mode),tags:mode.tags,
    effects:{stats:mode.stats,attributes:{projectStyle:mode.id,projectResult:'delivered',projectObligation:mode.id,schoolRole:mode.role}},detail:mode.detail};
   const script={title:'마감을 앞두고, 어떤 방식으로 풀까?',body:commonBody,options:[spotlight,special,protect]};
   const practiced=JSON.parse(JSON.stringify(special));
   practiced.requirement=mode.role+' · 심화 경험';
   practiced.effects.stats={...mode.stats,study:(mode.stats.study||0)+1,stress:Math.max(0,(mode.stats.stress||0)-1),relations:(mode.stats.relations||0)+1};
   practiced.detail='중학교 때 끝까지 맡아 본 작업의 순서와 자료가 남아 있었다. 처음부터 다시 배우지 않고 그 방법을 꺼냈다. '+mode.detail;
   projectPaths([
    {...script,id:'project-'+mode.id,priority:50,when:modeWhen(mode)},
    {...script,options:[spotlight,practiced,protect],id:'project-experienced-'+mode.id,priority:90,when:{attributes:{projectSkill:mode.id}}}
   ]);
  }
  const boundaries={any:[{traits:['자기주장']},{traits:['리더십']}]};
  for(const [id,description] of [['media','지난번 영상이 좋았다며 다른 반에서도 편집을 부탁했다'],['science','탐구 기록을 잘 정리했다며 새 보고서의 검토 부탁이 왔다'],['humanities','다음 행사에서도 질의응답을 맡아 달라는 부탁이 왔다'],['sports','학교 행사 시연을 한 번 더 맡아 달라는 부탁이 왔다'],['organizing','다음 행사까지 네가 조율해 달라는 부탁이 왔다'],['speaking','공개 발표를 맡아 달라는 부탁이 다시 왔다']]){
   S.paths(stages,'high:family-time',[{id:'reputation-obligation-'+id,priority:50,when:{attributes:{projectObligation:id}},
    title:'잘해 놓은 일이 다시 돌아왔다',body:description+'. ==이번엔 시험 준비 기간이다.==\n\n한 번 잘한 일이 다음 일정까지 비워 주지는 않았다.',
    options:[
     {id:'accept',label:'요청을 전부 맡아 사람들과의 약속을 지킨다',effects:{stats:{relations:4,study:-3,stress:5},attributes:{projectObligation:'fulfilled'}},detail:'맡은 일은 끝냈다. 고맙다는 말도 들었다. 대신 시험 전날까지 빈 단원을 메워야 했다.'},
     {id:'negotiate',label:'쌓아온 조율 경험으로 범위를 나눠 맡긴다',requirement:'자기주장 또는 리더십',when:boundaries,tags:['team'],
      effects:{stats:{relations:2,study:-1,stress:1},attributes:{projectObligation:'shared'}},detail:'이번에 가능한 분량을 먼저 정하고 나머지는 나눠 맡겼다. 모든 사람이 만족하진 않았지만 약속도 공부도 일부 지켰다.'},
     {id:'decline',label:'이번에는 거절하고 내 시험 계획을 지킨다',effects:{stats:{study:3,stress:-2,relations:-3},attributes:{projectObligation:'declined'}},detail:'다른 사람을 찾겠다는 짧은 답장이 왔다. 공부할 시간은 남았다. 다음 행사 이야기는 당분간 네가 없는 단체방에서 이어졌다.'}
    ]}]);
  }
  S.paths(stages,'high:tobacco-offer',[{id:'senior-invitation',priority:50,
   title:'점심시간 뒤의 십 분',
   body:'몇 번 인사하던 선배들이 점심 뒤에 같이 있자고 한다. 친구 하나도 따라 나왔다. 한 선배가 담배를 권하며 말을 건넨다.\n\n교실로 돌아가면 밀린 과제를 해야 한다. 여기서는 별것 아닌 얘기에도 다들 웃는다.',
   options:[
    {label:'약속이 있다며 돌아가 밀린 과제를 정리한다',effects:{stats:{study:1,relations:-1},attributes:{habitStage:'away'}},detail:'네가 돌아오자 교실에는 몇 명만 남아 있었다. 과제를 마쳤다. 선배들끼리 찍은 사진은 나중에 단체방에서 봤다.'},
    {label:'권유는 넘기고 친구와 잠깐 이야기하다 나온다',effects:{stats:{relations:1},attributes:{habitStage:'away'}},detail:'다음 교시 선생님 얘기를 하다 친구와 교실로 돌아왔다. 특별한 약속은 잡지 않았다.'},
    {label:'한 번쯤은 괜찮겠다며 담배 권유를 받아들이고 남는다',effects:{stats:{relations:3,stress:-2},attributes:{habitStage:'first'}},detail:'권유를 받아들인 뒤 시험 얘기 대신 시답잖은 농담을 했다. 다음날 선배가 네 이름을 먼저 불렀다. 쉬는 시간에 다시 볼 것 같은 분위기였다.'}
   ]}]);
  const notResearch={not:{any:[{attributes:{schoolTrack:'science'}},{attributes:{schoolTrack:'gifted'}}]}};
  stages.events.find(e=>e.id==='high:tobacco-offer').when=notResearch;
  const smoking=stages.choices.find(c=>c.id==='high:tobacco-offer');
  const invitation=smoking.variants.find(v=>v.id==='senior-invitation');
  invitation.body='방과 후 선배와 친구가 잠깐 이야기를 나누고 있다. 같은 수업 이야기에 웃다가 선배가 담배를 권한다.\n\n곧 집에 가야 한다. 권유를 넘기거나 한 번 받아들이고 먼저 돌아갈 수 있다.';
  const accept=invitation.options.pop();accept.label='한 번만 받아들이고 먼저 자리를 나온다';accept.result.effects={stats:{relations:2,stress:-1},attributes:{habitStage:'first'}};accept.result.conditional=[{before:true,when:{stats:{stress:{gte:70}}},result:{effects:{traits:{add:['흡연']},attributes:{habitStage:'revealed'}},history:{title:'흡연 습관이 시작됐다',detail:'짧은 만남 이후에도 같은 권유를 찾게 됐다. 정신병과 재산에 주기적인 부담이 남는다.'}}}];invitation.options.unshift(accept);
  invitation.options[1].result.effects.stats={relations:-1,stress:-1};invitation.options[2].result.effects.stats={relations:1,stress:1};
  const routine=choiceAt('high:break-routine',73,'점심 뒤, 익숙해진 자리',
   '점심을 먹고 나면 선배들이 먼저 연락한다. ==시험이 끝난 날에도 같은 자리에 모였다.== 선배가 아무렇지 않게 또 담배를 권한다.\n\n오늘은 반 친구가 같이 운동장에 가자고 한다. 쉬는 시간을 어디에 쓸까?',[
    {id:'repeat',label:'지난번처럼 권하는 담배를 받아들이고 모임을 계속 간다',effects:{stats:{relations:2,stress:-2},attributes:{habitStage:'routine'}},detail:'며칠이 몇 주가 됐다. 모임에서 담배를 피우는 날이 늘었고 수업 전에 급히 돌아오는 일도 익숙해졌다.'},
    {id:'occasional',label:'권유는 넘기고 가끔만 만나며 반 친구들과도 지낸다',effects:{stats:{relations:1,study:1},attributes:{habitStage:'occasional'}},detail:'모든 연락에 나가지는 않았다. 교실에 남은 날에는 친구와 과제를 먼저 마쳤다.'},
    {id:'leave',label:'오늘부터 다른 약속을 잡고 그 모임에는 나가지 않는다',effects:{stats:{relations:-1,stress:1,study:1},attributes:{habitStage:'away'}},detail:'처음 며칠은 심심했다. 연락은 조금씩 줄었고 점심 뒤 시간이 다시 비었다.'}
   ],{attributes:{habitStage:'first'}});
  routine.event.when={all:[notResearch,routine.event.when]};
  const repeat=routine.choice.options[0];repeat.result.effects.stats={relations:2,stress:-1};
  repeat.result.conditional=[{before:true,when:{traits:['인내심']},result:{effects:{attributes:{habitStage:'grace'}}}},{before:true,when:{withoutTraits:['인내심']},result:{effects:{traits:{add:['흡연']},attributes:{habitStage:'revealed'}}}}];
  const reconsider=choiceAt('high:smoking-reconsider',74,'다시 생각할 마지막 약속','인내심으로 잠시 거리를 뒀지만 다시 연락이 왔다. 이번에도 반복할지 결정해야 한다.',[{id:'repeat',label:'다시 권유를 받아들인다',effects:{traits:{add:['흡연']},stats:{stress:1},attributes:{habitStage:'revealed'}},detail:'다시 반복한 생활이 흡연 습관으로 남았다.'},{id:'leave',label:'거절하고 모임에서 거리를 둔다',effects:{stats:{relations:-1,stress:1},attributes:{habitStage:'away'}},detail:'연락을 줄이고 다른 약속을 잡았다.'}],{all:[notResearch,{attributes:{habitStage:'grace'}}]});
  stages.events.push(reconsider.event);stages.choices.push(reconsider.choice);
  stages.events.push(routine.event);stages.choices.push(routine.choice);
  senior.result.conditional.push({when:{all:[notResearch,{attributes:{habitStage:'routine'}}]},result:{
   effects:{stats:{money:-12000,stress:3},traits:{add:['흡연']},attributes:{habitStage:'revealed'}},
   history:{title:'짧던 쉬는 시간이 길어졌다',detail:'처음에는 선배를 따라 잠깐 나갔을 뿐이었다. 몇 달 뒤, 계단에서 숨을 고르다가 쉬는 시간과 지출이 전부 그 습관에 맞춰진 걸 깨달았다. ==이제는 어울리는 자리보다 흡연 습관 자체가 남아 있었다.=='}}});
  S.paths(stages,'high:smoking-followup',[{id:'habit-aftermath',priority:50,when:{traits:['흡연']},
   title:'시험보다 먼저 떠오르는 쉬는 시간',body:'중간에 자꾸 자리를 뜨니 복습 흐름이 끊긴다. 지출도 눈에 띈다. ==한 번의 선택보다 반복한 생활이 더 크게 남았다.==\n\n익숙한 모임과 생활을 어떻게 바꿀까?',
   options:[
    {label:'주변 도움을 받아 몇 주간 생활과 만나는 약속을 바꾼다',effects:{stats:{stress:6,relations:-1},traits:{remove:['흡연']},attributes:{habitStage:'stopped'}},detail:'몇 주간 도움을 받으며 생활을 바꿨다. 선배들을 만나는 횟수도 줄었다. 처음에는 불편했지만 습관에 끌려 자리를 뜨는 일은 멈췄다. 이미 쓴 돈과 놓친 시간은 남았다.'},
    {label:'일단 모이는 횟수부터 줄이며 혼자 조절해 본다',effects:{stats:{stress:2,relations:-1},attributes:{habitStage:'limited'}},detail:'일부 약속은 줄였다. 공부 시간을 조금 되찾았지만 습관이 사라진 것은 아니었다.'},
    {label:'시험이 끝나면 생각하기로 하고 원래 모임을 유지한다',effects:{stats:{relations:1,stress:-2,study:-1},attributes:{habitStage:'entrenched'}},detail:'당장의 불편은 덜었다. 그런데 교재를 펼쳐 둔 시간과 실제로 공부한 시간의 차이는 줄지 않았다.'}
   ]}]);
  const research=stages.choices.find(c=>c.id==='high:electives').variants.find(v=>v.id==='research-slot');
  research.options[0].label='검증된 자료로 범위를 줄여 마무리한다';research.options[0].result.effects={attributes:{electiveRoute:'alternate'},stats:{stress:-2}};research.options[0].result.history.detail='추가 실험을 포기하고 이미 검증한 자료로 질문을 좁혔다. 보고서의 범위는 작아졌지만 마감은 지켰다.';
  research.options[1].label='다른 조와 사용 시간을 교환한다';research.options[1].result.effects={attributes:{electiveRoute:'petition'},stats:{relations:2,stress:2}};research.options[1].result.history.detail='다른 조와 필요한 장비 시간을 바꿨다. 저녁 일정은 빠듯해졌지만 서로의 측정을 끝낼 수 있었다.';
  research.options[2].label='작은 추가 소모품을 마련해 대체 실험을 준비한다 (5천 원)';research.options[2].when={stats:{money:{gte:5000}}};research.options[2].result.effects={attributes:{electiveRoute:'shared'},stats:{money:-5000,schoolScore:2,stress:2}};research.options[2].result.history.detail='교내 장비 사용료 대신 직접 필요한 소형 소모품을 마련했다. 실험 범위를 바꿔 측정을 끝냈다.';
  const finalExam=stages.choices.find(choice=>choice.presentation?.annual&&choice.presentation.grade===3&&choice.presentation.category==='school');
  for(const option of finalExam.options)(option.result.conditional??=[]).push({when:{attributes:{habitStage:'entrenched'}},result:{
   effects:{stats:{schoolScore:-2,stress:2}},history:{title:'비워 둔 복습 시간',detail:'쉬는 시간마다 흐름이 끊겨 끝내 못 본 단원이 있었다. 시험에서 그 부분을 만나자 떠올릴 근거가 부족했다. 미뤘던 생활의 부담이 이번에는 성적에 남았다.'}}});
  const byId=id=>stages.choices.find(c=>c.id===id);
  routine.choice.options[1].result.effects.stats={relations:2,stress:2};routine.choice.options[2].result.effects.stats={relations:-1,stress:-1};
  const habit=byId('high:smoking-followup').variants.find(v=>v.id==='habit-aftermath');habit.options[1].result.effects.stats.schoolScore=1;habit.options[2].result.effects.stats.schoolScore=-1;
  for(const v of byId('high:first-day').variants){v.options[0].result.effects.stats={relations:2,stress:2};v.options[1].result.effects.stats=v.id==='first-science'?{schoolScore:.5,stress:1,relations:-1}:{stress:-1,relations:-1};}
  byId('high:commute').options[0].result.effects={stats:{relations:-1}};
  const commute=byId('high:commute').variants;const bus=commute.find(v=>v.id==='morning-commute');bus.options[0].result.effects={stats:{relations:-1,stress:-1}};bus.options[1].result.effects.stats={relations:1,stress:1};bus.options[2].result.effects.stats={relations:2,stress:2};const lab=commute.find(v=>v.id==='morning-lab');lab.options[0].result.effects.stats={relations:1,stress:2};lab.options[1].result.effects.stats={stress:1};lab.options[2].result.effects={stats:{schoolScore:.5,relations:-1}};
  const harin=byId('high:career').variants.find(v=>v.id==='career-harin');harin.options[0].label='하린과 앞선 활동을 대조해 다음 탐구 방향을 정한다';harin.options[0].result.history.detail='자료를 해석할 때 즐거웠던 부분을 함께 적었다. 새 탐구 질문을 고르느라 내 계획 점검은 늦어졌다.';harin.options[1].label='희망 계열의 선수 과목에 맞춰 내 계획을 고친다';harin.options[1].result.history.detail='현재 활동과 모집 계열을 비교하고 필요한 과목을 적었다. 친구의 계획까지 함께 볼 시간은 부족했다.';harin.options[2].label='현재 탐구를 마무리하고 상담을 다음으로 미룬다';harin.options[2].result.history.detail='당장의 제출 부담은 덜었다. 하린은 다른 친구와 다음 활동 계획을 정하기로 했다.';
  for(const v of byId('high:career').variants){v.options[0].result.effects.stats={relations:2,stress:1};v.options[1].result.effects={attributes:{admissionField:v.id==='career-sea'?'science':'humanities'},stats:{relations:-1,stress:-1}};v.options[2].result.effects={stats:{relations:-2,stress:-2}};}
  const team=byId('high:teamwork').variants;
  team.find(v=>v.id==='team-harin').options[0].result.effects={stats:{relations:3,stress:4}};team.find(v=>v.id==='team-harin').options[0].result.tags=['team','humanities'];team.find(v=>v.id==='team-harin').options[1].result.effects.stats.stress=2;team.find(v=>v.id==='team-harin').options[2].result.effects={stats:{relations:-1,stress:-1}};
  team.find(v=>v.id==='team-jaeho').options[1].result.effects={stats:{schoolScore:-1,stress:-2}};team.find(v=>v.id==='team-jaeho').options[2].result.effects={stats:{relations:-1,stress:-1}};
  byId('high:bdja-science').variants[0].options[2].result.effects={stats:{schoolScore:.5,stress:-1,relations:-1}};
  byId('high:whimoon-electives').variants[0].options[1].label='담당 교사와 대체 분반·공동교육과정을 확인한다';byId('high:whimoon-electives').variants[0].options[1].result.history.detail='교내 분반만으로는 맞출 수 없어 공동교육과정의 빈 강좌와 이수 조건을 확인했다. 다음 학기 다른 학교 수업을 신청했다.';
  byId('high:whimoon-electives').variants[0].options.forEach((o,i)=>o.result.effects={attributes:{electiveRoute:['alternate','shared','petition'][i]},stats:[{stress:-1,relations:-1},{stress:2},{relations:2,stress:2}][i]});
  byId('high:graduation-photo').options.forEach((o,i)=>o.result.effects=i===0?{stats:{relations:2,stress:1}}:i===1?{attributes:{preExamStrategy:'record'},stats:{stress:1}}:{stats:{relations:-1,stress:-1}});
  S.schoolwork(stages,{"high:age18":"schoolScore","high:teamwork": "schoolScore", "high:bdja-science": "schoolScore", "high:track-general": "schoolScore", "high:track-autonomous": "schoolScore", "high:track-autonomous-public": "schoolScore", "high:track-foreign": "schoolScore", "high:track-international": "schoolScore", "high:track-gifted": "schoolScore", "high:track-science": "schoolScore", "high:track-vocational": "schoolScore"});
  const recovery=stages.choices.find(c=>c.id==='high:recover');
  recovery.options.push({id:'ignore',label:'그냥 넘기고 하던 일정을 계속한다',result:{effects:{},history:{title:'회복을 미뤘다',detail:'이번에는 일정을 바꾸지 않았다. 쌓인 부담도 그대로 남았다.'}}});
  return {...stages,attributes:{projectStyle:{label:'수행평가 해결 방식',hidden:true},projectResult:{label:'수행평가 결과',hidden:true},projectObligation:{label:'다음 부탁',hidden:true},habitStage:{label:'쉬는 시간의 선택',hidden:true},highPeer:{label:'고등학교 첫 인연',hidden:true},preExamStrategy:{label:'수능 이전 준비 전략',hidden:true},electiveRoute:{label:'고교 과목 및 탐구 선택 경로',hidden:true}}};
 }
});
})(window);
