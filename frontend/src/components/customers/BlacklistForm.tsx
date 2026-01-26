import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'

import { customerAPI } from '@/lib/api/customers'
import Button from '@/components/ui/Button'

interface BlacklistFormProps {
  customerId: string
  customerName: string
  onSuccess: () => void
}

export default function BlacklistForm({
  customerId,
  customerName,
  onSuccess,
}: BlacklistFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { reason: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: any) =>
      customerAPI.blacklistCustomer(customerId, data.reason),
    onSuccess: () => {
      toast.success('Customer blacklisted successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to blacklist customer')
    },
  })

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900 dark:text-red-100">
            Warning: This action is irreversible
          </p>
          <p className="text-sm text-red-800 dark:text-red-200 mt-1">
            Blacklisting will permanently restrict {customerName} from future loan applications
            and services.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Reason for Blacklisting *
        </label>
        <textarea
          {...register('reason', { required: 'Reason is required' })}
          placeholder="Provide a detailed reason for blacklisting..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          rows={4}
        />
        {errors.reason && (
          <p className="text-sm text-red-600 mt-1">{errors.reason.message as string}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="danger"
          className="flex-1"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Blacklisting...' : 'Confirm Blacklist'}
        </Button>
      </div>
    </form>
  )
}