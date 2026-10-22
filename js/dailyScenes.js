/* Presentation only: all selection, forecasts and settlement remain in dailyChoice/Timeline. */
(function(global){
'use strict';
function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;}
function rich(tag,cls,text){return global.GukminMarkup.render(el(tag,cls),text);}
function bubble(message,mine=false){
 const row=el('div','chat-message'+(mine?' is-mine':''));
 if(!mine){const avatar=el('span','chat-avatar',String(message.sender||'친구').slice(-1));avatar.setAttribute('aria-hidden','true');row.append(avatar);}
 const content=el('div','chat-message-content');
 if(!mine)content.append(el('small','chat-sender',message.sender||'친구'));
 content.append(el('p','chat-bubble',message.text));
 row.append(content,el('small','chat-time',message.time||(mine?'방금':'')));return row;
}
function chatHeader(presentation){
 const head=el('div','chat-room-head');head.append(el('span','chat-room-icon','☰'),el('div','',presentation.room||'학급 단체방'),el('small','','친구들과의 대화'));return head;
}
function decorateChat(body,list,choice){
 const p=choice.presentation;
 const thread=el('section','chat-thread');thread.setAttribute('aria-label','친구들의 메시지');thread.append(chatHeader(p),el('span','chat-date','방과 후'));
 const situation=body.querySelector('.daily-scenario');
 if(situation){situation.classList.add('chat-pinned');const title=situation.querySelector('.daily-scenario-kicker');if(title)title.textContent='지금 상황';thread.append(situation);}
 for(const message of p.messages||[])thread.append(bubble(message));
 const draft=el('div','chat-draft');draft.hidden=true;draft.setAttribute('aria-live','polite');thread.append(draft);
 const replies=el('section','chat-replies');replies.append(el('strong','scene-choice-label','어떻게 답할까?'),list);
 body.replaceChildren(thread,replies);
 function preview(button){draft.replaceChildren(el('small','chat-draft-label','선택한 답장 · 확정 전'),bubble({text:button.querySelector('.daily-choice-title').textContent},true));draft.hidden=false;}
 for(const button of list.querySelectorAll('.inline-choice')){button.addEventListener('click',()=>preview(button));if(button.getAttribute('aria-pressed')==='true')preview(button);}
}
function decorateSeats(body,list,choice){
 const p=choice.presentation,room=el('section','classroom-room');
 room.append(el('div','classroom-blackboard',p.classNumber+'반 교실 · 칠판'),el('p','classroom-instruction','친구 옆 빈 책상을 눌러 자리를 골라 주세요.'));
 const buttons=[...list.querySelectorAll('.inline-choice')];list.classList.add('classroom-desks');list.replaceChildren();list.setAttribute('aria-label','교실 좌석 배치 · 친구 옆 빈자리');
 const preview=el('section','seat-preview');preview.setAttribute('aria-live','polite');preview.append(el('span','seat-preview-empty','어느 친구 옆에 앉을까요?'));
 function detail(button,peer){preview.replaceChildren(el('small','scene-choice-label','이 자리의 짝꿍'),el('strong','seat-peer-name',peer.name),el('p','seat-peer-note',peer.note),button.querySelector('.daily-choice-copy').cloneNode(true));}
 for(const [i,button] of buttons.entries()){
  const peer=p.classmates.find(peer=>peer.id===choice.options[i].id);
  if(!peer)throw new Error('자리 선택에 연결된 친구가 없습니다: '+choice.options[i].id);
  const friend=el('div','classmate-desk');friend.append(el('span','desk-avatar',peer.name.slice(-1)),el('strong','',peer.name));list.append(friend);
  button.classList.add('empty-desk');button.setAttribute('aria-label',peer.name+' 옆에 앉기');button.append(el('span','desk-empty-label','여기 앉기'));list.append(button);
  for(let j=0;j<2;j++)list.append(el('div','occupied-desk','친구'));
  button.addEventListener('click',()=>detail(button,peer));if(button.getAttribute('aria-pressed')==='true')detail(button,peer);
 }
 room.append(list,el('small','classroom-door','복도 · 출입문 ↗'));body.append(room,preview);
}
function raceView(number,place){
 const view=el('section',place?'race-finish':'sports-preview');
 const board=el('div','sports-scoreboard');board.append(el('small','','CLASS RELAY'),el('strong','',place?number+'반 · '+place+'등':number+'반, 준비됐지?'),el('span','',place===1?'우리 반이 가장 먼저 들어왔다!':place?'끝까지 함께 달린 우리 반':'한 사람의 질주, 한 반의 호흡.'));
 view.append(board);
 const track=el('div','sports-track');track.setAttribute('role','img');track.setAttribute('aria-label',place?number+'반 계주 '+place+'등':'세 반이 달리는 계주 운동장');
 const places=[1,2,3].filter(n=>n!==place),classes=[number,number%6+1,(number+1)%6+1];
 for(let i=0;i<3;i++){
  const rank=place?(i===0?place:places[i-1]):null,lane=el('div','sports-lane'+(i===0?' is-ours':''));
  lane.append(el('span','lane-label',classes[i]+'반'));
  const runner=el('span','race-runner',i===0?'우리 반':'');runner.style.setProperty('--finish',rank?({1:'90%',2:'71%',3:'57%'}[rank]):'12%');lane.append(runner);track.append(lane);
 }
 track.append(el('span','race-finish-line','FINISH'));view.append(track);
 if(place){
  const ranking=el('ol','sports-ranking');
  const ordered=classes.map((n,i)=>({number:n,place:i===0?place:places[i-1]})).sort((a,b)=>a.place-b.place);
  for(const row of ordered){const item=el('li',row.number===number?'is-ours':'');item.append(el('b','',row.place+'등'),el('span','',row.number+'반'),el('small','',row.number===number?'우리 반':''));ranking.append(item);}
  view.append(ranking);
 }
 return view;
}
function decorate({dialog,body,list,choice}){
 const kind=choice.presentation?.type;dialog.dataset.scene=['chat','seating','sports'].includes(kind)?kind:'';
 if(kind==='chat')decorateChat(body,list,choice);
 if(kind==='seating')decorateSeats(body,list,choice);
 if(kind==='sports'){
  const situation=body.querySelector('.daily-scenario');body.prepend(raceView(choice.presentation.classNumber));
  if(situation)situation.querySelector('.daily-scenario-kicker').textContent='작전 회의';
  list.before(el('strong','scene-choice-label','우리 반에서 맡을 역할'));
 }
}
function reward({dialog,body,presentation,attributes,optionId,label}){
 const kind=presentation?.type;dialog.dataset.scene=['chat','seating','sports'].includes(kind)?kind:'';
 if(kind==='chat'){
  const receipt=el('section','chat-thread chat-receipt');receipt.append(chatHeader(presentation),bubble({text:label},true));
  for(const response of presentation.responses?.[optionId]||[])receipt.append(bubble(response));
  body.prepend(receipt);
 }
 if(kind==='seating'){
  const receipt=el('div','seat-receipt');receipt.append(el('small','','새로운 짝꿍'),el('strong','',attributes.seatmate+' 옆자리'),el('span','',attributes.elementaryClass+'반 · 이 친구와 이야기가 이어집니다.'));body.prepend(receipt);
 }
 if(kind==='sports')body.prepend(raceView(presentation.classNumber,attributes.sportsPlace));
}
global.GukminDailyScenes=Object.freeze({decorate,reward});
})(window);
