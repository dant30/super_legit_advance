// frontend/src/App.jsx
import { useEffect, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@features/auth/hooks/useAuth'
import Layout from '@components/layout/Layout'
import Loading from '@components/ui/Loading'
import PrivateRoute from '@router/PrivateRoute'
import StaffRoute from '@router/StaffRoute'
import AdminRoute from '@router/AdminRoute'
import ThemeInitializer from '@components/ui/ThemeInitializer'
import { publicRoutes, protectedRoutes, errorRoutes } from '@router/routes'
import { t } from './core/i18n/i18n'

// 🔁 Recursive route mapper (stable keys)
const renderRoutes = (routes, parentKey = '') =>
  routes.map((r, index) => {
    const routeKey = 
      r.path ??
      (r.index ? `${parentKey}-index-${index}` : `${parentKey}-route-${index}`)

    return r.children ? (
      <Route
        key={routeKey}
        path={r.path}
        element={r.element ?? <Outlet />}
      >
        {renderRoutes(r.children, routeKey)}
      </Route>
    ) : (
      <Route
        key={routeKey}
        path={r.path}
        element={r.element}
        index={r.index}
      />
    )
  })

function App() {
  const location = useLocation()
  const { isLoading, isAuthenticated, checkAuth, isAdmin } = useAuth()

  // 🔐 AUTH BOOTSTRAP - Only check if we have a token
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      checkAuth().catch(() => {
        // handled in AuthContext
      })
    }
    // Note: We're not setting isLoading here anymore
    // The AuthContext will handle loading state
  }, [checkAuth])

  // 📊 Analytics (route-based)
  useEffect(() => {
    if (
      import.meta.env.VITE_ENABLE_ANALYTICS &&
      import.meta.env.VITE_GOOGLE_ANALYTICS_ID
    ) {
      // Dynamically import react-ga4 to avoid SSR issues
      import('react-ga4').then((ReactGA) => {
        ReactGA.default.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID)
      })
    }
  }, [])

  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_ANALYTICS) {
      import('react-ga4').then((ReactGA) => {
        ReactGA.default.send({
          hitType: 'pageview',
          page: location.pathname + location.search,
        })
      })
    }
  }, [location])

  // ⏳ HARD GATE: auth state still resolving
  // Only show loading if we have a token AND isLoading is true
  const hasToken = localStorage.getItem('access_token')
  if (isLoading && hasToken) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
        role="status"
        aria-live="polite"
      >
        <Loading size="lg" message={t('auth.checkingSession', 'Checking your session...')} />
      </div>
    )
  }

  // Filter routes based on user role - SIMPLIFIED LOGIC
  const getRoutesForUser = () => {
    if (isAdmin()) {
      // Admin sees all routes
      return protectedRoutes
    }
    
    // Non-admin users only see non-adminOnly routes
    return protectedRoutes.filter(route => !route.adminOnly)
  }

  // Get user-specific routes
  const userRoutes = getRoutesForUser()

  return (
    <>
      <Helmet>
        <title>Super Legit Advance</title>
        <meta
          name="description"
          content="Advanced loan management system"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      <ThemeInitializer />

      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
              <Loading size="lg" message={t('routes.loadingPage', 'Loading page...')} />
            </div>
          }
        >
          <Routes location={location} key={location.pathname}>
            {/* 🌍 Public routes */}
            {renderRoutes(publicRoutes)}

            {/* 🔒 Protected routes (role-based access) */}
            <Route path="/" element={<PrivateRoute />}>
              <Route element={<Layout />}>
                {/* Render routes accessible to current user */}
                {renderRoutes(userRoutes)}
              </Route>
              
              {/* Nested staff-only routes (if needed) */}
              <Route path="/staff" element={<StaffRoute />}>
                {/* Staff-only subroutes would go here */}
              </Route>
              
              {/* Nested admin-only routes */}
              <Route path="/admin" element={<AdminRoute />}>
                {renderRoutes(protectedRoutes.filter(route => route.adminOnly))}
              </Route>
            </Route>

            {/* 🚨 Error routes */}
            {renderRoutes(errorRoutes)}

            {/* 🧹 Catch-all */}
            <Route
              path="*"
              element={
                <Navigate
                  to={isAuthenticated ? '/' : '/login'}
                  replace
                />
              }
            />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}

export default App

