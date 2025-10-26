import { useState } from 'react'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({ email: '', password: '', username: '' })

  const handleAuth = () => {
    console.log('Auth:', authMode, formData)
    setIsLoggedIn(true)
    setShowAuthModal(false)
    setFormData({ email: '', password: '', username: '' })
  }

  const modules = [
    { icon: '🎉', title: 'Events', desc: 'Discover & join community events', color: 'from-red-500 to-red-600' },
    { icon: '💼', title: 'Marketplace', desc: 'Buy, sell & trade with community', color: 'from-orange-500 to-orange-600' },
    { icon: '🏢', title: 'Business', desc: 'Find local Ethiopian businesses', color: 'from-amber-500 to-amber-600' },
    { icon: '💬', title: 'Forums', desc: 'Discuss & share knowledge', color: 'from-yellow-500 to-yellow-600' },
    { icon: '🤝', title: 'Mentorship', desc: 'Connect with mentors & guides', color: 'from-green-500 to-green-600' },
    { icon: '👥', title: 'Community', desc: 'Join groups & meet people', color: 'from-blue-500 to-blue-600' },
    { icon: '⚙️', title: 'Admin', desc: 'Manage community content', color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/40 backdrop-blur-md border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🍎</span>
            <h1 className="text-2xl font-bold text-white">Pomi</h1>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-red-400">Welcome! 👋</span>
                <button
                  onClick={() => { setIsLoggedIn(false); setFormData({ email: '', password: '', username: '' }) }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                  className="text-white hover:text-red-400 transition font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-7xl font-bold text-white mb-6 leading-tight">
            Connect, Grow & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Thrive</span>
          </h2>
          <p className="text-2xl text-gray-300 mb-8">
            Where Our Ethiopian Community Blooms in Ottawa
          </p>
          {!isLoggedIn && (
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
            >
              Join Our Community Today
            </button>
          )}
        </div>
      </header>

      {/* Modules Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h3 className="text-4xl font-bold text-white text-center mb-16">
          Discover Our 7 Pillars
        </h3>
        <div className="grid md:grid-cols-3 gap-8 lg:grid-cols-3.5">
          {modules.map((module, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-red-500/50 transition hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer transform hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 rounded-2xl transition`}></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">{module.icon}</div>
                <h4 className="text-2xl font-bold text-white mb-2">{module.title}</h4>
                <p className="text-gray-400 group-hover:text-gray-300 transition">{module.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-red-400 opacity-0 group-hover:opacity-100 transition">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700">
            <div className="text-4xl mb-4">🛡️</div>
            <h4 className="text-xl font-bold text-white mb-2">Secure</h4>
            <p className="text-gray-400">Your data is protected with JWT authentication and encrypted passwords</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700">
            <div className="text-4xl mb-4">🌍</div>
            <h4 className="text-xl font-bold text-white mb-2">Multilingual</h4>
            <p className="text-gray-400">Available in English, Amharic, Tigrinya, and Oromo languages</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700">
            <div className="text-4xl mb-4">📱</div>
            <h4 className="text-xl font-bold text-white mb-2">Responsive</h4>
            <p className="text-gray-400">Works beautifully on mobile, tablet, and desktop devices</p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Join Pomi'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-red-500 outline-none transition"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-red-500 outline-none transition"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-red-500 outline-none transition"
              />
            </div>

            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 rounded-lg transition mb-4"
            >
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </button>

            <div className="text-center">
              <p className="text-gray-400">
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-red-400 hover:text-red-300 font-semibold"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-black/40 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="text-lg mb-2">🍎 Pomi: Seed of Community, Fruit of Success</p>
          <p className="text-sm">© 2025 Ethiopian Community Hub for Ottawa. Built with ❤️ for our community.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
