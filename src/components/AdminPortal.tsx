import { useEffect, useState } from 'react'
import BusinessUpload from './BusinessUpload'
import { API_BASE_URL } from '../config/api'

interface AdminPortalProps {
  token: string
  onLogout: () => void
  onBack?: () => void
}

interface AdminMetrics {
  totalUsers: number
  totalEvents: number
  totalBusinesses: number
  totalRegistrations: number
  pendingBusinesses: number
  pendingEvents?: number
  pendingListings?: number
}

interface AdminAttendee {
  id?: string
  username?: string
  email?: string
  area?: string
  workOrSchool?: string
}

interface AdminEvent {
  id: string
  title: string
  date: string
  category: string
  location: string
  organizer: string
  organizerProfile?: {
    id?: string
    username?: string
    email?: string
    area?: string
    workOrSchool?: string
  } | null
  attendeeCount: number
  attendees: AdminAttendee[]
  moderationStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string | null
  reviewedAt?: string | null
}

interface AdminListing {
  id: string
  title: string
  price: number
  category: string
  location: string
  status: string
  moderationStatus: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string | null
  createdAt?: string
  seller?: {
    id?: string
    username?: string
    email?: string
    area?: string
    workOrSchool?: string
  } | null
}

interface AdminBusiness {
  id: string
  businessName: string
  category: string
  status: 'draft' | 'active' | 'inactive'
  verified: boolean
  rating?: number
  views?: number
  createdAt?: string
  owner?: {
    id?: string
    username?: string
    email?: string
    area?: string
    workOrSchool?: string
  } | null
}

const STATUS_OPTIONS: Array<AdminBusiness['status']> = [
  'draft',
  'active',
  'inactive',
]

