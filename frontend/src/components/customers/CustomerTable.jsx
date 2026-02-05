// frontend/src/components/customers/CustomerTable.jsx
import React, { useState, useEffect } from 'react';
import { useCustomerContext } from '../../contexts/CustomerContext';
import { format } from 'date-fns';
import { 
  PencilIcon, 
  EyeIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserCircleIcon,
  PhoneIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const CustomerTable = ({ 
  onView, 
  onEdit, 
  onDelete, 
  onSelect,
  selectedIds = [],
  showActions = true 
}) => {
  const { 
    customers = [], 
    customersLoading, 
    customersError,
    fetchCustomers 
  } = useCustomerContext();

  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    if (customers.length === 0 && !customersLoading) {
      fetchCustomers();
    }
  }, [customers.length, customersLoading, fetchCustomers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  if (customersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (customersError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">{customersError}</p>
        </div>
        <button
          onClick={() => fetchCustomers()}
          className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new customer.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onSelect && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  onChange={(e) => {
                    // Handle select all
                  }}
                />
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                onClick={() => handleSort('customer_number')}
                className="flex items-center hover:text-gray-700"
              >
                Customer #
                {sortField === 'customer_number' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                onClick={() => handleSort('last_name')}
                className="flex items-center hover:text-gray-700"
              >
                Name
                {sortField === 'last_name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Level
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center hover:text-gray-700"
              >
                Registered
                {sortField === 'created_at' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            {showActions && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr 
              key={customer.id} 
              className={`hover:bg-gray-50 ${selectedIds.includes(customer.id) ? 'bg-primary-50' : ''}`}
            >
              {onSelect && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(customer.id)}
                    onChange={() => onSelect(customer.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {customer.customer_number}
                </div>
                <div className="text-sm text-gray-500">
                  ID: {customer.id_number}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {customer.profile_picture ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={customer.profile_picture}
                        alt={customer.full_name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {customer.first_name?.[0]}{customer.last_name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.full_name || `${customer.first_name} ${customer.last_name}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 flex items-center">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                  {customer.phone_number}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(customer.risk_level)}`}>
                  {customer.risk_level}
                </span>
                {customer.credit_score && (
                  <div className="text-xs text-gray-500 mt-1">
                    Score: {customer.credit_score}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {customer.registration_date ? 
                  format(new Date(customer.registration_date), 'MMM dd, yyyy') : 
                  format(new Date(customer.created_at), 'MMM dd, yyyy')}
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(customer.id)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(customer.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(customer.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
