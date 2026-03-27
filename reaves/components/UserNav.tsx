'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogIn, User } from 'lucide-react';
import { useUser } from '@/lib/useUser';
import { signOutAction } from '@/app/actions/auth';

export default function UserNav() {
  const { profile, loading } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAuthenticated = !!profile;

  if (loading) {
    return <div className="h-9 w-24 bg-white/5 animate-pulse rounded-xl" />;
  }

  if (!isAuthenticated) return null;

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : '??';

  const displayName = profile?.full_name?.split(' ')[0] || 'Researcher';

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200 group"
      >
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-violet-500/20">
          {initials}
        </div>
        <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">
          {displayName}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-[#111118]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-fadeIn">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setDropdownOpen(false)}
          >
            <User className="h-3.5 w-3.5" />
            Dashboard
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
  );
}
