/* GitHub Pages-safe page router. Each HTML view is a standalone document.
 * No runtime fetch, no injection of partial HTML, no dependency on #app.
 */
(function(global){
'use strict';
const PAGES=new Set(['waiting','game','result']);
const RELEASE='lobby-results-20261022';
const screen=document.body.dataset.screen;
const reduceMotion=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
let navigating=false;
global.addEventListener('pageshow',event=>{if(!event.persisted)return;navigating=false;document.documentElement.classList.remove('page-leaving');});
function navigate(name){
 if(!PAGES.has(name))throw new Error('Unknown page: '+name);
 const url=new URL('html/'+name+'.html',document.baseURI);
 url.searchParams.set('v',RELEASE);
 if(navigating)return;
 navigating=true;
 if(reduceMotion)global.location.assign(url.href);
 else{document.documentElement.classList.add('page-leaving');global.setTimeout(()=>global.location.assign(url.href),160);}
}
function renderPoster(target,persona,stage,phrase){
 const data=global.GukminGame.posterData(persona);
 if(phrase)data.phrase=phrase;
 target.replaceChildren(global.GukminPoster.create(data));
}
function initWaiting(){
 const player=global.GukminPlayer;
 const name=document.getElementById('waitingName');
 const background=document.getElementById('waitingBackground');
 const mount=document.getElementById('waitingPosterMount');
 const start=document.getElementById('enterGame'),reroll=document.getElementById('rerollPersona');
 const note=document.getElementById('waitingSaveNotice');
 const gender=document.getElementById('personaGender');
 const input=document.getElementById('personaName'),hint=document.getElementById('nameHint');
 const progressed=p=>!!(p.simulation||p.age>player.birthDefaults.age);
 function show(){
   const s=player.ensure();
   name.textContent=s.name;if(s.attributes?.lifeEndReason||s.attributes?.retryEndReason==='정신병 한계'){const mark=document.createElement('small');mark.className='deceased-mark';mark.textContent='故';name.append(mark);}input.value=s.name;gender.value=player.genderOf(s);gender.disabled=progressed(s);input.disabled=progressed(s);document.getElementById('randomName').disabled=progressed(s);
   hint.textContent=progressed(s)?'진행 중인 인생의 이름은 유지됩니다.':'1~12자 · 출생 전에 이름을 정할 수 있습니다.';
   background.textContent=s.birthplace+' · '+s.family;
   const saved=progressed(s);
   start.textContent=saved?'이어서 플레이하기 →':'새 게임 시작 →';
   document.getElementById('homeStartTitle').textContent=saved?'이어지는 당신의 이야기.':'당신의 이름을 남기세요.';
   reroll.textContent=saved?'새 인생 · 기록 초기화':'배경 다시 뽑기 ↻';
   note.textContent=saved?'진행 중인 인생과 선택 기록이 저장되어 있습니다.':'현재 출생~대학 입시까지 플레이 가능 · 사회·정치 콘텐츠 준비 중';
   renderPoster(mount,s,saved?'진행 중':'출생');
 }
 // Intro is a view-only transition. It does not advance turns or reroll the persona.
 const intro=document.getElementById('birthIntro');
 const introName=document.getElementById('birthIntroName');
 const introFamily=document.getElementById('birthIntroFamily');
 const countdown=document.getElementById('birthIntroCountdown');
 const birthProgress=document.getElementById('birthIntroProgress');
 const birthFill=document.getElementById('birthIntroFill');
 const introBackground=document.getElementById('birthIntroBackground');
 const skip=document.getElementById('birthIntroSkip');
 const introTrait=document.getElementById('birthIntroTrait');
 const fiction=document.getElementById('fictionNotice'),fictionSkip=document.getElementById('skipFictionNotice');
 let fictionTimer=null,fictionTick=null,fictionClosing=false;
 let introActive=false,introTimer=null,introTick=null;
 function finishIntro(){
   if(!introActive)return;
   global.clearTimeout(introTimer);
   global.clearInterval(introTick);
   navigate('game');
 }
 function beginIntro(){
   if(introActive||fiction.open)return;
   if(!progressed(player.ensure())){
     const value=input.value.trim();
     input.setCustomValidity(value&&value.length<=12&&!/[\u0000-\u001f\u007f]/.test(value)?'':'이름을 1~12자로 입력해 주세요.');
     if(!input.reportValidity())return;
     const updated={...player.ensure(),name:value,gender:gender.value,portraitVariant:gender.value};
     if(!player.save(updated)){hint.textContent='이름을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.';return;}
     show();
   }
   const persona=player.ensure();
   if(progressed(persona)){navigate('game');return;}
   document.querySelector('.waiting-screen').inert=true;
   fictionClosing=false;fiction.showModal();fictionSkip.focus({preventScroll:true});
   const duration=7000,start=global.performance.now(),progress=document.getElementById('fictionProgress');
   progress.value=0;
   fictionTick=global.setInterval(()=>{progress.value=Math.min(1,(global.performance.now()-start)/duration);},100);
   fictionTimer=global.setTimeout(continueToBirth,duration);
 }
 async function continueToBirth(){
   if(!fiction.open||fictionClosing)return;
   fictionClosing=true;global.clearTimeout(fictionTimer);global.clearInterval(fictionTick);document.getElementById('fictionProgress').value=1;
   if(!reduceMotion)await fiction.animate([{opacity:1},{opacity:0}],{duration:240,easing:'ease-in'}).finished.catch(()=>{});
   if(!fiction.open)return;
   fiction.close();fictionClosing=false;showBirth(player.ensure());
 }
 function showBirth(persona){
   introName.textContent=persona.name;
   introBackground.textContent=persona.birthplace;
   introFamily.textContent=persona.family;
   const tier=player.wealthTiers.find(item=>item.id===persona.familyTier);
   introTrait.replaceChildren();
   if(tier)introTrait.append(global.GukminStatus.traitToken(tier.name));
   introActive=true;
   intro.hidden=false;
   intro.classList.add('is-playing');
   document.querySelector('.waiting-screen').inert=true;
   skip.focus({preventScroll:true});
   const duration=10000,start=global.performance.now();
   birthFill.style.transform='scaleX(0)';
   function updateCountdown(){
     const elapsed=Math.min(duration,global.performance.now()-start);
     countdown.textContent=Math.max(0,Math.ceil((duration-elapsed)/1000))+'초 후 출생';
     birthProgress.value=elapsed/1000;
     birthFill.style.transform='scaleX('+(elapsed/duration)+')';
   }
   updateCountdown();
   introTick=global.setInterval(updateCountdown,100);
   introTimer=global.setTimeout(finishIntro,duration);
 }
 input.addEventListener('input',()=>{input.setCustomValidity('');for(const [key,names] of Object.entries(global.GukminData.namesByGender))if(names.includes(input.value.trim()))gender.value=key;const s={...player.ensure(),gender:gender.value,portraitVariant:gender.value};name.textContent=input.value.trim()||s.name;renderPoster(mount,{...s,name:name.textContent},'출생');});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing)beginIntro();});
 document.getElementById('randomName').addEventListener('click',()=>{input.value=player.randomName(gender.value);input.dispatchEvent(new Event('input'));input.focus();});
 gender.addEventListener('change',()=>{const known=Object.values(global.GukminData.namesByGender).flat().includes(input.value.trim());if(known)input.value=player.randomName(gender.value);input.dispatchEvent(new Event('input'));});
 document.getElementById('enterGame').addEventListener('click',beginIntro);
 skip.addEventListener('click',finishIntro);
 fictionSkip.addEventListener('click',continueToBirth);
 fiction.addEventListener('cancel',event=>{event.preventDefault();continueToBirth();});
 global.addEventListener('pagehide',()=>{global.clearTimeout(fictionTimer);global.clearInterval(fictionTick);global.clearTimeout(introTimer);global.clearInterval(introTick);});
 global.addEventListener('pageshow',event=>{if(!event.persisted)return;fictionClosing=false;introActive=false;if(fiction.open)fiction.close();intro.hidden=true;intro.classList.remove('is-playing');document.querySelector('.home-lobby').inert=false;show();});
 document.addEventListener('keydown',event=>{
   if(introActive&&event.key==='Escape'){event.preventDefault();finishIntro();}
 });
 document.getElementById('previewResult').addEventListener('click',()=>navigate('result'));
 reroll.addEventListener('click',()=>{
   if(progressed(player.ensure())&&!global.confirm('이 인생의 선택·사건 기록을 모두 초기화하고 다시 시작할까?'))return;
   if(!player.save(player.generate()))throw new Error('새 인생 저장 실패');
   show();
 });
 show();
}
function initResult(){global.GukminResultView.mount({navigate,renderPoster});}

