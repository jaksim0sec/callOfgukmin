/* Two shared character panels: attribute tokens and current metrics / traits. */
(function(global){
'use strict';
const NS='http://www.w3.org/2000/svg';
const ICONS=Object.freeze({
 running:'<circle cx="15" cy="5" r="2"/><path d="m8 10 5-2 3 4 4 1M13 8l-3 6 4 3-1 4M10 14l-4 5H3"/>',
 mind:'<path d="M8 18v3h8v-3l3-3V9A7 7 0 0 0 5 9v6Z"/><path d="M9 10c2-3 4 3 6 0M10 15h4"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 home:'<path d="m4 10 6-5a3 3 0 0 1 4 0l6 5v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M9 20v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6"/>',
 school:'<rect x="5" y="8" width="14" height="13" rx="2"/><path d="m7 8 5-5 5 5M9 21v-5h6v5M9 11h.01M15 11h.01"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/>',
 savings:'<path d="M5 11a7 7 0 0 1 11-4l3-1v5l1 1v3l-3 1-1 4h-2v-3H9v3H7l-1-4-3-2v-3Z"/><path d="M9 7h4M15 11h.01"/>',
 hourglass:'<path d="M7 3h10M7 21h10M8 3v4c0 3 8 7 8 10v4M16 3v4c0 3-8 7-8 10v4M10 18h4"/>',
 check:'<rect x="4" y="4" width="16" height="16" rx="5"/><path d="m8 12 3 3 5-6"/>',
 flag:'<path d="M5 21V5c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
 speech:'<path d="M8 4h8a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H9l-5 4V8a4 4 0 0 1 4-4Z"/><path d="M8 9h8M8 13h5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8 6l8 8 8-8a5 5 0 0 0 0-7Z"/>',
 pulse:'<path d="M3 12h4l3-6 4 12 3-6h4"/>',
 book:'<path d="M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1ZM12 6v14"/>',
 chart:'<path d="M5 19v-6M12 19V5M19 19v-9"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9M12 6v12"/>',
 sparkle:'<path d="M12 3c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9Z"/>',
 graduation:'<path d="m3 9 9-5 9 5-9 5-9-5ZM7 12v5c3 2 7 2 10 0v-5M21 9v7"/>'
});
function node(tag,className,text){
  const el=document.createElement(tag);
  if(className)el.className=className;
  if(text!==undefined)el.textContent=String(text);
  return el;
}
function icon(name){
  const el=document.createElementNS(NS,'svg');
  el.setAttribute('viewBox','0 0 24 24');
  el.setAttribute('aria-hidden','true');
  el.setAttribute('focusable','false');
  el.setAttribute('fill','none');
  el.setAttribute('stroke','currentColor');
  el.setAttribute('stroke-width','1.8');
  el.setAttribute('stroke-linecap','round');
  el.setAttribute('stroke-linejoin','round');
  el.innerHTML=ICONS[name]||ICONS.sparkle;
  el.classList.add('token-icon');
  return el;
}
// Single DOM-returning factory for all visible semantic pills.
// Screen renderers provide meaning and optional classes; geometry and SVG always stay identical.
function createToken({type='context',label='',name='',id='',icon:iconName='',amount=null,
 classes='',state='',entry={}}={}){
 const P=global.GukminPlayer;
 const el=node('span','token token-icon-pill');
 el.dataset.tokenKind=type;
 const add=classes.split(/\s+/).filter(Boolean);
 let text=label,glyph=iconName||'sparkle';
 if(type==='metric'){
  const def=P.metricDefinition(id);
  text=def.label;glyph=def.icon||'sparkle';
  add.push('metric-impact','metric-'+id);
 }else if(type==='trait'){
  const def=P.traitDefinitions[name]||{};
  const negative=entry.negative===true||def.negative===true;
  text=label||name;glyph=entry.icon||def.icon||'sparkle';
  add.push('token-trait',negative?'trait-negative':'trait-positive');
  if(def.tier)add.push('trait-tier-'+def.tier);
  if(def.aptitude)add.push('trait-aptitude-'+def.aptitude);
  if(def.color)el.style.setProperty('--trait-color',def.color);
  el.title=entry.description||def.description||name;
  el.setAttribute('aria-label',text+(def.tier?' · 출생 배경':negative?' · 디버프':' · 특성'));
 }else if(type==='interest'){
  const def=P.traitDefinitions[name]||{};
  text=label||'관심 · '+name;glyph=iconName||def.icon||'sparkle';
  add.push('token-trait','trait-developing');
  if(def.color)el.style.setProperty('--trait-color',def.color);
 }else if(type==='school'){
  text=label;glyph=iconName||'school';
  add.push('school-token','school-token-'+(state||'complete'));
 }else if(type==='attribute'){
  add.push('attribute-token');
 }else{
  add.push('token-context');
 }
 el.classList.add(...add);
 el.append(icon(glyph),node('span','token-name',text));
 if(type==='metric'&&Number.isFinite(amount)){
  const up=amount>=0;
  const triangle=document.createElementNS(NS,'svg');
  triangle.setAttribute('viewBox','0 0 12 12');
  triangle.setAttribute('aria-hidden','true');
  triangle.setAttribute('focusable','false');
  triangle.classList.add('impact-arrow');
  const path=document.createElementNS(NS,'path');
  path.setAttribute('d',up?'M6 1 11 10H1Z':'M1 2h10L6 11Z');
  path.setAttribute('fill','currentColor');
  triangle.append(path);
  const numeric=Math.abs(amount).toLocaleString('ko-KR',{maximumFractionDigits:1})+
   (['money','allowance','income'].includes(id)?'원':'');
  el.append(triangle,node('span','impact-amount',numeric));
  el.setAttribute('aria-label',text+' '+(up?'증가 ':'감소 ')+numeric);
 }
 if(type==='school'){
  if(state==='active'){
   el.append(node('span','school-active-dot'));
  }
 }
 return el;
}
// Compatibility signatures deliberately delegate to the single DOM constructor.
function pill(label,iconName,kind=''){
 return createToken({type:'context',label,icon:iconName,classes:kind});
}
function metricImpact(id,amount,kind=''){
 return createToken({type:'metric',id,amount,classes:kind});
}
const metricRenderers=new Map();
function registerMetricRenderer(type,render){
 if(typeof render!=='function')throw new Error('스탯 렌더러는 함수여야 함');
 metricRenderers.set(type,render);
}
function showAttributes(root,s){
  const attributes=root.querySelector('#attributeRows');
  const schools=root.querySelector('#schools');
  attributes.replaceChildren();
  schools.replaceChildren();
  for(const item of [
    ['출생지',s.birthplace||'미정','pin'],
    ['집안',s.family||'미정','home']
  ]){
    const line=node('div','attribute-row');
    line.append(node('span','attribute-label',item[0]),
     createToken({type:'attribute',label:item[1],icon:item[2]}));
    attributes.append(line);
  }
  // Current role ends at school transition, but a completed elected term is a permanent career memory.
  if(s.attributes?.classElection==='elected'&&!s.roles?.includes('반장')){
    const line=node('div','attribute-row');
    line.append(node('span','attribute-label','지난 역할'),
      createToken({type:'attribute',label:'초등학교 반장 역임',icon:'flag'}));
    attributes.append(line);
  }
  const roles=Array.isArray(s.roles)?s.roles:[];
  if(roles.length){
    const line=node('div','attribute-row');
    line.append(node('span','attribute-label','역할'));
    const tokens=node('span','attribute-tokens');
    roles.forEach(role=>tokens.append(createToken({type:'attribute',label:typeof role==='string'?role:role.label||role.name||'역할',icon:'flag'})));
    line.append(tokens);attributes.append(line);
  }
  for(const [id,def] of Object.entries(global.GukminPlayer.attributeDefinitions)){
    if(!def.custom||def.hidden||s.attributes?.[id]===undefined)continue;
    const line=node('div','attribute-row');
    line.append(node('span','attribute-label',def.label),createToken({type:'attribute',label:s.attributes[id],icon:def.icon||'flag'}));
    attributes.append(line);
  }
  const records=global.GukminPlayer.schoolsOf(s);
  for(const kind of global.GukminPlayer.schoolKinds){
    const line=node('div','school-row');
    line.append(node('span','label',kind.label));
    const tokens=node('span','school-tokens');
    const matches=records.filter(r=>r.kind===kind.id);
    if(!matches.length)tokens.append(node('span','school-unset','미입학'));
    for(const record of matches){
      const active=['enrolled','active','attending'].includes(record.status);
      const completed=record.status==='graduated';
      const token=createToken({type:'school',label:record.name,state:active?'active':completed?'complete':'ended'});
      const label=active?'재학 중':completed?'졸업':record.status==='dropout'?'중퇴':record.status==='leave'?'휴학':'기록';
      token.title=record.name+' · '+label;
      token.setAttribute('aria-label',record.name+' '+label);
      tokens.append(token);
    }
    line.append(tokens);schools.append(line);
  }
}
function showMetrics(root,s){
 const list=root.querySelector('#gaugesList');
 // Preserve the currently painted fill ratio across renderer replacements.
 const previous=new Map();
 for(const old of list.querySelectorAll('.gauge')){
  const fill=old.querySelector('.ui-progress-fill');
  if(!fill)continue;
  const matrix=getComputedStyle(fill).transform;
  const ratio=matrix&&matrix!=='none'?Number.parseFloat(matrix.split('(')[1]):Number(fill.dataset.ratio);
  previous.set([...old.classList].find(name=>name.startsWith('metric-')),Number.isFinite(ratio)?ratio:0);
 }
 const nextFills=[];
 list.replaceChildren();
 // Preserve metric definitions while grouping only their presentation.
 const groups=new Map();
 function metricGroup(metric){
  if(['stress','illness','relations'].includes(metric.id))return 'vitals';
  if(metric.type==='currency')return 'finance';
  if(metric.id==='schoolScore'||metric.id==='exam')return 'academics';
  return 'other';
 }
 function groupContent(kind){
  if(groups.has(kind))return groups.get(kind);
  const group=node('section','gauge-group gauge-group-'+kind);
  if(kind==='academics')group.setAttribute('aria-label','학업 성적');
  const content=node('div','gauge-group-content');
  group.append(content);
  list.append(group);
  groups.set(kind,content);
  return content;
 }
 const phase=global.GukminPlayer.phaseOf(s);
 const metrics=global.GukminPlayer.activeMetrics(s);
 for(const metric of [...metrics.filter(item=>item.id!=='money'),...metrics.filter(item=>item.id==='money')]){
  // One existing risk slot changes stage; never add a third vital card.
  if(metric.id==='illness'&&!(s.stats.illness>0))continue;
  if(metric.id==='stress'&&s.stats.illness>0)continue;
  // Keep study internally for admissions and earlier saves; do not duplicate school grades.
  if(metric.id==='study'&&(phase==='middle'||phase==='high'))continue;
  const wrap=node('div','gauge metric-'+metric.id);
  const line=node('div','gauge-label');
  const name=metric.id==='schoolScore'&&phase==='middle'?'교과 성취':metric.label;
  const left=node('span','gauge-title');
  const glyph=icon(metric.icon||'sparkle');
  glyph.classList.add('gauge-metric-icon');
  left.append(glyph,node('span','gauge-name',name));
  line.append(left);
  const number=metric.value;
  const graded=['schoolScore','exam'].includes(metric.id);
  const result=graded?global.GukminGrades.report(metric.id,number,phase):null;
  const formatted=result?result.display:Number.isFinite(number)?
   metric.type==='currency'?Number(number).toLocaleString('ko-KR')+'원':String(number):'—';
  const value=node('b','gauge-value',formatted);
  if(result){value.title=result.detail;}
  line.append(value);
  wrap.append(line);
  // Categorical grades must not look like completion percentages.
  if(metric.type==='progress'&&!graded){
   const progress=node('progress');
   const min=metric.min??0,max=metric.max??100;
   progress.max=max-min;
   progress.value=Number.isFinite(number)?Math.max(0,Math.min(max-min,number-min)):0;
   progress.setAttribute('aria-label',name);
   progress.classList.add('ui-progress-native');
   const track=node('span','ui-progress-track gauge-progress-track');
   const fill=node('span','ui-progress-fill');
   const ratio=Math.max(0,Math.min(1,progress.max?progress.value/progress.max:0));
   fill.dataset.ratio=String(ratio);
   fill.style.transform='scaleX('+ (previous.get('metric-'+metric.id)??0)+')';
   track.append(fill);
   wrap.append(progress,track);
   nextFills.push([fill,ratio]);
  }
  // Grade methodology is available on hover; avoid repeating warning text under each gauge.
  if(metricRenderers.has(metric.type))metricRenderers.get(metric.type)(wrap,metric);
  if(metric.type==='currency')wrap.classList.add('gauge-currency');
  if(metric.tone)wrap.classList.add('gauge-'+metric.tone);
  groupContent(metricGroup(metric)).append(wrap);
 }
 // Keep money last regardless of phase-specific activation or registration order.
 for(const kind of ['vitals','other','academics','finance']){
  const content=groups.get(kind);if(content)list.append(content.parentElement);
 }
 // The DOM is mounted before transitioning. Re-rendering no longer flashes a native bar.
 if(nextFills.length){
  // Commit the old painted scale before requesting a new animation frame.
  // Without this read, fresh DOM may collapse both styles into one paint.
  for(const [fill] of nextFills)void fill.offsetWidth;
  requestAnimationFrame(()=>{
   for(const [fill,ratio] of nextFills)if(fill.isConnected)fill.style.transform='scaleX('+ratio+')';
  });
 }
}

function traitToken(name,entry={}){
 return createToken({type:'trait',name,entry});
}
function showTraits(root,s){
  const traits=root.querySelector('#traits'),rendered=traits.dataset.rendered==='true';
  const previous=new Set([...traits.children].map(token=>token.dataset.traitKey)),scrollLeft=traits.scrollLeft;
  traits.replaceChildren();traits.dataset.rendered='true';
  function appendTrait(token,key){token.dataset.traitKey=key;if(rendered&&!previous.has(key))token.classList.add('is-trait-new');if(token.classList.contains('trait-control'))token.setAttribute('aria-expanded',String(dialog?.open&&dialog.dataset.traitKey===key));traits.append(token);}
  const dialog=root.querySelector('#traitDialog'),info=root.querySelector('#traitInfo');
  if(dialog&&!dialog.dataset.bound){
   dialog.dataset.bound='true';
   dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
   dialog.addEventListener('close',()=>{
    traits.querySelectorAll('.trait-control').forEach(button=>button.setAttribute('aria-expanded','false'));
    [...traits.children].find(button=>button.dataset.traitKey===dialog.dataset.traitKey)?.focus({preventScroll:true});
   });
  }
  function inspect(token,description){
   if(!dialog||!info||!description)return token;
   const button=node('button','trait-control');button.type='button';
   button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','traitDialog');button.setAttribute('aria-haspopup','dialog');
   button.append(token);
   button.addEventListener('click',()=>{
    traits.querySelectorAll('.trait-control').forEach(b=>b.setAttribute('aria-expanded','false'));
    button.setAttribute('aria-expanded','true');
    dialog.dataset.traitKey=button.dataset.traitKey;
    root.querySelector('#traitDialogTitle').replaceChildren(token.cloneNode(true));
    info.textContent=description;
    if(!dialog.open)dialog.showModal();
   });return button;
  }
  const entries=Array.isArray(s.traits)?s.traits.filter(Boolean):[];
  const enrolled=global.GukminPlayer.schoolsOf(s).find(r=>r.kind==='high'&&r.status==='enrolled');
  if(!entries.length&&!enrolled){
    traits.append(node('span','traits-empty','아직 획득한 특성이 없어'));
    return;
  }
  for(const entry of entries){
    const name=typeof entry==='string'?entry:entry.name;
    if(!name)continue;
    const def=global.GukminPlayer.traitDefinitions[name]||{};
    if(def.hidden){
      // An interest is a visible seed, not a silently missing aptitude.
      if(name.startsWith('관심-')){
       const field=name.slice(3),learned=global.GukminPlayer.hasTrait(s,field);
       if(!learned){
        const developing=createToken({type:'interest',name:field});
        developing.title=field+' 활동을 다시 이어 가면 정식 특성으로 발전할 수 있어';
        appendTrait(inspect(developing,developing.title),name);
       }
      }
      continue;
    }
    const negative=entry.negative===true||def.negative===true;
    const token=traitToken(name,entry);
    token.title=entry.description||def.description||name;
    token.setAttribute('aria-label',name+(negative?' · 디버프':' · 특성'));
    appendTrait(inspect(token,token.title),name);
  }
  // Derived presentation only: schoolHistory stays the single source of school identity.
  if(enrolled){
   const kind=global.GukminSchools.kindOf(enrolled.name);
   const labels={science:'과학고',foreign:'외국어고',international:'국제고',gifted:'영재학교',
    vocational:'특성화고',autonomous:'자율형 사립고','autonomous-public':'자율형 공립고'};
   if(labels[kind]){
    const token=createToken({type:'context',label:labels[kind],icon:'graduation',classes:'token-school-kind school-kind-'+kind});
    token.title=enrolled.name+' · 재학 중';
    token.setAttribute('aria-label',enrolled.name+' 재학 중 · '+labels[kind]);
    appendTrait(token,'school:'+kind);
   }
  }
  traits.scrollLeft=scrollLeft;
  const added=rendered&&[...traits.children].reverse().find(token=>!previous.has(token.dataset.traitKey));
  if(added){
   const bounds=traits.getBoundingClientRect(),target=added.getBoundingClientRect();
   if(target.width>traits.clientWidth||target.left<bounds.left)traits.scrollLeft+=target.left-bounds.left;
   else if(target.right>bounds.right)traits.scrollLeft+=target.right-bounds.right;
  }
}
function render(root,persona){
  if(!root||!persona)return;
  const job=root.querySelector('#job');
  if(job)job.textContent=persona.job||'미정';
  showAttributes(root,persona);
  showMetrics(root,persona);
  showTraits(root,persona);
}
global.GukminStatus=Object.freeze({render,registerMetricRenderer,createToken,pill,traitToken,metricImpact});
})(window);
