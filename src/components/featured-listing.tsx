import { Link } from 'react-router-dom'
import { Heart, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeaturedListingProps {
  id: string
  title: string
  price: number
  location: string
  image?: string
  rating?: number
  isLiked?: boolean
  onLike?: (id: string) => void
}

export function FeaturedListing({
  id,
  title,
  price,
  location,
  image,
  rating,
  isLiked = false,
  onLike,
}: FeaturedListingProps) {
  return (
    <div className="relative rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-shadow">
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
          <Star className="h-3 w-3 fill-white" />
          Featured
        </span>
      </div>

      {onLike && (
        <button
          onClick={() => onLike(id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
          />
        </button>
      )}

      <Link to={`/marketplace/${id}`}>
        <div className="relative h-48">
          <img
            src={image || '/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
      </Link>

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-xl font-bold text-orange-400">${price}</span>
        </div>

        <p className="text-sm text-slate-400 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {location}
        </p>

        {rating && (
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        )}

        <Link to={`/marketplace/${id}`}>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2">
            View Listing
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default FeaturedListing
