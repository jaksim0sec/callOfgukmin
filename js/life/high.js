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
   // The first mock score inherits accumulated study, not a flat 45 for every school.
   const arrival=S.notice('high:welcome',64,'고등학교에 입학했다',
    '고등학교 첫 시간표가 나왔다. 중학교 때 쌓아 온 기초는 그대로지만, 평가 방식은 달라졌다.',
    {activate:{exam:45}});
   const tracks=['science','gifted'];
   const notElite={not:{any:tracks.map(schoolTrack=>({attributes:{schoolTrack}}))}};
   const band=(from,until)=>({all:[notElite,{stats:{study:{gte:from}}},...(until?[{not:{stats:{study:{gte:until}}}}]:[])]});
   arrival.result.conditional=[
    {when:{attributes:{schoolTrack:'science'}},result:{effects:{stats:{exam:35}}}},
    {when:{attributes:{schoolTrack:'gifted'}},result:{effects:{stats:{exam:40}}}},
    {when:band(85,null),result:{effects:{stats:{exam:32}}}},
    {when:band(70,85),result:{effects:{stats:{exam:23}}}},
    {when:band(55,70),result:{effects:{stats:{exam:12}}}}
   ];
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
   arrival,
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
     {label:'상담 뒤 한 달 동안 학습량과 수면 시간을 조정한다',effects:{stats:{stress:-18,health:2}},detail:'상담만으로 달라지진 않았다. 과제 시간을 줄이고 잠드는 시간을 지키자 몇 주 뒤부터 버틸 여유가 생겼다.'},
     {label:'무리한 일정을 줄이고 실제로 며칠 휴식한다',effects:{stats:{stress:-12,health:4}},detail:'휴식 기간에는 밀린 일을 억지로 처리하지 않았다. 돌아와서 남은 과제부터 다시 순서를 잡았다.'},
     {label:'가족과 도움받을 수 있는 일과 없는 일을 나눠 본다',effects:{stats:{stress:-9,relations:1}},detail:'가족이 집안일 일부를 맡았다. 시험 걱정은 그대로지만 그동안 하던 일 하나는 내려놓을 수 있었다.'}
    ],{stats:{stress:{gte:75}}}),
   S.branch(choiceAt('high:commute',66,'아침부터 꼬인 학교 일정',
    '조회 시간까지 얼마 남지 않았다. 무엇부터 처리할까?',[
     {label:'다음 교통편을 알아보고 이동한다',detail:'뛰어봐야 길이 줄지는 않는다. 지각 사유를 정확히 적어 제출했다.'},
     {label:'같은 동네 친구와 이동 방법을 찾는다',effects:{stats:{relations:1}},detail:'함께 갈 수 있는 버스를 찾아 탔다. 조회에는 늦었지만 혼자는 아니었다.'}
    ]),[
     {id:'morning-lab',priority:30,when:{any:[{attributes:{schoolTrack:'science'}},{attributes:{schoolTrack:'gifted'}}]},
      title:'아침 탐구실에 빠진 안전 고글',
      body:'실습 시작까지 7분. 조원들이 실험실 앞에 모였다. 그런데 네 고글이 안 보인다. ==가방 밑바닥에는 교과서만 있다.==',
      options:[
       {label:'담당 선생님에게 말하고 여분 보호구를 확인한다',effects:{stats:{relations:1}},detail:'실험실에 여분이 있었다. 선생님은 기록부에 장비 대여를 적고 들어오라고 했다.'},
       {label:'기숙사나 사물함에 두었는지 확인하고 돌아온다',risk:'실습 시작을 놓칠 수 있음',effects:{stats:{stress:2}},detail:'사물함에 고글이 있었다. 조금 늦게 합류했지만 안전 수칙을 지킬 수 있었다.'},
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
     {label:'산책하면서 다른 이야기도 나눈다',effects:{stats:{relations:3,health:2,stress:-2}},detail:'조금 편안한 시간을 보냈다.'}
    ]),[
  {id:'career-sea',priority:30,when:{attributes:{highPeer:'세아'}},
   body:'윤세아가 학과 안내서를 펴고 묻는다. "좋아하는 과목하고 잘하는 과목이 다르면 뭘 골라?"',
   options:[
    {label:'세아와 실제 전공 수업 목록을 살펴본다',tags:['team'],effects:{stats:{relations:1}},detail:'학과 이름보다 수업 내용이 훨씬 낯설었다. 세아도 목록에 표시했다.'},
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
     {id:'regular-elective',priority:0,
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
     {label:'거절하지 못하고 권유에 넘어간다',risk:'반복되면 건강·재산에 지속적인 부담',
      effects:{stats:{health:-2},traits:{add:['흡연']}},
      detail:'처음에는 공짜 권유였지만 이후에도 같은 무리에 어울리며 반복했다. 몇 주 뒤에는 ==흡연 습관==이 남았다. 잠깐 거절하기 어려웠던 일이 계속 신경 쓸 일이 됐다.'}
   ]),
   S.branch(choiceAt('high:teamwork',72,'수행평가 전날, 조원 연락이 끊겼다',
    '발표가 내일인데 한 조원이 맡은 자료를 보내지 않는다. 단체방 분위기가 험악해진다.',[
     {label:'자료를 나눠서 재정리하고 발표를 준비한다',effects:{stats:{study:3,relations:4,stress:4}},detail:'불필요한 다툼 없이 발표 준비를 마쳤다.'},
     {label:'조원의 사정을 확인한다',effects:{stats:{relations:6,stress:2}},detail:'사정을 이해하고 역할을 조정했다.'},
     {label:'교사에게 현재 진행 상황을 정확히 알린다',effects:{stats:{study:3,stress:1}},detail:'상황을 정리해 전달했다.'}
    ]),[
  {id:'team-sea',priority:30,when:{attributes:{highPeer:'세아'}},
   body:'윤세아가 실험 결과 파일을 열었다. 마지막 그래프의 단위가 틀렸다. ==이미 보고서를 인쇄했다.==',
   options:[
    {label:'세아와 원본 데이터를 다시 계산한다',tags:['team','science'],risk:'늦은 밤까지 재작업',
      effects:{stats:{study:3,stress:3,health:-1}},
      detail:'세아와 측정값을 하나씩 대조해 단위 오류를 찾아냈다. 한밤중에 정정본을 인쇄했지만 다음 날 둘 다 피곤한 얼굴이었다.'},
     {label:'교사에게 오류를 알리고 정정본을 낸다',risk:'수정 기한을 넘겨 감점 가능',
      effects:{stats:{stress:1,relations:1}},
      detail:'정정 가능 여부를 물었더니 교사는 기록을 남기고 다시 내라고 했다. 감점 가능성은 남았지만 잘못된 데이터를 사실처럼 발표하지 않았다.'},
     {label:'틀린 그래프를 제외하고 확인된 자료만 낸다',risk:'발표 분량과 설득력이 줄어듦',
      effects:{stats:{stress:-1,schoolScore:-1}},
      detail:'그래프를 빼자 결론을 뒷받침할 설명도 줄었다. 질문 시간에 빠진 그래프의 이유를 설명하느라 진땀을 뺐다.'}
   ]},
  {id:'team-harin',priority:20,when:{attributes:{highPeer:'하린'}},
   body:'최하린과 준비한 토론 발표에서 한 조원이 맡은 슬라이드를 보내지 않았다. 그런데 단체방 프로필 사진은 방금 바뀌었다.',
   options:[
    {label:'조원에게 필요한 자료와 마감을 명확히 전달한다',detail:'조원이 절반을 보내 왔다. 나머지는 너와 하린이 다시 확인했다.'},
    {label:'하린과 발표 분량을 줄여 마무리한다',tags:['team','humanities'],risk:'발표 완성도 일부를 포기',effects:{stats:{relations:2,schoolScore:-1},traits:{add:['친화력']}},detail:'지난 학기부터 함께 고친 자료를 다시 나눴다. 분량은 줄었지만 ==일을 나누고 마무리하는 습관==이 남았다.'},
    {label:'담당 교사에게 역할별 진행 상황을 알린다',detail:'교사는 작업 기록을 확인했다. 단체방은 며칠 동안 조용했다.'}
   ]},
  {id:'team-jaeho',priority:0,
   body:'박재호가 축제 홍보 영상 링크를 보냈다. 마지막 장면에 학교 이름이 틀렸다. 예약 업로드까지 ==30분 남았다.==',
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
      {label:'아직은 바꿀 생각이 없다',effects:{stats:{health:-2,stress:1}},detail:'일상이 달라지는 줄 알면서도 미뤘다. 이후의 부담은 계속된다.'}
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
    action:'체육 활동에서 익힌 동작 시연을 비교 자료로 쓴다',tags:['sports'],stats:{study:-1,health:-1,relations:4,stress:1},
    detail:'움직임을 직접 시연하며 원리를 설명했다. 꾸준히 연습한 동작이라 새 대본을 외울 필요는 적었다. 리허설에 쓴 시간만큼 문제풀이가 밀렸다.'},
   {id:'organizing',traits:['리더십','친화력'],requirement:'리더십 또는 친화력',role:'사람을 모아 마무리하는 사람',
    action:'친구들이 잘하는 일을 나눠 역할을 다시 맡긴다',tags:['team'],stats:{study:1,relations:3,stress:1},
    detail:'혼자 채울 분량을 친구들에게 나눠 맡겼다. 쌓아 둔 신뢰 덕에 이번 마감은 지켰다. 다음번 조 편성에서는 모두 네 이름부터 불렀다.'}
  ];
  const modeWhen=mode=>({any:[{attributes:{projectSkill:mode.id}},...mode.traits.map(trait=>({traits:[trait]}))]});
  const ready={all:[{stats:{health:{gte:52},stress:{lte:75}}},
   {any:[{stats:{schoolScore:{gte:65}}},{traits:['언변']}]}]};
  const spotlight={id:'spotlight',label:'대표 발표를 맡고 남은 기간 전부 걸어 본다',
   outlook:'대표 발표 기회 · 내신 지수 65 이상 또는 언변이 준비에 도움 · 건강 55 이상·스트레스 68 이하일 때 성과를 낼 수 있습니다',
   risk:'다른 공부 시간을 비우고 연습을 떠맡음',
   effects:{stats:{study:-2,stress:7,health:-3},attributes:{projectStyle:'spotlight'}},
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
  const projectPaths=scripts=>S.paths(stages,'high:teamwork',scripts.flatMap(script=>[
   script,...[
    ['harin','하린','최하린은 발표 규모를 키우자고 한다. 조원들은 네가 맡을 분량부터 정해 달라고 기다린다.'],
    ['sea','세아','윤세아는 근거가 빈 부분을 짚었다. 자료를 전부 다시 찾자니 준비 시간이 부족하다.'],
    ['jaeho','재호','박재호는 축제 일정까지 겹쳤다며 이번에는 네가 중심을 맡아 달라고 한다.']
   ].map(([id,peer,detail])=>({...script,id:script.id+'-'+id,priority:script.priority+1,
    when:{all:[...(script.when?[script.when]:[]),{attributes:{highPeer:peer}}]},body:detail+'\n\n'+script.body}))
  ]));
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
  const routine=choiceAt('high:break-routine',73,'점심 뒤, 익숙해진 자리',
   '점심을 먹고 나면 선배들이 먼저 연락한다. ==시험이 끝난 날에도 같은 자리에 모였다.== 선배가 아무렇지 않게 또 담배를 권한다.\n\n오늘은 반 친구가 같이 운동장에 가자고 한다. 쉬는 시간을 어디에 쓸까?',[
    {id:'repeat',label:'지난번처럼 권하는 담배를 받아들이고 모임을 계속 간다',effects:{stats:{relations:2,stress:-2},attributes:{habitStage:'routine'}},detail:'며칠이 몇 주가 됐다. 모임에서 담배를 피우는 날이 늘었고 수업 전에 급히 돌아오는 일도 익숙해졌다.'},
    {id:'occasional',label:'권유는 넘기고 가끔만 만나며 반 친구들과도 지낸다',effects:{stats:{relations:1,study:1},attributes:{habitStage:'occasional'}},detail:'모든 연락에 나가지는 않았다. 교실에 남은 날에는 친구와 과제를 먼저 마쳤다.'},
    {id:'leave',label:'오늘부터 다른 약속을 잡고 그 모임에는 나가지 않는다',effects:{stats:{relations:-1,stress:1,study:1},attributes:{habitStage:'away'}},detail:'처음 며칠은 심심했다. 연락은 조금씩 줄었고 점심 뒤 시간이 다시 비었다.'}
   ],{attributes:{habitStage:'first'}});
  stages.events.push(routine.event);stages.choices.push(routine.choice);
  senior.result.conditional.push({when:{attributes:{habitStage:'routine'}},result:{
   effects:{stats:{health:-6,money:-12000,stress:3},traits:{add:['흡연']},attributes:{habitStage:'revealed'}},
   history:{title:'짧던 쉬는 시간이 길어졌다',detail:'처음에는 선배를 따라 잠깐 나갔을 뿐이었다. 몇 달 뒤, 계단에서 숨을 고르다가 쉬는 시간과 지출이 전부 그 습관에 맞춰진 걸 깨달았다. ==이제는 어울리는 자리보다 흡연 습관 자체가 남아 있었다.=='}}});
  S.paths(stages,'high:smoking-followup',[{id:'habit-aftermath',priority:50,when:{traits:['흡연']},
   title:'시험보다 먼저 떠오르는 쉬는 시간',body:'중간에 자꾸 자리를 뜨니 복습 흐름이 끊긴다. 지출도 눈에 띈다. ==한 번의 선택보다 반복한 생활이 더 크게 남았다.==\n\n익숙한 모임과 생활을 어떻게 바꿀까?',
   options:[
    {label:'주변 도움을 받아 몇 주간 생활과 만나는 약속을 바꾼다',effects:{stats:{stress:6,relations:-1},traits:{remove:['흡연']},attributes:{habitStage:'stopped'}},detail:'몇 주간 도움을 받으며 생활을 바꿨다. 선배들을 만나는 횟수도 줄었다. 처음에는 불편했지만 습관에 끌려 자리를 뜨는 일은 멈췄다. 이미 쓴 돈과 놓친 시간은 남았다.'},
    {label:'일단 모이는 횟수부터 줄이며 혼자 조절해 본다',effects:{stats:{stress:2,relations:-1},attributes:{habitStage:'limited'}},detail:'일부 약속은 줄였다. 공부 시간을 조금 되찾았지만 습관이 사라진 것은 아니었다.'},
    {label:'시험이 끝나면 생각하기로 하고 원래 모임을 유지한다',effects:{stats:{relations:1,stress:-2,study:-1},attributes:{habitStage:'entrenched'}},detail:'당장의 불편은 덜었다. 그런데 교재를 펼쳐 둔 시간과 실제로 공부한 시간의 차이는 줄지 않았다.'}
   ]}]);
  const finalExam=stages.choices.find(choice=>choice.presentation?.annual&&choice.presentation.grade===3&&choice.presentation.category==='school');
  for(const option of finalExam.options)option.result.conditional.push({when:{attributes:{habitStage:'entrenched'}},result:{
   effects:{stats:{schoolScore:-2,stress:2}},history:{title:'비워 둔 복습 시간',detail:'쉬는 시간마다 흐름이 끊겨 끝내 못 본 단원이 있었다. 시험에서 그 부분을 만나자 떠올릴 근거가 부족했다. 미뤘던 생활의 부담이 이번에는 성적에 남았다.'}}});
  return {...stages,attributes:{projectStyle:{label:'수행평가 해결 방식',hidden:true},projectResult:{label:'수행평가 결과',hidden:true},projectObligation:{label:'다음 부탁',hidden:true},habitStage:{label:'쉬는 시간의 선택',hidden:true},highPeer:{label:'고등학교 첫 인연',hidden:true},preExamStrategy:{label:'수능 이전 준비 전략',hidden:true},electiveRoute:{label:'고교 과목 및 탐구 선택 경로',hidden:true}}};
 }
});
})(window);
