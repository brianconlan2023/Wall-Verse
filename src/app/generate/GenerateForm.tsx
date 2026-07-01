'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  styleOptions: string[]
  resolutionOptions: string[]
  isLoggedIn: boolean
  credits: number
}

type Status = 'idle' | 'generating' | 'done' | 'error'

const PROMPT_EXAMPLES = [
  'A neon-lit cyberpunk alley in rain-soaked Tokyo at midnight',
  'Bioluminescent deep ocean creatures around a sunken spaceship',
  'Mystical forest with golden light rays and floating fireflies',
  'Abstract geometric galaxy with violet and cyan nebulae',
  'Minimalist Japanese zen garden at sunrise, soft mist',
]

export default function GenerateForm({ styleOptions, resolutionOptions, isLoggedIn, credits }: Props) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState(styleOptions[0])
  const [resolution, setResolution] = useState(resolutionOptions[0])
  const [status, setStatus] = useState<Status>('idle')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPending, startTransition] = useTransition()

  const handleGenerate = () => {
    if (!prompt.trim()) { setError('Please enter a prompt.'); return }
    if (!isLoggedIn) { setError('You must be signed in to generate.'); return }
    if (credits <= 0) { setError('No AI credits left. Upgrade to Premium.'); return }

    setError(null)
    setStatus('generating')
    setProgress(0)

    // Fake progress bar for UX
    const t = setInterval(() => setProgress(v => Math.min(v + Math.random() * 15, 88)), 400)

    startTransition(async () => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, style, resolution }),
        })
        clearInterval(t)
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Generation failed.')
        }
        const d = await res.json()
        setProgress(100)
        setResultUrl(d.url)
        setStatus('done')
      } catch (err) {
        clearInterval(t)
        setError(err instanceof Error ? err.message : 'Something went wrong.')
        setStatus('error')
        setProgress(0)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 md:p-8 space-y-6">

        {/* Prompt area */}
        <div className="space-y-3">
          <label htmlFor="prompt" className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Describe Your Vision
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value.slice(0, 500))}
            placeholder="A breathtaking aurora borealis over a snowy mountain range, ultra-detailed, cinematic…"
            rows={4}
            maxLength={500}
            className="input-luxury text-base resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_EXAMPLES.slice(0, 3).map(ex => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="pill text-xs"
                  type="button"
                >
                  {ex.slice(0, 28)}…
                </button>
              ))}
            </div>
            <span className={`text-xs font-mono ml-4 flex-shrink-0 ${prompt.length > 450 ? 'text-orange-400' : 'text-[var(--text-muted)]'}`}>
              {prompt.length}/500
            </span>
          </div>
        </div>

        {/* Style + Resolution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="style" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Art Style
            </label>
            <select id="style" value={style} onChange={e => setStyle(e.target.value)} className="input-luxury text-sm">
              {styleOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="resolution" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Resolution
            </label>
            <select id="resolution" value={resolution} onChange={e => setResolution(e.target.value)} className="input-luxury text-sm">
              {resolutionOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            <span>⚠</span>
            <span>
              {error}{' '}
              {!isLoggedIn && <Link href="/login" className="underline font-semibold">Sign in →</Link>}
              {isLoggedIn && credits <= 0 && <Link href="/premium" className="underline font-semibold">Upgrade →</Link>}
            </span>
          </div>
        )}

        {/* Progress bar during generation */}
        {status === 'generating' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>Generating your wallpaper…</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 rounded-full bg-[var(--surface-2)] overflow-hidden">
              <div
                className="h-full progress-bar rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        {!isLoggedIn ? (
          <div className="text-center space-y-4 py-2">
            <p className="text-sm text-[var(--text-muted)]">Sign in to generate AI wallpapers. Free to start.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/signup" className="btn-primary text-sm px-7 py-3">Sign Up Free</Link>
              <Link href="/login"  className="btn-ghost  text-sm px-7 py-3">Log In</Link>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isPending || status === 'generating' || !prompt.trim()}
            className="w-full btn-primary py-4 text-base disabled:opacity-50"
          >
            {status === 'generating'
              ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">◌</span> Creating your masterpiece…</span>
              : '✦ Generate Wallpaper'}
          </button>
        )}
      </div>

      {/* Result panel */}
      {status === 'done' && resultUrl && (
        <div className="glass-card overflow-hidden animate-fade-in-up">
          <div className="relative aspect-video">
            <Image src={resultUrl} alt="Generated wallpaper" fill className="object-cover" unoptimized />
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-ai">✦ AI Generated</span>
              <span className="text-xs text-[var(--text-muted)]">{style} · {resolution}</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] italic line-clamp-2">&ldquo;{prompt}&rdquo;</p>
            <div className="flex gap-3">
              <a href={resultUrl} download="wallverse-ai.png" target="_blank" rel="noreferrer" className="flex-1 btn-primary py-3 text-sm text-center">
                ↓ Download
              </a>
              <button
                onClick={() => { setStatus('idle'); setResultUrl(null); setPrompt(''); setProgress(0) }}
                className="flex-1 btn-ghost py-3 text-sm"
              >
                Generate Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
