// frontend/src/components/customers/GuarantorForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { FileUpload } from '@/components/shared/FileUpload'
import {
  GUARANTOR_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  ID_TYPE_OPTIONS
} from '@/types/customers'
import type { GuarantorCreateData } from '@/types/customers'

const guarantorSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+254\d{9}$/, 'Phone must be in format: +254XXXXXXXXX'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  physical_address: z.string().min(1, 'Physical address is required'),
  county: z.string().min(1, 'County is required'),
  id_type: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE']),
  id_number: z.string().min(1, 'ID number is required'),
  guarantor_type: z.enum(['PERSONAL', 'CORPORATE', 'INSTITUTIONAL']),
  relationship: z.enum(['SPOUSE', 'PARENT', 'SIBLING', 'FRIEND', 'COLLEAGUE', 'RELATIVE', 'OTHER']),
  occupation: z.string().min(1, 'Occupation is required'),
  employer: z.string().optional(),
  monthly_income: z.number().min(0, 'Income cannot be negative'),
  notes: z.string().optional()
})

interface GuarantorFormProps {
  initialData?: Partial<GuarantorCreateData>
  onSubmit: (data: GuarantorCreateData) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
  loading?: boolean
}

const GuarantorForm: React.FC<GuarantorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode,
  loading = false
}) => {
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue
  } = useForm<GuarantorCreateData>({
    resolver: zodResolver(guarantorSchema),
    defaultValues: initialData || {
      guarantor_type: 'PERSONAL',
      relationship: 'FRIEND',
      id_type: 'NATIONAL_ID',
      monthly_income: 0
    }
  })

  const handleFormSubmit = async (data: GuarantorCreateData) => {
    const formData = new FormData()
    
    // Append form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    
    // Append files
    if (idDocument) formData.append('id_document', idDocument)
    if (passportPhoto) formData.append('passport_photo', passportPhoto)
    
    await onSubmit(formData as any)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                {...register('first_name')}
                error={errors.first_name?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <Input
                {...register('middle_name')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <Input
                {...register('phone_number')}
                placeholder="+254712345678"
                error={errors.phone_number?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                {...register('email')}
                placeholder="guarantor@example.com"
                error={errors.email?.message}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Address *
              </label>
              <Input
                {...register('physical_address')}
                error={errors.physical_address?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County *
              </label>
              <Input
                {...register('county')}
                error={errors.county?.message}
              />
            </div>
          </div>
        </Card>

        {/* Guarantor Details */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Guarantor Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guarantor Type
              </label>
              <Select
                options={GUARANTOR_TYPE_OPTIONS}
                value={watch('guarantor_type')}
                onChange={(value) => setValue('guarantor_type', value as any)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <Select
                options={RELATIONSHIP_OPTIONS}
                value={watch('relationship')}
                onChange={(value) => setValue('relationship', value as any)}
                error={errors.relationship?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Income (KES) *
              </label>
              <Input
                type="number"
                {...register('monthly_income', { valueAsNumber: true })}
                error={errors.monthly_income?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation *
              </label>
              <Input
                {...register('occupation')}
                error={errors.occupation?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employer
              </label>
              <Input
                {...register('employer')}
              />
            </div>
          </div>
        </Card>

        {/* Identification */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Type
              </label>
              <Select
                options={ID_TYPE_OPTIONS}
                value={watch('id_type')}
                onChange={(value) => setValue('id_type', value as any)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number *
              </label>
              <Input
                {...register('id_number')}
                error={errors.id_number?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Document
              </label>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5 * 1024 * 1024}
                onFileSelect={setIdDocument}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passport Photo
              </label>
              <FileUpload
                accept=".jpg,.jpeg,.png"
                maxSize={3 * 1024 * 1024}
                onFileSelect={setPassportPhoto}
              />
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any additional notes about the guarantor..."
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
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
            disabled={loading || (mode === 'edit' && !isDirty)}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Add Guarantor' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default GuarantorForm