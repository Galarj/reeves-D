'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/useUser';
import UserNav from '@/components/UserNav';
import {
  ArrowRight,
  BookOpen,
  Brain,
  LogIn,
  Microscope,
  Shield,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

/* ─── Feature Cards ─── */
const FEATURES = [
  {
    icon: Shield,
    label: 'Transparent Trust Scoring',
    desc: '5-factor credibility breakdown per source — with AI reasoning you can actually read.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: Brain,
    label: 'Cross-Source Synthesis',
    desc: 'Identifies consensus, conflict, and key findings across every source in your results.',
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'shadow-cyan-400/20',
  },
  {
    icon: Microscope,
    label: 'Research Gap Detector',
    desc: 'Surfaces unanswered questions in the literature — each with a concrete research angle.',
    gradient: 'from-teal-400 to-emerald-500',
    glow: 'shadow-teal-400/20',
  },
  {
    icon: Sparkles,
    label: 'AI Query Clarifier',
    desc: 'Before searching, AI asks one smart question to sharpen your angle and save time.',
    gradient: 'from-purple-400 to-pink-500',
    glow: 'shadow-purple-400/20',
  },
  {
    icon: Target,
    label: 'Thesis Builder',
    desc: 'From saved sources → 3 distinct, arguable thesis angles with supporting evidence mapped.',
    gradient: 'from-blue-400 to-indigo-500',
    glow: 'shadow-blue-400/20',
  },
  {
    icon: Zap,
    label: 'Bias Detection',
    desc: 'Flags funding, ideological, and publication bias per source — so you know what to question.',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-amber-400/20',
  },
];

const PIPELINE_STEPS = ['Ask', 'Clarify', 'Search', 'Score', 'Synthesize', 'Argue', 'Write'];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { profile, loading } = useUser();
  const session = !!profile;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#06060e] overflow-hidden relative">
      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-violet-600/[0.07] blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.06] blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── Inline Nav (no external component import) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#06060e]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-violet-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            REAVES
          </Link>

          <div className="flex items-center gap-3">
            {!session && !loading ? (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm font-medium transition-all duration-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/5 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
              >
                <LogIn className="h-3.5 w-3.5" />
                Log In
              </Link>
            ) : null}
            
            {session && <UserNav />}

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/50 hover:scale-[1.03]"
            >
              {session ? 'Go to Dashboard' : 'Start Researching'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/[0.08] text-sm text-violet-300/90 mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Brought to you by Los Oliver Lakers · HackFest 2026: Axis
          </div>

          {/* Headline */}
          <h1
            className={`font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            <span className="text-white">Research that </span>
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              explains
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              itself.
            </span>
          </h1>

          {/* Subtext */}
          <p
            className={`text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-10 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            REAVES validates every source decision — scoring credibility transparently,
            synthesizing across findings, detecting research gaps, and scaffolding your
            argument. All in one loop.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            {/* Primary — Purple Glow */}
            <Link
              href="/dashboard"
              id="cta-start-researching"
              className="group relative flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-base font-bold transition-all duration-300 shadow-2xl shadow-violet-600/30 hover:shadow-violet-500/50 hover:scale-[1.04]"
              style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
            >
              <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
              Start Researching
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Secondary — Glassmorphism */}
            <Link
              href="/notebook"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-white/60 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/[0.06] text-base font-medium transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
            >
              <BookOpen className="h-5 w-5" />
              My Notebook
            </Link>
          </div>

          {/* Pipeline Steps */}
          <div
            className={`flex flex-wrap items-center justify-center gap-2 transition-all duration-700 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
          >
            {PIPELINE_STEPS.map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/35 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:border-violet-500/20 hover:text-violet-300/60 transition-all duration-200">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-violet-500/30" />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider Text ── */}
      <section className="relative z-10 pb-6 px-6">
        <h2 className="text-center font-display text-2xl md:text-3xl font-bold text-white/80">
          Don&apos;t just search.{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Understand.
          </span>
        </h2>
      </section>

      {/* ── Feature Grid ── */}
      <section className="relative z-10 pb-28 px-6 pt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc, gradient, glow }, idx) => (
            <div
              key={label}
              className={`group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] hover:scale-[1.02] hover:shadow-lg ${glow} ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              style={{ transitionDelay: `${500 + idx * 100}ms` }}
            >
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg ${glow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white/90 mb-1.5">{label}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-xs font-semibold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent tracking-wide">
              REAVES
            </span>
          </div>
          <p className="text-[11px] text-white/20 text-center">
            HackFest 2026: Axis · Built by the Los Oliver Lakers · Powered by Google Gemini, Supabase, Next.js &amp; Vercel
          </p>
        </div>
      </footer>
    </main>
  );
}
