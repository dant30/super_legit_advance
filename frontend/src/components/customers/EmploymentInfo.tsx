import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmploymentFormData } from '@/types/customers'

// Define employment type options here since they're missing
const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'RETIRED', label: 'Retired' },
]

interface EmploymentInfoProps {
  customerId: string
  employment?: any
  onSuccess?: () => void
}

export default function EmploymentInfo({
  customerId,
  employment,
  onSuccess,
}: EmploymentInfoProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EmploymentFormData>({
    defaultValues: employment,
  })

  const mutation = useMutation({
    mutationFn: (data: Partial<EmploymentFormData>) =>
      customerAPI.updateEmployment(customerId, data),
    onSuccess: () => {
      toast.success('Employment information updated successfully')
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update employment information')
    },
  })

  const onSubmit = (data: EmploymentFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save Employment Info'}
      </Button>
    </form>
  )
}