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

    // 1. Normalize the search string (Match the Backend logic)
    const normalizedSearch = searchText.replace(/\s+/g, ' ').trim().toLowerCase();

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          const tag = parent?.tagName.toLowerCase();
          const isHidden = parent?.offsetParent === null; // Skip invisible stuff
          if (!parent || isHidden || ['script', 'style', 'noscript', 'head', 'textarea'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    // 2. Map all text nodes and build a "Flat" version of the page
    const nodes = [];
    let combinedText = "";
    let currentNode;

    while ((currentNode = walker.nextNode())) {
      nodes.push({
        node: currentNode,
        start: combinedText.length,
        end: combinedText.length + currentNode.textContent.length,
      });
      combinedText += currentNode.textContent;
    }

    // 3. Perform a "Normalized Search" on the flattened text
    // We use a regex or a normalized version of combinedText to find the match
    const flatSearchArea = combinedText.replace(/\s+/g, ' ').toLowerCase();
    const matchIndex = flatSearchArea.indexOf(normalizedSearch);

    if (matchIndex === -1) {
      console.warn("REAVES: Could not find exact match on page for highlight.");
      return;
    }

    // 4. Trace the match back to the actual DOM nodes
    // Since we normalized spaces, we need to find the "Real" start and end in the raw combinedText
    // This part is tricky, so we use a simpler Range approach for the demo:
    try {
      const range = document.createRange();

      // Find start node
      const startObj = nodes.find(n => n.end > matchIndex);
      // Find end node
      const endObj = nodes.find(n => n.end >= (matchIndex + normalizedSearch.length));

      if (startObj && endObj) {
        range.setStart(startObj.node, Math.max(0, matchIndex - startObj.start));
        range.setEnd(endObj.node, Math.min(endObj.node.textContent.length, (matchIndex + normalizedSearch.length) - endObj.start));

        // 5. Apply the "REAVES Glow"
        const mark = document.createElement('mark');
        mark.className = 'reaves-highlight';
        range.surroundContents(mark);

        // Auto-scroll to the proof
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Keep track for cleanup
        activeHighlights.push(mark);
      }
    } catch (e) {
      console.error("REAVES: Highlight range error (likely spanning complex tags)", e);
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
        background: rgba(124, 58, 237, 0.3) !important;
        border-bottom: 2px solid #7c3aed;
        color: inherit !important;
        border-radius: 2px;
        transition: all 0.3s ease;
        box-shadow: 0 0 8px rgba(124, 58, 237, 0.2);
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
