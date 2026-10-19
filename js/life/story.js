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
 return [{...first,when,history:{...first.history,importance:'major'}},{...second,when}];
}
function selection(id,at,title,body,options,kind='일상 선택',presentation=null){
 return {
  event:{id,at,layer:kind==='한방 선택'?'한방 이벤트':'일상 이벤트',title,choice:id},
  choice:{id,layer:kind,title,body,blocksTime:true,
   ...(presentation?{presentation}:{}),
   options:options.map((o,i)=>({
    id:o.id||'choice-'+i,label:o.label,
    ...(o.when?{when:clone(o.when)}:{}),
    ...(o.school?{school:clone(o.school)}:{}),
    result:{effects:clone(o.effects||{}),history:{title:o.historyTitle||title,detail:o.detail||o.label},
     ...(o.tags?{tags:clone(o.tags)}:{}),
     ...(o.conditional?{conditional:clone(o.conditional)}:{})}
   }))
  }
 };
}
const efforts=[
 {label:'아예 준비하지 않고 쉰다',study:-5,score:-8,stress:-5,health:3},
 {label:'최소한만 준비한다',study:0,score:-2,stress:-2,health:1},
 {label:'적당히 꾸준히 준비한다',study:3,score:4,stress:3,health:-1},
 {label:'계획을 세워 집중한다',study:7,score:8,stress:7,health:-3},
 {label:'거의 모든 시간을 투자한다',study:10,score:12,stress:13,health:-6}
];
function exam(stage,age,grade,at,name,type='school'){
 const id=stage+':'+grade+':'+name.replaceAll(/[^a-zA-Z0-9가-힣]/g,'-');
 const score=type==='mock'?'exam':'schoolScore';
 return selection(id,at,age+'세 · '+grade+'학년 '+name,'해당 시험에 얼마나 시간과 에너지를 투자할까?',
  efforts.map((effort,i)=>({
    id:'effort-'+i,label:effort.label,
    effects:{stats:{study:effort.study,[score]:effort.score,stress:effort.stress,health:effort.health}},
    detail:name+' 준비 수준을 선택했다. 학업과 컨디션의 변화가 기록됐다.'
  })),'한방 선택',{type:'exam',stage,grade,age,term:name,category:type});
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
global.GukminStory=Object.freeze({notice,selection,exam,examPrelude,pack});
})(window);
