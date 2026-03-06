import React, { useMemo, useState } from 'react'
import { Bell, BarChart3, Eye, Plus, Send, Settings } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useAuth } from '@contexts/AuthContext'
import Button from '@components/ui/Button'
import Input from '@components/ui/Input'
import Modal, { ConfirmationModal } from '@components/ui/Modal'
import PageHeader from '@components/ui/PageHeader'
import Select from '@components/ui/Select'
import { NotificationList, NotificationSettings, BulkMessenger } from '@components/notifications'
import Card from '@components/ui/Card'
import useNotifications from '../hooks/useNotifications'
import {
  selectNotificationStats,
  selectNotificationTemplates,
  selectNotifications,
  selectNotificationsLoading,
  selectTotalNotifications,
  selectUnreadNotificationsCount,
} from '../store'

const typeOptions = [
  { value: 'SYSTEM_ALERT', label: 'System Alert' },
  { value: 'PAYMENT_REMINDER', label: 'Payment Reminder' },
  { value: 'PAYMENT_RECEIVED', label: 'Payment Received' },
  { value: 'PAYMENT_OVERDUE', label: 'Payment Overdue' },
  { value: 'LOAN_APPROVED', label: 'Loan Approved' },
  { value: 'LOAN_REJECTED', label: 'Loan Rejected' },
  { value: 'LOAN_DISBURSED', label: 'Loan Disbursed' },
  { value: 'ACCOUNT_UPDATE', label: 'Account Update' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'OTHER', label: 'Other' },
]

const channelOptions = [
  { value: 'IN_APP', label: 'In-App' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'PUSH', label: 'Push' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
]

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

const relatedTypeOptions = [
  { value: '', label: 'None' },
  { value: 'LOAN', label: 'Loan' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'REPAYMENT', label: 'Repayment' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'USER', label: 'User' },
]

const buildInitialForm = (user) => ({
  notification_type: 'SYSTEM_ALERT',
  channel: 'IN_APP',
  priority: 'MEDIUM',
  title: '',
  message: '',
  recipient_name: user?.full_name || user?.email || '',
  recipient_phone: user?.phone_number || '',
  recipient_email: user?.email || '',
  scheduled_for: '',
  related_object_type: '',
  related_object_id: '',
})

const NotificationCenter = () => {
  const { user } = useAuth()
  const notifications = useSelector(selectNotifications)
  const totalNotifications = useSelector(selectTotalNotifications)
  const unreadCount = useSelector(selectUnreadNotificationsCount)
  const statsData = useSelector(selectNotificationStats)
  const templates = useSelector(selectNotificationTemplates)
  const isLoading = useSelector(selectNotificationsLoading)

  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [composeError, setComposeError] = useState('')
  const [actionError, setActionError] = useState('')
  const [formData, setFormData] = useState(() => buildInitialForm(user))

  const {
    error,
    successMessage,
    useGetNotifications,
    useGetNotification,
    useGetTemplates,
    useGetStats,
    createNotification,
    createNotificationLoading,
    sendNotification,
    sendNotificationLoading,
    markAsRead,
    markAsReadLoading,
    markAllAsRead,
    markAllAsReadLoading,
    deleteNotification,
    deleteNotificationLoading,
    bulkSend,
    bulkSendLoading,
  } = useNotifications()

  const notificationsQuery = useGetNotifications({ page, page_size: 10, ordering: '-created_at' })
  useGetTemplates({ active: true })
  useGetStats({ days: 7 }, { refetchInterval: 60000 })
  const selectedNotificationQuery = useGetNotification(selectedNotificationId, { enabled: !!selectedNotificationId })

  const totalPages = Math.max(1, Math.ceil((totalNotifications || 0) / 10))
  const selectedNotification = selectedNotificationQuery.data
    || notifications.find((item) => item.id === selectedNotificationId)
    || null

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((n) => !n.read_at && ['SENT', 'DELIVERED'].includes(n.status))
    }
    return notifications
  }, [activeTab, notifications])

  const tabs = [
    { id: 'all', label: `All (${notifications.length})`, icon: Bell },
    { id: 'unread', label: `Unread (${unreadCount})`, icon: Eye },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'bulk', label: 'Bulk Send', icon: Send },
  ]

  const normalizeActionError = (rawError, fallback) => {
    const payload = rawError?.response?.data
    if (typeof payload?.detail === 'string') return payload.detail
    if (typeof payload?.error === 'string') return payload.error
    if (typeof payload?.message === 'string') return payload.message
    if (payload && typeof payload === 'object') {
      const firstValue = Object.values(payload).find((value) => typeof value === 'string' || (Array.isArray(value) && value.length > 0))
      if (typeof firstValue === 'string') return firstValue
      if (Array.isArray(firstValue)) return firstValue[0]
    }
    return rawError?.message || fallback
  }

  const resetComposer = () => {
    setFormData(buildInitialForm(user))
    setComposeError('')
  }

  const handleComposeFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setComposeError('')
  }

  const handleCreateNotification = async (event) => {
    event.preventDefault()
    setComposeError('')

    try {
      const payload = {
        notification_type: formData.notification_type,
        channel: formData.channel,
        priority: formData.priority,
        title: formData.title,
        message: formData.message,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        recipient_email: formData.recipient_email,
      }

      if (formData.scheduled_for) {
        payload.scheduled_for = new Date(formData.scheduled_for).toISOString()
      }
      if (formData.related_object_type) {
        payload.related_object_type = formData.related_object_type
      }
      if (formData.related_object_id) {
        payload.related_object_id = formData.related_object_id
      }

      await createNotification(payload)
      setIsComposeOpen(false)
      resetComposer()
      await notificationsQuery.refetch()
    } catch (rawError) {
      setComposeError(normalizeActionError(rawError, 'Failed to create notification.'))
    }
  }

  const handleSendNotification = async (notificationId) => {
    setActionError('')
    try {
      await sendNotification({ id: notificationId, payload: {} })
      await notificationsQuery.refetch()
      if (selectedNotificationId === notificationId) {
        await selectedNotificationQuery.refetch?.()
      }
    } catch (rawError) {
      setActionError(normalizeActionError(rawError, 'Failed to send notification.'))
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    setActionError('')
    try {
      await markAsRead(notificationId)
      await notificationsQuery.refetch()
      if (selectedNotificationId === notificationId) {
        await selectedNotificationQuery.refetch?.()
      }
    } catch (rawError) {
      setActionError(normalizeActionError(rawError, 'Failed to mark notification as read.'))
    }
  }

  const handleMarkAllRead = async () => {
    setActionError('')
    try {
      await markAllAsRead()
      await notificationsQuery.refetch()
    } catch (rawError) {
      setActionError(normalizeActionError(rawError, 'Failed to mark all notifications as read.'))
    }
  }

  const handleDeleteNotification = async () => {
    if (!deleteTargetId) return

    setActionError('')
    try {
      await deleteNotification(deleteTargetId)
      if (selectedNotificationId === deleteTargetId) {
        setSelectedNotificationId(null)
      }
      setDeleteTargetId(null)
      await notificationsQuery.refetch()
    } catch (rawError) {
      setActionError(normalizeActionError(rawError, 'Failed to delete notification.'))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subTitle="Create, send, read, and manage operational notifications from one place."
        extra={[
          unreadCount > 0 ? (
            <Button
              key="mark-all"
              variant="outline"
              loading={markAllAsReadLoading}
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </Button>
          ) : null,
          <Button
            key="compose"
            leadingIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              resetComposer()
              setIsComposeOpen(true)
            }}
          >
            New Notification
          </Button>,
        ].filter(Boolean)}
      />

      {(error || actionError || successMessage) ? (
        <div className="space-y-3">
          {error ? (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>
          ) : null}
          {actionError ? (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{actionError}</div>
          ) : null}
          {successMessage ? (
            <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">{successMessage}</div>
          ) : null}
        </div>
      ) : null}

      {statsData && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Notifications',
              value: statsData.overall?.total_notifications || 0,
              icon: Bell,
            },
            {
              label: 'Unread',
              value: unreadCount,
              icon: Eye,
            },
            {
              label: 'Delivery Rate',
              value: `${(statsData.overall?.delivery_rate || 0).toFixed(1)}%`,
              icon: BarChart3,
            },
            {
              label: 'Total Cost',
              value: `KES ${(statsData.overall?.total_cost || 0).toFixed(2)}`,
              icon: Send,
            },
          ].map((stat) => {
            const StatIcon = stat.icon
            return (
              <Card
                key={stat.label}
                className="rounded-xl border bg-surface-panel p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                style={{ borderColor: 'var(--surface-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{stat.label}</p>
                    <p className="mt-2 text-xl font-semibold text-text-primary">{stat.value}</p>
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
                className={[
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
                ].join(' ')}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800/50 sm:p-6">
          {activeTab === 'all' && (
            <NotificationList
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onSend={handleSendNotification}
              onDelete={setDeleteTargetId}
              onNotificationClick={(notification) => setSelectedNotificationId(notification.id)}
              onMarkAllRead={handleMarkAllRead}
              pagination={{ page, total_pages: totalPages }}
              onPageChange={setPage}
            />
          )}

          {activeTab === 'unread' && (
            <NotificationList
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onSend={handleSendNotification}
              onDelete={setDeleteTargetId}
              onNotificationClick={(notification) => setSelectedNotificationId(notification.id)}
              onMarkAllRead={handleMarkAllRead}
              pagination={{ page, total_pages: totalPages }}
              onPageChange={setPage}
            />
          )}

          {activeTab === 'settings' && <NotificationSettings onSave={() => {}} />}

          {activeTab === 'bulk' && (
            <BulkMessenger
              templates={templates}
              isSending={bulkSendLoading}
              error={actionError}
              onSend={async (data) => {
                await bulkSend(data)
                await notificationsQuery.refetch()
              }}
            />
          )}
        </div>
      </div>

      <Modal
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Create Notification"
        description="Create an operational notification using the backend notification contract."
        size="lg"
      >
        <form onSubmit={handleCreateNotification} className="space-y-4">
          {composeError ? (
            <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{composeError}</div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select label="Type" options={typeOptions} value={formData.notification_type} onValueChange={(value) => handleComposeFieldChange('notification_type', value)} />
            <Select label="Channel" options={channelOptions} value={formData.channel} onValueChange={(value) => handleComposeFieldChange('channel', value)} />
            <Select label="Priority" options={priorityOptions} value={formData.priority} onValueChange={(value) => handleComposeFieldChange('priority', value)} />
            <Input label="Scheduled For" type="datetime-local" value={formData.scheduled_for} onChange={(event) => handleComposeFieldChange('scheduled_for', event.target.value)} />
            <Input label="Recipient Name" value={formData.recipient_name} onChange={(event) => handleComposeFieldChange('recipient_name', event.target.value)} required />
            <Input label="Recipient Phone" value={formData.recipient_phone} onChange={(event) => handleComposeFieldChange('recipient_phone', event.target.value)} required />
            <Input label="Recipient Email" type="email" value={formData.recipient_email} onChange={(event) => handleComposeFieldChange('recipient_email', event.target.value)} />
            <Select label="Related Object Type" options={relatedTypeOptions} value={formData.related_object_type} onValueChange={(value) => handleComposeFieldChange('related_object_type', value)} />
            <div className="md:col-span-2">
              <Input label="Related Object ID" value={formData.related_object_id} onChange={(event) => handleComposeFieldChange('related_object_id', event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Input label="Title" value={formData.title} onChange={(event) => handleComposeFieldChange('title', event.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notification-message" className="ui-label">Message</label>
              <textarea
                id="notification-message"
                rows={5}
                value={formData.message}
                onChange={(event) => handleComposeFieldChange('message', event.target.value)}
                className="ui-control ui-focus mt-1 w-full px-3 py-2 text-sm text-gray-900"
                required
              />
            </div>
          </div>

          <Modal.Footer>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createNotificationLoading}>Create Notification</Button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal
        open={Boolean(selectedNotificationId)}
        onClose={() => setSelectedNotificationId(null)}
        title={selectedNotification?.title || 'Notification Detail'}
        description={selectedNotification?.notification_type_display || selectedNotification?.notification_type || 'Notification'}
        size="lg"
      >
        {selectedNotification ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Status</p>
                <p className="mt-1 text-sm text-text-primary">{selectedNotification.status_display || selectedNotification.status}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Channel</p>
                <p className="mt-1 text-sm text-text-primary">{selectedNotification.channel_display || selectedNotification.channel}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Recipient</p>
                <p className="mt-1 text-sm text-text-primary">{selectedNotification.recipient_name || selectedNotification.recipient_info?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Created</p>
                <p className="mt-1 text-sm text-text-primary">{selectedNotification.created_at ? new Date(selectedNotification.created_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Message</p>
              <div className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-text-primary dark:border-neutral-700 dark:bg-neutral-900/40">
                {selectedNotification.message}
              </div>
            </div>

            <Modal.Footer className="flex-wrap">
              {['PENDING', 'FAILED'].includes(String(selectedNotification.status || '').toUpperCase()) ? (
                <Button loading={sendNotificationLoading} onClick={() => handleSendNotification(selectedNotification.id)}>
                  Send Now
                </Button>
              ) : null}
              {['SENT', 'DELIVERED'].includes(String(selectedNotification.status || '').toUpperCase()) ? (
                <Button variant="outline" loading={markAsReadLoading} onClick={() => handleMarkAsRead(selectedNotification.id)}>
                  Mark as Read
                </Button>
              ) : null}
              <Button variant="danger" loading={deleteNotificationLoading} onClick={() => setDeleteTargetId(selectedNotification.id)}>
                Delete
              </Button>
            </Modal.Footer>
          </div>
        ) : (
          <div className="py-8 text-sm text-text-muted">Loading notification details...</div>
        )}
      </Modal>

      <ConfirmationModal
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteNotification}
        title="Delete notification"
        description="Delete this notification? This action cannot be undone."
        confirmText="Delete Notification"
        loading={deleteNotificationLoading}
      />
    </div>
  )
}

export default NotificationCenter
