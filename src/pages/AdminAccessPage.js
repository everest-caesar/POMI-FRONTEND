import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import AdminPortal from '../components/AdminPortal';
import { API_BASE_URL } from '../config/api';
const gradientBg = 'bg-gradient-to-br from-rose-50 via-white to-amber-50 text-slate-900 min-h-screen flex flex-col';
const ADMIN_SUPPORT_EMAIL = 'support@pomi.community';
const ADMIN_TOKEN_KEY = 'adminAuthToken';
const ADMIN_USER_KEY = 'adminUserData';
export default function AdminAccessPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [adminToken, setAdminToken] = useState(() => {
        if (typeof window === 'undefined')
            return null;
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    });
    const [currentUser, setCurrentUser] = useState(() => {
        if (typeof window === 'undefined')
            return null;
        try {
            const stored = localStorage.getItem(ADMIN_USER_KEY);
            return stored ? JSON.parse(stored) : null;
        }
        catch {
            return null;
        }
    });
    const [showPortal, setShowPortal] = useState(Boolean(adminToken && currentUser?.isAdmin));
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });
    const token = useMemo(() => adminToken, [adminToken]);
    const trustSignals = [
        {
            icon: '🔐',
            title: 'Single credential control',
            body: 'Only one admin identity is active at a time. Every action is traceable.',
        },
        {
            icon: '🛡️',
            title: 'Audit-ready logging',
            body: 'Marketplace approvals, messages, and deletions are stored for compliance reviews.',
        },
        {
            icon: '📊',
            title: 'Operations handbook',
            body: 'Credential rotation and escalation steps live in the internal handbook.',
        },
        {
            icon: '🤝',
            title: 'Two-person integrity',
            body: 'Credential resets require the community lead plus one core maintainer.',
        },
    ];
    const securityChecklist = [
        'Always log out after moderating from a shared machine.',
        'Rotate the admin password immediately after large campaigns or incidents.',
        'Use the admin inbox to notify members—avoid personal email threads.',
        `Escalate suspicious access attempts to ${ADMIN_SUPPORT_EMAIL}.`,
    ];
    const continuityTimeline = [
        {
            step: '01',
            title: 'Credential rotation',
            detail: 'Planned quarterly. Emergency rotations can be triggered sooner.',
        },
        {
            step: '02',
            title: 'Marketplace audit',
            detail: 'Weekly review of pending listings, businesses, and events.',
        },
        {
            step: '03',
            title: 'Comms sync',
            detail: 'Broadcast safety or celebration notes via the admin messaging hub.',
        },
    ];
    useEffect(() => {
        if (!adminToken) {
            setCurrentUser(null);
            setShowPortal(false);
            return;
        }
        const controller = new AbortController();
        fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
            signal: controller.signal,
        })
            .then(async (response) => {
            if (!response.ok) {
                throw new Error('Session expired');
            }
            const data = await response.json();
            setCurrentUser(data.user);
            setShowPortal(Boolean(data.user?.isAdmin));
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        })
            .catch(() => {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            localStorage.removeItem(ADMIN_USER_KEY);
            setAdminToken(null);
            setCurrentUser(null);
            setShowPortal(false);
        });
        return () => controller.abort();
    }, [adminToken]);
    const resetMessages = () => {
        setError(null);
        setSuccess(null);
    };
    const handleLogout = () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        setAdminToken(null);
        setCurrentUser(null);
        setShowPortal(false);
        setSuccess('You have been signed out of the admin console.');
    };
    const handleLogin = async (event) => {
        event.preventDefault();
        resetMessages();
        setLoading(true);
        try {
            const response = await authService.adminLogin({
                email: loginForm.email.trim(),
                password: loginForm.password,
            });
            localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(response.user));
            setAdminToken(response.token);
            setCurrentUser(response.user);
            if (!response.user.isAdmin) {
                setError('Access denied. Only the designated admin credential can open the console. Please contact the community lead if you need assistance.');
                localStorage.removeItem(ADMIN_TOKEN_KEY);
                localStorage.removeItem(ADMIN_USER_KEY);
                setAdminToken(null);
                setCurrentUser(null);
                return;
            }
            setShowPortal(true);
            setSuccess('Welcome back! Launching the admin console…');
        }
        catch (err) {
            setError(err.message ||
                'Admin login failed. Confirm you are using the shared credential from the operations handbook.');
        }
        finally {
            setLoading(false);
        }
    };
    if (showPortal && token) {
        return (_jsx(AdminPortal, { token: token, onBack: () => {
                setShowPortal(false);
                setSuccess('Admin console closed. You can reopen it anytime.');
            }, onLogout: handleLogout }));
    }
    return (_jsxs("div", { className: `${gradientBg} relative overflow-hidden`, children: [_jsxs("div", { className: "pointer-events-none absolute inset-0", children: [_jsx("div", { className: "absolute -left-12 top-6 h-60 w-60 rounded-full bg-rose-500/25 blur-3xl" }), _jsx("div", { className: "absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" })] }), _jsx("header", { className: "relative border-b border-slate-200/70 bg-white/80 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 text-slate-900", children: [_jsx(Link, { to: "/", className: "inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white", children: "\u2190 Back to Pomi" }), _jsxs("div", { className: "text-xs text-slate-500", children: ["Operations desk:", ' ', _jsx("a", { href: `mailto:${ADMIN_SUPPORT_EMAIL}`, className: "font-semibold text-rose-600 underline decoration-rose-200 underline-offset-4", children: ADMIN_SUPPORT_EMAIL })] })] }) }), _jsx("main", { className: "relative mx-auto flex-1 px-6 py-12 text-slate-900", children: _jsxs("div", { className: "mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr,0.85fr]", children: [_jsxs("section", { className: "space-y-8 rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-2xl", children: [_jsxs("div", { children: [_jsx("p", { className: "inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-rose-500", children: "Admin cockpit \u2022 Trusted access only" }), _jsx("h1", { className: "mt-4 text-3xl font-black md:text-4xl", children: "Professional-grade console for Pomi operations." }), _jsx("p", { className: "mt-3 text-sm text-slate-600 md:text-base", children: "Approvals, escalations, and community broadcasts are all handled within this secure interface. The credential is distributed via the operations handbook and rotates every quarter\u2014or sooner if a security incident occurs." })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: trustSignals.map((item) => (_jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-lg shadow-slate-200", children: [_jsx("div", { className: "text-2xl", children: item.icon }), _jsx("p", { className: "mt-3 text-base font-semibold text-slate-900", children: item.title }), _jsx("p", { className: "mt-2 text-xs leading-relaxed text-slate-600", children: item.body })] }, item.title))) }), _jsxs("div", { className: "space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.4em] text-slate-500", children: "Operations rhythm" }), _jsx("div", { className: "space-y-4", children: continuityTimeline.map((item) => (_jsxs("div", { className: "flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3", children: [_jsx("div", { className: "text-2xl font-black text-slate-400", children: item.step }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-900", children: item.title }), _jsx("p", { className: "text-xs text-slate-600", children: item.detail })] })] }, item.step))) })] })] }), _jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-[32px] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl", children: [_jsxs("div", { className: "space-y-1 text-center", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.4em] text-slate-500", children: "Secure login" }), _jsx("h2", { className: "text-2xl font-black text-slate-900", children: "Unlock the admin console" }), _jsx("p", { className: "text-sm text-slate-500", children: "Use the credential from the operations handbook. Sessions automatically expire after inactivity." })] }), error && (_jsx("div", { className: "mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700", children: error })), success && (_jsx("div", { className: "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700", children: success })), _jsxs("form", { onSubmit: handleLogin, className: "mt-6 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-slate-500", children: "Admin email" }), _jsx("input", { type: "email", autoComplete: "username", required: true, value: loginForm.email, onChange: (event) => setLoginForm((prev) => ({ ...prev, email: event.target.value })), placeholder: "admin@pomi.community", className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-slate-500", children: "Password" }), _jsx("input", { type: "password", autoComplete: "current-password", required: true, value: loginForm.password, onChange: (event) => setLoginForm((prev) => ({ ...prev, password: event.target.value })), placeholder: "Enter admin password", className: "mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-inner focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", children: loading ? 'Signing in…' : 'Access admin console' }), _jsxs("p", { className: "text-center text-xs text-slate-500", children: ["Problems signing in? Email", ' ', _jsx("a", { href: `mailto:${ADMIN_SUPPORT_EMAIL}`, className: "font-semibold text-rose-500 underline decoration-rose-200 underline-offset-4", children: ADMIN_SUPPORT_EMAIL })] })] })] }), _jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl", children: [_jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-slate-600", children: "Security reminders" }), _jsx("ul", { className: "mt-4 space-y-3 text-sm text-slate-600", children: securityChecklist.map((item) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx("span", { className: "text-lg", children: "\u2714\uFE0F" }), _jsx("span", { children: item })] }, item))) })] })] })] }) })] }));
}
//# sourceMappingURL=AdminAccessPage.js.map