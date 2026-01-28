import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getStatusColor, getRiskLevelColor, formatPhoneNumber } from '@/types/customers'

interface CustomerCardProps {
  customer: any
  onSelect?: (customer: any) => void
}

export default function CustomerCard({ customer, onSelect }: CustomerCardProps) {
  const navigate = useNavigate()

  const statusColor = getStatusColor(customer.status)
  const riskColor = getRiskLevelColor(customer.risk_level)

  return (
    <Card className="p-4 hover:shadow-lg transition">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {customer.full_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.customer_number}</p>
          </div>
          <Badge variant={statusColor as any}>{customer.status}</Badge>
        </div>

        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Phone</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatPhoneNumber(customer.phone_number)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Credit Score</p>
            <p className="text-gray-900 dark:text-white font-medium">{customer.credit_score}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Risk Level</p>
            <Badge variant={riskColor as any} className="mt-1">
              {customer.risk_level}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(`/customers/${customer.id}`)}
          >
            View
          </Button>
          {onSelect && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onSelect(customer)}
            >
              Select
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}