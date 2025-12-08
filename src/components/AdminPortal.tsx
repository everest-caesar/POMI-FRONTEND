import { useEffect, useMemo, useState } from 'react'
import BusinessUpload from './BusinessUpload'
import EventCreationForm from './EventCreationForm'
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
  description?: string
  date: string
  category: string
  location: string
  startTime?: string
  endTime?: string
  maxAttendees?: number | null
  tags?: string[]
  price?: number | null
  isFree?: boolean
  ticketLink?: string | null
  socialMediaLink?: string | null
  image?: string | null
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

interface CommunityMember {
  id: string
  username: string
  email: string
  area?: string
  workOrSchool?: string
  age?: number
  isAdmin: boolean
  joinedAt: string
}

interface AdminMessage {
  id: string
  recipientId?: string | null
  recipientName?: string | null
  content: string
  createdAt: string
}

type SectionErrors = {
  overview: string | null
  events: string | null
  businesses: string | null
  listings: string | null
  users: string | null
  messages: string | null
}

const createEmptySectionErrors = (): SectionErrors => ({
  overview: null,
  events: null,
  businesses: null,
  listings: null,
  users: null,
  messages: null,
})

type AdminSection = 'overview' | 'marketplace' | 'events' | 'businesses' | 'members' | 'messaging'

const getErrorMessage = (reason: unknown): string => {
  if (reason instanceof Error) return reason.message
  if (typeof reason === 'string') return reason
  if (reason && typeof reason === 'object' && 'message' in reason) {
    return String((reason as any).message)
  }
  return 'Unable to load this section. Please try again.'
}

const generateLocalId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const mapAdminMessages = (rawMessages: any[]): AdminMessage[] =>
  rawMessages.map((message) => ({
    id: message?._id?.toString?.() || message?.id || generateLocalId(),
    recipientId:
      message?.recipientId?.toString?.() || message?.recipientId || null,
    recipientName: message?.recipientName || 'Community member',
    content: message?.content || '',
    createdAt: message?.createdAt || new Date().toISOString(),
  }))

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

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value)
}

