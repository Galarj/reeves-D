'use client';

import { useState } from 'react';
import { Source } from '@/types';
import { cn, getTrustColor, getTrustBg, getTrustLabel } from '@/lib/utils';
import TrustBreakdown from './TrustBreakdown';
import BiasFlag from './BiasFlag';
import {
  BookmarkPlus, BookmarkCheck, ChevronDown, ChevronUp,
  ExternalLink, Loader2, Wand2, Eye, EyeOff
} from 'lucide-react';

interface SourceCardProps {
  source: Source;
  isSaved: boolean;
  onSave: (source: Source) => void;
  onDetectBias: (source: Source) => Promise<void>;
  onSimplify: (source: Source) => Promise<void>;
  isDetectingBias?: boolean;
  isSimplifying?: boolean;
}

export default function SourceCard({
  source,
  isSaved,
  onSave,
  onDetectBias,
  onSimplify,
  isDetectingBias = false,
  isSimplifying = false,
}: SourceCardProps) {
  const [showTrust, setShowTrust] = useState(false);
  const [showAbstract, setShowAbstract] = useState(false);

  const trustColor = getTrustColor(source.trust_score);
  const trustBg = getTrustBg(source.trust_score);
  const trustLabel = getTrustLabel(source.trust_score);

  return (
    <div className={cn(
      'rounded-2xl border bg-white/3 backdrop-blur-sm overflow-hidden',
      'transition-all duration-300 hover:bg-white/5',
      isSaved ? 'border-violet-500/30' : 'border-white/8'
    )}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Trust badge */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <button
                onClick={() => setShowTrust(!showTrust)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer',
                  'transition-all hover:scale-105',
                  trustBg, trustColor
                )}
              >
                <span className="text-base leading-none">{source.trust_score}</span>
                <span className="text-xs opacity-80">{trustLabel}</span>
              </button>

              {/* Bias flag */}
              {source.bias && <BiasFlag bias={source.bias} />}
              {!source.bias && (
                <button
                  onClick={() => onDetectBias(source)}
                  disabled={isDetectingBias}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
                >
                  {isDetectingBias ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  Detect Bias
                </button>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white leading-snug mb-1 line-clamp-2">
              {source.title}
            </h3>

            {/* Meta */}
            <p className="text-xs text-white/40">
              {source.authors} · {source.year} · <span className="italic">{source.journal}</span>
            </p>
          </div>

          {/* Save button */}
          <button
            onClick={() => onSave(source)}
            className={cn(
              'flex-shrink-0 p-2 rounded-xl border transition-all duration-200',
              isSaved
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-300 hover:bg-violet-600/30'
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70 hover:border-white/20'
            )}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
          </button>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setShowAbstract(!showAbstract)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {showAbstract ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showAbstract ? 'Hide abstract' : 'Show abstract'}
          </button>

          <button
            onClick={() => setShowTrust(!showTrust)}
            className="flex items-center gap-1 text-xs text-violet-400/70 hover:text-violet-300 transition-colors"
          >
            {showTrust ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Trust breakdown
          </button>

          {source.doi && (
            <a
              href={`https://doi.org/${source.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors ml-auto"
            >
              <ExternalLink className="h-3 w-3" />
              DOI
            </a>
          )}
        </div>
      </div>

      {/* Abstract */}
      {showAbstract && (
        <div className="px-5 pb-4 space-y-3 border-t border-white/5 pt-4">
          {source.simplified_abstract ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Wand2 className="h-3 w-3 text-violet-400" />
                <span className="text-xs text-violet-400 font-medium">Plain Language</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{source.simplified_abstract}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-white/60 leading-relaxed">{source.abstract}</p>
              {source.abstract && (
                <button
                  onClick={() => onSimplify(source)}
                  disabled={isSimplifying}
                  className="flex items-center gap-1.5 text-xs text-violet-400/70 hover:text-violet-300 transition-colors"
                >
                  {isSimplifying ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  Simplify jargon
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Trust breakdown */}
      {showTrust && (
        <div className="border-t border-white/5">
          <TrustBreakdown
            score={source.trust_score}
            factors={source.trust_factors}
            reason={source.trust_reason}
          />
        </div>
      )}
    </div>
  );
}
