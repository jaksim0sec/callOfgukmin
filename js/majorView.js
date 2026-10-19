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
const notation={study:'학업',schoolScore:'내신',exam:'모의고사',stress:'부담',health:'건강',relations:'관계',allowance:'용돈'};
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
 const body=make('div','life-modal-wrap');
 const head=make('header','life-modal-head');
 head.append(make('span','life-modal-serial','국민의 부름 / '+(isSchool?'지원서':'학교 시험')),
   make('span','life-modal-serial',isSchool?'입학 지원':'NO. '+choice.eventId));
 const title=make('h2','life-modal-title',isSchool?'고등학교 입학 지원서':p.term||choice.title);
 const sub=make('p','life-modal-sub',isSchool?'현재 성적·거주 지역을 확인하고 진학 희망 학교를 고르시오.':
   (p.grade+'학년 · '+(p.category==='mock'?'모의고사':'정기고사')+' | 시험 대비에 투자할 노력을 선택하시오.'));
 const desc=make('p','life-modal-copy',choice.body);
 const options=make('div','life-modal-options');
 const confirm=make('button','life-submit',isSchool?'선택한 학교에 지원':'선택한 준비 수준 확정');
 confirm.type='button';confirm.disabled=true;
 choice.options.forEach((option,index)=>{
  const row=make('button','life-answer'+(option.available===false?' life-answer-locked':''));row.type='button';
  row.disabled=option.available===false;
  const letter=make('span','life-answer-letter',isSchool?'':String.fromCharCode(9312+index));
  if(isSchool){
   const crest=make('span','life-school-crest',option.school?.symbol||'學');
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
   copy.append(make('small','',option.school?.kind==='foreign'?'외국어고 · 게임 내 성적 조건':
     option.school?.kind==='gifted'?'영재학교 · 실제 별도 선발 전형':'일반고 · 지역 지원 후보'));
   if(option.available===false)copy.append(make('small','life-requirement','현재 내신·학업 수치가 게임 내 지원 기준에 못 미침'));
   else if(option.school?.kind==='foreign'||option.school?.kind==='gifted')copy.append(make('small','life-requirement','현실의 합격을 보장하지 않는 게임 조건'));
  }
  copy.append(effectList(option));
  row.append(copy,make('span','life-answer-check','✓'));
  row.setAttribute('aria-pressed','false');
  row.addEventListener('click',()=>{
   selected=option.id;confirm.disabled=false;
   [...options.children].forEach(el=>el.setAttribute('aria-pressed',String(el===row)));
  });
  options.append(row);
 });
 const footer=make('footer','life-modal-foot');
 const note=make('p','',isSchool?'※ 학교 이름은 실제 자료를 참고합니다. 학교별 합격 가능성·수업 수준은 게임용 모형이며 실재 기준이 아닙니다. 공식 교표를 확보하지 않은 학교는 임시 문자 마크를 사용합니다.':'※ 효과는 선택 즉시 적용되고 저장됩니다. 긴 시간 공부할수록 체력·스트레스 부담도 커집니다.');
 footer.append(note,confirm);
 if(isSchool){
  const source=make('a','life-school-source','학교 정보 공시 검색 ↗');
  source.href='https://www.schoolinfo.go.kr/Main.do';source.target='_blank';source.rel='noopener noreferrer';
  footer.prepend(source);
 }
 body.append(head,title,sub,desc,options,footer);
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
  reopen.remove();
 };
}
global.GukminGame.registerMajorPresenter(present);
})(window);
