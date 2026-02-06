import React, { createContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from '@hooks/useAuth'
import { useToast } from './ToastContext'
import adminAPI from '@api/admin'

export const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const { user } = useAuth()
  const { addToast } = useToast()

  // Staff Management
  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [permissions, setPermissions] = useState([])
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [systemSettings, setSystemSettings] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)

  // Fetch Staff
  const fetchStaff = useCallback(async (params = {}) => {
    setStaffLoading(true)
    try {
      const response = await adminAPI.getStaff(params)
      const data = response.data || response
      if (Array.isArray(data)) {
        setStaff(data)
      } else if (data.results) {
        setStaff(data.results)
      }
      return data
    } catch (error) {
      console.error('Error fetching staff:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch staff',
      })
      throw error
    } finally {
      setStaffLoading(false)
    }
  }, [addToast])

  // Create Staff Member
  const createStaffMember = useCallback(async (data) => {
    try {
      const response = await adminAPI.createStaff(data)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff member created successfully',
      })
      await fetchStaff()
      return response.data || response
    } catch (error) {
      console.error('Error creating staff:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to create staff member',
      })
      throw error
    }
  }, [fetchStaff, addToast])

  // Update Staff Member
  const updateStaffMember = useCallback(async (id, data) => {
    try {
      const response = await adminAPI.updateStaff(id, data)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff member updated successfully',
      })
      await fetchStaff()
      return response.data || response
    } catch (error) {
      console.error('Error updating staff:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update staff member',
      })
      throw error
    }
  }, [fetchStaff, addToast])

  // Delete Staff Member
  const deleteStaffMember = useCallback(async (id) => {
    try {
      await adminAPI.deleteStaff(id)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Staff member deleted successfully',
      })
      await fetchStaff()
    } catch (error) {
      console.error('Error deleting staff:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to delete staff member',
      })
      throw error
    }
  }, [fetchStaff, addToast])

  // Fetch Roles
  const fetchRoles = useCallback(async (params = {}) => {
    setRolesLoading(true)
    try {
      const response = await adminAPI.getRoles(params)
      const data = response.data || response
      if (Array.isArray(data)) {
        setRoles(data)
      } else if (data.results) {
        setRoles(data.results)
      }
      return data
    } catch (error) {
      console.error('Error fetching roles:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch roles',
      })
      throw error
    } finally {
      setRolesLoading(false)
    }
  }, [addToast])

  // Create Role
  const createRole = useCallback(async (data) => {
    try {
      const response = await adminAPI.createRole(data)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Role created successfully',
      })
      await fetchRoles()
      return response.data || response
    } catch (error) {
      console.error('Error creating role:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to create role',
      })
      throw error
    }
  }, [fetchRoles, addToast])

  // Update Role
  const updateRole = useCallback(async (id, data) => {
    try {
      const response = await adminAPI.updateRole(id, data)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Role updated successfully',
      })
      await fetchRoles()
      return response.data || response
    } catch (error) {
      console.error('Error updating role:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update role',
      })
      throw error
    }
  }, [fetchRoles, addToast])

  // Delete Role
  const deleteRole = useCallback(async (id) => {
    try {
      await adminAPI.deleteRole(id)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Role deleted successfully',
      })
      await fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to delete role',
      })
      throw error
    }
  }, [fetchRoles, addToast])

  // Fetch Permissions
  const fetchPermissions = useCallback(async (params = {}) => {
    setPermissionsLoading(true)
    try {
      const response = await adminAPI.getPermissions(params)
      const data = response.data || response
      if (Array.isArray(data)) {
        setPermissions(data)
      } else if (data.results) {
        setPermissions(data.results)
      }
      return data
    } catch (error) {
      console.error('Error fetching permissions:', error)
      throw error
    } finally {
      setPermissionsLoading(false)
    }
  }, [])

  // Update Role Permissions
  const updateRolePermissions = useCallback(async (roleId, data) => {
    try {
      const response = await adminAPI.updateRolePermissions(roleId, data)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Role permissions updated successfully',
      })
      await fetchRoles()
      return response.data || response
    } catch (error) {
      console.error('Error updating role permissions:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update role permissions',
      })
      throw error
    }
  }, [fetchRoles, addToast])

  // Fetch System Settings
  const fetchSystemSettings = useCallback(async () => {
    setSettingsLoading(true)
    try {
      const response = await adminAPI.getSystemSettings()
      const data = response.data || response
      setSystemSettings(data)
      return data
    } catch (error) {
      console.error('Error fetching system settings:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch system settings',
      })
      throw error
    } finally {
      setSettingsLoading(false)
    }
  }, [addToast])

  // Update System Settings
  const updateSystemSettings = useCallback(async (data) => {
    try {
      const response = await adminAPI.updateSystemSettings(data)
      addToast({
        type: 'success',
        title: 'Success',
        message: 'System settings updated successfully',
      })
      await fetchSystemSettings()
      return response.data || response
    } catch (error) {
      console.error('Error updating system settings:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to update system settings',
      })
      throw error
    }
  }, [fetchSystemSettings, addToast])

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async (params = {}) => {
    setAuditLoading(true)
    try {
      const response = await adminAPI.getAuditLogs(params)
      const data = response.data || response
      if (Array.isArray(data)) {
        setAuditLogs(data)
      } else if (data.results) {
        setAuditLogs(data.results)
      }
      return data
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    } finally {
      setAuditLoading(false)
    }
  }, [])

  // Get System Health
  const getSystemHealth = useCallback(async () => {
    try {
      const response = await adminAPI.getSystemHealth()
      return response.data || response
    } catch (error) {
      console.error('Error fetching system health:', error)
      throw error
    }
  }, [])

  const value = {
    // Staff
    staff,
    staffLoading,
    fetchStaff,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    
    // Roles
    roles,
    rolesLoading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    
    // Permissions
    permissions,
    permissionsLoading,
    fetchPermissions,
    updateRolePermissions,
    
    // Settings
    systemSettings,
    settingsLoading,
    fetchSystemSettings,
    updateSystemSettings,
    
    // Audit
    auditLogs,
    auditLoading,
    fetchAuditLogs,
    
    // System
    getSystemHealth,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

// Custom Hook for using Admin Context
export const useAdminContext = () => {
  const context = React.useContext(AdminContext)
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider')
  }
  return context
}

export default AdminProvider
