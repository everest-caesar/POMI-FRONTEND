import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import axiosInstance from '../utils/axios';
const CATEGORIES = [
    { value: 'cultural', label: 'Cultural' },
    { value: 'social', label: 'Social' },
    { value: 'educational', label: 'Educational' },
    { value: 'business', label: 'Business' },
    { value: 'sports', label: 'Sports' },
    { value: 'faith', label: 'Faith & Spirituality' },
    { value: 'other', label: 'Other' },
];
export default function EventCreationForm({ onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
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
        socialMediaLink: '',
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            // Client-side validation
            if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.startTime || !formData.endTime) {
                setError('All fields are required');
                setLoading(false);
                return;
            }
            if (formData.title.length < 3) {
                setError('Title must be at least 3 characters');
                setLoading(false);
                return;
            }
            if (formData.description.length < 10) {
                setError('Description must be at least 10 characters');
                setLoading(false);
                return;
            }
            if (formData.location.length < 3) {
                setError('Location must be at least 3 characters');
                setLoading(false);
                return;
            }
            // Check if date is in the future
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                setError('Event date must be in the future');
                setLoading(false);
                return;
            }
            // Create event
            const createResponse = await axiosInstance.post('/events', {
                ...formData,
                maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,
            });
            setSuccess('Event created successfully and published immediately!');
            // Reset form
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
                socialMediaLink: '',
            });
            // Call onSuccess after a short delay
            if (onSuccess) {
                setTimeout(onSuccess, 2000);
            }
        }
        catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to create event');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "rounded-3xl border border-white/10 bg-slate-900/50 p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Create New Event" }), error && (_jsx("div", { className: "mb-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100", children: error })), success && (_jsx("div", { className: "mb-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100", children: success })), _jsxs("form", { onSubmit: handleCreateEvent, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Title *" }), _jsx("input", { type: "text", name: "title", value: formData.title, onChange: handleInputChange, required: true, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none", placeholder: "e.g., Enkutatash Celebration 2025" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Category *" }), _jsx("select", { name: "category", value: formData.category, onChange: handleInputChange, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none", children: CATEGORIES.map((cat) => (_jsx("option", { value: cat.value, className: "bg-slate-800 text-white", children: cat.label }, cat.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Date *" }), _jsx("input", { type: "date", name: "date", value: formData.date, onChange: handleInputChange, required: true, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Location *" }), _jsx("input", { type: "text", name: "location", value: formData.location, onChange: handleInputChange, required: true, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none", placeholder: "e.g., Parliament Hill, Ottawa" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Start Time *" }), _jsx("input", { type: "time", name: "startTime", value: formData.startTime, onChange: handleInputChange, required: true, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "End Time *" }), _jsx("input", { type: "time", name: "endTime", value: formData.endTime, onChange: handleInputChange, required: true, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white focus:border-rose-300 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Max Attendees" }), _jsx("input", { type: "number", name: "maxAttendees", value: formData.maxAttendees, onChange: handleInputChange, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none", placeholder: "Leave blank for unlimited", min: "1" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Ticket Link" }), _jsx("input", { type: "url", name: "ticketLink", value: formData.ticketLink, onChange: handleInputChange, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none", placeholder: "https://example.com/tickets" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Social Media Link" }), _jsx("input", { type: "url", name: "socialMediaLink", value: formData.socialMediaLink, onChange: handleInputChange, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none", placeholder: "https://instagram.com/event or https://facebook.com/event" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Description *" }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleInputChange, required: true, rows: 4, className: "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-white placeholder:text-white/40 focus:border-rose-300 focus:outline-none", placeholder: "Tell the community what this event is about..." })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "submit", disabled: loading, className: "flex-1 rounded-lg bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition", children: loading ? 'Creating...' : 'Create Event' }), onCancel && (_jsx("button", { type: "button", onClick: onCancel, className: "px-6 py-3 rounded-lg border border-white/15 text-white font-semibold hover:bg-white/10 transition", children: "Cancel" }))] })] })] }) }));
}
//# sourceMappingURL=EventCreationForm.js.map