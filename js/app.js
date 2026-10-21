/**
 * QuizCardGen - Core Logic
 * Handles 1:1 square block rendering, live editing, smart paste parsing,
 * theme management, and 1-click high-resolution PNG & multi-page PDF exports.
 */

/**
 * Semantic Version of QuizCardGen
 */
const APP_VERSION = 'v1.2.0';

// Default State initialized with user's example & 8-slide educational quiz carousel structure
const DEFAULT_STATE = {
  theme: 'theme-obsidian',
  fontSize: 'font-medium',
  cornerStyle: 'square', // 'square' (Full Bleed 1:1, no white outside), 'rounded-transparent', 'rounded-dark'
  highlightAnswer: 'none',
  topic: 'DATA ARCHITECTURE',
  question: 'Which statement accurately describes the layers?',
  author: 'dataengineering',
  showQuotes: true,
  showGlow: true,
  showCounter: false, // OFF by default
  exportResolution: 1080, // 1080x1080px Instagram / LinkedIn standard
  activeView: 'grid', // 'grid' (4-Block) | 'linkedin' (Document Carousel)
  liSlideIndex: 0, // 0 to 7 (8 slides total)
  liHookTitle: 'How well do you know the Databricks Medallion Architecture?',
  liHookSub: 'Test your lakehouse data modeling skills across Bronze, Silver, & Gold layers.',
  liScenarioTitle: 'Understanding Medallion Layers',
  liScenarioText: 'Which statement accurately describes the data responsibilities and transformations between the Bronze, Silver, and Gold layers?',
  liScenarioHint: '💡 Pro-Tip: Think about raw ingestion integrity, cleansed enrichment, and aggregated analytical business marts.',
  liEngagementTitle: 'Ready for the answer?',
  liEngagementText: 'Drop your choice (A, B, C, or D) in the comments below before you swipe to the reveal!',
  liEngagementSub: 'Can you explain why the other 3 choices fail?',
  liRevealAnswer: 'B',
  liRevealAnswerText: 'CORRECT ANSWER: OPTION B',
  liRevealColor: '#10b981', // Custom color choice: emerald, cyan, purple, amber, rose, or custom hex
  liPostCta: '🔖 Save this post for your next data architecture interview & Follow for more!',
  liSlide2Tag: 'THE QUESTION / SCENARIO',
  liSlide7Tag: 'PAUSE & REFLECT',
  liSlide8Tag: 'ANSWER REVEAL & BREAKDOWN',
  liAuthorName: 'Data Architecture Lead',
  liAuthorHeadline: 'Staff Data Engineer @ Cloud Lakehouse | 12,450 followers',
  liPostCaption: 'How well do you know the Databricks Medallion Architecture? 💡 Swipe through this quiz carousel to test your lakehouse knowledge. Drop your answer in the comments before slide 8! 👇',
  liDocFilename: 'medallion_architecture_quiz.pdf',
  liViewMode: 'player', // 'player' | 'grid'
  liSwipe1: 'Swipe to start 👉',
  liSwipe2: 'Swipe for Option A 👉',
  liSwipe3: 'Swipe for Option B 👉',
  liSwipe4: 'Swipe for Option C 👉',
  liSwipe5: 'Swipe for Option D 👉',
  liSwipe6: 'Swipe for Answer Check 👉',
  liSwipe7: 'Swipe for the Reveal 👉',
  liSwipe8: 'End of Carousel 🎉',
  options: {
    A: 'The Landing layer stores raw data; the Gold layer stores cleansed events directly.',
    B: 'The Bronze layer stores the raw unaltered data; the Silver layer stores cleansed and enriched events.',
    C: 'The Bronze layer stores cleansed events; the Silver layer stores aggregated business data marts.',
    D: 'The Silver layer stores raw unaltered data; the Gold layer stores cleansed events alongside aggregates.'
  },
  explanations: {
    A: 'The Gold layer is reserved for business-level aggregates and star-schema models rather than intermediate cleansed and conformed datasets.',
    B: "That's right! The Bronze layer retains raw historical data in its original form regardless of quality errors, whereas the Silver layer handles data cleansing, filtering, and contextual enrichment.",
    C: 'The Bronze layer does not clean or transform incoming records, as doing so would erase the original source audit trail.',
    D: 'Storing raw, unvalidated data directly in the Silver layer violates the Medallion progression, which relies on Bronze to isolate original source payloads.'
  }
};

let appState = loadState();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  bindEvents();
});

/* ==========================================================================
   STATE & PERSISTENCE
   ========================================================================== */
function loadState() {
  try {
    const saved = localStorage.getItem('quizcardgen_app_state') || localStorage.getItem('postsquare_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...DEFAULT_STATE, 
        ...parsed,
        showCounter: parsed.showCounter === true,
        cornerStyle: parsed.cornerStyle || 'square',
        liRevealColor: parsed.liRevealColor || '#10b981',
        options: {
          ...DEFAULT_STATE.options,
          ...(parsed.options || {})
        },
        explanations: {
          ...DEFAULT_STATE.explanations,
          ...(parsed.explanations || {})
        }
      };
    }
  } catch (err) {
    console.warn('Could not read from localStorage', err);
  }
  return { ...DEFAULT_STATE };
}

function saveState() {
  try {
    localStorage.setItem('quizcardgen_app_state', JSON.stringify(appState));
  } catch (err) {
    console.warn('Could not write to localStorage', err);
  }
}

/* ==========================================================================
   DOM INITIALIZATION & EVENT BINDINGS
   ========================================================================== */
