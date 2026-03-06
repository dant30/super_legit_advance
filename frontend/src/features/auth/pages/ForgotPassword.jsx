import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { authAPI } from '../services/auth'
import { AUTH_EMAIL_REGEX } from '../types'
import {
  AuthAlert,
  AuthField,
  AuthPanel,
  AuthPrimaryButton,
  AuthShell,
} from '../components'

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
    <AuthShell maxWidth="max-w-xl">
      <AuthPanel
        sectionLabel="Account Recovery"
        title="Forgot Password"
        subtitle="Enter your staff email and we will send secure reset instructions."
      >
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        {success && <AuthAlert tone="success">{success}</AuthAlert>}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <AuthField
            label="Email Address"
            htmlFor="reset-email"
            icon={Mail}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="staff@superlegitadvance.com"
            autoComplete="email"
            required
          />

          <AuthPrimaryButton type="submit" disabled={isSubmitting}>
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword
