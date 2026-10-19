/* Stable, data-only event builders for life-stage operators. */
(function(global){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
function notice(id,at,title,detail,effects={}){
 return {id,at,layer:'소식 이벤트',title,
  history:{title,detail},result:{effects}};
}
function examPrelude(stage,grade,at,term){
 const key=stage+':'+grade+':'+at,when={turn:{eq:at-1}};
 const first=notice('exam-prelude:'+key,at-1,'시험 기간이 다가옵니다',term+' 시험 일정이 안내되었다. 공부와 휴식을 어떻게 조절할지 생각할 시간이다.');
 const second=notice('exam-classroom:'+key,at-1,'교실의 시험 준비 분위기','친구들이 시험 범위와 공부 방법을 서로 이야기한다.');
 return [{...first,when,history:{...first.history,importance:'major'}},{...second,when,history:{...second.history,display:'hidden'}}];
}
function selection(id,at,title,body,options,kind='일상 선택',presentation=null){
 return {
  event:{id,at,layer:kind==='한방 선택'?'한방 이벤트':'일상 이벤트',title,choice:id},
  choice:{id,layer:kind,title,body,blocksTime:true,
   ...(presentation?{presentation}:{}),
   options:options.map((o,i)=>({
    id:o.id||'choice-'+i,label:o.label,
    ...(o.when?{when:clone(o.when)}:{}),
    ...(o.risk?{risk:String(o.risk)}:{}),
    ...(o.school?{school:clone(o.school)}:{}),
    result:{effects:clone(o.effects||{}),history:{title:o.historyTitle||title,detail:o.detail??'결정이 기록되었다.'},
     ...(o.tags?{tags:clone(o.tags)}:{}),
     ...(o.conditional?{conditional:clone(o.conditional)}:{})}
   }))
  }
 };
}
// Changes describe sustained preparation, not a mood swing caused by clicking a button.
// Different preparation plans trade confidence, energy and scores.
const efforts=[
 {label:'이번엔 공부를 줄이고 쉬는 시간을 확보한다',study:-1,score:-2,stress:-4,health:3,outcome:'풀지 못한 문제도 있었지만 컨디션을 회복했다. 다음 시험 준비를 정리했다.'},
 {label:'핵심 개념만 짧게 복습하고 일찍 잔다',study:1,score:1,stress:-2,health:1,outcome:'기본 문제에서 실수를 줄였다. 낯선 유형은 다음 계획에 남겼다.'},
 {label:'한 달 동안 계획대로 꾸준히 복습한다',study:2,score:3,stress:0,health:0,outcome:'복습한 유형에선 실수가 줄었다. 어려운 문제는 끝까지 고민했다.'},
 {label:'기출문제와 오답을 집중적으로 정리한다',study:3,score:5,stress:2,health:0,outcome:'오답을 다시 풀면서 실수를 잡았다. 다른 과목을 위한 시간은 줄었다.'},
 {label:'남은 기간 공부량을 크게 늘린다',study:4,score:6,stress:6,health:-2,outcome:'준비한 문제는 많이 맞혔다. 대신 다른 일정은 취소했고 피로가 쌓였다.'}
];
function exam(stage,age,grade,at,name,type='school'){
 const id=stage+':'+grade+':'+name.replaceAll(/[^a-zA-Z0-9가-힣]/g,'-');
 const score=type==='mock'?'exam':'schoolScore';
 return selection(id,at,age+'세 · '+grade+'학년 '+name,'해당 시험에 얼마나 시간과 에너지를 투자할까?',
  efforts.map((effort,i)=>({
    id:'effort-'+i,label:effort.label,tags:['assessment'],
    effects:{stats:{study:effort.study,...Object.fromEntries(Object.entries({[score]:effort.score,stress:effort.stress,health:effort.health}).filter(([,value])=>value!==0))}},
    conditional:[
     {when:{stats:{study:{gte:80}}},result:{effects:{stats:{[score]:4}}}},
     {when:{all:[{stats:{study:{gte:60}}},{not:{stats:{study:{gte:80}}}}]},result:{effects:{stats:{[score]:2}}}}
    ],
    detail:name+'을 치렀다. '+effort.outcome
  })),'한방 선택',{type:'exam',stage,grade,age,term:name,category:type});
}
// Alternative scripts share one event ID. The timeline selects exactly one at opening.
function branch(entry,scenarios){
 if(!entry?.choice||!Array.isArray(scenarios)||!scenarios.length)throw new Error('시나리오 슬롯 정의 오류');
 entry.choice.variants=scenarios.map(scenario=>{
  const options=selection(entry.choice.id,entry.event.at,scenario.title||entry.choice.title,
   scenario.body,scenario.options,entry.choice.layer).choice.options;
  return {id:scenario.id,priority:scenario.priority||0,...(scenario.when?{when:clone(scenario.when)}:{}),
   title:scenario.title||entry.choice.title,body:scenario.body,options};
 });
 return entry;
}
function pack(...parts){
 const events=[],choices=[];
 for(const p of parts.flat(Infinity)){
  if(!p)continue;
  if(p.event){events.push(p.event);choices.push(p.choice);}
  else if(p.id&&p.layer)events.push(p);
  else if(p.events){events.push(...p.events);choices.push(...p.choices||[]);}
 }
 return {events,choices};
}
global.GukminStory=Object.freeze({notice,selection,branch,exam,examPrelude,pack});
})(window);
