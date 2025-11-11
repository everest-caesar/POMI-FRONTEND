import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import BusinessUpload from './BusinessUpload';
import EventCreationForm from './EventCreationForm';
import { API_BASE_URL } from '../config/api';
const STATUS_OPTIONS = [
    'draft',
    'active',
    'inactive',
];
const formatDate = (value) => {
    if (!value)
        return 'N/A';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime()))
        return 'N/A';
    return date.toLocaleString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
const formatCurrency = (value) => {
    if (value === null || value === undefined)
        return 'N/A';
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
    }).format(value);
};
export default function AdminPortal({ token, onLogout, onBack }) {
    const [metrics, setMetrics] = useState(null);
    const [events, setEvents] = useState([]);
    const [listings, setListings] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [updatingBusinessId, setUpdatingBusinessId] = useState(null);
    const [moderatingEventId, setModeratingEventId] = useState(null);
    const [moderatingListingId, setModeratingListingId] = useState(null);
    const [showBusinessUpload, setShowBusinessUpload] = useState(false);
    const [showEventCreation, setShowEventCreation] = useState(false);
    const fetchJson = async (path, options = {}) => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        return data;
    };
    const loadAdminData = async () => {
        setLoading(true);
        setError(null);
        setStatusMessage(null);
        try {
            const [overviewData, eventsData, businessesData, listingsData, usersData] = await Promise.all([
                fetchJson('/admin/overview'),
                fetchJson('/admin/events'),
                fetchJson('/admin/businesses'),
                fetchJson('/admin/marketplace'),
                fetchJson('/admin/users'),
            ]);
            setMetrics(overviewData.metrics);
            setEvents(eventsData.events || []);
            setBusinesses(businessesData.businesses || []);
            setListings(listingsData.listings || []);
            setMembers(usersData.users || []);
        }
        catch (err) {
            setError(err.message || 'Failed to load admin data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadAdminData();
    }, [token]);
    const handleUpdateBusiness = async (businessId, updates) => {
        setUpdatingBusinessId(businessId);
        setError(null);
        try {
            const response = await fetchJson(`/admin/businesses/${businessId}/status`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
            setBusinesses((prev) => prev.map((business) => business.id === businessId
                ? { ...business, ...response.business }
                : business));
            setStatusMessage('Business details updated successfully.');
        }
        catch (err) {
            setError(err.message || 'Failed to update business');
        }
        finally {
            setUpdatingBusinessId(null);
        }
    };
    const handleEventModeration = async (eventId, status) => {
        setModeratingEventId(eventId);
        setError(null);
        try {
            const targetEvent = events.find((event) => event.id === eventId);
            const wasPending = targetEvent?.moderationStatus === 'pending';
            let rejectionReason;
            if (status === 'rejected') {
                rejectionReason = window
                    .prompt('Share a short note for the organiser? (optional)', '')
                    ?.trim();
            }
            const response = await fetchJson(`/admin/events/${eventId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, rejectionReason }),
            });
            setEvents((prev) => prev.map((event) => event.id === eventId
                ? {
                    ...event,
                    moderationStatus: status,
                    rejectionReason: response.event.rejectionReason ?? null,
                    reviewedAt: response.event.reviewedAt ?? new Date().toISOString(),
                }
                : event));
            setStatusMessage(status === 'approved'
                ? 'Event approved successfully.'
                : 'Event rejected successfully.');
            if (wasPending) {
                setMetrics((prev) => prev
                    ? {
                        ...prev,
                        pendingEvents: Math.max(0, (prev.pendingEvents ?? 0) - 1),
                    }
                    : prev);
            }
        }
        catch (err) {
            setError(err.message || 'Failed to update event status');
        }
        finally {
            setModeratingEventId(null);
        }
    };
    const handleListingModeration = async (listingId, status) => {
        setModeratingListingId(listingId);
        setError(null);
        try {
            const targetListing = listings.find((listing) => listing.id === listingId);
            const wasPending = targetListing?.moderationStatus === 'pending';
            let rejectionReason;
            if (status === 'rejected') {
                rejectionReason = window
                    .prompt('Share a short note for the seller? (optional)', '')
                    ?.trim();
            }
            const response = await fetchJson(`/admin/marketplace/${listingId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, rejectionReason }),
            });
            setListings((prev) => prev.map((listing) => listing.id === listingId
                ? {
                    ...listing,
                    moderationStatus: status,
                    rejectionReason: response.listing.rejectionReason ?? null,
                    status: response.listing.status ?? listing.status,
                }
                : listing));
            setStatusMessage(status === 'approved'
                ? 'Listing approved successfully.'
                : 'Listing rejected successfully.');
            if (wasPending) {
                setMetrics((prev) => prev
                    ? {
                        ...prev,
                        pendingListings: Math.max(0, (prev.pendingListings ?? 0) - 1),
                    }
                    : prev);
            }
        }
        catch (err) {
            setError(err.message || 'Failed to update listing status');
        }
        finally {
            setModeratingListingId(null);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100", children: [_jsx("header", { className: "sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/70", children: "Admin Console \u2022 Internal" }), _jsx("h1", { className: "text-2xl font-black text-white md:text-3xl", children: "Pomi Community Oversight" }), _jsx("p", { className: "max-w-2xl text-sm text-white/70 md:text-base", children: "Review marketplace activity, approve businesses, and keep upcoming events running smoothly. Use the quick actions to refresh data or export reports." })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("button", { onClick: loadAdminData, className: "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white", children: "\uD83D\uDD04 Refresh data" }), onBack && (_jsx("button", { onClick: onBack, className: "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white", children: "\u2190 Back to access" })), _jsx("button", { onClick: onLogout, className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5", children: "Log out" })] })] }) }), _jsxs("main", { className: "mx-auto max-w-7xl space-y-12 px-6 py-10", children: [loading && (_jsxs("div", { className: "py-24 text-center text-white/70", children: [_jsx("div", { className: "mb-6 text-5xl animate-spin", children: "\uD83C\uDF00" }), "Loading the latest metrics\u2026"] })), !loading && error && (_jsx("div", { className: "rounded-3xl border border-red-200 bg-red-50/90 px-6 py-4 text-sm font-semibold text-red-700 shadow-lg shadow-red-500/30", children: error })), !loading && !error && (_jsxs("div", { className: "space-y-12", children: [_jsxs("section", { children: [_jsx("div", { className: "mb-6 flex flex-wrap items-center justify-between gap-4", children: _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-black text-white", children: "Executive snapshot" }), _jsx("p", { className: "text-sm text-white/60", children: "Key health metrics across the marketplace, events, and business directory." })] }) }), statusMessage && (_jsx("div", { className: "mb-4 rounded-3xl border border-emerald-300/40 bg-emerald-500/10 px-6 py-4 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-900/30 backdrop-blur", children: statusMessage })), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7", children: [_jsx(SummaryCard, { title: "Community Members", value: metrics?.totalUsers ?? 0, icon: "\uD83D\uDC65", accent: "from-red-500 to-orange-500" }), _jsx(SummaryCard, { title: "Active Events", value: metrics?.totalEvents ?? 0, icon: "\uD83C\uDF89", accent: "from-orange-500 to-amber-500" }), _jsx(SummaryCard, { title: "Business Listings", value: metrics?.totalBusinesses ?? 0, icon: "\uD83C\uDFE2", accent: "from-amber-500 to-yellow-500" }), _jsx(SummaryCard, { title: "Total RSVPs", value: metrics?.totalRegistrations ?? 0, icon: "\uD83D\uDCDD", accent: "from-emerald-500 to-teal-500" }), _jsx(SummaryCard, { title: "Pending Businesses", value: metrics?.pendingBusinesses ?? 0, icon: "\u23F3", accent: "from-blue-500 to-indigo-500" }), _jsx(SummaryCard, { title: "Pending Events", value: metrics?.pendingEvents ?? 0, icon: "\uD83D\uDD52", accent: "from-purple-500 to-violet-500" }), _jsx(SummaryCard, { title: "Pending Listings", value: metrics?.pendingListings ?? 0, icon: "\uD83D\uDED2", accent: "from-fuchsia-500 to-pink-500" })] })] }), _jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDED2" }), " Marketplace moderation"] }), _jsx("p", { className: "text-sm text-white/60", children: "Approve community submissions before they appear in the marketplace feed." })] }), _jsxs("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: [listings.length, " submissions"] })] }), listings.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: "No marketplace submissions yet. Encourage members to share their listings." })) : (_jsx("div", { className: "grid gap-4", children: listings.map((listing) => {
                                            const status = listing.moderationStatus || 'approved';
                                            const isPending = status === 'pending';
                                            const isRejected = status === 'rejected';
                                            const statusLabel = status === 'approved'
                                                ? 'Approved'
                                                : status === 'pending'
                                                    ? 'Pending review'
                                                    : 'Rejected';
                                            const statusClasses = status === 'approved'
                                                ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40'
                                                : status === 'pending'
                                                    ? 'bg-amber-500/15 text-amber-200 border border-amber-400/40'
                                                    : 'bg-rose-500/15 text-rose-200 border border-rose-400/40';
                                            return (_jsxs("article", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 text-xs text-white/70", children: [_jsx("span", { className: `inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold uppercase tracking-wide ${statusClasses}`, children: statusLabel }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [status !== 'approved' && (_jsx("button", { onClick: () => handleListingModeration(listing.id, 'approved'), disabled: moderatingListingId === listing.id, className: "inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60", children: "\u2705 Approve" })), status !== 'rejected' && (_jsx("button", { onClick: () => handleListingModeration(listing.id, 'rejected'), disabled: moderatingListingId === listing.id, className: "inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60", children: "\u2716 Reject" }))] })] }), isRejected && listing.rejectionReason && (_jsxs("p", { className: "mt-3 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100", children: ["Rejection note: ", listing.rejectionReason] })), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-[1.2fr,1fr]", children: [_jsxs("div", { className: "space-y-3 text-sm text-white/80", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-white", children: listing.title }), _jsxs("p", { className: "text-sm text-white/60", children: [listing.category.toUpperCase(), " \u2022 ", listing.location] })] }), _jsx("p", { className: "text-2xl font-black text-white", children: new Intl.NumberFormat('en-CA', {
                                                                            style: 'currency',
                                                                            currency: 'CAD',
                                                                            maximumFractionDigits: 0,
                                                                        }).format(listing.price) }), _jsxs("p", { className: "text-xs text-white/50", children: ["Submitted ", formatDate(listing.createdAt)] })] }), _jsxs("div", { className: "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70", children: [_jsx("p", { className: "font-semibold uppercase tracking-[0.3em] text-white/50", children: "Seller" }), listing.seller ? (_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-white", children: listing.seller.username || 'Member' }), _jsx("p", { children: listing.seller.email || '—' }), _jsx("p", { children: [listing.seller.area, listing.seller.workOrSchool].filter(Boolean).join(' • ') || '—' })] })) : (_jsx("p", { children: "No seller details available." }))] })] })] }, listing.id));
                                        }) }))] }), _jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCC5" }), " Event registrations"] }), _jsx("p", { className: "text-sm text-white/60", children: "Upcoming gatherings curated by the community team." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setShowEventCreation(!showEventCreation), className: "inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30", children: showEventCreation ? '✕ Cancel' : '+ Create Event' }), _jsxs("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: [events.length, " tracked"] })] })] }), showEventCreation && (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: _jsx(EventCreationForm, { onSuccess: () => {
                                                setShowEventCreation(false);
                                                loadAdminData();
                                            }, onCancel: () => setShowEventCreation(false) }) })), events.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: "No events to review yet. Encourage organisers to submit upcoming meetups." })) : (_jsx("div", { className: "grid gap-4", children: events.map((event) => {
                                            const status = event.moderationStatus || 'approved';
                                            const isPending = status === 'pending';
                                            const isRejected = status === 'rejected';
                                            const statusLabel = status === 'approved'
                                                ? 'Approved'
                                                : status === 'pending'
                                                    ? 'Pending review'
                                                    : 'Rejected';
                                            const statusClasses = status === 'approved'
                                                ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/40'
                                                : status === 'pending'
                                                    ? 'bg-amber-500/15 text-amber-200 border border-amber-400/40'
                                                    : 'bg-rose-500/15 text-rose-200 border border-rose-400/40';
                                            return (_jsxs("article", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 text-xs text-white/70", children: [_jsx("span", { className: `inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold uppercase tracking-wide ${statusClasses}`, children: statusLabel }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [status !== 'approved' && (_jsx("button", { onClick: () => handleEventModeration(event.id, 'approved'), disabled: moderatingEventId === event.id, className: "inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60", children: "\u2705 Approve" })), status !== 'rejected' && (_jsx("button", { onClick: () => handleEventModeration(event.id, 'rejected'), disabled: moderatingEventId === event.id, className: "inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60", children: "\u2716 Reject" }))] })] }), isRejected && event.rejectionReason && (_jsxs("p", { className: "mt-3 rounded-2xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100", children: ["Rejection note: ", event.rejectionReason] })), event.image && (_jsx("div", { className: "mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20", children: _jsx("img", { src: event.image, alt: `${event.title} cover`, className: "h-56 w-full object-cover" }) })), _jsxs("div", { className: "mt-4 grid gap-6 lg:grid-cols-[1.2fr,1fr]", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("dl", { className: "grid gap-3 text-sm text-white/80", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Title" }), _jsx("dd", { className: "text-lg font-semibold text-white", children: event.title })] }), _jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-white/60", children: [_jsx("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: event.category.toUpperCase() }), _jsx("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: formatDate(event.date) }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: ["\uD83D\uDCCD ", event.location] })] }), (event.startTime || event.endTime || event.maxAttendees) && (_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-white/70", children: [(event.startTime || event.endTime) && (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: ["\u23F0 ", event.startTime ?? 'TBD', event.endTime ? ` – ${event.endTime}` : ''] })), event.maxAttendees ? (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: ["\uD83D\uDC65 Max ", event.maxAttendees] })) : null] })), _jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Organiser" }), _jsxs("dd", { className: "text-sm text-white/80", children: [event.organizerProfile?.username || event.organizer, event.organizerProfile?.email && (_jsxs("span", { className: "text-white/50", children: [' ', "\u2022 ", event.organizerProfile.email] }))] })] }), event.description && (_jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Description" }), _jsx("dd", { className: "text-sm text-white/70 whitespace-pre-line", children: event.description })] }))] }), event.tags && event.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 text-[11px] text-white/60", children: event.tags.map((tag) => (_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 uppercase tracking-wide", children: ["#", tag] }, tag))) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80", children: [_jsxs("div", { className: "flex items-center justify-between text-white", children: [_jsx("span", { children: "Pricing" }), _jsx("span", { className: "font-semibold", children: event.isFree || (!event.price && event.price !== 0)
                                                                                            ? 'Free'
                                                                                            : formatCurrency(event.price) })] }), typeof event.maxAttendees === 'number' && (_jsxs("div", { className: "flex items-center justify-between text-xs text-white/70", children: [_jsx("span", { children: "Capacity" }), _jsx("span", { children: event.maxAttendees })] })), event.ticketLink && (_jsx("a", { href: event.ticketLink, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:border-emerald-300/60 hover:text-emerald-100", children: "\uD83C\uDF9F\uFE0F Ticket link" })), event.socialMediaLink && (_jsx("a", { href: event.socialMediaLink, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:border-sky-300/60 hover:text-sky-100", children: "\uD83D\uDCE3 Promo link" }))] }), _jsxs("div", { className: "space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm font-semibold text-white", children: [_jsxs("span", { children: [event.attendeeCount, " RSVP"] }), event.attendeeCount === 0 && (_jsx("span", { className: "text-xs text-white/60", children: "Encourage more promotion" }))] }), event.attendees.length > 0 ? (_jsx("div", { className: "max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/5", children: _jsx("table", { className: "w-full text-left text-xs text-white/80", children: _jsx("tbody", { children: event.attendees.map((attendee, index) => (_jsxs("tr", { className: "border-b border-white/10 last:border-b-0", children: [_jsx("td", { className: "px-4 py-2 font-semibold text-white", children: attendee.username || 'Member' }), _jsx("td", { className: "px-4 py-2 text-white/60", children: attendee.email || '—' }), _jsx("td", { className: "px-4 py-2 text-white/60", children: [attendee.area, attendee.workOrSchool].filter(Boolean).join(' • ') || '—' })] }, `${attendee.id ?? index}`))) }) }) })) : (_jsx("p", { className: "text-xs text-white/60", children: "No RSVP data yet." }))] })] })] })] }, event.id));
                                        }) }))] }), _jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83C\uDFE2" }), " Business directory management"] }), _jsx("p", { className: "text-sm text-white/60", children: "Approve listings, verify ownership, and track traction." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setShowBusinessUpload(!showBusinessUpload), className: "inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30", children: showBusinessUpload ? '✕ Cancel' : '+ Add Business' }), _jsxs("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: [businesses.length, " submissions"] })] })] }), showBusinessUpload && (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: _jsx(BusinessUpload, { onSuccess: () => {
                                                setShowBusinessUpload(false);
                                                loadAdminData();
                                            }, onCancel: () => setShowBusinessUpload(false) }) })), businesses.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: "No business listings yet. They will appear here once submitted." })) : (_jsx("div", { className: "grid gap-4", children: businesses.map((business) => (_jsx("article", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.2fr,1fr,1fr]", children: [_jsxs("dl", { className: "space-y-3 text-sm text-white/80", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Business name" }), _jsx("dd", { className: "text-lg font-semibold text-white", children: business.businessName })] }), _jsxs("div", { className: "flex flex-wrap gap-2 text-xs text-white/60", children: [_jsx("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: business.category }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: ["Submitted ", formatDate(business.createdAt || undefined)] })] }), business.owner && (_jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Owner" }), _jsxs("dd", { className: "text-sm text-white/80", children: [business.owner.username, business.owner.email && (_jsxs("span", { className: "text-white/50", children: [" \u2022 ", business.owner.email] }))] })] }))] }), _jsxs("div", { className: "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Listing status" }), _jsx("select", { value: business.status, onChange: (event) => handleUpdateBusiness(business.id, {
                                                                    status: event.target.value,
                                                                }), disabled: updatingBusinessId === business.id || loading, className: "w-full rounded-xl border border-white/20 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-white/80 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30", children: STATUS_OPTIONS.map((status) => (_jsx("option", { value: status, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) })] }), _jsxs("div", { className: "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Verification" }), _jsx("button", { onClick: () => handleUpdateBusiness(business.id, {
                                                                    verified: !business.verified,
                                                                }), disabled: updatingBusinessId === business.id || loading, className: `w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${business.verified
                                                                    ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'}`, children: business.verified ? 'Verified' : 'Mark as verified' })] })] }) }, business.id))) }))] }), _jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDC65" }), " Community members"] }), _jsx("p", { className: "text-sm text-white/60", children: "Manage and view all registered community members." })] }), _jsxs("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: [members.length, " members"] })] }), members.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: "No community members yet." })) : (_jsx("div", { className: "overflow-x-auto rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-slate-900/40 backdrop-blur", children: _jsxs("table", { className: "w-full text-sm text-white/80", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/10", children: [_jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Username" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Email" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Area" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Work/School" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Status" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Joined" })] }) }), _jsx("tbody", { children: members.map((member, index) => (_jsxs("tr", { className: `border-b border-white/10 last:border-b-0 ${index % 2 === 0 ? 'bg-white/2' : ''}`, children: [_jsx("td", { className: "px-6 py-4 font-semibold text-white", children: member.username }), _jsx("td", { className: "px-6 py-4", children: member.email }), _jsx("td", { className: "px-6 py-4", children: member.area || '—' }), _jsx("td", { className: "px-6 py-4", children: member.workOrSchool || '—' }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${member.isAdmin
                                                                        ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40'
                                                                        : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'}`, children: member.isAdmin ? '👑 Admin' : 'Member' }) }), _jsx("td", { className: "px-6 py-4 text-white/60", children: formatDate(member.joinedAt) })] }, member.id))) })] }) }))] })] }))] })] }));
}
function SummaryCard({ title, value, icon, accent }) {
    return (_jsxs("div", { className: `rounded-3xl border border-white/15 bg-gradient-to-br ${accent} p-5 text-white shadow-lg shadow-slate-900/40`, children: [_jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl", children: icon }), _jsx("p", { className: "mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70", children: title }), _jsx("p", { className: "text-3xl font-black", children: value })] }));
}
//# sourceMappingURL=AdminPortal.js.map