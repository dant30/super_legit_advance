import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card } from '@/components/ui/Card'
import { TrendingUp } from 'lucide-react'

interface LoanOverviewProps {
  totalLoans: number
  activeLoans: number
  overdueLoans: number
  totalPortfolio: number
}

const LoanOverview: React.FC<LoanOverviewProps> = ({
  totalLoans,
  activeLoans,
  overdueLoans,
  totalPortfolio,
}) => {
  const pieData = [
    { name: 'Active', value: activeLoans, color: '#10b981' },
    { name: 'Overdue', value: overdueLoans, color: '#ef4444' },
    { name: 'Other', value: Math.max(0, totalLoans - activeLoans - overdueLoans), color: '#94a3b8' },
  ]

  const barData = [
    { month: 'Jan', approved: 45, disbursed: 38, active: 32 },
    { month: 'Feb', approved: 52, disbursed: 45, active: 38 },
    { month: 'Mar', approved: 48, disbursed: 42, active: 35 },
    { month: 'Apr', approved: 61, disbursed: 55, active: 48 },
    { month: 'May', approved: 55, disbursed: 49, active: 42 },
    { month: 'Jun', approved: 67, disbursed: 60, active: activeLoans },
  ]

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Overview</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Performance summary for the last 6 months</p>
        </div>
        <TrendingUp className="h-6 w-6 text-primary-600" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLoans}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Loans</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-success-600">{activeLoans}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-danger-600">{overdueLoans}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Overdue</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary-600">KES {(totalPortfolio / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Portfolio</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Loan Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="approved" fill="#3b82f6" name="Approved" radius={[8, 8, 0, 0]} />
              <Bar dataKey="disbursed" fill="#10b981" name="Disbursed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="active" fill="#f59e0b" name="Active" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}

export default LoanOverview