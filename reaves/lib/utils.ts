import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTrustColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
}

export function getTrustBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
  if (score >= 60) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-rose-500/20 border-rose-500/30';
}

export function getTrustLabel(score: number): string {
  if (score >= 80) return 'High Trust';
  if (score >= 60) return 'Moderate';
  return 'Low Trust';
}

export function getBiasSeverityColor(severity: string): string {
  switch (severity) {
    case 'high': return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
    case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'low': return 'text-sky-400 bg-sky-500/20 border-sky-500/30';
    default: return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
  }
}
