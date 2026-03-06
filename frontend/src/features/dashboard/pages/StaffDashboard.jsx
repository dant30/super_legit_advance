// frontend/src/pages/dashboard/StaffDashboard.jsx
import React, { Suspense, lazy, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PageHeader from '@components/ui/PageHeader'
import Card from '@components/ui/Card'
import { useAuth } from '@hooks/useAuth'
import { Plus, FileText, Users, CreditCard } from 'lucide-react'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { formatDateTime } from '@utils/formatters'
import { t } from '../../../core/i18n/i18n'
import OverviewCards from '../components/OverviewCards'
import MyCustomers from '../components/MyCustomers'
import MyLoans from '../components/MyLoans'
import PendingApprovals from '../components/PendingApprovals'
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

const CollectionsPanel = lazy(() => import('../components/Collections'))
const PerformancePanel = lazy(() => import('../components/Performance'))
const RecentActivityPanel = lazy(() => import('../components/RecentActivity'))

const SecondaryCardFallback = () => (
  <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }} aria-hidden="true">
    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
    <div className="mt-3 space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`dashboard-secondary-fallback-${index}`}
          className="h-10 animate-pulse rounded-md bg-slate-100"
          style={{ borderColor: 'var(--surface-border)' }}
        />
      ))}
    </div>
  </Card>
)

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

  const sectionAnimClass = loading
    ? 'opacity-70 translate-y-1'
    : 'animate-fade-in opacity-100 translate-y-0'

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${getGreeting()}, ${staffName}`}
        subTitle={t('dashboard.page.subtitle', 'Portfolio and operations summary')}
      />

      <OverviewCards stats={overview} loading={loading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`space-y-4 transition-all duration-300 ease-standard xl:col-span-2 ${sectionAnimClass}`}>
          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <MyCustomers customers={customers} loading={loading} />
            <MyLoans loans={loans} loading={loading} />
          </div>
          <PendingApprovals approvals={pendingApprovals} loading={loading} />
        </div>

        <div className={`space-y-4 transition-all duration-300 ease-standard ${sectionAnimClass}`}>
          <Card className="border bg-white shadow-sm" style={{ borderColor: 'var(--surface-border)' }}>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              {t('dashboard.page.quickActionsTitle', 'Quick Actions')}
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`quick-action-skeleton-${index}`}
                      className="h-12 animate-pulse rounded-md border bg-slate-100"
                      style={{ borderColor: 'var(--surface-border)' }}
                    />
                  ))
                : quickActions.map((action, index) => (
                    <Link
                      key={action.key}
                      to={action.to}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      style={{
                        borderColor: 'var(--surface-border)',
                        animationDelay: `${index * 35}ms`,
                        animationFillMode: 'both',
                      }}
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

          <Suspense fallback={<SecondaryCardFallback />}>
            <CollectionsPanel summary={collections} loading={loading} />
          </Suspense>
          <Suspense fallback={<SecondaryCardFallback />}>
            <PerformancePanel metrics={performance} loading={loading} />
          </Suspense>
          <Suspense fallback={<SecondaryCardFallback />}>
            <RecentActivityPanel items={recentActivity} loading={loading} />
          </Suspense>
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
