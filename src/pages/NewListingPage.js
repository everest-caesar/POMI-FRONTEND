"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, CheckCircle, DollarSign } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import authService from "@/services/authService";
const CATEGORIES = [
    { value: "electronics", label: "Electronics" },
    { value: "furniture", label: "Furniture" },
    { value: "clothing", label: "Clothing & Fashion" },
    { value: "home", label: "Home & Kitchen" },
    { value: "books", label: "Books & Learning" },
    { value: "services", label: "Services" },
    { value: "sports", label: "Sports & Hobbies" },
    { value: "vehicles", label: "Vehicles" },
    { value: "other", label: "Other" },
];
const CONDITIONS = [
    { value: "new", label: "Brand New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
];
export default function NewListingPage() {
    const navigate = useNavigate();
    const token = authService.getToken();
    const isAdmin = Boolean(authService.getUserData()?.isAdmin);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [uploadingImages, setUploadingImages] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "electronics",
        location: "",
        condition: "good",
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleImageSelect = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length + selectedImages.length > 10) {
            setError("Maximum of 10 images allowed per listing");
            return;
        }
        const validFiles = [];
        files.forEach((file) => {
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                setError(`${file.name} has an unsupported format. Use JPEG, PNG, or WebP.`);
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError(`${file.name} is larger than 10MB. Please compress and retry.`);
                return;
            }
            validFiles.push(file);
        });
        if (validFiles.length === 0)
            return;
        setSelectedImages((prev) => [...prev, ...validFiles]);
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };
    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, idx) => idx !== index));
        setImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
    };
    const uploadImages = async () => {
        if (selectedImages.length === 0) {
            return;
        }
        try {
            setUploadingImages(true);
            const form = new FormData();
            selectedImages.forEach((file) => form.append("images", file));
            const response = await fetch(`${API_BASE_URL}/marketplace/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: form,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Image upload failed");
            }
            const data = await response.json();
            setUploadedImageUrls(data.images);
            setSelectedImages([]);
            setImagePreviews([]);
            setError("");
        }
        catch (err) {
            setError(err.message || "Unable to upload images right now");
        }
        finally {
            setUploadingImages(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!token) {
            setError("Please sign in to create a listing");
            setLoading(false);
            return;
        }
        if (!formData.title || !formData.description || !formData.price) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
        }
        if (formData.title.trim().length < 5) {
            setError("Title must be at least 5 characters");
            setLoading(false);
            return;
        }
        if (formData.description.trim().length < 10) {
            setError("Description must be at least 10 characters");
            setLoading(false);
            return;
        }
        const priceValue = parseFloat(formData.price);
        if (Number.isNaN(priceValue) || priceValue < 0) {
            setError("Enter a valid price");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/marketplace/listings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    price: priceValue,
                    images: uploadedImageUrls,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create listing");
            }
            setSuccess(true);
            setTimeout(() => {
                navigate("/marketplace");
            }, 2000);
        }
        catch (err) {
            setError(err.message || "An error occurred. Please try again.");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    if (!token) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("p", { className: "text-lg font-semibold", children: "Sign in required" }), _jsx("p", { className: "text-slate-400", children: "You need to be signed in to create a listing." }), _jsx(Link, { to: "/marketplace", children: _jsx(Button, { className: "bg-orange-500 hover:bg-orange-600 text-white", children: "Back to marketplace" }) })] }) }));
    }
    if (success) {
        return (_jsx("div", { className: "min-h-screen bg-slate-950 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(CheckCircle, { className: "h-8 w-8 text-white" }) }), _jsx("h2", { className: "text-2xl font-bold mb-2", children: "Listing created!" }), _jsx("p", { className: "text-slate-400 mb-4", children: isAdmin
                            ? "Your listing is now live."
                            : "Your listing has been submitted for admin review." }), _jsx("p", { className: "text-sm text-slate-500", children: "Redirecting to marketplace..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-white", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg", children: _jsxs("div", { className: "mx-auto flex h-16 max-w-4xl items-center gap-4 px-4", children: [_jsx(Link, { to: "/marketplace", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 text-slate-300 hover:text-white hover:bg-slate-800", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back"] }) }), _jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-600", children: _jsx("span", { className: "text-lg font-bold text-white", children: "P" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-medium uppercase tracking-wider text-slate-400", children: "POMI" }), _jsx("p", { className: "text-sm font-semibold text-white", children: "Create Listing" })] })] })] }) }), _jsxs("main", { className: "max-w-4xl mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 mb-2", children: "Marketplace" }), _jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Create a Listing" }), _jsx("p", { className: "text-slate-400", children: "Share something with the community. Great photos and clear details help your listing shine." })] }), error && (_jsx("div", { className: "mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300", children: error })), !isAdmin && (_jsx("div", { className: "mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4", children: _jsxs("p", { className: "text-sm text-amber-300", children: [_jsx("strong", { children: "Note:" }), " All listings are reviewed by our admin team before going live. This helps ensure quality and safety for the community."] }) })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "title", className: "text-white", children: "Item Title *" }), _jsx(Input, { id: "title", name: "title", value: formData.title, onChange: handleChange, placeholder: "e.g., iPhone 14 Pro - Like New", className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "price", className: "text-white", children: "Price (CAD) *" }), _jsxs("div", { className: "relative mt-2", children: [_jsx(DollarSign, { className: "absolute left-3 top-3 h-4 w-4 text-slate-400" }), _jsx(Input, { id: "price", name: "price", type: "number", min: "0", step: "0.01", value: formData.price, onChange: handleChange, placeholder: "0.00", className: "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pl-8", required: true })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "category", className: "text-white", children: "Category *" }), _jsx("select", { id: "category", name: "category", value: formData.category, onChange: handleChange, className: "mt-2 w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white", required: true, children: CATEGORIES.map((cat) => (_jsx("option", { value: cat.value, children: cat.label }, cat.value))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "condition", className: "text-white", children: "Condition" }), _jsx("select", { id: "condition", name: "condition", value: formData.condition, onChange: handleChange, className: "mt-2 w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white", children: CONDITIONS.map((cond) => (_jsx("option", { value: cond.value, children: cond.label }, cond.value))) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "location", className: "text-white", children: "Location" }), _jsx(Input, { id: "location", name: "location", value: formData.location, onChange: handleChange, placeholder: "e.g., Downtown Ottawa", className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx(Label, { htmlFor: "description", className: "text-white", children: "Description *" }), _jsx("textarea", { id: "description", name: "description", value: formData.description, onChange: handleChange, placeholder: "Describe your item - condition, features, reason for selling, etc.", rows: 5, className: "mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none resize-none", required: true })] })] }) }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-6", children: [_jsx(Label, { className: "text-white mb-4 block", children: "Photos (Optional)" }), _jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "w-full rounded-lg border-2 border-dashed border-slate-700 p-8 text-center cursor-pointer hover:border-orange-500 transition-colors bg-slate-900/40", children: [_jsx(Upload, { className: "h-8 w-8 text-slate-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-slate-300", children: "Click to upload or drag and drop" }), _jsx("p", { className: "text-xs text-slate-500", children: "JPEG, PNG, WebP up to 10MB (max 10 images)" })] }), _jsx("input", { ref: fileInputRef, type: "file", className: "hidden", accept: "image/jpeg,image/png,image/webp", multiple: true, onChange: handleImageSelect }), imagePreviews.length > 0 && (_jsx("div", { className: "mt-4 grid grid-cols-4 gap-3", children: imagePreviews.map((preview, idx) => (_jsxs("div", { className: "relative", children: [_jsx("img", { src: preview, alt: `Preview ${idx + 1}`, className: "h-24 w-full rounded-lg object-cover" }), _jsx("button", { type: "button", onClick: () => removeImage(idx), className: "absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white hover:bg-black/80", children: "x" })] }, idx))) })), selectedImages.length > 0 && (_jsx(Button, { type: "button", onClick: uploadImages, disabled: uploadingImages, className: "mt-4 bg-slate-700 hover:bg-slate-600 text-white", children: uploadingImages ? "Uploading..." : "Upload selected images" })), uploadedImageUrls.length > 0 && (_jsxs("p", { className: "mt-3 text-xs font-semibold text-emerald-400", children: [uploadedImageUrls.length, " image", uploadedImageUrls.length > 1 && "s", " ready to publish"] }))] }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Link, { to: "/marketplace", className: "flex-1", children: _jsx(Button, { type: "button", variant: "outline", className: "w-full border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent", children: "Cancel" }) }), _jsx(Button, { type: "submit", className: "flex-1 bg-orange-500 hover:bg-orange-600 text-white", disabled: loading, children: loading ? "Creating..." : "Create Listing" })] })] })] })] }));
}
//# sourceMappingURL=NewListingPage.js.map