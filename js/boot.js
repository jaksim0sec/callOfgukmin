/* GitHub Pages-safe page router. Each HTML view is a standalone document.
 * No runtime fetch, no injection of partial HTML, no dependency on #app.
 */
(function(global){
'use strict';
const PAGES=new Set(['waiting','game','result']);
const RELEASE='character-paths-20261020';
const screen=document.body.dataset.screen;
function navigate(name){
 if(!PAGES.has(name))throw new Error('Unknown page: '+name);
 const url=new URL('html/'+name+'.html',document.baseURI);
 url.searchParams.set('v',RELEASE);
 global.location.assign(url.href);
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
 const start=document.getElementById('enterGame'),reroll=document.getElementById('rerollPersona');
 const note=document.getElementById('waitingSaveNotice');
 const progressed=p=>!!(p.simulation||p.age>0);
 function show(){
   const s=player.ensure();
   name.textContent=s.name;
   background.textContent=s.birthplace+' · '+s.family;
   const saved=progressed(s);
   start.textContent=saved?'이어서 플레이하기 →':'인생 시작하기 →';
   reroll.textContent=saved?'새 인생 시작하기 (기록 초기화)':'새 출생 배경 뽑기';
   note.textContent=saved?'기존 선택 기록을 이어서 플레이 중. 새 스토리를 처음부터 경험하려면 새 인생을 시작해.':'선택에 따라 다른 사건이 벌어지는 인생 이야기.';
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
   if(progressed(persona)){navigate('game');return;}
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
 document.getElementById('enterGame').addEventListener('click',beginIntro);
 skip.addEventListener('click',finishIntro);
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
