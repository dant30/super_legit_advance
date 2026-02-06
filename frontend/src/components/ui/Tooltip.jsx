// frontend/src/components/ui/Tooltip.jsx
import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@utils/cn'

/**
 * @typedef {Object} TooltipProps
 * @property {React.ReactElement} children
 * @property {React.ReactNode} content
 * @property {'top'|'bottom'|'left'|'right'} [position]
 * @property {number} [delay]
 * @property {number} [maxWidth]
 * @property {boolean} [disabled]
 * @property {boolean} [interactive]
 * @property {number} [offset]
 * @property {string} [className]
 */

export const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 250,
  maxWidth = 240,
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
  const tooltipId = useId()

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
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
      default:
        break
    }

    x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8))
    y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8))

    setCoords({ x, y })
  }

  useEffect(() => {
    if (!isVisible) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isVisible, position])

  useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), [])

  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
    'aria-describedby': isVisible ? tooltipId : undefined,
  })

  const tooltipContent = isVisible
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cn('fixed z-[9999] animate-fade-in pointer-events-none', className)}
          style={{ left: `${coords.x}px`, top: `${coords.y}px`, maxWidth: `${maxWidth}px` }}
          onMouseEnter={interactive ? showTooltip : undefined}
          onMouseLeave={interactive ? hideTooltip : undefined}
        >
          <div className="relative rounded-lg bg-gray-900 dark:bg-slate-800 px-3 py-2 text-sm text-white shadow-hard">
            <div className="relative z-10">{content}</div>
            <div
              className={cn(
                'absolute h-2 w-2 rotate-45 bg-gray-900 dark:bg-slate-800',
                position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
                position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
              )}
            />
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
  )
}

export const SimpleTooltip = ({ children, text, position = 'top', className }) => (
  <Tooltip content={text} position={position} className={className}>
    {children}
  </Tooltip>
)

SimpleTooltip.displayName = 'SimpleTooltip'

export default Tooltip
