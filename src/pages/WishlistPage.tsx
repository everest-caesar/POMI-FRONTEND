import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, MapPin, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/config/api'

interface MarketplaceListing {
  _id: string
  id: string
  title: string
  price: number
  location: string
  images: string[]
  image?: string
}

export default function WishlistPage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/marketplace/listings`)
        if (!response.ok) throw new Error('Failed to fetch listings')
        const data = await response.json()
        setListings(data.data || [])
        const stored = localStorage.getItem('pomi-wishlist')
        setLikedIds(stored ? JSON.parse(stored) : [])
      } catch (err) {
        console.error(err)
        setError('Unable to load your wishlist right now.')
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  const wishlistItems = useMemo(
    () => listings.filter((listing) => likedIds.includes(listing._id || listing.id)),
    [likedIds, listings]
  )

  const removeFromWishlist = (id: string) => {
    const next = likedIds.filter((item) => item !== id)
    setLikedIds(next)
    localStorage.setItem('pomi-wishlist', JSON.stringify(next))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/marketplace">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back to marketplace
              </Button>
            </Link>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Wishlist</p>
              <p className="text-sm font-semibold text-white">Saved listings</p>
            </div>
          </div>
          <Heart className="h-5 w-5 text-rose-400" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Your wishlist</h1>
          <p className="text-slate-400">Keep track of items you love. Remove any you no longer need.</p>
          {error && <p className="text-sm text-rose-300 mt-2">{error}</p>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-56 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : wishlistItems.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((listing) => (
              <div
                key={listing._id || listing.id}
                className="group rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-slate-700 transition-all"
              >
                <Link to={`/marketplace/${listing._id || listing.id}`}>
                  <img
                    src={listing.images?.[0] || listing.image || '/placeholder.svg'}
                    alt={listing.title}
                    className="h-40 w-full object-cover"
                  />
                </Link>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{listing.title}</h3>
                    <span className="text-orange-400 font-semibold">${listing.price}</span>
                  </div>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {listing.location}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Link to={`/marketplace/${listing._id || listing.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        View listing
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={() => removeFromWishlist(listing._id || listing.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No saved items yet</h3>
            <p className="text-slate-400 mb-4">Tap the heart on a listing to add it to your wishlist.</p>
            <Link to="/marketplace">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Browse marketplace</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
