import React from 'react'

function AuthShell({ children, maxWidth = 'max-w-xl' }) {
  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-surface-bg text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-10 h-80 w-80 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(56,80,107,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>
      <div className={`relative z-10 mx-auto flex min-h-screen w-full ${maxWidth} items-center p-6 lg:p-8`}>
        {children}
      </div>
    </div>
  )
}

export default AuthShell
