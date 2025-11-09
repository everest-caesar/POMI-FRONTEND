import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import authService from '../services/authService';
const OTTAWA_AREAS = [
    'Downtown Ottawa',
    'Barrhaven',
    'Kanata',
    'Nepean',
    'Gloucester',
    'Orleans',
    'Vanier',
    'Westboro',
    'Rockcliffe Park',
    'Sandy Hill',
    'The Glebe',
    'Bytown',
    'South Ottawa',
    'North Ottawa',
    'Outside Ottawa',
];
export default function EnhancedAuthForm({ authMode, onSuccess, onClose, onModeChange, }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        age: '',
        area: '',
        workOrSchool: '',
        adminInviteCode: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAdminSignup, setIsAdminSignup] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleAuth = async () => {
        setError('');
        setLoading(true);
        let parsedAge = undefined;
        let trimmedWorkOrSchool = '';
        let trimmedAdminInviteCode = undefined;
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
                if (!formData.area) {
                    setError('Please select the area you live in');
                    setLoading(false);
                    return;
                }
                trimmedWorkOrSchool = formData.workOrSchool.trim();
                if (!trimmedWorkOrSchool) {
                    setError('Please share your school or workplace');
                    setLoading(false);
                    return;
                }
                if (isAdminSignup) {
                    trimmedAdminInviteCode = formData.adminInviteCode.trim();
                    if (!trimmedAdminInviteCode) {
                        setError('Admin invite code is required for admin registration');
                        setLoading(false);
                        return;
                    }
                }
            }
            let response;
            if (authMode === 'register') {
                response = await authService.register({
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    age: parsedAge,
                    area: formData.area,
                    workOrSchool: trimmedWorkOrSchool,
                    adminInviteCode: trimmedAdminInviteCode,
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
                        }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "Password *" }), _jsx("input", { type: "password", name: "password", placeholder: authMode === 'register' ? 'At least 6 characters' : 'Your password', value: formData.password, onChange: handleInputChange, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] }), authMode === 'register' && (_jsxs("div", { className: "animate-slideInUp", style: { animationDelay: '0.2s' }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "Age *" }), _jsx("input", { type: "number", name: "age", placeholder: "Your age (13-120)", value: formData.age, onChange: handleInputChange, min: "13", max: "120", required: true, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] })), authMode === 'register' && (_jsxs("div", { className: "animate-slideInUp", style: { animationDelay: '0.25s' }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "Area in Ottawa *" }), _jsxs("select", { name: "area", value: formData.area, onChange: handleInputChange, required: true, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm", children: [_jsx("option", { value: "", children: "Select your area..." }), OTTAWA_AREAS.map((area) => (_jsx("option", { value: area, children: area }, area)))] })] })), authMode === 'register' && (_jsxs("div", { className: "animate-slideInUp", style: { animationDelay: '0.3s' }, children: [_jsx("label", { className: "block text-gray-900 font-semibold mb-2 text-sm", children: "School or Workplace *" }), _jsx("input", { type: "text", name: "workOrSchool", placeholder: "e.g., Carleton University or Tech Startup Inc.", value: formData.workOrSchool, onChange: handleInputChange, required: true, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] })), authMode === 'register' && (_jsxs("div", { className: "animate-slideInUp", style: { animationDelay: '0.35s' }, children: [_jsxs("div", { className: "flex items-start gap-3 mb-2", children: [_jsx("input", { id: "adminSignup", type: "checkbox", checked: isAdminSignup, onChange: (event) => {
                                            setIsAdminSignup(event.target.checked);
                                            if (!event.target.checked) {
                                                setFormData((prev) => ({ ...prev, adminInviteCode: '' }));
                                            }
                                        }, className: "mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" }), _jsx("label", { htmlFor: "adminSignup", className: "text-gray-900 font-semibold text-sm", children: "Register as an Admin" })] }), _jsx("p", { className: "text-xs text-gray-600 mb-3", children: "Admin accounts require a valid invite code. Enable this only if you have been granted admin access." }), isAdminSignup && (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-gray-900 font-semibold text-sm", children: "Admin Invite Code *" }), _jsx("input", { type: "text", name: "adminInviteCode", placeholder: "Enter your admin invite code", value: formData.adminInviteCode, onChange: handleInputChange, className: "w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600" })] }))] }))] }), _jsx("button", { onClick: handleAuth, disabled: loading, className: "w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 mt-6", children: loading ? (_jsxs("span", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { className: "animate-spin", children: "\u2699\uFE0F" }), "Loading..."] })) : authMode === 'login' ? ('Sign In') : ('Create Account') }), _jsxs("div", { className: "relative my-4", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx("div", { className: "w-full border-t border-gray-300" }) }), _jsx("div", { className: "relative flex justify-center text-sm", children: _jsx("span", { className: "px-2 bg-white text-gray-600", children: "Or" }) })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-gray-900 text-sm mb-2", children: authMode === 'login'
                            ? "Don't have an account? "
                            : 'Already have an account? ' }), _jsx("button", { onClick: () => {
                            onModeChange(authMode === 'login' ? 'register' : 'login');
                            setError('');
                            setFormData({
                                email: '',
                                password: '',
                                username: '',
                                age: '',
                                area: '',
                                workOrSchool: '',
                                adminInviteCode: '',
                            });
                            setIsAdminSignup(false);
                        }, disabled: loading, className: "text-red-600 hover:text-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg hover:bg-red-50", children: authMode === 'login' ? 'Sign Up' : 'Sign In' })] })] }));
}
//# sourceMappingURL=EnhancedAuthForm.js.map