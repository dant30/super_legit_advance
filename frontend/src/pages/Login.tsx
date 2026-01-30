// frontend/src/pages/Login.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  Loader2 
} from 'lucide-react'

import { login, clearError } from '@/store/slices/authSlice'
import { RootState, AppDispatch } from '@/store/store'

interface LoginForm {
  email: string
  password: string
  remember: boolean
}

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  )

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    remember: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Restore remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, remember: true }))
    }
  }, [])

  // Redirect after login
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const validateForm = useCallback((): boolean => {
    // Clear previous errors
    setValidationError('')

    if (!formData.email.trim()) {
      setValidationError('Email address is required')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setValidationError('Please enter a valid email address')
      return false
    }

    if (!formData.password) {
      setValidationError('Password is required')
      return false
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return false
    }

    return true
  }, [formData.email, formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Clear any previous errors
    if (error) {
      dispatch(clearError())
    }

    // Handle remember me
    if (formData.remember) {
      localStorage.setItem('remembered_email', formData.email)
    } else {
      localStorage.removeItem('remembered_email')
    }

    setIsSubmitting(true)
    
    try {
      const result = await dispatch(
        login({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      )

      // Check if login was successful
      if (login.fulfilled.match(result)) {
        // Navigation will be handled by the useEffect
      } else if (login.rejected.match(result)) {
        // Error is already handled by the auth slice
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = useCallback((field: keyof LoginForm) => 
    (value: string | boolean) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Clear errors when user starts typing
      if (error) dispatch(clearError())
      if (validationError) setValidationError('')
    }, [error, validationError, dispatch]
  )

  const displayError = error || validationError
  const isSubmitDisabled = isSubmitting || !formData.email.trim() || !formData.password

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-xl bg-gradient-primary shadow-medium">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            Super Legit Advance
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Loan Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="card shadow-medium">
          <div className="card-body">
            {/* Error Display */}
            {displayError && (
              <div 
                className="mb-4 flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-700 dark:border-danger-800 dark:bg-danger-900/30 dark:text-danger-300 animate-slide-up"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{displayError}</p>
                  <p className="text-xs opacity-80 mt-1">
                    Please check your credentials and try again
                  </p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="staff@superlegitadvance.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email')(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoComplete="email"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password')(e.target.value)}
                    disabled={isSubmitting}
                    required
                    autoComplete="current-password"
                    className="form-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isSubmitting}
                    className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 disabled:opacity-50"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => handleInputChange('remember')(e.target.checked)}
                    disabled={isSubmitting}
                    className="form-checkbox"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium disabled:opacity-50"
                  onClick={(e) => isSubmitting && e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="btn-primary w-full py-2.5 text-sm font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* Security Notice */}
          <div className="card-footer">
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-2">
              <ShieldCheck className="h-3 w-3" />
              <span>Secure login with industry-standard encryption</span>
            </div>
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
              Unauthorized access is prohibited. Contact{' '}
              <a
                href="mailto:support@superlegitadvance.com"
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                support@superlegitadvance.com
              </a>{' '}
              for assistance
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            v2.1.0 • © {new Date().getFullYear()} Super Legit Advance
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login