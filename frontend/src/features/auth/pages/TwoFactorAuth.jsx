import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, AlertCircle, Building2 } from 'lucide-react'
import { useAuth } from '@hooks/useAuth'

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
              <p className="text-xs text-text-muted">Secondary Verification</p>
            </div>
          </div>

          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Two-Factor Authentication</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter the 6-digit security code from your authenticator app.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-brand-700 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ backgroundColor: 'var(--color-brand-600)', color: '#ffffff' }}
            >
              {isSubmitting ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>

          <div className="mt-5 text-sm">
            <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorAuth
