// frontend/src/pages/customers/Guarantors.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { useAuth } from '@/hooks/useAuth'
import { GuarantorsList } from '@/components/customers/GuarantorsList'
import { GuarantorForm } from '@/components/customers/GuarantorForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/shared/Loading'
import { Error } from '@/components/shared/Error'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { useToast } from '@/components/ui/Toast/useToast'
import type { Guarantor, GuarantorCreateData } from '@/types/customers'

const GuarantorsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const {
    guarantors,
    guarantorsLoading,
    guarantorsError,
    selectedGuarantor,
    fetchGuarantors,
    createGuarantor,
    updateGuarantor,
    deleteGuarantor,
    verifyGuarantor,
    clearGuarantorsError
  } = useCustomers()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedGuarantorId, setSelectedGuarantorId] = useState<string | null>(null)
  const [verificationAction, setVerificationAction] = useState<'verify' | 'reject'>('verify')
  const [verificationNotes, setVerificationNotes] = useState('')

  useEffect(() => {
    if (id) {
      loadGuarantors()
    }
  }, [id])

  const loadGuarantors = async () => {
    try {
      await fetchGuarantors(id!)
    } catch (error) {
      console.error('Failed to load guarantors:', error)
    }
  }

  const handleAddGuarantor = async (data: GuarantorCreateData) => {
    if (!id) return

    try {
      await createGuarantor({ customerId: id, data })
      toast({
        title: 'Success',
        description: 'Guarantor added successfully'
      })
      setShowAddModal(false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add guarantor',
        variant: 'destructive'
      })
    }
  }

  const handleEditGuarantor = async (guarantorId: string, data: Partial<GuarantorCreateData>) => {
    try {
      await updateGuarantor({ id: guarantorId, data })
      toast({
        title: 'Success',
        description: 'Guarantor updated successfully'
      })
      setShowEditModal(false)
      setSelectedGuarantorId(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update guarantor',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteGuarantor = async (guarantorId: string) => {
    if (!window.confirm('Are you sure you want to delete this guarantor?')) return

    try {
      await deleteGuarantor(guarantorId)
      toast({
        title: 'Success',
        description: 'Guarantor deleted successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete guarantor',
        variant: 'destructive'
      })
    }
  }

  const handleVerifySubmit = async () => {
    if (!selectedGuarantorId) return

    try {
      await verifyGuarantor({
        id: selectedGuarantorId,
        action: verificationAction,
        notes: verificationNotes
      })
      
      toast({
        title: 'Success',
        description: `Guarantor ${verificationAction === 'verify' ? 'verified' : 'rejected'} successfully`
      })
      
      setShowVerifyModal(false)
      setSelectedGuarantorId(null)
      setVerificationAction('verify')
      setVerificationNotes('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process verification',
        variant: 'destructive'
      })
    }
  }

  const handleOpenVerifyModal = (guarantorId: string, action: 'verify' | 'reject') => {
    setSelectedGuarantorId(guarantorId)
    setVerificationAction(action)
    setShowVerifyModal(true)
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: 'Customer Details', href: `/customers/${id}` },
    { label: 'Guarantors', href: '#' }
  ]

  if (guarantorsLoading && !guarantors.length) {
    return <Loading message="Loading guarantors..." />
  }

  if (guarantorsError) {
    return (
      <Error
        message={guarantorsError}
        onRetry={loadGuarantors}
        onDismiss={clearGuarantorsError}
        actionText="Back to Customer"
        onAction={() => navigate(`/customers/${id}`)}
      />
    )
  }

  const activeGuarantors = guarantors.filter(g => g.is_active)
  const inactiveGuarantors = guarantors.filter(g => !g.is_active)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guarantors</h1>
            <p className="text-gray-600 mt-2">
              Manage customer's guarantors ({activeGuarantors.length} active)
            </p>
          </div>
          {isAdmin() && activeGuarantors.length < 3 && (
            <Button onClick={() => setShowAddModal(true)}>
              + Add Guarantor
            </Button>
          )}
        </div>
      </div>

      {/* Active Guarantors */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Active Guarantors</h2>
            <span className="text-sm text-gray-500">
              {activeGuarantors.length} of 3 maximum
            </span>
          </div>
          
          {activeGuarantors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No active guarantors found</p>
              {isAdmin() && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddModal(true)}
                >
                  Add First Guarantor
                </Button>
              )}
            </div>
          ) : (
            <GuarantorsList
              guarantors={activeGuarantors}
              onEdit={(guarantor) => {
                setSelectedGuarantorId(guarantor.id)
                setShowEditModal(true)
              }}
              onDelete={handleDeleteGuarantor}
              onVerify={(guarantor) => handleOpenVerifyModal(guarantor.id, 'verify')}
              onReject={(guarantor) => handleOpenVerifyModal(guarantor.id, 'reject')}
            />
          )}
        </div>
      </Card>

      {/* Inactive Guarantors */}
      {inactiveGuarantors.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Inactive Guarantors</h2>
            <GuarantorsList
              guarantors={inactiveGuarantors}
              onEdit={(guarantor) => {
                setSelectedGuarantorId(guarantor.id)
                setShowEditModal(true)
              }}
              onDelete={handleDeleteGuarantor}
              showActions={false}
            />
          </div>
        </Card>
      )}

      {/* Add Guarantor Modal */}
      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Guarantor"
        size="lg"
      >
        <GuarantorForm
          mode="create"
          onSubmit={handleAddGuarantor}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Guarantor Modal */}
      <Modal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title="Edit Guarantor"
        size="lg"
      >
        {selectedGuarantorId && selectedGuarantor && (
          <GuarantorForm
            mode="edit"
            initialData={selectedGuarantor}
            onSubmit={(data) => handleEditGuarantor(selectedGuarantorId, data)}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedGuarantorId(null)
            }}
          />
        )}
      </Modal>

      {/* Verification Modal */}
      <Modal
        open={showVerifyModal}
        onOpenChange={setShowVerifyModal}
        title={`${verificationAction === 'verify' ? 'Verify' : 'Reject'} Guarantor`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder={`Enter notes for ${verificationAction === 'verify' ? 'verification' : 'rejection'}...`}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowVerifyModal(false)
                setVerificationNotes('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant={verificationAction === 'verify' ? 'default' : 'destructive'}
              onClick={handleVerifySubmit}
            >
              {verificationAction === 'verify' ? 'Verify' : 'Reject'} Guarantor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GuarantorsPage