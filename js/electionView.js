/* Shared election graphics. Projections are read-only; only timeline confirms pledges. */
(function(global){
'use strict';
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const shortNames=['급식·놀이','공부','조용한 친구','운동'];
function bar(values,names,cls=''){
 const element=make('div','support-track '+cls),segments=values.map((value,i)=>{const span=make('span','candidate-color-'+i);span.style.width=value+'%';element.append(span);return span;});element.setAttribute('role','img');
 const update=(values,names)=>{values.forEach((v,i)=>segments[i].style.width=v+'%');element.setAttribute('aria-label',values.map((v,i)=>names[i]+' '+Math.round(v)+'%').join(', '));};update(values,names);return {element,update};
}
function board(person,{compact=false,collapsible=false}={}){
 const E=global.GukminElection,element=make('section','support-board'+(compact?' is-compact':'')),head=make('header','support-head'),total=make('strong','support-total'),range=make('small','support-range');
 head.append(make('span','','지금 내 편은?'),total,range);const overall=bar([0,0,0,0],['나','','','고민 중']);element.append(head,overall.element);
 const legend=make('div','support-legend');element.append(legend);
 const groups=make('div','support-groups'),rows=E.groups.map((group,g)=>{
  const row=make('article','support-group'),name=make('strong','',shortNames[g]),size=make('small','support-group-size',group.size+'명'),label=make('span','support-group-label'),number=make('strong','support-group-percent'),note=make('small','support-group-range'),heading=make('div','support-group-head');label.append(name,size);heading.append(label,number);
  const chart=bar([0,0,0,0],['나','','','고민 중']),seats=make('div','support-seats');seats.setAttribute('aria-hidden','true');for(let n=0;n<group.size;n++)seats.append(make('i',''));
  const wishes=make('p','support-group-wishes');row.append(heading,chart.element,note,seats,wishes);groups.append(row);return {row,number,note,chart,seats,wishes};
 });element.append(groups);
 const balance=make('div','promise-balance'),burden=make('strong'),funds=make('span'),risk=make('div','promise-risk');risk.setAttribute('role','img');for(let i=0;i<3;i++)risk.append(make('i',''));balance.append(burden,risk,funds);if(!compact)element.append(balance);
 const foot=make('small','support-disclaimer','물어본 답을 보고 예상한 거야. 고민 중인 친구들은 투표할 때 마음이 바뀔 수 있어.');element.append(foot);
 if(collapsible){
  const details=make('details','support-details'),summary=make('summary','','친구들 수 · 좋아하는 약속');details.open=!global.matchMedia('(max-width:47.5em)').matches;const how=make('details','campaign-howto');how.append(make('summary','','어떻게 하면 돼?'));for(const line of ['① 찾아가면 '+(person.stats.illness>0?'정신병':'압박')+' 1. 대신 좋아하는 약속을 알 수 있어.','② 물어본 모임은 카드의 ?가 숫자로 바뀌어. +는 좋아해, −는 싫어해.','③ 약속 세 개를 골라 보여 주고, 다른 친구들 얘기도 들어 봐.','④ 마지막으로 고친 뒤 투표해. 물어봤다고 무조건 내 편은 아니야.'])how.append(make('p','',line));details.append(summary,how,legend,groups,balance,foot);element.append(details);
 }
 function update(ids,response){
  const f=E.forecast(person,ids,response),names=[...f.candidates.map((c,i)=>i===0?'나':c.name),'고민 중'];total.textContent=f.pollShares[0]+'%';range.textContent='고민 중 '+f.undecided+'%';overall.update(f.pollShares,names);legend.replaceChildren();
  names.forEach((name,i)=>{const token=make('span','candidate-key-'+i);token.append(make('i','candidate-color-'+i),document.createTextNode(name+' '+f.pollShares[i]+'%'));legend.append(token);});
  f.rows.forEach((r,g)=>{const view=rows[g];view.row.classList.toggle('is-heard',r.known);view.number.textContent=r.known?r.pollShares[0]+'%':Math.floor(r.low*(100-r.undecided)/100)+'–'+Math.ceil(r.high*(100-r.undecided)/100)+'%';view.note.textContent=r.known?'● 직접 물어봤어':'○ 아직 안 물어봤어';const wish=E.wishes(person,r.group.id);view.wishes.hidden=!wish;view.wishes.textContent=wish?'좋아해: '+wish.likes.map(x=>x.name).join(' · ')+' / 별로야: '+wish.dislikes.name:'';view.chart.update(r.pollShares,names);
   const expected=r.pollShares.map(v=>v*r.group.size/100),counts=expected.map(Math.floor),order=expected.map((v,i)=>({i,f:v-counts[i]})).sort((a,b)=>b.f-a.f);for(let n=r.group.size-counts.reduce((a,b)=>a+b,0),i=0;i<n;i++)counts[order[i].i]++;
   let seat=0;counts.forEach((count,c)=>{for(let n=0;n<count;n++)view.seats.children[seat++].className='candidate-color-'+c;});
  });burden.textContent='허락이 필요한 약속 '+f.hard+'개';[...risk.children].forEach((e,i)=>e.classList.toggle('is-risk',i<f.hard));risk.setAttribute('aria-label','권한 밖 공약 '+f.hard+'개');funds.textContent='직접 하려면 '+f.cost.toLocaleString('ko-KR')+'원';return f;
 }
 update(E.chosen(person).map(p=>p.id));return {element,update};
}
global.GukminElectionView=Object.freeze({board,bar});
})(window);
