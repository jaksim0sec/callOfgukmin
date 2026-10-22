/* Static app shell only. Player saves remain exclusively in localStorage. */
'use strict';
const ROOT=new URL('./',self.location.href);
const VERSION=new URL(self.location.href).searchParams.get('v')||'exam-chat-20261022';
const PREFIX='gukmin-shell-';
const CACHE=PREFIX+VERSION;
const SHELL=[
 "index.html",
 "html/waiting.html",
 "html/game.html",
 "html/result.html",
 "css/style.css",
 "manifest.json",
 "js/boot.js",
 "js/dailyChoice.js",
 "js/dailyScenes.js",
 "js/life/classroom.js",
 "js/data/base.js",
 "js/data/grades.js",
 "js/data/regions.js",
 "js/data/schools.js",
 "js/effects.js",
 "js/game.js",
 "js/life/admissions.js",
 "js/life/director.js",
 "js/life/elementary.js",
 "js/life/high.js",
 "js/life/infant.js",
 "js/life/middle.js",
 "js/life/story.js",
 "js/majorView.js",
 "js/playerState.js",
 "js/poster.js",
 "js/resultView.js",
 "js/sheetController.js",
 "js/statusView.js",
 "js/systemDemo.js",
 "js/timeline.js",
 "assets/svg/school-placeholder.svg",
 "assets/svg/store-products.svg",
 "assets/icons/apple-touch-icon.png",
 "assets/icons/favicon-16.png",
 "assets/icons/favicon-32.png",
 "assets/icons/favicon.ico",
 "assets/icons/icon-192.png",
 "assets/icons/icon-512.png",
 "assets/icons/icon-maskable-512.png"
];

const paths=new Set(SHELL.map(path=>new URL(path,ROOT).pathname));
function keyFor(request){
 const url=new URL(request.url);
 if(url.origin!==ROOT.origin)return null;
 if(url.pathname===ROOT.pathname)url.pathname+='index.html';
 if(!paths.has(url.pathname))return null;
 url.search='';url.hash='';return url.href;
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(SHELL.map(path=>new Request(new URL(path,ROOT),{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const key=keyFor(event.request);if(!key)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(event.request);
   if(response.ok){try{await cache.put(key,response.clone());}catch{}return response;}
   if(response.status<500)return response;
   return await cache.match(key)||response;
  }catch{return await cache.match(key)||Response.error();}
 })());
});
