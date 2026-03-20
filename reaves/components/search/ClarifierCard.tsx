'use client';

import { useState } from 'react';
import { MessageSquare, ChevronRight, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClarifierResponse } from '@/types';

interface ClarifierCardProps {
  clarifier: ClarifierResponse;
  onSelect: (option: string, refinedQuery: string) => void;
  isLoading?: boolean;
}

export default function ClarifierCard({ clarifier, onSelect, isLoading = false }: ClarifierCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (isLoading) return;
    setSelected(idx);
    onSelect(clarifier.options[idx], clarifier.refined_queries[idx]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fadeIn">
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-violet-500/10">
          <div className="h-8 w-8 rounded-lg bg-violet-600/30 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-violet-300" />
          </div>
          <div>
            <p className="text-xs text-violet-400 font-medium uppercase tracking-wider">AI Clarifier</p>
            <p className="text-sm text-white/80">{clarifier.clarifier_question}</p>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {clarifier.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left',
                'transition-all duration-200 group',
                selected === idx
                  ? 'border-violet-500/50 bg-violet-600/20 text-violet-200'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0',
                  selected === idx
                    ? 'border-violet-400 bg-violet-600/40 text-violet-300'
                    : 'border-white/20 text-white/40 group-hover:border-violet-400/50'
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm font-medium">{option}</span>
              </div>
              <div className="flex items-center gap-2">
                {isLoading && selected === idx ? (
                  <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                ) : (
                  <ChevronRight className={cn(
                    'h-4 w-4 transition-transform',
                    selected === idx ? 'text-violet-400 transform translate-x-0.5' : 'text-white/20 group-hover:text-white/40'
                  )} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Skip option */}
        <div className="px-4 pb-4">
          <button
            onClick={() => onSelect('', '')}
            disabled={isLoading}
            className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors py-1"
          >
            <MessageSquare className="inline h-3 w-3 mr-1" />
            Skip clarification and search as-is
          </button>
        </div>
      </div>
    </div>
  );
}
