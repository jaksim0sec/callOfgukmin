/* Adult-route cards reuse the native major-choice host and shared semantic tokens. */
(function(g){
'use strict';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
function present({choice,resolve,root}){
 const dialog=root.querySelector('#lifeDecisionDialog'),reopen=root.querySelector('#resumeMajorChoice'),token=o=>g.GukminStatus.createToken(o);
 let person=g.GukminGame.session?.snapshot().persona||g.GukminPlayer.load(),selected=null,closed=false,submitting=false;
 const sheet=make('section','life-modal-wrap society-paper'),head=make('header','life-modal-head'),fold=make('button','life-modal-collapse','접기 ⌄');fold.type='button';head.append(make('span','life-modal-serial','국민의 부름 / 사회'),fold);
 if(g.GukminSociety.canReturn(person)){const back=make('button','society-return-hub','사회로 돌아가기');back.type='button';back.addEventListener('click',()=>{if(!closed&&!submitting)g.GukminGame.session?.returnToSociety?.();});head.insertBefore(back,fold);}
 const body=make('div','society-content'),intro=make('section','society-intro'),routes=new Set(['college','military','career','politics','community','rest']);
 const isRoute=option=>choice.presentation?.stage==='hub'&&routes.has(option.id);
 function paintIntro(){
  const a=person.attributes||{},guide=g.GukminSociety.guidance(person,choice.presentation?.stage),meta=make('div','society-meta');intro.replaceChildren();
  meta.append(token({label:person.age+'살',icon:'clock'}),token({label:'사회 진입 후 '+guide.months+'개월',icon:'clock'}));if(a.collegeStatus)meta.append(token({label:'대학 '+a.collegeStatus,icon:'graduation'}));meta.append(token({label:a.militaryStatus||'병역 확인 전',icon:'flag'}));if(a.careerMonths)meta.append(token({label:'근무 '+a.careerMonths+'개월',icon:'coin'}));
  const route=make('section','society-route');route.setAttribute('aria-label','현재 경로와 다음 행동');route.append(make('strong','society-route-location','현재 · '+guide.location),make('span','society-route-goal',guide.goal),make('p','society-route-next','다음 행동 · '+guide.next));
  intro.append(meta,make('h2','life-modal-title',choice.title),route);
  if(choice.presentation?.stage==='hub')intro.append(make('p','society-hub-help','경로를 선택하면 메인 화면에서 소식과 일상 선택이 이어집니다. 메뉴에서 사회로 돌아와 다른 길을 살펴보고, 멈춘 경로는 나중에 이어갈 수 있습니다.'));
  if(guide.education){const education=make('section','society-education');education.append(make('strong','',guide.education.label));if(guide.education.totalSemesters){const progress=make('progress','society-degree-progress');progress.max=guide.education.totalSemesters;progress.value=guide.education.completedSemesters;progress.setAttribute('aria-label','대학 '+guide.education.totalSemesters+'학기 분량 중 '+guide.education.completedSemesters+'학기 분량 이수');education.append(progress);}education.append(make('small','',guide.education.detail));intro.append(education);}
  const story=make('details','society-story-details');story.append(make('summary','',choice.presentation?.stage==='college-funding'?'등록금·가족 지원 상세':'현재 상황과 조건 자세히'),g.GukminMarkup.render(make('p','society-story'),choice.body));intro.append(story);
  if(a.studentDebt>0)intro.append(token({label:'학자금 원금 '+a.studentDebt.toLocaleString('ko-KR')+'원',icon:'coin',classes:'society-debt'}));
 }
 body.append(intro);
 const cards=make('div','society-cards');cards.setAttribute('role','group');cards.setAttribute('aria-label','사회 활동 선택');
 const footer=make('footer','life-modal-foot society-footer'),summary=make('span','society-selected','다음 행동을 골라 주세요'),confirm=make('button','life-submit','선택을 확정하기 →');confirm.type='button';confirm.disabled=true;summary.setAttribute('aria-live','polite');footer.append(summary,confirm);
 function paintCards(){cards.replaceChildren();
 const ordered=[...choice.options.filter(o=>!o.society?.months),...choice.options.filter(o=>o.society?.months)];let previousKind=null;
 for(const option of ordered){
  const months=option.society?.months||0,kind=months?'activity':'route';if(kind!==previousKind){cards.append(make('p','society-group-label',months?'시간을 보내는 활동':choice.presentation?.stage==='hub'?'다음 경로 · 선택 후 메인에서 진행':'경로·상태 선택 · 시간 경과 없음'));previousKind=kind;}
  const card=make('button','society-card');card.type='button';card.dataset.action=option.id;card.disabled=option.available===false;card.setAttribute('aria-pressed','false');
  card.dataset.kind=kind;const heading=make('span','society-card-heading');heading.append(token({label:months?months+'개월 활동':isRoute(option)?'메인에서 진행':'0개월 · 선택',icon:option.society?.icon||'flag'}),make('span','society-card-check','✓'));
  card.append(heading,make('strong','society-card-title',option.label),make('span','society-card-detail',option.outlook));
  const a=person.attributes||{},paused=option.id==='college'?a.collegeResumeStep:option.id==='military'?a.militaryResumeStep:option.id==='career'?a.careerResumeStep:option.id==='politics'?a.politicsResumeStep:option.id==='community'?a.communityResumeStep:option.id==='rest'?a.recoveryResumeStep:null;
  if(isRoute(option)&&paused)card.append(make('small','society-card-resume','진행을 멈춘 경로 · 이어서 시작'));
  if(card.disabled)card.append(make('small','society-card-locked',option.requirement||'현재 조건에서 선택할 수 없습니다.'));
  else{
   const projected=g.GukminEffects.apply(person,option.result,{preview:true}),effects=make('span','society-card-effects');
   for(const [id,value] of Object.entries(projected.stats)){const delta=(value??0)-(person.stats[id]??0);if(Number.isFinite(delta)&&delta)effects.append(token({type:'metric',id,amount:delta}));}
   if(option.id.startsWith('business-'))effects.append(token({label:option.id==='business-expand'?'정산 −250만~+500만 원':'정산 +60만~+220만 원',icon:'coin'}));
   if(option.id==='fund-loan')effects.append(token({label:'대출 '+g.GukminSociety.tuition(person).due.toLocaleString('ko-KR')+'원',icon:'coin'}));
   if(option.id.startsWith('apply-')){const chance=g.GukminSociety.chance(person,option.id.slice(6)),track=make('progress','society-chance');track.max=100;track.value=chance;track.setAttribute('aria-label','채용 가능성 '+chance+'%');const odds=make('span','society-card-odds');odds.append(make('small','','채용 가능성 '+chance+'%'),track);card.append(odds);}
   if(effects.childElementCount)card.append(effects);
  }
  card.addEventListener('click',()=>{selected=option.id;for(const item of cards.querySelectorAll('.society-card'))item.setAttribute('aria-pressed',String(item===card));summary.textContent=option.label+' · '+(months?months+'개월 경과':'시간 경과 없음');confirm.textContent=months?months+'개월 활동하기 →':option.id==='finish'?'다음으로 →':isRoute(option)?'메인에서 이어가기 →':'선택을 확정하기 →';confirm.disabled=false;});cards.append(card);
 }
 }
 body.append(cards);sheet.append(head,body,footer);dialog.replaceChildren(sheet);dialog.classList.add('is-society');
 const sync=()=>{reopen.hidden=closed||dialog.open;},open=()=>{if(!closed&&!dialog.open){const live=g.GukminGame.session?.snapshot();if(live?.choice?.token===choice.token){person=live.persona;choice=live.choice;}if(!choice.options.some(o=>o.id===selected&&o.available!==false)){selected=null;summary.textContent='다음 행동을 골라 주세요';confirm.textContent='선택을 확정하기 →';confirm.disabled=true;}paintIntro();paintCards();for(const card of cards.querySelectorAll('.society-card'))card.setAttribute('aria-pressed',String(card.dataset.action===selected));dialog.showModal();sync();}},collapse=()=>{dialog.close();sync();reopen.focus({preventScroll:true});},cancel=e=>{e.preventDefault();collapse();};
 fold.addEventListener('click',collapse);reopen.addEventListener('click',open);dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',sync);confirm.addEventListener('click',()=>{if(closed||submitting||!selected)return;submitting=true;confirm.disabled=true;dialog.close();resolve(selected);});open();
 return ()=>{closed=true;reopen.removeEventListener('click',open);dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',sync);if(dialog.open)dialog.close();dialog.replaceChildren();dialog.classList.remove('is-society');sync();};
}
g.GukminSocietyView=Object.freeze({present});
})(window);
