// frontend/src/hooks/useApi.js
import { useState, useCallback, useRef } from 'react'
import { useToast } from '../contexts/ToastContext'

/**
 * Generic API hook for handling common API operations
 * Provides standardized loading, error, and success states
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.showToast - Whether to show toast notifications
 * @param {string} options.successMessage - Default success message
 * @param {string} options.errorMessage - Default error message
 * @returns {Object} API methods and state
 */
export const useApi = (options = {}) => {
  const {
    showToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options

  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
    progress: 0,
    isSubmitting: false,
    isUploading: false,
    uploadProgress: 0
  })

  const { addToast } = useToast()
  const abortControllerRef = useRef(null)

  // ==================== STATE MANAGEMENT ====================

  const setLoading = useCallback((loading) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setData = useCallback((data) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  const setProgress = useCallback((progress) => {
    setState(prev => ({ ...prev, progress: Math.min(progress, 100) }))
  }, [])

  const setSubmitting = useCallback((isSubmitting) => {
    setState(prev => ({ ...prev, isSubmitting }))
  }, [])

  const setUploading = useCallback((isUploading) => {
    setState(prev => ({ ...prev, isUploading }))
  }, [])

  const setUploadProgress = useCallback((uploadProgress) => {
    setState(prev => ({ ...prev, uploadProgress: Math.min(uploadProgress, 100) }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const clearData = useCallback(() => {
    setState(prev => ({ ...prev, data: null }))
  }, [])

  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null,
      progress: 0,
      isSubmitting: false,
      isUploading: false,
      uploadProgress: 0
    })
  }, [])

  // ==================== API CALL METHODS ====================

  /**
   * Generic GET request
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments to pass to the API function
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  const get = useCallback(async (apiCall, args = [], options = {}) => {
    const {
      showProgress = false,
      progressInterval = 20,
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError
    } = options

    try {
      setLoading(true)
      setError(null)
      
      if (showProgress) {
        setProgress(10)
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController()
      
      // Execute API call
      const response = await apiCall(...args, { 
        signal: abortControllerRef.current.signal 
      })
      
      if (showProgress) {
        setProgress(100)
      }

      setData(response)
      
      // Show success toast if enabled
      if (showToast) {
        const message = customSuccessMessage || successMessage
        addToast(message, 'success')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response)
      }

      // Reset progress after delay
      if (showProgress) {
        setTimeout(() => setProgress(0), 1000)
      }

      return response
    } catch (error) {
      // Don't process error if request was cancelled
      if (error.name === 'AbortError') {
        return
      }

      const message = customErrorMessage || errorMessage || error.response?.data?.error || error.message
      setError(message)
      
      if (showToast) {
        addToast(message, 'error')
      }

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [setLoading, setError, setData, setProgress, showToast, successMessage, errorMessage, addToast])

  /**
   * Generic POST request
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments to pass to the API function
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  const post = useCallback(async (apiCall, args = [], options = {}) => {
    const {
      showProgress = true,
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError,
      resetForm
    } = options

    try {
      setSubmitting(true)
      setError(null)
      
      if (showProgress) {
        setProgress(10)
      }

      // Execute API call
      const response = await apiCall(...args)
      
      if (showProgress) {
        setProgress(100)
      }

      setData(response)
      
      // Show success toast if enabled
      if (showToast) {
        const message = customSuccessMessage || 'Record created successfully'
        addToast(message, 'success')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response)
      }

      // Reset form if provided
      if (resetForm) {
        resetForm()
      }

      // Reset progress after delay
      if (showProgress) {
        setTimeout(() => setProgress(0), 1000)
      }

      return response
    } catch (error) {
      const message = customErrorMessage || 'Failed to create record' || error.response?.data?.error || error.message
      setError(message)
      
      if (showToast) {
        addToast(message, 'error')
      }

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setSubmitting(false)
    }
  }, [setSubmitting, setError, setData, setProgress, showToast, addToast])

  /**
   * Generic PUT/PATCH request
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments to pass to the API function
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  const update = useCallback(async (apiCall, args = [], options = {}) => {
    const {
      showProgress = true,
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError
    } = options

    try {
      setSubmitting(true)
      setError(null)
      
      if (showProgress) {
        setProgress(10)
      }

      // Execute API call
      const response = await apiCall(...args)
      
      if (showProgress) {
        setProgress(100)
      }

      setData(response)
      
      // Show success toast if enabled
      if (showToast) {
        const message = customSuccessMessage || 'Record updated successfully'
        addToast(message, 'success')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response)
      }

      // Reset progress after delay
      if (showProgress) {
        setTimeout(() => setProgress(0), 1000)
      }

      return response
    } catch (error) {
      const message = customErrorMessage || 'Failed to update record' || error.response?.data?.error || error.message
      setError(message)
      
      if (showToast) {
        addToast(message, 'error')
      }

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setSubmitting(false)
    }
  }, [setSubmitting, setError, setData, setProgress, showToast, addToast])

  /**
   * Generic DELETE request
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments to pass to the API function
   * @param {Object} options - Request options
   * @returns {Promise} API response
   */
  const destroy = useCallback(async (apiCall, args = [], options = {}) => {
    const {
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError,
      confirmMessage = 'Are you sure you want to delete this record?',
      requireConfirmation = true
    } = options

    try {
      // Show confirmation if required
      if (requireConfirmation && !window.confirm(confirmMessage)) {
        return
      }

      setLoading(true)
      setError(null)

      // Execute API call
      const response = await apiCall(...args)

      setData(response)
      
      // Show success toast if enabled
      if (showToast) {
        const message = customSuccessMessage || 'Record deleted successfully'
        addToast(message, 'success')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response)
      }

      return response
    } catch (error) {
      const message = customErrorMessage || 'Failed to delete record' || error.response?.data?.error || error.message
      setError(message)
      
      if (showToast) {
        addToast(message, 'error')
      }

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setData, showToast, addToast])

  /**
   * File upload with progress tracking
   * @param {Function} apiCall - API function to call
   * @param {FormData} formData - Form data to upload
   * @param {Object} options - Upload options
   * @returns {Promise} Upload response
   */
  const upload = useCallback(async (apiCall, formData, options = {}) => {
    const {
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError,
      onProgress
    } = options

    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      // Execute API call with progress tracking
      const response = await apiCall(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
          
          if (onProgress) {
            onProgress(percentCompleted)
          }
        }
      })

      setData(response)
      setUploadProgress(100)
      
      // Show success toast if enabled
      if (showToast) {
        const message = customSuccessMessage || 'File uploaded successfully'
        addToast(message, 'success')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response)
      }

      // Reset upload progress after delay
      setTimeout(() => setUploadProgress(0), 1000)

      return response
    } catch (error) {
      const message = customErrorMessage || 'Failed to upload file' || error.response?.data?.error || error.message
      setError(message)
      setUploadProgress(0)
      
      if (showToast) {
        addToast(message, 'error')
      }

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setUploading(false)
    }
  }, [setUploading, setError, setData, setUploadProgress, showToast, addToast])

  /**
   * File download with progress tracking
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments to pass to the API function
   * @param {Object} options - Download options
   * @returns {Promise} Download response
   */
  const download = useCallback(async (apiCall, args = [], options = {}) => {
    const {
      filename,
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError,
      onProgress
    } = options

    try {
      setLoading(true)
      setError(null)
      setProgress(0)

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController()

      // Execute API call with progress tracking
      const response = await apiCall(...args, {
        responseType: 'blob',
        signal: abortControllerRef.current.signal,
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setProgress(percentCompleted)
          
          if (onProgress) {
            onProgress(percentCompleted)
          }
        }
      })

      setProgress(100)

      // Trigger file download
      const url = window.URL.createObjectURL(response)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename || 'download')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Show success toast if enabled
      if (showToast) {
        const message = customSuccessMessage || 'File downloaded successfully'
        addToast(message, 'success')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response)
      }

      // Reset progress after delay
      setTimeout(() => setProgress(0), 1000)

      return response
    } catch (error) {
      // Don't process error if request was cancelled
      if (error.name === 'AbortError') {
        return
      }

      const message = customErrorMessage || 'Failed to download file' || error.response?.data?.error || error.message
      setError(message)
      setProgress(0)
      
      if (showToast) {
        addToast(message, 'error')
      }

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [setLoading, setError, setProgress, showToast, addToast])

  /**
   * Cancel current request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      
      if (showToast) {
        addToast('Request cancelled', 'warning')
      }
    }
  }, [showToast, addToast])

  /**
   * Execute multiple API calls in parallel
   * @param {Array} promises - Array of API calls
   * @param {Object} options - Options
   * @returns {Promise} Combined results
   */
  const all = useCallback(async (promises, options = {}) => {
    const {
      customSuccessMessage,
      customErrorMessage,
      onSuccess,
      onError
    } = options

    try {
      setLoading(true)
      setError(null)

      const results = await Promise.all(promises)
      
      // Show success toast if enabled
      if (showToast) {
        const message = customSuccessMessage || 'All operations completed successfully'
        addToast(message, 'success')
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(results)
      }

      return results
    } catch (error) {
      const message = customErrorMessage || 'One or more operations failed' || error.response?.data?.error || error.message
      setError(message)
      
      if (showToast) {
        addToast(message, 'error')
      }

      // Call error callback if provided
      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, showToast, addToast])

  /**
   * Retry an API call with exponential backoff
   * @param {Function} apiCall - API function to retry
   * @param {Array} args - Arguments to pass to the API function
   * @param {Object} options - Retry options
   * @returns {Promise} API response
   */
  const retry = useCallback(async (apiCall, args = [], options = {}) => {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      onRetry,
      customSuccessMessage,
      customErrorMessage
    } = options

    let retries = 0
    let delay = initialDelay

    while (retries < maxRetries) {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiCall(...args)
        
        if (showToast && customSuccessMessage) {
          addToast(customSuccessMessage, 'success')
        }

        setLoading(false)
        return response
      } catch (error) {
        retries++
        
        if (onRetry) {
          onRetry(retries, error)
        }

        if (retries >= maxRetries) {
          const message = customErrorMessage || `Failed after ${maxRetries} retries` || error.response?.data?.error || error.message
          setError(message)
          
          if (showToast) {
            addToast(message, 'error')
          }
          
          setLoading(false)
          throw error
        }

        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
  }, [setLoading, setError, showToast, addToast])

  return {
    // State
    ...state,
    
    // State management
    setLoading,
    setError,
    setData,
    setProgress,
    setSubmitting,
    setUploading,
    setUploadProgress,
    clearError,
    clearData,
    resetState,
    
    // API methods
    get,
    post,
    update,
    destroy,
    upload,
    download,
    all,
    retry,
    
    // Utility methods
    cancel
  }
}

export default useApi