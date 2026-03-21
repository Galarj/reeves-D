'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NotebookEntry, CompareResponse } from '@/types';
import { X, RefreshCw, Maximize2, Minimize2, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ResearchReceipt from './ResearchReceipt';

const RECEIPT_ID = 'reaves-research-receipt';

interface CompareDialogProps {
  entries: NotebookEntry[];
  onClose: () => void;
}

export default function CompareDialog({ entries, onClose }: CompareDialogProps) {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  // Portal mount guard — only render after hydration so document.body is available
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: entries.map((e) => e.source) }),
      });

      if (!res.ok) throw new Error('Failed to fetch from server');

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Comparison Error:', err);
      setError('Could not generate comparison. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [entries]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  // Escape to close (or un-maximize first if maximized)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMaximized) setIsMaximized(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, isMaximized]);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById(RECEIPT_ID);
      if (!element) throw new Error('Receipt element not found in DOM');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`REAVES_Receipt_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const modalContent = (
    // Full-screen overlay — fixed + z-[9999] breaks out of ANY stacking context
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
      {/* Click-outside backdrop — only close if NOT maximized */}
      {!isMaximized && (
        <div className="absolute inset-0" onClick={onClose} />
      )}

      {/* ── Panel ── */}
      <div
        className={cn(
          'relative bg-[#0f0f12] border border-white/10 flex flex-col shadow-2xl shadow-purple-950/50 overflow-hidden transition-all duration-300 ease-in-out',
          isMaximized
            ? 'fixed inset-2 w-auto h-auto max-w-none max-h-none rounded-xl z-[10000]'
            : 'w-full max-w-7xl max-h-[88vh] rounded-2xl'
        )}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Maximize / Restore button */}
            <button
              onClick={() => setIsMaximized((v) => !v)}
              className="h-10 w-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30 hover:bg-violet-600/35 transition-colors"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized
                ? <Minimize2 className="h-4.5 w-4.5 text-violet-400" />
                : <Maximize2 className="h-4.5 w-4.5 text-violet-400" />
              }
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">Comparative Analysis</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-0.5">
                Literature Synthesis Engine · {entries.length} papers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Receipt — enabled only when data is ready */}
            <button
              onClick={handleDownloadPDF}
              disabled={!data || isExporting || loading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 border whitespace-nowrap',
                data && !isExporting && !loading
                  ? 'bg-white text-black border-white hover:bg-white/90 shadow-lg shadow-white/10'
                  : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
              )}
            >
              {isExporting
                ? <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
                : <Download className="h-3.5 w-3.5 flex-shrink-0" />
              }
              {isExporting ? 'Exporting…' : 'Download Receipt'}
            </button>

            {/* Regenerate */}
            <button
              onClick={fetchComparison}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/8 text-xs font-medium text-white/60 transition-all border border-white/6 whitespace-nowrap"
            >
              <RefreshCw className={cn('h-3.5 w-3.5 flex-shrink-0', loading && 'animate-spin')} />
              {loading ? 'Processing…' : 'Regenerate'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-auto p-6">

          {/* Loading */}
          {loading && (
            <div className="h-full min-h-[32rem] flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-2 border-r-2 border-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-violet-500/20 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-white/50 font-medium">
                  Gemini is synthesizing {entries.length} academic papers…
                </p>
                <p className="text-xs text-white/25 mt-1">
                  Analyzing methodology, findings, and limitations
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="h-full min-h-[24rem] flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <X className="h-6 w-6 text-rose-400" />
              </div>
              <p className="text-sm font-medium text-rose-300">{error}</p>
              <button
                onClick={fetchComparison}
                className="text-xs text-white/40 underline underline-offset-4 hover:text-white/70 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Comparison Table */}
          {!loading && !error && data?.rows && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-white/[0.025] border border-white/8 rounded-tl-xl text-[10px] font-bold text-white/30 uppercase tracking-widest w-[175px] align-bottom">
                      Metric
                    </th>
                    {entries.map((entry, idx) => (
                      <th
                        key={entry.id}
                        className={cn(
                          'p-4 text-left border-y border-r border-white/8 align-top',
                          idx === entries.length - 1 && 'rounded-tr-xl'
                        )}
                      >
                        <div className={cn(
                          'text-[10px] font-extrabold uppercase tracking-widest mb-1.5',
                          idx === 0 ? 'text-violet-400' : idx === 1 ? 'text-cyan-400' : 'text-amber-400'
                        )}>
                          Paper {idx + 1}
                        </div>
                        <div className="text-sm font-semibold text-white/90 line-clamp-2 leading-snug">
                          {entry.source.title}
                        </div>
                        <div className="text-[11px] text-white/35 mt-1">
                          {entry.source.authors.split(',')[0]}
                          {entry.source.authors.includes(',') ? ' et al.' : ''} · {entry.source.year}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-black/10' : 'bg-white/[0.012]'}>
                      <td className="p-5 border-l border-b border-r border-white/8 font-semibold text-xs text-white/60 align-top bg-white/[0.015]">
                        <span className="leading-snug">{row.metric}</span>
                      </td>
                      <td className="p-5 border-b border-r border-white/8 text-sm text-white/65 leading-relaxed align-top">
                        <div className="relative pl-3">
                          <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-violet-500/50" />
                          {row.paper1 ?? '—'}
                        </div>
                      </td>
                      <td className="p-5 border-b border-r border-white/8 text-sm text-white/65 leading-relaxed align-top">
                        <div className="relative pl-3">
                          <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-cyan-500/50" />
                          {row.paper2 ?? '—'}
                        </div>
                      </td>
                      {entries.length === 3 && (
                        <td className="p-5 border-b border-r border-white/8 text-sm text-white/65 leading-relaxed align-top">
                          <div className="relative pl-3">
                            <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-amber-500/50" />
                            {row.paper3 ?? '—'}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-center text-[11px] text-white/20 mt-5">
                AI-generated · based on abstracts only · verify claims against full text before citing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden receipt — always in DOM so html2canvas can find it */}
      <ResearchReceipt
        id={RECEIPT_ID}
        entries={entries}
        comparison={data?.rows}
      />
    </div>
  );

  // Only render after mount (client-side) to avoid SSR/hydration mismatch
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}