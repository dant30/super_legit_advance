import React from 'react'
import { CheckCircle, Eye, Pencil, Trash2, Wallet, XCircle } from 'lucide-react'
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
  onDelete,
}) => {
  const safeLoans = Array.isArray(loans) ? loans : loans?.results || []

  const canDeleteLoan = (loan) => ['DRAFT', 'REJECTED', 'CANCELLED'].includes(String(loan?.status || '').toUpperCase())

  const getCustomerName = (loan) =>
    loan.customer_name ||
    loan.customer_details?.full_name ||
    loan.customer?.full_name ||
    `${loan.customer?.first_name || ''} ${loan.customer?.last_name || ''}`.trim() ||
    'Customer'

  const getCustomerNumber = (loan) =>
    loan.customer_number ||
    loan.customer_details?.customer_number ||
    loan.customer?.customer_number ||
    loan.customer?.id_number ||
    '--'

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!safeLoans || safeLoans.length === 0) {
    return <div className="py-10 text-center text-sm text-gray-500">No loans found.</div>
  }

  return (
    <div>
      <div className="space-y-3 md:hidden">
        {safeLoans.map((loan) => (
          <div key={`loan-mobile-${loan.id}`} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{loan.loan_number || `#${loan.id}`}</p>
                <p className="truncate text-xs text-gray-500">{loan.loan_type}</p>
              </div>
              <LoanStatusBadge status={loan.status} />
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-600">
              <p className="truncate">
                Customer: <span className="font-medium text-gray-800">{getCustomerName(loan)}</span>
              </p>
              <p className="truncate text-gray-500">{getCustomerNumber(loan)}</p>
              <p>
                Amount:{' '}
                <span className="font-semibold text-gray-900">{formatCurrency(loan.amount_approved || loan.amount_requested)}</span>
              </p>
              <p>
                Created:{' '}
                <span className="text-gray-700">
                  {loan.created_at ? new Date(loan.created_at).toLocaleDateString() : '--'}
                </span>
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {onView ? (
                <button onClick={() => onView(loan.id)} className="text-primary-600 hover:text-primary-800" title="View">
                  <Eye className="h-4 w-4" />
                </button>
              ) : null}
              {onEdit ? (
                <button onClick={() => onEdit(loan.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
              ) : null}
              {onApprove ? (
                <button onClick={() => onApprove(loan.id)} className="text-green-600 hover:text-green-800" title="Approve">
                  <CheckCircle className="h-4 w-4" />
                </button>
              ) : null}
              {onReject ? (
                <button onClick={() => onReject(loan.id)} className="text-red-600 hover:text-red-800" title="Reject">
                  <XCircle className="h-4 w-4" />
                </button>
              ) : null}
              {onDisburse ? (
                <button onClick={() => onDisburse(loan.id)} className="text-amber-600 hover:text-amber-800" title="Disburse">
                  <Wallet className="h-4 w-4" />
                </button>
              ) : null}
              {onDelete && canDeleteLoan(loan) ? (
                <button onClick={() => onDelete(loan.id)} className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Loan</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {safeLoans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{loan.loan_number || `#${loan.id}`}</div>
                  <div className="text-xs text-gray-500">{loan.loan_type}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{getCustomerName(loan)}</div>
                  <div className="text-xs text-gray-500">{getCustomerNumber(loan)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(loan.amount_approved || loan.amount_requested)}
                  </div>
                  <div className="text-xs text-gray-500">Term {loan.term_months || '--'} months</div>
                </td>
                <td className="px-4 py-3">
                  <LoanStatusBadge status={loan.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {loan.created_at ? new Date(loan.created_at).toLocaleDateString() : '--'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {onView ? (
                      <button onClick={() => onView(loan.id)} className="text-primary-600 hover:text-primary-800" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onEdit ? (
                      <button onClick={() => onEdit(loan.id)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onApprove ? (
                      <button onClick={() => onApprove(loan.id)} className="text-green-600 hover:text-green-800" title="Approve">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onReject ? (
                      <button onClick={() => onReject(loan.id)} className="text-red-600 hover:text-red-800" title="Reject">
                        <XCircle className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onDisburse ? (
                      <button onClick={() => onDisburse(loan.id)} className="text-amber-600 hover:text-amber-800" title="Disburse">
                        <Wallet className="h-4 w-4" />
                      </button>
                    ) : null}
                    {onDelete && canDeleteLoan(loan) ? (
                      <button onClick={() => onDelete(loan.id)} className="text-red-600 hover:text-red-800" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LoanTable