function initDOM() {
  // Update all editable fields from state
  document.querySelectorAll('[data-field="topic"]').forEach(el => el.innerText = appState.topic);
  document.querySelectorAll('[data-field="question"]').forEach(el => el.innerText = appState.question);
  document.querySelectorAll('[data-field="author"]').forEach(el => {
    el.innerHTML = `<span class="author-symbol">@</span><span class="author-name">${escapeHTML(appState.author)}</span>`;
  });

  // 4-Block Grid Option Text
  const textA = document.getElementById('text-A');
  const textB = document.getElementById('text-B');
  const textC = document.getElementById('text-C');
  const textD = document.getElementById('text-D');
  if (textA) textA.innerText = appState.options.A;
  if (textB) textB.innerText = appState.options.B;
  if (textC) textC.innerText = appState.options.C;
  if (textD) textD.innerText = appState.options.D;

  // LinkedIn Slide Option Text
  const liTextA = document.getElementById('li-text-A');
  const liTextB = document.getElementById('li-text-B');
  const liTextC = document.getElementById('li-text-C');
  const liTextD = document.getElementById('li-text-D');
  if (liTextA) liTextA.innerText = appState.options.A;
  if (liTextB) liTextB.innerText = appState.options.B;
  if (liTextC) liTextC.innerText = appState.options.C;
  if (liTextD) liTextD.innerText = appState.options.D;

  // LinkedIn Slide 1 (Hook)
  const liHookTitle = document.getElementById('liHookTitle');
  const liHookSub = document.getElementById('liHookSub');
  if (liHookTitle) liHookTitle.innerText = appState.liHookTitle;
  if (liHookSub) liHookSub.innerText = appState.liHookSub;

  // LinkedIn Slide 2 (Scenario)
  const liScenarioTitle = document.getElementById('liScenarioTitle');
  const liScenarioText = document.getElementById('liScenarioText');
  const liScenarioHint = document.getElementById('liScenarioHint');
  if (liScenarioTitle) liScenarioTitle.innerText = appState.liScenarioTitle;
  if (liScenarioText) liScenarioText.innerText = appState.liScenarioText;
  if (liScenarioHint) liScenarioHint.innerText = appState.liScenarioHint;

  // LinkedIn Slide 2 Tag
  const liSlide2Tag = document.getElementById('liSlide2Tag');
  if (liSlide2Tag) liSlide2Tag.innerText = appState.liSlide2Tag || 'THE QUESTION / SCENARIO';

  // LinkedIn Slide 7 (Engagement)
  const liEngagementTitle = document.getElementById('liEngagementTitle');
  const liEngagementText = document.getElementById('liEngagementText');
  const liEngagementSub = document.getElementById('liEngagementSub');
  const liSlide7Tag = document.getElementById('liSlide7Tag');
  if (liEngagementTitle) liEngagementTitle.innerText = appState.liEngagementTitle;
  if (liEngagementText) liEngagementText.innerText = appState.liEngagementText;
  if (liEngagementSub) liEngagementSub.innerText = appState.liEngagementSub;
  if (liSlide7Tag) liSlide7Tag.innerText = appState.liSlide7Tag || 'PAUSE & REFLECT';

  // LinkedIn Slide 8 (Reveal)
  const liSlide8Tag = document.getElementById('liSlide8Tag');
  const liRevealAnswerText = document.getElementById('liRevealAnswerText');
  const liPostCta = document.getElementById('liPostCta');

  if (liSlide8Tag) liSlide8Tag.innerText = appState.liSlide8Tag || 'ANSWER REVEAL & BREAKDOWN';
  if (liRevealAnswerText) liRevealAnswerText.innerText = appState.liRevealAnswerText || `CORRECT ANSWER: OPTION ${appState.liRevealAnswer || 'B'}`;
  if (liPostCta) liPostCta.innerText = appState.liPostCta;

  // LinkedIn Header & Caption
  const liAuthorName = document.getElementById('liAuthorName');
  const liAuthorHeadline = document.getElementById('liAuthorHeadline');
  const liPostCaption = document.getElementById('liPostCaption');
  const liDocFilename = document.getElementById('liDocFilename');
  if (liAuthorName) liAuthorName.innerText = appState.liAuthorName;
  if (liAuthorHeadline) liAuthorHeadline.innerText = appState.liAuthorHeadline;
  if (liPostCaption) liPostCaption.innerText = appState.liPostCaption;
  if (liDocFilename) liDocFilename.innerText = appState.liDocFilename;

  // LinkedIn Slide 1-8 Swipe Prompts (Live In-Place Editable)
  for (let i = 1; i <= 8; i++) {
    const swipeEl = document.getElementById(`liSwipe${i}`);
    if (swipeEl) {
      swipeEl.innerText = appState[`liSwipe${i}`] || (DEFAULT_STATE[`liSwipe${i}`] || '');
    }
  }

  // Bind Semantic Version into UI elements
  document.querySelectorAll('.app-version-val').forEach(el => el.innerText = APP_VERSION);
  const headerVersion = document.getElementById('appVersionHeader');
  if (headerVersion) headerVersion.innerText = APP_VERSION;
  const footerVersion = document.getElementById('footerAppVersion');
  if (footerVersion) footerVersion.innerText = APP_VERSION;
  const drawerVersion = document.getElementById('drawerAppVersion');
  if (drawerVersion) drawerVersion.innerText = APP_VERSION;

  // Set current year in footer
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.innerText = new Date().getFullYear();

  // Sync drawer form inputs
  const topicInput = document.getElementById('globalTopicInput');
  const questionInput = document.getElementById('globalQuestionInput');
  const authorInput = document.getElementById('globalAuthorInput');
  const formOptA = document.getElementById('formOptA');
  const formOptB = document.getElementById('formOptB');
  const formOptC = document.getElementById('formOptC');
  const formOptD = document.getElementById('formOptD');

  if (topicInput) topicInput.value = appState.topic;
  if (questionInput) questionInput.value = appState.question;
  if (authorInput) authorInput.value = appState.author;
  if (formOptA) formOptA.value = appState.options.A;
  if (formOptB) formOptB.value = appState.options.B;
  if (formOptC) formOptC.value = appState.options.C;
  if (formOptD) formOptD.value = appState.options.D;

  // Drawer LinkedIn form inputs
  const drawerHookTitle = document.getElementById('drawerLiHookTitle');
  const drawerHookSub = document.getElementById('drawerLiHookSub');
  const drawerScenarioTitle = document.getElementById('drawerLiScenarioTitle');
  const drawerScenarioText = document.getElementById('drawerLiScenarioText');
  const drawerScenarioHint = document.getElementById('drawerLiScenarioHint');
  const drawerEngagementTitle = document.getElementById('drawerLiEngagementTitle');
  const drawerEngagementText = document.getElementById('drawerLiEngagementText');
  const drawerEngagementSub = document.getElementById('drawerLiEngagementSub');
  const drawerRevealAns = document.getElementById('drawerLiRevealAns');
  const drawerBullet1 = document.getElementById('drawerLiBullet1');
  const drawerExp1 = document.getElementById('drawerLiExp1');
  const drawerBullet2 = document.getElementById('drawerLiBullet2');
  const drawerExp2 = document.getElementById('drawerLiExp2');
  const drawerBullet3 = document.getElementById('drawerLiBullet3');
  const drawerExp3 = document.getElementById('drawerLiExp3');
  const drawerPostCta = document.getElementById('drawerLiPostCta');

  if (drawerHookTitle) drawerHookTitle.value = appState.liHookTitle;
  if (drawerHookSub) drawerHookSub.value = appState.liHookSub;
  if (drawerScenarioTitle) drawerScenarioTitle.value = appState.liScenarioTitle;
  if (drawerScenarioText) drawerScenarioText.value = appState.liScenarioText;
  if (drawerScenarioHint) drawerScenarioHint.value = appState.liScenarioHint;
  if (drawerEngagementTitle) drawerEngagementTitle.value = appState.liEngagementTitle;
  if (drawerEngagementText) drawerEngagementText.value = appState.liEngagementText;
  if (drawerEngagementSub) drawerEngagementSub.value = appState.liEngagementSub;
  if (drawerRevealAns) drawerRevealAns.value = appState.liRevealAnswer || 'B';
  if (drawerPostCta) drawerPostCta.value = appState.liPostCta;

  // Set Theme & Selectors
  document.body.className = appState.theme;
  const themePicker = document.getElementById('themePicker');
  if (themePicker) themePicker.value = appState.theme;

  const fontSizeSelect = document.getElementById('fontSizeSelect');
  if (fontSizeSelect) fontSizeSelect.value = appState.fontSize;
  updateFontSize(appState.fontSize);

  updateAnswerHighlight(appState.highlightAnswer);

  // Initialize Corner Style (Square by default - no white parts)
  updateCornerStyle(appState.cornerStyle || 'square');

  // Initialize Slide Counter ("Card 1/4" - OFF by default as requested)
  updateCounterVisibility(appState.showCounter === true);

  // Initialize Export Sizes (both header and LinkedIn action bar)
  const exportSizeSelect = document.getElementById('exportSizeSelect');
  if (exportSizeSelect) exportSizeSelect.value = String(appState.exportResolution || 1080);
  const liExportSizeSelect = document.getElementById('liExportSizeSelect');
  if (liExportSizeSelect) liExportSizeSelect.value = String(appState.exportResolution || 1080);

  // Initialize LinkedIn Carousel Navigation Components
  renderLiThumbnails();
  renderLiMiniDots();
  showLiSlide(appState.liSlideIndex || 0);

  // Set initial view (grid or linkedin, with URL parameter / hash support)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('view') === 'linkedin' || window.location.hash === '#linkedin') {
    appState.activeView = 'linkedin';
  } else if (urlParams.get('view') === 'grid' || window.location.hash === '#grid') {
    appState.activeView = 'grid';
  }

  if (urlParams.has('slide')) {
    const sIdx = parseInt(urlParams.get('slide'), 10);
    if (!isNaN(sIdx) && sIdx >= 0 && sIdx < LI_SLIDE_IDS.length) {
      appState.liSlideIndex = sIdx;
    }
  }

  // Initialize Slide 8 (Hero Correct Answer + Traps Breakdown + Color + Layout)
  renderSlide8();
  applyRevealColor(appState.liRevealColor || '#10b981');

  showLiSlide(appState.liSlideIndex || 0);
  setViewMode(appState.activeView || 'grid');
}

