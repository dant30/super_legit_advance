// frontend/src/pages/customers/Blacklist.tsx
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
//import { Input } from '@/components/ui/Input'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
//import Badge from '@/components/ui/Badge'
import Pagination from '@/components/shared/Pagination'

export default function CustomerBlacklist() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [blacklistReason, setBlacklistReason] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    searchParams.get('id')
  )
  const [showConfirm, setShowConfirm] = useState(!!selectedCustomerId)

  const { data: blacklistedData, isLoading: loadingBlacklisted } = useQuery({
    queryKey: ['customers', { page, status: 'BLACKLISTED' }],
    queryFn: () =>
      customerAPI.getCustomers({ page, page_size: 20, status: 'BLACKLISTED' }),
  })

  const { data: selectedCustomer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: () => customerAPI.getCustomer(selectedCustomerId!),
    enabled: !!selectedCustomerId,
  })

  const handleBlacklist = async () => {
    if (!selectedCustomerId || !blacklistReason.trim()) {
      toast.error('Please provide a reason for blacklisting')
      return
    }

    try {
      await customerAPI.blacklistCustomer(selectedCustomerId, blacklistReason)
      toast.success('Customer blacklisted successfully')
      setShowConfirm(false)
      setSelectedCustomerId(null)
      setBlacklistReason('')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to blacklist customer')
    }
  }

  if (loadingBlacklisted) return <Loading />

  const blacklistedCustomers = blacklistedData?.results || []

  return (
    <>
      <Helmet>
        <title>Blacklisted Customers | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Blacklisted Customers
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage customers on the blacklist
            </p>
          </div>
        </div>

        {/* Blacklisted Customers Table */}
        {blacklistedCustomers.length > 0 ? (
          <>
            <Card>
              <Table
                columns={[
                  { key: 'customer_number', label: 'ID' },
                  { key: 'full_name', label: 'Name' },
                  { key: 'phone_number', label: 'Phone' },
                  { key: 'email', label: 'Email' },
                  { key: 'actions', label: '' },
                ]}
                data={blacklistedCustomers.map((customer: any) => ({
                  customer_number: customer.customer_number,
                  full_name: customer.full_name,
                  phone_number: customer.phone_number,
                  email: customer.email || '-',
                  actions: (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      View
                    </Button>
                  ),
                }))}
              />
            </Card>

            {blacklistedData && blacklistedData.count > 0 && (
              <Pagination
                currentPage={page}
                pageSize={20}
                totalItems={blacklistedData.count}
                onPageChange={setPage}
              />
            )}
          </>
        ) : (
          <EmptyState title="No blacklisted customers" description="There are no blacklisted customers at the moment" />
        )}

        {/* Blacklist Confirmation Modal */}
        <Modal
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false)
            setSelectedCustomerId(null)
            setBlacklistReason('')
          }}
          title="Blacklist Customer"
        >
          {loadingCustomer ? (
            <Loading size="sm" />
          ) : selectedCustomer ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Warning: Irreversible Action
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Blacklisting will restrict this customer from future loan applications.
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedCustomer.full_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedCustomer.customer_number}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Reason for Blacklisting *
                </label>
                <textarea
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  placeholder="Enter reason for blacklisting..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirm(false)
                    setSelectedCustomerId(null)
                    setBlacklistReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleBlacklist}
                  disabled={!blacklistReason.trim()}
                >
                  Blacklist
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </>
  )
}