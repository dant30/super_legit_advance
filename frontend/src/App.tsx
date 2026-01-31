// frontend/src/App.tsx
import { useEffect, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'

import type { AppDispatch, RootState } from '@/store/store'
import { checkAuth } from '@/store/slices/authSlice'

import Layout from '@/components/layout/Layout'
import { Loading } from '@/components/shared/Loading'
import PrivateRoute from '@/router/PrivateRoute'
import ThemeInitializer from '@/components/ui/Theme/ThemeInitializer'

import {
  publicRoutes,
  protectedRoutes,
  errorRoutes,
  AppRoute,
} from '@/router/routes'

// 🔁 Recursive route mapper (stable keys)
const renderRoutes = (
  routes: AppRoute[],
  parentKey = ''
): JSX.Element[] =>
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
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()

  const { isLoading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  )

  // 🔐 AUTH BOOTSTRAP (runs once on app load)
  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  // 📊 Analytics (route-based)
  useEffect(() => {
    if (
      import.meta.env.VITE_ENABLE_ANALYTICS &&
      import.meta.env.VITE_GOOGLE_ANALYTICS_ID
    ) {
      import('react-ga4').then((ReactGA) => {
        const ga = ReactGA as any
        ga.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID)
        ga.send('pageview', {
          page_path: location.pathname + location.search,
        })
      })
    }
  }, [location])

  // ⏳ HARD GATE: auth state still resolving
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
        <meta
          name="description"
          content="Advanced loan management system"
        />
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
            {/* 🌍 Public routes */}
            {renderRoutes(publicRoutes)}

            {/* 🔒 Protected routes */}
            <Route path="/" element={<PrivateRoute />}>
              <Route element={<Layout />}>
                {renderRoutes(protectedRoutes)}
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
