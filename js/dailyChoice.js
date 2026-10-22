/* Presentation-only daily choices. Timeline owns every decision and saved result. */
(function(global){
'use strict';
const P=global.GukminPlayer,S=global.GukminStatus;
function el(tag,cls,text){
 const node=document.createElement(tag);if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);return node;
}
// Format legacy frozen labels at display time; never rewrite saved choices.
function displayText(value){return String(value??'').replace(/게임 내 합격 가능성/g,'합격 확률').replace(/게임 내 예상 성적/g,'예상 성적').replace(/게임 내 별도/g,'별도').replace(/게임 내신 /g,'내신 ').replace(/게임 판정선/g,'판정선').replace(/게임 난도는 실제 입학 성적이나 공식 합격선이 아님/g,'성적과 준비 상태를 함께 반영합니다.');}
// Four supported inline marks only. Never parse story text as HTML.
function renderRich(target,input){
 const source=displayText(input),pattern=/\*\*([^*\n]+)\*\*|==([^=\n]+)==|~~([^~\n]+)~~|\*([^*\n]+)\*/g;
 const fragment=document.createDocumentFragment();let pos=0,match;
 // Preserve author-written Markdown line breaks as DOM breaks, not collapsed spaces.
 function plain(value){
  const rows=value.split(/\r?\n/);
  for(const [i,row] of rows.entries()){
   if(i)fragment.append(document.createElement('br'));
   if(row)fragment.append(document.createTextNode(row));
  }
 }
 while((match=pattern.exec(source))){
  plain(source.slice(pos,match.index));
  const tag=match[1]!==undefined?'strong':match[2]!==undefined?'mark':match[3]!==undefined?'del':'em';
  const node=document.createElement(tag);
  node.textContent=match[1]??match[2]??match[3]??match[4];
  fragment.append(node);pos=pattern.lastIndex;
 }
 plain(source.slice(pos));
 target.replaceChildren(fragment);return target;
}
function rich(tag,cls,text){return renderRich(el(tag,cls),text);}
function initialMetric(id,value){
 const def=P.metricDefinition(id);
 return def.label+' 시작 · '+value.toLocaleString('ko-KR')+(def.type==='currency'?'원':Number.isFinite(def.max)?'/'+def.max:'');
}
function differences(before,after){
 const result=[],phase=P.phaseOf(after);
 for(const [id,value] of Object.entries(after.stats||{})){
  const old=before.stats?.[id];
  if(!Number.isFinite(value))continue;
  if(id==='study'&&(phase==='middle'||phase==='high'))continue;
  const def=P.metricDefinition(id);
  if(!Number.isFinite(old)){result.push({text:initialMetric(id,value),icon:def.icon||'sparkle',tone:'neutral'});continue;}
  if(old===value)continue;
  const delta=value-old;
  result.push({id,amount:delta,icon:def.icon||'sparkle',
   text:def.label+' '+(delta>0?'+':'−')+Math.abs(delta).toLocaleString('ko-KR')+
    (['money','allowance','income'].includes(id)?'원':''),
   tone:(['stress','illness'].includes(id)?delta<0:delta>0)?'good':'bad'});
 }
 const name=x=>typeof x==='string'?x:x?.name;
 const prior=new Set((before.traits||[]).map(name)),next=new Set((after.traits||[]).map(name));
 for(const item of next)if(item&&!prior.has(item)){
  const def=P.traitDefinitions[item]||{};
  if(def.hidden&&!item.startsWith('관심-'))continue;
  result.push({text:item.startsWith('관심-')?'관심 발견 · '+item.slice(3):'특성 획득 · '+item,
   trait:item,change:'gain',icon:def.icon||'sparkle',tone:def.hidden?'neutral':def.negative?'bad':'good',color:def.color});
 }
 for(const item of prior)if(item&&!next.has(item)){
  const def=P.traitDefinitions[item]||{};
  if(def.hidden){if(item.startsWith('관심-')&&next.has(item.slice(3)))result.push({text:'관심 → 적성 · '+item.slice(3),trait:item,change:'conversion',icon:def.icon||'graduation',tone:'good'});continue;}
  result.push({text:(def.negative?'특성 해소 · ':'특성 상실 · ')+item,icon:def.icon||'sparkle',tone:def.negative?'good':'bad'});
 }
 const oldSchool=P.schoolsOf(before);
 for(const school of P.schoolsOf(after)){
  const prev=oldSchool.find(item=>item.id===school.id);
  if(!prev||prev.status!==school.status)
   result.push({text:(school.status==='enrolled'?'입학':school.status==='graduated'?'졸업':'학적 변경')+
    ' · '+school.name,icon:'graduation',tone:'neutral'});
 }
 const role=x=>typeof x==='string'?x:x.label||x.name;
 const oldRoles=new Set((before.roles||[]).map(role)),newRoles=new Set((after.roles||[]).map(role));
 for(const item of newRoles)if(item&&!oldRoles.has(item))
  result.push({text:'역할 획득 · '+item,icon:'flag',tone:'neutral'});
 for(const item of oldRoles)if(item&&!newRoles.has(item))
  result.push({text:'역할 종료 · '+item,icon:'flag',tone:'neutral'});
 return result;
}
function create({dialog,body,heading,resumeButton,resolve,proceed,onCountdown=()=>{}}){
 let token=null,folded=true,review=false,delta=[],selectedId=null,currentChoice=null,pendingDecision=null,reward=null;
 const confirm=dialog.querySelector('#dailyPaperConfirm');
 let sceneHandle=null,sceneState={};
 const AUTO_OPEN_MS=5000;
 let automatic=true;
 let autoReady=false,autoRemaining=AUTO_OPEN_MS,autoStarted=0,autoTimeout=0,autoTicker=0;
 const autoLabel=el('span','auto-choice-label','다음');
 resumeButton.replaceChildren(autoLabel,el('span','','→'));
 function stopClock(){
  if(autoTimeout)global.clearTimeout(autoTimeout);
  if(autoTicker)global.clearInterval(autoTicker);
  autoTimeout=0;autoTicker=0;
 }
 function paintClock(){
  const remaining=Math.max(0,autoRemaining-(autoStarted?performance.now()-autoStarted:0));
  onCountdown({ready:autoReady,remaining,total:AUTO_OPEN_MS,running:!!autoStarted&&automatic&&!dialog.open});
 }
 function pauseClock(){
  if(!autoReady)return;
  if(autoStarted)autoRemaining=Math.max(0,autoRemaining-(performance.now()-autoStarted));
  autoStarted=0;stopClock();
  paintClock();
 }
 function cancelClock(){
  autoReady=false;autoStarted=0;stopClock();
  paintClock();
 }
 function startClock(){
  if(!automatic||!autoReady||autoStarted||!token||dialog.open||document.hidden)return;
  if(autoRemaining<=0){open();return;}
  const currentToken=token;
  autoStarted=performance.now();
  autoTimeout=global.setTimeout(()=>{
   if(!autoReady||token!==currentToken)return;
   cancelClock();
   if(!document.hidden&&!dialog.open)open();
  },autoRemaining);
  autoTicker=global.setInterval(()=>{
   if(!autoReady)return;
   paintClock();
  },250);
  paintClock();
 }
 function handleVisibility(){
  if(document.hidden)pauseClock();
  else startClock();
 }
 const mobile=global.matchMedia('(max-width: 47.5em)');
 const paper=global.GukminSheet.create({
  element:dialog,handle:dialog.querySelector('#dailyPaperGrip'),
  dragTargets:[dialog.querySelector('#dailyPaperGrip'),dialog.querySelector('.daily-modal-head')],
  enabled:()=>mobile.matches,initial:1,dismissible:true,
  steps:[{name:'middle',ratio:.62},{name:'expanded',ratio:.94,topGapRem:.5}],
  onDismiss:closeNow
 });
 function rewardStory(before,after,from,to){
  const history=after.history||[];
  const entries=Number.isInteger(from)&&Number.isInteger(to)?
   history.slice(from,to+1):history.slice(before?.history?.length||0);
  return entries.filter(item=>item.display!=='hidden').map(item=>item.detail||'').filter(Boolean).join(' ');
 }
 function rewardModel(before,after,label,from,to,presentation,optionId){
  const route=after.attributes?.admissionResearch,score=after.stats?.schoolScore||0;
  const guidance=route&&route!==before.attributes?.admissionResearch?global.GukminStory.admissionGuide(after,route):'';
  return {presentation,optionId,portrait:global.GukminGame.posterData(after),attributes:after.attributes||{},stats:after.stats,traits:after.traits,guidance,label:label||'',changes:differences(before,after),story:rewardStory(before,after,from,to)};
 }
 function renderReward(){
  if(!reward)return;
  sceneHandle?.dispose();sceneHandle=null;
  dialog.classList.add('is-reward');
  const gained=reward.changes.filter(item=>item.change==='gain');
  const visibleTraits=gained.filter(item=>item.trait&&!item.trait.startsWith('관심-'));
  const interests=gained.filter(item=>item.trait?.startsWith('관심-'));
  heading.textContent='';
  dialog.querySelector('.daily-modal-head small').textContent='일상 선택 결과';
  body.replaceChildren();
  const hero=el('section','daily-reward-hero');
  const seal=el('span','daily-reward-seal');
  seal.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20"/><path d="m14 24 7 7 13-15"/></svg>';
  const title=el('h3','daily-reward-headline',visibleTraits.length?'새로운 특성 획득!':interests.length?'새로운 관심 발견!':'선택 완료!');
  hero.append(seal,title);
  if(reward.story)hero.append(rich('p','daily-reward-story',reward.story));
  else if(reward.label)hero.append(el('p','daily-reward-story',reward.label));
  body.append(hero);
  if(reward.guidance)body.append(rich('p','admission-guidance',reward.guidance));
  const section=el('section','daily-reward-changes');
  section.append(el('strong','daily-reward-changes-title','선택의 영향'));
  const tray=el('div','daily-reward-tokens');
  const conversions=reward.changes.filter(item=>item.change==='conversion');
  const ordered=[...gained.filter(item=>!conversions.some(c=>c.trait.slice(3)===item.trait)),...reward.changes.filter(item=>item.change!=='gain')];
  for(const [index,change] of ordered.entries()){
   let tokenNode;
   if(change.change==='conversion'){tokenNode=el('span','interest-transition daily-reward-token');tokenNode.append(S.createToken({type:'interest',name:change.trait.slice(3)}),el('span','','→'),S.traitToken(change.trait.slice(3)));}
   else if(change.id&&Number.isFinite(change.amount))
    tokenNode=S.metricImpact(change.id,change.amount,'daily-reward-token');
   else if(change.trait?.startsWith('관심-'))
    tokenNode=S.createToken({type:'interest',name:change.trait.slice(3),classes:'daily-reward-token'});
   else if(change.change==='gain'&&change.trait){
    tokenNode=S.traitToken(change.trait);
    tokenNode.classList.add('daily-reward-token','trait-shimmer');
   }else tokenNode=S.createToken({type:'context',label:change.text,icon:change.icon,classes:'daily-reward-token impact-'+change.tone});
   tokenNode.style.setProperty('--reward-order',Math.min(index,8));
   tray.append(tokenNode);
  }
  if(!ordered.length)tray.append(el('p','daily-reward-empty','수치 변화 없이 이야기에 기록됐어.'));
  section.append(tray);body.append(section);
  sceneHandle=global.GukminDailyScenes.reward({dialog,body,presentation:reward.presentation,attributes:reward.attributes,stats:reward.stats,traits:reward.traits,portrait:reward.portrait,optionId:reward.optionId,label:reward.label,restored:reward.restored,onReady:sync});
  if(reward.presentation?.type==='seating')body.insertBefore(section,hero);
  body.scrollTop=0;
  if(!global.matchMedia('(prefers-reduced-motion: reduce)').matches)body.animate([{opacity:.55,transform:'translateY(.25rem)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.22,.7,.25,1)'});
  sync();
 }
 function openRestoredReward(){
  if(!reward||dialog.open)return false;
  dialog.showModal();paper.reset();renderReward();
  return true;
 }
 function sync(){
  resumeButton.hidden=token===null||review||dialog.open||!!reward;
  resumeButton.classList.toggle('is-auto-opening',autoReady&&automatic);
  paintClock();
  confirm.textContent=reward?(reward.presentation?.type==='chat'?'대화 마치기':reward.presentation?.type==='sports'?'기록하고 계속하기':'보상 받기'):currentChoice?.presentation?.type==='chat'?'선택 확정':currentChoice?.presentation?.type==='seating'?'이 자리에 앉기':currentChoice?.presentation?.type==='sports'?'우리 반, 출발!':'이 선택으로 기록하기';
  confirm.disabled=!!sceneHandle?.isPlaying||(reward?false:!selectedId||!!pendingDecision);
  if(sceneHandle?.isPlaying)confirm.textContent='계주 진행 중…';
  if(!reward&&currentChoice?.presentation?.type==='study-app')confirm.textContent=selectedId==='comment'?'댓글 게시하기':selectedId==='like'?'좋아요 남기기':selectedId==='focus'?'내 공부 하러 가기':'내 반응 선택하기';
 }
 function open(){
  if((token===null&&!review)||dialog.open)return;
  cancelClock();
  folded=false;dialog.showModal();paper.reset();sync();
  heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
 }
 function closeNow(){
  if(sceneHandle?.isPlaying){sceneHandle.skip();paper.reset();return;}
  const claimed=!!reward;
  if(dialog.open)dialog.close();
  pendingDecision=null;reward=null;
  if(claimed){token=null;review=false;currentChoice=null;dialog.classList.remove('is-reward');}
  sync();
  if(claimed)proceed();
  else if(!resumeButton.hidden)resumeButton.focus({preventScroll:true});
 }
 function fold(){if(sceneHandle?.isPlaying){sceneHandle.skip();return;}folded=true;cancelClock();if(dialog.open)paper.dismiss();else sync();}
 function reset(){
  sceneHandle?.dispose();sceneHandle=null;sceneState={};
  cancelClock();
  if(dialog.open)dialog.close();
  dialog.dataset.scene='';body.replaceChildren();token=null;folded=true;review=false;delta=[];selectedId=null;currentChoice=null;pendingDecision=null;reward=null;dialog.classList.remove('is-reward');
  sync();
 }
 function cancel(event){event.preventDefault();fold();}
 function backdrop(event){
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)fold();
 }
 function confirmSelection(){
  if(reward){paper.dismiss();return;}
  if(!selectedId||!currentChoice||pendingDecision)return;
  const option=currentChoice.options.find(item=>item.id===selectedId);
  if(!option?.available)return;
  pendingDecision={token:currentChoice.token,id:option.id};
  confirm.disabled=true;
  // Settle once while keeping this same sheet open for the actual reward.
  resolve(pendingDecision.token,pendingDecision.id);
  if(!reward){pendingDecision=null;sync();} // Failed settlement keeps the selection editable.
 }
 resumeButton.addEventListener('click',open);
 document.addEventListener('visibilitychange',handleVisibility);
 confirm.addEventListener('click',confirmSelection);
 dialog.addEventListener('cancel',cancel);
 dialog.addEventListener('click',backdrop);
 dialog.addEventListener('close',sync);
 function capture(before,after,choice,reviewPending){
  if(choice?.layer!=='일상 선택')return;
  delta=differences(before,after);
  review=!!reviewPending;
  if(!pendingDecision||pendingDecision.token!==choice.token)return;
  const selected=choice.options.find(item=>item.id===pendingDecision.id);
  reward=rewardModel(before,after,selected?.label,(before.history||[]).length,(after.history||[]).length-1,choice.presentation,selected?.id);
  pendingDecision=null;
  renderReward();
 }
 function restore(snapshot){
  if(!snapshot?.reviewPending)return false;
  const last=Object.values(snapshot.runtime?.choices||{}).filter(item=>item.status==='closed').at(-1);
  if(last?.layer!=='일상 선택')return false;
  const outcome=last.outcome;
  if(!outcome?.before||!outcome?.after)return false;
  token=last.token;review=true;folded=false;delta=differences(outcome.before,outcome.after);
  reward=rewardModel(outcome.before,outcome.after,outcome.label,outcome.historyFrom,outcome.historyTo,last.script?.presentation,last.optionId);reward.restored=true;
  return true;
 }
 function showChoice(choice,host,persona){
  if(token!==choice.token){
   sceneHandle?.dispose();sceneHandle=null;sceneState={};
   cancelClock();token=choice.token;folded=true;review=false;delta=[];selectedId=null;reward=null;
   dialog.classList.remove('is-reward');autoReady=true;autoRemaining=AUTO_OPEN_MS;
  }
  currentChoice=choice;dialog.dataset.choiceKind=choice.presentation?.type||'daily';
  heading.textContent=choice.title;body.replaceChildren();
  const stage=P.phaseOf(persona),labels={infant:'유년기',elementary:'초등학교',middle:'중학교',high:'고등학교'};
  dialog.querySelector('.daily-modal-head small').textContent=persona.age+'살 · '+(labels[stage]||P.phaseDefinition(stage).label);
  const situation=el('section','daily-scenario');
  situation.append(el('span','daily-scenario-kicker','지금 상황'),el('strong','daily-scenario-title',choice.title));
  if(choice.body)situation.append(rich('p','daily-choice-story',choice.body));
  body.append(situation);
  const list=el('div','inline-choices');
  list.setAttribute('role','group');list.setAttribute('aria-label','일상 선택지');
  function selectOption(id){
   selectedId=id;
   for(const [index,candidate] of [...list.querySelectorAll('.inline-choice')].entries()){
    const pressed=choice.options[index].id===id;candidate.classList.toggle('is-selected',pressed);candidate.setAttribute('aria-pressed',String(pressed));
   }
   sync();
  }
  for(const [index,option] of choice.options.entries()){
   const button=el('button','inline-choice');button.type='button';button.disabled=!option.available;
   const number=el('span','daily-choice-number','');number.setAttribute('aria-hidden','true');
   button.setAttribute('aria-pressed',String(selectedId===option.id));
   if(selectedId===option.id)button.classList.add('is-selected');
   const text=el('span','daily-choice-copy');
   text.append(rich('strong','daily-choice-title',option.label));
   if(option.available===false){
    const needed=option.when?.stats?.money?.gte,held=persona.stats.money;
    text.append(el('small','daily-choice-locked',
     Number.isFinite(needed)&&Number.isFinite(held)&&held<needed
      ?'재산 부족 · '+held.toLocaleString('ko-KR')+'원 / '+needed.toLocaleString('ko-KR')+'원 필요'
      :option.requirement?'필요 · '+option.requirement:'현재 조건에서는 선택할 수 없음'));
   }
   if(option.available&&option.requirement)
    text.append(S.createToken({type:'context',label:'활용 · '+option.requirement,icon:'sparkle',
     classes:'daily-choice-advantage'}));
   if(stage!=='infant'){
   const indicators=el('span','daily-choice-effects');
   // Ordinary choices show the exact projection. A declared uncertain outlook
   // reveals known costs, leaving conditional success/failure for the result.
   const forecast=option.outlook||choice.presentation?.type==='sports'?{...option.result,conditional:[]}:option.result;
   const projected=global.GukminEffects.apply(persona,forecast,{turn:choice.openedAt||0});
   for(const [id,next] of Object.entries(projected.stats||{})){
    if(Number.isFinite(next)&&!Number.isFinite(persona.stats?.[id])){indicators.append(S.createToken({type:'context',label:initialMetric(id,next),icon:P.metricDefinition(id).icon||'sparkle',classes:'daily-choice-effect'}));continue;}
    const amount=Number.isFinite(next)&&Number.isFinite(persona.stats?.[id])?next-persona.stats[id]:0;
    if(!Number.isFinite(amount)||amount===0)continue;
    const def=P.metricDefinition(id),good=['stress','illness'].includes(id)?amount<0:amount>0;
    indicators.append(S.metricImpact(id,amount,'daily-choice-effect '+(good?'is-positive':'is-negative')));
   }
   for(const trait of projected.traits||[]){
    const name=typeof trait==='string'?trait:trait.name;
    if(P.hasTrait(persona,name))continue;
    const def=P.traitDefinition(name);
    if(def.revealOnAcquire)continue;
    if(def.hidden&&name.startsWith('관심-')){
     const interest=name.slice(3);
     const preview=S.createToken({type:'interest',name:interest,label:'관심 발견 · '+interest,
      classes:'daily-trait-preview'});
     indicators.append(preview);
    }else if(!def.hidden&&!P.hasTrait(persona,'관심-'+name)){
     const reward=S.traitToken(name);
     reward.classList.add('daily-trait-preview');
     reward.querySelector('.token-name').prepend('+ ');
     indicators.append(reward);
    }
   }
   for(const trait of persona.traits||[]){
    const name=typeof trait==='string'?trait:trait.name;
    if(P.hasTrait(projected,name)||P.traitDefinition(name).hidden)continue;
    const def=P.traitDefinition(name);
    indicators.append(S.createToken({type:'context',label:(def.negative?'해소 · ':'상실 · ')+name,
     icon:def.icon||'sparkle',classes:'daily-choice-effect '+(def.negative?'is-positive':'is-negative')}));
   }
   for(const name of persona.traits.filter(t=>typeof t==='string'&&t.startsWith('관심-'))){if(!P.hasTrait(projected,name)&&P.hasTrait(projected,name.slice(3))){const transition=el('span','interest-transition');transition.append(S.createToken({type:'interest',name:name.slice(3)}),el('span','','→'),S.traitToken(name.slice(3)));text.append(transition);}}
   const candidacy=choice.presentation?.type==='election'&&option.result?.effects?.attributes?.classElection==='ran';
   if(candidacy){
    const promise=el('div','election-choice-promise');promise.append(el('small','','당선되면'),S.traitToken('리더십'),S.createToken({label:'역할 · 반장',icon:'flag'}));text.append(promise);
    const cost=el('div','election-choice-cost');cost.append(el('small','','출마 준비'),indicators);text.append(cost);
   }else if(indicators.childElementCount)text.append(indicators);

   if(option.outlook)text.append(rich('small','daily-choice-outlook',option.outlook));
   if(option.risk)text.append(rich('small','daily-choice-risk','부담 · '+option.risk));
   }
   button.append(number,text,el('span','daily-choice-chevron','›'));
   button.addEventListener('click',()=>selectOption(option.id));
   list.append(button);
  }
  body.append(list);
  global.GukminDailyScenes.decorate({dialog,body,list,choice,persona,state:sceneState,onSelect:selectOption});
  sync();
  startClock(); // Starts once per choice token; re-renders do not restart the countdown.
 }
 function changesFor(outcome){
  return outcome?.before&&outcome?.after?differences(outcome.before,outcome.after):review?delta:[];
 }
  function highlight(root){
  for(const change of delta)if(change.id){
   const gauge=root.querySelector('.metric-'+change.id);
   if(gauge){
    gauge.classList.add('is-stat-updated');
    gauge.addEventListener('animationend',()=>gauge.classList.remove('is-stat-updated'),{once:true});
   }
  }
 }
 function dispose(){
  reset();
  paper.dispose();
  document.removeEventListener('visibilitychange',handleVisibility);
  resumeButton.removeEventListener('click',open);
  confirm.removeEventListener('click',confirmSelection);
  dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('click',backdrop);dialog.removeEventListener('close',sync);
 }
 function setAutomatic(value){
  if(automatic===!!value)return;
  pauseClock();automatic=!!value;sync();startClock();
 }
 return Object.freeze({setAutomatic,open,suspend:()=>{cancelClock();if(dialog.open)dialog.close();},showChoice,changesFor,capture,restore,openRestoredReward,highlight,reset,dispose,isReview:()=>review,isRewardVisible:()=>!!reward});
}
global.GukminDailyChoice=Object.freeze({create});
global.GukminMarkup=Object.freeze({render:renderRich,text:displayText});
})(window);
