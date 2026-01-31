// frontend/src/pages/customers/routes.tsx
import React from 'react'
import { RouteObject } from 'react-router-dom'
import PrivateRoute from '@/router/PrivateRoute'
import AdminRoute from '@/router/AdminRoute'

// Lazy load pages
const CustomerList = React.lazy(() => import('./List'))
const CustomerCreate = React.lazy(() => import('./Create'))
const CustomerEdit = React.lazy(() => import('./Edit'))
const CustomerDetail = React.lazy(() => import('./Detail'))
const Employment = React.lazy(() => import('./Employment'))
const Guarantors = React.lazy(() => import('./Guarantors'))
const Import = React.lazy(() => import('./Import'))
const Analytics = React.lazy(() => import('./Analytics'))
const Activity = React.lazy(() => import('./Activity'))

const customerRoutes: RouteObject[] = [
  {
    path: '',
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <CustomerList />
      },
      {
        path: 'create',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <CustomerCreate />
          }
        ]
      },
      {
        path: ':id',
        element: <CustomerDetail />
      },
      {
        path: ':id/edit',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <CustomerEdit />
          }
        ]
      },
      {
        path: ':id/employment',
        element: <Employment />
      },
      {
        path: ':id/guarantors',
        element: <Guarantors />
      },
      {
        path: 'import',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <Import />
          }
        ]
      },
      {
        path: 'analytics',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <Analytics />
          }
        ]
      },
      {
        path: ':id/activity',
        element: <Activity />
      }
    ]
  }
]

export default customerRoutes