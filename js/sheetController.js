/* Shared, presentation-neutral snap sheet physics.
 * Each host chooses its own skin, snap steps, and dismiss policy.
 */
(function(global){
'use strict';
function create({element,handle,dragTargets=[handle],steps,initial=0,enabled=()=>true,dismissible=false,removeOnDismiss=false,onDismiss=()=>{}}){
 if(!element||!handle||!Array.isArray(steps)||!steps.length)throw new Error('Sheet requires an element, handle and snap steps');
 if(steps.some(s=>!s.name||!(s.ratio>0&&s.ratio<=1)))throw new Error('Invalid sheet snap step');
 let level=Math.max(0,Math.min(steps.length-1,initial)),drag=null,dragFrame=0,springFrame=0,lastDragAt=-Infinity,disposed=false;
 const reduce=global.matchMedia('(prefers-reduced-motion: reduce)');
 const rootFont=()=>Number.parseFloat(getComputedStyle(document.documentElement).fontSize)||16;
 function heights(){
  const rem=rootFont(),height=global.innerHeight;
  return steps.map(s=>Math.max(s.minRem?rem*s.minRem:0,Math.min(height*s.ratio,
   s.maxRem?rem*s.maxRem:s.topGapRem?height-rem*s.topGapRem:height)));
 }
 function setLevel(index){
  level=Math.max(0,Math.min(steps.length-1,index));
  for(const step of steps)element.classList.remove('is-'+step.name);
  element.classList.add('is-'+steps[level].name);
  element.style.setProperty('--snap-height',heights()[level]+'px');
  handle.setAttribute('aria-expanded',String(level>0));
  handle.setAttribute('aria-label','시트 높이 조절 · '+(level+1)+' / '+steps.length);
 }
 function cancelSpring(){
  if(springFrame)cancelAnimationFrame(springFrame);
  springFrame=0;element.classList.remove('is-springing','is-dismissing');
  element.style.removeProperty('--sheet-motion-height');
 }
 function springTo(index,velocity=0,from=element.getBoundingClientRect().height){
  cancelSpring();
  const dismissing=index===-1;
  if(!dismissing)setLevel(index);
  const heightList=heights(),target=dismissing?0:heightList[level];
  if(!enabled()||reduce.matches||Math.abs(from-target)<.5){
   if(dismissing)finishDismiss();
   return;
  }
  if(dismissing)element.classList.add('is-dismissing');
  let x=from,v=-Math.sign(velocity)*Math.sqrt(Math.abs(velocity))*.1;
  element.classList.add('is-springing');element.style.setProperty('--sheet-motion-height',x+'px');
  function frame(){
   v=(v+Math.max(-25,Math.min(25,(target-x)*.035)))*.8;
   x+=v;element.style.setProperty('--sheet-motion-height',
    Math.max(dismissing?0:heightList[0],Math.min(heightList.at(-1),x))+'px');
   if(Math.abs(target-x)<.5&&Math.abs(v)<.5){
    springFrame=0;element.classList.remove('is-springing','is-dismissing');
    element.style.removeProperty('--sheet-motion-height');
    if(dismissing)finishDismiss();
   }else springFrame=requestAnimationFrame(frame);
  }
  springFrame=requestAnimationFrame(frame);
 }
 function dismiss(){
  if(!dismissible||disposed)return false;
  springTo(-1);
  return true;
 }
 function finishDismiss(){
  element.classList.remove('is-dismissing');
  if(removeOnDismiss)element.remove();
  onDismiss();
 }
 function choose(start,current,velocity,delta){
  const values=heights(),first=values[0],last=values.at(-1);
  if(dismissible&&start===0&&delta>105&&(velocity>.3||current<first-70))return -1;
  const projected=Math.max(first,Math.min(last,current-Math.max(-2,Math.min(2,velocity))*220));
  if(!dismissible&&start===steps.length-1&&steps.length>2&&delta>240)return 0;
  const midDown=start>0?(values[start]+values[start-1])/2:-Infinity;
  const midUp=start<values.length-1?(values[start]+values[start+1])/2:Infinity;
  if(start>0&&(velocity>.55||projected<midDown))return start-1;
  if(start<values.length-1&&(velocity<-.55||projected>midUp))return start+1;
  return start;
 }
 function paint(){dragFrame=0;if(drag)element.style.setProperty('--sheet-drag-height',
  Math.max(dismissible?0:heights()[0],Math.min(heights().at(-1),drag.startHeight-drag.delta))+'px');}
 function down(e){
  if(disposed||!enabled()||!e.isPrimary||e.button!==0||drag)return;
  if(e.target.closest('button:not(.sheet-grip):not(.paper-sheet-grip),a,input,select,textarea'))return;
  cancelSpring();
  const now=performance.now();
  drag={id:e.pointerId,owner:e.currentTarget,startY:e.clientY,startHeight:element.getBoundingClientRect().height,
   startLevel:level,delta:0,lastY:e.clientY,lastT:now,velocity:0,moved:false};
  element.classList.add('is-dragging');
  element.style.setProperty('--sheet-drag-height',drag.startHeight+'px');
  e.currentTarget.setPointerCapture(e.pointerId);
 }
 function move(e){
  if(!drag||e.pointerId!==drag.id)return;
  const now=performance.now(),dt=Math.max(now-drag.lastT,1);
  drag.velocity=(e.clientY-drag.lastY)/dt;
  drag.lastY=e.clientY;drag.lastT=now;drag.delta=e.clientY-drag.startY;
  if(Math.abs(drag.delta)>=8)drag.moved=true;
  if(drag.moved){if(!dragFrame)dragFrame=requestAnimationFrame(paint);if(e.cancelable)e.preventDefault();}
 }
 function up(e,cancelled=false){
  if(!drag||e.pointerId!==drag.id)return;
  const done=drag;drag=null;
  if(dragFrame)cancelAnimationFrame(dragFrame);dragFrame=0;
  element.classList.remove('is-dragging');element.style.removeProperty('--sheet-drag-height');
  const delta=e.clientY-done.startY,current=done.startHeight-delta;
  const velocity=performance.now()-done.lastT>90?0:done.velocity;
  if(done.moved)lastDragAt=performance.now();
  const next=cancelled||!done.moved?done.startLevel:choose(done.startLevel,current,velocity,delta);
  if(done.owner.hasPointerCapture(e.pointerId))done.owner.releasePointerCapture(e.pointerId);
  if(next===-1){dismiss();return;}
  springTo(next,cancelled?0:velocity,done.moved?Math.max(heights()[0],Math.min(heights().at(-1),current)):done.startHeight);
 }
 function cancel(e){up(e,true);}
 function tap(){
  if(!enabled()||performance.now()-lastDragAt<180)return;
  springTo((level+1)%steps.length);
 }
 function resized(){if(!disposed){if(drag)return;setLevel(level);}}
 for(const target of dragTargets){
  target.addEventListener('pointerdown',down);target.addEventListener('pointermove',move);
  target.addEventListener('pointerup',up);target.addEventListener('pointercancel',cancel);
 }
 handle.addEventListener('click',tap);
 global.addEventListener('resize',resized);
 element.classList.add('snap-controlled');
 setLevel(level);
 function dispose(){
  if(disposed)return;disposed=true;
  if(dragFrame)cancelAnimationFrame(dragFrame);
  if(drag?.owner.hasPointerCapture(drag.id))drag.owner.releasePointerCapture(drag.id);
  drag=null;
  cancelSpring();
  for(const target of dragTargets){
   target.removeEventListener('pointerdown',down);target.removeEventListener('pointermove',move);
   target.removeEventListener('pointerup',up);target.removeEventListener('pointercancel',cancel);
  }
  handle.removeEventListener('click',tap);global.removeEventListener('resize',resized);
  element.classList.remove('is-dragging','is-dismissing','snap-controlled');
  element.style.removeProperty('--sheet-drag-height');element.style.removeProperty('--snap-height');
 }
 return Object.freeze({dispose,dismiss,setLevel:s=>springTo(s),reset:()=>springTo(initial),
  revealAtLeast:s=>{if(enabled()&&!drag)springTo(Math.max(level,s));},
  getLevel:()=>level,getStepCount:()=>steps.length});
}
global.GukminSheet=Object.freeze({create});
})(window);
