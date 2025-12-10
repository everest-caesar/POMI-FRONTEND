import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import authService from '../services/authService';
const COMMUNITY_CONFIG = [
    {
        id: 'general',
        label: 'Community Pulse',
        description: 'Neighbourly updates, wins, and everyday check-ins.',
        badge: '🌍',
    },
    {
        id: 'culture',
        label: 'Culture & Celebrations',
        description: 'Food, art, language, and holiday planning.',
        badge: '🎨',
    },
    {
        id: 'business',
        label: 'Marketplace & Business',
        description: 'Buying, selling, services, and entrepreneurship.',
        badge: '🛍️',
    },
    {
        id: 'education',
        label: 'Newcomers & Education',
        description: 'Schooling, admissions, tutoring, and mentorship.',
        badge: '📚',
    },
    {
        id: 'technology',
        label: 'Tech & Careers',
        description: 'Job leads, interview prep, and technical help.',
        badge: '💼',
    },
    {
        id: 'events',
        label: 'Events & Meetups',
        description: 'Coordinate hangouts, volunteer drives, and tours.',
        badge: '🎉',
    },
    {
        id: 'health',
        label: 'Health & Wellness',
        description: 'Mental health, family care, and support circles.',
        badge: '🩺',
    },
    {
        id: 'other',
        label: 'Open Topics',
        description: 'Anything that doesn’t fit neatly elsewhere.',
        badge: '✨',
    },
];
const DEFAULT_POST_FORM = {
    title: '',
    content: '',
    category: 'general',
    tagsText: '',
};
const formatRelativeTime = (value) => {
    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60)
        return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7)
        return `${days}d ago`;
    return date.toLocaleDateString('en-CA', {
        month: 'short',
        day: 'numeric',
    });
};
export default function ForumPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCommunity, setActiveCommunity] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSort, setSelectedSort] = useState('top');
    const [showComposer, setShowComposer] = useState(false);
    const [composerForm, setComposerForm] = useState(DEFAULT_POST_FORM);
    const [composerError, setComposerError] = useState(null);
    const [composerSuccess, setComposerSuccess] = useState(null);
    const [composerLoading, setComposerLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filtersHydrated, setFiltersHydrated] = useState(false);
    const lastSyncedQueryRef = useRef(location.search);
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = Boolean(authService.getUserData()?.isAdmin);
    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
        }
    }, [isAdmin, navigate]);
    useEffect(() => {
        if (filtersHydrated && location.search === lastSyncedQueryRef.current) {
            return;
        }
        const params = new URLSearchParams(location.search);
        const communityParam = params.get('community');
        const searchParam = params.get('search');
        const sortParam = params.get('sort');
        if (communityParam && COMMUNITY_CONFIG.some((community) => community.id === communityParam)) {
            setActiveCommunity(communityParam);
        }
        else {
            setActiveCommunity('all');
        }
        if (searchParam !== null) {
            setSearchInput(searchParam);
            setSearchTerm(searchParam);
        }
        else {
            setSearchInput('');
            setSearchTerm('');
        }
        if (sortParam === 'new') {
            setSelectedSort('new');
        }
        else {
            setSelectedSort('top');
        }
        lastSyncedQueryRef.current = location.search;
        setFiltersHydrated(true);
    }, [filtersHydrated, location.search]);
    useEffect(() => {
        if (!filtersHydrated) {
            return;
        }
        const params = new URLSearchParams();
        if (activeCommunity !== 'all') {
            params.set('community', activeCommunity);
        }
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        }
        if (selectedSort === 'new') {
            params.set('sort', 'new');
        }
        const queryString = params.toString();
        const normalized = queryString ? `?${queryString}` : '';
        if (normalized === lastSyncedQueryRef.current) {
            return;
        }
        lastSyncedQueryRef.current = normalized;
        navigate({ pathname: location.pathname, search: normalized }, { replace: true });
    }, [activeCommunity, searchTerm, selectedSort, filtersHydrated, navigate, location.pathname]);
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/forums/posts', {
                params: {
                    category: activeCommunity !== 'all' ? activeCommunity : undefined,
                    search: searchTerm || undefined,
                    limit: 60,
                },
            });
            const apiPosts = Array.isArray(response.data?.data)
                ? response.data.data
                : Array.isArray(response.data)
                    ? response.data
                    : response.data?.posts || [];
            setPosts(apiPosts);
        }
        catch (err) {
            setError(err.message || 'Unable to load threads right now.');
            setPosts([]);
        }
        finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeCommunity, searchTerm]);
    useEffect(() => {
        if (!filtersHydrated) {
            return;
        }
        void fetchPosts();
    }, [fetchPosts, filtersHydrated]);
    const visiblePosts = useMemo(() => {
        const subset = activeCommunity === 'all'
            ? posts
            : posts.filter((post) => post.category === activeCommunity);
        const filteredSubset = searchTerm
            ? subset.filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase()))
            : subset;
        const sorted = [...filteredSubset];
        if (selectedSort === 'top') {
            sorted.sort((a, b) => {
                const aScore = (a.repliesCount || 0) * 2 + (a.viewsCount || 0);
                const bScore = (b.repliesCount || 0) * 2 + (b.viewsCount || 0);
                if (bScore === aScore) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return bScore - aScore;
            });
        }
        else {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return sorted;
    }, [posts, activeCommunity, searchTerm, selectedSort]);
    const calculateThreadScore = (post) => {
        const replies = post.repliesCount || 0;
        const views = post.viewsCount || 0;
        const votes = post.upvotes ?? post.votes ?? 0;
        return replies * 3 + votes * 5 + views;
    };
    const trendingCommunities = useMemo(() => {
        const counts = posts.reduce((map, post) => map.set(post.category, (map.get(post.category) || 0) + 1), new Map());
        return COMMUNITY_CONFIG.map((community) => ({
            ...community,
            total: counts.get(community.id) || 0,
        }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 4);
    }, [posts]);
    const trendingThreads = useMemo(() => {
        if (activeCommunity === 'all')
            return [];
        const communityPosts = posts.filter((post) => post.category === activeCommunity);
        const sorted = [...communityPosts].sort((a, b) => calculateThreadScore(b) - calculateThreadScore(a));
        return sorted.slice(0, 5);
    }, [posts, activeCommunity]);
    const activeFilterBadges = useMemo(() => {
        const badges = [];
        if (activeCommunity !== 'all') {
            const label = COMMUNITY_CONFIG.find((community) => community.id === activeCommunity)?.label ??
                'Community filter';
            badges.push(label);
        }
        const trimmedSearch = searchTerm.trim();
        if (trimmedSearch) {
            badges.push(`Search: ${trimmedSearch}`);
        }
        if (selectedSort === 'new') {
            badges.push('Newest first');
        }
        return badges;
    }, [activeCommunity, searchTerm, selectedSort]);
    const activeCommunityMeta = useMemo(() => {
        if (activeCommunity === 'all') {
            return {
                label: 'All communities',
                description: 'See every conversation in one stream.',
            };
        }
        const match = COMMUNITY_CONFIG.find((community) => community.id === activeCommunity);
        return {
            label: match?.label ?? 'Community threads',
            description: match?.description ?? '',
        };
    }, [activeCommunity]);
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setSearchTerm(searchInput.trim());
    };
    const handleResetFilters = () => {
        setActiveCommunity('all');
        setSearchInput('');
        setSearchTerm('');
        setSelectedSort('top');
        setRefreshing(true);
        void fetchPosts();
    };
    const handleCreatePost = async (event) => {
        event.preventDefault();
        if (!isAuthenticated) {
            setComposerError('Please log in to share a thread with the community.');
            return;
        }
        if (!composerForm.title.trim() || !composerForm.content.trim()) {
            setComposerError('Title and message are required.');
            return;
        }
        setComposerLoading(true);
        setComposerError(null);
        setComposerSuccess(null);
        try {
            const tags = composerForm.tagsText
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);
            await axiosInstance.post('/forums/posts', {
                title: composerForm.title.trim(),
                content: composerForm.content.trim(),
                category: composerForm.category,
                tags,
            });
            setComposerSuccess('Thread published! Thanks for sharing with neighbours.');
            setComposerForm(DEFAULT_POST_FORM);
            setShowComposer(false);
            setRefreshing(true);
            await fetchPosts();
        }
        catch (err) {
            setComposerError(err.message || 'Failed to publish thread.');
        }
        finally {
            setComposerLoading(false);
        }
    };
    const handleRefresh = () => {
        setRefreshing(true);
        void fetchPosts();
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "border-b border-white/10 bg-slate-950/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6", children: [_jsx(Link, { to: "/", className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white", children: "\u2190 Home" }), _jsxs("div", { className: "flex flex-col items-end gap-2 text-right", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/60", children: "Pomi Forums" }), _jsx("h1", { className: "text-xl font-black text-white md:text-2xl", children: "Crowd wisdom for every stage of the newcomer journey" })] })] }) }), _jsxs("main", { className: "mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[2fr,1fr]", children: [_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4 rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.45)] backdrop-blur", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("span", { className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200", children: "Powered by the community" }), _jsx("h2", { className: "text-3xl font-black text-white md:text-4xl", children: "Ask questions, swap tips, and celebrate wins together." }), _jsx("p", { className: "text-sm text-slate-200 md:text-base", children: "Pick a community, share an update, and help the next neighbour in line. Inspired by Reddit\u2019s best practices\u2014but rooted in Ottawa\u2019s Habesha community." })] }), _jsxs("div", { className: "flex flex-col gap-3 text-right text-sm text-white/70", children: [_jsxs("p", { children: [posts.length, ' ', posts.length === 1 ? 'active thread' : 'active threads'] }), _jsx("button", { onClick: () => setShowComposer(true), className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5", children: "\u270D\uFE0F Start a thread" })] })] }), _jsxs("form", { onSubmit: handleSearchSubmit, className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "relative flex-1 min-w-[220px]", children: [_jsx("input", { value: searchInput, onChange: (event) => setSearchInput(event.target.value), placeholder: "Search threads (housing, job tips, events...)", className: "w-full rounded-2xl border border-white/15 bg-white/90 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40" }), _jsx("span", { className: "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400", children: "\uD83D\uDD0D" })] }), _jsx("button", { type: "submit", className: "rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white", children: "Search" }), _jsx("button", { type: "button", onClick: handleResetFilters, className: "rounded-2xl border border-transparent px-4 py-2 text-sm font-semibold text-white/70 transition hover:text-white", children: "Reset" }), _jsx("button", { type: "button", onClick: handleRefresh, className: "rounded-2xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white", children: refreshing ? 'Refreshing…' : 'Refresh' })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("button", { onClick: () => setActiveCommunity('all'), className: `rounded-full px-4 py-2 text-sm font-semibold transition ${activeCommunity === 'all'
                                                    ? 'bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/40'
                                                    : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'}`, children: "All communities" }), COMMUNITY_CONFIG.map((community) => (_jsxs("button", { onClick: () => setActiveCommunity(community.id), className: `rounded-full px-4 py-2 text-sm font-semibold transition ${activeCommunity === community.id
                                                    ? 'bg-white text-slate-900 shadow-lg shadow-white/30'
                                                    : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'}`, children: [community.badge, " ", community.label] }, community.id)))] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-white/60", children: [_jsx("span", { children: "Sort by:" }), _jsx("button", { onClick: () => setSelectedSort('top'), className: `rounded-full px-3 py-1 font-semibold ${selectedSort === 'top'
                                                    ? 'bg-white/20 text-white'
                                                    : 'border border-white/15 text-white/70 hover:border-white/30 hover:text-white'}`, children: "Trending" }), _jsx("button", { onClick: () => setSelectedSort('new'), className: `rounded-full px-3 py-1 font-semibold ${selectedSort === 'new'
                                                    ? 'bg-white/20 text-white'
                                                    : 'border border-white/15 text-white/70 hover:border-white/30 hover:text-white'}`, children: "Newest" })] }), activeFilterBadges.length > 0 && (_jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-white/70", children: [_jsx("span", { children: "Active filters:" }), activeFilterBadges.map((badge) => (_jsx("span", { className: "rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white", children: badge }, badge))), _jsx("button", { type: "button", onClick: handleResetFilters, className: "rounded-full border border-transparent px-3 py-1 font-semibold text-white/70 transition hover:text-white", children: "Clear all" })] })), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 shadow-inner shadow-slate-900/40", children: [_jsx("span", { className: "font-semibold text-white", children: activeCommunityMeta.label }), activeCommunityMeta.description && (_jsx("span", { className: "ml-2 text-white/60", children: activeCommunityMeta.description }))] })] }), !loading && !error && (_jsxs("p", { className: "text-xs text-white/60", children: ["Showing ", visiblePosts.length, ' ', visiblePosts.length === 1 ? 'thread' : 'threads'] })), loading ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-sm text-white/70", children: "Loading the latest conversations\u2026" })) : error ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 p-8 text-center text-sm text-rose-100", children: error })) : visiblePosts.length === 0 ? (_jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: [_jsx("p", { className: "text-lg font-semibold text-white", children: "No threads match these filters yet." }), _jsx("p", { className: "mt-2 text-sm", children: "Try another community or be the first to start the conversation." }), _jsx("button", { onClick: () => setShowComposer(true), className: "mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5", children: "\u270D\uFE0F Share a thread" })] })) : (_jsx("div", { className: "space-y-4", children: visiblePosts.map((post) => (_jsxs("article", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1", children: [_jsxs("header", { className: "flex flex-wrap items-center gap-3 text-xs text-white/60", children: [_jsx("span", { className: "font-semibold text-white", children: COMMUNITY_CONFIG.find((community) => community.id === post.category)?.label ?? 'Community' }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: post.authorName || 'Community member' }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: formatRelativeTime(post.createdAt) })] }), _jsxs(Link, { to: `/forums/${post._id}`, className: "mt-3 block space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: post.title }), _jsx("p", { className: "text-sm text-white/80 line-clamp-3", children: post.content })] }), _jsxs("footer", { className: "mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/60", children: [_jsxs("span", { children: ["\uD83D\uDCAC ", post.repliesCount ?? 0, " replies"] }), _jsxs("span", { children: ["\uD83D\uDC40 ", post.viewsCount ?? 0, " views"] }), post.tags && post.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: post.tags.slice(0, 3).map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1", children: ["#", tag] }, tag))) })), _jsx(Link, { to: `/forums/${post._id}`, className: "ml-auto inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-white/80 transition hover:border-white/40 hover:text-white", children: "View thread \u2192" })] })] }, post._id))) }))] }), _jsxs("aside", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsx("h3", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: activeCommunity === 'all' ? 'Trending communities' : 'Trending threads' }), _jsx("ul", { className: "space-y-3", children: activeCommunity === 'all' ? (trendingCommunities.map((community, index) => (_jsx("li", { className: "w-full", children: _jsxs("button", { type: "button", onClick: () => setActiveCommunity(community.id), className: `flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition ${activeCommunity === community.id
                                                    ? 'border-white/20 bg-white/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-lg font-bold text-white/50", children: index + 1 }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-white", children: [community.badge, " ", community.label] }), _jsx("p", { className: "text-xs text-white/60", children: community.description })] })] }), _jsxs("span", { className: "rounded-full border border-white/10 px-3 py-1 text-xs text-white/60", children: [community.total, " threads"] })] }) }, community.id)))) : (trendingThreads.length > 0 ? (trendingThreads.map((thread, index) => (_jsx("li", { className: "cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition", onClick: () => navigate(`/forums/${thread._id}`), children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-sm font-bold text-white/50", children: index + 1 }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-white text-sm line-clamp-2", children: thread.title }), _jsxs("p", { className: "mt-1 text-xs text-white/60 line-clamp-2", children: [thread.content.slice(0, 140), thread.content.length > 140 ? '…' : ''] }), _jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-white/60", children: [_jsxs("span", { children: ["\u2B06\uFE0F ", thread.upvotes ?? thread.votes ?? 0] }), _jsxs("span", { children: ["\uD83D\uDCAC ", thread.repliesCount || 0] }), _jsxs("span", { children: ["\uD83D\uDC40 ", thread.viewsCount || 0] })] })] })] }) }, thread._id)))) : (_jsx("li", { className: "text-white/50 text-sm py-4 text-center", children: "No threads yet in this community" }))) })] }), _jsxs("div", { className: "space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsx("h3", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Quick guidelines" }), _jsxs("ul", { className: "space-y-2", children: [_jsx("li", { children: "Be kind and assume good intent." }), _jsx("li", { children: "No spam or cold DMs\u2014protect the community." }), _jsx("li", { children: "Tag posts so the right neighbours can help." }), _jsx("li", { children: "Report anything suspicious so admins can review." })] })] })] })] }), showComposer && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur", children: _jsxs("div", { className: "relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl", children: [_jsx("button", { onClick: () => setShowComposer(false), className: "absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-2xl font-bold shadow-lg shadow-rose-200 ring-2 ring-rose-200 transition hover:-translate-y-0.5", "aria-label": "Close composer", children: "\u00D7" }), _jsx("h3", { className: "text-2xl font-black text-slate-900", children: "Start a new thread" }), _jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Share advice, a question, or a celebration. Clear titles help others find it later." }), composerError && (_jsx("div", { className: "mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700", children: composerError })), composerSuccess && (_jsx("div", { className: "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700", children: composerSuccess })), _jsxs("form", { onSubmit: handleCreatePost, className: "mt-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Title" }), _jsx("input", { value: composerForm.title, onChange: (event) => setComposerForm((prev) => ({ ...prev, title: event.target.value })), className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", placeholder: "Share the key takeaway in one line", required: true })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Community" }), _jsx("select", { value: composerForm.category, onChange: (event) => setComposerForm((prev) => ({ ...prev, category: event.target.value })), className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", children: COMMUNITY_CONFIG.map((community) => (_jsx("option", { value: community.id, children: community.label }, community.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Tags (optional)" }), _jsx("input", { value: composerForm.tagsText, onChange: (event) => setComposerForm((prev) => ({ ...prev, tagsText: event.target.value })), className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", placeholder: "housing, job, meetup" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: "Message" }), _jsx("textarea", { value: composerForm.content, onChange: (event) => setComposerForm((prev) => ({ ...prev, content: event.target.value })), rows: 6, className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100", placeholder: "Include context, what you need, or advice to share.", required: true })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-end gap-3", children: [_jsx("button", { type: "button", onClick: () => setShowComposer(false), className: "rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800", children: "Cancel" }), _jsx("button", { type: "submit", disabled: composerLoading, className: "rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", children: composerLoading ? 'Publishing…' : 'Publish thread' })] }), !isAuthenticated && (_jsx("p", { className: "text-xs text-rose-500", children: "You need an account to post. Sign in or register to join the conversation." }))] })] }) }))] }));
}
//# sourceMappingURL=ForumPage.js.map