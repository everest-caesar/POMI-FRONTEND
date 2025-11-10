import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE_URL } from '../config/api'

type CategoryId =
  | 'all'
  | 'electronics'
  | 'furniture'
  | 'clothing'
  | 'home'
  | 'books'
  | 'services'
  | 'sports'
  | 'vehicles'
  | 'other'

type PriceFilter = 'all' | 'budget' | 'mid' | 'premium'
type SortOption = 'recent' | 'price-low' | 'price-high' | 'popular'

const CATEGORY_CONFIG: Array<{
  id: CategoryId
  label: string
  icon: string
  gradient: string
  description: string
}> = [
  {
    id: 'all',
    label: 'All Listings',
    icon: '🌐',
    gradient: 'from-red-500 via-orange-500 to-yellow-400',
    description: 'Browse everything new in the community',
  },
  {
    id: 'electronics',
    label: 'Electronics',
    icon: '🔌',
    gradient: 'from-blue-500 to-indigo-500',
    description: 'Phones, laptops, accessories, speakers, more',
  },
  {
    id: 'furniture',
    label: 'Furniture',
    icon: '🛋️',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Sofas, dining sets, decor, and home accents',
  },
  {
    id: 'clothing',
    label: 'Fashion',
    icon: '👗',
    gradient: 'from-pink-500 to-rose-500',
    description: 'Traditional wear, modern fits, accessories',
  },
  {
    id: 'home',
    label: 'Home & Kitchen',
    icon: '🏡',
    gradient: 'from-emerald-500 to-green-500',
    description: 'Appliances, cookware, storage, essentials',
  },
  {
    id: 'books',
    label: 'Books & Learning',
    icon: '📚',
    gradient: 'from-purple-500 to-indigo-500',
    description: 'Textbooks, language guides, cultural stories',
  },
  {
    id: 'services',
    label: 'Services',
    icon: '🛠️',
    gradient: 'from-slate-500 to-slate-600',
    description: 'Business services, tutoring, beauty, repairs',
  },
  {
    id: 'sports',
    label: 'Sports & Hobbies',
    icon: '⚽',
    gradient: 'from-teal-500 to-cyan-500',
    description: 'Equipment, games, arts & crafts',
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: '🚗',
    gradient: 'from-zinc-500 to-zinc-600',
    description: 'Cars, bikes, scooters, rideshare offers',
  },
  {
    id: 'other',
    label: 'Everything Else',
    icon: '✨',
    gradient: 'from-fuchsia-500 to-purple-500',
    description: 'Unique finds that don’t fit a box',
  },
]

const PRICE_FILTERS: Array<{
  id: PriceFilter
  label: string
  hint: string
  icon: string
  predicate: (price: number) => boolean
}> = [
  {
    id: 'all',
    label: 'Any Price',
    hint: 'Show everything',
    icon: '🌟',
    predicate: () => true,
  },
  {
    id: 'budget',
    label: 'Under $50',
    hint: 'Great deals & household essentials',
    icon: '💸',
    predicate: (price) => price < 50,
  },
  {
    id: 'mid',
    label: '$50 – $200',
    hint: 'Everyday upgrades & trusted gear',
    icon: '💼',
    predicate: (price) => price >= 50 && price <= 200,
  },
  {
    id: 'premium',
    label: 'Over $200',
    hint: 'Premium items & investment pieces',
    icon: '💎',
    predicate: (price) => price > 200,
  },
]

const SORT_OPTIONS: Array<{
  id: SortOption
  label: string
  description: string
}> = [
  {
    id: 'recent',
    label: 'Newest first',
    description: 'See the latest drops from neighbours',
  },
  {
    id: 'price-low',
    label: 'Price: Low to high',
    description: 'Perfect when you’re hunting for bargains',
  },
  {
    id: 'price-high',
    label: 'Price: High to low',
    description: 'Spot premium items instantly',
  },
  {
    id: 'popular',
    label: 'Most loved',
    description: 'Listings with the most views & saves',
  },
]

