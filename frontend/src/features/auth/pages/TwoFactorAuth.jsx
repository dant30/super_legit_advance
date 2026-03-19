import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '@features/auth/hooks/useAuth'
import {
  AuthAlert,
  AuthPanel,
  AuthPrimaryButton,
  AuthShell,
} from '../components'

function TwoFactorAuth() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter a valid 6-digit code.')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      navigate(isAuthenticated ? '/' : '/login', { replace: true })
    }, 500)
  }

  return (
    <AuthShell maxWidth="max-w-xl">
      <AuthPanel
        sectionLabel="Secondary Verification"
        title="Two-Factor Authentication"
        subtitle="Enter the 6-digit security code from your authenticator app."
      >
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <ShieldCheck className="h-6 w-6" />
        </div>

        {error && <AuthAlert tone="error">{error}</AuthAlert>}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-surface-border bg-surface-panel px-3 py-2.5 text-center text-lg tracking-[0.3em] text-text-primary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            placeholder="000000"
            required
          />

          <AuthPrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </AuthPrimaryButton>
        </form>

        <div className="mt-5 text-sm">
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Back to Login
          </Link>
        </div>
      </AuthPanel>
    </AuthShell>
  )
}

export default TwoFactorAuth
