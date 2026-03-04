// frontend/src/pages/dashboard/StaffDashboard.jsx
import React from 'react'
import { PageHeader, Card } from '@components/ui'
import { useAuth } from '@hooks/useAuth'
import {
  Collections,
  MyCustomers,
  MyLoans,
  OverviewCards,
  PendingApprovals,
  Performance,
  RecentActivity,
} from '@components/dashboard'
import { Plus, FileText, Users, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'

const StaffDashboard = () => {
  const { user } = useAuth()

  // Inline one-liner to capitalize first letter
  const staffName = user?.first_name
    ? user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1)
    : 'Staff'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const quickActions = [
    {
      key: 'new-customer',
      label: 'New Customer',
      description: 'Create a customer profile',
      icon: Users,
      to: '/customers/create',
    },
    {
      key: 'new-loan',
      label: 'New Loan',
      description: 'Start a new loan application',
      icon: CreditCard,
      to: '/loans/create',
    },
    {
      key: 'import',
      label: 'Import Customers',
      description: 'Bulk upload customer data',
      icon: FileText,
      to: '/customers/import',
    },
    {
      key: 'quick-collect',
      label: 'Quick Collect',
      description: 'Record a repayment now',
      icon: Plus,
      to: '/repayments/create',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting()}, ${staffName} 👋`}
        subTitle="Overview of your daily operations"
      />

      <OverviewCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <MyCustomers />
          <MyLoans />
          <PendingApprovals />
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.key}
                  to={action.to}
                  className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
                >
                  <action.icon className="h-4 w-4 text-primary-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
          <Collections />
          <Performance />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
