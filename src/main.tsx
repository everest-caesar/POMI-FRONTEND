import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import App from './App'
import MarketplacePage from './pages/MarketplacePage'
import BusinessDirectoryPage from './pages/BusinessDirectoryPage'
import BusinessProfilePage from './pages/BusinessProfilePage'
import ForumPage from './pages/ForumPage'
import ForumPostPage from './pages/ForumPostPage'
import AdminAccessPage from './pages/AdminAccessPage'
import MessagesPage from './pages/MessagesPage'
import EventsPage from './pages/EventsPage'
import NewEventPage from './pages/NewEventPage'
import SupportPage from './pages/SupportPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminAccessPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/forums" element={<ForumPage />} />
        <Route path="/forums/:postId" element={<ForumPostPage />} />
        <Route path="/business" element={<BusinessDirectoryPage />} />
        <Route path="/business/:id" element={<BusinessProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/new" element={<NewEventPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)
