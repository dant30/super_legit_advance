// frontend/src/components/customers/GuarantorsList.tsx
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatPhoneNumber } from '@/types/customers'
import type { Guarantor } from '@/types/customers'

export interface GuarantorsListProps {
  guarantors: Guarantor[]
  onEdit?: (guarantor: Guarantor) => void
  onDelete?: (guarantor: Guarantor) => void
  onVerify?: (guarantor: Guarantor) => void
  onReject?: (guarantor: Guarantor) => void
  showActions?: boolean
}

export const GuarantorsList: React.FC<GuarantorsListProps> = ({
  guarantors,
  onEdit,
  onDelete,
  onVerify,
  onReject,
  showActions = true
}) => {
  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success'
      case 'REJECTED': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      {guarantors.map((guarantor) => (
        <div key={guarantor.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-medium text-gray-700">
                    {guarantor.first_name[0]}{guarantor.last_name[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{guarantor.full_name}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-500">
                      {formatPhoneNumber(guarantor.phone_number)}
                    </span>
                    <Badge variant={getVerificationColor(guarantor.verification_status)}>
                      {guarantor.verification_status}
                    </Badge>
                    {!guarantor.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="text-xs text-gray-500">Relationship</label>
                  <p className="text-sm font-medium">{guarantor.relationship}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">ID Number</label>
                  <p className="text-sm font-medium">{guarantor.id_number}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Monthly Income</label>
                  <p className="text-sm font-medium">
                    KES {guarantor.monthly_income.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Occupation</label>
                  <p className="text-sm font-medium">{guarantor.occupation}</p>
                </div>
              </div>

              {guarantor.verification_notes && (
                <div className="mt-3 pt-3 border-t">
                  <label className="text-xs text-gray-500">Verification Notes</label>
                  <p className="text-sm text-gray-700 mt-1">{guarantor.verification_notes}</p>
                </div>
              )}
            </div>

            {showActions && onEdit && onDelete && (
              <div className="flex space-x-2">
                {guarantor.is_active && (
                  <>
                    {guarantor.verification_status === 'PENDING' && onVerify && onReject && (
                      <>
                        <Tooltip content="Verify Guarantor">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onVerify(guarantor)}
                          >
                            Verify
                          </Button>
                        </Tooltip>
                        <Tooltip content="Reject Guarantor">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => onReject(guarantor)}
                          >
                            Reject
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip content="Edit Guarantor">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(guarantor)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete Guarantor">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => onDelete(guarantor)}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// export default GuarantorsList