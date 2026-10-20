/* Presentation-only daily choices. Timeline owns every decision and saved result. */
(function(global){
'use strict';
const P=global.GukminPlayer,S=global.GukminStatus;
function el(tag,cls,text){
 const node=document.createElement(tag);if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);return node;
}
// Four supported inline marks only. Never parse story text as HTML.
function renderRich(target,input){
 const source=String(input??''),pattern=/\*\*([^*\n]+)\*\*|==([^=\n]+)==|~~([^~\n]+)~~|\*([^*\n]+)\*/g;
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
function differences(before,after){
 const result=[],phase=P.phaseOf(after);
 for(const [id,value] of Object.entries(after.stats||{})){
  const old=before.stats?.[id];
  if(!Number.isFinite(old)||!Number.isFinite(value)||old===value)continue;
  if(id==='study'&&(phase==='middle'||phase==='high'))continue;
  const def=P.metricDefinition(id),delta=value-old;
  result.push({id,amount:delta,icon:def.icon||'sparkle',
   text:def.label+' '+(delta>0?'+':'−')+Math.abs(delta).toLocaleString('ko-KR')+
    (['money','allowance','income'].includes(id)?'원':''),
   tone:(id==='stress'?delta<0:delta>0)?'good':'bad'});
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
  if(def.hidden)continue;
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
function create({dialog,body,heading,resumeButton,resolve,proceed}){
 let token=null,folded=false,review=false,delta=[],selectedId=null,currentChoice=null;
 const confirm=dialog.querySelector('#dailyPaperConfirm');
 const mobile=global.matchMedia('(max-width: 47.5em)');
 const paper=global.GukminSheet.create({
  element:dialog,handle:dialog.querySelector('#dailyPaperGrip'),
  dragTargets:[dialog.querySelector('#dailyPaperGrip'),dialog.querySelector('.daily-modal-head')],
  enabled:()=>mobile.matches,initial:1,dismissible:true,
  steps:[{name:'middle',ratio:.62},{name:'expanded',ratio:.94,topGapRem:.5}],
  onDismiss:closeNow
 });
 function sync(){
  resumeButton.hidden=token===null||review||dialog.open;
  resumeButton.textContent='선택 진행 중 · 열기';
  confirm.textContent=review?'인생 기록으로 돌아가기':'이 선택으로 기록하기';
  confirm.disabled=!review&&!selectedId;
 }
 function open(){
  if((token===null&&!review)||dialog.open)return;
  folded=false;dialog.showModal();paper.reset();sync();
  heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
 }
 function closeNow(){
  if(dialog.open)dialog.close();
  sync();
  if(!resumeButton.hidden)resumeButton.focus({preventScroll:true});
 }
 function fold(){folded=true;if(dialog.open)paper.dismiss();else sync();}
 function reset(){
  if(dialog.open)dialog.close();
  body.replaceChildren();token=null;folded=false;review=false;delta=[];selectedId=null;currentChoice=null;
  sync();
 }
 function cancel(event){event.preventDefault();fold();}
 function backdrop(event){
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)fold();
 }
 function confirmSelection(){
  if(review){fold();return;}
  if(!selectedId||!currentChoice)return;
  const option=currentChoice.options.find(item=>item.id===selectedId);
  if(option?.available)resolve(currentChoice.token,option.id);
 }
 resumeButton.addEventListener('click',open);
 confirm.addEventListener('click',confirmSelection);
 dialog.addEventListener('cancel',cancel);
 dialog.addEventListener('click',backdrop);
 dialog.addEventListener('close',sync);
 function capture(before,after,choice,reviewPending){
  if(choice?.layer!=='일상 선택'||!reviewPending)return;
  delta=differences(before,after);review=true;folded=false;
  if(dialog.open){
   body.replaceChildren();
   const page=el('section','daily-paper-result');
   page.id='dailyPaperResult';
   page.append(el('small','daily-paper-note','나의 선택'));
   const option=choice.options?.find(item=>item.id===selectedId);
   page.append(el('h3','daily-paper-result-title',option?.label||'오늘의 선택'));
   page.append(el('small','daily-paper-note','선택 이후'));
   const records=after.history?.slice(before.history?.length||0)||[];
   const last=records.filter(item=>item.display!=='hidden').at(-1);
   page.append(rich('p','daily-paper-result-story',last?.detail||'선택이 인생 기록에 남았다.'));
   if(delta.length){
    page.append(el('h4','daily-paper-impact-heading','이번 선택의 영향'));
    const chips=el('div','daily-paper-impacts');
    for(const item of delta){
     let chip;
     if(item.id&&Number.isFinite(item.amount)){
      chip=S.metricImpact(item.id,item.amount,'daily-paper-impact');
     }else if(item.trait&&item.change==='gain'){
      chip=S.traitToken(item.trait);
      chip.classList.add('daily-paper-impact','daily-trait-preview');
     }else{
      chip=S.pill(item.text,item.icon||'sparkle','daily-paper-impact impact-'+item.tone);
      if(item.color)chip.style.setProperty('--trait-color',item.color);
     }
     chips.append(chip);
    }
    page.append(chips);
   }else{
    page.append(el('h4','daily-paper-impact-heading','이번 선택의 영향'));
    page.append(el('p','daily-paper-neutral','즉시 변한 능력치는 없어. 이 선택은 인생 기록에 남아.'));
   }
   body.append(page);body.scrollTop=0;
  }
  sync();
 }
 function restore(snapshot){
  if(!snapshot?.reviewPending)return;
  const last=Object.values(snapshot.runtime?.choices||{}).filter(item=>item.status==='closed').at(-1);
  if(last?.layer!=='일상 선택')return;
  token=last.token;review=true;folded=true;
  delta=snapshot.runtime.reviewBefore?differences(snapshot.runtime.reviewBefore,snapshot.persona):[];
 }
 function showChoice(choice,host,persona){
  if(token!==choice.token){token=choice.token;folded=false;review=false;delta=[];selectedId=null;}
  currentChoice=choice;
  heading.textContent=choice.title;body.replaceChildren();
  const stage=P.phaseOf(persona),labels={infant:'유년기',elementary:'초등학교',middle:'중학교',high:'고등학교'};
  dialog.querySelector('.daily-modal-head small').textContent=persona.age+'살 · '+(labels[stage]||P.phaseDefinition(stage).label);
  const compact=el('div','daily-choice-compact');
  compact.append(el('strong','',choice.title),el('p','','선택 진행 중 · 결정을 기다리고 있어'));
  const reopen=el('button','daily-choice-reopen','선택 창 열기 →');
  reopen.type='button';reopen.addEventListener('click',open);
  compact.append(reopen);host.append(compact);
  const situation=el('section','daily-scenario');
  situation.append(el('span','daily-scenario-kicker','지금 상황'),el('strong','daily-scenario-title',choice.title));
  if(choice.body)situation.append(rich('p','daily-choice-story',choice.body));
  body.append(situation);
  const list=el('div','inline-choices');
  list.setAttribute('role','group');list.setAttribute('aria-label','일상 선택지');
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
     Number.isFinite(needed)&&Number.isFinite(held)
      ?'재산 부족 · '+held.toLocaleString('ko-KR')+'원 / '+needed.toLocaleString('ko-KR')+'원 필요'
      :option.requirement?'필요 · '+option.requirement:'현재 조건에서는 선택할 수 없음'));
   }
   if(option.available&&option.requirement)
    text.append(S.pill('활용 · '+option.requirement,'sparkle','daily-choice-advantage'));
   const indicators=el('span','daily-choice-effects');
   // Ordinary choices show the exact projection. A declared uncertain outlook
   // reveals known costs, leaving conditional success/failure for the result.
   const forecast=option.outlook?{...option.result,conditional:[]}:option.result;
   const projected=global.GukminEffects.apply(persona,forecast,{turn:choice.openedAt||0});
   for(const [id,next] of Object.entries(projected.stats||{})){
    const amount=Number.isFinite(next)&&Number.isFinite(persona.stats?.[id])?next-persona.stats[id]:0;
    if(!Number.isFinite(amount)||amount===0)continue;
    const def=P.metricDefinition(id),good=id==='stress'?amount<0:amount>0;
    indicators.append(S.metricImpact(id,amount,'daily-choice-effect '+(good?'is-positive':'is-negative')));
   }
   for(const trait of projected.traits||[]){
    const name=typeof trait==='string'?trait:trait.name;
    if(P.hasTrait(persona,name))continue;
    const def=P.traitDefinition(name);
    if(def.hidden&&name.startsWith('관심-')){
     const interest=name.slice(3);
     const preview=S.pill('관심 발견 · '+interest,'sparkle','daily-trait-preview');
     preview.style.setProperty('--trait-color',P.traitDefinitions[interest]?.color||'#89a4d2');
     indicators.append(preview);
    }else if(!def.hidden){
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
    indicators.append(S.pill((def.negative?'해소 · ':'상실 · ')+name,def.icon||'sparkle',
     'daily-choice-effect '+(def.negative?'is-positive':'is-negative')));
   }
   if(indicators.childElementCount)text.append(indicators);
   else text.append(el('small','daily-choice-note',Object.keys(option.result?.effects?.attributes||{}).length?'이 행동을 이후 이야기에서 기억합니다':'수치 변화 없이 이야기를 이어갑니다'));
   if(option.outlook)text.append(rich('small','daily-choice-outlook',option.outlook));
   if(option.risk)text.append(rich('small','daily-choice-risk','부담 · '+option.risk));
   button.append(number,text,el('span','daily-choice-chevron','›'));
   button.addEventListener('click',()=>{
    selectedId=option.id;
    for(const candidate of list.querySelectorAll('.inline-choice')){
     const pressed=candidate===button;
     candidate.classList.toggle('is-selected',pressed);
     candidate.setAttribute('aria-pressed',String(pressed));
    }
    sync();
   });
   list.append(button);
  }
  body.append(list);
  if(!folded)open();sync();
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
  resumeButton.removeEventListener('click',open);
  confirm.removeEventListener('click',confirmSelection);
  dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('click',backdrop);dialog.removeEventListener('close',sync);
 }
 return Object.freeze({showChoice,changesFor,capture,restore,highlight,reset,dispose,isReview:()=>review});
}
global.GukminDailyChoice=Object.freeze({create});
global.GukminMarkup=Object.freeze({render:renderRich});
})(window);
