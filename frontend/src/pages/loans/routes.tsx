// frontend/src/pages/loans/routes.tsx
import { lazy } from 'react'
import { AppRoute } from '@/router/routes'

const LoanList = lazy(() => import('./List'))
const LoanCreate = lazy(() => import('./Create'))
const LoanDetail = lazy(() => import('./Detail'))
const LoanCalculator = lazy(() => import('./Calculator'))
const LoanApplications = lazy(() => import('./Applications'))
const LoanApprovals = lazy(() => import('./Approvals'))
const ActiveLoans = lazy(() => import('./Active'))
const OverdueLoans = lazy(() => import('./Overdue'))

const loanRoutes: AppRoute[] = [
  { path: '', element: <LoanList /> },
  { path: 'create', element: <LoanCreate /> },
  { path: ':id', element: <LoanDetail /> },
  { path: 'calculator', element: <LoanCalculator /> },
  { path: 'applications', element: <LoanApplications /> },
  { path: 'approvals', element: <LoanApprovals /> },
  { path: 'active', element: <ActiveLoans /> },
  { path: 'overdue', element: <OverdueLoans /> },
]

export default loanRoutes
