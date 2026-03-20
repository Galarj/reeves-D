'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, ChevronDown, Plus, Search,
  Trash2, Pencil, Check, X, ExternalLink
} from 'lucide-react';
import NotebookPanel from '@/components/notebook/NotebookPanel';
import ThesisBuilder from '@/components/notebook/ThesisBuilder';
import { useNotebooks } from '@/lib/notebook-context';
import { CitationFormat, Notebook } from '@/types';
import { cn } from '@/lib/utils';

// ── Single notebook card shown in the list view ──────────────────────────────
function NotebookCard({
  notebook,
  isActive,
  onOpen,
  onDelete,
  onRename,
  onToggleExpand,
  expanded,
}: {
  notebook: Notebook;
  isActive: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onToggleExpand: () => void;
  expanded: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notebook.name);
  const { removeEntry, updateEntryTag, updateEntryNote, updateEntryFormat } = useNotebooks();

  const commitRename = () => {
    if (draft.trim()) onRename(draft.trim());
    setEditing(false);
  };

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden transition-all duration-200',
      isActive ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/8 bg-white/3 hover:border-white/15'
    )}>
      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0',
          isActive ? 'bg-violet-600/30' : 'bg-white/5'
        )}>
          <BookOpen className={cn('h-4 w-4', isActive ? 'text-violet-300' : 'text-white/30')} />
        </div>

        {/* Name + meta — clicking name opens the notebook */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') { setEditing(false); setDraft(notebook.name); }
                }}
                className="flex-1 bg-white/5 border border-violet-500/40 rounded-lg px-2 py-0.5 text-sm text-white outline-none"
              />
              <button onClick={commitRename} className="p-1 text-emerald-400 hover:text-emerald-300"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={() => { setEditing(false); setDraft(notebook.name); }} className="p-1 text-white/30 hover:text-white/60"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <button
              onClick={onOpen}
              className="text-left group"
            >
              <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors leading-snug flex items-center gap-1.5">
                {notebook.name}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
              </p>
            </button>
          )}
          <p className="text-xs text-white/30 mt-0.5">
            {notebook.entries.length} source{notebook.entries.length !== 1 ? 's' : ''} · updated {relativeTime(notebook.updated_at)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
            title="Rename"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Delete notebook"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {/* Dropdown toggle — expands sources inline */}
          <button
            onClick={onToggleExpand}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              expanded
                ? 'bg-white/8 text-white/60'
                : 'text-white/20 hover:text-white/60 hover:bg-white/5'
            )}
            title="View sources"
          >
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Inline source dropdown */}
      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3">
          {notebook.entries.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-3">No sources saved yet.</p>
          ) : (
            <NotebookPanel
              entries={notebook.entries}
              onRemove={removeEntry}
              onUpdateTag={updateEntryTag}
              onUpdateNote={updateEntryNote}
              onFormatChange={updateEntryFormat}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Detail view for a single open notebook ────────────────────────────────────
function NotebookDetail({ notebook, onBack }: { notebook: Notebook; onBack: () => void }) {
  const { removeEntry, updateEntryTag, updateEntryNote, updateEntryFormat } = useNotebooks();

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Notebooks
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-violet-600/30 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-violet-300" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-white">{notebook.name}</h1>
          <p className="text-xs text-white/35">
            {notebook.entries.length === 0
              ? 'No sources saved yet'
              : `${notebook.entries.length} saved source${notebook.entries.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {notebook.entries.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-white/15 mx-auto" />
          <p className="text-sm text-white/40">This notebook is empty</p>
          <p className="text-xs text-white/25">Go to the dashboard, search for a topic, and save sources here.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-violet-600/80 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            Start Researching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <NotebookPanel
              entries={notebook.entries}
              onRemove={removeEntry}
              onUpdateTag={updateEntryTag}
              onUpdateNote={updateEntryNote}
              onFormatChange={(id, format: CitationFormat) => updateEntryFormat(id, format)}
            />
          </div>
          <div className="lg:sticky lg:top-20">
            <ThesisBuilder entries={notebook.entries} topic={notebook.name} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotebookPage() {
  const {
    notebooks,
    activeNotebookId,
    setActiveNotebookId,
    createNotebook,
    deleteNotebook,
    renameNotebook,
  } = useNotebooks();

  // Which notebook card has its dropdown expanded (separate from "open" detail)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Detail view — either null (show list) or a notebook id
  const [openId, setOpenId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');

  const openNotebook = notebooks.find((n) => n.id === openId) || null;

  const handleCreate = () => {
    const name = newName.trim() || `Notebook ${notebooks.length + 1}`;
    const nb = createNotebook(name);
    setNewName('');
    setOpenId(nb.id);
  };

  const handleOpen = (id: string) => {
    setActiveNotebookId(id);
    setOpenId(id);
  };

  const handleBack = () => setOpenId(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] bg-mesh">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="font-display font-bold text-lg tracking-tight gradient-text">
            {openNotebook ? openNotebook.name : 'My Notebooks'}
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {openNotebook ? (
          // ── Detail view ──
          <NotebookDetail notebook={openNotebook} onBack={handleBack} />
        ) : (
          // ── List view ──
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-bold text-2xl text-white">My Notebooks</h1>
                <p className="text-sm text-white/35 mt-0.5">
                  {notebooks.length === 0
                    ? 'Create a notebook to start saving sources'
                    : `${notebooks.length} notebook${notebooks.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Create new notebook */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="New notebook name..."
                className="flex-1 max-w-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder-white/20 outline-none focus:border-violet-500/40 transition-colors"
              />
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            </div>

            {/* Notebook cards */}
            {notebooks.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center space-y-4">
                <BookOpen className="h-12 w-12 text-white/10 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-white/40">No notebooks yet</p>
                  <p className="text-xs text-white/25 mt-1">Create one above, then save sources from your search results.</p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/80 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Start Researching
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {notebooks.map((nb) => (
                  <NotebookCard
                    key={nb.id}
                    notebook={nb}
                    isActive={nb.id === activeNotebookId}
                    onOpen={() => handleOpen(nb.id)}
                    onDelete={() => deleteNotebook(nb.id)}
                    onRename={(name) => renameNotebook(nb.id, name)}
                    onToggleExpand={() => setExpandedId(expandedId === nb.id ? null : nb.id)}
                    expanded={expandedId === nb.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
