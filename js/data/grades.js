/* Game-grade view helpers for Korea's assessment bands. */
(function(g){'use strict';const bounds=Object.freeze({high:[10,34,66,90,100],mock:[4,11,23,40,60,77,89,96,100]});function rankIndex(value,mode){if(!Number.isFinite(value))return null;const p=Math.max(0.01,100-Math.min(100,Math.max(0,value)));return bounds[mode].findIndex(x=>p<=x)+1;}function report(id,value,phase){if(!Number.isFinite(value))return {display:'—',detail:'미기록'};if(id==='schoolScore'&&phase==='middle'){const v=value;const a=v>=90?'A':v>=80?'B':v>=70?'C':v>=60?'D':'E';return {display:a,detail:'게임 성취도 예상 · 중학교'};}if(id==='schoolScore'||id==='exam'){const mode=id==='exam'?'mock':'high',grade=rankIndex(value,mode);return {display:grade+'등급',detail:'게임 예상 '+grade+'등급 / '+(mode==='mock'?'9':'5')+'등급제 (공식 성적 아님)'};}return {display:String(value),detail:'게임 수치'};}
// Pure preparation calculation shared by settlement and every preview.
const plans=[[-3,-5],[-1,-2],[0,1],[2,4],[4,8]];
function color(display){const index=/^[A-E]$/.test(display)?display.charCodeAt(0)-65:parseInt(display,10)-1;return "var(--grade-"+(index+1)+")";}
function assessment(person,{metric,effort}){
 if(!['schoolScore','exam'].includes(metric)||!Number.isInteger(effort)||!plans[effort])throw new Error('시험 준비 정의 오류');
 const held=name=>person.traits.some(t=>(typeof t==='string'?t:t.name)===name);
 const [base,cost]=plans[effort],current=person.stats[metric]||0,applied=[];
 let score=base>0?base*(current>=90?.5:current>=80?.75:1):base,stress=cost;
 if(effort>0&&held('꼼꼼함')){score+=1;applied.push({trait:'꼼꼼함',text:'실수 보완 +1'});}
 if(metric==='schoolScore'&&cost>0&&['science','gifted'].includes(person.attributes?.schoolTrack)&&held('문과')&&!held('이과')){
  stress+=2;applied.push({trait:'문과',text:'심화과학 적응 부담 +2'});
 }
 if(stress>0&&held('인내심')){const before=stress;stress*=.75;applied.push({trait:'인내심',text:'정신병 부담 '+before.toLocaleString('ko-KR',{maximumFractionDigits:1})+' → '+stress.toLocaleString('ko-KR',{maximumFractionDigits:1})});}
 const actual=Math.max(0,Math.min(100,current+score))-current;
 return {stats:{[metric]:score,stress},applied,metric,actual,limited:actual!==score};
}
function highEntry(person,track){
 const last=person.stats.schoolScore??75,elite=['science','gifted'].includes(track);
 return {schoolScore:Math.max(55,Math.min(elite?80:85,last-(elite?12:0))),exam:elite?97:last>=85?80:last>=75?65:50};
}
g.GukminGrades=Object.freeze({bounds,rankIndex,report,color,assessment,highEntry});})(window);
