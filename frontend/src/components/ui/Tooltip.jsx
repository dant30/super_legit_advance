// frontend/src/components/ui/Tooltip.jsx
import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@utils/cn'
import { createPortal } from 'react-dom'

export const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 300,
  maxWidth = 200,
  className,
  disabled = false,
  interactive = false,
  offset = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    let x = 0
    let y = 0

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.top - tooltipRect.height - offset
        break
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        y = triggerRect.bottom + offset
        break
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
      case 'right':
        x = triggerRect.right + offset
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
    }

    // Keep tooltip within viewport
    x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8))
    y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8))

    setCoords({ x, y })
  }

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isVisible, position])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  })

  const tooltipContent = isVisible && (
    <>
      {createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-[9999] animate-fade-in pointer-events-none',
            className
          )}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            maxWidth: `${maxWidth}px`,
          }}
          onMouseEnter={interactive ? showTooltip : undefined}
          onMouseLeave={interactive ? hideTooltip : undefined}
        >
          <div className="relative rounded-lg bg-gray-900 dark:bg-gray-800 px-3 py-2 text-sm text-white shadow-hard">
            <div className="relative z-10">{content}</div>
            {/* Arrow */}
            <div
              className={cn(
                'absolute h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-800',
                position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
                position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
              )}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
  )
}

// Simple Tooltip variant
export const SimpleTooltip = ({ 
  children, 
  text, 
  position = 'top',
  className 
}) => {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-hard whitespace-nowrap',
            position === 'top' && 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
            position === 'bottom' && 'top-full left-1/2 transform -translate-x-1/2 mt-2',
            position === 'left' && 'right-full top-1/2 transform -translate-y-1/2 mr-2',
            position === 'right' && 'left-full top-1/2 transform -translate-y-1/2 ml-2',
            className
          )}
        >
          {text}
          <div
            className={cn(
              'absolute h-2 w-2 rotate-45 bg-gray-900',
              position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
              position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
              position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
              position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
            )}
          />
        </div>
      )}
    </div>
  )
}

// Info Tooltip with question mark icon
export const InfoTooltip = ({ 
  content,
  position = 'top',
  iconSize = 'sm',
  className 
}) => {
  const iconClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <Tooltip content={content} position={position} className={className}>
      <span className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-help">
        <svg 
          className={iconClasses[iconSize]} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </span>
    </Tooltip>
  )
}

export default Tooltip