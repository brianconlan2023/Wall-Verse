import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Wallpaper } from '@/lib/supabase/types'
import LikeButton from './LikeButton'
import WallpaperCard from '@/components/WallpaperCard'

interface Props { params: Promise<{ id: string }> }

async function getWallpaper(id: string): Promise<Wallpaper | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('wallpapers')
      .select('*, profiles(username,avatar_url), categories(name,slug)')
      .eq('id', id)
      .single()
    return data as Wallpaper | null
  } catch { return null }
}

async function getUserLike(wallpaperId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase.from('likes').select('*').eq('user_id', user.id).eq('wallpaper_id', wallpaperId).single()
    return !!data
  } catch { return false }
}

async function getRelated(wallpaperId: string, categoryId: string | null): Promise<Wallpaper[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !categoryId) return []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('wallpapers')
      .select('*, profiles(username,avatar_url), categories(name,slug)')
      .eq('category_id', categoryId)
      .neq('id', wallpaperId)
      .order('views', { ascending: false })
      .limit(6)
    return (data as Wallpaper[]) || []
  } catch { return [] }
}

export default async function WallpaperPage({ params }: Props) {
  const { id } = await params
  const [wallpaper, isLiked] = await Promise.all([getWallpaper(id), getUserLike(id)])
  if (!wallpaper) notFound()

  const related = await getRelated(id, wallpaper.category_id)

  const downloadFormats = [
    { label: '8K  (7680×4320)', key: '8k',     url: wallpaper.image_url_4k },
    { label: '4K  (3840×2160)', key: '4k',     url: wallpaper.image_url_4k },
    { label: 'FHD (1920×1080)', key: 'fhd',    url: wallpaper.image_url_4k },
    { label: 'Mobile',           key: 'mobile', url: wallpaper.image_url_mobile || wallpaper.image_url_4k },
  ]

  return (
    <div className="min-h-screen">

      {/* ── Fullscreen preview ───────────────────────── */}
      <div className="relative w-full" style={{ height: 'min(90vh, 700px)' }}>
        <Image
          src={wallpaper.image_url_4k}
          alt={wallpaper.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/explore" className="btn-ghost text-sm flex items-center gap-2 px-4 py-2">
            ← Back
          </Link>
        </div>

        {/* Premium badge */}
        {wallpaper.is_premium_only && (
          <div className="absolute top-6 right-6 z-10 badge badge-premium text-sm px-4 py-2">
            ★ Premium
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────── */}
      <div className="container-app max-w-6xl -mt-16 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left: info (3 cols) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Title block */}
            <div>
              {wallpaper.categories && (
                <Link href={`/explore?category=${wallpaper.categories.slug}`} className="badge badge-new mb-3 inline-flex">
                  {wallpaper.categories.name}
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{wallpaper.title}</h1>
              {wallpaper.description && (
                <p className="mt-3 text-[var(--text-muted)] leading-relaxed">{wallpaper.description}</p>
              )}
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              {wallpaper.is_ai_generated && <span className="badge badge-ai">✦ AI Generated</span>}
              {wallpaper.is_premium_only  && <span className="badge badge-premium">★ Premium Only</span>}
              <span className="badge" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--color-cyan)', border: '1px solid rgba(6,182,212,0.3)' }}>
                4K Ready
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '👁', value: wallpaper.views.toLocaleString(), label: 'Views' },
                { icon: '↓', value: wallpaper.downloads.toLocaleString(), label: 'Downloads' },
                { icon: '♥', value: wallpaper.likes_count.toLocaleString(), label: 'Likes' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-extrabold">{s.value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Creator */}
            {wallpaper.profiles?.username && (
              <div className="glass-card px-5 py-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold flex-shrink-0"
                  aria-hidden="true"
                >
                  {wallpaper.profiles.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Created by</div>
                  <div className="font-semibold">@{wallpaper.profiles.username}</div>
                </div>
                <div className="ml-auto badge badge-new">Creator</div>
              </div>
            )}

            {/* AI Prompt */}
            {wallpaper.is_ai_generated && wallpaper.ai_prompt && (
              <div className="glass-card p-5 space-y-2 border-l-2" style={{ borderLeftColor: 'var(--color-primary-500)' }}>
                <div className="badge badge-ai w-fit">✦ AI Prompt</div>
                <p className="text-sm text-[var(--text-muted)] italic leading-relaxed">
                  &ldquo;{wallpaper.ai_prompt}&rdquo;
                </p>
                {wallpaper.ai_model && (
                  <p className="text-xs text-[var(--text-muted)]">Model: {wallpaper.ai_model}</p>
                )}
              </div>
            )}
          </div>

          {/* Right: download panel (2 cols) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Like button */}
            <LikeButton wallpaperId={wallpaper.id} initialLiked={isLiked} />

            {/* Download options */}
            <div className="glass-card p-5 space-y-3">
              <h2 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)]">Download</h2>
              <div className="space-y-2">
                {downloadFormats.map(fmt => (
                  <a
                    key={fmt.key}
                    href={fmt.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-4 py-3 glass rounded-xl hover:border-[var(--border-strong)] transition-all group hover:-translate-y-0.5"
                  >
                    <span className="text-sm font-medium">{fmt.label}</span>
                    <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-colors">↓ Download</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="glass-card p-5 space-y-3">
              <h2 className="font-bold text-sm uppercase tracking-widest text-[var(--text-muted)]">Share</h2>
              <div className="flex gap-2">
                {['𝕏 Twitter', 'Reddit', '📋 Copy Link'].map(p => (
                  <button
                    key={p}
                    className="flex-1 pill text-xs"
                    aria-label={`Share on ${p}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to collection CTA */}
            <Link href="/collections" className="block btn-ghost w-full py-3 text-sm text-center">
              ⊞ Save to Collection
            </Link>
          </div>
        </div>

        {/* ── Related wallpapers ──────────────────────── */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="heading-section mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map(w => (
                <WallpaperCard key={w.id} wallpaper={w} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
