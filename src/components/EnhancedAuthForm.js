import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import authService from '../services/authService';
export default function EnhancedAuthForm({ authMode, onSuccess, onClose, onModeChange, }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        age: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleAuth = async () => {
        setError('');
        setLoading(true);
        let parsedAge = undefined;
        try {
            // Validation
            if (!formData.email || !formData.password) {
                setError('Email and password are required');
                setLoading(false);
                return;
            }
            if (authMode === 'register' && !formData.username) {
                setError('Full name is required');
                setLoading(false);
                return;
            }
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }
            if (authMode === 'register') {
                if (!formData.age) {
                    setError('Please tell us your age');
                    setLoading(false);
                    return;
                }
                const ageValue = parseInt(formData.age, 10);
                if (Number.isNaN(ageValue)) {
                    setError('Age must be a valid number');
                    setLoading(false);
                    return;
                }
                if (ageValue < 13 || ageValue > 120) {
                    setError('Age must be between 13 and 120');
                    setLoading(false);
                    return;
                }
                parsedAge = ageValue;
            }
            let response;
            if (authMode === 'register') {
                response = await authService.register({
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    age: parsedAge,
                });
            }
            else {
                response = await authService.login({
                    email: formData.email,
                    password: formData.password,
                });
            }
            authService.setToken(response.token);
            onSuccess(response.user);
            onClose();
        }
        catch (err) {
            setError(err.message || 'Authentication failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent", children: authMode === 'login' ? 'Welcome Back' : 'Join Our Community' }), _jsx("p", { className: "text-gray-600 text-sm mt-2 font-medium", children: authMode === 'login'
                            ? 'Sign in to your Pomi account'
                            : 'Create your account to connect with Pomi community' })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 border-l-4 border-l-red-600 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-slideInDown", children: error })), _jsxs("div", { className: "space-y-3", children: [authMode === 'register' && (_jsxs("div", { className: "animate-slideInUp", style: { animationDelay: '0.05s' }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "Full Name *" }), _jsx("input", { type: "text", name: "username", placeholder: "Enter your full name", value: formData.username, onChange: handleInputChange, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] })), _jsxs("div", { className: "animate-slideInUp", style: {
                            animationDelay: authMode === 'register' ? '0.1s' : '0.05s',
                        }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "Email Address *" }), _jsx("input", { type: "email", name: "email", placeholder: "your@email.com", value: formData.email, onChange: handleInputChange, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] }), _jsxs("div", { className: "animate-slideInUp", style: {
                            animationDelay: authMode === 'register' ? '0.15s' : '0.1s',
                        }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "Password *" }), _jsx("input", { type: "password", name: "password", placeholder: authMode === 'register' ? 'At least 6 characters' : 'Your password', value: formData.password, onChange: handleInputChange, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] }), authMode === 'register' && (_jsxs("div", { className: "animate-slideInUp", style: { animationDelay: '0.2s' }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "Age *" }), _jsx("input", { type: "number", name: "age", placeholder: "Your age (13-120)", value: formData.age, onChange: handleInputChange, min: "13", max: "120", required: true, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] })), authMode === 'register' && (_jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Admin accounts are managed separately by the operations team. Complete this form only for community member access." }))] }), _jsx("button", { onClick: handleAuth, disabled: loading, className: "w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 mt-6", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { className: "animate-spin", children: "\u2699\uFE0F" }), "Loading..."] })) : authMode === 'login' ? ('Sign In') : ('Create Account') }), _jsxs("div", { className: "relative my-4", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-white text-gray-600", children: "Or" }) })] }), authMode === 'login' && (_jsxs("p", { className: "text-center text-xs text-gray-500", children: ["Admin team?", ' ', _jsx("a", { href: "/admin", className: "font-semibold text-red-600 underline decoration-red-200 underline-offset-4", children: "Open the secure console" }), "."] })), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-900 text-sm mb-2", children: authMode === 'login'
                            ? "Don't have an account? "
                            : 'Already have an account? ' }), _jsx("button", { onClick: () => {
                            onModeChange(authMode === 'login' ? 'register' : 'login');
                            setError('');
                            setFormData({
                                email: '',
                                password: '',
                                username: '',
                                age: '',
                            });
                        }, disabled: loading, className: "text-red-600 hover:text-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg hover:bg-red-50", children: authMode === 'login' ? 'Sign Up' : 'Sign In' })] })] }));
}
//# sourceMappingURL=EnhancedAuthForm.js.map