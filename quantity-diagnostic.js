// Local-only diagnostics: nothing is uploaded or sent to a server.
(() => {
  const scans = new Map();
  const panel = document.createElement('details');
  panel.style.cssText = 'margin:16px 0;padding:15px;background:#151e29;color:white;border:1px solid #ffd25a;border-radius:10px;font:14px system-ui';
  panel.innerHTML = '<summary style="cursor:pointer;font-weight:700">Quantity OCR diagnostics (local test)</summary><p>This shows the <strong>actual quantity crop</strong> passed to the reader, magnified 6×. Select a slot and press Download crop to share just that tiny portion of the game, not your full screen.</p><label>Slot <select id="qdbgSlot"><option value="3">4 — Orange</option><option value="7">8 — Blue</option></select></label> <button id="qdbgSave" type="button">Download crop PNG</button><div id="qdbgStatus" style="padding:10px 0">Waiting for potion scans…</div><canvas id="qdbgImage" style="max-width:100%;image-rendering:pixelated;border:1px solid #aaa;background:#111"></canvas>';
  window.MapleCartelQuantityDebug = {
    stage(message) { panel.querySelector('#qdbgStatus').textContent = message; },
    record(slot, canvas) { scans.set(slot, {canvas, result:scans.get(slot)?.result});draw(); },
    result(slot, result) { if(scans.has(slot)){scans.get(slot).result=result;draw();} }
  };
  function draw(){const slot=Number(panel.querySelector('#qdbgSlot').value),entry=scans.get(slot);if(!entry)return;
    const out=panel.querySelector('#qdbgImage');out.width=entry.canvas.width*6;out.height=entry.canvas.height*6;
    const c=out.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(entry.canvas,0,0,out.width,out.height);
    const r=entry.result; panel.querySelector('#qdbgStatus').textContent='UPSTREAM READER | Crop '+entry.canvas.width+'×'+entry.canvas.height+' | OCR '+(r?.accepted?'ACCEPTED':'rejected / no match')+(Number.isInteger(r?.count)?' | candidate '+r.count:'')+(Number.isFinite(r?.confidence)?' | confidence '+r.confidence+'%':'');
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const root=document.getElementById('quickslotItems');if(!root)return;root.appendChild(panel);
    panel.querySelector('#qdbgSlot').addEventListener('change',draw);
    panel.querySelector('#qdbgSave').addEventListener('click',()=>{const slot=Number(panel.querySelector('#qdbgSlot').value),entry=scans.get(slot);if(!entry)return;
      const a=document.createElement('a');a.download='maple-slot-'+(slot+1)+'-quantity-crop.png';a.href=entry.canvas.toDataURL('image/png');a.click();});
  });
})();
