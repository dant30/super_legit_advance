import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [], className = '' }) => {
  const location = useLocation()

  // Generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items.length > 0) return items

    const paths = location.pathname.split('/').filter(Boolean)
    const newItems: BreadcrumbItem[] = [{ label: 'Home', path: '/' }]

    let currentPath = ''
    paths.forEach((path) => {
      currentPath += `/${path}`
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      newItems.push({ label, path: currentPath })
    })

    return newItems
  }

  const displayItems = generateBreadcrumbs()

  if (displayItems.length <= 1) return null

  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
      {displayItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {item.path ? (
            <Link
              to={item.path}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {idx === 0 ? <Home className="h-4 w-4" /> : item.label}
            </Link>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumbs