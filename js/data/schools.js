/* Real-name school sample by region; game-only admissions and impact numbers. */
(function(global){
'use strict';
const groups={"seoul":["서울고등학교","휘문고등학교","대원외국어고등학교"],"busan":["부산고등학교","해운대고등학교","부산외국어고등학교"],"daegu":["대구고등학교","경신고등학교","대구외국어고등학교"],"incheon":["인천고등학교","제물포고등학교","인천외국어고등학교"],"gwangju":["광주고등학교","광주제일고등학교","광주과학고등학교"],"daejeon":["충남고등학교","대전고등학교","대전외국어고등학교"],"ulsan":["학성고등학교","울산중앙고등학교","울산외국어고등학교"],"sejong":["세종고등학교","도담고등학교","세종과학예술영재학교"],"gyeonggi":["분당중앙고등학교","분당고등학교","성남외국어고등학교"],"gangwon":["춘천고등학교","강릉고등학교","강원외국어고등학교"],"chungbuk":["청주고등학교","충북고등학교","청주외국어고등학교"],"chungnam":["천안고등학교","북일고등학교","충남외국어고등학교"],"jeonbuk":["전주고등학교","전주신흥고등학교","전북외국어고등학교"],"jeonnam":["목포고등학교","순천고등학교","전남외국어고등학교"],"gyeongbuk":["포항고등학교","경주고등학교","경북외국어고등학교"],"gyeongnam":["창원고등학교","마산고등학교","경남외국어고등학교"],"jeju":["제주제일고등학교","제주중앙고등학교","제주외국어고등학교"]};
// School names are candidate samples. School-wide ratings and guaranteed admission do not exist.
const checked=Object.freeze({
 '휘문고등학교':'https://www.hischool.go.kr/study/enforce.jsp',
 '해운대고등학교':'https://www.hischool.go.kr/study/enforce.jsp',
 '북일고등학교':'https://www.hischool.go.kr/study/enforce.jsp',
 '대원외국어고등학교':'https://www.dwfl.hs.kr/',
 '부산외국어고등학교':'https://school.busanedu.net/pfl-h/main.do',
 '분당중앙고등학교':'https://bdja-h.goesn.kr/',
 '분당고등학교':'https://bundang-h.goesn.kr/',
 '성남외국어고등학교':'https://snfl-h.goesn.kr/',
 '세종과학예술영재학교':'https://sasa.sjeduhs.kr/',
 '영덕고등학교':'https://www.goesw.kr/goesw/cm/cntnts/cntntsView.do?cntntsId=3954&mi=19607',
 '매탄고등학교':'https://www.goesw.kr/goesw/cm/cntnts/cntntsView.do?cntntsId=3954&mi=19607',
 '수원외국어고등학교':'https://www.goesw.kr/goesw/cm/cntnts/cntntsView.do?cntntsId=3954&mi=19607',
 '백마고등학교':'https://baekma-h.goegy.kr/',
 '고양동산고등학교':'https://www.goegy.kr/goegy/ssm/scholStts/selectScholTblList.do?mi=22046',
 '고양국제고등학교':'https://www.goegy.kr/goegy/ssm/scholStts/selectScholTblList.do?mi=22046',
 '현화고등학교':'https://hyeonhwa-h.goept.kr/',
 '비전고등학교':'https://www.goept.kr/goept/ssm/scholStts/selectScholSttsList.do?mi=10245',
 '경기물류고등학교':'https://www.goept.kr/goept/na/ntt/selectNttInfo.do?bbsId=10070&mi=10055&nttSn=2548226'
});
const autonomous=new Set(['휘문고등학교','해운대고등학교','북일고등학교']);
const gifted=new Set([
 '광주과학고등학교','세종과학예술영재학교','서울과학고등학교',
 '경기과학고등학교','대구과학고등학교','대전과학고등학교',
 '인천과학예술영재학교','한국과학영재학교'
]);
const international=new Set(['고양국제고등학교']);
const vocational=new Set(['경기물류고등학교']);
const autonomousPublic=new Set(['현화고등학교']);
function kindOf(name){
 if(gifted.has(name))return 'gifted';
 if(international.has(name))return 'international';
 if(vocational.has(name))return 'vocational';
 if(autonomousPublic.has(name))return 'autonomous-public';
 if(autonomous.has(name))return 'autonomous';
 if(name.includes('과학고등학교'))return 'science';
 if(name.includes('외국어고등학교'))return 'foreign';
 return 'general';
}
const typeLabels=Object.freeze({
 general:'일반고 (지역 배정 희망)',
 autonomous:'자율형 사립고 (개별 입학전형)',
 foreign:'외국어고 (개별 입학전형)',
 science:'과학고 (과학계열 특수목적고)',
 international:'국제고 (개별 입학전형)',
 gifted:'영재학교 (별도 영재 선발)',
 vocational:'특성화고 (직업교육·별도 입학전형)',
 'autonomous-public':'자율형 공립고 (지역·학교 전형)'
});
function school(id,name,region){
 const kind=kindOf(name);
 const minScore=kind==='gifted'?23:kind==='science'?22:kind==='autonomous'?17:
   ['foreign','international'].includes(kind)?18:0;
 const minStudy=kind==='gifted'?20:kind==='science'?17:kind==='autonomous'?14:
   ['foreign','international'].includes(kind)?17:0;
 return Object.freeze({
  id,name,region,kind,minScore,minStudy,
  focus:kind==='foreign'?'외국어 중심':kind==='international'?'국제교류 중심':
    kind==='gifted'?'수학·과학 탐구 중심':
    kind==='science'?'수학·과학 심화 탐구 중심':
    kind==='vocational'?'물류·산업 관련 직업교육':
    kind==='autonomous-public'?'학교별 특화 교육과정':'일반적인 교과 선택과 학교생활',
  // Game-only pace, never a factual rating of the school's quality/difficulty.
  load:['gifted','science'].includes(kind)?3:['general','vocational','autonomous-public'].includes(kind)?1:2,
  symbol:name.replace(/고등학교$/,'').slice(0,2),
  // Named-program stories require a publicly documented school activity.
  program:name==='분당중앙고등학교'?'bdja-science':
    name==='휘문고등학교'?'whimoon-electives':kind,
  source:checked[name]||'https://hischool.go.kr/',
  verified:Object.hasOwn(checked,name),
  logoUrl:null,typeLabel:typeLabels[kind]
 });
}
const schools=Object.freeze(Object.fromEntries(Object.entries(groups).map(([region,names])=>[
 region,Object.freeze(names.map((name,index)=>school(region+'-'+index,name,region)))
])));
const localGyeonggi=Object.freeze({
 '성남시':Object.freeze(['분당중앙고등학교','분당고등학교','성남외국어고등학교']),
 '수원시':Object.freeze(['영덕고등학교','매탄고등학교','수원외국어고등학교']),
 '고양시':Object.freeze(['백마고등학교','고양동산고등학교','고양국제고등학교']),
 '평택시':Object.freeze(['현화고등학교','비전고등학교','경기물류고등학교'])
});
function regionOf(persona){
 const id=persona.birthplaceId||'',tags=persona.regionTags||[];
 if(tags.includes('광주권'))return 'gwangju';
 if(tags.includes('전남권'))return 'jeonnam';
 const pairs=[['서울특별시','seoul'],['부산광역시','busan'],['대구광역시','daegu'],
 ['인천광역시','incheon'],['대전광역시','daejeon'],['울산광역시','ulsan'],
 ['세종특별자치시','sejong'],['경기도','gyeonggi'],
 ['강원특별자치도','gangwon'],['강원도','gangwon'],['충청북도','chungbuk'],
 ['충청남도','chungnam'],['전북특별자치도','jeonbuk'],['전라북도','jeonbuk'],
 ['경상북도','gyeongbuk'],['경상남도','gyeongnam'],['제주특별자치도','jeju']];
 return (pairs.find(([prefix])=>id.startsWith(prefix))||[])[1]||'gyeonggi';
}
// A real-name 2026 science-school catalogue. Geographic points without an exact
// verified school coordinate are approximate city anchors for game distance only.
const scienceSites=Object.freeze([
 ['한성과학고등학교','seoul','서울 서대문구',37.5760738,126.9525184,'school'],
 ['세종과학고등학교','seoul','서울 구로구',37.4975694,126.8273518,'school'],
 ['경기북과학고등학교','gyeonggi','경기 의정부시',37.76,127.02,'city'],
 ['인천과학고등학교','incheon','인천 영종구',37.49,126.50,'city'],
 ['인천진산과학고등학교','incheon','인천 부평구',37.5132725,126.743655,'school'],
 ['부산과학고등학교','busan','부산 금정구',35.2635334,129.0825529,'school'],
 ['부산일과학고등학교','busan','부산 사하구',35.08,128.97,'city'],
 ['대구일과학고등학교','daegu','대구 동구',35.89,128.73,'city'],
 ['대전동신과학고등학교','daejeon','대전 동구',36.32,127.47,'city'],
 ['울산과학고등학교','ulsan','울산',35.54,129.31,'city'],
 ['강원과학고등학교','gangwon','강원 원주시',37.35,127.95,'city'],
 ['충북과학고등학교','chungbuk','충북 청주시',36.64,127.49,'city'],
 ['충남과학고등학교','chungnam','충남 공주시',36.45,127.12,'city'],
 ['전북과학고등학교','jeonbuk','전북 익산시',35.95,126.96,'city'],
 ['전남과학고등학교','jeonnam','전남 나주시',35.03,126.71,'city'],
 ['경북과학고등학교','gyeongbuk','경북 포항시',36.03,129.36,'city'],
 ['경산과학고등학교','gyeongbuk','경북 경산시',35.82,128.74,'city'],
 ['경남과학고등학교','gyeongnam','경남 진주시',35.18,128.10,'city'],
 ['창원과학고등학교','gyeongnam','경남 창원시',35.22,128.68,'city'],
 ['제주과학고등학교','jeju','제주 제주시',33.5,126.53,'city']
]);
const areaCenters=Object.freeze({
 seoul:[37.56,126.98],busan:[35.18,129.07],daegu:[35.87,128.60],incheon:[37.46,126.70],
 daejeon:[36.35,127.38],ulsan:[35.54,129.31],sejong:[36.50,127.27],gyeonggi:[37.41,127.13],
 gangwon:[37.55,128.23],chungbuk:[36.64,127.49],chungnam:[36.60,126.80],
 jeonbuk:[35.82,127.15],jeonnam:[34.82,126.50],gwangju:[35.16,126.85],
 gyeongbuk:[36.58,128.51],gyeongnam:[35.23,128.70],jeju:[33.49,126.53]
});
const localCenters=Object.freeze({
 '성남시':[37.42,127.12],'수원시':[37.26,127.03],'평택시':[36.99,127.11],
 '천안시':[36.81,127.15],'아산시':[36.79,127.0],'태안군':[36.75,126.30],
 '춘천시':[37.88,127.73],'강릉시':[37.75,128.90],'원주시':[37.35,127.95],
 '청주시':[36.64,127.49],'충주시':[36.99,127.93],'제천시':[37.13,128.19],
 '전주시':[35.82,127.15],'군산시':[35.97,126.74],'익산시':[35.95,126.96],
 '포항시':[36.03,129.36],'경주시':[35.86,129.23],'구미시':[36.12,128.34],
 '창원시':[35.23,128.70],'진주시':[35.18,128.10],'통영시':[34.85,128.43],
 '제주시':[33.50,126.53],'서귀포시':[33.25,126.56],
 '여수시':[34.76,127.66],'순천시':[34.95,127.49],'목포시':[34.81,126.39],
 '강남구':[37.52,127.05],'송파구':[37.51,127.11],'마포구':[37.56,126.91],
 '연수구':[37.41,126.68],'영종구':[37.49,126.51],'강화군':[37.75,126.49],
 '해운대구':[35.16,129.16],'영도구':[35.09,129.07],'기장군':[35.25,129.22],
 '광산구':[35.14,126.79],'서구':[35.15,126.89],'북구':[35.18,126.91]
});
function approxBirthPoint(persona){
 const id=persona.birthplaceId||'',district=id.split('.')[1];
 return localCenters[district]||areaCenters[regionOf(persona)]||areaCenters.gyeonggi;
}
function kmBetween(a,b){
 const rad=Math.PI/180,dLat=(a[0]-b[0])*rad,dLon=(a[1]-b[1])*rad;
 const h=Math.sin(dLat/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin(dLon/2)**2;
 return Math.round(6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)));
}
function nearestScience(persona){
 const origin=approxBirthPoint(persona);
 const matches=scienceSites.map((s,index)=>({s,index,km:kmBetween(origin,[s[3],s[4]])}))
  .sort((a,b)=>a.km-b.km||a.index-b.index);
 const {s,index,km}=matches[0];
 // A rough monthly transport/living estimate, NOT admission tuition or personal-wallet price.
 const travelCost=km<=35?70000:km<=85?180000:450000;
 return Object.freeze({...school('science-'+index,s[0],s[1]),travelCost,distanceKm:km,
  travelMode:km<=35?'통학 가능권(추정)':km<=85?'장거리 이동 가능권(추정)':'원거리 · 기숙사 제공 여부 확인',
  distanceKind:'지역 중심 추정',schoolArea:s[2],pointQuality:s[5]});
}
function options(persona){
 const region=regionOf(persona);
 let local=[...schools[region]];
 if(region==='gyeonggi'){
  const key=Object.keys(localGyeonggi).find(key=>(persona.birthplaceId||'').includes(key));
  if(key)local=localGyeonggi[key].map((name,index)=>school('gyeonggi-'+key+'-'+index,name,region));
 }
 const nearby=nearestScience(persona);
 return local.some(s=>s.name===nearby.name)?local:[...local,nearby];
}
global.GukminSchools=Object.freeze({groups:schools,regionOf,options,typeLabels,kindOf,nearestScience,scienceSites});
})(window);
