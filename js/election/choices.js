/* Election-only choices use the host's major dialog and timeline resolution callback. */
(function(global){
'use strict';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
function presentPledges({choice,resolve,root,model}){
 const dialog=root.querySelector('#lifeDecisionDialog');
 const E=model,isFinal=choice.presentation.mode==='final',isDraft=!isFinal&&E.revision>=2,slots=isFinal?E.chosen.map(p=>p.id):[null,null,null];let activeSlot=0,closed=false;
 const sheet=make('section','life-modal-wrap election-pledge-paper'),head=make('header','life-modal-head'),foldButton=make('button','life-modal-collapse','접기 ⌄');foldButton.type='button';
 head.append(make('span','life-modal-serial',model.title+' · 공약'),foldButton);
 const content=make('div','pledge-content'),dock=make('div','pledge-dock');content.append(make('small','campaign-eyebrow',E.groups.reduce((n,g)=>n+g.size,0)+'명의 마음을 움직일 세 약속'),make('h2','life-modal-title',isFinal?'마지막으로 약속 고르기':isDraft?'약속 세 개 골라 보기':'약속 세 개 고르기'));
 const puzzle=make('section','pledge-puzzle'),rack=make('div','pledge-slots');rack.setAttribute('role','group');rack.setAttribute('aria-label','공약 세 칸');
 const slotButtons=slots.map((_,i)=>{const button=make('button','pledge-slot');button.type='button';button.addEventListener('click',()=>{activeSlot=i;paint();});button.addEventListener('keydown',e=>{if(['Delete','Backspace'].includes(e.key)){e.preventDefault();slots[i]=null;activeSlot=i;paint();}});rack.append(button);return button;});
 puzzle.append(rack,make('small','pledge-slot-help','카드를 눌러 세 칸을 채워 봐. 고른 카드를 다시 누르면 뺄 수 있어.'));
 const board=global.GukminElectionView.board(model,{collapsible:true});puzzle.append(board.element);content.append(puzzle);
 const cards=make('div','pledge-cards');cards.setAttribute('role','group');cards.setAttribute('aria-label','공약 세 장 선택');
 const footer=make('footer','life-modal-foot pledge-footer'),counter=make('strong','pledge-counter','0 / 3'),confirm=make('button','life-submit',isFinal?'이 약속으로 나갈래':isDraft?'친구들 생각 들어 보기':'세 약속으로 할래');confirm.type='button';confirm.disabled=true;counter.setAttribute('aria-live','polite');const live=make('small','pledge-live-share'),counts=make('div','pledge-footer-counts');counts.append(counter,live);
 function paint(){
  const ids=slots.filter(Boolean);slotButtons.forEach((button,i)=>{button.classList.toggle('is-active',activeSlot===i);button.classList.toggle('is-filled',!!slots[i]);button.setAttribute('aria-pressed',String(activeSlot===i));button.replaceChildren(make('small','','공약 '+(i+1)),make('strong','',slots[i]?E.pledges.find(p=>p.id===slots[i]).name:'＋ 끼워 넣기'));});
  for(const button of cards.children)button.setAttribute('aria-pressed',String(ids.includes(button.dataset.pledge)));counter.textContent=ids.length+' / 3';confirm.disabled=ids.length!==3;const forecast=board.update(ids);live.textContent='내 편 예상 '+forecast.pollShares[Math.max(0,forecast.candidates.findIndex(c=>c.id===E.playerId))]+'%';
 }
  for(const pledge of E.available){
  const card=make('button','pledge-card');card.type='button';card.dataset.pledge=pledge.id;card.setAttribute('aria-pressed','false');
  card.append(global.GukminElectionView.feasibilityToken(pledge),make('strong','',pledge.name));
  const reactions=make('span','pledge-reactions');E.groups.forEach((group,g)=>{const n=E.opinion(group.id,pledge.id),reaction=make('span',n===null?'is-unknown':n>0?'is-positive':n<0?'is-negative':'is-neutral',(group.shortName||group.name)+' '+(n===null?'?':(n>0?'+':n<0?'−':'')+Math.abs(n)));reaction.title=group.name+' '+group.size+'명 · '+(n===null?'아직 안 물어봤어':'직접 들어 본 생각');reactions.append(reaction);});card.append(reactions,make('small','pledge-reality',pledge.limit));
  card.addEventListener('click',()=>{
   const existing=slots.indexOf(pledge.id);if(existing>=0){slots[existing]=null;activeSlot=existing;}
   else{const index=activeSlot>=0?activeSlot:slots.indexOf(null);if(index<0){counter.textContent='바꿀 공약 칸을 먼저 눌러 주세요';return;}slots[index]=pledge.id;activeSlot=slots.indexOf(null);}
   paint();
  });cards.append(card);
 }
 const catalogHead=make('div','pledge-catalog-heading');catalogHead.append(make('strong','','어떤 약속을 할까?'),make('small','','이행불가 공약은 당선 뒤 지지 하락 위험 · ?는 아직 못 들은 민심'));content.append(catalogHead,cards);
 footer.append(counts,confirm);head.insertBefore(global.GukminElectionView.navigation(),foldButton);sheet.append(head,dock,content,footer);dialog.replaceChildren(sheet);dialog.classList.add('is-pledges');paint();
 const mobile=global.matchMedia('(max-width:47.5em)'),eyebrow=content.querySelector('.campaign-eyebrow'),title=content.querySelector('.life-modal-title'),help=puzzle.querySelector('.pledge-slot-help');
 const syncDock=()=>{if(mobile.matches)dock.append(eyebrow,title,rack,help);else{content.prepend(eyebrow,title);puzzle.prepend(rack,help);}};
 mobile.addEventListener('change',syncDock);syncDock();
 const reopen=root.querySelector('#resumeMajorChoice');
 const sync=()=>{reopen.hidden=closed||dialog.open;},open=()=>{if(!closed&&!dialog.open){dialog.showModal();sync();}},fold=()=>{dialog.close();sync();reopen.focus({preventScroll:true});},cancel=e=>{e.preventDefault();fold();};
 reopen.addEventListener('click',open);foldButton.addEventListener('click',fold);dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',sync);
 confirm.addEventListener('click',()=>{const ids=slots.filter(Boolean);if(closed||ids.length!==3)return;dialog.close();resolve('submit',{pledges:ids});});open();
 return ()=>{closed=true;mobile.removeEventListener('change',syncDock);reopen.removeEventListener('click',open);dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',sync);if(dialog.open)dialog.close();dialog.replaceChildren();dialog.classList.remove('is-pledges');sync();};
}

function presentSurvey({choice,resolve,root,model}){
 const dialog=root.querySelector('#lifeDecisionDialog'),reopen=root.querySelector('#resumeMajorChoice'),selected=new Set();let closed=false;
 const token=options=>global.GukminStatus.createToken(options),risk=amount=>token({type:'metric',id:model.riskMetric||'stress',amount});
 const sheet=make('section','life-modal-wrap election-survey-paper'),header=make('header','life-modal-head'),fold=make('button','life-modal-collapse','접기 ⌄');fold.type='button';
 header.append(make('span','life-modal-serial',model.title),fold);
 const content=make('div','election-survey-content'),steps=make('ol','election-steps');steps.setAttribute('aria-label','선거 진행');
 ['민심 조사','공약 정하기','투표'].forEach((label,i)=>{const step=make('li',i===0?'is-current':'');step.append(make('b','',String(i+1)),document.createTextNode(label));if(i===0)step.setAttribute('aria-current','step');steps.append(step);});
 const heading=make('div','survey-heading');heading.append(token({label:'민심 조사',icon:'speech'}),make('h2','life-modal-title',choice.presentation.first?'어떤 친구들을 만나 볼까?':'더 들어 보고 싶은 모임은?'),make('p','election-survey-intro','여러 모임을 골라도 돼. 만난 친구들의 공약 취향이 공개돼.'));
 content.append(steps,heading);
 const list=make('div','survey-groups');list.setAttribute('role','group');list.setAttribute('aria-label','만나러 갈 모임 · 여러 개 선택 가능');
 const footer=make('footer','life-modal-foot survey-footer'),summary=make('div','survey-summary'),status=make('strong','survey-selection','모임을 골라 줘'),cost=make('div','survey-cost'),confirm=make('button','life-submit','조사할 모임 선택');confirm.type='button';confirm.disabled=true;summary.setAttribute('aria-live','polite');summary.append(status,cost);footer.append(summary,confirm);
 function paint(){
  const visits=model.groups.filter(g=>selected.has(g.id)),fee=visits.reduce((n,g)=>n+(g.surveyCost||1),0),study=choice.presentation.first?visits.reduce((n,g)=>n+(g.firstStudyCost||0),0):0;
  status.textContent=visits.length?visits.length+'개 모임 · '+visits.reduce((n,g)=>n+g.size,0)+'명':'모임을 골라 줘';cost.replaceChildren();
  if(visits.length){cost.append(risk(fee));if(study)cost.append(token({type:'metric',id:'study',amount:-study}));}else cost.append(make('small','','선택한 모임의 방문 비용을 합산해요'));
  confirm.disabled=!visits.length;confirm.textContent=visits.length?visits.length+'개 모임 조사하기 →':'조사할 모임 선택';
  for(const button of list.children)button.setAttribute('aria-pressed',String(selected.has(button.dataset.group)));
 }
 for(const group of model.groups){
  const option=choice.options.find(o=>o.id===group.id),known=model.known(group.id),button=make('button','survey-group');button.type='button';button.dataset.group=group.id;button.disabled=!option?.available||known;button.setAttribute('aria-pressed','false');
  const heading=make('span','survey-group-heading'),name=make('span');name.append(make('strong','',group.name),make('b','',group.size+'명'));heading.append(name,make('span','survey-check',known?'✓':''));
  const size=global.GukminElectionView.population(group,model.groups.reduce((n,g)=>n+g.size,0)),facts=make('span','survey-group-facts');
  if(!known){facts.append(risk(group.surveyCost||1));if(choice.presentation.first&&group.firstStudyCost)facts.append(token({type:'metric',id:'study',amount:-group.firstStudyCost}));}
  else facts.append(token({label:'조사 완료',icon:'check'}));
  button.append(heading,size,make('small','survey-location',group.place||'직접 만나기'),facts);
  button.addEventListener('click',()=>{if(selected.has(group.id))selected.delete(group.id);else selected.add(group.id);paint();});list.append(button);
 }
 content.append(list);
 if(choice.presentation.first){const skip=make('button','survey-skip','방문하지 않고 공약 고르기 →');skip.type='button';skip.addEventListener('click',()=>commit('skip'));content.append(skip);}
 header.insertBefore(global.GukminElectionView.navigation(),fold);sheet.append(header,content,footer);dialog.replaceChildren(sheet);dialog.classList.add('is-election-survey');paint();
 const sync=()=>{reopen.hidden=closed||dialog.open;},open=()=>{if(!closed&&!dialog.open){dialog.showModal();sync();}},collapse=()=>{dialog.close();sync();reopen.focus({preventScroll:true});},cancel=e=>{e.preventDefault();collapse();};
 function commit(id,input={}){if(closed)return;dialog.close();resolve(id,input);}
 confirm.addEventListener('click',()=>{const ids=[...selected];if(ids.length)commit(ids[0],{groups:ids});});fold.addEventListener('click',collapse);reopen.addEventListener('click',open);dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',sync);open();
 return ()=>{closed=true;reopen.removeEventListener('click',open);dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',sync);if(dialog.open)dialog.close();dialog.replaceChildren();dialog.classList.remove('is-election-survey');sync();};
}
function effectTokens(stats,trust){
 const row=make('div','fulfillment-effects');
 for(const [id,amount] of Object.entries(stats))if(amount)row.append(global.GukminStatus.createToken({type:'metric',id,amount}));
 if(trust)row.append(global.GukminStatus.createToken({label:'선생님 믿음 '+(trust>0?'+':'−')+Math.abs(trust),icon:'home'}));
 return row;
}
function presentFulfillment({choice,resolve,root,model}){
 const dialog=root.querySelector('#lifeDecisionDialog'),reopen=root.querySelector('#resumeMajorChoice'),plans=new Map();let closed=false;
 const sheet=make('section','life-modal-wrap election-fulfillment-paper'),head=make('header','life-modal-head'),fold=make('button','life-modal-collapse','접기 ⌄');fold.type='button';head.append(make('span','life-modal-serial',model.title+' · 당선 후'),fold);
 const content=make('div','fulfillment-content'),intro=make('div','fulfillment-intro');intro.append(make('small','campaign-eyebrow','약속은 세 개, 방법은 각각'),make('h2','life-modal-title','이제 약속을 지킬 차례'),make('p','','각 약속을 어떻게 할지 골라 줘. 세 가지를 한 번에 정산해요.'));content.append(intro);
 const footer=make('footer','life-modal-foot fulfillment-footer'),summary=make('div','fulfillment-summary'),counter=make('strong'),totals=make('div'),error=make('p','fulfillment-error'),confirm=make('button','life-submit','이행 방식 확정하기');error.setAttribute('role','status');confirm.type='button';summary.setAttribute('aria-live','polite');summary.append(counter,totals,error);footer.append(summary,confirm);
 function paint(){
  counter.textContent=plans.size+' / '+model.fulfillment.length+'개 결정';totals.replaceChildren();error.textContent='';confirm.disabled=plans.size!==model.fulfillment.length;
  if(!confirm.disabled)try{const preview=model.previewFulfillment([...plans].map(([pledgeId,mode])=>({pledgeId,mode})));totals.append(effectTokens(preview.stats,preview.trust));}catch(e){error.textContent=e.message;confirm.disabled=true;}
  for(const button of content.querySelectorAll('[data-mode]'))button.setAttribute('aria-pressed',String(plans.get(button.dataset.pledge)===button.dataset.mode));
 }
 model.fulfillment.forEach((pledge,i)=>{
  const card=make('section','fulfillment-pledge'),heading=make('div','fulfillment-pledge-heading');heading.append(make('span','',String(i+1).padStart(2,'0')),make('h3','',pledge.name));heading.append(global.GukminElectionView.feasibilityToken(pledge));card.append(heading,make('p','fulfillment-limit',pledge.limit+' · '+pledge.feasibility.note));
  const modes=make('div','fulfillment-modes');modes.setAttribute('role','group');modes.setAttribute('aria-label',pledge.name+' 이행 방식');
  for(const mode of pledge.modes){const button=make('button','fulfillment-mode');button.type='button';button.dataset.pledge=pledge.id;button.dataset.mode=mode.id;button.disabled=!mode.available;button.setAttribute('aria-pressed','false');button.append(make('strong','',mode.label),make('small','',mode.detail));if(mode.available){const stats={...mode.stats,...(mode.cost?{money:-mode.cost}:{})};if(model.riskMetric==='illness'){stats.illness=stats.stress;delete stats.stress;}button.append(effectTokens(stats,mode.trust));}button.addEventListener('click',()=>{plans.set(pledge.id,mode.id);paint();});modes.append(button);}
  card.append(modes);content.append(card);
 });
 head.insertBefore(global.GukminElectionView.navigation(),fold);sheet.append(head,content,footer);dialog.replaceChildren(sheet);dialog.classList.add('is-election-fulfillment');paint();
 const sync=()=>{reopen.hidden=closed||dialog.open;},open=()=>{if(!closed&&!dialog.open){dialog.showModal();sync();}},collapse=()=>{dialog.close();sync();reopen.focus({preventScroll:true});},cancel=e=>{e.preventDefault();collapse();};
 confirm.addEventListener('click',()=>{if(closed||confirm.disabled)return;const input={plans:[...plans].map(([pledgeId,mode])=>({pledgeId,mode}))};if(resolve('submit',input)===false){error.textContent='정산하지 못했어요. 선택과 재산을 확인해 주세요.';}});
 fold.addEventListener('click',collapse);reopen.addEventListener('click',open);dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',sync);open();
 return ()=>{closed=true;reopen.removeEventListener('click',open);dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',sync);if(dialog.open)dialog.close();dialog.replaceChildren();dialog.classList.remove('is-election-fulfillment');sync();};
}
function presentResult({entry,root,onContinue}){
 const dialog=root.querySelector('#lifeDecisionDialog'),sheet=make('section','life-modal-wrap election-fulfillment-paper'),head=make('header','life-modal-head');head.append(make('span','life-modal-serial','우리 반 반장 선거 · 이행 결산'),global.GukminStatus.createToken({label:'정산 완료',icon:'check'}));
 const content=make('div','fulfillment-content'),before=entry.outcome.before,after=entry.outcome.after,stats=Object.fromEntries(['money','stress','illness','study','relations'].map(id=>[id,(after.stats[id]||0)-(before.stats[id]||0)]));
 content.append(make('h2','life-modal-title','약속의 결과가 돌아왔어요'),make('p','fulfillment-result-note','고른 방법과 실제 변화입니다. 이 결과는 인생 기록에도 남아요.'),effectTokens(stats,(after.attributes.teacherTrust??12)-(before.attributes.teacherTrust??12)));
 for(const plan of entry.input.plans){const pledge=global.GukminElection.pledges.find(p=>p.id===plan.pledgeId),card=make('section','fulfillment-result-card');card.append(global.GukminStatus.createToken({label:{keep:'이행',compromise:'조정',break:'철회'}[plan.mode],icon:plan.mode==='break'?'speech':'check'}),make('h3','',pledge.name),make('p','',plan.mode==='compromise'?pledge.compromise:plan.mode==='keep'?'시간을 들여 약속한 일을 직접 맡았어요.':'지키기 어렵다고 설명하고 친구들에게 사과했어요.'));content.append(card);}
 const footer=make('footer','life-modal-foot'),next=make('button','life-submit','결과를 확인했어 →');next.type='button';next.addEventListener('click',onContinue);footer.append(next);sheet.append(head,content,footer);dialog.replaceChildren(sheet);dialog.classList.add('is-election-fulfillment','is-fulfillment-result');const cancel=e=>{e.preventDefault();onContinue();};dialog.addEventListener('cancel',cancel);if(!dialog.open)dialog.showModal();
 return ()=>{dialog.removeEventListener('cancel',cancel);if(dialog.open)dialog.close();dialog.replaceChildren();dialog.classList.remove('is-election-fulfillment','is-fulfillment-result');};
}
global.GukminElectionChoices=Object.freeze({presentResult,present:options=>options.choice.presentation.type==='election-fulfillment'?presentFulfillment(options):options.choice.presentation.type==='election-survey'?presentSurvey(options):presentPledges(options)});
})(window);
