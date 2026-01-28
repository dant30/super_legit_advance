import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, FileText } from 'lucide-react'
import Loading from '@/components/shared/Loading'

interface CustomerDocumentsProps {
  customerId: string
}

export default function CustomerDocuments({ customerId }: CustomerDocumentsProps) {
  const [documents] = useState([
    { id: 1, name: 'ID Document', type: 'pdf', uploadedDate: '2024-01-15', size: '2.5 MB' },
    { id: 2, name: 'Passport Photo', type: 'jpg', uploadedDate: '2024-01-15', size: '1.8 MB' },
    { id: 3, name: 'Signature', type: 'png', uploadedDate: '2024-01-15', size: '0.5 MB' },
  ])

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Uploaded Documents</h2>
          <Button size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {doc.uploadedDate} • {doc.size}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No documents uploaded yet</p>
          </div>
        )}
      </Card>
    </div>
  )
}