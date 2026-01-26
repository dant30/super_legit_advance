// frontend/src/components/shared/EmptyState.tsx
import React from 'react'
import { LucideIcon, Inbox, Search, FileText, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import clsx from 'clsx'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'search' | 'document' | 'user'
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}) => {
  const defaultIcons = {
    default: Inbox,
    search: Search,
    document: FileText,
    user: Users,
  }

  const IconComponent = Icon || defaultIcons[variant]

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="rounded-full bg-gray-100 dark:bg-slate-800 p-4 mb-4">
        <IconComponent className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState