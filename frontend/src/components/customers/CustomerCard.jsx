// frontend/src/components/customers/CustomerCard.jsx
import React from 'react';
import { 
  UserCircleIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const CustomerCard = ({ customer, onClick, showDetails = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'BLACKLISTED': return 'bg-red-100 text-red-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-soft border border-gray-200 hover:shadow-medium transition-shadow duration-200 ${onClick ? 'cursor-pointer hover:border-primary-300' : ''}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12">
              {customer.profile_picture ? (
                <img
                  className="h-12 w-12 rounded-full"
                  src={customer.profile_picture}
                  alt={customer.full_name}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserCircleIcon className="h-10 w-10 text-primary-600" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {customer.full_name || `${customer.first_name} ${customer.last_name}`}
              </h3>
              <p className="text-sm text-gray-500">{customer.customer_number}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
              {customer.status}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(customer.risk_level)}`}>
              {customer.risk_level}
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center text-sm">
            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">{customer.phone_number}</span>
          </div>
          {customer.email && (
            <div className="flex items-center text-sm">
              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700 truncate">{customer.email}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <IdentificationIcon className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">{customer.id_number}</span>
          </div>
          {customer.county && (
            <div className="flex items-center text-sm">
              <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{customer.county}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{customer.total_loans || 0}</p>
              <p className="text-xs text-gray-500">Total Loans</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{customer.active_loans || 0}</p>
              <p className="text-xs text-gray-500">Active Loans</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {customer.outstanding_balance ? `Ksh ${Number(customer.outstanding_balance).toLocaleString()}` : 'Ksh 0'}
              </p>
              <p className="text-xs text-gray-500">Outstanding</p>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        {showDetails && customer.employment && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Employment</h4>
            <div className="text-sm text-gray-600">
              <p>{customer.employment.employer_name}</p>
              <p className="text-gray-500">{customer.employment.job_title}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            Registered: {customer.registration_date ? 
              format(new Date(customer.registration_date), 'MMM dd, yyyy') : 
              format(new Date(customer.created_at), 'MMM dd, yyyy')}
          </div>
          {customer.credit_score && (
            <div className="flex items-center">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              Score: {customer.credit_score}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;