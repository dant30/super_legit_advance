// frontend/src/pages/customers/Activity.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/shared/Loading'
import { Error } from '@/components/shared/Error'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Pagination } from '@/components/shared/Pagination'
import { useToast } from '@/components/ui/Toast/useToast'

interface ActivityItem {
  id: string
  timestamp: string
  action: string
  user: {
    id: string
    name: string
    email?: string
  }
  details: string
  changes?: Record<string, { old: any; new: any }>
  ip_address?: string
  user_agent?: string
}

const ActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { selectedCustomer, selectedCustomerLoading, selectedCustomerError, fetchCustomer } = useCustomers()

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (id) {
      loadCustomer()
      loadActivities()
    }
  }, [id, page])

  const loadCustomer = async () => {
    try {
      await fetchCustomer(id!)
    } catch (error) {
      console.error('Failed to load customer:', error)
    }
  }

  const loadActivities = async () => {
    setLoading(true)
    try {
      // In a real app, you would fetch from an API endpoint
      // This is mock data for demonstration
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'UPDATE',
          user: { id: '1', name: 'Admin User', email: 'admin@example.com' },
          details: 'Updated customer profile information',
          changes: {
            phone_number: { old: '+254700000000', new: '+254711111111' },
            email: { old: 'old@example.com', new: 'new@example.com' }
          },
          ip_address: '192.168.1.1'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          action: 'CREATE',
          user: { id: '2', name: 'Staff User' },
          details: 'Created new customer',
          ip_address: '192.168.1.2'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          action: 'DOCUMENT_UPLOAD',
          user: { id: '1', name: 'Admin User' },
          details: 'Uploaded ID document',
          ip_address: '192.168.1.1'
        }
      ]
      
      setActivities(mockActivities)
      setTotalPages(1)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load activity log',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800'
      case 'UPDATE': return 'bg-blue-100 text-blue-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'DOCUMENT_UPLOAD': return 'bg-purple-100 text-purple-800'
      case 'BLACKLIST': return 'bg-red-100 text-red-800'
      case 'ACTIVATE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: 'Created',
      UPDATE: 'Updated',
      DELETE: 'Deleted',
      DOCUMENT_UPLOAD: 'Document Upload',
      BLACKLIST: 'Blacklisted',
      ACTIVATE: 'Activated',
      VERIFY: 'Verified',
      REJECT: 'Rejected'
    }
    return labels[action] || action
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Customers', href: '/customers' },
    { label: selectedCustomer?.full_name || 'Customer', href: `/customers/${id}` },
    { label: 'Activity Log', href: '#' }
  ]

  if (selectedCustomerLoading) {
    return <Loading message="Loading customer information..." />
  }

  if (selectedCustomerError || !selectedCustomer) {
    return (
      <Error
        message={selectedCustomerError || 'Customer not found'}
        onRetry={loadCustomer}
        actionText="Back to Customer"
        onAction={() => navigate(`/customers/${id}`)}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
        <div className="flex justify-between items-center mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-600 mt-2">
              View all activities for {selectedCustomer.full_name}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/customers/${id}`)}
          >
            Back to Customer
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-6">
          {loading ? (
            <Loading message="Loading activities..." />
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-500">
                There are no activities recorded for this customer yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <Badge className={getActionColor(activity.action)}>
                        {getActionLabel(activity.action)}
                      </Badge>
                      <div>
                        <p className="font-medium">{activity.details}</p>
                        <p className="text-sm text-gray-500">
                          by {activity.user.name} • {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {activity.ip_address && (
                      <div className="text-sm text-gray-500">
                        IP: {activity.ip_address}
                      </div>
                    )}
                  </div>

                  {activity.changes && Object.keys(activity.changes).length > 0 && (
                    <div className="mt-3 ml-6">
                      <div className="text-sm font-medium text-gray-700 mb-2">Changes:</div>
                      <div className="space-y-2">
                        {Object.entries(activity.changes).map(([field, values]) => (
                          <div key={field} className="flex items-center space-x-4 text-sm">
                            <div className="w-32 font-medium text-gray-600">{field}</div>
                            <div className="flex items-center space-x-2">
                              <div className="px-2 py-1 bg-red-50 text-red-700 rounded">
                                {String(values.old)}
                              </div>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <div className="px-2 py-1 bg-green-50 text-green-700 rounded">
                                {String(values.new)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activity.user_agent && (
                    <div className="mt-2 ml-6 text-xs text-gray-500">
                      User Agent: {activity.user_agent}
                    </div>
                  )}
                </div>
              ))}

              {totalPages > 1 && (
                <div className="mt-6 pt-6 border-t">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ActivityPage