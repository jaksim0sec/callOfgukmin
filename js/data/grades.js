/* Whole-number preparation on the shared 0–25 state scale. */
(function(g){'use strict';
const bounds=Object.freeze({high:[10,34,66,90,100],mock:[4,11,23,40,60,77,89,96,100]});
function rankIndex(value,mode){if(!Number.isFinite(value))return null;const p=Math.max(.01,100-Math.min(25,Math.max(0,value))*4);return bounds[mode].findIndex(x=>p<=x)+1;}
function report(id,value,phase){
 if(!Number.isFinite(value))return {display:'—',detail:'미기록'};
 if(id==='schoolScore'&&phase==='middle'){const a=value>=23?'A':value>=20?'B':value>=18?'C':value>=15?'D':'E';return {display:a,detail:'성취도 예상 · 중학교'};}
 if(id==='schoolScore'||id==='exam'){const mode=id==='exam'?'mock':'high',grade=rankIndex(value,mode);return {display:grade+'등급',detail:'예상 '+grade+'등급 / '+(mode==='mock'?'9':'5')+'등급제'};}
 return {display:String(value),detail:'수치'};
}
const plans=[[-2,-2],[-1,-1],[0,1],[1,2],[2,4]];
function color(display){const index=/^[A-E]$/.test(display)?display.charCodeAt(0)-65:parseInt(display,10)-1;return 'var(--grade-'+(index+1)+')';}
const schoolAptitudes={science:'이과',gifted:'이과',foreign:'문과',international:'문과'};
function schoolFit(person,track=person.attributes?.schoolTrack){
 const trait=schoolAptitudes[track];if(!trait)return null;
 return {trait,matched:person.traits.some(t=>(typeof t==='string'?t:t.name)===trait),surcharge:2};
}
function cramOutcomes(person,{metric}){
 if(!['schoolScore','exam'].includes(metric))throw new Error('시험 준비 정의 오류');
 const current=person.stats[metric]||0,loss=current>0?Math.max(1,Math.round(current*.1)):0;
 return {current,success:Math.min(25,current+6),failure:Math.max(0,current-loss),successChance:60,failureChance:40,loss};
}
function cramSuccess(person,key){
 const seed=person.admissionSeed||[person.createdAt,person.name,person.birthplaceId].join('|');
 let hash=2166136261;for(const ch of 'exam-cram:v1|'+seed+'|'+key){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return (hash>>>0)/4294967296>=.4;
}
function assessment(person,{metric,effort,mode,key},context={}){
 const cram=mode==='cram';
 if(!['schoolScore','exam'].includes(metric)||(cram?typeof key!=='string'||!key:!Number.isInteger(effort)||!plans[effort]))throw new Error('시험 준비 정의 오류');
 const held=name=>person.traits.some(t=>(typeof t==='string'?t:t.name)===name);
 const [base,cost]=cram?[0,12]:plans[effort],current=person.stats[metric]||0,applied=[];
 let score=base,stress=cost; // Distinct effort outcomes remain ordered until the actual 25-point cap.
 let outcome;
 if(cram){
  applied.push({label:'벼락치기',tone:'risk',text:'성공 60% · +6 / 실패 40% · 현재 점수의 10% 감소 (반올림·최소 1점)'});
  if(!context.preview&&!['preview','estimate'].includes(context.source)){
   const forecast=cramOutcomes(person,{metric});outcome=cramSuccess(person,key)?'success':'failure';score=forecast[outcome]-current;
  }
 }
 if(!cram&&effort>=3&&current<20&&held('꼼꼼함')){score+=1;applied.push({trait:'꼼꼼함',text:'집중 검산 +1'});}
 // A high score requires sustained effort; passively maintaining it slowly loses ground.
 // Maintaining a plan must not lose the same grade as light revision while costing more pressure.
 // effort=2 is the neutral benchmark at every existing score, including high achievers.
 const fit=schoolFit(person);
 if(cost>0&&person.phase==='high'&&!(person.attributes?.admissionAttempts>1)&&fit){
  if(fit.matched){stress=Math.max(1,stress-1);applied.push({trait:fit.trait,tone:'shield',text:'적성 방패 · 추가 부담 +2 면제'+(cost>stress?' · 기본 압박 −1':'')});}
  else {stress+=fit.surcharge;applied.push({...(held('문과')&&fit.trait==='이과'?{trait:'문과'}:{}),label:'적성 불일치',tone:'risk',text:'심화 수업의 추가 압박 +'+fit.surcharge});}
 }
 if(stress>0&&held('인내심')){const before=stress;stress=Math.max(1,Math.round(stress*.75));if(stress!==before)applied.push({trait:'인내심',text:'압박 부담 '+before+' → '+stress});}
 if(!cram&&metric==='exam'&&(person.attributes?.admissionAttempts||1)>1&&person.attributes?.retakeMode==='academy'&&effort>=3&&current<20){score+=1;applied.push({label:'재수학원',text:'오답 피드백 +1'});}
 const actual=Math.max(0,Math.min(25,current+score))-current;
 return {stats:{[metric]:score,stress},applied,metric,actual,limited:actual!==score,...(outcome?{outcome}:{})};
}
function highEntry(person,track){
 const last=person.stats.schoolScore??17,elite=['science','gifted'].includes(track);
 return {schoolScore:Math.max(13,Math.min(elite?19:21,last-(elite?3:0))),exam:elite?21:last>=22?19:last>=18?16:13};
}
g.GukminGrades=Object.freeze({bounds,rankIndex,report,color,assessment,cramOutcomes,highEntry,schoolFit});
})(window);
