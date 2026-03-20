'use client';

import { ResearchGap } from '@/types';
import { Microscope, ArrowRight } from 'lucide-react';

interface GapDetectorProps {
  gaps: ResearchGap[];
  onResearch: (query: string) => void;
}

export default function GapDetector({ gaps, onResearch }: GapDetectorProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="h-8 w-8 rounded-lg bg-amber-600/30 flex items-center justify-center">
          <Microscope className="h-4 w-4 text-amber-300" />
        </div>
        <div>
          <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">Research Gap Detector</p>
          <p className="text-xs text-white/40 mt-0.5">Unanswered questions in the literature</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {gaps.map((gap, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/8 bg-white/2 p-4 space-y-2 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-400">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/85 leading-snug">{gap.gap}</p>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  Suggested angle: {gap.angle}
                </p>
              </div>
            </div>
            <button
              onClick={() => onResearch(gap.angle)}
              className="flex items-center gap-1.5 text-xs text-amber-400/70 hover:text-amber-300 transition-colors ml-8 group-hover:gap-2"
            >
              Research this
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
