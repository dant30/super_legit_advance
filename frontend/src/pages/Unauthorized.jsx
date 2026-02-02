// frontend/src/pages/Unauthorized.jsx
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react'
import { cn } from '@utils/cn'

/**
 * Unauthorized (403) page
 * @returns {JSX.Element}
 */
const Unauthorized = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const fromPath = location.state?.from || '/'

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 px-4">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_60%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-500/10">
              <Lock className="h-12 w-12 text-yellow-500" />
            </div>
          </div>

          <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-white">
            403
          </h1>

          <p className="mb-4 text-2xl font-semibold text-gray-300">
            Unauthorized Access
          </p>

          <div className="mx-auto mb-8 max-w-md rounded-lg border border-gray-700 bg-gray-900/60 p-4 text-gray-400">
            <div className="mb-2 flex items-center justify-center gap-2 text-yellow-400">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-sm font-medium">
                Restricted Area
              </span>
            </div>

            <p className="text-sm">
              You tried to access:
              <span className="block truncate text-gray-300">
                {fromPath}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate(-1)}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg',
                'border border-gray-600 bg-gray-800 px-5 py-3 text-gray-200',
                'hover:bg-gray-700 transition'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <button
              onClick={() => navigate('/')}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg',
                'bg-indigo-600 px-5 py-3 text-white',
                'hover:bg-indigo-700 transition'
              )}
            >
              Dashboard
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Unauthorized
