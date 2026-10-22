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
const svgNS='http://www.w3.org/2000/svg';
const ovalLanes=[
 'M 180 35 H 277 A 59 59 0 0 1 336 94 V 146 A 59 59 0 0 1 277 205 H 83 A 59 59 0 0 1 24 146 V 94 A 59 59 0 0 1 83 35 Z',
 'M 180 48 H 271 A 46 46 0 0 1 317 94 V 146 A 46 46 0 0 1 271 192 H 89 A 46 46 0 0 1 43 146 V 94 A 46 46 0 0 1 89 48 Z',
 'M 180 61 H 264 A 33 33 0 0 1 297 94 V 146 A 33 33 0 0 1 264 179 H 96 A 33 33 0 0 1 63 146 V 94 A 33 33 0 0 1 96 61 Z'
];
function oval(number){
 const field=el('div','sports-oval');
 const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 360 240');svg.setAttribute('role','img');svg.setAttribute('aria-label','둥근 사각형 운동장 세 트랙에서 반별 주자들이 달리고 있습니다');
 const paths=[],runners=[];
 for(let i=0;i<3;i++){
  const path=document.createElementNS(svgNS,'path');path.setAttribute('d',ovalLanes[i]);path.setAttribute('class','sports-ring sports-ring-'+i);svg.append(path);paths.push(path);
  const runner=document.createElementNS(svgNS,'g');runner.setAttribute('class','sports-avatar sports-avatar-'+i);
  const badge=document.createElementNS(svgNS,'circle');badge.setAttribute('r','11');runner.append(badge);
  const label=document.createElementNS(svgNS,'text');label.textContent=(i===0?number:i===1?number%6+1:(number+1)%6+1)+'반';label.setAttribute('text-anchor','middle');label.setAttribute('dy','3.3');runner.append(label);svg.append(runner);runners.push(runner);
 }
 field.append(svg);return {field,paths,runners};
}
function placeRunners(track,progress){
 for(let i=0;i<3;i++){
  const path=track.paths[i],length=path.getTotalLength(),point=path.getPointAtLength(length*Math.min(.9999,Math.max(0,progress[i])));
  track.runners[i].setAttribute('transform','translate('+point.x.toFixed(2)+' '+point.y.toFixed(2)+')');
 }
}
function raceView(number,place){
 const finished=Number.isFinite(place),view=el('section',finished?'race-finish':'sports-preview');
 const board=el('div','sports-scoreboard');
 board.append(el('small','','SPORTS DAY · CLASS RELAY'),el('strong','',finished?number+'반 · '+place+'등':'오늘은 운동회!'),el('span','',finished?(place===1?'마지막 코너에서 역전! 우리 반 우승!':'끝까지 달려 결승선을 통과했다!'):'트랙 한 바퀴, 바통을 이어 달리자'));
 view.append(board);
 const track=oval(number);view.append(track.field);
 placeRunners(track,finished?(place===1?[.999,.93,.87]:place===2?[.92,.999,.84]:[.83,.999,.94]):[0,0,0]);
 if(finished){
  if(place===1)view.append(el('strong','sports-victory','🏆 우리 반 우승!'));
  view.append(el('p','sports-result-text','이번 계주는 내 선택과 운동능력으로 결정됐어.'));
 }
 return view;
}
// Presentation only. The timeline has already fixed and saved the result.
function playRace({dialog,body,presentation,attributes,onFinish}){
 dialog.dataset.scene='sports';body.replaceChildren();
 const view=raceView(presentation.classNumber,null);view.className='sports-running';
 view.querySelector('.sports-scoreboard strong').textContent='반 대항 계주 · 경기 중';
 const status=el('p','sports-live','출발! 세 반이 첫 코너로 달려간다');
 view.append(status);body.append(view);body.scrollTop=0;
 const track={paths:[...view.querySelectorAll('.sports-ring')],runners:[...view.querySelectorAll('.sports-avatar')]};
 const rank=attributes.sportsPlace||3;
 const checkpoints=rank===1?[[0,.21,.45,.69,.999],[0,.28,.56,.79,.93],[0,.26,.46,.66,.87]]:rank===2?[[0,.23,.48,.76,.94],[0,.29,.56,.8,.999],[0,.2,.45,.68,.84]]:[[0,.29,.5,.67,.83],[0,.24,.54,.79,.999],[0,.23,.49,.72,.94]];
 const reduce=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=reduce?900:5600;
 let raf=0,done=false,start=null,phase=-1;
 function interpolate(values,t){const i=Math.min(3,Math.floor(t*4)),f=Math.min(1,t*4-i);return values[i]+(values[i+1]-values[i])*f;}
 function frame(now){
  if(done)return;
  if(start===null)start=now;
  const t=Math.min(1,(now-start)/duration),chapter=Math.min(3,Math.floor(t*4));
  placeRunners(track,checkpoints.map(values=>interpolate(values,t)));
  if(chapter!==phase){phase=chapter;status.textContent=['출발! 세 반이 첫 코너로 달려간다','나란히 달리다, 선두가 계속 바뀐다','마지막 코너! 격차가 좁혀진다','결승선 앞에서 끝까지 전력 질주!'][chapter];}
  if(t>=1){done=true;onFinish();return;}
  raf=global.requestAnimationFrame(frame);
 }
 raf=global.requestAnimationFrame(frame);
 return ()=>{done=true;if(raf)global.cancelAnimationFrame(raf);};
}
function decorate({dialog,body,list,choice}){
 const kind=choice.presentation?.type;dialog.dataset.scene=['chat','seating','sports'].includes(kind)?kind:'';
 if(kind==='chat')decorateChat(body,list,choice);
 if(kind==='seating')decorateSeats(body,list,choice);
 if(kind==='sports'){
  const situation=body.querySelector('.daily-scenario');body.prepend(raceView(choice.presentation.classNumber));
  const intro=el('div','sports-opening');intro.append(el('small','','SPORTS DAY'),el('strong','','📣 오늘은 운동회!'),el('span','','반 대항 계주가 곧 시작됩니다'));body.prepend(intro);
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
global.GukminDailyScenes=Object.freeze({decorate,reward,playRace});
})(window);
