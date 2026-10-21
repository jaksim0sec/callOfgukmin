/* Whole-number preparation on the shared 0–25 state scale. */
(function(g){'use strict';
const bounds=Object.freeze({high:[10,34,66,90,100],mock:[4,11,23,40,60,77,89,96,100]});
function rankIndex(value,mode){if(!Number.isFinite(value))return null;const p=Math.max(.01,100-Math.min(25,Math.max(0,value))*4);return bounds[mode].findIndex(x=>p<=x)+1;}
function report(id,value,phase){
 if(!Number.isFinite(value))return {display:'—',detail:'미기록'};
 if(id==='schoolScore'&&phase==='middle'){const a=value>=23?'A':value>=20?'B':value>=18?'C':value>=15?'D':'E';return {display:a,detail:'게임 성취도 예상 · 중학교'};}
 if(id==='schoolScore'||id==='exam'){const mode=id==='exam'?'mock':'high',grade=rankIndex(value,mode);return {display:grade+'등급',detail:'게임 예상 '+grade+'등급 / '+(mode==='mock'?'9':'5')+'등급제 (공식 성적 아님)'};}
 return {display:String(value),detail:'게임 수치'};
}
const plans=[[-2,-2],[-1,-1],[0,1],[1,2],[2,4]];
function color(display){const index=/^[A-E]$/.test(display)?display.charCodeAt(0)-65:parseInt(display,10)-1;return 'var(--grade-'+(index+1)+')';}
const schoolAptitudes={science:'이과',gifted:'이과',foreign:'문과',international:'문과'};
function schoolFit(person,track=person.attributes?.schoolTrack){
 const trait=schoolAptitudes[track];if(!trait)return null;
 return {trait,matched:person.traits.some(t=>(typeof t==='string'?t:t.name)===trait),surcharge:2};
}
function assessment(person,{metric,effort}){
 if(!['schoolScore','exam'].includes(metric)||!Number.isInteger(effort)||!plans[effort])throw new Error('시험 준비 정의 오류');
 const held=name=>person.traits.some(t=>(typeof t==='string'?t:t.name)===name);
 const [base,cost]=plans[effort],current=person.stats[metric]||0,applied=[];
 let score=base>0?Math.max(0,base-(current>=20?1:0)):base,stress=cost;
 if(effort>=3&&current<20&&held('꼼꼼함')){score+=1;applied.push({trait:'꼼꼼함',text:'집중 검산 +1'});}
 // A high score requires sustained effort; passively maintaining it slowly loses ground.
 if(effort===2&&current>=20)score=-1;
 const fit=schoolFit(person);
 if(cost>0&&person.phase==='high'&&!(person.attributes?.admissionAttempts>1)&&fit){
  if(fit.matched){stress=Math.max(1,stress-1);applied.push({trait:fit.trait,tone:'shield',text:'적성 방패 · 추가 부담 +2 면제'+(cost>stress?' · 기본 압박 −1':'')});}
  else {stress+=fit.surcharge;applied.push({...(held('문과')&&fit.trait==='이과'?{trait:'문과'}:{}),label:'적성 불일치',tone:'risk',text:'심화 수업의 추가 압박 +'+fit.surcharge});}
 }
 if(stress>0&&held('인내심')){const before=stress;stress=Math.max(1,Math.round(stress*.75));if(stress!==before)applied.push({trait:'인내심',text:'압박 부담 '+before+' → '+stress});}
 const actual=Math.max(0,Math.min(25,current+score))-current;
 return {stats:{[metric]:score,stress},applied,metric,actual,limited:actual!==score};
}
function highEntry(person,track){
 const last=person.stats.schoolScore??17,elite=['science','gifted'].includes(track);
 return {schoolScore:Math.max(13,Math.min(elite?19:21,last-(elite?3:0))),exam:elite?21:last>=22?19:last>=18?16:13};
}
g.GukminGrades=Object.freeze({bounds,rankIndex,report,color,assessment,highEntry,schoolFit});
})(window);
