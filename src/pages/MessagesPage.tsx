import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Messaging from '../components/Messaging'
import authService from '../services/authService'

export default function MessagesPage() {
  const navigate = useNavigate()
  const user = authService.getUserData()
  const token = authService.getToken()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!token || !user) {
      navigate('/', { replace: true, state: { requireAuth: true } })
      return
    }
  }, [token, user, navigate])

  const handleBackNavigation = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }, [navigate])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackNavigation}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              aria-label="Go back"
            >
              <span className="text-base">←</span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-2xl font-black text-white shadow-lg shadow-red-500/40">
              P
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Pomi</p>
              <p className="text-lg font-black text-white">Messages</p>
            </div>
          </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">
              Welcome, <span className="font-semibold text-white">{user.username}</span>
            </span>
            <button
              onClick={() => {
                authService.removeToken()
                authService.clearUserData()
                navigate('/')
              }}
              className="rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/20 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Messages Section */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-black text-white">Direct Messages</h1>
            <p className="mt-2 text-lg text-white/70">
              Stay connected with community members and sellers
            </p>
          </div>

          {/* Messaging Component */}
          <Messaging currentUserId={user._id || ''} currentUserName={user.username} />
        </div>
      </div>

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -right-32 h-[420px] w-[420px] rounded-full bg-red-500/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-orange-500/20 blur-3xl" />
      </div>
    </div>
  )
}
