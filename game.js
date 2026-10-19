(()=>{
'use strict';
const $=id=>document.getElementById(id),SAVE='callofgukmin-v3',V=3;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(v)));
const KEY_STATS={skill:'역량',network:'인맥',money:'자금',fame:'인지도',trust:'신뢰',risk:'논란'};
const ages=[5,11,15,18,21,25,29,35,41,46,50,54,57,59,60];
const PHASES=[
 {from:0,name:'어린 시절',desc:'남들보다 먼저 꿈을 정할 필요는 없다',short:'유년',kind:'kid'},
 {from:3,name:'학교와 진로',desc:'졸업장이 인생을 대신 살아주진 않는다',short:'학업',kind:'student'},
 {from:5,name:'사회에서 살아남기',desc:'월급과 사람, 명함과 책임 사이',short:'사회',kind:'work'},
 {from:8,name:'정치의 문 앞에서',desc:'이제 이름보다 소속이 더 크게 보인다',short:'정치',kind:'politics'},
 {from:11,name:'국민이 부르는 날',desc:'대권은 먼 길, 선택에는 기록이 남는다',short:'대권',kind:'campaign'}
];
const HOMES=['서울','부산','광주','대전','대구','인천','경기','강원','충남','충북','전북','전남','경북','경남','제주'];
const FAMILY=[
 {name:'자영업 가정',desc:'가게를 닫는 밤이면 부모님이 장부를 함께 정리했다.',stats:{money:24,skill:26,network:24,fame:2,trust:27,risk:0}},
 {name:'맞벌이 직장인 가정',desc:'누구나 바빠서 가족 일정표가 벽에 붙어 있었다.',stats:{money:36,skill:30,network:20,fame:2,trust:24,risk:0}},
 {name:'공직자 가정',desc:'공공기관의 규정과 지역 민원 이야기가 익숙했다.',stats:{money:33,skill:29,network:28,fame:3,trust:23,risk:0}},
 {name:'형편이 어려운 가정',desc:'등록금과 생활비가 늘 고민이었다.',stats:{money:11,skill:28,network:17,fame:2,trust:31,risk:0}},
 {name:'경제적 여유가 있는 가정',desc:'선택지는 많았지만 결과에 대한 기대도 컸다.',stats:{money:57,skill:24,network:37,fame:3,trust:20,risk:0}},
 {name:'여러 지역을 옮겨 다닌 가정',desc:'전학할 때마다 새로운 친구들을 사귀었다.',stats:{money:29,skill:28,network:31,fame:2,trust:26,risk:0}}
];
const NAMES=['이루은','유승현','최승우','강민수','김병수','김병인','윤소율','박도윤','한서진','오지민','정채원','이도겸'];
const PARTIES=[
 {id:'freedom',number:1,name:'자유국민당',logo:'▥',color:'#315d91',motto:'기회는 크게, 원칙은 굳게',desc:'산업·성장·사회 안정',econ:54,change:49,mods:{network:12,money:7,trust:-2}},
 {id:'democracy',number:2,name:'민주혁신당',logo:'≋',color:'#ca555d',motto:'일상을 바꾸는 민생의 힘',desc:'복지·개혁·사회적 연대',econ:-44,change:-41,mods:{trust:10,network:10,money:-3}},
 {id:'direct',number:3,name:'민생직진당',logo:'↯',color:'#c18d2c',motto:'미루지 말고 지금 바꾸자',desc:'빠른 분배·과감한 개혁',econ:-83,change:-78,mods:{fame:17,trust:2,money:-9}},
 {id:'guard',number:4,name:'철벽수호당',logo:'▣',color:'#7660a3',motto:'흔들리지 않는 안전한 나라',desc:'질서·안보·전통',econ:67,change:85,mods:{network:12,trust:3,fame:-4}},
 {id:'future',number:5,name:'실용미래당',logo:'⟲',color:'#218b83',motto:'싸우지 말고 해결합시다',desc:'절충·협상·실무 중심',econ:6,change:1,mods:{skill:9,trust:6,network:6,fame:-4}}
];
const REGIONS=['북부권','수도권','동부권','서부권','남부권','도서권'];
const ENDINGS={
 president:{title:'대통령 당선',caption:'국민의 부름에 응답하다',emoji:'🏛️',desc:'가상의 개표 방송이 당신의 당선을 선언했다. 국정 운영은 다음 이야기다.'},
 defeat:{title:'대통령 선거 낙선',caption:'모두가 널 부르진 않았다',emoji:'🗳️',desc:'대통령 선거의 개표가 끝났다. 이름은 남았지만 대통령은 되지 못했다.'},
 primary:{title:'대선 경선 탈락',caption:'당원들은 다른 사람을 불렀다',emoji:'🎟️',desc:'후보 경선에서 밀렸다. 그날 밤 카메라는 다른 후보를 따라갔다.'},
 expelled:{title:'제명된 정치인',caption:'정당에서 부름을 취소했다',emoji:'📭',desc:'잇따른 정책 충돌과 당내 신뢰 붕괴로 정당에서 제명됐다.'},
 prison:{title:'유죄 판결로 정치 인생 종료',caption:'지울 수 없는 계약서',emoji:'⚖️',desc:'비공개 계약과 책임 회피가 누적돼 법적 책임을 지게 됐다.'},
 business:{title:'성공한 자영업·사업인',caption:'공천보다 매출',emoji:'🧾',desc:'국회가 아니어도 일을 일으키는 방법을 찾아냈다.'},
 media:{title:'정치 방송의 유명인',caption:'의석은 없어도 마이크는 있다',emoji:'📺',desc:'투표 대신 시청자의 관심을 받는 인생이 됐다.'},
 local:{title:'지역에 남은 정치인',caption:'동네에서는 네 이름을 안다',emoji:'🏘️',desc:'대권과 거리를 둔 대신 지역사회의 일을 오래 했다.'},
 career:{title:'분야 전문가',caption:'조용하게 쌓아 올린 인생',emoji:'📘',desc:'정치보다 자기 일에 집중하며 긴 커리어를 만들었다.'},
 struggling:{title:'취업과 재도전의 인생',caption:'다음 달 카드값이 더 무섭다',emoji:'🪑',desc:'꿈이 멀어지기도 했다. 그래도 살아온 과정은 기록으로 남았다.'},
 ordinary:{title:'평범하지만 나의 인생',caption:'국민의 부름? 전화 못 받음',emoji:'🌱',desc:'대통령이 되지 않았다고 삶까지 실패한 것은 아니다.'}
};
const opts=(emoji,title,detail,delta,extra={})=>({emoji,title,detail,delta,...extra});
const event=(id,title,body,choices,extra={})=>({id,title,body,choices,...extra});
const POOLS={
 kid:[
 event('class','반장 선거 출마 소동','선생님이 누군가 반장을 맡아 달라고 한다. 급식 줄을 지킬 것인가, 인기를 끌 것인가?',[
 opts('🗣️','친구들 말을 먼저 들어본다','사람과 약속을 배운다',{trust:8,network:6}, {later:'mentor'}),
 opts('📱','짧은 선거 영상을 만든다','인지도는 오르지만 말은 남는다',{fame:10,trust:-2,risk:3},{later:'clip'}),
 opts('📐','학교 문제를 표로 정리한다','말보다 자료',{skill:9,trust:4})
 ]),
 event('lunch','급식 메뉴가 갑자기 바뀌었다','학생들 사이에 불만이 쏟아진다. 뭘 할까?',[
 opts('🍽️','급식실에 정중하게 건의','생활 문제를 해결한다',{trust:8,skill:3}),
 opts('🎤','전교생 설문을 만든다','사람을 모으는 실험',{network:9,fame:4}),
 opts('✊','급식 규칙을 완전히 바꾸자고 한다','유치원 혁명 선언',{fame:8,trust:2},{stance:{change:-43,econ:-15}})
 ]),
 event('club','동아리 모집 공고','하고 싶은 건 많은데 시간은 부족하다.',[
 opts('🧪','탐구 실험에 몰두한다','전문성을 키운다',{skill:10,money:-2}),
 opts('🧑‍🤝‍🧑','친구들과 모임을 만든다','관계를 쌓는다',{network:9,trust:4}),
 opts('🗞️','학급 소식지를 제작한다','글과 소통에 익숙해진다',{fame:8,skill:5},{later:'press'})
 ]),
 event('rumour','단체채팅방에 내 얘기가 떴다','누군가 발언을 짧게 잘라서 공유했다.',[
 opts('🧾','원문을 보여주고 해명한다','정확성을 지킨다',{trust:9,risk:-5}),
 opts('🔥','SNS에서 맞붙는다','화제성은 높지만 갈등도 남는다',{fame:11,trust:-5,risk:8},{later:'clip'}),
 opts('🤝','당사자와 직접 대화한다','신뢰를 지킨다',{network:7,trust:7})
 ]),
 event('competition','지역 학생 대회 참가 모집','좋아하는 분야에 도전할 기회다. 모두가 상을 받는 건 아니다.',[
 opts('🥇','정식 대회에 도전한다','성적엔 운도 따른다',{skill:5,money:-3},{roll:{chance:.52,good:'예상을 뛰어넘어 입상했다.',goodDelta:{fame:9,network:5},bad:'본선에서 탈락했다. 발표 경험은 남았다.',badDelta:{skill:3}}}),
 opts('🤝','동료를 도와 출전시킨다','함께 일하는 법을 배운다',{trust:9,network:5},{later:'mentor'}),
 opts('📖','그 시간에 공부를 계속한다','기본기에 집중한다',{skill:9})
 ]),
 event('transfer','새 전학생이 교실에 들어왔다','혼자 있는 모습이 어쩐지 낯설지 않다.',[
 opts('👋','학교를 안내한다','인간관계가 늘어난다',{trust:7,network:7},{later:'mentor'}),
 opts('🎓','함께 시험공부를 한다','친구도 실력도 쌓는다',{skill:8,network:4}),
 opts('🎥','학급 브이로그를 찍는다','동의부터 확인한다',{fame:7,trust:3})
 ])
 ],
 study:[
 event('exam','시험 점수가 기대보다 낮았다','진학 상담실 앞의 표정이 모두 무겁다.',[
 opts('📚','약한 과목을 집중적으로 보완한다','기본기',{skill:10,money:-3}),
 opts('👥','스터디를 조직한다','효율과 인맥',{skill:6,network:7,trust:3}),
 opts('🎮','잠깐 쉬고 재정비한다','장기전에는 휴식도 필요하다',{trust:6,risk:-4,skill:2})
 ]),
 event('festival','축제 예산이 바닥났다','진행까지 이틀. 행사 책임자가 널 바라본다.',[
 opts('📑','예산을 다시 편성한다','숫자와 실무',{skill:8,trust:7}),
 opts('📣','지역 상점 후원을 요청한다','협의와 관계',{network:10,money:4},{later:'ally'}),
 opts('🎭','장비 없이 소규모 행사로 변경','창의적 대안',{skill:6,fame:5,trust:4})
 ]),
 event('housing','기숙사·자취방 문제가 터졌다','계약 조건이 마음에 걸린다.',[
 opts('🔎','서류와 계약 규정을 확인한다','실생활 경험',{skill:7,money:-4,trust:5}),
 opts('🧑‍🤝‍🧑','친구들과 함께 방을 알아본다','생활비 절약',{network:7,money:6}),
 opts('💳','편한 곳을 빚을 내서 구한다','시간을 아낀다',{money:9,risk:6},{later:'debt'})
 ]),
 event('campus','학생 대표 회의에 초대됐다','장학금 배분을 두고 의견이 충돌한다.',[
 opts('⚖️','공개 토론에서 절충안을 낸다','협상과 조정',{trust:9,network:7},{stance:{eco:-8,change:-4},later:'ally'}),
 opts('📢','큰 변화를 요구하는 집회를 연다','빠른 개혁을 원한다',{fame:10,network:3,trust:-3},{stance:{eco:-15,change:-23},later:'clip'}),
 opts('📊','자료를 근거로 분배를 재설계한다','근거를 찾는다',{skill:9,trust:6},{stance:{eco:-12,change:-3}})
 ]),
 event('intern','인턴 면접 날','면접관이 뜻밖의 질문을 한다.',[
 opts('🧠','준비한 실무 프로젝트를 설명','역량 중심',{skill:9,network:3}),
 opts('🗣️','팀워크 경험을 솔직히 전한다','소통 중심',{trust:8,network:6}),
 opts('📱','면접 경험을 영상으로 공유','공감을 노린다',{fame:11,risk:2})
 ])
 ],
 work:[
 event('report','팀장이 수치를 부풀려 보고하래','평가에는 유리하겠지만 찜찜한 구석이 있다.',[
 opts('📈','원자료로 실적을 다시 계산한다','신뢰를 지킨다',{skill:7,trust:9,network:-3},{later:'clean'}),
 opts('🗣️','팀장과 현실적인 목표로 조정','조직의 합의',{network:7,skill:5,trust:3}),
 opts('💰','수치를 과장해 제출한다','일단 이익이 먼저',{money:15,network:5,trust:-13,risk:21},{flag:'shady',later:'audit'})
 ]),
 event('rent','월세가 갑자기 올랐다','직장은 가까운데 돈이 부족하다.',[
 opts('🧾','계약서를 다시 검토한다','계약과 제도를 배운다',{skill:7,trust:3,money:-3}),
 opts('🏠','룸메이트를 구한다','생활비 절감',{network:8,money:7}),
 opts('💳','대출로 급한 문제를 막는다','당장은 편하다',{money:12,risk:5},{later:'debt'})
 ]),
 event('layoff','부서에 구조조정 소문이 돈다','동료가 퇴사했고 팀장은 말을 아낀다.',[
 opts('📖','새 기술을 배워 이직에 대비','현실적 투자',{skill:11,money:-6}),
 opts('🤝','동료들과 조정안을 만든다','함께 해결한다',{network:10,trust:6}),
 opts('🎙️','관련 문제를 방송에서 알린다','세상과 공유',{fame:14,trust:1,risk:4},{later:'press'})
 ]),
 event('road','지역 버스 노선이 폐지된다','어르신들과 출근길 시민들이 불편을 호소한다.',[
 opts('🚌','수요 자료를 모아 대안을 낸다','해결형',{skill:7,trust:10,network:5},{later:'community'}),
 opts('🎥','현장 문제를 영상에 담는다','빠른 확산',{fame:13,network:4},{later:'clip'}),
 opts('💼','생업에 집중한다','모든 일을 맡을 순 없다',{money:10,skill:4})
 ]),
 event('venture','동창이 사업을 같이 하자고 한다','작은 아이디어인지 큰 도박인지 모르겠다.',[
 opts('🔬','작게 시험해 본다','불확실성을 관리',{skill:8,network:4,money:-4},{later:'startup'}),
 opts('💸','통 크게 투자한다','위험과 보상이 크다',{money:-14,risk:8},{roll:{chance:.35,good:'제품이 기대보다 크게 팔렸다!',goodDelta:{money:31,fame:5},bad:'제품이 팔리지 않아 빚만 남았다.',badDelta:{money:-12,network:-3}}}),
 opts('📚','업계 자격증부터 준비한다','나부터 성장한다',{skill:10,trust:3})
 ]),
 event('funding','공공 프로젝트 계약 제안','서류엔 이해충돌 가능성이 적혀 있다.',[
 opts('✅','이해충돌부터 확인하고 공개한다','투명한 계약',{trust:10,skill:5,money:-2},{later:'clean'}),
 opts('🤝','관련 기관과 조건을 조율한다','절차를 맞춘다',{network:8,trust:4,money:5}),
 opts('🕶️','친분으로 수의계약을 받는다','당장의 돈이 크다',{money:23,network:8,risk:26,trust:-15},{flag:'shady',later:'audit'})
 ])
 ],
 politics:[
 event('committee','시의회에서 지원금을 놓고 싸운다','사업 예산은 하나인데 주장하는 사람은 셋이다.',[
 opts('⚖️','여러 이해관계자의 절충안을 만든다','합의가 시간이 걸린다',{skill:7,network:7,trust:8},{stance:{econ:-3,change:0}}),
 opts('🏦','민간에 맡기고 규제를 줄이자고 주장','시장 중심의 선택',{network:9,money:4,trust:1},{stance:{econ:24,change:8}}),
 opts('✊','공공 지원을 크게 확대하자고 주장','분배와 변화를 우선',{trust:5,fame:8,money:-6},{stance:{econ:-26,change:-15}})
 ]),
 event('speech','지역 강연의 마이크를 잡았다','주제는 같은데 청중의 생각은 다르다.',[
 opts('🌱','새 제도를 빠르게 도입하자고 제안','변화 중시',{fame:8,trust:5},{stance:{change:-29,econ:-5},later:'press'}),
 opts('🛡️','안정성과 점진적 개선을 주장','안정 중시',{network:8,trust:5},{stance:{change:27,econ:5}}),
 opts('🔧','시범사업부터 검증하자고 제안','실용 중심',{skill:8,trust:7},{stance:{change:0,econ:2}})
 ]),
 event('debate','정치 토론 생방송에 출연한다','인터넷 클립이 수백 개씩 만들어진다.',[
 opts('📊','재원과 효과를 설명한다','디테일로 승부',{skill:9,trust:8,fame:3}),
 opts('🔥','강한 구호로 분위기를 띄운다','크게 주목받는다',{fame:14,trust:-5,risk:7},{stance:{change:-17}}),
 opts('🤝','반대 의견의 타당한 점을 인정한다','협상하려는 자세',{trust:11,network:4},{stance:{change:5}})
 ]),
 event('coalition','당내 회의에서 노선 충돌','당의 핵심 정책을 놓고 의견이 갈린다.',[
 opts('🏪','시장과 기업의 자율성을 확대하자','성장 중심 노선',{network:7,fame:5},{stance:{econ:31,change:14}}),
 opts('🧺','공공 복지를 과감히 늘리자','분배 우선 노선',{fame:7,trust:3,money:-6},{stance:{econ:-34,change:-11}}),
 opts('🗂️','재원 검토 뒤 중간안을 내자','절충과 실무',{skill:8,trust:6},{stance:{econ:1,change:2}})
 ]),
 event('contract','누군가 옛 계약 문서를 들이민다','과거 사업 내용이 언론에 공개될 수 있다고 한다.',[
 opts('⚖️','관련 문서를 공개하고 조사에 협조한다','책임 있는 대응',{trust:8,risk:-13,money:-4},{later:'clean'}),
 opts('📰','사실을 확인한 뒤 공식 입장을 발표한다','신중한 대응',{skill:6,trust:4,risk:-6}),
 opts('🚫','측근에게 책임을 미루고 숨긴다','위험한 회피',{network:-8,trust:-16,risk:20},{flag:'coverup',later:'audit'})
 ],{when:s=>s.flags.shady||s.stats.risk>=18}),
 event('support','지지자들이 거리 캠페인을 제안한다','단지 유명해지는 것 말고 무얼 할 것인가?',[
 opts('🏘️','생활 민원 해결 캠페인','지역과 연결',{network:9,trust:8},{later:'community'}),
 opts('📣','대규모 온라인 집회','전국 인지도 확보',{fame:14,money:-5,risk:3},{later:'clip'}),
 opts('💼','전문가 정책 간담회','실력과 공신력',{skill:10,network:6,money:-5})
 ])
 ],
 campaign:[
 event('tv','전국 후보 TV 토론','상대 후보가 공약 비용을 조목조목 묻는다.',[
 opts('📊','재원표를 공개한다','실행 가능성을 보여준다',{skill:7,trust:11,money:-4},{later:'clean'}),
 opts('❤️','현장의 이야기로 대답한다','공감에 집중한다',{trust:10,fame:9}),
 opts('⚡','상대를 공격하는 한마디','짧고 강한 클립',{fame:15,trust:-9,risk:8},{later:'clip'})
 ]),
 event('pledge','새로운 공약에 대한 질문','이미 선택한 노선을 바꿀 것인지 확인받는다.',[
 opts('📈','기업 투자를 우선하겠다고 선언','시장·성장 중심',{network:7,skill:4,fame:5},{stance:{econ:33,change:17}}),
 opts('🧺','복지와 공공지원 확대를 선언','분배·개혁 중심',{trust:7,fame:7,money:-5},{stance:{econ:-36,change:-22}}),
 opts('⚙️','검증 가능한 절충안을 발표','타협·실무 중심',{skill:9,trust:8},{stance:{econ:0,change:0}})
 ]),
 event('storm','유세 첫날 폭우가 내렸다','예정된 광장 유세를 그대로 진행할 수 없다.',[
 opts('☂️','주민을 돕는 작은 봉사 활동','현장 중심',{trust:11,network:6,money:-4}),
 opts('📱','온라인 질의응답으로 전환','영상으로 소통',{fame:11,skill:4}),
 opts('🏢','소규모 간담회로 진행','지지 조직 강화',{network:10,trust:5})
 ]),
 event('mic','꺼진 줄 알았던 마이크','대기실에서 한 말이 편집되어 퍼졌다.',[
 opts('🎙️','전체 녹음을 공개한다','맥락을 확인한다',{trust:10,risk:-8,money:-3}),
 opts('🙇','실수에 대해 분명히 사과한다','책임을 인정한다',{trust:9,risk:-6}),
 opts('🔥','상대 캠프를 맹비난한다','관심이 커진다',{fame:13,trust:-9,risk:14})
 ]),
 event('donor','거액 후원과 미심쩍은 조건','후원자가 당선 후 인사에 영향력을 달라고 요구한다.',[
 opts('🚫','조건을 거절하고 공개한다','투명성을 지킨다',{trust:13,money:-6},{later:'clean'}),
 opts('🧾','법률 검토 후 합법 후원만 허용','절차와 기록',{skill:8,trust:8,money:3}),
 opts('🕴️','비공개 조건을 수락한다','큰 위험을 떠안는다',{money:26,network:7,trust:-16,risk:27},{flag:'shady',later:'audit'})
 ]),
 event('young','학생들이 정책 질문을 보냈다','답변을 기다리는 시민들이 늘었다.',[
 opts('🧑‍🎓','질의응답 시간을 따로 마련','긴 대화',{trust:11,network:6,money:-4}),
 opts('🎥','짧은 답변 영상으로 답한다','간결한 소통',{fame:12,trust:3}),
 opts('🏢','캠프 정책팀을 통해 검토한다','체계적인 대응',{skill:8,network:6,trust:4})
 ])
 ]
};
const MAJORS=[
 {id:'preschool',form:'유년기 활동 계획',title:'어린 시절, 어디에 마음이 끌려?',subtitle:'첫 선택이 평생을 결정하진 않지만 작은 습관은 남는다.',choices:[
 opts('📚','책 읽기와 탐구','무언가를 이해하는 게 재밌다',{skill:10},{set:{early:'호기심이 많은 아이'}}),
 opts('🎭','연극과 발표','사람들 앞에 서는 게 좋다',{fame:7,network:5},{set:{early:'발표를 좋아하던 아이'}}),
 opts('🤝','친구들과 함께 놀기','사람을 만나며 배운다',{network:11,trust:5},{set:{early:'친구 많은 아이'}})
 ]},
 {id:'middle',form:'중등 진로 탐색표',title:'중학생의 관심 분야를 정할 시간',subtitle:'이건 정치 성향이 아니라 지금 제일 좋아하는 것에 가깝다.',choices:[
 opts('🔬','과학과 제작','만들고 고치는 일이 좋다',{skill:12},{set:{interest:'기술'}}),
 opts('📺','미디어와 발표','사람들 앞에서 소통하고 싶다',{fame:10,network:5},{set:{interest:'미디어'}}),
 opts('⚖️','사회문제와 토론','문제의 원인을 찾고 싶다',{trust:8,skill:6},{set:{interest:'사회'}}),
 opts('💼','경제와 사업','가게 운영과 돈의 흐름이 궁금하다',{money:8,skill:7},{set:{interest:'경제'}})
 ]},
 {id:'highschool',form:'고등학교 진학 희망서',title:'어느 고등학교에 지원할까?',subtitle:'학교는 각각 다른 경험을 준다. 학교 유형이 개인의 성공을 보장하는 건 아니다.',choices:[
 opts('🏫','일반고','일반 교육과정과 다양한 동아리',{skill:8,trust:6,network:4},{set:{school:'일반고'}}),
 opts('🔭','특목고','특성화된 교육과 경쟁적인 프로젝트',{skill:13,network:7,money:-6},{set:{school:'특목고'}}),
 opts('⚙️','특성화고','기술·실무 중심 교육과 경험',{skill:10,money:9,network:4},{set:{school:'특성화고'}}),
 opts('📖','자율고','교육과정의 선택 폭과 활동',{skill:10,network:8,money:-7},{set:{school:'자율고'}}),
 opts('🧭','대안교육과 검정고시','스스로 학습 계획을 세우는 길',{skill:8,trust:5,money:4},{set:{school:'검정고시'}})
 ]},
 {id:'college',form:'진학·진로 원서',title:'고등학교를 마쳤다. 다음은?',subtitle:'대학·교육·일·재수. 모두 시간이 드는 현실적인 선택이다.',choices:[
 opts('🏙️','수도권 4년제 대학','학업과 활동을 병행한다',{skill:13,network:12,money:-13},{set:{education:'수도권 4년제'}}),
 opts('🏡','지역 대학','지역 사회와 연결해 배운다',{skill:12,trust:5,network:7,money:-6},{set:{education:'지역 4년제'}}),
 opts('🛠️','전문대·직업교육','직무 중심으로 빠르게 진입',{skill:11,money:7,network:4},{set:{education:'전문대·직업교육'}}),
 opts('🔁','수능 재도전','한 해를 더 투자한다',{skill:10,money:-11},{set:{education:'재수 경험'},flag:'retake',later:'retest'}),
 opts('💼','바로 취업 준비','사회 현장에서 배워 본다',{money:12,skill:5},{set:{education:'고졸 취업 준비'}})
 ]},
 {id:'gradschool',form:'심화 진로 계획서',title:'대학원? 시험? 현장?',subtitle:'공부를 계속하는 것과 사회로 나가는 것 모두 비용이 든다.',choices:[
 opts('🧬','대학원·연구 과정','전문성을 쌓지만 수입은 지연된다',{skill:16,money:-13,network:5},{set:{degree:'대학원 연구 경험'}}),
 opts('⚖️','법률·행정 자격과 실무','제도와 규정을 깊게 배운다',{skill:13,trust:5,money:-8},{set:{degree:'법률·행정 실무 교육'}}),
 opts('🧰','실무 프로젝트와 현장','일하면서 배운다',{skill:10,money:10,network:5},{set:{degree:'현장 실무'}}),
 opts('🎥','언론·콘텐츠 경력','사람과 현장을 관찰한다',{fame:11,network:7},{set:{degree:'미디어 현장'}})
 ]},
 {id:'job',form:'직업 선택서',title:'첫 직업을 확정할 시간',subtitle:'몇 년 뒤 정치인이 된다 해도 이 경력은 기록으로 남는다.',choices:[
 opts('🏛️','행정·공공기관','민원과 제도를 가까이 경험',{skill:11,trust:8,network:5,money:4},{set:{career:'공공행정 종사자'}}),
 opts('🏢','기업·산업 현장','조직과 사업을 경험',{money:16,skill:9,network:6},{set:{career:'기업인'}}),
 opts('🛠️','창업과 자영업','자율성과 사업 위험을 감수',{money:8,network:9,fame:3},{set:{career:'자영업자'}}),
 opts('📺','기자·콘텐츠 창작','언론과 대중을 가까이에서 경험',{fame:15,network:5,skill:5},{set:{career:'기자·콘텐츠 제작자'}}),
 opts('🧑‍🏫','교육·연구·전문직','전문성으로 사회에 기여',{skill:13,trust:8,money:3},{set:{career:'연구·전문직'}}),
 opts('🎒','취업을 더 준비한다','진로를 다시 모색한다',{skill:7,money:-9},{set:{career:'취업 준비 중'}})
 ]},
 {id:'networking',form:'사회활동 계획서',title:'사회에서 무엇을 남길래?',subtitle:'정치에 진입할 인연이 생길 수도 있지만 선택은 네 몫.',choices:[
 opts('🏘️','지역 문제 해결 활동','풀뿌리 신뢰와 네트워크',{trust:14,network:12,fame:5},{set:{activity:'지역 활동'},flag:'grassroots'}),
 opts('📊','정책 연구와 컨설팅','전문성 중심의 경력',{skill:13,network:7,trust:4},{set:{activity:'정책 연구'},flag:'policyExpert'}),
 opts('📺','시사 채널 운영','인지도가 빠르지만 기록이 남는다',{fame:19,network:5,risk:5},{set:{activity:'시사 콘텐츠'},flag:'media'}),
 opts('💸','사업을 확장한다','돈은 늘지만 더 바빠진다',{money:19,network:7,trust:1},{set:{activity:'사업 확장'}})
 ]},
 {id:'midcareer',form:'중년 진로 결단서',title:'내 경력을 어디에 걸까?',subtitle:'정치가 아닌 경로도 끝까지 이어질 수 있다.',choices:[
 opts('📝','시민 정책 제안서 제출','공공의 의제를 키운다',{trust:11,skill:9,network:4},{flag:'policyExpert'}),
 opts('🎤','전국 강연·방송 활동','인지도와 평판이 함께 움직인다',{fame:16,network:5},{flag:'media'}),
 opts('🛠️','본업에 집중해 성과 만들기','직업적 전문성을 높인다',{skill:11,money:11},{flag:'expert'}),
 opts('🏘️','동네 문제 해결에 오래 참여','지역 기반을 넓힌다',{network:11,trust:9},{flag:'grassroots'})
 ]},
 {id:'politics-entry',form:'정치 진출 의향서',title:'정치판에서 연락이 왔다',subtitle:'정당으로 갈까, 지역에 남을까? 대통령은 아직 한참 멀다.',choices:[
 opts('🏛️','정치에 정식 입문','후보가 되기 위한 조직 활동 시작',{network:12,fame:9,money:-7},{set:{politics:true,career:'정치 신인'}}),
 opts('🗳️','지방선거 캠프 실무','선거와 정책을 배우는 길',{network:15,skill:9,money:-5},{set:{politics:true,career:'선거캠프 실무자'}}),
 opts('📋','정책 자문위원','비선출 전문가로 영향력 행사',{skill:13,trust:8},{set:{politics:false,career:'정책 자문가'}}),
 opts('🏢','정치 제안을 거절한다','내 직업을 계속 키운다',{money:12,skill:8},{set:{politics:false},flag:'careerFocus'})
 ]},
 {id:'party',form:'가상 정당 가입 투표지',title:'내 정치색과 소속을 선택하라',subtitle:'기호는 가상의 게임 번호. 정당과 네 성향이 계속 어긋나면 당내 신뢰가 떨어진다.',choices:PARTIES.map(p=>opts(p.logo,p.name,p.desc,p.mods,{party:p.id,partyMotto:p.motto})).concat([opts('◇','무소속','조직 지원은 적지만 소속 제약도 적다',{trust:5,network:-7,fame:3},{party:'none'})])},
 {id:'latecareer',form:'사회 후반기 계획',title:'정치 없이도 남길 이름은 많다',subtitle:'대통령이 될 자격보다 중요한 건 하고 싶은 일이다.',choices:[
 opts('🏪','사업가로 계속 살아간다','경제적 자립과 확장',{money:14,network:7},{set:{career:'사업가'}}),
 opts('🎥','정치 평론 채널을 운영한다','정치인 아닌 언론인으로 남는다',{fame:18,money:7,risk:3},{set:{career:'정치 방송인'}}),
 opts('🏘️','지역 사회 공익 활동','꾸준한 지역 활동',{trust:14,network:10},{set:{career:'지역 활동가'}}),
 opts('📚','연구·강의·집필에 집중','후배에게 경험을 전한다',{skill:12,trust:8},{set:{career:'전문가·강사'}})
 ]},
 {id:'local-election',form:'지역 선거 출마 신청',title:'지역에서 검증받을 차례',subtitle:'정당 조직, 주민 신뢰, 자금으로 당락이 갈린다.',choices:[
 opts('👞','지역구에 직접 출마','현장 유세로 표를 얻는다',{trust:10,network:8,money:-10},{roll:{kind:'local',base:26,skill:'trust',good:'첫 지역 선거에 당선됐다!',bad:'지역 선거에서 낙선했다.'}}),
 opts('📱','온라인 지명도로 출마','인지도가 장점이지만 비용은 크다',{fame:16,money:-13,risk:4},{roll:{kind:'local',base:19,skill:'fame',good:'SNS 돌풍으로 지역 선거에서 승리했다!',bad:'조회수만큼 표가 나오지 않았다.'}}),
 opts('⚖️','후보 지원과 당 정책을 맡는다','실무와 조직력 강화',{skill:9,network:12},{set:{career:'정당 정책 실무자'},flag:'policyExpert'}),
 opts('🏡','정계에서 물러나 지역 활동','출마를 포기한다',{trust:8,money:9},{set:{politics:false,career:'지역활동가'},flag:'retiredPolitics'})
 ]},
 {id:'national-election',form:'국회 출마 신청',title:'국회의원 공천이 다가온다',subtitle:'지역기반이 있다면 유리하지만 무조건은 아니다.',choices:[
 opts('🎙️','국회의원 선거에 출마','인지도·신뢰·조직력이 필요',{fame:9,network:5,money:-12},{roll:{kind:'national',base:19,skill:'network',good:'국회의원 선거에서 승리했다!',bad:'국회의원 선거에서 낙선했다.'}}),
 opts('🗂️','정당 정책위원회 운영','선출직 대신 정책 영향력',{skill:12,network:12},{set:{career:'정당 정책위원'},flag:'policyExpert'}),
 opts('🏡','지역 의정에 집중','더 큰 자리를 추구하지 않는다',{trust:12,network:8},{flag:'regionalChoice'}),
 opts('🚪','정계를 떠난다','정치 활동을 그만둔다',{money:13,trust:4},{set:{politics:false,career:'정계 은퇴자'},flag:'retiredPolitics'})
 ]},
 {id:'primary',form:'대통령 경선 출마 명부',title:'대통령 후보 자리를 얻어라',subtitle:'대통령이 되려면 먼저 후보가 돼야 한다. 무소속도 등록과 조직이 필요하다.',choices:[
 opts('📊','정책으로 경선에 도전','정책과 토론으로 승부',{skill:8,trust:7,money:-11},{roll:{kind:'primary',base:14,skill:'skill',good:'경선을 통과했다. 가상 대선 후보로 확정!',bad:'후보 경선에서 탈락했다.'}}),
 opts('🤝','정당 조직과 연대로 도전','사람을 설득해 후보를 모은다',{network:13,money:-9},{roll:{kind:'primary',base:17,skill:'network',good:'연대에 성공해 대선 후보로 선출됐다!',bad:'단일화와 경선에서 밀렸다.'}}),
 opts('📱','온라인 여론 돌풍으로 승부','전국 인지도를 활용',{fame:15,money:-11,risk:6},{roll:{kind:'primary',base:12,skill:'fame',good:'뜻밖의 경선 돌풍으로 후보 확정!',bad:'온라인 화제성이 경선 투표로 이어지지 못했다.'}}),
 opts('🚪','대선에 도전하지 않는다','전문가·정치인의 길을 계속 간다',{trust:7,money:4},{end:'local'})
 ]},
 {id:'pledge',form:'대선 후보 대표 공약서',title:'국민에게 무엇을 약속할까?',subtitle:'공약은 정당의 기본 방향과 충돌할 수도 있다. 그 결과는 유권자와 당이 판단한다.',choices:[
 opts('🏘️','주거·생활 문제 해결','교통과 주거 안정',{trust:10,skill:6,money:-6},{set:{pledge:'주거·민생'},stance:{econ:-8,change:-4}}),
 opts('🏭','산업 투자와 일자리','산업 성장과 재교육',{network:9,skill:7,money:-6},{set:{pledge:'성장·산업'},stance:{econ:32,change:13}}),
 opts('📚','교육·복지 확대','공공 서비스 개선',{trust:12,money:-9},{set:{pledge:'교육·복지'},stance:{econ:-32,change:-14}}),
 opts('🛡️','안보·행정 안정','안전·질서 중심',{trust:8,network:5},{set:{pledge:'안전·질서'},stance:{econ:13,change:30}}),
 opts('🎁','전 국민 현금 지급','즉시 호응과 비용 논란',{fame:19,money:-10,trust:-9,risk:8},{set:{pledge:'즉시 현금 지원'},stance:{econ:-55,change:-35}})
 ]},
 {id:'lastspeech',form:'대선 마지막 유세 연설문',title:'역사에 남을 마지막 한마디',subtitle:'이 선택을 마치면 개표가 시작된다.',choices:[
 opts('🎙️','정책 실행 계획을 말한다','검증 가능한 약속',{skill:6,trust:8,money:-3},{final:true}),
 opts('❤️','실수와 한계를 인정한다','책임을 드러낸다',{trust:12,risk:-8},{final:true}),
 opts('📣','강렬한 구호로 지지층을 결집한다','마지막 인지도 상승',{fame:15,network:6,trust:-6},{final:true})
 ]},
 {id:'legacy',form:'인생 회고록 표지',title:'이번 인생에서 무엇이 가장 중요했을까?',subtitle:'대권은 아니지만 네 이야기의 최종 장이야.',choices:[
 opts('🌱','나답게 산 것을 기록한다','평범한 삶의 기록',{trust:7},{final:true}),
 opts('👨‍🏫','다음 세대를 위한 멘토 활동','사람과 경험을 남긴다',{trust:11,network:5},{final:true}),
 opts('📖','내 인생의 기록을 출간한다','삶의 흔적을 남긴다',{fame:9,money:4},{final:true})
 ]}
];
let state=null;
const num=(n)=>Number.isFinite(n)?Math.round(n):0;
const chooseRand=arr=>arr[Math.floor(rng()*arr.length)];
function rng(){state.seed=(Math.imul(1664525,state.seed)+1013904223)>>>0;return state.seed/4294967296}
function pickName(){return NAMES[Math.floor(Math.random()*NAMES.length)]}
function currentPhase(){let v=0;for(let i=0;i<PHASES.length;i++)if(state.stage>=PHASES[i].from)v=i;return v}
function party(){return PARTIES.find(p=>p.id===state.party)||null}
function progress(){return (state.stage+1)+' / '+ages.length}
function mutate(delta){const out=[];for(const [k,value]of Object.entries(delta||{})){if(!(k in state.stats))continue;const start=state.stats[k];state.stats[k]=clamp(start+value);if(start!==state.stats[k])out.push({key:k,delta:state.stats[k]-start})}return out}
function shiftStance(stance){
 if(!stance)return'';
 state.econ=clamp(state.econ+(stance.econ||0),-100,100);
 state.change=clamp(state.change+(stance.change||0),-100,100);
 const p=party();if(!p)return'내 생각이 조금씩 뚜렷해졌다.';
 const dist=(Math.abs(p.econ-state.econ)+Math.abs(p.change-state.change))/2;
 const immediate=(Math.abs((stance.econ||0)) + Math.abs((stance.change||0)))*.7;
 if(dist>37&&immediate>=12){
  const penalty=Math.round((dist-32)*.20+immediate*.23);
  state.loyalty=clamp(state.loyalty-penalty);
  mutate({trust:-Math.max(1,Math.floor(penalty/4))});
  if(state.loyalty<=16){state.flags.expelled=true;state.party=null;state.nomination=false;state.news='속보: 소속 정당에서 제명 결정. 공식 후보 지위도 잃었다.';state.pendingEnd='expelled';return' 정당 노선과 반복적으로 충돌해 결국 제명됐다.'}
  if(state.loyalty<=42){state.news='당내 주요 인사들이 공개 해명을 요구했다. 소속당 신뢰가 크게 떨어졌다.';return' 당내 강한 반발이 나왔다.'}
  return' 정당 안에서 다른 목소리가 나오기 시작했다.';
 }
 if(dist<=29){state.loyalty=clamp(state.loyalty+3);return' 당내에서도 일관된 노선이라는 평가를 받았다.'}
 return' 정당의 공식 노선과 거리가 있다는 지적이 있었다.';
}
function routinePool(){const k=currentPhase();return k<=1?POOLS.kid.concat(POOLS.study):k===2?POOLS.work:k===3?POOLS.politics:state.nomination?POOLS.campaign:POOLS.politics}
function pickEvent(){
 const candidates=routinePool().filter(e=>!state.seen.includes(e.id)&&(!e.when||e.when(state)));
 let pool=candidates.length?candidates:routinePool().filter(e=>!e.when||e.when(state));
 if(!pool.length)pool=POOLS.kid;
 const e=chooseRand(pool);state.seen.push(e.id);state.event=e.id;
}
function getEvent(){return Object.values(POOLS).flat().find(e=>e.id===state.event)||POOLS.kid[0]}
function lifeNickname(){
 const a=ages[state.stage],stats=state.stats;
 if(state.flags.expelled)return'정당에서 쫓겨난 정치인';
 if(state.flags.shady&&stats.risk>65)return'계약서에 쫓기는 사람';
 if(a<=5&&state.change<-30)return'혁명을 꿈꾸는 유치원생';
 if(a<=5)return'미래의 씨앗';
 if(a<16&&stats.skill>=50)return'도약을 준비하는 중학생';
 if(a<16&&stats.fame>=30)return'동네 유명인';
 if(a<19)return'진로를 고민하는 고등학생';
 if(state.flags.retake&&a<25)return'입시를 다시 보는 청년';
 if(a<27&&state.degree==='대학원 연구 경험'&&stats.money<20)return'생활비에 쫓기는 대학원생';
 if(a<28)return stats.money<12?'생활비와 싸우는 대학생':stats.skill>65?'전문성을 쌓는 청년':'내일을 고민하는 청년';
 if(!state.politics&&a>=41)return stats.money<10?'내일도 면접인 백수':stats.money>67?'사업을 키우는 어른':stats.fame>60?'방송계의 논객':'자기 길을 찾는 어른';
 if(state.nomination)return'국민의 선택을 기다리는 후보';
 if(state.flags.nationalWin)return'국회의원 출신 대권주자';
 if(state.flags.localWin)return'지역에서 올라온 정치인';
 if(state.party)return stats.fame>65?'전국에서 이름 난 정치인':'도약을 꿈꾸는 당원';
 if(a>=40)return'정치판에 뛰어든 신인';
 return stats.trust>55?'동네의 믿음직한 사람':'나름의 길을 찾는 사회인';
}
function slogan(){
 const a=ages[state.stage],s=state.stats;
 if(state.flags.expelled)return'그때는 정말 몰랐지';
 if(s.risk>=60)return'예전 기록이 다시 뉴스가 됐다';
 if(state.nomination)return chooseSeed(['국민 여러분, 이제 시작입니다','마지막 선택은 당신의 몫','당신의 한 표로 역사가 바뀐다']);
 if(state.party)return chooseSeed([party()?.motto,'국민의 길을 찾겠습니다','오늘도 지지율과 싸우는 중','오늘은 기자회견이 두 번']);
 if(a<12)return chooseSeed(['아직은 세상이 너무 크다','미래의 씨앗이 자라는 중','장래희망은 매일 바뀐다']);
 if(a<20)return chooseSeed(['내 인생의 원서를 쓰는 중','학교보다 중요한 건 아직 모름','다음 학기엔 달라질지도']);
 return chooseSeed(['오늘도 버틴 게 경력이다','경력은 쌓이고 통장은 빠진다','언젠가 누가 날 부르겠지']);
}
function chooseSeed(arr){return arr[(state.stage + Math.floor(state.stats.trust/19)+state.seedInitial)%arr.length]}
function theme(){return party()?.color||'#647881'}
function generateHistory(age,title,description,token){state.history.push({age,title,description,token:token||''})}
function updateNews(s){state.news=s}
function createLife(name){
 const family=FAMILY[Math.floor(Math.random()*FAMILY.length)],home=HOMES[Math.floor(Math.random()*HOMES.length)];
 const clean=String(name||'').trim().slice(0,10);
 state={v:V,seed:(Math.floor(Math.random()*4294967295)||127812)>>>0,seedInitial:Math.floor(Math.random()*64),serial:Math.floor(Math.random()*900000)+100000,name:clean||pickName(),home,family:family.name,familyDesc:family.desc,actor:Math.floor(Math.random()*8),stage:0,actionsLeft:2,phase:'daily',event:null,seen:[],pending:[],choice:null,
 school:'아직 없음',education:'아직 없음',degree:'없음',career:'어린이',activity:'없음',early:'',interest:'',party:null,politics:false,loyalty:80,flags:{},econ:0,change:0,nomination:false,pledge:'없음',localWin:false,nationalWin:false,pendingEnd:null,ending:null,vote:null,regionsBase:REGIONS.map(()=>Math.floor(Math.random()*25)-12),
 stats:{...family.stats},history:[],news:'태어났다는 사실만으로도 지역 소식에 한 줄 올랐다.'};
 generateHistory(0,'출생',home+' · '+family.name+'. '+family.desc,'출생');
 pickEvent();save();render();
}
function dailyOptions(){
 const base=getEvent().choices.slice();
 const r=currentPhase();
 const rituals=[
  opts('📚','공부·기술에 집중','실력을 다지기',{skill:8,money:-3}),
  opts('🧑‍🤝‍🧑','사람들을 만나기','관계를 만들기',{network:7,trust:4}),
  opts('🛋️','쉬면서 생활 정리','자금과 위험을 관리하기',{money:5,risk:-4,trust:2})
 ];
 const ritualsWork=[
  opts('📚','업무와 자기계발','현장 전문성을 키우기',{skill:9,money:-3}),
  opts('🤝','사람·커뮤니티에 집중','신뢰와 협력을 쌓기',{network:7,trust:6}),
  opts('🧾','수입과 생활비 관리','자금을 아끼기',{money:11,risk:-3})
 ];
 const ritualsPolitics=[
  opts('📊','정책 자료를 공부','지식·근거를 확보',{skill:8,trust:3}),
  opts('🚶','지역 주민과 만남','조직과 신뢰 확보',{network:8,trust:5,money:-3}),
  opts('📱','방송과 SNS 활동','인지도 확보, 구설도 감수',{fame:11,risk:4,trust:-2})
 ];
 const extra=(r<=1?rituals:r===2?ritualsWork:ritualsPolitics)[(state.stage+state.actionsLeft+state.seedInitial)%3];
 return base.concat(extra);
}
function addPending(type){state.pending.push({at:Math.min(14,state.stage+2+Math.floor(rng()*2)),type});}
function applyLater(){
 const due=state.pending.filter(p=>p.at<=state.stage),future=state.pending.filter(p=>p.at>state.stage);
 state.pending=future;
 for(const p of due){
  let story='',delta={},force=false;
  if(p.type==='mentor'){story='오래전에 도운 사람이 뜻밖의 추천서를 써줬다.';delta={network:8,trust:6}}
  if(p.type==='clip'){story='옛날 영상이 다시 뉴스에 등장했다.';delta={fame:10,risk:6,trust:-4}}
  if(p.type==='debt'){story='과거에 빌린 돈의 상환일이 돌아왔다.';delta={money:-11,risk:4}}
  if(p.type==='press'){story='예전 인터뷰가 다시 사람들의 관심을 받았다.';delta={fame:8,network:4}}
  if(p.type==='ally'){story='몇 년 전 함께했던 동료가 도와주겠다고 연락했다.';delta={network:11,trust:4}}
  if(p.type==='community'){story='지역 주민들이 예전에 네가 한 일을 기억하고 있었다.';delta={network:8,trust:9}}
  if(p.type==='clean'){story='과거에 남긴 투명한 자료가 신뢰를 높였다.';delta={trust:10,risk:-5}}
  if(p.type==='startup'){if(rng()<.56){story='옛날에 시작했던 작은 사업이 성장했다.';delta={money:16,fame:6}}else{story='시도했던 사업이 힘든 시기를 겪었다.';delta={money:-8,skill:4}}}
  if(p.type==='retest'){if(rng()<.46){story='재도전 끝에 다음 단계로 진학했다.';state.education='재수 후 대학 진학';delta={skill:8,trust:3}}else{story='재수 결과가 아쉬웠고 다른 교육을 찾아 나섰다.';state.education='재수 후 직업교육';delta={skill:5,money:-4}}}
  if(p.type==='audit'){story='과거 계약을 둘러싼 공식 조사가 시작됐다.';delta={trust:-12,risk:16,money:-5};if(state.flags.shady&&state.flags.coverup&&state.stats.risk>53&&rng()<.65){state.pendingEnd='prison';force=true;story+=' 법적 책임이 확정되어 정치 활동을 마감하게 됐다.'}}
  mutate(delta);generateHistory(ages[state.stage], '과거 선택의 후폭풍',story,'후폭풍');updateNews('🔔 '+story);
  if(force)break;
 }
}
function chooseDaily(i){
 if(!state||state.ending||state.phase!=='daily'||state.actionsLeft<=0)return;
 const event=getEvent(),choice=dailyOptions()[i];if(!choice)return;
 const deltas=mutate(choice.delta);let note='',wasExpelled=false;
 if(choice.flag)state.flags[choice.flag]=true;
 if(choice.later)addPending(choice.later);
 if(choice.stance){note+=shiftStance(choice.stance);wasExpelled=!!state.flags.expelled}
 if(choice.roll){const pass=rng()<choice.roll.chance;const roll=choice.roll;note+=' '+(pass?roll.good:roll.bad);deltas.push(...mutate(pass?roll.goodDelta:roll.badDelta))}
 if(!note)note=chooseSeed(['작은 결정이 몇 년 뒤에 의미를 갖게 될지도 모른다.','이 선택은 나중에 이력서에서 한 줄로 남았다.','그날의 선택으로 주변 사람들의 평가가 조금 달라졌다.','당장은 별일 없었지만 내 인생의 방향이 조금 바뀌었다.']);
 generateHistory(ages[state.stage],choice.title,event.title+' — '+note,choice.stance?'정치 발언':'일상');
 state.choice={title:choice.title,result:note,delta:deltas,i};
 state.phase='result';state.actionsLeft--;
 updateNews(wasExpelled?state.news:choice.title+' · '+note);
 save();render();
}
function nextDaily(){
 if(!state||state.phase!=='result')return;
 state.choice=null;
 if(state.pendingEnd){finish(state.pendingEnd);return}
 if(state.actionsLeft>0){pickEvent();state.phase='daily';}
 else{state.phase='major-ready';}
 save();render();
}
function majorFor(){
 switch(state.stage){
 case 0:return MAJORS[0];
 case 1:return MAJORS[1];
 case 2:return MAJORS[2];
 case 3:return MAJORS[3];
 case 4:return MAJORS[4];
 case 5:return MAJORS[5];
 case 6:return MAJORS[6];
 case 7:return MAJORS[7];
 case 8:return MAJORS[8];
 case 9:return state.politics?MAJORS[9]:MAJORS[10];
 case 10:return state.politics?MAJORS[11]:MAJORS[10];
 case 11:return state.politics?MAJORS[12]:MAJORS[10];
 case 12:return state.politics?MAJORS[13]:MAJORS[16];
 case 13:return state.nomination?MAJORS[14]:MAJORS[16];
 case 14:return state.nomination?MAJORS[15]:MAJORS[16];
 default:return MAJORS[16];
 }
}
function rollChance(roll){
 const a=state.stats,p=party(),c=roll.kind;
 if(c==='local')return clamp(roll.base+a[roll.skill]*.30+a.trust*.10+a.network*.09-a.risk*.23+(p?5:0),4,86)/100;
 if(c==='national')return clamp(roll.base+a[roll.skill]*.28+a.trust*.14+a.fame*.09-a.risk*.25+(state.localWin?10:0),4,83)/100;
 if(c==='primary')return clamp(roll.base+a[roll.skill]*.32+a.network*.15+a.trust*.13+a.fame*.13-a.risk*.25+(state.nationalWin?11:0)+(state.localWin?6:0)+(p?4:-9),5,93)/100;
 return .45;
}
function chooseMajor(i){
 if(!state||state.phase!=='major-ready')return;
 const major=majorFor(),opt=major.choices[i];if(!opt)return;
 let deltas=mutate(opt.delta),note='';
 if(opt.set)for(const [k,v]of Object.entries(opt.set))state[k]=v;
 if(opt.flag)state.flags[opt.flag]=true;
 if(opt.later)addPending(opt.later);
 if(opt.party){
  if(opt.party==='none'){state.party=null;state.loyalty=100;note='무소속으로 독립 노선을 선택했다.'}
  else{state.party=opt.party;const p=party();state.loyalty=clamp(86-(Math.abs(p.econ-state.econ)+Math.abs(p.change-state.change))*.13,40,100);note=p.motto+' — 소속 정당을 선택했다.'}
 }
 if(opt.stance)note+=shiftStance(opt.stance);
 if(opt.roll){const win=rng()<rollChance(opt.roll);const kind=opt.roll.kind;if(kind==='local')state.localWin=win;if(kind==='national')state.nationalWin=win;if(kind==='primary'){state.nomination=win;if(!win)state.pendingEnd='primary'}
  if(win){deltas.push(...mutate({fame:13,network:8,trust:6}));state.career=kind==='local'?'지방의원':kind==='national'?'국회의원':'대선 후보';}
  note+=' '+(win?opt.roll.good:opt.roll.bad);
 }
 if(opt.end)state.pendingEnd=opt.end;
 generateHistory(ages[state.stage],opt.title,major.title+' — '+opt.detail+(note?' '+note:''),'한방 선택');
 state.news='결정적 인생 선택: '+opt.title+(note?' · '+note:'');
 $('majorDialog').close();
 if(opt.final){if(state.nomination&&state.stage===14)resolveElection();else finishFromLife();return}
 if(state.pendingEnd){finish(state.pendingEnd);return}
 if(state.stage>=ages.length-1){finishFromLife();return}
 state.stage++;state.actionsLeft=state.stage<3?1:state.stage>9?1:2;state.seen=[];applyLater();
 if(state.pendingEnd){finish(state.pendingEnd);return}
 pickEvent();state.phase='daily';state.choice=null;save();render();
}
function politicalScore(){
 const a=state.stats,p=party();
 const match=p?Math.max(0,18-(Math.abs(p.econ-state.econ)+Math.abs(p.change-state.change))*.10):0;
 const base=17+a.skill*.10+a.network*.15+a.trust*.19+a.fame*.15+a.money*.07-a.risk*.22+match*.4+(state.localWin?3:0)+(state.nationalWin?5:0);
 return clamp(13+base*.46,7,69);
}
function regionalScores(){
 const base=politicalScore();
 return REGIONS.map((name,i)=>({name,value:clamp(base+state.regionsBase[i]+((state.seedInitial+i*9)%11)-4,3,80)}));
}
function resolveElection(){
 const regions=regionalScores();const average=regions.reduce((v,r)=>v+r.value,0)/regions.length;const noise=(rng()-.5)*11;
 const vote=clamp(average+noise,5,70);
 state.vote={total:vote,regions};state.ending=vote>=50?'president':'defeat';
 generateHistory(ages[state.stage],state.ending==='president'?'대통령 선거 당선':'대통령 선거 낙선','가상 최종 득표율 '+vote+'%', '선거 결과');
 state.phase='end';save();render();
}
function finishFromLife(){
 let end='ordinary';
 if(state.pendingEnd)end=state.pendingEnd;
 else if(state.flags.media&&state.stats.fame>48)end='media';
 else if(state.stats.money<17)end='struggling';
 else if(state.stats.money>=68)end='business';
 else if(state.localWin||state.politics)end='local';
 else if(state.flags.expert||state.stats.skill>=75)end='career';
 finish(end);
}
function finish(end){state.ending=end in ENDINGS?end:'ordinary';state.phase='end';state.pendingEnd=null;save();render()}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e}
function text(id,val){$(id).textContent=String(val??'')}
function color(){const p=party();return p?.color||'#657983'}
function renderProgress(){
 const box=$('phaseProgress');box.replaceChildren();
 PHASES.forEach((p,i)=>{const d=el('div',i<currentPhase()?'done':i===currentPhase()?'current':'');d.append(el('b','',p.short),el('span','',i<currentPhase()?'완료':i===currentPhase()?'현재':'잠김'));box.append(d)});
}
function renderPoster(){
 const stage=lifeNickname(),p=party(),a=ages[state.stage],poster=$('candidatePoster');
 poster.style.setProperty('--party',color());document.documentElement.style.setProperty('--party',color());
 poster.dataset.template=['campaign','minimal','slogan'][(state.seedInitial+(state.politics?1:0))%3];
 text('posterStage',stage);text('posterName',state.name);text('posterMottoTop',slogan());text('posterDistrict',state.home+' 출생');
 text('posterParty',p?.name||'무소속');text('posterIcon',p?.logo||'◇');text('posterNumber',state.nomination?p?.number||'무': '—');
 text('profileStatus',state.career);
 const tokens=$('profileTokens');tokens.replaceChildren();
 const list=[state.school!=='아직 없음'?'🎓 '+state.school:null,state.education!=='아직 없음'?'📚 '+state.education:null,state.degree!=='없음'?'🧾 '+state.degree:null,'💼 '+state.career,state.activity!=='없음'?'📍 '+state.activity:null,state.flags.expelled?'⚠️ 제명 기록':null,state.nomination?'🗳️ 대선 후보':null].filter(Boolean);
 list.slice(-6).forEach((value,i)=>tokens.append(el('span','token'+(i===list.length-1?' tint':''),value)));
 text('stanceLabel',Math.abs(state.econ)<18&&Math.abs(state.change)<18?'중도·실용 성향':(state.econ<-15?'분배':'시장')+' · '+(state.change<-15?'변화':'안정')+' 중심');
 $('ecoMarker').style.left=(50+state.econ/2)+'%';$('changeMarker').style.left=(50+state.change/2)+'%';
 $('loyaltyPanel').hidden=!p;text('loyaltyValue',state.loyalty);$('loyaltyFill').style.width=state.loyalty+'%';
}
function renderWorld(){
 const known=state.politics||!!party();let vals=regionalScores();
 text('worldNote',known?'정당·정책·신뢰에 따라 움직이는 가상 지표':'정치권에 들어가야 열리는 가상 여론');
 const root=$('regions');root.replaceChildren();
 for(const r of vals){const item=el('div','region'+(!known?' unknown':''));const head=el('div','region-head');head.append(el('span','',r.name),el('span','',known?r.value+'%':'?'));const bar=el('div','region-meter'),fill=el('i');fill.style.width=known?r.value+'%':'15%';bar.append(fill);item.append(head,bar);root.append(item)}
 text('worldSummary',known?'현재 전국 여론 추정치 (실제 선거와 무관)':'대선 후보가 될 때까지 지지율은 의미 없어.');
 text('worldTotal',known?politicalScore()+'%':'—');
}
function renderChoices(){
 const options=dailyOptions(),panel=$('dailyChoices');panel.replaceChildren();
 const block=state.phase!=='daily'||state.actionsLeft<=0;
 options.forEach((opt,i)=>{
  const btn=el('button','daily-card'+(state.choice?.i===i?' selected':''));btn.type='button';btn.disabled=block;
  const ico=el('span','daily-emoji',opt.emoji),copy=el('span','daily-copy'),b=el('b','',opt.title),small=el('small','',opt.detail);copy.append(b,small);
  if(opt.stance){let bits=[];if(opt.stance.econ>10)bits.push('시장 중시');if(opt.stance.econ< -10)bits.push('분배 중시');if(opt.stance.change>10)bits.push('안정 중시');if(opt.stance.change< -10)bits.push('변화 중시');if(bits.length)copy.append(el('span','stance-chip',bits.join(' · ')))}
  btn.append(ico,copy);btn.addEventListener('click',()=>chooseDaily(i));panel.append(btn);
 });
 $('choiceResponse').hidden=state.phase!=='result';
 if(state.choice){text('responseHeading',state.choice.title);text('responseText',state.choice.result);const root=$('deltaTags');root.replaceChildren();state.choice.delta.forEach(o=>root.append(el('span',o.delta<0?'down':'',(KEY_STATS[o.key]||o.key)+' '+(o.delta>0?'+':'')+o.delta)));text('nextDay',state.actionsLeft>0?'다음 일상으로 →':'인생 전환점 준비 →')}
 const ready=state.phase==='major-ready';$('majorTrigger').classList.toggle('ready',ready);$('majorOpen').disabled=!ready;
 const major=majorFor();text('majorTitle',major.title);text('majorSubtitle',ready?'다음 인생의 결정적 사건이 열렸어.':'남은 일상 행동 후 중요한 선택을 하게 돼.');
 text('actionsRemaining',ready?'중요한 선택 대기':state.phase==='result'?'선택 확인 중':'남은 활동 '+state.actionsLeft+'회');
}
function renderGame(){
 const age=ages[state.stage],phase=PHASES[currentPhase()],event=getEvent();const ready=state.phase==='major-ready';
 text('chapterOverline','ACT '+String(currentPhase()+1).padStart(2,'0')+' / 인생 '+progress());
 text('chapterTitle',phase.name);text('chapterDescription',phase.desc);$('ageValue').replaceChildren(document.createTextNode(age),el('span','','세'));text('yearValue',(2026+age-5)+'년');
 text('turnLabel','LIFE / '+String(state.stage+1).padStart(3,'0'));text('dayHeading',ready?'큰 결정을 내릴 때':'이번 시기의 활동');text('boardGuide',ready?'일상의 시간이 지나고, 전환점이 열렸다.':'작은 활동이 쌓이고, 나중에 다른 사건으로 돌아올 수 있다.');
 text('newsText',state.news);text('eventTag',ready?'인생 전환점':'오늘의 사건');text('eventSource',phase.short+' 속보');
 text('eventIcon',ready?'📮':event.choices[0].emoji);text('eventTitle',ready?majorFor().title:event.title);text('eventDescription',ready?majorFor().subtitle:event.body);
 renderProgress();renderPoster();renderWorld();renderChoices();
 $('historyOpen').hidden=false;$('newLifeTop').hidden=false;
}
function endFacts(){
 const f=[['성명',state.name],['출신',state.home+' · '+state.family],['최종 나이',ages[state.stage]+'세'],['고교',state.school],['최종 학력·진로',state.education],['직업',state.career],['소속 정당',party()?.name||'무소속'],['대표 공약',state.pledge],['최종 정치 성향',state.econ<-22?'분배 중심':state.econ>22?'시장 중심':'균형형']];
 if(state.vote)f.push(['가상 득표율',state.vote.total+'%']);
 return f;
}
function renderEnd(){
 const result=ENDINGS[state.ending]||ENDINGS.ordinary;
 text('endTitle',state.name+' · '+result.title);text('endDescription',result.desc);text('endSymbol',result.emoji);text('endSlogan',result.caption);
 text('endKind',result.title);text('endName',state.name);text('endParty',(party()?.name||'무소속')+' · '+ages[state.stage]+'세');text('endSerial','NO. '+state.serial);
 $('endingPoster').style.setProperty('--party',color());
 const facts=$('endFacts');facts.replaceChildren();
 for(const [k,v]of endFacts()){const row=el('div','fact-row');row.append(el('span','',k),el('b','',v));facts.append(row)}
 const moments=$('endMoments');moments.replaceChildren();const records=state.history.filter(h=>h.age!==0&&h.token==='한방 선택');const important=[records[0],records[Math.floor(records.length/2)],records[records.length-1]].filter(Boolean);
 for(let i=0;i<important.length;i++){moments.append(el('div','moment-row',String(i+1).padStart(2,'0')+' · '+important[i].age+'세 · '+important[i].title))}
 const region=$('endRegions');region.replaceChildren();
 if(state.vote){for(const item of state.vote.regions){const row=el('div','end-region'),bar=el('div'),fill=el('i');fill.style.width=item.value+'%';bar.append(fill);row.append(el('span','',item.name),bar,el('b','',item.value+'%'));region.append(row)}}
 else region.append(el('p','', '대선 본선에 진출하지 않았음'));
 $('historyOpen').hidden=false;$('newLifeTop').hidden=false;
}
function render(){if(!state){$('welcome').hidden=false;$('game').hidden=true;$('ending').hidden=true;$('historyOpen').hidden=true;$('newLifeTop').hidden=true;return}
 $('welcome').hidden=true;$('game').hidden=!!state.ending;$('ending').hidden=!state.ending;
 if(state.ending)renderEnd();else renderGame();}
