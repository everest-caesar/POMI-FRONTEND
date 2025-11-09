import { RefObject } from 'react';
interface ScrollAnimationOptions {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
}
interface ScrollAnimationReturn {
    ref: RefObject<HTMLDivElement>;
    isVisible: boolean;
    className: string;
}
interface ParallaxReturn {
    ref: RefObject<HTMLDivElement>;
    style: {
        transform: string;
    };
}
/**
 * Custom hook for scroll-triggered animations using Intersection Observer API
 * Automatically applies animation classes when elements become visible in viewport
 */
export declare const useScrollAnimation: (animationClass: string, options?: ScrollAnimationOptions) => ScrollAnimationReturn;
/**
 * Hook for managing staggered animations on multiple child elements
 */
export declare const useStaggeredAnimation: (count: number) => {
    animationClass: string;
    delay: number;
}[];
/**
 * Hook for parallax scroll effect
 */
export declare const useParallax: (speed?: number) => ParallaxReturn;
export {};
//# sourceMappingURL=useScrollAnimation.d.ts.map