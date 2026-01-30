import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { TrendingUp, TrendingDown, Users, AlertCircle, ArrowRight, Clock, CreditCard, DollarSign } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { RootState } from '@/store/store'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Loading from '@/components/shared/Loading'
import LoanOverview from '@/components/dashboard/LoanOverview'
import CollectionTarget from '@/components/dashboard/CollectionTarget'
import CustomerStats from '@/components/dashboard/CustomerStats'
import RecentActivities from '@/components/dashboard/RecentActivities'
import PendingTasks from '@/components/dashboard/PendingTasks'
import PerformanceMetrics from '@/components/dashboard/PerformanceMetrics'

interface DashboardStats {
  total_loans: number
  active_loans: number
  overdue_loans: number
  total_portfolio: number
  total_customers: number
  total_repayments: number
  total_amount_paid: number
  monthly_target: number
  monthly_collected: number
  collection_rate: number
  top_collectors?: Array<{
    name: string
    count: number
    total: number
  }>
  pending_approvals?: number
  pending_documents?: number
}

interface QuickStat {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  bgColor: string
}

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [loansRes, repaymentsRes, customersRes] = await Promise.all([
        axiosInstance.get('/loans/stats/'),
        axiosInstance.get('/repayments/dashboard/'),
        axiosInstance.get('/customers/stats/'),
      ])

      return {
        total_loans: loansRes.data.summary.total_loans,
        active_loans: loansRes.data.summary.total_active_loans,
        overdue_loans: loansRes.data.summary.total_overdue_loans,
        total_portfolio: loansRes.data.summary.total_amount_approved,
        total_customers: customersRes.data.total_customers,
        total_repayments: repaymentsRes.data.overall_statistics.total_repayments,
        total_amount_paid: repaymentsRes.data.overall_statistics.total_amount_paid,
        monthly_target: repaymentsRes.data.monthly_target,
        monthly_collected: repaymentsRes.data.monthly_statistics.amount,
        collection_rate:
          (repaymentsRes.data.monthly_statistics.amount / repaymentsRes.data.monthly_target) * 100,
        top_collectors: repaymentsRes.data.top_collectors,
        pending_approvals: loansRes.data.pending_approvals,
        pending_documents: loansRes.data.pending_documents,
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  useEffect(() => {
    // Additional initialization if needed
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-danger-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load dashboard</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </Card>
      </div>
    )
  }

  // Safe default values
  const statsData = stats || {
    total_loans: 0,
    active_loans: 0,
    overdue_loans: 0,
    total_portfolio: 0,
    total_customers: 0,
    total_repayments: 0,
    total_amount_paid: 0,
    monthly_target: 0,
    monthly_collected: 0,
    collection_rate: 0,
    top_collectors: [],
    pending_approvals: 0,
    pending_documents: 0,
  }

  const quickStats: QuickStat[] = [
    {
      label: 'Active Loans',
      value: statsData.active_loans,
      icon: <CreditCard className="h-6 w-6" />,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900/20',
    },
    {
      label: 'Total Portfolio',
      value: `KES ${((statsData.total_portfolio || 0) / 1000000).toFixed(1)}M`,
      change: 12.5,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900/20',
    },
    {
      label: 'Overdue Loans',
      value: statsData.overdue_loans,
      change: -5.2,
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100 dark:bg-danger-900/20',
    },
    {
      label: 'Total Customers',
      value: statsData.total_customers,
      change: 8.3,
      icon: <Users className="h-6 w-6" />,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900/20',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.first_name || 'User'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Here's what's happening with your business today
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">View Reports</Button>
            <Button>View All Data</Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    {stat.change !== undefined && (
                      <span
                        className={`flex items-center gap-1 text-sm font-medium ${
                          stat.change > 0 ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        {stat.change > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(stat.change)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Alerts Section */}
        {statsData.pending_approvals && statsData.pending_approvals > 0 && (
          <Card className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-warning-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-warning-900 dark:text-warning-100">
                    {statsData.pending_approvals} Pending Approvals
                  </p>
                  <p className="text-sm text-warning-700 dark:text-warning-200">
                    {statsData.pending_documents || 0} applications awaiting documents
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm">
                Review Now
              </Button>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Overview Widget */}
            <LoanOverview
              totalLoans={statsData.total_loans}
              activeLoans={statsData.active_loans}
              overdueLoans={statsData.overdue_loans}
              totalPortfolio={statsData.total_portfolio}
            />

            {/* Collection Performance */}
            <CollectionTarget
              monthlyTarget={statsData.monthly_target}
              monthlyCollected={statsData.monthly_collected}
              collectionRate={statsData.collection_rate}
            />

            {/* Recent Activities */}
            <RecentActivities />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <PerformanceMetrics />

            {/* Top Collectors */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Collectors</h3>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
              {statsData.top_collectors && statsData.top_collectors.length > 0 ? (
                <div className="space-y-3">
                  {statsData.top_collectors.slice(0, 5).map((collector, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{collector.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{collector.count} payments</p>
                      </div>
                      <p className="text-sm font-semibold text-success-600">KES {Number(collector.total).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">No collections yet</p>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="secondary">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create New Loan
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Collect Payment
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  <Users className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
                <Button className="w-full justify-start" variant="secondary">
                  <Clock className="h-4 w-4 mr-2" />
                  View Repayments
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Row - Tasks and Customer Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingTasks />
          <CustomerStats />
        </div>
      </div>
    </>
  )
}

export default Dashboard