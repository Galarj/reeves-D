'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, LogIn, User } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { signOutAction } from '@/app/actions/auth';

export default function Header() {
  const { profile, loading } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAuthenticated = !!profile;

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  const displayName = profile?.full_name || 'Researcher';
  const displayUni = profile?.university ? ` | ${profile.university}` : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display font-bold text-lg tracking-tight gradient-text">
          REAVES
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded-xl" />
          ) : isAuthenticated ? (
            /* ── Profile Badge ── */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-violet-500/20">
                  {initials}
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">
                  {displayName}{displayUni}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#111118]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-fadeIn">
                  <Link
                    href="/notebook"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-3.5 w-3.5" />
                    My Notebooks
                  </Link>
                  <div className="h-px bg-white/5" />
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Log Out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* ── Log In Button ── */
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-transparent text-white/70 text-sm font-medium transition-all duration-200 hover:text-white hover:border-[#552583]/60 hover:shadow-[0_0_20px_rgba(85,37,131,0.3)] hover:bg-[#552583]/10"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Link>
          )}

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
          >
            Start Researching
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
