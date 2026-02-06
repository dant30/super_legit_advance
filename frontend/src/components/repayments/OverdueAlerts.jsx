// frontend/src/components/repayments/OverdueAlerts.jsx
import React from 'react'
import Badge from '@components/ui/Badge'
import Button from '@components/ui/Button'
import { Card, CardHeader, CardContent } from '@components/ui/Card'

const OverdueAlerts = ({ items = [], onView }) => {
  return (
    <Card>
      <CardHeader title="Overdue Repayments" description="Items past due date" />
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No overdue repayments.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-slate-700 p-3">
                <div>
                  <p className="text-sm font-medium">{item.repayment_number}</p>
                  <p className="text-xs text-gray-500">
                    {item?.customer?.full_name || 'Customer'} · Due {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="danger">Overdue</Badge>
                  {onView && (
                    <Button size="xs" variant="outline" onClick={() => onView(item)}>
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OverdueAlerts
