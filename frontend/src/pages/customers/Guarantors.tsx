import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/Badge'
import GuarantorManager from '@/components/customers/GuarantorManager'

export default function CustomerGuarantors() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showManager, setShowManager] = useState(false)
  const [selectedGuarantor, setSelectedGuarantor] = useState<any>(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyAction, setVerifyAction] = useState<'verify' | 'reject'>('verify')
  const [verifyNotes, setVerifyNotes] = useState('')

  const { data: guarantors, isLoading, refetch } = useQuery({
    queryKey: ['guarantors', id],
    queryFn: () => customerAPI.getGuarantors(id!),
    enabled: !!id,
  })

  const handleDeleteGuarantor = async (guarantorId: string) => {
    try {
      await customerAPI.deleteGuarantor(guarantorId)
      toast.success('Guarantor deleted successfully')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete guarantor')
    }
  }

  const handleVerifyGuarantor = async () => {
    if (!selectedGuarantor) return

    try {
      await customerAPI.verifyGuarantor(selectedGuarantor.id, verifyAction, verifyNotes)
      toast.success(`Guarantor ${verifyAction}ed successfully`)
      setShowVerifyModal(false)
      setSelectedGuarantor(null)
      setVerifyNotes('')
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to verify guarantor')
    }
  }

  if (isLoading) return <Loading />

  return (
    <>
      <Helmet>
        <title>Guarantors | Super Legit Advance</title>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guarantors</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage customer guarantors
              </p>
            </div>
          </div>
          <Button onClick={() => setShowManager(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Guarantor
          </Button>
        </div>

        {/* Guarantors List */}
        {guarantors && guarantors.length > 0 ? (
          <div className="grid gap-4">
            {guarantors.map((guarantor: any) => (
              <Card key={guarantor.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {guarantor.full_name}
                      </h3>
                      <Badge
                        variant={
                          guarantor.verification_status === 'VERIFIED'
                            ? 'success'
                            : guarantor.verification_status === 'REJECTED'
                              ? 'error'
                              : 'warning'
                        }
                      >
                        {guarantor.verification_status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Type</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {guarantor.guarantor_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Relationship</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {guarantor.relationship}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {guarantor.phone_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Occupation</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {guarantor.occupation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Income</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          KES {(guarantor.monthly_income / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedGuarantor(guarantor)
                        setVerifyAction('verify')
                        setShowVerifyModal(true)
                      }}
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded text-green-600"
                      title="Verify"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGuarantor(guarantor)
                        setVerifyAction('reject')
                        setShowVerifyModal(true)
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                      title="Reject"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuarantor(guarantor.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No guarantors"
            description="Add a guarantor for this customer"
          />
        )}

        {/* Add/Edit Guarantor Modal */}
        <Modal
          isOpen={showManager}
          onClose={() => setShowManager(false)}
          title="Add Guarantor"
          size="lg"
        >
          <GuarantorManager customerId={id!} onClose={() => setShowManager(false)} onSuccess={() => refetch()} />
        </Modal>

        {/* Verify/Reject Modal */}
        <Modal
          isOpen={showVerifyModal}
          onClose={() => {
            setShowVerifyModal(false)
            setSelectedGuarantor(null)
            setVerifyNotes('')
          }}
          title={`${verifyAction === 'verify' ? 'Verify' : 'Reject'} Guarantor`}
        >
          {selectedGuarantor && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedGuarantor.full_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Notes
                </label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowVerifyModal(false)
                    setSelectedGuarantor(null)
                    setVerifyNotes('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={verifyAction === 'verify' ? 'primary' : 'danger'}
                  className="flex-1"
                  onClick={handleVerifyGuarantor}
                >
                  {verifyAction === 'verify' ? 'Verify' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  )
}