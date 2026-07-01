import { createClient } from '@/lib/supabase/server'
import GenerateForm from './GenerateForm'
import Link from 'next/link'

const STYLES = [
  'Photorealistic',
  'Anime / Illustration',
  'Abstract',
  'Minimalist',
  'Cyberpunk',
  'Fantasy',
  'Nature',
  'Space / Cosmic',
  'Architectural',
  'Dark / Moody',
  'Watercolour',
  'Oil Painting',
]

const RESOLUTIONS = [
  '1920×1080 (FHD)',
  '2560×1440 (QHD)',
  '3840×2160 (4K)',
  '7680×4320 (8K)',
  '1080×1920 (Mobile)',
]

async function getUserData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return { credits: 0, isLoggedIn: false, tier: 'free' }
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { credits: 0, isLoggedIn: false, tier: 'free' }
    const { data } = await supabase.from('profiles').select('ai_credits, subscription_tier').eq('id', user.id).single()
    return { credits: data?.ai_credits ?? 0, isLoggedIn: true, tier: data?.subscription_tier ?? 'free' }
  } catch { return { credits: 0, isLoggedIn: false, tier: 'free' } }
}

export default async function GeneratePage() {
  const { credits, isLoggedIn, tier } = await getUserData()

  const RECENT_EXAMPLES = [
    { img: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80', prompt: 'Nebula with glowing gas clouds' },
    { img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', prompt: 'Neon Tokyo at night, rain' },
    { img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80', prompt: 'Aurora over snowy mountains' },
    { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', prompt: 'Abstract violet fluid art' },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Header with ambient glow ── */}
      <div className="relative overflow-hidden py-16 text-center">
        <div className="hero-glow hero-glow-1" style={{ opacity: 0.5 }} aria-hidden="true" />
        <div className="container-app relative z-10 space-y-4 max-w-3xl mx-auto">
          <span className="badge badge-ai text-sm px-5 py-2 mx-auto block w-fit">✦ AI Generator</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Create <span className="text-gradient">Stunning</span><br />Wallpapers with AI
          </h1>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Describe any scene — our AI transforms your words into a photorealistic 4K masterpiece in seconds.
          </p>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="container-app max-w-6xl pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Generator form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credits bar */}
          {isLoggedIn && (
            <div className="glass-card px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">✦</div>
                <div>
                  <div className="text-xs text-[var(--text-muted)] font-medium">AI Credits</div>
                  <div className="font-bold">{credits} remaining</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-[var(--surface-2)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-brand rounded-full transition-all"
                    style={{ width: `${Math.min((credits / (tier === 'premium_plus' ? 500 : tier === 'premium' ? 100 : 10)) * 100, 100)}%` }}
                  />
                </div>
                {credits < 3 && (
                  <Link href="/premium" className="badge badge-premium text-xs px-3 py-1">Upgrade</Link>
                )}
              </div>
            </div>
          )}

          <GenerateForm
            styleOptions={STYLES}
            resolutionOptions={RESOLUTIONS}
            isLoggedIn={isLoggedIn}
            credits={credits}
          />
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-6">

          {/* Recent community creations */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)]">
              Community Creations
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {RECENT_EXAMPLES.map((ex, i) => (
                <div key={i} className="group relative rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ex.img} alt={ex.prompt} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs leading-tight">{ex.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt tips */}
          <div className="glass-card p-5 space-y-3">
            <h2 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)]">Prompt Tips</h2>
            <ul className="space-y-2.5">
              {[
                { tip: 'Be specific',  ex: '"rain-soaked neon Tokyo alley"' },
                { tip: 'Add lighting', ex: '"golden hour", "bioluminescent"' },
                { tip: 'Set mood',     ex: '"eerie", "peaceful", "dramatic"' },
                { tip: 'Style cues',   ex: '"cinematic", "8K", "ultra-detailed"' },
              ].map(t => (
                <li key={t.tip} className="text-sm">
                  <span className="font-semibold">{t.tip}:</span>{' '}
                  <span className="text-[var(--text-muted)] italic">{t.ex}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade CTA if needed */}
          {!isLoggedIn || credits <= 3 ? (
            <div className="glass-card plan-card-featured p-5 space-y-3 text-center">
              <div className="text-2xl">★</div>
              <h3 className="font-bold">Get More Credits</h3>
              <p className="text-xs text-[var(--text-muted)]">Premium gives you 100 credits/month and 8K generation.</p>
              <Link href="/premium" className="btn-primary text-sm px-6 py-2.5 block">View Premium Plans</Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
