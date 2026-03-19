import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, Building2 } from 'lucide-react'

import { useAuth } from '@features/auth/hooks/useAuth'
import {
  AUTH_EMAIL_REGEX,
  AUTH_PASSWORD_POLICY,
  AUTH_STORAGE_KEYS,
} from '../types'
import {
  AuthShell,
  AuthPanel,
  AuthAlert,
  AuthPrimaryButton,
  AuthField,
} from '../components'

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
    <AuthShell maxWidth="max-w-md">
      <section className="w-full">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-700 bg-brand-600 text-sm font-bold tracking-wide text-white shadow-soft">
              SLA
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-700" />
                <p className="truncate text-sm font-semibold text-slate-900">Super Legit Advance</p>
              </div>
              <p className="text-xs text-slate-600">Corporate Loan Management Platform</p>
            </div>
          </div>
        </div>

        <AuthPanel
          title="Sign In"
          subtitle="Sign in to manage portfolio operations for your organization."
          sectionLabel="Secure Access"
        >
          {displayError ? <AuthAlert tone="error">{displayError}</AuthAlert> : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <AuthField
              label="Email Address"
              htmlFor="email"
              icon={Mail}
              type="email"
              placeholder="staff@superlegitadvance.com"
              value={formData.email}
              onChange={handleEmailChange}
              disabled={isLoading}
              required
              autoComplete="email"
            />

            <AuthField
              label="Password"
              htmlFor="password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              required
              autoComplete="current-password"
              inputClassName="pr-10"
              endAdornment={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="text-text-muted hover:text-text-secondary disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleRememberChange}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
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

            <AuthPrimaryButton type="submit" disabled={isSubmitDisabled} className="mt-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </AuthPrimaryButton>
          </form>
        </AuthPanel>

        <p className="mt-3 text-center text-xs text-slate-600">
          Need support?{' '}
          <a href="mailto:support@superlegitadvance.com" className="font-medium text-brand-700 hover:text-brand-800">
            support@superlegitadvance.com
          </a>
        </p>
      </section>
    </AuthShell>
  )
}

export default Login
