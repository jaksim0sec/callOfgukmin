/* 국민의 부름 UI foundation — NO story advancement or gameplay calculations.
 * Keeps only persona creation, safe local persistence, presentation, and modal previews.
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'callOfgukmin__ui__v1';
const NAMES = ['이루은','유승현','최승우','강민수','김병수','김병인','윤소율','박재윤'];
const HOMES = [
 {name:'자영업 가정',place:'경기도 수원',description:'집에서 장부와 손님 이야기를 들으며 자랐다.'},
 {name:'맞벌이 가정',place:'서울',description:'가족들은 매일 각자의 일정을 부지런히 소화했다.'},
 {name:'작은 식당집',place:'부산',description:'가게에서 다양한 사람들의 이야기를 듣게 될 것이다.'},
 {name:'경제적으로 여유 있는 가정',place:'대전',description:'진로 선택의 여유가 있지만 주변의 기대도 있다.'},
 {name:'형편이 어려운 가정',place:'광주',description:'집안 형편이 넉넉하지는 않다.'}
];
const PARTIES = [
 {name:'자유국민당',icon:'▥',color:'#416f9e',number:1,desc:'성장과 책임'},
 {name:'민주혁신당',icon:'≋',color:'#be525f',number:2,desc:'복지와 개혁'},
 {name:'민생직진당',icon:'↯',color:'#b58d35',number:3,desc:'과감한 변화'},
 {name:'철벽수호당',icon:'▣',color:'#775da8',number:4,desc:'안정과 질서'},
 {name:'실용미래당',icon:'⟲',color:'#2d8a83',number:5,desc:'중도와 실용'}
];
const SCHOOLS = [
 {name:'휘문고',icon:'文',desc:'학업 중심 교육 환경',tags:['재력 −1억','성적 +10']},
 {name:'병신고',icon:'★',desc:'개성이 강한 학생들이 모이는 학교',tags:['인맥 +6','성적 −3']},
 {name:'이빨고',icon:'牙',desc:'토론과 발표 활동에 특화된 학교',tags:['말빨 +12','인지도 +5']},
 {name:'일반고',icon:'學',desc:'다양한 활동을 선택할 수 있는 학교',tags:['성적 +3','경험 +2']}
];
let current = null;
let selection = -1;
let previewKind = '';
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const text = (id,value) => {$(id).textContent = String(value ?? '');};
const make = (tag,cls,value) => {const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=String(value);return el;};
function generate(){
 const home=pick(HOMES);
 return {
   version:1, name:pick(NAMES),age:0,job:'아기',party:'무소속',partyIcon:'◇',partyColor:'#677181',number:null,portraitSrc:null,
   family:home.name,birthplace:home.place,description:home.description,
   school:{elementary:null,middle:null,high:null,uni:null},traits:[home.name],
   stats:{stress:0,health:100,study:0,speech:null,support:null,spectrum:null,money:0},
   history:[{age:0,title:'당신이 태어났다',detail:home.place+'에서 새로운 삶이 시작되었다.'},{age:0,title:'출생 배경',detail:home.description}],
   createdAt:new Date().toISOString()
 };
}
function valid(s){return !!(s&&s.version===1&&typeof s.name==='string'&&typeof s.job==='string'&&s.school&&typeof s.school==='object'&&s.stats&&typeof s.stats==='object'&&Array.isArray(s.traits)&&Array.isArray(s.history));}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(current))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(valid(s)){current=s;return true}}catch(e){}return false}
function createPersona(confirmReset=false){
 if(confirmReset&&!window.confirm('현재 인물 정보를 초기화하고 다시 생성할까?'))return;
 current=generate();save();render();
}
function setProgress(id,value){$(id).value=Number.isFinite(value)?Math.max(0,Math.min(100,value)):0;}
function render(){
 const s=current;
 text('age','#'+s.age+'살');text('job',s.job);text('chapter','기본 인물 정보');
 for(const key of ['elementary','middle','high','uni'])text(key,s.school[key]||(key==='elementary'||key==='middle'?'입학 전':'미정'));
 const traits=$('traits');traits.replaceChildren();s.traits.forEach(name=>traits.append(make('span','token token-trait',name)));
 for(const name of ['stress','health','study','speech','support']){
   const n=s.stats[name];setProgress(name,n);text(name+'Text',Number.isFinite(n)?n:(name==='speech'?'미정':'미활성'));
 }
 text('money',Number(s.stats.money||0).toLocaleString('ko-KR')+'원');
 const spectrum=s.stats.spectrum;
 text('spectrumText',Number.isFinite(spectrum)?(spectrum< -20?'좌':spectrum>20?'우':'중도'):'미활성');
 $('spectrum').style.setProperty('--pos',Number.isFinite(spectrum)?(50+spectrum/2)+'%':'50%');
 $('supportBlock').classList.toggle('gauge-locked',!Number.isFinite(s.stats.support));
 $('politicsBlock').classList.toggle('gauge-locked',!Number.isFinite(spectrum));
 const posterData={color:s.partyColor,partyName:s.party,partyIcon:s.partyIcon,phrase:'미래의 씨앗',stage:s.job,name:s.name,number:s.number,imageSrc:s.portraitSrc,ageGroup:'child',template:'solid'};
 const mount=$('playerPosterMount');if(!mount.firstElementChild)mount.append(window.GukminPoster.create(posterData));else window.GukminPoster.update(mount.firstElementChild,posterData);
 document.documentElement.style.setProperty('--party',s.partyColor);
 const log=$('log');log.replaceChildren();for(const h of s.history){const article=make('article','record');const line=make('div','record-top');line.append(make('span','record-age','#'+h.age+'살'),make('strong','',h.title));article.append(line,make('p','',h.detail));log.append(article)}
}
function openPreview(type){
 selection=-1;previewKind=type;
 const school=type==='school',dialog=$('choiceDialog');dialog.className=school?'school-dialog':'ballot-dialog';
 text('kicker',school?'진학 지원서 · 디자인 미리보기':'정당 가입 · 디자인 미리보기');
 text('modalTitle',school?'진학 고등학교 선택':'소속 정당 선택');
 text('modalStory',school?'본인이 진학할 고등학교를 선택하시오.':'입당할 정당을 선택하시오. (가상의 정당입니다.)');
 text('summary','아직 선택하지 않음');$('confirm').disabled=true;
 const list=$('options');list.className=school?'options':'ballot-paper';list.replaceChildren();
 const options=school?SCHOOLS:PARTIES;
 options.forEach((item,i)=>{
   const btn=make('button',school?'option':'ballot-row');btn.type='button';btn.setAttribute('aria-pressed','false');btn.dataset.index=String(i);
   if(school){
     const crest=make('span','crest');crest.append(make('span','',item.icon));
     const body=make('span','option-text');body.append(make('strong','school-name',item.name),make('small','',item.desc));
     const tags=make('span','choice-tags');item.tags.forEach(t=>tags.append(make('span','token',t)));body.append(tags);
     btn.append(crest,body,make('span','check','✓'));
   }else{
     const n=make('span','ballot-no',i+1),content=make('span','ballot-party'),mark=make('span','party-mark',item.icon),words=make('span','');mark.style.setProperty('--color',item.color);words.append(make('strong','',item.name),make('small','',item.desc));content.append(mark,words);
     const box=make('span','stamp-box');box.append(make('span','stamp','✓'));btn.append(n,content,box);
   }
   btn.addEventListener('click',()=>{selection=i;Array.from(list.querySelectorAll('button')).forEach((e,j)=>e.setAttribute('aria-pressed',String(j===i)));text('summary',item.name+' 선택됨 (미리보기)');$('confirm').disabled=false});
   list.append(btn);
 });
 dialog.showModal();
}
function confirmPreview(){if(selection<0)return;const item=(previewKind==='school'?SCHOOLS:PARTIES)[selection];$('choiceDialog').close();
 text('chapter',item.name+' · UI만 미리보기');
}
$('resetGame').addEventListener('click',()=>createPersona(true));
$('previewSchool').addEventListener('click',()=>openPreview('school'));
$('previewParty').addEventListener('click',()=>openPreview('party'));
$('close').addEventListener('click',()=>$('choiceDialog').close());
$('confirm').addEventListener('click',confirmPreview);
$('choiceDialog').addEventListener('close',()=>{selection=-1});
if(!load())createPersona();else render();
})();