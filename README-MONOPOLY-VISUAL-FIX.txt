MAPLE CARTEL V1 — MONOPOLY VISUAL CLEANUP

This is a SEPARATE build. Keep your original working tracker folder intact.

Fixes:
- The illustrated navigation strip has one theme selector and one LIVE indicator.
- Repainted sample text/numbers baked into the approved background artwork so live data no longer overlaps old text.
- Removed dark rectangular cover-up overlays; chart and potion table share consistent panel alignment.
- Cleared old chart time labels and potion sample amounts that used to peek through behind dynamic data.
- Retained the original illustrated outer frames, header, Default theme, and controls.
- Added only a cleaned artwork image, a simple navigation SVG, and one CSS override.
- NO tracking JavaScript file changes.

Testing: the standalone HTML+CSS preview was rendered at 1366 x 768 and the theme selector, data mirror and settings UI were inspected in an isolated browser render. Full localhost browser navigation was blocked in this environment. Live game capture and potion OCR must be validated on your machine before replacing the proven version.

Start in a SEPARATE folder with:
  py -m http.server 8128
Open http://localhost:8128

Original working 8127 folder remains unchanged.
