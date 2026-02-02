// frontend/src/components/ui/ThemeInitializer.jsx
import React, { useEffect } from 'react'
import { useTheme } from '@contexts/ThemeContext'

const ThemeInitializer = () => {
  const { currentTheme, mounted } = useTheme()

  // Update data-theme attribute for third-party libraries if needed
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', currentTheme)
      
      // Update any third-party theme-dependent elements here
      // Example: Update charts, maps, etc.
    }
  }, [currentTheme, mounted])

  // You can also add any theme-dependent meta tags here
  useEffect(() => {
    if (mounted) {
      // Set theme-color meta tag for mobile browsers
      let metaThemeColor = document.querySelector('meta[name="theme-color"]')
      
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.name = 'theme-color'
        document.head.appendChild(metaThemeColor)
      }
      
      metaThemeColor.content = currentTheme === 'dark' ? '#0f172a' : '#ffffff'
    }
  }, [currentTheme, mounted])

  return null // This is a utility component, doesn't render anything
}

export default ThemeInitializer