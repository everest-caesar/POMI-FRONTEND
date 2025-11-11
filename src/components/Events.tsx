import { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../config/api'

const getStoredUserId = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const stored = localStorage.getItem('userData')
    if (!stored) {
      return null
    }
    const parsed = JSON.parse(stored)
    return parsed?._id ?? parsed?.id ?? null
  } catch {
    return null
  }
}

interface Event {
  _id: string
  title: string
  description: string
  location: string
  date: string
  startTime: string
  endTime: string
  category: string
  organizer: string
  maxAttendees?: number
  attendees: Array<string | { _id: string }>
  price?: number
  isFree?: boolean
  ticketLink?: string
  createdAt: string
}

interface EventsProps {
  onClose?: () => void
  token: string
  isAdmin?: boolean
  onRequestAdmin?: () => void
}

export default function Events({ onClose, token, isAdmin = false, onRequestAdmin }: EventsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [category, setCategory] = useState('all')
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    category: 'cultural',
    maxAttendees: '',
    price: '',
    ticketLink: '',
    socialMediaLink: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [category])

  useEffect(() => {
    if (!selectedEvent) {
      return
    }

    const latest = events.find((event) => event._id === selectedEvent._id)
    if (latest && latest !== selectedEvent) {
      setSelectedEvent(latest)
    }
  }, [events, selectedEvent])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const url = category === 'all'
        ? `${API_BASE_URL}/events`
        : `${API_BASE_URL}/events?category=${category}`

      const headers: Record<string, string> | undefined = token
        ? { Authorization: `Bearer ${token}` }
        : undefined

      const response = await fetch(url, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data.events || data.data || [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Please log in to submit an event')
      return
    }

    // Client-side validation
    if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.startTime || !formData.endTime) {
      setError('All fields are required')
      return
    }

    if (formData.title.length < 3) {
      setError('Title must be at least 3 characters')
      return
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    if (formData.location.length < 3) {
      setError('Location must be at least 3 characters')
      return
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setError('Event date must be in the future')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }

      // Success - reset form and close
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        category: 'cultural',
        maxAttendees: '',
        price: '',
        ticketLink: '',
        socialMediaLink: '',
      })
      setShowForm(false)
      setSubmissionMessage(
        isAdmin
          ? 'Event published successfully.'
          : 'Thanks! Your event was sent to the admin team for approval.'
      )
      await fetchEvents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const openTicketLink = (link: string | undefined, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (link) {
      window.open(link, '_blank')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (selectedEvent) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedEvent(null)}
          className="text-red-600 hover:text-red-700 font-bold"
        >
          ← Back to Events
        </button>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            ✅ Reviewed by the Pomi admin team
          </p>
          <p className="text-lg text-gray-600 mb-6">{selectedEvent.description}</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-700 mb-2">📅 Date</h3>
                <p className="text-gray-600">{formatDate(selectedEvent.date)}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 mb-2">⏰ Time</h3>
                <p className="text-gray-600">
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 mb-2">📍 Location</h3>
                <p className="text-gray-600">{selectedEvent.location}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 mb-2">🏷️ Category</h3>
                <p className="text-gray-600 capitalize">{selectedEvent.category}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 mb-2">💰 Price</h3>
                {selectedEvent.isFree ? (
                  <p className="text-green-600 font-semibold text-lg">🎉 Free Event</p>
                ) : (
                  <p className="text-blue-600 font-semibold text-lg">${(selectedEvent.price || 0) / 100}.00</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-700 mb-2">👤 Organizer</h3>
                <p className="text-gray-600">{selectedEvent.organizer}</p>
              </div>
              {selectedEvent.ticketLink && (
                <button
                  onClick={() => openTicketLink(selectedEvent.ticketLink)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  🎫 Get Tickets
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {submissionMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {submissionMessage}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => {
            setSubmissionMessage('')
            setError('')
            setShowForm((prev) => !prev)
          }}
          disabled={!token}
          className="rounded-full bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          + Create Event
        </button>
        {!isAdmin && token && (
          <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
            <span className="font-semibold">Pending admin review</span>
            <span>
              Submit your gathering and the admin team will approve it before it appears publicly.
            </span>
            {onRequestAdmin && (
              <button
                type="button"
                onClick={onRequestAdmin}
                className="self-start rounded-full border border-amber-300 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-white"
              >
                Message the admin team
              </button>
            )}
          </div>
        )}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none"
        >
          <option value="all">All Categories</option>
          <option value="cultural">Cultural</option>
          <option value="business">Business</option>
          <option value="social">Social</option>
          <option value="educational">Educational</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>
      </div>

      {token && showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateEvent} className="relative bg-white rounded-lg p-8 space-y-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h2>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    if (error) setError('')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description (min 10 characters)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                    if (error) setError('')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                  placeholder="Describe your event"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                  >
                    <option value="cultural">Cultural</option>
                    <option value="business">Business</option>
                    <option value="social">Social</option>
                    <option value="educational">Educational</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Date * (future date)</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => {
                      setFormData({ ...formData, date: e.target.value })
                      if (error) setError('')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Price ($ - Leave empty for free)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">🎫 Ticket Sales Link (Eventbrite, etc.) *</label>
                <input
                  type="url"
                  required
                  value={formData.ticketLink}
                  onChange={(e) => {
                    setFormData({ ...formData, ticketLink: e.target.value })
                    if (error) setError('')
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white"
                  placeholder="https://www.eventbrite.com/e/... or your ticket sales link"
                />
                <p className="text-sm text-gray-500 mt-1">Where attendees can purchase tickets or register for your event</p>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
        </div>
      )}

      {loading && <p className="text-gray-600">Loading events...</p>}

      {!loading && events.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center space-y-4">
          <p className="text-gray-600 text-lg">
            {isAdmin
              ? 'No events found. Publish the next gathering for the community!'
              : 'Our moderators are reviewing the next round of gatherings. Check back soon or share your idea with the admin team.'}
          </p>
          {!isAdmin && onRequestAdmin && (
            <button
              onClick={onRequestAdmin}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              Message the admin team
            </button>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            onClick={() => setSelectedEvent(event)}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title}</h3>
              <span className="text-xs bg-red-100 text-black px-2 py-1 rounded capitalize font-semibold">
                {event.category}
              </span>
            </div>
            <span className="mb-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
              ✅ Admin approved
            </span>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p className="flex items-center gap-2">
                <span>📅</span>
                {formatDate(event.date)}
              </p>
              <p className="flex items-center gap-2">
                <span>⏰</span>
                {event.startTime} - {event.endTime}
              </p>
              <p className="flex items-center gap-2">
                <span>📍</span>
                {event.location}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {event.isFree ? (
                <p className="text-sm font-semibold text-green-600">🎉 Free Event</p>
              ) : (
                <p className="text-sm font-semibold text-blue-600">${(event.price || 0) / 100}.00</p>
              )}
            </div>

            <div className="pt-4 border-t">
              {event.ticketLink ? (
                <button
                  onClick={(e) => openTicketLink(event.ticketLink, e)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  🎫 Get Tickets
                </button>
              ) : (
                <p className="text-sm text-gray-500 text-center italic">No ticket link available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
