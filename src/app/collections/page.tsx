import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Collection, Wallpaper } from '@/lib/supabase/types'

type CollectionWithItems = Collection & {
  collection_items: Array<{
    wallpaper_id: string
    wallpapers: Pick<Wallpaper, 'id' | 'title' | 'image_url_thumbnail' | 'image_url_4k'> | null
  }>
}

async function getCollections(userId: string): Promise<CollectionWithItems[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('collections')
    .select(
      `*, collection_items(wallpaper_id, wallpapers(id, title, image_url_thumbnail, image_url_4k))`
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (data as CollectionWithItems[]) || []
}

export default async function CollectionsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-extrabold">Collections</h1>
        <p className="opacity-60">Connect Supabase to enable collections.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/collections')
  }

  const collections = await getCollections(user.id)

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">
            My <span className="text-gradient">Collections</span>
          </h1>
          <p className="opacity-60 mt-1">Your curated wallpaper galleries</p>
        </div>
        <CreateCollectionButton />
      </div>

      {collections.length === 0 ? (
        <div className="glass-card p-16 text-center space-y-4">
          <div className="text-5xl opacity-30">◈</div>
          <h2 className="text-xl font-bold">No collections yet</h2>
          <p className="opacity-60 text-sm">Start building your first collection by liking wallpapers.</p>
          <Link
            href="/explore"
            className="inline-block mt-2 px-6 py-3 bg-foreground text-background rounded-full font-bold text-sm hover:scale-105 transition-transform"
          >
            Browse Wallpapers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div key={col.id} className="glass-card overflow-hidden">
              {/* Thumbnail mosaic */}
              <div className="grid grid-cols-2 h-40">
                {col.collection_items.slice(0, 4).map((item, idx) =>
                  item.wallpapers ? (
                    <div key={item.wallpaper_id} className="relative overflow-hidden bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.wallpapers.image_url_thumbnail || item.wallpapers.image_url_4k}
                        alt={item.wallpapers.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div key={idx} className="bg-gray-800 flex items-center justify-center opacity-20">
                      ◈
                    </div>
                  )
                )}
                {/* Fill empty slots */}
                {col.collection_items.length < 4 &&
                  Array.from({ length: 4 - col.collection_items.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-800/40" />
                  ))}
              </div>

              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{col.name}</h3>
                  <p className="text-xs opacity-50 mt-0.5">
                    {col.collection_items.length} wallpaper{col.collection_items.length !== 1 ? 's' : ''}
                    {col.is_public ? ' · Public' : ' · Private'}
                  </p>
                </div>
                <span className="text-xs opacity-40">→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateCollectionButton() {
  return (
    <button
      className="px-5 py-2.5 bg-foreground text-background rounded-full font-bold text-sm hover:scale-105 transition-transform"
      aria-label="Create new collection"
    >
      + New Collection
    </button>
  )
}
