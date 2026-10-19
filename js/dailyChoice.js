/* Presentation-only daily choices. Timeline owns every decision and saved result. */
(function(global){
'use strict';
const P=global.GukminPlayer,S=global.GukminStatus;
function el(tag,cls,text){
 const node=document.createElement(tag);if(cls)node.className=cls;
 if(text!==undefined)node.textContent=String(text);return node;
}
function differences(before,after){
 const result=[],phase=P.phaseOf(after);
 for(const [id,value] of Object.entries(after.stats||{})){
  const old=before.stats?.[id];
  if(!Number.isFinite(old)||!Number.isFinite(value)||old===value)continue;
  if(id==='study'&&(phase==='middle'||phase==='high'))continue;
  const def=P.metricDefinition(id),delta=value-old;
  result.push({id,icon:def.icon||'sparkle',
   text:def.label+' '+(delta>0?'+':'−')+Math.abs(delta).toLocaleString('ko-KR')+
    (['money','allowance','income'].includes(id)?'원':''),
   tone:(id==='stress'?delta<0:delta>0)?'good':'bad'});
 }
 const name=x=>typeof x==='string'?x:x?.name;
 const prior=new Set((before.traits||[]).map(name)),next=new Set((after.traits||[]).map(name));
 for(const item of next)if(item&&!prior.has(item)){
  const def=P.traitDefinitions[item]||{};
  result.push({text:'특성 획득 · '+item,icon:def.icon||'sparkle',tone:def.negative?'bad':'good'});
 }
 for(const item of prior)if(item&&!next.has(item)){
  const def=P.traitDefinitions[item]||{};
  result.push({text:'특성 상실 · '+item,icon:def.icon||'sparkle',tone:def.negative?'good':'bad'});
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
function create({dialog,body,heading,collapseButton,resumeButton,resolve,proceed}){
 let token=null,folded=false,review=false,delta=[];
 function sync(){
  resumeButton.hidden=!(token!==null||review)||dialog.open;
  resumeButton.textContent=review?'결과 확인 · 열기':'선택 진행 중 · 열기';
 }
 function open(){
  if((token===null&&!review)||dialog.open)return;
  folded=false;dialog.showModal();sync();
 }
 function fold(){folded=true;if(dialog.open)dialog.close();sync();}
 function reset(){if(dialog.open)dialog.close();token=null;folded=false;review=false;delta=[];sync();}
 function cancel(event){event.preventDefault();fold();}
 function backdrop(event){
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)fold();
 }
 collapseButton.addEventListener('click',fold);
 resumeButton.addEventListener('click',open);
 dialog.addEventListener('cancel',cancel);
 dialog.addEventListener('click',backdrop);
 dialog.addEventListener('close',sync);
 function capture(before,after,choice,reviewPending){
  if(choice?.layer!=='일상 선택'||!reviewPending)return;
  delta=differences(before,after);review=true;
 }
 function showChoice(choice,host,persona){
  if(token!==choice.token){token=choice.token;folded=false;review=false;delta=[];}
  heading.textContent=choice.title;body.replaceChildren();
  const compact=el('div','daily-choice-compact');
  compact.append(el('strong','',choice.title),el('p','','선택 진행 중 · 결정을 기다리고 있어'));
  const reopen=el('button','daily-choice-reopen','선택 창 열기 →');
  reopen.type='button';reopen.addEventListener('click',open);
  compact.append(reopen);host.append(compact);
  const situation=el('section','daily-scenario');
  situation.append(el('span','daily-scenario-kicker','지금 상황'),el('strong','daily-scenario-title',choice.title));
  if(choice.body)situation.append(el('p','daily-choice-story',choice.body));
  body.append(situation,el('p','daily-choice-prompt','어떻게 할까?'));
  const list=el('div','inline-choices');
  list.setAttribute('role','group');list.setAttribute('aria-label','일상 선택지');
  for(const [index,option] of choice.options.entries()){
   const button=el('button','inline-choice');button.type='button';button.disabled=!option.available;
   const number=el('span','daily-choice-number',String(index+1).padStart(2,'0'));
   const text=el('span','daily-choice-copy');
   text.append(el('strong','daily-choice-title',option.label));
   if(option.available===false){
    const needed=option.when?.stats?.money?.gte,held=persona.stats.money;
    text.append(el('small','daily-choice-locked',
     Number.isFinite(needed)&&Number.isFinite(held)
      ?'재산 부족 · '+held.toLocaleString('ko-KR')+'원 / '+needed.toLocaleString('ko-KR')+'원 필요'
      :'현재 조건에서는 선택할 수 없음'));
   }
   const indicators=el('span','daily-choice-effects');
   for(const [id,amount] of Object.entries(option.result?.effects?.stats||{})){
    if(!Number.isFinite(amount)||amount===0)continue;
    const def=P.metricDefinition(id),good=id==='stress'?amount<0:amount>0;
    indicators.append(S.pill(def.label+' '+(amount>0?'+':'')+amount+
     (['money','allowance','income'].includes(id)?'원':''),def.icon||'sparkle',
     'daily-choice-effect metric-'+id+' '+(good?'is-positive':'is-negative')));
   }
   if(indicators.childElementCount)text.append(indicators);
   button.append(number,text,el('span','daily-choice-chevron','›'));
   button.addEventListener('click',()=>resolve(choice.token,option.id));
   list.append(button);
  }
  body.append(list);
  if(!folded)open();sync();
 }
 function showResult(persona){
  if(!review)return;
  body.replaceChildren();heading.textContent='선택 결과';
  const last=persona.history.at(-1);
  body.append(el('p','review-kicker','선택 완료'),el('strong','review-title',last?.title||'선택을 마쳤어'));
  if(last?.detail)body.append(el('p','daily-result-lead',last.detail));
  const list=el('div','daily-result-changes');
  for(const [i,item] of delta.entries()){
   const chip=S.pill(item.text,item.icon,'daily-result-chip impact-'+item.tone+(item.id?' metric-'+item.id:''));
   chip.style.animationDelay=Math.min(i,6)*.07+'s';list.append(chip);
  }
  body.append(list.childElementCount?list:el('p','daily-result-lead','선택 결과가 기록됐어'));
  const foot=el('div','daily-result-foot');
  const button=el('button','continue-story','다음 이야기 보기 →');button.type='button';
  button.addEventListener('click',()=>{reset();proceed();});
  foot.append(button);body.append(foot);
  if(!folded)open();sync();
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
  collapseButton.removeEventListener('click',fold);resumeButton.removeEventListener('click',open);
  dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('click',backdrop);dialog.removeEventListener('close',sync);
 }
 return Object.freeze({showChoice,showResult,capture,highlight,reset,dispose,isReview:()=>review});
}
global.GukminDailyChoice=Object.freeze({create});
})(window);
