// frontend/src/components/ui/Upload.jsx
import React, { useState, useCallback } from 'react'
import FileUpload from '@components/shared/FileUpload'
import Button from '@components/ui/Button'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@utils/cn'

/**
 * Upload
 * ------------------------------------------------------------------
 * High-level upload orchestrator built on top of FileUpload
 * Handles:
 * - backend integration
 * - upload lifecycle
 * - UX states
 * - result normalization
 */

const Upload = ({
  mode = 'multiple', // 'single' | 'multiple' | 'avatar' | 'documents'
  label,
  value,
  onChange,
  uploadFn, // async (file) => { id, url, name }
  disabled = false,
  className,
  hint,
  error,
}) => {
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [internalFiles, setInternalFiles] = useState(value || [])
  const [serverFiles, setServerFiles] = useState([])

  /* --------------------------------------------
   * Mode presets (opinionated by design)
   * ------------------------------------------ */
  const MODE_CONFIG = {
    single: {
      multiple: false,
      maxFiles: 1,
      acceptedTypes: ['image/*', '.pdf'],
      label: label || 'Upload file',
    },
    multiple: {
      multiple: true,
      maxFiles: 10,
      acceptedTypes: ['image/*', '.pdf', '.doc', '.docx'],
      label: label || 'Upload files',
    },
    avatar: {
      multiple: false,
      maxFiles: 1,
      acceptedTypes: ['image/png', 'image/jpeg', 'image/webp'],
      label: label || 'Upload profile photo',
    },
    documents: {
      multiple: true,
      maxFiles: 20,
      acceptedTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      label: label || 'Upload documents',
    },
  }

  const config = MODE_CONFIG[mode]

  /* --------------------------------------------
   * Backend upload handler
   * ------------------------------------------ */
  const handleUpload = useCallback(
    async (file) => {
      if (!uploadFn) return

      try {
        setStatus('uploading')
        const result = await uploadFn(file)

        setServerFiles((prev) => [...prev, result])
        setStatus('success')

        const next = [...internalFiles, result]
        setInternalFiles(next)
        onChange?.(next)

        return result
      } catch (err) {
        console.error('Upload failed:', err)
        setStatus('error')
        throw err
      }
    },
    [uploadFn, internalFiles, onChange]
  )

  /* --------------------------------------------
   * File selection sync
   * ------------------------------------------ */
  const handleFilesChange = (items) => {
    setInternalFiles(items)
    onChange?.(items)
  }

  const clearAll = () => {
    setInternalFiles([])
    setServerFiles([])
    setStatus('idle')
    onChange?.([])
  }

  /* --------------------------------------------
   * UI helpers
   * ------------------------------------------ */
  const renderStatus = () => {
    if (status === 'uploading') {
      return (
        <div className="flex items-center gap-2 text-sm text-primary-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading…
        </div>
      )
    }

    if (status === 'success') {
      return (
        <div className="flex items-center gap-2 text-sm text-success-600">
          <CheckCircle2 className="h-4 w-4" />
          Upload complete
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="flex items-center gap-2 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4" />
          Upload failed
        </div>
      )
    }

    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <FileUpload
        multiple={config.multiple}
        maxFiles={config.maxFiles}
        acceptedTypes={config.acceptedTypes}
        label={config.label}
        disabled={disabled || status === 'uploading'}
        onFilesChange={handleFilesChange}
        onFileUpload={uploadFn ? handleUpload : undefined}
        showPreview={mode !== 'documents'}
      />

      {/* Status + hint */}
      {(hint || status !== 'idle') && (
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">{hint}</div>
          {renderStatus()}
        </div>
      )}

      {/* External error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Actions */}
      {internalFiles.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={status === 'uploading'}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}

export default Upload
