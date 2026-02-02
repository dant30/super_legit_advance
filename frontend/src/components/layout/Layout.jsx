// frontend/src/components/layout/Layout.jsx
import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUp } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@hooks/useAuth'
import { useMediaQuery } from '@hooks/useMediaQuery'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'

const DESKTOP_QUERY = '(min-width: 1020px)'
const SCROLL_THRESHOLD = 300

const Layout = () => {
  const location = useLocation()
  const { user } = useAuth()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize on mount
  useEffect(() => {
    setMounted(true)
    // Auto-open sidebar on desktop by default
    if (isDesktop) {
      setSidebarOpen(true)
    }
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isDesktop])

  // Scroll to top button visibility
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      {!isDesktop && (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-soft flex items-center justify-between px-4">
          <button
            onClick={toggleSidebar}
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

          <div className="w-10" /> {/* Spacer for alignment */}
        </header>
      )}

      {/* Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside className={cn(
            "w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden",
            "transition-all duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <Sidebar />
          </aside>
        )}

        {/* Mobile Overlay */}
        {!isDesktop && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 transition-opacity"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar */}
        {!isDesktop && (
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
              <Sidebar onClose={closeSidebar} />
            </div>
          </aside>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header - always visible */}
          <div className={cn(isDesktop ? 'relative' : 'relative mt-16')}>
            <Header onMenuClick={isDesktop ? toggleSidebar : undefined} />
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
                className="rounded-full shadow-lg animate-bounce-slow"
              >
                Top
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar Toggle Button (when collapsed) */}
      {isDesktop && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 bg-primary-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-primary-700 transition-all"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default Layout