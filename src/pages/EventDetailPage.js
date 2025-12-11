"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, MapPin, Calendar, Share2, Flag, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import authService from '@/services/authService';
import { API_BASE_URL } from '@/config/api';
const formatDateLabel = (value) => {
    if (!value)
        return 'Date coming soon';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};
const titleCase = (value) => {
    if (!value)
        return 'General';
    return value.charAt(0).toUpperCase() + value.slice(1);
};
export default function EventDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasRsvped, setHasRsvped] = useState(false);
    const [liked, setLiked] = useState(false);
    const [attendeeCount, setAttendeeCount] = useState(0);
    useEffect(() => {
        const loadEvent = async () => {
            if (!id)
                return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/events/${id}`);
                if (!response.ok)
                    throw new Error('Event not found');
                const data = await response.json();
                const eventData = data.event || data.data || data;
                const normalized = {
                    id: eventData._id || eventData.id || id,
                    title: eventData.title ?? 'Community gathering',
                    dateLabel: formatDateLabel(eventData.date),
                    timeLabel: eventData.startTime && eventData.endTime
                        ? `${eventData.startTime} - ${eventData.endTime}`
                        : eventData.startTime || eventData.endTime || 'Time announced soon',
                    location: eventData.location || 'Location coming soon',
                    attendees: Array.isArray(eventData.attendees) ? eventData.attendees.length : Number(eventData.attendees) || 0,
                    image: eventData.image || '/placeholder.jpg',
                    category: titleCase(eventData.category),
                    description: eventData.description,
                    organizer: eventData.organizer?.name || eventData.organizer?.email || 'Community member',
                };
                setEvent(normalized);
                setAttendeeCount(normalized.attendees);
                // Check if user has already RSVP'd
                const stored = localStorage.getItem('pomi-rsvp');
                if (stored) {
                    try {
                        const rsvpList = JSON.parse(stored);
                        setHasRsvped(rsvpList.includes(id));
                    }
                    catch {
                        setHasRsvped(false);
                    }
                }
                // Check if user has liked
                const likedEvents = localStorage.getItem('pomi-liked-events');
                if (likedEvents) {
                    try {
                        const likedList = JSON.parse(likedEvents);
                        setLiked(likedList.includes(id));
                    }
                    catch {
                        setLiked(false);
                    }
                }
            }
            catch (err) {
                console.error(err);
                setError('We could not load this event.');
            }
            finally {
                setLoading(false);
            }
        };
        void loadEvent();
    }, [id]);
    const handleRsvp = async () => {
        const token = authService.getToken();
        if (!token) {
            setError('Please log in to RSVP for events.');
            return;
        }
        const newRsvpState = !hasRsvped;
        setHasRsvped(newRsvpState);
        setAttendeeCount((prev) => prev + (newRsvpState ? 1 : -1));
        // Update localStorage
        const stored = localStorage.getItem('pomi-rsvp');
        let rsvpList = [];
        if (stored) {
            try {
                rsvpList = JSON.parse(stored);
            }
            catch {
                rsvpList = [];
            }
        }
        if (newRsvpState) {
            rsvpList.push(id);
        }
        else {
            rsvpList = rsvpList.filter((entry) => entry !== id);
        }
        localStorage.setItem('pomi-rsvp', JSON.stringify(rsvpList));
        try {
            const method = newRsvpState ? 'POST' : 'DELETE';
            await fetch(`${API_BASE_URL}/events/${id}/rsvp`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleLike = () => {
        const newLikeState = !liked;
        setLiked(newLikeState);
        // Update localStorage
        const stored = localStorage.getItem('pomi-liked-events');
        let likedList = [];
        if (stored) {
            try {
                likedList = JSON.parse(stored);
            }
            catch {
                likedList = [];
            }
        }
        if (newLikeState) {
            likedList.push(id);
        }
        else {
            likedList = likedList.filter((entry) => entry !== id);
        }
        localStorage.setItem('pomi-liked-events', JSON.stringify(likedList));
    };
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event?.title || 'Check out this event',
                    text: event?.description || 'Join us at this community event!',
                    url: window.location.href,
                });
            }
            catch {
                // User cancelled or error
            }
        }
        else {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-950", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsx("div", { className: "mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6", children: _jsx(Link, { to: "/events", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back"] }) }) }) }), _jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8 sm:px-6", children: [_jsx("div", { className: "h-96 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse mb-6" }), _jsx("div", { className: "h-48 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" })] })] }));
    }
    if (error || !event) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 flex items-center justify-center", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Event not found" }), _jsx("p", { className: "text-slate-400", children: error || 'This event may have been removed.' }), _jsx(Link, { to: "/events", children: _jsx(Button, { className: "bg-orange-500 hover:bg-orange-600 text-white", children: "Back to Events" }) })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/events", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back"] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { to: "/", className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 hover:scale-[1.02] transition", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "POMI" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Event Details" })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", variant: "ghost", className: "text-slate-300 hover:text-white hover:bg-slate-800", onClick: handleShare, children: _jsx(Share2, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", className: "text-slate-300 hover:text-white hover:bg-slate-800", children: _jsx(Flag, { className: "h-4 w-4" }) })] })] }) }), _jsx("main", { className: "max-w-5xl mx-auto px-4 py-8 sm:px-6", children: _jsxs("div", { className: "grid gap-8 lg:grid-cols-3", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-80 sm:h-96", children: [_jsx("img", { src: event.image || '/placeholder.jpg', alt: event.title, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute top-4 left-4", children: _jsx("span", { className: "inline-flex items-center rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold text-white", children: event.category }) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-white", children: event.title }), event.organizer && (_jsxs("p", { className: "text-sm text-slate-400 mt-2", children: ["Hosted by ", event.organizer] }))] }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-4 border-t border-slate-800 pt-6", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Date" }), _jsx("p", { className: "text-white font-medium", children: event.dateLabel })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Clock, { className: "h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Time" }), _jsx("p", { className: "text-white font-medium", children: event.timeLabel })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(MapPin, { className: "h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Location" }), _jsx("p", { className: "text-white font-medium", children: event.location })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Users, { className: "h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-400", children: "Attendees" }), _jsxs("p", { className: "text-white font-medium", children: [attendeeCount, " going"] })] })] })] }), event.description && (_jsxs("div", { className: "border-t border-slate-800 pt-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2", children: "About this event" }), _jsx("p", { className: "text-slate-300 leading-relaxed", children: event.description })] })), _jsxs("div", { className: "flex flex-wrap gap-3 pt-4 border-t border-slate-800", children: [_jsx(Button, { onClick: handleRsvp, className: `gap-2 ${hasRsvped ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`, children: hasRsvped ? "RSVP'd" : 'RSVP Now' }), _jsxs(Button, { onClick: handleLike, variant: "outline", className: `gap-2 ${liked ? 'border-rose-500/50 bg-rose-950/30 text-rose-400' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`, children: [_jsx(Heart, { className: `h-4 w-4 ${liked ? 'fill-current' : ''}` }), liked ? 'Liked' : 'Like'] }), _jsx(Link, { to: `/messages?topic=Event: ${encodeURIComponent(event.title)}`, children: _jsxs(Button, { variant: "outline", className: "gap-2 border-slate-700 text-slate-300 hover:bg-slate-800", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), "Discuss"] }) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsxs("div", { className: "mb-4 text-center", children: [_jsx("p", { className: "text-4xl font-bold text-white", children: attendeeCount }), _jsx("p", { className: "text-sm text-slate-400", children: "People going" })] }), _jsx(Button, { onClick: handleRsvp, className: `w-full gap-2 ${hasRsvped ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-500 hover:bg-orange-600'} text-white`, children: hasRsvped ? 'Going' : 'RSVP Now' }), _jsxs("div", { className: "mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wide", children: "Category" }), _jsx("p", { className: "text-sm text-white mt-1", children: event.category })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3", children: "Share event" }), _jsxs(Button, { variant: "outline", className: "w-full gap-2 border-slate-700 text-slate-300 hover:bg-slate-800", onClick: handleShare, children: [_jsx(Share2, { className: "h-4 w-4" }), "Share link"] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3", children: "Safety" }), _jsx("p", { className: "text-sm text-slate-300 leading-relaxed", children: "All events are community-hosted. Meet in public places and share your plans with someone you trust." })] })] })] }) })] }));
}
//# sourceMappingURL=EventDetailPage.js.map