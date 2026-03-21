'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Home, Loader2, AlertCircle, Plus, ChevronDown } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import ClarifierCard from '@/components/search/ClarifierCard';
import SourceCard from '@/components/results/SourceCard';
import SynthesisPanel from '@/components/results/SynthesisPanel';
import GapDetector from '@/components/results/GapDetector';
import NotebookPanel from '@/components/notebook/NotebookPanel';
import ThesisBuilder from '@/components/notebook/ThesisBuilder';
import { useNotebooks } from '@/lib/notebook-context';
import { ClarifierResponse, SearchResult, Source } from '@/types';

type Step = 'idle' | 'clarifying' | 'clarified' | 'searching' | 'results' | 'error';

export default function DashboardPage() {
  const [step, setStep] = useState<Step>('idle');
  const [rawQuery, setRawQuery] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [clarifier, setClarifier] = useState<ClarifierResponse | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNotebook, setShowNotebook] = useState(false);
  const [biasLoadingIds, setBiasLoadingIds] = useState<Set<string>>(new Set());
  const [simplifyLoadingIds, setSimplifyLoadingIds] = useState<Set<string>>(new Set());
  const [showNbPicker, setShowNbPicker] = useState(false);
  const [newNbName, setNewNbName] = useState('');

  const {
    notebooks,
    activeNotebook,
    activeNotebookId,
    setActiveNotebookId,
    createNotebook,
    addEntry,
    removeEntry,
    updateEntryTag,
    updateEntryNote,
    updateEntryFormat,
    isSourceSaved,
  } = useNotebooks();

  // ---------- Search flow ----------
  const handleSearch = async (query: string) => {
    setRawQuery(query);
    setError(null);
    setStep('clarifying');
    setClarifier(null);
    setSearchResult(null);

    try {
      const res = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_query: query }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || `Clarify failed (${res.status})`);
      }

      const data: ClarifierResponse = await res.json();

      if (data.ambiguous && data.options?.length > 0) {
        setClarifier(data);
        setStep('clarified');
      } else {
        await runSearch(query);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to AI. Check your API key in .env.local.');
      setStep('error');
    }
  };

  const handleClarifierSelect = async (_option: string, refinedQuery: string) => {
    const q = refinedQuery || rawQuery;
    setCurrentQuery(q);
    await runSearch(q);
  };

  const runSearch = async (query: string) => {
    setStep('searching');
    setCurrentQuery(query);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refined_query: query }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || `Search failed (${res.status})`);
      }

      const data: SearchResult = await res.json();
      setSearchResult(data);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sources. Please try again.');
      setStep('error');
    }
  };

  // ---------- Bias detection ----------
  const handleDetectBias = useCallback(async (source: Source) => {
    setBiasLoadingIds((prev) => new Set(prev).add(source.id));
    try {
      const res = await fetch('/api/bias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      const bias = await res.json();
      setSearchResult((prev) => {
        if (!prev) return prev;
        return { ...prev, sources: prev.sources.map((s) => s.id === source.id ? { ...s, bias } : s) };
      });
    } finally {
      setBiasLoadingIds((prev) => { const s = new Set(prev); s.delete(source.id); return s; });
    }
  }, []);

  // ---------- Jargon simplifier ----------
  const handleSimplify = useCallback(async (source: Source) => {
    setSimplifyLoadingIds((prev) => new Set(prev).add(source.id));
    try {
      const res = await fetch('/api/jargon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abstract: source.abstract }),
      });
      const data = await res.json();
      setSearchResult((prev) => {
        if (!prev) return prev;
        return { ...prev, sources: prev.sources.map((s) => s.id === source.id ? { ...s, simplified_abstract: data.simplified } : s) };
      });
    } finally {
      setSimplifyLoadingIds((prev) => { const s = new Set(prev); s.delete(source.id); return s; });
    }
  }, []);

  // ---------- Save to notebook ----------
  const handleSave = useCallback((source: Source) => {
    if (!activeNotebookId) {
      // Auto-create a notebook if none exists
      const nb = createNotebook(currentQuery || 'My Research');
      // Need to set active and delay the add since state update is async
      setTimeout(() => addEntry(source), 0);
      setShowNotebook(true);
      return;
    }
    addEntry(source);
    setShowNotebook(true);
  }, [activeNotebookId, createNotebook, addEntry, currentQuery]);

  const handleCreateNotebook = () => {
    const name = newNbName.trim() || currentQuery || 'My Research';
    createNotebook(name);
    setNewNbName('');
    setShowNbPicker(false);
  };

  const entries = activeNotebook?.entries ?? [];
  const isSearching = step === 'searching';

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-mesh flex flex-col">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="font-display font-bold text-lg tracking-tight gradient-text">
            REAVES
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
              <Home className="h-4 w-4" />
            </Link>
            <Link href="/notebook" className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
              <BookOpen className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setShowNotebook(!showNotebook)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                showNotebook
                  ? 'bg-violet-600/20 border-violet-500/30 text-violet-300'
                  : 'border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              {activeNotebook
                ? <span className="max-w-[120px] truncate">{activeNotebook.name}</span>
                : 'Notebook'
              }
              {entries.length > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-violet-600 text-[10px] text-white flex items-center justify-center font-bold">
                  {entries.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main layout */}
      <div className="flex flex-1 pt-14">
        {/* Content area */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${showNotebook ? 'mr-[380px]' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">

            {/* Search bar */}
            <div className="space-y-3">
              {(step === 'idle' || step === 'error') && (
                <div className="text-center space-y-2 mb-8">
                  <h1 className="font-display text-3xl font-bold gradient-text">Research. Validated.</h1>
                  <p className="text-sm text-white/40">Ask any research question and REAVES will validate every source for you.</p>
                </div>
              )}
              <SearchBar
                onSearch={handleSearch}
                isLoading={step === 'clarifying' || isSearching}
              />
            </div>

            {/* Error */}
            {step === 'error' && error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-fadeIn">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Clarifier */}
            {step === 'clarified' && clarifier && (
              <ClarifierCard
                clarifier={clarifier}
                onSelect={handleClarifierSelect}
                isLoading={isSearching}
              />
            )}

            {/* Searching loader */}
            {isSearching && (
              <div className="flex flex-col items-center gap-4 py-16 animate-fadeIn">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-violet-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/70">Searching academic literature...</p>
                  <p className="text-xs text-white/35 mt-1">Validating credibility, scoring trust, detecting bias</p>
                </div>
              </div>
            )}

            {/* Results — Two-Column Command Center */}
            {step === 'results' && searchResult && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-xs text-white/30 px-3">Results for: <span className="text-white/50">{currentQuery}</span></span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* ── Right Column: AI Insights (sticky sidebar) ── */}
                  {/* Rendered first in DOM so it appears before sources on mobile */}
                  <div className="order-first lg:order-last lg:col-span-5 lg:sticky lg:top-20 lg:h-fit space-y-5">
                    {/* AI Synthesis — glassmorphism wrapper */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[12px] overflow-hidden">
                      <SynthesisPanel result={searchResult} query={currentQuery} />
                    </div>

                    {/* Research Gap Detector — amber accent */}
                    {searchResult.research_gaps?.length > 0 && (
                      <div className="rounded-2xl border border-white/10 border-l-2 border-l-amber-500/40 bg-white/5 backdrop-blur-[12px] overflow-hidden">
                        <GapDetector
                          gaps={searchResult.research_gaps}
                          onResearch={handleSearch}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Left Column: Source Cards ── */}
                  <div className="lg:col-span-7 lg:order-first space-y-4">
                    <h2 className="text-xs font-medium text-white/40 uppercase tracking-wider">
                      {searchResult.sources?.length ?? 0} Sources Found
                    </h2>
                    {(searchResult.sources ?? []).map((source) => (
                      <SourceCard
                        key={source.id}
                        source={source}
                        isSaved={isSourceSaved(source.id)}
                        onSave={handleSave}
                        onDetectBias={handleDetectBias}
                        onSimplify={handleSimplify}
                        isDetectingBias={biasLoadingIds.has(source.id)}
                        isSimplifying={simplifyLoadingIds.has(source.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Notebook sidebar */}
        {showNotebook && (
          <aside className="fixed top-14 right-0 bottom-0 w-[380px] border-l border-white/8 bg-[#0a0a0f]/95 backdrop-blur-md overflow-y-auto">
            <div className="p-5 space-y-4">
              {/* Header + notebook picker */}
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base gradient-text">Notebook</h2>
                <button
                  onClick={() => setShowNotebook(false)}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Notebook selector */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowNbPicker(!showNbPicker)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/3 text-sm text-white/70 hover:border-white/20 transition-all"
                >
                  <span className="truncate">{activeNotebook?.name || 'Select a notebook...'}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition-transform ${showNbPicker ? 'rotate-180' : ''}`} />
                </button>

                {showNbPicker && (
                  <div className="rounded-xl border border-white/10 bg-[#0d0d15] overflow-hidden">
                    {notebooks.map((nb) => (
                      <button
                        key={nb.id}
                        onClick={() => { setActiveNotebookId(nb.id); setShowNbPicker(false); }}
                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-white/5 transition-colors flex items-center justify-between ${
                          nb.id === activeNotebookId ? 'bg-violet-500/10 text-violet-300' : 'text-white/60'
                        }`}
                      >
                        <span className="truncate">{nb.name}</span>
                        <span className="text-[10px] text-white/25 flex-shrink-0 ml-2">
                          {nb.entries.length} source{nb.entries.length !== 1 ? 's' : ''}
                        </span>
                      </button>
                    ))}
                    {/* Create new */}
                    <div className="border-t border-white/5 p-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newNbName}
                          onChange={(e) => setNewNbName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateNotebook()}
                          placeholder="New notebook name..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 placeholder-white/20 outline-none focus:border-violet-500/40"
                        />
                        <button
                          onClick={handleCreateNotebook}
                          className="p-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Entries */}
              {activeNotebook ? (
                <>
                  <NotebookPanel
                    entries={entries}
                    onRemove={removeEntry}
                    onUpdateTag={updateEntryTag}
                    onUpdateNote={updateEntryNote}
                    onFormatChange={updateEntryFormat}
                  />
                  {entries.length >= 2 && (
                    <ThesisBuilder
                      entries={entries}
                      topic={currentQuery}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <BookOpen className="h-8 w-8 text-white/15 mb-3" />
                  <p className="text-sm text-white/40">No notebook selected</p>
                  <p className="text-xs text-white/25 mt-1">Select or create a notebook above, then save sources from your search results.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
