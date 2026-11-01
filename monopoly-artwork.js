/* MONOPOLY VISUAL MIRROR ONLY. NEVER MODIFIES EXP/POTION RECOGNITION OR SESSION STATE. */
(()=>{
 const $=id=>document.getElementById(id);
 const mappings={eta:'monoEta',level:'monoLevel',nextLevel:'monoNext',pct:'monoPct',remaining:'monoRemaining',rate:'monoRate',gained:'monoGained',duration:'monoDuration',rateNote:'monoRateNote',gainNote:'monoGainNote',timeNote:'monoTimeNote',sampleCount:'monoSamples',lastRead:'monoLast',potionHpRate:'monoHp',potionMpRate:'monoMp',potionTotalRate:'monoTotal',potionSpent:'monoSpent',stateBadge:'monoState',connectionTitle:'monoConnectionTitle',connectionText:'monoConnectionText',quickslotLayoutState:'monoSlotsState'};
 const mirror=(source,dest)=>{if(source&&dest&&dest.textContent!==source.textContent)dest.textContent=source.textContent;};
 function sync(){for(const [from,to] of Object.entries(mappings))mirror($(from),$(to));
   mirror($('potionSpent'),$('monoSpentBottom'));
   const srcBar=$('levelBar'),bar=$('monoLevelBar');if(srcBar&&bar)bar.style.width=srcBar.style.width||'0%';
   const dot=$('connectionDot');const isLive=!!dot?.classList.contains('active');$('monoLed')?.classList.toggle('active',isLive);$('monoLiveIndicator')?.classList.toggle('is-active',isLive);
   for(const [proxy,source] of [['monoStart','start'],['monoStop','stop'],['monoReset','reset']]){
     if($(proxy)&&$(source)){$(proxy).disabled=$(source).disabled;if(proxy==='monoStart')$(proxy).textContent=$(source).textContent;}
   }
   if($('notice'))mirror($('notice'),$('monoNotice'));
   // Read the existing rendered quickslot cards. This is presentation only; no
   // modification to OCR, baseline counts, session accounting or item types.
   let hpUsed=0,mpUsed=0,hpKnown=false,mpKnown=false;
   for(const card of document.querySelectorAll('#quickslotGrid .quickslot-card')){
     const type=card.querySelector('select')?.value;
     const group=window.MaplePotionCosts?.catalog?.[type]?.group;
     const usage=card.querySelector('.quickslot-usage')?.textContent||'';
     const match=usage.match(/Used\s+([0-9,]+)/i);
     if(!group||!match)continue;
     const value=Number(match[1].replace(/,/g,''));if(!Number.isFinite(value))continue;
     if(group==='hp'||group==='both'){hpUsed+=value;hpKnown=true;}
     if(group==='mp'||group==='both'){mpUsed+=value;mpKnown=true;}
   }
   if($('monoHpUsed'))$('monoHpUsed').textContent=hpKnown?hpUsed.toLocaleString()+' used':'— used';
   if($('monoMpUsed'))$('monoMpUsed').textContent=mpKnown?mpUsed.toLocaleString()+' used':'— used';
   const source=$('chart'),target=$('monoChart');if(source&&target&&source.innerHTML!==target.innerHTML)target.innerHTML=source.innerHTML;
 }
 document.addEventListener('DOMContentLoaded',()=>{
   function fitArt(){const width=1672,height=941,s=Math.min(window.innerWidth/width,window.innerHeight/height);$('approvedArtboard')?.style.setProperty('--artScale',String(Math.max(.1,s)));}
   window.addEventListener('resize',fitArt);fitArt();
   const sourceList=Object.keys(mappings).concat(['levelBar','connectionDot','start','stop','reset','chart','notice']);
   for(const id of sourceList){const e=$(id);if(!e)continue;const o=new MutationObserver(sync);const opts={childList:true,subtree:true,characterData:true};if(id==='levelBar'){opts.attributes=true;opts.attributeFilter=['style'];}else if(id==='connectionDot'){opts.attributes=true;opts.attributeFilter=['class'];}else if(['start','stop','reset','notice'].includes(id)){opts.attributes=true;opts.attributeFilter=['disabled','hidden'];}o.observe(e,opts);}
   for(const [proxy,source] of [['monoStart','start'],['monoStop','stop'],['monoReset','reset'],['monoSettings','settings'],['monoCapture','previewToggle']]){
     $(proxy)?.addEventListener('click',()=>$(source)?.click());
   }
   const pick=$('monopolyTheme'),original=$('cartelTheme');
   if(pick&&original)pick.addEventListener('change',()=>{original.value=pick.value;original.dispatchEvent(new Event('change',{bubbles:true}));});
   const slots=$('quickslotItems'),home=slots?.parentNode,slotMarker=document.createComment('Original quickslot home');
   if(slots&&home)home.insertBefore(slotMarker,slots);
   const slotsDialog=$('monopolySlotsDialog');
   const openSlots=()=>{if(slots&&$('monoSlotsHome'))$('monoSlotsHome').appendChild(slots);slotsDialog?.showModal();};
   $('monoSlots')?.addEventListener('click',openSlots);$('defaultSlots')?.addEventListener('click',openSlots);
   $('monoSlotsClose')?.addEventListener('click',()=>{if(slots&&slotMarker.parentNode)slotMarker.parentNode.insertBefore(slots,slotMarker.nextSibling);slotsDialog?.close();});
   $('defaultCapture')?.addEventListener('click',()=>{const el=document.querySelector('.shell .capture-panel');if(!el)return;el.classList.toggle('default-capture-open');$('defaultCapture').textContent=el.classList.contains('default-capture-open')?'Hide capture details':'Capture details';});
   slotsDialog?.addEventListener('close',()=>{if(slots&&slotMarker.parentNode)slotMarker.parentNode.insertBefore(slots,slotMarker.nextSibling);});
   const copyTheme=()=>{if(pick)pick.value=document.documentElement.dataset.cartelTheme==='monopoly'?'monopoly':'street';};
   new MutationObserver(copyTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-cartel-theme']});
   copyTheme();sync();window.setInterval(sync,2000);
 });
})();