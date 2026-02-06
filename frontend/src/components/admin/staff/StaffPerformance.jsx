import React from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Tabs,
} from '@components/ui'
import { Avatar, ProgressBar } from '@components/shared'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Award,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '@utils/formatters'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const StaffPerformance = ({ staff, performanceData = {} }) => {
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
      {/* KPI Cards */}
      <Row gutter={16}>
        {kpis.map((kpi, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="shadow-soft h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-success-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-success-600" />
                    )}
                    <span className="text-success-600">{kpi.change}</span>
                  </div>
                </div>
                <div className="text-gray-300">{kpi.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

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