function bindEvents() {
  // Theme Switcher
  const themePicker = document.getElementById('themePicker');
  if (themePicker) {
    themePicker.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });
  }

  // Text Size Scale
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener('change', (e) => {
      updateFontSize(e.target.value);
    });
  }

  // Corner Style Selector (Square vs Rounded Transparent)
  const cornerStyleSelect = document.getElementById('cornerStyleSelect');
  if (cornerStyleSelect) {
    cornerStyleSelect.value = appState.cornerStyle || 'square';
    cornerStyleSelect.addEventListener('change', (e) => {
      updateCornerStyle(e.target.value);
    });
  }

  // Export Resolution Selector (280x280 Twitter Grid, 560x560, 1080x1080, 1200x1200)
  const exportSizeSelect = document.getElementById('exportSizeSelect');
  const liExportSizeSelect = document.getElementById('liExportSizeSelect');

  if (exportSizeSelect) {
    exportSizeSelect.value = String(appState.exportResolution || 1080);
    exportSizeSelect.addEventListener('change', (e) => {
      appState.exportResolution = parseInt(e.target.value, 10) || 1080;
      if (liExportSizeSelect) liExportSizeSelect.value = String(appState.exportResolution);
      saveState();
      showToast(`Export size set to ${appState.exportResolution}×${appState.exportResolution} px`);
    });
  }

  if (liExportSizeSelect) {
    liExportSizeSelect.value = String(appState.exportResolution || 1080);
    liExportSizeSelect.addEventListener('change', (e) => {
      appState.exportResolution = parseInt(e.target.value, 10) || 1080;
      if (exportSizeSelect) exportSizeSelect.value = String(appState.exportResolution);
      saveState();
      showToast(`Export size set to ${appState.exportResolution}×${appState.exportResolution} px`);
    });
  }

  // Quick Slide Counter Toggle Button (Card X/4)
  const quickToggleCounterBtn = document.getElementById('quickToggleCounterBtn');
  if (quickToggleCounterBtn) {
    quickToggleCounterBtn.addEventListener('click', () => {
      updateCounterVisibility(!appState.showCounter);
    });
  }

  // Answer Highlight Buttons
  document.querySelectorAll('.answer-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = btn.getAttribute('data-ans');
      updateAnswerHighlight(ans);
    });
  });

  // Quick Color Dots on Slide 8 (Emerald, Cyan, Violet, Amber, Rose)
  document.querySelectorAll('#liSlideColorPicker .color-dot[data-color]').forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const color = dot.getAttribute('data-color');
      applyRevealColor(color);
      showToast(`Slide 8 accent: ${color}`);
    });
  });

  // Quick Native Color Picker on Slide 8
  const quickRevealColorInput = document.getElementById('quickRevealColorInput');
  if (quickRevealColorInput) {
    quickRevealColorInput.addEventListener('input', (e) => {
      applyRevealColor(e.target.value);
    });
  }

  // Direct In-Place Contenteditable Event Listeners
  setupInPlaceEditing();

  // View Mode Toggles (4-Block Grid vs LinkedIn Carousel vs Zen Mode)
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewLinkedInBtn = document.getElementById('viewLinkedInBtn');
  const screenshotModeBtn = document.getElementById('screenshotModeBtn');
  const zenExitBtn = document.getElementById('zenExitBtn');

  if (viewGridBtn) viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  if (viewLinkedInBtn) viewLinkedInBtn.addEventListener('click', () => setViewMode('linkedin'));
  if (screenshotModeBtn) screenshotModeBtn.addEventListener('click', () => toggleZenScreenshot(true));
  if (zenExitBtn) zenExitBtn.addEventListener('click', () => toggleZenScreenshot(false));

  // Single View Navigation Buttons (Legacy compatibility)
  const prevCardBtn = document.getElementById('prevCardBtn');
  const nextCardBtn = document.getElementById('nextCardBtn');
  if (prevCardBtn) prevCardBtn.addEventListener('click', () => cycleSingleCard(-1));
  if (nextCardBtn) nextCardBtn.addEventListener('click', () => cycleSingleCard(1));

  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      focusCardByIndex(idx);
    });
  });

  // LinkedIn Document Carousel Navigation Chevrons
  const liPrevSlideBtn = document.getElementById('liPrevSlideBtn');
  const liNextSlideBtn = document.getElementById('liNextSlideBtn');
  if (liPrevSlideBtn) liPrevSlideBtn.addEventListener('click', prevLiSlide);
  if (liNextSlideBtn) liNextSlideBtn.addEventListener('click', nextLiSlide);

  // LinkedIn Action Bar Buttons
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  const liExportPdfActionBtn = document.getElementById('liExportPdfActionBtn');
  const liSaveSlidePngBtn = document.getElementById('liSaveSlidePngBtn');
  const liSaveAllPngBtn = document.getElementById('liSaveAllPngBtn');
  const liToggleViewModeBtn = document.getElementById('liToggleViewModeBtn');

  if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportLinkedInPdf);
  if (liExportPdfActionBtn) liExportPdfActionBtn.addEventListener('click', exportLinkedInPdf);
  if (liSaveSlidePngBtn) liSaveSlidePngBtn.addEventListener('click', exportActiveLiSlidePng);
  if (liSaveAllPngBtn) liSaveAllPngBtn.addEventListener('click', exportAllLiSlidesPng);
  if (liToggleViewModeBtn) liToggleViewModeBtn.addEventListener('click', toggleLiViewMode);

  // Touch Swipe Gesture for LinkedIn Carousel (Mobile & Trackpad swipe)
  const liViewport = document.getElementById('liSlidesViewport');
  if (liViewport) {
    let touchStartX = 0;
    liViewport.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    liViewport.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) nextLiSlide(); // Swipe Left -> Next Slide
          else prevLiSlide(); // Swipe Right -> Prev Slide
        }
      }
    }, { passive: true });
  }

  // Global Keybindings (Esc exits zen mode, Left/Right navigates LinkedIn slides or single card)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.body.classList.contains('clean-screenshot-mode')) {
        toggleZenScreenshot(false);
      }
      closePasteModal();
      closeDrawer();
    } else if (!isEditingActive()) {
      if (appState.activeView === 'linkedin') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          nextLiSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          prevLiSlide();
        }
      } else if (document.getElementById('cardsContainer')?.classList.contains('layout-single')) {
        if (e.key === 'ArrowRight') {
          cycleSingleCard(1);
        } else if (e.key === 'ArrowLeft') {
          cycleSingleCard(-1);
        }
      }
    }
  });

  // Export All 4 Blocks Action (Twitter / Social PNGs)
  const exportAllBtn = document.getElementById('exportAllBtn');
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', exportAllCards);
  }

  // Smart Paste Modal Controls
  const smartPasteTriggerBtn = document.getElementById('smartPasteTriggerBtn');
  const closePasteModalBtn = document.getElementById('closePasteModalBtn');
  const cancelPasteModalBtn = document.getElementById('cancelPasteModalBtn');
  const applyPasteBtn = document.getElementById('applyPasteBtn');
  const loadSampleBtn = document.getElementById('loadSampleBtn');

  if (smartPasteTriggerBtn) smartPasteTriggerBtn.addEventListener('click', openPasteModal);
  if (closePasteModalBtn) closePasteModalBtn.addEventListener('click', closePasteModal);
  if (cancelPasteModalBtn) cancelPasteModalBtn.addEventListener('click', closePasteModal);
  if (applyPasteBtn) applyPasteBtn.addEventListener('click', applySmartPaste);
  if (loadSampleBtn) loadSampleBtn.addEventListener('click', loadSampleIntoPaste);

  // Side Drawer Controls
  const editorDrawerBtn = document.getElementById('editorDrawerBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  if (editorDrawerBtn) editorDrawerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);

  // Form input changes in side drawer
  setupDrawerFormSync();

  // Reset & Clear buttons
  const resetDefaultBtn = document.getElementById('resetDefaultBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (resetDefaultBtn) resetDefaultBtn.addEventListener('click', resetToDefault);
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllContent);

  // Toggles for visual features
  const toggleQuoteMarks = document.getElementById('toggleQuoteMarks');
  const toggleGlowEffect = document.getElementById('toggleGlowEffect');
  const toggleSlideCounter = document.getElementById('toggleSlideCounter');

  if (toggleQuoteMarks) {
    toggleQuoteMarks.addEventListener('change', (e) => {
      appState.showQuotes = e.target.checked;
      document.querySelectorAll('.option-quote-icon').forEach(q => {
        q.style.display = e.target.checked ? 'block' : 'none';
      });
      saveState();
    });
  }

  if (toggleGlowEffect) {
    toggleGlowEffect.addEventListener('change', (e) => {
      appState.showGlow = e.target.checked;
      document.querySelectorAll('.card-glow').forEach(g => {
        g.style.opacity = e.target.checked ? '0.9' : '0';
      });
      saveState();
    });
  }

  if (toggleSlideCounter) {
    toggleSlideCounter.checked = appState.showCounter === true;
    toggleSlideCounter.addEventListener('change', (e) => {
      updateCounterVisibility(e.target.checked);
    });
  }
}

/* ==========================================================================
   IN-PLACE EDITING & SYNC (TWO-WAY BIDIRECTIONAL SYNC)
   ========================================================================== */
function setupInPlaceEditing() {
  // Synchronize options A, B, C, D across both 4-Block Grid and LinkedIn Slide 3-6
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const gridEl = document.getElementById(`text-${letter}`);
    const liEl = document.getElementById(`li-text-${letter}`);
    const formEl = document.getElementById(`formOpt${letter}`);

    if (gridEl) {
      gridEl.addEventListener('input', () => {
        const val = gridEl.innerText.trim();
        appState.options[letter] = val;
        if (liEl) liEl.innerText = val;
        if (formEl) formEl.value = val;
        saveState();
      });
    }

    if (liEl) {
      liEl.addEventListener('input', () => {
        const val = liEl.innerText.trim();
        appState.options[letter] = val;
        if (gridEl) gridEl.innerText = val;
        if (formEl) formEl.value = val;
        saveState();
      });
    }
  });

  // Topic tag sync across all cards & LinkedIn slides
  document.querySelectorAll('[data-field="topic"]').forEach(el => {
    el.addEventListener('input', (e) => {
      const val = e.target.innerText.trim();
      appState.topic = val;
      document.querySelectorAll('[data-field="topic"]').forEach(other => {
        if (other !== e.target) other.innerText = val;
      });
      const topicInput = document.getElementById('globalTopicInput');
      if (topicInput) topicInput.value = val;
      saveState();
    });
  });

  // Question header sync across all cards & LinkedIn slides
  document.querySelectorAll('[data-field="question"]').forEach(el => {
    el.addEventListener('input', (e) => {
      const val = e.target.innerText;
      appState.question = val;
      document.querySelectorAll('[data-field="question"]').forEach(other => {
        if (other !== e.target) other.innerText = val;
      });
      const qInput = document.getElementById('globalQuestionInput');
      if (qInput) qInput.value = val;
      saveState();
    });
  });

  // Author watermark sync across all cards and LinkedIn slides
  document.querySelectorAll('[data-field="author"]').forEach(el => {
    el.addEventListener('input', (e) => {
      const rawText = el.innerText || '';
      const authorName = rawText.replace(/^@+/, '').trim();
      appState.author = authorName;
      document.querySelectorAll('[data-field="author"]').forEach(other => {
        if (other !== e.target) {
          other.innerHTML = `<span class="author-symbol">@</span><span class="author-name">${escapeHTML(appState.author)}</span>`;
        }
      });
      const authorInput = document.getElementById('globalAuthorInput');
      if (authorInput) authorInput.value = appState.author;
      saveState();
    });
  });

  // LinkedIn Specific Contenteditable Elements
  const liInPlaceFields = [
    { id: 'liHookTitle', key: 'liHookTitle', drawerId: 'drawerLiHookTitle' },
    { id: 'liHookSub', key: 'liHookSub', drawerId: 'drawerLiHookSub' },
    { id: 'liSlide2Tag', key: 'liSlide2Tag' },
    { id: 'liScenarioTitle', key: 'liScenarioTitle', drawerId: 'drawerLiScenarioTitle' },
    { id: 'liScenarioText', key: 'liScenarioText', drawerId: 'drawerLiScenarioText' },
    { id: 'liScenarioHint', key: 'liScenarioHint', drawerId: 'drawerLiScenarioHint' },
    { id: 'liSlide7Tag', key: 'liSlide7Tag' },
    { id: 'liEngagementTitle', key: 'liEngagementTitle', drawerId: 'drawerLiEngagementTitle' },
    { id: 'liEngagementText', key: 'liEngagementText', drawerId: 'drawerLiEngagementText' },
    { id: 'liEngagementSub', key: 'liEngagementSub', drawerId: 'drawerLiEngagementSub' },
    { id: 'liSlide8Tag', key: 'liSlide8Tag' },
    { id: 'liRevealAnswerText', key: 'liRevealAnswerText' },
    { id: 'liBullet1', key: 'liBullet1', drawerId: 'drawerLiBullet1' },
    { id: 'liExp1', key: 'liExp1', drawerId: 'drawerLiExp1' },
    { id: 'liBullet2', key: 'liBullet2', drawerId: 'drawerLiBullet2' },
    { id: 'liExp2', key: 'liExp2', drawerId: 'drawerLiExp2' },
    { id: 'liBullet3', key: 'liBullet3', drawerId: 'drawerLiBullet3' },
    { id: 'liExp3', key: 'liExp3', drawerId: 'drawerLiExp3' },
    { id: 'liPostCta', key: 'liPostCta', drawerId: 'drawerLiPostCta' },
    { id: 'liAuthorName', key: 'liAuthorName' },
    { id: 'liAuthorHeadline', key: 'liAuthorHeadline' },
    { id: 'liPostCaption', key: 'liPostCaption' }
  ];

  liInPlaceFields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;
    el.addEventListener('input', () => {
      const val = el.innerText.trim();
      appState[field.key] = val;
      if (field.drawerId) {
        const dEl = document.getElementById(field.drawerId);
        if (dEl) dEl.value = val;
      }
      saveState();
    });
  });

  // In-Place editing for Slide 1-8 Swipe Prompts
  for (let i = 1; i <= 8; i++) {
    const swipeEl = document.getElementById(`liSwipe${i}`);
    if (swipeEl) {
      swipeEl.addEventListener('input', () => {
        appState[`liSwipe${i}`] = swipeEl.innerText;
        saveState();
      });
    }
  }

  // In-Place editing for Slide 8 Hero Option text
  const heroOptionText = document.getElementById('liCorrectOptionText');
  if (heroOptionText) {
    heroOptionText.addEventListener('input', () => {
      const val = heroOptionText.innerText.trim();
      const correctLetter = (appState.liRevealAnswer || 'B').toUpperCase();
      appState.options[correctLetter] = val;
      const gridEl = document.getElementById(`text-${correctLetter}`);
      const liEl = document.getElementById(`li-text-${correctLetter}`);
      const formEl = document.getElementById(`formOpt${correctLetter}`);
      if (gridEl) gridEl.innerText = val;
      if (liEl) liEl.innerText = val;
      if (formEl) formEl.value = val;
      saveState();
    });
  }

  // In-Place editing for Slide 8 Hero Explanation text
  const heroExpText = document.getElementById('liCorrectExpText');
  if (heroExpText) {
    heroExpText.addEventListener('input', () => {
      const val = heroExpText.innerText.trim();
      const correctLetter = (appState.liRevealAnswer || 'B').toUpperCase();
      appState.explanations[correctLetter] = val;
      const drawerInput = document.getElementById(`drawerExp${correctLetter}`);
      if (drawerInput) drawerInput.value = val;
      saveState();
    });
  }
}

function setupDrawerFormSync() {
  const syncMap = [
    { inputId: 'globalTopicInput', field: 'topic', selector: '[data-field="topic"]' },
    { inputId: 'globalQuestionInput', field: 'question', selector: '[data-field="question"]' },
    { inputId: 'drawerLiHookTitle', field: 'liHookTitle', targetId: 'liHookTitle' },
    { inputId: 'drawerLiHookSub', field: 'liHookSub', targetId: 'liHookSub' },
    { inputId: 'drawerLiScenarioTitle', field: 'liScenarioTitle', targetId: 'liScenarioTitle' },
    { inputId: 'drawerLiScenarioText', field: 'liScenarioText', targetId: 'liScenarioText' },
    { inputId: 'drawerLiScenarioHint', field: 'liScenarioHint', targetId: 'liScenarioHint' },
    { inputId: 'drawerLiEngagementTitle', field: 'liEngagementTitle', targetId: 'liEngagementTitle' },
    { inputId: 'drawerLiEngagementText', field: 'liEngagementText', targetId: 'liEngagementText' },
    { inputId: 'drawerLiEngagementSub', field: 'liEngagementSub', targetId: 'liEngagementSub' },
    { inputId: 'drawerLiPostCta', field: 'liPostCta', targetId: 'liPostCta' }
  ];

  syncMap.forEach(item => {
    const input = document.getElementById(item.inputId);
    if (!input) return;

    input.addEventListener('input', (e) => {
      const val = e.target.value;
      appState[item.field] = val;
      if (item.targetId) {
        const targetEl = document.getElementById(item.targetId);
        if (targetEl) targetEl.innerText = val;
      } else if (item.selector) {
        document.querySelectorAll(item.selector).forEach(el => el.innerText = val);
      }
      saveState();
    });
  });

  // Drawer Options Inputs A, B, C, D
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const input = document.getElementById(`formOpt${letter}`);
    if (!input) return;
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      appState.options[letter] = val;
      const gridEl = document.getElementById(`text-${letter}`);
      const liEl = document.getElementById(`li-text-${letter}`);
      if (gridEl) gridEl.innerText = val;
      if (liEl) liEl.innerText = val;
      saveState();
    });
  });

  // Drawer Author
  const authorInput = document.getElementById('globalAuthorInput');
  if (authorInput) {
    authorInput.addEventListener('input', (e) => {
      appState.author = e.target.value;
      document.querySelectorAll('[data-field="author"]').forEach(el => {
        el.innerHTML = `<span class="author-symbol">@</span><span class="author-name">${escapeHTML(appState.author)}</span>`;
      });
      saveState();
    });
  }

  // Drawer Reveal Answer Select & Pills
  const drawerRevealAns = document.getElementById('drawerLiRevealAns');
  if (drawerRevealAns) {
    drawerRevealAns.addEventListener('change', (e) => {
      updateRevealAnswer(e.target.value);
    });
  }

  document.querySelectorAll('#drawerCorrectOptionPills .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const opt = btn.getAttribute('data-opt');
      updateRevealAnswer(opt);
      showToast(`Set winning answer: Option ${opt}`);
    });
  });

  // Drawer Swatch Color Buttons
  document.querySelectorAll('.color-palette-row .swatch-btn[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      applyRevealColor(color);
      showToast(`Slide 8 accent set to ${color}`);
    });
  });

  // Drawer Custom Hex Color Input
  const drawerLiRevealColor = document.getElementById('drawerLiRevealColor');
  if (drawerLiRevealColor) {
    drawerLiRevealColor.addEventListener('input', (e) => {
      applyRevealColor(e.target.value);
    });
  }

  // Drawer Explanations A, B, C, D
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const expInput = document.getElementById(`drawerExp${letter}`);
    if (expInput) {
      expInput.addEventListener('input', (e) => {
        appState.explanations[letter] = e.target.value;
        renderSlide8();
        saveState();
      });
    }
  });
}

/* ==========================================================================
   THEMES & STYLES
   ========================================================================== */
function setTheme(themeClass) {
  appState.theme = themeClass;
  document.body.className = themeClass;
  saveState();
  showToast(`Theme changed to ${themeClass.replace('theme-', '').toUpperCase()}`);
}

function updateFontSize(sizeClass) {
  appState.fontSize = sizeClass;
  const container = document.getElementById('cardsContainer');
  if (container) {
    container.classList.remove('font-compact', 'font-medium', 'font-large');
    container.classList.add(sizeClass);
  }
  saveState();
}

function updateAnswerHighlight(ans) {
  appState.highlightAnswer = ans;
  document.querySelectorAll('.answer-pill').forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-ans') === ans);
  });

  ['A', 'B', 'C', 'D'].forEach(letter => {
    const card = document.getElementById(`card-${letter}`);
    if (card) {
      card.classList.toggle('is-correct-answer', ans === letter);
    }
  });
  saveState();
}

/**
 * Toggle visibility of "Card X/4" slide counters on all cards
 */
function updateCounterVisibility(show) {
  appState.showCounter = !!show;
  document.querySelectorAll('.post-slide-counter').forEach(el => {
    el.style.display = appState.showCounter ? 'block' : 'none';
  });

  const btn = document.getElementById('quickToggleCounterBtn');
  const txt = document.getElementById('counterBtnText');
  if (btn) btn.classList.toggle('active', appState.showCounter);
  if (txt) txt.innerText = appState.showCounter ? 'Card X/4: ON' : 'Card X/4: OFF';

  const drawerCheckbox = document.getElementById('toggleSlideCounter');
  if (drawerCheckbox) drawerCheckbox.checked = appState.showCounter;

  saveState();
}

