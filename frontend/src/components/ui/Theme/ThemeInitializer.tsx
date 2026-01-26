// frontend/src/components/ui/Theme/ThemeInitializer.tsx (Updated)
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setDarkMode } from '@/store/slices/uiSlice'

const ThemeInitializer: React.FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Prevent FOUC by applying theme immediately
    const storedDarkMode = localStorage.getItem('darkMode')
    const initialDarkMode = storedDarkMode ? JSON.parse(storedDarkMode) : true
    
    // Apply immediately to prevent flash
    if (initialDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Then sync with Redux
    dispatch(setDarkMode(initialDarkMode))
    
    // Listen for system theme changes
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      const hasUserPreference = localStorage.getItem('darkMode') !== null
      if (!hasUserPreference) {
        dispatch(setDarkMode(media.matches))
      }
    }
    
    media.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      media.removeEventListener('change', handleSystemThemeChange)
    }
  }, [dispatch])

  return null
}

export default ThemeInitializer