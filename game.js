(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEY = 'callOfgukmin__playable__v1';
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, Math.round(n)));
const O = (name, desc, delta = {}, trait = '', extra = {}) => ({name, desc, delta, trait, ...extra});
const fmt = n => Number(n).toLocaleString('ko-KR');
const labels = {study:'성적',mind:'정신력',support:'지지도',network:'인맥',money:'재력',spectrum:'성향',loyalty:'당내 신뢰'};
const schools=['초등학교','중학교','고등학교','대학교'];
const parties = [
 {name:'자유국민당',mark:'▥',color:'#416f9e',ideology:50,motto:'성장과 책임, 더 강한 내일',desc:'시장·안정 중심'},
 {name:'민주혁신당',mark:'≋',color:'#be525f',ideology:-45,motto:'일상의 변화가 나라를 바꾼다',desc:'복지·개혁 중심'},
 {name:'민생직진당',mark:'↯',color:'#b58d35',ideology:-82,motto:'미룰 시간이 없습니다',desc:'분배·변화 중심'},
 {name:'철벽수호당',mark:'▣',color:'#775da8',ideology:83,motto:'흔들리지 않는 원칙',desc:'안정·질서 중심'},
 {name:'실용미래당',mark:'⟲',color:'#2d8a83',ideology:0,motto:'싸우기보다 해결합니다',desc:'중도·실용 중심'}
];
const families=[
 {name:'작은 식당집',place:'경기도 수원',money:1200,study:1,mind:0,network:3,trait:'서민 가정',description:'부모님은 작은 식당을 운영한다. 단골은 많지만 여유는 적었다.'},
 {name:'맞벌이 가정',place:'서울',money:8500,study:6,mind:-2,network:1,trait:'맞벌이 가정',description:'두 분 모두 아침 일찍 출근한다. 벽에는 가족 일정표가 붙어 있다.'},
 {name:'자영업 가정',place:'부산',money:3800,study:-1,mind:2,network:4,trait:'자영업 가정',description:'집에서 장부와 손님 이야기를 들으며 자랐다.'},
 {name:'경제적으로 여유 있는 가정',place:'대전',money:18500,study:7,mind:-4,network:7,trait:'유복한 가정',description:'진로를 고를 여유는 있지만 부모님의 기대도 크다.'},
 {name:'형편이 어려운 가정',place:'광주',money:550,study:3,mind:3,network:0,trait:'흙수저',description:'고지서를 확인하는 일은 어린 시절부터 익숙했다.'}
];
const names=['이루은','유승현','최승우','강민수','김병수','김병인','윤소율','박재윤'];
let state = null, chosen = -1;
const random = () => {state.seed = (Math.imul(state.seed,1664525)+1013904223)>>>0;return state.seed/4294967296};
const randItem = arr => arr[Math.floor(random()*arr.length)];
const events = [
    {
      age: 3,
      title: "식당 구석에서 자란 아이",
      text: "부모님은 작은 식당을 운영한다. 손님들은 아이가 말을 잘한다며 사탕을 놓고 갔다.",
      auto: true,
      delta: { network: 2 },
      trait: "붙임성"
    },
    {
      age: 7,
      title: "빈칸이 있는 알림장",
      text: "준비물을 사야 한다. 부모님은 내일 사주겠다고 했다.",
      type: "letter",
      choices: [
        O("그냥 기다린다", "참는 법을 먼저 배운다",
          { mind: 8 }, "인내심"),
        O("직접 폐지를 모은다", "작은 돈도 직접 벌어본다",
          { money: 3, mind: -4 }, "생활력"),
        O("친구에게 빌린다", "도움을 청하는 것도 능력이다",
          { network: 4 }, "붙임성")
      ]
    },
    {
      age: 10,
      title: "급식실의 작은 연설",
      text: "반찬이 너무 적다는 말에 친구들이 모였다. 누군가 네 등을 떠밀었다.",
      type: "debate",
      choices: [
        O("대표로 선생님을 찾아간다", "설득을 연습한다",
          { support: 3, network: 3 }, "말솜씨"),
        O("친구들의 의견을 적는다", "근거를 먼저 모은다",
          { study: 5 }, "꼼꼼함"),
        O("그냥 밥을 더 먹는다", "일단 배가 고프다",
          { mind: 5 }, "낙천적")
      ]
    },
    {
      age: 13,
      title: "첫 번째 선거",
      text: "반장 선거 공약을 정할 시간이다. 아직 예산이라는 단어는 모른다.",
      type: "debate",
      choices: [
        O("매주 금요일은 치킨입니다", "실현 가능성보다 박수 소리",
          { support: 4, mind: -4 }, "포퓰리스트"),
        O("익명 건의함을 만들겠습니다", "작지만 할 수 있는 일",
          { support: 3, network: 5 }, "신뢰"),
        O("시험 범위 정리본을 돌린다", "성적과 실무로 승부한다",
          { study: 8, network: 2 }, "꼼꼼함")
      ]
    },
    {
      age: 16,
      title: "어느 교문으로 들어갈까",
      text: "입학 원서가 식탁 위에 놓여 있다. 교복보다 오래 남을 이름을 고른다.",
      type: "school",
      target: "high",
      choices: [
        O("한빛고등학교", "사립 명문 · 장학 전형",
          { study: 10, mind: -8, network: 8 }, "명문고 동문", {
            crest: "光",
            color: "#c5a564",
            require: s => s.study >= 50 ? "" : "성적 50 이상 필요"
          }),
        O("수원제일고등학교", "지역 일반고 · 통학 가능",
          { study: 5, network: 5, mind: 3 }, "지역의 아들", {
            crest: "正",
            color: "#78ac92"
          }),
        O("동진공업고등학교", "특성화 · 기술과 빠른 취업",
          { money: 40, network: 3 }, "기술 자격", {
            crest: "工",
            color: "#7a9fc7"
          })
      ]
    },
    {
      age: 18,
      title: "수능 전날 밤",
      text: "책상 위에는 문제집과 식은 커피가 남았다. 내일은 생각보다 빨리 왔다.",
      type: "letter",
      choices: [
        O("한 단원만 더 본다", "공부에 집중하지만 피로가 쌓인다",
          { study: 12, mind: -12 }),
        O("일찍 잔다", "컨디션을 챙긴다",
          { study: 4, mind: 10 }),
        O("수시 준비 자료를 확인한다", "성적보다 쌓아온 이력을 믿는다",
          { study: 6, network: 2 }, "준비된 사람")
      ]
    },
    {
      age: 19,
      title: "합격증과 등록금",
      text: "학교 이름을 묻는 사람도, 언제 돈을 벌 거냐는 사람도 있다.",
      type: "school",
      target: "uni",
      choices: [
        O("한국대학교 정치외교학과", "명문 사립대 · 학자금 대출",
          { money: -600, network: 15, study: 8 }, "명문대 간판", {
            crest: "大",
            color: "#b399d8",
            require: s => s.study >= 70 ? "" : "성적 70 이상 필요"
          }),
        O("경기국립대학교 행정학과", "국립대 · 장학금",
          { money: -100, study: 6, network: 8 }, "행정 지식", {
            crest: "公",
            color: "#77a3c6",
            require: s => s.study >= 45 ? "" : "성적 45 이상 필요"
          }),
        O("대학 대신 사회로", "취업과 현장 경험",
          { money: 300, mind: 3 }, "현장 경험", {
            crest: "業",
            color: "#b59a69"
          })
      ]
    },
    {
      age: 22,
      title: "인생은 성적순이 아니었다",
      text: "지역 행사에서 우연히 만난 구의원이 명함을 건넸다. 식당 단골손님의 소개였다.",
      auto: true,
      delta: { network: 6, support: 2 },
      trait: "지역 인맥"
    },
    {
      age: 25,
      title: "첫 번째 명함",
      text: "직업란에 들어갈 말은 앞으로의 인생에도 따라붙는다.",
      type: "career",
      choices: [
        O("국회의원 보좌진", "의원실에서 정치를 배운다",
          { network: 13, money: 180 }, "정치 실무", {
            job: "보좌진",
            require: s => s.network >= 15 ? "" : "인맥 15 이상 필요"
          }),
        O("지역 신문 기자", "이름보다 사건을 먼저 쓴다",
          { support: 7, network: 7, money: 120 }, "언론 경험", {
            job: "기자"
          }),
        O("현장 노동자", "월급과 생활을 직접 겪는다",
          { money: 220, network: 5 }, "현장 경험", {
            job: "노동자"
          })
      ]
    },
    {
      age: 28,
      title: "재개발 설명회가 뒤집혔다",
      text: "주민들은 소리를 높이고 담당자는 서류만 넘긴다. 마이크가 네 앞에 있다.",
      type: "debate",
      choices: [
        O("주민 대표로 발언한다", "말솜씨가 있으면 설득력이 더해진다",
          { support: 9, network: 5 }, "주민 대표"),
        O("계약서를 분석해 공개한다", "행정 지식이 있으면 더 날카로워진다",
          { support: 6, study: 5 }, "자료로 말함"),
        O("현장을 영상으로 올린다", "인지도와 논란이 함께 오른다",
          { support: 8, mind: -5 }, "온라인 화제")
      ]
    },
    {
      age: 30,
      title: "이름 앞에 색이 붙는다",
      text: "세 정당의 연락이 왔다. 명함 색은 다르지만 마지막 말은 같았다. “젊은 인재가 필요합니다.”",
      type: "party",
      choices: [
        O("새벽국민당", "안정 · 성장 · 조직",
          { network: 12, spectrum: 35 }, "조직의 선택", {
            mark: "새",
            color: "#b7535c"
          }),
        O("함께내일당", "개혁 · 복지 · 연대",
          { support: 7, network: 7, spectrum: -35 }, "개혁의 얼굴", {
            mark: "함",
            color: "#547cbd"
          }),
        O("상식제일당", "실용 · 세대교체 · 양당 심판",
          { support: 5, network: 4 }, "제3의 선택", {
            mark: "상",
            color: "#b08b3b"
          })
      ]
    },
    {
      age: 34,
      title: "공천 면접",
      text: "면접위원은 소신을 물었다. 옆의 당직자는 당론 자료를 조용히 밀어줬다.",
      type: "debate",
      choices: [
        O("지역 활동으로 증명한다", "주민 대표 경험이 설득에 도움을 준다",
          { support: 6, network: 6 }, "지역 기반"),
        O("당론을 정확하게 답한다", "조직의 신뢰를 얻는다",
          { network: 10, mind: -5 }, "당의 사람"),
        O("정책 보고서를 제출한다", "공부한 내용을 써먹을 때다",
          { study: 5, support: 5 }, "정책형 인재", {
            require: s => s.study >= 55 ? "" : "성적 55 이상 필요"
          })
      ]
    },
    {
      age: 39,
      title: "첫 국회의원 선거",
      text: "유세차가 골목을 돈다. 이제 친구의 한 표보다 많은 표가 필요하다.",
      type: "debate",
      choices: [
        O("골목마다 직접 걷는다", "지역 기반과 인맥으로 승부",
          { support: 9, mind: -8 }, "발로 뛰는 후보"),
        O("토론 방송에 집중한다", "말솜씨와 정책으로 승부",
          { support: 8 }, "토론의 달인"),
        O("온라인 선거운동을 펼친다", "적은 비용으로 넓게 퍼진다",
          { support: 7, network: 5 }, "온라인 조직")
      ]
    },
    {
      age: 43,
      title: "봉투는 책상 아래에 있었다",
      text: "건설업자가 두툼한 봉투 옆에 명함을 놓았다. “큰 뜻을 펼치셔야죠.”",
      type: "letter",
      choices: [
        O("돌려보낸다", "돈은 부족해도 약점을 남기지 않는다",
          { support: 9, mind: 5 }, "깨끗한 손"),
        O("공식 후원 절차를 안내한다", "기록을 남기고 후원받는다",
          { money: 700, network: 4, support: 3 }, "원칙주의자"),
        O("서랍에 넣는다", "큰 자금과 지워지지 않을 약점",
          { money: 3500, network: 8 }, "수상한 후원금")
      ]
    },
    {
      age: 47,
      title: "대선 경선의 문턱",
      text: "대통령 후보 경선이 시작됐다. 지역구 밖에서도 네 이름이 통할까.",
      type: "debate",
      choices: [
        O("생활 공약으로 출마한다", "정책과 지지도를 믿는다",
          { support: 7 }, "민생 후보"),
        O("당내 조직을 결집한다", "인맥 45 이상이면 조직이 힘을 보탠다",
          { network: 5, support: 5 }, "조직형 후보", {
            require: s => s.network >= 45 ? "" : "인맥 45 이상 필요"
          }),
        O("세대교체를 선언한다", "새로운 얼굴을 원하는 표심",
          { support: 6, mind: -5 }, "세대교체")
      ]
    },
    {
      age: 51,
      title: "과거가 다시 말을 걸었다",
      text: "후보 검증 보도가 시작됐다. 오래전의 기록은 지워지지 않았다.",
      auto: true,
      resolve: s => s.traits.includes("수상한 후원금")
        ? {
            text: "받아둔 봉투가 기사에 등장했다. 해명보다 통장 사본이 빨랐다.",
            delta: { support: -20, mind: -18 },
            trait: "후원금 논란"
          }
        : {
            text: "의혹은 쏟아졌지만 결정적인 기록은 나오지 않았다.",
            delta: { support: 5 },
            trait: "검증 통과"
          }
    },
    {
      age: 52,
      title: "마지막 한 문장",
      text: "카메라에 빨간 불이 들어왔다. 국민에게 할 말, 30초가 남았다.",
      type: "debate",
      choices: [
        O("살아온 삶으로 증명하겠습니다", "신뢰와 깨끗한 이력에 힘을 싣는다",
          { support: 5 }, "인생이 공약"),
        O("국민의 지갑부터 채우겠습니다", "민생과 현장 경험을 내세운다",
          { support: 5 }, "민생 승부수"),
        O("저쪽 후보보다는 낫습니다", "공격으로 지지층을 결집한다",
          { support: 3, mind: -3 }, "공격의 정치")
      ]
    }
  ];
// The original supplied story scenes remain the foundation. Only the decisions
// needed for an interactive, replayable demo are enriched below.
events.forEach((e,i)=>e.id='main-'+i);
const byAge = age => events.find(e=>e.age===age);
byAge(3).resolve = s => ({text:s.background.description,delta:{network:2},trait:s.background.trait});
byAge(16).choices = [
 O('휘문고','학업 중심 일반고 · 학교별 조건은 게임 속 허구',{money:-10000,study:10,network:8,mind:-8},'치열한 학업 경쟁',{crest:'徽',color:'#bda077',require:s=>s.study>=52?'':'성적 52 이상 필요'}),
 O('병신고','개성 넘치는 가상의 학교 · 유연한 분위기',{money:1000,study:-2,mind:12,network:7},'자유로운 영혼',{crest:'★',color:'#8f9b70'}),
 O('이빨고','토론과 언변에 강한 학생들이 모인 가상학교',{money:-500,study:6,network:7,spectrum:-7},'달변가',{crest:'牙',color:'#9278a9'}),
 O('수원제일고','지역 일반고 · 긴 통학 없이 생활',{study:5,network:5,mind:5},'지역의 아들',{crest:'正',color:'#78ac92'}),
 O('한빛고','장학 제도를 갖춘 가상 자율고',{study:9,mind:-6,network:6,money:-1200},'성실한 학생',{crest:'光',color:'#7a9fc7'})
];
byAge(19).choices[0].require=s=>s.study>=65?'':'성적 65 이상 필요';
byAge(19).choices[1].require=s=>s.study>=43?'':'성적 43 이상 필요';
byAge(30).choices = parties.map((p,i)=>O(p.name,p.desc,{network:8+(i%3),support:3},'당원',{mark:p.mark,color:p.color,partyIndex:i}));
byAge(30).choices.push(O('무소속','소속 없이 독립적으로 정치에 도전한다',{network:-7,support:4},'독립 정치인',{mark:'◇',color:'#707782',partyIndex:-1}));
byAge(13).choices[0].delta.spectrum=-12;
byAge(13).choices[1].delta.spectrum=-3;
byAge(13).choices[2].delta.spectrum=4;
byAge(34).choices[0].delta.spectrum=-13;
byAge(34).choices[1].delta.spectrum=12;
byAge(34).choices[2].delta.spectrum=0;
byAge(43).choices[0].delta.spectrum=-2;
byAge(43).choices[1].delta.spectrum=1;
byAge(43).choices[2].delta.spectrum=0;
const extra = [
 {
  id:'extra-8-a',age:8,title:'운동장 뒤의 작은 약속',text:'친구가 혼자 일을 떠안고 있다. 선생님은 아무것도 모른다.',type:'letter',choices:[O('나도 함께 돕는다','작은 호의가 오래 남는다',{network:4,mind:-4},'의리'),O('일을 나누자고 건의한다','방법을 바꾸는 선택',{study:4,network:2},'조정 능력'),O('내 할 일부터 마친다','먼저 자신의 일을 챙긴다',{study:5,mind:3})]
 },
 {id:'extra-8-b',age:8,title:'나의 첫 저금통',text:'설날 용돈이 남았다. 지금 쓰기엔 조금 아깝다.',type:'letter',choices:[O('저축한다','다음을 준비한다',{money:40,mind:4},'절약 습관'),O('친구와 나눠 쓴다','기억에 남는 하루',{network:6,money:-10},'통 큰 아이'),O('책과 교구를 산다','미래를 위한 투자',{study:7,money:-20})]},
 {id:'extra-17-a',age:17,title:'수학 수행평가 전날',text:'준비한 보고서와 친구의 부탁이 한 번에 겹쳤다.',type:'letter',choices:[O('보고서부터 완성한다','학업 성적을 챙긴다',{study:8,mind:-4},'계획적'),O('친구도 도와준다','시간이 부족해질 수 있다',{network:7,study:2,mind:-5},'배려심'),O('휴식을 취한다','컨디션이 우선이다',{mind:12,study:-2})]},
 {id:'extra-17-b',age:17,title:'학교 교내 토론대회',text:'경제 정책을 놓고 두 팀이 팽팽하다.',type:'debate',choices:[O('공공 지원을 확대하자','분배 정책에 대한 소신',{support:3,spectrum:-20},'복지에 관심'),O('민간의 선택을 넓히자','시장 중심 의견',{study:3,spectrum:20},'경제에 관심'),O('양쪽의 근거를 점검한다','균형 잡힌 검토',{study:5,mind:3},'자료 조사') ]},
 {id:'extra-24-a',age:24,title:'첫 자취 계약',text:'계약서가 생각보다 복잡하다.',type:'letter',choices:[O('전문가 조언을 구한다','돈이 들지만 실수를 줄인다',{study:3,money:-60},'신중함'),O('친구들과 공동 주거','생활비를 아낀다',{money:110,network:4}),O('일단 계약을 서두른다','뜻밖의 문제가 생길 수도',{money:-80,mind:-6},'성급한 결정')]},
 {id:'extra-24-b',age:24,title:'첫 직장에 대한 소문',text:'지인이 일자리를 소개했다. 미래가 결정되는 것 같아 부담스럽다.',type:'career',choices:[O('현장부터 확인한다','여건과 계약을 살핀다',{study:5,network:3},'현장 검증'),O('즉시 지원한다','도전의 기회를 잡는다',{network:6,mind:-5},'대담함'),O('공부에 집중한다','긴 호흡의 선택',{study:8,money:-100})]},
 {id:'extra-33-a',age:33,title:'지역 토론회의 갑작스러운 질문',text:'진행자가 시장과 복지 중 어느 쪽에 무게를 둘지 묻는다.',type:'debate',choices:[O('복지·분배를 먼저','공공의 역할을 크게 본다',{support:5,spectrum:-29},'복지 우선'),O('성장·시장 자율을 먼저','민간의 역할을 크게 본다',{network:5,spectrum:29},'성장 우선'),O('증거와 재원을 따져 보자','실무 검토에 집중',{study:8,mind:2},'실용 노선')]},
 {id:'extra-33-b',age:33,title:'당내 청년 정책 회의',text:'현장 의견과 중앙당 지침이 다르다.',type:'debate',choices:[O('당론대로 설명한다','당내 관계가 안정된다',{network:7,mind:-4}),O('현장의 목소리를 전한다','충돌할 수도 있다',{support:7,spectrum:-15},'현장형'),O('절충안을 문서로 만든다','조직과 현장을 연결',{study:7,network:3},'조정가')]},
 {id:'extra-41-a',age:41,title:'방송국 긴급 인터뷰',text:'과거 발언을 인용한 질문이 갑자기 들어왔다.',type:'debate',choices:[O('원문과 사실을 공개한다','신뢰를 지킨다',{support:6,study:3},'투명성'),O('강한 구호로 반격한다','관심을 얻지만 평가가 갈린다',{support:8,mind:-5,spectrum:24},'공격적 발언'),O('직접 사과한다','책임 있는 태도',{support:5,mind:4},'책임감')]},
 {id:'extra-41-b',age:41,title:'지역 현안과 중앙당 노선',text:'사업의 예산을 두고 정당과 주민들이 충돌하고 있다.',type:'debate',choices:[O('재정을 줄여야 한다','성장·긴축 중시',{money:130,spectrum:31,support:-2},'긴축 주장'),O('공공 지원을 늘리자','분배 중시',{support:7,spectrum:-31,money:-200},'공공 지원'),O('세부 항목을 다시 검토','합의와 재원',{study:7,network:5},'현실적 조정')]}
 ];
