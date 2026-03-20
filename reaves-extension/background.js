/**
 * REAVES Extension — Background Service Worker (Manifest V3)
 *
 * Responsibilities:
 * - Open the side panel when action icon is clicked
 * - Route messages between content scripts and the sidebar
 * - Proxy API calls to the Next.js web app (keeps base URL configurable)
 * - Manage session token in chrome.storage.session
 */

const WEB_APP_BASE = 'http://localhost:3000';

// ─── Side panel setup ────────────────────────────────────────────────────────
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// ─── Message router ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type } = message;

  if (type === 'OPEN_SIDEBAR') {
    // Content script requests sidebar open with selected text
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.sidePanel.open({ tabId }).catch(console.error);
      // Forward the selected text to the sidebar once it opens
      // We store it temporarily so the sidebar can pick it up on mount
      chrome.storage.session.set({ pendingSelection: message.text }).catch(console.error);
    }
    sendResponse({ ok: true });
    return true;
  }

  if (type === 'GET_PENDING_SELECTION') {
    chrome.storage.session.get('pendingSelection').then((result) => {
      sendResponse({ text: result.pendingSelection || null });
      // Clear after reading
      chrome.storage.session.remove('pendingSelection');
    });
    return true; // async
  }

  if (type === 'CALL_API') {
    // { endpoint: '/api/clarify', method: 'POST', body: {...} }
    const { endpoint, method = 'POST', body } = message;
    chrome.storage.session.get('authToken').then(async (result) => {
      try {
        const res = await fetch(`${WEB_APP_BASE}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(result.authToken ? { Authorization: `Bearer ${result.authToken}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        sendResponse({ ok: res.ok, data });
      } catch (err) {
        sendResponse({ ok: false, error: String(err) });
      }
    });
    return true; // async
  }

  if (type === 'GET_SESSION') {
    chrome.storage.session.get('authToken').then((result) => {
      sendResponse({ token: result.authToken || null });
    });
    return true;
  }

  if (type === 'SET_SESSION') {
    chrome.storage.session.set({ authToken: message.token }).then(() => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (type === 'CLEAR_SESSION') {
    chrome.storage.session.remove('authToken').then(() => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (type === 'INJECT_HIGHLIGHTS') {
    // Forward highlight instructions to the active content script
    const tabId = sender.tab?.id ?? message.tabId;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: 'DO_HIGHLIGHT', excerpts: message.excerpts });
    }
    sendResponse({ ok: true });
    return true;
  }

  if (type === 'CLEAR_HIGHLIGHTS') {
    const tabId = sender.tab?.id ?? message.tabId;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { type: 'DO_CLEAR_HIGHLIGHTS' });
    }
    sendResponse({ ok: true });
    return true;
  }
});

// ─── Context menus ───────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'reaves-ask',
    title: 'Ask REAVES',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id: 'reaves-search-page',
    title: 'Search page with REAVES',
    contexts: ['page'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === 'reaves-ask' && info.selectionText) {
    chrome.storage.session.set({ pendingSelection: info.selectionText });
    chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
  }
  if (info.menuItemId === 'reaves-search-page') {
    chrome.sidePanel.open({ tabId: tab.id }).catch(console.error);
  }
});
