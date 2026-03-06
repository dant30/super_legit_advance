import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Send, Building2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authAPI } from '../services/auth'
import { AUTH_EMAIL_REGEX } from '../types'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!AUTH_EMAIL_REGEX.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.requestPasswordReset(email.trim().toLowerCase())
      setSuccess('If your account exists, password reset instructions have been sent to your email.')
    } catch (err) {
      setError(err?.message || 'Unable to request password reset.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-surface-bg text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-10 h-80 w-80 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(56,80,107,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl items-center p-6 lg:p-8">
        <div className="w-full rounded-2xl border border-surface-border bg-surface-panel p-6 shadow-medium sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-brand-600 p-2.5 text-white shadow-soft">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Super Legit Advance</p>
              <p className="text-xs text-text-muted">Account Recovery</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-text-primary">Forgot Password</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your staff email and we will send secure reset instructions.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary" htmlFor="reset-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@superlegitadvance.com"
                className="w-full rounded-lg border border-surface-border bg-surface-panel px-10 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-700 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ backgroundColor: 'var(--color-brand-600)', color: '#ffffff' }}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <Link to="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
