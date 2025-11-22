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
  const trustSignals = [
    {
      icon: '🔐',
      title: 'Single credential control',
      body: 'Only one admin identity is active at a time. Every action is traceable.',
    },
    {
      icon: '🛡️',
      title: 'Audit-ready logging',
      body: 'Marketplace approvals, messages, and deletions are stored for compliance reviews.',
    },
    {
      icon: '📊',
      title: 'Operations handbook',
      body: 'Credential rotation and escalation steps live in the internal handbook.',
    },
    {
      icon: '🤝',
      title: 'Two-person integrity',
      body: 'Credential resets require the community lead plus one core maintainer.',
    },
  ]

  const securityChecklist = [
    'Always log out after moderating from a shared machine.',
    'Rotate the admin password immediately after large campaigns or incidents.',
    'Use the admin inbox to notify members—avoid personal email threads.',
    `Escalate suspicious access attempts to ${ADMIN_SUPPORT_EMAIL}.`,
  ]

  const continuityTimeline = [
    {
      step: '01',
      title: 'Credential rotation',
      detail: 'Planned quarterly. Emergency rotations can be triggered sooner.',
    },
    {
      step: '02',
      title: 'Marketplace audit',
      detail: 'Weekly review of pending listings, businesses, and events.',
    },
    {
      step: '03',
      title: 'Comms sync',
      detail: 'Broadcast safety or celebration notes via the admin messaging hub.',
    },
  ]

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
      const response = await authService.adminLogin({
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
    <div className={`${gradientBg} relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-6 h-60 w-60 rounded-full bg-rose-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
      </div>
      <header className="relative border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 text-white">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            ← Back to Pomi
          </Link>
          <div className="text-xs text-white/70">
            Operations desk:{' '}
            <a
              href={`mailto:${ADMIN_SUPPORT_EMAIL}`}
              className="font-semibold text-white underline decoration-rose-300/60 underline-offset-4"
            >
              {ADMIN_SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex-1 px-6 py-12 text-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <section className="space-y-8 rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-rose-200">
                Admin cockpit • Trusted access only
              </p>
              <h1 className="mt-4 text-3xl font-black md:text-4xl">
                Professional-grade console for Pomi operations.
              </h1>
              <p className="mt-3 text-sm text-white/80 md:text-base">
                Approvals, escalations, and community broadcasts are all handled within this secure
                interface. The credential is distributed via the operations handbook and rotates every
                quarter—or sooner if a security incident occurs.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {trustSignals.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 shadow-lg shadow-slate-900/40"
                >
                  <div className="text-2xl">{item.icon}</div>
                  <p className="mt-3 text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
                Operations rhythm
              </p>
              <div className="space-y-4">
                {continuityTimeline.map((item) => (
                  <div
                    key={item.step}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div className="text-2xl font-black text-white/60">{item.step}</div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-white/70">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl">
              <div className="space-y-1 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                  Secure login
                </p>
                <h2 className="text-2xl font-black text-slate-900">Unlock the admin console</h2>
                <p className="text-sm text-slate-500">
                  Use the credential from the operations handbook. Sessions automatically expire after
                  inactivity.
                </p>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-6 space-y-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Admin email
                  </label>
                  <input
                    type="email"
                    autoComplete="username"
                    required
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="admin@pomi.community"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
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
                    placeholder="Enter admin password"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Access admin console'}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Problems signing in? Email{' '}
                  <a
                    href={`mailto:${ADMIN_SUPPORT_EMAIL}`}
                    className="font-semibold text-rose-500 underline decoration-rose-200 underline-offset-4"
                  >
                    {ADMIN_SUPPORT_EMAIL}
                  </a>
                </p>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                Security reminders
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                {securityChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-lg">✔️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
