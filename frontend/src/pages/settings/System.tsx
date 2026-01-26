import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoSave: true,
  })

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <>
      <Helmet>
        <title>System Settings | Super Legit Advance</title>
      </Helmet>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configure system-wide preferences
          </p>
        </div>

        <Card className="p-6 space-y-6">
          {/* Theme */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Theme</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={settings.theme === 'light'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                />
                <span className="text-gray-900 dark:text-white">Light</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={settings.theme === 'dark'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                />
                <span className="text-gray-900 dark:text-white">Dark</span>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notifications</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
              />
              <span className="text-gray-900 dark:text-white">Enable notifications</span>
            </label>
          </div>

          {/* Auto-save */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Auto-save</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
              />
              <span className="text-gray-900 dark:text-white">Enable auto-save</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary">Reset to Defaults</Button>
            <Button>Save Settings</Button>
          </div>
        </Card>
      </div>
    </>
  )
}