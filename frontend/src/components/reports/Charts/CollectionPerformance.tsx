import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CollectionPerformance: React.FC = () => {
  const data = [
    { week: 'W1', collected: 45000, target: 50000, overdue: 5000 },
    { week: 'W2', collected: 52000, target: 50000, overdue: 3500 },
    { week: 'W3', collected: 48000, target: 50000, overdue: 4200 },
    { week: 'W4', collected: 61000, target: 55000, overdue: 2100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="week" stroke="#6b7280" />
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
        <Area
          type="monotone"
          dataKey="collected"
          fill="#10b981"
          stroke="#10b981"
          fillOpacity={0.6}
          name="Collected"
        />
        <Area
          type="monotone"
          dataKey="overdue"
          fill="#ef4444"
          stroke="#ef4444"
          fillOpacity={0.6}
          name="Overdue"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default CollectionPerformance