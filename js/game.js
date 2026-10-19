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
function lifeTitle(persona){
 const age=persona.age,phase=global.GukminPlayer.phaseOf(persona);
 if(phase==='elementary')return '초등학교 '+Math.max(1,age-6)+'학년';
 if(phase==='middle')return '중학교 '+Math.max(1,age-12)+'학년';
 if(phase==='high'&&age<=18)return '고등학교 '+Math.max(1,age-15)+'학년';
 return global.GukminPlayer.phaseDefinition(phase).label;
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
 const sheet=$('lifeSheet'),sheetGrip=$('sheetToggle');
 const mobileSheet=global.matchMedia('(max-width: 47.5em)');

 let sheetLevel=0,drag=null,lastSheetDrag=0;
 const sheetHead=sheet.querySelector('.sheet-head');
 // Existing game DOM is permanent; CSS owns sheet heights and animation.
 function setSheetLevel(level){
  sheetLevel=Math.max(0,Math.min(2,level));
  sheet.classList.toggle('is-minimized',sheetLevel===0);
  sheet.classList.toggle('is-middle',sheetLevel===1);
  sheet.classList.toggle('is-expanded',sheetLevel===2);
  sheetGrip.setAttribute('aria-expanded',String(sheetLevel!==0));
  sheetGrip.setAttribute('aria-label',['인생 기록 중간까지 펼치기','인생 기록 전체 펼치기','인생 기록 최소화'][sheetLevel]);
 }
 setSheetLevel(0);
 function beginSheetDrag(e){
  if(!mobileSheet.matches||!e.isPrimary||e.button!==0||drag||
    e.target.closest('button:not(#sheetToggle),a,input,select,textarea'))return;
  drag={pointer:e.pointerId,owner:e.currentTarget,startY:e.clientY,
    startHeight:sheet.getBoundingClientRect().height,startLevel:sheetLevel,moved:false};
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function moveSheetDrag(e){
  if(!drag||e.pointerId!==drag.pointer)return;
  const distance=e.clientY-drag.startY;
  if(!drag.moved&&Math.abs(distance)<8)return;
  drag.moved=true;
  sheet.classList.add('is-dragging');
  // A transient CSS variable is the only live positioning input.
  sheet.style.setProperty('--sheet-drag-height',(drag.startHeight-distance)+'px');
  if(e.cancelable)e.preventDefault();
 }
 function finishSheetDrag(e,cancel=false){
  if(!drag||e.pointerId!==drag.pointer)return;
  const {owner,startY,startLevel,moved,pointer}=drag;
  let next=startLevel;
  if(moved&&!cancel){
   const delta=e.clientY-startY;
   const threshold=Math.min(80,Math.max(48,global.innerHeight*.08));
   if(delta<=-threshold)next=Math.min(2,startLevel+1);
   else if(delta>=threshold)next=Math.max(0,startLevel-1);
  }
  drag=null;
  sheet.classList.remove('is-dragging');
  sheet.style.removeProperty('--sheet-drag-height');
  setSheetLevel(next);
  if(moved&&owner===sheetGrip)lastSheetDrag=Date.now();
  if(owner.hasPointerCapture(pointer))owner.releasePointerCapture(pointer);
 }
 let persona=global.GukminPlayer.ensure();
 let selection=-1,dialogOptions=[],dialogCommit=null,engine=null;
 let snapshot=null,presentedToken=null,disposeMajor=null,presentationEpoch=0;
 const verificationMode=new URLSearchParams(global.location.search).has('systems');
 $('systemTools').hidden=!verificationMode;
 function text(id,value){const target=$(id);if(target)target.textContent=String(value??'');}
 function render(){
  global.GukminStatus.render(root,persona);
  text('lifeHeadline',persona.age+'살');
  text('chapter',snapshot?.runtime.contentId===global.GukminSystemDemo.contentId
    ? '검증 · '+snapshot.runtime.turn+'턴' : lifeTitle(persona));
  const host=$('playerPosterMount'),data=posterData(persona);
  if(!host.firstElementChild)host.append(global.GukminPoster.create(data));
  else global.GukminPoster.update(host.firstElementChild,data);
  document.documentElement.style.setProperty('--party',persona.partyColor||'#677181');
  const log=$('log');log.replaceChildren();
  for(const item of [...persona.history].filter(h=>h.display!=='hidden').reverse()){
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
  clearCinematics();clearMajor();persona=fresh;engine=null;snapshot=null;connectLife();render();
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
 const cinematics=[],cinematic=$('lifeCinematic');
 let cinematicTimer=null,cinematicShown=false;
 const reduceMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function nextCinematic(){
  if(disposed||cinematicShown||!cinematics.length)return;
  const scene=cinematics.shift();
  cinematicShown=true;
  const body=$('lifeCinematicBody');body.replaceChildren();
  const card=el('section','life-cinematic-card'+(scene.kind==='grade'?' is-grade':''));
  card.append(el('span','life-cinematic-kicker',scene.kind==='grade'?'학교 성적 통지표':'인생의 전환점'));
  card.append(el('h2','life-cinematic-title',scene.title));
  if(scene.detail)card.append(el('p','life-cinematic-description',scene.detail));
  if(scene.kind==='grade'){
   const row=el('div','life-cinematic-grade');
   row.append(el('span','',scene.before),el('span','life-cinematic-arrow','→'),el('strong','',scene.after));
   card.append(row);
   if(scene.changes)card.append(el('p','life-cinematic-changes',scene.changes));
   card.append(el('small','life-cinematic-disclaimer','게임 내 성적 · 공식 성적이 아님'));
  }
  body.append(card);cinematic.hidden=false;
  cinematicTimer=global.setTimeout(hideCinematic,reduceMotion?850:2200);
 }
 function hideCinematic(){
  if(cinematicTimer!==null){global.clearTimeout(cinematicTimer);cinematicTimer=null;}
  cinematic.hidden=true;cinematicShown=false;nextCinematic();
 }
 function clearCinematics(){
  cinematics.length=0;
  if(cinematicTimer!==null){global.clearTimeout(cinematicTimer);cinematicTimer=null;}
  cinematicShown=false;cinematic.hidden=true;
 }
 function queueCinematic(scene){if(verificationMode||!scene)return;cinematics.push(scene);nextCinematic();}
 function onChange(s){
  const before=snapshot?.persona||persona,choice=snapshot?.choice;
  const added=s.persona.history.slice(before.history?.length||0);
  snapshot=s;persona=s.persona;render();
  if(s.runtime.contentId!==global.GukminDirector.contentId)return;
  if(choice?.presentation?.type==='exam'&&s.reviewPending){
   const id=choice.presentation.category==='mock'?'exam':'schoolScore',phase=global.GukminPlayer.phaseOf(before);
   const old=global.GukminGrades.report(id,before.stats[id],phase).display;
   const next=global.GukminGrades.report(id,s.persona.stats[id],phase).display;
   const names={study:'학업',stress:'스트레스',health:'건강'};
   const changes=Object.entries(names).map(([key,label])=>{
    const delta=(s.persona.stats[key]??0)-(before.stats[key]??0);
    return delta?label+' '+(delta>0?'+':'')+delta:'';
   }).filter(Boolean).join(' · ');
   queueCinematic({kind:'grade',title:choice.presentation.term||choice.title,
    detail:choice.presentation.category==='mock'?'모의고사 결과':'내신 평가 결과',
    before:old,after:next,changes});
  }
  if(choice?.presentation?.type==='school'&&s.reviewPending){
   const school=global.GukminPlayer.schoolsOf(s.persona).find(item=>item.kind==='high'&&item.status==='enrolled');
   queueCinematic({title:'고등학교 입학',detail:school?.name||'새로운 학교생활이 시작됐다.'});
  }
  const events={
   'infant:school-entry':'초등학교 입학',
   'elementary:middle-entry':'초등학교 졸업 · 중학교 입학',
   'high:graduation':'고등학교 졸업'
  };
  for(const item of added)if(events[item.source])
   queueCinematic({title:events[item.source],detail:item.detail});
 }
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
  if(!snapshot.reviewPending)engine.run();
 }
 function startDemo(){
  clearCinematics();clearMajor();
  connect(global.GukminSystemDemo.config(),true);
  engine.advance(0);
 }
 function renderProgress(){
  if(disposed)return;
  const active=!!engine,choice=snapshot?.choice,p=snapshot?.progress;
  const reviewing=!!snapshot?.reviewPending;
  const demo=snapshot?.runtime.contentId===global.GukminSystemDemo.contentId;
  $('startSystemDemo').hidden=!verificationMode||demo;
  $('advanceTurn').hidden=!verificationMode||!demo;
  $('advanceTurn').disabled=!!p?.waiting;
  text('turnLabel',demo?snapshot.runtime.turn+'턴 · 검증용 시간':'실제 생애 시연');
  $('action').hidden=!choice&&!reviewing;
  $('lifeSheet')?.classList.toggle('has-current-choice',!!choice||reviewing);
  text('currentTitle',reviewing?'':choice?.title||'');
  const showCountdown=!reviewing&&!choice&&Number.isFinite(p?.remaining)&&p.remaining>0;
  $('choiceTiming').hidden=!showCountdown;
  text('nextChoiceLabel',showCountdown?p.remaining+'턴 남음':reviewing?'다음 이야기로 진행':p?.waiting?'선택을 기다리는 중':demo?'예정된 선택 없음':'이야기 준비 중');
  $('nextChoiceProgress').value=showCountdown?p.value||0:0;
  const current=$('currentChoice');current.replaceChildren();
  if($('action'))$('action').scrollTop=0;
  if(presentedToken!==choice?.token)clearMajor();
  if(reviewing){
   const last=persona.history.at(-1);
   current.append(el('p','review-kicker','선택 완료'));
   current.append(el('strong','review-title',last?.title||'지난 선택이 기록되었다'));
   if(last?.detail)current.append(el('p','review-detail',last.detail));
   const next=el('button','continue-story','다음으로  →');
   next.type='button';next.addEventListener('click',safely(()=>engine.run()));
   current.append(next);
   return;
  }
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
  const situation=el('section','daily-scenario');
  situation.append(el('span','daily-scenario-kicker','지금 상황'),el('strong','daily-scenario-title',choice.title));
  if(choice.body)situation.append(el('p','daily-choice-story',choice.body));
  current.append(situation,el('p','daily-choice-prompt','어떻게 할까?'));
  const choices=el('div','inline-choices');
  choices.setAttribute('role','group');choices.setAttribute('aria-label','일상 선택지');
  const owner=engine;
  const labels={health:'건강',stress:'스트레스',money:'재산',allowance:'용돈',study:'학업',schoolScore:'내신',exam:'모의고사',relations:'관계'};
  for(const [index,option] of choice.options.entries()){
   const button=el('button','inline-choice');button.type='button';button.disabled=!option.available;
   const number=el('span','daily-choice-number',String(index+1).padStart(2,'0'));
   const textWrap=el('span','daily-choice-copy');
   textWrap.append(el('strong','daily-choice-title',option.label));
   // Outcome narration is shown after the choice, not before it.
   if(option.available===false){
    const needed=option.when?.stats?.money?.gte,held=persona.stats.money;
    textWrap.append(el('small','daily-choice-locked',
     Number.isFinite(needed)&&Number.isFinite(held)
      ?'재산 부족 · '+held.toLocaleString('ko-KR')+'원 / '+needed.toLocaleString('ko-KR')+'원 필요'
      :'현재 조건에서는 선택할 수 없음'));
   }
   const indicators=el('span','daily-choice-effects');
   for(const [id,amount] of Object.entries(option.result?.effects?.stats||{})){
    if(!Number.isFinite(amount)||amount===0)continue;
    const positive=id==='stress'?amount<0:amount>0;
    const def=global.GukminPlayer.metricDefinition(id);
    indicators.append(global.GukminStatus.pill(
     (labels[id]||id)+' '+(amount>0?'+':'')+amount+(id==='allowance'||id==='money'?'원':''),
     def.icon||'sparkle','daily-choice-effect metric-'+id+' '+(positive?'is-positive':'is-negative')
    ));
   }
   if(indicators.childElementCount)textWrap.append(indicators);
   button.append(number,textWrap,el('span','daily-choice-chevron','›'));
   button.addEventListener('click',safely(()=>engine===owner?owner.resolve(choice.token,option.id):false));
   choices.append(button);
  }
  current.append(choices);
 }
 if(persona.simulation?.contentId===global.GukminSystemDemo.contentId)connect(global.GukminSystemDemo.config());
 else if(content){connect(content);engine.advance(0);}
 else connectLife();
 refreshMounted=renderProgress;resetMajorPresentation=clearMajor;

 const subscriptions=[
  [sheetGrip,'click',()=>{
    if(!mobileSheet.matches||Date.now()-lastSheetDrag<350)return;
    setSheetLevel((sheetLevel+1)%3);
  }],
  ...[sheetGrip,sheetHead].flatMap(node=>[
   [node,'pointerdown',beginSheetDrag],
   [node,'pointermove',moveSheetDrag],
   [node,'pointerup',finishSheetDrag],
   [node,'pointercancel',e=>finishSheetDrag(e,true)]
  ]),
  [$('lifeCinematicDismiss'),'click',hideCinematic],
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
 function dispose(){if(disposed)return;disposed=true;clearCinematics();clearMajor();refreshMounted=null;resetMajorPresentation=null;mountedSession=null;for(const [node,event,handler] of subscriptions)node.removeEventListener(event,handler);}
 mountedSession=Object.freeze({
  snapshot:()=>requireEngine().snapshot(),advance:turns=>requireEngine().advance(turns),
  resolve:(token,id)=>requireEngine().resolve(token,id),run:()=>requireEngine().run?.(),apply:(id,result)=>requireEngine().apply(id,result),dispose
 });
 render();
 return dispose;
}
global.GukminGame=Object.freeze({mount,posterData,registerMajorPresenter,get session(){return mountedSession;}});
})(window);
