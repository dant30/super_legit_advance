// frontend/src/App.tsx
import { useEffect, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'

import { RootState } from '@/store/store'
import { checkAuth } from '@/store/slices/authSlice'

import Layout from '@/components/layout/Layout'
import Loading from '@/components/shared/Loading'
import PrivateRoute from '@/router/PrivateRoute'
import ThemeInitializer from '@/components/ui/Theme/ThemeInitializer'

import { publicRoutes, protectedRoutes, errorRoutes, AppRoute } from '@/router/routes'

// 🔹 Recursive route mapper
const renderRoutes = (routes: AppRoute[]): JSX.Element[] =>
  routes.map((r) =>
    r.children ? (
      <Route path={r.path} element={r.element ?? <Outlet />} key={r.path}>
        {renderRoutes(r.children)}
      </Route>
    ) : (
      <Route
        path={r.path}
        element={r.element}
        index={r.index}
        key={r.path}
      />
    )
  )

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isLoading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )

  // 🔐 Auth check
  useEffect(() => {
    dispatch(checkAuth() as any)
  }, [dispatch])

  // 📊 Analytics
  useEffect(() => {
    if (
      import.meta.env.VITE_ENABLE_ANALYTICS &&
      import.meta.env.VITE_GOOGLE_ANALYTICS_ID
    ) {
      import('react-ga4').then((ReactGA) => {
        // Properly type the module
        const ga = ReactGA as any
        ga.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID)
        ga.send('pageview', {
          page_path: location.pathname + location.search,
        })
      })
    }
  }, [location])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Super Legit Advance</title>
        <meta name="description" content="Advanced loan management system" />
      </Helmet>

      <ThemeInitializer />

      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Loading size="lg" />
            </div>
          }
        >
          <Routes location={location} key={location.pathname}>
            {/* 🌍 Public */}
            {renderRoutes(publicRoutes)}

            {/* 🔒 Protected */}
            <Route path="/" element={<PrivateRoute />}>
              <Route element={<Layout />}>{renderRoutes(protectedRoutes)}</Route>
            </Route>

            {/* 🚨 Errors */}
            {renderRoutes(errorRoutes)}

            {/* Catch-all */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
            />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}

export default App