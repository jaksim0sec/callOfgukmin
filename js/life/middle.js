/* Middle-school operator: cumulative grade choices and regional high-school application. */
(function(global){
'use strict';
const S=global.GukminStory;
global.GukminDirector.register({
 id:'middle',when:{phase:'middle'},
 generate:persona=>{
  const candidates=global.GukminSchools.options(persona);
  const family=['soil','bronze'].includes(persona.familyTier);
  const proposals=candidates.map((school,index)=>{
   const qualifies=school.minScore||school.minStudy;
   return {
    id:school.id,label:school.name,
    school,
    ...(qualifies||school.travelCost?{when:{stats:{
     ...(qualifies?{schoolScore:{gte:school.minScore}}:{}),
     ...(school.travelCost?{money:{gte:school.travelCost}}:{})
    }}}:{}),
    effects:{
     attributes:{age:16,phase:'high',job:'고등학생',schoolTrack:school.kind,schoolProgram:school.program},
     schools:[
      {id:'local-middle',kind:'middle',name:'거주지 배정 중학교',status:'graduated'},
      {id:school.id,kind:'high',name:school.name,status:'enrolled'}
     ],
     activate:{exam:45},
     stats:{stress:school.load*2+(school.distanceKm>85?4:school.distanceKm>35?2:0),
      study:school.load,...(school.travelCost?{money:-school.travelCost}:{})}
    },
    detail:school.name+'에 진학했다. 실제 배정·전형 절차와 다르게 단순화한 게임 결과다.',
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
    {label:'담임·상담 선생님과 계획을 다시 잡는다',effects:{stats:{stress:-28,health:5,relations:2}}},
    {label:'과제를 나누어 하고 며칠 쉬어 간다',effects:{stats:{stress:-22,health:8,schoolScore:-1}}},
    {label:'친구와 산책하며 생각을 정리한다',effects:{stats:{stress:-18,health:4,relations:4}}}
   ]),event:{...S.selection('middle:recover',55,'', '',[{label:'회복'}]).event,when:{turn:{eq:55},stats:{stress:{gte:65}}}}},
   S.notice('middle:age14',56,'중학교 2학년','시험 준비 방법을 조금씩 익혀 간다.',{attributes:{age:14}}),
   S.examPrelude('middle',2,57,'1학기 중간고사'),
   S.exam('middle',14,2,57,'1학기 중간고사'),
   S.examPrelude('middle',2,58,'1학기 기말고사'),
   S.exam('middle',14,2,58,'1학기 기말고사'),
   S.branch(S.selection('middle:resources',59,'시험 대비 방법을 고른다',family?'유료 학원이 부담스럽다. 학교 프로그램도 이용할 수 있다.':'다양한 공부 방식 중 하나를 고를 수 있다.',[
    {id:'teacher',label:'학교 선생님에게 질문한다',effects:{stats:{study:5,relations:2,stress:1}},detail:'학교 수업에서 부족한 부분을 채웠다.'},
    {id:'peer',label:'친구와 스터디를 연다',effects:{stats:{study:3,relations:4,stress:2}},detail:'서로의 약점을 도우며 공부했다.'},
    {id:'paid',label:'유료 보충 수업을 신청한다',when:{stats:{money:{gte:5000}}},effects:{stats:{study:7,money:-5000,stress:5}},detail:'유료 보충 수업에 시간을 투자했다.'}
   ]),[
    {id:'lab-study',priority:30,when:{attributes:{clubPath:'science'}},
     body:'민호가 단체방에 문제집 사진을 올렸다. "이 풀이 틀린 것 같은데 선생님께 물어볼래?" 다음 시험 범위에 있는 문제다.',
     options:[
      {id:'teacher',label:'틀린 식을 표시하고 담당 선생님께 질문한다',effects:{stats:{study:3}},detail:'민호와 잘못된 식을 고쳤다. 시험 범위의 다른 문제도 직접 풀어 봤다.'},
      {id:'peer',label:'민호와 오답을 서로 검토한다',effects:{stats:{study:2,relations:1}},detail:'서로 놓친 계산을 찾아냈다. 민호가 다음 주에도 같이 보자고 했다.'},
      {id:'paid',label:'해당 단원 유료 보충 수업을 듣는다',when:{stats:{money:{gte:5000}}},effects:{stats:{study:4,money:-5000}},detail:'수업료 5,000원을 냈다. 여러 유형을 풀어 봤지만 민호의 의문은 따로 확인해야 했다.'}
     ]},
    {id:'club-study',priority:20,when:{attributes:{clubPath:'media'}},
     body:'예린과 편집을 끝내고 보니 시험 전날이다. 숙제는 남았고 영상은 또 수정해 달라는 요청이 왔다.',
     options:[
      {id:'teacher',label:'추가 편집을 거절하고 학교 보충 자료로 복습한다',effects:{stats:{study:3}},detail:'예린에게 마감이 어렵다고 알렸다. 복습은 끝냈지만 수정 작업은 다음 담당자에게 넘어갔다.'},
      {id:'peer',label:'예린과 서로 빈 수업 내용을 확인한다',effects:{stats:{study:2,relations:1}},detail:'예린이 필기를 보내 줬고 너는 빠진 공지를 전달했다. 둘 다 완벽하진 않았다.'},
      {id:'paid',label:'학원 자습실에서 부족한 진도를 메운다',when:{stats:{money:{gte:5000}}},effects:{stats:{study:4,money:-5000}},detail:'5,000원을 내고 자습실을 이용했다. 영상 수정은 늦게 끝났다.'}
     ]},
    {id:'resource-default',priority:0,
     body:'시험 범위가 칠판에 적혔다. 반 친구들은 학원 시간표부터 펼쳤지만 무료 학교 보충 교실도 있다.',
     options:[
      {id:'teacher',label:'학교 보충 교실에서 틀린 문제를 다시 푼다',effects:{stats:{study:3}},detail:'틀린 문제를 분류해 다시 풀었다. 선생님은 정답보다 풀이를 먼저 물었다.'},
      {id:'peer',label:'친구와 각자 한 단원씩 설명해 본다',effects:{stats:{study:2,relations:1}},detail:'서로 설명하다가 둘 다 모르던 단원을 찾았다. 다음 날 다시 확인했다.'},
      {id:'paid',label:'유료 보충 수업에 등록한다',when:{stats:{money:{gte:5000}}},effects:{stats:{study:4,money:-5000}},detail:'수강료 5,000원을 지불했다. 학원에서 연습 문제를 풀었다.'}
     ]}
   ]),
   S.notice('middle:age15',60,'중학교 3학년','고등학교 진학을 생각할 때가 왔다.',{attributes:{age:15}}),
   S.selection('middle:admission-prep',60,'고교 원서보다 먼저 필요한 것',
    family?'친구들은 입학 컨설팅을 예약하는데 비용이 부담된다. 교실 뒤에는 무료 교육청 설명회 공지가 붙어 있다.':'가족이 여러 학교의 교육과정을 비교해 보자고 했다. 설명회와 유료 상담 안내가 함께 들어왔다.',[
     {id:'public',label:'교육청 무료 설명회에서 실제 모집요강을 확인한다',
      effects:{stats:{study:1}},detail:'전형이 학교마다 달랐다. 설명회에서 받은 안내서를 표시하고 지원 가능한 학교를 추렸다.'},
     {id:'mentor',label:'담임과 학교 유형별 수업을 비교한다',
      detail:'상담실에서 지원 일정과 교육과정을 비교했다. 결정하기 전에 가족과 한 번 더 이야기하기로 했다.'},
     {id:'paid',label:'유료 진학 상담을 받고 전형표를 정리한다',when:{stats:{money:{gte:6000}}},
      effects:{stats:{study:2,money:-6000}},detail:'상담료 6,000원을 냈다. 상담에서 받은 표를 원서와 대조했고 과장된 합격 보장은 걸러냈다.'}
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
   clubPath:{label:'중학교 활동 기록',hidden:true}
  }};
 }
});
})(window);
