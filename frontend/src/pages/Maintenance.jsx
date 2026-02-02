// frontend/src/pages/Maintenance.jsx
import React from 'react'
import { Wrench, Clock, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@utils/cn'

const Maintenance = () => {
  const navigate = useNavigate()

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_60%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/10">
              <Wrench className="h-12 w-12 text-indigo-400" />
            </div>
          </div>

          <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-white">
            Under Maintenance
          </h1>

          <p className="mb-4 text-xl font-medium text-gray-300">
            We’ll be right back
          </p>

          <div className="mx-auto mb-8 max-w-md rounded-lg border border-gray-700 bg-gray-900/60 p-4 text-gray-400">
            <div className="mb-2 flex items-center justify-center gap-2 text-indigo-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Temporary Downtime</span>
            </div>

            <p className="text-sm">
              We’re performing scheduled maintenance to improve performance,
              security, and stability. Thanks for your patience.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg',
              'bg-indigo-600 px-6 py-3 text-white',
              'hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-400'
            )}
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </section>
    </main>
  )
}

export default Maintenance
