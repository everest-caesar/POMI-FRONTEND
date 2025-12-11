"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Share2, MapPin, MessageCircle, ShieldCheck, Clock, Eye } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import authService from "@/services/authService";
export default function ListingDetailPage() {
    const params = useParams();
    const navigate = useNavigate();
    const token = authService.getToken();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [confirmTransaction, setConfirmTransaction] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);
    useEffect(() => {
        const loadListing = async () => {
            if (!params?.id)
                return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/marketplace/listings/${params.id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                if (!response.ok) {
                    throw new Error("Failed to load listing");
                }
                const data = await response.json();
                setListing(data.data);
                // Check if user has liked this listing
                const savedLikes = localStorage.getItem("marketplace_favorites");
                if (savedLikes) {
                    const likes = JSON.parse(savedLikes);
                    setIsLiked(likes.includes(params.id));
                }
            }
            catch (err) {
                console.error(err);
                setError("We could not load this listing right now.");
            }
            finally {
                setLoading(false);
            }
        };
        loadListing();
    }, [params?.id, token]);
    const handleLike = async () => {
        if (!listing || !token) {
            setError("Please sign in to save listings");
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/marketplace/listings/${listing._id}/favorite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to update favorites");
            }
            const data = await response.json();
            setIsLiked(data.favorited);
            // Update local storage
            const savedLikes = localStorage.getItem("marketplace_favorites");
            const likes = savedLikes ? JSON.parse(savedLikes) : [];
            if (data.favorited) {
                likes.push(listing._id);
            }
            else {
                const idx = likes.indexOf(listing._id);
                if (idx > -1)
                    likes.splice(idx, 1);
            }
            localStorage.setItem("marketplace_favorites", JSON.stringify(likes));
        }
        catch (err) {
            setError(err.message || "Unable to update favorites");
        }
    };
    const handleSubmitReview = async () => {
        if (!listing || !reviewForm.comment.trim() || !token)
            return;
        if (!confirmTransaction) {
            setError("Please confirm the transaction before submitting a review");
            return;
        }
        setSubmittingReview(true);
        try {
            // Note: Review endpoint would need to be implemented in backend
            // For now, just show success message
            setReviewForm({ rating: 5, comment: "" });
            setConfirmTransaction(false);
            // In a real implementation, you would POST to a reviews endpoint
        }
        catch (err) {
            setError(err.message || "Failed to submit review");
        }
        finally {
            setSubmittingReview(false);
        }
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
        }).format(price);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsx("p", { className: "text-slate-400 animate-pulse", children: "Loading listing..." }) }));
    }
    if (error || !listing) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center space-y-3", children: [_jsx("p", { className: "text-lg font-semibold text-white", children: "Listing unavailable" }), _jsx("p", { className: "text-slate-400 text-sm", children: error || "This listing was removed or never existed." }), _jsx(Link, { to: "/marketplace", children: _jsx(Button, { className: "bg-orange-500 hover:bg-orange-600 text-white", children: "Back to marketplace" }) })] }) }));
    }
    const gallery = listing.images?.length > 0 ? listing.images : ["/placeholder.svg"];
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Link, { to: "/marketplace", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Marketplace"] }) }), _jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "POMI" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Marketplace" })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: handleLike, className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(Heart, { className: `h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}` }), "Save"] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(Share2, { className: "h-4 w-4" }), "Share"] })] })] }) }), _jsx("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("div", { className: "rounded-xl overflow-hidden mb-4 border border-slate-800", children: _jsx("img", { src: gallery[activeImage] || "/placeholder.svg", alt: listing.title, className: "w-full h-96 object-cover" }) }), gallery.length > 1 && (_jsx("div", { className: "flex gap-3", children: gallery.map((img, index) => (_jsx("button", { onClick: () => setActiveImage(index), className: `rounded-lg overflow-hidden border-2 transition-all ${activeImage === index ? "border-orange-500 scale-105" : "border-transparent"}`, children: _jsx("img", { src: img || "/placeholder.svg", alt: "", className: "w-20 h-20 object-cover" }) }, index))) }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [_jsxs("div", { children: [listing.status === "pending" && (_jsx("span", { className: "inline-block px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded mb-3", children: "Pending admin review" })), _jsx("h1", { className: "text-3xl font-bold text-white", children: listing.title })] }), _jsx("p", { className: "text-3xl font-bold text-orange-400", children: formatPrice(listing.price) })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "h-4 w-4" }), " ", listing.location || "Ottawa"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-4 w-4" }), " ", formatDate(listing.createdAt)] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Eye, { className: "h-4 w-4" }), " ", listing.views, " views"] })] }), _jsxs("div", { className: "border-t border-slate-800 pt-6 mb-6", children: [_jsx("h2", { className: "text-lg font-semibold text-white mb-3", children: "Description" }), _jsx("p", { className: "text-slate-400 leading-relaxed", children: listing.description || "No description provided." })] }), _jsxs("div", { className: "rounded-xl border border-slate-800 bg-slate-900/50 p-6 mb-6", children: [_jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center", children: _jsx("span", { className: "text-lg font-semibold", children: listing.sellerName?.charAt(0) || "S" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-semibold text-white", children: listing.sellerName || "Seller" }), _jsx(ShieldCheck, { className: "h-4 w-4 text-emerald-400" })] }), _jsx("p", { className: "text-sm text-slate-400", children: "Verified community member" })] })] }), _jsx("div", { className: "flex gap-6 text-sm", children: _jsx("span", { className: "text-slate-400", children: "Secure payments coming soon" }) })] }), _jsxs("div", { className: "flex gap-4 mb-6", children: [_jsx(Link, { to: `/messages?user=${encodeURIComponent(listing.sellerName || "Seller")}&message=${encodeURIComponent(`Hi ${listing.sellerName || "there"}, I'm interested in your ${listing.title}. Is it still available?`)}`, className: "flex-1", children: _jsxs(Button, { size: "lg", className: "w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), "Contact Seller"] }) }), _jsx(Button, { size: "lg", variant: "outline", onClick: handleLike, className: "border-slate-700 text-slate-300 hover:bg-slate-800", children: _jsx(Heart, { className: `h-5 w-5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}` }) })] }), _jsxs("div", { className: "border-t border-slate-800 pt-6", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: "Reviews" }), _jsx("p", { className: "text-sm text-slate-400", children: "Only confirmed transactions can add a review." })] }) }), _jsx("p", { className: "text-sm text-slate-400 mb-4", children: "No reviews yet. Be the first after confirming a transaction." }), token ? (_jsxs("div", { className: "rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm text-white cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: confirmTransaction, onChange: (e) => setConfirmTransaction(e.target.checked), className: "h-4 w-4 rounded border-slate-700 bg-slate-800 text-orange-500 focus:ring-orange-500" }), "I confirm a completed transaction for this listing"] }), _jsx("span", { className: "text-xs text-slate-500", children: "Required to rate" })] }), !confirmTransaction && (_jsx("p", { className: "text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2", children: "Please confirm the transaction before submitting a rating. This keeps reviews trustworthy." })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx("select", { value: reviewForm.rating, onChange: (e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) })), className: "rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white", disabled: !confirmTransaction, children: [5, 4, 3, 2, 1].map((r) => (_jsxs("option", { value: r, children: [r, " stars"] }, r))) }), _jsx(Button, { disabled: !confirmTransaction || !reviewForm.comment.trim() || submittingReview, onClick: handleSubmitReview, className: "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50", children: submittingReview ? "Submitting..." : "Submit review" })] }), _jsx(Textarea, { value: reviewForm.comment, onChange: (e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value })), className: "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500", placeholder: "Share details about the transaction...", rows: 3, disabled: !confirmTransaction })] })) : (_jsx("p", { className: "text-sm text-slate-400", children: "Sign in to leave a review after completing a transaction." }))] })] })] }) })] }));
}
//# sourceMappingURL=ListingDetailPage.js.map