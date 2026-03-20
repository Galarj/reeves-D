'use client';

import { NotebookEntry, CitationFormat } from '@/types';
import { formatCitation } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Copy, Check, FileText } from 'lucide-react';
import { useState } from 'react';

const FORMATS: CitationFormat[] = ['APA', 'MLA', 'Chicago'];

interface CitationCardProps {
  entry: NotebookEntry;
  onFormatChange: (id: string, format: CitationFormat) => void;
}

export default function CitationCard({ entry, onFormatChange }: CitationCardProps) {
  const [copied, setCopied] = useState(false);
  const citation = formatCitation(entry.source, entry.citation_format);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-white/40" />
          <span className="text-xs text-white/50 font-medium">Citation</span>
        </div>
        {/* Format tabs */}
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          {FORMATS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFormatChange(entry.id, fmt)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium transition-colors',
                entry.citation_format === fmt
                  ? 'bg-violet-600/40 text-violet-300'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              )}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2">
        <p className="flex-1 text-xs text-white/60 leading-relaxed font-mono">{citation}</p>
        <button
          onClick={handleCopy}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-lg border transition-all',
            copied
              ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
