"use client"

import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import authService from '@/services/authService'
import { API_BASE_URL } from '@/config/api'

const categories = ['Cultural', 'Networking', 'Workshop', 'Religious', 'Social', 'Sports', 'Other']

export default function NewEventPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    image: '',
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const token = authService.getToken()
    if (!token) {
      setError('Please log in to create an event.')
      setIsSubmitting(false)
      return
    }

    if (!formData.title || !formData.description || !formData.date || !formData.startTime || !formData.location) {
      setError('Please complete all required fields.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          category: formData.category || 'other',
          image: formData.image || undefined,
        }),
      })

      if (!response.ok) throw new Error('Could not create event')
      setIsSuccess(true)
      setTimeout(() => navigate('/events'), 1400)
    } catch (err) {
      console.error(err)
      setError('Unable to create the event right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Event submitted!</h2>
          <p className="text-slate-400 mb-4">We&apos;ll add it to the feed as soon as it&apos;s approved.</p>
          <p className="text-sm text-slate-500">Redirecting to events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/events">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create an Event</h1>
          <p className="text-slate-400">Invite the community to your celebration, meetup, or workshop.</p>
          {error && <p className="text-sm text-rose-300 mt-2">{error}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-white">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Traditional Coffee Ceremony Workshop"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Share what attendees can expect, who should come, and any costs."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 min-h-32"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-white">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime" className="text-white">
                Start time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endTime" className="text-white">
                End time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-white">
                Category
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2 w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="text-white">
              Location
            </Label>
            <Input
              id="location"
              placeholder="Ottawa Community Centre"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-white">
              Cover image URL (optional)
            </Label>
            <Input
              id="image"
              placeholder="https://example.com/cover.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              ref={fileInputRef}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit event'}
          </Button>
        </form>
      </main>
    </div>
  )
}
