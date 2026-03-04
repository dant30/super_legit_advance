// frontend/src/components/shared/EmptyState.jsx
import React from 'react'
import { Inbox, Search, FileText, Users, AlertCircle, Plus, Database } from 'lucide-react'
import Button from '@components/ui/Button'
import { cn } from '@utils/cn'

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
  className = '',
  illustration,
}) => {
  const defaultIcons = {
    default: Inbox,
    search: Search,
    document: FileText,
    user: Users,
    error: AlertCircle,
    add: Plus,
    data: Database,
  }

  const IconComponent = Icon || defaultIcons[variant]

  const variantConfig = {
    default: {
      iconBg: 'bg-gray-100 dark:bg-slate-800',
      iconColor: 'text-gray-400 dark:text-gray-500',
      titleColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
    search: {
      iconBg: 'bg-primary-50 dark:bg-primary-900/20',
      iconColor: 'text-primary-400 dark:text-primary-300',
      titleColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
    error: {
      iconBg: 'bg-danger-50 dark:bg-danger-900/20',
      iconColor: 'text-danger-400 dark:text-danger-300',
      titleColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
  }

  const config = variantConfig[variant] || variantConfig.default

  const sizeConfig = {
    sm: {
      iconSize: 'p-3',
      icon: 'h-6 w-6',
      title: 'text-base',
      description: 'text-sm',
      spacing: 'py-8',
    },
    md: {
      iconSize: 'p-4',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-base',
      spacing: 'py-12',
    },
    lg: {
      iconSize: 'p-5',
      icon: 'h-10 w-10',
      title: 'text-xl',
      description: 'text-lg',
      spacing: 'py-16',
    },
  }

  const sizeProps = sizeConfig[size]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeProps.spacing,
      className
    )}>
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6 max-w-xs mx-auto">
          {illustration}
        </div>
      ) : (
        <div className={cn(
          'rounded-full mb-4 flex items-center justify-center',
          config.iconBg,
          sizeProps.iconSize
        )}>
          <IconComponent className={cn(
            sizeProps.icon,
            config.iconColor
          )} />
        </div>
      )}

      {/* Title */}
      <h3 className={cn(
        'font-semibold mb-2',
        config.titleColor,
        sizeProps.title
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn(
          'max-w-md mx-auto mb-6',
          config.descriptionColor,
          sizeProps.description
        )}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              icon={action.icon && <action.icon className="h-4 w-4" />}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              icon={secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Specific Empty State Components
export const SearchEmptyState = ({ query, ...props }) => (
  <EmptyState
    variant="search"
    title={`No results found for "${query}"`}
    description="Try adjusting your search or filter to find what you're looking for."
    {...props}
  />
)

export const DataEmptyState = ({ modelName, action, ...props }) => (
  <EmptyState
    variant="data"
    title={`No ${modelName || 'data'} found`}
    description={`Start by creating your first ${modelName?.toLowerCase() || 'item'}.`}
    action={action}
    {...props}
  />
)

export const ErrorEmptyState = ({ error, retry, ...props }) => (
  <EmptyState
    variant="error"
    title="Something went wrong"
    description={error || "We couldn't load the data. Please try again."}
    action={retry && {
      label: 'Try again',
      onClick: retry,
    }}
    {...props}
  />
)

export default EmptyState