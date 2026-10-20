/* University-admission story, ending at the college entrance boundary. No adult campus simulation. */
(function(global){
'use strict';
const S=global.GukminStory;
const groups=[
 {min:82,id:'top',early:[
  ['stretch','서울대학교 인문계열',94,80],['fit','연세대학교 사회과학계열',86,65],['safe','중앙대학교 인문계열',78,0]],
  regular:[['stretch','서울대학교 인문계열',95],['fit','고려대학교 인문계열',86],['safe','경희대학교 인문계열',77]]},
 {min:66,id:'upper',early:[
  ['stretch','성균관대학교 인문계열',83,67],['fit','건국대학교 사회과학계열',72,0],['safe','국민대학교 인문계열',62,0]],
  regular:[['stretch','성균관대학교 사회과학계열',85],['fit','동국대학교 인문계열',73],['safe','숭실대학교 인문계열',62]]},
 {min:49,id:'middle',early:[
  ['stretch','단국대학교 인문계열',72,0],['fit','경기대학교 인문계열',58,0],['safe','수원대학교 인문사회계열',46,0]],
  regular:[['stretch','단국대학교 인문계열',72],['fit','가천대학교 인문계열',58],['safe','강남대학교 인문계열',46]]},
 {min:0,id:'open',early:[
  ['stretch','인천대학교 인문계열',59,0],['fit','대진대학교 인문사회계열',43,0],['safe','동서울대학교 실무계열',27,0]],
  regular:[['stretch','인천대학교 인문계열',61],['fit','대진대학교 인문사회계열',43],['safe','동서울대학교 실무계열',27]]}
];
// All numbers here are *fictional game difficulty points*, never university cutoffs.
const tiers=['상향 도전','적정 지원','안정 지원'];
const costs=[{stress:5,study:-2},{stress:2},{stress:0}];
const attributeNames={
 admissionAttempts:{label:'입시 응시 회차',hidden:true},
 admissionRoute:{label:'원서 경로',hidden:true},
 earlyChoice:{label:'수시 지원처',hidden:true},earlyStatus:{label:'수시 판정',hidden:true},earlyOffer:{label:'수시 합격 대학',hidden:true},
 regularChoice:{label:'정시 지원처',hidden:true},regularStatus:{label:'정시 판정',hidden:true},regularOffer:{label:'정시 합격 대학',hidden:true},
 admissionDestination:{label:'졸업 뒤 진로',hidden:true},csatSubmitted:{label:'수능 제출',hidden:true},
 highFinalSubmitted:{label:'내신 제출',hidden:true}
};
const copy=x=>JSON.parse(JSON.stringify(x));
function event(pack,entry,when){
 if(when)entry.event.when=copy(when);
 pack.events.push(entry.event);pack.choices.push(entry.choice);return entry;
}
function notice(pack,entry,when){
 if(when)entry.when=copy(when);
 pack.events.push(entry);return entry;
}
function option(id,label,detail,effects={},extras={}){
 return {id,label,detail,effects,...extras};
}
function admissionOptions(candidates,metric,key,type,cycle){
 return candidates.map(([risk,name,score,minimum],index)=>{
  const id=cycle+'-'+type+'-'+risk+'-'+name.replaceAll(/\s+/g,'');
  return option(id,name,
   name+'에 원서를 접수했다. 결과는 아직 모른다. 이제 합격 발표를 기다린다.',
   {attributes:{[key]:id,[type+'Status']:'pending'},stats:Object.fromEntries(Object.entries(costs[index]).filter(([,n])=>n!==0))},
   {school:{name,typeLabel:tiers[index]+' · 게임 판정선 '+score+(minimum?' · 수능 기준 '+minimum+' 이상':''),gameTarget:score,kind:type,scoreMetric:metric},
    risk:index===0?'가장 높은 성취가 필요하며, 떨어지면 이 원서의 기회를 잃음':index===1?'합격 여부는 누적 성적과 준비 상태에 달림':'안정성을 택하는 대신 높은 목표의 기회를 포기',
    outlook:'게임 난도는 실제 입학 성적이나 공식 합격선이 아님'});
 });
}
function board(pack,prefix,at,type,when){
 const isEarly=type==='early';
 const metric=isEarly?'schoolScore':'exam';
 const key=isEarly?'earlyChoice':'regularChoice';
 const x=S.selection(prefix+':'+type+'-application',at,isEarly?'수시 대학 지원서':'정시 대학 지원서',
  isEarly?'학생부와 전형 요건을 확인했다. ==수능 전에 원서를 접수한다.== 한 학교에 집중하는 게임용 축약이다.':
  '수능 성적표가 나왔다. 이번 원서는 ==정시==다. 학교·전공마다 반영 방식이 다르며 여기에 나온 난도는 게임 규칙이다.',
  admissionOptions(groups.at(-1)[type],metric,key,type,prefix)
   .concat([option(prefix+'-skip','이번 원서는 쓰지 않는다','이번 차례 지원하지 않았다. 다른 진로를 검토하기로 했다.',
    {attributes:{[key]:'skip',[type+'Status']:'skipped'}})]),
  '한방 선택',{type:'university',category:type,gradeMetric:metric,term:isEarly?'수시 지원':'정시 지원'});
 event(pack,x,when);
 x.choice.variants=groups.map((group,i)=>({
  id:prefix+'-'+type+'-'+group.id,priority:(groups.length-i)*10,
  when:{stats:{[metric]:{gte:group.min}}},
  title:isEarly?'수시 대학 지원서':'정시 대학 지원서',
  body:x.choice.body,
  options:S.selection(prefix+':temp',at,'','',
   admissionOptions(group[type],metric,key,type,prefix)
    .concat([option(prefix+'-skip','이번 원서는 쓰지 않는다','대학 지원을 하지 않고 다음 기회를 생각했다.',
      {attributes:{[key]:'skip',[type+'Status']:'skipped'}})]),'한방 선택').choice.options
 }));
 // Outcome is deferred to its announcement event. History and attributes remain deterministic.
 const decision=S.notice(prefix+':'+type+'-result',isEarly?at+3:at+1,
  isEarly?'수시 합격자 발표':'정시 합격자 발표',
  '대학별 모집요강과 선발 방식은 서로 다르다. 게임은 선택한 지원 한 건의 결과만 판정한다.');
 const outcomes=[];
 for(const group of groups)for(const [risk,name,score,minimum=0] of group[type]){
  const id=prefix+'-'+type+'-'+risk+'-'+name.replaceAll(/\s+/g,'');
  const required={all:[{attributes:{[key]:id}},{stats:{[metric]:{gte:score}}},
   ...(isEarly&&minimum?[{stats:{exam:{gte:minimum}}}]:[])]};
  outcomes.push({when:required,result:{
   effects:{attributes:{[type+'Status']:'accepted',[type+'Offer']:name}},
   history:{title:name+' 합격',detail:'지원했던 '+name+'에서 합격 소식이 도착했다. 도전이 결과로 이어졌다.',importance:'major'}}});
  outcomes.push({when:{all:[{attributes:{[key]:id}},{not:required}]},result:{
   effects:{attributes:{[type+'Status']:'failed'}},
   history:{title:name+' 불합격',detail:'이번 원서의 결과는 불합격이었다. 지원 난도와 준비한 성적 사이에 간격이 남았다. 다음 기회가 사라진 것은 아니다.',importance:'major'}}});
 }
 outcomes.push({when:{attributes:{[key]:'skip'}},result:{
  effects:{attributes:{[type+'Status']:'skipped'}},
  history:{title:'원서를 접수하지 않았다',detail:'이번 전형에는 지원하지 않았다. 선택하지 않은 길도 진로 기록에 남았다.'}}});
 decision.result.conditional=outcomes;
 notice(pack,decision,when);
 return x;
}
function cycle(pack,prefix,base,second=false){
 const gate=second?{attributes:{admissionDestination:'retry'}}:null;
 const start=(base); // base 79 first cycle, 89 second cycle
 const withGate=more=>gate&&more?{all:[gate,more]}:gate||more||undefined;
 if(!second){
  event(pack,S.selection(prefix+':final-report',start,'최종 내신 성적표 제출',
    '고등학교 3년 동안 쌓인 평가 기록을 확인했다. ==제출하기==를 누르면 이번 진학에 쓰일 최종 등급이 공개된다.',
    [option('submit','최종 내신 제출하기','학생부에 기록된 성적을 최종 확인했다. 수시 지원을 준비할 수 있다.',
      {attributes:{highFinalSubmitted:true}})],
    '한방 선택',{type:'grade-seal',category:'school',term:'최종 내신 통지표'}));
 }
 const routeAt=second?base:base+1;
 const route=S.selection(prefix+':route',routeAt,second?'두 번째 원서철':'대입 진로 선택',
  second?'한 번의 입시를 경험한 뒤 다시 원서를 마주했다. ==재도전에도 기회비용은 있다.==':'수시 원서는 수능 전에, 정시는 수능 이후에 접수한다. 지금은 ==어떤 길을 먼저 택할지== 결정할 때다.',
  [
   option('early','수시 지원','학생부를 중심으로 지원을 준비한다. 수시 합격 시 정시에는 지원할 수 없다.',
    {attributes:{admissionRoute:'early',admissionAttempts:second?2:1,earlyStatus:null,regularStatus:null,earlyOffer:null,regularOffer:null},stats:{stress:2,study:-1}},
    {risk:'면접·서류 준비와 수능 대비 시간을 나눠 써야 함'}),
   option('regular','정시 집중','수시 원서를 접지 않고 수능까지 준비한다. 정시까지 기회를 남기지만 시험 하루의 부담이 크다.',
    {attributes:{admissionRoute:'regular',admissionAttempts:second?2:1,earlyStatus:null,regularStatus:null,earlyOffer:null,regularOffer:null},stats:{exam:3,stress:4,health:-1}},
    {risk:'수능이 기대에 못 미치면 수시 합격 기회도 없음'}),
   option('employment','바로 사회 진출 준비','대학 원서를 쓰지 않고 실무 경험과 구직 준비에 시간을 쓴다.',
    {attributes:{admissionRoute:'employment',admissionAttempts:second?2:1,earlyStatus:null,regularStatus:null,earlyOffer:null,regularOffer:null},stats:{stress:-4,study:-2,relations:1}},
    {risk:'당장 입시 부담은 줄지만 학위가 필요한 직종은 지원이 제한됨'}),
   ...(second?[option('repeat','N수 이어가기','올해 응시를 건너뛰고 추가 준비 기간을 선택한다.',
    {attributes:{admissionRoute:'repeat',admissionAttempts:2,admissionDestination:'more-prep'},stats:{study:2,stress:4}},
    {risk:'입시 결과 없이 준비 기간과 생활비 부담이 늘어남'})]:[])
  ],'한방 선택',{type:'admission-route',term:second?'재도전 진로 선택':'대입 진로 선택'});
 event(pack,route,withGate());
 const earlyGuard=withGate({attributes:{admissionRoute:'early'}});
 board(pack,prefix,routeAt+1,'early',earlyGuard);
 const preparation=S.selection(prefix+':last-week',routeAt+2,'수능을 앞둔 마지막 일주일',
   '수험표와 시험장 안내가 나왔다. 남은 시간은 일주일. ==새 단원을 끝내기엔 짧지만 생활을 조정하기엔 충분하다.==',
   [
    option('cram','빈출 유형을 끝까지 붙잡는다','남은 기출문제를 더 풀었다. 풀어 본 유형에서는 자신이 붙었지만 피로가 상당히 쌓였다.',
     {stats:{exam:7,stress:8,health:-3,study:1}},
     {risk:'체력과 집중력을 소모해 당일 컨디션이 나빠질 수 있음'}),
    option('target','틀린 문제를 추려서 반복한다','오답 원인을 정리하고 아는 문제의 실수를 줄였다. 덜 익숙한 유형에는 손을 대지 못했다.',
     {stats:{exam:4,study:2,stress:2}},
     {risk:'새롭거나 낯선 유형에 대비할 시간은 부족함'}),
    option('recover','공부를 줄이고 수면 리듬을 회복한다','평소 자던 시간에 잠들고 아침에 일어났다. 추가 문제량은 줄었지만 시험장에 갈 준비는 됐다.',
     {stats:{exam:1,stress:-7,health:5,study:-1}},
     {risk:'막판 점수 상승 가능성보다 컨디션을 우선함'})
   ]);
 event(pack,preparation,withGate({not:{attributes:{admissionRoute:'employment'}}}));
 const csat=S.selection(prefix+':csat',routeAt+3,'대학수학능력시험',
  '시험이 끝났다. 마지막 OMR을 넘기고 성적 발표를 기다린다. ==지금까지 쌓인 수능 역량과 건강 상태가 결과에 반영된다.==',
  [option('submit','응시 완료 · 답안 제출하기','수능 응시를 마쳤다. 결과는 성적 통지표에서 확인한다.',
   {attributes:{csatSubmitted:true},stats:{stress:2}},
   {conditional:[
     {when:{attributes:{preExamStrategy:'exam'}},result:{effects:{stats:{exam:3,stress:2}}}},
     {when:{all:[{stats:{stress:{gte:85}}},{not:{traits:['인내심']}}]},result:{effects:{stats:{exam:-5}}}},
     {when:{stats:{health:{lte:35}}},result:{effects:{stats:{exam:-4}}}}
   ]})],
  '한방 선택',{type:'grade-seal',category:'mock',term:'수능 성적 통지표'});
 event(pack,csat,withGate({not:{attributes:{admissionRoute:'employment'}}}));
 // The university board opens only if there was no successful early admission.
 const regularGuard=withGate({any:[{attributes:{admissionRoute:'regular'}},{attributes:{earlyStatus:'failed'}},{attributes:{earlyStatus:'skipped'}}]});
 board(pack,prefix,routeAt+5,'regular',regularGuard);
 const done=S.selection(prefix+':destination',routeAt+7,'졸업 이후의 진로',
  '입시 결과가 나왔다. ==이번에는 합격한 대학이 없다.== 다음 선택은 새로운 시간을 요구한다.',
  [
   option('retry','한 번 더 입시에 도전한다','합격하지 못한 결과를 받아들이고, 다음 해 입시 준비를 선택했다.',
    {attributes:{admissionDestination:'retry'},stats:{stress:4,study:2,health:-1}},
    {risk:'준비 기간·생활비·불확실성을 다시 감수해야 함'}),
   option('employment','바로 사회로 나간다','입학 대신 구직과 실무 경험을 선택했다. 다른 방식으로 경력을 시작할 계획이다.',
    {attributes:{admissionDestination:'employment'},stats:{stress:-3,study:-2,relations:2}},
    {risk:'일부 직업에서 학위 요건을 충족하지 못함'})
  ],'한방 선택',{type:'admission-finish',term:'진로 확정'});
 done.choice.variants=[
  {id:prefix+'-offer-early',priority:30,when:{attributes:{earlyStatus:'accepted'}},title:'수시 합격 이후의 선택',body:'수시 합격 통보가 도착했다. ==등록 여부와 관계없이 이 입시에서 정시 지원은 불가하다.==',
   options:S.selection('tmp',0,'','',[
    option('college','합격한 대학에 진학한다','수시 합격 대학 진학을 선택했다.',{attributes:{admissionDestination:'college'}}),
    option('employment','대학에 등록하지 않고 사회에 진출한다','합격했지만 진학 대신 다른 생활을 선택했다.',{attributes:{admissionDestination:'employment'},stats:{study:-2,stress:-2}},
     {risk:'수시 합격으로 이미 정시 지원 자격은 없다'}),
    option('retry','등록하지 않고 다시 입시를 준비한다','합격을 포기하고 다른 목표를 위해 한 해를 다시 쓰기로 했다.',{attributes:{admissionDestination:'retry'},stats:{stress:5,health:-2}},
     {risk:'합격 기회 포기와 추가 준비 부담을 모두 감수'})
   ],'한방 선택').choice.options},
  {id:prefix+'-offer-regular',priority:20,when:{attributes:{regularStatus:'accepted'}},title:'정시 합격 이후의 선택',body:'정시 합격 통보가 도착했다. 이제 등록 여부를 결정해야 한다.',
   options:S.selection('tmp2',0,'','',[
    option('college','합격한 대학에 진학한다','정시 합격 대학에 진학하기로 결정했다.',{attributes:{admissionDestination:'college'}}),
    option('employment','대학 대신 사회 진출을 택한다','합격을 포기하고 일을 알아보기 시작했다.',{attributes:{admissionDestination:'employment'},stats:{study:-2,stress:-2}},
     {risk:'다시 진학하려면 이후 입시 절차를 새로 밟아야 함'}),
    option('retry','다음 입시에서 더 높은 목표를 노린다','합격을 포기하고 상향 목표를 위해 다시 준비하기로 했다.',{attributes:{admissionDestination:'retry'},stats:{stress:5,health:-2}},
     {risk:'확보했던 대학 자리를 포기함'})
   ],'한방 선택').choice.options},
  {id:prefix+'-work',priority:10,when:{attributes:{admissionRoute:'employment'}},title:'사회 진출을 준비한다',body:'입시 대신 실무 현장과 구직 기회를 알아보기로 했다. 시작은 가볍지 않지만 다른 선택지가 사라진 것도 아니다.',
   options:S.selection('tmp3',0,'','',[
    option('work','취업과 실무 준비를 이어간다','일자리 정보를 찾아보며 사회생활을 준비한다.',{attributes:{admissionDestination:'employment'},stats:{relations:2,stress:1}},
      {risk:'진학으로 얻을 수 있는 교육과 학위는 당장 확보하지 못함'}),
    option('retry','대학 입시에 다시 도전한다','취업 준비 대신 입시 재도전을 선택했다.',{attributes:{admissionDestination:'retry'},stats:{study:2,stress:3}},
      {risk:'진학 불확실성과 시간·생활비 부담'})
   ],'한방 선택').choice.options}
 ];
 event(pack,done,withGate({not:{attributes:{admissionRoute:'repeat'}}}));
 return done;
}
global.GukminDirector.register({
 id:'admissions',when:{phase:'high'},generate:()=>{
  const pack={events:[],choices:[],attributes:copy(attributeNames)};
  cycle(pack,'admission:first',79,false);
  notice(pack,S.notice('admission:repeat-year',88,'다시 시작한 입시 준비',
   '고등학교는 끝났지만 입시는 한 번 더 준비하기로 했다. 작년 결과와 놓쳤던 단원을 다시 살피고, 생활비와 공부 시간을 새로 조정했다.',
   {attributes:{age:19,admissionAttempts:2},stats:{stress:3,study:1}}),
   {attributes:{admissionDestination:'retry'}});
  cycle(pack,'admission:second',89,true);
  notice(pack,S.notice('admission:retry-graduation',99,'고등학교와 입시 기록을 정리하다',
   '다시 준비한 입시도 마쳤다. 지원 결과와 쌓은 경험을 기록하고 대학 또는 사회로 나아갈 준비를 한다.',
   {attributes:{age:19,job:'고교 졸업'},schools:[{kind:'high',status:'graduated'}]}),
   {attributes:{admissionAttempts:2}});
  return pack;
 }
});
})(window);
