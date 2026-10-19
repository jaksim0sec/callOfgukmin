/* Infancy operator: birth, home situation, childhood choices and entrance. */
(function(global){
'use strict';
const S=global.GukminStory;
const scenes={
 soil:['살림살이를 함께 아낀다','가족의 지출이 빠듯하다. 함께할 방법을 찾는다.'],
 bronze:['평범한 가족의 주말','가족들과 동네에서 주말을 보낼 준비를 한다.'],
 silver:['새로운 체험활동','가족이 배움과 놀이를 계획한다.'],
 gold:['다양한 활동의 기회','가족이 준비해 준 놀이와 수업이 많다.'],
 diamond:['풍족하지만 바쁜 하루','물질적으로 풍족하지만 함께 보내는 시간은 한정되어 있다.']
};
global.GukminDirector.register({
 id:'infant',when:{phase:'infant'},
 generate:persona=>{
  const scene=scenes[persona.familyTier]||scenes.bronze;
  const local=persona.regionTags?.includes('어촌')?'바닷가':persona.regionTags?.includes('농촌')?'마을':'동네';
  return S.pack(
   {id:'infant:birth-registered',layer:'소식 이벤트',at:0,title:'출생 기록 확정'},
   S.notice('infant:age1',4,'첫돌을 맞았다','가족에게 익숙한 웃음과 표정이 생겼다.',{attributes:{age:1}}),
   S.notice('infant:age2',8,'두 살이 되었다','주변 세상을 알아가기 시작했다.',{attributes:{age:2}}),
   S.selection('infant:home',8,scene[0],scene[1],[
    {label:'가족과 함께 시간을 보낸다',effects:{stats:{relations:5,stress:-2}},detail:'함께하는 경험이 쌓였다.'},
    {label:'혼자 놀이에 빠져든다',effects:{stats:{health:2,relations:1}},detail:'혼자 놀며 새로운 것을 발견했다.'},
    {label:'조용히 쉬고 싶다',effects:{stats:{health:4,stress:-4}},detail:'충분히 쉬었다.'}
   ]),
   S.notice('infant:age3',12,'어린이집과 동네 생활',local+'에서 친구들을 만나고 낯선 생활을 접한다.',{attributes:{age:3}}),
   S.notice('infant:age4',16,'네 살이 되었다','이제 친구들과 의견을 나눌 수 있다.',{attributes:{age:4}}),
   S.selection('infant:play',16,'놀이터에서 함께 놀까?',local+' 놀이터에서 장난감을 함께 쓰자는 친구를 만난다.',[
    {label:'차례를 정해서 함께 논다',effects:{stats:{relations:5,health:1}},detail:'친구와 약속을 지켰다.'},
    {label:'먼저 친구에게 양보한다',effects:{stats:{relations:3,stress:1}},detail:'작은 배려를 배웠다.'},
    {label:'다른 놀이를 찾아간다',effects:{stats:{health:3,relations:-1}},detail:'새로운 놀이에 집중했다.'}
   ]),
   S.notice('infant:age5',20,'다섯 살의 일상','친구들과 더 복잡한 놀이를 시작한다.',{attributes:{age:5}}),
   S.notice('infant:age6',24,'취학 준비','곧 초등학교에 들어간다.',{attributes:{age:6}}),
   S.selection('infant:prepare',24,'학교 가기 전의 선택','학교생활을 어떻게 준비할까?',[
    {label:'무료 도서관에서 책을 읽는다',effects:{stats:{relations:3,stress:-2}},detail:'책과 친해졌다.'},
    {label:'가족과 학습 습관을 만든다',effects:{stats:{relations:2,stress:2}},detail:'차근차근 준비했다.'},
    {label:'친구들과 실컷 놀아 둔다',effects:{stats:{relations:2,health:3}},detail:'친구와 추억을 쌓았다.'}
   ]),
   S.notice('infant:school-entry',28,'초등학교 입학','지역 배정 초등학교에서 학교생활을 시작한다.',{
    attributes:{age:7,phase:'elementary',job:'초등학생'},
    schools:[{id:'local-elementary',kind:'elementary',name:'거주지 배정 초등학교',status:'enrolled'}]
   })
  );
 }
});
})(window);
