"use client"

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Globe, MapPin, Phone, ShieldCheck, Star, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { API_BASE_URL } from '@/config/api'
import authService from '@/services/authService'

type Business = {
  _id: string
  businessName: string
  description: string
  category: string
  phone?: string
  email?: string
  website?: string
  address?: string
  verified: boolean
  rating?: number
  reviewCount?: number
  images?: string[]
}

type Review = {
  _id: string
  authorName: string
  rating: number
  comment: string
  verified: boolean
  createdAt: string
}

export default function BusinessProfilePage() {
  const params = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<Business | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [confirmVisit, setConfirmVisit] = useState(false)
  const token = authService.getToken()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!params?.id) return
      setLoading(true)
      setError(null)
      try {
        const [businessRes, reviewsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/businesses/${params.id}`),
          fetch(`${API_BASE_URL}/businesses/${params.id}/reviews`),
        ])
        if (!businessRes.ok) throw new Error('Business not found')
        const businessData = await businessRes.json()
        setBusiness(businessData.data || businessData.business)
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(reviewsData.data || [])
        }
      } catch (err) {
        console.error(err)
        setError('We could not load this business right now.')
      } finally {
        setLoading(false)
      }
    }
    void fetchProfile()
  }, [params])

  const averageRating = useMemo(() => {
    if (!business?.rating) return null
    return Number(business.rating).toFixed(1)
  }, [business])

  const handleSubmitReview = async () => {
    if (!params?.id || !reviewForm.comment.trim()) {
      return
    }
    if (!token) {
      setError('Sign in to leave a review.')
      return
    }
    if (!confirmVisit) {
      setError('Please confirm you visited or used this service.')
      return
    }
    setSubmittingReview(true)
    try {
      const response = await fetch(`${API_BASE_URL}/businesses/${params.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewForm),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Unable to submit review')
      }
      const data = await response.json()
      setBusiness(data.business)
      setReviews((prev) => [data.review, ...prev])
      setReviewForm({ rating: 5, comment: '' })
    } catch (err: any) {
      setError(err.message || 'Unable to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">Loading business…</p>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Business unavailable</p>
          <p className="text-slate-400 text-sm">{error || 'This profile may have been removed.'}</p>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/business')}>
            Back to directory
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => navigate('/business')}
            >
              <ArrowLeft className="h-4 w-4" />
              Directory
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600">
                <span className="text-lg font-bold text-white">P</span>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">POMI</p>
                <p className="text-sm font-semibold text-white">Business Profile</p>
              </div>
            </div>
          </div>
          <Link to={`/messages?business=${encodeURIComponent(business.businessName)}`}>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              Contact business
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60">
            <img
              src={business.images?.[0] || '/placeholder.svg'}
              alt={business.businessName}
              className="w-full h-72 object-cover"
            />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                {business.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded mb-2">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </span>
                )}
                <h1 className="text-3xl font-bold text-white">{business.businessName}</h1>
                <p className="text-slate-400 text-sm">{business.category}</p>
              </div>
              {averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="text-lg text-white">{averageRating}</span>
                  <span className="text-xs text-slate-500">
                    ({business.reviewCount || reviews.length || 0})
                  </span>
                </div>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed">{business.description}</p>

            <div className="space-y-3 text-sm text-slate-300">
              {business.address && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {business.address}
                </p>
              )}
              {business.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {business.phone}
                </p>
              )}
              {business.email && (
                <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-orange-300 hover:underline">
                  <Mail className="h-4 w-4" /> {business.email}
                </a>
              )}
              {business.website && (
                <a
                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-300 hover:underline"
                >
                  <Globe className="h-4 w-4" /> {business.website}
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Community reviews</h3>
              <p className="text-sm text-slate-400">
                Confirm a visit to rate and share feedback. Verified reviews boost trust.
              </p>
            </div>
            {averageRating && (
              <div className="flex items-center gap-2 text-amber-300">
                <Star className="h-4 w-4 fill-amber-300" />
                <span className="text-lg font-semibold">{averageRating}</span>
                <span className="text-xs text-slate-500">
                  ({business.reviewCount || reviews.length || 0})
                </span>
              </div>
            )}
          </div>
          {token ? (
            <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              {/* Confirm Visit Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmVisit}
                    onChange={(e) => setConfirmVisit(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
                  />
                  I confirm I visited or used this service
                </label>
                <span className="text-xs text-slate-500">Required to rate</span>
              </div>

              {!confirmVisit && (
                <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                  Confirming your visit keeps reviews accountable and useful for neighbours.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">Your rating</label>
                  <select
                    className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    disabled={!confirmVisit}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Textarea
                placeholder="Share what stood out about this business..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 min-h-[100px]"
                disabled={!confirmVisit}
              />

              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || !confirmVisit || !reviewForm.comment.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
              >
                {submittingReview ? 'Sending…' : 'Submit review'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Sign in to leave a review. Verified members help neighbours discover trusted services faster.
            </p>
          )}

          <div className="space-y-3">
            {reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet.</p>}
            {reviews.map((review) => (
              <div key={review._id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-white">{review.authorName}</p>
                  <span className="text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-300">
                  <Star className="h-4 w-4 fill-amber-300" />
                  {review.rating} / 5
                </div>
                <p className="text-sm text-slate-200">{review.comment}</p>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Verified visit
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
