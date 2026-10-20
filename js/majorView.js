/* Native major-choice presenter: exam paper and high-school application. */
(function(global){
'use strict';
const dialog=document.getElementById('lifeDecisionDialog');
if(!dialog)return;
const make=(tag,cls,text)=>{
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(text!==undefined)element.textContent=String(text);
 return element;
};
const notation={study:'학업',schoolScore:'내신',exam:'모의고사',stress:'스트레스',health:'건강',relations:'관계',allowance:'용돈',money:'재산'};
function effectList(option,person,turn){
 const projected=global.GukminEffects.apply(person,option.result,{turn});
 const span=make('span','life-effects');
 for(const [id,next] of Object.entries(projected.stats)){
  const n=Number.isFinite(next)&&Number.isFinite(person.stats[id])?next-person.stats[id]:0;
  if(!n)continue;
  const tag=make('span','life-delta '+((id==='stress'?n<0:n>0)?'life-delta-up':'life-delta-down'),
   (notation[id]||id)+' '+(n>0?'+':'−')+Math.abs(n).toLocaleString('ko-KR',{maximumFractionDigits:2})+(['money','allowance','income'].includes(id)?'원':''));
  span.append(tag);
 }
 return span;
}
function present({choice,resolve,root}){
 let selected=null,closed=false;
 const person=global.GukminGame.session?.snapshot().persona||global.GukminPlayer.load();
 const p=choice.presentation||{};
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
 global.GukminMarkup.render(desc,choice.body);
 const collapse=make('button','life-modal-collapse','접기 ⌄');collapse.type='button';
 collapse.setAttribute('aria-label','선택을 유지하고 창 접기');head.lastElementChild.replaceWith(collapse);
 const options=make('div','life-modal-options');
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
  question.append(make('b','life-paper-question-number','1.'),
   make('p','',p.annual?'한 학년 전체의 준비 강도를 선택하시오.':'이번 시험에 투자할 노력 수준을 선택하시오.'));
 }
 let schoolSourceLink=null;
 const confirm=make('button','life-submit',isSchool?'선택한 학교에 지원':'선택한 준비 수준 확정');
 confirm.type='button';confirm.disabled=true;
 choice.options.forEach((option,index)=>{
  const row=make('button','life-answer'+(option.available===false?' life-answer-locked':''));row.type='button';
  row.disabled=option.available===false;
  const letter=make('span','life-answer-letter',isSchool?'':String.fromCharCode(9312+index));
  if(isSchool){
   const crest=make('span','life-school-crest',option.school?.symbol||'學');
   crest.title='공식 교표가 아닌 임시 식별 마크';
   if(option.school?.logoUrl){
    const image=make('img');
    image.src=option.school.logoUrl;image.alt=option.school.name+' 교표';
    image.loading='lazy';image.referrerPolicy='no-referrer';
    image.addEventListener('load',()=>{crest.textContent='';crest.append(image);},{once:true});
   }
   row.append(crest);
  }else row.append(letter);
  const copy=make('span','life-answer-copy');
  copy.append(make('strong','',option.label));
  if(isSchool){
   copy.append(make('small','life-school-type',option.school?.typeLabel||'지역 학교 후보'));
   const school=option.school||{};
   const actual=person?.stats?.schoolScore;
   if(school.minScore){
    const qualifies=Number.isFinite(actual)&&actual>=school.minScore;
    copy.append(make('small','life-requirement',
     '게임 내신 '+(Number.isFinite(actual)?actual:'—')+' / 지원 기준 '+school.minScore+' 이상'+(qualifies?' · 충족':' · 미달')));
   }else copy.append(make('small','life-requirement','게임 내 별도 내신 제한 없음'));
   if(school.minStudy){
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
  copy.append(effectList(option,person,choice.openedAt||0));
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
    copy.append(make('small','life-paper-estimate',before+' → '+after+' (게임 예상 · 누적 학업 포함)'));
   }
  }
  row.append(copy,make('span','life-answer-seal','印'));
  row.setAttribute('aria-pressed','false');
  row.addEventListener('click',()=>{
   selected=option.id;confirm.disabled=false;
   if(isSchool&&schoolSourceLink){
    schoolSourceLink.href=option.school?.source||'https://hischool.go.kr/';
    schoolSourceLink.textContent=option.school?.verified?'학교·전형 자료 열기 ↗':'고입정보포털에서 조회 ↗';
   }
   [...options.children].forEach(el=>el.setAttribute('aria-pressed',String(el===row)));
  });
  options.append(row);
 });
 const footer=make('footer','life-modal-foot');
 const note=make('p','',isSchool?'게임용 지원 기준입니다. 실제 입학 자격은 학교 자료에서 확인하세요.':'게임 내 예상 성적입니다. 학습 기반과 특성 효과를 포함합니다.');
 footer.append(note,confirm);
 if(isSchool){
  const source=make('a','life-school-source','학교 정보 공시 검색 ↗');
  source.href='https://hischool.go.kr/';source.target='_blank';source.rel='noopener noreferrer';
  schoolSourceLink=source;footer.prepend(source);
 }
 body.append(head);
 if(!isSchool)body.append(formTop);
 body.append(title,sub,desc);
 if(!isSchool)body.append(question);
 body.append(options,footer);
 dialog.replaceChildren(body);
 const reopen=make('button','inline-choice major-choice-reopen','📄 '+(isSchool?'진학 지원서 열기':'시험지 다시 열기'));
 reopen.type='button';root.querySelector('#currentChoice').append(reopen);
 const headerReopen=root.querySelector('#resumeMajorChoice');
 function sync(){if(headerReopen)headerReopen.hidden=closed||dialog.open;}
 function open(){if(!closed&&!dialog.open){dialog.showModal();sync();}}
 function fold(){dialog.close();sync();headerReopen?.focus({preventScroll:true});}
 reopen.addEventListener('click',open);headerReopen?.addEventListener('click',open);
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
  reopen.remove();
 };
}
global.GukminGame.registerMajorPresenter(present);
})(window);
