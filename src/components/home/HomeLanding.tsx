"use client"

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Palette,
  ShieldCheck,
  Building2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Sparkles,
  Heart,
  ArrowRight,
  Menu,
  X,
  LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { FeatureId } from '@/types/features'
import type { User as AuthUser } from '@/services/authService'

const stats = [
  { label: 'Newcomers welcomed', value: 1200, suffix: '+', color: 'bg-emerald-500', icon: Sparkles },
  { label: 'Connections made', value: 15000, suffix: '+', color: 'bg-amber-500', icon: Heart },
  { label: 'Events hosted', value: 320, suffix: '+', color: 'bg-rose-500', icon: Calendar },
]

const pillars = [
  {
    icon: Palette,
    title: 'Culture-first design',
    description:
      'Rooted in Habesha artistry with layered colour, language support, and typography that feels like home.',
    color: 'text-rose-400',
    href: '/forums',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted marketplace',
    description:
      'Moderated listings, verified sellers, and admin approvals keep buying, selling, and swapping safe for everyone.',
    color: 'text-sky-400',
    href: '/marketplace',
  },
  {
    icon: Building2,
    title: 'Business visibility',
    description:
      'Spotlight Habesha-owned businesses with profiles, contact details, and admin-approved spotlights in seconds.',
    color: 'text-amber-400',
    href: '/business',
  },
  {
    icon: MessageCircle,
    title: 'Forums & knowledge threads',
    description:
      'Threaded discussions with upvotes, saved posts, and moderation capture community wisdom for the long term.',
    color: 'text-violet-400',
    href: '/forums',
  },
]

type FeatureSlide = {
  id: FeatureId
  title: string
  description: string
  icon: LucideIcon
  color: string
  href: string
}

const features: FeatureSlide[] = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Discover trusted listings from neighbours-jobs, housing, services, and essentials.',
    icon: ShoppingBag,
    color: 'bg-amber-500',
    href: '/marketplace',
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Find cultural celebrations, community gatherings, and networking meetups near you.',
    icon: Calendar,
    color: 'bg-emerald-500',
    href: '/events',
  },
  {
    id: 'forums',
    title: 'Forums',
    description: 'Ask questions, share tips, and connect with neighbours who understand your journey.',
    icon: MessageCircle,
    color: 'bg-violet-500',
    href: '/forums',
  },
  {
    id: 'business',
    title: 'Directory',
    description: 'Support Habesha-owned businesses with verified profiles and community reviews.',
    icon: Building2,
    color: 'bg-rose-500',
    href: '/business',
  },
]

const testimonials = [
  {
    quote:
      'I sold household essentials within a day and met a fellow entrepreneur who became a mentor. Pomi feels like home.',
    name: 'Eyerusalem A.',
    role: 'Marketplace Seller & Mentor',
  },
  {
    quote:
      'Our community events used to scatter on WhatsApp. Now everything lives in one place, with RSVPs we can actually track.',
    name: 'Daniel H.',
    role: 'Event Organizer',
  },
  {
    quote:
      'As a newcomer, finding local services was tough. The business directory made it effortless to support Habesha-owned shops.',
    name: 'Hanna G.',
    role: 'Newcomer & Student',
  },
]

const trendingListings = [
  { name: 'yiebfirfffor', price: '$90', location: 'Kanata', views: 10 },
  { name: 'MacBook Pro 2021', price: '$1,200', location: 'Downtown Ottawa', views: 6 },
  { name: 'Ginger', price: '$15', location: 'Kanata', views: 8 },
  { name: 'Chemistry Textbook', price: '$80', location: 'Downtown Ottawa', views: 3 },
]

const navLinks = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Events', href: '/events' },
  { label: 'Directory', href: '/business' },
  { label: 'Forums', href: '/forums' },
]

interface HomeLandingProps {
  isLoggedIn: boolean
  currentUser: AuthUser | null
  flashMessage: string | null
  unreadAdminMessages: number
  unreadMessagesCount: number
  onLoginClick: () => void
  onRegisterClick: () => void
  onLogout: () => void
  onAdminInboxClick: () => void
  onCalendarClick: () => void
  onMessagesClick: () => void
  onExploreFeature: (feature: FeatureId) => void
  navigateTo: (path: string) => void
}

