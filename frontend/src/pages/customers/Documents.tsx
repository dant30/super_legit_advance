import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Upload, Download, Eye, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Loading from '@/components/shared/Loading'
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
        <CustomerDocuments customerId={id!} />

        {/* Upload Modal */}
        <Modal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          title="Upload Document"
          size="lg"
        >
          {/* Document upload form will go here */}
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Document upload component</p>
          </div>
        </Modal>
      </div>
    </>
  )
}