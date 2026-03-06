import React, { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'
import { t } from '../../../core/i18n/i18n'

const DESKTOP_QUERY = '(min-width: 768px)'
const SCROLL_THRESHOLD = 300

const Layout = () => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  const [showBackToTop, setShowBackToTop] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const mobileDrawerRef = useRef(null)

  useEffect(() => {
    if (isDesktop) {
      setMobileSidebarOpen(false)
    }
  }, [isDesktop])

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileSidebarOpen])

  useEffect(() => {
    if (!mobileSidebarOpen || !mobileDrawerRef.current) return undefined

    const drawer = mobileDrawerRef.current
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusables = Array.from(drawer.querySelectorAll(focusableSelector))
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    first?.focus()

    const handleTrap = (event) => {
      if (event.key !== 'Tab' || focusables.length === 0) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    drawer.addEventListener('keydown', handleTrap)
    return () => drawer.removeEventListener('keydown', handleTrap)
  }, [mobileSidebarOpen])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > SCROLL_THRESHOLD)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileSidebarOpen])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-700 focus:shadow-lg"
      >
        {t('layout.main.skipToContent', 'Skip to main content')}
      </a>

      <Header onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isDesktop && (
          <div className="min-h-0 w-72 shrink-0">
          <aside className="h-full w-72 border-r bg-app-panel" style={{ borderColor: 'var(--surface-border)' }}>
            <Sidebar />
          </aside>
          </div>
        )}

        <div
          className={cn(
            'fixed inset-0 z-[60]',
            isDesktop ? 'hidden' : '',
            mobileSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
          )}
          aria-hidden={mobileSidebarOpen ? 'false' : 'true'}
        >
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className={cn(
              'absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ease-out',
              mobileSidebarOpen ? 'opacity-100' : 'opacity-0'
            )}
            aria-label={t('layout.main.closeSidebarBackdrop', 'Close sidebar backdrop')}
          />

          <div
            className={cn(
              'relative z-10 h-full w-72 max-w-[88vw] transform-gpu transition-transform duration-200 ease-out',
              mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('layout.sidebar.navigation', 'Navigation')}
          >
            <aside className="h-full border-r bg-app-panel" style={{ borderColor: 'var(--surface-border)' }}>
              <Sidebar
                onNavigate={() => setMobileSidebarOpen(false)}
                onClose={() => setMobileSidebarOpen(false)}
              />
            </aside>
          </div>
        </div>

        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent"
        >
          <div className="mx-auto w-full max-w-[1520px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
          <Footer />
        </main>

        {showBackToTop && (
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowUp className="h-4 w-4" />}
            onClick={scrollToTop}
            type="button"
            aria-label={t('layout.main.backToTop', 'Back to top')}
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg"
          >
            {t('layout.main.backToTopShort', 'Top')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default Layout
