/* Three classroom moments share saved classmates and the common choice settlement. */
(function(global){
'use strict';
const S=global.GukminStory;
const classmates=[
 {id:'minseo',name:'민서',note:'이야기 나누기를 좋아하는 친구',skill:'study',action:'서로 만든 이야기를 읽어 본다'},
 {id:'doyun',name:'도윤',note:'쉬는 시간이면 운동장으로 달려가는 친구',skill:'athletics',action:'운동장에서 함께 바통을 연습한다'},
 {id:'jiwoo',name:'지우',note:'궁금한 건 끝까지 풀어 보는 친구',skill:'study',action:'서로 낸 수학 퍼즐을 풀어 본다'}
];
function classNumber(persona){return 1+[...persona.name].reduce((n,ch)=>n+ch.codePointAt(0),0)%6;}
function chat(peer,room){return {type:'chat',room,messages:[
 {sender:peer.name,text:peer.id==='doyun'?'내일 쉬는 시간에 운동장 올래? 바통 연습 같이 하자!':peer.id==='jiwoo'?'내가 만든 문제 풀어 볼래? 답은 아직 비밀 ㅋㅋ':'오늘 네가 해 준 이야기 생각나서 그림 그렸어!',time:'오후 4:12'},
 {sender:peer.name,text:'너는 뭐 하고 싶어?',time:'오후 4:13'}
],responses:{join:[{sender:peer.name,text:'좋아 ㅋㅋ 내일도 같이 앉자!'}],practice:[{sender:peer.name,text:'약속! 내일 준비해서 갈게.'}],quiet:[{sender:'알림',text:'알림을 잠시 껐습니다.'}]}};}
global.GukminDirector.register({id:'classroom',when:{phase:'elementary'},generate:persona=>{
 const number=classNumber(persona),room=number+'반 친구들';
 const seating=S.selection('classroom:seating',31,'오늘은 자리를 골라 앉는 날','선생님이 오늘은 자유롭게 앉아 보라고 했다. 교실을 둘러보고 함께 지내고 싶은 짝꿍 옆 빈자리를 골라 보자.',classmates.map(peer=>({
  id:peer.id,label:peer.name+' 옆에 앉는다',effects:{activate:{athletics:4},attributes:{seatmate:peer.name,elementaryClass:number},stats:peer.id==='doyun'?{athletics:2,stress:1}:peer.id==='jiwoo'?{study:2,stress:1,relations:-1}:{relations:1}},
  detail:peer.name+' 옆에 가방을 내려놓았다. '+number+'반 교실에서 '+(peer.id==='doyun'?'다음 쉬는 시간에 같이 뛰기로 했다.':peer.id==='jiwoo'?'책상 구석에 작은 수학 퀴즈가 오갔다.':'수업이 끝나자 서로 그린 그림을 보여 줬다.')
 })), '일상 선택',{type:'seating',classNumber:number,classmates:classmates.map(({id,name,note})=>({id,name,note}))});
 seating.event.when={attributes:{classroomRevision:1}};
 const follow=S.branch(S.selection('classroom:friend-chat',35,'짝꿍에게 온 메시지','학교가 끝난 뒤 휴대폰에 새 알림이 왔다.',[{id:'quiet',label:'오늘은 쉬고 내일 이야기한다',effects:{stats:{stress:-1}},detail:'휴대폰을 잠시 내려놓았다.'}]),classmates.map(peer=>({
  id:peer.id,title:peer.name+'에게 온 메시지',when:{attributes:{seatmate:peer.name}},body:peer.name+'와 나란히 앉은 뒤, 학교 밖에서도 대화가 이어진다. 오늘 방과 후에는 무엇을 할까?',
  options:[
   {id:'join',label:'친구 이야기를 듣고 내 이야기도 보낸다',effects:{stats:{relations:1,stress:1}},detail:peer.name+'와 한참 메시지를 주고받았다. 서로 좋아하는 것이 하나 더 늘었지만 하던 일은 늦어졌다.'},
   {id:'practice',label:peer.action,effects:{stats:{[peer.skill]:2,stress:2}},detail:peer.name+'와 다음 날 함께 연습했다. '+(peer.skill==='athletics'?'손을 내미는 타이밍이 조금씩 맞았다.':'막히던 부분을 몇 번 고치며 새로운 방법을 익혔다.')+' 다른 활동에 쓸 시간은 줄었다.'},
   {id:'quiet',label:'오늘은 쉬고 내일 이야기한다',effects:{stats:{stress:-1}},detail:peer.name+'에게 내일 보자는 짧은 답장을 보냈다. 폰을 내려놓고 쉬었다.'}
  ]
 })));
 follow.event.when={attributes:{classroomRevision:1}};
 follow.choice.presentation=chat(classmates[0],room);
 for(const variant of follow.choice.variants)variant.presentation=chat(classmates.find(peer=>peer.id===variant.id),room);
 const raceOptions=peer=>[
  {id:'sprint',label:'마지막 주자로 나가 전력 질주한다',tags:['sports'],risk:'연습 때문에 다른 과목 복습 시간이 줄어든다',effects:{stats:{athletics:3,stress:2,study:-1},attributes:{sportsRole:'runner'}},detail:peer.name+'에게서 바통을 받아 마지막 코너를 돌았다. 결승선까지 시선을 놓지 않았다.'},
  {id:'handoff',label:'중간 주자로 바통 연결을 맞춘다',tags:['team','sports'],effects:{stats:{athletics:1,relations:1,stress:1},attributes:{sportsRole:'runner'}},detail:peer.name+'와 손을 뻗는 위치를 맞췄다. 바통은 떨어지지 않았지만 다른 반의 주자도 빠르게 따라왔다.'},
  {id:'cheer',label:'응원석에서 반 친구들을 응원한다',effects:{stats:{relations:1,stress:-1},attributes:{sportsRole:'cheer'}},detail:peer.name+'가 달릴 때 반 이름을 크게 불렀다. 주자 명단에는 없었지만 응원석에서 함께 웃었다.'}
 ];
 const sports=S.branch(S.selection('classroom:sports',38,number+'반, 계주 출전!', '우리 반과 다른 반이 운동장을 한 바퀴씩 이어 달린다. 실력도 중요하지만 바통을 넘기는 호흡도 필요하다.',raceOptions(classmates[0])),classmates.map(peer=>({
  id:peer.id,title:number+'반, 계주 출전!',when:{attributes:{seatmate:peer.name}},body:'운동장에 '+number+'반 깃발이 걸렸다. '+peer.name+'가 바통을 들고 손짓한다. "우리 반 이번엔 끝까지 가 보자!"\n\n연습 뒤 운동능력 9 이상이면 선두 경쟁에서 이긴다. 응원석에서도 함께할 수 있다.',options:raceOptions(peer)
 })));
 sports.event.when={attributes:{classroomRevision:1}};
 sports.choice.presentation={type:'sports',classNumber:number};
 const wins={all:[{attributes:{sportsRole:'runner'}},{any:[{stats:{athletics:{gte:9}}},{traits:['체육']}]}]};
 for(const script of [sports.choice,...sports.choice.variants])for(const option of script.options){
  option.result.conditional=[
   {when:wins,result:{effects:{attributes:{sportsPlace:1}},history:{title:'반 대항 계주 · '+number+'반 1등',detail:'준비한 호흡이 끝까지 이어졌다. 우리 반이 가장 먼저 결승선을 통과했다.',importance:'major'}}},
   {when:{all:[{not:wins},{attributes:{sportsRole:'runner'}}]},result:{effects:{attributes:{sportsPlace:3}},history:{title:'반 대항 계주 · '+number+'반 3등',detail:'마지막 코너에서 두 반에 추월당했다. 그래도 바통을 끝까지 전달했다.'}}},
   {when:{attributes:{sportsRole:'cheer'}},result:{effects:{attributes:{sportsPlace:2}},history:{title:'반 대항 계주 · '+number+'반 2등',detail:'주자들이 응원 소리에 힘을 내 막판에 한 반을 따라잡았다.'}}}
  ];
 }
 return {...S.pack(seating,follow,sports),attributes:{classroomRevision:{label:'교실 이야기 연결',hidden:true},elementaryClass:{label:'초등학교 첫 반',hidden:true},seatmate:{label:'초등학교 짝꿍'},sportsRole:{label:'운동회 역할',hidden:true},sportsPlace:{label:'반 대항 계주 순위',hidden:true}}};
}});
})(window);
