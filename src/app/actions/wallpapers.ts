'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function likeWallpaper(wallpaperId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Must be logged in to like wallpapers.' }
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('wallpaper_id', wallpaperId)
    .single()

  if (existing) {
    // Unlike
    await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('wallpaper_id', wallpaperId)

    await supabase.rpc('decrement_likes', { wallpaper_id: wallpaperId })
    revalidatePath('/explore')
    return { liked: false }
  } else {
    // Like
    await supabase
      .from('likes')
      .insert({ user_id: user.id, wallpaper_id: wallpaperId })

    await supabase.rpc('increment_likes', { wallpaper_id: wallpaperId })
    revalidatePath('/explore')
    return { liked: true }
  }
}

export async function incrementViews(wallpaperId: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_views', { wallpaper_id: wallpaperId })
}
