// frontend/src/pages/notifications/routes.tsx
import { lazy } from 'react'
import { AppRoute } from '@/router/routes'

const NotificationList = lazy(() => import('./List'))
const NotificationSendSMS = lazy(() => import('./SendSMS'))

const notificationRoutes: AppRoute[] = [
  { path: '', element: <NotificationList /> },
  { path: 'send-sms', element: <NotificationSendSMS /> },
  { path: 'templates', element: <NotificationList /> },
]

export default notificationRoutes
