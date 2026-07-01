import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'WallVerse AI — Premium 4K & 8K AI Wallpapers',
    template: '%s · WallVerse AI',
  },
  description: 'Discover 50,000+ curated 4K & 8K wallpapers, generate unique AI art, and build your perfect collection. The world\'s most stunning wallpaper platform.',
  keywords: ['wallpapers', '4K', '8K', 'AI generated', 'wallpaper app', 'premium wallpapers'],
  openGraph: {
    siteName: 'WallVerse AI',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">

        <NavBar />

        <main className="flex-grow">{children}</main>

        {/* ── Luxury Footer ── */}
        <footer className="glass border-t border-[var(--border)] mt-20">
          <div className="container-app py-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

              {/* Brand */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-black">W</div>
                  <span className="text-lg font-black">Wall<span className="text-gradient">Verse</span> AI</span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
                  The world&apos;s most stunning AI-powered wallpaper platform. Discover, create, and collect.
                </p>
                <div className="flex gap-3">
                  {['𝕏', 'IG', 'YT', 'DC'].map(s => (
                    <button key={s} className="w-8 h-8 glass rounded-lg text-xs font-bold hover:border-[var(--border-strong)] transition-colors" aria-label={`Follow on ${s}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Links */}
              {[
                {
                  heading: 'Product',
                  links: [
                    { label: 'Explore', href: '/explore' },
                    { label: 'AI Generator', href: '/generate' },
                    { label: 'Collections', href: '/collections' },
                    { label: 'Premium', href: '/premium' },
                  ],
                },
                {
                  heading: 'Account',
                  links: [
                    { label: 'Sign Up', href: '/signup' },
                    { label: 'Log In', href: '/login' },
                    { label: 'Profile', href: '/profile' },
                    { label: 'Settings', href: '/profile' },
                  ],
                },
                {
                  heading: 'Company',
                  links: [
                    { label: 'About', href: '/' },
                    { label: 'Blog', href: '/' },
                    { label: 'Careers', href: '/' },
                    { label: 'Contact', href: '/' },
                  ],
                },
              ].map(col => (
                <div key={col.heading} className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{col.heading}</h3>
                  <ul className="space-y-2.5">
                    {col.links.map(l => (
                      <li key={l.label}>
                        <Link href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <hr className="divider-gradient my-10" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)]">
              <p>&copy; {new Date().getFullYear()} WallVerse AI. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link>
                <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link>
                <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
