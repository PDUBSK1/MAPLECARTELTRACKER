// Current-level ETA. Read-only: existing EXP/OCR engine and session remain untouched.
import {required} from './core.mjs';
const $=id=>document.getElementById(id);
function num(s){const m=String(s??'').match(/[\d][\d,]*/);return m?Number(m[0].replaceAll(',','')):null;}
function text(id,value){const el=$(id);if(el&&el.textContent!==value)el.textContent=value;}
function duration(sec){
 if(!Number.isFinite(sec)||sec<0)return '—';
 const min=Math.ceil(sec/60);const days=Math.floor(min/1440),hours=Math.floor(min%1440/60),mins=min%60;
 return (days?days+'d ':'')+(hours?hours+'h ':'')+mins+'m';
}
function update(){
 const level=num($('level')?.textContent);
 const paceRaw=$('rate')?.textContent||'';
 const rate=paceRaw.includes('—')?null:num(paceRaw);
 let expLeft=null;
 const last=$('lastRead')?.textContent||'';
 const match=last.match(/LV\s*(\d+)\s*\/\s*([\d,]+)\s*EXP/i);
 if(Number.isInteger(level)&&level>=1&&level<=99){
   if(match&&Number(match[1])===level){const current=Number(match[2].replaceAll(',',''));const total=required(level);if(Number.isFinite(total)&&current>=0&&current<=total)expLeft=total-current;}
   // Fallback to the already-computed EXP-to-next-level field if present.
   if(expLeft===null){const rem=$('remaining')?.textContent||'';if(/\d/.test(rem)&&!/—/.test(rem))expLeft=num(rem);}
 }
 const next=level!==null?level+1:null;
 const levelLabel=next!==null?String(level)+' → '+String(next):'—';
 let remaining='Waiting for HUD',finish='—',timeSeconds=null;
 if(expLeft!==null){
   remaining='Waiting for EXP/hour';
   if(rate>0){timeSeconds=expLeft/rate*3600;remaining=duration(timeSeconds);
    const d=new Date(Date.now()+timeSeconds*1000);
    if(Number.isFinite(d.getTime()))finish=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(d);
   }
 }
 text('monoGoalLevel',levelLabel);text('defaultGoalLevel',levelLabel);
 text('monoGoalEta',remaining);text('defaultGoalEta',remaining);
 text('monoGoalFinish','FINISH '+finish);text('defaultGoalFinish',finish);
 text('goalExpLeft',expLeft===null?'—':expLeft.toLocaleString('en-US'));
 text('goalTimeLeft',remaining);text('goalFinishTime',finish);
 // Read-only economy insight: estimated potion cost to finish *current* level.
 const costText=$('potionTotalRate')?.textContent||'';
 const perHour=costText.includes('—')?null:num(costText);
 const budget=timeSeconds!==null&&perHour!==null?timeSeconds/3600*perHour:null;
 text('mcGoalBudget',budget===null?'—':Math.round(budget).toLocaleString('en-US'));
}
update();setInterval(update,3000);
