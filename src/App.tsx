import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import authService, { User as AuthUser } from './services/authService'
import Events from './components/Events'
import EnhancedAuthForm from './components/EnhancedAuthForm'
import FeatureCarousel from './components/FeatureCarousel'

type FeatureId =
  | 'events'
  | 'marketplace'
  | 'business'
  | 'forums'

interface FeatureCard {
  id: FeatureId
  icon: string
  title: string
  description: string
  gradient: string
  borderColor: string
}

interface AdminMessage {
  id: string
  sender: 'admin' | 'member'
  body: string
  createdAt: string
  read: boolean
}

const BASE_FEATURES: FeatureCard[] = [
  {
    id: 'events',
    icon: '🎉',
    title: 'Events',
    description:
      'Celebrate culture, connect IRL, and RSVP to the Habesha gatherings that matter to you.',
    gradient: 'bg-gradient-to-br from-rose-500 via-red-500 to-orange-500',
    borderColor: 'border-rose-200',
  },
  {
    id: 'marketplace',
    icon: '🛍️',
    title: 'Marketplace',
    description:
      'Discover trusted listings from neighbours—jobs, housing, services, and essentials.',
    gradient: 'bg-gradient-to-br from-amber-400 via-orange-400 to-red-400',
    borderColor: 'border-amber-200',
  },
  {
    id: 'business',
    icon: '🏢',
    title: 'Business Directory',
    description:
      'Spotlight Habesha-owned businesses in Ottawa and make it easy to support local.',
    gradient: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-rose-400',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'forums',
    icon: '💬',
    title: 'Forums',
    description:
      'Join threaded conversations with upvotes, saved posts, and layered moderation to swap advice, spotlight wins, and discuss community news.',
    gradient: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500',
    borderColor: 'border-emerald-200',
  },
]

const HERO_STATS = [
  { icon: '🌱', label: 'Newcomers welcomed', value: '1,200+', accent: 'from-emerald-400 to-teal-500' },
  { icon: '🤝', label: 'Connections made', value: '15k+', accent: 'from-amber-400 to-orange-500' },
  { icon: '🎉', label: 'Events hosted', value: '320+', accent: 'from-rose-400 to-red-500' },
]

const COMMUNITY_HIGHLIGHTS = [
  {
    title: 'Culture-first design',
    blurb:
      'Rooted in Habesha artistry with layered colour, language support, and typography that feels like home.',
    icon: '🎨',
  },
  {
    title: 'Trusted marketplace',
    blurb:
      'Moderated listings, verified sellers, and admin approvals keep buying, selling, and swapping safe for everyone.',
    icon: '🛡️',
  },
  {
    title: 'Business visibility',
    blurb:
      'Spotlight Habesha-owned businesses with profiles, contact details, and admin-approved spotlights in seconds.',
    icon: '🏢',
  },
  {
    title: 'Forums & knowledge threads',
    blurb:
      'Threaded discussions with upvotes, saved posts, and moderation capture community wisdom for the long term.',
    icon: '💬',
  },
]

