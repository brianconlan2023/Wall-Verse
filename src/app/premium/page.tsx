import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    badge: null,
    color: 'var(--text-muted)',
    features: [
      { text: '10 AI credits / month',     ok: true },
      { text: 'Browse all wallpapers',      ok: true },
      { text: 'Download FHD (1080p)',        ok: true },
      { text: 'Basic collections (3)',       ok: true },
      { text: '4K downloads',               ok: false },
      { text: 'Priority generation',        ok: false },
      { text: 'Commercial license',         ok: false },
    ],
    cta: 'Start Free',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Premium',
    price: '$6',
    period: '/month',
    badge: 'Most Popular',
    color: 'var(--color-primary-500)',
    features: [
      { text: '100 AI credits / month',     ok: true },
      { text: 'Download 4K wallpapers',     ok: true },
      { text: 'Unlimited collections',      ok: true },
      { text: 'Priority AI generation',     ok: true },
      { text: 'Early access to new models', ok: true },
      { text: 'Commercial license',         ok: false },
      { text: 'API access',                 ok: false },
    ],
    cta: 'Upgrade to Premium',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Premium+',
    price: '$14',
    period: '/month',
    badge: 'Ultimate',
    color: 'var(--color-gold)',
    features: [
      { text: 'Unlimited AI credits',       ok: true },
      { text: 'Download 8K wallpapers',     ok: true },
      { text: 'Commercial license',         ok: true },
      { text: 'API access',                 ok: true },
      { text: 'Private collections',        ok: true },
      { text: 'Dedicated support',          ok: true },
      { text: 'Custom AI model training',   ok: true },
    ],
    cta: 'Go Premium+',
    href: '/signup',
    featured: false,
  },
]

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click, no questions asked. Your access continues until the end of the billing period.' },
  { q: 'What are AI credits?', a: 'Each AI wallpaper generation costs 1 credit. Credits reset on the 1st of every month.' },
  { q: 'What is the commercial license?', a: 'Premium+ users can use generated wallpapers in commercial projects, apps, and merchandise.' },
  { q: 'Do you have annual billing?', a: 'Yes! Pay annually and save 2 months. Switch any time from your account settings.' },
]

export default function PremiumPage() {
  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-center py-20">
        <div className="hero-glow hero-glow-1" style={{ opacity: 0.6 }} aria-hidden="true" />
        <div className="hero-glow hero-glow-2" style={{ opacity: 0.4 }} aria-hidden="true" />
        <div className="container-app relative z-10 max-w-3xl mx-auto space-y-5">
          <div className="badge badge-premium w-fit mx-auto text-sm px-5 py-2">★ Premium Plans</div>
          <h1 className="heading-display">
            Unlock the Full<br />
            <span className="text-gradient">WallVerse</span> Experience
          </h1>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            Get unlimited AI generations, 4K &amp; 8K downloads, and exclusive features that elevate your entire setup.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section className="container-app max-w-6xl pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`plan-card ${plan.featured ? 'plan-card-featured' : ''}`}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-white text-xs font-bold whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, var(--color-violet), var(--color-pink))' }}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1.5">
                  <span className="text-5xl font-black" style={{ color: plan.featured ? 'var(--foreground)' : plan.color }}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-[var(--text-muted)] mb-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: f.ok ? 'rgba(124,58,237,0.2)' : 'rgba(100,100,100,0.1)',
                        color: f.ok ? 'var(--color-violet-lt)' : 'var(--text-muted)',
                      }}
                      aria-hidden="true"
                    >
                      {f.ok ? '✓' : '×'}
                    </span>
                    <span className={f.ok ? '' : 'text-[var(--text-muted)] line-through'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full py-3.5 text-center rounded-full font-bold text-sm transition-all hover:scale-105 ${
                  plan.featured ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center mt-8 text-sm text-[var(--text-muted)]">
          All paid plans include a 7-day free trial. No credit card required for Free tier.
        </p>
      </section>

      <hr className="divider-gradient mx-8" />

      {/* ── Feature comparison highlights ── */}
      <section className="container-app max-w-4xl py-20">
        <h2 className="heading-section text-center mb-12">Why Go Premium?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: '✦', title: '100× More AI Power',     desc: 'Generate 100 AI wallpapers per month, with priority queue and faster speeds.' },
            { icon: '◉', title: '4K & 8K Downloads',       desc: 'Download every wallpaper in native 4K and 8K resolution — crystal clear on any display.' },
            { icon: '◈', title: 'Unlimited Collections',   desc: 'Create unlimited private and public collections to organise your perfect library.' },
            { icon: '★', title: 'Exclusive Drops',         desc: 'Premium users get first access to our hand-curated designer drops before anyone else.' },
          ].map(f => (
            <div key={f.title} className="glass-card glass-card-glow p-6 flex gap-4">
              <div
                className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.18))', border: '1px solid var(--border-strong)' }}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider-gradient mx-8" />

      {/* ── FAQ ── */}
      <section className="container-app max-w-2xl py-20">
        <h2 className="heading-section text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQ.map(faq => (
            <details key={faq.q} className="glass-card p-5 group">
              <summary className="font-semibold cursor-pointer flex justify-between items-center list-none">
                {faq.q}
                <span className="text-[var(--text-muted)] group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

    </div>
  )
}
