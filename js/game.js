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
 const phase=global.GukminPlayer.phaseOf(persona);
 const phrases={infant:'세상이 궁금한 아이',elementary:'꿈을 키우는\n초등학생',middle:'가능성을 찾는\n중학생',high:'내 길을 고르는\n고등학생'};
 return {
  color:persona.partyColor,partyName:persona.party,partyIcon:persona.partyIcon,
  phrase:persona.job==='고교 졸업'?'다음 장을\n기다리는 청춘':phrases[phase]||'다음 선택은 나의 몫',stage:persona.job,name:persona.name,number:persona.number,
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
 // Use the profile's page offset, not its scrolling screen offset, to avoid jumping.
 function middleSheetHeight({viewportHeight,rem}){
  const profile=root.querySelector('.desktop-right > .profile');
  const top=profile.getBoundingClientRect().top+(global.scrollY||0)-rem*.5;
  const boundary=Math.max(viewportHeight*.31,Math.min(viewportHeight*.65,top));
  return Math.max(viewportHeight-boundary,collapsedSheetHeight({rem})+rem*3.25);
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
  text('lifeHeadline',persona.age+'살');
  text('chapter',snapshot?.runtime.contentId===global.GukminSystemDemo.contentId
    ? '검증 · '+snapshot.runtime.turn+'턴' : lifeTitle(persona));
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
   if(['high:graduation','admission:retry-graduation'].some(id=>snapshot?.runtime?.events?.[id]?.status==='completed')){
    const complete=el('section','life-chapter-complete');
    complete.append(el('small','','학생 시절 · 기록 완료'),el('h2','','다음 장을 기다리는 삶'),
     el('p','','현재 공개된 이야기는 여기까지입니다. 선택 기록은 그대로 보관됩니다. 다른 선택으로 새로운 삶을 시작할 수도 있습니다.'));
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
 let cinematicTimer=null,cinematicShown=false,currentCinematic=null;
 const reduceMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function nextCinematic(){
  if(disposed||cinematicShown||!cinematics.length)return;
  const scene=cinematics.shift();
  currentCinematic=scene;
  cinematicShown=true;
  const body=$('lifeCinematicBody');body.replaceChildren();
  const card=el('section','life-cinematic-card'+(scene.kind==='grade'?' is-grade':''));
  card.classList.toggle('is-sealed',!!scene.sealed);
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
  nextCinematic();
  renderProgress();
  if(!cinematicShown&&completed?.kind==='grade'&&snapshot?.reviewPending)startJourney();
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
  snapshot=s;persona=s.persona;
  // Establish the visible scene before rendering a newly opened native dialog.
  if(s.runtime.contentId===global.GukminDirector.contentId){
   if(choice?.presentation?.type==='exam'&&s.reviewPending){
    const id=choice.presentation.category==='mock'?'exam':'schoolScore',phase=global.GukminPlayer.phaseOf(before);
    const old=global.GukminGrades.report(id,before.stats[id],phase).display;
    const next=global.GukminGrades.report(id,s.persona.stats[id],phase).display;
    const names={[id]:id==='schoolScore'&&phase==='middle'?'교과 성취':global.GukminPlayer.metricDefinition(id).label,study:'학습 기반',stress:global.GukminPlayer.metricDefinition('stress').label,health:'건강'};
    const changes=Object.entries(names).map(([key,label])=>{
     const delta=(s.persona.stats[key]??0)-(before.stats[key]??0);
     return delta?label+' '+(delta>0?'+':'−')+Math.abs(delta).toLocaleString('ko-KR',{maximumFractionDigits:2}):'';
    }).filter(Boolean).join(' · ');
    queueCinematic({kind:'grade',title:choice.presentation.term||choice.title,
     detail:choice.presentation.category==='mock'?'모의고사 결과':'내신 평가 결과',
     before:old+' ('+before.stats[id]+')',after:next+' ('+s.persona.stats[id]+')',changes});
   }
   if(choice?.presentation?.type==='grade-seal'&&s.reviewPending){
    const key=choice.presentation.category==='mock'?'exam':'schoolScore';
    const grade=global.GukminGrades.report(key,s.persona.stats[key],'high').display;
    queueCinematic({kind:'grade',title:'두구두구…',detail:key==='exam'?'대학수학능력시험 최종 결과':'고등학교 최종 내신 결과',
     before:'최종 성적',after:grade+'!',sealed:true});
   }
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
   if(cinematicShown){journeyTimer=global.setTimeout(tick,80);return;}
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
  if(snapshot.reviewPending){
   const last=Object.values(snapshot.runtime.choices||{}).filter(item=>item.status==='closed').at(-1);
   if(restoredDailyReward)dailyUI.openRestoredReward();
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
 function dispose(){if(disposed)return;disposed=true;stopJourney();dailyUI.dispose();lifeSheet.dispose();clearCinematics();clearMajor();refreshMounted=null;resetMajorPresentation=null;mountedSession=null;for(const [node,event,handler] of subscriptions)node.removeEventListener(event,handler);}
 mountedSession=Object.freeze({
  snapshot:()=>requireEngine().snapshot(),advance:turns=>requireEngine().advance(turns),
  resolve:(token,id)=>requireEngine().resolve(token,id),run:()=>requireEngine().run?.(),apply:(id,result)=>requireEngine().apply(id,result),dispose
 });
 render();
 return dispose;
}
global.GukminGame=Object.freeze({mount,posterData,registerMajorPresenter,get session(){return mountedSession;}});
})(window);
