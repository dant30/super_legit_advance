// frontend/src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import axios from '@api/axios'
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
  UserPlus,
  FileText,
  Bell,
  Calendar,
  Calculator,
  Upload,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
} from 'lucide-react'
import clsx from 'clsx'
import { cn } from '@utils/cn'

const Sidebar = ({ onClose }) => {
  const { user, isAdmin, isStaff } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState([])
  const [stats, setStats] = useState({
    activeLoans: 0,
    overdueRepayments: 0,
    pendingApprovals: 0,
    blacklistedCustomers: 0,
    totalAmountPaid: 0,
    pendingLoans: 0,
  })

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const [customersResp, loansResp, repaymentsResp] = await Promise.all([
          axios.get('/customers/stats/'),
          axios.get('/loans/stats/'),
          axios.get('/repayments/stats/')
        ])
        return {
          ...customersResp.data,
          ...loansResp.data,
          ...repaymentsResp.data,
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        return {
          active_loans: 0,
          overdue_repayments: 0,
          pending_approvals: 0,
          blacklisted_customers: 0,
          total_amount_paid: 0,
          pending_loans: 0,
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (statsData) {
      setStats({
        activeLoans: statsData.active_loans || 0,
        overdueRepayments: statsData.overdue_repayments || 0,
        pendingApprovals: statsData.pending_approvals || 0,
        blacklistedCustomers: statsData.blacklisted_customers || 0,
        totalAmountPaid: statsData.total_amount_paid || 0,
        pendingLoans: statsData.pending_loans || 0,
      })
    }
  }, [statsData])

  // Menu configuration
  const menuItems = [
    // Dashboard
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/',
      exact: true,
      roles: ['admin', 'staff', 'officer', 'customer'],
    },

    // Customers
    {
      id: 'customers',
      title: 'Customers',
      icon: <Users className="h-5 w-5" />,
      path: '/customers',
      roles: ['admin', 'staff', 'officer'],
      badge: stats.blacklistedCustomers,
      subItems: [
        { title: 'All Customers', path: '/customers', icon: <Users className="h-4 w-4" /> },
        { title: 'Add New', path: '/customers/create', icon: <UserPlus className="h-4 w-4" /> },
        { title: 'Search', path: '/customers/search', icon: <Search className="h-4 w-4" /> },
        { title: 'Blacklisted', path: '/customers?status=blacklisted', icon: <AlertCircle className="h-4 w-4" />, badge: stats.blacklistedCustomers },
        { title: 'Import', path: '/customers/import', icon: <Upload className="h-4 w-4" /> },
        { title: 'Export', path: '/customers/export', icon: <Download className="h-4 w-4" /> },
      ],
    },

    // Loans
    {
      id: 'loans',
      title: 'Loans',
      icon: <CreditCard className="h-5 w-5" />,
      path: '/loans',
      roles: ['admin', 'staff', 'officer'],
      badge: stats.pendingLoans,
      subItems: [
        { title: 'All Loans', path: '/loans', icon: <CreditCard className="h-4 w-4" /> },
        { title: 'New Application', path: '/loans/create', icon: <FileText className="h-4 w-4" /> },
        { title: 'Approvals', path: '/loans/approvals', icon: <CheckCircle className="h-4 w-4" />, badge: stats.pendingApprovals },
        { title: 'Active Loans', path: '/loans?status=active', icon: <TrendingUp className="h-4 w-4" /> },
        { title: 'Overdue', path: '/loans?status=overdue', icon: <Clock className="h-4 w-4" /> },
        { title: 'Calculator', path: '/loans/calculator', icon: <Calculator className="h-4 w-4" /> },
      ],
    },

    // Repayments
    {
      id: 'repayments',
      title: 'Repayments',
      icon: <DollarSign className="h-5 w-5" />,
      path: '/repayments',
      roles: ['admin', 'staff', 'officer'],
      badge: stats.overdueRepayments,
      subItems: [
        { title: 'All Payments', path: '/repayments', icon: <DollarSign className="h-4 w-4" /> },
        { title: 'Collect Payment', path: '/repayments/collect', icon: <DollarSign className="h-4 w-4" /> },
        { title: 'Schedule', path: '/repayments/schedule', icon: <Calendar className="h-4 w-4" /> },
        { title: 'Overdue', path: '/repayments?status=overdue', icon: <AlertCircle className="h-4 w-4" />, badge: stats.overdueRepayments },
      ],
    },

    // Reports
    {
      id: 'reports',
      title: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/reports',
      roles: ['admin', 'staff'],
      subItems: [
        { title: 'Overview', path: '/reports', icon: <PieChart className="h-4 w-4" /> },
        { title: 'Loans Report', path: '/reports/loans', icon: <CreditCard className="h-4 w-4" /> },
        { title: 'Payments Report', path: '/reports/payments', icon: <DollarSign className="h-4 w-4" /> },
        { title: 'Customer Report', path: '/reports/customers', icon: <Users className="h-4 w-4" /> },
        { title: 'Collection Report', path: '/reports/collection', icon: <BarChart3 className="h-4 w-4" /> },
      ],
    },

    // M-Pesa
    {
      id: 'mpesa',
      title: 'M-Pesa',
      icon: <Smartphone className="h-5 w-5" />,
      path: '/mpesa',
      roles: ['admin', 'staff'],
      subItems: [
        { title: 'Transactions', path: '/mpesa/transactions', icon: <Smartphone className="h-4 w-4" /> },
        { title: 'STK Push', path: '/mpesa/stk-push', icon: <Smartphone className="h-4 w-4" /> },
        { title: 'Settings', path: '/mpesa/settings', icon: <Settings className="h-4 w-4" /> },
      ],
    },

    // Notifications
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      path: '/notifications',
      roles: ['admin', 'staff', 'officer', 'customer'],
    },
  ]

  // Add admin-only items
  if (isAdmin()) {
    menuItems.push(
      {
        id: 'admin',
        title: 'Admin',
        icon: <Shield className="h-5 w-5" />,
        path: '/admin',
        roles: ['admin'],
        subItems: [
          { title: 'Staff Management', path: '/admin/staff', icon: <Users className="h-4 w-4" /> },
          { title: 'Audit Log', path: '/admin/audit', icon: <FileText className="h-4 w-4" /> },
          { title: 'System Health', path: '/admin/health', icon: <BarChart3 className="h-4 w-4" /> },
        ],
      },
      {
        id: 'settings',
        title: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        path: '/settings',
        roles: ['admin'],
        subItems: [
          { title: 'General', path: '/settings/general', icon: <Settings className="h-4 w-4" /> },
          { title: 'Loan Products', path: '/settings/loan-products', icon: <CreditCard className="h-4 w-4" /> },
          { title: 'Interest Rates', path: '/settings/interest-rates', icon: <DollarSign className="h-4 w-4" /> },
          { title: 'System Config', path: '/settings/system', icon: <Settings className="h-4 w-4" /> },
        ],
      }
    )
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(user?.role || 'customer')
  })

  // Auto-expand based on current route
  useEffect(() => {
    const currentPath = location.pathname
    const parentItem = filteredMenuItems.find(item => 
      item.subItems?.some(subItem => subItem.path === currentPath) ||
      (item.exact ? item.path === currentPath : currentPath.startsWith(item.path))
    )
    
    if (parentItem && !expandedItems.includes(parentItem.id)) {
      setExpandedItems(prev => [...prev, parentItem.id])
    }
  }, [location.pathname])

  const toggleExpand = (id) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            SL
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Super Legit</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Advance</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Loans</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.activeLoans.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              KES {(stats.totalAmountPaid || 0).toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">collected</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            
            const isExpanded = expandedItems.includes(item.id)

            return (
              <div key={item.id}>
                {item.subItems ? (
                  <>
                    {/* Parent Item with Submenu */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:bg-gray-100 dark:hover:bg-slate-700/50",
                        isActive && "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
                        !isActive && "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "transition-colors",
                          isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                        )}>
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
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </button>

                    {/* Submenu Items */}
                    {isExpanded && (
                      <div className="ml-9 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path
                          return (
                            <NavLink
                              key={`${item.id}-${subItem.path}`}
                              to={subItem.path}
                              onClick={handleNavClick}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                  "hover:bg-gray-50 dark:hover:bg-slate-700/30",
                                  isActive || isSubActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                                    : "text-gray-600 dark:text-gray-400"
                                )
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 dark:text-gray-500">
                                  {subItem.icon}
                                </span>
                                <span>{subItem.title}</span>
                              </div>
                              {(subItem.badge ?? 0) > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                                  {subItem.badge}
                                </span>
                              )}
                            </NavLink>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        'hover:bg-gray-100 dark:hover:bg-slate-700/50',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300'
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "transition-colors",
                        isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                      )}>
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
            )
          })}
        </div>
      </nav>

      {/* User Info Footer */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
            {user?.first_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role || 'staff'}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <p className="flex items-center justify-between">
            <span>Version:</span>
            <span className="font-medium">v2.1.0</span>
          </p>
          <p className="pt-1 text-center">© {new Date().getFullYear()} Super Legit Advance</p>
        </div>
      </div>
    </>
  )
}

export default Sidebar