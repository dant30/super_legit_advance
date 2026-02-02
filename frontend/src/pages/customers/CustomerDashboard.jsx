// frontend/src/pages/customers/CustomerDashboard.jsx
import React from 'react'

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-36 border border-dashed border-gray-300 rounded-md bg-gray-50">
    <p className="text-sm text-gray-500">
      {title} — <span className="italic">coming soon</span>
    </p>
  </div>
)

const CustomerDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Customer Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Your account overview
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Placeholder title="My Loans" />
        <Placeholder title="Repayment History" />
        <Placeholder title="Outstanding Balance" />
        <Placeholder title="Payment Methods" />
        <Placeholder title="Notifications" />
        <Placeholder title="Support Requests" />
      </div>
    </div>
  )
}

export default CustomerDashboard
