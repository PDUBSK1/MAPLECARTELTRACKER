MAPLE CARTEL V1 — Original Maple Track recognition baseline + observation-only diagnostics

Upstream code restored verbatim for: quickslot-font.js, quickslot-small.js, quickslot-ocr.js, quickslot-layout.js, quickslot-icon.js, quickslot-session.js, potion-costs.js, quickslot-worker.js.
The original dynamic quantity geometry, template matching, rejection rules and counting system are retained.

The site's quickslots.js retains browser integration and existing diagnostic hooks to copy the exact crop to a local preview. Its worker URL is adjusted to the vendor directory where files live. Observation hooks do not change recognition decisions.
No EXP recognition or EXP session source changes have been made by this build.
The diagnostic panel displays the actual crop and the unmodified original worker result; rejection appears when OCR returns null. The original worker does not expose rejected candidate guesses.

THIS IS A DIAGNOSTIC BUILD, NOT A RECOGNITION FIX.
Run using Python HTTP server from this directory; use an unused port (e.g. 8011). Continue using the existing working site for normal gameplay.
