// frontend/src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  darkMode: boolean
  notifications: {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: number
  }[]
  modals: {
    confirmDelete: boolean
    addLoan: boolean
    addCustomer: boolean
  }
  loading: {
    [key: string]: boolean
  }
}

// Helper function to check if we're on mobile
const isMobile = () => {
  if (typeof window === 'undefined') return true
  return window.innerWidth < 1020 // Match your Tailwind lg breakpoint
}

// Helper function to get initial sidebar state
const getInitialSidebarState = () => {
  if (typeof window === 'undefined') return true
  
  // On mobile, sidebar should start closed
  if (isMobile()) {
    return false
  }
  
  // On desktop, sidebar should start open (always visible)
  return JSON.parse(localStorage.getItem('sidebarOpen') || 'true')
}

// Optimized: ThemeInitializer handles dark mode initialization
// So we can start with a default value
const initialState: UIState = {
  sidebarOpen: getInitialSidebarState(),
  darkMode: true, // Default to true, ThemeInitializer will override
  notifications: [],
  modals: {
    confirmDelete: false,
    addLoan: false,
    addCustomer: false,
  },
  loading: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      // On mobile: toggle normally
      // On desktop: always keep it open (or you can toggle if you want collapse/expand)
      if (isMobile()) {
        state.sidebarOpen = !state.sidebarOpen
      } else {
        // On desktop, you can choose to toggle or always keep open
        state.sidebarOpen = !state.sidebarOpen
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarOpen', JSON.stringify(state.sidebarOpen))
      }
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      // On desktop, force it to always be true if trying to set to false
      if (!isMobile() && !action.payload) {
        state.sidebarOpen = true
      } else {
        state.sidebarOpen = action.payload
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarOpen', JSON.stringify(state.sidebarOpen))
      }
    },
    // Force sidebar open (useful for desktop)
    openSidebar: (state) => {
      state.sidebarOpen = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarOpen', 'true')
      }
    },
    // Force sidebar closed (mobile only - on desktop it won't close)
    closeSidebar: (state) => {
      // Only close on mobile
      if (isMobile()) {
        state.sidebarOpen = false
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebarOpen', 'false')
        }
      }
    },
    // Special toggle for mobile only
    toggleMobileSidebar: (state) => {
      if (isMobile()) {
        state.sidebarOpen = !state.sidebarOpen
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebarOpen', JSON.stringify(state.sidebarOpen))
        }
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', JSON.stringify(state.darkMode))
        if (state.darkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', JSON.stringify(action.payload))
        if (action.payload) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      const modal = action.payload
      if (modal in state.modals) {
        state.modals[modal as keyof typeof state.modals] = true
      }
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      const modal = action.payload
      if (modal in state.modals) {
        state.modals[modal as keyof typeof state.modals] = false
      }
    },
    setLoading: (state, action: PayloadAction<{key: string, value: boolean}>) => {
      const { key, value } = action.payload
      state.loading[key] = value
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  openSidebar,
  closeSidebar,
  toggleMobileSidebar,
  toggleDarkMode,
  setDarkMode,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  setLoading,
} = uiSlice.actions

export default uiSlice.reducer