const TESTIMONIALS = [
  {
    quote:
      '“I sold household essentials within a day and met a fellow entrepreneur who became a mentor. Pomi feels like home.”',
    name: 'Eyerusalem A.',
    role: 'Marketplace seller & mentor',
  },
  {
    quote:
      '“Our community events used to scatter on WhatsApp. Now everything lives in one place, with RSVPs we can actually track.”',
    name: 'Daniel H.',
    role: 'Event organizer',
  },
  {
    quote:
      '“As a newcomer, finding local services was tough. The business directory made it effortless to support Habesha-owned shops.”',
    name: 'Hanna G.',
    role: 'Newcomer & student',
  },
]

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
  const [activeFeature, setActiveFeature] = useState<FeatureId | null>(null)
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

  const features = useMemo(() => {
    return [...BASE_FEATURES]
  }, [])

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
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/messages/unread/count`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
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

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user)
    localStorage.setItem('userData', JSON.stringify(user))
    setIsLoggedIn(true)
    if (authMode === 'register') {
      const welcomeMessage: AdminMessage = {
        id: `welcome-${Date.now()}`,
        sender: 'admin',
        body: `Selam ${user.username.split(' ')[0]}! Welcome to Pomi. Take a look around the forums, browse the marketplace, and RSVP for upcoming events. Reply here anytime if you have questions—we’re here to support you.`,
        createdAt: new Date().toISOString(),
        read: false,
      }
      setAdminMessages((prev) => [welcomeMessage, ...prev])
      setUnreadAdminMessages((prev) => prev + 1)
      setInboxFilter('updates')
    }
    triggerFlash(
      authMode === 'register'
        ? 'You have successfully created your Pomi account.'
        : 'You have successfully logged in.'
    )
    setAuthMode('login')
  }

  const handleLogout = () => {
    authService.removeToken()
    authService.clearUserData()
    setIsLoggedIn(false)
    setCurrentUser(null)
    setAuthMode('login')
    triggerFlash('You have been signed out.')
  }

  const handleSendMessageToAdmin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!messageDraft.trim()) {
      return
    }

    if (!isLoggedIn) {
      setAuthMode('login')
      setShowAuthModal(true)
      return
    }

    const newMessage: AdminMessage = {
      id: `member-${Date.now()}`,
      sender: 'member',
      body: messageDraft.trim(),
      createdAt: new Date().toISOString(),
      read: true,
    }

    setAdminMessages((prev) => [...prev, newMessage])
    setInboxFilter('sent')
    setMessageDraft('')
  }

  const handleOpenAdminInbox = () => {
    if (!isLoggedIn) {
      setAuthMode('login')
      setShowAuthModal(true)
      return
    }
    setInboxFilter('updates')
    setShowAdminInbox(true)
  }

  const handleExploreFeature = (id: FeatureId) => {
    if (id === 'marketplace') {
      navigate('/marketplace')
      return
    }

    if (id === 'business') {
      navigate('/business')
      return
    }

    if (!isLoggedIn) {
      setAuthMode('register')
      setShowAuthModal(true)
      return
    }

    setActiveFeature(id)
  }

  const token = authService.getToken() || ''

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[420px] w-[420px] rounded-full bg-red-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-2xl font-black text-white shadow-lg shadow-red-500/40 transition group-hover:scale-105">
              P
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Pomi Community Hub</p>
              <p className="text-lg font-black text-white">Ottawa</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/70 md:flex">
            <a href="#pillars" className="hover:text-white transition">
              Pillars
            </a>
            <a href="#experiences" className="hover:text-white transition">
              Experiences
            </a>
            <a href="#testimonials" className="hover:text-white transition">
              Stories
            </a>
            <a href="#join" className="hover:text-white transition">
              Join Us
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white/80 transition hover:border-white/40 hover:text-white"
              aria-label="Open Ethiopian calendar highlights"
            >
              🗓️
            </button>
            <button
              onClick={handleOpenAdminInbox}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white/80 transition hover:border-white/40 hover:text-white"
              aria-label={isLoggedIn ? 'Open messages from the admin team' : 'Log in to see admin messages'}
            >
              💬
              {unreadAdminMessages > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow shadow-red-500/40">
                  {unreadAdminMessages > 9 ? '9+' : unreadAdminMessages}
                </span>
              )}
            </button>
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/messages')}
                className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                aria-label="Go to direct messages"
              >
                ✉️ Messages
                {unreadMessagesCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow shadow-red-500/40">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </button>
            ) : null}
            {isLoggedIn ? (
              <>
                <span className="hidden text-sm text-white/70 md:block">
                  Welcome, <span className="font-semibold text-white">{currentUser?.username || 'Friend'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuthModal(true)
                  }}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register')
                    setShowAuthModal(true)
                  }}
                  className="rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5"
                >
                  Join community
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {flashMessage && (
        <div className="mx-auto mt-6 max-w-3xl rounded-full border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/40 backdrop-blur-lg">
          {flashMessage}
        </div>
      )}

      <main className="relative z-10">
        {/* Hero */}
        <section className="px-6 pt-20" id="hero">
          <div className="mx-auto grid max-w-7xl items-center gap-12 rounded-[40px] border border-white/10 bg-white/5 p-10 shadow-[0_40px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:grid-cols-[1.5fr,1fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                <span className="text-base">🌍</span> Ottawa • Habesha Community
              </div>
              <h1 className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
                One digital home for culture, opportunity, and connection.
              </h1>
              <p className="max-w-2xl text-lg text-white/80 md:text-xl">
                Pomi brings together marketplace listings, cultural events, forums, faith circles, and a full business directory—designed with love for our Habesha community in Ottawa.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      handleExploreFeature('marketplace')
                    } else {
                      setAuthMode('register')
                      setShowAuthModal(true)
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-400 via-red-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5"
                >
                  Explore Marketplace
                </button>
                <button
                  onClick={() => {
                    setAuthMode(isLoggedIn ? 'login' : 'register')
                    setShowAuthModal(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  {isLoggedIn ? 'Switch account' : 'Create profile'}
                </button>
              </div>
            </div>

            <div className="space-y-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.45)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Community pulse
              </h2>
              <div className="grid gap-4">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border border-white/10 bg-gradient-to-r ${stat.accent} px-4 py-4 shadow-lg shadow-slate-900/30`}
                  >
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xl">{stat.icon}</span> {stat.label}
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/60">
                Stats updated weekly based on verified engagement inside the Pomi network.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Carousel */}
        <section className="px-6 py-20 scroll-mt-28" id="experiences">
          <div className="mx-auto max-w-7xl space-y-12">
            <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                  Community pillars
                </p>
                <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                  Explore every layer of community life inside Pomi.
                </h2>
                <p className="mt-4 max-w-2xl text-base text-slate-200">
                  Tap into curated experiences—from job leads and classifieds to cultural celebrations,
                  community gatherings, and secure moderation tools. Each pillar unlocks a different dimension of our collective story.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-lg shadow-slate-900/40 backdrop-blur-lg">
                <p className="font-semibold text-white">Pro tip</p>
                <p className="mt-2">
                  Moderators see additional tools after they sign in with the team’s admin credentials.
                  Reach out to community leadership if you need elevated access.
                </p>
              </div>
            </div>

            <FeatureCarousel
              features={features}
              onFeatureClick={(feature) => handleExploreFeature(feature.id as FeatureId)}
              autoplay
              autoplaySpeed={6000}
            />
          </div>
        </section>

        {/* Community Pillars */}
        <section className="px-6 pb-16 scroll-mt-28" id="pillars">
          <div className="mx-auto max-w-6xl grid gap-10 rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-[0_40px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr,1.2fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                  Community pillars
                </p>
                <h2 className="text-3xl font-black text-white md:text-4xl">
                  Ground every feature in culture, trust, and collaboration.
                </h2>
                <p className="text-sm text-white/70 md:text-base">
                  We review these pillars every sprint so product decisions stay transparent and anchored in what matters most to the community.
                </p>
              </div>
              <div className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-white/80 shadow-inner shadow-slate-900/30">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  How we measure success
                </p>
                <p>
                  Every release is reviewed against these pillars—design warmth, trust guardrails, and end-to-end connected experiences. When something new ships, it should light up at least one pillar and never compromise the others.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {COMMUNITY_HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="flex h-full flex-col gap-3 rounded-3xl border border-white/10 bg-white/8 p-6 text-white/80 shadow-lg shadow-slate-900/30 transition hover:-translate-y-1 hover:bg-white/12 hover:text-white"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-white/70">{item.blurb}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 pb-16 scroll-mt-28" id="testimonials">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Voices from the community
              </p>
              <h2 className="text-3xl font-black text-white md:text-4xl">
                “Pomi feels like walking into a community centre—online.”
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-200">
                Members use Pomi to buy and sell essentials, secure new roles, launch cultural events, and mentor the next generation.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 shadow-lg shadow-slate-900/40 backdrop-blur-lg"
                >
                  <blockquote className="text-sm italic leading-relaxed text-white/80">
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-4 text-xs uppercase tracking-[0.3em] text-rose-200">
                    {testimonial.name}
                    <span className="block text-[10px] tracking-[0.2em] text-white/60">
                      {testimonial.role}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="px-6 pb-24 scroll-mt-28" id="join">
          <div className="mx-auto max-w-6xl rounded-[40px] border border-white/10 bg-gradient-to-r from-orange-400 via-red-500 to-rose-500 p-10 shadow-[0_30px_60px_rgba(255,87,51,0.4)]">
            <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr] lg:items-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  🎁 Membership is free
                </span>
                <h2 className="text-3xl font-black text-white md:text-4xl">
                  Ready to unlock opportunity, culture, and community in one home?
                </h2>
                <p className="max-w-2xl text-base text-white/90">
                  Join thousands of neighbours who already share resources, co-create events, and keep Ottawa’s Habesha community thriving. It takes less than two minutes to create your profile.
                </p>
              </div>
              <div className="flex flex-col gap-3 rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-white/80 shadow-lg shadow-rose-500/40 backdrop-blur-lg">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Secure sign-up</span>
                  <span>Moderated platform</span>
                  <span>Multilingual</span>
                </div>
                {!isLoggedIn ? (
                  <button
                    onClick={() => {
                      setAuthMode('register')
                      setShowAuthModal(true)
                    }}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg shadow-white/40 transition hover:-translate-y-0.5 hover:bg-rose-50"
                  >
                    Create your Pomi account
                  </button>
                ) : (
                  <button
                    onClick={() => handleExploreFeature('events')}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg shadow-white/40 transition hover:-translate-y-0.5 hover:bg-rose-50"
                  >
                    Dive back into Pomi
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/70 py-12 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-2xl font-black text-white shadow-lg shadow-red-500/40">
                P
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Pomi Community Hub</p>
                <p className="text-lg font-black text-white">Ottawa</p>
              </div>
            </div>
            <p className="text-sm text-white/60">
              Designed by and for the Habesha community. Proudly rooted in culture, powered by modern technology.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>
                <button onClick={() => handleExploreFeature('events')} className="hover:text-white">
                  Events
                </button>
              </li>
              <li>
                <button onClick={() => handleExploreFeature('marketplace')} className="hover:text-white">
                  Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => handleExploreFeature('business')} className="hover:text-white">
                  Business directory
                </button>
              </li>
              <li>
                <button onClick={() => handleExploreFeature('forums')} className="hover:text-white">
                  Forums
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Support centre</li>
              <li>Guides for newcomers</li>
              <li>Community standards</li>
              <li>Privacy & safety</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Get in touch</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Email: support@pomi.community</li>
              <li>Instagram: @pomi.community</li>
              <li>Facebook: Pomi Ottawa Network</li>
              <li>LinkedIn: Pomi Community Hub</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Pomi Community Hub. Built by us, for us.
        </div>
      </footer>

      {/* Feature Modal */}
      {activeFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.6)]">
            <button
              onClick={() => setActiveFeature(null)}
              className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-lg text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              ×
            </button>

            {activeFeature === 'events' && (
              <Events
                onClose={() => setActiveFeature(null)}
                token={token}
                isAdmin={Boolean(currentUser?.isAdmin)}
                onRequestAdmin={handleOpenAdminInbox}
              />
            )}
            {activeFeature === 'business' && (
              <div className="space-y-6 text-white/80">
                <h2 className="text-3xl font-black text-white">Business Directory</h2>
                <p>
                  Browse the standalone directory of Habesha-owned businesses that the admin team has verified.
                  Discover what they offer, see contact details, and request introductions in seconds.
                </p>
                <button
                  onClick={() => {
                    navigate('/business')
                    setActiveFeature(null)
                  }}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow transition hover:-translate-y-0.5"
                >
                  Browse the directory
                </button>
              </div>
            )}
            {activeFeature === 'forums' && (
              <div className="space-y-6 text-white/80">
                <h2 className="text-3xl font-black text-white">Forums & Knowledge Threads</h2>
                <p>
                  Threaded discussions with upvotes, saved posts, and layered moderation make it easy to swap advice, spotlight wins, and document our stories in one place.
                </p>
                <button
                  onClick={() => {
                    navigate('/forums')
                    setActiveFeature(null)
                  }}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow transition hover:-translate-y-0.5"
                >
                  Start a conversation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ethiopian Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.65)]">
            <button
              onClick={() => setShowCalendarModal(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-lg text-white/70 transition hover:bg-white/20 hover:text-white"
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
              className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-lg text-white/70 transition hover:bg-white/20 hover:text-white"
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
              className="absolute right-4 top-4 rounded-full bg-gray-100 px-3 py-1 text-lg text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
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

    </div>
  )
}

export default App
