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
const gifted=new Set(['광주과학고등학교','세종과학예술영재학교']);
const international=new Set(['고양국제고등학교']);
const vocational=new Set(['경기물류고등학교']);
const autonomousPublic=new Set(['현화고등학교']);
function kindOf(name){
 if(gifted.has(name))return 'gifted';
 if(international.has(name))return 'international';
 if(vocational.has(name))return 'vocational';
 if(autonomousPublic.has(name))return 'autonomous-public';
 if(autonomous.has(name))return 'autonomous';
 if(name.includes('외국어고등학교'))return 'foreign';
 return 'general';
}
const typeLabels=Object.freeze({
 general:'일반고 (게임 내 지역 배정 희망)',
 autonomous:'자율형 사립고 (개별 입학전형)',
 foreign:'외국어고 (개별 입학전형)',
 international:'국제고 (개별 입학전형)',
 gifted:'영재학교 (별도 영재 선발)',
 vocational:'특성화고 (직업교육·별도 입학전형)',
 'autonomous-public':'자율형 공립고 (지역·학교 전형)'
});
function school(id,name,region){
 const kind=kindOf(name);
 const minScore=kind==='gifted'?82:kind==='autonomous'?66:
   ['foreign','international'].includes(kind)?72:0;
 const minStudy=kind==='gifted'?78:kind==='autonomous'?55:
   ['foreign','international'].includes(kind)?65:0;
 return Object.freeze({
  id,name,region,kind,minScore,minStudy,
  focus:kind==='foreign'?'외국어 중심':kind==='international'?'국제교류 중심':
    kind==='gifted'?'수학·과학 탐구 중심':
    kind==='vocational'?'물류·산업 관련 직업교육':
    kind==='autonomous-public'?'학교별 특화 교육과정':'일반적인 교과 선택과 학교생활',
  // Game-only pace, never a factual rating of the school's quality/difficulty.
  load:kind==='gifted'?3:['general','vocational','autonomous-public'].includes(kind)?1:2,
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
function options(persona){
 const region=regionOf(persona);
 if(region==='gyeonggi'){
  const key=Object.keys(localGyeonggi).find(key=>(persona.birthplaceId||'').includes(key));
  if(key)return localGyeonggi[key].map((name,index)=>school('gyeonggi-'+key+'-'+index,name,region));
 }
 return [...schools[region]];
}
global.GukminSchools=Object.freeze({groups:schools,regionOf,options,typeLabels});
})(window);
