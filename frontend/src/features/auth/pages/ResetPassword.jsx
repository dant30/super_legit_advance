import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, KeyRound, Building2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authAPI } from '../services/auth'
import { AUTH_PASSWORD_POLICY } from '../types'

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''
  const canSubmit = Boolean(uid && token)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordHint = useMemo(
    () => `Password must be at least ${AUTH_PASSWORD_POLICY.minLength} characters.`,
    []
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!canSubmit) {
      setError('The reset link is incomplete or invalid.')
      return
    }
    if (password.length < AUTH_PASSWORD_POLICY.minLength) {
      setError(passwordHint)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.confirmPasswordReset(uid, token, password, confirmPassword)
      setSuccess('Password reset successful. Redirecting to login...')
      setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setError(err?.message || 'Unable to reset password.')
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
              <p className="text-xs text-text-muted">Password Update</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-text-primary">Reset Password</h1>
          <p className="mt-2 text-sm text-text-secondary">Set a new password for your account.</p>

          {!canSubmit && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>This link is missing required reset parameters.</span>
            </div>
          )}

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
            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-panel px-10 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                autoComplete="new-password"
                required
              />
            </div>
            <p className="-mt-2 text-xs text-text-muted">{passwordHint}</p>

            <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-panel px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="inline-flex w-full items-center justify-center rounded-lg border border-brand-700 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ backgroundColor: 'var(--color-brand-600)', color: '#ffffff' }}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
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

export default ResetPassword
