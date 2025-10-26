import { useState, useEffect } from 'react'
import './App.css'
import authService from './services/authService'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')

  // Check if user is already logged in on mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsLoggedIn(true)
      // Optionally fetch user data
      authService.getCurrentUser()
        .then((response) => {
          setUserName(response.user.username)
        })
        .catch((error) => {
          console.error('Failed to fetch user:', error)
          // Token might be invalid, logout
          handleLogout()
        })
    }
  }, [])

  const handleAuth = async () => {
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }
      if (authMode === 'register' && !formData.username) {
        setError('Please enter your name')
        setLoading(false)
        return
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      // Call backend API
      let response
      if (authMode === 'register') {
        response = await authService.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        })
      } else {
        response = await authService.login({
          email: formData.email,
          password: formData.password,
        })
      }

      // Store token and update state
      authService.setToken(response.token)
      setUserName(response.user.username)
      setIsLoggedIn(true)
      setShowAuthModal(false)
      setFormData({ email: '', password: '', username: '' })
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.removeToken()
    setIsLoggedIn(false)
    setUserName('')
    setFormData({ email: '', password: '', username: '' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌍</span>
            <h1 className="text-3xl font-bold text-red-600">Pomi</h1>
          </div>
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700 font-semibold">Welcome, {userName}! 👋</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                  className="text-gray-700 hover:text-red-600 transition font-bold text-lg px-4 py-2"
                >
                  Login
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-6xl font-bold text-gray-900 mb-4">
            Welcome to Pomi
          </h2>
          <p className="text-2xl text-red-600 font-semibold mb-6">
            The Hub for Habesha Community in Ottawa
          </p>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with fellow Habeshas, celebrate our rich culture, and build meaningful relationships. Whether you speak Amharic, Tigrinya, or Oromo, Pomi is your digital home for community, culture, and commerce.
          </p>
          {!isLoggedIn && (
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-lg font-bold text-xl transition shadow-lg"
            >
              Join Our Community
            </button>
          )}
        </div>
      </header>

      {/* What is Pomi Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-16">
            What is Pomi?
          </h3>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-4">
                Pomi is the digital gathering place for the Habesha community in Ottawa—a space where traditions meet technology and connections flourish.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Whether you're here to celebrate Ethiopian, Eritrean, or other East African heritage, find business opportunities, discover cultural events, or simply connect with people who share your values and background—Pomi brings it all together.
              </p>
              <p className="text-lg text-gray-600">
                We believe in the strength of community. Here, language, culture, and shared experiences connect us all.
              </p>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-6">🌍</div>
              <div className="bg-red-100 rounded-lg p-8">
                <p className="text-xl font-bold text-red-600">
                  "Where Culture Meets Connection"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Why Choose Pomi?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl mb-4">🔒</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Secure & Private</h4>
              <p className="text-gray-600">
                Your data is encrypted and protected with industry-standard security. We use JWT authentication and advanced password encryption.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl mb-4">🌍</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Multilingual</h4>
              <p className="text-gray-600">
                Available in English, Amharic, Tigrinya, and Oromo. Connect in the language that feels most natural to you.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition">
              <div className="text-5xl mb-4">📱</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">Works Everywhere</h4>
              <p className="text-gray-600">
                Mobile, tablet, or desktop—Pomi works beautifully on all devices and screen sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Our 7 Pillars of Community
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-red-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Events</h4>
              <p className="text-gray-600">Discover and join community events, celebrations, and gatherings.</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">💼</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h4>
              <p className="text-gray-600">Buy, sell, and trade goods and services with community members.</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">🏢</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Business</h4>
              <p className="text-gray-600">Find and support local Ethiopian-owned businesses in Ottawa.</p>
            </div>
            <div className="bg-green-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">💬</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Forums</h4>
              <p className="text-gray-600">Discuss topics, share knowledge, and exchange ideas.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">🤝</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Mentorship</h4>
              <p className="text-gray-600">Connect with mentors and guides who can help you grow.</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">👥</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Community Groups</h4>
              <p className="text-gray-600">Join groups based on interests, skills, or goals.</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">⚙️</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Admin Tools</h4>
              <p className="text-gray-600">Manage community content and moderation features.</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-6xl mb-4">📰</div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Resources</h4>
              <p className="text-gray-600">Access guides, articles, and helpful community resources.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Join Pomi?
          </h3>
          <p className="text-xl text-white mb-8">
            Become part of Ottawa's thriving Ethiopian community today. It's free and takes just 2 minutes.
          </p>
          {!isLoggedIn && (
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
              className="bg-white hover:bg-gray-100 text-red-600 px-10 py-4 rounded-lg font-bold text-xl transition shadow-lg"
            >
              Create Your Account
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🍎</span>
                <span className="font-bold text-xl">Pomi</span>
              </div>
              <p className="text-gray-400">Seed of Community, Fruit of Success</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition">Events</a></li>
                <li><a href="#" className="hover:text-white transition">Forums</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>© 2025 Pomi - Ethiopian Community Hub for Ottawa. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {authMode === 'login' ? 'Welcome Back' : 'Join Our Community'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {authMode === 'login' ? 'Sign in to your account' : 'Create a new account to get started'}
                </p>
              </div>
              <button
                onClick={() => { setShowAuthModal(false); setError('') }}
                className="text-gray-500 hover:text-gray-700 text-3xl font-light"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              {authMode === 'register' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-gray-50 text-gray-900 px-5 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-base"
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 text-gray-900 px-5 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-base"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  placeholder={authMode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 text-gray-900 px-5 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-base"
                />
              </div>
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition text-lg shadow-md mb-4"
            >
              {loading ? 'Loading...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>

            <div className="text-center border-t pt-4">
              <p className="text-gray-600 text-sm">
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError('') }}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
