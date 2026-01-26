// frontend/src/pages/settings/routes.tsx
import { lazy } from 'react'
import { AppRoute } from '@/router/routes'

const SettingsProfile = lazy(() => import('./Profile'))
const SettingsSystem = lazy(() => import('./System'))

const settingRoutes: AppRoute[] = [
  { path: 'profile', element: <SettingsProfile /> },
  { path: 'system', element: <SettingsSystem /> },
  { path: 'loan-settings', element: <SettingsSystem /> },
  { path: 'payment-settings', element: <SettingsSystem /> },
  { path: 'sms-settings', element: <SettingsSystem /> },
  { path: 'users', element: <SettingsSystem /> },
]

export default settingRoutes
