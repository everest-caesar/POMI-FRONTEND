"use client"

import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, MapPin, Calendar, Share2, Flag, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import authService from '@/services/authService'
import { API_BASE_URL } from '@/config/api'

type EventDetail = {
  id: string
  title: string
  dateLabel: string
  timeLabel: string
  location: string
  image?: string
  category: string
  attendees: number
  description?: string
  organizer?: string
}

const formatDateLabel = (value?: string) => {
  if (!value) return 'Date coming soon'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

const titleCase = (value?: string) => {
  if (!value) return 'General'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasRsvped, setHasRsvped] = useState(false)
  const [liked, setLiked] = useState(false)
  const [attendeeCount, setAttendeeCount] = useState(0)

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`)
        if (!response.ok) throw new Error('Event not found')
        const data = await response.json()
        const eventData = data.event || data.data || data
        const normalized: EventDetail = {
          id: eventData._id || eventData.id || id,
          title: eventData.title ?? 'Community gathering',
          dateLabel: formatDateLabel(eventData.date),
          timeLabel:
            eventData.startTime && eventData.endTime
              ? `${eventData.startTime} - ${eventData.endTime}`
              : eventData.startTime || eventData.endTime || 'Time announced soon',
          location: eventData.location || 'Location coming soon',
          attendees: Array.isArray(eventData.attendees) ? eventData.attendees.length : Number(eventData.attendees) || 0,
          image: eventData.image || '/placeholder.jpg',
          category: titleCase(eventData.category),
          description: eventData.description,
          organizer: eventData.organizer?.name || eventData.organizer?.email || 'Community member',
        }
        setEvent(normalized)
        setAttendeeCount(normalized.attendees)

        // Check if user has already RSVP'd
        const stored = localStorage.getItem('pomi-rsvp')
        if (stored) {
          try {
            const rsvpList = JSON.parse(stored)
            setHasRsvped(rsvpList.includes(id))
          } catch {
            setHasRsvped(false)
          }
        }

        // Check if user has liked
        const likedEvents = localStorage.getItem('pomi-liked-events')
        if (likedEvents) {
          try {
            const likedList = JSON.parse(likedEvents)
            setLiked(likedList.includes(id))
          } catch {
            setLiked(false)
          }
        }
      } catch (err) {
        console.error(err)
        setError('We could not load this event.')
      } finally {
        setLoading(false)
      }
    }

    void loadEvent()
  }, [id])

  const handleRsvp = async () => {
    const token = authService.getToken()
    if (!token) {
      setError('Please log in to RSVP for events.')
      return
    }

    const newRsvpState = !hasRsvped
    setHasRsvped(newRsvpState)
    setAttendeeCount((prev) => prev + (newRsvpState ? 1 : -1))

    // Update localStorage
    const stored = localStorage.getItem('pomi-rsvp')
    let rsvpList: string[] = []
    if (stored) {
      try {
        rsvpList = JSON.parse(stored)
      } catch {
        rsvpList = []
      }
    }
    if (newRsvpState) {
      rsvpList.push(id!)
    } else {
      rsvpList = rsvpList.filter((entry) => entry !== id)
    }
    localStorage.setItem('pomi-rsvp', JSON.stringify(rsvpList))

    try {
      const method = newRsvpState ? 'POST' : 'DELETE'
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

  const handleLike = () => {
    const newLikeState = !liked
    setLiked(newLikeState)

    // Update localStorage
    const stored = localStorage.getItem('pomi-liked-events')
    let likedList: string[] = []
    if (stored) {
      try {
        likedList = JSON.parse(stored)
      } catch {
        likedList = []
      }
    }
    if (newLikeState) {
      likedList.push(id!)
    } else {
      likedList = likedList.filter((entry) => entry !== id)
    }
    localStorage.setItem('pomi-liked-events', JSON.stringify(likedList))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Check out this event',
          text: event?.description || 'Join us at this community event!',
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
            <Link to="/events">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
          <div className="h-96 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse mb-6" />
          <div className="h-48 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Event not found</h2>
          <p className="text-slate-400">{error || 'This event may have been removed.'}</p>
          <Link to="/events">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/events">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition">
                <span className="text-lg font-bold text-white">P</span>
              </Link>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">POMI</p>
                <p className="text-sm font-semibold text-white">Event Details</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-80 sm:h-96">
              <img
                src={event.image || '/placeholder.jpg'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold text-white">
                  {event.category}
                </span>
              </div>
            </div>

            {/* Details Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white">{event.title}</h1>
                {event.organizer && (
                  <p className="text-sm text-slate-400 mt-2">Hosted by {event.organizer}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="text-white font-medium">{event.dateLabel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Time</p>
                    <p className="text-white font-medium">{event.timeLabel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Location</p>
                    <p className="text-white font-medium">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-400">Attendees</p>
                    <p className="text-white font-medium">{attendeeCount} going</p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="border-t border-slate-800 pt-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">About this event</h3>
                  <p className="text-slate-300 leading-relaxed">{event.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
                <Button
                  onClick={handleRsvp}
                  className={`gap-2 ${hasRsvped ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
                >
                  {hasRsvped ? "RSVP'd" : 'RSVP Now'}
                </Button>
                <Button
                  onClick={handleLike}
                  variant="outline"
                  className={`gap-2 ${liked ? 'border-rose-500/50 bg-rose-950/30 text-rose-400' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </Button>
                <Link to={`/messages?topic=Event: ${encodeURIComponent(event.title)}`}>
                  <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
                    <MessageCircle className="h-4 w-4" />
                    Discuss
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="mb-4 text-center">
                <p className="text-4xl font-bold text-white">{attendeeCount}</p>
                <p className="text-sm text-slate-400">People going</p>
              </div>

              <Button
                onClick={handleRsvp}
                className={`w-full gap-2 ${hasRsvped ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
              >
                {hasRsvped ? 'Going' : 'RSVP Now'}
              </Button>

              <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</p>
                <p className="text-sm text-white mt-1">{event.category}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Share event</h3>
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share link
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Safety</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                All events are community-hosted. Meet in public places and share your plans with someone you trust.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
