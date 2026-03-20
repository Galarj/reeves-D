/**
 * REAVES Extension — Content Script
 *
 * Injected into every tab (all_frames: false, document_idle).
 *
 * Responsibilities:
 * 1. Detect text selection → show floating "Ask REAVES" bubble
 * 2. Receive highlight instructions from background → inject <mark> elements
 * 3. Clear highlights on navigation (session-only)
 */

(function () {
  'use strict';

  // ─── State ─────────────────────────────────────────────────────────────────
  let bubble = null;
  let activeHighlights = []; // keep references to <mark> elements for cleanup

  // ─── 1. Text Selection → Bubble ────────────────────────────────────────────
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    removeBubble();

    if (!text || text.length < 5) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    bubble = document.createElement('div');
    bubble.id = 'reaves-bubble';
    bubble.innerHTML = `
      <span class="reaves-bubble-icon">✦</span>
      <span class="reaves-bubble-label">Ask REAVES</span>
    `;

    // Position near selection (above the selection, centered)
    const top = window.scrollY + rect.top - 44;
    const left = window.scrollX + rect.left + rect.width / 2 - 72;

    Object.assign(bubble.style, {
      position: 'absolute',
      top: `${Math.max(top, window.scrollY + 8)}px`,
      left: `${Math.max(left, 8)}px`,
      zIndex: '2147483647',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '7px 14px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
      color: '#fff',
      fontSize: '13px',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 24px rgba(109,40,217,0.5), 0 1px 4px rgba(0,0,0,0.3)',
      userSelect: 'none',
      border: '1px solid rgba(255,255,255,0.15)',
      backdropFilter: 'blur(8px)',
      letterSpacing: '0.01em',
      animation: 'reaves-pop 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
    });

    bubble.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage(
        { type: 'OPEN_SIDEBAR', text },
        () => { /* sidebar will open */ }
      );
      removeBubble();
    });

    if (!document.getElementById('reaves-styles')) {
      injectStyles();
    }

    document.body.appendChild(bubble);
  });

  // Dismiss bubble on outside click or scroll
  document.addEventListener('mousedown', (e) => {
    if (bubble && !bubble.contains(e.target)) removeBubble();
  });
  document.addEventListener('scroll', removeBubble, { passive: true });

  function removeBubble() {
    if (bubble) {
      bubble.remove();
      bubble = null;
    }
  }

  // ─── 2. Highlight Injection ─────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'DO_HIGHLIGHT') {
      clearHighlights();
      message.excerpts.forEach((excerpt) => {
        injectHighlight(excerpt.text);
      });
    }
    if (message.type === 'DO_CLEAR_HIGHLIGHTS') {
      clearHighlights();
    }
  });

  /**
   * Find `text` in the DOM using TreeWalker and wrap in a <mark> element.
   * Handles text split across multiple text nodes using a sliding-window approach.
   */
  function injectHighlight(searchText) {
    if (!searchText || searchText.length < 5) return;

    const normalized = searchText.trim().replace(/\s+/g, ' ').toLowerCase();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // Skip hidden elements and script/style tags
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'head'].includes(tag)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    // Build a concatenated text map to find the match position
    let combined = '';
    const positions = []; // { node, start, end }
    for (const node of textNodes) {
      const start = combined.length;
      combined += node.textContent;
      positions.push({ node, start, end: combined.length });
    }

    const matchIdx = combined.toLowerCase().indexOf(normalized);
    if (matchIdx === -1) return;

    const matchEnd = matchIdx + normalized.length;

    // Find which text nodes overlap the match
    const overlapping = positions.filter(
      (p) => p.end > matchIdx && p.start < matchEnd
    );
    if (overlapping.length === 0) return;

    try {
      const range = document.createRange();
      const first = overlapping[0];
      const last = overlapping[overlapping.length - 1];

      range.setStart(first.node, matchIdx - first.start);
      range.setEnd(last.node, matchEnd - last.start);

      const mark = document.createElement('mark');
      mark.className = 'reaves-highlight';
      mark.dataset.reavestext = searchText.slice(0, 60);
      range.surroundContents(mark);
      activeHighlights.push(mark);

      // Scroll first highlight into view
      if (activeHighlights.length === 1) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch {
      // Range spanning multiple parents — skip silently
    }
  }

  function clearHighlights() {
    for (const mark of activeHighlights) {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
      }
    }
    activeHighlights = [];
  }

  // ─── 3. Session-only: clear on navigation ──────────────────────────────────
  window.addEventListener('beforeunload', clearHighlights);

  // ─── Styles ────────────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'reaves-styles';
    style.textContent = `
      @keyframes reaves-pop {
        from { opacity: 0; transform: scale(0.8) translateY(4px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      mark.reaves-highlight {
        background: rgba(109, 40, 217, 0.28) !important;
        color: inherit !important;
        border-radius: 3px;
        outline: 1.5px solid rgba(124, 58, 237, 0.6);
        padding: 1px 0;
        transition: background 0.2s;
      }
      mark.reaves-highlight:hover {
        background: rgba(109, 40, 217, 0.45) !important;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  injectStyles();
})();
