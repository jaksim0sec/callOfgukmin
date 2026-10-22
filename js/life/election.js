/* Classroom politics: seeded competition, promises and their later bills. No DOM. */
(function(global){
'use strict';
const P=global.GukminPlayer,S=global.GukminStory;
const groups=[{id:'play',name:'먹보·놀이파',size:7},{id:'study',name:'모범생파',size:6},{id:'quiet',name:'조용한 다수',size:10},{id:'sports',name:'운동·인싸파',size:7}];
const pledges=[
 {id:'chicken',name:'급식 닭강정 무제한',copy:'빈 급식통 앞에서 다시는 서럽지 않게.',scores:[3,0,1,2],difficulty:3,cost:0,limit:'급식 편성은 영양사 권한',compromise:'월 1회 닭강정 희망 메뉴를 건의한다'},
 {id:'homework',name:'숙제 반으로',copy:'방과 후에는 우리 시간도 필요하다.',scores:[2,-3,1,1],difficulty:2,cost:0,limit:'담임의 평가 계획과 충돌',compromise:'주 1회 숙제 없는 날을 협의한다'},
 {id:'recess',name:'쉬는 시간 5분 연장',copy:'종이 쳐도 조금만 더 놀 수 있다면.',scores:[2,-1,1,2],difficulty:2,cost:0,limit:'학교 시간표를 반장이 바꿀 수 없음',compromise:'수업 전 준비 시간을 줄이는 방식으로 협의한다'},
 {id:'library',name:'학급문고 신설',copy:'읽고 싶은 책을 교실에서 빌린다.',scores:[-1,2,2,-1],difficulty:0,cost:5000,limit:'책 수집과 대출 관리를 맡아야 함',compromise:'기증받은 책으로 작은 책꽂이부터 시작한다'},
 {id:'football',name:'운동장 축구 요일제',copy:'우리 반이 축구할 날을 확보한다.',scores:[1,-1,-2,3],difficulty:0,cost:0,limit:'다른 놀이를 하는 친구들의 공간이 줄어듦',compromise:'다른 반과 번갈아 쓰는 공동 요일제를 만든다'},
 {id:'quiet',name:'조용한 점심시간',copy:'떠들지 않아도 편안한 자리를 남긴다.',scores:[-1,1,3,-2],difficulty:0,cost:0,limit:'응원과 장난을 좋아하는 친구들은 아쉬워함',compromise:'교실 뒤편에 조용한 구역을 따로 둔다'},
 {id:'lost',name:'분실물 찾아주기',copy:'이름 없는 물건도 주인에게 돌려준다.',scores:[0,1,2,0],difficulty:0,cost:2000,limit:'매주 정리하고 공지할 시간이 필요',compromise:'금요일에만 분실물 상자를 정리한다'},
 {id:'holiday',name:'방학 두 배',copy:'우리의 여름은 두 배로 길어져야 한다.',scores:[3,-2,0,2],difficulty:3,cost:0,limit:'학사 일정은 반장의 권한 밖',compromise:'방학 과제의 분량을 조정해 달라고 건의한다'}
];
const rivalTypes=[
 {id:'popular',name:'서준',title:'복도에서 이름이 먼저 들리는 인기쟁이',base:[3,0,1,3],pledges:['football','recess','lost']},
 {id:'model',name:'예린',title:'할 수 있는 것만 약속하는 모범생',base:[0,3,2,0],pledges:['library','quiet','lost']},
 {id:'populist',name:'태오',title:'일단 크게 약속하는 포퓰리스트',base:[2,-1,0,2],pledges:['chicken','holiday','homework']}
];
const has=(p,t)=>P.hasTrait(p,t),clamp=n=>Math.max(0,Math.min(25,n));
function roll(p,key){let h=2166136261;for(const c of String(p.admissionSeed||p.createdAt||p.name)+'|class-election|'+key)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h/4294967296;}
function chosen(p){const mask=p.attributes?.electionPledges||0;return pledges.filter((_,i)=>mask&(1<<i));}
function available(p){return pledges.filter(x=>x.id!=='chicken'||(p.history||[]).some(h=>String(h.source||'').includes('elementary:lunch')));}
function rivals(p){
 const excluded=Math.floor(roll(p,'rivals')*3),list=rivalTypes.filter((_,i)=>i!==excluded).map(x=>({...x,pledges:[...x.pledges]}));
 if(chosen(p).length&&roll(p,'copy')<.35){const copy=chosen(p).find(x=>!list[0].pledges.includes(x.id));if(copy){list[0].pledges[0]=copy.id;list[0].copied=true;}}
 return list;
}
function preference(p,group,pledge){return pledge.scores[group]+Math.floor(roll(p,'taste:'+group+':'+pledge.id)*3)-1;}
function hint(p,index){const ordered=pledges.map(x=>({x,n:preference(p,index,x)})).sort((a,b)=>b.n-a.n);return groups[index].name+'에서는 「'+ordered[0].x.name+'」와 「'+ordered[1].x.name+'」에 눈빛이 달라졌다. 「'+ordered.at(-1).x.name+'」에는 반응이 차갑다.';}
function ballot(p){
 const attrs=p.attributes||{},competitors=[{id:'player',name:p.name,pledges:chosen(p).map(x=>x.id)},...rivals(p)],rows=[];
 for(let g=0;g<groups.length;g++){
  const electorate=groups[g].size,turnout=Math.max(1,electorate-Number(roll(p,'turnout:'+g)<.35));
  const scores=competitors.map((candidate,c)=>{
   let value=candidate.pledges.reduce((sum,id)=>sum+preference(p,g,pledges.find(x=>x.id===id)),0);
   if(c===0){value+=(p.stats.relations||0)/6-1.5+(attrs.teacherTrust??12)/12-.5;if(has(p,'리더십'))value+=.8;if(g===1&&has(p,'꼼꼼함'))value+=.7;if(g===3&&has(p,'체육'))value+=.7;
    if(attrs.electionResponse==='honest')value+=g===groups.findIndex(x=>x.id===attrs.electionHeard)?2.5:.3;
    if(attrs.electionResponse==='smear')value+=1.2;
   }else value+=rivalTypes.find(x=>x.id===candidate.id).base[g];
   return value+(roll(p,'noise:'+g+':'+candidate.id)-.5)*.8;
  });
  const weights=scores.map(n=>Math.exp(n/3.8)),sum=weights.reduce((a,b)=>a+b,0),quotas=weights.map(w=>turnout*w/sum),votes=quotas.map(Math.floor);
  const order=quotas.map((n,i)=>({i,f:n-votes[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
  for(let n=turnout-votes.reduce((a,b)=>a+b,0),i=0;i<n;i++)votes[order[i].i]++;
  rows.push({group:groups[g],turnout,votes,scores,hint:hint(p,g)});
 }
 const totals=competitors.map((_,i)=>rows.reduce((n,row)=>n+row.votes[i],0)),top=Math.max(...totals),tied=totals.map((n,i)=>n===top?i:-1).filter(i=>i>=0),winner=tied[Math.floor(roll(p,'tie')*tied.length)];
 return {candidates:competitors.map((c,i)=>({...c,votes:totals[i]})),rows,winner,won:winner===0,tied:tied.length>1};
}
function billTarget(p,slot=0){const ordered=[...chosen(p)].sort((a,b)=>b.difficulty-a.difficulty||b.cost-a.cost);if(slot===0)return ordered[0];const rest=ordered.slice(1);return rest.length?{id:'remaining',name:rest.map(x=>x.name).join(' · '),difficulty:Math.max(...rest.map(x=>x.difficulty)),cost:rest.reduce((n,x)=>n+x.cost,0),limit:rest.map(x=>x.limit).join(' / '),compromise:rest.map(x=>x.compromise).join(' / ')}:null;}
function decision(p,request,context={}){
 if(!request||!['listen','pledges','respond','count','bill','debt'].includes(request.action))throw new Error('선거 정산 요청 오류');
 const a=p.attributes||{},attributes={},stats={},traits={add:[]};let title='',detail='';
 if(request.action==='listen'){
  const index=groups.findIndex(g=>g.id===request.group);if(index<0)throw new Error('유권자 집단 오류');
  if(index===2)stats.study=-1;
  attributes.electionHeard=request.group;attributes.electionStage='pledges';title='복도에서 들은 민심';
  detail=index===2?'큰 소리로 의견을 말하는 친구는 없었다. 민서와 따로 물어보고 나서야 속마음을 들었다. '+hint(p,index):hint(p,index);
  detail+=' 민서는 '+rivals(p)[0].name+'도 출마할 것 같다고 귀띔했다.';
 }
 if(request.action==='pledges'){
  const ids=request.ids;if(!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||ids.some(id=>!available(p).some(x=>x.id===id)))throw new Error('서로 다른 해금된 공약 세 개를 골라야 함');
  attributes.electionPledges=ids.reduce((n,id)=>n|(1<<pledges.findIndex(x=>x.id===id)),0);attributes.electionStage='attack';title='나의 세 가지 약속';detail=ids.map(id=>pledges.find(x=>x.id===id).name).join(' · ');stats.stress=1;
 }
 if(request.action==='respond'){
  if(!['honest','smear','ignore'].includes(request.response))throw new Error('선거 대응 오류');
  attributes.electionResponse=request.response;attributes.electionStage='count';title='교실에 도는 소문';
  if(request.response==='honest'){stats.stress=2;attributes.teacherTrust=clamp((a.teacherTrust??12)+1);detail='할 수 있는 일과 권한 밖의 일을 구분해 설명했다. 먼저 이야기를 들은 집단에 집중해 설득했다.';}
  if(request.response==='smear'){stats.stress=1;stats.relations=1;attributes.teacherTrust=clamp((a.teacherTrust??12)-3);attributes.electionSmearDebt=true;detail='확인되지 않은 소문으로 맞불을 놓았다. 지금의 표에는 도움이 되겠지만, 퍼진 말은 없던 일이 되지 않는다.';}
  if(request.response==='ignore'){stats.stress=-1;detail='소문에 답하지 않았다. 선거가 삶의 전부는 아니지만, 해명하지 못한 이야기도 교실에 남았다.';}
 }
 if(request.action==='count'){
  if(chosen(p).length!==3||a.electionStage!=='count')throw new Error('아직 개표할 수 없음');
  const result=ballot(p);attributes.classElection=result.won?'elected':'lost';attributes.electionStage='finished';attributes.electionWinner=result.winner;attributes.electionTie=result.tied;
  result.rows.forEach((row,g)=>{attributes['electionTurnout'+g]=row.turnout;row.votes.forEach((v,c)=>attributes['electionVotes'+g+'_'+c]=v);row.scores.forEach((v,c)=>attributes['electionScore'+g+'_'+c]=v);});
  if(result.won){attributes.roles=[...new Set([...(p.roles||[]),'반장'])];traits.add.push('리더십');attributes.electionHardBill=billTarget(p,0).difficulty>=2;}
  title='반장 선거 개표';detail=result.candidates.map(c=>c.name+' '+c.votes+'표').join(' · ')+(result.tied?' · 동률은 미리 정한 추첨 순서로 결정했다.':'')+(result.won?' · 당선, 이제 약속을 지킬 차례다.':' · 낙선. 집단별 분석에서 표가 갈린 이유를 확인했다.');
 }
 if(request.action==='bill'){
  const slot=request.slot??0,target=billTarget(p,slot);if(!target||!['keep','compromise','break'].includes(request.mode))throw new Error('공약 이행 요청 오류');
  if(request.mode==='keep'&&target.difficulty>=2)throw new Error('반장 권한 밖의 약속은 그대로 이행할 수 없음');
  title='공약 청구서 · '+target.name;
  if(request.mode==='keep'){if(!context.preview&&(p.stats.money||0)<target.cost)throw new Error('공약 이행 재산 부족');stats.money=-target.cost;stats.stress=1;stats.study=-1;stats.relations=2;attributes.teacherTrust=clamp((a.teacherTrust??12)+2);detail='직접 시간과 자원을 들여 약속을 지켰다. '+target.limit+'.';}
  if(request.mode==='compromise'){stats.stress=1;stats.relations=target.difficulty>=2?-1:1;attributes.teacherTrust=clamp((a.teacherTrust??12)+1);detail=target.compromise+'. 전부 지킨 것은 아니지만 협의한 범위는 공개했다.';}
  if(request.mode==='break'){stats.stress=-1;stats.relations=-3;attributes.teacherTrust=clamp((a.teacherTrust??12)-2);detail='없던 약속처럼 넘겼다. 다음 학급회의에서는 네 말을 믿어도 되냐는 질문이 나왔다.';}
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
const attributes={electionRevision:'선거 규칙',electionStage:'선거 진행',electionHeard:'들은 민심',electionPledges:'세 가지 공약',electionResponse:'선거 대응',teacherTrust:'담임 신뢰',electionSmearDebt:'네거티브 외상',electionDebtResolved:'과거 소문 대응',electionWinner:'당선 후보',electionTie:'동률 추첨',electionHardBill:'권한 밖 공약',electionBillCost:'다음 공약 비용',electionBill0:'첫 약속 이행',electionBill1:'두 번째 약속 이행'};
for(let g=0;g<4;g++){attributes['electionTurnout'+g]='집단 투표수';for(let c=0;c<3;c++){attributes['electionVotes'+g+'_'+c]='집단 득표';attributes['electionScore'+g+'_'+c]='집단 호감도';}}
global.GukminElection=Object.freeze({groups,pledges,available,chosen,rivals,hint,roll,ballot,decision,report,billTarget,canChoose});
global.GukminDirector.register({id:'election',when:{any:[{phase:'elementary'},{phase:'high'}]},generate:()=>{
 const listen=S.selection('election:listen',45,'민서와 복도 민심 듣기','민서는 출마하지 않고 네 곁에 남았다. "목소리가 큰 애들만 반 친구는 아니잖아. 누구 얘기부터 들어 볼래?"',groups.map(g=>({id:g.id,label:g.name+' 이야기를 듣는다',...(g.id==='quiet'?{outlook:'따로 찾아가 물어야 해서 복습 시간이 조금 줄어듭니다.'}:{}),detail:'친구들의 말을 들었다.'})),'일상 선택',{type:'campaign',step:'listen'});
 listen.event.when={phase:'elementary',attributes:{electionRevision:1,electionStage:'listen'}};listen.choice.options.forEach(o=>o.result.electionDecision={action:'listen',group:o.id});
 const promises=S.selection('election:pledges',45,'딱 세 가지, 나의 공약','모두를 만족시킬 수는 없다. 세 가지 약속으로 어떤 반장이 될지 정하자.',[{id:'submit',label:'세 가지 공약 확정',detail:'공약을 정했다.'}],'한방 선택',{type:'election-pledges'});
 promises.event.when={phase:'elementary',attributes:{electionRevision:1,electionStage:'pledges'}};promises.choice.options[0].result.electionDecision={action:'pledges'};
 const attack=S.selection('election:attack',45,'라이벌의 공약, 그리고 소문','두 후보가 공약을 붙였다. "너는 듣기 좋은 말만 한다던데?" 민서는 확인되지 않은 말까지 돌고 있다고 알려준다.',[
  {id:'honest',label:'들은 민심을 바탕으로 가능한 일부터 설명한다',outlook:'먼저 이야기를 들은 집단에 설득을 집중합니다.',detail:'정공법을 골랐다.'},
  {id:'smear',label:'상대도 거짓말한다는 소문으로 맞불을 놓는다',outlook:'당장의 표에는 유리하지만 담임 신뢰와 훗날의 평판을 담보로 합니다.',detail:'소문으로 맞불을 놓았다.'},
  {id:'ignore',label:'소문을 무시하고 내 생활을 지킨다',outlook:'추가 득표 공세 없이 부담을 줄입니다.',detail:'소문에서 한발 물러났다.'}
 ],'일상 선택',{type:'campaign',step:'attack'});attack.event.when={phase:'elementary',attributes:{electionRevision:1,electionStage:'attack'}};attack.choice.options.forEach(o=>o.result.electionDecision={action:'respond',response:o.id});
 const count={id:'election:count',at:45,layer:'소식 이벤트',title:'반장 선거 개표',when:{phase:'elementary',attributes:{electionRevision:1,electionStage:'count'}},result:{electionDecision:{action:'count'}},presentation:{kind:'election'}};
 const bills=[0,1].map(slot=>{const item=S.selection('election:bill-'+slot,46+slot,'당선 뒤 날아온 공약 청구서','표를 받을 때 한 말이 돌아왔다. 민서가 공약 포스터를 들고 교탁 앞으로 왔다.',[
  {id:'keep',label:'시간과 자원을 들여 약속대로 이행한다',when:{attributes:{electionHardBill:false}},requirement:'반장 권한 안의 공약 · 이행 재산 확보',detail:'약속을 이행한다.'},
  {id:'compromise',label:'가능한 범위를 협의하고 타협안을 공개한다',detail:'타협안을 공개한다.'},
  {id:'break',label:'이번 약속은 지키지 않고 내 일로 돌아간다',detail:'약속을 접는다.'}
 ],'일상 선택',{type:'campaign',step:'bill',slot});item.event.when={phase:'elementary',attributes:{electionRevision:1,classElection:'elected',...(slot?{electionBill0:'keep'}:{})}};
  // The second bill follows every first-bill outcome, not only a fulfilled one.
  if(slot)item.event.when={phase:'elementary',all:[{attributes:{electionRevision:1,classElection:'elected'}},{any:['keep','compromise','break'].map(v=>({attributes:{electionBill0:v}}))}]};
  item.choice.options.forEach(o=>o.result.electionDecision={action:'bill',slot,mode:o.id});return item;});
 const debt=S.selection('election:old-smear',70,'단톡방에 올라온 초등학교 선거 이야기','"그때 그 소문, 네가 처음 퍼뜨린 거 아니었어?" 잊었다고 생각했던 선거 이야기가 고등학교 단톡방으로 돌아왔다.',[
  {id:'admit',label:'이기고 싶어서 확인되지 않은 말을 했다고 인정한다',detail:'과거의 말을 인정한다.'},
  {id:'repeat',label:'이번에도 상대가 문제였다고 주장한다',detail:'옛 소문을 반복한다.'},
  {id:'quiet',label:'답하지 않고 대화가 지나가기를 기다린다',detail:'입을 닫는다.'}
 ],'일상 선택',{type:'campaign',step:'debt'});debt.event.when={phase:'high',turn:{eq:70},attributes:{electionSmearDebt:true}};debt.choice.options.forEach(o=>o.result.electionDecision={action:'debt',response:o.id});
 return {...S.pack(listen,promises,attack,count,...bills,debt),attributes:Object.fromEntries(Object.entries(attributes).map(([id,label])=>[id,{label,hidden:true}]))};
}});
})(window);
