// frontend/src/hooks/useAudit.js
import { useAudit as useAuditContext } from '../contexts/AuditContext'

/**
 * Hook for accessing audit functionality
 * Thin wrapper around AuditContext for consistent hook API.
 */
export function useAudit() {
  return useAuditContext()
}

export default useAudit