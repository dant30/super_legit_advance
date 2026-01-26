import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { RootState } from '@/store/store'
import axiosInstance from '@/lib/axios'
import {
  Home,
  Users,
  CreditCard,
  DollarSign,
  Smartphone,
  Bell,
  BarChart3,
  FileText,
  Shield,
  Settings,
  X,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Calendar,
  Briefcase,
  Database,
  MessageSquare,
} from 'lucide-react'

interface MenuItem {
  title: string
  icon: React.ReactNode
  path: string
  exact?: boolean
  subItems?: SubMenuItem[]
  badge?: number
}

interface SubMenuItem {
  title: string
  path: string
  badge?: number
}

interface SidebarProps {
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const location = useLocation()

  const isAdmin = user?.is_superuser || user?.is_staff
  const userRole = user?.role || 'customer'

  // Auto-expand based on current route
  useEffect(() => {
    const currentPath = location.pathname
    const parentItem = menuItems.find(item => 
      item.subItems?.some(subItem => subItem.path === currentPath) ||
      item.path === currentPath
    )
    if (parentItem && !expandedItems.includes(parentItem.path)) {
      setExpandedItems(prev => [...prev, parentItem.path])
    }
  }, [location.pathname])

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
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/',
      exact: true,
    },
    {
      title: 'Customers',
      icon: <Users className="h-5 w-5" />,
      path: '/customers',
      subItems: [
        { title: 'All Customers', path: '/customers' },
        { title: 'Add Customer', path: '/customers/create' },
        { title: 'Blacklisted', path: '/customers?status=blacklisted', badge: stats?.blacklisted_customers || 0 },
      ],
    },
    {
      title: 'Loans',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/loans',
      badge: loanStats?.pending_count || 0,
      subItems: [
        { title: 'All Loans', path: '/loans' },
        { title: 'Create Loan', path: '/loans/create' },
        { title: 'Applications', path: '/loans/applications' },
        { title: 'Approvals', path: '/loans/approvals', badge: stats?.pending_approvals || 0 },
        { title: 'Active', path: '/loans/active' },
        { title: 'Overdue', path: '/loans/overdue', badge: stats?.overdue_loans || 0 },
        { title: 'Calculator', path: '/loans/calculator' },
      ],
    },
    {
      title: 'Repayments',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/repayments',
      badge: stats?.overdue_repayments || 0,
      subItems: [
        { title: 'All Payments', path: '/repayments' },
        { title: 'Schedule', path: '/repayments/schedule' },
        { title: 'Collect Payment', path: '/repayments/collect' },
        { title: 'Overdue', path: '/repayments?status=OVERDUE', badge: stats?.overdue_repayments || 0 },
      ],
    },
    {
      title: 'M-Pesa',
      icon: <Smartphone className="h-5 w-5" />,
      path: '/mpesa',
      subItems: [
        { title: 'Transactions', path: '/mpesa/transactions' },
        { title: 'STK Push', path: '/mpesa/stk-push' },
        { title: 'C2B', path: '/mpesa/c2b' },
      ],
    },
    {
      title: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/reports',
      subItems: [
        { title: 'Overview', path: '/reports' },
        { title: 'Loans Report', path: '/reports/loans' },
        { title: 'Payments Report', path: '/reports/payments' },
        { title: 'Customer Report', path: '/reports/customers' },
      ],
    },
    ...(isAdmin ? [
      {
        title: 'Audit Log',
        icon: <Shield className="h-5 w-5" />,
        path: '/audit',
      },
      {
        title: 'System',
        icon: <Settings className="h-5 w-5" />,
        path: '/settings',
        subItems: [
          { title: 'General', path: '/settings/general' },
          { title: 'Loan Settings', path: '/settings/loans' },
          { title: 'Payment Settings', path: '/settings/payments' },
          { title: 'Notifications', path: '/settings/notifications' },
        ],
      },
    ] : []),
  ]

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    )
  }

  const handleMenuItemClick = () => {
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
            SL
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Super Legit</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Advance</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Active Loans</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
                  {stats?.active_loans || 0}
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Total Paid</p>
                <p className="text-sm font-bold text-green-900 dark:text-green-200">
                  KES {(stats?.total_amount_paid || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2 space-y-1">
          {menuItems.map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.path)}
                    className="nav-item-inactive w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge > 0 && (
                        <span className="badge-danger">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedItems.includes(item.path) ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedItems.includes(item.path) && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          onClick={handleMenuItemClick}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700/50'
                            }`
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span>{subItem.title}</span>
                            {subItem.badge > 0 && (
                              <span className="badge-danger text-xs">
                                {subItem.badge}
                              </span>
                            )}
                          </div>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={handleMenuItemClick}
                  className={({ isActive }) =>
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                    {item.badge > 0 && (
                      <span className="badge-danger ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </NavLink>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4 flex-shrink-0 bg-gray-50 dark:bg-slate-700/50">
        <a
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white"
        >
          <AlertCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </a>
        <div className="px-3 mt-3 text-xs text-gray-500 dark:text-gray-500">
          <p>v2.1.0</p>
          <p className="mt-1">© {new Date().getFullYear()} Super Legit</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 