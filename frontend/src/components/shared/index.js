// frontend/src/components/shared/index.js
export { default as Loading } from './Loading'
export { default as Error } from './Error'
export { default as ErrorBoundary } from './ErrorBoundary'
export { default as EmptyState } from './EmptyState'
export { default as ConfirmDialog } from './ConfirmDialog'
export { default as Toast } from './Toast'
export { default as SearchBar } from './SearchBar'
export { default as FileUpload } from './FileUpload'
export { default as DatePicker } from './DatePicker'
export { default as TimePicker } from './TimePicker'
export { default as Avatar } from './Avatar'
export { default as Divider } from './Divider'
export { default as StatusBadge } from './StatusBadge'
export { default as ProgressBar } from './ProgressBar'
export { default as PageHeader } from './PageHeader'

// Re-export named exports
export { AvatarGroup } from './Avatar'
export { 
  ErrorMessage, 
  LoadingError, 
  NotFoundError, 
  NetworkError 
} from './Error'