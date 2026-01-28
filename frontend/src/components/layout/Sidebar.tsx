import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, Home, Users, CreditCard, Settings, LogOut, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const resp = await axiosInstance.get('/repayments/dashboard/')
      return resp.data
    },
    staleTime: 1000 * 60 * 5,
  })

  const { data: loanStats } = useQuery({
    queryKey: ['loanStats'],
    queryFn: async () => {
      const resp = await axiosInstance.get('/loans/stats/')
      return resp.data
    },
    staleTime: 1000 * 60 * 5,
  })

  // Menu configuration
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: <Home className="h-5 w-5" />,
      badge: 0,
    },
    {
      id: 'customers',
      label: 'Customers',
      path: '/customers',
      icon: <Users className="h-5 w-5" />,
      badge: 0,
      submenu: [
        { id: 'customers-list', label: 'All Customers', path: '/customers' },
        { id: 'customers-create', label: 'Create Customer', path: '/customers/create' },
        { id: 'blacklisted-customers', label: 'Blacklisted', path: '/customers?status=blacklisted', badge: stats?.blacklisted_customers || 0 },
      ],
    },
    {
      id: 'loans',
      label: 'Loans',
      path: '/loans',
      icon: <CreditCard className="h-5 w-5" />,
      badge: 0,
      submenu: [
        { id: 'loans-list', label: 'All Loans', path: '/loans' },
        { id: 'loans-create', label: 'Create Loan', path: '/loans/create' },
        { id: 'loan-applications', label: 'Applications', path: '/loans/applications' },
        { id: 'loan-approvals', label: 'Approvals', path: '/loans/approvals', badge: stats?.pending_approvals || 0 },
        { id: 'active-loans', label: 'Active', path: '/loans/active' },
        { id: 'overdue-loans', label: 'Overdue', path: '/loans/overdue', badge: stats?.overdue_loans || 0 },
        { id: 'loan-calculator', label: 'Calculator', path: '/loans/calculator' },
      ],
    },
    {
      id: 'repayments',
      label: 'Repayments',
      path: '/repayments',
      icon: <DollarSign className="h-5 w-5" />,
      badge: 0,
      submenu: [
        { id: 'all-payments', label: 'All Payments', path: '/repayments' },
        { id: 'payment-schedule', label: 'Schedule', path: '/repayments/schedule' },
        { id: 'collect-payment', label: 'Collect Payment', path: '/repayments/collect' },
        { id: 'overdue-repayments', label: 'Overdue', path: '/repayments?status=OVERDUE', badge: stats?.overdue_repayments || 0 },
      ],
    },
    {
      id: 'mpesa',
      label: 'M-Pesa',
      path: '/mpesa',
      icon: <Smartphone className="h-5 w-5" />,
      badge: 0,
      submenu: [
        { id: 'mpesa-transactions', label: 'Transactions', path: '/mpesa/transactions' },
        { id: 'mpesa-stk-push', label: 'STK Push', path: '/mpesa/stk-push' },
        { id: 'mpesa-c2b', label: 'C2B', path: '/mpesa/c2b' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="h-5 w-5" />,
      badge: 0,
      submenu: [
        { id: 'reports-overview', label: 'Overview', path: '/reports' },
        { id: 'loans-report', label: 'Loans Report', path: '/reports/loans' },
        { id: 'payments-report', label: 'Payments Report', path: '/reports/payments' },
        { id: 'customers-report', label: 'Customer Report', path: '/reports/customers' },
      ],
    },
    ...(user?.is_superuser || user?.is_staff ? [
      {
        id: 'audit-log',
        label: 'Audit Log',
        path: '/audit',
        icon: <Shield className="h-5 w-5" />,
        badge: 0,
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: <Settings className="h-5 w-5" />,
        badge: 0,
        submenu: [
          { id: 'general-settings', label: 'General', path: '/settings/general' },
          { id: 'loan-settings', label: 'Loan Settings', path: '/settings/loans' },
          { id: 'payment-settings', label: 'Payment Settings', path: '/settings/payments' },
          { id: 'notification-settings', label: 'Notifications', path: '/settings/notifications' },
        ],
      },
    ] : []),
  ]

  // Auto-expand based on current route
  useEffect(() => {
    const currentPath = location.pathname
    const parentItem = menuItems.find(item => 
      item.submenu?.some(subItem => subItem.path === currentPath) ||
      item.path === currentPath
    )
    if (parentItem && !expandedItems.includes(parentItem.id)) {
      setExpandedItems(prev => [...prev, parentItem.id])
    }
  }, [location.pathname])

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">SLA</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <NavLink
                to={item.path}
                onClick={() => item.submenu && toggleExpand(item.id)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {(item.badge || 0) > 0 && (
                  <span className="badge-danger ml-auto">{item.badge}</span>
                )}
              </NavLink>

              {/* Submenu */}
              {item.submenu && expandedItems.includes(item.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.id}
                      to={subItem.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded-lg text-sm transition ${
                          isActive
                            ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`
                      }
                    >
                      {subItem.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4 flex-shrink-0 bg-gray-50 dark:bg-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
        <div className="px-3 mt-3 text-xs text-gray-500 dark:text-gray-500">
          <p>v2.1.0</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar