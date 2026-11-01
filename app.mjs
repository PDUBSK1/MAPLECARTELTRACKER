import {emptySession,parse,metrics,required,total,validateStep} from './core.mjs';
import {Detector} from './vision.mjs';

let stream=null;
const $=id=>document.getElementById(id), key='maple-cartel-session-v1';
// Original upstream quickslot recognizer shares the existing read-only video frames.
const quickslots=window.MapleQuickslots.mount({document,window,storage:localStorage,
  getCapture:()=>({stream,captureFrame:()=>{}})});
function renderPotions(){
  const store=quickslots.store, items=store?.state.items||[];
  let hp=0,mp=0,known=true,spent=0;
  for(const item of items){
    const group=window.MaplePotionCosts.catalog[item.potionType]?.group;
    const price=window.MaplePotionCosts.price(item);
    if(!group) continue;
    if(price===null){known=false;continue;}
    const cost=price*item.used, rate=price*store.rate(item,Date.now());
    spent+=cost;
    if(group==='hp'||group==='both')hp+=rate;
    if(group==='mp'||group==='both')mp+=rate;
  }
  const active=!!stream&&quickslots.layout&&store?.state.enabled&&known&&items.length;
  const show=(id,value)=>{document.getElementById(id).textContent=active?fmt(value):'—';};
  show('potionHpRate',hp);show('potionMpRate',mp);show('potionTotalRate',hp+mp);
  document.getElementById('potionSpent').textContent=known&&items.length?fmt(spent):'—';
}
let session=emptySession(), settings={interval:10,preview:false}, storageOkay=true;
try {const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1 && Array.isArray(saved.samples) && Number.isFinite(saved.elapsed) && saved.samples.every(r=>Number.isFinite(r.t)&&Number.isInteger(r.level)&&required(r.level)&&Number.isSafeInteger(r.exp)&&r.exp>=0&&r.exp<required(r.level)&&Number.isFinite(r.pct))){session=saved;session.stopped=true;}const p=JSON.parse(localStorage.getItem('maple-cartel-settings')||'null');if(p){settings.interval=[5,10,20].includes(p.interval)?p.interval:10;settings.preview=!!p.preview;}}catch{storageOkay=false;}
let video=document.createElement('video'),detector=new Detector(),running=false,starting=false,busy=false,epoch=0,pending=null,timer=null,activeSince=null,baseElapsed=session.elapsed,previewVisible=settings.preview,diagnosticBusy=false;
video.muted=true;video.playsInline=true;
const frame=document.createElement('canvas');
const fmt=n=>Math.round(n).toLocaleString('en-US');
function duration(seconds){seconds=Math.max(0,Math.floor(seconds));return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');}
function elapsed(){return baseElapsed+(activeSince===null?0:(performance.now()-activeSince)/1000);}
function persist(){try{session.elapsed=elapsed();localStorage.setItem(key,JSON.stringify(session));}catch{storageOkay=false;notice('Browser storage is unavailable. Results will not survive a refresh.');}}
function notice(message){$('notice').textContent=message||'';$('notice').hidden=!message;}
function status(title,detail){$('connectionTitle').textContent=title;$('connectionText').textContent=detail;}
function drawChart(){
  const samples=session.samples;if(samples.length<2)return;
  const first=samples[0],last=samples.at(-1),v=samples.map(r=>total(r)-total(first)),lo=Math.min(0,...v),hi=Math.max(1,...v),span=Math.max(1,last.t-first.t);
  const points=samples.map((r,i)=>[(r.t-first.t)/span*900,175-(v[i]-lo)/(hi-lo)*155]);
  const path=points.map((p,i)=>(i?'L':'M')+p.map(x=>x.toFixed(1)).join(',')).join(' ');
  $('chart').innerHTML='<svg viewBox="0 0 900 205" preserveAspectRatio="none" role="img" aria-label="Net experience gained over this session"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#bff35a" stop-opacity=".18"/><stop offset="1" stop-color="#bff35a" stop-opacity="0"/></linearGradient></defs><path d="'+path+' L900,195 L0,195Z" fill="url(#fill)"/><path d="'+path+'" fill="none" stroke="#c1f957" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';
}
const emptyChart=$('chart').innerHTML;
function render(){renderPotions();const m=metrics(session),last=session.samples.at(-1),has=!!last,approx=session.samples.some(r=>r.estimated)?'~':'';
  $('rate').textContent=m.rate?approx+fmt(m.rate):'—';$('gained').textContent=has?approx+fmt(m.gained):'—';$('duration').textContent=duration(elapsed());$('level').textContent=m.level??'—';$('nextLevel').textContent=m.level?'→ '+(m.level+1):'→ —';$('levels').textContent=has?'+'+m.levels:'—';$('pct').textContent=has?m.pct.toFixed(2)+'%':'Awaiting detection';$('levelBar').style.width=m.pct+'%';$('remaining').textContent=has?fmt(required(last.level)-last.exp)+' EXP left':'— EXP left';$('eta').textContent=m.eta?approx+duration(m.eta):'—';
  $('start').textContent=starting?'Connecting…':running?'Session running':has?'Session complete':'↗ Start session';$('start').disabled=starting||running||diagnosticBusy||has;$('stop').disabled=!running&&!starting;$('reset').disabled=starting||diagnosticBusy;
  $('stateBadge').textContent=running?'● LIVE SESSION':has?'■ SESSION SAVED':'● STANDBY';$('connectionDot').classList.toggle('active',running);$('previewToggle').disabled=!stream;$('previewToggle').textContent=previewVisible?'Hide capture ↗':'Show capture ↗';$('captureWrap').hidden=!stream||!previewVisible;$('captureEmpty').hidden=!!stream;
  $('rateNote').textContent=!has?'Your pace will appear here':session.samples.at(-1).t-session.samples[0].t<30000?'Collecting 30 seconds of readings':'Average across verified session time';
  $('sampleCount').textContent=session.samples.length+' verified readings';$('lastRead').textContent=last?'LV '+last.level+' / '+fmt(last.exp)+' EXP':'NO DATA YET';
  $('timeNote').textContent=running?'Session clock running':has?'Saved locally until you reset':'Clock starts with your first reading';$('gainNote').textContent=session.gaps?'Includes '+session.gaps+' capture gap(s); check results':approx?'~ Estimated from rounded HUD percentages':'Net change · EXP losses included';
  if(session.samples.length>1)drawChart();else $('chart').innerHTML=emptyChart;
}
function stop(reason){epoch++;running=false;starting=false;clearTimeout(timer);baseElapsed=elapsed();activeSince=null;session.elapsed=baseElapsed;session.stopped=true;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.srcObject=null;quickslots.invalidate();pending=null;persist();status(session.samples.length?'Session saved':'Capture stopped',reason||'Results stay here until you press Reset.');$('detection').textContent='AUTO-DETECT / STOPPED';render();}
function updatePreview(){if(!previewVisible)return;const c=$('preview'),scale=Math.min(1,1400/frame.width);c.width=Math.round(frame.width*scale);c.height=Math.round(frame.height*scale);c.getContext('2d').drawImage(frame,0,0,c.width,c.height);$('captureMeta').textContent=frame.width+' × '+frame.height+' · automatic recognition · capture stays local';}
async function tick(token){
  if(!running||epoch!==token)return;
  if(busy){timer=setTimeout(()=>tick(token),1000);return;}
  busy=true;
  try{
    if(!video.videoWidth||video.readyState<2)throw new Error('Waiting for a visible game frame. Keep MapleStory unminimized.');
    frame.width=video.videoWidth;frame.height=video.videoHeight;frame.getContext('2d').drawImage(video,0,0);updatePreview();
    await quickslots.process(frame,Date.now(),()=>!running||epoch!==token);
    const capturedAt=elapsed()*1000;
    $('detection').textContent='AUTO-DETECT / SCANNING';
    const reading=await detector.read(frame,progress=>{if(epoch===token)status('Reading your HUD',progress+'… First use may take a moment.');});
    if(epoch!==token||!running)return;
    if(!reading){session.rejected++;pending=null;status('Looking for your HUD',detector.reason||'Keep level and EXP visible. Searching automatically.');$('detection').textContent='AUTO-DETECT / SEARCHING';}
    else {
      const last=session.samples.at(-1);
      if(!validateStep(last,reading)){session.rejected++;pending=null;status('Reading needs review','Large EXP or level change detected. Keep the same character; reset for a new character.');$('detection').textContent='AUTO-DETECT / JUMP SKIPPED';}
      else if(!pending || pending.level!==reading.level || !validateStep(pending,reading)){pending=reading;status('HUD found · confirming','Checking a second capture before counting this reading.');$('detection').textContent='AUTO-DETECT / VERIFYING';}
      else {
        if(activeSince===null)activeSince=performance.now();
        const t=last?capturedAt:0;
        if(last && t-last.t>Math.max(60000,settings.interval*4000)){session.gaps++;notice('A capture gap was detected. Totals use the next verified reading; the full gap remains in the rate calculation.');}
        session.samples.push({...reading,t});pending=reading;
        if(session.samples.length>2000)session.samples=session.samples.filter((_,i,a)=>i%2===0||i===a.length-1);
        session.stopped=false;persist();status('Tracking your session','Level '+reading.level+' · '+(reading.estimated?'~':'')+fmt(reading.exp)+' EXP · '+reading.pct.toFixed(2)+'% · '+reading.engine);$('detection').textContent='AUTO-DETECT / LOCKED';
      }
    }
    render();
  }catch(e){if(epoch===token){status('Recognition paused',e.message||'Unable to read capture.');notice(e.message||'Recognition failed. Stop and try again.');}}
  finally{busy=false;if(running&&epoch===token)timer=setTimeout(()=>tick(token),Math.min(settings.interval*1000,5000));}
}
async function start(){
  if(running||starting)return;
  if(!navigator.mediaDevices?.getDisplayMedia){notice('Screen sharing is unavailable here. Open this site directly in desktop Chrome or Edge over HTTPS.');return;}
  starting=true;const token=++epoch;notice('');render();
  try{
    // Capture chooser must run directly from the user click, before loading OCR.
    const nextStream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:2,max:5}},audio:false});
    if(token!==epoch){nextStream.getTracks().forEach(t=>t.stop());return;}
    stream=nextStream;video.srcObject=stream;await video.play();
    if(token!==epoch)return;
    stream.getVideoTracks()[0].addEventListener('ended',()=>{if(token===epoch)stop('Screen sharing ended. Your results are saved.');},{once:true});
    running=true;starting=false;activeSince=null;baseElapsed=session.elapsed;pending=null;detector=new Detector();
    status('Finding your HUD','Reading the game window automatically. The timer starts once readings are confirmed.');render();tick(token);
  }catch(e){if(token===epoch){stop(e.name==='NotAllowedError'?'Sharing was cancelled or blocked. Press Start to try again.':e.message);if(e.name!=='NotAllowedError')notice(e.message);}}
}
$('start').addEventListener('click',start);$('stop').addEventListener('click',()=>stop());
$('reset').addEventListener('click',()=>$('resetDialog').showModal());$('cancelReset').addEventListener('click',()=>$('resetDialog').close());
$('confirmReset').addEventListener('click',()=>{stop();session=emptySession();quickslots.resetSession();baseElapsed=0;activeSince=null;detector=new Detector();persist();notice('');status('Ready when you are','Share your MapleStory window to begin.');$('detection').textContent='AUTO-DETECT / READY';$('resetDialog').close();render();});
$('previewToggle').addEventListener('click',()=>{previewVisible=!previewVisible;updatePreview();render();});
$('settings').addEventListener('click',()=>{$('intervalSetting').value=settings.interval;$('previewSetting').checked=settings.preview;$('settingsDialog').showModal();});
$('closeSettings').addEventListener('click',()=>{settings.interval=Number($('intervalSetting').value);settings.preview=$('previewSetting').checked;previewVisible=settings.preview;try{localStorage.setItem('maple-cartel-settings',JSON.stringify(settings));}catch{notice('Settings could not be saved in this browser.');}$('settingsDialog').close();if(frame.width&&stream)updatePreview();render();});
$('imageTest').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(running||starting||busy){$('testResult').textContent='Stop the session and wait for the current scan to finish before testing a screenshot.';return;}if(file.size>20*1024*1024){$('testResult').textContent='Please use an image smaller than 20 MB.';return;}diagnosticBusy=true;render();$('testResult').textContent='Reading screenshot locally…';try{const bitmap=await createImageBitmap(file);if(bitmap.width*bitmap.height>40000000){bitmap.close();throw new Error('Image is too large. Use a screenshot below 40 megapixels.');}const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;c.getContext('2d').drawImage(bitmap,0,0);bitmap.close();const reader=new Detector();reader.misses=1;const r=await reader.read(c);$('testResult').textContent=r?'Detected level '+r.level+' · '+(r.estimated?'~':'')+fmt(r.exp)+' EXP · '+r.pct+'% at '+r.resolution+'. Session unchanged.':reader.reason||'No trustworthy HUD reading found. Session unchanged.';}catch(err){$('testResult').textContent=err.message;}finally{diagnosticBusy=false;e.target.value='';render();}});
window.addEventListener('pagehide',()=>{if(running||starting)stop('Page closed. Results saved.');});
setInterval(()=>{if(running){$('duration').textContent=duration(elapsed());persist();}},1000);
$('dateLabel').textContent=new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'}).toUpperCase();
if(session.samples.length)status('Previous session restored','Results saved. Press Reset when you want to begin fresh.');
if(!storageOkay)notice('Browser storage could not be read. Results may not persist after refresh.');render();
