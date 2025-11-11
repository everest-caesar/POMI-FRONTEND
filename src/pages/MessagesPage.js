import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Messaging from '../components/Messaging';
import authService from '../services/authService';
export default function MessagesPage() {
    const navigate = useNavigate();
    const user = authService.getUserData();
    const token = authService.getToken();
    useEffect(() => {
        // Redirect to login if not authenticated
        if (!token || !user) {
            navigate('/', { replace: true, state: { requireAuth: true } });
            return;
        }
    }, [token, user, navigate]);
    if (!user) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("span", { className: "text-gray-500", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", children: [_jsx("nav", { className: "sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4", children: [_jsxs("button", { onClick: () => navigate('/'), className: "group flex items-center gap-3 hover:opacity-80 transition", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-400 text-2xl font-black text-white shadow-lg shadow-red-500/40", children: "P" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.4em] text-white/60", children: "Pomi" }), _jsx("p", { className: "text-lg font-black text-white", children: "Messages" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "text-sm text-white/70", children: ["Welcome, ", _jsx("span", { className: "font-semibold text-white", children: user.username })] }), _jsx("button", { onClick: () => {
                                        authService.removeToken();
                                        authService.clearUserData();
                                        navigate('/');
                                    }, className: "rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/20 transition", children: "Sign out" })] })] }) }), _jsx("div", { className: "mx-auto max-w-7xl px-6 py-8", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-black text-white", children: "Direct Messages" }), _jsx("p", { className: "mt-2 text-lg text-white/70", children: "Stay connected with community members and sellers" })] }), _jsx(Messaging, { currentUserId: user._id || '', currentUserName: user.username })] }) }), _jsxs("div", { className: "pointer-events-none fixed inset-0", children: [_jsx("div", { className: "absolute -top-24 -right-32 h-[420px] w-[420px] rounded-full bg-red-500/30 blur-3xl" }), _jsx("div", { className: "absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full bg-orange-500/20 blur-3xl" })] })] }));
}
//# sourceMappingURL=MessagesPage.js.map