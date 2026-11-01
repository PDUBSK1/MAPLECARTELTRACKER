// Maple Cartel V1: read-only HP/MP potion accounting.
// Feed this module validated quickslot count observations from your existing screenshot/OCR pipeline.
export class PotionTracker {
  constructor(potions = []) {
    this.potions = new Map();
    this.sessionMs = 0;
    this.lastTick = null;
    for (const potion of potions) this.configure(potion);
  }
  configure({slot, type, name, unitPrice = 0}) {
    if (!Number.isInteger(slot) || slot < 0 || !['HP','MP'].includes(type) || !Number.isFinite(unitPrice) || unitPrice < 0) throw Error('Invalid potion configuration');
    const old = this.potions.get(slot);
    this.potions.set(slot, {slot,type,name:String(name),unitPrice,used:old?.used ?? 0,baseline:old?.baseline ?? null});
  }
  // Pass elapsed active session time independently; never count paused or idle time.
  setActiveSessionMs(ms) { if (Number.isFinite(ms) && ms >= 0) this.sessionMs = ms; }
  observe(slot, count, {verified = true, paused = false, maxDelta = 20} = {}) {
    const p = this.potions.get(slot);
    if (!p || !verified || paused || !Number.isInteger(count) || count < 0) return {accepted:false};
    if (p.baseline === null) {p.baseline=count;return {accepted:true, used:0};}
    const delta = p.baseline - count;
    if (delta > maxDelta) return {accepted:false, reason:'implausible count jump; awaiting a stable reading'};
    p.baseline=count; // Increasing inventory counts are restocks, not consumption.
    if (delta <= 0) return {accepted:true, used:0};
    p.used += delta;
    return {accepted:true,used:delta,cost:delta*p.unitPrice};
  }
  // Reset baseline after quickslot assignment changes, window resize, or OCR reacquisition.
  clearBaseline(slot) {const p=this.potions.get(slot); if(p) p.baseline=null;}
  resetSession() {this.sessionMs=0;for(const p of this.potions.values()){p.used=0;p.baseline=null;}}
  totals(){
    const entries=[...this.potions.values()].map(p=>({slot:p.slot,type:p.type,name:p.name,used:p.used,unitPrice:p.unitPrice,cost:p.used*p.unitPrice}));
    const hp=entries.filter(p=>p.type==='HP').reduce((s,p)=>s+p.cost,0);
    const mp=entries.filter(p=>p.type==='MP').reduce((s,p)=>s+p.cost,0);
    const hours=this.sessionMs/3600000;
    return {hp,mp,total:hp+mp,hpPerHour:hours?hp/hours:0,mpPerHour:hours?mp/hours:0,totalPerHour:hours?(hp+mp)/hours:0,entries};
  }
  netMesosPerHour(grossMesosPerHour) {return Number.isFinite(grossMesosPerHour)?grossMesosPerHour-this.totals().totalPerHour:null;}
}
