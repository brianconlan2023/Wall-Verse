'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'

interface NavClientProps {
  user: { email: string | null } | null
}

const NAV_LINKS = [
  { href: '/explore',     label: 'Explore',       icon: '◈' },
  { href: '/generate',    label: 'Generate AI',   icon: '✦' },
  { href: '/collections', label: 'Collections',   icon: '⊞' },
  { href: '/premium',     label: 'Premium',       icon: '★' },
]

const THEMES = [
  { key: 'dark',   icon: '◉', label: 'Dark' },
  { key: 'light',  icon: '○', label: 'Light' },
  { key: 'amoled', icon: '⬛', label: 'AMOLED' },
]

export default function NavClient({ user }: NavClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [theme, setTheme] = useState<string>('dark')
  const [isPending, startTransition] = useTransition()
  const searchRef = useRef<HTMLInputElement>(null)

  /* ── Theme initialisation ────────────────────────── */
  useEffect(() => {
    const stored = localStorage.getItem('wv-theme') || 'dark'
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  const cycleTheme = () => {
    const next = THEMES[(THEMES.findIndex(t => t.key === theme) + 1) % THEMES.length]
    setTheme(next.key)
    localStorage.setItem('wv-theme', next.key)
    document.documentElement.setAttribute('data-theme', next.key)
  }

  /* ── Keyboard shortcuts ──────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80)
  }, [searchOpen])

  /* ── Close mobile nav on route change ───────────── */
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => startTransition(() => logout())

  const currentTheme = THEMES.find(t => t.key === theme) || THEMES[0]

  return (
    <>
      {/* ── Top NavBar ─────────────────────────────── */}
      <header className="glass-nav" role="banner">
        <div className="container-app h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="WallVerse AI home">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
              W
            </div>
            <span className="text-base font-black tracking-tight hidden sm:block">
              Wall<span className="text-gradient">Verse</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-gradient-card text-gradient border border-[var(--border-strong)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <span aria-hidden="true" className="text-xs">{link.icon}</span>
                  {link.label}
                  {link.label === 'Premium' && (
                    <span className="badge badge-premium ml-0.5">Pro</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search wallpapers (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 px-3 py-2 glass rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="hidden md:block">Search…</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-xs bg-[var(--surface-2)] border border-[var(--border)] rounded-md ml-1">⌘K</kbd>
            </button>

            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              aria-label={`Switch theme (current: ${currentTheme.label})`}
              className="theme-btn"
              title={`Theme: ${currentTheme.label}`}
            >
              {currentTheme.icon}
            </button>

            {/* Auth */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform"
                  aria-label="View profile"
                  title={user.email || 'Profile'}
                >
                  {(user.email || 'U')[0].toUpperCase()}
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="btn-ghost text-sm px-4 py-2 disabled:opacity-50"
                >
                  {isPending ? '…' : 'Log Out'}
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm px-4 py-2">Log In</Link>
                <Link href="/signup" className="btn-primary text-sm px-5 py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 glass rounded-xl"
            >
              <span className="w-4 h-0.5 bg-current rounded-full block" />
              <span className="w-4 h-0.5 bg-current rounded-full block" />
              <span className="w-3 h-0.5 bg-current rounded-full block self-end" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile nav drawer ──────────────────────── */}
      {mobileOpen && (
        <div className="mobile-nav lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="mobile-nav-panel">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-black text-xs">W</div>
                <span className="font-black">WallVerse</span>
              </div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="w-8 h-8 glass rounded-lg flex items-center justify-center text-lg">×</button>
            </div>

            <nav className="space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    pathname === link.href ? 'bg-gradient-card border border-[var(--border-strong)] text-gradient' : 'hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-3">
              {user ? (
                <>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface-2)] font-semibold">
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                      {(user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">My Profile</div>
                      <div className="text-xs text-[var(--text-muted)] truncate max-w-[160px]">{user.email}</div>
                    </div>
                  </Link>
                  <button onClick={handleLogout} disabled={isPending} className="w-full btn-ghost py-3 text-sm">
                    {isPending ? 'Logging out…' : 'Log Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-center btn-ghost py-3 text-sm">Log In</Link>
                  <Link href="/signup" className="block text-center btn-primary py-3 text-sm">Sign Up Free</Link>
                </>
              )}
            </div>

            {/* Theme buttons in mobile nav */}
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-widest mb-3">Theme</p>
              <div className="flex gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTheme(t.key)
                      localStorage.setItem('wv-theme', t.key)
                      document.documentElement.setAttribute('data-theme', t.key)
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      theme === t.key ? 'bg-gradient-card border-[var(--border-strong)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Overlay ─────────────────────────── */}
      {searchOpen && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div className="search-box mx-4">
            <form onSubmit={handleSearch} role="search">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="flex-shrink-0 opacity-50">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search wallpapers, styles, categories…"
                  className="flex-1 bg-transparent outline-none text-base"
                  aria-label="Search query"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-xs text-[var(--text-muted)] glass px-2 py-1 rounded-md"
                >
                  ESC
                </button>
              </div>
            </form>

            <div className="p-4">
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-widest mb-3">Popular</p>
              <div className="flex flex-wrap gap-2">
                {['Space & Galaxy', 'Dark Minimal', 'Cyberpunk City', 'Abstract Art', 'Nature 4K', 'Anime'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      router.push(`/explore?q=${encodeURIComponent(tag)}`)
                      setSearchOpen(false)
                    }}
                    className="pill text-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
