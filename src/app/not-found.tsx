import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center relative overflow-hidden">
      <div className="hero-glow hero-glow-1" style={{ opacity: 0.35 }} aria-hidden="true" />
      <div className="relative z-10 space-y-8 max-w-lg">
        <div className="text-[10rem] font-black leading-none text-gradient opacity-30 select-none" aria-hidden="true">404</div>
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold">Page Not Found</h1>
          <p className="text-[var(--text-muted)] leading-relaxed">
            The wallpaper you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-8 py-3 text-sm">Back to Home</Link>
          <Link href="/explore" className="btn-ghost px-8 py-3 text-sm">Explore Gallery</Link>
        </div>
      </div>
    </div>
  )
}
