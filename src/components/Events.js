import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const getStoredUserId = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const stored = localStorage.getItem('userData');
        if (!stored) {
            return null;
        }
        const parsed = JSON.parse(stored);
        return parsed?._id ?? parsed?.id ?? null;
    }
    catch {
        return null;
    }
};
export default function Events({ onClose, token, isAdmin = false, onRequestAdmin }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [category, setCategory] = useState('all');
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        category: 'cultural',
        maxAttendees: '',
        price: '',
        ticketLink: '',
    });
    useEffect(() => {
        fetchEvents();
    }, [category]);
    useEffect(() => {
        if (!selectedEvent) {
            return;
        }
        const latest = events.find((event) => event._id === selectedEvent._id);
        if (latest && latest !== selectedEvent) {
            setSelectedEvent(latest);
        }
    }, [events, selectedEvent]);
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const url = category === 'all'
                ? `http://localhost:3000/api/v1/events`
                : `http://localhost:3000/api/v1/events?category=${category}`;
            const headers = token
                ? { Authorization: `Bearer ${token}` }
                : undefined;
            const response = await fetch(url, {
                headers,
            });
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            setEvents(data.events || data.data || []);
            setError('');
        }
        catch (err) {
            setError(err.message || 'Failed to load events');
            setEvents([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setError('');
        if (!token) {
            setError('Please log in to submit an event');
            return;
        }
        // Client-side validation
        if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.startTime || !formData.endTime) {
            setError('All fields are required');
            return;
        }
        if (formData.title.length < 3) {
            setError('Title must be at least 3 characters');
            return;
        }
        if (formData.description.length < 10) {
            setError('Description must be at least 10 characters');
            return;
        }
        if (formData.location.length < 3) {
            setError('Location must be at least 3 characters');
            return;
        }
        // Check if date is in the future
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            setError('Event date must be in the future');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/v1/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create event');
            }
            // Success - reset form and close
            setFormData({
                title: '',
                description: '',
                location: '',
                date: '',
                startTime: '',
                endTime: '',
                category: 'cultural',
                maxAttendees: '',
                price: '',
                ticketLink: '',
            });
            setShowForm(false);
            setSubmissionMessage(isAdmin
                ? 'Event published successfully.'
                : 'Thanks! Your event was sent to the admin team for approval.');
            await fetchEvents();
        }
        catch (err) {
            setError(err.message);
        }
    };
    const openTicketLink = (link, e) => {
        if (e) {
            e.stopPropagation();
        }
        if (link) {
            window.open(link, '_blank');
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };
    if (selectedEvent) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("button", { onClick: () => setSelectedEvent(null), className: "text-red-600 hover:text-red-700 font-bold", children: "\u2190 Back to Events" }), _jsxs("div", { className: "bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-8", children: [_jsx("h2", { className: "text-4xl font-bold text-gray-900 mb-4", children: selectedEvent.title }), _jsx("p", { className: "mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700", children: "\u2705 Reviewed by the Pomi admin team" }), _jsx("p", { className: "text-lg text-gray-600 mb-6", children: selectedEvent.description }), _jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-700 mb-2", children: "\uD83D\uDCC5 Date" }), _jsx("p", { className: "text-gray-600", children: formatDate(selectedEvent.date) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-700 mb-2", children: "\u23F0 Time" }), _jsxs("p", { className: "text-gray-600", children: [selectedEvent.startTime, " - ", selectedEvent.endTime] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-700 mb-2", children: "\uD83D\uDCCD Location" }), _jsx("p", { className: "text-gray-600", children: selectedEvent.location })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-700 mb-2", children: "\uD83C\uDFF7\uFE0F Category" }), _jsx("p", { className: "text-gray-600 capitalize", children: selectedEvent.category })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-700 mb-2", children: "\uD83D\uDCB0 Price" }), selectedEvent.isFree ? (_jsx("p", { className: "text-green-600 font-semibold text-lg", children: "\uD83C\uDF89 Free Event" })) : (_jsxs("p", { className: "text-blue-600 font-semibold text-lg", children: ["$", (selectedEvent.price || 0) / 100, ".00"] }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-700 mb-2", children: "\uD83D\uDC64 Organizer" }), _jsx("p", { className: "text-gray-600", children: selectedEvent.organizer })] }), selectedEvent.ticketLink && (_jsx("button", { onClick: () => openTicketLink(selectedEvent.ticketLink), className: "w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2", children: "\uD83C\uDFAB Get Tickets" }))] })] })] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), submissionMessage && (_jsx("div", { className: "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800", children: submissionMessage })), _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsx("button", { onClick: () => {
                            setSubmissionMessage('');
                            setError('');
                            setShowForm((prev) => !prev);
                        }, disabled: !token, className: "rounded-full bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60", children: "+ Create Event" }), !isAdmin && token && (_jsxs("div", { className: "flex flex-1 flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm", children: [_jsx("span", { className: "font-semibold", children: "Pending admin review" }), _jsx("span", { children: "Submit your gathering and the admin team will approve it before it appears publicly." }), onRequestAdmin && (_jsx("button", { type: "button", onClick: onRequestAdmin, className: "self-start rounded-full border border-amber-300 bg-white/90 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-white", children: "Message the admin team" }))] })), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "px-4 py-3 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none", children: [_jsx("option", { value: "all", children: "All Categories" }), _jsx("option", { value: "cultural", children: "Cultural" }), _jsx("option", { value: "business", children: "Business" }), _jsx("option", { value: "social", children: "Social" }), _jsx("option", { value: "educational", children: "Educational" }), _jsx("option", { value: "sports", children: "Sports" }), _jsx("option", { value: "other", children: "Other" })] })] }), token && showForm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 overflow-y-auto", children: _jsxs("form", { onSubmit: handleCreateEvent, className: "relative bg-white rounded-lg p-8 space-y-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx("button", { type: "button", onClick: () => setShowForm(false), className: "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold", children: "\u00D7" }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Create New Event" }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Event Title *" }), _jsx("input", { type: "text", required: true, value: formData.title, onChange: (e) => {
                                        setFormData({ ...formData, title: e.target.value });
                                        if (error)
                                            setError('');
                                    }, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white", placeholder: "Enter event title" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Description (min 10 characters)" }), _jsx("textarea", { value: formData.description, onChange: (e) => {
                                        setFormData({ ...formData, description: e.target.value });
                                        if (error)
                                            setError('');
                                    }, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white", placeholder: "Describe your event", rows: 3 })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Location *" }), _jsx("input", { type: "text", required: true, value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white", placeholder: "Event location" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Category *" }), _jsxs("select", { required: true, value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white", children: [_jsx("option", { value: "cultural", children: "Cultural" }), _jsx("option", { value: "business", children: "Business" }), _jsx("option", { value: "social", children: "Social" }), _jsx("option", { value: "educational", children: "Educational" }), _jsx("option", { value: "sports", children: "Sports" }), _jsx("option", { value: "other", children: "Other" })] })] })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Date * (future date)" }), _jsx("input", { type: "date", required: true, value: formData.date, onChange: (e) => {
                                                setFormData({ ...formData, date: e.target.value });
                                                if (error)
                                                    setError('');
                                            }, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Start Time *" }), _jsx("input", { type: "time", required: true, value: formData.startTime, onChange: (e) => setFormData({ ...formData, startTime: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "End Time *" }), _jsx("input", { type: "time", required: true, value: formData.endTime, onChange: (e) => setFormData({ ...formData, endTime: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white" })] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Max Attendees" }), _jsx("input", { type: "number", value: formData.maxAttendees, onChange: (e) => setFormData({ ...formData, maxAttendees: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white", placeholder: "Leave empty for unlimited", min: "1" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "Price ($ - Leave empty for free)" }), _jsx("input", { type: "number", value: formData.price, onChange: (e) => setFormData({ ...formData, price: e.target.value }), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white", placeholder: "0.00", step: "0.01", min: "0" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 font-semibold mb-2", children: "\uD83C\uDFAB Ticket Sales Link (Eventbrite, etc.) *" }), _jsx("input", { type: "url", required: true, value: formData.ticketLink, onChange: (e) => {
                                        setFormData({ ...formData, ticketLink: e.target.value });
                                        if (error)
                                            setError('');
                                    }, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-black bg-white", placeholder: "https://www.eventbrite.com/e/... or your ticket sales link" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Where attendees can purchase tickets or register for your event" })] }), _jsxs("div", { className: "flex gap-4 pt-4 border-t", children: [_jsx("button", { type: "submit", className: "bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition", children: "Create Event" }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-bold transition", children: "Cancel" })] })] }) })), loading && _jsx("p", { className: "text-gray-600", children: "Loading events..." }), !loading && events.length === 0 && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-12 text-center space-y-4", children: [_jsx("p", { className: "text-gray-600 text-lg", children: isAdmin
                            ? 'No events found. Publish the next gathering for the community!'
                            : 'Our moderators are reviewing the next round of gatherings. Check back soon or share your idea with the admin team.' }), !isAdmin && onRequestAdmin && (_jsx("button", { onClick: onRequestAdmin, className: "inline-flex items-center justify-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50", children: "Message the admin team" }))] })), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: events.map((event) => (_jsxs("div", { onClick: () => setSelectedEvent(event), className: "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900 flex-1", children: event.title }), _jsx("span", { className: "text-xs bg-red-100 text-black px-2 py-1 rounded capitalize font-semibold", children: event.category })] }), _jsx("span", { className: "mb-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-600", children: "\u2705 Admin approved" }), _jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-2", children: event.description }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600 mb-4", children: [_jsxs("p", { className: "flex items-center gap-2", children: [_jsx("span", { children: "\uD83D\uDCC5" }), formatDate(event.date)] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx("span", { children: "\u23F0" }), event.startTime, " - ", event.endTime] }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx("span", { children: "\uD83D\uDCCD" }), event.location] })] }), _jsx("div", { className: "space-y-2 mb-4", children: event.isFree ? (_jsx("p", { className: "text-sm font-semibold text-green-600", children: "\uD83C\uDF89 Free Event" })) : (_jsxs("p", { className: "text-sm font-semibold text-blue-600", children: ["$", (event.price || 0) / 100, ".00"] })) }), _jsx("div", { className: "pt-4 border-t", children: event.ticketLink ? (_jsx("button", { onClick: (e) => openTicketLink(event.ticketLink, e), className: "w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold text-sm transition flex items-center justify-center gap-2", children: "\uD83C\uDFAB Get Tickets" })) : (_jsx("p", { className: "text-sm text-gray-500 text-center italic", children: "No ticket link available" })) })] }, event._id))) })] }));
}
//# sourceMappingURL=Events.js.map