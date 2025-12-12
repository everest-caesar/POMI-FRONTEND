import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MessageCircle, Heart, Plus, ArrowLeft, Home } from 'lucide-react'
import Marketplace from '../components/Marketplace'
import authService from '../services/authService'
import { Button } from '@/components/ui/button'

export default function MarketplacePage() {
  const token = authService.getToken() || ''
  const isAdmin = Boolean(authService.getUserData()?.isAdmin)
  const navigate = useNavigate()
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, navigate])

  useEffect(() => {
    const saved = localStorage.getItem('marketplace_favorites')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWishlistCount(Array.isArray(parsed) ? parsed.length : 0)
      } catch {
        setWishlistCount(0)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pomi</p>
                <p className="text-sm font-semibold text-white">Marketplace</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/messages">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </Button>
            </Link>
            {wishlistCount > 0 && (
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">{wishlistCount} saved</span>
              </Button>
            )}
            {token && (
              <Link to="/marketplace/new">
                <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Listing</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Community marketplace</p>
          <h1 className="text-3xl font-bold text-white">Discover trusted listings from neighbours</h1>
          <p className="text-slate-400 max-w-2xl">
            Buy, sell, and swap within Ottawa's Habesha community. Find unique products, reliable services, and everyday essentials.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-gray-900">
          <Marketplace token={token} isAdmin={isAdmin} />
        </div>
      </main>
    </div>
  )
}
