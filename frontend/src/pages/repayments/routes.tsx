// frontend/src/pages/repayments/routes.tsx
import { lazy } from 'react'
import { AppRoute } from '@/router/routes'

const RepaymentList = lazy(() => import('./List'))
const RepaymentPayment = lazy(() => import('./Payment'))
const RepaymentSchedule = lazy(() => import('./Schedule'))
const RepaymentDetail = lazy(() => import('./Detail'))

const repaymentRoutes: AppRoute[] = [
  { path: '', element: <RepaymentList /> },
  { path: ':id', element: <RepaymentDetail /> },
  { path: 'collect', element: <RepaymentPayment /> },
  { path: 'schedule', element: <RepaymentSchedule /> },
  { path: 'overdue', element: <RepaymentList /> },
]

export default repaymentRoutes
