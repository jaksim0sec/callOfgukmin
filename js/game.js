/* In-game UI controller.
 * Mounted by boot.js; content owns rules, this module projects committed state.
 */
(function(global){
'use strict';
const schoolAges=global.GukminData.schoolAges;
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
 if(phase==='elementary')return '초등학교 '+Math.max(1,age-schoolAges.elementary+1)+'학년';
 if(phase==='middle')return '중학교 '+Math.max(1,age-schoolAges.middle+1)+'학년';
 if(phase==='high'&&age<schoolAges.graduation)return '고등학교 '+Math.max(1,age-schoolAges.high+1)+'학년';
 return global.GukminPlayer.phaseDefinition(phase).label;
}
function headlineFor(persona){
 if(persona.attributes?.admissionAttempts>1)return lifeTitle(persona);
 const phase=global.GukminPlayer.phaseOf(persona);
 const school=global.GukminPlayer.schoolsOf(persona).find(record=>
  record.kind===phase&&['enrolled','active','attending'].includes(record.status));
 const stages={elementary:{label:'초등학교',offset:schoolAges.elementary-1,years:6},middle:{label:'중학교',offset:schoolAges.middle-1,years:3},high:{label:'고등학교',offset:schoolAges.high-1,years:3}};
 const stage=stages[phase];
 if(school&&stage)return stage.label+' '+Math.max(1,Math.min(stage.years,Math.floor(persona.age-stage.offset)))+'학년';
 return persona.age+'살';
}
function posterData(persona){
 const phase=global.GukminPlayer.phaseOf(persona),a=persona.attributes||{};
 const phases={
  infant:['유년기','세상은 아직\n놀이터','infant'],
  elementary:['초등학생','꿈은 크게\n숙제는 적게','elementary'],
  middle:['중학생','어른이 되는\n연습','middle'],
  high:['고등학생','내 인생은\n어디로?','high']
 };
 let [stage,phrase,portraitStage]=phases[phase]||['인생 기록','나의 길을\n걷다','adult'];
 if(a.admissionDestination==='college') [stage,phrase,portraitStage]=['대학 예정','새로운 문이\n열렸다','adult'];
 else if(a.admissionDestination==='employment') [stage,phrase,portraitStage]=['사회 준비','이제부터\n진짜 실전','adult'];
 else if(a.admissionDestination==='finished'||a.lifeEndReason){
   [stage,phrase,portraitStage]=['기록 종료','이번 도전은\n여기까지',phase==='high'?'high':'adult'];
 }else if((a.admissionAttempts||1)>1){
   [stage,phrase,portraitStage]=['N수생','올해는\n진짜 간다','high'];
 }else if(phase==='high'&&persona.age>=schoolAges.graduation){
   [stage,phrase,portraitStage]=['입시생','다음 길을\n선택하다','high'];
 }
 const portraitVariant=global.GukminPlayer.genderOf(persona);
 return {
  age:persona.age,name:persona.name,deceased:!!a.lifeEndReason||a.retryEndReason==='정신병 한계',stage,phrase,portraitStage,portraitVariant,
  partyName:persona.party||'무소속',number:persona.number,imageSrc:persona.portraitSrc||null,
  color:persona.partyColor,partyIcon:persona.partyIcon
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
 const historyNext=$('historyNext'),historyAdvance=$('historyAdvance');
 let dailyClock=null;
 const mobileSheet=global.matchMedia('(max-width: 47.5em)');

 // The compact snap fits its controls rather than a fixed fraction of the viewport.
 function collapsedSheetHeight({rem}){
  const visible=[$('sheetToggle'),sheet.querySelector('.sheet-head'),$('choiceTiming'),$('playbackControls'),$('historyAdvance'),$('systemTools'),$('systemError')];
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
 let journeyTimer=null,journeyActive=false,progressMotion=null,frozenProgress=null;
 let adviceToStore=false,resultRouted=false;
 const prefersLessMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const verificationMode=new URLSearchParams(global.location.search).has('systems');
 const controlsKey='callOfgukmin__controls__v1',tutorialKey='callOfgukmin__tutorial_hidden__v1';
 let preferences={},tutorialHidden=false;
 try{preferences=JSON.parse(localStorage.getItem(controlsKey)||'{}')||{};tutorialHidden=localStorage.getItem(tutorialKey)==='1';}catch{}
 let playbackMode=preferences.mode==='auto'?'auto':'manual',userPaused=preferences.paused===true;
 let tutorialActive=!verificationMode&&!tutorialHidden,lifeDeferred=false,tutorialPage=0;
 const tutorial=$('gameTutorial');
 const guide=[
  {title:'스탯은 선택의 방향을 보여 줍니다',body:'수치는 보통 0~25입니다. 관계가 오르면 친구들의 지지를 얻기 쉽지만, 압박이 오르면 위험이 커집니다. 같은 ▲라도 모두 보상은 아니에요. 선택 아래 토큰에서 얻는 것과 잃는 것을 함께 읽어 보세요.',stats:[{label:'압박',value:8,max:25,color:'#d65b62',note:'높을수록 부담'},{label:'관계',value:12,max:25,color:'#8769d8',note:'친구와 주변의 지지'}]},
  {title:'압박 25를 넘으면 정신병으로 바뀝니다',body:'압박 24에서 +3이면 초과한 2가 정신병이 됩니다. 그때부터 선택의 부담·회복도 정신병부터 적용됩니다. 정신병 5는 게임오버예요. GU는 4턴에 한 번 이용할 수 있고, 압박만 줄이는 상품과 정신병도 낮추는 상품이 다릅니다. 자동으로 쉬어 주지는 않아요.',stats:[{label:'압박 한계',value:25,max:25,color:'#d65b62',note:'초과한 만큼 다음 단계'},{label:'정신병',value:2,max:5,color:'#9556bf',note:'5에 도달하면 생애 종료'}]},
  {title:'공부한 능력과 시험 등급은 다릅니다',body:'학업 역량은 초등 시기의 공부 기반이고 운동능력은 계주에 쓰입니다. 중학교 교과 성취는 A~E, 고교 내신은 1~5등급, 모의고사·수능은 1~9등급이에요. 등급 숫자는 작을수록 좋습니다. 시험에서는 노력의 비용과 예상 성적을 함께 비교하세요.',stats:[{label:'학업 역량',value:15,max:25,color:'#6f82ba',note:'초등 시기의 공부 기반'},{label:'운동능력',value:8,max:25,color:'#5f9270',note:'연습으로 키워 계주에 활용'}]},
  {title:'재산은 돈, 특성은 행동을 바꾸는 힘',body:'용돈은 학생 시기에 받는 금액이고, 재산은 실제로 쓸 수 있는 돈입니다. 특성은 별도의 버프·디버프로, 관련 사건이나 시험의 결과에 영향을 줍니다. 토큰을 누르면 효과를 읽을 수 있어요. 재학·졸업 같은 학교 이력도 별도로 보존됩니다.',money:true,trait:'꼼꼼함'},
  {title:'진행은 언제나 같은 다음 버튼으로',body:'기록 아래의 다음 버튼 하나로 이야기를 넘기거나 대기 중인 선택을 엽니다. 자동은 이야기를 이어 주고 준비된 일상 선택을 5초 뒤 열어요. 수동은 누를 때만 진행하고, 일시정지는 시간을 멈춥니다. 선택은 직접 고르며 결과는 자동 저장됩니다.',art:[['→','다음'],['Ⅱ','일시정지'],['?','다시 도움말']]}
 ];
 const electionHub=global.GukminElectionView.mount({root,host:$('playbackControls'),onOpen:()=>{stopJourney();paintControls();},onClose:()=>{if(!disposed){renderProgress();if(canAuto()&&!snapshot?.choice&&!snapshot?.reviewPending&&!cinematicShown)startJourney();}}});
 function canAuto(){return !verificationMode&&!electionHub.isOpen()&&playbackMode==='auto'&&!userPaused&&!tutorialActive&&!document.hidden;}
 function saveControls(){try{localStorage.setItem(controlsKey,JSON.stringify({mode:playbackMode,paused:userPaused}));}catch{}}
 function paintControls(){
  const auto=playbackMode==='auto';
  $('playbackMode').setAttribute('aria-checked',String(auto));
  text('playbackPause',userPaused?'▶ 재개':'Ⅱ 일시정지');$('playbackPause').setAttribute('aria-pressed',String(userPaused));
  const disabled=userPaused||tutorialActive||cinematicShown||electionHub.isOpen();
  for(const id of ['historyNext','resumeDailyChoice','resumeMajorChoice'])$(id).disabled=disabled;
  const available=!!snapshot&&(snapshot.choice||snapshot.reviewPending||Number.isFinite(snapshot.progress?.remaining));
  historyAdvance.hidden=(verificationMode&&snapshot?.runtime.contentId!==global.GukminSystemDemo.contentId)||!available;
  historyNext.hidden=!!snapshot?.choice||!!dailyUI?.isRewardVisible();
  text('historyNextLabel','다음');
  $('playbackControls').dataset.paused=String(userPaused);
  $('lifeSheet').classList.toggle('is-awaiting-choice',!!snapshot?.choice);
  dailyUI?.setAutomatic(canAuto());
 }
 function paintTutorial(){
  const step=guide[tutorialPage];text('tutorialStep',String(tutorialPage+1).padStart(2,'0')+' / '+String(guide.length).padStart(2,'0'));
  text('tutorialTitle',step.title);text('tutorialBody',step.body);
  const art=$('tutorialArt');art.replaceChildren();art.classList.toggle('has-stat-guide',!!step.stats||!!step.money);
  if(step.stats){for(const metric of step.stats){const card=el('div','tutorial-stat-card');card.style.setProperty('--guide-color',metric.color);card.append(el('small','',metric.label),el('strong','',metric.value+'/'+metric.max));const track=el('div','tutorial-stat-track'),fill=el('span','');fill.style.transform='scaleX('+metric.value/metric.max+')';track.append(fill);card.append(track,el('p','',metric.note));art.append(card);}art.append(el('small','tutorial-example-note','설명용 예시 수치입니다.'));}
  else if(step.money){const card=el('div','tutorial-money-card');card.append(el('small','','재산 예시'),el('strong','','12,000원'),global.GukminStatus.traitToken(step.trait),el('p','',global.GukminPlayer.traitDefinition(step.trait).description));art.append(card);}
  else for(const [mark,label] of step.art||[]){const item=el('span','tutorial-symbol');item.append(el('b','',mark),el('small','',label));art.append(item);}
  $('tutorialDots').replaceChildren(...guide.map((_,i)=>{const dot=el('span','');dot.classList.toggle('is-current',i===tutorialPage);return dot;}));
  $('tutorialBack').disabled=tutorialPage===0;text('tutorialNext',tutorialPage===guide.length-1?'플레이 시작 →':'다음 →');
 }
 function openTutorial(){
  tutorialActive=true;tutorialPage=0;stopJourney();paintControls();paintTutorial();
  if(!tutorial.open)tutorial.showModal();
 }
 function finishTutorial(){
  if(!tutorialActive||disposed)return;
  try{if($('hideTutorial').checked)localStorage.setItem(tutorialKey,'1');else localStorage.removeItem(tutorialKey);}catch{}
  tutorialActive=false;if(tutorial.open)tutorial.close();
  if(lifeDeferred){lifeDeferred=false;restoreLife();}
  renderProgress();if(!snapshot?.choice&&!snapshot?.reviewPending&&!cinematicShown&&canAuto())startJourney();
 }
 function setPlayback(){
  saveControls();stopJourney();renderProgress();
  if(canAuto()&&!snapshot?.choice&&!snapshot?.reviewPending&&!cinematicShown)startJourney();
 }
 function nextMoment(){
  if(userPaused||tutorialActive||cinematicShown||root.querySelector('dialog[open]'))return;
  stopJourney();
  if(snapshot?.choice){
   if(snapshot.choice.layer==='일상 선택')dailyUI.open();else $('resumeMajorChoice').click();
   return;
  }
  // Skip silent logical turns only. A visible event or decision always stops this click.
  if(engine?.step){
   for(let count=0;count<10000;count++){
    const before=engine.snapshot(),changed=engine.step(),now=engine.snapshot();
    if(!changed||now.choice||now.reviewPending||cinematicShown||root.querySelector('dialog[open]')||now.persona.history.slice(before.persona.history.length).some(item=>item.display!=='hidden'))break;
   }
  }else engine?.run();
  renderProgress();
  if(canAuto()&&!snapshot?.choice&&!snapshot?.reviewPending&&!cinematicShown)journeyTimer=global.setTimeout(startJourney,1250);
 }
 function continueJourney(){if(playbackMode==='manual'&&!userPaused)nextMoment();else startJourney();}
 $('systemTools').hidden=!verificationMode;
 $('playbackControls').hidden=verificationMode;
 function text(id,value){const target=$(id);if(target)target.textContent=String(value??'');}
 function render(){
  if(!verificationMode&&(persona.attributes?.lifeEndReason||persona.attributes?.retryEndReason)){if(!resultRouted){resultRouted=true;stopJourney();clearCinematics();clearMajor();dailyUI?.reset();navigate('result');}return;}
  global.GukminStatus.render(root,persona);
  electionHub.update(global.GukminElection.model(persona));
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
  $('chapter').parentElement.hidden=!verificationMode;
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
    }
    log.append(article);
   }
   if(!snapshot?.reviewPending&&!snapshot?.choice&&(persona.attributes?.lifeEndReason||persona.attributes?.retryEndReason||['college','employment'].includes(persona.attributes?.admissionDestination)||['high:graduation','admission:retry-graduation'].some(id=>snapshot?.runtime?.events?.[id]?.status==='completed'))){
    const complete=el('section','life-chapter-complete');
    complete.append(el('small','','학생 시절 · 기록 완료'),el('h2','',persona.attributes?.lifeEndReason?'이번 삶은 여기까지':'다음 장을 기다리는 삶'),
     el('p','',(persona.attributes?.lifeEndReason?persona.attributes.lifeEndReason+'에 도달해 삶이 끝났습니다. ':persona.attributes?.retryEndReason?persona.attributes.retryEndReason+'으로 N수 준비를 마쳤습니다. ':'')+(persona.attributes?.lifeEndReason?'선택 기록은 그대로 보관됩니다. 새로운 인물로 다시 시작할 수 있습니다.':'현재 공개된 이야기는 여기까지입니다. 선택 기록은 그대로 보관됩니다. 다른 선택으로 새로운 삶을 시작할 수도 있습니다.')));
    const record=el('button','continue-story','내 인생 결과 보기 ↗');record.type='button';record.addEventListener('click',()=>navigate('result'));complete.append(record);
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
 function maybeShowAdvice(){
  const dialog=$('pressureAdvice');if(dialog.open)return true;
  if(verificationMode||snapshot?.runtime.contentId!==global.GukminDirector.contentId||persona.age<schoolAges.elementary||snapshot.reviewPending||cinematicShown||persona.attributes?.admissionDestination==='finished'||(persona.stats.illness||0)>=5)return false;
  if(root.querySelector('dialog[open]'))return false;
  const guide=!persona.attributes?.pressureGuideSeen&&persona.stats.stress>=13;
  const critical=persona.stats.illness===4&&!persona.attributes?.pressureCriticalSeen;
  if(!guide&&!critical)return false;
  const pressure=persona.stats.stress||0,illness=persona.stats.illness||0;
  text('pressureAdviceTitle',critical?'정신병 4 · 한계까지 1 남았습니다':'압박이 절반에 닿았습니다');
  text('pressureAdviceLead',critical?'정신병이 5가 되면 이번 인생이 끝납니다. 다음 선택 전에 회복할 수 있는지 확인해 보세요.':'부담이 쌓이면 압박이 오릅니다. 두 수치의 차이와 회복 방법을 한 번만 알려드릴게요.');
  text('advicePressureValue',pressure+'/25');text('adviceIllnessValue',illness+'/5');
  $('advicePressureProgress').value=pressure;$('adviceIllnessProgress').value=illness;
  $('advicePressureFill').style.transform='scaleX('+pressure/25+')';
  $('adviceIllnessFill').style.transform='scaleX('+illness/5+')';
  const status=engine.storeStatus();text('adviceStoreNote',status.remaining?'다음 편의점 이용까지 '+status.remaining+'턴 남았습니다.':'편의점은 4턴에 한 번 이용할 수 있습니다. 한계에 닿기 전에 틈틈이 쉬어 가세요.');
  dialog.dataset.guide=String(guide);dialog.dataset.critical=String(critical);dailyUI.suspend();$('choiceTiming').hidden=true;dialog.showModal();return true;
 }
 function finishAdvice(store=false){
  engine.acknowledgePressure();
  adviceToStore=store;$('pressureAdvice').close();
 }
 function renderStore(){
  const open=$('openConvenienceStore'),dialog=$('convenienceStore');
  const stress=persona.stats.stress||0,illness=persona.stats.illness||0,ended=persona.attributes?.admissionDestination==='finished';
  open.hidden=persona.age<schoolAges.elementary||!engine?.storeStatus||ended;
  const status=engine?.storeStatus?.();
  if(status)open.textContent=status.remaining?'편의점 · '+status.remaining+'턴 후 이용 ↗':'편의점 ↗';
  if(!dialog.open)return;
  text('storeBalance','사용 가능한 재산 '+persona.stats.money.toLocaleString('ko-KR')+'원');
  const vitals=$('storeVitals');vitals.replaceChildren(global.GukminStatus.createToken({label:'압박 '+stress+'/25',icon:'pulse',classes:'metric-impact metric-stress'}));
  if(illness)vitals.append(global.GukminStatus.createToken({label:'정신병 '+illness+'/5',icon:'mind',classes:'metric-impact metric-illness'}));
  const availability=$('storeAvailability');availability.dataset.waiting=String(status.remaining>0);
  text('storeAvailabilityTitle',status.remaining?'다음 이용까지 '+status.remaining+'턴':status.blocked?'잠시 이용할 수 없습니다':'지금 이용할 수 있어요');
  const steps=$('storeCooldownSteps');steps.hidden=!status.remaining;steps.replaceChildren();
  for(let i=0;i<4;i++){const step=el('span',i<4-status.remaining?'is-complete':'');step.setAttribute('aria-hidden','true');steps.append(step);}
  steps.setAttribute('aria-label',status.remaining+'턴 후 이용 가능');
  text('storeNotice',status.remaining?'다시 이용하려면 '+status.remaining+'턴이 필요합니다.':status.blocked?(stress===0&&!illness?'지금은 충분히 쉬었습니다.':snapshot?.reviewPending?'선택 결과를 확인한 뒤 이용해 주세요.':'현재는 이용할 수 없습니다.'):'한 번에 하나 · 구매 후 4턴 간격 · 회복은 직접 선택합니다.');
  const list=$('storeItems');list.replaceChildren();
  for(const item of status.items){
   const card=el('article','store-item');card.dataset.available=String(item.available);
   const button=el('button','store-buy');button.type='button';button.dataset.item=item.id;button.disabled=!item.available;button.setAttribute('aria-label',item.name+' · '+item.price.toLocaleString('ko-KR')+'원 구매');
   const art=el('span','store-product-art is-'+item.art);art.setAttribute('aria-hidden','true');
   const drawing=document.createElementNS('http://www.w3.org/2000/svg','svg');drawing.setAttribute('viewBox','0 0 160 120');drawing.classList.add('store-product-illustration');
   const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','assets/svg/store-products.svg?v=gu-recovery-20261021#'+item.art);drawing.append(use);art.append(drawing);
   const info=el('span','store-product-info');
   info.append(el('small','',item.recovery?'CARE / 마음 돌봄':'REST / 가벼운 쉼'),el('strong','',item.name),el('span','store-product-description',item.description));
   const relief=Math.min(stress,item.relief),recovery=Math.min(illness,item.recovery||0);
   info.append(el('span','store-relief','압박 −'+relief+(item.recovery?' · 정신병 −'+recovery:'')));
   const checkout=el('div','store-product-checkout');checkout.append(el('b','store-price',item.price.toLocaleString('ko-KR')+'원'),button);
   const reason=item.available?'구매하기 ↗':status.remaining?'다음 이용까지 '+status.remaining+'턴':status.blocked?'지금은 이용 불가':persona.stats.money<item.price?'재산 부족':!item.recovery&&stress===0?'압박이 없습니다':'정신병 발생 후 이용';
   button.textContent=reason;button.setAttribute('aria-label',item.name+' · '+reason+' · '+item.price.toLocaleString('ko-KR')+'원');card.append(art,info,checkout);
   button.addEventListener('click',safely(()=>{if(engine.buy(item.id)){text('storeNotice',item.name+' 구매 완료 · 압박 '+relief+' 감소'+(recovery?' · 정신병 '+recovery+' 감소':'')+' · 다음 이용까지 4턴.');$('convenienceStore').querySelector('.close').focus({preventScroll:true});}}));list.append(card);
  }
 }
 function openStore(){
  if(!engine?.storeStatus)return;
  dailyUI.suspend();$('choiceTiming').hidden=true;if(!$('convenienceStore').open)$('convenienceStore').showModal();renderStore();
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
  proceed:()=>safely(continueJourney)(),
  onCountdown:clock=>{dailyClock=clock;renderTiming();}
 });
 const cinematics=[],cinematic=$('lifeCinematic');
 let cinematicTimer=null,cinematicShown=false,currentCinematic=null,electionTicker=null,examBreakTimer=null;
 cinematic.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();$('lifeCinematicDismiss').focus();}});
 const reduceMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function nextCinematic(){
  if(disposed||tutorialActive||cinematicShown||!cinematics.length)return;
  const scene=cinematics.shift();
  currentCinematic=scene;
  cinematicShown=true;
  const body=$('lifeCinematicBody');body.replaceChildren();
  cinematic.dataset.scene=scene.kind;
  const card=el('section','life-cinematic-card'+(scene.kind==='grade'?' is-grade':''));
  const folio=el('div','cinematic-folio');folio.append(el('span','',persona.name),el('span','',headlineFor(persona)));card.append(folio);
  card.classList.toggle('is-sealed',!!scene.sealed);
  card.append(el('span','life-cinematic-kicker',scene.kind==='grade'?'학교 성적 통지표':scene.kind==='election'?'교실 개표 현황':scene.kind==='admission'?'입학 전형 결과':'인생의 전환점'));
  card.append(el('h2','life-cinematic-title',scene.title));
  if(scene.kind==='election')card.append(el('p','election-caption','우리 반의 한 표, 한 표가 모였다.'));
  if(scene.detail)card.append(el('p','life-cinematic-description',scene.detail));
  if(scene.kind==='grade'){
   card.append(el('div','grade-rule','REPORT / '+(scene.sealed?'FINAL':'SEMESTER')));
   const row=el('div','life-cinematic-grade');
   if(scene.before)row.append(el('span','',scene.before),el('span','life-cinematic-arrow','→'));
   const grade=el('strong','',scene.after);grade.style.color=global.GukminGrades.color(scene.grade||scene.after);row.append(grade);
   card.append(row);
   if(scene.changes)card.append(el('p','life-cinematic-changes',scene.changes));
   if(scene.assessment){const applied=global.GukminGrades.assessment(scene.person,scene.assessment);if(applied.applied.length){card.append(el('small','','이번 평가에 적용됨'));for(const source of applied.applied){const line=el('div','assessment-source');line.append(global.GukminStatus.traitToken(source.trait),el('span','',source.text));card.append(line);}}}
   card.append(el('small','life-cinematic-disclaimer','성적표'));
  }
  if(scene.kind==='election'){
   card.classList.add('is-election');
   const report=global.GukminElection?.report(persona);
   if(report)scene.won=report.won;
   const candidates=report?report.candidates.map(c=>c.name):[persona.name,'당시 경쟁 후보','다른 후보'],votes=report?report.candidates.map(c=>c.votes):[null,null,null];
   const box=el('div','election-ballot-box',report?.runoff?'1차 투표':'투표함'),rows=[];card.append(box);
   candidates.forEach((name,i)=>{const row=el('div','election-candidate'+(i===0?' is-player':''));const tally=el('strong','election-tally');row.append(el('span','',name),tally);card.append(row);rows.push(tally);});
   const runoff=global.GukminElectionView.runoffSummary(report);runoff.hidden=true;if(report?.runoff)card.append(runoff);
   const result=el('p','election-result');card.append(result);
   const analysis=el('section','election-analysis');analysis.hidden=true;
   if(report){
    analysis.append(el('h3','',report.runoff?'1차 투표 · 모임별 득표':'누가 누구를 뽑았을까?'),el('p','election-analysis-note','좋아하는 약속이 겹치면 표도 나뉘어. 친구 사이와 어떤 약속을 했는지가 함께 영향을 줘.'));
    for(const row of report.rows){const group=el('article','election-group-result');group.append(el('strong','',row.group.name+' · '+row.turnout+'/'+row.group.size+'명 투표'));
     const total=row.votes.reduce((n,v)=>n+v,0),shares=row.votes.map(v=>v/total*100);group.append(global.GukminElectionView.bar(shares,report.candidates.map(c=>c.name)).element);
     const split=el('div','election-vote-split');report.candidates.forEach((candidate,i)=>{const token=el('span',i===0?'is-player':'',candidate.name+' '+row.votes[i]+'표');split.append(token);});group.append(split,el('p','',row.hint));analysis.append(group);}
    if(report.tied&&!report.runoff)analysis.append(el('p','election-analysis-note','표가 똑같아서 제비뽑기로 정했어.'));
   }else analysis.append(el('p','','이전 저장의 선거입니다. 세부 득표는 기록되지 않았습니다.'));
   card.append(analysis);
   const start=performance.now();
   scene.finish=()=>{scene.finished=true;rows.forEach((node,i)=>node.textContent=votes[i]===null?'세부 득표 미기록':'正'.repeat(Math.floor(votes[i]/5))+(votes[i]%5?'一丨三四'[votes[i]%5-1]:'')+ ' · '+votes[i]+'표');analysis.hidden=false;runoff.hidden=!report?.runoff;result.replaceChildren(el('small','',report?.runoff?(report.runoff.drawn?'결선 동률 · 공개 추첨 결과':'결선투표 결과'):report?.tied?'동률 · 공개 추첨 결과':scene.won?'친구들이 내 이름을 불렀다.':'마지막 표까지 세었다.'),el('strong','',scene.won?'내가 뽑혔다.':candidates[report?.winner??1]+' 당선'),el('span','',scene.won?'우리 반의 반장이 되었다.':'이번에는 아쉽지만, 도전은 남았다.'));card.classList.add('is-counted');if(scene.won)card.classList.add('is-elected');$('lifeCinematicDismiss').textContent='결과 확인';if(electionTicker)global.clearInterval(electionTicker);electionTicker=null;};
   electionTicker=global.setInterval(()=>{const elapsed=performance.now()-start;const fraction=Math.min(1,Math.max(0,(elapsed-600)/4000));rows.forEach((node,i)=>{if(votes[i]===null){node.textContent='기록 확인 중';return;}const count=Math.floor(votes[i]*fraction);node.textContent='正'.repeat(Math.floor(count/5))+(count%5?'一丨三四'[count%5-1]:'')+' · '+count+'표';});if(elapsed>=6000)scene.finish();},100);
   if(reduceMotion)scene.finish();
  }
  if(scene.kind==='admission'){
   const type=scene.eventId?.includes(':early-result')?'early':'regular';
   const status=persona.attributes?.[type+'Status'];
   const accepted=status==='accepted'||(status!=='failed'&&!/불합격$/.test(scene.title));
   const verdict=accepted?'합격':'불합격';card.dataset.outcome=accepted?'accepted':'failed';card.classList.add('is-admission-result');
   const title=card.querySelector('.life-cinematic-title');title.textContent=scene.title.replace(/ (?:불합격|합격)$/,'');
   card.insertBefore(el('p','admission-verdict',verdict),title);card.append(el('span','cinematic-stamp',verdict));
   const image=el('img','school-placeholder');image.src='assets/svg/school-placeholder.svg';image.alt='';card.prepend(image);
  }
  if(scene.kind==='transition'){card.classList.add('is-chapter');card.prepend(el('span','chapter-orbit',''));card.append(el('span','chapter-footer','새로운 장이 시작됩니다.'));}
  body.append(card);cinematic.hidden=false;document.body.classList.add('cinematic-open');
  $('lifeCinematicDismiss').textContent=scene.kind==='election'&&!scene.finished?'건너뛰기':scene.kind==='transition'?(playbackMode==='manual'?'다음 이야기 →':'시간이 흐른다…'):'결과 확인하고 계속하기 →';
  $('lifeCinematicDismiss').focus({preventScroll:true});
  if(scene.kind==='transition'&&canAuto())cinematicTimer=global.setTimeout(()=>{if(canAuto())hideCinematic();},reduceMotion?0:1200);
  else if(!['grade','election','admission'].includes(scene.kind)&&canAuto())cinematicTimer=global.setTimeout(()=>{if(canAuto())hideCinematic();},reduceMotion?850:2200);
 }
 function hideCinematic(){
  if(currentCinematic?.kind==='election'&&!currentCinematic.finished){currentCinematic.finish();return;}
  if(cinematicTimer!==null){global.clearTimeout(cinematicTimer);cinematicTimer=null;}
  const completed=currentCinematic;
  currentCinematic=null;cinematic.hidden=true;cinematicShown=false;document.body.classList.remove('cinematic-open');
  if(completed&&['grade','election','admission'].includes(completed.kind))engine?.acknowledge?.();
  if(completed?.kind==='election'){dailyUI.restore(snapshot);dailyUI.openRestoredReward();}
  if(completed?.kind==='grade'&&completed.middleMid){
   stopJourney();
   examBreakTimer=global.setTimeout(()=>{examBreakTimer=null;startJourney();},prefersLessMotion?350:1400);
   for(const button of $('log').querySelectorAll('.continue-story'))button.hidden=true;
   renderProgress();return;
  }
  nextCinematic();renderProgress();
  if(completed&&['grade','transition','admission','election'].includes(completed.kind)&&!dailyUI.isRewardVisible())startJourney();
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
    queueCinematic({title:(school?.name||'고등학교')+' 입학',detail:'새로운 학교생활이 시작됐다.'});
   }
   const events={
    'infant:school-entry':'초등학교 입학',
    'elementary:middle-entry':'초등학교 졸업 · 중학교 입학',
    'high:graduation':'고등학교 졸업',
    'admission:repeat-year':'고등학교 졸업 · 재수 시작',
    'admission:retry-graduation':'입시 재도전 마무리'
   };
   for(const item of added)if(events[item.source])
    {const kind={'infant:school-entry':'elementary','elementary:middle-entry':'middle','high:graduation':'high'}[item.source],school=kind&&global.GukminPlayer.schoolsOf(s.persona).find(x=>x.kind===kind);queueCinematic({title:school?school.name+(item.source==='high:graduation'?' 졸업':' 입학'):events[item.source],detail:item.detail});}
  }
  render();
  if(added.length){$('log')?.firstElementChild?.classList.add('record-arrived');
  }
  if(s.reviewPending||choice?.layer==='일상 선택'){
   // The reward is shown in the original daily sheet; history remains permanent.
   if(!dailyUI.isRewardVisible()){
    lifeSheet.revealResults();$('sheetContent').scrollTop=0;
   }
   if(choice?.layer==='일상 선택')dailyUI.highlight(root);
  }
 }
 function stopProgressMotion(){
  if(!progressMotion)return;
  const fill=$('choiceProgressFill'),matrix=getComputedStyle(fill).transform;
  frozenProgress=matrix==='none'?0:Number(matrix.split('(')[1].split(',')[0]);
  fill.style.transition='none';fill.style.transform='scaleX('+frozenProgress+')';
  void fill.offsetWidth;progressMotion.cancel();progressMotion=null;fill.style.removeProperty('transition');
 }
 function animateJourneyProgress(duration){
  const p=snapshot?.progress;
  if(prefersLessMotion||!canAuto()||!Number.isFinite(p?.remaining)||p.remaining<=0)return;
  stopProgressMotion();
  const from=.8*(p.value||0),to=.8*Math.min(1,(p.value||0)+(1-(p.value||0))/p.remaining);
  progressMotion=$('choiceProgressFill').animate([{transform:'scaleX('+from+')'},{transform:'scaleX('+to+')'}],{duration,easing:'linear',fill:'forwards'});
 }
 function stopJourney(){
  stopProgressMotion();journeyActive=false;
  if(journeyTimer!==null){global.clearTimeout(journeyTimer);journeyTimer=null;}
 }
 function startJourney(){
  stopJourney();
  if(!canAuto()){renderProgress();return;}
  if(!engine?.step){engine?.run();return;}
  journeyActive=true;
  function tick(){
   if(disposed||!journeyActive)return;
   if(!canAuto()){stopJourney();renderProgress();return;}
   if(cinematicShown||examBreakTimer!==null||$('convenienceStore').open||$('pressureAdvice').open){journeyTimer=global.setTimeout(tick,80);return;}
   const before=engine.snapshot(),had=before.persona.history.length;
   if(before.choice&&!before.reviewPending){stopJourney();renderProgress();return;}
   const changed=engine.step();
   const now=engine.snapshot();
   if(!changed||now.choice||now.reviewPending){
    stopJourney();renderProgress();return;
   }
   const news=now.persona.history.slice(had).some(item=>item.display!=='hidden'&&!String(item.source||'').startsWith('choice:'));
   const delay=news?3000:450;
    animateJourneyProgress(delay);
    journeyTimer=global.setTimeout(tick,delay);
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
  if(tutorialActive){lifeDeferred=true;return;}
  restoreLife();
 }
 function restoreLife(){
  const restoredDailyReward=dailyUI.restore(snapshot);
  if(snapshot.runtime.cinematic){queueCinematic(snapshot.runtime.cinematic);return;}
  if(snapshot.reviewPending){
   const last=Object.values(snapshot.runtime.choices||{}).filter(item=>item.status==='closed').at(-1);
   if(last?.script?.presentation?.type==='election'&&!last.presentationAcknowledged&&['elected','lost'].includes(persona.attributes?.classElection)){queueCinematic({kind:'election',title:'반장선거',won:persona.attributes?.classElection==='elected'});}
   else if(['exam','grade-seal'].includes(last?.script?.presentation?.type)&&!last.presentationAcknowledged){const p=last.script.presentation,key=p.category==='mock'?'exam':'schoolScore',a=last.outcome?.after||persona,b=last.outcome?.before||persona;queueCinematic({kind:'grade',title:p.term,after:global.GukminGrades.report(key,a.stats[key],p.stage||'high').display,before:p.type==='exam'?global.GukminGrades.report(key,b.stats[key],p.stage||'high').display:null});}
   else if(restoredDailyReward)dailyUI.openRestoredReward();
   else if(last?.layer==='일상 선택'&&canAuto())startJourney(); // Old outcome without a recoverable before/after.
   else lifeSheet.revealResults();
  }else if(snapshot.choice)renderProgress();
  else if(playbackMode==='manual'||userPaused)renderProgress();
  else startJourney();
 }
 function startDemo(){
  stopJourney();dailyUI.reset();clearCinematics();clearMajor();
  connect(global.GukminSystemDemo.config(),true);
  engine.advance(0);
 }
 function renderTiming(){
  if(disposed||!snapshot)return;
  const choice=snapshot.choice,p=snapshot.progress,clock=dailyClock;
  const hasTarget=Number.isFinite(p?.remaining),daily=choice?.layer==='일상 선택';
  const counting=daily&&clock?.ready&&playbackMode==='auto';
  $('choiceTiming').hidden=verificationMode||(!choice&&!snapshot.reviewPending&&!hasTarget&&!snapshot.runtime.cinematic&&!cinematicShown);
  if(choice||snapshot.reviewPending)stopProgressMotion();
  let value=snapshot.reviewPending||snapshot.runtime.cinematic?1:choice?(daily&&playbackMode==='auto'&&!$('dailyChoiceDialog').open? .8:1):.8*(p?.value||0);
  if(counting)value=.8+.2*(1-clock.remaining/clock.total);
  if((userPaused||tutorialActive)&&frozenProgress!==null)value=frozenProgress;
  $('nextChoiceProgress').value=value;
  if(!progressMotion)$('choiceProgressFill').style.transform='scaleX('+Math.max(0,Math.min(1,value))+')';
  $('choiceProgressFill').parentElement.style.visibility='visible';
  $('choiceTiming').classList.toggle('is-paused',userPaused||!canAuto());
  text('nextChoiceLabel',tutorialActive?'안내를 보는 중':userPaused?'일시정지':examBreakTimer!==null?'기말고사 준비 기간':snapshot.reviewPending?'결과를 읽은 뒤 다음':choice?(counting&&clock.running?Math.ceil(clock.remaining/1000)+'초 뒤 선택 · 다음으로 바로 진행':'다음을 눌러 선택'):playbackMode==='manual'?'다음을 눌러 이야기 진행':'이야기가 이어지는 중');
 }
 function renderProgress(){
  if(disposed)return;
  paintControls();
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
  renderTiming();
  snapSheet.refresh(); // A visible progress bar changes the compact height.
  const current=$('currentChoice');
  // The major presenter owns its reopen button until the choice token changes.
  // Clearing it during a normal render stranded a folded exam after reload.
  const sameMajor=choice?.layer==='한방 선택'&&presentedToken===choice.token;
  if(!sameMajor)current.replaceChildren();
  if($('action'))$('action').scrollTop=0;
  if(presentedToken!==choice?.token)clearMajor();
  if(tutorialActive)return;
  if(dailyUI.isRewardVisible()||reviewing)return;
  if(electionHub.isOpen()||$('convenienceStore').open||maybeShowAdvice())return;
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

 if(tutorialActive)openTutorial();
 const subscriptions=[
  [$('playbackMode'),'click',()=>{playbackMode=playbackMode==='auto'?'manual':'auto';setPlayback();}],
  [$('playbackPause'),'click',()=>{userPaused=!userPaused;setPlayback();}],
  [historyNext,'click',nextMoment],
  [$('playbackHelp'),'click',openTutorial],
  [$('tutorialSkip'),'click',finishTutorial],
  [$('tutorialNext'),'click',()=>{if(tutorialPage<guide.length-1){tutorialPage++;paintTutorial();}else finishTutorial();}],
  [$('tutorialBack'),'click',()=>{tutorialPage=Math.max(0,tutorialPage-1);paintTutorial();}],
  [tutorial,'cancel',event=>{event.preventDefault();finishTutorial();}],
  [document,'visibilitychange',()=>{if(document.hidden){stopJourney();dailyUI.setAutomatic(false);}else setPlayback();}],
  [$('lifeCinematicDismiss'),'click',hideCinematic],
  [$('resetGame'),'click',reset],
  [$('openConvenienceStore'),'click',openStore],
  [$('adviceContinue'),'click',()=>finishAdvice(false)],
  [$('adviceStore'),'click',()=>finishAdvice(true)],
  [$('pressureAdvice'),'cancel',e=>{e.preventDefault();finishAdvice(false);}],
  [$('pressureAdvice'),'close',()=>{if(adviceToStore){adviceToStore=false;openStore();}else renderProgress();}],
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
 function dispose(){if(disposed)return;disposed=true;electionHub.dispose();if(tutorial.open)tutorial.close();stopJourney();dailyUI.dispose();lifeSheet.dispose();clearCinematics();clearMajor();refreshMounted=null;resetMajorPresentation=null;mountedSession=null;for(const [node,event,handler] of subscriptions)node.removeEventListener(event,handler);}
 mountedSession=Object.freeze({
  snapshot:()=>requireEngine().snapshot(),advance:turns=>requireEngine().advance(turns),
  resolve:(token,id,input)=>requireEngine().resolve(token,id,input),run:()=>requireEngine().run?.(),apply:(id,result)=>requireEngine().apply(id,result),buy:id=>requireEngine().buy?.(id),storeStatus:()=>requireEngine().storeStatus?.(),dispose
 });
 render();
 return dispose;
}
global.GukminGame=Object.freeze({mount,posterData,registerMajorPresenter,get session(){return mountedSession;}});
})(window);
