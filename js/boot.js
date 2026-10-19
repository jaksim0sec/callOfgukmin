/* GitHub Pages-safe page router. Each HTML view is a standalone document.
 * No runtime fetch, no injection of partial HTML, no dependency on #app.
 */
(function(global){
'use strict';
const PAGES=new Set(['waiting','game','result']);
const screen=document.body.dataset.screen;
function navigate(name){
 if(!PAGES.has(name))throw new Error('Unknown page: '+name);
 global.location.assign(new URL('html/'+name+'.html',document.baseURI).href);
}
function renderPoster(target,persona,stage){
 const data=global.GukminGame.posterData(persona);
 data.stage=stage;
 target.replaceChildren(global.GukminPoster.create(data));
}
function initWaiting(){
 const player=global.GukminPlayer;
 const name=document.getElementById('waitingName');
 const background=document.getElementById('waitingBackground');
 const mount=document.getElementById('waitingPosterMount');
 function show(){
   const s=player.ensure();
   name.textContent=s.name;
   background.textContent=s.birthplace+' · '+s.family;
   renderPoster(mount,s,'출생');
 }
 // Intro is a view-only transition. It does not advance turns or reroll the persona.
 const intro=document.getElementById('birthIntro');
 const introName=document.getElementById('birthIntroName');
 const introFamily=document.getElementById('birthIntroFamily');
 const countdown=document.getElementById('birthIntroCountdown');
 const birthProgress=document.getElementById('birthIntroProgress');
 const introBackground=document.getElementById('birthIntroBackground');
 const skip=document.getElementById('birthIntroSkip');
 const introTrait=document.getElementById('birthIntroTrait');
 let introActive=false,introTimer=null,introTick=null;
 function finishIntro(){
   if(!introActive)return;
   global.clearTimeout(introTimer);
   global.clearInterval(introTick);
   navigate('game');
 }
 function beginIntro(){
   if(introActive)return;
   const persona=player.ensure();
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
   function updateCountdown(){
     const elapsed=Math.min(duration,global.performance.now()-start);
     countdown.textContent=Math.max(0,Math.ceil((duration-elapsed)/1000))+'초 후 출생';
     birthProgress.value=elapsed/1000;
   }
   updateCountdown();
   introTick=global.setInterval(updateCountdown,100);
   introTimer=global.setTimeout(finishIntro,duration);
 }
 document.getElementById('enterGame').addEventListener('click',beginIntro);
 skip.addEventListener('click',finishIntro);
 document.addEventListener('keydown',event=>{
   if(introActive&&event.key==='Escape'){event.preventDefault();finishIntro();}
 });
 document.getElementById('previewResult').addEventListener('click',()=>navigate('result'));
 document.getElementById('rerollPersona').addEventListener('click',()=>{
   player.save(player.generate());
   show();
 });
 show();
}
function initResult(){
 const persona=global.GukminPlayer.ensure();
 renderPoster(document.getElementById('resultPosterMount'),persona,'결과 미리보기');
 document.getElementById('resultBack').addEventListener('click',()=>navigate('waiting'));
}
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
global.GukminScreens=Object.freeze({navigate});
})(window);
