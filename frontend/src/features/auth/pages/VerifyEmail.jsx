import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  MailCheck,
  RefreshCcw,
  XCircle,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { authAPI } from '../services/auth'
import { AUTH_EMAIL_REGEX } from '../types'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resendState, setResendState] = useState('idle')

  useEffect(() => {
    let mounted = true
    const verify = async () => {
      if (!uid || !token) {
        setStatus('error')
        setMessage('Verification link is incomplete.')
        return
      }

      setStatus('loading')
      try {
        await authAPI.verifyEmail(uid, token)
        if (!mounted) return
        setStatus('success')
        setMessage('Email verified successfully. You can now sign in.')
      } catch (err) {
        if (!mounted) return
        setStatus('error')
        setMessage(err?.message || 'Email verification failed.')
      }
    }

    verify()
    return () => {
      mounted = false
    }
  }, [uid, token])

  const resend = async (event) => {
    event.preventDefault()
    if (!AUTH_EMAIL_REGEX.test(email.trim())) {
      setResendState('error')
      return
    }
    setResendState('loading')
    try {
      await authAPI.resendVerificationEmail(email.trim().toLowerCase())
      setResendState('success')
    } catch {
      setResendState('error')
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
              <p className="text-xs text-text-muted">Email Verification</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-text-primary">Verify Email</h1>

          <div className="mt-4 rounded-xl border border-surface-border bg-surface-subtle p-4">
            {status === 'loading' && (
              <p className="inline-flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying your email link...
              </p>
            )}
            {status === 'success' && (
              <div className="flex items-start gap-3 text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <p className="text-sm">{message}</p>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-start gap-3 text-rose-700">
                <XCircle className="mt-0.5 h-5 w-5" />
                <p className="text-sm">{message}</p>
              </div>
            )}
          </div>

          <form onSubmit={resend} className="mt-6 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary" htmlFor="verify-email">
              Need a new verification email?
            </label>
            <div className="flex gap-2">
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="staff@superlegitadvance.com"
                className="w-full rounded-lg border border-surface-border bg-surface-panel px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
              <button
                type="submit"
                disabled={resendState === 'loading'}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-700 bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundColor: 'var(--color-brand-600)', color: '#ffffff' }}
              >
                {resendState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Send
              </button>
            </div>
            {resendState === 'success' && (
              <p className="inline-flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verification email sent.
              </p>
            )}
            {resendState === 'error' && (
              <p className="inline-flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="h-3.5 w-3.5" />
                Unable to send verification email.
              </p>
            )}
          </form>

          <div className="mt-6 flex gap-4">
            <Link to="/login" className="text-sm font-medium text-brand-700 hover:text-brand-800">
              Back to Login
            </Link>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
              <MailCheck className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
