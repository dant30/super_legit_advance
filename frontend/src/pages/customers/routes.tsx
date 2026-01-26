// frontend/src/pages/customers/routes.tsx
import { lazy } from 'react'
import { AppRoute } from '@/router/routes'

const CustomerList = lazy(() => import('./List'))
const CustomerCreate = lazy(() => import('./Create'))
const CustomerDetail = lazy(() => import('./Detail'))
const CustomerBlacklist = lazy(() => import('./Blacklist'))
const CustomerGuarantors = lazy(() => import('./Guarantors'))
const CustomerEmploymentInfo = lazy(() => import('./EmploymentInfo'))
const CustomerDocuments = lazy(() => import('./Documents'))

const customerRoutes: AppRoute[] = [
  { path: '', element: <CustomerList /> },
  { path: 'create', element: <CustomerCreate /> },
  { path: ':id', element: <CustomerDetail /> },
  { path: ':id/guarantors', element: <CustomerGuarantors /> },
  { path: ':id/employment', element: <CustomerEmploymentInfo /> },
  { path: ':id/documents', element: <CustomerDocuments /> },
  { path: 'blacklisted', element: <CustomerBlacklist /> },
]

export default customerRoutes