const birthEvent={id:'birth',age:0,title:'당신이 태어났다',text:'아직 선택할 수 있는 것은 없었다. 이름 하나가 세상에 생겼다.',auto:true,delta:{},trait:''};
const eventIndex = new Map([birthEvent,...events,...extra].map(e=>[e.id,e]));
function eventNow(){return eventIndex.get(state.sequence[state.cursor])}
function moneyLabel(value){
 const abs=Math.abs(value),sign=value<0?'-':'';
 if(abs>=10000){const eok=Math.floor(abs/10000),rest=abs%10000;return sign+fmt(eok)+'억'+(rest?' '+fmt(rest)+'만원':'')}
 return sign+fmt(abs)+'만원';
}
function deltaName(k,n){return labels[k]+' '+(n>0?'+':'')+(k==='money'?moneyLabel(n):n)}
function logEntry(age,title,description,delta={},trait='',category='story'){
 state.history.push({age,title,description,delta,trait,category});
}
function apply(delta={}){
 const result={};
 for(const [key,value] of Object.entries(delta)){
  if(!(key in state)||!Number.isFinite(value)||!value)continue;
  const original=state[key];
  state[key]+=value;
  if(['study','mind','support','loyalty'].includes(key))state[key]=clamp(state[key]);
  if(key==='spectrum')state[key]=clamp(state[key],-100,100);
  if(key==='network')state[key]=Math.max(0,state[key]);
  result[key]=state[key]-original;
 }
 return result;
}
function recordTrait(trait){if(trait&&!state.traits.includes(trait))state.traits.push(trait)}
function chooseSeed(arr){return arr[(state.seedInitial+state.cursor+Math.floor(state.study/14))%arr.length]}
function nickname(){
 if(state.end==='expelled')return'제명된 전직 정치인';
 if(state.end==='prison')return'옛 계약서의 주인공';
 if(state.age<=3)return'미래의 씨앗';
 if(state.age<=10)return state.traits.includes('붙임성')?'동네 인기쟁이':'내일이 궁금한 어린이';
 if(state.age<=15)return state.spectrum < -20?'혁명을 꿈꾸는 중학생':'도약을 준비하는 중학생';
 if(state.age<=19)return state.study>=72?'모의고사 고수':'진학을 고민하는 학생';
 if(state.age<26)return state.money<0?'학자금에 쫓기는 대학생':'꿈과 통장 사이의 청년';
 if(state.age<30)return state.network>35?'사람을 모으는 사회인':'첫 경력을 쌓는 사회인';
 if(state.age<39)return state.party==='무소속'?'독립 정치인':state.loyalty<35?'당론과 싸우는 신인':'도약을 준비하는 정치인';
 if(state.age<47)return state.flags.nationalWin?'여의도의 새로운 얼굴':state.flags.localLeader?'지역에서 올라온 정치인':'다음을 준비하는 정치인';
 if(state.age<52)return state.flags.primaryWon?'국민의 선택을 기다리는 후보':'대선의 문턱에 선 사람';
 return state.end==='president'?'국민이 부른 당선인':state.end==='defeat'?'한 표가 아쉬운 후보':'인생의 결산을 앞둔 사람';
}
function motto(){
 if(state.end==='president')return'국민이 불렀습니다';
 if(state.end==='defeat')return'다음에는 다릅니다';
 if(state.end==='expelled')return'당에서 부름을 취소했습니다';
 if(state.party!=='무소속'&&state.age>=30){const p=parties[state.partyIndex];return state.loyalty<38?'당의 뜻과 내 뜻이 다르다':p?.motto||'지역에서 나라까지'}
 if(state.age<=10)return chooseSeed(['오늘도 장래희망은 바뀌었다','작은 선택이 쌓이는 중','미래의 씨앗']);
 if(state.age<=19)return chooseSeed(['원서를 어디에 넣을까','학교가 전부는 아니라고 하지만','교문 밖은 생각보다 넓다']);
 return chooseSeed(['언젠가 국민이 부를지도','지금은 내 생활이 먼저','선택은 아직 끝나지 않았다']);
}
function partyColor(){return state.partyIndex>=0?parties[state.partyIndex].color:'#677181'}
function resultToken(value,bad=false){const span=document.createElement('span');span.className='token '+(bad?'bad':'good');span.textContent=value;return span}
function renderLog(){
 const root=$('log');const nearBottom=root.scrollHeight-root.scrollTop-root.clientHeight<90;
 root.replaceChildren();
 for(const item of state.history){
  const article=document.createElement('article');article.className='record';
  const top=document.createElement('div');top.className='record-top';
  const age=document.createElement('span');age.className='record-age';age.textContent='#'+item.age+'살';
  const strong=document.createElement('strong');strong.textContent=item.title;
  top.append(age,strong);
  const p=document.createElement('p');p.textContent=item.description;
  const tags=document.createElement('div');tags.className='tokens';
  for(const [key,n] of Object.entries(item.delta||{}))if(n)tags.append(resultToken(deltaName(key,n),n<0));
  if(item.trait)tags.append(resultToken(item.trait));
  article.append(top,p,tags);root.append(article);
 }
 if(nearBottom)root.scrollTop=root.scrollHeight;
}
function renderStatus(){
 $('age').textContent='#'+state.age+'살';$('job').textContent=state.job;
 for(const key of ['study','mind','support']){ $(key).value=state[key];$(key+'Text').textContent=state[key]+(key==='support'?'%':'') }
 $('money').textContent=moneyLabel(state.money);$('network').textContent=fmt(state.network)+'명';
 const s=state.spectrum< -15?'진보':state.spectrum>15?'보수':'중도';
 $('spectrumText').textContent=s;$('spectrum').style.setProperty('--pos',clamp((state.spectrum+100)/2,1,99)+'%');$('spectrum').setAttribute('aria-label','정치 성향 '+s);
 $('elementary').textContent=state.age>=7?state.elementary:'입학 전';
 $('middle').textContent=state.age>=13?state.middle:'입학 전';
 $('high').textContent=state.high||'미정';$('uni').textContent=state.uni||'미정';
 $('traits').replaceChildren(...state.traits.slice(-11).map(t=>{const el=document.createElement('span');el.className='token';el.textContent=t;return el}));
 const posterData={
  color:partyColor(),partyName:state.party,
  partyIcon:state.partyIndex>=0?parties[state.partyIndex].mark:'◇',
  phrase:nickname(),stage:state.job,name:state.name,
  number:state.flags.primaryWon?(state.partyIndex>=0?state.partyIndex+1:'무'):null,
  imageSrc:state.portraitSrc||null,
  ageGroup:state.age>=45?'senior':state.age<17?'child':'adult',
  template:'solid'
 };
 const mount=$('playerPosterMount');
 if(!mount.firstElementChild)mount.append(GukminPoster.create(posterData));
 else GukminPoster.update(mount.firstElementChild,posterData);
 document.documentElement.style.setProperty('--party',partyColor());
 $('chapter').textContent=state.age<19?'성장기':state.age<30?'사회 진출':state.age<47?'정치 입문':'국민의 선택';
 if($('partyTrust')){$('partyTrust').hidden=state.partyIndex<0;$('partyTrust').textContent='당내 신뢰 '+state.loyalty+'%'}
}
function renderAction(){
 const root=$('action');root.replaceChildren();
 if(state.end){
  const h=document.createElement('div');h.className='ending';h.textContent=state.endTitle;
  const d=document.createElement('p');d.className='ending-detail';d.textContent=state.endDetail;
  const buttons=document.createElement('div');buttons.className='end-actions';
  const png=document.createElement('button');png.type='button';png.className='advance';png.textContent='결과 카드 PNG 저장 ↓';png.onclick=downloadResult;
  const again=document.createElement('button');again.type='button';again.className='advance secondary';again.textContent='다른 인생 시작 ↻';again.onclick=()=>newLife(false);
  buttons.append(png,again);root.append(h,d,buttons);return;
 }
 const event=eventNow();if(!event)return;
 const header=document.createElement('div');header.className='current-line';
 const age=document.createElement('span');age.textContent='#'+event.age+'살';
 const title=document.createElement('strong');title.textContent=event.title;header.append(age,title);
 const btn=document.createElement('button');btn.type='button';btn.className='advance';btn.innerHTML='<span></span><span aria-hidden="true">↗</span>';
 btn.firstElementChild.textContent=event.auto?'시간을 넘긴다':event.type==='school'?'진학할 학교를 고른다':event.type==='party'?'입당할 정당을 고른다':'결정의 순간';
 btn.onclick=event.auto?advanceAuto:openChoice;
 const hint=document.createElement('div');hint.className='fine';hint.textContent=event.auto?'삶은 선택을 기다리지 않을 때도 있습니다':'선택과 특성이 미래의 사건과 기회에 영향을 줍니다';
 root.append(header,btn,hint);
}
function render(){renderStatus();renderLog();renderAction();save()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s||s.version!==1||!Array.isArray(s.history)||!Array.isArray(s.traits)||!Array.isArray(s.sequence)||!s.history.every(e=>typeof e.title==='string')||!s.sequence.every(id=>eventIndex.has(id))||!Number.isInteger(s.cursor)||s.cursor<0||s.cursor>s.sequence.length)return false;state=s;return true}catch(e){return false}}
function enterNext(){
 if(state.cursor>=state.sequence.length){finishElection();return}
 const e=eventNow();state.age=e.age;
 state.job=state.age>=7&&state.age<=19?'학생':state.job;
 if(state.age>=22&&state.job==='학생')state.job='진로 탐색 중';
 if(state.lastEvent!==e.id){logEntry(e.age,e.title,e.text,{},'', 'scene');state.lastEvent=e.id}
 render();
}
function advanceAuto(){
 const e=eventNow(),r=e.resolve?e.resolve(state):e;
 const changes=apply(r.delta);recordTrait(r.trait);
 logEntry(e.age,'세월이 흘렀다',r.text||e.text,changes,r.trait,'result');
 state.cursor++;enterNext();
}
function canPick(choice){return choice.require?choice.require(state):''}
function optChips(choice){
 const tokens=document.createElement('span');tokens.className='choice-tags';
 for(const [key,v]of Object.entries(choice.delta||{})){
  if(!v)continue;
  const t=resultToken(deltaName(key,v),v<0&&key!=='spectrum');tokens.append(t);
 }
 if(choice.trait){tokens.append(resultToken(choice.trait))}
 return tokens;
}
function openChoice(){
 const e=eventNow();if(!e||e.auto)return;chosen=-1;
 const dialog=$('choiceDialog');dialog.className=e.type==='party'?'ballot-dialog':e.type==='school'?'school-dialog':'';
 const category={school:'진학 지원서',party:'정당 가입',career:'직업 선택',debate:'공개 발언',letter:'인생의 갈림길'};
 $('kicker').textContent='#'+e.age+'살 · '+(category[e.type]||'인생 선택');
 $('modalTitle').textContent=e.age===16?'진학 고등학교 선택':e.title;
 $('modalStory').textContent=e.age===16?'본인이 진학할 고등학교를 선택하시오.\n'+e.text:e.text;
 $('summary').textContent='선택하세요';$('confirm').disabled=true;
 $('confirm').textContent=e.type==='party'?'입당하기':e.type==='school'?'지원하기':e.type==='career'?'직업 선택':'결정하기';
 const list=$('options');list.className=e.type==='party'?'ballot-paper':'options';list.replaceChildren();
 if(e.type==='party'){const heading=document.createElement('div');heading.className='ballot-title';heading.textContent='정 당 선 택';list.append(heading)}
 if(e.type==='letter'){const letter=document.createElement('div');letter.className='letter';letter.textContent='당장의 이익과 훗날의 기록은 다를 수 있습니다';list.append(letter)}
 e.choices.forEach((c,i)=>{
  const locked=canPick(c);const btn=document.createElement('button');btn.type='button';btn.dataset.pick=String(i);btn.className=e.type==='party'?'ballot-row':'option';btn.setAttribute('aria-pressed','false');btn.disabled=!!locked;
  if(e.type==='party'){
   const number=document.createElement('span');number.className='ballot-no';number.textContent=i<5?String(i+1):'無';
   const wrap=document.createElement('span');wrap.className='ballot-party';
   const emblem=document.createElement('span');emblem.className='party-mark';emblem.style.setProperty('--color',c.color);emblem.textContent=c.mark;
   const descr=document.createElement('span');const strong=document.createElement('strong');strong.textContent=c.name;const small=document.createElement('small');small.textContent=c.desc;descr.append(strong,small, optChips(c));wrap.append(emblem,descr);
   const stampBox=document.createElement('span');stampBox.className='stamp-box';const stamp=document.createElement('span');stamp.className='stamp';stamp.textContent='卜';stampBox.append(stamp);
   btn.append(number,wrap,stampBox);
  }else{
   if(e.type==='school'){
    const crest=document.createElement('span');crest.className='crest';crest.style.setProperty('--school',c.color||'#baaa84');const mark=document.createElement('span');mark.textContent=c.crest||'學';crest.append(mark);btn.append(crest);
   } else if(e.type==='career') {const ico=document.createElement('span');ico.className='job-icon';ico.textContent='職';btn.append(ico)}
   else if(e.type==='debate'){const ico=document.createElement('span');ico.className='debate-number';ico.textContent=String(i+1);btn.append(ico)}
   const text=document.createElement('span');text.className='option-text';const strong=document.createElement('strong');strong.className=e.type==='school'?'school-name':'';strong.textContent=c.name;const small=document.createElement('small');small.textContent=c.desc;text.append(strong,small,optChips(c));
   if(locked){const reason=document.createElement('span');reason.className='locked';reason.textContent=locked;text.append(reason)}
   const check=document.createElement('span');check.className='check';check.textContent='✓';btn.append(text,check);
  }
  btn.onclick=()=>{if(btn.disabled)return;chosen=i;list.querySelectorAll('[data-pick]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));$('summary').textContent=c.name;$('confirm').disabled=false};
  list.append(btn);
 });
 dialog.showModal();
}
function partyCompatibility(delta){
 if(state.partyIndex<0)return '';
 const p=parties[state.partyIndex];
 const distance=Math.abs(state.spectrum-p.ideology);
 const directional=Number(delta?.spectrum||0);
 if(distance>35&&Math.abs(directional)>=8){const penalty=Math.max(5,Math.round((distance-28)*.13+Math.abs(directional)*.28));state.loyalty=clamp(state.loyalty-penalty);const txt='당론과 충돌해 신뢰 −'+penalty;
  if(state.loyalty<=12){state.flags.expelled=true;return txt+' · 정당에서 제명 통보가 왔다.'}
  return txt;
 }
 if(distance<22)state.loyalty=clamp(state.loyalty+3);
 return '';
}
function setParty(choice){
 const id=choice.partyIndex;
 state.partyIndex=id;state.party=id>=0?parties[id].name:'무소속';state.loyalty=id>=0?clamp(92-Math.abs(state.spectrum-parties[id].ideology)*.27,38,96):100;
}
function decide(){
 if(chosen<0||state.end)return;
 const e=eventNow(),choice=e?.choices[chosen];if(!choice||canPick(choice))return;
 const changes=apply(choice.delta);recordTrait(choice.trait);
 if(e.type==='party')setParty(choice);
 if(e.target)state[e.target]=choice.name;
 if(choice.job)state.job=choice.job;
 let resultText=choice.name+' — '+choice.desc;
 if(e.age===28&&chosen===0&&state.traits.includes('말솜씨')){Object.assign(changes,apply({support:4}));resultText+=' · 말솜씨가 도움이 됐다.'}
 if(e.age===28&&chosen===1&&state.traits.includes('행정 지식')){Object.assign(changes,apply({support:4}));resultText+=' · 행정 지식이 도움이 됐다.'}
 if(e.age===34&&chosen===0&&state.traits.includes('주민 대표'))Object.assign(changes,apply({network:5}));
 if(e.age===39&&chosen===0&&state.traits.includes('지역의 아들'))Object.assign(changes,apply({support:5}));
 if(e.age===52&&chosen===0&&state.traits.includes('깨끗한 손'))Object.assign(changes,apply({support:5}));
 if(e.age===52&&chosen===1&&state.traits.includes('현장 경험'))Object.assign(changes,apply({support:5}));
 if(e.age===30){resultText+=' · '+(state.partyIndex>=0?'당원으로 입당했다.':'독립 정치인으로 남기로 했다.')}
 else if(state.partyIndex>=0){const feedback=partyCompatibility(choice.delta);if(feedback)resultText+=' · '+feedback}
 if(e.age===39){
  const chance=clamp(17+state.support*.39+state.network*.19+state.study*.1+state.money/1600-(state.partyIndex<0?8:0),8,85);
  const win=random()*100<chance;
  state.flags.nationalWin=win;state.job=win?'국회의원':'선거 낙선 후 지역 활동가';
  resultText+=win?' · 지역구 선거에 당선됐다.':' · 국회의원 선거에서는 낙선했다.';
  Object.assign(changes,apply(win?{support:8,network:8}:{support:-5,mind:-8}));
 }
 if(e.age===43&&chosen===2)state.flags.corrupt=true;
 if(e.age===47){
  const chance=clamp(7+state.support*.40+state.network*.28+state.study*.1+(state.flags.nationalWin?17:0)+(state.partyIndex>=0?5:-10)+(state.loyalty-50)*.1,6,88);
  const win=random()*100<chance;
  state.flags.primaryWon=win;state.job=win?'대통령 후보':'경선 탈락 정치인';
  resultText+=win?' · 당내 후보 경선을 통과했다!':' · 당내 후보 경선에서 탈락했다.';
 }
 logEntry(e.age,'선택: '+choice.name,resultText,changes,choice.trait,'choice');
 $('choiceDialog').close();chosen=-1;
 if(state.flags.expelled){finish('expelled','제명된 정치인','당론과 지속적으로 충돌해 당의 신뢰를 잃고 제명됐다.');return}
 if(e.age===47&&!state.flags.primaryWon){finish('primary','대선 경선 탈락','정당의 선택을 받지 못했다. 다른 길이 남아 있을지도 모른다.');return}
 state.cursor++;enterNext();
}
function finish(kind,title,detail){state.end=kind;state.endTitle=title;state.endDetail=detail;logEntry(state.age,title,detail,{},'인생 결과','ending');render()}
function finishElection(){
 if(state.flags.corrupt&&state.traits.includes('후원금 논란')&&state.support<18){finish('prison','법적 책임과 정치 인생의 끝','과거의 부정한 후원 거래가 확인되어 정치 인생이 끝났다.');return}
 if(!state.flags.primaryWon){finish('career','대통령보다 가까운 사람','선거에 도전하지 못했지만 여러 사람과 삶을 나눴다.');return}
 const support=state.support,network=state.network;
 const partyBonus=state.partyIndex>=0?Math.max(-8,Math.min(6,(state.loyalty-50)/8)): -3;
 const share=clamp(20+support*.24+network*.07+state.study*.035+partyBonus+(random()-.5)*16,17,65);
 const win=share>=50;
 state.support=share;state.job=win?'대통령 당선인':'대선 후보';
 finish(win?'president':'defeat',win?'대통령 당선!':'대통령 선거 낙선',`가상 전국 득표율 ${share}% · ${state.party} · 누적 특성 ${state.traits.length}개`);
}
function createSequence(){
 const selections=[8,17,24,33,41].map((age,i)=>{const group=extra.filter(e=>e.age===age);return group[Math.floor(random()*group.length)]});
 return [birthEvent,...events,...selections].sort((a,b)=>a.age-b.age).map(e=>e.id);
}
function newLife(ask=true){
 if(ask&&state&&!state.end&&!confirm('현재 인생을 초기화할까?'))return;
 let seed=Math.floor(Math.random()*4294967295)>>>0;if(!seed)seed=997319;
 state={version:1,seed,seedInitial:seed%17,age:0,study:45+Math.floor(Math.random()*11),mind:70,support:0,money:0,network:0,spectrum:0,job:'아기',party:'무소속',partyIndex:-1,loyalty:100,high:'',uni:'',elementary:'수원초',middle:'수원중',traits:[],cursor:0,history:[],sequence:[],lastEvent:null,flags:{nationalWin:false,primaryWon:false,corrupt:false,expelled:false},end:null,endTitle:'',endDetail:''};
 const family=randItem(families);state.background=family;state.study=clamp(state.study+family.study);state.mind=clamp(state.mind+family.mind);state.money=family.money;state.network=family.network;recordTrait(family.trait);
 state.name=randItem(names);state.elementary=family.place.split(' ').slice(-1)[0]+'초';state.middle=family.place.split(' ').slice(-1)[0]+'중';
 state.sequence=createSequence();
 logEntry(0,family.place+'에서 태어났다',family.description,{},family.trait,'birth');
 enterNext();
}
function downloadResult(){
 try{
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1120;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas unsupported');
  ctx.fillStyle=partyColor();ctx.fillRect(0,0,900,1120);
  ctx.strokeStyle='#ffffff40';ctx.lineWidth=4;ctx.beginPath();ctx.arc(710,420,320,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='bold 45px sans-serif';ctx.fillText('국민의 부름',50,95);ctx.font='bold 19px sans-serif';ctx.fillText('THE PEOPLE CALL',50,135);
  ctx.fillStyle='#12181f';ctx.beginPath();ctx.ellipse(660,475,95,120,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(650,810,225,255,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='white';ctx.font='bold 48px sans-serif';ctx.fillText(state.endTitle,50,790);ctx.font='bold 90px sans-serif';ctx.fillText(state.name,50,900);
  ctx.font='bold 27px sans-serif';ctx.fillText(state.party,53,952);ctx.fillText(state.endDetail.slice(0,39),53,1030);
  canvas.toBlob(blob=>{if(!blob)throw Error('blob empty');const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='국민의부름-'+state.name+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1800)},'image/png');
 }catch(e){alert('이미지를 저장하지 못했어. 결과 화면을 캡처해 줘.')}
}
$('resetGame').onclick=()=>newLife(true);
$('close').onclick=()=>$('choiceDialog').close();
$('confirm').onclick=decide;
$('choiceDialog').addEventListener('close',()=>{chosen=-1});
document.addEventListener('keydown',e=>{
 if(e.target.matches('input,textarea'))return;
 if($('choiceDialog').open&&/^[1-6]$/.test(e.key)){const btn=$('options').querySelector(`[data-pick="${Number(e.key)-1}"]`);if(btn&&!btn.disabled)btn.click()}
 else if($('choiceDialog').open&&e.key==='Enter'&&!$('confirm').disabled){e.preventDefault();decide()}
 else if(e.key==='Enter'&&!$('choiceDialog').open){const advance=$('action').querySelector('.advance');if(advance)advance.click()}
});
if(load())render();else newLife(false);
})();
