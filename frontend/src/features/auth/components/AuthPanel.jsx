import React from 'react'
import { Building2 } from 'lucide-react'

function AuthPanel({ title, subtitle, sectionLabel, children }) {
  return (
    <div className="w-full rounded-2xl border border-surface-border bg-surface-panel p-6 shadow-medium sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-brand-600 p-2.5 text-white shadow-soft">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Super Legit Advance</p>
          <p className="text-xs text-text-muted">{sectionLabel}</p>
        </div>
      </div>
      {title && <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>}
      {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
      {children}
    </div>
  )
}

export default AuthPanel
