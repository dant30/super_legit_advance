import React, { useState, useCallback } from 'react'
import { Bell, Mail, MessageSquare, Settings } from 'lucide-react'
import { cn } from '@utils/cn'

const NotificationSettings = ({
  settings = {},
  onSave,
  isSaving = false,
  error = null,
}) => {
  const [localSettings, setLocalSettings] = useState(settings)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleToggle = useCallback((key, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const handleSave = async () => {
    try {
      await onSave(localSettings)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e) {
      console.error(e)
    }
  }

  const channels = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'in_app', label: 'In-App', icon: Bell },
  ]

  const notificationTypes = [
    { id: 'loan_approved', label: 'Loan Approved', description: 'When your loan is approved' },
    { id: 'loan_rejected', label: 'Loan Rejected', description: 'When your loan is rejected' },
    { id: 'payment_reminder', label: 'Payment Reminder', description: 'Upcoming payment reminders' },
    { id: 'payment_overdue', label: 'Payment Overdue', description: 'Overdue payment alerts' },
    { id: 'account_update', label: 'Account Update', description: 'Account changes and updates' },
    { id: 'system_alert', label: 'System Alert', description: 'Important system notifications' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Notification Settings
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Manage how and when you receive notifications
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
          <p className="text-sm text-danger-700 dark:text-danger-400">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
          <p className="text-sm text-success-700 dark:text-success-400">
            Settings saved successfully
          </p>
        </div>
      )}

      {/* Channel Preferences */}
      <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
          Preferred Channels
        </h3>
        <div className="space-y-4">
          {channels.map((channel) => {
            const Icon = channel.icon
            const isEnabled = localSettings[`channel_${channel.id}`] ?? true

            return (
              <div
                key={channel.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border transition',
                  isEnabled
                    ? 'border-primary-200 dark:border-primary-800/50 bg-primary-50/30 dark:bg-primary-900/10'
                    : 'border-neutral-200 dark:border-neutral-700'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {channel.label}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(`channel_${channel.id}`, !isEnabled)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition',
                    isEnabled
                      ? 'bg-primary-600'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition transform',
                      isEnabled && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
          Notification Types
        </h3>
        <div className="space-y-4">
          {notificationTypes.map((type) => {
            const isEnabled = localSettings[`type_${type.id}`] ?? true

            return (
              <div
                key={type.id}
                className={cn(
                  'flex items-start justify-between p-4 rounded-lg border transition',
                  isEnabled
                    ? 'border-primary-200 dark:border-primary-800/50 bg-primary-50/30 dark:bg-primary-900/10'
                    : 'border-neutral-200 dark:border-neutral-700'
                )}
              >
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">{type.label}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {type.description}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(`type_${type.id}`, !isEnabled)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition flex-shrink-0 ml-4',
                    isEnabled
                      ? 'bg-primary-600'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition transform',
                      isEnabled && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Other Settings */}
      <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
          Other Settings
        </h3>
        <div className="space-y-4">
          {[
            {
              id: 'quiet_hours_enabled',
              label: 'Quiet Hours',
              description: 'Disable notifications during specified hours',
            },
            {
              id: 'group_similar',
              label: 'Group Similar Notifications',
              description: 'Combine related notifications into one',
            },
            {
              id: 'sound_enabled',
              label: 'Sound Notifications',
              description: 'Play sound for new notifications',
            },
          ].map((setting) => {
            const isEnabled = localSettings[setting.id] ?? true

            return (
              <div
                key={setting.id}
                className="flex items-start justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">{setting.label}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {setting.description}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(setting.id, !isEnabled)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition flex-shrink-0 ml-4',
                    isEnabled
                      ? 'bg-primary-600'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition transform',
                      isEnabled && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'px-6 py-2 rounded-lg font-medium text-white transition',
            isSaving
              ? 'bg-primary-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          )}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

export default NotificationSettings