/**
 * Update corner & background rendering style (square full-bleed vs transparent rounded)
 */
function updateCornerStyle(style) {
  appState.cornerStyle = style;
  const cards = document.querySelectorAll('.square-card');
  cards.forEach(card => {
    card.classList.remove('corner-square', 'corner-rounded');
    if (style === 'square') {
      card.classList.add('corner-square');
    } else {
      card.classList.add('corner-rounded');
    }
  });

  const select = document.getElementById('cornerStyleSelect');
  if (select) select.value = style;

  saveState();
}

/* ==========================================================================
   1:1 SQUARE IMAGE EXPORT & CLIPBOARD FUNCTIONS
   ========================================================================== */

/**
 * Downloads a single 1:1 square card as a crisp 1080x1080px PNG image
 */
async function downloadCardImage(cardId, label) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const targetSize = parseInt(appState.exportResolution, 10) || 1080;
  showToast(`Generating ${targetSize}×${targetSize} image for ${label}...`);

  try {
    const blob = await captureCardAsBlob(card, targetSize);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Format sanitized filename
    const sanitizedLabel = (label || 'Post_Square').replace(/[^a-z0-9_-]/gi, '_');
    link.download = `${sanitizedLabel}_${targetSize}x${targetSize}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`✓ Downloaded ${label} (${targetSize}×${targetSize} PNG)!`);
  } catch (err) {
    console.error('Image export error:', err);
    showToast('⚠️ Could not export image directly. Please try Zen Screenshot.');
  }
}

/**
 * Copies a 1:1 square card directly to the user's system clipboard as an image
 */
async function copyCardAsImage(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const targetSize = parseInt(appState.exportResolution, 10) || 1080;
  showToast(`Rendering ${targetSize}×${targetSize} card to clipboard...`);

  try {
    const blob = await captureCardAsBlob(card, targetSize);
    
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      showToast(`✓ Copied ${targetSize}×${targetSize} image to clipboard! Ready to paste.`);
    } else {
      // Fallback: download if clipboard item not supported
      downloadCardImage(cardId, 'Card_Copy');
    }
  } catch (err) {
    console.error('Clipboard copy error:', err);
    // Fallback: trigger normal download
    downloadCardImage(cardId, 'Card_Image');
  }
}

/**
 * Batch exports all 4 cards sequentially at selected resolution
 */
async function exportAllCards() {
  const targetSize = parseInt(appState.exportResolution, 10) || 1080;
  const cards = [
    { id: 'card-A', name: 'Option_A' },
    { id: 'card-B', name: 'Option_B' },
    { id: 'card-C', name: 'Option_C' },
    { id: 'card-D', name: 'Option_D' }
  ];

  showToast(`Starting batch export of all 4 square cards (${targetSize}×${targetSize})...`);

  for (let i = 0; i < cards.length; i++) {
    const { id, name } = cards[i];
    await downloadCardImage(id, name);
    // Small timeout to allow browser download queue to process cleanly
    await new Promise(r => setTimeout(r, 450));
  }

  showToast(`🎉 All 4 square cards (${targetSize}×${targetSize}) exported successfully!`);
}

/**
 * Captures a card element with html2canvas (or SVG fallback) at exact target resolution.
 * Supports supersampling (SSAA) for compact sizes like 280x280 to retain razor-sharp quality.
 * Ensures 100% transparent PNG corners or clean full-bleed square with zero white borders.
 */
async function captureCardAsBlob(cardElement, targetSize = 1080) {
  // Ensure the card is rendered and measurable even if in single-card mode
  const unit = cardElement.closest('.card-unit');
  const wasHidden = unit && window.getComputedStyle(unit).display === 'none';
  let prevUnitStyle = '';

  if (wasHidden) {
    prevUnitStyle = unit.getAttribute('style') || '';
    unit.style.display = 'block';
    unit.style.position = 'fixed';
    unit.style.top = '-9999px';
    unit.style.left = '-9999px';
    unit.style.width = '500px';
    unit.style.zIndex = '-999';
  }

  // Remove active contenteditable outline
  const activeEl = document.activeElement;
  if (activeEl && cardElement.contains(activeEl)) {
    activeEl.blur();
  }

  // Temporarily remove box-shadow to prevent white or fuzzy shadow halos outside card
  const prevBoxShadow = cardElement.style.boxShadow;
  cardElement.style.boxShadow = 'none';

  // Temporarily force 0 border-radius if full square mode
  let prevBorderRadius = '';
  if (appState.cornerStyle === 'square') {
    prevBorderRadius = cardElement.style.borderRadius;
    cardElement.style.borderRadius = '0px';
  }

  try {
    let rawCanvas;
    if (typeof html2canvas === 'function') {
      const elementWidth = cardElement.offsetWidth || 500;
      
      // Supersampling (SSAA): For small sizes like 280x280, render at at least 560px
      // so fonts and badges are rendered with subpixel precision and downscaled smoothly!
      const renderSize = targetSize <= 560 ? Math.max(targetSize * 2, 560) : targetSize;
      const scale = renderSize / elementWidth;

      rawCanvas = await html2canvas(cardElement, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null // transparent canvas
      });
    } else {
      // Fallback pure SVG canvas rendering if html2canvas is unavailable
      return await renderWithSvgForeignObject(cardElement, targetSize);
    }

    // Compose onto finalCanvas to guarantee target size and 100% transparency
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetSize;
    finalCanvas.height = targetSize;
    const ctx = finalCanvas.getContext('2d');

    // High quality bicubic resampling for downscaled images (e.g. 280x280)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear entire canvas to pure transparent alpha (rgba 0,0,0,0)
    ctx.clearRect(0, 0, targetSize, targetSize);

    if (appState.cornerStyle === 'rounded-transparent') {
      // Mask canvas to rounded rectangle path so the 4 corners are 100% pure transparent alpha
      const cornerRadius = 22 * (targetSize / (cardElement.offsetWidth || 500));
      ctx.save();
      ctx.beginPath();
      pathRoundRect(ctx, 0, 0, targetSize, targetSize, cornerRadius);
      ctx.clip();
      ctx.drawImage(rawCanvas, 0, 0, targetSize, targetSize);
      ctx.restore();
    } else if (appState.cornerStyle === 'rounded-dark') {
      // Fill background with matching dark canvas color, then draw rounded card
      const themeBg = getComputedStyle(document.body).getPropertyValue('--bg-app').trim() || '#07090e';
      ctx.fillStyle = themeBg;
      ctx.fillRect(0, 0, targetSize, targetSize);
      const cornerRadius = 22 * (targetSize / (cardElement.offsetWidth || 500));
      ctx.save();
      ctx.beginPath();
      pathRoundRect(ctx, 0, 0, targetSize, targetSize, cornerRadius);
      ctx.clip();
      ctx.drawImage(rawCanvas, 0, 0, targetSize, targetSize);
      ctx.restore();
    } else {
      // 'square' (Default): Clean solid full bleed post
      // Entire square is filled edge-to-edge. No outer white part!
      ctx.drawImage(rawCanvas, 0, 0, targetSize, targetSize);
    }

    return new Promise((resolve, reject) => {
      finalCanvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      }, 'image/png');
    });

  } finally {
    // Restore original styles
    cardElement.style.boxShadow = prevBoxShadow;
    if (appState.cornerStyle === 'square') {
      cardElement.style.borderRadius = prevBorderRadius;
    }
    if (wasHidden && unit) {
      if (prevUnitStyle) unit.setAttribute('style', prevUnitStyle);
      else unit.removeAttribute('style');
    }
  }
}

/**
 * Path helper for rounded rectangle clipping
 */
function pathRoundRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

/**
 * Native Canvas / SVG ForeignObject renderer fallback (Zero dependencies)
 */
async function renderWithSvgForeignObject(element, size = 1080) {
  const cloned = element.cloneNode(true);
  const wrapper = document.createElement('div');
  wrapper.appendChild(cloned);

  const styleSheets = Array.from(document.styleSheets);
  let cssText = '';
  for (const sheet of styleSheets) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      cssText += rules.map(r => r.cssText).join('\n');
    } catch (e) {
      // cross-origin stylesheets ignored
    }
  }

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${size}px; height:${size}px; display:flex; flex-direction:column;">
          <style>${cssText}</style>
          ${wrapper.innerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Fallback canvas export failed'));
      }, 'image/png');
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/* ==========================================================================
   VIEW MODES & NAVIGATION
   ========================================================================== */
const LI_SLIDE_IDS = [
  'li-slide-1', 'li-slide-2', 'li-slide-3', 'li-slide-4',
  'li-slide-5', 'li-slide-6', 'li-slide-7', 'li-slide-8'
];

const LI_SLIDE_TITLES = [
  '1. Hook', '2. Scenario', '3. Option A', '4. Option B',
  '5. Option C', '6. Option D', '7. Engagement', '8. Answer Reveal'
];

let currentSingleIndex = 0;
const CARD_IDS = ['card-A', 'card-B', 'card-C', 'card-D'];
const UNIT_IDS = ['unit-A', 'unit-B', 'unit-C', 'unit-D'];

function setViewMode(mode) {
  const container = document.getElementById('cardsContainer');
  const liWorkspace = document.getElementById('linkedinWorkspace');
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewLinkedInBtn = document.getElementById('viewLinkedInBtn');
  const singleNav = document.getElementById('singleNavBar');
  const exportAllBtn = document.getElementById('exportAllBtn');

  appState.activeView = mode;
  saveState();

  if (mode === 'grid') {
    if (container) {
      container.classList.remove('hidden', 'layout-single');
      container.classList.add('layout-grid');
    }
    if (liWorkspace) liWorkspace.classList.add('hidden');
    if (viewGridBtn) viewGridBtn.classList.add('active');
    if (viewLinkedInBtn) viewLinkedInBtn.classList.remove('active');
    if (singleNav) singleNav.classList.add('hidden');

    UNIT_IDS.forEach(id => {
      document.getElementById(id)?.classList.remove('active-focus');
    });

    if (exportAllBtn) {
      const span = exportAllBtn.querySelector('span');
      if (span) span.innerText = 'Export 4 PNGs';
    }
  } else if (mode === 'linkedin') {
    if (container) container.classList.add('hidden');
    if (liWorkspace) liWorkspace.classList.remove('hidden');
    if (viewLinkedInBtn) viewLinkedInBtn.classList.add('active');
    if (viewGridBtn) viewGridBtn.classList.remove('active');
    if (singleNav) singleNav.classList.add('hidden');

    showLiSlide(appState.liSlideIndex || 0);

    if (exportAllBtn) {
      const span = exportAllBtn.querySelector('span');
      if (span) span.innerText = 'Export 4 PNGs';
    }
  } else {
    // Single view fallback
    if (container) {
      container.classList.remove('hidden', 'layout-grid');
      container.classList.add('layout-single');
    }
    if (liWorkspace) liWorkspace.classList.add('hidden');
    if (singleNav) singleNav.classList.remove('hidden');
    focusCardByIndex(currentSingleIndex);
  }
}

function focusSingleCard(optionLetter) {
  const index = ['A', 'B', 'C', 'D'].indexOf(optionLetter.toUpperCase());
  if (index !== -1) {
    currentSingleIndex = index;
    setViewMode('single');
    focusCardByIndex(index);
  }
}

function focusCardByIndex(index) {
  currentSingleIndex = (index + 4) % 4;

  UNIT_IDS.forEach((id, i) => {
    const unit = document.getElementById(id);
    if (unit) {
      unit.classList.toggle('active-focus', i === currentSingleIndex);
    }
  });

  document.querySelectorAll('.nav-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSingleIndex);
  });
}

function cycleSingleCard(direction) {
  focusCardByIndex(currentSingleIndex + direction);
}

/* ==========================================================================
   LINKEDIN CAROUSEL SLIDE PLAYER & CONTROLS
   ========================================================================== */
function showLiSlide(index) {
  const safeIndex = Math.max(0, Math.min(index, LI_SLIDE_IDS.length - 1));
  appState.liSlideIndex = safeIndex;

  LI_SLIDE_IDS.forEach((id, i) => {
    const slide = document.getElementById(id);
    if (slide) {
      slide.classList.toggle('active-slide', i === safeIndex);
    }
  });

  // Update Page Counter
  const counter = document.getElementById('liPageCounter');
  if (counter) counter.innerText = `${safeIndex + 1} / ${LI_SLIDE_IDS.length}`;

  // Update Progress Track Bar
  const fill = document.getElementById('liProgressFill');
  if (fill) fill.style.width = `${((safeIndex + 1) / LI_SLIDE_IDS.length) * 100}%`;

  // Update Prev / Next Chevrons disabled state
  const prevBtn = document.getElementById('liPrevSlideBtn');
  const nextBtn = document.getElementById('liNextSlideBtn');
  if (prevBtn) prevBtn.disabled = (safeIndex === 0);
  if (nextBtn) nextBtn.disabled = (safeIndex === LI_SLIDE_IDS.length - 1);

  // Update Mini Dots
  document.querySelectorAll('.li-mini-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === safeIndex);
  });

  // Update Thumbnails
  const strip = document.getElementById('liThumbnailStrip');
  document.querySelectorAll('.li-thumb-item').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === safeIndex);
    if (i === safeIndex && strip) {
      const scrollPos = thumb.offsetLeft - (strip.clientWidth / 2) + (thumb.clientWidth / 2);
      strip.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  });

  saveState();
}

function prevLiSlide() {
  if (appState.liSlideIndex > 0) {
    showLiSlide(appState.liSlideIndex - 1);
  }
}

function nextLiSlide() {
  if (appState.liSlideIndex < LI_SLIDE_IDS.length - 1) {
    showLiSlide(appState.liSlideIndex + 1);
  }
}

function renderLiThumbnails() {
  const strip = document.getElementById('liThumbnailStrip');
  if (!strip) return;

  strip.innerHTML = '';
  LI_SLIDE_TITLES.forEach((title, i) => {
    const item = document.createElement('div');
    item.className = `li-thumb-item ${i === (appState.liSlideIndex || 0) ? 'active' : ''}`;
    item.title = `Jump to ${title}`;
    const cleanTitle = title.replace(/^\d+\.\s*/, '');
    item.innerHTML = `
      <span class="li-thumb-num">P${i + 1}</span>
      <span class="li-thumb-title">${cleanTitle}</span>
    `;
    item.addEventListener('click', () => showLiSlide(i));
    strip.appendChild(item);
  });
}

function renderLiMiniDots() {
  const container = document.getElementById('liMiniDots');
  if (!container) return;

  container.innerHTML = '';
  LI_SLIDE_IDS.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `li-mini-dot ${i === (appState.liSlideIndex || 0) ? 'active' : ''}`;
    dot.title = `Slide ${i + 1}`;
    dot.addEventListener('click', () => showLiSlide(i));
    container.appendChild(dot);
  });
}

function toggleLiViewMode() {
  const viewport = document.getElementById('liSlidesViewport');
  const textSpan = document.getElementById('liViewModeText');
  if (!viewport) return;

  const isGrid = viewport.classList.toggle('view-grid-8');
  appState.liViewMode = isGrid ? 'grid' : 'player';
  if (textSpan) {
    textSpan.innerText = isGrid ? 'View Carousel Player' : 'View All 8 (Grid)';
  }
  showToast(isGrid ? 'Switched to 8-Slide Grid View' : 'Switched to Carousel Player View');
  saveState();
}

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(16, 185, 129, ${alpha})`;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(16, 185, 129, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyRevealColor(colorHex) {
  if (!colorHex) colorHex = '#10b981';
  appState.liRevealColor = colorHex;

  const slide8 = document.getElementById('li-slide-8');
  if (slide8) {
    slide8.style.setProperty('--reveal-accent', colorHex);
    slide8.style.setProperty('--reveal-border', hexToRgba(colorHex, 0.45));
    slide8.style.setProperty('--reveal-bg', hexToRgba(colorHex, 0.12));
    slide8.style.setProperty('--reveal-pill-bg', hexToRgba(colorHex, 0.22));
    slide8.style.setProperty('--reveal-text', colorHex);
  }

  // Sync quick color dots on Slide 8
  document.querySelectorAll('#liSlideColorPicker .color-dot').forEach(dot => {
    const dotColor = dot.getAttribute('data-color');
    dot.classList.toggle('active', !!dotColor && dotColor.toLowerCase() === colorHex.toLowerCase());
  });

  // Sync drawer swatches
  document.querySelectorAll('.color-palette-row .swatch-btn').forEach(btn => {
    const btnColor = btn.getAttribute('data-color');
    btn.classList.toggle('active', !!btnColor && btnColor.toLowerCase() === colorHex.toLowerCase());
  });

  // Sync native inputs
  const quickInput = document.getElementById('quickRevealColorInput');
  if (quickInput) quickInput.value = colorHex;
  const drawerInput = document.getElementById('drawerLiRevealColor');
  if (drawerInput) drawerInput.value = colorHex;

  saveState();
}

function renderSlide8() {
  const correctLetter = (appState.liRevealAnswer || 'B').toUpperCase();

  // 1. Correct Answer Pill Text
  const textEl = document.getElementById('liRevealAnswerText');
  if (textEl) {
    textEl.innerText = `CORRECT ANSWER: OPTION ${correctLetter}`;
  }

  // 2. Block 1: Hero Option & Explanation
  const heroOptionText = document.getElementById('liCorrectOptionText');
  if (heroOptionText) {
    heroOptionText.innerText = appState.options[correctLetter] || '';
  }

  const heroExpText = document.getElementById('liCorrectExpText');
  if (heroExpText) {
    heroExpText.innerText = appState.explanations[correctLetter] || "That's right! Cleaned, validated, and enriched table schemas.";
  }

  // 3. Block 2: Traps Breakdown for other 3 options
  const trapsList = document.getElementById('liTrapsList');
  if (trapsList) {
    trapsList.innerHTML = '';
    const otherLetters = ['A', 'B', 'C', 'D'].filter(l => l !== correctLetter);
    otherLetters.forEach(wrongLetter => {
      const trapItem = document.createElement('div');
      trapItem.className = 'trap-item';
      trapItem.setAttribute('data-opt', wrongLetter);

      const badge = document.createElement('span');
      badge.className = `trap-badge opt-${wrongLetter.toLowerCase()}`;
      badge.innerText = `${wrongLetter} ✗`;

      const text = document.createElement('span');
      text.className = 'trap-text';
      text.contentEditable = 'true';
      text.spellcheck = false;
      text.id = `liTrapExp${wrongLetter}`;
      text.setAttribute('data-trap-opt', wrongLetter);
      text.innerText = appState.explanations[wrongLetter] || 'Incorrect choice.';

      text.addEventListener('input', () => {
        const val = text.innerText.trim();
        appState.explanations[wrongLetter] = val;
        const drawerInput = document.getElementById(`drawerExp${wrongLetter}`);
        if (drawerInput) drawerInput.value = val;
        saveState();
      });

      trapItem.appendChild(badge);
      trapItem.appendChild(text);
      trapsList.appendChild(trapItem);
    });
  }

  // 4. Update Sidebar Explanation Labels & Tags dynamically!
  ['A', 'B', 'C', 'D'].forEach(letter => {
    const isCorrect = (letter === correctLetter);
    const tagEl = document.getElementById(`statusTag${letter}`);
    const inputEl = document.getElementById(`drawerExp${letter}`);
    const groupEl = document.getElementById(`groupExp${letter}`) || inputEl?.closest('.option-form-group');

    if (tagEl) {
      tagEl.innerText = isCorrect ? '(Correct Answer ✓)' : '(Why it fails ✗)';
      tagEl.className = `exp-status-tag ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    }
    if (groupEl) {
      groupEl.classList.toggle('group-correct', isCorrect);
    }
    if (inputEl) {
      inputEl.value = appState.explanations[letter] || '';
    }
  });

  // 5. Drawer answer pills & dropdown sync
  document.querySelectorAll('#drawerCorrectOptionPills .pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-opt') === correctLetter);
  });
  const selectEl = document.getElementById('drawerLiRevealAns');
  if (selectEl) selectEl.value = correctLetter;

  // 6. Apply styles
  applyRevealColor(appState.liRevealColor || '#10b981');
}

function updateRevealAnswer(letter) {
  const cleanLetter = (letter || 'B').toUpperCase();
  appState.liRevealAnswer = cleanLetter;
  appState.liRevealAnswerText = `CORRECT ANSWER: OPTION ${cleanLetter}`;

  renderSlide8();
  updateAnswerHighlight(cleanLetter);
  saveState();
}

/* ==========================================================================
   LINKEDIN PDF & PNG EXPORT PIPELINE (ZERO DISTORTION 1:1 SQUARE)
   ========================================================================== */

/**
 * Captures an authentic LinkedIn slide using the isolated 1080x1080 export sandbox.
 * Guarantees 100% exact 1:1 square ratio with zero viewport distortion,
 * proper font scaling, and optional resampling to targetSize (e.g. 280, 560, 1080, 1200).
 */
async function captureLinkedInSlideAsCanvas(slideId, targetSize = 1080) {
  const originalSlide = document.getElementById(slideId);
  if (!originalSlide) {
    throw new Error(`Slide ${slideId} not found`);
  }

  const sandbox = document.getElementById('exportRenderSandbox');
  if (!sandbox) {
    throw new Error('exportRenderSandbox not found in DOM');
  }

  // Clear sandbox and clone the slide
  sandbox.innerHTML = '';
  // Inherit the document theme class (e.g. theme-emerald, theme-cyan)
  sandbox.className = document.body.className;

  const clone = originalSlide.cloneNode(true);
  clone.id = `sandbox-${slideId}`;
  
  // Ensure all contenteditable outlines and active states are removed
  clone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
  });

  // If Slide 8, explicitly bind reveal color CSS variables
  if (slideId === 'li-slide-8') {
    const colorHex = appState.liRevealColor || '#10b981';
    clone.style.setProperty('--reveal-accent', colorHex);
    clone.style.setProperty('--reveal-border', hexToRgba(colorHex, 0.45));
    clone.style.setProperty('--reveal-bg', hexToRgba(colorHex, 0.12));
    clone.style.setProperty('--reveal-pill-bg', hexToRgba(colorHex, 0.22));
    clone.style.setProperty('--reveal-text', colorHex);
  }

  // Append clone into isolated 1080x1080 sandbox
  sandbox.appendChild(clone);

  try {
    // Render at crisp 1080x1080 resolution with transparent canvas
    // (background will be cleanly inherited from slide CSS)
    const canvas1080 = await html2canvas(clone, {
      width: 1080,
      height: 1080,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null
    });

    if (targetSize === 1080) {
      return canvas1080;
    }

    // High quality bicubic resampling if targetSize is different (e.g. 280, 560, 1200)
    const resampledCanvas = document.createElement('canvas');
    resampledCanvas.width = targetSize;
    resampledCanvas.height = targetSize;
    const ctx = resampledCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas1080, 0, 0, targetSize, targetSize);
    return resampledCanvas;
  } finally {
    // Clean up sandbox
    sandbox.innerHTML = '';
  }
}

/**
 * Generates an OS-safe timestamp without whitespace or forbidden characters.
 * Format: YYYYMMDD_HHMMSS (e.g. 20261021_130627).
 * Works reliably across Windows NTFS, macOS APFS, Linux, iOS, and Android.
 */
function getCrossPlatformTimestamp(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

/**
 * Builds the default LinkedIn PDF export filename:
 * <sanitized_category_tag>_<timestamp_without_whitespace>.pdf
 * Example: data_architecture_20261021_130627.pdf
 */
function generateLinkedInPdfFilename(customName = null) {
  let baseName = '';
  if (customName && customName.trim() && customName.trim() !== 'medallion_architecture_quiz.pdf') {
    baseName = customName
      .trim()
      .replace(/\.pdf$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  if (!baseName) {
    baseName = (appState.topic || 'quiz_carousel')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Ensure zero whitespace and valid filesystem characters
  baseName = baseName.replace(/[\s_]+/g, '_').replace(/^_+|_+$/g, '') || 'quiz_carousel';
  const timestamp = getCrossPlatformTimestamp();
  return `${baseName}_${timestamp}.pdf`;
}

/**
 * Exports LinkedIn Document Carousel as an authentic multi-page PDF (1080x1080 per page)
 * Zero dependencies on server, 100% offline using jsPDF.umd.min.js + html2canvas.
 * Uses lossless PNGs for crystal clear text and exact color matching.
 */
async function exportLinkedInPdf() {
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
    showToast('⚠️ jsPDF library is still loading. Please try again in a moment.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [1080, 1080],
    hotfixes: ['px_scaling']
  });

  showToast('📄 Generating 8-slide LinkedIn Document PDF (1080×1080)...');

  try {
    for (let i = 0; i < LI_SLIDE_IDS.length; i++) {
      const slideId = LI_SLIDE_IDS[i];
      showToast(`Rendering page ${i + 1} of 8 (${LI_SLIDE_TITLES[i]})...`);

      const canvas = await captureLinkedInSlideAsCanvas(slideId, 1080);
      const imgData = canvas.toDataURL('image/png'); // Lossless PNG format

      if (i > 0) {
        pdf.addPage([1080, 1080], 'portrait');
      }
      pdf.addImage(imgData, 'PNG', 0, 0, 1080, 1080, undefined, 'FAST');
    }

    // Generate OS-safe filename with category tag and cross-platform timestamp (zero whitespace)
    const filename = generateLinkedInPdfFilename(appState.liDocFilename);
    pdf.save(filename);

    showToast(`🎉 Exported ${filename}! Ready to upload as LinkedIn Document post.`);
  } catch (err) {
    console.error('LinkedIn PDF export error:', err);
    showToast('⚠️ Could not export PDF. Check browser console.');
  }
}

/**
 * Exports currently active LinkedIn slide as a 1080x1080 PNG
 */
async function exportActiveLiSlidePng() {
  const currentIndex = appState.liSlideIndex || 0;
  const slideId = LI_SLIDE_IDS[currentIndex];
  const name = LI_SLIDE_TITLES[currentIndex].replace(/[^a-z0-9_-]/gi, '_');
  await downloadSlideImage(slideId, name);
}

/**
 * Batch exports all 8 LinkedIn slides as individual 1080x1080 PNGs
 */
async function exportAllLiSlidesPng() {
  showToast('Starting export of all 8 LinkedIn slides as PNGs...');
  for (let i = 0; i < LI_SLIDE_IDS.length; i++) {
    const slideId = LI_SLIDE_IDS[i];
    const name = LI_SLIDE_TITLES[i].replace(/[^a-z0-9_-]/gi, '_');
    await downloadSlideImage(slideId, name);
    await new Promise(r => setTimeout(r, 400));
  }
  showToast('🎉 All 8 LinkedIn slides downloaded as PNG!');
}

/**
 * Captures and downloads an individual slide as PNG with exact square ratio
 */
async function downloadSlideImage(slideId, label) {
  const targetSize = parseInt(appState.exportResolution, 10) || 1080;
  showToast(`Generating ${label} (${targetSize}×${targetSize} PNG)...`);

  try {
    const canvas = await captureLinkedInSlideAsCanvas(slideId, targetSize);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `LinkedIn_${label}_${targetSize}x${targetSize}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`✓ Downloaded ${label} (${targetSize}×${targetSize} PNG)!`);
  } catch (err) {
    console.error('Slide download error:', err);
    showToast('⚠️ Could not export slide PNG.');
  }
}

function toggleZenScreenshot(enable) {
  const body = document.body;
  const exitBanner = document.getElementById('zenExitBanner');

  if (enable) {
    body.classList.add('clean-screenshot-mode');
    if (exitBanner) exitBanner.classList.remove('hidden');
    showToast('✨ Clean Mode: Ready for screenshot! Press Esc to exit.');
  } else {
    body.classList.remove('clean-screenshot-mode');
    if (exitBanner) exitBanner.classList.add('hidden');
  }
}

/* ==========================================================================
   SMART TEXT PARSER & BULK IMPORT
   ========================================================================== */
function openPasteModal() {
  const modal = document.getElementById('smartPasteModal');
  if (modal) modal.classList.remove('hidden');
  document.getElementById('bulkPasteInput')?.focus();
}

function closePasteModal() {
  const modal = document.getElementById('smartPasteModal');
  if (modal) modal.classList.add('hidden');
}

function loadSampleIntoPaste() {
  const sample = `A streaming ingestion pipeline receives web clickstream events containing occasional malformed JSON payloads. According to Medallion architecture principles, which layer should store this raw, unaltered dataset complete with its data quality flaws, and which subsequent layer is tasked with storing cleansed and enriched events?

A.
The Landing layer stores raw data; the Gold layer stores cleansed events directly.
The Gold layer is reserved for business-level aggregates and star-schema models rather than intermediate cleansed and conformed datasets.

B.
The Bronze layer stores the raw unaltered data; the Silver layer stores cleansed and enriched events.
That's right!
The Bronze layer retains raw historical data in its original form regardless of quality errors, whereas the Silver layer handles data cleansing, filtering, and contextual enrichment.

C.
The Bronze layer stores cleansed events; the Silver layer stores aggregated business data marts.
The Bronze layer does not clean or transform incoming records, as doing so would erase the original source audit trail.

D.
The Silver layer stores raw unaltered data; the Gold layer stores cleansed events alongside aggregates.
Storing raw, unvalidated data directly in the Silver layer violates the Medallion progression, which relies on Bronze to isolate original source payloads.`;

  const input = document.getElementById('bulkPasteInput');
  if (input) input.value = sample;
}

function applySmartPaste() {
  const rawText = document.getElementById('bulkPasteInput')?.value || '';
  if (!rawText.trim()) {
    showToast('Please paste or enter some text first.');
    return;
  }

  const parsed = parseMultipleChoiceText(rawText);

  if (parsed.question) {
    appState.question = parsed.question;
    appState.liScenarioText = parsed.question;
  }
  ['A', 'B', 'C', 'D'].forEach(letter => {
    if (parsed.options[letter]) {
      appState.options[letter] = parsed.options[letter];
    }
    if (parsed.explanations[letter]) {
      appState.explanations[letter] = parsed.explanations[letter];
    }
  });

  if (parsed.correctAnswer) {
    appState.liRevealAnswer = parsed.correctAnswer;
    appState.liRevealAnswerText = `CORRECT ANSWER: OPTION ${parsed.correctAnswer}`;
    updateAnswerHighlight(parsed.correctAnswer);
  }

  saveState();
  initDOM();
  closePasteModal();
  showToast('✓ Successfully updated question, options, and Slide 8 explanations!');
}

/**
 * Intelligent regex parser for questions, options A, B, C, D, and their respective explanations.
 * Automatically detects correct answer when phrases like "That's right!", "Correct", or "(right..." are found.
 */
function parseMultipleChoiceText(text) {
  const result = {
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    explanations: { A: '', B: '', C: '', D: '' },
    correctAnswer: null
  };

  // Normalize line endings
  const clean = text.replace(/\r\n/g, '\n').trim();

  // Regex to locate option headers: e.g. "A.", "A)", "B.", "[A]", etc. at line beginnings
  const optionHeaderRegex = /(?:^|\n)[ \t]*(?:\(?([A-Da-d])[\.\)]|\b([A-Da-d])\s*[\.\:\-])[ \t]*(.*)/g;

  let matches = [];
  let m;
  while ((m = optionHeaderRegex.exec(clean)) !== null) {
    const letter = (m[1] || m[2]).toUpperCase();
    const startIndex = m.index;
    const restOfLine = (m[3] || '').trim();
    matches.push({ letter, startIndex, restOfLine });
  }

  // Filter out any duplicate consecutive letters if any
  const seenLetters = new Set();
  const validMatches = [];
  for (const match of matches) {
    if (!seenLetters.has(match.letter)) {
      seenLetters.add(match.letter);
      validMatches.push(match);
    }
  }

  if (validMatches.length >= 2) {
    // 1. Question is everything preceding the first option header
    const questionText = clean.substring(0, validMatches[0].startIndex).trim();
    if (questionText) {
      result.question = questionText;
    }

    // 2. Extract block for each option
    for (let i = 0; i < validMatches.length; i++) {
      const current = validMatches[i];
      const nextIndex = (i < validMatches.length - 1) ? validMatches[i + 1].startIndex : clean.length;
      const rawBlock = clean.substring(current.startIndex, nextIndex).trim();

      // Split rawBlock into lines
      const allLines = rawBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Remove the option letter marker line if it was standalone (e.g. "A.")
      let contentLines = [];
      if (allLines.length > 0) {
        if (/^\(?[A-Da-d][\.\)]\s*$/i.test(allLines[0])) {
          contentLines = allLines.slice(1);
        } else {
          const stripped = allLines[0].replace(/^\(?[A-Da-d][\.\)]\s*/i, '').trim();
          contentLines = [stripped, ...allLines.slice(1)];
        }
      }

      if (contentLines.length === 0) {
        continue;
      }

      // First non-empty content line is the option statement
      const optionStatement = contentLines[0];
      result.options[current.letter] = optionStatement;

      // Remaining lines form the explanation and/or correct indicators
      const remainingLines = contentLines.slice(1);
      if (remainingLines.length > 0) {
        // Check for affirmative indicators (e.g. "That's right!", "Correct", "(right will shown...")
        const affirmativeRegex = /that's right|that is right|correct|is right|right answer|right will shown|✓|✔/i;
        let isCorrectOption = false;

        for (const line of remainingLines) {
          if (affirmativeRegex.test(line)) {
            isCorrectOption = true;
            break;
          }
        }

        if (isCorrectOption) {
          result.correctAnswer = current.letter;
        }

        // Clean up any internal meta commentary like "(right will shown, wrong never)"
        const cleanExplanation = remainingLines
          .filter(l => !/^\(?right will shown[^\)]*\)?$/i.test(l))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        result.explanations[current.letter] = cleanExplanation;
      }
    }
  } else {
    // Fallback: 4-paragraph split if no letter prefixes
    const paragraphs = clean.split(/\n\s*\n/).filter(p => p.trim());
    if (paragraphs.length >= 4) {
      result.options.A = paragraphs[paragraphs.length - 4].replace(/^[A-Da-d][\.\)]\s*/, '').trim();
      result.options.B = paragraphs[paragraphs.length - 3].replace(/^[A-Da-d][\.\)]\s*/, '').trim();
      result.options.C = paragraphs[paragraphs.length - 2].replace(/^[A-Da-d][\.\)]\s*/, '').trim();
      result.options.D = paragraphs[paragraphs.length - 1].replace(/^[A-Da-d][\.\)]\s*/, '').trim();
      if (paragraphs.length > 4) {
        result.question = paragraphs.slice(0, paragraphs.length - 4).join(' ').trim();
      }
    }
  }

  // Fallback explanations if empty
  if (!result.explanations.A && result.options.A) {
    result.explanations.A = DEFAULT_STATE.explanations.A;
  }
  if (!result.explanations.B && result.options.B) {
    result.explanations.B = DEFAULT_STATE.explanations.B;
  }
  if (!result.explanations.C && result.options.C) {
    result.explanations.C = DEFAULT_STATE.explanations.C;
  }
  if (!result.explanations.D && result.options.D) {
    result.explanations.D = DEFAULT_STATE.explanations.D;
  }

  return result;
}

