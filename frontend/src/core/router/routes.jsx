// frontend/src/router/routes.jsx
import { lazy as reactLazy } from 'react'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const importWithRetry = async (importer, retries = 2, delayMs = 350) => {
  let lastError

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await importer()
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await wait(delayMs * (attempt + 1))
      }
    }
  }

  throw lastError
}

const lazy = (importer) => reactLazy(() => importWithRetry(importer))

// ========================================================
// PUBLIC PAGES (No Authentication Required)
// ========================================================
const Login = lazy(() => import('@pages/auth/pages/Login'))
const ForgotPassword = lazy(() => import('@pages/auth/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@pages/auth/pages/ResetPassword'))
const VerifyEmail = lazy(() => import('@pages/auth/pages/VerifyEmail'))
const NotFound = lazy(() => import('@pages/NotFound'))
const Unauthorized = lazy(() => import('@pages/Unauthorized'))
const Maintenance = lazy(() => import('@pages/Maintenance'))

// Documentation & Support (if these files dont exist, you can create simple placeholder components for now)
const ApiDocumentation = lazy(() => import('@pages/docs/ApiDocumentation'))
const UserGuide = lazy(() => import('@pages/docs/UserGuide'))
const HelpCenter = lazy(() => import('@pages/support/HelpCenter'))
const ContactSupport = lazy(() => import('@pages/support/ContactSupport'))

// Legal Pages
const TermsOfService = lazy(() => import('@pages/legal/TermsOfService'))
const PrivacyPolicy = lazy(() => import('@pages/legal/PrivacyPolicy'))

// ========================================================
// PROTECTED PAGES (Authentication Required)
// ========================================================

// Auth Pages
const Profile = lazy(() => import('@pages/auth/pages/Profile'))
const TwoFactorAuth = lazy(() => import('@pages/auth/pages/TwoFactorAuth'))

// Dashboard Pages
const StaffDashboard = lazy(() => import('@pages/dashboard/pages/StaffDashboard'))
const AdminDashboard = lazy(() => import('@pages/admin/dashboard/pages/AdminDashboard'))

// Customer Pages
const CustomerList = lazy(() => import('@pages/customers/pages/CustomerList'))
const CustomerCreate = lazy(() => import('@pages/customers/pages/CustomerCreate'))
const CustomerEdit = lazy(() => import('@pages/customers/pages/CustomerEdit'))
const CustomerDetail = lazy(() => import('@pages/customers/pages/CustomerDetail'))
const CustomerImport = lazy(() => import('@pages/customers/pages/CustomerImport'))
const CustomerExport = lazy(() => import('@pages/customers/pages/CustomerExport'))

// Loan Pages
const LoanList = lazy(() => import('@pages/loans/pages/LoanList'))
const LoanCreate = lazy(() => import('@pages/loans/pages/LoanCreate'))
const LoanEdit = lazy(() => import('@pages/loans/pages/LoanEdit'))
const LoanDetail = lazy(() => import('@pages/loans/pages/LoanDetail'))
const LoanApprovals = lazy(() => import('@pages/loans/pages/LoanApprovals'))
const LoanCalculator = lazy(() => import('@pages/loans/pages/LoanCalculator'))

// Repayment Pages
const RepaymentList = lazy(() => import('@pages/repayments/pages/RepaymentList'))
const RepaymentCreate = lazy(() => import('@pages/repayments/pages/RepaymentCreate'))
const RepaymentDetail = lazy(() => import('@pages/repayments/pages/RepaymentDetail'))
const PaymentHistory = lazy(() => import('@pages/repayments/pages/PaymentHistory'))
const OverdueRepayments = lazy(() => import('@pages/repayments/pages/OverdueRepayments'))

// Report Pages
const ReportDashboard = lazy(() => import('@pages/reports/pages/ReportDashboard'))
const LoansReport = lazy(() => import('@pages/reports/pages/LoansReport'))
const PaymentsReport = lazy(() => import('@pages/reports/pages/PaymentsReport'))
const CustomersReport = lazy(() => import('@pages/reports/pages/CustomersReport'))
const PerformanceReport = lazy(() => import('@pages/reports/pages/PerformanceReport'))
const CollectionReport = lazy(() => import('@pages/reports/pages/CollectionReport'))
const AuditReport = lazy(() => import('@pages/reports/pages/AuditReport'))

// Notification Pages
const NotificationCenter = lazy(() => import('@pages/notifications/pages/NotificationCenter'))
const NotificationSettings = lazy(() => import('@pages/notifications/pages/NotificationSettings'))

// ========================================================
// ADMIN-ONLY PAGES
// ========================================================

// Staff Management
const StaffList = lazy(() => import('@pages/admin/staff/pages/StaffList'))
const StaffCreate = lazy(() => import('@pages/admin/staff/pages/StaffCreate'))
const StaffEdit = lazy(() => import('@pages/admin/staff/pages/StaffEdit'))
const StaffDetail = lazy(() => import('@pages/admin/staff/pages/StaffDetail'))

