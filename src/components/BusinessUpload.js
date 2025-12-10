import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import axiosInstance from '../utils/axios';
import authService from '../services/authService';
const CATEGORIES = [
    { value: 'retail', label: 'Retail & Shopping' },
    { value: 'restaurant', label: 'Food & Hospitality' },
    { value: 'services', label: 'Services' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'technology', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' },
];
export default function BusinessUpload({ onSuccess, onCancel, authToken }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [businessId, setBusinessId] = useState(null);
    const [formData, setFormData] = useState({
        businessName: '',
        description: '',
        category: 'retail',
        phone: '',
        email: '',
        address: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const fileInputRef = useRef(null);
    const token = authService.getToken();
    const buildHeaders = (additionalHeaders = {}) => {
        if (authToken) {
            return { ...additionalHeaders, Authorization: `Bearer ${authToken}` };
        }
        if (token) {
            return { ...additionalHeaders, Authorization: `Bearer ${token}` };
        }
        return additionalHeaders;
    };
    const fieldBaseClass = 'w-full rounded-lg border border-white/25 bg-white text-gray-900 placeholder:text-gray-500 px-4 py-2 text-sm shadow-inner focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100';
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles((prev) => [...prev, ...files]);
        // Generate previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                if (result) {
                    setFilePreviews((prev) => [...prev, result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    };
    const handleCreateBusiness = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            // Create business first
            const createResponse = await axiosInstance.post('/businesses', {
                ...formData,
            }, { headers: buildHeaders() });
            const newBusinessId = createResponse.data.business._id;
            setBusinessId(newBusinessId);
            // Reset form for next business
            setFormData({
                businessName: '',
                description: '',
                category: 'retail',
                phone: '',
                email: '',
                address: '',
            });
            // If there are images, upload them
            if (selectedFiles.length > 0) {
                await uploadImages(newBusinessId);
            }
            else {
                // No images, show publish option
                setSuccess(`Business "${formData.businessName}" created successfully! Click "Publish Now" to make it visible in the directory.`);
            }
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to create business');
        }
        finally {
            setLoading(false);
        }
    };
    const uploadImages = async (id) => {
        try {
            const uploadFormData = new FormData();
            selectedFiles.forEach((file) => {
                uploadFormData.append('images', file);
            });
            await axiosInstance.post(`/businesses/${id}/images`, uploadFormData, {
                headers: buildHeaders({
                    'Content-Type': 'multipart/form-data',
                }),
            });
            setSuccess(`Business created and images uploaded successfully! Click "Publish Now" to make it visible in the directory.`);
            setSelectedFiles([]);
            setFilePreviews([]);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to upload images');
        }
    };
    const publishBusiness = async () => {
        if (!businessId)
            return;
        setLoading(true);
        try {
            await axiosInstance.put(`/businesses/${businessId}`, { status: 'active' }, { headers: buildHeaders() });
            setSuccess(`Business published successfully! It's now visible in the directory.`);
            setBusinessId(null);
            if (onSuccess) {
                setTimeout(onSuccess, 2000);
            }
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to publish business');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "rounded-3xl border border-white/10 bg-slate-900/50 p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-6", children: "Add New Business" }), error && (_jsx("div", { className: "mb-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100", children: error })), success && businessId && (_jsxs("div", { className: "mb-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100 space-y-3", children: [_jsx("p", { children: success }), _jsx("div", { className: "flex gap-2 pt-2", children: _jsx("button", { type: "button", onClick: publishBusiness, disabled: loading, className: "rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition", children: loading ? 'Publishing...' : '✨ Publish Now' }) })] })), success && !businessId && (_jsx("div", { className: "mb-6 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100", children: success })), _jsxs("form", { onSubmit: handleCreateBusiness, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Business Name *" }), _jsx("input", { type: "text", name: "businessName", value: formData.businessName, onChange: handleInputChange, required: true, className: fieldBaseClass, placeholder: "e.g., Shega Caf\u00E9 & Bakery" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Category *" }), _jsx("select", { name: "category", value: formData.category, onChange: handleInputChange, className: `${fieldBaseClass} bg-white`, children: CATEGORIES.map((cat) => (_jsx("option", { value: cat.value, className: "bg-slate-800 text-white", children: cat.label }, cat.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Phone" }), _jsx("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleInputChange, className: fieldBaseClass, placeholder: "(613) 555-0123" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Email" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleInputChange, className: fieldBaseClass, placeholder: "contact@business.com" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Address" }), _jsx("input", { type: "text", name: "address", value: formData.address, onChange: handleInputChange, className: fieldBaseClass, placeholder: "123 Main St, Ottawa, ON" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Description *" }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleInputChange, required: true, rows: 4, className: `${fieldBaseClass} min-h-[120px] resize-none`, placeholder: "Describe the business, products/services, and what makes it unique..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-2", children: "Business Photos" }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/*", onChange: handleFileSelect, className: "hidden" }), _jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "w-full rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-4 py-8 text-center transition hover:border-white/40 hover:bg-white/10", children: [_jsx("p", { className: "text-sm font-semibold text-white", children: "Click to upload or drag and drop" }), _jsx("p", { className: "text-xs text-white/60", children: "PNG, JPG, or WebP (max 10MB each)" })] }), _jsx("p", { className: "mt-2 text-xs text-white/60", children: "Attach up to 10 photos so members can see every detail." }), filePreviews.length > 0 && (_jsx("div", { className: "mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3", children: filePreviews.map((preview, index) => (_jsxs("div", { className: "relative aspect-square rounded-lg overflow-hidden", children: [_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "h-full w-full object-cover" }), _jsx("button", { type: "button", onClick: () => removeFile(index), className: "absolute top-2 right-2 rounded-full bg-rose-500 p-2 text-white hover:bg-rose-600", children: "\u2715" })] }, index))) }))] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "submit", disabled: loading || !formData.businessName || !formData.description, className: "flex-1 rounded-lg bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition", children: loading ? 'Creating...' : 'Create Business' }), onCancel && (_jsx("button", { type: "button", onClick: onCancel, className: "px-6 py-3 rounded-lg border border-white/15 text-white font-semibold hover:bg-white/10 transition", children: "Cancel" }))] })] })] }) }));
}
//# sourceMappingURL=BusinessUpload.js.map