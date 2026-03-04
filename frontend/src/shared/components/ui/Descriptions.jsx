import React from 'react'
import { Check, Copy, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@utils/cn'

const GRID_CLASS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

const StatusPill = ({ status }) => {
  const styles = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-danger',
    info: 'badge-primary',
  }
  if (!status) return null
  return <span className={cn('ml-2 badge', styles[status] || 'badge-neutral')}>{status}</span>
}

const Skeleton = () => <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-slate-700" />

export const DescriptionItem = ({
  label,
  value,
  tooltip,
  status,
  copyable = false,
  loading = false,
  render,
}) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    if (!navigator?.clipboard || value == null) return
    await navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        <span>{label}</span>
        {tooltip && (
          <span title={tooltip} aria-label={tooltip}>
            <Info size={12} className="cursor-help opacity-70" />
          </span>
        )}
      </div>

      <div className="flex min-h-6 items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {loading ? (
          <Skeleton />
        ) : render ? (
          render(value)
        ) : value ? (
          <>
            <span className="truncate">{value}</span>
            {status && <StatusPill status={status} />}
            {copyable && (
              <button
                type="button"
                onClick={handleCopy}
                className="ui-focus rounded p-1 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={`Copy ${label}`}
              >
                {copied ? <Check size={14} className="text-success-600" /> : <Copy size={14} />}
              </button>
            )}
          </>
        ) : (
          <span className="italic text-gray-400 dark:text-gray-500">-</span>
        )}
      </div>
    </div>
  )
}

const Descriptions = ({
  title,
  description,
  columns = 3,
  layout = 'horizontal',
  loading = false,
  children,
  bordered = false,
}) => {
  const resolvedColumns = Math.min(4, Math.max(1, Number(columns) || 3))

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full rounded-xl bg-white p-4 dark:bg-slate-800', bordered && 'border border-gray-200 dark:border-slate-700')}
      aria-label={title || 'Details'}
    >
      {(title || description) && (
        <header className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </header>
      )}

      <div className={cn('grid gap-6', layout === 'vertical' ? 'grid-cols-1' : GRID_CLASS[resolvedColumns])}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child) ? React.cloneElement(child, { loading }) : child
        )}
      </div>
    </motion.section>
  )
}

export default Descriptions
