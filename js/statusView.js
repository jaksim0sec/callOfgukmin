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
function pill(label,iconName,kind=''){
  const el=node('span','token token-icon-pill'+(kind?' '+kind:''));
  el.append(icon(iconName),node('span','token-name',label));
  return el;
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
    line.append(node('span','attribute-label',item[0]),pill(item[1],item[2],'attribute-token'));
    attributes.append(line);
  }
  const roles=Array.isArray(s.roles)?s.roles:[];
  if(roles.length){
    const line=node('div','attribute-row');
    line.append(node('span','attribute-label','역할'));
    const tokens=node('span','attribute-tokens');
    roles.forEach(role=>tokens.append(pill(typeof role==='string'?role:role.label||role.name||'역할','flag','attribute-token')));
    line.append(tokens);attributes.append(line);
  }
  for(const [id,def] of Object.entries(global.GukminPlayer.attributeDefinitions)){
    if(!def.custom||def.hidden||s.attributes?.[id]===undefined)continue;
    const line=node('div','attribute-row');
    line.append(node('span','attribute-label',def.label),pill(s.attributes[id],def.icon||'flag','attribute-token'));
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
      const token=pill(record.name,'school','school-token '+(active?'school-token-active':completed?'school-token-complete':'school-token-ended'));
      const label=active?'재학 중':completed?'졸업':record.status==='dropout'?'중퇴':'기록';
      token.title=record.name+' · '+label;
      token.setAttribute('aria-label',record.name+' '+label);
      if(active){token.append(node('span','school-active-dot')); }
      tokens.append(token);
    }
    line.append(tokens);schools.append(line);
  }
}
function showMetrics(root,s){
 const list=root.querySelector('#gaugesList');
 list.replaceChildren();
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
  if(metric.type==='progress'){
   const progress=node('progress');
   const min=metric.min??0,max=metric.max??100;
   progress.max=max-min;
   progress.value=Number.isFinite(number)?Math.max(0,Math.min(max-min,number-min)):0;
   progress.setAttribute('aria-label',name);
   wrap.append(progress);
  }
  // Grade methodology is available on hover; avoid repeating warning text under each gauge.
  if(metricRenderers.has(metric.type))metricRenderers.get(metric.type)(wrap,metric);
  if(metric.type==='currency')wrap.classList.add('gauge-currency');
  if(metric.tone)wrap.classList.add('gauge-'+metric.tone);
  list.append(wrap);
 }
}

function traitToken(name,entry={}){
 const def=global.GukminPlayer.traitDefinitions[name]||{};
 const negative=entry.negative===true||def.negative===true;
 const token=pill(name,entry.icon||def.icon||'sparkle','token-trait '+(negative?'trait-negative':'trait-positive')+(def.tier?' trait-tier-'+def.tier:'')+(def.aptitude?' trait-aptitude-'+def.aptitude:''));
 if(def.color)token.style.setProperty('--trait-color',def.color);
 token.title=entry.description||def.description||name;
 token.setAttribute('aria-label',name+(def.tier?' · 출생 배경':negative?' · 디버프':' · 특성'));
 return token;
}
function showTraits(root,s){
  const traits=root.querySelector('#traits');traits.replaceChildren();
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
        const developing=pill('관심 · '+field,'sparkle','token-trait trait-developing');
        const tint=global.GukminPlayer.traitDefinitions[field]?.color;
        if(tint)developing.style.setProperty('--trait-color',tint);
        developing.title=field+' 활동을 다시 이어 가면 정식 특성으로 발전할 수 있어';
        traits.append(developing);
       }
      }
      continue;
    }
    const negative=entry.negative===true||def.negative===true;
    const token=traitToken(name,entry);
    token.title=entry.description||def.description||name;
    token.setAttribute('aria-label',name+(negative?' · 디버프':' · 특성'));
    traits.append(token);
  }
  // Derived presentation only: schoolHistory stays the single source of school identity.
  if(enrolled){
   const kind=global.GukminSchools.kindOf(enrolled.name);
   const labels={science:'과학고',foreign:'외국어고',international:'국제고',gifted:'영재학교',
    vocational:'특성화고',autonomous:'자율형 사립고','autonomous-public':'자율형 공립고'};
   if(labels[kind]){
    const token=pill(labels[kind],'graduation','token-trait token-school-kind school-kind-'+kind);
    token.title=enrolled.name+' · 재학 중';
    token.setAttribute('aria-label',enrolled.name+' 재학 중 · '+labels[kind]);
    traits.append(token);
   }
  }
}
function render(root,persona){
  if(!root||!persona)return;
  const age=root.querySelector('#age'),job=root.querySelector('#job');
  if(age)age.textContent='#'+persona.age+'살';
  if(job)job.textContent=persona.job||'미정';
  showAttributes(root,persona);
  showMetrics(root,persona);
  showTraits(root,persona);
}
global.GukminStatus=Object.freeze({render,registerMetricRenderer,pill,traitToken});
})(window);
