// frontend/src/components/layout/Footer.tsx
import React from 'react'
import { Shield, Lock, Cpu } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Super Legit Staff Portal. Internal use only.
            </p>
          </div>

          {/* Right side - System info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3 w-3" />
              <span>v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer