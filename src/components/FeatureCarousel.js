import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export default function FeatureCarousel({ features, onFeatureClick, autoplay = true, autoplaySpeed = 5000, }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(autoplay);
    // Auto-rotate features
    useEffect(() => {
        if (!isAutoplay)
            return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, autoplaySpeed);
        return () => clearInterval(interval);
    }, [isAutoplay, features.length, autoplaySpeed]);
    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoplay(false);
    };
    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
        setIsAutoplay(false);
    };
    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % features.length);
        setIsAutoplay(false);
    };
    const currentFeature = features[currentIndex];
    return (_jsxs("div", { className: "w-full relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-2xl", onMouseEnter: () => setIsAutoplay(false), onMouseLeave: () => setIsAutoplay(autoplay), children: [_jsxs("div", { className: "relative h-96 overflow-hidden", children: [_jsx("div", { className: "relative w-full h-full", children: features.map((feature, index) => (_jsxs("div", { className: `absolute inset-0 transition-all duration-700 ease-out transform ${index === currentIndex
                                ? 'opacity-100 scale-100'
                                : index < currentIndex
                                    ? 'opacity-0 scale-95 -translate-x-full'
                                    : 'opacity-0 scale-95 translate-x-full'}`, children: [_jsx("div", { className: `absolute inset-0 ${feature.gradient}`, style: {
                                        backgroundSize: '400% 400%',
                                        animation: 'gradient-shift 15s ease infinite',
                                    } }), _jsxs("div", { className: "relative z-10 h-full flex flex-col items-center justify-center px-8 py-12", children: [_jsx("div", { className: "text-8xl mb-6 animate-bounce", style: { animationDuration: '2s' }, children: feature.icon }), _jsx("h3", { className: "text-5xl font-black text-white mb-4 text-center drop-shadow-lg", children: feature.title }), _jsx("p", { className: "text-xl text-white/95 text-center max-w-2xl leading-relaxed drop-shadow-md", children: feature.description })] }), _jsx("div", { className: "absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" }), _jsx("div", { className: "absolute bottom-0 left-0 w-52 h-52 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24" })] }, feature.id))) }), _jsx("button", { onClick: goToPrevious, className: "absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm group", children: _jsx("span", { className: "text-2xl font-bold group-hover:-translate-x-1 transition-transform", children: "\u2039" }) }), _jsx("button", { onClick: goToNext, className: "absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm group", children: _jsx("span", { className: "text-2xl font-bold group-hover:translate-x-1 transition-transform", children: "\u203A" }) })] }), _jsx("div", { className: "px-8 py-6 bg-white/50 backdrop-blur-sm border-t border-white/20", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsx("div", { className: "mb-4", children: _jsxs("p", { className: "text-sm text-gray-600 font-medium", children: ["Feature ", currentIndex + 1, " of ", features.length] }) }), _jsx("div", { className: "flex gap-2 justify-center mb-4", children: features.map((feature, index) => (_jsx("button", { onClick: () => goToSlide(index), className: `h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'w-8 bg-red-600'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'}`, "aria-label": `Go to slide ${index + 1}` }, feature.id))) }), onFeatureClick && (_jsxs("button", { onClick: () => onFeatureClick(currentFeature), className: "w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg", children: ["Explore ", currentFeature.title] }))] }) })] }));
}
//# sourceMappingURL=FeatureCarousel.js.map