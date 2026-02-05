// frontend/src/components/customers/CustomerProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { 
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PencilIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import GuarantorsList from './GuarantorsList';
import EmploymentForm from './EmploymentForm';
import RiskIndicator from './RiskIndicator';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedCustomer,
    selectedCustomerLoading,
    selectedCustomerError,
    fetchCustomer,
    blacklistCustomer,
    activateCustomer,
    getEmployment,
    getGuarantors,
    employment,
    guarantors
  } = useCustomerContext();
  
  const { hasPermission, isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
      getEmployment(id);
      getGuarantors(id);
    }
  }, [id]);

  const handleBlacklist = async () => {
    if (!blacklistReason.trim()) {
      alert('Please provide a reason for blacklisting');
      return;
    }

    setIsLoading(true);
    try {
      await blacklistCustomer(id, blacklistReason);
      setShowBlacklistDialog(false);
      setBlacklistReason('');
    } catch (error) {
      console.error('Error blacklisting customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      await activateCustomer(id);
    } catch (error) {
      console.error('Error activating customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/customers/${id}/edit`);
  };

  if (selectedCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (selectedCustomerError || !selectedCustomer) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
          <p className="mt-1 text-sm text-gray-500">{selectedCustomerError || 'The customer you are looking for does not exist.'}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/customers')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const customer = selectedCustomer;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'BLACKLISTED': return 'bg-red-100 text-red-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserCircleIcon },
    { id: 'employment', name: 'Employment', icon: BuildingOfficeIcon },
    { id: 'guarantors', name: 'Guarantors', icon: DocumentTextIcon },
    { id: 'loans', name: 'Loans', icon: CreditCardIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/customers')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16">
                  {customer.profile_picture ? (
                    <img
                      className="h-16 w-16 rounded-full"
                      src={customer.profile_picture}
                      alt={customer.full_name}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <UserCircleIcon className="h-12 w-12 text-primary-600" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {customer.full_name || `${customer.first_name} ${customer.last_name}`}
                  </h1>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-sm text-gray-500">{customer.customer_number}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status}
                    </span>
                    <RiskIndicator riskLevel={customer.risk_level} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              {(hasPermission('can_manage_customers') || isAdmin()) && (
                <>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  
                  {customer.status === 'BLACKLISTED' ? (
                    <button
                      onClick={handleActivate}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                      )}
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowBlacklistDialog(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      Blacklist
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="inline-block h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'overview' && (
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.full_name || `${customer.first_name} ${customer.last_name}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <IdentificationIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {customer.id_number} ({customer.id_type})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {format(new Date(customer.date_of_birth), 'MMMM dd, yyyy')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender & Marital Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.gender === 'M' ? 'Male' : 'Female'} • {customer.marital_status}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {customer.phone_number}
                    </dd>
                  </div>
                  {customer.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {customer.email}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {customer.physical_address}
                    </dd>
                    <dd className="mt-1 text-sm text-gray-600">
                      {customer.county}, {customer.sub_county}, Ward {customer.ward}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Financial Information */}
            {customer.loan_statistics && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {customer.loan_statistics.total_loans || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Loans</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {customer.loan_statistics.active_loans || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active Loans</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      Ksh {Number(customer.loan_statistics.total_borrowed || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Borrowed</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-gray-900">
                      Ksh {Number(customer.loan_statistics.total_outstanding || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Outstanding</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Credit Score</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {customer.credit_score || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(customer.registration_date || customer.created_at), 'MMMM dd, yyyy')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.updated_at ? format(new Date(customer.updated_at), 'MMMM dd, yyyy HH:mm') : 'N/A'}
                  </dd>
                </div>
              </div>
              {customer.notes && (
                <div className="mt-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {customer.notes}
                  </dd>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="px-6 py-5">
            <EmploymentForm customerId={id} />
          </div>
        )}

        {activeTab === 'guarantors' && (
          <div className="px-6 py-5">
            <GuarantorsList customerId={id} />
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="px-6 py-5">
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Loan History</h3>
              <p className="mt-1 text-sm text-gray-500">Customer's loan history will be displayed here.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/loans?customer=${id}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  View All Loans
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="px-6 py-5">
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Documents</h3>
              <p className="mt-1 text-sm text-gray-500">Customer documents will be displayed here.</p>
              <div className="mt-6">
                <button
                  onClick={() => {}}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Blacklist Dialog */}
      {showBlacklistDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Blacklist Customer</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to blacklist {customer.first_name} {customer.last_name}? 
                This action cannot be undone.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Blacklisting *
                </label>
                <textarea
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Provide the reason for blacklisting this customer..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBlacklistDialog(false);
                  setBlacklistReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlacklist}
                disabled={isLoading || !blacklistReason.trim()}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isLoading || !blacklistReason.trim() ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isLoading ? 'Processing...' : 'Confirm Blacklist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;