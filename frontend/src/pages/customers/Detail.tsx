import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  CreditCard,
  DollarSign,
  AlertCircle,
  FileText,
  Users,
  Briefcase,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { getStatusColor, getRiskLevelColor, calculateAge, formatPhoneNumber } from '@/types/customers'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerAPI.getCustomer(id!),
    enabled: !!id,
  })

  if (isLoading) return <Loading />
  if (error || !customer) return <EmptyState title="Customer not found" />

  const statusColor = getStatusColor(customer.status)
  const riskColor = getRiskLevelColor(customer.risk_level)

  return (
    <>
      <Helmet>
        <title>
          {customer.first_name} {customer.last_name} | Super Legit Advance
        </title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/customers')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {customer.full_name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {customer.customer_number}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/${id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {customer.status}
                </p>
              </div>
              <Badge variant={statusColor as any}>{customer.status}</Badge>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Risk Level</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {customer.risk_level}
              </p>
              <Badge variant={riskColor as any} className="mt-2">
                {customer.risk_level}
              </Badge>
            </div>
          </Card>

          <Card className="p-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Credit Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {customer.credit_score}
              </p>
            </div>
          </Card>
        </div>

        {/* Personal Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-white font-medium">{customer.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatPhoneNumber(customer.phone_number)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {customer.date_of_birth} ({calculateAge(customer.date_of_birth)} years)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {customer.gender === 'M' ? 'Male' : customer.gender === 'F' ? 'Female' : 'Other'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID Type</p>
              <p className="text-gray-900 dark:text-white font-medium">{customer.id_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID Number</p>
              <p className="text-gray-900 dark:text-white font-medium">{customer.id_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Marital Status</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {customer.marital_status || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nationality</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {customer.nationality || '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Physical Address</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {customer.physical_address}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Postal Address</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {customer.postal_address || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">County</p>
              <p className="text-gray-900 dark:text-white font-medium">{customer.county}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sub County</p>
              <p className="text-gray-900 dark:text-white font-medium">{customer.sub_county}</p>
            </div>
          </div>
        </Card>

        {/* Loan Statistics */}
        {customer.loan_statistics && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Loan Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customer.loan_statistics.total_loans}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customer.loan_statistics.active_loans}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Borrowed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  KES {(customer.loan_statistics.total_borrowed / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
                <p className="text-2xl font-bold text-warning-500">
                  KES {(customer.loan_statistics.total_outstanding / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/${id}/guarantors`)}
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Guarantors
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/${id}/employment`)}
              className="justify-start"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Employment Info
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/customers/${id}/documents`)}
              className="justify-start"
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
          </div>
        </Card>

        {/* Actions Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Customer Actions"
        >
          <div className="space-y-3">
            <button
              onClick={() => {
                navigate(`/customers/blacklisted?id=${id}`)
                setShowModal(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
            >
              Blacklist Customer
            </button>
          </div>
        </Modal>
      </div>
    </>
  )
}