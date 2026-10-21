/* GitHub Pages-safe page router. Each HTML view is a standalone document.
 * No runtime fetch, no injection of partial HTML, no dependency on #app.
 */
(function(global){
'use strict';
const PAGES=new Set(['waiting','game','result']);
const RELEASE='academic-layout-20261021';
const screen=document.body.dataset.screen;
function navigate(name){
 if(!PAGES.has(name))throw new Error('Unknown page: '+name);
 const url=new URL('html/'+name+'.html',document.baseURI);
 url.searchParams.set('v',RELEASE);
 global.location.assign(url.href);
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
 const input=document.getElementById('personaName'),hint=document.getElementById('nameHint');
 const progressed=p=>!!(p.simulation||p.age>0);
 function show(){
   const s=player.ensure();
   name.textContent=s.name;input.value=s.name;input.disabled=progressed(s);document.getElementById('randomName').disabled=progressed(s);
   hint.textContent=progressed(s)?'진행 중인 인생의 이름은 유지됩니다.':'1~12자 · 출생 전에 이름을 정할 수 있습니다.';
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
   if(!progressed(player.ensure())){
     const value=input.value.trim();
     input.setCustomValidity(value&&value.length<=12&&!/[\u0000-\u001f\u007f]/.test(value)?'':'이름을 1~12자로 입력해 주세요.');
     if(!input.reportValidity())return;
     const updated={...player.ensure(),name:value};
     if(!player.save(updated)){hint.textContent='이름을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.';return;}
     show();
   }
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
 input.addEventListener('input',()=>{input.setCustomValidity('');const s=player.ensure();name.textContent=input.value.trim()||s.name;renderPoster(mount,{...s,name:name.textContent},'출생');});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing)beginIntro();});
 document.getElementById('randomName').addEventListener('click',()=>{input.value=player.generate().name;input.dispatchEvent(new Event('input'));input.focus();});
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
 const P=global.GukminPlayer,saved=P.load(),persona=saved||P.generate(),a=persona.attributes||{};
 const reason=a.lifeEndReason||a.retryEndReason;
 const destination=a.admissionDestination;
 const finished=!!reason||['college','employment','finished'].includes(destination);
 const title=!saved?'아직 쓰이지 않은 이야기':reason?'잠시 멈춘, 하나의 삶':destination==='college'?'더 넓은 세상으로':destination==='employment'?'교문 밖, 나의 길로':finished?'이번 삶의 마지막 장':'아직, 쓰는 중입니다';
 const school=P.schoolsOf(persona).at(-1);
 const summary=!saved?'대기 화면에서 당신의 첫 인생을 시작해 보세요.':reason?persona.name+' · '+persona.age+'살 · '+reason:persona.name+' · '+persona.age+'살 · '+(finished?'학생 시절의 기록을 남깁니다. 다음 생애 콘텐츠는 준비 중입니다.':'현재까지의 선택을 모았습니다. 이야기는 계속됩니다.');
 const put=(id,value)=>document.getElementById(id).textContent=value;
 const node=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
 put('resultTitle',title);put('resultSummary',summary);put('resultEyebrow',finished?'LIFE RECORD · 한 장의 마침표':'LIFE RECORD · 지금까지의 나');
 renderPoster(document.getElementById('resultPosterMount'),persona,finished?'기록 완료':'진행 중',reason?'여기까지,\n나의 이야기':destination==='college'?'새로운 문 앞에\n서 있는 나':destination==='employment'?'교문 밖에서\n시작하는 내일':undefined);
 const facts=[['살아온 시간',persona.age+'년'],['마지막 학교',school?.name||'입학 전'],['남은 재산',persona.stats.money.toLocaleString('ko-KR')+'원'],['나의 선택',Object.values(persona.simulation?.choices||{}).filter(c=>c.status==='closed').length+'번']];
 const offer=a.earlyStatus==='accepted'?a.earlyOffer:a.regularOffer;
 if(destination==='college'&&offer)facts.push(['다음 목적지',offer]);
 else if(destination==='employment')facts.push(['다음 목적지','사회 진출 준비']);
 facts.push(['정신병',persona.stats.stress+'/25'],['관계',persona.stats.relations+'/25']);
 for(const [id,label,submitted] of [['schoolScore','최종 내신',a.highFinalSubmitted],['exam','수능',a.csatSubmitted]])if(Number.isFinite(persona.stats[id]))facts.push([label,submitted?global.GukminGrades.report(id,persona.stats[id],'high').display:'아직 확정되지 않음']);
 for(const [key,value] of facts){const item=node('div','');item.append(node('small',key),node('strong',value));document.getElementById('resultFacts').append(item);}
 for(const trait of persona.traits||[]){
  const name=typeof trait==='string'?trait:trait?.name;if(!name)continue;
  const def=P.traitDefinitions[name]||{};
  if(def.hidden){if(name.startsWith('관심-')&&!P.hasTrait(persona,name.slice(3)))document.getElementById('resultTraits').append(global.GukminStatus.createToken({type:'interest',name:name.slice(3)}));continue;}
  document.getElementById('resultTraits').append(global.GukminStatus.traitToken(name));
 }
 const history=(persona.history||[]).filter(h=>h.display!=='hidden');
 const major=history.filter(h=>h.importance==='major');
 const memories=(major.length?major:history).slice(-5);
 for(const h of memories){const li=node('li','');li.append(node('small',(h.age??persona.age)+'살'),node('strong',h.title||'선택의 순간'));document.getElementById('resultHistory').append(li);}
 if(!memories.length)document.getElementById('resultHistory').append(node('li','첫 번째 선택을 기다리고 있습니다.'));
 const shareText=['국민의 부름',title,summary,...facts.map(([k,v])=>k+' · '+v)].join('\n');
 const link=new URL('index.html',document.baseURI).href;
 if(!saved){document.querySelector('.result-screen').classList.add('is-empty');document.getElementById('resultFacts').hidden=true;document.getElementById('resultTraits').hidden=true;document.querySelector('.result-visual').hidden=true;document.querySelector('.result-memories').hidden=true;}
 document.getElementById('shareResult').disabled=!saved;
 document.getElementById('downloadResult').disabled=!saved;
 document.getElementById('shareResult').addEventListener('click',async()=>{
  try{
   if(navigator.share){await navigator.share({title:'국민의 부름 · '+persona.name,text:shareText,url:link});put('shareNotice','기록을 공유했습니다.');}
   else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareText+'\n'+link);put('shareNotice','기록과 게임 링크를 복사했습니다.');}
   else put('shareNotice','이 브라우저에서는 이미지 저장을 이용해 주세요.');
  }catch(error){put('shareNotice',error.name==='AbortError'?'공유를 취소했습니다.':'공유하지 못했습니다. 이미지 저장을 이용해 주세요.');}
 });
 document.getElementById('downloadResult').addEventListener('click',()=>{
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
  const ctx=canvas.getContext('2d');
  if(!ctx){put('shareNotice','이미지를 만들 수 없는 브라우저입니다.');return;}
  ctx.fillStyle='#171b25';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#bde4cc';ctx.fillRect(64,70,58,8);
  const line=(text,y,size=32,color='#f5f0e8')=>{ctx.fillStyle=color;ctx.font='600 '+size+'px sans-serif';ctx.fillText(text,72,y,936);};
  line('국민의 부름 / LIFE RECORD',150,28,'#bde4cc');line(title,265,58);line(persona.name+'의 이야기',350,46);line(persona.age+'살 · '+(reason||(destination==='college'?offer:destination==='employment'?'사회 진출 준비':school?.name)||'첫 번째 장'),412,30,'#bbb9c4');
  facts.slice(0,4).forEach(([k,v],i)=>{line(k,530+i*105,25,'#aaa8b5');line(v,575+i*105,38);});
  line('기억할 순간',1030,26,'#bde4cc');memories.slice(-3).forEach((h,i)=>line(h.title||'선택의 순간',1088+i*50,28));line('당신은 어떤 삶을 살겠습니까?',1275,26,'#aaa8b5');
  canvas.toBlob(blob=>{if(!blob){put('shareNotice','이미지 생성에 실패했습니다.');return;}const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='국민의부름-'+persona.name.replace(/[^가-힣a-zA-Z0-9_-]/g,'_')+'.png';anchor.click();global.setTimeout(()=>URL.revokeObjectURL(url),1000);put('shareNotice','공유할 기록 이미지를 저장했습니다.');},'image/png');
 });
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
