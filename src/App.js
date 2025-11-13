import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import authService from './services/authService';
import Events from './components/Events';
import EnhancedAuthForm from './components/EnhancedAuthForm';
import FeatureCarousel from './components/FeatureCarousel';
const BASE_FEATURES = [
    {
        id: 'events',
        icon: '🎉',
        title: 'Events',
        description: 'Celebrate culture, connect IRL, and RSVP to the Habesha gatherings that matter to you.',
        gradient: 'bg-gradient-to-br from-rose-500 via-red-500 to-orange-500',
        borderColor: 'border-rose-200',
    },
    {
        id: 'marketplace',
        icon: '🛍️',
        title: 'Marketplace',
        description: 'Discover trusted listings from neighbours—jobs, housing, services, and essentials.',
        gradient: 'bg-gradient-to-br from-amber-400 via-orange-400 to-red-400',
        borderColor: 'border-amber-200',
    },
    {
        id: 'business',
        icon: '🏢',
        title: 'Business Directory',
        description: 'Spotlight Habesha-owned businesses in Ottawa and make it easy to support local.',
        gradient: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-rose-400',
        borderColor: 'border-yellow-200',
    },
    {
        id: 'forums',
        icon: '💬',
        title: 'Forums',
        description: 'Join threaded conversations with upvotes, saved posts, and layered moderation to swap advice, spotlight wins, and discuss community news.',
        gradient: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500',
        borderColor: 'border-emerald-200',
    },
    {
        id: 'community',
        icon: '👥',
        title: 'Religious Community Circle',
        description: 'Connect faith communities across Ottawa, share announcements, and coordinate cultural celebrations together.',
        gradient: 'bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500',
        borderColor: 'border-fuchsia-200',
    },
];
const HERO_STATS = [
    { icon: '🌱', label: 'Newcomers welcomed', value: '1,200+', accent: 'from-emerald-400 to-teal-500' },
    { icon: '🤝', label: 'Connections made', value: '15k+', accent: 'from-amber-400 to-orange-500' },
    { icon: '🎉', label: 'Events hosted', value: '320+', accent: 'from-rose-400 to-red-500' },
];
const COMMUNITY_HIGHLIGHTS = [
    {
        title: 'Culture-first design',
        blurb: 'Rooted in Habesha artistry with layered colour, language support, and typography that feels like home.',
        icon: '🎨',
    },
    {
        title: 'Trusted marketplace',
        blurb: 'Moderated listings, verified sellers, and admin approvals keep buying, selling, and swapping safe for everyone.',
        icon: '🛡️',
    },
    {
        title: 'Business visibility',
        blurb: 'Spotlight Habesha-owned businesses with profiles, contact details, and admin-approved spotlights in seconds.',
        icon: '🏢',
    },
    {
        title: 'Forums & knowledge threads',
        blurb: 'Threaded discussions with upvotes, saved posts, and moderation capture community wisdom for the long term.',
        icon: '💬',
    },
    {
        title: 'Religious community circle',
        blurb: 'Faith groups coordinate celebrations, charity drives, and announcements in one shared digital home.',
        icon: '🙏',
    },
];
const TESTIMONIALS = [
    {
        quote: '“I sold household essentials within a day and met a fellow entrepreneur who became a mentor. Pomi feels like home.”',
        name: 'Eyerusalem A.',
        role: 'Marketplace seller & mentor',
    },
    {
        quote: '“Our community events used to scatter on WhatsApp. Now everything lives in one place, with RSVPs we can actually track.”',
        name: 'Daniel H.',
        role: 'Event organizer',
    },
    {
        quote: '“As a newcomer, finding local services was tough. The business directory made it effortless to support Habesha-owned shops.”',
        name: 'Hanna G.',
        role: 'Newcomer & student',
    },
];
const ETHIOPIAN_CALENDAR_HIGHLIGHTS = [
    {
        title: 'Enkutatash • Ethiopian New Year',
        date: 'Meskerem 1 • September 11/12',
        description: 'Families gather to celebrate renewal with flowers, traditional meals, and blessings for the year ahead.',
    },
    {
        title: 'Meskel • Finding of the True Cross',
        date: 'Meskerem 17 • September 27/28',
        description: 'Communities light the Demera bonfire, sing mezmur, and honour a 1,700-year tradition of faith.',
    },
    {
        title: 'Genna • Ethiopian Christmas',
        date: 'Tahisas 29 • January 7',
        description: 'Church processions, fasting traditions, and family feasts mark this sacred holiday.',
    },
    {
        title: 'Timket • Epiphany',
        date: 'Tir 11 • January 19',
        description: 'Colourful processions celebrate the baptism of Christ with water blessings and spirited dancing.',
    },
    {
        title: 'Adwa Victory Day',
        date: 'Yekatit 23 • March 2',
        description: 'Honours the Ethiopian victory over colonial forces in 1896—a reminder of unity and resilience.',
    },
];
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [currentUser, setCurrentUser] = useState(authService.getUserData());
    const [activeFeature, setActiveFeature] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showAdminInbox, setShowAdminInbox] = useState(false);
    const [adminMessages, setAdminMessages] = useState(() => {
        try {
            const stored = localStorage.getItem('adminInboxMessages');
            if (stored) {
                return JSON.parse(stored);
            }
        }
        catch {
            return [];
        }
        return [];
    });
    const [unreadAdminMessages, setUnreadAdminMessages] = useState(() => {
        try {
            const storedCount = localStorage.getItem('adminInboxUnread');
            if (storedCount) {
                const parsed = parseInt(storedCount, 10);
                if (!Number.isNaN(parsed)) {
                    return parsed;
                }
            }
            const storedMessages = localStorage.getItem('adminInboxMessages');
            if (storedMessages) {
                const parsedMessages = JSON.parse(storedMessages);
                return parsedMessages.filter((message) => !message.read && message.sender === 'admin').length;
            }
        }
        catch {
            return 0;
        }
        return 0;
    });
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [messageDraft, setMessageDraft] = useState('');
    const [inboxFilter, setInboxFilter] = useState('updates');
    const navigate = useNavigate();
    const location = useLocation();
    const features = useMemo(() => {
        return [...BASE_FEATURES];
    }, []);
    const triggerFlash = (message) => {
        setFlashMessage(message);
        window.setTimeout(() => setFlashMessage(null), 4000);
    };
    const inboxMessages = useMemo(() => {
        const filtered = inboxFilter === 'sent'
            ? adminMessages.filter((message) => message.sender === 'member')
            : adminMessages.filter((message) => message.sender === 'admin');
        return [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [adminMessages, inboxFilter]);
    useEffect(() => {
        try {
            localStorage.setItem('adminInboxMessages', JSON.stringify(adminMessages));
        }
        catch {
            // ignore storage write errors
        }
    }, [adminMessages]);
    useEffect(() => {
        try {
            localStorage.setItem('adminInboxUnread', String(unreadAdminMessages));
        }
        catch {
            // ignore storage write errors
        }
    }, [unreadAdminMessages]);
    useEffect(() => {
        if (location.state?.requireAuth) {
            setAuthMode('login');
            setShowAuthModal(true);
            navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true });
        }
    }, [location, navigate]);
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            setIsLoggedIn(false);
            setCurrentUser(null);
            return;
        }
        setIsLoggedIn(true);
        const cached = authService.getUserData();
        if (cached) {
            setCurrentUser(cached);
        }
        authService
            .getCurrentUser()
            .then((response) => {
            setCurrentUser(response.user);
        })
            .catch(() => {
            authService.removeToken();
            authService.clearUserData();
            setIsLoggedIn(false);
            setCurrentUser(null);
        });
    }, []);
    useEffect(() => {
        if (showAdminInbox) {
            setAdminMessages((prev) => {
                let changed = false;
                const next = prev.map((message) => {
                    if (message.sender === 'admin' && !message.read) {
                        changed = true;
                        return { ...message, read: true };
                    }
                    return message;
                });
                return changed ? next : prev;
            });
            if (unreadAdminMessages > 0) {
                setUnreadAdminMessages(0);
            }
        }
    }, [showAdminInbox, unreadAdminMessages]);
    // Fetch unread messages count for regular user-to-user messages
    useEffect(() => {
        if (!isLoggedIn) {
            setUnreadMessagesCount(0);
            return;
        }
        const fetchUnreadCount = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/messages/unread/count`, {
                    headers: {
                        'Authorization': `Bearer ${authService.getToken()}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUnreadMessagesCount(data.unreadCount || 0);
                }
            }
            catch (error) {
                console.error('Failed to fetch unread messages count:', error);
            }
        };
        fetchUnreadCount();
        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [isLoggedIn]);
    const handleAuthSuccess = (user) => {
        setCurrentUser(user);
        localStorage.setItem('userData', JSON.stringify(user));
        setIsLoggedIn(true);
        if (authMode === 'register') {
            const welcomeMessage = {
                id: `welcome-${Date.now()}`,
                sender: 'admin',
                body: `Selam ${user.username.split(' ')[0]}! Welcome to Pomi. Take a look around the forums, browse the marketplace, and RSVP for upcoming events. Reply here anytime if you have questions—we’re here to support you.`,
                createdAt: new Date().toISOString(),
                read: false,
            };
            setAdminMessages((prev) => [welcomeMessage, ...prev]);
            setUnreadAdminMessages((prev) => prev + 1);
            setInboxFilter('updates');
        }
        triggerFlash(authMode === 'register'
            ? 'You have successfully created your Pomi account.'
            : 'You have successfully logged in.');
        setAuthMode('login');
    };
    const handleLogout = () => {
        authService.removeToken();
        authService.clearUserData();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setAuthMode('login');
        triggerFlash('You have been signed out.');
    };
    const handleSendMessageToAdmin = (event) => {
        event.preventDefault();
        if (!messageDraft.trim()) {
            return;
        }
        if (!isLoggedIn) {
            setAuthMode('login');
            setShowAuthModal(true);
            return;
        }
        const newMessage = {
            id: `member-${Date.now()}`,
            sender: 'member',
            body: messageDraft.trim(),
            createdAt: new Date().toISOString(),
            read: true,
        };
        setAdminMessages((prev) => [...prev, newMessage]);
        setInboxFilter('sent');
        setMessageDraft('');
    };
    const handleOpenAdminInbox = () => {
        if (!isLoggedIn) {
            setAuthMode('login');
            setShowAuthModal(true);
            return;
        }
        setInboxFilter('updates');
        setShowAdminInbox(true);
    };
    const handleExploreFeature = (id) => {
        if (id === 'marketplace') {
            navigate('/marketplace');
            return;
        }
        if (id === 'business') {
            navigate('/business');
            return;
        }
        if (!isLoggedIn) {
            setAuthMode('register');
            setShowAuthModal(true);
            return;
        }
        setActiveFeature(id);
    };
    const token = authService.getToken() || '';
    return (_jsxs("div", { className: "relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100", children: [_jsxs("div", { className: "pointer-events-none absolute inset-0", children: [_jsx("div", { className: "absolute -top-24 -right-32 h-[420px] w-[420px] rounded-full bg-red-500/30 blur-3xl" }), _jsx("div", { className: "absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-orange-500/20 blur-3xl" }), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" })] }), _jsx("nav", { className: "sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4", children: [_jsxs(Link, { to: "/", className: "group flex items-center gap-3", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-2xl font-black text-white shadow-lg shadow-red-500/40 transition group-hover:scale-105", children: "P" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.4em] text-white/60", children: "Pomi Community Hub" }), _jsx("p", { className: "text-lg font-black text-white", children: "Ottawa" })] })] }), _jsxs("nav", { className: "hidden items-center gap-6 text-sm font-semibold text-white/70 md:flex", children: [_jsx("a", { href: "#pillars", className: "hover:text-white transition", children: "Pillars" }), _jsx("a", { href: "#experiences", className: "hover:text-white transition", children: "Experiences" }), _jsx("a", { href: "#testimonials", className: "hover:text-white transition", children: "Stories" }), _jsx("a", { href: "#join", className: "hover:text-white transition", children: "Join Us" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setShowCalendarModal(true), className: "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white/80 transition hover:border-white/40 hover:text-white", "aria-label": "Open Ethiopian calendar highlights", children: "\uD83D\uDDD3\uFE0F" }), _jsxs("button", { onClick: handleOpenAdminInbox, className: "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white/80 transition hover:border-white/40 hover:text-white", "aria-label": isLoggedIn ? 'Open messages from the admin team' : 'Log in to see admin messages', children: ["\uD83D\uDCAC", unreadAdminMessages > 0 && (_jsx("span", { className: "absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow shadow-red-500/40", children: unreadAdminMessages > 9 ? '9+' : unreadAdminMessages }))] }), isLoggedIn ? (_jsxs("button", { onClick: () => navigate('/messages'), className: "relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white", "aria-label": "Go to direct messages", children: ["\u2709\uFE0F Messages", unreadMessagesCount > 0 && (_jsx("span", { className: "absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow shadow-red-500/40", children: unreadMessagesCount > 9 ? '9+' : unreadMessagesCount }))] })) : null, isLoggedIn ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "hidden text-sm text-white/70 md:block", children: ["Welcome, ", _jsx("span", { className: "font-semibold text-white", children: currentUser?.username || 'Friend' })] }), _jsx("button", { onClick: handleLogout, className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5", children: "Log out" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                                                setAuthMode('login');
                                                setShowAuthModal(true);
                                            }, className: "rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white", children: "Log in" }), _jsx("button", { onClick: () => {
                                                setAuthMode('register');
                                                setShowAuthModal(true);
                                            }, className: "rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5", children: "Join community" })] }))] })] }) }), flashMessage && (_jsx("div", { className: "mx-auto mt-6 max-w-3xl rounded-full border border-white/10 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/40 backdrop-blur-lg", children: flashMessage })), _jsxs("main", { className: "relative z-10", children: [_jsx("section", { className: "px-6 pt-20", id: "hero", children: _jsxs("div", { className: "mx-auto grid max-w-7xl items-center gap-12 rounded-[40px] border border-white/10 bg-white/5 p-10 shadow-[0_40px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:grid-cols-[1.5fr,1fr]", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70", children: [_jsx("span", { className: "text-base", children: "\uD83C\uDF0D" }), " Ottawa \u2022 Habesha Community"] }), _jsx("h1", { className: "text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl", children: "One digital home for culture, opportunity, and connection." }), _jsx("p", { className: "max-w-2xl text-lg text-white/80 md:text-xl", children: "Pomi brings together marketplace listings, cultural events, forums, faith circles, and a full business directory\u2014designed with love for our Habesha community in Ottawa." }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsx("button", { onClick: () => {
                                                        if (isLoggedIn) {
                                                            handleExploreFeature('marketplace');
                                                        }
                                                        else {
                                                            setAuthMode('register');
                                                            setShowAuthModal(true);
                                                        }
                                                    }, className: "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-400 via-red-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5", children: "Explore Marketplace" }), _jsx("button", { onClick: () => {
                                                        setAuthMode(isLoggedIn ? 'login' : 'register');
                                                        setShowAuthModal(true);
                                                    }, className: "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white", children: isLoggedIn ? 'Switch account' : 'Create profile' })] })] }), _jsxs("div", { className: "space-y-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.45)]", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-white/60", children: "Community pulse" }), _jsx("div", { className: "grid gap-4", children: HERO_STATS.map((stat) => (_jsxs("div", { className: `rounded-2xl border border-white/10 bg-gradient-to-r ${stat.accent} px-4 py-4 shadow-lg shadow-slate-900/30`, children: [_jsx("div", { className: "flex items-center justify-between text-sm text-white/80", children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx("span", { className: "text-xl", children: stat.icon }), " ", stat.label] }) }), _jsx("p", { className: "mt-2 text-3xl font-black text-white", children: stat.value })] }, stat.label))) }), _jsx("p", { className: "text-xs text-white/60", children: "Stats updated weekly based on verified engagement inside the Pomi network." })] })] }) }), _jsx("section", { className: "px-6 py-20", id: "experiences", children: _jsxs("div", { className: "mx-auto max-w-7xl space-y-12", children: [_jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.2fr,1fr] lg:items-end", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-rose-200", children: "Community pillars" }), _jsx("h2", { className: "mt-3 text-3xl font-black text-white md:text-4xl", children: "Explore every layer of community life inside Pomi." }), _jsx("p", { className: "mt-4 max-w-2xl text-base text-slate-200", children: "Tap into curated experiences\u2014from job leads and classifieds to cultural celebrations, community gatherings, and secure moderation tools. Each pillar unlocks a different dimension of our collective story." })] }), _jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-lg shadow-slate-900/40 backdrop-blur-lg", children: [_jsx("p", { className: "font-semibold text-white", children: "Pro tip" }), _jsx("p", { className: "mt-2", children: "Moderators see additional tools after they sign in with the team\u2019s admin credentials. Reach out to community leadership if you need elevated access." })] })] }), _jsx(FeatureCarousel, { features: features, onFeatureClick: (feature) => handleExploreFeature(feature.id), autoplay: true, autoplaySpeed: 6000 })] }) }), _jsx("section", { className: "px-6 pb-16", children: _jsxs("div", { className: "mx-auto max-w-6xl grid gap-10 rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-[0_40px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr,1.2fr]", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-rose-200", children: "Community pillars" }), _jsx("h2", { className: "text-3xl font-black text-white md:text-4xl", children: "Ground every feature in culture, trust, and collaboration." }), _jsx("p", { className: "text-sm text-white/70 md:text-base", children: "We review these pillars every sprint so product decisions stay transparent and anchored in what matters most to the community." })] }), _jsxs("div", { className: "space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-white/80 shadow-inner shadow-slate-900/30", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "How we measure success" }), _jsx("p", { children: "Every release is reviewed against these pillars\u2014design warmth, trust guardrails, and end-to-end connected experiences. When something new ships, it should light up at least one pillar and never compromise the others." })] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: COMMUNITY_HIGHLIGHTS.map((item) => (_jsxs("div", { className: "flex h-full flex-col gap-3 rounded-3xl border border-white/10 bg-white/8 p-6 text-white/80 shadow-lg shadow-slate-900/30 transition hover:-translate-y-1 hover:bg-white/12 hover:text-white", children: [_jsx("span", { className: "text-3xl", children: item.icon }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: item.title }), _jsx("p", { className: "text-sm leading-relaxed text-white/70", children: item.blurb })] })] }, item.title))) })] }) }), _jsx("section", { className: "px-6 pb-16", id: "testimonials", children: _jsxs("div", { className: "mx-auto max-w-6xl space-y-10", children: [_jsxs("div", { className: "space-y-3 text-center", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200", children: "Voices from the community" }), _jsx("h2", { className: "text-3xl font-black text-white md:text-4xl", children: "\u201CPomi feels like walking into a community centre\u2014online.\u201D" }), _jsx("p", { className: "mx-auto max-w-2xl text-base text-slate-200", children: "Members use Pomi to buy and sell essentials, secure new roles, launch cultural events, and mentor the next generation." })] }), _jsx("div", { className: "grid gap-6 md:grid-cols-3", children: TESTIMONIALS.map((testimonial) => (_jsxs("figure", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 shadow-lg shadow-slate-900/40 backdrop-blur-lg", children: [_jsx("blockquote", { className: "text-sm italic leading-relaxed text-white/80", children: testimonial.quote }), _jsxs("figcaption", { className: "mt-4 text-xs uppercase tracking-[0.3em] text-rose-200", children: [testimonial.name, _jsx("span", { className: "block text-[10px] tracking-[0.2em] text-white/60", children: testimonial.role })] })] }, testimonial.name))) })] }) }), _jsx("section", { className: "px-6 pb-24", id: "join", children: _jsx("div", { className: "mx-auto max-w-6xl rounded-[40px] border border-white/10 bg-gradient-to-r from-orange-400 via-red-500 to-rose-500 p-10 shadow-[0_30px_60px_rgba(255,87,51,0.4)]", children: _jsxs("div", { className: "grid gap-10 lg:grid-cols-[1.4fr,1fr] lg:items-center", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("span", { className: "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80", children: "\uD83C\uDF81 Membership is free" }), _jsx("h2", { className: "text-3xl font-black text-white md:text-4xl", children: "Ready to unlock opportunity, culture, and community in one home?" }), _jsx("p", { className: "max-w-2xl text-base text-white/90", children: "Join thousands of neighbours who already share resources, co-create events, and keep Ottawa\u2019s Habesha community thriving. It takes less than two minutes to create your profile." })] }), _jsxs("div", { className: "flex flex-col gap-3 rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-white/80 shadow-lg shadow-rose-500/40 backdrop-blur-lg", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-white/70", children: [_jsx("span", { children: "Secure sign-up" }), _jsx("span", { children: "Moderated platform" }), _jsx("span", { children: "Multilingual" })] }), !isLoggedIn ? (_jsx("button", { onClick: () => {
                                                    setAuthMode('register');
                                                    setShowAuthModal(true);
                                                }, className: "rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg shadow-white/40 transition hover:-translate-y-0.5 hover:bg-rose-50", children: "Create your Pomi account" })) : (_jsx("button", { onClick: () => handleExploreFeature('community'), className: "rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-lg shadow-white/40 transition hover:-translate-y-0.5 hover:bg-rose-50", children: "Dive back into Pomi" }))] })] }) }) })] }), _jsxs("footer", { className: "border-t border-white/10 bg-slate-950/70 py-12 backdrop-blur-xl", children: [_jsxs("div", { className: "mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-2xl font-black text-white shadow-lg shadow-red-500/40", children: "P" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-white/60", children: "Pomi Community Hub" }), _jsx("p", { className: "text-lg font-black text-white", children: "Ottawa" })] })] }), _jsx("p", { className: "text-sm text-white/60", children: "Designed by and for the Habesha community. Proudly rooted in culture, powered by modern technology." })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-white/60", children: "Platform" }), _jsxs("ul", { className: "mt-4 space-y-2 text-sm text-white/70", children: [_jsx("li", { children: _jsx("button", { onClick: () => handleExploreFeature('events'), className: "hover:text-white", children: "Events" }) }), _jsx("li", { children: _jsx("button", { onClick: () => handleExploreFeature('marketplace'), className: "hover:text-white", children: "Marketplace" }) }), _jsx("li", { children: _jsx("button", { onClick: () => handleExploreFeature('business'), className: "hover:text-white", children: "Business directory" }) }), _jsx("li", { children: _jsx("button", { onClick: () => handleExploreFeature('forums'), className: "hover:text-white", children: "Forums" }) }), _jsx("li", { children: _jsx("button", { onClick: () => handleExploreFeature('community'), className: "hover:text-white", children: "Religious community circle" }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-white/60", children: "Resources" }), _jsxs("ul", { className: "mt-4 space-y-2 text-sm text-white/70", children: [_jsx("li", { children: "Support centre" }), _jsx("li", { children: "Guides for newcomers" }), _jsx("li", { children: "Community standards" }), _jsx("li", { children: "Privacy & safety" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-white/60", children: "Get in touch" }), _jsxs("ul", { className: "mt-4 space-y-2 text-sm text-white/70", children: [_jsx("li", { children: "Email: support@pomi.community" }), _jsx("li", { children: "Instagram: @pomi.community" }), _jsx("li", { children: "Facebook: Pomi Ottawa Network" }), _jsx("li", { children: "LinkedIn: Pomi Community Hub" })] })] })] }), _jsxs("div", { className: "mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/60", children: ["\u00A9 ", new Date().getFullYear(), " Pomi Community Hub. Built by us, for us."] })] }), activeFeature && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur", children: _jsxs("div", { className: "relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.6)]", children: [_jsx("button", { onClick: () => setActiveFeature(null), className: "absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-lg text-white/70 transition hover:bg-white/20 hover:text-white", children: "\u00D7" }), activeFeature === 'events' && (_jsx(Events, { onClose: () => setActiveFeature(null), token: token, isAdmin: Boolean(currentUser?.isAdmin), onRequestAdmin: handleOpenAdminInbox })), activeFeature === 'business' && (_jsxs("div", { className: "space-y-6 text-white/80", children: [_jsx("h2", { className: "text-3xl font-black text-white", children: "Business Directory" }), _jsx("p", { children: "Browse the standalone directory of Habesha-owned businesses that the admin team has verified. Discover what they offer, see contact details, and request introductions in seconds." }), _jsx("button", { onClick: () => {
                                        navigate('/business');
                                        setActiveFeature(null);
                                    }, className: "rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow transition hover:-translate-y-0.5", children: "Browse the directory" })] })), activeFeature === 'forums' && (_jsxs("div", { className: "space-y-6 text-white/80", children: [_jsx("h2", { className: "text-3xl font-black text-white", children: "Forums & Knowledge Threads" }), _jsx("p", { children: "Threaded discussions with upvotes, saved posts, and layered moderation make it easy to swap advice, spotlight wins, and document our stories in one place." }), _jsx("button", { onClick: () => {
                                        navigate('/forums');
                                        setActiveFeature(null);
                                    }, className: "rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow transition hover:-translate-y-0.5", children: "Start a conversation" })] })), activeFeature === 'community' && (_jsxs("div", { className: "space-y-6 text-white/80", children: [_jsx("h2", { className: "text-3xl font-black text-white", children: "Community Circles" }), _jsx("p", { children: "Interest-based groups built for professionals, students, parents, creatives, and more. Host meetups, share resources, and celebrate milestones together." })] }))] }) })), showCalendarModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur", children: _jsxs("div", { className: "relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.65)]", children: [_jsx("button", { onClick: () => setShowCalendarModal(false), className: "absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-lg text-white/70 transition hover:bg-white/20 hover:text-white", "aria-label": "Close Ethiopian calendar highlights", children: "\u00D7" }), _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-rose-200", children: "Ethiopian calendar" }), _jsx("h2", { className: "mt-2 text-3xl font-black text-white", children: "Key holidays & celebrations" }), _jsx("p", { className: "mt-2 text-sm text-white/70", children: "Ethiopia follows a 13-month calendar that runs seven to eight years behind the Gregorian calendar. Here are the moments the Pomi community spotlights throughout the year." })] }), _jsx("div", { className: "space-y-4", children: ETHIOPIAN_CALENDAR_HIGHLIGHTS.map((item) => (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80 shadow-inner shadow-black/20", children: [_jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: item.title }), _jsx("span", { className: "rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100", children: item.date })] }), _jsx("p", { className: "mt-2 text-sm text-white/70", children: item.description })] }, item.title))) }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-emerald-100", children: [_jsx("p", { className: "font-semibold text-emerald-200", children: "Did you know?" }), _jsx("p", { children: "Pagume, the 13th month, has five or six days depending on leap years. We sync community programming with both calendars so no celebration is missed." })] })] })] }) })), showAdminInbox && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur", children: _jsxs("div", { className: "relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.65)]", children: [_jsx("button", { onClick: () => setShowAdminInbox(false), className: "absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-lg text-white/70 transition hover:bg-white/20 hover:text-white", "aria-label": "Close admin messages", children: "\u00D7" }), _jsxs("div", { className: "space-y-5", children: [_jsxs("header", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-rose-200", children: "Admin messages" }), _jsx("h2", { className: "text-3xl font-black text-white", children: "Community support inbox" }), _jsx("p", { className: "text-sm text-white/70", children: "Chat with moderators, get onboarding tips, and stay up to date on policy changes. We reply within one business day." })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => setInboxFilter('updates'), className: `rounded-full px-4 py-2 text-sm font-semibold transition ${inboxFilter === 'updates'
                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                                : 'border border-white/20 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600'}`, children: "Admin updates" }), _jsx("button", { onClick: () => setInboxFilter('sent'), className: `rounded-full px-4 py-2 text-sm font-semibold transition ${inboxFilter === 'sent'
                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                                : 'border border-white/20 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600'}`, children: "My messages" })] }), _jsx("div", { className: "max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4", children: inboxMessages.length === 0 ? (_jsx("p", { className: "text-sm text-white/60", children: inboxFilter === 'updates'
                                            ? 'No announcements yet. New admin updates will arrive here.'
                                            : 'You have not sent any messages yet. Use the form below to reach the admin team.' })) : (inboxMessages.map((message) => (_jsxs("div", { className: `rounded-2xl border px-4 py-3 text-sm shadow-sm transition ${message.sender === 'admin'
                                            ? 'border-rose-200/60 bg-white text-slate-800'
                                            : 'border-white/12 bg-slate-900/40 text-slate-100'}`, children: [_jsxs("div", { className: `flex items-center justify-between text-xs ${message.sender === 'admin' ? 'text-rose-500' : 'text-slate-300'}`, children: [_jsx("span", { className: "font-semibold uppercase tracking-wide", children: message.sender === 'admin' ? 'Admin team' : currentUser?.username || 'You' }), _jsx("span", { children: new Date(message.createdAt).toLocaleString('en-CA', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }) })] }), _jsx("p", { className: `mt-2 leading-relaxed ${message.sender === 'admin' ? 'text-slate-700' : 'text-slate-100'}`, children: message.body })] }, message.id)))) }), _jsxs("form", { onSubmit: handleSendMessageToAdmin, className: "space-y-3", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/40", children: "Ask a question or share an update" }), _jsx("textarea", { value: messageDraft, onChange: (event) => setMessageDraft(event.target.value), className: "min-h-[120px] w-full rounded-2xl border border-white/15 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/30 disabled:bg-slate-200 disabled:text-slate-500", placeholder: isLoggedIn
                                                ? 'Selam! I have a question about…'
                                                : 'Log in to message the admin team.', disabled: !isLoggedIn }), _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("p", { className: "text-xs text-white/50", children: isLoggedIn
                                                        ? 'The admin team will respond via this inbox and email.'
                                                        : 'You need to log in to start a conversation with the admin team.' }), _jsx("button", { type: "submit", className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50", disabled: !isLoggedIn, children: "Send message" })] })] })] })] }) })), showAuthModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur", children: _jsxs("div", { className: "relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_30px_60px_rgba(0,0,0,0.15)]", children: [_jsx("button", { onClick: () => setShowAuthModal(false), className: "absolute right-4 top-4 rounded-full bg-gray-100 px-3 py-1 text-lg text-gray-600 transition hover:bg-gray-200 hover:text-gray-900", children: "\u00D7" }), _jsx(EnhancedAuthForm, { authMode: authMode, onSuccess: handleAuthSuccess, onClose: () => setShowAuthModal(false), onModeChange: (mode) => setAuthMode(mode) })] }) }))] }));
}
export default App;
//# sourceMappingURL=App.js.map