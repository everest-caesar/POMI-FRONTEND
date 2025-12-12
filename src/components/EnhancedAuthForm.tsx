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

const ageRanges = [
  { value: '18', label: '18-24' },
  { value: '25', label: '25-34' },
  { value: '35', label: '35-44' },
  { value: '45', label: '45-54' },
  { value: '55', label: '55+' },
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
    age: '25',
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
          setError('Please select your age range')
          setLoading(false)
          return
        }
        parsedAge = parseInt(formData.age, 10)
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
    setFormData({ email: '', password: '', username: '', age: '25' })
    setVerificationCode('')
    setPendingEmail('')
    setStep('credentials')
    setError('')
    setSuccessMessage('')
    setShowPasswordRequirements(false)
  }

  // Verification Code Step UI - Dark Theme
  if (step === 'verify') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white">
            Verify Your Identity
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            Enter the 6-digit code sent to {pendingEmail}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-rose-600/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {/* Verification Code Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-200 font-medium mb-2 text-sm">
              Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white text-lg text-center tracking-[0.5em] font-mono placeholder:tracking-normal placeholder:text-sm placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
          </div>

          <p className="text-xs text-slate-500">
            The code will expire in 10 minutes. Check your spam folder if you don't see it.
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyCode}
          disabled={loading || verificationCode.length !== 6}
          className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 transition-colors mt-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
              Verifying...
            </span>
          ) : (
            'Verify & Sign In'
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center space-y-2 pt-2">
          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-orange-400 hover:text-orange-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Resend verification code
          </button>

          <div>
            <button
              onClick={handleBackToLogin}
              disabled={loading}
              className="text-slate-400 hover:text-slate-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Credentials Step UI (Login/Register) - Dark Theme
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">
          {authMode === 'login' ? 'Sign in' : 'Create account'}
        </h2>
        <p className="text-sm text-slate-400">
          {authMode === 'login'
            ? 'Access messaging and contact sellers. You can browse without signing in.'
            : 'Join our community to connect, share, and discover.'}
        </p>
      </div>

      {/* Tab-style Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            authMode === 'login'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          onClick={() => {
            onModeChange('login')
            resetForm()
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            authMode === 'register'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          onClick={() => {
            onModeChange('register')
            resetForm()
          }}
        >
          Create account
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-rose-600/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
        {/* Full Name - Registration only */}
        {authMode === 'register' && (
          <input
            type="text"
            name="username"
            placeholder="Full name"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        )}

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          required
        />

        {/* Age Dropdown - Registration only */}
        {authMode === 'register' && (
          <select
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {ageRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        )}

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => authMode === 'register' && setShowPasswordRequirements(true)}
            onBlur={() => setTimeout(() => setShowPasswordRequirements(false), 200)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
          />

          {/* Password requirements - registration only */}
          {authMode === 'register' && (showPasswordRequirements || formData.password) && (
            <div className="mt-2 p-3 rounded-lg border border-slate-700 bg-slate-800/50">
              <p className="text-xs font-medium text-slate-300 mb-2">Password must include:</p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li
                    key={index}
                    className={`text-xs flex items-center gap-2 ${
                      req.met ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                      req.met ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
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

        {authMode === 'login' && (
          <p className="text-xs text-slate-500">
            A verification code will be sent to your email for secure login.
          </p>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                {authMode === 'login' ? 'Sending...' : 'Creating...'}
              </span>
            ) : authMode === 'login' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </form>

      {/* Help text */}
      <p className="text-xs text-slate-500 pt-2">
        Need help? <a href="mailto:support@pomi.community" className="text-orange-400 hover:underline">support@pomi.community</a>
      </p>
    </div>
  )
}
