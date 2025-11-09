import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import authService from '../services/authService'

interface Business {
  _id: string
  businessName: string
  description: string
  category: string
  phone?: string
  email?: string
  address?: string
  images?: string[]
  featuredImage?: string
  verified: boolean
  status: 'draft' | 'active' | 'inactive'
  ownerName: string
  createdAt: string
}

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  retail: 'Retail & Shopping',
  restaurant: 'Food & Hospitality',
  services: 'Services',
  healthcare: 'Healthcare',
  education: 'Education',
  technology: 'Technology',
  finance: 'Finance',
  entertainment: 'Entertainment',
  other: 'Other',
}

const ADMIN_CONTACT_EMAIL = 'marakihay@gmail.com'

export default function BusinessDirectoryPage() {
  const currentUser = authService.getUserData()
  const isAdmin = Boolean(currentUser?.isAdmin)

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSector, setActiveSector] = useState<string>('All')

  // Fetch businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get('/api/v1/businesses', {
          params: {
            status: 'active',
            limit: 100,
          },
        })
        const activeBusinesses = response.data.data || response.data
        setBusinesses(Array.isArray(activeBusinesses) ? activeBusinesses : [])
      } catch (err) {
        console.error('Failed to fetch businesses:', err)
        setError('Failed to load businesses. Please try again later.')
        setBusinesses([])
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  const sectors = useMemo(() => {
    const unique = new Set(
      businesses
        .filter((b) => b.status === 'active')
        .map((business) => CATEGORY_DISPLAY_MAP[business.category] || business.category)
    )
    return ['All', ...Array.from(unique).sort()]
  }, [businesses])

  const filteredBusinesses = useMemo(() => {
    const active = businesses.filter((b) => b.status === 'active')
    if (activeSector === 'All') {
      return active
    }
    return active.filter((business) => {
      const displayCategory = CATEGORY_DISPLAY_MAP[business.category] || business.category
      return displayCategory === activeSector
    })
  }, [activeSector, businesses])

  const verifiedCount = useMemo(() => businesses.filter((b) => b.verified && b.status === 'active').length, [businesses])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            ← Home
          </Link>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Business directory</p>
            <h1 className="text-xl font-black text-white">Find and support Habesha-owned businesses</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <section className="space-y-6 rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr] lg:items-start">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                  Curated & approved by the admin team
                </span>
                <h2 className="text-3xl font-black text-white md:text-4xl">
                  Explore trusted services, eateries, creatives, and cultural educators.
                </h2>
                <p className="text-sm text-slate-200 md:text-base">
                  Every listing is reviewed with the business owner to verify offerings, contact details, and community
                  alignment. Tap a card to learn more and reach out directly.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                    {businesses.filter((b) => b.status === 'active').length} active businesses
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                    {verifiedCount} verified
                  </span>
                </div>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-slate-200 shadow-inner shadow-slate-900/40">
                <p className="font-semibold text-white">Want to be listed?</p>
                <p>
                  Send your business details, logo, and proof of services to{' '}
                  <a
                    href={`mailto:${ADMIN_CONTACT_EMAIL}`}
                    className="font-semibold text-white underline decoration-rose-300/60 underline-offset-4"
                  >
                    {ADMIN_CONTACT_EMAIL}
                  </a>{' '}
                  and the admin team will review within 48 hours.
                </p>
                {isAdmin && (
                  <p className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                    Admin view: Use the console to add or manage businesses after verification calls.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {sectors.map((sector) => {
                const isActive = sector === activeSector
                return (
                  <button
                    key={sector}
                    onClick={() => setActiveSector(sector)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/40'
                        : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {sector}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="space-y-6">
            {loading && (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-sm text-slate-200">
                Loading businesses...
              </div>
            )}

            {error && (
              <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 p-10 text-center text-sm text-rose-100">
                {error}
              </div>
            )}

            {!loading && !error && filteredBusinesses.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredBusinesses.map((business) => (
                  <article
                    key={business._id}
                    className="flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-[0_20px_40px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-1 hover:border-white/20"
                  >
                    {/* Featured Image */}
                    {business.featuredImage && (
                      <div className="aspect-video w-full overflow-hidden bg-slate-900">
                        <img
                          src={business.featuredImage}
                          alt={business.businessName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-4 px-6 pb-6 pt-6">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                            {CATEGORY_DISPLAY_MAP[business.category] || business.category}
                          </p>
                          <h3 className="mt-2 text-2xl font-black text-white">{business.businessName}</h3>
                        </div>
                        {business.verified && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                            ✅ Verified
                          </span>
                        )}
                      </div>

                      <p className="text-sm leading-relaxed text-slate-200">{business.description}</p>

                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Contact</p>
                        {business.address && <p className="mt-1 text-slate-100">{business.address}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-200">
                          {business.email && (
                            <a
                              href={`mailto:${business.email}?subject=Pomi%20Business%20Directory%20Inquiry:%20${encodeURIComponent(
                                business.businessName
                              )}`}
                              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:border-rose-300 hover:text-rose-100"
                            >
                              📧 Email
                            </a>
                          )}
                          {business.phone && (
                            <a
                              href={`tel:${business.phone.replace(/[^\d]/g, '')}`}
                              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-semibold text-white transition hover:border-rose-300 hover:text-rose-100"
                            >
                              📞 {business.phone}
                            </a>
                          )}
                        </div>
                        <p className="mt-3 text-xs text-white/50">
                          Listed businesses have verified their services with the Pomi admin team. Let us know if any
                          details need an update.
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && !error && filteredBusinesses.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-sm text-slate-200">
                No businesses in this category yet. Recommend one by emailing{' '}
                <a
                  href={`mailto:${ADMIN_CONTACT_EMAIL}`}
                  className="font-semibold text-white underline decoration-rose-300/60 underline-offset-4"
                >
                  {ADMIN_CONTACT_EMAIL}
                </a>
                .
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
