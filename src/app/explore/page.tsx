import { createClient } from '@/lib/supabase/server'
import WallpaperCard, { WallpaperCardPlaceholder } from '@/components/WallpaperCard'
import Link from 'next/link'
import type { Wallpaper, Category } from '@/lib/supabase/types'

interface ExplorePageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; ai?: string }>
}

const DEMO_WALLPAPERS = [
  { id:'d1', title:'Nebula Dreams',    image:'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80', cat:'Space'    },
  { id:'d2', title:'Neon Tokyo',       image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', cat:'Cyberpunk' },
  { id:'d3', title:'Aurora Borealis',  image:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', cat:'Nature'   },
  { id:'d4', title:'Mountain Zenith',  image:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80', cat:'Landscape'},
  { id:'d5', title:'Deep Ocean',       image:'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80', cat:'Nature'   },
  { id:'d6', title:'City Lights',      image:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80', cat:'Urban'    },
  { id:'d7', title:'Abstract Flow',    image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', cat:'Abstract'  },
  { id:'d8', title:'Desert Dunes',     image:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80', cat:'Landscape'},
  { id:'d9', title:'Foggy Forest',     image:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80', cat:'Nature'   },
  { id:'d10',title:'Milky Way',        image:'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&q=80', cat:'Space'    },
  { id:'d11',title:'Skyscraper Glass', image:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80', cat:'Urban'    },
  { id:'d12',title:'Lavender Fields',  image:'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=600&q=80', cat:'Nature'   },
]

const SORT_OPTIONS = [
  { value: 'views',     label: '🔥 Trending'    },
  { value: 'downloads', label: '↓ Most Downloaded' },
  { value: 'likes',     label: '♥ Most Liked'   },
  { value: 'newest',    label: '✦ Newest'        },
]

const CATEGORY_PILLS = [
  'Space','Cyberpunk','Nature','Abstract','Minimal',
  'Anime','Dark','Landscape','Urban','Fantasy','Architecture',
]

async function getWallpapers(params: { category?: string; q?: string; sort?: string; ai?: string }): Promise<Wallpaper[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const supabase = await createClient()
    let query = supabase
      .from('wallpapers')
      .select('*, profiles(username,avatar_url), categories(name,slug)')
      .limit(32)

    if (params.q)        query = query.ilike('title', `%${params.q}%`)
    if (params.ai === '1') query = query.eq('is_ai_generated', true)

    const sortField = params.sort === 'downloads' ? 'downloads'
      : params.sort === 'likes'   ? 'likes_count'
      : params.sort === 'newest'  ? 'created_at'
      : 'views'
    query = query.order(sortField, { ascending: false })

    const { data } = await query
    return (data as Wallpaper[]) || []
  } catch { return [] }
}

async function getCategories(): Promise<Category[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('*').order('name')
    return (data as Category[]) || []
  } catch { return [] }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const { category, q, sort = 'views', ai } = params

  const [wallpapers, categories] = await Promise.all([
    getWallpapers({ category, q, sort, ai }),
    getCategories(),
  ])

  const hasData = wallpapers.length > 0
  const categoryPills = categories.length > 0 ? categories.map(c => c.name) : CATEGORY_PILLS

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    const merged = { q, sort, category, ai, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
    const s = p.toString()
    return `/explore${s ? '?' + s : ''}`
  }

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="container-app pt-12 pb-8">
        <h1 className="heading-section mb-1">
          {q ? `Results for "${q}"` : 'Explore Wallpapers'}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {hasData ? `${wallpapers.length} wallpapers` : 'Browse our curated collection'}
        </p>
      </div>

      {/* ── Sticky filter bar ── */}
      <div className="glass-nav border-t border-b border-[var(--border)] py-4 mb-8 sticky top-16 z-40">
        <div className="container-app flex flex-col gap-4">

          {/* Search + Sort row */}
          <form method="GET" action="/explore" className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search wallpapers…"
                className="input-luxury pl-9 py-2.5 text-sm"
              />
            </div>

            <select
              name="sort"
              defaultValue={sort}
              className="input-luxury py-2.5 text-sm w-auto min-w-[160px]"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm cursor-pointer hover:border-[var(--border-strong)] transition-colors" style={{ borderRadius: '0.875rem' }}>
              <input type="checkbox" name="ai" value="1" defaultChecked={ai === '1'} className="accent-[var(--color-primary-500)]" />
              <span className="badge badge-ai">✦ AI</span>
              AI only
            </label>

            <button type="submit" className="btn-primary px-6 py-2.5 text-sm">Search</button>

            {(q || ai === '1') && (
              <Link href="/explore" className="btn-ghost px-4 py-2.5 text-sm">Clear</Link>
            )}
          </form>

          {/* Category pills row */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Link
              href={buildHref({ category: undefined })}
              className={`pill flex-shrink-0 ${!category ? 'pill-active' : ''}`}
            >
              All
            </Link>
            {categoryPills.map(cat => (
              <Link
                key={cat}
                href={buildHref({ category: cat.toLowerCase() })}
                className={`pill flex-shrink-0 ${category === cat.toLowerCase() ? 'pill-active' : ''}`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Gallery Grid ── */}
      <div className="container-app pb-20">
        {hasData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {wallpapers.map((w, i) => (
              <div key={w.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                <WallpaperCard wallpaper={w} priority={i < 8} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {DEMO_WALLPAPERS.map((w, i) => (
                <div key={w.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="wallpaper-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.image} alt={w.title} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                    <div className="card-overlay">
                      <span className="badge badge-new mb-1">{w.cat}</span>
                      <h3 className="text-white font-bold text-sm">{w.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-card p-8 text-center mt-10 max-w-lg mx-auto space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                Connect your Supabase project to display your real wallpaper library.
              </p>
              <Link href="/" className="btn-primary text-sm px-6 py-2.5 inline-block">Back to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
