// frontend/src/hooks/useReports.ts
import { useCallback } from 'react'
import axiosInstance from '@/lib/axios'

export const useReports = () => {
  const getReports = useCallback(async (params?: any) => {
    try {
      const response = await axiosInstance.get('/reports/', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  const generateReport = useCallback(async (data: any) => {
    try {
      const response = await axiosInstance.post('/reports/generate/', data)
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  const exportReport = useCallback(async (data: any, format: 'pdf' | 'excel') => {
    try {
      const endpoint = format === 'pdf' ? '/reports/export/pdf/' : '/reports/export/excel/'
      const response = await axiosInstance.post(endpoint, data, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${data.data_type}_report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  const getLoansReport = useCallback(async (params?: any) => {
    try {
      const response = await axiosInstance.get('/reports/loans/', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  const getPaymentsReport = useCallback(async (params?: any) => {
    try {
      const response = await axiosInstance.get('/reports/payments/', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  const getCustomersReport = useCallback(async (params?: any) => {
    try {
      const response = await axiosInstance.get('/reports/customers/', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  const getReportHistory = useCallback(async (params?: any) => {
    try {
      const response = await axiosInstance.get('/reports/history/', { params })
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  const scheduleReport = useCallback(async (data: any) => {
    try {
      const response = await axiosInstance.post('/reports/schedule/', data)
      return response.data
    } catch (error) {
      throw error
    }
  }, [])

  return {
    getReports,
    generateReport,
    exportReport,
    getLoansReport,
    getPaymentsReport,
    getCustomersReport,
    getReportHistory,
    scheduleReport,
  }
}