import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Add your credentials to .env.local.' },
      { status: 503 }
    )
  }

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_credits')
    .eq('id', user.id)
    .single()

  if (!profile || profile.ai_credits <= 0) {
    return NextResponse.json(
      { error: 'No AI credits remaining. Upgrade to Premium for more.' },
      { status: 402 }
    )
  }

  const body = await request.json()
  const { prompt, style, resolution } = body as {
    prompt: string
    style: string
    resolution: string
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }

  // Record the generation attempt
  const { data: generation } = await supabase
    .from('ai_generations')
    .insert({
      user_id: user.id,
      prompt,
      style,
      resolution,
      status: 'processing',
    })
    .select('id')
    .single()

  // Deduct one credit
  await supabase
    .from('profiles')
    .update({ ai_credits: profile.ai_credits - 1 })
    .eq('id', user.id)

  // NOTE: Real AI image generation would call an external provider here
  // (e.g. Replicate, fal.ai, OpenAI DALL·E, Stability AI).
  // For now, we return a placeholder Unsplash image and mark generation complete.
  const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=3840&q=80',
    'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=3840&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=3840&q=80',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=3840&q=80',
  ]
  const resultUrl = PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)]

  if (generation) {
    await supabase
      .from('ai_generations')
      .update({ status: 'completed', result_url: resultUrl })
      .eq('id', generation.id)
  }

  return NextResponse.json({ url: resultUrl, generationId: generation?.id })
}
