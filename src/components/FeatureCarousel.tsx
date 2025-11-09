import { useState, useEffect } from 'react'

interface Feature {
  id: string
  icon: string
  title: string
  description: string
  gradient: string
  borderColor: string
}

interface FeatureCarouselProps {
  features: Feature[]
  onFeatureClick?: (feature: Feature) => void
  autoplay?: boolean
  autoplaySpeed?: number
}

export default function FeatureCarousel({
  features,
  onFeatureClick,
  autoplay = true,
  autoplaySpeed = 5000,
}: FeatureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(autoplay)

  // Auto-rotate features
  useEffect(() => {
    if (!isAutoplay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, autoplaySpeed)

    return () => clearInterval(interval)
  }, [isAutoplay, features.length, autoplaySpeed])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoplay(false)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
    setIsAutoplay(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length)
    setIsAutoplay(false)
  }

  const currentFeature = features[currentIndex]

  return (
    <div
      className="w-full relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(autoplay)}
    >
      {/* Main Carousel Container */}
      <div className="relative h-96 overflow-hidden">
        {/* Features Carousel */}
        <div className="relative w-full h-full">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`absolute inset-0 transition-all duration-700 ease-out transform ${
                index === currentIndex
                  ? 'opacity-100 scale-100'
                  : index < currentIndex
                  ? 'opacity-0 scale-95 -translate-x-full'
                  : 'opacity-0 scale-95 translate-x-full'
              }`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 ${feature.gradient}`}
                style={{
                  backgroundSize: '400% 400%',
                  animation: 'gradient-shift 15s ease infinite',
                }}
              ></div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-12">
                {/* Icon */}
                <div className="text-8xl mb-6 animate-bounce" style={{ animationDuration: '2s' }}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-5xl font-black text-white mb-4 text-center drop-shadow-lg">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xl text-white/95 text-center max-w-2xl leading-relaxed drop-shadow-md">
                  {feature.description}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm group"
        >
          <span className="text-2xl font-bold group-hover:-translate-x-1 transition-transform">
            ‹
          </span>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm group"
        >
          <span className="text-2xl font-bold group-hover:translate-x-1 transition-transform">
            ›
          </span>
        </button>
      </div>

      {/* Indicators and Controls */}
      <div className="px-8 py-6 bg-white/50 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-6xl mx-auto">
          {/* Feature Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-medium">
              Feature {currentIndex + 1} of {features.length}
            </p>
          </div>

          {/* Dot Indicators */}
          <div className="flex gap-2 justify-center mb-4">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-red-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Button */}
          {onFeatureClick && (
            <button
              onClick={() => onFeatureClick(currentFeature)}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Explore {currentFeature.title}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
