MAPLE CARTEL V1 — MONOPOLY APPROVED ART BUILD

START
1. Extract this ZIP into a NEW folder. Keep your known-working folder unchanged.
2. Open a terminal in the extracted folder.
3. Run: python -m http.server 8126
4. Open http://localhost:8126 in desktop Chrome or Edge.
5. The DEFAULT (original) theme opens first. Use THEME > Monopoly to switch.

MONOPOLY
• Uses the actual previously approved Maple Cartel illustration as a static art skin.
• Sample numbers in the illustration are covered by separate graphic plates. Real values are HTML elements wired to the original EXP and potion tracker fields.
• Live EXP/hour, session EXP, ETA, current level, EXP %, chart, HP/MP used quantities, HP/MP hourly costs, total expense and session time are displayed.
• START, STOP, RESET, SETTINGS and SLOTS are wired to the existing underlying controls.
• SLOTS opens a separate modal for original quickslot configuration.
• No visual animations. Optimized for 16:9 desktop monitors including 1366x768, 1920x1080 and 2560x1440.

DEFAULT
• Original branding and large logo; tightened desktop layout and quickslot configuration modal.
• Default is always selected at page load (no saved theme override).

IMPORTANT LIMITATIONS
• The background art is a flattened reference illustration. It is not a fully editable multi-layer source. Editable SVG frame studies and independent overlay art are in art/monopoly/.
• Live game capture and potion OCR were NOT end-to-end tested in this environment. The entire existing capture and recognition engine was preserved byte for byte.
• Previously known OCR behavior remains: 1366x768 confirmed working in user's setup; higher resolution OCR is not fixed by these visual changes.
• The rendered screenshots included in PREVIEWS use SAMPLE NUMBERS injected by an isolated visual smoke test, not a real captured gameplay session. Live website values come from the tracker only.
• The high-fidelity Monopoly artboard scales to the desktop viewport; narrow phones will scale the entire canvas and may be difficult to read.

TOOLS
The site depends on its local folder structure. Do not load index.html directly via file:// for Chrome module+worker support; serve via localhost/HTTPS.

SOURCE CREDIT
The HUD and potion reader preserve the original source attribution in vendor/maple-track/ATTRIBUTION.md and site Settings.
