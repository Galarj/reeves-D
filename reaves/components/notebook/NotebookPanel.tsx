'use client';

import { useState } from 'react';
import { NotebookEntry, CitationFormat } from '@/types';
import { cn, getTrustColor } from '@/lib/utils';
import CitationCard from './CitationCard';
import { BookOpen, Trash2, Tag, StickyNote, ChevronDown, ChevronUp } from 'lucide-react';

const TAGS = ['Untagged', 'Key Source', 'Background', 'Methodology', 'Contradicts', 'Supports'];

interface NotebookPanelProps {
  entries: NotebookEntry[];
  onRemove: (id: string) => void;
  onUpdateTag: (id: string, tag: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onFormatChange: (id: string, format: CitationFormat) => void;
}

export default function NotebookPanel({
  entries,
  onRemove,
  onUpdateTag,
  onUpdateNote,
  onFormatChange,
}: NotebookPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <BookOpen className="h-6 w-6 text-white/20" />
        </div>
        <p className="text-sm text-white/40 font-medium">Your notebook is empty</p>
        <p className="text-xs text-white/25 mt-1">Save sources from your search results to build your research collection</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-white/80">
          {entries.length} saved {entries.length === 1 ? 'source' : 'sources'}
        </h3>
      </div>

      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const trustColor = getTrustColor(entry.source.trust_score);

        return (
          <div
            key={entry.id}
            className="rounded-xl border border-white/8 bg-white/3 overflow-hidden"
          >
            {/* Header row */}
            <div className="p-3 flex items-start gap-2">
              <div className={cn('text-lg font-bold flex-shrink-0 leading-none', trustColor)}>
                {entry.source.trust_score}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 leading-snug line-clamp-2">
                  {entry.source.title}
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  {entry.source.authors} · {entry.source.year}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                >
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-white/5 p-3 space-y-3">
                {/* Tag select */}
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                  <select
                    value={entry.tag}
                    onChange={(e) => onUpdateTag(entry.id, e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 outline-none focus:border-violet-500/40"
                  >
                    {TAGS.map((t) => (
                      <option key={t} value={t} className="bg-gray-900">{t}</option>
                    ))}
                  </select>
                </div>

                {/* Note textarea */}
                <div className="flex items-start gap-2">
                  <StickyNote className="h-3.5 w-3.5 text-white/30 flex-shrink-0 mt-1" />
                  <textarea
                    value={entry.user_note}
                    onChange={(e) => onUpdateNote(entry.id, e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/70 placeholder-white/20 outline-none focus:border-violet-500/40 resize-none"
                  />
                </div>

                {/* Citation */}
                <CitationCard entry={entry} onFormatChange={onFormatChange} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