const formatRelativeTimestamp = (value?: Date | string | null) => {
  if (!value) return 'Awaiting sync'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }
  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) {
    const minutes = Math.floor(diff / 60_000)
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000)
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
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
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([])
  const [adminInboxMessages, setAdminInboxMessages] = useState<any[]>([])
  const [unreadUserMessages, setUnreadUserMessages] = useState(0)
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectionErrors, setSectionErrors] = useState<SectionErrors>(
    createEmptySectionErrors(),
  )
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [updatingBusinessId, setUpdatingBusinessId] = useState<string | null>(
    null,
  )
  const [moderatingEventId, setModeratingEventId] = useState<string | null>(null)
  const [moderatingListingId, setModeratingListingId] = useState<string | null>(null)
  const [showBusinessUpload, setShowBusinessUpload] = useState(false)
  const [showEventCreation, setShowEventCreation] = useState(false)
  const [showPendingEventsOnly, setShowPendingEventsOnly] = useState(true)
  const [showPendingListingsOnly, setShowPendingListingsOnly] = useState(true)
  const [memberQuery, setMemberQuery] = useState('')
  const [memberSearchApplied, setMemberSearchApplied] = useState(false)
  const [membersTotal, setMembersTotal] = useState<number | null>(null)
  const [isSearchingMembers, setIsSearchingMembers] = useState(false)
  const [messageForm, setMessageForm] = useState({ recipientId: '', content: '' })
  const [broadcastContent, setBroadcastContent] = useState('')
  const [messagingFeedback, setMessagingFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [messagingLoading, setMessagingLoading] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [downloadingSnapshot, setDownloadingSnapshot] = useState(false)

  const filteredEvents = useMemo(
    () =>
      showPendingEventsOnly
        ? events.filter((event) => event.moderationStatus === 'pending')
        : events,
    [events, showPendingEventsOnly],
  )

  const filteredListings = useMemo(
    () =>
      showPendingListingsOnly
        ? listings.filter((listing) => listing.moderationStatus === 'pending')
        : listings,
    [listings, showPendingListingsOnly],
  )

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

  const fetchAdminUsersData = (searchTerm?: string) => {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
    return fetchJson(`/admin/users${query}`)
  }

  const fetchAdminMessagesData = () => fetchJson('/admin/messages')
  const fetchAdminInboxData = () => fetchJson('/admin/messages/inbox')

  const loadAdminData = async () => {
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    const nextErrors = createEmptySectionErrors()
    try {
      const [
        overviewResult,
        eventsResult,
        businessesResult,
        listingsResult,
        usersResult,
        messagesResult,
        inboxResult,
      ] = await Promise.allSettled<any>([
        fetchJson('/admin/overview'),
        fetchJson('/admin/events'),
        fetchJson('/admin/businesses'),
        fetchJson('/admin/marketplace'),
        fetchAdminUsersData(),
        fetchAdminMessagesData(),
        fetchAdminInboxData(),
      ])

      if (overviewResult.status === 'fulfilled') {
        setMetrics(overviewResult.value.metrics)
      } else {
        setMetrics(null)
        nextErrors.overview = getErrorMessage(overviewResult.reason)
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value.events || [])
      } else {
        setEvents([])
        nextErrors.events = getErrorMessage(eventsResult.reason)
      }

      if (businessesResult.status === 'fulfilled') {
        setBusinesses(businessesResult.value.businesses || [])
      } else {
        setBusinesses([])
        nextErrors.businesses = getErrorMessage(businessesResult.reason)
      }

      if (listingsResult.status === 'fulfilled') {
        setListings(listingsResult.value.listings || [])
      } else {
        setListings([])
        nextErrors.listings = getErrorMessage(listingsResult.reason)
      }

      if (usersResult.status === 'fulfilled') {
        setMembers(usersResult.value.users || [])
        setMembersTotal(
          usersResult.value.pagination?.total ??
            usersResult.value.users?.length ??
            null,
        )
        setMemberSearchApplied(false)
      } else {
        setMembers([])
        setMembersTotal(null)
        nextErrors.users = getErrorMessage(usersResult.reason)
      }

      if (messagesResult.status === 'fulfilled') {
        setAdminMessages(mapAdminMessages(messagesResult.value.data || []))
      } else {
        setAdminMessages([])
        nextErrors.messages = getErrorMessage(messagesResult.reason)
      }

      if (inboxResult.status === 'fulfilled') {
        const inboxMessages = inboxResult.value.data || []
        setAdminInboxMessages(inboxMessages)
        setUnreadUserMessages(
          inboxMessages.filter((message: any) => !message.isRead).length,
        )
      } else {
        setAdminInboxMessages([])
        setUnreadUserMessages(0)
      }

      setLastUpdatedAt(new Date())

      const fatal = Object.values(nextErrors).every((msg) => Boolean(msg))
      setError(
        fatal ? 'Failed to load admin data. Please try again.' : null,
      )
    } finally {
      setSectionErrors(nextErrors)
      setLoading(false)
    }
  }

  const refreshMembers = async (searchTerm?: string) => {
    const term = searchTerm?.trim()
    setIsSearchingMembers(true)
    setSectionErrors((prev) => ({ ...prev, users: null }))
    try {
      const response = await fetchAdminUsersData(term)
      setMembers(response.users || [])
      setMembersTotal(
        response.pagination?.total ?? response.users?.length ?? null,
      )
      setMemberSearchApplied(Boolean(term))
    } catch (err: any) {
      setSectionErrors((prev) => ({
        ...prev,
        users: err.message || 'Failed to load community members',
      }))
    } finally {
      setIsSearchingMembers(false)
    }
  }

  const handleMemberSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await refreshMembers(memberQuery)
  }

  const handleClearMemberSearch = async () => {
    setMemberQuery('')
    await refreshMembers()
  }

  const refreshAdminInbox = async () => {
    try {
      const response = await fetchAdminInboxData()
      const inboxMessages = response.data || []
      setAdminInboxMessages(inboxMessages)
      setUnreadUserMessages(
        inboxMessages.filter((message: any) => !message.isRead).length,
      )
    } catch (err: any) {
      setSectionErrors((prev) => ({
        ...prev,
        messages: err.message || 'Failed to load admin messages',
      }))
    }
  }

  const refreshAdminMessagesList = async () => {
    try {
      const response = await fetchAdminMessagesData()
      setAdminMessages(mapAdminMessages(response.data || []))
      setSectionErrors((prev) => ({ ...prev, messages: null }))
      await refreshAdminInbox()
    } catch (err: any) {
      setSectionErrors((prev) => ({
        ...prev,
        messages: err.message || 'Failed to load admin messages',
      }))
    }
  }

  const handleTargetedMessageSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (!messageForm.recipientId || !messageForm.content.trim()) {
      setMessagingFeedback({
        type: 'error',
        message: 'Select a recipient and write a message before sending.',
      })
      return
    }

    setMessagingLoading(true)
    setMessagingFeedback(null)
    try {
      await fetchJson('/admin/messages', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: messageForm.recipientId,
          content: messageForm.content.trim(),
        }),
      })
      setMessagingFeedback({
        type: 'success',
        message: 'Message sent to the member.',
      })
      setMessageForm({ recipientId: '', content: '' })
      await refreshAdminMessagesList()
    } catch (err: any) {
      setMessagingFeedback({
        type: 'error',
        message: err.message || 'Failed to send the message',
      })
    } finally {
      setMessagingLoading(false)
    }
  }

  const handleBroadcastMessageSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (!broadcastContent.trim()) {
      setMessagingFeedback({
        type: 'error',
        message: 'Write a message before broadcasting to the community.',
      })
      return
    }

    setMessagingLoading(true)
    setMessagingFeedback(null)
    try {
      await fetchJson('/admin/messages/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          content: broadcastContent.trim(),
        }),
      })
      setMessagingFeedback({
        type: 'success',
        message: 'Broadcast queued for all community members.',
      })
      setBroadcastContent('')
      await refreshAdminMessagesList()
    } catch (err: any) {
      setMessagingFeedback({
        type: 'error',
        message: err.message || 'Failed to broadcast the message',
      })
    } finally {
      setMessagingLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [token])

  const handleDownloadSnapshot = () => {
    try {
      setDownloadingSnapshot(true)
      const snapshot = {
        generatedAt: new Date().toISOString(),
        metrics,
        totals: {
          events: events.length,
          listings: listings.length,
          businesses: businesses.length,
          members: membersTotal ?? members.length,
        },
        queues: {
          pendingEvents: metrics?.pendingEvents ?? 0,
          pendingListings: metrics?.pendingListings ?? 0,
          pendingBusinesses: metrics?.pendingBusinesses ?? 0,
        },
      }
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: 'application/json',
      })
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `pomi-admin-snapshot-${Date.now()}.json`
      anchor.click()
      URL.revokeObjectURL(downloadUrl)
      setStatusMessage('Snapshot downloaded successfully.')
    } catch (err: any) {
      setError(err?.message || 'Failed to export snapshot')
    } finally {
      setTimeout(() => setDownloadingSnapshot(false), 400)
    }
  }

  const jumpToEvents = () => {
    setActiveSection('events')
    setShowEventCreation(true)
  }

  const jumpToBusinesses = () => {
    setActiveSection('businesses')
    setShowBusinessUpload(true)
  }

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

  const pendingApprovals =
    (metrics?.pendingEvents ?? 0) +
    (metrics?.pendingBusinesses ?? 0) +
    (metrics?.pendingListings ?? 0)

  const lastUpdatedLabel = formatRelativeTimestamp(lastUpdatedAt)

  const quickActions = [
    {
      title: loading ? 'Refreshing data…' : 'Refresh console',
      description: 'Pulls the newest approvals, messages, and metrics.',
      icon: '↻',
      action: loadAdminData,
      disabled: loading,
    },
    {
      title: 'New event review',
      description: 'Jump to approvals and open the event composer.',
      icon: '🎟️',
      action: jumpToEvents,
    },
    {
      title: 'New business listing',
      description: 'Guide entrepreneurs through the verification flow.',
      icon: '🏢',
      action: jumpToBusinesses,
    },
    {
      title: downloadingSnapshot ? 'Exporting…' : 'Export snapshot',
      description: 'Download a JSON summary for reporting or audits.',
      icon: '⬇️',
      action: handleDownloadSnapshot,
      disabled: downloadingSnapshot,
    },
  ]

  const adminSections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Executive metrics & quick actions.',
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: '🛒',
      description: 'Approve listings & monitor status.',
    },
    {
      id: 'events',
      label: 'Events',
      icon: '🎉',
      description: 'Review RSVPs and moderation status.',
    },
    {
      id: 'businesses',
      label: 'Businesses',
      icon: '🏢',
      description: 'Create, verify, and publish business listings.',
    },
    {
      id: 'members',
      label: 'Members',
      icon: '👥',
      description: 'Search profiles and manage community roles.',
    },
    {
      id: 'messaging',
      label: 'Messaging',
      icon: '💬',
      description: 'Broadcast announcements and reply to members.',
    },
  ] as const

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">
                Pomi Admin • Private
              </p>
              <h1 className="text-2xl font-black text-white md:text-3xl">
                Community safety & marketplace intelligence
              </h1>
              <p className="max-w-2xl text-sm text-white/70 md:text-base">
                One dashboard to approve listings, issue announcements, and keep the Habesha community
                curated wherever members live. Every action is logged—use the controls below to jump to
                the queues that need attention first.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1">
                  <span className="text-white/80">⏱️ Last sync:</span> {lastUpdatedLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1">
                  <span className="text-white/80">📬 Pending approvals:</span> {pendingApprovals}
                </span>
                <button
                  onClick={() => {
                    setActiveSection('messaging')
                    void refreshAdminInbox()
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    unreadUserMessages > 0
                      ? 'bg-rose-500/20 text-rose-100 border border-rose-300/40 shadow-lg shadow-rose-900/20'
                      : 'border border-white/15 text-white/70 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <span>📨 Member inbox</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white">
                    {unreadUserMessages > 0 ? `${unreadUserMessages} new` : 'All clear'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5"
              >
                Log out
              </button>
            </div>
          </div>

        </div>
      </header>
      <div className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <nav className="flex flex-wrap gap-2">
            {adminSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-left text-sm font-semibold transition ${
                  activeSection === section.id
                    ? 'border-white/30 bg-white/10 text-white shadow-lg shadow-slate-900/30'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
                {section.id === 'messaging' && unreadUserMessages > 0 && (
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-100">
                    {unreadUserMessages}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/15 px-3 py-1">
              Events queue: {metrics?.pendingEvents ?? 0}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              Listings queue: {metrics?.pendingListings ?? 0}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1">
              Businesses queue: {metrics?.pendingBusinesses ?? 0}
            </span>
          </div>
        </div>
      </div>

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
            {activeSection === 'overview' && (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      onClick={action.action}
                      disabled={action.disabled}
                      className="flex flex-col items-start rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-left shadow-lg shadow-slate-900/30 transition hover:-translate-y-1 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <p className="mt-3 text-sm font-semibold text-white">{action.title}</p>
                      <p className="mt-1 text-xs text-white/70">{action.description}</p>
                    </button>
                  ))}
                </div>
                <section className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-white">Executive snapshot</h2>
                      <p className="text-sm text-white/60">
                        Key health metrics across the marketplace, events, and business directory.
                      </p>
                    </div>
                  </div>
                  {statusMessage && (
                    <div className="rounded-3xl border border-emerald-300/40 bg-emerald-500/10 px-6 py-4 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-900/30 backdrop-blur">
                      {statusMessage}
                    </div>
                  )}

                  {sectionErrors.overview ? (
                    <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
                      {sectionErrors.overview}
                    </div>
                  ) : (
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
                  )}
                </section>
              </>
            )}

            {activeSection === 'marketplace' && (
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
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/30 bg-transparent text-rose-400 focus:ring-rose-400"
                        checked={showPendingListingsOnly}
                        onChange={() =>
                          setShowPendingListingsOnly((prev) => !prev)
                        }
                      />
                      Pending only
                    </label>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                      {showPendingListingsOnly
                        ? `${filteredListings.length} pending`
                        : `${listings.length} submissions`}
                    </span>
                  </div>
                </div>

                {sectionErrors.listings ? (
                  <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
                    {sectionErrors.listings}
                  </div>
                ) : filteredListings.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur">
                    {showPendingListingsOnly && listings.length > 0
                      ? 'No pending marketplace submissions. Toggle the filter to review approved or rejected posts.'
                      : 'No marketplace submissions yet. Encourage members to share their listings.'}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredListings.map((listing) => {
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
            )}

            {activeSection === 'events' && (
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEventCreation(!showEventCreation)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30"
                    >
                      {showEventCreation ? '✕ Cancel' : '+ Create Event'}
                    </button>
                    <label className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/30 bg-transparent text-rose-400 focus:ring-rose-400"
                        checked={showPendingEventsOnly}
                        onChange={() =>
                          setShowPendingEventsOnly((prev) => !prev)
                        }
                      />
                      Pending only
                    </label>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                      {showPendingEventsOnly
                        ? `${filteredEvents.length} pending`
                        : `${events.length} tracked`}
                    </span>
                  </div>
                </div>

                {showEventCreation && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
                    <EventCreationForm
                      onSuccess={() => {
                        setShowEventCreation(false)
                        loadAdminData()
                      }}
                      onCancel={() => setShowEventCreation(false)}
                    />
                  </div>
                )}

                {sectionErrors.events ? (
                  <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
                    {sectionErrors.events}
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur">
                    {showPendingEventsOnly && events.length > 0
                      ? 'No pending events right now. Toggle the filter to review approved or rejected submissions.'
                      : 'No events to review yet. Encourage organisers to submit upcoming meetups.'}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredEvents.map((event) => {
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

                          {event.image && (
                            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                              <img
                                src={event.image}
                                alt={`${event.title} cover`}
                                className="h-56 w-full object-cover"
                              />
                            </div>
                          )}

                          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
                            <div className="space-y-4">
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
                                {(event.startTime || event.endTime || event.maxAttendees) && (
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                                    {(event.startTime || event.endTime) && (
                                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                                        ⏰ {event.startTime ?? 'TBD'}
                                        {event.endTime ? ` – ${event.endTime}` : ''}
                                      </span>
                                    )}
                                    {event.maxAttendees ? (
                                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                                        👥 Max {event.maxAttendees}
                                      </span>
                                    ) : null}
                                  </div>
                                )}
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
                                {event.description && (
                                  <div>
                                    <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                                      Description
                                    </dt>
                                    <dd className="text-sm text-white/70 whitespace-pre-line">
                                      {event.description}
                                    </dd>
                                  </div>
                                )}
                              </dl>

                              {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 text-[11px] text-white/60">
                                  {event.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 uppercase tracking-wide"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                                <div className="flex items-center justify-between text-white">
                                  <span>Pricing</span>
                                  <span className="font-semibold">
                                    {event.isFree || (!event.price && event.price !== 0)
                                      ? 'Free'
                                      : formatCurrency(event.price)}
                                  </span>
                                </div>
                                {typeof event.maxAttendees === 'number' && (
                                  <div className="flex items-center justify-between text-xs text-white/70">
                                    <span>Capacity</span>
                                    <span>{event.maxAttendees}</span>
                                  </div>
                                )}
                                {event.ticketLink && (
                                  <a
                                    href={event.ticketLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:border-emerald-300/60 hover:text-emerald-100"
                                  >
                                    🎟️ Ticket link
                                  </a>
                                )}
                                {event.socialMediaLink && (
                                  <a
                                    href={event.socialMediaLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:border-sky-300/60 hover:text-sky-100"
                                  >
                                    📣 Promo link
                                  </a>
                                )}
                              </div>

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
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {activeSection === 'businesses' && (
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
                      authToken={token}
                      onSuccess={() => {
                        setShowBusinessUpload(false)
                        loadAdminData()
                      }}
                      onCancel={() => setShowBusinessUpload(false)}
                    />
                  </div>
                )}

                {sectionErrors.businesses ? (
                  <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
                    {sectionErrors.businesses}
                  </div>
                ) : businesses.length === 0 ? (
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
            )}

            {activeSection === 'members' && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-black text-white">
                      <span className="text-2xl">👥</span> Community members
                    </h3>
                    <p className="text-sm text-white/60">
                      Manage and view all registered community members.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">
                    {memberSearchApplied
                      ? `${members.length} matching ${
                          members.length === 1 ? 'member' : 'members'
                        }`
                      : membersTotal
                        ? `${members.length} of ${membersTotal} members`
                        : `${members.length} members`}
                  </span>
                </div>

                <form onSubmit={handleMemberSearch} className="flex flex-wrap items-center gap-3">
                  <input
                    type="search"
                    value={memberQuery}
                    onChange={(event) => setMemberQuery(event.target.value)}
                    placeholder="Search by name, email, or area"
                    className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/90 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingMembers}
                    className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSearchingMembers ? 'Searching…' : 'Search'}
                  </button>
                  <button
                    type="button"
                    disabled={isSearchingMembers || (!memberSearchApplied && !memberQuery)}
                    onClick={() => void handleClearMemberSearch()}
                    className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reset
                  </button>
                </form>

                {sectionErrors.users ? (
                  <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
                    {sectionErrors.users}
                  </div>
                ) : members.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur">
                    {memberSearchApplied
                      ? 'No members matched this search. Try another term or reset the filter.'
                      : 'No community members yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-slate-900/40 backdrop-blur">
                    <table className="w-full text-sm text-white/80">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-6 py-4 text-left font-semibold text-white">Username</th>
                          <th className="px-6 py-4 text-left font-semibold text-white">Email</th>
                          <th className="px-6 py-4 text-left font-semibold text-white">Area</th>
                          <th className="px-6 py-4 text-left font-semibold text-white">Work/School</th>
                          <th className="px-6 py-4 text-left font-semibold text-white">Status</th>
                          <th className="px-6 py-4 text-left font-semibold text-white">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member, index) => (
                          <tr key={member.id} className={`border-b border-white/10 last:border-b-0 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                            <td className="px-6 py-4 font-semibold text-white">{member.username}</td>
                            <td className="px-6 py-4">{member.email}</td>
                            <td className="px-6 py-4">{member.area || '—'}</td>
                            <td className="px-6 py-4">{member.workOrSchool || '—'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                member.isAdmin
                                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40'
                                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                              }`}>
                                {member.isAdmin ? '👑 Admin' : 'Member'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/60">
                              {formatDate(member.joinedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeSection === 'messaging' && (
              <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-black text-white">
                      <span className="text-2xl">💬</span> Admin messaging
                    </h3>
                    <p className="text-sm text-white/60">
                      Send quick updates to members or broadcast announcements to the entire community.
                    </p>
                  </div>
                  <button
                    onClick={() => void refreshAdminMessagesList()}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    🔁 Refresh history
                  </button>
                </div>

                {messagingFeedback && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      messagingFeedback.type === 'error'
                        ? 'border-rose-300/40 bg-rose-500/10 text-rose-100'
                        : 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
                    }`}
                  >
                    {messagingFeedback.message}
                  </div>
                )}

                {sectionErrors.messages && (
                  <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {sectionErrors.messages}
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <form
                    onSubmit={handleTargetedMessageSubmit}
                    className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                        Direct message
                      </p>
                      <p>Reach out to an individual member with guidance or reminders.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                        Recipient
                      </label>
                      <select
                        value={messageForm.recipientId}
                        onChange={(event) =>
                          setMessageForm((prev) => ({
                            ...prev,
                            recipientId: event.target.value,
                          }))
                        }
                        disabled={messagingLoading || members.length === 0}
                        className="w-full rounded-2xl border border-white/20 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-white/80 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Select community member</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.username} • {member.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                        Message
                      </label>
                      <textarea
                        value={messageForm.content}
                        onChange={(event) =>
                          setMessageForm((prev) => ({
                            ...prev,
                            content: event.target.value,
                          }))
                        }
                        placeholder="Share reminders, approvals, or follow-ups…"
                        rows={4}
                        className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        messagingLoading ||
                        members.length === 0 ||
                        !messageForm.recipientId ||
                        !messageForm.content.trim()
                      }
                      className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {messagingLoading ? 'Sending…' : 'Send message'}
                    </button>
                  </form>

                  <form
                    onSubmit={handleBroadcastMessageSubmit}
                    className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                        Broadcast update
                      </p>
                      <p>Send a short announcement to every member inbox.</p>
                    </div>
                    <textarea
                      value={broadcastContent}
                      onChange={(event) => setBroadcastContent(event.target.value)}
                      placeholder="Example: Marketplace maintenance tonight at 8pm…"
                      rows={6}
                      className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40"
                    />
                    <button
                      type="submit"
                      disabled={messagingLoading || !broadcastContent.trim()}
                      className="w-full rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {messagingLoading ? 'Broadcasting…' : 'Broadcast to all members'}
                    </button>
                  </form>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-lg font-semibold text-white">Recent admin messages</h4>
                    <span className="text-xs text-white/60">
                      Showing {Math.min(adminMessages.length, 8)} of {adminMessages.length}
                    </span>
                  </div>
                  {adminMessages.length === 0 ? (
                    <p className="mt-4 text-sm text-white/60">
                      No admin messages yet. Use the tools above to send your first update.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {adminMessages.slice(0, 8).map((message) => (
                        <li
                          key={message.id}
                          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80"
                        >
                          <div className="flex items-center justify-between text-xs text-white/60">
                            <span>{message.recipientName || 'Community member'}</span>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm text-white/80">{message.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-lg font-semibold text-white">Messages from Users</h4>
                    <span className="text-xs text-white/60">
                      Showing {Math.min(adminInboxMessages.length, 8)} of {adminInboxMessages.length}
                    </span>
                  </div>
                  {adminInboxMessages.length === 0 ? (
                    <p className="mt-4 text-sm text-white/60">
                      No messages from users yet. Users can message you through their inbox.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {adminInboxMessages.slice(0, 8).map((message) => (
                        <li
                          key={message._id || message.id}
                          className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80"
                        >
                          <div className="flex items-center justify-between text-xs text-white/60">
                            <span>
                              {message.senderId?.username || message.senderName || 'Community member'}
                            </span>
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                          <p className="mt-2 text-sm text-white/80">{message.content}</p>
                          {!message.isRead && (
                            <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-300">
                              Unread
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}
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
