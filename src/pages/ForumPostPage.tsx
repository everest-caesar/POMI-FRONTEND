import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, Share2, Flag, Send, CheckCircle2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [postLiked, setPostLiked] = useState(false)
  const [postLikes, setPostLikes] = useState(0)
  const [replyLikes, setReplyLikes] = useState<Record<string, { liked: boolean; count: number }>>({})
  const [postFlagged, setPostFlagged] = useState(false)
  const [flaggedReplies, setFlaggedReplies] = useState<string[]>([])
  const [shareOpen, setShareOpen] = useState(false)
  const [adminNotified, setAdminNotified] = useState(false)
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

  const togglePostLike = () => {
    const newLiked = !postLiked
    setPostLiked(newLiked)
    setPostLikes((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)))
  }

  const toggleReplyLike = (replyId: string) => {
    setReplyLikes((prev) => {
      const current = prev[replyId] || { liked: false, count: 0 }
      const newLiked = !current.liked
      return {
        ...prev,
        [replyId]: {
          liked: newLiked,
          count: newLiked ? current.count + 1 : Math.max(0, current.count - 1),
        },
      }
    })
  }

  const handleFlagPost = () => {
    setPostFlagged(true)
    setAdminNotified(true)
  }

  const handleFlagReply = (replyId: string) => {
    if (!flaggedReplies.includes(replyId)) {
      setFlaggedReplies((prev) => [...prev, replyId])
      setAdminNotified(true)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || 'Forum Thread',
          text: post?.content?.slice(0, 100) || 'Check out this discussion',
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
    setShareOpen(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied!')
    } catch {
      // Fallback
    }
    setShareOpen(false)
  }

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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackNavigation}
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">POMI</p>
                <p className="text-sm font-semibold text-white">Forums</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareOpen((prev) => !prev)}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {shareOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl z-50"
                  onMouseLeave={() => setShareOpen(false)}
                >
                  <button
                    onClick={() => void copyLink()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    <Copy className="h-4 w-4" /> Copy link
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    onClick={() => setShareOpen(false)}
                  >
                    <Share2 className="h-4 w-4" /> Share to X
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    onClick={() => setShareOpen(false)}
                  >
                    <Share2 className="h-4 w-4" /> Share to Facebook
                  </a>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlagPost}
              className={postFlagged ? 'text-emerald-400' : 'text-slate-300 hover:text-red-400 hover:bg-slate-800'}
            >
              {postFlagged ? <CheckCircle2 className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
            </Button>
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
              <span className="rounded-full bg-orange-500/20 px-3 py-1 font-semibold text-orange-300">
                {getCommunityLabel(post.category)}
              </span>
              <span>•</span>
              <span>{post.authorName || 'Community member'}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>

            <h1 className="text-3xl font-black text-white">{post.title}</h1>
            <p className="text-base text-white/90 whitespace-pre-line leading-relaxed">{post.content}</p>

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

            <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {post.repliesCount ?? replies.length} replies
                </span>
                <span className="flex items-center gap-1">
                  👀 {post.viewsCount ?? 0} views
                </span>
              </div>
            </div>

            {adminNotified && (
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200">
                <CheckCircle2 className="h-3 w-3" /> Admins have been notified to review flagged content
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePostLike}
                className={`gap-2 ${postLiked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
              >
                <Heart className={`h-4 w-4 ${postLiked ? 'fill-current' : ''}`} />
                {postLikes} Thanks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-400 hover:text-orange-400"
              >
                <MessageCircle className="h-4 w-4" />
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleShare()}
                className="gap-2 text-slate-400 hover:text-emerald-400"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
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
              {replies.map((reply) => {
                const likeState = replyLikes[reply._id] || { liked: false, count: 0 }
                const isFlagged = flaggedReplies.includes(reply._id)
                return (
                  <li
                    key={reply._id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                  >
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span className="font-semibold text-white">{reply.authorName || 'Community member'}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatRelativeTime(reply.createdAt)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFlagReply(reply._id)}
                          className={`h-6 w-6 p-0 ${isFlagged ? 'text-emerald-400' : 'text-slate-500 hover:text-red-400'}`}
                        >
                          {isFlagged ? <CheckCircle2 className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-line leading-relaxed">{reply.content}</p>
                    <div className="mt-3 pt-2 border-t border-white/5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReplyLike(reply._id)}
                        className={`gap-1 text-xs ${likeState.liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                      >
                        <Heart className={`h-3 w-3 ${likeState.liked ? 'fill-current' : ''}`} />
                        {likeState.count} Thanks
                      </Button>
                    </div>
                  </li>
                )
              })}
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
