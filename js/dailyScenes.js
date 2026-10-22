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
 function preview(button){const option=choice.options[[...list.querySelectorAll('.inline-choice')].indexOf(button)];const text=Object.hasOwn(p.playerMessages||{},option?.id)?p.playerMessages[option.id]:option?.label;draft.replaceChildren(el('small','chat-draft-label',text==null?'답장 없이 넘기기 · 확정 전':'보낼 답장 · 확정 전'));if(text!=null)draft.append(bubble({text},true));draft.hidden=false;}
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
 room.append(list,el('small','classroom-door','복도 · 출입문 ↗'));body.append(preview,room);
}
function raceRanks(place){return [place,...[1,2,3].filter(rank=>rank!==place)];}
function raceProgress(place,lane,elapsed){
 const rank=raceRanks(place)[lane],duration={1:8200,2:8320,3:8440}[rank];
 const u=Math.max(0,Math.min(1,elapsed/duration)),phase={1:Math.PI,2:0,3:Math.PI/2}[rank];
 return u===1?1:Math.max(0,Math.min(1,u+.008*(Math.sin(2*Math.PI*u+phase)-Math.sin(phase))));
}
const SVG='http://www.w3.org/2000/svg';
function svg(tag,attributes){const node=document.createElementNS(SVG,tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node;}
function arena(number,attributes={}){
 const view=el('section','race-arena'),board=el('div','sports-scoreboard');
 const title=el('strong','',number+'반 · 출발선에서 준비 중'),caption=el('span','','기록과 준비가 결승선에서 결과로 이어집니다.');
 board.append(el('small','','CLASS RELAY · 한 바퀴 계주'),title,caption);view.append(board);
 const role=attributes.sportsRole==='cheer'?'응원 중 · 주자 '+(attributes.seatmate||'짝꿍'):'주자 · 나 / 바통 동료 '+(attributes.seatmate||'짝꿍');
 const legend=el('div','race-our-team');legend.append(el('span','race-team-dot',''),el('strong','','우리 반 '+number+'반'),el('small','',role));view.append(legend);
 const track=svg('svg',{viewBox:'0 0 640 360',class:'sports-track oval-track',role:'img','aria-label':number+'반과 다른 두 반이 둥근 운동장을 달리는 계주'});
 track.append(svg('rect',{x:20,y:38,width:600,height:284,rx:142,fill:'#b3664d'}),svg('rect',{x:112,y:124,width:416,height:112,rx:56,fill:'#7a9c69'}));
 const field=svg('text',{x:320,y:175,'text-anchor':'middle',fill:'#f4f4db',class:'race-field-label'});field.textContent=number+'반, 끝까지!';track.append(field);
 const paths=[],markers=[],classes=[number,number%6+1,(number+1)%6+1];
 for(let lane=0;lane<3;lane++){
  const radius=132-lane*32,top=180-radius,bottom=180+radius;
  const path=svg('path',{d:`M160 ${bottom}H480A${radius} ${radius} 0 0 0 480 ${top}H160A${radius} ${radius} 0 0 0 160 ${bottom}Z`,fill:'none',stroke:'#f3dfca','stroke-width':2,'stroke-dasharray':lane===2?'6 6':'none'});paths.push(path);track.append(path);
  const runner=svg('g',{'data-team':classes[lane],class:lane===0?'oval-runner is-ours':'oval-runner'});
  runner.append(svg('circle',{r:12,fill:['#ffe285','#a8dcf2','#d9c2f1'][lane],stroke:lane===0?'#fff':'#5a392b','stroke-width':lane===0?4:2}));
  const bib=svg('text',{'text-anchor':'middle',y:4,fill:'#283222','font-size':12,'font-weight':800});bib.textContent=classes[lane];runner.append(bib);markers.push(runner);
 }
 track.append(svg('path',{d:'M160 241V324',stroke:'#fff','stroke-width':7}),svg('path',{d:'M160 241V324',stroke:'#354234','stroke-width':7,'stroke-dasharray':'7 7'}));
 for(const marker of markers)track.append(marker);view.append(track);
 const live=el('div','race-live-ranking');live.setAttribute('aria-live','off');view.append(live);
 function paint(progress){
  progress.forEach((value,lane)=>{const length=paths[lane].getTotalLength(),point=paths[lane].getPointAtLength(length*Math.min(.99999,value));markers[lane].setAttribute('transform',`translate(${point.x} ${point.y})`);markers[lane].dataset.progress=String(value);});
  const order=[0,1,2].sort((a,b)=>progress[b]-progress[a]||a-b);live.textContent=order.map((lane,i)=>(i+1)+'위 '+classes[lane]+'반'+(lane===0?' (우리 반)':'')).join('  ·  ');
 }
 return {view,title,caption,paint,classes,live};
}
function raceView(number){
 const race=arena(number);race.view.classList.add('sports-preview');
 // Mount before measuring SVG path lengths.
 queueMicrotask(()=>{if(race.view.isConnected)race.paint([0,0,0]);});return race.view;
}
function raceReplay({body,presentation,attributes,stats,traits,onReady,restored}){
 const place=attributes.sportsPlace,number=presentation.classNumber,race=arena(number,attributes);
 const skip=el('button','race-skip','경주 건너뛰기');skip.type='button';race.view.append(skip);body.prepend(race.view);body.classList.add('race-pending');
 let playing=true,frame=0,last=0,elapsed=0,disposed=false;
 function finish(){
  if(!playing||disposed)return;playing=false;if(frame)cancelAnimationFrame(frame);frame=0;
  race.paint([1,1,1]);race.view.classList.add('race-finish');race.title.textContent=number+'반 · '+place+'등';race.caption.textContent=place===1?'결승선을 가장 먼저 통과했다! 우승 상품권과 반 친구들의 신뢰를 얻었다.':'함께 준비한 결과가 기록에 남았다.';
  const ordered=raceRanks(place).map((rank,lane)=>({rank,lane})).sort((a,b)=>a.rank-b.rank),ranking=el('ol','sports-ranking');
  for(const row of ordered){const item=el('li',row.lane===0?'is-ours':'');item.append(el('b','',row.rank+'등'),el('span','',race.classes[row.lane]+'반'),el('small','',row.lane===0?'우리 반':''));ranking.append(item);}
  race.live.replaceWith(ranking);const reason=el('p','race-result-reason',attributes.sportsRole==='cheer'?'응원 역할로 반 친구들과 함께했습니다. 주자는 짝꿍이며 내 운동능력으로 주자 기록을 계산하지 않습니다.':'운동능력 (경기 보상 포함) '+(stats?.athletics||0)+'/25'+(traits?.includes('체육')?' · 체육 특성 적용':' · 오늘 우승 기준 '+(presentation.winThreshold||9))+'. 이전 체육 활동·짝꿍 연습과 이번 출전 준비를 합산한 결과입니다.');ranking.after(reason);skip.remove();body.classList.remove('race-pending');onReady?.();
 }
 function tick(now){
  if(disposed||!playing)return;
  if(last&&!document.hidden)elapsed+=Math.min(100,now-last);last=now;
  const progress=[0,1,2].map(lane=>raceProgress(place,lane,elapsed));race.paint(progress);
  race.title.textContent=elapsed<650?'탕! 계주 출발':number+'반 · 계주 진행 중';
  race.caption.textContent=elapsed<2200?'바통을 받아 첫 코너로 들어간다.':elapsed<4800?'반마다 앞서거니 뒤서거니! 바통을 놓치지 말자.':'마지막 코너! 결승선까지 달린다.';
  if(progress.every(p=>p===1)){finish();return;}frame=requestAnimationFrame(tick);
 }
 skip.addEventListener('click',finish);
 queueMicrotask(()=>{if(disposed)return;if(restored||matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else frame=requestAnimationFrame(tick);});
 return {get isPlaying(){return playing;},skip:finish,dispose(){disposed=true;if(frame)cancelAnimationFrame(frame);body.classList.remove('race-pending');}};
}
function studyApp(presentation,reaction,portrait={}){
 const app=el('section','study-app');
 const avatar=()=>{const node=el('span','study-avatar');node.append(global.GukminPoster.portrait(portrait));return node;};
 const head=el('header','study-app-header');head.append(el('strong','',presentation.app||'열공타'),el('span','','공부방 · 오늘의 기록'));app.append(head);
 const profile=el('div','study-app-profile');profile.append(avatar(),el('strong','',(presentation.rival||'민호')+' · 같은 학년 라이벌'),el('small','','기말고사 준비 중 · 오늘 누적'));app.append(profile);
 const clock=el('div','study-app-clock');clock.append(el('small','','FOCUS TIME'),el('b','',(presentation.hours||27)+'시간 '+(presentation.minutes??9)+'분'),el('span','','오늘의 순공 시간'));app.append(clock);
 app.append(el('p','study-app-caption','“기말고사까지 매일 한계를 넘는다.”'));
 const likes=el('div','study-likes'),controls=el('div','study-feed-controls');
 const like=el('button','study-like'),comment=el('button','study-comment-toggle','댓글 2');like.type=comment.type='button';comment.setAttribute('aria-expanded','false');controls.append(like,comment);app.append(controls,likes);
 const comments=el('div','study-comments');comments.append(el('p','','지우  ·  오늘도 열심히 했네'),el('p','','민서  ·  잠은 언제 자는 거야 ㅋㅋ'));app.append(comments);
 const composer=el('div','study-comment-composer');composer.inert=true;
 const inner=el('div','study-comment-inner'),who=el('div','study-comment-author');who.append(avatar(),el('strong','',portrait.name||'나'));
 const draft=el('textarea','study-comment-draft');draft.value='하루가 27시간인 멋진 청년';draft.readOnly=true;draft.rows=2;draft.setAttribute('aria-label','이번 선택으로 게시할 댓글');
 const send=el('button','study-comment-send','이 댓글로 답하기');send.type='button';inner.append(who,draft,send);composer.append(inner);app.append(composer);
 const pending=el('small','study-action-status');app.append(pending);
 function sync(selected,preview=false){
  const liked=selected==='like';like.textContent=(liked?'♥':'♡')+' 좋아요';like.setAttribute('aria-pressed',String(liked));
  likes.textContent='♥ '+((presentation.likes??23)+(liked?1:0))+'명이 좋아합니다';
  pending.textContent=preview&&selected?'아래에서 선택을 확정하면 기록에 반영됩니다.':reaction?'내 반응이 기록되었습니다.':'';
 }
 app.syncReaction=sync;app.openComposer=()=>{const open=composer.classList.toggle('is-open');composer.inert=!open;comment.setAttribute('aria-expanded',String(open));};
 app.likeButton=like;app.commentButton=comment;app.sendButton=send;
 if(reaction){like.disabled=comment.disabled=true;if(reaction==='comment'){const own=el('div','study-own-comment');own.append(avatar(),el('p','',(portrait.name||'나')+'  ·  하루가 27시간인 멋진 청년'));comments.append(own);comment.textContent='댓글 3';}if(reaction==='focus')comments.append(el('p','study-app-comment','알림을 끄고 내 공부를 시작했습니다.'));}
 sync(reaction);return app;
}
function decorate({dialog,body,list,choice,persona,state={},onSelect}){
 const kind=choice.presentation?.type;dialog.dataset.scene=['chat','seating','sports','study-app'].includes(kind)?kind:'';
 if(kind==='campaign'){
  const E=global.GukminElection,a=persona.attributes||{},section=el('section','campaign-brief');
  section.append(el('small','campaign-eyebrow',choice.presentation.step==='bill'?'약속의 청구서':'우리 반 선거 캠프'),el('h3','',choice.presentation.step==='listen'?'목소리 뒤의 표를 찾자':choice.presentation.step==='attack'?'그 약속, 어떻게 지킬 거야?':choice.presentation.step==='debt'?'네거티브는 외상이었다':'말에서 현실로'));
  const meters=el('div','campaign-vitals');meters.append(global.GukminStatus.createToken({label:'친구 지지 '+persona.stats.relations+'/25',icon:'users'}),global.GukminStatus.createToken({label:'담임 신뢰 '+(a.teacherTrust??12)+'/25',icon:'school'}));section.append(meters);
  if(choice.presentation.step==='listen')section.append(el('p','',E.groups.map(g=>g.name+' '+g.size+'명').join(' · ')+' / 집단마다 표가 나뉘며 기권도 있습니다.'));
  if(choice.presentation.step==='attack')for(const rival of E.rivals(persona)){const card=el('div','campaign-rival');card.append(el('strong','',rival.name+' · '+rival.title),el('p','',rival.pledges.map(id=>E.pledges.find(p=>p.id===id).name).join(' / ')));if(rival.copied)card.append(el('small','','내 공약을 보고 같은 약속을 내걸었다. 같은 집단의 표를 나눠 가져야 한다.'));section.append(card);}
  if(choice.presentation.step==='bill'){const bill=E.billTarget(persona,choice.presentation.slot);section.append(el('strong','campaign-bill-title',bill.name),el('p','',bill.limit),el('small','',bill.difficulty>=2?'권한 밖의 약속입니다. 원안 이행 대신 타협·파기를 선택해야 합니다.':'원안 이행: 재산 '+bill.cost.toLocaleString('ko-KR')+'원 · 준비 시간과 부담. 타협은 일부 이행, 파기는 신뢰 하락.'));}
  if(choice.presentation.step==='attack'){
   const target=E.billTarget(persona,0),question=el('blockquote','campaign-question');
   if(target){question.append(el('strong','','「'+target.name+'」에 대한 질문'),el('p','',target.difficulty>=2?'“학교에서 허락 안 해 주면? 반장이 혼자 정할 수 있는 일이야?”':'“준비는 언제 하고, 필요한 건 어떻게 마련할 거야? 네가 계속 맡을 수 있어?”'),el('small','','확인할 점 · '+target.limit));section.insertBefore(question,meters.nextSibling);}
   const support=global.GukminElectionView.board(persona,{compact:true});section.append(support.element);
   const preview=response=>support.update(E.chosen(persona).map(p=>p.id),response);
   const ids=E.chosen(persona).map(p=>p.id),base=E.forecast(persona,ids).pollShares[0];
   for(const [i,button] of [...list.querySelectorAll('.inline-choice')].entries()){
    if(choice.options[i].id==='poll')button.querySelector('.daily-choice-copy').append(el('small','campaign-poll-target','찾아갈 집단 · '+E.pollTarget(persona).name));
    const option=choice.options[i],share=E.forecast(persona,ids,option.id).pollShares[0],diff=share-base;
    button.querySelector('.daily-choice-copy').append(el('span','campaign-support-shift','조사 지지 '+share+'%'+(diff?' · '+(diff>0?'+':'−')+Math.abs(diff)+'%p':'')));
    button.addEventListener('click',()=>preview(option.id));
   }
   const selected=choice.options.find((o,i)=>list.querySelectorAll('.inline-choice')[i]?.getAttribute('aria-pressed')==='true');if(selected)preview(selected.id);
  }
  body.prepend(section);
 }
 if(kind==='chat')decorateChat(body,list,choice);
 if(kind==='seating')decorateSeats(body,list,choice);
 if(kind==='sports'){
  const situation=body.querySelector('.daily-scenario');body.prepend(raceView(choice.presentation.classNumber));
  const prep=el('div','sports-preparation');prep.append(el('strong','','나의 운동능력 '+(persona.stats.athletics||0)+'/25'),el('p','','짝꿍 연습과 체육 활동에서 쌓은 실력입니다. 선택의 준비 효과까지 합산해 오늘은 '+(choice.presentation.winThreshold||9)+' 이상이거나 체육 특성이 있으면 우승할 수 있습니다. 응원은 주자 기록을 바꾸지 않습니다.'));list.before(prep);
  if(!state.introSeen){const intro=el('section','sports-day-intro');intro.append(el('span','','⚑  ⚑  ⚑'),el('small','','학교 운동장 · 아침'),el('h3','','오늘은 운동회!'),el('p','',choice.presentation.classNumber+'반 친구들이 반 깃발 아래 모였다. 짝꿍과 준비했던 계주가 곧 시작된다.'));const enter=el('button','','운동장으로 →');enter.type='button';intro.append(enter);const stage=el('div','sports-day-stage');stage.hidden=true;while(body.firstChild)stage.append(body.firstChild);body.append(intro,stage);enter.addEventListener('click',()=>{state.introSeen=true;intro.remove();stage.hidden=false;});}
  if(situation)situation.querySelector('.daily-scenario-kicker').textContent='작전 회의';
  list.before(el('strong','scene-choice-label','우리 반에서 맡을 역할'));
 }
 if(kind==='study-app'){
  const app=studyApp(choice.presentation,null,global.GukminGame.posterData(persona));body.prepend(app);list.before(el('strong','scene-choice-label','이 기록을 보고 나는'));
  const buttons=[...list.querySelectorAll('.inline-choice')],select=id=>buttons[choice.options.findIndex(o=>o.id===id)]?.click();
  const sync=()=>{const index=buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true');app.syncReaction(choice.options[index]?.id,true);};
  app.likeButton.addEventListener('click',()=>{if(app.likeButton.getAttribute('aria-pressed')==='true')onSelect?.(null);else select('like');sync();});
  app.commentButton.addEventListener('click',()=>app.openComposer());app.sendButton.addEventListener('click',()=>select('comment'));
  buttons.forEach(button=>button.addEventListener('click',sync));sync();
 }
}
function reward({dialog,body,presentation,attributes,stats,traits,portrait,optionId,label,onReady,restored}){
 const kind=presentation?.type;dialog.dataset.scene=['chat','seating','sports','study-app'].includes(kind)?kind:'';
 if(kind==='chat'){
  const receipt=el('section','chat-thread chat-receipt');receipt.append(chatHeader(presentation));
  const outgoing=Object.hasOwn(presentation.playerMessages||{},optionId)?presentation.playerMessages[optionId]:label;
  receipt.append(outgoing==null?el('small','chat-no-reply','답장하지 않고 대화를 마쳤습니다'):bubble({text:outgoing},true));
  for(const response of presentation.responses?.[optionId]||[])receipt.append(bubble(response));
  body.prepend(receipt);
 }
 if(kind==='seating'){
  const receipt=el('div','seat-receipt');receipt.append(el('small','','새로운 짝꿍'),el('strong','',attributes.seatmate+' 옆자리'),el('span','',attributes.elementaryClass+'반 · 이 친구와 이야기가 이어집니다.'));body.prepend(receipt);
 }
 if(kind==='study-app')body.prepend(studyApp(presentation,attributes.studyTimerReaction,portrait));
 if(kind==='sports')return raceReplay({body,presentation,attributes,stats,traits,onReady,restored});
 return null;
}
global.GukminDailyScenes=Object.freeze({decorate,reward,raceProgress});
})(window);
