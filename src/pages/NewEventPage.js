"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import authService from '@/services/authService';
import { API_BASE_URL } from '@/config/api';
const categories = ['Cultural', 'Networking', 'Workshop', 'Religious', 'Social', 'Sports', 'Other'];
export default function NewEventPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        category: '',
        image: '',
    });
    const fileInputRef = useRef(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const token = authService.getToken();
        if (!token) {
            setError('Please log in to create an event.');
            setIsSubmitting(false);
            return;
        }
        if (!formData.title || !formData.description || !formData.date || !formData.startTime || !formData.location) {
            setError('Please complete all required fields.');
            setIsSubmitting(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    date: formData.date,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    category: formData.category || 'other',
                    image: formData.image || undefined,
                }),
            });
            if (!response.ok)
                throw new Error('Could not create event');
            setIsSuccess(true);
            setTimeout(() => navigate('/events'), 1400);
        }
        catch (err) {
            console.error(err);
            setError('Unable to create the event right now. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isSuccess) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Check, { className: "h-8 w-8 text-white" }) }), _jsx("h2", { className: "text-2xl font-bold mb-2", children: "Event submitted!" }), _jsx("p", { className: "text-slate-400 mb-4", children: "We'll add it to the feed as soon as it's approved." }), _jsx("p", { className: "text-sm text-slate-500", children: "Redirecting to events..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsx("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: _jsx("div", { className: "flex items-center gap-4", children: _jsx(Link, { to: "/events", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Events"] }) }) }) }) }), _jsxs("main", { className: "mx-auto max-w-2xl px-4 py-8 sm:px-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Create an Event" }), _jsx("p", { className: "text-slate-400", children: "Invite the community to your celebration, meetup, or workshop." }), error && _jsx("p", { className: "text-sm text-rose-300 mt-2", children: error })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "title", className: "text-white", children: "Title" }), _jsx(Input, { id: "title", placeholder: "Traditional Coffee Ceremony Workshop", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", className: "text-white", children: "Description" }), _jsx(Textarea, { id: "description", placeholder: "Share what attendees can expect, who should come, and any costs.", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 min-h-32", required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "date", className: "text-white", children: "Date" }), _jsx(Input, { id: "date", type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "startTime", className: "text-white", children: "Start time" }), _jsx(Input, { id: "startTime", type: "time", value: formData.startTime, onChange: (e) => setFormData({ ...formData, startTime: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400", required: true })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "endTime", className: "text-white", children: "End time" }), _jsx(Input, { id: "endTime", type: "time", value: formData.endTime, onChange: (e) => setFormData({ ...formData, endTime: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "category", className: "text-white", children: "Category" }), _jsxs("select", { id: "category", value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "mt-2 w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white", required: true, children: [_jsx("option", { value: "", children: "Select category" }), categories.map((cat) => (_jsx("option", { value: cat.toLowerCase(), children: cat }, cat)))] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "location", className: "text-white", children: "Location" }), _jsx(Input, { id: "location", placeholder: "Ottawa Community Centre", value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "image", className: "text-white", children: "Cover image URL (optional)" }), _jsx(Input, { id: "image", placeholder: "https://example.com/cover.jpg", value: formData.image, onChange: (e) => setFormData({ ...formData, image: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400", ref: fileInputRef })] }), _jsx(Button, { type: "submit", size: "lg", className: "w-full bg-orange-500 hover:bg-orange-600 text-white", disabled: isSubmitting, children: isSubmitting ? 'Submitting...' : 'Submit event' })] })] })] }));
}
//# sourceMappingURL=NewEventPage.js.map