import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  }
  repliesCount?: number
  viewsCount?: number
  createdAt: string
}

interface ForumReply {
  _id: string
  content: string
  authorName: string
  createdAt: string
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

const getCommunityLabel = (category: string) => {
  switch (category) {
    case 'general':
      return 'Community Pulse'
    case 'culture':
      return 'Culture & Celebrations'
    case 'business':
      return 'Marketplace & Business'
    case 'education':
      return 'Newcomers & Education'
    case 'technology':
      return 'Tech & Careers'
    case 'events':
      return 'Events & Meetups'
    case 'health':
      return 'Health & Wellness'
    case 'other':
    default:
      return 'Open Topics'
  }
}

export default function ForumPostPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [loadingPost, setLoadingPost] = useState(true)
  const [loadingReplies, setLoadingReplies] = useState(true)
  const [postError, setPostError] = useState<string | null>(null)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const isAuthenticated = authService.isAuthenticated()

  const fetchPost = useCallback(async () => {
    if (!postId) return
    setLoadingPost(true)
    setPostError(null)
    try {
      const response = await axiosInstance.get(`/forums/posts/${postId}`)
      const payload = response.data?.data || response.data?.post || response.data
      setPost(payload)
    } catch (err: any) {
      setPostError(err.message || 'Unable to load this thread.')
      setPost(null)
    } finally {
      setLoadingPost(false)
    }
  }, [postId])

  const fetchReplies = useCallback(async () => {
    if (!postId) return
    setLoadingReplies(true)
    setReplyError(null)
    try {
      const response = await axiosInstance.get(`/forums/posts/${postId}/replies`, {
        params: { limit: 100 },
      })
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : response.data?.replies || []
      setReplies(payload)
    } catch (err: any) {
      setReplyError(err.message || 'Unable to load replies right now.')
      setReplies([])
    } finally {
      setLoadingReplies(false)
    }
  }, [postId])

  useEffect(() => {
    void fetchPost()
    void fetchReplies()
  }, [fetchPost, fetchReplies])

  const handleAddReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!postId) return
    if (!isAuthenticated) {
      setReplyError('Please log in to participate in the discussion.')
      return
    }
    if (!replyContent.trim()) {
      setReplyError('Share a quick note before posting.')
      return
    }

    setSubmittingReply(true)
    setReplyError(null)
    try {
      await axiosInstance.post(`/forums/posts/${postId}/replies`, {
        content: replyContent.trim(),
      })
      setReplyContent('')
      await fetchReplies()
    } catch (err: any) {
      setReplyError(err.message || 'Failed to send reply.')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/forums')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackNavigation}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
            >
              ← Back
            </button>
            <Link
              to="/forums"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Forums home
            </Link>
          </div>
          <div className="text-right text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Pomi Forums
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        {loadingPost ? (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-sm text-white/70">
            Loading thread…
          </div>
        ) : postError ? (
          <div className="rounded-3xl border border-rose-300/40 bg-rose-500/10 p-10 text-center text-sm text-rose-100">
            {postError}
          </div>
        ) : post ? (
          <article className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg shadow-slate-900/40 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span className="font-semibold text-white">
                {getCommunityLabel(post.category)}
              </span>
              <span>•</span>
              <span>{post.authorName || 'Community member'}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>

            <h1 className="text-3xl font-black text-white">{post.title}</h1>
            <p className="text-base text-white/90 whitespace-pre-line">{post.content}</p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span>💬 {post.repliesCount ?? replies.length} replies</span>
              <span>👀 {post.viewsCount ?? 0} views</span>
            </div>
          </article>
        ) : null}

        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Replies</h2>
            <span className="text-xs text-white/60">{replies.length} contributed</span>
          </div>

          {loadingReplies ? (
            <p className="text-sm text-white/70">Loading replies…</p>
          ) : replies.length === 0 ? (
            <p className="text-sm text-white/70">
              No replies yet. Be the first to nudge this conversation forward.
            </p>
          ) : (
            <ul className="space-y-4">
              {replies.map((reply) => (
                <li
                  key={reply._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                >
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{reply.authorName || 'Community member'}</span>
                    <span>{formatRelativeTime(reply.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line">{reply.content}</p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddReply} className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Add your voice
            </label>
            <textarea
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40"
              placeholder={
                isAuthenticated
                  ? 'Share an insight, a resource, or encouragement…'
                  : 'Sign in to reply.'
              }
              disabled={!isAuthenticated}
            />
            {replyError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
                {replyError}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isAuthenticated || submittingReply}
                className="rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingReply ? 'Posting…' : 'Post reply'}
              </button>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-white/60">
                You need to sign in to join the discussion.
              </p>
            )}
          </form>
        </section>

        <div className="text-center text-sm text-white/70">
          Looking for more?{' '}
          <Link to="/forums" className="font-semibold text-white underline decoration-rose-300/60">
            Return to the forum feed
          </Link>
        </div>
      </main>
    </div>
  )
}
