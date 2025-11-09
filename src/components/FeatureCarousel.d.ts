interface Feature {
    id: string;
    icon: string;
    title: string;
    description: string;
    gradient: string;
    borderColor: string;
}
interface FeatureCarouselProps {
    features: Feature[];
    onFeatureClick?: (feature: Feature) => void;
    autoplay?: boolean;
    autoplaySpeed?: number;
}
export default function FeatureCarousel({ features, onFeatureClick, autoplay, autoplaySpeed, }: FeatureCarouselProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FeatureCarousel.d.ts.map