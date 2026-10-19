/* Birth-stage producer. More episodes can be appended without editing the director. */
(function(global){
'use strict';
global.GukminDirector.register({
 id:'infant',
 when:{phase:'infant'},
 generate:()=>({
   events:[{
     id:'infant:birth-registered',layer:'소식 이벤트',at:0,
     title:'출생 기록 확정'
     // The two birth records already exist in playerState.generate(). No duplicate story.
   }]
 })
});
})(window);
