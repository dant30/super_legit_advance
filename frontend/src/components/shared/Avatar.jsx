// frontend/src/components/shared/Avatar.jsx
// frontend/src/components/shared/Avatar.jsx
import React from 'react'
import { cn } from '@utils/cn'
import { User } from 'lucide-react'

const Avatar = ({
  src,
  alt = 'User avatar',
  size = 'md',
  rounded = 'full',
  fallback,
  className,
  icon: Icon = User,
  onClick,
  border = false,
  status,
  statusPosition = 'bottom-right',
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  }

  const borderRadius = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }

  const statusPositionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  }

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-danger-500',
  }

  const renderFallback = () => {
    if (fallback) {
      return typeof fallback === 'string' ? (
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        fallback
      )
    }
    
    if (Icon) {
      return <Icon className="h-1/2 w-1/2 text-gray-400" />
    }
    
    return (
      <span className="font-semibold text-gray-700 dark:text-gray-300">
        {alt.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <div 
      className={cn(
        'relative inline-flex items-center justify-center',
        'bg-gray-200 dark:bg-gray-700',
        'overflow-hidden select-none',
        sizes[size],
        borderRadius[rounded],
        border && 'border-2 border-white dark:border-gray-800',
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={alt}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      ) : null}
      
      {/* Fallback - shown if no src or image fails to load */}
      {(!src || !src.trim()) && (
        <div className="flex h-full w-full items-center justify-center">
          {renderFallback()}
        </div>
      )}
      
      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute h-3 w-3 rounded-full border-2 border-white dark:border-gray-800',
            statusColors[status] || 'bg-gray-400',
            statusPositionClasses[statusPosition]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

// AvatarGroup component for grouped avatars
export const AvatarGroup = ({
  children,
  max = 4,
  size = 'md',
  spacing = '-space-x-2',
  className,
}) => {
  const avatars = React.Children.toArray(children)
  const visibleAvatars = avatars.slice(0, max)
  const extraCount = avatars.length - max
  
  return (
    <div className={cn('flex items-center', spacing, className)}>
      {visibleAvatars.map((avatar, index) => (
        <div 
          key={index}
          className="relative transition-transform hover:z-10 hover:scale-110"
          style={{ zIndex: visibleAvatars.length - index }}
        >
          {React.cloneElement(avatar, { size, border: true })}
        </div>
      ))}
      
      {extraCount > 0 && (
        <div 
          className={cn(
            'relative flex items-center justify-center',
            'bg-gray-300 dark:bg-gray-600',
            'text-gray-700 dark:text-gray-300',
            'border-2 border-white dark:border-gray-800',
            'font-medium',
            size === 'sm' && 'w-8 h-8 text-xs',
            size === 'md' && 'w-10 h-10 text-sm',
            size === 'lg' && 'w-12 h-12 text-base',
            'rounded-full hover:z-10 hover:scale-110 transition-transform'
          )}
          style={{ zIndex: visibleAvatars.length + 1 }}
          aria-label={`${extraCount} more`}
        >
          +{extraCount}
        </div>
      )}
    </div>
  )
}

export default Avatar