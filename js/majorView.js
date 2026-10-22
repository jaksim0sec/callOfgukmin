/* Native major-choice presenter: exam paper and high-school application. */
(function(global){
'use strict';
const dialog=document.getElementById('lifeDecisionDialog');
if(!dialog)return;
const make=(tag,cls,text)=>{
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(text!==undefined)element.textContent=global.GukminMarkup.text(text);
 return element;
};
function effectList(option,person,turn,labels={}){
 const projected=global.GukminEffects.apply(person,option.result,{turn});
 const span=make('span','life-effects');
 for(const [id,next] of Object.entries(projected.stats)){
  const n=Number.isFinite(next)&&Number.isFinite(person.stats[id])?next-person.stats[id]:0;
  if(!n)continue;
  span.append(labels[id]?global.GukminStatus.createToken({label:labels[id]+' '+(n>0?'+':'−')+Math.abs(n),icon:global.GukminPlayer.metricDefinition(id).icon||'graduation',classes:'metric-impact metric-'+id+' life-delta'}):global.GukminStatus.createToken({type:'metric',id,amount:n,classes:'life-delta'}));
 }
 for(const entry of projected.traits||[]){
  const name=typeof entry==='string'?entry:entry.name;
  if(global.GukminPlayer.hasTrait(person,name))continue;
  const def=global.GukminPlayer.traitDefinitions[name]||{};
  if(def.hidden)continue;
  span.append(global.GukminStatus.createToken({type:'trait',name,classes:'life-delta'}));
 }
 return span;
}

// Show the exact settlement as separate tokens; grades stay in the forecast below.
function examOutcomes(option,person,metric,turn,effort,label){
 const wrap=make('div','exam-outcomes');
 wrap.append(make('small','exam-effort-label','노력 '+effort+' / 4'));
 const tokens=effectList(option,person,turn,{[metric]:label});tokens.classList.add('exam-effect-tokens');
 if(!tokens.childElementCount)tokens.append(global.GukminStatus.createToken({label:'현재 역량 유지',icon:'check'}));
 wrap.append(tokens);return wrap;
}
function appliedSources(person,result){
 const strip=make('div','assessment-sources');
 const calculated=result.assessment?global.GukminGrades.assessment(person,result.assessment):null;
 if(calculated?.applied.length){strip.append(make('small','','이번 평가에 적용됨'));for(const source of calculated.applied){const row=make('span','assessment-source');row.append(make('strong','assessment-source-name',source.trait||source.label),make('span','',source.text));strip.append(row);}}
 if(calculated?.limited)strip.append(make('small','','범위 제한 반영 · 실제 성적 변화 '+calculated.actual.toLocaleString('ko-KR',{maximumFractionDigits:1})));
 return strip;
}
function schoolLogo(){const image=make('img','school-placeholder');image.src='assets/svg/school-placeholder.svg';image.alt='';return image;}
function presentAdmission({choice,resolve,root}){
 let selected=null,closed=false;
 const p=choice.presentation||{};
 const person=global.GukminGame.session?.snapshot().persona||global.GukminPlayer.load();
 let field=person?.attributes?.admissionField||(global.GukminPlayer.hasTrait(person,'이과')?'science':'humanities');
 const modal=make('section','life-modal-wrap admission-paper');
 const head=make('header','life-modal-head');
 const label=p.type==='admission-route'?'진로 선택서':
  p.type==='grade-seal'?(p.category==='mock'?'대학수학능력시험 성적표':'최종 내신 성적표'):
  p.type==='university'?'대학 입학 원서':'졸업 후 진로';
 head.append(make('span','life-modal-serial','국민의 부름 / '+label));
 const foldButton=make('button','life-modal-collapse','접기 ⌄');
 foldButton.type='button';foldButton.setAttribute('aria-label','선택을 유지하고 접기');
 head.append(foldButton);modal.append(head);
 const heading=make('h2','life-modal-title',p.term||choice.title);

 const summary=make('p','life-modal-sub');
 global.GukminMarkup.render(summary,choice.body||'');
 modal.append(heading,make('p','admission-meta',(person.name||'학생')+' · 입시 '+(person.attributes?.admissionAttempts||1)+'회차'),summary);
 if(['admission-finish','admission-route'].includes(p.type)){const support=global.GukminAdmissions.supportStatus(person),box=make('section','family-support');box.setAttribute('aria-label','가족의 재수학원 지원');const head=make('div','family-support-heading');head.append(global.GukminStatus.createToken({label:'재수학원',icon:'school'}),make('strong','',support.limit===null?'30살 이전까지 지원':support.remaining+'회 지원 가능'));box.append(head,make('p','',support.detail),make('small','',support.tier+' · '+support.used+'회 이용'+(support.limit===null?'':' / 총 '+support.limit+'회 지원')));if(person.age>=28)box.append(make('p','career-deadline','30세까지 입시 준비만 이어가면 백수 엔딩입니다. 사회 진출 기회도 확인하세요.'));modal.append(box);}
 const choices=make('div','admission-choices'+(p.type==='admission-route'?' is-route':''));
 if(p.type==='admission-route'){
  const gradeStrip=make('div','admission-grade-strip');
  for(const [metric,label] of [['schoolScore','현재 내신'],['exam','수능']]){
   const score=person?.stats?.[metric];
   const value=metric==='exam'&&!person.attributes?.csatSubmitted?'미응시':global.GukminGrades.report(metric,score,'high').display;
   const cell=make('span','admission-grade-piece');
   cell.append(make('small','',label),make('strong','',value));gradeStrip.append(cell);
  }
  modal.append(gradeStrip);
 }else if(p.type==='university'){
  const score=person?.stats?.[p.gradeMetric];
  const current=make('p','admission-current-score',
   (p.gradeMetric==='schoolScore'?'최종 내신 ':'최종 수능 ')+global.GukminGrades.report(p.gradeMetric,score,'high').display+' · 현재 게임 지수 '+(Number.isFinite(score)?score:'—'));
  modal.append(current);
 }
 const fields=make('div','admission-fields');
 if(p.type==='university'){for(const [id,text] of [['humanities','인문·사회'],['science','자연·공학']]){const b=make('button','',text);b.type='button';b.dataset.field=id;b.setAttribute('aria-pressed',String(field===id));b.addEventListener('click',()=>{field=id;for(const button of fields.children)button.setAttribute('aria-pressed',String(button===b));for(const row of choices.querySelectorAll('[data-school-name]'))row.textContent=id==='science'?row.dataset.schoolName.replace(/(?:인문사회|사회과학|인문|사회|실무)계열/,'자연·공학계열'):row.dataset.schoolName;});fields.append(b);}modal.append(fields);}
 choice.options.forEach((entry,index)=>{
  const isRoute=p.type==='admission-route';
  const primary=isRoute&&(entry.id==='early'||entry.id==='regular');
  const row=make('button',primary?'admission-major':isRoute?'admission-minor':'admission-row');
  row.type='button';row.disabled=entry.available===false;
  row.dataset.choice=entry.id;row.setAttribute('aria-pressed','false');
  if(isRoute&&primary)row.classList.add(entry.id==='early'?'route-early':'route-regular');
  const label=make('strong','admission-choice-title',
   isRoute?entry.id==='early'?'수시':entry.id==='regular'?'정시':entry.id==='employment'?'바로 사회 진출':'N수 하기':
   entry.school?.name||entry.label);
  if(entry.result?.retryYear){const support=global.GukminAdmissions.supportStatus(person);label.textContent=person.age>=29?'재수를 계속하고 서른을 맞는다':support.remaining===null||support.remaining>0?'가족 지원으로 재수학원에 다닌다':'독학으로 다음 입시를 준비한다';}
  if(entry.school){row.append(schoolLogo());label.dataset.schoolName=entry.school.name;if(field==='science')label.textContent=entry.school.name.replace(/(?:인문사회|사회과학|인문|사회|실무)계열/,'자연·공학계열');}
  row.append(label);
  if(isRoute&&primary){
   const metric=entry.id==='early'?'schoolScore':'exam';
   const score=person?.stats?.[metric];
   const grade=make('span','admission-big-grade',metric==='exam'&&!person.attributes?.csatSubmitted?'응시 전':global.GukminGrades.report(metric,score,'high').display);
   row.append(grade);
  }
  if(entry.school?.typeLabel){const chance=global.GukminAdmissions.probability(person,entry.school,p.category);row.append(make('small','admission-type-label',entry.school.typeLabel+' · 합격 확률 '+chance+'%'+(entry.school.minimum?' · 수능 최저 '+global.GukminGrades.report('exam',entry.school.minimum,'high').display+' 수준':'')));}
  else if(!primary&&p.type!=='grade-seal'&&!entry.result?.retryYear)row.append(make('small','admission-type-label',entry.label));
  if(entry.school){const after=global.GukminEffects.apply(person,entry.result,{turn:choice.openedAt||0});const cost=after.stats.stress-person.stats.stress;row.append(make('span','admission-risk','지원 부담 · 압박 '+(cost>0?'+':'')+cost.toLocaleString('ko-KR',{maximumFractionDigits:1})));if(p.category==='early'&&person.attributes?.preExamStrategy==='record')row.append(make('small','admission-note','서류 준비 보정 +1 · 내신 등급은 유지'));}
  else if(entry.result?.retryYear)row.append(make('span','admission-risk',person.age>=29?'30세 도달 · 백수 엔딩 · 추가 학원 등록 없음':'나이 +1 · 압박 +'+(person.age>=24?3:2)+(person.age>=24?' · 관계 −1 · 경력 공백 누적':'')+' · 내 재산 차감 없음'));
  else if(entry.risk)row.append(make('span','admission-risk',entry.risk));
  if(entry.outlook)row.append(make('small','admission-note',entry.outlook));
  row.addEventListener('click',()=>{
   selected=entry.id;
   [...choices.children].forEach(button=>button.setAttribute('aria-pressed',String(button===row)));
   confirm.disabled=false;
  });
  if(p.type==='grade-seal'){row.hidden=true;selected=entry.id;}
  choices.append(row);
 });
 modal.append(choices);
 const footer=make('footer','life-modal-foot admission-foot');
 footer.append(make('p','',p.type==='university'?'성적과 준비 상태에 따라 합격 확률이 달라집니다.':
  p.type==='grade-seal'?'확인 후 최종 성적을 공개합니다.':'한 번의 선택이 이후 지원 기회를 바꿉니다.'));
 const confirm=make('button','life-submit',p.type==='grade-seal'
  ?p.category==='mock'?'수능 점수 확인하기':'내신 점수 확인하기':p.type==='university'?'선택한 대학에 지원':'이 진로로 확정');
 confirm.type='button';confirm.disabled=!selected;
 confirm.addEventListener('click',()=>{if(!selected||closed)return;const id=selected;dialog.close();resolve(id,p.type==='university'?{admissionField:field}:undefined);});
 footer.append(confirm);modal.append(footer);dialog.replaceChildren(modal);
 dialog.classList.add('is-admission');
 const headerReopen=root.querySelector('#resumeMajorChoice');
 function sync(){if(headerReopen)headerReopen.hidden=closed||dialog.open;}
 function open(){if(!closed&&!dialog.open){dialog.showModal();sync();}}
 function fold(){if(dialog.open)dialog.close();sync();headerReopen?.focus({preventScroll:true});}
 function cancel(e){e.preventDefault();fold();}
 headerReopen?.addEventListener('click',open);
 foldButton.addEventListener('click',fold);
 dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',sync);
 open();
 return ()=>{
  closed=true;dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',sync);
  headerReopen?.removeEventListener('click',open);
  if(dialog.open)dialog.close();
  dialog.replaceChildren();dialog.classList.remove('is-admission');sync();
 };
}

function presentPledges({choice,resolve,root},person){
 const E=global.GukminElection,isFinal=choice.presentation.mode==='final',isDraft=!isFinal&&(person.attributes?.electionRevision||0)>=2,slots=isFinal?E.chosen(person).map(p=>p.id):[null,null,null];let activeSlot=0,closed=false;
 const sheet=make('section','life-modal-wrap election-pledge-paper'),head=make('header','life-modal-head'),foldButton=make('button','life-modal-collapse','접기 ⌄');foldButton.type='button';
 head.append(make('span','life-modal-serial','우리 반 선거관리위원회'),foldButton);
 const content=make('div','pledge-content');content.append(make('small','campaign-eyebrow','세 칸으로 움직이는, 서른 명의 마음'),make('h2','life-modal-title',isFinal?'최종 공약 조정':isDraft?'임시 공약 만들기':'공약 세 가지 선택'));
 const puzzle=make('section','pledge-puzzle'),rack=make('div','pledge-slots');rack.setAttribute('role','group');rack.setAttribute('aria-label','공약 세 칸');
 const slotButtons=slots.map((_,i)=>{const button=make('button','pledge-slot');button.type='button';button.addEventListener('click',()=>{activeSlot=i;paint();});button.addEventListener('keydown',e=>{if(['Delete','Backspace'].includes(e.key)){e.preventDefault();slots[i]=null;activeSlot=i;paint();}});rack.append(button);return button;});
 puzzle.append(rack,make('small','pledge-slot-help','카드를 눌러 끼우기 · 칸을 누르면 교체 · 고른 카드를 다시 누르면 빼기'));
 const board=global.GukminElectionView.board(person,{collapsible:true});puzzle.append(board.element);content.append(puzzle);
 const cards=make('div','pledge-cards');cards.setAttribute('role','group');cards.setAttribute('aria-label','공약 세 장 선택');
 const footer=make('footer','life-modal-foot pledge-footer'),counter=make('strong','pledge-counter','0 / 3'),confirm=make('button','life-submit',isFinal?'최종 공약 확정':isDraft?'이 공약으로 의견 듣기':'세 가지 약속 확정');confirm.type='button';confirm.disabled=true;counter.setAttribute('aria-live','polite');const live=make('small','pledge-live-share'),counts=make('div','pledge-footer-counts');counts.append(counter,live);
 function paint(){
  const ids=slots.filter(Boolean);slotButtons.forEach((button,i)=>{button.classList.toggle('is-active',activeSlot===i);button.classList.toggle('is-filled',!!slots[i]);button.setAttribute('aria-pressed',String(activeSlot===i));button.replaceChildren(make('small','','공약 '+(i+1)),make('strong','',slots[i]?E.pledges.find(p=>p.id===slots[i]).name:'＋ 끼워 넣기'));});
  for(const button of cards.children)button.setAttribute('aria-pressed',String(ids.includes(button.dataset.pledge)));counter.textContent=ids.length+' / 3';confirm.disabled=ids.length!==3;const forecast=board.update(ids);live.textContent='조사 지지 '+forecast.pollShares[0]+'%';
 }
 const short=['놀이','모범','조용','운동'];
 for(const pledge of E.available(person)){
  const card=make('button','pledge-card');card.type='button';card.dataset.pledge=pledge.id;card.setAttribute('aria-pressed','false');
  card.append(make('small','pledge-feasibility',pledge.difficulty>=2?'협의·타협 필요':'직접 이행 가능'),make('strong','',pledge.name));
  const reactions=make('span','pledge-reactions');pledge.scores.forEach((n,g)=>{const reaction=make('span',n>0?'is-positive':n<0?'is-negative':'is-neutral',short[g]+' '+(n>0?'+':n<0?'−':'')+Math.abs(n));reaction.title=E.groups[g].name+' 기본 호감';reactions.append(reaction);});card.append(reactions,make('small','pledge-reality',pledge.limit));
  card.addEventListener('click',()=>{
   const existing=slots.indexOf(pledge.id);if(existing>=0){slots[existing]=null;activeSlot=existing;}
   else{const index=activeSlot>=0?activeSlot:slots.indexOf(null);if(index<0){counter.textContent='바꿀 공약 칸을 먼저 눌러 주세요';return;}slots[index]=pledge.id;activeSlot=slots.indexOf(null);}
   paint();
  });cards.append(card);
 }
 const catalogHead=make('div','pledge-catalog-heading');catalogHead.append(make('strong','','공약 카드'),make('small','','기본 성향 · 실제 민심은 집단마다 달라집니다'));content.append(catalogHead,cards);
 footer.append(counts,confirm);sheet.append(head,content,footer);dialog.replaceChildren(sheet);dialog.classList.add('is-pledges');paint();
 const reopen=root.querySelector('#resumeMajorChoice');
 const sync=()=>{reopen.hidden=closed||dialog.open;},open=()=>{if(!closed&&!dialog.open){dialog.showModal();sync();}},fold=()=>{dialog.close();sync();reopen.focus({preventScroll:true});},cancel=e=>{e.preventDefault();fold();};
 reopen.addEventListener('click',open);foldButton.addEventListener('click',fold);dialog.addEventListener('cancel',cancel);dialog.addEventListener('close',sync);
 confirm.addEventListener('click',()=>{const ids=slots.filter(Boolean);if(closed||ids.length!==3)return;dialog.close();resolve('submit',{pledges:ids});});open();
 return ()=>{closed=true;reopen.removeEventListener('click',open);dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('close',sync);if(dialog.open)dialog.close();dialog.replaceChildren();dialog.classList.remove('is-pledges');sync();};
}

function present({choice,resolve,root}){
 let selected=null,closed=false;
 const person=global.GukminGame.session?.snapshot().persona||global.GukminPlayer.load();
 const p=choice.presentation||{};
 if(p.type==='election-pledges')return presentPledges({choice,resolve,root},person);
 if(['admission-route','grade-seal','university','admission-finish'].includes(p.type))
  return presentAdmission({choice,resolve,root});
 if(!['exam','school'].includes(p.type))return ()=>{};
 const isSchool=p.type==='school';
 dialog.classList.toggle('is-exam',!isSchool);
 const body=make('div','life-modal-wrap '+(isSchool?'life-school-paper':'life-exam-paper'));
 const head=make('header','life-modal-head');
 head.append(make('span','life-modal-serial','국민의 부름 / '+(isSchool?'지원서':'학교 시험')),
   make('span','life-modal-serial',isSchool?'입학 지원':'NO. '+choice.eventId));
 const title=make('h2','life-modal-title',isSchool?'고등학교 입학 지원서':p.term||choice.title);
 const sub=make('p','life-modal-sub',isSchool?'학교를 고르면 교육과정과 생활 정보를 확인할 수 있습니다':
   (p.grade+'학년 · '+(p.category==='mock'?'모의고사 · 9등급 기준':'내신 · '+(p.stage==='middle'?'성취도 A–E':'5등급 기준'))));
 const desc=make('p','life-modal-copy');
 global.GukminMarkup.render(desc,choice.body);if(person.age>=28&&(person.attributes?.admissionAttempts||1)>1)desc.append(make('strong','career-deadline','30세까지 재수만 이어가면 백수 엔딩입니다.'));
 if(p.stage==='retake')title.textContent=(person.attributes?.retakeMode==='academy'?'재수학원 · ':'독학 재수 · ')+(p.term||choice.title);
 const collapse=make('button','life-modal-collapse','접기 ⌄');collapse.type='button';
 collapse.setAttribute('aria-label','선택을 유지하고 창 접기');head.lastElementChild.replaceWith(collapse);
 const options=make('div','life-modal-options');
 if(!isSchool)options.classList.add('exam-effort-options');
 const formTop=make('div','life-paper-form');
 const question=make('div','life-paper-question');
 if(!isSchool){
  const banner=make('div','life-paper-heading');
  banner.append(make('span','life-paper-period','제 1 교시'),make('strong','life-paper-subject',
   p.category==='mock'?'학업 종합 모의평가':'학년별 내신 종합평가'),
   make('span','life-paper-page','1 / 1'));
  const meta=make('div','life-paper-identification');
  for(const [key,value] of [
   ['학년',String(p.grade||'—')],['성명',person?.name||'학생'],['수험번호','□ □ □ □ □']
  ]){
   const cell=make('span','life-paper-cell');
   cell.append(make('small','',key),make('b','',value));meta.append(cell);
  }
  formTop.append(banner,meta,make('p','life-paper-instruction',
   '※ 다음 상황을 읽고, 자신의 생활 여건에 맞는 준비 전략 하나를 고르시오.'));
  const fit=person.phase==='high'?global.GukminGrades.schoolFit(person):null;
  if(fit){const note=make('div','exam-fit-note');note.append(make('strong','',fit.matched?'적성 방패':'심화 수업 부담'),make('span','',fit.matched?fit.trait+' 특성으로 추가 압박 면제 · 기본 비용 완화':fit.trait+' 특성이 없으면 같은 성적에 압박 +2'));formTop.append(note);}
  question.append(make('b','life-paper-question-number','1.'),
   make('p','',p.annual?'한 학년 전체의 준비 강도를 선택하시오.':'이번 시험에 투자할 노력 수준을 선택하시오.'));
 }
 let schoolSourceLink=null;
 const sourceDetail=make('details','exam-source-detail');sourceDetail.hidden=true;sourceDetail.append(make('summary','','선택에 적용되는 특성·학교 효과'));
 const sourceContent=make('div','');sourceDetail.append(sourceContent);
 const confirm=make('button','life-submit',isSchool?'선택한 학교에 지원':'선택한 준비 수준 확정');
 confirm.type='button';confirm.disabled=true;
 const effortOf=option=>option.result?.assessment?.effort??Number(/^effort-(\d)$/.exec(option.id)?.[1]??-1);
 const displayOptions=isSchool?choice.options:[...choice.options].sort((a,b)=>effortOf(b)-effortOf(a));
 displayOptions.forEach((option,index)=>{
  const row=make('button','life-answer'+(option.available===false?' life-answer-locked':''));row.type='button';row.dataset.choice=option.id;
  row.disabled=option.available===false;
  const letter=make('span','life-answer-letter',isSchool?'':String.fromCharCode(9312+index));
  if(isSchool){
   const crest=make('span','life-school-crest');crest.append(schoolLogo());
   row.append(crest);
  }else row.append(letter);
  const copy=make('span','life-answer-copy');
  if(isSchool){
   const titleline=make('span','life-school-titleline');titleline.append(make('strong','',option.label));
   const kind=option.school?.kind;
   const kinds={science:'과학고',gifted:'영재학교',foreign:'외고',international:'국제고'};
   if(kinds[kind])titleline.append(global.GukminStatus.createToken({type:'context',label:kinds[kind],icon:'graduation',classes:'life-school-highlight school-highlight-'+kind}));
   copy.append(titleline);
  }else copy.append(make('strong','',option.label));
  if(isSchool){
   copy.append(make('small','life-school-type',option.school?.typeLabel||'지역 학교 후보'));
   const school=option.school||{};
   const actual=person?.stats?.schoolScore;
   if(school.minScore){
    const qualifies=Number.isFinite(actual)&&actual>=school.minScore;
    copy.append(make('small','life-requirement',
     '내신 '+(Number.isFinite(actual)?actual:'—')+' / 지원 기준 '+school.minScore+' 이상'+(qualifies?' · 충족':' · 미달')));
   }else copy.append(make('small','life-requirement','별도 내신 제한 없음'));
   if(['science','gifted'].includes(school.kind)){copy.append(make('small','life-requirement','지원 준비 경로 완료 필요 · '+(person.attributes?.admissionResearch?'완료':'미완료')));}
   const fit=global.GukminGrades.schoolFit(person,school.kind);if(fit)copy.append(make('small','life-requirement',fit.matched?fit.trait+' 적성 방패 · 시험 추가 압박 면제, 기본 비용 완화':'적성 불일치 · 같은 성적의 시험 압박 +2 ('+fit.trait+' 특성으로 완화)'));
   if(false&&school.minStudy){
    const study=person?.stats?.study;
    copy.append(make('small','life-requirement life-school-extra',
     '학습 기반 '+(Number.isFinite(study)?study:'—')+' · 권장 '+school.minStudy+' (지원 제한 아님)'));
   }
   if(school.distanceKm!==undefined){
    copy.append(make('small','life-requirement life-school-extra',
     school.schoolArea+' · 약 '+school.distanceKm+'km (출생 지역 기준 추정)'));
    copy.append(make('small','life-requirement life-school-extra',
     school.travelMode+' · 월 교통·생활비 예시 약 '+school.travelCost.toLocaleString('ko-KR')+'원 (입학금 아님)'));
    copy.append(make('small','life-requirement life-school-extra',
     '현실의 타 지역 지원 자격은 별도 모집요강 확인 필요'));
   }
   if(option.available===false){
    copy.append(make('small','life-school-lock','지원 기준 미달'));
   }
  }
  if(isSchool){const outcome=make('span','school-option-outcome');outcome.append(effectList(option,person,choice.openedAt||0));copy.append(outcome);}
  else copy.append(examOutcomes(option,person,p.category==='mock'?'exam':'schoolScore',choice.openedAt||0,effortOf(option),p.category==='mock'?'시험 역량':'교과 성취'));
  if(isSchool&&['science','gifted'].includes(option.school?.kind))copy.append(make('small','','학교 시작 효과 · 모의고사 1등급 · 이후 준비에 따라 변동'));
  if(!isSchool&&global.GukminGrades){
   const metric=p.category==='mock'?'exam':'schoolScore';
   const candidate=person;
   const current=candidate?.stats?.[metric];
   if(Number.isFinite(current)){
    // Preview the same modifiers and conditional learning bonuses as real settlement.
    const projection=global.GukminEffects.apply(candidate,option.result,
      {turn:candidate.simulation?.turn||0,source:'estimate'});
    const before=global.GukminGrades.report(metric,current,p.stage||'high').display;
    const after=global.GukminGrades.report(metric,projection.stats[metric],p.stage||'high').display;
    copy.append(make('small','life-paper-estimate',before+' → '+after+' (예상)'));
   }
  }
  if(!isSchool){const sources=appliedSources(person,option.result);sources.classList.add('is-compact');copy.append(sources);}
  row.append(copy);if(isSchool)row.append(make('span','life-answer-seal','印'));
  row.setAttribute('aria-pressed','false');
  row.addEventListener('click',()=>{
   selected=option.id;confirm.disabled=false;
   if(!isSchool){const sources=appliedSources(person,option.result);sourceContent.replaceChildren(sources);sourceDetail.hidden=!sources.childElementCount;}
   if(isSchool&&schoolSourceLink){
    schoolSourceLink.href=option.school?.source||'https://hischool.go.kr/';
    schoolSourceLink.textContent=option.school?.verified?'학교·전형 자료 열기 ↗':'고입정보포털에서 조회 ↗';
   }
   [...options.children].forEach(el=>el.setAttribute('aria-pressed',String(el===row)));
  });
  options.append(row);
 });
 const footer=make('footer','life-modal-foot');
 const note=make('p','',isSchool?'현재 성적과 지원 조건을 확인하세요.':'예상 성적입니다. 실제 준비와 적용 특성 효과를 포함합니다.');
 if(!isSchool)footer.append(sourceDetail);
 footer.append(note,confirm);
 if(isSchool){
  const source=make('a','life-school-source','학교 정보 공시 검색 ↗');
  source.href='https://hischool.go.kr/';source.target='_blank';source.rel='noopener noreferrer';
  schoolSourceLink=source;footer.prepend(source);
 }
 body.append(head);
 if(isSchool)body.append(title,sub,desc,options,footer);
 else{
  const content=make('div','exam-paper-content');
  content.append(formTop,title,sub,desc,question,options);
  body.append(content,footer);
 }
 dialog.replaceChildren(body);
 const headerReopen=root.querySelector('#resumeMajorChoice');
 function sync(){if(headerReopen)headerReopen.hidden=closed||dialog.open;}
 function open(){if(!closed&&!dialog.open){dialog.showModal();sync();}}
 function fold(){dialog.close();sync();headerReopen?.focus({preventScroll:true});}
 headerReopen?.addEventListener('click',open);
 collapse.addEventListener('click',fold);
 const handleCancel=e=>{e.preventDefault();fold();};
 dialog.addEventListener('cancel',handleCancel);
 dialog.addEventListener('close',sync);
 confirm.addEventListener('click',()=>{
  if(!selected||closed)return;
  const id=selected;
  dialog.close();
  resolve(id);
 });
 dialog.showModal();
 sync();
 return ()=>{
  closed=true;dialog.removeEventListener('cancel',handleCancel);
  dialog.removeEventListener('close',sync);headerReopen?.removeEventListener('click',open);sync();
  if(dialog.open)dialog.close();
  dialog.replaceChildren();
  dialog.classList.remove('is-exam');
 };
}
global.GukminGame.registerMajorPresenter(present);
})(window);
