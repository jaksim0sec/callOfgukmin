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
    ...(qualifies?{when:{stats:{schoolScore:{gte:school.minScore},study:{gte:school.minStudy}}}}:{}),
    effects:{
     attributes:{age:16,phase:'high',job:'고등학생'},
     schools:[
      {id:'local-middle',kind:'middle',name:'거주지 배정 중학교',status:'graduated'},
      {id:school.id,kind:'high',name:school.name,status:'enrolled'}
     ],
     activate:{exam:45},
     stats:{stress:school.load*2,study:school.load}
    },
    detail:school.name+'에 진학했다. 학교별 선발과 교육 과정은 실제와 다를 수 있다.',
    historyTitle:school.name+' 입학'
   };
  });
  return S.pack(
   S.notice('middle:welcome',52,'중학교 첫 등교','과목별 시험과 수행평가가 시작된다.',{activate:{schoolScore:50}}),
   S.exam('middle',13,1,53,'1학기 중간고사'),
   S.exam('middle',13,1,54,'1학기 기말고사'),
   S.selection('middle:friends',55,'새로운 동아리 모집','수업 외에 함께할 활동을 찾는다.',[
    {label:'친구와 봉사 동아리에 참가한다',effects:{stats:{relations:6,stress:2}},detail:'봉사 활동을 통해 새로운 친구를 알게 됐다.'},
    {label:'독서·토론 모임을 신청한다',effects:{stats:{study:4,stress:2}},detail:'토론과 발표 경험을 쌓았다.'},
    {label:'방과 후는 쉬기로 한다',effects:{stats:{health:3,stress:-5}},detail:'공부와 휴식의 균형을 잡았다.'}
   ]),
   S.notice('middle:age14',56,'중학교 2학년','시험 준비 방법을 조금씩 익혀 간다.',{attributes:{age:14}}),
   S.exam('middle',14,2,57,'1학기 중간고사'),
   S.exam('middle',14,2,58,'1학기 기말고사'),
   S.selection('middle:resources',59,'시험 대비 방법을 고른다',family?'유료 학원이 부담스럽다. 학교 프로그램도 이용할 수 있다.':'다양한 공부 방식 중 하나를 고를 수 있다.',[
    {id:'teacher',label:'학교 선생님에게 질문한다',effects:{stats:{study:5,relations:2,stress:1}},detail:'학교 수업에서 부족한 부분을 채웠다.'},
    {id:'peer',label:'친구와 스터디를 연다',effects:{stats:{study:3,relations:4,stress:2}},detail:'서로의 약점을 도우며 공부했다.'},
    {id:'paid',label:'유료 보충 수업을 신청한다',when:{stats:{allowance:{gte:10000}}},effects:{stats:{study:7,allowance:-5000,stress:5}},detail:'유료 보충 수업에 시간을 투자했다.'}
   ]),
   S.notice('middle:age15',60,'중학교 3학년','고등학교 진학을 생각할 때가 왔다.',{attributes:{age:15}}),
   S.exam('middle',15,3,61,'1학기 중간고사'),
   S.exam('middle',15,3,62,'1학기 기말고사'),
   S.selection('middle:high-application',63,'고등학교 진학 원서','출신 지역과 현재 학업 성적을 바탕으로 지원 학교를 고른다. 실제 모집요강을 대신하지 않는 게임용 모형이다.',
     proposals,'한방 선택',{type:'school',region:global.GukminSchools.regionOf(persona),year:'중학교 3학년'})
  );
 }
});
})(window);
