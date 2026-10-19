/* Life director: switches operator eligibility, never replaces saved timeline state. */
(function(global){
'use strict';
const operators=new Map();
const clone=value=>JSON.parse(JSON.stringify(value));
const CONTENT_ID='life-main-v1';
function register({id,when={},generate}){
 if(typeof id!=='string'||!id.trim()||operators.has(id)||typeof generate!=='function')
   throw new Error('생애 오퍼레이터 등록 오류: '+id);
 operators.set(id,{id,when:clone(when),generate});
}
function active(persona,turn=0){
 return [...operators.values()].filter(op=>global.GukminEffects.matches(persona,op.when,turn)).map(op=>op.id);
}
function content(persona){
 const pack={contentId:CONTENT_ID,events:[],choices:[],metrics:{},traits:{},attributes:{}};
 for(const op of operators.values()){
   const generated=op.generate(clone(persona))||{};
   for(const kind of ['metrics','traits','attributes']){
     for(const [id,value] of Object.entries(generated[kind]||{})){
       if(Object.hasOwn(pack[kind],id))throw new Error('중복 정의: '+id);
       pack[kind][id]=clone(value);
     }
   }
   for(const choice of generated.choices||[])pack.choices.push(clone(choice));
   for(const event of generated.events||[]){
     pack.events.push({...clone(event),when:{all:[clone(op.when),clone(event.when||{})]}});
   }
 }
 return pack;
}
function create({persona,persist,onChange}){
 const definitions=content(persona);
 const choices=new Map(definitions.choices.map(c=>[c.id,c]));
 function decorate(raw){
  if(raw.choice)return {...raw,progress:{value:1,remaining:0,waiting:true,title:raw.choice.title}};
  const eligible=definitions.events.filter(event=>{
   const runtime=raw.runtime.events[event.id];
   const c=choices.get(event.choice);
   return c&&c.blocksTime!==false&&c.progress!==false&&
     runtime?.status!=='completed'&&event.every===undefined&&
     (event.at??0)>=raw.runtime.turn&&
     global.GukminEffects.matches(raw.persona,event.when,event.at);
  }).sort((a,b)=>(a.at??0)-(b.at??0))[0];
  if(!eligible)return {...raw,progress:{value:0,remaining:null,waiting:false,title:''}};
  const at=eligible.at??0,remain=Math.max(0,at-raw.runtime.turn);
  const elapsed=Math.max(0,raw.runtime.turn-(raw.runtime.progressStart||0));
  return {...raw,progress:{value:remain===0?1:elapsed/Math.max(1,elapsed+remain),remaining:remain,waiting:false,title:eligible.title}};
 }
 const timeline=global.GukminTimeline.create({...definitions,persona,persist,
  onChange:s=>onChange?.(decorate(s))});
 function run(){
   // Execute current content, then only known one-shot events with reachable conditions.
   // Never advance a clock when no future content exists.
   timeline.advance(0);
   for(let attempt=0;attempt<definitions.events.length;attempt++){
     const s=timeline.snapshot();
     if(Object.values(s.runtime.choices).some(item=>item.status==='waiting'))break;
     const targets=definitions.events.filter(event=>{
       const runtime=s.runtime.events[event.id];
       return event.every===undefined&&runtime?.status!=='completed'&&
         (event.at??0)>s.runtime.turn&&
         global.GukminEffects.matches(s.persona,event.when,event.at);
     }).map(event=>event.at);
     if(!targets.length)break;
     const turns=Math.min(...targets)-s.runtime.turn;
     timeline.advance(Math.min(10000,turns));
   }
   return decorate(timeline.snapshot());
 }
 return Object.freeze({
   snapshot:()=>decorate(timeline.snapshot()),
   advance:turns=>{const result=timeline.advance(turns);run();return result;},
   resolve:(token,optionId)=>{const result=timeline.resolve(token,optionId);if(result)run();return result;},
   apply:(id,result)=>{const applied=timeline.apply(id,result);if(applied)run();return applied;},
   run,active:()=>{const s=timeline.snapshot();return active(s.persona,s.runtime.turn);}
 });
}
global.GukminDirector=Object.freeze({register,content,create,active,contentId:CONTENT_ID});
})(window);
