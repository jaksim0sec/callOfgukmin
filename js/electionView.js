/* Shared election graphics. Projections are read-only; only timeline confirms pledges. */
(function(global){
'use strict';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const shortNames=['놀이파','모범생파','조용한 다수','운동파'];
function bar(values,names,cls=''){
 const element=make('div','support-track '+cls),segments=values.map((value,i)=>{const span=make('span','candidate-color-'+i);span.style.width=value+'%';element.append(span);return span;});element.setAttribute('role','img');
 const update=(values,names)=>{values.forEach((v,i)=>segments[i].style.width=v+'%');element.setAttribute('aria-label',values.map((v,i)=>names[i]+' '+Math.round(v)+'%').join(', '));};update(values,names);return {element,update};
}
function board(person,{compact=false}={}){
 const E=global.GukminElection,element=make('section','support-board'+(compact?' is-compact':'')),head=make('header','support-head'),total=make('strong','support-total'),range=make('small','support-range');
 head.append(make('span','','예상 지지율'),total,range);const overall=bar([0,0,0],['나','','']);element.append(head,overall.element);
 const legend=make('div','support-legend');element.append(legend);
 const groups=make('div','support-groups'),rows=E.groups.map((group,g)=>{
  const row=make('article','support-group'),name=make('strong','',shortNames[g]),number=make('strong','support-group-percent'),note=make('small','support-group-range'),label=make('div','support-group-head');label.append(name,number);
  const chart=bar([0,0,0],['나','','']),seats=make('div','support-seats');seats.setAttribute('aria-hidden','true');for(let n=0;n<group.size;n++)seats.append(make('i',''));
  row.append(label,chart.element,note,seats);groups.append(row);return {row,number,note,chart,seats};
 });element.append(groups);
 const balance=make('div','promise-balance'),burden=make('strong'),funds=make('span'),risk=make('div','promise-risk');risk.setAttribute('role','img');for(let i=0;i<3;i++)risk.append(make('i',''));balance.append(burden,risk,funds);if(!compact)element.append(balance);
 const foot=make('small','support-disclaimer','예상치입니다. 듣지 않은 민심·소문·기권에 따라 실제 표는 달라집니다.');element.append(foot);
 function update(ids,response){
  const f=E.forecast(person,ids,response),names=f.candidates.map((c,i)=>i===0?'나':c.name);total.textContent=f.candidates[0].share+'%';range.textContent=f.low+'–'+f.high+'% 범위';overall.update(f.candidates.map(c=>c.share),names);legend.replaceChildren();
  f.candidates.forEach((c,i)=>{const token=make('span','candidate-key-'+i);token.append(make('i','candidate-color-'+i),document.createTextNode(names[i]+' '+c.share+'%'));legend.append(token);});
  f.rows.forEach((r,g)=>{const view=rows[g];view.row.classList.toggle('is-heard',r.known);view.number.textContent=r.shares[0]+'%';view.note.textContent=(r.known?'● 민심 확인 · ':'○ 추정 · ')+r.low+'–'+r.high+'%';view.chart.update(r.shares,names);
   const expected=r.shares.map(v=>v*r.group.size/100),counts=expected.map(Math.floor),order=expected.map((v,i)=>({i,f:v-counts[i]})).sort((a,b)=>b.f-a.f);for(let n=r.group.size-counts.reduce((a,b)=>a+b,0),i=0;i<n;i++)counts[order[i].i]++;
   let seat=0;counts.forEach((count,c)=>{for(let n=0;n<count;n++)view.seats.children[seat++].className='candidate-color-'+c;});
  });burden.textContent='권한 밖 '+f.hard+' / 3';[...risk.children].forEach((e,i)=>e.classList.toggle('is-risk',i<f.hard));risk.setAttribute('aria-label','권한 밖 공약 '+f.hard+'개');funds.textContent='직접 이행 재산 '+f.cost.toLocaleString('ko-KR')+'원';return f;
 }
 update(E.chosen(person).map(p=>p.id));return {element,update};
}
global.GukminElectionView=Object.freeze({board,bar});
})(window);
