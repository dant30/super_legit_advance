import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  MailCheck,
  RefreshCcw,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { authAPI } from '../services/auth'
import { AUTH_EMAIL_REGEX } from '../types'
import {
  AuthField,
  AuthPanel,
  AuthPrimaryButton,
  AuthShell,
} from '../components'

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
    <AuthShell maxWidth="max-w-xl">
      <AuthPanel sectionLabel="Email Verification" title="Verify Email">
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
          <AuthField
            label="Need a new verification email?"
            htmlFor="verify-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="staff@superlegitadvance.com"
          />
          <AuthPrimaryButton
            type="submit"
            disabled={resendState === 'loading'}
            className="md:w-auto md:px-6"
          >
            {resendState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Send Verification
          </AuthPrimaryButton>
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
      </AuthPanel>
    </AuthShell>
  )
}

export default VerifyEmail
