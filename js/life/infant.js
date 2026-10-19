/* Infancy operator: birth, home situation, childhood choices and entrance. */
(function(global){
'use strict';
const S=global.GukminStory;
const scenes={
 soil:'집에서 물려받은 곰 인형을 발견했다.',
 bronze:'소파 위에 작은 곰 인형이 놓여 있다.',
 silver:'장난감 상자에서 곰 인형을 꺼냈다.',
 gold:'가지런한 장난감 선반에 새 곰 인형이 있다.',
 diamond:'넓은 놀이방에서 곰 인형이 눈에 띈다.'
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
   S.selection('infant:home',8,'곰 인형을 발견했다',scene,[
    {label:'인형을 꼭 끌어안는다',effects:{stats:{relations:3,stress:-2},traits:{add:['낯가림']}},detail:'낯선 게 있으면 익숙한 인형을 찾는다.'},
    {label:'인형의 귀와 꼬리를 만져 본다',effects:{stats:{health:2,relations:1},traits:{add:['호기심']}},detail:'새로운 물건은 꼭 만져 봐야 직성이 풀린다.'},
    {label:'뺏겨도 다시 붙잡는다',effects:{stats:{relations:1,stress:2},traits:{add:['고집']}},detail:'하고 싶은 건 끝까지 고집해 본다.'}
   ]),
   S.notice('infant:age3',12,'어린이집과 동네 생활',local+'에서 친구들을 만나고 낯선 생활을 접한다.',{attributes:{age:3}}),
   S.notice('infant:age4',16,'네 살이 되었다','이제 친구들과 의견을 나눌 수 있다.',{attributes:{age:4}}),
   S.selection('infant:play',16,'친구가 내 모래삽을 잡았다',local+' 놀이터에서 친구가 내 모래삽을 가져가려 한다.',[
    {label:'같이 삽을 잡고 모래성을 만든다',effects:{stats:{relations:5,health:1},traits:{add:['배려심']}},detail:'함께 노니까 더 커다란 성을 만들 수 있었다.'},
    {label:'엄마 뒤로 쏙 숨는다',effects:{stats:{relations:1,stress:-2},traits:{add:['낯가림']}},detail:'친구가 다가오면 잠깐 숨어서 지켜본다.'},
    {label:'내 거라고 꼭 붙잡는다',effects:{stats:{health:2,relations:-1},traits:{add:['고집']}},detail:'내가 쓰던 물건은 쉽게 놓기 싫다.'}
   ]),
   S.notice('infant:age5',20,'다섯 살의 일상','친구들과 더 복잡한 놀이를 시작한다.',{attributes:{age:5}}),
   S.notice('infant:age6',24,'취학 준비','곧 초등학교에 들어간다.',{attributes:{age:6}}),
   S.selection('infant:prepare',24,'내일은 처음 학교에 간다','가방을 싸다 보니 필통, 크레파스, 새 공책이 눈에 띈다.',[
    {label:'공책 첫 장에 낙서를 한다',effects:{stats:{relations:1,health:2},traits:{add:['호기심']}},detail:'새 공책에는 무언가 그려 보고 싶었다.'},
    {label:'필통 속 연필을 몇 번이나 세어 본다',effects:{stats:{relations:2,stress:1},traits:{add:['꼼꼼함']}},detail:'준비물은 빠짐없이 챙기고 싶다.'},
    {label:'가방을 옆에 두고 일찍 잠든다',effects:{stats:{health:3,stress:-3},traits:{add:['느긋함']}},detail:'내일은 내일 생각하기로 했다.'}
   ]),
   S.notice('infant:school-entry',28,'초등학교 입학','지역 배정 초등학교에서 학교생활을 시작한다.',{
    attributes:{age:7,phase:'elementary',job:'초등학생'},
    schools:[{id:'local-elementary',kind:'elementary',name:'거주지 배정 초등학교',status:'enrolled'}]
   })
  );
 }
});
})(window);
