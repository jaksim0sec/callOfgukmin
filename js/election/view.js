/* Shared election graphics. Projections are read-only; only timeline confirms pledges. */
(function(global){
'use strict';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const candidateColors=['#b59ae9','#e7bb77','#76c6bb','#85a4d6','#d99cac','#a6c887'];
const color=(i,name)=>name==='고민 중'?'#6f6b79':candidateColors[i%candidateColors.length];
// Touch keeps native scrolling/inertia; a mouse can drag the same carousel.
function dragSlides(slider){
 let start=null,dragging=false;
 const down=event=>{if(event.pointerType==='mouse'&&event.button===0)start={id:event.pointerId,x:event.clientX,y:event.clientY,left:slider.scrollLeft};};
 const move=event=>{
  if(!start||event.pointerId!==start.id)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(!dragging){if(Math.abs(dx)<8)return;if(Math.abs(dy)>Math.abs(dx)){start=null;return;}dragging=true;slider.setPointerCapture(event.pointerId);slider.classList.add('is-dragging');}
  event.preventDefault();slider.scrollLeft=start.left-dx;
 };
 const end=()=>{if(!start)return;const id=start.id;start=null;if(dragging){dragging=false;slider.classList.remove('is-dragging');if(slider.hasPointerCapture(id))slider.releasePointerCapture(id);slider.scrollTo({left:Math.round(slider.scrollLeft/slider.clientWidth)*slider.clientWidth,behavior:global.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}};
 const leave=()=>{if(!dragging)start=null;};
 slider.addEventListener('pointerdown',down);slider.addEventListener('pointermove',move);slider.addEventListener('pointerup',end);slider.addEventListener('pointercancel',end);slider.addEventListener('pointerleave',leave);
 return ()=>{end();slider.removeEventListener('pointerdown',down);slider.removeEventListener('pointermove',move);slider.removeEventListener('pointerup',end);slider.removeEventListener('pointercancel',end);slider.removeEventListener('pointerleave',leave);};
}
function bar(values,names,cls=''){
 const element=make('div','support-track '+cls),segments=values.map((value,i)=>{const span=make('span','candidate-color-'+i);span.style.width=value+'%';element.append(span);return span;});element.setAttribute('role','img');
 const update=(values,names)=>{values.forEach((v,i)=>{segments[i].style.width=v+'%';segments[i].style.background=color(i,names[i]);});element.setAttribute('aria-label',values.map((v,i)=>names[i]+' '+Math.round(v)+'%').join(', '));};update(values,names);return {element,update};
}
function population(group,total){
 const element=make('div','electorate-size'),share=Math.round(group.size/total*100),track=make('div','electorate-size-track'),fill=make('i');fill.style.width=share+'%';track.append(fill);track.setAttribute('role','img');track.setAttribute('aria-label',group.name+' · 전체 '+total+'명 중 '+group.size+'명');element.append(make('small','','전체의 '+share+'%'),track);return element;
}
function runoffSummary(report){
 const element=make('section','election-runoff');if(!report?.runoff)return element;
 element.append(make('small','','1차 투표 공동 1위'),make('h3','','동점 후보끼리 결선투표'));
 for(const candidate of report.runoff.candidates){const row=make('div',candidate.index===report.winner?'is-winner':'');row.append(make('span','',candidate.name),make('strong','',candidate.votes+'표'));element.append(row);}
 element.append(make('p','',report.runoff.drawn?'결선도 동률 · 동점 후보의 공개 추첨으로 당선자를 정했어요.':'다른 후보를 찍었던 친구들도 두 번째 투표에 참여했어요. 결선 득표로 당선자를 정했어요.'));return element;
}
function board(model,{compact=false,collapsible=false}={}){
 const playerIndex=Math.max(0,model.candidates.findIndex(c=>c.id===model.playerId));
 const E=model,element=make('section','support-board'+(compact?' is-compact':'')),head=make('header','support-head'),total=make('strong','support-total'),range=make('small','support-range');
 head.append(make('span','','현재 조사 지지'),total,range);const overall=bar([...E.candidates.map(()=>0),0],[...E.candidates.map(c=>c.name),'고민 중']);element.append(head,overall.element);
 const legend=make('div','support-legend');element.append(legend);
 const groups=make('div','support-groups'),rows=E.groups.map((group,g)=>{
  const row=make('article','support-group'),name=make('strong','',group.shortName||group.name),size=make('small','support-group-size',group.size+'명'),label=make('span','support-group-label'),number=make('strong','support-group-percent'),note=make('small','support-group-range'),heading=make('div','support-group-head');label.append(name,size);heading.append(label,number);
  const chart=bar([...E.candidates.map(()=>0),0],[...E.candidates.map(c=>c.name),'고민 중']),sizeInfo=population(group,E.groups.reduce((n,g)=>n+g.size,0));
  const wishes=make('p','support-group-wishes');row.append(heading,chart.element,note,sizeInfo,wishes);groups.append(row);return {row,number,note,chart,wishes};
 });element.append(groups);
 const balance=make('div','promise-balance'),burden=make('strong'),funds=make('span'),risk=make('div','promise-risk');risk.setAttribute('role','img');for(let i=0;i<E.maxPledges;i++)risk.append(make('i',''));balance.append(burden,risk,funds);if(!compact)element.append(balance);
 const foot=make('small','support-disclaimer','물어본 답을 보고 예상한 거야. 고민 중인 친구들은 투표할 때 마음이 바뀔 수 있어.');element.append(foot);
 if(collapsible){
  const details=make('details','support-details'),summary=make('summary','','집단 규모 · 조사 결과');details.open=!global.matchMedia('(max-width:47.5em)').matches;const how=make('details','campaign-howto');how.append(make('summary','','어떻게 하면 돼?'));for(const line of ['① 찾아가면 '+model.riskLabel+' '+Math.min(...E.groups.map(g=>g.surveyCost||1))+'–'+Math.max(...E.groups.map(g=>g.surveyCost||1))+'. 대신 좋아하는 약속을 알 수 있어.','② 물어본 모임은 카드의 ?가 숫자로 바뀌어. +는 좋아해, −는 싫어해.','③ 약속 세 개를 골라 보여 주고, 다른 친구들 얘기도 들어 봐.','④ 마지막으로 고친 뒤 투표해. 물어봤다고 무조건 내 편은 아니야.'])how.append(make('p','',line));details.append(summary,how,legend,groups,balance,foot);element.append(details);
 }
 function update(ids,response){
  const f=E.forecast(ids,response),names=[...f.candidates.map((c,i)=>i===playerIndex?'나':c.name),'고민 중'];total.textContent=f.pollShares[playerIndex]+'%';range.textContent='고민 중 '+f.undecided+'%';overall.update(f.pollShares,names);legend.replaceChildren();
  names.forEach((name,i)=>{const token=make('span','candidate-key-'+i);const dot=make('i','candidate-color-'+i);dot.style.background=color(i,name);token.append(dot,document.createTextNode(name+' '+f.pollShares[i]+'%'));legend.append(token);});
  f.rows.forEach((r,g)=>{const view=rows[g];view.row.classList.toggle('is-heard',r.known);view.number.textContent=r.known?r.pollShares[playerIndex]+'%':Math.floor(r.low*(100-r.undecided)/100)+'–'+Math.ceil(r.high*(100-r.undecided)/100)+'%';view.note.textContent=r.known?'● 직접 물어봤어':'○ 아직 안 물어봤어';const wish=E.wishes(r.group.id);view.wishes.hidden=!wish;view.wishes.textContent=wish?'좋아해: '+wish.likes.map(x=>x.name).join(' · ')+' / 별로야: '+wish.dislikes.name:'';view.chart.update(r.pollShares,names);

  });burden.textContent='허락이 필요한 약속 '+f.hard+'개';[...risk.children].forEach((e,i)=>e.classList.toggle('is-risk',i<f.hard));risk.setAttribute('aria-label','권한 밖 공약 '+f.hard+'개');funds.textContent='직접 하려면 '+f.cost.toLocaleString('ko-KR')+'원';return f;
 }
 update(E.chosen.map(p=>p.id));return {element,update};
}
// One seasonal entry, with candidate slides and electorate data on separate tabs.
function mount({root,host,onOpen=()=>{},onClose=()=>{}}){
 const trigger=make('button','election-season-button','후보 · 민심 ↗');trigger.id='electionCandidates';trigger.type='button';trigger.hidden=true;host.append(trigger);
 const drawer=make('dialog','election-drawer');drawer.setAttribute('aria-labelledby','electionDrawerTitle');(root.body||root).append(drawer);
 let model=null,signature='',tab='candidates',selected=0,disposeSlides=()=>{},fitSlides=()=>{};
 function close(){if(drawer.open)drawer.close();}
 function render(){
  disposeSlides();const head=make('header','election-drawer-head'),title=make('h2','','후보와 민심');title.id='electionDrawerTitle';const exit=make('button','election-drawer-close','닫기 ×');exit.type='button';exit.addEventListener('click',close);
  const heading=make('div');heading.append(make('small','',model.title),title);head.append(heading,exit);
  const tabs=make('div','election-drawer-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','선거 정보');
  const candidatePane=make('section','election-candidate-pane'),surveyPane=make('section','election-electorate-pane');candidatePane.id='electionCandidatesPane';surveyPane.id='electionElectoratePane';
  const tabButtons=['후보 살펴보기','유권자 · 조사'].map((text,i)=>{const button=make('button','',text);button.type='button';button.id='electionDrawerTab'+i;button.setAttribute('role','tab');const pane=i?surveyPane:candidatePane;pane.setAttribute('role','tabpanel');pane.setAttribute('aria-labelledby',button.id);button.setAttribute('aria-controls',pane.id);
   button.addEventListener('click',()=>{tab=i?'survey':'candidates';syncTabs();});button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();tabButtons[event.key==='Home'?0:event.key==='End'?1:1-i].click();tabButtons[tab==='survey'?1:0].focus();}});tabs.append(button);return button;});
  function syncTabs(){tabButtons.forEach((button,i)=>{const active=(tab==='survey')===!!i;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});candidatePane.hidden=tab==='survey';surveyPane.hidden=tab!=='survey';if(tab==='candidates')global.requestAnimationFrame(()=>fitSlides());}
  const forecast=model.forecast(),slider=make('div','candidate-slides'),nav=make('nav','candidate-slide-nav');slider.setAttribute('aria-label','후보별 정보');
  let navFrame=null;
  const controls=model.candidates.map((candidate,i)=>{const button=make('button','',candidate.name);button.type='button';button.addEventListener('click',()=>{
   selected=i;if(navFrame!==null)global.cancelAnimationFrame(navFrame);
   // Cancel a touch fling before a name-button jump, so it cannot push the new card away.
   slider.style.overflowX='hidden';slider.scrollLeft=slider.clientWidth*i;slider.getBoundingClientRect();
   navFrame=global.requestAnimationFrame(()=>{navFrame=null;slider.style.overflowX='';slider.scrollLeft=slider.clientWidth*i;fitSlides();});
  });nav.append(button);return button;});
  model.candidates.forEach((candidate,i)=>{
   const card=make('article','candidate-slide'),poster=make('div','candidate-poster');
   poster.append(global.GukminPoster.create(candidate.poster||{...candidate.portrait,name:candidate.name,number:i+1,stage:'후보',phrase:candidate.title}));
   const info=make('div','candidate-information'),identity=make('div','candidate-identity'),share=make('div','candidate-poll');
   identity.append(make('small','candidate-intro',candidate.title),make('h3','candidate-person-name',candidate.name));share.append(identity,make('strong','',forecast.pollShares[i]+'%'));info.append(share,make('small','candidate-poll-note','현재 조사 지지 · 확정 득표가 아니에요 · 고민 중 '+forecast.undecided+'%'));
   const promises=make('ol','candidate-promises');candidate.pledges.forEach(p=>{const li=make('li');const line=make('div','candidate-promise-heading');line.append(make('strong','',p.name),make('span','candidate-feasibility',p.difficulty>=3?'권한 밖':p.difficulty>=2?'협의 필요':'직접 이행'));li.append(line,make('small','',p.limit));promises.append(li);});
   info.append(make('h4','','내건 약속'),candidate.pledges.length?promises:make('p','candidate-empty','아직 공약을 고르는 중이에요.'));
   if(candidate.copied)info.append(make('p','candidate-copy-note','내 임시 공약과 겹치는 약속이 있어요. 같은 친구들에게 표를 부탁하고 있어요.'));
   if(candidate.relations?.length){const data=make('div','candidate-relations');candidate.relations.forEach(item=>{const row=make('label');row.append(make('span','',item.label),make('b','',item.value+'/'+item.max));const meter=make('progress');meter.max=item.max;meter.value=item.value;row.append(meter);data.append(row);});info.append(data);}
   card.append(poster,info);slider.append(card);
  });
  const hint=make('small','candidate-slide-hint','← 좌우로 밀어 후보 비교 → · 아래로 공약 확인');
  const syncSlides=()=>{selected=Math.max(0,Math.min(model.candidates.length-1,Math.round(slider.scrollLeft/(slider.clientWidth||1))));controls.forEach((b,i)=>b.setAttribute('aria-current',String(i===selected)));};
  const stopDrag=dragSlides(slider),settle=()=>fitSlides();slider.addEventListener('scroll',syncSlides,{passive:true});slider.addEventListener('scrollend',settle);
  candidatePane.append(slider,nav,hint);
  surveyPane.append(board(model).element);drawer.replaceChildren(head,tabs,candidatePane,surveyPane);syncTabs();
  fitSlides=()=>{
   if(!drawer.open||tab!=='candidates')return;
   const card=slider.children[selected],poster=card.querySelector('.candidate-poster'),info=card.querySelector('.candidate-information'),style=global.getComputedStyle(card),rem=parseFloat(global.getComputedStyle(document.documentElement).fontSize),tabsStyle=global.getComputedStyle(tabs);
   const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth),gap=parseFloat(style.rowGap)||0;
   const content=global.matchMedia('(max-width:47.5em)').matches?poster.offsetHeight+info.offsetHeight+gap:Math.max(poster.offsetHeight,info.offsetHeight);
   const chrome=head.offsetHeight+tabs.offsetHeight+parseFloat(tabsStyle.marginBottom)+nav.offsetHeight+hint.offsetHeight;
   const height=Math.min(content+padding,Math.max(9*rem,(global.visualViewport?.height||global.innerHeight)-chrome-2*rem));
   if(Math.abs(slider.getBoundingClientRect().height-height)>1)slider.style.height=height+'px';
  };
  const observer=new ResizeObserver(()=>fitSlides());slider.querySelectorAll('.candidate-poster,.candidate-information').forEach(node=>observer.observe(node));global.addEventListener('resize',fitSlides);
  const resize=fitSlides;disposeSlides=()=>{stopDrag();observer.disconnect();global.removeEventListener('resize',resize);slider.removeEventListener('scroll',syncSlides);slider.removeEventListener('scrollend',settle);if(navFrame!==null)global.cancelAnimationFrame(navFrame);};
  slider.scrollLeft=slider.clientWidth*selected;controls.forEach((b,i)=>b.setAttribute('aria-current',String(i===selected)));
  fitSlides();
 }
 function open(){if(!model?.active||drawer.open)return;render();drawer.showModal();fitSlides();const slider=drawer.querySelector('.candidate-slides');slider.scrollLeft=slider.clientWidth*selected;onOpen();}
 const cancel=event=>{event.preventDefault();close();},backdrop=event=>{if(event.target===drawer){const b=drawer.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)close();}};
 const handleClose=()=>{disposeSlides();drawer.replaceChildren();onClose();};
 trigger.addEventListener('click',open);drawer.addEventListener('cancel',cancel);drawer.addEventListener('click',backdrop);drawer.addEventListener('close',handleClose);
 return {update(next){model=next;trigger.hidden=!next?.active;if(!next?.active)close();else{const key=JSON.stringify([next.candidates,next.groups,next.chosen,next.forecast()]);if(key!==signature&&drawer.open)render();signature=key;}},isOpen:()=>drawer.open,
  dispose(){disposeSlides();trigger.removeEventListener('click',open);drawer.removeEventListener('cancel',cancel);drawer.removeEventListener('click',backdrop);drawer.removeEventListener('close',handleClose);close();drawer.remove();trigger.remove();}};
}
global.GukminElectionView=Object.freeze({board,bar,mount,population,runoffSummary});
})(window);
