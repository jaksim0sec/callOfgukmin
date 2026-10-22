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
  const receipt=amount=>amount?amount.toLocaleString('ko-KR')+'원을 개인 재산에서 냈다.':'비용은 가족이 부담했다.';
  const proposals=candidates.map(school=>{
   const requirements={...(school.minScore?{schoolScore:{gte:school.minScore}}:{})}; // Only visible score gates admission.
   return {id:school.id,label:school.name,school,
    ...(Object.keys(requirements).length?{when:{stats:requirements,...(['science','gifted'].includes(school.kind)?{any:['official','mentor','paid'].map(admissionResearch=>({attributes:{admissionResearch}}))}:{})}}:{}),
    highEntry:{track:school.kind},
    effects:{
     attributes:{age:17,phase:'high',job:'고등학생',schoolTrack:school.kind,schoolProgram:school.program},
     schools:[
      {id:'local-middle',kind:'middle',name:'거주지 배정 중학교',status:'graduated'},
      {id:school.id,kind:'high',name:school.name,status:'enrolled'}
     ],

     stats:{stress:Math.ceil(school.load/2)+(school.distanceKm>35?1:0),}
    },
    detail:school.name+'에 진학했다. 통학·기숙 비용은 가족과 확인했고 개인 재산에서 가짜 입학금을 빼지 않았다.',
    historyTitle:school.name+' 입학'
   };
  });
  const stages=S.pack(
   S.notice('middle:welcome',52,'중학교 첫 등교','과목별 시험과 수행평가가 시작된다.',{activate:{schoolScore:17}}),
   S.examPrelude('middle',1,53,'1학기 중간고사'),
   S.exam('middle',14,1,53,'1학기 중간고사'),
   S.examPrelude('middle',1,54,'1학기 기말고사'),
   S.exam('middle',14,1,54,'1학기 기말고사'),
   S.branch(S.selection('middle:friends',55,'새로운 동아리 모집','수업 외에 함께할 활동을 찾는다.',[
    {label:'친구와 봉사 동아리에 참가한다',effects:{stats:{relations:2,stress:1}},detail:'봉사 활동을 통해 새로운 친구를 알게 됐다.'},
    {label:'독서·토론 모임을 신청한다',effects:{stats:{study:1,stress:1}},detail:'토론과 발표 경험을 쌓았다.'},
    {label:'방과 후는 쉬기로 한다',effects:{stats:{stress:-1}},detail:'공부와 휴식의 균형을 잡았다.'}
   ]),[
    {id:'science-group',priority:30,when:{traits:['이과']},
     title:'계측기 하나와 다섯 명',body:'과학 동아리 부장 민호가 실험 보고서를 들고 왔다. "계측기 하나로 다섯 명이 실험하래." 뒤에서 선배가 한숨을 쉰다.',
     options:[
      {label:'민호와 측정 순서를 짜서 참가한다',effects:{attributes:{clubPath:'science'},stats:{study:1,relations:1}},detail:'돌아가며 측정한 값이 제각각이었다. 민호와 다시 재 보니 센서 접촉 문제였다.'},
      {label:'과학 동아리 대신 운동장에서 친구를 만난다',effects:{attributes:{clubPath:'sports'}},detail:'실험실은 복잡해 보였다. 운동장에서는 친구들이 인원을 채워 달라고 손짓했다.'},
      {label:'방과 후에는 집에서 쉬기로 한다',effects:{attributes:{clubPath:'none'}},detail:'동아리 명단에 이름을 적지 않았다. 저녁 시간이 조금 여유로워졌다.'}
     ]},
    {id:'arts-group',priority:20,when:{traits:['예체능']},
     title:'방송부의 첫 인터뷰',body:'방송부 선배 예린이 낡은 마이크를 꺼냈다. 인터뷰 동아리라더니 첫 과제는 급식실 홍보 영상이다.',
     options:[
      {label:'예린과 학생 인터뷰를 맡는다',effects:{attributes:{clubPath:'media'},stats:{relations:1}},detail:'카메라 앞에서는 말을 못하던 친구가 마이크가 꺼지자 말을 쏟아냈다. 예린은 다음 영상을 같이 찍자고 했다.'},
      {label:'영상 편집만 조용히 맡는다',effects:{attributes:{clubPath:'media'},stats:{study:1}},detail:'잡음이 섞인 녹음을 붙잡고 한 시간을 보냈다. 마지막에는 노이즈를 거의 지웠다.'},
      {label:'동아리를 다음 학기에 다시 알아본다',effects:{attributes:{clubPath:'none'}},detail:'지원서는 접어 가방에 넣었다. 꼭 지금 결정할 필요는 없었다.'}
     ]},
    {id:'club-default',priority:0,
     title:'동아리 홍보 부스',body:'자율 동아리 홍보 부스가 복도를 점령했다. 예린은 방송부, 민호는 과학부 앞에서 서로 손을 흔든다.',
     options:[
      {label:'예린이 있는 방송부에서 행사 영상을 만든다',effects:{attributes:{clubPath:'media'},stats:{relations:1}},detail:'카메라 사용법부터 배웠다. 첫 작품에는 친구 얼굴 대신 신발만 찍혔다.'},
      {label:'민호가 있는 과학부에서 실험을 돕는다',effects:{attributes:{clubPath:'science'},stats:{study:1}},detail:'센서가 말을 안 들어서 장비 설명서를 읽었다. 민호가 기록을 맡겼다.'},
      {label:'스포츠 동아리에서 몸을 움직인다',effects:{attributes:{clubPath:'sports'},stats:{}},detail:'매주 연습이 시작됐다. 첫날은 기본 자세만 익혔다.'}
     ]}
   ]),
   {...S.selection('middle:recover',55,'학교생활을 조절할 시간','시험과 활동이 겹치면서 피로가 쌓였다. 부담을 줄일 방법을 선택하자.',[
    {label:'상담을 거쳐 시험 준비량을 조정하고 몇 주간 실천한다',effects:{stats:{stress:-4,schoolScore:-1}},detail:'보충 문제를 일부 포기하고 교사와 적당한 분량으로 계획을 줄였다. 몇 주 동안 무리하지 않으니 계속 밀리던 숙제가 조금씩 줄었다.'},
    {label:'급하지 않은 활동을 접고 규칙적으로 자며 쉬어 간다',effects:{stats:{stress:-6,schoolScore:-2,relations:-1}},detail:'과제와 친구 약속을 미루고 몇 주간 잠자는 시간이 일정해졌다. 쉬는 동안 미뤄 둔 과제는 별도로 정리했다.'},
    {label:'친구에게 부담을 털어놓고 과제 진행을 함께 점검한다',effects:{stats:{stress:-2,schoolScore:-1,relations:1}},detail:'개인 복습 시간을 줄이고 친구와 제출 날짜를 대조한 뒤 할 수 있는 것부터 나눴다. 불안이 완전히 사라지진 않았지만 다음 주 일정은 보였다.'}
   ]),event:{...S.selection('middle:recover',55,'', '',[{label:'회복'}]).event,when:{turn:{eq:55},any:[{stats:{stress:{gte:16}}},{stats:{illness:{gte:1}}}]}}},
   S.notice('middle:age14',56,'중학교 2학년','시험 준비 방법을 조금씩 익혀 간다.',{attributes:{age:15}}),
   S.examPrelude('middle',2,57,'1학기 중간고사'),
   S.exam('middle',15,2,57,'1학기 중간고사'),
   S.examPrelude('middle',2,58,'1학기 기말고사'),
   S.exam('middle',15,2,58,'1학기 기말고사'),
   S.branch(S.selection('middle:group-chat',59,'단톡방에서 아무도 대답하지 않는다',
    '내일이 수행평가 제출일이다. "이거 어떻게 하는 거임?" ==단톡방이 10분째 조용하다.== 너는 과제를 이미 끝냈다.',[
     {label:'풀이 과정을 한 번 정리해 보내 준다',effects:{stats:{relations:1}},detail:'"아 이거였냐"라는 답장이 왔다. 답을 베끼게 하지는 않았지만 친구는 제출 방법을 찾았다.'},
     {label:'다시 같이 풀자고 친구들을 모은다',effects:{stats:{relations:1}},detail:'"그럼 지금 통화?" 이미 끝낸 과제를 다시 설명할 일이 생겼다. ~~내가 왜 제일 바쁘지.~~'},
     {label:'오늘은 조용히 자러 간다',detail:'아침에 보니 새 메시지가 47개였다. 과제 제출은 끝났고 네 잠도 지켰다.'}
    ]),[
     {id:'science-chat',priority:20,when:{attributes:{clubPath:'science'}},
      title:'민호의 계산식',body:'민호가 실험 보고서 계산식을 찍어 올렸다. "누가 이거 설명 좀." ==읽음 23, 답장 0.== 민호만 계속 물음표를 보내고 있다.',
      options:[
       {label:'민호에게 계산 과정을 단계별로 보내 준다',tags:['team','science'],risk:'내 보고서 검토 시간이 줄어듦',effects:{stats:{relations:1,study:1,stress:1}},detail:'민호가 자신이 단위를 잘못 바꿨다고 했다. 너도 검산하다 작은 실수를 하나 찾았다.'},
       {label:'내일 실험실에서 함께 검산하자고 약속한다',effects:{stats:{relations:1}},detail:'민호가 "제발 내일 잊지 마"라고 답했다. 다음 날 둘은 쉬는 시간에 계산기를 들고 만났다.'},
       {label:'일단 내 보고서부터 마무리한다',detail:'민호의 질문에는 다른 친구가 늦게 답했다. 너는 제출한 보고서를 다시 확인했다.'}
      ]},
     {id:'ordinary-chat',priority:0,
      title:'답장 없는 단체방',body:'반 단톡방에서 수행평가 질문이 올라왔다. 너는 이미 끝냈다. ==그런데 아무도 답장을 하지 않는다.== ~~다들 자나?~~',
      options:[
       {label:'정답 대신 풀이 방법을 알려 준다',effects:{stats:{relations:1,study:1,stress:1}},detail:'"오 그러면 되는 거냐"라는 답이 왔다. 친구는 직접 남은 부분을 채워 제출했다. 대신 내 복습 시간이 조금 줄었다.'},
       {label:'같이 점검하자며 친구들을 모은다',tags:['team'],effects:{stats:{relations:1,stress:1}},detail:'답장이 쏟아졌다. "지금 디코?" ==끝낸 과제를 다시 설명하게 생겼다.== 서로 도왔지만 저녁 시간이 줄었다.'},
       {label:'조용히 휴대폰을 덮는다',effects:{stats:{stress:-1}},detail:'아침에 메시지는 47개. 과제는 제출했고 너는 제시간에 잤다. 다음 날 질문은 직접 설명하기로 했다.'}
      ]}
    ]),
  S.branch(S.selection('middle:resources',59,'시험 대비 방법을 고른다',family?'유료 학원이 부담스럽다. 학교 프로그램도 이용할 수 있다.':'다양한 공부 방식 중 하나를 고를 수 있다.',[
    {id:'teacher',label:'학교 선생님에게 질문한다',effects:{stats:{study:1,relations:1,stress:1}},detail:'학교 수업에서 부족한 부분을 채웠다.'},
    {id:'peer',label:'친구와 스터디를 연다',effects:{stats:{study:1,relations:1,stress:1}},detail:'서로의 약점을 도우며 공부했다.'},
    {id:'paid',label:'한 달간 수학 학원을 다닌다 (23만 원'+(parentFunds?' · 가족 부담':' · 직접 부담')+')',...pay(academyCost),effects:{stats:{...costStats(academyCost,4),stress:1}},detail:'한 달 동안 유형별 문제를 풀었다. '+receipt(academyCost)}
   ]),[
    {id:'lab-study',priority:30,when:{attributes:{clubPath:'science'}},
     title:'검산부터 다시',body:'민호가 단체방에 문제집 사진을 올렸다. "이 풀이 틀린 것 같은데 선생님께 물어볼래?" 다음 시험 범위에 있는 문제다.',
     options:[
      {id:'teacher',label:'한 달간 오답 노트를 정리해 질문한다',risk:'매주 검산을 마칠 때까지 자유 시간이 줄어듦',tags:['science'],effects:{stats:{study:1,stress:1},traits:{add:['꼼꼼함']}},detail:'민호와 매주 오답을 고쳤다. ==이젠 답을 보기 전에 계산부터 확인한다.=='},
      {id:'peer',label:'민호와 오답을 서로 검토한다',tags:['team','science'],effects:{stats:{study:1,relations:1,stress:1}},detail:'서로 놓친 계산을 찾아냈다. 민호가 다음 주에도 같이 보자고 했다.'},
      {id:'paid',label:'한 달간 학원에서 해당 단원을 보충한다 (23만 원'+(parentFunds?' · 가족 부담':' · 직접 부담')+')',...pay(academyCost),risk:'정해진 진도와 숙제를 따라가야 함',effects:{stats:{...costStats(academyCost,5),stress:1}},detail:'여러 유형을 연습했다. 민호의 의문은 따로 확인했다. '+receipt(academyCost)}
     ]},
    {id:'club-study',priority:20,when:{attributes:{clubPath:'media'}},
     title:'편집 일정과 시험 범위',body:'다음 달 시험을 앞두고 방송부 편집 일정이 겹쳤다. 공부 시간은 줄었는데 예린에게는 영상 수정 요청이 또 왔다. ==한 달 동안 지킬 일정을 정해야 한다.==',
     options:[
      {id:'teacher',label:'한 달간 편집과 공부 시간을 나눠 지킨다',risk:'급한 편집 부탁을 거절해야 함',effects:{stats:{study:1,stress:1,relations:-1},traits:{add:['인내심']}},detail:'예린에게 즉석 수정은 어렵다고 말했다. 며칠은 어색했지만 한 달간 계획을 지키며 공부와 편집을 마쳤다.'},
      {id:'peer',label:'예린과 서로 빈 수업 내용을 확인한다',tags:['team','arts'],effects:{stats:{study:1,relations:1,stress:1}},detail:'예린이 필기를 보내 줬고 너는 빠진 공지를 전달했다. 둘 다 완벽하진 않았다.'},
      {id:'paid',label:'유료 자습실을 한 달 이용한다 (9만 원'+(parentFunds?' · 가족 부담':' · 직접 부담')+')',...pay(parentFunds?0:90000),risk:'자습실로 오가는 시간과 비용이 필요',effects:{stats:{...costStats(parentFunds?0:90000,4),stress:1}},detail:'한 달 동안 밀린 공부를 끝냈다. '+receipt(parentFunds?0:90000)}
     ]},
    {id:'resource-default',priority:0,
     title:'학교에서 찾은 보충 교실',body:'시험 범위가 칠판에 적혔다. 반 친구들은 학원 시간표부터 펼쳤지만 무료 학교 보충 교실도 있다.',
     options:[
      {id:'teacher',label:'학교 보충 교실에서 틀린 문제를 다시 푼다',risk:'매주 정해진 보충 시간에 참석',effects:{stats:{study:1,stress:1}},detail:'틀린 문제를 분류해 다시 풀었다. 선생님은 정답보다 풀이를 먼저 물었다.'},
      {id:'peer',label:'친구와 각자 한 단원씩 설명해 본다',tags:['team'],effects:{stats:{study:1,relations:1,stress:1}},detail:'서로 설명하다가 둘 다 모르던 단원을 찾았다. 다음 날 다시 확인했다.'},
      {id:'paid',label:'한 달간 학원 보충 수업을 듣는다 (23만 원'+(parentFunds?' · 가족 부담':' · 직접 부담')+')',...pay(academyCost),risk:'정해진 진도와 숙제를 따라가야 함',effects:{stats:{...costStats(academyCost,5),stress:1}},detail:'매주 연습 문제를 풀었다. '+receipt(academyCost)}
     ]}
   ]),
   S.notice('middle:age15',60,'중학교 3학년','고등학교 진학을 생각할 때가 왔다.',{attributes:{age:16}}),
   S.selection('middle:admission-prep',60,'고교 원서보다 먼저 필요한 것',
    family?'친구들은 입학 컨설팅을 예약하는데 비용이 부담된다. 교실 뒤에는 무료 교육청 설명회 공지가 붙어 있다.':'가족이 여러 학교의 교육과정을 비교해 보자고 했다. 설명회와 유료 상담 안내가 함께 들어왔다.',[
     {id:'public',label:'교육청 무료 설명회에서 실제 모집요강을 확인한다',
      effects:{attributes:{admissionResearch:'official'}},detail:'전형이 학교마다 달랐다. 설명회에서 받은 안내서를 표시하고 지원 가능한 학교를 추렸다.'},
     {id:'mentor',label:'담임과 학교 유형별 수업을 비교한다',
      effects:{attributes:{admissionResearch:'mentor'},stats:{relations:1,stress:1}},detail:'상담실에서 지원 일정과 교육과정을 비교했다. 결정하기 전에 가족과 한 번 더 이야기하기로 했다.'},
     {id:'paid',label:'유료 상담 뒤 계획에 맞춰 취약 단원을 복습한다 (12만 원'+(parentFunds?' · 가족 부담':' · 직접 부담')+')',...pay(consultingCost),
       effects:{attributes:{admissionResearch:'paid'},stats:{...costStats(consultingCost,0),schoolScore:1,stress:2}},detail:'상담 계획으로 취약 단원을 다시 풀고 받은 자료를 실제 모집요강과 대조했다. '+receipt(consultingCost)+' 합격 보장은 믿지 않았다.'}
    ]),
   S.examPrelude('middle',3,61,'1학기 중간고사'),
   S.exam('middle',16,3,61,'1학기 중간고사'),
   S.examPrelude('middle',3,62,'1학기 기말고사'),
   S.exam('middle',16,3,62,'1학기 기말고사'),
   S.selection('middle:high-application',63,'고등학교 진학 원서','출신 지역과 현재 학업 성적을 바탕으로 지원 학교를 고른다.',
     proposals,'한방 선택',{type:'school',region:global.GukminSchools.regionOf(persona),year:'중학교 3학년'})
  );
  const timer=S.selection('middle:study-timer',61,'하루가 27시간인 라이벌','중간고사가 끝나고 기말 준비를 시작했다. 순공 기록 앱 열공타를 열자 같은 학년 라이벌의 오늘 기록이 27시간 9분이다. 친구들은 이미 좋아요를 누르고 있다.',[
   {id:'comment',label:'“하루가 27시간인 멋진 청년”이라 댓글 달기',effects:{stats:{stress:-2,relations:-1},traits:{add:['풍자 감각']},attributes:{studyTimerReaction:'comment'}},detail:'웃음을 참지 못하고 댓글을 달았다. 몇 명은 피식 웃었지만 기록을 올린 친구는 답장이 없었다. 남과 비교하던 마음은 조금 가벼워졌다.'},
   {id:'like',label:'다른 친구들처럼 조용히 좋아요 누르기',effects:{stats:{relations:1},attributes:{studyTimerReaction:'like'}},detail:'좋아요 목록에 내 이름도 올라갔다. 공부 시간의 진위는 따지지 않고 친구들과 무난하게 어울렸다.'},
   {id:'focus',label:'폰을 끄고 내 공부 하기',effects:{stats:{schoolScore:2,stress:1},attributes:{studyTimerReaction:'focus'}},detail:'휴대폰을 뒤집고 기말 범위의 오답을 다시 풀었다. 비교 대신 내 학업 성취가 올랐지만 집중한 만큼 부담도 남았다.'}
  ],'일상 선택',{type:'study-app',app:'열공타',rival:'민호',hours:27,minutes:9,likes:23});
  timer.event.when={turn:{eq:61}};
  const mid=stages.events.findIndex(e=>e.id==='middle:3:1학기-중간고사');
  stages.events.splice(mid+1,0,timer.event);stages.choices.push(timer.choice);
  // Elementary preparation has a bounded, real return instead of becoming a discarded gauge.
  stages.events.find(e=>e.id==='middle:welcome').result.conditional=[
   {before:true,when:{stats:{study:{gte:15}}},result:{effects:{stats:{schoolScore:1}}}},
   {before:true,when:{stats:{study:{gte:19}}},result:{effects:{stats:{schoolScore:1}}}}
  ];
  // An elected elementary class president leaves a visible history and changes a later dilemma.
  S.paths(stages,'middle:group-chat',[{
   id:'former-class-president',priority:35,when:{attributes:{classElection:'elected'}},
   title:'반장이었던 걸 기억하는 친구',
   body:'단체방에서 수행평가 자료가 잘못 공유됐다. 한 친구가 “너 초등학교 때 반장이었잖아. 이번에도 정리 좀 해 줘”라고 말한다. ==오늘 내 숙제도 끝나지 않았다.== 예전 경험을 어떻게 쓸까?',
   options:[
    {id:'organize',label:'친구들을 모아 제출 기준을 다시 확인하고 정리한다',
     risk:'조정에 실패하면 내 숙제도 밀리며, 모두의 기대를 떠안음',
     tags:['team'],effects:{stats:{relations:1,study:-1,stress:1}},
     detail:'전과 달리 모든 일을 혼자 하지 않고 확인할 사람을 나눴다. 늦게까지 친구들의 질문을 받느라 내 문제집은 끝내지 못했다.'},
    {id:'boundary',label:'공식 안내만 공유하고 내 과제를 먼저 마친다',
     effects:{stats:{study:1,relations:-1,stress:1}},
     detail:'교사 공지 원문을 올리고 각자 확인해 달라고 했다. 내 과제는 끝냈지만 몇몇 친구는 좀 더 도와줄 줄 알았다고 말했다.'},
    {id:'delegate',label:'학급 임원에게 함께 정리하자고 제안한다',
     risk:'친구에게 일을 넘긴 것으로 보일 수 있음',
     tags:['team'],effects:{stats:{relations:1,study:1,stress:1}},
     detail:'현재 학급 임원과 역할을 나눴다. 예전 반장 경험을 살리되 이번엔 결정권을 독차지하지 않았다. 안내는 조금 늦게 완성됐다.'}
   ]
  }]);
  // Earlier interests open an activity; sustained commitments become usable experience.
  S.paths(stages,'middle:friends',[
   {id:'humanities-club',priority:35,when:{traits:['문과']},
    title:'토론팀의 연습 일정',body:'토론 동아리에서 발표자를 찾는다. 원고만 읽는 발표는 점수를 못 받는다고 한다. 일주일에 두 번, 방과 후 시간이 필요하다.',
    options:[
     {label:'질문과 반론을 준비하는 토론팀에 들어간다',tags:['humanities'],effects:{attributes:{clubPath:'humanities'},stats:{relations:1,stress:1}},detail:'첫 토론에서는 말문이 막혔다. 다음 주엔 근거를 적어 와 다시 반박했다. 정기 연습 일정이 생겼다.'},
     {label:'친구가 있는 방송부에서 원고를 써 본다',effects:{attributes:{clubPath:'media'},stats:{relations:1}},detail:'친구가 촬영하고 너는 질문을 적었다. 방송부 원고에는 교과서와 다른 문장이 필요했다.'},
     {label:'동아리를 비우고 혼자 읽고 싶은 책을 읽는다',effects:{attributes:{clubPath:'none'},stats:{relations:-1}},detail:'읽는 시간을 확보했다. 대신 합동 발표자 명단에서는 이름이 빠졌다.'}
    ]},
   {id:'sports-club',priority:35,when:{traits:['체육']},
    title:'대표팀 명단과 방과 후',body:'체육 동아리 선배가 대표팀 연습을 권한다. 매주 두 번 남아야 하고 대회 전에는 주말 연습도 있다.',
    options:[
     {label:'정기 연습에 참가하고 대표팀에 도전한다',tags:['sports'],effects:{attributes:{clubPath:'sports'},stats:{study:-1,relations:1}},detail:'기본 훈련부터 다시 했다. 팀에 이름이 올라갔지만 연습날에는 친구들의 다른 약속을 놓쳤다.'},
     {label:'대표팀 대신 친구들과 가볍게 운동한다',effects:{attributes:{clubPath:'none'},stats:{stress:-1}},detail:'정해진 훈련은 없었다. 편한 만큼 대회 명단에도 들어가지는 않았다.'},
     {label:'연습 시간에는 학교 보충 수업을 듣는다',effects:{attributes:{clubPath:'none'},stats:{study:1,relations:-1}},detail:'놓친 단원을 채웠다. 팀 단체방에는 새 유니폼 사진이 올라왔다.'}
    ]}
  ]);
  const commitments=[
   {id:'media',title:'축제 메인 영상과 시험 범위',body:'예린이 축제 메인 영상을 맡아 보자고 한다. 한 달 동안 촬영과 편집을 해야 한다. 그달 시험 준비 시간은 이미 빠듯하다.',role:'행사 영상 제작',action:'예린과 축제 메인 영상을 끝까지 만든다',detail:'몇 주간 촬영과 편집을 반복했다. 상영이 끝나자 다른 반에서도 제작을 부탁했다. 복습하지 못한 단원은 남았다.',tags:['arts'],requirement:'방송부 활동',study:1},
   {id:'science',title:'탐구 발표회와 밀린 문제집',body:'민호가 교내 탐구 발표회에 함께 나가자고 한다. 새 실험을 세 번 더 해야 한다. 문제집 진도는 다른 친구들보다 늦다.',role:'탐구 기록과 검증',action:'민호와 실험을 반복하고 발표회에 나간다',detail:'세 차례의 실험을 같은 형식으로 기록했다. 마지막에는 오차의 원인까지 설명했다. 문제집은 끝내 다 못 풀었다.',tags:['science'],requirement:'과학 동아리 활동',study:1},
   {id:'humanities',title:'토론 대회 참가 신청서',body:'학교 대표 토론팀 지원서를 받았다. 자료 조사와 모의 토론에 방과 후 한 달을 써야 한다. 그 시간에 시험 범위도 마쳐야 한다.',role:'토론과 질의응답',action:'팀 대표로 토론 대회를 준비한다',detail:'상대가 바뀔 때마다 질문도 달랐다. 한 달간 원고를 고치고 반론을 연습했다. 발표 경험은 쌓였지만 문제풀이 시간은 줄었다.',tags:['humanities'],requirement:'토론 동아리 활동',study:1},
   {id:'sports',title:'대회 명단에 적힌 내 이름',body:'학교 대표 대회가 시험 준비 기간과 겹친다. 주전으로 뛰려면 한 달간 연습에 빠지지 않아야 한다.',role:'대표팀 훈련과 시연',action:'한 달간 훈련하고 학교 대표로 출전한다',detail:'반복 훈련과 경기 운영을 함께 경험했다. 경기 뒤에도 몸을 관리해야 했다. 수업 필기는 친구에게 빌려 채웠다.',tags:['sports'],requirement:'체육 동아리 활동',study:1}
  ];
  for(const path of commitments){
   const showcase={id:'showcase',label:path.action,requirement:path.requirement,tags:path.tags,
    when:{attributes:{clubPath:path.id}},risk:'준비 기간 동안 시험 복습 시간이 줄어듦',
    effects:{stats:{study:-1,relations:1,stress:1},attributes:{projectSkill:path.id,schoolRole:path.role}},detail:path.detail};
   const steady={id:'steady',label:'맡은 일만 하며 복습과 연습 일정을 지킨다',
    effects:{stats:{study:path.study,stress:1,relations:1},traits:{add:[path.id==='humanities'?'언변':path.id==='science'?'꼼꼼함':'인내심']}},
    detail:'몇 주간 약속한 분량만 맡았다. 대표 자리는 다른 친구에게 갔지만 같은 일을 꾸준히 해낼 방식이 남았다.'};
   const study={id:'study',label:'대표 활동은 넘기고 시험 준비에 시간을 쓴다',
    effects:{stats:{study:1,stress:1,relations:-1},attributes:{projectSkill:'study',schoolRole:'학업 집중'}},
    detail:'남은 단원을 복습하고 문제를 풀었다. 행사와 대회 사진에는 네가 없었고, 친구들은 준비 때의 일을 한동안 자기들끼리 이야기했다.'};
   S.paths(stages,'middle:resources',[{id:'commitment-'+path.id,priority:60,when:{all:[{attributes:{clubPath:path.id}},...(['science','media'].includes(path.id)?[{stats:{relations:{gte:16}}}]:[])]},title:path.title,body:path.body,options:[showcase,steady,study]}]);
  }
  const friends=stages.choices.find(c=>c.id==='middle:friends');
  friends.variants.find(v=>v.id==='science-group').options[0].result.effects.stats={relations:1,stress:1};
  friends.variants.find(v=>v.id==='science-group').options[1].result.effects.stats={relations:1};
  friends.variants.find(v=>v.id==='science-group').options[2].result.effects.stats={stress:-1,relations:-1};
  friends.variants.find(v=>v.id==='arts-group').options[0].result.effects.stats={relations:1,stress:1};friends.variants.find(v=>v.id==='arts-group').options[1].result.effects.stats={relations:1,stress:1};
  friends.variants.find(v=>v.id==='arts-group').options[2].result.effects.stats={stress:-1,relations:-1};
  friends.variants.find(v=>v.id==='club-default').options[1].result.effects.stats={relations:1,stress:1};
  const chat=stages.choices.find(c=>c.id==='middle:group-chat');chat.options[2].result.effects={stats:{stress:-1,relations:-1}};
  chat.variants.find(v=>v.id==='science-chat').options[2].result.effects={stats:{schoolScore:1,relations:-1,stress:1}};
  const scienceClub=friends.variants.find(v=>v.id==='science-group');scienceClub.options[0].result.effects.stats={relations:2,stress:1};
  const generalClub=friends.variants.find(v=>v.id==='club-default');generalClub.options[0].result.effects.stats={relations:1,stress:1};generalClub.options[1].result.effects.stats={schoolScore:1,stress:1};generalClub.options[2].result.effects.stats={relations:1,schoolScore:-1,stress:-1};
  const humanitiesClub=friends.variants.find(v=>v.id==='humanities-club');humanitiesClub.options[0].result.effects.stats={relations:2,stress:2,schoolScore:1};humanitiesClub.options[1].result.effects.stats={relations:1,stress:1};humanitiesClub.options[2].result.effects.stats={schoolScore:1,relations:-1,stress:-1};
  const arts=friends.variants.find(v=>v.id==='arts-group');arts.options[0].result.effects.stats={relations:3,stress:2};arts.options[1].result.effects.stats={relations:1,stress:1};
  const sports=friends.variants.find(v=>v.id==='sports-club');sports.options[2].result.effects.stats={schoolScore:1,stress:1,relations:-1};
  const chatChoice=stages.choices.find(c=>c.id==='middle:group-chat');
  const scienceChat=chatChoice.variants.find(v=>v.id==='science-chat');
  scienceChat.options[0].result.effects.stats={schoolScore:1,relations:1,stress:2};
  scienceChat.options[1].result.effects.stats={relations:1};
  scienceChat.options[2].result.effects.stats={schoolScore:2,relations:-1,stress:1};
  const ordinaryChat=chatChoice.variants.find(v=>v.id==='ordinary-chat');
  ordinaryChat.options[0].result.effects.stats={schoolScore:1,relations:1,stress:2};
  ordinaryChat.options[1].result.effects.stats={relations:2,stress:2};
  const former=chatChoice.variants.find(v=>v.id==='former-class-president');
  former.options[0].result.effects.stats={relations:3,stress:2,schoolScore:-1};
  former.options[1].result.effects.stats={schoolScore:2,relations:-1};
  former.options[2].result.effects.stats={schoolScore:1,relations:1,stress:2};
  const resources=stages.choices.find(c=>c.id==='middle:resources');
  for(const script of resources.variants.filter(v=>['lab-study','club-study','resource-default'].includes(v.id))){
   script.options.find(o=>o.id==='teacher').result.effects.stats={schoolScore:1,stress:1};
   script.options.find(o=>o.id==='peer').result.effects.stats={schoolScore:1,relations:1,stress:2};
   const paid=script.options.find(o=>o.id==='paid');paid.result.effects.stats={...(paid.result.effects.stats.money!==undefined?{money:paid.result.effects.stats.money}:{}),schoolScore:2,stress:3};
  }
  for(const script of resources.variants.filter(v=>v.id.startsWith('commitment-'))){
   script.options.find(o=>o.id==='showcase').result.effects.stats={relations:2,stress:2,schoolScore:-1};
   script.options.find(o=>o.id==='steady').result.effects.stats={schoolScore:1,stress:1};
   script.options.find(o=>o.id==='study').result.effects.stats={schoolScore:2,stress:2,relations:-1};
  }
  S.schoolwork(stages,{"middle:resources": "schoolScore", "middle:group-chat": "schoolScore"});
  const recovery=stages.choices.find(c=>c.id==='middle:recover');
  recovery.options.push({id:'ignore',label:'그냥 넘기고 하던 일정을 계속한다',result:{effects:{},history:{title:'회복을 미뤘다',detail:'이번에는 일정을 바꾸지 않았다. 쌓인 부담도 그대로 남았다.'}}});
  const sceneChat=stages.choices.find(c=>c.id==='middle:group-chat');
  // Each chat variant owns its own situation, replies, outcome and actual player words.
  // Do not rewrite all variants from an index-based, generic canned conversation.
  const chatScripts={
   'middle:group-chat':{
    room:'중학교 · 수행평가 단톡',
    messages:[{sender:'민서',text:'수행평가 제출 어디로 하는 거임? 공지 다시 봐도 안 보이는데 ㅠ',time:'오후 8:32'},
     {sender:'지우',text:'나도 그거 찾는 중;; 아는 사람?',time:'오후 8:34'}],
    options:[
     {label:'내가 확인한 제출 안내를 보내 준다',say:'내가 아까 제출했는데 공지 맨 아래 안내 있음. 캡처 보내줄게',reply:'헐 ㄳㄳ 진짜 못 봤다 ㅋㅋ',detail:'네가 보낸 공지 캡처를 보고 친구들이 제출 위치를 확인했다. 복습을 조금 늦게 시작했다.'},
     {label:'친구들과 제출 순서를 같이 확인한다',say:'링크랑 파일 형식 같이 확인해볼 사람? 나도 한번 더 볼게',reply:'ㅇㅋ 지금 확인할게. 파일 형식부터 보자',detail:'파일 형식과 마감 시간을 같이 확인했다. 친구들을 도우느라 저녁 시간이 줄었다.'},
     {label:'늦은 시간이라 답장하지 않고 쉰다',say:null,reply:null,detail:'그날 밤에는 답장하지 않았다. 다음날 친구들은 제출 방법을 서로 확인했다. 너는 충분히 쉬었다.'}
    ]
   },
   'ordinary-chat':{
    room:'중학교 · 수행평가 단톡',
    messages:[{sender:'민서',text:'얘들아 수행 어디에 제출하는 거임? 링크 나만 안 보임? ㅋㅋ',time:'오후 8:32'},
     {sender:'지우',text:'읽씹 뭐냐 ㅋㅋ 나도 모르겠는데 아는 사람?',time:'오후 8:34'}],
    options:[
     {label:'제출 위치와 파일 형식을 알려 준다',say:'공지 아래 제출 안내 있음. 파일 형식도 적혀 있어 내가 캡처 보낼게',reply:'아 거기였어? ㅋㅋ 고마워',detail:'제출 위치와 파일 형식을 캡처해 공유했다. 친구들이 마감 전에 제출했고, 너도 내 과제의 누락을 다시 살폈다.'},
     {label:'친구들과 공지 내용을 다시 확인한다',say:'나도 지금 다시 볼게. 제출 링크랑 마감 시간 같이 확인할 사람?',reply:'ㅇㅋㅇㅋ 나 파일 형식 확인해봄',detail:'친구들이 공지의 제출 링크와 형식을 나눠 확인했다. 질문이 이어져 네 복습 시간은 줄었다.'},
     {label:'지금은 답장하지 않고 쉬기로 한다',say:null,reply:null,detail:'휴대폰을 뒤집어 놓고 잠들었다. 친구들은 밤새 제출 링크를 찾았고 너는 다음날 학교에서 뒤늦게 소식을 들었다.'}
    ]
   },
   'science-chat':{
    room:'중학교 · 탐구 동아리 단톡',
    messages:[{sender:'민호',text:'야 이 보고서 계산 왜 안 맞음? 이 표 단위 맞는 거 같은데;;',time:'오후 8:32'},
     {sender:'지우',text:'두 번째 줄만 값이 튀는 듯? 단위 환산 다시 봐봐',time:'오후 8:34'}],
    options:[
     {label:'단위 환산 과정을 직접 검산해 보내 준다',say:'2번째 줄에서 단위 바뀐 거 같은데? 내가 계산 다시 해볼게',reply:'와 이거였네 ㅋㅋ 덕분에 찾음',detail:'단위 환산에서 빠진 값을 찾아 민호에게 알려 줬다. 검산하며 너도 내 보고서의 실수를 잡았다.'},
     {label:'내일 실험실에서 같이 검산하기로 한다',say:'지금은 파일 못 열어봄 ㅠ 낼 실험실에서 같이 확인하자',reply:'ㅇㅋㅇㅋ 낼 쉬는 시간에 보자',detail:'민호와 다음날 실험실에서 단위 환산을 다시 확인하기로 했다. 그날 밤 준비는 각자 끝냈다.'},
     {label:'내 보고서를 먼저 마무리한다',say:null,reply:null,detail:'민호의 질문에는 다른 친구가 늦게 답했다. 너는 자신의 계산을 마무리했다.'}
    ]
   },
   'former-class-president':{
    room:'중학교 · 수행평가 단톡',
    messages:[{sender:'민서',text:'제출 기준 잘못 공유된 거 같은데? 파일 형식 다들 다르게 알고 있음',time:'오후 8:32'},
     {sender:'지우',text:'너 예전에 반장이었잖아. 공지 정리 좀 같이 해줄 수 있음?',time:'오후 8:34'}],
    options:[
     {label:'제출 기준을 다시 확인하고 정리한다',say:'잠깐 원문 확인하고 기준 정리해서 올릴게. 다 같이 한번씩 봐줘',reply:'ㅇㅋ 내가 파일 형식 체크할게',detail:'친구들에게 원문을 다시 확인하도록 역할을 나눴다. 다만 질문을 받느라 네 숙제는 늦어졌다.'},
     {label:'공식 공지만 공유하고 내 숙제를 끝낸다',say:'공식 공지 링크 여기 있음. 나는 숙제부터 끝내야 해서 각자 확인 부탁 ㅠ',reply:'ㅇㅋ 링크 고마워. 우리는 다시 볼게',detail:'원문 링크를 공유한 뒤 내 과제를 마무리했다. 일부는 더 자세한 정리를 기대했지만 이번에는 스스로 선을 정했다.'},
     {label:'지금 학급 임원에게 공동 정리를 제안한다',say:'이번 반장한테도 물어볼게. 나랑 역할 나눠서 공지 정리하자',reply:'ㅇㅋ 반장이랑 내가 제출 형식 확인해볼게',detail:'지금 학급 임원과 제출 안내 확인을 나눠 맡았다. 예전 경험을 살리되 혼자 모든 책임을 떠안지 않았다.'}
    ]
   }
  };
  for(const script of [sceneChat,...sceneChat.variants]){
   const details=chatScripts[script.id];
   if(!details||details.options.length!==script.options.length)throw new Error('중학교 채팅 대본/선택 연결 오류: '+script.id);
   script.presentation={type:'chat',room:details.room,messages:details.messages,playerMessages:{},responses:{}};
   script.options.forEach((option,i)=>{
    const line=details.options[i];
    option.label=line.label;
    option.result.history.detail=line.detail;
    script.presentation.playerMessages[option.id]=line.say;
    script.presentation.responses[option.id]=line.reply?[{sender:details.messages[0].sender,text:line.reply}]:[];
   });
  }
  return {...stages,attributes:{
   studyTimerReaction:{label:'순공 기록에 남긴 반응',hidden:true},
   schoolTrack:{label:'고교 유형',hidden:true},
   schoolProgram:{label:'학교 교육과정 유형',hidden:true},
   projectSkill:{label:'활동 경험',hidden:true},schoolRole:{label:'쌓아온 경험'},clubPath:{label:'중학교 활동 기록',hidden:true},admissionResearch:{label:'진학 조사 경로',hidden:true},counselingUsed:{label:'입학 상담 완화 사용',hidden:true}
  }};
 }
});
})(window);
