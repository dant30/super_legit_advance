// frontend/src/components/customers/GuarantorsList.jsx
import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import {
  UserCircleIcon,
  PhoneIcon,
  BriefcaseIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import GuarantorForm from './GuarantorForm';

const GuarantorsList = ({ customerId }) => {
  const { 
    guarantors,
    guarantorsLoading,
    guarantorsError,
    getGuarantors,
    deleteGuarantor,
    verifyGuarantor
  } = useCustomerContext();
  
  const { hasPermission, isAdmin } = useAuth();
  const { addToast } = useToast();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuarantor, setEditingGuarantor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(null);

  useEffect(() => {
    if (customerId) {
      getGuarantors(customerId);
    }
  }, [customerId]);

  const handleDelete = async (guarantorId) => {
    try {
      await deleteGuarantor(guarantorId);
      setShowDeleteConfirm(null);
      addToast('Guarantor removed successfully', 'success');
    } catch (error) {
      console.error('Error deleting guarantor:', error);
      addToast('Failed to remove guarantor', 'error');
    }
  };

  const handleVerify = async (guarantorId, action, notes) => {
    try {
      await verifyGuarantor(guarantorId, action, notes);
      setShowVerifyDialog(null);
      addToast(`Guarantor ${action === 'verify' ? 'verified' : 'rejected'} successfully`, 'success');
    } catch (error) {
      console.error('Error verifying guarantor:', error);
      addToast('Failed to verify guarantor', 'error');
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'PENDING': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'REJECTED': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  if (showAddForm || editingGuarantor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {editingGuarantor ? 'Edit Guarantor' : 'Add New Guarantor'}
          </h3>
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingGuarantor(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
        <GuarantorForm
          customerId={customerId}
          guarantorId={editingGuarantor?.id}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingGuarantor(null);
            getGuarantors(customerId);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingGuarantor(null);
          }}
        />
      </div>
    );
  }

  if (guarantorsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (guarantorsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{guarantorsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Guarantors</h3>
          <p className="text-sm text-gray-500">
            {guarantors?.length || 0} guarantor(s) for this customer
          </p>
        </div>
        {(hasPermission('can_manage_customers') || isAdmin()) && guarantors?.length < 3 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add Guarantor
          </button>
        )}
      </div>

      {(!guarantors || guarantors.length === 0) ? (
        <div className="text-center py-12">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No guarantors</h3>
          <p className="mt-1 text-sm text-gray-500">
            This customer doesn't have any guarantors yet.
          </p>
          {(hasPermission('can_manage_customers') || isAdmin()) && (
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add First Guarantor
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {guarantors.map((guarantor) => (
            <div
              key={guarantor.id}
              className="bg-white rounded-lg shadow-soft border border-gray-200"
            >
              <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12">
                      {guarantor.profile_picture ? (
                        <img
                          className="h-12 w-12 rounded-full"
                          src={guarantor.profile_picture}
                          alt={guarantor.full_name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserCircleIcon className="h-10 w-10 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">
                          {guarantor.full_name || `${guarantor.first_name} ${guarantor.last_name}`}
                        </h4>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getVerificationStatusColor(guarantor.verification_status)}`}>
                          {guarantor.verification_status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4">
                        <span className="text-sm text-gray-500 flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {guarantor.phone_number}
                        </span>
                        <span className="text-sm text-gray-500">
                          Relationship: {guarantor.relationship}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {(hasPermission('can_manage_customers') || isAdmin()) && (
                    <div className="flex space-x-2">
                      {guarantor.verification_status === 'PENDING' && (
                        <button
                          onClick={() => setShowVerifyDialog(guarantor.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => setEditingGuarantor(guarantor)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(guarantor.id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Guarantor Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Employment</h5>
                    <div className="mt-1 flex items-center">
                      <BriefcaseIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {guarantor.employer_name || 'Not specified'}
                      </span>
                    </div>
                    {guarantor.job_title && (
                      <p className="text-xs text-gray-500 mt-1">{guarantor.job_title}</p>
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Income</h5>
                    <div className="mt-1 flex items-center">
                      <BanknotesIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {guarantor.monthly_income ? `Ksh ${Number(guarantor.monthly_income).toLocaleString()}` : 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Guarantee</h5>
                    <div className="mt-1">
                      {guarantor.guarantee_amount && (
                        <p className="text-sm text-gray-900">
                          Ksh {Number(guarantor.guarantee_amount).toLocaleString()}
                        </p>
                      )}
                      {guarantor.guarantee_percentage && (
                        <p className="text-xs text-gray-500">
                          ({guarantor.guarantee_percentage}% of loan)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">ID Number</h5>
                      <p className="text-sm text-gray-900">{guarantor.id_number}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Risk Level</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        guarantor.risk_level === 'LOW' ? 'bg-green-100 text-green-800' :
                        guarantor.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {guarantor.risk_level}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Credit Score</h5>
                      <p className="text-sm text-gray-900">{guarantor.credit_score || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Status</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        guarantor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {guarantor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {guarantor.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-xs font-medium text-gray-500">Notes</h5>
                    <p className="mt-1 text-sm text-gray-700">{guarantor.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Remove Guarantor</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to remove this guarantor? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Dialog */}
      {showVerifyDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Verify Guarantor</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Action
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="verification_action"
                        value="verify"
                        defaultChecked
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Approve</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="verification_action"
                        value="reject"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Reject</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    id="verification_notes"
                    rows="3"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Add notes about the verification..."
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowVerifyDialog(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const action = document.querySelector('input[name="verification_action"]:checked')?.value;
                  const notes = document.getElementById('verification_notes')?.value || '';
                  handleVerify(showVerifyDialog, action, notes);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuarantorsList;