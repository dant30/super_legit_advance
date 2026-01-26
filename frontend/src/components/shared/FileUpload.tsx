import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { Upload, X, File, Image, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

export interface UploadedFile {
  id: string
  file: File
  previewUrl?: string
  progress?: number
  error?: string
  uploaded?: boolean
}

export interface FileUploadProps {
  acceptedTypes?: string[]
  maxSize?: number // in MB
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  label?: string
  description?: string
  onFilesChange?: (files: UploadedFile[]) => void
  onFileUpload?: (file: File) => Promise<void>
  showPreview?: boolean
  className?: string
  dropzoneClassName?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxSize = 10, // 10MB
  maxFiles = 5,
  multiple = false,
  disabled = false,
  label = 'Upload files',
  description = `Drag & drop files here or click to browse. Max size: ${maxSize}MB`,
  onFilesChange,
  onFileUpload,
  showPreview = true,
  className,
  dropzoneClassName,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''))
        }
        return file.type === type || file.name.toLowerCase().endsWith(type)
      })

      if (!isAccepted) {
        return `File type not allowed. Accepted types: ${acceptedTypes.join(', ')}`
      }
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSize}MB limit`
    }

    return null
  }

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles || disabled) return

      const newFiles: UploadedFile[] = []
      const filesArray = Array.from(selectedFiles)

      // Check max files
      if (maxFiles && files.length + filesArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }

      filesArray.forEach((file) => {
        const error = validateFile(file)
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        let previewUrl: string | undefined
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file)
        }

        newFiles.push({
          id,
          file,
          previewUrl,
          error,
          progress: 0,
          uploaded: false,
        })
      })

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)

      // Auto-upload if callback provided
      if (onFileUpload) {
        setUploading(true)
        Promise.all(newFiles.map((fileItem) => handleUpload(fileItem)))
          .catch(console.error)
          .finally(() => setUploading(false))
      }
    },
    [files, multiple, maxFiles, disabled, onFilesChange, onFileUpload]
  )

  const handleUpload = async (fileItem: UploadedFile) => {
    try {
      await onFileUpload?.(fileItem.file)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, uploaded: true, progress: 100 } : f
        )
      )
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      )
    }
  }

  const handleRemoveFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id)
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl)
    }

    const updatedFiles = files.filter((f) => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />
    if (file.type.includes('pdf')) return <File className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Dropzone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
          disabled && 'opacity-50 cursor-not-allowed',
          dropzoneClassName
        )}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !disabled && !uploading) {
            fileInputRef.current?.click()
          }
        }}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
        <button
          type="button"
          className="btn-primary"
          disabled={disabled || uploading}
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
        >
          Browse Files
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selected Files ({files.length}):
          </p>

          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className={cn(
                'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                fileItem.error
                  ? 'border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20'
                  : fileItem.uploaded
                  ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              {/* Preview/Icon */}
              {showPreview && fileItem.previewUrl ? (
                <div className="flex-shrink-0">
                  <img
                    src={fileItem.previewUrl}
                    alt={fileItem.file.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  {getFileIcon(fileItem.file)}
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="truncate font-medium text-gray-900 dark:text-white">
                    {fileItem.file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {fileItem.error && (
                      <AlertCircle className="h-5 w-5 text-danger-500" />
                    )}
                    {fileItem.uploaded && (
                      <CheckCircle className="h-5 w-5 text-success-500" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(fileItem.id)}
                      className="p-1 text-gray-500 hover:text-danger-500 transition-colors"
                      aria-label="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatFileSize(fileItem.file.size)}
                  </span>

                  {fileItem.progress !== undefined && fileItem.progress > 0 && (
                    <div className="w-32">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all duration-300"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {fileItem.error && (
                  <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
                    {fileItem.error}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-sm text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 font-medium"
              disabled={disabled}
            >
              Clear All
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {files.filter((f) => !f.error).length} of {maxFiles} files
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload