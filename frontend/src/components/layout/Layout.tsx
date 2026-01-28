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
import { Button } from '../ui/Button/Button'

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
    if (!isDesktop) {
      dispatch(closeSidebar())
    }
  }, [location.pathname, isDesktop, dispatch])

  /* ---------------- Body scroll lock (mobile only) ---------------- */
  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, isDesktop])

  /* ---------------- Back to Top visibility ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > SCROLL_THRESHOLD)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
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

      {/* ---------------- Mobile Overlay ---------------- */}
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

      {/* ---------------- Mobile Sidebar ---------------- */}
      {!isDesktop && (
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-hard">
            <Sidebar onClose={() => dispatch(closeSidebar())} />
          </div>
        </aside>
      )}

      {/* ---------------- Desktop Layout ---------------- */}
      <div className="flex flex-1">
        {isDesktop && (
          <aside className="fixed inset-y-0 left-0 w-64 z-30">
            <div className="h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-soft overflow-y-auto">
              <Sidebar />
            </div>
          </aside>
        )}

        <div className={clsx('flex-1 flex flex-col', isDesktop && 'ml-64')}>
          {isDesktop && (
            <div className="sticky top-0 z-20">
              <Header />
            </div>
          )}

          <main className="flex-1 overflow-auto">
            <div
              className={clsx(
                'container-wide py-6',
                !isDesktop && 'pt-16'
              )}
            >
              <Outlet />
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* ---------------- Back to Top Button ---------------- */}
      {showBackToTop && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="primary"
            size="sm"
            icon={ArrowUp}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="rounded-full shadow-lg"
          >
            Top
          </Button>
        </div>
      )}
    </div>
  )
}

export default Layout
