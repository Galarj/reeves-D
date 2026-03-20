import { useState, useCallback } from 'react';
import { callAPI, sendHighlights, clearHighlights } from '../api';
import type { PageExcerpt } from '../types';

type Step = 'idle' | 'extracting' | 'searching' | 'results';

function formatCitation(title: string, url: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `(${title}, ${url}, accessed ${date})`;
}

async function extractPageText(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return reject('No active tab');
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            // Extract readable text from the page
            const sel = [
              'article', 'main', '[role="main"]', '.content',
              '.article-body', '#content', 'body',
            ];
            for (const s of sel) {
              const el = document.querySelector(s);
              if (el) {
                const text = (el as HTMLElement).innerText;
                if (text.length > 200) return text.slice(0, 20000);
              }
            }
            return document.body.innerText.slice(0, 20000);
          },
        },
        (results) => {
          if (chrome.runtime.lastError) return reject(chrome.runtime.lastError.message);
          resolve(results?.[0]?.result as string ?? '');
        }
      );
    });
  });
}

function chunkText(text: string, chunkSize = 800): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks.filter((c) => c.length > 80);
}

export default function PageSearchView() {
  const [query, setQuery] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [excerpts, setExcerpts] = useState<PageExcerpt[]>([]);
  const [highlightsOn, setHighlightsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageUrl, setPageUrl] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;
    setStep('extracting');
    setError(null);
    setExcerpts([]);
    setHighlightsOn(false);

    try {
      // Get page metadata
      const [tab] = await new Promise<chrome.tabs.Tab[]>((res) =>
        chrome.tabs.query({ active: true, currentWindow: true }, res)
      );
      setPageTitle(tab.title || '');
      setPageUrl(tab.url || '');

      const pageText = await extractPageText();
      if (!pageText || pageText.length < 100) {
        setError('Could not extract readable text from this page.');
        setStep('idle');
        return;
      }

      const chunks = chunkText(pageText);
      setStep('searching');

      const res = await callAPI<{ excerpts: PageExcerpt[] }>('/api/page-search', {
        chunks,
        query: query.trim(),
      });

      if (!res.ok || !res.data?.excerpts) {
        setError('Page search failed. Make sure REAVES app is running at localhost:3000.');
        setStep('idle');
        return;
      }

      setExcerpts(res.data.excerpts);
      setStep('results');
    } catch (err) {
      setError(String(err));
      setStep('idle');
    }
  }

  function toggleHighlights() {
    if (highlightsOn) {
      clearHighlights();
      setHighlightsOn(false);
    } else {
      sendHighlights(excerpts);
      setHighlightsOn(true);
    }
  }

  function copyPlain(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
  }

  function copyWithCitation(text: string) {
    const citation = formatCitation(pageTitle || 'Unknown', pageUrl || window.location.href);
    navigator.clipboard.writeText(`"${text}" ${citation}`).then(() => showToast('Copied with citation!'));
  }

  function reset() {
    clearHighlights();
    setHighlightsOn(false);
    setExcerpts([]);
    setStep('idle');
    setQuery('');
    setError(null);
  }

  const isLoading = step === 'extracting' || step === 'searching';

  return (
    <div className="fade-up">
      <p className="section-label">Search this page's content</p>

      <div style={{ position: 'relative' }}>
        <textarea
          className="input"
          rows={2}
          placeholder="What are you looking for in this page?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); }
          }}
        />
      </div>

      {error && <p style={{ color: 'var(--rose)', fontSize: 11, marginTop: 6 }}>{error}</p>}

      <div className="flex-between gap-2 mt-2">
        {step === 'results' && (
          <button className="btn btn-ghost btn-sm" onClick={reset}>Clear</button>
        )}
        <button
          className="btn btn-primary btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
        >
          {isLoading
            ? <><div className="spinner" />{step === 'extracting' ? 'Reading page…' : 'Searching…'}</>
            : '⌕ Search Page'}
        </button>
      </div>

      {step === 'results' && excerpts.length > 0 && (
        <>
          <div className="divider" />
          <div className="flex-between mb-2">
            <p className="section-label">{excerpts.length} relevant excerpts</p>
            <button
              className={`btn btn-sm ${highlightsOn ? 'btn-primary' : 'btn-ghost'}`}
              onClick={toggleHighlights}
              style={{ padding: '4px 10px', fontSize: 10 }}
            >
              {highlightsOn ? '● Highlighted' : '○ Highlight'}
            </button>
          </div>

          {excerpts.map((ex, i) => (
            <div key={i} className="card fade-up">
              <div className="flex-between gap-2" style={{ marginBottom: 6 }}>
                <span className="tag tag-violet">#{i + 1}</span>
                <span
                  className={`score-badge ${ex.score >= 0.7 ? 'score-high' : ex.score >= 0.4 ? 'score-medium' : 'score-low'}`}
                >
                  {Math.round(ex.score * 100)}% match
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.7, marginBottom: 8 }}>
                {ex.text.length > 300 ? ex.text.slice(0, 300) + '…' : ex.text}
              </p>
              <div className="copy-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyPlain(ex.text)}
                >
                  Copy
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => copyWithCitation(ex.text)}
                  style={{ flex: 1 }}
                >
                  Copy + Citation
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {step === 'results' && excerpts.length === 0 && (
        <div className="empty-state">
          <p>No relevant excerpts found for this query on the current page.</p>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
