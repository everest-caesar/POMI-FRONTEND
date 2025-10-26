import { useState } from 'react'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({ email: '', password: '', username: '' })

  const handleAuth = () => {
    if (formData.email && formData.password) {
      setIsLoggedIn(true)
      setShowAuthModal(false)
      setFormData({ email: '', password: '', username: '' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🍎</span>
            <h1 className="text-3xl font-bold text-red-600">Pomi</h1>
          </div>
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700 font-semibold">Welcome back!</span>
                <button
                  onClick={() => { setIsLoggedIn(false); setFormData({ email: '', password: '', username: '' }) }}
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
          <h2 className="text-6xl font-bold text-gray-900 mb-6">
            Where Your Ethiopian Community <span className="text-red-600">Blooms</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Pomi is your complete hub for connecting with Ottawa's Ethiopian community. Discover events, support local businesses, find mentorship, and celebrate our shared heritage.
          </p>
          {!isLoggedIn && (
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-lg font-bold text-xl transition shadow-lg"
            >
              Get Started Free
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
                Pomi (pomegranate) is more than just a platform—it's a seed of community. Like the pomegranate's many seeds, Pomi brings together many facets of Ethiopian community life in Ottawa.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Whether you're looking to connect with others, discover events, explore business opportunities, or find mentorship, Pomi is your one-stop destination for Ethiopian community engagement.
              </p>
              <p className="text-lg text-gray-600">
                Our mission is simple: connect, grow, and thrive together.
              </p>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-6">🍎</div>
              <div className="bg-red-100 rounded-lg p-8">
                <p className="text-xl font-bold text-red-600">
                  Seed of Community, Fruit of Success
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900">
                {authMode === 'login' ? 'Welcome Back' : 'Join Pomi'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-light"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-50 text-gray-900 px-5 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-lg"
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 text-gray-900 px-5 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-lg"
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-50 text-gray-900 px-5 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-lg"
              />
            </div>

            <button
              onClick={handleAuth}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition text-lg shadow-md mb-4"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-red-600 hover:text-red-700 font-bold"
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
