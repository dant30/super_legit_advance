import React, { useState, useRef, useCallback } from 'react'
import {
  Upload,
  File,
  Image,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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
  maxSize?: number // MB
  maxFiles?: number
  multiple?: boolean
  disabled?: boolean
  label?: string
  onFilesChange?: (files: UploadedFile[]) => void
  onFileUpload?: (file: File) => Promise<void>
  showPreview?: boolean
  className?: string
  dropzoneClassName?: string
  error?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  maxSize = 10,
  maxFiles = 5,
  multiple = false,
  disabled = false,
  label = 'Upload files',
  onFilesChange,
  onFileUpload,
  showPreview = true,
  className,
  dropzoneClassName,
  error: externalError,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | undefined => {
    const maxSizeBytes = maxSize * 1024 * 1024

    const isAccepted = acceptedTypes.some((type) =>
      type.endsWith('/*')
        ? file.type.startsWith(type.replace('/*', ''))
        : file.type === type || file.name.toLowerCase().endsWith(type)
    )

    if (!isAccepted) {
      return `File type not allowed`
    }

    if (file.size > maxSizeBytes) {
      return `File exceeds ${maxSize}MB`
    }

    return undefined
  }

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return

      const incoming = Array.from(fileList)
      if (files.length + incoming.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }

      const mapped: UploadedFile[] = incoming.map((file) => {
        const error = validateFile(file)
        const previewUrl = file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined

        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          error,
          progress: 0,
          uploaded: false,
        }
      })

      const updated = multiple ? [...files, ...mapped] : mapped
      setFiles(updated)
      onFilesChange?.(updated)

      if (onFileUpload && !mapped.some(f => f.error)) {
        setUploading(true)
        Promise.all(mapped.filter(f => !f.error).map((f) => uploadFile(f)))
          .catch(err => console.error('Batch upload error:', err))
          .finally(() => setUploading(false))
      }
    },
    [files, multiple, maxFiles, disabled, onFilesChange, onFileUpload]
  )

  const uploadFile = async (fileItem: UploadedFile) => {
    try {
      await onFileUpload?.(fileItem.file)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, uploaded: true, progress: 100 } : f
        )
      )
    } catch (e) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                error: e instanceof Error ? e.message : 'Upload failed',
              }
            : f
        )
      )
    }
  }

  const removeFile = (id: string) => {
    const target = files.find((f) => f.id === id)
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl)
    }

    const updated = files.filter((f) => f.id !== id)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        disabled={disabled || uploading}
        onChange={(e) => handleFiles(e.target.files)}
        aria-label={label}
      />

      <div
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 bg-gray-50 dark:bg-gray-900/20 hover:border-gray-400 dark:hover:border-gray-600',
          disabled && 'cursor-not-allowed opacity-50',
          dropzoneClassName
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={(e) => {
          if (!disabled) {
            e.preventDefault()
            setDragOver(true)
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!disabled) {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            fileInputRef.current?.click()
          }
        }}
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400 dark:text-gray-500" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {`Max ${maxSize}MB • ${acceptedTypes.length} file types`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          {files.map((f) => (
            <div
              key={f.id}
              className={cn(
                'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                f.error
                  ? 'border-danger-200 bg-danger-50 dark:bg-danger-900/20'
                  : f.uploaded
                  ? 'border-success-200 bg-success-50 dark:bg-success-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800'
              )}
            >
              {showPreview && f.previewUrl ? (
                <img
                  src={f.previewUrl}
                  alt={f.file.name}
                  className="h-16 w-16 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  {f.file.type.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <File className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {f.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(f.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500 hover:text-danger-500 dark:hover:text-danger-400 transition-colors"
                    aria-label={`Remove ${f.file.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {f.error && (
                  <div className="mt-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400 flex-shrink-0" />
                    <p className="text-sm text-danger-600 dark:text-danger-400">
                      {f.error}
                    </p>
                  </div>
                )}

                {!f.error && !f.uploaded && f.progress !== undefined && (
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {externalError && (
        <div className="mt-3 flex items-center gap-2 text-sm text-danger-600 dark:text-danger-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{externalError}</span>
        </div>
      )}
    </div>
  )
}

// export default FileUpload