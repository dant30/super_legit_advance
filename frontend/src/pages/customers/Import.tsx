// frontend/src/pages/customers/Import.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/shared/Loading'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { FileUpload } from '@/components/shared/FileUpload'
import { toast } from 'react-hot-toast'
import Papa from 'papaparse'

interface ImportError {
  row: number
  message: string
}

interface ColumnMapping {
  [key: string]: string
}

const CustomerImport: React.FC = () => {
  const navigate = useNavigate()
  const { importCustomers } = useCustomers()

  const [step, setStep] = useState<'upload' | 'map' | 'review' | 'complete'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [errors, setErrors] = useState<ImportError[]>([])
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<{
    imported: number
    failed: number
    errors: ImportError[]
  } | null>(null)

  const requiredFields = [
    'first_name',
    'last_name',
    'phone_number',
    'id_number',
    'date_of_birth',
    'gender',
    'physical_address',
    'county'
  ]

  const fieldLabels: Record<string, string> = {
    first_name: 'First Name',
    last_name: 'Last Name',
    middle_name: 'Middle Name',
    phone_number: 'Phone Number',
    email: 'Email',
    id_number: 'ID Number',
    id_type: 'ID Type',
    date_of_birth: 'Date of Birth',
    gender: 'Gender',
    marital_status: 'Marital Status',
    nationality: 'Nationality',
    physical_address: 'Physical Address',
    postal_address: 'Postal Address',
    county: 'County',
    sub_county: 'Sub County',
    ward: 'Ward',
    bank_name: 'Bank Name',
    bank_account_number: 'Bank Account',
    bank_branch: 'Bank Branch',
    notes: 'Notes',
    referred_by: 'Referred By'
  }

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    
    if (selectedFile.name.endsWith('.csv')) {
      parseCSV(selectedFile)
    } else {
      toast.error('Please upload a CSV file')
    }
  }

  const parseCSV = (file: File) => {
    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Failed to parse CSV file')
          return
        }
        
        setData(results.data as any[])
        setColumns(results.meta.fields || [])
        setStep('map')
        setLoading(false)
      },
      error: (error) => {
        toast.error(error.message)
        setLoading(false)
      }
    })
  }

  const handleColumnMapping = () => {
    const newErrors: ImportError[] = []
    
    requiredFields.forEach(field => {
      if (!columnMapping[field]) {
        newErrors.push({
          row: 0,
          message: `Required field "${fieldLabels[field]}" is not mapped`
        })
      }
    })

    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        const mappedColumn = columnMapping[field]
        if (mappedColumn && !row[mappedColumn]) {
          newErrors.push({
            row: index + 2,
            message: `Row ${index + 2}: "${fieldLabels[field]}" is required but empty`
          })
        }
      })

      if (columnMapping.phone_number && row[columnMapping.phone_number]) {
        const phone = row[columnMapping.phone_number].toString()
        if (!phone.match(/^(\+254|0|254)\d{9}$/)) {
          newErrors.push({
            row: index + 2,
            message: `Invalid phone number format: ${phone}`
          })
        }
      }

      if (columnMapping.date_of_birth && row[columnMapping.date_of_birth]) {
        const date = new Date(row[columnMapping.date_of_birth])
        if (isNaN(date.getTime())) {
          newErrors.push({
            row: index + 2,
            message: `Invalid date format: ${row[columnMapping.date_of_birth]}`
          })
        }
      }
    })

    setErrors(newErrors)
    
    if (newErrors.length === 0) {
      setStep('review')
    } else {
      toast.error(`Found ${newErrors.length} validation errors`)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    try {
      const result = await importCustomers(file)
      setImportResult({
        imported: result.imported_count || 0,
        failed: result.error_count || 0,
        errors: result.errors?.map((error: string, index: number) => ({
          row: index + 2,
          message: error
        })) || []
      })
      
      setStep('complete')
      toast.success(`Successfully imported ${result.imported_count} customers`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to import customers')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setData([])
    setColumns([])
    setColumnMapping({})
    setErrors([])
    setImportResult(null)
    setStep('upload')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: 'Import Customers', href: '#' }
  ]

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <Card className="p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Customer Data</h3>
              <p className="text-gray-500 mb-6">
                Upload a CSV file containing customer information
              </p>
              
              <div className="max-w-md mx-auto">
                <FileUpload
                  accept=".csv"
                  onFileSelect={handleFileSelect}
                  disabled={loading}
                />
                <div className="mt-4 text-sm text-gray-500">
                  <p className="font-medium">File Requirements:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• CSV format only</li>
                    <li>• Include required fields: First Name, Last Name, Phone, ID Number</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Use proper date formats (YYYY-MM-DD)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'map':
        return (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Map Columns</h3>
            <p className="text-gray-600 mb-6">
              Map your file columns to the system fields
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      System Field
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Required
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      File Column
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sample Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.keys(fieldLabels).map((field) => (
                    <tr key={field} className={requiredFields.includes(field) ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {fieldLabels[field]}
                        {requiredFields.includes(field) && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {requiredFields.includes(field) ? 'Required' : 'Optional'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={columnMapping[field] || ''}
                          onChange={(e) => setColumnMapping(prev => ({
                            ...prev,
                            [field]: e.target.value
                          }))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          aria-label={`Map ${fieldLabels[field]} column`}
                        >
                          <option value="">Select column...</option>
                          {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {columnMapping[field] && data[0]?.[columnMapping[field]] 
                          ? String(data[0][columnMapping[field]]).substring(0, 30)
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleReset}
              >
                Start Over
              </Button>
              <Button onClick={handleColumnMapping}>
                Validate & Continue
              </Button>
            </div>
          </Card>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Review Import</h3>
              <div className="mb-6">
                <p className="text-gray-600">
                  {data.length} records found. Ready to import.
                </p>
              </div>

              <div className="overflow-x-auto max-h-96 border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">#</th>
                      {Object.keys(columnMapping)
                        .filter(field => columnMapping[field])
                        .map(field => (
                          <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                            {fieldLabels[field]}
                          </th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                        {Object.keys(columnMapping)
                          .filter(field => columnMapping[field])
                          .map(field => (
                            <td key={field} className="px-4 py-3 text-sm">
                              {row[columnMapping[field]] ? String(row[columnMapping[field]]) : '-'}
                            </td>
                          ))
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 10 && (
                  <p className="text-sm text-gray-500 mt-2 text-center p-4 border-t">
                    Showing first 10 of {data.length} records
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Import Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {data.length}
                  </div>
                  <div className="text-sm text-blue-600">Total Records</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {requiredFields.filter(f => columnMapping[f]).length}
                  </div>
                  <div className="text-sm text-green-600">Required Fields Mapped</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">
                    {errors.length}
                  </div>
                  <div className="text-sm text-yellow-600">Validation Errors</div>
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep('map')}
                >
                  Back to Mapping
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={loading}
                >
                  {loading ? 'Importing...' : 'Start Import'}
                </Button>
              </div>
            </Card>
          </div>
        )

      case 'complete':
        return (
          <Card className="p-8">
            <div className="text-center">
              {importResult && importResult.imported > 0 ? (
                <>
                  <div className="mx-auto h-16 w-16 text-green-500 mb-4">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Import Complete!</h3>
                  <p className="text-gray-500 mb-6">
                    Successfully imported {importResult.imported} customers
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto h-16 w-16 text-red-500 mb-4">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Import Failed</h3>
                  <p className="text-gray-500 mb-6">
                    No customers were imported
                  </p>
                </>
              )}

              {importResult && (
                <div className="max-w-2xl mx-auto mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {importResult.imported}
                      </div>
                      <div className="text-sm text-green-600">Successfully Imported</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {importResult.failed}
                      </div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Import Errors</h4>
                      <div className="max-h-60 overflow-y-auto border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {importResult.errors.slice(0, 20).map((error, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm">Row {error.row}</td>
                                <td className="px-4 py-2 text-sm text-red-600">{error.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {importResult.errors.length > 20 && (
                          <p className="text-sm text-gray-500 p-2 text-center border-t">
                            Showing first 20 of {importResult.errors.length} errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Import Another File
                </Button>
                <Button onClick={() => navigate('/customers')}>
                  View Customers
                </Button>
              </div>
            </div>
          </Card>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">Import Customers</h1>
          <p className="text-gray-600 mt-2">
            Bulk import customers from CSV files
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-center">
          {['upload', 'map', 'review', 'complete'].map((s, index) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  step === s ? 'bg-blue-600 text-white' :
                  ['complete', 'review'].includes(step) && index < ['upload', 'map', 'review', 'complete'].indexOf(step) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="mt-2 text-sm capitalize">{s}</div>
              </div>
              {index < 3 && (
                <div className={`h-1 w-16 mx-2 ${
                  ['complete', 'review'].includes(step) && index < ['upload', 'map', 'review', 'complete'].indexOf(step)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {loading ? <Loading message="Processing..." /> : renderStep()}
    </div>
  )
}

export default CustomerImport