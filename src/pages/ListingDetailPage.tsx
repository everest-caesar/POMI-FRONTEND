"use client"

import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, Share2, MapPin, MessageCircle, ShieldCheck, Star, Clock, Eye } from "lucide-react"
import { API_BASE_URL } from "@/config/api"
import authService from "@/services/authService"

interface Listing {
  _id: string
  title: string
  description: string
  category: string
  price: number
  location: string
  sellerName: string
  sellerId?: { _id: string; username: string }
  condition?: string
  images: string[]
  status: string
  views: number
  favorites: string[]
  createdAt: string
}

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const token = authService.getToken()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [confirmTransaction, setConfirmTransaction] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const loadListing = async () => {
      if (!params?.id) return
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/marketplace/listings/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        if (!response.ok) {
          throw new Error("Failed to load listing")
        }

        const data = await response.json()
        setListing(data.data)

        // Check if user has liked this listing
        const savedLikes = localStorage.getItem("marketplace_favorites")
        if (savedLikes) {
          const likes = JSON.parse(savedLikes)
          setIsLiked(likes.includes(params.id))
        }
      } catch (err: any) {
        console.error(err)
        setError("We could not load this listing right now.")
      } finally {
        setLoading(false)
      }
    }

    loadListing()
  }, [params?.id, token])

  const handleLike = async () => {
    if (!listing || !token) {
      setError("Please sign in to save listings")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/listings/${listing._id}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to update favorites")
      }

      const data = await response.json()
      setIsLiked(data.favorited)

      // Update local storage
      const savedLikes = localStorage.getItem("marketplace_favorites")
      const likes = savedLikes ? JSON.parse(savedLikes) : []
      if (data.favorited) {
        likes.push(listing._id)
      } else {
        const idx = likes.indexOf(listing._id)
        if (idx > -1) likes.splice(idx, 1)
      }
      localStorage.setItem("marketplace_favorites", JSON.stringify(likes))
    } catch (err: any) {
      setError(err.message || "Unable to update favorites")
    }
  }

  const handleSubmitReview = async () => {
    if (!listing || !reviewForm.comment.trim() || !token) return
    if (!confirmTransaction) {
      setError("Please confirm the transaction before submitting a review")
      return
    }

    setSubmittingReview(true)
    try {
      // Note: Review endpoint would need to be implemented in backend
      // For now, just show success message
      setReviewForm({ rating: 5, comment: "" })
      setConfirmTransaction(false)
      // In a real implementation, you would POST to a reviews endpoint
    } catch (err: any) {
      setError(err.message || "Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading listing...</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-white">Listing unavailable</p>
          <p className="text-slate-400 text-sm">{error || "This listing was removed or never existed."}</p>
          <Link to="/marketplace">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Back to marketplace</Button>
          </Link>
        </div>
      </div>
    )
  }

  const gallery = listing.images?.length > 0 ? listing.images : ["/placeholder.svg"]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/marketplace">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Marketplace
              </Button>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">POMI</p>
                <p className="text-sm font-semibold text-white">Marketplace</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              Save
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="rounded-xl overflow-hidden mb-4 border border-slate-800">
              <img
                src={gallery[activeImage] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3">
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === index ? "border-orange-500 scale-105" : "border-transparent"
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-20 h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {listing.status === "pending" && (
                  <span className="inline-block px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded mb-3">
                    Pending admin review
                  </span>
                )}
                <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
              </div>
              <p className="text-3xl font-bold text-orange-400">{formatPrice(listing.price)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {listing.location || "Ottawa"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {formatDate(listing.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {listing.views} views
              </span>
            </div>

            <div className="border-t border-slate-800 pt-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
              <p className="text-slate-400 leading-relaxed">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Seller Info */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-lg font-semibold">{listing.sellerName?.charAt(0) || "S"}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{listing.sellerName || "Seller"}</h3>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-sm text-slate-400">Verified community member</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <span className="text-slate-400">Secure payments coming soon</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-6">
              <Link
                to={`/messages?user=${encodeURIComponent(listing.sellerName || "Seller")}&message=${encodeURIComponent(
                  `Hi ${listing.sellerName || "there"}, I'm interested in your ${listing.title}. Is it still available?`
                )}`}
                className="flex-1"
              >
                <Button size="lg" className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                  <MessageCircle className="h-4 w-4" />
                  Contact Seller
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={handleLike}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              </Button>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Reviews</h3>
                  <p className="text-sm text-slate-400">
                    Only confirmed transactions can add a review.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-4">No reviews yet. Be the first after confirming a transaction.</p>

              {token ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmTransaction}
                        onChange={(e) => setConfirmTransaction(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
                      />
                      I confirm a completed transaction for this listing
                    </label>
                    <span className="text-xs text-slate-500">Required to rate</span>
                  </div>

                  {!confirmTransaction && (
                    <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      Please confirm the transaction before submitting a rating. This keeps reviews trustworthy.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                      className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                      disabled={!confirmTransaction}
                    >
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>
                          {r} stars
                        </option>
                      ))}
                    </select>
                    <Button
                      disabled={!confirmTransaction || !reviewForm.comment.trim() || submittingReview}
                      onClick={handleSubmitReview}
                      className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit review"}
                    </Button>
                  </div>

                  <Textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    placeholder="Share details about the transaction..."
                    rows={3}
                    disabled={!confirmTransaction}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Sign in to leave a review after completing a transaction.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
