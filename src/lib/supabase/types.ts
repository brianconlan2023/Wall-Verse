export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  is_premium: boolean
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  ai_credits: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export type Wallpaper = {
  id: string
  title: string
  description: string | null
  creator_id: string | null
  category_id: string | null
  image_url_4k: string
  image_url_mobile: string | null
  image_url_thumbnail: string | null
  is_ai_generated: boolean
  ai_prompt: string | null
  ai_model: string | null
  is_premium_only: boolean
  views: number
  downloads: number
  likes_count: number
  created_at: string
  // joined
  profiles?: Pick<Profile, 'username' | 'avatar_url'> | null
  categories?: Pick<Category, 'name' | 'slug'> | null
}

export type AiGeneration = {
  id: string
  user_id: string
  prompt: string
  style: string | null
  resolution: string | null
  model_used: string | null
  result_url: string | null
  status: 'processing' | 'completed' | 'failed'
  created_at: string
}

export type Collection = {
  id: string
  user_id: string
  name: string
  is_public: boolean
  created_at: string
}
