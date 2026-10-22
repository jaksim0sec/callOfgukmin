/* Parameter-only election model. No player, story, storage or DOM dependencies. */
(function(global){
'use strict';
function random(seed,key){let h=2166136261;for(const c of seed+'|'+key)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h/4294967296;}
function allocate(values,total=100){
 const sum=values.reduce((a,b)=>a+b,0),quotas=values.map(v=>v/sum*total),out=quotas.map(Math.floor);
 const order=quotas.map((v,i)=>({i,f:v-out[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
 for(let left=total-out.reduce((a,b)=>a+b,0),i=0;i<left;i++)out[order[i].i]++;
 return out;
}
function create(parameters){
 const config=JSON.parse(JSON.stringify(parameters)),{groups,pledges,candidates,playerId,seed}=config;
 const rules={temperature:3.8,tasteVariance:1,noise:.8,lateSwing:3.2,turnoutLossChance:.35,turnoutLoss:1,maxPledges:3,uncertainty:2,...config.rules};
 const unique=rows=>Array.isArray(rows)&&rows.length>0&&rows.every(x=>typeof x.id==='string'&&x.id.length)&&new Set(rows.map(x=>x.id)).size===rows.length;
 if(!unique(groups)||!unique(pledges)||!unique(candidates)||!candidates.some(c=>c.id===playerId)||typeof seed!=='string')throw new Error('선거 구성 오류');
 for(const [key,value] of Object.entries(rules))if(!Number.isFinite(value)||value<0)throw new Error('선거 규칙 오류: '+key);
 if(!rules.temperature||!Number.isInteger(rules.maxPledges)||!rules.maxPledges||!Number.isInteger(rules.tasteVariance)||!Number.isInteger(rules.turnoutLoss)||rules.turnoutLossChance>1)throw new Error('선거 규칙 범위 오류');
 if(groups.some(g=>!Number.isSafeInteger(g.size)||g.size<1||!Number.isFinite(g.undecided??38)||(g.undecided??38)<0||(g.undecided??38)>100))throw new Error('유권자 규모 오류');
 const catalog=new Map(pledges.map(p=>[p.id,p])),playerIndex=candidates.findIndex(c=>c.id===playerId),totalSize=groups.reduce((n,g)=>n+g.size,0);
 function validate(ids){if(!Array.isArray(ids)||ids.length>rules.maxPledges||new Set(ids).size!==ids.length||ids.some(id=>!catalog.has(id)))throw new Error('공약 입력 오류');}
 candidates.forEach(c=>{validate(c.pledges);for(const g of groups)if(!Number.isFinite(c.support?.[g.id]??0))throw new Error('후보 지지 데이터 오류');});
 pledges.forEach(p=>{for(const g of groups)if(!Number.isFinite(p.scores?.[g.id]))throw new Error('공약 집단 점수 오류');});
 const roll=key=>random(seed,key),weights=scores=>{const top=Math.max(...scores);return scores.map(n=>Math.exp((n-top)/rules.temperature));};
 function preference(g,id){const p=catalog.get(id);if(!p||!groups[g])throw new Error('집단 의견 입력 오류');return p.scores[groups[g].id]+Math.floor(roll('taste:'+g+':'+id)*(rules.tasteVariance*2+1))-rules.tasteVariance;}
 function survey(id){const g=groups.findIndex(g=>g.id===id);if(g<0)throw new Error('유권자 집단 오류');return {group:{...groups[g]},opinions:Object.fromEntries(pledges.map(p=>[p.id,preference(g,p.id)]))};}
 function wishes(id,ids=pledges.map(p=>p.id)){const data=survey(id),ordered=ids.map(id=>{if(!catalog.has(id))throw new Error('조사 공약 오류');return {...catalog.get(id),value:data.opinions[id]};}).sort((a,b)=>b.value-a.value);return {likes:ordered.slice(0,2),dislikes:ordered.at(-1)};}
 function forecast(ids=candidates[playerIndex].pledges){
  validate(ids);const field=candidates.map((c,i)=>i===playerIndex?{...c,pledges:ids}:c);
  const rows=groups.map((group,g)=>{
   const known=!!group.known,scores=field.map(c=>c.pledges.reduce((n,id)=>n+(known?preference(g,id):catalog.get(id).scores[group.id]),0)+(c.support?.[group.id]??0));
   const uncertainty=field.map(c=>(known?0:c.pledges.length)+rules.uncertainty),center=allocate(weights(scores));
   const low=Math.floor(weightsShare(scores.map((v,i)=>v+(i===playerIndex?-1:1)*uncertainty[i]))),high=Math.ceil(weightsShare(scores.map((v,i)=>v+(i===playerIndex?1:-1)*uncertainty[i])));
   const undecided=group.undecided??38,pollShares=allocate([...center.map(v=>v*(100-undecided)/100),undecided]);
   return {group,known,shares:center,low:Math.min(low,center[playerIndex]),high:Math.max(high,center[playerIndex]),undecided,pollShares};
  });
  const total=allocate(field.map((_,c)=>rows.reduce((n,r)=>n+r.shares[c]*r.group.size/totalSize,0))),pollShares=allocate([...field,{}].map((_,c)=>rows.reduce((n,r)=>n+r.pollShares[c]*r.group.size/totalSize,0)));
  return {candidates:field.map((c,i)=>({...c,share:total[i]})),pollShares,undecided:pollShares.at(-1),rows,low:Math.floor(rows.reduce((n,r)=>n+r.low*r.group.size/totalSize,0)),high:Math.ceil(rows.reduce((n,r)=>n+r.high*r.group.size/totalSize,0)),hard:ids.filter(id=>(catalog.get(id).difficulty||0)>=2).length,cost:ids.reduce((n,id)=>n+(catalog.get(id).cost||0),0)};
 }
 function weightsShare(scores){const w=weights(scores);return w[playerIndex]/w.reduce((a,b)=>a+b,0)*100;}
 function count(){
  const rows=groups.map((group,g)=>{
   const turnout=Math.max(1,group.size-(roll('turnout:'+g)<rules.turnoutLossChance?rules.turnoutLoss:0));
   const scores=candidates.map(c=>c.pledges.reduce((n,id)=>n+preference(g,id),0)+(c.support?.[group.id]??0)+(roll('noise:'+g+':'+c.id)-.5)*rules.noise+(roll('late:'+g+':'+c.id)-.5)*rules.lateSwing);
   return {group,turnout,scores,votes:allocate(weights(scores),turnout)};
  });
  const totals=candidates.map((_,i)=>rows.reduce((n,row)=>n+row.votes[i],0)),top=Math.max(...totals),tied=totals.map((n,i)=>n===top?i:-1).filter(i=>i>=0),winner=tied[Math.floor(roll('tie')*tied.length)];
  return {candidates:candidates.map((c,i)=>({...c,votes:totals[i]})),rows,winner,won:winner===playerIndex,tied:tied.length>1};
 }
 return Object.freeze({forecast,count,survey,wishes,opinion:(group,id)=>{const g=groups.findIndex(x=>x.id===group);return preference(g,id);}});
}
global.GukminElectionEngine=Object.freeze({create});
})(window);
