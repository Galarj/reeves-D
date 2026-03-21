/**
 * REAVES — Google Search Grader (Pre-Header Floating Pill Edition)
 *
 * Injects a premium pill badge that FLOATS above each Google search result
 * card using absolute positioning + negative top offset. This prevents:
 *   1. Google's mirror/flip CSS from inverting the badge (Shadow DOM isolation).
 *   2. The badge from overlapping right-side images (floats in negative margin).
 *   3. Content from being pushed around (zero-size wrapper).
 *
 * The wrapper is prepended into the favicon/URL container (.yuRUbf, .ca_7v,
 * etc.) but has width:0; height:0 so it takes zero layout space. The badge
 * itself is absolutely positioned at top:-12px; left:10px — the "Negative
 * Margin Zone" above the card.
 */

(function () {
  'use strict';

  // ─── Tier definitions ───────────────────────────────────────────────────────
  var TIERS = {
    A: { icon: '\u2726', label: 'HIGH TRUST',  bg: '#10b981' },  // Emerald
    B: { icon: '\u2713', label: 'REPUTABLE',   bg: '#3b82f6' },  // Blue
    C: { icon: '\u26A0', label: 'CAUTION',     bg: '#f59e0b' },  // Amber
    D: { icon: '\u2716', label: 'UNVERIFIED',  bg: '#ef4444' },  // Red
    F: { icon: '\u2716', label: 'UNVERIFIED',  bg: '#ef4444' },  // Red
  };

  // ─── Shadow CSS — Floating Pill Badge ───────────────────────────────────────
  var SHADOW_CSS = /* css */ `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');

    :host {
      all: initial !important;
      position: absolute !important;
      top: -12px !important;
      left: 10px !important;
      z-index: 9999 !important;
      display: block !important;
      transform: none !important;
      direction: ltr !important;
      writing-mode: horizontal-tb !important;
      unicode-bidi: isolate !important;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 10px;
      border-radius: 20px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
      cursor: help;
      position: relative;

      /* White text on vibrant backgrounds */
      color: #ffffff;

      /* Premium depth */
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

      /* Mirror locks */
      direction: ltr;
      writing-mode: horizontal-tb;
      transform: none;
      unicode-bidi: isolate;

      transition: box-shadow 0.2s ease, transform 0.15s ease;
    }
    .pill:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      transform: translateY(-1px);
    }

    /* Icon */
    .pill-icon {
      font-size: 11px;
      line-height: 1;
      flex-shrink: 0;
      color: #ffffff;
    }

    /* Label */
    .pill-label {
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 0.05em;
      color: #ffffff;
    }

    /* Loading state */
    .pill.loading {
      background: #71717a;
      color: #ffffff;
    }

    /* Error state */
    .pill.error {
      background: #52525b;
      color: #e4e4e7;
    }

    /* Spinner */
    .spin {
      display: inline-block;
      width: 8px; height: 8px;
      border: 1.5px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: rg-spin 0.6s linear infinite;
      flex-shrink: 0;
    }
    @keyframes rg-spin { to { transform: rotate(360deg); } }

    /* ── Tooltip — sleek dark panel ── */
    .tip {
      display: none;
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: #18181b;
      color: #e4e4e7;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11.5px;
      font-weight: 400;
      line-height: 1.55;
      letter-spacing: 0;
      text-transform: none;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55),
                  0 0 0 1px rgba(0, 0, 0, 0.15);
      white-space: normal;
      width: 260px;
      text-align: left;
      z-index: 2147483647;
      direction: ltr;
      writing-mode: horizontal-tb;
    }
    .tip::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 14px;
      border: 6px solid transparent;
      border-bottom-color: #18181b;
    }
    .pill:hover .tip {
      display: block;
    }
  `;

  // ─── Toggle guard ──────────────────────────────────────────────────────────
  chrome.storage.local.get(['searchGraderEnabled'], function (res) {
    if (res.searchGraderEnabled === false) return;
    init();
  });

  function init() {
    gradeAll();
    var obs = new MutationObserver(function () { gradeAll(); });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Grade all ungraded results ─────────────────────────────────────────────
  var isGrading = false;

  async function gradeAll() {
    if (isGrading) return;
    isGrading = true;

    try {
      // Broad selector for Google search result blocks
      var candidates = document.querySelectorAll(
        'div.g, div[data-hveid], div.MjjYud > div'
      );

      for (var i = 0; i < candidates.length; i++) {
        var resultEl = candidates[i];

        // ── Duplicate guard (data attribute) ──
        if (resultEl.getAttribute('data-reaves-graded')) continue;

        var titleEl   = resultEl.querySelector('h3');
        var linkEl    = resultEl.querySelector('a[href]');
        var snippetEl = resultEl.querySelector('.VwiC3b, [data-sncf], .lEBKkf');

        if (!titleEl || !linkEl) continue;

        var url = linkEl.href || '';
        if (!url.startsWith('http') || url.includes('google.com/search')) continue;

        // Mark as graded immediately to prevent re-processing
        resultEl.setAttribute('data-reaves-graded', '1');

        var title   = titleEl.textContent.trim();
        var snippet = snippetEl ? snippetEl.textContent.trim() : '';

        // ── Stagger: 1.5s between requests to avoid API rate-limits ──
        if (i > 0) {
          await new Promise(function (resolve) { setTimeout(resolve, 1500); });
        }

        // ── Find the container (favicon/URL breadcrumb row) ──
        var container =
          resultEl.querySelector('.yuRUbf') ||
          resultEl.querySelector('.ca_7v')  ||
          resultEl.querySelector('.egMi0.kCrYT') ||
          resultEl.querySelector('[data-header-feature]') ||
          resultEl.querySelector('.TbwUpd')?.parentElement ||
          null;

        // Last resort: walk up from the <h3>
        if (!container) {
          container = titleEl.closest('.yuRUbf') ||
                      titleEl.closest('.ca_7v')  ||
                      titleEl.parentElement;
        }

        if (!container) continue;

        // Make the container a positioning context for the absolute pill
        container.style.position = 'relative';
        container.style.overflow = 'visible';

        // ── Build the zero-size wrapper ──
        // width:0; height:0 means it takes NO layout space —
        // the pill floats via absolute positioning from :host.
        var wrapper = document.createElement('div');
        wrapper.className = 'reaves-pill-host';
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.style.cssText = 'display:block;width:0;height:0;overflow:visible;position:relative;';

        var shadow;
        try {
          shadow = wrapper.attachShadow({ mode: 'open' });
        } catch (e) {
          // Fallback: inline pill without Shadow DOM
          wrapper.style.cssText =
            'position:absolute;top:-12px;left:10px;z-index:9999;' +
            'display:inline-flex;align-items:center;gap:5px;' +
            'padding:2px 10px;border-radius:20px;' +
            'font:bold 10px Inter,system-ui,sans-serif;' +
            'color:#fff;background:#71717a;letter-spacing:.05em;' +
            'text-transform:uppercase;box-shadow:0 2px 5px rgba(0,0,0,.3);' +
            'direction:ltr;transform:none;white-space:nowrap;';
          wrapper.textContent = '\u2699\uFE0F Grading\u2026';
          container.prepend(wrapper);
          fetchGrade(wrapper, null, wrapper, title, url, snippet);
          continue;
        }

        // Inject CSS
        var styleEl = document.createElement('style');
        styleEl.textContent = SHADOW_CSS;
        shadow.appendChild(styleEl);

        // Build loading pill
        var pill = document.createElement('span');
        pill.className = 'pill loading';

        var spin = document.createElement('span');
        spin.className = 'spin';
        pill.appendChild(spin);

        var lbl = document.createElement('span');
        lbl.className = 'pill-label';
        lbl.textContent = 'Analyzing\u2026';
        pill.appendChild(lbl);

        var tip = document.createElement('span');
        tip.className = 'tip';
        tip.textContent = 'Checking source credibility\u2026';
        pill.appendChild(tip);

        shadow.appendChild(pill);

        // ── Prepend zero-size wrapper into container ──
        container.prepend(wrapper);

        fetchGrade(wrapper, pill, null, title, url, snippet);
      }
    } finally {
      isGrading = false;
    }
  }

  // ─── Fetch grade from background service worker ─────────────────────────────
  function fetchGrade(wrapper, pill, fallbackEl, title, url, snippet) {
    chrome.runtime.sendMessage(
      { type: 'GRADE_SEARCH_RESULT', payload: { title: title, url: url, snippet: snippet } },
      function (response) {
        if (chrome.runtime.lastError || !response || response.error) {
          if (pill) {
            renderPill(pill, '#52525b', '\u26A0\uFE0F', 'ERROR',
              'Backend unavailable. Check localhost:3000.');
          } else if (fallbackEl) {
            fallbackEl.style.background = '#52525b';
            fallbackEl.textContent = '\u26A0 Error';
          }
          return;
        }

        var grade  = response.grade || scoreToLetter(response.trustScore);
        var score  = typeof response.score === 'number' ? response.score
                   : typeof response.trustScore === 'number' ? response.trustScore : 50;
        var reason = response.reason || response.tooltip || 'Analysis complete.';

        var tier = TIERS[grade] || TIERS.C;

        if (pill) {
          renderPill(pill, tier.bg, tier.icon, tier.label, reason);
        } else if (fallbackEl) {
          fallbackEl.style.background = tier.bg;
          fallbackEl.textContent = tier.icon + ' ' + tier.label;
        }
      }
    );
  }

  // ─── Pill renderer ──────────────────────────────────────────────────────────
  function renderPill(pill, bgColor, icon, label, reason) {
    pill.className = 'pill';
    pill.style.background = bgColor;

    while (pill.firstChild) pill.removeChild(pill.firstChild);

    var iconEl = document.createElement('span');
    iconEl.className = 'pill-icon';
    iconEl.textContent = icon;
    pill.appendChild(iconEl);

    var labelEl = document.createElement('span');
    labelEl.className = 'pill-label';
    labelEl.textContent = label;
    pill.appendChild(labelEl);

    var tipEl = document.createElement('span');
    tipEl.className = 'tip';
    tipEl.textContent = reason;
    pill.appendChild(tipEl);
  }

  function scoreToLetter(score) {
    if (score == null) return 'C';
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    if (score >= 35) return 'D';
    return 'F';
  }

})();