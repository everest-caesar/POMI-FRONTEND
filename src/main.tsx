import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import App from './App'
import MarketplacePage from './pages/MarketplacePage'
import ListingDetailPage from './pages/ListingDetailPage'
import NewListingPage from './pages/NewListingPage'
import WishlistPage from './pages/WishlistPage'
import BusinessDirectoryPage from './pages/BusinessDirectoryPage'
import BusinessProfilePage from './pages/BusinessProfilePage'
import NewBusinessPage from './pages/NewBusinessPage'
import ForumPage from './pages/ForumPage'
import ForumPostPage from './pages/ForumPostPage'
import AdminAccessPage from './pages/AdminAccessPage'
import MessagesPage from './pages/MessagesPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import NewEventPage from './pages/NewEventPage'
import SupportPage from './pages/SupportPage'
import GuidesPage from './pages/GuidesPage'
import PrivacyPage from './pages/PrivacyPage'
import StandardsPage from './pages/StandardsPage'
import UserProfilePage from './pages/UserProfilePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminAccessPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/new" element={<NewListingPage />} />
          <Route path="/marketplace/wishlist" element={<WishlistPage />} />
          <Route path="/marketplace/:id" element={<ListingDetailPage />} />
          <Route path="/forums" element={<ForumPage />} />
          <Route path="/forums/:postId" element={<ForumPostPage />} />
          <Route path="/business" element={<BusinessDirectoryPage />} />
          <Route path="/business/new" element={<NewBusinessPage />} />
          <Route path="/business/:id" element={<BusinessProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/new" element={<NewEventPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/standards" element={<StandardsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
)
