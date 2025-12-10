import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import authService from '../services/authService';
import socketService from '../services/socketService';
import { generateClientMessageId } from '../utils/messageHelpers';
const CATEGORY_CONFIG = [
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
];
const PRICE_FILTERS = [
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
];
const SORT_OPTIONS = [
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
];
const CONDITION_STYLES = {
    new: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    'like-new': 'bg-sky-100 text-sky-800 border border-sky-200',
    good: 'bg-amber-100 text-amber-800 border border-amber-200',
    fair: 'bg-rose-100 text-rose-800 border border-rose-200',
};
function formatPrice(price) {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0,
    }).format(price);
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
function getConditionLabel(condition) {
    if (!condition)
        return 'Used';
    return condition
        .split(/[\s-]+/)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}
function ImageCarousel({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        if (images.length <= 1)
            return;
        const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 5000);
        return () => clearInterval(timer);
    }, [images.length]);
    if (images.length === 0) {
        return (_jsx("div", { className: "relative flex h-48 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-4xl text-gray-400", children: "\uD83D\uDCF8" }));
    }
    return (_jsxs("div", { className: "group relative h-48 w-full overflow-hidden rounded-2xl", children: [images.map((img, idx) => (_jsx("img", { src: img, alt: `Marketplace item ${idx + 1}`, className: `absolute inset-0 h-full w-full object-cover transition-all duration-500 ${idx === currentIndex ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'}` }, idx))), images.length > 1 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" }), _jsx("div", { className: "absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5", children: images.map((_, idx) => (_jsx("button", { onClick: (event) => {
                                event.stopPropagation();
                                setCurrentIndex(idx);
                            }, className: `h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40 hover:bg-white/60'}` }, idx))) })] })), _jsxs("div", { className: "absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md", children: [currentIndex + 1, "/", images.length] })] }));
}
export default function Marketplace({ token, isAdmin = false }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortOption, setSortOption] = useState('recent');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [messageConfirmation, setMessageConfirmation] = useState('');
    const [messagingListing, setMessagingListing] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'electronics',
        price: '',
        location: '',
        condition: 'good',
    });
    const currentUser = authService.getUserData();
    const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId || '';
    useEffect(() => {
        if (!token || !currentUserId) {
            return;
        }
        socketService.connect(currentUserId);
    }, [token, currentUserId]);
    const fetchListings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/marketplace/listings?limit=60`, {
                headers: token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : undefined,
            });
            if (!response.ok) {
                throw new Error('Failed to fetch marketplace listings');
            }
            const data = await response.json();
            setListings(Array.isArray(data.data) ? data.data : []);
            setError('');
        }
        catch (err) {
            setError(err.message || 'Unable to load marketplace listings right now');
            setListings([]);
        }
        finally {
            setLoading(false);
        }
    }, [token]);
    useEffect(() => {
        fetchListings();
    }, [fetchListings]);
    useEffect(() => {
        const savedFavorites = localStorage.getItem('marketplace_favorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            }
            catch {
                setFavorites([]);
            }
        }
    }, []);
    const categoryCounts = useMemo(() => {
        const counts = {};
        listings.forEach((listing) => {
            counts[listing.category] = (counts[listing.category] ?? 0) + 1;
        });
        return counts;
    }, [listings]);
    const uniqueSellerCount = useMemo(() => {
        const sellers = new Set(listings.map((listing) => listing.sellerName));
        return sellers.size;
    }, [listings]);
    const listingsThisWeek = useMemo(() => {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return listings.filter((listing) => new Date(listing.createdAt).getTime() >= oneWeekAgo).length;
    }, [listings]);
    const trendingListings = useMemo(() => {
        return [...listings]
            .sort((a, b) => b.views + (b.favorites?.length || 0) * 3 - (a.views + (a.favorites?.length || 0) * 3))
            .slice(0, 4);
    }, [listings]);
    const filteredListings = useMemo(() => {
        let results = [...listings];
        if (activeCategory !== 'all') {
            results = results.filter((listing) => listing.category === activeCategory);
        }
        if (showFavoritesOnly) {
            results = results.filter((listing) => favorites.includes(listing._id));
        }
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            results = results.filter((listing) => {
                return (listing.title.toLowerCase().includes(term) ||
                    listing.description.toLowerCase().includes(term) ||
                    listing.location.toLowerCase().includes(term) ||
                    listing.category.toLowerCase().includes(term));
            });
        }
        const priceFilterConfig = PRICE_FILTERS.find((filter) => filter.id === priceFilter);
        if (priceFilterConfig && priceFilterConfig.id !== 'all') {
            results = results.filter((listing) => priceFilterConfig.predicate(listing.price));
        }
        results.sort((a, b) => {
            switch (sortOption) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'popular':
                    return (b.views +
                        (b.favorites?.length || 0) * 3 -
                        (a.views + (a.favorites?.length || 0) * 3));
                case 'recent':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
        return results;
    }, [listings, activeCategory, showFavoritesOnly, favorites, searchTerm, priceFilter, sortOption]);
    const handleFavoriteListing = async (event, listingId) => {
        event.stopPropagation();
        if (!token) {
            setError('Login to save listings you love');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/marketplace/listings/${listingId}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update favorites');
            }
            const data = await response.json();
            if (data.favorited) {
                const updated = [...favorites, listingId];
                setFavorites(updated);
                localStorage.setItem('marketplace_favorites', JSON.stringify(updated));
            }
            else {
                const updated = favorites.filter((id) => id !== listingId);
                setFavorites(updated);
                localStorage.setItem('marketplace_favorites', JSON.stringify(updated));
            }
            await fetchListings();
        }
        catch (err) {
            setError(err.message || 'Unable to update favorites right now');
        }
    };
    const handleImageSelect = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length + selectedImages.length > 10) {
            setError('Maximum of 10 images allowed per listing');
            return;
        }
        const validFiles = [];
        files.forEach((file) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setError(`${file.name} has an unsupported format. Use JPEG, PNG, or WebP.`);
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError(`${file.name} is larger than 10MB. Please compress and retry.`);
                return;
            }
            validFiles.push(file);
        });
        if (validFiles.length === 0)
            return;
        setSelectedImages((prev) => [...prev, ...validFiles]);
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };
    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, idx) => idx !== index));
        setImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
    };
    const uploadImages = async () => {
        if (selectedImages.length === 0) {
            setError('Add at least one image to showcase your listing');
            return;
        }
        try {
            setUploadingImages(true);
            const form = new FormData();
            selectedImages.forEach((file) => form.append('images', file));
            const response = await fetch(`${API_BASE_URL}/marketplace/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Image upload failed');
            }
            const data = await response.json();
            setUploadedImageUrls(data.images);
            setSelectedImages([]);
            setImagePreviews([]);
            setError('');
        }
        catch (err) {
            setError(err.message || 'Unable to upload images right now');
        }
        finally {
            setUploadingImages(false);
        }
    };
    const handleCreateListing = async (event) => {
        event.preventDefault();
        setError('');
        if (!token) {
            setError('Please log in to share a listing');
            return;
        }
        if (!token) {
            setError('Please login to post a listing');
            return;
        }
        if (!formData.title ||
            !formData.description ||
            !formData.price ||
            !formData.category) {
            setError('Fill out all required fields to share your listing');
            return;
        }
        if (formData.title.trim().length < 5) {
            setError('Title must be at least 5 characters');
            return;
        }
        if (formData.description.trim().length < 10) {
            setError('Description must be at least 10 characters');
            return;
        }
        const priceValue = parseFloat(formData.price);
        if (Number.isNaN(priceValue) || priceValue < 0) {
            setError('Enter a valid price (numbers only)');
            return;
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
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create listing');
            }
            setFormData({
                title: '',
                description: '',
                category: 'electronics',
                price: '',
                location: '',
                condition: 'good',
            });
            setUploadedImageUrls([]);
            setSelectedImages([]);
            setImagePreviews([]);
            setShowForm(false);
            setSubmissionMessage(isAdmin
                ? 'Listing published successfully.'
                : 'Thanks! Your listing was sent to the admin team for review.');
            await fetchListings();
        }
        catch (err) {
            setError(err.message || 'Unable to create listing right now');
        }
    };
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
    ];
    return (_jsxs("div", { className: "space-y-10", children: [error && (_jsx("div", { className: "rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm", children: error })), submissionMessage && (_jsx("div", { className: "rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm font-semibold text-emerald-700 shadow-sm", children: submissionMessage })), _jsxs("section", { className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400 p-1 shadow-xl", children: [_jsx("div", { className: "relative rounded-[26px] bg-white/95 p-10 backdrop-blur", children: _jsxs("div", { className: "grid gap-10 lg:grid-cols-[1.4fr,1fr]", children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("p", { className: "inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700 shadow", children: "\uD83D\uDECD\uFE0F Marketplace \u2022 Powered by our community" }), _jsx("h1", { className: "mt-5 text-4xl font-black text-gray-900 md:text-5xl", children: "Discover trusted listings from neighbours you know." }), _jsx("p", { className: "mt-4 text-lg text-gray-600 md:text-xl", children: "Buy, sell, and swap within Ottawa\u2019s Ethiopian community. Find unique products, reliable services, and everyday essentials\u2014safely and effortlessly." })] }), _jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("input", { type: "search", value: searchTerm, onChange: (event) => setSearchTerm(event.target.value), placeholder: "Search listings, sellers, locations\u2026", className: "w-full rounded-2xl border border-gray-200 bg-white/90 px-5 py-3 text-base shadow focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200" }), _jsx("span", { className: "pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-400", children: "\uD83D\uDD0D" })] }), _jsxs("div", { className: "flex flex-col gap-3 md:w-auto", children: [_jsx("button", { onClick: () => {
                                                                setSubmissionMessage('');
                                                                setError('');
                                                                setShowForm(true);
                                                            }, disabled: !token, className: "flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60", children: _jsx("span", { children: "+ Create listing" }) }), !isAdmin && token && (_jsxs("div", { className: "flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 shadow-sm", children: [_jsx("p", { className: "font-semibold text-amber-800", children: "Pending admin review" }), _jsx("p", { className: "text-amber-700", children: "Share your listing and the admin team will approve it before it appears in the marketplace. Check the admin portal for status." })] }))] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: heroStats.map((stat) => (_jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg", children: [_jsx("span", { className: "text-2xl", children: stat.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: stat.label }), _jsx("p", { className: "text-2xl font-black text-gray-900", children: stat.value })] })] }, stat.label))) })] }), _jsxs("div", { className: "flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-white/90 to-white/60 p-6 shadow-inner", children: [_jsx("h2", { className: "text-lg font-bold text-gray-900", children: "Trending this week" }), _jsxs("div", { className: "space-y-4", children: [trendingListings.length === 0 && (_jsx("p", { className: "rounded-2xl border border-gray-100 bg-white/80 px-4 py-5 text-sm text-gray-500", children: "Listings that get the most views & saves show up here. Share something to be featured!" })), trendingListings.map((trend) => (_jsxs("button", { type: "button", onClick: () => setSelectedListing(trend), className: "flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-lg", children: [_jsx("span", { className: "flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 text-xl", children: trend.images?.length ? (_jsx("img", { src: trend.images[0], alt: trend.title, className: "h-full w-full object-cover" })) : ('🛒') }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "line-clamp-1 text-sm font-semibold text-gray-900", children: trend.title }), _jsxs("p", { className: "text-xs text-gray-500", children: [formatPrice(trend.price), " \u2022 ", trend.location] })] }), _jsxs("span", { className: "text-xs font-semibold text-gray-500", children: ["\uD83D\uDC41\uFE0F ", trend.views] })] }, trend._id)))] })] })] }) }), _jsx("div", { className: "pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/20 blur-3xl" }), _jsx("div", { className: "pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-red-300/30 blur-3xl" })] }), _jsxs("div", { className: "flex flex-col gap-8 lg:flex-row", children: [_jsx("aside", { className: "lg:w-80", children: _jsxs("div", { className: "sticky top-4 space-y-8 rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-xl shadow-red-50/50 backdrop-blur", children: [_jsx("div", { className: "rounded-3xl border border-rose-100 bg-rose-50/80 p-4 shadow-inner shadow-rose-100/60", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-rose-800", children: "Favorites spotlight" }), _jsx("p", { className: "text-xs text-rose-600", children: "Jump back to saved listings instantly." })] }), _jsx("button", { onClick: () => setShowFavoritesOnly((prev) => !prev), className: `rounded-full px-3 py-2 text-xs font-semibold transition ${showFavoritesOnly
                                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                                                    : 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50'}`, children: showFavoritesOnly ? '❤️ On' : '🤍 Off' })] }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Browse by category" }), _jsx("p", { className: "text-sm text-gray-500", children: "Tap a category to filter listings. Counts update live." }), _jsx("div", { className: "mt-4 space-y-3", children: CATEGORY_CONFIG.map((category) => {
                                                const isActive = activeCategory === category.id;
                                                const count = category.id === 'all'
                                                    ? listings.length
                                                    : categoryCounts[category.id] ?? 0;
                                                return (_jsxs("button", { onClick: () => setActiveCategory(category.id), className: `flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition ${isActive
                                                        ? `border-transparent bg-gradient-to-r ${category.gradient} text-white shadow-[0_18px_45px_rgba(196,30,58,0.25)] ring-2 ring-white/40`
                                                        : 'border-gray-200 bg-white hover:border-red-200 hover:shadow-md'}`, children: [_jsx("span", { className: "text-xl", children: category.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: `text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`, children: category.label }), _jsx("p", { className: `text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`, children: category.description })] }), _jsx("span", { className: `inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`, children: count })] }, category.id));
                                            }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Quick filters" }), _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-400", children: "Price range" }), PRICE_FILTERS.map((filter) => {
                                                    const isActive = filter.id === priceFilter;
                                                    return (_jsxs("button", { onClick: () => setPriceFilter(filter.id), className: `flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${isActive
                                                            ? 'border-red-200 bg-red-50 text-red-600'
                                                            : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50/40'}`, children: [_jsx("span", { className: "text-lg", children: filter.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold", children: filter.label }), _jsx("p", { className: "text-xs text-gray-500", children: filter.hint })] })] }, filter.id));
                                                })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-400", children: "Sort listings" }), _jsx("select", { value: sortOption, onChange: (event) => setSortOption(event.target.value), className: "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow focus:border-red-400 focus:ring-2 focus:ring-red-100", children: SORT_OPTIONS.map((option) => (_jsx("option", { value: option.id, children: option.label }, option.id))) }), _jsx("p", { className: "text-xs text-gray-400", children: SORT_OPTIONS.find((option) => option.id === sortOption)?.description })] })] })] }) }), _jsxs("main", { className: "flex-1 space-y-8", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-black text-gray-900", children: activeCategory === 'all'
                                                    ? 'All community listings'
                                                    : CATEGORY_CONFIG.find((category) => category.id === activeCategory)?.label }), _jsxs("p", { className: "text-sm text-gray-500", children: [filteredListings.length, ' ', filteredListings.length === 1 ? 'result' : 'results', " \u2022", ' ', showFavoritesOnly ? 'Favorites filtered view' : 'Scroll to explore what’s new'] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("button", { onClick: fetchListings, className: "inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow hover:border-red-200 hover:text-red-600 hover:shadow-md", children: "\uD83D\uDD04 Refresh feed" }), !showFavoritesOnly && favorites.length > 0 && (_jsxs("button", { onClick: () => {
                                                    setActiveCategory('all');
                                                    setShowFavoritesOnly(true);
                                                }, className: "inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow", children: ["\u2764\uFE0F ", favorites.length, " saved"] }))] })] }), loading ? (_jsx("div", { className: "grid gap-6 sm:grid-cols-2 xl:grid-cols-3", children: Array.from({ length: 6 }).map((_, idx) => (_jsxs("div", { className: "animate-pulse space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm", children: [_jsx("div", { className: "h-40 w-full rounded-2xl bg-gray-200" }), _jsx("div", { className: "h-6 w-3/4 rounded-full bg-gray-200" }), _jsx("div", { className: "h-4 w-1/2 rounded-full bg-gray-200" }), _jsx("div", { className: "h-4 w-full rounded-full bg-gray-100" })] }, idx))) })) : filteredListings.length === 0 ? (_jsxs("div", { className: "rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm", children: [_jsx("div", { className: "mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl", children: "\uD83E\uDDFA" }), _jsx("h3", { className: "mt-4 text-xl font-bold text-gray-900", children: "No listings found" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Try adjusting your filters or clear the search term to see more items." }), _jsx("button", { onClick: () => {
                                            setActiveCategory('all');
                                            setShowFavoritesOnly(false);
                                            setPriceFilter('all');
                                            setSearchTerm('');
                                            setSortOption('recent');
                                        }, className: "mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow hover:border-red-200 hover:text-red-600", children: "Reset filters" })] })) : (_jsx("div", { className: "grid gap-6 sm:grid-cols-2 xl:grid-cols-3", children: filteredListings.map((listing) => {
                                    const isFavorited = favorites.includes(listing._id);
                                    const conditionClass = CONDITION_STYLES[listing.condition || ''] ||
                                        'border border-gray-200 bg-gray-100 text-gray-700';
                                    const sellerEmail = `${listing.sellerName.replace(/\s+/g, '.').toLowerCase()}@example.com`;
                                    return (_jsxs("article", { onClick: () => setSelectedListing(listing), className: "group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-2xl", children: [_jsx(ImageCarousel, { images: listing.images || [] }), _jsxs("div", { className: "flex flex-1 flex-col gap-4 p-6", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600", children: ["\uD83D\uDCCD ", listing.location] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500", children: ["\uD83D\uDC41\uFE0F ", listing.views] })] }), _jsxs("div", { children: [_jsx("h3", { className: "line-clamp-2 text-lg font-bold text-gray-900 transition group-hover:text-red-600", children: listing.title }), _jsx("p", { className: "mt-1 text-sm text-gray-500 line-clamp-2", children: listing.description })] }), _jsx("p", { className: "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-3xl font-black text-transparent", children: formatPrice(listing.price) }), _jsx("span", { className: "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-600", children: "\u2705 Admin approved" }), _jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-gray-400", children: "Seller" }), _jsx("span", { className: "font-semibold text-gray-800", children: listing.sellerName })] }), _jsx("span", { className: `inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${conditionClass}`, children: getConditionLabel(listing.condition) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx("button", { type: "button", onClick: (event) => handleFavoriteListing(event, listing._id), className: `flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${isFavorited
                                                                    ? 'border-red-200 bg-red-50 text-red-600 shadow-inner'
                                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-600'}`, children: isFavorited ? '❤️ Saved' : '🤍 Save to favorites' }), _jsx("button", { type: "button", onClick: (event) => {
                                                                    event.stopPropagation();
                                                                    if (!token) {
                                                                        setError('Please log in to message sellers');
                                                                        return;
                                                                    }
                                                                    setMessagingListing(listing);
                                                                    setMessageText('');
                                                                    setMessageConfirmation('');
                                                                }, className: "flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600", children: "\uD83D\uDCAC Message seller" })] })] }), _jsx("div", { className: "pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition group-hover:opacity-100 group-hover:shadow-[inset_0_0_40px_rgba(196,30,58,0.15)]" })] }, listing._id));
                                }) }))] })] }), token && showForm && (_jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md p-4", children: _jsxs("div", { className: "relative w-full max-w-3xl overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl", children: [_jsx("button", { onClick: () => {
                                setShowForm(false);
                                setSubmissionMessage('');
                                setError('');
                            }, className: "absolute right-4 top-4 rounded-full bg-red-500 hover:bg-red-600 px-3 py-1 text-lg text-white font-bold transition shadow-lg shadow-red-500/50 ring-2 ring-red-200", "aria-label": "Close create listing form", children: "\u00D7" }), _jsxs("form", { onSubmit: handleCreateListing, className: "max-h-[85vh] overflow-y-auto p-8", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-2xl font-black text-gray-900", children: "Share something with the community" }), _jsx("p", { className: "text-sm text-gray-500", children: "Great photos and clear details help your listing shine. Upload images and describe the item so neighbours know exactly what to expect." })] }), _jsxs("div", { className: "mt-6 grid gap-5 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Title *" }), _jsx("input", { type: "text", value: formData.title, onChange: (event) => setFormData((prev) => ({ ...prev, title: event.target.value })), className: "mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", placeholder: "Eg. Traditional coffee set, like new", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Description *" }), _jsx("textarea", { value: formData.description, onChange: (event) => setFormData((prev) => ({ ...prev, description: event.target.value })), rows: 5, className: "mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", placeholder: "Describe condition, why you\u2019re selling, what\u2019s included\u2026", required: true })] }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Category *" }), _jsx("select", { value: formData.category, onChange: (event) => setFormData((prev) => ({ ...prev, category: event.target.value })), className: "mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", children: CATEGORY_CONFIG.filter((category) => category.id !== 'all').map((category) => (_jsx("option", { value: category.id, children: category.label }, category.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Condition" }), _jsxs("select", { value: formData.condition, onChange: (event) => setFormData((prev) => ({ ...prev, condition: event.target.value })), className: "mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", children: [_jsx("option", { value: "new", children: "Brand new" }), _jsx("option", { value: "like-new", children: "Like new" }), _jsx("option", { value: "good", children: "Good" }), _jsx("option", { value: "fair", children: "Needs some love" })] })] })] }), _jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Price (CAD) *" }), _jsx("input", { type: "number", min: "0", step: "0.01", value: formData.price, onChange: (event) => setFormData((prev) => ({ ...prev, price: event.target.value })), className: "mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", placeholder: "Eg. 75", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Location" }), _jsx("input", { type: "text", value: formData.location, onChange: (event) => setFormData((prev) => ({ ...prev, location: event.target.value })), className: "mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", placeholder: "Eg. Kanata, Downtown Ottawa (optional)" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Photo gallery" }), _jsxs("div", { className: "rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-6 text-center", children: [_jsx("input", { id: "listing-images", type: "file", accept: "image/jpeg,image/png,image/webp", multiple: true, hidden: true, onChange: handleImageSelect }), _jsxs("label", { htmlFor: "listing-images", className: "flex cursor-pointer flex-col items-center gap-2 text-sm text-gray-600", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDCF8" }), _jsx("span", { className: "font-semibold text-gray-700", children: "Add photos" }), _jsx("span", { className: "text-xs text-gray-500", children: "JPEG, PNG, WebP (max 10 images \u2022 10MB each)" })] }), imagePreviews.length > 0 && (_jsx("div", { className: "mt-4 grid grid-cols-3 gap-3", children: imagePreviews.map((preview, idx) => (_jsxs("div", { className: "relative", children: [_jsx("img", { src: preview, alt: `Preview ${idx + 1}`, className: "h-24 w-full rounded-2xl object-cover" }), _jsx("button", { type: "button", onClick: () => removeImage(idx), className: "absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white", children: "\u00D7" })] }, idx))) })), _jsx("button", { type: "button", onClick: uploadImages, disabled: selectedImages.length === 0 || uploadingImages, className: "mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-60", children: uploadingImages ? 'Uploading…' : 'Upload selected images' }), uploadedImageUrls.length > 0 && (_jsxs("p", { className: "mt-3 text-xs font-semibold text-emerald-600", children: ["\u2705 ", uploadedImageUrls.length, " image", uploadedImageUrls.length > 1 && 's', " ready to publish"] }))] })] })] }), _jsxs("div", { className: "mt-6 flex flex-wrap justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => {
                                                setShowForm(false);
                                                setSubmissionMessage('');
                                                setError('');
                                            }, className: "rounded-2xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:border-red-200 hover:text-red-600", children: "Cancel" }), _jsx("button", { type: "submit", className: "rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 hover:scale-[1.01] hover:shadow-xl", children: "Publish listing" })] })] })] }) })), selectedListing && (_jsx("div", { className: "fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4", children: _jsxs("div", { className: "relative grid w-full max-w-4xl gap-6 rounded-3xl border border-red-100 bg-white/95 p-8 shadow-2xl backdrop-blur-lg md:grid-cols-[1.4fr,1fr]", children: [_jsx("button", { onClick: () => setSelectedListing(null), className: "absolute right-4 top-4 rounded-full bg-red-500 hover:bg-red-600 px-3 py-1 text-lg text-white font-bold transition shadow-lg shadow-red-500/50 ring-2 ring-red-200", "aria-label": "Close listing detail", children: "\u00D7" }), _jsxs("div", { className: "space-y-4", children: [_jsx(ImageCarousel, { images: selectedListing.images || [] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-3xl font-black text-gray-900", children: selectedListing.title }), _jsx("p", { className: "text-lg text-gray-600", children: selectedListing.description }), _jsxs("div", { className: "flex flex-wrap gap-2 text-sm text-gray-500", children: [_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600", children: ["\uD83D\uDCCD ", selectedListing.location] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600 capitalize", children: ["\uD83C\uDFF7\uFE0F ", selectedListing.category] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600", children: ["\uD83D\uDCC5 Posted ", formatDate(selectedListing.createdAt)] })] })] })] }), _jsxs("div", { className: "flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-inner", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-400", children: "Price" }), _jsx("p", { className: "mt-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-4xl font-black text-transparent", children: formatPrice(selectedListing.price) }), _jsx("span", { className: "mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700", children: "\u2705 Verified by moderators" })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white px-4 py-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-400", children: "Seller" }), _jsx("p", { className: "mt-1 text-base font-semibold text-gray-800", children: selectedListing.sellerName }), _jsxs("p", { className: "text-xs text-gray-500", children: ["\uD83D\uDC41\uFE0F ", selectedListing.views, " views \u2022", ' ', selectedListing.favorites?.length || 0, " saves"] })] }), _jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white px-4 py-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-gray-400", children: "Condition" }), _jsx("p", { className: "mt-1 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700", children: getConditionLabel(selectedListing.condition) })] })] }), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("button", { onClick: (event) => handleFavoriteListing(event, selectedListing._id), className: `flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${favorites.includes(selectedListing._id)
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700'
                                                : 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`, children: favorites.includes(selectedListing._id) ? '❤️ Saved to favorites' : '🤍 Save listing' }), _jsx("button", { onClick: () => {
                                                if (!token) {
                                                    setError('Please log in to message sellers');
                                                    return;
                                                }
                                                setMessagingListing(selectedListing);
                                                setMessageText('');
                                                setMessageConfirmation('');
                                            }, className: "flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600", children: "\uD83D\uDCAC Message seller" }), _jsx("p", { className: "text-xs text-gray-500", children: "Every message is monitored for safety. Report concerns to support@pomi.community so the admin team can step in." })] })] })] }) })), messagingListing && token && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4", children: _jsxs("div", { className: "relative w-full max-w-md rounded-3xl border border-red-100 bg-white shadow-2xl", children: [_jsx("button", { onClick: () => {
                                setMessagingListing(null);
                                setMessageText('');
                                setMessageConfirmation('');
                            }, className: "absolute right-4 top-4 rounded-full bg-red-500 hover:bg-red-600 px-3 py-1 text-lg text-white font-bold transition shadow-lg shadow-red-500/50 ring-2 ring-red-200", "aria-label": "Close messaging", children: "\u00D7" }), _jsxs("div", { className: "space-y-4 border-b border-gray-100 p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Message seller" }), _jsxs("div", { className: "flex items-start gap-3 rounded-2xl bg-gray-50 p-4", children: [_jsx("span", { className: "text-3xl", children: "\uD83D\uDC64" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: messagingListing.sellerName }), _jsxs("p", { className: "text-xs text-gray-500 line-clamp-1", children: ["Selling: ", messagingListing.title] })] })] })] }), _jsxs("form", { onSubmit: async (e) => {
                                e.preventDefault();
                                if (!messageText.trim() || !messagingListing) {
                                    setError('Please write a message');
                                    return;
                                }
                                setSendingMessage(true);
                                setError('');
                                try {
                                    // Get seller ID from marketplace listing
                                    const listingResponse = await fetch(`${API_BASE_URL}/marketplace/listings/${messagingListing._id}`, {
                                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                                    });
                                    const listingData = await listingResponse.json();
                                    const sellerId = listingData.data.sellerId?._id || listingData.data.sellerId?.id;
                                    if (!sellerId) {
                                        throw new Error('Unable to contact the seller right now');
                                    }
                                    const trimmed = messageText.trim();
                                    const clientMessageId = generateClientMessageId();
                                    const canUseSocket = Boolean(currentUserId && socketService.isConnected());
                                    if (canUseSocket) {
                                        socketService.sendMessage(sellerId, trimmed, messagingListing._id, clientMessageId);
                                    }
                                    else {
                                        // Send message via REST API
                                        const messageResponse = await fetch(`${API_BASE_URL}/messages`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({
                                                recipientId: sellerId,
                                                content: trimmed,
                                                listingId: messagingListing._id,
                                                clientMessageId,
                                            }),
                                        });
                                        if (!messageResponse.ok) {
                                            throw new Error('Failed to send message');
                                        }
                                    }
                                    setMessageConfirmation(`Message sent to ${messagingListing.sellerName}! They'll get back to you soon. 🎉`);
                                    setMessageText('');
                                    setTimeout(() => setMessageConfirmation(''), 4000);
                                }
                                catch (err) {
                                    setError(err.message || 'Failed to send message');
                                }
                                finally {
                                    setSendingMessage(false);
                                }
                            }, className: "space-y-4 p-6", children: [messageConfirmation && (_jsx("div", { className: "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm", children: messageConfirmation })), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Your message" }), _jsx("textarea", { value: messageText, onChange: (e) => setMessageText(e.target.value), placeholder: "Hi! I'm interested in this item. Is it still available?...", className: "mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", rows: 4, disabled: sendingMessage })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => {
                                                setMessagingListing(null);
                                                setMessageText('');
                                                setMessageConfirmation('');
                                            }, className: "flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600", children: "Cancel" }), _jsx("button", { type: "submit", disabled: sendingMessage || !messageText.trim(), className: "flex-1 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60", children: sendingMessage ? 'Sending...' : 'Send message' })] }), _jsx("p", { className: "text-xs text-gray-500 text-center", children: "Messages are monitored for safety. The seller will receive your contact info." })] })] }) }))] }));
}
//# sourceMappingURL=Marketplace.js.map