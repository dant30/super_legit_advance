// frontend/src/pages/dashboard/StaffDashboard.jsx
import React from 'react'

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-40 border border-dashed border-gray-300 rounded-lg bg-gray-50">
    <p className="text-sm text-gray-500">
      {title} — <span className="italic">coming soon</span>
    </p>
  </div>
)

const StaffDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Staff Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of your daily operations
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Placeholder title="My Customers" />
        <Placeholder title="My Loans" />
        <Placeholder title="Repayments Overview" />
        <Placeholder title="Quick Actions" />
        <Placeholder title="Performance Summary" />
        <Placeholder title="Notifications" />
      </div>
    </div>
  )
}

export default StaffDashboard