const formatDate = (value: string | Date | undefined) => {
  if (!value) return 'N/A'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminPortal({ token, onLogout, onBack }: AdminPortalProps) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [listings, setListings] = useState<AdminListing[]>([])
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [updatingBusinessId, setUpdatingBusinessId] = useState<string | null>(
    null,
  )
  const [moderatingEventId, setModeratingEventId] = useState<string | null>(null)
  const [moderatingListingId, setModeratingListingId] = useState<string | null>(null)
  const [showBusinessUpload, setShowBusinessUpload] = useState(false)

  const fetchJson = async (
    path: string,
    options: RequestInit = {},
  ): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    return data
  }

  const loadAdminData = async () => {
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    try {
      const [overviewData, eventsData, businessesData, listingsData] = await Promise.all([
        fetchJson('/admin/overview'),
        fetchJson('/admin/events'),
        fetchJson('/admin/businesses'),
        fetchJson('/admin/marketplace'),
      ])

      setMetrics(overviewData.metrics)
      setEvents(eventsData.events || [])
      setBusinesses(businessesData.businesses || [])
      setListings(listingsData.listings || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [token])

  const handleUpdateBusiness = async (
    businessId: string,
    updates: Partial<Pick<AdminBusiness, 'status' | 'verified'>>,
  ) => {
    setUpdatingBusinessId(businessId)
    setError(null)
    try {
      const response = await fetchJson(
        `/admin/businesses/${businessId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        },
      )

      setBusinesses((prev) =>
        prev.map((business) =>
          business.id === businessId
            ? { ...business, ...response.business }
            : business,
        ),
      )
      setStatusMessage('Business details updated successfully.')
    } catch (err: any) {
      setError(err.message || 'Failed to update business')
    } finally {
      setUpdatingBusinessId(null)
    }
  }

  const handleEventModeration = async (
    eventId: string,
    status: 'approved' | 'rejected',
  ) => {
    setModeratingEventId(eventId)
    setError(null)
    try {
      const targetEvent = events.find((event) => event.id === eventId)
      const wasPending = targetEvent?.moderationStatus === 'pending'

      let rejectionReason: string | undefined
      if (status === 'rejected') {
        rejectionReason = window
          .prompt('Share a short note for the organiser? (optional)', '')
          ?.trim()
      }

      const response = await fetchJson(`/admin/events/${eventId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason }),
      })

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                moderationStatus: status,
                rejectionReason: response.event.rejectionReason ?? null,
                reviewedAt: response.event.reviewedAt ?? new Date().toISOString(),
              }
            : event,
        ),
      )
      setStatusMessage(
        status === 'approved'
          ? 'Event approved successfully.'
          : 'Event rejected successfully.',
      )

      if (wasPending) {
        setMetrics((prev) =>
          prev
            ? {
                ...prev,
                pendingEvents: Math.max(0, (prev.pendingEvents ?? 0) - 1),
              }
            : prev,
        )
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update event status')
    } finally {
      setModeratingEventId(null)
    }
  }

  const handleListingModeration = async (
    listingId: string,
    status: 'approved' | 'rejected',
  ) => {
    setModeratingListingId(listingId)
    setError(null)
    try {
      const targetListing = listings.find((listing) => listing.id === listingId)
      const wasPending = targetListing?.moderationStatus === 'pending'

      let rejectionReason: string | undefined
      if (status === 'rejected') {
        rejectionReason = window
          .prompt('Share a short note for the seller? (optional)', '')
          ?.trim()
      }

      const response = await fetchJson(`/admin/marketplace/${listingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason }),
      })

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                moderationStatus: status,
                rejectionReason: response.listing.rejectionReason ?? null,
                status: response.listing.status ?? listing.status,
              }
            : listing,
        ),
      )
      setStatusMessage(
        status === 'approved'
          ? 'Listing approved successfully.'
          : 'Listing rejected successfully.',
      )

      if (wasPending) {
        setMetrics((prev) =>
          prev
            ? {
                ...prev,
                pendingListings: Math.max(0, (prev.pendingListings ?? 0) - 1),
              }
            : prev,
        )
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update listing status')
    } finally {
      setModeratingListingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Admin Console • Internal
            </p>
            <h1 className="text-2xl font-black text-white md:text-3xl">Pomi Community Oversight</h1>
            <p className="max-w-2xl text-sm text-white/70 md:text-base">
              Review marketplace activity, approve businesses, and keep upcoming events running smoothly. Use the quick actions to refresh data or export reports.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadAdminData}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              🔄 Refresh data
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                ← Back to access
              </button>
            )}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-10">
        {loading && (
          <div className="py-24 text-center text-white/70">
            <div className="mb-6 text-5xl animate-spin">🌀</div>
            Loading the latest metrics…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50/90 px-6 py-4 text-sm font-semibold text-red-700 shadow-lg shadow-red-500/30">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-12">
            {/* Metrics Overview */}
            <section>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Executive snapshot</h2>
                  <p className="text-sm text-white/60">
                    Key health metrics across the marketplace, events, and business directory.
                  </p>
                </div>
              </div>
              {statusMessage && (
                <div className="mb-4 rounded-3xl border border-emerald-300/40 bg-emerald-500/10 px-6 py-4 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-900/30 backdrop-blur">
                  {statusMessage}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
                <SummaryCard
                  title="Community Members"
                  value={metrics?.totalUsers ?? 0}
                  icon="👥"
                  accent="from-red-500 to-orange-500"
                />
                <SummaryCard
                  title="Active Events"
                  value={metrics?.totalEvents ?? 0}
                  icon="🎉"
                  accent="from-orange-500 to-amber-500"
                />
                <SummaryCard
                  title="Business Listings"
                  value={metrics?.totalBusinesses ?? 0}
                  icon="🏢"
                  accent="from-amber-500 to-yellow-500"
                />
                <SummaryCard
                  title="Total RSVPs"
                  value={metrics?.totalRegistrations ?? 0}
                  icon="📝"
                  accent="from-emerald-500 to-teal-500"
                />
                <SummaryCard
                  title="Pending Businesses"
                  value={metrics?.pendingBusinesses ?? 0}
                  icon="⏳"
                  accent="from-blue-500 to-indigo-500"
                />
                <SummaryCard
                  title="Pending Events"
                  value={metrics?.pendingEvents ?? 0}
                  icon="🕒"
                  accent="from-purple-500 to-violet-500"
                />
                <SummaryCard
                  title="Pending Listings"
                  value={metrics?.pendingListings ?? 0}
                  icon="🛒"
                  accent="from-fuchsia-500 to-pink-500"
                />
                </div>
              </section>

              {/* Marketplace Moderation */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-black text-white">
                      <span className="text-2xl">🛒</span> Marketplace moderation
                    </h3>
                    <p className="text-sm text-white/60">
                      Approve community submissions before they appear in the marketplace feed.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                    {listings.length} submissions
                  </span>
                </div>

                {listings.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur">
                    No marketplace submissions yet. Encourage members to share their listings.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {listings.map((listing) => {
                      const status = listing.moderationStatus || 'approved'
                      const isPending = status === 'pending'
                      const isRejected = status === 'rejected'
                      const statusLabel =
                        status === 'approved'
                          ? 'Approved'
                          : status === 'pending'
                            ? 'Pending review'
                            : 'Rejected'
                      const statusClasses =
                        status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40'
                          : status === 'pending'
                            ? 'bg-amber-500/15 text-amber-200 border border-amber-400/40'
                            : 'bg-rose-500/15 text-rose-200 border border-rose-400/40'

                      return (
                        <article
                          key={listing.id}
                          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold uppercase tracking-wide ${statusClasses}`}>
                              {statusLabel}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {status !== 'approved' && (
                                <button
                                  onClick={() => handleListingModeration(listing.id, 'approved')}
                                  disabled={moderatingListingId === listing.id}
                                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  ✅ Approve
                                </button>
                              )}
                              {status !== 'rejected' && (
                                <button
                                  onClick={() => handleListingModeration(listing.id, 'rejected')}
                                  disabled={moderatingListingId === listing.id}
                                  className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  ✖ Reject
                                </button>
                              )}
                            </div>
                          </div>

                          {isRejected && listing.rejectionReason && (
                            <p className="mt-3 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                              Rejection note: {listing.rejectionReason}
                            </p>
                          )}

                          <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr,1fr]">
                            <div className="space-y-3 text-sm text-white/80">
                              <div>
                                <p className="text-lg font-semibold text-white">{listing.title}</p>
                                <p className="text-sm text-white/60">
                                  {listing.category.toUpperCase()} • {listing.location}
                                </p>
                              </div>
                              <p className="text-2xl font-black text-white">
                                {new Intl.NumberFormat('en-CA', {
                                  style: 'currency',
                                  currency: 'CAD',
                                  maximumFractionDigits: 0,
                                }).format(listing.price)}
                              </p>
                              <p className="text-xs text-white/50">
                                Submitted {formatDate(listing.createdAt)}
                              </p>
                            </div>

                            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                              <p className="font-semibold uppercase tracking-[0.3em] text-white/50">
                                Seller
                              </p>
                              {listing.seller ? (
                                <div className="space-y-1">
                                  <p className="text-white">{listing.seller.username || 'Member'}</p>
                                  <p>{listing.seller.email || '—'}</p>
                                  <p>{[listing.seller.area, listing.seller.workOrSchool].filter(Boolean).join(' • ') || '—'}</p>
                                </div>
                              ) : (
                                <p>No seller details available.</p>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Events Overview */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-black text-white">
                      <span className="text-2xl">📅</span> Event registrations
                    </h3>
                    <p className="text-sm text-white/60">
                      Upcoming gatherings curated by the community team.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                    {events.length} tracked
                  </span>
                </div>

                {events.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur">
                    No events to review yet. Encourage organisers to submit upcoming meetups.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {events.map((event) => {
                      const status = event.moderationStatus || 'approved'
                      const isPending = status === 'pending'
                      const isRejected = status === 'rejected'
                      const statusLabel =
                        status === 'approved'
                          ? 'Approved'
                          : status === 'pending'
                            ? 'Pending review'
                            : 'Rejected'
                      const statusClasses =
                        status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40'
                          : status === 'pending'
                            ? 'bg-amber-500/15 text-amber-200 border border-amber-400/40'
                            : 'bg-rose-500/15 text-rose-200 border border-rose-400/40'

                      return (
                        <article
                          key={event.id}
                          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold uppercase tracking-wide ${statusClasses}`}>
                              {statusLabel}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {status !== 'approved' && (
                                <button
                                  onClick={() => handleEventModeration(event.id, 'approved')}
                                  disabled={moderatingEventId === event.id}
                                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  ✅ Approve
                                </button>
                              )}
                              {status !== 'rejected' && (
                                <button
                                  onClick={() => handleEventModeration(event.id, 'rejected')}
                                  disabled={moderatingEventId === event.id}
                                  className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  ✖ Reject
                                </button>
                              )}
                            </div>
                          </div>

                          {isRejected && event.rejectionReason && (
                            <p className="mt-3 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                              Rejection note: {event.rejectionReason}
                            </p>
                          )}

                          <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr,1fr]">
                            <dl className="grid gap-3 text-sm text-white/80">
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                                  Title
                                </dt>
                                <dd className="text-lg font-semibold text-white">
                                  {event.title}
                                </dd>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-white/60">
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                                  {event.category.toUpperCase()}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                                  {formatDate(event.date)}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                                  📍 {event.location}
                                </span>
                              </div>
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                                  Organiser
                                </dt>
                                <dd className="text-sm text-white/80">
                                  {event.organizerProfile?.username || event.organizer}
                                  {event.organizerProfile?.email && (
                                    <span className="text-white/50">
                                      {' '}
                                      • {event.organizerProfile.email}
                                    </span>
                                  )}
                                </dd>
                              </div>
                            </dl>

                            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between text-sm font-semibold text-white">
                                <span>{event.attendeeCount} RSVP</span>
                                {event.attendeeCount === 0 && (
                                  <span className="text-xs text-white/60">
                                    Encourage more promotion
                                  </span>
                                )}
                              </div>
                              {event.attendees.length > 0 ? (
                                <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
                                  <table className="w-full text-left text-xs text-white/80">
                                    <tbody>
                                      {event.attendees.map((attendee, index) => (
                                        <tr key={`${attendee.id ?? index}`} className="border-b border-white/10 last:border-b-0">
                                          <td className="px-4 py-2 font-semibold text-white">
                                            {attendee.username || 'Member'}
                                          </td>
                                          <td className="px-4 py-2 text-white/60">
                                            {attendee.email || '—'}
                                          </td>
                                          <td className="px-4 py-2 text-white/60">
                                            {[attendee.area, attendee.workOrSchool].filter(Boolean).join(' • ') || '—'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <p className="text-xs text-white/60">
                                  No RSVP data yet.
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Business Management */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-black text-white">
                      <span className="text-2xl">🏢</span> Business directory management
                    </h3>
                    <p className="text-sm text-white/60">
                      Approve listings, verify ownership, and track traction.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBusinessUpload(!showBusinessUpload)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30"
                    >
                      {showBusinessUpload ? '✕ Cancel' : '+ Add Business'}
                    </button>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                      {businesses.length} submissions
                    </span>
                  </div>
                </div>

                {showBusinessUpload && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
                    <BusinessUpload
                      onSuccess={() => {
                        setShowBusinessUpload(false)
                        loadAdminData()
                      }}
                      onCancel={() => setShowBusinessUpload(false)}
                    />
                  </div>
                )}

                {businesses.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur">
                    No business listings yet. They will appear here once submitted.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {businesses.map((business) => (
                      <article
                        key={business.id}
                        className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1"
                      >
                        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr,1fr]">
                          <dl className="space-y-3 text-sm text-white/80">
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                                Business name
                              </dt>
                              <dd className="text-lg font-semibold text-white">
                                {business.businessName}
                              </dd>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-white/60">
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                                {business.category}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                                Submitted {formatDate(business.createdAt || undefined)}
                              </span>
                            </div>
                            {business.owner && (
                              <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                                  Owner
                                </dt>
                                <dd className="text-sm text-white/80">
                                  {business.owner.username}
                                  {business.owner.email && (
                                    <span className="text-white/50"> • {business.owner.email}</span>
                                  )}
                                </dd>
                              </div>
                            )}
                          </dl>

                          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                              Listing status
                            </label>
                            <select
                              value={business.status}
                              onChange={(event) =>
                                handleUpdateBusiness(business.id, {
                                  status: event.target.value as AdminBusiness['status'],
                                })
                              }
                              disabled={updatingBusinessId === business.id || loading}
                              className="w-full rounded-xl border border-white/20 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-white/80 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                              Verification
                            </label>
                            <button
                              onClick={() =>
                                handleUpdateBusiness(business.id, {
                                  verified: !business.verified,
                                })
                              }
                              disabled={updatingBusinessId === business.id || loading}
                              className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                business.verified
                                  ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                              }`}
                            >
                              {business.verified ? 'Verified' : 'Mark as verified'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
    </div>
  );
}

interface SummaryCardProps {
  title: string
  value: number
  icon: string
  accent: string
}

function SummaryCard({ title, value, icon, accent }: SummaryCardProps) {
  return (
    <div
      className={`rounded-3xl border border-white/15 bg-gradient-to-br ${accent} p-5 text-white shadow-lg shadow-slate-900/40`}
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
        {title}
      </p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  )
}
