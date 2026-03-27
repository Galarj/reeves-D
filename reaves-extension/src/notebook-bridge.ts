/**
 * Notebook bridge — reads/writes the REAVES web app's localStorage
 * via chrome.scripting.executeScript into an open REAVES Cloud tab.
 *
 * This keeps the extension and web app notebooks perfectly in sync
 * without needing any API endpoint or Supabase.
 */

import type { Notebook } from './types';

const STORAGE_KEY = 'reaves-notebooks';
const REAVES_ORIGINS = ['https://reeves-d.vercel.app'];

interface NotebookState {
  notebooks: Notebook[];
  activeId: string | null;
}

/** Find an open REAVES web app tab */
async function findReavesTab(): Promise<number | null> {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && REAVES_ORIGINS.some((o) => tab.url!.startsWith(o))) {
      return tab.id;
    }
  }
  return null;
}

/** Read notebooks from the web app's localStorage */
export async function readNotebooks(): Promise<NotebookState> {
  const tabId = await findReavesTab();
  if (!tabId) {
    // Fallback: read from extension's own localStorage
    return readLocal();
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (key: string) => localStorage.getItem(key),
      args: [STORAGE_KEY],
    });

    const raw = results?.[0]?.result;
    if (raw) {
      const parsed = JSON.parse(raw) as NotebookState;
      // Also cache locally so it works if REAVES tab is closed later
      try { localStorage.setItem(STORAGE_KEY, raw); } catch { /* ok */ }
      return parsed;
    }
  } catch (err) {
    console.warn('[notebook-bridge] Could not read from REAVES tab:', err);
  }

  return readLocal();
}

/** Write notebooks to BOTH the web app's localStorage and the extension's */
export async function writeNotebooks(state: NotebookState): Promise<void> {
  const json = JSON.stringify(state);

  // Always write to extension localStorage as cache
  try { localStorage.setItem(STORAGE_KEY, json); } catch { /* ok */ }

  // Also write to the web app tab if open
  const tabId = await findReavesTab();
  if (tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (key: string, value: string) => {
          localStorage.setItem(key, value);
          // Dispatch storage event so React picks it up
          window.dispatchEvent(new Event('storage'));
        },
        args: [STORAGE_KEY, json],
      });
    } catch (err) {
      console.warn('[notebook-bridge] Could not write to REAVES tab:', err);
    }
  }
}

function readLocal(): NotebookState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return { notebooks: [], activeId: null };
}

/** 
 * Safely extract the Supabase Auth session from the active REAVES tab
 * so the extension can sync directly to the cloud.
 */
/**
 * Reads the Supabase chunks securely straight out of Chrome's background
 * cookie jar, entirely bypassing CORS, deployment boundaries, and tab targets.
 */
export async function getAuthSessionFromWeb(): Promise<string | null> {
  const url = 'https://reeves-d.vercel.app';
  const prefix = 'sb-fxmudyjgfheriatuqphw-auth-token';

  try {
    const cookies = await chrome.cookies.getAll({ url });
    if (!cookies || cookies.length === 0) return null;

    const authCookies = cookies.filter(c => c.name.startsWith(prefix));
    if (authCookies.length === 0) return null;

    // Sort appropriately to combine chunked cookies (.0, .1)
    authCookies.sort((a, b) => {
      const aIdx = parseInt(a.name.split('.').pop() || '0', 10);
      const bIdx = parseInt(b.name.split('.').pop() || '0', 10);
      return (Number.isNaN(aIdx) ? 0 : aIdx) - (Number.isNaN(bIdx) ? 0 : bIdx);
    });

    let rawData = authCookies.map(c => c.value).join('');

    // Decode if base64 chunked mode is active
    if (rawData.startsWith('base64-')) {
      try {
        const decoded = atob(rawData.replace('base64-', ''));
        return JSON.parse(decoded).access_token || null;
      } catch {
        // fallback
      }
    }

    try {
      return JSON.parse(decodeURIComponent(rawData)).access_token || null;
    } catch {
      try {
        return JSON.parse(rawData).access_token || null;
      } catch {
        return null;
      }
    }
  } catch (err) {
    console.warn('[auth-bridge] Failed to decode Supabase cookies natively:', err);
    return null;
  }
}
