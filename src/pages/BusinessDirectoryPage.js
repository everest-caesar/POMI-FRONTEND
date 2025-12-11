import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Globe, Star, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../utils/axios';
import authService from '../services/authService';
import { Button } from '@/components/ui/button';
const CATEGORY_DISPLAY_MAP = {
    retail: 'Retail & Shopping',
    restaurant: 'Food & Hospitality',
    services: 'Services',
    healthcare: 'Healthcare',
    education: 'Education',
    technology: 'Technology',
    finance: 'Finance',
    entertainment: 'Entertainment',
    other: 'Other',
};
const ITEMS_PER_PAGE = 6;
const ADMIN_CONTACT_EMAIL = 'marakihay@gmail.com';
export default function BusinessDirectoryPage() {
    const navigate = useNavigate();
    const currentUser = authService.getUserData();
    const isAdmin = Boolean(currentUser?.isAdmin);
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSector, setActiveSector] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [hasWebsiteOnly, setHasWebsiteOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    // Redirect admins to admin portal
    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
        }
    }, [isAdmin, navigate]);
    // Fetch businesses on mount
    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get('/businesses', {
                    params: {
                        status: 'active',
                        limit: 100,
                    },
                });
                const activeBusinesses = response.data.data || response.data;
                setBusinesses(Array.isArray(activeBusinesses) ? activeBusinesses : []);
            }
            catch (err) {
                console.error('Failed to fetch businesses:', err);
                setError('Failed to load businesses. Please try again later.');
                setBusinesses([]);
            }
            finally {
                setLoading(false);
            }
        };
        fetchBusinesses();
    }, []);
    const sectors = useMemo(() => {
        const unique = new Set(businesses
            .filter((b) => b.status === 'active')
            .map((business) => CATEGORY_DISPLAY_MAP[business.category] || business.category));
        return ['All', ...Array.from(unique).sort()];
    }, [businesses]);
    const filteredBusinesses = useMemo(() => {
        let result = businesses.filter((b) => b.status === 'active');
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((b) => b.businessName.toLowerCase().includes(query) ||
                b.description.toLowerCase().includes(query) ||
                b.category.toLowerCase().includes(query) ||
                (b.address && b.address.toLowerCase().includes(query)));
        }
        // Apply category filter
        if (activeSector !== 'All') {
            result = result.filter((business) => {
                const displayCategory = CATEGORY_DISPLAY_MAP[business.category] || business.category;
                return displayCategory === activeSector;
            });
        }
        // Apply verified filter
        if (verifiedOnly) {
            result = result.filter((b) => b.verified);
        }
        // Apply website filter
        if (hasWebsiteOnly) {
            result = result.filter((b) => b.website);
        }
        return result;
    }, [activeSector, businesses, searchQuery, verifiedOnly, hasWebsiteOnly]);
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeSector, verifiedOnly, hasWebsiteOnly]);
    const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);
    const paginatedBusinesses = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredBusinesses, currentPage]);
    const verifiedCount = useMemo(() => businesses.filter((b) => b.verified && b.status === 'active').length, [businesses]);
    const categoriesCount = useMemo(() => new Set(businesses.filter((b) => b.status === 'active').map((b) => b.category)).size, [businesses]);
    // Get featured business (highest rated verified business)
    const featuredBusiness = useMemo(() => {
        const verified = businesses.filter((b) => b.status === 'active' && b.verified);
        if (verified.length === 0)
            return null;
        return verified.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    }, [businesses]);
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur", children: _jsx("div", { className: "mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6", children: _jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "Pomi" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Business Directory" })] })] }) }) }), _jsxs("main", { className: "mx-auto max-w-6xl px-4 py-8 sm:px-6", children: [_jsxs("div", { className: "mb-8 space-y-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300", children: "Community businesses" }), _jsx("h1", { className: "text-3xl font-bold text-white", children: "Find and support Habesha-owned businesses" }), _jsx("p", { className: "text-slate-400 max-w-2xl", children: "Every listing is reviewed with the business owner to verify offerings, contact details, and community alignment." })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-8", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center", children: [_jsx("p", { className: "text-2xl font-bold text-white", children: businesses.filter((b) => b.status === 'active').length }), _jsx("p", { className: "text-xs text-slate-400", children: "Total businesses" })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center", children: [_jsx("p", { className: "text-2xl font-bold text-emerald-400", children: verifiedCount }), _jsx("p", { className: "text-xs text-slate-400", children: "Verified" })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center", children: [_jsx("p", { className: "text-2xl font-bold text-orange-400", children: categoriesCount }), _jsx("p", { className: "text-xs text-slate-400", children: "Categories" })] })] }), featuredBusiness && (_jsxs("div", { className: "mb-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Star, { className: "h-5 w-5 text-amber-400 fill-amber-400" }), _jsx("span", { className: "text-sm font-semibold text-amber-300", children: "Featured Business" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start", children: [featuredBusiness.featuredImage && (_jsx("img", { src: featuredBusiness.featuredImage, alt: featuredBusiness.businessName, className: "w-full sm:w-32 h-24 object-cover rounded-xl" })), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: featuredBusiness.businessName }), featuredBusiness.verified && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded", children: [_jsx(ShieldCheck, { className: "h-3 w-3" }), " Verified"] }))] }), _jsx("p", { className: "text-sm text-slate-400 mb-2", children: CATEGORY_DISPLAY_MAP[featuredBusiness.category] || featuredBusiness.category }), _jsx("p", { className: "text-sm text-slate-300 line-clamp-2", children: featuredBusiness.description }), _jsx("div", { className: "flex gap-2 mt-3", children: _jsx(Link, { to: `/business/${featuredBusiness._id}`, children: _jsx(Button, { size: "sm", className: "bg-orange-500 hover:bg-orange-600 text-white", children: "View profile" }) }) })] })] })] })), _jsxs("div", { className: "space-y-4 mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" }), _jsx("input", { type: "text", placeholder: "Search businesses by name, category, or location...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full rounded-xl border border-slate-700 bg-slate-800 pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-6", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-300 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: verifiedOnly, onChange: (e) => setVerifiedOnly(e.target.checked), className: "h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500" }), _jsx(ShieldCheck, { className: "h-4 w-4 text-emerald-400" }), "Verified only"] }), _jsxs("label", { className: "flex items-center gap-2 text-sm text-slate-300 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: hasWebsiteOnly, onChange: (e) => setHasWebsiteOnly(e.target.checked), className: "h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500" }), _jsx(Globe, { className: "h-4 w-4 text-blue-400" }), "Has website"] })] }), _jsx("div", { className: "flex flex-wrap items-center gap-2", children: sectors.map((sector) => {
                                    const isActive = sector === activeSector;
                                    return (_jsx("button", { onClick: () => setActiveSector(sector), className: `rounded-full px-4 py-2 text-sm font-medium transition ${isActive
                                            ? 'bg-orange-500 text-white'
                                            : 'border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'}`, children: sector }, sector));
                                }) })] }), _jsxs("div", { className: "mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-white mb-2", children: "Want your business listed?" }), _jsx("p", { className: "text-sm text-slate-400", children: "Submit your business details for review. We verify all listings before they go live." })] }), _jsx(Link, { to: "/business/new", children: _jsx(Button, { className: "bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap", children: "List your business" }) })] }), isAdmin && (_jsx("p", { className: "mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300", children: "Admin view: Use the console to add or manage businesses after verification calls." }))] }), _jsx("div", { className: "mb-4 flex items-center justify-between", children: _jsxs("p", { className: "text-sm text-slate-400", children: ["Showing ", paginatedBusinesses.length, " of ", filteredBusinesses.length, " businesses"] }) }), _jsxs("section", { className: "space-y-6", children: [loading && (_jsx("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center", children: _jsx("p", { className: "text-slate-400 animate-pulse", children: "Loading businesses..." }) })), error && (_jsx("div", { className: "rounded-2xl border border-rose-500/30 bg-rose-500/10 p-10 text-center", children: _jsx("p", { className: "text-rose-300", children: error }) })), !loading && !error && paginatedBusinesses.length > 0 && (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: paginatedBusinesses.map((business) => (_jsxs("article", { className: "flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition hover:border-slate-700", children: [business.featuredImage && (_jsx("div", { className: "aspect-video w-full overflow-hidden bg-slate-800", children: _jsx("img", { src: business.featuredImage, alt: business.businessName, className: "h-full w-full object-cover" }) })), _jsxs("div", { className: "flex flex-col gap-3 p-5 flex-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs font-medium text-slate-400 mb-1", children: CATEGORY_DISPLAY_MAP[business.category] || business.category }), _jsx("h3", { className: "text-lg font-semibold text-white", children: business.businessName })] }), business.verified && (_jsx("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded", children: _jsx(ShieldCheck, { className: "h-3 w-3" }) }))] }), business.rating && (_jsxs("div", { className: "flex items-center gap-1 text-sm", children: [_jsx(Star, { className: "h-4 w-4 text-amber-400 fill-amber-400" }), _jsx("span", { className: "text-white", children: business.rating.toFixed(1) }), _jsxs("span", { className: "text-slate-500", children: ["(", business.reviewCount || 0, ")"] })] })), _jsx("p", { className: "text-sm text-slate-400 line-clamp-2 flex-1", children: business.description }), _jsxs("div", { className: "space-y-1.5 text-sm text-slate-400", children: [business.address && (_jsx("p", { className: "truncate", children: business.address })), business.phone && (_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "h-3 w-3" }), " ", business.phone] }))] }), _jsxs("div", { className: "flex gap-2 mt-2 pt-3 border-t border-slate-800", children: [_jsx(Link, { to: `/business/${business._id}`, className: "flex-1", children: _jsx(Button, { variant: "outline", size: "sm", className: "w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white", children: "View profile" }) }), business.email && (_jsx("a", { href: `mailto:${business.email}?subject=Pomi%20Business%20Directory%20Inquiry:%20${encodeURIComponent(business.businessName)}`, children: _jsx(Button, { size: "sm", className: "bg-orange-500 hover:bg-orange-600 text-white", children: _jsx(Mail, { className: "h-4 w-4" }) }) }))] })] })] }, business._id))) })), !loading && !error && filteredBusinesses.length === 0 && (_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center", children: [_jsx("p", { className: "text-slate-400 mb-2", children: "No businesses found matching your criteria." }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Try adjusting your filters or", ' ', _jsx("a", { href: `mailto:${ADMIN_CONTACT_EMAIL}`, className: "text-orange-400 hover:underline", children: "recommend a business" }), "."] })] }))] }), !loading && !error && totalPages > 1 && (_jsxs("div", { className: "mt-8 flex items-center justify-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, className: "border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50", children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (_jsx("button", { onClick: () => setCurrentPage(page), className: `h-8 w-8 rounded-lg text-sm font-medium transition ${page === currentPage
                                        ? 'bg-orange-500 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`, children: page }, page))) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, className: "border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50", children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] }))] })] }));
}
//# sourceMappingURL=BusinessDirectoryPage.js.map