/**
 * Login — secure login screen for REAVES extension
 * ─────────────────────────────────────────────────────────
 * Full-screen glassmorphism card with a Lakers Gold "Access System" button.
 * Authenticates with Supabase directly.
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase-client';

interface Props {
  onLogin: () => void;
}

export default function MockLogin({ onLogin }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [errorText, setErrorText] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorText('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorText(error.message);
      setLoading(false);
    } else {
      onLogin(); // App logic updates state
    }
  }

  return (
    <div className="login-overlay">
      <div className="login-particle p1" />
      <div className="login-particle p2" />
      <div className="login-particle p3" />

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo-wrap">
          <span className="login-logo-icon">✦</span>
          <span className="login-logo-text">REAVES</span>
        </div>

        <p className="login-subtitle">
          Research Evidence Analysis &amp; Verification Engine System
        </p>

        <label className="login-label">
          Email
          <input
            className="login-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
          />
        </label>

        <label className="login-label">
          Password
          <input
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
        </label>

        {errorText && (
          <div style={{ color: '#fb7185', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>
            {errorText}
          </div>
        )}

        <button
          className="login-btn"
          type="submit"
          disabled={loading || !email || !password}
        >
          {loading ? (
            <>
              <div className="spinner spinner-dark" />
              Establishing Secure Link…
            </>
          ) : (
            '⚡ Log In'
          )}
        </button>

        <p className="login-footer">
          Protected Research Environment · v0.1
        </p>
      </form>
    </div>
  );
}
