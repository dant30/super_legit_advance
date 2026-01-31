// frontend/src/components/customers/DocumentUpload.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast/useToast'

interface DocumentUploadProps {
  customerId: string
  existingDocuments: {
    id_document?: string
    passport_photo?: string
    signature?: string
  }
  onUploadComplete?: () => void
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  customerId,
  existingDocuments,
  onUploadComplete
}) => {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (file: File, type: 'id_document' | 'passport_photo' | 'signature') => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append(type, file)

    try {
      // In a real app, you would call your API here
      // await updateCustomer(customerId, formData)
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      })
      
      onUploadComplete?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload document',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const renderDocumentCard = (
    title: string,
    type: 'id_document' | 'passport_photo' | 'signature',
    existingUrl?: string,
    accept = '.pdf,.jpg,.jpeg,.png',
    maxSizeMB = 5
  ) => {
    const [file, setFile] = useState<File | null>(null)

    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{title}</h4>
          {existingUrl && (
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Current
            </a>
          )}
        </div>

        {existingUrl && !file ? (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">✓ Document uploaded</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`file-${type}`)?.click()}
            >
              Replace Document
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input
              id={`file-${type}`}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0]
                if (selectedFile) {
                  if (selectedFile.size > maxSizeMB * 1024 * 1024) {
                    toast({
                      title: 'File Too Large',
                      description: `File must be less than ${maxSizeMB}MB`,
                      variant: 'destructive'
                    })
                    return
                  }
                  setFile(selectedFile)
                }
              }}
            />
            
            {!file ? (
              <div>
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById(`file-${type}`)?.click()}
                >
                  Choose File
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Max {maxSizeMB}MB • {accept}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📄</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleFileUpload(file, type)}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderDocumentCard(
          'ID Document',
          'id_document',
          existingDocuments.id_document,
          '.pdf,.jpg,.jpeg,.png',
          5
        )}
        
        {renderDocumentCard(
          'Passport Photo',
          'passport_photo',
          existingDocuments.passport_photo,
          '.jpg,.jpeg,.png',
          3
        )}
        
        {renderDocumentCard(
          'Signature',
          'signature',
          existingDocuments.signature,
          '.jpg,.jpeg,.png',
          2
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p className="font-medium mb-2">Document Requirements:</p>
        <ul className="space-y-1">
          <li>• ID Document: Clear photo/scan of valid ID (National ID, Passport, etc.)</li>
          <li>• Passport Photo: Recent color photo, white background</li>
          <li>• Signature: Clear signature on white background</li>
          <li>• All documents must be legible and unaltered</li>
        </ul>
      </div>
    </div>
  )
}

export default DocumentUpload