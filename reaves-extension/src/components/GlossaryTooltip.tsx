import { useState, useRef, useCallback, type ReactNode } from 'react';

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface GlossaryTermData {
  word: string;
  definition: string;
  source?: string; // e.g. "Supabase glossary_terms"
}

/* ─── GlossaryTerm — wraps hoverable text ───────────────────────────────── */
interface GlossaryTermProps {
  term: GlossaryTermData;
  children: ReactNode;
  enabled?: boolean; // respect the global glossary toggle
}

export function GlossaryTerm({ term, children, enabled = true }: GlossaryTermProps) {
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (!enabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(true);
  }, [enabled]);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setHovered(false), 180);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <span
      ref={wrapRef}
      className="glossary-tooltip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <span className="glossary-tooltip-term">{children}</span>

      {hovered && (
        <div
          className="glossary-tooltip"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <p className="glossary-tooltip-word">{term.word}</p>
          <p className="glossary-tooltip-def">{term.definition}</p>
          {term.source && (
            <p className="glossary-tooltip-source">Source: {term.source}</p>
          )}
        </div>
      )}
    </span>
  );
}

/* ─── GlossaryPopup — standalone floating tooltip (for sidebar card use) ─ */
interface GlossaryPopupProps {
  word: string;
  definition: string;
  source?: string;
  onDismiss: () => void;
}

export function GlossaryPopup({ word, definition, source, onDismiss }: GlossaryPopupProps) {
  return (
    <div className="glossary-popup-card fade-up">
      <div className="glossary-popup-header">
        <span className="glossary-popup-badge">✦ Smart Glossary</span>
        <button className="glossary-card-close" onClick={onDismiss} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="glossary-popup-word">{word}</p>
      <p className="glossary-popup-def">{definition}</p>
      {source && <p className="glossary-popup-source">Source: {source}</p>}
    </div>
  );
}
