'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="hero-glow hero-glow-2" style={{ opacity: 0.4 }} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="glass-card p-8 md:p-10 space-y-7">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand mx-auto flex items-center justify-center text-white font-black text-xl shadow-xl" aria-hidden="true">W</div>
            <div>
              <h1 className="text-2xl font-extrabold">Create your account</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">Join WallVerse AI — 10 free AI credits to start</p>
            </div>
          </div>

          {/* Success state */}
          {state?.message ? (
            <div className="text-center space-y-5 py-4">
              <div className="text-5xl">✉</div>
              <div>
                <h2 className="font-bold text-lg">Check your email</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">{state.message}</p>
              </div>
              <Link href="/login" className="btn-primary text-sm px-8 py-3 inline-block">Back to Login</Link>
            </div>
          ) : (
            <form action={action} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Username</label>
                <input id="username" name="username" type="text" placeholder="wallmaster42" required autoComplete="username" className="input-luxury" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Email</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className="input-luxury" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Password</label>
                <input id="password" name="password" type="password" placeholder="At least 8 characters" required autoComplete="new-password" className="input-luxury" />
              </div>

              {state?.error && (
                <div role="alert" className="flex items-center gap-2.5 text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                  <span aria-hidden="true">⚠</span> {state.error}
                </div>
              )}

              <button type="submit" disabled={pending} className="w-full btn-primary py-3.5 text-base disabled:opacity-60">
                {pending
                  ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">◌</span> Creating account…</span>
                  : 'Create Account — Free'}
              </button>

              <p className="text-xs text-center text-[var(--text-muted)]">
                You get <strong>10 free AI credits</strong> every month with a free account.
              </p>
            </form>
          )}

          {!state?.message && (
            <>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <hr className="flex-1 border-[var(--border)]" />
                <span>or</span>
                <hr className="flex-1 border-[var(--border)]" />
              </div>
              <p className="text-center text-sm text-[var(--text-muted)]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[var(--foreground)] hover:underline">Sign in →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
