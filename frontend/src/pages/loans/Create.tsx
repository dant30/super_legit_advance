import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { loansAPI } from '@/lib/api/loans'
import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Loading from '@/components/shared/Loading'

interface CreateLoanForm {
  customer_id: string
  loan_type: string
  amount_requested: number
  term_months: number
  purpose: string
  purpose_description?: string
}

export default function CreateLoan() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateLoanForm>()
  const [isLoading, setIsLoading] = useState(false)

  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerAPI.getCustomers({ page_size: 100 }),
  })

  const mutation = useMutation({
    mutationFn: (data: CreateLoanForm) => loansAPI.createLoan(data),
    onSuccess: (data) => {
      toast.success('Loan created successfully')
      navigate(`/loans/${data.id}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create loan')
    },
  })

  const onSubmit = async (formData: CreateLoanForm) => {
    try {
      const payload: LoanCreatePayload = {
        ...formData,
        customer: parseInt(formData.customer_id || '0'),
      }
      await mutation.mutateAsync(payload)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create loan')
    }
  }

  if (customersLoading) return <Loading />

  const customerList = customers?.results || []
  const amount = watch('amount_requested')
  const term = watch('term_months')

  return (
    <>
      <Helmet>
        <title>New Loan | Super Legit Advance</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/loans')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Loan
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Enter loan details and submit for approval
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Loan Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Customer *
                  </label>
                  <select
                    {...register('customer_id', { required: 'Customer is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Customer</option>
                    {customerList.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.customer_id && (
                    <p className="text-danger-500 text-sm mt-1">{errors.customer_id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Loan Type *
                  </label>
                  <select
                    {...register('loan_type', { required: 'Loan type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <option value="">Select Type</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="BUSINESS">Business</option>
                    <option value="SALARY">Salary Advance</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                  {errors.loan_type && (
                    <p className="text-danger-500 text-sm mt-1">{errors.loan_type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Amount Requested *"
                  type="number"
                  placeholder="50000"
                  {...register('amount_requested', { required: 'Amount is required' })}
                  error={errors.amount_requested?.message}
                />
                <Input
                  label="Term (Months) *"
                  type="number"
                  placeholder="12"
                  {...register('term_months', { required: 'Term is required' })}
                  error={errors.term_months?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Purpose *
                </label>
                <select
                  {...register('purpose', { required: 'Purpose is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select Purpose</option>
                  <option value="BUSINESS_EXPANSION">Business Expansion</option>
                  <option value="EDUCATION">Education</option>
                  <option value="HEALTHCARE">Healthcare</option>
                  <option value="PROPERTY">Property</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.purpose && (
                  <p className="text-danger-500 text-sm mt-1">{errors.purpose.message}</p>
                )}
              </div>

              <Input
                label="Purpose Description"
                placeholder="Provide more details..."
                {...register('purpose_description')}
              />
            </div>
          </Card>

          {/* Summary */}
          {amount && term && (
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Loan Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loan Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    KES {(amount / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Term</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {term} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment (est.)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    KES {(amount / term / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/loans')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}