/* Two shared character panels: attribute tokens and current metrics / traits. */
(function(global){
'use strict';
const NS='http://www.w3.org/2000/svg';
const ICONS=Object.freeze({
  pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  school:'<path d="M3 21V8l9-5 9 5v13"/><path d="M7 21v-6h10v6M8 10h.01M12 10h.01M16 10h.01"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5v1"/>',
  savings:'<path d="M5 12a7 7 0 0 1 12-4l3-1v5l-2 2v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-2l-2-1v-3l2 1Z"/><path d="M9 7V5h5M14 12h.01M8 20v1m7-1v1"/>',
  hourglass:'<path d="M5 3h14M5 21h14M7 3v5l5 4-5 4v5m10-18v5l-5 4 5 4v5"/>',
  check:'<path d="m4 13 5 5L20 6"/>',
  flag:'<path d="M5 22V3m0 2c4-3 9 3 14 0v11c-5 3-10-3-14 0"/>',
  speech:'<path d="M4 5h16v12H9l-5 4V5Z"/><path d="M8 10h8m-8 4h5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  pulse:'<path d="M3 12h4l3-6 4 12 3-6h4"/><path d="M3 4v4m18 8v4"/>',
  book:'<path d="M12 6C9 4 6 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/>',
  chart:'<path d="M4 20V10m5 10V5m5 15v-8m5 8V3"/><path d="M2 21h20"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M9 9c0-2 6-2 6 0s-6 1-6 3 6 1 6 3-6 2-6 0m3-9v12"/>',
  sparkle:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  graduation:'<path d="m2 9 10-5 10 5-10 5-10-5ZM6 11v5c3 3 9 3 12 0v-5M22 9v7"/>'
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
  const numeric=Math.abs(amount).toLocaleString('ko-KR',{maximumFractionDigits:2})+
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
      const label=active?'재학 중':completed?'졸업':record.status==='dropout'?'중퇴':'기록';
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
  if(metric.id==='stress'||metric.id==='health')return 'vitals';
  if(metric.type==='currency')return 'finance';
  if(metric.id==='schoolScore'||metric.id==='exam')return 'academics';
  return 'other';
 }
 function groupContent(kind){
  if(groups.has(kind))return groups.get(kind);
  const group=node('section','gauge-group gauge-group-'+kind);
  if(kind==='academics')group.append(node('div','gauge-group-heading','학업 성적'));
  const content=node('div','gauge-group-content');
  group.append(content);
  list.append(group);
  groups.set(kind,content);
  return content;
 }
 const phase=global.GukminPlayer.phaseOf(s);
 for(const metric of global.GukminPlayer.activeMetrics(s)){
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
  if(result)value.title=result.detail;
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
  const traits=root.querySelector('#traits');traits.replaceChildren();
  const info=root.querySelector('#traitInfo');
  if(info){info.hidden=true;info.textContent='';}
  function inspect(token,description){
   if(!info||!description)return token;
   const button=node('button','trait-control');button.type='button';
   button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','traitInfo');
   button.append(token);
   button.addEventListener('click',()=>{
    const open=button.getAttribute('aria-expanded')!=='true';
    traits.querySelectorAll('.trait-control').forEach(b=>b.setAttribute('aria-expanded','false'));
    button.setAttribute('aria-expanded',String(open));info.hidden=!open;info.textContent=open?description:'';
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
        traits.append(inspect(developing,developing.title));
       }
      }
      continue;
    }
    const negative=entry.negative===true||def.negative===true;
    const token=traitToken(name,entry);
    token.title=entry.description||def.description||name;
    token.setAttribute('aria-label',name+(negative?' · 디버프':' · 특성'));
    traits.append(inspect(token,token.title));
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
    traits.append(token);
   }
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
