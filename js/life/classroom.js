/* Three classroom moments share saved classmates and the common choice settlement. */
(function(global){
'use strict';
const S=global.GukminStory;
const classmates=[
 {id:'minseo',name:'민서',note:'친구들과 쉽게 친해지는 다정한 친구',skill:'relations',action:'서로 만든 이야기를 읽어 본다'},
 {id:'doyun',name:'도윤',note:'쉬는 시간이면 운동장으로 달려가는 친구',skill:'athletics',action:'운동장에서 함께 바통을 연습한다'},
 {id:'jiwoo',name:'지우',note:'쉬는 시간에도 퍼즐을 들고 다니는 친구',skill:'study',action:'지우의 퍼즐을 직접 풀고 풀이를 보내 준다'}
];
function classNumber(persona){return 1+[...persona.name].reduce((n,ch)=>n+ch.codePointAt(0),0)%6;}
// Stable, limited race-day variance: roughly 15% headwind, 70% neutral, 15% tailwind.
// The seed lives with the person; no Math.random at scene generation or settlement.
function raceVariance(persona){
 const seed=String(persona.admissionSeed||persona.createdAt||persona.name)+'|classroom:relay';
 let hash=2166136261;
 for(const ch of seed){hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;}
 const bucket=hash%20;
 return bucket<3?-1:bucket>=17?1:0;
}
function chat(peer,room){return {type:'chat',room,messages:[
 {sender:peer.name,text:peer.id==='doyun'?'내일 쉬는 시간에 운동장 올래? 바통 연습 같이 하자!':peer.id==='jiwoo'?'나 수학 퍼즐 하나 만들었는데 ㅋㅋ 같이 풀어볼래?':'오늘 네가 해 준 이야기 생각나서 그림 그렸어!',time:'오후 4:12'},
 {sender:peer.name,text:peer.id==='jiwoo'?'혼자 풀어도 되고 같이 풀어도 됨. 너 어떡할래?':peer.id==='doyun'?'연습할 거면 톡 줘 ㅋㅋ':'내일도 같이 그림 그릴래?',time:'오후 4:13'}
],playerMessages:peer.id==='jiwoo'?{join:'어디서 막힘? 같이 해보자 ㅋㅋ',practice:'오케이 내가 먼저 풀어보고 보낼게',quiet:'오늘은 좀 피곤해서 낼 같이 하자'}:peer.id==='doyun'?{join:'ㅋㅋ 좋아 내일 같이 놀자',practice:'바통 연습 ㄱㄱ 내일 운동장 ㄱ?',quiet:'오늘은 좀 쉬고 낼 보자'}:{join:'나도 그 그림 좋음 ㅋㅋ',practice:'내일 서로 만든 이야기 보여주자',quiet:'오늘은 쉬고 낼 얘기하자'},responses:{join:[{sender:peer.name,text:peer.id==='jiwoo'?'ㅇㅋㅇㅋ 같이 풀자. 나도 막히던 중 ㅋㅋ':'좋아 ㅋㅋ 내일도 같이 앉자!'}],practice:[{sender:peer.name,text:peer.id==='jiwoo'?'헐 직접 풀었어? 풀이 좀 보자 ㄷㄷ':'약속! 내일 준비해서 갈게.'}],quiet:[{sender:peer.name,text:peer.id==='jiwoo'?'ㅇㅋ 낼 학교에서 보자':'ㅇㅋ 내일 봐!'}]}};}
global.GukminDirector.register({id:'classroom',when:{phase:'elementary'},generate:persona=>{
 const number=classNumber(persona),room=number+'반 친구들';
 const seating=S.selection('classroom:seating',31,'오늘은 자리를 골라 앉는 날','선생님이 오늘은 자유롭게 앉아 보라고 했다. 교실을 둘러보고 함께 지내고 싶은 짝꿍 옆 빈자리를 골라 보자.',classmates.map(peer=>({
  id:peer.id,label:peer.name+' 옆에 앉는다',effects:{...(peer.id==='doyun'?{activate:{athletics:4}}:{}),attributes:{seatmate:peer.name,elementaryClass:number},stats:peer.id==='doyun'?{athletics:2,stress:1}:peer.id==='jiwoo'?{study:2,stress:1}:{relations:2}},
  detail:peer.name+' 옆에 가방을 내려놓았다. '+number+'반 교실에서 '+(peer.id==='doyun'?'다음 쉬는 시간에 같이 뛰기로 했다.':peer.id==='jiwoo'?'책상 구석에 작은 수학 퀴즈가 오갔다.':'수업이 끝나자 서로 그린 그림을 보여 줬다.')
 })), '일상 선택',{type:'seating',classNumber:number,classmates:classmates.map(({id,name,note})=>({id,name,note}))});
 seating.event.when={attributes:{classroomRevision:1}};
 const follow=S.branch(S.selection('classroom:friend-chat',35,'짝꿍에게 온 메시지','학교가 끝난 뒤 휴대폰에 새 알림이 왔다.',[{id:'quiet',label:'오늘은 쉬고 내일 이야기한다',effects:{stats:{stress:-1}},detail:'휴대폰을 잠시 내려놓았다.'}]),classmates.map(peer=>({
  id:peer.id,title:peer.name+'에게 온 메시지',when:{attributes:{seatmate:peer.name}},body:peer.name+'와 나란히 앉은 뒤, 학교 밖에서도 대화가 이어진다. 오늘 방과 후에는 무엇을 할까?',
  options:peer.id==='jiwoo'?[
   {id:'join',label:'같이 풀자 ㅋㅋ 어디서 막혔음?',effects:{stats:{relations:2,stress:1}},detail:'지우와 풀이를 나눠 보니 서로 다른 생각을 하고 있었다. 한참 떠들었지만 문제의 실마리를 찾았다.'},
   {id:'practice',label:'일단 내가 풀어볼게. 풀이 보내줄게',risk:'혼자 검산하느라 저녁 시간이 줄어듦',effects:{stats:{study:3,stress:2,relations:-1}},detail:'혼자 몇 번씩 계산해 답을 보냈다. 풀이에는 자신이 붙었지만 지우와 같이 풀 약속은 놓쳤다.'},
   {id:'quiet',label:'지금은 좀 쉬고 낼 같이 보자',effects:{stats:{stress:-1}},detail:'지우에게 내일 보자고 보내고 휴대폰을 내려놨다. 퍼즐은 내일로 미뤘다.'}
  ]:[
   {id:'join',label:'친구 이야기를 듣고 내 이야기도 보낸다',effects:{stats:{relations:1,stress:1}},detail:peer.name+'와 한참 메시지를 주고받았다. 서로 좋아하는 것이 하나 더 늘었지만 하던 일은 늦어졌다.'},
   {id:'practice',label:peer.action,effects:{stats:{[peer.skill]:2,stress:2}},detail:peer.name+'와 다음 날 함께 연습했다. '+(peer.skill==='athletics'?'손을 내미는 타이밍이 조금씩 맞았다.':'막히던 부분을 몇 번 고치며 새로운 방법을 익혔다.')+' 다른 활동에 쓸 시간은 줄었다.'},
   {id:'quiet',label:'오늘은 쉬고 내일 이야기한다',effects:{stats:{stress:-1}},detail:peer.name+'에게 내일 보자는 짧은 답장을 보냈다. 폰을 내려놓고 쉬었다.'}
  ]
 })));
 follow.event.when={attributes:{classroomRevision:1}};
 follow.choice.presentation=chat(classmates[0],room);
 for(const variant of follow.choice.variants)variant.presentation=chat(classmates.find(peer=>peer.id===variant.id),room);
 const raceOptions=peer=>[
  {id:'sprint',label:'마지막 주자로 나가 전력 질주한다',tags:['sports'],risk:'연습 때문에 다른 과목 복습 시간이 줄어든다',effects:{...(peer.id==='doyun'?{}:{activate:{athletics:4}}),stats:{athletics:3,stress:2,study:-1},attributes:{sportsRole:'runner'}},detail:peer.name+'에게서 바통을 받아 마지막 코너를 돌았다. 결승선까지 시선을 놓지 않았다.'},
  {id:'handoff',label:'중간 주자로 바통 연결을 맞춘다',tags:['team','sports'],effects:{...(peer.id==='doyun'?{}:{activate:{athletics:4}}),stats:{athletics:1,relations:1,stress:1},attributes:{sportsRole:'runner'}},detail:peer.name+'와 손을 뻗는 위치를 맞췄다. 바통은 떨어지지 않았지만 다른 반의 주자도 빠르게 따라왔다.'},
  {id:'cheer',label:'응원석에서 반 친구들을 응원한다',effects:{stats:{relations:1,stress:-1},attributes:{sportsRole:'cheer'}},detail:peer.name+'가 달릴 때 반 이름을 크게 불렀다. 주자 명단에는 없었지만 응원석에서 함께 웃었다.'}
 ];
 const prelude=S.notice('classroom:sports-prelude',37,'내일은 운동회','교문 앞에 운동회 안내장이 붙었다. 내일 반 대항 계주가 열린다. 운동장에 나갈 친구들이 방과 후 바통을 맞춰 보기 시작했다.');
 prelude.when={attributes:{classroomRevision:1}};
 const sports=S.branch(S.selection('classroom:sports',38,number+'반, 계주 출전!', '오늘은 운동회! 함성과 응원 소리가 운동장을 채운다. 세 반이 둥근 트랙을 한 바퀴씩 이어 달린다. 우리 반에서 맡을 역할을 골라 보자.',raceOptions(classmates[0])),classmates.map(peer=>({
  id:peer.id,title:number+'반, 계주 출전!',when:{attributes:{seatmate:peer.name}},body:'오늘은 운동회! '+number+'반 깃발 아래서 함성이 터진다. '+peer.name+'가 바통을 들고 손짓한다. "우리 반 이번엔 끝까지 가 보자!"\n\n연습 뒤 운동능력 9 이상이면 우승을 노릴 수 있다. 응원석에서도 함께할 수 있다.',options:raceOptions(peer)
 })));
 sports.event.when={attributes:{classroomRevision:1}};
 sports.choice.presentation={type:'sports',classNumber:number};
 const variance=raceVariance(persona);
 // Only borderline finishes change with luck. Strong preparation still wins reliably.
 const wins={all:[{attributes:{sportsRole:'runner'}},{any:[{stats:{athletics:{gte:9-variance}}},{traits:['체육']}]}]};
 for(const script of [sports.choice,...sports.choice.variants])for(const option of script.options){
  option.result.conditional=[
   {when:wins,result:{effects:{attributes:{sportsPlace:1},stats:{relations:3,athletics:2}},history:{title:'반 대항 계주 · '+number+'반 1등',detail:'막판에 한 명을 추월해 우승했다! 함께 연습한 친구들과 기쁨을 나누며 반의 단합도 단단해졌다.',importance:'major'}}},
   {when:{all:[{not:wins},{attributes:{sportsRole:'runner'}}]},result:{effects:{attributes:{sportsPlace:3}},history:{title:'반 대항 계주 · '+number+'반 3등',detail:'마지막 코너에서 두 반에 추월당했다. 그래도 바통을 끝까지 전달했다.'}}},
   {when:{attributes:{sportsRole:'cheer'}},result:{effects:{attributes:{sportsPlace:2}},history:{title:'반 대항 계주 · '+number+'반 2등',detail:'주자들이 응원 소리에 힘을 내 막판에 한 반을 따라잡았다.'}}}
  ];
 }
 return {...S.pack(seating,follow,prelude,sports),attributes:{classroomRevision:{label:'교실 이야기 연결',hidden:true},elementaryClass:{label:'초등학교 첫 반',hidden:true},seatmate:{label:'초등학교 짝꿍'},sportsRole:{label:'운동회 역할',hidden:true},sportsPlace:{label:'반 대항 계주 순위',hidden:true}}};
}});
})(window);
