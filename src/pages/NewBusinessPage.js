"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/config/api";
import authService from "@/services/authService";
const CATEGORIES = [
    { value: "restaurant", label: "Food & Hospitality" },
    { value: "retail", label: "Retail & Shopping" },
    { value: "services", label: "Services" },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "entertainment", label: "Entertainment" },
    { value: "other", label: "Other" },
];
export default function NewBusinessPage() {
    const navigate = useNavigate();
    const token = authService.getToken();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        businessName: "",
        description: "",
        category: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        hours: "",
    });
    const fileInputRef = useRef(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Please sign in to submit a business listing.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/businesses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    status: "draft", // Requires admin approval
                }),
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to submit business listing");
            }
            setIsSuccess(true);
            setTimeout(() => navigate("/business"), 2000);
        }
        catch (err) {
            console.error(err);
            setError(err.message || "Unable to submit right now. Please try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!token) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("p", { className: "text-lg font-semibold", children: "Sign in required" }), _jsx("p", { className: "text-slate-400", children: "You need to be signed in to submit a business listing." }), _jsx(Link, { to: "/business", children: _jsx(Button, { className: "bg-orange-500 hover:bg-orange-600 text-white", children: "Back to directory" }) })] }) }));
    }
    if (isSuccess) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(Check, { className: "h-8 w-8 text-white" }) }), _jsx("h2", { className: "text-2xl font-bold mb-2", children: "Business submitted!" }), _jsx("p", { className: "text-slate-400 mb-4", children: "We'll verify details before it appears in the directory." }), _jsx("p", { className: "text-sm text-slate-500", children: "Redirecting to directory..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsx(Link, { to: "/business", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Directory"] }) }) }), _jsx(Link, { to: "/", className: "flex items-center gap-2", children: _jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }) })] }) }), _jsxs("main", { className: "mx-auto max-w-2xl px-4 py-8 sm:px-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 mb-2", children: "Community businesses" }), _jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "List a Business" }), _jsx("p", { className: "text-slate-400", children: "Share a local Habesha-owned business so neighbours can find and support it." }), error && (_jsx("p", { className: "text-sm text-rose-300 mt-3 bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-2", children: error }))] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "businessName", className: "text-white", children: "Business name *" }), _jsx(Input, { id: "businessName", placeholder: "e.g. Habesha Restaurant", value: formData.businessName, onChange: (e) => setFormData({ ...formData, businessName: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", className: "text-white", children: "Description *" }), _jsx(Textarea, { id: "description", placeholder: "Tell neighbours what makes this business special...", value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-32", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "category", className: "text-white", children: "Category *" }), _jsxs("select", { id: "category", value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), className: "mt-2 w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white", required: true, children: [_jsx("option", { value: "", children: "Select category" }), CATEGORIES.map((cat) => (_jsx("option", { value: cat.value, children: cat.label }, cat.value)))] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phone", className: "text-white", children: "Phone *" }), _jsx(Input, { id: "phone", placeholder: "(613) 555-0123", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500", required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "address", className: "text-white", children: "Address *" }), _jsx(Input, { id: "address", placeholder: "123 Bank Street, Ottawa, ON", value: formData.address, onChange: (e) => setFormData({ ...formData, address: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", className: "text-white", children: "Business email *" }), _jsx(Input, { id: "email", type: "email", placeholder: "contact@business.com", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "website", className: "text-white", children: "Website (optional)" }), _jsx(Input, { id: "website", placeholder: "www.business.com", value: formData.website, onChange: (e) => setFormData({ ...formData, website: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "hours", className: "text-white", children: "Business hours (optional)" }), _jsx(Input, { id: "hours", placeholder: "Mon-Fri 9am-6pm", value: formData.hours, onChange: (e) => setFormData({ ...formData, hours: e.target.value }), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" })] })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-white", children: "Logo or banner (optional)" }), _jsxs("button", { type: "button", className: "mt-2 w-full border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-slate-600 transition-colors cursor-pointer bg-slate-900/40", onClick: () => fileInputRef.current?.click(), children: [imagePreview ? (_jsx("img", { src: imagePreview, alt: "Preview", className: "h-24 mx-auto mb-2 rounded-lg object-cover" })) : (_jsx(Upload, { className: "h-8 w-8 text-slate-500 mx-auto mb-2" })), _jsx("p", { className: "text-slate-300 text-sm", children: "Click to upload or drag and drop" }), _jsx("p", { className: "text-slate-500 text-xs mt-1", children: "If you skip this step, we'll use a placeholder image." })] }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file)
                                                        return;
                                                    setFileName(file.name);
                                                    const url = URL.createObjectURL(file);
                                                    setImagePreview(url);
                                                } }), fileName && (_jsxs("p", { className: "mt-2 text-xs text-emerald-300", children: ["Selected: ", fileName] }))] })] }), _jsx("div", { className: "rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4", children: _jsxs("p", { className: "text-sm text-amber-300", children: [_jsx("strong", { children: "Note:" }), " All submissions are reviewed by our admin team before appearing in the directory. This helps ensure quality and accuracy for the community."] }) }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Link, { to: "/business", className: "flex-1", children: _jsx(Button, { type: "button", variant: "outline", className: "w-full border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent", children: "Cancel" }) }), _jsx(Button, { type: "submit", className: "flex-1 bg-orange-500 hover:bg-orange-600 text-white", disabled: isSubmitting, children: isSubmitting ? "Submitting..." : "Submit for Review" })] })] })] })] }));
}
//# sourceMappingURL=NewBusinessPage.js.map