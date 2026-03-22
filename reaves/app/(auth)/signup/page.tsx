'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { signUpAction } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full relative group overflow-hidden rounded-xl bg-[#FDB927] px-4 py-3.5 text-sm font-bold text-[#0a0a0f] transition-all hover:bg-[#FFE373] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      <span className="relative flex items-center justify-center gap-2">
        {pending ? (
          <div className="h-5 w-5 rounded-full border-2 border-[#0a0a0f]/20 border-t-[#0a0a0f] animate-spin" />
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Sign Up
          </>
        )}
      </span>
    </button>
  );
}

export default function SignUpPage() {
  const [errorText, setErrorText] = useState('');

  async function clientAction(formData: FormData) {
    setErrorText('');
    try {
      const result = await signUpAction(formData);
      if (result && result.error) {
        setErrorText(result.error);
      }
    } catch (e: any) {
      setErrorText(e.message || 'An error occurred during sign up.');
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-[#0a0a0f] overflow-hidden py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mesh opacity-40 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-radial from-[#552583]/10 via-[#0a0a0f]/80 to-[#0a0a0f] pointer-events-none" />

      {/* Floating Orbs */}
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#552583]/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#FDB927]/5 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />

      {/* Main Form Card */}
      <div className="w-full max-w-md relative z-10 px-6">
        <div className="text-center mb-8 animate-slideDown">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <h1 className="font-display font-black text-4xl tracking-tight gradient-text drop-shadow-[0_0_15px_rgba(85,37,131,0.5)]">
              REAVES
            </h1>
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 relative overflow-hidden animate-slideUp">
          {/* Edge Glow */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#552583]/50 to-transparent" />

          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#FDB927]" />
              Create Account
            </h2>
            <p className="text-white/40 text-sm">Enter your details to register.</p>
          </div>

          <form action={clientAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#552583]/50 focus:border-[#552583] transition-all"
                  placeholder="Austin Reaves"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">University (Optional)</label>
                <input
                  type="text"
                  name="university"
                  className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#552583]/50 focus:border-[#552583] transition-all"
                  placeholder="University of Oklahoma"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#552583]/50 focus:border-[#552583] transition-all"
                  placeholder="you@email.com"
                />
              </div>
              
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full bg-[#0a0a0f]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#552583]/50 focus:border-[#552583] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorText && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2 mt-4">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <p>{errorText}</p>
              </div>
            )}

            <div className="pt-4">
              <SubmitButton />
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors inline-flex items-center gap-1">
                Log In <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
