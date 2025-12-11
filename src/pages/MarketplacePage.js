import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MessageCircle, Heart, Plus } from 'lucide-react';
import Marketplace from '../components/Marketplace';
import authService from '../services/authService';
import { Button } from '@/components/ui/button';
export default function MarketplacePage() {
    const token = authService.getToken() || '';
    const isAdmin = Boolean(authService.getUserData()?.isAdmin);
    const navigate = useNavigate();
    const [wishlistCount, setWishlistCount] = useState(0);
    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
        }
    }, [isAdmin, navigate]);
    useEffect(() => {
        const saved = localStorage.getItem('marketplace_favorites');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
            }
            catch {
                setWishlistCount(0);
            }
        }
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "Pomi" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Marketplace" })] })] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/messages", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Messages" })] }) }), wishlistCount > 0 && (_jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(Heart, { className: "h-4 w-4" }), _jsxs("span", { className: "hidden sm:inline", children: [wishlistCount, " saved"] })] })), token && (_jsx(Link, { to: "/marketplace/new", children: _jsxs(Button, { size: "sm", className: "gap-2 bg-orange-500 hover:bg-orange-600 text-white", children: [_jsx(Plus, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "New Listing" })] }) }))] })] }) }), _jsxs("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [_jsxs("div", { className: "mb-8 space-y-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300", children: "Community marketplace" }), _jsx("h1", { className: "text-3xl font-bold text-white", children: "Discover trusted listings from neighbours" }), _jsx("p", { className: "text-slate-400 max-w-2xl", children: "Buy, sell, and swap within Ottawa's Habesha community. Find unique products, reliable services, and everyday essentials." })] }), _jsx("div", { className: "overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-gray-900", children: _jsx(Marketplace, { token: token, isAdmin: isAdmin }) })] })] }));
}
//# sourceMappingURL=MarketplacePage.js.map