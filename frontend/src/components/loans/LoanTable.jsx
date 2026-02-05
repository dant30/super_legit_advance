// frontend/src/components/loans/LoanTable.jsx
import React from 'react'
import { Eye, Pencil, CheckCircle, XCircle, Wallet } from 'lucide-react'
import { formatCurrency } from '@api/loans'
import LoanStatusBadge from './LoanStatusBadge'

const LoanTable = ({
  loans = [],
  loading = false,
  onView,
  onEdit,
  onApprove,
  onReject,
  onDisburse,
}) => {
  const safeLoans = Array.isArray(loans) ? loans : (loans?.results || [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!safeLoans || safeLoans.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-500">
        No loans found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeLoans.map((loan) => (
            <tr key={loan.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{loan.loan_number || `#${loan.id}`}</div>
                <div className="text-xs text-gray-500">{loan.loan_type}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-900">
                  {loan.customer?.full_name || `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() || 'Customer'}
                </div>
                <div className="text-xs text-gray-500">{loan.customer?.customer_number || loan.customer?.id_number}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(loan.amount_approved || loan.amount_requested)}
                </div>
                <div className="text-xs text-gray-500">
                  Term {loan.term_months || '--'} months
                </div>
              </td>
              <td className="px-4 py-3">
                <LoanStatusBadge status={loan.status} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {loan.created_at ? new Date(loan.created_at).toLocaleDateString() : '--'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(loan.id)}
                      className="text-primary-600 hover:text-primary-800"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(loan.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onApprove && (
                    <button
                      onClick={() => onApprove(loan.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Approve"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={() => onReject(loan.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  {onDisburse && (
                    <button
                      onClick={() => onDisburse(loan.id)}
                      className="text-amber-600 hover:text-amber-800"
                      title="Disburse"
                    >
                      <Wallet className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LoanTable
