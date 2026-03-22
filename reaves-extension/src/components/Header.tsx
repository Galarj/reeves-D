import type { JSX } from 'react';

/* ─── Sparkle icon (inline SVG) ─────────────────────────────────────────── */
const SparkleIcon = (): JSX.Element => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z" />
  </svg>
);

/* ─── Toggle Switch ─────────────────────────────────────────────────────── */
interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
  activeColor?: string; // default: violet
}

function Toggle({ label, enabled, onChange, activeColor }: ToggleProps) {
  const color = activeColor ?? '#7c3aed';
  return (
    <label className="header-toggle-label" title={label}>
      <span className="header-toggle-text">{label}</span>
      <button
        className="header-toggle-track"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        style={{ background: enabled ? color : 'rgba(255,255,255,0.1)' }}
      >
        <span
          className="header-toggle-thumb"
          style={{ transform: enabled ? 'translateX(12px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  );
}

/* ─── Header Component ──────────────────────────────────────────────────── */
export interface HeaderProps {
  glossaryEnabled: boolean;
  onGlossaryToggle: (next: boolean) => void;
  graderEnabled: boolean;
  onGraderToggle: (next: boolean) => void;
}

export default function Header({
  glossaryEnabled,
  onGlossaryToggle,
  graderEnabled,
  onGraderToggle,
}: HeaderProps) {
  return (
    <header className="sidebar-header">
      {/* Logo */}
      <div className="header-logo-group">
        <SparkleIcon />
        <span className="header-logo-text">REAVES</span>
      </div>

      {/* Toggle row */}
      <div className="header-toggles">
        <Toggle
          label="GLOSSARY"
          enabled={glossaryEnabled}
          onChange={onGlossaryToggle}
          activeColor="#7c3aed"
        />
        <Toggle
          label="GRADER"
          enabled={graderEnabled}
          onChange={onGraderToggle}
          activeColor="#FDB927"
        />
      </div>
    </header>
  );
}
