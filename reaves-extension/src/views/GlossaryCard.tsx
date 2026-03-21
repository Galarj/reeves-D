import { useState, useCallback } from 'react';

interface GlossaryCardProps {
  word: string;
  detailed_explanation: string;
  onDismiss: () => void;
}

/**
 * GlossaryCard — displays the detailed definition pushed from the content script
 * via a SHOW_DETAILED_DEF message when the Smart Glossary Hover fires.
 */
export function GlossaryCard({ word, detailed_explanation, onDismiss }: GlossaryCardProps) {
  return (
    <div className="glossary-card fade-up">
      <div className="glossary-card-header">
        <span className="glossary-card-label">Smart Glossary</span>
        <button className="glossary-card-close" onClick={onDismiss} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <p className="glossary-card-word">{word}</p>
      <p className="glossary-card-def">{detailed_explanation}</p>
    </div>
  );
}

/**
 * useGlossaryToggle — reads/writes the glossaryEnabled flag in chrome.storage.local.
 *
 * Usage in your component:
 *   const { enabled, toggle, loaded } = useGlossaryToggle();
 */
export function useGlossaryToggle() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loaded,  setLoaded]  = useState<boolean>(false);

  // Call this once on mount to hydrate from storage
  const init = useCallback(() => {
    chrome.storage.local.get(['glossaryEnabled'], (result) => {
      // Default to true if not yet set
      const val = result.glossaryEnabled === false ? false : true;
      setEnabled(val);
      setLoaded(true);
    });
  }, []);

  const toggle = useCallback((next: boolean) => {
    setEnabled(next);
    chrome.storage.local.set({ glossaryEnabled: next });
  }, []);

  return { enabled, toggle, loaded, init };
}
