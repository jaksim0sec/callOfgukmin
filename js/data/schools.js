/* Real-name school sample by region; game-only admissions and impact numbers. */
(function(global){
'use strict';
const groups={"seoul":["서울고등학교","휘문고등학교","대원외국어고등학교"],"busan":["부산고등학교","해운대고등학교","부산외국어고등학교"],"daegu":["대구고등학교","경신고등학교","대구외국어고등학교"],"incheon":["인천고등학교","제물포고등학교","인천외국어고등학교"],"gwangju":["광주고등학교","광주제일고등학교","광주과학고등학교"],"daejeon":["충남고등학교","대전고등학교","대전외국어고등학교"],"ulsan":["학성고등학교","울산중앙고등학교","울산외국어고등학교"],"sejong":["세종고등학교","도담고등학교","세종과학예술영재학교"],"gyeonggi":["분당중앙고등학교","분당고등학교","성남외국어고등학교"],"gangwon":["춘천고등학교","강릉고등학교","강원외국어고등학교"],"chungbuk":["청주고등학교","충북고등학교","청주외국어고등학교"],"chungnam":["천안고등학교","북일고등학교","충남외국어고등학교"],"jeonbuk":["전주고등학교","전주신흥고등학교","전북외국어고등학교"],"jeonnam":["목포고등학교","순천고등학교","전남외국어고등학교"],"gyeongbuk":["포항고등학교","경주고등학교","경북외국어고등학교"],"gyeongnam":["창원고등학교","마산고등학교","경남외국어고등학교"],"jeju":["제주제일고등학교","제주중앙고등학교","제주외국어고등학교"]};
const known={"서울고등학교":"https://www.schoolinfo.go.kr/Main.do","휘문고등학교":"https://www.schoolinfo.go.kr/Main.do","대원외국어고등학교":"https://dwfl.hs.kr/","부산고등학교":"https://busan.hs.kr/","부산외국어고등학교":"https://www.pfl.hs.kr/","분당중앙고등학교":"https://bdja-h.goesn.kr/","분당고등학교":"https://www.goesn.kr/sngg/main.do","성남외국어고등학교":"https://www.goesn.kr/sngg/main.do"};
const logos={
 '대원외국어고등학교':'https://cdn.kyobit.com/news/photo/202504/208_251_5036.png',
 '성남외국어고등학교':'https://m.zsm.kr/web/product/big/201902/cd3fc05f9bf15619c0c47e41fe5f8908.jpg'
};
const schools=Object.freeze(Object.fromEntries(Object.entries(groups).map(([region,names])=>[
 region,Object.freeze(names.map((name,index)=>{
  const kind=index===2?(name.includes('과학')?'gifted':'foreign'):(index===1?'general-2':'general');
  return Object.freeze({id:region+'-'+index,name,region,kind,
   minScore:index===2?74:0,minStudy:index===2?68:0,
   focus:index===2?'전공·어학 선택형':'일반 교육과정',
   load:index===2?3:index===1?2:1,
   symbol:name.replace('고등학교','').slice(0,2),
   source:known[name]||'https://www.schoolinfo.go.kr/Main.do',
   verified:!!known[name],logoUrl:logos[name]||null
  });
 }))
])));
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
 let region=regionOf(persona);
 let list=[...schools[region]];
 // Keep ordinary choices geographically narrower where local verification exists.
 if(region==='gyeonggi'&&!/성남시/.test(persona.birthplaceId||'')){
  const name=/수원시/.test(persona.birthplaceId||'')?'영덕고등학교':/고양시/.test(persona.birthplaceId||'')?'백마고등학교':'경기도 공립 일반고 배정';
  list=[{...list[0],id:'gyeonggi-local',name,symbol:'지역',verified:name!=='경기도 공립 일반고 배정',source:'https://www.goe.go.kr/',logoUrl:null},...list.slice(1)];
 }
 return list;
}
global.GukminSchools=Object.freeze({groups:schools,regionOf,options});
})(window);
