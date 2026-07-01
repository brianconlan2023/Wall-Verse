import Image from 'next/image'
import Link from 'next/link'
import type { Wallpaper } from '@/lib/supabase/types'

interface WallpaperCardProps {
  wallpaper: Wallpaper
  priority?: boolean
}

export default function WallpaperCard({ wallpaper, priority }: WallpaperCardProps) {
  const src = wallpaper.image_url_thumbnail || wallpaper.image_url_4k

  return (
    <Link
      href={`/wallpaper/${wallpaper.id}`}
      className="wallpaper-card block"
      aria-label={`View wallpaper: ${wallpaper.title}`}
    >
      <Image
        src={src}
        alt={wallpaper.title}
        width={400}
        height={560}
        className="w-full aspect-[3/4] object-cover"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
        unoptimized
      />

      {/* Quick-action icons */}
      <div className="card-actions">
        {wallpaper.is_ai_generated && (
          <span className="badge badge-ai">✦ AI</span>
        )}
        {wallpaper.is_premium_only && (
          <span className="badge badge-premium">★</span>
        )}
      </div>

      <div className="card-overlay">
        {wallpaper.categories?.name && (
          <span className="badge badge-new mb-1.5">{wallpaper.categories.name}</span>
        )}
        <h3 className="text-white font-bold text-sm leading-tight truncate-2">
          {wallpaper.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
          <span>♥ {wallpaper.likes_count.toLocaleString()}</span>
          <span>↓ {wallpaper.downloads.toLocaleString()}</span>
          <span>👁 {wallpaper.views.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Skeleton placeholder ── */
export function WallpaperCardPlaceholder({ index }: { index: number }) {
  return (
    <div
      className="wallpaper-card shimmer"
      style={{ animationDelay: `${index * 120}ms` }}
      aria-hidden="true"
    >
      <div className="w-full aspect-[3/4]" />
    </div>
  )
}
