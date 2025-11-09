import { useEffect, useRef, useState, RefObject } from 'react'

interface ScrollAnimationOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
}

interface ScrollAnimationReturn {
  ref: RefObject<HTMLDivElement>
  isVisible: boolean
  className: string
}

interface ParallaxReturn {
  ref: RefObject<HTMLDivElement>
  style: {
    transform: string
  }
}

/**
 * Custom hook for scroll-triggered animations using Intersection Observer API
 * Automatically applies animation classes when elements become visible in viewport
 */
export const useScrollAnimation = (
  animationClass: string,
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
  } = options

  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce && elementRef.current) {
            observer.unobserve(elementRef.current)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return {
    ref: elementRef,
    isVisible,
    className: isVisible ? animationClass : '',
  }
}

/**
 * Hook for managing staggered animations on multiple child elements
 */
export const useStaggeredAnimation = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    animationClass: `animate-stagger-${Math.min(i + 1, 5)}`,
    delay: i * 0.1,
  }))
}

/**
 * Hook for parallax scroll effect
 */
export const useParallax = (speed: number = 0.5): ParallaxReturn => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const elementTop =
          elementRef.current.getBoundingClientRect().top
        const windowHeight = window.innerHeight
        const scrollProgress = (windowHeight - elementTop) / windowHeight

        if (scrollProgress > 0 && scrollProgress < 2) {
          setOffset(scrollProgress * 50 * speed)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return {
    ref: elementRef,
    style: {
      transform: `translateY(${offset}px)`,
    },
  }
}
