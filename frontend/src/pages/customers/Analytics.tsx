// frontend/src/pages/customers/Analytics.tsx
import React, { useEffect, useState } from 'react'
import { useCustomers } from '@/hooks/useCustomers'
import { Card } from '@/components/ui/Card'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Loading } from '@/components/shared/Loading'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const CustomerAnalytics: React.FC = () => {
  const { stats, statsLoading, statsError, getCustomerStats } = useCustomers()

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    loadStats()
  }, [timeRange])

  const loadStats = async () => {
    try {
      await getCustomerStats()
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: 'Analytics', href: '#' }
  ]

  if (statsLoading && !stats) {
    return <Loading message="Loading analytics..." />
  }

  if (statsError || !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
          <p className="text-gray-600 mb-4">{statsError || 'Unknown error'}</p>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Analytics</h1>
            <p className="text-gray-600 mt-2">Insights and statistics about your customers</p>
          </div>
          <div className="flex space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Customers</div>
              <div className="text-2xl font-bold">{stats.total_customers}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Active Customers</div>
              <div className="text-2xl font-bold">{stats.active_customers}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Blacklisted</div>
              <div className="text-2xl font-bold">{stats.blacklisted_customers}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">New Today</div>
              <div className="text-2xl font-bold">{stats.new_customers_today}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Gender Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.gender_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.gender_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.status_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Monthly Registrations */}
      {stats.monthly_registrations && stats.monthly_registrations.length > 0 && (
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">Monthly Registrations</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthly_registrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Loan Statistics */}
      {stats.loan_statistics && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Loan Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {stats.loan_statistics.customers_with_loans}
              </div>
              <div className="text-sm text-blue-600">Customers with Loans</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {stats.loan_statistics.customers_with_active_loans}
              </div>
              <div className="text-sm text-green-600">Active Loans</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {stats.loan_statistics.customers_with_overdue_loans}
              </div>
              <div className="text-sm text-orange-600">Overdue Loans</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CustomerAnalytics