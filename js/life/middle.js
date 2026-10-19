/* Middle-school operator: cumulative grade choices and regional high-school application. */
(function(global){
'use strict';
const S=global.GukminStory;
global.GukminDirector.register({
 id:'middle',when:{phase:'middle'},
 generate:persona=>{
  const candidates=global.GukminSchools.options(persona);
  const family=['soil','bronze'].includes(persona.familyTier);
  const parentFunds=['silver','gold','diamond'].includes(persona.familyTier);
  const academyCost=parentFunds?0:230000,consultingCost=parentFunds?0:120000;
  const pay=amount=>amount?{when:{stats:{money:{gte:amount}}}}:{};
  const costStats=(amount,study)=>({...(study?{study}:{}),...(amount?{money:-amount}:{})});
  const receipt=amount=>amount?amount.toLocaleString('ko-KR')+'원을 개인 재산에서 냈다.':'수강료는 가족이 부담했다.';
  const proposals=candidates.map(school=>{
   const requirements={...(school.minScore?{schoolScore:{gte:school.minScore}}:{}),
    ...(school.minStudy?{study:{gte:school.minStudy}}:{})};
   return {id:school.id,label:school.name,school,
    ...(Object.keys(requirements).length?{when:{stats:requirements}}:{}),
    effects:{
     attributes:{age:16,phase:'high',job:'고등학생',schoolTrack:school.kind,schoolProgram:school.program},
     schools:[
      {id:'local-middle',kind:'middle',name:'거주지 배정 중학교',status:'graduated'},
      {id:school.id,kind:'high',name:school.name,status:'enrolled'}
     ],
     activate:{exam:45},
     stats:{stress:school.load*2+(school.distanceKm>85?4:school.distanceKm>35?2:0),study:school.load}
    },
    detail:school.name+'에 진학했다. 통학·기숙 비용은 가족과 확인했고 개인 재산에서 가짜 입학금을 빼지 않았다.',
    historyTitle:school.name+' 입학'
   };
  });
  const stages=S.pack(
   S.notice('middle:welcome',52,'중학교 첫 등교','과목별 시험과 수행평가가 시작된다.',{activate:{schoolScore:50}}),
   S.examPrelude('middle',1,53,'1학기 중간고사'),
   S.exam('middle',13,1,53,'1학기 중간고사'),
   S.examPrelude('middle',1,54,'1학기 기말고사'),
   S.exam('middle',13,1,54,'1학기 기말고사'),
   S.branch(S.selection('middle:friends',55,'새로운 동아리 모집','수업 외에 함께할 활동을 찾는다.',[
    {label:'친구와 봉사 동아리에 참가한다',effects:{stats:{relations:6,stress:2}},detail:'봉사 활동을 통해 새로운 친구를 알게 됐다.'},
    {label:'독서·토론 모임을 신청한다',effects:{stats:{study:4,stress:2}},detail:'토론과 발표 경험을 쌓았다.'},
    {label:'방과 후는 쉬기로 한다',effects:{stats:{health:3,stress:-5}},detail:'공부와 휴식의 균형을 잡았다.'}
   ]),[
    {id:'science-group',priority:30,when:{traits:['이과']},
     body:'과학 동아리 부장 민호가 실험 보고서를 들고 왔다. "계측기 하나로 다섯 명이 실험하래." 뒤에서 선배가 한숨을 쉰다.',
     options:[
      {label:'민호와 측정 순서를 짜서 참가한다',effects:{attributes:{clubPath:'science'},stats:{study:2,relations:1}},detail:'돌아가며 측정한 값이 제각각이었다. 민호와 다시 재 보니 센서 접촉 문제였다.'},
      {label:'과학 동아리 대신 운동장에서 친구를 만난다',effects:{attributes:{clubPath:'sports'}},detail:'실험실은 복잡해 보였다. 운동장에서는 친구들이 인원을 채워 달라고 손짓했다.'},
      {label:'방과 후에는 집에서 쉬기로 한다',effects:{attributes:{clubPath:'none'}},detail:'동아리 명단에 이름을 적지 않았다. 저녁 시간이 조금 여유로워졌다.'}
     ]},
    {id:'arts-group',priority:20,when:{traits:['예체능']},
     body:'방송부 선배 예린이 낡은 마이크를 꺼냈다. 인터뷰 동아리라더니 첫 과제는 급식실 홍보 영상이다.',
     options:[
      {label:'예린과 학생 인터뷰를 맡는다',effects:{attributes:{clubPath:'media'},stats:{relations:1}},detail:'카메라 앞에서는 말을 못하던 친구가 마이크가 꺼지자 말을 쏟아냈다. 예린은 다음 영상을 같이 찍자고 했다.'},
      {label:'영상 편집만 조용히 맡는다',effects:{attributes:{clubPath:'media'},stats:{study:1}},detail:'잡음이 섞인 녹음을 붙잡고 한 시간을 보냈다. 마지막에는 노이즈를 거의 지웠다.'},
      {label:'동아리를 다음 학기에 다시 알아본다',effects:{attributes:{clubPath:'none'}},detail:'지원서는 접어 가방에 넣었다. 꼭 지금 결정할 필요는 없었다.'}
     ]},
    {id:'club-default',priority:0,
     body:'자율 동아리 홍보 부스가 복도를 점령했다. 예린은 방송부, 민호는 과학부 앞에서 서로 손을 흔든다.',
     options:[
      {label:'예린이 있는 방송부에서 행사 영상을 만든다',effects:{attributes:{clubPath:'media'},stats:{relations:1}},detail:'카메라 사용법부터 배웠다. 첫 작품에는 친구 얼굴 대신 신발만 찍혔다.'},
      {label:'민호가 있는 과학부에서 실험을 돕는다',effects:{attributes:{clubPath:'science'},stats:{study:2}},detail:'센서가 말을 안 들어서 장비 설명서를 읽었다. 민호가 기록을 맡겼다.'},
      {label:'스포츠 동아리에서 몸을 움직인다',effects:{attributes:{clubPath:'sports'},stats:{health:1}},detail:'매주 연습이 시작됐다. 첫날은 기본 자세만 익혔다.'}
     ]}
   ]),
   {...S.selection('middle:recover',55,'학교생활을 조절할 시간','시험과 활동이 겹치면서 피로가 쌓였다. 부담을 줄일 방법을 선택하자.',[
    {label:'상담을 거쳐 시험 준비량을 조정하고 몇 주간 실천한다',effects:{stats:{stress:-16}},detail:'교사와 적당한 분량으로 계획을 줄였다. 몇 주 동안 무리하지 않으니 계속 밀리던 숙제가 조금씩 줄었다.'},
    {label:'급하지 않은 활동을 접고 규칙적으로 자며 쉬어 간다',effects:{stats:{stress:-14,health:4}},detail:'몇 주간 잠자는 시간이 일정해졌다. 쉬는 동안 미뤄 둔 과제는 별도로 정리했다.'},
    {label:'친구에게 부담을 털어놓고 과제 진행을 함께 점검한다',effects:{stats:{stress:-8,relations:1}},detail:'친구와 제출 날짜를 대조한 뒤 할 수 있는 것부터 나눴다. 불안이 완전히 사라지진 않았지만 다음 주 일정은 보였다.'}
   ]),event:{...S.selection('middle:recover',55,'', '',[{label:'회복'}]).event,when:{turn:{eq:55},stats:{stress:{gte:65}}}}},
   S.notice('middle:age14',56,'중학교 2학년','시험 준비 방법을 조금씩 익혀 간다.',{attributes:{age:14}}),
   S.examPrelude('middle',2,57,'1학기 중간고사'),
   S.exam('middle',14,2,57,'1학기 중간고사'),
   S.examPrelude('middle',2,58,'1학기 기말고사'),
   S.exam('middle',14,2,58,'1학기 기말고사'),
   S.branch(S.selection('middle:group-chat',59,'단톡방에서 아무도 대답하지 않는다',
    '내일이 수행평가 제출일이다. "이거 어떻게 하는 거임?" ==단톡방이 10분째 조용하다.== 너는 과제를 이미 끝냈다.',[
     {label:'풀이 과정을 한 번 정리해 보내 준다',effects:{stats:{relations:2}},detail:'"아 이거였냐"라는 답장이 왔다. 답을 베끼게 하지는 않았지만 친구는 제출 방법을 찾았다.'},
     {label:'다시 같이 풀자고 친구들을 모은다',effects:{stats:{relations:1}},detail:'"그럼 지금 통화?" 이미 끝낸 과제를 다시 설명할 일이 생겼다. ~~내가 왜 제일 바쁘지.~~'},
     {label:'오늘은 조용히 자러 간다',detail:'아침에 보니 새 메시지가 47개였다. 과제 제출은 끝났고 네 잠도 지켰다.'}
    ]),[
     {id:'science-chat',priority:20,when:{attributes:{clubPath:'science'}},
      body:'민호가 실험 보고서 계산식을 찍어 올렸다. "누가 이거 설명 좀." ==읽음 23, 답장 0.== 민호만 계속 물음표를 보내고 있다.',
      options:[
       {label:'민호에게 계산 과정을 단계별로 보내 준다',effects:{stats:{relations:2,study:1}},detail:'민호가 자신이 단위를 잘못 바꿨다고 했다. 너도 검산하다 작은 실수를 하나 찾았다.'},
       {label:'내일 실험실에서 함께 검산하자고 약속한다',effects:{stats:{relations:1}},detail:'민호가 "제발 내일 잊지 마"라고 답했다. 다음 날 둘은 쉬는 시간에 계산기를 들고 만났다.'},
       {label:'일단 내 보고서부터 마무리한다',detail:'민호의 질문에는 다른 친구가 늦게 답했다. 너는 제출한 보고서를 다시 확인했다.'}
      ]},
     {id:'ordinary-chat',priority:0,
      body:'반 단톡방에서 수행평가 질문이 올라왔다. 너는 이미 끝냈다. ==그런데 아무도 답장을 하지 않는다.== ~~다들 자나?~~',
      options:[
       {label:'정답 대신 풀이 방법을 알려 준다',effects:{stats:{relations:2}},detail:'"오 그러면 되는 거냐"라는 답이 왔다. 친구는 직접 남은 부분을 채워 제출했다.'},
       {label:'나도 못 했다며 같이 하자고 한다',effects:{stats:{relations:1}},detail:'답장이 쏟아졌다. "지금 디코?" ==끝낸 과제를 다시 설명하게 생겼다.=='},
       {label:'조용히 휴대폰을 덮는다',detail:'아침에 메시지는 47개. 과제는 제출했고 너는 제시간에 잤다.'}
      ]}
    ]),
  S.branch(S.selection('middle:resources',59,'시험 대비 방법을 고른다',family?'유료 학원이 부담스럽다. 학교 프로그램도 이용할 수 있다.':'다양한 공부 방식 중 하나를 고를 수 있다.',[
    {id:'teacher',label:'학교 선생님에게 질문한다',effects:{stats:{study:5,relations:2,stress:1}},detail:'학교 수업에서 부족한 부분을 채웠다.'},
    {id:'peer',label:'친구와 스터디를 연다',effects:{stats:{study:3,relations:4,stress:2}},detail:'서로의 약점을 도우며 공부했다.'},
    {id:'paid',label:'한 달간 수학 학원을 다닌다 (월 23만 원)',...pay(academyCost),effects:{stats:{...costStats(academyCost,4),stress:2}},detail:'한 달 동안 유형별 문제를 풀었다. '+receipt(academyCost)}
   ]),[
    {id:'lab-study',priority:30,when:{attributes:{clubPath:'science'}},
     body:'민호가 단체방에 문제집 사진을 올렸다. "이 풀이 틀린 것 같은데 선생님께 물어볼래?" 다음 시험 범위에 있는 문제다.',
     options:[
      {id:'teacher',label:'한 달간 오답 노트를 정리해 질문한다',effects:{stats:{study:3},traits:{add:['꼼꼼함']}},detail:'민호와 매주 오답을 고쳤다. ==이젠 답을 보기 전에 계산부터 확인한다.=='},
      {id:'peer',label:'민호와 오답을 서로 검토한다',effects:{stats:{study:2,relations:1}},detail:'서로 놓친 계산을 찾아냈다. 민호가 다음 주에도 같이 보자고 했다.'},
      {id:'paid',label:'한 달간 학원에서 해당 단원을 보충한다 (월 23만 원)',...pay(academyCost),effects:{stats:costStats(academyCost,4)},detail:'여러 유형을 연습했다. 민호의 의문은 따로 확인했다. '+receipt(academyCost)}
     ]},
    {id:'club-study',priority:20,when:{attributes:{clubPath:'media'}},
     body:'예린과 편집을 끝내고 보니 시험 전날이다. 숙제는 남았고 영상은 또 수정해 달라는 요청이 왔다.',
     options:[
      {id:'teacher',label:'한 달간 편집과 공부 시간을 나눠 지킨다',effects:{stats:{study:3},traits:{add:['인내심']}},detail:'예린과 역할을 나누고 한 달간 계획대로 복습했다. 이번 영상은 마감 전에 완성됐다.'},
      {id:'peer',label:'예린과 서로 빈 수업 내용을 확인한다',effects:{stats:{study:2,relations:1}},detail:'예린이 필기를 보내 줬고 너는 빠진 공지를 전달했다. 둘 다 완벽하진 않았다.'},
      {id:'paid',label:'유료 자습실을 한 달 이용한다 (월 9만 원)',...pay(parentFunds?0:90000),effects:{stats:costStats(parentFunds?0:90000,3)},detail:'한 달 동안 밀린 공부를 끝냈다. '+receipt(parentFunds?0:90000)}
     ]},
    {id:'resource-default',priority:0,
     body:'시험 범위가 칠판에 적혔다. 반 친구들은 학원 시간표부터 펼쳤지만 무료 학교 보충 교실도 있다.',
     options:[
      {id:'teacher',label:'학교 보충 교실에서 틀린 문제를 다시 푼다',effects:{stats:{study:3}},detail:'틀린 문제를 분류해 다시 풀었다. 선생님은 정답보다 풀이를 먼저 물었다.'},
      {id:'peer',label:'친구와 각자 한 단원씩 설명해 본다',effects:{stats:{study:2,relations:1}},detail:'서로 설명하다가 둘 다 모르던 단원을 찾았다. 다음 날 다시 확인했다.'},
      {id:'paid',label:'한 달간 학원 보충 수업을 듣는다 (월 23만 원)',...pay(academyCost),effects:{stats:costStats(academyCost,4)},detail:'매주 연습 문제를 풀었다. '+receipt(academyCost)}
     ]}
   ]),
   S.notice('middle:age15',60,'중학교 3학년','고등학교 진학을 생각할 때가 왔다.',{attributes:{age:15}}),
   S.selection('middle:admission-prep',60,'고교 원서보다 먼저 필요한 것',
    family?'친구들은 입학 컨설팅을 예약하는데 비용이 부담된다. 교실 뒤에는 무료 교육청 설명회 공지가 붙어 있다.':'가족이 여러 학교의 교육과정을 비교해 보자고 했다. 설명회와 유료 상담 안내가 함께 들어왔다.',[
     {id:'public',label:'교육청 무료 설명회에서 실제 모집요강을 확인한다',
      effects:{attributes:{admissionResearch:'official'}},detail:'전형이 학교마다 달랐다. 설명회에서 받은 안내서를 표시하고 지원 가능한 학교를 추렸다.'},
     {id:'mentor',label:'담임과 학교 유형별 수업을 비교한다',
      effects:{attributes:{admissionResearch:'mentor'}},detail:'상담실에서 지원 일정과 교육과정을 비교했다. 결정하기 전에 가족과 한 번 더 이야기하기로 했다.'},
     {id:'paid',label:'유료 진학 상담을 받는다 (12만 원)',...pay(consultingCost),
       effects:{attributes:{admissionResearch:'paid'},stats:costStats(consultingCost,0)},detail:'상담에서 받은 자료를 실제 모집요강과 대조했다. '+receipt(consultingCost)+' 합격 보장은 믿지 않았다.'}
    ]),
   S.examPrelude('middle',3,61,'1학기 중간고사'),
   S.exam('middle',15,3,61,'1학기 중간고사'),
   S.examPrelude('middle',3,62,'1학기 기말고사'),
   S.exam('middle',15,3,62,'1학기 기말고사'),
   S.selection('middle:high-application',63,'고등학교 진학 원서','출신 지역과 현재 학업 성적을 바탕으로 지원 학교를 고른다. 실제 모집요강을 대신하지 않는 게임용 모형이다.',
     proposals,'한방 선택',{type:'school',region:global.GukminSchools.regionOf(persona),year:'중학교 3학년'})
  );
  return {...stages,attributes:{
   schoolTrack:{label:'고교 유형',hidden:true},
   schoolProgram:{label:'학교 교육과정 유형',hidden:true},
   clubPath:{label:'중학교 활동 기록',hidden:true},admissionResearch:{label:'진학 조사 경로',hidden:true}
  }};
 }
});
})(window);
