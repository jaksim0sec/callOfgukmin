/* Classroom politics: seeded competition, promises and their later bills. No DOM. */
(function(global){
'use strict';
const P=global.GukminPlayer,S=global.GukminStory;
const groups=[{id:'play',name:'급식·놀이 친구들',size:7},{id:'study',name:'공부 좋아하는 친구들',size:6},{id:'quiet',name:'조용한 친구들',size:10},{id:'sports',name:'운동 좋아하는 친구들',size:7}];
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
function preference(p,group,pledge){return pledge.scores[group]+Math.floor(roll(p,'taste:'+group+':'+pledge.id)*3)-1;}
function knows(p,id){return p.attributes?.electionHeard===id||p.attributes?.electionPollGroup===id;}
function opinion(p,group,id){const g=groups.findIndex(x=>x.id===group),pledge=pledges.find(x=>x.id===id);if(g<0||!pledge)throw new Error('친구 의견 입력 오류');return knows(p,group)?preference(p,g,pledge):null;}
function wishes(p,id){const g=groups.findIndex(x=>x.id===id);if(g<0)throw new Error('친구 모임 오류');if(!knows(p,id))return null;const ordered=available(p).map(x=>({id:x.id,name:x.name,value:preference(p,g,x)})).sort((a,b)=>b.value-a.value);return {likes:ordered.slice(0,2),dislikes:ordered.at(-1)};}
function hint(p,index){const group=groups[index],ordered=available(p).map(x=>({x,n:preference(p,index,x)})).sort((a,b)=>b.n-a.n);return group.name+' '+group.size+'명은 「'+ordered[0].x.name+'」와 「'+ordered[1].x.name+'」를 좋아했다. 「'+ordered.at(-1).x.name+'」는 별로라고 했다.';}
// Preview uses public catalog tastes; only the group we heard reveals its seeded variation.
function personality(p,g,response=p.attributes?.electionResponse){
 const a=p.attributes||{};let value=(p.stats.relations||0)/6-1.5+(a.teacherTrust??12)/12-.5;
 if(has(p,'리더십'))value+=.8;if(g===1&&has(p,'꼼꼼함'))value+=.7;if(g===3&&has(p,'체육'))value+=.7;
 if(response==='honest')value+=g===groups.findIndex(x=>x.id===a.electionHeard)?2.5:.3;
 if(response==='smear')value+=1.2;return value;
}
function shares(scores){const weights=scores.map(n=>Math.exp(n/3.8)),sum=weights.reduce((a,b)=>a+b,0);return weights.map(n=>n/sum*100);}
function wholeShares(values){const rounded=values.map(Math.floor),order=values.map((v,i)=>({i,f:v-rounded[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);for(let n=100-rounded.reduce((a,b)=>a+b,0),i=0;i<n;i++)rounded[order[i].i]++;return rounded;}
function forecast(p,ids=chosen(p).map(x=>x.id),response=p.attributes?.electionResponse){
 if(!Array.isArray(ids)||ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!pledges.some(x=>x.id===id)))throw new Error('공약 예상 입력 오류');
 const responseEffects=response&&response!==p.attributes?.electionResponse?decision(p,{action:'respond',response}).effects:null;
 const projected=responseEffects?{...p,stats:{...p.stats,relations:clamp((p.stats.relations||0)+(responseEffects.stats.relations||0))},attributes:{...p.attributes,...responseEffects.attributes}}:p;
 const competitors=[{id:'player',name:p.name,pledges:ids},...rivals(p)],heard=groups.findIndex(g=>g.id===p.attributes?.electionHeard),polled=groups.findIndex(g=>g.id===p.attributes?.electionPollGroup);
 const rows=groups.map((group,g)=>{
  const known=g===heard||g===polled,scores=competitors.map((candidate,c)=>candidate.pledges.reduce((n,id)=>{const x=pledges.find(x=>x.id===id);return n+(known?preference(p,g,x):x.scores[g]);},0)+(c===0?personality(projected,g,response):rivalTypes.find(r=>r.id===candidate.id).base[g]));
  const uncertainty=competitors.map(candidate=>(known?0:candidate.pledges.length)+((p.attributes?.electionRevision||0)>=2?2:.4)),center=wholeShares(shares(scores));
  const low=Math.floor(shares(scores.map((v,i)=>v+(i===0?-1:1)*uncertainty[i]))[0]),high=Math.ceil(shares(scores.map((v,i)=>v+(i===0?1:-1)*uncertainty[i]))[0]);
  const undecided=Math.max(16,(g===heard?22:g===polled?28:38)-(response==='honest'&&g===heard?6:response==='smear'?4:0)+(response==='ignore'?2:0)),pollShares=wholeShares([...center.map(v=>v*(100-undecided)/100),undecided]);
  return {group,known,shares:center,low:Math.min(low,center[0]),high:Math.max(high,center[0]),undecided,pollShares};
 });
 const total=wholeShares(competitors.map((_,c)=>rows.reduce((n,r)=>n+r.shares[c]*r.group.size/30,0))),pollShares=wholeShares([0,1,2,3].map(c=>rows.reduce((n,r)=>n+r.pollShares[c]*r.group.size/30,0)));
 return {candidates:competitors.map((candidate,c)=>({id:candidate.id,name:candidate.name,share:total[c]})),pollShares,undecided:pollShares[3],rows,low:Math.floor(rows.reduce((n,r)=>n+r.low*r.group.size/30,0)),high:Math.ceil(rows.reduce((n,r)=>n+r.high*r.group.size/30,0)),hard:ids.filter(id=>pledges.find(x=>x.id===id).difficulty>=2).length,cost:ids.reduce((n,id)=>n+pledges.find(x=>x.id===id).cost,0)};
}
function ballot(p){
 const competitors=[{id:'player',name:p.name,pledges:chosen(p).map(x=>x.id)},...rivals(p)],rows=[];
 for(let g=0;g<groups.length;g++){
  const electorate=groups[g].size,turnout=Math.max(1,electorate-Number(roll(p,'turnout:'+g)<.35));
  const scores=competitors.map((candidate,c)=>{
   let value=candidate.pledges.reduce((sum,id)=>sum+preference(p,g,pledges.find(x=>x.id===id)),0);
   if(c===0)value+=personality(p,g);else value+=rivalTypes.find(x=>x.id===candidate.id).base[g];
   return value+(roll(p,'noise:'+g+':'+candidate.id)-.5)*.8+((p.attributes?.electionRevision||0)>=2?(roll(p,'late:'+g+':'+candidate.id)-.5)*3.2:0);
  });
  const weights=scores.map(n=>Math.exp(n/3.8)),sum=weights.reduce((a,b)=>a+b,0),quotas=weights.map(w=>turnout*w/sum),votes=quotas.map(Math.floor);
  const order=quotas.map((n,i)=>({i,f:n-votes[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
  for(let n=turnout-votes.reduce((a,b)=>a+b,0),i=0;i<n;i++)votes[order[i].i]++;
  rows.push({group:groups[g],turnout,votes,scores,hint:hint(p,g)});
 }
 const totals=competitors.map((_,i)=>rows.reduce((n,row)=>n+row.votes[i],0)),top=Math.max(...totals),tied=totals.map((n,i)=>n===top?i:-1).filter(i=>i>=0),winner=tied[Math.floor(roll(p,'tie')*tied.length)];
 return {candidates:competitors.map((c,i)=>({...c,votes:totals[i]})),rows,winner,won:winner===0,tied:tied.length>1};
}
function pollTarget(p){const f=forecast(p,chosen(p).map(x=>x.id),null);return [...f.rows].filter(r=>r.group.id!==p.attributes?.electionHeard).sort((a,b)=>a.shares[0]-b.shares[0])[0].group;}
function billTarget(p,slot=0){const ordered=[...chosen(p)].sort((a,b)=>b.difficulty-a.difficulty||b.cost-a.cost);if(slot===0)return ordered[0];const rest=ordered.slice(1);return rest.length?{id:'remaining',name:rest.map(x=>x.name).join(' · '),difficulty:Math.max(...rest.map(x=>x.difficulty)),cost:rest.reduce((n,x)=>n+x.cost,0),limit:rest.map(x=>x.limit).join(' / '),compromise:rest.map(x=>x.compromise).join(' / ')}:null;}
function decision(p,request,context={}){
 if(!request||!['listen','pledges','finalize','respond','count','bill','debt'].includes(request.action))throw new Error('선거 정산 요청 오류');
 const a=p.attributes||{},attributes={},stats={},traits={add:[]};let title='',detail='';
 if(request.action==='listen'){
  attributes.electionStage='pledges';
  if(request.group==='skip'){attributes.electionHeard=null;title='내 생각대로 약속을 골라 보기로 했다';detail='쉬는 시간을 아꼈다. 친구들이 뭘 좋아하는지는 아직 잘 모른다.';}
  else{const index=groups.findIndex(g=>g.id===request.group);if(index<0)throw new Error('유권자 집단 오류');stats.stress=1;if(index===2)stats.study=-1;attributes.electionHeard=request.group;title='직접 물어보니 알게 된 것';detail='쉬는 시간을 내서 친구들을 만나고 왔다. '+hint(p,index)+' 말만 들었다고 표를 얻은 건 아니다. 이제 좋아할 약속을 골라 보자.';}
 }
 if(request.action==='pledges'||request.action==='finalize'){
  const ids=request.ids;if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(id=>!available(p).some(x=>x.id===id)))throw new Error('서로 다른 해금된 공약 세 개를 골라야 함');
  attributes.electionPledges=ids.reduce((n,id)=>n|(1<<pledges.findIndex(x=>x.id===id)),0);attributes.electionStage=request.action==='finalize'?'count':'attack';if(request.action==='pledges')attributes.electionDraftPledges=attributes.electionPledges;title=request.action==='finalize'?'최종 공약을 확정했다':(a.electionRevision||0)>=2?'친구들한테 보여 줄 약속':'나의 세 가지 약속';detail=ids.map(id=>pledges.find(x=>x.id===id).name).join(' · ');if(request.action==='pledges')stats.stress=1;
 }
 if(request.action==='respond'){
  if(!['honest','poll','smear','ignore'].includes(request.response))throw new Error('선거 대응 오류');
  attributes.electionResponse=request.response;attributes.electionStage=(a.electionRevision||0)>=2?'revise':'count';title='친구들 말에 답했다';
  if(request.response==='honest'){stats.stress=2;attributes.teacherTrust=clamp((a.teacherTrust??12)+1);detail=(a.electionHeard?'먼저 만났던 친구들에게':'주변 친구들에게')+' 약속을 어떻게 지킬지 차근차근 말했다. 선생님께 도움을 구할 일도 솔직하게 얘기했다.';}
  if(request.response==='poll'){const group=pollTarget(p);stats.stress=1;attributes.electionPollGroup=group.id;detail='쉬는 시간을 내서 '+group.name+' '+group.size+'명을 만나고 왔다. '+hint(p,groups.indexOf(group))+' 이제 이 친구들 생각까지 넣어서 약속을 고칠 수 있다.';}
  if(request.response==='smear'){stats.stress=1;stats.relations=1;attributes.teacherTrust=clamp((a.teacherTrust??12)-3);attributes.electionSmearDebt=true;detail='확인도 안 하고 다른 후보를 헐뜯었다. 내 편이 된 친구도 있지만 선생님은 실망했다. 이 말이 나중에 돌아올 수도 있다.';}
  if(request.response==='ignore'){stats.stress=-1;detail='실행 방법을 묻는 질문에 답하지 않고 쉬었다. 부담은 줄었지만 공약을 설득할 기회도 놓쳤다.';}
 }
 if(request.action==='count'){
  if(chosen(p).length!==3||a.electionStage!=='count')throw new Error('아직 개표할 수 없음');
  const result=ballot(p);attributes.classElection=result.won?'elected':'lost';attributes.electionStage='finished';attributes.electionWinner=result.winner;attributes.electionTie=result.tied;
  result.rows.forEach((row,g)=>{attributes['electionTurnout'+g]=row.turnout;row.votes.forEach((v,c)=>attributes['electionVotes'+g+'_'+c]=v);row.scores.forEach((v,c)=>attributes['electionScore'+g+'_'+c]=v);});
  if(result.won){attributes.roles=[...new Set([...(p.roles||[]),'반장'])];traits.add.push('리더십');attributes.electionHardBill=billTarget(p,0).difficulty>=2;}
  title='반장 선거 개표';detail=result.candidates.map(c=>c.name+' '+c.votes+'표').join(' · ')+(result.tied?' · 동률은 미리 정한 추첨 순서로 결정했다.':'')+(result.won?' · 당선, 이제 약속을 지킬 차례다.':' · 아쉽지만 떨어졌다. 어떤 친구들이 누구를 뽑았는지 아래에서 확인해 보자.');
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
function canChoose(p,request){if(request?.action!=='bill'||request.mode!=='keep')return true;const target=billTarget(p,request.slot);return !!target&&target.difficulty<2&&(p.stats.money||0)>=target.cost;}
function report(p){
 const a=p.attributes||{};if(a.electionWinner===undefined)return null;
 const candidates=[{name:p.name,id:'player'},...rivals(p)].map((c,i)=>({...c,votes:groups.reduce((n,_,g)=>n+(a['electionVotes'+g+'_'+i]||0),0)}));
 const rows=groups.map((group,g)=>({group,turnout:a['electionTurnout'+g],votes:candidates.map((_,c)=>a['electionVotes'+g+'_'+c]||0),scores:candidates.map((_,c)=>a['electionScore'+g+'_'+c]||0),hint:hint(p,g)}));
 return {candidates,rows,winner:a.electionWinner,won:a.electionWinner===0,tied:a.electionTie};
}
const attributes={electionDraftPledges:'임시 공약',electionPollGroup:'추가 민심 조사',electionRevision:'선거 규칙',electionStage:'선거 진행',electionHeard:'들은 민심',electionPledges:'세 가지 공약',electionResponse:'선거 대응',teacherTrust:'담임 신뢰',electionSmearDebt:'네거티브 외상',electionDebtResolved:'과거 소문 대응',electionWinner:'당선 후보',electionTie:'동률 추첨',electionHardBill:'권한 밖 공약',electionBillCost:'다음 공약 비용',electionBill0:'첫 약속 이행',electionBill1:'두 번째 약속 이행'};
for(let g=0;g<4;g++){attributes['electionTurnout'+g]='집단 투표수';for(let c=0;c<3;c++){attributes['electionVotes'+g+'_'+c]='집단 득표';attributes['electionScore'+g+'_'+c]='집단 호감도';}}
global.GukminElection=Object.freeze({groups,pledges,available,chosen,rivals,hint,knows,opinion,wishes,pollTarget,roll,ballot,forecast,decision,report,billTarget,canChoose});
global.GukminDirector.register({id:'election',when:{any:[{phase:'elementary'},{phase:'high'}]},generate:()=>{
 const listen=S.selection('election:listen',45,'누구한테 먼저 물어볼까?','민서가 말했다. "반장 공약은 친구들한테 하는 약속이야. 뭘 바꾸면 좋을지 먼저 물어보자!" 찾아가면 쉬는 시간을 쓰지만, 그 친구들이 좋아하는 약속을 알 수 있다.',[...groups.map(g=>({id:g.id,label:g.name+' 만나기 · '+g.size+'명',outlook:'찾아가는 수고가 듭니다. 대신 좋아하는 약속을 알게 됩니다.'+(g.id==='quiet'?' 따로 만나느라 학업역량도 1 줄어듭니다.':''),detail:'친구들의 말을 들었다.'})),{id:'skip',label:'일단 내 생각대로 약속 고르기',outlook:'수고는 없지만 친구들이 뭘 원하는지 아직 모릅니다.',detail:'내 생각대로 골라 본다.'}],'일상 선택',{type:'campaign',step:'listen'});
 listen.event.when={phase:'elementary',attributes:{electionStage:'listen'}};listen.choice.options.forEach(o=>o.result.electionDecision={action:'listen',group:o.id});
 const promises=S.selection('election:pledges',45,'친구들과 할 약속 세 가지','만나 본 친구들이 뭘 좋아했는지 떠올려 보자. 세 가지를 고른 뒤에 한 번 더 고칠 수 있다.',[{id:'submit',label:'세 가지 공약 확정',detail:'공약을 정했다.'}],'한방 선택',{type:'election-pledges'});
 promises.event.when={phase:'elementary',attributes:{electionStage:'pledges'}};promises.choice.options[0].result.electionDecision={action:'pledges'};
 const attack=S.selection('election:attack',45,'다른 친구들 생각도 들어 볼까?','골라 둔 약속을 보여 줬더니 “진짜 할 수 있어?”라는 말이 나왔다. 어떻게 할지 말해 줘도 되고, 다른 친구들에게 뭘 원하는지 더 물어봐도 된다. 그 뒤에 약속을 마지막으로 고치자.',[
  {id:'honest',label:'친구들에게 약속을 어떻게 지킬 건지 말해 주기',outlook:'준비하느라 좀 지치지만 친구들이 나를 더 믿고, 선생님도 좋아합니다.',detail:'정공법을 골랐다.'},
  {id:'poll',label:'다른 친구들도 만나서 원하는 것 물어보기',outlook:'수고가 들지만, 아직 안 만난 친구들이 좋아하는 약속을 알 수 있습니다. 찾아간다고 표가 바로 늘지는 않습니다.',detail:'추가 민심을 조사한다.'},
  {id:'smear',label:'“쟤도 약속 안 지킬걸?” 하고 말하고 다니기',outlook:'내 편이 조금 늘지만 선생님은 실망합니다. 확인 안 된 말이라 나중에 문제가 될 수 있습니다.',detail:'소문으로 맞불을 놓았다.'},
  {id:'ignore',label:'오늘은 그만하고 쉬기',outlook:'조금 편해집니다. 새로 알게 되는 것은 없습니다.',detail:'소문에서 한발 물러났다.'}
 ],'일상 선택',{type:'campaign',step:'attack'});attack.event.when={phase:'elementary',attributes:{electionStage:'attack'}};attack.choice.options.forEach(o=>o.result.electionDecision={action:'respond',response:o.id});
 const final=S.selection('election:final-pledges',45,'마지막으로 약속을 고르자','친구들 얘기를 들었으니 약속을 고쳐도 돼. 그대로 가도 괜찮아. 이번에 정하면 투표 시작!',[{id:'submit',label:'최종 공약 확정',detail:'최종 공약을 정했다.'}],'한방 선택',{type:'election-pledges',mode:'final'});
 final.event.when={phase:'elementary',attributes:{electionRevision:2,electionStage:'revise'}};final.choice.options[0].result.electionDecision={action:'finalize'};
 const count={id:'election:count',at:45,layer:'소식 이벤트',title:'반장 선거 개표',when:{phase:'elementary',attributes:{electionStage:'count'}},result:{electionDecision:{action:'count'}},presentation:{kind:'election'}};
 const bills=[0,1].map(slot=>{const item=S.selection('election:bill-'+slot,46+slot,'반장이 됐으니 약속 지킬 차례!','민서가 약속을 적은 종이를 가져왔다. "이거 언제 시작해? 친구들이 기다리고 있어."',[
  {id:'keep',label:'내 시간과 돈을 써서 약속 지키기',when:{attributes:{electionHardBill:false}},requirement:'내가 할 수 있는 약속이고 돈도 있어야 해요',detail:'약속을 이행한다.'},
  {id:'compromise',label:'선생님께 물어보고 할 수 있는 만큼 해 보기',detail:'타협안을 공개한다.'},
  {id:'break',label:'미안하다고 하고 이번 약속은 포기하기',detail:'약속을 접는다.'}
 ],'일상 선택',{type:'campaign',step:'bill',slot});item.event.when={phase:'elementary',attributes:{classElection:'elected',...(slot?{electionBill0:'keep'}:{})}};
  // The second bill follows every first-bill outcome, not only a fulfilled one.
  if(slot)item.event.when={phase:'elementary',all:[{attributes:{classElection:'elected'}},{any:['keep','compromise','break'].map(v=>({attributes:{electionBill0:v}}))}]};
  item.event.when={all:[item.event.when,{any:[{attributes:{electionRevision:1}},{attributes:{electionRevision:2}}]}]};
  item.choice.options.forEach(o=>o.result.electionDecision={action:'bill',slot,mode:o.id});return item;});
 const debt=S.selection('election:old-smear',70,'단톡방에 올라온 초등학교 선거 이야기','"그때 그 소문, 네가 처음 퍼뜨린 거 아니었어?" 잊었다고 생각했던 선거 이야기가 고등학교 단톡방으로 돌아왔다.',[
  {id:'admit',label:'이기고 싶어서 확인되지 않은 말을 했다고 인정한다',detail:'과거의 말을 인정한다.'},
  {id:'repeat',label:'이번에도 상대가 문제였다고 주장한다',detail:'옛 소문을 반복한다.'},
  {id:'quiet',label:'답하지 않고 대화가 지나가기를 기다린다',detail:'입을 닫는다.'}
 ],'일상 선택',{type:'campaign',step:'debt'});debt.event.when={phase:'high',turn:{eq:70},attributes:{electionSmearDebt:true}};debt.choice.options.forEach(o=>o.result.electionDecision={action:'debt',response:o.id});
 return {...S.pack(listen,promises,attack,final,count,...bills,debt),attributes:Object.fromEntries(Object.entries(attributes).map(([id,label])=>[id,{label,hidden:true}]))};
}});
})(window);
