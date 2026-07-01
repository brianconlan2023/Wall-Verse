import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import WallpaperCard, { WallpaperCardPlaceholder } from '@/components/WallpaperCard'
import type { Wallpaper } from '@/lib/supabase/types'

/* ── Unsplash demo wallpapers shown when Supabase is not connected ─── */
const DEMO_WALLPAPERS = [
  { id: '1', title: 'Nebula Dreams', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80', cat: 'Space' },
  { id: '2', title: 'Neon Tokyo',    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', cat: 'Cyberpunk' },
  { id: '3', title: 'Aurora Borealis', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', cat: 'Nature' },
  { id: '4', title: 'Mountain Zenith', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', cat: 'Landscape' },
  { id: '5', title: 'Deep Ocean',      image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80', cat: 'Nature' },
  { id: '6', title: 'City Lights',     image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', cat: 'Urban' },
  { id: '7', title: 'Abstract Flow',   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', cat: 'Abstract' },
  { id: '8', title: 'Desert Dunes',    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80', cat: 'Landscape' },
]

const CATEGORIES = [
  { name: 'Space',      icon: '🌌', color: '#7c3aed' },
  { name: 'Cyberpunk',  icon: '⚡', color: '#ec4899' },
  { name: 'Nature',     icon: '🌿', color: '#10b981' },
  { name: 'Abstract',   icon: '◈',  color: '#f59e0b' },
  { name: 'Minimal',    icon: '□',  color: '#6b7280' },
  { name: 'Anime',      icon: '✨', color: '#06b6d4' },
  { name: 'Dark',       icon: '◉',  color: '#1e1b4b' },
  { name: 'Landscape',  icon: '🏔', color: '#0ea5e9' },
]

const FEATURES = [
  { icon: '✦', title: 'AI Generation', desc: 'Describe any scene and get a photorealistic 4K wallpaper in seconds. 10 free credits every month.' },
  { icon: '◈', title: 'Smart Collections', desc: 'Curate and organise wallpapers into themed collections. Share them with the world.' },
  { icon: '◉', title: '4K & 8K Quality', desc: 'Every wallpaper is available in native 4K and 8K resolution, optimised for any screen.' },
  { icon: '⊞', title: 'Multi-Device Sync', desc: 'Download desktop, mobile, and tablet versions of every wallpaper in one tap.' },
  { icon: '★', title: 'Premium Library', desc: 'Access over 50,000 exclusive premium wallpapers hand-curated by our design team.' },
  { icon: '↻', title: 'Daily Fresh Drop', desc: 'New wallpapers added every single day. Never run out of fresh inspiration.' },
]

async function getTrendingWallpapers(): Promise<Wallpaper[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('wallpapers')
      .select('*, profiles(username,avatar_url), categories(name,slug)')
      .order('views', { ascending: false })
      .limit(8)
    return (data as Wallpaper[]) || []
  } catch { return [] }
}

export default async function Home() {
  const wallpapers = await getTrendingWallpapers()
  const hasData = wallpapers.length > 0

  return (
    <div className="relative overflow-hidden">

      {/* ═══════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center overflow-hidden backdrop-pattern">
        {/* Ambient glows */}
        <div className="hero-glow hero-glow-1" aria-hidden="true" />
        <div className="hero-glow hero-glow-2" aria-hidden="true" />
        <div className="hero-glow hero-glow-3" aria-hidden="true" />

        <div className="container-app relative z-10 flex flex-col items-center gap-8 py-24">

          {/* New badge */}
          <div className="animate-fade-in glass border border-[var(--border-strong)] rounded-full px-5 py-2 text-sm font-semibold flex items-center gap-2">
            <span className="badge badge-new">New</span>
            AI Wallpaper generation v2 is live
            <span aria-hidden="true">→</span>
          </div>

          {/* Headline */}
          <h1 className="heading-display max-w-5xl animate-fade-in animation-delay-100">
            The World&apos;s Most{' '}
            <span className="text-gradient animate-neon">Stunning</span>
            <br />
            Wallpaper Platform
          </h1>

          <p className="text-lg md:text-xl max-w-2xl text-[var(--text-muted)] leading-relaxed animate-fade-in animation-delay-200">
            Discover 50,000+ curated 4K &amp; 8K wallpapers, generate unique AI art in seconds,
            and build your perfect collection — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-300">
            <Link href="/explore" className="btn-primary text-base px-9 py-4">
              Explore Gallery
            </Link>
            <Link href="/generate" className="btn-ghost text-base px-9 py-4">
              ✦ Generate AI Art
            </Link>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-4 animate-fade-in animation-delay-400">
            {[
              { value: '50K+',   label: 'Wallpapers' },
              { value: '4K/8K',  label: 'Max Resolution' },
              { value: '200K+',  label: 'Downloads' },
              { value: '10',     label: 'Free AI Credits' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-gradient">{s.value}</div>
                <div className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float opacity-50" aria-hidden="true">
          <div className="w-5 h-8 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CATEGORY PILLS
          ═══════════════════════════════════════════════ */}
      <section className="container-app py-16">
        <div className="flex justify-between items-end mb-8">
          <h2 className="heading-section">Browse by Category</h2>
          <Link href="/explore" className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              href={`/explore?q=${encodeURIComponent(cat.name)}`}
              className="glass-card p-4 text-center hover:-translate-y-1 transition-transform cursor-pointer group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform inline-block">{cat.icon}</div>
              <div className="text-xs font-bold">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <hr className="divider-gradient mx-8" />

      {/* ═══════════════════════════════════════════════
          TRENDING GALLERY
          ═══════════════════════════════════════════════ */}
      <section className="container-app py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="heading-section">Trending Now</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">The most loved wallpapers this week</p>
          </div>
          <Link href="/explore?sort=views" className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
            See all trending →
          </Link>
        </div>

        {hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {wallpapers.map((w, i) => (
              <div key={w.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <WallpaperCard wallpaper={w} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {DEMO_WALLPAPERS.map((w, i) => (
                <DemoCard key={w.id} wallpaper={w} delay={i * 60} />
              ))}
            </div>
            <p className="text-center mt-6 text-sm text-[var(--text-muted)]">
              Connect your Supabase project to load real wallpapers.{' '}
              <Link href="/explore" className="underline hover:text-[var(--foreground)] transition-colors">
                Browse gallery →
              </Link>
            </p>
          </div>
        )}
      </section>

      <hr className="divider-gradient mx-8" />

      {/* ═══════════════════════════════════════════════
          AI GENERATOR CTA
          ═══════════════════════════════════════════════ */}
      <section className="container-app py-20">
        <div className="glass-card plan-card-featured p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} aria-hidden="true" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="badge badge-ai mx-auto w-fit text-sm px-4 py-1.5">✦ AI Powered</div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Turn Any Idea Into a<br />
              <span className="text-gradient">4K Masterpiece</span>
            </h2>
            <p className="text-[var(--text-muted)] text-lg leading-relaxed">
              Type a prompt, pick a style, and get a stunning wallpaper in under 30 seconds. No design skills needed.
            </p>
            <Link href="/generate" className="btn-primary text-lg px-10 py-4 inline-block">
              ✦ Try AI Generator Free
            </Link>
            <p className="text-xs text-[var(--text-muted)]">10 free credits per month · No credit card needed</p>
          </div>
        </div>
      </section>

      <hr className="divider-gradient mx-8" />

      {/* ═══════════════════════════════════════════════
          FEATURE GRID
          ═══════════════════════════════════════════════ */}
      <section className="container-app py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="heading-section mb-4">Everything a Wallpaper App Should Be</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Built for creators, collectors, and anyone who cares about what they see on their screen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass-card glass-card-glow p-7 space-y-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.18))', border: '1px solid var(--border-strong)' }}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <h3 className="text-base font-bold">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider-gradient mx-8" />

      {/* ═══════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════ */}
      <section className="container-app py-24 text-center space-y-8">
        <h2 className="heading-display">
          Your Screen Deserves<br />
          <span className="text-gradient">Better Wallpapers.</span>
        </h2>
        <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Join over 200,000 users who have already upgraded their aesthetic with WallVerse AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-lg px-10 py-4">
            Get Started — It&apos;s Free
          </Link>
          <Link href="/premium" className="btn-ghost text-lg px-10 py-4">
            ★ View Premium Plans
          </Link>
        </div>
      </section>

    </div>
  )
}

/* ── Demo card (shown without Supabase) ─── */
function DemoCard({ wallpaper, delay }: { wallpaper: typeof DEMO_WALLPAPERS[0]; delay: number }) {
  return (
    <div
      className="wallpaper-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={wallpaper.image}
        alt={wallpaper.title}
        className="w-full aspect-[3/4] object-cover"
        loading="lazy"
      />
      <div className="card-overlay">
        <span className="badge badge-new mb-1">{wallpaper.cat}</span>
        <h3 className="text-white font-bold text-sm">{wallpaper.title}</h3>
      </div>
    </div>
  )
}
