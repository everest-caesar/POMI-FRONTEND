import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import authService, { User } from '../services/authService'
import AdminPortal from '../components/AdminPortal'

const gradientBg =
  'bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-800 text-white min-h-screen flex flex-col'

const ADMIN_SUPPORT_EMAIL = 'support@pomi.community'

export default function AdminAccessPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getUserData())
  const [showPortal, setShowPortal] = useState(
    Boolean(authService.isAuthenticated() && currentUser?.isAdmin)
  )

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const token = useMemo(() => authService.getToken(), [showPortal, currentUser])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setCurrentUser(null)
      return
    }

    authService
      .getCurrentUser()
      .then((response) => {
        setCurrentUser(response.user)
        if (response.user.isAdmin) {
          setShowPortal(true)
        }
      })
      .catch(() => {
        authService.removeToken()
        authService.clearUserData()
        setCurrentUser(null)
        setShowPortal(false)
      })
  }, [])

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleLogout = () => {
    authService.removeToken()
    authService.clearUserData()
    setCurrentUser(null)
    setShowPortal(false)
    setSuccess('You have been signed out of the admin console.')
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()
    setLoading(true)

    try {
      const response = await authService.login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      })

      authService.setToken(response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      setCurrentUser(response.user)

      if (!response.user.isAdmin) {
        setError(
          'Access denied. Only the designated admin credential can open the console. Please contact the community lead if you need assistance.'
        )
        authService.removeToken()
        authService.clearUserData()
        setCurrentUser(null)
        return
      }

      setShowPortal(true)
      setSuccess('Welcome back! Launching the admin console…')
    } catch (err: any) {
      setError(
        err.message ||
          'Admin login failed. Confirm you are using the shared credential from the operations handbook.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (showPortal && token) {
    return (
      <AdminPortal
        token={token}
        onBack={() => {
          setShowPortal(false)
          setSuccess('Admin console closed. You can reopen it anytime.')
        }}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className={gradientBg}>
      <header className="border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            ← Back to Pomi
          </Link>
          <div className="text-sm text-white/70">
            Need help?{' '}
            <a href={`mailto:${ADMIN_SUPPORT_EMAIL}`} className="font-semibold text-white hover:underline">
              {ADMIN_SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </header>

  <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1.2fr,1fr]">
          <section className="space-y-6 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
              Admin access • Single credential
            </p>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Secure console for the Pomi operations team.
            </h1>
            <p className="text-sm text-white/70 md:text-base">
              Only one administrator account is active at any time. The credential is shared securely
              with the operations lead and rotates on a quarterly cadence. Reach out to the community lead if you
              require emergency access.
            </p>

            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-base">🔐</span>
                <span>Credential resets are coordinated through the operations handbook and secure email.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-base">🛡️</span>
                <span>Activity is logged for marketplace approvals, forum moderation, and business verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-base">🤝</span>
                <span>
                  Need another team member to help? Email{' '}
                  <a href={`mailto:${ADMIN_SUPPORT_EMAIL}`} className="font-semibold text-white underline decoration-rose-300/60 underline-offset-4">
                    {ADMIN_SUPPORT_EMAIL}
                  </a>{' '}
                  to request temporary access.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-xl backdrop-blur">
            <header className="space-y-2 text-center">
              <h2 className="text-2xl font-black text-white">Sign in</h2>
              <p className="text-sm text-white/60">
                Use the shared admin email and password from the operations handbook.
              </p>
            </header>

            {error && (
              <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  Admin email
                </label>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40"
                  placeholder="marakihay@gmail.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40"
                  placeholder="Enter admin password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Access admin console'}
              </button>
            </form>

            <p className="text-xs text-white/50">
              Lost the credential? Contact{' '}
              <a
                href={`mailto:${ADMIN_SUPPORT_EMAIL}`}
                className="font-semibold text-white underline decoration-rose-300/60 underline-offset-4"
              >
                {ADMIN_SUPPORT_EMAIL}
              </a>{' '}
              for a reset. Only one admin account is active at a time.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
