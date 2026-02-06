// frontend/src/api/admin.js
import axiosInstance from './axios'

/**
 * Staff Management API
 */
const staffAPI = {
  // Staff CRUD -> use backend users/staff-profiles endpoints
  getStaff: (params = {}) =>
    axiosInstance.get('/users/staff-profiles/', { params }),

  getStaffById: (id) =>
    axiosInstance.get(`/users/staff-profiles/${id}/`),

  createStaff: (data) =>
    axiosInstance.post('/users/staff-profiles/', data),

  updateStaff: (id, data) =>
    axiosInstance.put(`/users/staff-profiles/${id}/`, data),

  patchStaff: (id, data) =>
    axiosInstance.patch(`/users/staff-profiles/${id}/`, data),

  deleteStaff: (id) =>
    axiosInstance.delete(`/users/staff-profiles/${id}/`),

  // Keep import/export paths if your backend implements them under users/staff-profiles/
  importStaff: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post('/users/staff-profiles/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  exportStaff: (format = 'excel', params = {}) =>
    axiosInstance.get('/users/staff-profiles/export/', {
      params: { format, ...params },
      responseType: 'blob',
    }),

  // other staff related helpers (assignRole, tasks, activity) should also point to /users/staff-profiles/ or to proper users/ endpoints
  assignRole: (staffId, data) =>
    axiosInstance.post(`/users/staff-profiles/${staffId}/assign-role/`, data),

  getStaffTasks: (staffId) =>
    axiosInstance.get(`/users/staff-profiles/${staffId}/tasks/`),
}

/**
 * Role Management API
 */
const roleAPI = {
  // Role CRUD
  getRoles: (params = {}) =>
    axiosInstance.get('/admin/roles/', { params }),
  
  getRoleById: (id) =>
    axiosInstance.get(`/admin/roles/${id}/`),
  
  createRole: (data) =>
    axiosInstance.post('/admin/roles/', data),
  
  updateRole: (id, data) =>
    axiosInstance.put(`/admin/roles/${id}/`, data),
  
  patchRole: (id, data) =>
    axiosInstance.patch(`/admin/roles/${id}/`, data),
  
  deleteRole: (id) =>
    axiosInstance.delete(`/admin/roles/${id}/`),
  
  // Permissions
  getRole: (id) =>
    axiosInstance.get(`/admin/roles/${id}/`),
  
  getPermissions: (params = {}) =>
    axiosInstance.get('/admin/permissions/', { params }),
  
  getPermissionById: (id) =>
    axiosInstance.get(`/admin/permissions/${id}/`),
  
  getPermissionsByCategory: (category) =>
    axiosInstance.get('/admin/permissions/', { params: { category } }),
  
  // Role Permissions
  updateRolePermissions: (roleId, data) =>
    axiosInstance.put(`/admin/roles/${roleId}/permissions/`, data),
  
  addRolePermission: (roleId, permissionId) =>
    axiosInstance.post(`/admin/roles/${roleId}/permissions/`, {
      permission_id: permissionId,
    }),
  
  removeRolePermission: (roleId, permissionId) =>
    axiosInstance.delete(`/admin/roles/${roleId}/permissions/${permissionId}/`),
  
  // Bulk delete
  bulkDeleteRoles: (ids) =>
    axiosInstance.post('/admin/roles/bulk-delete/', { ids }),
}

/**
 * Permissions Management API
 */
const permissionAPI = {
  getPermissions: (params = {}) =>
    axiosInstance.get('/admin/permissions/', { params }),
  
  getPermissionById: (id) =>
    axiosInstance.get(`/admin/permissions/${id}/`),
  
  createPermission: (data) =>
    axiosInstance.post('/admin/permissions/', data),
  
  updatePermission: (id, data) =>
    axiosInstance.put(`/admin/permissions/${id}/`, data),
  
  deletePermission: (id) =>
    axiosInstance.delete(`/admin/permissions/${id}/`),
  
  getPermissionsByCategory: (category) =>
    axiosInstance.get('/admin/permissions/', { params: { category } }),
}

/**
 * System Settings API
 */
const settingsAPI = {
  getSystemSettings: () =>
    axiosInstance.get('/admin/settings/'),
  
  updateSystemSettings: (data) =>
    axiosInstance.put('/admin/settings/', data),
  
  patchSystemSettings: (data) =>
    axiosInstance.patch('/admin/settings/', data),
  
  // Backup & Restore
  backupDatabase: () =>
    axiosInstance.post('/admin/backup/', {}),
  
  restoreDatabase: (fileId) =>
    axiosInstance.post('/admin/restore/', { backup_id: fileId }),
  
  getBackups: (params = {}) =>
    axiosInstance.get('/admin/backups/', { params }),
  
  deleteBackup: (id) =>
    axiosInstance.delete(`/admin/backups/${id}/`),
  
  // System Health
  getSystemHealth: () =>
    axiosInstance.get('/admin/health/'),
  
  // Audit Settings
  getAuditSettings: () =>
    axiosInstance.get('/admin/audit-settings/'),
  
  updateAuditSettings: (data) =>
    axiosInstance.put('/admin/audit-settings/', data),
}

/**
 * Email Templates API
 */
const emailTemplateAPI = {
  getEmailTemplates: (params = {}) =>
    axiosInstance.get('/admin/email-templates/', { params }),
  
  getEmailTemplateById: (id) =>
    axiosInstance.get(`/admin/email-templates/${id}/`),
  
  createEmailTemplate: (data) =>
    axiosInstance.post('/admin/email-templates/', data),
  
  updateEmailTemplate: (id, data) =>
    axiosInstance.put(`/admin/email-templates/${id}/`, data),
  
  deleteEmailTemplate: (id) =>
    axiosInstance.delete(`/admin/email-templates/${id}/`),
  
  testEmailTemplate: (id, email) =>
    axiosInstance.post(`/admin/email-templates/${id}/test/`, { email }),
}

/**
 * Audit Logs API
 */
const auditLogAPI = {
  getAuditLogs: (params = {}) =>
    axiosInstance.get('/admin/audit-logs/', { params }),
  
  getAuditLogById: (id) =>
    axiosInstance.get(`/admin/audit-logs/${id}/`),
  
  exportAuditLogs: (format = 'excel', params = {}) =>
    axiosInstance.get('/admin/audit-logs/export/', {
      params: { format, ...params },
      responseType: 'blob',
    }),
  
  deleteAuditLog: (id) =>
    axiosInstance.delete(`/admin/audit-logs/${id}/`),
  
  clearAuditLogs: (days = 30) =>
    axiosInstance.post('/admin/audit-logs/clear/', { retention_days: days }),
}

/**
 * Combined Admin API Export
 */
const adminAPI = {
  ...staffAPI,
  ...roleAPI,
  getPermissions: permissionAPI.getPermissions,
  getPermissionById: permissionAPI.getPermissionById,
  getPermissionsByCategory: permissionAPI.getPermissionsByCategory,
  ...settingsAPI,
  ...emailTemplateAPI,
  ...auditLogAPI,
}

export default adminAPI
export {
  staffAPI,
  roleAPI,
  permissionAPI,
  settingsAPI,
  emailTemplateAPI,
  auditLogAPI,
}