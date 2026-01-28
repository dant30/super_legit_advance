import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Upload } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import CustomerDocuments from '@/components/customers/CustomerDocuments'

export default function CustomerDocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showUpload, setShowUpload] = useState(false)

  return (
    <>
      <Helmet>
        <title>Customer Documents | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/customers/${id}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Customer Documents
              </h1>
            </div>
          </div>
          <Button onClick={() => setShowUpload(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Documents */}
        <CustomerDocuments />

        {/* Upload Modal */}
        <Modal open={showUpload} onClose={() => setShowUpload(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Upload Document</h2>
            {/* Add upload form here */}
          </div>
        </Modal>
      </div>
    </>
  )
}