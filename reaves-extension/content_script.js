/**
 * REAVES Extension — Content Script
 *
 * Injected into every tab (all_frames: false, document_idle).
 *
 * Features:
 * 1. "Ask REAVES" floating bubble on text selection
 * 2. Smart Glossary Hover popup (gated by chrome.storage.local glossaryEnabled)
 * 3. Evidence Highlighter (<mark> injection from background)
 * 4. All CSS injected via JS — no external .css file required
 */

(function () {
  'use strict';

  // ─── State — declared here, accessible to every function inside the IIFE ────
  var bubble          = null;
  var glossaryPopup   = null;
  var glossaryTimer   = null;
  var activeHighlights = [];

  // Inject styles once on load
  injectStyles();

  // ════════════════════════════════════════════════════════════════════════════
  // 1. TEXT SELECTION — bubble + glossary timer
  // ════════════════════════════════════════════════════════════════════════════
  document.addEventListener('mouseup', function () {
    var selection = window.getSelection();
    var text = selection ? selection.toString().trim() : '';

    // Clean up any previous UI
    removeBubble();
    removeGlossaryPopup();
    clearTimeout(glossaryTimer);

    if (!text) return;

    var range = selection.getRangeAt(0);
    var rect  = range.getBoundingClientRect();

    // ── A. "Ask REAVES" bubble (any highlight >= 5 chars) ──
    if (text.length >= 5) {
      showBubble(text, rect);
    }

    // ── B. Smart Glossary timer (max 5 words) ──
    var wordCount = text.split(/\s+/).length;
    if (wordCount <= 5) {
      // Snapshot rect values (DOMRect is live, clone the numbers we need)
      var capturedTop    = rect.top;
      var capturedLeft   = rect.left;
      var capturedWidth  = rect.width;
      var capturedHeight = rect.height;

      glossaryTimer = setTimeout(function () {
        // Guard: selection must still match
        var currentSel = window.getSelection();
        var currentText = currentSel ? currentSel.toString().trim() : '';
        if (currentText !== text) return;

        // Check toggle flag before showing popup
        chrome.storage.local.get(['glossaryEnabled'], function (result) {
          // Default to ON if not yet set
          if (result.glossaryEnabled === false) return;
          showGlossaryPopup(text, {
            top:    capturedTop,
            left:   capturedLeft,
            width:  capturedWidth,
            height: capturedHeight,
          });
        });
      }, 1500);
    }
  });

  // Dismiss everything on click or scroll
  document.addEventListener('mousedown', function () {
    removeBubble();
    removeGlossaryPopup();
    clearTimeout(glossaryTimer);
  });

  document.addEventListener('scroll', function () {
    removeBubble();
    removeGlossaryPopup();
    clearTimeout(glossaryTimer);
  }, { passive: true });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. "ASK REAVES" BUBBLE
  // ════════════════════════════════════════════════════════════════════════════
  function showBubble(text, rect) {
    bubble = document.createElement('div');
    bubble.id = 'reaves-bubble';
    bubble.innerHTML =
      '<span class="reaves-bubble-icon">\u2736</span>' +
      '<span class="reaves-bubble-label">Ask REAVES</span>';

    var top  = window.scrollY + rect.top - 44;
    var left = window.scrollX + rect.left + rect.width / 2 - 72;

    Object.assign(bubble.style, {
      position:       'absolute',
      top:            Math.max(top,  window.scrollY + 8) + 'px',
      left:           Math.max(left, 8) + 'px',
      zIndex:         '2147483647',
      display:        'flex',
      alignItems:     'center',
      gap:            '6px',
      padding:        '7px 14px',
      borderRadius:   '20px',
      background:     'linear-gradient(135deg, #6d28d9, #7c3aed)',
      color:          '#fff',
      fontSize:       '13px',
      fontFamily:     'Inter, system-ui, sans-serif',
      fontWeight:     '600',
      cursor:         'pointer',
      boxShadow:      '0 4px 24px rgba(109,40,217,0.5), 0 1px 4px rgba(0,0,0,0.3)',
      userSelect:     'none',
      border:         '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(8px)',
      letterSpacing:  '0.01em',
      animation:      'reaves-pop 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
    });

    bubble.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'OPEN_SIDEBAR', text: text }, function () {
        if (chrome.runtime.lastError) { /* sidebar may not be open yet — ok */ }
      });
      removeBubble();
    });

    document.body.appendChild(bubble);
  }

  function removeBubble() {
    if (bubble) {
      bubble.remove();
      bubble = null;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 3. SMART GLOSSARY POPUP
  // ════════════════════════════════════════════════════════════════════════════
  function showGlossaryPopup(word, rect) {
    removeGlossaryPopup();

    var POPUP_W = 280;
    var top  = window.scrollY + rect.top - 6;
    var left = window.scrollX + rect.left + rect.width / 2 - POPUP_W / 2;
    var maxLeft = window.scrollX + window.innerWidth - POPUP_W - 8;
    left = Math.max(window.scrollX + 8, Math.min(left, maxLeft));

    glossaryPopup = document.createElement('div');
    glossaryPopup.className = 'reaves-smart-popup';
    Object.assign(glossaryPopup.style, {
      top:   top   + 'px',
      left:  left  + 'px',
      width: POPUP_W + 'px',
    });

    glossaryPopup.innerHTML = '<span class="reaves-popup-loading">Looking up definition\u2026</span>';
    document.body.appendChild(glossaryPopup);

    // Shift popup to sit above the selection once its height is known
    requestAnimationFrame(function () {
      if (!glossaryPopup) return;
      glossaryPopup.style.top = (top - glossaryPopup.offsetHeight - 4) + 'px';
    });

    // Ask the background script for the definition
    chrome.runtime.sendMessage({ type: 'GET_DEFINITION', word: word }, function (response) {
      if (chrome.runtime.lastError) {
        console.warn('[REAVES] Background error:', chrome.runtime.lastError.message);
        if (glossaryPopup) {
          glossaryPopup.innerHTML = '<span class="reaves-popup-error">Could not reach background.</span>';
        }
        return;
      }

      if (!glossaryPopup) return; // user clicked away while loading

      if (!response || !response.short_definition) {
        removeGlossaryPopup(); // nothing useful to show
        return;
      }

      // ── Dual-Action ──
      // 1. Update the floating popup with the short definition
      glossaryPopup.innerHTML =
        '<span class="reaves-popup-word">' + escapeHtml(response.word || word) + '</span>' +
        '<span class="reaves-popup-def">'  + escapeHtml(response.short_definition) + '</span>';

      // 2. Push the full payload to the open sidebar
      chrome.runtime.sendMessage({ type: 'SHOW_DETAILED_DEF', payload: response }, function () {
        if (chrome.runtime.lastError) { /* sidebar may be closed — ignore */ }
      });
    });
  }

  function removeGlossaryPopup() {
    if (glossaryPopup) {
      glossaryPopup.remove();
      glossaryPopup = null;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 4. EVIDENCE HIGHLIGHTER
  // ════════════════════════════════════════════════════════════════════════════
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.type === 'DO_HIGHLIGHT') {
      clearHighlights();
      var excerpts = message.excerpts || [];
      for (var i = 0; i < excerpts.length; i++) {
        injectHighlight(excerpts[i].text);
      }
    }
    if (message.type === 'DO_CLEAR_HIGHLIGHTS') {
      clearHighlights();
    }
  });

  /**
   * Find `searchText` in the page using a TreeWalker and wrap the match
   * in a <mark class="reaves-highlight"> element.
   */
  function injectHighlight(searchText) {
    if (!searchText || searchText.length < 5) return;

    var normalizedSearch = searchText.replace(/\s+/g, ' ').trim().toLowerCase();

    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var parent = node.parentElement;
          var tag    = parent ? parent.tagName.toLowerCase() : '';
          var hidden = parent ? parent.offsetParent === null : true;
          if (!parent || hidden || ['script', 'style', 'noscript', 'head', 'textarea'].indexOf(tag) !== -1) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    var nodes = [];
    var combinedText = '';
    var currentNode;
    while ((currentNode = walker.nextNode())) {
      nodes.push({
        node:  currentNode,
        start: combinedText.length,
        end:   combinedText.length + currentNode.textContent.length,
      });
      combinedText += currentNode.textContent;
    }

    var flatText = combinedText.replace(/\s+/g, ' ').toLowerCase();
    var matchIdx = flatText.indexOf(normalizedSearch);
    if (matchIdx === -1) {
      console.warn('[REAVES] Highlight: no match found for:', searchText);
      return;
    }

    try {
      var range    = document.createRange();
      var startObj = null;
      var endObj   = null;
      for (var i = 0; i < nodes.length; i++) {
        if (!startObj && nodes[i].end > matchIdx)                          startObj = nodes[i];
        if (!endObj   && nodes[i].end >= matchIdx + normalizedSearch.length) endObj = nodes[i];
        if (startObj && endObj) break;
      }

      if (startObj && endObj) {
        range.setStart(startObj.node, Math.max(0, matchIdx - startObj.start));
        range.setEnd(endObj.node,   Math.min(endObj.node.textContent.length, (matchIdx + normalizedSearch.length) - endObj.start));

        var mark = document.createElement('mark');
        mark.className = 'reaves-highlight';
        range.surroundContents(mark);
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        activeHighlights.push(mark);
      }
    } catch (e) {
      console.warn('[REAVES] Highlight range error:', e);
    }
  }

  function clearHighlights() {
    for (var i = 0; i < activeHighlights.length; i++) {
      var mark   = activeHighlights[i];
      var parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
      }
    }
    activeHighlights = [];
  }

  // Clear marks when navigating away
  window.addEventListener('beforeunload', clearHighlights);

  // ════════════════════════════════════════════════════════════════════════════
  // 5. UTILITIES
  // ════════════════════════════════════════════════════════════════════════════
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 6. STYLES — injected once via JS (no external .css dependency)
  // ════════════════════════════════════════════════════════════════════════════
  function injectStyles() {
    if (document.getElementById('reaves-styles')) return;

    var style = document.createElement('style');
    style.id = 'reaves-styles';
    style.textContent = [
      /* ── Animations ── */
      '@keyframes reaves-pop {',
      '  from { opacity:0; transform:scale(0.8) translateY(4px); }',
      '  to   { opacity:1; transform:scale(1)   translateY(0);   }',
      '}',
      '@keyframes reaves-fadein {',
      '  from { opacity:0; transform:translateY(6px) scale(0.97); }',
      '  to   { opacity:1; transform:translateY(0)   scale(1);    }',
      '}',
      '@keyframes reaves-spin {',
      '  to { transform:rotate(360deg); }',
      '}',

      /* ── Page highlight <mark> ── */
      'mark.reaves-highlight {',
      '  background: rgba(124,58,237,0.3) !important;',
      '  border-bottom: 2px solid #7c3aed;',
      '  color: inherit !important;',
      '  border-radius: 2px;',
      '  transition: background 0.3s ease;',
      '  box-shadow: 0 0 8px rgba(124,58,237,0.2);',
      '}',
      'mark.reaves-highlight:hover {',
      '  background: rgba(109,40,217,0.45) !important;',
      '  cursor: pointer;',
      '}',

      /* ── Smart Glossary Popup ── */
      '.reaves-smart-popup {',
      '  position: absolute;',
      '  z-index: 2147483647;',
      '  max-width: 280px;',
      '  padding: 10px 14px;',
      '  background: #18181b;',
      '  color: #e4e4e7;',
      '  border: 1px solid rgba(255,255,255,0.08);',
      '  border-radius: 10px;',
      '  font-family: Inter, system-ui, -apple-system, sans-serif;',
      '  font-size: 12.5px;',
      '  line-height: 1.55;',
      '  box-shadow: 0 4px 24px rgba(0,0,0,0.55), 0 1px 6px rgba(0,0,0,0.35), 0 0 0 1px rgba(124,58,237,0.18);',
      '  pointer-events: none;',
      '  user-select: none;',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 5px;',
      '  animation: reaves-fadein 0.2s cubic-bezier(0.22,1,0.36,1) both;',
      '}',
      '.reaves-popup-word {',
      '  font-size: 10px;',
      '  font-weight: 700;',
      '  letter-spacing: 0.08em;',
      '  text-transform: uppercase;',
      '  color: #a78bfa;',
      '}',
      '.reaves-popup-def {',
      '  color: #d4d4d8;',
      '}',
      '.reaves-popup-loading {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 7px;',
      '  color: #71717a;',
      '  font-style: italic;',
      '  font-size: 12px;',
      '}',
      '.reaves-popup-loading::before {',
      '  content: "";',
      '  flex-shrink: 0;',
      '  width: 10px; height: 10px;',
      '  border: 2px solid rgba(124,58,237,0.3);',
      '  border-top-color: #7c3aed;',
      '  border-radius: 50%;',
      '  animation: reaves-spin 0.7s linear infinite;',
      '}',
      '.reaves-popup-error {',
      '  color: #f87171;',
      '  font-size: 12px;',
      '}',
    ].join('\n');

    // Prefer <head>; fall back to <html> if head isn't ready yet
    (document.head || document.documentElement).appendChild(style);
  }

})();