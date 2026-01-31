// frontend/src/components/customers/CustomerProfile.tsx
import React from 'react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from './StatusBadge'
import { RiskIndicator } from './RiskIndicator'
import { formatPhoneNumber, calculateAge } from '@/types/customers'
import type { CustomerDetailResponse } from '@/types/customers'

export interface CustomerProfileProps {
  customer: CustomerDetailResponse
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer }) => {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">
                {customer.first_name[0]}{customer.last_name[0]}
              </span>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold">{customer.full_name}</h2>
              <p className="text-gray-600">Customer #{customer.customer_number}</p>
              <div className="flex items-center space-x-3 mt-2">
                <StatusBadge status={customer.status} />
                <RiskIndicator riskLevel={customer.risk_level} />
                <span className="text-sm text-gray-500">
                  Credit Score: {customer.credit_score}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact & Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Phone Number</label>
              <div className="font-medium">{formatPhoneNumber(customer.phone_number)}</div>
            </div>
            {customer.email && (
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <div className="font-medium">{customer.email}</div>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">Physical Address</label>
              <div className="font-medium">{customer.physical_address}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">County</label>
                <div className="font-medium">{customer.county}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Sub-County</label>
                <div className="font-medium">{customer.sub_county}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <div className="font-medium">
                  {customer.gender === 'M' ? 'Male' : customer.gender === 'F' ? 'Female' : 'Other'}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Age</label>
                <div className="font-medium">{customer.age} years</div>
              </div>
            </div>
            {customer.marital_status && (
              <div>
                <label className="text-sm text-gray-500">Marital Status</label>
                <div className="font-medium">{customer.marital_status}</div>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">ID Number</label>
              <div className="font-medium">{customer.id_number} ({customer.id_type})</div>
            </div>
            {customer.id_expiry_date && (
              <div>
                <label className="text-sm text-gray-500">ID Expiry Date</label>
                <div className="font-medium">{new Date(customer.id_expiry_date).toLocaleDateString()}</div>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">Registration Date</label>
              <div className="font-medium">{new Date(customer.registration_date).toLocaleDateString()}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bank Info & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(customer.bank_name || customer.bank_account_number) && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Bank Information</h3>
            <div className="space-y-3">
              {customer.bank_name && (
                <div>
                  <label className="text-sm text-gray-500">Bank Name</label>
                  <div className="font-medium">{customer.bank_name}</div>
                </div>
              )}
              {customer.bank_account_number && (
                <div>
                  <label className="text-sm text-gray-500">Account Number</label>
                  <div className="font-medium">{customer.bank_account_number}</div>
                </div>
              )}
              {customer.bank_branch && (
                <div>
                  <label className="text-sm text-gray-500">Bank Branch</label>
                  <div className="font-medium">{customer.bank_branch}</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {(customer.notes || customer.referred_by) && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>
            <div className="space-y-3">
              {customer.notes && (
                <div>
                  <label className="text-sm text-gray-500">Notes</label>
                  <div className="font-medium whitespace-pre-wrap">{customer.notes}</div>
                </div>
              )}
              {customer.referred_by && (
                <div>
                  <label className="text-sm text-gray-500">Referred By</label>
                  <div className="font-medium">{customer.referred_by}</div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Loan Statistics */}
      {customer.loan_statistics && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Loan Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {customer.loan_statistics.total_loans}
              </div>
              <div className="text-sm text-blue-600">Total Loans</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {customer.loan_statistics.active_loans}
              </div>
              <div className="text-sm text-green-600">Active Loans</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                KES {customer.loan_statistics.total_borrowed.toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">Total Borrowed</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                KES {customer.loan_statistics.total_outstanding.toLocaleString()}
              </div>
              <div className="text-sm text-orange-600">Outstanding</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-700">
                KES {customer.loan_statistics.total_repaid.toLocaleString()}
              </div>
              <div className="text-sm text-teal-600">Total Repaid</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// export default CustomerProfile