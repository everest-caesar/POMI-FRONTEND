import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import MarketplacePage from './pages/MarketplacePage'
import BusinessDirectoryPage from './pages/BusinessDirectoryPage'
import ForumPage from './pages/ForumPage'
import AdminAccessPage from './pages/AdminAccessPage'
import MessagesPage from './pages/MessagesPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminAccessPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/forums" element={<ForumPage />} />
        <Route path="/business" element={<BusinessDirectoryPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
