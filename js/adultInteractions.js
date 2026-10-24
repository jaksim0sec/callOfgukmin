/* Only adult-life interactive surfaces. The shared sheet retains selection and settlement. */
(function(g){
'use strict';
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const optionButtons=(list,choice)=>choice.options.map((option,index)=>({option,button:[...list.querySelectorAll('.inline-choice')][index]}));
function proxies(list,choice){
 const rows=optionButtons(list,choice);
 const current=()=>rows.find(r=>r.button?.getAttribute('aria-pressed')==='true')?.option.id||'';
 const select=id=>{const r=rows.find(x=>x.option.id===id);if(!r||!r.button||r.button.disabled)return false;r.button.click();return true;};
 return {current,select,rows};
}
function addAction(host,title,description,id,api){
 const b=el('button','adult-interact-action');b.type='button';b.dataset.optionId=id;b.disabled=!api.rows.find(r=>r.option.id===id&&!r.button?.disabled);
 b.append(el('strong','',title));
 if(description)b.append(el('small','',description));
 b.addEventListener('click',()=>{if(api.select(id))refresh(host,api.current());});
 host.append(b);return b;
}
function refresh(root,id){for(const button of root.querySelectorAll('[data-option-id]')){const active=button.dataset.optionId===id;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));}}
function bubble(sender,message,mine=false){
 const row=el('div','adult-msg'+(mine?' is-me':''));if(!mine)row.append(el('span','adult-msg-avatar',sender.slice(-1)));
 const stack=el('div','adult-msg-body');
 if(!mine)stack.append(el('small','adult-msg-name',sender));
 stack.append(el('p','adult-msg-text',message.text||''));
 stack.append(el('small','adult-msg-time',message.time||''));
 row.append(stack);return row;
}
function chat(host,view,api){
 host.classList.add('adult-chat-ui');const head=el('header','adult-chat-head');
 const icon=el('span','adult-chat-icon','↗');icon.setAttribute('aria-hidden','true');
 const title=el('div','');title.append(el('strong','',view.room||'메시지'),el('small','',view.subtitle||'대화 기록'));
 head.append(icon,title,el('span','adult-chat-state','대화 중'));host.append(head);
 const timeline=el('div','adult-chat-timeline');timeline.append(el('div','adult-chat-date',view.date||'최근'));
 for(const m of view.messages||[])timeline.append(bubble(m.sender||'상대',m));
 const draft=el('div','adult-chat-preview');draft.setAttribute('aria-live','polite');draft.hidden=true;timeline.append(draft);
 host.append(timeline);
 const choices=el('section','adult-chat-replies');choices.append(el('strong','adult-section-title','답장을 선택하세요'));
 for(const row of api.rows){
  const id=row.option.id;if(row.button.disabled)continue;
  addAction(choices,view.playerMessages?.[id]??row.option.label,row.option.outlook,id,api);
 }
 host.append(choices);
 const sync=()=>{const id=api.current(),message=view.playerMessages?.[id];draft.replaceChildren();
  if(id){draft.append(el('small','adult-preview-label','전송 전 미리보기 · 아직 보내지지 않음'));if(message!==null)draft.append(bubble('나',{text:message??api.rows.find(r=>r.option.id===id)?.option.label,time:'전송 대기'},true));}
  draft.hidden=!id;refresh(host,id);
 };
 choices.addEventListener('click',sync);sync();
}
function course(host,view,api){
 host.classList.add('adult-course-ui');
 const top=el('header','adult-course-head');top.append(el('span','adult-course-symbol','C'),el('div',''));
 top.lastChild.append(el('strong','','1학기 수강신청'),el('small','','시간표 편집 · 남은 자리와 중복 시간을 확인'));
 host.append(top);
 const grid=el('div','adult-schedule');const days=['월','화','수','목','금'];
 for(const d of days)grid.append(el('span','adult-schedule-day',d));
 for(const slot of view.slots||[]){
  const day=el('div','adult-schedule-slot'+(slot.conflict?' is-conflict':''));day.style.gridColumn=String(slot.column);
  day.append(el('small','',slot.time),el('strong','',slot.title),el('span','',slot.note));grid.append(day);
 }
 host.append(grid);
 const status=el('section','adult-course-status');status.append(el('strong','','전공 필수 · 정원 마감'),el('p','','동시간대에 필수 수업과 다른 일정이 겹쳐 있습니다. 정원 마감은 단순 새로고침으로 해소되지 않습니다.'));host.append(status);
 const opts=el('div','adult-course-solutions');opts.append(el('strong','adult-section-title','이번 학기 시간표 확정 방식'));
 for(const row of api.rows){if(!row.button.disabled)addAction(opts,row.option.label,row.option.outlook,row.option.id,api);}
 host.append(opts);refresh(host,api.current());
}
function evidence(host,view,api){
 host.classList.add('adult-evidence-ui');
 const mast=el('div','adult-evidence-mast');mast.append(el('span','adult-evidence-mark','FILE'),el('div',''));
 mast.lastChild.append(el('strong','',view.title||'자료 검토'),el('small','',view.subtitle||'확인한 자료만 제출할 수 있습니다'));
 host.append(mast);
 const info=el('p','adult-evidence-instruction',view.instruction||'증거의 출처와 신뢰도를 비교해 보세요.');host.append(info);
 const docs=el('div','adult-evidence-docs');const checked=new Set();
 const restored=api.current(),mapping=view.mapping||{};
 if(restored===mapping.proof)for(const key of view.required||[])checked.add(key);
 if(restored===mapping.collab)checked.add(view.partner||'partner');
 (view.documents||[]).forEach((d,i)=>{
  const label=el('label','adult-evidence-document');const checkbox=el('input','');checkbox.type='checkbox';checkbox.value=d.id||String(i);
  checkbox.checked=checked.has(checkbox.value);label.append(checkbox,el('div',''));
  label.lastChild.append(el('strong','',d.title),el('small','',d.detail));
  checkbox.addEventListener('change',()=>{if(checkbox.checked)checked.add(checkbox.value);else checked.delete(checkbox.value);update();});
  docs.append(label);
 });
 host.append(docs);
 const summary=el('section','adult-evidence-summary'),result=el('strong','','');const note=el('p','',''),apply=el('button','adult-evidence-apply','');apply.type='button';
 summary.append(el('small','','선택한 자료로 가능한 행동'),result,note,apply);host.append(summary);
 function update(){
  const ids=view.mapping||{},hasPrimary=(view.required||[]).every(x=>checked.has(x)),hasPartner=checked.has(view.partner||'partner');
  const id=hasPrimary?ids.proof:hasPartner?ids.collab:ids.pass;
  const row=api.rows.find(r=>r.option.id===id);const usable=!!row&&!row.button.disabled;
  result.textContent=row?.option.label||'이 선택은 진행할 수 없습니다';
  note.textContent=hasPrimary?'근거 자료가 충분해 공식 절차를 선택할 수 있습니다.':hasPartner?'협업자의 증언을 중심으로 함께 처리합니다.':checked.size?'확인 자료가 충분하지 않아 다른 조치를 우선합니다.':'자료를 제출하지 않고 다른 대응을 택합니다.';
  apply.textContent='이 대응 방식을 선택';apply.disabled=!usable;apply.onclick=()=>{if(api.select(id))refresh(host,id);};
  apply.dataset.optionId=id;
  refresh(host,api.current());
 }
 update();
}
function map(host,view,api,persona){
 host.classList.add('adult-interactive-map');const stage=el('div','adult-map-view');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 260 360');svg.setAttribute('aria-label','대한민국 활동 거점 위치 개략도');svg.setAttribute('role','img');svg.classList.add('adult-map-land');
 const shape=document.createElementNS('http://www.w3.org/2000/svg','path');
 shape.setAttribute('d','M91 43 L111 32 136 40 152 34 169 46 179 67 199 71 203 91 191 107 204 130 217 145 216 165 230 185 216 201 215 229 201 245 211 263 195 279 175 274 161 286 140 268 126 281 108 272 94 256 77 254 68 238 52 220 56 197 44 181 56 158 51 136 64 120 57 104 72 94 70 75 84 66 Z');svg.append(shape);
 const island=document.createElementNS('http://www.w3.org/2000/svg','ellipse');island.setAttribute('cx','113');island.setAttribute('cy','324');island.setAttribute('rx','25');island.setAttribute('ry','9');svg.append(island);stage.append(svg);
 const details=el('section','adult-map-detail');const regionName=el('strong','',''),npc=el('small','',''),issue=el('p','',''),cost=el('p','adult-map-cost',''),apply=el('button','adult-map-apply','거점 선택');apply.type='button';
 details.append(el('small','','활동 거점 미리보기'),regionName,npc,issue,cost,apply);let current=view.current||view.regions[0]?.id;
 function preview(id){
  current=id;const r=view.regions.find(r=>r.id===id);if(!r)return;
  for(const b of stage.querySelectorAll('.adult-map-pin'))b.classList.toggle('is-preview',b.dataset.regionId===id);
  const action=api.rows.find(row=>row.option.id==='visit:'+id);const unlocked=!!action&&!action.button.disabled;
  regionName.textContent=r.name;npc.textContent=r.npc;issue.textContent=r.issue;
  cost.textContent=!unlocked?'이 거점은 아직 활동 조건이 열리지 않았습니다.':id===view.current?'현재 활동 중 · 이동 비용 없음':'거점 이동 준비 1개월 · 100,000원';
  apply.disabled=!unlocked;apply.textContent=id===view.current?'현재 지역 유지 선택':'이 거점을 선택';apply.onclick=()=>{if(api.select('visit:'+id))refresh(host,'visit:'+id);};
 }
 for(const r of view.regions){
  const pin=el('button','adult-map-pin',r.name.split(' ').at(-1));pin.type='button';pin.dataset.regionId=r.id;pin.style.left=r.x+'%';pin.style.top=r.y+'%';
  if(r.id===view.current)pin.classList.add('is-current');
  pin.setAttribute('aria-label',r.name+' 활동 정보 보기');pin.addEventListener('click',()=>preview(r.id));stage.append(pin);
 }
 const caption=el('small','adult-map-disclaimer','활동 거점 위치를 보여주는 게임용 개략도 · 선거구 경계가 아닙니다');
 host.append(stage,details,caption);
 const quick=el('div','adult-map-list');quick.append(el('strong','adult-section-title','지역 바로 찾기'));
 for(const r of view.regions){const b=el('button','adult-map-list-button',r.name);b.type='button';b.addEventListener('click',()=>preview(r.id));quick.append(b);}
 const back=el('button','adult-map-list-button','현재 지역 유지하고 돌아가기');back.type='button';back.dataset.optionId='map-back';back.addEventListener('click',()=>{if(api.select('map-back'))refresh(host,'map-back');});quick.append(back);
 host.append(quick);preview(view.current||view.regions[0]?.id);refresh(host,api.current());
}
function decorate({dialog,list,choice,persona,shell,group}){
 const v=choice.presentation?.interaction;if(!v||!['chat','course','evidence','map'].includes(v.kind))return false;
 const api=proxies(list,choice);dialog.dataset.adultInteraction=v.kind;
 list.classList.add('adult-hidden-choices');group.classList.add('adult-hidden-original');
 const host=el('section','adult-interact-root');host.setAttribute('aria-label',v.title||'성인기 상호작용');
 group.before(host);
 if(v.kind==='chat')chat(host,v,api);
 if(v.kind==='course')course(host,v,api);
 if(v.kind==='evidence')evidence(host,v,api);
 if(v.kind==='map')map(host,v,api,persona);
 return true;
}
function reward({body,presentation,label}){
 const view=presentation?.interaction;if(!view)return;
 const opts=view.labels||{},id=Object.keys(opts).find(key=>opts[key]===label);
 if(view.kind==='chat'){
  const thread=el('section','adult-chat-receipt'),head=el('strong','','대화 기록');thread.append(head);
  const sent=view.playerMessages?.[id];if(sent!==null)thread.append(bubble('나',{text:sent||label,time:'전송됨 · 읽음'},true));
  for(const reply of view.responses?.[id]||[])thread.append(bubble(reply.sender||view.actor||'상대',reply));
  body.prepend(thread);
 }else if(view.kind==='evidence'){const receipt=el('p','adult-evidence-receipt','제출 방식이 기록되었습니다. 다음 사건에서 이 기록이 반영됩니다.');body.prepend(receipt);}
}
g.GukminAdultInteractions=Object.freeze({decorate,reward});
})(window);