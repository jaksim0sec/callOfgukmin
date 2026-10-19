/* High-school operator: grade exams, March/June mocks and graduation. */
(function(global){
'use strict';
const S=global.GukminStory;
global.GukminDirector.register({
 id:'high',when:{phase:'high'},
 generate:persona=>S.pack(
  S.notice('high:welcome',64,'고등학교 입학','진로 과목과 내신, 모의고사 준비가 본격적으로 시작된다.',{activate:{exam:45}}),
  S.exam('high',16,1,65,'3월 모의고사','mock'),
  S.exam('high',16,1,66,'1학기 중간고사'),
  S.exam('high',16,1,67,'6월 모의고사','mock'),
  S.exam('high',16,1,68,'1학기 기말고사'),
  S.notice('high:age17',69,'고등학교 2학년','관심 있는 진로를 구체적으로 생각한다.',{attributes:{age:17}}),
  S.selection('high:career',69,'진로 동아리 활동','수업 외 시간에 무엇을 해 볼까?',[
   {label:'진로 탐색 프로젝트에 참여한다',effects:{stats:{study:4,relations:3,stress:3}},detail:'직접 경험을 쌓으며 관심 분야를 좁혔다.'},
   {label:'체력과 생활 리듬을 회복한다',effects:{stats:{health:5,stress:-6}},detail:'학습 생활의 균형을 회복했다.'},
   {label:'친구들과 교내 행사에 참여한다',effects:{stats:{relations:6,stress:-2}},detail:'친구들과 새로운 경험을 쌓았다.'}
  ]),
  S.exam('high',17,2,70,'3월 모의고사','mock'),
  S.exam('high',17,2,71,'1학기 중간고사'),
  S.exam('high',17,2,72,'6월 모의고사','mock'),
  S.exam('high',17,2,73,'1학기 기말고사'),
  S.notice('high:age18',74,'고등학교 3학년','졸업을 앞두고 학업과 진로 준비가 더욱 중요해졌다.',{attributes:{age:18}}),
  S.exam('high',18,3,75,'3월 모의고사','mock'),
  S.exam('high',18,3,76,'1학기 중간고사'),
  S.exam('high',18,3,77,'6월 모의고사','mock'),
  S.exam('high',18,3,78,'1학기 기말고사'),
  S.notice('high:graduation',79,'고등학교를 졸업했다','어떤 성적과 경험을 남겼든, 다음 인생의 선택은 아직 열려 있다.',{
   attributes:{age:19,job:'고교 졸업'},
   schools:[{kind:'high',status:'graduated'}]
  })
 )
});
})(window);
