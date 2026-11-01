// Maple Track adapter; see vendor/maple-track/ATTRIBUTION.md.
export class Detector {
  constructor() {
    const {MapleRecognition,MapleSession,MapleLevelOcr,MapleHudOcr,MapleHudRegions,MapleLocalOcr}=globalThis;
    if(!MapleRecognition||!MapleSession||!MapleLevelOcr||!MapleHudOcr||!MapleHudRegions||!MapleLocalOcr)
      throw new Error('HUD reader did not load. Refresh Maple Cartel and try again.');
    this.validator=MapleSession.create({levelOcr:MapleLevelOcr});
    this.image={};this.reason='Searching for the level tiles and EXP text.';this.size='';this.cycles=0;
    this.reader=MapleRecognition.create({
      document:globalThis.document,state:this.validator.state,
      levelOcr:MapleLevelOcr,hudOcr:MapleHudOcr,hudRegions:MapleHudRegions,
      required:MapleSession.required,getImage:()=>this.image,
      localOcr:{read:async input=>{
        this.onProgress?.('Reading fine HUD digits locally');
        return MapleLocalOcr.read(input);
      }},
    });
  }
  async read(source,onProgress=()=>{}) {
    this.onProgress=onProgress;
    const size=source.width+'x'+source.height;
    if(size!==this.size){this.reader.reset();this.validator.clearPending();this.size=size;}
    this.cycles++;
    if(this.cycles%8===0)this.reader.reset();
    // Live canvas is reused. Never carry a decoded reading into a missed frame.
    delete source._reading;
    try {
      await this.reader.decodeFrame(source);
      if(!source._reading){
        this.reason='EXP readout not found. Keep the bottom HUD and green EXP brackets visible.';
        this.reader.reset();this.validator.clearPending();return null;
      }
      const {levelResult,expResult}=source._reading;
      const result=this.validator.validate(levelResult,expResult,levelResult.expectedDigits,Date.now());
      if(!result.valid||result.level>99){
        this.reason=result.level>99?'This version supports levels 1–99.':result.rejectionReason;
        if(!this.reason.startsWith('Confirming'))this.reader.reset();
        return null;
      }
      const reading={level:result.level,exp:result.exp,pct:result.pct??result.computedPct,
        confidence:result.confidence,resolution:size,estimated:!!expResult.percentageOnly,
        engine:levelResult.engine==='tesseract'||expResult.engine==='tesseract'?'local OCR':'HUD glyphs'};
      // Isolated continuity state; Maple Cartel owns actual session totals/storage.
      this.validator.state.level=reading.level;
      this.validator.state.samples=[reading];
      this.reason='';return reading;
    } finally {
      delete source._pixels;delete source._reading;
    }
  }
}
