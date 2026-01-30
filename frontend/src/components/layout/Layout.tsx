import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUp } from 'lucide-react'
import clsx from 'clsx'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import {
  closeSidebar,
  toggleMobileSidebar,
} from '@/store/slices/uiSlice'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { Button } from '@/components/ui/Button'

const DESKTOP_QUERY = '(min-width: 1020px)'
const SCROLL_THRESHOLD = 300

const Layout: React.FC = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen)

  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const [showBackToTop, setShowBackToTop] = useState(false)

  /* ---------------- Route change: close mobile sidebar ---------------- */
  useEffect(() => {
    dispatch(closeSidebar())
  }, [location.pathname, dispatch])

  /* ---------------- Scroll to top button visibility ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > SCROLL_THRESHOLD)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* ---------------- Mobile Header ---------------- */}
      {!isDesktop && (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-soft flex items-center justify-between px-4">
          <button
            onClick={() => dispatch(toggleMobileSidebar())}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              SL
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              Super Legit
            </span>
          </div>

          <div className="w-10" />
        </header>
      )}

      {/* ---------------- Desktop Layout ---------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
            <Sidebar />
          </aside>
        )}

        {/* Mobile Overlay */}
        {!isDesktop && (
          <div
            className={clsx(
              'fixed inset-0 z-40 bg-black/40 dark:bg-black/60 transition-opacity',
              sidebarOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            )}
            onClick={() => dispatch(closeSidebar())}
            aria-hidden
          />
        )}

        {/* Mobile Sidebar */}
        {!isDesktop && (
          <aside
            className={clsx(
              'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
              <Sidebar onClose={() => dispatch(closeSidebar())} />
            </div>
          </aside>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - always visible, positioned below mobile header on mobile */}
          <div className={clsx(isDesktop ? 'relative' : 'relative mt-16')}>
            <Header />
          </div>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>

            <Footer />
          </main>

          {/* Back to Top Button */}
          {showBackToTop && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowUp className="h-4 w-4" />}
                onClick={scrollToTop}
                aria-label="Back to top"
                className="rounded-full shadow-lg"
              >
                Top
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Layout
