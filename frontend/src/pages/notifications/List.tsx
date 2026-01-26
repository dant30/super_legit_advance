import { Helmet } from 'react-helmet-async'
import { Bell, Trash2 } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function NotificationList() {
  const notifications = [
    {
      id: 1,
      title: 'Loan Approved',
      message: 'Loan #LN-2024-001 has been approved',
      date: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: 2,
      title: 'Payment Reminder',
      message: 'Payment due for loan #LN-2024-002',
      date: new Date(Date.now() - 86400000),
      read: true,
    },
  ]

  return (
    <>
      <Helmet>
        <title>Notifications | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View system notifications and alerts
            </p>
          </div>
          <Button variant="secondary" size="sm">
            Mark all as read
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 flex items-start justify-between ${
                !notification.read ? 'border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <Bell className={`h-5 w-5 mt-0.5 flex-shrink-0 ${!notification.read ? 'text-primary-500' : 'text-gray-400'}`} />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {notification.date.toLocaleString()}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Trash2 className="h-4 w-4 text-gray-400" />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}