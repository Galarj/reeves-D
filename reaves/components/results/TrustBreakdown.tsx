'use client';

import { TrustFactors } from '@/types';
import { CheckCircle, XCircle, BookOpen, Quote, Clock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBreakdownProps {
  score: number;
  factors: TrustFactors;
  reason: string;
}

function FactorRow({ icon: Icon, label, value, positive, liveIndicator }: {
  icon: React.ElementType;
  label: string;
  value: string;
  positive: boolean;
  liveIndicator?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-white/40" />
        <span className="text-xs text-white/60">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-white/80">{value}</span>
        {liveIndicator && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded border border-violet-400/20 ml-1">Verified from Source</span>
        )}
        {positive ? (
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-rose-400" />
        )}
      </div>
    </div>
  );
}

export default function TrustBreakdown({ score, factors, reason }: TrustBreakdownProps) {
  const barColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-4 p-4">
      {/* Score bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50 font-medium uppercase tracking-wider">Trust Score</span>
          <span className={cn(
            'text-2xl font-bold',
            score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'
          )}>{score}</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', barColor)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Factors grid */}
      <div className="rounded-xl bg-white/3 border border-white/5 px-3">
        <FactorRow
          icon={BookOpen}
          label="Peer Reviewed"
          value={factors.peer_reviewed ? 'Yes' : 'No'}
          positive={factors.peer_reviewed}
        />
        <FactorRow
          icon={Quote}
          label="Citation Count"
          value={factors.citation_count.toLocaleString()}
          positive={factors.citation_count >= 50}
          liveIndicator={factors.citation_scraped}
        />
        <FactorRow
          icon={Quote}
          label="Author H-index"
          value={factors.author_hindex > 0 ? String(factors.author_hindex) : 'Unknown'}
          positive={factors.author_hindex >= 10}
        />
        <FactorRow
          icon={Clock}
          label="Recency"
          value={`${factors.recency_years}y ago`}
          positive={factors.recency_years <= 5}
        />
        <FactorRow
          icon={Unlock}
          label="Open Access"
          value={factors.open_access ? 'Yes' : 'No'}
          positive={factors.open_access}
        />
      </div>

      {/* AI reasoning */}
      <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3">
        <p className="text-xs text-violet-400 font-medium mb-1">AI Reasoning</p>
        <p className="text-sm text-white/70 leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
