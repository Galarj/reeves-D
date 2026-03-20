'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Notebook, NotebookEntry, Source, CitationFormat } from '@/types';

const STORAGE_KEY = 'reaves-notebooks';

interface NotebookContextValue {
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  activeNotebookId: string | null;
  setActiveNotebookId: (id: string | null) => void;
  createNotebook: (name: string, description?: string) => Notebook;
  deleteNotebook: (id: string) => void;
  renameNotebook: (id: string, name: string) => void;
  addEntry: (source: Source) => void;
  removeEntry: (entryId: string) => void;
  updateEntryTag: (entryId: string, tag: string) => void;
  updateEntryNote: (entryId: string, note: string) => void;
  updateEntryFormat: (entryId: string, format: CitationFormat) => void;
  isSourceSaved: (sourceId: string) => boolean;
}

const NotebookContext = createContext<NotebookContextValue | null>(null);

export function useNotebooks() {
  const ctx = useContext(NotebookContext);
  if (!ctx) throw new Error('useNotebooks must be used within NotebookProvider');
  return ctx;
}

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { notebooks: Notebook[]; activeId: string | null };
        setNotebooks(parsed.notebooks || []);
        setActiveNotebookId(parsed.activeId || null);
      }
    } catch { /* empty */ }
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ notebooks, activeId: activeNotebookId }));
    } catch { /* empty */ }
  }, [notebooks, activeNotebookId, loaded]);

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || null;

  const createNotebook = useCallback((name: string, description = '') => {
    const nb: Notebook = {
      id: `nb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      entries: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setNotebooks((prev) => [...prev, nb]);
    setActiveNotebookId(nb.id);
    return nb;
  }, []);

  const deleteNotebook = useCallback((id: string) => {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
    setActiveNotebookId((prev) => (prev === id ? null : prev));
  }, []);

  const renameNotebook = useCallback((id: string, name: string) => {
    setNotebooks((prev) =>
      prev.map((n) => n.id === id ? { ...n, name, updated_at: new Date().toISOString() } : n)
    );
  }, []);

  // Mutate active notebook entries
  const mutateActive = useCallback((fn: (entries: NotebookEntry[]) => NotebookEntry[]) => {
    setNotebooks((prev) =>
      prev.map((n) =>
        n.id === activeNotebookId
          ? { ...n, entries: fn(n.entries), updated_at: new Date().toISOString() }
          : n
      )
    );
  }, [activeNotebookId]);

  const addEntry = useCallback((source: Source) => {
    if (!activeNotebookId) return;
    mutateActive((entries) => {
      // Toggle: if already saved, remove
      if (entries.some((e) => e.source.id === source.id)) {
        return entries.filter((e) => e.source.id !== source.id);
      }
      const entry: NotebookEntry = {
        id: `e-${source.id}-${Date.now()}`,
        source,
        tag: 'Untagged',
        user_note: '',
        saved_at: new Date().toISOString(),
        citation_format: 'APA',
      };
      return [...entries, entry];
    });
  }, [activeNotebookId, mutateActive]);

  const removeEntry = useCallback((entryId: string) => {
    mutateActive((entries) => entries.filter((e) => e.id !== entryId));
  }, [mutateActive]);

  const updateEntryTag = useCallback((entryId: string, tag: string) => {
    mutateActive((entries) => entries.map((e) => e.id === entryId ? { ...e, tag } : e));
  }, [mutateActive]);

  const updateEntryNote = useCallback((entryId: string, note: string) => {
    mutateActive((entries) => entries.map((e) => e.id === entryId ? { ...e, user_note: note } : e));
  }, [mutateActive]);

  const updateEntryFormat = useCallback((entryId: string, format: CitationFormat) => {
    mutateActive((entries) => entries.map((e) => e.id === entryId ? { ...e, citation_format: format } : e));
  }, [mutateActive]);

  const isSourceSaved = useCallback((sourceId: string) => {
    if (!activeNotebook) return false;
    return activeNotebook.entries.some((e) => e.source.id === sourceId);
  }, [activeNotebook]);

  return (
    <NotebookContext.Provider
      value={{
        notebooks,
        activeNotebook,
        activeNotebookId,
        setActiveNotebookId,
        createNotebook,
        deleteNotebook,
        renameNotebook,
        addEntry,
        removeEntry,
        updateEntryTag,
        updateEntryNote,
        updateEntryFormat,
        isSourceSaved,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}
