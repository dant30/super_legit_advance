import React from 'react'

function AuthPrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand-700 bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      style={{ backgroundColor: 'var(--color-brand-600)', color: '#ffffff', ...(props.style || {}) }}
    >
      {children}
    </button>
  )
}

export default AuthPrimaryButton
