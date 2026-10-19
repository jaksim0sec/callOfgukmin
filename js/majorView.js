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
function effectList(option){
 const stats=option.result?.effects?.stats||{};
 const span=make('span','life-effects');
 for(const [id,n] of Object.entries(stats)){
  if(!n)continue;
  const tag=make('span','life-delta '+((id==='stress'?n<0:n>0)?'life-delta-up':'life-delta-down'),
   (notation[id]||id)+' '+(n>0?'+':'')+n+(id==='allowance'?'원':''));
  span.append(tag);
 }
 return span;
}
function present({choice,resolve,root}){
 let selected=null,closed=false;
 const p=choice.presentation||{};
 if(!['exam','school'].includes(p.type))return ()=>{};
 const isSchool=p.type==='school';
 dialog.classList.toggle('is-exam',!isSchool);
 const body=make('div','life-modal-wrap '+(isSchool?'life-school-paper':'life-exam-paper'));
 const head=make('header','life-modal-head');
 head.append(make('span','life-modal-serial','국민의 부름 / '+(isSchool?'지원서':'학교 시험')),
   make('span','life-modal-serial',isSchool?'입학 지원':'NO. '+choice.eventId));
 const title=make('h2','life-modal-title',isSchool?'고등학교 입학 지원서':p.term||choice.title);
 const sub=make('p','life-modal-sub',isSchool?'거주지와 게임 내 지원 조건을 보고 희망 학교를 고르시오.':
   (p.grade+'학년 · '+(p.category==='mock'?'모의고사 · 9등급 기준':'내신 · '+(p.stage==='middle'?'성취도 A–E':'5등급 기준'))));
 const desc=make('p','life-modal-copy',choice.body);
 const options=make('div','life-modal-options');
 const formTop=make('div','life-paper-form');
 const question=make('div','life-paper-question');
 if(!isSchool){
  const person=global.GukminPlayer.load();
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
   copy.append(make('small','',option.school?.typeLabel||'지역 학교 후보'));
   const school=option.school||{};
   const actual=global.GukminPlayer.load()?.stats?.schoolScore;
   if(school.minScore){
    const qualifies=Number.isFinite(actual)&&actual>=school.minScore;
    copy.append(make('small','life-requirement',
     '게임 내신 '+(Number.isFinite(actual)?actual:'—')+' / 지원 기준 '+school.minScore+' 이상'+(qualifies?' · 충족':' · 미달')));
   }else copy.append(make('small','life-requirement','게임 내 별도 성적 제한 없음'));
   if(school.distanceKm!==undefined){
    copy.append(make('small','life-requirement',
     school.schoolArea+' · 약 '+school.distanceKm+'km (출생 지역 기준 추정)'));
    copy.append(make('small','life-requirement',
     school.travelMode+' · 게임 이동/생활 비용 '+school.travelCost.toLocaleString('ko-KR')+'원'));
    copy.append(make('small','life-requirement',
     '현실의 타 지역 지원 자격은 별도 모집요강 확인 필요'));
   }
   if(option.available===false){
    const wallet=global.GukminPlayer.load()?.stats?.money;
    const reason=school.travelCost&&Number.isFinite(wallet)&&wallet<school.travelCost
     ?'재산 '+wallet.toLocaleString('ko-KR')+'원 / 비용 '+school.travelCost.toLocaleString('ko-KR')+'원 필요'
     :'게임 지원 조건을 충족하지 않음';
    copy.append(make('small','life-requirement',reason));
   }
  }
  copy.append(effectList(option));
  if(!isSchool&&global.GukminGrades){
   const metric=p.category==='mock'?'exam':'schoolScore';
   const current=global.GukminPlayer.load()?.stats?.[metric];
   const delta=option.result?.effects?.stats?.[metric];
   if(Number.isFinite(current)&&Number.isFinite(delta)){
    const before=global.GukminGrades.report(metric,current,p.stage||'high').display;
    const after=global.GukminGrades.report(metric,current+delta,p.stage||'high').display;
    copy.append(make('small','life-paper-estimate',before+' → '+after+' (게임 예상)'));
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
 const note=make('p','',isSchool?'※ 실제 학교명은 참고 자료이며, 지원 자격과 합격 판정은 게임용 모형입니다.':'※ 정식 시험 문제가 아닌 게임 선택지입니다. 등급은 실제 석차·응시 결과가 아닌 게임 예상치입니다.');
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
 const reopen=make('button','inline-choice','📄 '+(isSchool?'진학 지원서 열기':'시험지 다시 열기'));
 reopen.type='button';root.querySelector('#currentChoice').append(reopen);
 reopen.addEventListener('click',()=>{if(!closed&&!dialog.open)dialog.showModal();});
 const handleCancel=e=>{e.preventDefault();dialog.close();};
 dialog.addEventListener('cancel',handleCancel);
 confirm.addEventListener('click',()=>{
  if(!selected||closed)return;
  const id=selected;
  dialog.close();
  resolve(id);
 });
 dialog.showModal();
 return ()=>{
  closed=true;dialog.removeEventListener('cancel',handleCancel);
  if(dialog.open)dialog.close();
  dialog.replaceChildren();
  dialog.classList.remove('is-exam');
  reopen.remove();
 };
}
global.GukminGame.registerMajorPresenter(present);
})(window);
