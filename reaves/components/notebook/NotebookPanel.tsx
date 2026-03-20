'use client';

import { useState } from 'react';
import { NotebookEntry, CitationFormat } from '@/types';
import { cn, getTrustColor } from '@/lib/utils';
import CitationCard from './CitationCard';
import dynamic from 'next/dynamic';

// This forces the component to ONLY load in the browser (client-side)
const CompareDialog = dynamic(() => import('./CompareDialog'), {
  ssr: false,
  // Optional: show a darkened backdrop while it loads
  loading: () => <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]" />
});
import { BookOpen, Trash2, Tag, StickyNote, ChevronDown, ChevronUp, SplitSquareHorizontal } from 'lucide-react';

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

  // NEW STATE: For the Side-by-Side Comparison Feature
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev; // Enforce max 3 limit
      return [...prev, id];
    });
  };

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
    <div className="space-y-3 relative">
      {/* HEADER WITH COMPARE BUTTON */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          {entries.length} saved {entries.length === 1 ? 'source' : 'sources'}
        </h3>

        {/* The Compare Button only shows when 2 or 3 sources are selected */}
        <div className="h-8">
          {selectedIds.length >= 2 ? (
            <button
              onClick={() => setIsComparing(true)}
              className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-md font-medium transition-all shadow-lg shadow-violet-900/20"
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5" />
              Compare {selectedIds.length} Sources
            </button>
          ) : (
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
              Select 2-3 to compare
            </span>
          )}
        </div>
      </div>

      {/* SOURCE LIST */}
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const isSelected = selectedIds.includes(entry.id);
        const trustColor = getTrustColor(entry.source.trust_score);
        const isMaxSelected = selectedIds.length >= 3 && !isSelected;

        return (
          <div
            key={entry.id}
            className={cn(
              "rounded-xl border bg-white/3 overflow-hidden transition-colors",
              isSelected ? "border-violet-500/40 bg-violet-500/5" : "border-white/8"
            )}
          >
            {/* Header row */}
            <div className="p-3 flex items-start gap-3">

              {/* Checkbox for comparison */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(entry.id)}
                disabled={isMaxSelected}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-violet-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title={isMaxSelected ? "You can only compare up to 3 sources" : "Select to compare"}
              />

              {/* Trust Score */}
              <div className={cn('text-lg font-bold flex-shrink-0 leading-none mt-0.5', trustColor)}>
                {entry.source.trust_score}
              </div>

              {/* Title & Authors */}
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium leading-snug line-clamp-2", isSelected ? "text-violet-100" : "text-white/80")}>
                  {entry.source.title}
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  {entry.source.authors} · {entry.source.year}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                >
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => {
                    // Make sure it gets unselected if they delete it!
                    if (isSelected) toggleSelection(entry.id);
                    onRemove(entry.id);
                  }}
                  className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded Content (Tags, Notes, Citation) */}
            {isExpanded && (
              <div className="border-t border-white/5 p-3 space-y-3 bg-black/20">
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

      {/* RENDER THE COMPARE DIALOG WHEN ACTIVE */}
      {isComparing && (
        <CompareDialog
          entries={entries.filter(e => selectedIds.includes(e.id))}
          onClose={() => setIsComparing(false)}
        />
      )}
    </div>
  );
}