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
  const stages=S.pack(
   {id:'infant:birth-registered',layer:'소식 이벤트',at:0,title:'출생 기록 확정'},
   S.notice('infant:age1',4,'첫돌을 맞았다','가족에게 익숙한 웃음과 표정이 생겼다.',{attributes:{age:1}}),
   S.notice('infant:age2',8,'두 살이 되었다','주변 세상을 알아가기 시작했다.',{attributes:{age:2}}),
   S.branch(S.selection('infant:home',8,'곰 인형을 발견했다',scene,[
    {label:'인형을 꼭 끌어안는다',effects:{stats:{relations:3,stress:-2},traits:{add:['낯가림']}},detail:'낯선 게 있으면 익숙한 인형을 찾는다.'},
    {label:'인형의 귀와 꼬리를 만져 본다',effects:{stats:{health:2,relations:1},traits:{add:['호기심']}},detail:'새로운 물건은 꼭 만져 봐야 직성이 풀린다.'},
    {label:'뺏겨도 다시 붙잡는다',effects:{stats:{relations:1,stress:2},traits:{add:['고집']}},detail:'하고 싶은 건 끝까지 고집해 본다.'}
   ]),[
    {id:'toy-care',priority:20,when:{traits:['금수저']},
     body:'선반에서 반짝이는 장난감 자동차를 내려놓았다. 바퀴가 굴러가자 아이 손이 먼저 움직인다.',
     options:[
      {label:'바퀴를 굴리며 안쪽을 들여다본다',effects:{attributes:{earlyTemperament:'curious'}},detail:'차를 뒤집어 놓고 바퀴가 돌아가는 걸 한참 지켜봤다.'},
      {label:'익숙한 곰 인형을 먼저 집는다',effects:{attributes:{earlyTemperament:'cautious'}},detail:'처음 본 장난감은 잠시 두고, 낡은 곰 인형을 품에 안았다.'},
      {label:'자동차를 옆으로 밀어 놓는다',effects:{attributes:{earlyTemperament:'stubborn'}},detail:'어른이 권한 장난감보다 바닥의 종이 상자가 더 좋았다.'}
     ]},
    {id:'toy-box',priority:0,
     body:'곰 인형이 의자 아래에 떨어져 있다. 누군가 주워 주려 하자 손이 먼저 뻗는다.',
     options:[
      {label:'가져온 인형의 귀를 하나씩 만져 본다',effects:{attributes:{earlyTemperament:'curious'}},detail:'귀를 접었다 폈다 하다가 안쪽의 실밥까지 발견했다.'},
      {label:'곰 인형을 받아 꼭 끌어안는다',effects:{attributes:{earlyTemperament:'cautious'}},detail:'익숙한 냄새가 나자 그제야 인형을 놓지 않았다.'},
      {label:'남이 집어 주기 전에 직접 기어가 잡는다',effects:{attributes:{earlyTemperament:'stubborn'}},detail:'엉금엉금 기어가 직접 가져왔다. 무릎에는 먼지가 묻었다.'}
     ]}
   ]),
   S.notice('infant:age3',12,'어린이집과 동네 생활',local+'에서 친구들을 만나고 낯선 생활을 접한다.',{attributes:{age:3}}),
   S.notice('infant:age4',16,'네 살이 되었다','이제 친구들과 의견을 나눌 수 있다.',{attributes:{age:4}}),
   S.branch(S.selection('infant:play',16,'친구가 내 모래삽을 잡았다',local+' 놀이터에서 친구가 내 모래삽을 가져가려 한다.',[
    {label:'같이 삽을 잡고 모래성을 만든다',effects:{stats:{relations:5,health:1},traits:{add:['배려심']}},detail:'함께 노니까 더 커다란 성을 만들 수 있었다.'},
    {label:'엄마 뒤로 쏙 숨는다',effects:{stats:{relations:1,stress:-2},traits:{add:['낯가림']}},detail:'친구가 다가오면 잠깐 숨어서 지켜본다.'},
    {label:'내 거라고 꼭 붙잡는다',effects:{stats:{health:2,relations:-1},traits:{add:['고집']}},detail:'내가 쓰던 물건은 쉽게 놓기 싫다.'}
   ]),[
    {id:'curious-play',priority:30,when:{any:[{attributes:{earlyTemperament:'curious'}},{traits:['호기심']}]},
     body:'모래성에 물을 부으면 어떻게 될까? 네가 물통을 들자 친구도 삽을 내려놓고 지켜본다.',
     options:[
      {label:'물을 조금씩 부어 모양을 확인한다',effects:{traits:{add:['호기심']}},detail:'모래가 무너졌다가 단단해졌다. 친구도 옆에서 따라 해 봤다.'},
      {label:'친구에게 물통을 건네 함께 해 본다',effects:{stats:{relations:1}},detail:'친구가 물을 부을 동안 네가 삽으로 받쳤다. 둘은 작은 둑을 만들었다.'},
      {label:'혼자 다른 자리에 새로운 성을 만든다',detail:'친구는 물놀이를 이어 갔다. 너는 옆에서 바싹 마른 모래로 성을 다시 쌓았다.'}
     ]},
    {id:'cautious-play',priority:20,when:{any:[{attributes:{earlyTemperament:'cautious'}},{traits:['낯가림']}]},
     body:'낯선 친구가 네 삽을 잡아당겼다. 옆에 있던 선생님도 잠시 상황을 지켜본다.',
     options:[
      {label:'아직 쓰는 중이라고 말한다',detail:'친구가 손을 놓았다. 말을 하니 목소리가 조금 떨렸다.'},
      {label:'다 쓰고 나서 빌려주기로 한다',effects:{stats:{relations:1}},detail:'성의 벽을 다 쌓자 삽을 건넸다. 친구는 고맙다며 다른 모양을 만들었다.'},
      {label:'선생님에게 차례를 정해 달라고 한다',detail:'선생님이 모래삽 순서를 정했다. 이제 누가 먼저 쓰는지 헷갈릴 일은 없었다.'}
     ]},
    {id:'territory-play',priority:0,
     body:'친구가 네 모래탑을 건드려 꼭대기가 무너졌다. 친구는 남은 모래를 보며 같이 고치자고 한다.',
     options:[
      {label:'화가 난 채로 친구와 다시 쌓는다',effects:{stats:{relations:1}},detail:'친구가 모래를 주워 왔다. ==아직 화는 나지만== 둘은 다시 쌓기 시작했다.'},
      {label:'내가 만든 탑이라며 다시 만지지 말라고 한다',detail:'친구는 손을 거두고 옆에 다른 성을 만들었다. 무너진 탑은 네 몫으로 남았다.'},
      {label:'잠깐 다른 놀이터로 간다',detail:'모래를 손에서 털고 그네 쪽으로 갔다. 탑은 그대로 남아 있었다.'}
     ]}
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
  return {...stages,attributes:{earlyTemperament:{label:'유년기 행동 기록',hidden:true}}};
 }
});
})(window);
