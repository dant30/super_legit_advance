// frontend/src/pages/dashboard/StaffDashboard.jsx
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { PageHeader, Card } from '@components/ui'
import { useAuth } from '@hooks/useAuth'
import { Plus, FileText, Users, CreditCard } from 'lucide-react'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { formatDateTime } from '@utils/formatters'
import { t } from '../../../core/i18n/i18n'
import {
  Collections,
  MyCustomers,
  MyLoans,
  OverviewCards,
  PendingApprovals,
  Performance,
  RecentActivity,
} from '@components/dashboard'
import useDashboard from '../hooks/useDashboard'
import {
  selectDashboardCollections,
  selectDashboardCustomers,
  selectDashboardError,
  selectDashboardLastUpdatedAt,
  selectDashboardLoading,
  selectDashboardLoans,
  selectDashboardOverview,
  selectDashboardPendingApprovals,
  selectDashboardPerformance,
  selectDashboardRecentActivity,
} from '../store'

const StaffDashboard = () => {
  const { user } = useAuth()
  const { loadDashboard } = useDashboard()

  const overview = useSelector(selectDashboardOverview)
  const customers = useSelector(selectDashboardCustomers)
  const loans = useSelector(selectDashboardLoans)
  const pendingApprovals = useSelector(selectDashboardPendingApprovals)
  const collections = useSelector(selectDashboardCollections)
  const performance = useSelector(selectDashboardPerformance)
  const recentActivity = useSelector(selectDashboardRecentActivity)
  const loading = useSelector(selectDashboardLoading)
  const error = useSelector(selectDashboardError)
  const lastUpdatedAt = useSelector(selectDashboardLastUpdatedAt)

  useEffect(() => {
    loadDashboard().catch(() => {})
  }, [loadDashboard])

  const staffName = user?.first_name
    ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)
    : t('dashboard.page.fallbackStaff', 'Staff')

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.page.greetings.morning', 'Good morning')
    if (hour < 18) return t('dashboard.page.greetings.afternoon', 'Good afternoon')
    return t('dashboard.page.greetings.evening', 'Good evening')
  }

  const quickActions = [
    {
      key: 'new-customer',
      label: t('dashboard.page.actions.newCustomer.label', 'New Customer'),
      description: t('dashboard.page.actions.newCustomer.description', 'Create customer profile'),
      icon: Users,
      to: APP_ROUTES.customerCreate,
    },
    {
      key: 'new-loan',
      label: t('dashboard.page.actions.newLoan.label', 'New Loan'),
      description: t('dashboard.page.actions.newLoan.description', 'Start loan application'),
      icon: CreditCard,
      to: APP_ROUTES.loanCreate,
    },
    {
      key: 'import',
      label: t('dashboard.page.actions.importCustomers.label', 'Import Customers'),
      description: t('dashboard.page.actions.importCustomers.description', 'Bulk upload records'),
      icon: FileText,
      to: APP_ROUTES.customerImport,
    },
    {
      key: 'quick-collect',
      label: t('dashboard.page.actions.recordRepayment.label', 'Record Repayment'),
      description: t(
        'dashboard.page.actions.recordRepayment.description',
        'Post payment quickly'
      ),
      icon: Plus,
      to: APP_ROUTES.repaymentCreate,
    },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${getGreeting()}, ${staffName}`}
        subTitle={t('dashboard.page.subtitle', 'Portfolio and operations summary')}
      />

      <OverviewCards stats={overview} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <MyCustomers customers={customers} />
            <MyLoans loans={loans} />
          </div>
          <PendingApprovals approvals={pendingApprovals} />
        </div>

        <div className="space-y-4">
          <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              {t('dashboard.page.quickActionsTitle', 'Quick Actions')}
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((action) => (
                <Link
                  key={action.key}
                  to={action.to}
                  className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  style={{ borderColor: 'var(--surface-border)' }}
                >
                  <action.icon className="h-4 w-4 text-slate-700" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Collections summary={collections} />
          <Performance metrics={performance} />
          <RecentActivity items={recentActivity} />
        </div>
      </div>

      {loading && (
        <p className="text-xs text-slate-500" role="status" aria-live="polite">
          {t('dashboard.page.loading', 'Refreshing dashboard metrics...')}
        </p>
      )}
      {!loading && error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      )}
      {lastUpdatedAt && (
        <p className="text-xs text-slate-500">
          {t('dashboard.page.lastUpdated', 'Last updated')}: {formatDateTime(lastUpdatedAt)}
        </p>
      )}
    </div>
  )
}

export default StaffDashboard
