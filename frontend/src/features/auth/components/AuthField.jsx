import React from 'react'

function AuthField({ label, htmlFor, icon: Icon, inputClassName = '', className = '', ...inputProps }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      <div className="relative mt-1.5">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted" /> : null}
        <input
          id={htmlFor}
          className={`w-full rounded-lg border border-surface-border bg-surface-panel px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 ${Icon ? 'pl-10' : ''} ${inputClassName}`}
          {...inputProps}
        />
      </div>
    </div>
  )
}

export default AuthField
