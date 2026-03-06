import React from 'react'
import Card from '@components/ui/Card'
import Tabs from '@components/ui/Tabs'
import ProgressBar from '@components/ui/ProgressBar'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
} from 'lucide-react'
import { formatCurrency } from '@utils/formatters'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const StaffPerformance = ({ performanceData = {} }) => {
  const {
    loansProcessed = 0,
    collectionsAmount = 0,
    approvalRate = 0,
    avgApprovalTime = 0,
    customerSatisfaction = 0,
    monthlyMetrics = [],
  } = performanceData

  const kpis = [
    {
      title: 'Loans Processed',
      value: loansProcessed,
      icon: <Target className="h-5 w-5 text-primary-600" />,
      trend: 'up',
      change: '+12%',
    },
    {
      title: 'Collections',
      value: formatCurrency(collectionsAmount),
      icon: <TrendingUp className="h-5 w-5 text-success-600" />,
      trend: 'up',
      change: '+8%',
    },
    {
      title: 'Approval Rate',
      value: `${approvalRate}%`,
      icon: <Award className="h-5 w-5 text-warning-600" />,
      trend: 'up',
      change: '+5%',
    },
    {
      title: 'Avg. Decision Time',
      value: `${avgApprovalTime}h`,
      icon: <Activity className="h-5 w-5 text-info-600" />,
      trend: 'down',
      change: '-2h',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <article
            key={kpi.title}
            className="rounded-xl border bg-surface-panel p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium animate-fade-in"
            style={{
              borderColor: 'var(--surface-border)',
              animationDelay: `${index * 35}ms`,
              animationFillMode: 'both',
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">{kpi.title}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
                {kpi.icon}
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold leading-none text-text-primary">{kpi.value}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              {kpi.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-feedback-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-feedback-warning" />
              )}
              <span className={kpi.trend === 'up' ? 'text-feedback-success' : 'text-feedback-warning'}>
                {kpi.change}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Charts & Details */}
      <Tabs
        items={[
          {
            label: 'Monthly Trends',
            key: 'trends',
            children: (
              <Card className="shadow-soft">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="loans"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="collections"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            ),
          },
          {
            label: 'Satisfaction',
            key: 'satisfaction',
            children: (
              <Card className="shadow-soft">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Customer Satisfaction
                      </span>
                      <span className="text-lg font-bold">
                        {customerSatisfaction}%
                      </span>
                    </div>
                    <ProgressBar percent={customerSatisfaction} />
                  </div>
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}

export default StaffPerformance

