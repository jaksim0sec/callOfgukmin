/* Admission cycles reuse one timeline. Draws depend only on the saved birth seed. */
(function(g){
'use strict';
const S=g.GukminStory;
const groups=[
 {min:21,id:'top',early:[['stretch','서울대학교 인문계열',24,20],['fit','연세대학교 사회과학계열',22,16],['safe','중앙대학교 인문계열',20,0]],regular:[['stretch','서울대학교 인문계열',24],['fit','고려대학교 인문계열',22],['safe','경희대학교 인문계열',19]]},
 {min:17,id:'upper',early:[['stretch','성균관대학교 인문계열',21,17],['fit','건국대학교 사회과학계열',18,0],['safe','국민대학교 인문계열',16,0]],regular:[['stretch','성균관대학교 사회과학계열',21],['fit','동국대학교 인문계열',18],['safe','숭실대학교 인문계열',16]]},
 {min:12,id:'middle',early:[['stretch','단국대학교 인문계열',18,0],['fit','경기대학교 인문계열',15,0],['safe','수원대학교 인문사회계열',12,0]],regular:[['stretch','단국대학교 인문계열',18],['fit','가천대학교 인문계열',15],['safe','강남대학교 인문계열',12]]},
 {min:0,id:'open',early:[['stretch','인천대학교 인문계열',15,0],['fit','대진대학교 인문사회계열',11,0],['safe','동서울대학교 실무계열',7,0]],regular:[['stretch','인천대학교 인문계열',15],['fit','대진대학교 인문사회계열',11],['safe','동서울대학교 실무계열',7]]}
];
const fields={humanities:'인문·사회',science:'자연·공학'};
const attributeNames={retakeSupportUsed:'재수학원 지원 사용 횟수',retakeMode:'입시 준비 방식',careerGapYears:'경력 공백 기간',admissionAttempts:'입시 응시 회차',admissionRoute:'원서 경로',earlyChoice:'수시 지원처',earlyStatus:'수시 판정',earlyOffer:'수시 합격 대학',regularChoice:'정시 지원처',regularStatus:'정시 판정',regularOffer:'정시 합격 대학',admissionDestination:'졸업 뒤 진로',csatSubmitted:'수능 확정',highFinalSubmitted:'내신 확정',admissionField:'지원 계열',retryEndReason:'N수 종료 이유'};
const option=(id,label,detail,effects={},extra={})=>({id,label,detail,effects,...extra});
const gate=n=>({all:[{attributes:{admissionAttempts:n}},{not:{any:['finished','employment','college'].map(admissionDestination=>({attributes:{admissionDestination}}))}}]});
function prefix(n){return n===1?'admission:first':n===2?'admission:second':'admission:attempt-'+n;}
function supportStatus(p){
 const tier=g.GukminData.wealthTiers.find(t=>t.id===p.familyTier)||g.GukminData.wealthTiers[0];
 const used=p.attributes?.retakeSupportUsed||0,limit=tier.retakeSupport;
 return {tier:tier.name,limit,used,remaining:limit===null?null:Math.max(0,limit-used),detail:tier.educationDetail};
}
function retryReason(p){return (p.stats.illness||0)>=5?'정신병 한계':p.age>=30?'백수 엔딩':null;}
function retry(p,result){
 const x=JSON.parse(JSON.stringify(result)),a=p.attributes||{},blocked=retryReason(p),ageLimit=!blocked&&p.age>=29;
 const reason=blocked||(ageLimit?'백수 엔딩':null);
 if(reason){x.effects={attributes:{...(ageLimit?{age:30}:{}),admissionDestination:'finished',retryEndReason:reason,job:reason==='백수 엔딩'?'무직':'입시 종료'}};}
 else{
  const support=supportStatus(p),academy=support.remaining===null||support.remaining>0,nextAge=p.age+1,gap=nextAge>=25;
  const pressure=2+(gap?1:0),illness=p.stats.illness>0?p.stats.illness+pressure:Math.max(0,p.stats.stress+pressure-g.GukminPlayer.metricDefinition('stress').max),ended=illness>=5?'정신병 한계':null;
  x.effects={attributes:{age:nextAge,admissionAttempts:(a.admissionAttempts||1)+1,job:ended?'입시 종료':'N수생',roles:[],admissionDestination:ended?'finished':'retry',retryEndReason:ended,csatSubmitted:false,retakeMode:academy?'academy':'self',retakeSupportUsed:support.used+(academy?1:0),careerGapYears:gap?nextAge-24:0},stats:{stress:pressure,...(gap?{relations:-1}:{})},...(gap?{traits:{add:['경력 공백']}}:{}),schools:g.GukminPlayer.schoolsOf(p).some(s=>s.kind==='high'&&s.status==='enrolled')?[{kind:'high',status:'graduated'}]:[]};
 }
 const end=x.effects.attributes.retryEndReason,mode=x.effects.attributes.retakeMode;
 x.history={title:end?end==='백수 엔딩'?'서른, 백수 엔딩':'N수 준비 종료 · '+end:mode==='academy'?'가족의 지원으로 재수학원에 등록했다':'독학으로 다음 입시를 준비한다',detail:end?end==='백수 엔딩'?'여러 번의 사회 진출 기회를 뒤로하고 입시 준비만 이어 왔다. 서른이 되었지만 아직 첫 경력을 시작하지 못했다.':'새 수능 주기를 열지 않고 이번 장을 마친다. '+end+'에 도달했다.':(mode==='academy'?supportStatus(p).detail+' 학원비는 가족이 부담하며 내 재산에서 차감하지 않는다.':'학원 지원은 끝났지만 독학으로 도전할 수 있다. 기출문제와 공공 학습 자료로 계획을 세운다.')+' 나이가 한 살 늘고 압박 '+(x.effects.stats.stress)+'을 반영했다.'+(x.effects.attributes.careerGapYears?' 입시 준비가 길어지며 첫 경력의 공백이 쌓인다. 관계 −1.':''),importance:'major'};
 return x;
}
const schoolAdvantages={science:{label:'과학고',field:'science',early:12,regular:6},gifted:{label:'영재학교',field:'science',early:15,regular:8},foreign:{label:'외고',field:'humanities',early:10,regular:5},international:{label:'국제고',field:'humanities',early:10,regular:5}};
function probabilityDetails(p,school,type,field=p.attributes?.admissionField||(g.GukminPlayer.hasTrait(p,'이과')?'science':'humanities')){
 const strategy=p.attributes?.preExamStrategy;
 const bonus=type==='early'?(strategy==='record'?1:0):0;
 const base=Math.max(5,Math.min(85,35+12*((p.stats[type==='early'?'schoolScore':'exam']||0)+bonus-school.target)));
 const advantage=schoolAdvantages[p.attributes?.schoolTrack],matched=advantage?.field===field;
 const probability=matched?Math.min(95,base+advantage[type]):base;
 return {probability,base,schoolBonus:probability-base,schoolLabel:matched?advantage.label:null,field};
}
function probability(p,school,type,field){return probabilityDetails(p,school,type,field).probability;}
function roll(p,key){
 const source=(p.admissionSeed||[p.createdAt,p.name,p.birthplaceId].join('|'))+'|'+key;
 let hash=2166136261;for(const ch of source){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return (hash>>>0)/4294967296*100;
}
function decision(p,{cycle,type}){
 const key=p.attributes?.[type+'Choice'];if(!key||key==='skip')return {effects:{attributes:{[type+'Status']:'skipped'}}};
 const entry=groups.flatMap(group=>group[type]).find(([risk,name])=>key===cycle+'-'+type+'-'+risk+'-'+name.replaceAll(/\s+/g,''));
 if(!entry)throw new Error('저장된 입시 지원처를 찾을 수 없음: '+key);
 const [,name,target,minimum=0]=entry,eligible=type!=='early'||p.stats.exam>=minimum;
 const field=p.attributes?.admissionField|| (g.GukminPlayer.hasTrait(p,'이과')?'science':'humanities');
 const accepted=eligible&&roll(p,cycle+'|'+type+'|'+name)<probability(p,{target},type,field);
 const display=field==='science'?name.replace(/(?:인문사회|사회과학|인문|사회|실무)계열/,'자연·공학계열'):name;
 return {effects:{attributes:{[type+'Status']:accepted?'accepted':'failed',[type+'Offer']:accepted?display:null}},history:{title:display+(accepted?' 합격':' 불합격'),detail:accepted?'지원한 대학에서 합격 통보가 도착했다. 결과를 확인한 다음 등록 여부를 결정한다.':!eligible?'수능 최저 기준을 충족하지 못했다. 이번 수시 지원은 불합격이다.':'이번 지원은 불합격이었다. 합격 확률은 확정을 뜻하지 않는다.',importance:'major'}};
}
function add(pack,x,when){if(when)x.event.when=when;pack.events.push(x.event);pack.choices.push(x.choice);return x;}
function board(pack,pre,at,type,when){
 const metric=type==='early'?'schoolScore':'exam',title=type==='early'?'수시 지원서':'정시 지원서';
 const build=group=>group[type].map(([risk,name,target,minimum=0],i)=>option(pre+'-'+type+'-'+risk+'-'+name.replaceAll(/\s+/g,''),name,'원서를 접수했다. 발표 전까지 합격 여부는 확정되지 않는다.',{attributes:{[type+'Choice']:pre+'-'+type+'-'+risk+'-'+name.replaceAll(/\s+/g,''),[type+'Status']:'pending'},stats:{stress:[5,2,0][i]}},{school:{name,typeLabel:['도전','적정','안정'][i],target,minimum,kind:type,scoreMetric:metric},risk:'준비 부담 · 압박 +'+[5,2,0][i],conditional:type==='early'?[{before:true,when:{attributes:{preExamStrategy:'record'}},result:{effects:{stats:{stress:-1}}}}]:[]})).concat([option(pre+'-skip','이번 원서는 쓰지 않는다','이번 전형 지원은 건너뛰었다.',{attributes:{[type+'Choice']:'skip',[type+'Status']:'skipped'}})]);
 const x=add(pack,S.selection(pre+':'+type+'-application',at,title,'성적과 모집 계열을 확인하고 대학을 고르자.',build(groups.at(-1)),'한방 선택',{type:'university',category:type,gradeMetric:metric,term:title}),when);
 x.choice.variants=groups.map((group,i)=>({id:pre+'-'+type+'-'+group.id,priority:(groups.length-i)*10,when:{stats:{[metric]:{gte:group.min}}},title,body:x.choice.body,options:S.selection('tmp',0,title,'',build(group),'한방 선택').choice.options}));
 const n=S.notice(pre+':'+type+'-result',at+(type==='early'?3:1),type==='early'?'수시 합격자 발표':'정시 합격자 발표','지원 결과가 도착했다.');n.when={all:[when,{not:{attributes:{[type+'Choice']:'skip'}}}]};n.presentation={kind:'admission'};n.result.admissionDecision={cycle:pre,type};pack.events.push(n);
}
function cycle(pack,n){
 const pre=prefix(n),base=79+(n-1)*10,routeAt=n===1?base+1:base,withGate=c=>c?{all:[gate(n),c]}:gate(n);
 if(n===1)add(pack,S.selection(pre+':final-report',base,'최종 내신 성적표','이후 입시에도 쓸 고교 최종 내신을 확인하자.',[option('submit','내신 점수 확인하기','고교 최종 내신을 확정했다.',{attributes:{highFinalSubmitted:true}})],'한방 선택',{type:'grade-seal',category:'school',term:'최종 내신 성적표'}),withGate());
 if(n>1){const annual=S.exam('retake',0,n,base,'연간 수능 준비','mock');annual.event.id=pre+':annual-preparation';annual.choice.id=annual.event.choice=annual.event.id;annual.choice.title=(n===2?'재수':n===3?'삼수':n+'수')+' · 연간 수능 준비';annual.choice.presentation.grade=null;annual.choice.presentation.term=annual.choice.title;add(pack,annual,withGate());}
 const reset={admissionAttempts:n,earlyStatus:null,regularStatus:null,earlyOffer:null,regularOffer:null,earlyChoice:null,regularChoice:null,csatSubmitted:false,admissionDestination:null};
 add(pack,S.selection(pre+':route',routeAt,'대입 지원 경로','학생부 중심 수시와 수능 중심 정시 중 준비할 경로를 고르자.',[
 option('early','수시 지원','학생부 평가와 수능 최저를 준비한다.',{attributes:{...reset,admissionRoute:'early'},stats:{stress:1}}),
 option('regular','정시 집중','수능 기출 풀이에 집중하는 대신 수시 기회는 포기했다.',{attributes:{...reset,admissionRoute:'regular'},stats:{exam:1,stress:1}}),
 option('employment','바로 사회 진출 준비','입시 대신 실무와 구직 정보를 살핀다.',{attributes:{...reset,admissionRoute:'employment'},stats:{stress:-1,relations:1}})
 ],'한방 선택',{type:'admission-route',term:'대입 지원 경로'}),withGate());
 const studying=withGate({all:[{not:{attributes:{admissionRoute:'employment'}}},{not:{attributes:{admissionDestination:'employment'}}}]});
 if([4,7,10].includes(n))add(pack,S.selection(pre+':career-offer',routeAt+1,'입시 바깥에서 온 제안',n===4?'학교 선배가 지역 일자리센터의 실무 교육과 채용 연계 설명회 소식을 보내 왔다. 시험 준비를 멈추고 첫 경력을 시작할 수도 있다.':n===7?'친구가 신입 교육을 제공하는 채용 설명회를 알려 왔다. 준비 기간이 길어진 만큼 지금까지의 선택과 앞으로의 생활을 정리할 때다.':'지인이 현장 실무 교육 참여자를 모집한다고 연락했다. 서른까지 입시만 계속하면 첫 경력을 시작하지 못한 채 백수 엔딩을 맞는다.',[option('employment','설명회에 참여하고 사회 진출을 준비한다','입시 일정을 내려놓고 실무 교육과 구직 상담을 시작했다.',{attributes:{admissionDestination:'employment',admissionRoute:'employment',job:'사회 진출 준비'}}),option('decline','제안을 거절하고 입시 준비를 계속한다','이번 사회 진출 제안을 거절했다. 다음 시험을 준비하지만 첫 경력을 시작하는 시점은 다시 늦어졌다.',{stats:{stress:1}})]),studying);
 add(pack,S.selection(pre+':peer-practice',routeAt+1,'원서철의 단체방','친구가 기출문제의 풀이를 보내 왔다.\n\n오늘 남은 두 시간을 함께 검토할지, 혼자 복습할지 정하자.',[
 option('team','친구와 틀린 이유를 설명한다','친구와 검산하며 단원을 다시 익혔다.',{stats:{exam:1,relations:1,stress:2}}),
 option('intense','연락을 줄이고 기출을 집중 복습한다','문제를 다시 풀었지만 다른 약속은 줄었다.',{stats:{exam:2,relations:-1,stress:3}}),
 option('rest','기본 문제만 풀고 수면을 확보한다','추가 복습 대신 컨디션을 회복했다.',{stats:{exam:-1,stress:-1}})
 ]),studying);
 board(pack,pre,routeAt+1,'early',withGate({attributes:{admissionRoute:'early'}}));
 const last=add(pack,S.selection(pre+':last-week',routeAt+2,'수능을 앞둔 마지막 일주일','수험표와 시험장 안내를 확인했다.\n\n새 단원 대신 오답·기출·컨디션을 점검한다. 수시 지원자는 수능 최저를 위해, 정시 지원자는 지원 성적을 위해 응시한다.',[
 option('cram','기출을 끝까지 복습한다','오답을 다시 풀었지만 피로가 쌓였다.',{stats:{exam:2,stress:3}}),
 option('target','틀린 문제만 추려 반복한다','범위를 좁혀 실수를 줄였다.',{stats:{exam:1,stress:1}}),
 option('recover','수면 리듬을 회복한다','추가 문제량보다 컨디션을 우선했다.',{stats:{exam:-1,stress:-2}})
 ]),studying);
 const csat=add(pack,S.selection(pre+':csat',routeAt+3,'대학수학능력시험 성적표','응시한 수능의 확정 성적을 확인하자.',[option('submit','수능 점수 확인하기','수능 성적을 확정했다. 이후 생활은 이번 점수를 바꾸지 않는다.',{attributes:{csatSubmitted:true},stats:{stress:1}},{conditional:[
 {before:true,when:{attributes:{preExamStrategy:'exam'}},result:{effects:{stats:{exam:2,stress:2}}}},
 {before:true,when:{attributes:{preExamStrategy:'balanced'}},result:{effects:{stats:{exam:1}}}},
 {before:true,when:{all:[{stats:{stress:{gte:42}}},{withoutTraits:['인내심']}]},result:{effects:{stats:{exam:-1}}}}
 ]})],'한방 선택',{type:'grade-seal',category:'mock',term:'대학수학능력시험 성적표'}),studying);
 add(pack,S.selection(pre+':exam-evening',routeAt+3,'시험이 끝난 저녁','답안을 제출했다. 지금은 성적을 고칠 수 없다.\n\n발표까지 일상을 회복하고 다음 계획을 정하자.',[
 option('review','친구들과 지원 일정과 서류를 서로 점검한다','일정을 대조했지만 결과 걱정도 나눴다.',{stats:{relations:2,stress:2}}),
 option('family','가족과 저녁을 먹는다','함께 식사하며 긴 시험을 마무리했다.',{stats:{relations:1,stress:-1}}),
 option('sleep','연락을 미루고 충분히 쉰다','쉬는 동안 단체방의 대화는 놓쳤다.',{stats:{stress:-3,relations:-1}})
 ]),studying);
 board(pack,pre,routeAt+5,'regular',withGate({any:[{attributes:{admissionRoute:'regular'}},{attributes:{earlyStatus:'failed'}},{attributes:{earlyStatus:'skipped'}}]}));
 const retryOption=option('retry','다음 해 입시에 다시 도전한다','다음 연도 준비를 선택했다.',{}, {retryYear:true,risk:'나이 +1 · 압박 +2. 가족의 학원 지원이 끝나면 독학. 25세부터 경력 공백 부담 · 30세 백수 엔딩'});
 const work=option('employment','대학 대신 사회 진출을 준비한다','구직과 실무 준비로 이번 장을 마친다.',{attributes:{admissionDestination:'employment',job:'사회 진출 준비'},stats:{stress:-1,relations:1}});
 const done=add(pack,S.selection(pre+':destination',routeAt+7,'졸업 이후의 진로','입시 결과를 바탕으로 다음 진로를 정하자.',[retryOption,work],'한방 선택',{type:'admission-finish',term:'진로 확정'}),withGate());
 done.choice.variants=['early','regular'].map((type,i)=>({id:pre+'-offer-'+type,priority:30-i*10,when:{attributes:{[type+'Status']:'accepted'}},title:(type==='early'?'수시':'정시')+' 합격 이후의 선택',body:type==='early'?'수시에 합격했다. 등록하지 않아도 올해 정시에는 지원할 수 없다.':'정시에 합격했다. 등록 여부를 정하자.',options:S.selection('tmp',0,'진로','',[
 option('college','합격한 대학에 진학한다','합격 대학 진학으로 이번 장을 마친다.',{attributes:{admissionDestination:'college',job:'대학 입학 예정'}}),work,retryOption],'한방 선택').choice.options}));
}
g.GukminAdmissions=Object.freeze({probability,probabilityDetails,roll,decision,retry,retryReason,prefix,supportStatus});
g.GukminDirector.register({id:'admissions',when:{phase:'high'},generate:()=>{
 const pack={events:[],choices:[],attributes:Object.fromEntries(Object.entries(attributeNames).map(([id,label])=>[id,{label,hidden:true}]))};
 // Up to the age boundary; each yearly group has stable IDs, including historical first/second.
 for(let n=1;n<=14;n++)cycle(pack,n);
 for(const [id,at] of [['admission:repeat-year',88],['admission:retry-graduation',99]]){const e=S.notice(id,at,'이전 입시 기록','이전 버전의 입시 이력을 보존한다.');e.when={turn:{lte:-1}};pack.events.push(e);}
 return pack;
}});
})(window);
