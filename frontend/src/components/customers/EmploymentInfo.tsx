import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EMPLOYMENT_TYPE_OPTIONS, EmploymentFormData } from '@/types/customers'

interface EmploymentInfoProps {
  customerId: string
  employment?: any
  onSuccess: () => void
}

export default function EmploymentInfo({
  customerId,
  employment,
  onSuccess,
}: EmploymentInfoProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<EmploymentFormData>({
    defaultValues: employment || {},
  })

  const employmentType = watch('employment_type')

  const mutation = useMutation({
    mutationFn: (data: EmploymentFormData) =>
      customerAPI.updateEmployment(customerId, data),
    onSuccess: () => {
      toast.success('Employment information updated successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update employment')
    },
  })

  const onSubmit = (data: EmploymentFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Employment Type *
          </label>
          <select
            {...register('employment_type', { required: 'Employment type is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select employment type</option>
            {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.employment_type && (
            <p className="text-sm text-red-600">{errors.employment_type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Sector *
          </label>
          <Input
            {...register('sector', { required: 'Sector is required' })}
            placeholder="Sector"
            error={errors.sector?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Occupation *
          </label>
          <Input
            {...register('occupation', { required: 'Occupation is required' })}
            placeholder="Occupation"
            error={errors.occupation?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Monthly Income *
          </label>
          <Input
            {...register('monthly_income', { required: 'Monthly income is required' })}
            type="number"
            placeholder="Monthly income"
            error={errors.monthly_income?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Other Income
          </label>
          <Input
            {...register('other_income')}
            type="number"
            placeholder="Other income"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Payment Frequency *
          </label>
          <select
            {...register('payment_frequency', { required: 'Payment frequency is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select frequency</option>
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="DAILY">Daily</option>
          </select>
          {errors.payment_frequency && (
            <p className="text-sm text-red-600">{errors.payment_frequency.message}</p>
          )}
        </div>
      </div>

      {employmentType === 'EMPLOYED' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Employer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Employer Name
              </label>
              <Input
                {...register('employer_name')}
                placeholder="Employer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Job Title
              </label>
              <Input
                {...register('job_title')}
                placeholder="Job title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Department
              </label>
              <Input
                {...register('department')}
                placeholder="Department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Employee Number
              </label>
              <Input
                {...register('employee_number')}
                placeholder="Employee number"
              />
            </div>
          </div>
        </div>
      )}

      {employmentType === 'SELF_EMPLOYED' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Business Name
              </label>
              <Input
                {...register('business_name')}
                placeholder="Business name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Business Type
              </label>
              <Input
                {...register('business_type')}
                placeholder="Business type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Business Registration
              </label>
              <Input
                {...register('business_registration')}
                placeholder="Registration number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Number of Employees
              </label>
              <Input
                {...register('number_of_employees')}
                type="number"
                placeholder="Number of employees"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : 'Save Information'}
        </Button>
      </div>
    </form>
  )
}