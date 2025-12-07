import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import authService from '../services/authService'

interface ForumPost {
  _id: string
  title: string
  content: string
  category: string
  tags?: string[]
  authorName: string
  authorId?: {
    _id: string
    username: string
    email?: string
  }
  repliesCount?: number
  viewsCount?: number
  upvotes?: number
  createdAt: string
}

const COMMUNITY_CONFIG = [
  {
    id: 'general',
    label: 'Community Pulse',
    description: 'Neighbourly updates, wins, and everyday check-ins.',
    badge: '🌍',
  },
  {
    id: 'culture',
    label: 'Culture & Celebrations',
    description: 'Food, art, language, and holiday planning.',
    badge: '🎨',
  },
  {
    id: 'business',
    label: 'Marketplace & Business',
    description: 'Buying, selling, services, and entrepreneurship.',
    badge: '🛍️',
  },
  {
    id: 'education',
    label: 'Newcomers & Education',
    description: 'Schooling, admissions, tutoring, and mentorship.',
    badge: '📚',
  },
  {
    id: 'technology',
    label: 'Tech & Careers',
    description: 'Job leads, interview prep, and technical help.',
    badge: '💼',
  },
  {
    id: 'events',
    label: 'Events & Meetups',
    description: 'Coordinate hangouts, volunteer drives, and tours.',
    badge: '🎉',
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    description: 'Mental health, family care, and support circles.',
    badge: '🩺',
  },
  {
    id: 'other',
    label: 'Open Topics',
    description: 'Anything that doesn’t fit neatly elsewhere.',
    badge: '✨',
  },
]

const DEFAULT_POST_FORM = {
  title: '',
  content: '',
  category: 'general',
  tagsText: '',
}

const formatRelativeTime = (value: string) => {
  const date = new Date(value)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
  })
}

