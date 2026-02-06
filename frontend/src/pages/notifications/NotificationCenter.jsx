import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNotificationContext } from '@contexts/NotificationContext'
import { notificationsAPI } from '@api/notifications'
import PageHeader from '@components/shared/PageHeader'
import { NotificationList, NotificationSettings, BulkMessenger } from '@components/notifications'
import { Tabs, Card } from '@components/ui'
import { Bell, Settings, Send, BarChart3 } from 'lucide-react'

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetchNotifications,
    isLoading,
  } = useNotificationContext()

  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)

  // Fetch templates for bulk messenger
  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => notificationsAPI.getTemplates({ active: true }),
  })

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => notificationsAPI.getStats({ days: 7 }),
    refetchInterval: 60000, // Refetch every minute
  })

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') {
      return !n.read_at && ['SENT', 'DELIVERED'].includes(n.status)
    }
    return true
  })

  const tabs = [
    { id: 'all', label: `All (${notifications.length})`, icon: Bell },
    { id: 'unread', label: `Unread (${unreadCount})`, icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'bulk', label: 'Bulk Send', icon: Send },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="Manage all your notifications and preferences"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]}
      />

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Notifications',
              value: statsData.overall?.total_notifications || 0,
              icon: Bell,
            },
            {
              label: 'Delivery Rate',
              value: `${(statsData.overall?.delivery_rate || 0).toFixed(1)}%`,
              icon: BarChart3,
            },
            {
              label: 'This Week',
              value: statsData.overall?.notifications_last_period || 0,
              icon: Bell,
            },
            {
              label: 'Total Cost',
              value: `KES ${(statsData.overall?.total_cost || 0).toFixed(2)}`,
              icon: BarChart3,
            },
          ].map((stat, idx) => {
            const StatIcon = stat.icon
            return (
              <Card key={idx} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <StatIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 opacity-20" />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setPage(1)
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium text-sm
                  border-b-2 transition-colors whitespace-nowrap
                  ${
                    isActive
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }
                `}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
          {activeTab === 'all' && (
            <NotificationList
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              pagination={{ page, total_pages: 5 }}
              onPageChange={setPage}
            />
          )}

          {activeTab === 'unread' && (
            <NotificationList
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              onMarkAllRead={markAllAsRead}
              pagination={{ page, total_pages: 5 }}
              onPageChange={setPage}
            />
          )}

          {activeTab === 'settings' && <NotificationSettings onSave={() => {}} />}

          {activeTab === 'bulk' && (
            <BulkMessenger
              templates={templatesData?.results || []}
              onSend={async (data) => {
                await notificationsAPI.bulkSend(data)
                await refetchNotifications()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter