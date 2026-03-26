import { ArrowRight, BookOpen, Brain, Microscope, Shield, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: Shield,
    label: 'Transparent Trust Scoring',
    desc: '4-factor credibility breakdown per source with AI reasoning.',
    color: 'text-[#FDB927]',
    bg: 'bg-[#FDB927]/10 border-[#FDB927]/20',
  },
  {
    icon: Brain,
    label: 'Cross-Source Synthesis',
    desc: 'AI identifies consensus, conflict, and key findings across all sources.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Microscope,
    label: 'Research Gap Detector',
    desc: 'Surfaces 3 unanswered questions in the literature — each with a research angle.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Sparkles,
    label: 'AI Query Clarifier',
    desc: 'Before searching, AI asks one smart question to sharpen your angle.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: Target,
    label: 'Thesis Builder',
    desc: 'From saved sources → 3 distinct, arguable thesis angles with supporting evidence.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
  },
  {
    icon: BookOpen,
    label: 'Bias Detection',
    desc: 'Flags funding, ideological, and publication bias per source.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] bg-mesh overflow-hidden">
      {/* ── Inline Nav (no external dependencies) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            <span className="text-[#FDB927]">REAVES</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-transparent text-white/70 text-sm font-medium transition-all duration-200 hover:text-white hover:border-[#FDB927]/60 hover:shadow-[0_0_20px_rgba(253,185,39,0.15)] hover:bg-[#FDB927]/10"
            >
              Log In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FDB927] hover:bg-[#FDB927]/90 text-[#0a0a0f] text-sm font-bold transition-all duration-200 shadow-lg shadow-[#FDB927]/25 hover:shadow-[#FDB927]/40 hover:scale-105"
            >
              Start Researching
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FDB927]/25 bg-[#FDB927]/10 text-sm text-[#FDB927] animate-fadeInUp">
            <Sparkles className="h-3.5 w-3.5" />
            Los Oliver Lakers · HackFest 2026: Axis
          </div>

          {/* Headline */}
          <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              <span className="text-[#FDB927]">REAVES:</span>{' '}
              <span className="text-white">Research.</span>{' '}
              <span className="bg-gradient-to-r from-[#FDB927] to-[#552583] bg-clip-text text-transparent">
                Validated.
              </span>
            </h1>
          </div>

          {/* Subtext */}
          <p
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}
          >
            REAVES validates every source decision — scoring credibility transparently,
            synthesizing across findings, detecting research gaps, and scaffolding your
            argument. All in one loop.
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/dashboard"
              id="cta-start-researching"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#FDB927] hover:bg-[#FDB927]/90 text-[#0a0a0f] text-base font-bold transition-all duration-200 shadow-2xl shadow-[#FDB927]/30 hover:shadow-[#FDB927]/50 hover:scale-105 animate-pulseGlow"
              style={{
                animationName: 'pulseGlowGold',
              }}
            >
              <Sparkles className="h-5 w-5" />
              Start Researching
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/notebook"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white text-base font-medium transition-all duration-200"
            >
              <BookOpen className="h-5 w-5" />
              My Notebook
            </Link>
          </div>

          {/* Core loop pills */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-fadeInUp"
            style={{ animationDelay: '0.4s' }}
          >
            {['Ask', 'Clarify', 'Search', 'Validate', 'Synthesize', 'Argue', 'Write'].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="text-xs font-medium text-white/40 px-2.5 py-1 rounded-full bg-white/5 border border-white/[0.08]">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-[#FDB927]/40" />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center font-display text-2xl font-bold text-white/80 mb-10">
            Don&apos;t just search.{' '}
            <span className="text-[#FDB927]">Understand.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className={`rounded-2xl border p-5 ${bg} transition-all hover:scale-[1.02] duration-200`}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white/90 mb-1">{label}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-xs text-white/25">
          REAVES · HackFest 2026: Axis · Built by the Los Oliver Lakers ·{' '}
          Powered by Google Gemini, Supabase, Next.js, Vercel
        </p>
      </footer>
    </main>
  );
}
