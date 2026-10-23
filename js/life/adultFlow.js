/* Adult story adapter. Reuses society accounting and the existing timeline. */
(function(g){
'use strict';
if(!g.GukminSociety||!g.GukminAdultStories)throw new Error('성인기 콘텐츠 로드 순서 오류');
const core=g.GukminSociety,story=g.GukminAdultStories;
const A=p=>p.attributes||{};
const regionOptions=p=>story.regions.map(r=>{
 const unlocked=!!(story.flags(p)&r.bit),months=r.id===story.active(p).id?0:1,allowed=unlocked&&(!months||(p.stats.money||0)>=100000);
 return {id:'visit:'+r.id,label:r.name,outlook:r.issue,requirement:!unlocked?'아직 이 지역의 활동 기회가 열리지 않았습니다.':!allowed?'이동 준비비 100,000원이 부족합니다.':'',
  ...(allowed?{}:{when:{turn:{lte:-1}}}),society:{months},result:{societyDecision:{action:'visit:'+r.id}}};
});
const action=(id,label,outlook,months=0)=>({id,label,outlook,society:{months},result:{societyDecision:{action:id}}});
const money=p=>p.stats.money||0;
const effectResult=(title,detail,attributes={},stats={})=>({effects:{attributes,stats},history:{title,detail,importance:'normal'}});
function sceneOption(row,months){
 return {...action(row.id,row.label,row.outlook,row.id.endsWith('defer')?0:months),society:{months:row.id.endsWith('defer')?0:months}};
}
function choice(p){
 const stage=A(p).societyStep||'hub';
 if(stage==='region-map')return {id:'society:line',layer:'일상 선택',blocksTime:true,title:'대한민국 활동 지도',
  body:'실제로 활동할 이야기가 있는 지역 거점만 고른다. 이 지도는 국회의원 선거구가 아니다. 지도만 열거나 이동 후보를 누르는 것은 무료다.',
  presentation:{type:'society-line',stage},options:[...regionOptions(p),action('map-back','현재 지역 유지','이동하지 않고 사회로 돌아간다.')]};
 const old=core.choice(p);
 if(stage==='hub')return {...old,options:[...old.options,action('region-map','대한민국 지도에서 지역 선택','활동 가능한 지역 거점을 확인한다.')]};
 const e=story.select(p,stage);if(!e)return old;
 const keep=['work','business'].includes(stage)?old.options.filter(x=>['back','quit'].includes(x.id)):[];
 return {...old,title:e.title,body:e.body,options:[...e.options.map(x=>sceneOption(x,e.months)),...keep]};
}
function lineChoice(p){
 const stage=A(p).societyStep||'hub';
 if(['hub','ready'].includes(stage))throw new Error('현재 사회 경로가 아님');
 const c=choice(p);
 return {...c,id:'society:line',layer:'일상 선택',presentation:{type:'society-line',stage},options:c.options.filter(x=>x.id!=='back')};
}
function findRow(p,actionId){
 const e=story.select(p,A(p).societyStep||'hub');
 return e?.options.find(x=>x.id===actionId)||null;
}
function merge(base,row,extra={},extraStats={}){
 base.effects??={};base.effects.attributes={...(base.effects.attributes||{}),...(row?.attributes||{}),...extra};
 base.effects.stats={...(base.effects.stats||{})};
 for(const [k,v] of Object.entries({...row?.stats,...extraStats})){
   if(Number.isFinite(v))base.effects.stats[k]=(base.effects.stats[k]||0)+v;
 }
 return base;
}
function decision(p,order,ctx={}){
 const actionId=order.action,a=A(p),stage=a.societyStep||'hub',row=findRow(p,actionId);
 if(actionId==='narrate'){
   const e=story.select(p,stage);
   if(e&&a.societyNarrativePending)return effectResult(e.title,e.teaser,{societyNarrativePending:false});
   return core.decision(p,order,ctx);
 }
 if(actionId==='region-map'){
   if(stage!=='hub')throw new Error('사회 허브에서만 지역 선택');
   return effectResult('지역 활동 지도를 펼쳤다','앞으로 활동할 지역을 살펴본다.',{societyStep:'region-map',societyNarrativePending:true});
 }
 if(actionId==='map-back'){
   if(stage!=='region-map')throw new Error('지역 선택 상태 아님');
   return effectResult('현재 지역을 유지했다','지도에서 활동 거점을 바꾸지 않았다.',{societyStep:'hub',societyNarrativePending:false});
 }
 if(actionId.startsWith('visit:')){
   if(stage!=='region-map')throw new Error('지역 선택 상태 아님');
   const r=story.regions.find(x=>x.id===actionId.slice(6));
   if(!r||!(story.flags(p)&r.bit))throw new Error('해금되지 않은 거점');
   const months=r.id===story.active(p).id?0:1;
   if(months&&money(p)<100000)throw new Error('지역 이동 준비비 부족');
   const total=(a.societyMonths||0)+months;
   return effectResult(r.name+' 활동 시작',r.issue+' · '+(months?'이동 준비 1개월·10만 원을 사용했다.':'현재 지역의 활동을 이어간다.'),
     {adultActivityRegionId:r.id,societyStep:'hub',societyNarrativePending:false,...(months?{societyMonths:total,age:(a.societyAgeBase||p.age)+Math.floor(total/12)}:{})},
     months?{money:-100000}:{});
 }
 if(!row)return core.decision(p,order,ctx); // old frozen scripts and all existing paths.
 if(actionId.startsWith('j-'))return effectResult(row.label,row.outlook,{...row.attributes,societyStep:'career-search',societyNarrativePending:true},row.stats);
 if(actionId.startsWith('i-'))return effectResult(row.label,row.outlook,{...row.attributes,societyStep:'politics',societyNarrativePending:true},row.stats);
 if(actionId.startsWith('c-')){
   if(!(a.collegeScenePhase||0))return effectResult(row.label,row.outlook,{...row.attributes,collegeScenePhase:1,societyStep:'college-year',societyNarrativePending:true},row.stats);
   // The second event of each year settles the original one-year academic unit exactly once.
   const baseAction=/(talk|share|arrange)/.test(actionId)?'network':/(reduce|pass)/.test(actionId)?'part-time':'study';
   const result=core.decision(p,{action:baseAction},ctx);
   merge(result,row,{collegeScenePhase:0});
   result.history={title:result.effects.attributes.collegeStatus==='졸업'?(a.collegeName||'대학')+' 졸업':row.label,
     detail:row.outlook+' '+(result.effects.attributes.collegeCompleted||0)+'/'+(a.collegeYears||0)+'년 이수. '+(result.history?.detail||''),importance:result.effects.attributes.collegeStatus==='졸업'?'major':'normal'};
   return result;
 }
 if(actionId.startsWith('w-')||actionId.startsWith('b-')){
   const old=actionId.startsWith('w-')?'work-'+(row.mode||'team'):'business-'+(row.mode==='expand'?'expand':'local');
   const result=core.decision(p,{action:old},ctx);
   merge(result,row,actionId==='b-road-group'?{adultRegionFlags:story.flags(p)|8}:{},row.bonus?{money:row.bonus}:{});
   if(result.effects.attributes.employmentStatus==='계약 종료'||result.effects.attributes.employmentStatus==='폐업'){
     result.history={...result.history,detail:row.outlook+' '+result.history.detail};
   }else result.history={title:row.label,detail:row.outlook+' '+result.history.detail,importance:'normal'};
   return result;
 }
 if(actionId.startsWith('l-')){
   if(actionId.endsWith('defer'))return effectResult(row.label,row.outlook,{societyStep:'hub',societyNarrativePending:false},row.stats);
   const result=core.decision(p,{action:'community-work'},ctx);
   const stageNo=Math.min(3,(a.adultCommunityIssueStage||0)+1);
   const unlock=actionId==='l-begin-field'?2:actionId==='l-end-track'?4:0;
   merge(result,row,{adultCommunityIssueStage:stageNo,...(unlock?{adultRegionFlags:story.flags(p)|unlock}:{})});
   result.history={title:row.label,detail:story.active(p).npc+' · '+row.outlook+' '+result.history.detail,importance:stageNo===3?'major':'normal'};
   return result;
 }
 return core.decision(p,order,ctx);
}
function chance(p,sector){
 const answer=A(p).adultInterviewAnswer;
 return Math.max(20,Math.min(90,core.chance(p,sector)+(answer==='detail'?4:answer==='change'?-2:0)));
}
// Keep the original deterministic roll; only the current application gets the answer bonus.
const runDecision=decision;
function settledDecision(p,order,ctx={}){
 const result=runDecision(p,order,ctx);
 if(order.action.startsWith('apply-')&&A(p).adultInterviewAnswer){
   const attempt=(A(p).jobAttempts||0)+1,sector=order.action.slice(6);
   const accepted=g.GukminAdmissions.roll(p,'society:job:'+attempt+':'+sector)<chance(p,sector);
   result.effects.attributes.jobAccepted=accepted;
   result.effects.attributes.adultInterviewAnswer='';
   result.history.title=accepted?'채용 제안 도착':'채용 결과 · 불합격';
   result.history.detail=accepted?'지원 이력과 면접 답변을 평가한 채용 제안이 도착했다.':'지원 이력과 면접 답변을 평가했지만 이번에는 합격하지 못했다.';
 }
 return result;
}
g.GukminSociety=Object.freeze({...core,choice,lineChoice,decision:settledDecision,chance,narrative:p=>{
  const e=story.select(p,A(p).societyStep||'hub');return e?{title:e.title,body:e.teaser}:core.narrative(p);
}});
const names={adultRegionFlags:'열린 활동 지역',adultActivityRegionId:'현재 활동 거점',collegeScenePhase:'대학 사건 진행',adultCampusEntry:'수강신청 선택',adultTeamHistory:'팀 프로젝트 대응',adultTeamReview:'동료평가 선택',adultInterviewAnswer:'채용 답변',adultWorkCredit:'업무 공로 대응',adultWorkIssue:'직장 지역 문제',adultShopReview:'가게 악평 대응',adultShopRoad:'상인 공동 대응',adultCommunityIssueStage:'지역 문제 진행',adultCommunityOutcome:'지역 문제 결과',adultPoliticalInvitation:'정치 포럼 초청'};
g.GukminDirector.register({id:'society-story-attributes',generate:()=>({attributes:Object.fromEntries(Object.entries(names).map(([id,label])=>[id,{label,hidden:true}]))})});
})(window);
