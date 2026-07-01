import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavClient from './NavClient'

export default async function NavBar() {
  let user = null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch { /* not configured */ }
  }

  return <NavClient user={user ? { email: user.email ?? null } : null} />
}
