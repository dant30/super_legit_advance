// frontend/src/pages/dashboard/StaffDashboard.jsx
import React from 'react'
import { PageHeader } from '@components/shared'
import { useAuth } from '@hooks/useAuth'
import { QuickActions } from '@components/dashboard/common'
import {
  Collections,
  MyCustomers,
  MyLoans,
  OverviewCards,
  PendingApprovals,
  Performance,
  RecentActivity,
} from '@components/dashboard/staff'
import { Plus, FileText, Users, CreditCard } from 'lucide-react'

const StaffDashboard = () => {
  const { user } = useAuth()

  const staffName = user?.first_name || 'Staff'

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
        title={`${getGreeting()}, ${staffName}!`}
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
          <QuickActions actions={quickActions} />
          <Collections />
          <Performance />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
