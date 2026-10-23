/* Adult-life operator. Calendar and route decisions extend the existing timeline. No DOM. */
(function(g){
'use strict';
const P=g.GukminPlayer,id='society:activity',lineId='society:line',A=p=>p.attributes||{},has=(p,t)=>P.hasTrait(p,t);
const degree=p=>P.schoolsOf(p).some(s=>s.kind==='uni'&&s.status==='graduated');
const currentCollege=p=>!['졸업','중퇴'].includes(A(p).collegeStatus)&&!(A(p).collegeYears>0&&A(p).collegeCompleted>=A(p).collegeYears)&&P.schoolsOf(p).find(s=>s.kind==='uni'&&s.status!=='graduated'&&s.status!=='dropout');
const legalAge=p=>Math.max(0,p.age-2); // No birthday in legacy saves: conservative completed-age lower bound.
const employed=p=>A(p).employmentStatus==='재직';
const serving=p=>A(p).militaryStatus==='복무 중';
const inRoute=p=>!['hub','ready'].includes(A(p).societyStep||'hub');
const canReturn=p=>!!A(p).societyActive&&!A(p).societyComplete&&inRoute(p);
const routeKey=stage=>stage.startsWith('college-')?'collegeResumeStep':stage.startsWith('military')?'militaryResumeStep':['career-search','job-offer','work','business'].includes(stage)?'careerResumeStep':stage==='politics'?'politicsResumeStep':stage==='community'?'communityResumeStep':'recoveryResumeStep';
const sum=(p,n)=>g.GukminAdmissions.roll(p,'society:'+n)/100;
const jobs={private:{title:'기업 실무직',income:2400000,months:3,cost:300000,pressure:2},public:{title:'지방행정직 공무원',income:2300000,months:6,cost:500000,pressure:3},local:{title:'지역 현장 실무직',income:1900000,months:2,cost:0,pressure:1}};
const tuition=p=>{const a=A(p),gross=a.collegeYears===4?7000000:6000000,rate={soil:0,bronze:.25,silver:.5,gold:1,diamond:1}[p.familyTier]||0,aid=Math.round(gross*rate),scholarship=a.collegeMerit?Math.min(1000000,gross-aid):0;return {gross,aid,scholarship,due:gross-aid-scholarship};};
function salary(p,sector){return jobs[sector].income+(sector==='local'&&A(p).collegeYears===3&&degree(p)?300000:0);}
function chance(p,sector){const a=A(p),academic=Math.floor((p.stats.study||p.stats.schoolScore||0)/5),training=Math.min(3,a.careerTraining||0)*8,gap=has(p,'경력 공백')?6:0;
 return Math.max(20,Math.min(90,(sector==='local'?65:sector==='public'?32:35)+(degree(p)?sector==='private'?16:8:0)+academic+training+(sector==='public'?(has(p,'꼼꼼함')?8:0)+(a.collegeMerit?6:0):Math.floor((p.stats.relations||0)/3)+(has(p,'리더십')?4:0)+(a.collegeNetwork?5:0))+(a.collegeWork?4:0)+Math.min(sector==='public'?4:10,Math.floor((a.careerMonths||0)/6)*2+(a.careerProjects||0))-gap));}
function guidance(p,stage=A(p).societyStep||'hub'){
 const a=A(p),years=Math.max(0,a.collegeYears||0),finished=a.collegeStatus==='졸업'||degree(p)||years>0&&a.collegeCompleted>=years,completed=finished?years:Math.min(years,Math.max(0,a.collegeCompleted||0));
 const education=a.collegeName||currentCollege(p)||degree(p)?{completedSemesters:completed*2,totalSemesters:years*2,remainingSemesters:(years-completed)*2,remainingMonths:(years-completed)*12,label:finished?'대학 졸업 완료':a.collegeStatus==='중퇴'?'대학 중퇴 · 학적 보존':!years?'대학 과정 길이 선택 전':'대학 '+completed+'/'+years+'년 이수 · '+(years-completed)*2+'학기 분량 남음',detail:finished?'학업을 마쳤습니다. 취업·병역·정치 입문 중 다음 길을 선택하세요.':a.collegeStatus==='중퇴'?'이수 기간과 이전 학적은 인생 기록에 남습니다.':!years?'2년제·3년제 중 하나를 선택하세요.':'졸업까지 학업 '+(years-completed)*12+'개월'+(a.collegeStatus==='휴학'?' · 휴학 중에는 이수하지 않습니다.':' · 한 번의 연간 활동으로 2학기 분량을 이수합니다.')}:null;
 const stages={hub:['사회 허브',currentCollege(p)?'대학 '+(completed+1)+'학년을 이어가거나, 바로 정치 입문 경로를 살펴보세요.':'취업·병역을 살펴보거나 바로 정치 입문 경로를 선택하세요.'],'college-program':['대학 · 과정 선택','과정 길이 → 등록금 마련 → 1년 활동 순서로 진행합니다.'],'college-funding':['대학 · '+(completed+1)+'학년 등록','등록금 마련 방법을 정하면 올해 12개월 활동을 선택합니다.'],'college-year':['대학 · '+(completed+1)+'학년 활동','활동 하나를 확정하면 12개월·2학기 분량을 이수합니다.'],military:['병역 · 판정과 입대','판정 후 군별 복무 경로를 선택해 복무를 이어가세요.'],'military-service':['병역 · 복무 중','복무 활동을 확정하면 '+a.militaryDuration+'개월 후 전역합니다.'],'career-search':['취업 · 지원 준비','지원할 일자리를 고르면 준비 기간 뒤 채용 결과를 확인합니다.'],'job-offer':['취업 · 지원 결과',a.jobAccepted?'제안을 수락하면 근무 활동을 선택할 수 있습니다.':'다시 지원하거나 다른 경로를 선택하세요.'],work:['직장 · 경력 '+Math.min(3,(a.careerChapterPeriods||0)+1)+'/3회차','반년 활동 세 번으로 한 경력 장을 마칩니다. 메뉴에서 멈추고 나중에 이어갈 수 있습니다.'],business:['자영업 · 영업 '+Math.min(3,(a.careerChapterPeriods||0)+1)+'/3회차','반년 영업 세 번으로 한 장을 마칩니다. 메뉴에서 멈추고 나중에 이어갈 수 있습니다.'],community:['지역 · 주민 모임','현장의 일을 돕고 관계를 쌓은 뒤 사회로 돌아갑니다.'],recovery:['생활 · 재정비','개인 생활과 지출을 정비한 뒤 사회로 돌아갑니다.'],politics:['정치 · 입문 경로 선택','학위·취업과 관계없이 준비 경로 하나를 선택하세요.'],ready:['정치 · 입문 준비 완료','다음 장으로 이어가거나 사회에서 경험을 더 쌓으세요.']};
 const [location,defaultNext]=stages[stage]||stages.hub;
 const next=stage==='hub'&&employed(p)&&a.employmentSector==='public'?'공무원 신분입니다. 현재 일에서 퇴사한 뒤 정치 입문 경로를 선택하세요.':defaultNext;
 return {location,next,education,goal:a.politicalEntryReady?'정치 입문 준비 완료':'목표 · 정치 입문',months:a.societyMonths||0};
}
function option(action,label,detail,{allowed=true,reason='',months=0,requiredMoney,requiredMental,...meta}={}){const conditions=[];if(!allowed)conditions.push({turn:{lte:-1}});if(requiredMoney!==undefined)conditions.push({stats:{money:{gte:requiredMoney}}});if(requiredMental!==undefined)conditions.push({stats:{illness:{lte:requiredMental}}});return {id:action,label,outlook:detail,requirement:reason,...(conditions.length?{when:{all:conditions}}:{}),result:{societyDecision:{action,...(['community','rest'].includes(action)?{flow:2}:{})},tags:action.startsWith('politics-')?['initiative','public-speech']:action==='startup'?['initiative']:[]},society:{months,...meta}};}
function choice(p){
 const a=A(p),stage=a.societyStep||'hub',money=p.stats.money||0,active=employed(p),college=currentCollege(p),opts=[];let title='',body='';
 const add=(...args)=>opts.push(option(...args));
 if(stage==='hub'){
  title='사회 · 다음 행선지';body='다음에 살아갈 경로를 고르면 메인 화면에서 소식과 일상 선택으로 이어진다. 경로를 마치면 이곳으로 돌아온다. 메뉴의 사회로 돌아가기에서 진행을 잠시 멈추고 나중에 이어갈 수도 있다. 정치 입문은 대학 졸업이나 취업 없이도 시작할 수 있다.';
  if(college)add('college',a.collegeStatus==='휴학'?'복학 · '+((a.collegeCompleted||0)+1)+'학년 이어가기':a.collegeYears?'대학 '+((a.collegeCompleted||0)+1)+'학년 이어가기':'대학 과정 시작하기',a.collegeStatus==='휴학'?'복학한 뒤 남은 과정을 이어간다.':a.collegeYears?'등록금을 마련하고 12개월 활동 하나로 올해를 이수한다.':'과정 길이와 등록금, 첫해 활동을 정한다.',{allowed:!serving(p),reason:'복무를 마친 뒤 학업을 이어갈 수 있습니다.',icon:'graduation'});
  add('military',serving(p)?'복무 이어가기':P.genderOf(p)==='female'?'병역 · 자원복무 알아보기':'병역 · 판정과 복무',a.militaryStatus||'병역판정을 받고 복무 시기를 선택한다.',{allowed:!['복무 제외','복무 완료'].includes(a.militaryStatus),reason:'이미 병역 이력이 확정되었습니다.',icon:'flag'});
  add('career',active?'현재 일과 경력 이어가기':'취업과 생계 준비',active?'일하는 방식과 다음 경력을 선택한다.':'기업·공공 부문·지역 일자리와 자영업을 살펴본다.',{allowed:!serving(p),reason:'복무 중에는 취업 활동을 진행할 수 없습니다.',icon:'coin'});
  add('politics','정치에 뛰어들기',serving(p)?'복무 중에는 정치 활동에 참여할 수 없다.':active&&a.employmentSector==='public'?'공무원 신분을 정리해야 정치 입문이 가능하다.':'학위나 직업을 기다리지 않고 입문 경로를 고를 수 있다.',{allowed:!serving(p)&&!(active&&a.employmentSector==='public'),reason:'현역 복무·공무원 신분의 정치적 중립 제한',icon:'speech'});
  add('community','지역 사람들과 일하기','생활 현장의 불편을 듣고 주민 모임을 돕는다. 관계는 넓어지지만 취업·학업 진도는 쌓이지 않는다.',{allowed:!serving(p),reason:'복무를 마친 뒤 지역 활동을 할 수 있습니다.',icon:'users'});
  add('rest','생활을 정비하기','추가 경력 대신 시간을 써서 부담을 덜고 지출을 줄인다.',{allowed:!serving(p),reason:'복무 중에는 별도의 생활 경로를 진행할 수 없습니다.',icon:'home'});
  if(a.studentDebt>0)add('repay','학자금 빚 일부 갚기','여유 자금으로 최대 100만 원을 상환한다. 취업·학업은 진행되지 않는다.',{requiredMoney:1,reason:'상환할 재산이 필요합니다.',icon:'savings'});
  if(college)add('leave',a.collegeStatus==='휴학'?'대학 중퇴하기':'휴학하기',a.collegeStatus==='휴학'?'이수한 기간과 중퇴 이력은 남는다.':'학업 진행을 멈추고 사회에서 다른 경험을 한다.',{icon:'school'});
 }
 if(stage==='region-map'){title='지역 지도';body='활동할 지역을 고르는 중이다.';add('map-back','사회로 돌아가기','현재 지역을 유지한다.',{icon:'home'});}
  if(stage==='college-program'){
  title='실무 과정의 길이';body='합격한 실무계열의 시연 과정이다. 실제 대학의 학과별 학제·등록금과는 다르다. 짧은 과정은 빨리 사회에 나가고, 긴 과정은 실무 경험을 더 쌓는다.';
  add('program-2','2년제 실무과정','2년 뒤 전문학사 과정을 마친다.',{icon:'graduation'});add('program-3','3년제 실무과정','한 해의 시간·등록금을 더 쓰고 취업 준비 경험을 쌓는다.',{icon:'graduation'});
 }
 if(stage==='college-funding'){
  const t=tuition(p);title='대학 '+((a.collegeCompleted||0)+1)+'학년 · 등록금';body=(a.collegeName||'대학교')+' · '+((a.collegeCompleted||0)+1)+'/'+a.collegeYears+'년차\n연간 등록금 '+t.gross.toLocaleString()+'원 중 가족 지원 '+t.aid.toLocaleString()+'원'+(t.scholarship?' · 장학 지원 '+t.scholarship.toLocaleString()+'원':'')+'. 내 부담은 '+t.due.toLocaleString()+'원이다. 납부 후 올해의 활동 하나를 정하면 12개월을 이수한다.';
  add('fund-cash','준비한 돈으로 등록','등록금을 납부한 뒤 올해의 활동을 정한다.',{requiredMoney:t.due,reason:'내 부담 등록금 '+t.due.toLocaleString()+'원이 필요합니다.',icon:'savings'});
  add('fund-loan','학자금대출로 등록','당장 돈 대신 상환할 원금을 남기고, 부담이 늘어난다. 이자·실제 대출 심사는 생략한 시연 규칙이다.',{allowed:t.due>0,reason:'현재 본인 부담이 없어 대출할 필요가 없습니다.',icon:'coin'});
  add('pause-college','이번에는 휴학하고 돈 마련하기','돈과 학업 진도를 함께 확보하는 선택은 아니다. 사회로 돌아가 일할 수 있다.',{icon:'clock'});
 }
 if(stage==='college-year'){
  title='대학 '+((a.collegeCompleted||0)+1)+'학년 · 1년 활동';body='올해의 활동 하나를 확정하면 12개월, 2학기 분량을 이수한다. '+((a.collegeCompleted||0)+1>=a.collegeYears?'이번 활동을 마치면 졸업이다.':'올해를 마치면 다음 학년으로 넘어간다.');
  add('study','학업과 결과물에 집중한다','학업 경험과 다음 해 장학 지원 기회를 남긴다. 교류에 쓸 시간은 줄어든다.',{months:12,icon:'book'});
  add('network','대외활동과 사람들에게 시간을 쓴다','관계와 협업 경험을 넓힌다. 장학 지원과 아르바이트 수입은 얻지 못한다.',{months:12,icon:'users'});
  add('part-time','수업과 아르바이트를 병행한다','한 해 300만 원의 여유 자금과 근로 경험을 남긴다. 사람을 만날 여유와 회복 시간을 줄여야 한다.',{months:12,icon:'coin'});
 }
 if(stage==='military'){
  const female=P.genderOf(p)==='female';title='병역과 내 일정';body=female?'여성은 의무복무 대상이 아니다. 지원한다면 남성과 같은 실제 복무기간을 보내며, 재학 중인 대학은 휴학한다.':'판정 결과와 입대 시기는 별개다. 판정 당시 정신병2 이상은 이 게임에서만 정신건강 사유 복무 제외로 처리한다. 실제 의학적·법적 병역판정이 아니다.';
  if(!female&&!a.militaryAssessed)add('examine','병역판정을 받는다','판정 당시의 상태와 사유를 영구 기록한다. 게임 판정 비용이나 자동 회복은 없다.',{icon:'check'});
  if(!female&&a.militaryAssessed){for(const [key,name,months] of [['army','육군',18],['navy','해군',20],['air','공군',21]])add(key,(female?'자원 지원 · ':'')+name+' '+months+'개월','입대하면 학업과 현재 직장을 멈춘다. 이 선택은 실제 모집·신체검사 절차를 축약한 것이다.',{requiredMental:1,allowed:!['복무 제외','복무 완료'].includes(a.militaryStatus),reason:'이 시연의 지원 조건을 충족하지 않거나 병역 이력이 확정됐습니다.',icon:'flag'});}
  if(female||a.militaryAssessed)add('nco','부사관 자원 지원 · 48개월','여성은 병18~21개월 경로 대신 간부 복무를 선택한다. 남녀 모두 같은 부사관 의무복무4년을 보내며 학업과 직장을 중단한다.',{requiredMental:1,allowed:legalAge(p)>=18&&legalAge(p)<=29,reason:'시연 지원 기준: 만18~29세·정신병2 미만',icon:'flag'});
  add('back','지금은 사회로 돌아가기','입대하지 않은 사유와 판정 이력은 유지된다.',{icon:'home'});
 }
 if(stage==='military-service'){
  title=(a.militaryBranch||'군')+' · 복무 중';body='입대 전 진행하던 학업은 휴학 상태로 남아 있다. 복무 방식과 무관하게 '+a.militaryDuration+'개월을 보낸다. 전역이 자동 복학이나 취업을 뜻하지는 않는다.';
  add('service-balance','맡은 보직을 꾸준히 수행한다','복무 이력과 장병 적립금 500만 원을 남긴다.',{months:a.militaryDuration,icon:'flag'});
  add('service-lead','동료 조율과 책임을 더 맡는다','같은 기간을 보내며 관계를 더 쌓지만 부담도 크다. 급여가 더 높아지는 선택은 아니다.',{months:a.militaryDuration,icon:'users'});
 }
 if(stage==='career-search'){
  title='일의 시작점';body='지원 준비에는 시간이 들고 합격은 보장되지 않는다. 학위뿐 아니라 학생 때 남긴 경험, 특성, 관계와 기존 경력도 영향을 준다.';
  for(const [sector,j] of Object.entries(jobs))add('apply-'+sector,j.title+' 지원',j.months+'개월의 준비 후 결과를 확인한다. '+(sector==='public'?'경쟁시험과 면접을 간소화했다. 재직 중에는 정치적 중립 의무가 따른다.':'고졸·중퇴자도 지원할 수 있으며 경험에 따라 기회가 달라진다.'),{requiredMoney:j.cost,reason:'지원 준비비 '+j.cost.toLocaleString()+'원이 필요합니다.',months:j.months,icon:'flag'});
  add('training',(a.careerTraining||0)>=3?'실무 훈련 수료 완료 (3/3)':'실무 훈련 '+((a.careerTraining||0)+1)+'/3회','비용 없이 3개월을 써 다음 지원을 준비한다. 수료가 채용을 보장하지 않으며, 준비 효과는 세 번까지만 쌓인다.',{allowed:(a.careerTraining||0)<3,reason:'세 차례 훈련을 모두 수료했습니다. 일자리에 지원해 보세요.',months:3,icon:'book'});
  add('startup','작은 자영업을 시작한다','초기 자금 300만 원을 쓰고 직접 고객을 만든다. 매출이 생활비를 보장하지 않는다.',{requiredMoney:3000000,reason:'자기자본 300만 원이 필요합니다.',months:3,icon:'home'});
  add('back','사회로 돌아가기','진학·병역·지역 활동 등 다른 선택도 열려 있다.',{icon:'home'});
 }
 if(stage==='job-offer'){
  const accepted=a.jobAccepted,j=jobs[a.jobTarget];title=accepted?'채용 제안이 도착했다':'이번 지원은 불합격';body=accepted?j.title+' · 월 수입 '+(a.jobOfferIncome||salary(p,a.jobTarget)).toLocaleString()+'원. 수입은 실제 일하는 기간의 선택에서 생활비와 함께 정산한다.':'이번 준비의 시간과 비용은 되돌아오지 않는다. 준비 경험은 다음 지원에 남는다. 사회에서 다른 길을 택해도 된다.';
  if(accepted)add('accept','제안을 받아들인다','재학 중이면 휴학한다. 현재 일의 기간과 퇴사 사유는 이후에도 보존한다.',{icon:'check'});
  add('search-again',accepted?'제안을 거절하고 다른 기회를 찾는다':'다시 지원 준비하기','다른 지원 회차로 준비한다. 새로고침은 이번 결과를 바꾸지 않는다.',{icon:'flag'});add('back','사회로 돌아가기','다른 경험을 먼저 쌓을 수 있다.',{icon:'home'});
 }
 if(stage==='work'){
  title=p.job+' · 경력 '+Math.min(3,(a.careerChapterPeriods||0)+1)+'/3회차';body='반년 활동 세 번을 마치면 사회로 돌아가 다음 경로를 선택한다. 메뉴에서 중간에 멈추고 이어갈 수도 있다. 받은 월 수입에서 월 생활비120만 원을 빼 정산한다. 단순한 턴 급여는 없다. 성과·사람·개인 시간을 모두 챙길 수는 없다.';
  add('work-project','성과가 눈에 띄는 업무에 도전한다','추가 성과금과 실적을 노린다. 압박과 관계 비용, 민간 일자리의 계약 종료 위험도 크다.',{months:6,icon:'chart'});
  add('work-team','동료·고객과 함께 일을 개선한다','실적 수입 일부보다 협업 관계와 경력을 우선한다. 민간 일자리의 계약 연장도 보장되지는 않는다.',{months:6,icon:'users'});
  add('work-balance','근무시간을 줄이고 생활을 정비한다','수입을 덜 받으며 부담을 줄인다. 동료와 일하는 기회도 줄어든다.',{months:6,icon:'clock'});
  add('quit','현재 일을 그만둔다','수입이 멈추고 구직 상태로 돌아간다. 이전 근무 경력은 지우지 않는다.',{icon:'flag'});add('back','사회로 돌아가기','다른 경로를 살펴본다. 돌아간다고 급여가 자동 지급되지는 않는다.',{icon:'home'});
 }
 if(stage==='business'){
  title='내 가게 · 영업 '+Math.min(3,(a.careerChapterPeriods||0)+1)+'/3회차';body='반년 영업 세 번을 마치면 사회로 돌아가 다음 경로를 선택한다. 메뉴에서 중간에 멈추고 이어갈 수도 있다. 매출에서 재료비와 생활비를 뺀 현금 흐름이다. 자영업 경력은 성과와 폐업 이유까지 남는다.';
  add('business-expand','새 상품과 홍보에 승부를 건다','높은 수입을 노리지만 적자를 볼 가능성도 높다.',{months:6,icon:'chart'});add('business-local','단골과 동네 거래를 쌓는다','수입의 폭을 줄이고 관계를 쌓는다. 큰 성과금은 없다.',{months:6,icon:'users'});add('quit','가게를 정리한다','수입은 멈추지만 고객을 상대했던 경험은 남는다.',{icon:'flag'});add('back','사회로 돌아가기','학업·병역·정치 입문도 함께 검토한다.',{icon:'home'});
 }
 if(stage==='community'){
  title='동네에서 마주친 일';body='주민 모임에서는 버스 배차와 골목 안전 이야기가 이어진다. 시간을 내어 현장을 확인하고 사람들의 의견을 정리해 달라는 부탁이 왔다.';
  add('community-work','주민들과 현장을 돌고 의견을 모은다','3개월 동안 관계를 쌓는다. 학업이나 직장 경력은 이수하지 않는다.',{months:3,icon:'users'});
 }
 if(stage==='recovery'){
  title='잠시, 생활의 속도를 낮추다';body='바쁘게 넘겼던 지출 내역과 하루 일정을 펼쳤다. 당장 새 경력을 얻기보다 잠과 생활의 리듬을 돌볼 때다.';
  add('recover','약속과 지출을 줄이고 생활을 정비한다','3개월 동안 부담을 덜지만 사람들과 만날 기회는 줄어든다.',{months:3,icon:'home'});
 }
 if(stage==='politics'){
  title='정치 입문 · 어떤 문을 열까?';body='졸업장이나 특정 직업이 먼저일 필요는 없다. 지금 가진 학력·병역·경력과 사람들의 기억을 그대로 안고 출발한다. 이번 장은 입문 준비까지다.';
  add('politics-party','정당의 공개 모임부터 찾아간다','조직 안에서 함께할 사람과 노선을 찾을 준비를 한다. 아직 입당이나 공천을 확정하지 않는다.',{allowed:legalAge(p)>=16,reason:'정당 가입 기준 만16세',months:1,icon:'flag'});
  add('politics-local','주민 활동에서 시작한다','생활 현장의 의제를 바탕으로 정치 참여를 준비한다. 당적을 요구하지 않는다.',{months:2,icon:'users'});
  add('politics-independent','무소속의 길을 준비한다','조직 지원 없이 내 경력과 사람들로 출발한다. 후보 등록·선거는 아직 진행하지 않는다.',{allowed:legalAge(p)>=18,reason:'공직선거 피선거권 기준 만18세',months:2,icon:'speech'});add('back','사회에서 경험을 더 쌓는다','정치 입문을 지금 확정하지 않아도 된다.',{icon:'home'});
 }
 if(stage==='ready'){
  title='다음 장 · 정치 입문 준비';body=(a.politicalPathLabel||'정치 입문')+'을 선택했다. 지금까지의 학력·병역·경력은 다음 장에서도 유지된다. 정당 활동과 선거는 다음 개발 범위다.';
  add('finish','여기까지의 인생 기록 보기','현재까지의 기록을 결과 화면에서 확인하고 공유한다.',{icon:'flag'});add('back','사회로 돌아가 경험을 더 쌓기','입문 경로를 기록해 둔 채 다른 경험을 이어간다.',{icon:'home'});
 }
 if(!opts.length)throw new Error('알 수 없는 사회 단계: '+stage);
 return {id,layer:'한방 선택',blocksTime:true,title,body,presentation:{type:'society',stage},options:opts};
}
function lineChoice(p){
 const script=choice(p);if(!inRoute(p))throw new Error('현재 진행 중인 사회 경로가 없습니다');
 return {...script,id:lineId,layer:'일상 선택',presentation:{type:'society-line',stage:script.presentation.stage},options:script.options.filter(o=>o.id!=='back')};
}
function narrative(p){
 const script=choice(p),stage=script.presentation.stage,a=A(p);
 const openings={
  'college-program':'새 시간표와 안내문을 펼쳤다. 같은 캠퍼스에서도 과정을 얼마나 오래 이어갈지는 내 선택에 달려 있다.',
  'college-funding':(a.collegeName||'대학')+'의 새 학년 등록 안내가 왔다. 수업에 돌아가기 전에 올해 학비를 마련해야 한다.',
  'college-year':'등록을 마쳤다. 강의실과 동아리방, 아르바이트 공고 사이에서 올해 시간을 어디에 쓸지 생각한다.',
  military:'병역 안내를 확인했다. 판정과 입대, 지금의 생활을 멈추는 시점을 차례로 결정해야 한다.',
  'military-service':(a.militaryBranch||'군')+' 생활이 시작됐다. 입대 전 학업과 일은 멈춘 채, 맡은 일과 함께 생활할 사람들을 마주한다.',
  'career-search':'채용 공고를 펼쳤다. 준비 기간과 비용은 서로 다르고, 합격을 약속하는 공고는 없다.',
  'job-offer':a.jobAccepted?'채용 연락이 왔다. 제시된 조건을 살피고 이 일을 시작할지 결정할 때다.':'채용 결과를 확인했다. 이번에는 연결되지 않았지만 준비 경험과 다음 지원 기회는 남았다.',
  work:(p.job||'직장')+'에서 다음 반년을 맞는다. 업무 실적과 동료, 내 생활 사이에서 시간을 나눠야 한다.',
  business:'가게 문을 열고 손님을 기다린다. 새 상품을 알릴지 단골과 거래를 다질지, 이번 반년의 운영 방향을 정한다.',
  politics:'모임 안내와 주민들의 이야기를 읽었다. 지금까지의 이력을 안고 정치에 참여할 첫 접점을 찾는다.',
  community:script.body,recovery:script.body
 };
 return {title:script.title,body:openings[stage]||script.body};
}
function decision(p,{action,flow},context={}){
 const a=A(p),attrs={},stats={},schools=[],traits={add:[]},activate={},deactivate=[];let months=0,title='',detail='';
 if(action==='narrate'){
  if(!a.societyNarrativePending||!canReturn(p))throw new Error('표시할 사회 경로 소식이 없습니다');
  const news=narrative(p);return {effects:{attributes:{societyNarrativePending:false}},history:{title:news.title,detail:news.body,importance:'normal'}};
 }
 if(action==='return-hub'){
  if(!canReturn(p))throw new Error('현재 사회 경로를 멈출 수 없습니다');
  return {effects:{attributes:{societyStep:'hub',societyNarrativePending:false,[routeKey(a.societyStep)]:a.societyStep,...(a.societyStep==='college-year'?{collegeFundedYear:(a.collegeCompleted||0)+1}:{})}},history:{title:'사회로 돌아왔다',detail:guidance(p).location+' 진행을 잠시 멈췄다. 같은 경로를 선택하면 이어갈 수 있다.',importance:'normal'}};
 }
 const updateJob=()=>{attrs.phase=attrs.collegeStatus==='재학'||(!attrs.collegeStatus&&a.collegeStatus==='재학')?'university':'adult';attrs.job=employed(p)?p.job:attrs.phase==='university'?'대학생':'구직 중';};
 const pauseCollege=()=>{const school=currentCollege(p);if(school&&a.collegeStatus==='재학'){schools.push({...school,status:'leave'});attrs.collegeStatus='휴학';if(a.societyStep==='college-year')attrs.collegeFundedYear=(a.collegeCompleted||0)+1;}};
 if(action==='start'){
  if(a.societyActive||!['college','employment'].includes(a.admissionDestination))throw new Error('사회 진입 조건 오류');
  Object.assign(attrs,{adultRegionFlags:3|(g.GukminAdultStories?.regions.find(r=>String(p.birthplaceId||'').startsWith(r.home))?.bit||0),adultActivityRegionId:g.GukminAdultStories?.regions.find(r=>String(p.birthplaceId||'').startsWith(r.home))?.id||'mapo',societyActive:true,societyComplete:false,societyStep:'hub',societyMonths:0,societyAgeBase:Math.max(20,p.age),age:Math.max(20,p.age),militaryStatus:P.genderOf(p)==='female'?'의무복무 비대상':'판정 전',militaryReason:P.genderOf(p)==='female'?'여성 · 자원 가능':'아직 판정받지 않음',militaryServed:false,employmentStatus:'구직',careerMonths:0});
  for(const school of P.schoolsOf(p).filter(s=>s.kind==='high'&&s.status==='enrolled'))schools.push({...school,status:'graduated'});
  if(a.admissionDestination==='college'){
   const name=a.earlyStatus==='accepted'?a.earlyOffer:a.regularStatus==='accepted'?a.regularOffer:a.earlyOffer||a.regularOffer;if(!name)throw new Error('진학할 합격 대학이 없습니다');
   Object.assign(attrs,{collegeName:name,collegeYears:/동서울|전문대|실무계열/.test(name)?0:4,collegeCompleted:0,collegeStatus:'재학',phase:'university',job:'대학생'});schools.push({id:'society-college',kind:'uni',name,status:'enrolled'});
  }else Object.assign(attrs,{phase:'adult',job:'구직 중'});
  deactivate.push('allowance','study','schoolScore','exam','athletics','support','awareness');activate.income=0;title='교문 밖, 사회로';detail='학력과 이전의 경험을 가지고 다음 행선지를 직접 정한다. 대학·일·병역은 한 줄로 정해진 순서가 아니다.';
 }else{
  if(!a.societyActive||a.societyComplete)throw new Error('현재 사회 활동을 진행할 수 없음');
  const selected=choice(p).options.find(o=>o.id===action);if(!selected||!g.GukminEffects.matches(p,selected.when||{}))throw new Error('지금 선택할 수 없는 사회 활동: '+action);
  months=selected.society.months;title=selected.label;detail=selected.outlook;
  if(action==='back'){attrs.societyStep='hub';if(inRoute(p))attrs[routeKey(a.societyStep)]=a.societyStep;}
  if(action==='college'){
   const school=currentCollege(p);if(!school)throw new Error('이어갈 대학 학적이 없음');
   attrs.collegeStatus='재학';attrs.phase='university';attrs.job='대학생';if(employed(p)){attrs.employmentStatus='학업 전환';attrs.careerLastReason='복학을 위해 직장 중단';activate.income=0;}schools.push({...school,status:'enrolled'});attrs.societyStep=a.collegeFundedYear===(a.collegeCompleted||0)+1?'college-year':a.collegeResumeStep==='college-year'?'college-year':a.collegeYears?'college-funding':'college-program';attrs.collegeResumeStep='';
  }
  if(action.startsWith('program-')){attrs.collegeYears=Number(action.slice(-1));attrs.societyStep='college-funding';}
  if(action==='fund-cash'||action==='fund-loan'){
   const t=tuition(p);if(action==='fund-cash')stats.money=-t.due;else{attrs.studentDebt=(a.studentDebt||0)+t.due;stats.stress=2;}
   attrs.societyStep='college-year';attrs.collegeFundedYear=(a.collegeCompleted||0)+1;detail='연간 등록금 '+t.gross.toLocaleString()+'원 · 가족 지원 '+t.aid.toLocaleString()+'원 · 장학 '+t.scholarship.toLocaleString()+'원 · 내 부담 '+t.due.toLocaleString()+'원'+(action==='fund-loan'?'을 대출 원금으로 기록했다.':'을 납부했다.');
  }
  if(['study','network','part-time'].includes(action)){
   attrs.collegeCompleted=(a.collegeCompleted||0)+1;attrs.collegeFundedYear=0;attrs.collegeResumeStep='';attrs.societyStep='college-funding';detail+=' '+attrs.collegeCompleted+'/'+a.collegeYears+'년 이수 완료. 졸업까지 '+Math.max(0,(a.collegeYears-attrs.collegeCompleted)*2)+'학기 분량·'+Math.max(0,(a.collegeYears-attrs.collegeCompleted)*12)+'개월이 남았다.';
   if(action==='study'){stats.stress=2;stats.relations=-1;attrs.collegeMerit=true;}
   if(action==='network'){stats.stress=2;stats.relations=2;attrs.collegeNetwork=true;attrs.collegeMerit=false;}
   if(action==='part-time'){stats.stress=3;stats.relations=-1;stats.money=3000000;attrs.collegeWork=true;attrs.collegeMerit=false;}
   if(attrs.collegeCompleted>=a.collegeYears){attrs.societyStep='hub';attrs.collegeStatus='졸업';schools.push({...currentCollege(p),status:'graduated'});attrs.phase='adult';attrs.job=employed(p)?p.job:'구직 중';if(a.collegeYears===3)attrs.careerTraining=Math.max(a.careerTraining||0,1);title=a.collegeName+' 졸업';detail+=' '+a.collegeYears+'년제 과정을 마쳤다. 학위와 경험을 가지고 사회로 돌아간다.';}
  }
  if(action==='pause-college'||action==='leave'){
   const school=currentCollege(p);if(!school)throw new Error('변경할 대학 학적이 없음');
   const dropout=action==='leave'&&a.collegeStatus==='휴학';attrs.collegeStatus=dropout?'중퇴':'휴학';schools.push({...school,status:dropout?'dropout':'leave'});attrs.societyStep='hub';attrs.collegeResumeStep=dropout?'':a.societyStep==='college-year'?'college-year':a.collegeYears?'college-funding':'college-program';if(a.societyStep==='college-year')attrs.collegeFundedYear=(a.collegeCompleted||0)+1;updateJob();detail=dropout?'중퇴 시점의 이수 기간과 학적을 보존했다. 졸업 학위는 취득하지 않았다.':'학업을 잠시 멈췄다. 복학 전에는 시간이 흘러도 학업 이수 기간이 늘지 않는다.';
  }
  if(action==='military'){attrs.societyStep=serving(p)?'military-service':'military';attrs.militaryResumeStep='';}
  if(action==='examine'){
   attrs.militaryAssessed=true;attrs.societyStep='military';attrs.militaryAssessedIllness=p.stats.illness||0;
   if((p.stats.illness||0)>=2){attrs.societyStep='hub';attrs.militaryResumeStep='';attrs.militaryStatus='복무 제외';attrs.militaryReason='게임 규칙 · 정신건강 사유';title='병역판정 · 복무 제외';detail='판정 당시 정신병'+p.stats.illness+' 단계로, 이 게임의 단순화 규칙에 따라 복무에서 제외됐다. 실제 병역 등급이나 의학적 진단을 뜻하지 않는다.';}
   else{attrs.militaryStatus='입대 대기';attrs.militaryReason='판정 완료 · 입대 시기 선택';detail='입대할 수 있는 상태로 기록했다. 대학·일과 입대 순서는 직접 정한다.';}
  }
  if(['army','navy','air','nco'].includes(action)){
   const [branch,duration]={army:['육군',18],navy:['해군',20],air:['공군',21],nco:['부사관',48]}[action];pauseCollege();Object.assign(attrs,{militaryStatus:'복무 중',militaryBranch:branch,militaryDuration:duration,militaryReason:P.genderOf(p)==='female'?'여성 자원복무':'판정 후 입대',societyStep:'military-service',phase:'adult',job:branch+' 복무'});activate.income=0;
   if(employed(p)){attrs.employmentStatus='퇴사';attrs.careerLastReason='입대에 따른 직장 중단';}
  }
  if(action.startsWith('service-')){Object.assign(attrs,{militaryStatus:'복무 완료',militaryServed:true,militaryCompletedMonths:a.militaryDuration,societyStep:'hub',phase:'adult',job:'구직 중'});stats.money=5000000;stats.stress=action==='service-lead'?3:1;stats.relations=(action==='service-lead'?2:1)+(P.genderOf(p)==='female'?1:0);detail=a.militaryBranch+' '+a.militaryDuration+'개월을 마쳤다. 학업은 휴학 상태로 남고 직접 복학해야 한다. 적립금은 실제 급여표가 아닌 시연 정산액이다.';}
  if(action==='career'){attrs.societyStep=employed(p)?a.employmentSector==='business'?'business':'work':a.careerResumeStep==='job-offer'?'job-offer':'career-search';attrs.careerResumeStep='';if((a.careerChapterPeriods||0)>=3)attrs.careerChapterPeriods=0;}
  if(action==='training'){attrs.careerTraining=Math.min(3,(a.careerTraining||0)+1);stats.stress=1;attrs.societyStep='career-search';}
  if(action.startsWith('apply-')){const sector=action.slice(6),j=jobs[sector],attempt=(a.jobAttempts||0)+1;Object.assign(attrs,{jobAttempts:attempt,jobTarget:sector,jobOfferIncome:salary(p,sector),jobAccepted:sum(p,'job:'+attempt+':'+sector)*100<chance(p,sector),societyStep:'job-offer'});stats.money=-j.cost;stats.stress=j.pressure;title=attrs.jobAccepted?'채용 · '+j.title+' 제안':'지원 결과 · 이번에는 불합격';detail=j.months+'개월의 준비를 거쳤다. '+(attrs.jobAccepted?'채용 조건을 확인하고 수락 여부를 정한다.':'이번 지원은 불합격이었다. 훈련과 다른 채용 경로를 검토할 수 있다.');}
  if(action==='search-again')attrs.societyStep='career-search';
  if(action==='accept'){
   const j=jobs[a.jobTarget];pauseCollege();Object.assign(attrs,{employmentStatus:'재직',employmentSector:a.jobTarget,careerSectors:(a.careerSectors||0)|({private:1,public:2,local:4}[a.jobTarget]),societyStep:'work',careerChapterPeriods:0,careerResumeStep:'',phase:'adult',job:j.title,careerCurrent:j.title,careerLastReason:'채용'});activate.income=a.jobOfferIncome||salary(p,a.jobTarget);
  }
  if(action==='startup'){pauseCollege();stats.money=-3000000;stats.stress=2;Object.assign(attrs,{employmentStatus:'재직',employmentSector:'business',careerCurrent:'자영업자',careerSectors:(a.careerSectors||0)|8,careerLastReason:'개업',societyStep:'business',careerChapterPeriods:0,careerResumeStep:'',phase:'adult',job:'자영업자'});activate.income=0;}
  if(action.startsWith('work-')){
   const income=p.stats.income||jobs[a.employmentSector].income,mode=action.slice(5),project=mode==='project',team=mode==='team',round=(a.workPeriods||0)+1;
   Object.assign(attrs,{careerMonths:(a.careerMonths||0)+6,workPeriods:round,careerChapterPeriods:(a.careerChapterPeriods||0)+1,societyStep:(a.careerChapterPeriods||0)+1>=3?'hub':'work',careerProjects:(a.careerProjects||0)+(project?1:0)});
   stats.money=Math.round(income*6*(mode==='balance'?.72:1))-7200000+(project?1500000:team?-500000:0);stats.stress=project?3:team?2:-1;stats.relations=team?2:-1;
   attrs['career'+({private:'Private',public:'Public',local:'Local'}[a.employmentSector])+'Months']=(a['career'+({private:'Private',public:'Public',local:'Local'}[a.employmentSector])+'Months']||0)+6;
   const laidOff=!context.preview&&a.employmentSector!=='public'&&sum(p,'contract:'+round)<(project?.18:team?.08:.05);
   if(laidOff){attrs.societyStep='hub';attrs.careerResumeStep='';attrs.employmentStatus='계약 종료';attrs.careerLastReason='계약 종료 · 재취업 준비';attrs.job='구직 중';activate.income=0;stats.money+=1000000;title='경력은 남고, 계약은 끝났다';detail='반년 동안 일한 수입과 생활비, 정리 지원금100만 원을 정산했다. 근무 이력은 보존한다. 같은 직장이 늘 안전한 것은 아니었다.';}else detail=p.job+' · 6개월 근무 수입과 생활비를 정산했다. '+(project?'성과 실적을 남겼지만 관계와 부담을 지불했다.':team?'협업과 고객 관계에 시간을 나눴다.':'추가 수입 대신 개인 시간을 확보했다.');
  }
  if(action.startsWith('business-')){
   const round=(a.workPeriods||0)+1,expand=action==='business-expand',draw=sum(p,'business:'+round),profit=context.preview?0:expand?(draw<.35?-2500000:draw<.75?1500000:5000000):Math.round((600000+draw*1600000)/10000)*10000;
   attrs.workPeriods=round;attrs.careerMonths=(a.careerMonths||0)+6;attrs.careerBusinessMonths=(a.careerBusinessMonths||0)+6;attrs.careerChapterPeriods=(a.careerChapterPeriods||0)+1;attrs.societyStep=attrs.careerChapterPeriods>=3?'hub':'business';stats.money=Math.max(-p.stats.money,profit);stats.stress=expand?3:1;stats.relations=expand?-1:2;
   if(p.stats.money+profit<=0){attrs.societyStep='hub';attrs.careerResumeStep='';attrs.employmentStatus='폐업';attrs.careerLastReason='자금 소진으로 폐업';attrs.job='구직 중';activate.income=0;title='가게를 정리했다';}detail='반년의 매출·운영비·생활비 정산 '+stats.money.toLocaleString()+'원. '+(attrs.employmentStatus==='폐업'?'재산이 소진되어 폐업했다. 거래 경험은 기록에 남았다.':'영업 이력을 이어간다.');
  }
  if(action==='quit'){attrs.careerResumeStep='';attrs.careerChapterPeriods=0;attrs.employmentStatus=a.employmentSector==='business'?'폐업':'퇴사';attrs.careerLastReason='자발적 전환';attrs.societyStep='hub';activate.income=0;updateJob();attrs.job=a.collegeStatus==='재학'?'대학생':'구직 중';}
  if(action==='community'&&flow===2){attrs.societyStep='community';attrs.communityResumeStep='';}
  if(action==='rest'&&flow===2){attrs.societyStep='recovery';attrs.recoveryResumeStep='';}
  if(action==='community-work'||action==='community'&&flow!==2){if(action==='community')months=3;attrs.societyStep='hub';stats.stress=1;stats.relations=2;attrs.communityVisits=(a.communityVisits||0)+1;stats.money=-Math.min(moneyOf(p),150000);}
  if(action==='recover'||action==='rest'&&flow!==2){if(action==='rest')months=3;attrs.societyStep='hub';stats.stress=-3;stats.relations=-1;stats.money=-Math.min(moneyOf(p),180000);}
  if(action==='repay'){const amount=Math.min(moneyOf(p),a.studentDebt,1000000);stats.money=-amount;attrs.studentDebt=a.studentDebt-amount;}
  if(action==='politics'){attrs.societyStep='politics';attrs.politicsResumeStep='';}
  if(action.startsWith('politics-')){
   if(serving(p)||employed(p)&&a.employmentSector==='public')throw new Error('현재 신분에서는 정치 활동에 참여할 수 없음');
   const route=action.slice(9),label={party:'정당 공개 모임',local:'주민 활동',independent:'무소속 준비'}[route];
   Object.assign(attrs,{politicalEntryReady:true,politicalRoute:route,politicalPathLabel:label,politicalMilitaryServed:!!a.militaryServed,societyStep:'ready'});stats.stress=route==='independent'?2:1;stats.relations=route==='local'?1:0;title='정치 입문을 준비하다 · '+label;detail='학생기와 사회의 이력을 그대로 가지고 '+label+'에서 출발하기로 했다. 실제 정당 가입·출마·선거는 아직 시작하지 않았다.';
  }
  if(action==='finish'){attrs.societyComplete=true;attrs.admissionDestination='finished';title='정치 입문 직전 · 이번 장의 기록';}
 }
 if(attrs.societyStep!==undefined)attrs.societyNarrativePending=!['hub','ready'].includes(attrs.societyStep);
 if(months){const total=(a.societyMonths||0)+months;attrs.societyMonths=total;attrs.age=(a.societyAgeBase||p.age)+Math.floor(total/12);detail+=' ['+months+'개월 경과]';}
 return {effects:{attributes:attrs,stats,schools,traits,activate,deactivate},history:{title,detail,importance:['start','finish'].includes(action)||action.startsWith('politics-')?'major':'normal'}};
}
const moneyOf=p=>Math.max(0,p.stats.money||0);
const labels={collegeResumeStep:'멈춘 대학 단계',collegeFundedYear:'등록 완료 학년',militaryResumeStep:'멈춘 병역 단계',careerResumeStep:'멈춘 경력 단계',politicsResumeStep:'멈춘 정치 단계',communityResumeStep:'멈춘 지역 단계',recoveryResumeStep:'멈춘 생활 단계',careerChapterPeriods:'이번 경력 장의 반년 회차',societyNarrativePending:'사회 경로 소식 대기',careerPrivateMonths:'기업 근무 개월',careerPublicMonths:'공직 근무 개월',careerLocalMonths:'현장 근무 개월',careerBusinessMonths:'자영업 개월',societyActive:'사회 진입',societyComplete:'사회 장 종료',societyStep:'사회 진행',societyMonths:'성인기 경과 개월',societyAgeBase:'사회 진입 나이',collegeName:'대학',collegeYears:'학제',collegeCompleted:'이수 연수',collegeStatus:'학적',collegeMerit:'학업 경험',collegeNetwork:'대외활동 경험',collegeWork:'대학 근로 경험',studentDebt:'학자금 원금',militaryStatus:'병역',militaryReason:'병역 사유',militaryServed:'복무 여부',militaryAssessed:'판정 완료',militaryAssessedIllness:'판정 당시 상태',militaryBranch:'복무 군',militaryDuration:'복무 예정 개월',militaryCompletedMonths:'복무 개월',employmentStatus:'고용 상태',employmentSector:'직업 분야',careerCurrent:'최근 직업',careerMonths:'근무 개월',careerSectors:'경력 분야',careerLastReason:'최근 전환 사유',careerTraining:'직업훈련 경험',careerProjects:'업무 실적',workPeriods:'근무 회차',jobOfferIncome:'채용 제안 월 수입',jobAttempts:'지원 회차',jobTarget:'지원 분야',jobAccepted:'채용 결과',communityVisits:'지역 활동',politicalEntryReady:'정치 입문 준비',politicalRoute:'정치 입문 경로',politicalPathLabel:'입문 준비',politicalMilitaryServed:'입문 당시 복무 여부'};
g.GukminSociety=Object.freeze({choice,lineChoice,decision,tuition,chance,legalAge,guidance,canReturn,narrative});
g.GukminDirector.register({id:'society',generate:()=>({attributes:Object.fromEntries(Object.entries(labels).map(([key,label])=>[key,{label,hidden:!['collegeStatus','militaryStatus','militaryReason','employmentStatus','politicalPathLabel'].includes(key),icon:key.startsWith('military')?'flag':'school'}])),choices:[{id,layer:'한방 선택',title:'사회',presentation:{type:'society'},options:[{id:'back',label:'사회로',result:{}}]},{id:lineId,layer:'일상 선택',title:'사회 경로',presentation:{type:'society-line'},options:[{id:'back',label:'사회로',result:{}}]}],events:[
 {id:'society:entry',at:0,layer:'소식 이벤트',title:'교문 밖, 사회로',presentation:{kind:'graduation',when:{age:{lte:19}}},when:{all:[{any:[{attributes:{admissionDestination:'college'}},{attributes:{admissionDestination:'employment'}}]},{not:{attributes:{societyActive:true}}}]},result:{societyDecision:{action:'start'}}},
 {id:'society:narrative',at:0,every:1,repeatFrom:'start',layer:'소식 이벤트',title:'사회 · 이어지는 생활',when:{attributes:{societyActive:true,societyComplete:false,societyNarrativePending:true}},result:{societyDecision:{action:'narrate'}}},
 {id:'society:line',at:0,every:1,repeatFrom:'start',layer:'일상 이벤트',title:'사회 · 이어지는 생활',choice:lineId,when:{all:[{attributes:{societyActive:true,societyComplete:false}},{any:['college-program','college-funding','college-year','military','military-service','career-search','job-offer','work','business','politics','community','recovery','region-map'].map(societyStep=>({attributes:{societyStep}}))}]}},
 {id:'society:activity',at:0,every:1,repeatFrom:'start',layer:'한방 이벤트',title:'사회 · 다음 행선지',choice:id,when:{all:[{attributes:{societyActive:true,societyComplete:false}},{not:{attributes:{admissionDestination:'finished'}}},{any:[{attributes:{societyStep:'hub'}},{attributes:{societyStep:'ready'}}]}]}}
]})});
})(window);
