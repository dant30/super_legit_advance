import React, { useEffect, useState } from 'react'
import { useCustomerContext } from '@contexts/CustomerContext'
import { useAuth } from '@features/auth/hooks/useAuth'
import { useToast } from '@contexts/ToastContext'
import {
  BanknotesIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  UserCircleIcon,
  UserPlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import GuarantorForm from './GuarantorForm'

const statusClass = (status) => {
  switch (status) {
    case 'VERIFIED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'PENDING':
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

const GuarantorsList = ({
  customerId,
  guarantors: guarantorsProp,
  loading: loadingProp,
  onRefresh,
}) => {
  const {
    guarantors,
    guarantorsLoading,
    guarantorsError,
    getGuarantors,
    deleteGuarantor,
    verifyGuarantor,
  } = useCustomerContext()
  const { hasPermission, isAdmin } = useAuth()
  const { addToast } = useToast()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGuarantor, setEditingGuarantor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [verifyTarget, setVerifyTarget] = useState(null)
  const [verificationAction, setVerificationAction] = useState('verify')
  const [verificationNotes, setVerificationNotes] = useState('')

  const canManage = hasPermission('can_manage_customers') || isAdmin()
  const resolvedGuarantors = guarantorsProp ?? guarantors
  const resolvedLoading = loadingProp ?? guarantorsLoading

  const refresh = async () => {
    if (typeof onRefresh === 'function') {
      await onRefresh()
      return
    }
    if (customerId) {
      await getGuarantors(customerId)
    }
  }

  useEffect(() => {
    if (!guarantorsProp && customerId) {
      getGuarantors(customerId)
    }
  }, [customerId, guarantorsProp, getGuarantors])

  const handleDelete = async () => {
    try {
      const result = await deleteGuarantor(deleteTarget)
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove guarantor')
      }
      setDeleteTarget(null)
      addToast('Guarantor removed successfully', 'success')
      await refresh()
    } catch (error) {
      addToast(error.message || 'Failed to remove guarantor', 'error')
    }
  }

  const handleVerify = async () => {
    try {
      const result = await verifyGuarantor(verifyTarget, verificationAction, verificationNotes)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update guarantor verification')
      }
      setVerifyTarget(null)
      setVerificationAction('verify')
      setVerificationNotes('')
      addToast(
        verificationAction === 'verify' ? 'Guarantor verified successfully' : 'Guarantor rejected successfully',
        'success'
      )
      await refresh()
    } catch (error) {
      addToast(error.message || 'Failed to update guarantor verification', 'error')
    }
  }

  if (showAddForm || editingGuarantor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {editingGuarantor ? 'Edit Guarantor' : 'Add Guarantor'}
          </h3>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(false)
              setEditingGuarantor(null)
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
        <GuarantorForm
          customerId={customerId}
          guarantorId={editingGuarantor?.id}
          initialData={editingGuarantor}
          onSuccess={async () => {
            setShowAddForm(false)
            setEditingGuarantor(null)
            await refresh()
          }}
          onCancel={() => {
            setShowAddForm(false)
            setEditingGuarantor(null)
          }}
        />
      </div>
    )
  }

  if (resolvedLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  if (guarantorsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center">
          <XCircleIcon className="mr-2 h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{guarantorsError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Guarantors</h3>
          <p className="text-sm text-gray-500">
            {resolvedGuarantors?.length || 0} guarantor(s) linked to this customer
          </p>
        </div>
        {canManage && (resolvedGuarantors?.length || 0) < 3 && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add Guarantor
          </button>
        )}
      </div>

      {!resolvedGuarantors || resolvedGuarantors.length === 0 ? (
        <div className="py-12 text-center">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No guarantors</h3>
          <p className="mt-1 text-sm text-gray-500">Add a guarantor to strengthen this borrower profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resolvedGuarantors.map((guarantor) => (
            <div key={guarantor.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {guarantor.full_name || `${guarantor.first_name} ${guarantor.last_name}`}
                    </h4>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(guarantor.verification_status)}`}>
                      {guarantor.verification_status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <PhoneIcon className="mr-1 h-4 w-4" />
                      {guarantor.phone_number}
                    </span>
                    <span>{guarantor.relationship}</span>
                    <span>{guarantor.id_number}</span>
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-wrap items-center gap-2">
                    {guarantor.verification_status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyTarget(guarantor.id)
                          setVerificationAction('verify')
                          setVerificationNotes('')
                        }}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingGuarantor(guarantor)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit guarantor"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(guarantor.id)}
                      className="text-red-400 hover:text-red-600"
                      title="Remove guarantor"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Occupation</p>
                  <p className="mt-1 text-sm text-gray-900">{guarantor.occupation || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Employer</p>
                  <p className="mt-1 text-sm text-gray-900">{guarantor.employer || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Monthly Income</p>
                  <p className="mt-1 flex items-center text-sm text-gray-900">
                    <BanknotesIcon className="mr-1 h-4 w-4 text-gray-400" />
                    {guarantor.monthly_income ? `KES ${Number(guarantor.monthly_income).toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
              </div>

              {guarantor.notes && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Notes</p>
                  <p className="mt-1 text-sm text-gray-700">{guarantor.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Remove Guarantor</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">Remove this guarantor from the borrower profile?</p>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {verifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Verify Guarantor</h3>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Action</p>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input type="radio" name="verification_action" value="verify" checked={verificationAction === 'verify'} onChange={(event) => setVerificationAction(event.target.value)} className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Verify</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="verification_action" value="reject" checked={verificationAction === 'reject'} onChange={(event) => setVerificationAction(event.target.value)} className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Reject</span>
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="verification-notes" className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  id="verification-notes"
                  rows="3"
                  value={verificationNotes}
                  onChange={(event) => setVerificationNotes(event.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add verification notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setVerifyTarget(null)
                  setVerificationAction('verify')
                  setVerificationNotes('')
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="button" onClick={handleVerify} className="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuarantorsList
