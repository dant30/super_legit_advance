// frontend/src/components/layout/Header.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { useTheme } from '@contexts/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import axios from '@api/axios'
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
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import clsx from 'clsx'
import { cn } from '@utils/cn'

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])

  const profileRef = useRef(null)
  const notificationsRef = useRef(null)
  const mobileSearchRef = useRef(null)

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        // backend exposes notifications at /api/notifications/notifications/
        const response = await axios.get('/notifications/notifications/', {
          params: { page_size: 10, ordering: '-created_at' }
        })
        return response.data.results || []
      } catch (error) {
        console.error('Error fetching notifications:', error)
        return []
      }
    },
    staleTime: 60 * 1000, // 1 minute
  })
  
  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData.slice(0, 10)) // Show only latest 10
    }
  }, [notificationsData])

  // backend returns status; consider notifications with status !== 'READ' as unread
  const unreadCount = notifications.filter(n => n.status !== 'READ').length

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
      if (mobileSearchRef.current && isMobileSearchOpen && !mobileSearchRef.current.contains(event.target)) {
        setIsMobileSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileSearchOpen])

  // Close dropdowns when pressing escape
  useEffect(() => {
    const handleEscape = (event) => {
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
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [logout, navigate])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMobileSearchOpen(false)
    }
  }, [searchQuery, navigate])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'info':
      default:
        return <Inbox className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <>
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
          <div 
            ref={mobileSearchRef}
            className="relative w-full bg-white dark:bg-slate-800 shadow-hard animate-slide-up"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customers, loans, payments..."
                    autoFocus
                    className="form-input pl-10 w-full"
                  />
                </form>
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="ml-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
          {/* Left side - Menu button and breadcrumb */}
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors lg:hidden"
                aria-label="Toggle menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers, loans, payments..."
                  className="form-input pl-10 w-full"
                />
              </form>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Mobile Search */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Help */}
            <button
              onClick={() => navigate('/help')}
              className="hidden sm:flex p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center">
                    <span className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-red-500" />
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className={cn(
                  "fixed md:absolute right-4 md:right-0 top-16 md:top-full mt-2",
                  "w-[calc(100vw-2rem)] md:w-96",
                  "bg-white dark:bg-slate-800 rounded-lg shadow-hard border",
                  "border-gray-200 dark:border-slate-700 z-50",
                  "max-h-[calc(100vh-6rem)] md:max-h-96",
                  "animate-scale-in"
                )}>
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                      <button
                        onClick={() => navigate('/notifications')}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View all
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-[calc(100vh-12rem)] md:max-h-80">
                    {notificationsLoading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={cn(
                              "p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors",
                              !notif.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                            )}
                            onClick={() => {
                              navigate(`/notifications/${notif.id}`)
                              setIsNotificationsOpen(false)
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notif.notification_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notif.message}
                                </p>
                                {notif.created_at && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    <Clock className="inline h-3 w-3 mr-1" />
                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                              {notif.status !== 'READ' && (
                                <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You&apos;re all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
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
                className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group"
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
                <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shadow-md group-hover:shadow-lg transition-shadow">
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
                  "border-gray-200 dark:border-slate-700 z-50",
                  "animate-scale-in"
                )}>
                  {/* Profile Header */}
                  <div className="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-base shadow-md">
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
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setIsProfileOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                    >
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 dark:border-slate-700 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
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
          className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40 md:hidden animate-fade-in"
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
