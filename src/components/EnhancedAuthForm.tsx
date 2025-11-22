import { useState } from 'react'
import authService from '../services/authService'

interface EnhancedAuthFormProps {
  authMode: 'login' | 'register'
  onSuccess: (data: any) => void
  onClose: () => void
  onModeChange: (mode: 'login' | 'register') => void
}

const OTTAWA_AREAS = [
  'Downtown Ottawa',
  'Barrhaven',
  'Kanata',
  'Nepean',
  'Gloucester',
  'Orleans',
  'Vanier',
  'Westboro',
  'Rockcliffe Park',
  'Sandy Hill',
  'The Glebe',
  'Bytown',
  'South Ottawa',
  'North Ottawa',
  'Outside Ottawa',
]

export default function EnhancedAuthForm({
  authMode,
  onSuccess,
  onClose,
  onModeChange,
}: EnhancedAuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    age: '',
    area: '',
    workOrSchool: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAuth = async () => {
    setError('')
    setLoading(true)
    let parsedAge: number | undefined = undefined
    let trimmedWorkOrSchool: string | undefined = ''

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required')
        setLoading(false)
        return
      }

      if (authMode === 'register' && !formData.username) {
        setError('Full name is required')
        setLoading(false)
        return
      }

      // Email validation
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

      if (authMode === 'register') {
        if (!formData.age) {
          setError('Please tell us your age')
          setLoading(false)
          return
        }

        const ageValue = parseInt(formData.age, 10)
        if (Number.isNaN(ageValue)) {
          setError('Age must be a valid number')
          setLoading(false)
          return
        }

        if (ageValue < 13 || ageValue > 120) {
          setError('Age must be between 13 and 120')
          setLoading(false)
          return
        }
        parsedAge = ageValue

        if (!formData.area) {
          setError('Please select the area you live in')
          setLoading(false)
          return
        }

        trimmedWorkOrSchool = formData.workOrSchool.trim()
        if (!trimmedWorkOrSchool) {
          setError('Please share your school or workplace')
          setLoading(false)
          return
        }
      }

      let response
      if (authMode === 'register') {
        response = await authService.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          age: parsedAge as number,
          area: formData.area,
          workOrSchool: trimmedWorkOrSchool as string,
        })
      } else {
        response = await authService.login({
          email: formData.email,
          password: formData.password,
        })
      }

      authService.setToken(response.token)
      onSuccess(response.user)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Gradient */}
      <div className="mb-6">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
          {authMode === 'login' ? 'Welcome Back' : 'Join Our Community'}
        </h3>
        <p className="text-gray-600 text-sm mt-2 font-medium">
          {authMode === 'login'
            ? 'Sign in to your Pomi account'
            : 'Create your account to connect with Pomi community'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-600 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-slideInDown">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Full Name - Registration only */}
        {authMode === 'register' && (
          <div className="animate-slideInUp" style={{ animationDelay: '0.05s' }}>
            <label className="block text-gray-900 font-semibold mb-2 text-sm">
              Full Name *
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your full name"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600"
            />
          </div>
        )}

        {/* Email */}
        <div
          className="animate-slideInUp"
          style={{
            animationDelay: authMode === 'register' ? '0.1s' : '0.05s',
          }}
        >
          <label className="block text-gray-900 font-semibold mb-2 text-sm">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600"
          />
        </div>

        {/* Password */}
        <div
          className="animate-slideInUp"
          style={{
            animationDelay: authMode === 'register' ? '0.15s' : '0.1s',
          }}
        >
          <label className="block text-gray-900 font-semibold mb-2 text-sm">
            Password *
          </label>
          <input
            type="password"
            name="password"
            placeholder={
              authMode === 'register' ? 'At least 6 characters' : 'Your password'
            }
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600"
          />
        </div>

        {/* Age - Registration only */}
        {authMode === 'register' && (
          <div className="animate-slideInUp" style={{ animationDelay: '0.2s' }}>
            <label className="block text-gray-900 font-semibold mb-2 text-sm">
              Age *
            </label>
            <input
              type="number"
              name="age"
              placeholder="Your age (13-120)"
              value={formData.age}
              onChange={handleInputChange}
              min="13"
              max="120"
              required
              className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600"
            />
          </div>
        )}

        {/* Area - Registration only */}
        {authMode === 'register' && (
          <div className="animate-slideInUp" style={{ animationDelay: '0.25s' }}>
            <label className="block text-gray-900 font-semibold mb-2 text-sm">
              Area in Ottawa *
            </label>
            <select
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm"
            >
              <option value="">Select your area...</option>
              {OTTAWA_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Work or School - Registration only */}
        {authMode === 'register' && (
          <div className="animate-slideInUp" style={{ animationDelay: '0.3s' }}>
            <label className="block text-gray-900 font-semibold mb-2 text-sm">
              School or Workplace *
            </label>
            <input
              type="text"
              name="workOrSchool"
              placeholder="e.g., Carleton University or Tech Startup Inc."
              value={formData.workOrSchool}
              onChange={handleInputChange}
              required
              className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600"
            />
          </div>
        )}

        {authMode === 'register' && (
          <p className="text-xs text-gray-500 mt-2">
            Admin accounts are managed separately by the operations team. Complete this form only for
            community member access.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 mt-6"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⚙️</span>
            Loading...
          </span>
        ) : authMode === 'login' ? (
          'Sign In'
        ) : (
          'Create Account'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-600">Or</span>
        </div>
      </div>

      {authMode === 'login' && (
        <p className="text-center text-xs text-gray-500">
          Admin team?{' '}
          <a
            href="/admin"
            className="font-semibold text-red-600 underline decoration-red-200 underline-offset-4"
          >
            Open the secure console
          </a>
          .
        </p>
      )}

      {/* Mode Toggle */}
      <div className="text-center">
        <p className="text-gray-900 text-sm mb-2">
          {authMode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
        </p>
        <button
          onClick={() => {
            onModeChange(authMode === 'login' ? 'register' : 'login')
            setError('')
            setFormData({
              email: '',
              password: '',
              username: '',
              age: '',
              area: '',
              workOrSchool: '',
            })
          }}
          disabled={loading}
          className="text-red-600 hover:text-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
        >
          {authMode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
