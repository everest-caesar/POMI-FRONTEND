"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Calendar, MapPin, Users, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authService from '@/services/authService';
import { API_BASE_URL } from '@/config/api';
const categories = ['All Events', 'Cultural', 'Networking', 'Workshop', 'Religious', 'Social', 'Sports'];
const formatDateLabel = (value) => {
    if (!value)
        return 'Date coming soon';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const titleCase = (value) => {
    if (!value)
        return 'General';
    return value.charAt(0).toUpperCase() + value.slice(1);
};
export default function EventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Events');
    const [rsvpEvents, setRsvpEvents] = useState([]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterState, setFilterState] = useState({
        featuredOnly: false,
        rsvpOpenOnly: false,
    });
    useEffect(() => {
        const stored = localStorage.getItem('pomi-rsvp');
        if (stored) {
            try {
                setRsvpEvents(JSON.parse(stored));
            }
            catch {
                setRsvpEvents([]);
            }
        }
    }, []);
    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/events`);
                if (!response.ok)
                    throw new Error('Unable to load events');
                const data = await response.json();
                const normalized = (data.events || data.data || []).map((event, index) => ({
                    id: event._id || event.id || `event-${index}`,
                    title: event.title ?? 'Community gathering',
                    dateLabel: formatDateLabel(event.date),
                    timeLabel: event.startTime && event.endTime
                        ? `${event.startTime} - ${event.endTime}`
                        : event.startTime || event.endTime || 'Time announced soon',
                    location: event.location || 'Location coming soon',
                    attendees: Array.isArray(event.attendees) ? event.attendees.length : Number(event.attendees) || 0,
                    image: event.image || '/placeholder.jpg',
                    category: titleCase(event.category),
                    description: event.description,
                    isFeatured: Boolean(event.isFeatured) || index === 0,
                    rsvpOpen: event.moderationStatus ? event.moderationStatus === 'approved' : true,
                }));
                setEvents(normalized);
            }
            catch (err) {
                console.error(err);
                setError('We could not reach the events backend.');
                setEvents([]);
            }
            finally {
                setLoading(false);
            }
        };
        void loadEvents();
    }, []);
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All Events' || event.category === activeCategory;
            const matchesFeatured = filterState.featuredOnly ? event.isFeatured : true;
            const matchesRsvp = filterState.rsvpOpenOnly ? event.rsvpOpen !== false : true;
            return matchesSearch && matchesCategory && matchesFeatured && matchesRsvp;
        });
    }, [activeCategory, events, filterState, searchQuery]);
    const toggleRsvp = async (id) => {
        const token = authService.getToken();
        if (!token) {
            setError('Please log in to RSVP for events.');
            return;
        }
        const already = rsvpEvents.includes(id);
        setRsvpEvents((prev) => {
            const next = already ? prev.filter((entry) => entry !== id) : [...prev, id];
            localStorage.setItem('pomi-rsvp', JSON.stringify(next));
            return next;
        });
        setEvents((prev) => prev.map((event) => event.id === id ? { ...event, attendees: Math.max(0, event.attendees + (already ? -1 : 1)) } : event));
        try {
            const method = already ? 'DELETE' : 'POST';
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
    const featuredEvent = filteredEvents.find((event) => event.isFeatured) || filteredEvents[0];
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", onClick: () => navigate(-1), children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "Pomi" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Events" })] })] })] }), _jsx(Link, { to: "/events/new", children: _jsxs(Button, { size: "sm", className: "gap-2 bg-orange-500 hover:bg-orange-600 text-white", children: [_jsx(Plus, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Create Event" })] }) })] }) }), _jsxs("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Community Events" }), _jsx("p", { className: "text-slate-400", children: "Find cultural celebrations, community gatherings, and networking meetups near you." }), error && _jsx("p", { className: "text-sm text-rose-300 mt-2", children: error })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" }), _jsx(Input, { placeholder: "Search events...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-11 h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-orange-500" })] }), _jsxs(Button, { variant: filtersOpen ? 'default' : 'outline', className: "h-12 gap-2 border-slate-700 text-slate-50 bg-slate-800/60 hover:bg-slate-800", onClick: () => setFiltersOpen((prev) => !prev), children: [_jsx(Filter, { className: "h-4 w-4" }), "Filters"] })] }), filtersOpen && (_jsxs("div", { className: "mb-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-3", children: [_jsxs("label", { className: "flex items-center gap-3 text-sm text-slate-200", children: [_jsx("input", { type: "checkbox", checked: filterState.featuredOnly, onChange: (e) => setFilterState((prev) => ({ ...prev, featuredOnly: e.target.checked })), className: "h-4 w-4 rounded border-slate-700 bg-slate-800" }), "Show featured spotlights only"] }), _jsxs("label", { className: "flex items-center gap-3 text-sm text-slate-200", children: [_jsx("input", { type: "checkbox", checked: filterState.rsvpOpenOnly, onChange: (e) => setFilterState((prev) => ({ ...prev, rsvpOpenOnly: e.target.checked })), className: "h-4 w-4 rounded border-slate-700 bg-slate-800" }), "Accepting RSVPs now"] }), _jsx(Button, { variant: "ghost", className: "justify-start text-slate-300 hover:text-white", onClick: () => setFilterState({ featuredOnly: false, rsvpOpenOnly: false }), children: "Reset filters" })] })), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide", children: categories.map((cat) => (_jsx("button", { onClick: () => setActiveCategory(cat), className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`, children: cat }, cat))) }), loading ? (_jsx("div", { className: "mb-8 h-72 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse" })) : (featuredEvent && (_jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-lg font-semibold text-white mb-4", children: "Featured Event" }), _jsxs("div", { className: "relative rounded-2xl overflow-hidden", children: [_jsx("img", { src: featuredEvent.image || '/placeholder.svg', alt: featuredEvent.title, className: "h-72 w-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-6 text-white", children: [_jsx("span", { className: "mb-2 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold", children: featuredEvent.category }), _jsx("h3", { className: "text-3xl font-bold", children: featuredEvent.title }), _jsx("p", { className: "mt-2 text-sm text-white/80", children: featuredEvent.description }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-4 text-sm text-white/80", children: [_jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4" }), featuredEvent.dateLabel] }), _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4" }), featuredEvent.timeLabel] }), _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4" }), featuredEvent.location] })] })] })] })] }))), loading ? (_jsx("div", { className: "grid gap-6 md:grid-cols-2", children: Array.from({ length: 4 }).map((_, index) => (_jsx("div", { className: "h-64 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse" }, index))) })) : filteredEvents.length === 0 ? (_jsx("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400", children: "No events match your filters right now. Try adjusting categories or check back soon." })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2", children: filteredEvents.map((event) => (_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-slate-400", children: event.category }), _jsx("h3", { className: "text-xl font-bold text-white", children: event.title })] }), _jsx("p", { className: "text-sm text-slate-400 line-clamp-3", children: event.description || 'Details coming soon.' }), _jsxs("div", { className: "space-y-2 text-sm text-slate-300", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-slate-500" }), event.dateLabel] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-slate-500" }), event.timeLabel] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "h-4 w-4 text-slate-500" }), event.location] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4 text-slate-500" }), event.attendees, " attending"] })] }), _jsx(Button, { variant: rsvpEvents.includes(event.id) ? 'secondary' : 'default', className: "w-full bg-orange-500 hover:bg-orange-600 text-white", onClick: () => toggleRsvp(event.id), disabled: event.rsvpOpen === false, children: rsvpEvents.includes(event.id) ? 'RSVP\'d' : 'RSVP' })] }, event.id))) }))] })] }));
}
//# sourceMappingURL=EventsPage.js.map