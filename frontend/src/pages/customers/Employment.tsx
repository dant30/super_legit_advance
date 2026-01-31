// frontend/src/pages/customers/Employment.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { EmploymentForm } from '@/components/customers/EmploymentForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/shared/Loading'
import { Error } from '@/components/shared/Error'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { useToast } from '@/components/ui/Toast/useToast'
import { FileUpload } from '@/components/shared/FileUpload'
import { PAYMENT_FREQUENCY_OPTIONS, SECTOR_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from '@/types/customers'
import type { Employment, EmploymentCreateData } from '@/types/customers'

const EmploymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const {
    employment,
    employmentLoading,
    employmentError,
    fetchEmployment,
    updateEmployment,
    clearEmploymentError
  } = useCustomers()

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) {
      loadEmployment()
    }
  }, [id])

  const loadEmployment = async () => {
    try {
      await fetchEmployment(id!)
    } catch (error) {
      console.error('Failed to load employment:', error)
    }
  }

  const handleSubmit = async (data: EmploymentCreateData) => {
    if (!id) return

    try {
      await updateEmployment({ customerId: id, data })
      toast({
        title: 'Success',
        description: 'Employment information updated'
      })
      setMode('view')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employment',
        variant: 'destructive'
      })
    }
  }

  const handleVerify = async () => {
    if (!id || !employment) return

    const notes = prompt('Enter verification notes:')
    if (!notes) return

    try {
      await updateEmployment({
        customerId: id,
        data: {
          is_verified: true,
          verification_date: new Date().toISOString(),
          verification_method: 'MANUAL',
          verification_notes: notes
        }
      })
      toast({
        title: 'Success',
        description: 'Employment verified successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify employment',
        variant: 'destructive'
      })
    }
  }

  const handleDocumentUpload = async (file: File, type: 'employment_letter' | 'pay_slips' | 'business_permit') => {
    if (!id) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append(type, file)
      
      await updateEmployment({
        customerId: id,
        data: formData as any
      })
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      })
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

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: 'Customer Details', href: `/customers/${id}` },
    { label: 'Employment', href: '#' }
  ]

  if (employmentLoading && !employment) {
    return <Loading message="Loading employment information..." />
  }

  if (employmentError) {
    return (
      <Error
        message={employmentError}
        onRetry={loadEmployment}
        onDismiss={clearEmploymentError}
        actionText="Back to Customer"
        onAction={() => navigate(`/customers/${id}`)}
      />
    )
  }

  const employmentData = employment || {
    customer: id!,
    employment_type: 'UNEMPLOYED' as const,
    sector: 'OTHER',
    occupation: '',
    monthly_income: 0,
    other_income: 0,
    payment_frequency: 'MONTHLY',
    number_of_employees: 0,
    is_verified: false
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employment Information</h1>
            <p className="text-gray-600 mt-2">
              Manage employment details and verification
            </p>
          </div>
          <div className="flex space-x-3">
            {mode === 'view' && isAdmin() && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMode('edit')}
                >
                  Edit
                </Button>
                {!employmentData.is_verified && (
                  <Button onClick={handleVerify}>
                    Verify Employment
                  </Button>
                )}
              </>
            )}
            {mode === 'edit' && (
              <Button
                variant="outline"
                onClick={() => setMode('view')}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {mode === 'view' ? (
        <div className="space-y-6">
          {/* Verification Status */}
          <Card className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Verification Status</h3>
                <div className="mt-2">
                  <Badge variant={employmentData.is_verified ? "success" : "warning"}>
                    {employmentData.is_verified ? 'Verified' : 'Not Verified'}
                  </Badge>
                  {employmentData.verification_date && (
                    <p className="text-sm text-gray-500 mt-1">
                      Verified on {new Date(employmentData.verification_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {employmentData.is_verified && employmentData.verification_method && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Method</p>
                  <p className="font-medium">{employmentData.verification_method}</p>
                </div>
              )}
            </div>
            {employmentData.verification_notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Verification Notes</p>
                <p className="mt-1">{employmentData.verification_notes}</p>
              </div>
            )}
          </Card>

          {/* Employment Details */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-500">Employment Type</label>
                <p className="font-medium mt-1">
                  {EMPLOYMENT_TYPE_OPTIONS.find(opt => opt.value === employmentData.employment_type)?.label || employmentData.employment_type}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Sector</label>
                <p className="font-medium mt-1">
                  {SECTOR_OPTIONS.find(opt => opt.value === employmentData.sector)?.label || employmentData.sector}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Occupation</label>
                <p className="font-medium mt-1">{employmentData.occupation || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Monthly Income</label>
                <p className="font-medium mt-1">
                  KES {employmentData.monthly_income.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Other Income</label>
                <p className="font-medium mt-1">
                  KES {employmentData.other_income.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Total Monthly Income</label>
                <p className="font-medium mt-1">
                  KES {(employmentData.monthly_income + employmentData.other_income).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Payment Frequency</label>
                <p className="font-medium mt-1">
                  {PAYMENT_FREQUENCY_OPTIONS.find(opt => opt.value === employmentData.payment_frequency)?.label || employmentData.payment_frequency}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Years of Service</label>
                <p className="font-medium mt-1">{employmentData.years_of_service || 0}</p>
              </div>
            </div>

            {/* Employer/Business Details */}
            {(employmentData.employer_name || employmentData.business_name) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">
                  {employmentData.employment_type === 'SELF_EMPLOYED' ? 'Business Details' : 'Employer Details'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employmentData.employment_type === 'SELF_EMPLOYED' ? (
                    <>
                      {employmentData.business_name && (
                        <div>
                          <label className="block text-sm text-gray-500">Business Name</label>
                          <p className="font-medium mt-1">{employmentData.business_name}</p>
                        </div>
                      )}
                      {employmentData.business_type && (
                        <div>
                          <label className="block text-sm text-gray-500">Business Type</label>
                          <p className="font-medium mt-1">{employmentData.business_type}</p>
                        </div>
                      )}
                      {employmentData.number_of_employees > 0 && (
                        <div>
                          <label className="block text-sm text-gray-500">Number of Employees</label>
                          <p className="font-medium mt-1">{employmentData.number_of_employees}</p>
                        </div>
                      )}
                      {employmentData.business_start_date && (
                        <div>
                          <label className="block text-sm text-gray-500">Business Start Date</label>
                          <p className="font-medium mt-1">
                            {new Date(employmentData.business_start_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {employmentData.employer_name && (
                        <div>
                          <label className="block text-sm text-gray-500">Employer Name</label>
                          <p className="font-medium mt-1">{employmentData.employer_name}</p>
                        </div>
                      )}
                      {employmentData.job_title && (
                        <div>
                          <label className="block text-sm text-gray-500">Job Title</label>
                          <p className="font-medium mt-1">{employmentData.job_title}</p>
                        </div>
                      )}
                      {employmentData.department && (
                        <div>
                          <label className="block text-sm text-gray-500">Department</label>
                          <p className="font-medium mt-1">{employmentData.department}</p>
                        </div>
                      )}
                      {employmentData.date_employed && (
                        <div>
                          <label className="block text-sm text-gray-500">Date Employed</label>
                          <p className="font-medium mt-1">
                            {new Date(employmentData.date_employed).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Documents</h3>
            <div className="space-y-4">
              {isAdmin() && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Letter
                    </label>
                    {employmentData.employment_letter ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-sm">📄 Document uploaded</span>
                        <a
                          href={employmentData.employment_letter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <FileUpload
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        maxSize={5 * 1024 * 1024} // 5MB
                        onFileSelect={(file) => handleDocumentUpload(file, 'employment_letter')}
                        disabled={uploading}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pay Slips
                    </label>
                    {employmentData.pay_slips ? (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-sm">📄 Document uploaded</span>
                        <a
                          href={employmentData.pay_slips}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ) : (
                      <FileUpload
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5 * 1024 * 1024}
                        onFileSelect={(file) => handleDocumentUpload(file, 'pay_slips')}
                        disabled={uploading}
                      />
                    )}
                  </div>

                  {employmentData.employment_type === 'SELF_EMPLOYED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Permit
                      </label>
                      {employmentData.business_permit ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <span className="text-sm">📄 Document uploaded</span>
                          <a
                            href={employmentData.business_permit}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </a>
                        </div>
                      ) : (
                        <FileUpload
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5 * 1024 * 1024}
                          onFileSelect={(file) => handleDocumentUpload(file, 'business_permit')}
                          disabled={uploading}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {employmentData.notes && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-500">Notes</label>
                  <p className="mt-1 whitespace-pre-wrap">{employmentData.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <EmploymentForm
          initialData={employmentData}
          onSubmit={handleSubmit}
          onCancel={() => setMode('view')}
        />
      )}
    </div>
  )
}

export default EmploymentPage