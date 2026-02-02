// frontend/src/router/routes.jsx
import { lazy } from 'react'

// Lazy load all pages
const NotFound = lazy(() => import('@pages/NotFound'))
const Unauthorized = lazy(() => import('@pages/Unauthorized'))
const Maintenance = lazy(() => import('@pages/Maintenance'))

// Auth pages
const Login = lazy(() => import('@pages/auth/Login'))
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@pages/auth/ResetPassword'))
const Profile = lazy(() => import('@pages/auth/Profile'))
const TwoFactorAuth = lazy(() => import('@pages/auth/TwoFactorAuth'))

// Dashboard pages
const StaffDashboard = lazy(() => import('@pages/dashboard/StaffDashboard'))
const AdminDashboard = lazy(() => import('@pages/dashboard/AdminDashboard'))

// Module pages - these will be updated when you create the actual pages
const CustomerDashboard = lazy(() => import('@pages/customers/CustomerDashboard'))
const LoanDashboard = lazy(() => import('@pages/loans/LoanDashboard'))
const RepaymentDashboard = lazy(() => import('@pages/repayments/RepaymentDashboard'))
const ReportDashboard = lazy(() => import('@pages/reports/ReportDashboard'))
const NotificationDashboard = lazy(() => import('@pages/notifications/NotificationDashboard'))

// Documentation pages
const ApiDocumentation = lazy(() => import('@pages/docs/ApiDocumentation'))
const UserGuide = lazy(() => import('@pages/docs/UserGuide'))

// Support pages
const HelpCenter = lazy(() => import('@pages/support/HelpCenter'))
const ContactSupport = lazy(() => import('@pages/support/ContactSupport'))

// 🌍 Public Routes
export const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '/maintenance', element: <Maintenance /> },
  { path: '/help', element: <HelpCenter /> },
  { path: '/contact', element: <ContactSupport /> },
  { path: '/docs/api', element: <ApiDocumentation /> },
  { path: '/docs/user-guide', element: <UserGuide /> },
]

// 🔒 Protected Routes (Require authentication)
export const protectedRoutes = [
  { path: '/profile', element: <Profile /> },
  { path: '/two-factor-auth', element: <TwoFactorAuth /> },
  
  // Dashboard routes
  { path: '/', element: <StaffDashboard /> },
  { path: '/admin-dashboard', element: <AdminDashboard />, adminOnly: true },
  
  // Module routes (accessible by staff)
  { path: '/customers', element: <CustomerDashboard /> },
  { path: '/loans', element: <LoanDashboard /> },
  { path: '/repayments', element: <RepaymentDashboard /> },
  { path: '/reports', element: <ReportDashboard /> },
  { path: '/notifications', element: <NotificationDashboard /> },
  
  // Admin-only module routes
  //{ path: '/admin/staff', element: <StaffList />, adminOnly: true },
  //{ path: '/admin/audit-logs', element: <AuditLogs />, adminOnly: true },
  //{ path: '/admin/settings', element: <Settings />, adminOnly: true },
]

// 🚨 Error Routes
export const errorRoutes = [
  { path: '*', element: <NotFound /> },
]