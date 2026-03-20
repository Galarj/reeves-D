import { useState, useEffect, type JSX } from 'react';
import { getPendingSelection } from './api';
import AskView from './views/AskView';
import NotebookView from './views/NotebookView';
import type { View } from './types';

// Icons (inline SVG to keep bundle size tiny)
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

export default function App() {
  const [view, setView] = useState<View>('ask');
  const [pendingText, setPendingText] = useState<string | null>(null);

  // On mount, check if content script sent a selected text
  useEffect(() => {
    getPendingSelection().then((text) => {
      if (text) {
        setPendingText(text);
        setView('ask');
      }
    });

    // Also listen for future messages while the sidebar is open
    const handler = (message: { type: string; text?: string }) => {
      if (message.type === 'OPEN_SIDEBAR' && message.text) {
        setPendingText(message.text);
        setView('ask');
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  const navItems: Array<{ id: View; label: string; Icon: () => JSX.Element }> = [
    { id: 'ask',      label: 'Ask',      Icon: SparkleIcon },
    { id: 'notebook', label: 'Notebook', Icon: BookIcon   },
  ];

  return (
    <div className="sidebar">
      {/* Header */}
      <header className="sidebar-header">
        <span className="sidebar-logo">✦ REAVES</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>
          Research Engine
        </span>
      </header>

      {/* View Content */}
      <main className="sidebar-body">
        {view === 'ask' && (
          <AskView
            initialText={pendingText}
            onTextConsumed={() => setPendingText(null)}
          />
        )}
        {view === 'notebook' && <NotebookView />}
      </main>

      {/* Bottom Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-btn ${view === id ? 'active' : ''}`}
            onClick={() => setView(id)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
