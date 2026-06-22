import { HashRouter, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'

import { Home } from './pages/Home'
import { Barter } from './pages/Barter'
import { Auction } from './pages/Auction'
import { Marketplace } from './pages/Marketplace'
import { PostItem } from './pages/PostItem'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { ListingDetail } from './pages/ListingDetail'
import { AuctionDetail } from './pages/AuctionDetail'
import { NotFound } from './pages/NotFound'

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        {/* HashRouter keeps GitHub Pages happy: no server config, no refresh 404s. */}
        <HashRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/barter" element={<Barter />} />
                <Route path="/auction" element={<Auction />} />
                <Route path="/auction/:id" element={<AuctionDetail />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/item/:id" element={<ListingDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/post"
                  element={
                    <ProtectedRoute>
                      <PostItem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/:type"
                  element={
                    <ProtectedRoute>
                      <PostItem />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}
