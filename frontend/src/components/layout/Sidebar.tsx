// frontend/src/components/layout/Sidebar.tsx
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
  BarChart3,
  Settings,
  Shield,
  ChevronDown,
  X,
  TrendingUp,
  Smartphone,
} from 'lucide-react'
import clsx from 'clsx'

interface MenuItem {
  title: string
  icon: React.ReactNode
  path: string
  exact?: boolean
  subItems?: Array<{ title: string; path: string; badge?: number }>
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

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const [repaymentsResp, loansResp] = await Promise.all([
          axiosInstance.get('/repayments/dashboard/'),
          axiosInstance.get('/loans/stats/')
        ])
        return {
          ...repaymentsResp.data,
          pending_loans: loansResp.data.pending_count || 0,
          blacklisted_customers: loansResp.data.blacklisted_count || 0
        }
      } catch (error) {
        return {
          active_loans: 0,
          overdue_repayments: 0,
          pending_approvals: 0,
          blacklisted_customers: 0,
          total_amount_paid: 0,
          pending_loans: 0
        }
      }
    },
    staleTime: 1000 * 60 * 5,
  })

  // ===== MENU CONFIGURATION =====
  const menuItems: MenuItem[] = [
    // Dashboard
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/',
      exact: true,
    },

    // ===== CUSTOMERS =====
    {
      title: 'Customers',
      icon: <Users className="h-5 w-5" />,
      path: '/customers',
      subItems: [
        { title: 'All Customers', path: '/customers' },
        { title: 'Create Customer', path: '/customers/create' },
        { 
          title: 'Blacklisted', 
          path: '/customers?status=BLACKLISTED', 
          badge: stats?.blacklisted_customers || 0 
        },
        { title: 'Analytics', path: '/customers/analytics' },
        { title: 'Import', path: '/customers/import' },
      ],
    },

    // ===== LOANS =====
    {
      title: 'Loans',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/loans',
      badge: stats?.pending_loans || 0,
      subItems: [
        { title: 'All Loans', path: '/loans' },
        { title: 'Create Loan', path: '/loans/create' },
        { 
          title: 'Approvals', 
          path: '/loans/approvals', 
          badge: stats?.pending_approvals || 0 
        },
        { title: 'Active', path: '/loans/active' },
        { title: 'Overdue', path: '/loans/overdue' },
        { title: 'Calculator', path: '/loans/calculator' },
      ],
    },

    // ===== REPAYMENTS =====
    {
      title: 'Repayments',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/repayments',
      badge: stats?.overdue_repayments || 0,
      subItems: [
        { title: 'All Payments', path: '/repayments' },
        { title: 'Schedule', path: '/repayments/schedule' },
        { title: 'Collect Payment', path: '/repayments/collect' },
        { 
          title: 'Overdue', 
          path: '/repayments?status=OVERDUE', 
          badge: stats?.overdue_repayments || 0 
        },
      ],
    },

    // ===== REPORTS =====
    {
      title: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/reports',
      subItems: [
        { title: 'Overview', path: '/reports' },
        { title: 'Loans Report', path: '/reports/loans' },
        { title: 'Payments Report', path: '/reports/payments' },
        { title: 'Customer Report', path: '/reports/customers' },
        { title: 'Collection Report', path: '/reports/collection' },
      ],
    },

    // ===== M-PESA =====
    {
      title: 'M-Pesa',
      icon: <Smartphone className="h-5 w-5" />,
      path: '/mpesa',
      subItems: [
        { title: 'Transactions', path: '/mpesa/transactions' },
        { title: 'STK Push', path: '/mpesa/stk-push' },
        { title: 'Settings', path: '/mpesa/settings' },
      ],
    },

    // ===== ADMIN SECTION =====
    ...(isAdmin ? [
      {
        title: 'Admin',
        icon: <Shield className="h-5 w-5" />,
        path: '/admin',
        subItems: [
          { title: 'Staff Management', path: '/admin/staff' },
          { title: 'Roles & Permissions', path: '/admin/roles' },
          { title: 'Audit Log', path: '/admin/audit' },
          { title: 'System Health', path: '/admin/health' },
        ],
      },
      {
        title: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        path: '/settings',
        subItems: [
          { title: 'General Settings', path: '/settings/general' },
          { title: 'Loan Settings', path: '/settings/loans' },
          { title: 'Payment Settings', path: '/settings/payments' },
          { title: 'System Configuration', path: '/settings/system' },
        ],
      },
    ] : []),
  ]

  // Auto-expand based on current route
  useEffect(() => {
    const currentPath = location.pathname
    const parentItem = menuItems.find(item => 
      item.subItems?.some(subItem => subItem.path === currentPath || currentPath.startsWith(item.path + '/')) ||
      (item.exact ? item.path === currentPath : currentPath.startsWith(item.path))
    )
    
    if (parentItem && !expandedItems.includes(parentItem.path)) {
      setExpandedItems(prev => [...prev, parentItem.path])
    }
  }, [location.pathname])

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    )
  }

  const handleClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold">
            SL
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Super Legit</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Staff Portal</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Loans</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats?.active_loans || 0}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">KES {(stats?.total_amount_paid || 0).toLocaleString()}</span> collected
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
                  {/* Parent Item with Submenu */}
                  <button
                    onClick={() => toggleExpand(item.path)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      expandedItems.includes(item.path)
                        ? "bg-gray-100 dark:bg-slate-700/50 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 dark:text-gray-400">
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                      {(item.badge ?? 0) > 0 && (
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      className={clsx(
                        "h-4 w-4 transition-transform duration-200",
                        expandedItems.includes(item.path) && "rotate-180"
                      )} 
                    />
                  </button>

                  {/* Submenu Items */}
                  {expandedItems.includes(item.path) && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          onClick={handleClick}
                          className={({ isActive }) =>
                            clsx(
                              "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                            )
                          }
                        >
                          <span>{subItem.title}</span>
                          {(subItem.badge ?? 0) > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                              {subItem.badge}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={handleClick}
                  className={({ isActive }: { isActive: boolean }) =>
                    clsx(
                      'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                    {(item.badge ?? 0) > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
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
      <div className="border-t border-gray-200 dark:border-slate-700 p-4">
        <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <p>Logged in as: <span className="font-medium">{user?.first_name || 'Staff'}</span></p>
          <p>Role: <span className="font-medium capitalize">{user?.role || 'staff'}</span></p>
          <p className="pt-2">v2.1.0 • © {new Date().getFullYear()}</p>
        </div>
      </div>
    </>
  )
}

export default Sidebar