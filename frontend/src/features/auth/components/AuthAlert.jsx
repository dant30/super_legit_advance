import React from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const toneMap = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-surface-border bg-surface-subtle text-text-secondary',
}

function AuthAlert({ tone = 'info', icon, children, className = '' }) {
  const Icon = icon || (tone === 'success' ? CheckCircle2 : AlertCircle)
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${toneMap[tone]} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4" />
      <span>{children}</span>
    </div>
  )
}

export default AuthAlert
