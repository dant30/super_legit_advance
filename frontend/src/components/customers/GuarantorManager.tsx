import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerAPI } from '@/lib/api/customers'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  GUARANTOR_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  ID_TYPE_OPTIONS,
  GuarantorFormData,
} from '@/types/customers'

interface GuarantorManagerProps {
  customerId: string
  onClose: () => void
  onSuccess: () => void
}

export default function GuarantorManager({
  customerId,
  onClose,
  onSuccess,
}: GuarantorManagerProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<GuarantorFormData>()

  const mutation = useMutation({
    mutationFn: (data: GuarantorFormData) =>
      customerAPI.createGuarantor(customerId, data),
    onSuccess: () => {
      toast.success('Guarantor added successfully')
      onSuccess()
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add guarantor')
    },
  })

  const onSubmit = (data: GuarantorFormData) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            First Name *
          </label>
          <Input
            {...register('first_name', { required: 'First name is required' })}
            placeholder="First name"
            error={errors.first_name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Last Name *
          </label>
          <Input
            {...register('last_name', { required: 'Last name is required' })}
            placeholder="Last name"
            error={errors.last_name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Phone Number *
          </label>
          <Input
            {...register('phone_number', { required: 'Phone number is required' })}
            placeholder="+254..."
            error={errors.phone_number?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Email
          </label>
          <Input
            {...register('email')}
            type="email"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Guarantor Type *
          </label>
          <select
            {...register('guarantor_type', { required: 'Guarantor type is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select type</option>
            {GUARANTOR_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.guarantor_type && (
            <p className="text-sm text-red-600">{errors.guarantor_type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Relationship *
          </label>
          <select
            {...register('relationship', { required: 'Relationship is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select relationship</option>
            {RELATIONSHIP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p className="text-sm text-red-600">{errors.relationship.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            ID Type *
          </label>
          <select
            {...register('id_type', { required: 'ID type is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select ID type</option>
            {ID_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.id_type && (
            <p className="text-sm text-red-600">{errors.id_type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            ID Number *
          </label>
          <Input
            {...register('id_number', { required: 'ID number is required' })}
            placeholder="ID number"
            error={errors.id_number?.message}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            Physical Address *
          </label>
          <Input
            {...register('physical_address', { required: 'Physical address is required' })}
            placeholder="Physical address"
            error={errors.physical_address?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
            County *
          </label>
          <Input
            {...register('county', { required: 'County is required' })}
            placeholder="County"
            error={errors.county?.message}
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
            Employer
          </label>
          <Input
            {...register('employer')}
            placeholder="Employer name"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Adding...' : 'Add Guarantor'}
        </Button>
      </div>
    </form>
  )
}