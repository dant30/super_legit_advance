// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  THEMES, 
  getSystemTheme, 
  getStoredTheme, 
  getEffectiveTheme, 
  storeTheme,
  initializeTheme,
  watchSystemTheme 
} from '@utils/theme'

// Create context
const ThemeContext = createContext({})

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.SYSTEM)
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme()
    setTheme(storedTheme)
    initializeTheme()
    setMounted(true)
  }, [])

  // Watch for system theme changes
  useEffect(() => {
    if (theme === THEMES.SYSTEM) {
      const cleanup = watchSystemTheme(() => {
        initializeTheme()
      })
      return cleanup
    }
  }, [theme])

  // Toggle between light/dark
  const toggleTheme = useCallback(() => {
    const effectiveTheme = getEffectiveTheme()
    const newTheme = effectiveTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    setTheme(newTheme)
    storeTheme(newTheme)
  }, [])

  // Set specific theme
  const setThemePreference = useCallback((newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme)
      storeTheme(newTheme)
    }
  }, [])

  // Get current effective theme (light or dark)
  const currentTheme = getEffectiveTheme()
  const isDark = currentTheme === THEMES.DARK
  const isLight = currentTheme === THEMES.LIGHT

  const value = {
    theme,
    setTheme: setThemePreference,
    toggleTheme,
    currentTheme,
    isDark,
    isLight,
    mounted,
    THEMES,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

export default ThemeProvider