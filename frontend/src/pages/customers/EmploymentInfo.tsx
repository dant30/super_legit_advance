import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Edit } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import EmploymentInfo from '@/components/customers/EmploymentInfo'

export default function CustomerEmploymentInfo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const { data: employment, isLoading, error, refetch } = useQuery({
    queryKey: ['employment', id],
    queryFn: () => customerAPI.getEmployment(id!),
    enabled: !!id,
  })

  if (isLoading) return <Loading />
  if (error) return <EmptyState title="Error loading employment info" />

  return (
    <>
      <Helmet>
        <title>Employment Information | Super Legit Advance</title>
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
                Employment Information
              </h1>
            </div>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        {/* Employment Details */}
        {employment ? (
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Employment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employment Type</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {employment.employment_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sector</p>
                  <p className="text-gray-900 dark:text-white font-medium">{employment.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Occupation</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {employment.occupation}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Years of Service</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {employment.years_of_service} years
                  </p>
                </div>
              </div>
            </div>

            {employment.employment_type === 'EMPLOYED' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Employer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Employer Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employment.employer_name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Employer Phone</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employment.employer_phone || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Employer Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employment.employer_email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Job Title</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employment.job_title || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Income Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    KES {(employment.monthly_income / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Other Income</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    KES {(employment.other_income / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Monthly Income</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    KES {(employment.total_monthly_income / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payment Frequency</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {employment.payment_frequency}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No employment information"
            description="Add employment information for this customer"
          />
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Edit Employment Information"
          size="lg"
        >
          {employment && (
            <EmploymentInfo
              customerId={id!}
              employment={employment}
              onSuccess={() => {
                refetch()
                setShowModal(false)
              }}
            />
          )}
        </Modal>
      </div>
    </>
  )
}