import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { logout } from '@/store/slices/authSlice'
import { toggleDarkMode } from '@/store/slices/uiSlice'
import { RootState } from '@/store/store'
import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Search,
  Moon,
  Sun,
  Inbox,
  HelpCircle,
  X,
} from 'lucide-react'
import { Notification as ApiNotification, notificationsAPI } from '@/lib/api/notifications'
import clsx from 'clsx'

interface HeaderNotification {
  id: string | number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at?: string
}

// Convert API notification to display format
const transformNotifications = (notifications: ApiNotification[]): HeaderNotification[] => {
  return notifications.map((notif: any) => ({
    id: notif.id,
    title: notif.title || 'Notification',
    message: notif.message,
    type: notif.notification_type === 'error' ? 'error' : 'info',
    read: notif.is_read || false,
    created_at: notif.created_at,
  }))
}

const Header: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { darkMode } = useSelector((state: RootState) => state.ui)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<HeaderNotification[]>([])

  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getNotifications({ page_size: 10 }),
    staleTime: 1000 * 60,
  })

  useEffect(() => {
    if (notificationsData?.results) {
      setNotifications(transformNotifications(notificationsData.results))
    }
  }, [notificationsData])

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (mobileSearchRef.current && isMobileSearchOpen && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileSearchOpen])

  // Close dropdowns when pressing escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false)
        setIsNotificationsOpen(false)
        setIsMobileSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile search is open
  useEffect(() => {
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMobileSearchOpen])

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout() as any)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [dispatch, navigate])

  const handleToggleDarkMode = useCallback(() => {
    dispatch(toggleDarkMode())
  }, [dispatch])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMobileSearchOpen(false)
    }
  }, [searchQuery, navigate])

  return (
    <>
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
          <div 
            ref={mobileSearchRef}
            className="relative w-full bg-white dark:bg-slate-800 shadow-hard"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                    className="form-input pl-10 w-full"
                  />
                </form>
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="ml-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-soft h-16">
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl xl:max-w-2xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ml-3" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers, loans, payments..."
                className="form-input pl-10 w-full"
              />
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Mobile Search */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Help */}
            <button
              onClick={() => navigate('/help')}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsProfileOpen(false)
                }}
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-2 w-2">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-danger-400 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-danger-500" />
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className={clsx(
                  "fixed md:absolute right-4 md:right-0 top-16 md:top-full mt-2",
                  "w-[calc(100vw-2rem)] md:w-80",
                  "bg-white dark:bg-slate-800 rounded-lg shadow-hard border",
                  "border-gray-200 dark:border-slate-700 z-50",
                  "max-h-[calc(100vh-6rem)] md:max-h-96"
                )}>
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-[calc(100vh-12rem)] md:max-h-80">
                    {notificationsLoading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Inbox className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Notifications will appear here</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        navigate('/notifications')
                        setIsNotificationsOpen(false)
                      }}
                      className="w-full text-center py-3 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-b-lg transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleToggleDarkMode}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen)
                  setIsNotificationsOpen(false)
                }}
                className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                aria-label="Profile menu"
                aria-expanded={isProfileOpen}
              >
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {user?.first_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role || 'customer'}
                    </p>
                  </div>
                </div>
                <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.first_name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className={clsx(
                  "h-4 w-4 hidden sm:block transition-transform duration-200",
                  isProfileOpen && "rotate-180"
                )} />
              </button>

              {isProfileOpen && (
                <div className={clsx(
                  "fixed md:absolute right-4 md:right-0 top-16 md:top-full mt-2",
                  "w-[calc(100vw-2rem)] md:w-64",
                  "bg-white dark:bg-slate-800 rounded-lg shadow-hard border",
                  "border-gray-200 dark:border-slate-700 z-50"
                )}>
                  {/* Profile Header */}
                  <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-base">
                        {user?.first_name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1 capitalize">
                          {user?.role || 'customer'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setIsProfileOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3"
                    >
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setIsProfileOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3"
                    >
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-slate-700 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex items-center gap-3"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for mobile dropdowns */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40 md:hidden"
          onClick={() => {
            setIsProfileOpen(false)
            setIsNotificationsOpen(false)
          }}
        />
      )}
    </>
  )
}

export default Header