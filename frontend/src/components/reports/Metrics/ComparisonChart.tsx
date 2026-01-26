import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ComparisonChart: React.FC = () => {
  const data = [
    { metric: 'Approval Rate', current: 85.5, previous: 82.1 },
    { metric: 'Disbursement', current: 78.3, previous: 75.8 },
    { metric: 'Collection', current: 92.1, previous: 88.5 },
    { metric: 'Satisfaction', current: 4.5, previous: 4.1 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="metric" stroke="#6b7280" />
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
        <Bar dataKey="current" fill="#10b981" name="Current Period" radius={[8, 8, 0, 0]} />
        <Bar
          dataKey="previous"
          fill="#94a3b8"
          name="Previous Period"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ComparisonChart