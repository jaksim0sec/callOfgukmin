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
 if(persona.attributes?.admissionAttempts>1)return (persona.attributes.admissionAttempts===2?'재수':persona.attributes.admissionAttempts===3?'삼수':'N수생')+' · 입시'+persona.attributes.admissionAttempts+'회차';
 const age=persona.age,phase=global.GukminPlayer.phaseOf(persona);
 if(phase==='elementary')return '초등학교 '+Math.max(1,age-6)+'학년';
 if(phase==='middle')return '중학교 '+Math.max(1,age-12)+'학년';
 if(phase==='high'&&age<=18)return '고등학교 '+Math.max(1,age-15)+'학년';
 return global.GukminPlayer.phaseDefinition(phase).label;
}
function headlineFor(persona){
 if(persona.attributes?.admissionAttempts>1)return lifeTitle(persona);
 const phase=global.GukminPlayer.phaseOf(persona);
 const school=global.GukminPlayer.schoolsOf(persona).find(record=>
  record.kind===phase&&['enrolled','active','attending'].includes(record.status));
 const stages={elementary:{label:'초등학교',offset:6,years:6},middle:{label:'중학교',offset:12,years:3},high:{label:'고등학교',offset:15,years:3}};
 const stage=stages[phase];
 if(school&&stage)return stage.label+' '+Math.max(1,Math.min(stage.years,Math.floor(persona.age-stage.offset)))+'학년';
 return persona.age+'살';
}
function posterData(persona){
 const phase=global.GukminPlayer.phaseOf(persona);
 const phrases={infant:'세상이 궁금한 아이',elementary:'꿈을 키우는\n초등학생',middle:'가능성을 찾는\n중학생',high:'내 길을 고르는\n고등학생'};
 return {
  color:persona.partyColor,partyName:persona.party,partyIcon:persona.partyIcon,
  phrase:persona.attributes?.admissionAttempts>1?(persona.attributes?.retryEndReason?'다음 장을\n기다리는 청춘':'다음 기회를\n준비하는 N수생'):persona.job==='고교 졸업'?'다음 장을\n기다리는 청춘':phrases[phase]||'다음 선택은 나의 몫',stage:persona.job,name:persona.name,number:persona.number,
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
 const sheet=$('lifeSheet');
 const mobileSheet=global.matchMedia('(max-width: 47.5em)');

 // The compact snap fits its controls rather than a fixed fraction of the viewport.
 function collapsedSheetHeight({rem}){
  const visible=[$('sheetToggle'),sheet.querySelector('.sheet-head'),$('choiceTiming'),$('systemTools'),$('systemError')];
  const controls=visible.reduce((sum,node)=>sum+(node?.getBoundingClientRect().height||0),0);
  const safeBottom=Number.parseFloat(getComputedStyle(sheet).paddingBottom)||0;
  const height=Math.ceil(Math.max(6*rem,controls+safeBottom+rem*.375));
  root.querySelector('.game').style.setProperty('--life-sheet-peek-height',height+'px');
  return height;
 }
 // Anchor the middle snap to the fixed poster row, independent of stat content or page scroll.
 function middleSheetHeight({viewportHeight,rem}){
  const boundary=root.querySelector('.status').getBoundingClientRect().bottom+(global.scrollY||0)+rem*.5;
  return Math.min(viewportHeight-rem,Math.max(viewportHeight-boundary,collapsedSheetHeight({rem})+rem*3.25));
 }
 const snapSheet=global.GukminSheet.create({
  element:sheet,handle:$('sheetToggle'),dragTargets:[$('sheetToggle'),sheet.querySelector('.sheet-head')],
  enabled:()=>mobileSheet.matches,initial:0,dismissible:false,
  steps:[{name:'minimized',height:collapsedSheetHeight},
   {name:'middle',height:middleSheetHeight},{name:'expanded',ratio:.9,topGapRem:1}]
 });
 const lifeSheet={...snapSheet,revealResults:()=>snapSheet.revealAtLeast(1)};
 let persona=global.GukminPlayer.ensure();
 let selection=-1,dialogOptions=[],dialogCommit=null,engine=null;
 let snapshot=null,presentedToken=null,disposeMajor=null,presentationEpoch=0;
 let dailyUI=null;
 let renderedHistory=null;
 let journeyTimer=null,journeyActive=false,newsTimer=null;
 const prefersLessMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const verificationMode=new URLSearchParams(global.location.search).has('systems');
 $('systemTools').hidden=!verificationMode;
 function text(id,value){const target=$(id);if(target)target.textContent=String(value??'');}
 function render(){
  global.GukminStatus.render(root,persona);
  renderStore();
  const headline=$('lifeHeadline'),label=headlineFor(persona);
  if(headline.textContent!==label){
   headline.textContent=label;
   headline.getAnimations().forEach(animation=>animation.cancel());
   if(!global.matchMedia('(prefers-reduced-motion: reduce)').matches&&headline.animate){
    headline.animate([{opacity:.55,transform:'translateY(.15rem)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});
   }
  }
  text('chapter',snapshot?.runtime.contentId===global.GukminSystemDemo.contentId
    ? '검증 · '+snapshot.runtime.turn+'턴' : lifeTitle(persona));
  $('chapter').parentElement.hidden=$('chapter').textContent===label;
  const host=$('playerPosterMount'),data=posterData(persona);
  if(!host.firstElementChild)host.append(global.GukminPoster.create(data));
  else global.GukminPoster.update(host.firstElementChild,data);
  document.documentElement.style.setProperty('--party',persona.partyColor||'#677181');
  const historyKey=JSON.stringify([persona.history,snapshot?.reviewPending,snapshot?.runtime?.contentId]);
  if(historyKey===renderedHistory){renderProgress();return;}
  renderedHistory=historyKey;
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
    next.type='button';next.addEventListener('click',safely(startJourney));
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
       const chip=impact.id&&Number.isFinite(impact.amount)
        ?global.GukminStatus.metricImpact(impact.id,impact.amount,'daily-result-chip')
        :global.GukminStatus.createToken({type:'context',label:impact.text,icon:impact.icon,
         classes:'daily-result-chip impact-'+impact.tone});
       if(impact.color)chip.style.setProperty('--trait-color',impact.color);
       if(snapshot?.reviewPending&&group===lastClosed)
        chip.style.animationDelay=Math.min(position,6)*.07+'s';
       else chip.classList.add('is-static');
       tray.append(chip);
      }
      bubble.append(tray);
     }
     if(snapshot?.reviewPending&&group===lastClosed&&group.layer==='한방 선택')nextButton(bubble);
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
      for(const impact of impacts)tray.append(impact.id&&Number.isFinite(impact.amount)
       ?global.GukminStatus.metricImpact(impact.id,impact.amount,'daily-result-chip')
       :global.GukminStatus.createToken({type:'context',label:impact.text,icon:impact.icon,
        classes:'daily-result-chip impact-'+impact.tone}));
      article.append(tray);
     }
     if(lastClosed?.layer==='한방 선택')nextButton(article);
    }
    log.append(article);
   }
   if(snapshot?.reviewPending&&!continued&&lastClosed?.layer!=='일상 선택'){
    const banner=el('div','record-review-fallback');
    banner.append(el('strong','','선택 결과를 확인했어'));
    nextButton(banner);log.prepend(banner);
   }
   if(!snapshot?.reviewPending&&!snapshot?.choice&&(persona.attributes?.lifeEndReason||persona.attributes?.retryEndReason||['college','employment'].includes(persona.attributes?.admissionDestination)||['high:graduation','admission:retry-graduation'].some(id=>snapshot?.runtime?.events?.[id]?.status==='completed'))){
    const complete=el('section','life-chapter-complete');
    complete.append(el('small','','학생 시절 · 기록 완료'),el('h2','',persona.attributes?.lifeEndReason?'이번 삶은 여기까지':'다음 장을 기다리는 삶'),
     el('p','',(persona.attributes?.lifeEndReason?persona.attributes.lifeEndReason+'에 도달해 삶이 끝났습니다. ':persona.attributes?.retryEndReason?persona.attributes.retryEndReason+'으로 N수 준비를 마쳤습니다. ':'')+(persona.attributes?.lifeEndReason?'선택 기록은 그대로 보관됩니다. 새로운 인물로 다시 시작할 수 있습니다.':'현재 공개된 이야기는 여기까지입니다. 선택 기록은 그대로 보관됩니다. 다른 선택으로 새로운 삶을 시작할 수도 있습니다.')));
    const replay=el('button','continue-story','새 인물로 다시 시작');replay.type='button';
    replay.addEventListener('click',safely(reset));complete.append(replay);log.prepend(complete);
   }
   
  renderProgress();
 }
 function clearMajor(){presentationEpoch++;const dispose=disposeMajor;disposeMajor=null;presentedToken=null;dispose?.();}
 function reset(){
  if(!global.confirm('현재 인물 정보를 초기화하고 다시 생성할까?'))return;
  const fresh=global.GukminPlayer.generate();
  if(!global.GukminPlayer.save(fresh))throw new Error('저장 실패');
  stopJourney();clearCinematics();clearMajor();dailyUI.reset();persona=fresh;engine=null;snapshot=null;connectLife();render();
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
    (item.tags||[]).forEach(t=>tags.append(global.GukminStatus.createToken({
     type:'context',label:t,icon:'sparkle',classes:'school-choice-tag'
    })));
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
 function renderStore(){
  const warning=$('stressWarning'),open=$('openConvenienceStore'),dialog=$('convenienceStore');
  const stress=persona.stats.stress||0,ended=persona.attributes?.admissionDestination==='finished';
  warning.hidden=stress<20||ended;
  warning.textContent=(stress>=23?'위험':'경고')+' · 정신병 '+stress+'/25. 한계에 가까워지고 있습니다. 잠시 쉬어 가세요.';
  warning.classList.toggle('is-critical',stress>=23);
  open.hidden=persona.age<7||!engine?.storeStatus||ended;
  if(!dialog.open)return;
  const status=engine.storeStatus();
  text('storeBalance','재산 '+persona.stats.money.toLocaleString('ko-KR')+'원 · 정신병 '+stress+'/25');
  text('storeNotice',status.remaining?'다시 이용하려면 '+status.remaining+'턴이 필요합니다.':status.blocked?'현재는 이용할 수 없습니다.':'상품을 이용하면 4턴 뒤 다시 구매할 수 있습니다.');
  const list=$('storeItems');list.replaceChildren();
  for(const item of status.items){
   const button=el('button','store-item');button.type='button';button.disabled=!item.available;
   button.append(el('strong','',item.name),el('span','',item.price.toLocaleString('ko-KR')+'원 · 정신병 −'+item.relief));
   button.addEventListener('click',safely(()=>{if(engine.buy(item.id)){$('convenienceStore').close();}}));list.append(button);
  }
 }
 function openStore(){
  if(!engine?.storeStatus)return;
  dailyUI.suspend();$('convenienceStore').showModal();renderStore();
 }
 function safely(fn){
  return (...args)=>{if(disposed)return false;try{$('systemError').hidden=true;return fn(...args);}catch(error){
   text('systemError',error.message);$('systemError').hidden=false;console.error(error);
  }};
 }
 dailyUI=global.GukminDailyChoice.create({
  dialog:$('dailyChoiceDialog'),body:$('dailyChoiceBody'),heading:$('dailyModalHeading'),
  resumeButton:$('resumeDailyChoice'),
  resolve:(token,id)=>safely(()=>engine.resolve(token,id))(),
  proceed:()=>safely(startJourney)()
 });
 const cinematics=[],cinematic=$('lifeCinematic');
 let cinematicTimer=null,cinematicShown=false,currentCinematic=null,electionTicker=null,examBreakTimer=null;
 cinematic.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();$('lifeCinematicDismiss').focus();}});
 const reduceMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function nextCinematic(){
  if(disposed||cinematicShown||!cinematics.length)return;
  const scene=cinematics.shift();
  currentCinematic=scene;
  cinematicShown=true;
  const body=$('lifeCinematicBody');body.replaceChildren();
  const card=el('section','life-cinematic-card'+(scene.kind==='grade'?' is-grade':''));
  card.classList.toggle('is-sealed',!!scene.sealed);
  card.append(el('span','life-cinematic-kicker',scene.kind==='grade'?'학교 성적 통지표':scene.kind==='election'?'교실 개표 현황':scene.kind==='admission'?'입학 전형 결과':'인생의 전환점'));
  card.append(el('h2','life-cinematic-title',scene.title));
  if(scene.kind==='election')card.append(el('p','election-caption','우리 반의 한 표, 한 표가 모였다.'));
  if(scene.detail)card.append(el('p','life-cinematic-description',scene.detail));
  if(scene.kind==='grade'){
   const row=el('div','life-cinematic-grade');
   if(scene.before)row.append(el('span','',scene.before),el('span','life-cinematic-arrow','→'));
   const grade=el('strong','',scene.after);grade.style.color=global.GukminGrades.color(scene.grade||scene.after);row.append(grade);
   card.append(row);
   if(scene.changes)card.append(el('p','life-cinematic-changes',scene.changes));
   if(scene.assessment){const applied=global.GukminGrades.assessment(scene.person,scene.assessment);if(applied.applied.length){card.append(el('small','','이번 평가에 적용됨'));for(const source of applied.applied){const line=el('div','assessment-source');line.append(global.GukminStatus.traitToken(source.trait),el('span','',source.text));card.append(line);}}}
   card.append(el('small','life-cinematic-disclaimer','게임 내 성적 · 공식 성적이 아님'));
  }
  if(scene.kind==='election'){
   card.classList.add('is-election');
   const names=global.GukminData.names.filter(n=>n!==persona.name),candidates=[persona.name,...new Set(names)].slice(0,3),votes=scene.won?[16,8,4]:[8,16,4];
   const box=el('div','election-ballot-box','투표함'),rows=[];card.append(box);
   candidates.forEach((name,i)=>{const row=el('div','election-candidate'+(i===0?' is-player':''));const tally=el('strong','election-tally');row.append(el('span','',name),tally);card.append(row);rows.push(tally);});
   const result=el('p','election-result');card.append(result);
   const start=performance.now();
   scene.finish=()=>{scene.finished=true;rows.forEach((node,i)=>node.textContent='正'.repeat(Math.floor(votes[i]/5))+(votes[i]%5?'一丨三四'[votes[i]%5-1]:'')+ ' · '+votes[i]+'표');result.replaceChildren(el('small','',scene.won?'친구들이 내 이름을 불렀다.':'마지막 표까지 세었다.'),el('strong','',scene.won?'내가 뽑혔다.':candidates[1]+' 당선'),el('span','',scene.won?'우리 반의 반장이 되었다.':'이번에는 아쉽지만, 도전은 남았다.'));card.classList.add('is-counted');if(scene.won)card.classList.add('is-elected');$('lifeCinematicDismiss').textContent='결과 확인';if(electionTicker)global.clearInterval(electionTicker);electionTicker=null;};
   electionTicker=global.setInterval(()=>{const elapsed=performance.now()-start;const fraction=Math.min(1,Math.max(0,(elapsed-600)/4000));rows.forEach((node,i)=>{const count=Math.floor(votes[i]*fraction);node.textContent='正'.repeat(Math.floor(count/5))+(count%5?'一丨三四'[count%5-1]:'')+' · '+count+'표';});if(elapsed>=6000)scene.finish();},100);
   if(reduceMotion)scene.finish();
  }
  if(scene.kind==='admission'){card.classList.add('is-admission-result');const image=el('img','school-placeholder');image.src='assets/svg/school-placeholder.svg';image.alt='';card.prepend(image);}
  body.append(card);cinematic.hidden=false;document.body.classList.add('cinematic-open');
  $('lifeCinematicDismiss').textContent=scene.kind==='election'&&!scene.finished?'건너뛰기':scene.kind==='transition'?'시간이 흐른다…':'결과 확인하고 계속하기 →';
  $('lifeCinematicDismiss').focus({preventScroll:true});
  if(scene.kind==='transition')cinematicTimer=global.setTimeout(hideCinematic,reduceMotion?0:1200);
  else if(!['grade','election','admission'].includes(scene.kind))cinematicTimer=global.setTimeout(hideCinematic,reduceMotion?850:2200);
 }
 function hideCinematic(){
  if(currentCinematic?.kind==='election'&&!currentCinematic.finished){currentCinematic.finish();return;}
  if(cinematicTimer!==null){global.clearTimeout(cinematicTimer);cinematicTimer=null;}
  const completed=currentCinematic;
  currentCinematic=null;cinematic.hidden=true;cinematicShown=false;document.body.classList.remove('cinematic-open');
  if(completed&&['grade','election','admission'].includes(completed.kind))engine?.acknowledge?.();
  if(completed?.kind==='election'){dailyUI.restore(snapshot);dailyUI.openRestoredReward();}
  if(completed?.kind==='grade'&&completed.middleMid){
   stopJourney();const toast=$('lifeNewsToast');toast.replaceChildren(el('strong','','기말고사 준비 기간'));toast.hidden=false;
   examBreakTimer=global.setTimeout(()=>{examBreakTimer=null;toast.hidden=true;startJourney();},prefersLessMotion?350:1400);
   for(const button of $('log').querySelectorAll('.continue-story'))button.hidden=true;
   renderProgress();return;
  }
  nextCinematic();renderProgress();
  if(completed&&['grade','transition','admission'].includes(completed.kind)&&!dailyUI.isRewardVisible())startJourney();
 }
 function clearCinematics(){
  if(examBreakTimer!==null){global.clearTimeout(examBreakTimer);examBreakTimer=null;}
  cinematics.length=0;
  if(electionTicker)global.clearInterval(electionTicker);electionTicker=null;document.body.classList.remove('cinematic-open');
  if(cinematicTimer!==null){global.clearTimeout(cinematicTimer);cinematicTimer=null;}
  cinematicShown=false;currentCinematic=null;cinematic.hidden=true;
 }
 function queueCinematic(scene){if(verificationMode||!scene)return;cinematics.push(scene);nextCinematic();}
 function onChange(s){
  const wasReview=snapshot?.reviewPending,previousCinematic=snapshot?.runtime?.cinematic;
  const before=snapshot?.persona||persona,choice=snapshot?.choice;
  const added=s.persona.history.slice(before.history?.length||0);
  dailyUI.capture(before,s.persona,choice,s.reviewPending);
  snapshot=s;persona=s.persona;
  if(wasReview&&!s.reviewPending&&dailyUI.isRewardVisible())dailyUI.reset();
  // Establish the visible scene before rendering a newly opened native dialog.
  if(s.runtime.contentId===global.GukminDirector.contentId){
   if(choice?.presentation?.type==='exam'&&s.reviewPending){
    const id=choice.presentation.category==='mock'?'exam':'schoolScore',phase=global.GukminPlayer.phaseOf(before);
    const old=global.GukminGrades.report(id,before.stats[id],phase).display;
    const next=global.GukminGrades.report(id,s.persona.stats[id],phase).display;
    const names={[id]:id==='schoolScore'&&phase==='middle'?'교과 성취':global.GukminPlayer.metricDefinition(id).label,stress:global.GukminPlayer.metricDefinition('stress').label};
    const changes=Object.entries(names).map(([key,label])=>{
     const delta=(s.persona.stats[key]??0)-(before.stats[key]??0);
     return delta?label+' '+(delta>0?'+':'−')+Math.abs(delta).toLocaleString('ko-KR',{maximumFractionDigits:1}):'';
    }).filter(Boolean).join(' · ');
    queueCinematic({kind:'grade',title:choice.presentation.term||choice.title,
     detail:choice.presentation.category==='mock'?'모의고사 결과':'내신 평가 결과',
     before:old+' ('+before.stats[id]+')',after:next+' ('+s.persona.stats[id]+')',grade:next,changes,assessment:choice.options.find(o=>o.id===s.runtime.choices[choice.token]?.optionId)?.result.assessment,person:before,middleMid:choice.presentation.stage==='middle'&&choice.presentation.term.includes('중간')});
   }
   if(choice?.presentation?.type==='grade-seal'&&s.reviewPending){
    const key=choice.presentation.category==='mock'?'exam':'schoolScore';
    const grade=global.GukminGrades.report(key,s.persona.stats[key],'high').display;
    queueCinematic({kind:'grade',title:key==='exam'?'대학수학능력시험 성적표':'최종 내신 성적표',detail:key==='exam'?'대학수학능력시험 최종 결과':'고등학교 최종 내신 결과',
     after:(key==='exam'?'수능 성적 ':'최종 내신 ')+grade,grade,sealed:true});
   }
   if(choice?.presentation?.type==='election'&&s.reviewPending&&['elected','lost'].includes(s.persona.attributes?.classElection)){dailyUI.suspend();queueCinematic({kind:'election',title:'반장선거',won:s.persona.attributes?.classElection==='elected'});}
   if(s.runtime.cinematic&&!previousCinematic)queueCinematic(s.runtime.cinematic);
   if(choice?.presentation?.type==='school'&&s.reviewPending){
    const school=global.GukminPlayer.schoolsOf(s.persona).find(item=>item.kind==='high'&&item.status==='enrolled');
    queueCinematic({title:'고등학교 입학',detail:school?.name||'새로운 학교생활이 시작됐다.'});
   }
   const events={
    'infant:school-entry':'초등학교 입학',
    'elementary:middle-entry':'초등학교 졸업 · 중학교 입학',
    'high:graduation':'고등학교 졸업',
    'admission:repeat-year':'고등학교 졸업 · 재수 시작',
    'admission:retry-graduation':'입시 재도전 마무리'
   };
   for(const item of added)if(events[item.source])
    queueCinematic({title:events[item.source],detail:item.detail});
  }
  render();
  if(added.length){$('log')?.firstElementChild?.classList.add('record-arrived');
   if(journeyActive&&!cinematicShown){const news=added.filter(item=>item.display!=='hidden'&&!String(item.source||'').startsWith('choice:'));
    if(news.length)showJourneyNews(news.at(-1));}
  }
  if(s.reviewPending||choice?.layer==='일상 선택'){
   // The reward is shown in the original daily sheet; history remains permanent.
   if(!dailyUI.isRewardVisible()){
    lifeSheet.revealResults();$('sheetContent').scrollTop=0;
   }
   if(choice?.layer==='일상 선택')dailyUI.highlight(root);
  }
 }
 function stopJourney(){
  journeyActive=false;
  if(journeyTimer!==null){global.clearTimeout(journeyTimer);journeyTimer=null;}
  if(newsTimer!==null){global.clearTimeout(newsTimer);newsTimer=null;}
  const toast=$('lifeNewsToast');if(toast)toast.hidden=true;
 }
 function showJourneyNews(item){
  const toast=$('lifeNewsToast');if(!toast)return;
  if(newsTimer!==null)global.clearTimeout(newsTimer);
  toast.replaceChildren(el('small','','새 소식'),el('strong','',item.title||'인생의 한 페이지'));
  if(item.detail){
   const detail=el('p','');global.GukminMarkup.render(detail,item.detail);
   toast.append(detail);
  }
  toast.hidden=false;toast.classList.remove('is-arriving');void toast.offsetWidth;
  toast.classList.add('is-arriving');
  newsTimer=global.setTimeout(()=>{toast.hidden=true;newsTimer=null;},prefersLessMotion?350:1100);
 }
 function startJourney(){
  stopJourney();
  if(!engine?.step){engine?.run();return;}
  journeyActive=true;
  function tick(){
   if(disposed||!journeyActive)return;
   if(cinematicShown||examBreakTimer!==null||$('convenienceStore').open){journeyTimer=global.setTimeout(tick,80);return;}
   const before=engine.snapshot(),had=before.persona.history.length;
   if(before.choice&&!before.reviewPending){stopJourney();renderProgress();return;}
   const changed=engine.step();
   const now=engine.snapshot();
   if(!changed||now.choice||now.reviewPending){
    stopJourney();renderProgress();return;
   }
   const news=now.persona.history.slice(had).some(item=>item.display!=='hidden'&&!String(item.source||'').startsWith('choice:'));
   journeyTimer=global.setTimeout(tick,prefersLessMotion?0:news?1250:170);
  }
  tick();
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
  const restoredDailyReward=dailyUI.restore(snapshot);
  if(snapshot.runtime.cinematic){queueCinematic(snapshot.runtime.cinematic);return;}
  if(snapshot.reviewPending){
   const last=Object.values(snapshot.runtime.choices||{}).filter(item=>item.status==='closed').at(-1);
   if(last?.script?.presentation?.type==='election'&&!last.presentationAcknowledged&&['elected','lost'].includes(persona.attributes?.classElection)){queueCinematic({kind:'election',title:'반장선거',won:persona.attributes?.classElection==='elected'});}
   else if(['exam','grade-seal'].includes(last?.script?.presentation?.type)&&!last.presentationAcknowledged){const p=last.script.presentation,key=p.category==='mock'?'exam':'schoolScore',a=last.outcome?.after||persona,b=last.outcome?.before||persona;queueCinematic({kind:'grade',title:p.term,after:global.GukminGrades.report(key,a.stats[key],p.stage||'high').display,before:p.type==='exam'?global.GukminGrades.report(key,b.stats[key],p.stage||'high').display:null});}
   else if(restoredDailyReward)dailyUI.openRestoredReward();
   else if(last?.layer==='일상 선택')engine.run(); // Old outcome without a recoverable before/after.
   else lifeSheet.revealResults();
  }else engine.run();
 }
 function startDemo(){
  stopJourney();dailyUI.reset();clearCinematics();clearMajor();
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
  const hasTarget=Number.isFinite(p?.remaining);
  // This bar means time actually passing, never a fake 100% on a paused decision.
  const advancing=journeyActive&&!choice&&!reviewing&&hasTarget;
  $('choiceTiming').hidden=!advancing;
  $('choiceTiming').classList.remove('is-paused');
  text('nextChoiceLabel',advancing?p.remaining+'턴 뒤 다음 선택':'');
  const progressValue=advancing?p.value||0:0;
  $('nextChoiceProgress').value=progressValue;
  $('choiceProgressFill').style.transform='scaleX('+Math.max(0,Math.min(1,progressValue))+')';
  snapSheet.refresh(); // A visible progress bar changes the compact height.
  const current=$('currentChoice');
  // The major presenter owns its reopen button until the choice token changes.
  // Clearing it during a normal render stranded a folded exam after reload.
  const sameMajor=choice?.layer==='한방 선택'&&presentedToken===choice.token;
  if(!sameMajor)current.replaceChildren();
  if($('action'))$('action').scrollTop=0;
  if(presentedToken!==choice?.token)clearMajor();
  if(dailyUI.isRewardVisible()||reviewing)return;
  if(!choice){dailyUI.reset();return;}
  if(cinematicShown)return;
  if(choice.layer==='한방 선택'){
   dailyUI.reset();
   if(!sameMajor)current.append(el('p','fine','한방 선택 응답 대기'));
   if(majorPresenter&&presentedToken!==choice.token){
    presentedToken=choice.token;
    const owner=engine,epoch=presentationEpoch;
    const dispose=majorPresenter({choice,root,resolve:(optionId,input)=>{if(disposed||engine!==owner||epoch!==presentationEpoch)return false;return safely(()=>owner.resolve(choice.token,optionId,input))();}});
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
  [$('openConvenienceStore'),'click',openStore],
  [$('convenienceStore'),'close',()=>{renderProgress();}],
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
 function dispose(){if(disposed)return;disposed=true;stopJourney();dailyUI.dispose();lifeSheet.dispose();clearCinematics();clearMajor();refreshMounted=null;resetMajorPresentation=null;mountedSession=null;for(const [node,event,handler] of subscriptions)node.removeEventListener(event,handler);}
 mountedSession=Object.freeze({
  snapshot:()=>requireEngine().snapshot(),advance:turns=>requireEngine().advance(turns),
  resolve:(token,id)=>requireEngine().resolve(token,id),run:()=>requireEngine().run?.(),apply:(id,result)=>requireEngine().apply(id,result),buy:id=>requireEngine().buy?.(id),storeStatus:()=>requireEngine().storeStatus?.(),dispose
 });
 render();
 return dispose;
}
global.GukminGame=Object.freeze({mount,posterData,registerMajorPresenter,get session(){return mountedSession;}});
})(window);
