'use client';

import { useMemo } from 'react';
import { NotebookEntry, ComparisonRow } from '@/types';

interface ResearchReceiptProps {
  entries: NotebookEntry[];
  comparison?: ComparisonRow[];
  id: string; // The ID for html2canvas to target
}

// Seeded pseudo-random so barcode is stable across renders
function seededRands(count: number, seed: number): { h: number; w: string; o: number }[] {
  const out = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    // LCG — fast, deterministic
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const h = ((s >>> 0) % 80) + 20; // 20–100%
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const w = ((s >>> 0) % 100) > 70 ? '3px' : '1px';
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const o = ((s >>> 0) % 100) > 10 ? 1 : 0.35;
    out.push({ h, w, o });
  }
  return out;
}

export default function ResearchReceipt({ entries, comparison, id }: ResearchReceiptProps) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Stable random values — computed once, won't change on re-renders
  const barcodeBars = useMemo(() => seededRands(60, 0xdeadbeef), []);
  const transId = useMemo(() => {
    const s = (0xdeadbeef * 1664525 + 1013904223) & 0xffffffff;
    return String((s >>> 0) % 900000 + 100000);
  }, []);

  return (
    // Visually hidden — off-screen so it doesn't affect layout, but still in the DOM
    <div className="absolute -left-[9999px] top-0 pointer-events-none select-none" aria-hidden="true">
      <div
        id={id}
        style={{
          width: '450px',
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '40px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          boxShadow: 'none',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '24px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, textTransform: 'uppercase', margin: 0 }}>
            REAVES
          </h1>
          <p style={{ fontSize: '9px', marginTop: '8px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Research Analysis Protocol
          </p>
          <p style={{ fontSize: '8px', marginTop: '4px', fontStyle: 'italic', color: '#555' }}>
            Generated for: HackFest 2026 // Axis
          </p>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', borderTop: '1px solid #000', paddingTop: '8px' }}>
            <span>TRANS ID: #RF-{transId}</span>
            <span>{date}</span>
          </div>
        </div>

        {/* ── LIBRARY MANIFEST ── */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
            Library Manifest
          </p>
          {entries.map((entry, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.4, flex: 1 }}>
                  {i + 1}. {entry.source.title}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 900, border: '1px solid #000', padding: '0 3px', flexShrink: 0 }}>
                  {entry.source.trust_score}
                </span>
              </div>
              <p style={{ fontSize: '7px', marginTop: '3px', color: '#555', textTransform: 'uppercase' }}>
                BY: {entry.source.authors.split(',')[0]}
                {entry.source.authors.includes(',') ? ' ET AL.' : ''} // {entry.source.year} // {entry.source.journal}
              </p>
              {entry.user_note && (
                <div style={{ marginTop: '6px', paddingLeft: '10px', borderLeft: '2px solid #ccc' }}>
                  <p style={{ fontSize: '7px', lineHeight: 1.5, fontStyle: 'italic', color: '#555' }}>
                    "{entry.user_note}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── AI SYNTHESIS MATRIX ── */}
        {comparison && comparison.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', borderBottom: '2px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>
              AI Synthesis Matrix
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7px', border: '1px solid #000' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '6px', fontWeight: 900, textTransform: 'uppercase', borderRight: '1px solid #000', width: '22%' }}>Metric</th>
                  <th style={{ textAlign: 'left', padding: '6px', fontWeight: 900, textTransform: 'uppercase', borderRight: '1px solid #000' }}>Paper 1</th>
                  <th style={{ textAlign: 'left', padding: '6px', fontWeight: 900, textTransform: 'uppercase' }}>Paper 2</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < comparison.length - 1 ? '1px solid #000' : 'none' }}>
                    <td style={{ padding: '6px', fontWeight: 700, textTransform: 'uppercase', borderRight: '1px solid #000', verticalAlign: 'top', backgroundColor: '#f8f8f8', lineHeight: 1.4 }}>
                      {row.metric}
                    </td>
                    <td style={{ padding: '6px', borderRight: '1px solid #000', verticalAlign: 'top', lineHeight: 1.5, color: '#222' }}>
                      {row.paper1.length > 140 ? row.paper1.slice(0, 135) + '…' : row.paper1}
                    </td>
                    <td style={{ padding: '6px', verticalAlign: 'top', lineHeight: 1.5, color: '#222' }}>
                      {row.paper2.length > 140 ? row.paper2.slice(0, 135) + '…' : row.paper2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── STATS FOOTER ── */}
        <div style={{ borderTop: '1px solid #000', paddingTop: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Sources Analyzed', value: `0${entries.length}` },
            { label: 'Synthesis Status', value: 'Verified ✓' },
            { label: 'Research Confidence', value: 'HIGH', bold: true },
          ].map(({ label, value, bold }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? '10px' : '8px', fontWeight: bold ? 900 : 700, textTransform: 'uppercase', marginBottom: '4px', borderTop: bold ? '1px solid #000' : 'none', paddingTop: bold ? '6px' : 0, marginTop: bold ? '6px' : 0 }}>
              <span>{label}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        {/* ── BARCODE + FOOTER ── */}
        <div style={{ textAlign: 'center', borderTop: '2px dashed #000', paddingTop: '24px' }}>
          <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '16px' }}>
            Keep researching.
          </p>

          {/* Stable deterministic barcode */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '40px', gap: '1px', padding: '0 16px' }}>
            {barcodeBars.map(({ h, w, o }, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: '#000',
                  height: `${h}%`,
                  width: w,
                  opacity: o,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: '6px', marginTop: '12px', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em' }}>
            Verified by REAVES Engine // Version 2.0.0
          </p>
        </div>
      </div>
    </div>
  );
}