function openMajor(){
 if(!state||state.phase!=='major-ready')return;
 const major=majorFor();text('majorOverline','TURNING POINT / '+state.stage+' · '+ages[state.stage]+'세');text('modalTitle',major.title);text('modalDescription',major.subtitle);text('documentType',major.form);text('documentSerial','신청인 '+state.name+' · '+state.serial);
 const ballot=major.id==='party',root=$('majorOptions');root.className='major-options'+(ballot?' ballot':'');root.replaceChildren();
 major.choices.forEach((opt,i)=>{
  const btn=el('button','major-option');btn.type='button';
  if(ballot){const n=el('span','ballot-number','기호');n.append(el('b','',i<5?i+1:'—'));btn.append(n);if(i<5)btn.style.setProperty('--ballot',PARTIES[i].color);}
  const sym=el('span','major-emoji',opt.emoji),copy=el('span','major-copy');copy.append(el('strong','',opt.title));if(ballot&&i<5)copy.append(el('em','',PARTIES[i].motto));
  copy.append(el('small','',opt.detail));btn.append(sym,copy);btn.addEventListener('click',()=>chooseMajor(i));root.append(btn);
 });
 text('majorLegal',ballot?'가상의 정당·기호야. 너의 정치 발언과 당의 기본 노선이 충돌하면 당내 신뢰가 떨어질 수 있어.':'신중하게 골라. 이 선택은 몇 년 뒤의 사건·직업·인생 경로에 반영돼.');
 $('majorDialog').showModal();
}
function openHistory(){
 if(!state)return;
 const root=$('historyContent');root.replaceChildren();
 state.history.slice().reverse().forEach(record=>{const row=el('div','history-item');row.append(el('b','',record.age+'세 · '+(record.token||'인생 기록')),el('strong','',record.title),el('p','',record.description));if(record.token==='한방 선택')row.append(el('span','token tint','인생의 전환점'));root.append(row)});
 $('historyDialog').showModal();
}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state))}catch(e){}}
function load(){try{const x=JSON.parse(localStorage.getItem(SAVE)||'null');if(x&&x.v===V&&Number.isInteger(x.stage)&&x.stage>=0&&x.stage<ages.length&&x.stats&&x.flags&&Array.isArray(x.history)&&Array.isArray(x.seen)&&Array.isArray(x.pending)&&['daily','result','major-ready','end'].includes(x.phase)){state=x;return true}}catch(e){}return false}
function newLife(){if(state&&!state.ending&&!window.confirm('현재 인생 기록을 버리고 새로 시작할까?'))return;state=null;try{localStorage.removeItem(SAVE)}catch(e){}$('nameInput').value='';render()}
function wrap(ctx,string,x,y,width,height,lines){let line='',count=0;for(const c of String(string)){if(ctx.measureText(line+c).width>width&&line){ctx.fillText(line,x,y+height*count);count++;line=c;if(count>=lines)return}else line+=c}if(line&&count<lines)ctx.fillText(line,x,y+height*count)}
function posterBlob(){return new Promise((resolve,reject)=>{try{
 const c=document.createElement('canvas');c.width=1040;c.height=1340;const ctx=c.getContext('2d');if(!ctx)throw Error('canvas unavailable');
 const result=ENDINGS[state.ending]||ENDINGS.ordinary;const p=party();
 ctx.fillStyle=color();ctx.fillRect(0,0,1040,1340);ctx.strokeStyle='#ffffff35';ctx.lineWidth=4;ctx.beginPath();ctx.arc(820,380,320,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='white';ctx.textAlign='left';ctx.font='900 52px sans-serif';ctx.fillText('국민의 부름',70,100);
 ctx.font='bold 22px sans-serif';ctx.fillText('THE PEOPLE CALL / FINAL EDITION',70,148);
 ctx.fillStyle='#ffffff18';ctx.beginPath();ctx.ellipse(700,570,280,310,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#132232';ctx.beginPath();ctx.ellipse(690,482,100,128,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(690,815,265,230,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.font='900 38px sans-serif';wrap(ctx,result.caption,70,300,860,54,3);
 ctx.font='900 72px sans-serif';wrap(ctx,result.title,70,882,905,92,2);
 ctx.font='900 49px sans-serif';ctx.fillText(state.name,72,1020);
 ctx.font='bold 26px sans-serif';ctx.fillText((p?.name||'무소속')+' / '+ages[state.stage]+'세',75,1075);
 ctx.strokeStyle='#ffffff77';ctx.beginPath();ctx.moveTo(70,1130);ctx.lineTo(970,1130);ctx.stroke();
 ctx.font='bold 23px sans-serif';ctx.fillText('가상의 인생 시뮬레이션 · '+(state.vote?state.vote.total+'% 가상 득표':'대선 미진출'),70,1190);
 ctx.font='bold 20px sans-serif';ctx.fillText('YOUR CHOICES / YOUR STORY',70,1290);ctx.textAlign='right';ctx.fillText('#'+state.serial,970,1290);
 c.toBlob(b=>b?resolve(b):reject(Error('PNG failed')),'image/png');
 }catch(err){reject(err)}})}
async function download(){try{const blob=await posterBlob(),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='국민의부름-'+state.name+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1300)}catch(e){alert('저장에 실패했어. 결과 화면을 캡처해 줘.')}}
async function share(){const msg='[국민의 부름]\n'+state.name+' · '+(ENDINGS[state.ending]?.title||'인생 엔딩')+'\n'+(state.vote?'대선 '+state.vote.total+'%':'대선 미진출')+'\n'+(party()?.name||'무소속')+'\n'+location.href;try{if(navigator.share)await navigator.share({title:'국민의 부름',text:msg});else if(navigator.clipboard){await navigator.clipboard.writeText(msg);alert('결과를 복사했어!')}else window.prompt('결과를 복사해 봐',msg)}catch(e){if(e.name!=='AbortError')alert('공유 기능을 사용할 수 없어.')}}
$('startBtn').addEventListener('click',()=>createLife($('nameInput').value));
$('nameInput').addEventListener('keydown',e=>{if(e.key==='Enter')createLife($('nameInput').value)});
$('nextDay').addEventListener('click',nextDaily);$('majorOpen').addEventListener('click',openMajor);$('majorClose').addEventListener('click',()=>$('majorDialog').close());
$('historyOpen').addEventListener('click',openHistory);$('historyClose').addEventListener('click',()=>$('historyDialog').close());
$('replayBtn').addEventListener('click',newLife);$('newLifeTop').addEventListener('click',newLife);$('downloadBtn').addEventListener('click',download);$('shareBtn').addEventListener('click',share);
$('majorDialog').addEventListener('click',e=>{if(e.target===$('majorDialog'))$('majorDialog').close()});
$('historyDialog').addEventListener('click',e=>{if(e.target===$('historyDialog'))$('historyDialog').close()});
document.addEventListener('keydown',e=>{if(!state||state.ending||$('majorDialog').open||$('historyDialog').open||e.target.matches('input,textarea,button'))return;if(state.phase==='daily'&&/^[1-4]$/.test(e.key))chooseDaily(+e.key-1);else if(state.phase==='result'&&e.key==='Enter')nextDaily();else if(state.phase==='major-ready'&&e.key==='Enter')openMajor()});
if(load())render();else render();
})();