// frontend/src/pages/dashboard/AdminDashboard.jsx
import React from 'react'

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-44 border border-dashed border-gray-300 rounded-lg bg-gray-50">
    <p className="text-sm text-gray-500">
      {title} — <span className="italic">coming soon</span>
    </p>
  </div>
)

const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          System-wide overview and controls
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Placeholder title="System Statistics" />
        <Placeholder title="Staff Performance" />
        <Placeholder title="Loan Portfolio" />
        <Placeholder title="Repayment Metrics" />
        <Placeholder title="Revenue & Collections" />
        <Placeholder title="Recent Activity" />
      </div>
    </div>
  )
}

export default AdminDashboard