try{
 if(screen==='waiting')initWaiting();
 else if(screen==='game')global.GukminGame.mount(document,navigate);
 else if(screen==='result')initResult();
 else throw new Error('Missing or invalid data-screen attribute: '+screen);
}catch(error){
 console.error('국민의 부름 화면 초기화 실패 ('+screen+'):',error);
 const notice=document.createElement('div');
 notice.className='screen-error';
 notice.setAttribute('role','alert');
 notice.textContent='화면 초기화 오류: '+(error instanceof Error?error.message:String(error))+' — 새로고침하거나 대기 화면으로 돌아가 줘.';
 const link=document.createElement('a');
 link.href='html/waiting.html';link.textContent='대기 화면';
 notice.append(link);
 document.body.replaceChildren(notice);
}
function registerOffline(){
 if(!('serviceWorker' in navigator))return;
 const worker=new URL('sw.js',document.baseURI);worker.searchParams.set('v',RELEASE);
 navigator.serviceWorker.register(worker.href,{scope:new URL('./',document.baseURI).pathname,updateViaCache:'none'}).catch(error=>console.warn('오프라인 준비를 완료하지 못했습니다.',error));
}
if(document.readyState==='complete')registerOffline();else global.addEventListener('load',registerOffline,{once:true});
global.GukminScreens=Object.freeze({navigate});
})(window);
