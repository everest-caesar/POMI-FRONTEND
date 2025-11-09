import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import MarketplacePage from './pages/MarketplacePage';
import BusinessDirectoryPage from './pages/BusinessDirectoryPage';
import ForumPage from './pages/ForumPage';
import AdminAccessPage from './pages/AdminAccessPage';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/admin/*", element: _jsx(AdminAccessPage, {}) }), _jsx(Route, { path: "/marketplace", element: _jsx(MarketplacePage, {}) }), _jsx(Route, { path: "/forums", element: _jsx(ForumPage, {}) }), _jsx(Route, { path: "/business", element: _jsx(BusinessDirectoryPage, {}) }), _jsx(Route, { path: "/*", element: _jsx(App, {}) })] }) }) }));
//# sourceMappingURL=main.js.map