const CONDITION_STYLES: Record<string, string> = {
  new: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'like-new': 'bg-sky-100 text-sky-800 border border-sky-200',
  good: 'bg-amber-100 text-amber-800 border border-amber-200',
  fair: 'bg-rose-100 text-rose-800 border border-rose-200',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getConditionLabel(condition?: string) {
  if (!condition) return 'Used'
  return condition
    .split(/[\s-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      5000
    )
    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-4xl text-gray-400">
        📸
      </div>
    )
  }

  return (
    <div className="group relative h-48 w-full overflow-hidden rounded-2xl">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Marketplace item ${idx + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
            idx === currentIndex ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
          }`}
        />
      ))}

      {images.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(event) => {
                  event.stopPropagation()
                  setCurrentIndex(idx)
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
      <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
        {currentIndex + 1}/{images.length}
      </div>
    </div>
  )
}

interface Listing {
  _id: string
  title: string
  description: string
  category: string
  price: number
  location: string
  sellerName: string
  condition?: string
  images: string[]
  status: 'active' | 'sold' | 'inactive'
  views: number
  favorites: string[]
  createdAt: string
}

interface MarketplaceProps {
  onClose?: () => void
  token: string
  isAdmin?: boolean
}

export default function Marketplace({ token, isAdmin = false }: MarketplaceProps) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('recent')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [submissionMessage, setSubmissionMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    price: '',
    location: '',
    condition: 'good',
  })

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/marketplace/listings?limit=60`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch marketplace listings')
      }

      const data = await response.json()
      setListings(Array.isArray(data.data) ? data.data : [])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Unable to load marketplace listings right now')
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  useEffect(() => {
    const savedFavorites = localStorage.getItem('marketplace_favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch {
        setFavorites([])
      }
    }
  }, [])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    listings.forEach((listing) => {
      counts[listing.category] = (counts[listing.category] ?? 0) + 1
    })
    return counts
  }, [listings])

  const uniqueSellerCount = useMemo(() => {
    const sellers = new Set(listings.map((listing) => listing.sellerName))
    return sellers.size
  }, [listings])

  const listingsThisWeek = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return listings.filter((listing) => new Date(listing.createdAt).getTime() >= oneWeekAgo).length
  }, [listings])

  const trendingListings = useMemo(() => {
    return [...listings]
      .sort(
        (a, b) =>
          b.views + (b.favorites?.length || 0) * 3 - (a.views + (a.favorites?.length || 0) * 3)
      )
      .slice(0, 4)
  }, [listings])

  const filteredListings = useMemo(() => {
    let results = [...listings]

    if (activeCategory !== 'all') {
      results = results.filter((listing) => listing.category === activeCategory)
    }

    if (showFavoritesOnly) {
      results = results.filter((listing) => favorites.includes(listing._id))
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      results = results.filter((listing) => {
        return (
          listing.title.toLowerCase().includes(term) ||
          listing.description.toLowerCase().includes(term) ||
          listing.location.toLowerCase().includes(term) ||
          listing.category.toLowerCase().includes(term)
        )
      })
    }

    const priceFilterConfig = PRICE_FILTERS.find((filter) => filter.id === priceFilter)
    if (priceFilterConfig && priceFilterConfig.id !== 'all') {
      results = results.filter((listing) => priceFilterConfig.predicate(listing.price))
    }

    results.sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'popular':
          return (
            b.views +
            (b.favorites?.length || 0) * 3 -
            (a.views + (a.favorites?.length || 0) * 3)
          )
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return results
  }, [listings, activeCategory, showFavoritesOnly, favorites, searchTerm, priceFilter, sortOption])

  const handleFavoriteListing = async (event: React.MouseEvent, listingId: string) => {
    event.stopPropagation()

    if (!token) {
      setError('Login to save listings you love')
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/marketplace/listings/${listingId}/favorite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update favorites')
      }

      const data = await response.json()
      if (data.favorited) {
        const updated = [...favorites, listingId]
        setFavorites(updated)
        localStorage.setItem('marketplace_favorites', JSON.stringify(updated))
      } else {
        const updated = favorites.filter((id) => id !== listingId)
        setFavorites(updated)
        localStorage.setItem('marketplace_favorites', JSON.stringify(updated))
      }

      await fetchListings()
    } catch (err: any) {
      setError(err.message || 'Unable to update favorites right now')
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length + selectedImages.length > 10) {
      setError('Maximum of 10 images allowed per listing')
      return
    }

    const validFiles: File[] = []
    files.forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`${file.name} has an unsupported format. Use JPEG, PNG, or WebP.`)
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is larger than 10MB. Please compress and retry.`)
        return
      }
      validFiles.push(file)
    })

    if (validFiles.length === 0) return

    setSelectedImages((prev) => [...prev, ...validFiles])
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, idx) => idx !== index))
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== index))
  }

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      setError('Add at least one image to showcase your listing')
      return
    }

    try {
      setUploadingImages(true)
      const form = new FormData()
      selectedImages.forEach((file) => form.append('images', file))

      const response = await fetch(`${API_BASE_URL}/marketplace/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Image upload failed')
      }

      const data = await response.json()
      setUploadedImageUrls(data.images)
      setSelectedImages([])
      setImagePreviews([])
      setError('')
    } catch (err: any) {
      setError(err.message || 'Unable to upload images right now')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleCreateListing = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('Please log in to share a listing')
      return
    }

    if (!token) {
      setError('Please login to post a listing')
      return
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.location ||
      !formData.category
    ) {
      setError('Fill out all required fields to share your listing')
      return
    }

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters')
      return
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    const priceValue = parseFloat(formData.price)
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setError('Enter a valid price (numbers only)')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: priceValue,
          images: uploadedImageUrls,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create listing')
      }

      setFormData({
        title: '',
        description: '',
        category: 'electronics',
        price: '',
        location: '',
        condition: 'good',
      })
      setUploadedImageUrls([])
      setSelectedImages([])
      setImagePreviews([])
      setShowForm(false)
      setSubmissionMessage(
        isAdmin
          ? 'Listing published successfully.'
          : 'Thanks! Your listing was sent to the admin team for review.'
      )
      await fetchListings()
    } catch (err: any) {
      setError(err.message || 'Unable to create listing right now')
    }
  }

  const heroStats = [
    {
      label: 'Active listings',
      value: listings.length,
      icon: '🛍️',
    },
    {
      label: 'New this week',
      value: listingsThisWeek,
      icon: '✨',
    },
    {
      label: 'Community sellers',
      value: uniqueSellerCount,
      icon: '🤝',
    },
  ]

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {submissionMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700 shadow-sm">
          {submissionMessage}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 p-1 shadow-xl">
        <div className="relative rounded-[26px] bg-white/95 p-10 backdrop-blur">
          <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
            <div className="space-y-8">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700 shadow">
                  🛍️ Marketplace • Powered by our community
                </p>
                <h1 className="mt-5 text-4xl font-black text-gray-900 md:text-5xl">
                  Discover trusted listings from neighbours you know.
                </h1>
                <p className="mt-4 text-lg text-gray-600 md:text-xl">
                  Buy, sell, and swap within Ottawa’s Ethiopian community. Find unique products, reliable
                  services, and everyday essentials—safely and effortlessly.
                </p>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search listings, sellers, locations…"
                  className="w-full rounded-2xl border border-gray-200 bg-white/90 px-5 py-3 text-base shadow focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-400">
                  🔍
                </span>
              </div>
              <div className="flex flex-col gap-3 md:w-auto">
                <button
                  onClick={() => {
                    setSubmissionMessage('')
                    setError('')
                    setShowForm(true)
                  }}
                  disabled={!token}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>+ Create listing</span>
                </button>
                {!isAdmin && token && (
                  <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 shadow-sm">
                    <p className="font-semibold text-amber-800">Pending admin review</p>
                    <p className="text-amber-700">
                      Share your listing and the admin team will approve it before it appears in the marketplace.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.open('mailto:support@pomi.community?subject=Pomi%20Marketplace%20Listing%20Approval', '_blank')}
                      className="inline-flex w-max items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Email admin team
                    </button>
                  </div>
                )}
              </div>
            </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-white/90 to-white/60 p-6 shadow-inner">
              <h2 className="text-lg font-bold text-gray-900">Trending this week</h2>
              <div className="space-y-4">
                {trendingListings.length === 0 && (
                  <p className="rounded-2xl border border-gray-100 bg-white/80 px-4 py-5 text-sm text-gray-500">
                    Listings that get the most views & saves show up here. Share something to be featured!
                  </p>
                )}
                {trendingListings.map((trend) => (
                  <button
                    type="button"
                    key={trend._id}
                    onClick={() => setSelectedListing(trend)}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
                  >
                    <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 text-xl">
                      {trend.images?.length ? (
                        <img
                          src={trend.images[0]}
                          alt={trend.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        '🛒'
                      )}
                    </span>
                    <div className="flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                        {trend.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(trend.price)} • {trend.location}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      👁️ {trend.views}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-red-300/30 blur-3xl"></div>
      </section>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filter Sidebar */}
        <aside className="lg:w-80">
          <div className="sticky top-4 space-y-8 rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-xl shadow-red-50/50 backdrop-blur">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Browse by category</h3>
              <p className="text-sm text-gray-500">
                Tap a category to filter listings. Counts update live.
              </p>
              <div className="mt-4 space-y-3">
                {CATEGORY_CONFIG.map((category) => {
                  const isActive = activeCategory === category.id
                  const count =
                    category.id === 'all'
                      ? listings.length
                      : categoryCounts[category.id] ?? 0
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? `border-transparent bg-gradient-to-r ${category.gradient} text-white shadow-[0_18px_45px_rgba(196,30,58,0.25)] ring-2 ring-white/40`
                          : 'border-gray-200 bg-white hover:border-red-200 hover:shadow-md'
                      }`}
                    >
                      <span className="text-xl">{category.icon}</span>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            isActive ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {category.label}
                        </p>
                        <p
                          className={`text-xs ${
                            isActive ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {category.description}
                        </p>
                      </div>
                      <span
                        className={`inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Quick filters</h3>
              <button
                onClick={() => setShowFavoritesOnly((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  showFavoritesOnly
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50/40'
                }`}
              >
                <span>Show favorites only</span>
                <span>{showFavoritesOnly ? '❤️' : '🤍'}</span>
              </button>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Price range
                </p>
                {PRICE_FILTERS.map((filter) => {
                  const isActive = filter.id === priceFilter
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setPriceFilter(filter.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-red-200 bg-red-50 text-red-600'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50/40'
                      }`}
                    >
                      <span className="text-lg">{filter.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{filter.label}</p>
                        <p className="text-xs text-gray-500">{filter.hint}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Sort listings
                </p>
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow focus:border-red-400 focus:ring-2 focus:ring-red-100"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">
                  {SORT_OPTIONS.find((option) => option.id === sortOption)?.description}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="flex-1 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {activeCategory === 'all'
                  ? 'All community listings'
                  : CATEGORY_CONFIG.find((category) => category.id === activeCategory)?.label}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredListings.length}{' '}
                {filteredListings.length === 1 ? 'result' : 'results'} •{' '}
                {showFavoritesOnly ? 'Favorites filtered view' : 'Scroll to explore what’s new'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchListings}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow hover:border-red-200 hover:text-red-600 hover:shadow-md"
              >
                🔄 Refresh feed
              </button>
              {!showFavoritesOnly && favorites.length > 0 && (
                <button
                  onClick={() => {
                    setActiveCategory('all')
                    setShowFavoritesOnly(true)
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow"
                >
                  ❤️ {favorites.length} saved
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="animate-pulse space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="h-40 w-full rounded-2xl bg-gray-200" />
                  <div className="h-6 w-3/4 rounded-full bg-gray-200" />
                  <div className="h-4 w-1/2 rounded-full bg-gray-200" />
                  <div className="h-4 w-full rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl">
                🧺
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">No listings found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or clear the search term to see more items.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setShowFavoritesOnly(false)
                  setPriceFilter('all')
                  setSearchTerm('')
                  setSortOption('recent')
                }}
                className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow hover:border-red-200 hover:text-red-600"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => {
                const isFavorited = favorites.includes(listing._id)
                const conditionClass =
                  CONDITION_STYLES[listing.condition || ''] ||
                  'border border-gray-200 bg-gray-100 text-gray-700'
                const sellerEmail = `${listing.sellerName.replace(/\s+/g, '.').toLowerCase()}@example.com`

                return (
                  <article
                    key={listing._id}
                    onClick={() => setSelectedListing(listing)}
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <ImageCarousel images={listing.images || []} />
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          📍 {listing.location}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          👁️ {listing.views}
                        </span>
                      </div>
                      <div>
                        <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition group-hover:text-red-600">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {listing.description}
                        </p>
                      </div>
                      <p className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-3xl font-black text-transparent">
                        {formatPrice(listing.price)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        ✅ Admin approved
                      </span>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Seller
                          </span>
                          <span className="font-semibold text-gray-800">{listing.sellerName}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${conditionClass}`}>
                          {getConditionLabel(listing.condition)}
                        </span>
                      </div>
                      <div className="grid gap-2">
                        <button
                          type="button"
                          onClick={(event) => handleFavoriteListing(event, listing._id)}
                          className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                            isFavorited
                              ? 'border-red-200 bg-red-50 text-red-600 shadow-inner'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-600'
                          }`}
                        >
                          {isFavorited ? '❤️ Saved' : '🤍 Save to favorites'}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            window.open(
                              `mailto:${sellerEmail}?subject=Pomi Marketplace: ${encodeURIComponent(
                                listing.title
                              )}`,
                              '_blank'
                            )
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600"
                        >
                          💬 Message seller
                        </button>
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition group-hover:opacity-100 group-hover:shadow-[inset_0_0_40px_rgba(196,30,58,0.15)]" />
                  </article>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create Listing Modal */}
      {token && showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl">
            <button
              onClick={() => {
                setShowForm(false)
                setSubmissionMessage('')
                setError('')
              }}
              className="absolute right-4 top-4 rounded-full bg-gray-100 px-3 py-1 text-lg text-gray-500 transition hover:bg-gray-200"
              aria-label="Close create listing form"
            >
              ×
            </button>
            <form onSubmit={handleCreateListing} className="max-h-[85vh] overflow-y-auto p-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">Share something with the community</h3>
                <p className="text-sm text-gray-500">
                  Great photos and clear details help your listing shine. Upload images and describe the item so neighbours know exactly what to expect.
                </p>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, title: event.target.value }))
                      }
                      className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                      placeholder="Eg. Traditional coffee set, like new"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, description: event.target.value }))
                      }
                      rows={5}
                      className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                      placeholder="Describe condition, why you’re selling, what’s included…"
                      required
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, category: event.target.value }))
                        }
                        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                      >
                        {CATEGORY_CONFIG.filter((category) => category.id !== 'all').map(
                          (category) => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Condition
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, condition: event.target.value }))
                        }
                        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                      >
                        <option value="new">Brand new</option>
                        <option value="like-new">Like new</option>
                        <option value="good">Good</option>
                        <option value="fair">Needs some love</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Price (CAD) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, price: event.target.value }))
                        }
                        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                        placeholder="Eg. 75"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, location: event.target.value }))
                        }
                        className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                        placeholder="Eg. Kanata, Downtown Ottawa"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Photo gallery
                  </label>
                  <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
                    <input
                      id="listing-images"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      hidden
                      onChange={handleImageSelect}
                    />
                    <label
                      htmlFor="listing-images"
                      className="flex cursor-pointer flex-col items-center gap-2 text-sm text-gray-600"
                    >
                      <span className="text-3xl">📸</span>
                      <span className="font-semibold text-gray-700">Add photos</span>
                      <span className="text-xs text-gray-500">
                        JPEG, PNG, WebP (max 10 images • 10MB each)
                      </span>
                    </label>

                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              className="h-24 w-full rounded-2xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={uploadImages}
                      disabled={selectedImages.length === 0 || uploadingImages}
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingImages ? 'Uploading…' : 'Upload selected images'}
                    </button>
                    {uploadedImageUrls.length > 0 && (
                      <p className="mt-3 text-xs font-semibold text-emerald-600">
                        ✅ {uploadedImageUrls.length} image{uploadedImageUrls.length > 1 && 's'} ready
                        to publish
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSubmissionMessage('')
                    setError('')
                  }}
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:border-red-200 hover:text-red-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 hover:scale-[1.01] hover:shadow-xl"
                >
                  Publish listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="relative grid w-full max-w-4xl gap-6 rounded-3xl border border-red-100 bg-white/95 p-8 shadow-2xl backdrop-blur-lg md:grid-cols-[1.4fr,1fr]">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute right-4 top-4 rounded-full bg-gray-100 px-3 py-1 text-lg text-gray-500 transition hover:bg-gray-200"
              aria-label="Close listing detail"
            >
              ×
            </button>

            <div className="space-y-4">
              <ImageCarousel images={selectedListing.images || []} />
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-gray-900">{selectedListing.title}</h3>
                <p className="text-lg text-gray-600">{selectedListing.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
                    📍 {selectedListing.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600 capitalize">
                    🏷️ {selectedListing.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
                    📅 Posted {formatDate(selectedListing.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-inner">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Price
                </p>
                <p className="mt-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-4xl font-black text-transparent">
                  {formatPrice(selectedListing.price)}
                </p>
                <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  ✅ Verified by moderators
                </span>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Seller
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {selectedListing.sellerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    👁️ {selectedListing.views} views •{' '}
                    {selectedListing.favorites?.length || 0} saves
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Condition
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    {getConditionLabel(selectedListing.condition)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={(event) => handleFavoriteListing(event, selectedListing._id)}
                  className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    favorites.includes(selectedListing._id)
                      ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700'
                      : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {favorites.includes(selectedListing._id) ? '❤️ Saved to favorites' : '🤍 Save listing'}
                </button>
                <button
                  onClick={() =>
                    window.open(
                      `mailto:${selectedListing.sellerName.replace(/\s+/g, '.')}@example.com?subject=Pomi Marketplace: ${encodeURIComponent(
                        selectedListing.title
                      )}`,
                      '_blank'
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600"
                >
                  💬 Message seller
                </button>
                <p className="text-xs text-gray-500">
                  Every chat is monitored for safety. Report concerns to support@pomi.community so the admin team can step in.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