export default function ForumPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCommunity, setActiveCommunity] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSort, setSelectedSort] = useState<'top' | 'new'>('top')
  const [showComposer, setShowComposer] = useState(false)
  const [composerForm, setComposerForm] = useState(DEFAULT_POST_FORM)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [composerSuccess, setComposerSuccess] = useState<string | null>(null)
  const [composerLoading, setComposerLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filtersHydrated, setFiltersHydrated] = useState(false)
  const lastSyncedQueryRef = useRef(location.search)

  const isAuthenticated = authService.isAuthenticated()
  const isAdmin = Boolean(authService.getUserData()?.isAdmin)

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, navigate])

  useEffect(() => {
    if (filtersHydrated && location.search === lastSyncedQueryRef.current) {
      return
    }

    const params = new URLSearchParams(location.search)
    const communityParam = params.get('community')
    const searchParam = params.get('search')
    const sortParam = params.get('sort')

    if (communityParam && COMMUNITY_CONFIG.some((community) => community.id === communityParam)) {
      setActiveCommunity(communityParam)
    } else {
      setActiveCommunity('all')
    }

    if (searchParam !== null) {
      setSearchInput(searchParam)
      setSearchTerm(searchParam)
    } else {
      setSearchInput('')
      setSearchTerm('')
    }

    if (sortParam === 'new') {
      setSelectedSort('new')
    } else {
      setSelectedSort('top')
    }

    lastSyncedQueryRef.current = location.search
    setFiltersHydrated(true)
  }, [filtersHydrated, location.search])

  useEffect(() => {
    if (!filtersHydrated) {
      return
    }

    const params = new URLSearchParams()
    if (activeCommunity !== 'all') {
      params.set('community', activeCommunity)
    }
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    }
    if (selectedSort === 'new') {
      params.set('sort', 'new')
    }

    const queryString = params.toString()
    const normalized = queryString ? `?${queryString}` : ''
    if (normalized === lastSyncedQueryRef.current) {
      return
    }

    lastSyncedQueryRef.current = normalized
    navigate({ pathname: location.pathname, search: normalized }, { replace: true })
  }, [activeCommunity, searchTerm, selectedSort, filtersHydrated, navigate, location.pathname])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get('/forums/posts', {
        params: {
          category: activeCommunity !== 'all' ? activeCommunity : undefined,
          search: searchTerm || undefined,
          limit: 60,
        },
      })

      const apiPosts: ForumPost[] = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : response.data?.posts || []

      setPosts(apiPosts)
    } catch (err: any) {
      setError(err.message || 'Unable to load threads right now.')
      setPosts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeCommunity, searchTerm])

  useEffect(() => {
    if (!filtersHydrated) {
      return
    }
    void fetchPosts()
  }, [fetchPosts, filtersHydrated])

  const visiblePosts = useMemo(() => {
    const subset =
      activeCommunity === 'all'
        ? posts
        : posts.filter((post) => post.category === activeCommunity)

    const filteredSubset = searchTerm
      ? subset.filter(
          (post) =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : subset

    const sorted = [...filteredSubset]
    if (selectedSort === 'top') {
      sorted.sort((a, b) => {
        const aScore = (a.repliesCount || 0) * 2 + (a.viewsCount || 0)
        const bScore = (b.repliesCount || 0) * 2 + (b.viewsCount || 0)
        if (bScore === aScore) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return bScore - aScore
      })
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }

    return sorted
  }, [posts, activeCommunity, searchTerm, selectedSort])

  const trendingCommunities = useMemo(() => {
    const counts = posts.reduce(
      (map, post) => map.set(post.category, (map.get(post.category) || 0) + 1),
      new Map<string, number>(),
    )

    return COMMUNITY_CONFIG.map((community) => ({
      ...community,
      total: counts.get(community.id) || 0,
    }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
  }, [posts])

  const trendingThreads = useMemo(() => {
    if (activeCommunity === 'all') return []

    // Get posts from the active community only
    const communityPosts = posts.filter(post => post.category === activeCommunity)

    // Sort by upvotes to show trending threads
    return communityPosts
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 5)
  }, [posts, activeCommunity])

  const activeFilterBadges = useMemo(() => {
    const badges: string[] = []

    if (activeCommunity !== 'all') {
      const label =
        COMMUNITY_CONFIG.find((community) => community.id === activeCommunity)?.label ??
        'Community filter'
      badges.push(label)
    }

    const trimmedSearch = searchTerm.trim()
    if (trimmedSearch) {
      badges.push(`Search: ${trimmedSearch}`)
    }

    if (selectedSort === 'new') {
      badges.push('Newest first')
    }

    return badges
  }, [activeCommunity, searchTerm, selectedSort])

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchTerm(searchInput.trim())
  }

  const handleResetFilters = () => {
    setActiveCommunity('all')
    setSearchInput('')
    setSearchTerm('')
    setSelectedSort('top')
    setRefreshing(true)
    void fetchPosts()
  }

  const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isAuthenticated) {
      setComposerError('Please log in to share a thread with the community.')
      return
    }

    if (!composerForm.title.trim() || !composerForm.content.trim()) {
      setComposerError('Title and message are required.')
      return
    }

    setComposerLoading(true)
    setComposerError(null)
    setComposerSuccess(null)

    try {
      const tags = composerForm.tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      await axiosInstance.post('/forums/posts', {
        title: composerForm.title.trim(),
        content: composerForm.content.trim(),
        category: composerForm.category,
        tags,
      })

      setComposerSuccess('Thread published! Thanks for sharing with neighbours.')
      setComposerForm(DEFAULT_POST_FORM)
      setShowComposer(false)
      setRefreshing(true)
      await fetchPosts()
    } catch (err: any) {
      setComposerError(err.message || 'Failed to publish thread.')
    } finally {
      setComposerLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    void fetchPosts()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            ← Home
          </Link>
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Pomi Forums
            </div>
            <h1 className="text-xl font-black text-white md:text-2xl">
              Crowd wisdom for every stage of the newcomer journey
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          <div className="space-y-4 rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                  Powered by the community
                </span>
                <h2 className="text-3xl font-black text-white md:text-4xl">
                  Ask questions, swap tips, and celebrate wins together.
                </h2>
                <p className="text-sm text-slate-200 md:text-base">
                  Pick a community, share an update, and help the next neighbour in line. Inspired by
                  Reddit’s best practices—but rooted in Ottawa’s Habesha community.
                </p>
              </div>
              <div className="flex flex-col gap-3 text-right text-sm text-white/70">
                <p>
                  {posts.length}{' '}
                  {posts.length === 1 ? 'active thread' : 'active threads'}
                </p>
                <button
                  onClick={() => setShowComposer(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5"
                >
                  ✍️ Start a thread
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-wrap items-center gap-3"
            >
              <div className="relative flex-1 min-w-[220px]">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search threads (housing, job tips, events...)"
                  className="w-full rounded-2xl border border-white/15 bg-white/90 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  🔍
                </span>
              </div>
              <button
                type="submit"
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-2xl border border-transparent px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
              >
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCommunity('all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCommunity === 'all'
                    ? 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/40'
                    : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                All communities
              </button>
              {COMMUNITY_CONFIG.map((community) => (
                <button
                  key={community.id}
                  onClick={() => setActiveCommunity(community.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCommunity === community.id
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/30'
                      : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {community.badge} {community.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span>Sort by:</span>
              <button
                onClick={() => setSelectedSort('top')}
                className={`rounded-full px-3 py-1 font-semibold ${
                  selectedSort === 'top'
                    ? 'bg-white/20 text-white'
                    : 'border border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setSelectedSort('new')}
                className={`rounded-full px-3 py-1 font-semibold ${
                  selectedSort === 'new'
                    ? 'bg-white/20 text-white'
                    : 'border border-white/15 text-white/70 hover:border-white/30 hover:text-white'
                }`}
              >
                Newest
              </button>
            </div>
            {activeFilterBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span>Active filters:</span>
                {activeFilterBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white"
                  >
                    {badge}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-full border border-transparent px-3 py-1 font-semibold text-white/70 transition hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {!loading && !error && (
            <p className="text-xs text-white/60">
              Showing {visiblePosts.length}{' '}
              {visiblePosts.length === 1 ? 'thread' : 'threads'}
            </p>
          )}

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-sm text-white/70">
              Loading the latest conversations…
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 p-8 text-center text-sm text-rose-100">
              {error}
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur">
              <p className="text-lg font-semibold text-white">
                No threads match these filters yet.
              </p>
              <p className="mt-2 text-sm">
                Try another community or be the first to start the conversation.
              </p>
              <button
                onClick={() => setShowComposer(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5"
              >
                ✍️ Share a thread
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {visiblePosts.map((post) => (
                <article
                  key={post._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1"
                >
                  <header className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                    <span className="font-semibold text-white">
                      {
                        COMMUNITY_CONFIG.find(
                          (community) => community.id === post.category,
                        )?.label ?? 'Community'
                      }
                    </span>
                    <span>•</span>
                    <span>{post.authorName || 'Community member'}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                  </header>

                  <Link to={`/forums/${post._id}`} className="mt-3 block space-y-3">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <p className="text-sm text-white/80 line-clamp-3">{post.content}</p>
                  </Link>

                  <footer className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/60">
                    <span>💬 {post.repliesCount ?? 0} replies</span>
                    <span>👀 {post.viewsCount ?? 0} views</span>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      to={`/forums/${post._id}`}
                      className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                      View thread →
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              {activeCommunity === 'all' ? 'Trending communities' : 'Trending threads'}
            </h3>
            <ul className="space-y-3">
              {activeCommunity === 'all' ? (
                trendingCommunities.map((community, index) => (
                  <li
                    key={community.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white/50">{index + 1}</span>
                      <div>
                        <p className="font-semibold text-white">
                          {community.badge} {community.label}
                        </p>
                        <p className="text-xs text-white/60">{community.description}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {community.total} threads
                    </span>
                  </li>
                ))
              ) : (
                trendingThreads.length > 0 ? (
                  trendingThreads.map((thread, index) => (
                    <li
                      key={thread._id}
                      className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition"
                      onClick={() => navigate(`/forums/${thread._id}`)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-bold text-white/50">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm line-clamp-2">
                            {thread.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                            <span>⬆️ {thread.upvotes || 0}</span>
                            <span>💬 {thread.repliesCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-white/50 text-sm py-4 text-center">
                    No threads yet in this community
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Quick guidelines
            </h3>
            <ul className="space-y-2">
              <li>Be kind and assume good intent.</li>
              <li>No spam or cold DMs—protect the community.</li>
              <li>Tag posts so the right neighbours can help.</li>
              <li>Report anything suspicious so admins can review.</li>
            </ul>
          </div>
        </aside>
      </main>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
          <div className="relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl">
            <button
              onClick={() => setShowComposer(false)}
              className="absolute right-4 top-4 rounded-full bg-red-500 hover:bg-red-600 px-3 py-1 text-lg text-white font-bold transition shadow-lg shadow-red-500/50 ring-2 ring-red-200"
            >
              ×
            </button>
            <h3 className="text-2xl font-black text-slate-900">Start a new thread</h3>
            <p className="mt-1 text-sm text-slate-500">
              Share advice, a question, or a celebration. Clear titles help others find it later.
            </p>

            {composerError && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {composerError}
              </div>
            )}
            {composerSuccess && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {composerSuccess}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title
                </label>
                <input
                  value={composerForm.title}
                  onChange={(event) =>
                    setComposerForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                  placeholder="Share the key takeaway in one line"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Community
                  </label>
                  <select
                    value={composerForm.category}
                    onChange={(event) =>
                      setComposerForm((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                  >
                    {COMMUNITY_CONFIG.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tags (optional)
                  </label>
                  <input
                    value={composerForm.tagsText}
                    onChange={(event) =>
                      setComposerForm((prev) => ({ ...prev, tagsText: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                    placeholder="housing, job, meetup"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Message
                </label>
                <textarea
                  value={composerForm.content}
                  onChange={(event) =>
                    setComposerForm((prev) => ({ ...prev, content: event.target.value }))
                  }
                  rows={6}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                  placeholder="Include context, what you need, or advice to share."
                  required
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={composerLoading}
                  className="rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {composerLoading ? 'Publishing…' : 'Publish thread'}
                </button>
              </div>
              {!isAuthenticated && (
                <p className="text-xs text-rose-500">
                  You need an account to post. Sign in or register to join the conversation.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
