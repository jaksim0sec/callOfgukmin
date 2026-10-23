/* Three classroom moments share saved classmates and the common choice settlement. */
(function(global){
'use strict';
const S=global.GukminStory;
const classmates=[
 {id:'minseo',name:'민서',note:'친구들과 쉽게 친해지는 다정한 친구',skill:'relations',action:'서로 만든 이야기를 읽어 본다'},
 {id:'doyun',name:'도윤',note:'쉬는 시간이면 운동장으로 달려가는 친구',skill:'athletics',action:'운동장에서 함께 바통을 연습한다'},
 {id:'jiwoo',name:'지우',note:'쉬는 시간에도 퍼즐을 들고 다니는 친구',skill:'study',action:'지우의 퍼즐을 직접 풀고 풀이를 보내 준다'}
];
function classNumber(persona){if(Number.isInteger(persona.attributes?.elementaryClass)&&persona.attributes.elementaryClass>=1&&persona.attributes.elementaryClass<=6)return persona.attributes.elementaryClass;return 1+[...persona.name].reduce((n,ch)=>n+ch.codePointAt(0),0)%6;}
function fieldSeed(persona,key){let hash=2166136261;for(const c of String(persona.admissionSeed||persona.createdAt||persona.name)+'|relay-field|'+key)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;return hash;}
function raceField(persona){const number=classNumber(persona),others=[1,2,3,4,5,6].filter(n=>n!==number).sort((a,b)=>fieldSeed(persona,'team:'+a)-fieldSeed(persona,'team:'+b));return {teams:[number,...others.slice(0,2)],rivalOrder:fieldSeed(persona,'rival-order')%2};}
// The frozen script holds one race-day draw. Preparation raises the chance of a
// good finish against that same draw; neither reload nor changing roles rerolls it.
function raceCondition(draw,base,slope,traitBonus,ceiling){
 if(draw>=ceiling)return {any:[]};
 const ability=bonus=>({stats:{athletics:{gte:Math.max(0,Math.floor((draw-base-bonus)/slope)+1)}}});
 return {any:[ability(0),{all:[{traits:['체육']},ability(traitBonus)]}]};
}
function chat(peer,room){return {type:'chat',room,messages:[
 {sender:peer.name,text:peer.id==='doyun'?'내일 쉬는 시간에 운동장 올래? 바통 연습 같이 하자!':peer.id==='jiwoo'?'수학 숙제 4번, 난 답이 12인데 풀이가 다른 것 같아. 네 풀이랑 비교해 볼래?':'오늘 네가 해 준 이야기 생각나서 그림 그렸어!',time:'오후 4:12'},
 {sender:peer.name,text:'너는 뭐 하고 싶어?',time:'오후 4:13'}
],responses:{join:[{sender:peer.name,text:'좋아 ㅋㅋ 내일도 같이 앉자!'}],practice:[{sender:peer.name,text:'약속! 내일 준비해서 갈게.'}],quiet:[{sender:'알림',text:'알림을 잠시 껐습니다.'}]}};}
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
 const jiwoo=follow.choice.variants.find(v=>v.id==='jiwoo');
 jiwoo.body='짝꿍 지우가 숙제 사진을 보냈다. 둘 다 답은 맞았지만 계산 순서가 다르다. 오늘 남은 시간에 어디까지 이야기할지 정하자.';
 jiwoo.options[0].label='내가 푼 방법을 짧게 보내고 지우의 풀이도 들어 본다';
 jiwoo.options[0].result.history.detail='지우가 왜 먼저 나눴는지 설명해 줬다. 긴 검산까지 하지는 않았지만 서로의 풀이 습관을 알게 됐다.';
 jiwoo.options[1].label='풀이를 한 줄씩 대조하며 끝까지 검산한다';
 jiwoo.options[1].result.history.detail='같은 답이 나오는 두 풀이를 한 줄씩 비교했다. 문제를 보는 방법은 늘었지만 다른 숙제를 시작할 시간이 늦어졌다.';
 jiwoo.options[2].label='“오늘은 쉬고 내일 교실에서 같이 보자”라고 답한다';
 jiwoo.presentation.playerMessages={join:'난 먼저 묶어서 풀었어. 너는 어떤 방법이었어?',practice:'사진 보면서 한 줄씩 같이 확인해 보자.',quiet:'오늘은 쉬고 내일 교실에서 같이 보자.'};
 jiwoo.presentation.responses={join:[{sender:'지우',text:'아 먼저 이렇게 묶는 거구나. 설명 고마워!'}],practice:[{sender:'지우',text:'여기서 계산 순서만 달랐네! 둘 다 맞는지 끝까지 확인해 보자.'}],quiet:[{sender:'지우',text:'응, 내일 공책 가져갈게. 푹 쉬어!'}]};
 const raceOptions=peer=>[
  {id:'sprint',label:'전력 질주를 집중 연습하고 마지막 주자로 뛴다',tags:['sports'],risk:'연습 때문에 다른 과목 복습 시간이 줄어든다',effects:{stats:{athletics:3,stress:2,study:-1},attributes:{sportsRole:'runner'}},detail:'출전 전 마지막 직선 주법을 연습했다. '+peer.name+'에게서 바통을 받아 마지막 코너를 돌았다. 결승선까지 시선을 놓지 않았다.'},
  {id:'handoff',label:'바통 주고받기를 맞춰 중간 주자로 뛴다',tags:['team','sports'],effects:{stats:{athletics:1,relations:1,stress:1},attributes:{sportsRole:'runner'}},detail:peer.name+'와 손을 뻗는 위치를 맞췄다. 바통은 떨어지지 않았지만 다른 반의 주자도 빠르게 따라왔다.'},
  {id:'cheer',label:'응원석에서 반 친구들을 응원한다',effects:{stats:{relations:1,stress:-1},attributes:{sportsRole:'cheer'}},detail:peer.name+'가 달릴 때 반 이름을 크게 불렀다. 주자 명단에는 없었지만 응원석에서 함께 웃었다.'}
 ];
 const prelude=S.notice('classroom:sports-prelude',37,'내일은 운동회','교문 앞에 운동회 안내장이 붙었다. 내일 반 대항 계주가 열린다. 운동장에 나갈 친구들이 방과 후 바통을 맞춰 보기 시작했다.');
 prelude.when={attributes:{classroomRevision:1}};
 const sports=S.branch(S.selection('classroom:sports',38,number+'반, 계주 출전!', '우리 반과 다른 반이 운동장을 한 바퀴씩 이어 달린다. 실력도 중요하지만 바통을 넘기는 호흡도 필요하다.',raceOptions(classmates[0])),classmates.map(peer=>({
  id:peer.id,title:number+'반, 계주 출전!',when:{attributes:{seatmate:peer.name}},body:'운동장에 '+number+'반 깃발이 걸렸다. '+peer.name+'가 바통을 들고 손짓한다. "우리 반 이번엔 끝까지 가 보자!"\n\n짝꿍 연습과 체육 활동으로 쌓은 운동능력, 체육 특성이 주자 실력이다. 경기 당일의 작은 변수도 있어 준비에 따라 우승을 노릴 수 있다. 주자로 뛸지, 바통 연결을 맡을지, 응원석을 지킬지 정하자.',options:raceOptions(peer)
 })));
 sports.event.when={attributes:{classroomRevision:1}};
 const field=raceField(persona),otherWinner=field.teams[field.rivalOrder?2:1],draw=(fieldSeed(persona,'finish')%10000)/100;
 sports.choice.presentation={type:'sports',classNumber:number,finishMs:8200,raceModel:'seeded-relay-v2',...field};
 // Athletics is read after the chosen preparation, before any victory reward.
 // Win chance: 18% + 2.7 points per ability + 12 for 체육, capped at 90%.
 // Top-two chance: 65% + .9 points per ability + 5 for 체육, capped at 97%.
 const runner={attributes:{sportsRole:'runner'}},wins=raceCondition(draw,18,2.7,12,90),topTwo=raceCondition(draw,65,.9,5,97);
 const cheerPlace=draw<35?1:draw<75?2:3;
 const finish=(place,cheering=false)=>({effects:{attributes:{sportsPlace:place},...(place===1?{stats:{money:10000,relations:3,...(cheering?{}:{athletics:2})}}:{})},history:{title:'반 대항 계주 · '+number+'반 '+place+'등',detail:place===1?(cheering?'응원석의 함성 속에서 우리 반 주자들이 가장 먼저 결승선을 통과했다.':'준비한 호흡이 끝까지 이어졌다. 우리 반이 가장 먼저 결승선을 통과했다.')+' 우승 상품권 1만 원과 함께 반 친구들의 신뢰가 쌓였다.':place===2?otherWinner+'반이 먼저 들어왔지만 우리 반도 끝까지 바통을 이어 2등으로 들어왔다.':otherWinner+'반이 먼저 들어왔다. 우리 반은 마지막 코너에서 밀렸지만 바통을 끝까지 전달했다.',...(place===1?{importance:'major'}:{})}});
 for(const script of [sports.choice,...sports.choice.variants])for(const option of script.options){
  option.result.conditional=[
   // Start the metric only for an actual first-time runner. A classmate choice
   // must never reset ability gained after this content pack was generated.
   ...(option.id==='cheer'?[]:[{before:true,when:{not:{stats:{athletics:{gte:0}}}},result:{effects:{activate:{athletics:4+option.result.effects.stats.athletics}}}}]),
   {when:{all:[runner,{not:topTwo}]},result:finish(3)},
   {when:{all:[runner,topTwo,{not:wins}]},result:finish(2)},
   {when:{all:[runner,wins]},result:finish(1)},
   {when:{attributes:{sportsRole:'cheer'}},result:finish(cheerPlace,true)}
  ];
 }
 return {...S.pack(seating,follow,prelude,sports),attributes:{classroomRevision:{label:'교실 이야기 연결',hidden:true},elementaryClass:{label:'초등학교 첫 반',hidden:true},seatmate:{label:'초등학교 짝꿍'},sportsRole:{label:'운동회 역할',hidden:true},sportsPlace:{label:'반 대항 계주 순위',hidden:true}}};
}});
})(window);
