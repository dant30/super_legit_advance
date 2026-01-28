import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  GENDER_OPTIONS,
  ID_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  CustomerFormData,
} from '@/types/customers'

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void
  isLoading?: boolean
  initialData?: any
}

export default function CustomerForm({ onSubmit, isLoading = false, initialData }: CustomerFormProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CustomerFormData>({
    defaultValues: initialData || {},
  })
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    { number: 1, title: 'Personal Info', fields: ['first_name', 'last_name', 'date_of_birth', 'gender'] },
    { number: 2, title: 'Identification', fields: ['id_type', 'id_number', 'id_expiry_date'] },
    { number: 3, title: 'Contact', fields: ['phone_number', 'email'] },
    { number: 4, title: 'Address', fields: ['physical_address', 'postal_address', 'county', 'sub_county'] },
    { number: 5, title: 'Banking', fields: ['bank_name', 'bank_account_number', 'bank_branch'] },
    { number: 6, title: 'Review', fields: ['notes'] },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Personal Information</h2>
          
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
                Date of Birth *
              </label>
              <Input
                {...register('date_of_birth', { required: 'Date of birth is required' })}
                type="date"
                error={errors.date_of_birth?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Gender
              </label>
              <select
                {...register('gender')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Marital Status
              </label>
              <select
                {...register('marital_status')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select marital status</option>
                {MARITAL_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Identification */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Identification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                ID Expiry Date
              </label>
              <Input
                {...register('id_expiry_date')}
                type="date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Nationality
              </label>
              <Input
                {...register('nationality')}
                placeholder="Nationality"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Contact */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Phone Number *
              </label>
              <Input
                {...register('phone_number', { required: 'Phone number is required' })}
                placeholder="Phone number"
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
                placeholder="Email"
                error={errors.email?.message}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Address */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Address Information</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
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
                Postal Address
              </label>
              <Input
                {...register('postal_address')}
                placeholder="Postal address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Sub County *
                </label>
                <Input
                  {...register('sub_county', { required: 'Sub county is required' })}
                  placeholder="Sub county"
                  error={errors.sub_county?.message}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Ward
              </label>
              <Input
                {...register('ward')}
                placeholder="Ward"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Banking */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Banking Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Bank Name
              </label>
              <Input
                {...register('bank_name')}
                placeholder="Bank name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Account Number
              </label>
              <Input
                {...register('bank_account_number')}
                placeholder="Account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Branch
              </label>
              <Input
                {...register('bank_branch')}
                placeholder="Bank branch"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {currentStep === 6 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Additional Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1"
          >
            Previous
          </Button>
        )}
        
        {currentStep < steps.length ? (
          <Button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="flex-1"
          >
            Next
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Customer'}
          </Button>
        )}
      </div>
    </form>
  )
}