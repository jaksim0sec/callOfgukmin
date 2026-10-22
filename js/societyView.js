/* Adult-route cards reuse the native major-choice host and shared semantic tokens. */
(function(g){
'use strict';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
function present({choice,resolve,root}){
 const dialog=root.querySelector('#lifeDecisionDialog'),reopen=root.querySelector('#resumeMajorChoice'),token=o=>g.GukminStatus.createToken(o);
 let person=g.GukminGame.session?.snapshot().persona||g.GukminPlayer.load(),a=person.attributes||{},selected=null,closed=false;
 const sheet=make('section','life-modal-wrap society-paper'),head=make('header','life-modal-head'),fold=make('button','life-modal-collapse','접기 ⌄');fold.type='button';head.append(make('span','life-modal-serial','국민의 부름 / 사회'),fold);
 const body=make('div','society-content'),intro=make('section','society-intro'),meta=make('div','society-meta');
 meta.append(token({label:person.age+'살',icon:'clock'}));if(a.collegeStatus)meta.append(token({label:'대학 '+a.collegeStatus,icon:'graduation'}));meta.append(token({label:a.militaryStatus||'병역 확인 전',icon:'flag'}));if(a.careerMonths)meta.append(token({label:'근무 '+a.careerMonths+'개월',icon:'coin'}));
 intro.append(meta,make('h2','life-modal-title',choice.title),g.GukminMarkup.render(make('p','society-story'),choice.body));
 if(a.studentDebt>0)intro.append(token({label:'학자금 원금 '+a.studentDebt.toLocaleString('ko-KR')+'원',icon:'coin',classes:'society-debt'}));body.append(intro);
 const cards=make('div','society-cards');cards.setAttribute('role','group');cards.setAttribute('aria-label','사회 활동 선택');
 const footer=make('footer','life-modal-foot society-footer'),summary=make('span','society-selected','다음 행선지를 골라 주세요'),confirm=make('button','life-submit','선택한 길로 →');confirm.type='button';confirm.disabled=true;summary.setAttribute('aria-live','polite');footer.append(summary,confirm);
 function paintCards(){cards.replaceChildren();
 for(const option of choice.options){
  const card=make('button','society-card');card.type='button';card.dataset.action=option.id;card.disabled=option.available===false;card.setAttribute('aria-pressed','false');
  const heading=make('span','society-card-heading');heading.append(token({label:option.society?.months?option.society.months+'개월':'진로 선택',icon:option.society?.icon||'flag'}),make('span','society-card-check','✓'));
  card.append(heading,make('strong','society-card-title',option.label),make('span','society-card-detail',option.outlook));
  if(card.disabled)card.append(make('small','society-card-locked',option.requirement||'현재 조건에서 선택할 수 없습니다.'));
  else{
   const projected=g.GukminEffects.apply(person,option.result,{preview:true}),effects=make('span','society-card-effects');
   for(const [id,value] of Object.entries(projected.stats)){const delta=(value??0)-(person.stats[id]??0);if(Number.isFinite(delta)&&delta)effects.append(token({type:'metric',id,amount:delta}));}
   if(option.id.startsWith('business-'))effects.append(token({label:option.id==='business-expand'?'정산 −250만~+500만 원':'정산 +60만~+220만 원',icon:'coin'}));
   if(option.id==='fund-loan')effects.append(token({label:'대출 '+g.GukminSociety.tuition(person).due.toLocaleString('ko-KR')+'원',icon:'coin'}));
   if(option.id.startsWith('apply-')){const chance=g.GukminSociety.chance(person,option.id.slice(6)),track=make('progress','society-chance');track.max=100;track.value=chance;track.setAttribute('aria-label','채용 가능성 '+chance+'%');const odds=make('span','society-card-odds');odds.append(make('small','','채용 가능성 '+chance+'%'),track);card.append(odds);}
   if(effects.childElementCount)card.append(effects);
  }
  card.addEventListener('click',()=>{selected=option.id;for(const item of cards.children)item.setAttribute('aria-pressed',String(item===card));summary.textContent=option.label;confirm.disabled=false;});cards.append(card);
 }
 }
 body.append(cards);sheet.append(head,body,footer);dialog.replaceChildren(sheet);dialog.classList.add('is-society');
 const sync=()=>{reopen.hidden=closed||dialog.open;},open=()=>{if(!closed&&!dialog.open){const live=g.GukminGame.session?.snapshot();if(live?.choice?.token===choice.token){person=live.persona;choice=live.choice;}if(!choice.options.some(o=>o.id===selected&&o.available)){selected=null;summary.textContent='다음 행선지를 골라 주세요';confirm.disabled=true;}paintCards();for(const card of cards.children)card.setAttribute('aria-pressed',String(card.dataset.action===selected));dialog.showModal();sync();}},collapse=()=>{dialog.close();sync();reopen.focus({preventScroll:true});},cancel=e=>{e.preventDefault();collapse();};
 fold.addEventListener('click',collapse);reopen.addEventListener('click',open);dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',sync);confirm.addEventListener('click',()=>{if(closed||!selected)return;dialog.close();resolve(selected);});open();
 return ()=>{closed=true;reopen.removeEventListener('click',open);dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',sync);if(dialog.open)dialog.close();dialog.replaceChildren();dialog.classList.remove('is-society');sync();};
}
g.GukminSocietyView=Object.freeze({present});
})(window);
