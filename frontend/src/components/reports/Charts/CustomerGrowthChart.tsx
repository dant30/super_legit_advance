import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const CustomerGrowthChart: React.FC = () => {
  const data = [
    { month: 'Jan', new: 45, active: 1200, total: 5400 },
    { month: 'Feb', new: 52, active: 1280, total: 5920 },
    { month: 'Mar', new: 48, active: 1360, total: 6450 },
    { month: 'Apr', new: 61, active: 1450, total: 7100 },
    { month: 'May', new: 55, active: 1520, total: 7680 },
    { month: 'Jun', new: 67, active: 1630, total: 8350 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
        <Bar dataKey="new" fill="#3b82f6" name="New Customers" radius={[8, 8, 0, 0]} />
        <Bar dataKey="active" fill="#10b981" name="Active Customers" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CustomerGrowthChart