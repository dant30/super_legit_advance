// frontend/src/pages/auth/Login.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'

import { useAuth } from '@hooks/useAuth'
import {
  AUTH_EMAIL_REGEX,
  AUTH_PASSWORD_POLICY,
  AUTH_STORAGE_KEYS,
} from '../types'
import { AuthPrimaryButton } from '../components'

const Login = () => {
  const navigate = useNavigate()
  const {
    login,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    clearError,
  } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [localError, setLocalError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLoading = authLoading || isSubmitting

  useEffect(() => {
    const savedEmail = localStorage.getItem(AUTH_STORAGE_KEYS.rememberedEmail)
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail, remember: true }))
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  useEffect(() => {
    if (authError) {
      setLocalError(authError)
    }
  }, [authError])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const validateForm = useCallback(() => {
    setValidationError('')
    setLocalError('')

    if (!formData.email.trim()) {
      setValidationError('Email address is required')
      return false
    }

    if (!AUTH_EMAIL_REGEX.test(formData.email)) {
      setValidationError('Please enter a valid email address')
      return false
    }

    if (!formData.password) {
      setValidationError('Password is required')
      return false
    }

    if (formData.password.length < AUTH_PASSWORD_POLICY.minLength) {
      setValidationError(`Password must be at least ${AUTH_PASSWORD_POLICY.minLength} characters`)
      return false
    }

    return true
  }, [formData.email, formData.password])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    clearError()
    setLocalError('')

    if (formData.remember) {
      localStorage.setItem(AUTH_STORAGE_KEYS.rememberedEmail, formData.email)
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.rememberedEmail)
    }

    setIsSubmitting(true)

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })
      setFormData({
        email: formData.remember ? formData.email : '',
        password: '',
        remember: formData.remember,
      })
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = useCallback(
    (field) => (value) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (localError) setLocalError('')
      if (validationError) setValidationError('')
    },
    [localError, validationError]
  )

  const handleEmailChange = useCallback(
    (e) => {
      handleInputChange('email')(e.target.value)
    },
    [handleInputChange]
  )

  const handlePasswordChange = useCallback(
    (e) => {
      handleInputChange('password')(e.target.value)
    },
    [handleInputChange]
  )

  const handleRememberChange = useCallback(
    (e) => {
      handleInputChange('remember')(e.target.checked)
    },
    [handleInputChange]
  )

  const displayError = localError || validationError
  const isSubmitDisabled = isLoading || !formData.email.trim() || !formData.password

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-surface-bg text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-10 h-80 w-80 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(56,80,107,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center p-6 lg:p-8">
        <div
          className="grid w-full overflow-hidden rounded-2xl border bg-surface-panel shadow-medium lg:grid-cols-2"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          <section className="hidden border-r border-surface-border bg-surface-subtle p-10 lg:block">
            <div className="inline-flex items-center gap-3 rounded-xl border bg-white/90 px-3 py-2 shadow-soft backdrop-blur dark:bg-slate-900/60" style={{ borderColor: 'var(--surface-border)' }}>
              <div className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-bold tracking-[0.08em] text-white shadow-soft">
                SLA
              </div>
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-200">
                <Building2 className="h-4 w-4" />
                <div>
                  <p className="text-sm font-semibold tracking-wide text-text-primary">
                    Super Legit Advance
                  </p>
                  <p className="text-xs text-text-muted">Loan Operations Portal</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-3xl font-semibold leading-tight text-text-primary">
                Corporate lending operations, with secure staff access.
              </p>
              <p className="mt-4 max-w-md text-sm text-text-secondary">
                Monitor portfolio performance, manage approvals, and execute collections in one
                controlled workspace.
              </p>
            </div>

            <ul className="mt-10 space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-feedback-success" />
                <span className="text-sm text-text-secondary">Role-based access and audit-safe workflows</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-feedback-success" />
                <span className="text-sm text-text-secondary">Protected session and token lifecycle controls</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-feedback-success" />
                <span className="text-sm text-text-secondary">Operational visibility for executive reporting</span>
              </li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6 lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-xl border bg-white/90 px-3 py-2 shadow-soft backdrop-blur dark:bg-slate-900/60" style={{ borderColor: 'var(--surface-border)' }}>
                <div className="rounded-lg bg-brand-600 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white shadow-soft">
                  SLA
                </div>
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-200">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Super Legit Advance</p>
                    <p className="text-xs text-text-muted">Loan Operations Portal</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-text-primary">Sign in</h1>
              <p className="mt-1 text-sm text-text-secondary">Use your staff account credentials to continue.</p>
            </div>

            {displayError && (
              <div
                className="mt-5 flex items-start gap-3 rounded-lg border bg-rose-50 px-4 py-3 text-rose-700"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{displayError}</p>
                  <p className="text-xs">Verify your credentials and try again.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    placeholder="staff@superlegitadvance.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-surface-border bg-surface-panel px-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-surface-border bg-surface-panel px-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                    className="absolute right-3 top-3 text-text-muted hover:text-text-secondary disabled:opacity-50"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={handleRememberChange}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-surface-border text-brand-600 focus:ring-brand-200"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-700 hover:text-brand-800"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </div>

              <AuthPrimaryButton type="submit" disabled={isSubmitDisabled} className="mt-2 disabled:opacity-60">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </AuthPrimaryButton>
            </form>

            <div className="mt-6 rounded-lg border border-surface-border bg-surface-subtle px-3 py-3">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
                <span>Secure login with controlled access policies</span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Need support?{' '}
                <a href="mailto:support@superlegitadvance.com" className="font-medium text-brand-700 hover:text-brand-800">
                  support@superlegitadvance.com
                </a>
              </p>
            </div>

            <p className="mt-5 text-center text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Super Legit Advance
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Login