export function HomeLanding({
  isLoggedIn,
  currentUser,
  flashMessage,
  unreadAdminMessages,
  unreadMessagesCount,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onAdminInboxClick,
  onCalendarClick,
  onMessagesClick,
  onExploreFeature,
  navigateTo,
}: HomeLandingProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [statValues, setStatValues] = useState<number[]>(stats.map(() => 0))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    let frame: number

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setStatValues(stats.map((stat) => Math.floor(stat.value * progress)))
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const nextFeature = () => setCurrentFeature((prev) => (prev + 1) % features.length)
  const prevFeature = () => setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)

  const handleMessagesClick = () => {
    if (isLoggedIn) {
      onMessagesClick()
    } else {
      onLoginClick()
    }
  }

  const handleAdminClick = () => {
    if (isLoggedIn) {
      onAdminInboxClick()
    } else {
      onLoginClick()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pomi Community Hub</p>
              <p className="text-sm font-semibold text-white">Member access</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={handleMessagesClick}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
              {isLoggedIn && unreadMessagesCount > 0 && (
                <span className="ml-1 rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={handleAdminClick}
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
              {isLoggedIn && unreadAdminMessages > 0 && (
                <span className="ml-1 rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold">
                  {unreadAdminMessages > 9 ? '9+' : unreadAdminMessages}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={onCalendarClick}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
            {isLoggedIn ? (
              <>
                <span className="hidden text-sm text-slate-400 lg:inline">
                  Welcome, <span className="font-medium text-white">{currentUser?.username ?? 'Friend'}</span>
                </span>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-slate-700 bg-transparent hover:bg-slate-800"
                  onClick={onLoginClick}
                >
                  Log in
                </Button>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onRegisterClick}>
                  Join
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-300"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="ghost" className="justify-start text-slate-300" onClick={handleMessagesClick}>
                Messages
              </Button>
              <Button variant="ghost" className="justify-start text-slate-300" onClick={handleAdminClick}>
                Admin updates
              </Button>
              <Button variant="ghost" className="justify-start text-slate-300" onClick={onCalendarClick}>
                Calendar
              </Button>
            </div>
          </div>
        )}
      </header>

      {flashMessage && (
        <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-3 text-center text-sm font-semibold text-slate-100 shadow-lg shadow-slate-900/40">
          {flashMessage}
        </div>
      )}

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/10" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center">
                <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-slate-400">
                  <span className="text-lg">🌍</span>
                  <span className="text-sm font-medium">Habesha Community - Worldwide</span>
                </div>

                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  One digital home for culture, opportunity, and connection.
                </h1>

                <p className="mb-8 text-lg leading-relaxed text-slate-400 sm:text-xl">
                  Pomi brings together marketplace listings, cultural events, forums, faith circles, and a full business
                  directory-designed with love for our Habesha community everywhere we live.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => onExploreFeature('marketplace')}
                  >
                    Explore Marketplace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-slate-700 bg-transparent text-white hover:bg-slate-800"
                    onClick={isLoggedIn ? handleMessagesClick : onLoginClick}
                  >
                    {isLoggedIn ? 'Open messages' : 'Switch account'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Community Pulse</p>
                {stats.map((stat, index) => (
                  <div key={stat.label} className={`${stat.color} rounded-xl p-5 transition-transform hover:scale-[1.02]`}>
                    <div className="flex items-center gap-3">
                      <stat.icon className="h-5 w-5 text-white/80" />
                      <span className="text-sm font-medium text-white/90">{stat.label}</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {statValues[index]?.toLocaleString() ?? 0}
                      {stat.suffix || ''}
                    </p>
                  </div>
                ))}
                <p className="text-xs text-slate-500">Stats updated weekly based on verified engagement inside the Pomi network.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pillars" className="border-t border-slate-800 bg-slate-900/50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Community Pillars</p>
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ground every feature in culture, trust, and collaboration.
                </h2>
                <p className="mb-6 text-slate-400">
                  We review these pillars every sprint so product decisions stay transparent and anchored in what matters
                  most to the community.
                </p>
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-slate-400">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">How we measure success</p>
                  <p>
                    Every release is reviewed against these pillars-design warmth, trust guardrails, and end-to-end
                    connected experiences. When something new ships, it should light up at least one pillar and never
                    compromise the others.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                {pillars.map((pillar) => (
                  <Link to={pillar.href} key={pillar.title}>
                    <div className="h-full rounded-xl border border-slate-700 bg-slate-800/30 p-6 transition-all hover:border-slate-600 hover:bg-slate-800/50 hover:scale-[1.02] cursor-pointer">
                      <pillar.icon className={`mb-4 h-8 w-8 ${pillar.color}`} />
                      <h3 className="mb-2 text-lg font-semibold text-white">{pillar.title}</h3>
                      <p className="text-sm text-slate-400">{pillar.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="experiences" className="border-t border-slate-800 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-start justify-between gap-8 lg:items-center">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Community Pillars</p>
                <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Explore every layer of community life inside Pomi.
                </h2>
                <p className="text-slate-400">
                  Tap into curated experiences-from job leads and classifieds to cultural celebrations, community
                  gatherings, and secure moderation tools.
                </p>
              </div>
              <div className="hidden rounded-xl border border-slate-700 bg-slate-800/50 p-4 lg:block lg:max-w-xs">
                <p className="mb-1 text-sm font-semibold text-white">Pro tip</p>
                <p className="text-xs text-slate-400">
                  Moderators see additional tools after they sign in with the team's admin credentials. Reach out to
                  community leadership if you need elevated access.
                </p>
              </div>
            </div>

            <div className={`relative overflow-hidden rounded-2xl ${features[currentFeature].color} p-8 sm:p-12 lg:p-16`}>
              <div className="flex flex-col items-center text-center">
                {(() => {
                  const IconComponent = features[currentFeature].icon
                  return <IconComponent className="mb-6 h-16 w-16 text-white/90" />
                })()}
                <h3 className="mb-4 text-4xl font-bold text-white sm:text-5xl">{features[currentFeature].title}</h3>
                <p className="max-w-lg text-lg text-white/90">{features[currentFeature].description}</p>
              </div>

              <button
                onClick={prevFeature}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={nextFeature}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Feature {currentFeature + 1} of {features.length}
              </p>
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={features[index].id}
                    onClick={() => setCurrentFeature(index)}
                    className={`h-2 rounded-full transition-all ${index === currentFeature ? 'w-6 bg-orange-500' : 'w-2 bg-slate-600'}`}
                    aria-label={`Go to feature ${features[index].title}`}
                  />
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => onExploreFeature(features[currentFeature].id)}
            >
              Explore {features[currentFeature].title}
            </Button>
          </div>
        </section>

        <section className="border-t border-slate-800 bg-gradient-to-b from-slate-950 to-rose-950/20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Discover listings shared by neighbours across Ottawa
              </h2>
              <p className="text-slate-400">
                Create listings, browse essentials, and support Habesha-owned services. Posting requires a Pomi account;
                browsing is open to everyone.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="relative rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-50 to-rose-50 p-6 sm:p-8 text-slate-900">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1">
                  <ShoppingBag className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Marketplace - Powered by our community</span>
                </div>

                <h3 className="mb-4 text-3xl font-bold sm:text-4xl">
                  Discover trusted listings from neighbours you know.
                </h3>
                <p className="mb-6 text-slate-600">
                  Buy, sell, and swap within Ottawa's Ethiopian community. Find unique products, reliable services, and
                  everyday essentials-safely and effortlessly.
                </p>

                <Button
                  size="lg"
                  className="mb-6 w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => onExploreFeature('marketplace')}
                >
                  + Create listing
                </Button>

                <div className="mb-6 rounded-lg border border-orange-200 bg-orange-100/50 p-4 text-sm">
                  <p className="mb-1 font-semibold text-orange-700">Pending admin review</p>
                  <p className="text-xs text-orange-600">
                    Share your listing and the admin team will approve it before it appears in the marketplace. Check the
                    admin portal for status.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">8</p>
                    <p className="text-xs text-slate-500">Active Listings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">1</p>
                    <p className="text-xs text-slate-500">New This Week</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">5</p>
                    <p className="text-xs text-slate-500">Community Sellers</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
                <h4 className="mb-4 text-lg font-semibold text-white">Trending this week</h4>
                <div className="space-y-4">
                  {trendingListings.map((listing) => (
                    <Link to="/marketplace" key={listing.name}>
                      <div className="flex items-center gap-4 rounded-lg bg-slate-900/50 p-3 hover:bg-slate-900 transition-colors cursor-pointer">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700">
                          <ShoppingBag className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{listing.name}</p>
                          <p className="text-sm text-slate-400">
                            {listing.price} - {listing.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <span className="h-2 w-2 rounded-full bg-orange-500" />
                          {listing.views}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-slate-700 text-white hover:bg-slate-700"
                  onClick={() => navigateTo('/marketplace')}
                >
                  Browse all listings
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-800 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">Business spotlight</p>
                <h3 className="mb-4 text-3xl font-bold text-white">Directory, reviews, and admin-approved highlights.</h3>
                <p className="text-slate-400">
                  Spotlight Habesha-owned businesses with profiles, contact details, and admin-approved spotlights in
                  seconds. Verified badges help the community find and trust local services.
                </p>
                <div className="mt-6 space-y-3">
                  {['Verified listings & hours', 'Community testimonials', 'Admin spotlights & features'].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-slate-300">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Button className="mt-6 bg-emerald-500 hover:bg-emerald-600" onClick={() => navigateTo('/business')}>
                  Browse businesses
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-rose-400">Forums</p>
                <h3 className="mb-4 text-3xl font-bold text-white">Threaded discussions & knowledge sharing.</h3>
                <p className="text-slate-400">
                  Ask questions, share tips, and connect with neighbours who understand your journey. Save threads for
                  later, upvote helpful answers, and learn from community leaders.
                </p>
                <Button className="mt-6" onClick={() => navigateTo('/forums')}>
                  Jump into forums
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="border-t border-slate-800 bg-slate-950 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Voices</p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                "Pomi feels like walking into a community centre-online."
              </h2>
              <p className="mt-4 text-slate-400">
                Members use Pomi to buy and sell essentials, secure new roles, launch cultural events, and mentor the next
                generation.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="text-lg font-medium text-white/90">"{testimonial.quote}"</p>
                  <div className="mt-4 text-sm text-slate-400">
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-800 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-8 sm:p-12 lg:p-16">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                    <span className="text-white">🎁</span>
                    <span className="text-sm font-medium text-white">Membership is free</span>
                  </div>
                  <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                    Ready to unlock opportunity, culture, and community in one home?
                  </h2>
                  <p className="text-white/90">
                    Join thousands of neighbours who already share resources, co-create events, and keep the Habesha
                    community thriving. It takes less than two minutes to create your profile.
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="mb-6 flex flex-wrap gap-4 text-sm text-white/80">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Secure sign-up
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> Moderated platform
                    </span>
                    <span className="flex items-center gap-2">
                      <Palette className="h-4 w-4" /> Multilingual
                    </span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold sm:w-auto"
                    onClick={isLoggedIn ? () => onExploreFeature('events') : onRegisterClick}
                  >
                    {isLoggedIn ? 'Dive back into Pomi' : 'Create your Pomi account'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600">
                  <span className="text-lg font-bold text-white">P</span>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pomi Community Hub</p>
                  <p className="text-sm font-semibold text-white">Community</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Designed by and for the Habesha community. Proudly rooted in culture, powered by modern technology.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Platform</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Events', href: '/events' },
                  { label: 'Marketplace', href: '/marketplace' },
                  { label: 'Business directory', href: '/business' },
                  { label: 'Forums', href: '/forums' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Support centre</li>
                <li>Guides for newcomers</li>
                <li>Community standards</li>
                <li>Privacy & safety</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Get in Touch</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Email: support@pomi.community</li>
                <li>Instagram: @pomi.community</li>
                <li>Facebook: Pomi Community Network</li>
                <li>LinkedIn: Pomi Community Hub</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8 text-center">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Pomi Community Hub. Built by us, for us.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
