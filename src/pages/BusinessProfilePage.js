"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Phone, ShieldCheck, Star, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { API_BASE_URL } from '@/config/api';
import authService from '@/services/authService';
export default function BusinessProfilePage() {
    const params = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const token = authService.getToken();
    useEffect(() => {
        const fetchProfile = async () => {
            if (!params?.id)
                return;
            setLoading(true);
            setError(null);
            try {
                const [businessRes, reviewsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/businesses/${params.id}`),
                    fetch(`${API_BASE_URL}/businesses/${params.id}/reviews`),
                ]);
                if (!businessRes.ok)
                    throw new Error('Business not found');
                const businessData = await businessRes.json();
                setBusiness(businessData.data || businessData.business);
                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json();
                    setReviews(reviewsData.data || []);
                }
            }
            catch (err) {
                console.error(err);
                setError('We could not load this business right now.');
            }
            finally {
                setLoading(false);
            }
        };
        void fetchProfile();
    }, [params]);
    const averageRating = useMemo(() => {
        if (!business?.rating)
            return null;
        return Number(business.rating).toFixed(1);
    }, [business]);
    const handleSubmitReview = async () => {
        if (!params?.id || !reviewForm.comment.trim()) {
            return;
        }
        if (!token) {
            setError('Sign in to leave a review.');
            return;
        }
        setSubmittingReview(true);
        try {
            const response = await fetch(`${API_BASE_URL}/businesses/${params.id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(reviewForm),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Unable to submit review');
            }
            const data = await response.json();
            setBusiness(data.business);
            setReviews((prev) => [data.review, ...prev]);
            setReviewForm({ rating: 5, comment: '' });
        }
        catch (err) {
            setError(err.message || 'Unable to submit review');
        }
        finally {
            setSubmittingReview(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsx("p", { className: "text-slate-400 animate-pulse", children: "Loading business\u2026" }) }));
    }
    if (error || !business) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center space-y-3", children: [_jsx("p", { className: "text-lg font-semibold", children: "Business unavailable" }), _jsx("p", { className: "text-slate-400 text-sm", children: error || 'This profile may have been removed.' }), _jsx(Button, { className: "bg-orange-500 hover:bg-orange-600 text-white", onClick: () => navigate('/business'), children: "Back to directory" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", onClick: () => navigate('/business'), children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Directory"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "POMI" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Business Profile" })] })] })] }), _jsx(Link, { to: `/messages?business=${encodeURIComponent(business.businessName)}`, children: _jsx(Button, { size: "sm", className: "bg-orange-500 hover:bg-orange-600 text-white", children: "Contact business" }) })] }) }), _jsxs("main", { className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8", children: [_jsxs("section", { className: "grid gap-6 lg:grid-cols-5", children: [_jsx("div", { className: "lg:col-span-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60", children: _jsx("img", { src: business.images?.[0] || '/placeholder.svg', alt: business.businessName, className: "w-full h-72 object-cover" }) }), _jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [business.verified && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded mb-2", children: [_jsx(ShieldCheck, { className: "h-3 w-3" }), " Verified"] })), _jsx("h1", { className: "text-3xl font-bold text-white", children: business.businessName }), _jsx("p", { className: "text-slate-400 text-sm", children: business.category })] }), averageRating && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "h-5 w-5 text-amber-400 fill-amber-400" }), _jsx("span", { className: "text-lg text-white", children: averageRating }), _jsxs("span", { className: "text-xs text-slate-500", children: ["(", business.reviewCount || reviews.length || 0, ")"] })] }))] }), _jsx("p", { className: "text-slate-300 leading-relaxed", children: business.description }), _jsxs("div", { className: "space-y-3 text-sm text-slate-300", children: [business.address && (_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4" }), " ", business.address] })), business.phone && (_jsxs("p", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "h-4 w-4" }), " ", business.phone] })), business.email && (_jsxs("a", { href: `mailto:${business.email}`, className: "flex items-center gap-2 text-orange-300 hover:underline", children: [_jsx(Mail, { className: "h-4 w-4" }), " ", business.email] })), business.website && (_jsxs("a", { href: business.website.startsWith('http') ? business.website : `https://${business.website}`, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-orange-300 hover:underline", children: [_jsx(Globe, { className: "h-4 w-4" }), " ", business.website] }))] })] })] }), _jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Community reviews" }), _jsx("p", { className: "text-sm text-slate-400", children: "Confirm a visit to rate and share feedback. Verified reviews boost trust." })] }), averageRating && (_jsxs("div", { className: "flex items-center gap-2 text-amber-300", children: [_jsx(Star, { className: "h-4 w-4 fill-amber-300" }), _jsx("span", { className: "text-lg font-semibold", children: averageRating }), _jsxs("span", { className: "text-xs text-slate-500", children: ["(", business.reviewCount || reviews.length || 0, ")"] })] }))] }), token ? (_jsxs("div", { className: "grid gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4", children: [_jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("label", { className: "text-sm font-semibold text-white", children: "Your rating" }), _jsx("select", { className: "rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white", value: reviewForm.rating, onChange: (e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) })), children: [5, 4, 3, 2, 1].map((value) => (_jsxs("option", { value: value, children: [value, " star", value > 1 ? 's' : ''] }, value))) })] }), _jsx(Textarea, { placeholder: "What stood out? Would you recommend them?", value: reviewForm.comment, onChange: (e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value })), className: "bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 min-h-[120px]" }), _jsx(Button, { onClick: handleSubmitReview, disabled: submittingReview, className: "bg-orange-500 hover:bg-orange-600", children: submittingReview ? 'Sending…' : 'Submit review' })] })) : (_jsx("p", { className: "text-sm text-slate-400", children: "Sign in to leave a review. Verified members help neighbours discover trusted services faster." })), _jsxs("div", { className: "space-y-3", children: [reviews.length === 0 && _jsx("p", { className: "text-sm text-slate-400", children: "No reviews yet." }), reviews.map((review) => (_jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("p", { className: "font-semibold text-white", children: review.authorName }), _jsx("span", { className: "text-slate-400", children: new Date(review.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-amber-300", children: [_jsx(Star, { className: "h-4 w-4 fill-amber-300" }), review.rating, " / 5"] }), _jsx("p", { className: "text-sm text-slate-200", children: review.comment }), review.verified && (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-200", children: [_jsx(ShieldCheck, { className: "h-3 w-3" }), " Verified visit"] }))] }, review._id)))] })] })] })] }));
}
//# sourceMappingURL=BusinessProfilePage.js.map