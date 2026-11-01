// Classic EXP curve, levels 1–99. Readings must agree with the displayed percentage.
export function required(level) {
  if (!Number.isInteger(level) || level < 1 || level > 99) return null;
  if (level < 6) return level * (15 + Math.floor(level ** 2 / 2));
  if (level <= 50) { const n = Math.floor(level ** 2 / 3); return n * (n + 19); }
  return level < 90 ? Math.floor(required(level - 1) * 10548 / 10000) : Math.floor(required(level - 1) * 21 / 10);
}
export function total(reading) {
  let n = reading.exp;
  for (let l = 1; l < reading.level; l++) n += required(l);
  return n;
}
export function parse(text) {
  const normalized = text.replace(/，/g, ',').replace(/[|]/g, '1');
  const levelMatch = normalized.match(/\b(?:LV\.?|LEVEL)\s*[:.]?\s*(\d{1,3})\b/i);
  const visibleLevel = levelMatch ? Number(levelMatch[1]) : null;
  const re = /(?:EXP\s*[:.]?\s*)?(\d[\d, ]*)\s*[\[(]\s*(\d{1,2}(?:\.\d{1,3})?)\s*%\s*[\])]?/gi;
  const candidates = [];
  for (const m of normalized.matchAll(re)) {
    const exp = Number(m[1].replace(/[, ]/g, '')), pct = Number(m[2]);
    if (!Number.isSafeInteger(exp) || pct < 0 || pct >= 100) continue;
    const levels = [];
    for (let level = 1; level <= 99; level++) {
      const cap = required(level);
      if (exp < cap && Math.abs(exp / cap * 100 - pct) <= 0.025 && (pct > 0.1 || visibleLevel === level)) levels.push(level);
    }
    const level = visibleLevel && levels.includes(visibleLevel) ? visibleLevel : levels.length === 1 ? levels[0] : null;
    if (level && (!visibleLevel || visibleLevel === level)) candidates.push({level, exp, pct, inferred: !visibleLevel});
  }
  const unique = [...new Map(candidates.map(r => [r.level + ':' + r.exp, r])).values()];
  return unique.length === 1 ? unique[0] : null;
}
export const emptySession = () => ({version:1, samples:[], elapsed:0, rejected:0, gaps:0, stopped:true});
export function validateStep(last, next) {
  if (!last) return true;
  // Large jumps (including switching characters) are never silently accepted.
  if (next.level < last.level || next.level > last.level + 1) return false;
  if (next.level === last.level && Math.abs(next.exp-last.exp) > required(last.level)*0.3) return false;
  if (next.level === last.level+1 && last.pct < 60) return false;
  return true;
}
export function metrics(s) {
  const first=s.samples[0], last=s.samples.at(-1);
  if (!first || !last) return {gained:0,rate:0,eta:null,levels:0,pct:0,level:null};
  const gained=total(last)-total(first), observed=(last.t-first.t)/1000;
  const rate=observed>=30 ? gained/observed*3600 : 0;
  return {gained,rate,eta:rate>0 ? (required(last.level)-last.exp)/rate*3600 : null, levels:last.level-first.level,pct:last.pct,level:last.level};
}
