// frontend/src/components/customers/EmploymentForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import {
  EMPLOYMENT_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  PAYMENT_FREQUENCY_OPTIONS
} from '@/types/customers'
import type { EmploymentCreateData } from '@/types/customers'

export const employmentSchema = z.object({
  employment_type: z.enum(['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED']),
  sector: z.string().min(1, 'Sector is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  
  // Employer details
  employer_name: z.string().optional(),
  employer_address: z.string().optional(),
  employer_phone: z.string().optional(),
  employer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  job_title: z.string().optional(),
  department: z.string().optional(),
  employee_number: z.string().optional(),
  date_employed: z.string().optional(),
  
  // Business details
  business_name: z.string().optional(),
  business_type: z.string().optional(),
  business_registration: z.string().optional(),
  business_start_date: z.string().optional(),
  number_of_employees: z.number().min(0).optional(),
  
  // Income
  monthly_income: z.number().min(0, 'Income cannot be negative'),
  other_income: z.number().min(0, 'Income cannot be negative'),
  payment_frequency: z.string().default('MONTHLY'),
  next_pay_date: z.string().optional(),
  
  // Notes
  notes: z.string().optional()
}).refine(
  (data) => {
    if (data.employment_type === 'EMPLOYED' && !data.employer_name) {
      return false
    }
    if (data.employment_type === 'SELF_EMPLOYED' && !data.business_name) {
      return false
    }
    return true
  },
  {
    message: 'Employer/Business name is required for employed/self-employed',
    path: ['employment_type']
  }
)

interface EmploymentFormProps {
  initialData: EmploymentCreateData
  onSubmit: (data: EmploymentCreateData) => Promise<void>
  onCancel: () => void
}

export const EmploymentForm: React.FC<EmploymentFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue
  } = useForm<EmploymentCreateData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: initialData
  })

  const employmentType = watch('employment_type')

  const handleFormSubmit = async (data: EmploymentCreateData) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    {
      id: 'basic',
      label: 'Basic Info',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type *
            </label>
            <Select
              options={EMPLOYMENT_TYPE_OPTIONS}
              value={employmentType}
              onChange={(value) => setValue('employment_type', value as any)}
              error={errors.employment_type?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector *
            </label>
            <Select
              options={SECTOR_OPTIONS}
              value={watch('sector') || ''}
              onChange={(value) => setValue('sector', value)}
              error={errors.sector?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation *
            </label>
            <Input
              {...register('occupation')}
              placeholder="e.g., Software Developer, Farmer, Teacher"
              error={errors.occupation?.message}
            />
          </div>
        </div>
      )
    },
    {
      id: 'income',
      label: 'Income Details',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Income (KES) *
              </label>
              <Input
                type="number"
                {...register('monthly_income', { valueAsNumber: true })}
                placeholder="50000"
                error={errors.monthly_income?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Income (KES)
              </label>
              <Input
                type="number"
                {...register('other_income', { valueAsNumber: true })}
                placeholder="10000"
                error={errors.other_income?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Frequency
              </label>
              <Select
                options={PAYMENT_FREQUENCY_OPTIONS}
                value={watch('payment_frequency') || 'MONTHLY'}
                onChange={(value) => setValue('payment_frequency', value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Pay Date
              </label>
              <Input
                type="date"
                {...register('next_pay_date')}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: employmentType === 'EMPLOYED' ? 'employer' : 'business',
      label: employmentType === 'EMPLOYED' ? 'Employer Details' : 'Business Details',
      content: employmentType === 'EMPLOYED' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Name *
            </label>
            <Input
              {...register('employer_name')}
              placeholder="Company Name"
              error={errors.employer_name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Address
            </label>
            <Input
              {...register('employer_address')}
              placeholder="Company Address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <Input
                {...register('job_title')}
                placeholder="e.g., Senior Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <Input
                {...register('department')}
                placeholder="e.g., IT Department"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Number
              </label>
              <Input
                {...register('employee_number')}
                placeholder="EMP001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Employed
              </label>
              <Input
                type="date"
                {...register('date_employed')}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <Input
              {...register('business_name')}
              placeholder="Business Name"
              error={errors.business_name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            <Input
              {...register('business_type')}
              placeholder="e.g., Retail, Manufacturing"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <Input
                {...register('business_registration')}
                placeholder="Business Registration No."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Employees
              </label>
              <Input
                type="number"
                {...register('number_of_employees', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Start Date
            </label>
            <Input
              type="date"
              {...register('business_start_date')}
            />
          </div>
        </div>
      )
    },
    {
      id: 'notes',
      label: 'Notes',
      content: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            {...register('notes')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Any additional notes about employment..."
          />
        </div>
      )
    }
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Card className="p-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !isDirty}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </form>
  )
}

// export default EmploymentForm