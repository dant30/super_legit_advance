// frontend/src/components/shared/FileUpload.jsx
import React, { useState, useRef, useCallback } from 'react'
import { Upload, File, Image, AlertCircle, Trash2, X, CheckCircle } from 'lucide-react'
import { cn } from '@utils/cn'
import Button from '@components/ui/Button'

const FileUpload = ({
  accept,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxSize = 10, // MB
  maxFiles = 5,
  multiple = false,
  disabled = false,
  label = 'Upload files',
  onFilesChange,
  onFileSelect,
  onFileUpload,
  showPreview = true,
  className,
  dropzoneClassName,
  error: externalError,
  showFileList = true,
  variant = 'default', // 'default', 'compact', 'drag-only'
}) => {
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const getAcceptString = () => {
    if (accept) return accept
    return acceptedTypes.join(',')
  }

  const validateFile = (file) => {
    const maxSizeBytes = maxSize * 1024 * 1024
    
    const typesToCheck = accept ? 
      accept.split(',').map(t => t.trim()) : 
      acceptedTypes

    const isAccepted = typesToCheck.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''))
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase())
    })

    if (!isAccepted) {
      return `File type not allowed. Accepted: ${typesToCheck.join(', ')}`
    }

    if (file.size > maxSizeBytes) {
      return `File exceeds ${maxSize}MB limit`
    }

    return null
  }

  const handleFiles = useCallback((fileList) => {
    if (!fileList || disabled) return

    const incoming = Array.from(fileList)
    if (files.length + incoming.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const mapped = incoming.map((file) => {
      const error = validateFile(file)
      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl,
        error,
        progress: 0,
        uploaded: false,
      }
    })

    const updated = multiple ? [...files, ...mapped] : mapped
    setFiles(updated)
    
    if (onFilesChange) onFilesChange(updated)
    
    if (onFileSelect) {
      if (incoming.length > 0) {
        onFileSelect(incoming[0])
      } else {
        onFileSelect(null)
      }
    }

    if (onFileUpload && !mapped.some(f => f.error)) {
      setUploading(true)
      Promise.all(mapped.filter(f => !f.error).map((f) => uploadFile(f)))
        .catch(err => console.error('Batch upload error:', err))
        .finally(() => setUploading(false))
    }
  }, [files, multiple, maxFiles, disabled, onFilesChange, onFileUpload, onFileSelect])

  const uploadFile = async (fileItem) => {
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: i } : f
        ))
      }
      
      await onFileUpload(fileItem.file)
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, uploaded: true, progress: 100 } : f
      ))
    } catch (err) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          error: err.message || 'Upload failed' 
        } : f
      ))
    }
  }

  const removeFile = (id) => {
    const target = files.find(f => f.id === id)
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
    }

    const updated = files.filter(f => f.id !== id)
    setFiles(updated)
    
    if (onFilesChange) onFilesChange(updated)
    if (onFileSelect) {
      if (updated.length > 0) {
        onFileSelect(updated[0].file)
      } else {
        onFileSelect(null)
      }
    }
  }

  const clearFiles = () => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
    })
    setFiles([])
    if (onFilesChange) onFilesChange([])
    if (onFileSelect) onFileSelect(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    if (!disabled) {
      e.preventDefault()
      setDragOver(true)
    }
  }

  const handleDragLeave = () => setDragOver(false)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderFileItem = (fileItem) => (
    <div
      key={fileItem.id}
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        fileItem.error
          ? 'border-danger-200 bg-danger-50 dark:bg-danger-900/20'
          : fileItem.uploaded
          ? 'border-success-200 bg-success-50 dark:bg-success-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800'
      )}
    >
      {/* File Icon/Preview */}
      <div className="flex-shrink-0">
        {showPreview && fileItem.previewUrl ? (
          <img
            src={fileItem.previewUrl}
            alt={fileItem.file.name}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
            {fileItem.file.type.startsWith('image/') ? (
              <Image className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <File className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {fileItem.file.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(fileItem.file.size)}
              </span>
              {fileItem.uploaded && (
                <CheckCircle className="h-3 w-3 text-success-600 dark:text-success-400" />
              )}
            </div>
          </div>
          <button
            onClick={() => removeFile(fileItem.id)}
            className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-danger-500 dark:hover:text-danger-400 transition-colors"
            aria-label={`Remove ${fileItem.file.name}`}
            disabled={uploading}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Error Message */}
        {fileItem.error && (
          <div className="mt-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400 flex-shrink-0" />
            <p className="text-sm text-danger-600 dark:text-danger-400">
              {fileItem.error}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {fileItem.progress > 0 && fileItem.progress < 100 && (
          <div className="mt-2">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300"
                style={{ width: `${fileItem.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {fileItem.progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={getAcceptString()}
        disabled={disabled || uploading}
        onChange={(e) => handleFiles(e.target.files)}
        aria-label={label}
      />

      {/* Dropzone */}
      <div
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 bg-gray-50 dark:bg-gray-900/20 hover:border-gray-400 dark:hover:border-gray-600',
          disabled && 'cursor-not-allowed opacity-50',
          dropzoneClassName
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            fileInputRef.current?.click()
          }
        }}
      >
        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400 dark:text-gray-500" />
        <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {`Drag & drop files or `}
          <span className="text-primary-600 dark:text-primary-400 font-medium cursor-pointer">
            browse
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {`Max ${maxSize}MB • ${acceptedTypes.length} file types`}
        </p>
      </div>

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </h4>
            <button
              onClick={clearFiles}
              className="text-sm text-gray-500 hover:text-danger-600 dark:text-gray-400 dark:hover:text-danger-400 transition-colors"
              disabled={uploading}
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map(renderFileItem)}
          </div>
        </div>
      )}

      {/* Compact File List */}
      {!showFileList && files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.slice(0, 3).map(fileItem => (
            <div
              key={fileItem.id}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-sm"
            >
              <File className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className="truncate max-w-[100px] text-gray-700 dark:text-gray-300">
                {fileItem.file.name}
              </span>
              <button
                onClick={() => removeFile(fileItem.id)}
                className="text-gray-400 hover:text-danger-500 dark:text-gray-500 dark:hover:text-danger-400"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {files.length > 3 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              +{files.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* External Error */}
      {externalError && (
        <div className="mt-3 flex items-center gap-2 text-sm text-danger-600 dark:text-danger-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{externalError}</span>
        </div>
      )}
    </div>
  )
}

// Single File Upload Component
export const SingleFileUpload = (props) => (
  <FileUpload
    multiple={false}
    maxFiles={1}
    showFileList={true}
    {...props}
  />
)

// Multiple File Upload Component
export const MultipleFileUpload = (props) => (
  <FileUpload
    multiple={true}
    maxFiles={10}
    showFileList={true}
    {...props}
  />
)

export default FileUpload