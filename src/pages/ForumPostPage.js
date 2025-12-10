import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import authService from '../services/authService';
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
const getCommunityLabel = (category) => {
    switch (category) {
        case 'general':
            return 'Community Pulse';
        case 'culture':
            return 'Culture & Celebrations';
        case 'business':
            return 'Marketplace & Business';
        case 'education':
            return 'Newcomers & Education';
        case 'technology':
            return 'Tech & Careers';
        case 'events':
            return 'Events & Meetups';
        case 'health':
            return 'Health & Wellness';
        case 'other':
        default:
            return 'Open Topics';
    }
};
export default function ForumPostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loadingPost, setLoadingPost] = useState(true);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [postError, setPostError] = useState(null);
    const [replyError, setReplyError] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const isAuthenticated = authService.isAuthenticated();
    const fetchPost = useCallback(async () => {
        if (!postId)
            return;
        setLoadingPost(true);
        setPostError(null);
        try {
            const response = await axiosInstance.get(`/forums/posts/${postId}`);
            const payload = response.data?.data || response.data?.post || response.data;
            setPost(payload);
        }
        catch (err) {
            setPostError(err.message || 'Unable to load this thread.');
            setPost(null);
        }
        finally {
            setLoadingPost(false);
        }
    }, [postId]);
    const fetchReplies = useCallback(async () => {
        if (!postId)
            return;
        setLoadingReplies(true);
        setReplyError(null);
        try {
            const response = await axiosInstance.get(`/forums/posts/${postId}/replies`, {
                params: { limit: 100 },
            });
            const payload = Array.isArray(response.data?.data)
                ? response.data.data
                : Array.isArray(response.data)
                    ? response.data
                    : response.data?.replies || [];
            setReplies(payload);
        }
        catch (err) {
            setReplyError(err.message || 'Unable to load replies right now.');
            setReplies([]);
        }
        finally {
            setLoadingReplies(false);
        }
    }, [postId]);
    useEffect(() => {
        void fetchPost();
        void fetchReplies();
    }, [fetchPost, fetchReplies]);
    const handleAddReply = async (event) => {
        event.preventDefault();
        if (!postId)
            return;
        if (!isAuthenticated) {
            setReplyError('Please log in to participate in the discussion.');
            return;
        }
        if (!replyContent.trim()) {
            setReplyError('Share a quick note before posting.');
            return;
        }
        setSubmittingReply(true);
        setReplyError(null);
        try {
            await axiosInstance.post(`/forums/posts/${postId}/replies`, {
                content: replyContent.trim(),
            });
            setReplyContent('');
            await fetchReplies();
        }
        catch (err) {
            setReplyError(err.message || 'Failed to send reply.');
        }
        finally {
            setSubmittingReply(false);
        }
    };
    const handleBackNavigation = () => {
        if (window.history.length > 1) {
            navigate(-1);
        }
        else {
            navigate('/forums');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "border-b border-white/10 bg-slate-950/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: handleBackNavigation, className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white", children: "\u2190 Back" }), _jsx(Link, { to: "/forums", className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white", children: "Forums home" })] }), _jsx("div", { className: "text-right text-xs font-semibold uppercase tracking-[0.3em] text-white/60", children: "Pomi Forums" })] }) }), _jsxs("main", { className: "mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10", children: [loadingPost ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-sm text-white/70", children: "Loading thread\u2026" })) : postError ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 p-10 text-center text-sm text-rose-100", children: postError })) : post ? (_jsxs("article", { className: "space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-white/60", children: [_jsx("span", { className: "font-semibold text-white", children: getCommunityLabel(post.category) }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: post.authorName || 'Community member' }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: formatRelativeTime(post.createdAt) })] }), _jsx("h1", { className: "text-3xl font-black text-white", children: post.title }), _jsx("p", { className: "text-base text-white/90 whitespace-pre-line", children: post.content }), post.tags && post.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 text-xs text-white/70", children: post.tags.map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1", children: ["#", tag] }, tag))) })), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-white/60", children: [_jsxs("span", { children: ["\uD83D\uDCAC ", post.repliesCount ?? replies.length, " replies"] }), _jsxs("span", { children: ["\uD83D\uDC40 ", post.viewsCount ?? 0, " views"] })] })] })) : null, _jsxs("section", { className: "space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Replies" }), _jsxs("span", { className: "text-xs text-white/60", children: [replies.length, " contributed"] })] }), loadingReplies ? (_jsx("p", { className: "text-sm text-white/70", children: "Loading replies\u2026" })) : replies.length === 0 ? (_jsx("p", { className: "text-sm text-white/70", children: "No replies yet. Be the first to nudge this conversation forward." })) : (_jsx("ul", { className: "space-y-4", children: replies.map((reply) => (_jsxs("li", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-white/50", children: [_jsx("span", { children: reply.authorName || 'Community member' }), _jsx("span", { children: formatRelativeTime(reply.createdAt) })] }), _jsx("p", { className: "mt-2 whitespace-pre-line", children: reply.content })] }, reply._id))) })), _jsxs("form", { onSubmit: handleAddReply, className: "space-y-3", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Add your voice" }), _jsx("textarea", { value: replyContent, onChange: (event) => setReplyContent(event.target.value), rows: 4, className: "w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40", placeholder: isAuthenticated
                                            ? 'Share an insight, a resource, or encouragement…'
                                            : 'Sign in to reply.', disabled: !isAuthenticated }), replyError && (_jsx("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700", children: replyError })), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: !isAuthenticated || submittingReply, className: "rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", children: submittingReply ? 'Posting…' : 'Post reply' }) }), !isAuthenticated && (_jsx("p", { className: "text-xs text-white/60", children: "You need to sign in to join the discussion." }))] })] }), _jsxs("div", { className: "text-center text-sm text-white/70", children: ["Looking for more?", ' ', _jsx(Link, { to: "/forums", className: "font-semibold text-white underline decoration-rose-300/60", children: "Return to the forum feed" })] })] })] }));
}
//# sourceMappingURL=ForumPostPage.js.map