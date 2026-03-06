import React from 'react'

function AuthField({
  label,
  htmlFor,
  icon: Icon,
  endAdornment = null,
  inputClassName = '',
  className = '',
  ...inputProps
}) {
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
        {endAdornment ? <div className="absolute right-2 top-1/2 -translate-y-1/2">{endAdornment}</div> : null}
      </div>
    </div>
  )
}

export default AuthField
