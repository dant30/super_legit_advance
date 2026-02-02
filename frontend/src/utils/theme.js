// frontend/src/utils/theme.js
// Theme utilities and constants

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
}

// Local storage key for theme preference
export const THEME_STORAGE_KEY = 'sla-theme'

// Get system preference
export const getSystemTheme = () => {
  if (typeof window === 'undefined') return THEMES.LIGHT
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? THEMES.DARK 
    : THEMES.LIGHT
}

// Get stored theme or system preference
export const getStoredTheme = () => {
  if (typeof window === 'undefined') return THEMES.SYSTEM
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
    return stored
  }
  return THEMES.SYSTEM
}

// Get effective theme (if SYSTEM, returns actual theme based on preference)
export const getEffectiveTheme = () => {
  const theme = getStoredTheme()
  if (theme === THEMES.SYSTEM) {
    return getSystemTheme()
  }
  return theme
}

// Apply theme to document
export const applyTheme = (theme) => {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  const effectiveTheme = theme === THEMES.SYSTEM ? getSystemTheme() : theme
  
  // Remove all theme classes
  root.classList.remove(THEMES.LIGHT, THEMES.DARK)
  
  // Add the new theme class
  root.classList.add(effectiveTheme)
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', effectiveTheme === THEMES.DARK ? '#0f172a' : '#ffffff')
  }
}

// Store theme preference
export const storeTheme = (theme) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyTheme(theme)
}

// Initialize theme on page load
export const initializeTheme = () => {
  const theme = getStoredTheme()
  applyTheme(theme)
  return theme
}

// Watch for system theme changes
export const watchSystemTheme = (callback) => {
  if (typeof window === 'undefined') return
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleChange = (e) => {
    const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT
    callback(newTheme)
  }
  
  // Listen for changes
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
  } else {
    // Safari compatibility
    mediaQuery.addListener(handleChange)
  }
  
  // Return cleanup function
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange)
    } else {
      mediaQuery.removeListener(handleChange)
    }
  }
}

// Theme configuration for UI components
export const themeConfig = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
    card: 'bg-white border-gray-200',
    hover: 'hover:bg-gray-50',
    focus: 'focus:ring-primary-500 focus:border-primary-500',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    border: 'border-gray-700',
    card: 'bg-gray-800 border-gray-700',
    hover: 'hover:bg-gray-800',
    focus: 'focus:ring-primary-400 focus:border-primary-400',
  },
}

// Utility function to get theme classes
export const getThemeClasses = (theme, componentType) => {
  const config = themeConfig[theme] || themeConfig.light
  return config[componentType] || ''
}

export default {
  THEMES,
  THEME_STORAGE_KEY,
  getSystemTheme,
  getStoredTheme,
  getEffectiveTheme,
  applyTheme,
  storeTheme,
  initializeTheme,
  watchSystemTheme,
  themeConfig,
  getThemeClasses,
}