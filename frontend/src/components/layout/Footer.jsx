// frontend/src/components/layout/Footer.jsx
import React from 'react'
import { Shield, Lock, Cpu, Heart, Globe, Wifi } from 'lucide-react'
import { useTheme } from '@contexts/ThemeContext'
import { cn } from '@utils/cn'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { isDark } = useTheme()

  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className={cn(
      "mt-8",
      "bg-white dark:bg-slate-800",
      "border-t border-gray-200 dark:border-slate-700",
      "shadow-sm"
    )}
    >
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left side - Brand and copyright */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                SL
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Super Legit Advance
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              © {currentYear} Staff Portal v2.1.0 • Internal use only
            </p>
          </div>

          {/* Center - System status */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500" aria-label="System status">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              <span>System Online</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Globe className="h-3 w-3" aria-hidden="true" />
              <span>API v2</span>
            </div>
          </div>

          {/* Right side - Security and info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500" aria-label="Security and uptime">
            <div className="hidden md:flex items-center gap-1.5" title="256-bit Encryption">
              <Lock className="h-3 w-3" aria-hidden="true" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1.5" title="System Health">
              <Cpu className="h-3 w-3" aria-hidden="true" />
              <span>99.9% Uptime</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5" title="Made with ❤️">
              <Heart className="h-3 w-3 text-red-400" aria-hidden="true" />
              <span>Team SLA</span>
            </div>
          </div>
        </div>

        {/* Mobile-only additional info */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 md:hidden" aria-label="Additional info">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center justify-center gap-1.5">
              <Shield className="h-3 w-3" aria-hidden="true" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Wifi className="h-3 w-3" aria-hidden="true" />
              <span>Real-time Sync</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
