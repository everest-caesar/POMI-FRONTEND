import { useState } from 'react'
import axiosInstance from '../utils/axios'

interface EventFormData {
  title: string
  description: string
  location: string
  date: string
  startTime: string
  endTime: string
  category: string
  maxAttendees?: string
  price?: string
  ticketLink?: string
}

interface EventCreationFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const CATEGORIES = [
  { value: 'cultural', label: 'Cultural' },
  { value: 'social', label: 'Social' },
  { value: 'educational', label: 'Educational' },
  { value: 'business', label: 'Business' },
  { value: 'sports', label: 'Sports' },
  { value: 'faith', label: 'Faith & Spirituality' },
  { value: 'other', label: 'Other' },
]

export default function EventCreationForm({ onSuccess, onCancel }: EventCreationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<EventFormData>({
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
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Client-side validation
      if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.startTime || !formData.endTime) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      if (formData.title.length < 3) {
        setError('Title must be at least 3 characters')
        setLoading(false)
        return
      }

      if (formData.description.length < 10) {
        setError('Description must be at least 10 characters')
        setLoading(false)
        return
      }

      if (formData.location.length < 3) {
        setError('Location must be at least 3 characters')
        setLoading(false)
        return
      }

      // Check if date is in the future
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        setError('Event date must be in the future')
        setLoading(false)
        return
      }

      // Create event
      const createResponse = await axiosInstance.post(
        '/events',
        {
          ...formData,
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
        }
      )

      setSuccess('Event created successfully and published immediately!')

      // Reset form
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
      })

      // Call onSuccess after a short delay
      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
                placeholder="e.g., Enkutatash Celebration 2025"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
                placeholder="e.g., Parliament Hill, Ottawa"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">End Time *</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none"
              />
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Max Attendees</label>
              <input
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
                placeholder="Leave blank for unlimited"
                min="1"
              />
            </div>

            {/* Ticket Link */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Ticket Link</label>
              <input
                type="url"
                name="ticketLink"
                value={formData.ticketLink}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
                placeholder="https://example.com/tickets"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none"
              placeholder="Tell the community what this event is about..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-lg border border-white/15 text-white font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
