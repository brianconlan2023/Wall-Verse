'use client'

import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
    >
      {isPending ? 'Logging out…' : 'Log Out'}
    </button>
  )
}
