
/* Read-only insights derived from existing dashboard output; no tracker changes. */
(()=>{
 const $=id=>document.getElementById(id);
 const number=id=>{const t=$(id)?.textContent||'';if(!/\d/.test(t))return null;const n=Number(t.replace(/[^\d.-]/g,''));return Number.isFinite(n)?n:null};
 const fmt=n=>Math.round(n).toLocaleString('en-US');
 function update(){
  const hourly=number('potionTotalRate');
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const ids=['potionTotalRate','goalExpLeft','rate'];
  for(const id of ids){const el=$(id);if(el)new MutationObserver(update).observe(el,{childList:true,characterData:true,subtree:true})}
  update();
 });
})();
