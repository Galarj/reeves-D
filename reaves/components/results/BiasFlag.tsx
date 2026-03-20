'use client';

import { BiasFlag as BiasFlagType } from '@/types';
import { cn, getBiasSeverityColor } from '@/lib/utils';
import {
  AlertTriangle, ShieldCheck, DollarSign, Megaphone, Newspaper, MapPin, HelpCircle, ChevronDown, CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

interface BiasFlagProps {
  bias: BiasFlagType;
}

const BIAS_ICONS: Record<string, React.ElementType> = {
  funding: DollarSign,
  ideological: Megaphone,
  publication: Newspaper,
  geographic: MapPin,
  none: ShieldCheck,
};

const BIAS_LABELS: Record<string, string> = {
  funding: 'Funding Bias',
  ideological: 'Ideological Bias',
  publication: 'Publication Bias',
  geographic: 'Geographic Bias',
  none: 'No Bias Detected',
};

export default function BiasFlag({ bias }: BiasFlagProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = BIAS_ICONS[bias.bias_type] || HelpCircle;
  const label = BIAS_LABELS[bias.bias_type] || 'Unknown';
  const colorClass = getBiasSeverityColor(bias.severity);

  if (!bias.bias_detected) {
    return (
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
          <ShieldCheck className="h-3 w-3" />
          No Bias Detected
        </div>
        {bias.criteria && bias.criteria.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50 transition-colors ml-1"
          >
            Why?
            <ChevronDown className={cn('h-2.5 w-2.5 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
        {expanded && bias.criteria && (
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 mt-1 space-y-1.5">
            <p className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider">Criteria checked</p>
            {bias.criteria.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-white/50 leading-snug">
                <CheckCircle2 className="h-3 w-3 text-emerald-500/60 mt-0.5 flex-shrink-0" />
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
          colorClass
        )}
      >
        <AlertTriangle className="h-3 w-3" />
        {label}
        <span className="text-[10px] opacity-60 capitalize">({bias.severity})</span>
        <ChevronDown className={cn('h-3 w-3 opacity-50 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div className={cn(
          'rounded-xl border px-3 py-3 mt-1.5 space-y-2.5',
          bias.severity === 'high' ? 'border-rose-500/20 bg-rose-500/5' :
          bias.severity === 'medium' ? 'border-amber-500/20 bg-amber-500/5' :
          'border-yellow-500/20 bg-yellow-500/5'
        )}>
          {/* Bias note */}
          {bias.bias_note && (
            <div className="flex items-start gap-2">
              <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-60" />
              <p className="text-xs text-white/60 leading-relaxed">{bias.bias_note}</p>
            </div>
          )}

          {/* Criteria key-points */}
          {bias.criteria && bias.criteria.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">Key factors</p>
              {bias.criteria.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-white/50 leading-snug">
                  <AlertTriangle className={cn(
                    'h-3 w-3 mt-0.5 flex-shrink-0',
                    bias.severity === 'high' ? 'text-rose-400/60' :
                    bias.severity === 'medium' ? 'text-amber-400/60' :
                    'text-yellow-400/60'
                  )} />
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
