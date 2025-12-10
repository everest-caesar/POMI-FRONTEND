import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import BusinessUpload from './BusinessUpload';
import EventCreationForm from './EventCreationForm';
import { API_BASE_URL } from '../config/api';
const createEmptySectionErrors = () => ({
    overview: null,
    events: null,
    businesses: null,
    listings: null,
    users: null,
    messages: null,
});
const getErrorMessage = (reason) => {
    if (reason instanceof Error)
        return reason.message;
    if (typeof reason === 'string')
        return reason;
    if (reason && typeof reason === 'object' && 'message' in reason) {
        return String(reason.message);
    }
    return 'Unable to load this section. Please try again.';
};
const generateLocalId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const mapAdminMessages = (rawMessages) => rawMessages.map((message) => ({
    id: message?._id?.toString?.() || message?.id || generateLocalId(),
    recipientId: message?.recipientId?.toString?.() || message?.recipientId || null,
    recipientName: message?.recipientName || 'Community member',
    content: message?.content || '',
    createdAt: message?.createdAt || new Date().toISOString(),
}));
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
const formatRelativeTimestamp = (value) => {
    if (!value)
        return 'Awaiting sync';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Unknown';
    }
    const diff = Date.now() - date.getTime();
    if (diff < 60000)
        return 'Just now';
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    return date.toLocaleString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
export default function AdminPortal({ token, onLogout, onBack }) {
    const [metrics, setMetrics] = useState(null);
    const [events, setEvents] = useState([]);
    const [listings, setListings] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [members, setMembers] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const [adminInboxMessages, setAdminInboxMessages] = useState([]);
    const [unreadUserMessages, setUnreadUserMessages] = useState(0);
    const [activeSection, setActiveSection] = useState('overview');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversationLoading, setConversationLoading] = useState(false);
    const [conversationError, setConversationError] = useState(null);
    const [conversationReply, setConversationReply] = useState('');
    const [replySending, setReplySending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sectionErrors, setSectionErrors] = useState(createEmptySectionErrors());
    const [statusMessage, setStatusMessage] = useState(null);
    const [updatingBusinessId, setUpdatingBusinessId] = useState(null);
    const [moderatingEventId, setModeratingEventId] = useState(null);
    const [moderatingListingId, setModeratingListingId] = useState(null);
    const [showBusinessUpload, setShowBusinessUpload] = useState(false);
    const [showEventCreation, setShowEventCreation] = useState(false);
    const [showPendingEventsOnly, setShowPendingEventsOnly] = useState(true);
    const [showPendingListingsOnly, setShowPendingListingsOnly] = useState(true);
    const [memberQuery, setMemberQuery] = useState('');
    const [memberSearchApplied, setMemberSearchApplied] = useState(false);
    const [membersTotal, setMembersTotal] = useState(null);
    const [isSearchingMembers, setIsSearchingMembers] = useState(false);
    const [messageForm, setMessageForm] = useState({ recipientId: '', content: '' });
    const [broadcastContent, setBroadcastContent] = useState('');
    const [messagingFeedback, setMessagingFeedback] = useState(null);
    const [messagingLoading, setMessagingLoading] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [downloadingSnapshot, setDownloadingSnapshot] = useState(false);
    const filteredEvents = useMemo(() => showPendingEventsOnly
        ? events.filter((event) => event.moderationStatus === 'pending')
        : events, [events, showPendingEventsOnly]);
    const filteredListings = useMemo(() => showPendingListingsOnly
        ? listings.filter((listing) => listing.moderationStatus === 'pending')
        : listings, [listings, showPendingListingsOnly]);
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
    const fetchAdminUsersData = (searchTerm) => {
        const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
        return fetchJson(`/admin/users${query}`);
    };
    const fetchAdminMessagesData = () => fetchJson('/admin/messages');
    const fetchAdminInboxData = () => fetchJson('/admin/messages/inbox');
    const loadAdminData = async () => {
        setLoading(true);
        setError(null);
        setStatusMessage(null);
        const nextErrors = createEmptySectionErrors();
        try {
            const [overviewResult, eventsResult, businessesResult, listingsResult, usersResult, messagesResult, inboxResult,] = await Promise.allSettled([
                fetchJson('/admin/overview'),
                fetchJson('/admin/events'),
                fetchJson('/admin/businesses'),
                fetchJson('/admin/marketplace'),
                fetchAdminUsersData(),
                fetchAdminMessagesData(),
                fetchAdminInboxData(),
            ]);
            if (overviewResult.status === 'fulfilled') {
                setMetrics(overviewResult.value.metrics);
            }
            else {
                setMetrics(null);
                nextErrors.overview = getErrorMessage(overviewResult.reason);
            }
            if (eventsResult.status === 'fulfilled') {
                setEvents(eventsResult.value.events || []);
            }
            else {
                setEvents([]);
                nextErrors.events = getErrorMessage(eventsResult.reason);
            }
            if (businessesResult.status === 'fulfilled') {
                setBusinesses(businessesResult.value.businesses || []);
            }
            else {
                setBusinesses([]);
                nextErrors.businesses = getErrorMessage(businessesResult.reason);
            }
            if (listingsResult.status === 'fulfilled') {
                setListings(listingsResult.value.listings || []);
            }
            else {
                setListings([]);
                nextErrors.listings = getErrorMessage(listingsResult.reason);
            }
            if (usersResult.status === 'fulfilled') {
                setMembers(usersResult.value.users || []);
                setMembersTotal(usersResult.value.pagination?.total ??
                    usersResult.value.users?.length ??
                    null);
                setMemberSearchApplied(false);
            }
            else {
                setMembers([]);
                setMembersTotal(null);
                nextErrors.users = getErrorMessage(usersResult.reason);
            }
            if (messagesResult.status === 'fulfilled') {
                setAdminMessages(mapAdminMessages(messagesResult.value.data || []));
            }
            else {
                setAdminMessages([]);
                nextErrors.messages = getErrorMessage(messagesResult.reason);
            }
            if (inboxResult.status === 'fulfilled') {
                const inboxMessages = inboxResult.value.data || [];
                setAdminInboxMessages(inboxMessages);
                setUnreadUserMessages(inboxMessages.filter((message) => !message.isRead).length);
            }
            else {
                setAdminInboxMessages([]);
                setUnreadUserMessages(0);
            }
            setLastUpdatedAt(new Date());
            const fatal = Object.values(nextErrors).every((msg) => Boolean(msg));
            setError(fatal ? 'Failed to load admin data. Please try again.' : null);
        }
        finally {
            setSectionErrors(nextErrors);
            setLoading(false);
        }
    };
    const refreshMembers = async (searchTerm) => {
        const term = searchTerm?.trim();
        setIsSearchingMembers(true);
        setSectionErrors((prev) => ({ ...prev, users: null }));
        try {
            const response = await fetchAdminUsersData(term);
            setMembers(response.users || []);
            setMembersTotal(response.pagination?.total ?? response.users?.length ?? null);
            setMemberSearchApplied(Boolean(term));
        }
        catch (err) {
            setSectionErrors((prev) => ({
                ...prev,
                users: err.message || 'Failed to load community members',
            }));
        }
        finally {
            setIsSearchingMembers(false);
        }
    };
    const handleMemberSearch = async (event) => {
        event.preventDefault();
        await refreshMembers(memberQuery);
    };
    const handleClearMemberSearch = async () => {
        setMemberQuery('');
        await refreshMembers();
    };
    const refreshAdminInbox = async () => {
        try {
            const response = await fetchAdminInboxData();
            const inboxMessages = response.data || [];
            setAdminInboxMessages(inboxMessages);
            setUnreadUserMessages(inboxMessages.filter((message) => !message.isRead).length);
        }
        catch (err) {
            setSectionErrors((prev) => ({
                ...prev,
                messages: err.message || 'Failed to load admin messages',
            }));
        }
    };
    const refreshAdminMessagesList = async () => {
        try {
            const response = await fetchAdminMessagesData();
            setAdminMessages(mapAdminMessages(response.data || []));
            setSectionErrors((prev) => ({ ...prev, messages: null }));
            await refreshAdminInbox();
        }
        catch (err) {
            setSectionErrors((prev) => ({
                ...prev,
                messages: err.message || 'Failed to load admin messages',
            }));
        }
    };
    const openConversation = async (userId, username) => {
        setConversationLoading(true);
        setConversationError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/messages/conversation/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error || 'Failed to load conversation');
            }
            const messages = (payload.data || []).map((message) => ({
                id: message._id || message.id,
                senderId: typeof message.senderId === 'object' && message.senderId !== null
                    ? message.senderId._id || message.senderId.id || ''
                    : message.senderId || '',
                senderName: message.senderName ||
                    message.senderId?.username ||
                    message.recipientName ||
                    'Member',
                content: message.content || '',
                createdAt: message.createdAt || new Date().toISOString(),
            }));
            setSelectedConversation({ userId, username, messages });
            setMessageForm((prev) => ({ ...prev, recipientId: userId }));
            await refreshAdminInbox();
        }
        catch (err) {
            setConversationError(err.message || 'Failed to open conversation');
            setSelectedConversation(null);
        }
        finally {
            setConversationLoading(false);
        }
    };
    const handleTargetedMessageSubmit = async (event) => {
        event.preventDefault();
        if (!messageForm.recipientId || !messageForm.content.trim()) {
            setMessagingFeedback({
                type: 'error',
                message: 'Select a recipient and write a message before sending.',
            });
            return;
        }
        setMessagingLoading(true);
        setMessagingFeedback(null);
        try {
            await fetchJson('/admin/messages', {
                method: 'POST',
                body: JSON.stringify({
                    recipientId: messageForm.recipientId,
                    content: messageForm.content.trim(),
                }),
            });
            setMessagingFeedback({
                type: 'success',
                message: 'Message sent to the member.',
            });
            setMessageForm({ recipientId: '', content: '' });
            await refreshAdminMessagesList();
        }
        catch (err) {
            setMessagingFeedback({
                type: 'error',
                message: err.message || 'Failed to send the message',
            });
        }
        finally {
            setMessagingLoading(false);
        }
    };
    const handleBroadcastMessageSubmit = async (event) => {
        event.preventDefault();
        if (!broadcastContent.trim()) {
            setMessagingFeedback({
                type: 'error',
                message: 'Write a message before broadcasting to the community.',
            });
            return;
        }
        setMessagingLoading(true);
        setMessagingFeedback(null);
        try {
            await fetchJson('/admin/messages/broadcast', {
                method: 'POST',
                body: JSON.stringify({
                    content: broadcastContent.trim(),
                }),
            });
            setMessagingFeedback({
                type: 'success',
                message: 'Broadcast queued for all community members.',
            });
            setBroadcastContent('');
            await refreshAdminMessagesList();
        }
        catch (err) {
            setMessagingFeedback({
                type: 'error',
                message: err.message || 'Failed to broadcast the message',
            });
        }
        finally {
            setMessagingLoading(false);
        }
    };
    const handleConversationReply = async (event) => {
        event.preventDefault();
        if (!selectedConversation || !conversationReply.trim()) {
            return;
        }
        setReplySending(true);
        setConversationError(null);
        try {
            await fetchJson('/admin/messages', {
                method: 'POST',
                body: JSON.stringify({
                    recipientId: selectedConversation.userId,
                    content: conversationReply.trim(),
                }),
            });
            setConversationReply('');
            await refreshAdminMessagesList();
            await openConversation(selectedConversation.userId, selectedConversation.username);
        }
        catch (err) {
            setConversationError(err.message || 'Failed to send reply');
        }
        finally {
            setReplySending(false);
        }
    };
    useEffect(() => {
        loadAdminData();
    }, [token]);
    const handleDownloadSnapshot = () => {
        try {
            setDownloadingSnapshot(true);
            const snapshot = {
                generatedAt: new Date().toISOString(),
                metrics,
                totals: {
                    events: events.length,
                    listings: listings.length,
                    businesses: businesses.length,
                    members: membersTotal ?? members.length,
                },
                queues: {
                    pendingEvents: metrics?.pendingEvents ?? 0,
                    pendingListings: metrics?.pendingListings ?? 0,
                    pendingBusinesses: metrics?.pendingBusinesses ?? 0,
                },
            };
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
                type: 'application/json',
            });
            const downloadUrl = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = downloadUrl;
            anchor.download = `pomi-admin-snapshot-${Date.now()}.json`;
            anchor.click();
            URL.revokeObjectURL(downloadUrl);
            setStatusMessage('Snapshot downloaded successfully.');
        }
        catch (err) {
            setError(err?.message || 'Failed to export snapshot');
        }
        finally {
            setTimeout(() => setDownloadingSnapshot(false), 400);
        }
    };
    const jumpToEvents = () => {
        setActiveSection('events');
        setShowEventCreation(true);
    };
    const jumpToBusinesses = () => {
        setActiveSection('businesses');
        setShowBusinessUpload(true);
    };
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
    const pendingApprovals = (metrics?.pendingEvents ?? 0) +
        (metrics?.pendingBusinesses ?? 0) +
        (metrics?.pendingListings ?? 0);
    const lastUpdatedLabel = formatRelativeTimestamp(lastUpdatedAt);
    const quickActions = [
        {
            title: loading ? 'Refreshing data…' : 'Refresh console',
            description: 'Pulls the newest approvals, messages, and metrics.',
            icon: '↻',
            action: loadAdminData,
            disabled: loading,
        },
        {
            title: 'New event review',
            description: 'Jump to approvals and open the event composer.',
            icon: '🎟️',
            action: jumpToEvents,
        },
        {
            title: 'New business listing',
            description: 'Guide entrepreneurs through the verification flow.',
            icon: '🏢',
            action: jumpToBusinesses,
        },
        {
            title: downloadingSnapshot ? 'Exporting…' : 'Export snapshot',
            description: 'Download a JSON summary for reporting or audits.',
            icon: '⬇️',
            action: handleDownloadSnapshot,
            disabled: downloadingSnapshot,
        },
    ];
    const adminSections = [
        {
            id: 'overview',
            label: 'Overview',
            icon: '📊',
            description: 'Executive metrics & quick actions.',
        },
        {
            id: 'marketplace',
            label: 'Marketplace',
            icon: '🛒',
            description: 'Approve listings & monitor status.',
        },
        {
            id: 'events',
            label: 'Events',
            icon: '🎉',
            description: 'Review RSVPs and moderation status.',
        },
        {
            id: 'businesses',
            label: 'Businesses',
            icon: '🏢',
            description: 'Create, verify, and publish business listings.',
        },
        {
            id: 'members',
            label: 'Members',
            icon: '👥',
            description: 'Search profiles and manage community roles.',
        },
        {
            id: 'messaging',
            label: 'Messaging',
            icon: '💬',
            description: 'Broadcast announcements and reply to members.',
        },
    ];
    return (_jsxs("div", { className: "flex min-h-screen bg-slate-950 text-slate-100", children: [_jsxs("aside", { className: "hidden w-64 flex-col border-r border-white/10 bg-slate-900/80 px-4 py-6 lg:flex", children: [_jsxs("div", { className: "flex items-center gap-3 px-2", children: [_jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-2xl font-black text-white shadow-lg shadow-red-500/40", children: "P" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/60", children: "Admin Console" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Pomi Community" })] })] }), _jsx("nav", { className: "mt-8 flex flex-col gap-2", children: adminSections.map((section) => (_jsx("button", { onClick: () => setActiveSection(section.id), className: `rounded-2xl border px-3 py-3 text-left transition ${activeSection === section.id
                                ? 'border-white/25 bg-white/10 text-white shadow-lg shadow-slate-900/30'
                                : 'border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-semibold text-white", children: [section.icon, " ", section.label] }), _jsx("p", { className: "text-xs text-white/60", children: section.description })] }), section.id === 'messaging' && unreadUserMessages > 0 && (_jsx("span", { className: "rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-100", children: unreadUserMessages }))] }) }, section.id))) }), _jsxs("div", { className: "mt-auto space-y-3 border-t border-white/10 pt-4", children: [_jsxs("button", { onClick: () => {
                                    setActiveSection('messaging');
                                    void refreshAdminInbox();
                                }, className: `flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition ${unreadUserMessages > 0
                                    ? 'bg-rose-500/20 text-rose-100 border border-rose-300/40 shadow-lg shadow-rose-900/20'
                                    : 'border border-white/15 text-white/70 hover:border-white/25 hover:text-white'}`, children: [_jsx("span", { children: "\uD83D\uDCE8 Member inbox" }), _jsx("span", { className: "rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white", children: unreadUserMessages > 0 ? `${unreadUserMessages} new` : 'All clear' })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [onBack && (_jsx("button", { onClick: onBack, className: "flex flex-1 items-center justify-center rounded-2xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white", children: "\u2190 Back" })), _jsx("button", { onClick: onLogout, className: "flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5", children: "Log out" })] })] })] }), _jsxs("div", { className: "flex flex-1 flex-col", children: [_jsx("header", { className: "border-b border-white/10 bg-slate-900/60 px-4 py-4 backdrop-blur sm:px-6 lg:px-10", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/60", children: "Pomi Admin \u2022 Private" }), _jsx("h1", { className: "text-2xl font-black text-white", children: "Community safety & marketplace intelligence" }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60", children: [_jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1", children: ["\u23F1\uFE0F Last sync: ", lastUpdatedLabel] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1", children: ["\uD83D\uDCEC Pending approvals: ", pendingApprovals] })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("label", { className: "flex min-w-[200px] items-center rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70", children: [_jsx("span", { className: "mr-2 text-white/50", children: "\uD83D\uDD0D" }), _jsx("input", { type: "text", placeholder: "Search workspace", className: "w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none" })] }), _jsx("button", { onClick: loadAdminData, disabled: loading, className: "inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60", children: "\u21BB Refresh" })] })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 text-xs text-white/60", children: [_jsxs("button", { onClick: () => {
                                                setActiveSection('messaging');
                                                void refreshAdminInbox();
                                            }, className: `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${unreadUserMessages > 0
                                                ? 'bg-rose-500/20 text-rose-100 border border-rose-300/40 shadow-lg shadow-rose-900/20'
                                                : 'border border-white/15 text-white/70 hover:border-white/25 hover:text-white'}`, children: [_jsx("span", { children: "\uD83D\uDCE8 Member inbox" }), _jsx("span", { className: "rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white", children: unreadUserMessages > 0 ? `${unreadUserMessages} new` : 'All clear' })] }), _jsxs("div", { className: "flex gap-2", children: [onBack && (_jsx("button", { onClick: onBack, className: "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white lg:hidden", children: "\u2190 Back" })), _jsx("button", { onClick: onLogout, className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/40 transition hover:-translate-y-0.5 lg:hidden", children: "Log out" })] })] })] }) }), _jsx("div", { className: "border-b border-white/10 bg-slate-950/90 px-4 py-3 lg:hidden", children: _jsx("div", { className: "flex gap-2 overflow-x-auto", children: adminSections.map((section) => (_jsxs("button", { onClick: () => setActiveSection(section.id), className: `flex flex-col rounded-2xl px-3 py-2 text-left text-xs font-semibold transition ${activeSection === section.id
                                    ? 'border border-white/20 bg-white/10 text-white'
                                    : 'border border-white/5 bg-transparent text-white/60'}`, children: [_jsx("span", { children: section.icon }), _jsx("span", { children: section.label })] }, `mobile-${section.id}`))) }) }), _jsxs("main", { className: "flex-1 bg-slate-950 px-4 py-8 sm:px-6 lg:px-10", children: [loading && (_jsxs("div", { className: "py-24 text-center text-white/70", children: [_jsx("div", { className: "mb-6 text-5xl animate-spin", children: "\uD83C\uDF00" }), "Loading the latest metrics\u2026"] })), !loading && error && (_jsx("div", { className: "rounded-3xl border border-red-200 bg-red-50/90 px-6 py-4 text-sm font-semibold text-red-700 shadow-lg shadow-red-500/30", children: error })), !loading && !error && (_jsxs("div", { className: "space-y-12", children: [activeSection === 'overview' && (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: quickActions.map((action) => (_jsxs("button", { onClick: action.action, disabled: action.disabled, className: "flex flex-col items-start rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-left shadow-lg shadow-slate-900/30 transition hover:-translate-y-1 hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-70", children: [_jsx("span", { className: "text-2xl", children: action.icon }), _jsx("p", { className: "mt-3 text-sm font-semibold text-white", children: action.title }), _jsx("p", { className: "mt-1 text-xs text-white/70", children: action.description })] }, action.title))) }), _jsxs("section", { className: "space-y-6", children: [_jsx("div", { className: "flex flex-wrap items-center justify-between gap-4", children: _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-black text-white", children: "Executive snapshot" }), _jsx("p", { className: "text-sm text-white/60", children: "Key health metrics across the marketplace, events, and business directory." })] }) }), statusMessage && (_jsx("div", { className: "rounded-3xl border border-emerald-300/40 bg-emerald-500/10 px-6 py-4 text-sm font-semibold text-emerald-200 shadow-lg shadow-emerald-900/30 backdrop-blur", children: statusMessage })), sectionErrors.overview ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100", children: sectionErrors.overview })) : (_jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7", children: [_jsx(SummaryCard, { title: "Community Members", value: metrics?.totalUsers ?? 0, icon: "\uD83D\uDC65", accent: "from-red-500 to-orange-500" }), _jsx(SummaryCard, { title: "Active Events", value: metrics?.totalEvents ?? 0, icon: "\uD83C\uDF89", accent: "from-orange-500 to-amber-500" }), _jsx(SummaryCard, { title: "Business Listings", value: metrics?.totalBusinesses ?? 0, icon: "\uD83C\uDFE2", accent: "from-amber-500 to-yellow-500" }), _jsx(SummaryCard, { title: "Total RSVPs", value: metrics?.totalRegistrations ?? 0, icon: "\uD83D\uDCDD", accent: "from-emerald-500 to-teal-500" }), _jsx(SummaryCard, { title: "Pending Businesses", value: metrics?.pendingBusinesses ?? 0, icon: "\u23F3", accent: "from-blue-500 to-indigo-500" }), _jsx(SummaryCard, { title: "Pending Events", value: metrics?.pendingEvents ?? 0, icon: "\uD83D\uDD52", accent: "from-purple-500 to-violet-500" }), _jsx(SummaryCard, { title: "Pending Listings", value: metrics?.pendingListings ?? 0, icon: "\uD83D\uDED2", accent: "from-fuchsia-500 to-pink-500" })] }))] })] })), activeSection === 'marketplace' && (_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDED2" }), " Marketplace moderation"] }), _jsx("p", { className: "text-sm text-white/60", children: "Approve community submissions before they appear in the marketplace feed." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: [_jsx("input", { type: "checkbox", className: "h-4 w-4 rounded border-white/30 bg-transparent text-rose-400 focus:ring-rose-400", checked: showPendingListingsOnly, onChange: () => setShowPendingListingsOnly((prev) => !prev) }), "Pending only"] }), _jsx("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: showPendingListingsOnly
                                                                    ? `${filteredListings.length} pending`
                                                                    : `${listings.length} submissions` })] })] }), sectionErrors.listings ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100", children: sectionErrors.listings })) : filteredListings.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: showPendingListingsOnly && listings.length > 0
                                                    ? 'No pending marketplace submissions. Toggle the filter to review approved or rejected posts.'
                                                    : 'No marketplace submissions yet. Encourage members to share their listings.' })) : (_jsx("div", { className: "grid gap-4", children: filteredListings.map((listing) => {
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
                                                }) }))] })), activeSection === 'events' && (_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCC5" }), " Event registrations"] }), _jsx("p", { className: "text-sm text-white/60", children: "Upcoming gatherings curated by the community team." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setShowEventCreation(!showEventCreation), className: "inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30", children: showEventCreation ? '✕ Cancel' : '+ Create Event' }), _jsxs("label", { className: "inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: [_jsx("input", { type: "checkbox", className: "h-4 w-4 rounded border-white/30 bg-transparent text-rose-400 focus:ring-rose-400", checked: showPendingEventsOnly, onChange: () => setShowPendingEventsOnly((prev) => !prev) }), "Pending only"] }), _jsx("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: showPendingEventsOnly
                                                                    ? `${filteredEvents.length} pending`
                                                                    : `${events.length} tracked` })] })] }), showEventCreation && (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: _jsx(EventCreationForm, { onSuccess: () => {
                                                        setShowEventCreation(false);
                                                        loadAdminData();
                                                    }, onCancel: () => setShowEventCreation(false) }) })), sectionErrors.events ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100", children: sectionErrors.events })) : filteredEvents.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: showPendingEventsOnly && events.length > 0
                                                    ? 'No pending events right now. Toggle the filter to review approved or rejected submissions.'
                                                    : 'No events to review yet. Encourage organisers to submit upcoming meetups.' })) : (_jsx("div", { className: "grid gap-4", children: filteredEvents.map((event) => {
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
                                                }) }))] })), activeSection === 'businesses' && (_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83C\uDFE2" }), " Business directory management"] }), _jsx("p", { className: "text-sm text-white/60", children: "Approve listings, verify ownership, and track traction." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setShowBusinessUpload(!showBusinessUpload), className: "inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30", children: showBusinessUpload ? '✕ Cancel' : '+ Add Business' }), _jsxs("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: [businesses.length, " submissions"] })] })] }), showBusinessUpload && (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: _jsx(BusinessUpload, { authToken: token, onSuccess: () => {
                                                        setShowBusinessUpload(false);
                                                        loadAdminData();
                                                    }, onCancel: () => setShowBusinessUpload(false) }) })), sectionErrors.businesses ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100", children: sectionErrors.businesses })) : businesses.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: "No business listings yet. They will appear here once submitted." })) : (_jsx("div", { className: "grid gap-4", children: businesses.map((business) => (_jsx("article", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.2fr,1fr,1fr]", children: [_jsxs("dl", { className: "space-y-3 text-sm text-white/80", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Business name" }), _jsx("dd", { className: "text-lg font-semibold text-white", children: business.businessName })] }), _jsxs("div", { className: "flex flex-wrap gap-2 text-xs text-white/60", children: [_jsx("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: business.category }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1", children: ["Submitted ", formatDate(business.createdAt || undefined)] })] }), business.owner && (_jsxs("div", { children: [_jsx("dt", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Owner" }), _jsxs("dd", { className: "text-sm text-white/80", children: [business.owner.username, business.owner.email && (_jsxs("span", { className: "text-white/50", children: [" \u2022 ", business.owner.email] }))] })] }))] }), _jsxs("div", { className: "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Listing status" }), _jsx("select", { value: business.status, onChange: (event) => handleUpdateBusiness(business.id, {
                                                                            status: event.target.value,
                                                                        }), disabled: updatingBusinessId === business.id || loading, className: "w-full rounded-xl border border-white/20 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-white/80 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30", children: STATUS_OPTIONS.map((status) => (_jsx("option", { value: status, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) })] }), _jsxs("div", { className: "space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Verification" }), _jsx("button", { onClick: () => handleUpdateBusiness(business.id, {
                                                                            verified: !business.verified,
                                                                        }), disabled: updatingBusinessId === business.id || loading, className: `w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${business.verified
                                                                            ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                                                                            : 'bg-white/10 text-white/70 hover:bg-white/20'}`, children: business.verified ? 'Verified' : 'Mark as verified' })] })] }) }, business.id))) }))] })), activeSection === 'members' && (_jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDC65" }), " Community members"] }), _jsx("p", { className: "text-sm text-white/60", children: "Manage and view all registered community members." })] }), _jsx("span", { className: "rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/70", children: memberSearchApplied
                                                            ? `${members.length} matching ${members.length === 1 ? 'member' : 'members'}`
                                                            : membersTotal
                                                                ? `${members.length} of ${membersTotal} members`
                                                                : `${members.length} members` })] }), _jsxs("form", { onSubmit: handleMemberSearch, className: "flex flex-wrap items-center gap-3", children: [_jsx("input", { type: "search", value: memberQuery, onChange: (event) => setMemberQuery(event.target.value), placeholder: "Search by name, email, or area", className: "w-full max-w-sm rounded-2xl border border-white/15 bg-white/90 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40" }), _jsx("button", { type: "submit", disabled: isSearchingMembers, className: "rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60", children: isSearchingMembers ? 'Searching…' : 'Search' }), _jsx("button", { type: "button", disabled: isSearchingMembers || (!memberSearchApplied && !memberQuery), onClick: () => void handleClearMemberSearch(), className: "rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60", children: "Reset" })] }), sectionErrors.users ? (_jsx("div", { className: "rounded-3xl border border-rose-300/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-100", children: sectionErrors.users })) : members.length === 0 ? (_jsx("div", { className: "rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white/70 shadow-lg shadow-slate-900/30 backdrop-blur", children: memberSearchApplied
                                                    ? 'No members matched this search. Try another term or reset the filter.'
                                                    : 'No community members yet.' })) : (_jsx("div", { className: "overflow-x-auto rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-slate-900/40 backdrop-blur", children: _jsxs("table", { className: "w-full text-sm text-white/80", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/10", children: [_jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Username" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Email" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Area" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Work/School" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Status" }), _jsx("th", { className: "px-6 py-4 text-left font-semibold text-white", children: "Joined" })] }) }), _jsx("tbody", { children: members.map((member, index) => (_jsxs("tr", { className: `border-b border-white/10 last:border-b-0 ${index % 2 === 0 ? 'bg-white/2' : ''}`, children: [_jsx("td", { className: "px-6 py-4 font-semibold text-white", children: member.username }), _jsx("td", { className: "px-6 py-4", children: member.email }), _jsx("td", { className: "px-6 py-4", children: member.area || '—' }), _jsx("td", { className: "px-6 py-4", children: member.workOrSchool || '—' }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${member.isAdmin
                                                                                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40'
                                                                                : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'}`, children: member.isAdmin ? '👑 Admin' : 'Member' }) }), _jsx("td", { className: "px-6 py-4 text-white/60", children: formatDate(member.joinedAt) })] }, member.id))) })] }) }))] })), activeSection === 'messaging' && (_jsxs("section", { className: "space-y-5", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "flex items-center gap-2 text-xl font-black text-white", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCAC" }), " Admin messaging"] }), _jsx("p", { className: "text-sm text-white/60", children: "Send quick updates to members or broadcast announcements to the entire community." })] }), _jsx("button", { onClick: () => void refreshAdminMessagesList(), className: "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white", children: "\uD83D\uDD01 Refresh history" })] }), messagingFeedback && (_jsx("div", { className: `rounded-2xl border px-4 py-3 text-sm ${messagingFeedback.type === 'error'
                                                    ? 'border-rose-300/40 bg-rose-500/10 text-rose-100'
                                                    : 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'}`, children: messagingFeedback.message })), sectionErrors.messages && (_jsx("div", { className: "rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100", children: sectionErrors.messages })), _jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("form", { onSubmit: handleTargetedMessageSubmit, className: "space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Direct message" }), _jsx("p", { children: "Reach out to an individual member with guidance or reminders." })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Recipient" }), _jsxs("select", { value: messageForm.recipientId, onChange: (event) => setMessageForm((prev) => ({
                                                                            ...prev,
                                                                            recipientId: event.target.value,
                                                                        })), disabled: messagingLoading || members.length === 0, className: "w-full rounded-2xl border border-white/20 bg-slate-950/40 px-3 py-2 text-sm font-semibold text-white/80 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/30 disabled:cursor-not-allowed disabled:opacity-60", children: [_jsx("option", { value: "", children: "Select community member" }), members.map((member) => (_jsxs("option", { value: member.id, children: [member.username, " \u2022 ", member.email] }, member.id)))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Message" }), _jsx("textarea", { value: messageForm.content, onChange: (event) => setMessageForm((prev) => ({
                                                                            ...prev,
                                                                            content: event.target.value,
                                                                        })), placeholder: "Share reminders, approvals, or follow-ups\u2026", rows: 4, className: "w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40" })] }), _jsx("button", { type: "submit", disabled: messagingLoading ||
                                                                    members.length === 0 ||
                                                                    !messageForm.recipientId ||
                                                                    !messageForm.content.trim(), className: "w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", children: messagingLoading ? 'Sending…' : 'Send message' })] }), _jsxs("form", { onSubmit: handleBroadcastMessageSubmit, className: "space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Broadcast update" }), _jsx("p", { children: "Send a short announcement to every member inbox." })] }), _jsx("textarea", { value: broadcastContent, onChange: (event) => setBroadcastContent(event.target.value), placeholder: "Example: Marketplace maintenance tonight at 8pm\u2026", rows: 6, className: "w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/40" }), _jsx("button", { type: "submit", disabled: messagingLoading || !broadcastContent.trim(), className: "w-full rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60", children: messagingLoading ? 'Broadcasting…' : 'Broadcast to all members' })] })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[320px,1fr]", children: [_jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("h4", { className: "font-semibold text-white", children: "Messages from members" }), _jsxs("span", { className: "text-xs text-white/60", children: [adminInboxMessages.length, " total"] })] }), adminInboxMessages.length === 0 ? (_jsx("p", { className: "mt-4 text-sm text-white/60", children: "No messages from users yet. Members can reach you through their home inbox." })) : (_jsx("ul", { className: "mt-4 space-y-3", children: adminInboxMessages.map((message) => {
                                                                    const senderIdValue = typeof message.senderId === 'object' && message.senderId !== null
                                                                        ? message.senderId._id || message.senderId.id || ''
                                                                        : message.senderId || '';
                                                                    const senderName = message.senderId?.username || message.senderName || 'Community member';
                                                                    return (_jsxs("li", { className: `rounded-2xl border px-3 py-3 text-sm transition ${selectedConversation?.userId === senderIdValue
                                                                            ? 'border-white/40 bg-white/10'
                                                                            : 'border-white/10 bg-white/0 hover:border-white/20 hover:bg-white/5'}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-2 text-xs text-white/60", children: [_jsx("span", { className: "font-semibold text-white", children: senderName }), _jsx("span", { children: formatDate(message.createdAt) })] }), _jsx("p", { className: "mt-2 text-white/80 line-clamp-2", children: message.content }), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: () => void openConversation(senderIdValue, senderName), className: "text-xs font-semibold text-white/80 transition hover:text-white", children: "View conversation \u2192" }), !message.isRead && (_jsx("span", { className: "inline-flex items-center rounded-full bg-amber-500/20 px-2 py-1 text-[11px] font-semibold text-amber-200", children: "Unread" }))] })] }, message._id || message.id));
                                                                }) }))] }), _jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("h4", { className: "font-semibold text-white", children: selectedConversation ? selectedConversation.username : 'Select a conversation' }), selectedConversation && (_jsxs("span", { className: "text-xs text-white/60", children: [selectedConversation.messages.length, " message", selectedConversation.messages.length === 1 ? '' : 's'] }))] }), conversationError && (_jsx("div", { className: "mt-4 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-100", children: conversationError })), conversationLoading ? (_jsx("div", { className: "flex min-h-[200px] items-center justify-center text-white/70", children: "Loading conversation\u2026" })) : selectedConversation ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mt-4 max-h-80 space-y-3 overflow-y-auto pr-2", children: selectedConversation.messages.map((message) => {
                                                                            const isMember = message.senderId === selectedConversation.userId;
                                                                            return (_jsx("div", { className: `flex ${isMember ? 'justify-start' : 'justify-end'}`, children: _jsxs("div", { className: `max-w-[85%] rounded-2xl border px-4 py-3 text-sm ${isMember
                                                                                        ? 'border-white/10 bg-white/10 text-white'
                                                                                        : 'border-emerald-400/30 bg-emerald-500/20 text-emerald-50'}`, children: [_jsx("div", { className: "text-xs font-semibold", children: isMember ? selectedConversation.username : 'Admin team' }), _jsx("p", { className: "mt-1 whitespace-pre-line text-white/90", children: message.content }), _jsx("p", { className: "mt-2 text-[11px] text-white/60", children: formatDate(message.createdAt) })] }) }, message.id));
                                                                        }) }), _jsxs("form", { onSubmit: handleConversationReply, className: "mt-4 space-y-2", children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-white/50", children: "Quick reply" }), _jsx("textarea", { value: conversationReply, onChange: (event) => setConversationReply(event.target.value), rows: 3, placeholder: `Reply to ${selectedConversation.username}…`, className: "w-full rounded-2xl border border-white/20 bg-slate-950/40 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/40" }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: replySending || !conversationReply.trim(), className: "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", children: replySending ? 'Sending…' : 'Send reply' }) })] })] })) : (_jsx("p", { className: "mt-4 text-sm text-white/60", children: "Select a member from the list to view the conversation history and respond." }))] })] }), _jsxs("div", { className: "rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h4", { className: "text-lg font-semibold text-white", children: "Recent admin messages" }), _jsxs("span", { className: "text-xs text-white/60", children: ["Showing ", Math.min(adminMessages.length, 8), " of ", adminMessages.length] })] }), adminMessages.length === 0 ? (_jsx("p", { className: "mt-4 text-sm text-white/60", children: "No admin messages yet. Use the tools above to send your first update." })) : (_jsx("ul", { className: "mt-4 space-y-3", children: adminMessages.slice(0, 8).map((message) => (_jsxs("li", { className: "rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-white/60", children: [_jsx("span", { children: message.recipientName || 'Community member' }), _jsx("span", { children: formatDate(message.createdAt) })] }), _jsx("p", { className: "mt-2 text-sm text-white/80", children: message.content })] }, message.id))) }))] })] }))] }))] })] })] }));
}
function SummaryCard({ title, value, icon, accent }) {
    return (_jsxs("div", { className: `rounded-3xl border border-white/15 bg-gradient-to-br ${accent} p-5 text-white shadow-lg shadow-slate-900/40`, children: [_jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl", children: icon }), _jsx("p", { className: "mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70", children: title }), _jsx("p", { className: "text-3xl font-black", children: value })] }));
}
//# sourceMappingURL=AdminPortal.js.map