// System Settings
const SystemSettings = lazy(() => import('@pages/admin/settings/pages/SystemSettings'))
const LoanProducts = lazy(() => import('@pages/admin/settings/pages/LoanProducts'))
const InterestRates = lazy(() => import('@pages/admin/settings/pages/InterestRates'))
const BackupRestore = lazy(() => import('@pages/admin/settings/pages/BackupRestore'))
const SystemHealth = lazy(() => import('@pages/admin/settings/pages/SystemHealth'))

// Role Management
const RoleList = lazy(() => import('@pages/admin/roles/pages/RoleList'))
const RoleCreate = lazy(() => import('@pages/admin/roles/pages/RoleCreate'))
const RoleEdit = lazy(() => import('@pages/admin/roles/pages/RoleEdit'))

// Audit
const AuditLogs = lazy(() => import('@pages/admin/audit/pages/AuditLogs'))
const AuditDetail = lazy(() => import('@pages/admin/audit/pages/AuditDetail'))

// ========================================================
// 🌍 PUBLIC ROUTES (No Auth Required)
// ========================================================
export const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '/maintenance', element: <Maintenance /> },
  
  // Documentation
  { path: '/docs/api', element: <ApiDocumentation /> },
  { path: '/docs/user-guide', element: <UserGuide /> },
  
  // Support
  { path: '/help', element: <HelpCenter /> },
  { path: '/contact', element: <ContactSupport /> },
  
  // Legal
  { path: '/terms', element: <TermsOfService /> },
  { path: '/privacy', element: <PrivacyPolicy /> },
]

// ========================================================
// 🔒 PROTECTED ROUTES (Auth Required)
// ========================================================
export const protectedRoutes = [
  // Auth & Profile
  { path: '/profile', element: <Profile /> },
  { path: '/two-factor-auth', element: <TwoFactorAuth /> },
  
  // Dashboard - Default for all authenticated users
  { path: '/', element: <StaffDashboard /> },
  
  // ========== CUSTOMER ROUTES ==========
  {
    path: '/customers',
    children: [
      { index: true, element: <CustomerList /> },
      { path: 'create', element: <CustomerCreate /> },
      { path: 'import', element: <CustomerImport /> },
      { path: 'export', element: <CustomerExport /> },
      { path: ':id', element: <CustomerDetail /> },
      { path: ':id/edit', element: <CustomerEdit /> },
    ],
  },
  
  // ========== LOAN ROUTES ==========
  {
    path: '/loans',
    children: [
      { index: true, element: <LoanList /> },
      { path: 'create', element: <LoanCreate /> },
      { path: 'calculator', element: <LoanCalculator /> },
      { path: 'approvals', element: <LoanApprovals /> },
      { path: ':id', element: <LoanDetail /> },
      { path: ':id/edit', element: <LoanEdit /> },
    ],
  },
  
  // ========== REPAYMENT ROUTES ==========
  {
    path: '/repayments',
    children: [
      { index: true, element: <RepaymentList /> },
      { path: 'create', element: <RepaymentCreate /> },
      { path: 'history', element: <PaymentHistory /> },
      { path: 'overdue', element: <OverdueRepayments /> },
      { path: ':id', element: <RepaymentDetail /> },
    ],
  },
  
  // ========== REPORT ROUTES ==========
  {
    path: '/reports',
    children: [
      { index: true, element: <ReportDashboard /> },
      { path: 'loans', element: <LoansReport /> },
      { path: 'payments', element: <PaymentsReport /> },
      { path: 'customers', element: <CustomersReport /> },
      { path: 'performance', element: <PerformanceReport /> },
      { path: 'collection', element: <CollectionReport /> },
      { path: 'audit', element: <AuditReport /> },
    ],
  },
  
  // ========== NOTIFICATION ROUTES ==========
  {
    path: '/notifications',
    children: [
      { index: true, element: <NotificationCenter /> },
      { path: 'settings', element: <NotificationSettings /> },
    ],
  },
  
  // ========== ADMIN ROUTES ==========
  {
    path: '/admin',
    adminOnly: true, // ← JUST ADD THIS LINE
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      
      // Staff Management
      {
        path: 'staff',
        children: [
          { index: true, element: <StaffList /> },
          { path: 'create', element: <StaffCreate /> },
          { path: ':id', element: <StaffDetail /> },
          { path: ':id/edit', element: <StaffEdit /> },
        ],
      },
      
      // System Settings
      {
        path: 'settings',
        children: [
          { index: true, element: <SystemSettings /> },
          { path: 'products', element: <LoanProducts /> },
          { path: 'rates', element: <InterestRates /> },
          { path: 'backup', element: <BackupRestore /> },
          { path: 'health', element: <SystemHealth /> },
        ],
      },
      
      // Role Management
      {
        path: 'roles',
        children: [
          { index: true, element: <RoleList /> },
          { path: 'create', element: <RoleCreate /> },
          { path: ':id/edit', element: <RoleEdit /> },
        ],
      },
      
      // Audit Logs
      {
        path: 'audit',
        children: [
          { index: true, element: <AuditLogs /> },
          { path: ':id', element: <AuditDetail /> },
        ],
      },
    ],
  },
]

// ========================================================
// 🚨 ERROR ROUTES
// ========================================================
export const errorRoutes = [
  { path: '*', element: <NotFound /> },
]

