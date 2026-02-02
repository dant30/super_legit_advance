// frontend/src/hooks/useAudit.js
import { useAudit as useAuditContext } from '../contexts/AuditContext'

/**
 * Hook for accessing audit functionality
 * This is now just a wrapper around the context for consistency
 */
export function useAudit() {
  const audit = useAuditContext()
  
  // Return the entire context value
  return audit
}

export default useAudit