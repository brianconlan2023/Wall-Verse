'use client'

import { useState, useTransition } from 'react'
import { likeWallpaper } from '@/app/actions/wallpapers'

export default function LikeButton({ wallpaperId, initialLiked }: { wallpaperId: string; initialLiked: boolean }) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(0)          // local delta; real count from server
  const [isPending, startTransition] = useTransition()

  const handleLike = () => {
    startTransition(async () => {
      const result = await likeWallpaper(wallpaperId)
      if (result && 'liked' in result && typeof result.liked === 'boolean') {
        setLiked(result.liked)
        setCount(v => v + (result.liked ? 1 : -1))
      }
    })
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      aria-label={liked ? 'Unlike this wallpaper' : 'Like this wallpaper'}
      aria-pressed={liked}
      className={`w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 ${
        liked
          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 hover:bg-pink-500/30'
          : 'btn-ghost hover:border-pink-500/40 hover:text-pink-400'
      }`}
    >
      <span className={`text-xl transition-transform ${isPending ? 'animate-pulse' : liked ? 'scale-125' : 'scale-100'}`} aria-hidden="true">
        {liked ? '♥' : '♡'}
      </span>
      {liked ? 'Liked' : 'Like this Wallpaper'}
      {count !== 0 && (
        <span className="text-xs opacity-60">({count > 0 ? '+' : ''}{count})</span>
      )}
    </button>
  )
}
