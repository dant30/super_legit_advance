// frontend/src/components/layout/Footer.jsx
import React from 'react'
import { Globe, ShieldCheck } from 'lucide-react'
import { cn } from '@utils/cn'
import { t } from '../../../core/i18n/i18n'

const Footer = () => {
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
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-center md:text-left">
            <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
              <div className="h-6 w-6 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                SL
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {t('common.appName', 'Super Legit Advance')}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t('layout.footer.copyright', 'Loan Operations Platform')}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500" aria-label="System status">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
              <span>{t('layout.footer.systemOnline', 'System Online')}</span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              <Globe className="h-3 w-3" aria-hidden="true" />
              <span>{t('layout.footer.apiVersion', 'API v2')}</span>
            </div>
            <div className="hidden items-center gap-1.5 lg:flex">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              <span>{t('layout.footer.secureOps', 'Secure operations')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
