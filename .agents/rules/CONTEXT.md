# QuizCardGen - Workspace & Project Context

## Overview & History
QuizCardGen (formerly PostSquare Studio) is an interactive client-side web application for generating dark-theme 1:1 square quiz cards and 8-slide LinkedIn Document Carousels.
- **Current Workspace Path**: `/home/ranggakd/Repository/quizcardgenerator`
- **Origin Conversation ID**: `03686ed5-3fbc-4818-a7b6-52dca666483a`
- **Remote GitHub Repository**: `https://github.com/ranggakd/quizcardgenerator.git` (branch: `main`)
- **Live GitHub Pages URL**: `https://ranggakd.github.io/quizcardgenerator/`

## Project Structure
```text
quizcardgenerator/
├── index.html                   # Web application entry point (at root for GitHub Pages)
├── README.md                    # Project documentation and usage guide
├── LICENSE                      # MIT License
├── start_server.sh              # 1-click local server launcher (port 8088)
├── stop_server.sh               # 1-click local server stopper
├── css/
│   └── styles.css               # Design system, themes, and responsive styles
└── js/
    ├── app.js                   # Application state, parsing logic, and card rendering
    └── vendor/
        ├── html2canvas.min.js   # 1080x1080 rasterizer (local bundle)
        └── jspdf.umd.min.js     # Multi-page PDF generator (local bundle)
```

## Key Technical Decisions & Architecture
1. **Zero-Build Vanilla Architecture**: Pure client-side HTML, CSS, JavaScript. No bundlers or build steps required.
2. **Dynamic vs. Template Separation**:
   - **Dynamic (Parsed from pasted question)**: Question text, Options A-D, winning answer hero block, distractor failure traps.
   - **Template (Editable in Settings Drawer or In-Place)**: Slide 1 cover/hook, Slide 2 title & hint, Slide 7 pause/reflect callout, Slide 8 retention CTA, and bottom-right swipe prompts (`liSwipe1`..`8`).
3. **Universal Option Flexibility**: Any option (A, B, C, or D) can be set as the correct winning answer. The drawer dynamically marks `(Correct Answer ✓)` vs `(Why it fails ✗)`.
4. **Slide 8 2-Block Layout**:
   - Block 1: Winning Hero card with native `border-left: 6px solid var(--reveal-accent)` (no pseudo-element overflow).
   - Block 2: Traps Breakdown (`[A ✗]`, `[C ✗]`, etc.) explaining why the other 3 fail.
5. **Lossless Export Pipeline**:
   - `#exportRenderSandbox` renders clones at exact 1080x1080 resolution.
   - `box-shadow` is explicitly disabled in the export sandbox to prevent html2canvas corner clipping/dark pixel artifacts on rounded elements.
   - PDF exports are 1:1 multi-page vector-aligned documents generated via jsPDF.
