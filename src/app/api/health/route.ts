import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    supabase_url_set: !!url,
    supabase_key_set: !!key,
    supabase_url_prefix: url ? url.substring(0, 30) : 'NOT SET',
    key_prefix: key ? key.substring(0, 20) : 'NOT SET',
    node_env: process.env.NODE_ENV,
  })
}
