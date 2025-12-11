"use client"

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Plus, Calendar, MapPin, Users, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import authService from '@/services/authService'
import { API_BASE_URL } from '@/config/api'

const habeshaHolidays = [
  {
    name: "Gena (Ethiopian Christmas)",
    date: "Jan 7, 2026",
    description: "Community liturgy, family gatherings, and post-service feasts.",
  },
  {
    name: "Timkat (Epiphany)",
    date: "Jan 19, 2026",
    description: "Processions, water blessing, cultural dances, and shared meals.",
  },
  {
    name: "Fasika (Easter)",
    date: "May 3, 2026",
    description: "Breaking the fast together with doro wot, kitfo, and music.",
  },
  {
    name: "Enkutatash (Ethiopian New Year)",
    date: "Sep 11, 2026",
    description: "New year blessings, yellow adey flowers, and community brunches.",
  },
  {
    name: "Meskel (Finding of the True Cross)",
    date: "Sep 27, 2026",
    description: "Demera bonfire, family reunions, and neighborhood festivities.",
  },
]

const categories = ['All Events', 'Cultural', 'Networking', 'Workshop', 'Religious', 'Social', 'Sports']
const ITEMS_PER_PAGE = 9

type EventItem = {
  id: string
  title: string
  dateLabel: string
  timeLabel: string
  location: string
  attendees: number
  image?: string
  category: string
  description?: string
  isFeatured?: boolean
  rsvpOpen?: boolean
}

const formatDateLabel = (value?: string) => {
  if (!value) return 'Date coming soon'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const titleCase = (value?: string) => {
  if (!value) return 'General'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<EventItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Events')
  const [rsvpEvents, setRsvpEvents] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterState, setFilterState] = useState({
    featuredOnly: false,
    rsvpOpenOnly: false,
  })
  const [showHolidays, setShowHolidays] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const stored = localStorage.getItem('pomi-rsvp')
    if (stored) {
      try {
        setRsvpEvents(JSON.parse(stored))
      } catch {
        setRsvpEvents([])
      }
    }
  }, [])

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/events`)
        if (!response.ok) throw new Error('Unable to load events')
        const data = await response.json()
        const normalized: EventItem[] = (data.events || data.data || []).map((event: any, index: number) => ({
          id: event._id || event.id || `event-${index}`,
          title: event.title ?? 'Community gathering',
          dateLabel: formatDateLabel(event.date),
          timeLabel:
            event.startTime && event.endTime
              ? `${event.startTime} - ${event.endTime}`
              : event.startTime || event.endTime || 'Time announced soon',
          location: event.location || 'Location coming soon',
          attendees: Array.isArray(event.attendees) ? event.attendees.length : Number(event.attendees) || 0,
          image: event.image || '/placeholder.jpg',
          category: titleCase(event.category),
          description: event.description,
          isFeatured: Boolean(event.isFeatured) || index === 0,
          rsvpOpen: event.moderationStatus ? event.moderationStatus === 'approved' : true,
        }))
        setEvents(normalized)
      } catch (err) {
        console.error(err)
        setError('We could not reach the events backend.')
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    void loadEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === 'All Events' || event.category === activeCategory
      const matchesFeatured = filterState.featuredOnly ? event.isFeatured : true
      const matchesRsvp = filterState.rsvpOpenOnly ? event.rsvpOpen !== false : true
      return matchesSearch && matchesCategory && matchesFeatured && matchesRsvp
    })
  }, [activeCategory, events, filterState, searchQuery])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeCategory, filterState])

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredEvents, currentPage])

  const toggleRsvp = async (id: string) => {
    const token = authService.getToken()
    if (!token) {
      setError('Please log in to RSVP for events.')
      return
    }

    const already = rsvpEvents.includes(id)
    setRsvpEvents((prev) => {
      const next = already ? prev.filter((entry) => entry !== id) : [...prev, id]
      localStorage.setItem('pomi-rsvp', JSON.stringify(next))
      return next
    })
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, attendees: Math.max(0, event.attendees + (already ? -1 : 1)) } : event,
      ),
    )

    try {
      const method = already ? 'DELETE' : 'POST'
      await fetch(`${API_BASE_URL}/events/${id}/rsvp`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error(err)
    }
  }

  const featuredEvent = filteredEvents.find((event) => event.isFeatured) || filteredEvents[0]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pomi</p>
                <p className="text-sm font-semibold text-white">Events</p>
              </div>
            </div>
          </div>
          <Link to="/events/new">
            <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Community Events</h1>
          <p className="text-slate-400">Find cultural celebrations, community gatherings, and networking meetups near you.</p>
          {error && <p className="text-sm text-rose-300 mt-2">{error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-orange-500"
            />
          </div>
          <Button
            variant={filtersOpen ? 'default' : 'outline'}
            className="h-12 gap-2 border-slate-700 text-slate-50 bg-slate-800/60 hover:bg-slate-800"
            onClick={() => setFiltersOpen((prev) => !prev)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="secondary"
            className="h-12 gap-2 bg-emerald-600/80 hover:bg-emerald-600 text-white"
            onClick={() => setShowHolidays((prev) => !prev)}
          >
            <Calendar className="h-4 w-4" />
            Habesha calendar
          </Button>
        </div>

        {filtersOpen && (
          <div className="mb-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-3">
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={filterState.featuredOnly}
                onChange={(e) => setFilterState((prev) => ({ ...prev, featuredOnly: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800"
              />
              Show featured spotlights only
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={filterState.rsvpOpenOnly}
                onChange={(e) => setFilterState((prev) => ({ ...prev, rsvpOpenOnly: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800"
              />
              Accepting RSVPs now
            </label>
            <Button
              variant="ghost"
              className="justify-start text-slate-300 hover:text-white"
              onClick={() => setFilterState({ featuredOnly: false, rsvpOpenOnly: false })}
            >
              Reset filters
            </Button>
          </div>
        )}

        {showHolidays && (
          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Key Ethiopian holidays</h3>
                <p className="text-sm text-slate-400">Upcoming faith and cultural celebrations to mark on your calendar.</p>
              </div>
              <span className="text-xs text-slate-500">{habeshaHolidays.length} dates</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {habeshaHolidays.map((holiday) => (
                <div key={holiday.name} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">{holiday.name}</h4>
                    <span className="text-xs text-emerald-300">{holiday.date}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{holiday.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mb-8 h-72 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" />
        ) : (
          featuredEvent && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Featured Event</h2>
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={featuredEvent.image || '/placeholder.svg'}
                  alt={featuredEvent.title}
                  className="h-72 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="mb-2 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    {featuredEvent.category}
                  </span>
                  <h3 className="text-3xl font-bold">{featuredEvent.title}</h3>
                  <p className="mt-2 text-sm text-white/80">{featuredEvent.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {featuredEvent.dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featuredEvent.timeLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {featuredEvent.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-64 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
            No events match your filters right now. Try adjusting categories or check back soon.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">
                Showing {paginatedEvents.length} of {filteredEvents.length} events
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4 hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{event.category}</p>
                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3 flex-1">{event.description || 'Details coming soon.'}</p>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      {event.dateLabel}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      {event.timeLabel}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      {event.attendees} attending
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant={rsvpEvents.includes(event.id) ? 'secondary' : 'default'}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => toggleRsvp(event.id)}
                      disabled={event.rsvpOpen === false}
                    >
                      {rsvpEvents.includes(event.id) ? 'RSVP\'d' : 'RSVP'}
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
