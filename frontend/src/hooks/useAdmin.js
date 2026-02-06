import { useState, useCallback } from 'react'
import adminAPI from '@api/admin'
import { useToast } from '@contexts/ToastContext'

/**
 * Custom hook for admin operations
 * Provides methods for managing staff, roles, permissions, and settings
 */
export const useAdmin = () => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Staff operations
  const fetchStaff = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminAPI.getStaff(params)
      return response.data || response
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch staff'
      setError(msg)
      addToast({ type: 'error', title: 'Error', message: msg })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const fetchStaffStats = useCallback(async () => {
    try {
      const response = await adminAPI.getStaffStats()
      return response.data || response
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch staff stats'
      setError(msg)
      throw err
    }
  }, [])

  const createStaffMember = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)
      try {
        const response = await adminAPI.createStaff(data)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Staff member created successfully',
        })
        return response.data || response
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to create staff member'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  const updateStaffMember = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)
      try {
        const response = await adminAPI.updateStaff(id, data)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Staff member updated successfully',
        })
        return response.data || response
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to update staff member'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  const deleteStaffMember = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        await adminAPI.deleteStaff(id)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Staff member deleted successfully',
        })
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to delete staff member'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  const exportStaffList = useCallback(
    async (format = 'excel', params = {}) => {
      try {
        await adminAPI.exportStaff(format, params)
        addToast({
          type: 'success',
          title: 'Success',
          message: `Staff list exported as ${format}`,
        })
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to export staff list'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      }
    },
    [addToast]
  )

  // Role operations
  const fetchRoles = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminAPI.getRoles(params)
      return response.data || response
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch roles'
      setError(msg)
      addToast({ type: 'error', title: 'Error', message: msg })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const fetchRole = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminAPI.getRole(id)
      return response.data || response
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch role'
      setError(msg)
      addToast({ type: 'error', title: 'Error', message: msg })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const createRole = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)
      try {
        const response = await adminAPI.createRole(data)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Role created successfully',
        })
        return response.data || response
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to create role'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  const updateRole = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)
      try {
        const response = await adminAPI.updateRole(id, data)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Role updated successfully',
        })
        return response.data || response
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to update role'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  const deleteRole = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)
      try {
        await adminAPI.deleteRole(id)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Role deleted successfully',
        })
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to delete role'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  // Permission operations
  const fetchPermissions = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminAPI.getPermissions(params)
      return response.data || response
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch permissions'
      setError(msg)
      addToast({ type: 'error', title: 'Error', message: msg })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const updateRolePermissions = useCallback(
    async (roleId, data) => {
      setLoading(true)
      setError(null)
      try {
        const response = await adminAPI.updateRolePermissions(roleId, data)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Role permissions updated successfully',
        })
        return response.data || response
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to update role permissions'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  // System Settings
  const fetchSystemSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminAPI.getSystemSettings()
      return response.data || response
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch system settings'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSystemSettings = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)
      try {
        const response = await adminAPI.updateSystemSettings(data)
        addToast({
          type: 'success',
          title: 'Success',
          message: 'System settings updated successfully',
        })
        return response.data || response
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to update system settings'
        setError(msg)
        addToast({ type: 'error', title: 'Error', message: msg })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  // System Health
  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await adminAPI.getSystemHealth()
      return response.data || response
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to fetch system health'
      setError(msg)
      throw err
    }
  }, [])

  return {
    loading,
    error,
    // Staff
    fetchStaff,
    fetchStaffStats,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    exportStaffList,
    // Roles
    fetchRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
    // Permissions
    fetchPermissions,
    updateRolePermissions,
    // Settings
    fetchSystemSettings,
    updateSystemSettings,
    fetchSystemHealth,
  }
}

export default useAdmin
