import { useState, useMemo } from 'react'
import authService from '../services/authService'

interface EnhancedAuthFormProps {
  authMode: 'login' | 'register'
  onSuccess: (data: any) => void
  onClose: () => void
  onModeChange: (mode: 'login' | 'register') => void
}

interface PasswordRequirement {
  label: string
  met: boolean
}

function validatePasswordStrength(password: string): PasswordRequirement[] {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
  ]
}

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
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [step, setStep] = useState<'credentials' | 'verify'>('credentials')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  const passwordRequirements = useMemo(
    () => validatePasswordStrength(formData.password),
    [formData.password]
  )
  const isPasswordStrong = passwordRequirements.every((req) => req.met)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAuth = async () => {
    setError('')
    setSuccessMessage('')
    setLoading(true)
    let parsedAge: number | undefined = undefined

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

      // Strong password validation for registration
      if (authMode === 'register' && !isPasswordStrong) {
        const unmetRequirements = passwordRequirements.filter((r) => !r.met)
        setError(`Password requirements: ${unmetRequirements.map((r) => r.label).join(', ')}`)
        setLoading(false)
        return
      }

      // Basic password length check for login
      if (authMode === 'login' && formData.password.length < 6) {
        setError('Please enter your password')
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
      }

      if (authMode === 'register') {
        // Registration - direct login after success
        const response = await authService.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          age: parsedAge as number,
        })
        authService.setToken(response.token)
        onSuccess(response.user)
        onClose()
      } else {
        // Login - Step 1: Password verification, sends 2FA code
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        })

        if (response.requiresVerification) {
          // Move to verification step
          setPendingEmail(response.email || formData.email)
          setStep('verify')
          setSuccessMessage('A verification code has been sent to your email')
        } else if (response.token && response.user) {
          // Direct login (fallback if 2FA is disabled)
          authService.setToken(response.token)
          onSuccess(response.user)
          onClose()
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter the 6-digit verification code')
        setLoading(false)
        return
      }

      const response = await authService.verifyLoginCode({
        email: pendingEmail,
        code: verificationCode,
      })

      authService.setToken(response.token)
      onSuccess(response.user)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      // Re-submit login to get a new code
      await authService.login({
        email: formData.email,
        password: formData.password,
      })
      setSuccessMessage('A new verification code has been sent to your email')
      setVerificationCode('')
    } catch (err: any) {
      setError(err.message || 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setStep('credentials')
    setVerificationCode('')
    setPendingEmail('')
    setError('')
    setSuccessMessage('')
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', username: '', age: '' })
    setVerificationCode('')
    setPendingEmail('')
    setStep('credentials')
    setError('')
    setSuccessMessage('')
    setShowPasswordRequirements(false)
  }

  // Verification Code Step UI
  if (step === 'verify') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Verify Your Identity
          </h3>
          <p className="text-gray-600 text-sm mt-2 font-medium">
            Enter the 6-digit code sent to {pendingEmail}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 border-l-4 border-l-green-600 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-600 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Verification Code Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-gray-900 font-semibold mb-2 text-sm">
              Verification Code *
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-gray-50 text-gray-900 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-lg text-center tracking-[0.5em] font-mono placeholder:tracking-normal placeholder:text-sm"
              autoFocus
            />
          </div>

          <p className="text-xs text-gray-500">
            The code will expire in 10 minutes. Check your spam folder if you don't see it.
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyCode}
          disabled={loading || verificationCode.length !== 6}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 mt-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚙️</span>
              Verifying...
            </span>
          ) : (
            'Verify & Sign In'
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center space-y-2">
          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm underline underline-offset-2"
          >
            Resend verification code
          </button>

          <div>
            <button
              onClick={handleBackToLogin}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Credentials Step UI (Login/Register)
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
              authMode === 'register' ? 'Create a strong password' : 'Your password'
            }
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => authMode === 'register' && setShowPasswordRequirements(true)}
            onBlur={() => setTimeout(() => setShowPasswordRequirements(false), 200)}
            className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition text-sm placeholder:text-gray-600"
          />
          {/* Password requirements - registration only */}
          {authMode === 'register' && (showPasswordRequirements || formData.password) && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Password must include:</p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li
                    key={index}
                    className={`text-xs flex items-center gap-2 ${
                      req.met ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      req.met ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {req.met ? '✓' : '○'}
                    </span>
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
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

        {authMode === 'register' && (
          <p className="text-xs text-gray-500 mt-2">
            Admin accounts are managed separately by the operations team. Complete this form only for
            community member access.
          </p>
        )}

        {authMode === 'login' && (
          <p className="text-xs text-gray-500 mt-2">
            A verification code will be sent to your email for secure login.
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
            {authMode === 'login' ? 'Sending Code...' : 'Creating Account...'}
          </span>
        ) : authMode === 'login' ? (
          'Continue'
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
            resetForm()
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
