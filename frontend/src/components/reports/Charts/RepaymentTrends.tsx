import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const RepaymentTrends: React.FC = () => {
  const data = [
    { month: 'Jan', collections: 45000, target: 50000, onTime: 95 },
    { month: 'Feb', collections: 52000, target: 50000, onTime: 97 },
    { month: 'Mar', collections: 48000, target: 50000, onTime: 92 },
    { month: 'Apr', collections: 61000, target: 55000, onTime: 98 },
    { month: 'May', collections: 55000, target: 55000, onTime: 94 },
    { month: 'Jun', collections: 67000, target: 60000, onTime: 99 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
        <Line
          type="monotone"
          dataKey="collections"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#3b82f6', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default RepaymentTrends