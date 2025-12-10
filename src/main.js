import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import MarketplacePage from './pages/MarketplacePage';
import BusinessDirectoryPage from './pages/BusinessDirectoryPage';
import ForumPage from './pages/ForumPage';
import ForumPostPage from './pages/ForumPostPage';
import AdminAccessPage from './pages/AdminAccessPage';
import MessagesPage from './pages/MessagesPage';
import EventsPage from './pages/EventsPage';
import NewEventPage from './pages/NewEventPage';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsxs(ThemeProvider, { attribute: "class", defaultTheme: "dark", enableSystem: false, children: [_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/admin/*", element: _jsx(AdminAccessPage, {}) }), _jsx(Route, { path: "/marketplace", element: _jsx(MarketplacePage, {}) }), _jsx(Route, { path: "/forums", element: _jsx(ForumPage, {}) }), _jsx(Route, { path: "/forums/:postId", element: _jsx(ForumPostPage, {}) }), _jsx(Route, { path: "/business", element: _jsx(BusinessDirectoryPage, {}) }), _jsx(Route, { path: "/messages", element: _jsx(MessagesPage, {}) }), _jsx(Route, { path: "/events", element: _jsx(EventsPage, {}) }), _jsx(Route, { path: "/events/new", element: _jsx(NewEventPage, {}) }), _jsx(Route, { path: "/*", element: _jsx(App, {}) })] }) }), _jsx(Toaster, {})] }) }));
//# sourceMappingURL=main.js.map