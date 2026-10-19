/* In-game UI controller.
 * The game template is mounted by boot.js. Story advancement remains disabled.
 */
(function(global){
'use strict';
const PARTIES=[
 {name:'자유국민당',icon:'▥',color:'#416f9e',desc:'성장과 책임'},
 {name:'민주혁신당',icon:'≋',color:'#be525f',desc:'복지와 개혁'},
 {name:'민생직진당',icon:'↯',color:'#b58d35',desc:'과감한 변화'},
 {name:'철벽수호당',icon:'▣',color:'#775da8',desc:'안정과 질서'},
 {name:'실용미래당',icon:'⟲',color:'#2d8a83',desc:'중도와 실용'}
];
const SCHOOLS=[
 {name:'휘문고',icon:'文',desc:'학업 중심 교육 환경',tags:['학업 집중','지원 조건 확인']},
 {name:'병신고',icon:'★',desc:'개성이 강한 학생들이 모이는 학교',tags:['다양한 활동','특성 기회']},
 {name:'이빨고',icon:'牙',desc:'토론과 발표 활동에 특화된 학교',tags:['언변 특성','교내 활동']},
 {name:'일반고',icon:'學',desc:'다양한 활동을 선택할 수 있는 학교',tags:['균형 잡힌 교육','선택 폭']}
];
function el(tag,cls,value){
 const element=document.createElement(tag);
 if(cls)element.className=cls;
 if(value!==undefined)element.textContent=String(value);
 return element;
}
function posterData(persona){
 return {
  color:persona.partyColor,partyName:persona.party,partyIcon:persona.partyIcon,
  phrase:'미래의 씨앗',stage:persona.job,name:persona.name,number:persona.number,
  imageSrc:persona.portraitSrc,ageGroup:persona.age>=19?'adult':'child',template:'solid'
 };
}
function mount(root,navigate){
 const $=id=>root.querySelector('#'+id);
 let persona=global.GukminPlayer.ensure();
 let selection=-1,previewKind='';
 function text(id,value){const target=$(id);if(target)target.textContent=String(value??'');}
 function render(){
  global.GukminStatus.render(root,persona);
  text('chapter','기본 인물 정보');
  const host=$('playerPosterMount'),data=posterData(persona);
  if(!host.firstElementChild)host.append(global.GukminPoster.create(data));
  else global.GukminPoster.update(host.firstElementChild,data);
  document.documentElement.style.setProperty('--party',persona.partyColor||'#677181');
  const log=$('log');log.replaceChildren();
  for(const item of persona.history){
   const article=el('article','record'),line=el('div','record-top');
   line.append(el('span','record-age','#'+item.age+'살'),el('strong','',item.title));
   article.append(line,el('p','',item.detail));
   log.append(article);
  }
 }
 function reset(){
  if(!global.confirm('현재 인물 정보를 초기화하고 다시 생성할까?'))return;
  persona=global.GukminPlayer.generate();
  global.GukminPlayer.save(persona);
  render();
 }
 function openPreview(type){
  selection=-1;previewKind=type;
  const school=type==='school',dialog=$('choiceDialog');
  dialog.className=school?'school-dialog':'ballot-dialog';
  text('kicker',school?'진학 지원서 · 디자인 미리보기':'정당 가입 · 디자인 미리보기');
  text('modalTitle',school?'진학 고등학교 선택':'소속 정당 선택');
  text('modalStory',school?'본인이 진학할 고등학교를 선택하시오.':'입당할 정당을 선택하시오. (가상의 정당입니다.)');
  text('summary','아직 선택하지 않음');
  $('confirm').disabled=true;
  const list=$('options');list.className=school?'options':'ballot-paper';list.replaceChildren();
  const options=school?SCHOOLS:PARTIES;
  options.forEach((item,i)=>{
   const button=el('button',school?'option':'ballot-row');
   button.type='button';button.setAttribute('aria-pressed','false');
   if(school){
    const crest=el('span','crest');crest.append(el('span','',item.icon));
    const body=el('span','option-text');
    body.append(el('strong','school-name',item.name),el('small','',item.desc));
    const tags=el('span','choice-tags');
    item.tags.forEach(t=>tags.append(el('span','token',t)));
    body.append(tags);button.append(crest,body,el('span','check','✓'));
   }else{
    const n=el('span','ballot-no',i+1),content=el('span','ballot-party');
    const mark=el('span','party-mark',item.icon),words=el('span','');
    mark.style.setProperty('--color',item.color);
    words.append(el('strong','',item.name),el('small','',item.desc));
    content.append(mark,words);
    const box=el('span','stamp-box');box.append(el('span','stamp','✓'));
    button.append(n,content,box);
   }
   button.addEventListener('click',()=>{
    selection=i;
    Array.from(list.querySelectorAll('button')).forEach((node,index)=>node.setAttribute('aria-pressed',String(index===i)));
    text('summary',item.name+' 선택됨 (미리보기)');
    $('confirm').disabled=false;
   });
   list.append(button);
  });
  dialog.showModal();
 }
 function confirmPreview(){
  if(selection<0)return;
  const item=(previewKind==='school'?SCHOOLS:PARTIES)[selection];
  $('choiceDialog').close();
  text('chapter',item.name+' · UI만 미리보기');
 }
 const subscriptions=[
  [$('resetGame'),'click',reset],
  [$('previewSchool'),'click',()=>openPreview('school')],
  [$('previewParty'),'click',()=>openPreview('party')],
  [$('close'),'click',()=>$('choiceDialog').close()],
  [$('confirm'),'click',confirmPreview],
  [$('choiceDialog'),'close',()=>{selection=-1}],
  [$('backToWaiting'),'click',()=>navigate('waiting')]
 ];
 for(const [node,event,handler] of subscriptions)node.addEventListener(event,handler);
 render();
 return ()=>{for(const [node,event,handler] of subscriptions)node.removeEventListener(event,handler);};
}
global.GukminGame=Object.freeze({mount,posterData});
})(window);
