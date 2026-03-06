import React from 'react'

function AuthShell({ children, maxWidth = 'max-w-xl' }) {
  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden bg-slate-50 text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-white" />
      </div>
      <div className={`relative z-10 mx-auto flex min-h-screen w-full ${maxWidth} items-center p-6 lg:p-8`}>
        {children}
      </div>
    </div>
  )
}

export default AuthShell
