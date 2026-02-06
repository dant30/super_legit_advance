import React from 'react'
import PageHeader from '@components/shared/PageHeader'
import NotificationSettings from '@components/notifications/NotificationSettings'

const NotificationSettingsPage = () => {
  const handleSave = async (settings) => {
    // Call API to save settings
    console.log('Saving settings:', settings)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Preferences"
        description="Customize your notification settings and preferences"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Notifications', href: '/notifications' },
          { label: 'Settings' },
        ]}
      />

      <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
        <NotificationSettings onSave={handleSave} />
      </div>
    </div>
  )
}

export default NotificationSettingsPage