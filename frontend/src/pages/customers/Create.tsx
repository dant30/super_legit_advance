import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import CustomerForm from '@/components/customers/CustomerForm'
import Loading from '@/components/shared/Loading'

interface CreateCustomerForm {
  first_name: string
  last_name: string
  middle_name?: string
  date_of_birth: string
  gender: 'M' | 'F' | 'O'
  marital_status?: string
  id_type: string
  id_number: string
  id_expiry_date?: string
  nationality?: string
  phone_number: string
  email?: string
  postal_address?: string
  physical_address: string
  county: string
  sub_county: string
  ward?: string
  bank_name?: string
  bank_account_number?: string
  bank_branch?: string
  notes?: string
  referred_by?: string
}

export default function CreateCustomer() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const mutation = useMutation({
    mutationFn: (data: CreateCustomerForm) => customerAPI.createCustomer(data),
    onSuccess: (data) => {
      toast.success('Customer created successfully')
      navigate(`/customers/${data.id}`)
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to create customer'
      toast.error(errorMsg)
    },
  })

  const onSubmit = async (data: CreateCustomerForm) => {
    setIsLoading(true)
    try {
      const payload: CustomerCreateData = {
        ...data,
        marital_status: data.marital_status as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | undefined,
      }
      await mutation.mutateAsync(payload)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Add Customer | Super Legit Advance</title>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Customer</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Register a new customer in the system
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          {isLoading ? (
            <Loading size="sm" />
          ) : (
            <CustomerForm onSubmit={onSubmit} isLoading={mutation.isPending} />
          )}
        </Card>
      </div>
    </>
  )
}