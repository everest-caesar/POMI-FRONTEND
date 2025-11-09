import { Link } from 'react-router-dom'
import Marketplace from '../components/Marketplace'
import authService from '../services/authService'

export default function MarketplacePage() {
  const token = authService.getToken() || ''
  const isAdmin = Boolean(authService.getUserData()?.isAdmin)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            ← Home
          </Link>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Habesha Marketplace
            </p>
            <h1 className="text-xl font-black text-white">Community listings & services</h1>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Discover listings shared by neighbours across Ottawa
            </h2>
            <p className="text-sm text-white/70 sm:text-base">
              Create listings, browse essentials, and support Habesha-owned services. Posting requires a
              Pomi account; browsing is open to everyone.
            </p>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-gray-200 bg-white p-4 text-gray-900 shadow-[0_30px_60px_rgba(15,23,42,0.25)]">
            <Marketplace token={token} isAdmin={isAdmin} />
          </div>
        </div>
      </main>
    </div>
  )
}
