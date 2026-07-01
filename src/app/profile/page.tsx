import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Wallpaper } from '@/lib/supabase/types'
import LogoutButton from '@/components/LogoutButton'

async function getProfileData(userId: string) {
  const supabase = await createClient()

  const [profileResult, wallpapersResult, generationsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('wallpapers')
      .select('id, title, image_url_thumbnail, image_url_4k, likes_count, downloads, views')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('ai_generations')
      .select('id, prompt, result_url, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  return {
    profile: profileResult.data as Profile | null,
    wallpapers: (wallpapersResult.data as Partial<Wallpaper>[]) || [],
    generations: generationsResult.data || [],
  }
}

export default async function ProfilePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="opacity-60">Connect Supabase to enable profiles.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/profile')
  }

  const { profile, wallpapers, generations } = await getProfileData(user.id)

  const tierLabel = {
    free: 'Free',
    premium: 'Premium ★',
    premium_plus: 'Premium+ ★★',
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Profile Header */}
      <div className="glass-card p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))' }}
          aria-hidden="true"
        >
          {(profile?.username || user.email || 'U')[0].toUpperCase()}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold">
            {profile?.full_name || profile?.username || 'New User'}
          </h1>
          {profile?.username && (
            <p className="opacity-60 text-sm">@{profile.username}</p>
          )}
          <p className="text-sm opacity-50 mt-1">{user.email}</p>

          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <span className="glass px-3 py-1 rounded-full text-xs font-medium" style={{ color: 'var(--color-primary-500)' }}>
              {tierLabel[profile?.subscription_tier || 'free']}
            </span>
            <span className="glass px-3 py-1 rounded-full text-xs font-medium opacity-70">
              ✦ {profile?.ai_credits ?? 0} AI credits
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/premium"
            className="px-5 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:scale-105 transition-transform text-center"
          >
            Upgrade
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Wallpapers', value: wallpapers.length },
          { label: 'Generations', value: generations.length },
          { label: 'AI Credits', value: profile?.ai_credits ?? 0 },
        ].map((s) => (
          <div key={s.label} className="glass-card py-5 text-center">
            <div className="text-3xl font-extrabold text-gradient">{s.value}</div>
            <div className="text-xs opacity-50 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Wallpapers */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">My Wallpapers</h2>
        {wallpapers.length === 0 ? (
          <div className="glass-card p-10 text-center opacity-50 text-sm">
            You haven&apos;t uploaded any wallpapers yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {wallpapers.map((w) => (
              <Link
                key={w.id}
                href={`/wallpaper/${w.id}`}
                className="glass-card aspect-[9/16] overflow-hidden relative group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.image_url_thumbnail || w.image_url_4k}
                  alt={w.title || 'Wallpaper'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* AI Generation History */}
      <section>
        <h2 className="text-xl font-bold mb-4">AI Generation History</h2>
        {generations.length === 0 ? (
          <div className="glass-card p-10 text-center opacity-50 text-sm">
            No generations yet.{' '}
            <Link href="/generate" className="underline">
              Try the AI generator
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map((g) => (
              <div key={g.id} className="glass-card p-4 flex items-center gap-4">
                {g.result_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.result_url}
                    alt="Generated"
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{g.prompt}</p>
                  <p className="text-xs opacity-40 mt-0.5">
                    {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                    g.status === 'completed'
                      ? 'bg-green-500/20 text-green-500'
                      : g.status === 'failed'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}
                >
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
