/* Classroom politics: seeded competition, promises and their later bills. No DOM. */
(function(global){
'use strict';
const P=global.GukminPlayer,S=global.GukminStory;
const groups=[{id:'play',name:'급식·놀이 친구들',size:7,place:'급식실 앞',description:'점심 메뉴와 쉬는 시간 이야기가 끊이지 않는 모임.'},{id:'study',name:'공부 좋아하는 친구들',size:6,place:'교실 앞자리',description:'떠들썩한 약속보다 공부할 환경과 지킬 방법을 먼저 묻는다.'},{id:'quiet',name:'조용한 친구들',size:10,place:'도서관과 교실 곳곳',description:'한곳에 모이지는 않지만, 편하게 쉴 자리를 원하는 친구들.'},{id:'sports',name:'운동 좋아하는 친구들',size:7,place:'운동장 벤치',description:'공 하나를 두고 다른 반과 자주 부딪힌다. 함께 쓸 규칙이 관심사.'}];
const pledges=[
 {id:'chicken',name:'급식 닭강정 무제한',copy:'빈 급식통 앞에서 다시는 서럽지 않게.',scores:[3,0,1,2],difficulty:3,cost:0,limit:'급식 메뉴는 영양사 선생님이 정해요',compromise:'한 달에 한 번이라도 닭강정을 먹고 싶다고 선생님께 부탁한다'},
 {id:'homework',name:'숙제 반으로',copy:'방과 후에는 우리 시간도 필요하다.',scores:[2,-3,1,1],difficulty:2,cost:0,limit:'숙제를 줄이려면 담임 선생님이 허락해야 해요',compromise:'일주일에 하루만이라도 숙제를 쉬게 해 달라고 부탁한다'},
 {id:'recess',name:'쉬는 시간 5분 연장',copy:'종이 쳐도 조금만 더 놀 수 있다면.',scores:[2,-1,1,2],difficulty:2,cost:0,limit:'쉬는 시간은 반장 마음대로 늘릴 수 없어요',compromise:'수업 전 준비 시간을 줄이는 방식으로 협의한다'},
 {id:'library',name:'우리 반 책꽂이 만들기',copy:'읽고 싶은 책을 교실에서 빌린다.',scores:[-1,2,2,-1],difficulty:0,cost:5000,limit:'책을 모으고 빌려주는 일을 맡아야 해요',compromise:'집에서 안 읽는 책을 가져와 작은 책꽂이부터 만든다'},
 {id:'football',name:'축구하는 날 나누기',copy:'우리 반이 축구할 날을 확보한다.',scores:[1,-1,-2,3],difficulty:0,cost:0,limit:'축구를 안 하는 친구들은 운동장이 좁아져요',compromise:'다른 반과 운동장을 번갈아 쓰기로 한다'},
 {id:'quiet',name:'조용한 점심시간',copy:'떠들지 않아도 편안한 자리를 남긴다.',scores:[-1,1,3,-2],difficulty:0,cost:0,limit:'떠들며 놀고 싶은 친구들은 아쉬워해요',compromise:'교실 뒤편에 조용한 구역을 따로 둔다'},
 {id:'lost',name:'분실물 찾아주기',copy:'이름 없는 물건도 주인에게 돌려준다.',scores:[0,1,2,0],difficulty:0,cost:2000,limit:'매주 물건을 정리하고 주인을 찾아야 해요',compromise:'금요일에만 분실물 상자를 정리한다'},
 {id:'holiday',name:'방학 두 배',copy:'우리의 여름은 두 배로 길어져야 한다.',scores:[3,-2,0,2],difficulty:3,cost:0,limit:'방학 날짜는 반장이 바꿀 수 없어요',compromise:'방학 숙제를 조금 줄여 달라고 부탁한다'}
];
const rivalTypes=[
 {id:'popular',name:'서준',title:'친구가 많은 인기쟁이',base:[3,0,1,3],pledges:['football','recess','lost']},
 {id:'model',name:'예린',title:'지킬 수 있는 약속만 하는 친구',base:[0,3,2,0],pledges:['library','quiet','lost']},
 {id:'populist',name:'태오',title:'일단 큰 약속부터 하는 친구',base:[2,-1,0,2],pledges:['chicken','holiday','homework']}
];
const has=(p,t)=>P.hasTrait(p,t),clamp=n=>Math.max(0,Math.min(25,n));
function roll(p,key){let h=2166136261;for(const c of String(p.admissionSeed||p.createdAt||p.name)+'|class-election|'+key)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h/4294967296;}
function chosen(p){const mask=p.attributes?.electionPledges||0;return pledges.filter((_,i)=>mask&(1<<i));}
function available(p){return pledges.filter(x=>x.id!=='chicken'||(p.history||[]).some(h=>String(h.source||'').includes('elementary:lunch')));}
function rivals(p){
 const excluded=Math.floor(roll(p,'rivals')*3),list=rivalTypes.filter((_,i)=>i!==excluded).map(x=>({...x,pledges:[...x.pledges]}));
 const source=p.attributes?.electionDraftPledges??p.attributes?.electionPledges??0,copyPledges=pledges.filter((_,i)=>source&(1<<i));
 if(copyPledges.length&&roll(p,'copy')<.35){const copy=copyPledges.find(x=>!list[0].pledges.includes(x.id));if(copy){list[0].pledges[0]=copy.id;list[0].copied=true;}}
 return list;
}
// Story-derived relationships become explicit per-group candidate parameters.
function personality(p,g,response=p.attributes?.electionResponse){
 const a=p.attributes||{};let value=(p.stats.relations||0)/6-1.5+(a.teacherTrust??12)/12-.5;
 if(has(p,'리더십'))value+=.8;if(g===1&&has(p,'꼼꼼함'))value+=.7;if(g===3&&has(p,'체육'))value+=.7;
 if(response==='honest')value+=coreGroup(p,groups[g].id)?2.5:.3;
 if(response==='boast')value+=coreGroup(p,groups[g].id)?2:.4;
 if(response==='smear')value+=1.2;return value;
}
function parameters(p,ids=chosen(p).map(x=>x.id),response=p.attributes?.electionResponse){
 const a=p.attributes||{},effects=response&&response!==a.electionResponse?decision(p,{action:'respond',response}).effects:null;
 const projected=effects?{...p,stats:{...p.stats,relations:clamp((p.stats.relations||0)+(effects.stats.relations||0))},attributes:{...a,...effects.attributes}}:p;
 return {id:'class-election',seed:String(p.admissionSeed||p.createdAt||p.name)+'|class-election',playerId:'player',
  groups:groups.map(g=>({...g,known:knows(p,g.id),undecided:Math.max(16,(coreGroup(p,g.id)?22:knows(p,g.id)?28:38)-(response==='honest'&&coreGroup(p,g.id)?6:response==='smear'?4:0)+(response==='ignore'?2:0))})),
  pledges:pledges.map(x=>({...x,scores:Object.fromEntries(groups.map((g,i)=>[g.id,x.scores[i]]))})),
  candidates:[{id:'player',name:p.name,pledges:ids,support:Object.fromEntries(groups.map((g,i)=>[g.id,personality(projected,i,response)]))},...rivals(p).map(c=>({...c,support:Object.fromEntries(groups.map((g,i)=>[g.id,c.base[i]]))}))],
  rules:{runoff:(a.electionRevision||0)>=3?1:0,lateSwing:(a.electionRevision||0)>=2?3.2:0,uncertainty:(a.electionRevision||0)>=2?2:.4}};
}
const engine=p=>global.GukminElectionEngine.create(parameters(p));
function groupBit(id){const i=groups.findIndex(g=>g.id===id);return i<0?0:1<<i;}
function coreGroup(p,id){return !!((p.attributes?.electionCoreGroups||0)&groupBit(id))||p.attributes?.electionHeard===id;}
function knows(p,id){return !!((p.attributes?.electionSurveyed||0)&groupBit(id))||coreGroup(p,id)||p.attributes?.electionPollGroup===id;}
function opinion(p,group,id){if(!groups.some(g=>g.id===group)||!pledges.some(x=>x.id===id))throw new Error('친구 의견 입력 오류');return knows(p,group)?engine(p).opinion(group,id):null;}
function wishes(p,id){if(!groups.some(g=>g.id===id))throw new Error('친구 모임 오류');return knows(p,id)?engine(p).wishes(id,available(p).map(x=>x.id)):null;}
function hint(p,index){const group=groups[index],wish=engine(p).wishes(group.id,available(p).map(x=>x.id));return group.name+' '+group.size+'명은 「'+wish.likes[0].name+'」와 「'+wish.likes[1].name+'」를 좋아했다. 「'+wish.dislikes.name+'」는 별로라고 했다.';}
function forecast(p,ids=chosen(p).map(x=>x.id),response=p.attributes?.electionResponse){return global.GukminElectionEngine.create(parameters(p,ids,response)).forecast();}
function ballot(p){const result=engine(p).count();result.rows.forEach((row,g)=>{row.group=groups[g];row.hint=hint(p,g);});return result;}
// Candidate/choice UI receives this read-only model, never the player store.
function model(p){
 const config=parameters(p),a=p.attributes||{},core=global.GukminElectionEngine.create(config);
 return {id:config.id,playerId:config.playerId,title:'우리 반 반장 선거',active:p.phase==='elementary'&&((a.classElection==='ran'&&a.electionStage!=='finished')||(a.classElection==='elected'&&a.electionFulfillmentVersion===1&&!a.electionFulfilled)),
  groups:groups.map((g,i)=>({...g,shortName:['급식·놀이','공부','조용','운동'][i],surveyCost:(a.electionRevision||0)>=3?core.surveyCost(g.id):1,firstStudyCost:g.id==='quiet'?1:0})),pledges,available:available(p).map(x=>({...x,feasibilityLabel:x.difficulty>=2?'선생님 허락이 필요해':'내가 해 볼 수 있어'})),chosen:chosen(p),maxPledges:3,revision:a.electionRevision||1,riskLabel:p.stats.illness>0?'정신병':'압박',riskMetric:p.stats.illness>0?'illness':'stress',
  fulfillment:fulfillment(p),previewFulfillment:plans=>previewFulfillment(p,plans),forecast:ids=>forecast(p,ids),opinion:(group,id)=>opinion(p,group,id),wishes:id=>wishes(p,id),known:id=>knows(p,id),
  candidates:config.candidates.map((c,i)=>({...c,title:i===0?'우리 반의 변화를 약속합니다':c.title,portrait:{portraitStage:'elementary',portraitVariant:i===0?P.genderOf(p):c.id==='model'?'female':'male'},poster:{name:c.name,number:i+1,age:p.age,headerLabel:'우리 반 반장 선거',partyName:'무소속',stage:'반장 후보',phrase:i===0?'우리 반의\n다음 이야기':c.id==='popular'?'같이 놀자\n우리 모두':c.id==='model'?'작은 약속도\n끝까지':'약속은 크게\n학교는 즐겁게',portraitStage:'elementary',portraitVariant:i===0?P.genderOf(p):c.id==='model'?'female':'male',imageSrc:i===0?p.portraitSrc||null:null},
   pledges:c.pledges.map(id=>pledges.find(x=>x.id===id)),relations:i===0?[{label:'친구 사이',value:p.stats.relations,max:25},{label:'선생님 믿음',value:a.teacherTrust??12,max:25}]:[],copied:!!c.copied}))};
}
function pollTarget(p){const f=forecast(p,chosen(p).map(x=>x.id),null);return [...f.rows].filter(r=>r.group.id!==p.attributes?.electionHeard).sort((a,b)=>a.shares[0]-b.shares[0])[0].group;}
function billTarget(p,slot=0){const ordered=[...chosen(p)].sort((a,b)=>b.difficulty-a.difficulty||b.cost-a.cost);if(slot===0)return ordered[0];const rest=ordered.slice(1);return rest.length?{id:'remaining',name:rest.map(x=>x.name).join(' · '),difficulty:Math.max(...rest.map(x=>x.difficulty)),cost:rest.reduce((n,x)=>n+x.cost,0),limit:rest.map(x=>x.limit).join(' / '),compromise:rest.map(x=>x.compromise).join(' / ')}:null;}
// Per-pledge plans are validated and priced by the story adapter, never by DOM.
function fulfillment(p){return chosen(p).map(pledge=>({...pledge,modes:[
 {id:'keep',label:'약속대로 이행',detail:pledge.difficulty>=2?'반장이 혼자 정할 수 없는 약속이에요.':pledge.cost?'준비 비용 '+pledge.cost.toLocaleString('ko-KR')+'원을 내고 직접 맡아요.':'시간을 내서 직접 맡아요.',available:pledge.difficulty<2,cost:pledge.cost,stats:{stress:1,study:-1,relations:2},trust:2},
 {id:'compromise',label:'가능한 만큼 조정',detail:pledge.compromise,available:true,cost:0,stats:{stress:P.hasTrait(p,'뻔뻔함')?0:1,relations:pledge.difficulty>=2?-1:1},trust:1},
 {id:'break',label:'사과하고 철회',detail:'부담은 줄지만, 약속을 기다린 친구들은 실망해요.',available:true,cost:0,stats:{stress:-1,relations:-3},trust:-2}
 ]}));}
function fulfillmentResult(p,plans){
 const a=p.attributes||{},items=fulfillment(p);
 if(a.classElection!=='elected'||a.electionFulfillmentVersion!==1||a.electionFulfilled)throw new Error('공약을 정산할 수 없는 상태');
 if(!Array.isArray(plans)||plans.length!==items.length||items.length!==3||new Set(plans.map(x=>x?.pledgeId)).size!==items.length)throw new Error('공약별 이행 방식을 모두 골라야 함');
 for(const plan of plans)if(!plan||Object.keys(plan).some(k=>!['pledgeId','mode'].includes(k))||!items.some(x=>x.id===plan.pledgeId))throw new Error('공약 이행 입력 오류');
 const stats={money:0,stress:0,study:0,relations:0},attributes={electionFulfilled:true};let trust=a.teacherTrust??12;
 const history=items.map(item=>{
  const plan=plans.find(x=>x.pledgeId===item.id),mode=item.modes.find(x=>x.id===plan.mode);
  if(!mode?.available)throw new Error('선택할 수 없는 공약 이행 방식: '+item.id);
  stats.money-=mode.cost;for(const [id,n] of Object.entries(mode.stats))stats[id]+=n;trust+=mode.trust;
  attributes['electionFulfillment_'+item.id]=mode.id;
  return {title:item.name+' · '+mode.label,detail:mode.detail,importance:'normal'};
 });
 if((p.stats.money||0)+stats.money<0)throw new Error('공약 이행 재산 부족');
 attributes.teacherTrust=clamp(trust);
 return {effects:{stats,attributes},history:[{title:'세 가지 약속, 이행 결산',detail:'공약마다 지킬 방법을 정하고 친구들에게 결과를 알렸다.',importance:'major'},...history]};
}
function previewFulfillment(p,plans){
 const result=fulfillmentResult(p,plans),next=global.GukminEffects.apply(p,result,{preview:true});
 return {stats:Object.fromEntries(['money','stress','illness','study','relations'].map(id=>[id,(next.stats[id]||0)-(p.stats[id]||0)])),trust:(next.attributes.teacherTrust??12)-(p.attributes.teacherTrust??12)};
}
function decision(p,request,context={}){
 if(!request||!['listen','survey','pledges','finalize','respond','count','bill','fulfill','debt'].includes(request.action))throw new Error('선거 정산 요청 오류');
 if(request.action==='fulfill')return fulfillmentResult(p,request.plans);
 const a=p.attributes||{},attributes={},stats={},traits={add:[]};let title='',detail='';
 if(request.action==='listen'||request.action==='survey'){
  const first=request.action==='listen';
  if(!first&&a.electionStage!=='survey')throw new Error('지금은 추가 조사 시간이 아님');
  attributes.electionStage=first?'pledges':'revise';
  if(first&&request.group==='skip'&&!request.groups){attributes.electionHeard=null;title='내 생각대로 약속을 골라 보기로 했다';detail='쉬는 시간을 아꼈다. 친구들이 뭘 좋아하는지는 아직 잘 모른다.';}
  else{
   const ids=request.groups??[request.group],batch=engine(p).surveyMany(ids,groups.filter(g=>knows(p,g.id)).map(g=>g.id));
   stats.stress=(a.electionRevision||0)>=3?batch.cost:ids.length;
   if(first&&ids.includes('quiet'))stats.study=-1;
   const mask=ids.reduce((n,id)=>n|groupBit(id),0),known=groups.filter(g=>knows(p,g.id)).reduce((n,g)=>n|groupBit(g.id),0);
   attributes.electionSurveyed=known|mask;
   if(first){attributes.electionCoreGroups=mask;attributes.electionHeard=ids[0];}else attributes.electionPollGroup=ids[0];
   title=first?'직접 물어보니 알게 된 것':'다른 친구들의 생각도 들었다';
   detail=ids.map(id=>hint(p,groups.findIndex(g=>g.id===id))).join(' ')+' 총 '+batch.size+'명을 만났다. 표를 약속받은 건 아니지만 공약을 고칠 근거가 생겼다.';
  }
 }
 if(request.action==='pledges'||request.action==='finalize'){
  const ids=request.ids;if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(id=>!available(p).some(x=>x.id===id)))throw new Error('서로 다른 해금된 공약 세 개를 골라야 함');
  attributes.electionPledges=ids.reduce((n,id)=>n|(1<<pledges.findIndex(x=>x.id===id)),0);attributes.electionStage=request.action==='finalize'?'count':'attack';if(request.action==='pledges')attributes.electionDraftPledges=attributes.electionPledges;title=request.action==='finalize'?'최종 공약을 확정했다':(a.electionRevision||0)>=2?'친구들한테 보여 줄 약속':'나의 세 가지 약속';detail=ids.map(id=>pledges.find(x=>x.id===id).name).join(' · ');if(request.action==='pledges')stats.stress=1;
 }
 if(request.action==='respond'){
  if(!['honest','boast','poll','smear','ignore'].includes(request.response))throw new Error('선거 대응 오류');
  attributes.electionResponse=request.response;attributes.electionStage=(a.electionRevision||0)>=2?'revise':'count';title='친구들 말에 답했다';
  if(request.response==='honest'){stats.stress=2;attributes.teacherTrust=clamp((a.teacherTrust??12)+1);detail=(a.electionHeard?'먼저 만났던 친구들에게':'주변 친구들에게')+' 약속을 어떻게 지킬지 차근차근 말했다. 선생님께 도움을 구할 일도 솔직하게 얘기했다.';}
  if(request.response==='boast'){stats.stress=4;traits.add.push('뻔뻔함');detail='쉽게 된다고는 못 해도, 선생님을 찾아가고 친구들 서명도 모아 어떻게든 해 보겠다고 말했다. 당장 방법이 생긴 건 아니다. 시선은 모았지만 감당할 부담도 커졌다.';}
  if(request.response==='poll'&&(a.electionRevision||0)>=3){attributes.electionStage='survey';detail='다른 모임을 만나 보기로 했다. 다음 조사 화면에서 누구를 찾아갈지 직접 고른다. 방문 비용은 그때 지불한다.';}
  if(request.response==='poll'&&(a.electionRevision||0)<3){const group=pollTarget(p);stats.stress=1;attributes.electionPollGroup=group.id;detail='쉬는 시간을 내서 '+group.name+' '+group.size+'명을 만나고 왔다. '+hint(p,groups.findIndex(g=>g.id===group.id))+' 이제 이 친구들 생각까지 넣어서 약속을 고칠 수 있다.';}
  if(request.response==='smear'){stats.stress=1;stats.relations=1;attributes.teacherTrust=clamp((a.teacherTrust??12)-3);attributes.electionSmearDebt=true;detail='확인도 안 하고 다른 후보를 헐뜯었다. 내 편이 된 친구도 있지만 선생님은 실망했다. 이 말이 나중에 돌아올 수도 있다.';}
  if(request.response==='ignore'){stats.stress=-1;detail='실행 방법을 묻는 질문에 답하지 않고 쉬었다. 부담은 줄었지만 공약을 설득할 기회도 놓쳤다.';}
 }
 if(request.action==='count'){
  if(chosen(p).length!==3||a.electionStage!=='count')throw new Error('아직 개표할 수 없음');
  const result=ballot(p);attributes.classElection=result.won?'elected':'lost';attributes.electionStage='finished';attributes.electionWinner=result.winner;attributes.electionTie=result.tied;
  attributes.electionRunoff=!!result.runoff;attributes.electionRunoffDraw=false;
  if(result.runoff){attributes.electionRunoff=true;attributes.electionRunoffDraw=result.runoff.drawn;for(let i=0;i<3;i++){const candidate=result.runoff.candidates.find(c=>c.index===i);attributes['electionFinalist'+i]=!!candidate;attributes['electionRunoffVote'+i]=candidate?.votes||0;}}
  result.rows.forEach((row,g)=>{attributes['electionTurnout'+g]=row.turnout;row.votes.forEach((v,c)=>attributes['electionVotes'+g+'_'+c]=v);row.scores.forEach((v,c)=>attributes['electionScore'+g+'_'+c]=v);});
  if(result.won&&(a.electionRevision||0)>=3){attributes.electionFulfillmentVersion=1;attributes.electionFulfilled=false;}
  if(result.won){attributes.roles=[...new Set([...(p.roles||[]),'반장'])];traits.add.push('리더십');attributes.electionHardBill=billTarget(p,0).difficulty>=2;}
  title='반장 선거 개표';detail=result.candidates.map(c=>c.name+' '+c.votes+'표').join(' · ')+(result.runoff?' · 1차 동률 → 결선: '+result.runoff.candidates.map(c=>c.name+' '+c.votes+'표').join(' / ')+(result.runoff.drawn?' · 결선도 동률이라 공개 추첨했다.':''):result.tied?' · 동률 후보의 공개 추첨으로 정했다.':'')+(result.won?' · 당선, 이제 약속을 지킬 차례다.':' · 아쉽지만 떨어졌다. 어떤 친구들이 누구를 뽑았는지 아래에서 확인해 보자.');
 }
 if(request.action==='bill'){
  const slot=request.slot??0,target=billTarget(p,slot);if(!target||!['keep','compromise','break'].includes(request.mode))throw new Error('공약 이행 요청 오류');
  if(request.mode==='keep'&&target.difficulty>=2)throw new Error('반장 권한 밖의 약속은 그대로 이행할 수 없음');
  title='약속 지킬 시간 · '+target.name;
  if(request.mode==='keep'){if(!context.preview&&(p.stats.money||0)<target.cost)throw new Error('공약 이행 재산 부족');stats.money=-target.cost;stats.stress=1;stats.study=-1;stats.relations=2;attributes.teacherTrust=clamp((a.teacherTrust??12)+2);detail='내 시간과 돈을 써서 약속을 지켰다. '+target.limit+'.';}
  if(request.mode==='compromise'){stats.stress=1;stats.relations=target.difficulty>=2?-1:1;attributes.teacherTrust=clamp((a.teacherTrust??12)+1);detail=target.compromise+'. 처음 약속만큼은 아니지만, 친구들에게 어떻게 할 건지 설명했다.';}
  if(request.mode==='break'){stats.stress=-1;stats.relations=-3;attributes.teacherTrust=clamp((a.teacherTrust??12)-2);detail='지키기 어렵다고 친구들에게 사과했다. 알겠다는 친구도 있었지만 실망한 친구들도 남았다.';}
  attributes['electionBill'+slot]=request.mode;
  if(slot===0){attributes.electionHardBill=billTarget(p,1).difficulty>=2;attributes.electionBillCost=billTarget(p,1).cost;}
 }
 if(request.action==='debt'){
  if(!['admit','repeat','quiet'].includes(request.response))throw new Error('과거 소문 대응 오류');
  attributes.electionDebtResolved=true;title='초등학교 때 네가 했던 말';
  if(request.response==='admit'){stats.stress=2;stats.relations=-1;detail='그때는 이기고 싶었다고 인정하고 사과했다. 사과가 퍼진 말을 지우지는 못하지만 더 큰 거짓말을 만들지는 않았다.';}
  if(request.response==='repeat'){stats.stress=2;stats.relations=-3;detail='옛 소문을 다시 사실처럼 말했다. 당시 단톡방 캡처가 올라왔고, 이번에는 네 말의 근거를 묻는 사람이 늘었다.';}
  if(request.response==='quiet'){stats.stress=1;stats.relations=-2;detail='답하지 않았지만 기억하는 친구들이 있었다. 침묵만으로 과거의 말이 사라지지는 않았다.';}
 }
 return {effects:{attributes,stats,traits},history:{title,detail,importance:request.action==='count'?'major':'normal'}};
}
function canChoose(p,request){if(request?.action==='respond'&&request.response==='poll'&&(p.attributes?.electionRevision||0)>=3)return groups.some(g=>!knows(p,g.id));if(request?.action==='survey')return groups.some(g=>g.id===request.group)&&!knows(p,request.group);if(request?.action!=='bill'||request.mode!=='keep')return true;const target=billTarget(p,request.slot);return !!target&&target.difficulty<2&&(p.stats.money||0)>=target.cost;}
function report(p){
 const a=p.attributes||{};if(a.electionWinner===undefined)return null;
 const candidates=[{name:p.name,id:'player'},...rivals(p)].map((c,i)=>({...c,votes:groups.reduce((n,_,g)=>n+(a['electionVotes'+g+'_'+i]||0),0)}));
 const rows=groups.map((group,g)=>({group,turnout:a['electionTurnout'+g],votes:candidates.map((_,c)=>a['electionVotes'+g+'_'+c]||0),scores:candidates.map((_,c)=>a['electionScore'+g+'_'+c]||0),hint:hint(p,g)}));
 const runoff=a.electionRunoff?{candidates:candidates.flatMap((c,i)=>a['electionFinalist'+i]?[{...c,index:i,votes:a['electionRunoffVote'+i]||0}]:[]),drawn:!!a.electionRunoffDraw}:null;
 return {candidates,rows,winner:a.electionWinner,won:a.electionWinner===0,tied:a.electionTie,...(runoff?{runoff}:{})};
}
const attributes={electionFulfillmentVersion:'공약 결산 방식',electionFulfilled:'공약 결산 완료',electionSurveyed:'조사한 모임',electionCoreGroups:'처음 만난 모임',electionDraftPledges:'임시 공약',electionPollGroup:'추가 민심 조사',electionRevision:'선거 규칙',electionStage:'선거 진행',electionHeard:'들은 민심',electionPledges:'세 가지 공약',electionResponse:'선거 대응',teacherTrust:'담임 신뢰',electionSmearDebt:'네거티브 외상',electionDebtResolved:'과거 소문 대응',electionWinner:'당선 후보',electionRunoff:'결선투표',electionRunoffDraw:'결선 공개 추첨',electionTie:'1차 동률',electionHardBill:'권한 밖 공약',electionBillCost:'다음 공약 비용',electionBill0:'첫 약속 이행',electionBill1:'두 번째 약속 이행'};
for(const pledge of pledges)attributes['electionFulfillment_'+pledge.id]='공약별 이행 결과';
for(let c=0;c<3;c++){attributes['electionFinalist'+c]='결선 진출';attributes['electionRunoffVote'+c]='결선 득표';}
for(let g=0;g<4;g++){attributes['electionTurnout'+g]='집단 투표수';for(let c=0;c<3;c++){attributes['electionVotes'+g+'_'+c]='집단 득표';attributes['electionScore'+g+'_'+c]='집단 호감도';}}
global.GukminElection=Object.freeze({parameters,model,groups,pledges,available,chosen,rivals,hint,knows,opinion,wishes,pollTarget,roll,ballot,forecast,decision,report,billTarget,fulfillment,previewFulfillment,canChoose});
global.GukminDirector.register({id:'election',when:{any:[{phase:'elementary'},{phase:'high'}]},generate:()=>{
 const listen=S.selection('election:listen',45,'누구한테 먼저 물어볼까?','민서가 말했다. "반장 공약은 친구들한테 하는 약속이야. 뭘 바꾸면 좋을지 먼저 물어보자!" 찾아가면 쉬는 시간을 쓰지만, 그 친구들이 좋아하는 약속을 알 수 있다.',[...groups.map(g=>({id:g.id,label:g.name+' 만나기 · '+g.size+'명',outlook:'찾아가는 수고가 듭니다. 대신 좋아하는 약속을 알게 됩니다.'+(g.id==='quiet'?' 따로 만나느라 학업역량도 1 줄어듭니다.':''),detail:'친구들의 말을 들었다.'})),{id:'skip',label:'일단 내 생각대로 약속 고르기',outlook:'수고는 없지만 친구들이 뭘 원하는지 아직 모릅니다.',detail:'내 생각대로 골라 본다.'}],'일상 선택',{type:'campaign',step:'listen'});
 listen.event.when={phase:'elementary',all:[{attributes:{electionStage:'listen'}},{any:[{attributes:{electionRevision:1}},{attributes:{electionRevision:2}}]}]};listen.choice.options.forEach(o=>o.result.electionDecision={action:'listen',group:o.id});
 const survey=(first)=>{
  const item=S.selection(first?'election:survey-first':'election:survey-more',45,first?'누구의 이야기를 먼저 들을까?':'이번에는 누구를 찾아갈까?',
   '찾아가면 쉬는 시간을 쓰지만, 그 모임이 좋아하는 약속을 정확히 알 수 있다. 물어본다고 표가 바로 늘지는 않는다.',
   [...groups.map(g=>({id:g.id,label:g.name+' · '+g.size+'명',detail:'직접 친구들을 만났다.'})),...(first?[{id:'skip',label:'일단 내 생각대로 고르기',detail:'방문을 건너뛴다.'}]:[])],
   '한방 선택',{type:'election-survey',first});
  item.event.when={phase:'elementary',attributes:{electionRevision:3,electionStage:first?'listen':'survey'}};
  item.choice.options.forEach(o=>o.result.electionDecision={action:first?'listen':'survey',group:o.id});return item;
 };
 const promises=S.selection('election:pledges',45,'친구들과 할 약속 세 가지','만나 본 친구들이 뭘 좋아했는지 떠올려 보자. 세 가지를 고른 뒤에 한 번 더 고칠 수 있다.',[{id:'submit',label:'세 가지 공약 확정',detail:'공약을 정했다.'}],'한방 선택',{type:'election-pledges'});
 promises.event.when={phase:'elementary',attributes:{electionStage:'pledges'}};promises.choice.options[0].result.electionDecision={action:'pledges'};
 const attack=S.selection('election:attack',45,'다른 친구들 생각도 들어 볼까?','골라 둔 약속을 보여 줬더니 “진짜 할 수 있어?”라는 말이 나왔다. 어떻게 할지 말해 줘도 되고, 다른 친구들에게 뭘 원하는지 더 물어봐도 된다. 그 뒤에 약속을 마지막으로 고치자.',[
  {id:'honest',label:'친구들에게 약속을 어떻게 지킬 건지 말해 주기',outlook:'준비하느라 좀 지치지만 친구들이 나를 더 믿고, 선생님도 좋아합니다.',detail:'정공법을 골랐다.'},
  {id:'poll',label:'다른 친구들도 만나서 원하는 것 물어보기',outlook:'수고가 들지만, 아직 안 만난 친구들이 좋아하는 약속을 알 수 있습니다. 찾아간다고 표가 바로 늘지는 않습니다.',detail:'추가 민심을 조사한다.'},
  {id:'smear',label:'“쟤도 약속 안 지킬걸?” 하고 말하고 다니기',outlook:'내 편이 조금 늘지만 선생님은 실망합니다. 확인 안 된 말이라 나중에 문제가 될 수 있습니다.',detail:'소문으로 맞불을 놓았다.'},
  {id:'ignore',label:'오늘은 그만하고 쉬기',outlook:'조금 편해집니다. 새로 알게 되는 것은 없습니다.',detail:'소문에서 한발 물러났다.'}
 ],'일상 선택',{type:'campaign',step:'attack'});attack.event.when={phase:'elementary',attributes:{electionStage:'attack'}};attack.choice.options.forEach(o=>o.result.electionDecision={action:'respond',response:o.id});
 const newResponse={id:'boast',label:'“쉽진 않아도, 어떻게든 해 볼게!”',outlook:'선생님께 부탁하고 친구들 서명도 모아 보겠다고 합니다. 부담은 크지만 뻔뻔함 특성을 얻어요. 못 지키면 나중에 설명해야 합니다.',detail:'부담을 감수하고 큰소리쳤다.'};
 const modernOptions=[{...newResponse,result:{tags:['public-speech'],electionDecision:{action:'respond',response:'boast'}}},...attack.choice.options.slice(1)];
 attack.choice.variants=[{id:'election-revision-3',priority:10,when:{attributes:{electionRevision:3}},title:attack.choice.title,body:attack.choice.body,options:modernOptions},{id:'legacy',title:attack.choice.title,body:attack.choice.body,options:attack.choice.options}];
 const final=S.selection('election:final-pledges',45,'마지막으로 약속을 고르자','친구들 얘기를 들었으니 약속을 고쳐도 돼. 그대로 가도 괜찮아. 이번에 정하면 투표 시작!',[{id:'submit',label:'최종 공약 확정',detail:'최종 공약을 정했다.'}],'한방 선택',{type:'election-pledges',mode:'final'});
 final.event.when={phase:'elementary',all:[{attributes:{electionStage:'revise'}},{any:[{attributes:{electionRevision:2}},{attributes:{electionRevision:3}}]}]};final.choice.options[0].result.electionDecision={action:'finalize'};
 const count={id:'election:count',at:45,layer:'소식 이벤트',title:'반장 선거 개표',when:{phase:'elementary',attributes:{electionStage:'count'}},result:{electionDecision:{action:'count'}},presentation:{kind:'election'}};
 const bills=[0,1].map(slot=>{const item=S.selection('election:bill-'+slot,46+slot,'반장이 됐으니 약속 지킬 차례!','민서가 약속을 적은 종이를 가져왔다. "이거 언제 시작해? 친구들이 기다리고 있어."',[
  {id:'keep',label:'내 시간과 돈을 써서 약속 지키기',when:{attributes:{electionHardBill:false}},requirement:'내가 할 수 있는 약속이고 돈도 있어야 해요',detail:'약속을 이행한다.'},
  {id:'compromise',label:'선생님께 물어보고 할 수 있는 만큼 해 보기',detail:'타협안을 공개한다.'},
  {id:'break',label:'미안하다고 하고 이번 약속은 포기하기',detail:'약속을 접는다.'}
 ],'일상 선택',{type:'campaign',step:'bill',slot});item.event.when={phase:'elementary',attributes:{classElection:'elected',...(slot?{electionBill0:'keep'}:{})}};
  // The second bill follows every first-bill outcome, not only a fulfilled one.
  if(slot)item.event.when={phase:'elementary',all:[{attributes:{classElection:'elected'}},{any:['keep','compromise','break'].map(v=>({attributes:{electionBill0:v}}))}]};
  item.event.when={all:[item.event.when,{not:{attributes:{electionFulfillmentVersion:1}}},{any:[{attributes:{electionRevision:1}},{attributes:{electionRevision:2}},{attributes:{electionRevision:3}}]}]};
  item.choice.options.forEach(o=>{o.result.electionDecision={action:'bill',slot,mode:o.id};if(o.id==='compromise')o.result.tags=['public-speech'];});return item;});
 const fulfillmentChoice=S.selection('election:fulfillment',46,'세 가지 약속, 이제 어떻게 지킬까?','약속마다 지킬 방법을 정하자. 선생님 허락이 필요한 약속은 가능한 만큼 바꿔 볼 수 있어.',[{id:'submit',label:'이행 방식 확정',detail:'공약 이행을 한 번에 정산했다.'}],'한방 선택',{type:'election-fulfillment'});
 fulfillmentChoice.event.when={phase:'elementary',attributes:{classElection:'elected',electionFulfillmentVersion:1,electionFulfilled:false}};
 fulfillmentChoice.choice.options[0].result.electionDecision={action:'fulfill'};
 const debt=S.selection('election:old-smear',70,'단톡방에 올라온 초등학교 선거 이야기','"그때 그 소문, 네가 처음 퍼뜨린 거 아니었어?" 잊었다고 생각했던 선거 이야기가 고등학교 단톡방으로 돌아왔다.',[
  {id:'admit',label:'이기고 싶어서 확인되지 않은 말을 했다고 인정한다',detail:'과거의 말을 인정한다.'},
  {id:'repeat',label:'이번에도 상대가 문제였다고 주장한다',detail:'옛 소문을 반복한다.'},
  {id:'quiet',label:'답하지 않고 대화가 지나가기를 기다린다',detail:'입을 닫는다.'}
 ],'일상 선택',{type:'campaign',step:'debt'});debt.event.when={phase:'high',turn:{eq:70},attributes:{electionSmearDebt:true}};debt.choice.options.forEach(o=>o.result.electionDecision={action:'debt',response:o.id});
 return {...S.pack(listen,survey(true),survey(false),promises,attack,final,count,...bills,fulfillmentChoice,debt),traits:{'뻔뻔함':{label:'뻔뻔함',icon:'sparkle',color:'#816b9b',description:'큰소리친 뒤에도 사람들 앞에 다시 서는 배짱. 공개 발언의 부담을 1 줄이지만, 불가능한 약속을 가능하게 만들지는 않습니다.',modifiers:[{tags:['public-speech'],stats:{stress:{add:-1}}}]}},attributes:Object.fromEntries(Object.entries(attributes).map(([id,label])=>[id,{label,hidden:true}]))};
}});
})(window);
