/* Adult event catalogue and activity districts. Decisions and time belong to GukminSociety. */
(function(g){
'use strict';
const A=p=>p.attributes||{};
const regions=Object.freeze([
 {id:'mapo',name:'서울 마포구',bit:1,home:'서울특별시.마포구.',x:34,y:31,issue:'합정역 환승 정류장의 배차 공백',npc:'주민 이서진'},
 {id:'bundang',name:'경기 성남시 분당구',bit:2,home:'경기도.성남시.분당구.',x:47,y:37,issue:'판교 출퇴근길 버스 혼잡',npc:'직장인 박윤아'},
 {id:'yuseong',name:'대전 유성구',bit:4,home:'대전광역시.유성구.',x:49,y:53,issue:'연구단지 퇴근 시간 막차 공백',npc:'연구원 김도현'},
 {id:'haeundae',name:'부산 해운대구',bit:8,home:'부산광역시.해운대구.',x:80,y:76,issue:'관광철 상점가 앞 보행 혼잡',npc:'상인 정민서'}
]);
const active=p=>regions.find(r=>r.id===A(p).adultActivityRegionId)||regions[0];
const flags=p=>A(p).adultRegionFlags??3;
const row=(id,label,outlook,stats={},attributes={},mode='',bonus=0)=>({id,label,outlook,stats,attributes,mode,bonus});
const scene=(title,body,months,options,teaser=title)=>({title,body,months,options,teaser});
function select(p,stage){
 const a=A(p),year=(a.collegeCompleted||0)+1,phase=a.collegeScenePhase||0,period=a.careerChapterPeriods||0,site=active(p);
 if(stage==='college-year'){
  if(year===1&&!phase)return scene('수강신청, 남은 자리 0석','필수 전공 수업이 마감됐다. 새로고침만으로는 해결되지 않는다. 이번 시간표로 어떤 사람과 만날지도 달라질 것이다.',0,[
   row('c-time-ask','교수에게 증원을 요청한다','가능성을 얻지만 답을 기다리며 부담이 생긴다.',{stress:2,relations:1},{adultCampusEntry:'ask'}),
   row('c-time-switch','다른 분반으로 변경한다','안정적인 시간표를 얻고 희망 시간은 포기한다.',{stress:1},{adultCampusEntry:'switch'}),
   row('c-time-drop','공강과 아르바이트를 지킨다','여유를 얻지만 학과 친구를 만날 기회는 줄어든다.',{stress:-1,relations:-1},{adultCampusEntry:'drop'})]);
  if(year===1)return scene('발표 전날의 읽씹','내일 발표인데 조원 둘이 연락되지 않는다. 동기 하린은 기여도를 남기자고 캡처를 보냈다. 마감까지 남은 시간은 짧다.',12,[
   row('c-team-solo','내가 발표 자료를 마무리한다','발표는 살리지만 부담이 크게 늘어난다.',{stress:3,relations:-1},{adultTeamHistory:'solo'}),
   row('c-team-proof','기여 내역을 기록해 제출한다','증거를 얻는 대신 팀의 반발을 감수한다.',{stress:2,relations:-2},{adultTeamHistory:'proof'}),
   row('c-team-talk','하린과 역할을 다시 조정한다','관계를 지키지만 발표 완성도가 불확실하다.',{stress:1,relations:1},{adultTeamHistory:'talk'})],'팀플 발표 전날, 빈 자료가 가득하다.');
  if(year===2&&!phase)return scene('익명 동료평가, 다시 온 연락',
   (a.adultTeamHistory==='proof'?'지난해 저장한 기여도 증빙이 있다. ':a.adultTeamHistory==='talk'?'하린과 역할을 재조정하던 일이 떠오른다. ':'지난해 발표를 혼자 떠안았던 기억이 남았다. ')+'하린이 동료평가를 어떻게 작성할지 물었다.',0,[
    ...(a.adultTeamHistory==='proof'?[row('c-eval-proof','기여도 증빙을 제출한다','평가 근거가 되지만 동료와의 거리는 멀어진다.',{stress:1,relations:-2},{adultTeamReview:'proof'})]:[]),
    row('c-eval-talk','하린과 따로 면담한다','다음 협업의 여지를 남기지만 불공정함을 감수한다.',{stress:1,relations:2},{adultTeamReview:'talk'}),
    row('c-eval-pass','평가를 짧게 쓰고 넘어간다','부담은 줄지만 내 기여가 보이지 않을 수 있다.',{stress:-1,relations:-1},{adultTeamReview:'pass'})],'지난 팀플에서 끝났다고 믿었던 일이 다시 나타났다.');
  if(year>=3&&!phase)return scene(year>=4?'졸업 발표 명단의 빈칸':'학과 선배의 현장 프로젝트 제안',
   year>=4?'졸업을 앞두고 제출 서류에 누락이 발견됐다. 주변의 도움을 받을지 혼자 해결할지 고민한다.':'학과 선배가 외부 담당자와 함께할 프로젝트를 제안했다. 학점과 함께하기에는 일정이 빠듯하다.',0,[
    row('c-field-lead','직접 해결하고 이끈다','성과와 부담이 함께 따른다.',{stress:3,relations:1}),
    row('c-field-help','동료와 역할을 나눈다','성과 일부 대신 관계를 쌓는다.',{stress:2,relations:2}),
    row('c-field-reduce','범위를 줄이고 일정부터 지킨다','안정적으로 진행하지만 기회는 줄어든다.',{stress:-1,relations:-1})]);
  if(year===a.collegeYears)return scene('졸업요건 미확인 안내','마지막 이수 확인서에 빨간 표시가 떴다. 조교가 세 가지 보완 방법을 알려 줬다. 이 과정을 실제로 마쳐야 졸업할 수 있다.',12,[
    row('c-grad-class','보충 수업과 과제를 제출한다','돈과 부담을 내고 요건을 채운다.',{money:-500000,stress:1}),
    row('c-grad-appeal','지난 활동 증빙을 제출한다','비용 대신 서류와 면담에 시간을 쓴다.',{stress:3}),
    row('c-grad-arrange','일정을 바꿔 과제를 마친다','관계에 쓸 시간을 줄이고 요건을 채운다.',{stress:2,relations:-2})],'졸업 신청 직전에 추가 보완 안내를 받았다.');
  return scene('공동 프로젝트의 어긋난 일정','팀 과제의 기한을 두고 의견이 갈린다. 결과물을 끝낼지 팀의 동의를 구할지 결정해야 한다.',12,[
    row('c-project-lead','내가 발표와 마감을 책임진다','성과를 얻지만 큰 부담이 따른다.',{stress:3,relations:-1}),
    row('c-project-talk','역할과 일정을 조정한다','실적 일부 대신 신뢰를 얻는다.',{stress:2,relations:2}),
    row('c-project-reduce','과제 규모를 줄인다','부담을 낮추고 성과의 상한을 포기한다.',{stress:-1,relations:-1})]);
 }
 if(stage==='career-search'&&!a.adultInterviewAnswer)return scene('채용 담당자의 질문',
   (a.careerGapYears?'오래 준비한 기간의 공백을 ':a.militaryServed?'복무 이후의 경험을 ':'학교와 생활에서 쌓은 일을 ')+'어떻게 설명할지 고민된다. 이번 답변은 다음 한 번의 지원에만 영향을 준다.',0,[
    row('j-detail','준비한 일을 구체적으로 설명한다','합격 가능성을 조금 높이는 대신 부담이 따른다.',{stress:2},{adultInterviewAnswer:'detail'}),
    row('j-short','이유만 간단히 설명한다','안정적이지만 별도 평가 이점은 없다.',{stress:1},{adultInterviewAnswer:'short'}),
    row('j-change','진로를 바꾼 이유를 이야기한다','진솔하나 심사에서 불리할 수 있다.',{relations:1},{adultInterviewAnswer:'change'})]);
 if(stage==='work'){
  if((a.workPeriods||0)>=3)return scene((a.workPeriods||0)%2?'갑작스러운 업무 인수인계':'예정에 없던 고객 요청',
   (a.workPeriods||0)%2?'동료가 회사를 옮기면서 업무가 남았다. 기존 인맥을 지킬지 새 책임을 맡을지 선택해야 한다.':'고객이 일정을 앞당겨 달라고 한다. 추가 성과와 내 생활 사이에서 방향을 정한다.',6,[
    row('w-later-lead','내가 맡아 마무리한다','추가 책임과 성과 가능성을 얻는다.',{stress:2,relations:-1},{},'project'),
    row('w-later-team','동료와 일을 나눠 해결한다','실적을 나누고 관계를 얻는다.',{stress:1,relations:2},{},'team'),
    row('w-later-scope','처리 범위를 조정한다','수익 기회를 줄이고 부담을 회복한다.',{stress:-1},{},'balance')]);
  if(period===0)return scene('성과 자료에서 내 이름이 빠졌다','지난번 보고서에는 내 기여가 없다. 동료 민재는 팀장과 먼저 이야기하자고 했다.',6,[
    row('w-credit-proof','작업 기록을 인사팀에 낸다','실적을 남기되 관계 충돌을 감수한다.',{stress:2,relations:-2},{adultWorkCredit:'proof'},'project'),
    row('w-credit-talk','민재와 함께 수정 요청을 한다','관계를 지키고 실적을 나눈다.',{stress:1,relations:1},{adultWorkCredit:'talk'},'team'),
    row('w-credit-pass','일단 넘어간다','부담은 줄지만 내 몫이 기록되지 않을 수 있다.',{stress:-1,relations:1},{adultWorkCredit:'pass'},'balance')]);
  if(period===1)return scene('기대보다 낮은 협상안',
    (a.adultWorkCredit==='proof'?'지난번 제출한 기록이 증빙으로 남아 있다. ':'민재가 공동 실적을 언급했다. ')+'인사팀의 협상안은 기대보다 낮다.',6,[
    row('w-pay-proof','성과를 근거로 협상한다','추가 보상을 얻을 수 있지만 부담이 크다.',{stress:2,relations:-1},{},'project',a.adultWorkCredit==='proof'?400000:150000),
    row('w-pay-flex','근무 조건을 먼저 조정한다','돈 대신 개인 시간과 관계를 택한다.',{stress:-1,relations:1},{},'balance'),
    row('w-pay-accept','현재 제안을 수용한다','안정적으로 일하며 큰 보상은 포기한다.',{}, {},'team')]);
  if(period===2)return scene('일터로 들어온 주민의 민원','업무 중 '+site.issue+' 문제가 반복 보고됐다. 제보하면 본업 밖의 책임이 늘어난다.',6,[
    row('w-issue-report','자료를 모아 주민에게 알린다','새로운 지역 활동의 단서를 얻고 업무 부담을 감수한다.',{stress:2,relations:-1},{adultWorkIssue:'report'},'project'),
    row('w-issue-team','회사 안에서 개선을 요청한다','동료와 협력하되 외부 영향은 제한된다.',{stress:1,relations:1},{adultWorkIssue:'team'},'team'),
    row('w-issue-pass','현재 맡은 일부터 마무리한다','부담을 줄이고 외부 참여는 미룬다.',{stress:-1},{adultWorkIssue:'pass'},'balance')]);
 }
 if(stage==='business'){
  if((a.workPeriods||0)>=3)return scene((a.workPeriods||0)%2?'납품처의 급한 주문':'가게 단골의 재방문',
   (a.workPeriods||0)%2?'오랜 거래처가 다음 주까지 주문을 크게 늘려 달라고 한다.':'정민서가 예전에 도왔던 상인과 함께 가게에 왔다. 공동 행사를 제안한다.',6,[
    row('b-later-expand','큰 주문에 도전한다','높은 매출 가능성과 손실 위험을 감수한다.',{stress:2},{},'expand'),
    row('b-later-regular','현재 고객부터 지킨다','수익 상한은 낮지만 관계가 안정된다.',{relations:2},{},'local'),
    row('b-later-reduce','영업 규모를 조정한다','부담을 줄이고 큰 기회는 포기한다.',{stress:-2,relations:-1},{},'local')]);
  if(period===0)return scene('처음 달린 별점 1점','주문 내역과 일치하지 않는 악평이 달렸다. 공개 답변이 다음 손님에게도 보인다.',6,[
    row('b-review-public','공개적으로 상황을 설명한다','대화 기회를 얻되 오해가 커질 수 있다.',{stress:1,relations:1},{adultShopReview:'public'},'local'),
    row('b-review-check','주문 기록을 확인한다','확인비를 들여 증빙을 남긴다.',{money:-100000,stress:1},{adultShopReview:'checked'},'local'),
    row('b-review-improve','포장과 품질을 개선한다','개선비를 쓰고 부담을 덜어 낸다.',{money:-300000,stress:-1},{adultShopReview:'improved'},'expand')]);
  if(period===2)return scene('가게 앞 도로 공사 공고','가게 앞 보행로가 막힌다는 안내가 붙었다. 상인 정민서가 공동 대응을 제안했다.',6,[
    row('b-road-group','상인들과 의견서를 만든다','지역의 사람들을 만나고 시간과 부담을 쓴다.',{stress:2,relations:2},{adultShopRoad:'group'},'local'),
    row('b-road-guide','우회 안내물을 제작한다','홍보비를 쓰고 영업을 지킨다.',{money:-200000,relations:1},{adultShopRoad:'guide'},'expand'),
    row('b-road-reduce','영업을 잠시 축소한다','당장 부담을 낮추고 기회도 줄인다.',{stress:-2,relations:-1},{adultShopRoad:'reduce'},'local')]);
  return scene('단골손님의 뜻밖의 연락',
   (a.adultShopReview==='checked'?'지난 후기를 확인하던 일을 단골이 기억하고 있다. ':'오래 찾던 단골이 다른 손님을 데려왔다. ')+'주문을 늘릴지 단골 관계를 지킬지 결정할 때다.',6,[
    row('b-regular-expand','새 상품을 준비한다','매출이 크게 늘거나 손실을 볼 수 있다.',{stress:2},{},'expand'),
    row('b-regular-stay','단골 주문을 이어간다','큰 수익보다 안정적인 관계를 택한다.',{relations:2},{},'local'),
    row('b-regular-rest','영업 일정을 줄인다','관계 일부를 줄이고 부담을 회복한다.',{stress:-2,relations:-1},{},'local')]);
 }
 if(stage==='community'){
  const key='adultIssue'+site.id[0].toUpperCase()+site.id.slice(1);
  const n=Number.isFinite(a[key])?a[key]:(a.adultActivityRegionId===site.id?a.adultCommunityIssueStage||0:0);
  if(n===0)return scene(site.name+' · 주민 제보',site.npc+'이 '+site.issue+'에 관한 의견을 모아 달라고 했다.',3,[
    row('l-begin-field','현장 의견을 직접 듣는다','이동비와 부담을 써서 관계를 쌓는다.',{money:-150000,stress:2,relations:2}),
    row('l-begin-online','온라인으로 자료를 모은다','돈은 아끼지만 만남은 적다.',{stress:1,relations:1}),
    row('l-begin-defer','당장은 본업을 택한다','일정을 비우지 않고 활동 기회는 미룬다.',{stress:-1,relations:-1})]);
  if(n===1)return scene(site.name+' · 민원 서류 반려',site.npc+'이 돌아온 공문을 보여줬다. 시간대와 이용 인원 자료가 부족하다는 내용이다.',3,[
    row('l-file-data','자료를 보완해 제출한다','기록의 신뢰도를 높이고 비용을 쓴다.',{money:-100000,stress:2,relations:1}),
    row('l-file-meet','주민 회의를 연다','사람을 모으고 조율 부담을 감수한다.',{stress:2,relations:2}),
    row('l-file-defer','다음에 보완하기로 한다','당장의 부담을 줄이고 기회는 미룬다.',{stress:-1,relations:-1})]);
  if(n===2)return scene(site.name+' · 개선 회신',site.npc+'이 일부 조치가 가능하다는 답변을 보내왔다. 문제 전체가 해결된 것은 아니다.',3,[
    row('l-end-track','실행 일정까지 확인한다','실제 변화를 감시하고 부담을 감수한다.',{stress:2,relations:2},{adultCommunityOutcome:'tracked'}),
    row('l-end-share','결과를 주민에게 공유한다','후속 참여의 길을 남긴다.',{stress:1,relations:1},{adultCommunityOutcome:'shared'}),
    row('l-end-close','부분 성과를 인정한다','본업으로 돌아가고 후속 관심은 줄어든다.',{stress:-1},{adultCommunityOutcome:'closed'})]);
  return scene(site.name+' · 후속 주민 모임',site.npc+'이 이전 제보의 진행을 함께 확인해 달라고 한다.',3,[
    row('l-later-help','새로 온 주민을 돕는다','시간을 들여 관계를 쌓는다.',{stress:1,relations:2}),
    row('l-later-check','기존 진행만 확인한다','부담을 줄이며 지켜본다.',{stress:-1,relations:1})]);
 }
 if(stage==='politics'&&(a.adultCommunityIssueStage||0)>=2&&!a.adultPoliticalInvitation)return scene('지역 포럼에서 온 초대장',site.npc+'이 지역 문제 활동을 포럼 관계자에게 소개했다. 수락해도 실제 입당이나 출마가 되는 것은 아니다.',0,[
   row('i-speech','공개 발언을 맡는다','인맥과 주목을 얻고 부담이 커진다.',{stress:2,relations:2},{adultPoliticalInvitation:'speech'}),
   row('i-docs','자료 정리로 협력한다','무대 밖에서 참여하고 시간을 쓴다.',{stress:1,relations:1},{adultPoliticalInvitation:'docs'}),
   row('i-later','이번 초대는 보류한다','생활을 지키고 가능성은 남긴다.',{stress:-1},{adultPoliticalInvitation:'later'})]);
 return null;
}

/* Adult-only, frozen presentation metadata; no shared renderer or save schema changes. */
function presentation(p,stage,event){
 const a=A(p),site=active(p),ids=event?.options?.map(o=>o.id)||[];
 const first=ids[0]||'',labels=Object.fromEntries((event?.options||[]).map(o=>[o.id,o.label]));
 const common=(kind,data)=>({kind,labels,...data});
 const msg=(sender,text,time)=>({sender,text,time});
 if(stage==='region-map')return common('map',{title:'활동 지역 선택',current:site.id,regions:regions.map(r=>({id:r.id,name:r.name,npc:r.npc,issue:r.issue,x:r.x,y:r.y}))});
 if(first==='c-time-ask')return common('course',{title:'수강신청',slots:[
  {column:1,time:'09:00',title:'전공 필수',note:'신청 0석',conflict:true},
  {column:2,time:'11:00',title:'교양 세미나',note:'신청 완료'},
  {column:3,time:'09:00',title:'근로 일정',note:'시간 충돌',conflict:true},
  {column:4,time:'14:00',title:'학과 모임',note:'참석 가능'},
  {column:5,time:'10:00',title:'공강',note:'조정 가능'}]});
 if(first==='c-team-solo')return common('chat',{title:'대학 팀플',actor:'하린',room:'전공 프로젝트 3조',subtitle:'하린 · 조원 2명 미응답',date:'발표 전날 22:41',
  messages:[msg('하린','다른 두 명은 아직 읽지도 않았어.', '22:41'),msg('하린','자료 수정 내역은 일단 캡처해 뒀는데 어떻게 할까?', '22:42')],
  playerMessages:{'c-team-solo':'내가 발표 자료 마무리할게.','c-team-proof':'기여도부터 정리해서 제출하자.','c-team-talk':'우선 역할부터 다시 나누자.'},
  responses:{'c-team-solo':[msg('하린','고마워. 대신 다음엔 이렇게 떠맡지 말자.','22:43')],'c-team-proof':[msg('하린','응, 자료는 내가 모아볼게. 다만 팀 분위기는 걱정돼.','22:43')],'c-team-talk':[msg('하린','좋아. 내가 다른 조원들한테도 연락할게.','22:43')]}});
 if(first==='c-eval-talk'||first==='c-eval-proof'){
  const previous=a.adultTeamHistory==='proof'?'지난번에 남긴 기여도 캡처 있잖아.':a.adultTeamHistory==='talk'?'작년엔 네가 역할 다시 나누자고 했었지.':'지난번 발표 혼자 준비하느라 힘들었지.';
  return common('chat',{title:'동료평가',actor:'하린',room:'하린 · 개인 대화',subtitle:'지난 학기 프로젝트 동료',date:'새 학기 18:12',messages:[msg('하린',previous,'18:12'),msg('하린','이번 동료평가에는 어떻게 쓸 생각이야?','18:13')],
    playerMessages:{'c-eval-proof':'기여도 증빙을 공식 제출할게.','c-eval-talk':'우리 따로 얘기하고 작성하자.','c-eval-pass':'짧게 쓰고 넘어갈게.'},
    responses:{'c-eval-proof':[msg('하린','알겠어. 내 기록도 찾아볼게.','18:14')],'c-eval-talk':[msg('하린','응, 이번엔 서로 정리하고 제출하자.','18:14')],'c-eval-pass':[msg('하린','그렇게 정했다면 존중할게.','18:14')]}});
 }
 if(first==='j-detail')return common('chat',{title:'채용 면접',actor:'면접관',room:'지원자 면접',subtitle:'질문 1 · 자기소개 및 경험',date:'면접 진행 중',
  messages:[msg('면접관',a.careerGapYears?'공백 기간에 어떤 활동을 했는지 구체적으로 들려주세요.':'지금까지의 경험 중 지원 업무와 연결되는 사례를 이야기해 주세요.','질문 01')],
  playerMessages:{'j-detail':'준비 과정에서 실제로 맡았던 일과 결과를 말씀드리겠습니다.','j-short':'중요한 계기만 간단히 설명하겠습니다.','j-change':'진로를 바꿔 도전하게 된 이유부터 말씀드리겠습니다.'},
  responses:{'j-detail':[msg('면접관','구체적인 사례는 참고하겠습니다.','답변 기록')],'j-short':[msg('면접관','감사합니다. 다음 질문으로 넘어가겠습니다.','답변 기록')],'j-change':[msg('면접관','변경 이유는 이해했습니다. 경험도 함께 검토하겠습니다.','답변 기록')]}});
 if(first==='w-credit-proof')return common('evidence',{title:'업무 공로 이의 신청',subtitle:'사내 인사 평가 · 증빙 자료',instruction:'최종 보고서에 내 이름이 빠졌습니다. 자료 2개를 함께 확인하면 공식 증빙으로 처리할 수 있습니다.',
  documents:[{id:'draft',title:'작업 초안',detail:'최초 작성자와 작성 시점이 기록되어 있음'},{id:'version',title:'버전 수정 기록',detail:'내가 변경한 항목과 승인 흐름'},{id:'partner',title:'민재의 확인 메시지',detail:'동료와 협의해 공동 요청 가능'}],
  required:['draft','version'],partner:'partner',mapping:{proof:'w-credit-proof',collab:'w-credit-talk',pass:'w-credit-pass'}});
 if(first==='w-pay-proof')return common('chat',{title:'연봉 협상',actor:'민재',room:'민재 · 업무 대화',subtitle:'지난 프로젝트의 동료',date:'인사평가 공지 후',
  messages:[msg('민재',a.adultWorkCredit==='proof'?'네가 낸 작업 기록, 이번 인사평가 때 다시 확인할 수 있을 거야.':a.adultWorkCredit==='talk'?'지난번에 우리가 같이 고친 보고서 기억하지?':'지난 보고서 이후에 네 업무는 좀 나아졌어?','17:30'),msg('민재','이번 조건, 어떻게 할 생각이야?','17:31')],
  playerMessages:{'w-pay-proof':'실적을 근거로 다시 협상해 볼게.','w-pay-flex':'급여보다 근무 조건부터 조정할게.','w-pay-accept':'이번 조건은 수용할게.'},
  responses:{'w-pay-proof':[msg('민재','증빙 정리 필요하면 내가 도울게.','17:32')],'w-pay-flex':[msg('민재','업무 분담도 같이 이야기하자.','17:32')],'w-pay-accept':[msg('민재','알겠어. 이후 평가에도 기록 남겨두자.','17:32')]}});
 if(first==='w-issue-report')return common('chat',{title:'지역 문제 제보',actor:'민재',room:'민재 · 업무 대화',subtitle:'동료와 지역 이야기',date:'근무 중',
  messages:[msg('민재','이 동네 '+site.issue+' 얘기가 계속 올라와.','12:05'),msg('민재','회사 안에서만 처리할까, 주민에게도 알릴까?','12:06')],
  playerMessages:{'w-issue-report':'자료 모아서 주민에게도 알려보자.','w-issue-team':'회사 안에서 개선을 요청하자.','w-issue-pass':'우선 담당 업무부터 마무리하자.'}});
 if(first==='l-begin-field')return common('chat',{title:'주민 연락',actor:site.npc,room:site.name+' 주민 모임',subtitle:site.npc+' 외 참여자',date:'활동 제안',
  messages:[msg(site.npc,site.issue+' 문제에 관해 의견을 모으고 있어요.','10:08'),msg(site.npc,'직접 만날 수 있을까요? 온라인으로도 도움 받을 수 있어요.','10:09')],
  playerMessages:{'l-begin-field':'현장에 가서 직접 이야기를 들어볼게요.','l-begin-online':'온라인으로 자료와 의견을 모아볼게요.','l-begin-defer':'지금은 일정 때문에 참여하기 어려워요.'}});
 if(first==='l-file-data')return common('evidence',{title:site.name+' 민원 보완',subtitle:site.npc+' · 서류 반려 후 재접수',instruction:'접수한 민원이 반려됐습니다. 빠진 자료를 확인해 보완 제출하거나 주민 회의로 근거를 보강할 수 있습니다.',
  documents:[{id:'time',title:'혼잡 시간대 기록',detail:'언제 문제가 반복됐는지 확인'},{id:'count',title:'이용 인원 집계',detail:'현장 이용자 자료 보완'},{id:'partner',title:'주민 의견서',detail:'참여자의 공동 의견을 모음'}],
  required:['time','count'],partner:'partner',mapping:{proof:'l-file-data',collab:'l-file-meet',pass:'l-file-defer'}});
 if(first==='l-end-track')return common('chat',{title:'지역 민원 회신',actor:site.npc,room:site.name+' 주민 모임',subtitle:site.npc+' · 진행 상황',date:'이전 접수 이후',
  messages:[msg(site.npc,'보완했던 민원에 답변이 왔어요.','14:20'),msg(site.npc,'일부 개선은 가능하대요. 그런데 실행 일정은 아직 없네요.','14:21')],
  playerMessages:{'l-end-track':'실제 시행 시점까지 확인해 봐요.','l-end-share':'주민들에게 진행 상황을 공유해요.','l-end-close':'부분 개선이라도 확인된 점은 정리하죠.'}});
 if(first==='i-speech')return common('chat',{title:'지역 포럼 초청',actor:site.npc,room:site.npc+' · 개인 대화',subtitle:'지역 문제 활동의 후속 연락',date:'민원 회신 이후',
  messages:[msg(site.npc,'지난번에 함께 다룬 일 때문에 지역 포럼에서 연락이 왔어요.','19:11'),msg(site.npc,'발언을 맡아도 되고 자료만 도와도 돼요. 참석 안 해도 괜찮습니다.','19:12')],
  playerMessages:{'i-speech':'공개 발언을 준비해 볼게요.','i-docs':'무대 밖에서 자료를 정리할게요.','i-later':'이번 모임은 보류할게요.'}});
 if(first.startsWith('b-review-'))return common('chat',{title:'가게 후기 알림',actor:'고객',room:'우리가게 · 리뷰 관리',subtitle:'방문 고객의 공개 후기',date:'새 리뷰 · ★☆☆☆☆',
  messages:[msg('고객','주문했던 내용과 실제 받은 게 달랐어요. 다시는 안 갈 것 같아요.','새로 등록됨')],
  playerMessages:Object.fromEntries((event.options||[]).map(o=>[o.id,o.label]))});
 return null;
}

g.GukminAdultStories=Object.freeze({regions,active,flags,select,presentation});
})(window);
