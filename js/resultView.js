/* Life recap and sharing are read-only. Only the explicit replay action starts a new save. */
(function(global){'use strict';
function isDeceased(persona){const a=persona.attributes||{};return !!a.lifeEndReason||a.retryEndReason==='정신병 한계';}
function memoriesOf(history){
 const seen=new Set(),visible=(history||[]).filter(h=>{
  const title=String(h.title||'').replace(/\*\*|==/g,'').trim();
  if(h.display==='hidden'||/exam-prelude:|exam-classroom:/.test(h.source||'')||/시험 기간이 다가|교실의 시험 준비 분위기/.test(title)||!title||seen.has(title))return false;
  seen.add(title);return true;
 });
 const major=visible.filter(h=>h.importance==='major'),pool=major.length>=3?major:visible;
 return pool.length<=5?pool:Array.from({length:5},(_,i)=>pool[Math.round(i*(pool.length-1)/4)]);
}
function mount({navigate,renderPoster}){
 const P=global.GukminPlayer,saved=P.load(),persona=saved||P.generate(),a=persona.attributes||{};
 const reason=a.lifeEndReason||a.retryEndReason;
 const destination=a.admissionDestination;
 const finished=!!reason||(a.societyActive?!!a.societyComplete:['college','employment','finished'].includes(destination));
 const title=!saved?'아직 쓰이지 않은 이야기':reason==='백수 엔딩'?'서른, 백수 엔딩':reason?'잠시 멈춘, 하나의 삶':a.politicalEntryReady?'세상에 나의 목소리를':a.societyActive?'사회에서 쓰는 나의 이야기':destination==='college'?'더 넓은 세상으로':destination==='employment'?'교문 밖, 나의 길로':finished?'이번 삶의 마지막 장':'아직, 쓰는 중입니다';
 const schools=P.schoolsOf(persona),school=schools.at(-1);
 const summary=!saved?'대기 화면에서 당신의 첫 인생을 시작해 보세요.':reason?persona.name+' · '+persona.age+'살 · '+reason:persona.name+' · '+persona.age+'살 · '+(a.societyActive?(a.politicalEntryReady?(a.politicalPathLabel+' · 정치 입문을 준비합니다.'):'학업과 병역, 일하며 남긴 선택을 모았습니다.'):(finished?'학생 시절의 기록을 남깁니다. 다음 생애 콘텐츠는 준비 중입니다.':'현재까지의 선택을 모았습니다. 이야기는 계속됩니다.'));
 const put=(id,value)=>document.getElementById(id).textContent=value;
 const node=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
 put('resultCardName',persona.name);if(isDeceased(persona)){const mark=node('small','故');mark.className='deceased-mark';document.getElementById('resultCardName').append(mark);}put('resultCardStage',persona.age+'살 · '+(reason||persona.job||'성장 중'));
 put('resultTitle',title);put('resultSummary',summary);put('resultEyebrow',finished?'LIFE RECORD · 한 장의 마침표':'LIFE RECORD · 지금까지의 나');
 renderPoster(document.getElementById('resultPosterMount'),persona,finished?'기록 완료':'진행 중',reason?'여기까지,\n나의 이야기':destination==='college'?'새로운 문 앞에\n서 있는 나':destination==='employment'?'교문 밖에서\n시작하는 내일':undefined);
 const facts=[['나이',persona.age+'살'],['마지막 학교',school?.name||'입학 전'],['남은 재산',persona.stats.money.toLocaleString('ko-KR')+'원'],['나의 선택',Object.values(persona.simulation?.choices||{}).filter(c=>c.status==='closed').length+'번']];
 if(a.societyActive){facts.push(['병역',a.militaryStatus+' · '+a.militaryReason],['경력',(a.careerCurrent||'첫 일 준비')+' · '+(a.careerMonths||0)+'개월']);if(a.studentDebt)facts.push(['학자금 원금',a.studentDebt.toLocaleString('ko-KR')+'원']);if(a.politicalPathLabel)facts.push(['정치 입문 준비',a.politicalPathLabel]);}
 const offer=a.earlyStatus==='accepted'?a.earlyOffer:a.regularOffer;
 if(destination==='college'&&offer)facts.push(['다음 목적지',offer]);
 else if(destination==='employment')facts.push(['다음 목적지','사회 진출 준비']);
 if((a.admissionAttempts||1)>1)facts.push(['입시 재도전',(a.admissionAttempts-1)+'회'],['재수학원 지원',(a.retakeSupportUsed||0)+'회'],['경력 공백',(a.careerGapYears||0)+'년']);
 facts.push(['압박',persona.stats.stress+'/25'],['정신병',(persona.stats.illness||0)+'/5'],['관계',persona.stats.relations+'/25']);
 for(const [id,label,submitted] of [['schoolScore','최종 내신',a.highFinalSubmitted],['exam','수능',a.csatSubmitted]])if(Number.isFinite(persona.stats[id]))facts.push([label,submitted?global.GukminGrades.report(id,persona.stats[id],'high').display:'아직 확정되지 않음']);
 const career=document.getElementById('resultCareer');
 for(const entry of schools.slice(-3)){const line=node('div','');line.className='result-career-entry';line.append(global.GukminStatus.createToken({type:'school',label:(entry.status==='graduated'?'졸업 · ':entry.status==='dropout'?'지난 학교 · ':entry.status==='leave'?'휴학 · ':'재학 · ')+entry.name}));career.append(line);}
 if(destination==='college'&&offer)career.append(global.GukminStatus.createToken({label:'진학 · '+offer,icon:'graduation'}));
 for(const role of (persona.roles||[]).slice(-2))career.append(global.GukminStatus.createToken({label:typeof role==='string'?role:role.label||role.name,icon:'flag'}));
 if(!career.childElementCount)career.append(global.GukminStatus.createToken({label:'아직 입학 전',icon:'sparkle'}));
 if(a.societyActive){if(a.careerCurrent)career.append(global.GukminStatus.createToken({label:a.careerCurrent+' · '+(a.careerMonths||0)+'개월',icon:'flag'}));career.append(global.GukminStatus.createToken({label:a.militaryStatus,icon:'flag'}));if(a.politicalPathLabel)career.append(global.GukminStatus.createToken({label:a.politicalPathLabel,icon:'speech'}));}
 const cardStats=document.getElementById('resultCardStats');
 for(const [label,icon] of [[persona.stats.money.toLocaleString('ko-KR')+'원','savings'],['관계 '+persona.stats.relations+'/25','users'],[(persona.stats.illness?'정신병 '+persona.stats.illness+'/5':'압박 '+persona.stats.stress+'/25'),'pulse']])cardStats.append(global.GukminStatus.createToken({label,icon}));
 for(const [key,value] of facts){const item=node('div','');item.append(node('small',key),node('strong',value));document.getElementById('resultFacts').append(item);}
 const shownTraits=[];
 for(const trait of persona.traits||[]){
  const name=typeof trait==='string'?trait:trait?.name;if(!name)continue;
  const def=P.traitDefinitions[name]||{};
  if(def.hidden){if(name.startsWith('관심-')&&!P.hasTrait(persona,name.slice(3)))document.getElementById('resultTraits').append(global.GukminStatus.createToken({type:'interest',name:name.slice(3)}));continue;}
  shownTraits.push(name);if(shownTraits.length<=6)document.getElementById('resultTraits').append(global.GukminStatus.traitToken(name));
 }
 if(shownTraits.length>6){document.getElementById('resultTraitArchive').hidden=false;for(const name of shownTraits)document.getElementById('resultAllTraits').append(global.GukminStatus.traitToken(name));}
 if(shownTraits.length>6)document.getElementById('resultTraits').append(global.GukminStatus.createToken({label:'외 '+(shownTraits.length-6)+'개',icon:'sparkle'}));
 const history=(persona.history||[]).filter(h=>h.display!=='hidden');
 const memories=memoriesOf(history);
 for(const h of memories){const li=node('li','');li.append(node('small',(h.age??persona.age)+'살'),node('strong',h.title||'선택의 순간'));document.getElementById('resultHistory').append(li);}
 if(!memories.length)document.getElementById('resultHistory').append(node('li','첫 번째 선택을 기다리고 있습니다.'));
 const shareText=['국민의 부름',title,summary,...facts.map(([k,v])=>k+' · '+v)].join('\n');
 const link=new URL('index.html',document.baseURI).href;
 if(!saved){document.getElementById('resultShareCard').hidden=true;document.querySelector('.result-screen').classList.add('is-empty');document.getElementById('resultFacts').hidden=true;document.getElementById('resultTraits').hidden=true;document.querySelector('.result-visual').hidden=true;document.querySelector('.result-memories').hidden=true;}
 const details=document.getElementById('resultDetails');
 details.open=!!saved&&global.matchMedia('(min-width:48em)').matches;
 details.hidden=!saved;
 document.getElementById('replayGame').textContent=saved?'다시 플레이 ↻':'새 게임 시작 →';
 document.getElementById('shareResult').disabled=!saved;
 document.getElementById('downloadResult').disabled=!saved;
 document.getElementById('shareResult').addEventListener('click',async()=>{
  try{
   if(navigator.share){await navigator.share({title:'국민의 부름 · '+persona.name,text:shareText,url:link});put('shareNotice','기록을 공유했습니다.');}
   else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareText+'\n'+link);put('shareNotice','기록과 게임 링크를 복사했습니다.');}
   else put('shareNotice','이 브라우저에서는 이미지 저장을 이용해 주세요.');
  }catch(error){put('shareNotice',error.name==='AbortError'?'공유를 취소했습니다.':'공유하지 못했습니다. 이미지 저장을 이용해 주세요.');}
 });
 const image=async()=>compose({persona,title,reason,offer:destination==='college'?offer:null,schools,traits:shownTraits,memories});
 document.getElementById('downloadResult').addEventListener('click',async()=>{
  const button=document.getElementById('downloadResult');button.disabled=true;
  try{const canvas=await image();await new Promise((resolve,reject)=>canvas.toBlob(blob=>{if(!blob){reject(new Error('이미지 생성 실패'));return;}const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download='국민의부름-'+persona.name.replace(/[^가-힣a-zA-Z0-9_-]/g,'_')+'.png';anchor.click();global.setTimeout(()=>URL.revokeObjectURL(url),1000);resolve();},'image/png'));put('shareNotice','포스터와 학력·경력을 합친 4:5 이미지를 저장했습니다.');}
  catch(error){console.error(error);put('shareNotice','이미지 저장에 실패했습니다. 다시 시도해 주세요.');}finally{button.disabled=false;}
 });
 if(saved)recap(persona,memories,title);
 document.getElementById('resultBack').addEventListener('click',()=>navigate('waiting'));
 document.getElementById('replayGame').addEventListener('click',()=>{
  if(saved&&!global.confirm('현재 인생의 기록을 초기화하고 다시 플레이할까요?'))return;
  if(!P.save(P.generate())){put('shareNotice','새 인생을 저장하지 못했습니다. 다시 시도해 주세요.');return;}
  navigate('waiting');
 });
}
function recap(persona,memories,title){
 const dialog=document.getElementById('resultRecap');
 const clean=s=>String(s||'').replace(/\*\*|==/g,'');
 const death=isDeceased(persona),cause=persona.attributes?.lifeEndReason||persona.attributes?.retryEndReason;
 const frames=[...(death?[{scene:'death',age:persona.age,title:cause+'로 사망했습니다.',detail:persona.name+'의 이야기를 돌아봅니다.'}]:[]),{age:1,title:persona.name+'의 이야기가 시작됐다',detail:'작은 선택들이 하나의 삶이 되었습니다.'},...memories,{age:persona.age,title,detail:persona.attributes?.lifeEndReason||persona.attributes?.retryEndReason||'지금까지의 선택을 한 장에 담았습니다.'}];
 const reduce=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let index=0,timer;
 const finish=()=>{global.clearTimeout(timer);if(dialog.open)dialog.close();};
 const show=()=>{
  const frame=frames[index];dialog.dataset.scene=frame.scene||'life';document.getElementById('skipResultRecap').textContent=frame.scene==='death'?'인생 돌아보기 →':'건너뛰기 ↗';document.getElementById('recapAge').textContent=(frame.age??persona.age)+'살 · LIFE CHAPTER';
  document.getElementById('recapTitle').textContent=clean(frame.title);document.getElementById('recapDetail').textContent=clean(frame.detail);
  document.getElementById('recapCount').textContent=(index+1)+' / '+frames.length;document.getElementById('recapProgress').max=frames.length;document.getElementById('recapProgress').value=index+1;
  if(!reduce)document.getElementById('resultRecapFrame').animate([{opacity:0,transform:'translate(-50%,calc(-50% + .6rem))'},{opacity:1,transform:'translate(-50%,-50%)'}],{duration:450,easing:'ease-out'});
  timer=global.setTimeout(()=>{index++;if(index<frames.length)show();else finish();},reduce?700:frame.scene==='death'?2600:1900);
 };
 document.getElementById('skipResultRecap').addEventListener('click',()=>{if(frames[index]?.scene==='death'){global.clearTimeout(timer);index++;show();}else finish();});dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('close',()=>{global.clearTimeout(timer);document.getElementById('replayGame').focus({preventScroll:true});});
 global.addEventListener('pagehide',()=>global.clearTimeout(timer),{once:true});dialog.showModal();show();
}
async function compose({persona,title,reason,offer,schools,traits}){
 const poster=await global.GukminPoster.ready(document.querySelector('#resultPosterMount .gk-poster'));
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('Canvas unavailable');
 const text=(value,x,y,size=30,color='#37323b',width=950,weight=650)=>{ctx.font=weight+' '+size+'px system-ui,sans-serif';const sizeFit=Math.min(size,size*width/Math.max(1,ctx.measureText(String(value)).width));ctx.font=weight+' '+sizeFit+'px system-ui,sans-serif';ctx.fillStyle=color;ctx.fillText(String(value),x,y);return sizeFit;};
 const box=(x,y,w,h,color,r=18)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();};
 const lines=(value,x,y,width,size=28,maxLines=3)=>{
  ctx.font='650 '+size+'px system-ui,sans-serif';let line='',row=0;
  const characters=Array.from(String(value));for(let i=0;i<characters.length;i++){const character=characters[i];if(ctx.measureText(line+character).width>width){text(line,x,y+row*(size+10),size,'#37323b',width);row++;line='';if(row===maxLines-1){line=characters.slice(i).join('');break;}}line+=character;}
  if(line)text(line,x,y+row*(size+10),size,'#37323b',width);return (row+1)*(size+10);
 };
 const pill=(value,x,y,width,color='#655175',height=58,size=25)=>{box(x,y,width,height,color,height/2);text(value,x+20,y+height*.66,size,'#fff',width-40);};
 ctx.fillStyle='#f3efe7';ctx.fillRect(0,0,1080,1350);box(48,48,984,10,'#69557d',5);
 text('국민의 부름',60,108,27,'#69557d',600);text('MY LIFE / 4:5',810,108,22,'#817586',220);
 text(title,60,164,42,'#29252d',960,850);
 ctx.save();ctx.beginPath();ctx.roundRect(60,205,440,660,22);ctx.clip();ctx.drawImage(poster,60,205,440,660);ctx.restore();
 const nameSize=text(persona.name,542,255,52,'#29252d',isDeceased(persona)?430:476,900);if(isDeceased(persona)){const w=ctx.measureText(persona.name).width;text('故',542+Math.min(w,430)+8,255,nameSize*.5,'#655175',38,650);}
 pill(persona.age+'살 · '+(reason||persona.job||'성장 중'),542,280,476,'#655175',62,25);
 let y=395;
 const kind={elementary:'초등학교',middle:'중학교',high:'고등학교',university:'대학교'};
 for(const entry of schools.slice(-3)){
  text((entry.status==='graduated'?'졸업':'재학')+' · '+(kind[entry.kind]||'학교'),542,y,22,'#8b7c90',476);y+=38;
  y+=lines(entry.name,542,y,466,28,2)+18;
 }
 if(offer&&y<780){text('다음 목적지',542,y,22,'#8b7c90',476);y+=38;y+=lines(offer,542,y,466,28,2)+16;}
 for(const role of (persona.roles||[]).slice(-2)){if(y>835)break;const value=typeof role==='string'?role:role.label||role.name;pill(value,542,y,466,'#86748e',48,23);y+=58;}
 if(!schools.length)text('아직 입학 전 · 가능성의 시작',542,420,25,'#8b7c90',466);
 const stats=[['남은 재산',persona.stats.money.toLocaleString('ko-KR')+'원'],['관계',persona.stats.relations+'/25'],[persona.stats.illness?'정신병':'압박',persona.stats.illness?persona.stats.illness+'/5':persona.stats.stress+'/25'],['최종 내신',persona.attributes?.highFinalSubmitted?global.GukminGrades.report('schoolScore',persona.stats.schoolScore,'high').display:'미확정']];
 stats.forEach(([label,value],i)=>{const x=60+(i%2)*490,top=904+Math.floor(i/2)*80;box(x,top,466,64,'#e5dce9',22);text(label,x+20,top+41,23,'#76647f',165);text(value,x+184,top+42,28,'#3f2f49',262,800);});
 let x=60;y=1112;for(const name of traits.slice(0,8)){ctx.font='700 25px system-ui';const width=Math.min(440,ctx.measureText(name).width+44);if(x+width>1020){x=60;y+=66;}if(y>1212)break;pill(name,x,y,width,global.GukminPlayer.traitDefinition(name).color||'#655175');x+=width+14;}
 text('THE PEOPLE CALL',60,1300,22,'#7c6d83',430);text('나의 선택으로 남은 삶',650,1300,24,'#7c6d83',370);
 return canvas;
}
global.GukminResultView=Object.freeze({mount,memoriesOf,isDeceased});
})(window);
