// frontend/src/pages/auth/Login.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'

import { useAuth } from '@hooks/useAuth'

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
    const savedEmail = localStorage.getItem('remembered_email')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, remember: true }))
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
    setShowPassword(prev => !prev)
  }, [])

  const validateForm = useCallback(() => {
    setValidationError('')
    setLocalError('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    clearError()
    setLocalError('')

    if (formData.remember) {
      localStorage.setItem('remembered_email', formData.email)
    } else {
      localStorage.removeItem('remembered_email')
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
      setFormData(prev => ({ ...prev, [field]: value }))
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

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine)
  }, [])

  const particlesOptions = useMemo(() => ({
    background: {
      color: { value: 'transparent' },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        resize: true,
      },
      modes: {
        repulse: { distance: 90, duration: 0.4 },
      },
    },
    particles: {
      color: { value: ['#60a5fa', '#22d3ee', '#93c5fd'] },
      links: {
        color: '#93c5fd',
        distance: 140,
        enable: true,
        opacity: 0.25,
        width: 1,
      },
      collisions: { enable: false },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'out' },
        random: false,
        speed: 0.7,
        straight: false,
      },
      number: {
        density: { enable: true, area: 900 },
        value: 60,
      },
      opacity: { value: 0.4 },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <Particles
        id="loginParticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_12px_30px_rgba(34,211,238,0.35)]">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Super Legit Advance
            </h1>
            <p className="text-sm text-slate-300">
              Management System
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Secure staff portal access
            </div>

            <div className="mt-5">
              {displayError && (
                <div
                  className="mb-4 flex items-start gap-3 rounded-lg border border-danger-500/30 bg-danger-500/10 p-4 text-danger-100 animate-slide-up"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-danger-200" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{displayError}</p>
                    <p className="text-xs opacity-80 mt-1">
                      Please check your credentials and try again
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-200">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="staff@superlegitadvance.com"
                      value={formData.email}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                      required
                      autoComplete="email"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 disabled:opacity-50"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.remember}
                      onChange={handleRememberChange}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400/30"
                    />
                    <span>Remember me</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-cyan-300 hover:text-cyan-200 font-medium disabled:opacity-50"
                    onClick={(e) => isLoading && e.preventDefault()}
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_25px_rgba(34,211,238,0.35)] transition hover:from-cyan-300 hover:to-blue-400 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300 mb-2">
                <ShieldCheck className="h-3 w-3" />
                <span>Secure login with industry-standard encryption</span>
              </div>
              <p className="text-center text-xs text-slate-400">
                Unauthorized access is prohibited. Contact{' '}
                <a
                  href="mailto:support@superlegitadvance.com"
                  className="text-cyan-300 hover:text-cyan-200 font-medium"
                >
                  support@superlegitadvance.com
                </a>{' '}
                for assistance
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              v2.1.0 • © {new Date().getFullYear()} Super Legit Advance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
