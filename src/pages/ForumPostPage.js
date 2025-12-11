import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Flag, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    const [postLiked, setPostLiked] = useState(false);
    const [postLikes, setPostLikes] = useState(0);
    const [replyLikes, setReplyLikes] = useState({});
    const [postFlagged, setPostFlagged] = useState(false);
    const [flaggedReplies, setFlaggedReplies] = useState([]);
    const [shareOpen, setShareOpen] = useState(false);
    const [adminNotified, setAdminNotified] = useState(false);
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
    const togglePostLike = () => {
        const newLiked = !postLiked;
        setPostLiked(newLiked);
        setPostLikes((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    };
    const toggleReplyLike = (replyId) => {
        setReplyLikes((prev) => {
            const current = prev[replyId] || { liked: false, count: 0 };
            const newLiked = !current.liked;
            return {
                ...prev,
                [replyId]: {
                    liked: newLiked,
                    count: newLiked ? current.count + 1 : Math.max(0, current.count - 1),
                },
            };
        });
    };
    const handleFlagPost = () => {
        setPostFlagged(true);
        setAdminNotified(true);
    };
    const handleFlagReply = (replyId) => {
        if (!flaggedReplies.includes(replyId)) {
            setFlaggedReplies((prev) => [...prev, replyId]);
            setAdminNotified(true);
        }
    };
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post?.title || 'Forum Thread',
                    text: post?.content?.slice(0, 100) || 'Check out this discussion',
                    url: window.location.href,
                });
            }
            catch {
                // User cancelled
            }
        }
        else {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
        setShareOpen(false);
    };
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied!');
        }
        catch {
            // Fallback
        }
        setShareOpen(false);
    };
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
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: handleBackNavigation, className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back"] }), _jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "POMI" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Forums" })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShareOpen((prev) => !prev), className: "text-slate-300 hover:text-white hover:bg-slate-800", children: _jsx(Share2, { className: "h-4 w-4" }) }), shareOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl z-50", onMouseLeave: () => setShareOpen(false), children: [_jsxs("button", { onClick: () => void copyLink(), className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800", children: [_jsx(Copy, { className: "h-4 w-4" }), " Copy link"] }), _jsxs("a", { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, target: "_blank", rel: "noopener noreferrer", className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800", onClick: () => setShareOpen(false), children: [_jsx(Share2, { className: "h-4 w-4" }), " Share to X"] }), _jsxs("a", { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, target: "_blank", rel: "noopener noreferrer", className: "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800", onClick: () => setShareOpen(false), children: [_jsx(Share2, { className: "h-4 w-4" }), " Share to Facebook"] })] }))] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleFlagPost, className: postFlagged ? 'text-emerald-400' : 'text-slate-300 hover:text-red-400 hover:bg-slate-800', children: postFlagged ? _jsx(CheckCircle2, { className: "h-4 w-4" }) : _jsx(Flag, { className: "h-4 w-4" }) })] })] }) }), _jsxs("main", { className: "mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10", children: [loadingPost ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-sm text-white/70", children: "Loading thread\u2026" })) : postError ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 p-10 text-center text-sm text-rose-100", children: postError })) : post ? (_jsxs("article", { className: "space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-white/60", children: [_jsx("span", { className: "rounded-full bg-orange-500/20 px-3 py-1 font-semibold text-orange-300", children: getCommunityLabel(post.category) }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: post.authorName || 'Community member' }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: formatRelativeTime(post.createdAt) })] }), _jsx("h1", { className: "text-3xl font-black text-white", children: post.title }), _jsx("p", { className: "text-base text-white/90 whitespace-pre-line leading-relaxed", children: post.content }), post.tags && post.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 text-xs text-white/70", children: post.tags.map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1", children: ["#", tag] }, tag))) })), _jsx("div", { className: "flex flex-wrap items-center gap-4 border-t border-white/10 pt-4", children: _jsxs("div", { className: "flex items-center gap-3 text-sm text-white/60", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), post.repliesCount ?? replies.length, " replies"] }), _jsxs("span", { className: "flex items-center gap-1", children: ["\uD83D\uDC40 ", post.viewsCount ?? 0, " views"] })] }) }), adminNotified && (_jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-200", children: [_jsx(CheckCircle2, { className: "h-3 w-3" }), " Admins have been notified to review flagged content"] })), _jsxs("div", { className: "flex flex-wrap items-center gap-3 border-t border-white/10 pt-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: togglePostLike, className: `gap-2 ${postLiked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`, children: [_jsx(Heart, { className: `h-4 w-4 ${postLiked ? 'fill-current' : ''}` }), postLikes, " Thanks"] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-400 hover:text-orange-400", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), "Reply"] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => void handleShare(), className: "gap-2 text-slate-400 hover:text-emerald-400", children: [_jsx(Share2, { className: "h-4 w-4" }), "Share"] })] })] })) : null, _jsxs("section", { className: "space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h2", { className: "text-lg font-semibold text-white", children: "Replies" }), _jsxs("span", { className: "text-xs text-white/60", children: [replies.length, " contributed"] })] }), loadingReplies ? (_jsx("p", { className: "text-sm text-white/70", children: "Loading replies\u2026" })) : replies.length === 0 ? (_jsx("p", { className: "text-sm text-white/70", children: "No replies yet. Be the first to nudge this conversation forward." })) : (_jsx("ul", { className: "space-y-4", children: replies.map((reply) => {
                                    const likeState = replyLikes[reply._id] || { liked: false, count: 0 };
                                    const isFlagged = flaggedReplies.includes(reply._id);
                                    return (_jsxs("li", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-white/50", children: [_jsx("span", { className: "font-semibold text-white", children: reply.authorName || 'Community member' }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: formatRelativeTime(reply.createdAt) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleFlagReply(reply._id), className: `h-6 w-6 p-0 ${isFlagged ? 'text-emerald-400' : 'text-slate-500 hover:text-red-400'}`, children: isFlagged ? _jsx(CheckCircle2, { className: "h-3 w-3" }) : _jsx(Flag, { className: "h-3 w-3" }) })] })] }), _jsx("p", { className: "mt-2 whitespace-pre-line leading-relaxed", children: reply.content }), _jsx("div", { className: "mt-3 pt-2 border-t border-white/5", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => toggleReplyLike(reply._id), className: `gap-1 text-xs ${likeState.liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`, children: [_jsx(Heart, { className: `h-3 w-3 ${likeState.liked ? 'fill-current' : ''}` }), likeState.count, " Thanks"] }) })] }, reply._id));
                                }) })), _jsxs("form", { onSubmit: handleAddReply, className: "space-y-3", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Add your voice" }), _jsx("textarea", { value: replyContent, onChange: (event) => setReplyContent(event.target.value), rows: 4, className: "w-full rounded-2xl border border-white/15 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40", placeholder: isAuthenticated
                                            ? 'Share an insight, a resource, or encouragement…'
                                            : 'Sign in to reply.', disabled: !isAuthenticated }), replyError && (_jsx("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700", children: replyError })), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: !isAuthenticated || submittingReply, className: "rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", children: submittingReply ? 'Posting…' : 'Post reply' }) }), !isAuthenticated && (_jsx("p", { className: "text-xs text-white/60", children: "You need to sign in to join the discussion." }))] })] }), _jsxs("div", { className: "text-center text-sm text-white/70", children: ["Looking for more?", ' ', _jsx(Link, { to: "/forums", className: "font-semibold text-white underline decoration-rose-300/60", children: "Return to the forum feed" })] })] })] }));
}
//# sourceMappingURL=ForumPostPage.js.map