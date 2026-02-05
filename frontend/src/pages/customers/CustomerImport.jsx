// frontend/src/pages/customers/CustomerImport.jsx
import React, { useState } from 'react'
import { Card, Steps, Result, Button } from '@components/ui'
import { PageHeader } from '@components/shared'
import { ArrowLeft, Upload, CheckCircle, FileSpreadsheet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ImportDialog } from '@components/customers'

const CustomerImport = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const steps = [
    {
      title: 'Prepare Data',
      description: 'Format your data according to requirements',
    },
    {
      title: 'Upload File',
      description: 'Select and upload your file',
    },
    {
      title: 'Validate',
      description: 'System checks for errors',
    },
    {
      title: 'Import',
      description: 'Data is imported into system',
    },
  ]

  const handleImportSuccess = (result) => {
    setImportComplete(true)
    setImportResult(result)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Customers"
        subTitle="Bulk import customers from Excel or CSV"
        extra={[
          <Link to="/customers" key="back">
            <Button icon={<ArrowLeft size={16} />}>
              Back to Customers
            </Button>
          </Link>,
        ]}
      />

      {importComplete ? (
        <Result
          icon={<CheckCircle className="text-green-500" size={64} />}
          title="Import Completed Successfully"
          subTitle={`Successfully imported ${importResult?.imported_count || 0} customers`}
          extra={[
            <Link to="/customers" key="view">
              <Button type="primary">View Customers</Button>
            </Link>,
            <Button 
              key="importMore" 
              onClick={() => {
                setImportComplete(false)
                setImportDialogOpen(true)
              }}
            >
              Import More
            </Button>,
          ]}
        />
      ) : (
        <Card>
          <div className="mb-8">
            <Steps current={0} items={steps} />
          </div>

          <div className="text-center py-8">
            <FileSpreadsheet size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Import Customers?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Import customers from Excel or CSV files. Ensure your file follows the required format 
              and includes all mandatory fields. Download the template for guidance.
            </p>
            
            <div className="space-x-4">
              <Button 
                type="primary" 
                size="large"
                icon={<Upload size={20} />}
                onClick={() => setImportDialogOpen(true)}
              >
                Start Import
              </Button>
              <Button size="large">
                Download Template
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h4 className="font-medium mb-3">Import Guidelines</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium mb-1">Required Fields:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>First Name</li>
                  <li>Last Name</li>
                  <li>ID Number (8 digits)</li>
                  <li>Phone Number (10 digits)</li>
                  <li>Date of Birth (YYYY-MM-DD)</li>
                  <li>Gender (M/F/O)</li>
                  <li>Physical Address</li>
                  <li>County</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Best Practices:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Use the provided template</li>
                  <li>Check for duplicate IDs</li>
                  <li>Validate phone numbers</li>
                  <li>Test with small files first</li>
                  <li>Keep backup of original data</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  )
}

export default CustomerImport