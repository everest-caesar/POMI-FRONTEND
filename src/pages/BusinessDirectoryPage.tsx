import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShieldCheck, Globe, Star, Phone, Mail, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import axiosInstance from '../utils/axios'
import authService from '../services/authService'
import { Button } from '@/components/ui/button'

interface Business {
  _id: string
  businessName: string
  description: string
  category: string
  phone?: string
  email?: string
  website?: string
  address?: string
  images?: string[]
  featuredImage?: string
  verified: boolean
  status: 'draft' | 'active' | 'inactive'
  ownerName: string
  rating?: number
  reviewCount?: number
  createdAt: string
}

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  retail: 'Retail & Shopping',
  restaurant: 'Food & Hospitality',
  services: 'Services',
  healthcare: 'Healthcare',
  education: 'Education',
  technology: 'Technology',
  finance: 'Finance',
  entertainment: 'Entertainment',
  other: 'Other',
}

const ITEMS_PER_PAGE = 6
const ADMIN_CONTACT_EMAIL = 'marakihay@gmail.com'

export default function BusinessDirectoryPage() {
  const navigate = useNavigate()
  const currentUser = authService.getUserData()
  const isAdmin = Boolean(currentUser?.isAdmin)

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSector, setActiveSector] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [hasWebsiteOnly, setHasWebsiteOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Redirect admins to admin portal
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, navigate])

  // Fetch businesses on mount
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get('/businesses', {
          params: {
            status: 'active',
            limit: 100,
          },
        })
        const activeBusinesses = response.data.data || response.data
        setBusinesses(Array.isArray(activeBusinesses) ? activeBusinesses : [])
      } catch (err) {
        console.error('Failed to fetch businesses:', err)
        setError('Failed to load businesses. Please try again later.')
        setBusinesses([])
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  const sectors = useMemo(() => {
    const unique = new Set(
      businesses
        .filter((b) => b.status === 'active')
        .map((business) => CATEGORY_DISPLAY_MAP[business.category] || business.category)
    )
    return ['All', ...Array.from(unique).sort()]
  }, [businesses])

  const filteredBusinesses = useMemo(() => {
    let result = businesses.filter((b) => b.status === 'active')

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (b) =>
          b.businessName.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query) ||
          (b.address && b.address.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (activeSector !== 'All') {
      result = result.filter((business) => {
        const displayCategory = CATEGORY_DISPLAY_MAP[business.category] || business.category
        return displayCategory === activeSector
      })
    }

    // Apply verified filter
    if (verifiedOnly) {
      result = result.filter((b) => b.verified)
    }

    // Apply website filter
    if (hasWebsiteOnly) {
      result = result.filter((b) => b.website)
    }

    return result
  }, [activeSector, businesses, searchQuery, verifiedOnly, hasWebsiteOnly])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeSector, verifiedOnly, hasWebsiteOnly])

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE)
  const paginatedBusinesses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredBusinesses, currentPage])

  const verifiedCount = useMemo(() => businesses.filter((b) => b.verified && b.status === 'active').length, [businesses])
  const categoriesCount = useMemo(() => new Set(businesses.filter((b) => b.status === 'active').map((b) => b.category)).size, [businesses])

  // Get featured business (highest rated verified business)
  const featuredBusiness = useMemo(() => {
    const verified = businesses.filter((b) => b.status === 'active' && b.verified)
    if (verified.length === 0) return null
    return verified.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
  }, [businesses])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Pomi</p>
              <p className="text-sm font-semibold text-white">Business Directory</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Hero Section */}
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Community businesses</p>
          <h1 className="text-3xl font-bold text-white">Find and support Habesha-owned businesses</h1>
          <p className="text-slate-400 max-w-2xl">
            Every listing is reviewed with the business owner to verify offerings, contact details, and community alignment.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-2xl font-bold text-white">{businesses.filter((b) => b.status === 'active').length}</p>
            <p className="text-xs text-slate-400">Total businesses</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{verifiedCount}</p>
            <p className="text-xs text-slate-400">Verified</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{categoriesCount}</p>
            <p className="text-xs text-slate-400">Categories</p>
          </div>
        </div>

        {/* Featured Business */}
        {featuredBusiness && (
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-amber-300">Featured Business</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {featuredBusiness.featuredImage && (
                <img
                  src={featuredBusiness.featuredImage}
                  alt={featuredBusiness.businessName}
                  className="w-full sm:w-32 h-24 object-cover rounded-xl"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{featuredBusiness.businessName}</h3>
                  {featuredBusiness.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-2">{CATEGORY_DISPLAY_MAP[featuredBusiness.category] || featuredBusiness.category}</p>
                <p className="text-sm text-slate-300 line-clamp-2">{featuredBusiness.description}</p>
                <div className="flex gap-2 mt-3">
                  <Link to={`/business/${featuredBusiness._id}`}>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">View profile</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search businesses by name, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Filter Checkboxes */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
              />
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Verified only
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWebsiteOnly}
                onChange={(e) => setHasWebsiteOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500"
              />
              <Globe className="h-4 w-4 text-blue-400" />
              Has website
            </label>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {sectors.map((sector) => {
              const isActive = sector === activeSector
              return (
                <button
                  key={sector}
                  onClick={() => setActiveSector(sector)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {sector}
                </button>
              )
            })}
          </div>
        </div>

        {/* Want to be listed? */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-white mb-2">Want your business listed?</p>
              <p className="text-sm text-slate-400">
                Submit your business details for review. We verify all listings before they go live.
              </p>
            </div>
            <Link to="/business/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap">
                List your business
              </Button>
            </Link>
          </div>
          {isAdmin && (
            <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
              Admin view: Use the console to add or manage businesses after verification calls.
            </p>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {paginatedBusinesses.length} of {filteredBusinesses.length} businesses
          </p>
        </div>

        {/* Business Cards */}
        <section className="space-y-6">
          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
              <p className="text-slate-400 animate-pulse">Loading businesses...</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center">
              <p className="text-rose-300">{error}</p>
            </div>
          )}

          {!loading && !error && paginatedBusinesses.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedBusinesses.map((business) => (
                <article
                  key={business._id}
                  className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition hover:border-slate-700"
                >
                  {/* Featured Image */}
                  {business.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden bg-slate-800">
                      <img
                        src={business.featuredImage}
                        alt={business.businessName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-400 mb-1">
                          {CATEGORY_DISPLAY_MAP[business.category] || business.category}
                        </p>
                        <h3 className="text-lg font-semibold text-white">{business.businessName}</h3>
                      </div>
                      {business.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded">
                          <ShieldCheck className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    {business.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-white">{business.rating.toFixed(1)}</span>
                        <span className="text-slate-500">({business.reviewCount || 0})</span>
                      </div>
                    )}

                    <p className="text-sm text-slate-400 line-clamp-2 flex-1">{business.description}</p>

                    {/* Contact Info */}
                    <div className="space-y-1.5 text-sm text-slate-400">
                      {business.address && (
                        <p className="truncate">{business.address}</p>
                      )}
                      {business.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3" /> {business.phone}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800">
                      <Link to={`/business/${business._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                          View profile
                        </Button>
                      </Link>
                      {business.email && (
                        <a
                          href={`mailto:${business.email}?subject=Pomi%20Business%20Directory%20Inquiry:%20${encodeURIComponent(business.businessName)}`}
                        >
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && filteredBusinesses.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
              <p className="text-slate-400 mb-2">No businesses found matching your criteria.</p>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or{' '}
                <a href={`mailto:${ADMIN_CONTACT_EMAIL}`} className="text-orange-400 hover:underline">
                  recommend a business
                </a>
                .
              </p>
            </div>
          )}
        </section>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                    page === currentPage
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
