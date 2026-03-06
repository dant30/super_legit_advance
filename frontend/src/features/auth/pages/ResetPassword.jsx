import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { authAPI } from '../services/auth'
import { AUTH_PASSWORD_POLICY } from '../types'
import {
  AuthAlert,
  AuthField,
  AuthPanel,
  AuthPrimaryButton,
  AuthShell,
} from '../components'

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
    <AuthShell maxWidth="max-w-xl">
      <AuthPanel
        sectionLabel="Password Update"
        title="Reset Password"
        subtitle="Set a new password for your account."
      >
        {!canSubmit && <AuthAlert tone="warning">This link is missing required reset parameters.</AuthAlert>}
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        {success && <AuthAlert tone="success">{success}</AuthAlert>}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <AuthField
            label="New Password"
            htmlFor="new-password"
            icon={KeyRound}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="-mt-2 text-xs text-text-muted">{passwordHint}</p>

          <AuthField
            label="Confirm Password"
            htmlFor="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          <AuthPrimaryButton type="submit" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </AuthPrimaryButton>
        </form>

        <Link to="/login" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </AuthPanel>
    </AuthShell>
  )
}

export default ResetPassword
