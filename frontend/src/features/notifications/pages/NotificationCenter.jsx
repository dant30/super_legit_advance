import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNotificationContext } from '@contexts/NotificationContext'
import PageHeader from '@components/ui/PageHeader'
import { NotificationList, NotificationSettings, BulkMessenger } from '@components/notifications'
import Card from '@components/ui/Card'
import { Bell, Settings, Send, BarChart3 } from 'lucide-react'
import useNotifications from '../hooks/useNotifications'
import {
  selectNotificationStats,
  selectNotificationTemplates,
  selectNotifications,
  selectNotificationsLoading,
  selectTotalNotifications,
  selectUnreadNotificationsCount,
} from '../store'

const NotificationCenter = () => {
  const notifications = useSelector(selectNotifications)
  const totalNotifications = useSelector(selectTotalNotifications)
  const unreadCount = useSelector(selectUnreadNotificationsCount)
  const statsData = useSelector(selectNotificationStats)
  const templates = useSelector(selectNotificationTemplates)
  const isLoading = useSelector(selectNotificationsLoading)

  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetchNotifications,
  } = useNotificationContext()

  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const { useGetNotifications, useGetTemplates, useGetStats, bulkSend, bulkSendLoading } = useNotifications()

  useGetNotifications({ page, page_size: 10, ordering: '-created_at' })
  useGetTemplates({ active: true })
  useGetStats({ days: 7 }, {
    refetchInterval: 60000, // Refetch every minute
  })

  const totalPages = Math.max(1, Math.ceil((totalNotifications || 0) / 10))

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
    { id: 'bulk', label: 'Bulk Loan Alerts', icon: Send },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loan Notification Center"
        subTitle="Manage loan lifecycle alerts, repayment reminders, and delivery preferences"
      />

      {/* Stats Cards */}
      {statsData && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
              <Card
                key={idx}
                className="rounded-xl border bg-surface-panel p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                style={{ borderColor: 'var(--surface-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{stat.label}</p>
                    <p className="mt-2 text-xl font-semibold text-text-primary">
                      {stat.value}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-text-secondary">
                    <StatIcon className="h-4 w-4" />
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 dark:border-neutral-700">
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
                  flex items-center gap-2 px-3 py-2.5 font-medium text-sm
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
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/50 sm:p-6">
          {activeTab === 'all' && (
            <NotificationList
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              pagination={{ page, total_pages: totalPages }}
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
              pagination={{ page, total_pages: totalPages }}
              onPageChange={setPage}
            />
          )}

          {activeTab === 'settings' && <NotificationSettings onSave={() => {}} />}

          {activeTab === 'bulk' && (
            <BulkMessenger
              templates={templates}
              isSending={bulkSendLoading}
              onSend={async (data) => {
                await bulkSend(data)
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


