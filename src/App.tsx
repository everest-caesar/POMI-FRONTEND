import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import authService, { User as AuthUser } from './services/authService'
import EnhancedAuthForm from './components/EnhancedAuthForm'
import { API_BASE_URL } from './config/api'
import { HomeLanding } from '@/components/home/HomeLanding'
import type { FeatureId } from '@/types/features'
interface AdminMessage {
  id: string
  sender: 'admin' | 'member'
  body: string
  createdAt: string
  read: boolean
}

const ETHIOPIAN_CALENDAR_HIGHLIGHTS = [
  {
    title: 'Enkutatash • Ethiopian New Year',
    date: 'Meskerem 1 • September 11/12',
    description:
      'Families gather to celebrate renewal with flowers, traditional meals, and blessings for the year ahead.',
  },
  {
    title: 'Meskel • Finding of the True Cross',
    date: 'Meskerem 17 • September 27/28',
    description:
      'Communities light the Demera bonfire, sing mezmur, and honour a 1,700-year tradition of faith.',
  },
  {
    title: 'Genna • Ethiopian Christmas',
    date: 'Tahisas 29 • January 7',
    description:
      'Church processions, fasting traditions, and family feasts mark this sacred holiday.',
  },
  {
    title: 'Timket • Epiphany',
    date: 'Tir 11 • January 19',
    description:
      'Colourful processions celebrate the baptism of Christ with water blessings and spirited dancing.',
  },
  {
    title: 'Adwa Victory Day',
    date: 'Yekatit 23 • March 2',
    description:
      'Honours the Ethiopian victory over colonial forces in 1896—a reminder of unity and resilience.',
  },
]

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getUserData())
  const [flashMessage, setFlashMessage] = useState<string | null>(null)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showAdminInbox, setShowAdminInbox] = useState(false)
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>(() => {
    try {
      const stored = localStorage.getItem('adminInboxMessages')
      if (stored) {
        return JSON.parse(stored) as AdminMessage[]
      }
    } catch {
      return []
    }
    return []
  })
  const [unreadAdminMessages, setUnreadAdminMessages] = useState<number>(() => {
    try {
      const storedCount = localStorage.getItem('adminInboxUnread')
      if (storedCount) {
        const parsed = parseInt(storedCount, 10)
        if (!Number.isNaN(parsed)) {
          return parsed
        }
      }
      const storedMessages = localStorage.getItem('adminInboxMessages')
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as AdminMessage[]
        return parsedMessages.filter((message) => !message.read && message.sender === 'admin').length
      }
    } catch {
      return 0
    }
    return 0
  })
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0)
  const [messageDraft, setMessageDraft] = useState('')
  const [inboxFilter, setInboxFilter] = useState<'updates' | 'sent'>('updates')
  const navigate = useNavigate()
  const location = useLocation()

  const triggerFlash = (message: string) => {
    setFlashMessage(message)
    window.setTimeout(() => setFlashMessage(null), 4000)
  }

  const inboxMessages = useMemo(() => {
    const filtered =
      inboxFilter === 'sent'
        ? adminMessages.filter((message) => message.sender === 'member')
        : adminMessages.filter((message) => message.sender === 'admin')
    return [...filtered].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [adminMessages, inboxFilter])

  useEffect(() => {
    try {
      localStorage.setItem('adminInboxMessages', JSON.stringify(adminMessages))
    } catch {
      // ignore storage write errors
    }
  }, [adminMessages])

  useEffect(() => {
    try {
      localStorage.setItem('adminInboxUnread', String(unreadAdminMessages))
    } catch {
      // ignore storage write errors
    }
  }, [unreadAdminMessages])

  const fetchAdminMessages = useCallback(async () => {
    const token = authService.getToken()
    if (!token) {
      setAdminMessages([])
      setUnreadAdminMessages(0)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/messages/admin/inbox`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load admin messages')
      }

      const result = await response.json()
      const messages = Array.isArray(result.data) ? result.data : []

      const formattedMessages: AdminMessage[] = messages.map((msg: any) => ({
        id: msg.id || msg._id,
        sender: msg.isAdminMessage ? 'admin' : 'member',
        body: msg.content,
        createdAt: msg.createdAt,
        read: msg.isAdminMessage ? Boolean(msg.isRead) : true,
      }))

      setAdminMessages(formattedMessages)
      const unreadCount = messages.filter(
        (msg: any) => msg.isAdminMessage && !msg.isRead
      ).length
      setUnreadAdminMessages(unreadCount)
    } catch (error) {
      console.error('Failed to fetch admin messages:', error)
    }
  }, [])

  useEffect(() => {
    if ((location.state as any)?.requireAuth) {
      setAuthMode('login')
      setShowAuthModal(true)
      navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setIsLoggedIn(false)
      setCurrentUser(null)
      return
    }

    setIsLoggedIn(true)
    const cached = authService.getUserData()
    if (cached) {
      setCurrentUser(cached)
    }

    authService
      .getCurrentUser()
      .then((response) => {
        setCurrentUser(response.user)
      })
      .catch(() => {
        authService.removeToken()
        authService.clearUserData()
        setIsLoggedIn(false)
        setCurrentUser(null)
      })
  }, [])

  useEffect(() => {
    if (showAdminInbox) {
      setAdminMessages((prev) => {
        let changed = false
        const next = prev.map((message) => {
          if (message.sender === 'admin' && !message.read) {
            changed = true
            return { ...message, read: true }
          }
          return message
        })
        return changed ? next : prev
      })
      if (unreadAdminMessages > 0) {
        setUnreadAdminMessages(0)
      }
    }
  }, [showAdminInbox, unreadAdminMessages])

  // Fetch unread messages count for regular user-to-user messages
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadMessagesCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      const token = authService.getToken()
      if (!token) {
        setUnreadMessagesCount(0)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/messages/unread/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUnreadMessagesCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch unread messages count:', error)
      }
    }

    fetchUnreadCount()

    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [isLoggedIn])

  const handleLogout = () => {
    authService.removeToken()
    authService.clearUserData()
    setIsLoggedIn(false)
    setCurrentUser(null)
    setAdminMessages([])
    setUnreadAdminMessages(0)
    setUnreadMessagesCount(0)
    navigate('/')
    triggerFlash('You have been logged out')
  }

  const handleOpenAdminInbox = () => {
    if (!isLoggedIn) {
      setAuthMode('login')
      setShowAuthModal(true)
      return
    }
    setInboxFilter('updates')
    fetchAdminMessages()
    setShowAdminInbox(true)
  }

  const handleSendMessageToAdmin = async (event: FormEvent) => {
    event.preventDefault()
    if (!messageDraft.trim()) return

    const token = authService.getToken()
    if (!token) {
      triggerFlash('Please log in to send a message')
      return
    }

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
        throw new Error('Failed to send message')
      }

      const sentMessage: AdminMessage = {
        id: `temp-${Date.now()}`,
        sender: 'member',
        body: messageDraft.trim(),
        createdAt: new Date().toISOString(),
        read: true,
      }

      setAdminMessages((prev) => [...prev, sentMessage])
      setMessageDraft('')
      triggerFlash('Message sent to admin team')
    } catch (error) {
      console.error('Failed to send message:', error)
      triggerFlash('Failed to send message. Please try again.')
    }
  }

  const handleAuthSuccess = () => {
    setIsLoggedIn(true)
    setShowAuthModal(false)
    const userData = authService.getUserData()
    if (userData) {
      setCurrentUser(userData)
      triggerFlash(`Welcome back, ${userData.username}!`)
    }
    fetchAdminMessages()
  }

  const handleExploreFeature = (feature: FeatureId) => {
    const routes: Record<FeatureId, string> = {
      events: '/events',
      marketplace: '/marketplace',
      business: '/business',
      forums: '/forums',
    }
    navigate(routes[feature])
  }

  return (
    <>
      <HomeLanding
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        flashMessage={flashMessage}
        unreadAdminMessages={unreadAdminMessages}
        unreadMessagesCount={unreadMessagesCount}
        onLoginClick={() => {
          setAuthMode('login')
          setShowAuthModal(true)
        }}
        onRegisterClick={() => {
          setAuthMode('register')
          setShowAuthModal(true)
        }}
        onLogout={handleLogout}
        onAdminInboxClick={handleOpenAdminInbox}
        onCalendarClick={() => setShowCalendarModal(true)}
        onMessagesClick={() => navigate('/messages')}
        onExploreFeature={handleExploreFeature}
        navigateTo={(path: string) => navigate(path)}
      />

      {/* Ethiopian Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.65)]">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 text-2xl font-bold shadow-lg shadow-rose-500/30 ring-2 ring-rose-100 transition hover:-translate-y-0.5"
              aria-label="Close Ethiopian calendar highlights"
            >
              ×
            </button>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                  Ethiopian calendar
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">Key holidays & celebrations</h2>
                <p className="mt-2 text-sm text-white/70">
                  Ethiopia follows a 13-month calendar that runs seven to eight years behind the Gregorian calendar. Here are the moments the Pomi community spotlights throughout the year.
                </p>
              </div>
              <div className="space-y-4">
                {ETHIOPIAN_CALENDAR_HIGHLIGHTS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80 shadow-inner shadow-black/20"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100">
                        {item.date}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/70">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-semibold text-emerald-200">Did you know?</p>
                <p>
                  Pagume, the 13th month, has five or six days depending on leap years. We sync community programming with both calendars so no celebration is missed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Inbox Modal */}
      {showAdminInbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.65)]">
            <button
              onClick={() => setShowAdminInbox(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 text-2xl font-bold shadow-lg shadow-rose-500/30 ring-2 ring-rose-100 transition hover:-translate-y-0.5"
              aria-label="Close admin messages"
            >
              ×
            </button>
            <div className="space-y-5">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                  Admin messages
                </p>
                <h2 className="text-3xl font-black text-white">Community support inbox</h2>
                <p className="text-sm text-white/70">
                  Chat with moderators, get onboarding tips, and stay up to date on policy changes. We reply within one business day.
                </p>
              </header>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInboxFilter('updates')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    inboxFilter === 'updates'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'border border-white/20 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600'
                  }`}
                >
                  Admin updates
                </button>
                <button
                  onClick={() => setInboxFilter('sent')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    inboxFilter === 'sent'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'border border-white/20 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600'
                  }`}
                >
                  My messages
                </button>
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4">
                {inboxMessages.length === 0 ? (
                  <p className="text-sm text-white/60">
                    {inboxFilter === 'updates'
                      ? 'No announcements yet. New admin updates will arrive here.'
                      : 'You have not sent any messages yet. Use the form below to reach the admin team.'}
                  </p>
                ) : (
                  inboxMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl border px-4 py-3 text-sm shadow-sm transition ${
                        message.sender === 'admin'
                          ? 'border-rose-200/60 bg-white text-slate-800'
                          : 'border-white/12 bg-slate-900/40 text-slate-100'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between text-xs ${
                          message.sender === 'admin' ? 'text-rose-500' : 'text-slate-300'
                        }`}
                      >
                        <span className="font-semibold uppercase tracking-wide">
                          {message.sender === 'admin' ? 'Admin team' : currentUser?.username || 'You'}
                        </span>
                        <span>
                          {new Date(message.createdAt).toLocaleString('en-CA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p
                        className={`mt-2 leading-relaxed ${
                          message.sender === 'admin' ? 'text-slate-700' : 'text-slate-100'
                        }`}
                      >
                        {message.body}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessageToAdmin} className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                  Ask a question or share an update
                </label>
                <textarea
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  className="min-h-[120px] w-full rounded-2xl border border-white/15 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/30 disabled:bg-slate-200 disabled:text-slate-500"
                  placeholder={
                    isLoggedIn
                      ? 'Selam! I have a question about…'
                      : 'Log in to message the admin team.'
                  }
                  disabled={!isLoggedIn}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-white/50">
                    {isLoggedIn
                      ? 'The admin team will respond via this inbox and email.'
                      : 'You need to log in to start a conversation with the admin team.'}
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!isLoggedIn}
                  >
                    Send message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_30px_60px_rgba(0,0,0,0.15)]">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600 text-2xl font-bold shadow-lg shadow-rose-200 ring-2 ring-rose-100 transition hover:-translate-y-0.5"
              aria-label="Close authentication modal"
            >
              ×
            </button>
            <EnhancedAuthForm
              authMode={authMode}
              onSuccess={handleAuthSuccess}
              onClose={() => setShowAuthModal(false)}
              onModeChange={(mode) => setAuthMode(mode)}
            />
          </div>
        </div>
      )}

    </>
  )
}

export default App
