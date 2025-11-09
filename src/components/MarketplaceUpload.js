import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
export default function MarketplaceUpload({ listingId, onUploadComplete, maxFiles = 5, maxFileSize = 10, }) {
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [error, setError] = useState('');
    const [uploadedUrls, setUploadedUrls] = useState([]);
    // Generate preview for selected files
    const handleFileSelect = useCallback((files) => {
        if (!files)
            return;
        setError('');
        const newFiles = Array.from(files);
        // Validate file count
        if (selectedFiles.length + newFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }
        // Validate each file
        const validFiles = [];
        for (const file of newFiles) {
            // Check file size
            if (file.size > maxFileSize * 1024 * 1024) {
                setError(`File "${file.name}" exceeds ${maxFileSize}MB limit`);
                continue;
            }
            // Check file type
            if (!file.type.startsWith('image/')) {
                setError(`File "${file.name}" is not an image`);
                continue;
            }
            validFiles.push(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews((prev) => [
                    ...prev,
                    { file, preview: e.target?.result },
                ]);
            };
            reader.readAsDataURL(file);
        }
        setSelectedFiles((prev) => [...prev, ...validFiles]);
    }, [selectedFiles, maxFiles, maxFileSize]);
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileSelect(e.dataTransfer.files);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one image');
            return;
        }
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append('images', file);
            });
            if (listingId) {
                formData.append('listingId', listingId);
            }
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/v1/marketplace/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress({
                        total: percentCompleted,
                    });
                },
            });
            const urls = response.data.images || [];
            setUploadedUrls(urls);
            setSelectedFiles([]);
            setPreviews([]);
            setUploadProgress({});
            if (onUploadComplete) {
                onUploadComplete(urls);
            }
        }
        catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to upload images');
        }
        finally {
            setUploading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { onDrop: handleDrop, onDragOver: handleDragOver, onClick: () => fileInputRef.current?.click(), className: "relative border-2 border-dashed border-gray-300 hover:border-red-500 rounded-xl p-8 text-center cursor-pointer transition-all bg-gradient-to-br from-gray-50 to-gray-100 hover:from-red-50 hover:to-red-100 group", children: [_jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/*", onChange: (e) => handleFileSelect(e.target.files), className: "hidden", disabled: uploading }), _jsx("div", { className: "text-5xl mb-3 group-hover:scale-110 transition-transform", children: "\uD83D\uDCF8" }), _jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "Drag images here or click to browse" }), _jsxs("p", { className: "text-gray-600 mb-3", children: ["Upload up to ", maxFiles, " images (", maxFileSize, "MB each)"] }), _jsx("p", { className: "text-sm text-gray-500", children: "Supported formats: JPG, PNG, WebP, GIF" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 border-l-4 border-l-red-600 text-red-700 px-4 py-3 rounded-lg text-sm font-medium", children: error })), previews.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("h4", { className: "font-bold text-gray-900 flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: "\uD83D\uDCF7" }), "Selected Images (", previews.length, "/", maxFiles, ")"] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: previews.map((item, index) => (_jsxs("div", { className: "relative group rounded-lg overflow-hidden border border-gray-200 hover:border-red-500 transition-all", children: [_jsx("img", { src: item.preview, alt: `Preview ${index + 1}`, className: "w-full h-24 object-cover group-hover:scale-110 transition-transform" }), _jsxs("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2", children: [_jsxs("div", { className: "text-white text-center text-xs", children: [_jsxs("p", { className: "font-semibold truncate max-w-[60px]", children: [item.file.name.substring(0, 10), "..."] }), _jsxs("p", { className: "text-white/80", children: [(item.file.size / 1024).toFixed(1), "KB"] })] }), _jsx("button", { onClick: (e) => {
                                                e.stopPropagation();
                                                removeFile(index);
                                            }, className: "absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110", disabled: uploading, children: "\u00D7" })] })] }, `${item.file.name}-${index}`))) })] })), uploadedUrls.length > 0 && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-bold text-green-900 mb-3 flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: "\u2705" }), "Upload Successful! (", uploadedUrls.length, " images)"] }), _jsx("div", { className: "space-y-2", children: uploadedUrls.map((url, index) => (_jsx("div", { className: "bg-white p-3 rounded border border-green-200 text-sm text-gray-700 break-all hover:bg-green-50 transition-colors", children: _jsx("code", { className: "text-xs text-gray-600", children: url }) }, index))) }), _jsx("p", { className: "text-xs text-green-700 mt-3", children: "\u2139\uFE0F These URLs can now be used in your listing" })] })), previews.length > 0 && uploadedUrls.length === 0 && (_jsx("button", { onClick: handleUpload, disabled: uploading || previews.length === 0, className: "w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2", children: uploading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "animate-spin text-lg", children: "\u2699\uFE0F" }), "Uploading... ", uploadProgress.total, "%"] })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: "\uD83D\uDE80" }), "Upload ", previews.length, " Image", previews.length !== 1 ? 's' : ''] })) })), uploadedUrls.length > 0 && (_jsx("button", { onClick: () => {
                    setUploadedUrls([]);
                    setSelectedFiles([]);
                    setPreviews([]);
                    setUploadProgress({});
                }, className: "w-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 font-bold py-3 rounded-lg transition-all", children: "Upload More Images" }))] }));
}
//# sourceMappingURL=MarketplaceUpload.js.map