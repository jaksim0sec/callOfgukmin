/* In-game UI controller.
 * Mounted by boot.js; content owns rules, this module projects committed state.
 */
(function(global){
'use strict';
const PARTIES=[
 {name:'자유국민당',icon:'▥',color:'#416f9e',desc:'성장과 책임'},
 {name:'민주혁신당',icon:'≋',color:'#be525f',desc:'복지와 개혁'},
 {name:'민생직진당',icon:'↯',color:'#b58d35',desc:'과감한 변화'},
 {name:'철벽수호당',icon:'▣',color:'#775da8',desc:'안정과 질서'},
 {name:'실용미래당',icon:'⟲',color:'#2d8a83',desc:'중도와 실용'}
];
const SCHOOLS=[
 {name:'휘문고',icon:'文',desc:'학업 중심 교육 환경',tags:['학업 집중','지원 조건 확인']},
 {name:'병신고',icon:'★',desc:'개성이 강한 학생들이 모이는 학교',tags:['다양한 활동','특성 기회']},
 {name:'이빨고',icon:'牙',desc:'토론과 발표 활동에 특화된 학교',tags:['언변 특성','교내 활동']},
 {name:'일반고',icon:'學',desc:'다양한 활동을 선택할 수 있는 학교',tags:['균형 잡힌 교육','선택 폭']}
];
function el(tag,cls,value){
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(value!==undefined)element.textContent=String(value);
 return element;
}
function posterData(persona){
 return {
  color:persona.partyColor,partyName:persona.party,partyIcon:persona.partyIcon,
  phrase:'미래의 씨앗',stage:persona.job,name:persona.name,number:persona.number,
  imageSrc:persona.portraitSrc,ageGroup:persona.age>=19?'adult':'child',template:'solid'
 };
}
let majorPresenter=null,refreshMounted=null,resetMajorPresentation=null,mountedSession=null;
function registerMajorPresenter(presenter){
 if(presenter!==null&&typeof presenter!=='function')throw new Error('한방 선택 표시기는 함수여야 함');
 if(majorPresenter===presenter)return;
 resetMajorPresentation?.();majorPresenter=presenter;refreshMounted?.();
}
function mount(root,navigate,content=global.GukminContent){
 mountedSession?.dispose();
 let disposed=false;
 const $=id=>root.querySelector('#'+id);
 let persona=global.GukminPlayer.ensure();
 let selection=-1,dialogOptions=[],dialogCommit=null,engine=null;
 let snapshot=null,presentedToken=null,disposeMajor=null,presentationEpoch=0;
 const verificationMode=new URLSearchParams(global.location.search).has('systems');
 $('systemTools').hidden=!verificationMode;
 function text(id,value){const target=$(id);if(target)target.textContent=String(value??'');}
 function render(){
  global.GukminStatus.render(root,persona);
  text('chapter',snapshot?.runtime.contentId===global.GukminSystemDemo.contentId
    ? '기반 검증 · '+snapshot.runtime.turn+'턴'
    : global.GukminPlayer.phaseDefinition(global.GukminPlayer.phaseOf(persona)).label);
  const host=$('playerPosterMount'),data=posterData(persona);
  if(!host.firstElementChild)host.append(global.GukminPoster.create(data));
  else global.GukminPoster.update(host.firstElementChild,data);
  document.documentElement.style.setProperty('--party',persona.partyColor||'#677181');
  const log=$('log');log.replaceChildren();
  for(const item of persona.history.filter(h=>h.display!=='hidden')){
   const article=el('article','record'),line=el('div','record-top');
   line.append(el('span','record-age','#'+item.age+'살'+(item.turn!==undefined?' · '+item.turn+'턴':'')),el('strong','',item.title));
   article.dataset.importance=item.importance||'normal';
   article.append(line,el('p','',item.detail));
   log.append(article);
  }
  renderProgress();
 }
 function clearMajor(){presentationEpoch++;const dispose=disposeMajor;disposeMajor=null;presentedToken=null;dispose?.();}
 function reset(){
  if(!global.confirm('현재 인물 정보를 초기화하고 다시 생성할까?'))return;
  const fresh=global.GukminPlayer.generate();
  if(!global.GukminPlayer.save(fresh))throw new Error('저장 실패');
  clearMajor();persona=fresh;engine=null;snapshot=null;connectLife();render();
 }
 function openDialog(type,options,{title,body,kicker,commit}){
  selection=-1;dialogOptions=options;dialogCommit=commit;
  const school=type==='school',dialog=$('choiceDialog');
  dialog.className=school?'school-dialog':'ballot-dialog';
  text('kicker',kicker);
  text('modalTitle',title);
  text('modalStory',body);
  text('summary','아직 선택하지 않음');
  $('confirm').disabled=true;
  const list=$('options');list.className=school?'options':'ballot-paper';list.replaceChildren();
  options.forEach((item,i)=>{
   const button=el('button',school?'option':'ballot-row');
   button.type='button';button.setAttribute('aria-pressed','false');
   if(school){
    const crest=el('span','crest');crest.append(el('span','',item.icon||'學'));
    const body=el('span','option-text');
    body.append(el('strong','school-name',item.name),el('small','',item.desc));
    const tags=el('span','choice-tags');
    (item.tags||[]).forEach(t=>tags.append(el('span','token',t)));
    body.append(tags);button.append(crest,body,el('span','check','✓'));
   }else{
    const n=el('span','ballot-no',i+1),content=el('span','ballot-party');
    const mark=el('span','party-mark',item.icon),words=el('span','');
    mark.style.setProperty('--color',item.color);
    words.append(el('strong','',item.name),el('small','',item.desc||''));
    content.append(mark,words);
    const box=el('span','stamp-box');box.append(el('span','stamp','✓'));
    button.append(n,content,box);
   }
   button.disabled=item.available===false;
   button.addEventListener('click',()=>{
    selection=i;
    Array.from(list.querySelectorAll('button')).forEach((node,index)=>node.setAttribute('aria-pressed',String(index===i)));
    text('summary',item.name+' 선택됨');
    $('confirm').disabled=false;
   });
   list.append(button);
  });
  dialog.showModal();
 }
 function openPreview(type){
  const school=type==='school';
  openDialog(type,school?SCHOOLS:PARTIES,{
   title:school?'진학 고등학교 선택':'소속 정당 선택',
   body:school?'본인이 진학할 고등학교를 선택하시오.':'입당할 정당을 선택하시오. (가상의 정당입니다.)',
   kicker:school?'진학 지원서 · 디자인 미리보기':'정당 가입 · 디자인 미리보기',
   commit:item=>text('chapter',item.name+' · UI만 미리보기')
  });
 }
 function confirmDialog(){
  if(selection<0)return;
  const item=dialogOptions[selection],commit=dialogCommit;
  $('choiceDialog').close();
  commit(item);
 }
 function safely(fn){
  return (...args)=>{if(disposed)return false;try{$('systemError').hidden=true;return fn(...args);}catch(error){
   text('systemError',error.message);$('systemError').hidden=false;console.error(error);
  }};
 }
 function onChange(s){snapshot=s;persona=s.persona;render();}
 function connect(definition,freshSession=false){
  const source={...persona};
  if(freshSession)delete source.simulation;
  engine=global.GukminTimeline.create({
   ...definition,persona:source,persist:s=>global.GukminPlayer.save(s),onChange
  });
  snapshot=engine.snapshot();persona=snapshot.persona;
 }
 function connectLife(){
  engine=global.GukminDirector.create({
   persona,persist:s=>global.GukminPlayer.save(s),onChange
  });
  snapshot=engine.snapshot();persona=snapshot.persona;
  engine.run();
 }
 function startDemo(){
  clearMajor();
  connect(global.GukminSystemDemo.config(),true);
  engine.advance(0);
 }
 function renderProgress(){
  if(disposed)return;
  const active=!!engine,choice=snapshot?.choice,p=snapshot?.progress;
  const demo=snapshot?.runtime.contentId===global.GukminSystemDemo.contentId;
  $('startSystemDemo').hidden=!verificationMode||demo;
  $('advanceTurn').hidden=!verificationMode||!demo;
  $('advanceTurn').disabled=!!p?.waiting;
  text('turnLabel',demo?snapshot.runtime.turn+'턴 · 검증용 시간':'실제 생애 시연');
  $('action').hidden=!choice;
  text('currentTitle',choice?.title||'');
  text('nextChoiceLabel',p?.waiting?'응답 대기':p?.remaining!==null&&p?.remaining!==undefined?p.remaining+'턴 남음':demo?'예정된 선택 없음':'이야기 준비 중');
  $('nextChoiceProgress').value=p?.value||0;
  const current=$('currentChoice');current.replaceChildren();
  if(presentedToken!==choice?.token)clearMajor();
  if(!choice)return;
  if(choice.layer==='한방 선택'){
   current.append(el('p','fine','한방 선택 응답 대기'));
   if(majorPresenter&&presentedToken!==choice.token){
    presentedToken=choice.token;
    const owner=engine,epoch=presentationEpoch;
    const dispose=majorPresenter({choice,root,resolve:optionId=>{if(disposed||engine!==owner||epoch!==presentationEpoch)return false;return safely(()=>owner.resolve(choice.token,optionId))();}});
    if(typeof dispose==='function'){if(!disposed&&epoch===presentationEpoch&&snapshot?.choice?.token===choice.token)disposeMajor=dispose;else dispose();}
   }
   return;
  }
  if(choice.body)current.append(el('p','fine',choice.body));
  const choices=el('div','inline-choices');
  const owner=engine;
  for(const option of choice.options){
   const button=el('button','inline-choice',option.label);button.type='button';button.disabled=!option.available;
   button.addEventListener('click',safely(()=>engine===owner?owner.resolve(choice.token,option.id):false));choices.append(button);
  }
  current.append(choices);
 }
 if(persona.simulation?.contentId===global.GukminSystemDemo.contentId)connect(global.GukminSystemDemo.config());
 else if(content){connect(content);engine.advance(0);}
 else connectLife();
 refreshMounted=renderProgress;resetMajorPresentation=clearMajor;

 const subscriptions=[
  [$('resetGame'),'click',reset],
  [$('startSystemDemo'),'click',startDemo],
  [$('advanceTurn'),'click',()=>engine.advance(1)],
  [$('previewSchool'),'click',()=>openPreview('school')],
  [$('previewParty'),'click',()=>openPreview('party')],
  [$('close'),'click',()=>$('choiceDialog').close()],
  [$('confirm'),'click',confirmDialog],
  [$('choiceDialog'),'close',()=>{selection=-1}]
 ];
 for(const subscription of subscriptions){subscription[2]=safely(subscription[2]);const [node,event,handler]=subscription;node.addEventListener(event,handler);}
 function requireEngine(){if(disposed)throw new Error('종료된 세션');if(!engine)throw new Error('콘텐츠가 연결되지 않음');return engine;}
 function dispose(){if(disposed)return;disposed=true;clearMajor();refreshMounted=null;resetMajorPresentation=null;mountedSession=null;for(const [node,event,handler] of subscriptions)node.removeEventListener(event,handler);}
 mountedSession=Object.freeze({
  snapshot:()=>requireEngine().snapshot(),advance:turns=>requireEngine().advance(turns),
  resolve:(token,id)=>requireEngine().resolve(token,id),apply:(id,result)=>requireEngine().apply(id,result),dispose
 });
 render();
 return dispose;
}
global.GukminGame=Object.freeze({mount,posterData,registerMajorPresenter,get session(){return mountedSession;}});
})(window);
