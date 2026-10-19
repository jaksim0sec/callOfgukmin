/* Static HTML screen host. Index owns no view-specific markup.
 * Three templates are fetched once and mounted one at a time.
 */
(function(global){
'use strict';
const TEMPLATES=Object.freeze({
 waiting:'./html/waiting.html',
 game:'./html/game.html',
 result:'./html/result.html'
});
const host=document.getElementById('app');
const cache=new Map();
let cleanup=null;
let request=0;
async function getTemplate(name){
 if(!Object.hasOwn(TEMPLATES,name))throw new Error('Unknown screen '+name);
 if(cache.has(name))return cache.get(name);
 const response=await fetch(TEMPLATES[name],{cache:'no-cache'});
 if(!response.ok)throw new Error('Cannot load '+TEMPLATES[name]+' ('+response.status+')');
 const markup=await response.text();
 cache.set(name,markup);
 return markup;
}
function el(id){return host.querySelector('#'+id);}
function previewPoster(mount,persona,stage){
 const data=global.GukminGame.posterData(persona);
 data.stage=stage||data.stage;
 mount.append(global.GukminPoster.create(data));
}
function mountWaiting(navigate){
 const persona=global.GukminPlayer.ensure();
 function render(){
  const item=global.GukminPlayer.ensure();
  el('waitingName').textContent=item.name;
  el('waitingBackground').textContent=item.birthplace+' · '+item.family;
  const mount=el('waitingPosterMount');
  mount.replaceChildren();
  previewPoster(mount,item,'출생');
 }
 el('enterGame').addEventListener('click',()=>navigate('game'));
 el('previewResult').addEventListener('click',()=>navigate('result'));
 el('rerollPersona').addEventListener('click',()=>{
  const next=global.GukminPlayer.generate();
  global.GukminPlayer.save(next);
  render();
 });
 render();
 return ()=>{};
}
function mountResult(navigate){
 const persona=global.GukminPlayer.ensure();
 previewPoster(el('resultPosterMount'),persona,'결과 미리보기');
 el('resultBack').addEventListener('click',()=>navigate('waiting'));
 return ()=>{};
}
async function navigate(name){
 const current=++request;
 host.setAttribute('aria-busy','true');
 try{
  const html=await getTemplate(name);
  if(current!==request)return;
  if(cleanup)cleanup();
  cleanup=null;
  const template=document.createElement('template');
  template.innerHTML=html;
  host.replaceChildren(template.content.cloneNode(true));
  document.body.dataset.screen=name;
  if(name==='game')cleanup=global.GukminGame.mount(host,navigate);
  else if(name==='result')cleanup=mountResult(navigate);
  else cleanup=mountWaiting(navigate);
 }catch(error){
  if(current!==request)return;
  console.error('Screen failed to load:',error);
  if(cleanup)cleanup();
  cleanup=null;
  host.replaceChildren();
  const box=document.createElement('main');
  box.className='screen-error';
  const title=document.createElement('h1');title.textContent='화면을 불러오지 못했어';
  const desc=document.createElement('p');desc.textContent='인터넷 연결 또는 정적 파일 경로를 확인해 줘.';
  const retry=document.createElement('button');retry.type='button';retry.textContent='다시 시도';
  retry.addEventListener('click',()=>navigate(name));
  box.append(title,desc,retry);
  host.append(box);
 }finally{if(current===request)host.removeAttribute('aria-busy');}
}
global.GukminScreens=Object.freeze({navigate});
navigate('waiting');
})(window);
