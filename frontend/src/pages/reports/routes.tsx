// frontend/src/pages/reports/routes.tsx
import { lazy } from 'react'
import { AppRoute } from '@/router/routes'

const ReportOverview = lazy(() => import('./Overview'))
const LoansReport = lazy(() => import('./LoansReport'))
const PaymentsReport = lazy(() => import('./PaymentsReport'))
const CustomerReport = lazy(() => import('./CustomerReport'))
const CollectionReport = lazy(() => import('./CollectionReport'))
const DelinquencyReport = lazy(() => import('./DelinquencyReport'))
const PerformanceReport = lazy(() => import('./PerformanceReport'))

const reportRoutes: AppRoute[] = [
  { path: '', element: <ReportOverview /> },
  { path: 'loans', element: <LoansReport /> },
  { path: 'payments', element: <PaymentsReport /> },
  { path: 'customers', element: <CustomerReport /> },
  { path: 'collections', element: <CollectionReport /> },
  { path: 'delinquency', element: <DelinquencyReport /> },
  { path: 'performance', element: <PerformanceReport /> },
]

export default reportRoutes
