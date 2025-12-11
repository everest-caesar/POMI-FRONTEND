import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '@/config/api'
import authService from '@/services/authService'

export default function SupportPage() {
  const navigate = useNavigate()
  const [messageDraft, setMessageDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const user = authService.getUserData()
  const token = authService.getToken()
  const isLoggedIn = Boolean(token && user)

  const faqs = [
    {
      q: 'How do I contact a seller safely?',
      a: 'Use the in-app messages and keep all payments in-person or through trusted methods. Report anything suspicious via the report menu inside Messages.',
    },
    {
      q: 'What if I see inappropriate content?',
      a: 'Flag the listing or message and choose a reason. Our moderators review reports within 48 hours.',
    },
    {
      q: 'How do I reset my login?',
      a: 'Use the email code flow on the sign-in page. If you are locked out, reach out to support@pomi.community with a screenshot.',
    },
    {
      q: 'How do I list an item for sale?',
      a: 'Go to the Marketplace, click "Create Listing", fill out the form with title, description, price, and photos, then submit for review.',
    },
    {
      q: 'How do I RSVP to an event?',
      a: 'Browse events, find one you like, and click the RSVP button. You\'ll receive a confirmation and reminders via email.',
    },
  ]

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!messageDraft.trim() || !isLoggedIn) return

    setError('')
    setSuccess('')
    setSending(true)

    try {
      const response = await fetch(`${API_BASE_URL}/messages/admin/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageDraft.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setMessageDraft('')
      setSuccess('Message sent! Our team will respond within 48 hours.')
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              <span className="text-base">←</span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pomi</p>
                <p className="text-sm font-semibold text-white">Support Centre</p>
              </div>
            </Link>
          </div>
          {isLoggedIn && (
            <span className="text-sm text-white/70">
              Logged in as <span className="font-semibold text-white">{user?.username}</span>
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Header Section */}
        <div className="mb-10 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Resources</p>
          <h1 className="text-3xl font-bold text-white">Support Centre</h1>
          <p className="text-slate-400">
            Get help with messaging, listings, events, and safety. Our team responds within 48 hours for all tickets.
          </p>
        </div>

        {/* Contact and Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Contact us</h2>
            <p className="text-slate-400 text-sm">Reach the Pomi support team for account issues or content moderation.</p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>Email: <a className="text-emerald-300 hover:underline" href="mailto:support@pomi.community">support@pomi.community</a></p>
              <p>Response time: within 48 hours</p>
              <p>Hours: 9am - 6pm EST, Monday to Saturday</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Quick actions</h2>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Report a message: open the 3-dot menu on a message and pick a reason</li>
              <li>Report a listing: use the flag on listing detail and choose a reason</li>
              <li>Reset login: request a new email code from the sign-in page</li>
              <li>Safety tips: meet in public, verify payments, and keep chats on Pomi</li>
            </ul>
          </div>
        </div>

        {/* Send Message to Admin Section */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Send us a message</h2>
          {isLoggedIn ? (
            <form onSubmit={handleSendMessage} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-300">
                  {success}
                </div>
              )}
              <textarea
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                className="w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-white placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 resize-none selection:bg-emerald-400/30 selection:text-white"
                placeholder="Describe your issue or question..."
                disabled={sending}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  We'll respond to your message within 48 hours.
                </p>
                <button
                  type="submit"
                  disabled={!messageDraft.trim() || sending}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">Please log in to send a message to our support team.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
              >
                Log in to continue
              </Link>
            </div>
          )}
        </div>

        {/* FAQs */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="font-semibold text-white">{faq.q}</p>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link
            to="/marketplace"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center hover:border-slate-700 transition"
          >
            <p className="text-2xl mb-2">🛍️</p>
            <p className="font-semibold text-white">Marketplace</p>
            <p className="text-xs text-slate-400">Browse listings</p>
          </Link>
          <Link
            to="/events"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center hover:border-slate-700 transition"
          >
            <p className="text-2xl mb-2">📅</p>
            <p className="font-semibold text-white">Events</p>
            <p className="text-xs text-slate-400">Community gatherings</p>
          </Link>
          <Link
            to="/forums"
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center hover:border-slate-700 transition"
          >
            <p className="text-2xl mb-2">💬</p>
            <p className="font-semibold text-white">Forums</p>
            <p className="text-xs text-slate-400">Discussions</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
