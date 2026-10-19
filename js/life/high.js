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
 vocational:['전공 과제의 마감','실습 과제의 결과물과 설명 자료가 완성되지 않았다.']
};
const actions=[
 {label:'친구들과 사실과 자료를 확인하고 함께 정리한다',effects:{stats:{relations:5,study:3,stress:3}},detail:'자료를 검증하고 함께 문제를 풀었다.'},
 {label:'담당 선생님께 현재 상황을 설명한다',effects:{stats:{study:3,relations:2,stress:1}},detail:'직접 확인하고 현실적인 조언을 얻었다.'},
 {label:'맡은 만큼만 마무리하고 쉬기로 한다',effects:{stats:{health:3,stress:-4,study:-1}},detail:'완벽하진 않아도 무리하지 않았다.'}
];
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
  const branches=Object.entries(trackScenes).map(([track,[title,body]])=>choiceAt(
   'high:track-'+track,67,title,body,actions,{attributes:{schoolTrack:track}}));
  const unique=[
   choiceAt('high:bdja-science',72,'학교에서 안내한 과학·수학 탐구 활동',
    '분당중앙고 공개 안내에는 과학·수학 관련 활동이 있다. 어떤 방식으로 참여할까?',actions,
    {attributes:{schoolProgram:'bdja-science'}}),
   choiceAt('high:whimoon-electives',72,'다양한 선택과목의 학점 배당',
    '휘문고 공개 교육과정에서 과목 선택과 이수 학점을 검토한다. 시간을 어떻게 배분할까?',actions,
    {attributes:{schoolProgram:'whimoon-electives'}})
  ];
  const legacy=old.map(args=>{const x=S.exam('high',...args);x.event.when={turn:{lte:-1}};return x;});
  return S.pack(
   S.notice('high:welcome',64,'고등학교에 입학했다','진로 과목과 새로운 친구, 학교생활을 함께 시작한다.',{activate:{exam:45}}),
   choiceAt('high:first-day',64,'처음 본 학급 단체 채팅방',
    '누군가 과제 공지를 대신 정리해 줄 사람을 찾는다. 처음이라 더 눈치가 보인다.',[
     {label:'시간표와 제출 날짜를 확인해 공지해 준다',effects:{stats:{study:2,relations:5,stress:2}},detail:'반 친구들의 첫 인상이 좋아졌다.'},
     {label:'친구에게 말을 걸고 같이 살펴본다',effects:{stats:{relations:4,stress:-2}},detail:'함께 적응하는 친구가 생겼다.'},
     {label:'내 일정부터 정리한다',effects:{stats:{study:3,stress:-2}},detail:'스스로 일정을 챙겼다.'}
    ]),
   examWithPrelude(16,1,65,'mock'),
   choiceAt('high:recover',65,'학교생활을 다시 조율한다',
    '시험과 여러 활동이 겹쳐 몸과 마음이 지쳤다. 부담을 나누고 쉬어 갈 방법을 찾자.',[
     {label:'상담 선생님과 학습량을 조정한다',effects:{stats:{stress:-27,health:5,relations:2}}},
     {label:'잠시 쉬고 남은 시험을 준비한다',effects:{stats:{stress:-21,health:9,schoolScore:-1}}},
     {label:'가까운 사람에게 도움을 요청한다',effects:{stats:{stress:-19,health:4,relations:3}}}
    ],{stats:{stress:{gte:75}}}),
   choiceAt('high:commute',66,'아침 등굣길, 교통편이 늦었다',
    countryside?'한 시간에 몇 번 없는 버스가 늦는다. 오늘 아침 조회에 늦을지도 모른다.':'갈아타는 버스가 늦어졌고 지각할 것 같다.',[
     {label:'담임에게 상황을 알리고 안전하게 이동한다',effects:{stats:{relations:2,stress:2}},detail:'지각 사유를 먼저 알렸다.'},
     {label:'가족에게 다른 이동 방법을 부탁한다',effects:{stats:{relations:2,stress:-2}},detail:'가족과 방법을 상의했다.'},
     {label:'무리하지 않고 다음 교통편을 기다린다',effects:{stats:{health:2,stress:-3}},detail:'늦었지만 무리하지 않았다.'}
    ]),
   branches,
   examWithPrelude(16,1,68,'school'),
   S.notice('high:age17',69,'고등학교 2학년','교과 선택과 진로, 친구 관계가 복잡해지기 시작했다.',{attributes:{age:17}}),
   choiceAt('high:career',69,'가까운 친구의 고민',
    '친구가 학교생활과 진로에 대한 불안을 털어놓았다. 어떻게 이야기를 이어갈까?',[
     {label:'판단을 미루고 친구 이야기를 충분히 듣는다',effects:{stats:{relations:6,stress:1}},detail:'친구가 마음을 정리하는 데 함께했다.'},
     {label:'담임이나 상담 선생님께 도움을 청하자고 제안한다',effects:{stats:{relations:4,stress:-1}},detail:'상담받을 수 있는 방법을 함께 살폈다.'},
     {label:'산책하면서 다른 이야기도 나눈다',effects:{stats:{relations:3,health:2,stress:-2}},detail:'조금 편안한 시간을 보냈다.'}
    ]),
   examWithPrelude(17,2,70,'mock'),
   choiceAt('high:electives',71,'선택과목 신청서를 다시 써야 한다',
    '원하던 과목이 개설되지 않거나 시간이 겹친다고 한다. 다른 수업 방식도 알아볼 수 있다.',[
     {label:'공동교육과정·온라인학교를 알아본다',effects:{stats:{study:4,stress:3}},detail:'학교 밖 연계 수업을 살펴봤다.'},
     {label:'교사와 상담해 대체 과목을 택한다',effects:{stats:{study:2,relations:3,stress:-1}},detail:'이수 조건과 현실적인 선택을 조정했다.'},
     {label:'여유 있는 시간표로 다시 계획한다',effects:{stats:{health:3,study:-1,stress:-3}},detail:'학업 부담과 관심 분야를 조절했다.'}
    ]),
   unique,
   choiceAt('high:teamwork',72,'수행평가 전날, 조원 연락이 끊겼다',
    '발표가 내일인데 한 조원이 맡은 자료를 보내지 않는다. 단체방 분위기가 험악해진다.',[
     {label:'자료를 나눠서 재정리하고 발표를 준비한다',effects:{stats:{study:3,relations:4,stress:4}},detail:'불필요한 다툼 없이 발표 준비를 마쳤다.'},
     {label:'조원의 사정을 확인한다',effects:{stats:{relations:6,stress:2}},detail:'사정을 이해하고 역할을 조정했다.'},
     {label:'교사에게 현재 진행 상황을 정확히 알린다',effects:{stats:{study:3,stress:1}},detail:'상황을 정리해 전달했다.'}
    ]),
   examWithPrelude(17,2,73,'school'),
   S.notice('high:age18',74,'고등학교 3학년','졸업을 앞두고 있다. 공부뿐 아니라 사람들과의 시간도 중요해졌다.',{attributes:{age:18}}),
   examWithPrelude(18,3,75,'mock'),
   choiceAt('high:family-time',76,'주말에 온 가족의 연락',
    familyNeeds?'가족이 이번 주말 집안일을 도와 달라고 했다. 시험 준비도 신경 쓰인다.':'가족 모임과 계획해 둔 개인 일정이 겹친다.',[
     {label:'필요한 만큼 돕고 남은 시간에 공부한다',effects:{stats:{relations:5,study:1,stress:2}},detail:'가족과 시간을 나누었다.'},
     {label:'상황을 설명하고 다음 주말로 조정한다',effects:{stats:{study:3,relations:-1,stress:1}},detail:'일정을 솔직하게 설명했다.'},
     {label:'오늘은 가족과 쉬기로 한다',effects:{stats:{relations:5,health:3,stress:-4,study:-1}},detail:'함께한 시간을 기억했다.'}
    ]),
   choiceAt('high:graduation-photo',77,'졸업사진을 찍는 날',
    '친구들이 교실 뒤쪽 메모지에 한마디씩 남긴다. 마지막으로 어떤 시간을 보낼까?',[
     {label:'친구에게 고마웠던 일을 직접 적어 준다',effects:{stats:{relations:5,stress:-2}},detail:'평소 하지 못했던 말을 전했다.'},
     {label:'선생님께 진로에 관해 다시 물어본다',effects:{stats:{study:2,relations:2}},detail:'조언을 들었다.'},
     {label:'사진을 찍고 조용히 하루를 보낸다',effects:{stats:{health:2,stress:-3}},detail:'기억에 남을 하루였다.'}
    ]),
   examWithPrelude(18,3,78,'school'),
   S.notice('high:graduation',79,'고등학교를 졸업했다',
    '시험과 관계, 선택한 과목과 기억이 남았다. 다음 인생 이야기는 준비 중이다.',{
     attributes:{age:19,job:'고교 졸업'},schools:[{kind:'high',status:'graduated'}]
    }),
   legacy
  );
 }
});
})(window);
