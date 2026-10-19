(function(global){
'use strict';
const ns='http://www.w3.org/2000/svg';
function part(tag,klass,text){const el=document.createElement(tag);el.className=klass;if(text!==undefined)el.textContent=String(text);return el}
function silhouette(){const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 240 320');svg.setAttribute('aria-hidden','true');for(const d of ['M65 320c0-92 27-118 80-118s81 41 88 118Z','M66 109c0-63 29-87 79-87s79 40 79 87l-6 76c-10 39-34 58-73 58-38 0-65-27-74-61Z','M63 131C52 46 89 11 148 9c53-2 81 45 74 122l-15-56c-40 9-78-7-103-21-15 28-25 52-41 77Z']){const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('fill','#0c0f16');svg.append(p)}return svg}
function create(data={}){
 const el=part('article','gk-poster');el.setAttribute('aria-label','국민의 부름 인물 포스터');
 const head=part('div','gk-poster-head'),badge=part('div','gk-poster-party'),icon=part('span','gk-poster-icon'),party=part('span','gk-poster-party-name'),stage=part('span','gk-poster-stage');badge.append(icon,party);head.append(badge,stage);
 const portrait=part('div','gk-portrait'),img=part('img','gk-portrait-image'),placeholder=part('div','gk-portrait-placeholder');img.alt='';img.hidden=true;img.decoding='async';placeholder.append(silhouette());portrait.append(img,placeholder);
 img.addEventListener('error',()=>{img.hidden=true;placeholder.hidden=false});
 const shade=part('div','gk-poster-shade'),copy=part('div','gk-poster-copy'),phrase=part('div','gk-poster-phrase'),identity=part('div','gk-poster-identity'),num=part('span','gk-poster-number'),name=part('strong','gk-poster-name');identity.append(num,name);copy.append(phrase,identity);el.append(head,portrait,shade,copy);return update(el,data);
}
function update(el,data={}){
 if(!el||!el.classList||!el.classList.contains('gk-poster'))throw new TypeError('Expected DOM from GukminPoster.create');
 const color=/^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(String(data.color||''))?data.color:'#687582';
 el.style.setProperty('--poster-party',color);
 el.dataset.template=['solid','light','minimal'].includes(data.template)?data.template:'solid';
 el.dataset.age=data.ageGroup||'adult';
 el.querySelector('.gk-poster-icon').textContent=data.partyIcon||'◇';
 el.querySelector('.gk-poster-party-name').textContent=data.partyName||'무소속';
 el.querySelector('.gk-poster-stage').textContent=data.stage||'';
 el.querySelector('.gk-poster-phrase').textContent=data.phrase||'미래의 씨앗';
 el.querySelector('.gk-poster-name').textContent=data.name||'이름 미정';
 const number=el.querySelector('.gk-poster-number'),hasNum=data.number!==null&&data.number!==undefined&&String(data.number).trim()!=='';
 number.hidden=!hasNum;number.textContent=hasNum?'기호 '+data.number+'번':'';
 const img=el.querySelector('.gk-portrait-image'),shadow=el.querySelector('.gk-portrait-placeholder'),src=typeof data.imageSrc==='string'?data.imageSrc.trim():'';
 if(src){if(img.getAttribute('src')!==src){img.hidden=false;shadow.hidden=true;img.src=src}}
 else{img.removeAttribute('src');img.hidden=true;shadow.hidden=false}
 return el;
}
global.GukminPoster=Object.freeze({create,update});
})(window);