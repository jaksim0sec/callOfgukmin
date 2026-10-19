(() => {
'use strict';
const VERSION = 1, KEY = 'callofgukmin-save-v1';
const $ = id => document.getElementById(id);
const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
const sample = xs => xs[Math.floor(Math.random() * xs.length)];
const R = n => Math.random() < n;
const LABELS = {skill:'실력',network:'인맥',money:'자금',fame:'인지도',trust:'신뢰'};
const ENDINGS = {
  president:{title:'대한민국 대통령 당선', tag:'제1호 당선인',icon:'🏛️',quote:'국민이 당신을 불렀다. 이제부터가 진짜 시작이다.'},
  defeated:{title:'대선 낙선',tag:'최종 투표 결과',icon:'🗳️',quote:'패배했다고 삶 전체가 패배한 건 아니다.'},
  nomination:{title:'경선 탈락',tag:'대권 도전 좌절',icon:'📉',quote:'당원들은 박수를 쳤고, 표는 다른 사람에게 갔다.'},
  pundit:{title:'정치 방송의 단골손님',tag:'방송인 엔딩',icon:'🎙️',quote:'세상을 바꾸려다 세상을 해설하게 되었다.'},
  ordinary:{title:'평범하지만 괜찮은 인생',tag:'시민 엔딩',icon:'☕',quote:'국민이 부르지 않아도 내 삶은 계속된다.'},
  business:{title:'재계의 큰손',tag:'경제인 엔딩',icon:'🏢',quote:'정치인에게 전화가 오는 사람이 되었다.'},
  worker:{title:'오래된 직장인의 퇴근길',tag:'직장인 엔딩',icon:'💼',quote:'나라를 구하진 않았지만 월세는 냈다.'},
  creator:{title:'정치 유튜브의 별',tag:'크리에이터 엔딩',icon:'📱',quote:'생방송 댓글은 의회보다 냉정했다.'},
  unemployed:{title:'국민은 아무도 부르지 않았다',tag:'구직 엔딩',icon:'📭',quote:'다시 시작하기엔 언제나 오늘이 가장 빠르다.'},
  scandal:{title:'대형 논란으로 정계 은퇴',tag:'논란 엔딩',icon:'📰',quote:'어제의 편법은 오늘의 헤드라인이 되었다.'},
  prison:{title:'법정에서 맞이한 결말',tag:'유죄 판결 엔딩',icon:'⚖️',quote:'지지율로 법적 책임을 지울 수는 없었다.'},
  advisor:{title:'킹메이커',tag:'정치 참모 엔딩',icon:'♟️',quote:'왕관을 쓰진 않았지만 판을 읽는 사람이 됐다.'},
  local:{title:'지역에서 기억되는 정치인',tag:'지역정치 엔딩',icon:'🏘️',quote:'작은 회의실의 결정도 누군가의 삶을 바꾼다.'},
  study:{title:'끝나지 않은 도전',tag:'수험 엔딩',icon:'📚',quote:'합격이 전부는 아니지만, 다시 볼 용기는 있었다.'}
};
const REGIONS = ['서울','경기','충청','강원','전라','경상','제주','인천'];
const FAMILIES = [
  {name:'맞벌이 가정',money:35,trust:43,skill:43,network:30,body:'부모님은 일하느라 바빴지만 식탁에서 세상 돌아가는 이야기는 끊이지 않았다.'},
  {name:'자영업 가정',money:31,trust:45,skill:40,network:43,body:'장사가 잘될 때도, 임대료 때문에 잠을 설치는 밤도 있었다.'},
  {name:'공무원 가정',money:43,trust:46,skill:45,network:38,body:'집안의 가장 자주 듣는 말은 규정을 잘 읽으라는 것이었다.'},
  {name:'넉넉한 가정',money:64,trust:38,skill:41,network:51,body:'기회는 남들보다 많았지만, 어떤 길을 갈지는 아직 몰랐다.'},
  {name:'형편이 어려운 가정',money:17,trust:49,skill:44,network:25,body:'어려운 형편에도 동네 사람들의 도움과 끈질긴 생활력이 있었다.'}
];
const SCHOOLS = {
  general:{name:'지역 일반고',skill:3,trust:3,network:2},
  special:{name:'특목고·자율고',skill:10,network:6,money:-7},
  vocation:{name:'특성화고',money:7,skill:3,network:4},
  arts:{name:'예체능 계열',fame:5,skill:3,money:-4},
  ged:{name:'검정고시',money:5,trust:1,skill:0}
};
const PARTIES = {
  blue:{name:'자유국민당',desc:'안정·경제 성장·법치. 원로 회의가 회의 시간보다 길다.',slogan:'바꾸지 말고 바로잡자',symbol:'▥',effects:{network:12,money:6,skill:2,trust:-2},fit:['산업·일자리','주거·민생']},
  red:{name:'민주혁신당',desc:'민생·복지·개혁. 회의를 시작하려면 먼저 회의 절차부터 토론한다.',slogan:'사람이 먼저, 회의도 먼저',symbol:'≋',effects:{trust:11,network:7,money:-3,fame:3},fit:['주거·민생','지역·교육']},
  gold:{name:'민생직진당',desc:'강한 재분배와 빠른 민생 개선. 내일 할 일을 오늘 공약한다.',slogan:'내일은 늦다, 오늘부터',symbol:'↯',effects:{fame:16,trust:2,money:-7,network:-4},fit:['현금 지급','주거·민생']},
  violet:{name:'철벽수호당',desc:'안보·질서·전통. 공지 하나에도 결재 도장이 세 개 필요하다.',slogan:'튼튼한 나라, 빈틈없이',symbol:'▣',effects:{network:10,skill:5,trust:3,money:-5},fit:['산업·일자리','지역·교육']},
  teal:{name:'실용미래당',desc:'협상·타협·균형. 어떤 질문에도 일단 검토부터 외친다.',slogan:'일단 검토, 그리고 실행',symbol:'⟲',effects:{skill:10,trust:6,network:5,fame:-3},fit:['지역·교육','산업·일자리']}
};
const STAGES = [
 {age:12,ch:'프롤로그 · 출생',category:'출생 기록',title:'첫 번째 선택은 누구에게나 온다',body:s=>s.family.body+'\n'+s.region+'에서 자랐다. 동네에 새 공원이 생긴다는 이야기가 들린다. 친구들은 시큰둥하다.',options:()=>[
  {t:'주민 설명회에 따라간다',d:'처음으로 공적인 문제를 들어본다',e:{skill:5,network:3,trust:4},note:'설명회에서 어른들이 토론하는 모습을 봤다. 정치가 교과서 밖에도 있다는 걸 알았다.'},
  {t:'친구들과 운동장을 지킨다',d:'말보다 사람들과 부딪힌다',e:{network:7,trust:2},note:'동네 또래들과 한바탕 놀았다. 동네 친구들은 오랫동안 기억에 남는다.'},
  {t:'도서관에서 혼자 자료를 읽는다',d:'표와 숫자가 은근 재밌다',e:{skill:8,money:-1},note:'예산표가 복잡하긴 했지만, 어디에 돈이 쓰이는지 처음 알아봤다.'}
 ]},
 {age:15,ch:'제1장 · 교실 밖의 세상',category:'진로',title:'어느 고등학교에 지원할까?',body:'중3 겨울이다. 누군가는 서울대 이야기만 하고, 누군가는 취업을 생각한다.\n각 학교의 문은 다르지만 인생의 정답은 하나가 아니다.',options:()=>[
  {t:'지역 일반고 진학',d:'교과·동아리·지역활동의 균형',e:{skill:3,trust:3,network:2},set:{school:'지역 일반고'},note:'익숙한 동네에서 새로운 친구들을 만났다.'},
  {t:'특목고 또는 자율고에 도전',d:'학업 자원과 경쟁, 비용 부담도 있다',e:{skill:10,network:6,money:-7},set:{school:'특목고·자율고'},note:'높은 경쟁과 특색 있는 활동을 경험했다. 이력서에는 한 줄이 늘었다.'},
  {t:'특성화고에서 실무 경험',d:'빠른 현장 경험과 기술 습득',e:{money:7,skill:3,network:4},set:{school:'특성화고'},note:'실습실에서 배운 기술이 나중에 먹고사는 기반이 되었다.'},
  {t:'대안교육 후 검정고시',d:'정규 진학 대신 자기 방식으로 공부',e:{money:5,skill:1,trust:2},set:{school:'검정고시'},note:'평범한 시간표를 벗어나 스스로 계획을 세워야 했다.'}
 ]},
 {age:17,ch:'제1장 · 교실 밖의 세상',category:'청소년',title:'학교 커뮤니티에 논쟁이 터졌다',body:'학생회가 행사 예산을 어디에 쓸지 두고 싸움이 났다. 누군가는 음악 축제를, 누군가는 낡은 시설 보수를 원한다.',options:()=>[
  {t:'공청회를 열어 의견을 듣는다',d:'시간은 걸려도 절차와 합의를 익힌다',e:{trust:9,skill:3,network:3},flag:'consensus',note:'학생들의 반발은 줄었지만, 결정까지 오래 걸렸다.'},
  {t:'가장 인기 많은 쪽을 밀어준다',d:'빠른 지지를 얻되 뒷말도 남는다',e:{fame:8,network:4,trust:-5},note:'행사는 화려했다. 다만 소외된 학생들의 불만이 남았다.'},
  {t:'예산 자료를 공개하고 직접 검증한다',d:'근거로 승부한다',e:{skill:8,trust:5,fame:-1},flag:'transparent',note:'모두가 만족하진 않았지만 지출의 납득 가능한 이유를 제시했다.'}
 ]},
 {age:19,ch:'제2장 · 기반을 다지다',category:'입시',title:'졸업장을 들고 어디로 갈까?',body:'친구들은 합격 문자와 취업 공고를 동시에 확인한다. 너도 결정을 내려야 한다.',options:s=>[
  {t:'수도권 4년제 대학에 지원',d:'비용과 인맥을 감수하고 전공을 판다',e:{skill:8,network:7,money:-9},set:{school:'수도권 4년제 대학 재학',career:'대학생'},note:'수많은 사람을 만났고 등록금 고지서도 받았다.'},
  {t:'지역 대학에서 전공과 활동 병행',d:'지역 기반과 학업을 함께 쌓는다',e:{skill:8,network:4,money:-3,trust:3},set:{school:'지역 4년제 대학 재학',career:'대학생'},note:'지역사회에서 사람들과 길게 관계를 맺었다.'},
  {t:'전문대 또는 직업훈련을 선택',d:'실무를 배워 빠르게 일한다',e:{skill:5,money:9,network:3},set:{school:'전문대·직업교육',career:'취업 준비'},note:'실무 역량을 갖추며 첫 수입을 준비했다.'},
  {t:'재수해서 다시 도전한다',d:'시간과 생활비를 투자하는 위험한 선택',e:{skill:9,money:-11,trust:-2},set:{school:'재수 과정',career:'수험생'},flag:'retake',note:'1년의 시간과 돈을 투자했다. 결과가 기대만큼 나올지는 모른다.',chance:.78,pass:{skill:5,school:'4년제 대학 재학',career:'대학생'},fail:{money:-7,trust:-3},failText:'합격은 다음 기회로 미뤄졌다. 마음을 추스르고 다른 진로도 알아보기 시작했다.'},
  {t:'바로 취업해 생활 기반을 만든다',d:'학력보다 현장 경험을 선택',e:{money:13,skill:3,network:3},set:{school:s.school,career:'사회 초년생'},note:'졸업식 뒤 며칠 만에 출근하게 됐다.'}
 ]},
 {age:23,ch:'제2장 · 기반을 다지다',category:'청년',title:'세상을 처음 제대로 마주한 날',body:s=>s.career==='대학생'?'졸업이 다가온다. 스펙과 생활비, 그리고 앞으로의 길을 결정해야 한다.':'주변 사람들이 저마다 다른 출발선에 서 있다. 네가 가진 카드로 무엇을 할까?',options:()=>[
  {t:'시험을 준비해 공직에 도전',d:'안정적 경력과 제도 이해, 준비 비용',e:{skill:9,trust:5,money:-5},set:{career:'공직 진입'},flag:'publicService',note:'행정 현장에서 시민의 민원을 직접 접하기 시작했다.'},
  {t:'기업에 취업해 실적을 쌓는다',d:'경제 경험과 저축이 강점',e:{money:15,skill:5,network:4},set:{career:'기업인'},note:'조직의 숫자와 사람을 관리하는 법을 배웠다.'},
  {t:'작은 사업을 시작한다',d:'큰 가능성과 큰 변동성',e:{money:-9,network:8,fame:4},set:{career:'창업가'},flag:'startup',note:'처음에는 고객보다 영수증이 많았다.',chance:.55,pass:{money:22,fame:7},fail:{money:-12,trust:-2},failText:'초기 자금이 생각보다 빨리 소진됐다. 폐업과 재도전 사이에서 고민했다.'},
  {t:'시민단체·지역 언론에 뛰어든다',d:'사회 현안과 시민 접촉, 돈은 넉넉지 않다',e:{fame:9,network:8,trust:5,money:-5},set:{career:'지역 활동가'},flag:'activist',note:'동네의 작은 문제가 뉴스가 되는 과정을 경험했다.'},
  {t:'채널을 만들어 시사 콘텐츠 제작',d:'인지도를 얻을 수 있지만 말의 책임도 생긴다',e:{fame:14,network:2,money:2,trust:-4},set:{career:'콘텐츠 제작자'},flag:'creator',note:'조회수가 늘었다. 동시에 예전 발언이 영상으로 남기 시작했다.'}
 ]},
 {age:27,ch:'제3장 · 사회인',category:'일과 책임',title:'눈앞에 부당한 제안이 놓였다',body:'함께 일하던 선배가 공공사업 관련 업체를 소개한다. 대가성이 의심되는 특혜를 약속하고 입을 맞추자고 한다.',options:()=>[
  {t:'부당한 제안을 거절하고 기록한다',d:'당장은 불편해져도 원칙을 지킨다',e:{trust:11,skill:4,network:-4},flag:'clean',note:'사람 몇 명과 관계가 틀어졌지만 나중에 당당히 설명할 수 있었다.'},
  {t:'모르는 척 거리를 둔다',d:'안전하지만 개선도 없다',e:{trust:-2,network:1},note:'일은 지나갔고 누군가 결국 문제를 제기했다.'},
  {t:'불투명한 거래에 편승한다',d:'짧게 돈을 벌지만 증거는 남는다',e:{money:24,network:9,trust:-14},risk:31,flag:'shady',note:'통장 잔액은 늘었다. 대신 누군가 계약서를 보관했다.'}
 ]},
 {age:31,ch:'제3장 · 사회인',category:'지역 사건',title:'우리 동네가 뉴스에 나왔다',body:'지역의 작은 공공시설이 예산 부족으로 문을 닫을 위기다. 당신이 할 수 있는 일을 고른다.',options:()=>[
  {t:'자료를 모아 예산 대안을 제안',d:'실력과 신뢰, 느리지만 확실한 관계',e:{skill:8,trust:9,network:4,money:-2},flag:'localWork',note:'지역 언론이 구체적인 대안을 소개했다.'},
  {t:'영상으로 이슈를 전국에 알린다',d:'화제성이 강하나 검증 부담도 생긴다',e:{fame:13,network:4,trust:-2},flag:'media',note:'조회수는 폭발했지만 사실 확인 요청도 쏟아졌다.'},
  {t:'후원금을 모아 당장 운영을 돕는다',d:'돈은 들지만 주민들이 기억한다',e:{money:-13,trust:13,network:7},flag:'patron',note:'기금으로 일단 위기를 넘겼다. 주민들은 이름을 기억했다.'},
  {t:'일과 가족을 선택해 관여하지 않는다',d:'정치와 거리를 두며 내 생활을 챙긴다',e:{money:6,skill:2,trust:1},flag:'privateLife',note:'동네 일도 중요하지만 자신의 삶을 지키는 것도 선택이다.'}
 ]},
 {age:34,ch:'제4장 · 정치라는 길',category:'정치 입문',title:'선거캠프에서 연락이 왔다',body:'지방선거를 준비하는 지인이 함께 일하자고 제안했다. 이후 정치권으로 들어갈 수도 있다.',options:()=>[
  {t:'캠프 실무자로 참여',d:'선거 현장을 배우는 첫 걸음',e:{network:13,skill:8,money:-7,fame:4},set:{career:'정치 캠프 실무자'},flag:'politics',note:'새벽부터 밤까지 회의와 현장 일정을 소화했다.'},
  {t:'정책 자문단에 참여',d:'전문성을 갖고 정치와 연결',e:{skill:12,network:7,trust:5},set:{career:'정책 자문위원'},flag:'politics',note:'좋은 공약은 슬로건보다 세부 설계가 중요하다는 걸 배웠다.'},
  {t:'기존 커리어를 계속 키운다',d:'정치에 뛰어들지 않고 기회를 남긴다',e:{money:12,skill:6,trust:2},flag:'privateTrack',note:'당장은 직업에 집중하기로 했다. 선택하지 않은 길도 인생의 일부다.'}
 ]},
 {age:37,ch:'제4장 · 정치라는 길',category:'커리어 전환',title:'사회에서 내 이름이 알려지기 시작했다',body:s=>s.flags.politics?'캠프 경험 뒤 정치 관계자들이 당신의 이름을 기억한다. 출마를 권하는 제안이 들어온다.':'선거와 거리를 두고 살았는데, 어느 날 동네 신문에서 당신을 인터뷰하겠다고 연락했다.',options:s=>[
  {t:'지역 의정 활동에 도전',d:'지방 정치의 현장을 밟는다',e:{fame:9,network:10,trust:5,money:-9},set:{career:'지역 정치인'},flag:'candidateLocal',note:'골목과 시장을 돌며 사람들의 이야기를 들었다.',chance:.66,pass:{fame:9,network:6,office:'지방의회 의원'},fail:{money:-5,fame:3},failText:'첫 선거에서 떨어졌다. 그래도 얼굴을 아는 주민들이 생겼다.'},
  {t:'이슈를 분석하는 전문가가 된다',d:'전문가 이미지와 대중 노출',e:{skill:9,fame:11,money:5},set:{career:'시사 전문가'},flag:'expert',note:'토론 프로그램에 출연해 말을 줄이는 연습을 했다.'},
  {t:'회사·사업에 집중하며 정치에 거리를 둔다',d:'정치는 선택 사항, 생활은 현실',e:{money:19,trust:4,skill:5},flag:'businessTrack',note:'사업 기회가 늘었고 정치권과는 적당한 거리를 유지했다.'},
  {t:'일단 아무 일도 하지 않고 쉰다',d:'회복의 시간, 경력은 잠시 멈춘다',e:{trust:3,network:-9,money:-10},flag:'rested',note:'조용한 시간이 길어졌다. 누구나 숨을 고를 권리가 있다.'}
 ]},
 {age:40,ch:'제5장 · 그 이름을 알리다',category:'대권 자격',title:'이제 대통령에 출마할 나이가 됐다',body:'대통령 선거에 나갈 최소 연령인 마흔이 되었다. 자격을 얻은 것과 후보가 될 수 있는 것은 완전히 다른 문제다.',options:()=>[
  {t:'정계 진출을 본격 준비한다',d:'당내 활동과 정책 조직을 꾸린다',e:{network:11,skill:7,money:-7,fame:5},flag:'presidentialTrack',set:{career:'정치인'},note:'출마는 아직 멀지만 당신의 이름이 지면에 오르기 시작했다.'},
  {t:'지역에서 천천히 실력을 쌓는다',d:'풀뿌리 의정과 지역 기반',e:{trust:13,network:9,fame:3,money:1},flag:'regionalTrack',set:{career:'지역 정치인'},note:'지방의 작은 성과를 꾸준히 쌓았다.'},
  {t:'대통령보다 내 일을 하기로 한다',d:'대권 경로를 벗어나 다른 인생으로',e:{money:12,trust:5,skill:3},flag:'quitPolitics',note:'국민이 부르기를 기다리지 않기로 했다. 대신 내 삶의 이름을 지킨다.',end:s=>s.flags.creator?'creator':s.money>65?'business':s.career==='수험생'?'study':s.money<18?'unemployed':'ordinary'}
 ]},
 {age:42,ch:'제5장 · 그 이름을 알리다',category:'정당과 노선',when:s=>!s.flags.quitPolitics,title:'정치의 간판을 선택할 시간',body:'선거는 혼자만의 의지로 치를 수 없다. 정당이 지원해 주기도 하지만 당내 이해관계를 맞춰야 한다.',options:()=>Object.entries(PARTIES).map(([k,p])=>({t:p.name,d:p.desc,e:p.effects,set:{party:p.name,partyKey:k},flag:'party_'+k,partyCode:k,slogan:p.slogan,symbol:p.symbol,note:p.name+'의 입당 원서를 냈다. 당 사무실엔 "'+p.slogan+'"라는 문구가 걸려 있었다. 선택한 노선은 공약과 선거 조직에도 영향을 준다.'}))},
 {age:44,ch:'제5장 · 그 이름을 알리다',category:'공직 선거',title:'의석 하나가 대권의 발판이 될까',body:'국회의원 선거가 다가왔다. 이길 수 있는 지역구를 찾으라는 조언부터 자리를 양보하라는 연락까지 쇄도한다.',options:s=>[
  {t:'험지에 정면 도전한다',d:'이기면 큰 성장, 지면 상처가 크다',e:{trust:6,money:-14},chance:clamp(7+(s.network+s.trust+s.fame)/9)/100,pass:{fame:18,network:14,office:'국회의원',trust:4},fail:{money:-7,fame:6},note:'사람들이 무모하다고 했지만 승부를 걸었다.',failText:'표 차이를 좁혔지만 패했다. 지역 사무실은 남았다.'},
  {t:'가능성이 높은 지역구에서 도전',d:'자원 배분은 안정적이지만 당내 협의가 필요하다',e:{network:4,money:-10},chance:clamp(30+(s.network+s.skill+s.trust)/8)/100,pass:{fame:12,network:13,office:'국회의원'},fail:{money:-7,fame:3},note:'연고가 있는 지역에서 선거운동을 시작했다.',failText:'조직과 현장이 어긋났다. 선거는 예상대로만 움직이지 않았다.'},
  {t:'출마하지 않고 정책·후보를 돕는다',d:'참모 경력을 쌓고 위험을 낮춘다',e:{network:14,skill:9,money:2,fame:2},set:{career:'정책 전략가'},flag:'advisor',note:'선거 전략을 설계했다. 당신의 이름보다는 후보 이름이 먼저 알려졌다.'}
 ]},
 {age:46,ch:'제5장 · 그 이름을 알리다',category:'공적 위기',title:'정계가 발칵 뒤집힌 날',body:'공공 예산을 둘러싼 의혹이 확산된다. 당신도 관련 문서를 갖고 있다. 언론이 자료 공개를 요청한다.',options:s=>[
  {t:'자료를 검증하고 사실관계를 공개',d:'단기 충돌을 감수하고 신뢰를 얻는다',e:{trust:15,skill:4,network:-5},risk:-12,flag:'accountable',note:'검증된 정보만 공개했다. 일부 동료와 불편해졌지만 설명은 일관됐다.'},
  {t:'정당과 메시지를 조율한다',d:'조직 유지에 유리하지만 의혹은 남는다',e:{network:10,trust:-7,fame:3},risk:7,note:'통일된 메시지는 얻었지만 의혹의 빈칸은 채워지지 않았다.'},
  {t:'과장된 폭로로 화제를 독점한다',d:'인지도는 뛰지만 허위 주장의 책임이 따른다',e:{fame:21,trust:-20,money:-3},risk:23,flag:'exaggerated',note:'순간적으로 실시간 검색어가 됐다. 정정 요청과 법적 분쟁이 이어졌다.'},
  {t:'언론전을 접고 지역 일에 몰두한다',d:'성장 속도는 늦지만 위험은 작다',e:{trust:6,skill:4,network:3,fame:-5},note:'카메라에서 잠시 멀어졌다. 지역 민원은 여전히 쌓여 있었다.'}
 ]},
 {age:48,ch:'제6장 · 대권의 문턱',category:'대선 경선',title:'드디어 대선이 보이기 시작했다',body:s=>s.office==='국회의원'?'국회에 이름을 올렸지만 대권 경선은 전혀 다른 게임이다.':'원외 인사라는 약점이 있다. 이름은 어느 정도 알려졌지만 조직과 돈은 부족하다.',options:s=>[
  {t:'정당 경선에 출마한다',d:'인맥·명성·신뢰로 후보 지명을 노린다',e:{money:-12,network:5,fame:6},flag:'primary',chance:clamp(7+(s.network+s.fame+s.skill+s.trust)/5.5+(s.office==='국회의원'?8:0)-(s.risk/2))/100,pass:{fame:15,trust:5,nomination:true},fail:{money:-8,trust:-6,fame:3,nomination:false},note:'전국을 돌며 당원과 지지자를 만났다.',failText:'경선에서 패배했다. 한 번의 패배가 인생 전부는 아니다.'},
  {t:'조직 없이 무소속으로 직행한다',d:'당내 경쟁은 없지만 자금과 지명도가 치명적',e:{money:-20,network:-10,fame:10},flag:'independent',chance:clamp(20+(s.money+s.fame)/9-s.risk/4)/100,pass:{nomination:true,fame:7},fail:{money:-9,trust:-4,nomination:false},note:'독자 출마를 추진했다. 후보 등록에 필요한 지원 조직을 꾸렸다.',failText:'후보 등록과 선거 조직에 필요한 조건을 채우지 못해 본선에 서지 못했다.'},
  {t:'대선캠프의 전략가로 남는다',d:'대통령은 아니어도 정치에 영향력을 남긴다',e:{network:14,skill:9,money:2},end:'advisor',note:'당신의 전략으로 다른 후보가 출마했다. 무대 뒤에도 정치가 있다.'},
  {t:'대권 도전을 접고 지역에 남는다',d:'지역의 장기적인 일을 택한다',e:{trust:10,network:9,money:3},end:'local',note:'큰 자리보다 가까운 주민의 얼굴을 택했다.'}
 ]},
 {age:49,ch:'제6장 · 대권의 문턱',category:'후보 확정',when:s=>s.nomination===false,title:'경선에서 떨어진 당신에게',body:'정치권은 잔인하다. 경선이 끝나자마자 카메라가 사라진다. 이제 어떤 사람이 될까?',options:()=>[
  {t:'정치 평론가로 전향한다',d:'말과 경험으로 새로운 무대를 연다',e:{fame:8,money:7},end:'pundit',note:'마이크를 잡고 다른 후보들의 공약을 분석하기 시작했다.'},
  {t:'지역 정치에 남아 다시 일한다',d:'선거보다 오래 가는 지역 정책을 택한다',e:{trust:9,network:6},end:'local',note:'동네 사람들은 경선 탈락보다 오랜 활동을 기억했다.'},
  {t:'직장·사업으로 돌아간다',d:'정치판을 내려놓는 것도 용기다',e:{money:11},end:'worker',note:'통근열차의 풍경이 오히려 편안하게 느껴졌다.'}
 ]},
 {age:49,ch:'제7장 · 선거전',category:'국정 비전',when:s=>s.nomination===true,title:'첫 번째 공약을 국민 앞에 내놓다',body:'경제·복지·교육·기후·지역발전 중 무엇을 첫 의제로 내세울지 캠프에서 격론이 벌어진다. 그럴듯한 약속만으로는 충분하지 않다.',options:()=>[
  {t:'주거·민생 생활비 개선',d:'재원과 공급 방법을 구체화해야 한다',e:{trust:8,skill:6,money:-6,fame:5},set:{pledge:'주거·민생'},flag:'policyRealist',note:'실행 가능한 재원 계획을 발표했다. 숫자는 어렵지만 설명을 피하지 않았다.'},
  {t:'지역 교통·교육 기회 확대',d:'장기 투자가 필요한 생활형 의제',e:{trust:10,network:5,skill:4},set:{pledge:'지역·교육'},note:'지역별 의견을 받고 구체적인 사업 우선순위를 제시했다.'},
  {t:'규제 혁신·일자리 투자',d:'성장 약속과 안전망 설계의 균형',e:{skill:8,network:8,fame:4,trust:-2},set:{pledge:'산업·일자리'},note:'창업자와 노동 현장의 반응이 엇갈렸다. 세부 대책을 추가했다.'},
  {t:'모두에게 큰 현금을 지급하겠다',d:'강한 주목을 얻지만 재원 설명이 약하다',e:{fame:18,trust:-11,skill:-4},risk:6,set:{pledge:'현금 지급'},flag:'populist',note:'온라인에서는 열광했지만 토론회에서 재원 질문이 쏟아졌다.'}
 ]},
 {age:49,ch:'제7장 · 선거전',category:'TV 토론',when:s=>s.nomination===true,title:'전국이 지켜보는 90분',body:'첫 TV 토론이다. 상대 후보가 당신의 공약에서 빈틈을 찾았다. 카메라는 계속 돌아간다.',options:s=>[
  {t:'불리한 숫자도 인정하고 대안을 설명',d:'근거와 태도가 시험대에 오른다',e:{trust:12,skill:4,fame:3},risk:-4,chance:clamp(35+s.skill/2)/100,pass:{trust:5,fame:4},fail:{fame:-4},note:'피하지 않는 태도로 토론을 마쳤다.',failText:'세부 숫자가 틀려 즉시 정정했다. 큰 반전은 없었다.'},
  {t:'감정적인 한 방으로 반격',d:'짤이 돌면 대박, 과하면 역풍',e:{fame:13,trust:-7},risk:9,chance:.48,pass:{fame:10},fail:{trust:-10},note:'짧은 발언이 화제가 됐다.',failText:'발언만 잘려 퍼지며 오해가 커졌다.'},
  {t:'상대 공약의 허점을 차분히 분석',d:'정책 실력으로 설득하는 방식',e:{skill:7,trust:7,fame:4},chance:clamp(25+s.skill/2)/100,pass:{fame:7,trust:4},fail:{fame:-3},note:'자료를 기반으로 문제를 짚었다.',failText:'너무 기술적인 설명이라는 평가도 나왔다.'},
  {t:'질문을 피하고 준비한 문구를 반복',d:'큰 사고는 막지만 소통 점수가 낮다',e:{fame:-4,trust:-9},note:'진행자는 재차 답을 요구했다. 다음 날 아침 기사 제목이 좋지 않았다.'}
 ]},
 {age:49,ch:'제7장 · 선거전',category:'선거 일주일 전',when:s=>s.nomination===true,title:'과거의 기록이 돌아왔다',body:s=>s.flags.shady?'오래전 수상한 거래의 계약서가 유출됐다. 상대 캠프가 해명을 요구한다.':'온라인에 과거 인터뷰와 소문이 섞여 퍼졌다. 정확한 사실 확인이 필요하다.',options:()=>[
  {t:'증거를 검증하고 사실대로 설명한다',d:'인정할 것은 인정하고 책임을 진다',e:{trust:11,fame:1,money:-3},risk:-15,flag:'explained',note:'과거의 일에 책임을 지고 공개할 자료를 공개했다.'},
  {t:'모든 걸 부인하며 의혹을 공격한다',d:'단기 결집의 가능성과 큰 신뢰 손실',e:{fame:8,trust:-14,network:6},risk:19,note:'맞불 기자회견을 열었다. 그러나 확인되지 않은 말은 더 큰 질문이 됐다.'},
  {t:'조용히 법적·사실 확인을 진행한다',d:'검증에 시간을 쓰고 발언은 아낀다',e:{skill:5,trust:3,money:-8},risk:-7,note:'화제성은 떨어졌지만 검증 가능한 내용으로 대응했다.'}
 ]},
 {age:49,ch:'제8장 · 국민의 선택',category:'마지막 유세',when:s=>s.nomination===true,title:'선거 마지막 날',body:'전국으로 방송되는 마지막 연설을 앞두고 캠프가 조언한다. 어떤 메시지로 끝낼까?',options:()=>[
  {t:'내가 잘못한 일부터 인정한다',d:'낮은 자세로 신뢰를 회복한다',e:{trust:11,fame:2},risk:-5,note:'완벽한 사람을 약속하지 않고 책임을 약속했다.'},
  {t:'구체적인 첫 100일 계획을 제시한다',d:'능력으로 마무리한다',e:{skill:8,trust:7,fame:3,money:-3},note:'캠프가 100일 계획표를 밤새 정리했다.'},
  {t:'강한 구호로 지지층을 결집한다',d:'인지도와 동원력에 승부',e:{fame:12,network:9,trust:-8},note:'광장에는 함성이 가득했다. 표심까지 이어질지는 모른다.'},
  {t:'길거리에서 시민들과 직접 대화한다',d:'화제성은 적지만 일관성을 보여준다',e:{trust:9,network:5,fame:4},note:'긴 연설보다 짧은 대화가 기억에 남았다.'}
 ]},
 {age:49,ch:'개표 방송 · 운명의 날',category:'투표 결과',when:s=>s.nomination===true,title:'잠시 후, 개표 결과를 발표합니다',body:'투표함이 열렸다. 여기까지의 선택은 모두 기록됐다. 누가 당선되는지는 마지막 개표에서 확인한다.',options:s=>[
  {t:'개표 결과를 확인한다',d:'돌이킬 수 없는 최종 판정',e:{},note:'전국의 개표가 끝났다.',end:()=>resolveElection(s)}
 ]}
];
function fresh(name) {
 const fam=sample(FAMILIES), region=sample(REGIONS), rand=n=>Math.floor((Math.random()-.5)*n);
 const s={v:VERSION,name:name||sample(['김하늘','이도윤','박서연','최지우','정민준','한지민','윤서준','강지후']),age:12,year:2026,region,family:fam,school:'미정',career:'학생',party:'무소속',office:'없음',pledge:'미정',skill:clamp(fam.skill+rand(14)),network:clamp(fam.network+rand(14)),money:clamp(fam.money+rand(14)),fame:clamp(6+rand(7)),trust:clamp(fam.trust+rand(14)),risk:0,flags:{},idx:0,phase:'pick',log:[],moments:[],ending:null,nomination:null,seed:Math.floor(Math.random()*900000)+100000};
 return s;
}
let s=null, activeChoices=[];
function clean(){try{localStorage.removeItem(KEY)}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function load(){try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&o.v===VERSION&&Number.isInteger(o.idx)&&o.idx>=0&&o.idx<STAGES.length&&['pick','result','end'].includes(o.phase)&&o.flags&&Array.isArray(o.log)&&Array.isArray(o.moments)&&typeof o.name==='string'&&o.name.length>0)return o;}catch(e){}return null}
const status=()=>s.nomination?'대선 후보':s.flags.presidentialTrack?'대권 준비':s.flags.politics?'정계 진입':s.career==='학생'?'학창 시절':'사회생활';
function allLabels(ch){const arr=[]; for(const [k,n] of Object.entries(ch)){if(LABELS[k] && n) arr.push([LABELS[k],n])}return arr}
function drawStats(){
 $('profileName').textContent=s.name;$('profileBirth').textContent=s.region+' 출생 · '+s.family.name;
 $('portrait').textContent=s.name.charAt(0);$('school').textContent=s.school;$('career').textContent=s.career;$('party').textContent=s.party;
 $('stats').replaceChildren();
 for(const [k,label] of Object.entries(LABELS)){
  const v=clamp(s[k]),root=document.createElement('div');root.className='stat';
  const head=document.createElement('div');const title=document.createElement('span');title.textContent=label;const value=document.createElement('b');value.textContent=v;head.append(title,value);
  const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.style.width=v+'%';track.append(fill);root.append(head,track);$('stats').append(root);
 }
 $('riskNum').textContent=s.risk;$('riskMeter').style.width=s.risk+'%';
 $('recentLog').replaceChildren();s.log.slice(-3).reverse().forEach(entry=>{const li=document.createElement('li');const b=document.createElement('strong');b.textContent=entry.age+'세';li.append(b,document.createTextNode(entry.title));$('recentLog').append(li)});
}
function renderJourney(){
 const steps=['학창','기반','사회','정치','경선','대선'];
 const n=s.idx<=2?0:s.idx<=5?1:s.idx<=8?2:s.idx<=11?3:s.idx<=14?4:5;
 $('journeyStatus').textContent=n===0?'정치까지는 아직 먼 길':n===1?'사회 진출을 위한 준비':n===2?'인생 기반을 쌓는 중':n===3?'정치라는 문 앞':n===4?'공천과 대권을 향해':'개표까지 한 걸음';
 const root=$('journeySteps');root.replaceChildren();const labels=document.createElement('div');labels.className='journey-labels';labels.style.display='contents';
 for(let i=0;i<steps.length;i++){const item=document.createElement('div');item.className='journey-step'+(i<n?' done':i===n?' current':'');item.title=steps[i];root.append(item)}
 const sub=document.createElement('div');sub.className='journey-labels';
 for(let i=0;i<steps.length;i++){const item=document.createElement('span');item.textContent=steps[i];if(i===n)item.className='current';sub.append(item)}
 root.append(sub);
}
function render(){
 $('intro').hidden=!!s;$('play').hidden=!s||!!s.ending;$('end').hidden=!s||!s.ending;$('restartTop').hidden=!s;
 if(!s)return;
 if(s.ending){renderEnd();return}
 const scene=STAGES[s.idx];
 if(!scene){finish('ordinary');return}
 s.age=scene.age;s.year=2026+s.age-12;renderJourney();
 $('chapter').textContent=scene.ch;$('sceneHeading').textContent=status();
 $('age').textContent=s.age+'세';$('year').textContent=s.year+'년';
 $('category').textContent=scene.category+' · '+(Math.floor(s.idx/(STAGES.length-1)*100))+'% 진행';
 $('stepNum').textContent=String(s.idx+1).padStart(2,'0')+' / '+STAGES.length;
 $('tickerText').textContent=s.phase==='result'?'방금 내린 선택은 과거로 남습니다':sampleTicker(scene);
 $('storyIndex').textContent=['I','II','III','IV','V','VI','VII','VIII'][Math.min(7,Math.floor(s.idx/3))];
 $('sceneKicker').textContent=scene.category;$('sceneTitle').textContent=scene.title;
 $('sceneBody').textContent=typeof scene.body==='function'?scene.body(s):scene.body;
 activeChoices=scene.options(s).filter(c=>!c.when||c.when(s));
 const ballot=scene.category==='정당과 노선';
 $('ballotHeader').hidden=!ballot;
 $('choices').replaceChildren();$('choices').classList.toggle('resolved',s.phase==='result');$('choices').classList.toggle('ballot-list',ballot);
 activeChoices.forEach((c,i)=>{const btn=document.createElement('button');btn.type='button';btn.className='choice'+(c.partyCode?' party-choice p-'+c.partyCode:'')+(s.phase==='result'&&s.lastChoice===i?' chosen':'');
 btn.disabled=s.phase==='result';btn.setAttribute('aria-label',(i+1)+'번 '+c.t);
 const digit=document.createElement('span');digit.className=c.partyCode?'party-number':'digit';
 if(c.partyCode){const n=document.createElement('strong');n.textContent=i+1;digit.append(document.createTextNode('기호'),n)}else digit.textContent=i+1;
 const copy=document.createElement('span');copy.className='copy';const b=document.createElement('b');b.textContent=c.t;const small=document.createElement('small');small.textContent=c.d;
 if(c.partyCode){const slogan=document.createElement('span');slogan.className='slogan';slogan.textContent='"'+c.slogan+'"';copy.append(b,slogan,small)}else copy.append(b,small);
 const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';
 if(c.partyCode){const logo=document.createElement('span');logo.className='party-logo';logo.textContent=c.symbol;logo.setAttribute('aria-hidden','true');btn.append(digit,logo,copy,arrow)}
 else btn.append(digit,copy,arrow);
 btn.addEventListener('click',()=>choose(i));$('choices').append(btn)});
 $('result').hidden=s.phase!=='result';$('nextBtn').hidden=s.phase!=='result';
 if(s.phase==='result'){$('resultText').textContent=s.lastText||'';$('nextBtn').firstChild.textContent=s.pendingEnd?'결말 확인하기 ':'다음 장으로 ';
  $('deltas').replaceChildren();for(const [label,n] of s.lastDeltas||[]){const tag=document.createElement('span');tag.className='delta'+(n<0?' neg':'');tag.textContent=label+' '+(n>0?'+':'')+n;$('deltas').append(tag)}
 }
 drawStats();
}
function sampleTicker(scene){return scene.age<20?'학교에서 시작되는 인생, 정답은 아직 없다':scene.age<40?'진짜 세상에서 선택의 무게를 배우다':scene.age<48?'정치의 문턱에 선 한 사람':'전국의 이목이 당신에게 쏠리다'}
function apply(e){for(const [k,v] of Object.entries(e||{})) if(k in LABELS)s[k]=clamp(s[k]+v)}
function choose(i){
 if(!s||s.phase!=='pick')return;
 const c=activeChoices[i];if(!c)return;
 const before=Object.fromEntries(Object.keys(LABELS).map(k=>[k,s[k]]));
 let text=c.note||'',extra={};
 apply(c.e);if(c.risk)s.risk=clamp(s.risk+c.risk);
 if(c.set)for(const [k,v] of Object.entries(c.set))s[k]=v;
 if(c.flag)s.flags[c.flag]=true;
 if(c.chance!==undefined){const chance=typeof c.chance==='function'?c.chance(s):c.chance;const passed=R(Math.max(.02,Math.min(.98,chance)));if(passed){extra=c.pass||{};text+=' '+(c.passText||'예상보다 좋은 결과가 따라왔다.')}else{extra=c.fail||{};text+=' '+(c.failText||'생각만큼 풀리지 않았다.')}s.flags['stage_'+s.idx+'_passed']=passed;}
 for(const [k,v] of Object.entries(extra)){if(k in LABELS)s[k]=clamp(s[k]+v);else s[k]=v}
 const effects=Object.keys(LABELS).reduce((a,k)=>(a[k]=s[k]-before[k],a),{});
 const deltas=allLabels(effects);
 const magnitude=deltas.reduce((a,[,n])=>a+Math.abs(n),0);
 s.moments.push({title:c.t,age:s.age,impact:magnitude,positive:deltas.filter(a=>a[1]>0).reduce((a,b)=>a+b[1],0),negative:deltas.filter(a=>a[1]<0).reduce((a,b)=>a-b[1],0)});
 s.log.push({age:s.age,title:c.t,text});
 s.lastChoice=i;s.lastText=text;s.lastDeltas=deltas;s.phase='result';s.pendingEnd=null;
 if(c.end)s.pendingEnd=typeof c.end==='function'?c.end(s):c.end;
 if((s.risk>=85 && s.flags.shady) ||
    (s.flags.shady && s.flags.exaggerated && s.idx===13 && s.risk>=50 && R(.19))){
  s.pendingEnd='prison';
  s.lastText+=' 누적된 문제가 공식 조사와 재판으로 이어졌다. 긴 절차 끝에 더는 정치 활동을 계속할 수 없게 되었다.';
 }
 if(s.money<=2 && s.age>20 && R(.38)&&!s.pendingEnd){
  s.pendingEnd='unemployed';s.lastText+=' 생활비를 더는 감당하기 어려워졌다. 새로운 진로를 찾기 위해 정치 활동을 멈췄다.';
 }
 save();render();window.scrollTo({top:0,behavior:'smooth'});
}
function resolveElection(state){
 const quality=state.skill*.24+state.network*.19+state.trust*.29+state.fame*.22+state.money*.06;
 const party=PARTIES[state.partyKey];const pledgeFit=party?.fit.includes(state.pledge)?4:party?-2:0;
 const bonus=(state.office==='국회의원'?5:0)+(state.flags.localWork?3:0)+(state.flags.policyRealist?3:0)+(state.flags.clean?3:0)-(state.flags.populist?3:0)-(state.flags.independent?11:0)+pledgeFit;
 const score=quality+bonus-state.risk*.39;
 const swing=(Math.random()-.5)*24;
 const vote=Math.max(12,Math.min(67,Math.round(score*.57+15+swing*.55)));
 state.vote=vote;state.winChance=clamp(15+(score-40)*1.22);
 return vote>=47?'president':'defeated';
}
function next(){
 if(!s||s.phase!=='result')return;
 if(s.pendingEnd){finish(s.pendingEnd);return}
 let i=s.idx+1;
 while(i<STAGES.length && STAGES[i].when&&!STAGES[i].when(s))i++;
 if(i>=STAGES.length){finish('ordinary');return}
 s.idx=i;s.phase='pick';s.lastChoice=null;s.lastText='';save();render();window.scrollTo({top:0,behavior:'smooth'});
}
function finish(id){s.ending=id in ENDINGS?id:'ordinary';s.phase='end';s.endingAge=s.age;save();render();window.scrollTo({top:0,behavior:'smooth'})}
function outcomeSummary(){const e=ENDINGS[s.ending];if(s.ending==='president')return '수많은 갈림길을 지나 대통령 선거에서 승리했다. 당선은 결말이지만 국정은 아직 시작되지 않았다.';
 if(s.ending==='defeated')return '대통령선거에 도전했지만 이번에는 국민의 선택을 받지 못했다. 개표가 끝난 밤, 당신의 인생은 한 장의 기록이 되었다.';
 if(s.ending==='prison')return '불투명한 거래와 선택이 쌓여 형사 절차와 유죄 판결에 이르렀다. 실제 사건과 무관한 가상 이야기다.';
 return '대통령이 되지는 않았다. 하지만 '+s.name+'의 선택들은 남았다. '+e.quote}
function selectMoments(){
 let positive=s.moments.slice().sort((a,b)=>b.positive-a.positive)[0];
 let negative=s.moments.slice().sort((a,b)=>b.negative-a.negative)[0];
 return [positive?.title||'평범한 하루',negative?.negative>0?negative.title:'큰 실수 없이 살아감'];
}
function renderEnd(){
 const e=ENDINGS[s.ending]||ENDINGS.ordinary;
 $('endingTitle').textContent=e.title;$('endingSummary').textContent=outcomeSummary();
 $('endingIcon').textContent=e.icon;$('endingTag').textContent=e.tag;$('endingHeadline').textContent=e.title;
 $('endingName').textContent=s.name+' · '+s.endingAge+'세';$('endingQuote').textContent=e.quote;$('posterSerial').textContent='NO. '+String(s.seed).padStart(6,'0');
 const root=$('finalStats');root.replaceChildren();
 const [best,worst]=selectMoments();
 const data=[['최종 나이',s.endingAge+'세'],['출신',s.region+' · '+s.family.name],['진학',s.school],['최종 직업',s.career],['정당',s.party],['최종 지위',s.office],['주요 공약',s.pledge],['최고의 선택',best],['후회되는 선택',worst],['논란 위험도',s.risk+'/100']];
 if(Number.isFinite(s.vote))data.push(['최종 득표율(가상)',s.vote+'%']);
 for(const [k,v] of data){const d=document.createElement('div');d.className='final-row';const a=document.createElement('span');a.textContent=k;const b=document.createElement('b');b.textContent=v;d.append(a,b);root.append(d)}
 $('pathSummary').replaceChildren();for(const l of s.log){const p=document.createElement('span');p.className='path-pill';p.textContent=l.age+'세 · '+l.title;$('pathSummary').append(p)}
}
function timeline(){if(!s)return;$('fullLog').replaceChildren();for(const l of s.log){const li=document.createElement('li');const b=document.createElement('b');b.textContent=l.age+'세';li.append(b,document.createTextNode(' '+l.title+' — '+l.text));$('fullLog').append(li)}$('timeline').showModal()}
const wrap=(ctx,t,x,y,maxWidth,lineH,maxLines=5)=>{const words=Array.from(t||'');let line='',lines=[];for(const ch of words){if(ctx.measureText(line+ch).width>maxWidth&&line){lines.push(line);line=ch}else line+=ch;}if(line)lines.push(line);for(let i=0;i<Math.min(lines.length,maxLines);i++)ctx.fillText(lines[i],x,y+i*lineH);return y+Math.min(lines.length,maxLines)*lineH};
function cardBlob(){
 return new Promise((resolve,reject)=>{
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const c=canvas.getContext('2d');if(!c){reject(new Error('캔버스를 사용할 수 없습니다'));return}
 const w=1080,h=1350;const e=ENDINGS[s.ending]||ENDINGS.ordinary;
 c.fillStyle='#172438';c.fillRect(0,0,w,h);
 c.strokeStyle='#46556a';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.arc(850,400,160+i*58,0,Math.PI*2);c.stroke()}
 c.fillStyle='#f4f0e8';c.font='900 54px "Noto Sans KR",sans-serif';c.fillText('국민의 부름',64,104);
 c.font='700 21px sans-serif';c.fillStyle='#a1b5c3';c.fillText('THE PEOPLE CALL  ·  LIFE RECORD',65,147);
 c.fillStyle='#dd5446';c.fillRect(64,225,330,48);c.fillStyle='#ffffff';c.font='800 23px "Noto Sans KR",sans-serif';c.fillText(e.tag,82,259);
 c.font='105px "Noto Sans KR",sans-serif';c.fillText(e.icon,67,434);
 c.font='900 77px "Noto Sans KR",sans-serif';c.fillStyle='#fffaf0';const y=wrap(c,e.title,64,544,950,104,3);
 c.font='700 36px "Noto Sans KR",sans-serif';c.fillStyle='#d5dfec';c.fillText(s.name+'  ·  '+s.endingAge+'세',65,Math.max(750,y+45));
 c.fillStyle='#c9d6df';c.font='500 29px "Noto Sans KR",sans-serif';
 const [best,worst]=selectMoments();
 const cardRows=[['학교',s.school],['직업',s.career],['정당',s.party],['주요 공약',s.pledge],['결정적 선택',best],['돌이켜 본 선택',worst],['득표·직책',Number.isFinite(s.vote)?s.vote+'% (가상 득표율)':s.office]];
 let lineY=773;
 c.font='600 24px "Noto Sans KR",sans-serif';
 for(const [k,v] of cardRows){c.fillStyle='#98acbe';c.fillText(k,67,lineY);c.fillStyle='#ffffff';c.fillText(String(v).slice(0,20),282,lineY);lineY+=51}

 c.strokeStyle='#75859a';c.beginPath();c.moveTo(64,1160);c.lineTo(1016,1160);c.stroke();
 c.fillStyle='#ffffff';c.font='600 27px "Noto Sans KR",sans-serif';wrap(c,e.quote,67,1210,900,39,2);
 c.fillStyle='#c5c9cd';c.font='700 20px sans-serif';c.fillText('YOUR CHOICES, YOUR STORY',67,1310);c.textAlign='right';c.fillText('#'+s.seed,1010,1310);
 canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('이미지 생성에 실패했습니다')),'image/png');
 });
}
async function download(){
 try{const blob=await cardBlob();const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='국민의부름_'+s.name+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)}
 catch(e){alert('이미지 저장에 실패했어. 다시 시도해 줘.')}
}
async function share(){
 const text='국민의 부름 | '+s.name+' · '+ENDINGS[s.ending].title+'\n'+s.endingAge+'세 / '+s.party+' / '+s.career+'\n'+location.href;
 try{const blob=await cardBlob();const file=new File([blob],'국민의부름.png',{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'국민의 부름',text});return}if(navigator.share){await navigator.share({title:'국민의 부름',text});return}if(navigator.clipboard){await navigator.clipboard.writeText(text);alert('결과를 복사했어. 친구에게 붙여넣어 봐.');return}alert(text)}
 catch(e){if(e.name!=='AbortError')alert('공유할 수 없어. 이미지 저장을 사용해 줘.')}
}
function start(){const name=$('playerName').value.trim();s=fresh(name);save();render();window.scrollTo({top:0,behavior:'smooth'})}
function restart(){if(!confirm('현재 인생 기록을 지우고 새로운 인생을 시작할까?'))return;clean();s=null;$('playerName').value='';render();window.scrollTo({top:0,behavior:'smooth'})}
$('startBtn').addEventListener('click',start);$('playerName').addEventListener('keydown',e=>{if(e.key==='Enter')start()});
$('nextBtn').addEventListener('click',next);$('restartTop').addEventListener('click',restart);$('retryBtn').addEventListener('click',restart);
$('downloadBtn').addEventListener('click',download);$('shareBtn').addEventListener('click',share);
$('timelineBtn').addEventListener('click',timeline);$('closeTimeline').addEventListener('click',()=>$('timeline').close());
$('timeline').addEventListener('click',e=>{if(e.target===$('timeline'))$('timeline').close()});
document.addEventListener('keydown',e=>{if(!s||s.ending||$('timeline').open||e.target.matches('input,textarea,button'))return;if(s.phase==='pick'&&/^[1-5]$/.test(e.key))choose(+e.key-1);else if(s.phase==='result'&&e.key==='Enter')next()});
s=load();if(s&&s.idx>=STAGES.length&&!s.ending)s=null;render();
})();