/* ==========================================================================
   DRAWER & MODAL CONTROLS
   ========================================================================== */
function openDrawer() {
  const drawer = document.getElementById('settingsDrawer');
  if (drawer) drawer.classList.remove('hidden');
}

function closeDrawer() {
  const drawer = document.getElementById('settingsDrawer');
  if (drawer) drawer.classList.add('hidden');
}

function resetToDefault() {
  if (confirm('Reset cards and styling back to initial Databricks Medallion sample?')) {
    appState = { ...DEFAULT_STATE };
    saveState();
    initDOM();
    showToast('Reset to default sample');
  }
}

function clearAllContent() {
  if (confirm('Clear all option text?')) {
    appState.options = { A: '', B: '', C: '', D: '' };
    saveState();
    initDOM();
    showToast('Options cleared');
  }
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerText = message;
  toast.classList.remove('hidden');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2800);
}

function isEditingActive() {
  const active = document.activeElement;
  return active && (active.isContentEditable || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Export functions to window for direct HTML onclick attributes
window.downloadCardImage = downloadCardImage;
window.copyCardAsImage = copyCardAsImage;
window.focusSingleCard = focusSingleCard;
window.exportLinkedInPdf = exportLinkedInPdf;
window.exportActiveLiSlidePng = exportActiveLiSlidePng;
window.exportAllLiSlidesPng = exportAllLiSlidesPng;
window.showLiSlide = showLiSlide;
window.prevLiSlide = prevLiSlide;
window.nextLiSlide = nextLiSlide;
window.toggleLiViewMode = toggleLiViewMode;
