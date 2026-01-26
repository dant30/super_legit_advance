// frontend/src/router/routes.tsx
import { lazy, ReactNode } from 'react'

// Core pages (lazy)
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/Login'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Unauthorized = lazy(() => import('@/pages/Unauthorized'))

// Feature route arrays (DEFAULT exports)
import customerRoutes from '@/pages/customers/routes'
import loanRoutes from '@/pages/loans/routes'
import repaymentRoutes from '@/pages/repayments/routes'
import reportRoutes from '@/pages/reports/routes'
import notificationRoutes from '@/pages/notifications/routes'
import settingRoutes from '@/pages/settings/routes'

// 🔹 Route type
export interface AppRoute {
  path: string
  element?: ReactNode
  index?: boolean
  children?: AppRoute[]
}

// 🌍 Public Routes
export const publicRoutes: AppRoute[] = [
  { path: '/login', element: <Login /> },
  { path: '/unauthorized', element: <Unauthorized /> },
]

// 🔒 Protected Routes
export const protectedRoutes: AppRoute[] = [
  {
    path: '/',
    index: true,
    element: <Dashboard />,
  },

  { path: 'customers', children: customerRoutes },
  { path: 'loans', children: loanRoutes },
  { path: 'repayments', children: repaymentRoutes },
  { path: 'reports', children: reportRoutes },
  { path: 'notifications', children: notificationRoutes },
  { path: 'settings', children: settingRoutes },
]

// 🚨 Error Routes
export const errorRoutes: AppRoute[] = [
  { path: '/404', element: <NotFound /> },
]
