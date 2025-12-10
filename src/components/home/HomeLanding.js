"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Palette, ShieldCheck, Building2, MessageCircle, ChevronLeft, ChevronRight, ShoppingBag, Calendar, Sparkles, Heart, ArrowRight, Menu, X, } from 'lucide-react';
import { Button } from '@/components/ui/button';
const stats = [
    { label: 'Newcomers welcomed', value: 1200, suffix: '+', color: 'bg-emerald-500', icon: Sparkles },
    { label: 'Connections made', value: 15000, suffix: '+', color: 'bg-amber-500', icon: Heart },
    { label: 'Events hosted', value: 320, suffix: '+', color: 'bg-rose-500', icon: Calendar },
];
const pillars = [
    {
        icon: Palette,
        title: 'Culture-first design',
        description: 'Rooted in Habesha artistry with layered colour, language support, and typography that feels like home.',
        color: 'text-rose-400',
        href: '/forums',
    },
    {
        icon: ShieldCheck,
        title: 'Trusted marketplace',
        description: 'Moderated listings, verified sellers, and admin approvals keep buying, selling, and swapping safe for everyone.',
        color: 'text-sky-400',
        href: '/marketplace',
    },
    {
        icon: Building2,
        title: 'Business visibility',
        description: 'Spotlight Habesha-owned businesses with profiles, contact details, and admin-approved spotlights in seconds.',
        color: 'text-amber-400',
        href: '/business',
    },
    {
        icon: MessageCircle,
        title: 'Forums & knowledge threads',
        description: 'Threaded discussions with upvotes, saved posts, and moderation capture community wisdom for the long term.',
        color: 'text-violet-400',
        href: '/forums',
    },
];
const features = [
    {
        id: 'marketplace',
        title: 'Marketplace',
        description: 'Discover trusted listings from neighbours-jobs, housing, services, and essentials.',
        icon: ShoppingBag,
        color: 'bg-amber-500',
        href: '/marketplace',
    },
    {
        id: 'events',
        title: 'Events',
        description: 'Find cultural celebrations, community gatherings, and networking meetups near you.',
        icon: Calendar,
        color: 'bg-emerald-500',
        href: '/events',
    },
    {
        id: 'forums',
        title: 'Forums',
        description: 'Ask questions, share tips, and connect with neighbours who understand your journey.',
        icon: MessageCircle,
        color: 'bg-violet-500',
        href: '/forums',
    },
    {
        id: 'business',
        title: 'Directory',
        description: 'Support Habesha-owned businesses with verified profiles and community reviews.',
        icon: Building2,
        color: 'bg-rose-500',
        href: '/business',
    },
];
const testimonials = [
    {
        quote: 'I sold household essentials within a day and met a fellow entrepreneur who became a mentor. Pomi feels like home.',
        name: 'Eyerusalem A.',
        role: 'Marketplace Seller & Mentor',
    },
    {
        quote: 'Our community events used to scatter on WhatsApp. Now everything lives in one place, with RSVPs we can actually track.',
        name: 'Daniel H.',
        role: 'Event Organizer',
    },
    {
        quote: 'As a newcomer, finding local services was tough. The business directory made it effortless to support Habesha-owned shops.',
        name: 'Hanna G.',
        role: 'Newcomer & Student',
    },
];
const trendingListings = [
    { name: 'yiebfirfffor', price: '$90', location: 'Kanata', views: 10 },
    { name: 'MacBook Pro 2021', price: '$1,200', location: 'Downtown Ottawa', views: 6 },
    { name: 'Ginger', price: '$15', location: 'Kanata', views: 8 },
    { name: 'Chemistry Textbook', price: '$80', location: 'Downtown Ottawa', views: 3 },
];
const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Events', href: '/events' },
    { label: 'Directory', href: '/business' },
    { label: 'Forums', href: '/forums' },
];
export function HomeLanding({ isLoggedIn, currentUser, flashMessage, unreadAdminMessages, unreadMessagesCount, onLoginClick, onRegisterClick, onLogout, onAdminInboxClick, onCalendarClick, onMessagesClick, onExploreFeature, navigateTo, }) {
    const [currentFeature, setCurrentFeature] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [statValues, setStatValues] = useState(stats.map(() => 0));
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const duration = 1200;
        const start = performance.now();
        let frame;
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setStatValues(stats.map((stat) => Math.floor(stat.value * progress)));
            if (progress < 1) {
                frame = requestAnimationFrame(animate);
            }
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);
    const nextFeature = () => setCurrentFeature((prev) => (prev + 1) % features.length);
    const prevFeature = () => setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
    const handleMessagesClick = () => {
        if (isLoggedIn) {
            onMessagesClick();
        }
        else {
            onLoginClick();
        }
    };
    const handleAdminClick = () => {
        if (isLoggedIn) {
            onAdminInboxClick();
        }
        else {
            onLoginClick();
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsxs("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: [_jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "Pomi Community Hub" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Member access" })] })] }), _jsx("nav", { className: "hidden items-center gap-6 md:flex", children: navLinks.map((item) => (_jsx(Link, { to: item.href, className: "text-sm font-medium text-slate-400 transition-colors hover:text-white", children: item.label }, item.label))) }), _jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", onClick: handleMessagesClick, children: [_jsx(MessageSquare, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Messages" }), isLoggedIn && unreadMessagesCount > 0 && (_jsx("span", { className: "ml-1 rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold", children: unreadMessagesCount > 9 ? '9+' : unreadMessagesCount }))] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", onClick: handleAdminClick, children: [_jsx(ShieldCheck, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Admin" }), isLoggedIn && unreadAdminMessages > 0 && (_jsx("span", { className: "ml-1 rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold", children: unreadAdminMessages > 9 ? '9+' : unreadAdminMessages }))] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", onClick: onCalendarClick, children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Calendar" })] }), isLoggedIn ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "hidden text-sm text-slate-400 lg:inline", children: ["Welcome, ", _jsx("span", { className: "font-medium text-white", children: currentUser?.username ?? 'Friend' })] }), _jsx(Button, { size: "sm", className: "bg-orange-500 hover:bg-orange-600 text-white", onClick: onLogout, children: "Log out" })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", size: "sm", className: "text-white border-slate-700 bg-transparent hover:bg-slate-800", onClick: onLoginClick, children: "Log in" }), _jsx(Button, { size: "sm", className: "bg-orange-500 hover:bg-orange-600 text-white", onClick: onRegisterClick, children: "Join" })] })), _jsx(Button, { variant: "ghost", size: "sm", className: "md:hidden text-slate-300", onClick: () => setMobileMenuOpen((prev) => !prev), children: mobileMenuOpen ? _jsx(X, { className: "h-5 w-5" }) : _jsx(Menu, { className: "h-5 w-5" }) })] })] }), mobileMenuOpen && (_jsxs("div", { className: "md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4", children: [_jsx("nav", { className: "flex flex-col gap-2", children: navLinks.map((item) => (_jsx(Link, { to: item.href, className: "px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg", onClick: () => setMobileMenuOpen(false), children: item.label }, item.label))) }), _jsxs("div", { className: "mt-4 flex flex-col gap-2", children: [_jsx(Button, { variant: "ghost", className: "justify-start text-slate-300", onClick: handleMessagesClick, children: "Messages" }), _jsx(Button, { variant: "ghost", className: "justify-start text-slate-300", onClick: handleAdminClick, children: "Admin updates" }), _jsx(Button, { variant: "ghost", className: "justify-start text-slate-300", onClick: onCalendarClick, children: "Calendar" })] })] }))] }), flashMessage && (_jsx("div", { className: "mx-auto mt-6 max-w-3xl rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-3 text-center text-sm font-semibold text-slate-100 shadow-lg shadow-slate-900/40", children: flashMessage })), _jsxs("main", { children: [_jsxs("section", { className: "relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/10" }), _jsx("div", { className: "mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24", children: _jsxs("div", { className: "grid gap-12 lg:grid-cols-2 lg:gap-16", children: [_jsxs("div", { className: "flex flex-col justify-center", children: [_jsxs("div", { className: "mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900/50 px-4 py-2 text-slate-400", children: [_jsx("span", { className: "text-lg", children: "\uD83C\uDF0D" }), _jsx("span", { className: "text-sm font-medium", children: "Habesha Community - Worldwide" })] }), _jsx("h1", { className: "mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl", children: "One digital home for culture, opportunity, and connection." }), _jsx("p", { className: "mb-8 text-lg leading-relaxed text-slate-400 sm:text-xl", children: "Pomi brings together marketplace listings, cultural events, forums, faith circles, and a full business directory-designed with love for our Habesha community everywhere we live." }), _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs(Button, { size: "lg", className: "gap-2 bg-orange-500 hover:bg-orange-600 text-white", onClick: () => onExploreFeature('marketplace'), children: ["Explore Marketplace", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsx(Button, { size: "lg", variant: "outline", className: "gap-2 border-slate-700 bg-transparent text-white hover:bg-slate-800", onClick: isLoggedIn ? handleMessagesClick : onLoginClick, children: isLoggedIn ? 'Open messages' : 'Switch account' })] })] }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Community Pulse" }), stats.map((stat, index) => (_jsxs("div", { className: `${stat.color} rounded-xl p-5 transition-transform hover:scale-[1.02]`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(stat.icon, { className: "h-5 w-5 text-white/80" }), _jsx("span", { className: "text-sm font-medium text-white/90", children: stat.label })] }), _jsxs("p", { className: "mt-2 text-3xl font-bold text-white", children: [statValues[index]?.toLocaleString() ?? 0, stat.suffix || ''] })] }, stat.label))), _jsx("p", { className: "text-xs text-slate-500", children: "Stats updated weekly based on verified engagement inside the Pomi network." })] })] }) })] }), _jsx("section", { id: "pillars", className: "border-t border-slate-800 bg-slate-900/50 py-16 sm:py-24", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: _jsxs("div", { className: "grid gap-8 lg:grid-cols-3", children: [_jsxs("div", { className: "lg:col-span-1", children: [_jsx("p", { className: "mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400", children: "Community Pillars" }), _jsx("h2", { className: "mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl", children: "Ground every feature in culture, trust, and collaboration." }), _jsx("p", { className: "mb-6 text-slate-400", children: "We review these pillars every sprint so product decisions stay transparent and anchored in what matters most to the community." }), _jsxs("div", { className: "rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-slate-400", children: [_jsx("p", { className: "mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400", children: "How we measure success" }), _jsx("p", { children: "Every release is reviewed against these pillars-design warmth, trust guardrails, and end-to-end connected experiences. When something new ships, it should light up at least one pillar and never compromise the others." })] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:col-span-2", children: pillars.map((pillar) => (_jsx(Link, { to: pillar.href, children: _jsxs("div", { className: "h-full rounded-xl border border-slate-700 bg-slate-800/30 p-6 transition-all hover:border-slate-600 hover:bg-slate-800/50 hover:scale-[1.02] cursor-pointer", children: [_jsx(pillar.icon, { className: `mb-4 h-8 w-8 ${pillar.color}` }), _jsx("h3", { className: "mb-2 text-lg font-semibold text-white", children: pillar.title }), _jsx("p", { className: "text-sm text-slate-400", children: pillar.description })] }) }, pillar.title))) })] }) }) }), _jsx("section", { id: "experiences", className: "border-t border-slate-800 py-16 sm:py-24", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: [_jsxs("div", { className: "mb-8 flex items-start justify-between gap-8 lg:items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400", children: "Community Pillars" }), _jsx("h2", { className: "mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl", children: "Explore every layer of community life inside Pomi." }), _jsx("p", { className: "text-slate-400", children: "Tap into curated experiences-from job leads and classifieds to cultural celebrations, community gatherings, and secure moderation tools." })] }), _jsxs("div", { className: "hidden rounded-xl border border-slate-700 bg-slate-800/50 p-4 lg:block lg:max-w-xs", children: [_jsx("p", { className: "mb-1 text-sm font-semibold text-white", children: "Pro tip" }), _jsx("p", { className: "text-xs text-slate-400", children: "Moderators see additional tools after they sign in with the team's admin credentials. Reach out to community leadership if you need elevated access." })] })] }), _jsxs("div", { className: `relative overflow-hidden rounded-2xl ${features[currentFeature].color} p-8 sm:p-12 lg:p-16`, children: [_jsxs("div", { className: "flex flex-col items-center text-center", children: [(() => {
                                                    const IconComponent = features[currentFeature].icon;
                                                    return _jsx(IconComponent, { className: "mb-6 h-16 w-16 text-white/90" });
                                                })(), _jsx("h3", { className: "mb-4 text-4xl font-bold text-white sm:text-5xl", children: features[currentFeature].title }), _jsx("p", { className: "max-w-lg text-lg text-white/90", children: features[currentFeature].description })] }), _jsx("button", { onClick: prevFeature, className: "absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30", children: _jsx(ChevronLeft, { className: "h-6 w-6 text-white" }) }), _jsx("button", { onClick: nextFeature, className: "absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30", children: _jsx(ChevronRight, { className: "h-6 w-6 text-white" }) })] }), _jsxs("div", { className: "mt-6 flex items-center justify-between", children: [_jsxs("p", { className: "text-sm text-slate-400", children: ["Feature ", currentFeature + 1, " of ", features.length] }), _jsx("div", { className: "flex gap-2", children: features.map((_, index) => (_jsx("button", { onClick: () => setCurrentFeature(index), className: `h-2 rounded-full transition-all ${index === currentFeature ? 'w-6 bg-orange-500' : 'w-2 bg-slate-600'}`, "aria-label": `Go to feature ${features[index].title}` }, features[index].id))) })] }), _jsxs(Button, { size: "lg", className: "mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white", onClick: () => onExploreFeature(features[currentFeature].id), children: ["Explore ", features[currentFeature].title] })] }) }), _jsx("section", { className: "border-t border-slate-800 bg-gradient-to-b from-slate-950 to-rose-950/20 py-16 sm:py-24", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl", children: "Discover listings shared by neighbours across Ottawa" }), _jsx("p", { className: "text-slate-400", children: "Create listings, browse essentials, and support Habesha-owned services. Posting requires a Pomi account; browsing is open to everyone." })] }), _jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [_jsxs("div", { className: "relative rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-50 to-rose-50 p-6 sm:p-8 text-slate-900", children: [_jsxs("div", { className: "mb-6 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1", children: [_jsx(ShoppingBag, { className: "h-4 w-4 text-orange-600" }), _jsx("span", { className: "text-sm font-medium text-orange-700", children: "Marketplace - Powered by our community" })] }), _jsx("h3", { className: "mb-4 text-3xl font-bold sm:text-4xl", children: "Discover trusted listings from neighbours you know." }), _jsx("p", { className: "mb-6 text-slate-600", children: "Buy, sell, and swap within Ottawa's Ethiopian community. Find unique products, reliable services, and everyday essentials-safely and effortlessly." }), _jsx(Button, { size: "lg", className: "mb-6 w-full bg-orange-500 hover:bg-orange-600 text-white", onClick: () => onExploreFeature('marketplace'), children: "+ Create listing" }), _jsxs("div", { className: "mb-6 rounded-lg border border-orange-200 bg-orange-100/50 p-4 text-sm", children: [_jsx("p", { className: "mb-1 font-semibold text-orange-700", children: "Pending admin review" }), _jsx("p", { className: "text-xs text-orange-600", children: "Share your listing and the admin team will approve it before it appears in the marketplace. Check the admin portal for status." })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: "8" }), _jsx("p", { className: "text-xs text-slate-500", children: "Active Listings" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: "1" }), _jsx("p", { className: "text-xs text-slate-500", children: "New This Week" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-slate-900", children: "5" }), _jsx("p", { className: "text-xs text-slate-500", children: "Community Sellers" })] })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-700 bg-slate-800/50 p-6", children: [_jsx("h4", { className: "mb-4 text-lg font-semibold text-white", children: "Trending this week" }), _jsx("div", { className: "space-y-4", children: trendingListings.map((listing) => (_jsx(Link, { to: "/marketplace", children: _jsxs("div", { className: "flex items-center gap-4 rounded-lg bg-slate-900/50 p-3 hover:bg-slate-900 transition-colors cursor-pointer", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700", children: _jsx(ShoppingBag, { className: "h-5 w-5 text-slate-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium text-white", children: listing.name }), _jsxs("p", { className: "text-sm text-slate-400", children: [listing.price, " - ", listing.location] })] }), _jsxs("div", { className: "flex items-center gap-1 text-sm text-slate-400", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-orange-500" }), listing.views] })] }) }, listing.name))) }), _jsx(Button, { variant: "outline", className: "mt-6 w-full border-slate-700 text-white hover:bg-slate-700", onClick: () => navigateTo('/marketplace'), children: "Browse all listings" })] })] })] }) }), _jsx("section", { className: "border-t border-slate-800 py-16 sm:py-24", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: _jsxs("div", { className: "grid gap-8 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsx("p", { className: "mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400", children: "Business spotlight" }), _jsx("h3", { className: "mb-4 text-3xl font-bold text-white", children: "Directory, reviews, and admin-approved highlights." }), _jsx("p", { className: "text-slate-400", children: "Spotlight Habesha-owned businesses with profiles, contact details, and admin-approved spotlights in seconds. Verified badges help the community find and trust local services." }), _jsx("div", { className: "mt-6 space-y-3", children: ['Verified listings & hours', 'Community testimonials', 'Admin spotlights & features'].map((item) => (_jsxs("div", { className: "flex items-center gap-3 text-slate-300", children: [_jsx(ShieldCheck, { className: "h-4 w-4 text-emerald-400" }), _jsx("span", { children: item })] }, item))) }), _jsx(Button, { className: "mt-6 bg-emerald-500 hover:bg-emerald-600", onClick: () => navigateTo('/business'), children: "Browse businesses" })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsx("p", { className: "mb-1 text-xs font-semibold uppercase tracking-wider text-rose-400", children: "Forums" }), _jsx("h3", { className: "mb-4 text-3xl font-bold text-white", children: "Threaded discussions & knowledge sharing." }), _jsx("p", { className: "text-slate-400", children: "Ask questions, share tips, and connect with neighbours who understand your journey. Save threads for later, upvote helpful answers, and learn from community leaders." }), _jsx(Button, { className: "mt-6", onClick: () => navigateTo('/forums'), children: "Jump into forums" })] })] }) }) }), _jsx("section", { id: "testimonials", className: "border-t border-slate-800 bg-slate-950 py-16 sm:py-24", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: [_jsxs("div", { className: "mb-10 text-center", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-emerald-400", children: "Voices" }), _jsx("h2", { className: "mt-2 text-3xl font-bold text-white sm:text-4xl", children: "\"Pomi feels like walking into a community centre-online.\"" }), _jsx("p", { className: "mt-4 text-slate-400", children: "Members use Pomi to buy and sell essentials, secure new roles, launch cultural events, and mentor the next generation." })] }), _jsx("div", { className: "grid gap-6 lg:grid-cols-3", children: testimonials.map((testimonial) => (_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsxs("p", { className: "text-lg font-medium text-white/90", children: ["\"", testimonial.quote, "\""] }), _jsxs("div", { className: "mt-4 text-sm text-slate-400", children: [_jsx("p", { className: "font-semibold text-white", children: testimonial.name }), _jsx("p", { children: testimonial.role })] })] }, testimonial.name))) })] }) }), _jsx("section", { className: "border-t border-slate-800 py-16 sm:py-24", children: _jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: _jsx("div", { className: "overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 p-8 sm:p-12 lg:p-16", children: _jsxs("div", { className: "grid gap-8 lg:grid-cols-2 lg:gap-12", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1", children: [_jsx("span", { className: "text-white", children: "\uD83C\uDF81" }), _jsx("span", { className: "text-sm font-medium text-white", children: "Membership is free" })] }), _jsx("h2", { className: "mb-4 text-3xl font-bold text-white sm:text-4xl", children: "Ready to unlock opportunity, culture, and community in one home?" }), _jsx("p", { className: "text-white/90", children: "Join thousands of neighbours who already share resources, co-create events, and keep the Habesha community thriving. It takes less than two minutes to create your profile." })] }), _jsxs("div", { className: "flex flex-col justify-center", children: [_jsxs("div", { className: "mb-6 flex flex-wrap gap-4 text-sm text-white/80", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "h-4 w-4" }), " Secure sign-up"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), " Moderated platform"] }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Palette, { className: "h-4 w-4" }), " Multilingual"] })] }), _jsx(Button, { size: "lg", className: "w-full bg-white text-orange-600 hover:bg-white/90 font-semibold sm:w-auto", onClick: isLoggedIn ? () => onExploreFeature('events') : onRegisterClick, children: isLoggedIn ? 'Dive back into Pomi' : 'Create your Pomi account' })] })] }) }) }) })] }), _jsx("footer", { className: "border-t border-slate-800 bg-slate-950 py-12", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: [_jsxs("div", { className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "Pomi Community Hub" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Community" })] })] }), _jsx("p", { className: "text-sm text-slate-400", children: "Designed by and for the Habesha community. Proudly rooted in culture, powered by modern technology." })] }), _jsxs("div", { children: [_jsx("h4", { className: "mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Platform" }), _jsx("ul", { className: "space-y-2", children: [
                                                { label: 'Events', href: '/events' },
                                                { label: 'Marketplace', href: '/marketplace' },
                                                { label: 'Business directory', href: '/business' },
                                                { label: 'Forums', href: '/forums' },
                                            ].map((item) => (_jsx("li", { children: _jsx(Link, { to: item.href, className: "text-sm text-slate-400 hover:text-white transition-colors", children: item.label }) }, item.label))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Resources" }), _jsxs("ul", { className: "space-y-2 text-sm text-slate-400", children: [_jsx("li", { children: "Support centre" }), _jsx("li", { children: "Guides for newcomers" }), _jsx("li", { children: "Community standards" }), _jsx("li", { children: "Privacy & safety" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400", children: "Get in Touch" }), _jsxs("ul", { className: "space-y-2 text-sm text-slate-400", children: [_jsx("li", { children: "Email: support@pomi.community" }), _jsx("li", { children: "Instagram: @pomi.community" }), _jsx("li", { children: "Facebook: Pomi Community Network" }), _jsx("li", { children: "LinkedIn: Pomi Community Hub" })] })] })] }), _jsx("div", { className: "mt-12 border-t border-slate-800 pt-8 text-center", children: _jsxs("p", { className: "text-sm text-slate-500", children: ["\u00A9 ", new Date().getFullYear(), " Pomi Community Hub. Built by us, for us."] }) })] }) })] }));
}
//# sourceMappingURL=HomeLanding.js.map