// frontend/src/hooks/useMediaQuery.js
import { useEffect, useState } from 'react'

/**
 * useMediaQuery
 * @param {string} query - CSS media query (e.g. '(min-width: 768px)')
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const getMatches = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(query)

    const handler = (event) => {
      setMatches(event.matches)
    }

    // Set immediately in case query changes
    setMatches(mediaQueryList.matches)

    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handler)
    } else {
      // Safari / old browsers fallback
      mediaQueryList.addListener(handler)
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handler)
      } else {
        mediaQueryList.removeListener(handler)
      }
    }
  }, [query])

  return matches
}
