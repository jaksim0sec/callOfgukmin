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

function createLifeSheetController(sheet, mobileSheet) {
 const grip=sheet.querySelector('#sheetToggle'),head=sheet.querySelector('.sheet-head');
 const labels=['인생 기록 중간까지 펼치기','인생 기록 전체 펼치기','인생 기록 최소화'];
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let level=0,drag=null,dragFrame=0,springFrame=0,lastDragAt=-Infinity;
 function snapHeights(){
  const css=getComputedStyle(sheet),vh=innerHeight;
  const rem=parseFloat(getComputedStyle(document.documentElement).fontSize);
  const ratio=(name,otherwise)=>Number.parseFloat(css.getPropertyValue(name))||otherwise;
  return [
   Math.min(12*rem,Math.max(8.5*rem,vh*ratio('--sheet-min-ratio',.2))),
   vh*ratio('--sheet-mid-ratio',.55),
   Math.min(vh*ratio('--sheet-max-ratio',.9),vh-rem)
  ];
 }
 function setLevel(next){
  level=next;
  sheet.classList.toggle('is-minimized',level===0);
  sheet.classList.toggle('is-middle',level===1);
  sheet.classList.toggle('is-expanded',level===2);
  grip.setAttribute('aria-expanded',String(level!==0));
  grip.setAttribute('aria-label',labels[level]);
 }
 function cancelSpring(){
  if(springFrame)cancelAnimationFrame(springFrame);
  springFrame=0;
  sheet.classList.remove('is-springing');
  sheet.style.removeProperty('--sheet-motion-height');
 }
 function springTo(next,velocity=0,startHeight=sheet.getBoundingClientRect().height){
  cancelSpring();
  const heights=snapHeights(),target=heights[next];
  setLevel(next);
  if(!mobileSheet.matches||reducedMotion.matches||Math.abs(startHeight-target)<.5)return;
  let x=startHeight,sv=-Math.sign(velocity)*Math.sqrt(Math.abs(velocity))*.1;
  const stiffness=.035,damping=.8;
  sheet.classList.add('is-springing');
  sheet.style.setProperty('--sheet-motion-height',x+'px');
  function animate(){
   const distance=target-x;
   const force=Math.max(-25,Math.min(25,distance*stiffness));
   sv=(sv+force)*damping;
   x+=sv;
   sheet.style.setProperty('--sheet-motion-height',x+'px');
   if(Math.abs(target-x)<.5&&Math.abs(sv)<.5){
    springFrame=0;
    sheet.classList.remove('is-springing');
    sheet.style.removeProperty('--sheet-motion-height');
   }else springFrame=requestAnimationFrame(animate);
  }
  springFrame=requestAnimationFrame(animate);
 }
 function chooseLevel(start,currentHeight,velocity,totalDelta){
  const heights=snapHeights(),projected=Math.max(heights[0],Math.min(heights[2],
   currentHeight-Math.max(-2,Math.min(2,velocity))*220));
  if(start===0)return velocity<-.55||projected>(heights[0]+heights[1])/2?1:0;
  if(start===1){
   if(velocity<-.55||projected>(heights[1]+heights[2])/2)return 2;
   if(velocity>.55||projected<(heights[0]+heights[1])/2)return 0;
   return 1;
  }
  // Source close() maps to minimum; a strong downward gesture can skip middle.
  if(totalDelta>240||(velocity>1.15&&projected<(heights[0]+heights[1])/2))return 0;
  return velocity>.55||projected<(heights[1]+heights[2])/2?1:2;
 }
 function paintDrag(){
  dragFrame=0;
  if(drag)sheet.style.setProperty('--sheet-drag-height',drag.startHeight-drag.delta+'px');
 }
 function startDrag(e){
  if(!mobileSheet.matches||!e.isPrimary||e.button!==0||drag)return;
  if(e.target.closest('button:not(#sheetToggle),a,input,select,textarea'))return;
  const height=sheet.getBoundingClientRect().height;
  cancelSpring();
  const now=performance.now();
  drag={id:e.pointerId,owner:e.currentTarget,startY:e.clientY,startHeight:height,
   startLevel:level,delta:0,lastY:e.clientY,lastT:now,velocity:0,moved:false};
  sheet.classList.add('is-dragging');
  sheet.style.setProperty('--sheet-drag-height',height+'px');
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function onDrag(e){
  if(!drag||e.pointerId!==drag.id)return;
  const now=performance.now(),dt=Math.max(now-drag.lastT,1);
  drag.velocity=(e.clientY-drag.lastY)/dt;
  drag.lastY=e.clientY;drag.lastT=now;
  drag.delta=e.clientY-drag.startY;
  if(Math.abs(drag.delta)>=8)drag.moved=true;
  if(drag.moved){
   if(!dragFrame)dragFrame=requestAnimationFrame(paintDrag);
   if(e.cancelable)e.preventDefault();
  }
 }
 function endDrag(e,cancelled=false){
  if(!drag||e.pointerId!==drag.id)return;
  const ended=drag;
  if(dragFrame)cancelAnimationFrame(dragFrame);
  dragFrame=0;
  drag=null;
  sheet.classList.remove('is-dragging');
  sheet.style.removeProperty('--sheet-drag-height');
  const delta=e.clientY-ended.startY;
  const currentHeight=ended.startHeight-delta;
  const velocity=performance.now()-ended.lastT>90?0:ended.velocity;
  if(ended.moved)lastDragAt=performance.now();
  const next=!cancelled&&ended.moved?chooseLevel(ended.startLevel,currentHeight,velocity,delta):ended.startLevel;
  springTo(next,cancelled?0:velocity,ended.moved?currentHeight:ended.startHeight);
  if(ended.owner.hasPointerCapture(e.pointerId))ended.owner.releasePointerCapture(e.pointerId);
 }
 function tapGrip(){
  if(!mobileSheet.matches||performance.now()-lastDragAt<180)return;
  springTo((level+1)%3);
 }
 function cancelDrag(e){endDrag(e,true);}
 for(const target of [grip,head]){
  target.addEventListener('pointerdown',startDrag);
  target.addEventListener('pointermove',onDrag);
  target.addEventListener('pointerup',endDrag);
  target.addEventListener('pointercancel',cancelDrag);
 }
 grip.addEventListener('click',tapGrip);
 setLevel(0);
 function revealResults(){if(mobileSheet.matches&&!drag)springTo(Math.max(1,level));}
  function disposeLifeSheet(){
  if(dragFrame)cancelAnimationFrame(dragFrame);
  dragFrame=0;
  if(drag?.owner.hasPointerCapture(drag.id))drag.owner.releasePointerCapture(drag.id);
  drag=null;
  sheet.classList.remove('is-dragging');
  sheet.style.removeProperty('--sheet-drag-height');
  cancelSpring();
  for(const target of [grip,head]){
   target.removeEventListener('pointerdown',startDrag);
   target.removeEventListener('pointermove',onDrag);
   target.removeEventListener('pointerup',endDrag);
   target.removeEventListener('pointercancel',cancelDrag);
  }
  grip.removeEventListener('click',tapGrip);
  }
  return {dispose:disposeLifeSheet,revealResults};
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
 const sheet=$('lifeSheet');
 const mobileSheet=global.matchMedia('(max-width: 47.5em)');

 const lifeSheet=createLifeSheetController(sheet,mobileSheet);
 let persona=global.GukminPlayer.ensure();
 let selection=-1,dialogOptions=[],dialogCommit=null,engine=null;
 let snapshot=null,presentedToken=null,disposeMajor=null,presentationEpoch=0;
 let dailyUI=null;
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
   const history=persona.history||[];
   const closed=Object.values(snapshot?.runtime?.choices||{}).filter(entry=>entry.status==='closed');
   const lastClosed=closed.at(-1);
   const outcomeByEnd=new Map(closed.filter(entry=>
    Number.isSafeInteger(entry.outcome?.historyFrom)&&
    entry.outcome.historyTo>=entry.outcome.historyFrom
   ).map(entry=>[entry.outcome.historyTo,entry]));
   let continued=false;
   function nextButton(host){
    if(continued)return;
    continued=true;
    const next=el('button','continue-story','다음 이야기 보기 →');
    next.type='button';next.addEventListener('click',safely(()=>engine.run()));
    host.append(next);
   }
   for(let i=history.length-1;i>=0;i--){
    const group=outcomeByEnd.get(i);
    if(group){
     const result=group.outcome;
     const entries=history.slice(result.historyFrom,result.historyTo+1).filter(item=>item.display!=='hidden');
     const article=el('article','record record-choice');
     const said=el('div','record-player-message');
     said.append(el('small','','내 선택'),global.GukminMarkup.render(el('strong',''),result.label||''));
     article.append(said);
     const bubble=el('div','record-result-message');
     bubble.append(el('small','','선택 이후 · 소식'));
     for(const item of entries){
      const line=el('div','record-top');
      line.append(el('span','record-age','#'+item.age+'살'+(item.turn!==undefined?' · '+item.turn+'턴':'')),
       el('strong','',item.title));
      bubble.append(line);
      if(item.detail)bubble.append(global.GukminMarkup.render(el('p',''),item.detail));
     }
     const impacts=dailyUI.changesFor(result);
     if(impacts.length){
      const tray=el('div','record-impacts');
      for(const [position,impact] of impacts.entries()){
       const chip=global.GukminStatus.pill(impact.text,impact.icon,
        'daily-result-chip impact-'+impact.tone+(impact.id?' metric-'+impact.id:''));
       if(snapshot?.reviewPending&&group===lastClosed)
        chip.style.animationDelay=Math.min(position,6)*.07+'s';
       else chip.classList.add('is-static');
       tray.append(chip);
      }
      bubble.append(tray);
     }
     if(snapshot?.reviewPending&&group===lastClosed)nextButton(bubble);
     article.append(bubble);log.append(article);
     i=result.historyFrom;
     continue;
    }
    const item=history[i];
    if(item.display==='hidden')continue;
    const article=el('article','record'),line=el('div','record-top');
    line.append(el('span','record-age','#'+item.age+'살'+(item.turn!==undefined?' · '+item.turn+'턴':'')),el('strong','',item.title));
    article.dataset.importance=item.importance||'normal';
    const description=el('p','');
    global.GukminMarkup.render(description,item.detail);
    article.append(line,description);
    if(snapshot?.reviewPending&&!lastClosed?.outcome&&item.source==='choice:'+lastClosed?.choiceId){
     const impacts=dailyUI.changesFor();
     if(impacts.length){
      const tray=el('div','record-impacts');
      for(const impact of impacts)tray.append(global.GukminStatus.pill(impact.text,impact.icon,
       'daily-result-chip impact-'+impact.tone+(impact.id?' metric-'+impact.id:'')));
      article.append(tray);
     }
     nextButton(article);
    }
    log.append(article);
   }
   if(snapshot?.reviewPending&&!continued){
    const banner=el('div','record-review-fallback');
    banner.append(el('strong','','선택 결과를 확인했어'));
    nextButton(banner);log.prepend(banner);
   }
   
  renderProgress();
 }
 function clearMajor(){presentationEpoch++;const dispose=disposeMajor;disposeMajor=null;presentedToken=null;dispose?.();}
 function reset(){
  if(!global.confirm('현재 인물 정보를 초기화하고 다시 생성할까?'))return;
  const fresh=global.GukminPlayer.generate();
  if(!global.GukminPlayer.save(fresh))throw new Error('저장 실패');
  clearCinematics();clearMajor();dailyUI.reset();persona=fresh;engine=null;snapshot=null;connectLife();render();
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
 dailyUI=global.GukminDailyChoice.create({
  dialog:$('dailyChoiceDialog'),body:$('dailyChoiceBody'),heading:$('dailyModalHeading'),
  collapseButton:$('dailyModalCollapse'),resumeButton:$('resumeDailyChoice'),
  resolve:(token,id)=>safely(()=>engine.resolve(token,id))(),
  proceed:()=>safely(()=>engine.run())()
 });
 const cinematics=[],cinematic=$('lifeCinematic');
 let cinematicTimer=null,cinematicShown=false,currentCinematic=null;
 const reduceMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function nextCinematic(){
  if(disposed||cinematicShown||!cinematics.length)return;
  const scene=cinematics.shift();
  currentCinematic=scene;
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
  $('lifeCinematicDismiss').textContent=scene.kind==='grade'?'결과 확인하고 계속하기 →':'계속하기 →';
  if(scene.kind!=='grade')cinematicTimer=global.setTimeout(hideCinematic,reduceMotion?850:2200);
 }
 function hideCinematic(){
  if(cinematicTimer!==null){global.clearTimeout(cinematicTimer);cinematicTimer=null;}
  const completed=currentCinematic;
  currentCinematic=null;cinematic.hidden=true;cinematicShown=false;
  if(completed?.kind==='grade'&&snapshot?.reviewPending)engine.run();
  nextCinematic();
 }
 function clearCinematics(){
  cinematics.length=0;
  if(cinematicTimer!==null){global.clearTimeout(cinematicTimer);cinematicTimer=null;}
  cinematicShown=false;currentCinematic=null;cinematic.hidden=true;
 }
 function queueCinematic(scene){if(verificationMode||!scene)return;cinematics.push(scene);nextCinematic();}
 function onChange(s){
  const before=snapshot?.persona||persona,choice=snapshot?.choice;
  const added=s.persona.history.slice(before.history?.length||0);
  dailyUI.capture(before,s.persona,choice,s.reviewPending);
  snapshot=s;persona=s.persona;render();
   if(s.reviewPending&&dailyUI.isReview()){
    lifeSheet.revealResults();$('sheetContent').scrollTop=0;
    dailyUI.highlight(root);
   }
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
  dailyUI.restore(snapshot);
   if(snapshot.reviewPending)lifeSheet.revealResults();
   else engine.run();
 }
 function startDemo(){
  dailyUI.reset();clearCinematics();clearMajor();
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
  $('action').hidden=!choice;
  $('lifeSheet')?.classList.toggle('has-current-choice',!!choice||reviewing);
  text('currentTitle',reviewing?'':choice?.title||'');
  const showCountdown=!reviewing&&!choice&&Number.isFinite(p?.remaining)&&p.remaining>0;
  $('choiceTiming').hidden=!showCountdown;
  text('nextChoiceLabel',showCountdown?p.remaining+'턴 남음':reviewing?'다음 이야기로 진행':p?.waiting?'선택을 기다리는 중':demo?'예정된 선택 없음':'이야기 준비 중');
  $('nextChoiceProgress').value=showCountdown?p.value||0:0;
  const current=$('currentChoice');current.replaceChildren();
  if($('action'))$('action').scrollTop=0;
  if(presentedToken!==choice?.token)clearMajor();
  if(reviewing)return;
  if(!choice){dailyUI.reset();return;}
  if(choice.layer==='한방 선택'){
   dailyUI.reset();
   current.append(el('p','fine','한방 선택 응답 대기'));
   if(majorPresenter&&presentedToken!==choice.token){
    presentedToken=choice.token;
    const owner=engine,epoch=presentationEpoch;
    const dispose=majorPresenter({choice,root,resolve:optionId=>{if(disposed||engine!==owner||epoch!==presentationEpoch)return false;return safely(()=>owner.resolve(choice.token,optionId))();}});
    if(typeof dispose==='function'){if(!disposed&&epoch===presentationEpoch&&snapshot?.choice?.token===choice.token)disposeMajor=dispose;else dispose();}
   }
   return;
  }
  dailyUI.showChoice(choice,current,persona);

 }
 if(persona.simulation?.contentId===global.GukminSystemDemo.contentId)connect(global.GukminSystemDemo.config());
 else if(content){connect(content);engine.advance(0);}
 else connectLife();
 refreshMounted=renderProgress;resetMajorPresentation=clearMajor;

 const subscriptions=[
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
 function dispose(){if(disposed)return;disposed=true;dailyUI.dispose();lifeSheet.dispose();clearCinematics();clearMajor();refreshMounted=null;resetMajorPresentation=null;mountedSession=null;for(const [node,event,handler] of subscriptions)node.removeEventListener(event,handler);}
 mountedSession=Object.freeze({
  snapshot:()=>requireEngine().snapshot(),advance:turns=>requireEngine().advance(turns),
  resolve:(token,id)=>requireEngine().resolve(token,id),run:()=>requireEngine().run?.(),apply:(id,result)=>requireEngine().apply(id,result),dispose
 });
 render();
 return dispose;
}
global.GukminGame=Object.freeze({mount,posterData,registerMajorPresenter,get session(){return mountedSession;}});
})(window);
