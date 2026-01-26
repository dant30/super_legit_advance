import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface LoanStatusChartProps {
  data: Array<{
    status: string
    count: number
    amount: number
  }>
}

const LoanStatusChart: React.FC<LoanStatusChartProps> = ({ data }) => {
  const COLORS = {
    ACTIVE: '#10b981',
    APPROVED: '#3b82f6',
    DISBURSED: '#f59e0b',
    OVERDUE: '#ef4444',
    COMPLETED: '#8b5cf6',
    DEFAULTED: '#6b7280',
  }

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    fill: COLORS[item.status as keyof typeof COLORS] || '#9ca3af',
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default LoanStatusChart