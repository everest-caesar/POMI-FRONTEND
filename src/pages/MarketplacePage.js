import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Marketplace from '../components/Marketplace';
import authService from '../services/authService';
export default function MarketplacePage() {
    const token = authService.getToken() || '';
    const isAdmin = Boolean(authService.getUserData()?.isAdmin);
    const navigate = useNavigate();
    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
        }
    }, [isAdmin, navigate]);
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "border-b border-white/10 bg-slate-950/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6", children: [_jsx(Link, { to: "/", className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white", children: "\u2190 Home" }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/60", children: "Habesha Marketplace" }), _jsx("h1", { className: "text-xl font-black text-white", children: "Community listings & services" })] })] }) }), _jsx("main", { className: "px-6 py-12", children: _jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-2xl font-black text-white sm:text-3xl", children: "Discover listings shared by neighbours across Ottawa" }), _jsx("p", { className: "text-sm text-white/70 sm:text-base", children: "Create listings, browse essentials, and support Habesha-owned services. Posting requires a Pomi account; browsing is open to everyone." })] }), _jsx("div", { className: "overflow-hidden rounded-[32px] border border-gray-200 bg-white p-4 text-gray-900 shadow-[0_30px_60px_rgba(15,23,42,0.25)]", children: _jsx(Marketplace, { token: token, isAdmin: isAdmin }) })] }) })] }));
}
//# sourceMappingURL=MarketplacePage.js.map