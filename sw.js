/* Static app shell only. Player saves remain exclusively in localStorage. */
'use strict';
const ROOT=new URL('./',self.location.href);
const VERSION=new URL(self.location.href).searchParams.get('v')||'adult-story-20261024';
const PREFIX='gukmin-shell-';
const CACHE=PREFIX+VERSION;
const SHELL=[
 "index.html",
 "html/waiting.html",
 "html/game.html",
 "html/result.html",
 "css/style.css",
 "manifest.json",
 "sitemap.xml",
 "js/boot.js",
 "js/dailyChoice.js",
 "js/dailyScenes.js",
 "js/adultScenes.js",
 "js/life/classroom.js",
 "js/election/engine.js",
 "js/life/election.js",
 "js/data/base.js",
 "js/data/grades.js",
 "js/data/regions.js",
 "js/data/schools.js",
 "js/effects.js",
 "js/game.js",
 "js/life/admissions.js",
 "js/life/society.js",
 "js/life/adultStories.js",
 "js/life/adultFlow.js",
 "js/societyView.js",
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
 "js/election/view.js",
 "js/election/choices.js",
 "js/systemDemo.js",
 "js/timeline.js",
 "assets/daily/01-teddy.jpg",
 "assets/daily/02-sandplay.jpg",
 "assets/daily/03-schoolbag.jpg",
 "assets/daily/04-toy-car.jpg",
 "assets/daily/05-cafeteria.jpg",
 "assets/daily/06-afterschool.jpg",
 "assets/daily/07-project-materials.jpg",
 "assets/daily/08-project-preparation.jpg",
 "assets/daily/09-club-notice.jpg",
 "assets/daily/10-broadcast.jpg",
 "assets/daily/11-science-club.jpg",
 "assets/daily/12-exam-preparation.jpg",
 "assets/daily/13-missed-bus.jpg",
 "assets/daily/14-lab-reservation.jpg",
 "assets/daily/15-electives.jpg",
 "assets/daily/16-experiment-error.jpg",
 "assets/daily/17-before-exam.jpg",
 "assets/daily/18-after-exam.jpg",
 "assets/daily/19-retake.jpg",
 "assets/daily/20-applications.jpg",
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
