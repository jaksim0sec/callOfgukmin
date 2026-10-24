/* Adult-life presentation only. Decisions, costs and saved outcomes remain in Timeline. */
(function(g){
'use strict';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const won=n=>Math.round(n||0).toLocaleString('ko-KR')+'원';
function model(stage,p){
 const a=p.attributes||{},year=(a.collegeCompleted||0)+1,school=a.collegeName||'대학교',period=Math.min(3,(a.careerChapterPeriods||0)+1)+'/3회차';
 const surfaces={
  'region-map':{surface:'regions',mode:'web',brand:'LOCAL · 전국 활동',section:'대한민국 활동 거점',title:'어디에서 사람들을 만날까',lead:'열린 거점에서 활동할 수 있습니다.',fields:[['현재 활동 지역',g.GukminAdultStories.active(p).name],['새 지역 이동 준비','1개월 · 100,000원']],list:'지역 선택',submit:'이 지역에서 활동하기'},
   'college-program':{surface:'course',mode:'web',brand:school,section:'입학지원 · 학사 안내',title:'나에게 맞는 과정 찾기',lead:'먼저 과정의 길이를 정합니다. 등록과 학업은 그다음입니다.',fields:[['신입생',p.name],['입학 상태',a.collegeStatus||'입학 예정']],list:'교육과정 선택',submit:'이 과정으로 시작하기'},
  'college-funding':{surface:'tuition',mode:'document',brand:school+' · 재무팀',section:'등록 업무',title:'등록금 납부 안내',lead:'가족 지원과 장학금을 제외한 본인 부담액을 확인하세요.',fields:[['학생',p.name],['등록 학년',year+'학년 / '+a.collegeYears+'년제']],list:'등록 방법',submit:'등록 방법 확정하기'},
  'college-year':{surface:'campus',mode:'web',brand:'CAMPUS',section:school+' · 학생 포털',title:year+'학년, 올해의 캠퍼스',lead:'수업 밖의 시간도 내 이력이 됩니다. 올해 가장 집중할 활동을 정하세요.',fields:[['학적',a.collegeStatus||'재학'],['학업 진행',(a.collegeCompleted||0)+' / '+a.collegeYears+'년 이수']],list:'나의 연간 활동 계획',submit:'올해 활동 계획 확정하기'},
  military:{surface:'notice',mode:'document',brand:'병역 안내',section:'판정 · 복무 일정',title:a.militaryAssessed?'입영 경로 선택 안내':'병역판정 안내문',lead:'현재의 학업과 일정을 함께 살펴보고 다음 절차를 정하세요.',fields:[['대상자',p.name],['병역 상태',a.militaryStatus||'판정 전'],['판정 이력',a.militaryAssessed?'판정 완료':'미판정'],['학적',a.collegeStatus||'해당 없음']],list:'진행할 절차',submit:'선택한 절차 진행하기'},
  'military-service':{surface:'service',mode:'document',brand:(a.militaryBranch||'군')+' · 복무 기록',section:'복무 계획',title:'나의 군 생활 기록부',lead:'보낸 시간은 병역 이력이 되고, 함께한 경험은 사회에 돌아온 뒤에도 남습니다.',fields:[['성명',p.name],['복무 구분',a.militaryBranch||'확인 중'],['복무 기간',a.militaryDuration+'개월'],['학적',a.collegeStatus||'해당 없음']],list:'복무 중 나의 방향',submit:'복무 계획 확정하기'},
  'career-search':{surface:'jobs',mode:'web',brand:'일자리ON',section:'채용 · 진로 탐색',title:'다음 일은, 여기서',lead:'내가 가진 경험으로 지원할 수 있는 일들입니다. 준비 기간과 비용까지 비교하세요.',fields:[['구직자',p.name],['준비 경험','실무 훈련 '+(a.careerTraining||0)+'/3회']],list:'채용 공고와 다른 시작',submit:'선택한 진로 진행하기'},
  'job-offer':{surface:'offer',mode:'document',brand:'채용 담당자',section:'전형 결과 안내',title:a.jobAccepted?'채용 제안이 도착했습니다':'이번 전형의 결과를 안내드립니다',lead:a.jobAccepted?'아래 근무 조건을 확인한 뒤 제안 수락 여부를 결정해 주세요.':'이번 준비의 경험은 남습니다. 다시 지원하거나 다른 시작점을 찾을 수 있습니다.',status:a.jobAccepted?'채용 제안':'불합격',fields:[['지원자',p.name],['지원 분야',({private:'기업 실무직',public:'지방행정직 공무원',local:'지역 현장 실무직'})[a.jobTarget]||'채용 전형'],...(a.jobAccepted?[['제안 월 수입',won(a.jobOfferIncome)],['수입 정산','실제 근무 기간에 생활비와 함께 정산']]:[])],list:'나의 답변',submit:'답변 보내기'},
  work:{surface:'office',mode:'web',brand:'WORKSPACE',section:(p.job||'직장')+' · 업무 포털',title:'실적과 사람, 내 생활 사이',lead:'이번 반년의 업무 방향을 정합니다. 수입뿐 아니라 무엇을 남길지도 생각해 보세요.',fields:[['이번 경력 장',period],['월 수입',won(p.stats.income)],['누적 근무',(a.careerMonths||0)+'개월'],['생활비','월 1,200,000원']],list:'반년 업무 계획',submit:'업무 계획 확정하기'},
  business:{surface:'business',mode:'web',brand:'우리가게',section:'사장님 운영 대시보드',title:'다음 반년, 가게의 방향',lead:'매출이 곧 내 돈은 아닙니다. 재료비와 생활비를 뺀 결과를 살펴보세요.',fields:[['운영 회차',period],['운영 자금',won(p.stats.money)],['영업 이력',(a.careerBusinessMonths||0)+'개월'],['운영자',p.name]],list:'운영 방향 선택',submit:'운영 계획 확정하기'},
  community:{surface:'community',mode:'web',brand:'동네ON',section:'주민 모임 · 참여 안내',title:'우리 동네의 다음 이야기',lead:'버스 배차와 골목 안전. 현장에서 듣고 함께 정리할 사람이 필요합니다.',fields:[['참여자',p.name],['활동 기간','3개월'],['지금까지 참여',(a.communityVisits||0)+'회']],list:'참여 방식',submit:'주민 활동 참여하기'},
  recovery:{surface:'budget',mode:'web',brand:'내 생활',section:'지출 · 일정 정비',title:'잠깐, 나부터 챙길 시간',lead:'새로운 경력 대신 생활에 시간을 씁니다. 지출과 약속을 줄이며 부담을 덜어 보세요.',fields:[['사용 가능한 재산',won(p.stats.money)],['정비 기간','3개월'],['현재 압박',(p.stats.stress||0)+' / '+g.GukminPlayer.pressureMax(p)]],list:'생활 정비 계획',submit:'생활 정비 시작하기'},
  politics:{surface:'civic',mode:'web',brand:'참여의 문',section:'정치 · 첫 활동 찾기',title:'이제, 내 목소리로',lead:'정당의 공개 모임부터 동네 현장까지. 지금의 이력을 안고 시작할 접점을 고르세요.',fields:[['참여자',p.name],['현재 신분',p.job||'사회인'],['병역 이력',a.militaryStatus||'미확정']],list:'첫 참여 경로',submit:'이 경로로 준비하기'}
 };
 return surfaces[stage]||null;
}
function skin(dialog,presentation){
 const stage=presentation?.type==='society-line'?presentation.stage:null;
 if(stage){dialog.dataset.adultSurface=stage;delete dialog.dataset.adultInteraction;}else{delete dialog.dataset.adultSurface;delete dialog.dataset.adultMode;delete dialog.dataset.adultInteraction;delete dialog.querySelector('#dailyPaperConfirm').dataset.adultLabel;}
}
function fields(rows,cls='adult-facts'){
 const dl=el('dl',cls);for(const [label,value] of rows){const item=el('div','');item.append(el('dt','',label),el('dd','',value));dl.append(item);}return dl;
}
function decorate({dialog,body,list,choice,persona}){
 const stage=choice.presentation.stage,m=model(stage,persona);if(!m)return;
 dialog.dataset.adultMode=m.mode;
 const shell=el('section','adult-surface');shell.setAttribute('aria-label',m.title);
 const mast=el('div','adult-masthead'),identity=el('div','adult-identity');
 identity.append(g.GukminStatus.createToken({label:m.mode==='document'?'서류':'온라인',icon:m.mode==='document'?'flag':'home',classes:'adult-medium'}),el('strong','',m.brand));
 mast.append(identity,el('small','adult-section',m.section));
 const hero=el('div','adult-hero');hero.append(el('small','adult-eyebrow',m.mode==='document'?'확인 후 처리해 주세요':'나의 현재 활동'),el('h3','',choice.title||m.title),el('p','',m.lead));
 if(m.status){const status=el('span','adult-result-status',m.status);status.dataset.accepted=String(!!persona.attributes.jobAccepted);hero.prepend(status);}
 const storyText=body.querySelector('.daily-scenario');
  if(storyText){hero.querySelector('p')?.remove();storyText.classList.add('adult-main-story');hero.append(storyText);}
  shell.append(mast,hero,fields(m.fields));
  if(stage==='region-map'&&!choice.presentation.interaction){
    const map=el('section','adult-region-map');map.setAttribute('aria-label','대한민국 활동 거점 지도');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 260 360');svg.setAttribute('aria-hidden','true');svg.classList.add('adult-korea-outline');
    const land=document.createElementNS('http://www.w3.org/2000/svg','path');
    land.setAttribute('d','M91 43 L111 32 136 40 152 34 169 46 179 67 199 71 203 91 191 107 204 130 217 145 216 165 230 185 216 201 215 229 201 245 211 263 195 279 175 274 161 286 140 268 126 281 108 272 94 256 77 254 68 238 52 220 56 197 44 181 56 158 51 136 64 120 57 104 72 94 70 75 84 66 Z');
    const island=document.createElementNS('http://www.w3.org/2000/svg','ellipse');island.setAttribute('cx','113');island.setAttribute('cy','324');island.setAttribute('rx','25');island.setAttribute('ry','9');svg.append(land,island);map.append(svg);
    for(const r of g.GukminAdultStories.regions){
      const pin=el('button','adult-region-pin',r.name.split(' ').at(-1));pin.type='button';pin.style.left=r.x+'%';pin.style.top=r.y+'%';
      pin.disabled=choice.options.find(o=>o.id==='visit:'+r.id)?.available===false;
      pin.title=pin.disabled?'아직 활동 기회가 열리지 않았습니다.':r.issue;
      if(r.id===g.GukminAdultStories.active(persona).id)pin.classList.add('is-current');
      pin.addEventListener('click',()=>{const option=[...list.querySelectorAll('.inline-choice')].find(node=>node.dataset.action==='visit:'+r.id);
        if(option){option.click();for(const node of map.querySelectorAll('.adult-region-pin'))node.classList.remove('is-selected');pin.classList.add('is-selected');}
      });map.append(pin);
    }
    map.append(el('p','adult-map-caption','활동 지역 개략도 · 실제 선거구 경계가 아닙니다.'));shell.append(map);
  }
 if(stage==='college-funding'){
  const t=g.GukminSociety.tuition(persona),bill=el('section','adult-tuition');bill.setAttribute('aria-label','등록금 내역');
  bill.append(fields([['연간 등록금',won(t.gross)],['가족 지원','−'+won(t.aid)],['장학 지원','−'+won(t.scholarship)]],'adult-bill-lines'));
  const total=el('div','adult-bill-total');total.append(el('span','','본인 부담액'),el('strong','',won(t.due)));bill.append(total);shell.append(bill);
 }
 if(stage==='college-year'){
  const a=persona.attributes,degree=el('div','adult-degree'),bar=el('progress','');bar.max=a.collegeYears;bar.value=a.collegeCompleted||0;bar.setAttribute('aria-label','졸업까지 '+bar.value+'/'+bar.max+'년 이수');degree.append(bar,el('small','','졸업까지 '+Math.max(0,a.collegeYears-(a.collegeCompleted||0))+'년 남음'));shell.append(degree);
 }
 // The story has moved into the primary hero.
 const group=el('section','adult-options');group.append(el('h4','adult-options-heading',m.list));
 const buttons=[...list.querySelectorAll('.inline-choice')];
 for(const [index,button] of buttons.entries()){
  const option=choice.options[index];button.dataset.action=option.id;
  const a=persona.attributes,meta=el('span','adult-option-meta');
  const duration=option.society?.months;
  if(duration)meta.append(g.GukminStatus.createToken({label:duration+'개월',icon:'clock'}));
  if(stage==='career-search'&&option.id.startsWith('apply-')){
   const chance=g.GukminSociety.chance(persona,option.id.slice(6));
   meta.append(g.GukminStatus.createToken({label:'채용 가능성 '+chance+'%',icon:'flag'}));
   button.classList.add('adult-job-card');
  }
  if(stage==='job-offer'&&option.id==='accept'&&a.jobAccepted)button.classList.add('adult-primary-option');
  if(meta.childElementCount)button.querySelector('.daily-choice-copy').prepend(meta);
 }
 group.append(list);shell.append(group);body.append(shell);
 if(g.GukminAdultInteractions)g.GukminAdultInteractions.decorate({dialog,body,list,choice,persona,shell,group});
 // The shared sheet still owns the single confirm button and selected state.
 dialog.querySelector('#dailyPaperConfirm').dataset.adultLabel=m.submit;
}
function reward({dialog,body,presentation,label,attributes,stats,portrait}){
 const m=model(presentation.stage,{attributes,stats,name:portrait?.name||'',job:attributes.job});if(!m)return;
 dialog.dataset.adultMode=m.mode;
 const receipt=el('header','adult-receipt');receipt.append(el('span','adult-receipt-check','✓'),el('div',''));
 const milestone=presentation.stage==='college-year'&&attributes.collegeStatus==='졸업'?'대학 졸업 완료':presentation.stage==='job-offer'&&label==='제안을 받아들인다'?'첫 출근 확정':presentation.stage==='community'&&attributes.adultCommunityIssueStage===3?'지역 문제 회신 완료':null;
  receipt.lastChild.append(el('small','',m.brand+' · 처리 결과'),el('strong','',milestone||'선택이 기록되었습니다'),el('span','',label));body.prepend(receipt);
 if(g.GukminAdultInteractions)g.GukminAdultInteractions.reward({body,presentation,label});
}
g.GukminAdultScenes=Object.freeze({skin,decorate,reward});
})(window);
